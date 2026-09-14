"use client";

import React, { useState } from "react";
import {
  MethodologicalStep,
  StepByStepSolution,
  StepValidationResult,
} from "@/types/interactive-exercise";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Trophy,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

// ============================================================================
// STRING & NUMBER NORMALIZATION HELPERS
// ============================================================================

/**
 * Normalizes Eastern Arabic numerals (٠-٩) and Persian numerals to Western digits (0-9)
 */
export function normalizeDigits(input: string): string {
  const easternArabic = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(easternArabic[i], "g"), String(i));
    result = result.replace(new RegExp(persian[i], "g"), String(i));
  }
  return result;
}

/**
 * Normalizes Arabic text for tolerant matching (Alef variations, Teh Marbuta, etc.)
 */
export function normalizeArabicText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "") // remove harakat (tashkeel)
    .replace(/\s+/g, " ");
}

/**
 * Pure step validator for single methodological step
 */
export function validateStepInput(
  step: MethodologicalStep,
  userValue: string | number
): StepValidationResult {
  const strVal = String(userValue).trim();

  if (!strVal) {
    return {
      isCorrect: false,
      userValue,
      feedback_ar: "يرجى كتابة النتيجة أو الإجابة قبل المتابعة.",
      feedback_fr: "Veuillez saisir votre réponse.",
      hint_ar: step.hint_ar,
    };
  }

  if (step.expectedInputType === "number") {
    // Clean string from currencies, units, spaces
    const rawDigits = normalizeDigits(strVal)
      .replace(/دج|da|dzd|%|cm|m|s/gi, "")
      .replace(/\s/g, "");

    const parsedWithoutCommas = parseFloat(rawDigits.replace(/,/g, ""));
    const parsedWithCommaAsDot = parseFloat(rawDigits.replace(/,/g, "."));

    const expectedNum =
      typeof step.expectedValue === "number"
        ? step.expectedValue
        : parseFloat(String(step.expectedValue));

    const tolerance = step.tolerance ?? 0.01;

    const isMatchWithoutCommas =
      !isNaN(parsedWithoutCommas) && Math.abs(parsedWithoutCommas - expectedNum) <= tolerance;
    const isMatchWithDot =
      !isNaN(parsedWithCommaAsDot) && Math.abs(parsedWithCommaAsDot - expectedNum) <= tolerance;

    const parsedNum = isMatchWithoutCommas
      ? parsedWithoutCommas
      : isMatchWithDot
      ? parsedWithCommaAsDot
      : !isNaN(parsedWithoutCommas)
      ? parsedWithoutCommas
      : parsedWithCommaAsDot;

    if (isNaN(parsedNum)) {
      return {
        isCorrect: false,
        userValue,
        feedback_ar: "يرجى إدخال قيمة عددية صالحة.",
        feedback_fr: "Veuillez entrer une valeur numérique valide.",
        hint_ar: step.hint_ar,
      };
    }

    if (isMatchWithoutCommas || isMatchWithDot) {
      return {
        isCorrect: true,
        userValue: parsedNum,
        feedback_ar: "إجابة صحيحة وحساب دقيق!",
        feedback_fr: "Calcul exact !",
      };
    }

    // Check if user gave percentage without dividing by 100 or vice versa
    if (
      Math.abs(parsedNum / 100 - expectedNum) <= tolerance ||
      Math.abs(parsedNum * 100 - expectedNum) <= tolerance
    ) {
      return {
        isCorrect: false,
        userValue: parsedNum,
        feedback_ar: "تحقق من صيغة النسبة المئوية: هل المطلوب كتابتها كنسبة مئوية (مثلاً 20) أم كعدد عشري (0.20)؟",
        feedback_fr: "Vérifiez le format du pourcentage (ex: 20 ou 0.20).",
        hint_ar: step.hint_ar,
      };
    }

    return {
      isCorrect: false,
      userValue: parsedNum,
      feedback_ar: step.mistakeFeedback_ar || "النتيجة العددية غير مطابقة، تحقق من خطوات الحساب.",
      feedback_fr: step.mistakeFeedback_fr,
      hint_ar: step.hint_ar,
    };
  }

  // Text / formula validation
  const normUser = normalizeArabicText(strVal);
  const normExpected = normalizeArabicText(String(step.expectedValue));

  if (normUser === normExpected || normUser.includes(normExpected)) {
    return {
      isCorrect: true,
      userValue: strVal,
      feedback_ar: "إجابة نموذجية وصحيحة!",
      feedback_fr: "Bonne réponse !",
    };
  }

  return {
    isCorrect: false,
    userValue: strVal,
    feedback_ar: step.mistakeFeedback_ar || "الصياغة غير دقيقة، حاول مراجعة المفاهيم الأساسية.",
    feedback_fr: step.mistakeFeedback_fr,
    hint_ar: step.hint_ar,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export interface InteractiveStepsProps {
  solution: StepByStepSolution;
  isReadOnly?: boolean;
  onValidate?: (allCorrect: boolean, stepResults: StepValidationResult[]) => void;
  locale?: string;
  initialAnswers?: Record<number, string | number>;
}

export function InteractiveSteps({
  solution,
  isReadOnly = false,
  onValidate,
  locale = "ar",
  initialAnswers = {},
}: InteractiveStepsProps) {
  const steps = solution.steps;

  // Track answer per step index (0-based)
  const [answers, setAnswers] = useState<Record<number, string | number>>(initialAnswers);

  // Track validation result per step index
  const [stepResults, setStepResults] = useState<Record<number, StepValidationResult>>({});

  // Collapsible hints state: which step hints are expanded
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});

  // Active step pointer: unlocked sequentially
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  // Check which steps are completed
  const isStepCompleted = (idx: number) => stepResults[idx]?.isCorrect === true;
  const isAllCompleted = steps.every((_, idx) => isStepCompleted(idx));

  const handleInputChange = (idx: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: val }));
    // Clear previous error for this step on change
    if (stepResults[idx] && !stepResults[idx].isCorrect) {
      setStepResults((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }
  };

  const toggleHint = (idx: number) => {
    setExpandedHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleVerifyStep = (idx: number) => {
    const step = steps[idx];
    const userVal = answers[idx] ?? "";
    const res = validateStepInput(step, userVal);

    setStepResults((prev) => {
      const updated = { ...prev, [idx]: res };

      // If correct, advance to next step if there is one
      if (res.isCorrect && idx + 1 < steps.length) {
        setCurrentStepIdx(idx + 1);
      }

      // Check all completion
      if (onValidate) {
        const resultsArray = steps.map((_, i) => updated[i] || { isCorrect: false, userValue: "", feedback_ar: "" });
        const allOk = steps.every((_, i) => updated[i]?.isCorrect === true);
        onValidate(allOk, resultsArray);
      }

      return updated;
    });
  };

  const handleReset = () => {
    setAnswers({});
    setStepResults({});
    setExpandedHints({});
    setCurrentStepIdx(0);
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Progress & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-text">
              مسار الحل المنهجي خطوة بخطوة (Méthode de Résolution)
            </h3>
            <p className="text-xs text-theme-secondary">
              أجب عن كل مرحلة لفتح المرحلة الموالية، مع تدقيق فوري للنتائج الجزئية
            </p>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1.5">
          {steps.map((step, idx) => {
            const completed = isStepCompleted(idx);
            const active = currentStepIdx === idx && !completed;
            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  completed
                    ? "bg-[var(--color-success)] text-white shadow-sm"
                    : active
                    ? "bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)]/30"
                    : "bg-surface-soft text-theme-muted border border-theme"
                }`}
                title={step.title_ar}
              >
                {completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isUnlocked = idx <= currentStepIdx || isStepCompleted(idx);
          const completed = isStepCompleted(idx);
          const result = stepResults[idx];
          const hasError = result && !result.isCorrect;
          const hintOpen = !!expandedHints[idx];

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                completed
                  ? "bg-[var(--color-success-soft)]/20 border-[var(--color-success)]/40 shadow-sm"
                  : isUnlocked
                  ? "bg-card border-theme shadow-card ring-1 ring-theme/10"
                  : "bg-surface-soft/40 border-theme/40 opacity-60 pointer-events-none"
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-theme/50">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      completed
                        ? "bg-[var(--color-success)] text-white"
                        : isUnlocked
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-surface text-theme-muted"
                    }`}
                  >
                    {completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-theme-text flex items-center gap-2">
                      <span>{step.title_ar}</span>
                      {completed && (
                        <Badge variant="success" size="sm" className="text-[10px]">
                          مكتمل ومتحقق منه
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
                      {step.prompt_ar}
                    </p>
                  </div>
                </div>

                {/* Lock / Unlock Icon */}
                <div className="shrink-0 text-theme-muted">
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                  ) : isUnlocked ? (
                    <Unlock className="w-4 h-4 text-[var(--color-primary)]" />
                  ) : (
                    <Lock className="w-4 h-4 text-theme-muted" />
                  )}
                </div>
              </div>

              {/* Card Body: Only interactive when unlocked */}
              {isUnlocked && (
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Input Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        type={step.expectedInputType === "number" ? "text" : "text"}
                        disabled={isReadOnly || completed}
                        value={answers[idx] ?? ""}
                        onChange={(e) => handleInputChange(idx, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !completed) {
                            handleVerifyStep(idx);
                          }
                        }}
                        placeholder={
                          step.expectedInputType === "number"
                            ? "اكتب القيمة العددية هنا..."
                            : "اكتب إجابتك هنا..."
                        }
                        className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border bg-card text-theme-text focus:outline-none transition-all ${
                          completed
                            ? "border-[var(--color-success)] text-[var(--color-success)] bg-surface"
                            : hasError
                            ? "border-[var(--color-error)] ring-1 ring-[var(--color-error)]"
                            : "border-theme focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                        }`}
                      />
                      {step.unit_ar && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-theme-muted">
                          {step.unit_ar}
                        </span>
                      )}
                    </div>

                    {!completed && (
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={() => handleVerifyStep(idx)}
                        className="font-bold text-xs shadow-clay shrink-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>تحقق من المرحلة</span>
                      </Button>
                    )}

                    {/* Hint Trigger */}
                    {!completed && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHint(idx)}
                        className="text-xs text-theme-muted hover:text-theme-text shrink-0"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>{hintOpen ? "إخفاء التلميح" : "طلب تلميح بيداغوجي"}</span>
                        {hintOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Pedagogical Hint Box */}
                  {hintOpen && !completed && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-theme-text space-y-1.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Lightbulb className="w-4 h-4" />
                        <span>توجيه بيداغوجي للمرحلة:</span>
                      </div>
                      <p className="text-xs text-theme-secondary leading-relaxed pr-5">
                        {step.hint_ar}
                      </p>
                      {step.pedagogicalTip_ar && (
                        <p className="text-[11px] text-theme-muted italic pr-5">
                          نصيحة الامتحان: {step.pedagogicalTip_ar}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Feedback on verification */}
                  {result && (
                    <div
                      className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in ${
                        result.isCorrect
                          ? "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30 font-semibold"
                          : "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/30"
                      }`}
                    >
                      {result.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <span className="font-bold">{result.feedback_ar}</span>
                        {!result.isCorrect && result.hint_ar && (
                          <p className="text-[11px] text-theme-muted">
                            💡 تلميح: {result.hint_ar}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Conclusion / Celebration Card */}
      {isAllCompleted && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[var(--color-success-soft)] to-surface border-2 border-[var(--color-success)]/40 shadow-clay space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-success)] text-white flex items-center justify-center shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-theme-text">
                أحسنت! أتممت جميع مراحل الحل المنهجي بنجاح تام
              </h3>
              <p className="text-xs text-[var(--color-success)] font-semibold">
                تم التحقق من جميع الخطوات الحسابية والمنهجية وفق سلم تنقيط البكالوريا
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-theme text-xs leading-relaxed space-y-2 text-theme-text">
            <div className="font-bold text-theme-text flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <span>الخلاصة والنتيجة النهائية:</span>
            </div>
            <p className="text-theme-secondary text-xs leading-relaxed">
              {solution.finalConclusion_ar}
            </p>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs text-theme-muted hover:text-theme-text flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة من جديد</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
