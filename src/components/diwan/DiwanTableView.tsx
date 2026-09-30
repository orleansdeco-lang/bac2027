"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Gamepad2,
  Clock,
  Sparkles,
  ArrowRight,
  Share2,
  LogOut,
  BookOpen,
  X,
  Flame,
  MessageSquare,
  Zap,
} from "lucide-react";
import {
  DiwanTable,
  DiwanMember,
  DiwanMessage,
  StudentActivityStatus,
  DiwanMessageType,
  DiwanGameSession,
  DiwanGamePlayer,
} from "@/types/diwan";
import { DiwanService } from "@/lib/diwan/diwan-service";
import { formatWilayaName } from "@/lib/constants/majlis-config";
import { DiwanChatPanel } from "./DiwanChatPanel";
import { DiwanMultiplayerGame } from "./DiwanMultiplayerGame";

interface DiwanTableViewProps {
  table: DiwanTable;
  members: DiwanMember[];
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    wilayaCode?: string;
  };
  isUserSeated: boolean;
  messages: DiwanMessage[];
  onJoinTable: () => void;
  onLeaveTable: () => void;
  onStatusChange: (status: StudentActivityStatus) => void;
  onSendMessage: (content: string, type: DiwanMessageType) => void;
  onSendReaction: (emoji: string) => void;
  onBackToLobby: () => void;
}

// Floating cheer particle definition
interface FloatingParticle {
  id: string;
  emoji: string;
  seatIndex: number;
}

