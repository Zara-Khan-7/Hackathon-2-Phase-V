"""
Task completed event handler with recurring task generation.

US4: Processes task.completed events and creates next occurrence
for recurring tasks via Dapr service invocation.
"""

import logging
import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime, timedelta
import re

import httpx

logger = logging.getLogger(__name__)

# Dapr configuration
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_STATE_STORE = os.getenv("DAPR_STATE_STORE", "statestore")
CHAT_API_APP_ID = os.getenv("CHAT_API_APP_ID", "chat-api")


@dataclass
class TaskCompletedPayload:
    """Task completed event payload from Pub/Sub."""
    event_id: str
    event_type: str
    timestamp: str
    user_id: str
    task_id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[str]
    tags: List[str]
    reminder_offset_minutes: Optional[int]
    is_recurring: bool
    recurrence_rule: Optional[str]
    parent_task_id: Optional[str]


class IdempotencyChecker:
    """Idempotency checker using Dapr state store."""

    def __init__(
        self,
        store_name: str = DAPR_STATE_STORE,
        dapr_port: str = DAPR_HTTP_PORT,
        ttl_seconds: int = 86400,
    ):
        self.store_name = store_name
        self.base_url = f"http://localhost:{dapr_port}"
        self.ttl_seconds = ttl_seconds
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    def _key(self, event_id: str) -> str:
        return f"recurring-processed:{event_id}"

    async def is_processed(self, event_id: str) -> bool:
        key = self._key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.store_name}/{key}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                return response.status_code == 200 and response.text
        except httpx.RequestError as e:
            logger.warning("[IDEMPOTENCY_CHECK_ERROR] key=%s error=%s", key, str(e))
            return False

    async def mark_processed(self, event_id: str, metadata: Optional[Dict] = None) -> bool:
        key = self._key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.store_name}"

        state_entry = [{
            "key": key,
            "value": {
                "event_id": event_id,
                "processed_at": metadata.get("processed_at") if metadata else None,
                "next_task_id": metadata.get("next_task_id") if metadata else None,
            },
            "metadata": {"ttlInSeconds": str(self.ttl_seconds)},
        }]

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=state_entry)
                return response.status_code in (200, 201, 204)
        except httpx.RequestError as e:
            logger.error("[IDEMPOTENCY_MARK_ERROR] key=%s error=%s", key, str(e))
            return False


# Global idempotency checker
idempotency_checker = IdempotencyChecker()


def calculate_next_due_date(
    current_due_date: Optional[str],
    recurrence_rule: Optional[str],
) -> Optional[datetime]:
    """
    Calculate next due date based on recurrence rule.

    T050: Supports rules like:
    - daily
    - weekly
    - monthly
    - every_N_days (e.g., every_3_days)
    - every_N_weeks (e.g., every_2_weeks)

    Args:
        current_due_date: ISO format date string
        recurrence_rule: Recurrence pattern string

    Returns:
        Next due date as datetime, or None if cannot calculate
    """
    if not current_due_date or not recurrence_rule:
        return None

    # Parse current due date
    try:
        if current_due_date.endswith("Z"):
            current_due_date = current_due_date[:-1] + "+00:00"
        current = datetime.fromisoformat(current_due_date)
    except ValueError:
        logger.error("[PARSE_ERROR] Invalid due_date format: %s", current_due_date)
        return None

    rule = recurrence_rule.lower().strip()

    # Daily
    if rule == "daily":
        return current + timedelta(days=1)

    # Weekly
    if rule == "weekly":
        return current + timedelta(weeks=1)

    # Monthly (approximate - add 30 days)
    if rule == "monthly":
        return current + timedelta(days=30)

    # every_N_days pattern
    match = re.match(r"every_(\d+)_days?", rule)
    if match:
        days = int(match.group(1))
        return current + timedelta(days=days)

    # every_N_weeks pattern
    match = re.match(r"every_(\d+)_weeks?", rule)
    if match:
        weeks = int(match.group(1))
        return current + timedelta(weeks=weeks)

    logger.warning("[UNKNOWN_RULE] Unrecognized recurrence_rule: %s", recurrence_rule)
    return None


