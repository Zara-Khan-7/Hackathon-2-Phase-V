// Task Type Definitions
// Centralized types for task management UI

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

  // Tags
  tags: string[];

  // Reminder fields
  reminder_offset_minutes: number | null;
  remind_at: string | null;

  // Recurring task fields
  is_recurring: boolean;
  recurrence_rule: string | null;
  parent_task_id: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;

  // Tags
  tags?: string[];

  // Reminder
  reminder_offset_minutes?: number | null;

  // Recurring
  is_recurring?: boolean;
  recurrence_rule?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;

  // Tags
  tags?: string[];

  // Reminder
  reminder_offset_minutes?: number | null;

  // Recurring
  is_recurring?: boolean;
  recurrence_rule?: string | null;
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
  tags: string[];
  has_due_date: boolean | null;
  is_recurring: boolean | null;
  search: string;
  sort: SortField;
  order: SortOrder;
}

export type SortField = "created_at" | "due_date" | "priority" | "title";
export type SortOrder = "asc" | "desc";

export type RecurrenceRule = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | string;

export interface CompleteTaskResponse {
  completed_task: Task;
  next_task: Task | null;
}

// UI State Models
export interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;

  // Tags
  tags: string[];

  // Reminder
  reminder_offset_minutes: number | null;

  // Recurring
  is_recurring: boolean;
  recurrence_rule: string;
}

export interface TaskFormErrors {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  tags?: string;
  reminder_offset_minutes?: string;
  recurrence_rule?: string;
  general?: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

// Display helpers
export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-600",
  medium: "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100 border border-orange-300 dark:border-orange-600",
  high: "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 border border-red-300 dark:border-red-600",
};

// Reminder preset options
export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "No reminder" },
  { value: 10, label: "10 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
  { value: 10080, label: "1 week before" },
];

// Recurrence rule options
export const RECURRENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Does not repeat" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

// Sort field options
export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "created_at", label: "Created Date" },
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
];

// Default filters
export const DEFAULT_FILTERS: TaskFilters = {
  status: null,
  priority: null,
  tags: [],
  has_due_date: null,
  is_recurring: null,
  search: "",
  sort: "created_at",
  order: "desc",
};
