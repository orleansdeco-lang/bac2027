"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  LogIn,
  LogOut,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  Tag,
  Share2,
  Calendar,
  Check,
  X,
  Plus,
  MessageSquare,
  Send,
  AlertTriangle,
  UserX,
  ShieldAlert,
} from "lucide-react";
import { PlannerStorage, getTodayDateString } from "@/lib/planner/storage";
import { useAuth } from "@/lib/auth/context";
import { formatStopwatch } from "./CozyMajlisDesk";
import { MajlisMessage } from "@/lib/campus/majlis-service";
import { StreamId } from "@/types/education";
import { MAJLIS_CONFIG, formatStudentPrivacyName } from "@/lib/constants/majlis-config";

export interface PanelMember {
  userId?: string;
  name: string;
  avatar: string;
  subject: string;
  subjectColor: string;
}

interface MajlisInspectorPanelProps {
  topic?: string;
  description?: string;
  tags?: string[];
  members?: PanelMember[];
  messages?: MajlisMessage[];
  onSendMessage?: (content: string) => Promise<void>;
  onSendReaction?: (reactionEmoji: string, reactionMessage: string) => Promise<void>;
  onKickMember?: (userId: string) => Promise<void> | void;
  onJoin?: () => void;
  onLeave?: () => void;
  isJoined?: boolean;
  userElapsedSeconds?: number;
  currentUser?: {
    id?: string;
    name: string;
    avatar: string;
    subject: string;
    stream?: StreamId;
  } | null;
  hostUserId?: string;
  isHost?: boolean;
  roomId?: string;
}

