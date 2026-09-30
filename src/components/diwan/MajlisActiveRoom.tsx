"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  Share2,
  Shield,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  FileEdit,
  Coffee,
  Flame,
  ThumbsUp,
  Brain,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Target,
} from "lucide-react";
import { MajlisRoom, MajlisMember, MajlisService } from "@/lib/campus/majlis-service";
import { StreamId, SubjectId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { PracticeEngine, AnswerDiagnostic } from "@/lib/practice/practice-engine";
import { PracticeQuestion } from "@/types/mission";
import { ExercisePlayer } from "@/components/exercise/ExercisePlayer";
import { formatStopwatch, getSafePeerAvatar } from "./CozyMajlisDesk";

interface MajlisActiveRoomProps {
  room: MajlisRoom;
  members: MajlisMember[];
  currentUser: {
    id?: string;
    name: string;
    avatar: string;
    subject: string;
    stream?: StreamId;
    wilayaCode?: string;
  } | null;
  isUserSeated: boolean;
  userElapsedSeconds: number;
  onJoinSeat: () => void;
  onLeaveSeat: () => void;
  onSendReaction: (toUserId: string, reactionEmoji: string) => void;
  onRequestExtension?: () => void;
  onFinishSession?: (sessionStats: {
    durationSeconds: number;
    plannedMinutes: number;
    subjectTitle: string;
    topicTitle: string;
    exercisesAttempted: number;
    exercisesCorrect: number;
    skillsStrengthened: string[];
    skillsNeedingReview: string[];
    errorTypesEncountered: string[];
  }) => void;
  activeReactionNotification?: {
    fromName: string;
    emoji: string;
    message: string;
  } | null;
}

export function MajlisActiveRoom({
  room,
  members,
  currentUser,
  isUserSeated,
  userElapsedSeconds,
  onJoinSeat,
  onLeaveSeat,
  onSendReaction,
  onRequestExtension,
  onFinishSession,
  activeReactionNotification,
}: MajlisActiveRoomProps) {
  // Focus Mode Toggle (Distraction-free)
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Scratchpad State
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchpadText, setScratchpadText] = useState("");

  // Ambient Audio State
  const [ambientSound, setAmbientSound] = useState<"off" | "rain" | "library" | "cafe">("off");

  // Timer controls
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(() => {
    if (room.timer_end) {
      const diff = Math.max(0, Math.floor((new Date(room.timer_end).getTime() - Date.now()) / 1000));
      return diff > 0 ? diff : (room.duration_minutes || 45) * 60;
    }
    return (room.duration_minutes || 45) * 60;
  });

  // Track Academic Stats for Post-Session Report
  const [exercisesAttempted, setExercisesAttempted] = useState(0);
  const [exercisesCorrect, setExercisesCorrect] = useState(0);
  const [skillsStrengthened, setSkillsStrengthened] = useState<string[]>([]);
  const [skillsNeedingReview, setSkillsNeedingReview] = useState<string[]>([]);
  const [errorTypesEncountered, setErrorTypesEncountered] = useState<string[]>([]);

  // Local Questions Bank for this room's subject and stream
  const roomQuestions = useMemo(() => {
    return PracticeEngine.getQuestions({
      subjectId: room.subject,
      streamId: room.stream,
      limit: 8,
    });
  }, [room.subject, room.stream]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(() => roomQuestions[0] || null);

  useEffect(() => {
    if (roomQuestions.length > 0 && !activeQuestion) {
      setActiveQuestion(roomQuestions[0]);
    }
  }, [roomQuestions, activeQuestion]);

  // Load Scratchpad from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`shater_scratchpad_${room.id}`);
      if (saved) setScratchpadText(saved);
    }
  }, [room.id]);

  const handleScratchpadChange = (text: string) => {
    setScratchpadText(text);
    if (typeof window !== "undefined") {
      localStorage.setItem(`shater_scratchpad_${room.id}`, text);
    }
  };

  // Countdown ticker
  useEffect(() => {
    if (isTimerPaused) return;

    const interval = setInterval(() => {
      setSessionRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerPaused]);

  // Handle Question Submission in Majlis
  const handleExerciseAnswer = (isCorrect: boolean, diagnostic: AnswerDiagnostic) => {
    setExercisesAttempted((prev) => prev + 1);
    const skillName = activeQuestion?.tags?.[0] || activeQuestion?.skillId || "مهارة المادة";

    if (isCorrect) {
      setExercisesCorrect((prev) => prev + 1);
      setSkillsStrengthened((prev) => (prev.includes(skillName) ? prev : [...prev, skillName]));
    } else {
      setSkillsNeedingReview((prev) => (prev.includes(skillName) ? prev : [...prev, skillName]));
      if (diagnostic.errorType) {
        setErrorTypesEncountered((prev) =>
          prev.includes(diagnostic.errorType!) ? prev : [...prev, diagnostic.errorType!]
        );
      }
    }
  };

  const handleNextExercise = () => {
    const nextIdx = (currentQuestionIndex + 1) % roomQuestions.length;
    setCurrentQuestionIndex(nextIdx);
    setActiveQuestion(roomQuestions[nextIdx]);
  };

  const handleReinforceSkill = (retestQuestion: PracticeQuestion) => {
    setActiveQuestion(retestQuestion);
  };

  const handleEndSession = () => {
    if (onFinishSession) {
      onFinishSession({
        durationSeconds: userElapsedSeconds || (room.duration_minutes || 45) * 60 - sessionRemainingSeconds,
        plannedMinutes: room.duration_minutes || 45,
        subjectTitle: room.subject,
        topicTitle: room.lesson || room.title,
        exercisesAttempted,
        exercisesCorrect,
        skillsStrengthened,
        skillsNeedingReview,
        errorTypesEncountered,
      });
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/diwan?tab=majlis&roomId=${room.id}&invite=true`;
      const text = `انضم معي الآن إلى مجلس المذاكرة «${room.title}» في منصة الشاطر لحل تمارين البكالوريا معاً 🏛️:\n${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const streamName = ALGERIAN_BAC_STREAMS[room.stream]?.name_ar || room.stream;

  return (
    <div
      className={`relative transition-all duration-300 ${
        isFocusMode
          ? "fixed inset-0 z-50 bg-[#070D19] p-4 sm:p-8 overflow-y-auto no-scrollbar flex flex-col justify-between"
          : "space-y-6"
      }`}
      dir="rtl"
    >
      {/* Active Reaction Floating Notification */}
      {activeReactionNotification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-2xl border border-blue-400/40 animate-in fade-in slide-in-from-top-4 flex items-center gap-2.5">
          <span className="text-xl">{activeReactionNotification.emoji}</span>
          <span>{activeReactionNotification.fromName}: {activeReactionNotification.message}</span>
        </div>
      )}

      {/* Focus Mode Top Nav Bar */}
      {isFocusMode && (
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-white">
              وضع التركيز الصامت (Zen Mode) — {room.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatStopwatch(sessionRemainingSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsFocusMode(false)}
              className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>مغادرة وضع التركيز</span>
            </button>
          </div>
        </div>
      )}

      {/* Room Main Header Card (Hidden in Focus Mode) */}
      {!isFocusMode && (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0F172A]/90 via-[#0B1528]/90 to-[#0A1220]/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                شعبة {streamName}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>جلسة نشطة الآن</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                المقاعد: {members.length} / {room.capacity || 6}
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-black text-white">
              {room.title}
            </h2>
            <p className="text-xs text-slate-300">
              الموضوع: {room.lesson || room.title} · هدف الجلسة: حل التمارين وتثبيت الأفكار المنهجية
            </p>
          </div>

          {/* Quick HUD Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFocusMode(true)}
              className="py-2 px-3.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>وضع التركيز التام</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2 px-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>دعوة زميل 💬</span>
            </button>

            {isUserSeated ? (
              <button
                type="button"
                onClick={handleEndSession}
                className="py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                إنهاء الجلسة والتقرير 🏆
              </button>
            ) : (
              <button
                type="button"
                onClick={onJoinSeat}
                className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                احجز مقعدك الآن 🪑
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3-ZONE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* =================================================================== */}
        {/* ZONE 1: FOCUS AREA (DOMINATING - 8/12 Desktop Cols)                 */}
        {/* =================================================================== */}
        <div className={`space-y-5 ${isFocusMode ? "lg:col-span-12 max-w-4xl mx-auto w-full" : "lg:col-span-8"}`}>
          {/* Prominent Focus Timer & Goal Bar */}
          <div className="rounded-3xl border border-white/10 bg-[#0B1426]/90 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Digital Countdown Timer */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold shadow-inner">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">
                    الوقت المتبقي في الجلسة
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider flex items-center gap-2">
                    <span>{formatStopwatch(sessionRemainingSeconds)}</span>
                    {sessionRemainingSeconds === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        انتهى الوقت ⏱️
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                  title={isTimerPaused ? "استئناف المؤقت" : "إيقاف مؤقت"}
                >
                  {isTimerPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                </button>

                {onRequestExtension && (
                  <button
                    type="button"
                    onClick={onRequestExtension}
                    className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="طلب تمديد 15 دقيقة إضافية"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+15د تمديد</span>
                  </button>
                )}
              </div>
            </div>

            {/* Current Academic Goal Banner */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-slate-300">
                  الهدف الحالي: <strong className="text-white">{room.lesson || room.title}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {exercisesAttempted} تم حلها ({exercisesCorrect} صحيحة)
              </span>
            </div>
          </div>

          {/* Embedded Real Exercise Player */}
          {activeQuestion ? (
            <ExercisePlayer
              question={activeQuestion}
              totalQuestionsCount={roomQuestions.length}
              currentIndex={currentQuestionIndex}
              onAnswerSubmitted={handleExerciseAnswer}
              onNextQuestion={handleNextExercise}
              onReinforceSkill={handleReinforceSkill}
              onFinishSession={handleEndSession}
              practiceMode="standard_session"
              embeddedInMajlis={true}
            />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0B1222] p-8 text-center space-y-3">
              <Brain className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="text-xs text-slate-300">
                جاري تحضير بنك التمارين الوزارية لمادة {room.subject}...
              </p>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* ZONE 2 & 3: PRESENCE & UTILITIES (4/12 Desktop Cols) - Hidden Zen   */}
        {/* =================================================================== */}
        {!isFocusMode && (
          <div className="lg:col-span-4 space-y-5">
            {/* Zone 2: Lightweight Peer Presence */}
            <div className="rounded-3xl border border-white/10 bg-[#0B1222]/95 backdrop-blur-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    يدرسون معك الآن ({members.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  تشجيع صامت
                </span>
              </div>

              {/* Members List */}
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto no-scrollbar">
                {members.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                    <p>أنت أول الحاضرين في هذا المجلس 🌟</p>
                    <p className="text-[11px] text-slate-600">شارك الرابط مع زملائك للمذاكرة معاً</p>
                  </div>
                ) : (
                  members.map((member) => {
                    const isSelf = member.user_id === currentUser?.id;
                    const avatar = getSafePeerAvatar(member.user_avatar, member.user_id, isSelf);

                    return (
                      <div
                        key={member.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelf
                            ? "bg-blue-600/15 border-blue-500/40"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-white/10 border border-white/10 shrink-0">
                            <Image
                              src={avatar}
                              alt={member.user_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">
                                {member.user_name}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-bold">
                                  أنت
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {member.finished_paper ? "أنهى موضوع المذاكرة ✓" : "في وضع التركيز 🎯"}
                            </span>
                          </div>
                        </div>

                        {/* Silent Cheer Actions (Only for peers) */}
                        {!isSelf && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onSendReaction(member.user_id, "👏")}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                              title="أحسنت!"
                            >
                              👏
                            </button>
                            <button
                              type="button"
                              onClick={() => onSendReaction(member.user_id, "💪")}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                              title="عزيمة وإصرار"
                            >
                              💪
                            </button>
                            <button
                              type="button"
                              onClick={() => onSendReaction(member.user_id, "🔥")}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                              title="واصل!"
                            >
                              🔥
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Zone 3: Session Scratchpad & Personal Study Notes */}
            <div className="rounded-3xl border border-white/10 bg-[#0B1222]/95 backdrop-blur-xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
                  <FileEdit className="w-4 h-4 text-amber-400" />
                  <span>المسودة والملاحظات الشخصية 📝</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">حفظ تلقائي</span>
              </div>

              <textarea
                value={scratchpadText}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                placeholder="اكتب هنا قوانين الدرس، ملاحظاتك السريعة، أو خطوات الحساب الجانبية..."
                rows={4}
                className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/80 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Ambient Audio Bar */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1222]/80 p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                {ambientSound === "off" ? (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
                <span>الصوت المحيطي للتركيز:</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAmbientSound(ambientSound === "rain" ? "off" : "rain")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    ambientSound === "rain"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  🌧️ مطر
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound(ambientSound === "library" ? "off" : "library")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    ambientSound === "library"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  📚 مكتبة
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound("off")}
                  className="px-2 py-1 rounded-lg text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  صامت
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
