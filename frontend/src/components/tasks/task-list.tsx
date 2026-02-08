"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import type { Task, TaskStatus } from "@/types/task";
import {
  staggerContainerVariants,
  staggerItemVariants,
  fadeVariants,
} from "@/lib/animations";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onRetry?: () => void;
  onAddTask?: () => void;
  emptyMessage?: string;
  updatingId?: string | null;
  deletingId?: string | null;
}

/**
 * Enhanced Loading skeleton with shimmer effect
 */
function TaskCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      variants={staggerItemVariants}
      className="rounded-xl glass-card p-4 shimmer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox skeleton */}
        <div className="w-6 h-6 rounded-lg bg-muted animate-pulse" />

        <div className="flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded-lg w-full animate-pulse" />
              <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
              <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="h-9 bg-muted rounded-lg w-40 animate-pulse" />
            <div className="h-9 bg-muted rounded-lg w-20 animate-pulse" />
            <div className="h-9 bg-muted rounded-lg w-20 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Enhanced Empty state with Aiden avatar
 */
function EmptyState({
  message,
  onAddTask,
}: {
  message: string;
  onAddTask?: () => void;
}) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="rounded-xl bg-white dark:bg-slate-800 border-dashed border-2 border-slate-300 dark:border-slate-600 p-8 text-center shadow-lg"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <ChatAvatar expression="idle" size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-700 dark:text-slate-300 font-medium mt-4 mb-4"
      >
        {message}
      </motion.p>

      {onAddTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={onAddTask}
            className="btn-aurora"
          >
            <span className="flex items-center gap-2">
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
              Add Your First Task
            </span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Enhanced Error state
 */
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  const isConnectionError = error.toLowerCase().includes("connect") || error.toLowerCase().includes("server");

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="rounded-xl bg-white dark:bg-slate-800 border-2 border-red-400 p-6 text-center shadow-lg"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <ChatAvatar expression="error" size="lg" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-red-600 dark:text-red-400 font-bold text-lg mt-4 mb-2"
      >
        {isConnectionError ? "Connection Error" : "Failed to Load Tasks"}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-slate-700 dark:text-slate-300 text-sm mb-4 font-medium"
      >
        {error}
      </motion.p>

      {isConnectionError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-left bg-slate-100 dark:bg-slate-900 rounded-lg p-4 mb-4 text-sm"
        >
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">To fix this:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300">
            <li>Open a terminal in the <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">backend</code> folder</li>
            <li>Run: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">uvicorn app.main:app --reload</code></li>
            <li>Click &quot;Try Again&quot; below</li>
          </ol>
        </motion.div>
      )}

      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="default" onClick={onRetry}>
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
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Progress bar showing task completion
 */
function TaskProgressBar({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-700 dark:text-slate-300 font-medium">Progress</span>
        <span className="font-bold text-teal-600 dark:text-teal-400">
          {completed}/{total} completed
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-aurora-teal-500 via-aurora-purple-500 to-aurora-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Enhanced Task List Component
 *
 * Features:
 * - Staggered item animations
 * - Progress bar with gradient fill
 * - Empty state with Aiden avatar
 * - Shimmer loading skeletons
 * - Framer Motion AnimatePresence for smooth transitions
 */
export function TaskList({
  tasks,
  isLoading,
  error,
  onStatusChange,
  onEdit,
  onDelete,
  onRetry,
  onAddTask,
  emptyMessage = "No tasks yet. Create your first task to get started!",
  updatingId,
  deletingId,
}: TaskListProps) {
  // Loading state
  if (isLoading) {
    return (
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
        aria-label="Loading tasks"
      >
        {[1, 2, 3].map((n) => (
          <TaskCardSkeleton key={n} index={n} />
        ))}
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Empty state
  if (tasks.length === 0) {
    return <EmptyState message={emptyMessage} onAddTask={onAddTask} />;
  }

  // Task list
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <TaskProgressBar tasks={tasks} />

      {/* Task items */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
        role="list"
        aria-label="Task list"
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              variants={staggerItemVariants}
              layout
              role="listitem"
            >
              <TaskCard
                task={task}
                onStatusChange={(status) => onStatusChange(task.id, status)}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
                isUpdating={updatingId === task.id}
                isDeleting={deletingId === task.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default TaskList;
