"use client";

import React from "react";
import Link from "next/link";
import {
  Target,
  Clock,
  Zap,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface AcademicSnapshotProps {
  demonstratedSkills: number;
  totalSkills: number;
  currentScore: number | null;
  targetScore: number | null;
  gap: number | null;
  totalStudyTimeSeconds: number;
  completedMissionsCount: number;
  activeRepairsCount: number;
  isAr: boolean;
}

export function AcademicSnapshot({
  demonstratedSkills,
  totalSkills,
  currentScore,
  targetScore,
  gap,
  totalStudyTimeSeconds,
  completedMissionsCount,
  activeRepairsCount,
  isAr,
}: AcademicSnapshotProps) {
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const hours = Math.floor(totalStudyTimeSeconds / 3600);
  const minutes = Math.floor((totalStudyTimeSeconds % 3600) / 60);

  return (
    <section
      aria-label={isAr ? "الوضع الأكاديمي والهدف" : "Bilan académique"}
      className="p-5 sm:p-6 rounded-2xl bg-card border border-theme shadow-xs space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-theme-text font-sans">
            {isAr ? "وين راني أكاديمياً؟" : "Situation académique"}
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr ? "نقطة البداية، الهدف، والفارق نحو البكالوريا" : "Niveau actuel vs Objectif BAC"}
          </p>
        </div>
      </div>

      {/* 1. PRIMARY HIERARCHY: SCORE / TARGET / GAP */}
      <div className="p-4 rounded-xl bg-surface border border-theme space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-x-reverse divide-theme">
          
          {/* Column 1: Current Baseline */}
          <div className="px-2 space-y-1">
            <span className="text-[11px] font-medium text-theme-muted block truncate">
              {isAr ? "المعدل الحالي" : "Actuel"}
            </span>
            {currentScore !== null ? (
              <div className="font-mono text-lg sm:text-xl font-black text-theme-text">
                {currentScore.toFixed(1)} <span className="text-xs text-theme-muted font-normal">/20</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block">
                  {isAr ? "لم نحدد مستواك بعد" : "Non évalué"}
                </span>
                <Link
                  href="/diagnostic"
                  className="text-[10px] font-bold text-[var(--color-primary)] hover:underline inline-block"
                >
                  {isAr ? "ابدأ التقييم ←" : "Test →"}
                </Link>
              </div>
            )}
          </div>

          {/* Column 2: Target Score */}
          <div className="px-2 space-y-1">
            <span className="text-[11px] font-medium text-theme-muted block truncate">
              {isAr ? "الهدف" : "Objectif"}
            </span>
            {targetScore !== null ? (
              <div className="font-mono text-lg sm:text-xl font-black text-amber-700 dark:text-amber-400">
                {targetScore.toFixed(1)} <span className="text-xs text-theme-muted font-normal">/20</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] text-theme-muted block">
                  {isAr ? "لم تحدد هدفك بعد" : "Non défini"}
                </span>
                <Link
                  href="/profile"
                  className="text-[10px] font-bold text-[var(--color-primary)] hover:underline inline-block"
                >
                  {isAr ? "حدد الهدف ←" : "Fixer →"}
                </Link>
              </div>
            )}
          </div>

          {/* Column 3: The Gap */}
          <div className="px-2 space-y-1">
            <span className="text-[11px] font-medium text-theme-muted block truncate">
              {isAr ? "الفارق" : "Écart"}
            </span>
            {gap !== null ? (
              <div className="font-mono text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {gap > 0 ? `+${gap.toFixed(1)}` : "0"} <span className="text-xs text-theme-muted font-normal">{isAr ? "نقاط" : "pts"}</span>
              </div>
            ) : (
              <span className="text-sm font-mono font-medium text-theme-muted block">--</span>
            )}
          </div>

        </div>
      </div>

      {/* 2. SECONDARY COMPACT METRICS (2-ROW INFORMATION LAYOUT) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        
        {/* Metric 1: Mastered Skills */}
        <div className="p-3 rounded-xl bg-surface border border-theme flex flex-col justify-between space-y-1">
          <span className="text-[11px] text-theme-muted">
            {isAr ? "المهارات المتقنة" : "Compétences"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold font-mono text-theme-text">
              {demonstratedSkills}
            </span>
            <span className="text-xs text-theme-muted font-mono">
              / {totalSkills}
            </span>
          </div>
        </div>

        {/* Metric 2: Actual Study Time */}
        <div className="p-3 rounded-xl bg-surface border border-theme flex flex-col justify-between space-y-1">
          <span className="text-[11px] text-theme-muted">
            {isAr ? "وقت الدراسة المسجل" : "Temps enregistré"}
          </span>
          <div className="text-sm sm:text-base font-bold font-sans text-theme-text truncate">
            {totalStudyTimeSeconds > 0
              ? hours > 0
                ? `${hours} سا ${minutes} د`
                : `${Math.max(1, minutes)} دقيقة`
              : isAr
              ? "0 دقيقة مسجلة"
              : "0 min"}
          </div>
        </div>

        {/* Metric 3: Completed Missions */}
        <div className="p-3 rounded-xl bg-surface border border-theme flex flex-col justify-between space-y-1">
          <span className="text-[11px] text-theme-muted">
            {isAr ? "المهام المكتملة" : "Missions faites"}
          </span>
          <div className="text-base sm:text-lg font-bold font-mono text-theme-text">
            {completedMissionsCount}
          </div>
        </div>

        {/* Metric 4: Active Errors */}
        <div className="p-3 rounded-xl bg-surface border border-theme flex flex-col justify-between space-y-1">
          <span className="text-[11px] text-theme-muted">
            {isAr ? "الأخطاء النشطة" : "Erreurs actives"}
          </span>
          <div className={`text-base sm:text-lg font-bold font-mono ${
            activeRepairsCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          }`}>
            {activeRepairsCount > 0 ? activeRepairsCount : "0"}
          </div>
        </div>

      </div>
    </section>
  );
}
