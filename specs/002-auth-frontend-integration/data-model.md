# Data Model: Authentication & Frontend API Integration

**Feature**: 002-auth-frontend-integration
**Date**: 2026-01-09

## Overview

This feature introduces authentication entities managed by Better Auth. The FastAPI backend does NOT directly manage these entities - it only validates JWT tokens and extracts user_id for task ownership.

## Entities

### User (Managed by Better Auth)

Represents an authenticated user in the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique user identifier |
| email | String | Unique, Required | User's email address |
| emailVerified | Boolean | Default: false | Email verification status |
| name | String | Optional | User's display name |
| image | String | Optional | Profile image URL |
| createdAt | DateTime | Auto-generated | Account creation timestamp |
| updatedAt | DateTime | Auto-updated | Last update timestamp |

**Notes**:
- This table is created and managed by Better Auth
- FastAPI backend does NOT query this table directly
- User ID is passed to backend via JWT `sub` claim

### Session (Managed by Better Auth)

Represents an active authentication session.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Session identifier |
| userId | UUID | Foreign Key → User | Associated user |
| token | String | Unique | Session token (hashed) |
| expiresAt | DateTime | Required | Session expiration |
| ipAddress | String | Optional | Client IP address |
| userAgent | String | Optional | Client user agent |
| createdAt | DateTime | Auto-generated | Session creation timestamp |
| updatedAt | DateTime | Auto-updated | Last activity timestamp |

**Notes**:
- Better Auth handles session lifecycle
- Sessions are stored in httpOnly cookies
- JWT tokens are derived from sessions

### Account (Managed by Better Auth)

Links users to authentication providers.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Account identifier |
| userId | UUID | Foreign Key → User | Associated user |
| providerId | String | Required | Auth provider (e.g., "credential") |
| accountId | String | Required | Provider-specific user ID |
| password | String | Hashed, Optional | For credential provider only |
| createdAt | DateTime | Auto-generated | Account creation timestamp |
| updatedAt | DateTime | Auto-updated | Last update timestamp |

**Notes**:
- For email/password auth, providerId = "credential"
- Password is hashed using Better Auth's algorithm
- Future social logins would add new Account records

## JWT Token Structure

JWT tokens issued by Better Auth contain:

```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1704787200,
  "exp": 1704873600
}
```

| Claim | Type | Description |
|-------|------|-------------|
| sub | String (UUID) | User ID - used by FastAPI for task ownership |
| email | String | User's email address |
| name | String | User's display name (optional) |
| iat | Number | Token issued at (Unix timestamp) |
| exp | Number | Token expiration (Unix timestamp) |

**Backend Integration**:
- FastAPI extracts `sub` claim as `user_id`
- All task queries filter by this `user_id`
- No direct database lookup of user table

## Entity Relationships

```
┌─────────────────┐
│      User       │
│   (Better Auth) │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐     ┌─────────────────┐
│    Session      │     │    Account      │
│   (Better Auth) │     │   (Better Auth) │
└─────────────────┘     └─────────────────┘

         │ JWT token with user_id
         ▼
┌─────────────────┐
│      Task       │
│    (FastAPI)    │
│  user_id = sub  │
└─────────────────┘
```

## State Transitions

### User Registration Flow
```
[New User] → signUp(email, password) → [User Created] → [Session Created] → [JWT Issued] → [Authenticated]
```

### User Sign In Flow
```
[Existing User] → signIn(email, password) → [Session Created] → [JWT Issued] → [Authenticated]
```

### Session Lifecycle
```
[No Session] → Sign In → [Active Session] → API Calls → [Active Session]
                              ↓                              ↓
                         Sign Out → [No Session]      Token Expires → [Expired]
                                                           ↓
                                                    Redirect to Login
```

## Validation Rules

### Email
- Must be valid email format
- Must be unique across all users
- Case-insensitive comparison

### Password
- Minimum 8 characters
- Stored as hash (never plaintext)
- Better Auth handles hashing algorithm

### Session
- Expires after 24 hours (configurable)
- One session per device allowed
- Invalidated on sign out

### JWT Token
- Expires after 24 hours (matches session)
- Signed with BETTER_AUTH_SECRET
- Verified by FastAPI using same secret

## Database Considerations

### Better Auth Tables (Neon PostgreSQL)
- Created automatically by Better Auth on first run
- Schema managed by Better Auth migrations
- Located in same database as Task table

### Indexes
- `user.email` - Unique index for login lookup
- `session.userId` - Foreign key index
- `session.token` - Unique index for session lookup
- `account.userId` - Foreign key index

### No Direct FK from Task to User
The Task table does NOT have a foreign key to the Better Auth user table because:
1. FastAPI backend should not depend on Better Auth schema
2. User ID comes from validated JWT (trusted source)
3. Avoids coupling between auth system and business data
4. Enables potential future auth system migration
