"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Sparkles, Coffee, Clock, Heart, Volume2, Shield, UserCheck, Plus } from "lucide-react";

export interface StudentSeat {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  subjectColor: string; // Tailwind color or hex
  subjectBg: string;
  initialSeconds: number;
  position: "top-right" | "top-left" | "left" | "right" | "bottom-left" | "bottom-right";
  status?: string;
  isCurrentUser?: boolean;
  isEmpty?: boolean;
}

const DEFAULT_SEATS: StudentSeat[] = [
  {
    id: "seat-1",
    name: "ياسين",
    avatar: "/illustrations/characters/yassine.jpg",
    subject: "رياضيات",
    subjectColor: "text-blue-400",
    subjectBg: "bg-blue-500/20 border-blue-500/40",
    initialSeconds: 52 * 60 + 33, // 00:52:33
    position: "top-right",
  },
  {
    id: "seat-2",
    name: "سارة",
    avatar: "/illustrations/characters/sarah.jpg",
    subject: "علوم طبيعية",
    subjectColor: "text-emerald-400",
    subjectBg: "bg-emerald-500/20 border-emerald-500/40",
    initialSeconds: 84 * 60 + 16, // 01:24:16
    position: "top-left",
  },
  {
    id: "seat-3",
    name: "علي",
    avatar: "/illustrations/characters/ali.jpg",
    subject: "فيزياء",
    subjectColor: "text-cyan-400",
    subjectBg: "bg-cyan-500/20 border-cyan-500/40",
    initialSeconds: 72 * 60 + 8, // 01:12:08
    position: "left",
  },
  {
    id: "seat-4",
    name: "مريم",
    avatar: "/illustrations/characters/mariam.jpg",
    subject: "فلسفة",
    subjectColor: "text-purple-400",
    subjectBg: "bg-purple-500/20 border-purple-500/40",
    initialSeconds: 47 * 60 + 21, // 00:47:21
    position: "right",
  },
  {
    id: "seat-5",
    name: "نهى",
    avatar: "/illustrations/characters/sarah.jpg",
    subject: "فرنسية",
    subjectColor: "text-pink-400",
    subjectBg: "bg-pink-500/20 border-pink-500/40",
    initialSeconds: 36 * 60 + 45, // 00:36:45
    position: "bottom-left",
  },
  {
    id: "seat-6",
    name: "أمين",
    avatar: "/illustrations/characters/yassine.jpg",
    subject: "تاريخ",
    subjectColor: "text-indigo-400",
    subjectBg: "bg-indigo-500/20 border-indigo-500/40",
    initialSeconds: 65 * 60 + 32, // 01:05:32
    position: "bottom-right",
  },
];

