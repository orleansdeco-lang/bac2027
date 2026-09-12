"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import { MissionService } from "@/lib/services/mission-service";
import { DashboardService } from "@/lib/services/dashboard-service";
import { SkillLearningBundle } from "@/domain/content";
import { PracticeQuestion } from "@/domain/content/types";
import {
  resolveEducationalContentLanguage,
  resolveContentDirection,
} from "@/domain/content/language";
import { trackEvent } from "@/lib/analytics";
import { submitPilotFeedback, PilotFeedbackRating } from "@/lib/feedback";
import { StudentService } from "@/lib/services/student-service";
import { getStudentAccess } from "@/lib/access";
import {
  Compass,
  Lock,
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
  ShieldCheck,
  Flame,
  Check,
  X,
  Target,
  FileText,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Wrench,
  Award,
  Layers,
} from "lucide-react";
import {
  Mission,
  Skill,
  SuspectedErrorType,
  ErrorRecord,
} from "@/types/mission";

type MissionStep =
  | "learn"
  | "worked_example"
  | "practice"
  | "practice_feedback"
  | "error_diagnosis"
  | "repair"
  | "retest"
  | "summary";

export default function MissionPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = Array.isArray(params.missionId)
    ? params.missionId[0]
    : (params.missionId as string);

  const { user } = useAuth();
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const BackArrow = direction === "rtl" ? ArrowRight : ArrowLeft;

  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<Mission | null>(null);
  const [bundle, setBundle] = useState<SkillLearningBundle | null>(null);

  // Active step in the 8-step product loop
  const [currentStep, setCurrentStep] = useState<MissionStep>("learn");

  // Worked example toggle ("Think before looking")
  const [showWorkedSolution, setShowWorkedSolution] = useState(false);
  const [showQuickRecallAnswer, setShowQuickRecallAnswer] = useState(false);
  const [quickRecallReflection, setQuickRecallReflection] = useState<"remembered" | "needs_review" | null>(null);

  // Practice state
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isPracticeCorrect, setIsPracticeCorrect] = useState<boolean | null>(null);

  // Error & Repair state
  const [activeErrorRecord, setActiveErrorRecord] = useState<ErrorRecord | null>(null);
  const [selectedAttribution, setSelectedAttribution] = useState<SuspectedErrorType>("misunderstood_concept");
  const [repairReflection, setRepairReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retest state
  const [retestSelectedOptionId, setRetestSelectedOptionId] = useState<string | null>(null);
  const [retestConfidence, setRetestConfidence] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [isRetestPassed, setIsRetestPassed] = useState<boolean | null>(null);

  // Adaptive next mission
  const [nextMissionId, setNextMissionId] = useState<string | null>(null);

  // Pilot qualitative feedback state
  const [feedbackRating, setFeedbackRating] = useState<PilotFeedbackRating | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFeedbackSubmit = () => {
    if (!feedbackRating) return;
    submitPilotFeedback({
      missionId,
      skillId: bundle?.skill.id,
      rating: feedbackRating,
      feedbackNote: feedbackNote.trim() || undefined,
      userId: user?.id,
    });
    setFeedbackSubmitted(true);
  };

  // Load mission & bundle
  useEffect(() => {
    async function loadData() {
      if (!missionId) return;
      try {
        const [res, p] = await Promise.all([
          MissionService.getMissionWithBundle(missionId, user?.id),
          StudentService.getProfile(user?.id),
        ]);
        if (p) setProfile(p);
        if (res) {
          setMission(res.mission);
          setBundle(res.bundle);

          if (res.bundle?.practiceQuestions && res.bundle.practiceQuestions.length > 0) {
            setActiveQuestion(res.bundle.practiceQuestions[0]);
          }

          // If mission has already been mastered
          if (res.mission) {
            if (res.mission.status === "mastered") {
              setCurrentStep("summary");
            } else if (res.mission.status === "retest_ready") {
              setCurrentStep("retest");
            } else if (res.mission.status === "repair_needed") {
              setCurrentStep("repair");
            }
          }

          if (res.bundle?.skill) {
            trackEvent("first_mission_started", {
              missionId,
              skillId: res.bundle.skill.id,
              subjectId: res.bundle.skill.subjectId,
            });
            trackEvent("lesson_viewed", {
              missionId,
              skillId: res.bundle.skill.id,
            });
          }
        }

        // Preload next mission ID
        const dash = await DashboardService.getDashboardData(user?.id);
        if (dash?.todaysMission?.mission?.id && dash.todaysMission.mission.id !== missionId) {
          setNextMissionId(dash.todaysMission.mission.id);
        }
      } catch (err) {
        console.error("Failed to load mission bundle:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [missionId, user]);

  // Timer effect for practice and retest
  useEffect(() => {
    if (currentStep === "practice" || currentStep === "retest") {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="h-5 w-5 animate-spin" />
            </div>
            <p className="text-sm font-mono text-slate-400">
              {isAr ? "جاري تحميل المهمة..." : "Chargement de la mission..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const access = getStudentAccess(profile);

  if (access.status === "TRIAL_EXPIRED") {
    return (
      <AppShell>
        <Container size="sm" className="py-12 sm:py-16 text-center space-y-6">
          <div data-testid="mission-trial-expired-gate" className="p-6 sm:p-8 rounded-2xl bg-[#111827] border border-amber-500/40 space-y-5 shadow-2xl animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {isAr ? "انتهت فترة التجربة المجانية (48 ساعة)" : "Votre essai gratuit de 48h a expiré"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                {isAr
                  ? "جميع مهامك وتقدمك الدراسي محفوظان بدقة. لتتمكن من حل التمارين وإجراء الاختبارات، يرجى تفعيل اشتراكك."
                  : "Votre historique et progression restent intacts. Activez votre pass pour débloquer les exercices et retests."}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/subscribe" className="w-full sm:w-auto">
                <Button data-testid="expired-gate-subscribe-btn" size="lg" variant="primary" fullWidth className="font-bold text-sm">
                  <span>{isAr ? "كمّل BAC Mastery" : "Continuer avec BAC Mastery"}</span>
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" fullWidth className="text-xs text-slate-300">
                  <span>{isAr ? "العودة للوحة التحكم" : "Tableau de bord"}</span>
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </AppShell>
    );
  }

  if (!mission || !bundle) {
    return (
      <AppShell>
        <Container size="sm" className="py-20 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">
            {isAr ? "المهمة غير موجودة" : "Mission introuvable"}
          </h1>
          <p className="text-xs text-slate-400">
            {isAr
              ? "لم نتمكن من العثور على محتوى هذه المهمة. يمكنك العودة إلى لوحة التحكم."
              : "Impossible de charger le contenu de cette mission."}
          </p>
          <Link href="/dashboard">
            <Button variant="primary">
              <BackArrow className="h-4 w-4" />
              <span>{isAr ? "العودة إلى لوحة التحكم" : "Tableau de bord"}</span>
            </Button>
          </Link>
        </Container>
      </AppShell>
    );
  }

  const lesson = bundle.lesson;
  const workedExample = bundle.workedExample;
  const repairGuide = bundle.repairGuide;
  const retest = bundle.retest;

  const educationalLang = resolveEducationalContentLanguage(bundle.skill.subjectId);
  const educationalDir = resolveContentDirection(educationalLang);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  // --------------------------------------------------------------------------
  // Practice Submission Handler
  // --------------------------------------------------------------------------
  const handlePracticeSubmit = async () => {
    if (!activeQuestion || !selectedOptionId || !confidenceRating) return;
    setIsSubmitting(true);

    const isCorrect = selectedOptionId === activeQuestion.correctAnswerId;
    setIsPracticeCorrect(isCorrect);

    try {
      await MissionService.recordPracticeAttempt({
        missionId: mission.id,
        skillId: bundle.skill.id,
        questionId: activeQuestion.id,
        selectedAnswer: selectedOptionId,
        isCorrect,
        confidence: confidenceRating,
        timeSpentSeconds,
        userId: user?.id,
      });

      trackEvent("practice_completed", {
        missionId: mission.id,
        skillId: bundle.skill.id,
        isCorrect,
        confidence: confidenceRating,
      });

      if (!isCorrect) {
        trackEvent("error_created", {
          missionId: mission.id,
          skillId: bundle.skill.id,
        });
        // Record error automatically in background
        const errRec = await MissionService.recordError({
          missionId: mission.id,
          skillId: bundle.skill.id,
          questionId: activeQuestion.id,
          subjectId: bundle.skill.subjectId,
          suspectedErrorType: "misunderstood_concept",
          selectedAnswer: selectedOptionId,
          correctAnswer: activeQuestion.correctAnswerId,
          confidence: confidenceRating,
          userId: user?.id,
        });
        setActiveErrorRecord(errRec);
      }

      setCurrentStep("practice_feedback");
    } catch (err) {
      console.error("Error submitting practice attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Error Attribution Handler
  // --------------------------------------------------------------------------
  const handleConfirmAttribution = async () => {
    if (!activeErrorRecord) return;
    setIsSubmitting(true);

    try {
      const updated = await MissionService.startRepair(activeErrorRecord.id, activeErrorRecord, user?.id);
      setActiveErrorRecord(updated);
      trackEvent("repair_started", {
        missionId: mission.id,
        skillId: bundle.skill.id,
      });
      setCurrentStep("repair");
    } catch (err) {
      console.error("Error confirming attribution:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Repair Completion Handler
  // --------------------------------------------------------------------------
  const handleCompleteRepair = async () => {
    if (!activeErrorRecord) return;
    setIsSubmitting(true);

    try {
      const completed = await MissionService.completeRepair(
        activeErrorRecord.id,
        activeErrorRecord,
        repairReflection,
        user?.id
      );
      setActiveErrorRecord(completed);
      trackEvent("repair_completed", {
        missionId: mission.id,
        skillId: bundle.skill.id,
      });
      trackEvent("retest_started", {
        missionId: mission.id,
        skillId: bundle.skill.id,
      });
      setCurrentStep("retest");
    } catch (err) {
      console.error("Error completing repair:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Retest Submission Handler
  // --------------------------------------------------------------------------
  const handleRetestSubmit = async () => {
    if (!retest || !retestSelectedOptionId || !retestConfidence || !activeErrorRecord) return;
    setIsSubmitting(true);

    const isPassed = retestSelectedOptionId === retest.correctAnswerId;
    setIsRetestPassed(isPassed);

    try {
      await MissionService.recordRetestOutcome({
        missionId: mission.id,
        skillId: bundle.skill.id,
        subjectId: bundle.skill.subjectId,
        errorRecord: activeErrorRecord,
        practiceQuestionId: activeQuestion?.id || "pq-1",
        retestQuestionId: retest.id,
        isPassed,
        selectedAnswer: retestSelectedOptionId,
        confidence: retestConfidence,
        userId: user?.id,
      });

      trackEvent("retest_completed", {
        missionId: mission.id,
        skillId: bundle.skill.id,
        isCorrect: isPassed,
        confidence: retestConfidence,
      });

      if (isPassed) {
        trackEvent("mastery_demonstrated", {
          missionId: mission.id,
          skillId: bundle.skill.id,
        });
      }

      setCurrentStep("summary");
    } catch (err) {
      console.error("Error submitting retest outcome:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confidenceLevels = [1, 2, 3, 4, 5] as const;

  const errorCategories: { type: SuspectedErrorType; label_ar: string; label_fr: string }[] = [
    {
      type: "misunderstood_concept",
      label_ar: "ما فهمتش الفكرة الأساسية أصلاً",
      label_fr: "Incompréhension du concept fondamental",
    },
    {
      type: "forgot_information",
      label_ar: "نسيت القانون / الملاحظة الضرورية",
      label_fr: "Oubli de la formule ou de la règle",
    },
    {
      type: "calculation_error",
      label_ar: "غلطت في الحساب أو الإشارة (+ / -)",
      label_fr: "Erreur de calcul ou de signe",
    },
    {
      type: "misread_question",
      label_ar: "ما قريتش المعطيات والشروط مليح",
      label_fr: "Consigne ou hypothèses mal lues",
    },
    {
      type: "methodology_error",
      label_ar: "عرفت النتيجة بصح ما عرفتش طريقة البرهان والتحرير",
      label_fr: "Problème de rédaction ou de méthode",
    },
    {
      type: "rushed",
      label_ar: "تسرعت في اختيار الإجابة بدون تدقيق",
      label_fr: "Précipitation sans vérification",
    },
  ];

  return (
    <AppShell activeNav="missions">
      <Container size="md" className="py-6 sm:py-8 space-y-6">
        {/* ================================================================= */}
        {/* TOP MISSION HEADER & STEPS BREADCRUMB                             */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-slate-800">
                <BackArrow className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  {bundle.skill.subjectId === "math"
                    ? isAr ? "رياضيات" : "Math"
                    : bundle.skill.subjectId === "physics"
                    ? isAr ? "فيزياء" : "Physique"
                    : isAr ? "علوم طبيعية" : "SVT"}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {bundle.skill.id}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white mt-1">
                {isAr ? bundle.skill.title_ar : bundle.skill.title_fr}
              </h1>
            </div>
          </div>

          {/* Sticky Step Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setCurrentStep("learn")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                currentStep === "learn"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isAr ? "1. الدرس" : "1. Leçon"}
            </button>
            <button
              onClick={() => setCurrentStep("worked_example")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                currentStep === "worked_example"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isAr ? "2. مثال محلول" : "2. Exemple"}
            </button>
            <button
              onClick={() => setCurrentStep("practice")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                currentStep === "practice" || currentStep === "practice_feedback"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isAr ? "3. التطبيق" : "3. Pratique"}
            </button>
            {activeErrorRecord && (
              <>
                <button
                  onClick={() => setCurrentStep("repair")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                    currentStep === "repair" || currentStep === "error_diagnosis"
                      ? "bg-amber-600/20 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isAr ? "4. الإصلاح" : "4. Réparation"}
                </button>
                <button
                  onClick={() => setCurrentStep("retest")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                    currentStep === "retest"
                      ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isAr ? "5. إعادة الاختبار" : "5. Retest"}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentStep("summary")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                currentStep === "summary"
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isAr ? "الخلاصة" : "Bilan"}
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* STEP 1: MICRO-LESSON (14 PEDAGOGICAL ELEMENTS)                    */}
        {/* ================================================================= */}
        {currentStep === "learn" && lesson && (
          <div dir={educationalDir} className="space-y-6 animate-fade-in">
            {/* Target Capability (بعد ما نكمل الدرس) */}
            <Card className="border-blue-500/30 bg-blue-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Target className="h-4 w-4" />
                <span>{isAr ? "الهدف العملي من هذا الدرس" : "Capacité ciblée"}</span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {lesson.targetCapability_ar}
              </p>
            </Card>

            {/* Core Idea & Simple Explanation */}
            <Card className="border-slate-800 bg-[#0e1628]/80 p-6 space-y-5">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>{isAr ? "1. الفكرة الأساسية" : "Concept Fondamental"}</span>
                </h3>
                <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  {lesson.coreConcept_ar}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{isAr ? "2. الشرح المبسط والمباشر" : "Explication Simple"}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {lesson.simpleExplanation_ar}
                </p>
              </div>

              {/* Why this matters for BAC */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 block">
                  {isAr ? "💡 علاش هذا مهم في البكالوريا؟" : "Importance pour le BAC"}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lesson.whyThisMatters_ar}
                </p>
              </div>

              {/* Common Mistakes Warning */}
              {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{isAr ? "3. أخطاء شائعة يقع فيها الطلبة" : "Pièges Fréquents"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.commonMistakes.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1.5">
                        <span className="text-xs font-bold text-rose-300 block">
                          ⚠️ {m.mistake_ar}
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          <strong className="text-slate-200">{isAr ? "السبب: " : "Cause : "}</strong>
                          {m.whyItHappens_ar}
                        </p>
                        <p className="text-[11px] text-emerald-300 leading-relaxed">
                          <strong className="text-emerald-400">{isAr ? "التصحيح: " : "Action : "}</strong>
                          {m.correctAction_ar}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Recall Test (Active Recall UX - DEF-002 Resolved) */}
              <div className="rounded-xl border border-cyan-800/40 bg-gradient-to-b from-slate-900/90 to-slate-900/60 p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-cyan-400" />
                    <span>{isAr ? "اختبار الاسترجاع النشط (Active Recall)" : "Test de rappel actif"}</span>
                  </span>
                  <Badge variant="outline" size="sm" className="border-cyan-500/30 text-cyan-300 text-[10px]">
                    {isAr ? "فكر في رأسك أولاً" : "Réfléchissez d'abord"}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {isAr ? "السؤال لاختبار فهمك:" : "Question d'auto-évaluation :"}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                    {lesson.quickRecallPrompt_ar}
                  </p>
                </div>

                {!showQuickRecallAnswer ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30">
                    <span className="text-xs text-cyan-200/90">
                      {isAr ? "فكر وحدك وحاول استحضار الجواب في ذهنك قبل ما تكشف الإجابة." : "Formulez votre réponse mentale avant de vérifier."}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowQuickRecallAnswer(true);
                        trackEvent("active_recall_answer_revealed", {
                          missionId,
                          skillId: bundle?.skill?.id,
                        });
                      }}
                      className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs shrink-0 h-8"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{isAr ? "أظهِر الإجابة" : "Afficher la réponse"}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1 animate-fade-in">
                    <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-700/50 text-xs sm:text-sm text-cyan-100 leading-relaxed">
                      <div className="flex items-center justify-between mb-1.5 border-b border-cyan-800/40 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          {isAr ? "الإجابة النموذجية المركزة:" : "Réponse attendue :"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowQuickRecallAnswer(false)}
                          className="text-[11px] text-cyan-400/80 hover:text-cyan-300 underline"
                        >
                          {isAr ? "إخفاء" : "Masquer"}
                        </button>
                      </div>
                      {lesson.quickRecallAnswer_ar}
                    </div>

                    {/* Metacognitive Reflection */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
                      <span className="text-slate-300 text-xs">
                        {isAr ? "واش قدرت تجاوب قبل ما تكشفها؟" : "Avez-vous réussi à répondre mentalement ?"}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setQuickRecallReflection("remembered")}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            quickRecallReflection === "remembered"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {isAr ? "نعم، تذكرتها بدقة ✓" : "Oui, parfaitement"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickRecallReflection("needs_review")}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            quickRecallReflection === "needs_review"
                              ? "bg-amber-600 text-white"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {isAr ? "نحتاج نثبتها أكثر" : "À consolider"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Bottom Step Navigation */}
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentStep("worked_example")}
                className="font-bold shadow-lg shadow-blue-600/25"
              >
                <span>{isAr ? "فهمت الفكرة، نروح للمثال المحلول" : "Passer à l'exemple résolu"}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: WORKED EXAMPLE (THINK BEFORE LOOKING)                     */}
        {/* ================================================================= */}
        {currentStep === "worked_example" && workedExample && (
          <div dir={educationalDir} className="space-y-6 animate-fade-in">
            <Card className="border-slate-800 bg-[#0e1628]/80 p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>{isAr ? "مثال نموذجي محلول خطوة بخطوة" : "Exemple Résolu"}</span>
                </span>
                <Badge variant="outline" size="sm" className="text-slate-400 border-slate-700">
                  {isAr ? "تفكير منهجي" : "Méthodologie"}
                </Badge>
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isAr ? "نص المسألة / التمرين" : "Énoncé"}
                </h3>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {workedExample.problem_ar}
                </div>
              </div>

              {/* Think Before Looking Callout */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Brain className="h-4 w-4 text-amber-400" />
                    <span>{isAr ? "خمّم وحدك قبل ما تشوف الحل" : "Réfléchissez avant de regarder"}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWorkedSolution(!showWorkedSolution)}
                    className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs h-8"
                  >
                    {showWorkedSolution ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>{isAr ? "إخفاء خطوات الحل" : "Masquer la solution"}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isAr ? "اكشف خطوات الحل" : "Afficher la solution"}</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  {workedExample.howToThink_ar}
                </p>
              </div>

              {/* Step by Step Solution (Revealed on click) */}
              {showWorkedSolution && (
                <div className="space-y-4 pt-2 border-t border-slate-800 animate-fade-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isAr ? "خطوات الحل المنهجي بالتفصيل" : "Étapes de résolution"}</span>
                  </h3>

                  <div className="space-y-3">
                    {workedExample.stepByStepSolution_ar.map((step, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                        <span className="h-6 w-6 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Final Answer & Verification Tip */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Award className="h-4 w-4" />
                      <span>{isAr ? "النتيجة النهائية وصياغة الإجابة" : "Réponse finale"}</span>
                    </div>
                    <p className="text-sm font-bold text-white font-mono">
                      {workedExample.finalAnswer_ar}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-emerald-900/30">
                      <strong className="text-emerald-300">{isAr ? "طريقة التحقق: " : "Vérification : "}</strong>
                      {workedExample.verificationTip_ar}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep("learn")}
                className="text-slate-400"
              >
                <BackArrow className="h-4 w-4" />
                <span>{isAr ? "مراجعة الدرس" : "Revoir la leçon"}</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  trackEvent("practice_started", {
                    missionId: mission.id,
                    skillId: bundle.skill.id,
                  });
                  setCurrentStep("practice");
                }}
                className="font-bold shadow-lg shadow-blue-600/25"
              >
                <span>{isAr ? "فهمت المثال، نبدأ التطبيق" : "Commencer la pratique"}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: PRACTICE QUESTION & CONFIDENCE RATING                     */}
        {/* ================================================================= */}
        {currentStep === "practice" && activeQuestion && (
          <div dir={educationalDir} className="space-y-6 animate-fade-in">
            <Card className="border-slate-800 bg-[#0e1628]/80 p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {isAr ? "تطبيق تطبيقي لقياس التمكن" : "Pratique d'évaluation"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>{formatTime(timeSpentSeconds)}</span>
                </div>
              </div>

              {/* Prompt */}
              <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {isAr ? activeQuestion.prompt_ar : activeQuestion.prompt_fr}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`w-full min-h-[52px] text-start p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 active:scale-[0.99] ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/30 text-white shadow-lg shadow-blue-500/10"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <span
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm font-sans flex-1">
                        {isAr ? opt.text_ar : opt.text_fr}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Metacognitive Confidence Rating */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  <span>
                    {isAr
                      ? "قبل ما تشوف النتيجة... قداش راك واثق من إجابتك؟"
                      : "Quel est votre niveau de certitude ?"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {confidenceLevels.map((lvl) => {
                    const isSelected = confidenceRating === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setConfidenceRating(lvl)}
                        className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                            : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {lvl}/5
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                data-testid="practice-submit-button"
                variant="primary"
                size="lg"
                disabled={!selectedOptionId || !confidenceRating || isSubmitting}
                onClick={handlePracticeSubmit}
                className="font-bold shadow-lg shadow-blue-600/25"
              >
                <span>{isSubmitting ? (isAr ? "جاري التحقق..." : "Vérification...") : (isAr ? "تحقق من الإجابة" : "Valider")}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: PRACTICE FEEDBACK / RESULT                                */}
        {/* ================================================================= */}
        {currentStep === "practice_feedback" && activeQuestion && (
          <div className="space-y-6 animate-fade-in">
            {isPracticeCorrect ? (
              <Card className="border-emerald-500/40 bg-emerald-950/20 p-6 sm:p-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-300">
                      {isAr ? "إجابة صحيحة ومثبتة! 🎉" : "Excellente réponse ! 🎉"}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isAr
                        ? "أظهرت استيعاباً دقيقاً للمفهوم وطريقة التطبيق."
                        : "Vous avez appliqué la méthode avec succès."}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {isAr ? "الشرح والتعليل النموذجي" : "Explication"}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {isAr ? activeQuestion.explanation_ar : activeQuestion.explanation_fr}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentStep("practice")}
                    className="text-slate-400"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{isAr ? "إعادة السؤال" : "Refaire"}</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setCurrentStep("summary")}
                    className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                  >
                    <span>{isAr ? "تثبيت المهارة وعرض الخلاصة" : "Voir le bilan de maîtrise"}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border-amber-500/40 bg-amber-950/20 p-6 sm:p-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-300">
                      {isAr ? "الخطأ معلومة • عرفنا وين الخلل بالضبط" : "L'erreur est une information • Point de blocage ciblé"}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isAr
                        ? "ماشي مشكل. الخطأ هنا فرصة ذهبية لنصلحوا المفهوم ونثبتوا الفكرة."
                        : "Identifions la cause racine pour consolider la méthode."}
                    </p>
                  </div>
                </div>

                {/* Explanation of Why the Answer was wrong */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {isAr ? "التعليل النموذجي للإجابة الصحيحة" : "Explication du corrigé"}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {isAr ? activeQuestion.explanation_ar : activeQuestion.explanation_fr}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setCurrentStep("error_diagnosis")}
                    className="bg-amber-600 hover:bg-amber-500 font-bold"
                  >
                    <span>{isAr ? "تشخيص سبب الخطأ وبدء الإصلاح" : "Diagnostiquer l'erreur"}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: ERROR LAB SELF-ATTRIBUTION                                */}
        {/* ================================================================= */}
        {currentStep === "error_diagnosis" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-slate-800 bg-[#0e1628]/80 p-6 sm:p-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Wrench className="h-4 w-4" />
                <span>{isAr ? "مختبر الأخطاء • التشخيص الذاتي" : "Error Lab • Diagnostic"}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">
                  {isAr ? "واش هو السبب الحقيقي اللي خلاك تغلط؟" : "Quelle est la cause de cette erreur ?"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? "التحديد الصادق للسبب يساعد النظام على إعطائك دليل إصلاح موجه بدقة."
                    : "Votre auto-diagnostic permet d'activer le bon protocole de remédiation."}
                </p>
              </div>

              <div className="space-y-2.5">
                {errorCategories.map((cat) => {
                  const isSelected = selectedAttribution === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setSelectedAttribution(cat.type)}
                      className={`w-full p-3.5 rounded-xl border text-start transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-amber-500 bg-amber-950/30 text-white"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-sans">
                        {isAr ? cat.label_ar : cat.label_fr}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                onClick={handleConfirmAttribution}
                className="bg-amber-600 hover:bg-amber-500 font-bold"
              >
                <span>{isAr ? "تأكيد وبدء دليل الإصلاح" : "Ouvrir le guide de réparation"}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 6: REPAIR GUIDE                                              */}
        {/* ================================================================= */}
        {currentStep === "repair" && repairGuide && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-amber-500/30 bg-[#0e1628]/80 p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4" />
                  <span>{isAr ? "دليل الإصلاح المركز (5-10 دقائق)" : "Guide de Réparation"}</span>
                </span>
                <Badge variant="warning" size="sm">
                  {repairGuide.estimatedMinutes} {isAr ? "دقائق" : "min"}
                </Badge>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {repairGuide.title_ar}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  <strong className="text-amber-300">{isAr ? "علاش وقع الخطأ؟ " : "Pourquoi cette erreur ? "}</strong>
                  {repairGuide.whyItHappens_ar}
                </p>
              </div>

              {/* Diagnosis */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-cyan-300 block">
                  {isAr ? "🔍 التشخيص الدقيق" : "Diagnostic Précis"}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {repairGuide.diagnosis_ar}
                </p>
              </div>

              {/* Repair Steps */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  {isAr ? "📋 خطوات المعالجة والتصحيح" : "Protocole de Correction"}
                </span>
                <div className="space-y-2.5">
                  {repairGuide.repairSteps_ar.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                      <span className="h-6 w-6 rounded-lg bg-amber-600/20 border border-amber-500/30 text-amber-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Micro-Practice prompt */}
              {repairGuide.microPracticePrompt_ar && (
                <div className="p-4 rounded-xl bg-blue-950/25 border border-blue-800/40 space-y-2">
                  <span className="text-xs font-bold text-blue-300 block">
                    ⚡ {isAr ? "تطبيق فوري مصغر للتثبيت" : "Micro-Exercice d'application"}
                  </span>
                  <p className="text-xs text-slate-200">
                    {repairGuide.microPracticePrompt_ar}
                  </p>
                  <p className="text-xs text-emerald-300 pt-1 border-t border-blue-900/30">
                    <strong className="text-emerald-400">{isAr ? "الحل: " : "Solution : "}</strong>
                    {repairGuide.microPracticeSolution_ar}
                  </p>
                </div>
              )}

              {/* Optional student reflection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">
                  {isAr ? "واش هي الملاحظة اللي لازم تشفا عليها باش ما تعاودش هذي الغلطة؟" : "Note personnelle de mémorisation"}
                </label>
                <input
                  type="text"
                  value={repairReflection}
                  onChange={(e) => setRepairReflection(e.target.value)}
                  placeholder={isAr ? "مثال: نتأكد دايماً من مشتقة الدالة الداخلية قبل الضرب..." : "Ex: Toujours vérifier..."}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                onClick={handleCompleteRepair}
                className="bg-cyan-600 hover:bg-cyan-500 font-bold"
              >
                <span>{isAr ? "أكملت المراجعة • ننتقل لاختبار التوأم (Retest)" : "Passer au Retest Jumeau"}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 7: RETEST TWIN                                               */}
        {/* ================================================================= */}
        {currentStep === "retest" && retest && (
          <div dir={educationalDir} className="space-y-6 animate-fade-in">
            <Card className="border-cyan-500/40 bg-[#0e1628]/80 p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>{isAr ? "سؤال جديد • نفس المهارة (اختبار التوأم)" : "Retest Jumeau • Même Compétence"}</span>
                </div>
                <Badge variant="outline" size="sm" className="border-cyan-500/30 text-cyan-300">
                  {isAr ? "تثبيت نهائي" : "Validation"}
                </Badge>
              </div>

              {/* Prompt */}
              <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {isAr ? retest.prompt_ar : retest.prompt_fr}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {retest.options.map((opt, idx) => {
                  const isSelected = retestSelectedOptionId === opt.id;
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRetestSelectedOptionId(opt.id)}
                      className={`w-full min-h-[52px] text-start p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 active:scale-[0.99] ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-950/30 text-white shadow-lg shadow-cyan-500/10"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm font-sans flex-1">
                        {isAr ? opt.text_ar : opt.text_fr}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Confidence */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  <span>{isAr ? "مدى ثقتك في حل السؤال التوأم:" : "Confiance dans votre réponse :"}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {confidenceLevels.map((lvl) => {
                    const isSelected = retestConfidence === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setRetestConfidence(lvl)}
                        className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                            : "border-slate-800 bg-slate-900/40 text-slate-400"
                        }`}
                      >
                        {lvl}/5
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                data-testid="retest-submit-button"
                variant="primary"
                size="lg"
                disabled={!retestSelectedOptionId || !retestConfidence || isSubmitting}
                onClick={handleRetestSubmit}
                className="bg-cyan-600 hover:bg-cyan-500 font-bold"
              >
                <span>{isSubmitting ? (isAr ? "جاري التقييم..." : "Évaluation...") : (isAr ? "تقييم اختبار التوأم" : "Valider le retest")}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 8: SUMMARY & DEMONSTRATED EVIDENCE ("وش ثبت اليوم؟")         */}
        {/* ================================================================= */}
        {currentStep === "summary" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-emerald-500/40 bg-gradient-to-br from-[#0e1c2e] to-[#0b1424] p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Award className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {isAr ? "وش ثبت اليوم؟ • تم إثبات التمكن" : "Bilan de Maîtrise Validée"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {isAr
                      ? "تم تسجيل هذه المهارة كمهارة مثبتة (Demonstrated) في رصيدك الأكاديمي."
                      : "Cette compétence est désormais validée dans votre profil."}
                  </p>
                </div>
              </div>

              {/* What was proven */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isAr ? "تفاصيل الإثبات الأكاديمي" : "Détails de la validation"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">{isAr ? "المهارة" : "Compétence"}</span>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      {isAr ? bundle.skill.title_ar : bundle.skill.title_fr}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">{isAr ? "نوع الدليل" : "Preuve"}</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 block">
                      {activeErrorRecord
                        ? (isAr ? "إصلاح خطأ + نجاح في الاختبار التوأم" : "Réparation + Retest réussi")
                        : (isAr ? "حل صحيح من المحاولة الأولى مع ثقة عالية" : "Pratique réussie")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Past BAC connection */}
              {bundle.examApplication && (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    <span>{isAr ? "ورود هذه المهارة في البكالوريات السابقة" : "Présence aux sessions antérieures du BAC"}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {bundle.examApplication.year} • {bundle.examApplication.session === "principal" ? (isAr ? "دورة عادية" : "Session normale") : (isAr ? "دورة استثنائية" : "Session rattrapage")} • {isAr ? `تمرين ${bundle.examApplication.exerciseNumber}` : `Exercice ${bundle.examApplication.exerciseNumber}`}
                  </p>
                </div>
              )}

              {/* PILOT FEEDBACK CARD */}
              <div className="p-4 sm:p-5 rounded-2xl border border-blue-500/30 bg-slate-900/80 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>{isAr ? "تقييم تجربة المهمة (ملاحظات التلميذ)" : "Retour d'expérience (Pilote)"}</span>
                </div>

                {!feedbackSubmitted ? (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-slate-200 font-semibold">
                      {isAr ? "كيف كانت هذي المهمة؟" : "Comment s'est passée cette mission ?"}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { id: "easy", label_ar: "سهلة", label_fr: "Facile" },
                          { id: "normal", label_ar: "عادية", label_fr: "Normale" },
                          { id: "hard", label_ar: "صعبة", label_fr: "Difficile" },
                          { id: "unclear", label_ar: "ما فهمتش واش ندير", label_fr: "Consignes peu claires" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFeedbackRating(opt.id)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                            feedbackRating === opt.id
                              ? "border-blue-500 bg-blue-950/60 text-blue-300 ring-1 ring-blue-500/40"
                              : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isAr ? opt.label_ar : opt.label_fr}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block">
                        {isAr ? "واش اللي ما عجبكش؟ (اختياري)" : "Qu'est-ce qui pourrait être amélioré ? (optionnel)"}
                      </label>
                      <input
                        type="text"
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder={isAr ? "ملاحظة قصيرة لمساعدتنا في تحسين التجربة..." : "Votre remarque..."}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        data-testid="pilot-feedback-submit-btn"
                        size="sm"
                        variant="primary"
                        disabled={!feedbackRating}
                        onClick={handleFeedbackSubmit}
                        className="text-xs font-bold"
                      >
                        <span>{isAr ? "إرسال الملاحظة" : "Envoyer"}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{isAr ? "شكراً لك! وصلت ملاحظتك وستساعدنا في تحسين المنصة." : "Merci pour votre retour !"}</span>
                  </div>
                )}
              </div>

              {/* Next Steps CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800">
                {nextMissionId ? (
                  <Link href={`/mission/${nextMissionId}`} className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-blue-600/25">
                      <span>{isAr ? "الانتقال إلى المهمة التالية" : "Mission suivante"}</span>
                      <NextArrow className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold">
                      <span>{isAr ? "العودة إلى لوحة التحكم" : "Retour au tableau de bord"}</span>
                      <NextArrow className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                <Link href="/roadmap" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-300 border-slate-700">
                    <span>{isAr ? "عرض الخريطة التكيفية" : "Voir la feuille de route"}</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
