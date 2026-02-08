# Quickstart: Frontend UI & User Experience

**Feature**: 003-frontend-ui
**Date**: 2026-01-09

## Prerequisites

- Spec 1 (Backend Core API) completed and running
- Spec 2 (Authentication & Frontend API Integration) completed
- Frontend development server accessible at http://localhost:3000
- Backend API accessible at http://localhost:8000
- Node.js 18+

## Existing Foundation

The following already exists from Spec 2:

```
frontend/src/
├── app/
│   ├── (auth)/login/page.tsx       # Login page
│   ├── (auth)/signup/page.tsx      # Signup page
│   ├── (protected)/layout.tsx      # Protected route layout
│   ├── (protected)/dashboard/page.tsx  # Dashboard (to be enhanced)
│   └── api/auth/[...all]/route.ts  # Better Auth handler
├── components/
│   ├── auth/                       # Auth components
│   └── ui/button.tsx, input.tsx    # UI primitives
├── lib/
│   ├── auth.ts                     # Better Auth config
│   ├── auth-client.ts              # Client utilities
│   ├── api-client.ts               # Authenticated fetch
│   └── api/tasks.ts                # Task API methods
└── middleware.ts                   # Route protection
```

## Implementation Steps

### Step 1: Create Type Definitions

Create `frontend/src/types/task.ts` with shared types:

```typescript
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

// ... additional types from data-model.md
```

### Step 2: Create UI Components

#### 2a. Dialog Component

Create `frontend/src/components/ui/dialog.tsx`:

```typescript
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Dialog({ open, onClose, children, title }: DialogProps) {
  // Handle Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
```

#### 2b. Select Component

Create `frontend/src/components/ui/select.tsx`:

```typescript
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, disabled, error, className }: SelectProps) {
  return (
    <div className="w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
          error && "border-red-500",
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

### Step 3: Create Task Components

#### 3a. Task Card

Create `frontend/src/components/tasks/task-card.tsx`:

```typescript
"use client";

import { Task, TaskStatus } from "@/types/task";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete, isUpdating }: TaskCardProps) {
  // Component implementation
}
```

#### 3b. Task Form

Create `frontend/src/components/tasks/task-form.tsx`:

```typescript
"use client";

import * as React from "react";
import { CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority } from "@/types/task";
// Form implementation
```

#### 3c. Task Filters

Create `frontend/src/components/tasks/task-filters.tsx`:

```typescript
"use client";

import { TaskFilters as FilterType } from "@/types/task";
import { Select } from "@/components/ui/select";
// Filters implementation
```

### Step 4: Create useTasks Hook

Create `frontend/src/hooks/useTasks.ts`:

```typescript
"use client";

import * as React from "react";
import { tasksApi, Task, CreateTaskInput, UpdateTaskInput } from "@/lib/api/tasks";

export function useTasks() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await tasksApi.getTasks();
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const createTask = async (data: CreateTaskInput) => {
    const task = await tasksApi.createTask(data);
    setTasks((prev) => [...prev, task]);
    return task;
  };

  const updateTask = async (id: string, data: UpdateTaskInput) => {
    const task = await tasksApi.updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  };

  const deleteTask = async (id: string) => {
    await tasksApi.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, isLoading, error, createTask, updateTask, deleteTask, refresh };
}
```

### Step 5: Enhance Dashboard Page

Update `frontend/src/app/(protected)/dashboard/page.tsx`:

```typescript
"use client";

import * as React from "react";
import { useTasks } from "@/hooks/useTasks";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskFilters } from "@/components/tasks/task-filters";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useTasks();
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  // ... implementation
}
```

## Verification Steps

### 1. Test Task Display

```bash
# Start frontend
cd frontend && npm run dev

# Navigate to http://localhost:3000/dashboard
# Should see task list (empty or with existing tasks)
```

### 2. Test Task Creation

1. Click "Add Task" button
2. Fill in title (required)
3. Optionally fill description, priority, due date
4. Click "Create"
5. Verify task appears in list

### 3. Test Task Update

1. Click edit button on a task
2. Modify any field
3. Click "Save"
4. Verify changes reflected in list

### 4. Test Status Change

1. Click status indicator on a task
2. Select new status
3. Verify status updates immediately

### 5. Test Task Deletion

1. Click delete button on a task
2. Confirm deletion in dialog
3. Verify task removed from list

### 6. Test Filtering

1. Create tasks with different statuses and priorities
2. Select status filter
3. Verify only matching tasks shown
4. Select priority filter
5. Verify combined filters work
6. Clear filters
7. Verify all tasks shown

### 7. Test Responsive Layout

1. Open browser DevTools
2. Toggle device toolbar
3. Test at 320px, 768px, 1024px widths
4. Verify layout adapts appropriately

## Common Issues

### 1. Tasks Not Loading

**Error**: "Failed to load tasks" or empty list

**Solutions**:
- Verify backend is running at http://localhost:8000
- Check browser console for CORS errors
- Verify user is authenticated (valid session)
- Check API client is sending Authorization header

### 2. Create/Update Fails

**Error**: "Failed to create task"

**Solutions**:
- Check backend logs for validation errors
- Verify request body format matches API contract
- Ensure title is not empty

### 3. Session Expired

**Error**: Redirected to login unexpectedly

**Solutions**:
- Sessions expire after 24 hours
- Sign in again to refresh session
- Check Better Auth configuration

## File Structure After Implementation

```
frontend/src/
├── app/
│   └── (protected)/
│       └── dashboard/
│           └── page.tsx          # Enhanced dashboard
├── components/
│   ├── tasks/
│   │   ├── task-card.tsx
│   │   ├── task-form.tsx
│   │   ├── task-list.tsx
│   │   ├── task-filters.tsx
│   │   └── delete-confirmation.tsx
│   └── ui/
│       ├── button.tsx            # Existing
│       ├── input.tsx             # Existing
│       ├── dialog.tsx            # New
│       ├── select.tsx            # New
│       └── textarea.tsx          # New
├── hooks/
│   ├── useTasks.ts
│   └── useToast.ts
├── types/
│   └── task.ts
└── lib/
    └── api/
        └── tasks.ts              # Existing, may need updates
```
