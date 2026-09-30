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
      ringColor: "ring-emerald-500/30",
    },
    writing: {
      label: "يكتب",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      icon: "✍️",
      ringColor: "ring-blue-500/30",
    },
    answering: {
      label: "يجاوب",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: "💡",
      ringColor: "ring-amber-500/30",
    },
    playing: {
      label: "يلعب",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      icon: "🎮",
      ringColor: "ring-purple-500/30",
    },
    helping: {
      label: "يجاوب",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: "💡",
      ringColor: "ring-amber-500/30",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#0E1A30]/90 border border-slate-700/70 shadow-xl backdrop-blur-xl text-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-700/80 shadow-sm"
            title="الخروج من هذه الطاولة"
          >
            <ArrowRight className="w-4 h-4 text-slate-200" />
            <span>خروج من الطابلة</span>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/40 flex items-center gap-1.5">
                <span>{currentSubj.icon}</span>
                <span>{currentSubj.label}</span>
              </span>

              {/* Discreet LIVE indicator */}
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>طاولة مباشرة 🔴</span>
              </span>

              <span className="text-xs text-slate-300 font-mono font-bold">
                {members.length} من {totalSeats} مقاعد
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              {table.title}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              الموضوع: <span className="text-amber-300 font-bold">{table.topic}</span>
            </p>
          </div>
        </div>

        {/* Header HUD Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>مشاركة الرابط 💬</span>
          </button>

          {isUserSeated ? (
            <button
              type="button"
              onClick={onLeaveTable}
              className="py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>مغادرة المقعد</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onJoinTable}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
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
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-2 border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md shadow-amber-400/30 shrink-0 animate-bounce">
                🎮
              </div>
              <div className="space-y-0.5 text-center sm:text-right">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm font-black text-white">
                    دعوة لتحدي جماعي مباشر!
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black shadow-xs">
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
                  أطلق <strong className="text-amber-300 font-bold">{activeChallenge.session.host_user_name || "زميل"}</strong> تحدياً في {table.topic} ·{" "}
                  <span className="text-amber-400 font-mono font-bold">
                    {activeChallenge.players.length} مشاركين انضموا حتى الآن
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGameModalOpen(true)}
              className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
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
          <div className="relative rounded-[32px] sm:rounded-[36px] border border-slate-700/60 bg-gradient-to-b from-[#0F1D38] via-[#0A1428] to-[#060B16] p-4 sm:p-7 shadow-2xl overflow-hidden min-h-[480px] sm:min-h-[520px] flex flex-col justify-between text-white">
            {/* Ambient Lighting Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-amber-500/5 to-transparent pointer-events-none" />

            {/* Table Header HUD */}
            <div className="relative z-10 flex items-center justify-between text-xs pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-black text-sm text-white">طاولة المراجعة الجماعية</span>
                <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">
                  (انقر على أي زميل لمعرفة تخصصه ومحادثته)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-amber-300 font-bold text-xs">
                  {table.duration_minutes} دقيقة تركيز
                </span>
              </div>
            </div>

            {/* SEATING PODS AROUND THE TACTILE DESK SURFACE */}
            <div className="relative z-10 my-auto py-4 space-y-5">
              {/* DESK CENTERPIECE: TABLE STUDY NOTEBOOK */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 border border-amber-500/50 shadow-xl text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300">موضوع الطاولة:</span>
                  <span className="text-xs sm:text-sm font-black text-white">{table.topic}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <span className="text-amber-300 font-bold">{currentSubj.icon} {currentSubj.label}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-emerald-400 font-black">جلسة مراجعة نشطة 🟢</span>
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
                        className={`group relative p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                          isSelf
                            ? "bg-gradient-to-b from-blue-950/80 to-slate-900/90 border-2 border-blue-500 shadow-xl ring-4 ring-blue-500/20 hover:border-blue-400"
                            : "bg-slate-900/85 border-slate-700/70 hover:border-amber-400 hover:scale-[1.02] shadow-xl backdrop-blur-md"
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
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 shadow-sm relative transition-all ${
                              isSelf ? "border-blue-400 ring-2 ring-blue-400/40" : "border-slate-600 group-hover:border-amber-400"
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
                            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-blue-600 border border-slate-900 text-[10px] flex items-center justify-center animate-bounce">
                              ✍️
                            </span>
                          )}
                          {statusKey === "answering" && (
                            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-amber-500 border border-slate-900 text-[10px] flex items-center justify-center animate-pulse">
                              💡
                            </span>
                          )}
                          {statusKey === "playing" && (
                            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-purple-600 border border-slate-900 text-[10px] flex items-center justify-center animate-spin">
                              🎮
                            </span>
                          )}
                        </div>

                        {/* Name + Wilaya */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs sm:text-sm font-black text-white truncate max-w-[110px]">
                              {member.user_name}
                            </span>
                            {isSelf && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40 font-black">
                                أنت
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300 block font-bold">
                            {formatWilayaName(member.wilaya_code)}
                          </span>
                        </div>

                        {/* Clean Status Badge (Only 4 states) */}
                        <div
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 transition-all ${statusInfo.color}`}
                        >
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </div>

                        {/* Hover hint */}
                        <span className="text-[10px] text-amber-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
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
                      className={`p-4 rounded-3xl border-2 border-dashed border-slate-700/70 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] transition-all ${
                        !isUserSeated
                          ? "bg-slate-900/40 hover:bg-blue-950/40 hover:border-blue-400 cursor-pointer hover:scale-[1.02]"
                          : "opacity-40 bg-slate-900/20"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-white font-black">
                        {!isUserSeated ? "+ احجز مقعدك" : "مقعد شاغر"}
                      </span>
                      {!isUserSeated && (
                        <span className="text-[10px] text-blue-400 font-bold">انقر للجلوس</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Table Action Bar: Multiplayer Showdown Trigger & Quick Cheers */}
            <div className="relative z-10 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Instant Social Cheer Ribbon */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">تفاعل سريع:</span>
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
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs text-white"
                      title={item.label}
                    >
                      <span>{item.emoji}</span>
                      <span className="text-[11px] text-slate-200 font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SPONTANEOUS CHALLENGE BUTTON */}
              <button
                type="button"
                onClick={() => setIsGameModalOpen(true)}
                className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-[32px] border border-slate-700 bg-[#0B1328] p-6 space-y-5 shadow-2xl relative text-white"
            dir="rtl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedMemberForProfile(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-3.5 pt-2">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md">
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
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 font-bold border border-blue-400/40">
                    {selectedMemberForProfile.stream || "علوم تجريبية"}
                  </span>
                  <span className="text-[11px] text-slate-300 font-bold">
                    {formatWilayaName(selectedMemberForProfile.wilaya_code)}
                  </span>
                </div>
              </div>
            </div>

            {/* School & Topic info */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">المؤسسة:</span>
                <span className="text-white font-bold">
                  {selectedMemberForProfile.school || "ثانوية الأمير عبد القادر"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">موضوع المراجعة:</span>
                <span className="text-amber-300 font-bold max-w-[170px] truncate text-left dir-ltr">
                  {selectedMemberForProfile.currentTopic || table.topic}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">الحالة الحالية:</span>
                <span className="text-emerald-400 font-black">
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
                className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
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
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Flame className="w-4 h-4 text-slate-950" />
                <span>شجعه 🔥</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MOBILE BOTTOM ACTION BAR (Touch Targets >= 48px, Exactly 3 Buttons) */}
      {/* =================================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1328]/95 border-t border-slate-800 backdrop-blur-xl px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-xl flex items-center justify-around text-white">
        {/* 1. 💬 الشات */}
        <button
          type="button"
          onClick={() => setActiveMobileDrawer("chat")}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {messages.length % 10}
              </span>
            )}
          </div>
          <span className="text-[11px] font-black">الشات 💬</span>
        </button>

        {/* 2. 🎮 نحداو */}
        <button
          type="button"
          onClick={() => setIsGameModalOpen(true)}
          className="flex flex-col items-center gap-1 text-white transition-colors cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1"
        >
          <div className="p-1.5 rounded-xl bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-black text-amber-300">نحداو 🎮</span>
        </button>

        {/* 3. 👥 الناس */}
        <button
          type="button"
          onClick={() => setActiveMobileDrawer("members")}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1"
        >
          <Users className="w-5 h-5 text-emerald-400" />
          <span className="text-[11px] font-black">الناس ({members.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* MOBILE SLIDE-UP DRAWERS                                             */}
      {/* =================================================================== */}

      {/* Drawer: Chat */}
      {activeMobileDrawer === "chat" && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="h-[85vh] w-full rounded-t-[32px] overflow-hidden bg-[#0D182E] shadow-2xl flex flex-col border-t border-slate-700">
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="max-h-[75vh] w-full rounded-t-[32px] overflow-y-auto bg-[#0B1328] p-5 space-y-4 shadow-2xl border-t border-slate-700 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-sm font-black text-white">
                أعضاء الطاولة الحالية ({members.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveMobileDrawer(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
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
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-850 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700 shadow-xs">
                      <Image src={m.user_avatar} alt={m.user_name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">{m.user_name}</span>
                      <span className="text-[11px] text-slate-300 font-bold">
                        {m.stream || "علوم تجريبية"} · {formatWilayaName(m.wilaya_code)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
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
