---
id: 003
title: Advanced Task Features Task Breakdown
stage: tasks
date: 2026-02-08
surface: agent
model: claude-opus-4-5-20251101
feature: 006-advanced-task-features
branch: 006-advanced-task-features
user: user
command: /sp.tasks
labels: ["task-breakdown", "implementation-tasks", "user-stories", "phased-execution"]
links:
  spec: specs/006-advanced-task-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-advanced-task-features/tasks.md
tests:
  - N/A (task generation phase, no tests)
---

## Prompt

```text
/sp.tasks - Generate detailed task breakdown for 006-advanced-task-features

Previous /sp.plan output included:
- 22 tasks across 6 implementation groups
- Backend services layer (recurring.py, reminder.py, events.py)
- Frontend components (TagInput, ReminderSelect, RecurrencePicker, DateTimePicker, Badge)
- API enhancements (query params for search/filter/sort, PATCH /complete)

Organization request:
- One phase per user story (in priority order from spec.md)
- Format: [ID] [P?] [Story] Description with exact file paths
```

## Response snapshot

Created comprehensive tasks.md with 76 tasks organized across 11 phases:

**Phase 1: Setup (4 tasks)**
- Services directory structure
- Event, recurring, reminder service modules

**Phase 2: Foundational - BLOCKING (8 tasks)**
- Task model enhancements (6 new fields)
- Schema updates (TaskCreate, TaskUpdate, TaskResponse, CompleteTaskResponse)
- TypeScript interface updates
- date-fns dependency

**Phase 3: US1 Priority - P1 MVP (5 tasks)**
- Badge component, priority display on TaskCard
- Event publishing for priority changes

**Phase 4: US2 Tags - P1 MVP (6 tasks)**
- TagInput component
- Tags as colored pills on TaskCard
- JSONB handling in backend

**Phase 5: US3 Due Dates - P2 (5 tasks)**
- DateTimePicker component
- Relative time display, overdue styling

**Phase 6: US4 Reminders - P2 (7 tasks)**
- ReminderSelect component
- remind_at calculation
- reminder.scheduled event publishing

**Phase 7: US6 Search - P2 (5 tasks)**
- ILIKE search on title/description
- Debounced search input

**Phase 8: US7 Filter - P2 (11 tasks)**
- Status, priority, tags, has_due_date, is_recurring filters
- TaskFilters component with AND logic

**Phase 9: US5 Recurring - P3 (11 tasks)**
- Recurrence parsing and next due date calculation
- PATCH /complete endpoint with recurring logic
- parent_task_id linking

**Phase 10: US8 Sort - P3 (7 tasks)**
- Sort by created_at, due_date, priority, title
- Ascending/descending toggle

**Phase 11: Polish (7 tasks)**
- Event publishing integration
- Loading states, error handling
- Quickstart validation

**Execution Strategy Defined**:
- MVP: US1 + US2 (Priority + Tags)
- Incremental: Add features in priority order
- Parallel opportunities identified for each phase

## Outcome

- ✅ Impact: High - Complete task breakdown enabling parallel development and incremental delivery
- 🧪 Tests: N/A (task generation phase)
- 📁 Files: 1 created (tasks.md with 76 tasks)
- 🔁 Next prompts: /sp.implement to begin task execution, or cherry-pick specific phases
- 🧠 Reflection: Tasks organized by user story enables MVP delivery of P1 features first

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Task structure PASS - all user stories mapped, dependencies documented
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Track actual implementation time per task for future estimation
