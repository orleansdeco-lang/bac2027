"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Target, Edit3, Check, Moon, Sun, Heart, Flame } from "lucide-react";

interface PlannerHeroProps {
  studentName?: string;
  streamNameAr?: string;
  bacTargetScore?: number;
  onUpdateTargetScore?: (newScore: number) => void;
  className?: string;
}

export const PlannerHero: React.FC<PlannerHeroProps> = ({
  studentName,
  streamNameAr,
  bacTargetScore = 15.0,
  onUpdateTargetScore,
  className = "",
}) => {
  const { theme, setTheme } = useTheme();
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [scoreInput, setScoreInput] = useState(String(bacTargetScore));

  const isGirls = theme === "girls";
  const displayName = studentName || (isGirls ? "ياسمين" : "أحمد");

  const greeting = isGirls
    ? `Bonjour ${displayName} ! 🌸`
    : `Salut ${displayName} ! ⚡`;

  const quoteAr = isGirls ? "اللهم وفقني في دراستي" : "وما توفيقي إلا بالله";
  const subMessage = isGirls
    ? "Tu fais un travail incroyable. Reste focus, tout est possible !"
    : "Continue, chaque effort compte. Tu es plus proche de ton objectif !";

  const handleSaveScore = () => {
    const parsed = parseFloat(scoreInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
      onUpdateTargetScore?.(parsed);
    }
    setIsEditingScore(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-theme p-6 sm:p-8 transition-all duration-300 shadow-clay ${
        isGirls
          ? "bg-gradient-to-br from-[#FFF0F5] via-[#FFF7FA] to-[#FFFDFE] border-[#F8D7E3]"
          : "bg-gradient-to-br from-[#0F1B3B] via-[#122147] to-[#0A1329] border-[#1E3160]"
      } ${className}`}
    >
      {/* Background Decorative Glow / Motif */}
      <div
        className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-40 ${
          isGirls ? "bg-pink-300" : "bg-cyan-500"
        }`}
      />
      <div
        className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isGirls ? "bg-purple-300" : "bg-blue-600"
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left / Main Text Block */}
        <div className="space-y-3 max-w-2xl text-start">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm flex items-center gap-1.5 ${
                isGirls
                  ? "bg-white/80 text-pink-700 border-pink-200"
                  : "bg-white/10 text-cyan-300 border-cyan-500/30"
              }`}
            >
              {isGirls ? <Heart className="w-3.5 h-3.5 fill-current" /> : <Flame className="w-3.5 h-3.5" />}
              <span>SHATER Planner • التخطيط الذكي</span>
            </span>

            {streamNameAr && (
              <span className="text-xs text-theme-muted font-medium px-2 py-0.5 rounded-md bg-surface/40 border border-theme/40">
                {streamNameAr}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-theme-text font-sans">
              {greeting}
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary font-medium leading-relaxed">
              {subMessage}
            </p>
          </div>

          {/* Spiritual Verse / Quote */}
          <div className="pt-1 flex items-center gap-2">
            <span
              className={`text-xs font-bold font-serif px-3 py-1 rounded-xl inline-block border ${
                isGirls
                  ? "bg-pink-500/10 text-pink-700 border-pink-300/40"
                  : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
              }`}
            >
              « {quoteAr} »
            </span>
          </div>
        </div>

        {/* Right Section: BAC Goal Badge & Dual-Theme Switcher */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
          {/* BAC Goal Card */}
          <div
            className={`p-4 rounded-2xl border min-w-[210px] shadow-sm transition-all text-start ${
              isGirls
                ? "bg-white/90 border-pink-200"
                : "bg-[#16254F]/90 border-[#22386E]"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-theme-muted flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Objectif BAC</span>
              </span>

              {!isEditingScore ? (
                <button
                  type="button"
                  onClick={() => setIsEditingScore(true)}
                  className="p-1 rounded-lg text-theme-muted hover:text-theme-text hover:bg-surface/50 transition-colors"
                  title="تعديل الهدف"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveScore}
                  className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  title="حفظ"
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
            </div>

            {isEditingScore ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.25"
                  min="10"
                  max="20"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="w-20 px-2 py-1 text-sm font-bold rounded-lg border border-theme bg-surface text-theme-text"
                  autoFocus
                />
                <span className="text-xs text-theme-muted font-bold">/ 20</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-theme-text font-mono">
                  {Number(bacTargetScore).toFixed(2).replace(".00", "")}
                </span>
                <span className="text-xs text-theme-muted font-bold font-mono">/ 20</span>
                <span className="ms-auto text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded-full">
                  امتياز
                </span>
              </div>
            )}

            {/* Goal Progress Bar */}
            <div className="mt-2.5 h-2 w-full rounded-full bg-surface/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${Math.min(100, (bacTargetScore / 20) * 100)}%` }}
              />
            </div>
          </div>

          {/* Theme Switcher Toggle Pill */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface/70 border border-theme">
            <button
              type="button"
              onClick={() => setTheme("boys")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                !isGirls
                  ? "bg-[#142247] text-white shadow-sm border border-cyan-500/40"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              <span>👦</span>
              <span className="hidden sm:inline">نمط الشباب (داكن)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("girls")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isGirls
                  ? "bg-white text-pink-700 shadow-sm border border-pink-300"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              <span>🌸</span>
              <span className="hidden sm:inline">نمط البنات (ملهم)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
