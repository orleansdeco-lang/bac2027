"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressService } from "@/lib/services";
import { trackEvent } from "@/lib/analytics";
import { StreamId, SubjectId } from "@/types/education";
import { getStudentSubjects } from "@/domain/student";
import { SUBJECT_REGISTRY } from "@/domain/curriculum/subjects";
import { useLearningAccessGate } from "@/lib/hooks";
import {
  CheckCircle2,
  Brain,
  Wrench,
  Target,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Compass,
  Sparkles,
} from "lucide-react";

export default function ProgressPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const gate = useLearningAccessGate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const NextArrow = isAr ? ArrowLeft : ArrowRight;
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => {
    async function loadProgress() {
      if (!gate.isAuthorized || !gate.profile) return;
      try {
        const data = await ProgressService.getProgressReport(gate.profile.id);
        setReport(data);
        trackEvent("progress_viewed", {
          streamId: gate.profile.streamId,
          demonstratedCount: data?.demonstratedSkills?.length,
          emergingCount: data?.emergingSkills?.length,
          completedCount: data?.completedMissionsCount,
        });
      } catch (e) {
        console.error("Failed to load progress report:", e);
      } finally {
        setLoading(false);
      }
    }
    if (gate.isAuthorized) {
      loadProgress();
    } else if (!gate.isLoading) {
      setLoading(false);
    }
  }, [gate.isAuthorized, gate.isLoading, gate.profile]);

  if (gate.isLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-6 w-6 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-mono text-theme-muted">
              {isAr ? "جاري تحميل سجل الأدلة الأكاديمية..." : "Chargement du bilan de progression..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!gate.isAuthorized || !gate.profile) {
    return null;
  }

  const streamId = (gate.profile?.streamId || report?.streamId || "sciences_exp") as StreamId;
  const authorizedSubjects = getStudentSubjects(streamId, gate.profile?.techniqueMathSpecialty);
  const totalStreamSkills = report?.overallMetrics?.totalSkills || (streamId === "gestion_eco" ? 33 : streamId === "math" ? 30 : 31);

  const streamLabels: Record<string, { ar: string; fr: string }> = {
    sciences_exp: { ar: "شعبة العلوم التجريبية", fr: "Sciences Expérimentales" },
    gestion_eco: { ar: "شعبة التسيير والاقتصاد", fr: "Gestion & Économie" },
    math: { ar: "شعبة الرياضيات", fr: "Mathématiques" },
    technique_math: { ar: "شعبة تقني رياضي", fr: "Technique Mathématiques" },
    lettres_philo: { ar: "شعبة آداب وفلسفة", fr: "Lettres et Philosophie" },
    langues_etrangeres: { ar: "شعبة لغات أجنبية", fr: "Langues Étrangères" },
  };
  const streamLabel = streamLabels[streamId] ? (isAr ? streamLabels[streamId].ar : streamLabels[streamId].fr) : (isAr ? "شعبة العلوم التجريبية" : "Sciences Expérimentales");

  const demonstratedCount = report?.overallMetrics?.demonstratedSkillsCount || 0;
  const emergingCount = report?.overallMetrics?.emergingSkillsCount || 0;
  const repairedCount = report?.overallMetrics?.repairedErrorsCount || 0;
  const completedMissions = report?.overallMetrics?.completedMissionsCount || 0;

  return (
    <AppShell activeNav="progress">
      <Container size="lg" className="py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-theme pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {isAr ? "سجل الأدلة الحقيقية" : "Preuves Réelles"}
              </Badge>
              <span className="text-xs text-theme-muted font-mono">
                {streamLabel} ({totalStreamSkills} {isAr ? "مهارة" : "compétences"})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight font-sans">
              {isAr ? "التقدم الأكاديمي المثبت" : "Bilan de Progression Vérifié"}
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary max-w-2xl leading-relaxed">
              {isAr
                ? "في منظومة الشاطر لا توجد تقديرات عشوائية أو نسب مئوية وهمية. كل رقم هنا مبني على حل تمارين وأسئلة توأم مثبتة."
                : "Toutes les métriques SHATER reposent sur des preuves d'évaluation authentiques."}
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <BackArrow className="h-4 w-4" />
              <span>{isAr ? "لوحة التحكم" : "Tableau de bord"}</span>
            </Button>
          </Link>
        </div>

        {/* 4 Core Evidence KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[var(--color-success)]/30 bg-card p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-success)]">
                {isAr ? "مهارات مثبتة" : "Validées"}
              </span>
              <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[var(--color-success)] font-mono">
                {demonstratedCount}
              </span>
              <span className="text-xs text-theme-muted font-mono">/{totalStreamSkills}</span>
            </div>
            <span className="text-[11px] text-theme-secondary block">
              {isAr ? "حل ناجح + اختبار توأم" : "Succès complet"}
            </span>
          </Card>

          <Card className="border-[var(--color-primary)]/35 bg-card p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                {isAr ? "قيد التثبيت" : "En consolidation"}
              </span>
              <Brain className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[var(--color-primary)] font-mono">
                {emergingCount}
              </span>
              <span className="text-xs text-theme-muted font-mono">/{totalStreamSkills}</span>
            </div>
            <span className="text-[11px] text-theme-secondary block">
              {isAr ? "بدأت فيها ممارسة ناجحة" : "Premier succès"}
            </span>
          </Card>

          <Card className="border-[var(--color-accent)]/30 bg-card p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                {isAr ? "أخطاء تم إصلاحها" : "Erreurs Réparées"}
              </span>
              <Wrench className="h-4 w-4 text-[var(--color-accent)]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[var(--color-accent)] font-mono">
                {repairedCount}
              </span>
            </div>
            <span className="text-[11px] text-theme-secondary block">
              {isAr ? "معالجة السبب الجذري" : "Remédiation réussie"}
            </span>
          </Card>

          <Card className="border-[var(--color-primary)]/35 bg-card p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                {isAr ? "مهمات مكتملة" : "Missions Terminées"}
              </span>
              <Target className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[var(--color-primary)] font-mono">
                {completedMissions}
              </span>
            </div>
            <span className="text-[11px] text-theme-secondary block">
              {isAr ? "مسار دراسي منجز" : "Missions complètes"}
            </span>
          </Card>
        </div>

        {/* Subject Breakdown Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-theme-text flex items-center gap-2 font-sans">
            <BookOpen className="h-5 w-5 text-[var(--color-accent)]" />
            <span>{isAr ? "التغطية المعيارية حسب المواد الأساسية" : "Couverture par Matière"}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {authorizedSubjects.map((rule, idx) => {
              const meta = SUBJECT_REGISTRY[rule.subjectId as SubjectId];
              const sData =
                report?.subjectBreakdown?.[rule.subjectId] ||
                (rule.subjectId === "math" ? report?.subjectBreakdown?.mathematics : null) ||
                { demonstrated: 0, emerging: 0, total: 0 };
              const subjectName = isAr
                ? meta?.name_ar || rule.subjectId
                : meta?.name_fr || rule.subjectId;
              const badgeVariants: ("primary" | "default" | "success")[] = ["primary", "default", "success"];
              const progressVariants: ("primary" | "accent" | "success")[] = ["primary", "accent", "success"];
              const badgeVariant = badgeVariants[idx % badgeVariants.length];
              const progressVariant = progressVariants[idx % progressVariants.length];

              return (
                <Card key={rule.subjectId} className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-theme-text">
                      {subjectName} {sData.total > 0 ? `(${sData.total} ${isAr ? "مهارات" : "compétences"})` : ""}
                    </span>
                    <Badge variant={badgeVariant} size="sm">
                      {sData.demonstrated}/{sData.total}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={sData.total > 0 ? (sData.demonstrated / sData.total) * 100 : 0}
                    showPercentage={false}
                    variant={progressVariant}
                    size="sm"
                  />
                  <div className="flex justify-between text-xs text-theme-secondary">
                    <span>
                      {isAr ? `مثبتة: ${sData.demonstrated}` : `Validées: ${sData.demonstrated}`}
                    </span>
                    <span>
                      {isAr ? `قيد التثبيت: ${sData.emerging}` : `En cours: ${sData.emerging}`}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Demonstrated Skills List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-theme-text flex items-center gap-2 font-sans">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{isAr ? "المهارات المثبتة فعلياً" : "Compétences Validées"}</span>
          </h2>

          {report?.demonstratedSkills && report.demonstratedSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.demonstratedSkills.map((s: any) => (
                <div
                  key={s.skillId}
                  className="p-4 rounded-2xl bg-card-muted border border-theme flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-theme-muted">{s.skillId}</span>
                    <h3 className="text-xs sm:text-sm font-semibold text-theme-text">
                      {isAr ? s.title_ar : s.title_fr}
                    </h3>
                  </div>
                  <Badge variant="success" size="sm">
                    {isAr ? "مثبتة" : "Validée"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-theme-muted mx-auto" />
              <p className="text-xs sm:text-sm text-theme-secondary max-w-md mx-auto leading-relaxed">
                {isAr
                  ? "لم تسجل بعد أي مهارة مثبتة بشكل نهائي. أكمل مهماتك اليومية واختبارات التوأم لتظهر مهاراتك هنا."
                  : "Aucune compétence n'est encore validée. Complétez vos missions et retests."}
              </p>
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  <span>{isAr ? "ابدأ مهمتك الأولى" : "Démarrer une mission"}</span>
                  <NextArrow className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </Container>
    </AppShell>
  );
}
