"use client";

import React from "react";
import {
  GraduationCap,
  Plus,
  Users,
  MessageSquare,
  Sparkles,
  Calculator,
  Atom,
  Dna,
  BookOpen,
  Globe2,
  CheckCircle2,
  Star,
} from "lucide-react";

interface MajlisHeroBannerProps {
  activeSubject: string;
  onSelectSubject: (subj: string) => void;
  onOpenCreateModal: () => void;
  totalTablesCount?: number;
  activeStudentsCount?: number;
}

export function MajlisHeroBanner({
  activeSubject,
  onSelectSubject,
  onOpenCreateModal,
  totalTablesCount = 92,
  activeStudentsCount = 12,
}: MajlisHeroBannerProps) {
  const subjects = [
    { id: "my_strength", label: "نقطة قوتي", icon: Star, highlight: true },
    { id: "math", label: "رياضيات", icon: Calculator },
    { id: "physics", label: "فيزياء", icon: Atom },
    { id: "sciences", label: "علوم طبيعية", icon: Dna },
    { id: "french", label: "فرنسية", icon: BookOpen },
    { id: "history_geo", label: "تاريخ وجغرافيا", icon: Globe2 },
  ];

  return (
    <div
      className="relative rounded-3xl p-5 sm:p-7 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, rgba(11, 18, 34, 0.95) 0%, rgba(7, 11, 20, 0.98) 100%)",
      }}
      dir="rtl"
    >
      {/* Subtle warm ambient light glow in corner */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 left-10 w-80 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Top Header Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Title + Subtitle with Graduation Cap Icon */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/15 to-transparent border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400" />
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0B1222]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                مجلس العلم
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                فضاء تفاعلي
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1 font-medium">
              معاً نحو النجاح .. ندرس، نناقش، نرتقي
            </p>
          </div>
        </div>

        {/* Stats Chips & Create Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap lg:flex-nowrap">
          {/* Stat 1: 92 مجلس دراسة */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-mono font-bold text-white block text-sm leading-none">
                {totalTablesCount}
              </span>
              <span className="text-[10px] text-slate-400">مجلس دراسة</span>
            </div>
          </div>

          {/* Stat 2: 8 وصلتم */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-mono font-bold text-white block text-sm leading-none">
                8
              </span>
              <span className="text-[10px] text-slate-400">وصلتم</span>
            </div>
          </div>

          {/* Stat 3: 12 طالب نشط */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="font-mono font-bold text-white block text-sm leading-none">
                {activeStudentsCount}
              </span>
              <span className="text-[10px] text-slate-400">طالب نشط</span>
            </div>
          </div>

          {/* Amber CTA Button: + إنشاء مجلس جديد */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap mr-auto lg:mr-0"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>إنشاء مجلس جديد</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Subject Filter Pills */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {subjects.map((subj) => {
          const Icon = subj.icon;
          const isSelected = activeSubject === subj.id;
          return (
            <button
              key={subj.id}
              type="button"
              onClick={() => onSelectSubject(subj.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                subj.highlight
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  : isSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40"
                  : "bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.07] hover:bg-white/[0.08]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{subj.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
