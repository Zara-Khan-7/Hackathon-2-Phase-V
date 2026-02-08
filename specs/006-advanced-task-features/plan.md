# Implementation Plan: Advanced Task Management Features

**Branch**: `006-advanced-task-features` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-advanced-task-features/spec.md`

## Summary

Implement advanced task management features including priorities, tags, due dates, reminders, recurring tasks, and list controls (search/filter/sort). The backend will extend the existing Task model and API to support new fields and query parameters, with event publishing placeholders for future Dapr/Kafka integration. The frontend will enhance the existing TaskForm and TaskCard components with new controls while adding a comprehensive filter/search/sort UI.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Pydantic (Backend); Next.js 15, React 18, Tailwind CSS, Framer Motion (Frontend)
**Storage**: Neon PostgreSQL via SQLModel ORM
**Testing**: pytest (Backend), manual testing (Frontend - no test setup detected)
**Target Platform**: Linux containers (Docker), local dev on Windows
**Project Type**: Web application (backend + frontend)
**Performance Goals**: <2s task list render for 100 tasks, <500ms search response
**Constraints**: No Alembic migrations (uses SQLModel.metadata.create_all), sync SQLModel (not async)
**Scale/Scope**: Single-user tasks, 500+ tasks per user supported

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Agentic Dev Stack Workflow | PASS | All code generated via Claude Code, PHR documented |
| II. Event-Driven Architecture | PASS | Event publish placeholders ready for Dapr integration |
| III. Dapr-Native Runtime | PASS (Deferred) | Placeholder `publish_event()` now, Dapr HTTP calls later |
| IV. Dual Deployment Strategy | PASS | No deployment changes required for this feature |
| V. Kafka-Centric Messaging | PASS (Deferred) | Event schemas defined, topics specified, integration later |
| VI. Cost-Optimized Stack | PASS | No new paid dependencies |
| VII. Observability | PASS | Existing logging patterns maintained, structured logs |

**Gate Result**: PASS - All principles satisfied or acceptably deferred for Phase 5 integration.

## Project Structure

### Documentation (this feature)

```text
specs/006-advanced-task-features/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 research findings
├── data-model.md        # Entity definitions
├── quickstart.md        # Developer setup guide
├── contracts/           # API contracts (OpenAPI)
│   └── task-api.yaml    # Task endpoints specification
└── tasks.md             # Task breakdown (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   └── task.py          # Enhanced Task model
│   ├── schemas/
│   │   └── task.py          # Updated request/response schemas
│   ├── routers/
│   │   └── tasks.py         # Enhanced API endpoints
│   ├── services/            # NEW: Business logic
│   │   ├── __init__.py
│   │   ├── recurring.py     # Recurrence calculation
│   │   ├── reminder.py      # Reminder scheduling
│   │   └── events.py        # Event publishing placeholder
│   └── database.py          # Unchanged (create_all handles new fields)
└── tests/
    └── test_tasks.py        # API and logic tests

