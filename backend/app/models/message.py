"""
Message SQLModel - represents a single message in a conversation.
Messages are immutable once created and ordered by created_at.
"""
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from enum import Enum


class MessageRole(str, Enum):
    """Message sender role."""
    user = "user"
    assistant = "assistant"


class Message(SQLModel, table=True):
    """
    Represents a single message in a conversation.
    Immutable once created.
    """
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id", index=True)
    role: MessageRole
    content: str
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
