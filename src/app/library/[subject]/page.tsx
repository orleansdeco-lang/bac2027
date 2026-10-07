import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { BooksService } from "@/lib/services/books-service";
import { BookFiltersBar } from "@/components/library/BookFiltersBar";
import { BooksGrid } from "@/components/library/BooksGrid";
import { LIBRARY_SUBJECTS, getSubjectMeta } from "@/lib/constants/library";
import { ArrowRight, BookOpen, Layers, Library } from "lucide-react";

interface SubjectLibraryPageProps {
  params: {
    subject: string;
  };
  searchParams: Promise<{
    search?: string;
    stream?: string;
    category?: string;
    sortBy?: "latest" | "popular" | "oldest";
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: { subject: string };
}): Promise<Metadata> {
  const subjectMeta = getSubjectMeta(params.subject);
  if (!subjectMeta) {
    return {
      title: "مكتبة المراجع | منصة الشاطر",
    };
  }

  return {
    title: `مراجع وكتب ${subjectMeta.label} (قيد التطوير) | خزانة المراجع - الشاطر`,
    description: `قسم تجريبي قيد التطوير لمراجع وسلاسل وكتب مادة ${subjectMeta.label} لشهادة البكالوريا بالجزائر.`,
  };
}

async function SubjectLibraryContent({
  subject,
  searchParams,
}: {
  subject: string;
  searchParams: SubjectLibraryPageProps["searchParams"];
}) {
  const resolvedParams = await searchParams;
  const subjectMeta = getSubjectMeta(subject);
  if (!subjectMeta) notFound();

  // Query books for this subject
  const books = await BooksService.getBooks({
    ...resolvedParams,
    subject: subject,
  });

  const allSubjectBooks = await BooksService.getBooks({ subject: subject });

  return (
    <div className="space-y-6 md:space-y-8" dir="rtl">
      {/* Subject Breadcrumb and Header */}
      <div className="relative overflow-hidden rounded-3xl border border-theme bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-theme-muted">
              <Link href="/library" className="hover:text-[var(--color-primary)] transition flex items-center gap-1">
                <Library className="w-3.5 h-3.5" />
                <span>خزانة المراجع (قيد التطوير)</span>
              </Link>
              <span>/</span>
              <span className="text-theme-text font-bold">{subjectMeta.label}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-surface border border-theme shadow-xs">
                {subjectMeta.icon}
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-theme-text">
                  مكتبة مراجع {subjectMeta.label} للبكالوريا
                </h1>
                <p className="text-xs sm:text-sm text-theme-muted">
                  الكتب المدرسية الرسمية، سلاسل كبار الأساتذة المعتمدة، والملخصات النموذجية
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-theme text-xs font-mono font-bold text-theme-text">
              {allSubjectBooks.length} مراجع متوفرة
            </span>
            <Link
              href="/library"
              className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition text-xs font-bold inline-flex items-center gap-1"
            >
              <span>كل المواد</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Quick Subject Switcher Pills */}
        <div className="mt-6 pt-4 border-t border-theme/60">
          <div className="text-[11px] font-bold text-theme-muted mb-2">التنقل السريع بين المواد:</div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {LIBRARY_SUBJECTS.filter((s) => s.id !== "all").map((sub) => {
              const isCurrent = sub.id === subject;
              return (
                <Link
                  key={sub.id}
                  href={`/library/${sub.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? "bg-[var(--color-primary)] text-white shadow-xs font-bold"
                      : "bg-surface text-theme-secondary hover:text-theme-text border border-theme"
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for this subject */}
      <BookFiltersBar
        totalCount={allSubjectBooks.length}
        availableCount={books.length}
      />

      {/* Books Grid */}
      <BooksGrid books={books} />
    </div>
  );
}

export default function SubjectLibraryPage({ params, searchParams }: SubjectLibraryPageProps) {
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
                  جاري تحميل مراجع المادة...
                </p>
              </div>
            </div>
          }
        >
          <SubjectLibraryContent subject={params.subject} searchParams={searchParams} />
        </Suspense>
      </Container>
    </AppShell>
  );
}
