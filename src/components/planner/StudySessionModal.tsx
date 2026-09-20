"use client";

import React, { useState, useEffect } from "react";
import { PlannerEvent } from "@/lib/planner/types";
import { X, Play, Pause, CheckCircle2, RotateCcw, ExternalLink } from "lucide-react";
import Link from "next/link";

interface StudySessionModalProps {
  isOpen: boolean;
  event: PlannerEvent | null;
  onClose: () => void;
  onCompleteSession: (eventId: string, actualMinutes: number) => void;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  event,
  onClose,
  onCompleteSession,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(0);

  // Initialize timer whenever event changes or modal opens
  useEffect(() => {
    if (isOpen && event) {
      const totalSecs = (event.duration_minutes || 45) * 60;
      setSecondsRemaining(totalSecs);
      setInitialSeconds(totalSecs);
      setIsActive(true); // Auto-start countdown
    } else {
      setIsActive(false);
    }
  }, [isOpen, event]);

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  if (!isOpen || !event) return null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const elapsedSeconds = initialSeconds - secondsRemaining;
  const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));
  const progressPercent = initialSeconds > 0 ? (elapsedSeconds / initialSeconds) * 100 : 0;

  const handleFinish = () => {
    onCompleteSession(event.id, elapsedMins);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-center">
      <div className="w-full max-w-md rounded-3xl border border-theme bg-card text-theme-text shadow-clay p-6 sm:p-8 relative text-center transition-all">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-theme-muted hover:text-theme-text hover:bg-surface transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Task Info */}
        <div className="mb-4">
          <span className="inline-block text-[11px] px-3 py-1 rounded-full font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 mb-2">
            {event.subject_id || "جلسة مذاكرة"}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-theme-text font-sans leading-snug">
            {event.title}
          </h2>
          {event.description && (
            <p className="text-xs text-theme-secondary mt-1 max-w-xs mx-auto truncate font-medium">
              {event.description}
            </p>
          )}
        </div>

        {/* Radial Timer */}
        <div className="relative w-52 h-52 mx-auto my-5 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="82"
              stroke="currentColor"
              strokeWidth="9"
              fill="transparent"
              className="text-theme-muted/20"
            />
            <circle
              cx="100"
              cy="100"
              r="82"
              stroke="currentColor"
              strokeWidth="9"
              strokeDasharray={2 * Math.PI * 82}
              strokeDashoffset={2 * Math.PI * 82 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="text-[var(--color-primary)] transition-all duration-300"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black font-mono tracking-tight text-theme-text">
              {formattedTime}
            </span>
            <span className="text-xs text-theme-secondary font-bold mt-1">
              {isActive ? "تركيز تام 🎯" : "مؤقت متوقف مؤقتاً"}
            </span>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="py-2 px-4 rounded-xl text-xs font-bold max-w-xs mx-auto mb-5 bg-[var(--color-accent-soft)] text-[#8F5E1F] border border-[var(--color-accent)]/30 font-serif">
          « وما توفيقي إلا بالله عليه توكلت وإليه أنيب »
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all shadow-xs cursor-pointer ${
              isActive
                ? "bg-surface border border-theme text-theme-text hover:bg-card"
                : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
            }`}
            title={isActive ? "إيقاف مؤقت" : "استئناف"}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Finish & Log */}
          <button
            type="button"
            onClick={handleFinish}
            className="px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>إنهاء الجلسة ({elapsedMins} دقيقة)</span>
          </button>
        </div>

        {/* Practice Link */}
        <div className="pt-3 border-t border-theme">
          <Link
            href="/practice"
            target="_blank"
            className="text-xs font-bold inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
          >
            <span>فتح بنك التمارين على شاطر</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
