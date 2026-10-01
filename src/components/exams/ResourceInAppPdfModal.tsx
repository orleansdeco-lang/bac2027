"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { UnifiedResourceExamItem } from "@/app/exams/terms/page";

interface ResourceInAppPdfModalProps {
  exam: UnifiedResourceExamItem;
  initialTab?: "subject" | "solution";
  onClose: () => void;
}

export function ResourceInAppPdfModal({
  exam,
  initialTab = "subject",
  onClose,
}: ResourceInAppPdfModalProps) {
  const [activeTab, setActiveTab] = useState<"subject" | "solution">(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Determine active PDF URL
  const subjectPdf = exam.pdf_links && exam.pdf_links.length > 0 ? exam.pdf_links[0] : exam.subjectPdfUrl;
  const hasSeparateSolutionFile = Boolean(exam.pdf_links && exam.pdf_links.length > 1);
  const solutionPdf = hasSeparateSolutionFile
    ? exam.pdf_links[1]
    : (exam.solutionPdfUrl && exam.solutionPdfUrl !== subjectPdf ? exam.solutionPdfUrl : subjectPdf);

  const hasSolution = Boolean(
    exam.has_solution ||
    hasSeparateSolutionFile ||
    (exam.title_ar && (exam.title_ar.includes("تصحيح") || exam.title_ar.includes("حل") || exam.title_ar.includes("الحل")))
  );
  const isCombinedFile = !hasSeparateSolutionFile && solutionPdf === subjectPdf;

  const rawPdfUrl = activeTab === "solution" && hasSeparateSolutionFile ? solutionPdf : subjectPdf;

  // Proxy URL with #view=FitH for continuous scrolling across all pages
  const proxyEmbedUrl = rawPdfUrl
    ? `/api/pdf/proxy?url=${encodeURIComponent(rawPdfUrl)}#view=FitH&pagemode=none`
    : "";

  const directDownloadUrl = rawPdfUrl
    ? `/api/pdf/proxy?url=${encodeURIComponent(rawPdfUrl)}&download=1&filename=${encodeURIComponent(
        `${exam.subject_name}_${exam.title_ar}.pdf`
      )}`
    : "";

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Non-blocking loading state: auto-dismisses after 1.2s to prevent getting stuck
  useEffect(() => {
    if (isCombinedFile && activeTab === "solution") {
      setIframeLoaded(true);
      return;
    }
    setIframeLoaded(false);
    const timer = setTimeout(() => {
      setIframeLoaded(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeTab, rawPdfUrl, isCombinedFile]);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={exam.title_ar}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex flex-col bg-[#1a1c20] text-white border border-stone-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? "w-full h-full fixed inset-0 rounded-none border-0"
            : "w-full max-w-6xl h-[92vh] max-h-[1050px]"
        }`}
      >
        {/* Top Header Bar */}
        <div className="bg-[#24272c] border-b border-stone-700/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
          {/* Title & Metadata */}
          <div className="flex items-center gap-2.5 min-w-0 max-w-full sm:max-w-xl">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate" title={exam.title_ar}>
                {exam.title_ar}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5 flex-wrap">
                <span className="font-semibold text-emerald-400">{exam.subject_name}</span>
                <span>•</span>
                <span>{exam.stream_name}</span>
                <span>•</span>
                <span>{exam.year ? `سنة ${exam.year}` : ""}</span>
                {exam.term && (
                  <>
                    <span>•</span>
                    <span className="px-1.5 py-0.2 rounded bg-stone-700 text-stone-300 text-[10px]">
                      فصل {exam.term}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ms-auto">
            {/* Direct Download Button */}
            {directDownloadUrl ? (
              <a
                href={directDownloadUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-stone-700 hover:bg-stone-800 text-stone-200 text-xs font-bold transition-all active:scale-98"
                title="تحميل ملف الـ PDF مباشرة"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">تحميل PDF</span>
              </a>
            ) : null}

            {/* Copy Share Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="مشاركة رابط الموضوع"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] hidden sm:inline">تم النسخ</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">مشاركة</span>
                </>
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer hidden sm:inline-flex"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="إغلاق العارض"
              className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Subject vs Solution Tabs */}
        {hasSolution && (
          <div className="bg-[#1f2125] border-b border-stone-800 px-4 py-2 flex items-center justify-between gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("subject")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "subject"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "bg-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>نص الموضوع (Sujet)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("solution")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "solution"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-stone-800 text-emerald-400 hover:text-emerald-300"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>التصحيح المعتمد (Corrigé)</span>
              </button>
            </div>

            {isCombinedFile && (
              <span className="text-[11px] text-stone-400 font-sans hidden md:inline">
                📄 الموضوع والتصحيح مدمجان في نفس الوثيقة — اسحب للأسفل لعرض كل الصفحات
              </span>
            )}
          </div>
        )}

        {/* Notice Banner for Combined File */}
        {isCombinedFile && activeTab === "solution" && (
          <div className="bg-emerald-950/70 border-b border-emerald-800/50 px-4 py-1.5 flex items-center gap-2 text-[11px] text-emerald-300 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>نموذج التصحيح وسلم التنقيط مرفق في الصفحات التالية من هذه الوثيقة (اسحب للأسفل).</span>
          </div>
        )}

        {/* PDF Viewer Body with Non-blocking Loading Indicator */}
        <div className="flex-1 w-full h-full relative bg-[#131416] overflow-hidden">
          {!rawPdfUrl ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm text-stone-300 font-bold">ملف الـ PDF قيد المزامنة والأرشفة في هذا الموضوع</p>
              <p className="text-xs text-stone-500 max-w-md">
                يمكنك الاطلاع على تفاصيل الموضوع الأخرى أو تجربة موضوع آخر متوفر بالكامل.
              </p>
            </div>
          ) : (
            <>
              {/* Sleek Floating Non-Blocking Loading Indicator */}
              {!iframeLoaded && (
                <div className="absolute top-4 start-1/2 -translate-x-1/2 z-20 pointer-events-none bg-stone-900/90 backdrop-blur-md text-white border border-stone-700/80 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>جاري فتح المستند...</span>
                </div>
              )}

              {/* Embedded In-App PDF Stream via Proxy with Full Page Scroll */}
              <iframe
                src={proxyEmbedUrl}
                title={exam.title_ar}
                className="w-full h-full border-0 block"
                onLoad={() => setIframeLoaded(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
