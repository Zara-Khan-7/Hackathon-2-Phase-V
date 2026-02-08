# Implementation Tasks: Frontend UI & User Experience

**Feature**: 003-frontend-ui
**Branch**: `003-frontend-ui`
**Generated**: 2026-01-09
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document defines implementation tasks for the Frontend UI feature, organized by user story with clear dependencies, test cases, and parallel execution guidance.

**Total Tasks**: 42
**User Stories**: 7 (3 P1, 3 P2, 1 P3)
**Estimated Phases**: Setup → US1 → US2 → US3 → US4 → US5 → US6 → US7 → Polish

---

## Dependency Graph

```
Phase 0: Setup
├── T01: Create types/task.ts
├── T02: Create ui/dialog.tsx
├── T03: Create ui/select.tsx
├── T04: Create ui/textarea.tsx
└── T05: Create hooks/useTasks.ts (depends on T01)

Phase 1: US1 - View Task List [P1]
├── T06: Create task-card.tsx (depends on T01)
├── T07: Create task-list.tsx (depends on T06)
└── T08: Update dashboard page (depends on T05, T07)

Phase 2: US2 - Create New Task [P1]
├── T09: Create task-form.tsx (depends on T01, T02, T03, T04)
├── T10: Add create task button to dashboard (depends on T08)
└── T11: Wire create form to useTasks hook (depends on T05, T09, T10)

Phase 3: US3 - Update Task Status [P1]
├── T12: Add status dropdown to task-card (depends on T03, T06)
└── T13: Wire status change to useTasks hook (depends on T05, T12)

Phase 4: US4 - Edit Task Details [P2]
├── T14: Extend task-form for edit mode (depends on T09)
├── T15: Add edit button to task-card (depends on T06)
└── T16: Wire edit form to useTasks hook (depends on T05, T14, T15)

Phase 5: US5 - Delete Task [P2]
├── T17: Create delete-confirmation.tsx (depends on T02)
├── T18: Add delete button to task-card (depends on T06)
└── T19: Wire delete to useTasks hook (depends on T05, T17, T18)

Phase 6: US6 - Filter Tasks [P3]
├── T20: Create task-filters.tsx (depends on T03)
├── T21: Implement client-side filtering in dashboard (depends on T08, T20)
└── T22: Sync filters with URL params (depends on T21)

Phase 7: US7 - Responsive Layout [P2]
├── T23: Add responsive styles to task-card (depends on T06)
├── T24: Add responsive styles to task-list (depends on T07)
├── T25: Add responsive styles to task-form (depends on T09)
└── T26: Add responsive styles to dashboard layout (depends on T08)

Phase 8: Polish & Feedback
├── T27: Create contexts/toast-context.tsx
├── T28: Create hooks/useToast.ts (depends on T27)
├── T29: Add toast container to layout (depends on T28)
├── T30: Add success toasts to CRUD operations (depends on T28)
└── T31: Add error handling and error toasts (depends on T28)

Phase 9: Accessibility & Final Polish
├── T32: Add keyboard navigation to task-card (depends on T06)
├── T33: Add focus management to dialog (depends on T02)
├── T34: Add ARIA labels to all interactive elements
├── T35: Add loading skeletons to task-list (depends on T07)
└── T36: Add empty state component (depends on T07)
```

---

## Phase 0: Setup (Foundation)

### T01: Create Type Definitions

**File**: `frontend/src/types/task.ts`
**Priority**: Critical (blocks all task components)
**Dependencies**: None

**Acceptance Criteria**:
- [x] TaskStatus type defined: "pending" | "in_progress" | "completed"
- [x] TaskPriority type defined: "low" | "medium" | "high"
- [x] Task interface matches backend API (id, title, description, status, priority, due_date, user_id, created_at, updated_at)
- [x] CreateTaskInput interface defined (title required, others optional)
- [x] UpdateTaskInput interface defined (all fields optional)
- [x] TaskListResponse interface defined (tasks array, total, skip, limit)
- [x] TaskFilters interface defined (status, priority nullable)
- [x] Types exported for use across codebase

