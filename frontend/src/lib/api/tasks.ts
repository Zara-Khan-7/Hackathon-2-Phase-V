import { api } from "@/lib/api-client";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  CompleteTaskResponse,
  TaskStatus,
  TaskPriority,
} from "@/types/task";

// Re-export types for backward compatibility
export type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority };

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Build query string from TaskFilters
 */
function buildQueryString(filters?: Partial<TaskFilters>): string {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.tags && filters.tags.length > 0) {
    params.set("tags", filters.tags.join(","));
  }

  if (filters.has_due_date !== null && filters.has_due_date !== undefined) {
    params.set("has_due_date", String(filters.has_due_date));
  }

  if (filters.is_recurring !== null && filters.is_recurring !== undefined) {
    params.set("is_recurring", String(filters.is_recurring));
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.order) {
    params.set("order", filters.order);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

// Task API methods
export const tasksApi = {
  /**
   * Get all tasks for the authenticated user with optional filtering and sorting.
   * Supports: search, status, priority, tags, has_due_date, is_recurring, sort, order
   */
  getTasks: async (filters?: Partial<TaskFilters>): Promise<Task[]> => {
    const query = buildQueryString(filters);
    return api.get<Task[]>(`/api/tasks${query}`);
  },

  /**
   * Get a single task by ID
   */
  getTask: async (taskId: string): Promise<Task> => {
    return api.get<Task>(`/api/tasks/${taskId}`);
  },

  /**
   * Create a new task
   */
  createTask: async (data: CreateTaskInput): Promise<Task> => {
    return api.post<Task>("/api/tasks", data);
  },

  /**
   * Update an existing task
   */
  updateTask: async (taskId: string, data: UpdateTaskInput): Promise<Task> => {
    return api.put<Task>(`/api/tasks/${taskId}`, data);
  },

  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<void> => {
    return api.delete<void>(`/api/tasks/${taskId}`);
  },

  /**
   * Complete a task (and create next occurrence if recurring)
   */
  completeTask: async (taskId: string): Promise<CompleteTaskResponse> => {
    return api.patch<CompleteTaskResponse>(`/api/tasks/${taskId}/complete`);
  },
};