frontend/
├── src/
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── task-form.tsx      # Enhanced with new fields
│   │   │   ├── task-card.tsx      # Enhanced with tags, recurring icon
│   │   │   ├── task-list.tsx      # Enhanced with search/filter/sort
│   │   │   ├── task-filters.tsx   # Enhanced filter controls
│   │   │   ├── tag-input.tsx      # NEW: Tag input component
│   │   │   ├── reminder-select.tsx # NEW: Reminder dropdown
│   │   │   └── recurrence-picker.tsx # NEW: Recurrence controls
│   │   └── ui/
│   │       ├── badge.tsx          # NEW: Tag/priority badge
│   │       └── date-time-picker.tsx # NEW: Date+time selection
│   ├── types/
│   │   └── task.ts           # Extended Task types
│   └── lib/
│       └── api.ts            # API client updates
└── package.json              # Add date-fns if needed
```

**Structure Decision**: Web application pattern with separate backend/frontend directories. Services layer added to backend for business logic separation per event-driven principles.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Approach | Rationale |
|--------|----------|-----------|
| Tags Storage | JSONB array on Task | Simplest approach, avoids join table complexity |
| Recurrence Rules | Simple string enum | DAILY/WEEKLY/MONTHLY/YEARLY covers 90% of use cases |
| Event Publishing | Placeholder function | Decouples from Dapr until Phase 5 integration |
| Frontend State | Local React state | No complex state management needed for filters |

---

## Phase 0: Research Findings

### Decision 1: Tags Storage Strategy

**Decision**: Store tags as JSONB array column on tasks table (`tags: list[str]`)

**Rationale**:
- PostgreSQL JSONB provides efficient array operations (containment queries)
- No join table complexity for MVP
- Easy migration to normalized table later if needed
- SQLModel supports `list[str]` with `sa_column` for JSONB

**Alternatives Considered**:
- Separate `tags` table with many-to-many → More complex, premature optimization
- Comma-separated string → Limited query capabilities

### Decision 2: Recurrence Rule Format

**Decision**: Simple string enum format: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, `INTERVAL:N` (N days)

**Rationale**:
- Covers majority of user needs
- Easy to parse and calculate next occurrence
- Avoids iCal RRULE complexity for MVP
- Can extend to RRULE later if needed

**Alternatives Considered**:
- Full RRULE (RFC 5545) → Overly complex for MVP
- Custom JSON structure → Less portable

### Decision 3: Reminder Implementation

**Decision**: Store `reminder_offset_minutes` and calculate `remind_at` timestamp on write

**Rationale**:
- Simple integer storage (10, 30, 60, 1440 for 10min/30min/1hr/1day)
- `remind_at = due_date - timedelta(minutes=offset)` calculated on create/update
- Publish event with `remind_at` for future scheduler consumption

**Alternatives Considered**:
- Store remind_at directly → Less flexible for recalculation
- Multiple reminder times → Out of scope for MVP

### Decision 4: Event Publishing Pattern

**Decision**: Create `publish_event(topic: str, payload: dict)` function that logs events now, easily replaced with Dapr HTTP calls later

**Rationale**:
- Decouples business logic from infrastructure
- Single point of change for Dapr integration
- Enables local testing without Kafka

**Alternatives Considered**:
- Direct Dapr HTTP calls → Requires Dapr sidecar for local dev
- Message queue abstraction → Over-engineering for current phase

### Decision 5: Frontend Date/Time Picker

**Decision**: Use native HTML5 `<input type="datetime-local">` with custom styling

**Rationale**:
- No additional dependencies
- Full date+time in single control
- Consistent with existing Input component patterns
- Can upgrade to react-datepicker later if needed

**Alternatives Considered**:
- react-datepicker → Adds dependency, styling complexity
- shadcn Calendar → Good for date-only, time selection extra work

### Decision 6: Search Implementation

**Decision**: Server-side search via SQL `ILIKE` on title and description

**Rationale**:
- Consistent filtering behavior
- Works with pagination (future)
- PostgreSQL ILIKE is efficient for moderate data sizes

**Alternatives Considered**:
- Client-side search → Doesn't scale with many tasks
- Full-text search (tsvector) → Overly complex for MVP

---

## Phase 1: Data Model

### Task Entity (Enhanced)

```python
class Task(SQLModel, table=True):
    # Existing fields
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: TaskStatus = Field(default=TaskStatus.pending)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    due_date: Optional[datetime] = Field(default=None)
    user_id: str = Field(index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # NEW fields
    tags: list[str] = Field(default=[], sa_column=Column(JSONB))
    reminder_offset_minutes: Optional[int] = Field(default=None)
    remind_at: Optional[datetime] = Field(default=None)  # Calculated
    is_recurring: bool = Field(default=False)
    recurrence_rule: Optional[str] = Field(default=None)  # DAILY, WEEKLY, etc.
    parent_task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")
```

### TaskEvent Schema

```python
class TaskEvent(BaseModel):
    event_id: str  # UUID
    event_type: str  # task.created, task.updated, task.completed, task.deleted
    timestamp: datetime
    user_id: str
    payload: dict  # Full task data
```

### ReminderEvent Schema

```python
class ReminderEvent(BaseModel):
    event_id: str
    event_type: str = "reminder.scheduled"
    timestamp: datetime
    user_id: str
    task_id: str
    task_title: str
    due_date: datetime
    remind_at: datetime
```

---

## Phase 1: API Contracts

### POST /api/tasks (Create Task)

**Request Body** (enhanced):
```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string (optional, max 2000 chars)",
  "status": "pending | in_progress | completed",
  "priority": "low | medium | high",
  "due_date": "ISO datetime (optional)",
  "tags": ["string array (optional)"],
  "reminder_offset_minutes": "integer (optional, e.g., 10, 30, 60, 1440)",
  "is_recurring": "boolean (default false)",
  "recurrence_rule": "DAILY | WEEKLY | MONTHLY | YEARLY | INTERVAL:N (optional)"
}
```

**Response**: Task object with all fields + `remind_at` calculated

**Events Published**: `task-events` with `task.created`

---

### PATCH /api/tasks/{id} (Update Task)

**Request Body**: Same as POST (all fields optional for partial update)

**Response**: Updated Task object

**Events Published**: `task-events` with `task.updated`

---

### PATCH /api/tasks/{id}/complete (Complete Task)

**Request Body**: None

**Response**: Completed Task object + next occurrence if recurring

**Behavior**:
1. Set status to `completed`
2. If `is_recurring=true`: Create next task instance with advanced `due_date`
3. Return both completed task and new task (if created)

**Events Published**:
- `task-events` with `task.completed`
- `task-events` with `task.created` (for recurring next instance)

---

### GET /api/tasks (List Tasks with Query)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Full-text search on title, description |
| status | enum | all, active, completed |
| priority | enum | low, medium, high |
| tags | string | Comma-separated tag names |
| has_due_date | boolean | true/false |
| is_recurring | boolean | true/false |
| sort | enum | created_at, due_date, priority, title |
| order | enum | asc, desc |

**Response**: Array of Task objects matching criteria

---

## Phase 1: Frontend Components

### New Components Required

1. **TagInput** (`tag-input.tsx`)
   - Multi-value input with add/remove
   - Pills display with X button
   - Optional autocomplete from existing tags

2. **ReminderSelect** (`reminder-select.tsx`)
   - Dropdown: None, 10 min, 30 min, 1 hour, 1 day, Custom
   - Disabled when no due_date set

3. **RecurrencePicker** (`recurrence-picker.tsx`)
   - Toggle to enable/disable
   - Dropdown: Daily, Weekly, Monthly, Yearly, Custom interval
   - Custom shows number input for days

4. **DateTimePicker** (`date-time-picker.tsx`)
   - Combines date and time selection
   - Uses native datetime-local with styling

### Enhanced Components

1. **TaskForm** - Add fields for tags, reminder, recurrence
2. **TaskCard** - Display tags as pills, recurring icon, enhanced due date
3. **TaskList** - Integrate search/filter/sort controls
4. **TaskFilters** - Full filter panel with all criteria

---

## Quickstart Guide

### Backend Setup

```bash
cd backend
pip install -r requirements.txt  # No new deps needed
# SQLModel.metadata.create_all() handles schema updates on app start
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install date-fns  # For relative time formatting (if not present)
npm run dev
```

### Testing New Features

1. Create task with all new fields via API or UI
2. Verify tags display as pills
3. Set due date + reminder, verify remind_at calculated
4. Create recurring task, complete it, verify next occurrence created
5. Test search with various terms
6. Apply filters, verify correct results
7. Change sort order, verify list updates

---

## Implementation Phases

### Group 1: Backend Model & Schema (Foundation)
- T001: Add new fields to Task model
- T002: Update TaskCreate/TaskUpdate/TaskResponse schemas

### Group 2: Backend Services (Business Logic)
- T003: Implement recurring.py - next occurrence calculation
- T004: Implement reminder.py - remind_at calculation
- T005: Implement events.py - publish_event placeholder

### Group 3: Backend API (Endpoints)
- T006: Update POST /api/tasks with new fields + events
- T007: Update PATCH /api/tasks/{id} with new fields + events
- T008: Implement PATCH /api/tasks/{id}/complete with recurring logic
- T009: Enhance GET /api/tasks with query parameters

### Group 4: Frontend Components (New)
- T010: Create TagInput component
- T011: Create ReminderSelect component
- T012: Create RecurrencePicker component
- T013: Create/enhance DateTimePicker component
- T014: Create Badge component for tags

### Group 5: Frontend Integration (Enhanced)
- T015: Update Task types with new fields
- T016: Enhance TaskForm with new field controls
- T017: Enhance TaskCard with tags, recurring indicator
- T018: Enhance TaskFilters with all filter options
- T019: Enhance TaskList with search and sort

### Group 6: Testing & Polish
- T020: Write backend pytest tests
- T021: Manual E2E testing
- T022: Update API documentation

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SQLModel JSONB issues | Low | Medium | Test early, fallback to TEXT with JSON parsing |
| Recurring date calculation edge cases | Medium | Medium | Comprehensive test cases for DST, month-end |
| Filter query performance | Low | Low | Add indexes on priority, status if needed |
| Frontend state complexity | Low | Low | Keep state local, avoid prop drilling |

---

## ADR Suggestion

📋 Architectural decision detected: **Event Publishing Placeholder Pattern**
The decision to implement a `publish_event()` function that logs events locally before Dapr integration affects the entire event-driven architecture.

Document reasoning and tradeoffs? Run `/sp.adr event-publishing-placeholder`
