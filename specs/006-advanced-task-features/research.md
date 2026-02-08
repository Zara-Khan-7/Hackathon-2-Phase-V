# Research: Advanced Task Management Features

**Feature**: 006-advanced-task-features
**Date**: 2026-02-08
**Status**: Complete

## Research Summary

This document captures research findings and technical decisions made during planning phase for the advanced task management features.

---

## 1. Tags Storage Strategy

### Question
How should we store multiple tags per task in PostgreSQL?

### Research Findings

| Approach | Pros | Cons |
|----------|------|------|
| JSONB Array | Simple, efficient containment queries, no joins | Less normalized, harder to enforce uniqueness |
| Many-to-Many Table | Normalized, tag reuse, easy autocomplete | Join complexity, more migrations |
| TEXT (comma-separated) | Simplest storage | Poor query capabilities, parsing overhead |

### Decision
**JSONB Array** on the Task table (`tags: list[str]`)

PostgreSQL JSONB provides:
- `@>` containment operator for filtering: `tags @> '["work"]'`
- GIN index support for performance
- Native SQLModel mapping with `sa_column=Column(JSONB)`

### Implementation
```python
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

tags: list[str] = Field(default=[], sa_column=Column(JSONB))
```

---

## 2. Recurrence Rule Format

### Question
What format should we use for storing recurrence patterns?

### Research Findings

| Format | Pros | Cons |
|--------|------|------|
| iCal RRULE (RFC 5545) | Industry standard, full flexibility | Complex parsing, overkill for MVP |
| Simple Enum String | Easy to parse, readable | Limited patterns |
| JSON Object | Flexible, structured | Custom format, no standard |

### Decision
**Simple String Enum** with custom interval support

Format: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, `INTERVAL:N`

Examples:
- `DAILY` - Every day
- `WEEKLY` - Every 7 days
- `MONTHLY` - Every month (same day)
- `YEARLY` - Every year (same date)
- `INTERVAL:3` - Every 3 days

### Parsing Logic
```python
def parse_recurrence(rule: str) -> int:
    """Returns interval in days."""
    if rule == "DAILY": return 1
    if rule == "WEEKLY": return 7
    if rule == "MONTHLY": return 30  # Approximate
    if rule == "YEARLY": return 365
    if rule.startswith("INTERVAL:"):
        return int(rule.split(":")[1])
    return 0
```

---

## 3. Reminder Implementation

### Question
How should reminders be stored and triggered?

### Research Findings

The constitution requires Dapr Jobs API for precise scheduling. For Phase 5 MVP:
1. Store reminder preference as offset in minutes
2. Calculate `remind_at` timestamp on task create/update
3. Publish reminder event for future scheduler consumption

### Decision
Store `reminder_offset_minutes: int` and calculate `remind_at: datetime`

Common offsets:
- 10 minutes = 10
- 30 minutes = 30
- 1 hour = 60
- 1 day = 1440

### Calculation
```python
def calculate_remind_at(due_date: datetime, offset_minutes: int) -> datetime:
    return due_date - timedelta(minutes=offset_minutes)
```

---

## 4. Event Publishing Pattern

### Question
How to publish events without Dapr dependency for local development?

### Research Findings

Options:
1. Direct Dapr HTTP calls - Requires sidecar running
2. Dapr SDK with fallback - SDK dependency, complex setup
3. Placeholder function with logging - Simple, no dependencies

### Decision
**Placeholder function** that logs events, easily replaced with Dapr HTTP calls later.

```python
import logging
from uuid import uuid4
from datetime import datetime

logger = logging.getLogger(__name__)

def publish_event(topic: str, event_type: str, user_id: str, payload: dict):
    """
    Publish event to message bus.
    Currently logs for local dev. Replace with Dapr HTTP calls for Phase 5.
    """
    event = {
        "event_id": str(uuid4()),
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "payload": payload
    }
    logger.info(f"[EVENT] topic={topic} type={event_type} id={event['event_id']}")
    logger.debug(f"[EVENT_PAYLOAD] {event}")
    return event
```

Future Dapr integration:
```python
import httpx

DAPR_PORT = os.getenv("DAPR_HTTP_PORT", "3500")

async def publish_event(topic: str, event_type: str, user_id: str, payload: dict):
    event = {...}  # Same as above
    async with httpx.AsyncClient() as client:
        await client.post(
            f"http://localhost:{DAPR_PORT}/v1.0/publish/pubsub/{topic}",
            json=event
        )
    return event
```

---

## 5. Frontend Date/Time Picker

### Question
What component should we use for date and time selection?

### Research Findings

| Component | Pros | Cons |
|-----------|------|------|
| Native `datetime-local` | No deps, full date+time | Browser-dependent styling |
| react-datepicker | Rich features, customizable | New dependency |
| shadcn Calendar | Beautiful, consistent | Date only, time needs extra |

### Decision
**Native HTML5 `<input type="datetime-local">`** with Tailwind styling

Rationale:
- Matches existing Input component patterns
- No new dependencies
- Provides date and time in single control
- Can upgrade later if needed

### Implementation
```tsx
<Input
  type="datetime-local"
  value={dueDate}
  onChange={(e) => setDueDate(e.target.value)}
  className="..."
/>
```

---

## 6. Search Implementation

### Question
Should search be client-side or server-side?

### Research Findings

| Approach | Pros | Cons |
|----------|------|------|
| Client-side (JS filter) | Fast for small lists, no API calls | Doesn't scale, loaded data |
| Server-side (SQL ILIKE) | Scales, works with pagination | Network latency |
| Full-text (tsvector) | Best relevance ranking | Complex setup, overkill |

### Decision
**Server-side search** using PostgreSQL `ILIKE` on title and description

```python
from sqlmodel import select, or_

def search_tasks(query: str):
    search_pattern = f"%{query}%"
    statement = select(Task).where(
        or_(
            Task.title.ilike(search_pattern),
            Task.description.ilike(search_pattern)
        )
    )
    return session.exec(statement).all()
```

Performance: ILIKE is efficient for moderate data sizes (< 10k tasks per user). Can add GIN trigram index later if needed.

---

## 7. SQLModel JSONB Support

### Question
Does SQLModel properly support PostgreSQL JSONB columns?

### Research Findings

SQLModel (built on SQLAlchemy) supports JSONB via `sa_column` parameter:

```python
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

class Task(SQLModel, table=True):
    tags: list[str] = Field(default=[], sa_column=Column(JSONB))
```

**Verified**: This pattern works with Neon PostgreSQL.

Query for containment:
```python
from sqlalchemy import text

# Find tasks with "work" tag
statement = select(Task).where(
    Task.tags.op("@>")(text("'[\"work\"]'"))
)
```

---

## Conclusion

All technical decisions have been validated. No blocking issues identified. Ready to proceed with implementation tasks.
