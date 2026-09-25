"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MustWinService, MustWinSummary, MustWinItem } from "@/lib/study-os/must-win-service";
import { MustWinCard } from "./MustWinCard";
import { useFocus } from "@/context/FocusContext";
import { PlannerStorage } from "@/lib/planner/storage";
import { PlannerService } from "@/lib/planner/planner-service";
import { PlannerEvent } from "@/lib/planner/types";
import {
  Target,
  Clock,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Maximize2,
  Calendar,
  Check,
  Trash2,
} from "lucide-react";

interface TodayCommandCenterProps {
  userId: string;
  studentName?: string;
  streamId?: string;
}

export function TodayCommandCenter({
  userId,
  studentName = "طالب البكالوريا",
  streamId = "sciences_exp",
}: TodayCommandCenterProps) {
  const {
    isSessionActive,
    activeSession,
    formattedElapsed,
    formattedRemaining,
    isRunning,
    openFocusMode,
    startSession,
  } = useFocus();

  const [summary, setSummary] = useState<MustWinSummary | null>(null);
  const [personalEvents, setPersonalEvents] = useState<PlannerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Personal Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState(streamId === "gestion_eco" ? "accounting_finance" : "math");
  const [taskDuration, setTaskDuration] = useState(30);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const todayIso = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await MustWinService.getMustWinObjectives(userId, todayIso);
      setSummary(res);

      const allEvents = await PlannerStorage.loadEvents(userId);
      const todays = allEvents.filter(
        (e) => (e.date === todayIso || e.start_time) && e.status !== "cancelled"
      );
      setPersonalEvents(todays);
    } catch (err) {
      console.error("Failed to load Today Command Center data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, todayIso]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle manual task toggle complete
  const handleToggleComplete = async (item: MustWinItem) => {
    if (item.plannerEventId) {
      PlannerService.toggleEventCompleted(item.plannerEventId);
      await loadData();
    } else {
      // Toggle local item completion state
      setSummary((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.map((it) =>
          it.id === item.id ? { ...it, isCompleted: !it.isCompleted, status: it.isCompleted ? ("pending" as const) : ("completed" as const) } : it
        );
        const compCount = updatedItems.filter((i) => i.isCompleted).length;
        return { ...prev, items: updatedItems, completedCount: compCount };
      });
    }
  };

  // Handle adding quick personal task
  const handleAddPersonalTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || isAddingTask) return;

    setIsAddingTask(true);
    try {
      await PlannerStorage.saveEvent({
        user_id: userId,
        userId: userId,
        title: taskTitle.trim(),
        date: todayIso,
        event_type: "study",
        subject_id: taskSubject,
        subjectId: taskSubject,
        duration_minutes: taskDuration,
        durationMinutes: taskDuration,
        priority: "medium",
        status: "pending",
        is_ai_generated: false,
      });

      setTaskTitle("");
      await loadData();
    } catch (err) {
      console.error("Failed to add personal task:", err);
    } finally {
      setIsAddingTask(false);
    }
  };

  // Handle personal event delete
  const handleDeletePersonalTask = async (eventId: string) => {
    PlannerStorage.deleteEvent(eventId);
    await loadData();
  };

  // Date formatting in Arabic
  const formattedToday = new Date().toLocaleDateString("ar-DZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="space-y-5" aria-label="مركز القيادة اليومي">
      {/* 1. ACTIVE FOCUS SESSION BANNER (Priority 1) */}
      {isSessionActive && activeSession && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">
                  جلسة تركيز جارية الآن
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">
                  • {activeSession.subjectNameAr}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md mt-0.5">
                {activeSession.taskTitle || "جلسة مذاكرة واستيعاب مركزة"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div dir="ltr" className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
              {activeSession.targetDurationMinutes > 0 ? formattedRemaining : formattedElapsed}
            </div>

            <button
              type="button"
              onClick={openFocusMode}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>تكبير الشاشة</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. HEADER & TODAY'S OBJECTIVES SUMMARY (Priority 2) */}
      <div className="rounded-3xl border border-theme bg-card p-5 sm:p-7 shadow-clay space-y-6">
        {/* Header Title & Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme/60 pb-4">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
              <h2 className="text-lg sm:text-xl font-black text-theme-text font-sans">
                هذا واش لازم تخدم اليوم 🎯
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-theme-secondary font-medium">
              أولوياتك الثلاث لبناء الكفاءة وتثبيت مهارات البكالوريا، مرتبة حسب تحليلك التكيفي.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-surface border border-theme text-theme-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>{formattedToday}</span>
            </span>
          </div>
        </div>

        {/* 3. MUST-WIN 3 GRID OR CONSTRUCTIVE EMPTY STATE */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-theme-muted font-medium animate-pulse">
            جاري تحليل نقاط القوة ومعمل الأخطاء لترتيب مهام الحسم...
          </div>
        ) : summary && summary.items.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.items.map((item) => (
                <MustWinCard
                  key={item.id}
                  item={item}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>

            {/* Today's Objectives Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-surface/70 border border-theme flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-theme-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  أنجزت {summary.completedCount} من أصل {summary.items.length} مهام حسم اليوم
                </span>
                <span className="text-theme-muted font-normal">
                  (الوقت التقديري المتبقي: {Math.max(0, summary.totalEstimatedMinutes - (summary.completedCount * 25))} دقيقة)
                </span>
              </div>

              <div className="w-full sm:w-48 h-2 bg-theme-border/30 rounded-full overflow-hidden border border-theme/40">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${summary.items.length > 0 ? (summary.completedCount / summary.items.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : !summary?.hasDiagnostic ? (
          /* Constructive Empty State: Diagnostic Required */
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 mx-auto flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-theme-text">
              قم بالتشخيص الأولي لتفعيل مهام الحسم الذكية
            </h3>
            <p className="text-xs text-theme-secondary max-w-md mx-auto leading-relaxed">
              تحتاج خوارزمية الشاطر إلى 10 دقائق لتقييم مستواك ورصد ثغراتك البيداغوجية، لتوليد مهام الحسم الثلاث الخاصة بك يومياً.
            </p>
            <div className="pt-2">
              <Link href="/diagnostic">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  بدء اختبار المستوى الآن (10 دقائق)
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Constructive Empty State: Add First Task */
          <div className="p-6 text-center text-xs text-theme-muted border border-dashed border-theme rounded-2xl">
            لا توجد مهام حسم متبقية لليوم. أحسنت! أضف مهمة شخصية للمواصلة.
          </div>
        )}

        {/* 4. PERSONAL PLANNER TASKS SECTION (Distinct from SHATER Missions) */}
        <div className="pt-4 border-t border-theme/60 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-theme-text">
                مهامك المخصصة لليوم (Personal Tasks)
              </span>
              <span className="text-[10px] font-mono text-theme-muted bg-surface px-2 py-0.5 rounded border border-theme">
                {personalEvents.length} مهمة
              </span>
            </div>

            <Link
              href="/planner"
              className="text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              فتح المخطط الكامل ←
            </Link>
          </div>

          {/* Quick Add Inline Task Form */}
          <form onSubmit={handleAddPersonalTask} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="أضف مهمة شخصية جديدة (مثال: حل مسألة الاحتمالات ص 42)..."
              className="w-full sm:w-auto sm:flex-1 min-w-0 text-xs bg-surface border border-theme rounded-xl px-3.5 py-2 text-theme-text placeholder-theme-muted focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />

            <select
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
              className="text-xs bg-surface border border-theme rounded-xl px-2.5 py-2 text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="math">الرياضيات</option>
              <option value="physics">الفيزياء</option>
              <option value="natural_sciences">العلوم الطبيعية</option>
              <option value="philosophy">الفلسفة</option>
              <option value="arabic">اللغة العربية</option>
              <option value="history_geography">التاريخ والجغرافيا</option>
              <option value="islamic_studies">العلوم الإسلامية</option>
              <option value="french">الفرنسية</option>
              <option value="english">الإنجليزية</option>
              <option value="accounting_finance">المحاسبة</option>
            </select>

            <select
              value={taskDuration}
              onChange={(e) => setTaskDuration(parseInt(e.target.value))}
              className="text-xs bg-surface border border-theme rounded-xl px-2 py-2 text-theme-text focus:outline-none focus:border-[var(--color-primary)] font-mono"
            >
              <option value={20}>20 د</option>
              <option value={30}>30 د</option>
              <option value={45}>45 د</option>
              <option value={60}>60 د</option>
              <option value={90}>90 د</option>
            </select>

            <button
              type="submit"
              disabled={isAddingTask || !taskTitle.trim()}
              className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </form>

          {/* Personal Tasks Compact List */}
          {personalEvents.length > 0 && (
            <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
              {personalEvents.map((evt) => {
                const isCompleted = evt.status === "completed" || evt.status === "COMPLETED";
                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-surface/60 border border-theme hover:border-theme-hover flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          PlannerService.toggleEventCompleted(evt.id);
                          loadData();
                        }}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-theme bg-card text-transparent hover:border-emerald-500"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </button>

                      <div className="min-w-0">
                        <span
                          className={`font-semibold truncate block ${
                            isCompleted ? "line-through text-theme-muted" : "text-theme-text"
                          }`}
                        >
                          {evt.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-theme-muted mt-0.5">
                          <span>{evt.subject_id || "مذاكرة"}</span>
                          <span>•</span>
                          <span>{evt.duration_minutes || 30} دقيقة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => {
                            startSession({
                              mode: "custom",
                              targetDurationMinutes: evt.duration_minutes || 30,
                              subjectId: evt.subject_id || "math",
                              taskTitle: evt.title,
                              eventId: evt.id,
                            });
                            openFocusMode();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors font-bold text-[11px] cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>ابدأ التركيز</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeletePersonalTask(evt.id)}
                        className="p-1 rounded text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
