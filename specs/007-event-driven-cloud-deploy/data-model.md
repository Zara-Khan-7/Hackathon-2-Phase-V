# Data Model: Event-Driven Cloud Deployment

**Feature**: 007-event-driven-cloud-deploy
**Date**: 2026-02-09
**Status**: Complete

## Entities

### 1. TaskEvent

Event published when any task operation occurs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_id | UUID | Yes | Unique event identifier |
| event_type | Enum | Yes | One of: task.created, task.updated, task.completed, task.deleted |
| timestamp | ISO8601 | Yes | Event timestamp in UTC |
| user_id | String | Yes | User ID from JWT |
| payload | Object | Yes | Full task data (see Task entity) |

**Event Types**:
- `task.created` - New task created
- `task.updated` - Task fields modified
- `task.completed` - Task status changed to completed
- `task.deleted` - Task removed

**Validation Rules**:
- event_id must be unique across all events
- timestamp must be valid ISO8601 format
- user_id must match authenticated user
- payload must contain valid Task object

---

### 2. ReminderEvent

Event published when a reminder is scheduled or triggered.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_id | UUID | Yes | Unique event identifier |
| event_type | Enum | Yes | One of: reminder.scheduled, reminder.triggered |
| timestamp | ISO8601 | Yes | Event timestamp in UTC |
| user_id | String | Yes | User ID from JWT |
| payload | Object | Yes | Reminder details |

**Payload Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| task_id | UUID | Yes | Associated task ID |
| task_title | String | Yes | Task title for notification |
| due_at | ISO8601 | No | Task due date |
| remind_at | ISO8601 | Yes | When to send reminder |

**Validation Rules**:
- remind_at must be in the future when scheduling
- task_id must reference existing task
- remind_at must be before or equal to due_at

---

### 3. AuditLogEntry

Immutable record of task events for compliance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Audit log entry ID |
| event_id | UUID | Yes | Original event ID (idempotency key) |
| event_type | String | Yes | Type of event recorded |
| user_id | String | Yes | User who triggered the event |
| task_id | UUID | Yes | Affected task ID |
| timestamp | ISO8601 | Yes | When event occurred |
| payload | JSONB | Yes | Full event payload |
| created_at | ISO8601 | Yes | When audit entry was created |

**State Transitions**: None (immutable, append-only)

**Validation Rules**:
- Entry cannot be modified after creation
- event_id must be unique (prevents duplicates)
- All fields are required

---

### 4. ScheduledJob

Represents a Dapr Jobs API scheduled reminder.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Job identifier: `reminder-{task_id}` |
| schedule | ISO8601 | Yes | When to execute (one-time) |
| data | Object | Yes | Callback payload |

**Data Payload**:
| Field | Type | Description |
|-------|------|-------------|
| task_id | UUID | Task to remind about |
| user_id | String | User to notify |

**State Transitions**:
- SCHEDULED → EXECUTED (successful)
- SCHEDULED → FAILED (error, will retry)
- SCHEDULED → CANCELLED (task deleted/updated)

---

### 5. IdempotencyRecord

Tracks processed events in Dapr state store.

| Field | Type | Description |
|-------|------|-------------|
| key | String | `processed:{event_id}` |
| value | String | "1" (marker) |
| ttl | Integer | 86400 seconds (24 hours) |

---

## Topic Schema

### task-events Topic

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TaskEvent",
  "type": "object",
  "required": ["event_id", "event_type", "timestamp", "user_id", "payload"],
  "properties": {
    "event_id": {
      "type": "string",
      "format": "uuid"
    },
    "event_type": {
      "type": "string",
      "enum": ["task.created", "task.updated", "task.completed", "task.deleted"]
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "user_id": {
      "type": "string"
    },
    "payload": {
      "type": "object",
      "required": ["id", "title", "status", "user_id"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "title": { "type": "string", "maxLength": 255 },
        "description": { "type": ["string", "null"] },
        "status": { "type": "string", "enum": ["pending", "in_progress", "completed"] },
        "priority": { "type": "string", "enum": ["low", "medium", "high"] },
        "due_date": { "type": ["string", "null"], "format": "date-time" },
        "user_id": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "is_recurring": { "type": "boolean" },
        "recurrence_rule": { "type": ["string", "null"] }
      }
    }
  }
}
```

### reminders Topic

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ReminderEvent",
  "type": "object",
  "required": ["event_id", "event_type", "timestamp", "user_id", "payload"],
  "properties": {
    "event_id": { "type": "string", "format": "uuid" },
    "event_type": { "type": "string", "enum": ["reminder.scheduled", "reminder.triggered"] },
    "timestamp": { "type": "string", "format": "date-time" },
    "user_id": { "type": "string" },
    "payload": {
      "type": "object",
      "required": ["task_id", "task_title", "remind_at"],
      "properties": {
        "task_id": { "type": "string", "format": "uuid" },
        "task_title": { "type": "string" },
        "due_at": { "type": ["string", "null"], "format": "date-time" },
        "remind_at": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

### task-updates Topic

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TaskUpdateEvent",
  "type": "object",
  "required": ["event_id", "event_type", "timestamp", "user_id", "task_id"],
  "properties": {
    "event_id": { "type": "string", "format": "uuid" },
    "event_type": { "type": "string", "enum": ["task.sync"] },
    "timestamp": { "type": "string", "format": "date-time" },
    "user_id": { "type": "string" },
    "task_id": { "type": "string", "format": "uuid" },
    "action": { "type": "string", "enum": ["created", "updated", "completed", "deleted"] }
  }
}
```

## Relationships

```
Task (existing) ──publishes──> TaskEvent
     │
     └── has ──> ScheduledJob (for reminders)

TaskEvent ──consumed by──> AuditLogEntry
TaskEvent ──consumed by──> RecurringTaskService (if is_recurring && completed)

ReminderEvent ──consumed by──> NotificationService

IdempotencyRecord ──prevents duplicate──> Event processing
```

## Database Changes

### New Table: audit_log

```sql
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE,
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    task_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_task_id ON audit_log(task_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
```

**Note**: This table is owned by the Audit Service and stored in the same Neon PostgreSQL database.
