"use client";

import React, { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, Lock, Sparkles, CheckCircle2, ShieldCheck, Compass } from "lucide-react";
import { PedagogicalHint } from "@/lib/practice/practice-engine";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface ExerciseHintLadderProps {
  hints: PedagogicalHint[];
  onHintUnlocked?: (level: number) => void;
  className?: string;
}

export function ExerciseHintLadder({
  hints,
  onHintUnlocked,
  className = "",
}: ExerciseHintLadderProps) {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]); // First hint unlocked by default when opened
  const [expandedLevels, setExpandedLevels] = useState<number[]>([1]);

  const handleUnlockNext = () => {
    const nextLevel = Math.min(4, Math.max(...unlockedLevels) + 1);
    if (!unlockedLevels.includes(nextLevel)) {
      setUnlockedLevels((prev) => [...prev, nextLevel]);
      setExpandedLevels((prev) => [...prev, nextLevel]);
      if (onHintUnlocked) onHintUnlocked(nextLevel);
    }
  };

  const toggleExpand = (level: number) => {
    setExpandedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const maxUnlocked = Math.max(...unlockedLevels);

  return (
    <div className={`rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 sm:p-5 space-y-3.5 transition-all ${className}`} dir="rtl">
      {/* Header with Growth-Mindset Message */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>سلم التلميحات المتدرج</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                مستوى {maxUnlocked} من 4
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              التلميحات مجانية وبدون خصم نقاط — الهدف هو بناء الفهم المنهجي المستقل خطوة بخطوة 💡
            </p>
          </div>
        </div>

        {maxUnlocked < 4 && (
          <button
            type="button"
            onClick={handleUnlockNext}
            className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>اكشف التلميح الموالي (مستوى {maxUnlocked + 1})</span>
          </button>
        )}
      </div>

      {/* Progressive Ladder Levels */}
      <div className="space-y-2.5">
        {hints.map((hint) => {
          const isUnlocked = unlockedLevels.includes(hint.level);
          const isExpanded = expandedLevels.includes(hint.level);

          return (
            <div
              key={hint.level}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isUnlocked
                  ? "bg-[#0F172A]/80 border-amber-500/25 shadow-sm"
                  : "bg-white/[0.02] border-white/5 opacity-55"
              }`}
            >
              {/* Level Header Bar */}
              <button
                type="button"
                onClick={() => isUnlocked && toggleExpand(hint.level)}
                disabled={!isUnlocked}
                className="w-full py-2.5 px-3.5 flex items-center justify-between gap-3 text-right cursor-pointer disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                      isUnlocked
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {isUnlocked ? hint.level : <Lock className="w-3 h-3" />}
                  </div>

                  <span className={`text-xs font-bold ${isUnlocked ? "text-white" : "text-slate-400"}`}>
                    {hint.title_ar}
                  </span>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                    {hint.badge_ar}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )
                  ) : (
                    <span className="text-[10px] text-slate-500">مغلق</span>
                  )}
                </div>
              </button>

              {/* Unfolded Hint Content */}
              {isUnlocked && isExpanded && (
                <div className="px-4 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5 bg-black/20">
                  <MathRenderer content={hint.content_ar} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
