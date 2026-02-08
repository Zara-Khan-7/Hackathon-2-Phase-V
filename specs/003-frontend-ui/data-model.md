# Data Model: Frontend UI & User Experience

**Feature**: 003-frontend-ui
**Date**: 2026-01-09

## Overview

This document defines the client-side data structures for the task management UI. These models mirror the backend API (Spec 1) and extend with UI-specific state.

---

## Core Entities

### Task

The primary entity for task management, received from backend API.

```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;  // ISO 8601 format
  user_id: string;
  created_at: string;       // ISO 8601 format
  updated_at: string;       // ISO 8601 format
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (UUID) |
| `title` | string | Yes | Task title (1-255 characters) |
| `description` | string | No | Optional detailed description |
| `status` | TaskStatus | Yes | Current task status |
| `priority` | TaskPriority | Yes | Task priority level |
| `due_date` | string | No | Optional due date (ISO 8601) |
| `user_id` | string | Yes | Owner user ID from JWT |
| `created_at` | string | Yes | Creation timestamp |
| `updated_at` | string | Yes | Last update timestamp |

---

### TaskStatus (Enum)

Represents the current state of a task.

```typescript
type TaskStatus = "pending" | "in_progress" | "completed";
```

**State Transitions**:
- `pending` → `in_progress` → `completed` (typical flow)
- Any status can transition to any other status (user flexibility)

**Display Mapping**:

| Value | Display Label | Color Indicator |
|-------|--------------|-----------------|
| `pending` | Pending | Gray |
| `in_progress` | In Progress | Blue |
| `completed` | Completed | Green |

---

### TaskPriority (Enum)

Represents the importance level of a task.

```typescript
type TaskPriority = "low" | "medium" | "high";
```

**Display Mapping**:

| Value | Display Label | Color Indicator |
|-------|--------------|-----------------|
| `low` | Low | Gray |
| `medium` | Medium | Yellow |
| `high` | High | Red |

---

## Input/Output Models

### CreateTaskInput

Data required to create a new task.

```typescript
interface CreateTaskInput {
  title: string;              // Required, 1-255 chars
  description?: string | null;
  status?: TaskStatus;        // Default: "pending"
  priority?: TaskPriority;    // Default: "medium"
  due_date?: string | null;   // ISO 8601 format
}
```

**Validation Rules**:
- `title`: Required, non-empty, max 255 characters
- `description`: Optional, no max length
- `status`: Optional, defaults to "pending"
- `priority`: Optional, defaults to "medium"
- `due_date`: Optional, must be valid ISO 8601 date if provided

---

### UpdateTaskInput

Data for updating an existing task (partial update supported).

```typescript
interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}
```

**Validation Rules**:
- All fields optional (partial update)
- `title` if provided: non-empty, max 255 characters
- `due_date` if provided: valid ISO 8601 date or null to clear

---

### TaskListResponse

Response from fetching the task list.

```typescript
interface TaskListResponse {
  tasks: Task[];
  total: number;
  skip: number;
  limit: number;
}
```

---

## UI State Models

### TaskFilters

Current filter state for the task list.

```typescript
interface TaskFilters {
  status: TaskStatus | null;
  priority: TaskPriority | null;
}
```

**URL Mapping**:
- `?status=pending` → `{ status: "pending", priority: null }`
- `?priority=high` → `{ status: null, priority: "high" }`
- `?status=pending&priority=high` → `{ status: "pending", priority: "high" }`

---

### TaskFormState

State for task creation/editing forms.

```typescript
interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;  // Empty string or ISO date
}

interface TaskFormErrors {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  general?: string;
}
```

---

### TasksHookState

State managed by the `useTasks` hook.

```typescript
interface TasksHookState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: string | null;  // Task ID being updated
  isDeleting: string | null;  // Task ID being deleted
}
```

---

### ToastMessage

Notification message for user feedback.

```typescript
interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;  // Default: 3000ms
}
```

---

## Relationships

```
┌─────────────────────────────────────────────────────────┐
│                        User                              │
│  (from Better Auth - Spec 2)                            │
│  - id: string                                           │
│  - email: string                                        │
│  - name: string                                         │
└─────────────────────────────────────────────────────────┘
                            │
                            │ owns (1:N)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                        Task                              │
│  - id: string                                           │
│  - title: string                                        │
│  - description: string | null                           │
│  - status: TaskStatus                                   │
│  - priority: TaskPriority                               │
│  - due_date: string | null                              │
│  - user_id: string (FK → User.id)                       │
│  - created_at: string                                   │
│  - updated_at: string                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Type Definitions File

All types should be centralized in `frontend/src/types/task.ts`:

```typescript
// frontend/src/types/task.ts

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  skip: number;
  limit: number;
}

export interface TaskFilters {
  status: TaskStatus | null;
  priority: TaskPriority | null;
}
```

---

## Notes

1. **Existing Types**: Task types already exist in `frontend/src/lib/api/tasks.ts` from Spec 2. The types file above consolidates and extends them.

2. **Backend Alignment**: All types match the FastAPI backend models from Spec 1.

3. **Nullable Fields**: `description` and `due_date` are nullable in the database and API.

4. **Date Format**: All dates use ISO 8601 format (e.g., "2026-01-15T10:30:00Z").

5. **ID Format**: Task IDs are UUIDs generated by the backend.
