"use client";

import React from "react";
import { StreamId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import {
  Atom,
  Sigma,
  Cpu,
  TrendingUp,
  BookOpen,
  Globe,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react";

interface StreamSelectorProps {
  selectedStream: StreamId;
  onSelectStream: (streamId: StreamId) => void;
  enrolledStream?: StreamId;
  skillCounts?: Record<StreamId, number>;
  className?: string;
}

const STREAM_ICONS: Record<StreamId, React.ComponentType<{ className?: string }>> = {
  sciences_exp: Atom,
  math: Sigma,
  technique_math: Cpu,
  gestion_eco: TrendingUp,
  lettres_philo: BookOpen,
  langues_etrangeres: Globe,
};

const STREAM_COLOR_ACCENTS: Record<StreamId, { border: string; glow: string; badge: string; text: string }> = {
  sciences_exp: {
    border: "border-emerald-500/40 hover:border-emerald-500",
    glow: "shadow-emerald-500/10",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    text: "text-emerald-400",
  },
  math: {
    border: "border-blue-500/40 hover:border-blue-500",
    glow: "shadow-blue-500/10",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    text: "text-blue-400",
  },
  technique_math: {
    border: "border-orange-500/40 hover:border-orange-500",
    glow: "shadow-orange-500/10",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    text: "text-orange-400",
  },
  gestion_eco: {
    border: "border-amber-500/40 hover:border-amber-500",
    glow: "shadow-amber-500/10",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    text: "text-amber-400",
  },
  lettres_philo: {
    border: "border-rose-500/40 hover:border-rose-500",
    glow: "shadow-rose-500/10",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    text: "text-rose-400",
  },
  langues_etrangeres: {
    border: "border-purple-500/40 hover:border-purple-500",
    glow: "shadow-purple-500/10",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    text: "text-purple-400",
  },
};

export const StreamSelector: React.FC<StreamSelectorProps> = ({
  selectedStream,
  onSelectStream,
  enrolledStream,
  skillCounts,
  className = "",
}) => {
  const streamKeys: StreamId[] = [
    "sciences_exp",
    "math",
    "technique_math",
    "gestion_eco",
    "lettres_philo",
    "langues_etrangeres",
  ];

  return (
    <div className={`space-y-3 ${className}`} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">
            الشُعب المعتمدة في البكالوريا الجزائرية (6 شعب)
          </span>
        </div>
        {enrolledStream && (
          <span className="text-[11px] text-theme-muted hidden sm:inline">
            شعبتك المسجلة حالياً محددة بعلامة تفضيل
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {streamKeys.map((stId) => {
          const stream = ALGERIAN_BAC_STREAMS[stId];
          const isSelected = selectedStream === stId;
          const isEnrolled = enrolledStream === stId;
          const Icon = STREAM_ICONS[stId] || Sparkles;
          const accent = STREAM_COLOR_ACCENTS[stId];
          const count = skillCounts ? skillCounts[stId] : undefined;

          return (
            <button
              key={stId}
              type="button"
              onClick={() => onSelectStream(stId)}
              className={`relative group text-right p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
                isSelected
                  ? `bg-card border-[var(--color-primary)] shadow-lg ring-1 ring-[var(--color-primary)]/40 ${accent.glow}`
                  : `bg-card/70 border-theme hover:bg-card hover:border-[var(--color-border-hover)]`
              }`}
            >
              {/* Enrolled Badge Indicator */}
              {isEnrolled && (
                <span className="absolute -top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-slate-950 shadow-sm flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  شعبتك
                </span>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "bg-surface border border-theme text-theme-muted group-hover:text-theme-text"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {count !== undefined && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-surface/80 border border-theme/60 text-theme-muted">
                      {count} كفاءة
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className={`text-xs sm:text-sm font-black transition-colors ${
                      isSelected ? "text-[var(--color-primary)]" : "text-theme-text"
                    }`}
                  >
                    {stream?.name_ar || stId}
                  </h3>
                  <p className="text-[10px] text-theme-muted line-clamp-1 mt-0.5">
                    {stream?.name_fr}
                  </p>
                </div>
              </div>

              {/* Bottom Active Indicator Line */}
              <div
                className={`mt-2.5 h-1 rounded-full transition-all duration-200 ${
                  isSelected ? "bg-[var(--color-primary)] w-full" : "bg-transparent w-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
