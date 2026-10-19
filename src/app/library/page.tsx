import React from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { BooksService } from "@/lib/services/books-service";
import { BookFiltersBar } from "@/components/library/BookFiltersBar";
import { BooksGrid } from "@/components/library/BooksGrid";
import { LibraryHero } from "@/components/library/LibraryHero";

export const metadata: Metadata = {
  title: "خزانة المراجع المعتمدة | منصة الشاطر - بكالوريا الجزائر",
  description:
    "خزانة مراجع البكالوريا الجزائرية: كتب وسلاسل نخبة كبار الأساتذة المعتمدة.",
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

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedParams = await searchParams;
  const books = await BooksService.getBooks(resolvedParams);
  const allBooks = await BooksService.getBooks();
  const stats = await BooksService.getLibraryStats(allBooks);

  return (
    <AppShell activeNav="library">
      <Container className="py-4 md:py-6 max-w-7xl">
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
      </Container>
    </AppShell>
  );
}
