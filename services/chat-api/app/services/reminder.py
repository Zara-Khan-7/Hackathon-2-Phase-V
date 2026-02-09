"""
Reminder service - handles reminder time calculation and Dapr Jobs scheduling.

Reminders are stored as an offset in minutes before the due date.
The remind_at timestamp is calculated: due_date - offset_minutes.

US2: Integrates with Dapr Jobs API for scheduled reminder delivery.
"""

from datetime import datetime, timedelta
from typing import Optional
import logging

from app.dapr.client import dapr_client

logger = logging.getLogger(__name__)


# Common reminder presets (in minutes)
REMINDER_PRESETS = {
    "10_minutes": 10,
    "30_minutes": 30,
    "1_hour": 60,
    "2_hours": 120,
    "1_day": 1440,      # 24 * 60
    "2_days": 2880,     # 48 * 60
    "1_week": 10080,    # 7 * 24 * 60
}


def calculate_remind_at(
    due_date: Optional[datetime],
    reminder_offset_minutes: Optional[int],
) -> Optional[datetime]:
    """
    Calculate the remind_at timestamp based on due_date and offset.

    Args:
        due_date: The task's due date
        reminder_offset_minutes: Minutes before due_date to send reminder

    Returns:
        The calculated remind_at datetime, or None if either input is None

    Note:
        - Returns None if due_date is None (reminder requires due date)
        - Returns None if reminder_offset_minutes is None (no reminder set)
        - remind_at can be in the past if due_date is soon
    """
    if due_date is None or reminder_offset_minutes is None:
        return None

    if reminder_offset_minutes < 0:
        raise ValueError("reminder_offset_minutes must be non-negative")

    return due_date - timedelta(minutes=reminder_offset_minutes)


def validate_reminder_offset(offset_minutes: int) -> bool:
    """
    Validate that a reminder offset is within reasonable bounds.

    Args:
        offset_minutes: The reminder offset in minutes

    Returns:
        True if valid, False otherwise

    Note:
        - Minimum: 1 minute
        - Maximum: 1 year (525600 minutes)
    """
    MIN_OFFSET = 1
    MAX_OFFSET = 525600  # 1 year in minutes

    return MIN_OFFSET <= offset_minutes <= MAX_OFFSET


def get_reminder_display(offset_minutes: Optional[int]) -> str:
    """
    Get a human-readable display string for a reminder offset.

    Args:
        offset_minutes: The reminder offset in minutes

    Returns:
        Human-readable description (e.g., "1 hour before", "2 days before")
    """
    if offset_minutes is None:
        return "No reminder"

    if offset_minutes < 60:
        if offset_minutes == 1:
            return "1 minute before"
        return f"{offset_minutes} minutes before"
    elif offset_minutes < 1440:  # Less than 1 day
        hours = offset_minutes // 60
        if hours == 1:
            return "1 hour before"
        return f"{hours} hours before"
    else:
        days = offset_minutes // 1440
        if days == 1:
            return "1 day before"
        elif days == 7:
            return "1 week before"
        return f"{days} days before"


def is_reminder_in_past(remind_at: Optional[datetime]) -> bool:
    """
    Check if a reminder time has already passed.

    Args:
        remind_at: The calculated reminder time

    Returns:
        True if remind_at is in the past, False otherwise
    """
    if remind_at is None:
        return False

    return remind_at < datetime.utcnow()


# ==================== Dapr Jobs Integration ====================


def _build_job_name(task_id: str) -> str:
    """Build a unique job name for a task reminder."""
    return f"reminder-{task_id}"


async def schedule_reminder_job(
    task_id: str,
    task_title: str,
    user_id: str,
    due_date: Optional[datetime],
    remind_at: datetime,
) -> bool:
    """
    Schedule a reminder job via Dapr Jobs API.

    US2: Schedule a one-time job that fires at remind_at time.
    When the job fires, it calls /api/v1/jobs/reminder-callback.

    Args:
        task_id: Task ID for the reminder
        task_title: Task title for notification display
        user_id: User to notify
        due_date: When the task is due
        remind_at: When to send the reminder

    Returns:
        True if job scheduled successfully, False otherwise
    """
    # Don't schedule reminders in the past
    if is_reminder_in_past(remind_at):
        logger.warning(
            "[REMINDER_SKIP_PAST] task_id=%s remind_at=%s is in the past",
            task_id,
            remind_at.isoformat(),
        )
        return False

    job_name = _build_job_name(task_id)

    job_data = {
        "task_id": str(task_id),
        "task_title": task_title,
        "user_id": user_id,
        "due_at": due_date.isoformat() + "Z" if due_date else None,
        "remind_at": remind_at.isoformat() + "Z",
    }

    logger.info(
        "[REMINDER_SCHEDULE] job=%s task_id=%s remind_at=%s",
        job_name,
        task_id,
        remind_at.isoformat(),
    )

    return await dapr_client.schedule_job(
        job_name=job_name,
        schedule_time=remind_at,
        data=job_data,
        callback_url="/api/v1/jobs/reminder-callback",
    )


async def cancel_reminder_job(task_id: str) -> bool:
    """
    Cancel a scheduled reminder job via Dapr Jobs API.

    US2: Called when a task is deleted or reminder is removed.

    Args:
        task_id: Task ID whose reminder job should be cancelled

    Returns:
        True if job cancelled successfully (or didn't exist)
    """
    job_name = _build_job_name(task_id)

    logger.info(
        "[REMINDER_CANCEL] job=%s task_id=%s",
        job_name,
        task_id,
    )

    return await dapr_client.cancel_job(job_name)


async def reschedule_reminder_job(
    task_id: str,
    task_title: str,
    user_id: str,
    due_date: Optional[datetime],
    remind_at: Optional[datetime],
) -> bool:
    """
    Reschedule a reminder job (cancel existing and create new).

    US2: Called when task's due_date or reminder_offset changes.

    Args:
        task_id: Task ID for the reminder
        task_title: Task title for notification display
        user_id: User to notify
        due_date: When the task is due
        remind_at: When to send the reminder (None to cancel only)

    Returns:
        True if rescheduled successfully
    """
    # Always cancel existing job first
    await cancel_reminder_job(task_id)

    # Schedule new job if remind_at is set
    if remind_at:
        return await schedule_reminder_job(
            task_id=task_id,
            task_title=task_title,
            user_id=user_id,
            due_date=due_date,
            remind_at=remind_at,
        )

    return True