**Test Cases**:
```typescript
// Type compilation test - no runtime errors
import { Task, TaskStatus, TaskPriority, CreateTaskInput } from '@/types/task';

const validTask: Task = {
  id: '123',
  title: 'Test',
  description: null,
  status: 'pending',
  priority: 'medium',
  due_date: null,
  user_id: 'user-1',
  created_at: '2026-01-09T00:00:00Z',
  updated_at: '2026-01-09T00:00:00Z'
};
```

---

### T02: Create Dialog Component

**File**: `frontend/src/components/ui/dialog.tsx`
**Priority**: High (needed for forms and confirmations)
**Dependencies**: None

**Acceptance Criteria**:
- [x] Dialog accepts open, onClose, children, title props
- [x] Renders overlay backdrop when open
- [x] Centers dialog content in viewport
- [x] Closes on Escape key press
- [x] Closes on backdrop click
- [x] Has role="dialog" and aria-modal="true"
- [x] Traps focus within dialog when open
- [x] Returns focus to trigger element on close

**Test Cases**:
```gherkin
Given the dialog is closed
When open prop becomes true
Then the dialog is visible with backdrop

Given the dialog is open
When user presses Escape key
Then onClose callback is called

Given the dialog is open
When user clicks backdrop
Then onClose callback is called
```

---

### T03: Create Select Component

**File**: `frontend/src/components/ui/select.tsx`
**Priority**: High (needed for status/priority dropdowns)
**Dependencies**: None

**Acceptance Criteria**:
- [x] Select accepts value, onChange, options, placeholder, disabled, error props
- [x] Renders native select element with custom styling
- [x] Shows placeholder option when value is empty
- [x] Calls onChange with selected value
- [x] Shows error message below select when error prop provided
- [x] Applies error styling (red border) when error present
- [x] Disables interaction when disabled prop is true

**Test Cases**:
```gherkin
Given a Select with options
When user selects an option
Then onChange is called with the selected value

Given a Select with error="Required"
When rendered
Then error message "Required" is visible below select

Given a Select with disabled=true
When user tries to interact
Then select is not interactive
```

---

### T04: Create Textarea Component

**File**: `frontend/src/components/ui/textarea.tsx`
**Priority**: Medium (needed for task description)
**Dependencies**: None

**Acceptance Criteria**:
- [x] Textarea extends native textarea attributes
- [x] Applies consistent styling matching Input component
- [x] Accepts error prop for validation messages
- [x] Shows error message below textarea when error provided
- [x] Applies error styling when error present

**Test Cases**:
```gherkin
Given a Textarea with error="Description too long"
When rendered
Then error message is visible below textarea
And textarea has red border styling
```

---

### T05: Create useTasks Hook

**File**: `frontend/src/hooks/useTasks.ts`
**Priority**: Critical (manages all task state)
**Dependencies**: T01 (types)

**Acceptance Criteria**:
- [x] Returns tasks array, isLoading, error state
- [x] Fetches tasks on mount using tasksApi.getTasks()
- [x] Provides createTask(data) async function
- [x] Provides updateTask(id, data) async function
- [x] Provides deleteTask(id) async function
- [x] Provides refresh() function to reload tasks
- [x] Updates local state immediately after successful API calls
- [x] Sets error state on API failures
- [x] Tracks isCreating, updatingId, deletingId for loading states

**Test Cases**:
```gherkin
Given useTasks hook is initialized
When component mounts
Then isLoading is true initially
And tasks are fetched from API
And isLoading becomes false

Given useTasks is loaded with tasks
When createTask is called with valid data
Then new task is added to tasks array
And isCreating is true during operation

Given useTasks is loaded with tasks
When updateTask is called with valid data
Then task in array is updated
And updatingId equals the task id during operation

Given useTasks is loaded with tasks
When deleteTask is called
Then task is removed from array
And deletingId equals the task id during operation
```

---

## Phase 1: US1 - View Task List (P1)

**User Story**: As an authenticated user, I want to see all my tasks displayed in an organized list so that I can understand what needs to be done.

**Functional Requirements**: FR-001, FR-002, FR-003, FR-004

