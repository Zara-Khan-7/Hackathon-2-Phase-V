"""
Audit log SQLModel for storing task event history.

US5: Stores all task events for compliance and auditing.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text, JSON


class AuditLogEntry(SQLModel, table=True):
    """
    Audit log entry for task events.

    Stores a complete record of all task events for compliance.
    """
    __tablename__ = "audit_log"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_id: str = Field(index=True, description="Original event ID for idempotency")
    event_type: str = Field(index=True, description="Event type (task.created, etc.)")
    timestamp: datetime = Field(description="Event timestamp from publisher")
    received_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When this service received the event"
    )
    user_id: str = Field(index=True, description="User who performed the action")
    task_id: Optional[str] = Field(default=None, index=True, description="Affected task ID")
    payload: dict = Field(default={}, sa_column=Column(JSON), description="Full event payload")
    source: str = Field(default="chat-api", description="Event source service")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v else None,
            UUID: str,
        }
