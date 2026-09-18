"use client";

import React, { useState, useEffect, useRef } from "react";
import { BacExamItem } from "@/data/exams";
import { getExamFullDetails, ExamFullDetails, ExamExerciseItem } from "@/data/exams/exam-details";
import {
  X,
  Printer,
  Share2,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Award,
  Check,
  Download,
  BookOpen,
  ChevronDown,
  Info,
} from "lucide-react";

interface ExamPdfViewerModalProps {
  exam: BacExamItem;
  initialTab?: "subject" | "solution";
  onClose: () => void;
}

export function ExamPdfViewerModal({
  exam,
  initialTab = "subject",
  onClose,
}: ExamPdfViewerModalProps) {
  // Tabs: "topic1" | "topic2" | "solution"
  const [activeTab, setActiveTab] = useState<"topic1" | "topic2" | "solution">(
    initialTab === "solution" ? "solution" : "topic1"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const details: ExamFullDetails = getExamFullDetails(exam);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Sync URL query params for deep-link
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("examId", exam.id);
    url.searchParams.set("tab", activeTab === "solution" ? "solution" : "subject");
    window.history.replaceState({}, "", url.toString());
  }, [exam.id, activeTab]);

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/exams?examId=${encodeURIComponent(exam.id)}&tab=${activeTab === "solution" ? "solution" : "subject"}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentTopic = activeTab === "topic2" ? details.topic2 : details.topic1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={exam.title_ar}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex flex-col bg-surface border border-theme rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? "w-full h-full fixed inset-0 rounded-none border-0"
            : "w-full max-w-5xl h-[94vh] max-h-[960px]"
        }`}
      >
        {/* ================================================================= */}
        {/* 1. TOP MODAL HEADER & CONTROLS (SCREEN ONLY)                      */}
        {/* ================================================================= */}
        <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-theme bg-surface/95 backdrop-blur-sm shrink-0">
          {/* Left: Title & Metadata */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-theme-text truncate font-sans">
                  {exam.title_ar}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 font-mono">
                  {exam.year}
                </span>
                {exam.session === "exceptional" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    دورة استثنائية
                  </span>
                )}
              </div>
              <p className="text-[11px] text-theme-secondary mt-0.5 truncate font-sans">
                {details.streamName} • {details.subjectName} • المعامل: {details.coefficient} • المدة: {details.durationLabel}
              </p>
            </div>
          </div>

          {/* Right: Actions Toolbar */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Share Deep-Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="مشاركة رابط الامتحان"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 text-[11px]">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">مشاركة</span>
                </>
              )}
            </button>

            {/* Print & PDF Export Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="طباعة الوثيقة الرسمية أو حفظها كـ PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ PDF</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
              className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-all cursor-pointer shadow-xs"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="إغلاق"
              className="p-1.5 sm:p-2 rounded-xl border border-theme bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. DUAL TABS: SUJET 1, SUJET 2, CORRIGÉ BAREME (SCREEN ONLY)      */}
        {/* ================================================================= */}
        <div className="print:hidden flex items-center justify-between px-4 sm:px-6 py-2.5 bg-card/60 border-b border-theme shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("topic1")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "topic1"
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                  : "bg-surface text-theme-secondary hover:text-theme-text hover:bg-surface/80 border border-theme"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الموضوع الأول (Sujet 1)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("topic2")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "topic2"
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                  : "bg-surface text-theme-secondary hover:text-theme-text hover:bg-surface/80 border border-theme"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الموضوع الثاني (Sujet 2)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("solution")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "solution"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "bg-surface text-theme-secondary hover:text-theme-text hover:bg-surface/80 border border-theme"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>التصحيح النموذجي وسلم التنقيط الرسمي</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-theme-muted font-sans shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>نظام الامتحان الوطني الرسمي — مطابقة 100% للمنهاج</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. AUTHENTIC EXAMINATION PAPER CONTAINER                          */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-canvas text-theme-text select-text">
          <div className="max-w-4xl mx-auto space-y-6 bg-surface p-6 sm:p-10 rounded-3xl border border-theme shadow-clay print:p-0 print:border-0 print:shadow-none">
            
            {/* National Header of Algerian Baccalaureate */}
            <div className="text-center border-b-2 border-theme pb-5 space-y-2">
              <div className="text-xs sm:text-sm font-black font-sans tracking-wide text-theme-text">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>
              <div className="text-xs sm:text-sm font-bold text-theme-secondary font-sans">
                وزارة التربية الوطنية — الديوان الوطني للامتحانات والمسابقات
              </div>
              
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-theme mt-3 text-xs font-bold text-theme-text">
                <span>امتحان شهادة البكالوريا: دورة {exam.year} {exam.session === "exceptional" ? "(دورة استثنائية)" : ""}</span>
                <span>الشعبة: {details.streamName}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-theme-secondary font-medium">
                <span>اختبار في مادة: <strong className="text-theme-text">{details.subjectName}</strong></span>
                <span>المدة: <strong className="text-theme-text">{details.durationLabel}</strong></span>
                <span>المعامل: <strong className="text-theme-text">{details.coefficient}</strong></span>
              </div>

              <div className="mt-2 py-1 px-3 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 inline-block font-sans">
                {activeTab === "solution"
                  ? "عناصر الإجابة النموذجية الرسمية وسلم التنقيط المعتمد من المفتشية العامة للبيداغوجيا"
                  : "على المترشح أن يختار أحد الموضوعين الآتيين"}
              </div>
            </div>

            {/* TAB CONTENT: TOPIC 1 / TOPIC 2 / OFFICIAL SOLUTION */}
            {activeTab === "solution" ? (
              /* ========================================================= */
              /* OFFICIAL CORRECTION & MARKING SCALE (BARÈME)              */
              /* ========================================================= */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-theme pb-3">
                  <h2 className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>التصحيح النموذجي وسلم التنقيط المفصل لشهادة البكالوريا {exam.year}</span>
                  </h2>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    العلامة الكاملة: 20 / 20
                  </span>
                </div>

                {/* Combined Exercises Grading Scheme */}
                {[details.topic1, details.topic2].map((top, topIdx) => (
                  <div key={top.topicNumber} className="space-y-4 pt-2">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      سلم تنقيط {top.title}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-start border border-theme rounded-2xl overflow-hidden">
                        <thead className="bg-card text-theme-text font-bold border-b border-theme">
                          <tr>
                            <th className="p-2.5 text-center w-16 border-e border-theme">رقم السؤال</th>
                            <th className="p-2.5 border-e border-theme">عناصر الإجابة النموذجية ومعايير التصحيح الوزاري</th>
                            <th className="p-2.5 text-center w-20 border-e border-theme">العلامة الجزئية</th>
                            <th className="p-2.5 text-center w-20">العلامة الكلية</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-theme">
                          {top.exercises.map((exo) => (
                            <React.Fragment key={exo.id}>
                              <tr className="bg-card/40 font-bold">
                                <td colSpan={3} className="p-2.5 border-e border-theme text-theme-text">
                                  {exo.title}
                                </td>
                                <td className="p-2.5 text-center font-mono text-emerald-600 font-bold">
                                  {exo.points.toFixed(2)} ن
                                </td>
                              </tr>
                              {exo.questions.map((q) => (
                                <tr key={q.number} className="hover:bg-surface/50">
                                  <td className="p-2.5 text-center font-bold border-e border-theme text-theme-secondary">
                                    {q.number}
                                  </td>
                                  <td className="p-2.5 border-e border-theme text-theme-text leading-relaxed font-sans">
                                    {q.solutionText}
                                  </td>
                                  <td className="p-2.5 text-center font-mono border-e border-theme text-theme-secondary">
                                    {(q.points / 2).toFixed(2)}
                                  </td>
                                  <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                                    {q.points.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ========================================================= */
              /* EXAM QUESTIONS PAPER (TOPIC 1 OR TOPIC 2)                 */
              /* ========================================================= */
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-theme pb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-theme-text">
                      {currentTopic.title}
                    </h2>
                    <p className="text-xs text-theme-secondary mt-0.5">
                      {currentTopic.instruction}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-card border border-theme text-theme-text">
                    مجموع النقاط: 20 نقطة
                  </span>
                </div>

                {/* Exercises list */}
                {currentTopic.exercises.map((exo) => (
                  <div key={exo.id} className="space-y-3.5 p-5 rounded-2xl bg-card/40 border border-theme">
                    <div className="flex items-center justify-between border-b border-theme/60 pb-2">
                      <h3 className="text-sm font-bold text-theme-text">
                        {exo.title}
                      </h3>
                      <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                        ({exo.points} نقاط)
                      </span>
                    </div>

                    <p className="text-xs text-theme-text leading-relaxed whitespace-pre-line font-sans">
                      {exo.description}
                    </p>

                    <div className="space-y-3 pt-2">
                      {exo.questions.map((q) => (
                        <div key={q.number} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-theme/70">
                          <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold flex items-center justify-center shrink-0">
                            {q.number}
                          </span>
                          <div className="flex-1 text-xs text-theme-text leading-relaxed">
                            {q.text}
                          </div>
                          <span className="text-[11px] font-mono text-theme-muted shrink-0 font-bold">
                            [{q.points} ن]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ministry Footer Notice on Examination Sheet */}
            <div className="pt-6 mt-8 border-t-2 border-theme flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-theme-secondary">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-theme-muted" />
                <span>الصفحة 1 من 1 • الديوان الوطني للامتحانات والمسابقات</span>
              </div>
              <span className="font-bold text-theme-text">
                انتهى موضوع الاختبار
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
