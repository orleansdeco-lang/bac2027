"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Plus, Sparkles, Trash2, Target } from "lucide-react";

export interface DailyObjective {
  id: string;
  title: string;
  durationMinutes?: number;
  completed: boolean;
  subjectName?: string;
}

interface TodayObjectivesCardProps {
  objectives: DailyObjective[];
  onToggleObjective: (id: string) => void;
  onAddObjective?: (title: string, durationMinutes?: number) => void;
  onDeleteObjective?: (id: string) => void;
  className?: string;
}

export const TodayObjectivesCard: React.FC<TodayObjectivesCardProps> = ({
  objectives,
  onToggleObjective,
  onAddObjective,
  onDeleteObjective,
  className = "",
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("30");

  const total = objectives.length;
  const completedCount = objectives.filter((o) => o.completed).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // SVG Circular progress
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddObjective?.(newTitle.trim(), parseInt(newDuration, 10) || 30);
    setNewTitle("");
    setIsAdding(false);
  };

  return (
    <div
      className={`rounded-3xl border border-theme bg-card p-5 sm:p-6 shadow-clay text-start transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-base sm:text-lg font-black text-theme-text font-sans">
              أهداف اليوم
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              {completedCount} / {total} منجز
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-1 font-medium">
            حدد أولوياتك اليومية وأنجزها خطوة بخطوة
          </p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              fill="transparent"
              className="text-theme-muted/20"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="text-[var(--color-primary)] transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-black text-theme-text font-mono leading-none">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Objectives Checklist */}
      <div className="space-y-2">
        {objectives.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-theme bg-surface/60 text-theme-muted">
            <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50 text-[var(--color-primary)]" />
            <p className="text-xs font-medium">لا توجد أهداف مضافة لليوم حتى الآن.</p>
          </div>
        ) : (
          objectives.map((obj) => (
            <div
              key={obj.id}
              className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                obj.completed
                  ? "bg-surface/50 border-theme/60 opacity-75"
                  : "bg-surface border-theme hover:border-[var(--color-primary)]/40 shadow-xs"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleObjective(obj.id)}
                className="flex items-center gap-3 text-start flex-1 min-w-0 cursor-pointer"
              >
                {obj.completed ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 transition-transform" />
                ) : (
                  <Circle className="w-5 h-5 shrink-0 text-theme-muted hover:text-[var(--color-primary)] transition-colors" />
                )}
                <div className="truncate flex-1">
                  <span
                    className={`text-xs sm:text-sm block truncate ${
                      obj.completed
                        ? "line-through text-theme-muted"
                        : "font-bold text-theme-text"
                    }`}
                  >
                    {obj.title}
                  </span>
                  {obj.subjectName && (
                    <span className="text-[10px] font-bold inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                      {obj.subjectName}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {obj.durationMinutes && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-card border border-theme text-theme-secondary">
                    {obj.durationMinutes} د
                  </span>
                )}
                {onDeleteObjective && (
                  <button
                    type="button"
                    onClick={() => onDeleteObjective(obj.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-theme-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="حذف الهدف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Section */}
      <div className="mt-3.5 pt-3 border-t border-dashed border-theme">
        {isAdding ? (
          <form onSubmit={handleCreate} className="space-y-2.5">
            <input
              type="text"
              autoFocus
              placeholder="مثال: حل تمرينين في الدوال الأسية..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xs font-medium rounded-xl px-3 py-2 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-theme-secondary font-medium">
                <span className="text-[11px]">المدة (دقيقة):</span>
                <input
                  type="number"
                  min="5"
                  max="180"
                  step="5"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-16 text-center text-xs font-mono font-bold rounded-lg px-1.5 py-1 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs px-2.5 py-1 rounded-lg text-theme-muted hover:text-theme-text cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="text-xs px-3 py-1 rounded-lg font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 transition-all cursor-pointer"
                >
                  إضافة
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2 px-3 rounded-2xl border border-dashed border-theme text-xs font-bold text-theme-secondary hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-soft)]/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة هدف سريع</span>
          </button>
        )}
      </div>
    </div>
  );
};
