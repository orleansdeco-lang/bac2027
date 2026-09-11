"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import { RoadVisualizer } from "@/components/ui/RoadVisualizer";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Target,
  Brain,
  RotateCcw,
  Zap,
  Clock,
  Heart,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function HomePage() {
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const [profile, setProfile] = useState<StrategicProfile | null>(null);

  useEffect(() => {
    const p = getStrategicProfile();
    if (p) setProfile(p);
  }, []);

  return (
    <AppShell>
      {/* =================================================================== */}
      {/* 1. HERO SECTION                                                     */}
      {/* =================================================================== */}
      <section className="relative pt-8 sm:pt-16 pb-12 sm:pb-20 border-b border-slate-800/80 overflow-hidden">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent pointer-events-none blur-3xl" />

        <Container size="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Col (Text & Value Proposition) */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>{isAr ? "منهجية بكالوريا حديثة ومخصصة" : "Méthodologie BAC Adaptative"}</span>
              </div>

              {/* Dominant Hero Heading */}
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 leading-[1.15] font-sans">
                {isAr ? (
                  <>
                    ماشي واش تقرا. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                      كيفاش توصل.
                    </span>
                  </>
                ) : (
                  <>
                    Pas seulement quoi étudier. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                      Comment y arriver.
                    </span>
                  </>
                )}
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isAr
                  ? "BAC Mastery يبني لك خريطة طريق واضحة من مستواك الحالي إلى الهدف اللي حاب توصله، مع حماية طاقتك وراحتك وبناء مستقبلك."
                  : "BAC Mastery trace votre feuille de route personnalisée depuis votre niveau réel jusqu'à votre objectif, sans dispersion ni épuisement."}
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href={profile ? "/roadmap" : "/onboarding"} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-blue-600/25">
                    <span>{profile ? (isAr ? "نرجع لخريطتي" : "Voir ma feuille de route") : (isAr ? "ابني خريطتي" : "Construire ma feuille de route")}</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800/80">
                    <span>{isAr ? "كيفاش تخدم؟" : "Comment ça marche ?"}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                </a>
              </div>

              {/* Trust & Scope Micro-Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>{isAr ? "وفق معايير التصحيح الوزاري" : "Critères du barème officiel"}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span>{isAr ? "تحديد نقاط الاختناق بدقة" : "Ciblage précis des verrous"}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4 text-amber-400" />
                  <span>{isAr ? "مختبر ترميم الأخطاء" : "Laboratoire de remédiation"}</span>
                </span>
              </div>
            </div>

            {/* Right Col: The Interactive Road Visualizer */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-800 bg-[#111827]/80 p-2 sm:p-4 backdrop-blur-sm shadow-card">
                <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {isAr ? "مسار التعلم النموذجي" : "Parcours d'apprentissage type"}
                  </span>
                  <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                    Adaptive Path
                  </Badge>
                </div>
                <RoadVisualizer
                  targetScore={profile?.targetScore || 16.5}
                  currentBaselineText={isAr ? "مستوى انطلاق: 11.8/20" : "Niveau départ : 11.8/20"}
                  gapText={isAr ? "+4.7 نقاط" : "+4.7 points"}
                  activeMission={{
                    id: "pilot-math",
                    subjectId: "math",
                    skillTitle: isAr ? "اشتقاق الدوال المركبة وقاعدة السلسلة" : "Dérivation des fonctions composées",
                    estimatedMinutes: 15,
                    reasonText: isAr
                      ? "أظهر التشخيص نقطة اختناق في التطبيق المنهجي. نصلحوها ونكملو."
                      : "Le diagnostic a identifié un verrou d'application. Réparation ciblée.",
                  }}
                  masteredCount={2}
                  totalSkills={31}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 2. "الفكرة بسيطة" — THE 4 BALANCED PILLARS                         */}
      {/* =================================================================== */}
      <section id="how-it-works" className="py-14 sm:py-20 border-b border-slate-800/80 bg-[#0E1526]">
        <Container size="lg" className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {isAr ? "الفكرة بسيطة" : "Le principe est simple"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans">
              {isAr ? "أربعة أركان متوازنة لنجاح البكالوريا" : "Quatre piliers équilibrés pour réussir le BAC"}
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              {isAr
                ? "نظام لا يكتفي بقول «اقرأ أكثر»، بل يبني نجاحك الأكاديمي والذهني بشكل علمي ومتكامل."
                : "Un système qui ne dit pas seulement 'travaille plus', mais structure méthodiquement votre préparation."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: Study */}
            <Card className="p-5 border-slate-800/80 bg-[#111827] hover:border-blue-500/40 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">
                {isAr ? "1. الدراسة (Study)" : "1. Étude ciblée"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "استرجاع نشط وفهم الآليات، وحل نموذجي وفق معايير التصحيح الوزاري الجزائري دون حفظ عشوائي."
                  : "Rappel actif, compréhension des mécanismes et résolution conforme aux critères d'inspection."}
              </p>
            </Card>

            {/* Pillar 2: Progress */}
            <Card className="p-5 border-slate-800/80 bg-[#111827] hover:border-cyan-500/40 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">
                {isAr ? "2. التقدّم (Progress)" : "2. Progression"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "تحديد نقطة الاختناق الكبرى بدقة وتفكيكها عبر تحليل الأخطاء وإعادة الاختبار التوأمي."
                  : "Identification du verrou majeur et déblocage progressif grâce au laboratoire d'erreurs."}
              </p>
            </Card>

            {/* Pillar 3: Mind */}
            <Card className="p-5 border-slate-800/80 bg-[#111827] hover:border-amber-500/40 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">
                {isAr ? "3. الراحة والذهن (Mind)" : "3. Énergie & Clarté"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "متابعة مستوى طاقتك وتوترك. الراحة ركن أساسي في الخطة وليست مكافأة مؤجلة."
                  : "Gestion de l'énergie et de la pression. Le repos fait partie intégrante du plan d'action."}
              </p>
            </Card>

            {/* Pillar 4: Future */}
            <Card className="p-5 border-slate-800/80 bg-[#111827] hover:border-emerald-500/40 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">
                {isAr ? "4. المستقبل (Future)" : "4. Projet d'avenir"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "ربط الجهد اليومي بالتخصص الجامعي المنشود (طب، إعلام آلي ESI، مدارس عليا، بوليتكنيك)."
                  : "Connexion de l'effort quotidien avec votre ambition universitaire (Médecine, ESI, Écoles Supérieures)."}
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 3. THE ROAD LOOP (HOW IT ACTUALLY WORKS)                            */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 border-b border-slate-800/80 bg-[#0B1020]">
        <Container size="lg" className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {isAr ? "دورة التعلم المغلقة" : "La boucle d'apprentissage"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans">
              {isAr ? "كيفاش تحول الخطأ إلى إتقان دائم؟" : "Transformer chaque erreur en maîtrise durable"}
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              {isAr
                ? "دورة منتظمة مغلقة تضمن أن كل تمرين يخدم هدفك المباشر دون تكرار عشوائي."
                : "Un cycle méthodique garantissant que chaque entraînement cible précisément votre prochaine étape."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-center">
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#111827] space-y-1">
              <span className="text-xs font-bold text-blue-400 block font-mono">01 DIAGNOSTIC</span>
              <span className="font-bold text-slate-200 text-sm">{isAr ? "كشف الاختناق" : "Diagnostic ciblé"}</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#111827] space-y-1">
              <span className="text-xs font-bold text-cyan-400 block font-mono">02 MISSION</span>
              <span className="font-bold text-slate-200 text-sm">{isAr ? "مهمة مركزة" : "Mission 15 min"}</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#111827] space-y-1">
              <span className="text-xs font-bold text-amber-400 block font-mono">03 ERROR LAB</span>
              <span className="font-bold text-slate-200 text-sm">{isAr ? "مختبر الترميم" : "Lab d'erreurs"}</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#111827] space-y-1">
              <span className="text-xs font-bold text-emerald-400 block font-mono">04 RETEST</span>
              <span className="font-bold text-slate-200 text-sm">{isAr ? "إثبات التمكن" : "Validation jumeau"}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 4. ERROR LAB SIGNATURE FEATURE                                      */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 border-b border-slate-800/80 bg-[#0E1526]">
        <Container size="md" className="space-y-6 text-center">
          <Badge variant="warning" size="sm" className="font-mono">
            {isAr ? "مختبر الأخطاء • Signature Feature" : "Laboratoire d'erreurs"}
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-sans leading-tight">
            {isAr ? (
              <>
                الغلط ماشي فشل. <br />
                <span className="text-amber-400">الغلط معلومة.</span>
              </>
            ) : (
              <>
                L'erreur n'est pas un échec. <br />
                <span className="text-amber-400">L'erreur est une information.</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "كي تغلط، ما نعاودوش الدرس كامل. نحددو معاً سبب الخطأ (نسيان، سوء فهم، خطأ في الحساب، أو مشكل في المنهجية) ونعالجوه في 5 إلى 10 دقائق."
              : "Quand vous faites une erreur, vous n'avez pas besoin de refaire tout le cours. Nous identifions la cause exacte et la réparons en 5 à 10 minutes."}
          </p>

          <div className="pt-2">
            <Link href="/error-lab">
              <Button variant="outline" size="md" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                <span>{isAr ? "استكشف مختبر الأخطاء" : "Découvrir le lab d'erreurs"}</span>
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 5. FINAL CALL TO ACTION                                             */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0E1526] to-[#0B1020]">
        <Container size="md" className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans">
            {isAr ? "واجد تبدأ طريقك نحو هدفك؟" : "Prêt à tracer votre route vers le BAC ?"}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            {isAr
              ? "ابدأ بتحديد شعبتك وهدفك الاستراتيجي. خريطتك تنتظرك."
              : "Définissez votre filière et votre objectif. Votre feuille de route vous attend."}
          </p>

          <div className="pt-2">
            <Link href={profile ? "/roadmap" : "/onboarding"}>
              <Button variant="primary" size="lg" className="font-bold shadow-xl shadow-blue-600/30 px-8">
                <span>{profile ? (isAr ? "الانتقال إلى خريطتي" : "Aller à ma feuille de route") : (isAr ? "ابني خريطتي الآن" : "Construire ma feuille de route")}</span>
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </AppShell>
  );
}
