import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { BooksService } from "@/lib/services/books-service";
import { BookFiltersBar } from "@/components/library/BookFiltersBar";
import { BooksGrid } from "@/components/library/BooksGrid";
import { LibraryHero } from "@/components/library/LibraryHero";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "المكتبة الرقمية والمراجع الشاملة | منصة الشاطر - بكالوريا الجزائر",
  description:
    "مكتبة مراجع البكالوريا الجزائرية: تحميل مباشر للكتب المدرسية الرسمية لوزارة التربية، سلاسل كبار الأساتذة (تأشيرة النجاح، المغني، الهباج، بوالريش)، والملخصات النموذجية.",
};

interface LibraryPageProps {
  searchParams: Promise<{
    search?: string;
    stream?: string;
    subject?: string;
    category?: string;
    sortBy?: "latest" | "popular" | "oldest";
  }>;
}

async function LibraryContent({ searchParams }: LibraryPageProps) {
  const resolvedParams = await searchParams;
  const books = await BooksService.getBooks(resolvedParams);
  const allBooks = await BooksService.getBooks();
  const stats = await BooksService.getLibraryStats(allBooks);

  return (
    <div className="space-y-6 md:space-y-8" dir="rtl">
      {/* Hero & Aggregate Stats Banner */}
      <LibraryHero stats={stats} />

      {/* Filter and Search Bar */}
      <BookFiltersBar
        totalCount={allBooks.length}
        availableCount={books.length}
      />

      {/* Main Books Grid with Modal */}
      <BooksGrid books={books} />
    </div>
  );
}

export default function LibraryPage({ searchParams }: LibraryPageProps) {
  return (
    <AppShell activeNav="library">
      <Container className="py-4 md:py-6 max-w-7xl">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                  <BookOpen className="w-6 h-6 animate-spin" />
                </div>
                <p className="text-xs text-theme-muted font-sans">
                  جاري تحميل رفوف المكتبة الرقمية والمراجع الوطنية...
                </p>
              </div>
            </div>
          }
        >
          <LibraryContent searchParams={searchParams} />
        </Suspense>
      </Container>
    </AppShell>
  );
}
