import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  size = "md",
  showTagline = false,
  className,
  href = "/",
}: LogoProps) {
  const sizeStyles = {
    sm: {
      text: "text-base tracking-tight",
      badge: "text-[10px] px-1.5 py-0.5",
      icon: "w-4 h-4",
    },
    md: {
      text: "text-lg tracking-tight",
      badge: "text-xs px-2 py-0.5",
      icon: "w-5 h-5",
    },
    lg: {
      text: "text-2xl sm:text-3xl tracking-tight",
      badge: "text-xs px-2.5 py-1",
      icon: "w-6 h-6",
    },
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2 select-none group", className)}>
      {/* Brand Icon: Minimal geometric path mark with upward trajectory */}
      <div className="relative flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm border border-[var(--color-primary)]/40 group-hover:scale-105 transition-transform p-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={sizeStyles[size].icon}
        >
          {/* Path line leading upward */}
          <path d="M4 19L12 5L20 19" />
          <path d="M7.5 13H16.5" />
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-start">
        <div className="flex items-center gap-1.5 font-black text-theme-text font-sans">
          <span className={cn("font-extrabold tracking-tight", sizeStyles[size].text)}>
            BAC
          </span>
          <span className={cn("font-bold tracking-wider text-[var(--color-primary)]", sizeStyles[size].text)}>
            MASTERY
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-theme-muted leading-tight">
            ماشي واش تقرا. كيفاش توصل.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
