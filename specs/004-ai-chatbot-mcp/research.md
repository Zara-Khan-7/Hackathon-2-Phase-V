# Research: AI-Native Todo Chatbot (Phase III)

**Branch**: `004-ai-chatbot-mcp`
**Date**: 2026-01-16
**Status**: Complete

## Research Questions

### 1. MCP SDK Integration with Python FastAPI

**Decision**: Use the official `mcp` Python SDK to create an MCP server that exposes task tools.

**Rationale**:
- Official MCP SDK provides standardized tool registration and invocation patterns
- Native Python support integrates seamlessly with FastAPI
- Built-in JSON schema validation for tool inputs/outputs
- Supports stateless tool execution as required by constitution

**Alternatives Considered**:
- Custom tool protocol: Rejected - would require extra maintenance and lacks ecosystem support
- HTTP-based tool API: Rejected - MCP provides richer semantics for AI agent integration

**Implementation Approach**:
```python
from mcp import Server, Tool
from mcp.types import ToolResult

server = Server("todo-mcp-server")

@server.tool("add_task")
async def add_task(user_id: str, title: str, ...) -> ToolResult:
    # Tool implementation
    pass
```

---

### 2. OpenAI Agents SDK for Tool Orchestration

**Decision**: Use OpenAI Agents SDK with function calling to orchestrate MCP tools.

**Rationale**:
- Native tool/function calling support in OpenAI API
- Agent handles intent detection, tool selection, and response generation
- Supports tool chaining for complex operations
- Built-in conversation context management

**Alternatives Considered**:
- LangChain agents: Rejected - adds complexity without significant benefit for this use case
- Custom agent logic: Rejected - would duplicate OpenAI's robust tool orchestration

**Implementation Approach**:
- Register MCP tools as OpenAI functions
- Use system prompt to define agent behavior and task management domain
- Let agent decide which tools to call based on user intent
- Agent generates natural language confirmations

---

### 3. Stateless Conversation Persistence

**Decision**: Store all conversation messages in PostgreSQL with per-request reconstruction.

**Rationale**:
- Aligns with constitution's statelessness principle
- PostgreSQL already in use for tasks (Neon)
- Enables horizontal scaling without session affinity
- Survives server restarts

**Alternatives Considered**:
- Redis for conversation cache: Rejected - violates no-cache constitution rule
- In-memory conversation store: Rejected - violates statelessness, breaks on restart

**Implementation Approach**:
- Create `Conversation` and `Message` tables
- On each request: Load messages → Build context → Run agent → Store response
- Implement context window trimming for long conversations (keep recent N messages)

---

### 4. OpenAI ChatKit Frontend Integration

**Decision**: Use OpenAI ChatKit components with custom JWT authentication layer.

**Rationale**:
- Provides production-ready chat UI components
- Supports streaming responses out of the box
- Domain allowlist feature for security
- Integrates with OpenAI's response format

**Alternatives Considered**:
- Custom chat UI: Rejected - more development effort, reinventing the wheel
- Third-party chat widget: Rejected - constitution specifies ChatKit

**Implementation Approach**:
- Wrap ChatKit in auth-aware component
- Inject JWT token from Better Auth session
- Configure domain allowlist for production
- Handle 401/403 responses gracefully

---

### 5. JWT Token Flow Between Frontend and Backend

**Decision**: Better Auth issues JWT on login, frontend attaches to chat requests, backend validates.

**Rationale**:
- Consistent with Phase II authentication pattern
- JWT contains user_id in 'sub' claim
- Stateless authentication aligns with architecture
- Shared secret between Better Auth and FastAPI

**Alternatives Considered**:
- Session-based auth: Rejected - violates statelessness
- API key per user: Rejected - less secure, harder to manage

**Implementation Approach**:
```
Frontend:
1. User logs in via Better Auth
2. Store JWT in session/cookie
3. Attach JWT to Authorization: Bearer header for /api/chat

Backend:
1. JWT middleware extracts token
2. Validate signature with shared secret
3. Extract user_id from 'sub' claim
4. Pass user_id to MCP tools
```

---

### 6. Context Window Management for Long Conversations

**Decision**: Implement sliding window with most recent 20 messages plus system context.

**Rationale**:
- OpenAI models have token limits
- Recent context most relevant for task operations
- System prompt always included for agent behavior
- 20 messages provides sufficient context for most task operations

**Alternatives Considered**:
- Summarization of old messages: Rejected - adds latency and complexity
- No limit (fail on token overflow): Rejected - poor UX

**Implementation Approach**:
- Store all messages in DB for audit/history
- Load only recent N messages for agent context
- Always prepend system prompt
- Handle edge case of very long individual messages

---

### 7. Streaming Response Handling

**Decision**: Use Server-Sent Events (SSE) for streaming chat responses.

**Rationale**:
- Native support in FastAPI via StreamingResponse
- ChatKit supports streaming consumption
- Provides real-time feedback to users
- Reduces perceived latency

**Alternatives Considered**:
- WebSockets: Rejected - more complex, bidirectional not needed
- Polling: Rejected - poor UX, higher latency

**Implementation Approach**:
```python
from fastapi.responses import StreamingResponse

@app.post("/api/{user_id}/chat")
async def chat(user_id: str, request: ChatRequest):
    async def generate():
        async for chunk in agent.stream_response(...):
            yield f"data: {json.dumps(chunk)}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

## Technology Decisions Summary

| Component | Technology | Rationale |
|-----------|------------|-----------|
| MCP Server | Official MCP SDK (Python) | Standard protocol, stateless tools |
| AI Agent | OpenAI Agents SDK | Native tool calling, orchestration |
| Conversation Storage | PostgreSQL (Neon) | Stateless, scalable, restart-safe |
| Frontend Chat | OpenAI ChatKit | Production-ready, streaming support |
| Authentication | Better Auth + JWT | Consistent with Phase II |
| Streaming | Server-Sent Events | Real-time, simple, ChatKit compatible |

---

## Dependencies to Add

### Backend (requirements.txt additions)
```
mcp>=1.0.0          # Official MCP SDK
openai>=1.0.0       # OpenAI Agents SDK
sse-starlette>=1.0  # SSE support for FastAPI
```

### Frontend (package.json additions)
```json
{
  "@openai/chatkit": "^1.0.0"
}
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| OpenAI API rate limits | Implement retry with exponential backoff |
| Long response times | Streaming + loading indicators |
| Context window overflow | Sliding window with recent messages |
| Tool execution failures | Graceful error handling, user-friendly messages |
| Cross-user data access | MCP tool-level user_id enforcement |

---

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:
1. MCP SDK → Official Python SDK
2. Agent framework → OpenAI Agents SDK
3. Conversation storage → PostgreSQL tables
4. Context management → Sliding window (20 messages)
5. Streaming → Server-Sent Events
6. ChatKit auth → JWT token injection