export function MajlisInspectorPanel({
  topic = "المتتاليات",
  description = "نناقش اليوم: حل التمارين + مراجعة الدرس - مواضيع البكالوريا",
  tags = ["رياضيات", "البكالوريا"],
  members = [],
  messages = [],
  onSendMessage,
  onSendReaction,
  onKickMember,
  onJoin,
  onLeave,
  isJoined = false,
  userElapsedSeconds = 0,
  currentUser = null,
  hostUserId,
  roomId,
}: MajlisInspectorPanelProps) {
  const { user } = useAuth();
  const [panelTab, setPanelTab] = useState<"members" | "chat">("members");
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState(`مجلس مذاكرة: ${topic}`);
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString());
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [scheduleDuration, setScheduleDuration] = useState(45);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reporting State
  const [reportingMember, setReportingMember] = useState<PanelMember | null>(null);
  const [reportReason, setReportReason] = useState<string>("INAPPROPRIATE_BEHAVIOR");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareTable = () => {
    if (typeof window !== "undefined") {
      const inviteUrl = `${window.location.origin}/diwan?tab=majlis&invite=true`;
      navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      showToast("تم نسخ رابط المجلس لدعوة زملائك! 🔗");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !onSendMessage) return;
    setIsSending(true);
    try {
      await onSendMessage(chatInput.trim());
      setChatInput("");
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReaction = async (reactionEmoji: string, reactionMessage: string) => {
    if (!isJoined) {
      showToast("يرجى حجز مقعد على الطاولة أولاً لإرسال التفاعلات 🪑");
      return;
    }
    if (onSendReaction) {
      await onSendReaction(reactionEmoji, reactionMessage);
      showToast(`أرسلت: ${reactionEmoji} ${reactionMessage}`);
    } else if (onSendMessage) {
      await onSendMessage(`${reactionEmoji} ${reactionMessage}`);
      showToast(`أرسلت: ${reactionEmoji}`);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUserId = user?.id || "demo-user";
    const now = new Date().toISOString();

    try {
      await PlannerStorage.saveEvent({
        id: `majlis-schedule-${Date.now()}`,
        userId: effectiveUserId,
        user_id: effectiveUserId,
        title: scheduleTitle,
        type: "STUDY",
        event_type: "study",
        date: scheduleDate,
        startTime: scheduleTime,
        start_time: scheduleTime,
        durationMinutes: scheduleDuration,
        duration_minutes: scheduleDuration,
        priority: "HIGH",
        status: "TODO",
        notes: `مجلس مذاكرة في ديوان العلم: ${topic}`,
        description: `مجلس مذاكرة في ديوان العلم: ${topic}`,
        source: "STUDY_MAJLIS",
        createdAt: now,
        created_at: now,
        updatedAt: now,
        updated_at: now,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("planner-events-changed"));
        window.dispatchEvent(new CustomEvent("must-win-updated"));
      }

      setIsScheduleModalOpen(false);
      showToast("تمت برمجة هذا المجلس بنجاح في مخططك اليومي 📅");
    } catch (err) {
      console.error("Failed to schedule majlis event:", err);
      showToast("حدث خطأ أثناء حفظ موعد المجلس في المخطط");
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMember?.userId) return;
    setIsSubmittingReport(true);
    try {
      const res = await fetch("/api/campus/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId: reportingMember.userId,
          reportedUserName: reportingMember.name,
          roomId: roomId || undefined,
          reason: reportReason,
          details: reportDetails.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم استلام البلاغ بنجاح.");
        setReportingMember(null);
        setReportDetails("");
      } else {
        showToast(data.error || "تعذر إرسال البلاغ.");
      }
    } catch (err) {
      showToast("حدث خطأ أثناء إرسال البلاغ.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const isHost = Boolean(user?.id && hostUserId && user.id === hostUserId);

  return (
    <div
      className="rounded-3xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl backdrop-blur-xl flex flex-col justify-between"
      style={{
        background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
      }}
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-2xl border border-blue-400/40 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Top Header Row with Status */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-300">معلومات المجلس</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>متزامن ومباشر</span>
          </span>
        </div>

        {/* Topic Title */}
        <div className="mt-3.5">
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {topic}
          </h3>
          <p className="text-xs text-slate-300/80 mt-1 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 text-[10px] font-semibold"
            >
              <Tag className="w-2.5 h-2.5 text-blue-400" />
              <span>{tag}</span>
            </span>
          ))}
        </div>

        {/* Action Buttons: Join/Leave & Share & Schedule */}
        <div className="mt-4 space-y-2">
          {/* Primary Seat Action */}
          {isJoined ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      أنت جالس على الطاولة 🪑
                    </span>
                    <span className="text-[10px] text-emerald-300">
                      جلسة المذاكرة جارية الآن
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatStopwatch(userElapsedSeconds)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLeave}
                className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>مغادرة المجلس (وحفظ وقت المذاكرة)</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onJoin}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>الانضمام إلى المجلس</span>
            </button>
          )}

          {/* Secondary Actions Row: Share Table & Schedule Majlis */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleShareTable}
              className="py-2 px-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-[11px] font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>مشاركة المجلس 🔗</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>برمجة موعد 📅</span>
            </button>
          </div>
        </div>

        {/* Tab Selector: [أعضاء المجلس] / [التفاعل والتشجيع] */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPanelTab("members")}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
              panelTab === "members"
                ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>الأعضاء ({members.length + (isJoined && !members.some(m => m.userId === currentUser?.id) ? 1 : 0)})</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab("chat")}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
              panelTab === "chat"
                ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{MAJLIS_CONFIG.textChatEnabled ? "الدردشة" : "التفاعل السريع ☕"}</span>
          </button>
        </div>

        {/* Sub-Section 1: Real Members List with Privacy Shield & Report */}
        {panelTab === "members" && (
          <div className="mt-3 space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5">
            {isJoined && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0">
                    <Image
                      src={currentUser?.avatar || "/illustrations/characters/ali.jpg"}
                      alt="أنت"
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {formatStudentPrivacyName(currentUser?.name)}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {formatStopwatch(userElapsedSeconds)}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  أنت 🌟
                </span>
              </div>
            )}

            {members.length === 0 && !isJoined ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                لا يوجد طلاب حاضرون حالياً. احجز أول مقعد! 🪑
              </div>
            ) : (
              members
                .filter((mem) => mem.userId !== currentUser?.id)
                .map((mem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden border border-emerald-400/80 shrink-0">
                        <Image
                          src={mem.avatar}
                          alt={mem.name}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {formatStudentPrivacyName(mem.name)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${mem.subjectColor}`}
                      >
                        {mem.subject}
                      </span>

                      {/* Report button */}
                      <button
                        type="button"
                        onClick={() => setReportingMember(mem)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        title="إبلاغ عن محتوى أو سلوك غير لائق"
                      >
                        <ShieldAlert className="w-3 h-3" />
                      </button>

                      {/* Host Kick Option */}
                      {isHost && mem.userId && onKickMember && (
                        <button
                          type="button"
                          onClick={() => onKickMember(mem.userId!)}
                          className="p-1 rounded-lg text-rose-400/70 hover:text-rose-300 transition-colors"
                          title="إخراج عضو من المجلس"
                        >
                          <UserX className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Sub-Section 2: Bounded Live Reactions OR Open Chat if Flagged */}
        {panelTab === "chat" && (
          <div className="mt-3 flex flex-col justify-between h-[230px]">
            {!MAJLIS_CONFIG.textChatEnabled ? (
              /* Safe Bounded Quick Reactions (Coffee, Fire, Clap, Pray) */
              <div className="flex flex-col justify-between h-full py-2">
                <div className="text-center space-y-1 mb-2">
                  <span className="text-xs font-bold text-slate-200 block">
                    تفاعلات التشجيع اللحظية ☕
                  </span>
                  <p className="text-[11px] text-slate-400">
                    انقر لبث تشجيع مباشر يصل لجميع زملائك على الطاولة فوراً
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 my-auto">
                  {MAJLIS_CONFIG.reactions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleQuickReaction(r.emoji, r.message)}
                      className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-400/50 text-right transition-all flex items-center gap-2.5 cursor-pointer group hover:scale-[1.02]"
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform">
                        {r.emoji}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {r.label}
                        </span>
                        <span className="text-[10px] text-slate-400">بث مباشر</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-emerald-400 font-medium">
                    بيئة هادئة ونقية تركز على الإنجاز الأكاديمي 🎯
                  </span>
                </div>
              </div>
            ) : (
              /* Open Chat (Only active when MAJLIS_TEXT_CHAT=true) */
              <>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {messages.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      لا توجد رسائل بعد. ابدأ محادثة زملائك! 👋
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.user_id === user?.id;
                      return (
                        <div
                          key={m.id}
                          className={`p-2 rounded-xl text-xs max-w-[85%] ${
                            isMe
                              ? "mr-auto bg-blue-600/30 border border-blue-500/40 text-blue-100"
                              : "ml-auto bg-white/[0.05] border border-white/10 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-0.5">
                            <span className="font-bold text-amber-300">
                              {formatStudentPrivacyName(m.user_name)}
                            </span>
                            <span className="font-mono text-[9px]">
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="leading-relaxed">{m.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendChat} className="mt-2 flex gap-1.5 pt-2 border-t border-white/[0.06]">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالة للزملاء..."
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !chatInput.trim()}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Safety Report Modal */}
      {reportingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6 border border-rose-500/30 shadow-2xl text-right animate-in zoom-in-95 duration-200"
            style={{
              background: "linear-gradient(180deg, #0B1222 0%, #070B14 100%)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">إبلاغ عن محتوى أو سلوك</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-300">
                الإبلاغ عن العضو: <strong className="text-white">{reportingMember.name}</strong>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  سبب الإبلاغ <span className="text-rose-400">*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white"
                >
                  {MAJLIS_CONFIG.reportReasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  تفاصيل إضافية (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="صف ما حدث لمساعدة فريق الإشراف..."
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  {isSubmittingReport ? "جاري الإرسال..." : "إرسال البلاغ للإدارة"}
                </button>
                <button
                  type="button"
                  onClick={() => setReportingMember(null)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 text-slate-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Majlis Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl text-right animate-in zoom-in-95 duration-200"
            style={{
              background: "linear-gradient(180deg, #0B1222 0%, #070B14 100%)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">برمجة موعد المجلس</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الجلسة</label>
                <input
                  type="text"
                  required
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التوقيت</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المدة (بالدقائق)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setScheduleDuration(dur)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        scheduleDuration === dur
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                          : "bg-white/[0.04] text-slate-300 border-white/10"
                      }`}
                    >
                      {dur} دقيقة
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                >
                  حفظ في المخطط اليومي
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.05] text-slate-300 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
