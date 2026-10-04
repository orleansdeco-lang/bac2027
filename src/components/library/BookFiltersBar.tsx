"use client";

import React, { useTransition, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  LIBRARY_STREAMS,
  LIBRARY_SUBJECTS,
  LIBRARY_CATEGORIES,
  SORT_OPTIONS,
} from "@/lib/constants/library";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Filter,
  Sparkles,
  ArrowUpDown,
  GraduationCap,
  Layers,
  BookMarked,
} from "lucide-react";

interface BookFiltersBarProps {
  totalCount?: number;
  availableCount?: number;
}

export function BookFiltersBar({ totalCount, availableCount }: BookFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStream = searchParams.get("stream") || "all";
  const currentSubject = searchParams.get("subject") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sortBy") || "popular";

  const hasActiveFilters =
    currentStream !== "all" ||
    currentSubject !== "all" ||
    currentCategory !== "all" ||
    currentSearch !== "" ||
    currentSort !== "popular";

  // Filter subjects based on selected stream (so relevant subjects are highlighted)
  const filteredSubjects = useMemo(() => {
    if (currentStream === "all") return LIBRARY_SUBJECTS;
    return LIBRARY_SUBJECTS.filter(
      (s) => s.id === "all" || !s.streams || s.streams.includes(currentStream as any)
    );
  }, [currentStream]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // If stream changed, check if current subject is still valid
    if (key === "stream" && value !== "all") {
      const subjectObj = LIBRARY_SUBJECTS.find((s) => s.id === currentSubject);
      if (subjectObj && subjectObj.streams && !subjectObj.streams.includes(value as any)) {
        params.delete("subject");
      }
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div
      className="w-full space-y-4 rounded-3xl bg-card p-4 sm:p-5 shadow-sm border border-theme transition-all duration-200"
      dir="rtl"
    >
      {/* الصف الأول: البحث النصي + الشعبة + المادة + الترتيب */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* حقل البحث السريع */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-muted pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث باسم المرجع، السلسلة، أو الأستاذ (مثال: تأشيرة النجاح، نور الدين، بوالريش، سعيد كمال)..."
            defaultValue={currentSearch}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full rounded-2xl border border-theme bg-surface py-3 pr-11 pl-4 text-xs sm:text-sm text-theme-text placeholder:text-theme-muted outline-none transition-all focus:border-[var(--color-primary)] focus:bg-card focus:ring-2 focus:ring-[var(--color-primary)]/10"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={() => updateParam("search", "")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-theme-muted hover:text-theme-text px-1.5 py-0.5 rounded-md bg-card border border-theme"
            >
              مسح
            </button>
          )}
        </div>

        {/* اختيار الشعبة، المادة، والترتيب */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          {/* الشعبة */}
          <div className="relative min-w-[150px] sm:min-w-[170px] flex-1 sm:flex-initial">
            <select
              value={currentStream}
              onChange={(e) => updateParam("stream", e.target.value)}
              className="w-full appearance-none rounded-2xl border border-theme bg-surface py-3 pr-9 pl-8 text-xs sm:text-sm font-semibold text-theme-text outline-none transition-all focus:border-[var(--color-primary)] focus:bg-card cursor-pointer"
            >
              {LIBRARY_STREAMS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted pointer-events-none" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none text-xs">
              ▼
            </div>
          </div>

          {/* قائمة المواد المنسدلة (تسهل الاختيار المباشر من بين الـ 19 مادة) */}
          <div className="relative min-w-[150px] sm:min-w-[170px] flex-1 sm:flex-initial">
            <select
              value={currentSubject}
              onChange={(e) => updateParam("subject", e.target.value)}
              className="w-full appearance-none rounded-2xl border border-theme bg-surface py-3 pr-9 pl-8 text-xs sm:text-sm font-semibold text-theme-text outline-none transition-all focus:border-[var(--color-primary)] focus:bg-card cursor-pointer"
            >
              <option value="all">كل المواد ({filteredSubjects.length - 1})</option>
              {filteredSubjects
                .filter((s) => s.id !== "all")
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.icon} {sub.label}
                  </option>
                ))}
            </select>
            <BookMarked className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted pointer-events-none" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none text-xs">
              ▼
            </div>
          </div>

          {/* الترتيب */}
          <div className="relative min-w-[140px] flex-1 sm:flex-initial">
            <select
              value={currentSort}
              onChange={(e) => updateParam("sortBy", e.target.value)}
              className="w-full appearance-none rounded-2xl border border-theme bg-surface py-3 pr-9 pl-8 text-xs sm:text-sm font-semibold text-theme-text outline-none transition-all focus:border-[var(--color-primary)] focus:bg-card cursor-pointer"
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted pointer-events-none" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none text-xs">
              ▼
            </div>
          </div>

          {/* زر إعادة الضبط */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              title="إعادة ضبط الفلاتر"
              className="flex items-center justify-center p-3 rounded-2xl border border-theme bg-surface hover:bg-card-hover text-rose-500 hover:text-rose-600 transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* الصف الثاني: أزرار تصفية النوع (Category Segmented Tabs) */}
      <div className="space-y-1.5 pt-1 border-t border-theme/40">
        <div className="flex items-center justify-between text-xs text-theme-muted mb-1">
          <span className="font-bold text-theme-secondary flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>نوع المرجع أو السلسلة:</span>
          </span>
          {availableCount !== undefined && totalCount !== undefined && (
            <span className="text-[11px] font-mono text-theme-muted">
              عرض {availableCount} من أصل {totalCount} مرجع
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {LIBRARY_CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParam("category", cat.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                    : "bg-surface text-theme-secondary hover:text-theme-text hover:bg-card-hover border border-theme"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* الصف الثالث: تصفية المواد (Horizontal Scrolling Subjects Chips) */}
      <div className="space-y-1.5 pt-1 border-t border-theme/40">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-theme-secondary">
            المادة الدراسية (تتأقلم تلقائياً مع الشعبة المختارة):
          </label>
          <span className="text-[11px] text-theme-muted">
            {filteredSubjects.length - 1} مادة
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filteredSubjects.map((sub) => {
            const isSelected = currentSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => updateParam("subject", sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold shadow-xs"
                    : "bg-surface text-theme-secondary hover:text-theme-text border border-theme"
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
