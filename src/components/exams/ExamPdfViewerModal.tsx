"use client";

import React, { useState, useEffect, useRef } from "react";
import { BacExamItem } from "@/data/exams";
import { getExamFullDetails, ExamFullDetails } from "@/data/exams/exam-details";
import {
  X,
  Printer,
  Share2,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  BookOpen,
  Layers,
  Sparkles,
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
  // Document tabs: "topic" | "solution"
  const [activeTab, setActiveTab] = useState<"topic" | "solution">(
    initialTab === "solution" ? "solution" : "topic"
  );

  // Selected topic: 1 (الموضوع الأول) | 2 (الموضوع الثاني)
  const [selectedTopicNum, setSelectedTopicNum] = useState<1 | 2>(1);

  // Pagination state: page 1 to 4 (like authentic 4-page BAC exam paper)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [continuousScroll, setContinuousScroll] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
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

  // Reset page number on tab or topic change
  useEffect(() => {
    if (activeTab === "topic") {
      setCurrentPage(selectedTopicNum === 1 ? 1 : 3);
    } else {
      setCurrentPage(1);
    }
  }, [activeTab, selectedTopicNum]);

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("examId", exam.id);
      url.searchParams.set("tab", activeTab);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentTopic = selectedTopicNum === 2 ? details.topic2 : details.topic1;
  const totalPages = activeTab === "solution" ? 2 : 4;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={exam.title_ar}
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 md:p-5 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex flex-col bg-[#202124] text-white border border-stone-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? "w-full h-full fixed inset-0 rounded-none border-0"
            : "w-full max-w-6xl h-[95vh] max-h-[1000px]"
        }`}
      >
        {/* ================================================================= */}
        {/* 1. TOP PDF TOOLBAR (Identical to Mozilla PDF.js in Image 2)        */}
        {/* ================================================================= */}
        <div className="print:hidden bg-[#2b2d30] border-b border-stone-700/80 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
          {/* Left: Document Info & Page Navigator */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-1.5 bg-[#1f2023] px-2.5 py-1 rounded-lg border border-stone-700 text-xs font-mono">
              <span className="text-stone-300 font-sans text-[11px] hidden sm:inline">صفحة</span>
              <span className="font-bold text-white">{currentPage}</span>
              <span className="text-stone-400">/</span>
              <span className="text-stone-400">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                title="الصفحة السابقة"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                title="الصفحة التالية"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Page Jump Pills */}
            <div className="hidden md:flex items-center gap-1 border-s border-stone-700 ps-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-6 h-6 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === pg
                      ? "bg-emerald-600 text-white shadow-sm font-black"
                      : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>

            <div className="hidden lg:block truncate text-xs text-stone-300 font-sans border-s border-stone-700 ps-3">
              <span className="font-bold text-white">{exam.title_ar}</span>
              <span className="text-stone-400 text-[11px] ms-1.5">
                ({details.streamName} • المعامل: {details.coefficient} • المدة: {details.durationLabel})
              </span>
            </div>
          </div>

          {/* Center: Zoom Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              title="تصغير (-)"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-mono text-stone-300 w-11 text-center select-none font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
              title="تكبير (+)"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              title="إعادة ضبط الحجم (100%)"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Actions (Print, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLink}
              title="مشاركة رابط الموضوع"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">مشاركة</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="طباعة وحفظ كـ PDF رسمي"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[11px]">طباعة A4</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer hidden sm:inline-flex"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="إغلاق النافذة"
              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SUB-BAR: TABS (Topic 1 vs Topic 2 vs Bareme)                   */}
        {/* ================================================================= */}
        <div className="print:hidden bg-[#1f2124] border-b border-stone-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("topic");
                setSelectedTopicNum(1);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "topic" && selectedTopicNum === 1
                  ? "bg-stone-100 text-stone-900 shadow-md scale-[1.02]"
                  : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>الموضوع الأول (Sujet 1)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("topic");
                setSelectedTopicNum(2);
                setCurrentPage(3);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "topic" && selectedTopicNum === 2
                  ? "bg-stone-100 text-stone-900 shadow-md scale-[1.02]"
                  : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>الموضوع الثاني (Sujet 2)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("solution");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "solution"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                  : "bg-stone-800/80 text-emerald-400 hover:text-emerald-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>التصحيح الوزاري وسلم التنقيط الرسمي</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setContinuousScroll(!continuousScroll)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                continuousScroll
                  ? "bg-stone-700 border-stone-500 text-white"
                  : "border-stone-700 text-stone-400 hover:text-white"
              }`}
            >
              {continuousScroll ? "عرض صفحة بصفحة" : "تصفح كل الصفحات معاً"}
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. DOCUMENT CANVAS (Charcoal Grey Reader + White A4 Exam Sheet)    */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto bg-[#383b40] p-3 sm:p-6 md:p-8 flex justify-center items-start">
          <div
            ref={sheetRef}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center top",
              transition: "transform 0.15s ease",
            }}
            className="w-full max-w-4xl space-y-8"
          >
            {/* If Continuous Scroll is OFF, render single current page */}
            {!continuousScroll ? (
              <ExamA4Sheet
                exam={exam}
                details={details}
                activeTab={activeTab}
                pageNumber={currentPage}
                totalPages={totalPages}
                selectedTopic={currentTopic}
                onJumpToPage={(p) => setCurrentPage(p)}
              />
            ) : (
              /* If Continuous Scroll is ON, render all pages sequentially */
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <ExamA4Sheet
                  key={pg}
                  exam={exam}
                  details={details}
                  activeTab={activeTab}
                  pageNumber={pg}
                  totalPages={totalPages}
                  selectedTopic={pg <= 2 ? details.topic1 : details.topic2}
                  onJumpToPage={(p) => setCurrentPage(p)}
                />
              ))
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. BOTTOM DOCKED TOOLBAR (Matching DzExams style in Image 2)       */}
        {/* ================================================================= */}
        <div className="print:hidden bg-[#24272b] border-t border-stone-700/80 px-4 py-2 flex items-center justify-between text-xs text-stone-300 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تحميل وطباعة الوثيقة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeTab === "topic") {
                  setActiveTab("solution");
                } else {
                  setActiveTab("topic");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeTab === "topic" ? "عرض نموذج الإجابة وسلم التنقيط" : "العودة إلى موضوع الامتحان"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-stone-400 text-[11px] font-mono">
            <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">الديوان الوطني للامتحانات والمسابقات</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 transition-all cursor-pointer"
            >
              الصفحة السابقة
            </button>
            <span className="font-mono text-xs font-bold text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 transition-all cursor-pointer"
            >
              الصفحة التالية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Single A4 Sheet Component (Authentic Algerian Exam Format)
 */
function ExamA4Sheet({
  exam,
  details,
  activeTab,
  pageNumber,
  totalPages,
  selectedTopic,
  onJumpToPage,
}: {
  exam: BacExamItem;
  details: ExamFullDetails;
  activeTab: "topic" | "solution";
  pageNumber: number;
  totalPages: number;
  selectedTopic: any;
  onJumpToPage: (p: number) => void;
}) {
  const isArabic = exam.subjectId === "arabic";

  return (
    <div className="bg-white text-stone-900 shadow-2xl rounded-xs border border-stone-300 w-full min-h-[980px] p-6 sm:p-10 flex flex-col justify-between select-text print:shadow-none print:border-0 print:p-0 print:m-0 print:min-h-0">
      {/* ------------------------------------------------------------- */}
      {/* 1. Official National Exam Header                              */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 pb-5 border-b-2 border-stone-800 text-center select-none">
        <div className="text-xs sm:text-sm font-black font-sans tracking-wide text-stone-900">
          الجمهورية الجزائرية الديمقراطية الشعبية
        </div>
        <div className="text-xs sm:text-sm font-bold text-stone-700 font-sans">
          وزارة التربية الوطنية — الديوان الوطني للامتحانات والمسابقات
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-stone-400 mt-3 text-xs font-bold text-stone-900">
          <span>امتحان شهادة البكالوريا: دورة {exam.year} {exam.session === "exceptional" ? "(دورة استثنائية)" : ""}</span>
          <span className="font-extrabold text-emerald-800">الشعبة: {details.streamName}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700 font-medium pt-1">
          <span>اختبار في مادة: <strong className="text-stone-900 font-bold">{details.subjectName}</strong></span>
          <span>المدة: <strong className="text-stone-900 font-bold">{details.durationLabel}</strong></span>
          <span>المعامل: <strong className="text-stone-900 font-bold">{details.coefficient}</strong></span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Sheet Body Content (Varies by Tab & Page Number)          */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 py-6 space-y-6">
        {activeTab === "solution" ? (
          /* =========================================================== */
          /* OFFICIAL MINISTERIAL BAREME & SOLUTION                      */
          /* =========================================================== */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-2">
              <h2 className="text-sm sm:text-base font-black text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>عناصر الإجابة النموذجية وسلم التنقيط الرسمي — شهادة البكالوريا {exam.year}</span>
              </h2>
              <span className="text-xs font-bold font-mono px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md">
                العلامة الكاملة: 20 / 20
              </span>
            </div>

            {/* Table of Criteria & Points */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border border-stone-400 border-collapse">
                <thead className="bg-stone-100 text-stone-900 font-bold border-b-2 border-stone-400">
                  <tr>
                    <th className="p-2.5 text-center w-16 border-e border-stone-300">رقم السؤال</th>
                    <th className="p-2.5 border-e border-stone-300">عناصر الإجابة النموذجية ومعايير التصحيح الوزاري</th>
                    <th className="p-2.5 text-center w-20 border-e border-stone-300">العلامة الجزئية</th>
                    <th className="p-2.5 text-center w-20">العلامة الكلية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300 font-sans">
                  {selectedTopic.exercises.map((exo: any) => (
                    <React.Fragment key={exo.id}>
                      <tr className="bg-stone-50 font-bold border-t border-b border-stone-300">
                        <td colSpan={3} className="p-2.5 border-e border-stone-300 text-stone-900 font-extrabold">
                          {exo.title}
                        </td>
                        <td className="p-2.5 text-center font-mono text-emerald-800 font-bold">
                          {exo.points ? `${exo.points.toFixed(2)} ن` : "—"}
                        </td>
                      </tr>
                      {exo.questions?.map((q: any) => (
                        <tr key={q.number} className="hover:bg-stone-50/80">
                          <td className="p-2.5 text-center font-bold border-e border-stone-300 text-stone-700">
                            {q.number}
                          </td>
                          <td className="p-2.5 border-e border-stone-300 text-stone-800 leading-relaxed">
                            {q.solutionText}
                          </td>
                          <td className="p-2.5 text-center font-mono border-e border-stone-300 text-stone-600">
                            {(q.points / 2).toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
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
        ) : (
          /* =========================================================== */
          /* AUTHENTIC TOPIC DOCUMENT (Poem/Text on Page 1, Questions on Page 2) */
          /* =========================================================== */
          <div className="space-y-6">
            {/* Topic Banner */}
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
              <h2 className="text-sm sm:text-base font-black text-stone-900">
                {selectedTopic.title}
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 border border-stone-400 bg-stone-100 rounded-sm">
                20 نقطة
              </span>
            </div>

            {/* Instruction Notice */}
            <div className="text-xs text-stone-600 italic">
              {selectedTopic.instruction}
            </div>

            {/* Exercises & Questions */}
            {selectedTopic.exercises.map((exo: any) => (
              <div key={exo.id} className="space-y-3">
                {exo.title && (
                  <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-stone-900 border-b border-stone-300 pb-1">
                    <span>{exo.title}</span>
                    {exo.points > 0 && (
                      <span className="font-mono text-stone-700">({exo.points} نقاط)</span>
                    )}
                  </div>
                )}

                {/* Poem / Passage Layout (Classical Arabic Balanced Columns) */}
                {exo.description && (
                  <div
                    className={`leading-relaxed text-stone-900 whitespace-pre-line text-xs sm:text-sm ${
                      isArabic
                        ? "p-4 bg-stone-50/50 rounded-lg border border-stone-200 font-serif leading-loose text-center sm:text-start"
                        : "font-sans leading-relaxed"
                    }`}
                  >
                    {exo.description}
                  </div>
                )}

                {/* Question List */}
                {exo.questions && exo.questions.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    {exo.questions.map((q: any) => (
                      <div key={q.number} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                        <span className="font-bold text-stone-900 shrink-0 font-mono">
                          {q.number}-
                        </span>
                        <div className="flex-1 font-sans">
                          {q.text}
                        </div>
                        {q.points > 0 && (
                          <span className="font-mono text-[11px] text-stone-600 font-bold shrink-0">
                            [{q.points} ن]
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Official Document Footer (Matching Image 2)                */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-4 mt-6 border-t-2 border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 select-none">
        <span className="font-sans font-bold text-stone-800">
          صفحة {pageNumber} من {totalPages}
        </span>

        <span className="text-[11px] font-sans text-stone-500 font-medium">
          {pageNumber < totalPages ? "اقلب الصفحة ➔" : "انتهى موضوع الاختبار"}
        </span>

        <span className="font-mono text-[11px] text-stone-500 font-semibold">
          www.onec.dz • www.dzexams.com
        </span>
      </div>
    </div>
  );
}
