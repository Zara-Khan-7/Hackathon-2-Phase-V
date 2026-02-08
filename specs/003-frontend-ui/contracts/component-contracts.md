# Component Contracts: Frontend UI & User Experience

**Feature**: 003-frontend-ui
**Date**: 2026-01-09

## Overview

This document defines the component interfaces (props contracts) for task management UI components. These contracts ensure consistent component APIs and enable independent development.

---

## Task Components

### TaskList

Displays a list of tasks with filtering support.

```typescript
interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  emptyMessage?: string;
}
```

**Behavior**:
- Shows loading skeleton when `isLoading` is true
- Shows error message when `error` is not null
- Shows `emptyMessage` when tasks array is empty
- Renders TaskCard for each task
- Calls `onStatusChange` when status is changed inline
- Calls `onEdit` when edit button clicked
- Calls `onDelete` when delete button clicked

---

### TaskCard

Displays a single task with quick actions.

```typescript
interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}
```

**Behavior**:
- Displays task title, description (truncated), status, priority, due date
- Shows visual indicator for status and priority
- Provides status dropdown or checkbox for quick status change
- Shows loading state when `isUpdating` or `isDeleting` is true
- Calls appropriate handler on user action

**Visual States**:
- Default: Normal display
- Updating: Disabled with spinner
- Deleting: Faded with spinner
- Completed: Strikethrough title, muted colors

---

### TaskForm

Form for creating or editing a task.

```typescript
interface TaskFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Task>;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

**Behavior**:
- Shows "Create Task" or "Edit Task" title based on mode
- Pre-fills form with `initialData` in edit mode
- Validates required fields before submission
- Shows inline validation errors
- Disables form when `isSubmitting` is true
- Calls `onSubmit` with form data on valid submission
- Calls `onCancel` when cancel button clicked or modal closed

**Fields**:
| Field | Type | Required | Default |
|-------|------|----------|---------|
| Title | text input | Yes | "" |
| Description | textarea | No | "" |
| Status | select | Yes | "pending" |
| Priority | select | Yes | "medium" |
| Due Date | date picker | No | null |

---

### TaskFilters

Filter controls for the task list.

```typescript
interface TaskFiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  taskCounts?: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
}
```

**Behavior**:
- Shows status filter dropdown (All, Pending, In Progress, Completed)
- Shows priority filter dropdown (All, Low, Medium, High)
- Optionally shows task counts per status
- Calls `onFilterChange` when any filter changes
- Supports URL sync via parent component

---

### DeleteConfirmation

Confirmation dialog for task deletion.

```typescript
interface DeleteConfirmationProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}
```

**Behavior**:
- Shows modal dialog when `isOpen` is true
- Displays task title being deleted
- Disables buttons when `isDeleting` is true
- Calls `onConfirm` when delete confirmed
- Calls `onCancel` when cancelled or closed

---

## UI Primitive Components

### Dialog

Generic modal dialog component.

```typescript
interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}
```

**Behavior**:
- Renders in portal to body
- Shows overlay backdrop
- Traps focus within dialog
- Closes on Escape key
- Closes on backdrop click (optional)
- Accessible: role="dialog", aria-modal="true"

---

### Select

Dropdown select component.

```typescript
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}
```

**Behavior**:
- Native select styling with custom appearance
- Shows placeholder when no value selected
- Shows error message below when `error` provided
- Disabled state when `disabled` is true

---

### Textarea

Multiline text input component.

```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}
```

**Behavior**:
- Extends native textarea with consistent styling
- Shows error message below when `error` provided
- Auto-resizes based on content (optional)

---

### DatePicker

Date input component.

```typescript
interface DatePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  minDate?: string;
}
```

**Behavior**:
- Native date input with consistent styling
- Returns ISO 8601 date string
- Shows error message when `error` provided
- Prevents selection before `minDate` if provided

---

## Toast/Notification Components

### ToastProvider

Context provider for toast notifications.

```typescript
interface ToastProviderProps {
  children: React.ReactNode;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
  maxToasts?: number;
}
```

---

### Toast

Individual toast notification.

```typescript
interface ToastProps {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  onDismiss: (id: string) => void;
  duration?: number;
}
```

**Behavior**:
- Auto-dismisses after `duration` (default 3000ms)
- Shows dismiss button
- Animates in/out
- Different colors per type

---

## Hook Contracts

### useTasks

Hook for managing task state and operations.

```typescript
interface UseTasksReturn {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Operations
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;

  // Operation state
  isCreating: boolean;
  updatingId: string | null;
  deletingId: string | null;
}
```

---

### useToast

Hook for showing toast notifications.

```typescript
interface UseToastReturn {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  toasts: ToastMessage[];
}
```

---

## Page Contracts

### Dashboard Page

Main task management page.

**URL**: `/dashboard`
**Auth**: Required (protected route)

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `status` | TaskStatus | Filter by status |
| `priority` | TaskPriority | Filter by priority |

**State**:
- Task list from `useTasks` hook
- Filter state from URL params
- Modal state for create/edit/delete

**User Actions**:
- View task list
- Create new task (opens modal)
- Edit task (opens modal)
- Delete task (opens confirmation)
- Change task status inline
- Apply/clear filters

---

## Accessibility Requirements

All components MUST meet WCAG 2.1 AA:

1. **Keyboard Navigation**: All interactive elements focusable and operable via keyboard
2. **Focus Management**: Focus trapped in modals, returned on close
3. **ARIA Labels**: Proper labels for screen readers
4. **Color Contrast**: 4.5:1 minimum for text
5. **Focus Indicators**: Visible focus outline on all focusable elements
6. **Error Identification**: Errors associated with form fields via aria-describedby
