"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TagBadge } from "@/components/ui/badge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  error?: string;
  maxTags?: number;
  placeholder?: string;
}

/**
 * Tag Input Component
 *
 * Features:
 * - Add tags by pressing Enter or comma
 * - Remove tags by clicking X or backspace on empty input
 * - Validates max 20 tags, max 50 chars each
 * - Animated tag pills with smooth transitions
 */
export function TagInput({
  tags,
  onChange,
  disabled = false,
  error,
  maxTags = 20,
  placeholder = "Add tag and press Enter",
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();

    // Validation
    if (!trimmed) return;

    if (trimmed.length > 50) {
      setLocalError("Tag must be 50 characters or less");
      return;
    }

    if (tags.includes(trimmed)) {
      setLocalError("Tag already exists");
      return;
    }

    if (tags.length >= maxTags) {
      setLocalError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    setLocalError(null);
    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
    setLocalError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-wrap gap-2 rounded-xl p-3",
          "bg-background/60 backdrop-blur-sm",
          "border transition-all duration-200",
          displayError
            ? "border-red-500/50 focus-within:border-red-500"
            : "border-border/50 focus-within:border-aurora-teal-500/50",
          "focus-within:ring-2 focus-within:ring-aurora-teal-500/20",
          disabled && "opacity-60 cursor-not-allowed"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Tag pills */}
        <AnimatePresence mode="popLayout">
          {tags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <TagBadge
                tag={tag}
                onRemove={disabled ? undefined : () => removeTag(tag)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setLocalError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={cn(
            "flex-1 min-w-[120px] bg-transparent outline-none",
            "text-sm text-foreground placeholder:text-muted-foreground",
            disabled && "cursor-not-allowed"
          )}
          aria-label="Add tag"
          aria-describedby={displayError ? "tag-error" : undefined}
        />
      </div>

      {/* Helper text and error */}
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {tags.length}/{maxTags} tags
        </span>
        {displayError && (
          <motion.span
            id="tag-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500"
            role="alert"
          >
            {displayError}
          </motion.span>
        )}
      </div>
    </div>
  );
}

export default TagInput;
