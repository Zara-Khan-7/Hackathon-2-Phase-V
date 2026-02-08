"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/contexts/toast-context";
import { useSession } from "@/lib/auth-client";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskFilters } from "@/components/tasks/task-filters";
import { DeleteConfirmation } from "@/components/tasks/delete-confirmation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signout-button";
import Link from "next/link";
import type {
  Task,
  TaskFilters as FilterType,
  TaskStatus,
  TaskPriority,
  SortField,
  SortOrder,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/types/task";
import { DEFAULT_FILTERS } from "@/types/task";

function DashboardContent() {
  // Get session for user display (not for auth - that's handled by layout)
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Initialize filters from URL params
  const [filters, setFilters] = React.useState<FilterType>(() => {
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as TaskPriority | null;
    const search = searchParams.get("search") || "";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const has_due_date = searchParams.get("has_due_date") === "true" ? true : null;
    const is_recurring = searchParams.get("is_recurring") === "true" ? true : null;
    const sort = (searchParams.get("sort") as SortField) || DEFAULT_FILTERS.sort;
    const order = (searchParams.get("order") as SortOrder) || DEFAULT_FILTERS.order;

    return {
      status,
      priority,
      search,
      tags,
      has_due_date,
      is_recurring,
      sort,
      order,
    };
  });

  // Fetch tasks with server-side filtering
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refresh,
    isCreating,
    updatingId,
    deletingId,
    completingId,
  } = useTasks({ filters });

  // Modal states
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null);

  // Track if we've mounted to prevent URL updates on initial render
  const hasMounted = React.useRef(false);

  // Sync filters with URL using replace to avoid history stack issues
  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.search) params.set("search", filters.search);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.has_due_date === true) params.set("has_due_date", "true");
    if (filters.is_recurring === true) params.set("is_recurring", "true");
    if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
    if (filters.order !== DEFAULT_FILTERS.order) params.set("order", filters.order);

    const query = params.toString();
    const newPath = `/dashboard${query ? `?${query}` : ""}`;

    // Only update if the path actually changed
    const currentPath = window.location.pathname + window.location.search;
    if (newPath !== currentPath) {
      router.replace(newPath, { scroll: false });
    }
  }, [filters, router]);

  const handleFilterChange = React.useCallback((newFilters: FilterType) => {
    setFilters(newFilters);
  }, []);

  // Extract unique tags from all tasks for filter suggestions
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  // Calculate task counts for display
  const taskCounts = React.useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.status !== null ||
      filters.priority !== null ||
      filters.search !== "" ||
      filters.tags.length > 0 ||
      filters.has_due_date !== null ||
      filters.is_recurring !== null
    );
  }, [filters]);

  // Handlers
  const handleCreateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    try {
      await createTask(data as CreateTaskInput);
      setShowCreateModal(false);
      showToast({ type: "success", message: "Task created successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create task",
      });
      throw err;
    }
  };

  const handleUpdateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data as UpdateTaskInput);
      setEditingTask(null);
      showToast({ type: "success", message: "Task updated successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update task",
      });
      throw err;
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      // If changing to completed, use the complete endpoint for recurring support
      if (status === "completed") {
        const response = await completeTask(taskId);
        if (response.next_task) {
          showToast({
            type: "success",
            message: `Task completed! Next occurrence created for ${response.next_task.due_date ? new Date(response.next_task.due_date).toLocaleDateString() : "soon"}`,
          });
        } else {
          showToast({ type: "success", message: "Task completed" });
        }
      } else {
        await updateTask(taskId, { status });
        showToast({
          type: "success",
          message: `Task marked as ${status.replace("_", " ")}`,
        });
      }
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update status",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
      showToast({ type: "success", message: "Task deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete task",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Todo App</h1>
            <nav className="flex gap-2">
              <Link
                href="/dashboard"
                className="rounded-md bg-aurora-teal-500/10 px-3 py-1.5 text-sm font-medium text-aurora-teal-700 dark:text-aurora-teal-400 border border-aurora-teal-500/20"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Chat
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Title & Add Button */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Tasks</h2>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Manage your tasks and stay organized
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            availableTags={availableTags}
            taskCounts={taskCounts}
            isLoading={isLoading}
          />
        </div>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onStatusChange={handleStatusChange}
          onEdit={setEditingTask}
          onDelete={(taskId) => {
            const task = tasks.find((t) => t.id === taskId);
            if (task) setDeletingTask(task);
          }}
          onRetry={refresh}
          onAddTask={() => setShowCreateModal(true)}
          updatingId={updatingId || completingId}
          deletingId={deletingId}
          emptyMessage={
            hasActiveFilters
              ? "No tasks match your filters. Try adjusting or clearing filters."
              : "No tasks yet. Create your first task to get started!"
          }
        />
      </main>

      {/* Create Task Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm
          mode="create"
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={isCreating}
        />
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            mode="edit"
            initialData={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            isSubmitting={updatingId === editingTask.id}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deletingTask !== null}
        taskTitle={deletingTask?.title || ""}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
        isDeleting={deletingId === deletingTask?.id}
      />
    </div>
  );
}

// Loading fallback for Suspense
function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <svg
          className="animate-spin h-5 w-5 text-aurora-teal-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading dashboard...</span>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
