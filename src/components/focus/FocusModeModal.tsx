"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useFocus } from "@/context/FocusContext";
import {
  Play,
  Pause,
  Square,
  X,
  Minimize2,
  AlertOctagon,
  Sparkles,
  BookOpen,
  Target,
  Flame,
} from "lucide-react";
import { AmbientAudioPlayer } from "@/components/study-os";

export function FocusModeModal() {
  const {
    isFocusModeOpen,
    closeFocusMode,
    activeSession,
    elapsedSeconds,
    remainingSeconds,
    formattedElapsed,
    formattedRemaining,
    isRunning,
    isPaused,
    togglePauseResume,
    finishSession,
    abandonSession,
  } = useFocus();

  const [confirmAbandon, setConfirmAbandon] = useState(false);

  // Keyboard shortcut listener: Esc minimizes, Space pauses/resumes
  useEffect(() => {
    if (!isFocusModeOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if student is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeFocusMode();
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePauseResume();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusModeOpen, closeFocusMode, togglePauseResume]);

  if (!isFocusModeOpen || !activeSession) return null;

  const isCountdown = activeSession.targetDurationMinutes > 0;
  const displayTime = isCountdown ? formattedRemaining : formattedElapsed;
  const timeLabel = isCountdown ? "الوقت المتبقي" : "الوقت المنقضي";

  // Calculate percentage completed if countdown
  const totalTargetSeconds = activeSession.targetDurationMinutes * 60;
  const progressPercent = isCountdown && totalTargetSeconds > 0
    ? Math.min(100, Math.round((elapsedSeconds / totalTargetSeconds) * 100))
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-mode-title"
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 bg-zinc-950/98 backdrop-blur-2xl text-zinc-100 select-none animate-in fade-in duration-300"
    >
      {/* Background ambient subject glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 blur-[120px] pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: activeSession.subjectHex || "#10B981",
          transform: isRunning ? "translate(-50%, -50%) scale(1.1)" : "translate(-50%, -50%) scale(0.9)",
        }}
      />

      {/* Top Bar: Subject Badge + Status + Minimize Controls */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 shadow-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeSession.subjectHex }}
            />
            <span className="text-xs sm:text-sm font-bold text-white">
              {activeSession.subjectNameAr}
            </span>
          </div>

          {activeSession.mode !== "stopwatch" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>هدف: {activeSession.targetDurationMinutes} د</span>
            </span>
          )}
        </div>

        {/* Live Status indicator & Minimize */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isRunning ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">جلسة تركيز جارية</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                <span>متوقفة مؤقتاً</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={closeFocusMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all text-xs font-medium cursor-pointer"
            title="تصغير إلى الشاشة (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصغير</span>
          </button>
        </div>
      </header>

      {/* Center Core: Numerals + Mission Title + Progress Indicator */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Linked Task or Focus Goal */}
        {activeSession.taskTitle ? (
          <div className="mb-6 max-w-md mx-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 shadow-sm text-xs text-zinc-300">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white truncate">
              {activeSession.taskTitle}
            </span>
          </div>
        ) : (
          <div className="mb-4 text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>جلسة مراجعة وتركيز عالي</span>
          </div>
        )}

        {/* Monospace Clock Timer Display */}
        <div className="my-2 sm:my-4">
          <div
            id="focus-mode-title"
            dir="ltr"
            className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white tabular-nums transition-all drop-shadow-2xl"
          >
            {displayTime}
          </div>
          <div className="mt-2 text-xs sm:text-sm font-medium text-zinc-400">
            {timeLabel}
          </div>
        </div>

        {/* Progress Bar (if countdown mode) */}
        {isCountdown && progressPercent !== null && (
          <div className="w-full max-w-xs sm:max-w-sm mt-6">
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-2 font-mono">
              <span>{progressPercent}% مكتمل</span>
              <span>{Math.round(elapsedSeconds / 60)} / {activeSession.targetDurationMinutes} د</span>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Bar: Action Controls, Ambient Sound, & Abandon Dialog */}
      <footer className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center gap-3">
        {/* Embedded Ambient Audio Player (Focus Ambiance) */}
        {!confirmAbandon && (
          <AmbientAudioPlayer
            embedded
            className="w-full max-w-md shadow-2xl bg-zinc-950/85 border-zinc-800/80 backdrop-blur-xl"
          />
        )}

        {confirmAbandon ? (
          <div className="w-full p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-rose-300 text-xs font-bold mb-2">
              <AlertOctagon className="w-4 h-4" />
              <span>هل تريد فعلاً إلغاء هاذ الجلسة؟</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              إذا درست لأكثر من دقيقة، سيتم تسجيل الدقائق المنجزة كجلسة مبكرة.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmAbandon(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                تراجع وإكمال الجلسة
              </button>
              <button
                type="button"
                onClick={abandonSession}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
            {/* Abandon Button */}
            <button
              type="button"
              onClick={() => setConfirmAbandon(true)}
              className="p-3 sm:px-4 sm:py-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-rose-400 hover:border-rose-900/40 hover:bg-zinc-900 transition-all text-xs font-medium cursor-pointer"
              title="إلغاء الجلسة"
            >
              <X className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:inline">إلغاء الجلسة</span>
            </button>

            {/* Central Big Play/Pause Button */}
            <button
              type="button"
              onClick={togglePauseResume}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-3xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20"
                  : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
              }`}
              title={isRunning ? "إيقاف مؤقت (Space)" : "استئناف (Space)"}
            >
              {isRunning ? (
                <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              ) : (
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-0.5" />
              )}
            </button>

            {/* Finish Button */}
            <button
              type="button"
              onClick={finishSession}
              className="flex items-center gap-2 px-5 py-3 sm:py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white transition-all text-xs sm:text-sm font-bold shadow-md cursor-pointer hover:border-emerald-500/50"
              title="إنهاء الجلسة وتدوين التقييم"
            >
              <Square className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              <span>إنهاء وحفظ</span>
            </button>
          </div>
        )}

        {/* Calm Algerian BAC Motto */}
        <div className="text-[11px] text-zinc-500 text-center tracking-wide font-medium mt-2">
          « ماشي واش تقرا. كيفاش توصل. »
        </div>
      </footer>
    </div>
  );
}
