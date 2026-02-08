"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-teal-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-teal-600 to-purple-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:from-teal-500 hover:to-purple-500 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500 font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]",
        outline:
          "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-teal-500 font-semibold",
        secondary:
          "bg-purple-600 text-white shadow-sm hover:bg-purple-500 font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white",
        link: "text-teal-600 dark:text-teal-400 underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 sm:h-9 px-4 py-2",
        sm: "h-9 sm:h-8 rounded-lg px-3 text-xs",
        lg: "h-11 sm:h-10 rounded-lg px-8",
        icon: "h-10 w-10 sm:h-9 sm:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
