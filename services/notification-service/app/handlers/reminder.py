"""
Reminder event handler with idempotency.

US3: Processes reminder events and logs notification details.
Future: Will integrate with actual notification providers.
"""

import logging
import os
from typing import Dict, Any, Optional
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

# Dapr configuration
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_STATE_STORE = os.getenv("DAPR_STATE_STORE", "statestore")


@dataclass
class ReminderEventPayload:
    """Reminder event payload from Pub/Sub."""
    event_id: str
    event_type: str
    timestamp: str
    user_id: str
    task_id: str
    task_title: str
    due_at: Optional[str]
    remind_at: str


class IdempotencyChecker:
    """
    Idempotency checker using Dapr state store.

    Prevents duplicate processing of events using event_id.
    """

    def __init__(
        self,
        store_name: str = DAPR_STATE_STORE,
        dapr_port: str = DAPR_HTTP_PORT,
        ttl_seconds: int = 86400,  # 24 hours
    ):
        self.store_name = store_name
        self.base_url = f"http://localhost:{dapr_port}"
        self.ttl_seconds = ttl_seconds
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    def _key(self, event_id: str) -> str:
        """Build state key for event."""
        return f"notification-processed:{event_id}"

    async def is_processed(self, event_id: str) -> bool:
        """Check if event has already been processed."""
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
        """Mark event as processed."""
        key = self._key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.store_name}"

        state_entry = [{
            "key": key,
            "value": {
                "event_id": event_id,
                "processed_at": metadata.get("processed_at") if metadata else None,
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


# Global idempotency checker instance
idempotency_checker = IdempotencyChecker()


async def handle_reminder_event(payload: ReminderEventPayload) -> Dict[str, Any]:
    """
    Handle a reminder event with idempotency.

    US3: Logs notification details (stubbed for future implementation).

    Args:
        payload: The reminder event payload

    Returns:
        Processing result dict
    """
    event_id = payload.event_id

    # Check idempotency (T041)
    if await idempotency_checker.is_processed(event_id):
        logger.info(
            "[REMINDER_DUPLICATE] event_id=%s already processed",
            event_id,
        )
        return {
            "status": "duplicate",
            "event_id": event_id,
            "message": "Event already processed",
        }

    # Process the reminder (T044 - Structured logging)
    logger.info(
        "[NOTIFICATION_STUB] Would send notification: "
        "user_id=%s task_id=%s title='%s' due_at=%s remind_at=%s event_type=%s",
        payload.user_id,
        payload.task_id,
        payload.task_title,
        payload.due_at,
        payload.remind_at,
        payload.event_type,
    )

    # Future: Send actual notification based on event_type
    # - reminder.scheduled: Log for audit, no user notification
    # - reminder.triggered: Send push notification / email

    if payload.event_type == "reminder.triggered":
        # This is when we would actually send the notification
        logger.info(
            "[NOTIFICATION_TRIGGERED] "
            "Sending notification to user %s for task '%s'",
            payload.user_id,
            payload.task_title,
        )
        # TODO: Integrate with notification providers
        # - Email via SendGrid/SES
        # - Push via Firebase/OneSignal
        # - Slack/Discord webhooks

    # Mark as processed (T041)
    from datetime import datetime
    await idempotency_checker.mark_processed(
        event_id,
        {"processed_at": datetime.utcnow().isoformat() + "Z"},
    )

    logger.info(
        "[REMINDER_PROCESSED] event_id=%s task_id=%s",
        event_id,
        payload.task_id,
    )

    return {
        "status": "success",
        "event_id": event_id,
        "task_id": payload.task_id,
        "message": "Notification logged (stubbed)",
    }
