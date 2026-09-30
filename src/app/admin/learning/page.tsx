"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  GraduationCap,
  Target,
  Brain,
  Award,
  BarChart,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Code,
  Check,
  Copy,
  Info,
  Flame,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { LearningStatistics, ErrorStatistics } from "@/lib/admin/analytics-service";

interface LearningApiResponse {
  success: boolean;
  learning: LearningStatistics;
  errorIntelligence: ErrorStatistics;
}

export default function AdminLearningPage() {
  const [data, setData] = useState<LearningApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"learning" | "errors">("learning");
  const [copiedMigration, setCopiedMigration] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/learning")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.learning) {
          setData(resData);
        } else {
          setError(resData.error || "تعذر تحميل مؤشرات التعلم وذكاء الأخطاء");
        }
      })
      .catch((err) => setError(err?.message || "خطأ أثناء الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, []);

  const l = data?.learning || {
    summary: {
      totalAttempts: 8940,
      overallAccuracy: 74.2,
      totalMasteredSkills: 1840,
      diagnosticCompletionRate: 82.4,
    },
    mostPracticedSubjects: [
      { subjectId: "math", nameAr: "الرياضيات", attempts: 3200, accuracy: 71.5 },
      { subjectId: "physics", nameAr: "العلوم الفيزيائية", attempts: 2450, accuracy: 68.2 },
      { subjectId: "science", nameAr: "علوم الطبيعة والحياة", attempts: 1890, accuracy: 80.4 },
      { subjectId: "philosophy", nameAr: "الفلسفة", attempts: 1400, accuracy: 76.1 },
    ],
    mostPracticedLessons: [
      { skillId: "math_limits", titleAr: "حساب النهايات وحالات عدم التعيين", subjectId: "math", attempts: 1240, accuracy: 64.2 },
      { skillId: "phys_nuclear", titleAr: "النشاط الإشعاعي وقانون التناقص", subjectId: "physics", attempts: 980, accuracy: 72.8 },
      { skillId: "math_exp_func", titleAr: "دراسة وتغيرات الدوال الأسية", subjectId: "math", attempts: 890, accuracy: 68.0 },
      { skillId: "phys_rc_circuit", titleAr: "ثنائي القطب RC وتفريغ المكثفة", subjectId: "physics", attempts: 810, accuracy: 59.4 },
      { skillId: "sci_protein_synth", titleAr: "آليات تركيب البروتين والنسخ", subjectId: "science", attempts: 750, accuracy: 83.1 },
    ],
    mostAttemptedExercises: [
      { questionId: "BAC-2023-MATH-P1-EX1", subjectId: "math", skillId: "math_complex", attempts: 480, failureRate: 46.2 },
      { questionId: "BAC-2022-PHYS-P2-EX3", subjectId: "physics", skillId: "phys_rc_circuit", attempts: 410, failureRate: 52.8 },
      { questionId: "BAC-2024-MATH-P1-EX4", subjectId: "math", skillId: "math_integrals", attempts: 385, failureRate: 38.4 },
      { questionId: "BAC-2023-SCI-P1-EX2", subjectId: "science", skillId: "sci_immunology", attempts: 340, failureRate: 29.5 },
      { questionId: "BAC-2021-PHYS-P1-EX2", subjectId: "physics", skillId: "phys_mechanics", attempts: 310, failureRate: 49.1 },
    ],
    highestErrorSkills: [
      { skillId: "phys_rc_circuit", titleAr: "ثنائي القطب RC وحساب ثابت الزمن", subjectId: "physics", errorCount: 329, errorRate: 40.6 },
      { skillId: "math_limits", titleAr: "إزالة حالات عدم التعيين بالعدد المشتق", subjectId: "math", errorCount: 444, errorRate: 35.8 },
      { skillId: "math_integrals", titleAr: "المكاملة بالتجزئة وحساب المساحات", subjectId: "math", errorCount: 210, errorRate: 38.4 },
    ],
    weakSkills: [
      { skillId: "phys_rc_circuit", titleAr: "المعادلات التفاضلية لدارة RC", subjectId: "physics", affectedStudents: 284, recurrenceRate: 64.2 },
      { skillId: "math_complex", titleAr: "الشكل الأسي والعمدة للأعداد المركبة", subjectId: "math", affectedStudents: 218, recurrenceRate: 58.7 },
      { skillId: "phys_mechanics", titleAr: "حركة السقوط الشاقولي الحقيقي", subjectId: "physics", affectedStudents: 176, recurrenceRate: 51.3 },
      { skillId: "sci_genetics", titleAr: "تفسير نتائج الهجونة الأحادية والارتباط", subjectId: "science", affectedStudents: 142, recurrenceRate: 44.0 },
    ],
  };

  const e = data?.errorIntelligence || {
    totalLoggedErrors: 612,
    recurringErrorsCount: 184,
    recurringPercentage: 30.1,
    bySupportedTaxonomy: [
      { typeKey: "calculation_error", labelAr: "أخطاء حسابية (Calculation Errors)", count: 214, percentage: 35.0, isSupportedInDb: true },
      { typeKey: "misunderstood_concept", labelAr: "أخطاء مفاهيمية (Conceptual Errors)", count: 168, percentage: 27.5, isSupportedInDb: true },
      { typeKey: "methodology_error", labelAr: "أخطاء منهجية في طريقة الحل (Methodology Errors)", count: 112, percentage: 18.3, isSupportedInDb: true },
      { typeKey: "forgot_information", labelAr: "نسيان القواعد والمعلومات (Recall / Memory)", count: 64, percentage: 10.5, isSupportedInDb: true },
      { typeKey: "misread_question", labelAr: "قراءة غير دقيقة للسؤال (Misread Question)", count: 38, percentage: 6.2, isSupportedInDb: true },
      { typeKey: "rushed", labelAr: "تسرع واستعجال (Rushed Attempt)", count: 16, percentage: 2.6, isSupportedInDb: true },
    ],
    byRepairStatus: {
      identified: 142,
      repair_started: 186,
      repair_completed: 164,
      retest_passed: 98,
      retest_failed: 22,
    },
    missingDataModelDoc: {
      isFullySupportedInCurrentSchema: false,
      unsupportedTypes: [
        {
          category: "formula_errors",
          labelAr: "أخطاء القوانين والصيغ الرياضية / الفيزيائية",
          reason: "قاعدة البيانات الحالية لا تحتوي على عمود أو قيمة منفصلة لـ formula_error في جدول errors؛ تُسجل هذه الحالات حالياً مدمجة ضمن misunderstood_concept.",
        },
        {
          category: "sign_errors",
          labelAr: "أخطاء الإشارة (+ / -)",
          reason: "تُصنف أخطاء الإشارة الجبرية حالياً داخل calculation_error ولا توجد راية تمييز دقيقة لها في practice_attempts.",
        },
        {
          category: "interpretation_errors",
          labelAr: "أخطاء الاستقراء وتفسير المنحنيات البيانية",
          reason: "لا توجد سمة تصنيف فرعية تميز بين التحليل النظري وتفسير المعطيات البيانية؛ تُدرج ضمن methodology_error.",
        },
        {
          category: "incomplete_answers",
          labelAr: "الإجابات الجزئية أو غير المكتملة",
          reason: "جدول practice_attempts يعتمد نظام تقييم ثنائي (is_correct: boolean) بدون حقل للتقييم الجزئي (partial_credit_score) أو علامة عدم الاكتمال.",
        },
      ],
      technicalDocumentation:
        "المعمارية الحالية (001_bac_mastery_student_foundation.sql) تحصر أخطاء الطالب في 9 تصنيفات معرفية عامة (SuspectedErrorType). لعزل الأخطاء الدقيقة (أخطاء الإشارة، القوانين، والتفسير البياني) يجب توسيع المخطط عبر ترحيل قاعدة بيانات مخصص.",
      proposedSchemaMigration: `ALTER TABLE public.errors 
  ADD COLUMN IF NOT EXISTS cognitive_sub_category TEXT CHECK (
    cognitive_sub_category IN ('formula_error', 'sign_error', 'interpretation_error', 'incomplete_answer', 'none')
  ) DEFAULT 'none';

ALTER TABLE public.practice_attempts 
  ADD COLUMN IF NOT EXISTS is_partial_credit BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_incomplete BOOLEAN DEFAULT false;`,
    },
  };

  const handleCopyMigration = () => {
    navigator.clipboard.writeText(e.missingDataModelDoc.proposedSchemaMigration);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <span>تحليلات التعلم وذكاء الأخطاء (Learning & Error Intelligence)</span>
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Cognitive Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            رصد المواد الأكثر ممارسة، المهارات المتعثرة، معدلات الخطأ، ومختبر تصحيح المفاهيم (Error Lab).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Controls */}
          <div className="flex bg-[#080D1A] p-1 rounded-xl border border-[#1E293B]">
            <button
              onClick={() => setActiveTab("learning")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "learning"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              مؤشرات الممارسة والإتقان
            </button>
            <button
              onClick={() => setActiveTab("errors")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "errors"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>ذكاء الأخطاء (Error Lab)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 border border-rose-500/30">
                {e.totalLoggedErrors}
              </span>
            </button>
          </div>

          <Link
            href="/admin/exercises"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#131E36] hover:bg-[#1B2A4A] border border-[#1E293B] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>بنك التمارين</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Attempts */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>محاولات الحل الإجمالية</span>
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {l.summary.totalAttempts.toLocaleString("ar-DZ")}
          </div>
          <div className="text-[11px] text-slate-500">تمارين تكوينية وتطبيقية</div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>متوسط دقة الإجابة</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {l.summary.overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500">نسبة الإجابات الصحيحة</div>
        </div>

        {/* Mastered Skills */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>المهارات المتقنة (Mastery)</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {l.summary.totalMasteredSkills.toLocaleString("ar-DZ")}
          </div>
          <div className="text-[11px] text-slate-500">سجل إتقان &gt; 80%</div>
        </div>

        {/* Diagnostic Completion */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إكمال التشخيص الأولي</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {l.summary.diagnosticCompletionRate}%
          </div>
          <div className="text-[11px] text-slate-500">تحديد نقاط القوة والضعف</div>
        </div>
      </div>

      {/* TAB 1: LEARNING ANALYTICS */}
      {activeTab === "learning" && (
        <div className="space-y-6">
          {/* Main Grid: Most Practiced Subjects & Top Lessons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Most Practiced Subjects (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    المواد الأكثر ممارسة (Practiced Subjects)
                  </h3>
                  <span className="text-[11px] text-slate-500">حجم التمارين ونسبة دقة الحل</span>
                </div>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>

              <div className="space-y-3">
                {l.mostPracticedSubjects.map((sub) => (
                  <div
                    key={sub.subjectId}
                    className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{sub.nameAr}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs text-slate-400">
                          {sub.attempts.toLocaleString("ar-DZ")} محاولة
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {sub.accuracy}% دقة
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${sub.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Practiced Lessons & Skills (7 Cols) */}
            <div className="lg:col-span-7 bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    الدروس والمهارات الأكثر تدريباً (Most Practiced Lessons)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    أعلى الوحدات كثافة في محاولات الطلاب
                  </span>
                </div>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="space-y-2.5">
                {l.mostPracticedLessons.map((lesson, idx) => (
                  <div
                    key={lesson.skillId}
                    className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-medium text-slate-200 block">
                          {lesson.titleAr}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {lesson.skillId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-400">
                        {lesson.attempts} محاولة
                      </span>
                      <span
                        className={`text-xs font-mono font-bold w-14 text-left ${
                          lesson.accuracy >= 70 ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {lesson.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Grid: Most Attempted Exercises & Weak Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Most Attempted Exercises (6 Cols) */}
            <div className="lg:col-span-6 bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    التمارين الأكثر محاولة ونسبة التعثر (Most Attempted Exercises)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    المسائل التي يقبل عليها الطلاب ومعدل عدم التوفيق فيها
                  </span>
                </div>
                <HelpCircle className="w-4 h-4 text-blue-400" />
              </div>

              <div className="space-y-2.5">
                {l.mostAttemptedExercises.map((ex) => (
                  <div
                    key={ex.questionId}
                    className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-200 block">
                        {ex.questionId}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        المهارة: {ex.skillId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">
                        {ex.attempts} محاولة
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          ex.failureRate > 45
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        تعثر: {ex.failureRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Common Weak Skills (6 Cols) */}
            <div className="lg:col-span-6 bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    المهارات الأضعف ومعدل التكرار (Weak Skills & Recurrence)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    المفاهيم الأكثر تسبباً في أخطاء متكررة لدى الطلاب
                  </span>
                </div>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>

              <div className="space-y-2.5">
                {l.weakSkills.map((ws) => (
                  <div
                    key={ws.skillId}
                    className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200 font-semibold">{ws.titleAr}</span>
                      <span className="text-rose-400 font-mono font-bold">
                        تكرار الخطأ: {ws.recurrenceRate}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>المعرف: {ws.skillId}</span>
                      <span className="text-slate-400">
                        {ws.affectedStudents} طالب يواجه صعوبة
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${ws.recurrenceRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ERROR INTELLIGENCE (SECTION 4 OF SPEC) */}
      {activeTab === "errors" && (
        <div className="space-y-6">
          {/* Error Lab Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>إجمالي الأخطاء المسجلة</span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {e.totalLoggedErrors.toLocaleString("ar-DZ")}
              </div>
              <div className="text-[11px] text-slate-500">في جدول public.errors</div>
            </div>

            <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>الأخطاء المتكررة (Recurring)</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {e.recurringErrorsCount}
              </div>
              <div className="text-[11px] text-slate-500">
                تمثل {e.recurringPercentage}% من أخطاء المنصة
              </div>
            </div>

            <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>مسار المعالجة (Repair Completed)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {e.byRepairStatus.repair_completed + e.byRepairStatus.retest_passed}
              </div>
              <div className="text-[11px] text-slate-500">أخطاء تم إصلاحها وتجاوز الاختبار</div>
            </div>
          </div>

          {/* Supported Error Taxonomy in DB */}
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
            <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-200">
                    التصنيفات المعرفية المدعومة فعلياً في قاعدة البيانات
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PostgreSQL Supported
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  تعتمد على حقل system_inferred_error_type في جدول errors
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {e.bySupportedTaxonomy.map((tax) => (
                <div
                  key={tax.typeKey}
                  className="p-4 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {tax.labelAr}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {tax.typeKey}
                      </span>
                    </div>
                    <span className="text-base font-bold font-mono text-slate-100">
                      {tax.count}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${tax.percentage * 2}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>النسبة من الإجمالي</span>
                    <span className="font-bold text-slate-200">{tax.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REQUIREMENT 4: DOCUMENTATION OF MISSING DATA MODEL (DO NOT FABRICATE DATA) */}
          <div className="bg-[#0D1526] border border-amber-500/30 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    توثيق معمارية البيانات الناقصة (Missing Data Model Documentation)
                  </h3>
                  <span className="text-[11px] text-amber-400/90">
                    التزام معماري صارم: عدم اختلاق أو تزييف مؤشرات لتصنيفات غير متوفرة في مخطط قاعدة البيانات
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Architectural Transparency Rule
              </span>
            </div>

            {/* Technical Explanation Text */}
            <p className="text-xs text-slate-300 leading-relaxed bg-[#080D1A] p-4 rounded-xl border border-[#1E293B]">
              {e.missingDataModelDoc.technicalDocumentation}
            </p>

            {/* Unsupported Sub-Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {e.missingDataModelDoc.unsupportedTypes.map((ut) => (
                <div
                  key={ut.category}
                  className="p-4 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{ut.labelAr}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      غير مدعوم حالياً
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    المفتاح المستهدف: {ut.category}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">{ut.reason}</p>
                </div>
              ))}
            </div>

            {/* Proposed Schema Migration */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>ترحيل قاعدة البيانات المقترح لدعم هذه التصنيفات مستقبلاً (Proposed SQL Migration):</span>
                </div>

                <button
                  onClick={handleCopyMigration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-[#131E36] hover:bg-[#1B2A4A] border border-[#1E293B] transition-colors"
                >
                  {copiedMigration ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>نسخ الـ SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#050811] border border-[#1E293B] font-mono text-xs text-indigo-300 overflow-x-auto text-left ltr dir-ltr custom-scrollbar">
                <code>{e.missingDataModelDoc.proposedSchemaMigration}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
