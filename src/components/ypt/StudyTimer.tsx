"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  CheckCircle2,
  Coffee,
  BookOpen,
  ArrowRight,
  Settings2,
} from "lucide-react";
import { YptSubject, StudySession, StudyTimerMode, PomodoroPhase } from "@/types/ypt";
import {
  YPT_BAC_SUBJECTS,
  BAC_MOTIVATIONAL_QUOTES,
  formatSecondsToTime,
} from "@/lib/ypt/yptData";
import { soundEngine, AmbientSoundType } from "@/lib/ypt/soundEngine";

interface StudyTimerProps {
  onSessionComplete?: (session: StudySession) => void;
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
}

export function StudyTimer({
  onSessionComplete,
  selectedSubjectId,
  onSelectSubject,
}: StudyTimerProps) {
  // Mode & Phase
  const [mode, setMode] = useState<StudyTimerMode>("stopwatch");
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("work");
  const [pomodoroWorkMinutes, setPomodoroWorkMinutes] = useState<number>(25);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState<number>(5);

  // Time in seconds
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Fullscreen Anti-Distraction
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedSubject =
    YPT_BAC_SUBJECTS.find((s) => s.id === selectedSubjectId) || YPT_BAC_SUBJECTS[0];

  // Rotate motivational quote every 20 seconds during fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % BAC_MOTIVATIONAL_QUOTES.length);
    }, 20000);
    return () => clearInterval(quoteInterval);
  }, [isFullscreen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Main Timer Interval
  useEffect(() => {
    if (isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === "stopwatch") {
            return prev + 1;
          } else {
            // Pomodoro countdown
            if (prev <= 1) {
              // Phase finished
              soundEngine.playChime();
              handlePomodoroPhaseSwitch();
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, pomodoroPhase, sessionStartTime]);

  // Switch between work & break when pomodoro countdown hits 0
  const handlePomodoroPhaseSwitch = () => {
    setIsRunning(false);
    if (pomodoroPhase === "work") {
      // Record completed work session
      recordCurrentSession(pomodoroWorkMinutes * 60);
      setPomodoroPhase("short_break");
      setSeconds(pomodoroBreakMinutes * 60);
    } else {
      setPomodoroPhase("work");
      setSeconds(pomodoroWorkMinutes * 60);
    }
  };

  // Sound handler
  const handleToggleSound = (sound: AmbientSoundType) => {
    const newSound = ambientSound === sound ? "none" : sound;
    setAmbientSound(newSound);
    soundEngine.setAmbientSound(newSound);
  };

  // Switch Mode (Stopwatch <-> Pomodoro)
  const handleSwitchMode = (newMode: StudyTimerMode) => {
    if (isRunning) {
      if (
        !window.confirm(
          "المؤقت قيد التشغيل حالياً. هل تريد إيقافه وتبديل النمط؟"
        )
      ) {
        return;
      }
    }
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "pomodoro") {
      setPomodoroPhase("work");
      setSeconds(pomodoroWorkMinutes * 60);
    } else {
      setSeconds(0);
    }
    setSessionStartTime(null);
  };

  // Toggle Start / Pause
  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      if (mode === "pomodoro" && seconds === 0) {
        setSeconds(
          pomodoroPhase === "work"
            ? pomodoroWorkMinutes * 60
            : pomodoroBreakMinutes * 60
        );
      }
    } else {
      setIsRunning(false);
    }
  };

  // Reset Timer
  const resetTimer = () => {
    if (isRunning || seconds > 0) {
      if (window.confirm("هل أنت متأكد من إعادة تعيين العداد؟")) {
        setIsRunning(false);
        setSeconds(
          mode === "stopwatch"
            ? 0
            : (pomodoroPhase === "work"
                ? pomodoroWorkMinutes
                : pomodoroBreakMinutes) * 60
        );
        setSessionStartTime(null);
      }
    }
  };

  // Record Completed Session
  const recordCurrentSession = (overrideDuration?: number) => {
    const duration =
      overrideDuration !== undefined
        ? overrideDuration
        : mode === "stopwatch"
        ? seconds
        : pomodoroWorkMinutes * 60 - seconds;

    if (duration < 30) {
      alert("الجلسة أقل من 30 ثانية ولم يتم تسجيلها كجلسة دراسية.");
      return;
    }

    const now = Date.now();
    const session: StudySession = {
      id: "sess_" + now + "_" + Math.random().toString(36).substring(2, 7),
      subjectId: selectedSubject.id,
      subjectNameAr: selectedSubject.nameAr,
      subjectHex: selectedSubject.hexColor,
      startTime: sessionStartTime || now - duration * 1000,
      endTime: now,
      durationSeconds: duration,
      date: new Date().toISOString().split("T")[0],
      mode: mode,
    };

    if (onSessionComplete) {
      onSessionComplete(session);
    }

    soundEngine.playChime();

    // Reset stopwatch after recording
    if (mode === "stopwatch") {
      setSeconds(0);
      setIsRunning(false);
      setSessionStartTime(null);
    }
  };

  const { hours, minutes, seconds: secStr, formatted } = formatSecondsToTime(seconds);

  // Compute progress for pomodoro circle
  const pomodoroTotalSec =
    (pomodoroPhase === "work" ? pomodoroWorkMinutes : pomodoroBreakMinutes) * 60;
  const pomodoroPercent =
    mode === "pomodoro"
      ? Math.max(0, Math.min(100, ((pomodoroTotalSec - seconds) / pomodoroTotalSec) * 100))
      : 100;

  return (
    <>
      {/* MAIN DESKTOP / MOBILE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-theme p-6 sm:p-8 shadow-clay transition-all">
        {/* Glow effect based on subject color */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: selectedSubject.hexColor }}
        />

        {/* Top Controls: Mode Switcher & Presets */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface rounded-2xl border border-theme text-xs font-black">
            <button
              onClick={() => handleSwitchMode("stopwatch")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === "stopwatch"
                  ? "bg-primary text-white shadow-xs"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              ⏱️ عداد تصاعدي
            </button>
            <button
              onClick={() => handleSwitchMode("pomodoro")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === "pomodoro"
                  ? "bg-primary text-white shadow-xs"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              🍅 بومودورو
            </button>
          </div>

          {/* Pomodoro Presets (visible in pomodoro mode) */}
          {mode === "pomodoro" && (
            <div className="flex items-center gap-1.5 text-xs">
              <button
                disabled={isRunning}
                onClick={() => {
                  setPomodoroWorkMinutes(25);
                  setPomodoroBreakMinutes(5);
                  setSeconds(25 * 60);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                  pomodoroWorkMinutes === 25
                    ? "border-primary text-primary bg-primary/10"
                    : "border-theme text-theme-muted hover:text-theme-text"
                }`}
              >
                25 / 5 د
              </button>
              <button
                disabled={isRunning}
                onClick={() => {
                  setPomodoroWorkMinutes(50);
                  setPomodoroBreakMinutes(10);
                  setSeconds(50 * 60);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                  pomodoroWorkMinutes === 50
                    ? "border-primary text-primary bg-primary/10"
                    : "border-theme text-theme-muted hover:text-theme-text"
                }`}
              >
                50 / 10 د
              </button>
            </div>
          )}

          {/* Ambient Sound Dropdown / Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleToggleSound("rain")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                ambientSound === "rain"
                  ? "bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400"
                  : "bg-surface border-theme text-theme-muted hover:text-theme-text"
              }`}
              title="صوت المطر الهادئ للتركيز"
            >
              🌧️ مطر
            </button>
            <button
              onClick={() => handleToggleSound("white_noise")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                ambientSound === "white_noise"
                  ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "bg-surface border-theme text-theme-muted hover:text-theme-text"
              }`}
              title="ضوضاء بيضاء للعزل الصوتي"
            >
              🌊 ضوضاء
            </button>
            <button
              onClick={() => handleToggleSound("alpha_waves")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                ambientSound === "alpha_waves"
                  ? "bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400"
                  : "bg-surface border-theme text-theme-muted hover:text-theme-text"
              }`}
              title="موجات ألفا الذهنية للتركيز العميق"
            >
              🧠 ألفا
            </button>
            {ambientSound !== "none" && (
              <button
                onClick={() => handleToggleSound("none")}
                className="p-1 rounded-lg text-theme-muted hover:text-rose-500 transition-colors"
                title="كتم الصوت"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Subject Selector Bar */}
        <div className="space-y-2 mb-8 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-theme-muted px-1">
            <span>المادة الجارية:</span>
            <span className="font-mono text-[11px] opacity-70">
              اختر المادة لتلوين خط الخريطة
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {YPT_BAC_SUBJECTS.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubject(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-primary bg-surface shadow-xs font-black scale-102"
                      : "bg-surface/60 border-theme hover:bg-surface text-theme-secondary opacity-75 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: isSelected ? sub.hexColor : undefined,
                    color: isSelected ? sub.hexColor : undefined,
                  }}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Display: Giant Digital Numbers & Pulsing Halo */}
        <div className="flex flex-col items-center justify-center my-6 relative z-10">
          {/* Active Subject Tag */}
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4 transition-colors"
            style={{
              backgroundColor: `${selectedSubject.hexColor}15`,
              color: selectedSubject.hexColor,
              border: `1px solid ${selectedSubject.hexColor}40`,
            }}
          >
            <span>{selectedSubject.icon}</span>
            <span>{selectedSubject.nameAr}</span>
            {isRunning && (
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedSubject.hexColor }} />
            )}
            {mode === "pomodoro" && (
              <span className="text-[10px] opacity-80 border-r border-current pr-1.5 mr-0.5">
                {pomodoroPhase === "work" ? "جلسة تركيز" : "استراحة مستحقة ☕"}
              </span>
            )}
          </div>

          {/* Glowing Timer Container */}
          <div className="relative flex items-center justify-center">
            {/* Visual halo ring */}
            <motion.div
              animate={{
                scale: isRunning ? [1, 1.04, 1] : 1,
                opacity: isRunning ? [0.4, 0.7, 0.4] : 0.2,
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute w-64 sm:w-72 h-64 sm:h-72 rounded-full blur-2xl pointer-events-none"
              style={{ backgroundColor: selectedSubject.hexColor }}
            />

            {/* High-visibility Monospace Digital Display (LTR forced for timer numerals) */}
            <div
              dir="ltr"
              className="relative px-8 py-6 rounded-3xl bg-surface/80 border border-theme/80 backdrop-blur-md shadow-inner flex items-center justify-center select-none"
            >
              <span className="font-mono text-5xl sm:text-7xl font-black tracking-tight text-theme-text drop-shadow-xs">
                {formatted}
              </span>
            </div>
          </div>

          {/* Subtext info */}
          <p className="text-xs text-theme-muted mt-3 font-medium">
            {isRunning
              ? "⚡ العداد يسجل وقت تركيزك الآن بدقة"
              : "اضغط على زر البدء لتسجيل جلسة المذاكرة"}
          </p>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-theme relative z-10">
          {/* Play / Pause Primary Button */}
          <button
            onClick={toggleTimer}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-black text-sm transition-all shadow-md hover:shadow-lg active:scale-95 group cursor-pointer"
            style={{
              backgroundColor: isRunning ? "#EF4444" : selectedSubject.hexColor,
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

          {/* Reset Button */}
          <button
            onClick={resetTimer}
            disabled={seconds === 0}
            className="p-3.5 rounded-2xl border border-theme bg-surface hover:bg-surface-soft text-theme-secondary hover:text-theme-text transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="إعادة تعيين العداد"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Save & Finish Session Button (if stopwatch has recorded time) */}
          {mode === "stopwatch" && seconds >= 30 && (
            <button
              onClick={() => recordCurrentSession()}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 font-bold text-xs transition-all shadow-xs"
              title="حفظ وإضافة إلى الخريطة الزمنية"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ الجلسة</span>
            </button>
          )}

          {/* Fullscreen Anti-Distraction Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface border border-theme hover:bg-surface-soft text-theme-secondary hover:text-theme-text font-bold text-xs transition-all"
            title="وضع التركيز الأقصى (شاشة كاملة)"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">شاشة التركيز القصوى</span>
          </button>
        </div>
      </div>

      {/* FULLSCREEN ANTI-DISTRACTION ZEN MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-[#090D14] text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none"
          >
            {/* Ambient Background Aura */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none blur-[120px] transition-all duration-1000"
              style={{
                background: `radial-gradient(circle at center, ${selectedSubject.hexColor} 0%, transparent 70%)`,
              }}
            />

            {/* Top Bar: Subject Badge, Sound, and Exit Button */}
            <div className="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto">
              {/* Subject Tag */}
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

              {/* Sound Controls in Fullscreen */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    onClick={() => handleToggleSound("rain")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      ambientSound === "rain"
                        ? "bg-sky-500 text-white font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    🌧️ مطر
                  </button>
                  <button
                    onClick={() => handleToggleSound("white_noise")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      ambientSound === "white_noise"
                        ? "bg-indigo-500 text-white font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    🌊 ضوضاء
                  </button>
                  <button
                    onClick={() => handleToggleSound("alpha_waves")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      ambientSound === "alpha_waves"
                        ? "bg-purple-500 text-white font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    🧠 ألفا
                  </button>
                </div>

                {/* Exit Fullscreen */}
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold transition-all text-white/90 hover:text-white"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">إنهاء وضع الشاشة الكاملة (Esc)</span>
                </button>
              </div>
            </div>

            {/* Center Area: Super Giant Timer */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <motion.div
                animate={{
                  scale: isRunning ? [1, 1.02, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                dir="ltr"
                className="font-mono text-7xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
              >
                {formatted}
              </motion.div>

              {/* Timer Control Buttons in Fullscreen */}
              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={toggleTimer}
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: isRunning ? "#EF4444" : selectedSubject.hexColor,
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                >
                  <p className="text-sm sm:text-base text-white/90 font-medium font-serif leading-relaxed">
                    ✨ {BAC_MOTIVATIONAL_QUOTES[currentQuoteIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
