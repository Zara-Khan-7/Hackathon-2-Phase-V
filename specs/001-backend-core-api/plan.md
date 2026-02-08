# Implementation Plan: Backend Core & Data Layer

**Branch**: `001-backend-core-api` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-core-api/spec.md`

## Summary

Implement a secure, production-ready FastAPI backend that provides authenticated CRUD operations for user-owned tasks. The backend uses SQLModel as ORM for data modeling, connects to Neon Serverless PostgreSQL for persistence, and validates JWT tokens issued by Better Auth for authentication. All endpoints enforce strict user isolation - users can only access their own tasks.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, SQLModel, python-jose (JWT), psycopg2-binary, python-dotenv
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest, httpx (async test client)
**Target Platform**: Linux server / containerized deployment
**Project Type**: Web application (backend-only for this spec)
**Performance Goals**: <500ms response time, 100 concurrent requests
**Constraints**: JWT-based auth only, no session management, strict user isolation
**Scale/Scope**: Multi-user SaaS, task management domain

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | All endpoints trace to FR-004 through FR-008; spec.md approved |
| II. Security-First Design | PASS | JWT auth on all endpoints (FR-001), user ID from JWT only (FR-002), ownership enforcement (FR-003) |
| III. Separation of Concerns | PASS | Backend-only implementation, no frontend/UI code |
| IV. API-First Design | PASS | RESTful endpoints defined, Pydantic schemas for request/response |
| V. Quality and Type Safety | PASS | Python type hints required, SQLModel provides typing |
| VI. Technology Stack Compliance | PASS | FastAPI + SQLModel + Neon PostgreSQL per constitution |

### Security Checklist (Pre-Implementation)

- [x] All API endpoints require JWT authentication (except health check)
- [x] User ID extracted from JWT, not from request body/params
- [x] All database queries filter by authenticated user
- [x] CORS configured to allow only frontend origin
- [x] Input validation on all API endpoints (Pydantic)
- [x] No secrets in source code or logs (.env required)
- [x] Error messages do not leak sensitive information

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-core-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI)
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database connection and session
│   ├── auth/
│   │   ├── __init__.py
│   │   └── jwt.py           # JWT verification and user extraction
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # SQLModel Task model
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   └── routers/
│       ├── __init__.py
│       └── tasks.py         # Task CRUD endpoints
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest fixtures
│   ├── test_auth.py         # JWT validation tests
│   └── test_tasks.py        # Task CRUD tests
├── requirements.txt
├── .env.example
└── README.md
```

**Structure Decision**: Backend-only structure following constitution's "Backend (Python FastAPI + SQLModel)" guidelines. Entry point at `app/main.py`, models in `app/models/`, routers in `app/routers/`, auth middleware in `app/auth/`.

## Complexity Tracking

> No constitution violations requiring justification. Design follows all principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 1: Architecture Setup
- Define backend project structure (as above)
- Configure FastAPI application entry point (`app/main.py`)
- Load environment variables via `config.py` (DATABASE_URL, JWT_SECRET)
- Configure CORS middleware

### Phase 2: Database Modeling
- Design Task model with SQLModel (`app/models/task.py`)
- Fields: id (UUID), title, description, status, priority, due_date, user_id, created_at, updated_at
- Configure SQLModel + asyncpg engine for Neon PostgreSQL
- Create database session dependency (`app/database.py`)

### Phase 3: Authentication Middleware
- Implement JWT verification utility (`app/auth/jwt.py`)
- Validate token signature using shared secret
- Decode token and extract user identity (`sub` or `user_id` claim)
- Return HTTP 401 for invalid, expired, or missing tokens

### Phase 4: Dependency Injection
- Create reusable `get_current_user` dependency
- Ensure user context is available in all protected routes
- Dependency returns user_id string from validated JWT

### Phase 5: API Route Implementation
- Implement CRUD endpoints in `app/routers/tasks.py`:
  - POST /api/tasks - Create task (201)
  - GET /api/tasks - List user's tasks (200)
  - GET /api/tasks/{id} - Get single task (200/403/404)
  - PUT /api/tasks/{id} - Update task (200/403/404)
  - DELETE /api/tasks/{id} - Delete task (204/403/404)
- All queries filter by `user_id` from JWT
- Return appropriate status codes per spec

### Phase 6: Error Handling & Validation
- Implement Pydantic schemas for request/response validation
- Structured error responses with field-level details
- HTTP 422 for validation errors with details
- HTTP 503 for database connection failures

## Dependencies

### Python Packages (requirements.txt)

```text
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlmodel>=0.0.14
psycopg2-binary>=2.9.9
python-jose[cryptography]>=3.3.0
python-dotenv>=1.0.0
pydantic>=2.5.0
pydantic-settings>=2.1.0

# Testing
pytest>=7.4.0
pytest-asyncio>=0.23.0
httpx>=0.26.0
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| JWT_SECRET | Shared secret with Better Auth | `your-256-bit-secret` |
| JWT_ALGORITHM | JWT signing algorithm | `HS256` |
| CORS_ORIGINS | Allowed frontend origins | `http://localhost:3000` |

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT secret mismatch with Better Auth | Auth failures | Document shared secret setup in quickstart.md |
| Neon connection pool exhaustion | 503 errors | Use connection pooling, document limits |
| UUID collision on task IDs | Data integrity | Use UUID v4 (statistically negligible) |
| SQL injection | Security breach | SQLModel parameterized queries (protected by default) |