### T06: Create TaskCard Component

**File**: `frontend/src/components/tasks/task-card.tsx`
**Priority**: P1
**Dependencies**: T01

**Acceptance Criteria**:
- [x] Displays task title prominently
- [x] Shows description (truncated if long)
- [x] Shows status with visual indicator (color badge)
- [x] Shows priority with visual indicator (color badge)
- [x] Shows due date if present (formatted)
- [x] Provides visual distinction between statuses (gray/blue/green)
- [x] Provides visual distinction between priorities (gray/yellow/red)
- [x] Accepts onStatusChange, onEdit, onDelete callback props
- [x] Shows loading state when isUpdating or isDeleting is true

**Test Cases**:
```gherkin
Given a task with status "pending"
When TaskCard renders
Then status badge shows "Pending" in gray

Given a task with status "in_progress"
When TaskCard renders
Then status badge shows "In Progress" in blue

Given a task with status "completed"
When TaskCard renders
Then task title has strikethrough styling
And status badge shows "Completed" in green

Given a task with priority "high"
When TaskCard renders
Then priority badge shows "High" in red
```

---

### T07: Create TaskList Component

**File**: `frontend/src/components/tasks/task-list.tsx`
**Priority**: P1
**Dependencies**: T06

**Acceptance Criteria**:
- [x] Accepts tasks array, isLoading, error props
- [x] Renders TaskCard for each task in array
- [x] Shows loading skeleton when isLoading is true
- [x] Shows error message when error is not null
- [x] Shows empty state message when tasks array is empty
- [x] Accepts emptyMessage prop for customization
- [x] Passes onStatusChange, onEdit, onDelete to each TaskCard

**Test Cases**:
```gherkin
Given TaskList with isLoading=true
When rendered
Then loading skeleton is displayed

Given TaskList with error="Failed to load"
When rendered
Then error message is displayed with retry option

Given TaskList with empty tasks array
When rendered
Then empty state message is displayed

Given TaskList with 3 tasks
When rendered
Then 3 TaskCard components are displayed
```

---

### T08: Update Dashboard Page for Task Display

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P1
**Dependencies**: T05, T07

**Acceptance Criteria**:
- [x] Uses useTasks hook to fetch tasks
- [x] Renders TaskList component with tasks data
- [x] Passes isLoading and error to TaskList
- [x] Shows user greeting with their name
- [x] Protected route redirects unauthenticated users (existing)
- [x] Page title shows "Dashboard" or "My Tasks"

**Test Cases**:
```gherkin
Given an authenticated user with 5 tasks
When they navigate to /dashboard
Then they see a list of 5 tasks

Given an authenticated user with no tasks
When they navigate to /dashboard
Then they see empty state message

Given an unauthenticated user
When they navigate to /dashboard
Then they are redirected to /login
```

---

## Phase 2: US2 - Create New Task (P1)

**User Story**: As an authenticated user, I want to create a new task so that I can track work I need to complete.

**Functional Requirements**: FR-005, FR-006, FR-007

### T09: Create TaskForm Component

**File**: `frontend/src/components/tasks/task-form.tsx`
**Priority**: P1
**Dependencies**: T01, T02, T03, T04

**Acceptance Criteria**:
- [ ] Accepts mode prop: "create" | "edit"
- [ ] Shows appropriate title based on mode
- [ ] Title field is required with validation
- [ ] Description field is optional (textarea)
- [ ] Status field is select with 3 options (default: pending for create)
- [ ] Priority field is select with 3 options (default: medium for create)
- [ ] Due date field is optional date input
- [ ] Shows validation errors inline below fields
- [ ] Submit button shows loading state when isSubmitting
- [ ] Cancel button calls onCancel prop
- [ ] Calls onSubmit with form data on valid submission
- [ ] Clears form after successful submission in create mode

**Test Cases**:
```gherkin
Given TaskForm in create mode
When user submits without title
Then validation error "Title is required" is shown

Given TaskForm in create mode
When user fills title and submits
Then onSubmit is called with form data
And status defaults to "pending"
And priority defaults to "medium"

Given TaskForm in edit mode with initialData
When rendered
Then form is pre-filled with initialData values
```

