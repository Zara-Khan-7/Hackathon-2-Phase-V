# Feature Specification: Backend Core & Data Layer

**Feature Branch**: `001-backend-core-api`
**Created**: 2026-01-09
**Status**: Draft
**Input**: User description: "Backend Core & Data Layer - FastAPI backend with Task CRUD REST API, SQLModel data modeling, Neon PostgreSQL integration, and JWT-based request authentication"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated User Creates a Task (Priority: P1)

As an authenticated user, I want to create a new task so that I can track my work items.

**Why this priority**: Task creation is the foundational operation. Without the ability to create tasks, no other task operations have meaning. This establishes the core data flow from authenticated request to persistent storage.

**Independent Test**: Can be fully tested by sending a POST request with valid JWT token and task data, then verifying the task is stored in the database with correct user association.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** they send a POST request to create a task with title and description, **Then** the task is created and associated with their user ID extracted from the JWT.
2. **Given** a user sends a create task request without a valid JWT token, **When** the request is processed, **Then** the system returns HTTP 401 Unauthorized.
3. **Given** a user sends a create task request with missing required fields, **When** the request is processed, **Then** the system returns HTTP 422 with validation error details.

---

### User Story 2 - Authenticated User Lists Their Tasks (Priority: P1)

As an authenticated user, I want to retrieve all my tasks so that I can see my work items.

**Why this priority**: Listing tasks is essential for users to see what they've created. This validates the user isolation model - users only see their own tasks.

**Independent Test**: Can be fully tested by creating tasks for multiple users, then verifying each user only sees their own tasks when authenticated.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and has existing tasks, **When** they send a GET request to list tasks, **Then** only tasks belonging to that user are returned.
2. **Given** a user is authenticated but has no tasks, **When** they send a GET request to list tasks, **Then** an empty list is returned with HTTP 200.
3. **Given** two different users each have tasks, **When** User A lists tasks, **Then** User A sees only their own tasks, not User B's tasks.

---

### User Story 3 - Authenticated User Retrieves a Single Task (Priority: P2)

As an authenticated user, I want to retrieve a specific task by its ID so that I can view its details.

**Why this priority**: Single task retrieval enables detailed task views and is prerequisite for update operations. Validates ownership enforcement at the individual task level.

**Independent Test**: Can be fully tested by creating a task, then retrieving it by ID and verifying all fields match.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and owns a task with ID X, **When** they request task X, **Then** the full task details are returned.
2. **Given** a user is authenticated but requests a task ID that doesn't exist, **When** the request is processed, **Then** HTTP 404 Not Found is returned.
3. **Given** User A is authenticated and requests a task owned by User B, **When** the request is processed, **Then** HTTP 403 Forbidden is returned (task ownership violation).

---

### User Story 4 - Authenticated User Updates Their Task (Priority: P2)

As an authenticated user, I want to update my existing task so that I can modify its details, status, priority, or due date.

**Why this priority**: Updates enable task management workflow - marking tasks complete, adjusting priorities, changing due dates.

**Independent Test**: Can be fully tested by creating a task, updating specific fields, then retrieving the task to verify changes persisted.

**Acceptance Scenarios**:

1. **Given** a user owns a task, **When** they send an update request with new values, **Then** the task is updated and the modified timestamp is refreshed.
2. **Given** a user tries to update a task they don't own, **When** the request is processed, **Then** HTTP 403 Forbidden is returned.
3. **Given** a user sends an update with invalid data (e.g., invalid status value), **When** the request is processed, **Then** HTTP 422 with validation details is returned.

---

### User Story 5 - Authenticated User Deletes Their Task (Priority: P3)

As an authenticated user, I want to delete a task I no longer need so that my task list stays relevant.

**Why this priority**: Deletion is a necessary cleanup operation but less frequently used than create/read/update operations.

**Independent Test**: Can be fully tested by creating a task, deleting it, then verifying it no longer appears in task list or by ID retrieval.

**Acceptance Scenarios**:

1. **Given** a user owns a task, **When** they send a DELETE request for that task, **Then** the task is permanently removed and subsequent retrieval returns HTTP 404.
2. **Given** a user tries to delete a task they don't own, **When** the request is processed, **Then** HTTP 403 Forbidden is returned and the task remains intact.
3. **Given** a user tries to delete a non-existent task ID, **When** the request is processed, **Then** HTTP 404 Not Found is returned.

---

### User Story 6 - JWT Token Validation (Priority: P1)

