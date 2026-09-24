"use client";

import React, { useState, useEffect } from "react";
import { Users, Flame, Sparkles, Filter, Search, Award, CheckCircle } from "lucide-react";
import { PeerStudent, PeerMilestone } from "@/types/ypt";
import { StreamId } from "@/types/education";

const INITIAL_PEERS: PeerStudent[] = [
  {
    id: "p1",
    name: "محمد إسلام",
    avatar: "👨‍🎓",
    wilaya: "الجزائر العاصمة",
    streamId: "sciences_exp",
    streamLabelAr: "علوم تجريبية",
    subjectId: "natural_sciences",
    subjectNameAr: "علوم الطبيعة والحياة",
    subjectHex: "#059669",
    status: "studying",
    elapsedMinutes: 47,
    todayTotalMinutes: 290,
    dailyGoalHours: 6,
    quote: "التركيز التام على منهجية التحليل والتفسير 🧬",
  },
  {
    id: "p2",
    name: "سارة ب.",
    avatar: "👩‍🎓",
    wilaya: "قسنطينة",
    streamId: "math",
    streamLabelAr: "رياضيات",
    subjectId: "math",
    subjectNameAr: "الرياضيات",
    subjectHex: "#2563EB",
    status: "studying",
    elapsedMinutes: 83,
    todayTotalMinutes: 380,
    dailyGoalHours: 7,
    quote: "حل موضوع بكالوريا 2022 مسألة الدوال الأسية 📐",
  },
  {
    id: "p3",
    name: "أمين ك.",
    avatar: "👨‍💻",
    wilaya: "وهران",
    streamId: "technique_math",
    streamLabelAr: "تقني رياضي",
    subjectId: "physics",
    subjectNameAr: "العلوم الفيزيائية",
    subjectHex: "#D97706",
    status: "studying",
    elapsedMinutes: 32,
    todayTotalMinutes: 210,
    dailyGoalHours: 5,
    quote: "الميكانيك وقوانين نيوتن في الجيب بإذن الله ⚡",
  },
  {
    id: "p4",
    name: "إيمان ل.",
    avatar: "👩‍🏫",
    wilaya: "سطيف",
    streamId: "lettres_philo",
    streamLabelAr: "آداب وفلسفة",
    subjectId: "philosophy",
    subjectNameAr: "الفلسفة",
    subjectHex: "#7C3AED",
    status: "studying",
    elapsedMinutes: 65,
    todayTotalMinutes: 310,
    dailyGoalHours: 6,
    quote: "مقال مقارنة بين السؤال العلمي والسؤال الفلسفي 💭",
  },
  {
    id: "p5",
    name: "أيوب ز.",
    avatar: "🧑‍🎓",
    wilaya: "باتنة",
    streamId: "gestion_eco",
    streamLabelAr: "تسيير واقتصاد",
    subjectId: "economy_law",
    subjectNameAr: "التسيير والاقتصاد",
    subjectHex: "#65A30D",
    status: "studying",
    elapsedMinutes: 19,
    todayTotalMinutes: 180,
    dailyGoalHours: 5,
    quote: "تسوية المخزونات وحساب النتائج حسب الطبيعة 📊",
  },
  {
    id: "p6",
    name: "مريم ت.",
    avatar: "🧕",
    wilaya: "تيزي وزو",
    streamId: "langues_etrangeres",
    streamLabelAr: "لغات أجنبية",
    subjectId: "french",
    subjectNameAr: "اللغة الفرنسية",
    subjectHex: "#4F46E5",
    status: "break",
    elapsedMinutes: 8,
    todayTotalMinutes: 240,
    dailyGoalHours: 5,
    quote: "استراحة شاي ☕ ثم العودة للنص التاريخي",
  },
  {
    id: "p7",
    name: "ياسين م.",
    avatar: "🧑‍💼",
    wilaya: "البليدة",
    streamId: "sciences_exp",
    streamLabelAr: "علوم تجريبية",
    subjectId: "physics",
    subjectNameAr: "العلوم الفيزيائية",
    subjectHex: "#D97706",
    status: "studying",
    elapsedMinutes: 52,
    todayTotalMinutes: 340,
    dailyGoalHours: 6,
    quote: "الوحدة الأولى: المتابعة الزمنية لتحول كيميائي 🧪",
  },
  {
    id: "p8",
    name: "ريم ع.",
    avatar: "👩‍🎓",
    wilaya: "عنابة",
    streamId: "math",
    streamLabelAr: "رياضيات",
    subjectId: "math",
    subjectNameAr: "الرياضيات",
    subjectHex: "#2563EB",
    status: "studying",
    elapsedMinutes: 40,
    todayTotalMinutes: 260,
    dailyGoalHours: 6,
    quote: "المتتاليات العددية والبرهان بالتراجع 🎯",
  },
];

