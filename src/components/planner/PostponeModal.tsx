"use client";

import React, { useState } from "react";
import { PlannerEvent } from "@/lib/planner/types";
import { X, RotateCcw, Calendar, Sparkles, Clock } from "lucide-react";

interface PostponeModalProps {
  isOpen: boolean;
  event: PlannerEvent | null;
  onClose: () => void;
  onConfirmPostpone: (
    eventId: string,
    newDate: string,
    newStartTime?: string,
    reason?: string
  ) => void;
}

export const PostponeModal: React.FC<PostponeModalProps> = ({
  isOpen,
  event,
  onClose,
  onConfirmPostpone,
}) => {
  const [mode, setMode] = useState<"tomorrow" | "smart" | "custom">("tomorrow");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("18:00");
  const [reason, setReason] = useState("");

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetDate = event.date;
    let targetTime = event.start_time;

    if (mode === "tomorrow") {
      const d = new Date(event.date + "T00:00:00");
      d.setDate(d.getDate() + 1);
      targetDate = d.toISOString().split("T")[0];
    } else if (mode === "smart") {
      const d = new Date(event.date + "T00:00:00");
      d.setDate(d.getDate() + 1);
      targetDate = d.toISOString().split("T")[0];
      targetTime = "19:00";
    } else if (mode === "custom" && customDate) {
      targetDate = customDate;
      targetTime = customTime || event.start_time;
    }

    onConfirmPostpone(event.id, targetDate, targetTime, reason || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-start">
      <div className="w-full max-w-md rounded-3xl border border-theme bg-card text-theme-text shadow-clay p-6 sm:p-7 relative transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-theme-muted hover:text-theme-text hover:bg-surface transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-theme-text font-sans">
              تأجيل المهمة
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[var(--color-accent-soft)] text-[#8F5E1F] border border-[var(--color-accent)]/30">
              إعادة جدولة ⏩
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-1 font-bold truncate">
            {event.title}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Options */}
          <div className="space-y-2.5">
            {/* Option 1: Tomorrow */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                mode === "tomorrow"
                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs"
                  : "bg-surface border-theme text-theme-secondary hover:text-theme-text"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="postpone_mode"
                  checked={mode === "tomorrow"}
                  onChange={() => setMode("tomorrow")}
                  className="accent-[var(--color-primary)]"
                />
                <div>
                  <div className="text-xs font-bold text-theme-text">تأجيل إلى يوم الغد</div>
                  <div className="text-[10px] text-theme-secondary font-medium">بنفس التوقيت المحدد</div>
                </div>
              </div>
              <Calendar className="w-4 h-4 opacity-60" />
            </label>

            {/* Option 2: Smart */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                mode === "smart"
                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs"
                  : "bg-surface border-theme text-theme-secondary hover:text-theme-text"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="postpone_mode"
                  checked={mode === "smart"}
                  onChange={() => setMode("smart")}
                  className="accent-[var(--color-primary)]"
                />
                <div>
                  <div className="text-xs font-bold text-theme-text">إعادة توزيع ذكي (شاطر)</div>
                  <div className="text-[10px] text-theme-secondary font-medium">إيجاد أقرب خانة زمنية ملائمة</div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </label>

            {/* Option 3: Custom Date & Time */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                mode === "custom"
                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs"
                  : "bg-surface border-theme text-theme-secondary hover:text-theme-text"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="postpone_mode"
                  checked={mode === "custom"}
                  onChange={() => setMode("custom")}
                  className="accent-[var(--color-primary)]"
                />
                <div>
                  <div className="text-xs font-bold text-theme-text">اختيار تاريخ ووقت مخصص</div>
                  <div className="text-[10px] text-theme-secondary font-medium">تحديد موعد دقيق باليوم والساعة</div>
                </div>
              </div>
              <Clock className="w-4 h-4 opacity-60" />
            </label>
          </div>

          {/* Custom Date Inputs if mode === 'custom' */}
          {mode === "custom" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-theme-text mb-1">
                  التاريخ الجديد
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl p-2 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-theme-text mb-1">
                  توقيت البداية
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl p-2 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-[11px] font-bold text-theme-text mb-1">
              سبب التأجيل (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: تعب أو وجود واجبات أخرى..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs font-medium rounded-xl p-2.5 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-text cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-xs transition-all cursor-pointer"
            >
              تأكيد التأجيل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
