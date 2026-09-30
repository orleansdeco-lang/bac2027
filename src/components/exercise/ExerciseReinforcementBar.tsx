"use client";

import React from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
import { SkillMasteryState } from "@/lib/practice/practice-engine";

interface ExerciseReinforcementBarProps {
  skillTitle: string;
  hasRetestVariant: boolean;
  masteryState?: SkillMasteryState | null;
  onSolveRetestVariant: () => void;
  onNextQuestion: () => void;
  onReviewLesson?: () => void;
  className?: string;
  isLastQuestion?: boolean;
}

export function ExerciseReinforcementBar({
  skillTitle,
  hasRetestVariant,
  masteryState,
  onSolveRetestVariant,
  onNextQuestion,
  onReviewLesson,
  className = "",
  isLastQuestion = false,
}: ExerciseReinforcementBarProps) {
  const statusLabels: Record<string, { label: string; color: string }> = {
    not_acquired: { label: "في البداية", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
    in_progress: { label: "بدأت فيها", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    near_mastery: { label: "قريبة من الإتقان ⚡", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    mastered: { label: "متقنة ومثبتة 🌟", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  };

  const currentStatus = masteryState?.status ? statusLabels[masteryState.status] : statusLabels.in_progress;

  return (
    <div
      className={`rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-[#0B1A24] via-[#0F1E2E] to-[#0A1828] p-5 sm:p-6 shadow-2xl space-y-4 ${className}`}
      dir="rtl"
    >
      {/* Skill Mastery Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shadow-inner">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">المهارة المستهدفة: {skillTitle}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              حل تمرين مشابه بدون الاستعانة بالتلميحات هو الدليل القاطع على ثبات المهارة قبل البكالوريا.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="flex flex-wrap items-center gap-3">
        {hasRetestVariant && (
          <button
            type="button"
            onClick={onSolveRetestVariant}
            className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-emerald-950" />
            <span>ثبت المهارة: حل تمرين مشابه جديد 🎯</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNextQuestion}
          className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{isLastQuestion ? "إنهاء الجلسة وعرض التقرير 🏆" : "السؤال الموالي ➡️"}</span>
        </button>

        {onReviewLesson && (
          <button
            type="button"
            onClick={onReviewLesson}
            className="py-3 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>مراجعة ملخص الدرس 📖</span>
          </button>
        )}
      </div>
    </div>
  );
}
