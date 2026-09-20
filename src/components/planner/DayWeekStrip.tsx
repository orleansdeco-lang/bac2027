"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Bell } from "lucide-react";

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
  const activeDate = selectedDate || selectedDateIso || new Date().toISOString().split("T")[0];
  const setMode = (mode: "day" | "week" | "month") => {
    onChangeViewMode?.(mode);
    onViewModeChange?.(mode);
  };

  // Generate 7 days of the active week
  const curr = new Date(activeDate + "T00:00:00");
  const dayOfWeek = (curr.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(curr);
  monday.setDate(curr.getDate() - dayOfWeek);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayNumber = d.getDate();
    const dayNamesFr = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const dayNamesAr = ["إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"];
    return {
      date: dateStr,
      dayNumber,
      nameFr: dayNamesFr[i],
      nameAr: dayNamesAr[i],
      isToday: dateStr === new Date().toISOString().split("T")[0],
      isSelected: dateStr === activeDate,
    };
  });

  const formattedHeaderDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(curr);

  // Capitalize first letter
  const displayDateText =
    formattedHeaderDate.charAt(0).toUpperCase() + formattedHeaderDate.slice(1);

  const handlePrevWeek = () => {
    const prev = new Date(curr);
    prev.setDate(curr.getDate() - 7);
    onSelectDate(prev.toISOString().split("T")[0]);
  };

  const handleNextWeek = () => {
    const next = new Date(curr);
    next.setDate(curr.getDate() + 7);
    onSelectDate(next.toISOString().split("T")[0]);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top row: Date label + View mode selector + Prev/Next + Notification Bell */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[var(--color-primary)]" />
          <h2 className="text-sm sm:text-base font-black text-theme-text font-sans">
            {displayDateText}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-theme text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("day")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "day"
                  ? "bg-card text-theme-text shadow-sm border border-theme"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => setMode("week")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "week"
                  ? "bg-card text-theme-text shadow-sm border border-theme"
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
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg border border-theme hover:bg-surface text-theme-muted hover:text-theme-text transition-all"
              title="Semaine précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg border border-theme hover:bg-surface text-theme-muted hover:text-theme-text transition-all"
              title="Semaine suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl border border-theme hover:bg-surface transition-all"
              title="Notifications"
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

      {/* 7-Day Pill Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d) => (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelectDate(d.date)}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all duration-200 ${
              d.isSelected
                ? "bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)] shadow-md scale-105"
                : d.isToday
                ? "bg-surface border-[var(--color-primary)] text-theme-text ring-1 ring-[var(--color-primary)]"
                : "bg-card border-theme text-theme-muted hover:text-theme-text hover:border-theme-strong"
            }`}
          >
            <span className="text-[10px] sm:text-xs font-semibold uppercase">
              {d.nameFr}
            </span>
            <span className="text-base sm:text-lg font-black mt-0.5">
              {d.dayNumber}
            </span>
            <span className="text-[9px] opacity-70 hidden sm:inline-block mt-0.5">
              {d.nameAr}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
