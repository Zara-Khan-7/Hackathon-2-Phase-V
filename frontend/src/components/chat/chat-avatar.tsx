"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AvatarExpression } from "@/lib/animations";
import {
  avatarEyeVariants,
  avatarMouthVariants,
  thoughtBubbleVariants,
  floatVariants,
} from "@/lib/animations";

interface ChatAvatarProps {
  expression?: AvatarExpression;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showThinkingBubble?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

/**
 * Animated Chat Avatar Component - "Aiden"
 *
 * Features:
 * - SVG-based animated character
 * - Multiple expression states (idle, thinking, speaking, happy, surprised, error)
 * - Aurora gradient fill
 * - Smooth Framer Motion transitions
 * - Thought bubble for thinking state
 */
export function ChatAvatar({
  expression = "idle",
  size = "md",
  className,
  showThinkingBubble = false,
}: ChatAvatarProps) {
  const [isBlinking, setIsBlinking] = React.useState(false);
  const pixelSize = sizeMap[size];

  // Random blinking effect
  React.useEffect(() => {
    if (expression === "idle" || expression === "speaking") {
      const blinkInterval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }, 3000 + Math.random() * 2000);

      return () => clearInterval(blinkInterval);
    }
  }, [expression]);

  const currentEyeExpression = isBlinking ? "blink" : expression;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Main Avatar */}
      <motion.div
        variants={floatVariants}
        initial="initial"
        animate="animate"
        className="relative"
      >
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Gradient Definitions */}
          <defs>
            {/* Aurora gradient for the face */}
            <linearGradient id="auroraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>

            {/* Animated aurora gradient */}
            <linearGradient id="auroraAnimated" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6">
                <animate
                  attributeName="stop-color"
                  values="#14b8a6;#a855f7;#22c55e;#14b8a6"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#a855f7">
                <animate
                  attributeName="stop-color"
                  values="#a855f7;#22c55e;#14b8a6;#a855f7"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Inner shadow */}
            <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="3" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="black" floodOpacity="0.2" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>

          {/* Outer glow ring */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#auroraAnimated)"
            strokeWidth="2"
            opacity="0.5"
            filter="url(#glow)"
          />

          {/* Main face circle */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="url(#auroraGradient)"
            filter="url(#innerShadow)"
          />

          {/* Face highlight */}
          <ellipse
            cx="35"
            cy="35"
            rx="15"
            ry="10"
            fill="white"
            opacity="0.15"
          />
        </svg>

        {/* Eyes Container - Positioned with absolute */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ paddingBottom: `${pixelSize * 0.08}px` }}
        >
          <div
            className="flex gap-[16%]"
            style={{ marginTop: `-${pixelSize * 0.08}px` }}
          >
            {/* Left Eye */}
            <motion.div
              variants={avatarEyeVariants}
              animate={currentEyeExpression}
              className="bg-white rounded-full shadow-sm"
              style={{
                width: `${pixelSize * 0.18}px`,
                height: `${pixelSize * 0.22}px`,
              }}
            >
              {/* Pupil */}
              <motion.div
                className="bg-slate-800 rounded-full absolute"
                style={{
                  width: `${pixelSize * 0.1}px`,
                  height: `${pixelSize * 0.1}px`,
                  top: "30%",
                  left: "25%",
                }}
                animate={{
                  x: expression === "thinking" ? -1 : 0,
                }}
              />
            </motion.div>

            {/* Right Eye */}
            <motion.div
              variants={avatarEyeVariants}
              animate={currentEyeExpression}
              className="bg-white rounded-full shadow-sm"
              style={{
                width: `${pixelSize * 0.18}px`,
                height: `${pixelSize * 0.22}px`,
              }}
            >
              {/* Pupil */}
              <motion.div
                className="bg-slate-800 rounded-full absolute"
                style={{
                  width: `${pixelSize * 0.1}px`,
                  height: `${pixelSize * 0.1}px`,
                  top: "30%",
                  left: "25%",
                }}
                animate={{
                  x: expression === "thinking" ? -1 : 0,
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Mouth */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ paddingTop: `${pixelSize * 0.25}px` }}
        >
          <motion.div
            variants={avatarMouthVariants}
            animate={expression}
            className="bg-slate-700 origin-center"
            style={{
              width: `${pixelSize * 0.2}px`,
              height: `${pixelSize * 0.08}px`,
              borderRadius:
                expression === "happy"
                  ? "0 0 100px 100px"
                  : expression === "surprised"
                  ? "50%"
                  : "4px",
            }}
          />
        </div>
      </motion.div>

      {/* Thinking Bubble */}
      <AnimatePresence>
        {(expression === "thinking" || showThinkingBubble) && (
          <motion.div
            variants={thoughtBubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute -top-2 -right-2"
          >
            <div className="flex flex-col items-end gap-0.5">
              {/* Small bubbles */}
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-aurora-teal-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 0,
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-aurora-purple-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.2,
                }}
              />
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-aurora-green-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.4,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Happy sparkles */}
      <AnimatePresence>
        {expression === "happy" && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  x: [0, (i - 1) * 20],
                  y: [0, -15 - i * 5],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="absolute top-0"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-yellow-400"
                >
                  <path
                    d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Mini Avatar for floating button preview
 */
export function MiniChatAvatar({ className }: { className?: string }) {
  return (
    <ChatAvatar
      expression="idle"
      size="sm"
      className={className}
    />
  );
}

/**
 * Avatar with name label
 */
export function ChatAvatarWithName({
  expression = "idle",
  size = "md",
  showName = true,
  className,
}: ChatAvatarProps & { showName?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ChatAvatar expression={expression} size={size} />
      {showName && (
        <div className="flex flex-col">
          <span className="font-semibold text-aurora bg-gradient-to-r from-aurora-teal-500 via-aurora-purple-500 to-aurora-green-500 bg-clip-text text-transparent">
            Aiden
          </span>
          <span className="text-xs text-muted-foreground">AI Assistant</span>
        </div>
      )}
    </div>
  );
}

export default ChatAvatar;
