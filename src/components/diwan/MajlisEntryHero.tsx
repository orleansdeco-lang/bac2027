"use client";

import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  Users,
  Clock,
  BookOpen,
  Target,
  UserCheck,
  Share2,
  Lock,
  ArrowRight,
  Flame,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { StreamId, SubjectId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

export type MajlisRoomType =
  | "solo"        // دراسة فردية
  | "public"      // مجلس عام
  | "friends"     // مجلس الأصدقاء (خاص)
  | "by_subject"  // مجلس حسب المادة
  | "by_stream";  // مجلس حسب الشعبة

interface MajlisEntryHeroProps {
  userStream: StreamId;
  activeSubject: string;
  onSelectSubject: (subjectId: string) => void;
  onStartSession: (config: {
    roomType: MajlisRoomType;
    subjectId: string;
    topic: string;
    goal: string;
    durationMinutes: number;
  }) => void;
  onOpenCreateModal: () => void;
  stats: {
    activeRoomsCount: number;
    activeStudentsCount: number;
    completedSessionsToday: number;
  };
}

export function MajlisEntryHero({
  userStream,
  activeSubject,
  onSelectSubject,
  onStartSession,
  onOpenCreateModal,
  stats,
}: MajlisEntryHeroProps) {
  const [selectedTopic, setSelectedTopic] = useState("المتتاليات والتحليل");
  const [selectedGoal, setSelectedGoal] = useState("حل تمارين وتثبيت المهارات");
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [selectedRoomType, setSelectedRoomType] = useState<MajlisRoomType>("public");

  const streamInfo = ALGERIAN_BAC_STREAMS[userStream] || ALGERIAN_BAC_STREAMS.sciences_exp;

  const subjectOptions: { id: string; label: string; icon: string }[] = [
    { id: "math", label: "الرياضيات", icon: "📐" },
    { id: "physics", label: "العلوم الفيزيائية", icon: "⚡" },
    { id: "sciences", label: "علوم الطبيعة والحياة", icon: "🧬" },
    { id: "arabic", label: "اللغة العربية وآدابها", icon: "📖" },
    { id: "philosophy", label: "الفلسفة", icon: "🏛️" },
    { id: "history_geo", label: "التاريخ والجغرافيا", icon: "🌍" },
    { id: "islamic", label: "العلوم الإسلامية", icon: "🕌" },
    { id: "french", label: "اللغة الفرنسية", icon: "🇫🇷" },
    { id: "english", label: "اللغة الإنجليزية", icon: "🇬🇧" },
  ];

  const durationOptions = [
    { value: 25, label: "25 دقيقة", badge: "بومودورو 🍅" },
    { value: 45, label: "45 دقيقة", badge: "تركيز قياسي ⚡" },
    { value: 60, label: "60 دقيقة", badge: "تعمق وممارسة 📚" },
    { value: 90, label: "90 دقيقة", badge: "محاكاة البكالوريا 🏆" },
  ];

  const goalOptions = [
    "حل تمارين وتثبيت المهارات",
    "مراجعة الدرس وتلخيصه",
    "تحدي حل موضوع بكالوريا رسمي",
    "معالجة أخطاء معمل الأخطاء",
    "مذاكرة صامتة بتركيز تام",
  ];

  const roomTypeCards: {
    id: MajlisRoomType;
    title: string;
    description: string;
    icon: React.ElementType;
    badge: string;
    color: string;
  }[] = [
    {
      id: "solo",
      title: "دراسة فردية",
      description: "جلسة تركيز خاصة بك بدون تشتيت مع التمارين والمؤقت",
      icon: Target,
      badge: "تركيز عميق 🎯",
      color: "border-blue-500/40 bg-blue-500/[0.05]",
    },
    {
      id: "public",
      title: "مجلس عام",
      description: "ادرس مع زملاء من شعبتك في جو من الانضباط والتشجيع الصامت",
      icon: Users,
      badge: "تشاركي مفتوح 🏛️",
      color: "border-emerald-500/40 bg-emerald-500/[0.05]",
    },
    {
      id: "friends",
      title: "مجلس الأصدقاء",
      description: "مجلس خاص برابط ورمز سري للدراسة مع زملائك في القسم",
      icon: Lock,
      badge: "خاص برابط 💌",
      color: "border-purple-500/40 bg-purple-500/[0.05]",
    },
  ];

  const handleLaunch = () => {
    onStartSession({
      roomType: selectedRoomType,
      subjectId: activeSubject,
      topic: selectedTopic,
      goal: selectedGoal,
      durationMinutes: selectedDuration,
    });
  };

  return (
    <div
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F172A]/95 via-[#0B1222]/95 to-[#070D19]/95 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-6"
      dir="rtl"
    >
      {/* 1. Header Banner & Campus Live Pulse */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>مباشر بتوقيت الجزائر (GMT+1)</span>
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              شعبة {streamInfo.name_ar}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            واش راك حاب تقرا اليوم؟ 🏛️
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            بيئة دراسية افتراضية ترتكز على <span className="text-amber-300 font-bold">التركيز</span> و <span className="text-emerald-300 font-bold">المسؤولية</span> وحل التمارين الحية مع زملائك دون تشتيت مواقع التواصل.
          </p>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-black text-white block">
                {Math.max(stats.activeStudentsCount, 12)} تلميذ
              </span>
              <span className="text-[10px] text-slate-400">يدرسون الآن</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-black text-white block">
                {Math.max(stats.completedSessionsToday, 148)} جلسة
              </span>
              <span className="text-[10px] text-slate-400">مكتملة اليوم</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Study Intent Configurator */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Subject Horizontal Selector (12 Cols) */}
        <div className="md:col-span-12 space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            1. اختر المادة الدراسية:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {subjectOptions.map((subj) => {
              const isSelected = activeSubject === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => onSelectSubject(subj.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/25 scale-[1.02]"
                      : "bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/10"
                  }`}
                >
                  <span className="text-sm">{subj.icon}</span>
                  <span>{subj.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Selector (6 Cols) */}
        <div className="md:col-span-6 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>2. حدد هدف الجلسة اليوم:</span>
          </label>
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            {goalOptions.map((goal, idx) => (
              <option key={idx} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Selector (6 Cols) */}
        <div className="md:col-span-6 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>3. مدة الجلسة المخططة:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {durationOptions.map((dur) => {
              const isSelected = selectedDuration === dur.value;
              return (
                <button
                  key={dur.value}
                  type="button"
                  onClick={() => setSelectedDuration(dur.value)}
                  className={`py-2 px-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                      : "bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 border-white/10 text-xs"
                  }`}
                >
                  <span className="text-xs font-bold block">{dur.label}</span>
                  <span className="text-[10px] opacity-75">{dur.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Room Type Selection Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 block">
          4. نمط المذاكرة المفضل لديك الآن:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {roomTypeCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedRoomType === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedRoomType(card.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? `${card.color} shadow-lg ring-1 ring-blue-500/40`
                    : "bg-white/[0.02] hover:bg-white/[0.05] border-white/10"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{card.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{card.description}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? "text-blue-400 font-bold" : "text-slate-500"}>
                    {isSelected ? "✓ تم الاختيار" : "اختيار هذا النمط"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Launch CTA Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            ستدخل في جلسة مدتها <strong className="text-white">{selectedDuration} دقيقة</strong> بهدف: «
            <strong className="text-amber-300">{selectedGoal}</strong>».
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="py-3 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>+ إنشاء مجلس مخصص 🏛️</span>
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            className="flex-1 sm:flex-none py-3 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>ابدأ جلسة المذاكرة الآن 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
}