---

### T10: Add Create Task Button to Dashboard

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P1
**Dependencies**: T08

**Acceptance Criteria**:
- [ ] "Add Task" button visible on dashboard
- [ ] Button positioned prominently (top of task list)
- [ ] Clicking button opens create task dialog/modal
- [ ] Button has appropriate icon (plus icon)
- [ ] Button accessible via keyboard (focusable, Enter activates)

**Test Cases**:
```gherkin
Given user is on dashboard
When they click "Add Task" button
Then task creation form modal opens
```

---

### T11: Wire Create Form to useTasks Hook

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P1
**Dependencies**: T05, T09, T10

**Acceptance Criteria**:
- [ ] Create form modal state managed in dashboard
- [ ] Form submission calls useTasks.createTask()
- [ ] Modal closes after successful creation
- [ ] New task appears in list immediately
- [ ] Error from API is displayed in form
- [ ] Loading state shown during submission

**Test Cases**:
```gherkin
Given user opens create task form
When they fill valid data and submit
Then createTask is called with form data
And modal closes on success
And new task is visible in list

Given user submits create form
When API returns error
Then error is displayed in form
And modal remains open
```

---

## Phase 3: US3 - Update Task Status (P1)

**User Story**: As an authenticated user, I want to change a task's status so that I can track my progress on work items.

**Functional Requirements**: FR-008

### T12: Add Status Dropdown to TaskCard

**File**: `frontend/src/components/tasks/task-card.tsx`
**Priority**: P1
**Dependencies**: T03, T06

**Acceptance Criteria**:
- [ ] Status displayed as interactive dropdown/select
- [ ] Dropdown shows all 3 status options
- [ ] Current status is pre-selected
- [ ] Changing selection calls onStatusChange(newStatus)
- [ ] Visual feedback during status change (disabled state)
- [ ] Single-click/tap to mark complete (SC-002)

**Test Cases**:
```gherkin
Given a task with status "pending"
When user clicks status dropdown
Then options for pending, in_progress, completed are shown

Given a task with status "pending"
When user selects "completed"
Then onStatusChange is called with "completed"
```

---

### T13: Wire Status Change to useTasks Hook

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P1
**Dependencies**: T05, T12

**Acceptance Criteria**:
- [ ] TaskList receives onStatusChange handler
- [ ] Handler calls useTasks.updateTask(id, { status })
- [ ] Task status updates in UI immediately
- [ ] Error handling for failed status updates
- [ ] Status persists after page refresh

**Test Cases**:
```gherkin
Given task with status "pending"
When user changes status to "completed"
Then updateTask is called with { status: "completed" }
And task shows completed status in list

Given user changes task status
When page is refreshed
Then task still shows new status
```

---

## Phase 4: US4 - Edit Task Details (P2)

**User Story**: As an authenticated user, I want to edit my task's title, description, priority, or due date so that I can keep task information accurate.

**Functional Requirements**: FR-009, FR-010

### T14: Extend TaskForm for Edit Mode

**File**: `frontend/src/components/tasks/task-form.tsx`
**Priority**: P2
**Dependencies**: T09

**Acceptance Criteria**:
- [ ] Accepts initialData prop with existing task data
- [ ] Pre-fills all fields from initialData in edit mode
- [ ] Form title shows "Edit Task" in edit mode
- [ ] Submit button shows "Save" instead of "Create"
- [ ] Validates title not empty on edit submission
- [ ] Calls onSubmit with only changed fields (partial update)

**Test Cases**:
```gherkin
Given TaskForm in edit mode with task data
When rendered
Then title field shows existing title
And description shows existing description
And status shows existing status
And priority shows existing priority

Given user edits task and removes title
When they submit
Then validation error is shown
And form is not submitted
```

---

### T15: Add Edit Button to TaskCard

**File**: `frontend/src/components/tasks/task-card.tsx`
**Priority**: P2
**Dependencies**: T06

