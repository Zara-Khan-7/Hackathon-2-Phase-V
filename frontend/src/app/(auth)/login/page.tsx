"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";
import { GradientBackground } from "@/components/effects";
import { ChatAvatar } from "@/components/chat/chat-avatar";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = error === "session_expired"
    ? "Your session has expired. Please sign in again."
    : null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md space-y-8"
    >
      {/* Avatar and Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <ChatAvatar size="md" expression="happy" />
        </motion.div>
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Welcome back
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          Sign in to continue with <span className="text-aurora">Aiden</span>
        </motion.p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-700 dark:text-yellow-400"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Login Form Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <LoginForm />
      </motion.div>

      {/* Sign up link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-muted-foreground"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-aurora-teal-600 hover:text-aurora-teal-500 dark:text-aurora-teal-400"
        >
          Sign up
        </Link>
      </motion.p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Aurora gradient background */}
      <GradientBackground />

      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
