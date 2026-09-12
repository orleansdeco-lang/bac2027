"use client";

import React from "react";
import Link from "next/link";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Target, Flag, Play, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface RoadVisualizerProps {
  targetScore: number;
  currentBaselineText: string;
  gapText?: string;
  activeMission?: {
    id: string;
    subjectId: string;
    skillTitle: string;
    estimatedMinutes?: number;
    reasonBadge?: string;
    reasonText?: string;
    repairStatus?: "none" | "repair_started" | "repair_completed" | "retest_passed";
  } | null;
  masteredCount: number;
  totalSkills: number;
  locale: "ar" | "fr";
  onStartMission?: () => void;
}

export function RoadVisualizer({
  targetScore,
  currentBaselineText,
  gapText,
  activeMission,
  masteredCount,
  totalSkills,
  locale,
  onStartMission,
}: RoadVisualizerProps) {
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="relative py-4 px-2 sm:px-4 max-w-xl mx-auto">
      {/* Visual Central Pathway Spine with RTL and LTR support */}
      <div className="absolute top-12 bottom-12 ltr:left-6 ltr:sm:left-8 rtl:right-6 rtl:sm:right-8 w-0.5 bg-theme-border -translate-x-1/2 rtl:translate-x-1/2 pointer-events-none transition-colors duration-200" />

      {/* =================================================================== */}
      {/* NODE 1: THE TARGET GOAL (TOP DESTINATION)                           */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6 mb-8 group">
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-card border border-amber-500/40 text-amber-400 shadow-sm transition-colors duration-200">
          <Target className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {isAr ? "الهدف المحدد" : "Objectif choisi"}
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
              {targetScore > 0 ? targetScore.toFixed(2) : "16.00"}/20
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-0.5 leading-relaxed">
            {isAr ? "الوجهة النهائية التي تُبنى كل خطوة للوصول إليها." : "La destination finale qui guide chaque mission."}
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* NODE 2: CURRENT STATE & GAP                                         */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6 mb-8">
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-card border border-theme text-theme-secondary shadow-sm transition-colors duration-200">
          <Flag className="h-5 w-5" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-theme-text">
              {isAr ? "مؤشر الانطلاق" : "Indicateur de départ"}
            </span>
            <Badge variant="outline" size="sm" className="text-[10px] text-theme-secondary border-theme">
              {currentBaselineText}
            </Badge>
          </div>
          {gapText && (
            <p className="text-xs text-theme-secondary font-medium mt-0.5">
              {isAr ? `المسافة إلى هدفك: حوالي ${gapText}` : `Distance vers l'objectif : environ ${gapText}`}
            </p>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* NODE 3: THE ACTIVE MISSION (FOCAL POINT OF THE PRODUCT)             */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6 mb-8">
        {/* Focal node icon */}
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] border border-white/20 text-[var(--color-primary-text)] shadow-md shadow-[var(--color-primary)]/20 animate-subtle-pulse">
          <Play className="h-5 w-5 fill-current" />
        </div>

        <div className="flex-1">
          <Card className="p-4 sm:p-5 border-[var(--color-primary)]/35 bg-card shadow-theme-card relative overflow-hidden ring-1 ring-[var(--color-primary)]/15">
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                {isAr ? "مهمتك الآن" : "Mission Actuelle"}
              </span>
              {activeMission?.estimatedMinutes && (
                <span className="text-[11px] font-mono text-theme-muted">
                  ~{activeMission.estimatedMinutes} {isAr ? "دقيقة" : "min"}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-theme-text leading-snug mb-2 font-sans">
              {activeMission?.skillTitle || (isAr ? "أتقن قاعدة السلسلة في الاشتقاق" : "Dérivation des fonctions composées")}
            </h3>

            {/* Rationale if present */}
            {activeMission?.reasonText && (
              <div className="p-2.5 rounded-xl bg-card-muted border border-theme text-xs text-theme-secondary mb-3 leading-relaxed">
                <span className="font-semibold text-[var(--color-primary)] block mb-0.5">
                  {isAr ? "علاش هذي المهمة؟" : "Pourquoi cette mission ?"}
                </span>
                {activeMission.reasonText}
              </div>
            )}

            {/* Action CTA */}
            {activeMission?.id ? (
              <Link href={`/mission/${activeMission.id}`} className="block">
                <Button variant="primary" fullWidth size="lg" className="font-bold min-h-[48px] shadow-sm">
                  <span>{isAr ? "ابدأ المهمة الآن" : "Démarrer la mission"}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="primary" fullWidth size="lg" onClick={onStartMission} className="font-bold min-h-[48px]">
                <span>{isAr ? "ابدأ المهمة الآن" : "Démarrer la mission"}</span>
                <ArrowIcon className="h-4 w-4" />
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* =================================================================== */}
      {/* NODE 4: DEMONSTRATED EVIDENCE (FOUNDATION AT BASE)                   */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6">
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-card border border-emerald-500/40 text-emerald-400 shadow-sm transition-colors duration-200">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">
              {isAr ? "مهارات مثبتة" : "Compétences validées"}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {isAr ? `${masteredCount} مهارات مثبتة` : `${masteredCount} validées`}
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr
              ? `من أصل ${totalSkills} مهارة في خريطة التعلم.`
              : `Sur ${totalSkills} compétences dans la carte d'apprentissage.`}
          </p>
        </div>
      </div>
    </div>
  );
}
