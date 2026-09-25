"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Target,
  Sparkles,
  Flame,
  Info,
  Calendar,
  Volume2,
} from "lucide-react";
import { useTimer } from "@/context/TimerContext";
import {
  YPT_BAC_SUBJECTS,
  BAC_MOTIVATIONAL_QUOTES,
  formatSecondsToTime,
  getSubjectById,
  getCurrentSlotIndex,
} from "@/lib/ypt/yptData";
import { TimelineSlotData } from "@/types/ypt";

export function PersonalDeskView() {
  const {
    mode,
    pomodoroPhase,
    pomodoroWorkMinutes,
    pomodoroBreakMinutes,
    seconds,
    isRunning,
    selectedSubjectId,
    selectedSubject,
    startTimer,
    pauseTimer,
    toggleTimer,
    resetTimer,
    switchMode,
    setPomodoroPreset,
    selectSubject,
    recordCurrentSession,
    isFullscreen,
    setIsFullscreen,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    slots,
    targetMinutes,
    streakDays,
  } = useTimer();

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [hoveredSlot, setHoveredSlot] = useState<TimelineSlotData | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskSubjectId, setNewTaskSubjectId] = useState("math");
  const [currentSlotIdx, setCurrentSlotIdx] = useState(getCurrentSlotIndex());

  // Update current slot index
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlotIdx(getCurrentSlotIndex());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Rotate motivational quote
  useEffect(() => {
    if (!isFullscreen) return;
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % BAC_MOTIVATIONAL_QUOTES.length);
    }, 18000);
    return () => clearInterval(quoteInterval);
  }, [isFullscreen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, setIsFullscreen]);

  const { formatted } = formatSecondsToTime(seconds);

  // Compute total studied today from slots
  const studiedSlotsCount = slots.filter(Boolean).length;
  const totalStudiedMinutes = studiedSlotsCount * 10;
  const studiedHours = (totalStudiedMinutes / 60).toFixed(1);
  const targetHours = (targetMinutes / 60).toFixed(0);

  // Slot helper
  const getSlotData = (idx: number): TimelineSlotData => {
    const hour = Math.floor(idx / 6);
    const minute = (idx % 6) * 10;
    const nextMinute = minute + 10;
    const nextHour = nextMinute === 60 ? (hour + 1) % 24 : hour;
    const endMin = nextMinute === 60 ? 0 : nextMinute;

    const timeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} - ${String(
      nextHour
    ).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    const subjectId = slots[idx] || null;
    const subject = subjectId ? getSubjectById(subjectId) : undefined;

    return {
      index: idx,
      hour,
      minute,
      timeString,
      subjectId,
      subjectNameAr: subject?.nameAr,
      subjectHex: subject?.hexColor,
      isCurrent: idx === currentSlotIdx,
    };
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(newTaskText.trim(), newTaskSubjectId);
    setNewTaskText("");
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 select-none">
      {/* 1. HERO INTRO BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0E131F] border border-white/10 shadow-2xl relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: selectedSubject.hexColor }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            🖥️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white font-serif">
                المكتب الشخصي — التركيز والانضباط
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                وضع المذاكرة الفردية
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              اضبط العداد، حدد المادة، وابدأ جلستك. خريطتك الزمنية ومهام الحسم تُسجل تلقائياً بدقة.
            </p>
          </div>
        </div>

        {/* Quick Hero Metrics */}
        <div className="flex items-center gap-3 relative z-10 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <span className="block text-[10px] text-slate-400">سلسلة الالتزام:</span>
              <span className="font-mono text-xs font-black text-white">
                {streakDays} أيام 🔥
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="block text-[10px] text-slate-400">إنجاز اليوم:</span>
              <span className="font-mono text-xs font-black text-white" dir="ltr">
                {studiedHours}h / {targetHours}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE CENTRAL INTERACTIVE STUDY TIMER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0E131F] border border-white/10 p-6 sm:p-8 shadow-2xl">
        {/* Glow behind timer */}
        <div
          className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: selectedSubject.hexColor }}
        />

        {/* Top Controls: Mode Switcher & Presets */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => switchMode("stopwatch")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === "stopwatch"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⏱️ عداد تصاعدي
            </button>
            <button
              onClick={() => switchMode("pomodoro")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === "pomodoro"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🍅 بومودورو
            </button>
          </div>

          {/* Pomodoro Presets */}
          {mode === "pomodoro" && (
            <div className="flex items-center gap-2 text-xs">
              <button
                disabled={isRunning}
                onClick={() => setPomodoroPreset(25, 5)}
                className={`px-3 py-1 rounded-xl border font-bold transition-all ${
                  pomodoroWorkMinutes === 25
                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                    : "border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                25 / 5 دقيقة
              </button>
              <button
                disabled={isRunning}
                onClick={() => setPomodoroPreset(50, 10)}
                className={`px-3 py-1 rounded-xl border font-bold transition-all ${
                  pomodoroWorkMinutes === 50
                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                    : "border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                50 / 10 دقيقة
              </button>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">شاشة التركيز القصوى</span>
          </button>
        </div>

        {/* Subject Selection Pills Bar */}
        <div className="space-y-2 mb-8 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span>اختر المادة الجارية:</span>
            <span className="text-[11px] opacity-70">
              تحدد لون الخريطة والعداد تلقائياً
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {YPT_BAC_SUBJECTS.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;
              return (
                <button
                  key={sub.id}
                  onClick={() => selectSubject(sub.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isSelected
                      ? "bg-white/10 border-white/40 text-white font-black scale-105 shadow-md"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                  style={{
                    borderColor: isSelected ? sub.hexColor : undefined,
                    boxShadow: isSelected ? `0 0 15px ${sub.hexColor}40` : undefined,
                  }}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Digital Display & Glowing Pulse */}
        <div className="flex flex-col items-center justify-center my-6 relative z-10">
          {/* Active Subject Tag */}
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4 border"
            style={{
              backgroundColor: `${selectedSubject.hexColor}20`,
              borderColor: `${selectedSubject.hexColor}60`,
              color: "#FFFFFF",
            }}
          >
            <span>{selectedSubject.icon}</span>
            <span>{selectedSubject.nameAr}</span>
            {isRunning && (
              <span
                className="w-2 h-2 rounded-full animate-ping ml-1"
                style={{ backgroundColor: selectedSubject.hexColor }}
              />
            )}
            {mode === "pomodoro" && (
              <span className="text-[10px] opacity-80 border-r border-white/20 pr-1.5 mr-0.5">
                {pomodoroPhase === "work" ? "جلسة تركيز" : "استراحة مستحقة ☕"}
              </span>
            )}
          </div>

          {/* Central Halo & Timer */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: isRunning ? [1, 1.05, 1] : 1,
                opacity: isRunning ? [0.3, 0.6, 0.3] : 0.15,
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: selectedSubject.hexColor }}
            />

            <div
              dir="ltr"
              className="relative px-8 sm:px-12 py-6 sm:py-8 rounded-3xl bg-[#080C14]/90 border border-white/15 backdrop-blur-md shadow-2xl flex items-center justify-center"
            >
              <span className="font-mono text-6xl sm:text-8xl font-black tracking-tight text-white drop-shadow-md">
                {formatted}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 font-medium">
            {isRunning
              ? "⚡ العداد يسجل وقت تركيزك الآن بدقة"
              : "اضغط على زر البدء لتسجيل جلسة المذاكرة"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-5 border-t border-white/10 relative z-10">
          <button
            onClick={toggleTimer}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-slate-950 font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: isRunning ? "#EF4444" : "#F59E0B",
              color: isRunning ? "#FFFFFF" : "#0A0E17",
            }}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{seconds > 0 ? "استئناف التركيز" : "بدء الجلسة"}</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            disabled={seconds === 0}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
            title="إعادة ضبط العداد"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {mode === "stopwatch" && seconds >= 30 && (
            <button
              onClick={() => recordCurrentSession()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs transition-all shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>حفظ الجلسة وإضافتها للخريطة</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. 24-HOUR VISUAL HEAT TIMELINE (YPT Signature 144 Blocks) */}
      <div className="rounded-3xl bg-[#0E131F] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-serif">
                  الخريطة الحرارية لـ 24 ساعة (YPT Timeline)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-slate-300">
                  144 مكعباً
                </span>
              </div>
              <p className="text-xs text-slate-400">
                كل مكعب يعادل 10 دقائق دراسة مركزة ملونة حسب المادة المدروسة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-400 font-bold">مجموع اليوم:</span>
            <span className="font-mono text-amber-400 font-black" dir="ltr">
              {studiedHours}h
            </span>
          </div>
        </div>

        {/* 144 Heat Blocks Grid */}
        <div className="space-y-2">
          <div
            dir="ltr"
            className="flex justify-between text-[10px] font-mono font-bold text-slate-500 px-1"
          >
            <span>00:00</span>
            <span>03:00</span>
            <span>06:00</span>
            <span>09:00</span>
            <span>12:00</span>
            <span>15:00</span>
            <span>18:00</span>
            <span>21:00</span>
            <span>23:50</span>
          </div>

          <div
            dir="ltr"
            className="grid grid-cols-24 sm:grid-cols-48 md:grid-cols-72 lg:grid-cols-144 gap-[1.5px] p-2.5 rounded-2xl bg-[#080C14] border border-white/10 shadow-inner"
          >
            {Array.from({ length: 144 }).map((_, idx) => {
              const subjectId = slots[idx];
              const subject = subjectId ? getSubjectById(subjectId) : null;
              const isCurrent = idx === currentSlotIdx;
              const isStudied = Boolean(subject);

              return (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => setHoveredSlot(getSlotData(idx))}
                  onMouseLeave={() => setHoveredSlot(null)}
                  className={`h-9 sm:h-11 rounded-xs transition-all duration-150 relative ${
                    isCurrent ? "ring-2 ring-amber-400 z-10 scale-105" : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: subject ? subject.hexColor : "rgba(255, 255, 255, 0.06)",
                    opacity: isStudied ? 1 : 0.4,
                  }}
                />
              );
            })}
          </div>

          {/* Slot Info Tooltip */}
          <div className="min-h-[2.5rem] flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            {hoveredSlot ? (
              <div className="flex items-center gap-3 w-full justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">الفترة:</span>
                  <span className="font-mono font-black text-white" dir="ltr">
                    {hoveredSlot.timeString}
                  </span>
                  {hoveredSlot.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      الآن 🔴
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">المادة:</span>
                  {hoveredSlot.subjectId ? (
                    <span
                      className="font-bold px-2 py-0.5 rounded text-white text-[11px]"
                      style={{ backgroundColor: hoveredSlot.subjectHex }}
                    >
                      {hoveredSlot.subjectNameAr}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">فترة راحة / نوم 💤</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Info className="w-3.5 h-3.5" />
                <span>مرر الفأرة على أي مكعب لمعرفة تفاصيل الدقائق والمادة.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. DAILY 3 MUST-WIN TASKS */}
      <div className="rounded-3xl bg-[#0E131F] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-serif">
                مهام الحسم اليومية (Daily 3 Must-Win)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                حدد 3 أهداف أساسية لا ينتهي يومك إلا بإنجازها لتحقيق الامتياز.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-black bg-white/5 border border-white/10 text-amber-300">
            {completedTasksCount} / {tasks.length} منجز
          </span>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {tasks.map((task) => {
            const sub = getSubjectById(task.subjectId);
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                  task.completed
                    ? "bg-white/5 border-white/5 opacity-60"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <span
                    className={`text-xs sm:text-sm font-bold truncate ${
                      task.completed ? "line-through text-slate-400" : "text-white"
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: sub.hexColor }}
                  >
                    {sub.nameAr}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Task Input Form */}
        <form onSubmit={handleCreateTask} className="flex items-center gap-2 pt-2 border-t border-white/10">
          <input
            type="text"
            placeholder="أضف مهمة حاسمة جديدة لليوم..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-[#080C14] text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-white placeholder:text-slate-500"
          />

          <select
            value={newTaskSubjectId}
            onChange={(e) => setNewTaskSubjectId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/10 bg-[#080C14] text-xs font-bold text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            {YPT_BAC_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0E131F]">
                {s.nameAr}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="p-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* FULLSCREEN ANTI-DISTRACTION ZEN MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-[#05080E] text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none"
          >
            {/* Ambient Background Aura */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none blur-[140px] transition-all duration-1000"
              style={{
                background: `radial-gradient(circle at center, ${selectedSubject.hexColor} 0%, transparent 70%)`,
              }}
            />

            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black border backdrop-blur-md"
                style={{
                  backgroundColor: `${selectedSubject.hexColor}25`,
                  borderColor: `${selectedSubject.hexColor}60`,
                  color: "#FFFFFF",
                }}
              >
                <span>{selectedSubject.icon}</span>
                <span>{selectedSubject.nameAr}</span>
                {isRunning && (
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-ping ml-1"
                    style={{ backgroundColor: selectedSubject.hexColor }}
                  />
                )}
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold transition-all"
              >
                <Minimize2 className="w-4 h-4" />
                <span>إنهاء وضع الشاشة الكاملة (Esc)</span>
              </button>
            </div>

            {/* Center Area: Super Giant Timer */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <motion.div
                animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                dir="ltr"
                className="font-mono text-7xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
              >
                {formatted}
              </motion.div>

              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={toggleTimer}
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl text-slate-950 font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: isRunning ? "#EF4444" : "#F59E0B",
                    color: isRunning ? "#FFFFFF" : "#0A0E17",
                  }}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-6 h-6 fill-current" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 fill-current" />
                      <span>{seconds > 0 ? "استئناف" : "بدء الجلسة"}</span>
                    </>
                  )}
                </button>

                {mode === "stopwatch" && seconds >= 30 && (
                  <button
                    onClick={() => {
                      recordCurrentSession();
                      setIsFullscreen(false);
                    }}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-lg hover:bg-emerald-600 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>حفظ وإنهاء</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Bar: Ambient BAC Motivational Quote */}
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-sm sm:text-base text-amber-200 font-medium font-serif leading-relaxed">
                  ✨ {BAC_MOTIVATIONAL_QUOTES[currentQuoteIndex]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
