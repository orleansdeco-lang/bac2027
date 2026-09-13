import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-card border-theme text-theme-secondary",
    primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-[var(--color-primary)]/30",
    success: "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/30",
    warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/30",
    danger: "bg-[var(--color-error-soft)] text-[var(--color-error)] border-[var(--color-error)]/30",
    outline: "bg-transparent text-theme-secondary border-theme",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border leading-none select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