async def create_task_via_dapr(
    user_id: str,
    task_data: Dict[str, Any],
    auth_token: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Create a task via Dapr service invocation to chat-api.

    T051: Uses Dapr service invocation for cross-service communication.

    Args:
        user_id: User ID for the task
        task_data: Task creation payload
        auth_token: Optional JWT token (not needed for internal calls)

    Returns:
        Created task response or None on error
    """
    url = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/invoke/{CHAT_API_APP_ID}/method/api/tasks"

    headers = {
        "Content-Type": "application/json",
        # For internal service calls, we pass user_id in a header
        # that the chat-api can trust (from within the cluster)
        "X-User-Id": user_id,
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
            response = await client.post(url, json=task_data, headers=headers)

            if response.status_code in (200, 201):
                result = response.json()
                logger.info(
                    "[TASK_CREATED] new_task_id=%s title=%s",
                    result.get("id"),
                    result.get("title"),
                )
                return result
            else:
                logger.error(
                    "[TASK_CREATE_FAILED] status=%d body=%s",
                    response.status_code,
                    response.text,
                )
                return None

    except httpx.RequestError as e:
        logger.error("[TASK_CREATE_ERROR] error=%s", str(e))
        return None


async def handle_task_completed_event(payload: TaskCompletedPayload) -> Dict[str, Any]:
    """
    Handle a task.completed event with recurring task generation.

    US4: If the completed task is recurring, create the next occurrence.

    Args:
        payload: The task completed event payload

    Returns:
        Processing result dict
    """
    event_id = payload.event_id

    # T052: Check idempotency
    if await idempotency_checker.is_processed(event_id):
        logger.info(
            "[TASK_COMPLETED_DUPLICATE] event_id=%s already processed",
            event_id,
        )
        return {
            "status": "duplicate",
            "event_id": event_id,
            "message": "Event already processed",
        }

    # T049: Check if task is recurring
    if not payload.is_recurring:
        logger.info(
            "[TASK_NOT_RECURRING] task_id=%s - no next occurrence needed",
            payload.task_id,
        )
        # Mark as processed even for non-recurring tasks
        await idempotency_checker.mark_processed(
            event_id,
            {"processed_at": datetime.utcnow().isoformat() + "Z"},
        )
        return {
            "status": "success",
            "event_id": event_id,
            "task_id": payload.task_id,
            "message": "Task is not recurring, no action needed",
            "next_task_created": False,
        }

    # T050: Calculate next due date
    next_due_date = calculate_next_due_date(
        payload.due_date,
        payload.recurrence_rule,
    )

    if not next_due_date:
        logger.warning(
            "[RECURRING_NO_NEXT_DATE] task_id=%s rule=%s - cannot calculate next date",
            payload.task_id,
            payload.recurrence_rule,
        )
        await idempotency_checker.mark_processed(
            event_id,
            {"processed_at": datetime.utcnow().isoformat() + "Z"},
        )
        return {
            "status": "success",
            "event_id": event_id,
            "task_id": payload.task_id,
            "message": "Could not calculate next due date",
            "next_task_created": False,
        }

    # T051: Create next task occurrence via Dapr service invocation
    next_task_data = {
        "title": payload.title,
        "description": payload.description,
        "priority": payload.priority,
        "due_date": next_due_date.isoformat() + "Z",
        "tags": payload.tags,
        "reminder_offset_minutes": payload.reminder_offset_minutes,
        "is_recurring": True,
        "recurrence_rule": payload.recurrence_rule,
    }

    logger.info(
        "[RECURRING_CREATE_NEXT] task_id=%s next_due_date=%s rule=%s",
        payload.task_id,
        next_due_date.isoformat(),
        payload.recurrence_rule,
    )

    next_task = await create_task_via_dapr(
        user_id=payload.user_id,
        task_data=next_task_data,
    )

    # Mark as processed
    await idempotency_checker.mark_processed(
        event_id,
        {
            "processed_at": datetime.utcnow().isoformat() + "Z",
            "next_task_id": next_task.get("id") if next_task else None,
        },
    )

    if next_task:
        logger.info(
            "[RECURRING_NEXT_CREATED] original_task_id=%s next_task_id=%s",
            payload.task_id,
            next_task.get("id"),
        )
        return {
            "status": "success",
            "event_id": event_id,
            "task_id": payload.task_id,
            "message": "Next recurring task created",
            "next_task_created": True,
            "next_task_id": next_task.get("id"),
            "next_due_date": next_due_date.isoformat() + "Z",
        }
    else:
        logger.error(
            "[RECURRING_CREATE_FAILED] task_id=%s - failed to create next occurrence",
            payload.task_id,
        )
        return {
            "status": "error",
            "event_id": event_id,
            "task_id": payload.task_id,
            "message": "Failed to create next recurring task",
            "next_task_created": False,
        }