As the system, I need to validate JWT tokens on every request to ensure only authenticated users can access the API.

**Why this priority**: Security is foundational. Without JWT validation, all other user stories are compromised. This is the gatekeeper for the entire API.

**Independent Test**: Can be fully tested by sending requests with valid, expired, malformed, and missing tokens and verifying correct HTTP responses.

**Acceptance Scenarios**:

1. **Given** a request includes a valid, non-expired JWT token, **When** processed, **Then** the user ID is extracted from the token payload and the request proceeds.
2. **Given** a request includes an expired JWT token, **When** processed, **Then** HTTP 401 Unauthorized with "Token expired" message is returned.
3. **Given** a request includes a malformed or invalid JWT signature, **When** processed, **Then** HTTP 401 Unauthorized with "Invalid token" message is returned.
4. **Given** a request has no Authorization header, **When** processed, **Then** HTTP 401 Unauthorized with "Missing authentication" message is returned.

---

### Edge Cases

- What happens when a user submits a task with an extremely long title (>1000 characters)? System enforces maximum length and returns validation error.
- What happens when concurrent requests try to update the same task? Last write wins; system handles gracefully without corruption.
- What happens when the database connection fails? System returns HTTP 503 Service Unavailable with appropriate error message.
- What happens when a JWT token is valid but the user ID doesn't exist in the system? System returns HTTP 401 as the user cannot be verified.
- What happens when task ID format is invalid (non-UUID or non-integer depending on schema)? System returns HTTP 422 validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify JWT tokens on all API endpoints using a shared secret with the authentication provider (Better Auth).
- **FR-002**: System MUST extract user identity exclusively from the validated JWT token payload, never from request body or URL parameters.
- **FR-003**: System MUST enforce task ownership on all operations - users can only access, modify, or delete their own tasks.
- **FR-004**: System MUST provide a REST API endpoint to create a new task (POST /api/tasks).
- **FR-005**: System MUST provide a REST API endpoint to list all tasks for the authenticated user (GET /api/tasks).
- **FR-006**: System MUST provide a REST API endpoint to retrieve a single task by ID (GET /api/tasks/{id}).
- **FR-007**: System MUST provide a REST API endpoint to update an existing task (PUT /api/tasks/{id}).
- **FR-008**: System MUST provide a REST API endpoint to delete a task (DELETE /api/tasks/{id}).
- **FR-009**: System MUST persist all task data to a PostgreSQL database.
- **FR-010**: System MUST return appropriate HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 422 (validation error), 503 (service unavailable).
- **FR-011**: System MUST validate all input data and return structured error responses with field-level details.
- **FR-012**: System MUST support task attributes: title (required), description (optional), status (pending/in_progress/completed), priority (low/medium/high), due_date (optional), created_at (auto), updated_at (auto).
- **FR-013**: System MUST automatically set created_at timestamp when a task is created and update updated_at timestamp on every modification.

### Key Entities

- **Task**: Represents a work item belonging to a user. Key attributes: unique identifier, title, description, status, priority, due_date, created_at, updated_at, owner_user_id. A task belongs to exactly one user.

- **User Reference**: The user is managed by Better Auth (external system). The backend only stores the user_id foreign key from JWT claims to associate tasks with users. No user management is performed by this backend.

## Assumptions

- JWT tokens are issued by Better Auth and signed with a shared secret that the backend has access to via environment variables.
- The JWT payload contains at minimum a `sub` (subject) or `user_id` claim identifying the user.
- The database (Neon PostgreSQL) is provisioned and connection string is available via environment variable.
- Task IDs will be UUIDs for global uniqueness and to prevent enumeration attacks.
- Status values are limited to: "pending", "in_progress", "completed".
- Priority values are limited to: "low", "medium", "high".
- All timestamps are stored and returned in UTC ISO 8601 format.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 CRUD endpoints respond to valid requests within 500ms under normal load.
- **SC-002**: 100% of requests without valid JWT tokens are rejected with HTTP 401.
- **SC-003**: 100% of cross-user access attempts are blocked with HTTP 403.
- **SC-004**: System can handle 100 concurrent authenticated requests without errors.
- **SC-005**: All API responses include appropriate Content-Type headers and follow consistent JSON structure.
- **SC-006**: Error responses include actionable details (field names, validation rules violated) for 100% of validation failures.
- **SC-007**: Backend can start and serve requests independently without requiring frontend deployment.
