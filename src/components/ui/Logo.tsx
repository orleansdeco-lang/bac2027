"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "arabic" | "icon" | "product";
  theme?: "auto" | "light" | "dark";
  productTag?: string; // e.g. "BAC"
  showTagline?: boolean;
  className?: string;
  href?: string | null;
}

/**
 * ShaterIcon - The distinct brand icon mark for SHATER
 * Concept: Geometric upward ascent, progressive stepping, and the spark of mastery.
 * Minimalist, highly visible at 16px up to 512px. No cliches.
 */
export function ShaterIcon({
  size = 24,
  className,
  variant = "brand",
}: {
  size?: number;
  className?: string;
  variant?: "brand" | "white" | "dark";
}) {
  const bgClass =
    variant === "white"
      ? "bg-white text-[var(--color-primary)] shadow-sm"
      : variant === "dark"
      ? "bg-[#1E2726] text-emerald-400 border border-emerald-500/20"
      : "bg-[var(--color-primary)] text-white shadow-sm border border-[var(--color-primary)]/30";

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
        bgClass,
        className
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[68%] h-[68%]"
      >
        {/* Geometric ascendant step (layer 1) */}
        <path
          d="M6 23L16 13L26 23"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        {/* Higher ascendant peak (layer 2 - mastery ascent) */}
        <path
          d="M9 16.5L16 9.5L23 16.5"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Apex Star / Beacon of Clarity & Precision */}
        <circle
          cx="16"
          cy="5"
          r="2.2"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export function Logo({
  size = "md",
  variant = "full",
  theme = "auto",
  productTag,
  showTagline = false,
  className,
  href,
}: LogoProps) {
  const { user } = useAuth();
  const targetHref = href !== undefined ? href : user ? "/dashboard" : "/";

  const sizeMap = {
    sm: {
      iconSize: 28,
      arabicText: "text-base font-black tracking-tight",
      latinText: "text-[9px] tracking-[0.18em] font-extrabold",
      tagline: "text-[10px]",
      productBadge: "text-[9px] px-1.5 py-0.2",
    },
    md: {
      iconSize: 34,
      arabicText: "text-lg sm:text-xl font-black tracking-tight",
      latinText: "text-[10px] sm:text-[11px] tracking-[0.2em] font-extrabold",
      tagline: "text-[11px]",
      productBadge: "text-[10px] px-1.5 py-0.5",
    },
    lg: {
      iconSize: 42,
      arabicText: "text-2xl sm:text-3xl font-black tracking-tight",
      latinText: "text-xs tracking-[0.24em] font-black",
      tagline: "text-xs",
      productBadge: "text-xs px-2 py-0.5",
    },
    xl: {
      iconSize: 52,
      arabicText: "text-3xl sm:text-4xl font-black tracking-tight",
      latinText: "text-sm tracking-[0.26em] font-black",
      tagline: "text-sm",
      productBadge: "text-xs px-2.5 py-1",
    },
  };

  const currentSize = sizeMap[size];

  // Theme text color adaptations
  const primaryTextColor =
    theme === "light"
      ? "text-white"
      : theme === "dark"
      ? "text-[#26302F]"
      : "text-theme-text";

  const mutedTextColor =
    theme === "light"
      ? "text-white/70"
      : theme === "dark"
      ? "text-[#5F8F86]"
      : "text-[var(--color-primary)]";

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 select-none group text-start",
        className
      )}
    >
      {/* Icon Mark */}
      <ShaterIcon
        size={currentSize.iconSize}
        variant={theme === "light" ? "white" : "brand"}
      />

      {/* Typography: Arabic + Latin Brand */}
      {variant !== "icon" && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-sans transition-colors",
                currentSize.arabicText,
                primaryTextColor
              )}
            >
              الشاطر
            </span>

            {productTag && (
              <span
                className={cn(
                  "font-mono font-bold rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 uppercase",
                  currentSize.productBadge
                )}
              >
                {productTag}
              </span>
            )}
          </div>

          {variant !== "arabic" && (
            <span
              className={cn(
                "font-mono uppercase transition-colors mt-0.5",
                currentSize.latinText,
                mutedTextColor
              )}
            >
              SHATER
            </span>
          )}

          {showTagline && (
            <span
              className={cn(
                "font-medium text-theme-muted mt-1 leading-tight",
                currentSize.tagline
              )}
            >
              منظومة ذكية للتعلم وبناء الكفاءة
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (targetHref) {
    return (
      <Link
        href={targetHref}
        className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded-xl"
        aria-label="الشاطر | SHATER"
      >
        {content}
      </Link>
    );
  }

  return content;
}
