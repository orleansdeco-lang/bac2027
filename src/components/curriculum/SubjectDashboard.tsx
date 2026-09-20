"use client";

import React from "react";
import Link from "next/link";
import { StreamId, SubjectId } from "@/types/education";
import { ALL_SUBJECTS, getStreamSubjects } from "@/lib/constants/streams";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Play,
  Clock,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Award,
} from "lucide-react";

export interface CurriculumDisplayItem {
  id: string;
  skillId: string;
  subjectId: string;
  title_ar: string;
  title_fr?: string;
  unit_ar?: string;
  summary_ar?: string;
  difficulty?: 1 | 2 | 3;
  estimatedMinutes?: number;
  dayNumber?: number;
  termNumber?: 1 | 2 | 3;
  hasVideo?: boolean;
  hasDiagram?: boolean;
}

interface SubjectDashboardProps {
  selectedStream: StreamId;
  selectedSubject: string;
  onSelectSubject: (subjectId: string) => void;
  selectedTrimester: "all" | 1 | 2 | 3;
  onSelectTrimester: (trimester: "all" | 1 | 2 | 3) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  items: CurriculumDisplayItem[];
  userSkills: Record<string, { status?: string }>;
  onOpenLesson: (skillId: string) => void;
  onToggleMastery: (skillId: string, streamId: StreamId, subjectId: string) => Promise<void> | void;
  className?: string;
}

export const SubjectDashboard: React.FC<SubjectDashboardProps> = ({
  selectedStream,
  selectedSubject,
  onSelectSubject,
  selectedTrimester,
  onSelectTrimester,
  searchQuery,
  onSearchChange,
  items,
  userSkills,
  onOpenLesson,
  onToggleMastery,
  className = "",
}) => {
  // Retrieve stream subject rules sorted by coefficient (descending)
  const streamSubjects = React.useMemo(() => {
    const rules = [...getStreamSubjects(selectedStream)];
    return rules.sort((a, b) => b.coefficient - a.coefficient);
  }, [selectedStream]);

  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {/* ================================================================= */}
      {/* FILTER CONTROLS: SUBJECTS & TRIMESTER & SEARCH                    */}
      {/* ================================================================= */}
      <div className="space-y-4">
        {/* Subject Navigation Tabs sorted by Coefficient */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>مواد الشعبة مرتبة حسب المعامل الوزاري الرسمي:</span>
            </span>
            <span className="text-[11px] text-theme-muted font-mono">
              إجمالي الدروس: {items.length}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => onSelectSubject("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none ${
                selectedSubject === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-102"
                  : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
              }`}
            >
              كل المواد ({items.length})
            </button>

            {streamSubjects.map((r) => {
              const subjMeta = ALL_SUBJECTS[r.subjectId as SubjectId];
              const name = subjMeta?.name_ar || r.subjectId;
              const isSelected = selectedSubject === r.subjectId;

              return (
                <button
                  key={r.subjectId}
                  type="button"
                  onClick={() => onSelectSubject(r.subjectId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 select-none ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white shadow-sm scale-102"
                      : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
                  }`}
                >
                  <span>{name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-surface text-theme-muted border border-theme/60"
                    }`}
                  >
                    معامل {r.coefficient}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trimester Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Trimester selector pills */}
          <div className="flex items-center gap-1.5 bg-surface/60 p-1 rounded-2xl border border-theme/80 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTrimester("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTrimester === "all"
                  ? "bg-card text-theme-text shadow-sm border border-theme"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              كل الفصول
            </button>
            <button
              type="button"
              onClick={() => onSelectTrimester(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTrimester === 1
                  ? "bg-card text-theme-text shadow-sm border border-theme"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              الفصل الأول
            </button>
            <button
              type="button"
              onClick={() => onSelectTrimester(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTrimester === 2
                  ? "bg-card text-theme-text shadow-sm border border-theme"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              الفصل الثاني
            </button>
            <button
              type="button"
              onClick={() => onSelectTrimester(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTrimester === 3
                  ? "bg-card text-theme-text shadow-sm border border-theme"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              الفصل الثالث
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث في عناوين الدروس، الكفاءات، أو المفاهيم..."
              className="w-full bg-card border border-theme rounded-2xl px-3.5 py-2 text-xs text-theme-text placeholder:text-theme-muted pr-9 focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm"
            />
            <Search className="h-4 w-4 text-theme-muted absolute right-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* LESSONS / SKILLS CARDS GRID                                       */}
      {/* ================================================================= */}
      {items.length === 0 ? (
        <Card className="p-10 text-center space-y-3 bg-card border-theme">
          <BookOpen className="w-10 h-10 text-theme-muted mx-auto" />
          <p className="text-sm font-bold text-theme-text">لا توجد كفاءات أو دروس مطابقة</p>
          <p className="text-xs text-theme-muted">
            جرب اختيار فصل دراسي آخر أو مادة أخرى أو مسح نص البحث
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isMastered = userSkills[item.skillId]?.status === "mastered";
            const subjMeta = ALL_SUBJECTS[item.subjectId as SubjectId];

            return (
              <Card
                key={item.id}
                className="group relative border border-theme bg-card hover:border-[var(--color-primary)]/50 hover:shadow-theme-card transition-all duration-200 p-5 flex flex-col justify-between gap-4 select-none"
              >
                {/* Header: Subject badge + Unit + Mastery pill */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {subjMeta && (
                        <Badge variant="primary" size="sm" className="font-bold text-[10px]">
                          {subjMeta.name_ar}
                        </Badge>
                      )}
                      {item.unit_ar && (
                        <span className="text-[10px] text-theme-muted px-2 py-0.5 rounded-md bg-surface border border-theme/60 truncate max-w-[180px]">
                          {item.unit_ar}
                        </span>
                      )}
                      {item.termNumber && (
                        <span className="text-[10px] text-theme-muted px-1.5 py-0.5 rounded bg-surface border border-theme/60">
                          فصل {item.termNumber}
                        </span>
                      )}
                    </div>

                    {/* Mastery Status Badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMastery(item.skillId, selectedStream, item.subjectId);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        isMastered
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-surface border border-theme text-theme-muted hover:text-theme-text"
                      }`}
                      title="تبديل حالة الإتقان"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isMastered ? "متقن ✓" : "تحديد كمتقن"}</span>
                    </button>
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-1">
                    <h3
                      onClick={() => onOpenLesson(item.skillId)}
                      className="text-sm sm:text-base font-black text-theme-text group-hover:text-[var(--color-primary)] transition-colors cursor-pointer leading-snug"
                    >
                      {item.title_ar}
                    </h3>

                    {item.summary_ar && (
                      <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed">
                        {item.summary_ar}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer: Metadata & Actions */}
                <div className="pt-3 border-t border-theme/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-theme-muted font-mono">
                    {item.estimatedMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.estimatedMinutes} د</span>
                      </span>
                    )}
                    {item.difficulty && (
                      <span className="text-amber-400 font-sans">
                        {"★".repeat(item.difficulty)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenLesson(item.skillId)}
                      className="text-xs h-8 px-3 rounded-xl gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-theme-muted" />
                      <span>قراءة الدرس</span>
                    </Button>

                    <Link
                      href={`/mission/${item.skillId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:opacity-95 transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>تمرين</span>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
