"use client";

import React from "react";
import Link from "next/link";
import {
  Play,
  Maximize2,
  Clock,
  Target,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NowActionCardProps {
  isSessionActive: boolean;
  activeSession: any;
  formattedElapsed: string;
  formattedRemaining: string;
  isRunning: boolean;
  openFocusMode: () => void;
  hasCompletedDiagnostic: boolean;
  todaysMission: any;
  isAr: boolean;
  onStartFocus?: (mission: any) => void;
  subjectName?: string;
  subjectCoeff?: number;
}

export function NowActionCard({
  isSessionActive,
  activeSession,
  formattedElapsed,
  formattedRemaining,
  isRunning,
  openFocusMode,
  hasCompletedDiagnostic,
  todaysMission,
  isAr,
  onStartFocus,
  subjectName,
  subjectCoeff,
}: NowActionCardProps) {
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  // =========================================================================
  // 1. ACTIVE FOCUS SESSION STATE (HIGHEST OPERATIONAL PRIORITY)
  // =========================================================================
  if (isSessionActive && activeSession) {
    return (
      <section
        aria-label={isAr ? "جلسة التركيز الجارية" : "Session active"}
        className="relative rounded-2xl border-2 border-emerald-500/50 bg-card p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">
              {isAr ? "الآن · جلسة نشطة" : "EN COURS · SESSION ACTIVE"}
            </span>
            <span className="text-xs text-theme-muted">
              • {activeSession.subjectNameAr || activeSession.subjectId}
            </span>
          </div>

          {/* Large Monospace Timer */}
          <div dir="ltr" className="font-mono text-2xl sm:text-3xl font-black text-theme-text">
            {activeSession.targetDurationMinutes > 0 ? formattedRemaining : formattedElapsed}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-theme-text font-sans">
            {activeSession.taskTitle || (isAr ? "جلسة مذاكرة واستيعاب مركزة" : "Session de révision")}
          </h2>
          <p className="text-xs text-theme-secondary">
            {isAr
              ? "جلسة التركيز قيد التنفيذ. تجنب المشتتات وواصل حتى انتهاء الوقت المحدد."
              : "Session en cours. Restez concentré(e) jusqu'à la fin du chronomètre."}
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={openFocusMode}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isAr ? "أكمل جلسة التركيز" : "Continuer la session"}</span>
          </button>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 2. DIAGNOSTIC MISSING (CANNOT FORMULATE ROADMAP WITHOUT TELEMETRY)
  // =========================================================================
  if (!hasCompletedDiagnostic) {
    return (
      <section
        aria-label={isAr ? "التقييم الأولي المطلوب" : "Diagnostic requis"}
        className="rounded-2xl border border-amber-500/35 bg-card p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono">
              {isAr ? "الآن · خطوة حاسمة" : "MAINTENANT · ÉTAPE INITIALE"}
            </span>
            <span className="text-xs font-medium text-theme-muted">
              {isAr ? "15 دقيقة فقط" : "15 min"}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-theme-text font-sans">
            {isAr ? "ابدأ التقييم الأولي" : "Passer le diagnostic initial"}
          </h2>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
            {isAr
              ? "مازال ما حددناش مستواك. التقييم يعطينا نقطة البداية ونبنو لك المسار المناسب حسب معاملات شعبتك."
              : "Votre niveau n'a pas encore été évalué. Le test initial établit votre point de départ."}
          </p>
        </div>

        <div className="pt-1">
          <Link href="/diagnostic">
            <Button
              variant="primary"
              size="md"
              className="rounded-xl px-5 font-bold bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-xs flex items-center gap-2"
            >
              <span>{isAr ? "ابدأ التقييم الأولي" : "Commencer le test"}</span>
              <NextArrow className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 3. TOP RECOMMENDED MISSION (ONE OBVIOUS NEXT ACTION)
  // =========================================================================
  if (todaysMission?.mission) {
    // Evidence-based rationale
    const reasonText = isAr ? todaysMission.whyText_ar : todaysMission.whyText_fr;
    const reasonLabel = isAr
      ? todaysMission.rationale?.reasonLabel_ar
      : todaysMission.rationale?.reasonLabel_fr;

    return (
      <section
        aria-label={isAr ? "مهمتك الآن" : "Votre mission actuelle"}
        className="rounded-2xl border border-theme bg-card p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in"
      >
        {/* Top Tag & Duration */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono">
              {isAr ? "الآن" : "MAINTENANT"}
            </span>

            {/* Subject + Coeff */}
            <span className="text-xs font-bold text-theme-text">
              {subjectName || todaysMission.subjectId}
              {subjectCoeff ? ` (${isAr ? `معامل ${subjectCoeff}` : `coeff ${subjectCoeff}`})` : ""}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-theme-muted font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{todaysMission.estimatedMinutes} {isAr ? "دقيقة" : "min"}</span>
          </div>
        </div>

        {/* Mission Title */}
        <div className="space-y-2">
          <div>
            <span className="text-[11px] font-medium text-theme-muted block">
              {isAr ? "مهمتك المقررة الآن:" : "Mission recommandée :"}
            </span>
            <h2 className="text-base sm:text-lg font-black text-theme-text font-sans mt-0.5">
              {isAr ? todaysMission.skillTitle_ar : todaysMission.skillTitle_fr}
            </h2>
          </div>

          {/* SECTION 3: لماذا الآن؟ (Why this mission?) */}
          {reasonText && (
            <div className="p-3 rounded-xl bg-surface border border-theme space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isAr ? "علاش هذي هي المهمة الآن؟" : "Pourquoi cette mission ?"}</span>
                {reasonLabel && (
                  <span className="text-[10px] font-normal text-theme-muted">
                    ({reasonLabel})
                  </span>
                )}
              </div>
              <p className="text-xs text-theme-secondary leading-relaxed">
                {reasonText}
              </p>
            </div>
          )}
        </div>

        {/* Primary CTA + Optional Focus Trigger */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Link href={`/mission/${todaysMission.mission.id}`}>
            <Button
              variant="primary"
              size="md"
              className="rounded-xl px-6 font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs shadow-xs flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? "ابدأ المهمة" : "Démarrer la mission"}</span>
              <NextArrow className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </Link>

          {onStartFocus && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onStartFocus(todaysMission)}
              className="rounded-xl px-4 text-xs font-semibold border-theme text-theme-secondary hover:text-theme-text flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAr ? "مؤقت التركيز" : "Focus"}</span>
            </Button>
          )}
        </div>
      </section>
    );
  }

  // =========================================================================
  // 4. ALL IMPORTANT MISSIONS COMPLETED
  // =========================================================================
  return (
    <section
      aria-label={isAr ? "اليوم مكتمل" : "Journée terminée"}
      className="rounded-2xl border border-emerald-500/30 bg-card p-5 sm:p-6 shadow-xs space-y-3 animate-fade-in"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-theme-text font-sans">
            {isAr ? "اليوم مكتمل 🎯" : "Programme du jour complété"}
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr
              ? "عمل ممتاز اليوم. راجع خطأ سابق في معمل الأخطاء أو حضّر مهمة الغد."
              : "Excellent travail. Révisez vos erreurs au Lab ou préparez demain."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Link href="/error-lab">
          <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold border-theme text-theme-text">
            <Wrench className="w-3 h-3 mr-1" />
            <span>{isAr ? "مختبر الأخطاء" : "Lab d'erreurs"}</span>
          </Button>
        </Link>
        <Link href="/roadmap">
          <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold border-theme text-theme-text">
            <span>{isAr ? "خريطة الشعبة" : "Feuille de route"}</span>
          </Button>
        </Link>
      </div>
    </section>
  );
}