**Acceptance Criteria**:
- [ ] Edit button visible on task card
- [ ] Edit button has edit/pencil icon
- [ ] Clicking edit button calls onEdit callback
- [ ] Button accessible via keyboard
- [ ] Button has appropriate aria-label

**Test Cases**:
```gherkin
Given a task card
When user clicks edit button
Then onEdit callback is called
```

---

### T16: Wire Edit Form to useTasks Hook

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P2
**Dependencies**: T05, T14, T15

**Acceptance Criteria**:
- [ ] Edit modal state tracks which task is being edited
- [ ] Clicking edit opens modal with task data
- [ ] Form submission calls useTasks.updateTask(id, data)
- [ ] Modal closes after successful update
- [ ] Task updates in list immediately
- [ ] Error handling for failed updates

**Test Cases**:
```gherkin
Given user clicks edit on a task
When edit modal opens
Then form shows existing task data

Given user saves edited task
When API succeeds
Then modal closes
And task shows updated values in list
```

---

## Phase 5: US5 - Delete Task (P2)

**User Story**: As an authenticated user, I want to delete a task so that I can remove items I no longer need to track.

**Functional Requirements**: FR-011, FR-012

### T17: Create DeleteConfirmation Component

**File**: `frontend/src/components/tasks/delete-confirmation.tsx`
**Priority**: P2
**Dependencies**: T02

**Acceptance Criteria**:
- [ ] Uses Dialog component for modal
- [ ] Shows warning message about deletion
- [ ] Displays task title being deleted
- [ ] Has Cancel button that calls onCancel
- [ ] Has Delete button (destructive styling) that calls onConfirm
- [ ] Buttons disabled when isDeleting is true
- [ ] Delete button shows loading state when isDeleting

**Test Cases**:
```gherkin
Given DeleteConfirmation is open
When user clicks Cancel
Then onCancel is called

Given DeleteConfirmation is open
When user clicks Delete
Then onConfirm is called

Given DeleteConfirmation with isDeleting=true
When rendered
Then both buttons are disabled
And Delete button shows loading spinner
```

---

### T18: Add Delete Button to TaskCard

**File**: `frontend/src/components/tasks/task-card.tsx`
**Priority**: P2
**Dependencies**: T06

**Acceptance Criteria**:
- [ ] Delete button visible on task card
- [ ] Delete button has trash/delete icon
- [ ] Delete button has destructive styling (red)
- [ ] Clicking delete button calls onDelete callback
- [ ] Button accessible via keyboard
- [ ] Button has appropriate aria-label

**Test Cases**:
```gherkin
Given a task card
When user clicks delete button
Then onDelete callback is called
```

---

### T19: Wire Delete to useTasks Hook

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P2
**Dependencies**: T05, T17, T18

**Acceptance Criteria**:
- [ ] Delete confirmation modal state tracks task to delete
- [ ] Clicking delete opens confirmation modal
- [ ] Confirming deletion calls useTasks.deleteTask(id)
- [ ] Modal closes after successful deletion
- [ ] Task removed from list immediately
- [ ] Canceling deletion closes modal without action

**Test Cases**:
```gherkin
Given user clicks delete on a task
When confirmation modal opens
Then task title is shown in confirmation

Given user confirms deletion
When API succeeds
Then modal closes
And task is removed from list

Given user cancels deletion
When modal closes
Then task remains in list
```

---

## Phase 6: US6 - Filter Tasks (P3)

**User Story**: As an authenticated user, I want to filter my tasks by status or priority so that I can focus on specific types of work.

**Functional Requirements**: FR-013, FR-014, FR-015

### T20: Create TaskFilters Component

**File**: `frontend/src/components/tasks/task-filters.tsx`
**Priority**: P3
**Dependencies**: T03

**Acceptance Criteria**:
- [ ] Status filter dropdown with All, Pending, In Progress, Completed
- [ ] Priority filter dropdown with All, Low, Medium, High
- [ ] Clear filters button visible when any filter active
- [ ] Calls onFilterChange when filter selection changes
- [ ] Shows current filter state
- [ ] Optionally shows task counts per status

