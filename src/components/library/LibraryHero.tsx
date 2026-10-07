"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Download,
  Award,
  GraduationCap,
  Layers,
  BookmarkCheck,
  ShieldCheck,
  Library,
} from "lucide-react";
import { LibraryStats } from "@/types/book";
import { LIBRARY_SUBJECTS } from "@/lib/constants/library";

interface LibraryHeroProps {
  stats?: LibraryStats;
}

export function LibraryHero({ stats }: LibraryHeroProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleQuickFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const totalBooks = stats?.totalBooks || 18;
  const totalDownloads = stats?.totalDownloads || 44250;
  const professorSeriesCount = stats?.byCategory?.professor_series || 8;
  const officialCount = stats?.byCategory?.official || 3;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-theme bg-card p-6 sm:p-8 md:p-10 shadow-sm transition-all"
      dir="rtl"
    >
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Development Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-500 font-bold">
            🚧
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">خزانة المراجع الرقمية — قيد التطوير والتحديث</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                نسخة تجريبية Beta
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              يجري حالياً التدقيق البيداغوجي وتجهيز أفضل النسخ الرسمية وسلاسل المتفوقين لتوفير تصفح وقراءة مريحة.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/exams"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <span>بنك البكالوريات الرسمية</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8">
        {/* Text Details & Branding */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
              <Library className="w-3.5 h-3.5" />
              <span>خزانة المراجع (قيد التطوير والتحديث)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نسخة تجريبية 2026</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-theme-text leading-tight">
            خزانة المراجع والسلاسل والكتب المدرسية
          </h1>

          <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
            قسم تجريبي قيد التطوير لإتاحة الكتب المدرسية وسلاسل الأساتذة المعتمدة. ننصح بالتركيز حالياً على بنك مواضيع البكالوريات وفروض الفصول المعتمدة في الأقسام الرئيسية.
          </p>

          {/* Quick Category Action Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleQuickFilter("official")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface hover:bg-card-hover border border-theme text-theme-secondary hover:text-theme-text transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>🏛️</span>
              <span>الكتب المدرسية الرسمية</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFilter("professor_series")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface hover:bg-card-hover border border-theme text-theme-secondary hover:text-theme-text transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>👨‍🏫</span>
              <span>سلاسل الأساتذة المعتمدة</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFilter("summary")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface hover:bg-card-hover border border-theme text-theme-secondary hover:text-theme-text transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>⚡</span>
              <span>مطويات وقواعد الحفظ</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFilter("exam_solutions")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface hover:bg-card-hover border border-theme text-theme-secondary hover:text-theme-text transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>🏆</span>
              <span>الحوليات الوزارية المحلولة</span>
            </button>
          </div>

          {/* Quick Subject Single-Click Navigation */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-theme-muted mb-1.5">تصفح مراجع المواد بنقرة واحدة:</div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {LIBRARY_SUBJECTS.filter((s) => s.id !== "all").map((sub) => (
                <Link
                  key={sub.id}
                  href={`/library/${sub.id}`}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-surface hover:bg-card-hover border border-theme text-theme-secondary hover:text-theme-text transition flex items-center gap-1 shrink-0"
                >
                  <span>{sub.icon}</span>
                  <span>{sub.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
          <div className="p-4 rounded-2xl bg-surface/70 border border-theme/80 text-center min-w-[130px] shadow-xs">
            <div className="flex items-center justify-center text-[var(--color-primary)] mb-1">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-theme-text">
              {totalBooks}+
            </div>
            <div className="text-[11px] font-semibold text-theme-muted">
              مرجع وسلسلة
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-theme/80 text-center min-w-[130px] shadow-xs">
            <div className="flex items-center justify-center text-emerald-500 mb-1">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-theme-text">
              {totalDownloads.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-theme-muted">
              تحميلة مباشرة
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-theme/80 text-center min-w-[130px] shadow-xs">
            <div className="flex items-center justify-center text-blue-500 mb-1">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-theme-text">
              {professorSeriesCount}
            </div>
            <div className="text-[11px] font-semibold text-theme-muted">
              سلسلة كبار الأساتذة
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-theme/80 text-center min-w-[130px] shadow-xs">
            <div className="flex items-center justify-center text-purple-500 mb-1">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-theme-text">
              {officialCount}
            </div>
            <div className="text-[11px] font-semibold text-theme-muted">
              كتب وزارية رسمية
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
