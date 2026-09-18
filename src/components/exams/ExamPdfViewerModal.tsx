"use client";

import React, { useState, useEffect } from "react";
import { BacExamItem } from "@/data/exams";
import { getExamFullDetails, ExamFullDetails } from "@/data/exams/exam-details";
import {
  getExamPageImageUrl,
} from "@/lib/cloudinary";
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
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  AlertCircle,
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
  // Main view modes: "sheet" (Official Digital A4 Paper - Default & Reliable) | "photos" (Cloudinary Image pages)
  const [viewMode, setViewMode] = useState<"sheet" | "photos">("sheet");

  // Document tabs: "topic" | "solution"
  const [activeTab, setActiveTab] = useState<"topic" | "solution">(
    initialTab === "solution" ? "solution" : "topic"
  );

  // Sub-topic selection when in sheet mode: 1 | 2
  const [selectedTopicNum, setSelectedTopicNum] = useState<1 | 2>(1);

  // Photo gallery state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(4);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [photoError, setPhotoError] = useState<boolean>(false);
  const [photoLoading, setPhotoLoading] = useState<boolean>(true);

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
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [exam.id, activeTab]);

  // Reset page number on tab change
  useEffect(() => {
    setCurrentPage(1);
    setPhotoError(false);
    setPhotoLoading(true);
    setZoomLevel(1);
  }, [activeTab]);

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/exams?examId=${encodeURIComponent(exam.id)}&tab=${activeTab}`;
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

  const isSolution = activeTab === "solution";
  const currentImageUrl = getExamPageImageUrl(
    {
      year: exam.year,
      session: exam.session,
      streamId: exam.streamId,
      subjectId: exam.subjectId,
    },
    currentPage,
    isSolution
  );


  const currentTopic = selectedTopicNum === 2 ? details.topic2 : details.topic1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={exam.title_ar}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
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
        {/* 1. TOP HEADER & METRICS                                           */}
        {/* ================================================================= */}
        <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-theme bg-surface/95 backdrop-blur-sm shrink-0">
          {/* Left: Exam Identity */}
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

            {/* National Archive Direct Link (DzExams / ONEC) */}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(
                `موضوع ${activeTab === "solution" ? "تصحيح وسلم تنقيط" : ""} بكالوريا ${exam.year} ${details.subjectName} شعبة ${details.streamName} pdf site:dzexams.com OR site:onec.dz`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="البحث عن وثيقة الـ PDF الأصلية في الأرشيف الوطني (DzExams / ONEC)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-theme hover:border-[var(--color-primary)]/50 text-theme-text text-xs font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-theme-secondary" />
              <span className="hidden sm:inline text-[11px]">الأرشيف الوطني (PDF أصلي)</span>
            </a>

            {/* Print & A4 Save Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="طباعة الوثيقة الرسمية أو حفظها كـ PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[11px]">طباعة وحفظ A4</span>
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
        {/* 2. DUAL TABS: TOPIC VS SOLUTION + VIEW MODE SWITCHER              */}
        {/* ================================================================= */}
        <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 bg-card/60 border-b border-theme shrink-0">
          {/* Left: Document Tabs (Topic vs Solution) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("topic")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "topic"
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                  : "bg-surface text-theme-secondary hover:text-theme-text hover:bg-surface/80 border border-theme"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>موضوع الامتحان</span>
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
              <span>التصحيح الوزاري وسلم التنقيط</span>
            </button>
          </div>

          {/* Right: Display Mode Switcher (Digital Paper vs Scanned Photos) */}
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-2xl border border-theme self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("sheet")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "sheet"
                  ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-bold shadow-xs"
                  : "text-theme-secondary hover:text-theme-text"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ورقة الامتحان الرسمية (منسقة)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("photos")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "photos"
                  ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-bold shadow-xs"
                  : "text-theme-secondary hover:text-theme-text"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>النسخة الممسوحة ضوئياً</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. VIEWPORT CONTENT                                               */}
        {/* ================================================================= */}
        {viewMode === "photos" ? (
          /* =============================================================== */
          /* PHOTO PAGES VIEWER WITH CLEAN IN-PLACE FALLBACK                 */
          /* =============================================================== */
          <div className="flex-1 bg-stone-950 flex flex-col overflow-hidden relative select-none">
            {/* Gallery Top Navigation Toolbar */}
            <div className="py-2.5 px-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs text-white shrink-0 z-10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-300">الصفحة:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pg);
                        setPhotoLoading(true);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === pg
                          ? "bg-[var(--color-primary)] text-white shadow-sm scale-105"
                          : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  title="تصغير"
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-stone-400 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  title="تكبير"
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  title="إعادة ضبط الحجم"
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Photo Canvas Area */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 bg-stone-950 relative">
              {photoError ? (
                <div className="max-w-md mx-auto p-6 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-4 my-auto animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white font-sans">
                      النسخة الممسوحة غير متوفرة بالسحابة حالياً
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed font-sans">
                      يمكنك تصفح ورقة الامتحان المنسقة فوراً بجميع تمارينها وسلم التنقيط، أو فتح النسخة الممسوحة مباشرة من الأرشيف الوطني الرسمي.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("sheet")}
                      className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer font-sans"
                    >
                      الانتقال إلى ورقة الامتحان المنسقة (فورية وخفيفة)
                    </button>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        `موضوع ${activeTab === "solution" ? "تصحيح وسلم تنقيط" : ""} بكالوريا ${exam.year} ${details.subjectName} شعبة ${details.streamName} pdf site:dzexams.com OR site:onec.dz`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 font-sans"
                    >
                      <span>فتح في الأرشيف الوطني (DzExams / ONEC)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {photoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs z-10">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
                        <span className="text-xs text-stone-300 font-sans">
                          جاري تحميل الصفحة {currentPage}...
                        </span>
                      </div>
                    </div>
                  )}

                  <img
                    src={currentImageUrl}
                    alt={`${exam.title_ar} - صفحة ${currentPage}`}
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center top" }}
                    onLoad={() => setPhotoLoading(false)}
                    onError={() => {
                      setPhotoLoading(false);
                      setPhotoError(true);
                    }}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-150 border border-stone-800"
                  />
                </>
              )}
            </div>

            {/* Gallery Bottom Navigation Footer */}
            <div className="py-2.5 px-4 bg-stone-900/90 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 shrink-0">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  setPhotoLoading(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الصفحة السابقة</span>
              </button>

              <span className="font-mono text-[11px] text-stone-400">
                صفحة {currentPage} من {maxPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= maxPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(maxPages, p + 1));
                  setPhotoLoading(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>الصفحة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* STRUCTURED DIGITAL EXAM PAPER (100% RELIABLE & ZERO ERROR BANNERS) */
          /* =============================================================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-canvas text-theme-text select-text">
            <div className="max-w-4xl mx-auto space-y-6 bg-surface p-6 sm:p-10 rounded-3xl border border-theme shadow-clay print:p-0 print:border-0 print:shadow-none">
              {/* National Header */}
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

                {activeTab === "topic" && (
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTopicNum(1)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTopicNum === 1
                          ? "bg-[var(--color-primary)] text-white shadow-sm"
                          : "bg-card text-theme-secondary border border-theme hover:text-theme-text"
                      }`}
                    >
                      الموضوع الأول (Sujet 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTopicNum(2)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTopicNum === 2
                          ? "bg-[var(--color-primary)] text-white shadow-sm"
                          : "bg-card text-theme-secondary border border-theme hover:text-theme-text"
                      }`}
                    >
                      الموضوع الثاني (Sujet 2)
                    </button>
                  </div>
                )}
              </div>

              {/* Main Sheet Body */}
              {activeTab === "solution" ? (
                /* OFFICIAL BAREME & SOLUTION */
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

                  {[details.topic1, details.topic2].map((top) => (
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
                /* EXAM TOPIC QUESTIONS */
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

              {/* Sheet Bottom Footer */}
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
        )}
      </div>
    </div>
  );
}
