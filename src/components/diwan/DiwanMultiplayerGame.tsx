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
} from "lucide-react";
import { DiwanTable, DiwanMember } from "@/types/diwan";
import { DIWAN_MULTIPLAYER_QUESTIONS, getMultiplayerRoundQuestions } from "@/data/diwan/diwan-games";
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
}

export function DiwanMultiplayerGame({
  isOpen,
  onClose,
  table,
  members,
  currentUser,
}: DiwanMultiplayerGameProps) {
  const [phase, setPhase] = useState<"countdown" | "playing" | "round_reveal" | "podium">("countdown");
  const [countdown, setCountdown] = useState(3);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(20);
  const [playerScores, setPlayerScores] = useState<Record<string, { score: number; streak: number }>>({});

  // 4 random questions for this table session
  const [questions, setQuestions] = useState(() => getMultiplayerRoundQuestions(table.subject, 4));

  // Init scores for all members
  useEffect(() => {
    if (isOpen) {
      setPhase("countdown");
      setCountdown(3);
      setCurrentRoundIndex(0);
      setSelectedOption(null);
      setHasAnswered(false);
      setQuestions(getMultiplayerRoundQuestions(table.subject, 4));

      const initialScores: Record<string, { score: number; streak: number }> = {};
      members.forEach((m) => {
        initialScores[m.user_id] = { score: 0, streak: 0 };
      });
      if (currentUser.id && !initialScores[currentUser.id]) {
        initialScores[currentUser.id] = { score: 0, streak: 0 };
      }
      setPlayerScores(initialScores);
    }
  }, [isOpen, table.subject, members, currentUser.id]);

  // Phase 1: Countdown 3... 2... 1...
  useEffect(() => {
    if (!isOpen || phase !== "countdown") return;

    if (countdown > 1) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setPhase("playing");
        setRoundTimeLeft(questions[0]?.timeLimitSeconds || 20);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, phase, countdown, questions]);

  // Phase 2: In-Round Timer (20 seconds)
  useEffect(() => {
    if (!isOpen || phase !== "playing") return;

    const timer = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase("round_reveal");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, phase]);

  if (!isOpen) return null;

  const currentQ = questions[currentRoundIndex] || questions[0];

  // Handle Current User selecting an answer
  const handleSelectOption = (idx: number) => {
    if (hasAnswered || phase !== "playing") return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    const speedBonus = Math.max(10, roundTimeLeft * 5);
    const pointsAwarded = isCorrect ? 100 + speedBonus : 0;

    // Update user score
    setPlayerScores((prev) => {
      const current = prev[currentUser.id] || { score: 0, streak: 0 };
      const newStreak = isCorrect ? current.streak + 1 : 0;
      return {
        ...prev,
        [currentUser.id]: {
          score: current.score + pointsAwarded,
          streak: newStreak,
        },
      };
    });

    // Simulate concurrent peer responses to create realistic multiplayer excitement
    members.forEach((m) => {
      if (m.user_id !== currentUser.id) {
        const peerCorrect = Math.random() > 0.35; // 65% peer accuracy
        const peerPoints = peerCorrect ? Math.floor(80 + Math.random() * 40) : 0;
        setPlayerScores((prev) => {
          const peer = prev[m.user_id] || { score: 0, streak: 0 };
          return {
            ...prev,
            [m.user_id]: {
              score: peer.score + peerPoints,
              streak: peerCorrect ? peer.streak + 1 : 0,
            },
          };
        });
      }
    });

    // Short delay before reveal
    setTimeout(() => {
      setPhase("round_reveal");
    }, 1200);
  };

  // Next round or podium
  const handleNextRound = () => {
    if (currentRoundIndex + 1 < questions.length) {
      setCurrentRoundIndex((r) => r + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setRoundTimeLeft(questions[currentRoundIndex + 1]?.timeLimitSeconds || 20);
      setPhase("playing");
    } else {
      setPhase("podium");
    }
  };

  const handleRematch = () => {
    setQuestions(getMultiplayerRoundQuestions(table.subject, 4));
    setCurrentRoundIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setPhase("countdown");
    setCountdown(3);
  };

  // Rank players for leaderboard
  const rankedPlayers = Object.entries(playerScores)
    .map(([uid, data]) => {
      const member = members.find((m) => m.user_id === uid);
      const isSelf = uid === currentUser.id;
      return {
        userId: uid,
        name: isSelf ? "أنت" : member?.user_name || "زميل",
        avatar: isSelf ? currentUser.avatar : member?.user_avatar || "/illustrations/characters/ali.jpg",
        score: data.score,
        streak: data.streak,
        isSelf,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-3xl border border-amber-500/30 bg-[#0B1222] shadow-2xl overflow-hidden flex flex-col relative"
        dir="rtl"
      >
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-20 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ---------------- PHASE 1: COUNTDOWN ---------------- */}
        {phase === "countdown" && (
          <div className="p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[420px]">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold shadow-xl animate-bounce">
              <Zap className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                تحدي الطاولة: سرعة البديهة والمنهج ⚡
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                4 جولات سريعة · 20 ثانية لكل سؤال · أسرع إجابة صحيحة تكسب نقاطاً مضاعفة!
              </p>
            </div>

            {/* Countdown Big Digit */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-5xl flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-pulse">
              {countdown}
            </div>

            {/* Competitors Avatars */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] text-slate-400 font-bold ml-2">المتحدون:</span>
              <div className="flex -space-x-2 space-x-reverse">
                {members.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#0B1222] bg-white/10"
                    title={m.user_name}
                  >
                    <Image src={m.user_avatar} alt={m.user_name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- PHASE 2 & 3: PLAYING & ROUND REVEAL ---------------- */}
        {(phase === "playing" || phase === "round_reveal") && (
          <div className="p-5 sm:p-7 space-y-5">
            {/* Top Match HUD */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  الجولة {currentRoundIndex + 1} / {questions.length}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {table.topic}
                </span>
              </div>

              {/* Countdown Progress */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-mono font-black text-white">
                  {roundTimeLeft} ثانية
                </span>
              </div>
            </div>

            {/* Mini Live Scoreboard of Table Peers */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {rankedPlayers.map((p) => (
                <div
                  key={p.userId}
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${
                    p.isSelf
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-white/[0.03] text-slate-300 border-white/10"
                  }`}
                >
                  <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                    <Image src={p.avatar} alt={p.name} fill className="object-cover" />
                  </div>
                  <span className="truncate max-w-[70px]">{p.name}</span>
                  <span className="font-mono text-white">{p.score}</span>
                  {p.streak > 1 && <span className="text-amber-400 text-[10px]">🔥{p.streak}</span>}
                </div>
              ))}
            </div>

            {/* Question Statement */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 block">السؤال السريع</span>
              <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                <MathRenderer content={currentQ.prompt_ar} />
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white";

                if (phase === "round_reveal") {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-500/20 border-rose-500 text-rose-200";
                  } else {
                    btnStyle = "bg-white/[0.01] border-white/5 text-slate-500 opacity-50";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-blue-600 border-blue-400 text-white";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered || phase !== "playing"}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
                  >
                    <span className="text-xs sm:text-sm font-medium leading-snug">
                      <MathRenderer content={opt} />
                    </span>

                    {phase === "round_reveal" && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {phase === "round_reveal" && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Round Reveal Explanation & Next Button */}
            {phase === "round_reveal" && (
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2 text-xs text-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white block mb-0.5">التوضيح المنهجي:</strong>
                    {currentQ.explanation_ar}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{currentRoundIndex + 1 < questions.length ? "الجولة الموالية ➡️" : "عرض منصة التتويج 🏆"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- PHASE 4: PODIUM ---------------- */}
        {phase === "podium" && (
          <div className="p-6 sm:p-8 text-center space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-2xl shadow-xl shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">منصة التتويج النهائية 🏆</h3>
              <p className="text-xs text-slate-300">
                أحسنتم جميعاً! منافسة رائعة تثبت جاهزيتكم للبكالوريا
              </p>
            </div>

            {/* Podium Top 3 Cards */}
            <div className="w-full grid grid-cols-3 gap-2.5 pt-2 items-end">
              {/* 2nd Place */}
              {rankedPlayers[1] && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1.5">
                  <span className="text-lg">🥈</span>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20">
                    <Image src={rankedPlayers[1].avatar} alt={rankedPlayers[1].name} fill className="object-cover" />
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[80px]">
                    {rankedPlayers[1].name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {rankedPlayers[1].score} نقطة
                  </span>
                </div>
              )}

              {/* 1st Place (Champion) */}
              {rankedPlayers[0] && (
                <div className="p-4 rounded-2xl bg-gradient-to-t from-amber-500/20 to-amber-500/5 border border-amber-500/50 flex flex-col items-center gap-1.5 -translate-y-2 shadow-lg shadow-amber-500/10">
                  <span className="text-2xl">🥇</span>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                    <Image src={rankedPlayers[0].avatar} alt={rankedPlayers[0].name} fill className="object-cover" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-[100px]">
                    {rankedPlayers[0].name}
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
                    <Image src={rankedPlayers[2].avatar} alt={rankedPlayers[2].name} fill className="object-cover" />
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[80px]">
                    {rankedPlayers[2].name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {rankedPlayers[2].score} نقطة
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRematch}
                className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>مباراة رد الاعتبار ⚡</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                العودة إلى الطاولة 📖
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
