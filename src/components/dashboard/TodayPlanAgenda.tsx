"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PlannerEvent } from "@/lib/planner/types";
import { PlannerStorage } from "@/lib/planner/storage";
import { PlannerService } from "@/lib/planner/planner-service";

interface TodayPlanAgendaProps {
  todaysMission: any;
  upNextMission: any;
  personalEvents: PlannerEvent[];
  userId: string;
  streamId: string;
  isAr: boolean;
  onRefreshEvents: () => void;
  getSubjectName: (subjectId?: string) => string;
}

export function TodayPlanAgenda({
  todaysMission,
  upNextMission,
  personalEvents,
  userId,
  streamId,
  isAr,
  onRefreshEvents,
  getSubjectName,
}: TodayPlanAgendaProps) {
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const todayIso = new Date().toISOString().split("T")[0];

  const handleToggleEvent = async (event: PlannerEvent) => {
    if (!event.id) return;
    try {
      PlannerService.toggleEventCompleted(event.id);
      onRefreshEvents();
    } catch (err) {
      console.error("Failed to toggle event:", err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      PlannerStorage.deleteEvent(eventId);
      onRefreshEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isAdding || !userId) return;

    setIsAdding(true);
    try {
      await PlannerStorage.saveEvent({
        user_id: userId,
        userId: userId,
        title: newTaskTitle.trim(),
        date: todayIso,
        event_type: "study",
        subject_id: streamId === "gestion_eco" ? "accounting_finance" : "math",
        subjectId: streamId === "gestion_eco" ? "accounting_finance" : "math",
        duration_minutes: newTaskDuration,
        durationMinutes: newTaskDuration,
        priority: "medium",
        status: "pending",
        is_ai_generated: false,
      });

      setNewTaskTitle("");
      setShowAddForm(false);
      onRefreshEvents();
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const hasAnyItems = Boolean(todaysMission?.mission || upNextMission?.mission || personalEvents.length > 0);

  return (
    <section
      aria-label={isAr ? "خطة اليوم" : "Programme du jour"}
      className="p-5 sm:p-6 rounded-2xl bg-card border border-theme shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-theme-text font-sans">
            {isAr ? "خطة اليوم" : "Plan du jour"}
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            {isAr
              ? "تسلسل المهام المبرمجة لليوم بالترتيب التنفيذي"
              : "Séquence ordonnée des tâches planifiées pour aujourd'hui"}
          </p>
        </div>

        <Link
          href="/planner"
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          <span>{isAr ? "المخطط الكامل" : "Planning"}</span>
          <NextArrow className="w-3 h-3" />
        </Link>
      </div>

      {/* Agenda Items List */}
      <div className="space-y-2">
        {/* Item 1: System-Generated Mission 1 (Now) */}
        {todaysMission?.mission && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-surface border border-theme flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-mono">
                    {isAr ? "مهمة الشاطر" : "Mission Shater"}
                  </span>
                  <span className="text-xs font-bold text-theme-text">
                    {getSubjectName(todaysMission.subjectId)}
                  </span>
                  <span className="text-[11px] font-mono text-theme-muted">
                    • {todaysMission.estimatedMinutes} {isAr ? "د" : "min"}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-theme-text truncate mt-0.5">
                  {isAr ? todaysMission.skillTitle_ar : todaysMission.skillTitle_fr}
                </h3>
              </div>
            </div>

            <Link
              href={`/mission/${todaysMission.mission.id}`}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline shrink-0"
            >
              {isAr ? "ابدأ ←" : "Ouvrir →"}
            </Link>
          </div>
        )}

        {/* Item 2: System-Generated Mission 2 (Next) */}
        {upNextMission?.mission && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-surface/70 border border-theme/70 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface border border-theme text-theme-muted font-mono">
                    {isAr ? "الخطوة التالية" : "Suivante"}
                  </span>
                  <span className="text-xs font-semibold text-theme-text">
                    {getSubjectName(upNextMission.subjectId)}
                  </span>
                  <span className="text-[11px] font-mono text-theme-muted">
                    • {upNextMission.estimatedMinutes} {isAr ? "د" : "min"}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-theme-text truncate mt-0.5">
                  {isAr ? upNextMission.skillTitle_ar : upNextMission.skillTitle_fr}
                </h3>
              </div>
            </div>

            <Link
              href={`/mission/${upNextMission.mission.id}`}
              className="text-xs text-theme-muted hover:text-theme-text shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Personal Planner Tasks */}
        {personalEvents.map((evt, idx) => {
          const isDone = evt.status === "completed";
          const timeLabel = evt.start_time || evt.startTime;

          return (
            <div
              key={evt.id || idx}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                isDone
                  ? "bg-surface/30 border-theme/40 opacity-70"
                  : "bg-surface border-theme"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleEvent(evt)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                    isDone
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-zinc-400 dark:border-zinc-600 hover:border-emerald-500 text-transparent"
                  }`}
                  aria-label={isDone ? "مكتمل" : "تعليم كمكتمل"}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-card border border-theme text-theme-secondary font-mono">
                      {isAr ? "مهمة شخصية" : "Tâche perso"}
                    </span>
                    {timeLabel && (
                      <span className="text-[11px] font-mono text-theme-muted">
                        {timeLabel}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-theme-text">
                      {getSubjectName(evt.subject_id || evt.subjectId)}
                    </span>
                    {(evt.duration_minutes || evt.durationMinutes) && (
                      <span className="text-[10px] font-mono text-theme-muted">
                        • {evt.duration_minutes || evt.durationMinutes} {isAr ? "د" : "min"}
                      </span>
                    )}
                  </div>
                  <h4
                    className={`text-xs sm:text-sm truncate mt-0.5 ${
                      isDone ? "line-through text-theme-muted" : "font-medium text-theme-text"
                    }`}
                  >
                    {evt.title}
                  </h4>
                </div>
              </div>

              {evt.id && (
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(evt.id!)}
                  className="w-6 h-6 rounded text-theme-muted hover:text-rose-500 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  title={isAr ? "حذف" : "Supprimer"}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {!hasAnyItems && (
          <div className="py-6 text-center text-xs text-theme-muted border border-dashed border-theme rounded-xl">
            {isAr ? "ما برمجتش مهام لليوم." : "Aucune tâche planifiée pour aujourd'hui."}
          </div>
        )}
      </div>

      {/* Quick Add Form or Toggle */}
      {showAddForm ? (
        <form onSubmit={handleCreateTask} className="p-3 rounded-xl bg-surface border border-theme space-y-2 animate-fade-in">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={isAr ? "عنوان المهمة (مثلاً: حل تمرين المناعة 2024)" : "Titre de la tâche..."}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-card border border-theme text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-theme-muted">{isAr ? "المدة:" : "Durée :"}</span>
              {[15, 30, 45, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNewTaskDuration(d)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                    newTaskDuration === d
                      ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold"
                      : "bg-card border border-theme text-theme-secondary"
                  }`}
                >
                  {d} {isAr ? "د" : "m"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 text-xs text-theme-muted hover:text-theme-text cursor-pointer"
              >
                {isAr ? "إلغاء" : "Annuler"}
              </button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!newTaskTitle.trim() || isAdding}
                className="rounded-lg text-xs font-bold px-3 py-1"
              >
                {isAdding ? "..." : isAr ? "إضافة" : "Ajouter"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-theme hover:border-zinc-400 dark:hover:border-zinc-600 text-xs font-medium text-theme-secondary hover:text-theme-text flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? "إضافة مهمة شخصية لليوم" : "Ajouter une tâche pour aujourd'hui"}</span>
        </button>
      )}
    </section>
  );
}
