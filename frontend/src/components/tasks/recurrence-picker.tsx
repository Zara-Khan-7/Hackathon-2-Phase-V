"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RECURRENCE_OPTIONS } from "@/types/task";

interface RecurrencePickerProps {
  isRecurring: boolean;
  recurrenceRule: string;
  onIsRecurringChange: (value: boolean) => void;
  onRecurrenceRuleChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Recurrence Picker Component
 *
 * Toggle + dropdown for configuring recurring tasks.
 * Supports: Daily, Weekly, Monthly, Yearly
 */
export function RecurrencePicker({
  isRecurring,
  recurrenceRule,
  onIsRecurringChange,
  onRecurrenceRuleChange,
  disabled = false,
  error,
}: RecurrencePickerProps) {
  const handleToggle = () => {
    const newValue = !isRecurring;
    onIsRecurringChange(newValue);
    if (!newValue) {
      onRecurrenceRuleChange("");
    } else if (!recurrenceRule) {
      onRecurrenceRuleChange("WEEKLY"); // Default to weekly
    }
  };

  return (
    <div className="space-y-3">
      {/* Toggle switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className={cn(
              "w-4 h-4 transition-colors",
              isRecurring ? "text-aurora-teal-500" : "text-muted-foreground"
            )}
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
          <span className="text-sm text-foreground">
            {isRecurring ? "Repeats" : "Does not repeat"}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isRecurring}
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent",
            "transition-colors duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-aurora-teal-500/50 focus:ring-offset-2",
            isRecurring ? "bg-aurora-teal-500" : "bg-gray-300 dark:bg-gray-600",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <motion.span
            initial={false}
            animate={{ x: isRecurring ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg",
              "ring-0 transition-transform"
            )}
          />
        </button>
      </div>

      {/* Recurrence rule dropdown - shown when recurring is enabled */}
      <AnimatePresence>
        {isRecurring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <select
                value={recurrenceRule}
                onChange={(e) => onRecurrenceRuleChange(e.target.value)}
                disabled={disabled}
                className={cn(
                  "w-full rounded-xl px-4 py-2.5 text-sm",
                  "bg-background/60 backdrop-blur-sm",
                  "border transition-all duration-200",
                  "focus:outline-none focus:ring-2",
                  "appearance-none cursor-pointer",
                  error
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-border/50 focus:border-aurora-teal-500/50 focus:ring-aurora-teal-500/20",
                  disabled && "opacity-60 cursor-not-allowed"
                )}
                aria-label="Select recurrence pattern"
              >
                {RECURRENCE_OPTIONS.filter(opt => opt.value !== "").map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Helper text */}
            <p className="mt-2 text-xs text-muted-foreground">
              A new task will be created when you complete this one
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default RecurrencePicker;
