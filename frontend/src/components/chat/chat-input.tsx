"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { scaleInVariants } from "@/lib/animations";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Quick action suggestions
 */
const quickActions = [
  { label: "Add task", action: "Add a new task called " },
  { label: "Show tasks", action: "Show me all my tasks" },
  { label: "Complete", action: "Mark the task as completed" },
];

/**
 * Enhanced Chat Input Component
 *
 * Features:
 * - Glassmorphism design
 * - Expanding textarea animation
 * - Animated send button with gradient
 * - Quick action suggestions
 * - Keyboard shortcuts support
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {/* Quick actions (shown when focused and empty) */}
      <AnimatePresence>
        {isFocused && !message && (
          <motion.div
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-wrap gap-2"
          >
            {quickActions.map((qa, index) => (
              <motion.button
                key={qa.label}
                type="button"
                onClick={() => handleQuickAction(qa.action)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full",
                  "bg-muted/50 text-muted-foreground",
                  "hover:bg-aurora-teal-500/20 hover:text-aurora-teal-600 dark:hover:text-aurora-teal-400",
                  "border border-border/50 hover:border-aurora-teal-500/30",
                  "transition-all duration-200"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {qa.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input form */}
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        {/* Input container with gradient border on focus */}
        <div
          className={cn(
            "flex-1 relative rounded-xl transition-all duration-300",
            isFocused && "ring-2 ring-aurora-teal-500/30"
          )}
        >
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
            animate={{
              opacity: isFocused ? 1 : 0,
            }}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-xl",
                "bg-gradient-to-r from-aurora-teal-500 via-aurora-purple-500 to-aurora-green-500",
                "opacity-20"
              )}
              style={{
                padding: "1px",
              }}
            />
          </motion.div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl px-4 py-3",
              "bg-card text-foreground",
              "border border-border",
              "focus:outline-none focus:border-aurora-teal-500 focus:ring-2 focus:ring-aurora-teal-500/20",
              "transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "placeholder:text-muted-foreground",
              "text-sm"
            )}
          />
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={disabled || !message.trim()}
          className={cn(
            "flex-shrink-0 flex items-center justify-center",
            "h-12 w-12 rounded-xl",
            "bg-gradient-to-br from-aurora-teal-500 via-aurora-purple-500 to-aurora-teal-600",
            "text-white shadow-lg shadow-aurora-purple-500/20",
            "hover:shadow-xl hover:shadow-aurora-purple-500/30",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-teal-400 focus-visible:ring-offset-2",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          )}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          <motion.svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{
              x: message.trim() ? 2 : 0,
              rotate: message.trim() ? 0 : -45,
            }}
            transition={{ duration: 0.2 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </motion.svg>
          <span className="sr-only">Send message</span>
        </motion.button>
      </form>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        Press <kbd className="px-1.5 py-0.5 bg-muted text-foreground rounded text-[10px] font-mono">Enter</kbd> to send,{" "}
        <kbd className="px-1.5 py-0.5 bg-muted text-foreground rounded text-[10px] font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}

export default ChatInput;
