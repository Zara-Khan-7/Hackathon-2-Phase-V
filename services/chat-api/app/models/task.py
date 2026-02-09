"""
Task SQLModel - represents a user-owned work item.
Includes status and priority enums per data-model.md specification.
Enhanced with tags, reminders, and recurring task support.
"""
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
from typing import Optional, List


class TaskStatus(str, Enum):
    """Task status values - any transition allowed."""
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class TaskPriority(str, Enum):
    """Task priority levels."""
    low = "low"
    medium = "medium"
    high = "high"


class Task(SQLModel, table=True):
    """
    Task entity - represents a user-owned work item.

    Each task belongs to exactly one user, identified by user_id
    which comes from the JWT token's 'sub' claim.
    """

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: TaskStatus = Field(default=TaskStatus.pending)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    due_date: Optional[datetime] = Field(default=None)
    user_id: str = Field(index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Tags - stored as JSONB array for efficient queries
    tags: List[str] = Field(default=[], sa_column=Column(JSONB, default=[]))

    # Reminder fields
    reminder_offset_minutes: Optional[int] = Field(default=None)
    remind_at: Optional[datetime] = Field(default=None)

    # Recurring task fields
    is_recurring: bool = Field(default=False)
    recurrence_rule: Optional[str] = Field(default=None, max_length=50)
    parent_task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")
