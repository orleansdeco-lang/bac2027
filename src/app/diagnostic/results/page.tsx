"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Brain,
  ShieldAlert,
  Target,
  Flame,
  TrendingUp,
  BarChart3,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  DiagnosticAnalysisResult,
  SubjectDiagnosticScore,
  DiagnosticDimension,
} from "@/types/diagnostic";
import { loadDiagnosticResults } from "@/lib/diagnostic";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { getStrategicProfile, saveStrategicProfile } from "@/lib/onboarding/profile";

export default function DiagnosticResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale, direction } = useTranslation();
  const isRtl = direction === "rtl";
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;

  const [hasLoaded, setHasLoaded] = useState(false);
  const [results, setResults] = useState<DiagnosticAnalysisResult | null>(null);

  useEffect(() => {
    const data = loadDiagnosticResults();
    if (data) {
      setResults(data);
    }
    setHasLoaded(true);
  }, []);

  const handleUpdateRoadmap = () => {
    if (!results) return;

    try {
      const effectiveUserId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id : undefined);
      if (effectiveUserId) {
        StudentService.getProfile(effectiveUserId).then((profile) => {
          if (profile) {
            const prof = profile as any;
            prof.levelSource = "diagnostic_observed";
            const signalScore = results.coreDiagnosticSignal || results.observedDiagnosticScore;
            prof.observedDiagnosticScore = signalScore;
            prof.estimatedBaselineScore = Math.round((signalScore / 5) * 10) / 10;
            prof.approximateGap = Math.max(
              0,
              Math.round(((prof.targetScore || 16.0) - prof.estimatedBaselineScore) * 10) / 10
            );
            prof.testedSubjectScores = results.subjectScores;
            saveStrategicProfile(prof, effectiveUserId);
            StudentService.saveProfile(prof, effectiveUserId).catch(console.error);
          }
        });
      }
    } catch (e) {
      console.error("Error updating profile from diagnostic results", e);
    }

    router.push("/roadmap");
  };

  if (!hasLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1020]">
        <div className="animate-pulse text-sm text-blue-400 font-mono tracking-wider">
          BAC MASTERY...
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <AppShell activeNav="roadmap">
        <div className="py-20 flex-1 flex items-center">
          <Container size="sm" className="text-center space-y-4">
            <h1 className="text-xl font-bold text-white">
              {locale === "ar" ? "لم يتم إجراء التشخيص بعد" : "Aucun résultat de diagnostic"}
            </h1>
            <p className="text-sm text-slate-400">
              {locale === "ar"
                ? "يرجى بدء جلسة التشخيص للحصول على قياس ميداني حقيقي لمهاراتك وأفخاخك المفاهيمية."
                : "Veuillez passer le diagnostic pour mesurer vos compétences réelles et révéler vos angles morts."}
            </p>
            <div className="pt-2">
              <Link href="/diagnostic">
                <Button size="md">
                  <span>{t.diagnostic.startCta}</span>
                  <NextArrow className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Container>
        </div>
      </AppShell>
    );
  }

  const subjectNames: Record<string, { ar: string; fr: string }> = {
    math: { ar: "الرياضيات", fr: "Mathématiques" },
    physics: { ar: "الفيزياء والكيمياء", fr: "Physique-Chimie" },
    natural_sciences: { ar: "علوم الطبيعة والحياة", fr: "Sciences Naturelles" },
  };

  const dimensionNames: Record<DiagnosticDimension, { ar: string; fr: string }> = {
    knowledge: { ar: "استرجاع المعارف", fr: "Connaissances" },
    understanding: { ar: "الفهم والتعليل", fr: "Compréhension" },
    application: { ar: "التطبيق والحساب", fr: "Application" },
    methodology: { ar: "المنهجية المعتمدة", fr: "Méthodologie" },
    speed: { ar: "إدارة الوقت", fr: "Vitesse" },
    confidence: { ar: "ثقة التلميذ", fr: "Confiance" },
  };

  const calibrationBadgeVariant =
    results.calibration?.category === "well_calibrated"
      ? "success"
      : results.calibration?.category === "uncalibrated_severe"
      ? "danger"
      : "warning";

  const bottleneckSeverityVariant =
    results.primaryBottleneck?.severity === "critical"
      ? "danger"
      : results.primaryBottleneck?.severity === "high"
      ? "warning"
      : "default";

  return (
    <AppShell activeNav="roadmap">
      <div className="py-6 sm:py-10">
        <Container size="md" className="space-y-6">
          {/* Header Banner */}
          <div className="space-y-2 text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>{t.diagnostic.phaseBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.diagnostic.results.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t.diagnostic.results.subtitle}
            </p>
          </div>

          {/* Mandatory Disclaimers Banner */}
          <div className="p-4 rounded-2xl bg-[#281c11] border border-amber-500/40 text-amber-200 flex gap-3.5 items-start shadow-md">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-white">
                {t.diagnostic.results.mandatoryDisclaimer}
              </div>
              <div className="text-amber-200/90 leading-relaxed text-[11px] sm:text-xs">
                {t.diagnostic.results.coreSignalDisclaimer}
              </div>
            </div>
          </div>

          {/* 1. Hero Card: Core Diagnostic Signal */}
          <Card className="p-6 bg-[#111827] border-slate-800 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t.diagnostic.results.coreSignalLabel}
              </span>
              <Badge variant="primary" size="sm">
                {t.diagnostic.results.coverageNotice} ({results.totalQuestions} {locale === "ar" ? "سؤالاً" : "questions"})
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                {results.coreDiagnosticSignal || results.observedDiagnosticScore}%
              </div>
              <div className="text-xs text-slate-400">
                ({Math.round((results.overallAccuracy * results.totalQuestions) / 100)} / {results.totalQuestions} {locale === "ar" ? "إجابة صحيحة" : "correctes"})
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#162032] border border-slate-800 text-xs sm:text-sm font-medium text-slate-200">
              {locale === "ar" ? results.observedDiagnosticBand_ar : results.observedDiagnosticBand_fr}
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2.5 leading-relaxed">
              {t.diagnostic.results.coreSignalDisclaimer}
            </div>
          </Card>

          {/* 2. Metacognitive Confidence Calibration */}
          <Card className="p-5 sm:p-6 bg-[#111827] border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-bold text-white">
                  {t.diagnostic.results.calibrationTitle}
                </span>
              </div>
              <Badge variant={calibrationBadgeVariant} size="sm">
                {results.calibration.category === "well_calibrated"
                  ? locale === "ar" ? "معايرة متزنة" : "Bien calibré"
                  : results.calibration.category === "uncalibrated_severe"
                  ? locale === "ar" ? "أفخاخ حرجة" : "Pièges critiques"
                  : results.calibration.category === "overconfident"
                  ? locale === "ar" ? "ثقة زائدة" : "Surconfiance"
                  : locale === "ar" ? "تردد غير مبرر" : "Sous-estimation"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-[#162032] border border-slate-800">
                <div className="text-xs text-slate-400">
                  {locale === "ar" ? "أخطاء مع ثقة عالية (أفخاخ محتملة)" : "Erreurs à haute confiance"}
                </div>
                <div className={`text-xl font-bold mt-1 font-mono ${results.calibration.highConfidenceWrongCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {results.calibration.highConfidenceWrongCount}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#162032] border border-slate-800">
                <div className="text-xs text-slate-400">
                  {locale === "ar" ? "إجابات صحيحة مع تردد" : "Succès avec faible certitude"}
                </div>
                <div className="text-xl font-bold mt-1 text-amber-400 font-mono">
                  {results.calibration.lowConfidenceCorrectCount}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#162032] p-3.5 rounded-xl border border-slate-800">
              {locale === "ar" ? results.calibration.summary_ar : results.calibration.summary_fr}
            </p>
          </Card>

          {/* 3. Discrepancy: Self-estimate vs Observed Signal */}
          <Card className="p-5 sm:p-6 bg-[#111827] border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <span>{t.diagnostic.results.discrepancyTitle}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm py-2 border-y border-slate-800">
              <div>
                <span className="text-slate-400">{locale === "ar" ? "تقديرك الذاتي السابق:" : "Auto-évaluation :"}</span>{" "}
                <strong className="text-white font-mono">{results.selfEstimateScore}/20</strong>
              </div>
              <div>
                <span className="text-slate-400">{t.diagnostic.results.observedScoreLabel}:</span>{" "}
                <strong className="text-blue-400 font-mono font-extrabold">{results.coreDiagnosticSignal || results.observedDiagnosticScore}%</strong>
              </div>
              <div>
                <Badge
                  variant={results.estimationDiscrepancy === "aligned" ? "success" : "warning"}
                  size="sm"
                >
                  {results.estimationDiscrepancy === "aligned"
                    ? locale === "ar" ? "متقارب" : "Cohérent"
                    : results.estimationDiscrepancy === "overestimated"
                    ? locale === "ar" ? `أعلى من الأداء (+${results.deltaFromEstimate})` : `Surévalué (+${results.deltaFromEstimate})`
                    : locale === "ar" ? `أقل من الأداء (${results.deltaFromEstimate})` : `Sous-évalué (${results.deltaFromEstimate})`}
                </Badge>
              </div>
            </div>
            {(results.discrepancyNote_ar || results.discrepancyNote_fr) && (
              <p className="text-xs text-slate-300 leading-relaxed bg-[#162032] p-3 rounded-xl border border-slate-800">
                {locale === "ar" ? results.discrepancyNote_ar : results.discrepancyNote_fr}
              </p>
            )}
          </Card>

          {/* 4. Misconception Traps Section */}
          <Card className="p-5 sm:p-6 bg-[#111827] border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span className="text-sm font-bold text-white">
                  {t.diagnostic.results.misconceptionsTitle}
                </span>
              </div>
              <Badge
                variant={(results.misconceptionTraps?.length || 0) > 0 ? "danger" : "success"}
                size="sm"
              >
                {results.misconceptionTraps?.length || 0} {locale === "ar" ? "إشارات محتملة" : "signaux détectés"}
              </Badge>
            </div>

            {(results.misconceptionTraps?.length || 0) === 0 ? (
              <div className="p-4 rounded-xl bg-[#0d271f] border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{t.diagnostic.results.noMisconceptions}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {results.misconceptionTraps?.map((trap, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#241217] border border-rose-900/60 space-y-1.5 text-xs text-rose-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-white">{locale === "ar" ? trap.topic_ar : trap.topic_fr}</span>
                        {trap.trapDetails?.suspectedErrorType && (
                          <Badge variant="outline" size="sm" className="text-[10px] py-0 bg-[#111827] border-rose-800 text-rose-300">
                            {trap.trapDetails.suspectedErrorType}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-rose-300 bg-[#111827] px-2 py-0.5 rounded border border-rose-900/60">
                        {locale === "ar" ? `ثقة التلميذ: ${trap.confidenceRating}/5` : `Certitude : ${trap.confidenceRating}/5`}
                      </span>
                    </div>
                    <div className="text-rose-200/90 leading-relaxed text-[12px]">
                      {locale === "ar" ? trap.trapDetails?.description_ar : trap.trapDetails?.description_fr}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 5. Primary Preliminary Bottleneck Candidate */}
          {results.primaryBottleneck && (
            <Card className="p-5 sm:p-6 bg-[#281c11] border border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-bold text-white">
                    {t.diagnostic.results.bottleneckTitle}
                  </span>
                </div>
                <Badge variant={bottleneckSeverityVariant} size="sm">
                  {locale === "ar" ? "مرشح أولي" : "Candidat initial"}
                </Badge>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827]/80 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                {t.diagnostic.results.bottleneckCandidateNotice}
              </div>

              <div className="text-base font-bold text-white">
                {locale === "ar" ? results.primaryBottleneck.title_ar : results.primaryBottleneck.title_fr}
              </div>

              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                {locale === "ar" ? results.primaryBottleneck.rationale_ar : results.primaryBottleneck.rationale_fr}
              </p>
            </Card>
          )}

          {/* 6. First Recommended Mission */}
          {results.firstRecommendedMission && (
            <Card className="p-5 sm:p-6 bg-[#0d271f] border border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    {t.diagnostic.results.missionTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-300 font-semibold">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{results.firstRecommendedMission.estimatedMinutes} {locale === "ar" ? "دقيقة" : "min"}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {locale === "ar" ? results.firstRecommendedMission.title_ar : results.firstRecommendedMission.title_fr}
                </h3>
                <p className="text-xs text-emerald-300 mt-1">
                  {locale === "ar" ? results.firstRecommendedMission.focusTopic_ar : results.firstRecommendedMission.focusTopic_fr}
                </p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-200 pt-1">
                {(locale === "ar"
                  ? results.firstRecommendedMission.actionSteps_ar
                  : results.firstRecommendedMission.actionSteps_fr
                ).map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button size="lg" fullWidth onClick={handleUpdateRoadmap}>
                  <span>{t.diagnostic.results.updateRoadmapCta}</span>
                  <NextArrow className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* 7. Subject & Dimension Breakdown */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Subject qualitative signal breakdown */}
            <Card className="p-4 sm:p-5 bg-[#111827] border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span>{t.diagnostic.results.subjectBreakdownTitle}</span>
              </div>

              <div className="space-y-3">
                {Object.entries(results.subjectScores).map(([subId, score]) => {
                  if (!score) return null;
                  const sName = subjectNames[subId] || { ar: subId, fr: subId };
                  const bandText = locale === "ar" ? score.signalBand_ar : score.signalBand_fr;
                  return (
                    <div key={subId} className="space-y-1 p-2.5 rounded-xl bg-[#162032] border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">
                          {locale === "ar" ? sName.ar : sName.fr} (معامل {score.coefficient})
                        </span>
                        <Badge variant="primary" size="sm">
                          {bandText}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{score.observedRange || `${score.accuracyPercentage}%`}</span>
                        <span>{score.questionCount ?? score.totalQuestions} {locale === "ar" ? "أسئلة مصوبة" : "questions"}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${score.accuracyPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Cognitive dimension breakdown */}
            <Card className="p-4 sm:p-5 bg-[#111827] border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Brain className="h-4 w-4 text-cyan-400" />
                <span>{t.diagnostic.results.dimensionsBreakdownTitle}</span>
              </div>

              <div className="space-y-3">
                {Object.entries(results.dimensionScores).map(([dimKey, dimScore]) => {
                  const dName = dimensionNames[dimKey as DiagnosticDimension] || { ar: dimKey, fr: dimKey };
                  const qCount = results.dimensionQuestionCounts?.[dimKey as DiagnosticDimension];
                  const percentage = typeof dimScore === "number" ? dimScore : typeof dimScore === "object" && dimScore !== null ? (dimScore as any).percentage ?? 0 : 0;
                  return (
                    <div key={dimKey} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          {locale === "ar" ? dName.ar : dName.fr}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {qCount !== undefined && (
                            <span className="text-[10px] text-slate-500">({qCount} {locale === "ar" ? "أسئلة" : "q"})</span>
                          )}
                          <span className="font-bold text-white font-mono">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Action links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Link href="/diagnostic" className="w-full sm:w-auto">
              <Button variant="outline" size="md" fullWidth>
                <RotateCcw className="h-4 w-4" />
                <span>{t.diagnostic.results.retakeCta}</span>
              </Button>
            </Link>

            <Link href="/roadmap" className="w-full sm:w-auto">
              <Button size="md" fullWidth>
                <span>{t.diagnostic.returnCta}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    </AppShell>
  );
}
