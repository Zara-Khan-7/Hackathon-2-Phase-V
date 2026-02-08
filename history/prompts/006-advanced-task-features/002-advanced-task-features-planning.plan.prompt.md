---
id: 002
title: Advanced Task Features Implementation Plan
stage: plan
date: 2026-02-08
surface: agent
model: claude-opus-4-5-20251101
feature: 006-advanced-task-features
branch: 006-advanced-task-features
user: user
command: /sp.plan
labels: ["implementation-plan", "backend", "frontend", "api-design", "event-driven", "recurring-tasks"]
links:
  spec: specs/006-advanced-task-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-advanced-task-features/plan.md
  - specs/006-advanced-task-features/research.md
  - specs/006-advanced-task-features/data-model.md
  - specs/006-advanced-task-features/quickstart.md
  - specs/006-advanced-task-features/contracts/task-api.yaml
tests:
  - N/A (planning phase, no tests)
---

## Prompt

```text
/sp.plan - Generate implementation plan for 006-advanced-task-features

Previous /sp.specify output included:
- Database schema updates (priority, tags JSONB, due_date, reminder_offset_minutes, is_recurring, recurrence_rule, parent_task_id)
- API endpoints (POST/PATCH tasks, PATCH complete, GET tasks with query params for search/filter/sort)
- Frontend form & list enhancements (priority selector, tag input, due/reminder/recurring controls, search bar, filter chips, sort dropdown)
- Event triggers for recurring completion and reminder scheduling

Technical Decisions:
1. Use SQLModel.metadata.create_all() for schema updates (no Alembic)
2. Backend sync FastAPI routes with SQLModel
3. Frontend Next.js 15, React 18, Tailwind CSS, Framer Motion
4. Event placeholders: publish_event() logs locally, Dapr integration later
5. Tags stored as JSONB array on Task table
6. Recurrence rules as simple string: DAILY, WEEKLY, MONTHLY, YEARLY, INTERVAL:N
7. Server-side search via SQL ILIKE
```

## Response snapshot

Created comprehensive implementation plan with 6 major artifacts:

**1. plan.md** - Main implementation plan including:
- Technical context (Python 3.11, TypeScript, SQLModel, Next.js 15)
- Constitution Check (all 7 principles PASS or deferred)
- Project structure (backend services layer, frontend components)
- Implementation phases (22 tasks across 6 groups)
- Risk analysis

**2. research.md** - 7 technical decisions documented:
- Tags: JSONB array storage
- Recurrence: Simple string enum format
- Reminders: offset_minutes + calculated remind_at
- Events: Placeholder function pattern
- Date picker: Native HTML5 datetime-local
- Search: Server-side SQL ILIKE
- SQLModel JSONB: Verified with sa_column

**3. data-model.md** - Complete entity specification:
- Task entity with 6 new fields
- Field constraints and validation rules
- State transitions for status and recurring flow
- TaskEvent and ReminderEvent schemas
- SQL migration commands for manual verification

**4. quickstart.md** - Developer setup guide:
- Backend/frontend setup steps
- Testing checklist for all 8 features
- API reference for new endpoints
- Troubleshooting guide

**5. contracts/task-api.yaml** - OpenAPI 3.0 specification:
- Enhanced POST/PUT /api/tasks endpoints
- New PATCH /api/tasks/{id}/complete endpoint
- Enhanced GET /api/tasks with query parameters
- TaskEvent and ReminderEvent schemas

**Implementation Groups Defined**:
- Group 1: Backend Model & Schema (T001-T002)
- Group 2: Backend Services (T003-T005)
- Group 3: Backend API (T006-T009)
- Group 4: Frontend Components (T010-T014)
- Group 5: Frontend Integration (T015-T019)
- Group 6: Testing & Polish (T020-T022)

**ADR Suggestion**: Event Publishing Placeholder Pattern detected

## Outcome

- ✅ Impact: High - Complete implementation roadmap for Phase V advanced features
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 5 created (plan.md, research.md, data-model.md, quickstart.md, task-api.yaml)
- 🔁 Next prompts: /sp.tasks to generate detailed task breakdown
- 🧠 Reflection: Plan is comprehensive and follows constitution principles for event-driven architecture

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution Check PASS - all 7 principles validated
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor JSONB performance with 500+ tasks
