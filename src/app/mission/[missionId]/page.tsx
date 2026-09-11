"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  ShieldCheck,
  Flame,
  Check,
  X,
  Target,
  FileText,
  Zap,
} from "lucide-react";
import {
  Mission,
  Skill,
  PracticeQuestion,
  SuspectedErrorType,
  ErrorRecord,
  PracticeSession,
  MasteryEvidence,
} from "@/types/mission";
import {
  getMissionById,
  saveMission,
  loadMissions,
  getSkillById,
  getPracticeQuestionById,
  buildMissionForSkill,
  createErrorRecord,
  updateStudentErrorAttribution,
  confirmErrorAttribution,
  startRepairAction,
  completeRepairAction,
  evaluateRetestOutcome,
  saveMasteryEvidence,
  saveErrorRecord,
  getErrorRecordById,
  savePracticeSession,
  isSkillMastered,
  getErrorsForMission,
  recordPracticeSuccess,
  analyzeConfidenceSignal,
  getAdaptiveRepairPlan,
} from "@/lib/mission";

type MissionMode =
  | "practice"
  | "practice_evaluated_correct"
  | "error_diagnosis"
  | "error_repair"
  | "repair_completed_ready_for_retest"
  | "retest"
  | "mastery_achieved"
  | "retest_failed"
  | "needs_more_work";

