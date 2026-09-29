"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Sparkles, Coffee, Clock, Heart, Shield, Plus, Check, Share2, Flame, ThumbsUp } from "lucide-react";
import { MajlisRoom, MajlisMember } from "@/lib/campus/majlis-service";
import { MajlisCenterStage } from "./MajlisCenterStage";
import { StreamId } from "@/types/education";
import { formatStudentPrivacyName, MAJLIS_CONFIG } from "@/lib/constants/majlis-config";

export interface StudentSeat {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  subject: string;
  subjectColor: string;
  subjectBg: string;
  initialSeconds: number;
  position: "top-right" | "top-left" | "left" | "right" | "bottom-left" | "bottom-right";
  status?: string;
  isCurrentUser?: boolean;
  isEmpty?: boolean;
  finishedPaper?: boolean;
  score?: number;
}

export function formatStopwatch(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

const PEER_SAFE_AVATARS = [
  "/illustrations/characters/sarah.jpg",
  "/illustrations/characters/ali.jpg",
  "/illustrations/characters/mariam.jpg",
  "/illustrations/characters/yassine.jpg",
];

export function getSafePeerAvatar(avatarUrl?: string | null, userId?: string, isSelf?: boolean): string {
  if (isSelf && avatarUrl) return avatarUrl;
  if (avatarUrl && avatarUrl.startsWith("/illustrations/characters/")) {
    return avatarUrl;
  }
  const code = (userId || "student").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PEER_SAFE_AVATARS[code % PEER_SAFE_AVATARS.length];
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
  onSendReaction?: (toUserId: string, reactionEmoji: string) => void;
  onOpenCreateModal?: () => void;
  activeReactionNotification?: {
    fromName: string;
    emoji: string;
    message: string;
  } | null;
}

export function CozyMajlisDesk({
  topicTitle = "المتتاليات",
  occupiedSeatsCount = 0,
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
  onSendReaction,
  onOpenCreateModal,
  activeReactionNotification = null,
}: CozyMajlisDeskProps) {
  const [secondsOffset, setSecondsOffset] = useState(0);
  const [cheeredStudent, setCheeredStudent] = useState<{ id: string; emoji: string } | null>(null);

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
    if (seat.userId && onSendReaction) {
      onSendReaction(seat.userId, "☕");
    }
    setCheeredStudent({ id: seat.id, emoji: "☕" });
    if (onSeatClick) onSeatClick(seat);
    setTimeout(() => {
      setCheeredStudent((current) => (current?.id === seat.id ? null : current));
    }, 2500);
  };

  const handleWhatsAppInvite = () => {
    if (typeof window !== "undefined") {
      const roomIdParam = room?.id ? `&roomId=${encodeURIComponent(room.id)}` : "";
      const inviteUrl = `${window.location.origin}/diwan?tab=majlis${roomIdParam}&invite=true`;
      const message = `السلام عليكم! أنا أذاكر الآن في منصة الشاطر على طاولة "${topicTitle}". انضم إليّ ونراجع معاً: ${inviteUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  // 6 Fixed Positions for Desktop
  const positions: StudentSeat["position"][] = [
    "top-right",
    "top-left",
    "left",
    "right",
    "bottom-left",
    "bottom-right",
  ];

  // If no room is active, render dignified empty state
  if (!room) {
    return (
      <div
        className="relative w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center p-6 sm:p-12 min-h-[520px] sm:min-h-[600px] select-none text-center"
        style={{
          background: "radial-gradient(ellipse at center, #101B33 0%, #070B14 100%)",
        }}
        dir="rtl"
      >
        <div className="relative z-10 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-400 shadow-xl shadow-blue-500/10">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ما كاين حتى مجلس مفتوح حالياً
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            كن أول من يفتح طاولة مذاكرة لشعبتك واجمع زملاءك للحل المشترك، المراجعة بالمؤقت، وتثبيت الدروس.
          </p>
          <div className="pt-3">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>أنشئ أول مجلس</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resolve genuine seats: strictly real members matching seat_index
  const capacity = room?.capacity || maxSeatsCount || 6;
  const resolvedSeats: StudentSeat[] = positions.slice(0, capacity).map((pos, idx) => {
    const member =
      members.find((m) => m.seat_index === idx) ||
      (members[idx]?.seat_index === undefined ? members[idx] : undefined);
    const isCurrentUserSeatedHere = Boolean(
      (isUserSeated && member && currentUser?.id && member.user_id === currentUser.id) ||
      (isUserSeated && !members.some((m) => m.user_id === currentUser?.id) && idx === 0)
    );

    if (isCurrentUserSeatedHere) {
      return {
        id: "seat-user",
        userId: currentUser?.id,
        name: formatStudentPrivacyName(currentUser?.name),
        avatar: getSafePeerAvatar(currentUser?.avatar, currentUser?.id, true),
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
      const joinedAgoSec = member.joined_at
        ? Math.max(0, Math.floor((Date.now() - new Date(member.joined_at).getTime()) / 1000))
        : 0;

      return {
        id: member.id,
        userId: member.user_id,
        name: formatStudentPrivacyName(member.user_name),
        avatar: getSafePeerAvatar(member.user_avatar, member.user_id, false),
        subject: room?.subject || "رياضيات",
        subjectColor: "text-blue-400",
        subjectBg: "bg-blue-500/20 border-blue-500/40",
        initialSeconds: joinedAgoSec,
        position: pos,
        finishedPaper: member.finished_paper,
        score: member.score,
      };
    }

    // Genuinely empty seat (no ghost bots!)
    return {
      id: `seat-empty-${idx}`,
      name: "مقعد شاغر",
      avatar: "/illustrations/characters/sarah.jpg",
      subject: "متاح 🪑",
      subjectColor: "text-blue-400",
      subjectBg: "bg-blue-500/20 border-blue-500/40",
      initialSeconds: 0,
      position: pos,
      isEmpty: true,
    };
  });

  const isTableEmpty = members.length === 0 && !isUserSeated;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center p-3 sm:p-5 lg:p-6 min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] select-none"
      style={{
        background: "radial-gradient(ellipse at center, #101B33 0%, #070B14 100%)",
      }}
      dir="rtl"
    >
      {/* Background Library Canvas */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/illustrations/majlis-table-bg.jpg"
          alt="طاولة مجلس العلم"
          fill
          priority
          className="object-cover object-center opacity-60 brightness-[0.7] contrast-[1.1]"
        />
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

      {/* Live Incoming Reaction Notification */}
      {activeReactionNotification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl animate-in bounce-in duration-300 flex items-center gap-2">
          <span className="text-base">{activeReactionNotification.emoji}</span>
          <span>
            {activeReactionNotification.fromName}: {activeReactionNotification.message}
          </span>
        </div>
      )}

      {/* Honest Empty State Banner (when no one is yet seated) */}
      {isTableEmpty && (
        <div className="relative z-30 mb-4 px-4 py-3 rounded-2xl bg-blue-950/70 border border-blue-400/30 text-white max-w-md text-center shadow-xl animate-in fade-in duration-300">
          <span className="text-xs font-bold block text-blue-200">
            أنت أول الحاضرين اليوم 🌙
          </span>
          <p className="text-[11px] text-slate-300 mt-1">
            احجز مقعدك وابدأ جلستك وسيلحق بك زملاؤك. المؤقت والتمارين تعمل بكفاءة تامة.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2.5">
            {onJoinSeat && (
              <button
                type="button"
                onClick={onJoinSeat}
                className="py-1 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
              >
                احجز أول مقعد 🪑
              </button>
            )}
            <button
              type="button"
              onClick={handleWhatsAppInvite}
              className="py-1 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>ادعُ زميلاً عبر واتساب</span>
            </button>
          </div>
        </div>
      )}

      {/* Alone on Table Banner (when user is seated alone) */}
      {isUserSeated && members.length <= 1 && (
        <div className="relative z-30 mb-4 px-4 py-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-white max-w-lg text-center shadow-xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-300 block">
                أنت جالس على الطاولة بمفردك الآن 🪑
              </span>
              <span className="text-[11px] text-slate-300">
                شارك الرابط ليتحدى زميل معك في هذا التمرين بتوقيت الجزائر
              </span>
            </div>
            <button
              type="button"
              onClick={handleWhatsAppInvite}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>ادعُ زميلاً عبر واتساب 💬</span>
            </button>
          </div>
        </div>
      )}

      {/* Center Table Stage */}
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
        <div className="relative z-20 my-auto flex flex-col items-center text-center max-w-[240px] sm:max-w-xs px-4 py-3 rounded-2xl bg-[#0B1222]/85 backdrop-blur-md border border-white/10 shadow-2xl">
          <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-bold mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>مجلس دراسة: {topicTitle}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono mt-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {occupiedSeatsCount}/{capacity} مقاعد نشطة
            </span>
          </div>
        </div>
      )}

      {/* Desktop Perimeter Seating (Hidden on narrow screens < 380px) */}
      <div className="hidden sm:block absolute inset-0 z-20 pointer-events-none">
        <div className="relative w-full h-full max-w-5xl mx-auto p-2 sm:p-5 pointer-events-auto">
          {/* Top-Right */}
          <div className="absolute top-[4%] right-[3%] sm:top-[6%] sm:right-[10%]">
            <SeatPill
              seat={resolvedSeats[0]}
              elapsed={resolvedSeats[0].initialSeconds + secondsOffset}
              isCheered={cheeredStudent?.id === resolvedSeats[0].id}
              cheeredEmoji={cheeredStudent?.emoji}
              onEncourage={(e) => handleEncourage(resolvedSeats[0], e)}
            />
          </div>

          {/* Top-Left */}
          <div className="absolute top-[4%] left-[3%] sm:top-[6%] sm:left-[10%]">
            <SeatPill
              seat={resolvedSeats[1]}
              elapsed={resolvedSeats[1].initialSeconds + secondsOffset}
              isCheered={cheeredStudent?.id === resolvedSeats[1].id}
              cheeredEmoji={cheeredStudent?.emoji}
              onEncourage={(e) => handleEncourage(resolvedSeats[1], e)}
            />
          </div>

          {/* Left */}
          <div className="absolute top-[50%] -translate-y-1/2 left-[1%] sm:left-[3%]">
            <SeatPill
              seat={resolvedSeats[2]}
              elapsed={resolvedSeats[2].initialSeconds + secondsOffset}
              isCheered={cheeredStudent?.id === resolvedSeats[2].id}
              cheeredEmoji={cheeredStudent?.emoji}
              onEncourage={(e) => handleEncourage(resolvedSeats[2], e)}
            />
          </div>

          {/* Right */}
          <div className="absolute top-[50%] -translate-y-1/2 right-[1%] sm:right-[3%]">
            <SeatPill
              seat={resolvedSeats[3]}
              elapsed={resolvedSeats[3].initialSeconds + secondsOffset}
              isCheered={cheeredStudent?.id === resolvedSeats[3].id}
              cheeredEmoji={cheeredStudent?.emoji}
              onEncourage={(e) => handleEncourage(resolvedSeats[3], e)}
            />
          </div>

          {/* Bottom-Left */}
          <div className="absolute bottom-[4%] left-[3%] sm:bottom-[6%] sm:left-[10%]">
            <SeatPill
              seat={resolvedSeats[4]}
              elapsed={isUserSeated ? userElapsedSeconds : resolvedSeats[4].initialSeconds + secondsOffset}
              isCheered={cheeredStudent?.id === resolvedSeats[4].id}
              cheeredEmoji={cheeredStudent?.emoji}
              onEncourage={(e) => handleEncourage(resolvedSeats[4], e)}
            />
          </div>

          {/* Bottom-Right */}
          <div className="absolute bottom-[4%] right-[3%] sm:bottom-[6%] sm:right-[10%]">
            <SeatPill
              seat={resolvedSeats[5]}
              elapsed={resolvedSeats[5].initialSeconds + secondsOffset}
              isCheered={cheeredStudent?.id === resolvedSeats[5].id}
              cheeredEmoji={cheeredStudent?.emoji}
              onEncourage={(e) => handleEncourage(resolvedSeats[5], e)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Responsive Compact Grid (< 380px screens) */}
      <div className="sm:hidden relative z-20 w-full mt-4 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between pb-2 mb-2">
          <span className="text-[11px] font-bold text-slate-300">مقاعد المجلس ({members.length}/{capacity})</span>
          <span className="text-[10px] text-emerald-400 font-mono">حقيقي 100%</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {resolvedSeats.map((seat, sIdx) => (
            <SeatPill
              key={seat.id || sIdx}
              seat={seat}
              elapsed={seat.isCurrentUser ? userElapsedSeconds : seat.initialSeconds + secondsOffset}
              isCheered={cheeredStudent?.id === seat.id}
              cheeredEmoji={cheeredStudent?.emoji}
              onEncourage={(e) => handleEncourage(seat, e)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SeatPill({
  seat,
  elapsed,
  isCheered,
  cheeredEmoji = "☕",
  onEncourage,
}: {
  seat: StudentSeat;
  elapsed: number;
  isCheered: boolean;
  cheeredEmoji?: string;
  onEncourage: (e: React.MouseEvent) => void;
}) {
  if (seat.isEmpty) {
    return (
      <div
        onClick={onEncourage}
        className="group relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-dashed border-blue-400/40 hover:border-blue-300 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer"
        title="انقر لحجز هذا المقعد 🪑"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center shrink-0">
          <Plus className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-bold text-white leading-tight">مقعد شاغر</span>
          <span className="text-[9px] text-blue-300">انضم للمجلس 🪑</span>
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
      title={isUser ? "أنت حاضر في هذا المقعد" : `انقر لتشجيع ${seat.name}`}
    >
      {/* Floating Encouragement Animation */}
      {isCheered && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-lg animate-bounce flex items-center gap-1 z-30 whitespace-nowrap">
          <span>{cheeredEmoji} +1 تشجيع!</span>
        </div>
      )}

      {/* Avatar with Status Ring & Finished Paper Checkmark */}
      <div
        className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 shadow-md shrink-0 ${
          isUser ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-emerald-400"
        }`}
      >
        <Image
          src={seat.avatar}
          alt={seat.name}
          fill
          sizes="32px"
          className="object-cover"
        />
        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0B1222]" />

        {seat.finishedPaper && (
          <span
            className="absolute top-0 left-0 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-[#0B1222] shadow-md z-10"
            title="أنهى الحل على الكراس ✍️"
          >
            <Check className="w-2 h-2 stroke-[3]" />
          </span>
        )}
      </div>

      {/* Student Details */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white leading-tight">
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
        </div>

        {/* Live Stopwatch Counter */}
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
