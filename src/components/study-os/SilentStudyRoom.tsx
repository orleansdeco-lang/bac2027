"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Coffee,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  LogOut,
  Play,
  Pause,
  Compass,
  CheckCircle2,
  Info,
  Shield,
  Wifi,
  WifiOff,
  Share2,
  Copy,
  Check,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSilentStudyRoom } from "@/lib/study-os/useSilentStudyRoom";
import { RoomSeatOccupant, PresenceStatus } from "@/types/study-room";
import { useFocus } from "@/context/FocusContext";
import { useStudyAudio } from "@/context/StudyAudioContext";
import { soundEngine, FocusAmbianceType } from "@/lib/ypt/soundEngine";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS, getStreamSubjects } from "@/lib/constants/streams";
import { SubjectId, StreamId } from "@/types/education";
import { useLearningAccessGate } from "@/lib/hooks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function formatSeconds(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Individual Seat Card Component
 * Computes elapsed focus duration LOCALLY from startedAt.
 * Absolutely zero timer ticks are broadcast over network.
 */
function SeatCard({
  seatIndex,
  occupant,
  encouragedAt,
  onSit,
  onLeave,
  onEncourage,
  onStartFocus,
}: {
  seatIndex: number;
  occupant: RoomSeatOccupant | null;
  encouragedAt?: number;
  onSit: (seatIndex: number) => void;
  onLeave: () => void;
  onEncourage: (seatIndex: number) => void;
  onStartFocus: (subjectId: string, goal?: string) => void;
}) {
  const [localSeconds, setLocalSeconds] = useState<number>(0);
  const [showEncourageToast, setShowEncourageToast] = useState<boolean>(false);

  // Trigger floating coffee animation when encouragement received
  useEffect(() => {
    if (encouragedAt && Date.now() - encouragedAt < 3000) {
      setShowEncourageToast(true);
      const timer = setTimeout(() => setShowEncourageToast(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [encouragedAt]);

  // Compute live seconds locally every 1 second if occupant has startedAt
  useEffect(() => {
    if (!occupant?.startedAt || occupant.status !== "FOCUSING") {
      setLocalSeconds(0);
      return;
    }

    const compute = () => {
      const startMs = new Date(occupant.startedAt!).getTime();
      const diffSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setLocalSeconds(diffSecs);
    };

    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [occupant?.startedAt, occupant?.status]);

  // EMPTY SEAT STATE
  if (!occupant) {
    return (
      <div className="relative group p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-dashed border-theme/60 bg-surface/40 hover:bg-surface/80 hover:border-[var(--color-primary)]/50 transition-all flex flex-col items-center justify-center text-center min-h-[170px] sm:min-h-[190px]">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-card border border-theme flex items-center justify-center text-xl text-theme-muted group-hover:scale-105 group-hover:text-[var(--color-primary)] transition-all mb-2.5">
          🪑
        </div>
        <span className="text-xs font-bold text-theme-muted mb-3 font-sans">
          المقعد #{seatIndex + 1} شاغر
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSit(seatIndex)}
          className="text-xs font-bold px-4 py-1.5 rounded-xl border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm"
        >
          <span>اقعد هنا</span>
        </Button>
      </div>
    );
  }

  const isMe = Boolean(occupant.isCurrentUser);

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between min-h-[180px] sm:min-h-[200px] shadow-sm ${
        isMe
          ? "border-[var(--color-primary)] bg-gradient-to-b from-[var(--color-primary)]/10 via-card to-card ring-2 ring-[var(--color-primary)]/20"
          : "border-theme bg-card hover:border-theme/80"
      }`}
    >
      {/* Floating Coffee Encouragement Animation */}
      <AnimatePresence>
        {showEncourageToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: -25, scale: 1.1 }}
            exit={{ opacity: 0, y: -45, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shadow-lg"
          >
            <span>☕</span>
            <span>+1 تشجيع دافئ!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top row: Avatar + Identity + Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-surface border border-theme flex items-center justify-center text-xl shadow-inner shrink-0">
            {occupant.avatar || "👨‍🎓"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-theme-text font-sans">
                {occupant.displayName}
              </span>
              {isMe && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold">
                  أنت
                </span>
              )}
            </div>
            <span className="text-[10px] text-theme-muted block font-sans">
              {occupant.streamLabel}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div>
          {occupant.status === "FOCUSING" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              يركز
            </span>
          ) : occupant.status === "PAUSED" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              استراحة
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              جالس 🪑
            </span>
          )}
        </div>
      </div>

      {/* Middle row: Subject & Local Live Duration */}
      <div className="my-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: occupant.subjectHex || "#3b82f6" }}
            />
            <span className="font-bold text-theme-text text-xs">
              {occupant.subjectName}
            </span>
          </div>

          {/* Local duration derived from startedAt */}
          {occupant.status === "FOCUSING" && localSeconds > 0 && (
            <span className="text-xs font-black text-emerald-500 font-mono">
              {formatSeconds(localSeconds)}
            </span>
          )}
        </div>

        {/* Optional study goal note */}
        {occupant.goalNote && (
          <div className="p-2 rounded-xl bg-surface/70 border border-theme/60 text-[11px] text-theme-secondary font-sans leading-relaxed line-clamp-2">
            📌 {occupant.goalNote}
          </div>
        )}
      </div>

      {/* Bottom row: Interactive Actions */}
      <div className="pt-2 border-t border-theme/40 flex items-center justify-between gap-2">
        {isMe ? (
          <>
            {occupant.status !== "FOCUSING" ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onStartFocus(occupant.subjectId, occupant.goalNote)}
                className="text-[11px] font-bold py-1 px-3 rounded-xl shadow-clay flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>ابدأ التركيز</span>
              </Button>
            ) : (
              <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>التركيز جارٍ</span>
              </span>
            )}

            <button
              type="button"
              onClick={onLeave}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10"
            >
              <LogOut className="w-3 h-3" />
              <span>مغادرة المقعد</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onEncourage(seatIndex)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all active:scale-95"
            title="أرسل تشجيعاً هادئاً (كوب قهوة)"
          >
            <span>☕</span>
            <span>شجّع</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Main Silent Study Room Component (Phase 4)
 * Body Doubling virtual desk with exactly 6 visible seats.
 */
export function SilentStudyRoom() {
  const gate = useLearningAccessGate({ redirectToAuth: false });
  const { startSession, openFocusMode } = useFocus();

  const {
    seats,
    activeSeatIndex,
    occupiedSeatsCount,
    isConnected,
    encouragements,
    sitAtSeat,
    leaveSeat,
    sendEncouragement,
    startFocusSession,
  } = useSilentStudyRoom();

  const [isSitModalOpen, setIsSitModalOpen] = useState<boolean>(false);
  const [targetSeatIndex, setTargetSeatIndex] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("math");
  const [goalNoteInput, setGoalNoteInput] = useState<string>("");
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);

  const [guestName, setGuestName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shater_guest_student_name") || "";
    }
    return "";
  });
  const [guestStream, setGuestStream] = useState<StreamId>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("shater_guest_student_stream") as StreamId) || "sciences_exp";
    }
    return "sciences_exp";
  });

  // Persistent Global Audio State
  const {
    isPlaying: isAudioPlaying,
    currentSound,
    availableSounds,
    togglePlay: toggleAudioPlay,
    setSound: setAudioSound,
  } = useStudyAudio();

  const rawStream = (gate.profile?.streamId || (gate.profile as any)?.stream || guestStream || "sciences_exp") as StreamId;
  const streamSubjects = getStreamSubjects(rawStream);

  const handleOpenSitModal = (seatIndex: number) => {
    setTargetSeatIndex(seatIndex);
    setSelectedSubjectId(streamSubjects[0]?.subjectId || "math");
    setGoalNoteInput("حل تمارين ونماذج البكالوريا 🎯");
    setIsSitModalOpen(true);
  };

  const handleConfirmSit = async () => {
    if (targetSeatIndex === null) return;
    const effectiveName = gate.profile?.firstName ? undefined : (guestName.trim() || "طالب بكالوريا");
    const effectiveStream = gate.profile?.streamId ? undefined : guestStream;
    const ok = await sitAtSeat(targetSeatIndex, selectedSubjectId, goalNoteInput, effectiveName, effectiveStream);
    if (ok) {
      setIsSitModalOpen(false);
    }
  };

  const handleCopyShareLink = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/table` : "https://shater.dz/table";
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 4000);
  };

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/table` : "https://shater.dz/table";
    const text = `ارواح نقراو مع بعض في طاولة المذاكرة الصامتة لشاطر 🪑 (نقراو بصمت ونشجعو بعض):\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleToggleAmbiance = (type: any) => {
    if (currentSound === type && isAudioPlaying) {
      toggleAudioPlay();
    } else {
      setAudioSound(type);
    }
  };

  const isRoomFull = occupiedSeatsCount >= 6;
  const isUserSeated = activeSeatIndex !== null;

  return (
    <div className="space-y-6 sm:space-y-8 select-none" dir="rtl">
      {/* ================================================================= */}
      {/* 1. ROOM HEADER BANNER                                             */}
      {/* ================================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl border border-theme bg-gradient-to-br from-surface via-surface/90 to-surface/60 shadow-clay relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm" className="font-bold text-xs px-3 py-1">
                طاولة المذاكرة الصامتة • Body Doubling 🪑
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
              >
                {occupiedSeatsCount} / 6 مقاعد مشغولة
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] text-theme-muted font-mono">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <Wifi className="w-3 h-3" /> متصل لحظياً
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400">
                    <WifiOff className="w-3 h-3" /> وضع محلي هادئ
                  </span>
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-theme-text font-sans">
              نقرا مع ناس آخرين، بصمت.
            </h1>

            <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
              فضاء دراسة هادئ لطلاب البكالوريا بنظام المذاكرة المتوازية. اختر مقعدك، ثبّت هدفك الدراسي،
              وادرس جنباً إلى جنب مع زملائك دون أي تشتيت أو تعليقات. التفاعل الوحيد المتاح: إرسال فنجان قهوة تشجيعي ☕.
            </p>

            {/* Share & Invite Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {showCopiedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">تم نسخ الرابط! أرسله لزملائك</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>دعوة زميل إلى طاولتك 🔗</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="مشاركة عبر واتساب"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>مشاركة على WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-surface text-theme-secondary border border-theme text-xs font-bold transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-theme-muted" />
                <span>كيف يدخل زملاؤك؟</span>
                {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Explanatory Guide */}
            {isGuideOpen && (
              <div className="p-4 rounded-2xl bg-card/90 border border-theme space-y-2 text-xs text-theme-secondary animate-in fade-in">
                <div className="font-bold text-theme-text text-sm flex items-center gap-2">
                  <span>💡</span>
                  <span>دليل مشاركة الطاولة مع زملائك:</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] sm:text-xs leading-relaxed">
                  <li><strong>1. كيف يدخل معك الآخرون؟</strong> انقر على زر «دعوة زميل إلى طاولتك» وشاركه عبر واتساب أو تيليغرام. الرابط مباشر ومفتوح لجميع الطلاب بدون أي قيود.</li>
                  <li><strong>2. كيف تظهر لهم؟</strong> عندما يفتح زميلك الرابط، يرى طاولتك ومقعدك ظاهراً باسمك والمادة والعداد الزمني يعمل مباشرة في الوقت الحقيقي.</li>
                  <li><strong>3. كيف تقبل بهم؟</strong> الطاولة مبنية على مبدأ <em>المذاكرة الموازية الصامتة (Body Doubling)</em> بنظام <strong>المقعد المتاح فوراً (6 مقاعد كحد أقصى)</strong>. لا توجد قاعة انتظار ولا حاجة لزر قبول؛ زميلك يضغط «اقعد هنا» ويبدأ الدراسة معك فوراً لتفادي تضييع أي دقيقة.</li>
                  <li><strong>4. التفاعل الصامت:</strong> عندما تريد تشجيع زميلك، انقر على زر ☕ في مقعده لتصل إليه كؤوس قهوة تشجيعية متحركة.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Soundscape Ambiance Controls (Web Audio Procedural via StudyAudioContext) */}
          <div className="p-4 rounded-2xl bg-card border border-theme shadow-sm space-y-3 shrink-0 w-full lg:w-auto lg:min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-bold text-theme-muted border-b border-theme/50 pb-2">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                أصوات التركيز المحيطية
              </span>
              <button
                type="button"
                onClick={toggleAudioPlay}
                aria-label={isAudioPlaying ? "إيقاف الصوت مؤقتاً" : "تشغيل الصوت المحيطي"}
                className="text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded px-1"
              >
                {isAudioPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>إيقاف</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                    <span>تشغيل</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]" role="radiogroup" aria-label="أصوات التركيز">
              {availableSounds.map((snd) => {
                const isActive = currentSound === snd.id && isAudioPlaying;
                return (
                  <button
                    key={snd.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    aria-label={snd.nameAr}
                    onClick={() => handleToggleAmbiance(snd.id)}
                    className={`py-1.5 px-2 rounded-xl font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isActive
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-surface border-theme text-theme-secondary hover:text-theme-text"
                    }`}
                  >
                    <span>{snd.emoji} </span>
                    <span>{snd.nameAr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. CALM EMPTY ROOM BANNER (IF 0 SEATS OCCUPIED)                    */}
      {/* ================================================================= */}
      {occupiedSeatsCount === 0 && (
        <div className="p-6 sm:p-8 rounded-3xl border border-dashed border-amber-500/30 bg-amber-500/5 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-2xl mx-auto shadow-inner">
            🪑
          </div>
          <h3 className="text-base sm:text-lg font-bold text-theme-text font-sans">
            مازال ما قعد حتى واحد.
          </h3>
          <p className="text-xs sm:text-sm text-theme-muted max-w-md mx-auto">
            كن أول من يبدأ جلسة تركيز على الطاولة وافتح الباب لزملائك ليجتمعوا حولك بصمت.
          </p>
          <div className="pt-2">
            <Button
              size="md"
              variant="primary"
              onClick={() => handleOpenSitModal(0)}
              className="font-bold text-xs px-5 shadow-clay"
            >
              <span>ابدأ أول جلسة</span>
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. VIRTUAL STUDY TABLE & SEATS (MAX 6 VISIBLE SEATS)               */}
      {/* ================================================================= */}
      <section className="space-y-6">
        {/* Table representation with 6 surrounding seats */}
        <div className="relative p-5 sm:p-8 rounded-3xl bg-[#0F141F] border border-theme shadow-2xl overflow-hidden">
          {/* Subtle Ambient Wood Texture & Lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-amber-950/20 pointer-events-none" />

          {/* Central Desk Decoration */}
          <div className="hidden lg:flex items-center justify-center mb-8">
            <div className="w-full max-w-xl py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-500/20 shadow-inner flex items-center justify-between text-xs text-amber-200/70">
              <span className="flex items-center gap-2 font-serif">
                <span>📖</span>
                <span>طاولة التركيز الهادئ — بكالوريا 2027</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                {occupiedSeatsCount} / 6 مقاعد
              </span>
            </div>
          </div>

          {/* Responsive Seats Grid: 3x2 on desktop, 2x3 or vertical on mobile (360px+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <SeatCard
                key={index}
                seatIndex={index}
                occupant={seats[index] || null}
                encouragedAt={encouragements[index]}
                onSit={handleOpenSitModal}
                onLeave={leaveSeat}
                onEncourage={sendEncouragement}
                onStartFocus={(subjId, goal) => {
                  startFocusSession(subjId, goal);
                }}
              />
            ))}
          </div>

          {/* Room Full Notification if 6/6 and student is not seated */}
          {isRoomFull && !isUserSeated && (
            <div className="mt-6 p-4 rounded-2xl bg-surface border border-theme text-center text-xs text-theme-muted font-sans space-y-1">
              <span className="font-bold text-theme-text block">
                الطاولة ممتلئة بالكامل حالياً (6/6 مقاعد).
              </span>
              <span>
                يمكنك متابعة الزملاء بصمت كمشاهد، أو بدء جلسة تركيز فردية فوراً عبر محرك التركيز في الشريط العلوي.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. PRIVACY & BODY DOUBLING PRINCIPLES BANNER                      */}
      {/* ================================================================= */}
      <section className="p-4 sm:p-5 rounded-2xl border border-theme bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-theme-muted">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold text-theme-text block">
              خصوصيتك محمية 100% في طاولة المذاكرة
            </span>
            <span>
              لا يتم كشف بريدك، ولا معرفك، ولا درجاتك، ولا ملاحظاتك الشخصية. يظهر اسمك ومادتك فقط.
            </span>
          </div>
        </div>

        <div className="text-[11px] font-sans text-theme-secondary sm:text-left shrink-0">
          مبدأ Body Doubling: وجود زملاء يدرسون بجانبك يعزز التركيز بنسبة تصل إلى 40%.
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. SIT CONFIRMATION MODAL                                         */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isSitModalOpen && targetSeatIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border border-theme shadow-2xl space-y-5 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-theme/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-lg">
                    🪑
                  </span>
                  <h3 className="text-base font-bold text-theme-text font-sans">
                    الجلوس على المقعد #{targetSeatIndex + 1}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSitModalOpen(false)}
                  className="text-theme-muted hover:text-theme-text text-sm p-1"
                >
                  ✕
                </button>
              </div>

              {/* Guest student name and stream inputs if not logged in */}
              {!gate.profile?.firstName && (
                <div className="space-y-3 pb-3 border-b border-theme/60">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-text block">
                      اسمك أو لقبك الدراسي:
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: أمين، سارة، طالب بكالوريا..."
                      maxLength={30}
                      className="w-full bg-surface border border-theme rounded-2xl px-3.5 py-2.5 text-xs text-theme-text font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-text block">
                      شعبتك الدراسية:
                    </label>
                    <select
                      value={guestStream}
                      onChange={(e) => {
                        const newStr = e.target.value as StreamId;
                        setGuestStream(newStr);
                        const subjList = getStreamSubjects(newStr);
                        if (subjList[0]) setSelectedSubjectId(subjList[0].subjectId);
                      }}
                      className="w-full bg-surface border border-theme rounded-2xl px-3.5 py-2.5 text-xs text-theme-text font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="sciences_exp">علوم تجريبية</option>
                      <option value="math">رياضيات</option>
                      <option value="technique_math">تقني رياضي</option>
                      <option value="gestion_eco">تسيير واقتصاد</option>
                      <option value="lettres_philo">آداب وفلسفة</option>
                      <option value="langues_etrangeres">لغات أجنبية</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Subject selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-text block">
                  ما هي المادة التي ستركز عليها؟
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-surface border border-theme rounded-2xl px-3.5 py-2.5 text-xs text-theme-text font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {streamSubjects.map((s) => {
                    const subj = ALL_SUBJECTS[s.subjectId as SubjectId];
                    const nameAr = subj?.name_ar || s.subjectId;
                    return (
                      <option key={s.subjectId} value={s.subjectId}>
                        {nameAr} (معامل {s.coefficient})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Goal note input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-text block">
                  هدفك الدراسي لهذه الجلسة (اختياري):
                </label>
                <input
                  type="text"
                  value={goalNoteInput}
                  onChange={(e) => setGoalNoteInput(e.target.value)}
                  placeholder="مثال: حل مسألة الاحتمالات ونموذج 2024"
                  maxLength={60}
                  className="w-full bg-surface border border-theme rounded-2xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="text-[10px] text-theme-muted block">
                  سيظهر هذا الهدف على بطاقة مقعدك لتحفيز التزامك بالهدف.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSitModalOpen(false)}
                  className="text-xs"
                >
                  <span>إلغاء</span>
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleConfirmSit}
                  className="text-xs font-bold px-5 shadow-clay"
                >
                  <span>تأكيد الجلوس على الطاولة</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
