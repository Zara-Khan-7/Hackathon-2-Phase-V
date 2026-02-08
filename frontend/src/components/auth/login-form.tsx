"use client";

import * as React from "react";
// Router not needed - using window.location for redirect
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Client-side validation
    const newErrors: FormErrors = {};

    if (!email || email.trim().length === 0) {
      newErrors.email = "Required field";
    }

    if (!password || password.length === 0) {
      newErrors.password = "Required field";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        // Generic error message for security (don't reveal if email exists)
        setErrors({ general: "Invalid email or password" });
        setIsLoading(false);
        return;
      }

      // Use window.location for full page reload to ensure cookie is sent
      window.location.href = "/dashboard";
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {errors.general && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-700 dark:text-red-400">
          {errors.general}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          disabled={isLoading}
          error={errors.email}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          disabled={isLoading}
          error={errors.password}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
