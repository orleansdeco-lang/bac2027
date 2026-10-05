"use client";

import React from "react";
import Link from "next/link";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";

interface SubjectHealthCardProps {
  streamSubjects: any[];
  masteryMap: Record<string, any>;
  errorsMap: Record<string, any>;
  isAr: boolean;
}

export function SubjectHealthCard({
  streamSubjects,
  masteryMap,
  errorsMap,
  isAr,
}: SubjectHealthCardProps) {
  const errorList = Object.values(errorsMap || {});
  const masteryList = Object.values(masteryMap || {});

  // Sort subjects: core first, then by coefficient descending
  const sortedSubjects = [...(streamSubjects || [])].sort((a, b) => {
    if (a.isCoreSubject && !b.isCoreSubject) return -1;
    if (!a.isCoreSubject && b.isCoreSubject) return 1;
    return (b.coefficient || 0) - (a.coefficient || 0);
  });

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
      aria-label={isAr ? "حالة المواد" : "État des matières"}
      className="p-5 sm:p-6 rounded-2xl bg-card border border-theme shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-theme-text font-sans">
            {isAr ? "حالة المواد والمعاملات" : "État des matières"}
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr
              ? "مستوى التحكم والثغرات حسب معاملات شعبتك"
              : "Niveau de maîtrise et coefficients officiels"}
          </p>
        </div>

        <Link
          href="/roadmap"
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          {isAr ? "الخريطة ←" : "Carte →"}
        </Link>
      </div>

      {/* Clean Linear/Notion Table List */}
      <div className="space-y-1.5 divide-y divide-theme/40">
        {sortedSubjects.slice(0, 5).map((subjRule) => {
          const sId = subjRule.subjectId;
          const coeff = subjRule.coefficient;

          // Real error and mastery counts
          const subjErrors = errorList.filter(
            (e: any) =>
              (e.subjectId === sId ||
                (sId === "science" && e.subjectId === "natural_sciences") ||
                (sId === "natural_sciences" && e.subjectId === "science")) &&
              (e.repairStatus === "identified" || e.repairStatus === "repair_started")
          );

          const subjMastered = masteryList.filter(
            (m: any) =>
              (m.subjectId === sId ||
                (sId === "science" && m.subjectId === "natural_sciences") ||
                (sId === "natural_sciences" && m.subjectId === "science")) &&
              (m.masteryStatus === "demonstrated" || m.status === "mastered")
          );

          // Truthful Status: No fake percentages!
          let statusText = isAr ? "لم تبدأ بعد" : "Non débuté";
          let statusArrow = "—";
          let statusColor = "text-theme-muted";

          if (subjErrors.length > 0) {
            statusText = isAr ? "تحتاج تركيز" : "À renforcer";
            statusArrow = "↓";
            statusColor = "text-rose-600 dark:text-rose-400 font-bold";
          } else if (subjMastered.length >= 3) {
            statusText = isAr ? "قوية" : "Solide";
            statusArrow = "↑";
            statusColor = "text-emerald-600 dark:text-emerald-400 font-bold";
          } else if (subjMastered.length >= 1) {
            statusText = isAr ? "مستقرة" : "Stable";
            statusArrow = "→";
            statusColor = "text-amber-700 dark:text-amber-400 font-medium";
          }

          return (
            <div
              key={sId}
              className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-theme-text truncate">
                  {getSubjectName(sId)}
                </span>
                <span className="font-mono text-[11px] text-theme-muted shrink-0">
                  {isAr ? `معامل ${coeff}` : `coeff ${coeff}`}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] font-sans ${statusColor}`}>
                  {statusText}
                </span>
                <span className={`font-mono text-xs ${statusColor}`}>
                  {statusArrow}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
