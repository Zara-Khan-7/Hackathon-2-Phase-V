---
id: 002
title: Phase III Constitution Amendment
stage: constitution
date: 2026-01-16
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "governance", "phase-iii", "mcp", "ai-native", "chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (governance document)
---

## Prompt

/sp.constitution

Project: AI-Native Todo Chatbot using MCP and Agentic Dev Stack (Phase III)

Objective:
Build a production-grade, AI-powered todo chatbot that allows users to manage tasks through natural language using MCP (Model Context Protocol), OpenAI Agents SDK, Claude Code, and Spec-Kit Plus — with a fully stateless backend and persistent database state.

---

## Core Principles

- AI-First Architecture
  The AI agent is the primary decision-maker. Business logic routing is handled by the agent via MCP tools, not by conditional backend code.

- Statelessness by Design
  No server-side memory. All application and conversation state must be persisted in PostgreSQL and reconstructed per request.

- Tool-Driven Execution
  AI agents may only perform task operations through MCP tools. Direct database manipulation by the agent is forbidden.

- Deterministic & Reviewable Development
  Every phase must follow:
  **Write spec → Generate plan → Break into tasks → Implement via Claude Code**
  No manual coding is allowed.

- Security & User Isolation
  All task and conversation operations must be scoped strictly to the authenticated user via JWT and enforced at the MCP tool level.

---

## Architectural Standards

- Single Chat Endpoint
  All user interactions must go through a single stateless endpoint:
  POST `/api/{user_id}/chat`

- MCP Server as Execution Layer
  The MCP server exposes task operations as stateless tools and persists all state in PostgreSQL.

- AI Agent as Orchestrator
  The AI agent:
  - Interprets natural language
  - Selects MCP tools
  - Chains tools when necessary
  - Generates friendly confirmations
  - Handles errors gracefully

- Database as Source of Truth
  PostgreSQL (Neon) is the only system of record for:
  - Tasks
  - Conversations
  - Messages

---

## Technology Constraints (Hard Rules)

- Frontend: OpenAI ChatKit
- Backend: Python FastAPI
- AI Logic: OpenAI Agents SDK
- MCP Server: Official MCP SDK
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth

❌ No alternative frameworks
❌ No in-memory caches
❌ No background workers
❌ No manual code edits

---

## MCP Tool Standards

All MCP tools must:

- Be stateless
- Accept `user_id` explicitly
- Enforce user isolation
- Return structured JSON
- Never infer or assume state

Required Tools:
- add_task
- list_tasks
- complete_task
- delete_task
- update_task

---

## Agent Behavior Standards

- Intent-Driven Actions
  The agent must infer intent strictly from user language and map it to MCP tools.

- Confirmation Required
  Every successful mutation (add, update, complete, delete) must be confirmed in natural language.

- Error Handling
  Errors such as "task not found" must be handled gracefully and explained clearly to the user.

- Tool Transparency
  The response must include which MCP tools were invoked during the turn.

---

## Conversation Management Rules

- Stateless Request Cycle
  Each request must:
  1. Load conversation history from DB
  2. Append new user message
  3. Run AI agent
  4. Execute MCP tools
  5. Store assistant response
  6. Return response

- Conversation Continuity
  Conversations must resume correctly after server restarts.

---

## Development Workflow Rules

Every Phase MUST follow this order:

1. `/sp.spec` — formal system specification
2. `/sp.plan` — execution plan derived from spec
3. `/sp.tasks` — atomic implementation tasks
4. `/sp.implement` — Claude Code execution

Skipping steps is forbidden.

---

## Deliverable Standards

The final system must:

- Support full task CRUD via natural language
- Use MCP tools exclusively for task operations
- Maintain conversation context via database
- Be horizontally scalable and restart-safe
- Provide friendly, human-like confirmations
- Gracefully handle errors and ambiguities

---

## Success Criteria

- Stateless backend confirmed
- All task actions executed through MCP tools
- Conversations persist correctly across requests
- No manual code written
- All phases reviewable and reproducible

## Response snapshot

Amended constitution from v1.0.0 to v2.0.0 (MAJOR) for Phase III AI-Native Todo Chatbot with 5 core principles:
1. AI-First Architecture - AI agent is primary decision-maker via MCP tools
2. Statelessness by Design - No server-side memory, all state in PostgreSQL
3. Tool-Driven Execution - All operations through MCP tools only
4. Deterministic & Reviewable Development - Spec workflow mandatory, no manual code
5. Security & User Isolation - JWT auth, MCP-level user isolation

Major changes from Phase II:
- Removed "Separation of Concerns" (replaced by single chat endpoint architecture)
- Removed "API-First Design" (replaced by MCP Tool Standards)
- Added MCP Tool Standards section with required tools specification
- Added Agent Behavior Standards for natural language interaction
- Added Conversation Management Rules for stateless request cycle
- Updated technology stack: Next.js → OpenAI ChatKit, added OpenAI Agents SDK and MCP SDK
- Updated Agent Dispatch Rules with new specialized agents

## Outcome

- Impact: Major governance transformation for Phase III AI-native chatbot architecture
- Tests: N/A (governance document)
- Files: .specify/memory/constitution.md updated (v1.0.0 → v2.0.0)
- Next prompts: /sp.specify to create feature specification for MCP server or chat endpoint
- Reflection: Constitution establishes clear AI-first, stateless, tool-driven architecture principles

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify MCP tool implementation adheres to standards during implementation phase
