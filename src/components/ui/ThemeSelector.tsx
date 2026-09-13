"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme, THEMES } from "@/lib/theme/context";
import { useTranslation } from "@/lib/i18n/context";
import { Palette, Check, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudentAccess } from "@/lib/access";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";

interface ThemeSelectorProps {
  variant?: "compact" | "segmented" | "cards";
  className?: string;
}

export function ThemeSelector({
  variant = "compact",
  className,
}: ThemeSelectorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const profile = typeof window !== "undefined" && user?.id ? getStrategicProfile(user.id) : null;
  const access = getStudentAccess(profile);
  const isPremiumUnlocked = access.status === "PAID_ACTIVE" || access.status === "TRIAL_ACTIVE";

  const handleSelectTheme = (t: any) => {
    if (t.isPremium && !isPremiumUnlocked) {
      router.push("/subscribe");
      return;
    }
    setTheme(t.id);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentInfo = THEMES[theme];

  // 1. CARDS VARIANT (Used in Account / Settings page)
  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3.5", className)}>
        {themes.map((t) => {
          const isSelected = theme === t.id;
          const isLocked = t.isPremium && !isPremiumUnlocked;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTheme(t)}
              className={cn(
                "relative text-start p-4 rounded-3xl border transition-all duration-200 cursor-pointer select-none",
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] shadow-md shadow-[var(--color-primary)]/10 scale-[1.01]"
                  : "border-theme bg-card hover:border-[var(--color-border-hover)] hover:bg-card-hover"
              )}
            >
              {isSelected && (
                <span className="absolute top-3.5 end-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[10px]">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
              {isLocked && !isSelected && (
                <span className="absolute top-3.5 end-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-[10px]" title={isAr ? "مظهر احترافي (Pro)" : "Thème Premium"}>
                  <Lock className="h-3 w-3" />
                </span>
              )}

              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xl leading-none">{t.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-theme-text font-sans tracking-tight">
                      {isAr ? t.label_ar : t.label_fr}
                    </h4>
                    {t.isPremium && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 font-mono">PRO</span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-theme-muted">
                    {t.id.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed mt-1">
                {isAr ? t.tagline_ar : t.tagline_fr}
              </p>

              {/* Color Accent Preview Bar */}
              <div className="mt-3.5 pt-2.5 border-t border-theme flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-6 rounded-full"
                    style={{ backgroundColor: t.accentColor }}
                  />
                  <span className="text-[10px] text-theme-muted capitalize">
                    {t.colorScheme === "dark" ? (isAr ? "داكن" : "Sombre") : (isAr ? "فاتح" : "Clair")}
                  </span>
                </div>
                {isLocked && (
                  <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                    <Lock className="h-2.5 w-2.5" />
                    <span>{isAr ? "ترقية" : "Pro"}</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. SEGMENTED PILL VARIANT (Inline toggle)
  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 rounded-2xl bg-card-muted border border-theme select-none",
          className
        )}
      >
        {themes.map((t) => {
          const isSelected = theme === t.id;
          const isLocked = t.isPremium && !isPremiumUnlocked;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTheme(t)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
              )}
            >
              <span>{t.icon}</span>
              <span>{isAr ? t.label_ar : t.label_fr}</span>
              {isLocked && <Lock className="h-2.5 w-2.5 text-amber-400" />}
            </button>
          );
        })}
      </div>
    );
  }

  // 3. COMPACT DROPDOWN VARIANT (Default for TopBar)
  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isAr ? "تغيير المظهر" : "Changer de thème"}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border border-theme bg-card hover:bg-card-hover transition-all text-xs font-medium text-theme-text cursor-pointer select-none shadow-sm",
          isOpen && "ring-2 ring-[var(--color-ring)]/30 border-[var(--color-primary)]"
        )}
      >
        <span className="text-sm leading-none">{currentInfo.icon}</span>
        <span className="hidden sm:inline font-sans text-[11px] font-semibold">
          {isAr ? currentInfo.label_ar : currentInfo.label_fr}
        </span>
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-52 rounded-2xl border border-theme bg-card p-1.5 shadow-theme-card backdrop-blur-xl animate-in fade-in-50 zoom-in-95",
            isAr ? "start-0" : "end-0"
          )}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-theme-muted uppercase tracking-wider font-mono border-b border-theme mb-1 flex items-center justify-between">
            <span>{isAr ? "شخصية المظهر" : "Ambiance visuelle"}</span>
            <Sparkles className="h-3 w-3 text-[var(--color-primary)]" />
          </div>

          <div className="space-y-0.5">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              const isLocked = t.isPremium && !isPremiumUnlocked;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    handleSelectTheme(t);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-start",
                    isSelected
                      ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-bold"
                      : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm leading-none">{t.icon}</span>
                    <span>{isAr ? t.label_ar : t.label_fr}</span>
                    {t.isPremium && (
                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-500">PRO</span>
                    )}
                  </span>
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : isLocked ? (
                    <Lock className="h-3 w-3 text-amber-500/70" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
