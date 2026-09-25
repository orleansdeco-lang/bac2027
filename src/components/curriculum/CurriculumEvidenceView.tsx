"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CurriculumTreeSummary,
  CurriculumSubjectWithEvidence,
  CurriculumUnitWithEvidence,
  CurriculumSkillWithEvidence,
} from "@/lib/study-os/curriculum-evidence-service";
import { useFocus } from "@/context/FocusContext";
import {
  Compass,
  CheckCircle2,
  Clock,
  Play,
  Wrench,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface CurriculumEvidenceViewProps {
  summary: CurriculumTreeSummary;
  onOpenLesson: (skillId: string) => void;
  className?: string;
}

export function CurriculumEvidenceView({
  summary,
  onOpenLesson,
  className = "",
}: CurriculumEvidenceViewProps) {
  const { startSession, openFocusMode } = useFocus();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    summary.subjects[0]?.subjectId || "math"
  );
  const [expandedUnitIds, setExpandedUnitIds] = useState<Record<string, boolean>>({});

  const activeSubject =
    summary.subjects.find((s) => s.subjectId === selectedSubjectId) || summary.subjects[0];

  const toggleUnit = (unitId: string) => {
    setExpandedUnitIds((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleStartFocus = (skill: CurriculumSkillWithEvidence) => {
    startSession({
      mode: "25m",
      targetDurationMinutes: 25,
      subjectId: skill.subjectId,
      skillId: skill.skillId,
      missionId: skill.missionId,
      taskTitle: skill.title_ar,
    });
    openFocusMode();
  };

  if (!activeSubject) {
    return (
      <div className="p-8 text-center text-xs text-theme-muted">
        لا توجد مواد مسجلة لهذه الشعبة حالياً.
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {/* ================================================================= */}
      {/* 1. MACRO SUMMARY: "وين وصلت في الباك؟"                            */}
      {/* ================================================================= */}
      <div className="p-5 sm:p-7 rounded-3xl border border-theme bg-card shadow-clay space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-theme/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
              <h2 className="text-lg sm:text-xl font-black text-theme-text font-sans">
                خريطة المنهاج والدليل البيداغوجي 🗺️
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-theme-secondary font-medium mt-0.5">
              إجابة دقيقة على: «وين وصلت في الباك؟» بالاعتماد الحصري على إثباتات الإتقان الفعلية.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-surface border border-theme text-theme-text">
              شعبة {summary.streamNameAr}
            </span>
          </div>
        </div>

        {/* Macro Telemetry Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
            <span className="text-[11px] font-bold text-emerald-600 block">
              مهارات مثبتة بالدليل
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
                {summary.demonstratedSkillsCount}
              </span>
              <span className="text-xs text-emerald-700/70 font-mono">
                / {summary.totalSkillsCount}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right">
            <span className="text-[11px] font-bold text-amber-600 block">
              جاهزة لاختبار التثبيت
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-600">
                {summary.retestReadySkillsCount}
              </span>
              <span className="text-xs text-amber-700/70">مهارة</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-right">
            <span className="text-[11px] font-bold text-rose-600 block">
              تحتاج معالجة أخطاء
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-rose-600">
                {summary.needsRepairSkillsCount}
              </span>
              <span className="text-xs text-rose-700/70">مهارة</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface border border-theme text-right">
            <span className="text-[11px] font-bold text-theme-muted block">
              نسبة الإتقان المثبت الكلية
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-theme-text">
                {summary.overallMasteryPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Evidence Calculation Explanation Note */}
        <div className="p-3 rounded-xl bg-surface/70 border border-theme/70 flex items-start gap-2 text-[11px] text-theme-secondary font-medium">
          <HelpCircle className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-theme-text">قاعدة الحساب الصارم: </span>
            تُحسب نسبة الإتقان بناءً على المهارات التي تم حل تمارينها بنجاح أو إصلاح أخطائها واجتياز اختبار التثبيت التوأم. وضع علامة «تمت المطالعة» ذاتياً لا يعتبر إتقاناً مثبتاً حتى يتم تطبيقها فعلياً.
          </p>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. SUBJECT TABS (SORTED BY COEFFICIENT)                           */}
      {/* ================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>اختر المادة (مرتبة حسب المعامل الوزاري الرسمي):</span>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {summary.subjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.subjectId;
            return (
              <button
                key={sub.subjectId}
                type="button"
                onClick={() => setSelectedSubjectId(sub.subjectId)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer border ${
                  isSelected
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-md scale-102"
                    : "bg-card border-theme text-theme-secondary hover:text-theme-text hover:bg-surface"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: sub.hexColor }}
                />
                <span>{sub.name_ar}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                      : "bg-surface text-theme-muted border border-theme"
                  }`}
                >
                  معامل {sub.coefficient}
                </span>

                {sub.needsRepairCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="يوجد خطأ بحاجة لإصلاح" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. ACTIVE SUBJECT SUMMARY & RECOMMENDED ACTION BANNER              */}
      {/* ================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl border border-theme bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: activeSubject.hexColor }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-theme-text">
                  منهاج {activeSubject.name_ar}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface border border-theme text-theme-muted">
                  معامل {activeSubject.coefficient}
                </span>
                {activeSubject.isCore && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    مادة أساسية
                  </span>
                )}
              </div>
              <p className="text-xs text-theme-secondary mt-0.5 font-medium">
                {activeSubject.units.length} وحدات • {activeSubject.totalSkills} مهارة معتمدة
              </p>
            </div>
          </div>

          {/* Subject Mastery Progress Percentage */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end bg-surface/80 p-3 rounded-2xl border border-theme">
            <div className="text-right">
              <span className="text-[10px] text-theme-muted block font-semibold">
                الإتقان المثبت في المادة
              </span>
              <span className="text-sm font-black font-mono text-theme-text">
                {activeSubject.demonstratedCount} من {activeSubject.totalSkills} مهارة ({activeSubject.masteryPercentage}%)
              </span>
            </div>
            <div className="w-16 h-2 bg-theme-border/30 rounded-full overflow-hidden border border-theme/40">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${activeSubject.masteryPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommended Action Card (if available) */}
        {activeSubject.recommendedAction && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-surface to-surface border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  {activeSubject.recommendedAction.label}:
                </span>
                <span className="font-semibold text-theme-text">
                  {activeSubject.recommendedAction.skillTitleAr}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenLesson(activeSubject.recommendedAction!.skillId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <span>{activeSubject.recommendedAction.actionText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 4. UNITS ACCORDION (STREAM → SUBJECT → UNIT → SKILL)             */}
      {/* ================================================================= */}
      <div className="space-y-4">
        {activeSubject.units.map((unit) => {
          const isExpanded = expandedUnitIds[unit.id] ?? true; // Default expanded

          return (
            <div
              key={unit.id}
              className="rounded-3xl border border-theme bg-card overflow-hidden shadow-xs transition-all"
            >
              {/* Unit Header Bar (Clickable to collapse/expand) */}
              <button
                type="button"
                onClick={() => toggleUnit(unit.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right bg-card hover:bg-surface/50 transition-colors cursor-pointer border-b border-theme/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-surface border border-theme flex items-center justify-center text-xs font-mono font-bold text-theme-muted shrink-0">
                    {unit.order < 900 ? unit.order : "•"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-theme-text truncate">
                        {unit.title_ar}
                      </h4>

                      {/* Unit Status Pill */}
                      {unit.status === "mastered" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>متقنة بالكامل</span>
                        </span>
                      ) : unit.status === "needs_attention" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>تحتاج إصلاح خطأ ({unit.needsRepairCount})</span>
                        </span>
                      ) : unit.status === "in_progress" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          قيد التدريب ({unit.demonstratedCount}/{unit.totalSkills})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-theme-muted border border-theme">
                          لم تبدأ بعد
                        </span>
                      )}
                    </div>

                    {unit.description_ar && (
                      <p className="text-xs text-theme-secondary mt-0.5 truncate max-w-xl font-medium">
                        {unit.description_ar}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-theme-muted hidden sm:inline">
                    {unit.demonstratedCount} / {unit.totalSkills} مثبتة
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-theme-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-theme-muted" />
                  )}
                </div>
              </button>

              {/* Skills List within this Unit */}
              {isExpanded && (
                <div className="p-3 sm:p-4 space-y-2.5 bg-surface/30">
                  {unit.skills.map((skill) => {
                    const isDemonstrated = skill.isDemonstrated;
                    const isNeedsRepair = skill.state === "NEEDS_REPAIR";
                    const isRetestReady = skill.state === "RETEST_READY";

                    return (
                      <div
                        key={skill.skillId}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                          isDemonstrated
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : isNeedsRepair
                            ? "bg-rose-500/5 border-rose-500/30"
                            : isRetestReady
                            ? "bg-amber-500/5 border-amber-500/30"
                            : "bg-card border-theme"
                        }`}
                      >
                        {/* Skill Title & Badges */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-bold text-xs sm:text-sm ${
                                isDemonstrated ? "text-emerald-700 dark:text-emerald-300" : "text-theme-text"
                              }`}
                            >
                              {skill.title_ar}
                            </span>

                            {/* Status Evidence Badges */}
                            {isDemonstrated ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>مثبتة بالدليل ✅</span>
                              </span>
                            ) : isRetestReady ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 animate-pulse">
                                جاهز لاختبار التثبيت 🧪
                              </span>
                            ) : isNeedsRepair ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/30">
                                توجد ثغرة بحاجة لإصلاح 🔧
                              </span>
                            ) : skill.isSelfReported ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                مطالعة ذاتية 📖
                              </span>
                            ) : null}
                          </div>

                          {skill.description_ar && (
                            <p className="text-[11px] text-theme-muted truncate max-w-xl">
                              {skill.description_ar}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* "ابدأ التركيز" CTA -> Opens Focus Engine */}
                          <button
                            type="button"
                            onClick={() => handleStartFocus(skill)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-theme bg-surface hover:bg-card text-theme-text font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                            title="بدء جلسة تركيز لهذه المهارة"
                          >
                            <Clock className="w-3 h-3 text-[var(--color-primary)]" />
                            <span>ابدأ التركيز</span>
                          </button>

                          {/* Primary Pedagogical Action */}
                          {isNeedsRepair ? (
                            <button
                              type="button"
                              onClick={() => onOpenLesson(skill.skillId)}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>صلح الخطأ</span>
                            </button>
                          ) : isRetestReady ? (
                            <button
                              type="button"
                              onClick={() => onOpenLesson(skill.skillId)}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] transition-all shadow-xs cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>عاود الاختبار</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenLesson(skill.skillId)}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>فتح الدرس والتمارين</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
