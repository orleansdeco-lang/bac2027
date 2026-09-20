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
import { calculateInitialStrategicGap } from "@/lib/onboarding/gap";
import { detectStrategicBottleneck } from "@/lib/onboarding/bottleneck";
import { DiagnosticAnalysisResult } from "@/types/diagnostic";
import { loadDiagnosticResults } from "@/lib/diagnostic";
import { useAuth } from "@/lib/auth/context";
import {
  StudentRepository,
  DiagnosticRepository,
  MissionRepository,
  ErrorRepository,
  MasteryRepository,
} from "@/lib/repositories";
import { AdaptiveRoadmapState, QueuedMissionItem } from "@/types/roadmap";
import { buildAdaptiveRoadmap } from "@/lib/roadmap";
import { setActiveMissionId } from "@/lib/mission";
import { trackEvent } from "@/lib/analytics";
import { getAllTopics, getSkillsForTopic } from "@/data/curriculum";
import { getSkillsForSubject } from "@/data/skills";
import { useLearningAccessGate } from "@/lib/hooks";
import {
  normalizeStreamIdWithDefault,
  getStreamMetadata,
} from "@/lib/curriculum/filter";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Target,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Brain,
  BarChart3,
  BookOpen,
  Clock,
  ListOrdered,
  Map,
  Lock,
} from "lucide-react";

