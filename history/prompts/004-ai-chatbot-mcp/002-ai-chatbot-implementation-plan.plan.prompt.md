---
id: 002
title: AI Chatbot Implementation Plan
stage: plan
date: 2026-01-16
surface: agent
model: claude-opus-4-5-20251101
feature: 004-ai-chatbot-mcp
branch: 004-ai-chatbot-mcp
user: user
command: /sp.plan
labels: ["plan", "phase-iii", "ai-chatbot", "mcp", "architecture", "implementation"]
links:
  spec: specs/004-ai-chatbot-mcp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-ai-chatbot-mcp/plan.md
  - specs/004-ai-chatbot-mcp/research.md
  - specs/004-ai-chatbot-mcp/data-model.md
  - specs/004-ai-chatbot-mcp/quickstart.md
  - specs/004-ai-chatbot-mcp/contracts/chat-api.yaml
  - specs/004-ai-chatbot-mcp/contracts/mcp-tools.yaml
tests:
  - N/A (planning document)
---

## Prompt

/sp.plan Phase III — Todo AI Chatbot (MCP + Agents)

Objective:
Implement an AI-powered, stateless chatbot that allows authenticated users to manage todos using natural language via MCP tools, OpenAI Agents SDK, and ChatKit UI.

Scope:
- Conversational task management
- MCP tool-based task operations
- Stateless chat backend with persistent memory
- Authenticated ChatKit frontend
- Production-ready, scalable architecture

Execution Strategy:
Follow Agentic Dev Stack strictly:
spec → plan → tasks → implement
No manual coding. All code generated via Claude Code.

────────────────────────
PHASE 1 — Foundation Setup
────────────────────────

1. Project Structure
   - Create /backend/chat module
   - Create /backend/mcp module
   - Create /frontend/chat module
   - Create /specs/chatbot directory

2. Environment Configuration
   - Configure BETTER_AUTH_SECRET
   - Configure OpenAI API keys
   - Configure NEXT_PUBLIC_OPENAI_DOMAIN_KEY
   - Ensure Neon DB access is available

Exit Criteria:
- Project builds without chatbot logic
- Environment variables validated

[... truncated for brevity - full user input in prompt ...]

## Response snapshot

Created comprehensive implementation plan for AI-Native Todo Chatbot (Phase III):

**Technical Context**:
- Python 3.11+ Backend with FastAPI, SQLModel, OpenAI SDK, MCP SDK
- TypeScript Frontend with OpenAI ChatKit
- Neon PostgreSQL for stateless persistence
- <3s response time target, 100 concurrent users

**Constitution Check**: All 5 principles PASS
- AI-First Architecture, Statelessness, Tool-Driven, Deterministic Dev, Security

**6 Implementation Phases**:
1. Foundation Setup - Project structure and dependencies
2. MCP Server & Tools - 5 stateless task tools (add, list, complete, update, delete)
3. AI Agent & Orchestration - OpenAI Agents SDK integration
4. Stateless Chat Backend - Conversation/Message models, SSE streaming
5. ChatKit Frontend - Auth-aware chat UI with JWT
6. Validation & Hardening - E2E testing, security review

**Artifacts Generated**:
- research.md - Technology decisions (MCP SDK, OpenAI Agents, SSE streaming)
- data-model.md - Conversation and Message entities
- contracts/chat-api.yaml - OpenAPI spec for chat endpoint
- contracts/mcp-tools.yaml - MCP tool specifications
- quickstart.md - Local setup guide

**Project Structure**: Extends Phase II with new backend/app/mcp/, backend/app/agent/, and frontend/src/components/chat/ directories.

## Outcome

- Impact: Complete architectural blueprint for Phase III implementation
- Tests: N/A (planning document)
- Files: 6 artifacts created in specs/004-ai-chatbot-mcp/
- Next prompts: /sp.tasks to generate task list
- Reflection: Plan follows constitution strictly, all technology decisions documented

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution Check PASS (all principles)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor MCP SDK integration during implementation
