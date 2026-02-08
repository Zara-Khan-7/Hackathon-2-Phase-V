# Implementation Plan: Authentication & Frontend API Integration

**Branch**: `002-auth-frontend-integration` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-auth-frontend-integration/spec.md`

## Summary

Implement secure multi-user authentication using Better Auth on the Next.js frontend with JWT-based API communication to the FastAPI backend. Users can register, sign in, and sign out. All API requests automatically include JWT tokens for authentication, and the frontend gracefully handles authentication errors.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+
**Primary Dependencies**: Next.js 16+ (App Router), Better Auth, Prisma (for Better Auth database)
**Storage**: Neon Serverless PostgreSQL (shared with backend)
**Testing**: Jest, React Testing Library
**Target Platform**: Web browser (responsive)
**Project Type**: Web application (frontend)
**Performance Goals**: <30s registration, <10s sign-in to dashboard
**Constraints**: JWT-based auth only, shared secret with backend, no social login
**Scale/Scope**: Multi-user SaaS, authenticated task management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | All components trace to FR-001 through FR-013; spec.md approved |
| II. Security-First Design | PASS | JWT stored in httpOnly cookie (FR-006), shared secret (FR-012), 401 handling (FR-011) |
| III. Separation of Concerns | PASS | Frontend-only implementation, auth via Better Auth, API via FastAPI |
| IV. API-First Design | PASS | All backend communication via defined REST endpoints with JWT |
| V. Quality and Type Safety | PASS | TypeScript required, strict mode enabled |
| VI. Technology Stack Compliance | PASS | Next.js 16+ App Router + Better Auth per constitution |

### Security Checklist (Pre-Implementation)

- [x] JWT token stored in httpOnly cookie (Better Auth default)
- [x] Token included in Authorization header for API calls
- [x] Shared secret between Better Auth and FastAPI
- [x] 401/403 responses handled with user-friendly redirects
- [x] No secrets in source code (environment variables)
- [x] CORS configured on backend for frontend origin
- [x] Password minimum 8 characters enforced

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-frontend-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── auth-api.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts        # Better Auth route handler
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   └── signup/
│   │       └── page.tsx            # Signup page
│   ├── (protected)/
│   │   ├── layout.tsx              # Protected layout with auth check
│   │   └── dashboard/
│   │       └── page.tsx            # User dashboard
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── middleware.ts               # Route protection middleware
├── components/
│   ├── auth/
│   │   ├── login-form.tsx          # Login form component
│   │   ├── signup-form.tsx         # Signup form component
│   │   └── signout-button.tsx      # Sign out button
│   └── ui/
│       ├── button.tsx              # Button component
│       ├── input.tsx               # Input component
│       └── form.tsx                # Form components
├── lib/
│   ├── auth.ts                     # Better Auth server configuration
│   ├── auth-client.ts              # Client-side auth utilities
│   └── api-client.ts               # Authenticated API fetch wrapper
├── prisma/
│   └── schema.prisma               # Better Auth database schema
├── .env.local.example              # Environment template
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

**Structure Decision**: Frontend-only structure following Next.js App Router conventions. Better Auth configuration in `lib/`, auth pages in `(auth)/` route group, protected pages in `(protected)/` route group with layout-based auth check.

## Complexity Tracking

> No constitution violations requiring justification. Design follows all principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 1: Project Setup & Better Auth Configuration
- Create Next.js project with TypeScript and Tailwind
- Install Better Auth and Prisma dependencies
- Configure Better Auth with email/password provider
- Set up Prisma schema for Better Auth tables
- Configure environment variables

### Phase 2: Auth Route Handler
- Create Better Auth API route handler at `/api/auth/[...all]`
- Configure JWT plugin for token issuance
- Set session expiration (24 hours)
- Test auth endpoints with curl

### Phase 3: Auth Pages (Registration & Login)
- Create signup page with form validation
- Create login page with error handling
- Implement client-side auth state management
- Add loading states and error messages

### Phase 4: Session Management
- Create auth client utilities for session access
- Implement `useSession` hook for components
- Create protected layout with auth check
- Implement middleware for route protection

### Phase 5: API Client Integration
- Create authenticated fetch wrapper
- Implement automatic JWT token attachment
- Add 401/403 error handling with redirects
- Create reusable API hooks for tasks

### Phase 6: Sign Out & Error Handling
- Implement sign out functionality
- Add session expiration handling
- Create error boundary for auth errors
- Add toast notifications for auth events

## Dependencies

### Node.js Packages (package.json)

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "better-auth": "^1.0.0",
    "@prisma/client": "^5.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| BETTER_AUTH_SECRET | JWT signing secret (must match backend) | `your-256-bit-secret` |
| BETTER_AUTH_URL | Auth base URL | `http://localhost:3000` |
| DATABASE_URL | Neon PostgreSQL connection | `postgresql://user:pass@host/db?sslmode=require` |
| NEXT_PUBLIC_API_URL | FastAPI backend URL | `http://localhost:8000` |

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT secret mismatch with backend | All API calls fail | Document exact secret sharing in quickstart.md |
| Better Auth version incompatibility | Auth flows break | Pin version in package.json |
| Session cookie not persisting | Users logged out unexpectedly | Test across browsers, document cookie settings |
| CORS issues with backend | API calls blocked | Document CORS_ORIGINS configuration |
| Prisma schema drift | Database errors | Use `prisma db push` carefully, document migrations |

## Integration Points

### Frontend ↔ Better Auth
- `signIn()`, `signUp()`, `signOut()` for auth actions
- `useSession()` hook for client-side session state
- `getSession()` for server-side session access
- Cookie-based session storage (httpOnly)

### Frontend ↔ FastAPI Backend
- `apiClient()` wrapper for all API calls
- JWT token in `Authorization: Bearer <token>` header
- Backend verifies token using shared `JWT_SECRET`
- User ID extracted from JWT `sub` claim

### Better Auth ↔ Neon PostgreSQL
- Prisma adapter for database operations
- User, Session, Account tables managed by Better Auth
- Same database as FastAPI backend (task table)

## Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | All implementation phases map to spec requirements |
| II. Security-First Design | PASS | httpOnly cookies, shared secrets, proper error handling |
| III. Separation of Concerns | PASS | Auth in lib/, UI in components/, pages in app/ |
| IV. API-First Design | PASS | Centralized API client, consistent request pattern |
| V. Quality and Type Safety | PASS | TypeScript strict mode, Prisma typed client |
| VI. Technology Stack Compliance | PASS | All technologies match constitution requirements |
