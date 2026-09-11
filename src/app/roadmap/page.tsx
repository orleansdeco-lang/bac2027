"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import { RoadVisualizer } from "@/components/ui/RoadVisualizer";
import { StrategicProfile, InitialGapResult, StrategicBottleneckAnalysis } from "@/types/onboarding";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { calculateInitialStrategicGap } from "@/lib/onboarding/gap";
import { detectStrategicBottleneck } from "@/lib/onboarding/bottleneck";
import { DiagnosticAnalysisResult } from "@/types/diagnostic";
import { loadDiagnosticResults } from "@/lib/diagnostic";
import { AdaptiveRoadmapState, QueuedMissionItem } from "@/types/roadmap";
import { getComputedAdaptiveRoadmap } from "@/lib/roadmap";
import {
  saveMission,
  setActiveMissionId,
} from "@/lib/mission";
import { getAllTopics, getSkillsForTopic } from "@/data/curriculum";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Target,
  Gauge,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  CheckCircle2,
  Brain,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Activity,
  Clock,
  ListOrdered,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function RoadmapPage() {
  const router = useRouter();
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const isRtl = direction === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [gapResult, setGapResult] = useState<InitialGapResult | null>(null);
  const [bottlenecks, setBottlenecks] = useState<StrategicBottleneckAnalysis | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticAnalysisResult | null>(null);
  const [roadmapState, setRoadmapState] = useState<AdaptiveRoadmapState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCurriculumMap, setShowCurriculumMap] = useState(false);

  useEffect(() => {
    const stored = getStrategicProfile();
    if (stored) {
      setProfile(stored);
      const gap = calculateInitialStrategicGap(stored);
      setGapResult(gap);
      const b = detectStrategicBottleneck(stored, gap);
      setBottlenecks(b);

      const diag = loadDiagnosticResults();
      if (diag) {
        setDiagnosticResults(diag);
      }

      // Authoritative Adaptive Roadmap Engine
      const computed = getComputedAdaptiveRoadmap();
      setRoadmapState(computed);
    }
    setIsLoaded(true);
  }, []);

  const handleStartMission = (missionId: string) => {
    setActiveMissionId(missionId);
    router.push(`/mission/${missionId}`);
  };

  if (!isLoaded) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-sm text-slate-400 font-medium">
            {isAr ? "جاري استرجاع خريطتك التكيفية..." : "Chargement de votre feuille de route..."}
          </div>
        </div>
      </AppShell>
    );
  }

  // Fallback: No profile found
  if (!profile) {
    return (
      <AppShell>
        <Container size="sm" className="py-16 text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-sans">
              {t.roadmap.noProfileTitle}
            </h1>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              {t.roadmap.noProfileDesc}
            </p>
          </div>
          <Link href="/onboarding" className="inline-block">
            <Button variant="primary" size="lg" className="font-bold">
              <span>{t.roadmap.startOnboardingCta}</span>
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
        </Container>
      </AppShell>
    );
  }

  const isEmpirical = diagnosticResults !== null;
  const nextMission = roadmapState?.nextMission;
  const rationale = roadmapState?.nextMissionRationale;

  return (
    <AppShell>
      {/* 1. Header Context Bar */}
      <div className="border-b border-slate-800/80 bg-[#0E1526]/80 py-4 sm:py-6">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight font-sans">
                  {t.roadmap.title}
                </h1>
                <Badge variant="primary" size="sm" className="font-mono text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/25">
                  {t.roadmap.roadmapConfidenceInitial}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                {t.roadmap.subtitle}
              </p>
            </div>

            {/* Quick Strategic Metrics Pill */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <div className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-[#111827] text-xs">
                <span className="text-slate-400 block text-[10px]">{t.roadmap.targetLabel}</span>
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {profile.targetScore ? profile.targetScore.toFixed(2) : "16.00"}/20
                </span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-[#111827] text-xs">
                <span className="text-slate-400 block text-[10px]">
                  {isEmpirical ? t.roadmap.levelSourceObserved : t.roadmap.levelSourceEstimate}
                </span>
                <span className="font-bold text-slate-200 font-mono text-sm">
                  {gapResult ? gapResult.estimatedBaselineScore.toFixed(1) : "12.0"}/20
                </span>
              </div>

              {gapResult && (
                <div className="px-3.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
                  <span className="text-blue-300 block text-[10px]">{t.roadmap.gapLabel}</span>
                  <span className="font-bold text-blue-400 font-mono text-sm">
                    +{gapResult.approximateGap.toFixed(1)} {t.roadmap.gapUnit}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Main Roadmap Flow */}
      <Container size="md" className="py-6 sm:py-10 space-y-8 sm:space-y-10">

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 1: NOW — THE HIGHEST PRIORITY MISSION                     */}
        {/* ----------------------------------------------------------------- */}
        <section id="now" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>{t.roadmap.currentMissionBadge}</span>
            </span>
            {nextMission && (
              <Badge
                variant={
                  nextMission.status === "repair_needed"
                    ? "danger"
                    : nextMission.status === "retest_ready"
                    ? "warning"
                    : nextMission.status === "in_progress"
                    ? "warning"
                    : "primary"
                }
                size="sm"
              >
                {nextMission.status === "repair_needed"
                  ? (locale === "ar" ? "عندك خطأ يحتاج إصلاح" : "repair_needed")
                  : nextMission.status === "retest_ready"
                  ? (locale === "ar" ? "جاهزة لإعادة الاختبار" : "Prêt pour le retest")
                  : nextMission.status === "in_progress"
                  ? (locale === "ar" ? "في طور التحسن" : "En progression")
                  : (locale === "ar" ? "متاحة للبدء" : "Disponible")}
              </Badge>
            )}
          </div>

          <Card className="p-5 sm:p-7 border-2 border-blue-500/50 bg-gradient-to-br from-[#162238] via-[#111827] to-[#111827] shadow-xl shadow-blue-950/40 space-y-5">
            {nextMission ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-blue-400">
                      {nextMission.subjectId === "math" ? (isAr ? "الرياضيات" : "Mathématiques")
                        : nextMission.subjectId === "physics" ? (isAr ? "العلوم الفيزيائية" : "Physique-Chimie")
                        : (isAr ? "علوم الطبيعة والحياة" : "Sciences de la Nature et de la Vie")}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight font-sans">
                      {locale === "ar" ? nextMission.title_ar : nextMission.title_fr}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1 shrink-0 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{nextMission.estimatedMinutes || 15} min</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {locale === "ar" ? nextMission.description_ar : nextMission.description_fr}
                </p>

                {/* Structured Transparent Rationale */}
                {rationale && (
                  <div className="p-4 rounded-xl bg-[#0B1020]/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-blue-300 flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-blue-400" />
                        <span>{t.roadmap.whyThisMission}</span>
                      </div>
                      <Badge variant="outline" size="sm" className="bg-[#111827] border-blue-500/30 text-blue-300 font-bold">
                        {locale === "ar" ? rationale.reasonLabel_ar : rationale.reasonLabel_fr}
                      </Badge>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {locale === "ar" ? rationale.shortExplanation_ar : rationale.shortExplanation_fr}
                    </p>
                  </div>
                )}

                {/* Action CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => handleStartMission(nextMission.id)}
                    className="font-bold shadow-lg shadow-blue-600/30"
                  >
                    <span>{t.roadmap.startCurrentMissionCta}</span>
                    <Arrow className="h-4 w-4" />
                  </Button>

                  {nextMission.status === "repair_needed" && (
                    <Link href="/error-lab" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800">
                        <span>{t.roadmap.errorLabLinkCta}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-slate-100 text-base">
                  {t.roadmap.noMissionsLeft}
                </h3>
              </div>
            )}
          </Card>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 2: MAP — 4-STAGE LEARNING PROGRESSION                     */}
        {/* ----------------------------------------------------------------- */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            {t.roadmap.mapTitle}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { key: "fix", stage: t.roadmap.stages.fix, num: "01", active: nextMission?.status === "repair_needed" },
              { key: "verify", stage: t.roadmap.stages.verify, num: "02", active: nextMission?.status === "retest_ready" },
              { key: "demonstrate", stage: t.roadmap.stages.demonstrate, num: "03", active: nextMission?.status === "in_progress" },
              { key: "move_forward", stage: t.roadmap.stages.move_forward, num: "04", active: nextMission?.status === "available" },
            ].map((step) => (
              <div
                key={step.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  step.active
                    ? "border-blue-500 bg-[#162238] shadow-md shadow-blue-950/40"
                    : "border-slate-800/80 bg-[#111827]/70"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold ${step.active ? "text-blue-400" : "text-slate-500"}`}>
                    STAGE {step.num}
                  </span>
                  {step.active && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />}
                </div>
                <h4 className={`text-xs font-bold ${step.active ? "text-slate-100" : "text-slate-300"}`}>
                  {step.stage.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {step.stage.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 3: NEXT — UPCOMING QUEUED MISSIONS                        */}
        {/* ----------------------------------------------------------------- */}
        {roadmapState && roadmapState.queuedMissions.length > 0 && (
          <section className="space-y-3">
            <div className="px-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <ListOrdered className="h-4 w-4 text-blue-400" />
                <span>{t.roadmap.nextTitle}</span>
              </h3>
              <p className="text-xs text-slate-400">{t.roadmap.nextSubtitle}</p>
            </div>

            <div className="space-y-2.5">
              {roadmapState.queuedMissions.slice(0, 3).map((item: QueuedMissionItem, idx: number) => (
                <div
                  key={item.mission.id}
                  className="p-4 rounded-2xl border border-slate-800 bg-[#111827] hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-200 text-xs sm:text-sm truncate">
                        {locale === "ar" ? item.mission.title_ar : item.mission.title_fr}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-md">
                      {locale === "ar" ? item.rationale.reasonLabel_ar : item.rationale.reasonLabel_fr}
                    </p>
                  </div>

                  <Badge variant="outline" size="sm" className="shrink-0 text-[10px] border-slate-700 text-slate-400">
                    {t.roadmap.queuedBadge}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 4: PROGRESS — SKILLS & CURRICULUM COVERAGE                */}
        {/* ----------------------------------------------------------------- */}
        <section id="progress" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              <span>{t.roadmap.progressTitle}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {profile.streamId === "sciences_exp" ? (locale === "ar" ? "شعبة علوم تجريبية" : "Sciences Expérimentales") : profile.streamId}
            </span>
          </div>

          {/* Categorized Skills Status Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="p-3 border-emerald-500/30 bg-emerald-500/5 text-center space-y-0.5">
              <span className="text-xl font-black text-emerald-400 font-mono">
                {roadmapState?.masteredSkills.length || 0}
              </span>
              <span className="text-[11px] font-bold text-emerald-300 block">
                {t.roadmap.categories.demonstrated || (locale === "ar" ? "✓ تم إثبات التحكم" : "Maîtrise démontrée")}
              </span>
            </Card>

            <Card className="p-3 border-sky-500/30 bg-sky-500/5 text-center space-y-0.5">
              <span className="text-xl font-black text-sky-400 font-mono">
                {roadmapState?.emergingSkills.length || 0}
              </span>
              <span className="text-[11px] font-bold text-sky-300 block">
                {t.roadmap.categories.emerging}
              </span>
            </Card>

            <Card className="p-3 border-amber-500/30 bg-amber-500/5 text-center space-y-0.5">
              <span className="text-xl font-black text-amber-400 font-mono">
                {roadmapState?.needsMoreWorkSkills.length || 0}
              </span>
              <span className="text-[11px] font-bold text-amber-300 block">
                {t.roadmap.categories.needs_work || (locale === "ar" ? "تحتاج إلى عمل إضافي" : "needs_more_work")}
              </span>
            </Card>

            <Card className="p-3 border-rose-500/30 bg-rose-500/5 text-center space-y-0.5">
              <span className="text-xl font-black text-rose-400 font-mono">
                {roadmapState?.unresolvedErrors.length || 0}
              </span>
              <span className="text-[11px] font-bold text-rose-300 block">
                {locale === "ar" ? "أخطاء قيد الترميم" : "Erreurs ouvertes"}
              </span>
            </Card>
          </div>

          {/* Stream Subjects Table/Grid */}
          {roadmapState && (
            <Card className="p-4 sm:p-5 border-slate-800 bg-[#111827] space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.roadmap.pilotCoverageNotice}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.values(roadmapState.subjectProgress)
                  .filter((sp) => sp.evidenceLevel === "pilot_evidence")
                  .map((sp) => (
                    <div
                      key={sp.subjectId}
                      className="p-3.5 rounded-xl border border-slate-800 bg-[#0B1020]/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">
                          {locale === "ar" ? sp.name_ar : sp.name_fr}
                        </span>
                        <Badge variant="outline" size="sm" className="font-mono text-[10px] text-slate-400 border-slate-700">
                          Coef {sp.coefficient}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>{t.roadmap.categories.demonstrated}:</span>
                          <span className="font-bold text-emerald-400">{sp.demonstratedCount}/{sp.totalPilotSkills}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{locale === "ar" ? "أخطاء قيد الترميم:" : "Erreurs :"}</span>
                          <span className={`font-bold ${sp.openErrorsCount > 0 ? "text-rose-400" : "text-slate-400"}`}>
                            {sp.openErrorsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Untested subjects disclosure */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{locale === "ar" ? "بقية مواد الشعبة (الأدبية والمشتركة):" : "Autres matières de la filière :"}</span>
                <Badge variant="outline" size="sm" className="text-slate-500 border-slate-800 bg-[#0B1020]">
                  {t.roadmap.categories.not_assessed}
                </Badge>
              </div>

              {/* Collapsible Expanded Curriculum Learning Map */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCurriculumMap(!showCurriculumMap)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-[#0B1020]/80 hover:bg-slate-800/60 transition-colors flex items-center justify-between text-xs font-semibold text-slate-300 cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                    <span>{t.roadmap.curriculumMapTitle || (locale === "ar" ? "خريطة المنهاج الموسعة (Sciences Expérimentales)" : "Carte d'apprentissage du programme")}</span>
                    <Badge variant="outline" size="sm" className="bg-blue-500/10 text-blue-300 border-blue-500/25 font-mono text-[10px]">
                      14 {locale === "ar" ? "محور" : "chapitres"} · 31 {locale === "ar" ? "مهارة" : "compétences"}
                    </Badge>
                  </div>
                  <span className="text-slate-500 text-xs">
                    {showCurriculumMap ? "▲" : "▼"}
                  </span>
                </button>

                {showCurriculumMap && (
                  <div className="mt-3 space-y-4 p-4 rounded-2xl border border-slate-800 bg-[#0B1020]/50 animate-in fade-in-50">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.roadmap.curriculumMapSubtitle || (locale === "ar" ? "استكشف 31 مهارة و14 محوراً دراسياً في المواد الأساسية الثلاث، مع تتبع حالة كل كفاءة." : "Explorez les 31 compétences et 14 chapitres.")}
                    </p>

                    {(["math", "physics", "natural_sciences"] as const).map((subjId) => {
                      const subjTopics = getAllTopics().filter((t) => t.subjectId === subjId);
                      const subjName = subjId === "math" ? (locale === "ar" ? "الرياضيات" : "Mathématiques")
                        : subjId === "physics" ? (locale === "ar" ? "العلوم الفيزيائية" : "Physique-Chimie")
                        : (locale === "ar" ? "علوم الطبيعة والحياة" : "Sciences de la Nature et de la Vie");

                      return (
                        <div key={subjId} className="space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                              {subjName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {subjTopics.length} {locale === "ar" ? "محاور" : "chapitres"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {subjTopics.map((topic) => {
                              const skills = getSkillsForTopic(topic.id);
                              return (
                                <div key={topic.id} className="p-3 rounded-xl border border-slate-800/80 bg-[#111827] space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-200">
                                      {locale === "ar" ? topic.title_ar : topic.title_fr}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {skills.length} {locale === "ar" ? "مهارات" : "compétences"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {skills.map((skill) => {
                                      const isMastered = roadmapState?.masteredSkills.some((s) => s.skillId === skill.id);
                                      const isEmerging = roadmapState?.emergingSkills.some((s) => s.skillId === skill.id);
                                      const isNeedsWork = roadmapState?.needsMoreWorkSkills.some((s) => s.skillId === skill.id);
                                      const isUnresolved = roadmapState?.unresolvedErrors.some((e) => e.skillId === skill.id);

                                      let statusBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                          {locale === "ar" ? "غير مقيّمة بعد" : "Non évaluée"}
                                        </span>
                                      );

                                      if (isMastered) {
                                        statusBadge = (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                            ✓ {locale === "ar" ? "تم إثباتها" : "Démontrée"}
                                          </span>
                                        );
                                      } else if (isUnresolved) {
                                        statusBadge = (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                                            ⚠ {locale === "ar" ? "قيد الترميم" : "En réparation"}
                                          </span>
                                        );
                                      } else if (isNeedsWork) {
                                        statusBadge = (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                            ↺ {locale === "ar" ? "عمل إضافي" : "À réviser"}
                                          </span>
                                        );
                                      } else if (isEmerging) {
                                        statusBadge = (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/25">
                                            ↑ {locale === "ar" ? "ناشئة" : "Émergente"}
                                          </span>
                                        );
                                      }

                                      return (
                                        <div
                                          key={skill.id}
                                          className="p-2 rounded-lg border border-slate-800 bg-[#0B1020]/60 flex items-center justify-between gap-2 text-xs"
                                        >
                                          <div className="min-w-0 flex-1">
                                            <p className="font-medium text-slate-200 truncate text-[11px]">
                                              {locale === "ar" ? skill.title_ar : skill.title_fr}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                              <span>{"★".repeat(skill.difficulty)}{"☆".repeat(3 - skill.difficulty)}</span>
                                              {skill.prerequisites && skill.prerequisites.length > 0 && (
                                                <span>· {skill.prerequisites.length} {locale === "ar" ? "متطلب" : "prérequis"}</span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="shrink-0">{statusBadge}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 5: LIMITATIONS & TRANSPARENCY NOTICE                     */}
        {/* ----------------------------------------------------------------- */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <Info className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{t.roadmap.limitationsTitle}</span>
          </div>
          <p className="leading-relaxed text-amber-200/90 font-sans">
            {roadmapState ? (locale === "ar" ? roadmapState.limitations.ar : roadmapState.limitations.fr) : t.roadmap.limitationsText}
          </p>
        </div>

        {/* Secondary Navigation Links */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          {isEmpirical ? (
            <>
              <Link href="/diagnostic/results" className="text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{t.roadmap.viewDiagnosticResultsCta}</span>
              </Link>
              <Link href="/diagnostic" className="text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{locale === "ar" ? "إعادة التشخيص الأكاديمي" : "Repasser le diagnostic"}</span>
              </Link>
            </>
          ) : (
            <Link href="/diagnostic" className="text-blue-400 hover:underline flex items-center gap-1 font-semibold">
              <Play className="h-3.5 w-3.5" />
              <span>{t.roadmap.startDiagnosticCta}</span>
            </Link>
          )}
          <Link href="/error-lab" className="text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1">
            <span>{t.roadmap.errorLabLinkCta}</span>
          </Link>
        </div>

      </Container>
    </AppShell>
  );
}
