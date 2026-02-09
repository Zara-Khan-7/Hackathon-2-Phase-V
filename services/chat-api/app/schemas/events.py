"""
Event schemas for Dapr Pub/Sub messaging.

Defines Pydantic models for task events and reminder events
per data-model.md specification.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field


class TaskEventType(str, Enum):
    """Task event types published to task-events topic."""
    CREATED = "task.created"
    UPDATED = "task.updated"
    COMPLETED = "task.completed"
    DELETED = "task.deleted"


class ReminderEventType(str, Enum):
    """Reminder event types published to reminders topic."""
    SCHEDULED = "reminder.scheduled"
    TRIGGERED = "reminder.triggered"


class TaskStatus(str, Enum):
    """Task status values."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskPayload(BaseModel):
    """
    Task data embedded in task events.

    Contains full task information for consumers.
    """
    id: UUID
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    user_id: str
    created_at: datetime
    updated_at: datetime
    tags: List[str] = Field(default_factory=list)
    reminder_offset_minutes: Optional[int] = None
    remind_at: Optional[datetime] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    parent_task_id: Optional[UUID] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v else None,
            UUID: str,
        }


class TaskEvent(BaseModel):
    """
    Task event schema for task-events topic.

    CloudEvents-compatible format with full task payload.
    """
    event_id: UUID = Field(description="Unique event identifier")
    event_type: TaskEventType = Field(description="Type of task event")
    timestamp: datetime = Field(description="Event timestamp in UTC")
    user_id: str = Field(description="User who triggered the event")
    payload: Dict[str, Any] = Field(description="Full task data")
    source: str = Field(default="chat-api", description="Event source service")
    specversion: str = Field(default="1.0", description="CloudEvents spec version")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v else None,
            UUID: str,
        }


class ReminderPayload(BaseModel):
    """
    Reminder data embedded in reminder events.

    Contains task reference and timing information.
    """
    task_id: UUID
    task_title: str
    due_at: Optional[datetime] = None
    remind_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v else None,
            UUID: str,
        }


class ReminderEvent(BaseModel):
    """
    Reminder event schema for reminders topic.

    Published when reminders are scheduled or triggered.
    """
    event_id: UUID = Field(description="Unique event identifier")
    event_type: ReminderEventType = Field(description="Type of reminder event")
    timestamp: datetime = Field(description="Event timestamp in UTC")
    user_id: str = Field(description="User to notify")
    payload: ReminderPayload = Field(description="Reminder details")
    source: str = Field(default="chat-api", description="Event source service")
    specversion: str = Field(default="1.0", description="CloudEvents spec version")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v else None,
            UUID: str,
        }


class TaskSyncPayload(BaseModel):
    """
    Task sync data for real-time WebSocket updates.
    """
    task_id: UUID
    action: str = Field(description="One of: created, updated, completed, deleted")


class TaskSyncEvent(BaseModel):
    """
    Task sync event schema for task-updates topic.

    Used for real-time WebSocket client notifications (future).
    """
    event_id: UUID
    event_type: str = "task.sync"
    timestamp: datetime
    user_id: str
    task_id: UUID
    action: str

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v else None,
            UUID: str,
        }


# Helper function to convert Task model to TaskPayload dict
def task_to_payload(task) -> Dict[str, Any]:
    """
    Convert a Task SQLModel instance to a payload dict.

    Args:
        task: Task model instance

    Returns:
        Dictionary suitable for event payload
    """
    return {
        "id": str(task.id),
        "title": task.title,
        "description": task.description,
        "status": task.status.value if hasattr(task.status, 'value') else task.status,
        "priority": task.priority.value if hasattr(task.priority, 'value') else task.priority,
        "due_date": task.due_date.isoformat() + "Z" if task.due_date else None,
        "user_id": task.user_id,
        "created_at": task.created_at.isoformat() + "Z" if task.created_at else None,
        "updated_at": task.updated_at.isoformat() + "Z" if task.updated_at else None,
        "tags": task.tags or [],
        "reminder_offset_minutes": task.reminder_offset_minutes,
        "remind_at": task.remind_at.isoformat() + "Z" if task.remind_at else None,
        "is_recurring": task.is_recurring,
        "recurrence_rule": task.recurrence_rule,
        "parent_task_id": str(task.parent_task_id) if task.parent_task_id else None,
    }
