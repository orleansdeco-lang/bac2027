"use client";

import React from "react";
import Link from "next/link";
import { Map, ArrowRight, ArrowLeft } from "lucide-react";

interface RoadPositionCardProps {
  masteredCount: number;
  totalSkills: number;
  currentSkillTitle?: string;
  isAr: boolean;
}

export function RoadPositionCard({
  masteredCount,
  totalSkills,
  currentSkillTitle,
  isAr,
}: RoadPositionCardProps) {
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const progressPercent = totalSkills > 0 ? Math.min(100, Math.round((masteredCount / totalSkills) * 100)) : 0;

  return (
    <section
      aria-label={isAr ? "مسارك نحو البكالوريا" : "Progression globale"}
      className="p-5 sm:p-6 rounded-2xl bg-card border border-theme shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-theme-text font-sans">
            {isAr ? "مسارك نحو البكالوريا" : "Sur la route du BAC"}
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr ? "الموقع التراكمي على خريطة المنهاج" : "Position actuelle sur le programme"}
          </p>
        </div>

        <Link
          href="/roadmap"
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          <span>{isAr ? "الخريطة الكاملة" : "Feuille de route"}</span>
          <NextArrow className="w-3 h-3" />
        </Link>
      </div>

      {/* Progress Track: المهارات المتقنة ───────●────── الهدف */}
      <div className="p-3.5 rounded-xl bg-surface border border-theme space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-sans">
          <span className="font-semibold text-theme-text">
            {isAr ? "المهارات المثبتة" : "Compétences"} ({masteredCount}/{totalSkills})
          </span>
          <span className="font-mono text-theme-muted font-bold">
            {progressPercent}%
          </span>
        </div>

        {/* Minimal Linear-style Track */}
        <div className="relative w-full h-2 bg-theme-border/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Current Station / Focus Topic */}
        {currentSkillTitle && (
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-[11px] text-theme-muted">
              {isAr ? "المحطة الحالية:" : "Étape actuelle :"}
            </span>
            <span className="font-semibold text-theme-text truncate max-w-[200px]">
              {currentSkillTitle}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