**Test Cases**:
```gherkin
Given TaskFilters with no active filters
When user selects status "pending"
Then onFilterChange is called with { status: "pending", priority: null }

Given TaskFilters with status filter active
When user clicks Clear
Then onFilterChange is called with { status: null, priority: null }
```

---

### T21: Implement Client-Side Filtering

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P3
**Dependencies**: T08, T20

**Acceptance Criteria**:
- [ ] TaskFilters component rendered on dashboard
- [ ] Filter state managed with useState
- [ ] Tasks filtered in useMemo based on filter state
- [ ] Filtered tasks passed to TaskList
- [ ] All tasks shown when no filters active

**Test Cases**:
```gherkin
Given 5 tasks (2 pending, 2 in_progress, 1 completed)
When user filters by status "pending"
Then only 2 pending tasks are displayed

Given 5 tasks with mixed priorities
When user filters by priority "high"
Then only high priority tasks are displayed

Given filters are active
When user clears filters
Then all 5 tasks are displayed
```

---

### T22: Sync Filters with URL Parameters

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P3
**Dependencies**: T21

**Acceptance Criteria**:
- [ ] Filter state read from URL query params on load
- [ ] URL updated when filters change (without page reload)
- [ ] Bookmarkable filter URLs (e.g., /dashboard?status=pending)
- [ ] Browser back/forward navigates filter states
- [ ] Invalid URL params ignored gracefully

**Test Cases**:
```gherkin
Given user navigates to /dashboard?status=pending
When page loads
Then status filter is set to "pending"
And only pending tasks are shown

Given user changes filter to "completed"
When filter updates
Then URL changes to /dashboard?status=completed

Given user navigates to /dashboard?status=invalid
When page loads
Then invalid param is ignored
And no filter is applied
```

---

## Phase 7: US7 - Responsive Layout (P2)

**User Story**: As a user on a mobile device, I want the task interface to adapt to my screen size so that I can manage tasks from any device.

**Functional Requirements**: FR-020, FR-021

### T23: Add Responsive Styles to TaskCard

**File**: `frontend/src/components/tasks/task-card.tsx`
**Priority**: P2
**Dependencies**: T06

**Acceptance Criteria**:
- [ ] Card displays well on 320px width
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] Text truncates appropriately on small screens
- [ ] Action buttons stack or hide in menu on mobile
- [ ] Priority/status badges resize appropriately

**Test Cases**:
```gherkin
Given TaskCard on 320px viewport
When rendered
Then all content is visible without horizontal scroll
And touch targets are at least 44x44px
```

---

### T24: Add Responsive Styles to TaskList

**File**: `frontend/src/components/tasks/task-list.tsx`
**Priority**: P2
**Dependencies**: T07

**Acceptance Criteria**:
- [ ] List uses full width on mobile
- [ ] Appropriate spacing between cards on mobile
- [ ] Grid layout on larger screens (optional)
- [ ] Loading skeleton adapts to screen size

**Test Cases**:
```gherkin
Given TaskList on mobile viewport
When rendered
Then tasks display in single column

Given TaskList on desktop viewport
When rendered
Then tasks may use multi-column or full-width layout
```

---

### T25: Add Responsive Styles to TaskForm

**File**: `frontend/src/components/tasks/task-form.tsx`
**Priority**: P2
**Dependencies**: T09

**Acceptance Criteria**:
- [ ] Form fields stack vertically on mobile
- [ ] Input fields are full width on mobile
- [ ] Touch-friendly input sizes (min height 44px)
- [ ] Dialog uses appropriate width on each viewport
- [ ] Buttons are appropriately sized for touch

**Test Cases**:
```gherkin
Given TaskForm on 320px viewport
When rendered
Then form fits within viewport
And all inputs are easily tappable

Given TaskForm on tablet/desktop
When rendered
Then form has appropriate max-width
And layout may use multiple columns
```

---

### T26: Add Responsive Styles to Dashboard Layout

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: P2
**Dependencies**: T08

