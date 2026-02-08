"""
Event publishing service - placeholder for Dapr/Kafka integration.

This module provides a publish_event() function that currently logs events
locally. It will be replaced with Dapr HTTP calls for Phase 5 Kafka integration.

Topics:
- task-events: task.created, task.updated, task.completed, task.deleted
- reminders: reminder.scheduled
"""

import logging
from uuid import uuid4
from datetime import datetime
from typing import Any, Dict

logger = logging.getLogger(__name__)


def publish_event(
    topic: str,
    event_type: str,
    user_id: str,
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Publish an event to the message bus.

    Currently logs events for local development.
    Replace with Dapr HTTP calls for Phase 5 Kafka integration:

    ```python
    import httpx
    import os

    DAPR_PORT = os.getenv("DAPR_HTTP_PORT", "3500")

    async def publish_event(topic: str, event_type: str, user_id: str, payload: dict):
        event = {...}
        async with httpx.AsyncClient() as client:
            await client.post(
                f"http://localhost:{DAPR_PORT}/v1.0/publish/pubsub/{topic}",
                json=event
            )
        return event
    ```

    Args:
        topic: The topic to publish to (task-events, reminders)
        event_type: The type of event (task.created, task.updated, etc.)
        user_id: The user ID from JWT
        payload: The event payload (task data, reminder data)

    Returns:
        The complete event object with metadata
    """
    event = {
        "event_id": str(uuid4()),
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "user_id": user_id,
        "payload": payload,
    }

    # Structured logging for observability
    logger.info(
        "[EVENT] topic=%s type=%s id=%s user=%s",
        topic,
        event_type,
        event["event_id"],
        user_id,
    )
    logger.debug("[EVENT_PAYLOAD] %s", event)

    return event


def publish_task_event(
    event_type: str,
    user_id: str,
    task_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Convenience function for publishing task events.

    Args:
        event_type: One of task.created, task.updated, task.completed, task.deleted
        user_id: The user ID from JWT
        task_data: The task data to include in payload

    Returns:
        The complete event object
    """
    return publish_event(
        topic="task-events",
        event_type=event_type,
        user_id=user_id,
        payload=task_data,
    )


def publish_reminder_event(
    user_id: str,
    task_id: str,
    task_title: str,
    due_date: datetime,
    remind_at: datetime,
) -> Dict[str, Any]:
    """
    Publish a reminder.scheduled event.

    Args:
        user_id: The user ID from JWT
        task_id: The task ID
        task_title: The task title for notification
        due_date: When the task is due
        remind_at: When to send the reminder

    Returns:
        The complete event object
    """
    payload = {
        "task_id": str(task_id),
        "task_title": task_title,
        "due_date": due_date.isoformat() + "Z" if due_date else None,
        "remind_at": remind_at.isoformat() + "Z" if remind_at else None,
    }

    return publish_event(
        topic="reminders",
        event_type="reminder.scheduled",
        user_id=user_id,
        payload=payload,
    )
