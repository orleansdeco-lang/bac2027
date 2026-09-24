"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Target,
  PieChart as PieIcon,
  BarChart3,
  Trophy,
  Flame,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { MustWinTask, StudySession } from "@/types/ypt";
import { YPT_BAC_SUBJECTS, getSubjectById } from "@/lib/ypt/yptData";

interface BacPlannerAndAnalyticsProps {
  tasks: MustWinTask[];
  onAddTask: (task: Omit<MustWinTask, "id">) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  totalStudiedMinutesToday: number;
  targetMinutesToday: number;
  onUpdateTargetHours: (hours: number) => void;
  sessions: StudySession[];
}

export function BacPlannerAndAnalytics({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  totalStudiedMinutesToday,
  targetMinutesToday,
  onUpdateTargetHours,
  sessions,
}: BacPlannerAndAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskSubjectId, setNewTaskSubjectId] = useState("math");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Goal Progress Calculations
  const targetHours = (targetMinutesToday / 60).toFixed(1);
  const studiedHours = (totalStudiedMinutesToday / 60).toFixed(1);
  const goalPercentage = Math.min(
    100,
    Math.round((totalStudiedMinutesToday / Math.max(1, targetMinutesToday)) * 100)
  );

  // Subject Breakdown data for Donut Chart
  const subjectMinutesMap: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectMinutesMap[s.subjectId] =
      (subjectMinutesMap[s.subjectId] || 0) + Math.round(s.durationSeconds / 60);
  });

  // If no sessions yet today, provide a small friendly preview or actual zero state
  const hasSubjectData = Object.keys(subjectMinutesMap).length > 0;
  const pieData = hasSubjectData
    ? Object.entries(subjectMinutesMap).map(([subjectId, mins]) => {
        const sub = getSubjectById(subjectId);
        return {
          name: sub.nameAr,
          value: mins,
          color: sub.hexColor,
        };
      })
    : [
        { name: "لم تبدأ بعد", value: 1, color: "var(--color-border, #CBD5E1)" },
      ];

  // 7-Day Trend Mock / Computed Data
  const weeklyTrendData = [
    { day: "السبت", hours: 4.5, target: Number(targetHours) },
    { day: "الأحد", hours: 5.2, target: Number(targetHours) },
    { day: "الإثنين", hours: 6.0, target: Number(targetHours) },
    { day: "الثلاثاء", hours: 3.8, target: Number(targetHours) },
    { day: "الأربعاء", hours: 6.5, target: Number(targetHours) },
    { day: "الخميس", hours: 5.0, target: Number(targetHours) },
    { day: "اليوم", hours: Number(studiedHours), target: Number(targetHours) },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    onAddTask({
      text: newTaskText.trim(),
      subjectId: newTaskSubjectId,
      completed: false,
      priority: "high",
    });

    setNewTaskText("");
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const allTasksCompleted = tasks.length > 0 && completedCount === tasks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. DAILY 3 MUST-WIN TASKS & DAILY TARGET */}
      <div className="rounded-3xl bg-card border border-theme p-5 sm:p-7 shadow-clay space-y-6 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-theme-text font-serif">
                  مهام الحسم اليومية (Daily Must-Win)
                </h3>
                <p className="text-xs text-theme-muted mt-0.5">
                  حدد أهم 3 أولويات لا يمكن إنهاء يومك دون إنجازها.
                </p>
              </div>
            </div>

            {/* Completion ratio badge */}
            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-surface border border-theme text-theme-secondary">
              {completedCount} / {tasks.length} منجز
            </span>
          </div>

          {/* Goal vs Actual Progress Bar */}
          <div className="p-4 rounded-2xl bg-surface/70 border border-theme space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-theme-text">
                <Flame className="w-4 h-4 text-primary" />
                <span>الهدف اليومي:</span>
                <span className="font-mono text-primary font-black">
                  {studiedHours} / {targetHours} ساعات
                </span>
              </div>

              {/* Quick Target Changer */}
              <div className="flex items-center gap-1">
                {[4, 6, 8].map((h) => (
                  <button
                    key={h}
                    onClick={() => onUpdateTargetHours(h)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                      Number(targetHours) === h
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-theme text-theme-muted hover:text-theme-text"
                    }`}
                  >
                    {h}س
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 rounded-full bg-surface-soft border border-theme/50 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500 shadow-xs"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-theme-muted">
              <span>{goalPercentage}% تم تحقيقه من الهدف</span>
              {goalPercentage >= 100 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  أحسنت! حققت هدف اليوم 🎓
                </span>
              ) : (
                <span>متبقي {(Math.max(0, targetMinutesToday - totalStudiedMinutesToday) / 60).toFixed(1)} ساعة</span>
              )}
            </div>
          </div>

          {/* All Completed Celebration Alert */}
          {allTasksCompleted && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>رائع جداً! أنهيت جميع مهام الحسم لهذا اليوم بنجاح وامتياز 🌟</span>
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-2">
            {tasks.map((task) => {
              const sub = getSubjectById(task.subjectId);
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                    task.completed
                      ? "bg-surface/40 border-theme/40 opacity-70"
                      : "bg-surface border-theme hover:border-theme/80 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-theme-muted hover:text-emerald-500 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-bold truncate ${
                        task.completed
                          ? "line-through text-theme-muted"
                          : "text-theme-text"
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: sub.hexColor }}
                    >
                      {sub.nameAr}
                    </span>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 rounded-lg text-theme-muted hover:text-rose-500 transition-colors"
                      title="حذف المهمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Task Input Form */}
        <form onSubmit={handleCreateTask} className="pt-2 border-t border-theme/60 flex items-center gap-2">
          <input
            type="text"
            placeholder="أضف مهمة حاسمة جديدة..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-theme bg-surface text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-primary text-theme-text placeholder:text-theme-muted"
          />

          <select
            value={newTaskSubjectId}
            onChange={(e) => setNewTaskSubjectId(e.target.value)}
            className="px-2.5 py-2.5 rounded-xl border border-theme bg-surface text-xs font-bold text-theme-secondary focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            {YPT_BAC_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameAr}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0"
            title="إضافة المهمة"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 2. VISUAL ANALYTICS: SUBJECT DONUT & 7-DAY BAR CHART */}
      <div className="rounded-3xl bg-card border border-theme p-5 sm:p-7 shadow-clay space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-theme-text font-serif">
                إحصائيات توزيع التركيز
              </h3>
              <p className="text-xs text-theme-muted mt-0.5">
                توزيع ساعات المذاكرة لكل مادة ومقارنتها بالأسبوع.
              </p>
            </div>
          </div>
        </div>

        {/* Charts Container */}
        {isMounted ? (
          <div className="space-y-6">
            {/* Donut Chart: Subject Distribution */}
            <div className="p-3 rounded-2xl bg-surface/60 border border-theme">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-theme-text">توزيع جلسات اليوم:</span>
                <span className="text-[11px] text-theme-muted">
                  {sessions.length} جلسة مسجلة
                </span>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="p-2 rounded-xl bg-surface border border-theme shadow-md text-xs font-bold">
                              <p className="text-theme-text">{data.name}</p>
                              <p className="text-primary font-mono" dir="ltr">
                                {data.value} دقيقة
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Subject Breakdown Legend with Minutes */}
              {hasSubjectData && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-theme/40 justify-center">
                  {Object.entries(subjectMinutesMap).map(([subId, mins]) => {
                    const sub = getSubjectById(subId);
                    return (
                      <div
                        key={subId}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface border border-theme text-[11px]"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sub.hexColor }}
                        />
                        <span className="font-bold text-theme-text">{sub.nameAr}:</span>
                        <span className="font-mono text-theme-muted" dir="ltr">
                          {mins}د
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 7-Day Focus Trend Bar Chart */}
            <div className="p-3 rounded-2xl bg-surface/60 border border-theme">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-theme-text">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  <span>تطور التركيز خلال 7 أيام (ساعات):</span>
                </div>
                <span className="text-[10px] text-theme-muted">
                  الهدف اليومي: {targetHours}س
                </span>
              </div>

              <div className="h-40 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted, #888)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-muted, #888)" }} />
                    <ReferenceLine
                      y={Number(targetHours)}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{
                        value: "الهدف",
                        position: "insideTopRight",
                        fill: "#EF4444",
                        fontSize: 10,
                      }}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2 rounded-xl bg-surface border border-theme shadow-md text-xs font-bold">
                              <p className="text-theme-text">{data.day}</p>
                              <p className="text-primary font-mono">{data.hours} ساعات دراسة</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" fill="#2C5E54" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-theme-muted">
            جاري تحميل الرسوم البيانية...
          </div>
        )}
      </div>
    </div>
  );
}
