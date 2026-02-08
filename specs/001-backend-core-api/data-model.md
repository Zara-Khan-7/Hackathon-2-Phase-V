# Data Model: Backend Core & Data Layer

**Feature**: 001-backend-core-api
**Date**: 2026-01-09
**Status**: Complete

## Entity Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Task                                 │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                               │
│ title: VARCHAR(255) NOT NULL                                │
│ description: VARCHAR(2000) NULL                             │
│ status: ENUM('pending','in_progress','completed')           │
│ priority: ENUM('low','medium','high')                       │
│ due_date: TIMESTAMP NULL                                    │
│ user_id: VARCHAR(255) NOT NULL [INDEX]                      │
│ created_at: TIMESTAMP NOT NULL                              │
│ updated_at: TIMESTAMP NOT NULL                              │
└─────────────────────────────────────────────────────────────┘
```

## Entity: Task

### Description
Represents a work item belonging to a user. Each task is owned by exactly one user, identified by `user_id` which comes from the JWT token's `sub` claim.

### Fields

| Field | Type | Nullable | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `id` | UUID | No | uuid4() | PRIMARY KEY | Unique identifier, auto-generated |
| `title` | VARCHAR(255) | No | - | NOT NULL, max 255 chars | Task title |
| `description` | VARCHAR(2000) | Yes | NULL | max 2000 chars | Optional task description |
| `status` | ENUM | No | 'pending' | One of: pending, in_progress, completed | Current task status |
| `priority` | ENUM | No | 'medium' | One of: low, medium, high | Task priority level |
| `due_date` | TIMESTAMP | Yes | NULL | - | Optional due date in UTC |
| `user_id` | VARCHAR(255) | No | - | NOT NULL, INDEX | Owner's user ID from JWT |
| `created_at` | TIMESTAMP | No | now() | NOT NULL | Record creation time (UTC) |
| `updated_at` | TIMESTAMP | No | now() | NOT NULL, ON UPDATE | Last modification time (UTC) |

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `pk_task_id` | `id` | PRIMARY | Primary key lookup |
| `idx_task_user_id` | `user_id` | B-TREE | Filter tasks by user (critical for isolation) |
| `idx_task_user_status` | `user_id`, `status` | B-TREE | Filter user's tasks by status |
| `idx_task_user_due_date` | `user_id`, `due_date` | B-TREE | Sort user's tasks by due date |

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `title` | Required, 1-255 characters | "Title is required and must be 1-255 characters" |
| `description` | Max 2000 characters | "Description must not exceed 2000 characters" |
| `status` | Must be valid enum value | "Status must be one of: pending, in_progress, completed" |
| `priority` | Must be valid enum value | "Priority must be one of: low, medium, high" |
| `due_date` | Valid ISO 8601 datetime or null | "Due date must be a valid datetime" |

### State Transitions

```
┌─────────┐     ┌──────────────┐     ┌───────────┐
│ pending │ ──► │ in_progress  │ ──► │ completed │
└─────────┘     └──────────────┘     └───────────┘
     ▲                │                    │
     │                │                    │
     └────────────────┴────────────────────┘
```

**Allowed transitions:**
- Any status can transition to any other status (user flexibility)
- Status changes automatically update `updated_at` timestamp

## Entity: User (External Reference)

### Description
Users are managed by Better Auth (external system). The backend does NOT store user records. Instead, it stores only the `user_id` foreign key reference in the Task table.

### JWT Payload Structure (Expected)
```json
{
  "sub": "user-uuid-string",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1704787200,
  "exp": 1704873600
}
```

### User ID Extraction
- User ID is extracted from JWT `sub` (subject) claim
- Stored as `user_id` VARCHAR in Task table
- No user existence validation (JWT validity = user validity)

## Database Schema (PostgreSQL DDL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create status enum
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Create tasks table
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    status task_status NOT NULL DEFAULT 'pending',
    priority task_priority NOT NULL DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_user_status ON task(user_id, status);
CREATE INDEX idx_task_user_due_date ON task(user_id, due_date);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
from typing import Optional

class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(SQLModel, table=True):
    """Task entity - represents a user-owned work item."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: TaskStatus = Field(default=TaskStatus.pending)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    due_date: Optional[datetime] = Field(default=None)
    user_id: str = Field(index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

## Pydantic Schemas (Request/Response)

```python
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    """Schema for updating an existing task (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None

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

    class Config:
        from_attributes = True
```

## Query Patterns

### List Tasks for User
```python
def get_tasks_by_user(session: Session, user_id: str) -> list[Task]:
    statement = select(Task).where(Task.user_id == user_id)
    return session.exec(statement).all()
```

### Get Single Task with Ownership Check
```python
def get_task_by_id(session: Session, task_id: UUID, user_id: str) -> Task | None:
    statement = select(Task).where(Task.id == task_id)
    task = session.exec(statement).first()
    if task and task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return task
```

### Create Task
```python
def create_task(session: Session, task_data: TaskCreate, user_id: str) -> Task:
    task = Task(**task_data.model_dump(), user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

### Update Task
```python
def update_task(session: Session, task: Task, updates: TaskUpdate) -> Task:
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

### Delete Task
```python
def delete_task(session: Session, task: Task) -> None:
    session.delete(task)
    session.commit()
```
