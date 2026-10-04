"use client";

import React, { useState } from "react";
import { Book } from "@/types/book";
import { getCategoryMeta, LIBRARY_STREAMS, getSubjectMeta } from "@/lib/constants/library";
import { BooksService } from "@/lib/services/books-service";
import {
  Download,
  Eye,
  BookOpen,
  Share2,
  Check,
  Star,
  FileText,
  User,
  Layers,
  Sparkles,
} from "lucide-react";

interface BookCardProps {
  book: Book;
  onPreview: (book: Book) => void;
  onDownloadTrack?: (bookId: string) => void;
}

export function BookCard({ book, onPreview, onDownloadTrack }: BookCardProps) {
  const [downloads, setDownloads] = useState<number>(book.downloads_count);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const categoryMeta = getCategoryMeta(book.category);
  const subjectMeta = getSubjectMeta(book.subject);

  const handleDownload = async (e: React.MouseEvent) => {
    // Increment local state immediately
    setDownloads((prev) => prev + 1);
    setIsDownloading(true);

    try {
      await BooksService.incrementDownload(book.id);
      if (onDownloadTrack) onDownloadTrack(book.id);
    } catch {}

    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/library?search=${encodeURIComponent(book.title)}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  // Get readable stream labels
  const streamLabels = book.streams
    .map((s) => LIBRARY_STREAMS.find((ls) => ls.id === s)?.label)
    .filter(Boolean);

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-theme bg-card hover:border-[var(--color-primary)]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-primary)]/5"
      dir="rtl"
    >
      <div>
        {/* Cover Preview Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface flex items-center justify-center border-b border-theme/60">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-theme-muted">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-theme flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-[var(--color-primary)] opacity-70" />
              </div>
              <span className="text-xs font-semibold">{subjectMeta?.label || "مرجع تعليمي"}</span>
            </div>
          )}

          {/* Gradient Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1 pointer-events-none">
            {/* Category Badge */}
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md shadow-xs flex items-center gap-1 ${categoryMeta.badgeClasses}`}
            >
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.badgeLabel}</span>
            </span>

            {/* Featured Badge */}
            {book.is_featured && (
              <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-extrabold shadow-sm flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-current" />
                <span>مميز</span>
              </span>
            )}
          </div>

          {/* Share Button Overlay */}
          <button
            type="button"
            onClick={handleShare}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
            title="نسخ رابط المرجع"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Bottom Overlay Info (File Size & Year & Pages) */}
          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-white text-[11px] font-mono">
            {book.file_size && (
              <span className="rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/10 font-bold">
                {book.file_size}
              </span>
            )}

            <div className="flex items-center gap-1">
              {book.year_edition && (
                <span className="rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/10">
                  {book.year_edition}
                </span>
              )}
              {book.pages_count && (
                <span className="rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/10 hidden sm:inline-block">
                  {book.pages_count} ص
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3
            className="font-bold text-sm sm:text-base text-theme-text leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors min-h-[2.75rem]"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author & Subject */}
          <div className="flex items-center justify-between text-xs text-theme-muted gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 text-theme-muted shrink-0" />
              <span className="truncate font-semibold text-theme-secondary">
                {book.author || "وزارة التربية / هيئة التحرير"}
              </span>
            </div>

            {subjectMeta && (
              <span className="shrink-0 text-[11px] font-medium text-theme-muted px-2 py-0.5 rounded-md bg-surface border border-theme">
                {subjectMeta.icon} {subjectMeta.label}
              </span>
            )}
          </div>

          {/* Targeted Streams Chips */}
          {streamLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {streamLabels.slice(0, 3).map((lbl, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface text-theme-muted border border-theme/50"
                >
                  {lbl}
                </span>
              ))}
              {streamLabels.length > 3 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-surface text-theme-muted border border-theme/50">
                  +{streamLabels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Downloads Counter */}
          <div className="flex items-center justify-between text-[11px] text-theme-muted pt-1 border-t border-theme/40">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3 text-[var(--color-primary)]" />
              <strong className="font-mono text-theme-text">{downloads}</strong> تحميلة
            </span>
            <span className="text-[10px]">جاهز للتحميل المباشر</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-2 border-t border-theme/40 pt-3">
          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(book)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-theme bg-surface hover:bg-card-hover py-2.5 text-xs font-bold text-theme-text transition-all active:scale-[0.98] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>معاينة</span>
          </button>

          {/* Download Button */}
          <a
            href={book.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownload}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer ${
              isDownloading
                ? "bg-emerald-600 shadow-emerald-600/20"
                : "bg-[var(--color-primary)] hover:opacity-95 shadow-[var(--color-primary)]/20"
            }`}
          >
            <Download className={`w-3.5 h-3.5 ${isDownloading ? "animate-bounce" : ""}`} />
            <span>{isDownloading ? "جاري البدء..." : "تحميل"}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
