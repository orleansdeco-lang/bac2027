"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressService, ProgressReport } from "@/lib/services/progress-service";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Brain,
  ShieldCheck,
  BarChart3,
  BookOpen,
  Wrench,
  Sparkles,
  Target,
} from "lucide-react";

export default function ProgressPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const BackArrow = direction === "rtl" ? ArrowRight : ArrowLeft;

  const [report, setReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await ProgressService.getProgressReport(user?.id);
        setReport(res);
      } catch (err) {
        console.error("Error loading progress report:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadProgress();
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
              {isAr ? "جاري تحميل سجل التقدم الأكاديمي..." : "Chargement du bilan de progression..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const demonstratedCount = report?.demonstratedSkills.length || 0;
  const emergingCount = report?.emergingSkills.length || 0;
  const repairedCount = report?.repairedErrorsCount || 0;
  const completedMissions = report?.completedMissionsCount || 0;

  const math = report?.subjectBreakdown.mathematics || { demonstrated: 0, emerging: 0, total: 11 };
  const physics = report?.subjectBreakdown.physics || { demonstrated: 0, emerging: 0, total: 10 };
  const svt = report?.subjectBreakdown.natural_sciences || { demonstrated: 0, emerging: 0, total: 10 };

  return (
    <AppShell activeNav="progress">
      <Container size="lg" className="py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {isAr ? "سجل الأدلة الحقيقية" : "Preuves Réelles"}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? "شعبة العلوم التجريبية (31 مهارة)" : "Sciences Expérimentales (31 compétences)"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? "التقدم الأكاديمي المثبت" : "Bilan de Progression Vérifié"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {isAr
                ? "في BAC Mastery لا توجد تقديرات عشوائية أو نسب مئوية وهمية. كل رقم هنا مبني على حل تمارين وأسئلة توأم مثبتة."
                : "Toutes les métriques reposent sur des preuves d'évaluation authentiques."}
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
          <Card className="border-emerald-500/30 bg-emerald-950/15 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {isAr ? "مهارات مثبتة" : "Validées"}
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-emerald-300 font-mono">
                {demonstratedCount}
              </span>
              <span className="text-xs text-slate-500 font-mono">/31</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {isAr ? "حل ناجح + اختبار توأم" : "Succès complet"}
            </span>
          </Card>

          <Card className="border-blue-500/30 bg-blue-950/15 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {isAr ? "قيد التثبيت" : "En consolidation"}
              </span>
              <Brain className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-blue-300 font-mono">
                {emergingCount}
              </span>
              <span className="text-xs text-slate-500 font-mono">/31</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {isAr ? "بدأت فيها ممارسة ناجحة" : "Premier succès"}
            </span>
          </Card>

          <Card className="border-amber-500/30 bg-amber-950/15 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {isAr ? "أخطاء تم إصلاحها" : "Erreurs Réparées"}
              </span>
              <Wrench className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-amber-300 font-mono">
                {repairedCount}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {isAr ? "معالجة السبب الجذري" : "Remédiation réussie"}
            </span>
          </Card>

          <Card className="border-purple-500/30 bg-purple-950/15 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                {isAr ? "مهمات مكتملة" : "Missions Terminées"}
              </span>
              <Target className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-purple-300 font-mono">
                {completedMissions}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {isAr ? "مسار دراسي منجز" : "Missions complètes"}
            </span>
          </Card>
        </div>

        {/* Subject Breakdown Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <span>{isAr ? "التغطية المعيارية حسب المواد الأساسية الثلاث" : "Couverture par Matière"}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Math */}
            <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {isAr ? "الرياضيات (11 مهارة)" : "Mathématiques (11)"}
                </span>
                <Badge variant="primary" size="sm">
                  {math.demonstrated}/{math.total}
                </Badge>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(math.demonstrated / math.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{isAr ? `مثبتة: ${math.demonstrated}` : `Validées: ${math.demonstrated}`}</span>
                <span>{isAr ? `قيد التثبيت: ${math.emerging}` : `En cours: ${math.emerging}`}</span>
              </div>
            </Card>

            {/* Physics */}
            <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {isAr ? "العلوم الفيزيائية (10 مهارات)" : "Physique-Chimie (10)"}
                </span>
                <Badge variant="primary" size="sm">
                  {physics.demonstrated}/{physics.total}
                </Badge>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${(physics.demonstrated / physics.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{isAr ? `مثبتة: ${physics.demonstrated}` : `Validées: ${physics.demonstrated}`}</span>
                <span>{isAr ? `قيد التثبيت: ${physics.emerging}` : `En cours: ${physics.emerging}`}</span>
              </div>
            </Card>

            {/* SVT */}
            <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {isAr ? "علوم الطبيعة والحياة (10 مهارات)" : "SVT (10)"}
                </span>
                <Badge variant="primary" size="sm">
                  {svt.demonstrated}/{svt.total}
                </Badge>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${(svt.demonstrated / svt.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{isAr ? `مثبتة: ${svt.demonstrated}` : `Validées: ${svt.demonstrated}`}</span>
                <span>{isAr ? `قيد التثبيت: ${svt.emerging}` : `En cours: ${svt.emerging}`}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Demonstrated Skills List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{isAr ? "المهارات المثبتة فعلياً" : "Compétences Validées"}</span>
          </h2>

          {report?.demonstratedSkills && report.demonstratedSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.demonstratedSkills.map((s) => (
                <div
                  key={s.skillId}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-500">{s.skillId}</span>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">
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
            <Card className="p-8 text-center border-slate-800 bg-[#0e1628]/40 space-y-3">
              <Sparkles className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
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
