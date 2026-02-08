---
id: 002
title: Auth Frontend Implementation Plan
stage: plan
date: 2026-01-09
surface: agent
model: claude-opus-4-5-20251101
feature: 002-auth-frontend-integration
branch: 002-auth-frontend-integration
user: hp
command: /sp.plan
labels: ["planning", "better-auth", "next.js", "jwt", "frontend"]
links:
  spec: specs/002-auth-frontend-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-auth-frontend-integration/plan.md
  - specs/002-auth-frontend-integration/research.md
  - specs/002-auth-frontend-integration/data-model.md
  - specs/002-auth-frontend-integration/quickstart.md
  - specs/002-auth-frontend-integration/contracts/auth-api.yaml
tests:
  - null
---

## Prompt

/sp.plan Todo Full-Stack Web Application — Spec 2

Objective:
Enable secure multi-user authentication using Better Auth on the frontend and establish authenticated API communication with the FastAPI backend using JWT tokens.

Phases:

1. Better Auth Configuration
   - Install and configure Better Auth in Next.js App Router
   - Enable JWT plugin
   - Configure token expiry and claims
   - Set BETTER_AUTH_SECRET via environment variables

2. Auth Routes & Providers
   - Create signup and signin flows
   - Configure Better Auth providers
   - Ensure successful login returns JWT token

3. Token Handling Strategy
   - Decide secure storage mechanism for JWT (Better Auth-managed session)
   - Avoid exposing token in client-side logs
   - Ensure token is accessible for API calls

4. Frontend API Client Setup
   - Create reusable API client utility
   - Automatically attach Authorization header with Bearer token
   - Centralize error handling for auth failures

5. Backend Integration Verification
   - Send authenticated requests to FastAPI backend

## Response snapshot

Created comprehensive implementation plan for Authentication & Frontend API Integration:

**Artifacts Generated:**

1. **research.md** - Technology decisions for Better Auth, JWT storage, API client architecture, protected routes, and secret sharing strategy

2. **data-model.md** - Entity definitions for User, Session, Account (managed by Better Auth), and JWT token structure with `sub` claim for backend integration

3. **contracts/auth-api.yaml** - OpenAPI 3.1 specification for Better Auth endpoints (sign-up, sign-in, sign-out, session, token)

4. **quickstart.md** - Step-by-step setup guide for Next.js + Better Auth + Prisma with environment configuration

5. **plan.md** - Complete implementation plan with:
   - Technical context (TypeScript, Next.js 16+, Better Auth, Prisma)
   - Constitution check (all 6 principles PASS)
   - 6 implementation phases
   - Project structure for frontend/
   - Dependencies and environment variables
   - Risk analysis and mitigations

**Key Decisions:**
- JWT tokens stored in httpOnly cookies (Better Auth default)
- Prisma adapter for Better Auth database (same Neon PostgreSQL)
- Centralized `apiClient()` wrapper for authenticated API calls
- Next.js middleware for route protection
- Shared `BETTER_AUTH_SECRET` = `JWT_SECRET` between frontend and backend

## Outcome

- ✅ Impact: Complete architectural plan for authentication and frontend-backend integration
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 5 artifacts created (plan.md, research.md, data-model.md, quickstart.md, auth-api.yaml)
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Plan aligns with constitution principles. Clear separation between Better Auth (user management) and FastAPI (business data). JWT shared secret approach documented for integration.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS (all 6 principles)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
