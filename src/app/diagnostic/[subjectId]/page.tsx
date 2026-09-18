"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  Brain,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId, StreamId } from "@/types/education";
import { DiagnosticQuestion, DiagnosticSession } from "@/types/diagnostic";
import { getDiagnosticQuestionsForSubject, createDiagnosticSession, saveDiagnosticResults } from "@/lib/diagnostic";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { ProgressService } from "@/lib/progress/progress-service";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";

export default function SubjectDiagnosticPage() {
  const router = useRouter();
  const params = useParams();
  const rawSubjectId = (params?.subjectId as string) || "math";
  const subjectId = (
    rawSubjectId === "mathematics" ? "math" :
    rawSubjectId === "science" ? "natural_sciences" :
    rawSubjectId
  ) as SubjectId;

  const { t, locale, direction } = useTranslation();
  const { user } = useAuth();
  const isRtl = direction === "rtl";
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const PrevArrow = isRtl ? ArrowRight : ArrowLeft;

  const [hasLoaded, setHasLoaded] = useState(false);
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [streamId, setStreamId] = useState<StreamId>("sciences_exp");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const subjectMeta = ALL_SUBJECTS[subjectId] || {
    id: subjectId,
    name_ar: subjectId,
    name_fr: subjectId,
  };

  useEffect(() => {
    let activeStream: StreamId = "sciences_exp";

    async function initSubjectDiagnostic() {
      const effectiveUserId =
        user?.id ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
          : undefined);

      if (effectiveUserId) {
        try {
          const profile = await StudentService.getProfile(effectiveUserId);
          if (profile?.streamId) {
            activeStream = normalizeStreamIdWithDefault(profile.streamId, activeStream);
          }
        } catch (e) {
          console.error("Error reading student profile for subject diagnostic", e);
        }
      }

      setStreamId(activeStream);

      const subjectPack = getDiagnosticQuestionsForSubject(subjectId, activeStream);
      setQuestions(subjectPack);
      setHasLoaded(true);
    }

    initSubjectDiagnostic();
  }, [user, subjectId]);

  // Timer for active question
  useEffect(() => {
    if (!session || session.status !== "in_progress") return;

    setTimeSpent(0);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, currentIndex]);

  const handleStartSession = () => {
    trackEvent("diagnostic_started" as any, { subjectId, streamId });
    const newSession = createDiagnosticSession(streamId);
    setSession(newSession);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setConfidenceRating(null);
  };

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (!session || !currentQuestion || !selectedOptionId || !confidenceRating) return;

    const effectiveUserId =
      user?.id ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
        : undefined);

    const chosenOpt = currentQuestion.options.find((o) => o.id === selectedOptionId);
    const isCorrect = chosenOpt?.isCorrect ?? false;

    // Track response in session
    session.responses[currentQuestion.id] = {
      questionId: currentQuestion.id,
      subjectId: currentQuestion.subjectId,
      dimension: currentQuestion.dimension,
      selectedOptionId,
      isCorrect,
      confidenceRating,
      timeSpentSeconds: timeSpent,
      speedCategory: timeSpent < 45 ? "fast" : timeSpent > 120 ? "slow" : "normal",
      isMisconceptionTrap: chosenOpt?.isMisconceptionTrap ?? false,
      misconceptionDetails: chosenOpt?.misconceptionDetails,
    };

    // Save individual lesson activity
    if (effectiveUserId) {
      ProgressService.recordLessonActivity({
        userId: effectiveUserId,
        streamId,
        subjectId,
        skillId: currentQuestion.id,
        lessonId: `diag_${subjectId}_${currentQuestion.id}`,
        status: isCorrect ? "mastered" : "in_progress",
        timeSpentDeltaSeconds: timeSpent,
      }).catch(console.error);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setConfidenceRating(null);
    } else {
      // Completed subject assessment
      finishSubjectDiagnostic();
    }
  };

  const finishSubjectDiagnostic = () => {
    if (!session) return;

    const totalQuestions = questions.length;
    const correctCount = Object.values(session.responses).filter((r) => r.isCorrect).length;
    const finalScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 20 * 10) / 10 : 12.0;

    const effectiveUserId =
      user?.id ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
        : undefined);

    if (effectiveUserId) {
      const skillResults = questions.map((q) => {
        const resp = session.responses[q.id];
        return {
          skillId: q.id,
          subjectId: q.subjectId,
          score: resp?.isCorrect ? 5.0 : 2.0,
          isMastered: resp?.isCorrect ?? false,
        };
      });

      ProgressService.saveDiagnosticCompletion({
        userId: effectiveUserId,
        streamId,
        subjectId,
        overallScore: finalScore,
        skillResults,
      }).catch(console.error);
    }

    // Save mock results for results page view
    saveDiagnosticResults({
      streamId,
      totalQuestions,
      correctCount,
      accuracyRate: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 60,
      observedDiagnosticScore: finalScore,
      coreDiagnosticSignal: finalScore,
      estimatedBacScore: finalScore,
      qualitativeSignal: finalScore >= 16 ? "strong" : finalScore >= 12 ? "good" : "in_construction",
      subjectScores: {
        [subjectId]: {
          subjectId,
          coefficient: 6,
          totalQuestions,
          correctCount,
          accuracyRate: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 60,
          scoreOver20: finalScore,
          dimensionBreakdown: {
            knowledge: { total: 1, correct: 1, accuracyRate: 100 },
            understanding: { total: 1, correct: 1, accuracyRate: 100 },
            application: { total: 1, correct: 1, accuracyRate: 100 },
            methodology: { total: 1, correct: 1, accuracyRate: 100 },
            speed: { total: 1, correct: 1, accuracyRate: 100 },
            confidence: { total: 1, correct: 1, accuracyRate: 100 },
          },
          dominantDimensionGap: "methodology",
        },
      } as any,
      dimensionScores: {} as any,
      misconceptionCount: 0,
      misconceptions: [],
      speedProfile: {
        totalTimeSeconds: 300,
        averageTimePerQuestion: 60,
        fastAnswersCount: 2,
        slowAnswersCount: 1,
        rushMistakesCount: 0,
        hesitationCount: 0,
      },
      confidenceCalibration: {
        highConfidenceCorrect: correctCount,
        highConfidenceIncorrect: 0,
        lowConfidenceCorrect: 0,
        lowConfidenceIncorrect: totalQuestions - correctCount,
        calibrationScore: 80,
        blindSpotRisk: "low",
      },
      firstActionableStep: {
        subjectId,
        skillId: `skill_${subjectId}_core`,
        title_ar: `إتقان مهارات ${subjectMeta.name_ar}`,
        title_fr: `Maîtriser ${subjectMeta.name_fr}`,
        recommendedAction_ar: "مراجعة المفاهيم وحل التمارين التفاعلية",
        recommendedAction_fr: "Réviser les concepts et faire des exercices",
      },
      completedAt: new Date().toISOString(),
    } as any);

    router.push(`/diagnostic/results?subjectId=${subjectId}&subject=${subjectId}`);
  };

  if (!hasLoaded) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-medium text-stone-500">جاري تحميل تقييم المادة...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Pre-session Welcome Screen
  if (!session) {
    return (
      <AppShell>
        <Container size="md" className="py-8 sm:py-12 space-y-6">
          <div className="flex items-center gap-2 text-xs text-theme-muted mb-2">
            <Link href="/diagnostic" className="hover:text-[var(--color-primary)] transition-colors">
              {isRtl ? "التقييم التشخيصي" : "Diagnostics"}
            </Link>
            <span>/</span>
            <span className="font-bold text-theme-text">{isRtl ? subjectMeta.name_ar : subjectMeta.name_fr}</span>
          </div>

          <Card className="p-6 sm:p-8 rounded-3xl border border-theme shadow-clay text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shadow-sm">
              <Brain className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="text-xs px-3 py-1 font-mono font-bold">
                {isRtl ? "تقييم مستقل للمادة" : "Diagnostic spécifique"}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text tracking-tight">
                {isRtl ? `تشخيص مستوى ${subjectMeta.name_ar}` : `Diagnostic : ${subjectMeta.name_fr}`}
              </h1>
              <p className="text-sm text-theme-secondary max-w-lg mx-auto">
                {isRtl
                  ? `5 أسئلة ذكية مصممة لكشف ثغراتك المنهجية والمفاهيمية في مادة ${subjectMeta.name_ar} وتحديد مسار الإتقان المباشر.`
                  : `5 questions ciblées pour évaluer votre niveau et identifier vos points de blocage en ${subjectMeta.name_fr}.`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-3 rounded-2xl bg-surface/60 border border-theme text-center">
                <span className="text-lg font-black text-[var(--color-primary)] block">{questions.length}</span>
                <span className="text-[10px] text-theme-muted font-bold">{isRtl ? "أسئلة ذكية" : "Questions"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface/60 border border-theme text-center">
                <span className="text-lg font-black text-amber-500 block">~8</span>
                <span className="text-[10px] text-theme-muted font-bold">{isRtl ? "دقائق" : "Minutes"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface/60 border border-theme text-center">
                <span className="text-lg font-black text-emerald-500 block">20/20</span>
                <span className="text-[10px] text-theme-muted font-bold">{isRtl ? "سلم التنقيط" : "Barème"}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                variant="primary"
                onClick={handleStartSession}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold shadow-clay gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRtl ? "ابدأ تقييم المادة الآن" : "Démarrer le diagnostic"}</span>
              </Button>
              <Link href="/diagnostic" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full rounded-2xl font-bold">
                  <span>{isRtl ? "العودة لقائمة المواد" : "Retour aux matières"}</span>
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </AppShell>
    );
  }

  // Active Assessment Question Screen
  return (
    <AppShell>
      <Container size="md" className="py-6 sm:py-8 space-y-6">
        {/* Header with Progress Bar & Timer */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-bold text-xs bg-surface px-3 py-1 border-theme">
              {isRtl ? subjectMeta.name_ar : subjectMeta.name_fr}
            </Badge>
            <span className="text-xs font-mono font-bold text-theme-muted">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-theme text-xs font-mono font-bold text-theme-secondary">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {currentQuestion && (
          <Card className="p-6 sm:p-8 rounded-3xl border border-theme shadow-clay space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--color-primary)] block">
                {isRtl ? currentQuestion.topic_ar : currentQuestion.topic_fr}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-theme-text leading-relaxed">
                {isRtl ? currentQuestion.prompt_ar : currentQuestion.prompt_fr}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full text-start p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] shadow-sm text-theme-text"
                        : "bg-surface/50 border-theme hover:border-[var(--color-border-hover)] text-theme-secondary hover:text-theme-text"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5 ${
                        isSelected
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-stone-200 dark:bg-stone-700 text-theme-muted"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed font-medium">
                      {isRtl ? opt.text_ar : opt.text_fr}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Confidence Rating */}
            {selectedOptionId && (
              <div className="pt-4 border-t border-theme space-y-2 animate-fade-in">
                <span className="text-xs font-bold text-theme-secondary block">
                  {isRtl ? "ما درجة ثقتك بصحة إجابتك؟" : "Quel est votre degré de certitude ?"}
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {([1, 2, 3, 4, 5] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setConfidenceRating(star)}
                      className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${
                        confidenceRating === star
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-surface border-theme text-theme-muted hover:text-theme-text"
                      }`}
                    >
                      {star} {star === 1 ? "★" : "★"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Button */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <Link href="/diagnostic" className="text-xs text-theme-muted hover:text-theme-text">
                {isRtl ? "إلغاء والعودة" : "Annuler"}
              </Link>

              <Button
                variant="primary"
                disabled={!selectedOptionId || !confidenceRating}
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-bold shadow-md gap-2"
              >
                <span>{currentIndex === questions.length - 1 ? (isRtl ? "إنهاء التشخيص" : "Terminer") : (isRtl ? "السؤال التالي" : "Suivant")}</span>
                <NextArrow className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </AppShell>
  );
}
