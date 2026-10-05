"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  BookOpen,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Book } from "@/types/book";
import { getCategoryMeta, getSubjectMeta, LIBRARY_STREAMS } from "@/lib/constants/library";
import { BooksService } from "@/lib/services/books-service";

interface BookPreviewModalProps {
  book: Book;
  onClose: () => void;
  onDownloadTrack?: (bookId: string) => void;
}

export function BookPreviewModal({
  book,
  onClose,
  onDownloadTrack,
}: BookPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [downloads, setDownloads] = useState<number>(book.downloads_count || 0);

  const categoryMeta = getCategoryMeta(book.category);
  const subjectMeta = getSubjectMeta(book.subject) || {
    id: book.subject,
    label: "المادة المقررة",
    icon: "📚",
    group: "all" as const,
    groupLabel: "الكل",
  };

  const rawPdfUrl = book.file_url;

  // Continuous scrolling in-app PDF stream via proxy
  const proxyEmbedUrl = rawPdfUrl
    ? `/api/pdf/proxy?url=${encodeURIComponent(rawPdfUrl)}#view=FitH&pagemode=none`
    : "";

  const directDownloadUrl = rawPdfUrl
    ? `/api/pdf/proxy?url=${encodeURIComponent(rawPdfUrl)}&download=1&filename=${encodeURIComponent(
        `${book.title}.pdf`
      )}`
    : "";

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Non-blocking loading state: dismisses smoothly after 1.2s to prevent getting stuck
  useEffect(() => {
    setIframeLoaded(false);
    const timer = setTimeout(() => {
      setIframeLoaded(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [rawPdfUrl]);

  const handleDownload = async () => {
    setDownloads((prev) => prev + 1);
    try {
      await BooksService.incrementDownload(book.id);
      if (onDownloadTrack) onDownloadTrack(book.id);
    } catch {}
  };

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("search", book.title);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const streamLabels = book.streams
    .map((s) => LIBRARY_STREAMS.find((ls) => ls.id === s)?.label)
    .filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate" title={book.title}>
                {book.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5 flex-wrap">
                <span className="font-semibold text-emerald-400">{subjectMeta?.label}</span>
                <span>•</span>
                <span>{categoryMeta.badgeLabel}</span>
                <span>•</span>
                <span className="truncate max-w-[150px]">{book.author || "وزارة التربية الوطنية"}</span>
                {book.year_edition && (
                  <>
                    <span>•</span>
                    <span className="px-1.5 py-0.2 rounded bg-stone-700 text-stone-300 text-[10px]">
                      طبعة {book.year_edition}
                    </span>
                  </>
                )}
                {book.file_size && (
                  <>
                    <span>•</span>
                    <span className="text-[10px] text-stone-400">{book.file_size}</span>
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
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-stone-700 hover:bg-stone-800 text-stone-200 text-xs font-bold transition-all active:scale-98"
                title="تحميل ملف الـ PDF مباشرة"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">تحميل PDF ({downloads})</span>
              </a>
            ) : null}

            {/* Copy Share Link */}
            <button
              type="button"
              onClick={handleShare}
              title="مشاركة رابط الكتاب"
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

            {/* External Link */}
            {rawPdfUrl ? (
              <a
                href={rawPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="فتح الرابط الأصلي في نافذة مستقلة"
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer hidden sm:inline-flex"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}

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

        {/* PDF Viewer Body with Non-blocking Loading Indicator */}
        <div className="flex-1 w-full h-full relative bg-[#131416] overflow-hidden">
          {!rawPdfUrl ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm text-stone-300 font-bold">ملف الـ PDF قيد المزامنة والأرشفة في هذا المرجع</p>
              <p className="text-xs text-stone-500 max-w-md">
                يمكنك الاطلاع على المراجع الأخرى المتوفرة بالكامل أو المحاولة لاحقاً.
              </p>
            </div>
          ) : (
            <>
              {/* Sleek Floating Non-Blocking Loading Indicator */}
              {!iframeLoaded && (
                <div className="absolute top-4 start-1/2 -translate-x-1/2 z-20 pointer-events-none bg-stone-900/90 backdrop-blur-md text-white border border-stone-700/80 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>جاري فتح الكتاب...</span>
                </div>
              )}

              {/* Embedded In-App PDF Stream via Proxy with Full Page Scroll */}
              <iframe
                src={proxyEmbedUrl}
                title={book.title}
                className="w-full h-full border-0 block"
                onLoad={() => setIframeLoaded(true)}
              />
            </>
          )}
        </div>

        {/* Sub-bar: Streams list */}
        {streamLabels.length > 0 && (
          <div className="bg-[#181a1f] border-t border-stone-800 px-4 py-2 flex items-center justify-between gap-2 shrink-0 flex-wrap text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-200 text-[11px]">الشعب المعنية:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {streamLabels.map((sl, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-[11px] font-medium text-stone-300"
                  >
                    {sl}
                  </span>
                ))}
              </div>
            </div>

            {directDownloadUrl && (
              <a
                href={directDownloadUrl}
                download
                onClick={handleDownload}
                className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>تحميل مباشر</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
