"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Target, Edit3, Check, Calendar, Plus } from "lucide-react";

interface PlannerHeroProps {
  studentName?: string;
  streamNameAr?: string;
  bacTargetScore?: number;
  onUpdateTargetScore?: (newScore: number) => void;
  onOpenAddTask?: () => void;
  onOpenAiPlanner?: () => void;
  className?: string;
}

export const PlannerHero: React.FC<PlannerHeroProps> = ({
  studentName,
  streamNameAr,
  bacTargetScore = 15.0,
  onUpdateTargetScore,
  onOpenAddTask,
  onOpenAiPlanner,
  className = "",
}) => {
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [scoreInput, setScoreInput] = useState(String(bacTargetScore));

  const displayName = studentName || "بطل البكالوريا";
  const greeting = `مرحباً ${displayName} ✨`;
  const subMessage = "نظم وقتك، أنجز مهامك اليومية خطوة بخطوة، وثبّت مكتسباتك للبكالوريا بكل هدوء وثقة.";

  const handleSaveScore = () => {
    const parsed = parseFloat(scoreInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
      onUpdateTargetScore?.(parsed);
    }
    setIsEditingScore(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-theme bg-gradient-to-br from-[#EFE9DC] via-[#FFFCF7] to-[#F7F3EA] p-6 sm:p-8 transition-all duration-300 shadow-clay ${className}`}
    >
      {/* Background Subtle Warm Depth Blobs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[var(--color-accent)]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left / Main Text Block */}
        <div className="space-y-3 max-w-2xl text-start">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>مخطط شاطر الدراسي • SHATER Planner</span>
            </span>

            {streamNameAr && (
              <span className="text-xs text-theme-muted font-bold px-2.5 py-0.5 rounded-full bg-surface border border-theme">
                {streamNameAr}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-theme-text font-sans">
              {greeting}
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary font-medium leading-relaxed">
              {subMessage}
            </p>
          </div>

          {/* Quick Spiritual Inspiration Note */}
          <div className="pt-1">
            <span className="text-xs font-serif font-bold px-3 py-1 rounded-xl inline-block bg-[var(--color-accent-soft)] text-[#8F5E1F] border border-[var(--color-accent)]/30">
              « وما توفيقي إلا بالله عليه توكلت وإليه أنيب »
            </span>
          </div>
        </div>

        {/* Right Section: Target Score & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
          {/* Target Score Card */}
          <div className="p-4 rounded-2xl border border-theme bg-card min-w-[200px] shadow-sm text-start">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold mb-1">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>الهدف في الباك</span>
              </span>
              {!isEditingScore ? (
                <button
                  type="button"
                  onClick={() => {
                    setScoreInput(String(bacTargetScore));
                    setIsEditingScore(true);
                  }}
                  className="hover:text-theme-text transition-colors p-0.5"
                  title="تعديل الهدف"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveScore}
                  className="text-emerald-600 hover:text-emerald-700 p-0.5"
                  title="حفظ"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isEditingScore ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveScore()}
                  className="w-20 px-2 py-1 rounded-lg text-lg font-black font-mono bg-surface border border-[var(--color-primary)] text-theme-text focus:outline-none"
                  autoFocus
                />
                <span className="text-xs text-theme-muted font-mono font-bold">/20</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-[var(--color-accent)]">
                  {bacTargetScore.toFixed(1)}
                </span>
                <span className="text-xs text-theme-muted">/20</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAddTask && (
              <button
                type="button"
                onClick={onOpenAddTask}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مهمة</span>
              </button>
            )}

            {onOpenAiPlanner && (
              <button
                type="button"
                onClick={onOpenAiPlanner}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-surface border border-theme text-xs font-bold text-theme-text shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>اقتراح جدول ذكي</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
