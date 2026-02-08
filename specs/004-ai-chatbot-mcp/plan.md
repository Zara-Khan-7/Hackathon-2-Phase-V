# Implementation Plan: AI-Native Todo Chatbot (Phase III)

**Branch**: `004-ai-chatbot-mcp` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ai-chatbot-mcp/spec.md`

## Summary

Implement an AI-powered, stateless chatbot that enables authenticated users to manage todos through natural language. The system uses MCP (Model Context Protocol) tools for task operations, OpenAI Agents SDK for AI orchestration, and OpenAI ChatKit for the frontend interface. All conversation and task state persists in PostgreSQL with zero server-side memory.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript/Node.js 18+ (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, OpenAI SDK, MCP SDK, OpenAI ChatKit
**Storage**: Neon Serverless PostgreSQL (Tasks, Conversations, Messages)
**Testing**: pytest (Backend), Jest (Frontend)
**Target Platform**: Linux server (Backend), Web browser (Frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3s response time for 95% of chat requests
**Constraints**: Stateless backend, no in-memory caches, no background workers
**Scale/Scope**: 100 concurrent users, single chat endpoint

## Constitution Check

*GATE: All items must pass for compliant implementation.*

### Pre-Implementation Check

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. AI-First Architecture | AI agent routes all business logic via MCP tools | PASS |
| II. Statelessness | All state in PostgreSQL, reconstructed per request | PASS |
| III. Tool-Driven Execution | All task CRUD through MCP tools only | PASS |
| IV. Deterministic Development | Following spec → plan → tasks → implement | PASS |
| V. Security & User Isolation | JWT auth, user_id from token, MCP-level isolation | PASS |

### Technology Stack Compliance

| Layer | Required | Planned | Status |
|-------|----------|---------|--------|
| Frontend | OpenAI ChatKit | OpenAI ChatKit | PASS |
| Backend | Python FastAPI | FastAPI | PASS |
| AI Logic | OpenAI Agents SDK | OpenAI Agents SDK | PASS |
| MCP Server | Official MCP SDK | MCP Python SDK | PASS |
| ORM | SQLModel | SQLModel | PASS |
| Database | Neon PostgreSQL | Neon PostgreSQL | PASS |
| Authentication | Better Auth (JWT) | Better Auth (JWT) | PASS |

### Security Checklist

- [x] Single chat endpoint requires JWT authentication
- [x] User ID extracted from JWT, not from request body
- [x] All MCP tools enforce user isolation via `user_id` parameter
- [x] All database queries filter by authenticated user
- [x] CORS configured for frontend origin
- [x] Input validation on chat endpoint
- [x] No secrets in source code or logs
- [x] Error messages do not leak sensitive information

## Project Structure

### Documentation (this feature)

```text
specs/004-ai-chatbot-mcp/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology research and decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Local setup guide
├── contracts/
│   ├── chat-api.yaml    # OpenAPI spec for chat endpoint
│   └── mcp-tools.yaml   # MCP tool specifications
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database connection
│   ├── auth/
│   │   ├── __init__.py
│   │   └── jwt.py           # JWT verification (existing)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py          # Task model (existing)
│   │   ├── conversation.py  # NEW: Conversation model
│   │   └── message.py       # NEW: Message model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── task.py          # Task schemas (existing)
│   │   └── chat.py          # NEW: Chat request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── tasks.py         # Task routes (existing)
│   │   └── chat.py          # NEW: Chat endpoint
│   ├── mcp/
│   │   ├── __init__.py      # NEW: MCP server setup
│   │   ├── server.py        # NEW: MCP server initialization
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── add_task.py      # NEW: add_task tool
│   │       ├── list_tasks.py    # NEW: list_tasks tool
│   │       ├── complete_task.py # NEW: complete_task tool
│   │       ├── update_task.py   # NEW: update_task tool
│   │       └── delete_task.py   # NEW: delete_task tool
│   └── agent/
│       ├── __init__.py      # NEW: AI agent setup
│       ├── runner.py        # NEW: Agent execution
│       └── prompts.py       # NEW: System prompts
└── requirements.txt

