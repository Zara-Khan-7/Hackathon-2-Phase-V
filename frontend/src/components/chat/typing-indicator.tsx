"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChatAvatar } from "./chat-avatar";
import { typingDotVariants, slideInLeftVariants } from "@/lib/animations";

interface TypingIndicatorProps {
  className?: string;
  showAvatar?: boolean;
}

/**
 * Typing Indicator Component
 *
 * Features:
 * - Three animated dots with wave animation
 * - Optional avatar showing thinking expression
 * - Aurora-colored dots
 * - Glassmorphism container
 */
export function TypingIndicator({
  className,
  showAvatar = true,
}: TypingIndicatorProps) {
  return (
    <motion.div
      variants={slideInLeftVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn("flex items-end gap-2", className)}
    >
      {/* Avatar */}
      {showAvatar && (
        <ChatAvatar
          expression="thinking"
          size="sm"
          showThinkingBubble
        />
      )}

      {/* Typing dots container */}
      <div className="glass-card px-4 py-3 max-w-fit">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              variants={typingDotVariants}
              initial="initial"
              animate="animate"
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                index === 0 && "bg-aurora-teal-500",
                index === 1 && "bg-aurora-purple-500",
                index === 2 && "bg-aurora-green-500"
              )}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
              transition={{
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Inline typing indicator (just the dots)
 */
export function InlineTypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            index === 0 && "bg-aurora-teal-500",
            index === 1 && "bg-aurora-purple-500",
            index === 2 && "bg-aurora-green-500"
          )}
          animate={{
            y: [0, -4, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default TypingIndicator;
