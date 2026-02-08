"""
Pydantic schemas for Task API request/response validation.
Includes TaskCreate, TaskUpdate, TaskResponse, and CompleteTaskResponse schemas.
Enhanced with tags, reminders, and recurring task support.
"""
from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, List

from app.models.task import TaskStatus, TaskPriority


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None

    # Tags - list of strings, max 20 tags, each max 50 chars
    tags: List[str] = Field(default_factory=list, max_length=20)

    # Reminder - minutes before due_date
    reminder_offset_minutes: Optional[int] = Field(None, ge=1)

    # Recurring task fields
    is_recurring: bool = False
    recurrence_rule: Optional[str] = Field(None, max_length=50)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate each tag: max 50 chars, no empty strings."""
        if len(v) > 20:
            raise ValueError("Maximum 20 tags allowed")
        for tag in v:
            if not tag or len(tag) > 50:
                raise ValueError("Each tag must be 1-50 characters")
        return v

    @field_validator("reminder_offset_minutes")
    @classmethod
    def validate_reminder_requires_due_date(cls, v, info):
        """Reminder offset validation - due_date check done at endpoint level."""
        if v is not None and v < 1:
            raise ValueError("Reminder offset must be at least 1 minute")
        return v

    @field_validator("recurrence_rule")
    @classmethod
    def validate_recurrence_rule(cls, v: Optional[str], info) -> Optional[str]:
        """Validate recurrence rule format."""
        if v is None:
            return v
        valid_rules = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
        v_upper = v.upper().strip()
        if v_upper in valid_rules:
            return v_upper
        if v_upper.startswith("INTERVAL:"):
            try:
                interval = int(v_upper.split(":")[1])
                if interval < 1:
                    raise ValueError("Interval must be at least 1")
                return v_upper
            except (IndexError, ValueError):
                raise ValueError("Invalid INTERVAL format. Use INTERVAL:N where N is a positive integer")
        raise ValueError(f"Invalid recurrence rule. Valid: {valid_rules} or INTERVAL:N")


class TaskUpdate(BaseModel):
    """Schema for updating an existing task (all fields optional for partial updates)."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None

    # Tags - list of strings, max 20 tags, each max 50 chars
    tags: Optional[List[str]] = None

    # Reminder - minutes before due_date
    reminder_offset_minutes: Optional[int] = None

    # Recurring task fields
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = Field(None, max_length=50)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate each tag: max 50 chars, no empty strings."""
        if v is None:
            return v
        if len(v) > 20:
            raise ValueError("Maximum 20 tags allowed")
        for tag in v:
            if not tag or len(tag) > 50:
                raise ValueError("Each tag must be 1-50 characters")
        return v

    @field_validator("recurrence_rule")
    @classmethod
    def validate_recurrence_rule(cls, v: Optional[str]) -> Optional[str]:
        """Validate recurrence rule format."""
        if v is None:
            return v
        valid_rules = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
        v_upper = v.upper().strip()
        if v_upper in valid_rules:
            return v_upper
        if v_upper.startswith("INTERVAL:"):
            try:
                interval = int(v_upper.split(":")[1])
                if interval < 1:
                    raise ValueError("Interval must be at least 1")
                return v_upper
            except (IndexError, ValueError):
                raise ValueError("Invalid INTERVAL format. Use INTERVAL:N where N is a positive integer")
        raise ValueError(f"Invalid recurrence rule. Valid: {valid_rules} or INTERVAL:N")


class TaskResponse(BaseModel):
    """Schema for task responses."""

    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    # Tags
    tags: List[str] = Field(default_factory=list)

    # Reminder fields
    reminder_offset_minutes: Optional[int] = None
    remind_at: Optional[datetime] = None

    # Recurring task fields
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    parent_task_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class CompleteTaskResponse(BaseModel):
    """Response schema for completing a task (includes next occurrence if recurring)."""

    completed_task: TaskResponse
    next_task: Optional[TaskResponse] = None
