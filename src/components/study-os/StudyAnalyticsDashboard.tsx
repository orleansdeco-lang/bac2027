"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Clock,
  Target,
  Brain,
  Wrench,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  StudyOsAnalyticsReport,
  AnalyticsTimeHorizon,
  HorizonReport,
} from "@/types/study-analytics";
import { useFocus } from "@/context/FocusContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function formatMinutesToHours(mins: number): string {
  if (mins < 60) return `${mins} د`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface StudyAnalyticsDashboardProps {
  report: StudyOsAnalyticsReport;
  className?: string;
}

export function StudyAnalyticsDashboard({
  report,
  className = "",
}: StudyAnalyticsDashboardProps) {
  const { startSession, openFocusMode } = useFocus();
  const [activeHorizon, setActiveHorizon] = useState<AnalyticsTimeHorizon>("week");

  const currentHorizon: HorizonReport = report[activeHorizon];
  const { activity, learning } = currentHorizon;

  const handleStartFix = (subjectId: string, skillId: string, skillTitle: string) => {
    startSession({
      mode: "25m",
      targetDurationMinutes: 25,
      subjectId: subjectId as any,
      skillId,
      taskTitle: `إصلاح: ${skillTitle}`,
    });
    openFocusMode();
  };

  const targetPercentage =
    activity.targetMinutes > 0
      ? Math.min(100, Math.round((activity.focusMinutes / activity.targetMinutes) * 100))
      : 0;

  return (
    <div className={`space-y-8 select-none ${className}`} dir="rtl">
      {/* ================================================================= */}
      {/* 1. HORIZON SELECTOR & HEADER                                      */}
      {/* ================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl border border-theme bg-gradient-to-br from-surface via-surface/90 to-surface/60 shadow-clay">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
            <h1 className="text-xl sm:text-2xl font-black text-theme-text font-sans">
              تحليلات الشاطر: نشاط الدراسة مقابل تقدم التعلم
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-theme-secondary">
            شعبة {report.streamNameAr} • نربط بين الوقت المبذول والأدلة الحقيقية المثبتة.
          </p>
        </div>

        {/* Horizon Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-card border border-theme self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveHorizon("today")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeHorizon === "today"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-theme-muted hover:text-theme-text hover:bg-surface/60"
            }`}
          >
            اليوم
          </button>
          <button
            type="button"
            onClick={() => setActiveHorizon("week")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeHorizon === "week"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-theme-muted hover:text-theme-text hover:bg-surface/60"
            }`}
          >
            هذا الأسبوع
          </button>
          <button
            type="button"
            onClick={() => setActiveHorizon("longTerm")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeHorizon === "longTerm"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-theme-muted hover:text-theme-text hover:bg-surface/60"
            }`}
          >
            المسار الإجمالي
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 1: STUDY ACTIVITY (نشاط الدراسة)                          */}
      {/* ================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-theme/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center text-sm font-bold">
              ⏱️
            </span>
            <h2 className="text-base sm:text-lg font-black text-theme-text font-sans">
              1. نشاط الدراسة ({currentHorizon.labelAr})
            </h2>
          </div>
          <span className="text-[11px] text-theme-muted font-sans">
            الجهد والوقت المبذول
          </span>
        </div>

        {/* Activity KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Focus Time */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                وقت التركيز
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">
                {targetPercentage}% من الهدف
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
              {formatMinutesToHours(activity.focusMinutes)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
          </div>

          {/* Card 2: Target vs Actual */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                المستهدف الدراسي
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
              {formatMinutesToHours(activity.targetMinutes)}
            </div>
            <span className="text-[10px] text-theme-muted block">
              {activity.focusMinutes >= activity.targetMinutes
                ? "حققت المستهدف بالكامل 🎯"
                : `متبقي ${formatMinutesToHours(Math.max(0, activity.targetMinutes - activity.focusMinutes))}`}
            </span>
          </div>

          {/* Card 3: Sessions Count */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                جلسات التركيز
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
              {activity.sessionsCount} <span className="text-xs font-normal text-theme-muted">جلسة</span>
            </div>
            <span className="text-[10px] text-theme-muted block">
              عبر {activity.subjectsStudiedCount} مواد مختلفة
            </span>
          </div>

          {/* Card 4: Streak & Active Days */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                السلسلة المتواصلة
              </span>
              <span className="text-[10px] text-theme-muted">
                الأطول: {activity.longestStreakDays} أيام
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono flex items-center gap-1">
              <span>{activity.currentStreakDays}</span>
              <span className="text-xs font-normal text-theme-muted">أيام متتالية</span>
            </div>
            <span className="text-[10px] text-theme-muted block">
              إجمالي الأيام النشطة: {activity.activeDaysCount} يوماً
            </span>
          </div>
        </div>

        {/* Weekly Focus Bar Chart & Subject Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekly Distribution Chart */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                توزيع ساعات الدراسة الأسبوعية (السبت - الجمعة)
              </span>
              <span className="text-[10px] text-theme-muted font-mono">
                المجموع: {formatMinutesToHours(activity.focusMinutes)}
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity.dailyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="dayNameAr"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}د`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-[#0E131F] border border-white/10 text-white text-xs space-y-1 shadow-xl">
                          <div className="font-bold text-amber-400">{data.dayNameAr} ({data.date})</div>
                          <div className="font-mono">التركيز: {data.actualMinutes} دقيقة</div>
                          <div className="font-mono text-slate-400">المستهدف: {data.targetMinutes} دقيقة</div>
                          <div className="text-[10px] text-slate-400">{data.sessionsCount} جلسة منجزة</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="actualMinutes" radius={[6, 6, 0, 0]}>
                    {activity.dailyDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.actualMinutes >= entry.targetMinutes ? "#10B981" : "#3B82F6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Focus Distribution */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                توزيع وقت الدراسة حسب المواد
              </span>
              <span className="text-[10px] text-theme-muted">
                مرتبة حسب الوقت المستثمر
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {activity.subjectDistribution.map((sub) => (
                <div key={sub.subjectId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sub.hexColor }}
                      />
                      <span className="font-bold text-theme-text">{sub.nameAr}</span>
                      <span className="text-[10px] text-theme-muted font-mono">
                        (معامل {sub.coefficient})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-bold text-theme-text">{sub.focusMinutes} د</span>
                      <span className="text-theme-muted">({sub.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.percentage}%`,
                        backgroundColor: sub.hexColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 2: REAL LEARNING PROGRESS (تقدم التعلم الحقيقي)            */}
      {/* ================================================================= */}
      <section className="space-y-4 pt-4 border-t border-theme/60">
        <div className="flex items-center justify-between border-b border-theme/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-sm font-bold">
              🧠
            </span>
            <h2 className="text-base sm:text-lg font-black text-theme-text font-sans">
              2. تقدم التعلم الحقيقي ({currentHorizon.labelAr})
            </h2>
          </div>
          <span className="text-[11px] text-emerald-500 font-bold font-sans">
            أدلة بيداغوجية مثبتة بالتقييم
          </span>
        </div>

        {/* Learning KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Repaired Errors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                أخطاء تم إصلاحها
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono">
              {learning.repairedErrorsCount}
            </div>
            <span className="text-[10px] text-theme-muted block">
              عبر معمل الأخطاء والتمارين
            </span>
          </div>

          {/* Card 2: Demonstrated Skills */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                مهارات مثبتة بالدليل
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
              {learning.demonstratedSkillsCount} <span className="text-xs text-theme-muted font-normal">/ {learning.totalCurriculumSkillsCount}</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-bold block">
              {learning.demonstratedMasteryPercentage}% من منهاج البكالوريا
            </span>
          </div>

          {/* Card 3: Completed Missions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                المهام المكتملة
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
              {learning.completedMissionsCount}
            </div>
            <span className="text-[10px] text-theme-muted block">
              مهام تشخيصية وتدريبية منجزة
            </span>
          </div>

          {/* Card 4: Retest Successes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                اختبارات التثبيت التوأم
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-500 font-mono">
              {learning.retestSuccessCount}
            </div>
            <span className="text-[10px] text-theme-muted block">
              اختبارات تأكيد الفهم بعد الإصلاح
            </span>
          </div>
        </div>

        {/* Actionable Unresolved Weaknesses */}
        <div className="p-5 sm:p-7 rounded-3xl bg-card border border-theme shadow-clay space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm sm:text-base font-black text-theme-text font-sans">
                  نقاط الضعف النشطة التي تحتاج معالجة (Actionable Weaknesses)
                </h3>
              </div>
              <p className="text-xs text-theme-muted mt-0.5">
                أخطاء مشخصة في معمل الأخطاء لم يتم تثبيتها بعد. كل نقطة توجهك لإجراء فوري.
              </p>
            </div>
            <Badge variant="outline" size="sm" className="text-xs text-amber-500 font-bold self-start sm:self-auto">
              {learning.unresolvedWeaknesses.length} ثغرات مفتوحة
            </Badge>
          </div>

          {learning.unresolvedWeaknesses.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-surface/50 border border-theme/60 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-xs sm:text-sm font-bold text-theme-text">
                ممتاز! لا توجد أخطاء مفتوحة تحتاج إصلاحاً حالياً.
              </div>
              <p className="text-xs text-theme-muted max-w-md mx-auto">
                جميع المفاهيم السابقة مثبتة بالدليل. تابع حل المسائل والمهام لتحدي مهاراتك.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {learning.unresolvedWeaknesses.slice(0, 6).map((weakness) => (
                <div
                  key={weakness.errorId}
                  className="p-4 rounded-2xl border border-theme bg-surface/40 hover:bg-surface/80 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" size="sm" className="text-[10px] font-bold">
                        {weakness.subjectNameAr}
                      </Badge>
                      <span className="text-[10px] text-amber-500 font-bold">
                        يحتاج معالجة
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-theme-text font-sans line-clamp-1">
                      {weakness.skillTitleAr}
                    </h4>

                    {weakness.rootCauseAr && (
                      <p className="text-[11px] text-theme-muted line-clamp-2">
                        💡 {weakness.rootCauseAr}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-theme/40 flex items-center justify-between gap-2">
                    <Link
                      href={weakness.actionUrl}
                      className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <span>افتح في معمل الأخطاء</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStartFix(weakness.subjectId, weakness.skillId, weakness.skillTitleAr)}
                      className="text-[11px] font-bold py-1 px-3 rounded-xl shadow-clay flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>صلح بالتركيز ⏱️</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
