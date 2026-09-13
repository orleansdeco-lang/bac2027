"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import { RoadVisualizer } from "@/components/ui/RoadVisualizer";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import { getActiveMissionId, loadMasteryRecords, loadPracticeSessions } from "@/lib/mission/storage";
import { loadDiagnosticResults } from "@/lib/diagnostic";
import { trackEvent } from "@/lib/analytics";
import { getStudentAccess } from "@/lib/access";
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
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);

  useEffect(() => {
    // If student is logged in, their Home is the Dashboard
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const p = user?.id ? getStrategicProfile(user.id) : null;
    trackEvent("landing_view", { hasProfile: Boolean(p) });
    setProfile(p);
  }, [user]);

  return (
    <AppShell showSidebar={false}>
      {/* =================================================================== */}
      {/* 1. HERO SECTION                                                     */}
      {/* =================================================================== */}
      <section className="relative pt-8 sm:pt-16 pb-12 sm:pb-20 border-b border-theme overflow-hidden">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-transparent pointer-events-none blur-3xl" />

        <Container size="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Col (Text & Value Proposition) */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] px-3.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAr ? "منهجية بكالوريا حديثة ومخصصة" : "Méthodologie BAC Adaptative"}</span>
              </div>

              {/* Dominant Hero Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-text leading-[1.2] font-sans">
                {isAr ? (
                  <>
                    طريقك نحو امتياز البكالوريا يبدأ من هنا.. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]">
                      خطوة بخطوة حتى تحقق حلمك وتفرح والديك.
                    </span>
                  </>
                ) : (
                  <>
                    Votre chemin vers l'excellence au BAC.. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]">
                      Étape par étape jusqu'à votre rêve.
                    </span>
                  </>
                )}
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-theme-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isAr
                  ? "ماشي واش تقرا، كيفاش توصل. منصة ذكية تكتشف ثغراتك الخفية، تصحح أخطاءك فوراً، وتبني ثقتك بنفسك حتى ترفع معدلك في البكالوريا بدون ضغط ولا تشتت."
                  : "Une méthode intelligente qui cible vos lacunes cachées, répare vos erreurs et sécurise votre mention sans dispersion."}
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link id="hero-smart-cta-link" href="/auth?mode=signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold shadow-clay px-7 py-6 rounded-2xl flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    <span>{isAr ? "افتح حسابك واستفد من 3 أيام مجاناً" : "Créer un compte & Essai 3j gratuit"}</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/auth?mode=login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 py-6 rounded-2xl font-semibold">
                    <span>{isAr ? "تسجيل الدخول" : "Se connecter"}</span>
                  </Button>
                </Link>
              </div>

              {/* 3-Day Free Trial Emotional Promise */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary-soft)]/60 border border-[var(--color-primary)]/20 text-xs text-theme-secondary flex items-center gap-2.5 max-w-xl">
                <ShieldCheck className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
                <span className="leading-normal">
                  {isAr
                    ? "✨ 3 أيام تجريبية كاملة ومجانية لاكتشاف مهارات شعبتك وخريطتك الدراسية — ابدأ الآن واقترب من حلمك."
                    : "✨ 3 jours d'essai gratuit complet pour découvrir vos compétences — Commencez dès aujourd'hui."}
                </span>
              </div>

              {/* Trust & Scope Micro-Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-theme-muted">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>{isAr ? "تدريب على طريقة الحل وتحليل الأخطاء" : "Méthode de résolution et analyse des erreurs"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>{isAr ? "تحديد نقاط الاختناق بدقة" : "Ciblage précis des verrous"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4 text-amber-500" />
                  <span>{isAr ? "مختبر ترميم الأخطاء" : "Laboratoire de remédiation"}</span>
                </span>
              </div>
            </div>

            {/* Right Col: The Interactive Road Visualizer */}
            <div className="lg:col-span-5">
              <div className="rounded-[32px] border border-theme bg-card p-3 sm:p-5 backdrop-blur-sm shadow-clay">
                <div className="px-3 py-2 border-b border-theme flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-theme-text">
                    {isAr ? "خريطتك التعليمية" : "Votre carte d'apprentissage"}
                  </span>
                  <Badge variant="primary" size="sm" className="font-semibold text-[10px]">
                    {isAr ? "مسار متكيف" : "Parcours adaptatif"}
                  </Badge>
                </div>
                <RoadVisualizer
                  targetScore={profile?.targetScore || 16.0}
                  currentBaselineText={isAr ? "مؤشر أولي: 11.8/20" : "Indicateur initial : 11.8/20"}
                  gapText={isAr ? "حوالي 4.2 نقاط" : "environ 4.2 points"}
                  activeMission={{
                    id: "pilot-math",
                    subjectId: "math",
                    skillTitle: isAr ? "اشتقاق الدوال المركبة وقاعدة السلسلة" : "Dérivation des fonctions composées",
                    estimatedMinutes: 15,
                    reasonText: isAr
                      ? "لقينا إشارة ضعف في هذي المهارة. نصلحوها ونكملو."
                      : "Signal de vulnérabilité identifié. Réparation ciblée.",
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
      <section id="how-it-works" className="py-14 sm:py-20 border-b border-theme bg-surface">
        <Container size="lg" className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              {isAr ? "الفكرة بسيطة" : "Le principe est simple"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
              {isAr ? "أربعة أركان متوازنة لنجاح البكالوريا" : "Quatre piliers équilibrés pour réussir le BAC"}
            </h2>
            <p className="text-sm sm:text-base text-theme-secondary">
              {isAr
                ? "نظام لا يكتفي بقول «اقرأ أكثر»، بل يبني نجاحك الأكاديمي والذهني بشكل علمي ومتكامل."
                : "Un système qui ne dit pas seulement 'travaille plus', mais structure méthodiquement votre préparation."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: Study */}
            <Card className="p-5 border-theme bg-card hover:border-[var(--color-primary)]/40 transition-colors space-y-3 shadow-sm rounded-3xl">
              <div className="h-10 w-10 rounded-2xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-theme-text text-base">
                {isAr ? "1. الدراسة (Study)" : "1. Étude ciblée"}
              </h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                {isAr
                  ? "استرجاع نشط وفهم الآليات، وتدريب منهجي على طريقة الحل وتحليل الأخطاء دون حفظ عشوائي."
                  : "Rappel actif, compréhension des mécanismes, méthode de résolution rigoureuse et analyse des erreurs."}
              </p>
            </Card>

            {/* Pillar 2: Progress */}
            <Card className="p-5 border-theme bg-card hover:border-[var(--color-accent)]/40 transition-colors space-y-3 shadow-sm rounded-3xl">
              <div className="h-10 w-10 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-theme-text text-base">
                {isAr ? "2. التقدّم (Progress)" : "2. Progression"}
              </h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                {isAr
                  ? "تحديد نقطة الاختناق الكبرى بدقة وتفكيكها عبر تحليل الأخطاء وإعادة الاختبار التوأمي."
                  : "Identification du verrou majeur et déblocage progressif grâce au laboratoire d'erreurs."}
              </p>
            </Card>

            {/* Pillar 3: Mind */}
            <Card className="p-5 border-theme bg-card hover:border-[var(--color-warning)]/40 transition-colors space-y-3 shadow-sm rounded-3xl">
              <div className="h-10 w-10 rounded-2xl bg-[var(--color-warning-soft)] border border-[var(--color-warning)]/20 flex items-center justify-center text-[var(--color-warning)]">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-theme-text text-base">
                {isAr ? "3. الراحة والذهن (Mind)" : "3. Énergie & Clarté"}
              </h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                {isAr
                  ? "متابعة مستوى طاقتك وتوترك. الراحة ركن أساسي في الخطة وليست مكافأة مؤجلة."
                  : "Gestion de l'énergie et de la pression. Le repos fait partie intégrante du plan d'action."}
              </p>
            </Card>

            {/* Pillar 4: Future */}
            <Card className="p-5 border-theme bg-card hover:border-[var(--color-success)]/40 transition-colors space-y-3 shadow-sm rounded-3xl">
              <div className="h-10 w-10 rounded-2xl bg-[var(--color-success-soft)] border border-[var(--color-success)]/20 flex items-center justify-center text-[var(--color-success)]">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-theme-text text-base">
                {isAr ? "4. المستقبل (Future)" : "4. Projet d'avenir"}
              </h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
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
      <section className="py-14 sm:py-20 border-b border-theme bg-canvas">
        <Container size="lg" className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              {isAr ? "دورة التعلم المغلقة" : "La boucle d'apprentissage"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-theme-text font-sans">
              {isAr ? "كيفاش تحول الخطأ إلى إتقان دائم؟" : "Transformer chaque erreur en maîtrise durable"}
            </h2>
            <p className="text-sm sm:text-base text-theme-secondary">
              {isAr
                ? "دورة منتظمة مغلقة تضمن أن كل تمرين يخدم هدفك المباشر دون تكرار عشوائي."
                : "Un cycle méthodique garantissant que chaque entraînement cible précisément votre prochaine étape."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-center">
            <div className="p-4 rounded-3xl border border-theme bg-card shadow-sm space-y-1">
              <span className="text-xs font-bold text-[var(--color-primary)] block font-mono">01 DIAGNOSTIC</span>
              <span className="font-bold text-theme-text text-sm">{isAr ? "كشف الاختناق" : "Diagnostic ciblé"}</span>
            </div>
            <div className="p-4 rounded-3xl border border-theme bg-card shadow-sm space-y-1">
              <span className="text-xs font-bold text-[var(--color-accent)] block font-mono">02 MISSION</span>
              <span className="font-bold text-theme-text text-sm">{isAr ? "مهمة مركزة" : "Mission 15 min"}</span>
            </div>
            <div className="p-4 rounded-3xl border border-theme bg-card shadow-sm space-y-1">
              <span className="text-xs font-bold text-[var(--color-warning)] block font-mono">03 ERROR LAB</span>
              <span className="font-bold text-theme-text text-sm">{isAr ? "مختبر الترميم" : "Lab d'erreurs"}</span>
            </div>
            <div className="p-4 rounded-3xl border border-theme bg-card shadow-sm space-y-1">
              <span className="text-xs font-bold text-[var(--color-success)] block font-mono">04 RETEST</span>
              <span className="font-bold text-theme-text text-sm">{isAr ? "إثبات التمكن" : "Validation jumeau"}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 4. ERROR LAB SIGNATURE FEATURE                                      */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 border-b border-theme bg-surface">
        <Container size="md" className="space-y-6 text-center">
          <Badge variant="warning" size="sm" className="font-mono">
            {isAr ? "مختبر الأخطاء • Signature Feature" : "Laboratoire d'erreurs"}
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-theme-text font-sans leading-tight">
            {isAr ? (
              <>
                الغلط ماشي فشل. <br />
                <span className="text-[var(--color-accent)]">الغلط معلومة.</span>
              </>
            ) : (
              <>
                L'erreur n'est pas un échec. <br />
                <span className="text-[var(--color-accent)]">L'erreur est une information.</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-theme-secondary max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "كي تغلط، ما نعاودوش الدرس كامل. نحددو معاً سبب الخطأ (نسيان، سوء فهم، خطأ في الحساب، أو مشكل في المنهجية) ونعالجوه في 5 إلى 10 دقائق."
              : "Quand vous faites une erreur, vous n'avez pas besoin de refaire tout le cours. Nous identifions la cause exacte et la réparons en 5 à 10 minutes."}
          </p>

          <div className="pt-2">
            <Link href="/error-lab">
              <Button variant="outline" size="md" className="rounded-full border-[var(--color-accent)]/40 text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]">
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
      <section className="py-16 sm:py-24 bg-canvas">
        <Container size="md" className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-theme-text font-sans">
            {isAr ? "واجد تبدأ طريقك نحو هدفك؟" : "Prêt à tracer votre route vers le BAC ?"}
          </h2>

          <p className="text-sm sm:text-base text-theme-secondary max-w-lg mx-auto leading-relaxed">
            {isAr
              ? "ابدأ بتحديد شعبتك وهدفك الاستراتيجي. خريطتك تنتظرك."
              : "Définissez votre filière et votre objectif. Votre feuille de route vous attend."}
          </p>

          <div className="pt-2">
            <Link href="/auth?mode=signup">
              <Button variant="primary" size="lg" className="rounded-2xl font-bold shadow-clay px-8 py-6 min-h-[48px] flex items-center justify-center gap-2 mx-auto">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <span>{isAr ? "افتح حسابك واستفد من 3 أيام مجاناً" : "Créer un compte & Essai 3 jours gratuit"}</span>
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </AppShell>
  );
}
