"use client";

import React, { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { getCategoryMeta, getSubjectMeta, LIBRARY_STREAMS } from "@/lib/constants/library";
import { BooksService } from "@/lib/services/books-service";
import {
  X,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  BookOpen,
  FileText,
  ExternalLink,
  Check,
  User,
  GraduationCap,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";

interface BookPreviewModalProps {
  book: Book;
  onClose: () => void;
  onDownloadTrack?: (bookId: string) => void;
}

export function BookPreviewModal({ book, onClose, onDownloadTrack }: BookPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [downloads, setDownloads] = useState<number>(book.downloads_count);

  const categoryMeta = getCategoryMeta(book.category);
  const subjectMeta = getSubjectMeta(book.subject);

  // Keyboard navigation: Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle download tracking
  const handleDownload = async () => {
    setDownloads((prev) => prev + 1);
    try {
      await BooksService.incrementDownload(book.id);
      if (onDownloadTrack) onDownloadTrack(book.id);
    } catch {}
  };

  // Share handler
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/library?search=${encodeURIComponent(book.title)}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  // Determine proxy URL or direct URL
  const proxyEmbedUrl = book.file_url
    ? `/api/pdf/proxy?url=${encodeURIComponent(book.file_url)}#view=FitH&pagemode=none`
    : "";

  const directDownloadUrl = book.file_url
    ? `/api/pdf/proxy?url=${encodeURIComponent(book.file_url)}&download=1&filename=${encodeURIComponent(
        `${book.title}_${book.author || "مرجع"}.pdf`
      )}`
    : book.file_url;

  // Stream labels
  const streamLabels = book.streams
    .map((s) => LIBRARY_STREAMS.find((ls) => ls.id === s)?.label)
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className={`relative flex flex-col bg-card border border-theme rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-5xl h-[92vh] max-h-[900px]"
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-theme bg-surface/50 backdrop-blur-sm gap-3">
          {/* Right Info: Cover & Title */}
          <div className="flex items-center gap-3 min-w-0">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-10 h-13 object-cover rounded-lg border border-theme shadow-xs shrink-0 hidden sm:block"
              />
            ) : (
              <div className="w-10 h-13 rounded-lg bg-surface border border-theme flex items-center justify-center shrink-0 hidden sm:flex">
                <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${categoryMeta.badgeClasses}`}
                >
                  {categoryMeta.badgeLabel}
                </span>
                {book.file_size && (
                  <span className="text-[11px] font-mono text-theme-muted bg-surface px-1.5 py-0.2 rounded border border-theme/60">
                    {book.file_size}
                  </span>
                )}
                {book.year_edition && (
                  <span className="text-[11px] font-mono text-theme-muted hidden md:inline">
                    طبعة {book.year_edition}
                  </span>
                )}
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-theme-text truncate" title={book.title}>
                {book.title}
              </h2>
              <p className="text-[11px] text-theme-muted truncate">
                المؤلف: <strong className="text-theme-secondary">{book.author || "وزارة التربية / المرجع المعتمد"}</strong>
              </p>
            </div>
          </div>

          {/* Left Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-theme bg-surface hover:bg-card-hover text-theme-text text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="مشاركة الرابط"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "تم النسخ" : "مشاركة"}</span>
            </button>

            {/* Direct Download */}
            <a
              href={directDownloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[var(--color-primary)]/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ({downloads})</span>
            </a>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl border border-theme bg-surface hover:bg-card-hover text-theme-text transition-all cursor-pointer hidden md:flex"
              title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-theme bg-surface hover:bg-rose-500 hover:text-white text-theme-muted transition-all cursor-pointer"
              title="إغلاق (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Secondary Banner: Stream Details */}
        <div className="px-4 sm:px-6 py-2 bg-surface/40 border-b border-theme/60 flex items-center justify-between text-xs text-theme-muted">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="font-semibold text-theme-secondary shrink-0">الشعب المعنية:</span>
            {streamLabels.map((sl, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-card border border-theme text-[11px] font-medium shrink-0"
              >
                {sl}
              </span>
            ))}
          </div>

          <a
            href={book.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)] hover:underline shrink-0"
          >
            <span>فتح في نافذة مستقلة</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Modal Body: Embedded PDF / Viewer */}
        <div className="relative flex-1 bg-slate-900 overflow-hidden flex flex-col">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white z-10 gap-3">
              <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-300 font-sans">
                جاري إعداد عارض الـ PDF عالي الدقة للمرجع...
              </p>
            </div>
          )}

          <iframe
            src={proxyEmbedUrl}
            title={book.title}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
          />

          {/* Bottom Fallback Helper */}
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 px-4 flex items-center justify-between gap-3 text-white text-xs z-10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="hidden sm:inline">إذا واجهت بطء في المعاينة بسبب حجم الكتاب ({book.file_size}):</span>
              <span className="sm:hidden">حجم الملف: {book.file_size}</span>
            </div>
            <a
              href={book.file_url}
              download
              onClick={handleDownload}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل مباشر</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
