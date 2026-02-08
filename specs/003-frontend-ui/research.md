# Research: Frontend UI & User Experience

**Feature**: 003-frontend-ui
**Date**: 2026-01-09

## Research Overview

This document consolidates research findings for building the task management UI on top of the existing authentication frontend (Spec 2) and backend API (Spec 1).

---

## Research Decision 1: Component Architecture

**Context**: Need to determine component organization for task CRUD operations with reusability and maintainability.

**Decision**: Feature-based component organization with atomic UI primitives

**Rationale**:
- Separate "task" feature components from generic UI components
- Atomic UI components (Button, Input) already exist from Spec 2
- Task-specific components grouped in `components/tasks/`
- Promotes component reuse and clear responsibility boundaries

**Alternatives Considered**:
1. **Flat component structure** - Rejected: Doesn't scale well, harder to find related components
2. **Page-based components** - Rejected: Less reusable across multiple views
3. **Atomic Design (full)** - Rejected: Overkill for current scope, adds complexity

**Implementation**:
```
components/
├── ui/           # Atomic primitives (existing)
│   ├── button.tsx
│   ├── input.tsx
│   └── dialog.tsx (new)
├── auth/         # Auth components (existing)
└── tasks/        # Task feature components (new)
    ├── task-list.tsx
    ├── task-card.tsx
    ├── task-form.tsx
    ├── task-filters.tsx
    └── delete-confirmation.tsx
```

---

## Research Decision 2: State Management Pattern

**Context**: Need to manage task list state, loading states, error states, and optimistic updates for CRUD operations.

**Decision**: React hooks with local component state + server state via custom hooks

**Rationale**:
- React 19 provides excellent built-in state management
- Custom hooks (`useTasks`) encapsulate API calls and state
- No need for global state library (Redux, Zustand) for this scope
- Simpler mental model and less code
- API client already handles token management from Spec 2

**Alternatives Considered**:
1. **Redux Toolkit** - Rejected: Overkill for single-user task list
2. **Zustand** - Rejected: Unnecessary indirection for simple CRUD
3. **React Query / SWR** - Considered: Good option but adds dependency; manual implementation is simpler for MVP
4. **Server Components only** - Rejected: Need client interactivity for real-time updates

**Implementation**:
```typescript
// hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD operations that update local state after API calls
  const createTask = async (data: CreateTaskInput) => { ... };
  const updateTask = async (id: string, data: UpdateTaskInput) => { ... };
  const deleteTask = async (id: string) => { ... };

  return { tasks, isLoading, error, createTask, updateTask, deleteTask, refresh };
}
```

---

## Research Decision 3: Form Handling Strategy

**Context**: Need to handle task creation and editing forms with validation.

**Decision**: Controlled components with inline validation using native React state

**Rationale**:
- Consistent with existing auth forms from Spec 2
- Simple validation rules (title required, date format)
- No complex form libraries needed
- Direct control over validation timing and error display

**Alternatives Considered**:
1. **React Hook Form** - Rejected: Dependency overhead for simple forms
2. **Formik** - Rejected: Deprecated in favor of React Hook Form
3. **Uncontrolled forms with FormData** - Rejected: Less control over validation UX

**Implementation**:
```typescript
// Validation functions
const validateTaskForm = (data: TaskFormData): FormErrors => {
  const errors: FormErrors = {};
  if (!data.title?.trim()) errors.title = "Title is required";
  if (data.due_date && !isValidDate(data.due_date)) errors.due_date = "Invalid date";
  return errors;
};
```

---

## Research Decision 4: UI Feedback Patterns

**Context**: Need to provide feedback for loading, success, and error states per FR-016, FR-017, FR-018.

**Decision**: Inline loading indicators + toast notifications for success/error

**Rationale**:
- Loading states shown inline where action occurs (button states, skeleton loaders)
- Success/error feedback via toast notifications for non-blocking UX
- Error states in forms shown inline below fields
- Simple implementation without external toast library

**Alternatives Considered**:
1. **Modal dialogs for all feedback** - Rejected: Disruptive UX for routine actions
2. **react-hot-toast** - Considered: Good library but adds dependency
3. **Browser alerts** - Rejected: Poor UX, blocks interaction

