"use client";

import React, { useState, useEffect } from "react";
import { Clock, Info, Sparkles } from "lucide-react";
import { YPT_BAC_SUBJECTS, getSubjectById, getCurrentSlotIndex } from "@/lib/ypt/yptData";
import { TimelineSlotData } from "@/types/ypt";

interface VisualTimelineProps {
  slots: (string | null)[]; // 144 slots
  onSlotClick?: (slotIndex: number) => void;
}

export function VisualTimeline({ slots, onSlotClick }: VisualTimelineProps) {
  const [hoveredSlot, setHoveredSlot] = useState<TimelineSlotData | null>(null);
  const [currentSlotIdx, setCurrentSlotIdx] = useState<number>(getCurrentSlotIndex());

  // Update current slot index every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlotIdx(getCurrentSlotIndex());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute total studied slots and minutes
  const studiedSlotsCount = slots.filter(Boolean).length;
  const totalStudiedMinutes = studiedSlotsCount * 10;
  const studiedHours = Math.floor(totalStudiedMinutes / 60);
  const studiedMins = totalStudiedMinutes % 60;

  // Build slot data for a specific index
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

  return (
    <div className="rounded-3xl bg-card border border-theme p-5 sm:p-7 shadow-clay relative overflow-hidden space-y-5">
      {/* Header with Title and Today's Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-theme-text font-serif">
                الخريطة الحرارية لـ 24 ساعة (YPT Timeline)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/15 text-primary">
                144 مربع
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-0.5">
              كل مكعب يعادل 10 دقائق دراسة مركزة ملونة حسب المادة.
            </p>
          </div>
        </div>

        {/* Total Focus Time Counter */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-surface px-3 py-1.5 rounded-2xl border border-theme">
          <span className="text-xs text-theme-muted font-bold">مجموع دراسة اليوم:</span>
          <span className="font-mono text-xs font-black text-primary" dir="ltr">
            {studiedHours > 0 ? `${studiedHours}h ` : ""}
            {studiedMins}m
          </span>
        </div>
      </div>

      {/* 24-HOUR INTERACTIVE HEAT GRID */}
      <div className="space-y-2">
        {/* Hour markers above grid */}
        <div
          dir="ltr"
          className="flex justify-between text-[10px] font-mono font-bold text-theme-muted px-1 select-none"
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

        {/* 144 Blocks Bar (Desktop single 144-slot continuous heat bar + responsive wrap support) */}
        <div
          dir="ltr"
          className="grid grid-cols-24 sm:grid-cols-48 md:grid-cols-72 lg:grid-cols-144 gap-[1.5px] p-2.5 rounded-2xl bg-surface/70 border border-theme shadow-inner select-none"
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
                onClick={() => {
                  setHoveredSlot(getSlotData(idx));
                  if (onSlotClick) onSlotClick(idx);
                }}
                className={`h-9 sm:h-11 rounded-sm transition-all duration-150 relative group ${
                  isCurrent
                    ? "ring-2 ring-rose-500 z-10 scale-105"
                    : "hover:scale-110 hover:z-10"
                }`}
                style={{
                  backgroundColor: subject ? subject.hexColor : "var(--color-surface, rgba(150,150,150,0.15))",
                  opacity: isStudied ? 1 : 0.4,
                }}
                aria-label={`الوقت ${Math.floor(idx / 6)}:${(idx % 6) * 10}`}
              >
                {/* Current time indicator dot */}
                {isCurrent && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Slot Inspector Tooltip / Details */}
        <div className="min-h-[2.5rem] flex items-center justify-between p-2.5 rounded-xl bg-surface/60 border border-theme text-xs">
          {hoveredSlot ? (
            <div className="flex items-center gap-3 w-full justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-theme-muted font-bold">الفترة:</span>
                <span className="font-mono font-black text-theme-text" dir="ltr">
                  {hoveredSlot.timeString}
                </span>
                {hoveredSlot.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-500 border border-rose-500/30">
                    الآن 🔴
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-theme-muted font-bold">المادة:</span>
                {hoveredSlot.subjectId ? (
                  <span
                    className="font-black px-2 py-0.5 rounded-md flex items-center gap-1 text-white shadow-2xs"
                    style={{ backgroundColor: hoveredSlot.subjectHex }}
                  >
                    {hoveredSlot.subjectNameAr}
                  </span>
                ) : (
                  <span className="text-theme-muted italic">فترة راحة / نوم 💤</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-theme-muted">
              <Info className="w-3.5 h-3.5" />
              <span>مرر الفأرة أو انقر على أي مكعب لمعرفة تفاصيل الدقائق والمادة.</span>
            </div>
          )}
        </div>
      </div>

      {/* Subject Color Legend */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-theme/60 scrollbar-none">
        <span className="text-[11px] font-bold text-theme-muted shrink-0">دليل الألوان:</span>
        {YPT_BAC_SUBJECTS.slice(0, 7).map((s) => (
          <div key={s.id} className="flex items-center gap-1 text-[11px] shrink-0 font-medium">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.hexColor }}
            />
            <span className="text-theme-secondary">{s.nameAr}</span>
          </div>
        ))}
        <span className="text-[10px] text-theme-muted shrink-0">+ باقي المواد</span>
      </div>
    </div>
  );
}
