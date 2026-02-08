# Research: Authentication & Frontend API Integration

**Feature**: 002-auth-frontend-integration
**Date**: 2026-01-09
**Purpose**: Resolve technical decisions for Better Auth + Next.js integration with FastAPI backend

## Research Tasks

### 1. Better Auth Configuration for Next.js App Router

**Decision**: Use Better Auth v1.x with email/password provider and JWT plugin

**Rationale**:
- Better Auth is the constitution-mandated authentication library
- Native support for Next.js App Router with server/client component separation
- Built-in JWT plugin for token issuance compatible with FastAPI backend
- Session management handled automatically via cookies

**Alternatives Considered**:
- NextAuth.js: More mature but not constitution-compliant
- Auth.js: Good but Better Auth specifically required by constitution
- Custom JWT implementation: Unnecessary complexity

**Configuration Approach**:
```
lib/
├── auth.ts              # Better Auth server configuration
├── auth-client.ts       # Client-side auth utilities
└── api-client.ts        # Authenticated fetch wrapper
```

### 2. JWT Token Storage Strategy

**Decision**: Use Better Auth's built-in session cookie with JWT bearer token for API calls

**Rationale**:
- Better Auth stores session in httpOnly cookie (secure by default)
- JWT token retrieved via `getToken()` for API Authorization headers
- No manual localStorage/sessionStorage management required
- Protects against XSS attacks (httpOnly cookie)
- CSRF protection via SameSite cookie attribute

**Alternatives Considered**:
- localStorage: Vulnerable to XSS, rejected
- sessionStorage: Lost on browser close, rejected
- Memory-only: Lost on refresh, rejected

**Token Flow**:
1. User authenticates via Better Auth
2. Better Auth creates session cookie + JWT token
3. Frontend calls `getToken()` to get JWT for API calls
4. JWT included in `Authorization: Bearer <token>` header
5. FastAPI backend verifies token using shared secret

### 3. API Client Architecture

**Decision**: Create centralized fetch wrapper with automatic token attachment and 401 handling

**Rationale**:
- Single point for adding Authorization header
- Centralized error handling for auth failures
- Automatic redirect to login on 401/403
- Consistent error message formatting

**Implementation Pattern**:
```typescript
// lib/api-client.ts
export async function apiClient(endpoint: string, options?: RequestInit) {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Redirect to login
    redirect('/login?error=session_expired');
  }

  return response;
}
```

### 4. Protected Route Strategy

**Decision**: Use Next.js middleware + Better Auth session check

**Rationale**:
- Middleware runs before page render (SSR-compatible)
- Protects both SSR and client-side navigation
- Redirects unauthenticated users to login with return URL
- Better Auth provides `getSession()` for server-side checks

**Protected Routes Pattern**:
- `/dashboard/*` - Requires authentication
- `/tasks/*` - Requires authentication
- `/login`, `/signup` - Public (redirect if authenticated)
- `/` - Public landing page

### 5. Better Auth + FastAPI Secret Sharing

**Decision**: Use `BETTER_AUTH_SECRET` environment variable on both frontend and backend

**Rationale**:
- Same secret ensures JWT verification works on FastAPI
- Environment variable approach per constitution (no hardcoded secrets)
- Better Auth uses this for signing tokens
- FastAPI backend uses same secret for verification

**Environment Variables**:
| Variable | Location | Purpose |
|----------|----------|---------|
| BETTER_AUTH_SECRET | Frontend (.env.local) | JWT signing secret |
| JWT_SECRET | Backend (.env) | JWT verification (same value as BETTER_AUTH_SECRET) |
| BETTER_AUTH_URL | Frontend (.env.local) | Auth endpoint base URL |
| NEXT_PUBLIC_API_URL | Frontend (.env.local) | FastAPI backend URL |

### 6. User Table and Better Auth Database

**Decision**: Better Auth manages its own user/session tables, FastAPI references user_id from JWT

**Rationale**:
- Better Auth needs database access for user storage and session management
- Better Auth can use the same Neon PostgreSQL database
- FastAPI backend does NOT query user table directly - only uses user_id from JWT
- Task table references user_id from JWT payload (no foreign key to Better Auth tables)

**Database Separation**:
- Better Auth tables: `user`, `session`, `account`, `verification` (managed by Better Auth)
- FastAPI tables: `task` (references user_id from JWT, no direct FK)

This ensures:
- Better Auth handles all user CRUD
- FastAPI only validates JWT and uses user_id
- No coupling between Better Auth schema and business data

### 7. Error Handling Strategy

**Decision**: Implement toast notifications for auth errors with automatic redirect

**Rationale**:
- User-friendly error messages
- Clear feedback on session expiration
- Preserves return URL for post-login redirect
- Non-blocking UI pattern

**Error Types**:
| Error | User Message | Action |
|-------|--------------|--------|
| 401 Unauthorized | "Your session has expired. Please sign in again." | Redirect to /login |
| 403 Forbidden | "You don't have permission to access this resource." | Show error, stay on page |
| Network Error | "Unable to connect. Please check your internet connection." | Show retry option |
| Validation Error | Field-specific messages | Show inline errors |

## Technology Versions

| Technology | Version | Notes |
|------------|---------|-------|
| Better Auth | ^1.0.0 | Latest stable with JWT plugin |
| Next.js | 16+ | App Router required |
| TypeScript | ^5.0.0 | Strict mode enabled |
| React | ^19.0.0 | Next.js 16 default |

## Integration Points

### Frontend → Better Auth
- `signIn()` - Email/password authentication
- `signUp()` - User registration
- `signOut()` - Session termination
- `getSession()` - Server-side session check
- `useSession()` - Client-side session hook

### Frontend → FastAPI Backend
- All requests use `apiClient()` wrapper
- JWT token in `Authorization: Bearer <token>` header
- Backend verifies token using shared secret
- User ID extracted from JWT `sub` claim

### Better Auth → Neon PostgreSQL
- Better Auth manages user/session tables
- Connection via `DATABASE_URL` in .env.local
- Uses Prisma adapter or direct PostgreSQL

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT secret mismatch | Auth failures | Document exact secret sharing in quickstart.md |
| Token expiration during active use | Poor UX | Implement token refresh or long expiry (24h) |
| CORS issues | API calls blocked | Configure CORS_ORIGINS on backend |
| SSR/CSR session mismatch | Hydration errors | Use consistent session check pattern |
