"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TagBadge } from "@/components/ui/badge";
import type { Task, TaskStatus } from "@/types/task";
import { STATUS_OPTIONS } from "@/types/task";
import { formatDistanceToNow, isPast } from "date-fns";
import {
  taskCardVariants,
  checkboxVariants,
  checkmarkVariants,
  confettiVariants,
} from "@/lib/animations";

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Confetti particle for completion celebration
 */
function ConfettiParticle({ delay, color, leftPosition }: { delay: number; color: string; leftPosition: number }) {
  return (
    <motion.div
      variants={confettiVariants}
      initial="initial"
      animate="animate"
      className="absolute w-2 h-2 rounded-full"
      style={{
        backgroundColor: color,
        left: `${leftPosition}%`,
        top: "50%",
      }}
      transition={{ delay }}
    />
  );
}

/**
 * Enhanced Task Card Component
 *
 * Features:
 * - Glassmorphism card design
 * - Gradient border on hover
 * - Animated checkbox with checkmark draw-in
 * - Confetti on completion
 * - Priority badges with aurora gradients
 * - Smooth hover lift effect
 */
export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: TaskCardProps) {
  const isDisabled = isUpdating || isDeleting;
  const isCompleted = task.status === "completed";
  const [showConfetti, setShowConfetti] = React.useState(false);

  // Format due date for display with relative time
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const formattedDueDate = dueDate
    ? formatDistanceToNow(dueDate, { addSuffix: true })
    : null;
  const absoluteDueDate = dueDate
    ? dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  // Check if due date is past
  const isOverdue =
    dueDate &&
    isPast(dueDate) &&
    task.status !== "completed";

  // Handle status change with confetti
  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === "completed" && task.status !== "completed") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
    onStatusChange(newStatus);
  };

  // Handle checkbox click
  const handleCheckboxClick = () => {
    if (isCompleted) {
      handleStatusChange("pending");
    } else {
      handleStatusChange("completed");
    }
  };

  const priorityGradients: Record<string, string> = {
    low: "from-aurora-green-500/20 to-aurora-green-600/20 border-aurora-green-500/30",
    medium: "from-aurora-blue-500/20 to-aurora-blue-600/20 border-aurora-blue-500/30",
    high: "from-aurora-purple-500/20 to-aurora-purple-600/20 border-aurora-purple-500/30",
  };

  return (
    <motion.div
      variants={taskCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      className={cn(
        "relative rounded-xl p-4 bg-white dark:bg-slate-800 shadow-md",
        "border-2 border-slate-200 dark:border-slate-700",
        "transition-all duration-300",
        isDisabled && "opacity-60 pointer-events-none",
        isDeleting && "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
      )}
      aria-busy={isDisabled}
    >
      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.05}
                color={
                  ["#14b8a6", "#a855f7", "#22c55e", "#3b82f6"][i % 4]
                }
                leftPosition={(i * 8) + 4}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-4">
        {/* Animated Checkbox */}
        <motion.button
          onClick={handleCheckboxClick}
          disabled={isDisabled}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-lg border-2 mt-0.5",
            "flex items-center justify-center",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-teal-400 focus-visible:ring-offset-2",
            isCompleted
              ? "bg-gradient-to-br from-aurora-teal-500 to-aurora-green-500 border-transparent"
              : "border-border hover:border-aurora-teal-500/50"
          )}
          variants={checkboxVariants}
          animate={isCompleted ? "checked" : "unchecked"}
          whileTap={{ scale: 0.9 }}
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          <AnimatePresence>
            {isCompleted && (
              <motion.svg
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h3
                className={cn(
                  "font-bold text-slate-900 dark:text-white break-words transition-all duration-300",
                  isCompleted && "line-through text-slate-500 dark:text-slate-400"
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={cn(
                    "mt-1 text-sm text-slate-600 dark:text-slate-300 font-medium line-clamp-2 transition-all duration-300",
                    isCompleted && "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {task.description}
                </p>
              )}
              {/* Tags display */}
              {task.tags && task.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {task.tags.slice(0, 5).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                  {task.tags.length > 5 && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
                      +{task.tags.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Due date and recurring indicator */}
              <div className="mt-2 flex items-center gap-3">
                {formattedDueDate && (
                  <div className="flex items-center gap-1.5" title={absoluteDueDate || undefined}>
                    <svg
                      className={cn(
                        "w-3.5 h-3.5",
                        isOverdue ? "text-red-500" : "text-muted-foreground"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isOverdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {isOverdue ? "Overdue: " : ""}
                      {formattedDueDate}
                    </span>
                  </div>
                )}

                {/* Recurring indicator */}
                {task.is_recurring && (
                  <div className="flex items-center gap-1" title={`Repeats ${task.recurrence_rule?.toLowerCase()}`}>
                    <svg
                      className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {task.recurrence_rule?.toLowerCase()}
                    </span>
                  </div>
                )}

                {/* Reminder indicator */}
                {task.reminder_offset_minutes && (
                  <div className="flex items-center gap-1" title="Reminder set">
                    <svg
                      className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Reminder</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                  "border-2",
                  task.status === "completed" &&
                    "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300",
                  task.status === "pending" &&
                    "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300",
                  task.status === "in_progress" &&
                    "bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-300"
                )}
              >
                <span className="sr-only">Status: </span>
                {task.status === "in_progress"
                  ? "In Progress"
                  : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                  "border-2",
                  task.priority === "high" && "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300",
                  task.priority === "medium" && "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-600 text-orange-800 dark:text-orange-300",
                  task.priority === "low" && "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300"
                )}
              >
                <span className="sr-only">Priority: </span>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Dropdown */}
            <div className="w-full sm:w-40">
              <Select
                value={task.status}
                onChange={(value) => handleStatusChange(value as TaskStatus)}
                options={STATUS_OPTIONS}
                disabled={isDisabled}
                aria-label={`Change status for task: ${task.title}`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  disabled={isDisabled}
                  aria-label={`Edit task: ${task.title}`}
                  className="flex-1 sm:flex-none border-border/50 hover:border-aurora-teal-500/50 hover:bg-aurora-teal-500/10"
                >
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
                    className="mr-1"
                    aria-hidden="true"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  Edit
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={isDisabled}
                  aria-label={`Delete task: ${task.title}`}
                  className="flex-1 sm:flex-none"
                >
                  {isDeleting ? (
                    <svg
                      className="animate-spin mr-1 h-4 w-4"
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
                  ) : (
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
                      className="mr-1"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  )}
                  Delete
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TaskCard;
