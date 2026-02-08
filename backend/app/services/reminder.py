"""
Reminder service - handles reminder time calculation.

Reminders are stored as an offset in minutes before the due date.
The remind_at timestamp is calculated: due_date - offset_minutes.
"""

from datetime import datetime, timedelta
from typing import Optional


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
