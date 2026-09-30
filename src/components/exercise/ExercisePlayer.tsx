"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  Check,
  X,
  Languages,
} from "lucide-react";
import { PracticeQuestion, SuspectedErrorType } from "@/types/mission";
import {
  PracticeEngine,
  PracticeMode,
  AnswerDiagnostic,
  SkillMasteryState,
} from "@/lib/practice/practice-engine";
import { ExerciseHintLadder } from "./ExerciseHintLadder";
import { ExerciseSolutionView } from "./ExerciseSolutionView";
import { ExerciseReinforcementBar } from "./ExerciseReinforcementBar";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface ExercisePlayerProps {
  question: PracticeQuestion;
  totalQuestionsCount?: number;
  currentIndex?: number;
  onAnswerSubmitted?: (isCorrect: boolean, diagnostic: AnswerDiagnostic) => void;
  onNextQuestion?: () => void;
  onReinforceSkill?: (retestQuestion: PracticeQuestion) => void;
  onFinishSession?: () => void;
  onReviewLesson?: () => void;
  practiceMode?: PracticeMode;
  embeddedInMajlis?: boolean;
  className?: string;
}

export function ExercisePlayer({
  question,
  totalQuestionsCount = 1,
  currentIndex = 0,
  onAnswerSubmitted,
  onNextQuestion,
  onReinforceSkill,
  onFinishSession,
  onReviewLesson,
  practiceMode = "standard_session",
  embeddedInMajlis = false,
  className = "",
}: ExercisePlayerProps) {
  // Local state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [diagnostic, setDiagnostic] = useState<AnswerDiagnostic | null>(null);
  const [showLanguageFr, setShowLanguageFr] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);
  const [hintsUnlockedCount, setHintsUnlockedCount] = useState<number>(0);
  const [masteryState, setMasteryState] = useState<SkillMasteryState | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setDiagnostic(null);
    setShowHints(false);
    setShowFullSolution(false);
    setHintsUnlockedCount(0);
    const existingMastery = PracticeEngine.getSkillMastery(question.skillId);
    setMasteryState(existingMastery);
  }, [question.id, question.skillId]);

  // Prepared hint ladder and structured solution
  const hintLadder = useMemo(() => PracticeEngine.generateHintLadder(question), [question]);
  const structuredSolution = useMemo(() => PracticeEngine.buildStructuredSolution(question), [question]);
  const pairedRetestVariant = useMemo(() => PracticeEngine.getReinforcementQuestion(question), [question]);

  // Handle Answer Verification (Attempt-First)
  const handleVerifyAnswer = () => {
    if (!selectedOptionId) return;

    const diag = PracticeEngine.diagnoseAnswer(question, selectedOptionId);
    setDiagnostic(diag);
    setIsSubmitted(true);

    // Record skill mastery progress
    const updatedMastery = PracticeEngine.recordSkillAttempt({
      skillId: question.skillId,
      subjectId: question.subjectId,
      isCorrect: diag.isCorrect,
      hintsUsed: hintsUnlockedCount,
      isRetest: question.isRetestVariant,
    });
    setMasteryState(updatedMastery);

    if (onAnswerSubmitted) {
      onAnswerSubmitted(diag.isCorrect, diag);
    }

    if (diag.isCorrect) {
      setShowFullSolution(true);
    }
  };

  // Handle "ما فهمتش" - Non-punitive support
  const handleNeedHelp = () => {
    setShowHints(true);
    setHintsUnlockedCount(1);
  };

  // Handle Retry after diagnostic
  const handleRetry = () => {
    setIsSubmitted(false);
    setDiagnostic(null);
    // Keep selectedOptionId or clear it so user can pick freshly
  };

  const difficultyBadges = {
    1: { label: "مستوى أساسي", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    2: { label: "مستوى بكالوريا", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    3: { label: "مستوى تعمق", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  };

  const diffConfig = difficultyBadges[question.difficulty as 1 | 2 | 3] || difficultyBadges[1];

  const optionLetters = ["أ", "ب", "ج", "د", "هـ"];

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#0B1222]/95 backdrop-blur-xl p-5 sm:p-7 shadow-2xl space-y-6 ${className}`}
      dir="rtl"
    >
      {/* 1. Header: Skill, Difficulty, Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">
                {question.tags?.[0] || "تمرين"} ⟵ {question.skillId.replace(/^math_|^phys_|^sci_/, "").replace(/_/g, " ")}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffConfig.color}`}>
                {diffConfig.label}
              </span>
              {question.isRetestVariant && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>تمرين تثبيت مهارة (Retest)</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              السؤال {currentIndex + 1} من {totalQuestionsCount}
            </p>
          </div>
        </div>

        {/* Top Controls: French Toggle & Progress Bar */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {question.prompt_fr && (
            <button
              type="button"
              onClick={() => setShowLanguageFr(!showLanguageFr)}
              className="py-1 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Afficher en français"
            >
              <Languages className="w-3 h-3" />
              <span>{showLanguageFr ? "العربية" : "Français"}</span>
            </button>
          )}

          {/* Mini Progress Bar */}
          <div className="w-24 sm:w-32 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.round(((currentIndex + 1) / totalQuestionsCount) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Question Statement Prompt */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 sm:p-5 space-y-2">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
          نص المسألة
        </span>
        <div className="text-sm sm:text-base font-medium text-white leading-relaxed">
          <MathRenderer content={showLanguageFr && question.prompt_fr ? question.prompt_fr : question.prompt_ar} />
        </div>
      </div>

      {/* 3. Interactive Answer Options Grid (MCQ) */}
      <div className="space-y-3">
        <span className="text-xs text-slate-400 font-bold block">
          اختر الإجابة الصحيحة من الخيارات المقترحة:
        </span>

        <div className="grid grid-cols-1 gap-2.5">
          {question.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrectOption = option.id === question.correctAnswerId;

            // Compute card styling depending on submission state
            let cardStyle = "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-200";

            if (isSubmitted) {
              if (isCorrectOption) {
                cardStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-md shadow-emerald-500/10";
              } else if (isSelected && !isCorrectOption) {
                cardStyle = "bg-rose-500/20 border-rose-500/60 text-rose-200";
              } else {
                cardStyle = "bg-white/[0.01] border-white/5 text-slate-500 opacity-60";
              }
            } else if (isSelected) {
              cardStyle = "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/15";
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => !isSubmitted && setSelectedOptionId(option.id)}
                disabled={isSubmitted}
                className={`w-full p-4 rounded-2xl border text-right transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer disabled:cursor-default ${cardStyle}`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {optionLetters[idx] || idx + 1}
                  </span>

                  <div className="text-xs sm:text-sm font-medium leading-relaxed">
                    <MathRenderer
                      content={showLanguageFr && option.text_fr ? option.text_fr : option.text_ar}
                    />
                  </div>
                </div>

                {/* State Icons */}
                <div className="shrink-0">
                  {isSubmitted && isCorrectOption && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  {isSubmitted && isSelected && !isCorrectOption && (
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Action Controls: Attempt-First Principle ([تحقق] vs [ما فهمتش]) */}
      {!isSubmitted ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleNeedHelp}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>ما فهمتش / أحتاج مساعدة 🤔</span>
          </button>

          <button
            type="button"
            onClick={handleVerifyAnswer}
            disabled={!selectedOptionId}
            className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:scale-100"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تحقق من الإجابة ✓</span>
          </button>
        </div>
      ) : null}

      {/* 5. Diagnostic Feedback Box (Wrong Answer: «مازال ما وصلناش») */}
      {isSubmitted && diagnostic && !diagnostic.isCorrect && (
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-[#180F16] to-[#140D1C] p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-white">
                {diagnostic.friendlyTitle_ar}
              </h4>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {diagnostic.diagnosticExplanation_ar}
              </p>
              <p className="text-xs font-bold text-amber-300 mt-1">
                💡 نصيحة: {diagnostic.actionAdvice_ar}
              </p>
            </div>
          </div>

          {/* Diagnostic Action Options */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-rose-500/20">
            <button
              type="button"
              onClick={handleRetry}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>عدّل إجابتك وحاول مجدداً 🔄</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHints(true)}
              className="py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>شوف التلميح المساعد 💡</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFullSolution(!showFullSolution)}
              className="py-2.5 px-4 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{showFullSolution ? "إخفاء الحل" : "اعرض الحل النموذجي المفصل 📖"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Diagnostic Feedback Box (Correct Answer: «ممتاز») */}
      {isSubmitted && diagnostic && diagnostic.isCorrect && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0B1D19] to-[#0A1A24] p-5 sm:p-6 space-y-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {diagnostic.friendlyTitle_ar}
              </h4>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {diagnostic.diagnosticExplanation_ar}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Progressive Hint Ladder (Unfolded when requested) */}
      {showHints && (
        <ExerciseHintLadder
          hints={hintLadder}
          onHintUnlocked={(level) => setHintsUnlockedCount(level)}
        />
      )}

      {/* 8. Structured Pedagogical Solution View */}
      {showFullSolution && (
        <ExerciseSolutionView solution={structuredSolution} isInitiallyExpanded={true} />
      )}

      {/* 9. Post-Solution Reinforcement Loop («ثبت المهارة») */}
      {isSubmitted && (
        <ExerciseReinforcementBar
          skillTitle={question.skillId.replace(/^math_|^phys_|^sci_/, "").replace(/_/g, " ")}
          hasRetestVariant={!!pairedRetestVariant}
          masteryState={masteryState}
          onSolveRetestVariant={() => {
            if (pairedRetestVariant && onReinforceSkill) {
              onReinforceSkill(pairedRetestVariant);
            }
          }}
          onNextQuestion={() => {
            if (currentIndex + 1 >= totalQuestionsCount) {
              if (onFinishSession) onFinishSession();
            } else {
              if (onNextQuestion) onNextQuestion();
            }
          }}
          onReviewLesson={onReviewLesson}
          isLastQuestion={currentIndex + 1 >= totalQuestionsCount}
        />
      )}
    </div>
  );
}
