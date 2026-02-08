# Implementation Plan: Frontend UI & User Experience

**Branch**: `003-frontend-ui` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-ui/spec.md`

## Summary

Build a production-ready task management UI for authenticated users. The frontend enables full CRUD operations on tasks (view, create, update, delete) with filtering by status and priority. The implementation builds on the existing authentication frontend (Spec 2) and integrates with the backend API (Spec 1). Key features include responsive design (320px+), client-side filtering, modal dialogs for forms, and toast notifications for feedback.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+
**Primary Dependencies**: Next.js 16+ (App Router), React 19, Tailwind CSS
**Storage**: N/A (frontend only - uses backend API)
**Testing**: Manual testing (not in spec scope)
**Target Platform**: Web browser (responsive: mobile 320px+, tablet, desktop)
**Project Type**: Web application (frontend)
**Performance Goals**: <2s task list load, <30s task creation flow
**Constraints**: Client-side only, auth via Better Auth, no offline support
**Scale/Scope**: Single-user task list (<100 tasks typical)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | All components trace to FR-001 through FR-021; spec.md approved |
| II. Security-First Design | PASS | Protected routes via middleware, auth required for API calls (Spec 2) |
| III. Separation of Concerns | PASS | Frontend UI only, business logic in backend (Spec 1) |
| IV. API-First Design | PASS | Uses defined REST endpoints from Spec 1 via authenticated API client |
| V. Quality and Type Safety | PASS | TypeScript required, type definitions for all entities |
| VI. Technology Stack Compliance | PASS | Next.js 16+ App Router per constitution |

### Security Checklist (Pre-Implementation)

- [x] All task pages protected via middleware (existing from Spec 2)
- [x] API calls use authenticated client with JWT (existing from Spec 2)
- [x] User ID from JWT, not client input (backend enforcement)
- [x] No secrets in frontend code
- [x] Input validation before API calls

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-ui/
├── plan.md                      # This file
├── research.md                  # Phase 0 output
├── data-model.md                # Phase 1 output
├── quickstart.md                # Phase 1 output
├── contracts/                   # Phase 1 output
│   └── component-contracts.md
└── tasks.md                     # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
frontend/src/
├── app/
│   ├── (auth)/                       # Existing auth pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx                # Existing protected layout
│   │   └── dashboard/
│   │       └── page.tsx              # Enhanced task dashboard
│   ├── api/auth/[...all]/route.ts    # Existing auth handler
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
├── components/
│   ├── auth/                         # Existing auth components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── signout-button.tsx
│   ├── tasks/                        # NEW: Task feature components
│   │   ├── task-list.tsx
│   │   ├── task-card.tsx
│   │   ├── task-form.tsx
│   │   ├── task-filters.tsx
│   │   └── delete-confirmation.tsx
│   └── ui/                           # Existing + new UI primitives
│       ├── button.tsx                # Existing
│       ├── input.tsx                 # Existing
│       ├── dialog.tsx                # NEW
│       ├── select.tsx                # NEW
│       └── textarea.tsx              # NEW
├── hooks/                            # NEW: Custom hooks
│   ├── useTasks.ts
│   └── useToast.ts
├── types/                            # NEW: Type definitions
│   └── task.ts
├── lib/
│   ├── auth.ts                       # Existing
│   ├── auth-client.ts                # Existing
│   ├── api-client.ts                 # Existing
│   ├── utils.ts                      # Existing
│   └── api/
│       └── tasks.ts                  # Existing (may need updates)
├── middleware.ts                     # Existing route protection
└── contexts/                         # NEW: React contexts
    └── toast-context.tsx
```

**Structure Decision**: Frontend-only implementation within existing Next.js App Router structure. New components organized by feature (`tasks/`) with shared UI primitives in `ui/`. Custom hooks in dedicated `hooks/` directory. All types centralized in `types/`.

## Complexity Tracking

> No constitution violations requiring justification. Design follows all principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 1: UI Components Setup

- Create new UI primitives: Dialog, Select, Textarea
- Ensure consistent styling with existing Button, Input
- Add accessibility support (focus management, keyboard navigation)

### Phase 2: Type Definitions

- Centralize task types in `types/task.ts`
- Define component prop interfaces
- Define hook return types

### Phase 3: Task List Display (US1)

- Create TaskCard component
- Create TaskList component
- Enhance dashboard page to display tasks
- Add loading skeleton and empty state

### Phase 4: Task Creation (US2)

- Create TaskForm component (create mode)
- Add "Add Task" button to dashboard
- Integrate with useTasks hook
- Add success/error feedback

### Phase 5: Task Status Updates (US3)

- Add status dropdown to TaskCard
- Implement inline status change
- Add visual status indicators

### Phase 6: Task Editing (US4)

- Extend TaskForm for edit mode
- Add edit button to TaskCard
- Implement update flow with validation

### Phase 7: Task Deletion (US5)

- Create DeleteConfirmation dialog
- Add delete button to TaskCard
- Implement deletion with confirmation

### Phase 8: Task Filtering (US6)

- Create TaskFilters component
- Implement client-side filtering
- Sync filters with URL params

### Phase 9: Toast Notifications

- Create ToastContext and useToast hook
- Add toast container to layout
- Integrate with CRUD operations

### Phase 10: Responsive Polish (US7)

- Test and adjust layouts at 320px, 768px, 1024px
- Ensure touch-friendly targets on mobile
- Verify all features work on mobile

## Dependencies

### Node.js Packages (already installed)

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "better-auth": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

### No New Dependencies Required

All functionality achievable with existing stack per research.md.

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex form state management | Medium | Use simple controlled components, no external library |
| Mobile layout issues | Medium | Mobile-first approach, test early on real devices |
| API error handling edge cases | Low | Centralized error handling in useTasks hook |
| Filter state lost on refresh | Low | Sync filters to URL query params |
| Accessibility gaps | Medium | Follow WCAG 2.1 AA, test with keyboard/screen reader |

## Integration Points

### From Spec 1 (Backend API)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tasks` | GET | Fetch all user tasks |
| `/api/tasks` | POST | Create new task |
| `/api/tasks/{id}` | PATCH | Update task |
| `/api/tasks/{id}` | DELETE | Delete task |

### From Spec 2 (Auth Frontend)

| Component/Module | Purpose |
|------------------|---------|
| `middleware.ts` | Protects /dashboard route |
| `(protected)/layout.tsx` | Server-side auth check |
| `lib/api-client.ts` | Authenticated fetch wrapper |
| `lib/api/tasks.ts` | Typed task API methods |
| `components/ui/button.tsx` | Button component |
| `components/ui/input.tsx` | Input component |
| `components/auth/signout-button.tsx` | Sign out functionality |

## Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | All phases map to user stories and FRs |
| II. Security-First Design | PASS | Leverages existing auth from Spec 2 |
| III. Separation of Concerns | PASS | UI components separated by feature |
| IV. API-First Design | PASS | Uses existing API client from Spec 2 |
| V. Quality and Type Safety | PASS | TypeScript types for all entities |
| VI. Technology Stack Compliance | PASS | No new dependencies, uses approved stack |
