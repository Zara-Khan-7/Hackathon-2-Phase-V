"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { REMINDER_OPTIONS } from "@/types/task";

interface ReminderSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  disabledMessage?: string;
  error?: string;
}

/**
 * Reminder Select Component
 *
 * Dropdown for selecting reminder time before due date.
 * Disabled when no due date is set.
 */
export function ReminderSelect({
  value,
  onChange,
  disabled = false,
  disabledMessage,
  error,
}: ReminderSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "" ? null : parseInt(e.target.value, 10);
    onChange(newValue);
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <select
          value={value === null ? "" : value}
          onChange={handleChange}
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
          aria-label="Select reminder time"
        >
          {REMINDER_OPTIONS.map((option) => (
            <option key={option.value ?? "none"} value={option.value ?? ""}>
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

        {/* Bell icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className={cn(
              "w-4 h-4",
              value ? "text-aurora-teal-500" : "text-muted-foreground"
            )}
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
        </div>
      </div>

      {/* Helper text when disabled */}
      {disabled && disabledMessage && (
        <p className="text-xs text-muted-foreground pl-1">
          {disabledMessage}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 pl-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ReminderSelect;