const INITIAL_MILESTONES: PeerMilestone[] = [
  {
    id: "m1",
    studentName: "سارة (قسنطينة)",
    avatar: "👩‍🎓",
    stream: "رياضيات",
    subjectName: "الرياضيات",
    actionText: "أكملت 80 دقيقة تركيز متواصلة 🔥",
    timeAgo: "منذ دقيقتين",
  },
  {
    id: "m2",
    studentName: "محمد إسلام (الجزائر)",
    avatar: "👨‍🎓",
    stream: "علوم تجريبية",
    subjectName: "علوم الطبيعة",
    actionText: "حقق هدفه اليومي (5 ساعات) بنجاح 🎓",
    timeAgo: "منذ 6 دقائق",
  },
  {
    id: "m3",
    studentName: "أيوب (باتنة)",
    avatar: "🧑‍🎓",
    stream: "تسيير واقتصاد",
    subjectName: "المحاسبة",
    actionText: "بدأ جلسة بومودورو جديدة ⚡",
    timeAgo: "منذ 9 دقائق",
  },
];

const STREAM_FILTERS: { id: string; labelAr: string }[] = [
  { id: "all", labelAr: "كل الشُعب" },
  { id: "sciences_exp", labelAr: "علوم تجريبية" },
  { id: "math", labelAr: "رياضيات" },
  { id: "technique_math", labelAr: "تقني رياضي" },
  { id: "gestion_eco", labelAr: "تسيير واقتصاد" },
  { id: "lettres_philo", labelAr: "آداب وفلسفة" },
  { id: "langues_etrangeres", labelAr: "لغات أجنبية" },
];

interface ActivePeersRoomProps {
  currentUserStudying?: boolean;
  currentSubjectName?: string;
  currentSubjectHex?: string;
  currentDurationMinutes?: number;
}

