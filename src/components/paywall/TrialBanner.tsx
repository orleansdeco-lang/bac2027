"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Crown, X, ArrowLeft, Clock } from "lucide-react";
import { useEntitlements } from "@/lib/access/useEntitlements";
import { Button } from "@/components/ui/Button";

export function TrialBanner() {
  const { isTrial, isFree, isPremium, trialDaysRemaining, trialHoursRemaining, isLoading } = useEntitlements();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || isPremium || dismissed) return null;

  if (isTrial) {
    const hours = trialHoursRemaining || (trialDaysRemaining * 24);
    let timeText = "";
    if (hours > 48) {
      timeText = "3 أيام متبقية";
    } else if (hours > 24) {
      timeText = "يومان متبقيان";
    } else if (hours > 1) {
      timeText = `${hours} ساعة متبقية`;
    } else {
      timeText = "أقل من ساعة متبقية";
    }

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
              <strong>تجربتك المجانية:</strong> متبقي{" "}
              <span className="font-bold font-mono text-amber-400">
                {timeText}
              </span>{" "}
              — جميع ميزات المنصة (الأستاذ الذكي، Planner PRO، الأرشيف والحلول الكاملة) مفتوحة لك.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/subscribe">
              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <span>تثبيت الاشتراك الآن</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
