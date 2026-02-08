# Tasks: Backend Core & Data Layer

**Input**: Design documents from `/specs/001-backend-core-api/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/openapi.yaml, research.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification. Test tasks are omitted per task generation rules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Backend structure**: `backend/app/` for source, `backend/tests/` for tests
- Paths follow plan.md project structure

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create project structure and install dependencies

- [x] T001 Create backend project directory structure per plan.md at `backend/`
- [x] T002 [P] Create `backend/requirements.txt` with FastAPI, SQLModel, python-jose, psycopg2-binary, python-dotenv, pydantic, pydantic-settings, uvicorn dependencies
- [x] T003 [P] Create `backend/.env.example` with DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, CORS_ORIGINS placeholders
- [x] T004 [P] Create `backend/app/__init__.py` empty init file
- [x] T005 [P] Create `backend/app/models/__init__.py` empty init file
- [x] T006 [P] Create `backend/app/schemas/__init__.py` empty init file
- [x] T007 [P] Create `backend/app/routers/__init__.py` empty init file
- [x] T008 [P] Create `backend/app/auth/__init__.py` empty init file

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create environment configuration loader in `backend/app/config.py` with Settings class using pydantic-settings for DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, CORS_ORIGINS
- [x] T010 Create database connection and session dependency in `backend/app/database.py` with SQLModel engine, create_db_and_tables function, and get_session generator
- [x] T011 Create TaskStatus and TaskPriority enums in `backend/app/models/task.py`
- [x] T012 Create Task SQLModel in `backend/app/models/task.py` with id (UUID), title, description, status, priority, due_date, user_id, created_at, updated_at fields per data-model.md
- [x] T013 [P] Create TaskCreate Pydantic schema in `backend/app/schemas/task.py` with title (required), description, status, priority, due_date fields
- [x] T014 [P] Create TaskUpdate Pydantic schema in `backend/app/schemas/task.py` with all optional fields for partial updates
- [x] T015 [P] Create TaskResponse Pydantic schema in `backend/app/schemas/task.py` with all Task fields plus from_attributes config
- [x] T016 Create JWT verification function in `backend/app/auth/jwt.py` that decodes token, validates signature with JWT_SECRET, extracts user_id from 'sub' claim
- [x] T017 Create get_current_user dependency in `backend/app/auth/jwt.py` using HTTPBearer that returns user_id string or raises HTTPException 401
- [x] T018 Create FastAPI application in `backend/app/main.py` with CORS middleware, database initialization on startup, health check endpoint at /health

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1+2+6 - Create Task, List Tasks, JWT Validation (Priority: P1)

**Goal**: Implement task creation and listing with JWT authentication - the core MVP functionality

**Independent Test**: Send POST /api/tasks with valid JWT to create task, then GET /api/tasks to verify task appears in list filtered by user

### Implementation for User Stories 1, 2, 6

- [x] T019 [US6] Add HTTPException handlers for 401 (unauthorized), 403 (forbidden) in `backend/app/auth/jwt.py` with appropriate error messages per spec
- [x] T020 [US1] [US2] Create tasks router in `backend/app/routers/tasks.py` with APIRouter prefix="/api/tasks"
- [x] T021 [US1] Implement POST /api/tasks endpoint in `backend/app/routers/tasks.py` that creates task with user_id from JWT, returns 201 with TaskResponse
- [x] T022 [US2] Implement GET /api/tasks endpoint in `backend/app/routers/tasks.py` that returns list of tasks filtered by user_id from JWT
- [x] T023 [US1] [US2] Register tasks router in `backend/app/main.py`
- [x] T024 [US1] Add input validation for TaskCreate schema in `backend/app/schemas/task.py` with title min_length=1, max_length=255, description max_length=2000

**Checkpoint**: Users can create and list their tasks with JWT authentication - MVP complete

---

## Phase 4: User Story 3+4 - Get Single Task, Update Task (Priority: P2)

**Goal**: Implement single task retrieval and updates with ownership enforcement

**Independent Test**: Create a task, retrieve it by ID (GET /api/tasks/{id}), update it (PUT /api/tasks/{id}), verify changes persisted

### Implementation for User Stories 3, 4

- [x] T025 [US3] Implement GET /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py` with ownership check returning 403 if user_id mismatch, 404 if not found
- [x] T026 [US4] Implement PUT /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py` with ownership check, partial update support, updated_at refresh
- [x] T027 [US3] [US4] Add helper function get_task_or_404 in `backend/app/routers/tasks.py` that fetches task by ID and validates ownership

**Checkpoint**: Users can view and update individual tasks they own

---

## Phase 5: User Story 5 - Delete Task (Priority: P3)

**Goal**: Implement task deletion with ownership enforcement

**Independent Test**: Create a task, delete it (DELETE /api/tasks/{id}), verify GET returns 404

### Implementation for User Story 5

- [x] T028 [US5] Implement DELETE /api/tasks/{task_id} endpoint in `backend/app/routers/tasks.py` with ownership check, returns 204 on success, 403/404 on error

**Checkpoint**: Full CRUD functionality complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, documentation, and final validation

- [x] T029 Add structured error response handling in `backend/app/main.py` for HTTPException with consistent JSON format
- [x] T030 [P] Add database connection error handling returning 503 Service Unavailable in `backend/app/database.py`
- [x] T031 [P] Create `backend/README.md` with setup instructions referencing quickstart.md
- [x] T032 [P] Add export statements to `backend/app/models/__init__.py` for Task, TaskStatus, TaskPriority
- [x] T033 [P] Add export statements to `backend/app/schemas/__init__.py` for TaskCreate, TaskUpdate, TaskResponse
- [x] T034 Verify all endpoints match OpenAPI contract in `specs/001-backend-core-api/contracts/openapi.yaml`
- [x] T035 Run backend server and verify health check endpoint responds at GET /health (requires .env configuration)

**Checkpoint**: Backend complete and ready for integration testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories 1+2+6 (Phase 3)**: Depends on Foundational completion
- **User Stories 3+4 (Phase 4)**: Depends on Phase 3 (needs create/list working)
- **User Story 5 (Phase 5)**: Depends on Phase 4 (needs get/update patterns)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

| Story | Priority | Depends On | Can Start After |
|-------|----------|------------|-----------------|
| US6 (JWT) | P1 | Foundational | Phase 2 |
| US1 (Create) | P1 | US6, Foundational | Phase 2 |
| US2 (List) | P1 | US6, Foundational | Phase 2 |
| US3 (Get) | P2 | US1, US2 | Phase 3 |
| US4 (Update) | P2 | US3 | Phase 3 |
| US5 (Delete) | P3 | US4 | Phase 4 |

### Parallel Opportunities

**Phase 1 (all parallelizable)**:
```
T002, T003, T004, T005, T006, T007, T008 - all can run in parallel
```

**Phase 2 (partial parallelization)**:
```
Sequential: T009 → T010 → T011 → T012 (database setup)
Parallel after T012: T013, T014, T015 (schemas)
Sequential: T016 → T017 (auth)
Sequential: T018 (main app depends on all above)
```

**Phase 3 (limited parallelization)**:
```
T019 → T020 → T021, T022 (can be parallel) → T023 → T024
```

**Phase 6 (mostly parallelizable)**:
```
T030, T031, T032, T033 - all can run in parallel
```

---

## Implementation Strategy

### MVP First (Phase 1-3 Only)

1. Complete Phase 1: Setup (~5 mins)
2. Complete Phase 2: Foundational (~20 mins)
3. Complete Phase 3: US1+US2+US6 (~15 mins)
4. **STOP and VALIDATE**: Test create and list endpoints with JWT
5. Deploy/demo if ready - users can create and view tasks

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1+US2+US6 → Test independently → **MVP!** (create & list tasks)
3. Add US3+US4 → Test independently → Users can view/edit tasks
4. Add US5 → Test independently → Full CRUD complete
5. Add Polish → Production ready

### Task Execution Notes

- Each task should take 5-15 minutes for an LLM to complete
- Commit after each phase completion
- Run `uvicorn app.main:app --reload` to verify after each phase
- Test endpoints with curl or httpx after Phase 3

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 35 |
| Setup Tasks | 8 |
| Foundational Tasks | 10 |
| US1+US2+US6 Tasks | 6 |
| US3+US4 Tasks | 3 |
| US5 Tasks | 1 |
| Polish Tasks | 7 |
| Parallelizable Tasks | 18 |
| MVP Scope | Phases 1-3 (24 tasks) |