export default function RoadmapPage() {
  const router = useRouter();
  const gate = useLearningAccessGate();
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const isRtl = direction === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [gapResult, setGapResult] = useState<InitialGapResult | null>(null);
  const [bottlenecks, setBottlenecks] = useState<StrategicBottleneckAnalysis | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticAnalysisResult | null>(null);
  const [roadmapState, setRoadmapState] = useState<AdaptiveRoadmapState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCurriculumMap, setShowCurriculumMap] = useState(false);

  useEffect(() => {
    async function loadRoadmap() {
      if (!gate.isAuthorized || !gate.profile) return;
      try {
        const stored = gate.profile;
        const gap = calculateInitialStrategicGap(stored as any);
        setGapResult(gap);
        const b = detectStrategicBottleneck(stored as any, gap);
        setBottlenecks(b);

        const diag = await DiagnosticRepository.getResults(stored.id);
        if (diag) {
          setDiagnosticResults(diag);
        }

        const [missions, errors, mastery] = await Promise.all([
          MissionRepository.getMissions(stored.id),
          ErrorRepository.getErrors(stored.id),
          MasteryRepository.getMasteryRecords(stored.id),
        ]);

        const computed = buildAdaptiveRoadmap({
          onboardingProfile: stored as any,
          diagnosticResult: diag,
          missions: missions,
          masteryEvidence: mastery,
          errors: Object.values(errors),
          energyState: stored.studyEnergy,
        });
        setRoadmapState(computed);
        trackEvent("roadmap_viewed", {
          streamId: stored.streamId,
          hasDiagnostic: Boolean(diag),
          totalMissions: computed.queuedMissions.length,
        });
      } catch (err) {
        console.error("Error loading roadmap state:", err);
      } finally {
        setIsLoaded(true);
      }
    }

    if (gate.isAuthorized) {
      loadRoadmap();
    } else if (!gate.isLoading) {
      setIsLoaded(true);
    }
  }, [gate.isAuthorized, gate.isLoading, gate.profile]);

  const handleStartMission = (missionId: string) => {
    trackEvent("roadmap_mission_selected", { missionId });
    setActiveMissionId(missionId);
    router.push(`/mission/${missionId}`);
  };

  if (gate.isLoading || !isLoaded) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-sm text-theme-muted font-medium">
            {isAr ? "جاري استرجاع خريطتك التعليمية..." : "Chargement de votre feuille de route..."}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!gate.isAuthorized || !gate.profile) {
    return null;
  }

  if (!gate.hasPremiumAccess) {
    return (
      <AppShell activeNav="roadmap">
        <Container size="sm" className="py-12 sm:py-16 text-center space-y-6" dir="rtl">
          <div data-testid="roadmap-trial-expired-gate" className="p-6 sm:p-8 rounded-3xl bg-card border border-theme space-y-5 shadow-clay animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-theme-text font-sans">
                مسارك مازال محفوظ. فعّل اشتراكك باش تكمل
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed max-w-md mx-auto font-sans">
                انتهت فترة التجربة المجانية (7 أيام). خريطتك التعليمية وتشخيص نقاط ضعفك محفوظة بدقة. فعّل اشتراكك الآن لمواصلة مسارك نحو البكالوريا.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/subscribe" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" fullWidth className="font-bold text-sm shadow-clay">
                  <span>كمّل مع الشاطر</span>
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" fullWidth className="text-xs">
                  <span>العودة للوحة التحكم</span>
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </AppShell>
    );
  }

  const profile = gate.profile;
  const streamId = normalizeStreamIdWithDefault(profile.streamId || (profile as any)?.stream, "sciences_exp");
  const streamMeta = getStreamMetadata(streamId);

  const isEmpirical = diagnosticResults !== null;
  const nextMission = roadmapState?.nextMission;
  const rationale = roadmapState?.nextMissionRationale;

  return (
    <AppShell>
      {/* =================================================================== */}
      {/* 1. HEADER CONTEXT: YOUR GOAL, STARTING INDICATOR & APPROXIMATE GAP  */}
      {/* =================================================================== */}
      <div className="border-b border-theme bg-surface-soft/60 py-4 sm:py-6">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title & Badge */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-theme-text tracking-tight font-sans">
                  {t.roadmap.title}
                </h1>
                <Badge variant="primary" size="sm" className="font-semibold text-[10px]">
                  {t.roadmap.adaptivePathLabel || (isAr ? "مسار متكيف" : "Parcours adaptatif")}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-sans">
                {t.roadmap.subtitle}
              </p>
            </div>

            {/* Strategic Metrics Overview */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <div className="px-3.5 py-1.5 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] text-xs">
                <span className="text-[var(--color-accent)] block text-[10px] font-medium">
                  {t.roadmap.targetScoreChosen || (isAr ? "الهدف اللي اخترته" : "Objectif choisi")}
                </span>
                <span className="font-bold text-theme-text font-mono text-sm">
                  {profile.targetScore ? profile.targetScore.toFixed(2) : "16.00"}/20
                </span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl border border-theme bg-card text-xs shadow-sm">
                <span className="text-theme-muted block text-[10px]">
                  {isEmpirical ? t.roadmap.levelSourceObserved : (t.roadmap.estimateLabel || (isAr ? "مؤشر الانطلاق" : "Indicateur de départ"))}
                </span>
                <span className="font-bold text-theme-text font-mono text-sm">
                  {gapResult ? gapResult.estimatedBaselineScore.toFixed(1) : "12.0"}/20
                </span>
              </div>

              {gapResult && (
                <div className="px-3.5 py-1.5 rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] text-xs">
                  <span className="text-[var(--color-primary)] block text-[10px]">
                    {t.roadmap.gapLabel || (isAr ? "المسافة إلى هدفك" : "Distance vers cible")}
                  </span>
                  <span className="font-bold text-[var(--color-primary)] font-mono text-sm">
                    ~{gapResult.approximateGap.toFixed(1)} {t.roadmap.gapUnit}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Subtle Starting Indicator Helper Disclaimer */}
          <p className="text-[11px] text-theme-muted mt-2">
            {t.roadmap.levelSourceDisclaimer || (isAr ? "مؤشر أولي مبني على بياناتك الحالية، وليس توقعاً لعلامة البكالوريا." : "Indicateur préliminaire basé sur vos données, sans valeur de prédiction.")}
          </p>
        </Container>
      </div>

      {/* =================================================================== */}
      {/* MAIN ROADMAP FLOW                                                   */}
      {/* =================================================================== */}
      <Container size="lg" className="py-6 sm:py-10 space-y-8 sm:space-y-10">

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 2: YOUR CURRENT NEXT ACTION (NOW — VISUALLY DOMINATING)   */}
        {/* ----------------------------------------------------------------- */}
        <section id="now" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span>{t.roadmap.currentMissionBadge || (isAr ? "مهمتك الآن" : "Votre mission maintenant")}</span>
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

          <Card className="p-5 sm:p-7 border border-theme bg-card shadow-clay space-y-5">
            {nextMission ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[var(--color-primary)]">
                      {nextMission.subjectId === "math" ? (isAr ? "الرياضيات" : "Mathématiques")
                        : nextMission.subjectId === "physics" ? (isAr ? "العلوم الفيزيائية" : "Physique-Chimie")
                        : (isAr ? "علوم الطبيعة والحياة" : "Sciences de la Nature et de la Vie")}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight font-sans">
                      {locale === "ar" ? nextMission.title_ar : nextMission.title_fr}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-theme-muted font-mono flex items-center gap-1 shrink-0 bg-surface-soft px-2.5 py-1 rounded-lg border border-theme">
                    <Clock className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span>{nextMission.estimatedMinutes || 15} min</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-sans">
                  {locale === "ar" ? nextMission.description_ar : nextMission.description_fr}
                </p>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 3: WHY THIS MISSION? (IN CALM, REASSURING MENTOR TONE)*/}
                {/* ------------------------------------------------------------- */}
                <div className="p-4 rounded-2xl bg-surface-soft border border-theme text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
                      <Brain className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{t.roadmap.whyThisMission || (isAr ? "علاش هذي المهمة؟" : "Pourquoi cette mission ?")}</span>
                    </div>
                    {rationale && (
                      <Badge variant="outline" size="sm" className="bg-card border-theme text-theme-text font-semibold text-[10px]">
                        {locale === "ar" ? rationale.reasonLabel_ar : rationale.reasonLabel_fr}
                      </Badge>
                    )}
                  </div>
                  <p className="text-theme-secondary leading-relaxed font-sans text-xs sm:text-sm">
                    {rationale
                      ? (locale === "ar" ? rationale.shortExplanation_ar : rationale.shortExplanation_fr)
                      : (isAr
                          ? "لقينا عندك إشارة ضعف في هذي المهارة. نصلحوها اليوم، ومن بعد نختبرو واش ثبت فعلاً."
                          : "Signal identifié dans cette notion. Nous la réparons méthodiquement.")}
                  </p>
                </div>

                {/* Primary CTA Button (Dominating, 52px+ touch target) */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => handleStartMission(nextMission.id)}
                    className="font-bold shadow-clay min-h-[52px] text-base"
                  >
                    <span>{t.roadmap.startCurrentMissionCta || (isAr ? "ابدأ المهمة الآن" : "Démarrer la mission")}</span>
                    <Arrow className="h-5 w-5" />
                  </Button>

                  {nextMission.status === "repair_needed" && (
                    <Link href="/error-lab" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[52px]">
                        <span>{t.roadmap.errorLabLinkCta}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-10 w-10 text-[var(--color-success)] mx-auto" />
                <h3 className="font-bold text-theme-text text-base">
                  {t.roadmap.noMissionsLeft}
                </h3>
              </div>
            )}
          </Card>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 4: WHAT COMES NEXT (بعدها)                                */}
        {/* ----------------------------------------------------------------- */}
        {roadmapState && roadmapState.queuedMissions.length > 0 && (
          <section className="space-y-3">
            <div className="px-1">
              <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
                <ListOrdered className="h-4 w-4 text-[var(--color-primary)]" />
                <span>{isAr ? "بعدها" : "Ensuite"}</span>
              </h3>
              <p className="text-xs text-theme-muted">
                {isAr
                  ? "المهام التالية في مسارك، تتكيف تلقائياً حسب نتائجك وأخطائك."
                  : "Les prochaines étapes dans votre file d'attente, adaptées selon vos progrès."}
              </p>
            </div>

            <div className="space-y-2.5">
              {roadmapState.queuedMissions.slice(0, 3).map((item: QueuedMissionItem, idx: number) => (
                <div
                  key={item.mission.id}
                  className="p-4 rounded-2xl border border-theme bg-card hover:border-[var(--color-primary)]/40 hover:bg-card-hover transition-colors flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-theme-muted font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-theme-text text-xs sm:text-sm truncate">
                        {locale === "ar" ? item.mission.title_ar : item.mission.title_fr}
                      </span>
                    </div>
                    <p className="text-[11px] text-theme-muted truncate max-w-md">
                      {locale === "ar" ? item.rationale.reasonLabel_ar : item.rationale.reasonLabel_fr}
                    </p>
                  </div>

                  <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                    {isAr ? "في الانتظار" : "En attente"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 5: THE ROAD & YOUR PROGRESS                               */}
        {/* ----------------------------------------------------------------- */}
        <section id="progress" className="space-y-5">
          <div className="p-4 sm:p-6 rounded-3xl border border-theme bg-card shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-bold text-theme-text flex items-center gap-2">
                  <Map className="h-4 w-4 text-[var(--color-primary)]" />
                  <span>{t.roadmap.educationalMapLabel || (isAr ? "خريطتك التعليمية" : "Votre carte d'apprentissage")}</span>
                </h3>
                <p className="text-xs text-theme-muted">
                  {isAr
                    ? `${roadmapState?.masteredSkills.length || 0} مهارات مثبتة من أصل ${streamMeta.totalSkills} مهارة في خريطة التعلم`
                    : `${roadmapState?.masteredSkills.length || 0} compétences validées sur ${streamMeta.totalSkills} dans la carte d'apprentissage`}
                </p>
              </div>
              <Badge variant="outline" size="sm" className="text-[10px]">
                {t.roadmap.adaptivePathLabel || (isAr ? "مسار متكيف" : "Parcours adaptatif")}
              </Badge>
            </div>

            {/* Visual Road Tracker */}
            <div className="pt-2 border-t border-theme">
              <RoadVisualizer
                targetScore={profile.targetScore || 16.0}
                currentBaselineText={gapResult ? `${gapResult.estimatedBaselineScore.toFixed(1)}/20` : "12.0/20"}
                gapText={gapResult ? `${gapResult.approximateGap.toFixed(1)} نقاط` : undefined}
                activeMission={nextMission ? {
                  id: nextMission.id,
                  subjectId: nextMission.subjectId,
                  skillTitle: locale === "ar" ? nextMission.title_ar : nextMission.title_fr,
                  estimatedMinutes: nextMission.estimatedMinutes,
                  reasonText: locale === "ar" ? rationale?.shortExplanation_ar : rationale?.shortExplanation_fr,
                } : null}
                masteredCount={roadmapState?.masteredSkills.length || 0}
                totalSkills={streamMeta.totalSkills}
                locale={locale}
                onStartMission={() => nextMission && handleStartMission(nextMission.id)}
              />
            </div>

            {/* Categorized Skills Status Chips */}
            <div className="pt-2 border-t border-theme grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Card className="p-3 border-[var(--color-success)]/30 bg-[var(--color-success-soft)] text-center space-y-0.5 shadow-sm">
                <span className="text-xl font-black text-[var(--color-success)] font-mono">
                  {roadmapState?.masteredSkills.length || 0}
                </span>
                <span className="text-[11px] font-bold text-[var(--color-success)] block">
                  {t.roadmap.categories.demonstrated || (locale === "ar" ? "✓ تم إثبات التحكم" : "Maîtrise démontrée")}
                </span>
              </Card>

              <Card className="p-3 border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] text-center space-y-0.5 shadow-sm">
                <span className="text-xl font-black text-[var(--color-primary)] font-mono">
                  {roadmapState?.emergingSkills.length || 0}
                </span>
                <span className="text-[11px] font-bold text-[var(--color-primary)] block">
                  {isAr ? "مهارات ناشئة" : "Émergentes"}
                </span>
              </Card>

              <Card className="p-3 border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] text-center space-y-0.5 shadow-sm">
                <span className="text-xl font-black text-[var(--color-accent)] font-mono">
                  {roadmapState?.needsMoreWorkSkills.length || 0}
                </span>
                <span className="text-[11px] font-bold text-[var(--color-accent)] block">
                  {t.roadmap.categories.needs_work || (locale === "ar" ? "تحتاج إلى عمل إضافي" : "needs_more_work")}
                </span>
              </Card>

              <Card className="p-3 border-[var(--color-error)]/30 bg-[var(--color-error)]/10 text-center space-y-0.5 shadow-sm">
                <span className="text-xl font-black text-[var(--color-error)] font-mono">
                  {roadmapState?.unresolvedErrors.length || 0}
                </span>
                <span className="text-[11px] font-bold text-[var(--color-error)] block">
                  {locale === "ar" ? "عندك خطأ يحتاج إصلاح" : "repair_needed"}
                </span>
              </Card>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* SECTION 6: SUPPORTING DETAILS & CURRICULUM EXPLORER               */}
        {/* ----------------------------------------------------------------- */}
        <section className="space-y-4">
          {/* Stream Subjects Breakdown */}
          {roadmapState && (
            <Card className="p-4 sm:p-5 border-theme bg-card shadow-card space-y-4">
              <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block">
                {t.roadmap.pilotCoverageNotice}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.values(roadmapState.subjectProgress) as any[])
                  .filter((sp: any) => sp.evidenceLevel === "pilot_evidence")
                  .map((sp: any) => (
                    <div
                      key={sp.subjectId}
                      className="p-3.5 rounded-xl border border-theme bg-surface-soft space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-theme-text text-xs">
                          {locale === "ar" ? sp.name_ar : sp.name_fr}
                        </span>
                        <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                          Coef {sp.coefficient}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-theme-muted space-y-1">
                        <div className="flex justify-between">
                          <span>{t.roadmap.categories.demonstrated}:</span>
                          <span className="font-bold text-[var(--color-success)]">{sp.demonstratedCount}/{sp.totalPilotSkills}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{locale === "ar" ? "أخطاء قيد الترميم:" : "Erreurs :"}</span>
                          <span className={`font-bold ${sp.openErrorsCount > 0 ? "text-[var(--color-error)]" : "text-theme-muted"}`}>
                            {sp.openErrorsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Untested subjects disclosure */}
              <div className="pt-2 border-t border-theme flex items-center justify-between text-xs text-theme-muted">
                <span>{locale === "ar" ? "بقية مواد الشعبة (الأدبية والمشتركة):" : "Autres matières de la filière :"}</span>
                <Badge variant="outline" size="sm">
                  {t.roadmap.categories.not_assessed}
                </Badge>
              </div>

              {/* Direct Access to Full Stream Curriculum */}
              <div className="pt-2 border-t border-theme">
                {(() => {
                  const cardData = (() => {
                    switch (streamId) {
                      case "lettres_philo":
                        return {
                          title: isAr ? "منهاج الفلسفة واللغة العربية (إشكاليات الفصل الأول)" : "Programme Philosophie & Arabe (Trimestre 1)",
                          desc: isAr ? "إشكاليات العالم الخارجي، بنك المقالات، أقوال الفلاسفة، وأحكام إعراب إذا وقضايا شعر المنفى." : "Notions fondamentales, dissertations types, citations et stylistique.",
                          btn: isAr ? "فتح فهرس المنهاج" : "Explorer le programme",
                          color: "rose",
                        };
                      case "gestion_eco":
                        return {
                          title: isAr ? "منهاج التسيير المحاسبي والمالي والاقتصاد" : "Programme Gestion & Économie (Trimestre 1)",
                          desc: isAr ? "أعمال نهاية السنة، الاهتلاكات، تسوية المخزونات، قيود اليومية ونظريات الاقتصاد." : "Travaux de fin d'exercice, amortissements, régularisations et économie.",
                          btn: isAr ? "فتح فهرس المنهاج" : "Explorer le programme",
                          color: "amber",
                        };
                      case "math":
                      case "technique_math":
                        return {
                          title: isAr ? "منهاج الرياضيات والفيزياء المتقدمة" : "Programme Mathématiques & Physique",
                          desc: isAr ? "الدوال العددية، النهايات، الاشتقاقية، الحساب والميكانيك الكلاسيكي بتمارين البرهان." : "Analyse, dérivation, arithmétique et mécanique avec démonstrations rigoureuses.",
                          btn: isAr ? "فتح فهرس المنهاج" : "Explorer le programme",
                          color: "indigo",
                        };
                      case "langues_etrangeres":
                        return {
                          title: isAr ? "منهاج اللغات الحية وآدابها" : "Programme Langues Étrangères",
                          desc: isAr ? "تقنيات التلخيص والنصوص الفكرية والـ Compte-Rendu باللغات الحية." : "Compte-rendu objectif et critique, textes d'idées et langues vivantes.",
                          btn: isAr ? "فتح فهرس المنهاج" : "Explorer le programme",
                          color: "purple",
                        };
                      case "sciences_exp":
                      default:
                        return {
                          title: isAr ? "منهاج علوم الطبيعة والحياة (55 يوماً تفصيلياً)" : "Programme SVT (55 Jours détaillés)",
                          desc: isAr ? "دروس يومية مفصلة مع فيديوهات موجهة ورسومات تخطيطية ومحطات تفتيش أسبوعية." : "55 leçons quotidiennes guidées avec vidéos, schémas et retests jumeaux.",
                          btn: isAr ? "فتح فهرس الدروس (55)" : "Explorer les 55 jours",
                          color: "emerald",
                        };
                    }
                  })();

                  const colorClass =
                    cardData.color === "rose"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : cardData.color === "amber"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : cardData.color === "indigo"
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      : cardData.color === "purple"
                      ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";

                  const btnClass =
                    cardData.color === "rose"
                      ? "bg-rose-700 hover:bg-rose-600"
                      : cardData.color === "amber"
                      ? "bg-amber-600 hover:bg-amber-500"
                      : cardData.color === "indigo"
                      ? "bg-indigo-600 hover:bg-indigo-500"
                      : cardData.color === "purple"
                      ? "bg-purple-600 hover:bg-purple-500"
                      : "bg-emerald-600 hover:bg-emerald-500";

                  return (
                    <div className={`p-4 rounded-2xl border ${colorClass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
                      <div className="space-y-1">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          {cardData.title}
                        </span>
                        <p className="text-xs text-theme-secondary">
                          {cardData.desc}
                        </p>
                      </div>
                      <Link href="/curriculum" className="shrink-0 w-full sm:w-auto">
                        <Button variant="primary" size="sm" className={`w-full sm:w-auto ${btnClass} text-white font-bold text-xs rounded-xl shadow-sm`}>
                          <span>{cardData.btn}</span>
                          <Arrow className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  );
                })()}
              </div>


              {/* Collapsible Expanded Curriculum Learning Map */}
              <div className="pt-2 border-t border-theme">
                {(() => {
                  const activeStreamSubjects: any[] = roadmapState?.subjectProgress
                    ? (Object.values(roadmapState.subjectProgress) as any[]).filter((sp: any) => sp.status !== "not_assessed")
                    : [];
                  const streamActiveSkillsCount = activeStreamSubjects.reduce((acc, sp) => acc + sp.totalPilotSkills, 0);
                  const streamLabel = isAr ? streamMeta.name_ar : streamMeta.name_fr;

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowCurriculumMap(!showCurriculumMap)}
                        className="w-full py-2.5 px-4 rounded-xl border border-theme bg-surface-soft hover:bg-card-hover transition-colors flex items-center justify-between text-xs font-semibold text-theme-text cursor-pointer min-h-[44px]"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-[var(--color-primary)]" />
                          <span>{t.roadmap.curriculumMapTitle || (locale === "ar" ? `خريطة المنهاج الموسعة (${streamLabel})` : `Carte d'apprentissage (${streamLabel})`)}</span>
                          <Badge variant="outline" size="sm" className="bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-[var(--color-primary)]/25 font-mono text-[10px]">
                            {activeStreamSubjects.length} {locale === "ar" ? "مواد" : "matières"} · {streamActiveSkillsCount} {locale === "ar" ? "مهارة" : "compétences"}
                          </Badge>
                        </div>
                        <span className="text-theme-muted text-xs">
                          {showCurriculumMap ? "▲" : "▼"}
                        </span>
                      </button>

                      {showCurriculumMap && (
                        <div className="mt-3 space-y-4 p-4 rounded-2xl border border-theme bg-surface-soft animate-in fade-in-50">
                          <p className="text-xs text-theme-muted leading-relaxed">
                            {t.roadmap.curriculumMapSubtitle || (locale === "ar" ? `استكشف مهارات شعبة ${streamLabel}، مع تتبع حالة كل كفاءة.` : `Explorez les compétences de la filière ${streamLabel}.`)}
                          </p>

                          {activeStreamSubjects.map((subj: any) => {
                            const skills = getSkillsForSubject(subj.subjectId, streamId);
                            if (skills.length === 0) return null;
                            const subjName = locale === "ar" ? subj.name_ar : subj.name_fr;

                            return (
                              <div key={subj.subjectId} className="space-y-2.5">
                                <div className="flex items-center justify-between border-b border-theme pb-1.5">
                                  <span className="font-bold text-xs text-theme-text flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] inline-block" />
                                    {subjName}
                                  </span>
                                  <span className="text-[11px] text-theme-muted font-mono">
                                    {skills.length} {locale === "ar" ? "مهارات" : "compétences"}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {skills.map((skill) => {
                                    const isMastered = roadmapState?.masteredSkills.some((s: any) => s.skillId === skill.id);
                                    const isEmerging = roadmapState?.emergingSkills.some((s: any) => s.skillId === skill.id);
                                    const isNeedsWork = roadmapState?.needsMoreWorkSkills.some((s: any) => s.skillId === skill.id);
                                    const isUnresolved = roadmapState?.unresolvedErrors.some((e: any) => e.skillId === skill.id);

                                    let statusBadge = (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-soft text-theme-muted border border-theme">
                                        {locale === "ar" ? "غير مقيّمة بعد" : "Non évaluée"}
                                      </span>
                                    );

                                    if (isMastered) {
                                      statusBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/25">
                                          ✓ {locale === "ar" ? "تم إثباتها" : "Démontrée"}
                                        </span>
                                      );
                                    } else if (isUnresolved) {
                                      statusBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/25">
                                          ⚠ {locale === "ar" ? "قيد الترميم" : "En réparation"}
                                        </span>
                                      );
                                    } else if (isNeedsWork) {
                                      statusBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/25">
                                          ↺ {locale === "ar" ? "عمل إضافي" : "À réviser"}
                                        </span>
                                      );
                                    } else if (isEmerging) {
                                      statusBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/25">
                                          ↑ {locale === "ar" ? "ناشئة" : "Émergente"}
                                        </span>
                                      );
                                    }

                                    return (
                                      <div
                                        key={skill.id}
                                        className="p-2 rounded-lg border border-theme bg-card flex items-center justify-between gap-2 text-xs shadow-sm"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-theme-text truncate text-[11px]">
                                            {locale === "ar" ? skill.title_ar : skill.title_fr}
                                          </p>
                                          <div className="flex items-center gap-1 text-[10px] text-theme-muted">
                                            {skill.dimensions && (
                                              <span>{skill.dimensions.join(" · ")}</span>
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
                      )}
                    </>
                  );
                })()}
              </div>
            </Card>
          )}

          {/* Limitations & Transparency Notice */}
          <div className="p-4 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/25 text-xs text-theme-secondary space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-[var(--color-accent)]">
              <Info className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
              <span>{t.roadmap.limitationsTitle}</span>
            </div>
            <p className="leading-relaxed text-theme-secondary font-sans">
              {roadmapState ? (locale === "ar" ? roadmapState.limitations.ar : roadmapState.limitations.fr) : t.roadmap.limitationsText}
            </p>
          </div>

          {/* Secondary Navigation Links */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            {isEmpirical ? (
              <>
                <Link href="/diagnostic/results" className="text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>{t.roadmap.viewDiagnosticResultsCta}</span>
                </Link>
                <Link href="/diagnostic" className="text-theme-muted hover:text-theme-text hover:underline flex items-center gap-1">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{locale === "ar" ? "إعادة التشخيص الأكاديمي" : "Repasser le diagnostic"}</span>
                </Link>
              </>
            ) : (
              <Link href="/diagnostic" className="text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold">
                <Play className="h-3.5 w-3.5" />
                <span>{t.roadmap.startDiagnosticCta}</span>
              </Link>
            )}
            <Link href="/error-lab" className="text-theme-muted hover:text-theme-text hover:underline flex items-center gap-1">
              <span>{t.roadmap.errorLabLinkCta}</span>
            </Link>
          </div>
        </section>

      </Container>
    </AppShell>
  );
}