**Acceptance Criteria**:
- [ ] Dashboard usable at 320px width (SC-006)
- [ ] Filters and task list layout adapts to viewport
- [ ] Header/navigation responsive (existing from Spec 2)
- [ ] No horizontal scrolling at any supported viewport
- [ ] Appropriate padding/margins at each breakpoint

**Test Cases**:
```gherkin
Given dashboard at 320px width
When rendered
Then no horizontal scrollbar appears
And all features are accessible

Given dashboard at 768px width
When rendered
Then layout uses available space effectively

Given dashboard at 1024px+ width
When rendered
Then content has appropriate max-width
```

---

## Phase 8: Polish & Feedback

### T27: Create Toast Context

**File**: `frontend/src/contexts/toast-context.tsx`
**Priority**: Medium
**Dependencies**: None

**Acceptance Criteria**:
- [ ] ToastProvider component wraps children
- [ ] Provides showToast function via context
- [ ] Manages toast queue (max 3 visible)
- [ ] Each toast has id, type, message, duration
- [ ] Auto-dismisses toasts after duration
- [ ] Provides dismissToast function

**Test Cases**:
```gherkin
Given ToastProvider wrapping app
When showToast is called with success message
Then toast is added to queue

Given toast with 3000ms duration
When 3000ms passes
Then toast is automatically dismissed
```

---

### T28: Create useToast Hook

**File**: `frontend/src/hooks/useToast.ts`
**Priority**: Medium
**Dependencies**: T27

**Acceptance Criteria**:
- [ ] useToast returns showToast, dismissToast, toasts
- [ ] showToast accepts { type, message, duration? }
- [ ] Generates unique id for each toast
- [ ] Works within ToastProvider context

**Test Cases**:
```gherkin
Given component using useToast
When showToast({ type: 'success', message: 'Done!' }) called
Then toast is added to context state
```

---

### T29: Add Toast Container to Layout

**File**: `frontend/src/app/(protected)/layout.tsx`
**Priority**: Medium
**Dependencies**: T28

**Acceptance Criteria**:
- [ ] ToastProvider wraps protected routes
- [ ] Toast container positioned fixed (top-right or bottom-right)
- [ ] Toasts render with appropriate styling
- [ ] Success toasts are green, errors are red, info is blue
- [ ] Toasts have dismiss button
- [ ] Toasts animate in and out

**Test Cases**:
```gherkin
Given protected layout renders
When a toast is triggered
Then toast appears in fixed position
And auto-dismisses after duration
```

---

### T30: Add Success Toasts to CRUD Operations

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: Medium
**Dependencies**: T28

**Acceptance Criteria**:
- [ ] "Task created" toast on successful creation (FR-018)
- [ ] "Task updated" toast on successful update
- [ ] "Task deleted" toast on successful deletion
- [ ] Toasts don't block user interaction

**Test Cases**:
```gherkin
Given user creates a task successfully
When creation completes
Then "Task created" success toast appears

Given user deletes a task
When deletion completes
Then "Task deleted" success toast appears
```

---

### T31: Add Error Handling and Error Toasts

**File**: `frontend/src/app/(protected)/dashboard/page.tsx`
**Priority**: Medium
**Dependencies**: T28

**Acceptance Criteria**:
- [ ] API errors trigger error toasts (FR-017)
- [ ] Error messages are user-friendly
- [ ] Network errors handled gracefully
- [ ] Error toast includes retry suggestion if applicable

**Test Cases**:
```gherkin
Given task creation fails
When API returns error
Then error toast appears with message

Given network request fails
When no connection
Then appropriate error message is shown
```

---

## Phase 9: Accessibility & Final Polish

### T32: Add Keyboard Navigation to TaskCard

**File**: `frontend/src/components/tasks/task-card.tsx`
**Priority**: Medium
**Dependencies**: T06

**Acceptance Criteria**:
- [ ] All interactive elements focusable (SC-004)
- [ ] Tab order follows visual order
- [ ] Enter/Space activates buttons
- [ ] Visible focus indicators on all elements
- [ ] Focus doesn't get trapped

**Test Cases**:
```gherkin
Given TaskCard with focus on edit button
When user presses Enter
Then edit action is triggered

Given user tabs through task card
When navigating
Then focus moves through all interactive elements
```

