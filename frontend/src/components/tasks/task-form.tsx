"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFormErrors,
} from "@/types/task";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, REMINDER_OPTIONS, RECURRENCE_OPTIONS } from "@/types/task";
import { slideUpVariants, scaleInVariants } from "@/lib/animations";
import { TagInput } from "@/components/tasks/tag-input";
import { ReminderSelect } from "@/components/tasks/reminder-select";
import { RecurrencePicker } from "@/components/tasks/recurrence-picker";

interface TaskFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Task>;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Enhanced Task Form Component
 *
 * Features:
 * - Glassmorphism modal design
 * - Floating label animations
 * - Aurora-styled inputs
 * - Smooth form transitions
 * - Priority selector with gradient badges
 */
export function TaskForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: TaskFormProps) {
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  );
  const [status, setStatus] = React.useState(
    initialData?.status || "pending"
  );
  const [priority, setPriority] = React.useState(
    initialData?.priority || "medium"
  );
  const [dueDate, setDueDate] = React.useState(
    initialData?.due_date?.slice(0, 16) || "" // datetime-local format: YYYY-MM-DDTHH:mm
  );
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
  const [reminderOffset, setReminderOffset] = React.useState<number | null>(
    initialData?.reminder_offset_minutes ?? null
  );
  const [isRecurring, setIsRecurring] = React.useState(
    initialData?.is_recurring || false
  );
  const [recurrenceRule, setRecurrenceRule] = React.useState(
    initialData?.recurrence_rule || ""
  );
  const [errors, setErrors] = React.useState<TaskFormErrors>({});

  const titleInputRef = React.useRef<HTMLInputElement>(null);

  // Focus title input on mount
  React.useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const newErrors: TaskFormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 255) {
      newErrors.title = "Title must be 255 characters or less";
    }

    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        newErrors.due_date = "Invalid date format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateTaskInput | UpdateTaskInput = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      tags,
      reminder_offset_minutes: dueDate && reminderOffset ? reminderOffset : null,
      is_recurring: isRecurring,
      recurrence_rule: isRecurring && recurrenceRule ? recurrenceRule : null,
    };

    try {
      await onSubmit(data);
      // Clear form on successful create
      if (mode === "create") {
        setTitle("");
        setDescription("");
        setStatus("pending");
        setPriority("medium");
        setDueDate("");
        setTags([]);
        setReminderOffset(null);
        setIsRecurring(false);
        setRecurrenceRule("");
        setErrors({});
      }
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const priorityColors: Record<string, string> = {
    low: "from-aurora-green-500 to-aurora-green-600",
    medium: "from-aurora-blue-500 to-aurora-blue-600",
    high: "from-aurora-purple-500 to-aurora-purple-600",
  };

  return (
    <motion.form
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Error alert */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.general}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label
          htmlFor="task-title"
          className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
        >
          Title <span className="text-purple-600 dark:text-purple-400">*</span>
        </label>
        <Input
          ref={titleInputRef}
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="What needs to be done?"
          disabled={isSubmitting}
          maxLength={255}
        />
      </motion.div>

      {/* Description field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label
          htmlFor="task-description"
          className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
        >
          Description
        </label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          placeholder="Add more details (optional)"
          disabled={isSubmitting}
          rows={3}
        />
      </motion.div>

      {/* Status and Priority row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div>
          <label
            htmlFor="task-status"
            className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
          >
            Status
          </label>
          <Select
            id="task-status"
            value={status}
            onChange={(value) => setStatus(value as typeof status)}
            options={STATUS_OPTIONS}
            disabled={isSubmitting}
            error={errors.status}
          />
        </div>

        <div>
          <label
            htmlFor="task-priority"
            className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
          >
            Priority
          </label>
          <Select
            id="task-priority"
            value={priority}
            onChange={(value) => setPriority(value as typeof priority)}
            options={PRIORITY_OPTIONS}
            disabled={isSubmitting}
            error={errors.priority}
          />
        </div>
      </motion.div>

      {/* Priority visual indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex gap-2 items-center"
      >
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Selected priority:</span>
        <motion.span
          key={priority}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium text-white",
            "bg-gradient-to-r",
            priorityColors[priority]
          )}
        >
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </motion.span>
      </motion.div>

      {/* Due date field - using datetime-local for date and time */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label
          htmlFor="task-due-date"
          className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
        >
          Due Date & Time
        </label>
        <Input
          id="task-due-date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.due_date}
          disabled={isSubmitting}
        />
      </motion.div>

      {/* Tags field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <label
          htmlFor="task-tags"
          className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
        >
          Tags
        </label>
        <TagInput
          tags={tags}
          onChange={setTags}
          disabled={isSubmitting}
          error={errors.tags}
        />
      </motion.div>

      {/* Reminder field - only enabled when due date is set */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label
          htmlFor="task-reminder"
          className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
        >
          Reminder
        </label>
        <ReminderSelect
          value={reminderOffset}
          onChange={setReminderOffset}
          disabled={isSubmitting || !dueDate}
          disabledMessage={!dueDate ? "Set a due date first" : undefined}
        />
      </motion.div>

      {/* Recurrence field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <label
          className="block text-sm font-bold text-slate-800 dark:text-white mb-2"
        >
          Repeat
        </label>
        <RecurrencePicker
          isRecurring={isRecurring}
          recurrenceRule={recurrenceRule}
          onIsRecurringChange={setIsRecurring}
          onRecurrenceRuleChange={setRecurrenceRule}
          disabled={isSubmitting}
        />
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex justify-end gap-3 pt-4 border-t border-border/50"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-border/50 hover:bg-muted/50"
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-aurora"
          >
            <span className="flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : mode === "create" ? (
                <>
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
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Create Task
                </>
              ) : (
                <>
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
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}

export default TaskForm;