export function formatStopwatch(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

interface CozyMajlisDeskProps {
  topicTitle?: string;
  occupiedSeatsCount?: number;
  maxSeatsCount?: number;
  isUserSeated?: boolean;
  currentUser?: {
    name: string;
    avatar: string;
    subject: string;
  } | null;
  userElapsedSeconds?: number;
  onSeatClick?: (seat: StudentSeat) => void;
  onJoinSeat?: () => void;
  onLeaveSeat?: () => void;
}

export function CozyMajlisDesk({
  topicTitle = "المتتاليات",
  occupiedSeatsCount = 6,
  maxSeatsCount = 6,
  isUserSeated = false,
  currentUser = null,
  userElapsedSeconds = 0,
  onSeatClick,
  onJoinSeat,
  onLeaveSeat,
}: CozyMajlisDeskProps) {
  const [secondsOffset, setSecondsOffset] = useState(0);
  const [cheeredStudent, setCheeredStudent] = useState<string | null>(null);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsOffset((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEncourage = (seat: StudentSeat, e: React.MouseEvent) => {
    e.stopPropagation();
    if (seat.isEmpty && onJoinSeat) {
      onJoinSeat();
      return;
    }
    setCheeredStudent(seat.id);
    if (onSeatClick) onSeatClick(seat);
    setTimeout(() => {
      setCheeredStudent((current) => (current === seat.id ? null : current));
    }, 2200);
  };

  // Build reactive seat 5 (bottom-left) based on user seated status
  const seat5: StudentSeat = isUserSeated
    ? {
        id: "seat-user",
        name: currentUser?.name || "أنت (طالب)",
        avatar: currentUser?.avatar || "/illustrations/characters/ali.jpg",
        subject: currentUser?.subject || "رياضيات",
        subjectColor: "text-emerald-400",
        subjectBg: "bg-emerald-500/20 border-emerald-500/40",
        initialSeconds: 0,
        position: "bottom-left",
        isCurrentUser: true,
      }
    : {
        id: "seat-5-available",
        name: "مقعد متاح",
        avatar: "/illustrations/characters/sarah.jpg",
        subject: "انضم الآن 🪑",
        subjectColor: "text-blue-400",
        subjectBg: "bg-blue-500/20 border-blue-500/40",
        initialSeconds: 0,
        position: "bottom-left",
        isEmpty: true,
      };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] select-none"
      style={{
        background: "radial-gradient(ellipse at center, #101B33 0%, #070B14 100%)",
      }}
      dir="rtl"
    >
      {/* Background Library Canvas with Soft Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/illustrations/majlis-table-bg.jpg"
          alt="طاولة مجلس العلم التفاعلية"
          fill
          priority
          className="object-cover object-center opacity-60 brightness-[0.7] contrast-[1.1]"
        />
        {/* Deep ambient radial glow over center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, rgba(7, 11, 20, 0.75) 65%, #070B14 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-transparent to-black/40" />
      </div>

      {/* Warm Hanging Lamp Ambient Cone from Top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-44 bg-gradient-to-b from-amber-400/20 via-amber-500/5 to-transparent blur-2xl pointer-events-none z-10" />

      {/* Center Table Indicator Pill */}
      <div className="relative z-20 my-auto flex flex-col items-center text-center max-w-[240px] sm:max-w-xs px-4 py-3 rounded-2xl bg-[#0B1222]/85 backdrop-blur-md border border-white/10 shadow-2xl transition-transform duration-300 hover:scale-105">
        <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-bold mb-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block -mr-3" />
          <span>مجلس دراسة: {topicTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono mt-1">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {occupiedSeatsCount}/{maxSeatsCount} مقاعد نشطة
          </span>
          {isUserSeated && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              أنت جالس 🪑
            </span>
          )}
        </div>
      </div>

      {/* 6 Student Seated Cards positioned around the table */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="relative w-full h-full max-w-4xl mx-auto p-3 sm:p-6 pointer-events-auto">
          {/* Top-Right: Yassine */}
          <div className="absolute top-[8%] right-[8%] sm:top-[12%] sm:right-[15%]">
            <SeatPill
              seat={DEFAULT_SEATS[0]}
              elapsed={DEFAULT_SEATS[0].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === DEFAULT_SEATS[0].id}
              onEncourage={(e) => handleEncourage(DEFAULT_SEATS[0], e)}
            />
          </div>

          {/* Top-Left: Sarah */}
          <div className="absolute top-[8%] left-[8%] sm:top-[12%] sm:left-[15%]">
            <SeatPill
              seat={DEFAULT_SEATS[1]}
              elapsed={DEFAULT_SEATS[1].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === DEFAULT_SEATS[1].id}
              onEncourage={(e) => handleEncourage(DEFAULT_SEATS[1], e)}
            />
          </div>

          {/* Left: Ali */}
          <div className="absolute top-[48%] -translate-y-1/2 left-[2%] sm:left-[6%]">
            <SeatPill
              seat={DEFAULT_SEATS[2]}
              elapsed={DEFAULT_SEATS[2].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === DEFAULT_SEATS[2].id}
              onEncourage={(e) => handleEncourage(DEFAULT_SEATS[2], e)}
            />
          </div>

          {/* Right: Mariam */}
          <div className="absolute top-[48%] -translate-y-1/2 right-[2%] sm:right-[6%]">
            <SeatPill
              seat={DEFAULT_SEATS[3]}
              elapsed={DEFAULT_SEATS[3].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === DEFAULT_SEATS[3].id}
              onEncourage={(e) => handleEncourage(DEFAULT_SEATS[3], e)}
            />
          </div>

          {/* Bottom-Left: User Seat (when seated) or Open Seat */}
          <div className="absolute bottom-[8%] left-[8%] sm:bottom-[12%] sm:left-[18%]">
            <SeatPill
              seat={seat5}
              elapsed={isUserSeated ? userElapsedSeconds : 0}
              isCheered={cheeredStudent === seat5.id}
              onEncourage={(e) => handleEncourage(seat5, e)}
            />
          </div>

          {/* Bottom-Right: Amine */}
          <div className="absolute bottom-[8%] right-[8%] sm:bottom-[12%] sm:right-[18%]">
            <SeatPill
              seat={DEFAULT_SEATS[5]}
              elapsed={DEFAULT_SEATS[5].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === DEFAULT_SEATS[5].id}
              onEncourage={(e) => handleEncourage(DEFAULT_SEATS[5], e)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SeatPill({
  seat,
  elapsed,
  isCheered,
  onEncourage,
}: {
  seat: StudentSeat;
  elapsed: number;
  isCheered: boolean;
  onEncourage: (e: React.MouseEvent) => void;
}) {
  if (seat.isEmpty) {
    return (
      <div
        onClick={onEncourage}
        className="group relative flex items-center gap-2 p-2 rounded-2xl bg-blue-950/60 hover:bg-blue-900/80 border-2 border-dashed border-blue-400/50 hover:border-blue-300 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer animate-pulse"
        title="انقر لحجز هذا المقعد على الطاولة 🪑"
      >
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center shrink-0">
          <Plus className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs sm:text-sm font-black text-white">مقعد متاح</span>
          <span className="text-[10px] text-blue-300 font-bold">انضم للمجلس 🪑</span>
        </div>
      </div>
    );
  }

  const isUser = seat.isCurrentUser;

  return (
    <div
      onClick={onEncourage}
      className={`group relative flex items-center gap-2 p-1.5 sm:p-2 pr-2.5 sm:pr-3 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer ${
        isUser
          ? "bg-[#091a18]/90 hover:bg-[#0c2421] border-2 border-emerald-400 shadow-emerald-500/20"
          : "bg-[#0B1222]/85 hover:bg-[#131F38] border border-white/10 hover:border-white/20"
      }`}
      title={isUser ? "أنت حاضر في هذا المقعد" : `انقر لتشجيع ${seat.name} بكوب قهوة ☕`}
    >
      {/* Floating Encouragement Animation */}
      {isCheered && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-lg animate-bounce flex items-center gap-1 z-30 whitespace-nowrap">
          <span>☕ +1 تشجيع!</span>
        </div>
      )}

      {/* Avatar with Status Ring */}
      <div
        className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 shadow-md shrink-0 ${
          isUser ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-emerald-400"
        }`}
      >
        <Image
          src={seat.avatar}
          alt={seat.name}
          fill
          sizes="44px"
          className="object-cover"
        />
        {/* Green Online Dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0B1222]" />
      </div>

      {/* Student Details */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-white leading-tight">
            {seat.name}
          </span>
          {isUser && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
              أنت 🌟
            </span>
          )}
          {/* Subject Badge */}
          <span
            className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${seat.subjectBg} ${seat.subjectColor}`}
          >
            {seat.subject}
          </span>
        </div>

        {/* Live Stopwatch Counter */}
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-slate-300 mt-0.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatStopwatch(elapsed)}</span>
        </div>
      </div>
    </div>
  );
}
