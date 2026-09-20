"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme/context";
import { PlannerEvent } from "@/lib/planner/types";
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ExternalLink,
  RotateCcw,
  Sparkles
} from "lucide-react";

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
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const targetMinutes = event?.duration_minutes || 45;
  const initialSeconds = targetMinutes * 60;

  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Sync state when event changes or modal opens
  useEffect(() => {
    if (event) {
      const totalSecs = (event.duration_minutes || 45) * 60;
      setSecondsRemaining(totalSecs);
      setElapsedSeconds(0);
      setIsActive(true);
    }
  }, [event, isOpen]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && isOpen && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(prev - 1, 0));
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, isOpen, secondsRemaining]);

  if (!isOpen || !event) return null;

  const minsLeft = Math.floor(secondsRemaining / 60);
  const secsLeft = secondsRemaining % 60;
  const formattedTime = `${String(minsLeft).padStart(2, "0")}:${String(secsLeft).padStart(2, "0")}`;

  const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / initialSeconds) * 100));

  const handleFinish = () => {
    onCompleteSession(event.id, elapsedMins);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 relative text-center transition-all ${
          isGirls
            ? "bg-white border-pink-200 text-[#4A2040]"
            : "bg-[#0F1B3B] border-[#1E3160] text-slate-100"
        }`}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Task Info */}
        <div className="mb-6">
          <span
            className={`inline-block text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-2 ${
              isGirls
                ? "bg-pink-100 text-pink-800"
                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            }`}
          >
            {event.subject_id || "Session de travail"}
          </span>
          <h2 className="text-xl font-black font-heading leading-snug">
            {event.title}
          </h2>
          {event.description && (
            <p className="text-xs opacity-75 mt-1 max-w-xs mx-auto truncate">
              {event.description}
            </p>
          )}
        </div>

        {/* Big Circular / Radial Timer */}
        <div className="relative w-56 h-56 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className={isGirls ? "text-pink-100" : "text-[#1C2C54]"}
            />
            {/* Progress ring */}
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 85}
              strokeDashoffset={2 * Math.PI * 85 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-300 ${
                isGirls ? "text-[#E879A8]" : "text-[#0EA5E9]"
              }`}
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black font-mono tracking-tight">
              {formattedTime}
            </span>
            <span className="text-xs opacity-70 mt-1 font-sans">
              {isActive ? "Reste concentré 🧘" : "En pause"}
            </span>
          </div>
        </div>

        {/* Motivational pill */}
        <div
          className={`py-2 px-4 rounded-xl text-xs font-medium max-w-xs mx-auto mb-6 ${
            isGirls
              ? "bg-pink-50 text-[#B8487A] border border-pink-200"
              : "bg-[#152347] text-cyan-300 border border-[#223668]"
          }`}
        >
          {isGirls
            ? "« اللهم لا سهل إلا ما جعلته سهلاً » 🌸"
            : "« وما توفيقي إلا بالله عليه توكلت » ⚡"}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              isActive
                ? isGirls
                  ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                : isGirls
                ? "bg-[#E879A8] text-white hover:bg-[#D46092]"
                : "bg-[#0EA5E9] text-white hover:bg-cyan-600"
            }`}
            title={isActive ? "Mettre en pause" : "Reprendre"}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          {/* Finish & Log */}
          <button
            type="button"
            onClick={handleFinish}
            className={`px-5 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isGirls
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Terminer la session ({elapsedMins}m)</span>
          </button>
        </div>

        {/* BAC Mastery Mission Bridge */}
        <div className="pt-4 border-t border-theme">
          <Link
            href="/practice"
            target="_blank"
            className={`text-xs font-medium inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity ${
              isGirls ? "text-[#B8487A]" : "text-cyan-400"
            }`}
          >
            <span>Pratiquer les exercices sur SHATER Mastery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
