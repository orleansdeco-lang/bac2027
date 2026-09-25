"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Sparkles, Coffee, Clock, Heart, Shield, UserCheck, Plus, Check } from "lucide-react";
import { MajlisRoom, MajlisMember } from "@/lib/campus/majlis-service";
import { MajlisCenterStage } from "./MajlisCenterStage";
import { StreamId } from "@/types/education";

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
  finishedPaper?: boolean;
  score?: number;
}

const DEFAULT_SEATS: StudentSeat[] = [
  {
    id: "seat-1",
    name: "ياسين",
    avatar: "/illustrations/characters/yassine.jpg",
    subject: "رياضيات",
    subjectColor: "text-blue-400",
    subjectBg: "bg-blue-500/20 border-blue-500/40",
    initialSeconds: 52 * 60 + 33,
    position: "top-right",
    finishedPaper: false,
    score: 120,
  },
  {
    id: "seat-2",
    name: "سارة",
    avatar: "/illustrations/characters/sarah.jpg",
    subject: "علوم طبيعية",
    subjectColor: "text-emerald-400",
    subjectBg: "bg-emerald-500/20 border-emerald-500/40",
    initialSeconds: 84 * 60 + 16,
    position: "top-left",
    finishedPaper: true,
    score: 250,
  },
  {
    id: "seat-3",
    name: "علي",
    avatar: "/illustrations/characters/ali.jpg",
    subject: "فيزياء",
    subjectColor: "text-cyan-400",
    subjectBg: "bg-cyan-500/20 border-cyan-500/40",
    initialSeconds: 72 * 60 + 8,
    position: "left",
    finishedPaper: false,
    score: 90,
  },
  {
    id: "seat-4",
    name: "مريم",
    avatar: "/illustrations/characters/mariam.jpg",
    subject: "فلسفة",
    subjectColor: "text-purple-400",
    subjectBg: "bg-purple-500/20 border-purple-500/40",
    initialSeconds: 47 * 60 + 21,
    position: "right",
    finishedPaper: true,
    score: 180,
  },
  {
    id: "seat-5",
    name: "نهى",
    avatar: "/illustrations/characters/sarah.jpg",
    subject: "فرنسية",
    subjectColor: "text-pink-400",
    subjectBg: "bg-pink-500/20 border-pink-500/40",
    initialSeconds: 36 * 60 + 45,
    position: "bottom-left",
    finishedPaper: false,
    score: 70,
  },
  {
    id: "seat-6",
    name: "أمين",
    avatar: "/illustrations/characters/yassine.jpg",
    subject: "تاريخ",
    subjectColor: "text-indigo-400",
    subjectBg: "bg-indigo-500/20 border-indigo-500/40",
    initialSeconds: 65 * 60 + 32,
    position: "bottom-right",
    finishedPaper: true,
    score: 210,
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
    id?: string;
    name: string;
    avatar: string;
    subject: string;
    stream?: StreamId;
  } | null;
  userElapsedSeconds?: number;
  room?: MajlisRoom | null;
  members?: MajlisMember[];
  onSeatClick?: (seat: StudentSeat) => void;
  onJoinSeat?: () => void;
  onLeaveSeat?: () => void;
  onRefreshRoom?: () => void;
}

