"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { PlannerEvent } from "@/lib/planner/types";
import { X, Calendar, Clock, Sparkles, RotateCcw, ArrowRight } from "lucide-react";

interface PostponeModalProps {
  isOpen: boolean;
  event: PlannerEvent | null;
  onClose: () => void;
  onConfirmPostpone: (eventId: string, newDate: string, newStartTime?: string, reason?: string) => void;
}

export const PostponeModal: React.FC<PostponeModalProps> = ({
  isOpen,
  event,
  onClose,
  onConfirmPostpone,
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().split("T")[0];

  const [mode, setMode] = useState<"tomorrow" | "custom" | "smart">("tomorrow");
  const [customDate, setCustomDate] = useState(tomorrowIso);
  const [customTime, setCustomTime] = useState(event?.start_time || "10:00");
  const [reason, setReason] = useState("");

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetDate = tomorrowIso;
    let targetTime = event.start_time;

    if (mode === "custom") {
      targetDate = customDate;
      targetTime = customTime;
    } else if (mode === "smart") {
      // Pick 2 days from now at free afternoon slot
      const inTwoDays = new Date();
      inTwoDays.setDate(inTwoDays.getDate() + 2);
      targetDate = inTwoDays.toISOString().split("T")[0];
      targetTime = "16:00";
    }

    onConfirmPostpone(event.id, targetDate, targetTime, reason || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all ${
          isGirls
            ? "bg-white border-pink-200 text-[#4A2040]"
            : "bg-[#101C38] border-[#1E3160] text-slate-100"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading">
              Reporter la tâche
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isGirls
                  ? "bg-pink-100 text-pink-700"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              إعادة جدولة ⏩
            </span>
          </div>
          <p
            className={`text-xs mt-1 truncate ${
              isGirls ? "text-pink-600/70" : "text-slate-400"
            }`}
          >
            {event.title}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Options */}
          <div className="space-y-2.5">
            {/* Option 1: Tomorrow same time */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                mode === "tomorrow"
                  ? isGirls
                    ? "bg-pink-50/90 border-[#E879A8] ring-2 ring-pink-300"
                    : "bg-[#16274e] border-cyan-500 ring-2 ring-cyan-500/30"
                  : isGirls
                  ? "border-pink-200 bg-pink-50/20 hover:bg-pink-50"
                  : "border-slate-700 bg-slate-800/40 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="postpone_mode"
                  checked={mode === "tomorrow"}
                  onChange={() => setMode("tomorrow")}
                  className="accent-[#E879A8] dark:accent-cyan-400"
                />
                <div>
                  <div className="text-xs font-bold">Reporter à demain</div>
                  <div className="text-[10px] opacity-70">نفس التوقيت غداً</div>
                </div>
              </div>
              <Calendar className="w-4 h-4 opacity-50" />
            </label>

            {/* Option 2: Smart AI Redistribution */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                mode === "smart"
                  ? isGirls
                    ? "bg-pink-50/90 border-[#E879A8] ring-2 ring-pink-300"
                    : "bg-[#16274e] border-cyan-500 ring-2 ring-cyan-500/30"
                  : isGirls
                  ? "border-pink-200 bg-pink-50/20 hover:bg-pink-50"
                  : "border-slate-700 bg-slate-800/40 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="postpone_mode"
                  checked={mode === "smart"}
                  onChange={() => setMode("smart")}
                  className="accent-[#E879A8] dark:accent-cyan-400"
                />
                <div>
                  <div className="text-xs font-bold">Redistribution intelligente (IA)</div>
                  <div className="text-[10px] opacity-70">إيجاد أقرب خانة زمنية مناسبة تلقائياً</div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </label>

            {/* Option 3: Custom Date & Time */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                mode === "custom"
                  ? isGirls
                    ? "bg-pink-50/90 border-[#E879A8] ring-2 ring-pink-300"
                    : "bg-[#16274e] border-cyan-500 ring-2 ring-cyan-500/30"
                  : isGirls
                  ? "border-pink-200 bg-pink-50/20 hover:bg-pink-50"
                  : "border-slate-700 bg-slate-800/40 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="postpone_mode"
                  checked={mode === "custom"}
                  onChange={() => setMode("custom")}
                  className="accent-[#E879A8] dark:accent-cyan-400"
                />
                <div>
                  <div className="text-xs font-bold">Choisir une date précise</div>
                  <div className="text-[10px] opacity-70">تحديد موعد مخصص</div>
                </div>
              </div>
              <Clock className="w-4 h-4 opacity-50" />
            </label>
          </div>

          {/* Custom Date Inputs if mode === 'custom' */}
          {mode === "custom" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-80">
                  Nouvelle date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2 border outline-none ${
                    isGirls
                      ? "bg-white border-pink-200"
                      : "bg-[#152347] border-[#223668]"
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-80">
                  Heure de début
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2 border outline-none ${
                    isGirls
                      ? "bg-white border-pink-200"
                      : "bg-[#152347] border-[#223668]"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-[11px] font-bold mb-1 opacity-80">
              سبب التأجيل (اختياري)
            </label>
            <input
              type="text"
              placeholder="Ex: تعب، أو ضيق الوقت..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                isGirls
                  ? "bg-pink-50/40 border-pink-200 text-pink-950"
                  : "bg-[#152347] border-[#223668] text-slate-100"
              }`}
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isGirls
                  ? "bg-[#E879A8] text-white hover:bg-[#D46092]"
                  : "bg-[#0EA5E9] text-white hover:bg-cyan-600"
              }`}
            >
              Confirmer le report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
