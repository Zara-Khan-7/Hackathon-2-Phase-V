"""
Recurring task service - handles recurrence rule parsing and next occurrence calculation.

Supports simple recurrence patterns:
- DAILY: Every day
- WEEKLY: Every 7 days
- MONTHLY: Every month (same day of month)
- YEARLY: Every year (same date)
- INTERVAL:N: Every N days (e.g., INTERVAL:3 for every 3 days)
"""

from datetime import datetime, timedelta
from typing import Optional
from dateutil.relativedelta import relativedelta


def parse_recurrence_rule(rule: str) -> dict:
    """
    Parse a recurrence rule string into components.

    Args:
        rule: Recurrence rule string (DAILY, WEEKLY, MONTHLY, YEARLY, INTERVAL:N)

    Returns:
        Dictionary with:
        - type: The recurrence type
        - interval: Number of days/months/years between occurrences
        - unit: The unit of measurement (days, months, years)

    Raises:
        ValueError: If the rule format is invalid
    """
    if not rule:
        raise ValueError("Recurrence rule cannot be empty")

    rule = rule.upper().strip()

    if rule == "DAILY":
        return {"type": "DAILY", "interval": 1, "unit": "days"}
    elif rule == "WEEKLY":
        return {"type": "WEEKLY", "interval": 7, "unit": "days"}
    elif rule == "MONTHLY":
        return {"type": "MONTHLY", "interval": 1, "unit": "months"}
    elif rule == "YEARLY":
        return {"type": "YEARLY", "interval": 1, "unit": "years"}
    elif rule.startswith("INTERVAL:"):
        try:
            interval = int(rule.split(":")[1])
            if interval < 1:
                raise ValueError("Interval must be at least 1")
            return {"type": "INTERVAL", "interval": interval, "unit": "days"}
        except (IndexError, ValueError) as e:
            raise ValueError(f"Invalid INTERVAL format: {rule}. Use INTERVAL:N where N is a positive integer") from e
    else:
        raise ValueError(
            f"Unknown recurrence rule: {rule}. "
            "Valid values: DAILY, WEEKLY, MONTHLY, YEARLY, INTERVAL:N"
        )


def calculate_next_due_date(
    current_due_date: Optional[datetime],
    recurrence_rule: str,
) -> Optional[datetime]:
    """
    Calculate the next due date based on current due date and recurrence rule.

    Args:
        current_due_date: The current due date (can be None)
        recurrence_rule: The recurrence pattern string

    Returns:
        The next due date, or None if current_due_date is None

    Note:
        - If current_due_date is None, returns None (next occurrence has no due date)
        - MONTHLY handles month-end edge cases (e.g., Jan 31 -> Feb 28)
        - YEARLY handles leap year edge cases
    """
    if current_due_date is None:
        return None

    parsed = parse_recurrence_rule(recurrence_rule)

    if parsed["unit"] == "days":
        return current_due_date + timedelta(days=parsed["interval"])
    elif parsed["unit"] == "months":
        return current_due_date + relativedelta(months=parsed["interval"])
    elif parsed["unit"] == "years":
        return current_due_date + relativedelta(years=parsed["interval"])
    else:
        # Fallback to days
        return current_due_date + timedelta(days=parsed["interval"])


def get_recurrence_display(rule: str) -> str:
    """
    Get a human-readable display string for a recurrence rule.

    Args:
        rule: The recurrence rule string

    Returns:
        Human-readable description (e.g., "Every day", "Every 3 days")
    """
    try:
        parsed = parse_recurrence_rule(rule)

        if parsed["type"] == "DAILY":
            return "Every day"
        elif parsed["type"] == "WEEKLY":
            return "Every week"
        elif parsed["type"] == "MONTHLY":
            return "Every month"
        elif parsed["type"] == "YEARLY":
            return "Every year"
        elif parsed["type"] == "INTERVAL":
            interval = parsed["interval"]
            if interval == 1:
                return "Every day"
            return f"Every {interval} days"
        else:
            return rule
    except ValueError:
        return rule