export function CozyMajlisDesk({
  topicTitle = "المتتاليات",
  occupiedSeatsCount = 6,
  maxSeatsCount = 6,
  isUserSeated = false,
  currentUser = null,
  userElapsedSeconds = 0,
  room = null,
  members = [],
  onSeatClick,
  onJoinSeat,
  onLeaveSeat,
  onRefreshRoom,
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

  // Build reactive seat positions mapping
  const positions: StudentSeat["position"][] = [
    "top-right",
    "top-left",
    "left",
    "right",
    "bottom-left",
    "bottom-right",
  ];

  // Resolve seats based on members or defaults
  const resolvedSeats: StudentSeat[] = positions.map((pos, idx) => {
    const member = members[idx];
    const isUserIndex = isUserSeated && (member?.user_id === currentUser?.id || idx === 4);

    if (isUserIndex) {
      return {
        id: "seat-user",
        name: currentUser?.name || "أنت (طالب)",
        avatar: currentUser?.avatar || "/illustrations/characters/ali.jpg",
        subject: currentUser?.subject || room?.subject || "رياضيات",
        subjectColor: "text-emerald-400",
        subjectBg: "bg-emerald-500/20 border-emerald-500/40",
        initialSeconds: 0,
        position: pos,
        isCurrentUser: true,
        finishedPaper: member?.finished_paper || false,
        score: member?.score || 0,
      };
    }

    if (member) {
      return {
        id: member.id,
        name: member.user_name,
        avatar: member.user_avatar || "/illustrations/characters/sarah.jpg",
        subject: room?.subject || "رياضيات",
        subjectColor: "text-blue-400",
        subjectBg: "bg-blue-500/20 border-blue-500/40",
        initialSeconds: 45 * 60 + idx * 7,
        position: pos,
        finishedPaper: member.finished_paper,
        score: member.score,
      };
    }

    if (idx < (room?.capacity || 6)) {
      const fallback = DEFAULT_SEATS[idx];
      if (fallback) {
        return {
          ...fallback,
          position: pos,
        };
      }
    }

    return {
      id: `seat-empty-${idx}`,
      name: "مقعد متاح",
      avatar: "/illustrations/characters/sarah.jpg",
      subject: "انضم الآن 🪑",
      subjectColor: "text-blue-400",
      subjectBg: "bg-blue-500/20 border-blue-500/40",
      initialSeconds: 0,
      position: pos,
      isEmpty: true,
    };
  });

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center p-3 sm:p-5 lg:p-6 min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] select-none"
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

      {/* Center Table Stage: Rich Interactive Multiplayer Synchronous Stage */}
      {room ? (
        <MajlisCenterStage
          room={room}
          members={members}
          currentUser={{
            id: currentUser?.id || "demo-user",
            name: currentUser?.name || "طالب بكالوريا",
            avatar: currentUser?.avatar || "/illustrations/characters/ali.jpg",
            stream: currentUser?.stream || "sciences_exp",
          }}
          isSeated={isUserSeated}
          onTakeSeat={onJoinSeat}
          onRefreshRoom={onRefreshRoom}
        />
      ) : (
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
      )}

      {/* 6 Student Seated Cards positioned around the perimeter */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="relative w-full h-full max-w-5xl mx-auto p-2 sm:p-5 pointer-events-auto">
          {/* Top-Right */}
          <div className="absolute top-[4%] right-[3%] sm:top-[6%] sm:right-[10%]">
            <SeatPill
              seat={resolvedSeats[0]}
              elapsed={resolvedSeats[0].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === resolvedSeats[0].id}
              onEncourage={(e) => handleEncourage(resolvedSeats[0], e)}
            />
          </div>

          {/* Top-Left */}
          <div className="absolute top-[4%] left-[3%] sm:top-[6%] sm:left-[10%]">
            <SeatPill
              seat={resolvedSeats[1]}
              elapsed={resolvedSeats[1].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === resolvedSeats[1].id}
              onEncourage={(e) => handleEncourage(resolvedSeats[1], e)}
            />
          </div>

          {/* Left */}
          <div className="absolute top-[50%] -translate-y-1/2 left-[1%] sm:left-[3%]">
            <SeatPill
              seat={resolvedSeats[2]}
              elapsed={resolvedSeats[2].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === resolvedSeats[2].id}
              onEncourage={(e) => handleEncourage(resolvedSeats[2], e)}
            />
          </div>

          {/* Right */}
          <div className="absolute top-[50%] -translate-y-1/2 right-[1%] sm:right-[3%]">
            <SeatPill
              seat={resolvedSeats[3]}
              elapsed={resolvedSeats[3].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === resolvedSeats[3].id}
              onEncourage={(e) => handleEncourage(resolvedSeats[3], e)}
            />
          </div>

          {/* Bottom-Left: User Seat (when seated) or Open Seat */}
          <div className="absolute bottom-[4%] left-[3%] sm:bottom-[6%] sm:left-[10%]">
            <SeatPill
              seat={resolvedSeats[4]}
              elapsed={isUserSeated ? userElapsedSeconds : resolvedSeats[4].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === resolvedSeats[4].id}
              onEncourage={(e) => handleEncourage(resolvedSeats[4], e)}
            />
          </div>

          {/* Bottom-Right */}
          <div className="absolute bottom-[4%] right-[3%] sm:bottom-[6%] sm:right-[10%]">
            <SeatPill
              seat={resolvedSeats[5]}
              elapsed={resolvedSeats[5].initialSeconds + secondsOffset}
              isCheered={cheeredStudent === resolvedSeats[5].id}
              onEncourage={(e) => handleEncourage(resolvedSeats[5], e)}
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
        className="group relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-blue-950/60 hover:bg-blue-900/80 border-2 border-dashed border-blue-400/50 hover:border-blue-300 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer animate-pulse"
        title="انقر لحجز هذا المقعد على الطاولة 🪑"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center shrink-0">
          <Plus className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs font-black text-white">مقعد متاح</span>
          <span className="text-[10px] text-blue-300 font-bold">انضم للمجلس 🪑</span>
        </div>
      </div>
    );
  }

  const isUser = seat.isCurrentUser;

  return (
    <div
      onClick={onEncourage}
      className={`group relative flex items-center gap-2 p-1.5 sm:p-2 pr-2 sm:pr-3 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer ${
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

      {/* Avatar with Status Ring & Finished Paper Checkmark */}
      <div
        className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 shadow-md shrink-0 ${
          isUser ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-emerald-400"
        }`}
      >
        <Image
          src={seat.avatar}
          alt={seat.name}
          fill
          sizes="40px"
          className="object-cover"
        />
        {/* Green Online Dot */}
        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0B1222]" />

        {/* Finished Paper Green Checkmark Badge */}
        {seat.finishedPaper && (
          <span
            className="absolute top-0 left-0 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-[#0B1222] shadow-md z-10"
            title="أنهى الحل على الكراس ✍️"
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        )}
      </div>

      {/* Student Details */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-white leading-tight">
            {seat.name}
          </span>
          {isUser && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
              أنت 🌟
            </span>
          )}
          {seat.finishedPaper && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              أنهى ✍️
            </span>
          )}
          {/* Subject Badge */}
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${seat.subjectBg} ${seat.subjectColor}`}
          >
            {seat.subject}
          </span>
        </div>

        {/* Live Stopwatch Counter or Score */}
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-300 mt-0.5">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatStopwatch(elapsed)}</span>
          </div>
          {seat.score !== undefined && seat.score > 0 && (
            <span className="text-emerald-400 font-bold font-mono">
              {seat.score}ن
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
