import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm hover:shadow-md border border-white/10",
      secondary:
        "bg-card border border-theme text-theme-text hover:bg-card-hover hover:border-[var(--color-border-hover)] active:scale-[0.98] shadow-sm",
      outline:
        "border border-theme bg-transparent text-theme-text hover:bg-card-hover hover:border-[var(--color-border-hover)] active:scale-[0.98]",
      ghost:
        "bg-transparent text-theme-secondary hover:text-theme-text hover:bg-card-hover active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-2 min-h-[38px] rounded-xl font-medium",
      md: "text-sm px-5 py-2.5 min-h-[44px] rounded-xl font-semibold",
      lg: "text-base px-6 py-3.5 min-h-[50px] rounded-2xl font-bold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
