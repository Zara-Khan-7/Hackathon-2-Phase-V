# Quickstart: Advanced Task Management Features

**Feature**: 006-advanced-task-features
**Date**: 2026-02-08

This guide helps developers quickly set up and test the advanced task management features.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon or local)
- Git

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

No new dependencies required - existing SQLModel and FastAPI handle all new features.

### 2. Configure Environment

Ensure `.env` has database connection:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DEBUG=true
JWT_SECRET=your-secret-key
```

### 3. Start Backend

```bash
uvicorn app.main:app --reload --port 8000
```

The app automatically creates/updates database schema on startup via `SQLModel.metadata.create_all()`.

### 4. Verify API

```bash
# Health check
curl http://localhost:8000/health

# Create task with new fields (requires JWT)
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test recurring task",
    "priority": "high",
    "tags": ["work", "urgent"],
    "due_date": "2026-02-10T09:00:00Z",
    "reminder_offset_minutes": 60,
    "is_recurring": true,
    "recurrence_rule": "WEEKLY"
  }'
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

If `date-fns` is not present (for relative time):
```bash
npm install date-fns
```

### 2. Configure Environment

Ensure `.env.local` has API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Frontend

```bash
npm run dev
```

Open http://localhost:3000

## Testing New Features

### 1. Priority Management

1. Create a new task
2. Select priority: Low, Medium, or High
3. Verify priority badge color displays correctly
4. Edit task, change priority, verify update

### 2. Tags

1. Create task with tags: type "work" and press Enter
2. Add another tag: "urgent"
3. Remove tag by clicking X
4. Verify tags display as colored pills

### 3. Due Dates

1. Set due date/time using date picker
2. Verify relative time display ("in 2 days")
3. Set past date, verify "Overdue" warning
4. Clear due date, verify indicator removed

### 4. Reminders

1. Set due date first
2. Select reminder: 1 hour before
3. Check backend logs for reminder event
4. Try setting reminder without due date (should fail)

### 5. Recurring Tasks

1. Create task with recurrence: Weekly
2. Mark task as completed
3. Verify new task created with advanced due date
4. Check new task has same title, priority, tags
5. Verify recurring icon displays

### 6. Search

1. Create several tasks with different titles
2. Type in search bar
3. Verify real-time filtering (debounced)
4. Clear search, verify all tasks return

### 7. Filters

1. Apply status filter: "Active"
2. Apply priority filter: "High"
3. Apply tag filter: click tag pill
4. Verify filters combine (AND logic)
5. Click "Clear Filters"

### 8. Sort

1. Click sort dropdown
2. Select "Due Date" + "Ascending"
3. Verify task order changes
4. Select "Priority" + "Descending"
5. Verify high priority tasks first

## API Endpoints Reference

### Create Task (with new fields)
```
POST /api/tasks
Body: {
  title, description, status, priority, due_date,
  tags[], reminder_offset_minutes, is_recurring, recurrence_rule
}
```

### Update Task
```
PUT /api/tasks/{id}
Body: Same as create (all optional)
```

### Complete Task (with recurring logic)
```
PATCH /api/tasks/{id}/complete
Response: { completed_task, next_task? }
```

### List Tasks (with query params)
```
GET /api/tasks?search=text&status=active&priority=high&tags=work,urgent&has_due_date=true&is_recurring=false&sort=due_date&order=asc
```

## Troubleshooting

### Database column errors

If you see "column does not exist" errors:

```sql
-- Run in PostgreSQL/Neon console
ALTER TABLE task ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE task ADD COLUMN IF NOT EXISTS reminder_offset_minutes INTEGER;
ALTER TABLE task ADD COLUMN IF NOT EXISTS remind_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE task ADD COLUMN IF NOT EXISTS recurrence_rule VARCHAR(50);
ALTER TABLE task ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES task(id);
```

### Frontend type errors

Ensure `types/task.ts` is updated with new fields. Run:

```bash
npm run build  # Catches type errors
```

### Event publishing not logging

Check backend is running with `DEBUG=true` and look for `[EVENT]` log entries.

## Event Topics

For Phase 5 Dapr/Kafka integration, events are published to:

| Topic | Event Types |
|-------|-------------|
| `task-events` | task.created, task.updated, task.completed, task.deleted |
| `reminders` | reminder.scheduled |

Currently these log locally. Replace `publish_event()` in `services/events.py` with Dapr HTTP calls when ready.
