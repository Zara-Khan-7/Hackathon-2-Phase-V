# Tasks: Advanced Task Management Features

**Feature**: 006-advanced-task-features | **Date**: 2026-02-08 | **Branch**: `006-advanced-task-features`
**Input**: Design documents from `/specs/006-advanced-task-features/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/task-api.yaml ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` (models, schemas, routers, services)
- **Frontend**: `frontend/src/` (components, types, lib)
- **Tests**: `backend/tests/`, manual E2E for frontend

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and service layer structure

- [x] T001 Create services directory structure in `backend/app/services/__init__.py`
- [x] T002 [P] Create events placeholder service in `backend/app/services/events.py`
- [x] T003 [P] Create recurring service module in `backend/app/services/recurring.py`
- [x] T004 [P] Create reminder service module in `backend/app/services/reminder.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model and schema changes that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add new fields to Task model (tags, reminder_offset_minutes, remind_at, is_recurring, recurrence_rule, parent_task_id) in `backend/app/models/task.py`
- [x] T006 Add JSONB import and sa_column for tags field in `backend/app/models/task.py`
- [x] T007 Update TaskCreate schema with new optional fields in `backend/app/schemas/task.py`
- [x] T008 Update TaskUpdate schema with new optional fields in `backend/app/schemas/task.py`
- [x] T009 Update TaskResponse schema with all new fields including remind_at in `backend/app/schemas/task.py`
- [x] T010 Create CompleteTaskResponse schema for recurring completion in `backend/app/schemas/task.py`
- [x] T011 Update Task TypeScript interface with new fields in `frontend/src/types/task.ts`
- [x] T012 [P] Install date-fns dependency for relative time formatting in `frontend/package.json`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Set Task Priority (Priority: P1) 🎯 MVP

**Goal**: Users can assign and visualize priority levels on tasks

**Independent Test**: Create task with priority, verify badge color displays, edit priority and verify update

### Implementation for User Story 1

- [x] T013 [P] [US1] Verify TaskPriority enum exists with low/medium/high in `backend/app/models/task.py`
- [x] T014 [P] [US1] Create Badge component for priority display in `frontend/src/components/ui/badge.tsx`
- [x] T015 [US1] Ensure priority field in TaskForm has proper styling in `frontend/src/components/tasks/task-form.tsx`
- [x] T016 [US1] Display priority badge on TaskCard with color coding (high=red, medium=yellow, low=green) in `frontend/src/components/tasks/task-card.tsx`
- [x] T017 [US1] Publish task.updated event when priority changes in `backend/app/routers/tasks.py`

**Checkpoint**: Priority management fully functional - users can set/view/change task priorities

---

## Phase 4: User Story 2 - Organize Tasks with Tags (Priority: P1) 🎯 MVP

**Goal**: Users can add, display, and remove multiple tags per task

**Independent Test**: Create task with tags, view tag pills on task card, remove a tag during edit

### Implementation for User Story 2

- [x] T018 [P] [US2] Create TagInput component with add/remove functionality in `frontend/src/components/tasks/tag-input.tsx`
- [x] T019 [US2] Integrate TagInput into TaskForm in `frontend/src/components/tasks/task-form.tsx`
- [x] T020 [US2] Display tags as colored pills on TaskCard in `frontend/src/components/tasks/task-card.tsx`
- [x] T021 [US2] Validate tags array in backend (max 20 tags, max 50 chars each) in `backend/app/schemas/task.py`
- [x] T022 [US2] Handle tags JSONB in create task endpoint in `backend/app/routers/tasks.py`
- [x] T023 [US2] Handle tags JSONB in update task endpoint in `backend/app/routers/tasks.py`

**Checkpoint**: Tag management fully functional - users can categorize tasks with tags

---

## Phase 5: User Story 3 - Set Due Dates (Priority: P2)

**Goal**: Users can set due dates and see relative time/overdue indicators

**Independent Test**: Set due date, verify relative time display, set past date and verify overdue warning

### Implementation for User Story 3

- [x] T024 [P] [US3] Create DateTimePicker component using datetime-local input in `frontend/src/components/ui/date-time-picker.tsx`
- [x] T025 [US3] Integrate DateTimePicker into TaskForm for due_date in `frontend/src/components/tasks/task-form.tsx`
- [x] T026 [US3] Display relative time (using date-fns formatDistanceToNow) on TaskCard in `frontend/src/components/tasks/task-card.tsx`
- [x] T027 [US3] Add overdue styling (red color/warning) for past due dates on TaskCard in `frontend/src/components/tasks/task-card.tsx`
- [x] T028 [US3] Validate due_date ISO format in backend schemas in `backend/app/schemas/task.py`

**Checkpoint**: Due date management fully functional - users can track deadlines

---

## Phase 6: User Story 4 - Set Reminders (Priority: P2)

**Goal**: Users can set reminders relative to due dates, system publishes reminder events

**Independent Test**: Set due date + reminder, verify remind_at calculated, check backend logs for reminder event

**Dependency**: Requires US3 (Due Dates) to be complete

### Implementation for User Story 4

- [x] T029 [P] [US4] Implement calculate_remind_at function in `backend/app/services/reminder.py`
- [x] T030 [P] [US4] Create ReminderSelect dropdown component in `frontend/src/components/tasks/reminder-select.tsx`
- [x] T031 [US4] Integrate ReminderSelect into TaskForm (disabled when no due_date) in `frontend/src/components/tasks/task-form.tsx`
- [x] T032 [US4] Calculate remind_at on task create when reminder_offset_minutes provided in `backend/app/routers/tasks.py`
- [x] T033 [US4] Calculate remind_at on task update when reminder or due_date changes in `backend/app/routers/tasks.py`
- [x] T034 [US4] Publish reminder.scheduled event when remind_at is set in `backend/app/services/events.py`
- [x] T035 [US4] Validate reminder requires due_date in backend in `backend/app/schemas/task.py`

**Checkpoint**: Reminder management fully functional - events published for scheduler consumption

---

## Phase 7: User Story 6 - Search Tasks (Priority: P2)

**Goal**: Users can search tasks by title and description with real-time results

**Independent Test**: Enter search term, verify matching tasks displayed, clear search and verify all tasks return

### Implementation for User Story 6

- [x] T036 [P] [US6] Add search query parameter support to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T037 [US6] Implement ILIKE search on title and description in `backend/app/routers/tasks.py`
- [x] T038 [US6] Add search input to TaskList header in `frontend/src/components/tasks/task-list.tsx`
- [x] T039 [US6] Implement debounced search (300ms) with API call in `frontend/src/components/tasks/task-list.tsx`
- [x] T040 [US6] Display empty state when no search results in `frontend/src/components/tasks/task-list.tsx`

**Checkpoint**: Search fully functional - users can quickly find tasks

---

## Phase 8: User Story 7 - Filter Tasks (Priority: P2)

**Goal**: Users can filter tasks by status, priority, tags, due date presence, and recurring status

**Independent Test**: Apply status filter, apply priority filter, apply tag filter, verify filters combine with AND logic

### Implementation for User Story 7

- [x] T041 [P] [US7] Add status filter parameter (all/active/completed) to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T042 [P] [US7] Add priority filter parameter to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T043 [P] [US7] Add tags filter parameter (comma-separated) to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T044 [P] [US7] Add has_due_date boolean filter to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T045 [P] [US7] Add is_recurring boolean filter to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T046 [US7] Combine multiple filter criteria with AND logic in query builder in `backend/app/routers/tasks.py`
- [x] T047 [US7] Create TaskFilters component with status, priority dropdowns in `frontend/src/components/tasks/task-filters.tsx`
- [x] T048 [US7] Add tag filter chips to TaskFilters in `frontend/src/components/tasks/task-filters.tsx`
- [x] T049 [US7] Add has_due_date and is_recurring toggle filters in `frontend/src/components/tasks/task-filters.tsx`
- [x] T050 [US7] Integrate TaskFilters into TaskList with state management in `frontend/src/app/(protected)/dashboard/page.tsx`
- [x] T051 [US7] Add "Clear Filters" button to TaskFilters in `frontend/src/components/tasks/task-filters.tsx`

**Checkpoint**: Filtering fully functional - users can focus on relevant task subsets

---

## Phase 9: User Story 5 - Create Recurring Tasks (Priority: P3)

**Goal**: Users can create recurring tasks that auto-generate next occurrence on completion

**Independent Test**: Create recurring task, complete it, verify next occurrence created with advanced due date

### Implementation for User Story 5

- [x] T052 [P] [US5] Implement parse_recurrence_rule function (DAILY/WEEKLY/MONTHLY/YEARLY/INTERVAL:N) in `backend/app/services/recurring.py`
- [x] T053 [P] [US5] Implement calculate_next_due_date function in `backend/app/services/recurring.py`
- [x] T054 [P] [US5] Create RecurrencePicker component with toggle and pattern dropdown in `frontend/src/components/tasks/recurrence-picker.tsx`
- [x] T055 [US5] Integrate RecurrencePicker into TaskForm in `frontend/src/components/tasks/task-form.tsx`
- [x] T056 [US5] Create PATCH /api/tasks/{id}/complete endpoint in `backend/app/routers/tasks.py`
- [x] T057 [US5] Implement recurring logic: create next occurrence when is_recurring=true in `backend/app/routers/tasks.py`
- [x] T058 [US5] Set parent_task_id on new occurrence linking to completed task in `backend/app/routers/tasks.py`
- [x] T059 [US5] Publish task.completed and task.created events for recurring completion in `backend/app/routers/tasks.py`
- [x] T060 [US5] Display recurring indicator icon on TaskCard in `frontend/src/components/tasks/task-card.tsx`
- [x] T061 [US5] Validate recurrence_rule requires is_recurring=true in backend in `backend/app/schemas/task.py`
- [x] T062 [US5] Update frontend complete action to call PATCH /complete endpoint in `frontend/src/lib/api.ts`

**Checkpoint**: Recurring tasks fully functional - routine work auto-regenerates

---

## Phase 10: User Story 8 - Sort Tasks (Priority: P3)

**Goal**: Users can sort task list by created date, due date, priority, or title

**Independent Test**: Select sort by due date ascending, verify order, toggle to descending, verify reverse

### Implementation for User Story 8

- [x] T063 [P] [US8] Add sort parameter (created_at/due_date/priority/title) to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T064 [P] [US8] Add order parameter (asc/desc) to GET /api/tasks in `backend/app/routers/tasks.py`
- [x] T065 [US8] Implement sort with nulls last for due_date in query builder in `backend/app/routers/tasks.py`
- [x] T066 [US8] Implement priority sort with high > medium > low ordering in `backend/app/routers/tasks.py`
- [x] T067 [US8] Add sort dropdown to TaskFilters in `frontend/src/components/tasks/task-filters.tsx`
- [x] T068 [US8] Add order toggle (asc/desc) button next to sort dropdown in `frontend/src/components/tasks/task-filters.tsx`
- [x] T069 [US8] Integrate sort/order params into API call in `frontend/src/app/(protected)/dashboard/page.tsx`

**Checkpoint**: Sorting fully functional - users can organize task view flexibly

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T070 [P] Implement publish_event with proper event structure in `backend/app/services/events.py`
- [x] T071 [P] Add structured logging for all event publications in `backend/app/services/events.py`
- [x] T072 Wire events.publish_event into all task CRUD operations in `backend/app/routers/tasks.py`
- [x] T073 [P] Add loading states to TaskFilters during search/filter/sort in `frontend/src/components/tasks/task-filters.tsx`
- [x] T074 [P] Add error handling for API failures in task operations in `frontend/src/lib/api.ts`
- [ ] T075 Run quickstart.md validation - test all 8 feature areas manually
- [x] T076 Verify SQLModel.metadata.create_all() adds new columns on app start (verified in main.py lifespan)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 Priority (Phase 3)**: Depends on Foundational
- **US2 Tags (Phase 4)**: Depends on Foundational, can run parallel with US1
- **US3 Due Dates (Phase 5)**: Depends on Foundational
- **US4 Reminders (Phase 6)**: Depends on US3 (Due Dates)
- **US6 Search (Phase 7)**: Depends on Foundational
- **US7 Filter (Phase 8)**: Depends on Foundational, best after US1+US2 for tag filtering
- **US5 Recurring (Phase 9)**: Depends on Foundational, best after US3 for due date advancement
- **US8 Sort (Phase 10)**: Depends on Foundational
- **Polish (Phase 11)**: Depends on all user stories

### User Story Priority Order

1. **P1 (MVP)**: US1 Priority, US2 Tags - Core organization features
2. **P2**: US3 Due Dates, US4 Reminders, US6 Search, US7 Filter - Time management and discovery
3. **P3**: US5 Recurring, US8 Sort - Advanced productivity features

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel (different service files)
- **Phase 3-4**: US1 and US2 can run in parallel (different features, share Badge component)
- **Phase 7-8**: US6 Search and US7 Filter can run in parallel (both extend GET endpoint)
- **Phase 9-10**: US5 Recurring and US8 Sort can run in parallel
- **Phase 11**: T070, T071, T073, T074 can run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 Priority
4. Complete Phase 4: US2 Tags
5. **STOP and VALIDATE**: Basic task organization works
6. Deploy/demo MVP

### Incremental Delivery

1. MVP (US1+US2) → Deploy
2. Add US3 Due Dates → Test → Deploy
3. Add US4 Reminders → Test (verify events) → Deploy
4. Add US6+US7 Search/Filter → Test → Deploy
5. Add US5 Recurring → Test (verify next occurrence) → Deploy
6. Add US8 Sort → Test → Deploy
7. Polish phase → Final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend tests: pytest in `backend/tests/`
- Frontend tests: Manual E2E per quickstart.md testing checklist
