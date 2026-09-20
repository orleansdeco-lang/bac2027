"use client";

import React from "react";
import { PlannerEvent } from "@/lib/planner/types";
import {
  Clock,
  Play,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Trash2,
  Plus,
  Sparkles,
  Check,
} from "lucide-react";

interface DailyTimelineProps {
  dateIso: string;
  formattedDateFr: string;
  formattedDateAr: string;
  events: PlannerEvent[];
  onToggleComplete: (id: string) => void;
  onStartSession: (event: PlannerEvent) => void;
  onPostpone: (event: PlannerEvent) => void;
  onDelete: (id: string) => void;
  onOpenAddTask: () => void;
  onOpenAiPlanner: () => void;
  className?: string;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  dateIso,
  formattedDateFr,
  formattedDateAr,
  events,
  onToggleComplete,
  onStartSession,
  onPostpone,
  onDelete,
  onOpenAddTask,
  onOpenAiPlanner,
  className = "",
}) => {
  // Sort events chronologically by start_time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.start_time || "99:99";
    const timeB = b.start_time || "99:99";
    return timeA.localeCompare(timeB);
  });

  return (
    <div
      className={`rounded-3xl border border-theme bg-card p-5 sm:p-6 shadow-clay text-start transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-base sm:text-lg font-black text-theme-text font-sans">
              جدول المذاكرة والمهام
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-surface border border-theme text-theme-secondary">
              {formattedDateAr}
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-1 font-medium">
            تتبع أوقات مراجعتك وجلسات تركيزك اليومية
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAiPlanner}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent)]/20 text-[#8F5E1F] border border-[var(--color-accent)]/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>اقتراح جدول ذكي</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddTask}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مهمة</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-10 px-6 rounded-2xl border border-dashed border-theme bg-surface/50 text-theme-muted">
            <Calendar className="w-9 h-9 mx-auto mb-2 opacity-40 text-[var(--color-primary)]" />
            <h3 className="text-xs sm:text-sm font-bold text-theme-text mb-1">
              لا توجد جلسات مذاكرة مبرمجة لهذا اليوم
            </h3>
            <p className="text-xs text-theme-secondary max-w-sm mx-auto mb-4 font-medium">
              نظم وقتك بإضافة مهمة جديدة أو دع شاطر يقترح عليك جدولاً مناسباً لشعبتك.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenAddTask}
                className="text-xs px-4 py-2 rounded-xl font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-all cursor-pointer shadow-xs"
              >
                + إضافة مهمة الآن
              </button>
            </div>
          </div>
        ) : (
          sortedEvents.map((evt) => {
            const isCompleted = evt.status === "completed";
            const isInProgress = evt.status === "in_progress";
            const isPostponed = evt.status === "postponed";

            return (
              <div
                key={evt.id}
                className={`group rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  isCompleted
                    ? "bg-surface/50 border-theme/60 opacity-80"
                    : isInProgress
                    ? "bg-surface border-amber-500/50 ring-2 ring-amber-500/20 shadow-sm"
                    : "bg-surface border-theme hover:border-[var(--color-primary)]/40 shadow-xs"
                }`}
              >
                {/* Right side in RTL: Time & Task Info */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {/* Time Badge */}
                  <div className="shrink-0 text-center px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-card border border-theme text-theme-text min-w-[70px]">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-theme-secondary">
                      <Clock className="w-3 h-3 text-[var(--color-primary)]" />
                      <span>{evt.start_time || "مرن"}</span>
                    </div>
                    {evt.duration_minutes && (
                      <span className="text-[10px] block text-theme-muted font-normal mt-0.5">
                        {evt.duration_minutes} دقيقة
                      </span>
                    )}
                  </div>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isCompleted
                            ? "line-through text-theme-muted"
                            : "text-theme-text"
                        }`}
                      >
                        {evt.title}
                      </span>

                      {/* Status Badges */}
                      {isCompleted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>منجزة</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>جارية الآن</span>
                        </span>
                      ) : isPostponed ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          مؤجلة
                        </span>
                      ) : null}

                      {evt.priority === "high" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20">
                          أولوية قصوى
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-theme-secondary truncate">
                      {evt.subject_id && (
                        <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                          {evt.subject_id}
                        </span>
                      )}
                      {evt.description && (
                        <span className="text-theme-muted truncate text-[11px]">
                          {evt.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left side in RTL: Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Start Study Session Button */}
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => onStartSession(evt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isInProgress
                          ? "bg-amber-500 text-white hover:bg-amber-600 animate-pulse"
                          : "bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                      }`}
                      title="بدء مؤقت المذاكرة المركز"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isInProgress ? "استئناف" : "بدء الجلسة"}</span>
                    </button>
                  )}

                  {/* Toggle Complete Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleComplete(evt.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isCompleted
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-card border-theme text-theme-muted hover:text-emerald-600 hover:border-emerald-500/50"
                    }`}
                    title={isCompleted ? "تعليم كغير منجز" : "تعليم كمنجز"}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  {/* Postpone Button */}
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => onPostpone(evt)}
                      className="p-2 rounded-xl border border-theme bg-card text-theme-muted hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all cursor-pointer"
                      title="تأجيل المهمة"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDelete(evt.id)}
                    className="p-2 rounded-xl text-theme-muted hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="حذف المهمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