export function DiwanTableView({
  table,
  members,
  currentUser,
  isUserSeated,
  messages,
  onJoinTable,
  onLeaveTable,
  onStatusChange,
  onSendMessage,
  onSendReaction,
  onBackToLobby,
}: DiwanTableViewProps) {
  // Modals & Drawers State
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [activeMobileDrawer, setActiveMobileDrawer] = useState<"chat" | "members" | null>(null);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<DiwanMember | null>(null);

  // Active Challenge synchronization
  const [activeChallenge, setActiveChallenge] = useState<{
    session: DiwanGameSession | null;
    players: DiwanGamePlayer[];
  }>({ session: null, players: [] });

  useEffect(() => {
    let isMounted = true;
    async function checkChallenge() {
      const active = await DiwanService.getActiveGame(table.id);
      if (isMounted) {
        setActiveChallenge(active);
      }
    }
    checkChallenge();
    const interval = setInterval(checkChallenge, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [table.id]);

  // Chat Prefill state (when clicking "اسقسيه")
  const [chatPrefill, setChatPrefill] = useState<{
    text: string;
    type?: DiwanMessageType;
    timestamp: number;
  } | null>(null);

  // Floating Cheers animation state
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/diwan?table=${table.id}`;
      navigator.clipboard.writeText(url);
      showToast("تم نسخ رابط الطاولة! شاركه مع زملائك 💬");
    }
  };

  // Trigger quick cheer for a student
  const handleCheerMember = (member: DiwanMember, emoji = "🔥") => {
    const particleId = `${Date.now()}-${Math.random()}`;
    setFloatingParticles((prev) => [
      ...prev,
      { id: particleId, emoji, seatIndex: member.seat_index },
    ]);

    // Send reaction to room
    onSendMessage(`${emoji} تشجيع لـ ${member.user_name}`, "reaction");
    showToast(`أرسلت تشجيعاً ${emoji} لـ ${member.user_name}!`);

    // Remove particle after animation
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== particleId));
    }, 1800);
  };

  // Trigger "اسقسيه" action
  const handleAskMember = (member: DiwanMember) => {
    setSelectedMemberForProfile(null);
    setChatPrefill({
      text: `@${member.user_name} `,
      type: "question",
      timestamp: Date.now(),
    });

    // On mobile, automatically open chat drawer
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveMobileDrawer("chat");
    }
  };

  const subjectBadges: Record<string, { label: string; icon: string }> = {
    math: { label: "الرياضيات", icon: "📐" },
    physics: { label: "الفيزياء", icon: "⚡" },
    sciences: { label: "العلوم الطبيعية", icon: "🧬" },
    philosophy: { label: "الفلسفة", icon: "🏛️" },
    history_geo: { label: "التاريخ والجغرافيا", icon: "🌍" },
    arabic: { label: "اللغة العربية", icon: "📖" },
    islamic: { label: "العلوم الإسلامية", icon: "🕌" },
  };

  const currentSubj = subjectBadges[table.subject] || { label: table.subject, icon: "📚" };

  // EXACT 4 CORE STATUSES (Derived dynamically from activity)
  const statusConfigs: Record<
    StudentActivityStatus,
    { label: string; color: string; icon: string; ringColor: string }
  > = {
    studying: {
      label: "يراجع الآن",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: "📖",
      ringColor: "ring-emerald-500/40",
    },
    writing: {
      label: "يكتب",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      icon: "✍️",
      ringColor: "ring-blue-500/40",
    },
    answering: {
      label: "يجاوب",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: "💡",
      ringColor: "ring-amber-500/40",
    },
    playing: {
      label: "يلعب",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      icon: "🎮",
      ringColor: "ring-purple-500/40",
    },
    helping: {
      label: "يجاوب",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: "💡",
      ringColor: "ring-amber-500/40",
    },
  };

  const currentMember = members.find((m) => m.user_id === currentUser.id);

  // Generate slots for table capacity (6 seats default)
  const totalSeats = table.capacity || 6;
  const seats = Array.from({ length: totalSeats }, (_, idx) => {
    return members.find((m) => m.seat_index === idx) || members[idx] || null;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-2xl border border-blue-400/40 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* TOP HEADER BAR: CLEAN, MINIMAL & PEOPLE-FIRST                       */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#0B1222]/90 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="py-2 px-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="الخروج من هذه الطاولة"
          >
            <ArrowRight className="w-4 h-4" />
            <span>خروج من الطابلة</span>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <span>{currentSubj.icon}</span>
                <span>{currentSubj.label}</span>
              </span>

              {/* Discreet LIVE indicator */}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>طاولة مباشرة 🔴</span>
              </span>

              <span className="text-[10px] text-slate-300 font-mono font-bold">
                {members.length} من {totalSeats} مقاعد
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              {table.title}
            </h2>
            <p className="text-xs text-slate-300">
              الموضوع: <span className="text-white font-bold">{table.topic}</span>
            </p>
          </div>
        </div>

        {/* Header HUD Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleShare}
            className="py-2 px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة الرابط 💬</span>
          </button>

          {isUserSeated ? (
            <button
              type="button"
              onClick={onLeaveTable}
              className="py-2 px-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>مغادرة المقعد</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onJoinTable}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              اجلس على الطاولة 🪑
            </button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* LIVE ACTIVE CHALLENGE INVITATION BANNER (For Everyone in the Room)  */}
      {/* =================================================================== */}
      {activeChallenge.session &&
        (activeChallenge.session.status === "WAITING" ||
          activeChallenge.session.status === "READY" ||
          activeChallenge.session.status === "STARTING") && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-blue-500/10 border-2 border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-400/30 shrink-0 animate-bounce">
                🎮
              </div>
              <div className="space-y-0.5 text-center sm:text-right">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm font-black text-amber-300">
                    دعوة لتحدي جماعي مباشر!
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black shadow-sm">
                    {activeChallenge.session.game_type === "SPEED_RUSH"
                      ? "أسرع واحد ⚡"
                      : activeChallenge.session.game_type === "TRUE_FALSE_BLITZ"
                      ? "صح ولا خطأ ⏱️"
                      : activeChallenge.session.game_type === "BRAIN_RUSH"
                      ? "معركة الذكاء 🧠"
                      : activeChallenge.session.game_type === "MEMORY_BATTLE"
                      ? "معركة الذاكرة 👁️"
                      : "سباق المنهاج 🏆"}
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  أطلق <strong className="text-white font-bold">{activeChallenge.session.host_user_name || "زميل"}</strong> تحدياً في {table.topic} ·{" "}
                  <span className="text-amber-300 font-mono font-bold">
                    {activeChallenge.players.length} مشاركين انضموا حتى الآن
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGameModalOpen(true)}
              className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>ادخل التحدي الآن ⚡</span>
            </button>
          </div>
        )}

      {/* =================================================================== */}
      {/* MAIN VIEW: STUDY TABLE (Center 8 Cols) + CHAT (4 Cols Desktop)      */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================= */}
        {/* CENTER STAGE: THE DIGITAL STUDY TABLE (8 Cols)                    */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* DIGITAL STUDY TABLE CONTAINER */}
          <div className="relative rounded-[36px] border border-white/15 bg-gradient-to-b from-[#0F1A30] via-[#0A1222] to-[#050A14] p-5 sm:p-8 shadow-2xl overflow-hidden min-h-[480px] sm:min-h-[520px] flex flex-col justify-between">
            {/* Center Felt Warm Glow */}
            <div className="absolute inset-0 bg-radial from-amber-500/[0.08] via-blue-500/[0.03] to-transparent pointer-events-none" />

            {/* Stadium Table Contour Effect */}
            <div className="absolute inset-6 rounded-[28px] border border-white/5 pointer-events-none bg-gradient-to-b from-white/[0.01] to-transparent" />

            {/* Table Header HUD */}
            <div className="relative z-10 flex items-center justify-between text-xs pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-bold">طاولة المراجعة الجماعية</span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  (انقر على أي زميل لمعرفة تخصصه ومحادثته)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-slate-300 text-xs">
                  {table.duration_minutes} دقيقة تركيز
                </span>
              </div>
            </div>

            {/* SEATING PODS AROUND THE TABLE SURFACE */}
            <div className="relative z-10 my-auto py-4 space-y-5">
              {/* DESK CENTERPIECE: TABLE STUDY NOTEBOOK */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/35 border border-white/10 text-center space-y-2 backdrop-blur-md shadow-inner">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">موضوع الطاولة:</span>
                  <span className="text-xs font-black text-white">{table.topic}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span>{currentSubj.icon} {currentSubj.label}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">جلسة مراجعة نشطة</span>
                </div>
              </div>

              {/* SEATS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5 max-w-2xl mx-auto">
                {seats.map((member, idx) => {
                  // Floating Cheer Particles over this seat
                  const seatParticles = floatingParticles.filter((p) => p.seatIndex === idx);

                  if (member) {
                    const isSelf = member.user_id === currentUser.id;
                    const statusKey = member.current_status || "studying";
                    const statusInfo = statusConfigs[statusKey] || statusConfigs.studying;

                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMemberForProfile(member)}
                        className={`group relative p-4 rounded-3xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2.5 ${
                          isSelf
                            ? "bg-gradient-to-b from-blue-600/25 to-blue-900/10 border-blue-500/60 shadow-xl shadow-blue-500/10 hover:border-blue-400"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/25 hover:scale-[1.02]"
                        }`}
                      >
                        {/* Floating Cheer Emojis */}
                        {seatParticles.map((sp) => (
                          <div
                            key={sp.id}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl z-30 pointer-events-none animate-in fade-in zoom-in slide-out-to-top-8 duration-1000"
                          >
                            {sp.emoji}
                          </div>
                        ))}

                        {/* Avatar with Activity Pulse Ring */}
                        <div className="relative">
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 shadow-lg relative transition-all ${
                              isSelf ? "border-blue-400 ring-4 ring-blue-500/20" : "border-white/20 group-hover:border-white/40"
                            }`}
                          >
                            <Image
                              src={member.user_avatar}
                              alt={member.user_name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Subtle activity animation indicator */}
                          {statusKey === "writing" && (
                            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-blue-500 border border-white text-[10px] flex items-center justify-center animate-bounce">
                              ✍️
                            </span>
                          )}
                          {statusKey === "answering" && (
                            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-amber-500 border border-white text-[10px] flex items-center justify-center animate-pulse">
                              💡
                            </span>
                          )}
                          {statusKey === "playing" && (
                            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-purple-500 border border-white text-[10px] flex items-center justify-center animate-spin">
                              🎮
                            </span>
                          )}
                        </div>

                        {/* Name + Wilaya */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[110px]">
                              {member.user_name}
                            </span>
                            {isSelf && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-black">
                                أنت
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-300 block font-bold">
                            {formatWilayaName(member.wilaya_code)}
                          </span>
                        </div>

                        {/* Clean Status Badge (Only 4 states) */}
                        <div
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-all ${statusInfo.color}`}
                        >
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </div>

                        {/* Hover hint */}
                        <span className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          انقر للملف 👤
                        </span>
                      </div>
                    );
                  }

                  // Empty Seat Placeholder
                  return (
                    <div
                      key={`empty-${idx}`}
                      onClick={!isUserSeated ? onJoinTable : undefined}
                      className={`p-4 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] transition-all ${
                        !isUserSeated
                          ? "bg-white/[0.01] hover:bg-white/[0.05] cursor-pointer hover:border-blue-400/50 hover:scale-[1.02]"
                          : "opacity-35"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-slate-300 font-bold">
                        {!isUserSeated ? "+ احجز مقعدك" : "مقعد شاغر"}
                      </span>
                      {!isUserSeated && (
                        <span className="text-[9px] text-blue-400">انقر للجلوس</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Table Action Bar: Multiplayer Showdown Trigger & Quick Cheers */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Instant Social Cheer Ribbon */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">تفاعل سريع:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { emoji: "🔥", label: "شجع" },
                    { emoji: "👏", label: "برافو" },
                    { emoji: "💡", label: "فكرة" },
                    { emoji: "☕", label: "قهوة" },
                  ].map((item) => (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => {
                        onSendReaction(item.emoji);
                        if (currentMember) {
                          const particleId = `${Date.now()}-${Math.random()}`;
                          setFloatingParticles((prev) => [
                            ...prev,
                            { id: particleId, emoji: item.emoji, seatIndex: currentMember.seat_index },
                          ]);
                          setTimeout(() => {
                            setFloatingParticles((prev) => prev.filter((p) => p.id !== particleId));
                          }, 1800);
                        }
                        showToast(`أرسلت ${item.emoji} ${item.label} للطاولة!`);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs flex items-center gap-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title={item.label}
                    >
                      <span>{item.emoji}</span>
                      <span className="text-[10px] text-slate-300 font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SPONTANEOUS CHALLENGE BUTTON */}
              <button
                type="button"
                onClick={() => setIsGameModalOpen(true)}
                className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Gamepad2 className="w-5 h-5 text-slate-950" />
                <span>🎮 ابدأ تحدي الطاولة الجماعي</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* DESKTOP CHAT PANEL (4 Cols) - With Auto-Presence Wiring           */}
        {/* ================================================================= */}
        <div className="hidden lg:block lg:col-span-4 h-[640px] sticky top-4">
          <DiwanChatPanel
            tableId={table.id}
            currentUser={currentUser}
            messages={messages}
            onSendMessage={onSendMessage}
            onSendReaction={onSendReaction}
            onTyping={(isTyping) => onStatusChange(isTyping ? "writing" : "studying")}
            prefillInput={chatPrefill}
            className="h-full"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* FLOATING MINI PROFILE CARD (Modal Popover on Avatar Click)          */}
      {/* =================================================================== */}
      {selectedMemberForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-[32px] border border-white/15 bg-gradient-to-b from-[#0F1A30] to-[#0A1222] p-6 space-y-5 shadow-2xl relative"
            dir="rtl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedMemberForProfile(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-3.5 pt-2">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-400 shadow-xl">
                <Image
                  src={selectedMemberForProfile.user_avatar}
                  alt={selectedMemberForProfile.user_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-white">
                  {selectedMemberForProfile.user_name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    {selectedMemberForProfile.stream || "علوم تجريبية"}
                  </span>
                  <span className="text-[10px] text-slate-200 font-bold">
                    {formatWilayaName(selectedMemberForProfile.wilaya_code)}
                  </span>
                </div>
              </div>
            </div>

            {/* School & Topic info */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>المؤسسة:</span>
                <span className="text-slate-200 font-bold">
                  {selectedMemberForProfile.school || "ثانوية الأمير عبد القادر"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>موضوع المراجعة:</span>
                <span className="text-amber-300 font-bold max-w-[170px] truncate text-left dir-ltr">
                  {selectedMemberForProfile.currentTopic || table.topic}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>الحالة الحالية:</span>
                <span className="text-emerald-300 font-bold">
                  {statusConfigs[selectedMemberForProfile.current_status]?.label || "يراجع الآن"}
                </span>
              </div>
            </div>

            {/* EXACT 2 ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Button 1: اسقسيه */}
              <button
                type="button"
                onClick={() => handleAskMember(selectedMemberForProfile)}
                className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>اسقسيه 💬</span>
              </button>

              {/* Button 2: شجعه */}
              <button
                type="button"
                onClick={() => {
                  handleCheerMember(selectedMemberForProfile, "🔥");
                  setSelectedMemberForProfile(null);
                }}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Flame className="w-4 h-4 text-slate-950" />
                <span>شجعه 🔥</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MOBILE BOTTOM ACTION BAR (Touch Targets >= 44px, Exactly 3 Buttons) */}
      {/* =================================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1222]/95 border-t border-white/10 backdrop-blur-xl px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around">
        {/* 1. 💬 الشات */}
        <button
          type="button"
          onClick={() => setActiveMobileDrawer("chat")}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[56px] py-1"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                {messages.length % 10}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">الشات 💬</span>
        </button>

        {/* 2. 🎮 نحداو */}
        <button
          type="button"
          onClick={() => setIsGameModalOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[56px] py-1"
        >
          <div className="p-1 rounded-xl bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-amber-400">نحداو 🎮</span>
        </button>

        {/* 3. 👥 الناس */}
        <button
          type="button"
          onClick={() => setActiveMobileDrawer("members")}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[56px] py-1"
        >
          <Users className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold">الناس ({members.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* MOBILE SLIDE-UP DRAWERS                                             */}
      {/* =================================================================== */}

      {/* Drawer: Chat */}
      {activeMobileDrawer === "chat" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="h-[80vh] w-full rounded-t-[32px] overflow-hidden bg-[#0B1222] shadow-2xl flex flex-col">
            <DiwanChatPanel
              tableId={table.id}
              currentUser={currentUser}
              messages={messages}
              onSendMessage={onSendMessage}
              onSendReaction={onSendReaction}
              onTyping={(isTyping) => onStatusChange(isTyping ? "writing" : "studying")}
              prefillInput={chatPrefill}
              onCloseMobile={() => setActiveMobileDrawer(null)}
              className="h-full border-none rounded-none"
            />
          </div>
        </div>
      )}

      {/* Drawer: Members List */}
      {activeMobileDrawer === "members" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="max-h-[75vh] w-full rounded-t-[32px] overflow-y-auto bg-[#0B1222] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-white">
                أعضاء الطاولة الحالية ({members.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveMobileDrawer(null)}
                className="p-1.5 rounded-xl bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {members.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setActiveMobileDrawer(null);
                    setSelectedMemberForProfile(m);
                  }}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                      <Image src={m.user_avatar} alt={m.user_name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{m.user_name}</span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {m.stream || "علوم تجريبية"} · {formatWilayaName(m.wilaya_code)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      statusConfigs[m.current_status]?.color || statusConfigs.studying.color
                    }`}
                  >
                    {statusConfigs[m.current_status]?.label || "يراجع"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Multiplayer Challenge Modal */}
      <DiwanMultiplayerGame
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        table={table}
        members={members}
        currentUser={currentUser}
      />
    </div>
  );
}
