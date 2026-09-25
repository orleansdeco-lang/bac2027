"use client";

import React, { useState } from "react";
import { useFocus } from "@/context/FocusContext";
import { ProductivityRating } from "@/types/focus";
import { formatMonospaceTime } from "@/lib/focus/focus-engine";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ThumbsUp,
  Meh,
  Frown,
  X,
  Target,
  FileCheck,
} from "lucide-react";

const RATING_OPTIONS: {
  id: ProductivityRating;
  labelAr: string;
  subAr: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  bgSelected: string;
}[] = [
  {
    id: "excellent",
    labelAr: "ممتازة (تدفق عميق)",
    subAr: "تركيز تام بدون تشتت",
    icon: Flame,
    colorClass: "text-amber-400",
    borderClass: "border-amber-500/40 hover:border-amber-400",
    bgSelected: "bg-amber-500/15 border-amber-400 text-amber-300 ring-2 ring-amber-500/30",
  },
  {
    id: "good",
    labelAr: "مليحة ومنتجة",
    subAr: "إنجاز واضح ومفيد",
    icon: ThumbsUp,
    colorClass: "text-emerald-400",
    borderClass: "border-emerald-500/40 hover:border-emerald-400",
    bgSelected: "bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30",
  },
  {
    id: "average",
    labelAr: "عادية ومقبولة",
    subAr: "تركيز متوسط أو تشتت طفيف",
    icon: Meh,
    colorClass: "text-blue-400",
    borderClass: "border-blue-500/40 hover:border-blue-400",
    bgSelected: "bg-blue-500/15 border-blue-400 text-blue-300 ring-2 ring-blue-500/30",
  },
  {
    id: "weak",
    labelAr: "ضعيفة أو متقطعة",
    subAr: "صعوبة في الاندماج والمتابعة",
    icon: Frown,
    colorClass: "text-rose-400",
    borderClass: "border-rose-500/40 hover:border-rose-400",
    bgSelected: "bg-rose-500/15 border-rose-400 text-rose-300 ring-2 ring-rose-500/30",
  },
];

export function SessionReflectionModal() {
  const { isReflectionModalOpen, pendingCompletedSession, activeSession, submitReflection } =
    useFocus();

  const [selectedRating, setSelectedRating] = useState<ProductivityRating>("good");
  const [reflectionText, setReflectionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReflectionModalOpen) return null;

  const session = pendingCompletedSession || activeSession;
  if (!session) return null;

  const elapsedSeconds = session.accumulatedElapsedSeconds || 0;
  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;

  let formattedTimeSummary = "";
  if (h > 0) {
    formattedTimeSummary = `${h} سا و ${m} د`;
  } else if (m > 0) {
    formattedTimeSummary = `${m} دقيقة${s > 0 ? ` و ${s} ثانية` : ""}`;
  } else {
    formattedTimeSummary = `${s} ثانية`;
  }

  const handleSubmit = async (ratingToSubmit?: ProductivityRating) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitReflection(ratingToSubmit || selectedRating, reflectionText.trim() || undefined);
    } finally {
      setIsSubmitting(false);
      setReflectionText("");
      setSelectedRating("good");
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitReflection("good", undefined);
    } finally {
      setIsSubmitting(false);
      setReflectionText("");
      setSelectedRating("good");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflection-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl p-5 sm:p-7 overflow-hidden text-right">
        {/* Subtle glowing ambient accent */}
        <div
          className="absolute -top-24 -right-24 w-52 h-52 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: session.subjectHex || "#10B981" }}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reflection-title" className="text-lg font-bold text-white">
                تمت الجلسة بنجاح!
              </h2>
              <p className="text-xs text-zinc-400">
                كيف كانت جودة تركيزك في هاذ الحصة؟
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="إغلاق وتخطي"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Session Stats Banner */}
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: session.subjectHex }}
            />
            <span className="text-xs font-bold text-zinc-200">
              {session.subjectNameAr}
            </span>
            {session.taskTitle && (
              <span className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                • {session.taskTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTimeSummary}</span>
          </div>
        </div>

        {/* Rating Options */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            تقييم جودة التركيز:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {RATING_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRating === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRating(opt.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? opt.bgSelected
                      : `bg-zinc-900/60 text-zinc-300 ${opt.borderClass}`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-4 h-4 ${opt.colorClass}`} />
                    <span className="text-xs font-bold">{opt.labelAr}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{opt.subAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Reflection / Accomplishments Note */}
        <div className="mb-6">
          <label
            htmlFor="reflection-notes"
            className="block text-xs font-semibold text-zinc-300 mb-1.5"
          >
            وش أنجزت في هاذ الجلسة؟ <span className="text-[10px] text-zinc-500 font-normal">(اختياري)</span>
          </label>
          <textarea
            id="reflection-notes"
            rows={2}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="مثلاً: حللت 4 تمارين في المتتاليات، ولخصت قانون حساب النهاية..."
            className="w-full text-xs bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-900 cursor-pointer"
          >
            تخطي بدون تدوين
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span>جاري الحفظ...</span>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>حفظ الجلسة في سجلي</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
