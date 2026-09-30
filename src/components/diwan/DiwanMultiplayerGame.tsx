"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Gamepad2,
  Trophy,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  X,
  Flame,
  RotateCcw,
  Award,
  Crown,
  Users,
  Eye,
  Check,
  Brain,
  Timer,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import {
  DiwanTable,
  DiwanMember,
  DiwanGameSession,
  DiwanGamePlayer,
  DiwanGameType,
  DiwanGameStatus,
  DiwanGameQuestion,
} from "@/types/diwan";
import { DiwanService } from "@/lib/diwan/diwan-service";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface DiwanMultiplayerGameProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiwanTable;
  members: DiwanMember[];
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
  initialGameType?: DiwanGameType;
}

export function DiwanMultiplayerGame({
  isOpen,
  onClose,
  table,
  members,
  currentUser,
  initialGameType = "SPEED_RUSH",
}: DiwanMultiplayerGameProps) {
  // Session & Player State
  const [session, setSession] = useState<DiwanGameSession | null>(null);
  const [players, setPlayers] = useState<DiwanGamePlayer[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<DiwanGameType>(initialGameType);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(20);
  const [memoryTimeLeft, setMemoryTimeLeft] = useState(6);
  const [showMemoryPhase, setShowMemoryPhase] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [socialReactions, setSocialReactions] = useState<{ id: string; emoji: string }[]>([]);

  // Sound/Animation helpers
  const triggerReaction = (emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setSocialReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setSocialReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  };

  // Game Type Metadata
  const GAME_TYPE_CONFIG: Record<
    DiwanGameType,
    { title: string; badge: string; icon: string; desc: string; color: string }
  > = {
    SPEED_RUSH: {
      title: "أسرع واحد",
      badge: "أول إجابة صحيحة تكسب",
      icon: "⚡",
      desc: "سؤال واحد سريع؛ أول تلميذ يجاوب إجابة صحيحة يحسم الجولة فوراً!",
      color: "from-amber-500 to-yellow-400 text-slate-950",
    },
    TRUE_FALSE_BLITZ: {
      title: "صح ولا خطأ",
      badge: "خاطفة 10 ثوانٍ",
      icon: "⏱️",
      desc: "عبارات سريعة ومباشرة من المنهاج؛ أجب بـ (صح) أو (خطأ) قبل انتهاء المؤقت!",
      color: "from-blue-600 to-indigo-500 text-white",
    },
    BRAIN_RUSH: {
      title: "Brain Rush",
      badge: "منطق واستنتاج",
      icon: "🧠",
      desc: "أسئلة ذكاء وسرعة بديهة في الوحدات والرسوم البيانية والتحليل الرياضي.",
      color: "from-purple-600 to-pink-500 text-white",
    },
    BAC_SPRINT: {
      title: "BAC Sprint",
      badge: "سباق المنهاج",
      icon: "🏆",
      desc: "أسئلة نموذجية مستوحاة من امتحانات البكالوريا؛ الجميع يتنافس في نفس اللحظة.",
      color: "from-emerald-500 to-teal-400 text-slate-950",
    },
    MEMORY_BATTLE: {
      title: "معركة الذاكرة",
      badge: "احفظ ثم أجب",
      icon: "👁️",
      desc: "تظهر 4 عناصر وقوانين لـ 6 ثوانٍ فقط، ثم تُختبر في تفاصيل ما تذكرته!",
      color: "from-rose-500 to-orange-400 text-white",
    },
    FORMULA_SHOWDOWN: {
      title: "سباق المنهاج",
      badge: "تحدي القوانين",
      icon: "📐",
      desc: "سباق في القوانين والعلاقات.",
      color: "from-blue-500 to-cyan-400 text-white",
    },
    LOGIC_SPRINT: {
      title: "Brain Rush",
      badge: "منطق وسرعة",
      icon: "💡",
      desc: "تحدي المنطق والاستنتاج.",
      color: "from-amber-500 to-orange-400 text-slate-950",
    },
  };

  // Initialize or load active challenge
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function initChallenge() {
      // Check if room already has active session
      const active = await DiwanService.getActiveGame(table.id);
      if (active.session && active.session.status !== "FINISHED" && isMounted) {
        setSession(active.session);
        setPlayers(active.players || []);
        setSelectedGameType(active.session.game_type);
      } else if (isMounted) {
        // Create new session
        const created = await DiwanService.createChallenge({
          roomId: table.id,
          gameType: selectedGameType,
          subject: table.subject,
          topic: table.topic,
          hostUser: currentUser,
          totalRounds: 3,
        });
        setSession(created.session);
        setPlayers(created.players);
      }
    }

    initChallenge();

    return () => {
      isMounted = false;
    };
  }, [isOpen, table.id, table.subject, table.topic, selectedGameType, currentUser]);

  // Sync state transitions & polling
  useEffect(() => {
    if (!isOpen || !session?.id) return;

    const interval = setInterval(async () => {
      const res = await DiwanService.getActiveGame(table.id);
      if (res.session) {
        setSession(res.session);
        if (res.players) setPlayers(res.players);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, session?.id, table.id]);

  // Handle Countdown (STARTING state)
  useEffect(() => {
    if (session?.status !== "STARTING") return;

    setCountdown(3);
    setSelectedOption(null);
    setHasAnswered(false);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          // Transition to PLAYING
          handleStartRound();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.status, session?.current_round]);

  // Handle Memory Battle Preview Phase
  useEffect(() => {
    if (session?.status !== "PLAYING") {
      setShowMemoryPhase(false);
      return;
    }

    if (session.game_type === "MEMORY_BATTLE" && session.active_question?.memoryItems?.length) {
      setShowMemoryPhase(true);
      setMemoryTimeLeft(session.active_question.memoryDurationSeconds || 6);

      const memTimer = setInterval(() => {
        setMemoryTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(memTimer);
            setShowMemoryPhase(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(memTimer);
    } else {
      setShowMemoryPhase(false);
    }
  }, [session?.status, session?.current_round, session?.game_type]);

  // Handle In-Round Timer (PLAYING state)
  useEffect(() => {
    if (session?.status !== "PLAYING" || showMemoryPhase) return;

    const duration = session.round_duration_seconds || 20;
    setRoundTimeLeft(duration);

    const timer = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time expired -> trigger round reveal
          setSession((s) => (s ? { ...s, status: "RESULT" } : null));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.status, session?.current_round, showMemoryPhase]);

  if (!isOpen || !session) return null;

  const currentQ = session.active_question;
  const isHost = session.host_user_id === currentUser.id;
  const isPlayerJoined = players.some((p) => p.user_id === currentUser.id);
  const cfg = GAME_TYPE_CONFIG[session.game_type] || GAME_TYPE_CONFIG.SPEED_RUSH;

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  const handleJoinChallenge = async () => {
    const res = await DiwanService.joinChallenge(session.id, currentUser);
    if (res?.players) {
      setPlayers(res.players);
      setSession(res.session);
      setFeedbackToast("انضممت إلى التحدي بنجاح ⚡");
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  const handleHostStartCountdown = async () => {
    await DiwanService.startCountdown(session.id, currentUser.id);
    setSession((prev) => (prev ? { ...prev, status: "STARTING" } : null));
  };

  const handleStartRound = async () => {
    const res = await DiwanService.startRound(session.id);
    if (res?.session) {
      setSession(res.session);
    }
  };

  const handleSelectAnswer = async (idx: number) => {
    if (hasAnswered || session.status !== "PLAYING" || showMemoryPhase) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const res = await DiwanService.submitAnswer({
      sessionId: session.id,
      userId: currentUser.id,
      roundNumber: session.current_round,
      selectedIndex: idx,
    });

    if (res?.sessionStatus === "RESULT") {
      setSession((prev) => (prev ? { ...prev, status: "RESULT" } : null));
    }
    if (res?.players) {
      setPlayers(res.players);
    }
  };

  const handleNextRound = async () => {
    const res = await DiwanService.nextRound(session.id, currentUser.id);
    if (res?.session) {
      setSession(res.session);
      if (res.players) setPlayers(res.players);
    }
  };

  const handleRematch = async () => {
    const created = await DiwanService.createChallenge({
      roomId: table.id,
      gameType: selectedGameType,
      subject: table.subject,
      topic: table.topic,
      hostUser: currentUser,
      totalRounds: 3,
    });
    setSession(created.session);
    setPlayers(created.players);
  };

  // Rank players for podium / leaderboard
  const rankedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-[32px] border border-amber-500/30 bg-[#0B1222] shadow-2xl overflow-hidden flex flex-col relative text-right"
        dir="rtl"
      >
        {/* Floating social reaction particles */}
        {socialReactions.map((r) => (
          <div
            key={r.id}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl z-50 pointer-events-none animate-in zoom-in slide-out-to-top-12 duration-1000"
          >
            {r.emoji}
          </div>
        ))}

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xl border border-blue-400 animate-in fade-in">
            {feedbackToast}
          </div>
        )}

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-20 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="إغلاق التحدي"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================================================================= */}
        {/* STATE 1: WAITING & READY LOBBY                                    */}
        {/* ================================================================= */}
        {(session.status === "WAITING" || session.status === "READY") && (
          <div className="p-6 sm:p-8 space-y-6 text-center flex flex-col items-center">
            {/* Game Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
              <span>{cfg.icon}</span>
              <span>{cfg.title}</span>
              <span>·</span>
              <span className="font-normal">{cfg.badge}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                تحدي المجلس: {cfg.title} 🎮
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                {cfg.desc}
              </p>
            </div>

            {/* Game Type Picker (if host and game hasn't started) */}
            {isHost && (
              <div className="w-full space-y-2 pt-1 text-right">
                <span className="text-[11px] font-bold text-slate-400 block px-1">
                  اختر نوع التحدي لهذه الجلسة:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["SPEED_RUSH", "TRUE_FALSE_BLITZ", "BRAIN_RUSH", "BAC_SPRINT", "MEMORY_BATTLE"] as DiwanGameType[]).map((gt) => {
                    const c = GAME_TYPE_CONFIG[gt];
                    const isSel = session.game_type === gt;

                    return (
                      <button
                        key={gt}
                        type="button"
                        onClick={async () => {
                          setSelectedGameType(gt);
                          const created = await DiwanService.createChallenge({
                            roomId: table.id,
                            gameType: gt,
                            subject: table.subject,
                            topic: table.topic,
                            hostUser: currentUser,
                            totalRounds: 3,
                          });
                          setSession(created.session);
                        }}
                        className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                          isSel
                            ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-md"
                            : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span>{c.icon}</span>
                          <span className="truncate">{c.title}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                          {c.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Competitors List */}
            <div className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>المتسابقون الجاهزون ({players.length}):</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {players.length >= 2 ? "جاهزون للبدء ✅" : "في انتظار لاعب إضافي..."}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {players.map((p) => {
                  const isSelf = p.user_id === currentUser.id;
                  const isRoomHost = p.user_id === session.host_user_id;

                  return (
                    <div
                      key={p.user_id}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                        isSelf
                          ? "bg-blue-600/30 border-blue-500 text-blue-200"
                          : "bg-white/[0.04] border-white/10 text-slate-300"
                      }`}
                    >
                      <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20">
                        <Image src={p.user_avatar} alt={p.user_name} fill className="object-cover" />
                      </div>
                      <span>{p.user_name}</span>
                      {isRoomHost && <span className="text-[9px] text-amber-400">👑 المضيف</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lobby Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {!isPlayerJoined ? (
                <button
                  type="button"
                  onClick={handleJoinChallenge}
                  className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>ادخل التحدي الآن ⚡</span>
                </button>
              ) : isHost ? (
                <button
                  type="button"
                  onClick={handleHostStartCountdown}
                  className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Gamepad2 className="w-4 h-4 text-slate-950" />
                  <span>جاهزون؟ انطلق! (Start Countdown) 🚀</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-amber-300/80 font-bold animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>أنت مسجل! في انتظار إشارة البدء من المضيف...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STATE 2: COUNTDOWN (3 .. 2 .. 1)                                  */}
        {/* ================================================================= */}
        {session.status === "STARTING" && (
          <div className="p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
            <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
              الجولة {session.current_round} من {session.total_rounds}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              جاهزون؟ ركز جيداً ⚡
            </h3>

            {/* Huge digit */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-6xl flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-pulse">
              {countdown}
            </div>

            <p className="text-xs text-slate-400 font-mono">
              يبدأ السؤال في جميع الشاشات في نفس اللحظة
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* STATE 3: PLAYING (Center Question, Big Timer, Big Choices)        */}
        {/* ================================================================= */}
        {session.status === "PLAYING" && currentQ && (
          <div className="p-5 sm:p-7 space-y-5">
            {/* Header HUD */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 font-mono">
                  الجولة {session.current_round} / {session.total_rounds}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {cfg.title}
                </span>
              </div>

              {/* Big Timer */}
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-4 h-4 ${
                    roundTimeLeft <= 5 ? "text-rose-400 animate-spin" : "text-amber-400"
                  }`}
                />
                <span
                  className={`text-base font-mono font-black ${
                    roundTimeLeft <= 5 ? "text-rose-400 animate-pulse text-lg" : "text-white"
                  }`}
                >
                  {roundTimeLeft} ثانية
                </span>
              </div>
            </div>

            {/* Special Mode 1: MEMORY BATTLE SHOWCASE (6 Seconds) */}
            {showMemoryPhase && currentQ.memoryItems && (
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-rose-950/40 to-slate-900 border-2 border-rose-500/50 space-y-3 text-center animate-in zoom-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-rose-400" />
                    <span>احفظ هذه العناصر الآن! تختفي بعد:</span>
                  </span>
                  <span className="text-lg font-mono font-black text-rose-400 animate-pulse">
                    {memoryTimeLeft}s
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-right">
                  {currentQ.memoryItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs sm:text-sm font-bold text-white leading-relaxed font-mono"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Mode 2: SPEED RUSH CALLOUT */}
            {!showMemoryPhase && session.game_type === "SPEED_RUSH" && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>أسرع إجابة صحيحة تحسم الجولة فوراً للجميع!</span>
              </div>
            )}

            {/* Question Statement (Only visible if not in memory preview) */}
            {!showMemoryPhase && (
              <>
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 block">
                    نص السؤال الوزاري
                  </span>
                  <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    <MathRenderer content={currentQ.prompt_ar} />
                  </div>
                </div>

                {/* Big Thumb-Friendly Options */}
                <div
                  className={`grid gap-2.5 ${
                    currentQ.options.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
                  }`}
                >
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={hasAnswered}
                        className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default min-h-[58px] ${
                          isSelected
                            ? "bg-blue-600 border-blue-400 text-white font-black shadow-lg shadow-blue-500/30 scale-[1.02]"
                            : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-100 hover:border-white/30"
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold leading-snug">
                          <MathRenderer content={opt} />
                        </span>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div className="text-center text-xs text-amber-300 font-bold animate-pulse pt-1">
                    تم تسجيل إجابتك! في انتظار باقي الزملاء أو انتهاء المؤقت... ⏳
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* STATE 4: ROUND RESULT & SYSTEMATIC EXPLANATION                    */}
        {/* ================================================================= */}
        {session.status === "RESULT" && currentQ && (
          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-white">
                نتائج الجولة {session.current_round}
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>الإجابة الصحيحة: {currentQ.options[currentQ.correctIndex]}</span>
              </span>
            </div>

            {/* Callout if SPEED RUSH winner */}
            {session.game_type === "SPEED_RUSH" && session.first_solver_name && (
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-black flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>أسرع واحد حسم الجولة: {session.first_solver_name}! ⚡</span>
              </div>
            )}

            {/* Systematic Explanation */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1.5 text-xs">
              <span className="text-[10px] font-black text-amber-300 block">
                التوضيح المنهجي الوزاري:
              </span>
              <p className="text-slate-200 leading-relaxed">
                {currentQ.explanation_ar}
              </p>
            </div>

            {/* Round Mini Leaderboard */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block px-1">
                الترتيب الحالي للجولة:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rankedPlayers.slice(0, 6).map((p, idx) => (
                  <div
                    key={p.user_id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      p.user_id === currentUser.id
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-200 font-black"
                        : "bg-white/[0.02] border-white/5 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-slate-400 text-[10px]">#{idx + 1}</span>
                      <span className="truncate">{p.user_name}</span>
                    </div>
                    <span className="font-mono font-bold">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Social Cheering Bar */}
            <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold ml-1">تفاعل سريع:</span>
              <div className="flex items-center gap-2">
                {["🔥", "👏", "😂", "💪", "☕"].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => triggerReaction(em)}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-sm flex items-center justify-center transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Round Action */}
            <div className="flex justify-end pt-1">
              {isHost ? (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>
                    {session.current_round < session.total_rounds
                      ? "الجولة الموالية ➡️"
                      : "عرض التتويج النهائي 🏆"}
                  </span>
                </button>
              ) : (
                <span className="text-xs text-slate-400">في انتظار انتقال المضيف للجولة القادمة...</span>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STATE 5: FINISHED & PODIUM                                        */}
        {/* ================================================================= */}
        {session.status === "FINISHED" && (
          <div className="p-6 sm:p-8 text-center space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-2xl shadow-xl shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                منصة التتويج النهائية 🏆
              </h3>
              <p className="text-xs text-slate-300">
                أحسنتم جميعاً! مراجعة تنافسية ممتعة تثبت جاهزيتكم للبكالوريا
              </p>
            </div>

            {/* Podium Top 3 */}
            <div className="w-full grid grid-cols-3 gap-2.5 pt-2 items-end">
              {/* 2nd Place */}
              {rankedPlayers[1] && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1.5">
                  <span className="text-lg">🥈</span>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20">
                    <Image src={rankedPlayers[1].user_avatar} alt={rankedPlayers[1].user_name} fill className="object-cover" />
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[80px]">
                    {rankedPlayers[1].user_name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {rankedPlayers[1].score} نقطة
                  </span>
                </div>
              )}

              {/* 1st Place */}
              {rankedPlayers[0] && (
                <div className="p-4 rounded-2xl bg-gradient-to-t from-amber-500/20 to-amber-500/5 border border-amber-500/50 flex flex-col items-center gap-1.5 -translate-y-2 shadow-lg shadow-amber-500/10">
                  <span className="text-2xl">🥇</span>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                    <Image src={rankedPlayers[0].user_avatar} alt={rankedPlayers[0].user_name} fill className="object-cover" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-[100px]">
                    {rankedPlayers[0].user_name}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {rankedPlayers[0].score} نقطة
                  </span>
                </div>
              )}

              {/* 3rd Place */}
              {rankedPlayers[2] && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1.5">
                  <span className="text-lg">🥉</span>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20">
                    <Image src={rankedPlayers[2].user_avatar} alt={rankedPlayers[2].user_name} fill className="object-cover" />
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[80px]">
                    {rankedPlayers[2].user_name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {rankedPlayers[2].score} نقطة
                  </span>
                </div>
              )}
            </div>

            {/* Exactly 2 Options */}
            <div className="flex items-center gap-3 pt-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRematch}
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>جولة أخرى ⚡</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <span>نرجعو للمراجعة 📖</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
