"use client";

import React from "react";
import { useTheme } from "@/lib/theme/context";
import { DailyReflection } from "@/lib/planner/types";
import { Clock, CheckCircle2, Flame, Award, PenTool, Sparkles, Smile, Meh, Frown } from "lucide-react";

interface TodayBilanSummaryProps {
  studyMinutesToday: number;
  tasksCompletedToday: number;
  tasksTotalToday: number;
  estimatedAverage?: number;
  streakDays: number;
  reflectionToday?: DailyReflection | null;
  onOpenReflectionModal: () => void;
  className?: string;
}

export const TodayBilanSummary: React.FC<TodayBilanSummaryProps> = ({
  studyMinutesToday,
  tasksCompletedToday,
  tasksTotalToday,
  estimatedAverage = 14.5,
  streakDays,
  reflectionToday,
  onOpenReflectionModal,
  className = "",
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const hrs = Math.floor(studyMinutesToday / 60);
  const mins = studyMinutesToday % 60;
  const timeFormatted = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const moodEmojis: Record<string, string> = {
    great: "😊",
    good: "🙂",
    neutral: "😐",
    hard: "😔",
    tired: "😴",
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 shadow-clay p-6 ${
        isGirls
          ? "bg-white/95 border-[#F8D7E3] text-[#4A2040]"
          : "bg-[#101C38]/90 border-[#1E3160] text-slate-100"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-heading">
              Bilan d'aujourd'hui
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isGirls
                  ? "bg-pink-100 text-pink-700"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              حصيلة اليوم
            </span>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isGirls ? "text-pink-600/70" : "text-slate-400"
            }`}
          >
            Ton rythme et tes accomplissements
          </p>
        </div>
      </div>

      {/* 4 Metric Chips */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Temps d'étude */}
        <div
          className={`p-3 rounded-2xl border ${
            isGirls
              ? "bg-pink-50/50 border-pink-100"
              : "bg-[#142244] border-[#223668]"
          }`}
        >
          <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Temps d'étude</span>
          </div>
          <div className="text-lg font-black font-heading tracking-tight">
            {timeFormatted}
          </div>
        </div>

        {/* Tâches */}
        <div
          className={`p-3 rounded-2xl border ${
            isGirls
              ? "bg-pink-50/50 border-pink-100"
              : "bg-[#142244] border-[#223668]"
          }`}
        >
          <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tâches</span>
          </div>
          <div className="text-lg font-black font-heading tracking-tight">
            {tasksCompletedToday}/{tasksTotalToday}
          </div>
        </div>

        {/* Moyenne estimée */}
        <div
          className={`p-3 rounded-2xl border ${
            isGirls
              ? "bg-pink-50/50 border-pink-100"
              : "bg-[#142244] border-[#223668]"
          }`}
        >
          <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Moyenne</span>
          </div>
          <div className="text-lg font-black font-heading tracking-tight">
            {estimatedAverage.toFixed(1)}
            <span className="text-xs font-normal opacity-60">/20</span>
          </div>
        </div>

        {/* Série */}
        <div
          className={`p-3 rounded-2xl border ${
            isGirls
              ? "bg-pink-50/50 border-pink-100"
              : "bg-[#142244] border-[#223668]"
          }`}
        >
          <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Série</span>
          </div>
          <div className="text-lg font-black font-heading tracking-tight text-amber-500">
            {streakDays} <span className="text-xs font-normal text-current">jours 🔥</span>
          </div>
        </div>
      </div>

      {/* Evening Reflection Trigger Box */}
      <div
        className={`rounded-2xl border p-4 transition-all duration-300 ${
          reflectionToday
            ? isGirls
              ? "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200"
              : "bg-[#16274e] border-[#28417c]"
            : isGirls
            ? "bg-pink-50/70 border-pink-200/80 hover:bg-pink-100/60"
            : "bg-[#152347] border-[#243a70] hover:bg-[#1b2d5a]"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#E879A8] dark:text-cyan-400" />
            <span className="text-xs font-bold font-heading">
              {reflectionToday ? "Bilan du soir enregistré" : "Bilan du soir (21:00)"}
            </span>
          </div>
          {reflectionToday?.mood && (
            <span className="text-xl" title={reflectionToday.mood}>
              {moodEmojis[reflectionToday.mood] || "✨"}
            </span>
          )}
        </div>

        {reflectionToday ? (
          <div className="space-y-1.5 text-xs">
            <p className="line-clamp-2 opacity-80 italic">
              "{reflectionToday.learned_today || "Bilan de la journée complété avec succès !"}"
            </p>
            <button
              type="button"
              onClick={onOpenReflectionModal}
              className={`text-[11px] font-semibold underline ${
                isGirls ? "text-[#E879A8]" : "text-cyan-400"
              }`}
            >
              Modifier mon bilan
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs opacity-75">
              Écris ce que tu as appris aujourd'hui et définis ton objectif de demain.
            </p>
            <button
              type="button"
              onClick={onOpenReflectionModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all shadow-sm ${
                isGirls
                  ? "bg-[#E879A8] text-white hover:bg-[#D46092]"
                  : "bg-[#0EA5E9] text-white hover:bg-cyan-600"
              }`}
            >
              Faire mon bilan ✍️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