**Implementation**:
```typescript
// Simple toast context
const ToastContext = createContext<ToastContextType>(null);

// Usage
const { showToast } = useToast();
showToast({ type: 'success', message: 'Task created!' });
```

---

## Research Decision 5: Filter Implementation

**Context**: Need to filter tasks by status and priority per FR-013, FR-014, FR-015.

**Decision**: Client-side filtering with URL query params for shareable state

**Rationale**:
- Task lists are typically small (<100 items) - client filtering is performant
- URL params make filter state bookmarkable and shareable
- Next.js App Router has good query param support
- Backend already supports filter params if needed for scale

**Alternatives Considered**:
1. **Server-side only filtering** - Rejected: Extra round trips for small lists
2. **Local state only** - Rejected: Loses filter state on refresh
3. **Both client and server** - Future option when lists grow large

**Implementation**:
```typescript
// Filter state in URL
const searchParams = useSearchParams();
const statusFilter = searchParams.get('status');
const priorityFilter = searchParams.get('priority');

// Apply filters
const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });
}, [tasks, statusFilter, priorityFilter]);
```

---

## Research Decision 6: Responsive Design Approach

**Context**: Need responsive layout for mobile (320px+), tablet, and desktop per FR-020, FR-021.

**Decision**: Mobile-first CSS with Tailwind responsive prefixes

**Rationale**:
- Tailwind already configured in project from Spec 2
- Mobile-first ensures core functionality works on smallest screens
- Responsive prefixes (`sm:`, `md:`, `lg:`) are intuitive
- No additional CSS framework needed

**Alternatives Considered**:
1. **Desktop-first** - Rejected: Harder to retrofit mobile layout
2. **Separate mobile/desktop components** - Rejected: Code duplication
3. **CSS Grid only** - Rejected: Tailwind flexbox/grid utilities sufficient

**Implementation**:
```typescript
// Mobile-first responsive classes
<div className="flex flex-col gap-4 md:flex-row md:justify-between">
  <TaskList className="w-full md:w-2/3" />
  <TaskFilters className="w-full md:w-1/3" />
</div>
```

---

## Research Decision 7: Delete Confirmation Pattern

**Context**: Need confirmation before task deletion per FR-011.

**Decision**: Custom modal dialog component with confirm/cancel actions

**Rationale**:
- Delete is destructive action requiring explicit confirmation
- Modal prevents accidental deletion from misclicks
- Reusable dialog component for future confirmations
- Accessible (focus management, keyboard support)

**Alternatives Considered**:
1. **Browser confirm()** - Rejected: Poor UX, not customizable
2. **Inline confirmation** - Considered: Good for mobile, but modal is clearer
3. **Undo pattern** - Future enhancement: More complex, better UX for power users

**Implementation**:
```typescript
// Dialog component with portal rendering
<Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
  <DialogTitle>Delete Task?</DialogTitle>
  <DialogContent>This action cannot be undone.</DialogContent>
  <DialogActions>
    <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
  </DialogActions>
</Dialog>
```

---

## Dependencies

### New Dependencies Required

| Package | Purpose | Version |
|---------|---------|---------|
| None | All functionality achievable with existing stack | - |

### Existing Dependencies Used

| Package | Purpose |
|---------|---------|
| `react` | UI framework (existing) |
| `next` | App Router, navigation (existing) |
| `tailwindcss` | Styling (existing) |
| `class-variance-authority` | Component variants (existing) |
| `clsx` | Conditional classes (existing) |
| `tailwind-merge` | Class merging (existing) |

---

## Integration Points

### From Spec 1 (Backend)

- `GET /api/tasks` - Fetch all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### From Spec 2 (Auth Frontend)

- `frontend/src/lib/api-client.ts` - Authenticated fetch wrapper
- `frontend/src/lib/api/tasks.ts` - Typed task API methods
- `frontend/src/app/(protected)/layout.tsx` - Protected route layout
- `frontend/src/components/ui/` - Button, Input components

---

## Summary

All research questions resolved. No external dependencies needed. The implementation builds on existing Spec 2 foundation with:

1. New task components in `components/tasks/`
2. Custom `useTasks` hook for state management
3. Client-side filtering with URL params
4. Mobile-first responsive layout
5. Modal dialog for delete confirmation
6. Toast notifications for feedback
