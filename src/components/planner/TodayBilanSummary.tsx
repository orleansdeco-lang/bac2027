"use client";

import React from "react";
import { DailyReflection } from "@/lib/planner/types";
import { Clock, CheckCircle2, Flame, PenTool, Sparkles } from "lucide-react";

interface TodayBilanSummaryProps {
  studyMinutesToday: number;
  tasksCompletedToday: number;
  tasksTotalToday: number;
  estimatedAverage?: number;
  streakDays: number;
  reflectionToday?: DailyReflection | null;
  onOpenReflectionModal: () => void;
  className?: string;
}

export const TodayBilanSummary: React.FC<TodayBilanSummaryProps> = ({
  studyMinutesToday,
  tasksCompletedToday,
  tasksTotalToday,
  streakDays,
  reflectionToday,
  onOpenReflectionModal,
  className = "",
}) => {
  const hrs = Math.floor(studyMinutesToday / 60);
  const mins = studyMinutesToday % 60;
  const timeFormatted = hrs > 0 ? `${hrs} سا ${mins} د` : `${mins} د`;

  const moodEmojis: Record<string, string> = {
    great: "😊 ممتاز",
    good: "🙂 جيد",
    neutral: "😐 عادي",
    hard: "😔 صعب",
    tired: "😴 متعب",
  };

  return (
    <div
      className={`rounded-3xl border border-theme bg-card p-5 sm:p-6 shadow-clay text-start transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-base sm:text-lg font-black text-theme-text font-sans">
              حصيلة اليوم
            </h3>
          </div>
          <p className="text-xs text-theme-secondary mt-0.5 font-medium">
            متابعة إنجازك الفعلي خلال اليوم
          </p>
        </div>
      </div>

      {/* 3 Real Data Metric Chips */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {/* Study Time */}
        <div className="p-3 rounded-2xl border border-theme bg-surface text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-theme-secondary font-medium mb-1">
            <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>وقت المذاكرة</span>
          </div>
          <div className="text-sm sm:text-base font-black text-theme-text font-mono">
            {timeFormatted}
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="p-3 rounded-2xl border border-theme bg-surface text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-theme-secondary font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>المهام المنجزة</span>
          </div>
          <div className="text-sm sm:text-base font-black text-theme-text font-mono">
            {tasksCompletedToday} / {tasksTotalToday}
          </div>
        </div>

        {/* Streak Days */}
        <div className="p-3 rounded-2xl border border-theme bg-surface text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-theme-secondary font-medium mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>أيام متتالية</span>
          </div>
          <div className="text-sm sm:text-base font-black text-amber-600 font-mono">
            {streakDays} {streakDays === 1 ? "يوم" : "أيام"}
          </div>
        </div>
      </div>

      {/* Daily Reflection Section */}
      <div className="rounded-2xl border border-theme bg-surface p-4 text-start transition-all">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-xs font-bold text-theme-text font-sans">
              {reflectionToday ? "انطباع وملاحظات اليوم" : "تدوين انطباع اليوم"}
            </span>
          </div>
          {reflectionToday?.mood && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-card border border-theme text-theme-secondary">
              {moodEmojis[reflectionToday.mood] || "✨"}
            </span>
          )}
        </div>

        {reflectionToday ? (
          <div className="space-y-2 text-xs">
            <p className="line-clamp-2 text-theme-secondary italic font-medium">
              "{reflectionToday.learned_today || "تم تسجيل انطباعك بنجاح!"}"
            </p>
            <button
              type="button"
              onClick={onOpenReflectionModal}
              className="text-[11px] font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              تعديل الملاحظات ✏️
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs text-theme-secondary font-medium">
              ما الذي استوعبته اليوم وما هي النقاط التي تحتاج تثبيتاً غداً؟
            </p>
            <button
              type="button"
              onClick={onOpenReflectionModal}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-xs transition-all cursor-pointer"
            >
              ✍️ كتابة انطباع اليوم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
