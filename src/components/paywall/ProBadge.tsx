"use client";

import React from "react";
import { Sparkles, Crown } from "lucide-react";

interface ProBadgeProps {
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  label?: string;
}

export function ProBadge({
  size = "sm",
  className = "",
  onClick,
  label = "PRO",
}: ProBadgeProps) {
  const isSmall = size === "sm";

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-black rounded-lg border cursor-pointer select-none transition-all shadow-xs ${
        isSmall
          ? "px-1.5 py-0.5 text-[10px]"
          : "px-2.5 py-1 text-xs"
      } bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 text-amber-400 border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/20 ${className}`}
      title="ميزة الشاطر بريميوم"
    >
      <Crown className={isSmall ? "w-2.5 h-2.5" : "w-3 h-3"} />
      <span className="font-mono tracking-wider">{label}</span>
    </span>
  );
}
