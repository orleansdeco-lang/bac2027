"use client";

import React, { useState, useEffect, useRef } from "react";
import { BacExamItem } from "@/data/exams";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import {
  X,
  Download,
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
  AlertCircle,
  Copy,
  Check,
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
  const [activeTab, setActiveTab] = useState<"subject" | "solution">(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const subjectMeta = ALL_SUBJECTS[exam.subjectId];
  const streamMeta = ALGERIAN_BAC_STREAMS[exam.streamId];

  const currentPdfUrl = activeTab === "subject" ? exam.subjectPdfUrl : exam.solutionPdfUrl;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Sync tab change with query params for deep-link
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("examId", exam.id);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [exam.id, activeTab]);

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
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.print();
        return;
      } catch {
        // Cross-origin fallback
      }
    }
    window.open(currentPdfUrl, "_blank");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentPdfUrl;
    link.download = `${exam.id}-${activeTab}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Docs viewer embed url as a high-compatibility fallback
  const googleViewerEmbedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(currentPdfUrl)}&embedded=true`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={exam.title_ar}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex flex-col bg-surface border border-theme rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? "w-full h-full fixed inset-0 rounded-none border-0"
            : "w-full max-w-5xl h-[92vh] max-h-[950px]"
        }`}
      >
        {/* ================================================================= */}
        {/* MODAL HEADER                                                      */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-theme bg-surface/90 backdrop-blur-sm shrink-0">
          {/* Left: Exam Info & Tags */}
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-sans">
                    دورة استثنائية
                  </span>
                )}
              </div>
              <p className="text-[11px] text-theme-secondary mt-0.5 truncate font-sans">
                {streamMeta?.name_ar} • {subjectMeta?.name_ar} • المعامل: {exam.coefficient} • المدة: {Math.floor((exam.durationMinutes || 210) / 60)} سا {(exam.durationMinutes || 210) % 60 > 0 ? `${(exam.durationMinutes || 210) % 60} د` : ""}
              </p>
            </div>
          </div>

          {/* Right: Toolbar Controls */}
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

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="طباعة الوثيقة"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">طباعة</span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              title="تحميل بصيغة PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[11px]">تحميل PDF</span>
            </button>

            {/* Open in New Tab */}
            <a
              href={currentPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="فتح في نافذة مستقلة"
              className="p-1.5 sm:p-2 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-all cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

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
        {/* DUAL TABS: TOPIC VS OFFICIAL CORRECTION                           */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-card/60 border-b border-theme shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("subject");
                setIframeError(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "subject"
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                  : "bg-surface text-theme-secondary hover:text-theme-text hover:bg-surface/80 border border-theme"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>موضوع الامتحان (الموضوعان 1 و 2)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("solution");
                setIframeError(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "solution"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "bg-surface text-theme-secondary hover:text-theme-text hover:bg-surface/80 border border-theme"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>التصحيح الوزاري وسلم التنقيط</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-theme-muted font-sans">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>وثيقة رسمية صادرة عن الديوان الوطني للامتحانات والمسابقات (ONEC)</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* PDF VIEWPORT (RESPONSIVE IFRAME + FALLBACK CARD)                  */}
        {/* ================================================================= */}
        <div className="relative flex-1 bg-stone-900 overflow-hidden flex flex-col">
          {iframeError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base font-bold">معاينة الوثيقة عبر المتصفح</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  يتطلب متصفحك أو جهازك فتح الوثيقة في نافذة خارجية أو تحميلها مباشرة للاطلاع على الملف بصيغة PDF بجودة عالية.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={currentPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-lg hover:opacity-90"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح الوثيقة في نافذة كاملة</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الملف الآن</span>
                </button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={currentPdfUrl}
              title={exam.title_ar}
              className="w-full h-full border-0 bg-white"
              onError={() => setIframeError(true)}
            />
          )}

          {/* Quick Notice Bar at Bottom */}
          <div className="py-2 px-4 bg-stone-950/90 text-stone-400 text-[10px] flex items-center justify-between border-t border-stone-800">
            <span className="font-mono">
              الملف: {exam.id}-{activeTab}.pdf
            </span>
            <div className="flex items-center gap-3">
              <span>للتقريب أو البحث، اضغط Ctrl + F أو استخدم أزرار عارض PDF.</span>
              <button
                type="button"
                onClick={() => setIframeError(!iframeError)}
                className="text-stone-300 underline hover:text-white"
              >
                {iframeError ? "إعادة المحاولة داخل الصفحة" : "مشكلة في العرض؟"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
