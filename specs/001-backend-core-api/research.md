# Research: Backend Core & Data Layer

**Feature**: 001-backend-core-api
**Date**: 2026-01-09
**Status**: Complete

## Overview

This document captures research findings for implementing the FastAPI backend with SQLModel ORM, Neon PostgreSQL, and JWT authentication.

---

## 1. FastAPI + SQLModel Integration

### Decision
Use SQLModel as the ORM layer, which combines SQLAlchemy Core with Pydantic for type-safe database models.

### Rationale
- SQLModel is designed specifically for FastAPI integration
- Single model definition serves as both database model and Pydantic schema
- Built-in type hints and validation
- Constitution mandates SQLModel as ORM

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| SQLAlchemy + Pydantic | Mature, flexible | Duplicate model definitions | SQLModel provides same with less boilerplate |
| Tortoise ORM | Async-native | Less FastAPI integration | Constitution specifies SQLModel |
| Raw SQL | Full control | No type safety, injection risk | Violates Type Safety principle |

### Best Practices
- Use `SQLModel` base class for database tables (with `table=True`)
- Use plain `SQLModel` for request/response schemas
- Define relationships using `Relationship` with `back_populates`
- Use `Field(default=None)` for optional fields
- Use `Field(primary_key=True)` for UUIDs

---

## 2. Neon Serverless PostgreSQL Connection

### Decision
Use synchronous `psycopg2` driver with connection pooling for Neon PostgreSQL.

### Rationale
- Neon is a serverless PostgreSQL - connections may be cold-started
- Connection pooling reduces latency for subsequent requests
- `psycopg2-binary` is well-tested and stable
- Neon requires `sslmode=require` in connection string

### Configuration Pattern
```python
from sqlmodel import create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Disable SQL logging in production
    pool_pre_ping=True,  # Check connection health
    pool_size=5,
    max_overflow=10
)

def get_session():
    with Session(engine) as session:
        yield session
```

### Neon-Specific Considerations
- Connection string format: `postgresql://user:password@host/database?sslmode=require`
- Cold start latency: First request may take 1-2 seconds
- Use connection pooling to mitigate
- Neon supports standard PostgreSQL wire protocol

---

## 3. JWT Authentication with Better Auth

### Decision
Use `python-jose` library for JWT verification with HS256 algorithm.

### Rationale
- Better Auth issues JWT tokens signed with a shared secret
- `python-jose` is the standard JWT library for Python
- HS256 (HMAC-SHA256) is simple and suitable for shared-secret scenarios
- Token payload expected to contain `sub` (subject) claim with user ID

### JWT Verification Pattern
```python
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

### Token Structure (Expected from Better Auth)
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "iat": 1704787200,
  "exp": 1704873600
}
```

### Security Considerations
- Always verify `exp` (expiration) claim
- Use constant-time comparison for signatures (handled by `python-jose`)
- Never log token contents
- Store JWT_SECRET in environment variable only

---

## 4. Task Model Design

### Decision
Use UUID for task IDs with SQLModel + PostgreSQL UUID type.

### Rationale
- UUIDs prevent ID enumeration attacks
- Globally unique without coordination
- PostgreSQL has native UUID type support
- Spec assumption: "Task IDs will be UUIDs for global uniqueness"

### Model Structure
```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    status: TaskStatus = Field(default=TaskStatus.pending)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    due_date: datetime | None = Field(default=None)
    user_id: str = Field(index=True)  # From JWT 'sub' claim
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Field Constraints (from Spec FR-012)
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key, auto-generated |
| title | string | Yes | Max 255 chars |
| description | string | No | Max 2000 chars |
| status | enum | Yes | pending/in_progress/completed |
| priority | enum | Yes | low/medium/high |
| due_date | datetime | No | ISO 8601 format |
| user_id | string | Yes | From JWT, indexed |
| created_at | datetime | Yes | Auto-set on create |
| updated_at | datetime | Yes | Auto-update on modify |

---

## 5. Error Response Structure

### Decision
Use consistent JSON error format with field-level details for validation errors.

### Rationale
- Spec FR-011: "structured error responses with field-level details"
- FastAPI's default validation errors already provide field details
- Consistent structure aids frontend error handling

### Error Response Patterns
```json
// 401 Unauthorized
{
  "detail": "Invalid or expired token"
}

// 403 Forbidden
{
  "detail": "Not authorized to access this resource"
}

// 404 Not Found
{
  "detail": "Task not found"
}

// 422 Validation Error
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 6. CORS Configuration

### Decision
Configure CORS middleware to allow only the frontend origin.

### Rationale
- Constitution Security Standards: "CORS configured to allow only frontend origin"
- Prevents unauthorized cross-origin requests
- Frontend will be on different port during development

### Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Resolved Clarifications

All technical context items have been resolved. No NEEDS CLARIFICATION markers remain.

| Item | Resolution |
|------|------------|
| JWT Algorithm | HS256 (symmetric, shared secret with Better Auth) |
| JWT Claim for User ID | `sub` (subject) claim |
| Database Driver | psycopg2-binary (synchronous, well-tested) |
| Connection Pooling | SQLModel/SQLAlchemy built-in pooling |
| Task ID Type | UUID v4 |
| Timestamp Format | UTC ISO 8601 |

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [python-jose Documentation](https://python-jose.readthedocs.io/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Better Auth JWT Configuration](https://www.better-auth.com/)
