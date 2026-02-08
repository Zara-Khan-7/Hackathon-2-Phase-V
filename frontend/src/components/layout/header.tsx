"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";

interface HeaderProps {
  className?: string;
  sidebarCollapsed?: boolean;
}

/**
 * Header Component with Aurora Design
 *
 * Features:
 * - Glassmorphism design
 * - User profile dropdown
 * - Theme toggle (sun/moon morph)
 * - Responsive design
 */
export function Header({ className, sidebarCollapsed = false }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "glass border-b border-border/50",
        "transition-all duration-300",
        // Mobile: full width
        "left-0 md:left-64",
        // Tablet: account for collapsed sidebar
        "md:max-lg:left-20",
        // Desktop: follow sidebar state
        sidebarCollapsed && "lg:left-20",
        !sidebarCollapsed && "lg:left-64",
        className
      )}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Page title area - can be customized via props */}
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-base md:text-lg font-semibold text-foreground">
            <span className="hidden sm:inline">Welcome back</span>
            <span className="sm:hidden">Hi</span>
            {session?.user?.name && (
              <span className="text-aurora">, {session.user.name.split(" ")[0]}</span>
            )}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme toggle */}
          {mounted && (
            <motion.button
              onClick={toggleTheme}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl",
                "bg-muted/50 hover:bg-muted",
                "transition-colors duration-200"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {/* Sun icon */}
              <motion.svg
                className="absolute h-5 w-5 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={false}
                animate={{
                  scale: theme === "dark" ? 0 : 1,
                  rotate: theme === "dark" ? -90 : 0,
                  opacity: theme === "dark" ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </motion.svg>

              {/* Moon icon */}
              <motion.svg
                className="absolute h-5 w-5 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={false}
                animate={{
                  scale: theme === "dark" ? 1 : 0,
                  rotate: theme === "dark" ? 0 : 90,
                  opacity: theme === "dark" ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </motion.svg>
            </motion.button>
          )}

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setShowDropdown(!showDropdown)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2",
                "bg-muted/50 hover:bg-muted",
                "transition-colors duration-200"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* User avatar */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-aurora-teal-500 to-aurora-purple-500 flex items-center justify-center text-white font-medium text-sm">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email || ""}
                </p>
              </div>

              {/* Dropdown arrow */}
              <motion.svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: showDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.button>

            {/* Dropdown menu */}
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "absolute right-0 top-full mt-2 w-56",
                  "glass-card rounded-xl shadow-lg",
                  "py-2"
                )}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-medium text-foreground">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <button
                    onClick={handleSignOut}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5",
                      "text-sm text-left text-red-600 dark:text-red-400",
                      "hover:bg-red-500/10",
                      "transition-colors"
                    )}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
