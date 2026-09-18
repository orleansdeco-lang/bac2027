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
import { StreamId, TechniqueMathSpecialty } from "@/types/education";
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

  // Load profile and existing session
  useEffect(() => {
    let activeStream: StreamId = "sciences_exp";
    let activeSpecialty: TechniqueMathSpecialty | undefined = undefined;
    let estimate = 12.0;

    async function initDiagnostic() {
      const effectiveUserId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id : undefined);
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
  }, [user]);

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
            /* Intro / Pre-diagnostic screen */
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Badge variant="primary" size="md">
                  {t.diagnostic.phaseBadge}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {t.diagnostic.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
                  {t.diagnostic.subtitle}
                </p>
              </div>

              {/* Honest baseline warning banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#281c11] border border-amber-500/40 text-amber-200 flex gap-3.5 items-start shadow-md">
                <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-white">{t.diagnostic.honestBaselineNotice}</div>
                  <div className="text-amber-200/90 leading-relaxed">{t.diagnostic.honestBaselineSub}</div>
                </div>
              </div>

              {/* Pilot Pack Info Card */}
              <Card className="p-5 sm:p-6 bg-[#111827] border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {locale === "ar" ? "حزمة الاختبار التجريبية" : "Pack Diagnostic Pilote"}
                  </span>
                  <Badge variant="default" size="sm">
                    {questions.length} {locale === "ar" ? "سؤالاً نوعياً" : "questions ciblées"}
                  </Badge>
                </div>

                {streamId === "math" ? (
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">5 {locale === "ar" ? "رياضيات" : "Maths"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "دوال، متتاليات، نهايات" : "Fonctions, suites, limites"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">5 {locale === "ar" ? "فيزياء" : "Physique"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "كهرباء، نووي، ميكانيك" : "RC, nucléaire, Newton"}</div>
                    </div>
                  </div>
                ) : streamId === "gestion_eco" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">4 {locale === "ar" ? "محاسبة ومالية" : "Comptabilité"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "اهتلاكات، تسويات" : "Amortissements"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">4 {locale === "ar" ? "اقتصاد ومناجمنت" : "Économie"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "تضخم، نقود، بنوك" : "Inflation, monnaie"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">3 {locale === "ar" ? "قانون" : "Droit"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "عقد العمل، شركات" : "Contrat de travail"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">4 {locale === "ar" ? "رياضيات" : "Maths"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "دوال، متتاليات عددية" : "Fonctions, suites"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">5 {locale === "ar" ? "رياضيات" : "Maths"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "دوال، متتاليات، قيم متوسطة" : "Fonctions, TVI, suites"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">5 {locale === "ar" ? "فيزياء" : "Physique"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "كهرباء، نووي، ميكانيك" : "RC, nucléaire, Newton"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="font-bold text-white">5 {locale === "ar" ? "علوم طبيعية" : "SVT"}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{locale === "ar" ? "بروتين، مناعة، اتصال عصبي" : "Protéines, immunologie"}</div>
                    </div>
                  </div>
                )}

                <div className="pt-2 text-xs text-slate-400 space-y-2 border-t border-slate-800">
                  <div className="font-semibold text-slate-300">{t.diagnostic.dimensionsHeading}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.diagnostic.dimensions.knowledge}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.diagnostic.dimensions.understanding}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.diagnostic.dimensions.application}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.diagnostic.dimensions.methodology}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Start Button */}
              <div className="pt-2">
                <Button size="lg" fullWidth onClick={handleStartSession}>
                  <Play className="h-4 w-4" />
                  <span>{t.diagnostic.startCta}</span>
                </Button>
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
