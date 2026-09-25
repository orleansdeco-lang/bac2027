"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Zap,
  Brain,
  FileText,
  Lock,
  Eye,
  Trophy,
  Share2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MajlisRoom, MajlisMember, MajlisService } from "@/lib/campus/majlis-service";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { StreamId } from "@/types/education";

interface MajlisCenterStageProps {
  room: MajlisRoom;
  members: MajlisMember[];
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    stream: StreamId;
  };
  isSeated: boolean;
  onTakeSeat?: () => void;
  onRefreshRoom?: () => void;
}

export function MajlisCenterStage({
  room,
  members,
  currentUser,
  isSeated,
  onTakeSeat,
  onRefreshRoom,
}: MajlisCenterStageProps) {
  const isStreamMatch = currentUser.stream === room.stream;
  const roomStreamName = ALGERIAN_BAC_STREAMS[room.stream]?.name_ar || room.stream;
  const currentMember = members.find((m) => m.user_id === currentUser.id);

  // Countdown timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (room.timer_end) {
      const diff = Math.max(0, Math.floor((new Date(room.timer_end).getTime() - Date.now()) / 1000));
      return diff > 0 ? diff : 900;
    }
    return 900;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ---------------------------------------------------------------------------
  // MODE A: PAPER_PRACTICE STATE & ACTIONS
  // ---------------------------------------------------------------------------
  const [hasMarkedFinished, setHasMarkedFinished] = useState<boolean>(() => {
    return currentMember?.finished_paper || false;
  });
  const [rubricResult, setRubricResult] = useState<"PERFECT" | "PARTIAL" | "WRONG" | null>(null);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentFeedback, setAssessmentFeedback] = useState<string | null>(null);

  const handleFinishPaper = async () => {
    if (!isSeated) return;
    setHasMarkedFinished(true);
    await MajlisService.markPaperFinished(room.id, currentUser.id);
    if (onRefreshRoom) onRefreshRoom();
  };

  const handleRubricAssessment = async (result: "PERFECT" | "PARTIAL" | "WRONG") => {
    setIsSubmittingAssessment(true);
    setRubricResult(result);
    try {
      await MajlisService.recordRubricAssessment({
        userId: currentUser.id,
        roomId: room.id,
        topicTitle: room.lesson || room.title,
        subjectId: room.subject,
        result,
      });
      if (result === "PERFECT") {
        setAssessmentFeedback("أحسنت! إجابة ممتازة ومطابقة للنموذج الوزاري 🌟");
      } else {
        setAssessmentFeedback("تم إدراج هذا الخطأ في «معمل الأخطاء» ومجدول في خطتك اليومية لضمان تثبيته 🎯");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // ---------------------------------------------------------------------------
  // MODE B: SPEED BATTLE STATE & ACTIONS
  // ---------------------------------------------------------------------------
  const speedQuestions = room.active_material?.questions || [
    {
      id: "q-default",
      question: "ما هو تاريخ انعقاد مؤتمر الصومام التاريخي؟",
      options: ["20 أوت 1956", "1 نوفمبر 1954", "20 أوت 1955", "19 مارس 1962"],
      correctIndex: 0,
      explanation: "انعقد مؤتمر الصومام في 20 أوت 1956 بقرية إيفري أوزلاقن.",
    },
  ];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [qTimer, setQTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnsweredCurrentQ, setHasAnsweredCurrentQ] = useState(false);
  const [battleFeedback, setBattleFeedback] = useState<string | null>(null);

  const activeQuestion = speedQuestions[currentQIndex % speedQuestions.length];

  // 15s per-question timer
  useEffect(() => {
    if (room.mode !== "SPEED_BATTLE") return;
    setQTimer(15);
    setHasAnsweredCurrentQ(false);
    setSelectedOption(null);
    setBattleFeedback(null);

    const interval = setInterval(() => {
      setQTimer((prev) => {
        if (prev <= 1) {
          // Auto advance to next question
          setCurrentQIndex((q) => (q + 1) % speedQuestions.length);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQIndex, room.mode, speedQuestions.length]);

  const handleSelectOption = async (optionIdx: number) => {
    if (!isSeated || hasAnsweredCurrentQ) return;
    setHasAnsweredCurrentQ(true);
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === activeQuestion.correctIndex;
    if (isCorrect) {
      setBattleFeedback("إجابة صحيحة وسريعة! ⚡ (+150 نقطة)");
    } else {
      setBattleFeedback("إجابة غير دقيقة! تم ترحيل الخطأ فوراً إلى «معمل الأخطاء» والـ Daily Planner 🧠");
    }

    await MajlisService.submitSpeedAnswer({
      roomId: room.id,
      userId: currentUser.id,
      questionId: activeQuestion.id,
      questionText: activeQuestion.question,
      chosenOptionText: activeQuestion.options[optionIdx],
      correctOptionText: activeQuestion.options[activeQuestion.correctIndex],
      isCorrect,
      secondsRemaining: qTimer,
      subjectId: room.subject,
      topicTitle: room.lesson || room.title,
      explanation: activeQuestion.explanation,
    });

    if (onRefreshRoom) onRefreshRoom();
  };

  // ---------------------------------------------------------------------------
  // MODE C: GROUP MEMORIZATION & ACTIVE RECALL STATE
  // ---------------------------------------------------------------------------
  const memorizationData = room.active_material || {
    fullText: "استراتيجية المعسكر الغربي الاقتصادية: مشروع مارشال 1947 لتقديم مساعدات لأوروبا، مبدأ ترومان 1947 لمحاصرة المد الشيوعي، ومشروع أيزنهاور 1957 لملء الفراغ في الشرق الأوسط.",
    maskedText: "استراتيجية المعسكر الغربي الاقتصادية: مشروع [_____] 1947 لتقديم مساعدات لأوروبا، مبدأ [_____] 1947 لمحاصرة المد الشيوعي، ومشروع [_____] 1957 لملء الفراغ في الشرق الأوسط.",
    recallQuestions: [
      {
        id: "rec-1",
        question: "ما اسم المشروع الاقتصادي الأمريكي لسنة 1947 الموجه لإعادة بناء أوروبا؟",
        correctAnswer: "مشروع مارشال",
      },
    ],
  };

  const [memorizationStage, setMemorizationStage] = useState<"STUDY" | "RECALL">("STUDY");
  const [recallAnswer, setRecallAnswer] = useState("");
  const [recallFeedback, setRecallFeedback] = useState<string | null>(null);

  const handleVerifyRecall = async () => {
    if (!recallAnswer.trim()) return;
    const currentQ = memorizationData.recallQuestions?.[0];
    const isClose = recallAnswer.includes("مارشال") || recallAnswer.includes("ترومان") || recallAnswer.includes("أيزنهاور");

    if (isClose) {
      setRecallFeedback("استرجاع متقن! تم تثبيت المفهوم في الذاكرة بنجاح 🧠✅");
    } else {
      setRecallFeedback("استرجاع غير كامل! تم تدوين الكلمة في جدول المراجعة اليومي لترميمها.");
      await MajlisService.recordRubricAssessment({
        userId: currentUser.id,
        roomId: room.id,
        topicTitle: room.lesson || room.title,
        subjectId: room.subject,
        result: "PARTIAL",
        notes: `استرجاع الذاكرة: الإجابة المقدمة (${recallAnswer}) مقارنة بالصحيح (${currentQ?.correctAnswer})`,
      });
    }
  };

  // Total finished students count for paper mode
  const finishedStudentsCount = members.filter((m) => m.finished_paper).length;

  return (
    <div className="relative z-30 w-full max-w-xl mx-auto my-auto" dir="rtl">
      {/* 1. STRICT STREAM ACCESS RULE (الشعبة) BANNER */}
      {!isStreamMatch && (
        <div className="mb-3 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 backdrop-blur-md shadow-xl animate-in fade-in duration-300">
          <div className="flex items-start gap-2.5">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>هذا المجلس مخصص لشعبة {roomStreamName}</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-[10px] font-mono">
                  وضع المشاهدة فقط
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                أنت مسجل بشعبة مختلفة ({ALGERIAN_BAC_STREAMS[currentUser.stream]?.name_ar || currentUser.stream}).
                يمكنك المشاهدة والتعلّم دون حجز مقعد، أو مشاركة الرابط مع زميل في هذه الشعبة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Central Stage Box */}
      <div className="rounded-3xl bg-[#0B1222]/95 border border-white/10 shadow-2xl backdrop-blur-xl p-4 sm:p-5 text-white transition-all overflow-hidden relative">
        {/* Top Header Pill Bar: Mode Tag & Shared Sync Countdown */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-white flex items-center gap-1">
              {room.mode === "PAPER_PRACTICE" && (
                <>
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>حل تمرين على الكراس + سلم التنقيط</span>
                </>
              )}
              {room.mode === "SPEED_BATTLE" && (
                <>
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>تحدي سرعة البديهة والتواريخ</span>
                </>
              )}
              {room.mode === "GROUP_MEMORIZATION" && (
                <>
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>حلقة الحفظ والتثبيت بالاسترجاع</span>
                </>
              )}
              {room.mode === "FULL_EXAM" && (
                <>
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>حل موضوع بكالوريا كامل</span>
                </>
              )}
            </span>
          </div>

          {/* Shared Realtime Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* MODE A: PAPER PRACTICE */}
        {/* ------------------------------------------------------------------- */}
        {room.mode === "PAPER_PRACTICE" && (
          <div className="mt-3.5 space-y-3.5">
            {/* Exercise Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-400">
                  {room.active_material?.exercise?.title || `تمرين نموذجي في ${room.lesson}`}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {finishedStudentsCount}/{members.length || 1} أنهوا الحل
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                {room.active_material?.exercise?.text ||
                  "حل التمرين المرفق على كراسك بتركيز، ودون خطوات البرهان كاملة."}
              </p>
              <div className="mt-2 text-[11px] text-slate-400">
                💡 {room.active_material?.exercise?.instructions || "عند الانتهاء اضغط على الزر أدناه لمعاينة سلم التنقيط."}
              </div>
            </div>

            {/* If user is seated & hasn't marked finished yet */}
            {isSeated && !hasMarkedFinished && (
              <button
                type="button"
                onClick={handleFinishPaper}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>أنهيت الحل على الكراس ✍️</span>
              </button>
            )}

            {/* Revealed Official Rubric & Self Assessment once finished */}
            {(hasMarkedFinished || secondsRemaining === 0) && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>سلم التنقيط الوزاري والنموذج الرسمي</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    المجموع: 5 نقاط
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {(room.active_material?.rubric || [
                    { item: "كتابة القانون أو نص الخاصية بالشكل الصحيح", points: 1.0 },
                    { item: "التعويض العددي الدقيق مع احترام الوحدات", points: 1.5 },
                    { item: "التبرير المنهجي والاستنتاج النهائي", points: 1.5 },
                    { item: "نظافة ورقة الإجابة والتنظيم الهندسي للحل", points: 1.0 },
                  ]).map((r: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300 text-[11px] py-1 border-b border-white/[0.04]">
                      <span>• {r.item}</span>
                      <span className="font-mono text-emerald-400 font-bold">+{r.points}ن</span>
                    </div>
                  ))}
                </div>

                {/* Self Assessment Prompt */}
                {isSeated && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <p className="text-xs font-bold text-slate-200 mb-2">
                      كيف كان أداؤك مقارنة بسلم التنقيط الوزاري؟
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRubricAssessment("PERFECT")}
                        disabled={isSubmittingAssessment || rubricResult !== null}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                          rubricResult === "PERFECT"
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                        }`}
                      >
                        صحيح 100% 🌟
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRubricAssessment("PARTIAL")}
                        disabled={isSubmittingAssessment || rubricResult !== null}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                          rubricResult === "PARTIAL"
                            ? "bg-amber-600 text-white border-amber-400"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                        }`}
                      >
                        جزئي (نصفه) ⚠️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRubricAssessment("WRONG")}
                        disabled={isSubmittingAssessment || rubricResult !== null}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                          rubricResult === "WRONG"
                            ? "bg-rose-600 text-white border-rose-400"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                        }`}
                      >
                        خاطئ تماماً ❌
                      </button>
                    </div>
                  </div>
                )}

                {assessmentFeedback && (
                  <div className="p-2.5 rounded-xl bg-white/[0.06] text-center text-xs text-amber-300 font-medium">
                    {assessmentFeedback}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE B: SPEED BATTLE */}
        {/* ------------------------------------------------------------------- */}
        {room.mode === "SPEED_BATTLE" && (
          <div className="mt-3.5 space-y-3.5">
            {/* Speed Question Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>السؤال {currentQIndex + 1} من {speedQuestions.length}</span>
              </span>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <span>{qTimer}ث</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {activeQuestion.question}
              </p>
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeQuestion.options.map((opt: string, idx: number) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === activeQuestion.correctIndex;
                let btnStyle = "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-200";

                if (hasAnsweredCurrentQ) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-600/30 border-rose-500 text-rose-200 line-through";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={!isSeated || hasAnsweredCurrentQ}
                    className={`p-3 rounded-xl text-xs text-right border transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {battleFeedback && (
              <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-center text-xs text-amber-300 font-medium">
                {battleFeedback}
              </div>
            )}

            {/* Live Peer Leaderboard in Table Center */}
            <div className="pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>الترتيب المباشر للمجلس</span>
                </span>
                <span className="text-[10px] text-slate-400">تحديث فوري ⚡</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {members
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((mem, rankIdx) => (
                    <div
                      key={mem.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-[10px] text-amber-400">
                          {rankIdx === 0 ? "🥇" : rankIdx === 1 ? "🥈" : rankIdx === 2 ? "🥉" : `#${rankIdx + 1}`}
                        </span>
                        <span className="truncate text-slate-200 text-[11px]">{mem.user_name}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-[11px] shrink-0">
                        {mem.score}ن
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE C: GROUP MEMORIZATION */}
        {/* ------------------------------------------------------------------- */}
        {room.mode === "GROUP_MEMORIZATION" && (
          <div className="mt-3.5 space-y-3.5">
            {/* Stage Selector Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMemorizationStage("STUDY")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  memorizationStage === "STUDY"
                    ? "bg-purple-600 text-white border-purple-400"
                    : "bg-white/[0.04] text-slate-300 border-white/10"
                }`}
              >
                1. بطاقة الحفظ والتكرار 📖
              </button>
              <button
                type="button"
                onClick={() => setMemorizationStage("RECALL")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  memorizationStage === "RECALL"
                    ? "bg-purple-600 text-white border-purple-400"
                    : "bg-white/[0.04] text-slate-300 border-white/10"
                }`}
              >
                2. الحجب والاسترجاع النشط 🧠
              </button>
            </div>

            {/* Stage 1: Reading Text */}
            {memorizationStage === "STUDY" && (
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <span className="text-xs font-bold text-purple-300 block">
                  عناصر الدرس المقررة للحفظ السريع:
                </span>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                  {memorizationData.fullText}
                </p>
                <button
                  type="button"
                  onClick={() => setMemorizationStage("RECALL")}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                >
                  حفظت النص، ابدأ الحجب والاسترجاع 🎯
                </button>
              </div>
            )}

            {/* Stage 2: Masked Active Recall */}
            {memorizationStage === "RECALL" && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <span className="text-xs font-bold text-amber-400 block">
                  النص المحجوب — املأ الفراغ بالاسترجاع:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                  {memorizationData.maskedText}
                </p>

                <div className="pt-2 border-t border-white/[0.08] space-y-2">
                  <label className="block text-[11px] text-slate-300 font-bold">
                    ما هو المصطلح أو التاريخ المحجوب؟
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={recallAnswer}
                      onChange={(e) => setRecallAnswer(e.target.value)}
                      placeholder="اكتب الكلمة المفتاحية المسترجعة..."
                      className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyRecall}
                      className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                    >
                      تأكيد
                    </button>
                  </div>
                </div>

                {recallFeedback && (
                  <div className="p-2.5 rounded-xl bg-white/[0.05] text-center text-xs text-amber-300 font-medium">
                    {recallFeedback}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE D: FULL EXAM */}
        {/* ------------------------------------------------------------------- */}
        {room.mode === "FULL_EXAM" && (
          <div className="mt-3.5 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2">
              <span className="text-xs font-bold text-emerald-400 block">
                موضوع بكالوريا كامل — محاكاة رسمية
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                حل متكامل للموضوع بشقيه الأول والثاني مع احترام المدة الزمنية الكاملة والتحضير النفسي للامتحان.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-white/[0.04] text-xs">
                  <span className="font-bold text-white block">الجزء الأول</span>
                  <span className="text-[10px] text-slate-400">10 نقاط — دراسة الدوال</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] text-xs">
                  <span className="font-bold text-white block">الجزء الثاني</span>
                  <span className="text-[10px] text-slate-400">10 نقاط — المتتاليات</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seated status pill for non-seated stream matches */}
        {!isSeated && isStreamMatch && (
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-slate-300">أنت في وضع المشاهدة حالياً</span>
            {onTakeSeat && (
              <button
                type="button"
                onClick={onTakeSeat}
                className="py-1.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                احجز مقعدك على الطاولة 🪑
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
