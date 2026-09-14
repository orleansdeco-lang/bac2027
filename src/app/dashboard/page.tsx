"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { useAuth } from "@/lib/auth/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoadVisualizer } from "@/components/ui/RoadVisualizer";
import { DashboardService } from "@/lib/services";
import { trackEvent } from "@/lib/analytics";
import { getStudentAccess } from "@/lib/access";
import {
  Sparkles,
  Target,
  Compass,
  AlertTriangle,
  Clock,
  Zap,
  CheckCircle2,
  Brain,
  Wrench,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Map,
  BarChart3,
  Play,
  Award,
  ShieldCheck,
  TrendingUp,
  Layers,
  ChevronDown,
} from "lucide-react";

import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";
import { useLearningAccessGate } from "@/lib/hooks";
import { TeacherEscalationModal } from "@/components/ui/TeacherEscalationModal";
import {
  normalizeStreamIdWithDefault,
  getStreamMetadata,
  isSubjectAuthorizedForStream,
  getDefaultSubjectForStream,
  getDefaultSkillForStream,
  getDefaultSkillTitleForStream,
} from "@/lib/curriculum/filter";

import { validateContentStreamCompatibility } from "@/domain/student";

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { theme } = useTheme();
  const gate = useLearningAccessGate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [showRoadVisualizer, setShowRoadVisualizer] = useState(false);

  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  useEffect(() => {
    async function loadDashboard() {
      if (!gate.isAuthorized || !gate.profile) return;
      try {
        const dashData = await DashboardService.getDashboardData(gate.profile.id);
        setData(dashData);
        trackEvent("dashboard_viewed", { streamId: normalizeStreamIdWithDefault(gate.profile.streamId) });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (gate.isAuthorized) {
      loadDashboard();
    } else if (!gate.isLoading) {
      setLoading(false);
    }
  }, [gate.isAuthorized, gate.isLoading, gate.profile]);

  if (gate.isLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {isAr ? "جاري بناء خطتك اليومية المخصصة..." : "Préparation de votre plan d'étude personnalisé..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!gate.isAuthorized) {
    return null;
  }

  const profile = gate.profile;
  const firstName =
    profile?.firstName ||
    (profile?.fullName ? profile.fullName.trim().split(" ")[0] : null) ||
    (isAr ? "طالبنا العزيز" : "Élève");

  const targetScore = profile?.targetScore || 16.0;
  const currentScore = data?.roadPosition?.currentScore ?? 11.5;
  const gap =
    data?.roadPosition?.gap ??
    Math.max(0, Math.round((targetScore - currentScore) * 10) / 10);

  const streamId = normalizeStreamIdWithDefault(profile?.streamId || (profile as any)?.stream, "sciences_exp");
  const activeStreamMeta = getStreamMetadata(streamId);

  const rawTodaysMission = data?.todaysMission;
  const isMissionAuthorized = rawTodaysMission?.subjectId
    ? isSubjectAuthorizedForStream(rawTodaysMission.subjectId, streamId) &&
      validateContentStreamCompatibility(streamId, { skillId: rawTodaysMission.skillId, subjectId: rawTodaysMission.subjectId })
    : false;
  const todaysMission = isMissionAuthorized ? rawTodaysMission : null;


  const metrics = data?.verifiedMetrics || {
    demonstratedSkillsCount: 0,
    emergingSkillsCount: 0,
    activeRepairsCount: 0,
    completedMissionsCount: 0,
  };

  const getTimeLabel = (time?: string) => {
    switch (time) {
      case "intensive": return isAr ? "15+ سا/أسبوع" : "15+ h/sem";
      case "standard": return isAr ? "8-12 سا/أسبوع" : "8-12 h/sem";
      case "light": return isAr ? "4-6 سا/أسبوع" : "4-6 h/sem";
      default: return isAr ? "8-12 سا/أسبوع" : "8-12 h/sem";
    }
  };

  const getEnergyLabel = (energy?: string) => {
    switch (energy) {
      case "high": return isAr ? "طاقة عالية" : "Énergie Haute";
      case "normal": return isAr ? "طبيعية" : "Normale";
      case "low": return isAr ? "متعبة / ضغط" : "Fatigué(e)";
      default: return isAr ? "طبيعية" : "Normale";
    }
  };

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return isAr ? "مادة دراسية" : "Discipline";
    const mappedId =
      subjectId === "science" ? "natural_sciences" :
      subjectId === "mathematics" ? "math" :
      subjectId;
    const subj = ALL_SUBJECTS[mappedId as SubjectId];
    if (subj) return isAr ? subj.name_ar : subj.name_fr;
    return subjectId;
  };

  const access = getStudentAccess(profile);

  // Unified Signature 3D Editorial Illustration
  const heroIllustration = "/illustrations/bac-hero.jpg";

  // 7-Day progression mock/real distribution
  const daysOfWeek = isAr
    ? [
        { day: "السبت", short: "سبت", value: 75, target: 80 },
        { day: "الأحد", short: "أحد", value: 90, target: 80 },
        { day: "الإثنين", short: "إثن", value: 60, target: 80 },
        { day: "الثلاثاء", short: "ثلا", value: 85, target: 80 },
        { day: "الأربعاء", short: "أرب", value: 100, target: 80 },
        { day: "الخميس", short: "خمي", value: 45, target: 80 },
        { day: "الجمعة", short: "جمع", value: 70, target: 80 },
      ]
    : [
        { day: "Samedi", short: "Sam", value: 75, target: 80 },
        { day: "Dimanche", short: "Dim", value: 90, target: 80 },
        { day: "Lundi", short: "Lun", value: 60, target: 80 },
        { day: "Mardi", short: "Mar", value: 85, target: 80 },
        { day: "Mercredi", short: "Mer", value: 100, target: 80 },
        { day: "Jeudi", short: "Jeu", value: 45, target: 80 },
        { day: "Vendredi", short: "Ven", value: 70, target: 80 },
      ];

  // Subject Donut calculation
  const totalCoef = activeStreamMeta.subjects.reduce((sum, s) => sum + s.coef, 0);

  return (
    <AppShell activeNav="home">
      <Container size="lg" className="py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* ================================================================= */}
        {/* TRIAL NOTIFICATION / STATUS BANNER                                */}
        {/* ================================================================= */}
        {access.status === "TRIAL_EXPIRED" ? (
          <div
            data-testid="dashboard-trial-banner"
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-clay animate-fade-in"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-stone-900 dark:text-stone-100 block">
                  {isAr ? "انتهت فترة التجربة (72 ساعة) • خريطتك وتقدمك محفوظان" : "Essai de 72h terminé • Progression sauvegardée"}
                </span>
                <span className="text-stone-600 dark:text-stone-400 text-xs">
                  {isAr ? "فعّل اشتراكك لمواصلة التدريب التكيفي والمهمات اليومية لشعبتك." : "Activez votre pass pour continuer vos missions ciblées et votre préparation."}
                </span>
              </div>
            </div>
            <Link href="/subscribe" className="shrink-0 w-full sm:w-auto">
              <Button size="sm" variant="primary" className="w-full sm:w-auto rounded-full font-bold shadow-md">
                <span>{isAr ? "تفعيل الاشتراك" : "Activer mon pass"}</span>
                <NextArrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : access.status === "TRIAL_ACTIVE" && profile ? (
          <div
            data-testid="dashboard-trial-banner"
            className="px-4 py-3 rounded-2xl bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/25 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
              <span>
                {access.isExpiringSoon
                  ? isAr ? "باقي أقل من 6 ساعات في تجربتك المجانية (72 ساعة)" : "Moins de 6 heures restantes sur votre essai de 72h"
                  : isAr ? `تجربتك المجانية (72 ساعة) فعالة • باقي ${access.remainingHours} ساعة` : `Essai gratuit de 72h actif • reste ${access.remainingHours}h`}
              </span>
            </div>
            <Link href="/subscribe" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs">
              {isAr ? "تفاصيل الاشتراك" : "Voir les offres"}
            </Link>
          </div>
        ) : null}

        {/* ================================================================= */}
        {/* DIAGNOSTIC PROMPT BANNER (IF NOT COMPLETED)                       */}
        {/* ================================================================= */}
        {!data?.hasCompletedDiagnostic && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-clay">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? "التشخيص الأولي يحدد أولوياتك الحقيقية" : "Le diagnostic initial affine vos priorités"}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-xl leading-relaxed">
                  {isAr
                    ? "قم بإجراء التشخيص الأكاديمي (12 سؤالاً في المواد الأساسية) لتحديد الثغرات بدقة وبناء خريطة طريق واقعية."
                    : "Passez le diagnostic académique pour cibler vos lacunes réelles et calibrer votre feuille de route BAC."}
                </p>
              </div>
            </div>
            <Link href="/diagnostic" className="shrink-0 w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full sm:w-auto rounded-full font-bold shadow-md">
                <span>{isAr ? "ابدأ التشخيص الآن" : "Passer le diagnostic"}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. TACTILE 3D HERO SECTION (REFERENCE #1 INSPIRATION)             */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden rounded-[32px] border border-theme bg-gradient-to-br from-[#EFE9DC] via-[#FFFCF7] to-[#F7F3EA] p-6 sm:p-8 md:p-10 shadow-clay transition-all">
          {/* Subtle Clay Background Blobs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--color-accent)]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
            
            {/* Left Content (Greeting, Current Mission, Tactile Pills) */}
            <div className="flex-1 space-y-5 text-center md:text-start">
              
              {/* Top Tags & Stream Badge */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/90 text-theme-text border border-theme shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  {isAr ? activeStreamMeta.name_ar : activeStreamMeta.name_fr}
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                  <Target className="w-3.5 h-3.5" />
                  {isAr ? `الهدف: ${targetScore.toFixed(1)}/20` : `Objectif : ${targetScore.toFixed(1)}/20`}
                </span>

                {gap > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {isAr ? `الفارق: ${gap.toFixed(1)} نقطة` : `Écart : ${gap.toFixed(1)} pts`}
                  </span>
                )}
              </div>

              {/* Headline */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-theme-text tracking-tight leading-tight">
                  {isAr ? `سلام ${firstName} 👋` : `Bonjour ${firstName} 👋`}
                </h1>
                <p className="text-sm sm:text-base text-theme-secondary mt-2 max-w-xl leading-relaxed">
                  {isAr
                    ? "من مستواك الحالي إلى هدفك في البكالوريا • ماشي واش تقرا. كيفاش توصل."
                    : "Votre espace personnalisé BAC 2027 • Chaque minute investie rapproche de votre mention."}
                </p>
              </div>

              {/* Active Mission Highlight Box */}
              {todaysMission?.mission ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-md border border-theme shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-primary)] text-white shadow-xs">
                        {getSubjectName(todaysMission.subjectId)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-theme-muted font-mono">
                        <Clock className="w-3.5 h-3.5 text-theme-muted" />
                        {todaysMission.estimatedMinutes} {isAr ? "دقيقة" : "min"}
                      </span>
                    </div>

                    {todaysMission.rationale?.reasonLabel_fr && (
                      <span className="text-[11px] font-semibold text-[var(--color-accent)] px-2 py-0.5 rounded-md bg-[var(--color-accent-soft)]">
                        {isAr ? todaysMission.rationale.reasonLabel_ar : todaysMission.rationale.reasonLabel_fr}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-theme-text">
                      {isAr ? todaysMission.skillTitle_ar : todaysMission.skillTitle_fr}
                    </h3>
                    <p className="text-xs text-theme-secondary line-clamp-2 mt-1">
                      {isAr ? todaysMission.whyText_ar : todaysMission.whyText_fr}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Tactile Pill Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
                {todaysMission?.mission ? (
                  <Link href={`/mission/${todaysMission.mission.id}`}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="rounded-full px-7 min-h-[48px] font-bold shadow-clay hover:scale-[1.02] transition-transform text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isAr ? "ابدأ مهمة اليوم" : "Continuer ma mission"}</span>
                      <NextArrow className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/roadmap">
                    <Button
                      variant="primary"
                      size="lg"
                      className="rounded-full px-7 min-h-[48px] font-bold shadow-clay hover:scale-[1.02] transition-transform text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                    >
                      <span>{isAr ? "استكشف الخريطة التكيفية" : "Voir ma feuille de route"}</span>
                      <NextArrow className="w-4 h-4" />
                    </Button>
                  </Link>
                )}

                <Link href="/roadmap">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-6 min-h-[48px] font-semibold border-theme bg-card text-theme-text hover:bg-card-hover transition-colors"
                  >
                    <span>{isAr ? "خريطة الشعبة" : "Toute la route"}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side: 3D Editorial Character Illustration */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="relative w-56 sm:w-64 md:w-72 aspect-square rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-white rotate-1 hover:rotate-0 transition-transform duration-300">
                <Image
                  src={heroIllustration}
                  alt="3D Student Illustration"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 inset-x-3 text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-theme-text backdrop-blur-md shadow-sm">
                    {isAr ? "فضاء التلميذ الشخصي" : "Espace Élève Optimisé"}
                  </span>
                </div>
              </div>

              {/* Floating Clay Badge Accent */}
              <div className="absolute -top-3 -left-3 px-3 py-1.5 rounded-2xl bg-white border border-theme shadow-clay flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)]">
                <ShieldCheck className="w-4 h-4" />
                <span>BAC 2027</span>
              </div>
            </div>

          </div>
        </section>

        {/* ================================================================= */}
        {/* DYNAMIC STREAM-AWARE CURRICULUM BANNER                            */}
        {/* ================================================================= */}
        {(() => {
          const banner = (() => {
            switch (streamId) {
              case "lettres_philo":
                return {
                  tag: "آداب وفلسفة · 3 ت ق / 3 آداب",
                  title: "منهاج الفلسفة واللغة العربية للفصل الأول (إشكاليات العالم الخارجي وبنك المقالات)",
                  desc: "استكشف إشكاليات الفصل الأول: الإحساس والإدراك، اللغة والفكر، الشعور، الذاكرة، والعادة، مدعمة بأقوال الفلاسفة وأمثلة الواقع وسلم التنقيط الرسمي.",
                  btn: "تصفح منهاج الفلسفة والأدب",
                  border: "border-rose-500/30",
                  bg: "from-rose-950/30 via-slate-900 to-slate-950",
                  tagStyle: "bg-rose-500/20 text-rose-300 border-rose-500/30",
                  btnStyle: "bg-rose-700 hover:bg-rose-600",
                };
              case "gestion_eco":
                return {
                  tag: "تسيير واقتصاد · 3 ت ق",
                  title: "منهاج التسيير المحاسبي والمالي والاقتصاد للفصل الأول (أعمال نهاية السنة والقيود)",
                  desc: "استكشف دروس الاهتلاكات، تسوية المخزونات، فروقات الجرد، ونظريات الاقتصاد والمناجمنت مع التطبيقات المحاسبية الموجهة.",
                  btn: "تصفح منهاج التسيير والمحاسبة",
                  border: "border-amber-500/30",
                  bg: "from-amber-950/30 via-slate-900 to-slate-950",
                  tagStyle: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                  btnStyle: "bg-amber-600 hover:bg-amber-500",
                };
              case "math":
                return {
                  tag: "رياضيات · 3 ر",
                  title: "منهاج الرياضيات والفيزياء المتقدمة للفصل الأول (التحليل الرياضي والميكانيك)",
                  desc: "استكشف دروس الدوال اللوغاريتمية والأسية، التزايد المقارن، وحركة الكواكب والأقمار الاصطناعية بتمارين البرهان الصارم.",
                  btn: "تصفح منهاج الرياضيات والفيزياء",
                  border: "border-indigo-500/30",
                  bg: "from-indigo-950/30 via-slate-900 to-slate-950",
                  tagStyle: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                  btnStyle: "bg-indigo-600 hover:bg-indigo-500",
                };
              case "technique_math":
                return {
                  tag: "تقني رياضي · 3 ت ر",
                  title: "منهاج هندسة التخصص والرياضيات التقنية للفصل الأول (الوحدات التطبيقية)",
                  desc: "استكشف وحدات الهندسة التخصصية (مدنية، ميكانيكية، كهربائية، طرائق) مع الرياضيات والفيزياء بتمارين تطبيقية تفصيلية.",
                  btn: "تصفح منهاج التقني الرياضي",
                  border: "border-blue-500/30",
                  bg: "from-blue-950/30 via-slate-900 to-slate-950",
                  tagStyle: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                  btnStyle: "bg-blue-600 hover:bg-blue-500",
                };
              case "langues_etrangeres":
                return {
                  tag: "لغات أجنبية · 3 ل أ",
                  title: "منهاج اللغات الحية والترجمة للفصل الأول (تقنيات Compte-Rendu والنصوص الفكرية)",
                  desc: "استكشف تقنيات التلخيص والتحليل النقدي للنصوص التاريخية والجدلية باللغات الحية مع الأدب العربي.",
                  btn: "تصفح منهاج اللغات الحية",
                  border: "border-purple-500/30",
                  bg: "from-purple-950/30 via-slate-900 to-slate-950",
                  tagStyle: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                  btnStyle: "bg-purple-600 hover:bg-purple-500",
                };
              case "sciences_exp":
              default:
                return {
                  tag: "علوم الطبيعة والحياة · 3 ع ت",
                  title: "منهاج الفصل الأول الكامل (55 درساً مفصلاً + محاكي D-Day الرسمي)",
                  desc: "استكشف جميع دروس الوحدات 1 إلى 4 ومعسكر المنهجية، مدعمة بفيديوهات موجهة بالدقيقة والثانية، رسومات تخطيطية تفاعلية، و11 محطة تفتيش أسبوعية.",
                  btn: "تصفح الـ 55 درساً",
                  border: "border-emerald-500/30",
                  bg: "from-emerald-950/30 via-slate-900 to-slate-950",
                  tagStyle: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  btnStyle: "bg-emerald-600 hover:bg-emerald-500",
                };
            }
          })();

          return (
            <section className={`rounded-3xl border ${banner.border} bg-gradient-to-br ${banner.bg} p-6 sm:p-7 shadow-clay text-white`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl text-right" dir="rtl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${banner.tagStyle}`}>
                      ✨ جديد المنهاج التفاعلي
                    </span>
                    <span className="text-xs text-slate-400">{banner.tag}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {banner.title}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {banner.desc}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
                  <Link href="/curriculum" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="md"
                      className={`w-full sm:w-auto ${banner.btnStyle} text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{banner.btn}</span>
                    </Button>
                  </Link>
                  <Link href="/exam" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full sm:w-auto border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>محاكي امتحان D-Day</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}


        {/* ================================================================= */}
        {/* 2. ROW OF 4 TACTILE STAT CARDS (REFERENCE #1 INSPIRATION)         */}
        {/* ================================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Stat 1: Validated Skills (Warm Sage Mint) */}
          <div className="p-5 rounded-3xl bg-[#E8F2EB] border border-[#6E9B7B]/30 shadow-clay flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#3B6647]">
                {isAr ? "مهارات مثبتة" : "Compétences validées"}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#6E9B7B]/20 text-[#3B6647] flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2E5439] font-mono">
                  {metrics.demonstratedSkillsCount}
                </span>
                <span className="text-xs text-[#3B6647]/80 font-mono">
                  /{activeStreamMeta.totalSkills}
                </span>
              </div>
              <p className="text-[11px] text-[#3B6647]/80 mt-1">
                {isAr ? "إثبات برهاني حقيقي" : "Évaluation authentique"}
              </p>
            </div>
          </div>

          {/* Stat 2: Target Score (Warm Honey) */}
          <div className="p-5 rounded-3xl bg-[#F9EFE2] border border-[#D7A66A]/35 shadow-clay flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8F5E1F]">
                {isAr ? "الهدف في البكالوريا" : "Objectif BAC"}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#D7A66A]/20 text-[#8F5E1F] flex items-center justify-center shadow-xs">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#8F5E1F] font-mono">
                  {targetScore.toFixed(1)}
                </span>
                <span className="text-xs text-[#8F5E1F]/80 font-mono">/20</span>
              </div>
              <p className="text-[11px] text-[#8F5E1F]/80 mt-1">
                {isAr ? `الحالي: ${currentScore.toFixed(1)}/20` : `Niveau actuel : ${currentScore.toFixed(1)}/20`}
              </p>
            </div>
          </div>

          {/* Stat 3: Study Time (Soft Beige Sand) */}
          <div className="p-5 rounded-3xl bg-[#EFE9DC] border border-[#E4DED2] shadow-clay flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-theme-secondary">
                {isAr ? "الوقت المتاح" : "Temps disponible"}
              </span>
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-theme-text font-sans truncate">
                {getTimeLabel(profile?.availableTime)}
              </div>
              <p className="text-[11px] text-theme-secondary mt-1">
                {isAr ? `الطاقة: ${getEnergyLabel(profile?.studyEnergy)}` : `Énergie : ${getEnergyLabel(profile?.studyEnergy)}`}
              </p>
            </div>
          </div>

          {/* Stat 4: Missions Completed (Muted Teal) */}
          <div className="p-5 rounded-3xl bg-[#DCE9E4] border border-[#5F8F86]/35 shadow-clay flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#365A54]">
                {isAr ? "مهمات مكتملة" : "Missions accomplies"}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#5F8F86]/20 text-[#365A54] flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2B4742] font-mono">
                  {metrics.completedMissionsCount}
                </span>
                <span className="text-xs text-[#365A54]/80 font-mono">
                  {isAr ? "مهمة" : "réalisées"}
                </span>
              </div>
              <p className="text-[11px] text-[#365A54]/80 mt-1">
                {metrics.activeRepairsCount > 0
                  ? isAr ? `${metrics.activeRepairsCount} أخطاء قيد المعالجة` : `${metrics.activeRepairsCount} erreurs à réparer`
                  : isAr ? "0 أخطاء قيد الانتظار" : "0 erreur en attente"}
              </p>
            </div>
          </div>

        </section>

        {/* ================================================================= */}
        {/* 3. MIDDLE ROW: PROGRESSION BAR CHART & STREAM SUBJECTS DONUT      */}
        {/* ================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: 7-Day Tactile Progression Bar Chart (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 rounded-[32px] bg-card border border-stone-200/80 dark:border-white/10 shadow-clay flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
                  <span>{isAr ? "نشاطك الأسبوعي" : "Progression hebdomadaire"}</span>
                </h3>
                <p className="text-xs text-theme-secondary mt-0.5">
                  {isAr ? "الانتظام اليومي هو العامل الأساسي لثبات الذاكرة" : "La régularité est le secret de l'ancrage mémoriel"}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface text-theme-secondary border border-theme">
                {isAr ? "هذا الأسبوع" : "Cette semaine"}
              </span>
            </div>

            {/* Visual Pill Columns Chart */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 sm:h-52 px-2">
                {daysOfWeek.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    
                    {/* Tooltip / value indicator on hover */}
                    <span className="text-[10px] font-mono font-bold text-theme-muted group-hover:text-[var(--color-primary)] transition-colors">
                      {d.value}%
                    </span>

                    {/* Pill Bar Track */}
                    <div className="w-full max-w-[28px] sm:max-w-[36px] h-full bg-[#EFE9DC] rounded-full p-1 flex flex-col justify-end relative overflow-hidden">
                      <div
                        style={{ height: `${d.value}%` }}
                        className={`w-full rounded-full transition-all duration-700 ${
                          d.value >= 80
                            ? "bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-secondary)] shadow-sm"
                            : d.value >= 50
                            ? "bg-gradient-to-t from-[var(--color-accent)] to-[#E6B87D] shadow-sm"
                            : "bg-gradient-to-t from-[#C5BCAD] to-[#D8D0C3]"
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span className="text-xs font-medium text-theme-secondary group-hover:text-theme-text transition-colors">
                      {d.short}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom summary and link to progress */}
            <div className="pt-4 border-t border-theme flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-theme-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]" />
                <span>{isAr ? "معدل الالتزام: 82%" : "Taux d'assiduité : 82%"}</span>
              </div>
              <Link href="/progress" className="text-[var(--color-primary)] hover:underline font-bold inline-flex items-center gap-1">
                <span>{isAr ? "تحليل الأداء الكامل" : "Analyse complète"}</span>
                <NextArrow className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Core Stream Subjects Donut Chart (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 rounded-[32px] bg-card border border-theme shadow-clay flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>{isAr ? "أوزان المواد الأساسية" : "Matières & Coefficients"}</span>
                </h3>
                <span className="text-[11px] font-mono text-theme-muted">
                  {isAr ? `${activeStreamMeta.totalSkills} مهارة` : `${activeStreamMeta.totalSkills} compétences`}
                </span>
              </div>
              <p className="text-xs text-theme-secondary mt-0.5">
                {isAr ? activeStreamMeta.name_ar : activeStreamMeta.name_fr}
              </p>
            </div>

            {/* SVG Donut Visual */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let cumulativeAngle = 0;
                    return activeStreamMeta.subjects.map((s, idx) => {
                      const strokeDash = (s.coef / totalCoef) * 283;
                      const strokeOffset = 283 - strokeDash;
                      const rotation = cumulativeAngle;
                      cumulativeAngle += (s.coef / totalCoef) * 360;

                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={s.color}
                          strokeWidth="14"
                          strokeDasharray={`${strokeDash} 283`}
                          strokeDashoffset="0"
                          style={{
                            transformOrigin: "50% 50%",
                            transform: `rotate(${rotation}deg)`,
                            transition: "all 1s ease",
                          }}
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Donut Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-theme-text font-mono">
                    {activeStreamMeta.totalSkills}
                  </span>
                  <span className="text-[10px] text-theme-muted uppercase tracking-wider font-semibold">
                    BAC 2027
                  </span>
                </div>
              </div>
            </div>

            {/* Legend & Details */}
            <div className="space-y-2 pt-2 border-t border-theme">
              {activeStreamMeta.subjects.map((subj, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span className="font-medium text-theme-text">
                      {isAr ? subj.name_ar : subj.name_fr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-theme-secondary">
                    <span className="px-1.5 py-0.5 rounded bg-surface border border-theme text-[10px]">
                      {isAr ? `معامل ${subj.coef}` : `Coef ${subj.coef}`}
                    </span>
                    <span>{subj.count} {isAr ? "مهارة" : "comp."}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ================================================================= */}
        {/* 4. BOTTOM ROW: RECENT MISSIONS LIST & FOCUS REPAIR CARD           */}
        {/* ================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Recent / Roadmap Missions List (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 rounded-[32px] bg-card border border-theme shadow-clay space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                  <span>{isAr ? "المهام ذات الأولوية" : "Missions & Recommandations"}</span>
                </h3>
                <p className="text-xs text-theme-secondary mt-0.5">
                  {isAr ? "خطوات مدروسة لتحقيق قفزة نوعية في النقاط" : "Actions ciblées à fort impact sur votre moyenne"}
                </p>
              </div>

              <Link href="/roadmap" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
                {isAr ? "عرض الكل" : "Voir tout"}
              </Link>
            </div>

            {/* List Items */}
            <div className="space-y-3 pt-2">
              
              {/* Item 1: Today's Mission (Priority 1) */}
              {todaysMission?.mission && (
                <div className="p-4 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/25 flex items-center justify-between gap-3 group hover:border-[var(--color-accent)]/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                          {getSubjectName(todaysMission.subjectId)}
                        </span>
                        <span className="text-[11px] text-theme-muted font-mono">
                          {todaysMission.estimatedMinutes} {isAr ? "د" : "min"}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-theme-text truncate mt-1">
                        {isAr ? todaysMission.skillTitle_ar : todaysMission.skillTitle_fr}
                      </h4>
                    </div>
                  </div>

                  <Link href={`/mission/${todaysMission.mission.id}`} className="shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </Link>
                </div>
              )}

              {/* Item 2: Up Next Step */}
              {data?.upNext && (
                <div className="p-4 rounded-2xl bg-surface border border-theme flex items-center justify-between gap-3 group hover:border-[var(--color-border-hover)] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                          {getSubjectName(data.upNext.subjectId)}
                        </span>
                        <span className="text-[11px] text-theme-muted font-mono">
                          {data.upNext.estimatedMinutes} {isAr ? "د" : "min"}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-theme-text truncate mt-1">
                        {isAr ? data.upNext.skillTitle_ar : data.upNext.skillTitle_fr}
                      </h4>
                    </div>
                  </div>

                  <Link href="/roadmap" className="shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[#EFE9DC] text-theme-secondary flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              )}

              {/* Item 3: Error Lab / Review Item */}
              <div className="p-4 rounded-2xl bg-[var(--color-error-soft)] border border-[var(--color-error)]/25 flex items-center justify-between gap-3 group hover:border-[var(--color-error)]/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--color-error)]/15 text-[var(--color-error)] flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-error)]/20 text-[var(--color-error)]">
                        {isAr ? "مختبر الأخطاء" : "Error Lab"}
                      </span>
                      <span className="text-[11px] text-theme-muted font-mono">
                        {metrics.activeRepairsCount} {isAr ? "عناصر" : "items"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-theme-text truncate mt-1">
                      {isAr ? "مراجعة الأخطاء وتفكيك الأسباب الجذرية" : "Analyse et déconstruction des erreurs"}
                    </h4>
                  </div>
                </div>

                <Link href="/error-lab" className="shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-error)]/20 text-[var(--color-error)] flex items-center justify-center group-hover:bg-[var(--color-error)] group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

            </div>
          </div>

          {/* Right: Daily Focus & Error Lab Callout (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 rounded-[32px] bg-card border border-theme shadow-clay flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[var(--color-accent)]" />
                  <span>{isAr ? "محور التركيز اليومي" : "Focus & Pédagogie"}</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  {isAr ? "منهجية ذكية" : "Sur-mesure"}
                </span>
              </div>
              <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
                {isAr
                  ? "نركز في كل يوم على تثبيت مهارة واحدة ذات عائد نقطي مرتفع، مع سد الثغرات قبل الانتقال لما يليها."
                  : "Une seule compétence maîtrisée par session apporte plus de certitude qu'une surcharge d'exercices passifs."}
              </p>
            </div>

            {/* Tactile Action Cards */}
            <div className="space-y-2.5">
              
              {/* Error Lab Shortcut */}
              <Link href="/error-lab" className="block">
                <div className="p-3.5 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 hover:scale-[1.01] transition-transform flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-theme-text block">
                        {isAr ? "مختبر الأخطاء (Error Lab)" : "Accéder au Lab d'erreurs"}
                      </span>
                      <span className="text-[11px] text-theme-secondary">
                        {metrics.activeRepairsCount > 0
                          ? isAr ? `${metrics.activeRepairsCount} أخطاء تنتظر التصحيح الموجه` : `${metrics.activeRepairsCount} erreurs en attente`
                          : isAr ? "لا توجد أخطاء حالياً" : "Aucune erreur critique"}
                      </span>
                    </div>
                  </div>
                  <NextArrow className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
              </Link>

              {/* Exam Simulation Shortcut */}
              <Link href="/exam" className="block">
                <div className="p-3.5 rounded-2xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30 hover:scale-[1.01] transition-transform flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-theme-text block">
                        {isAr ? "محاكاة البكالوريا (Exam Mode)" : "Simulateur Officiel BAC"}
                      </span>
                      <span className="text-[11px] text-theme-secondary">
                        {isAr ? "استراتيجية 30 دقيقة لاختيار الموضوع" : "Gestion du temps & choix de sujet"}
                      </span>
                    </div>
                  </div>
                  <NextArrow className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
              </Link>

              {/* Teacher Help Button */}
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(true)}
                className="w-full text-start p-3.5 rounded-2xl bg-surface border border-theme hover:scale-[1.01] transition-transform flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4 text-theme-secondary shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-theme-text block">
                      {isAr ? "بطاقة التوجيه للأستاذ (Zero-PII)" : "Fiche Diagnostic Enseignant"}
                    </span>
                    <span className="text-[11px] text-theme-muted">
                      {isAr ? "تقديم تقرير بيداغوجي لأستاذ القسم" : "Générer un bilan pour votre professeur"}
                    </span>
                  </div>
                </div>
                <NextArrow className="w-4 h-4 text-theme-muted" />
              </button>

            </div>
          </div>

        </section>

        {/* ================================================================= */}
        {/* 5. ROAD VISUALIZER ACCORDION / EXPANDABLE SECTION                 */}
        {/* ================================================================= */}
        <section className="rounded-[32px] bg-card border border-theme shadow-clay overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRoadVisualizer(!showRoadVisualizer)}
            className="w-full p-6 flex items-center justify-between text-start cursor-pointer hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-theme-text">
                  {isAr ? "موقعك التراكمي على مسار البكالوريا" : "Position détaillée sur le parcours BAC"}
                </h3>
                <p className="text-xs text-theme-secondary">
                  {isAr
                    ? `مستوى الأساس: 12.0/20 • الهدف: ${targetScore.toFixed(1)}/20 • المهارات المثبتة: ${metrics.demonstratedSkillsCount}/${activeStreamMeta.totalSkills}`
                    : `Base : 12.0/20 • Objectif : ${targetScore.toFixed(1)}/20 • Compétences validées : ${metrics.demonstratedSkillsCount}/${activeStreamMeta.totalSkills}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)]">
              <span>{showRoadVisualizer ? (isAr ? "إخفاء" : "Réduire") : (isAr ? "عرض الخريطة" : "Développer")}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showRoadVisualizer ? "rotate-180" : ""}`} />
            </div>
          </button>

          {showRoadVisualizer && (
            <div className="p-6 border-t border-theme animate-fade-in">
              <RoadVisualizer
                targetScore={profile?.targetScore || 16.0}
                currentBaselineText="12.0/20"
                gapText={
                  profile?.targetScore
                    ? `${(profile.targetScore - 12.0).toFixed(1)} pts`
                    : "4.0 pts"
                }
                activeMission={
                  todaysMission?.mission
                    ? {
                        id: todaysMission.mission.id,
                        subjectId: todaysMission.subjectId,
                        skillTitle: isAr ? todaysMission.skillTitle_ar : todaysMission.skillTitle_fr,
                        estimatedMinutes: todaysMission.estimatedMinutes,
                        reasonBadge: isAr
                          ? todaysMission.rationale?.reasonLabel_ar
                          : todaysMission.rationale?.reasonLabel_fr,
                        reasonText: isAr ? todaysMission.whyText_ar : todaysMission.whyText_fr,
                      }
                    : null
                }
                masteredCount={metrics.demonstratedSkillsCount}
                totalSkills={activeStreamMeta.totalSkills}
                locale={locale}
              />
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 6. BOTTOM HIGHLIGHT BANNER: OFFICIAL ALGERIAN CURRICULUM CITATION */}
        {/* ================================================================= */}
        <footer className="rounded-2xl bg-surface border border-theme p-4 sm:p-5 text-center space-y-1 text-xs text-theme-muted">
          <div className="flex items-center justify-center gap-2 font-semibold text-theme-text">
            <ShieldCheck className="w-4 h-4 text-[var(--color-success)] shrink-0" />
            <span>
              {isAr
                ? "المنهاج الرسمي لوزارة التربية الوطنية الجزائرية • دورة بكالوريا 2027"
                : "Programme Officiel du Ministère de l'Éducation Nationale • Session BAC 2027"}
            </span>
          </div>
          <p className="text-[11px] text-theme-secondary">
            {isAr
              ? "جميع المعاملات والمهارات ومصنفات التمارين مطابقة للمعايير المعتمدة من المفتشية العامة للبيداغوجيا."
              : "Tous les coefficients, compétences canoniques et grilles d'évaluation respectent les référentiels officiels."}
          </p>
        </footer>

        {/* Teacher Escalation Modal */}
        <TeacherEscalationModal
          isOpen={isTeacherModalOpen}
          onClose={() => setIsTeacherModalOpen(false)}
          skillId={todaysMission?.mission?.skillId || getDefaultSkillForStream(streamId)}
          skillTitle={todaysMission?.skillTitle_ar || getDefaultSkillTitleForStream(streamId, isAr)}
          subjectId={(todaysMission?.subjectId as SubjectId) || getDefaultSubjectForStream(streamId)}
          streamId={streamId as any}
          locale={locale}
        />

      </Container>
    </AppShell>
  );
}
