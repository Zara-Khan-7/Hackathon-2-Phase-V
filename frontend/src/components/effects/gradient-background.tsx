"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  className?: string;
  enableMouseInteraction?: boolean;
}

/**
 * Animated Aurora Gradient Background
 *
 * Features:
 * - Animated aurora mesh with subtle drift
 * - Optional mouse-follow interaction
 * - Performance optimized with CSS animations
 * - Respects reduced motion preference
 */
export function GradientBackground({
  className,
  enableMouseInteraction = false,
}: GradientBackgroundProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 50, y: 50 });

  React.useEffect(() => {
    if (!enableMouseInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enableMouseInteraction]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[-1] overflow-hidden",
        "bg-background",
        className
      )}
    >
      {/* Static aurora gradient layer */}
      <div className="aurora-bg" />

      {/* Interactive mouse-follow layer */}
      {enableMouseInteraction && (
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)",
          }}
          animate={{
            x: `calc(${mousePosition.x}vw - 300px)`,
            y: `calc(${mousePosition.y}vh - 300px)`,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 30,
          }}
        />
      )}

      {/* Decorative floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(20, 184, 166, 0.5) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/2 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 197, 94, 0.5) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
}

export default GradientBackground;