---

### T33: Add Focus Management to Dialog

**File**: `frontend/src/components/ui/dialog.tsx`
**Priority**: Medium
**Dependencies**: T02

**Acceptance Criteria**:
- [ ] Focus moves to dialog when opened
- [ ] Focus trapped within dialog while open
- [ ] Focus returns to trigger element on close
- [ ] First focusable element focused on open
- [ ] Last focused element tracked

**Test Cases**:
```gherkin
Given dialog is opened from button
When dialog opens
Then focus moves to first focusable element in dialog

Given dialog is open
When user closes dialog
Then focus returns to the button that opened it
```

---

### T34: Add ARIA Labels to Interactive Elements

**Files**: All components
**Priority**: Medium
**Dependencies**: All component tasks

**Acceptance Criteria**:
- [ ] All buttons have aria-label or visible text
- [ ] Form inputs have associated labels
- [ ] Status/priority badges have sr-only text
- [ ] Loading states announced to screen readers
- [ ] Error messages associated with fields (aria-describedby)

**Test Cases**:
```gherkin
Given TaskCard rendered
When screen reader reads card
Then all actions are clearly announced

Given form with validation error
When screen reader reaches input
Then error message is announced
```

---

### T35: Add Loading Skeletons to TaskList

**File**: `frontend/src/components/tasks/task-list.tsx`
**Priority**: Low
**Dependencies**: T07

**Acceptance Criteria**:
- [ ] Skeleton matches TaskCard dimensions
- [ ] 3-5 skeleton cards shown during loading (FR-016)
- [ ] Skeleton has subtle animation (pulse)
- [ ] Skeleton provides visual structure hint

**Test Cases**:
```gherkin
Given TaskList with isLoading=true
When rendered
Then skeleton cards are displayed
And skeletons have loading animation
```

---

### T36: Add Empty State Component

**File**: `frontend/src/components/tasks/task-list.tsx`
**Priority**: Low
**Dependencies**: T07

**Acceptance Criteria**:
- [ ] Empty state shown when no tasks (FR-004)
- [ ] Friendly message encouraging task creation
- [ ] Optional illustration or icon
- [ ] "Add Task" CTA button in empty state

**Test Cases**:
```gherkin
Given user has no tasks
When viewing dashboard
Then empty state message is shown
And "Add Task" button is visible in empty state
```

---

## Parallel Execution Guide

### Phase 0 (Setup) - Can run in parallel:
- T01, T02, T03, T04 can all run simultaneously
- T05 must wait for T01

### Phase 1 (US1) - Sequential within phase:
- T06 first, then T07, then T08

### Phases 2-5 (US2-US5) - Can run after Phase 1:
- Phase 2 (Create) and Phase 3 (Status) can run in parallel
- Phase 4 (Edit) depends on Phase 2 (TaskForm)
- Phase 5 (Delete) can run parallel to Phase 4

### Phase 6-7 (Filter, Responsive) - Can run in parallel:
- Both can run after respective base components exist

### Phase 8-9 (Polish) - Can mostly run in parallel:
- T27 → T28 → T29 → T30/T31 (sequential)
- T32, T33, T34, T35, T36 can run in parallel

---

## Task Summary by User Story

| User Story | Tasks | Status |
|------------|-------|--------|
| Setup (Foundation) | T01-T05 | ✅ Complete |
| US1: View Task List | T06-T08 | ✅ Complete |
| US2: Create New Task | T09-T11 | ✅ Complete |
| US3: Update Task Status | T12-T13 | ✅ Complete |
| US4: Edit Task Details | T14-T16 | ✅ Complete |
| US5: Delete Task | T17-T19 | ✅ Complete |
| US6: Filter Tasks | T20-T22 | ✅ Complete |
| US7: Responsive Layout | T23-T26 | ✅ Complete |
| Polish & Feedback | T27-T31 | ✅ Complete |
| Accessibility | T32-T36 | ✅ Complete |

**Total Tasks**: 36 (all completed)
**Implementation Date**: 2026-01-09
