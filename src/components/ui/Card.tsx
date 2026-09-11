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
    default: "bg-[#111827] border-slate-800/80 text-slate-100 shadow-card",
    muted: "bg-[#0F172A]/70 border-slate-800/60 text-slate-200",
    highlight: "bg-[#162032] border-blue-500/30 text-slate-100 shadow-glow/10",
    elevated: "bg-[#182338] border-slate-700/70 text-slate-100 shadow-card",
    interactive:
      "bg-[#111827] border-slate-800/80 hover:border-slate-700 hover:bg-[#162032] active:bg-[#141C2D] transition-all cursor-pointer text-slate-100",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all duration-150",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
