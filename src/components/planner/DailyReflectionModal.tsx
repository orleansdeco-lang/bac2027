"use client";

import React, { useState } from "react";
import { DailyReflection, ReflectionMood } from "@/lib/planner/types";
import { X, PenTool, Sparkles, Smile, Meh, Frown, Heart } from "lucide-react";

interface DailyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReflection: (
    reflection: Omit<DailyReflection, "id" | "created_at" | "updated_at">
  ) => void;
  currentReflection?: DailyReflection | null;
  dateIso: string;
}

export const DailyReflectionModal: React.FC<DailyReflectionModalProps> = ({
  isOpen,
  onClose,
  onSaveReflection,
  currentReflection,
  dateIso,
}) => {
  const [mood, setMood] = useState<ReflectionMood>(
    currentReflection?.mood || "good"
  );
  const [learnedToday, setLearnedToday] = useState(
    currentReflection?.learned_today || ""
  );
  const [hardestChallenge, setHardestChallenge] = useState(
    currentReflection?.hardest_challenge || ""
  );
  const [tomorrowGoal, setTomorrowGoal] = useState(
    currentReflection?.tomorrow_goal || ""
  );
  const [gratitudeNote, setGratitudeNote] = useState(
    currentReflection?.gratitude_note || ""
  );

  if (!isOpen) return null;

  const moods: { key: ReflectionMood; emoji: string; labelAr: string }[] = [
    { key: "great", emoji: "😊", labelAr: "ممتاز" },
    { key: "good", emoji: "🙂", labelAr: "جيد" },
    { key: "neutral", emoji: "😐", labelAr: "عادي" },
    { key: "hard", emoji: "😔", labelAr: "صعب" },
    { key: "tired", emoji: "😴", labelAr: "متعب" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReflection({
      user_id: "local_user",
      date: dateIso,
      mood,
      learned_today: learnedToday.trim(),
      hardest_challenge: hardestChallenge.trim() || undefined,
      tomorrow_goal: tomorrowGoal.trim() || undefined,
      gratitude_note: gratitudeNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-start">
      <div className="w-full max-w-lg rounded-3xl border border-theme bg-card text-theme-text shadow-clay p-6 sm:p-7 relative transition-all max-h-[90vh] overflow-y-auto">
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
              حصيلة اليوم وتدوين الانطباع
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[var(--color-accent-soft)] text-[#8F5E1F] border border-[var(--color-accent)]/30">
              جلسة هدوء ✍️
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-1 font-medium">
            دقيقتان لتلخيص يومك، تثبيت إنجازاتك، وتحديد هدف الغد بكل ثقة.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mood selector */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-2">
              كيف تقيّم شعورك وإنتاجيتك اليوم؟
            </label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => {
                const isSelected = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(m.key)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs scale-105"
                        : "bg-surface border-theme text-theme-secondary hover:text-theme-text"
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.emoji}</div>
                    <div className="text-[10px] font-bold">{m.labelAr}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qu'as-tu appris */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-1.5">
              ما الذي استوعبته أو أنجزته اليوم؟ <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="مثال: استوعبت النهايات في الدوال وحللت 3 تمارين نموذجية في الفيزياء..."
              value={learnedToday}
              onChange={(e) => setLearnedToday(e.target.value)}
              className="w-full text-xs font-medium rounded-xl p-3 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Défi ou blocage */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-1.5">
              نقطة أو درس يحتاج تركيزاً إضافياً (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: فكرة المتتاليات التراجعية ما زالت تحتاج حل تمرين إضافي."
              value={hardestChallenge}
              onChange={(e) => setHardestChallenge(e.target.value)}
              className="w-full text-xs font-medium rounded-xl px-3 py-2 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Objectif de demain */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-1.5">
              الهدف الأساسي ليوم الغد 🎯
            </label>
            <input
              type="text"
              placeholder="مثال: إنهاء تلخيص الفصل الأول في التاريخ والبدء في حل تمارين الميكانيك."
              value={tomorrowGoal}
              onChange={(e) => setTomorrowGoal(e.target.value)}
              className="w-full text-xs font-medium rounded-xl px-3 py-2 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Gratitude Note / Dua */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-1.5">
              كلمة شكر أو دعاء لنفسك 🌸
            </label>
            <input
              type="text"
              placeholder="مثال: الحمد لله على ما وفقني إليه اليوم، وغداً يوم أفضل بإذن الله."
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              className="w-full text-xs font-medium rounded-xl px-3 py-2 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
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
              حفظ الحصيلة ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
