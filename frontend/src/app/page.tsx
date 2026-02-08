"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GradientBackground } from "@/components/effects";
import { ChatAvatar } from "@/components/chat/chat-avatar";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Aurora gradient background */}
      <GradientBackground />

      <main className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Animated Avatar */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-8"
        >
          <ChatAvatar size="lg" expression="happy" />
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold tracking-tight sm:text-6xl"
        >
          <span className="text-aurora">Aiden</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-lg text-muted-foreground"
        >
          AI-Driven Executive Notepad
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 max-w-md text-base text-muted-foreground"
        >
          Your intelligent task management assistant. Chat naturally to create,
          organize, and complete your tasks effortlessly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/signup"
            className="btn-aurora inline-flex h-12 items-center justify-center rounded-xl px-8 text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Get Started
            </span>
          </Link>
          <Link
            href="/login"
            className="glass inline-flex h-12 items-center justify-center rounded-xl border border-border/50 px-8 text-sm font-medium text-foreground transition-all hover:bg-muted/50"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            { icon: "💬", title: "Natural Chat", desc: "Talk like you text" },
            { icon: "✨", title: "AI-Powered", desc: "Smart task parsing" },
            { icon: "🎯", title: "Stay Focused", desc: "Priority management" },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
