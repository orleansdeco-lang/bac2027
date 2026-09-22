"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  FileText,
  GraduationCap,
  Calculator,
  Compass,
  Sparkles,
  AlertTriangle,
  MessageSquareQuote,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Layers,
  Clock,
  ExternalLink,
} from "lucide-react";
import { ContentService } from "@/lib/services/content-service";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { Skill } from "@/domain/content/types";
import { useTranslation } from "@/lib/i18n/context";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStream?: string;
}

interface SearchItem {
  id: string;
  type: "skill" | "subject" | "exam" | "tool";
  title: string;
  subtitle?: string;
  badge?: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATIC_PLATFORM_TOOLS: SearchItem[] = [
  {
    id: "tool-calculator",
    type: "tool",
    title: "حاسبة معدل البكالوريا 2027",
    subtitle: "احسب معدلك وفق المعاملات الرسمية للشعب الجزائرية بدقة",
    badge: "أداة ذكية",
    url: "/calculator",
    icon: Calculator,
  },
  {
    id: "tool-curriculum",
    type: "tool",
    title: "المكتبة الشاملة الحرة (كل الدروس)",
    subtitle: "تصفح ملخصات، شروحات فيديو، ورسومات بيانية لكل المواد",
    badge: "المكتبة",
    url: "/curriculum",
    icon: BookOpen,
  },
  {
    id: "tool-exams",
    type: "exam",
    title: "بنك مواضيع البكالوريا الرسمية (مع التصحيح)",
    subtitle: "حوليات البكالوريا السابقة مع التصحيح النموذجي وسلم التنقيط",
    badge: "حوليات BAC",
    url: "/exams",
    icon: FileText,
  },
  {
    id: "tool-terms",
    type: "exam",
    title: "فروض واختبارات الفصول النموذجية",
    subtitle: "نماذج امتحانات وفروض من مختلف ثانويات الوطن",
    badge: "فروض واختبارات",
    url: "/exams/terms",
    icon: GraduationCap,
  },
  {
    id: "tool-experiences",
    type: "tool",
    title: "بنك تجارب وعِبر المتفوقين",
    subtitle: "نصائح حقيقية وتجارب طلبة سابقين لتفادي الأخطاء الشائعة",
    badge: "تجارب BAC",
    url: "/experiences",
    icon: MessageSquareQuote,
  },
  {
    id: "tool-error-lab",
    type: "tool",
    title: "مختبر الأخطاء وتحليل الثغرات",
    subtitle: "معالجة المفاهيم الخاطئة وتفكيك أسباب فقدان النقاط",
    badge: "معمل الأخطاء",
    url: "/error-lab",
    icon: AlertTriangle,
  },
  {
    id: "tool-diagnostic",
    type: "tool",
    title: "التشخيص التكيفي للمواد",
    subtitle: "تقييم تشخيصي مستقل لمستواك في الرياضيات، العلوم، الفيزياء...",
    badge: "تشخيص",
    url: "/diagnostic",
    icon: Sparkles,
  },
  {
    id: "tool-roadmap",
    type: "tool",
    title: "خريطة المنهاج والشعبة",
    subtitle: "عرض المسار التعليمي الشامل وترتيب الأولويات",
    badge: "الخريطة",
    url: "/roadmap",
    icon: Compass,
  },
  {
    id: "tool-dashboard",
    type: "tool",
    title: "لوحة التحكم ومهمتي اليومية",
    subtitle: "متابعة التقدم والمهارات المكتسبة وجدول المهام",
    badge: "لوحة التلميذ",
    url: "/dashboard",
    icon: Compass,
  },
];

const QUICK_SEARCH_SUGGESTIONS = [
  "متتاليات",
  "التركيب الضوئي",
  "المناعة",
  "الاحتمالات",
  "دوال عددية",
  "النووي",
  "حاسبة المعدل",
  "مواضيع البكالوريا",
];

// Helper to normalize Arabic text for resilient search (handles alef variants, teh marbuta, etc.)
function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "") // remove tashkeel
    .trim();
}

