---
id: 001
title: Initial Constitution Ratification
stage: constitution
date: 2026-01-09
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "governance", "initial-setup", "todo-app"]
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

Project: Todo Full-Stack Web Application (Agentic Dev Stack)

Core principles:
- Spec-driven development (spec → plan → tasks → implementation)
- No manual coding; all code generated via Claude Code
- Clear separation of frontend, backend, and authentication concerns
- Security-first design with strict user isolation
- Production-grade architecture (scalable, maintainable, testable)

Key standards:
- Every feature must trace back to a written spec requirement
- All API behavior must be explicitly defined before implementation
- Authentication must be enforced on every protected route
- Frontend and backend must communicate only through defined REST APIs
- Database schema changes must be reflected in ORM models and specs

Technology constraints:
- Frontend: Next.js 16+ (App Router)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (JWT-based)
- Spec-driven workflow enforced via Spec-Kit Plus

Security standards:
- JWT authentication required for all API endpoints
- JWT verified on backend using shared secret
- User ID must be derived from JWT, never trusted from client input
- Each user can access only their own tasks
- Unauthorized requests return HTTP 401
- Forbidden cross-user access returns HTTP 403

Data & API standards:
- RESTful API design
- Consistent request/response schemas
- All database queries filtered by authenticated user
- Task ownership enforced at ORM and API layer
- Clear error handling and status codes

Quality standards:
- Clean, readable, modular code
- Strong typing (TypeScript, Python typing)
- Reusable frontend components
- Responsive, accessible UI
- Predictable API behavior

Constraints:
- Must implement all Basic Level features as a web app
- Must use Neon Serverless PostgreSQL for persistence
- Must support multi-user usage
- No feature implemented without spec approval
- No deviation from agreed technology stack

Success criteria:
- All specs fully implemented and traceable
- Frontend, backend, and auth working together

## Response snapshot

Created constitution v1.0.0 for Todo Full-Stack Web Application with 6 core principles:
1. Spec-Driven Development - Agentic workflow mandatory
2. Security-First Design - JWT auth, user isolation, HTTP 401/403
3. Separation of Concerns - Frontend/Backend/Auth boundaries
4. API-First Design - RESTful contracts with Pydantic
5. Quality and Type Safety - TypeScript + Python typing
6. Technology Stack Compliance - Next.js, FastAPI, SQLModel, Neon, Better Auth

Includes Technology Stack Requirements, Security Standards with authentication flow, Development Workflow with agent dispatch rules, and Governance policies.

## Outcome

- Impact: Established foundational governance for Todo Full-Stack Web Application
- Tests: N/A (governance document)
- Files: .specify/memory/constitution.md created (v1.0.0)
- Next prompts: /sp.specify to create feature specification for todo-app
- Reflection: Constitution provides clear principles and constraints for agentic development

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor adherence during spec/plan phases