frontend/
├── src/
│   ├── app/
│   │   ├── (protected)/
│   │   │   ├── dashboard/page.tsx  # Existing dashboard
│   │   │   └── chat/page.tsx       # NEW: Chat page
│   │   └── ...
│   ├── components/
│   │   ├── chat/
│   │   │   ├── chat-container.tsx  # NEW: ChatKit wrapper
│   │   │   ├── chat-input.tsx      # NEW: Message input
│   │   │   └── chat-message.tsx    # NEW: Message display
│   │   └── ...
│   └── lib/
│       ├── api/
│       │   └── chat.ts             # NEW: Chat API client
│       └── ...
└── package.json
```

**Structure Decision**: Web application pattern with separate frontend and backend. Extends existing Phase II structure with new modules for MCP server, AI agent, and chat UI.

## Implementation Phases

### Phase 1: Foundation Setup

**Objective**: Project structure and environment ready for chatbot implementation.

**Tasks**:
1. Create backend module directories (`mcp/`, `agent/`)
2. Create frontend chat component directory
3. Add new dependencies to requirements.txt
4. Add ChatKit dependency to package.json
5. Configure new environment variables (OPENAI_API_KEY)
6. Verify existing Better Auth and database configuration

**Exit Criteria**:
- Project builds without errors
- All environment variables configured
- Dependency installation successful

---

### Phase 2: MCP Server & Tools

**Objective**: Functional MCP server exposing all task operations as stateless tools.

**Tasks**:
1. Initialize MCP server with Official MCP SDK
2. Implement `add_task` tool with user isolation
3. Implement `list_tasks` tool with filtering
4. Implement `complete_task` tool
5. Implement `update_task` tool
6. Implement `delete_task` tool
7. Add tool input validation
8. Add structured JSON responses
9. Add error handling for missing/invalid tasks

**Exit Criteria**:
- MCP server responds to tool calls
- All 5 tools functional with user isolation
- No in-memory state retained
- Tools return structured JSON

**Agent Dispatch**: `mcp-tool-engineer`

---

### Phase 3: AI Agent & Orchestration

**Objective**: AI agent that interprets natural language and invokes MCP tools.

**Tasks**:
1. Initialize OpenAI Agents SDK
2. Register MCP tools with agent
3. Configure system prompt for task management
4. Implement intent-to-tool mapping
5. Enable tool chaining for complex operations
6. Add natural language confirmation generation
7. Implement error handling for ambiguous intent
8. Add tool transparency (report invoked tools)

**Exit Criteria**:
- Agent selects correct tools for user intent
- Agent never accesses database directly
- Agent generates friendly confirmations
- Agent handles errors gracefully

**Agent Dispatch**: `mcp-tool-orchestrator`

---

### Phase 4: Stateless Chat Backend

**Objective**: Single chat endpoint with conversation persistence.

**Tasks**:
1. Create Conversation and Message SQLModel models
2. Run database migration for new tables
3. Implement POST `/api/{user_id}/chat` endpoint
4. Add JWT authentication middleware
5. Implement conversation loading from database
6. Implement message storage (user and assistant)
7. Implement context window management (20 messages)
8. Implement streaming response via SSE
9. Add request validation

**Exit Criteria**:
- Chat endpoint functional with JWT auth
- Conversations persist across requests
- Conversations survive server restarts
- Streaming responses working

**Agent Dispatch**: `conversation-state-manager`, `neon-postgres-manager`

---

### Phase 5: ChatKit Frontend Integration

**Objective**: Production-ready chat UI with authentication.

**Tasks**:
1. Install and configure OpenAI ChatKit
2. Create chat page in protected routes
3. Implement JWT token attachment for requests
4. Handle authentication errors (401/403)
5. Implement streaming response rendering
6. Add loading indicators
7. Configure domain allowlist
8. Style chat UI to match application

**Exit Criteria**:
- Chat UI functional in browser
- Authentication enforced on all requests
- Streaming responses displayed in real-time
- No CORS or domain errors

**Agent Dispatch**: `chat-ui-integrator`

---

### Phase 6: Validation & Hardening

**Objective**: End-to-end verification and security review.

**Tasks**:
1. Test all task operations via chat (CRUD)
2. Test conversation continuity across sessions
3. Test server restart scenario
4. Verify JWT enforcement
5. Verify user isolation (cross-user access blocked)
6. Verify MCP tools are only mutation path
7. Review error messages for information leakage
8. Clean up logging
9. Document any edge cases

**Exit Criteria**:
- All user stories testable via chat
- Security checklist 100% complete
- No cross-user data access possible
- System is restart-safe and stateless

---

## Complexity Tracking

> No constitution violations requiring justification.

| Item | Status | Notes |
|------|--------|-------|
| Technology stack | Compliant | All required technologies used |
| Statelessness | Compliant | All state in PostgreSQL |
| Security | Compliant | JWT + MCP-level user isolation |

## Dependencies Graph

```
Phase 1 (Foundation)
    │
    ├── Phase 2 (MCP Server)
    │       │
    │       └── Phase 3 (AI Agent)
    │               │
    │               └── Phase 4 (Chat Backend)
    │                       │
    │                       └── Phase 5 (Frontend)
    │                               │
    │                               └── Phase 6 (Validation)
```

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenAI API rate limits | Medium | High | Implement retry with backoff |
| Long AI response times | Medium | Medium | Streaming + loading indicators |
| Context window overflow | Low | Medium | Sliding window (20 messages) |
| Tool execution failures | Low | High | Graceful error handling |

## Artifacts Generated

- [x] `research.md` - Technology decisions
- [x] `data-model.md` - Entity definitions
- [x] `contracts/chat-api.yaml` - OpenAPI specification
- [x] `contracts/mcp-tools.yaml` - MCP tool specifications
- [x] `quickstart.md` - Local setup guide

## Next Step

Run `/sp.tasks` to generate the task list for implementation.
