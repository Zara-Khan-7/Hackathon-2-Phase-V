# Data Model: Advanced Task Management Features

**Feature**: 006-advanced-task-features
**Date**: 2026-02-08
**Status**: Designed

## Entity Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            Task                                  │
├─────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                   │
│ title: VARCHAR(255)                                             │
│ description: VARCHAR(2000) NULL                                 │
│ status: ENUM(pending, in_progress, completed)                   │
│ priority: ENUM(low, medium, high)                               │
│ due_date: TIMESTAMP WITH TIME ZONE NULL                         │
│ user_id: VARCHAR(255) INDEX                                     │
│ created_at: TIMESTAMP                                           │
│ updated_at: TIMESTAMP                                           │
│ ─────────────────────────────────────────────────────────────── │
│ tags: JSONB (list[str])                          # NEW          │
│ reminder_offset_minutes: INTEGER NULL             # NEW          │
│ remind_at: TIMESTAMP WITH TIME ZONE NULL          # NEW          │
│ is_recurring: BOOLEAN DEFAULT false               # NEW          │
│ recurrence_rule: VARCHAR(50) NULL                 # NEW          │
│ parent_task_id: UUID NULL FK(task.id)             # NEW          │
└─────────────────────────────────────────────────────────────────┘
         │
         │ self-reference (recurring chain)
         ▼
```

## Field Specifications

### Existing Fields (Unchanged)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique task identifier |
| title | VARCHAR(255) | NOT NULL, 1-255 chars | Task title |
| description | VARCHAR(2000) | NULL, max 2000 chars | Detailed description |
| status | ENUM | NOT NULL, DEFAULT 'pending' | pending, in_progress, completed |
| priority | ENUM | NOT NULL, DEFAULT 'medium' | low, medium, high |
| due_date | TIMESTAMP TZ | NULL | When task is due |
| user_id | VARCHAR(255) | NOT NULL, INDEX | Owner user ID from JWT |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

### New Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| tags | JSONB | NOT NULL, DEFAULT '[]' | Array of tag strings |
| reminder_offset_minutes | INTEGER | NULL, >= 0 | Minutes before due_date to remind |
| remind_at | TIMESTAMP TZ | NULL | Calculated: due_date - offset |
| is_recurring | BOOLEAN | NOT NULL, DEFAULT false | Whether task repeats |
| recurrence_rule | VARCHAR(50) | NULL | DAILY, WEEKLY, MONTHLY, YEARLY, INTERVAL:N |
| parent_task_id | UUID | NULL, FK(task.id) | Links recurring instances |

## Enumerations

### TaskStatus
```python
class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
```

### TaskPriority
```python
class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
```

### RecurrenceRule (String Values)
```
DAILY      - Every day
WEEKLY     - Every 7 days
MONTHLY    - Every month (same day of month)
YEARLY     - Every year (same date)
INTERVAL:N - Every N days (e.g., INTERVAL:3)
```

## Validation Rules

### Tags
- Maximum 20 tags per task
- Each tag: 1-50 characters, alphanumeric + spaces + hyphens
- Case-insensitive for filtering (stored as-is)

### Reminder
- `reminder_offset_minutes` requires `due_date` to be set
- Valid values: 10, 30, 60, 1440, or any positive integer
- `remind_at` is auto-calculated, not user-provided

### Recurrence
- `recurrence_rule` requires `is_recurring = true`
- When completing recurring task, new task created with:
  - Same title, description, priority, tags
  - New due_date advanced by recurrence interval
  - `parent_task_id` = completed task's id
  - `is_recurring = true`, same `recurrence_rule`

## State Transitions

### Task Status
```
pending ──────► in_progress ──────► completed
   │                │                   │
   └────────────────┴───────────────────┘
         (any transition allowed)
```

### Recurring Task Flow
```
[Task A: recurring=true, status=pending]
           │
           │ Complete
           ▼
[Task A: status=completed] ──► [Task B: recurring=true, parent=A.id]
                                        │
                                        │ Complete
                                        ▼
                               [Task B: status=completed] ──► [Task C: ...]
```

## Indexes

### Existing
- `idx_task_user_id` on `user_id` - Filter by owner

### Recommended New
- `idx_task_status` on `status` - Filter by status
- `idx_task_priority` on `priority` - Filter by priority
- `idx_task_due_date` on `due_date` - Sort by due date
- `idx_task_tags` on `tags` (GIN) - Tag containment queries

## SQLModel Implementation

```python
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from enum import Enum


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Task(SQLModel, table=True):
    # Primary key
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Core fields
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: TaskStatus = Field(default=TaskStatus.pending)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    due_date: Optional[datetime] = Field(default=None)

    # Ownership
    user_id: str = Field(index=True, max_length=255)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # NEW: Tags (JSONB array)
    tags: list[str] = Field(default=[], sa_column=Column(JSONB))

    # NEW: Reminder
    reminder_offset_minutes: Optional[int] = Field(default=None)
    remind_at: Optional[datetime] = Field(default=None)

    # NEW: Recurrence
    is_recurring: bool = Field(default=False)
    recurrence_rule: Optional[str] = Field(default=None, max_length=50)
    parent_task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")
```

## Event Schemas

### TaskEvent (published to `task-events` topic)
```json
{
  "event_id": "uuid",
  "event_type": "task.created | task.updated | task.completed | task.deleted",
  "timestamp": "2026-02-08T12:00:00Z",
  "user_id": "user-123",
  "payload": {
    "id": "task-uuid",
    "title": "Task title",
    "description": "Description",
    "status": "pending",
    "priority": "high",
    "due_date": "2026-02-10T09:00:00Z",
    "tags": ["work", "urgent"],
    "reminder_offset_minutes": 60,
    "remind_at": "2026-02-10T08:00:00Z",
    "is_recurring": true,
    "recurrence_rule": "WEEKLY",
    "parent_task_id": null,
    "created_at": "2026-02-08T12:00:00Z",
    "updated_at": "2026-02-08T12:00:00Z"
  }
}
```

### ReminderEvent (published to `reminders` topic)
```json
{
  "event_id": "uuid",
  "event_type": "reminder.scheduled",
  "timestamp": "2026-02-08T12:00:00Z",
  "user_id": "user-123",
  "task_id": "task-uuid",
  "task_title": "Task title",
  "due_date": "2026-02-10T09:00:00Z",
  "remind_at": "2026-02-10T08:00:00Z"
}
```

## Migration Notes

Since the project uses `SQLModel.metadata.create_all()` rather than Alembic:

1. New columns will be added automatically on next app start
2. Existing rows will have NULL/default values for new columns
3. No explicit migration script needed
4. For production: Verify columns exist, run ALTER TABLE if needed

```sql
-- Manual verification/migration if needed
ALTER TABLE task ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_offset_minutes INTEGER;
ALTER TABLE task ADD COLUMN IF NOT EXISTS remind_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurrence_rule VARCHAR(50);
ALTER TABLE task ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES task(id);
```
