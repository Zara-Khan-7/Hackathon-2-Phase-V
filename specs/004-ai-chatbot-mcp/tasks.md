# Tasks: AI-Native Todo Chatbot (Phase III)

**Input**: Design documents from `/specs/004-ai-chatbot-mcp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/src/`
- Backend Python files in `backend/app/`
- Frontend TypeScript files in `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend MCP module directory structure at backend/app/mcp/ and backend/app/mcp/tools/
- [ ] T002 Create backend agent module directory structure at backend/app/agent/
- [ ] T003 Create frontend chat component directory at frontend/src/components/chat/
- [ ] T004 Add MCP SDK, OpenAI SDK, and SSE dependencies to backend/requirements.txt
- [ ] T005 [P] Add OPENAI_API_KEY to backend/.env.example
- [ ] T006 [P] Update backend/app/config.py with OPENAI_API_KEY configuration

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models

- [ ] T007 Create Conversation SQLModel in backend/app/models/conversation.py
- [ ] T008 [P] Create Message SQLModel with MessageRole enum in backend/app/models/message.py
- [ ] T009 Update backend/app/models/__init__.py to export Conversation and Message models
- [ ] T010 Create database migration for conversation and message tables

### Chat Schemas

- [ ] T011 Create ChatRequest and ChatResponse Pydantic schemas in backend/app/schemas/chat.py
- [ ] T012 [P] Create ToolInvocation schema in backend/app/schemas/chat.py
- [ ] T013 Update backend/app/schemas/__init__.py to export chat schemas

### MCP Server Foundation

- [ ] T014 Create MCP server initialization in backend/app/mcp/server.py
- [ ] T015 Create MCP tools __init__.py with tool registration in backend/app/mcp/tools/__init__.py
- [ ] T016 [P] Create backend/app/mcp/__init__.py to export server and tools

### AI Agent Foundation

- [ ] T017 Create system prompts for task management agent in backend/app/agent/prompts.py
- [ ] T018 Create agent runner with OpenAI SDK integration in backend/app/agent/runner.py
- [ ] T019 [P] Create backend/app/agent/__init__.py to export runner and prompts

### Chat Endpoint Foundation

- [ ] T020 Create chat router with POST /api/{user_id}/chat endpoint in backend/app/routers/chat.py
- [ ] T021 Add JWT authentication and user_id validation to chat endpoint
- [ ] T022 Register chat router in backend/app/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks by typing natural language messages like "Add a task to buy groceries tomorrow"

**Independent Test**: Send chat message "Create a task to finish the report by Friday" and verify task is created with correct title and due date

### MCP Tool Implementation

- [ ] T023 [US1] Implement add_task MCP tool with user_id, title, description, priority, due_date parameters in backend/app/mcp/tools/add_task.py
- [ ] T024 [US1] Add input validation for add_task tool (title required, max lengths)
- [ ] T025 [US1] Add user isolation enforcement to add_task tool (filter by user_id)
- [ ] T026 [US1] Register add_task tool with MCP server in backend/app/mcp/tools/__init__.py

### Agent Integration

- [ ] T027 [US1] Configure agent to recognize task creation intent from natural language
- [ ] T028 [US1] Implement date parsing for relative dates ("tomorrow", "next Friday") in agent prompts
- [ ] T029 [US1] Add friendly confirmation message generation for successful task creation

### Chat Flow Integration

- [ ] T030 [US1] Implement conversation creation/retrieval in chat endpoint for new users
- [ ] T031 [US1] Implement user message storage in database
- [ ] T032 [US1] Implement assistant response storage with tool_calls metadata
- [ ] T033 [US1] Wire add_task tool to agent and return structured response

**Checkpoint**: User Story 1 complete - users can create tasks via natural language chat

---

## Phase 4: User Story 2 - Task Listing and Querying (Priority: P2)

**Goal**: Users can ask about their tasks using natural language like "Show me my tasks"

**Independent Test**: Send "What tasks are pending?" and verify response includes only pending tasks with details

### MCP Tool Implementation

- [ ] T034 [US2] Implement list_tasks MCP tool with user_id, status, priority filters in backend/app/mcp/tools/list_tasks.py
- [ ] T035 [US2] Add status filtering logic (all, pending, completed, in_progress)
- [ ] T036 [US2] Add priority filtering logic (all, low, medium, high)
- [ ] T037 [US2] Register list_tasks tool with MCP server in backend/app/mcp/tools/__init__.py

### Agent Integration

- [ ] T038 [US2] Configure agent to recognize task listing/querying intent
- [ ] T039 [US2] Implement task list formatting in natural language response
- [ ] T040 [US2] Handle empty task list with friendly "no tasks" message

**Checkpoint**: User Stories 1 AND 2 complete - users can create and view tasks via chat

---

## Phase 5: User Story 3 - Task Completion (Priority: P3)

**Goal**: Users can mark tasks as complete using natural language like "Mark buy groceries as done"

**Independent Test**: Create a task, then send "I finished [task name]" and verify task status changes to completed

### MCP Tool Implementation

- [ ] T041 [US3] Implement complete_task MCP tool with user_id, task_id in backend/app/mcp/tools/complete_task.py
- [ ] T042 [US3] Add task lookup by ID with user ownership validation
- [ ] T043 [US3] Add "task not found" error handling with helpful message
- [ ] T044 [US3] Register complete_task tool with MCP server in backend/app/mcp/tools/__init__.py

### Agent Integration

- [ ] T045 [US3] Configure agent to recognize task completion intent
- [ ] T046 [US3] Implement task name-to-ID resolution using list_tasks tool chaining
- [ ] T047 [US3] Add clarification request for ambiguous task references

**Checkpoint**: User Stories 1, 2, and 3 complete - basic task lifecycle via chat

---

## Phase 6: User Story 4 - Task Updates (Priority: P4)

**Goal**: Users can update task details using natural language like "Change deadline to next Monday"

**Independent Test**: Create a task, send "Make [task name] high priority" and verify priority is updated

### MCP Tool Implementation

- [ ] T048 [US4] Implement update_task MCP tool with user_id, task_id, updates dict in backend/app/mcp/tools/update_task.py
- [ ] T049 [US4] Add partial update logic (only update provided fields)
- [ ] T050 [US4] Add validation for update fields (priority enum, due_date format)
- [ ] T051 [US4] Register update_task tool with MCP server in backend/app/mcp/tools/__init__.py

### Agent Integration

- [ ] T052 [US4] Configure agent to recognize task update intent (title, priority, due_date changes)
- [ ] T053 [US4] Implement update confirmation with before/after summary

**Checkpoint**: User Stories 1-4 complete - full task CRUD except delete via chat

---

## Phase 7: User Story 5 - Task Deletion (Priority: P5)

**Goal**: Users can delete tasks using natural language like "Delete old task"

**Independent Test**: Create a task, send "Delete [task name]" and verify task is removed

### MCP Tool Implementation

- [ ] T054 [US5] Implement delete_task MCP tool with user_id, task_id in backend/app/mcp/tools/delete_task.py
- [ ] T055 [US5] Add task ownership validation before deletion
- [ ] T056 [US5] Add deletion confirmation response with deleted task details
- [ ] T057 [US5] Register delete_task tool with MCP server in backend/app/mcp/tools/__init__.py

### Agent Integration

- [ ] T058 [US5] Configure agent to recognize task deletion intent
- [ ] T059 [US5] Add support for bulk delete ("delete all completed tasks") with summary response

**Checkpoint**: User Stories 1-5 complete - full task CRUD via natural language chat

---

## Phase 8: User Story 6 - Conversation Continuity (Priority: P6)

**Goal**: Conversation history persists across sessions and server restarts

**Independent Test**: Have a conversation, restart server, send "What did I add yesterday?" and verify context is maintained

### Conversation Persistence

- [ ] T060 [US6] Implement conversation history loading from database on each request
- [ ] T061 [US6] Implement context window management (load most recent 20 messages)
- [ ] T062 [US6] Add message ordering by created_at timestamp

### Context Building

- [ ] T063 [US6] Build agent context from loaded messages in chronological order
- [ ] T064 [US6] Always prepend system prompt to context
- [ ] T065 [US6] Handle long conversations with sliding window truncation

### Streaming Response

- [ ] T066 [US6] Implement Server-Sent Events (SSE) streaming response in chat endpoint
- [ ] T067 [US6] Add stream parameter handling in ChatRequest schema
- [ ] T068 [US6] Implement streaming message storage (store after stream completes)

**Checkpoint**: All backend user stories complete - full chatbot functionality

---

## Phase 9: Frontend - ChatKit Integration

**Goal**: Production-ready chat UI with authentication

**Independent Test**: Open chat page, send message, receive AI response with task confirmation

### Chat Page Setup

- [ ] T069 Create chat page at frontend/src/app/(protected)/chat/page.tsx
- [ ] T070 [P] Create chat API client in frontend/src/lib/api/chat.ts

### Chat Components

- [ ] T071 [P] Create ChatContainer component wrapper in frontend/src/components/chat/chat-container.tsx
- [ ] T072 [P] Create ChatMessage component for message display in frontend/src/components/chat/chat-message.tsx
- [ ] T073 [P] Create ChatInput component for message input in frontend/src/components/chat/chat-input.tsx

### Authentication Integration

- [ ] T074 Implement JWT token retrieval from Better Auth session
- [ ] T075 Attach JWT to chat API requests via Authorization header
- [ ] T076 Handle 401/403 responses with redirect to login

### Streaming & UX

- [ ] T077 Implement SSE streaming response handling in chat client
- [ ] T078 Add loading indicator while waiting for response
- [ ] T079 Display tool invocation metadata in chat UI (optional expandable)

### Navigation

- [ ] T080 Add Chat link to navigation in protected layout
- [ ] T081 Style chat UI to match existing application design

**Checkpoint**: Full chatbot functional in browser

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, security hardening, and cleanup

### End-to-End Validation

- [ ] T082 Verify all task CRUD operations work via chat
- [ ] T083 Verify conversation persists after page refresh
- [ ] T084 Verify conversation persists after backend restart
- [ ] T085 Verify user isolation (user A cannot access user B's tasks)

### Security Hardening

- [ ] T086 Verify JWT is validated on every chat request
- [ ] T087 Verify user_id from JWT is used, not from request path
- [ ] T088 Verify MCP tools enforce user_id isolation
- [ ] T089 Review error messages for information leakage

### Cleanup

- [ ] T090 Remove any debug logging or console statements
- [ ] T091 Update backend/app/main.py CORS configuration for production
- [ ] T092 Run quickstart.md validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) - No dependencies
    │
    └── Phase 2 (Foundational) - BLOCKS all user stories
            │
            ├── Phase 3 (US1: Create) ─────────┐
            │                                   │
            ├── Phase 4 (US2: List) ───────────┤
            │                                   │
            ├── Phase 5 (US3: Complete) ───────┤
            │                                   │ Can proceed in parallel
            ├── Phase 6 (US4: Update) ─────────┤ after Foundational
            │                                   │
            ├── Phase 7 (US5: Delete) ─────────┤
            │                                   │
            └── Phase 8 (US6: Continuity) ─────┘
                        │
                        └── Phase 9 (Frontend)
                                │
                                └── Phase 10 (Polish)
```

