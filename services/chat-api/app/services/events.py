"""
Event publishing service with Dapr Pub/Sub integration.

Publishes task and reminder events to Kafka via Dapr sidecar.

Topics:
- task-events: task.created, task.updated, task.completed, task.deleted
- reminders: reminder.scheduled, reminder.triggered
- task-updates: task.sync (for WebSocket clients - future)
"""

import logging
import os
from uuid import uuid4
from datetime import datetime
from typing import Any, Dict, Optional
from functools import wraps
import asyncio

import httpx

logger = logging.getLogger(__name__)

# Dapr configuration
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_PUBSUB_NAME = os.getenv("DAPR_PUBSUB_NAME", "pubsub")
DAPR_ENABLED = os.getenv("DAPR_ENABLED", "true").lower() == "true"

# Retry configuration
MAX_RETRIES = int(os.getenv("EVENT_MAX_RETRIES", "3"))
RETRY_DELAY_SECONDS = float(os.getenv("EVENT_RETRY_DELAY", "0.5"))


class EventPublishError(Exception):
    """Raised when event publishing fails after retries."""
    pass


def _build_event(
    event_type: str,
    user_id: str,
    payload: Dict[str, Any],
    event_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build a CloudEvents-compatible event envelope.

    Args:
        event_type: Type of event (e.g., task.created)
        user_id: User who triggered the event
        payload: Event data
        event_id: Optional pre-generated event ID

    Returns:
        Complete event object with metadata
    """
    return {
        "event_id": event_id or str(uuid4()),
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "user_id": user_id,
        "payload": payload,
        "source": "chat-api",
        "specversion": "1.0",
    }


async def publish_event(
    topic: str,
    event_type: str,
    user_id: str,
    payload: Dict[str, Any],
    event_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Publish an event to a Dapr Pub/Sub topic.

    Uses Dapr sidecar HTTP API for Kafka abstraction.
    Implements retry logic with exponential backoff.

    Args:
        topic: Target topic (task-events, reminders)
        event_type: Event type (task.created, task.updated, etc.)
        user_id: User ID from JWT
        payload: Event payload data

    Returns:
        The complete event object with metadata

    Raises:
        EventPublishError: If publishing fails after retries
    """
    event = _build_event(event_type, user_id, payload, event_id)

    # Log event creation
    logger.info(
        "[EVENT_PUBLISH] topic=%s type=%s id=%s user=%s",
        topic,
        event_type,
        event["event_id"],
        user_id,
    )

    # If Dapr is disabled, just log and return (local dev mode)
    if not DAPR_ENABLED:
        logger.debug("[EVENT_LOCAL_MODE] %s", event)
        return event

    # Publish via Dapr HTTP API
    url = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{DAPR_PUBSUB_NAME}/{topic}"

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    json=event,
                    headers={"Content-Type": "application/json"}
                )

                if response.status_code in (200, 201, 204):
                    logger.info(
                        "[EVENT_PUBLISHED] topic=%s id=%s attempt=%d",
                        topic,
                        event["event_id"],
                        attempt,
                    )
                    return event
                else:
                    last_error = f"HTTP {response.status_code}: {response.text}"
                    logger.warning(
                        "[EVENT_PUBLISH_RETRY] topic=%s id=%s attempt=%d error=%s",
                        topic,
                        event["event_id"],
                        attempt,
                        last_error,
                    )

        except httpx.RequestError as e:
            last_error = str(e)
            logger.warning(
                "[EVENT_PUBLISH_RETRY] topic=%s id=%s attempt=%d error=%s",
                topic,
                event["event_id"],
                attempt,
                last_error,
            )

        # Exponential backoff before retry
        if attempt < MAX_RETRIES:
            await asyncio.sleep(RETRY_DELAY_SECONDS * (2 ** (attempt - 1)))

    # All retries exhausted
    logger.error(
        "[EVENT_PUBLISH_FAILED] topic=%s id=%s error=%s",
        topic,
        event["event_id"],
        last_error,
    )
    raise EventPublishError(f"Failed to publish to {topic} after {MAX_RETRIES} retries: {last_error}")


async def publish_task_event(
    event_type: str,
    user_id: str,
    task_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Publish a task event to task-events topic.

    Args:
        event_type: One of task.created, task.updated, task.completed, task.deleted
        user_id: User ID from JWT
        task_data: Full task object data

    Returns:
        The complete event object
    """
    return await publish_event(
        topic="task-events",
        event_type=event_type,
        user_id=user_id,
        payload=task_data,
    )


async def publish_task_created(user_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
    """Publish task.created event."""
    return await publish_task_event("task.created", user_id, task_data)


async def publish_task_updated(user_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
    """Publish task.updated event."""
    return await publish_task_event("task.updated", user_id, task_data)


async def publish_task_completed(user_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
    """Publish task.completed event."""
    return await publish_task_event("task.completed", user_id, task_data)


async def publish_task_deleted(user_id: str, task_id: str) -> Dict[str, Any]:
    """Publish task.deleted event."""
    return await publish_task_event("task.deleted", user_id, {"task_id": task_id})


async def publish_reminder_event(
    user_id: str,
    task_id: str,
    task_title: str,
    due_date: Optional[datetime],
    remind_at: datetime,
    event_type: str = "reminder.scheduled",
) -> Dict[str, Any]:
    """
    Publish a reminder event to reminders topic.

    Args:
        user_id: User ID from JWT
        task_id: Associated task ID
        task_title: Task title for notification display
        due_date: When the task is due
        remind_at: When to send the reminder
        event_type: reminder.scheduled or reminder.triggered

    Returns:
        The complete event object
    """
    payload = {
        "task_id": str(task_id),
        "task_title": task_title,
        "due_at": due_date.isoformat() + "Z" if due_date else None,
        "remind_at": remind_at.isoformat() + "Z",
    }

    return await publish_event(
        topic="reminders",
        event_type=event_type,
        user_id=user_id,
        payload=payload,
    )


async def publish_task_sync(
    user_id: str,
    task_id: str,
    action: str,
) -> Dict[str, Any]:
    """
    Publish task sync event for real-time WebSocket updates (future).

    Args:
        user_id: User ID from JWT
        task_id: Affected task ID
        action: One of created, updated, completed, deleted

    Returns:
        The complete event object
    """
    return await publish_event(
        topic="task-updates",
        event_type="task.sync",
        user_id=user_id,
        payload={
            "task_id": str(task_id),
            "action": action,
        },
    )


# Synchronous wrappers for non-async contexts
def publish_event_sync(
    topic: str,
    event_type: str,
    user_id: str,
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    """Synchronous wrapper for publish_event (for compatibility)."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If we're in an async context, create a new task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(
                    asyncio.run,
                    publish_event(topic, event_type, user_id, payload)
                )
                return future.result(timeout=15)
        else:
            return loop.run_until_complete(
                publish_event(topic, event_type, user_id, payload)
            )
    except Exception as e:
        logger.error(f"Sync publish failed: {e}")
        # Return event without publishing for graceful degradation
        return _build_event(event_type, user_id, payload)


def publish_task_event_sync(
    event_type: str,
    user_id: str,
    task_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Synchronous wrapper for publish_task_event."""
    return publish_event_sync("task-events", event_type, user_id, task_data)
