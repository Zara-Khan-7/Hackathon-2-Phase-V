"""
Conversation SQLModel - represents a user's chat session.
Each user has exactly one conversation (1:1 relationship).
"""
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class Conversation(SQLModel, table=True):
    """
    Represents a user's chat conversation.
    Each user has exactly one conversation.
    """
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(unique=True, index=True, max_length=255)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
