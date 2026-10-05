"use client";

import React from "react";
import Link from "next/link";
import { Wrench, CheckCircle2 } from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";
import { SuspectedErrorType } from "@/types/mission";

interface NeedsAttentionCardProps {
  errorsMap: Record<string, any>;
  diagnosticResult: any;
  isAr: boolean;
}

export function NeedsAttentionCard({
  errorsMap,
  diagnosticResult,
  isAr,
}: NeedsAttentionCardProps) {
  const errorList: any[] = Object.values(errorsMap || {});
  const activeErrors = errorList.filter(
    (e) => e.repairStatus === "identified" || e.repairStatus === "repair_started"
  );

  const getErrorLabel = (errorType: SuspectedErrorType) => {
    switch (errorType) {
      case "methodology_error":
        return isAr ? "خلل منهجي في صياغة الإجابة" : "Erreur méthodologique";
      case "calculation_error":
        return isAr ? "خطأ في الحساب أو التطبيق العددي" : "Erreur de calcul";
      case "misunderstood_concept":
        return isAr ? "سوء فهم المفهوم العلمي" : "Incompréhension conceptuelle";
      case "forgot_information":
        return isAr ? "نسيان المعلومة أو القاعدة" : "Oubli de formule";
      case "misread_question":
        return isAr ? "تسرع في قراءة نص السؤال" : "Mauvaise lecture du sujet";
      case "lack_of_practice":
        return isAr ? "نقص التدريب التطبيقي" : "Manque d'entraînement";
      default:
        return isAr ? "خطأ يحتاج تفكيكاً بيداغوجياً" : "Erreur à réparer";
    }
  };

  const getSubjectName = (subjectId: string) => {
    const mapped =
      subjectId === "science" ? "natural_sciences" :
      subjectId === "mathematics" ? "math" :
      subjectId;
    const subj = ALL_SUBJECTS[mapped as SubjectId];
    if (subj) return isAr ? subj.name_ar : subj.name_fr;
    return subjectId;
  };

  return (
    <section
      aria-label={isAr ? "نقاط التعثر النشطة" : "Points d'attention"}
      className="p-5 sm:p-6 rounded-2xl bg-card border border-theme shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-theme-text font-sans">
            {isAr ? "وين راه المشكل؟" : "Points d'attention"}
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr
              ? "الثغرات والأخطاء النشطة التي تحتاج تصحيحاً"
              : "Erreurs récurrentes impactant votre moyenne"}
          </p>
        </div>

        <Link
          href="/student/error-lab"
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          {isAr ? "مختبر الأخطاء ←" : "Lab d'erreurs →"}
        </Link>
      </div>

      {/* Content */}
      {activeErrors.length > 0 ? (
        <div className="space-y-2">
          {activeErrors.slice(0, 3).map((err, idx) => (
            <div
              key={err.id || idx}
              className="p-3 rounded-xl bg-surface border border-rose-500/25 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-theme-text">
                    {getSubjectName(err.subjectId)}
                  </span>
                  {err.attemptCount && err.attemptCount > 1 ? (
                    <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                      • {isAr ? `تكرر ${err.attemptCount} مرات` : `${err.attemptCount}x récurrent`}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-xs text-theme-secondary truncate">
                  {getErrorLabel(err.suspectedErrorType)}
                </h3>
              </div>

              <Link href="/student/error-lab" className="shrink-0">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                  {isAr ? "افتح المختبر ←" : "Réparer →"}
                </span>
              </Link>
            </div>
          ))}
        </div>
      ) : diagnosticResult?.primaryBottleneck ? (
        <div className="p-3 rounded-xl bg-surface border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">
              {isAr ? "نقطة تعثر مشخصة" : "Point faible détecté"}
            </span>
            <p className="font-semibold text-theme-text mt-0.5">
              {diagnosticResult.primaryBottleneck}
            </p>
          </div>
          <Link
            href="/roadmap"
            className="text-xs font-bold text-[var(--color-primary)] hover:underline shrink-0"
          >
            {isAr ? "المسار ←" : "Plan →"}
          </Link>
        </div>
      ) : (
        <div className="py-4 text-center space-y-1">
          <p className="text-xs font-medium text-theme-text">
            {isAr ? "ما كاش أخطاء نشطة تحتاج تدخل الآن." : "Aucune erreur critique en attente."}
          </p>
          <p className="text-[11px] text-theme-muted">
            {isAr ? "استمر في تثبيت مهاراتك وإنجاز الخطة اليومية." : "Toutes les compétences sont sous contrôle."}
          </p>
        </div>
      )}
    </section>
  );
}
