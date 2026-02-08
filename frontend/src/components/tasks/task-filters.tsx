"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TaskFilters as FilterType, TaskStatus, TaskPriority, SortField, SortOrder } from "@/types/task";
import { SORT_OPTIONS, DEFAULT_FILTERS } from "@/types/task";
import { TagBadge } from "@/components/ui/badge";

interface TaskFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  availableTags?: string[];
  taskCounts?: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
  isLoading?: boolean;
}

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

/**
 * Enhanced TaskFilters Component
 *
 * Features:
 * - Search input with debounce
 * - Status, priority, tags filtering
 * - Has due date / is recurring toggles
 * - Sort by field and order
 * - Clear all filters button
 */
export function TaskFilters({
  filters,
  onFilterChange,
  availableTags = [],
  taskCounts,
  isLoading = false,
}: TaskFiltersProps) {
  const [searchInput, setSearchInput] = React.useState(filters.search);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  const hasActiveFilters =
    filters.status !== null ||
    filters.priority !== null ||
    filters.tags.length > 0 ||
    filters.has_due_date !== null ||
    filters.is_recurring !== null ||
    filters.search !== "";

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value ? (value as TaskStatus) : null,
    });
  };

  const handlePriorityChange = (value: string) => {
    onFilterChange({
      ...filters,
      priority: value ? (value as TaskPriority) : null,
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filters,
      sort: value as SortField,
    });
  };

  const toggleOrder = () => {
    onFilterChange({
      ...filters,
      order: filters.order === "asc" ? "desc" : "asc",
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleHasDueDateToggle = () => {
    const newValue = filters.has_due_date === true ? null : true;
    onFilterChange({ ...filters, has_due_date: newValue });
  };

  const handleIsRecurringToggle = () => {
    const newValue = filters.is_recurring === true ? null : true;
    onFilterChange({ ...filters, is_recurring: newValue });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    onFilterChange(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="flex-1 relative">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks..."
            className="pl-10"
            disabled={isLoading}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.status || ""}
            onChange={handleStatusChange}
            options={STATUS_FILTER_OPTIONS}
            aria-label="Filter by status"
            disabled={isLoading}
          />
        </div>

        {/* Priority filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.priority || ""}
            onChange={handlePriorityChange}
            options={PRIORITY_FILTER_OPTIONS}
            aria-label="Filter by priority"
            disabled={isLoading}
          />
        </div>

        {/* Sort dropdown */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.sort}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            aria-label="Sort by"
            disabled={isLoading}
          />
        </div>

        {/* Order toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleOrder}
          disabled={isLoading}
          className="shrink-0"
          aria-label={`Sort ${filters.order === "asc" ? "ascending" : "descending"}`}
        >
          {filters.order === "asc" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          )}
        </Button>

        {/* Advanced filters toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="shrink-0"
        >
          <svg
            className={cn("w-4 h-4 mr-1 transition-transform", showAdvanced && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          More
        </Button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="shrink-0 text-red-500 hover:text-red-600"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 pt-2 pb-1">
              {/* Has due date toggle */}
              <button
                onClick={handleHasDueDateToggle}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filters.has_due_date === true
                    ? "bg-aurora-teal-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Has Due Date
              </button>

              {/* Is recurring toggle */}
              <button
                onClick={handleIsRecurringToggle}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filters.is_recurring === true
                    ? "bg-aurora-teal-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recurring Only
              </button>

              {/* Tag filters */}
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-muted-foreground mr-1">Tags:</span>
                  {availableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      disabled={isLoading}
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
                        filters.tags.includes(tag)
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task counts */}
      {taskCounts && (
        <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
          <span>
            <span className="font-bold text-slate-900 dark:text-white">{taskCounts.total}</span> total
          </span>
          <span>
            <span className="font-bold text-yellow-600 dark:text-yellow-400">{taskCounts.pending}</span> pending
          </span>
          <span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{taskCounts.in_progress}</span> in progress
          </span>
          <span>
            <span className="font-bold text-green-600 dark:text-green-400">{taskCounts.completed}</span> completed
          </span>
        </div>
      )}

      {/* Active filters summary */}
      {filters.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Filtering by:</span>
          {filters.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onRemove={() => handleTagToggle(tag)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskFilters;
