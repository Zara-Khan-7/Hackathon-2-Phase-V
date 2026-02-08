/**
 * Animation Utilities Library with Framer Motion Support
 *
 * Reusable animation utilities for consistent motion design across the application.
 * All animations are hardware-accelerated (transform + opacity only) for 60fps performance.
 *
 * @module animations
 */

import type { Variants, Transition } from "framer-motion";

/**
 * Animation variant types for type-safe animation usage
 */
export type AnimationVariant =
  | "slide-in-right"
  | "slide-in-left"
  | "slide-up"
  | "slide-down"
  | "fade-in"
  | "fade-in-up"
  | "scale-in"
  | "bounce-in"
  | "typing-dot"
  | "press";

/**
 * Avatar expression states for animated avatar
 */
export type AvatarExpression =
  | "idle"
  | "thinking"
  | "speaking"
  | "happy"
  | "surprised"
  | "error";

/**
 * Timing functions for consistent easing across animations
 */
export const easings = {
  /** Smooth, natural easing for most animations */
  smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Bouncy, playful easing for emphasis */
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  /** Standard ease-out for fades */
  easeOut: "ease-out",
  /** Standard ease-in for exits */
  easeIn: "ease-in",
  /** Ease in and out for symmetric animations */
  easeInOut: "ease-in-out",
} as const;

/**
 * Spring physics presets for Framer Motion
 */
export const springs = {
  /** Gentle spring for subtle movements */
  gentle: { type: "spring", stiffness: 120, damping: 14 } as Transition,
  /** Bouncy spring for playful animations */
  bouncy: { type: "spring", stiffness: 300, damping: 20 } as Transition,
  /** Stiff spring for snappy interactions */
  stiff: { type: "spring", stiffness: 400, damping: 25 } as Transition,
  /** Slow spring for dramatic effects */
  slow: { type: "spring", stiffness: 80, damping: 20 } as Transition,
} as const;

/**
 * Standard animation durations in milliseconds
 */
export const durations = {
  /** Fast animations (e.g., button presses) */
  fast: 100,
  /** Standard animations (e.g., fades, slides) */
  normal: 200,
  /** Moderate animations (e.g., page transitions) */
  moderate: 300,
  /** Slow animations (e.g., complex choreography) */
  slow: 400,
  /** Extra slow (e.g., emphasis animations) */
  slower: 600,
} as const;

/**
 * Animation delay utilities for staggered animations
 */
export const delays = {
  /** No delay */
  none: 0,
  /** Short delay for slight stagger */
  short: 100,
  /** Medium delay for noticeable stagger */
  medium: 200,
  /** Long delay for dramatic stagger */
  long: 300,
} as const;

// ============================================================================
// FRAMER MOTION VARIANTS
// ============================================================================

/**
 * Fade variants for Framer Motion
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Slide up variants for Framer Motion
 */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Slide in from right variants
 */
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Slide in from left variants
 */
export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Scale in variants for modals/popups
 */
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/**
 * Bounce in variants for emphasis
 */
export const bounceInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    transition: { duration: 0.2 },
  },
};

/**
 * Container variants for staggered children
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Item variants for staggered lists
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

/**
 * Float animation variants
 */
export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Pulse glow variants
 */
export const pulseGlowVariants: Variants = {
  initial: {
    boxShadow: "0 0 20px rgba(20, 184, 166, 0.3)",
  },
  animate: {
    boxShadow: [
      "0 0 20px rgba(20, 184, 166, 0.3)",
      "0 0 40px rgba(20, 184, 166, 0.6)",
      "0 0 20px rgba(20, 184, 166, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// AVATAR EXPRESSION VARIANTS
// ============================================================================

/**
 * Avatar eye variants for different expressions
 */
export const avatarEyeVariants: Variants = {
  idle: {
    scaleY: 1,
    transition: { duration: 0.1 },
  },
  blink: {
    scaleY: [1, 0.1, 1],
    transition: { duration: 0.15 },
  },
  thinking: {
    scaleY: 0.8,
    y: -1,
    transition: { duration: 0.2 },
  },
  speaking: {
    scaleY: 1,
    transition: { duration: 0.1 },
  },
  happy: {
    scaleY: 0.7,
    y: 1,
    transition: { duration: 0.2 },
  },
  surprised: {
    scaleY: 1.2,
    scaleX: 1.1,
    transition: { duration: 0.1 },
  },
  error: {
    scaleY: 0.9,
    x: [0, -1, 1, 0],
    transition: { duration: 0.3 },
  },
};

/**
 * Avatar mouth variants for different expressions
 */
export const avatarMouthVariants: Variants = {
  idle: {
    scaleY: 1,
    scaleX: 1,
    transition: { duration: 0.1 },
  },
  thinking: {
    scaleX: 0.5,
    x: 2,
    transition: { duration: 0.2 },
  },
  speaking: {
    scaleY: [1, 0.5, 1],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  happy: {
    scaleX: 1.3,
    scaleY: 0.8,
    borderRadius: "0 0 50% 50%",
    transition: { duration: 0.2 },
  },
  surprised: {
    scaleY: 1.5,
    scaleX: 0.8,
    transition: { duration: 0.1 },
  },
  error: {
    scaleY: 0.5,
    y: 1,
    transition: { duration: 0.2 },
  },
};

/**
 * Thought bubble variants for thinking state
 */
export const thoughtBubbleVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// CHAT MESSAGE VARIANTS
// ============================================================================

/**
 * Chat message variants for user messages
 */
export const userMessageVariants: Variants = {
  hidden: { opacity: 0, x: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

/**
 * Chat message variants for assistant messages
 */
export const assistantMessageVariants: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

/**
 * Typing indicator dot variants
 */
export const typingDotVariants: Variants = {
  initial: { y: 0, opacity: 0.3 },
  animate: {
    y: [-8, 0],
    opacity: [1, 0.3],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// TASK CARD VARIANTS
// ============================================================================

/**
 * Task card variants
 */
export const taskCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3 },
  },
  hover: {
    y: -2,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 },
  },
};

/**
 * Checkbox animation variants
 */
export const checkboxVariants: Variants = {
  unchecked: {
    scale: 1,
    borderColor: "rgba(148, 163, 184, 0.5)",
  },
  checked: {
    scale: [1, 1.2, 1],
    borderColor: "#14b8a6",
    backgroundColor: "#14b8a6",
    transition: { duration: 0.3 },
  },
};

/**
 * Checkmark path variants for drawing animation
 */
export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.1 },
    },
  },
};