### User Story Dependencies

- **US1 (Create)**: Required for all other stories to have tasks to operate on
- **US2 (List)**: Independent, but needed by US3-US5 for task name-to-ID resolution
- **US3 (Complete)**: Depends on US1 (tasks must exist) and US2 (for task lookup)
- **US4 (Update)**: Depends on US1 (tasks must exist) and US2 (for task lookup)
- **US5 (Delete)**: Depends on US1 (tasks must exist) and US2 (for task lookup)
- **US6 (Continuity)**: Independent of task operations, but requires conversation infrastructure

### Parallel Opportunities

- **Phase 1**: T005 and T006 can run in parallel
- **Phase 2**: T008, T012, T016, T019 can run in parallel after dependencies
- **Phase 9**: T070, T071, T072, T073 can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# After T007 (Conversation model):
Task: T008 [P] Create Message SQLModel
Task: T016 [P] Create backend/app/mcp/__init__.py
Task: T019 [P] Create backend/app/agent/__init__.py

# After T011 (ChatRequest schema):
Task: T012 [P] Create ToolInvocation schema
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Task Creation
4. **STOP and VALIDATE**: Test creating tasks via chat
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Create) → Test → MVP ready!
3. Add US2 (List) → Test → View tasks via chat
4. Add US3 (Complete) → Test → Basic task lifecycle
5. Add US4 (Update) + US5 (Delete) → Test → Full CRUD
6. Add US6 (Continuity) → Test → Persistent conversations
7. Add Frontend (Phase 9) → Test → Full user experience
8. Polish (Phase 10) → Ship it!

---

## Summary

| Phase | Story | Tasks | Parallel Tasks |
|-------|-------|-------|----------------|
| 1 | Setup | 6 | 2 |
| 2 | Foundational | 16 | 5 |
| 3 | US1: Create | 11 | 0 |
| 4 | US2: List | 7 | 0 |
| 5 | US3: Complete | 7 | 0 |
| 6 | US4: Update | 6 | 0 |
| 7 | US5: Delete | 6 | 0 |
| 8 | US6: Continuity | 9 | 0 |
| 9 | Frontend | 13 | 4 |
| 10 | Polish | 11 | 0 |
| **Total** | | **92** | **11** |

### Suggested MVP Scope

Complete Phases 1-3 (Setup + Foundational + US1) = **33 tasks**
This delivers: Users can create tasks via natural language chat.
