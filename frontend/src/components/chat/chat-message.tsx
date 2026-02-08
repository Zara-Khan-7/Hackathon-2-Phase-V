"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChatMessage as ChatMessageType, ToolInvocation } from "@/lib/api/chat";
import { cn } from "@/lib/utils";
import { ChatAvatar } from "./chat-avatar";
import {
  userMessageVariants,
  assistantMessageVariants,
  scaleInVariants,
} from "@/lib/animations";

interface ChatMessageProps {
  message: ChatMessageType;
  showToolCalls?: boolean;
  showAvatar?: boolean;
}

/**
 * Tool Call Badge with animation
 */
function ToolCallBadge({ tool }: { tool: ToolInvocation }) {
  return (
    <motion.span
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        "transition-all duration-200",
        tool.success
          ? "bg-aurora-green-500/20 text-aurora-green-700 dark:text-aurora-green-400 border border-aurora-green-500/30"
          : "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30"
      )}
    >
      {tool.success ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {tool.tool_name.replace(/_/g, " ")}
    </motion.span>
  );
}

/**
 * Enhanced Chat Message Component
 *
 * Features:
 * - User: Right-aligned, aurora gradient
 * - Bot: Left-aligned with avatar
 * - Staggered entrance animations
 * - Tool invocation badges with animations
 * - Glassmorphism design for assistant messages
 */
export function ChatMessage({
  message,
  showToolCalls = true,
  showAvatar = true,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      variants={isUser ? userMessageVariants : assistantMessageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "flex w-full items-end gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for assistant */}
      {!isUser && showAvatar && (
        <div className="flex-shrink-0 mb-1">
          <ChatAvatar
            expression={
              message.tool_calls && message.tool_calls.length > 0
                ? "happy"
                : "idle"
            }
            size="sm"
          />
        </div>
      )}

      {/* Message bubble */}
      <motion.div
        className={cn(
          "max-w-[75%] sm:max-w-[75%] max-sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3",
          "transition-all duration-200",
          isUser
            ? [
                "bg-gradient-to-br from-aurora-teal-600 via-aurora-purple-600 to-aurora-teal-700",
                "text-white font-medium",
                "rounded-br-md",
                "shadow-lg shadow-aurora-purple-500/30",
              ]
            : [
                "glass-card",
                "text-foreground",
                "rounded-bl-md",
                "border border-border/50",
                "bg-card",
              ]
        )}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Message content */}
        <p className={cn(
          "whitespace-pre-wrap leading-relaxed text-sm",
          isUser ? "text-white" : "text-foreground"
        )}>
          {message.content}
        </p>

        {/* Tool calls display */}
        {showToolCalls && message.tool_calls && message.tool_calls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={cn(
              "mt-3 flex flex-wrap gap-1.5 border-t pt-3",
              isUser ? "border-white/20" : "border-border/50"
            )}
          >
            {message.tool_calls.map((tool, index) => (
              <ToolCallBadge key={index} tool={tool} />
            ))}
          </motion.div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "mt-2 text-xs",
              isUser ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ChatMessage;