export function GlobalSearchModal({ isOpen, onClose, activeStream }: GlobalSearchModalProps) {
  const router = useRouter();
  const { locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Pre-load all skills for the stream or globally
  const allSkills = useMemo<Skill[]>(() => {
    try {
      if (activeStream && activeStream in ALGERIAN_BAC_STREAMS) {
        return ContentService.getSkillsForStream(activeStream as StreamId);
      }
      return ContentService.getAllSkills();
    } catch {
      return [];
    }
  }, [activeStream]);

  // Filter items based on query
  const searchResults = useMemo<SearchItem[]>(() => {
    const raw = query.trim();
    if (!raw) return [];

    const normQuery = normalizeArabicText(raw);
    const queryParts = normQuery.split(/\s+/).filter(Boolean);

    const matchesQuery = (text?: string): boolean => {
      if (!text) return false;
      const norm = normalizeArabicText(text);
      return queryParts.every((part) => norm.includes(part));
    };

    const results: SearchItem[] = [];

    // 1. Check tools & pages
    for (const tool of STATIC_PLATFORM_TOOLS) {
      if (matchesQuery(tool.title) || matchesQuery(tool.subtitle) || matchesQuery(tool.badge)) {
        results.push(tool);
      }
    }

    // 2. Check subjects
    for (const [subId, sub] of Object.entries(ALL_SUBJECTS)) {
      if (matchesQuery(sub.name_ar) || matchesQuery(sub.name_fr) || matchesQuery(sub.code)) {
        results.push({
          id: `subject-${subId}`,
          type: "subject",
          title: sub.name_ar,
          subtitle: `تصفح جميع دروس وتمارين ${sub.name_ar} في المكتبة الشاملة`,
          badge: sub.code || "مادة",
          url: `/curriculum?subject=${subId}`,
          icon: BookOpen,
        });
      }
    }

    // 3. Check skills / lessons (up to 20 best matches)
    let skillCount = 0;
    for (const skill of allSkills) {
      if (skillCount >= 20) break;

      const titleMatch = matchesQuery(skill.title_ar) || matchesQuery(skill.title_fr);
      const descMatch = matchesQuery(skill.description_ar);
      const idMatch = matchesQuery(skill.id);

      if (titleMatch || descMatch || idMatch) {
        const subj = ALL_SUBJECTS[skill.subjectId as SubjectId];
        const subjectName = subj?.name_ar || skill.subjectId;

        results.push({
          id: `skill-${skill.id}`,
          type: "skill",
          title: skill.title_ar || skill.title_fr || skill.id,
          subtitle: skill.description_ar || `درس في مادة ${subjectName}`,
          badge: subjectName,
          url: `/curriculum?skill=${encodeURIComponent(skill.id)}`,
          icon: Sparkles,
        });
        skillCount++;
      }
    }

    return results;
  }, [query, allSkills]);

  // Reset selected index on results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length]);

  // Navigate on enter or click
  const handleSelect = (item: SearchItem) => {
    onClose();
    router.push(item.url);
  };

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = searchResults[selectedIndex];
      if (current) {
        handleSelect(current);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="البحث الشامل"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3.5 sm:px-4 backdrop-blur-md bg-slate-950/60 transition-all animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface border border-theme rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] transition-all transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="relative p-3.5 sm:p-4 border-b border-theme flex items-center gap-3 bg-card/60">
          <Search className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن درس، مادة، موضوع بكالوريا، أو أداة..."
            className="flex-1 bg-transparent text-sm sm:text-base text-theme-text placeholder:text-theme-muted outline-none font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-theme-muted hover:text-theme-text hover:bg-card-hover transition-colors"
              aria-label="مسح نص البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-theme-muted bg-surface px-2 py-1 rounded-md border border-theme">
            <span>ESC</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sm:hidden p-1.5 rounded-xl text-theme-secondary hover:text-theme-text hover:bg-card"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Content Body */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {query.trim() === "" ? (
            /* Empty State: Quick Suggestions & Main Tools */
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-theme-muted px-2 block mb-2">
                  عمليات بحث مقترحة:
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCH_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setQuery(sug);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-card hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] border border-theme hover:border-[var(--color-primary)]/40 transition-all text-theme-secondary flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3 opacity-60" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-theme-muted px-2 block mb-2">
                  أهم أدوات وأقسام المنظومة:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STATIC_PLATFORM_TOOLS.slice(0, 6).map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleSelect(tool)}
                        className="p-2.5 rounded-2xl border border-theme bg-card hover:bg-card-hover text-start flex items-center gap-3 transition-colors group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-theme-text group-hover:text-[var(--color-primary)] truncate transition-colors">
                              {tool.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-theme-muted truncate mt-0.5">
                            {tool.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results Found */
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-theme-text">لا توجد نتائج مطابقة لـ "{query}"</p>
              <p className="text-xs text-theme-muted max-w-sm mx-auto">
                جرب البحث بكلمات أخرى أو اختر مادة من المكتبة الشاملة أو استعرض بنك الحوليات.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/curriculum");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>دخول المكتبة الشاملة</span>
                </button>
              </div>
            </div>
          ) : (
            /* Search Results List */
            <div className="space-y-1.5" role="listbox">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-theme-muted mb-1">
                <span>النتائج ({searchResults.length}):</span>
                <span className="text-[11px] font-normal">استخدم الأسهم للتنقل و Enter للاختيار</span>
              </div>

              {searchResults.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)]/50 shadow-sm"
                        : "bg-card border-theme hover:bg-card-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-surface border border-theme text-theme-secondary"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isSelected ? "text-[var(--color-primary)]" : "text-theme-text"
                            }`}
                          >
                            {item.title}
                          </h4>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-theme text-theme-secondary">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {item.subtitle && (
                          <p className="text-xs text-theme-muted truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <Arrow className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-[var(--color-primary)] translate-x-1" : "text-theme-muted"}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-theme bg-card/40 flex items-center justify-between text-[11px] text-theme-muted px-4">
          <div className="flex items-center gap-2">
            <span>💡 نصيحة: يمكنك أيضاً البحث باسم المادة مثل "فيزياء" أو "رياضيات"</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-theme-secondary hover:text-theme-text font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
