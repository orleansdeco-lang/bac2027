import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md";
  variant?: "primary" | "accent" | "success";
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = "md",
  variant = "primary",
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantStyles = {
    primary: "bg-[var(--color-primary)]",
    accent: "bg-[var(--color-accent)]",
    success: "bg-emerald-500",
  };

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-theme-secondary">
          {label && <span className="font-sans">{label}</span>}
          {showPercentage && (
            <span className="font-mono tabular-nums font-bold text-theme-text">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-card-muted border border-theme",
          heightStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out shadow-sm",
            variantStyles[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
