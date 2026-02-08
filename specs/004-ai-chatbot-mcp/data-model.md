# Data Model: AI-Native Todo Chatbot (Phase III)

**Branch**: `004-ai-chatbot-mcp`
**Date**: 2026-01-16
**Status**: Complete

## Entity Overview

This feature extends the existing Phase II data model with conversation-related entities while preserving the existing Task entity.

```
┌─────────────┐       ┌───────────────┐       ┌─────────────┐
│    User     │───────│ Conversation  │───────│   Message   │
│ (external)  │ 1   * │               │ 1   * │             │
└─────────────┘       └───────────────┘       └─────────────┘
      │
      │ 1
      │
      │ *
┌─────────────┐
│    Task     │
│ (existing)  │
└─────────────┘
```

## Entities

### 1. Task (Existing - No Changes)

The Task entity from Phase II remains unchanged. MCP tools will interact with this entity.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique task identifier |
| title | string | max 255, required | Task title |
| description | string | max 2000, optional | Task description |
| status | enum | pending/in_progress/completed | Task status |
| priority | enum | low/medium/high | Task priority |
| due_date | datetime | optional | Task due date |
| user_id | string | FK, indexed, required | Owner's ID from JWT |
| created_at | datetime | auto | Creation timestamp |
| updated_at | datetime | auto | Last update timestamp |

**Indexes**: `user_id` (for user-scoped queries)

---

### 2. Conversation (New)

Represents a chat session for a user. Each user has one active conversation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique conversation identifier |
| user_id | string | unique, indexed, required | Owner's ID from JWT |
| title | string | max 255, optional | Conversation title (auto-generated) |
| created_at | datetime | auto | Conversation start time |
| updated_at | datetime | auto | Last activity time |

**Indexes**: `user_id` (unique - one conversation per user)

**Business Rules**:
- Each user has exactly one conversation
- Conversation is created on first chat interaction
- Conversation persists indefinitely (no automatic deletion)

---

### 3. Message (New)

Represents a single message in a conversation (user or assistant).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique message identifier |
| conversation_id | UUID | FK, indexed, required | Parent conversation |
| role | enum | user/assistant | Message sender role |
| content | text | required | Message text content |
| tool_calls | JSON | optional | MCP tools invoked (for assistant messages) |
| created_at | datetime | auto, indexed | Message timestamp |

**Indexes**:
- `conversation_id` (for loading conversation history)
- `created_at` (for ordering and context window)

**Business Rules**:
- Messages are immutable once created
- Messages are ordered by `created_at` ascending
- `tool_calls` field stores metadata about which MCP tools were invoked

---

## Relationships

### User → Task (Existing)
- One user owns many tasks
- Tasks filtered by `user_id` derived from JWT
- Enforced at MCP tool level

### User → Conversation
- One user has one conversation (1:1)
- `user_id` is unique in Conversation table
- Conversation created on first interaction

### Conversation → Message
- One conversation contains many messages (1:N)
- Messages ordered by `created_at`
- No cascade delete (preserve history)

---

## SQLModel Definitions

### Conversation Model

```python
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
```

### Message Model

```python
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
```

---

## State Transitions

### Task Status Transitions
(Unchanged from Phase II - any transition allowed)

```
pending ←→ in_progress ←→ completed
   ↑___________________________↓
```

### Conversation Lifecycle

```
[No Conversation] → [Active] → [Active with Messages]
                         ↑______________|
                         (continuous use)
```

---

## Validation Rules

### Task (via MCP Tools)
- `title`: Required, max 255 characters
- `description`: Optional, max 2000 characters
- `status`: Must be valid enum value
- `priority`: Must be valid enum value
- `due_date`: Must be valid datetime if provided
- `user_id`: Required, must match authenticated user

### Conversation
- `user_id`: Required, unique per conversation
- `title`: Optional, auto-generated from first message if not set

### Message
- `conversation_id`: Required, must exist
- `role`: Required, must be 'user' or 'assistant'
- `content`: Required, non-empty
- `tool_calls`: Optional, valid JSON if provided

---

## Context Window Management

For AI agent context building, messages are loaded with these rules:

1. Load most recent 20 messages ordered by `created_at DESC`
2. Reverse to chronological order for agent context
3. Always prepend system prompt
4. If conversation has fewer than 20 messages, load all

```sql
SELECT * FROM message
WHERE conversation_id = :conv_id
ORDER BY created_at DESC
LIMIT 20;
```

---

## Database Schema SQL

```sql
-- Conversation table
CREATE TABLE conversation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversation_user_id ON conversation(user_id);

-- Message table
CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversation(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_conversation_id ON message(conversation_id);
CREATE INDEX idx_message_created_at ON message(created_at);
```

---

## Migration Notes

- Task table: No changes required (existing from Phase II)
- Conversation table: New table, create with migration
- Message table: New table, create with migration
- No data migration needed (new entities only)