export default function MissionPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = Array.isArray(params.missionId)
    ? params.missionId[0]
    : (params.missionId as string);

  const { t, locale, direction } = useTranslation();
  const isRtl = direction === "rtl";
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const [hasLoaded, setHasLoaded] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);

  // Active question state
  const [mode, setMode] = useState<MissionMode>("practice");
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Error Lab inline diagnosis state
  const [activeErrorRecord, setActiveErrorRecord] = useState<ErrorRecord | null>(null);
  const [selectedAttribution, setSelectedAttribution] = useState<SuspectedErrorType | null>(null);
  const [confidenceAnalysis, setConfidenceAnalysis] = useState<{
    type: string;
    label_ar: string;
    label_fr: string;
    description_ar: string;
    description_fr: string;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load mission, skill, and resume in-flight state
  useEffect(() => {
    if (!missionId) return;

    let targetMission = getMissionById(missionId);

    // Fallback: If not found in localStorage, attempt to build mission for known skill id
    if (!targetMission) {
      const knownSkill = getSkillById(missionId);
      if (knownSkill) {
        targetMission = buildMissionForSkill(missionId, "diagnostic_bottleneck", "high");
        saveMission(targetMission);
      } else {
        // Fallback default mission for Sciences Exp
        targetMission = buildMissionForSkill(
          "math_derivatives_chain_rule",
          "diagnostic_bottleneck",
          "high"
        );
        saveMission(targetMission);
      }
    }

    if (targetMission) {
      setMission(targetMission);
      const targetSkill = getSkillById(targetMission.skillId) || null;
      setSkill(targetSkill);

      // Check if skill is already mastered
      const alreadyMastered = isSkillMastered(targetMission.skillId);
      if (alreadyMastered) {
        targetMission.status = "mastered";
      }

      // Check for existing unresolved or in-flight errors to resume state
      const missionErrors = getErrorsForMission(targetMission.id);
      const latestError = missionErrors.length > 0 ? missionErrors[0] : null;

      if (targetMission.status === "mastered") {
        setMode("mastery_achieved");
        const firstQId = targetMission.practiceQuestionIds[0];
        setActiveQuestion(getPracticeQuestionById(firstQId) || null);
      } else if (targetMission.status === "needs_more_work") {
        setMode("needs_more_work");
        if (latestError) setActiveErrorRecord(latestError);
        const firstQId = targetMission.practiceQuestionIds[0];
        setActiveQuestion(getPracticeQuestionById(firstQId) || null);
      } else if (latestError && latestError.repairStatus !== "retest_passed") {
        setActiveErrorRecord(latestError);
        setSelectedAttribution(latestError.suspectedErrorType);

        if (latestError.repairStatus === "identified") {
          setMode("error_diagnosis");
          const q = getPracticeQuestionById(latestError.questionId);
          setActiveQuestion(q || null);
        } else if (latestError.repairStatus === "repair_started") {
          setMode("error_repair");
          const q = getPracticeQuestionById(latestError.questionId);
          setActiveQuestion(q || null);
        } else if (latestError.repairStatus === "repair_completed") {
          setMode("repair_completed_ready_for_retest");
          const q = getPracticeQuestionById(latestError.questionId);
          setActiveQuestion(q || null);
        } else if (latestError.repairStatus === "retest_failed") {
          if ((latestError.retestFailureCount || 0) >= 2) {
            setMode("needs_more_work");
          } else {
            setMode("retest_failed");
          }
          const q = getPracticeQuestionById(latestError.questionId);
          setActiveQuestion(q || null);
        }
      } else {
        // Normal practice start
        const firstQId = targetMission.practiceQuestionIds[0];
        const initialQ = getPracticeQuestionById(firstQId) || null;
        setActiveQuestion(initialQ);
      }
    }

    setHasLoaded(true);
  }, [missionId]);

  // Timer effect
  useEffect(() => {
    if (mode === "practice" || mode === "retest") {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  if (!hasLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1020]">
        <div className="animate-pulse text-sm text-blue-400 font-mono tracking-wider">
          BAC MASTERY...
        </div>
      </div>
    );
  }

  if (!mission || !skill || !activeQuestion) {
    return (
      <AppShell activeNav="missions">
        <Container size="sm" className="py-20 text-center space-y-5">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t.mission.notFoundTitle}
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {t.mission.notFoundDesc}
          </p>
          <div className="pt-3">
            <Link href="/roadmap">
              <Button size="lg">
                <BackArrow className="h-4 w-4" />
                <span>{t.mission.backToRoadmap}</span>
              </Button>
            </Link>
          </div>
        </Container>
      </AppShell>
    );
  }

  // Handle Practice Submit
  const handlePracticeSubmit = () => {
    if (!selectedOptionId || !confidenceRating || !activeQuestion) return;

    const isCorrect = selectedOptionId === activeQuestion.correctAnswerId;
    const analysis = analyzeConfidenceSignal(isCorrect, confidenceRating);
    setConfidenceAnalysis(analysis);

    const sessionId = `ps-${Date.now()}`;
    const sessionRecord: PracticeSession = {
      id: sessionId,
      missionId: mission.id,
      questionIds: [activeQuestion.id],
      currentQuestionIndex: 0,
      startedAt: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      responses: [
        {
          questionId: activeQuestion.id,
          selectedAnswer: selectedOptionId,
          isCorrect,
          confidence: confidenceRating,
          responseTimeSeconds: timeSpentSeconds,
        },
      ],
      status: isCorrect ? "completed" : "repair_needed",
    };
    savePracticeSession(sessionRecord);

    if (isCorrect) {
      recordPracticeSuccess(mission.id, skill.id, mission.subjectId, confidenceRating);
      setMode("practice_evaluated_correct");
    } else {
      const errorRecord = createErrorRecord({
        sessionId,
        question: activeQuestion,
        missionId: mission.id,
        selectedAnswerId: selectedOptionId,
        confidence: confidenceRating,
      });
      setActiveErrorRecord(errorRecord);
      setSelectedAttribution(errorRecord.suspectedErrorType);
      setMode("error_diagnosis");
    }
  };

  // Confirm Error Attribution
  const handleConfirmAttribution = () => {
    if (!activeErrorRecord || !selectedAttribution) return;

    const updated = updateStudentErrorAttribution(activeErrorRecord.id, selectedAttribution);
    if (updated) {
      confirmErrorAttribution(updated.id);
      const started = startRepairAction(updated.id);
      setActiveErrorRecord(started || updated);
      setMode("error_repair");
    }
  };

  // Complete Repair Steps
  const handleCompleteRepair = () => {
    if (!activeErrorRecord) return;
    const completed = completeRepairAction(activeErrorRecord.id);
    if (completed) {
      setActiveErrorRecord(completed);
    }
    setMode("repair_completed_ready_for_retest");
  };

  // Launch Retest
  const handleLaunchRetest = () => {
    const retestQId = mission.retestQuestionIds[0];
    const retestQ = getPracticeQuestionById(retestQId);
    if (retestQ) {
      setActiveQuestion(retestQ);
      setSelectedOptionId(null);
      setConfidenceRating(null);
      setTimeSpentSeconds(0);
      setConfidenceAnalysis(null);
      setMode("retest");
    }
  };

  // Handle Retest Submit
  const handleRetestSubmit = () => {
    if (!selectedOptionId || !confidenceRating || !activeQuestion) return;

    const isCorrect = selectedOptionId === activeQuestion.correctAnswerId;
    const analysis = analyzeConfidenceSignal(isCorrect, confidenceRating);
    setConfidenceAnalysis(analysis);

    if (activeErrorRecord) {
      const evaluated = evaluateRetestOutcome(
        activeErrorRecord.id,
        activeQuestion.id,
        isCorrect,
        confidenceRating
      );
      setActiveErrorRecord(evaluated.record);

      if (evaluated.outcome === "mastered") {
        setMode("mastery_achieved");
      } else if (evaluated.outcome === "needs_more_work") {
        setMode("needs_more_work");
      } else {
        setMode("retest_failed");
      }
    } else {
      if (isCorrect) {
        const evidence: MasteryEvidence = {
          skillId: skill.id,
          missionId: mission.id,
          subjectId: skill.subjectId,
          evidenceType: "verification_success",
          practiceAttempts: 1,
          correctAttempts: 1,
          retestAttempts: 1,
          successfulRetests: 1,
          confidenceSignals: [confidenceRating],
          masteryStatus: "demonstrated",
          achievedAt: new Date().toISOString(),
          status: "mastered",
        };
        saveMasteryEvidence(evidence);
        mission.status = "mastered";
        saveMission(mission);
        setMode("mastery_achieved");
      } else {
        const errorRecord = createErrorRecord({
          sessionId: `ps-verif-${Date.now()}`,
          question: activeQuestion,
          missionId: mission.id,
          selectedAnswerId: selectedOptionId,
          confidence: confidenceRating,
        });
        setActiveErrorRecord(errorRecord);
        setSelectedAttribution(errorRecord.suspectedErrorType);
        setMode("error_diagnosis");
      }
    }
  };

  // Format seconds
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const confidenceLevels = [1, 2, 3, 4, 5] as const;

  const errorOptions: { type: SuspectedErrorType; label_ar: string; label_fr: string }[] = [
    {
      type: "forgot_information",
      label_ar: "نسيت المعلومة / القانون",
      label_fr: "Oubli de la formule ou du cours",
    },
    {
      type: "misunderstood_concept",
      label_ar: "ما فهمتش الفكرة أصلاً",
      label_fr: "Incompréhension du concept fondamental",
    },
    {
      type: "methodology_error",
      label_ar: "عرفت الفكرة بصح ما عرفتش نطبقها منهجياً",
      label_fr: "Difficulté d'application méthodologique",
    },
    {
      type: "calculation_error",
      label_ar: "غلطت في الحساب / الإشارة",
      label_fr: "Erreur de calcul ou de signe",
    },
    {
      type: "misread_question",
      label_ar: "ما قريتش السؤال مليح / تسرعت",
      label_fr: "Consigne mal lue ou incomprise",
    },
    {
      type: "rushed",
      label_ar: "استعجلت في اختيار الإجابة",
      label_fr: "Précipitation dans la réponse",
    },
    {
      type: "lack_of_practice",
      label_ar: "نحتاج تمارين أكثر لتثبيت الفكرة",
      label_fr: "Besoin de plus d'entraînement",
    },
    {
      type: "unknown",
      label_ar: "ما نعرفش / ما علاباليش بالضبط",
      label_fr: "Cause indéterminée",
    },
  ];

  const adaptivePlan = activeErrorRecord
    ? getAdaptiveRepairPlan(
        skill.id,
        activeErrorRecord.suspectedErrorType,
        activeErrorRecord.confidence
      )
    : null;

  const subjectNames: Record<string, { ar: string; fr: string }> = {
    math: { ar: "الرياضيات", fr: "Mathématiques" },
    physics: { ar: "العلوم الفيزيائية", fr: "Physique-Chimie" },
    natural_sciences: { ar: "علوم الطبيعة والحياة", fr: "Sciences Naturelles" },
  };

  const currentSubjectLabel =
    locale === "ar"
      ? subjectNames[skill.subjectId]?.ar || skill.subjectId
      : subjectNames[skill.subjectId]?.fr || skill.subjectId;

  return (
    <AppShell activeNav="missions">
      <div className="py-6 sm:py-8">
        <Container size="sm" className="space-y-6">
          {/* Mission Top Header Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link href="/roadmap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-xl bg-[#162032] border border-slate-800 text-slate-400 hover:text-white hover:bg-[#1E293B]"
                >
                  <BackArrow className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
                    MISSION 01 • {currentSubjectLabel}
                  </span>
                  <Badge
                    variant={mode === "retest" ? "warning" : "primary"}
                    size="sm"
                  >
                    {mode === "retest" ? t.mission.retestMode : t.mission.practiceMode}
                  </Badge>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {locale === "ar" ? mission.title_ar : mission.title_fr}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#162032] border border-slate-800 text-slate-300 text-xs font-mono">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                <span>{formatTime(timeSpentSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Objective Banner */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800/80 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Target className="h-3.5 w-3.5" />
              <span>{t.mission.objectiveLabel}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {locale === "ar" ? skill.description_ar : skill.description_fr}
            </p>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP A: Practice / Retest Question Card                   */}
          {/* ------------------------------------------------------------- */}
          {(mode === "practice" || mode === "retest") && (
            <div className="space-y-6">
              {/* Retest variant prominent banner */}
              {mode === "retest" && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>
                      {locale === "ar" ? "سؤال جديد • نفس المهارة" : "Nouvel exercice • Même compétence"}
                    </span>
                  </div>
                  <Badge variant="warning" size="sm">
                    {locale === "ar" ? "اختبار التمكن الحقيقي" : "Validation"}
                  </Badge>
                </div>
              )}

              <Card className="p-6 sm:p-8 border-slate-800 bg-[#111827] shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    {mode === "retest" ? t.mission.retestMode : t.mission.questionProgress}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>~{activeQuestion.expectedTimeSeconds}s</span>
                  </span>
                </div>

                {/* Prompt */}
                <div className="text-base sm:text-lg font-medium text-white leading-relaxed font-sans">
                  {locale === "ar" ? activeQuestion.prompt_ar : activeQuestion.prompt_fr}
                </div>

                {/* Options List */}
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
                            ? "border-blue-500 bg-[#162238] shadow-lg shadow-blue-500/10"
                            : "border-slate-800 bg-[#162032]/60 hover:border-slate-700 hover:bg-[#162032]"
                        }`}
                      >
                        <span
                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-800 text-slate-300 border border-slate-700/60"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className={`text-sm sm:text-base flex-1 font-sans ${
                          isSelected ? "text-white font-medium" : "text-slate-200"
                        }`}>
                          {locale === "ar" ? opt.text_ar : opt.text_fr}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Metacognitive Confidence Prompt */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
                    <Brain className="h-4 w-4 text-cyan-400" />
                    <span>
                      {locale === "ar"
                        ? "قبل ما نشوف النتيجة... قداش كنت واثق من إجابتك؟"
                        : t.mission.confidencePrompt}
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
                          className={`min-h-[48px] py-2 px-1 text-center rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/15 text-blue-300 font-bold shadow-sm"
                              : "border-slate-800 bg-[#162032]/70 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="text-sm font-bold leading-none">{lvl}</span>
                          <span className="text-[10px] leading-tight line-clamp-1">
                            {t.mission.confidenceLevels[lvl]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    size="lg"
                    fullWidth
                    disabled={!selectedOptionId || !confidenceRating}
                    onClick={mode === "practice" ? handlePracticeSubmit : handleRetestSubmit}
                  >
                    <span>{t.mission.submitAnswer}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP B1: Initial Practice Correct (Emerging Evidence)    */}
          {/* ------------------------------------------------------------- */}
          {mode === "practice_evaluated_correct" && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 border-emerald-500/40 bg-[#0d231b] shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {t.mission.positiveEvidenceTitle}
                      </h3>
                      <p className="text-xs text-emerald-300">{t.mission.correctMessage}</p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">
                    {t.mission.masteryStatusBadges.emerging}
                  </Badge>
                </div>

                {/* Confidence signal feedback */}
                {confidenceAnalysis && (
                  <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Brain className="h-4 w-4 text-emerald-400" />
                      <span>
                        {locale === "ar"
                          ? confidenceAnalysis.label_ar
                          : confidenceAnalysis.label_fr}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      {locale === "ar"
                        ? confidenceAnalysis.description_ar
                        : confidenceAnalysis.description_fr}
                    </p>
                  </div>
                )}

                {/* Positive Evidence Explanation */}
                <div className="p-4 rounded-xl bg-[#111827]/80 border border-emerald-500/30 text-xs sm:text-sm text-slate-200 space-y-2">
                  <div className="font-bold text-emerald-400">{t.mission.explanationTitle}</div>
                  <p className="leading-relaxed">
                    {locale === "ar"
                      ? activeQuestion.explanation_ar
                      : activeQuestion.explanation_fr}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111827]/60 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white">{t.mission.repairHintTitle}</div>
                  <p className="text-slate-300">
                    {locale === "ar"
                      ? activeQuestion.repairHint_ar
                      : activeQuestion.repairHint_fr}
                  </p>
                </div>

                {/* Honest evidence note */}
                <p className="text-xs text-slate-400 leading-relaxed bg-[#111827]/50 p-3 rounded-xl border border-slate-800">
                  {t.mission.positiveEvidenceDesc}
                </p>

                {/* Dual Action: Verify via Retest or Return to Roadmap */}
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => router.push("/roadmap")}
                  >
                    <BackArrow className="h-4 w-4" />
                    <span>{t.mission.returnToRoadmap}</span>
                  </Button>

                  <Button size="lg" fullWidth onClick={handleLaunchRetest}>
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>{t.mission.verifyRetestCta}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP B2: Error Lab Inline Diagnosis                      */}
          {/* ------------------------------------------------------------- */}
          {mode === "error_diagnosis" && activeErrorRecord && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 border-rose-900/60 bg-[#241217] shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {t.errorLab.diagnosisHeader}
                    </h3>
                    <p className="text-xs text-rose-300">{t.errorLab.diagnosisSub}</p>
                  </div>
                </div>

                {/* Recurring Error Alert Banner */}
                {activeErrorRecord.isRecurring && (
                  <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <Flame className="h-4 w-4 text-amber-400" />
                      <span>{t.errorLab.recurringBannerTitle}</span>
                    </div>
                    <p className="text-amber-200/90">{t.errorLab.recurringBannerDesc}</p>
                  </div>
                )}

                {/* Confidence signal chip */}
                {confidenceAnalysis && (
                  <div className="p-3 rounded-xl bg-[#111827]/80 border border-rose-900/40 text-xs text-slate-300 flex items-start gap-2">
                    <Brain className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">
                        {locale === "ar"
                          ? confidenceAnalysis.label_ar
                          : confidenceAnalysis.label_fr}
                      </strong>
                      <span className="text-slate-400">
                        {locale === "ar"
                          ? confidenceAnalysis.description_ar
                          : confidenceAnalysis.description_fr}
                      </span>
                    </div>
                  </div>
                )}

                {/* System Initial Inference Hint */}
                {activeErrorRecord.suspectedErrorType && (
                  <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-rose-900/40 text-xs text-slate-300 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">{t.errorLab.suggestedCauseHint}</span>
                    <Badge variant="warning" size="sm">
                      {t.errorLab.errorTypes[activeErrorRecord.suspectedErrorType] ||
                        activeErrorRecord.suspectedErrorType}
                    </Badge>
                  </div>
                )}

                {/* Attribution Selection Header */}
                <div className="space-y-3">
                  <div className="text-sm font-bold text-white">
                    {t.errorLab.diagnosisQuestion}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {errorOptions.map((opt) => {
                      const isSelected = selectedAttribution === opt.type;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => setSelectedAttribution(opt.type)}
                          className={`min-h-[48px] p-3.5 rounded-xl border-2 text-start transition-all flex items-center justify-between active:scale-[0.99] ${
                            isSelected
                              ? "border-rose-500 bg-rose-950/50 text-white font-bold shadow-md shadow-rose-900/20"
                              : "border-slate-800 bg-[#162032] hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <span className="text-xs sm:text-sm">
                            {locale === "ar" ? opt.label_ar : opt.label_fr}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="lg"
                    fullWidth
                    disabled={!selectedAttribution}
                    onClick={handleConfirmAttribution}
                  >
                    <span>{t.errorLab.confirmAttributionCta}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP B3: Adaptive Repair Action Guide                    */}
          {/* ------------------------------------------------------------- */}
          {mode === "error_repair" && activeErrorRecord && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 border-cyan-900/60 bg-[#0e212f] shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-cyan-900/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {t.errorLab.repairPlanHeader}
                      </h3>
                      <p className="text-xs text-cyan-300">{t.errorLab.repairPlanSub}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-bold"
                  >
                    5–10 min
                  </Badge>
                </div>

                {/* Adaptive Strategy Tailored to Error Type */}
                {adaptivePlan && (
                  <div className="p-4 rounded-xl bg-[#111827]/80 border border-cyan-900/50 space-y-3">
                    <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="h-4 w-4 text-cyan-400" />
                      <span>
                        {locale === "ar"
                          ? adaptivePlan.strategyTitle_ar
                          : adaptivePlan.strategyTitle_fr}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {(locale === "ar" ? adaptivePlan.steps_ar : adaptivePlan.steps_fr).map(
                        (st, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{st}</span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="p-2.5 rounded-lg bg-cyan-950/50 text-[11px] text-cyan-200 font-medium border border-cyan-900/50">
                      💡{" "}
                      {locale === "ar"
                        ? adaptivePlan.keyTakeaway_ar
                        : adaptivePlan.keyTakeaway_fr}
                    </div>
                  </div>
                )}

                {/* Skill-Specific Repair Steps */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t.errorLab.repairStepsTitle}
                  </div>
                  <div className="space-y-2">
                    {(locale === "ar" ? skill.repairSteps_ar : skill.repairSteps_fr).map(
                      (step, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 flex items-start gap-3"
                        >
                          <span className="h-5 w-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {step}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Detailed explanation of the missed question */}
                <div className="p-4 rounded-xl bg-[#111827]/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white">
                    {locale === "ar"
                      ? "الشرح التفصيلي للتمرين السابق:"
                      : "Correction détaillée de l'exercice précédent :"}
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    {locale === "ar"
                      ? activeQuestion.explanation_ar
                      : activeQuestion.explanation_fr}
                  </p>
                </div>

                <div className="pt-2">
                  <Button size="lg" fullWidth onClick={handleCompleteRepair}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t.errorLab.completeRepairCta}</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP B4: Repair Completed — Ready for Retest             */}
          {/* ------------------------------------------------------------- */}
          {mode === "repair_completed_ready_for_retest" && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 border-slate-800 bg-[#111827] shadow-xl text-center space-y-5">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {t.errorLab.repairCompletedNotice}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {locale === "ar"
                      ? "إعادة الاختبار هي الدليل الوحيد على أن الخلل قد عولج فعلاً. أجب الآن على تمرين مماثل بنفس الصعوبة."
                      : "Le re-test est la preuve tangible que la lacune est comblée. Résolvez maintenant un exercice équivalent."}
                  </p>
                </div>

                <div className="pt-3 max-w-sm mx-auto">
                  <Button size="lg" fullWidth onClick={handleLaunchRetest}>
                    <Sparkles className="h-4 w-4" />
                    <span>{t.errorLab.readyForRetestCta}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP C1: Mastery Achieved (Retest Passed!)               */}
          {/* ------------------------------------------------------------- */}
          {mode === "mastery_achieved" && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 border-2 border-emerald-500/60 bg-[#0d271f] shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        {t.mission.masteryAchievedTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-300">
                        {t.mission.masteryAchievedMessage}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="md">
                    {t.mission.masteryStatusBadges.demonstrated}
                  </Badge>
                </div>

                {/* Evidence breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#111827]/90 border border-slate-800 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">1. التشخيص</span>
                    <span className="text-xs font-semibold text-slate-200">
                      تم رصد وتحديد الخلل بدقة
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#111827]/90 border border-slate-800 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">2. المعالجة</span>
                    <span className="text-xs font-semibold text-slate-200">
                      تم إكمال خطوات الترميم
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#111827]/90 border border-emerald-500/40 text-center space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 block">
                      3. التمكن المثبت
                    </span>
                    <span className="text-xs font-semibold text-emerald-200">
                      اجتياز إعادة الاختبار بنجاح
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-[#111827]/80 border border-emerald-500/30 text-xs sm:text-sm text-slate-200 space-y-2">
                  <div className="font-bold text-emerald-400">{t.mission.explanationTitle}</div>
                  <p className="leading-relaxed">
                    {locale === "ar"
                      ? activeQuestion.explanation_ar
                      : activeQuestion.explanation_fr}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/roadmap" className="flex-1">
                    <Button size="lg" fullWidth>
                      <span>{t.mission.returnToRoadmap}</span>
                      <NextArrow className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/error-lab" className="flex-1">
                    <Button variant="outline" size="lg" fullWidth>
                      <BookOpen className="h-4 w-4" />
                      <span>{t.mission.viewErrorLab}</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP C2: Retest Failed (Cycle 1 of 2)                    */}
          {/* ------------------------------------------------------------- */}
          {mode === "retest_failed" && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 border-amber-900/60 bg-[#281c11] shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/30">
                      <RotateCcw className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {t.mission.retestFailedTitle}
                      </h3>
                      <p className="text-xs text-amber-300">{t.mission.retestFailedDesc}</p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">
                    {locale === "ar" ? "محاولة 1 من 2" : "Tentative 1 sur 2"}
                  </Badge>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-[#111827]/80 border border-amber-900/40 text-xs sm:text-sm text-slate-200 space-y-2">
                  <div className="font-bold text-amber-400">{t.mission.explanationTitle}</div>
                  <p className="leading-relaxed">
                    {locale === "ar"
                      ? activeQuestion.explanation_ar
                      : activeQuestion.explanation_fr}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" fullWidth onClick={() => setMode("error_repair")}>
                    <RotateCcw className="h-4 w-4" />
                    <span>{t.mission.retryRepairCta}</span>
                  </Button>
                  <Link href="/roadmap" className="flex-1">
                    <Button variant="outline" size="lg" fullWidth>
                      <BackArrow className="h-4 w-4" />
                      <span>{t.mission.returnToRoadmap}</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FLOW STEP C3: Needs More Work (Bounded to 2 Retests)          */}
          {/* ------------------------------------------------------------- */}
          {mode === "needs_more_work" && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 border-slate-800 bg-[#111827] shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-700 text-white flex items-center justify-center">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {t.mission.needsMoreWorkTitle}
                      </h3>
                      <p className="text-xs text-slate-400">{t.mission.needsMoreWorkDesc}</p>
                    </div>
                  </div>
                  <Badge variant="outline" size="sm">
                    {t.mission.masteryStatusBadges.not_yet}
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-[#162032] border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {locale === "ar"
                    ? "من الطبيعي أن تتطلب بعض المهارات وقتاً إضافياً للاستيعاب. بدلاً من استنزاف طاقتك في تكرار مستمر الآن، تم حفظ هذه النقطة في خريطتك وسنعود إليها بتمارين تدرجية لاحقاً."
                    : "Il est normal que certaines compétences demandent plus de temps. Plutôt que d'épuiser votre énergie dans des répétitions successives, cette notion est programmée pour révision ultérieure."}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/roadmap" className="flex-1">
                    <Button size="lg" fullWidth>
                      <span>{t.mission.returnToRoadmap}</span>
                      <NextArrow className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/error-lab" className="flex-1">
                    <Button variant="outline" size="lg" fullWidth>
                      <BookOpen className="h-4 w-4" />
                      <span>{t.mission.viewErrorLab}</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </Container>
      </div>
    </AppShell>
  );
}
