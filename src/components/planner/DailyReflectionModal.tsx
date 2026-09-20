"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme/context";
import { DailyReflection, StudentMood } from "@/lib/planner/types";
import { X, Sparkles, Heart, CheckCircle2, MessageSquareHeart } from "lucide-react";

interface DailyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReflection: (reflection: Omit<DailyReflection, "id" | "created_at" | "updated_at">) => void;
  currentReflection?: DailyReflection | null;
  dateIso?: string;
}

export const DailyReflectionModal: React.FC<DailyReflectionModalProps> = ({
  isOpen,
  onClose,
  onSaveReflection,
  currentReflection,
  dateIso = new Date().toISOString().split("T")[0],
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const [mood, setMood] = useState<StudentMood>(currentReflection?.mood || "good");
  const [learnedToday, setLearnedToday] = useState(currentReflection?.learned_today || "");
  const [hardestChallenge, setHardestChallenge] = useState(currentReflection?.hardest_challenge || "");
  const [tomorrowGoal, setTomorrowGoal] = useState(currentReflection?.tomorrow_goal || "");
  const [gratitudeNote, setGratitudeNote] = useState(currentReflection?.gratitude_note || "");

  useEffect(() => {
    if (currentReflection) {
      setMood(currentReflection.mood || "good");
      setLearnedToday(currentReflection.learned_today || "");
      setHardestChallenge(currentReflection.hardest_challenge || "");
      setTomorrowGoal(currentReflection.tomorrow_goal || "");
      setGratitudeNote(currentReflection.gratitude_note || "");
    }
  }, [currentReflection, isOpen]);

  if (!isOpen) return null;

  const moods: { key: StudentMood; emoji: string; labelFr: string; labelAr: string }[] = [
    { key: "great", emoji: "😊", labelFr: "Super", labelAr: "ممتاز" },
    { key: "good", emoji: "🙂", labelFr: "Bien", labelAr: "جيد" },
    { key: "neutral", emoji: "😐", labelFr: "Moyen", labelAr: "عادي" },
    { key: "hard", emoji: "😔", labelFr: "Difficile", labelAr: "صعب" },
    { key: "tired", emoji: "😴", labelFr: "Fatigué", labelAr: "متعب" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all max-h-[90vh] overflow-y-auto ${
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
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading">
              Bilan du soir
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isGirls
                  ? "bg-pink-100 text-pink-700"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              حصيلة اليوم والمشاعر ✍️
            </span>
          </div>
          <p
            className={`text-xs mt-1 ${
              isGirls ? "text-pink-600/70" : "text-slate-400"
            }`}
          >
            Prends 2 minutes pour faire le point avec toi-même avant de dormir.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mood selector */}
          <div>
            <label className="block text-xs font-bold mb-2 opacity-90">
              Comment te sens-tu ce soir ? / كيف هو شعورك الليلة؟
            </label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => {
                const isSelected = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(m.key)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? isGirls
                          ? "bg-pink-100 border-pink-400 ring-2 ring-pink-300 scale-105 shadow-sm"
                          : "bg-cyan-950 border-cyan-500 ring-2 ring-cyan-500/30 scale-105 shadow-sm"
                        : isGirls
                        ? "border-pink-200 bg-pink-50/20 hover:bg-pink-50"
                        : "border-slate-700 bg-slate-800/40 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.emoji}</div>
                    <div className="text-[10px] font-bold">{m.labelFr}</div>
                    <div className="text-[9px] opacity-70">{m.labelAr}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qu'as-tu appris */}
          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-90">
              واش تعلمت اليوم؟ / Qu'as-tu appris ou accompli d'important ?
            </label>
            <textarea
              rows={2}
              required
              placeholder="Ex: J'ai enfin compris les limites exponentielles et rédigé ma fiche d'histoire."
              value={learnedToday}
              onChange={(e) => setLearnedToday(e.target.value)}
              className={`w-full text-xs rounded-2xl p-3 border outline-none transition-all ${
                isGirls
                  ? "bg-pink-50/40 border-pink-200 focus:ring-2 focus:ring-pink-300 text-pink-950"
                  : "bg-[#152347] border-[#223668] focus:ring-2 focus:ring-cyan-500 text-slate-100"
              }`}
            />
          </div>

          {/* Défi ou blocage */}
          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-90">
              أصعب عقبة أو نقطة تحتاج تركيز غداً (اختياري)
            </label>
            <input
              type="text"
              placeholder="Ex: Les exercices de chimie organique sont encore flous."
              value={hardestChallenge}
              onChange={(e) => setHardestChallenge(e.target.value)}
              className={`w-full text-xs rounded-2xl px-3 py-2 border outline-none transition-all ${
                isGirls
                  ? "bg-pink-50/40 border-pink-200 text-pink-950"
                  : "bg-[#152347] border-[#223668] text-slate-100"
              }`}
            />
          </div>

          {/* Objectif de demain */}
          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-90">
              هدفي الأساسي ليوم الغد / Mon objectif n°1 pour demain
            </label>
            <input
              type="text"
              placeholder="Ex: Terminer la série 3 en physique avant midi."
              value={tomorrowGoal}
              onChange={(e) => setTomorrowGoal(e.target.value)}
              className={`w-full text-xs rounded-2xl px-3 py-2 border outline-none transition-all ${
                isGirls
                  ? "bg-pink-50/40 border-pink-200 text-pink-950"
                  : "bg-[#152347] border-[#223668] text-slate-100"
              }`}
            />
          </div>

          {/* Gratitude Note / Dua */}
          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-90">
              دعاء أو كلمة تشجيعية لنفسك 🌸
            </label>
            <input
              type="text"
              placeholder="Ex: الحمد لله على توفيقه اليوم، غداً يوم جديد وفرصة جديدة."
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              className={`w-full text-xs rounded-2xl px-3 py-2 border outline-none transition-all ${
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
              Fermer
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isGirls
                  ? "bg-[#E879A8] text-white hover:bg-[#D46092]"
                  : "bg-[#0EA5E9] text-white hover:bg-cyan-600"
              }`}
            >
              Enregistrer mon bilan ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
