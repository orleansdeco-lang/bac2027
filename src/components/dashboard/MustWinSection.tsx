"use client";

import React from "react";
import Link from "next/link";
import { Check, Target, Clock, AlertCircle } from "lucide-react";
import { MustWinSummary, MustWinItem } from "@/lib/study-os/must-win-service";

interface MustWinSectionProps {
  summary: MustWinSummary | null;
  isLoading: boolean;
  isAr: boolean;
  onToggleComplete: (item: MustWinItem) => void;
}

export function MustWinSection({
  summary,
  isLoading,
  isAr,
  onToggleComplete,
}: MustWinSectionProps) {
  const getReasonLabel = (category: string) => {
    switch (category) {
      case "recurring_error":
        return isAr ? "خطأ متكرر" : "Erreur récurrente";
      case "retest_ready":
        return isAr ? "إعادة اختبار" : "Retest prêt";
      case "diagnostic_bottleneck":
        return isAr ? "ثغرة تشخيصية" : "Point faible";
      case "emerging_skill":
        return isAr ? "في طور الاكتساب" : "En cours";
      case "curriculum_step":
        return isAr ? "خطوة في المنهاج" : "Programme";
      default:
        return isAr ? "أولوية يومية" : "Priorité";
    }
  };

  return (
    <section
      aria-label={isAr ? "لازم نكملهم اليوم" : "Objectifs prioritaires"}
      className="p-5 sm:p-6 rounded-2xl bg-card border border-theme shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-theme-text font-sans">
            {isAr ? "لازم نكملهم اليوم" : "Objectifs du jour"}
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr
              ? "إذا كملت هاذ الثلاثة، راك ربحت نهارك اليوم"
              : "Les 3 actions décisives pour réussir votre journée"}
          </p>
        </div>

        {summary && summary.items.length > 0 && (
          <span className="text-xs font-mono font-bold text-theme-muted bg-surface px-2.5 py-0.5 rounded border border-theme">
            {summary.completedCount} / {summary.items.length}
          </span>
        )}
      </div>

      {/* Checklist Content */}
      {isLoading ? (
        <div className="py-6 text-center text-xs text-theme-muted font-mono animate-pulse">
          {isAr ? "جاري ترتيب أهداف الحسم..." : "Calcul des priorités..."}
        </div>
      ) : summary && summary.items.length > 0 ? (
        <div className="space-y-2">
          {summary.items.map((item, idx) => {
            const numLabel = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  item.isCompleted
                    ? "bg-surface/30 border-theme/40 opacity-70"
                    : "bg-surface border-theme hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Number Tag (01, 02, 03) */}
                  <span className="font-mono text-xs font-bold text-theme-muted shrink-0">
                    {numLabel}
                  </span>

                  {/* Toggle Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleComplete(item)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      item.isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-zinc-400 dark:border-zinc-600 hover:border-emerald-500 text-transparent"
                    }`}
                    aria-label={item.isCompleted ? "مكتمل" : "تعليم كمكتمل"}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>

                  {/* Objective Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-theme-text">
                        {item.subjectNameAr}
                      </span>
                      <span className="text-[11px] font-mono text-theme-muted">
                        • {item.estimatedMinutes} {isAr ? "د" : "min"}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-card border border-theme text-theme-secondary font-mono">
                        {getReasonLabel(item.whyCategory)}
                      </span>
                    </div>
                    <h3
                      className={`text-xs sm:text-sm truncate mt-0.5 ${
                        item.isCompleted ? "line-through text-theme-muted" : "font-medium text-theme-text"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !summary?.hasDiagnostic ? (
        <div className="py-6 text-center space-y-2 border border-dashed border-theme rounded-xl">
          <p className="text-xs text-theme-secondary max-w-xs mx-auto">
            {isAr
              ? "التقييم الأولي مازال ما تدارش. دير التقييم لتحديد أهداف الحسم اليومية."
              : "Diagnostic requis pour générer les objectifs du jour."}
          </p>
          <Link
            href="/diagnostic"
            className="inline-block text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            {isAr ? "ابدأ التقييم الأولي ←" : "Passer le test →"}
          </Link>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-theme-muted border border-dashed border-theme rounded-xl">
          {isAr
            ? "أكملت جميع مهام الحسم المقررة لليوم! أحسنت."
            : "Tous les objectifs clés du jour sont terminés !"}
        </div>
      )}
    </section>
  );
}
