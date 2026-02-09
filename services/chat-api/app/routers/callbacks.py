"""
Dapr Jobs callback router.

Handles callbacks from Dapr Jobs API when scheduled jobs fire.
Used for reminder notifications and other scheduled operations.
"""

from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
import logging

from app.auth.jwt import get_current_user_optional
from app.services.events import publish_reminder_event

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/jobs",
    tags=["Jobs Callbacks"],
)


class ReminderCallbackData(BaseModel):
    """Data passed to reminder callback by Dapr Jobs."""
    task_id: str
    task_title: str
    user_id: str
    due_at: Optional[str] = None
    remind_at: str


class JobCallbackRequest(BaseModel):
    """Dapr Jobs callback request format."""
    name: str  # Job name
    data: ReminderCallbackData  # Job data


@router.post("/reminder-callback")
async def handle_reminder_callback(
    request: JobCallbackRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    """
    Handle reminder job callback from Dapr Jobs API.

    US2: When a scheduled reminder job fires, this endpoint:
    1. Receives the callback from Dapr
    2. Publishes reminder.triggered event to reminders topic
    3. Returns success to acknowledge the job

    Note: This endpoint is called by Dapr sidecar, not directly by users.
    """
    try:
        data = request.data

        logger.info(
            "[REMINDER_CALLBACK] job=%s task_id=%s user_id=%s",
            request.name,
            data.task_id,
            data.user_id,
        )

        # Parse remind_at back to datetime
        remind_at = datetime.fromisoformat(data.remind_at.replace("Z", "+00:00"))

        # Parse due_at if present
        due_at = None
        if data.due_at:
            due_at = datetime.fromisoformat(data.due_at.replace("Z", "+00:00"))

        # Publish reminder.triggered event (in background to not block callback response)
        background_tasks.add_task(
            publish_reminder_event,
            user_id=data.user_id,
            task_id=data.task_id,
            task_title=data.task_title,
            due_date=due_at,
            remind_at=remind_at,
            event_type="reminder.triggered",
        )

        logger.info(
            "[REMINDER_TRIGGERED] task_id=%s title=%s user_id=%s",
            data.task_id,
            data.task_title,
            data.user_id,
        )

        return {
            "status": "success",
            "message": "Reminder triggered",
            "task_id": data.task_id,
        }

    except Exception as e:
        logger.error(
            "[REMINDER_CALLBACK_ERROR] job=%s error=%s",
            request.name,
            str(e),
        )
        # Still return 200 to Dapr to prevent retries for application errors
        return {
            "status": "error",
            "message": str(e),
        }
