"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Share2,
  LogOut,
  Maximize2,
  Minimize2,
  Trophy,
  Check,
  X,
  Flame,
  Volume2,
  VolumeX,
  Target,
  FileCheck,
  Brain,
  HelpCircle as QuestionIcon,
} from "lucide-react";
import {
  MajlisTable,
  MajlisSeat,
  MajlisActivityMode,
  TablePhase,
} from "@/types/campus";
import { StreamId } from "@/types/education";
import { CampusService } from "@/lib/campus/campus-service";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface Interactive3DTableProps {
  table: MajlisTable;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  currentUserStream: StreamId;
  onTableUpdate: (updatedTable: MajlisTable) => void;
}

export function Interactive3DTable({
  table,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  currentUserStream,
  onTableUpdate,
}: Interactive3DTableProps) {
  // Current user seat
  const mySeat = useMemo(
    () => table.seats.find((s) => s?.studentId === currentUserId) || null,
    [table.seats, currentUserId]
  );
  const isParticipant = Boolean(mySeat);
  const isMatchingStream = currentUserStream === table.stream;

  // Local timers & UI state
  const [secondsLeft, setSecondsLeft] = useState(table.timeRemainingSeconds);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Digital Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Active recall user inputs
  const [recallAnswer, setRecallAnswer] = useState("");
  const [recallChecked, setRecallChecked] = useState(false);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Synchronous countdown timer effect
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Format seconds to MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Seat claim handler
  const handleClaimSeat = (seatIdx: number) => {
    if (!isMatchingStream) {
      showToast(`عذراً، هذه الطاولة مخصصة لشعبة (${ALGERIAN_BAC_STREAMS[table.stream]?.name_ar})`);
      return;
    }

    const res = CampusService.joinTableSeat(table.id, seatIdx, {
      id: currentUserId,
      name: currentUserName,
      avatar: currentUserAvatar,
      stream: currentUserStream,
    });

    if (res.success && res.table) {
      onTableUpdate(res.table);
      showToast("حجزت مقعدك في المجلس بنجاح! بالتوفيق في الحل 🎯");
    } else {
      showToast(res.reason || "تعذر حجز المقعد");
    }
  };

  // Leave seat handler
  const handleLeaveSeat = () => {
    const updated = CampusService.leaveTableSeat(table.id, currentUserId);
    if (updated) {
      onTableUpdate(updated);
      showToast("غادرت المقعد، يمكنك المتابعة في وضع المشاهدة");
    }
  };

  // Copy table invite link
  const handleShareInvite = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedInvite(true);
      showToast("تم نسخ رابط المجلس للمشاركة مع زملائك 🔗");
      setTimeout(() => setCopiedInvite(false), 3000);
    }
  };

  // ---------------------------------------------------------------------------
  // MODE A: PAPER PRACTICE ACTIONS
  // ---------------------------------------------------------------------------
  const handlePaperFinished = () => {
    const updated = CampusService.updateSeatStatus(
      table.id,
      currentUserId,
      "FINISHED",
      "أنهى الحل ✅"
    );
    if (updated) {
      onTableUpdate(updated);
      showToast("رائع يا بطل! تم تسجيل انتهائك من الحل على الكراس ✍️");

      // Check if all seated participants finished -> auto switch to scoring
      const activeSeats = updated.seats.filter(Boolean);
      const allFinished = activeSeats.every((s) => s?.status === "FINISHED");
      if (allFinished || activeSeats.length === 1) {
        setTimeout(() => {
          const withPhase = CampusService.updateTablePhase(table.id, "REVEAL_SCORING");
          if (withPhase) {
            onTableUpdate(withPhase);
            showToast("تم فتح سلم التنقيط والحل النموذجي لجميع الطلاب! 📋");
          }
        }, 1200);
      }
    }
  };

  const handleSelfAssessment = (assessment: "CORRECT" | "PARTIAL" | "INCORRECT") => {
    const pill =
      assessment === "CORRECT"
        ? "تقييم: صحيح 100% 🌟"
        : assessment === "PARTIAL"
        ? "تقييم: حل جزئي ⚖️"
        : "تقييم: يحتاج إعادة ❌";

    const updated = CampusService.updateSeatStatus(
      table.id,
      currentUserId,
      "FINISHED",
      pill,
      assessment
    );
    if (updated) {
      onTableUpdate(updated);
      showToast(`تم حفظ تقييمك الذاتي: ${pill}`);
    }
  };

  // ---------------------------------------------------------------------------
  // MODE B: DIGITAL QUIZ ACTIONS & ERROR NOTEBOOK INTEGRATION
  // ---------------------------------------------------------------------------
  const quizQuestions = table.activeMaterial.quizQuestions || [];
  const currentQ = quizQuestions[activeQuestionIdx] || null;

  const handleQuizAnswerSubmit = async (chosenIdx: number) => {
    if (quizSubmitted || !currentQ) return;
    setSelectedOption(chosenIdx);
    setQuizSubmitted(true);

    const isCorrect = chosenIdx === currentQ.correctAnswer;

    if (isCorrect) {
      showToast("إجابة صحيحة! أحسنت +10 نقاط 🌟");
      const updated = CampusService.updateSeatStatus(
        table.id,
        currentUserId,
        "FINISHED",
        "أجاب صحيحاً 🌟"
      );
      if (updated) onTableUpdate(updated);
    } else {
      // CRITICAL INTEGRATION: RECORD MISTAKE TO ERROR NOTEBOOK & SCHEDULE IN PLANNER
      try {
        await CampusService.recordMistakeToErrorVault(currentUserId, {
          questionId: currentQ.id,
          questionText: currentQ.question,
          chosenAnswerText: currentQ.options[chosenIdx] || "إجابة خاطئة",
          correctAnswerText: currentQ.options[currentQ.correctAnswer] || "",
          explanation: currentQ.explanation,
          subjectId: table.subjectId,
          topicTitle: table.lesson,
        });

        showToast("⚠️ إجابة غير صحيحة! تم حفظ السؤال تلقائياً في معمل الأخطاء (Error Vault) وجدولته في خطتك اليومية للمراجعة.");
      } catch (e) {
        console.error("Failed to record mistake:", e);
      }

      const updated = CampusService.updateSeatStatus(
        table.id,
        currentUserId,
        "FINISHED",
        "سجل خطأ في معمل الأخطاء 📓"
      );
      if (updated) onTableUpdate(updated);
    }
  };

  const handleNextQuizQuestion = () => {
    if (activeQuestionIdx + 1 < quizQuestions.length) {
      setActiveQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setQuizSubmitted(false);
      CampusService.updateSeatStatus(table.id, currentUserId, "SOLVING", "يحل الآن ✍️");
    } else {
      // Completed all questions
      const withPhase = CampusService.updateTablePhase(table.id, "FINAL_LEADERBOARD");
      if (withPhase) onTableUpdate(withPhase);
    }
  };

  // ---------------------------------------------------------------------------
  // MODE C: GROUP MEMORIZATION ACTIONS
  // ---------------------------------------------------------------------------
  const handleMemorizationDone = () => {
    const updated = CampusService.updateSeatStatus(
      table.id,
      currentUserId,
      "READY",
      "تم الحفظ 🧠"
    );
    if (updated) {
      onTableUpdate(updated);
      showToast("ممتاز! تم تسجيل حفظك للنص، الانتقال لاختبار الاسترجاع النشط...");
      setTimeout(() => {
        const withPhase = CampusService.updateTablePhase(table.id, "ACTIVE_RECALL_TEST");
        if (withPhase) onTableUpdate(withPhase);
      }, 1000);
    }
  };

  // ---------------------------------------------------------------------------
  // 3D CIRCULAR SEAT POSITION CALCULATION
  // Capacity: 2 to 8 equidistant seats
  // ---------------------------------------------------------------------------
  const capacity = table.capacity || 6;
  const seatPositions = useMemo(() => {
    return Array.from({ length: capacity }).map((_, i) => {
      // Angle in radians (starting from 90deg top)
      const angle = (2 * Math.PI * i) / capacity - Math.PI / 2;
      // Elliptical perspective radius: X slightly larger than Y for 3D depth
      const rx = 44; // percent
      const ry = 36; // percent
      const left = 50 + rx * Math.cos(angle);
      const top = 50 + ry * Math.sin(angle);
      return { left: `${left}%`, top: `${top}%`, angleDeg: (360 / capacity) * i };
    });
  }, [capacity]);

  const streamInfo = ALGERIAN_BAC_STREAMS[table.stream];

  return (
    <div
      className={`relative flex flex-col bg-surface border border-theme/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-surface/98" : "w-full max-w-6xl mx-auto my-4"
      }`}
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* 1. TOP CONTROL BAR                                                        */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 border-b border-theme bg-surface-elevated/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Table Title & Stream */}
        <div className="flex items-center gap-3">
          <Link href="/campus/tables">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <ArrowRight className="w-4 h-4" />
              <span>العودة للطاولات</span>
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-black text-theme-text">{table.title}</h1>
              <Badge variant="primary" size="sm" className="font-bold">
                {streamInfo?.name_ar || table.stream}
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className={`text-[11px] font-bold ${
                  table.mode === "PAPER_PRACTICE"
                    ? "border-blue-500/40 text-blue-500"
                    : table.mode === "DIGITAL_QUIZ"
                    ? "border-purple-500/40 text-purple-500"
                    : "border-emerald-500/40 text-emerald-500"
                }`}
              >
                {table.mode === "PAPER_PRACTICE"
                  ? "✍️ حل على الكراس"
                  : table.mode === "DIGITAL_QUIZ"
                  ? "⚡ تحدي مباشر"
                  : "🧠 حلقة حفظ"}
              </Badge>
            </div>
            <p className="text-xs text-theme-muted mt-0.5">
              الدرس: <span className="font-bold text-theme-text">{table.lesson}</span> — {table.durationMinutes} دقيقة
            </p>
          </div>
        </div>

        {/* Right: Timer, Participants, Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Synchronous Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface border border-theme shadow-inner">
            <Clock className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span className="font-mono text-sm sm:text-base font-black text-theme-text">
              {formatTime(secondsLeft)}
            </span>
          </div>

          {/* Occupancy Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-soft border border-theme text-xs font-bold text-theme-secondary">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span>
              {table.seats.filter(Boolean).length}/{capacity} مقاعد
            </span>
          </div>

          {/* Share Invite */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareInvite}
            className="text-xs gap-1 border-theme hover:border-purple-500"
          >
            {copiedInvite ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">مشاركة</span>
          </Button>

          {/* Leave Seat if seated */}
          {isParticipant && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveSeat}
              className="text-xs text-rose-500 hover:bg-rose-500/10 gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مغادرة المقعد</span>
            </Button>
          )}

          {/* Toggle Fullscreen */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl text-theme-muted hover:text-theme-text hover:bg-surface-elevated transition-all"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 3D CIRCULAR TABLE ARENA                                            */}
      {/* ========================================================================= */}
      <div className="relative w-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none bg-gradient-to-b from-surface-soft/40 via-surface to-surface-elevated/90">
        {/* Ambient Grid Lines & 3D Floor Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        {/* 3D Round Table Canvas Container */}
        <div
          className="relative w-full max-w-[760px] aspect-square max-h-[560px] flex items-center justify-center"
          style={{ perspective: "1100px" }}
        >
          {/* Outer Table Shadow Rim */}
          <div
            className="absolute inset-4 sm:inset-8 rounded-full border-2 border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_40px_rgba(168,85,247,0.15)] bg-gradient-to-tr from-slate-900 via-indigo-950/80 to-slate-900 transition-all"
            style={{
              transform: "rotateX(26deg) translateZ(0)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Metallic Gold / Cyan Ring Accents */}
            <div className="absolute inset-2 sm:inset-3 rounded-full border border-purple-400/20" />
            <div className="absolute inset-6 sm:inset-8 rounded-full border border-indigo-400/20" />
          </div>

          {/* ===================================================================== */}
          {/* 3. TABLE CENTER STAGE (قلب الطاولة)                                   */}
          {/* ===================================================================== */}
          <div className="relative z-20 w-[84%] max-w-[480px] min-h-[300px] p-4 sm:p-5 rounded-3xl bg-surface-elevated/95 backdrop-blur-xl border border-purple-500/40 shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Ambient Header Bar */}
            <div className="flex items-center justify-between border-b border-theme/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-theme-text font-sans">
                  {table.mode === "PAPER_PRACTICE"
                    ? "قلب الطاولة: ورقة التمرين الرسمي"
                    : table.mode === "DIGITAL_QUIZ"
                    ? "قلب الطاولة: جولة التحدي السريع"
                    : "قلب الطاولة: لوحة الحفظ والاسترجاع"}
                </span>
              </div>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {table.currentPhase}
              </Badge>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* MODE A: PAPER PRACTICE                                            */}
            {/* ----------------------------------------------------------------- */}
            {table.mode === "PAPER_PRACTICE" && (
              <div className="flex-1 flex flex-col justify-between">
                {table.currentPhase === "READING_SOLVING" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-theme-muted">
                      <span className="font-bold text-theme-secondary">
                        {table.activeMaterial.problemSheet?.source}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-amber-500 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{showHint ? "إخفاء التلميح" : "تلميح وزاري 💡"}</span>
                      </button>
                    </div>

                    <h3 className="text-xs sm:text-sm font-black text-theme-text leading-snug">
                      {table.activeMaterial.problemSheet?.title}
                    </h3>

                    {/* Problem text with KaTeX support */}
                    <div className="p-3 rounded-2xl bg-surface border border-theme text-xs text-theme-text leading-relaxed max-h-48 overflow-y-auto font-sans">
                      <MathRenderer content={table.activeMaterial.problemSheet?.problemText || ""} />
                    </div>

                    {/* Hint Banner if toggled */}
                    {showHint && table.activeMaterial.problemSheet?.hint && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px]"
                      >
                        <strong>💡 تلميح: </strong> {table.activeMaterial.problemSheet.hint}
                      </motion.div>
                    )}

                    {/* Action Button: Finished on Paper */}
                    <div className="pt-2">
                      {mySeat?.status === "FINISHED" ? (
                        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-center text-xs font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>أحسنت! أنهيت الحل على كراسك، بانتظار بقية الزملاء...</span>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handlePaperFinished}
                          disabled={!isParticipant}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold gap-2 text-xs sm:text-sm shadow-lg shadow-blue-500/20"
                        >
                          <Check className="w-4 h-4" />
                          <span>أنهيت الحل على الكراس ✍️</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Phase: Reveal Official Solution & Scoring Rubric */}
                {(table.currentPhase === "REVEAL_SCORING" || table.currentPhase === "WRAP_UP") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-500 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        سلم التنقيط والحل النموذجي الوزاري
                      </span>
                      <Badge variant="success" size="sm">
                        المجموع: {table.activeMaterial.problemSheet?.totalPoints} ن
                      </Badge>
                    </div>

                    {/* Official Solution */}
                    <div className="p-3 rounded-2xl bg-surface border border-theme text-xs leading-relaxed max-h-36 overflow-y-auto">
                      <MathRenderer content={table.activeMaterial.problemSheet?.solutionText || ""} />
                    </div>

                    {/* Rubric Breakdown */}
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {table.activeMaterial.problemSheet?.rubric.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-surface-soft border border-theme/60"
                        >
                          <span className="text-theme-secondary truncate max-w-[280px]">
                            {item.criterion}
                          </span>
                          <span className="font-mono font-bold text-purple-500 shrink-0">
                            +{item.points} ن
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Self-Assessment Buttons */}
                    {isParticipant && (
                      <div className="pt-2 border-t border-theme/60">
                        <p className="text-[11px] font-bold text-theme-muted mb-2 text-center">
                          ما هو تقييمك لحلك مقارنة بالسلم؟
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelfAssessment("CORRECT")}
                            className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/25 text-[11px] font-bold transition-all text-center"
                          >
                            صحيح 100% ✅
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelfAssessment("PARTIAL")}
                            className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 hover:bg-amber-500/25 text-[11px] font-bold transition-all text-center"
                          >
                            حل جزئي ⚖️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelfAssessment("INCORRECT")}
                            className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-500 hover:bg-rose-500/25 text-[11px] font-bold transition-all text-center"
                          >
                            غير مكتمل ❌
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* MODE B: DIGITAL QUIZ CHALLENGE                                    */}
            {/* ----------------------------------------------------------------- */}
            {table.mode === "DIGITAL_QUIZ" && currentQ && (
              <div className="flex-1 flex flex-col justify-between">
                {table.currentPhase === "QUESTION_ACTIVE" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-theme-muted">
                      <span>السؤال {activeQuestionIdx + 1} من {quizQuestions.length}</span>
                      <span className="font-mono font-bold text-purple-500">+{currentQ.points} نقاط</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-surface border border-theme text-xs sm:text-sm font-bold text-theme-text leading-relaxed">
                      <MathRenderer content={currentQ.question} />
                    </div>

                    {/* Multiple Choice Options */}
                    <div className="space-y-1.5">
                      {currentQ.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === currentQ.correctAnswer;
                        let optionStyle = "bg-surface border-theme hover:border-purple-500 text-theme-text";

                        if (quizSubmitted) {
                          if (isCorrect) optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-500 font-bold";
                          else if (isSelected && !isCorrect) optionStyle = "bg-rose-500/20 border-rose-500 text-rose-500 line-through";
                          else optionStyle = "bg-surface/50 opacity-40 border-theme text-theme-muted";
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={quizSubmitted || !isParticipant}
                            onClick={() => handleQuizAnswerSubmit(idx)}
                            className={`w-full p-2.5 rounded-xl border text-xs text-right transition-all flex items-center justify-between gap-2 ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                            {quizSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {quizSubmitted && (
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-600 dark:text-purple-400">
                        <strong>التفسير الوزاري: </strong> {currentQ.explanation}
                      </div>
                    )}

                    {/* Next Question Button */}
                    {quizSubmitted && isParticipant && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNextQuizQuestion}
                        className="w-full text-xs font-bold mt-2"
                      >
                        {activeQuestionIdx + 1 < quizQuestions.length ? "السؤال التالي ➡️" : "عرض النتائج النهائية 🏆"}
                      </Button>
                    )}
                  </div>
                )}

                {/* Leaderboard Phase */}
                {table.currentPhase === "FINAL_LEADERBOARD" && (
                  <div className="space-y-3 text-center">
                    <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
                    <h3 className="text-sm font-black text-theme-text">لوحة متصدري الجلسة 🏆</h3>
                    <div className="space-y-1.5 text-right">
                      {table.seats
                        .filter(Boolean)
                        .sort((a, b) => (b?.quizScore || 0) - (a?.quizScore || 0))
                        .map((seat, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-surface border border-theme flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-500">#{idx + 1}</span>
                              <span>{seat?.avatar}</span>
                              <span className="font-bold text-theme-text">{seat?.studentName}</span>
                            </div>
                            <Badge variant="primary" size="sm">
                              {seat?.quizScore || 20} نقطة
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* MODE C: GROUP MEMORIZATION                                        */}
            {/* ----------------------------------------------------------------- */}
            {table.mode === "GROUP_MEMORIZATION" && (
              <div className="flex-1 flex flex-col justify-between">
                {table.currentPhase === "MEMORIZING" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-theme-muted">
                      <span className="font-bold text-purple-500">حلقة الحفظ الجماعي والتركيز</span>
                      <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
                    </div>

                    <div className="p-3 rounded-2xl bg-surface border border-theme text-xs leading-relaxed max-h-48 overflow-y-auto">
                      <h4 className="font-black text-theme-text mb-2 text-xs">
                        {table.activeMaterial.memorizationContent?.title}
                      </h4>
                      <div className="space-y-2">
                        {table.activeMaterial.memorizationContent?.originalItems.map((item, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-surface-soft border border-theme/60">
                            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                              {item.term}
                            </span>
                            <p className="text-theme-secondary text-[11px]">{item.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isParticipant && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleMemorizationDone}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold gap-2 text-xs sm:text-sm"
                      >
                        <Brain className="w-4 h-4" />
                        <span>تم الحفظ 🧠 (الانتقال للتسميع)</span>
                      </Button>
                    )}
                  </div>
                )}

                {/* Phase: Active Recall Test */}
                {table.currentPhase === "ACTIVE_RECALL_TEST" && (
                  <div className="space-y-3">
                    <Badge variant="warning" size="sm" className="mb-1">
                      اختبار التسميع والاسترجاع النشط ✍️
                    </Badge>
                    {table.activeMaterial.memorizationContent?.recallQuestions.slice(0, 1).map((q, idx) => (
                      <div key={idx} className="space-y-2 text-xs">
                        <p className="font-bold text-theme-text">{q.prompt}</p>
                        <textarea
                          rows={2}
                          value={recallAnswer}
                          onChange={(e) => setRecallAnswer(e.target.value)}
                          placeholder="اكتب إجابتك هنا للتحقق من الكلمات المفتاحية..."
                          className="w-full p-2.5 rounded-xl bg-surface border border-theme text-xs outline-none text-theme-text focus:border-purple-500"
                        />

                        {recallChecked ? (
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-500 space-y-1">
                            <p><strong>الإجابة النموذجية: </strong>{q.expectedAnswer}</p>
                            <p><strong>الكلمات المفتاحية: </strong>{q.keyKeywords.join(" • ")}</p>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setRecallChecked(true)}
                            className="w-full text-xs font-bold"
                          >
                            تحقق من الكلمات المفتاحية الوزارية ✓
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* 4. DYNAMIC EQUIDISTANT SEATS AROUND PERIMETER                         */}
          {/* ===================================================================== */}
          {seatPositions.map((pos, seatIdx) => {
            const seat = table.seats[seatIdx] || null;
            const isMe = seat?.studentId === currentUserId;

            return (
              <div
                key={seatIdx}
                className="absolute z-30 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto"
                style={{ left: pos.left, top: pos.top }}
              >
                {seat ? (
                  // OCCUPIED SEAT
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex flex-col items-center group cursor-pointer transition-all ${
                      isMe ? "scale-105" : ""
                    }`}
                  >
                    {/* Student Avatar with Active Halo */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-xl transition-all ${
                          seat.status === "FINISHED"
                            ? "bg-gradient-to-tr from-emerald-600 to-teal-500 border-2 border-emerald-400 shadow-emerald-500/30"
                            : seat.status === "MEMORIZING"
                            ? "bg-gradient-to-tr from-purple-600 to-pink-500 border-2 border-purple-400 shadow-purple-500/30"
                            : "bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-blue-400 shadow-blue-500/30"
                        }`}
                      >
                        {seat.avatar}
                      </div>

                      {/* Online state pulse */}
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full" />
                    </div>

                    {/* Student Name & Status Pill */}
                    <div className="mt-1.5 flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-black text-theme-text max-w-[85px] truncate">
                          {isMe ? "أنت (مقعدك)" : seat.studentName}
                        </span>
                        {isMe && <Badge variant="primary" size="sm" className="text-[9px] px-1 py-0">أنت</Badge>}
                      </div>

                      {/* Dynamic status pill */}
                      <span
                        className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shadow-sm ${
                          seat.status === "FINISHED"
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-500"
                            : seat.status === "MEMORIZING"
                            ? "bg-purple-500/15 border-purple-500/40 text-purple-500"
                            : "bg-blue-500/15 border-blue-500/40 text-blue-500"
                        }`}
                      >
                        {seat.statusPill}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  // EMPTY SEAT
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleClaimSeat(seatIdx)}
                      disabled={isParticipant || !isMatchingStream}
                      title={
                        !isMatchingStream
                          ? "طاولة مخصصة لشعبة أخرى (وضع المشاهدة)"
                          : isParticipant
                          ? "أنت جالس بالفعل"
                          : "انقر لحجز المقعد"
                      }
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                        isMatchingStream && !isParticipant
                          ? "border-purple-500/60 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:scale-105 shadow-md shadow-purple-500/20 cursor-pointer"
                          : "border-theme/60 bg-surface/50 text-theme-muted cursor-not-allowed opacity-60"
                      }`}
                    >
                      <span className="text-base font-bold">+</span>
                    </button>
                    <span className="text-[10px] text-theme-muted mt-1 font-bold">
                      مقعد {seatIdx + 1}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM SPECTATOR OR PARTICIPANT STATUS BAR                             */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 border-t border-theme bg-surface-elevated/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {isParticipant ? (
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>أنت تشارك في المقعد رقم ({(mySeat?.seatIndex || 0) + 1})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-theme-muted">
              <Users className="w-4 h-4 text-purple-500" />
              <span>
                {isMatchingStream
                  ? "اختر مقعداً فارغاً للانضمام إلى حل التمرين مع زملائك ✍️"
                  : "أنت في وضع المشاهدة والمعاينة (شعبة مختلفة)"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-theme-muted">
          <span>شعبة: <strong className="text-theme-text">{streamInfo?.name_ar}</strong></span>
          <span>•</span>
          <span>سعة الطاولة: <strong className="text-theme-text">{capacity} مقاعد</strong></span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] px-4 py-3 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white shadow-2xl text-xs sm:text-sm font-bold text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
