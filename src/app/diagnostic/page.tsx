"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";
import {
  DiagnosticQuestion,
  DiagnosticSession,
  DiagnosticDimension,
} from "@/types/diagnostic";
import { StreamId, TechniqueMathSpecialty, SubjectId } from "@/types/education";
import { ALL_SUBJECTS, getStreamSubjects } from "@/lib/constants/streams";
import {
  getDiagnosticQuestionsForStream,
  createDiagnosticSession,
  loadDiagnosticSession,
  saveDiagnosticSession,
  recordQuestionResponse,
  completeDiagnosticSession,
  saveDiagnosticResults,
  clearDiagnosticSession,
} from "@/lib/diagnostic";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { ProgressService } from "@/lib/progress/progress-service";

export default function DiagnosticPage() {
  const router = useRouter();
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
  const [specialty, setSpecialty] = useState<TechniqueMathSpecialty | undefined>(undefined);
  const [selfEstimateScore, setSelfEstimateScore] = useState<number>(12.0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load profile and existing session, guarding against redundant diagnostic loop
  useEffect(() => {
    let activeStream: StreamId = "sciences_exp";
    let activeSpecialty: TechniqueMathSpecialty | undefined = undefined;
    let estimate = 12.0;

    async function initDiagnostic() {
      const effectiveUserId =
        user?.id ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
          : undefined);

      if (effectiveUserId) {
        try {
          const profile = await StudentService.getProfile(effectiveUserId);
          if (profile) {
            if (profile.streamId) activeStream = normalizeStreamIdWithDefault(profile.streamId, activeStream);
            if (profile.techniqueMathSpecialty) activeSpecialty = profile.techniqueMathSpecialty;
            if (profile.targetScore) estimate = Math.max(8, profile.targetScore - 4);
          }
        } catch (e) {
          console.error("Error reading profile for diagnostic", e);
        }
      }

      setStreamId(activeStream);
      setSpecialty(activeSpecialty);
      setSelfEstimateScore(estimate);

      const pack = getDiagnosticQuestionsForStream(activeStream);
      setQuestions(pack);

      const existingSession = loadDiagnosticSession();
      if (existingSession && existingSession.status === "in_progress" && pack.length > 0) {
        setSession(existingSession);
        const resumeIndex = Math.max(0, Math.min(existingSession.currentQuestionIndex, pack.length - 1));
        setCurrentIndex(resumeIndex);
        const currentQ = pack[resumeIndex];
        if (currentQ) {
          const existingResp = existingSession.responses[currentQ.id];
          if (existingResp) {
            setSelectedOptionId(existingResp.selectedOptionId);
            setConfidenceRating(existingResp.confidenceRating);
          }
        }
      }

      setHasLoaded(true);
    }

    initDiagnostic();
  }, [user, router]);

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
    trackEvent("diagnostic_started", { streamId });
    const newSession = createDiagnosticSession(streamId, specialty);
    setSession(newSession);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setConfidenceRating(null);
    saveDiagnosticSession(newSession);
  };

  const handleRestart = () => {
    clearDiagnosticSession();
    handleStartSession();
  };

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleSelectConfidence = (rating: 1 | 2 | 3 | 4 | 5) => {
    setConfidenceRating(rating);
  };

  const handleNext = () => {
    if (!session || !currentQuestion || !selectedOptionId || !confidenceRating) return;

    const effectiveUserId =
      user?.id ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
        : undefined);

    // Save individual question response immediately to user_progress
    if (effectiveUserId && currentQuestion) {
      const chosenOpt = currentQuestion.options.find((o) => o.id === selectedOptionId);
      const isCorrect = chosenOpt?.isCorrect ?? false;
      ProgressService.recordLessonActivity({
        userId: effectiveUserId,
        streamId,
        subjectId: currentQuestion.subjectId,
        skillId: currentQuestion.topicId || currentQuestion.id,
        lessonId: `diag_${currentQuestion.id}`,
        status: isCorrect ? "mastered" : "in_progress",
        timeSpentDeltaSeconds: timeSpent,
      }).catch(console.error);
    }

    const updatedSession = recordQuestionResponse(
      session,
      currentQuestion,
      selectedOptionId,
      confidenceRating,
      timeSpent
    );

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextSession = {
        ...updatedSession,
        currentQuestionIndex: nextIdx,
      };
      setSession(nextSession);
      saveDiagnosticSession(nextSession);
      setCurrentIndex(nextIdx);

      const nextQ = questions[nextIdx];
      const prevResp = nextSession.responses[nextQ.id];
      if (prevResp) {
        setSelectedOptionId(prevResp.selectedOptionId);
        setConfidenceRating(prevResp.confidenceRating);
      } else {
        setSelectedOptionId(null);
        setConfidenceRating(null);
      }
    } else {
      const completedSession: DiagnosticSession = {
        ...updatedSession,
        completedAt: new Date().toISOString(),
        status: "completed",
      };
      setSession(completedSession);
      saveDiagnosticSession(completedSession);

      const analysis = completeDiagnosticSession(
        completedSession,
        questions,
        selfEstimateScore
      );
      saveDiagnosticResults(analysis);

      // Persist full diagnostic completion and skills to Supabase & localStorage
      if (effectiveUserId) {
        const skillResults = questions.map((q) => {
          const resp = completedSession.responses[q.id];
          const isCorrect = resp?.isCorrect ?? false;
          return {
            skillId: q.topicId || q.id,
            subjectId: q.subjectId,
            score: isCorrect ? 5.0 : 2.0,
            isMastered: isCorrect,
          };
        });

        ProgressService.saveDiagnosticCompletion({
          userId: effectiveUserId,
          streamId,
          overallScore: analysis.observedDiagnosticScore,
          skillResults,
        }).catch(console.error);
      }

      trackEvent("diagnostic_completed", {
        score: analysis.observedDiagnosticScore,
        dimensions: Object.keys(analysis.dimensionScores).length,
      });
      router.push("/diagnostic/results");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (session) {
        const prevQ = questions[prevIdx];
        const prevResp = session.responses[prevQ.id];
        if (prevResp) {
          setSelectedOptionId(prevResp.selectedOptionId);
          setConfidenceRating(prevResp.confidenceRating);
        }
      }
    }
  };

  if (!hasLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-pulse text-sm text-[var(--color-primary)] font-mono tracking-wider">
          SHATER...
        </div>
      </div>
    );
  }

  const dimensionNameMap: Record<DiagnosticDimension, string> = {
    knowledge: t.diagnostic.dimensions.knowledge.split(" ")[1] || "معارف",
    understanding: t.diagnostic.dimensions.understanding.split(" ")[1] || "فهم",
    application: t.diagnostic.dimensions.application.split(" ")[1] || "تطبيق",
    methodology: t.diagnostic.dimensions.methodology.split(" ")[1] || "منهجية",
    speed: t.diagnostic.dimensions.speed.split(" ")[1] || "سرعة",
    confidence: t.diagnostic.dimensions.confidence.split(" ")[1] || "ثقة",
  };

  const subjectBadgeNameMap: Record<string, { ar: string; fr: string }> = {
    math: { ar: "الرياضيات", fr: "Mathématiques" },
    physics: { ar: "الفيزياء", fr: "Physique" },
    natural_sciences: { ar: "العلوم الطبيعية", fr: "Sciences Naturelles" },
  };

  if (hasLoaded && questions.length === 0) {
    return (
      <AppShell activeNav="roadmap">
        <div className="py-6 sm:py-10">
          <Container size="sm" className="w-full">
            <Card className="p-6 sm:p-8 bg-[#111827] border-slate-800 shadow-xl text-center space-y-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Compass className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {locale === "ar"
                    ? "حزمة التشخيص قيد الإعداد لهذه الشعبة"
                    : "Pack diagnostic en cours de préparation"}
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  {locale === "ar"
                    ? "التشخيص التكيفي التأسيسي مفعل حالياً لشعبة العلوم التجريبية، الرياضيات، وتسيير واقتصاد. يتم حالياً تدقيق الأسئلة المعيارية لشعبتك وفق أحدث المواصفات الرسمية."
                    : "Le diagnostic adaptatif est actuellement actif pour les filières Sciences Expérimentales, Mathématiques et Gestion. Votre filière sera prochainement intégrée."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/curriculum">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    <BookOpen className="h-4 w-4 me-2" />
                    {locale === "ar" ? "تصفح المنهج والمحتوى" : "Consulter le programme"}
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full sm:w-auto">
                    {locale === "ar" ? "تغيير الشعبة" : "Changer de filière"}
                  </Button>
                </Link>
              </div>
            </Card>
          </Container>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="roadmap">
      <div className="py-6 sm:py-10">
        <Container size="sm" className="w-full">
          {!session || session.status === "completed" ? (
            /* Intro / Subject Diagnostic Selector Hub */
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Badge variant="primary" size="md">
                  {locale === "ar" ? "الوضع الموجه بالمواد" : "Diagnostic par matière"}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {locale === "ar" ? "اختر المادة لتحديد مستواك وبناء مسارك" : "Choisissez une matière pour votre diagnostic"}
                </h1>
                <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
                  {locale === "ar"
                    ? "يمكنك تقييم كل مادة دراسية بشكل مستقل دون التقيّد بمسار خطي إجباري، أو الانتقال للمكتبة الحرة وتصفح كامل المنهاج."
                    : "Évaluez chaque discipline individuellement ou explorez la bibliothèque de cours en accès libre."}
                </p>
              </div>

              {/* Subject Diagnostic Cards Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-300">
                  <span>{locale === "ar" ? "مواد شعبتك الرسمية" : "Matières de votre filière"}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {getStreamSubjects(streamId, specialty).length} {locale === "ar" ? "مواد" : "matières"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getStreamSubjects(streamId, specialty).map((rule) => {
                    const subj = ALL_SUBJECTS[rule.subjectId];
                    const name = subj ? (locale === "ar" ? subj.name_ar : subj.name_fr) : rule.subjectId;
                    const status = ProgressService.getSubjectDiagnosticStatus(user?.id, rule.subjectId);

                    return (
                      <div
                        key={rule.subjectId}
                        className="p-4 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm sm:text-base">{name}</span>
                              {rule.isCoreSubject && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  {locale === "ar" ? "أساسية" : "Majeure"}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 block font-mono">
                              {locale === "ar" ? `المعامل ${rule.coefficient}` : `Coefficient ${rule.coefficient}`}
                            </span>
                          </div>

                          {status.completed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{status.score ? `${status.score}/20` : (locale === "ar" ? "مكتمل" : "Évalué")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              <span>{locale === "ar" ? "جاهز للتقييم" : "Non évalué"}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                          <Link href={`/diagnostic/${rule.subjectId}`} className="flex-1">
                            <Button
                              size="sm"
                              variant={status.completed ? "outline" : "primary"}
                              className="w-full text-xs font-bold rounded-xl py-2"
                            >
                              <Play className="w-3 h-3 me-1 fill-current" />
                              <span>
                                {status.completed
                                  ? (locale === "ar" ? "إعادة التقييم" : "Réévaluer")
                                  : (locale === "ar" ? "بدء تشخيص المادة" : "Démarrer")}
                              </span>
                            </Button>
                          </Link>

                          <Link href={`/curriculum?subject=${rule.subjectId}`}>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs font-bold rounded-xl py-2 px-3"
                              title={locale === "ar" ? "المكتبة الحرة للمادة" : "Bibliothèque de cours"}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Actions Card: Comprehensive diagnostic & Free roam library */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start shadow-sm">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs sm:text-sm block">
                    {locale === "ar" ? "هل تفضل التقييم الشامل لكل المواد معاً؟" : "Diagnostic global complet ?"}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {locale === "ar"
                      ? `${questions.length} أسئلة استراتيجية لتوليد الخريطة الموحدة لشعبتك.`
                      : `${questions.length} questions pour générer votre feuille de route globale.`}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStartSession}
                    className="flex-1 sm:flex-initial text-xs font-bold rounded-xl px-4 py-2"
                  >
                    <span>{locale === "ar" ? "تقييم شامل (كل المواد)" : "Évaluation globale"}</span>
                  </Button>

                  <Link href="/curriculum" className="flex-1 sm:flex-initial">
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs font-bold rounded-xl px-4 py-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 me-1" />
                      <span>{locale === "ar" ? "المكتبة الشاملة" : "Bibliothèque"}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Active Question Screen */
            <div className="space-y-6">
              {/* Progress & Header info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {t.diagnostic.questionLabel} {currentIndex + 1} {t.diagnostic.ofLabel} {questions.length}
                    </span>
                    <Badge variant="outline" size="sm">
                      {locale === "ar"
                        ? subjectBadgeNameMap[currentQuestion.subjectId]?.ar
                        : subjectBadgeNameMap[currentQuestion.subjectId]?.fr}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span>{timeSpent}s</span>
                    <span className="text-slate-500">/ ~{currentQuestion.expectedSeconds}s</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <Card className="p-5 sm:p-7 bg-[#111827] border-slate-800 shadow-xl space-y-6">
                {/* Topic & Dimension Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {locale === "ar" ? currentQuestion.topic_ar : currentQuestion.topic_fr}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {dimensionNameMap[currentQuestion.dimension]}
                  </Badge>
                </div>

                {/* Question Prompt */}
                <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {locale === "ar" ? currentQuestion.prompt_ar : currentQuestion.prompt_fr}
                </div>

                {/* Options list */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        data-testid="diagnostic-option"
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        className={`w-full min-h-[50px] text-start p-4 rounded-xl border transition-all text-sm leading-relaxed flex items-start gap-3 active:scale-[0.99] ${
                          isSelected
                            ? "border-blue-500 bg-[#162238] text-white font-medium shadow-md shadow-blue-500/10"
                            : "border-slate-800 bg-[#162032]/60 hover:border-slate-700 hover:bg-[#162032] text-slate-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center text-xs ${
                            isSelected
                              ? "border-blue-500 bg-blue-600 text-white font-bold"
                              : "border-slate-700 bg-slate-800 text-slate-500"
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="flex-1">
                          {locale === "ar" ? option.text_ar : option.text_fr}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Confidence Rating — shown once an option is selected */}
                {selectedOptionId && (
                  <div className="p-4 rounded-xl bg-[#162032] border border-slate-800 space-y-3 animate-fade-in">
                    <div className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>{t.diagnostic.confidencePrompt}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {([1, 2, 3, 4, 5] as const).map((lvl) => {
                        const isChosen = confidenceRating === lvl;
                        return (
                          <button
                            key={lvl}
                            data-testid="diagnostic-conf-btn"
                            type="button"
                            onClick={() => handleSelectConfidence(lvl)}
                            className={`min-h-[46px] p-2 sm:p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center active:scale-95 ${
                              isChosen
                                ? "bg-blue-600 text-white border-blue-500 font-bold shadow-md shadow-blue-600/30"
                                : "bg-[#111827] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <div className="text-sm font-bold">{lvl}</div>
                            <div className="text-[10px] leading-tight truncate mt-0.5 opacity-90">
                              {t.diagnostic.confidenceLevels[lvl]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4"
                >
                  <PrevArrow className="h-4 w-4" />
                  <span>{t.diagnostic.prevButton}</span>
                </Button>

                <Button
                  data-testid="diagnostic-next-btn"
                  size="md"
                  onClick={handleNext}
                  disabled={!selectedOptionId || !confidenceRating}
                  className="px-6"
                >
                  <span>
                    {currentIndex === questions.length - 1
                      ? t.diagnostic.submitButton
                      : t.diagnostic.nextButton}
                  </span>
                  <NextArrow className="h-4 w-4" />
                </Button>
              </div>

              {/* Restart link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="text-xs text-slate-500 hover:text-slate-300 underline inline-flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{t.diagnostic.restartCta}</span>
                </button>
              </div>
            </div>
          )}
        </Container>
      </div>
    </AppShell>
  );
}
