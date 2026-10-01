"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "sidebar";
}

export function LanguageSwitcher({ className, variant = "pill" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    const nextLocale: Locale = locale === "ar" ? "fr" : "ar";
    setLocale(nextLocale);
  };

  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "w-full flex items-center justify-between p-1 bg-surface-soft/80 border border-theme rounded-2xl shadow-xs",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setLocale("ar")}
          className={cn(
            "flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
            locale === "ar"
              ? "bg-[var(--color-primary)] text-white shadow-xs"
              : "text-theme-muted hover:text-theme-text hover:bg-card/60"
          )}
        >
          <span>🇩🇿 العربية</span>
        </button>
        <button
          type="button"
          onClick={() => setLocale("fr")}
          className={cn(
            "flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
            locale === "fr"
              ? "bg-[var(--color-primary)] text-white shadow-xs"
              : "text-theme-muted hover:text-theme-text hover:bg-card/60"
          )}
        >
          <span>Français</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-theme bg-card hover:bg-card-hover text-xs font-bold text-theme-text hover:text-theme-text transition-all shadow-xs cursor-pointer active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        className
      )}
      title={locale === "ar" ? "Passer en Français" : "التحويل إلى العربية"}
      aria-label="Switch Language"
    >
      <Globe className="w-3.5 h-3.5 text-[var(--color-primary)]" />
      <span className="font-sans font-bold">{locale === "ar" ? "Français" : "العربية"}</span>
    </button>
  );
}
