"use client";

import React, { useState } from "react";
import { Book } from "@/types/book";
import { BookCard } from "./BookCard";
import { BookPreviewModal } from "./BookPreviewModal";
import {
  BookOpen,
  Sparkles,
  RotateCcw,
  Star,
  SearchX,
  FileQuestion,
  Layers,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface BooksGridProps {
  books: Book[];
}

export function BooksGrid({ books }: BooksGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activePreviewBook, setActivePreviewBook] = useState<Book | null>(null);

  // Separate featured books if any
  const featuredBooks = books.filter((b) => b.is_featured);

  if (books.length === 0) {
    return (
      <div
        className="rounded-3xl border border-theme bg-card p-12 text-center space-y-4 max-w-lg mx-auto"
        dir="rtl"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
          <SearchX className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-theme-text">
            لم نتمكن من إيجاد مراجع تطابق خيارات البحث
          </h3>
          <p className="text-xs text-theme-muted">
            جرّب تغيير الشعبة، مسح مصطلح البحث، أو اختيار "جميع المراجع" لاستعراض كامل المكتبة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.replace(pathname)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md cursor-pointer hover:opacity-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط وتصفح كل المراجع</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Featured Section (if any featured books exist in current filtered list) */}
      {featuredBooks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-500" />
            </span>
            <h2 className="text-base font-extrabold text-theme-text">
              المراجع والسلاسل الأكثر طلباً وتوصية لدفعة 2026
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {featuredBooks.length} مراجع مختارة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredBooks.map((book) => (
              <BookCard
                key={`feat-${book.id}`}
                book={book}
                onPreview={(b) => setActivePreviewBook(b)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Books Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold text-theme-text">
              قائمة المراجع والكتب المتاحة
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface text-theme-muted border border-theme">
              {books.length} كتاب
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPreview={(b) => setActivePreviewBook(b)}
            />
          ))}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {activePreviewBook && (
        <BookPreviewModal
          book={activePreviewBook}
          onClose={() => setActivePreviewBook(null)}
        />
      )}
    </div>
  );
}
