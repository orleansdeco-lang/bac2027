"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import { Logo, ShaterIcon } from "@/components/ui/Logo";
import { StudentService } from "@/lib/services";
import { StudentProfile } from "@/types/student";
import { trackEvent } from "@/lib/analytics";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Target,
  RotateCcw,
  BookOpen,
  Crosshair,
  MessageCircle,
  MessageSquareQuote,
  Laptop,
} from "lucide-react";

export function LandingView() {
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // Active product preview state for Section 6
  const [activeProductTab, setActiveProductTab] = useState<"diagnostic" | "mission" | "error_lab">("error_lab");

  useEffect(() => {
    trackEvent("landing_view", { isLoggedIn: Boolean(user) });
    if (user?.id) {
      StudentService.getProfile(user.id).then((sp) => {
        if (sp) setStudentProfile(sp);
      });
    }
  }, [user]);

  const studentName = studentProfile?.firstName || null;

  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      
      {/* Smart Top Greeting Banner for Logged-In Students */}
      {user && (
        <div className="bg-[var(--color-primary)] text-white px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3 shadow-sm relative z-20">
          <span>
            {isAr
              ? `مرحباً بك مجدداً ${studentName ? studentName : ""}! خريطتك التعليمية في الشاطر بانتظارك ومسارك محفوظ.`
              : `Bienvenue ${studentName ? studentName : ""} ! Votre progression est sauvegardée.`}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0"
          >
            <span>{isAr ? "لوحة التلميذ" : "Tableau de bord"}</span>
            <Arrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Mobile Experiences Spotlight Announcement Banner */}
      <div className="md:hidden bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-500/30 px-3.5 py-2.5 flex items-center justify-between gap-2 relative z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
            {isAr ? "جديد: بنك تجارب وعِبر البكالوريا 🎓" : "Nouveau : Témoignages BAC 2027 🎓"}
          </span>
        </div>
        <Link
          href="/experiences"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-xs shrink-0 active:scale-95 transition-transform"
        >
          <span>{isAr ? "دخول" : "Voir"}</span>
          <Arrow className="w-3 h-3" />
        </Link>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1 — HERO: STRONG, SIMPLE, DIRECT                           */}
      {/* =================================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-theme overflow-hidden bg-gradient-to-b from-canvas via-surface/60 to-surface">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[380px] bg-[var(--color-primary)]/10 pointer-events-none blur-3xl" />

        <Container size="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              
              {/* Eyebrow + Experiences Badge */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--color-primary)]">
                  <ShaterIcon size={16} />
                  <span>BAC 2027 🇩🇿 — الشاطر للبكالوريا</span>
                </div>
                <Link
                  href="/experiences"
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 transition-all shadow-xs hover:scale-105"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? "جديد: بنك التجارب والعِبر 🎓" : "Nouveau : Témoignages BAC 🎓"}</span>
                </Link>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-text leading-[1.25] font-sans">
                {isAr ? (
                  <>
                    الباك يحتاج خدمة. <br />
                    <span className="text-[var(--color-primary)]">
                      SHATER يساعدك تعرف وين تحط خدمتك.
                    </span>
                  </>
                ) : (
                  <>
                    Le BAC demande du travail. <br />
                    <span className="text-[var(--color-primary)]">
                      SHATER vous aide à cibler vos efforts.
                    </span>
                  </>
                )}
              </h1>

              {/* Secondary Subtext */}
              <p className="text-base sm:text-lg text-theme-secondary font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                {isAr
                  ? "اقرا وحدك إذا تعرف واش تحتاج. وإذا ما عرفتش، SHATER يشخص مستواك ويوجهك."
                  : "Révisez seul si vous savez ce qu'il vous faut. Et si vous hésitez, SHATER diagnostique votre niveau et vous guide."}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 flex-wrap">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-bold shadow-clay px-8 py-6 rounded-2xl flex items-center justify-center gap-2.5 text-base"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>{isAr ? "ابدأ مجانًا" : "Commencer gratuitement"}</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/experiences" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-6 rounded-2xl font-bold text-sm bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2"
                  >
                    <MessageSquareQuote className="h-4 w-4 text-amber-500" />
                    <span>{isAr ? "بنك التجارب والعِبر" : "Témoignages BAC"}</span>
                  </Button>
                </Link>

                <Link href="#two-modes" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-6 rounded-2xl font-semibold text-sm hover:bg-card"
                  >
                    <span>{isAr ? "شوف كيفاش يخدم" : "Découvrir le fonctionnement"}</span>
                  </Button>
                </Link>
              </div>

              {/* Micro Trust Indicator */}
              <div className="pt-1 text-xs text-theme-muted font-medium flex items-center justify-center lg:justify-start gap-2">
                <span>✨ 72 ساعة تجربة استكشافية مجانية (0 دج)</span>
                <span>•</span>
                <span>بدون بطاقة دفع</span>
                <span>•</span>
                <span>وصول فوري</span>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-[32px] overflow-hidden border border-theme bg-card shadow-clay p-2.5 max-w-md w-full">
                <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] w-full">
                  <Image
                    src="/illustrations/shater-hero.jpg"
                    alt={isAr ? "طالب بكالوريا جزائري يدرس بهدوء وتركيز" : "Étudiant algérien révisant le BAC"}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-xs text-white/90 font-bold">
                      « ماشي واش تقرا. كيفاش توصل. »
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 2 — التشتت (THE OVERWHELM - BEFORE)                         */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-canvas border-b border-theme">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Image: Messy Overwhelmed Student */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="relative rounded-[28px] overflow-hidden border border-rose-500/20 bg-card shadow-clay p-2 w-full max-w-lg">
                <div className="relative rounded-[22px] overflow-hidden aspect-[16/9] w-full">
                  <Image
                    src="/illustrations/shater-overwhelmed.jpg"
                    alt={isAr ? "طالب بكالوريا محتار أمام كثرة الكتب والملخصات والشاشات" : "Élève submergé par trop de documents et de cours"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold">
                    {isAr ? "قبل الشاطر : التشتت" : "Avant SHATER"}
                  </div>
                </div>
              </div>
            </div>

            {/* Emotional Narrative */}
            <div className="lg:col-span-6 text-start space-y-5 order-1 lg:order-2">
              <Badge variant="outline" size="sm" className="text-xs font-mono text-rose-500 border-rose-400/30">
                واقع طالب البكالوريا
              </Badge>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans leading-tight">
                  {isAr ? "المشكل ماشي دائماً أنك ما تقراش." : "Le problème n'est pas toujours que vous ne travaillez pas."}
                </h2>
                <p className="text-lg sm:text-xl font-bold text-[var(--color-primary)]">
                  {isAr ? "مرات المشكل أنك ما تعرفش واش تقرا." : "Parfois, le vrai problème est de ne pas savoir quoi réviser."}
                </p>
              </div>

              <p className="text-sm text-theme-secondary leading-relaxed">
                تفتح الهاتف تلقى مئات القنوات، تفتح المكتب تلقى عشرات الكراريس.. تحل وتعاود، وبصح ما تحسش بلي راك تتقدم حقيقة.
              </p>

              {/* 3 Small Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-theme-text flex items-center gap-1.5">
                  <span className="text-rose-500">📌</span>
                  <span>نقرا بزاف</span>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-theme-text flex items-center gap-1.5">
                  <span className="text-rose-500">📌</span>
                  <span>نغلط</span>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-theme-text flex items-center gap-1.5">
                  <span className="text-rose-500">📌</span>
                  <span>ما نعرفش علاش</span>
                </span>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3 — طريقتان للتعلم (TWO WAYS TO LEARN)                     */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-surface border-b border-theme" id="two-modes">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-theme-text font-sans">
              {isAr ? "اقرا بطريقتك." : "Révisez à votre façon."}
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary">
              SHATER ليس مجرد مكتبة محتوى.. يجمع بين حرية التعلم وتوجيه الذكاء عندما تحتاجه.
            </p>
          </div>

          {/* Dual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            
            {/* Card 1: Free Learning */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-theme shadow-sm flex flex-col justify-between space-y-5 text-start hover:border-[var(--color-primary)]/40 transition-all">
              <div className="space-y-3">
                <span className="text-3xl block">📚</span>
                <h3 className="text-xl sm:text-2xl font-black text-theme-text">
                  نقرا وحدي
                </h3>
                <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                  الدروس، الملخصات، التمارين، المواضيع والحلول في بلاصة وحدة.
                </p>
                <div className="text-[11px] text-theme-muted pt-1">
                  اختار شعبتك، المادة، الدرس، واقرا على راحتك وبلا أي ضغط.
                </div>
              </div>

              <div className="pt-4 border-t border-theme/60">
                <Link href="/curriculum" className="w-full">
                  <Button variant="outline" size="md" className="w-full rounded-xl font-bold text-xs gap-2">
                    <span>تصفح المحتوى</span>
                    <Arrow className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: Guided Learning */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-[var(--color-primary)] shadow-clay flex flex-col justify-between space-y-5 text-start relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-[var(--color-primary)]" />
              
              <div className="space-y-3">
                <span className="text-3xl block">🎯</span>
                <h3 className="text-xl sm:text-2xl font-black text-theme-text">
                  خلّي SHATER يوجّهك
                </h3>
                <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                  إذا ما عرفتش واش ناقصك، SHATER يشخص مستواك ويعاونك تعرف واش تخدم.
                </p>
                <div className="text-[11px] text-[var(--color-primary)] font-bold pt-1">
                  مهام يومية مركزة (20–40 دقيقة) وسد فوري لنقاط الضعف.
                </div>
              </div>

              <div className="pt-4 border-t border-theme/60">
                <Link href="/diagnostic" className="w-full">
                  <Button variant="primary" size="md" className="w-full rounded-xl font-bold text-xs gap-2 shadow-sm">
                    <span>ابدأ التشخيص</span>
                    <Arrow className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom Note */}
          <div className="text-center text-xs sm:text-sm text-theme-secondary max-w-lg mx-auto leading-relaxed">
            ماشي لازم تختار واحد فقط. <br />
            <strong className="text-theme-text font-bold">اقرا بحرية، واطلب التوجيه وقت تحتاجه.</strong>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 4 — النجاح والوضوح (THE CLARITY - AFTER)                    */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-canvas border-b border-theme">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Narrative */}
            <div className="lg:col-span-6 text-start space-y-5">
              <Badge variant="outline" size="sm" className="text-xs font-mono text-[var(--color-primary)] border-[var(--color-primary)]/30">
                مع الشاطر
              </Badge>

              <div className="space-y-2">
                <span className="text-sm font-bold text-theme-muted block">
                  من: ما نعرفش واش نقرا
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans">
                  إلى: <span className="text-[var(--color-primary)]">« نعرف واش ناقصني. »</span>
                </h2>
              </div>

              <p className="text-sm text-theme-secondary leading-relaxed">
                مكتب مرتب، مهمة واضحة اليوم، وتمرين محدد يعالج بالضبط المشكل اللي كان معطلك.
              </p>

              {/* Progression Strip */}
              <div className="p-3.5 rounded-2xl bg-surface border border-theme text-xs font-bold text-theme-text flex flex-wrap items-center gap-2">
                <span>تشخيص</span>
                <span className="text-theme-muted">←</span>
                <span>تدريب</span>
                <span className="text-theme-muted">←</span>
                <span>خطأ</span>
                <span className="text-theme-muted">←</span>
                <span>إصلاح</span>
                <span className="text-theme-muted">←</span>
                <span>إعادة اختبار</span>
                <span className="text-theme-muted">←</span>
                <span className="text-[var(--color-primary)]">إتقان</span>
              </div>
            </div>

            {/* Image: Confident Focused Student */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative rounded-[28px] overflow-hidden border border-theme bg-card shadow-clay p-2 w-full max-w-lg">
                <div className="relative rounded-[22px] overflow-hidden aspect-[16/9] w-full">
                  <Image
                    src="/illustrations/shater-confidence.jpg"
                    alt={isAr ? "طالب بكالوريا جزائري مركز وواثق بعد حل تمرين صعب" : "Élève calme et confiant avec un plan de travail clair"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[var(--color-primary)]/90 backdrop-blur-md text-white text-[11px] font-bold">
                    {isAr ? "مع الشاطر : الوضوح والجاهزية" : "Avec SHATER"}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 5 — واش معناها شاطر؟ (WHAT DOES SHATER MEAN?)              */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-18 bg-surface/70 border-b border-theme" id="what-is-shater">
        <Container size="md" className="text-center space-y-6">
          <Badge variant="outline" size="sm" className="text-xs font-mono text-[var(--color-primary)]">
            الهوية والجوهر
          </Badge>

          <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans">
            واش معناها تكون شاطر؟
          </h2>

          <div className="space-y-2 text-sm sm:text-base text-theme-secondary leading-relaxed max-w-lg mx-auto">
            <p>ماشي اللي يحفظ أكثر.</p>
            <p>وماشي اللي يقرا ساعات أكثر بدون نتيجة.</p>
            <p className="font-bold text-theme-text pt-1">
              الشاطر هو اللي يعرف يفهم، يطبق، يصلح غلطو، ويعرف واش يدير بعد.
            </p>
          </div>

          {/* Big Typography Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme max-w-lg mx-auto shadow-sm">
            <div className="text-base sm:text-xl font-black text-[var(--color-primary)] font-sans">
              فهم + تطبيق + تصرف + إتقان
            </div>
          </div>

          <div className="text-xs sm:text-sm text-theme-muted font-bold">
            « ماشي واش تقرا. كيفاش توصل. »
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 6 — المنتج الحقيقي (REAL PRODUCT & ERROR LAB)              */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-canvas border-b border-theme" id="how-it-works">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Product Narrative */}
            <div className="lg:col-span-6 text-start space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
                <Laptop className="w-3.5 h-3.5" />
                <span>المنظومة العملية</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans leading-tight">
                SHATER ما يعطيكش محتوى وخلاص.
              </h2>

              {/* 3 Core Points */}
              <div className="space-y-2.5 text-xs sm:text-sm font-bold text-theme-text">
                <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>يعرف واش تعرف.</span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>يكتشف وين تغلط.</span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-theme flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>يساعدك تعرف واش لازم تخدم الآن.</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--color-primary-soft)]/60 border border-[var(--color-primary)]/20 text-xs sm:text-sm font-black text-[var(--color-primary)]">
                الغلط ماشي فشل. <br />
                <span className="text-theme-text">الغلط معلومة.</span>
              </div>
            </div>

            {/* Interactive Real App Preview Card */}
            <div className="lg:col-span-6">
              <div className="rounded-[28px] border border-theme bg-surface shadow-clay p-5 sm:p-6 space-y-4">
                
                {/* Switcher Tabs */}
                <div className="flex items-center justify-between border-b border-theme pb-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveProductTab("error_lab")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeProductTab === "error_lab"
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-theme-muted hover:text-theme-text"
                      }`}
                    >
                      معمل الأخطاء
                    </button>
                    <button
                      onClick={() => setActiveProductTab("diagnostic")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeProductTab === "diagnostic"
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-theme-muted hover:text-theme-text"
                      }`}
                    >
                      التشخيص
                    </button>
                    <button
                      onClick={() => setActiveProductTab("mission")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeProductTab === "mission"
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-theme-muted hover:text-theme-text"
                      }`}
                    >
                      المهمة اليومية
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-theme-muted">SHATER UI</span>
                </div>

                {/* Tab 1: Error Lab Preview */}
                {activeProductTab === "error_lab" && (
                  <div className="space-y-3 text-start text-xs pt-1">
                    <div className="p-3 rounded-xl bg-card border border-rose-400/30 space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-rose-500">📍 الخطأ المرصود</span>
                      <div className="font-bold text-theme-text">سؤال الدوال الأسية: تسرع في حساب النهاية عند -∞</div>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-theme space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-theme-muted">🔍 سبب التعثر</span>
                      <div className="text-theme-secondary">عدم إخراج العامل المشترك لتجاوز حالة عدم التعيين.</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30 space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-primary)]">🛠️ خطوة الإصلاح والـ Retest</span>
                      <div className="font-bold text-theme-text">تمرين توأم جديد مستقل لتأكيد تجاوز هذا الفخ نهائياً.</div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Diagnostic Preview */}
                {activeProductTab === "diagnostic" && (
                  <div className="space-y-3 text-start text-xs pt-1">
                    <div className="p-3 rounded-xl bg-card border border-theme space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-theme-text">العلوم الفيزيائية — الوحدة 01</span>
                        <span className="text-[var(--color-primary)] font-mono font-bold">مستوى 13.5</span>
                      </div>
                      <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                        <div className="bg-[var(--color-primary)] h-full w-2/3" />
                      </div>
                      <div className="text-[11px] text-theme-secondary">تحتاج تدريب إضافي على المتابعة الزمنية بالناقلية.</div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Mission Preview */}
                {activeProductTab === "mission" && (
                  <div className="space-y-3 text-start text-xs pt-1">
                    <div className="p-3 rounded-xl bg-card border border-theme space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-primary)]">مهمتك اليوم (25 دقيقة)</span>
                      <div className="font-bold text-theme-text">3 تمارين تدريبية في حركة الكواكب والأقمار الاصطناعية</div>
                      <div className="text-[11px] text-theme-secondary">فيديو توجيهي مركز 6 دقائق + حل بالمنهجية الرسمية.</div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/auth/register" className="w-full">
                    <Button variant="outline" size="sm" className="w-full rounded-xl font-bold text-xs gap-1.5">
                      <span>جرب المنظومة مجانًا الآن</span>
                      <Arrow className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 7 — الصورة الأخيرة + FINAL CTA                             */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-surface relative overflow-hidden border-b border-theme">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[280px] bg-[var(--color-primary)]/10 pointer-events-none blur-3xl" />

        <Container size="md" className="relative z-10 text-center space-y-8">
          
          {/* Natural Human Photo: Parent with Student */}
          <div className="relative rounded-[28px] overflow-hidden aspect-[16/9] max-w-md mx-auto border border-theme shadow-clay">
            <Image
              src="/illustrations/shater-parent.jpg"
              alt="طالب بكالوريا جزائري مع ولي أمره في جو هادئ وواثق"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans leading-tight">
              الباك ماشي ساهل.. <br />
              <span className="text-theme-secondary text-lg sm:text-2xl font-bold block pt-1">
                وSHATER ما يقراش بلاصتك.
              </span>
            </h2>

            <div className="p-4 rounded-2xl bg-card border border-theme text-sm font-bold text-theme-text max-w-md mx-auto">
              أنت تخدم.. <br />
              <span className="text-[var(--color-primary)]">
                SHATER يساعدك تعرف فين تحط خدمتك.
              </span>
            </div>
          </div>

          {/* Final CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-bold shadow-clay px-10 py-6 rounded-2xl text-base gap-2"
              >
                <span>ابدأ مجانًا</span>
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/curriculum" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 rounded-2xl font-bold text-sm"
              >
                <span>تصفح المحتوى</span>
              </Button>
            </Link>
          </div>

          {/* Brand Vision Statement */}
          <div className="pt-6 space-y-1 text-xs text-theme-muted">
            <div className="font-bold text-theme-text text-sm">الشاطر | SHATER</div>
            <div>نبني الإنسان الشاطر، ونبدأ بالباكالوريا.</div>
            <div className="text-[var(--color-primary)] font-bold pt-0.5">« ماشي واش تقرا. كيفاش توصل. »</div>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* COMPACT FOOTER                                                     */}
      {/* =================================================================== */}
      <footer className="border-t border-theme bg-surface py-8 text-xs text-theme-secondary">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" showTagline={false} />
              <span className="text-[11px] text-theme-muted">
                © {new Date().getFullYear()} SHATER BAC — جميع الحقوق محفوظة
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium flex-wrap">
              <Link href="/bac-2027" className="hover:text-[var(--color-primary)] font-bold">دليل BAC 2027</Link>
              <Link href="/calculator" className="hover:text-[var(--color-primary)] font-bold">حاسبة المعدل والتوجيه</Link>
              <Link href="/curriculum" className="hover:text-[var(--color-primary)]">المكتبة الحرة</Link>
              <Link href="/exams" className="hover:text-[var(--color-primary)]">بنك البكالوريات</Link>
              <Link href="/faq" className="hover:text-[var(--color-primary)]">الأسئلة الشائعة</Link>
              <Link href="/diagnostic" className="hover:text-[var(--color-primary)]">التشخيص</Link>
              <Link href="/auth" className="hover:text-[var(--color-primary)]">تسجيل الدخول</Link>
              <a
                href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى استفسار حول منصة الشاطر للبكالوريا.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] font-bold hover:underline"
              >
                WhatsApp:{" "}
                <span dir="ltr" className="font-mono inline-block text-left" style={{ unicodeBidi: "isolate" }}>
                  +213 550 85 32 34
                </span>
              </a>
            </div>
          </div>
        </Container>
      </footer>

      {/* =================================================================== */}
      {/* MOBILE STICKY BOTTOM CTA BAR                                       */}
      {/* =================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-theme md:hidden z-30 flex items-center justify-between gap-3 shadow-lg">
        <div className="text-start">
          <span className="text-xs font-bold text-theme-text block">SHATER BAC</span>
          <span className="text-[10px] text-theme-muted">72 ساعة تجربة مجانية (0 دج)</span>
        </div>
        <Link href="/auth/register" className="shrink-0">
          <Button variant="primary" size="sm" className="rounded-xl font-bold text-xs px-4 py-2">
            <span>ابدأ مجانًا</span>
            <Arrow className="w-3.5 h-3.5 ms-1" />
          </Button>
        </Link>
      </div>

    </AppShell>
  );
}
