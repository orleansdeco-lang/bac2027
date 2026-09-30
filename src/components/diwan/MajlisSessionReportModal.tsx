"use client";

import React from "react";
import Link from "next/link";
import {
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Target,
  RotateCcw,
  BookOpen,
  Coffee,
  X,
  Share2,
} from "lucide-react";
import { formatStopwatch } from "./CozyMajlisDesk";

export interface SessionReportData {
  durationSeconds: number;
  plannedMinutes: number;
  subjectTitle: string;
  topicTitle: string;
  exercisesAttempted: number;
  exercisesCorrect: number;
  skillsStrengthened: string[];
  skillsNeedingReview: string[];
  errorTypesEncountered: string[];
}

interface MajlisSessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SessionReportData;
  onStartNewSession?: () => void;
}

export function MajlisSessionReportModal({
  isOpen,
  onClose,
  report,
  onStartNewSession,
}: MajlisSessionReportModalProps) {
  if (!isOpen) return null;

  const accuracyPercent = report.exercisesAttempted > 0
    ? Math.round((report.exercisesCorrect / report.exercisesAttempted) * 100)
    : 100;

  const durationMin = Math.round(report.durationSeconds / 60);

  const errorLabels: Record<string, string> = {
    calculation_error: "غلطة حساب أو إشارة",
    misunderstood_concept: "التباس في المفهوم العلمي",
    methodology_error: "خلل في خطوات المنهجية",
    misread_question: "قراءة غير دقيقة للسؤال",
    forgot_information: "نسيان قانون أو معلومة",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B1222] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-950/60 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xl shadow-inner">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                جلسة مكتملة بنجاح 🎓
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                تقرير إنجاز مجلس العلم: {report.topicTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto no-scrollbar text-right">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Time focused */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block">وقت التركيز</span>
              <span className="text-lg sm:text-xl font-mono font-black text-amber-300 block">
                {formatStopwatch(report.durationSeconds)}
              </span>
              <span className="text-[10px] text-slate-500">من أصل {report.plannedMinutes} دقيقة</span>
            </div>

            {/* 2. Questions Attempted */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block">التمارين المنجزة</span>
              <span className="text-lg sm:text-xl font-mono font-black text-blue-400 block">
                {report.exercisesAttempted}
              </span>
              <span className="text-[10px] text-slate-500">تمرين تم حله</span>
            </div>

            {/* 3. Correct answers */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block">إجابات صحيحة</span>
              <span className="text-lg sm:text-xl font-mono font-black text-emerald-400 block">
                {report.exercisesCorrect}
              </span>
              <span className="text-[10px] text-slate-500">من المحاولة الأولى</span>
            </div>

            {/* 4. Accuracy Rate */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block">نسبة الدقة</span>
              <span className="text-lg sm:text-xl font-mono font-black text-purple-300 block">
                {accuracyPercent}%
              </span>
              <span className="text-[10px] text-slate-500">معايير وزارية</span>
            </div>
          </div>

          {/* Skills Strengthened vs Needs Review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Strengthened Skills */}
            <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>مهارات تم تثبيتها في هذه الجلسة:</span>
              </div>
              <ul className="pr-5 list-disc marker:text-emerald-400 text-xs text-slate-300 space-y-1">
                {report.skillsStrengthened.length > 0 ? (
                  report.skillsStrengthened.map((s, idx) => <li key={idx}>{s}</li>)
                ) : (
                  <li>حل وتطبيق المبرهنات الأساسية في درس {report.topicTitle}</li>
                )}
              </ul>
            </div>

            {/* Needs Review Skills */}
            <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Target className="w-4 h-4" />
                <span>نقاط تستحق مراجعة سريعة:</span>
              </div>
              <ul className="pr-5 list-disc marker:text-amber-400 text-xs text-slate-300 space-y-1">
                {report.skillsNeedingReview.length > 0 ? (
                  report.skillsNeedingReview.map((s, idx) => <li key={idx}>{s}</li>)
                ) : (
                  <li>التحقق من إشارات السالب (-) وتفادي الاستعجال في الحساب</li>
                )}
              </ul>
            </div>
          </div>

          {/* Actionable Next Step: ما ننصحك به الآن */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-[#0F172A] border border-blue-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ما ننصحك به الآن 💡:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              لقد قمت بجهد ممتاز اليوم. لترسيخ هذه المعارف في الذاكرة طويلة المدى، ننصحك بأخذ استراحة قصيرة ثم حل تمرينين مشابهين في معمل الأخطاء لضمان العلامة الكاملة.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/error-lab"
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>الانتقال إلى معمل الأخطاء 🔬</span>
              </Link>

              <Link
                href="/curriculum"
                className="py-2 px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>مراجعة ملخص الدرس في المنهاج 📖</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            «وقل رب زدني علماً» — بالتوفيق في البكالوريا! 🇩🇿
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onStartNewSession && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartNewSession();
                }}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بدء جلسة جديدة 🚀</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق التقرير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
