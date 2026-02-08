---
id: 001
title: Backend Core API Specification
stage: spec
date: 2026-01-09
surface: agent
model: claude-opus-4-5-20251101
feature: 001-backend-core-api
branch: 001-backend-core-api
user: user
command: /sp.specify
labels: ["spec", "backend", "api", "crud", "jwt", "authentication"]
links:
  spec: specs/001-backend-core-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-backend-core-api/spec.md
  - specs/001-backend-core-api/checklists/requirements.md
tests:
  - N/A (specification phase)
---

## Prompt

/sp.specify Todo Full-Stack Web Application — Spec 1: Backend Core & Data Layer

Target audience:
- AI coding agent responsible for backend implementation
- Reviewers evaluating API correctness, security, and data integrity

Focus:
- FastAPI backend architecture
- Task CRUD REST API
- SQLModel data modeling
- Neon PostgreSQL integration
- JWT-based request authentication and user isolation

Success criteria:
- All REST endpoints implemented and documented
- All endpoints protected by JWT authentication
- User identity derived exclusively from JWT
- Task ownership enforced on every operation
- Database schema fully defined via SQLModel
- Backend can run independently and serve authenticated requests

Constraints:
- Backend framework: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication verification: JWT (shared secret with Better Auth)
- No frontend or UI code
- No mock authentication logic
- No manual coding outside agent-generated output

API scope:
- GET    /api/tasks
- POST   /api/tasks
- GET    /api/tasks/{id}
- PUT    /api/tasks/{id}
- DELETE /api/tasks/{id}

## Response snapshot

Created feature specification for Backend Core & Data Layer with:

**6 User Stories (prioritized)**:
1. P1: Authenticated User Creates a Task
2. P1: Authenticated User Lists Their Tasks
3. P2: Authenticated User Retrieves a Single Task
4. P2: Authenticated User Updates Their Task
5. P3: Authenticated User Deletes Their Task
6. P1: JWT Token Validation (system story)

**13 Functional Requirements** covering:
- JWT token verification on all endpoints
- User identity from JWT only
- Task ownership enforcement
- 5 CRUD endpoints
- Proper HTTP status codes
- Input validation
- Task attributes (title, description, status, priority, due_date, timestamps)

**7 Success Criteria** (technology-agnostic):
- 500ms response time
- 100% JWT rejection for invalid tokens
- 100% cross-user access blocking
- 100 concurrent request handling

**Key Entities**: Task (with user_id foreign key), User Reference (external via Better Auth)

**Validation**: All checklist items passed - specification ready for planning.

## Outcome

- Impact: Established comprehensive backend API specification with security-first approach
- Tests: N/A (specification phase)
- Files: spec.md created, requirements.md checklist created
- Next prompts: /sp.plan to create implementation plan
- Reflection: Specification covers all CRUD operations with strong authentication and authorization requirements

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual checklist review PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor if success criteria are achievable during implementation
