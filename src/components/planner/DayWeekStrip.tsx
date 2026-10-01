"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Bell } from "lucide-react";
import { getAlgeriaDateString, getAlgeriaWeekDays } from "@/lib/planner/algeria-date";

interface DayWeekStripProps {
  selectedDate?: string;
  selectedDateIso?: string;
  onSelectDate: (date: string) => void;
  viewMode?: "day" | "week" | "month";
  onChangeViewMode?: (mode: "day" | "week" | "month") => void;
  onViewModeChange?: (mode: any) => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  className?: string;
}

export const DayWeekStrip: React.FC<DayWeekStripProps> = ({
  selectedDate,
  selectedDateIso,
  onSelectDate,
  viewMode = "day",
  onChangeViewMode,
  onViewModeChange,
  notificationCount = 0,
  onOpenNotifications,
  className = "",
}) => {
  const todayAlgeria = getAlgeriaDateString();
  const activeDate = selectedDate || selectedDateIso || todayAlgeria;

  const setMode = (mode: "day" | "week" | "month") => {
    onChangeViewMode?.(mode);
    onViewModeChange?.(mode);
  };

  // Generate 7 days of the Algerian study week (starting Saturday)
  const days = getAlgeriaWeekDays(activeDate, activeDate);

  // Arabic formatted header date
  const [actY, actM, actD] = activeDate.split("-").map(Number);
  const activeDateObj = new Date(Date.UTC(actY, actM - 1, actD, 12, 0, 0));
  const formattedHeaderDate = new Intl.DateTimeFormat("ar-DZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(activeDateObj);

  const handlePrevWeek = () => {
    const [y, m, d] = activeDate.split("-").map(Number);
    const prev = new Date(Date.UTC(y, m - 1, d - 7, 12, 0, 0));
    const py = prev.getUTCFullYear();
    const pm = String(prev.getUTCMonth() + 1).padStart(2, "0");
    const pd = String(prev.getUTCDate()).padStart(2, "0");
    onSelectDate(`${py}-${pm}-${pd}`);
  };

  const handleNextWeek = () => {
    const [y, m, d] = activeDate.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 7, 12, 0, 0));
    const ny = next.getUTCFullYear();
    const nm = String(next.getUTCMonth() + 1).padStart(2, "0");
    const nd = String(next.getUTCDate()).padStart(2, "0");
    onSelectDate(`${ny}-${nm}-${nd}`);
  };

  return (
    <div className={`space-y-3 text-start ${className}`}>
      {/* Top row: Date label + View mode selector + Prev/Next + Notification Bell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[var(--color-primary)]" />
          <h2 className="text-sm sm:text-base font-black text-theme-text font-sans">
            {formattedHeaderDate}
          </h2>
          {activeDate === todayAlgeria && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              اليوم
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-theme text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("day")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "day"
                  ? "bg-card text-theme-text shadow-xs border border-theme"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => setMode("week")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "week"
                  ? "bg-card text-theme-text shadow-xs border border-theme"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              الأسبوع
            </button>
          </div>

          {/* Week Pagination */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg border border-theme hover:bg-surface text-theme-muted hover:text-theme-text transition-all cursor-pointer"
              title="الأسبوع القادم"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg border border-theme hover:bg-surface text-theme-muted hover:text-theme-text transition-all cursor-pointer"
              title="الأسبوع السابق"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl border border-theme hover:bg-surface transition-all cursor-pointer"
              title="التنبيهات"
            >
              <Bell className="w-4 h-4 text-theme-text" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Pill Strip (Saturday through Friday) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d) => (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelectDate(d.date)}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer ${
              d.isSelected
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md scale-102"
                : d.isToday
                ? "bg-surface border-[var(--color-primary)] text-theme-text ring-1 ring-[var(--color-primary)]"
                : "bg-card border-theme text-theme-muted hover:text-theme-text hover:border-theme-strong"
            }`}
          >
            <span className="text-[11px] sm:text-xs font-bold">
              {d.nameAr}
            </span>
            <span className="text-base sm:text-lg font-black mt-0.5">
              {d.dayNumber}
            </span>
            <span className="text-[9px] opacity-60 uppercase font-mono hidden sm:inline-block mt-0.5">
              {d.nameFr}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

