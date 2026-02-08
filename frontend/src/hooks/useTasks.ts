"use client";

import * as React from "react";
import { tasksApi } from "@/lib/api/tasks";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  CompleteTaskResponse,
} from "@/types/task";

interface UseTasksOptions {
  filters?: Partial<TaskFilters>;
}

interface UseTasksReturn {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Operations
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<CompleteTaskResponse>;
  refresh: () => Promise<void>;

  // Operation state
  isCreating: boolean;
  updatingId: string | null;
  deletingId: string | null;
  completingId: string | null;
}

export function useTasks(options?: UseTasksOptions): UseTasksReturn {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [completingId, setCompletingId] = React.useState<string | null>(null);

  // Serialize filters for dependency tracking
  const filtersKey = React.useMemo(() => {
    return options?.filters ? JSON.stringify(options.filters) : "";
  }, [options?.filters]);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await tasksApi.getTasks(options?.filters);
      setTasks(fetchedTasks || []);
    } catch (err) {
      let message = "Failed to load tasks";
      if (err instanceof Error) {
        if (err.message.includes("fetch") || err.message.includes("network")) {
          message = "Unable to connect to server. Please ensure the backend is running on http://localhost:8000";
        } else if (err.message.includes("401") || err.message.includes("authenticated")) {
          message = "Session expired. Please log in again.";
        } else {
          message = err.message;
        }
      }
      setError(message);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch tasks on mount and when filters change
  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const createTask = React.useCallback(async (data: CreateTaskInput): Promise<Task> => {
    setIsCreating(true);
    try {
      const task = await tasksApi.createTask(data);
      // Optimistically add to list (will be sorted correctly on next refresh)
      setTasks((prev) => [task, ...prev]);
      return task;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create task";
      throw new Error(message);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateTask = React.useCallback(async (id: string, data: UpdateTaskInput): Promise<Task> => {
    setUpdatingId(id);
    try {
      const task = await tasksApi.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update task";
      throw new Error(message);
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const deleteTask = React.useCallback(async (id: string): Promise<void> => {
    setDeletingId(id);
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      throw new Error(message);
    } finally {
      setDeletingId(null);
    }
  }, []);

  const completeTask = React.useCallback(async (id: string): Promise<CompleteTaskResponse> => {
    setCompletingId(id);
    try {
      const response = await tasksApi.completeTask(id);
      // Update the completed task in the list
      setTasks((prev) => {
        let updated = prev.map((t) => (t.id === id ? response.completed_task : t));
        // If there's a next task (recurring), add it to the list
        if (response.next_task) {
          updated = [response.next_task, ...updated];
        }
        return updated;
      });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete task";
      throw new Error(message);
    } finally {
      setCompletingId(null);
    }
  }, []);

  return {
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
  };
}
