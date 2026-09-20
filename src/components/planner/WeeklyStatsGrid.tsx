"use client";

import React from "react";
import { useTheme } from "@/lib/theme/context";
import { PlannerWeeklyStats } from "@/lib/planner/types";
import { CheckCircle, Clock, BookOpen, TrendingUp, Award } from "lucide-react";

interface WeeklyStatsGridProps {
  stats: PlannerWeeklyStats;
  className?: string;
}

export const WeeklyStatsGrid: React.FC<WeeklyStatsGridProps> = ({
  stats,
  className = "",
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const formatHours = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const cards = [
    {
      title: "Tâches terminées",
      titleAr: "المهام المنجزة",
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      subtext: `${stats.completionRate}% du planning`,
      icon: CheckCircle,
      colorGirls: "from-pink-500/10 to-rose-500/10 text-[#E879A8] border-pink-200",
      colorBoys: "from-cyan-500/10 to-blue-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      title: "Temps d'étude",
      titleAr: "وقت المذاكرة",
      value: formatHours(stats.totalStudyMinutes),
      subtext: "Semaine en cours",
      icon: Clock,
      colorGirls: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200",
      colorBoys: "from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/30",
    },
    {
      title: "Matières étudiées",
      titleAr: "المواد المدروسة",
      value: `${stats.subjectsStudiedCount}`,
      subtext: "Équilibre hebdomadaire",
      icon: BookOpen,
      colorGirls: "from-amber-500/10 to-pink-500/10 text-amber-600 border-amber-200",
      colorBoys: "from-teal-500/10 to-cyan-500/10 text-teal-400 border-teal-500/30",
    },
    {
      title: "Progression",
      titleAr: "التقدم والالتزام",
      value: `+${stats.weeklyProgressRate}%`,
      subtext: `${stats.currentStreak} jours consécutifs 🔥`,
      icon: TrendingUp,
      colorGirls: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200",
      colorBoys: "from-emerald-500/10 to-cyan-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-heading">
          Statistiques de la semaine
        </h3>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            isGirls
              ? "bg-pink-100 text-pink-700"
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          }`}
        >
          إحصائيات الأسبوع
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border p-4 transition-all duration-300 shadow-clay ${
                isGirls
                  ? "bg-white/95 border-[#F8D7E3] text-[#4A2040]"
                  : "bg-[#101C38]/90 border-[#1E3160] text-slate-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-br ${
                    isGirls ? card.colorGirls : card.colorBoys
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-medium opacity-60 hidden sm:inline-block`}
                >
                  {card.titleAr}
                </span>
              </div>

              <div className="text-2xl font-black tracking-tight font-heading">
                {card.value}
              </div>

              <div className="text-xs font-semibold mt-1 truncate">
                {card.title}
              </div>

              <div
                className={`text-[11px] mt-0.5 truncate ${
                  isGirls ? "text-pink-700/70" : "text-slate-400"
                }`}
              >
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
