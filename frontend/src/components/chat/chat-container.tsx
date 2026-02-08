"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatAvatar, ChatAvatarWithName } from "./chat-avatar";
import { TypingIndicator } from "./typing-indicator";
import {
  ChatMessage as ChatMessageType,
  sendChatMessage,
} from "@/lib/api/chat";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  staggerContainerVariants,
  staggerItemVariants,
  scaleInVariants,
  fadeVariants,
} from "@/lib/animations";

interface ChatContainerProps {
  className?: string;
  isFloating?: boolean;
  onClose?: () => void;
}

/**
 * Enhanced Chat Container with Aurora Design
 *
 * Features:
 * - Glassmorphism card design
 * - Animated gradient border
 * - Avatar in header with name "Aiden"
 * - Smooth open/close transitions
 * - Staggered message animations
 */
export function ChatContainer({
  className,
  isFloating = false,
  onClose,
}: ChatContainerProps) {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!session?.user?.id) {
      setError("Not authenticated. Please log in.");
      return;
    }

    // Add user message to UI immediately
    const userMessage: ChatMessageType = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(session.user.id, content, false);

      // Add assistant message to UI
      const assistantMessage: ChatMessageType = {
        role: "assistant",
        content: response.message,
        tool_calls: response.tools_invoked,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);

      // Handle auth errors
      if (errorMessage.includes("log in") || errorMessage.includes("Session expired")) {
        router.push("/login?error=session_expired");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isSessionLoading) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <ChatAvatar expression="thinking" size="lg" showThinkingBubble />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "flex flex-col",
        isFloating
          ? "h-[70vh] sm:h-[500px] w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] rounded-2xl glass-card overflow-hidden shadow-2xl"
          : "h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-aurora-teal-500/10 via-aurora-purple-500/10 to-aurora-green-500/10 px-4 py-3">
        <ChatAvatarWithName
          expression={isLoading ? "thinking" : "idle"}
          size="sm"
          showName
        />

        {isFloating && onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close chat"
          >
            <svg
              className="h-5 w-5"
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
          </motion.button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex h-full flex-col items-center justify-center text-center px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <ChatAvatar expression="happy" size="xl" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-lg font-semibold text-aurora"
              >
                Hi, I&apos;m Aiden!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 max-w-xs text-sm text-foreground/80"
              >
                I can help you manage your tasks. Try asking me something like:
              </motion.p>

              <motion.ul
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 space-y-2 text-sm"
              >
                {[
                  "Add a task to buy groceries tomorrow",
                  "Show me my pending tasks",
                  "Mark the grocery task as done",
                ].map((suggestion, index) => (
                  <motion.li
                    key={index}
                    variants={staggerItemVariants}
                    className="px-3 py-2 rounded-lg bg-card border border-border/50 text-foreground cursor-pointer hover:bg-aurora-teal-500/10 hover:border-aurora-teal-500/30 transition-colors text-sm"
                    onClick={() => handleSendMessage(suggestion)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    &quot;{suggestion}&quot;
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isLoading && (
                  <TypingIndicator showAvatar />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t border-border/50 bg-background/50 backdrop-blur-sm p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask Aiden to manage your tasks..."
        />
      </div>
    </motion.div>
  );
}

export default ChatContainer;
