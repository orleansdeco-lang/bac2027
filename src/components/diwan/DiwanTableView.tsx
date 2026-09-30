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
  ChevronDown,
  ChevronUp,
  MessageSquare,
  LogOut,
  Edit3,
  BookOpen,
  HelpCircle,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  DiwanTable,
  DiwanMember,
  DiwanMessage,
  StudentActivityStatus,
  DiwanMessageType,
} from "@/types/diwan";
import { DiwanChatPanel } from "./DiwanChatPanel";
import { DiwanMultiplayerGame } from "./DiwanMultiplayerGame";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

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
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/diwan?table=${table.id}`;
      navigator.clipboard.writeText(url);
      showToast("تم نسخ رابط الطاولة! شاركه مع زملائك في القسم 💬");
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

  const statusConfigs: Record<StudentActivityStatus, { label: string; color: string; icon: string }> = {
    studying: { label: "يراجع", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", icon: "📖" },
    writing: { label: "يكتب", color: "bg-blue-500/20 text-blue-300 border-blue-500/40", icon: "✍️" },
    helping: { label: "يساعد", color: "bg-amber-500/20 text-amber-300 border-amber-500/40", icon: "💡" },
    playing: { label: "يلعب", color: "bg-purple-500/20 text-purple-300 border-purple-500/40", icon: "🎮" },
  };

  const currentMember = members.find((m) => m.user_id === currentUser.id);

  // Generate slots for the table capacity (e.g. 6 seats)
  const totalSeats = table.capacity || 6;
  const seats = Array.from({ length: totalSeats }, (_, idx) => {
    return members[idx] || null;
  });

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-2xl border border-blue-400/40 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#0B1222]/90 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="العودة لكل الطاولات"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <span>{currentSubj.icon}</span>
                <span>{currentSubj.label}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>جلسة مباشرة</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {members.length} من {totalSeats} مقاعد
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              {table.title}
            </h2>
          </div>
        </div>

        {/* Actions HUD */}
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
              <span>مغادرة الطاولة</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onJoinTable}
              className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              اجلس على الطاولة 🪑
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Desktop Table (8 Cols) + Chat (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================= */}
        {/* CENTER STAGE: THE DIGITAL STUDY TABLE (8 Cols)                    */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Digital Table Visual Container */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F1A30]/95 via-[#0A1222]/95 to-[#060C17]/95 p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[440px] flex flex-col justify-between">
            {/* Ambient Center Glow */}
            <div className="absolute inset-0 bg-radial from-amber-500/[0.06] via-transparent to-transparent pointer-events-none" />

            {/* Table Header HUD */}
            <div className="relative z-10 flex items-center justify-between text-xs pb-4 border-b border-white/5">
              <span className="text-slate-400">
                موضوع المراجعة: <strong className="text-white">{table.topic}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-slate-300">{table.duration_minutes} دقيقة</span>
              </div>
            </div>

            {/* Students Seated Around the Table (Visual Grid) */}
            <div className="relative z-10 my-auto py-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                {seats.map((member, idx) => {
                  if (member) {
                    const isSelf = member.user_id === currentUser.id;
                    const statusInfo = statusConfigs[member.current_status] || statusConfigs.studying;

                    return (
                      <div
                        key={member.id}
                        className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex flex-col items-center text-center gap-2 relative ${
                          isSelf
                            ? "bg-gradient-to-b from-blue-600/25 to-blue-900/10 border-blue-500/50 shadow-xl shadow-blue-500/10"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md">
                          <Image src={member.user_avatar} alt={member.user_name} fill className="object-cover" />
                        </div>

                        {/* Name + Wilaya */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[110px]">
                              {member.user_name}
                            </span>
                            {isSelf && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-300 font-bold">
                                أنت
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ولاية {member.wilaya_code}
                          </span>
                        </div>

                        {/* Live Status Badge */}
                        <div
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusInfo.color}`}
                        >
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </div>
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
                          ? "bg-white/[0.01] hover:bg-white/[0.04] cursor-pointer hover:border-blue-400/40"
                          : "opacity-40"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {!isUserSeated ? "+ احجز هذا المقعد" : "مقعد شاغر"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Table Action: Prominent Multiplayer Challenge Button */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-300 text-center sm:text-right">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  مراجعة جماعية نشطة · تحدى زملاءك على الطاولة في أسئلة سريعة مدتها 20 ثانية ⚡
                </span>
              </div>

              {/* CHALLENGE BUTTON */}
              <button
                type="button"
                onClick={() => setIsGameModalOpen(true)}
                className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Gamepad2 className="w-5 h-5 text-slate-950" />
                <span>🎮 ابدأ تحدي الطاولة (Multiplayer)</span>
              </button>
            </div>
          </div>

          {/* Current User Status Switcher Bar (If Seated) */}
          {isUserSeated && (
            <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0B1222]/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>حالتي الآن على الطاولة:</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["studying", "writing", "helping", "playing"] as StudentActivityStatus[]).map((st) => {
                  const cfg = statusConfigs[st];
                  const isSelected = currentMember?.current_status === st;

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onStatusChange(st)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? `${cfg.color} shadow-sm font-black`
                          : "bg-white/[0.03] text-slate-400 border-white/10 hover:text-white"
                      }`}
                    >
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* CHAT PANEL: LIVE TIKTOK/DM STYLE (4 Cols Desktop, Bottom Mobile)   */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 h-[550px] lg:h-[620px]">
          <DiwanChatPanel
            tableId={table.id}
            currentUser={currentUser}
            messages={messages}
            onSendMessage={onSendMessage}
            onSendReaction={onSendReaction}
            className="h-full"
          />
        </div>
      </div>

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
