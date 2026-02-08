# Tasks: Authentication & Frontend API Integration

**Input**: Design documents from `/specs/002-auth-frontend-integration/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/auth-api.yaml, research.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification. Test tasks are omitted per task generation rules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend structure**: `frontend/` for all source code
- Paths follow plan.md project structure

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create Next.js project and install dependencies

- [x] T001 Create Next.js project with TypeScript and Tailwind at `frontend/` using `create-next-app`
- [x] T002 [P] Install Better Auth dependency: `npm install better-auth`
- [x] T003 [P] Install Prisma dependencies: `npm install @prisma/client prisma`
- [x] T004 [P] Install UI utility dependencies: `npm install class-variance-authority clsx tailwind-merge`
- [x] T005 [P] Create `frontend/.env.local.example` with BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, NEXT_PUBLIC_API_URL placeholders
- [x] T006 [P] Create `frontend/src/lib/` directory for auth utilities

**Checkpoint**: Project structure ready for Better Auth configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Better Auth infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create Prisma schema for Better Auth tables (User, Session, Account) in `frontend/prisma/schema.prisma`
- [x] T008 Run `prisma generate` and `prisma db push` to create Better Auth tables in Neon PostgreSQL
- [x] T009 Create Better Auth server configuration in `frontend/src/lib/auth.ts` with email/password provider, Prisma adapter, 24h session expiry
- [x] T010 Create Better Auth route handler in `frontend/src/app/api/auth/[...all]/route.ts`
- [x] T011 [P] Create auth client utilities in `frontend/src/lib/auth-client.ts` with signIn, signUp, signOut, useSession exports
- [x] T012 [P] Create base UI components: Button in `frontend/src/components/ui/button.tsx`
- [x] T013 [P] Create base UI components: Input in `frontend/src/components/ui/input.tsx`
- [x] T014 Create root layout in `frontend/src/app/layout.tsx` with metadata and global styles

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - New User Registration (Priority: P1)

**Goal**: Enable new users to create accounts via signup form with email/password

**Independent Test**: Visit signup page, enter valid email and password, verify redirect to dashboard with active session

### Implementation for User Story 1

- [x] T015 [US1] Create signup form component in `frontend/src/components/auth/signup-form.tsx` with email, password, name fields and validation
- [x] T016 [US1] Create signup page in `frontend/src/app/(auth)/signup/page.tsx` using signup-form component
- [x] T017 [US1] Add email format validation (FR-002) in signup-form.tsx with inline error display
- [x] T018 [US1] Add password validation (FR-003) minimum 8 characters with error message in signup-form.tsx
- [x] T019 [US1] Implement form submission using Better Auth signUp() with loading state
- [x] T020 [US1] Add duplicate email error handling (display "Email already registered" message)
- [x] T021 [US1] Implement redirect to dashboard on successful registration

**Checkpoint**: Users can register new accounts - US1 complete

---

## Phase 4: User Story 2 - Existing User Sign In (Priority: P1)

**Goal**: Enable returning users to sign in and receive JWT token

**Independent Test**: Visit login page, enter valid credentials, verify redirect to dashboard with JWT session

### Implementation for User Story 2

- [x] T022 [US2] Create login form component in `frontend/src/components/auth/login-form.tsx` with email and password fields
- [x] T023 [US2] Create login page in `frontend/src/app/(auth)/login/page.tsx` using login-form component
- [x] T024 [US2] Add empty field validation with "Required field" error messages
- [x] T025 [US2] Implement form submission using Better Auth signIn() with loading state
- [x] T026 [US2] Add invalid credentials error handling (generic "Invalid email or password" per security best practice)
- [x] T027 [US2] Implement redirect to dashboard on successful sign in

**Checkpoint**: Users can sign in - US1 and US2 complete

---

## Phase 5: User Story 3 - Authenticated API Communication (Priority: P1)

**Goal**: Create API client that automatically attaches JWT to all backend requests

**Independent Test**: Sign in, create a task via API client, verify task appears in database with correct user_id

### Implementation for User Story 3

- [x] T028 [US3] Create API client wrapper in `frontend/src/lib/api-client.ts` with automatic Authorization header attachment
- [x] T029 [US3] Implement getToken() call to retrieve JWT from Better Auth session in api-client.ts
- [x] T030 [US3] Add NEXT_PUBLIC_API_URL configuration for backend endpoint in api-client.ts
- [x] T031 [US3] Create typed API methods for tasks: getTasks(), createTask(), updateTask(), deleteTask() in `frontend/src/lib/api/tasks.ts`
- [x] T032 [US3] Create placeholder dashboard page in `frontend/src/app/(protected)/dashboard/page.tsx` that displays user email and fetches tasks

**Checkpoint**: Frontend can communicate with backend API - US3 complete

---

## Phase 6: User Story 4 - Session Persistence (Priority: P2)

**Goal**: Sessions persist across browser restarts for 24 hours

**Independent Test**: Sign in, close browser, reopen, verify still authenticated

### Implementation for User Story 4

- [x] T033 [US4] Verify Better Auth session cookie configuration (httpOnly, 24h expiry) in `frontend/src/lib/auth.ts`
- [x] T034 [US4] Create protected layout in `frontend/src/app/(protected)/layout.tsx` with server-side session check using getSession()
- [x] T035 [US4] Implement session expiration redirect when session is expired (redirect to /login)

**Checkpoint**: Sessions persist correctly - US4 complete

---

## Phase 7: User Story 5 - User Sign Out (Priority: P2)

**Goal**: Users can sign out and session is terminated

**Independent Test**: Sign in, click sign out, verify cannot access protected routes

### Implementation for User Story 5

- [x] T036 [US5] Create sign out button component in `frontend/src/components/auth/signout-button.tsx` using Better Auth signOut()
- [x] T037 [US5] Add sign out button to dashboard page header in `frontend/src/app/(protected)/dashboard/page.tsx`
- [x] T038 [US5] Implement redirect to login page after sign out

**Checkpoint**: Users can sign out - US5 complete

---

## Phase 8: User Story 6 - Unauthorized Response Handling (Priority: P2)

**Goal**: Frontend gracefully handles 401 responses with redirect to login

**Independent Test**: Manually expire token, attempt API call, verify redirect to login with message

### Implementation for User Story 6

- [x] T039 [US6] Add 401 response handling in `frontend/src/lib/api-client.ts` with redirect to /login?error=session_expired
- [x] T040 [US6] Add 403 response handling in `frontend/src/lib/api-client.ts` with error message display
- [x] T041 [US6] Create Next.js middleware in `frontend/src/middleware.ts` for route protection
- [x] T042 [US6] Configure middleware matcher for /dashboard and other protected routes
- [x] T043 [US6] Add error query parameter handling in login page to show "Session expired" message

**Checkpoint**: Unauthorized responses handled gracefully - US6 complete

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and improvements

- [x] T044 [P] Create landing page in `frontend/src/app/page.tsx` with links to login and signup
- [x] T045 [P] Add navigation between login and signup pages (link: "Already have an account?" / "Need an account?")
- [x] T046 Verify CORS configuration on backend includes frontend origin (http://localhost:3000)
- [x] T047 Verify BETTER_AUTH_SECRET matches JWT_SECRET in backend .env
- [x] T048 Run frontend development server and test full auth flow end-to-end
- [x] T049 [P] Create `frontend/README.md` with setup instructions referencing quickstart.md

**Checkpoint**: Authentication frontend complete and ready for task UI implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion (can parallel with US1)
- **User Story 3 (Phase 5)**: Depends on US1 or US2 (needs auth to test)
- **User Story 4 (Phase 6)**: Depends on US1+US2 (needs working auth)
- **User Story 5 (Phase 7)**: Depends on US1+US2 (needs working auth)
- **User Story 6 (Phase 8)**: Depends on US3 (needs API client)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

| Story | Priority | Depends On | Can Start After |
|-------|----------|------------|-----------------|
| US1 (Registration) | P1 | Foundational | Phase 2 |
| US2 (Sign In) | P1 | Foundational | Phase 2 |
| US3 (API Client) | P1 | US1 or US2 | Phase 3 or 4 |
| US4 (Session) | P2 | US1, US2 | Phase 4 |
| US5 (Sign Out) | P2 | US1, US2 | Phase 4 |
| US6 (401 Handling) | P2 | US3 | Phase 5 |

### Parallel Opportunities

**Phase 1 (all parallelizable after T001)**:
```
T002, T003, T004, T005, T006 - all can run in parallel after project created
```

**Phase 2 (partial parallelization)**:
```
Sequential: T007 → T008 → T009 → T010 (Better Auth setup)
Parallel after T010: T011, T012, T013 (auth client, UI components)
Sequential: T014 (layout depends on all above)
```

**Phase 3+4 (can run in parallel)**:
```
US1 (T015-T021) and US2 (T022-T027) can be developed in parallel
Both create separate form components in different files
```

**Phase 9 (mostly parallelizable)**:
```
T044, T045, T049 - all can run in parallel
```

---

## Implementation Strategy

### MVP First (Phase 1-5)

1. Complete Phase 1: Setup (~10 mins)
2. Complete Phase 2: Foundational (~20 mins)
3. Complete Phase 3: US1 Registration (~15 mins)
4. Complete Phase 4: US2 Sign In (~10 mins)
5. Complete Phase 5: US3 API Client (~15 mins)
6. **STOP and VALIDATE**: Test registration, login, and API communication end-to-end
7. Deploy/demo if ready - users can register, sign in, and access backend

### Incremental Delivery

1. Setup + Foundational → Better Auth infrastructure ready
2. Add US1+US2 → Test independently → **MVP!** (users can authenticate)
3. Add US3 → Test independently → Frontend talks to backend
4. Add US4+US5 → Test independently → Session management complete
5. Add US6 → Test independently → Error handling complete
6. Add Polish → Production ready

### Task Execution Notes

- Each task should take 5-15 minutes for an LLM to complete
- Commit after each phase completion
- Run `pnpm dev` to verify after each phase
- Test auth flow with actual backend running after Phase 5

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 49 |
| Setup Tasks | 6 |
| Foundational Tasks | 8 |
| US1 (Registration) Tasks | 7 |
| US2 (Sign In) Tasks | 6 |
| US3 (API Client) Tasks | 5 |
| US4 (Session) Tasks | 3 |
| US5 (Sign Out) Tasks | 3 |
| US6 (401 Handling) Tasks | 5 |
| Polish Tasks | 6 |
| Parallelizable Tasks | 16 |
| MVP Scope | Phases 1-5 (32 tasks) |
