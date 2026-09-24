"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
  RotateCcw,
  Sparkles,
  Layers,
  Flame,
  AlertTriangle,
  Award,
  ChevronLeft,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { FlashQuestion, RecallAnswerResult, RecallQuestionWithState } from "@/types/recall";
import { trackEvent } from "@/lib/analytics";

function QuickRecallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const targetQuestionId = searchParams.get("questionId");

  const [questions, setQuestions] = useState<RecallQuestionWithState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerResult, setAnswerResult] = useState<RecallAnswerResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sprintFinished, setSprintFinished] = useState(false);
  const [stats, setStats] = useState({
    correct: 0,
    wrong: 0,
    remediated: 0,
  });

  useEffect(() => {
    async function loadSprint() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (user?.id) queryParams.set("userId", user.id);
        if (targetQuestionId) queryParams.set("questionId", targetQuestionId);
        queryParams.set("limit", "4");

        const res = await fetch(`/api/recall/sprint?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          trackEvent("recall_sprint_started", {
            questionCount: data.questions.length,
            targetQuestionId,
          });
        }
      } catch (err) {
        console.error("Failed to load recall sprint:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSprint();
  }, [user, targetQuestionId]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = async (optionIndex: number) => {
    if (selectedOption !== null || isSubmitting || !currentQuestion) return;

    setSelectedOption(optionIndex);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/recall/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionIndex: optionIndex,
          source: "in_app",
          userId: user?.id,
        }),
      });

      const result: RecallAnswerResult = await res.json();
      setAnswerResult(result);

      if (result.is_correct) {
        setStats((prev) => ({
          ...prev,
          correct: prev.correct + 1,
          remediated: result.remediated ? prev.remediated + 1 : prev.remediated,
        }));
      } else {
        setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setAnswerResult(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSprintFinished(true);
      trackEvent("recall_sprint_completed", {
        total: questions.length,
        correct: stats.correct + (answerResult?.is_correct ? 1 : 0),
        wrong: stats.wrong + (!answerResult?.is_correct ? 1 : 0),
      });
    }
  };

  const handleRestartSprint = () => {
    router.replace("/student/arena/quick-recall");
    window.location.reload();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/30 mb-4 animate-bounce">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-theme-text mb-2">جاري تجهيز جولة الاسترجاع السريع...</h2>
          <p className="text-sm text-theme-muted">نبحث عن أسئلة ملائمة لشعبتك وفصلك الدراسي الحالي</p>
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return (
      <AppShell>
        <Container className="max-w-2xl py-12">
          <Card className="p-8 text-center border border-theme bg-surface/80 backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-theme-text mb-2">رائع! لا توجد أسئلة مستحقة الآن 🎉</h2>
            <p className="text-theme-muted mb-6">
              لقد أتممت جميع مراجعاتك المجدولة بنجاح وفق خوارزمية التكرار المتباعد.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/student/error-lab">
                <Button variant="outline" className="gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>تصفح معمل الأخطاء</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="primary" className="gap-2">
                  <span>العودة للوحة التحكم</span>
                  <NextArrow className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </AppShell>
    );
  }

  // Sprint Finished View
  if (sprintFinished) {
    const accuracy = Math.round((stats.correct / questions.length) * 100) || 0;
    return (
      <AppShell>
        <Container className="max-w-2xl py-10">
          <Card className="p-8 border border-theme bg-surface/80 backdrop-blur-md shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[var(--color-primary)] to-amber-500" />

            <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] mx-auto flex items-center justify-center mb-5 shadow-inner">
              <Award className="w-10 h-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text mb-2">
              اكتملت جولة الاسترجاع السريع! ⚡
            </h1>
            <p className="text-sm text-theme-muted mb-8">
              التكرار الدوري المستمر هو المفتاح الذهبي لترسيخ الذاكرة طويلة المدى في البكالوريا.
            </p>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              <div className="bg-surface-elevated/70 p-4 rounded-2xl border border-theme-border/60">
                <div className="text-2xl sm:text-3xl font-black text-[var(--color-primary)] font-mono">
                  {accuracy}%
                </div>
                <div className="text-xs text-theme-muted mt-1">نسبة الدقة</div>
              </div>

              <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {stats.correct}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">إجابات صحيحة</div>
              </div>

              <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {stats.wrong}
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">أخطاء محولة للمعمل</div>
              </div>
            </div>

            {stats.remediated > 0 && (
              <div className="mb-6 p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-300 text-sm flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>عظيم! تم ترميم {stats.remediated} ثغرة بنجاح وإخراجها من معمل الأخطاء 🎯</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={handleRestartSprint} variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>جولة سريعة جديدة</span>
              </Button>
              <Link href="/student/error-lab" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>الانتقال لمعمل الأخطاء</span>
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </AppShell>
    );
  }

  // Active Question Card View
  return (
    <AppShell>
      <Container className="max-w-2xl py-6 sm:py-10">
        {/* Navigation / Progress Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-theme-muted uppercase tracking-wider">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
          </div>

          {/* Stepper bar */}
          <div className="flex-1 max-w-[200px] h-2 bg-theme-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <Link href="/dashboard" className="text-xs text-theme-muted hover:text-theme-text transition-colors">
            إنهاء الجولة
          </Link>
        </div>

        {/* Main Flash Question Card */}
        <Card className="p-6 sm:p-8 border border-theme bg-surface/85 backdrop-blur-md shadow-xl relative overflow-hidden">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="primary" size="sm" className="font-semibold">
              {currentQuestion.subject}
            </Badge>
            <Badge variant="outline" size="sm" className="bg-surface-elevated/70">
              {currentQuestion.question_type}
            </Badge>
            <Badge variant="outline" size="sm" className="text-theme-muted text-[11px]">
              الفصل الدراسي {currentQuestion.term}
            </Badge>
            {currentQuestion.is_in_error_lab && (
              <Badge variant="danger" size="sm" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>ثغرة في معمل الأخطاء</span>
              </Badge>
            )}
            {currentQuestion.box_level !== undefined && currentQuestion.box_level > 0 && (
              <Badge variant="outline" size="sm" className="text-emerald-500 border-emerald-500/30">
                مستوى Leitner: {currentQuestion.box_level}
              </Badge>
            )}
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-text leading-relaxed mb-6">
            {currentQuestion.question_text}
          </h2>

          {/* 4 Choices */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const hasAnswered = selectedOption !== null;
              const isCorrectAnswer = idx === currentQuestion.correct_option_index;

              let btnStyle = "border-theme-border/70 hover:border-[var(--color-primary)]/70 hover:bg-surface-elevated";

              if (hasAnswered) {
                if (isCorrectAnswer) {
                  btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-md shadow-emerald-500/10";
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold shadow-md shadow-rose-500/10";
                } else {
                  btnStyle = "border-theme-border/40 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered || isSubmitting}
                  className={`w-full p-4 rounded-2xl border text-right transition-all duration-200 flex items-center justify-between gap-4 group ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-surface-elevated border border-theme-border/60 text-xs font-mono font-bold flex items-center justify-center text-theme-muted group-hover:border-[var(--color-primary)]">
                      {["أ", "ب", "ج", "د"][idx] || idx + 1}
                    </span>
                    <span className="text-sm sm:text-base font-medium">{opt}</span>
                  </div>

                  {hasAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {hasAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Adaptive Feedback Section */}
          {answerResult && (
            <div
              className={`p-5 rounded-2xl border mb-6 animate-fadeIn ${
                answerResult.is_correct
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2.5 font-bold text-base mb-2">
                {answerResult.is_correct ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>إجابة صحيحة! أحسنت 🎯</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-500" />
                    <span>إجابة غير دقيقة — تم ترحيل السؤال لمعمل الأخطاء</span>
                  </>
                )}
              </div>

              {/* Scientific explanation */}
              <p className="text-sm leading-relaxed mb-4 text-theme-text opacity-95">
                {answerResult.explanation}
              </p>

              {/* Remediation button when student makes a mistake */}
              {!answerResult.is_correct && currentQuestion.target_lesson_url && (
                <div className="pt-3 border-t border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-xs text-rose-600 dark:text-rose-300">
                    عالج الثغرة فوراً لتفادي تكرارها في البكالوريا:
                  </span>
                  <a
                    href={currentQuestion.target_lesson_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-all shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>راجع ثغرة هذا الدرس 📖</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Next Button */}
          {answerResult && (
            <div className="flex justify-end">
              <Button onClick={handleNextQuestion} variant="primary" size="lg" className="gap-2">
                <span>{currentIndex + 1 < questions.length ? "السؤال التالي" : "عرض ملخص الجولة"}</span>
                <NextArrow className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </Container>
    </AppShell>
  );
}

export default function QuickRecallArenaPage() {
  return (
    <React.Suspense
      fallback={
        <AppShell>
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/30 mb-4 animate-bounce">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-theme-text mb-2">جاري تجهيز جولة الاسترجاع السريع...</h2>
            <p className="text-sm text-theme-muted">نبحث عن أسئلة ملائمة لشعبتك وفصلك الدراسي الحالي</p>
          </div>
        </AppShell>
      }
    >
      <QuickRecallContent />
    </React.Suspense>
  );
}