export function ActivePeersRoom({
  currentUserStudying,
  currentSubjectName,
  currentSubjectHex,
  currentDurationMinutes = 0,
}: ActivePeersRoomProps) {
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [peers, setPeers] = useState<PeerStudent[]>(INITIAL_PEERS);
  const [activeCounter, setActiveCounter] = useState<number>(1428);
  const [milestones, setMilestones] = useState<PeerMilestone[]>(INITIAL_MILESTONES);

  // Live peer time ticker effect (increments study minutes realistically)
  useEffect(() => {
    const interval = setInterval(() => {
      setPeers((prev) =>
        prev.map((p) => {
          if (p.status === "studying") {
            return {
              ...p,
              elapsedMinutes: p.elapsedMinutes + 1,
              todayTotalMinutes: p.todayTotalMinutes + 1,
            };
          }
          return p;
        })
      );

      // Slight natural fluctuations in total active peer count
      setActiveCounter((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter peers
  const filteredPeers = peers.filter((p) => {
    if (selectedStream === "all") return true;
    return p.streamId === selectedStream;
  });

  return (
    <div className="rounded-3xl bg-card border border-theme p-5 sm:p-7 shadow-clay space-y-6">
      {/* Header with Live Counter Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-theme-text font-serif">
                قاعة المراجعة المباشرة (ندرس معاً)
              </h2>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {activeCounter.toLocaleString("ar-DZ")} طالب يراجع الآن
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-0.5">
              بيئة حماسية تنافسية ترفع هرمون الإنجاز وتبعد عنك التسويف والملل.
            </p>
          </div>
        </div>
      </div>

      {/* Live Activity Ticker Feed */}
      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-surface/70 border border-theme overflow-x-auto scrollbar-none text-xs">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-black shrink-0 text-[11px]">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          إنجازات مباشرة:
        </span>
        <div className="flex items-center gap-4 whitespace-nowrap">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5 text-theme-secondary font-medium">
              <span>{m.avatar}</span>
              <span className="font-bold text-theme-text">{m.studentName}:</span>
              <span>{m.actionText}</span>
              <span className="text-[10px] text-theme-muted">({m.timeAgo})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stream Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STREAM_FILTERS.map((f) => {
          const isActive = selectedStream === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedStream(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-white shadow-xs font-black"
                  : "bg-surface border border-theme text-theme-secondary hover:text-theme-text hover:bg-surface-soft"
              }`}
            >
              {f.labelAr}
            </button>
          );
        })}
      </div>

      {/* Active Peers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Current User Card (if studying) */}
        {currentUserStudying && (
          <div
            className="p-4 rounded-2xl border-2 transition-all relative overflow-hidden bg-surface shadow-xs"
            style={{ borderColor: currentSubjectHex || "#2C5E54" }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌟</span>
                <div>
                  <h4 className="font-black text-xs text-theme-text">أنت (جلسة نشطة)</h4>
                  <span className="text-[10px] text-primary font-bold">بث مباشر للمجموعة</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                تدرس الآن
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-theme-muted text-[11px]">المادة:</span>
                <span
                  className="font-bold px-2 py-0.5 rounded text-[11px] text-white"
                  style={{ backgroundColor: currentSubjectHex }}
                >
                  {currentSubjectName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-muted text-[11px]">الوقت المستمر:</span>
                <span className="font-mono font-black text-theme-text">
                  {currentDurationMinutes} دقيقة
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Other Peers Cards */}
        {filteredPeers.map((peer) => {
          const isStudying = peer.status === "studying";
          const todayHours = (peer.todayTotalMinutes / 60).toFixed(1);

          return (
            <div
              key={peer.id}
              className="p-4 rounded-2xl border border-theme bg-surface/70 hover:bg-surface transition-all flex flex-col justify-between hover:shadow-xs group"
            >
              <div>
                {/* Peer Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {peer.avatar}
                    </span>
                    <div>
                      <h4 className="font-black text-xs text-theme-text">{peer.name}</h4>
                      <p className="text-[10px] text-theme-muted">
                        {peer.streamLabelAr} • {peer.wilaya}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isStudying
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isStudying ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                      }`}
                    />
                    {isStudying ? "يدرس" : "استراحة"}
                  </span>
                </div>

                {/* Peer Focus Subject & Timer */}
                <div className="space-y-1.5 my-3 text-xs bg-card/60 p-2.5 rounded-xl border border-theme/60">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-muted text-[11px]">المادة الحالية:</span>
                    <span
                      className="font-black px-2 py-0.5 rounded text-[10px] text-white"
                      style={{ backgroundColor: peer.subjectHex }}
                    >
                      {peer.subjectNameAr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-theme-muted text-[11px]">في هذه الجلسة:</span>
                    <span className="font-mono font-bold text-theme-text text-[11px]" dir="ltr">
                      {peer.elapsedMinutes} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-theme/40 pt-1">
                    <span className="text-theme-muted text-[11px]">إجمالي اليوم:</span>
                    <span className="font-mono font-black text-primary text-[11px]" dir="ltr">
                      {todayHours}h / {peer.dailyGoalHours}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Peer Quote */}
              {peer.quote && (
                <p className="text-[10px] text-theme-secondary italic border-r-2 border-primary/40 pr-2 line-clamp-1">
                  "{peer.quote}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
