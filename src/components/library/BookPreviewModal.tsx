"use client";

import React, { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { getCategoryMeta, getSubjectMeta, LIBRARY_STREAMS } from "@/lib/constants/library";
import { BooksService } from "@/lib/services/books-service";
import { BookA4Reader } from "./BookA4Reader";
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
  Printer,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from "lucide-react";

interface BookPreviewModalProps {
  book: Book;
  onClose: () => void;
  onDownloadTrack?: (bookId: string) => void;
}

export function BookPreviewModal({ book, onClose, onDownloadTrack }: BookPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"reader" | "google">("reader");
  const [downloads, setDownloads] = useState<number>(book.downloads_count);

  const totalPages = 3;
  const categoryMeta = getCategoryMeta(book.category);
  const subjectMeta = getSubjectMeta(book.subject) || {
    id: book.subject,
    label: "المادة المقررة",
    icon: "📚",
    group: "all" as const,
    groupLabel: "الكل",
  };

  // Keyboard navigation: Close on Escape, arrows for pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && viewMode === "reader") {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      } else if (e.key === "ArrowRight" && viewMode === "reader") {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, viewMode]);

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

  const handlePrint = () => {
    window.print();
  };

  const googleEmbedUrl = book.file_url
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(book.file_url)}&embedded=true`
    : "";

  // Stream labels
  const streamLabels = book.streams
    .map((s) => LIBRARY_STREAMS.find((ls) => ls.id === s)?.label)
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      dir="rtl"
    >
      <div
        className={`relative flex flex-col bg-[#1e2229] border border-stone-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-6xl h-[94vh] max-h-[960px]"
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. TOP MAIN HEADER                                                        */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-stone-700/80 bg-[#16181d] text-white gap-3 select-none">
          {/* Right: Book Identity & Metadata */}
          <div className="flex items-center gap-3 min-w-0">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-9 h-12 object-cover rounded-md border border-stone-600 shadow-xs shrink-0 hidden sm:block"
              />
            ) : (
              <div className="w-9 h-12 rounded-md bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center shrink-0 hidden sm:flex text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${categoryMeta.badgeClasses}`}>
                  {categoryMeta.badgeLabel}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800">
                  {subjectMeta.label}
                </span>
                {book.file_size && (
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-800 px-1.5 py-0.2 rounded border border-stone-700 hidden sm:inline">
                    {book.file_size}
                  </span>
                )}
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate" title={book.title}>
                {book.title}
              </h2>
              <p className="text-[11px] text-stone-400 truncate">
                المؤلف: <strong className="text-stone-200">{book.author || "وزارة التربية الوطنية"}</strong>
              </p>
            </div>
          </div>

          {/* Left: Actions (Share, Download, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="مشاركة الرابط"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? "تم النسخ" : "مشاركة"}</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex"
              title="طباعة المرجع"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">طباعة</span>
            </button>

            {/* Direct Download */}
            <a
              href={book.file_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل المرجع ({downloads})</span>
            </a>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer hidden md:flex"
              title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-rose-600 hover:text-white text-stone-400 transition-all cursor-pointer"
              title="إغلاق (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SECONDARY CONTROLS BAR: PAGE JUMP, ZOOM, MODE SWITCHER                */}
        {/* ========================================================================= */}
        <div className="px-3 sm:px-6 py-2 bg-[#252830] border-b border-stone-700/80 flex flex-wrap items-center justify-between gap-2.5 text-xs text-stone-300 select-none">
          {/* Reader Mode Selector */}
          <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-700">
            <button
              type="button"
              onClick={() => setViewMode("reader")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "reader"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>قارئ المنصة الذكي (A4)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("google")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "google"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>عارض Google Docs</span>
            </button>
          </div>

          {/* Interactive Page Navigation & Zoom (Active in Reader Mode) */}
          {viewMode === "reader" ? (
            <div className="flex items-center gap-3">
              {/* Page Selector Pills */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 transition-colors cursor-pointer"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 font-mono text-xs font-bold bg-stone-900 px-2 py-1 rounded-lg border border-stone-700">
                  <span className="text-emerald-400">صفحة {currentPage}</span>
                  <span className="text-stone-500">/</span>
                  <span className="text-stone-400">{totalPages}</span>
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 transition-colors cursor-pointer"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Jump Tabs */}
              <div className="hidden lg:flex items-center gap-1 border-s border-stone-700 ps-3">
                {[
                  { p: 1, label: "1. الغلاف والفهرس" },
                  { p: 2, label: "2. الملخص والقواعد" },
                  { p: 3, label: "3. خطة المراجعة" },
                ].map((item) => (
                  <button
                    key={item.p}
                    type="button"
                    onClick={() => setCurrentPage(item.p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      currentPage === item.p
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-1 border-s border-stone-700 ps-3">
                <button
                  type="button"
                  disabled={zoomLevel <= 0.8}
                  onClick={() => setZoomLevel((z) => Math.max(0.8, +(z - 0.1).toFixed(1)))}
                  className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-stone-300 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  disabled={zoomLevel >= 1.4}
                  onClick={() => setZoomLevel((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))}
                  className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline px-2.5 py-1 rounded-lg border border-stone-700 bg-stone-800"
              >
                <span>فتح الرابط الأصلي في نافذة مستقلة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. DOCUMENT BODY (INTERACTIVE A4 READER OR GOOGLE VIEWER)                */}
        {/* ========================================================================= */}
        <div className="relative flex-1 bg-[#14161a] overflow-y-auto p-3 sm:p-6 flex flex-col items-center">
          {viewMode === "reader" ? (
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center top",
                transition: "transform 0.12s ease",
              }}
              className="w-full max-w-4xl"
            >
              <BookA4Reader
                book={book}
                pageNumber={currentPage}
                totalPages={totalPages}
                onJumpToPage={(p) => setCurrentPage(p)}
              />
            </div>
          ) : (
            <iframe
              key={`google-${book.id}`}
              src={googleEmbedUrl}
              title={book.title}
              className="w-full h-full border-0 rounded-xl bg-white shadow-2xl"
            />
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM FOOTER BAR                                                      */}
        {/* ========================================================================= */}
        <div className="bg-[#181a1f] border-t border-stone-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-200">الشعب المعنية:</span>
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

          <div className="flex items-center gap-3">
            <a
              href={book.file_url}
              download
              onClick={handleDownload}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs inline-flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل نسخة الـ PDF كاملة</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
