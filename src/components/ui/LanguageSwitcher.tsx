"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    const nextLocale: Locale = locale === "ar" ? "fr" : "ar";
    setLocale(nextLocale);
  };

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-slate-100 transition-colors shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
      title="Switch Language / تغيير اللغة"
      aria-label="Switch Language"
    >
      <Globe className="w-3.5 h-3.5 text-slate-400" />
      <span className="font-semibold">{locale === "ar" ? "Français" : "العربية"}</span>
    </button>
  );
}