/**
 * Confetti particle variants
 */
export const confettiVariants: Variants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  animate: {
    y: [0, -20, 100],
    x: [0, 10, -10, 0],
    opacity: [1, 1, 0],
    rotate: [0, 180, 720],
    scale: [1, 1.2, 0.5],
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get animation class name by variant
 */
export function getAnimationClass(variant: AnimationVariant): string {
  return `animate-${variant}`;
}

/**
 * Create staggered animation delay styles
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  staggerDelay: number = 100
): React.CSSProperties {
  return {
    animationDelay: `${baseDelay + index * staggerDelay}ms`,
  };
}

/**
 * Combine multiple animation classes
 */
export function combineAnimations(...animations: AnimationVariant[]): string {
  return animations.map(getAnimationClass).join(" ");
}

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Create custom stagger config for Framer Motion
 */
export function createStaggerConfig(
  staggerDelay: number = 0.1,
  delayChildren: number = 0
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Transition class builders for common patterns
 */
export const transitions = {
  smooth: "transition-smooth",
  colors: "transition-colors-smooth",
  all: "transition-all duration-200 ease-out",
} as const;

/**
 * Hover effect utilities
 */
export const hoverEffects = {
  lift: "hover-lift",
  scale: "hover-scale",
  glow: "hover-glow",
} as const;

/**
 * Common animation presets for typical UI patterns
 */
export const animationPresets = {
  messageUser: "animate-slide-in-right",
  messageAssistant: "animate-slide-in-left",
  buttonPress: "active:scale-95 transition-transform duration-100",
  spinner: "animate-spin",
  typingDot: "animate-typing-dot",
  emptyState: "animate-fade-in-up",
  alert: "animate-slide-down",
  badge: "animate-scale-in",
  listItem: "animate-slide-up",
  float: "floating",
  glow: "glow-pulse",
} as const;

/**
 * Performance optimization utilities
 */
export const performanceHints = {
  willChange: "will-change-[transform,opacity]",
  gpuAccelerate: "transform-gpu",
} as const;

/**
 * Type-safe style props for animations
 */
export interface AnimationStyleProps {
  delay?: number;
  duration?: number;
  easing?: keyof typeof easings;
  iterations?: number | "infinite";
}

/**
 * Generate animation style object from props
 */
export function getAnimationStyles(props: AnimationStyleProps): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (props.delay !== undefined) {
    styles.animationDelay = `${props.delay}ms`;
  }

  if (props.duration !== undefined) {
    styles.animationDuration = `${props.duration}ms`;
  }

  if (props.easing) {
    styles.animationTimingFunction = easings[props.easing];
  }

  if (props.iterations !== undefined) {
    styles.animationIterationCount = props.iterations;
  }

  return styles;
}

/**
 * Animation orchestration utilities
 */
export const orchestration = {
  calculateStaggerDuration(
    itemCount: number,
    itemDuration: number,
    staggerDelay: number,
    baseDelay: number = 0
  ): number {
    return baseDelay + (itemCount - 1) * staggerDelay + itemDuration;
  },

  generateStaggerDelays(
    count: number,
    staggerDelay: number = 100,
    baseDelay: number = 0
  ): number[] {
    return Array.from({ length: count }, (_, i) => baseDelay + i * staggerDelay);
  },
};
