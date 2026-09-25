"use client";

import React from "react";
import { MustWinItem } from "@/lib/study-os/must-win-service";
import { useFocus } from "@/context/FocusContext";
import {
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Wrench,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Check,
} from "lucide-react";

interface MustWinCardProps {
  item: MustWinItem;
  onToggleComplete?: (item: MustWinItem) => void;
}

export function MustWinCard({ item, onToggleComplete }: MustWinCardProps) {
  const { startSession, openFocusMode, isSessionActive, activeSession } = useFocus();

  const isCurrentActive =
    isSessionActive &&
    (activeSession?.taskTitle === item.title ||
      (item.plannerEventId && activeSession?.eventId === item.plannerEventId));

  const handleStartFocus = () => {
    startSession({
      mode: item.estimatedMinutes ? "custom" : "25m",
      targetDurationMinutes: item.estimatedMinutes || 25,
      subjectId: item.subjectId,
      skillId: item.skillId,
      missionId: item.missionId,
      eventId: item.plannerEventId,
      taskTitle: item.title,
    });
    openFocusMode();
  };

  const getSourceBadge = () => {
    switch (item.sourceType) {
      case "shater_repair":
        return {
          label: "إصلاح خطأ 🔧",
          className: "bg-rose-500/10 text-rose-500 border-rose-500/30",
        };
      case "shater_retest":
        return {
          label: "إعادة اختبار 🧪",
          className: "bg-amber-500/10 text-amber-500 border-amber-500/30",
        };
      case "shater_mission":
        return {
          label: "توصية الشاطر 🎯",
          className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        };
      case "personal_task":
        return {
          label: "مهمة شخصية 📝",
          className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
        };
    }
  };

  const badge = getSourceBadge();

  return (
    <div
      className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between gap-4 text-right ${
        item.isCompleted
          ? "bg-surface/50 border-theme/60 opacity-85"
          : isCurrentActive
          ? "bg-card border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-md"
          : "bg-card border-theme hover:border-[var(--color-primary)]/40 shadow-xs hover:shadow-md"
      }`}
    >
      {/* Top Row: Priority Number + Subject Badge + Type Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Priority Rank #1, #2, #3 */}
          <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-xs font-black flex items-center justify-center">
            {item.priorityOrder}
          </span>

          {/* Subject Badge with Color Dot */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-theme text-xs font-bold text-theme-text">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: item.subjectHex }}
            />
            <span>{item.subjectNameAr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Estimated Duration */}
          <span className="flex items-center gap-1 text-[11px] font-mono text-theme-muted bg-surface/70 px-2 py-0.5 rounded-md border border-theme">
            <Clock className="w-3 h-3 text-theme-muted" />
            <span>{item.estimatedMinutes} د</span>
          </span>

          {/* Source Badge (Shater vs Personal) */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {/* Center: Objective Title */}
      <div>
        <h4
          className={`text-sm sm:text-base font-bold leading-snug ${
            item.isCompleted ? "line-through text-theme-muted" : "text-theme-text"
          }`}
        >
          {item.title}
        </h4>

        {/* Evidence-Backed WHY Explanation */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-surface/80 border border-theme/70 flex items-start gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="text-[11px] text-theme-secondary leading-relaxed font-medium">
            <span className="font-bold text-theme-text">علاش؟ </span>
            {item.whyTextAr}
          </p>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-theme/60">
        {/* Toggle Complete Checkbox */}
        {onToggleComplete ? (
          <button
            type="button"
            onClick={() => onToggleComplete(item)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              item.isCompleted
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : "text-theme-muted hover:text-theme-text border-theme bg-surface hover:bg-card"
            }`}
            title={item.isCompleted ? "تعليم كغير منجز" : "تعليم كمنجز"}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{item.isCompleted ? "منجزة" : "تعليم كمنجز"}</span>
          </button>
        ) : (
          <div />
        )}

        {/* Primary CTA: ابدأ التركيز */}
        {item.isCompleted ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم الإنجاز بنجاح</span>
          </span>
        ) : isCurrentActive ? (
          <button
            type="button"
            onClick={openFocusMode}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all cursor-pointer animate-pulse"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>الجلسة جارية (عرض)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartFocus}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:scale-[0.98] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>ابدأ التركيز</span>
          </button>
        )}
      </div>
    </div>
  );
}
