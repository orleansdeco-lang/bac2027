"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoadVisualizer } from "@/components/ui/RoadVisualizer";
import { DashboardService, StudentDashboardData } from "@/lib/services/dashboard-service";
import {
  Target,
  Zap,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Wrench,
  RotateCcw,
  Sparkles,
  BarChart3,
  Map,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardData = await DashboardService.getDashboardData(user?.id);
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadDashboard();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="h-5 w-5 animate-spin" />
            </div>
            <p className="text-sm font-mono text-slate-400">
              {isAr ? "جاري تحميل لوحة التحكم..." : "Chargement du tableau de bord..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const profile = data?.profile;
  const todaysMission = data?.todaysMission;
  const metrics = data?.progressMetrics || {
    demonstratedSkillsCount: 0,
    emergingSkillsCount: 0,
    completedMissionsCount: 0,
    activeRepairsCount: 0,
  };

  const getSubjectName = (subjId?: string) => {
    switch (subjId) {
      case "math":
        return isAr ? "الرياضيات" : "Mathématiques";
      case "physics":
        return isAr ? "العلوم الفيزيائية" : "Physique-Chimie";
      case "natural_sciences":
        return isAr ? "علوم الطبيعة والحياة" : "Sciences Naturelles";
      default:
        return isAr ? "علوم تجريبية" : "Sciences";
    }
  };

  const getEnergyLabel = (energy?: string) => {
    switch (energy) {
      case "good":
        return isAr ? "طاقة عالية ⚡" : "Énergie Haute ⚡";
      case "normal":
        return isAr ? "طاقة متوازنة 🌿" : "Énergie Normale 🌿";
      case "tired":
        return isAr ? "طاقة منخفضة 🌙" : "Fatigué 🌙";
      case "stressed":
        return isAr ? "حالة توتر 🧘" : "Stressé 🧘";
      default:
        return isAr ? "طاقة متوازنة 🌿" : "Énergie Normale 🌿";
    }
  };

  const getTimeLabel = (timeRange?: string) => {
    switch (timeRange) {
      case "less_than_5":
        return isAr ? "< 5 سا/أسبوع" : "< 5 h/sem";
      case "5_to_8":
        return isAr ? "5-8 سا/أسبوع" : "5-8 h/sem";
      case "8_to_12":
        return isAr ? "8-12 سا/أسبوع" : "8-12 h/sem";
      case "12_to_18":
        return isAr ? "12-18 سا/أسبوع" : "12-18 h/sem";
      case "18_to_25":
        return isAr ? "18-25 سا/أسبوع" : "18-25 h/sem";
      case "25_plus":
        return isAr ? "> 25 سا/أسبوع" : "> 25 h/sem";
      default:
        return isAr ? "10 سا/أسبوع" : "10 h/sem";
    }
  };

  return (
    <AppShell activeNav="home">
      <Container size="lg" className="py-6 sm:py-10 space-y-8">
        {/* ================================================================= */}
        {/* 1. STUDENT HEADER & STRATEGIC CONTEXT                             */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-slate-800 bg-[#0e1628]/80 backdrop-blur-md p-5 sm:p-7 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm" className="font-semibold">
                  {isAr ? "مسار العلوم التجريبية" : "Sciences Expérimentales"}
                </Badge>
                {profile?.targetScore && (
                  <Badge variant="outline" size="sm" className="border-amber-500/30 text-amber-300">
                    {isAr ? `الهدف: ${profile.targetScore.toFixed(1)}/20` : `Objectif : ${profile.targetScore.toFixed(1)}/20`}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                {isAr ? "مرحباً بك في خطتك اليومية" : "Bienvenue sur votre plan du jour"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                {isAr
                  ? "كل مهمة تدرسها مبنية بدقة على نقاط قوتك وما تحتاجه للوصول إلى هدفك بدون تشتت."
                  : "Chaque mission cible exactement vos besoins réels pour atteindre votre objectif sans dispersion."}
              </p>
            </div>

            {/* Strategic Controls Overview */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-3.5 py-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <div className="text-xs">
                  <span className="text-slate-400 block">{isAr ? "الوقت المتاح" : "Temps disponible"}</span>
                  <span className="font-bold text-slate-200">
                    {getTimeLabel(profile?.availableTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-3.5 py-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <div className="text-xs">
                  <span className="text-slate-400 block">{isAr ? "الحالة اليومية" : "Niveau d'énergie"}</span>
                  <span className="font-bold text-slate-200">{getEnergyLabel(profile?.studyEnergy)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-3.5 py-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <div className="text-xs">
                  <span className="text-slate-400 block">{isAr ? "الهدف الأسبوعي" : "Objectif semaine"}</span>
                  <span className="font-bold text-slate-200">{isAr ? "5 مهمات مثبتة" : "5 missions"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. DIAGNOSTIC PROMPT IF NOT COMPLETED                             */}
        {/* ================================================================= */}
        {!data?.hasCompletedDiagnostic && (
          <Card className="border-amber-500/30 bg-amber-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200">
                  {isAr ? "التشخيص الأولي يحدد أولوياتك الحقيقية" : "Le diagnostic initial affine vos priorités"}
                </h3>
                <p className="text-xs text-amber-300/80 mt-1 max-w-xl leading-relaxed">
                  {isAr
                    ? "قم بإجراء التشخيص الأكاديمي (12 سؤالاً في المواد الأساسية الثلاث) لتحديد الثغرات بدقة وبناء خريطة طريق واقعية."
                    : "Passez le diagnostic académique (12 questions) pour cibler vos lacunes réelles et calibrer votre feuille de route."}
                </p>
              </div>
            </div>
            <Link href="/diagnostic" className="shrink-0">
              <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                <span>{isAr ? "ابدأ التشخيص الآن" : "Passer le diagnostic"}</span>
                <NextArrow className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        )}

        {/* ================================================================= */}
        {/* 3. TODAY'S MISSION (DOMINANT ACTION)                              */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span>{isAr ? "مهمة اليوم المقترحة" : "Mission du Jour"}</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? "خطوة واحدة مركزة" : "Une action ciblée"}
              </span>
            </div>

            {todaysMission?.mission ? (
              <Card className="border-blue-500/40 bg-gradient-to-br from-[#121c33] to-[#0d1526] p-6 sm:p-7 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {getSubjectName(todaysMission.subjectId)}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-300 font-mono">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        {todaysMission.estimatedMinutes} {isAr ? "دقيقة" : "min"}
                      </span>
                    </div>

                    {todaysMission.rationale?.reasonLabel_ar && (
                      <Badge variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300 bg-cyan-950/30">
                        {isAr ? todaysMission.rationale.reasonLabel_ar : todaysMission.rationale.reasonLabel_fr}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {isAr ? todaysMission.skillTitle_ar : todaysMission.skillTitle_fr}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {isAr ? todaysMission.mission.description_ar : todaysMission.mission.description_fr}
                    </p>
                  </div>

                  {/* Why This Mission Callout */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-950/25 p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                      <Brain className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>{isAr ? "علاش هذي المهمة بالذات؟" : "Pourquoi cette mission ?"}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isAr ? todaysMission.whyText_ar : todaysMission.whyText_fr}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Link href={`/mission/${todaysMission.mission.id}`} className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto font-bold shadow-lg shadow-blue-600/25 min-h-[48px]"
                      >
                        <span>{isAr ? "ابدأ المهمة الآن" : "Démarrer la mission"}</span>
                        <NextArrow className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link href="/roadmap" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-300 border-slate-700 min-h-[48px]">
                        <span>{isAr ? "شوف كامل الخريطة" : "Voir toute la route"}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-slate-800 bg-[#121c33]/50 p-8 text-center space-y-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  {isAr ? "أحسنت! لا توجد مهمات عاجلة اليوم" : "Bravo ! Aucune mission urgente aujourd'hui"}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {isAr
                    ? "لقد حققت أهدافك المقررة. يمكنك تصفح الخريطة التكيفية لاختيار مهارة جديدة."
                    : "Vous avez complété vos priorités. Consultez la feuille de route pour continuer."}
                </p>
                <Link href="/roadmap">
                  <Button variant="primary" size="md">
                    <span>{isAr ? "تصفح الخريطة" : "Consulter la route"}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            )}

            {/* Road Visualizer Position */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Map className="h-5 w-5 text-cyan-400" />
                  <span>{isAr ? "موقعك في المسار الدراسي" : "Position sur le Parcours"}</span>
                </h2>
                <Link href="/roadmap" className="text-xs text-blue-400 hover:underline">
                  {isAr ? "تفاصيل الخريطة" : "Détails"}
                </Link>
              </div>

              <Card className="border-slate-800 bg-[#0e1628]/60 p-4 sm:p-6">
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
                  totalSkills={31}
                  locale={locale}
                />
              </Card>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 4. SIDEBAR: VERIFIED PROGRESS & ERROR LAB CARDS                  */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Real Progress Metrics */}
            <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  <span>{isAr ? "التقدم الحقيقي المثبت" : "Progrès Réel Vérifié"}</span>
                </div>
                <Link href="/progress" className="text-[11px] text-blue-400 hover:underline">
                  {isAr ? "التفاصيل" : "Détails"}
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? "مهارات مثبتة (Demonstrated)" : "Compétences validées"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      {metrics.demonstratedSkillsCount}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/31</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? "قيد التثبيت (Emerging)" : "En consolidation"}
                  </span>
                  <span className="text-xl font-bold text-blue-400 font-mono">
                    {metrics.emergingSkillsCount}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? "مهمات مكتملة" : "Missions finies"}
                  </span>
                  <span className="text-xl font-bold text-purple-400 font-mono">
                    {metrics.completedMissionsCount}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {isAr ? "أخطاء قيد الإصلاح" : "Erreurs à réparer"}
                  </span>
                  <span className={`text-xl font-bold font-mono ${metrics.activeRepairsCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
                    {metrics.activeRepairsCount}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                {isAr
                  ? "كل مهارة تحسب هنا ثبتت باختبار فعلي، لا توجد تقديرات تقريبية أو نقاط وهمية."
                  : "Chaque compétence indiquée est validée par preuve de réussite authentique."}
              </p>
            </Card>

            {/* Error Lab Callout Card */}
            <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>{isAr ? "مختبر الأخطاء (Error Lab)" : "Lab d'erreurs"}</span>
                </div>
                {metrics.activeRepairsCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {metrics.activeRepairsCount} {isAr ? "تنتظر الإصلاح" : "en attente"}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "الخطأ في BAC Mastery ليس فشلاً، بل فرصة لتفكيك السبب الجذري وضمان عدم تكراره يوم البكالوريا."
                  : "Une erreur est une opportunité d'identifier la cause racine pour sécuriser vos points au BAC."}
              </p>

              <Link href="/error-lab" className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-300"
                >
                  <span>{isAr ? "فتح مختبر الأخطاء" : "Accéder au Lab d'erreurs"}</span>
                  <NextArrow className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>

            {/* Quick Curriculum Explorer */}
            <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span>{isAr ? "تغطية شعبة العلوم التجريبية" : "Sciences Expérimentales"}</span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? "31 مهارة معيارية مغطاة بالكامل مع دروس، أمثلة محلولة، تمارين وتطبيقات البكالوريا."
                  : "31 compétences canoniques avec leçons, exemples résolus et annales officielles."}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300">
                  {isAr ? "11 رياضيات" : "11 Math"}
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                  {isAr ? "10 فيزياء" : "10 Physique"}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
                  {isAr ? "10 علوم طبيعية" : "10 SVT"}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
