"use client";

import { cn } from "@/lib/utils";
import { TaskPriority, PRIORITY_COLORS } from "@/types/task";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "priority" | "tag";
  priority?: TaskPriority;
  className?: string;
}

/**
 * Badge component for displaying priority levels and tags.
 *
 * Usage:
 * - Priority badge: <Badge variant="priority" priority="high">High</Badge>
 * - Tag badge: <Badge variant="tag">work</Badge>
 * - Default badge: <Badge>Label</Badge>
 */
export function Badge({
  children,
  variant = "default",
  priority,
  className,
}: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  if (variant === "priority" && priority) {
    return (
      <span
        className={cn(
          baseStyles,
          PRIORITY_COLORS[priority],
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === "tag") {
    return (
      <span
        className={cn(
          baseStyles,
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        baseStyles,
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Priority-specific badge with proper color coding.
 * High = Red, Medium = Yellow, Low = Gray
 */
export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  const labels: Record<TaskPriority, string> = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <Badge variant="priority" priority={priority} className={className}>
      {labels[priority]}
    </Badge>
  );
}

/**
 * Tag badge for displaying task tags.
 */
export function TagBadge({
  tag,
  onRemove,
  className,
}: {
  tag: string;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-800 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-600",
        className
      )}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
          aria-label={`Remove ${tag} tag`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
