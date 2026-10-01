"use client";

import React from "react";
import { useTheme } from "@/lib/theme/context";
import { PlannerWeeklyStats } from "@/lib/planner/types";
import { CheckCircle, Clock, BookOpen, TrendingUp, Sparkles } from "lucide-react";

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
    if (!minutes || minutes <= 0) return "0 د";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} دقيقة`;
    return mins > 0 ? `${hrs} سا و ${mins} د` : `${hrs} ساعات`;
  };

  const hasTasks = stats.totalTasks > 0;
  const hasStudyTime = stats.totalStudyMinutes > 0;
  const hasStreak = stats.currentStreak > 0;

  const cards = [
    {
      titleAr: "المهام المنجزة",
      value: hasTasks ? `${stats.completedTasks} / ${stats.totalTasks}` : "0",
      subtext: hasTasks
        ? `نسبة الإنجاز: ${stats.completionRate}%`
        : "لا توجد مهام مسجلة هذا الأسبوع",
      icon: CheckCircle,
      colorGirls: "from-pink-500/10 to-rose-500/10 text-[#E879A8] border-pink-200",
      colorBoys: "from-cyan-500/10 to-blue-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      titleAr: "وقت المذاكرة المسجل",
      value: formatHours(stats.totalStudyMinutes),
      subtext: hasStudyTime ? "إجمالي ساعات التركيز بالأسبوع" : "ابدأ جلسة مذاكرة لحساب الوقت",
      icon: Clock,
      colorGirls: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200",
      colorBoys: "from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/30",
    },
    {
      titleAr: "المواد المدروسة",
      value: stats.subjectsStudiedCount > 0 ? `${stats.subjectsStudiedCount} مواد` : "0",
      subtext: stats.subjectsStudiedCount > 0 ? "تنوع أسبوعي متوازن" : "وزّع مراجعتك حسب المعاملات",
      icon: BookOpen,
      colorGirls: "from-amber-500/10 to-pink-500/10 text-amber-600 border-amber-200",
      colorBoys: "from-teal-500/10 to-cyan-500/10 text-teal-400 border-teal-500/30",
    },
    {
      titleAr: "سلسلة الالتزام",
      value: hasStreak ? `${stats.currentStreak} ${stats.currentStreak === 1 ? "يوم" : "أيام"}` : "0 أيام",
      subtext: hasStreak ? "استمر على نفس الوتيرة 🔥" : "أنجز أول جلسة لبدء السلسلة 🔥",
      icon: TrendingUp,
      colorGirls: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200",
      colorBoys: "from-emerald-500/10 to-cyan-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className={`space-y-3 text-start ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-black text-theme-text font-sans">
            حصيلة الأسبوع الدراسي
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-surface border border-theme text-theme-secondary">
            بيانات واقعية
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                <span className="text-xs font-bold opacity-80">
                  {card.titleAr}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black tracking-tight font-heading">
                {card.value}
              </div>

              <div
                className={`text-[11px] mt-1 truncate font-medium ${
                  isGirls ? "text-pink-700/80" : "text-slate-400"
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

