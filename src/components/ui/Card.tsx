import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "highlight" | "elevated" | "interactive";
}

export function Card({
  children,
  variant = "default",
  className,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-card border-theme text-theme-text shadow-theme-card",
    muted: "bg-card-muted border-theme text-theme-secondary",
    highlight: "bg-card border-[var(--color-primary)]/40 text-theme-text shadow-theme-glow/15 ring-1 ring-[var(--color-primary)]/20",
    elevated: "bg-card-elevated border-theme text-theme-text shadow-theme-card",
    interactive:
      "bg-card border-theme hover:border-[var(--color-border-hover)] hover:bg-card-hover active:scale-[0.99] transition-all duration-200 cursor-pointer text-theme-text shadow-sm hover:shadow-theme-card",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
