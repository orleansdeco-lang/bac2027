"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Crown, X, ArrowLeft, Clock } from "lucide-react";
import { useEntitlements } from "@/lib/access/useEntitlements";
import { Button } from "@/components/ui/Button";

export function TrialBanner() {
  const { isTrial, isFree, isPremium, trialDaysRemaining, isLoading } = useEntitlements();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || isPremium || dismissed) return null;

  if (isTrial) {
    return (
      <aside
        aria-label="إشعار فترة التجربة المجانية"
        className="bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-theme-text text-xs relative"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </span>
            <span>
              <strong>فترة التجربة الكاملة نشطة:</strong> باقي{" "}
              <span className="font-bold font-mono text-amber-400">
                {trialDaysRemaining} {trialDaysRemaining === 1 ? "يوم" : "أيام"}
              </span>{" "}
              — جميع ميزات بريميوم (المكتبة الكاملة، Planner PRO، الأستاذ الذكي) مفتوحة لك لتجربتها!
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/subscribe">
              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <span>تثبيت الاشتراك لموسم البكالوريا</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  if (isFree) {
    return (
      <aside
        aria-label="إشعار النسخة المجانية المستمرة"
        className="bg-surface-elevated/90 border-b border-theme/80 px-4 py-2 text-theme-secondary text-xs relative"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
            <span>
              أنت في <strong>النسخة المجانية المستمرة</strong> للشاطر. يمكنك ترقية حسابك لفتح الأرشيف الكامل والأستاذ الذكي.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/subscribe">
              <span className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>الترقية إلى بريميوم (1,500 دج شهرياً)</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-md text-theme-muted hover:text-theme-text transition-all"
              title="إخفاء مؤقت"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
