"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MiniChatAvatar } from "./chat-avatar";
import { pulseGlowVariants, scaleInVariants } from "@/lib/animations";

interface ChatBotButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  hasNewMessage?: boolean;
  className?: string;
}

/**
 * Floating Chat Bot Button
 *
 * Features:
 * - Fixed bottom-right position
 * - Aurora gradient with animated glow
 * - Mini avatar preview
 * - Pulse animation on new messages
 * - Magnetic hover effect
 * - Smooth open/close transitions
 */
export function ChatBotButton({
  onClick,
  isOpen = false,
  hasNewMessage = false,
  className,
}: ChatBotButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-full right-0 mb-3 whitespace-nowrap"
          >
            <div className="glass-card px-3 py-2 text-sm font-medium text-foreground shadow-lg">
              Chat with Aiden
              <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 glass" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-aurora-teal-500 via-aurora-purple-500 to-aurora-green-500",
          "shadow-lg shadow-aurora-teal-500/30",
          "transition-all duration-300",
          "hover:shadow-xl hover:shadow-aurora-purple-500/40",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-teal-400 focus-visible:ring-offset-2"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        variants={pulseGlowVariants}
        initial="initial"
        animate={hasNewMessage ? "animate" : "initial"}
      >
        {/* Animated ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-aurora-teal-400 via-aurora-purple-400 to-aurora-green-400"
          animate={{
            scale: hasNewMessage ? [1, 1.2, 1] : 1,
            opacity: hasNewMessage ? [0.5, 0, 0.5] : 0,
          }}
          transition={{
            duration: 1.5,
            repeat: hasNewMessage ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Icon/Avatar */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="avatar"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MiniChatAvatar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* New message indicator */}
        <AnimatePresence>
          {hasNewMessage && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg"
            >
              <span className="animate-pulse">!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

export default ChatBotButton;
