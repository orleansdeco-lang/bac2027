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
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { LANDING_CONFIG } from "@/lib/constants/landing-config";
import { HeroInteractiveOrientation } from "./HeroInteractiveOrientation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  GraduationCap,
  Landmark,
  Brain,
  FileText,
  Zap,
  Award,
  Users,
  MessageSquareQuote,
  ShieldCheck,
  Smartphone,
  Truck,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export function LandingView() {
  const { t, locale, direction } = useTranslation();
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active pricing tab
  const [selectedPlanId, setSelectedPlanId] = useState<string>("season");

  useEffect(() => {
    trackEvent("landing_view", { isLoggedIn: Boolean(user) });
    trackEvent("view_hero", { timestamp: new Date().toISOString() });
    if (user?.id) {
      StudentService.getProfile(user.id).then((sp) => {
        if (sp) setStudentProfile(sp);
      });
    }
  }, [user]);

  const studentName = studentProfile?.firstName || null;
  const trialDays = LANDING_CONFIG.trialDurationDays;

  // Primary and secondary CTA handlers for analytics
  const handlePrimaryCtaClick = (location: string) => {
    trackEvent("click_cta", { location, ctaType: "primary_signup" });
    trackEvent("start_signup", { location });
  };

  const handleSecondaryCtaClick = (location: string) => {
    trackEvent("click_cta", { location, ctaType: "secondary_orientation" });
  };

  const handleWhatsAppClick = (audience: "student" | "parent") => {
    trackEvent("click_whatsapp", { audience });
  };

  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      {/* Structured SEO Schema for Google Rich Results (FAQ Schema) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: LANDING_CONFIG.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      {/* 0. Top Live Announcement Banner */}
      <div
        className="bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-emerald-500/20 border-b border-white/10 px-4 py-2 text-center text-xs font-bold text-white flex items-center justify-center gap-3 relative z-30 shadow-sm"
        dir="rtl"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <span className="text-slate-200">
          جديد البكالوريا 2026/2027: تم فتح <strong>«مستكشف التوجيه وحساب المعدل الموزون»</strong> مجاناً لجميع الشعب.
        </span>
        <Link
          href="/orientation"
          onClick={() => handleSecondaryCtaClick("top_announcement")}
          className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-0.5 rounded-full text-[11px] font-black transition-all shrink-0 shadow-md shadow-amber-500/20"
        >
          <span>جرّب واش نقدر نقرا</span>
          <Arrow className="w-3 h-3" />
        </Link>
      </div>

      {/* Returning User Notification Banner */}
      {user && (
        <div
          className="bg-[#101B33] border-b border-blue-500/30 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3 relative z-20"
          dir="rtl"
        >
          <span>
            {`مرحباً بك مجدداً ${studentName ? studentName : ""}! خريطتك التعليمية ومجلس العلم بانتظارك.`}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0"
          >
            <span>لوحة التحكم</span>
            <Arrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 1 — HERO + عَرْض تفاعلي مُصغّر (واش نقدر نقرا؟)            */}
      {/* =================================================================== */}
      <section
        className="relative pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#070B14] via-[#0B1222] to-[#070B14]"
        id="hero-section"
        dir="rtl"
      >
        {/* Ambient Warm Lighting Cones */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-[450px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <Container size="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left/Main Copy Column (5-Second Clarity) */}
            <div className="lg:col-span-6 text-center lg:text-right space-y-6">
              
              {/* Official Stream & Scope Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-300">
                  <ShaterIcon size={14} />
                  <span>نظام تشغيل البكالوريا 2026/2027 🇩🇿</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تغطية كاملة لـ 6 شُعب</span>
                </div>
              </div>

              {/* Main Headline (Conversational Algerian Tone) */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-[1.25]">
                مش غير تقرا... <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300">
                  تعرف كيفاش تقرا، واش تراجع، ووين حاب توصل.
                </span>
              </h1>

              {/* Positioning Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                SHATER ليست مستودعاً لفيديوهات اليوتيوب أو ملفات الـ PDF المكدسة. إنها منظومة ذكية تجمع لك 
                <strong> مستكشف التوجيه الجامعي الرسمي</strong>، 
                <strong> مجالس المذاكرة المتزامنة بدون تشتيت</strong>، 
                <strong> ومعمل رصد الأخطاء</strong> لضمان النتيجة الحقيقية يوم الامتحان.
              </p>

              {/* Primary & Secondary Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 flex-wrap">
                <Link
                  href="/auth/register"
                  onClick={() => handlePrimaryCtaClick("hero_primary")}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-black px-8 py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Sparkles className="h-5 w-5 text-slate-950" />
                    <span>ابدأ مجاناً</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <Link
                  href="/orientation"
                  onClick={() => handleSecondaryCtaClick("hero_secondary")}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-4 sm:py-5 rounded-2xl font-bold text-sm bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Compass className="h-4 w-4 text-emerald-400" />
                    <span>جرّب واش نقدر نقرا</span>
                  </Button>
                </Link>
              </div>

              {/* Frictionless Trust Badges */}
              <div className="pt-1 text-xs text-slate-400 font-medium flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{trialDays} أيام تجربة مجانية كاملة (0 دج)</span>
                </span>
                <span>•</span>
                <span>بدون بطاقة بنكية</span>
                <span>•</span>
                <span>لا التزام مالي</span>
              </div>
            </div>

            {/* Right Column: Interactive Working Mini-Orientation Calculator */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-xl">
                <HeroInteractiveOrientation />
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 2 — شريط الثقة (TRUST STRIP)                                */}
      {/* =================================================================== */}
      <section className="py-6 sm:py-8 bg-[#0B1222] border-b border-white/[0.06]" dir="rtl">
        <Container size="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="text-xs font-black text-amber-400 flex items-center justify-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                <span>المنشور الوزاري الرسمي</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">معتمد لدورة 2026/2027 من MESRS</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>58 ولاية جزائرية</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">تغطية شاملة لكل ثانويات الوطن</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="text-xs font-black text-blue-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>تجربة بدون بطاقة</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">ابدأ الآن بدون إدخال أي وسيلة دفع</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="text-xs font-black text-purple-400 flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>بريدي موب / CCP / كود للبيت</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">الدفع عند الاستلام لـ 58 ولاية</p>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3 — المشكلة: 4 مشاهد يومية يعرفها كل تلميذ بكالوريا        */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#070B14] border-b border-white/[0.08]" id="problem-section" dir="rtl">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>واقع التحضير اليومي للبكالوريا</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              هل تعيش أحد هذه المشاهد الأربعة كل ليلة؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              الخلل ليس في قدراتك أو ذكائك، الخلل في غياب منظومة تُنظم تركيزك وتحدد لك ما تراجع بالضبط.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Scene 1: Infinite scrolling */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B1222] border border-white/[0.08] hover:border-rose-500/40 transition-all text-right space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg border border-rose-500/30">
                📱
              </div>
              <h3 className="text-base font-black text-white">
                1. التمرير اللانهائي وتأنيب الضمير كل ليلة
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                تقول لروحك «نريح 10 دقائق برك فالتيك توك أو إنستغرام».. تفيق تلقى 3 سوايع طارت، الطابلة فارغة والكراس ما انفتحش. ترقد محروق وتأنيب الضمير ياكل فيك، وتفيق غدوة عيان باش تعاود نفس الدوامة.
              </p>
            </div>

            {/* Scene 2: Random revision & false sense of understanding */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B1222] border border-white/[0.08] hover:border-amber-500/40 transition-all text-right space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
                🎲
              </div>
              <h3 className="text-base font-black text-white">
                2. المراجعة العشوائية وتوهّم الفهم
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                تحل تمرين ساهل ديجا شفت حله من قبل، تفرح وتقول راني فاهم. بصح نهار الفرض أو الاختبار تتصدم بسؤال منهجي مركب ما تعرفش منين تبداه، وتكتشف أنك كنت حافظ الخطوات بدون استيعاب حقيقي للقاعدة.
              </p>
            </div>

            {/* Scene 3: Fear of orientation & wasted effort */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B1222] border border-white/[0.08] hover:border-blue-500/40 transition-all text-right space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/30">
                😰
              </div>
              <h3 className="text-base font-black text-white">
                3. الخوف والضبابية: «نقرا.. بصح واش راني راح نلحق؟»
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                تقرا وتتعب بلا ما تعرف واش من معدل يلزمك للتخصص اللي راك تحلم بيه. ما تعرفش واش هو المعدل الموزون لشعبتك، ولا المواد اللي تضيعلك النقاط الأكبر، وتعيش في ضغط نفسي دائم بسبب المجهول.
              </p>
            </div>

            {/* Scene 4: YouTube & PDF Overwhelm */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B1222] border border-white/[0.08] hover:border-purple-500/40 transition-all text-right space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/30">
                📚
              </div>
              <h3 className="text-base font-black text-white">
                4. تخمة الفيديوهات والمجموعات بلا تطبيق حقيقي
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                مئات الفيديوهات المسجلة في اليوتيوب، و 50 قناة تيليغرام معمرة بملخصات ما قريتهاش. الفيديوهات تعطيك شعور بالاطمئنان، بصح نهار تحط ورقة بيضاء وتكتب الحل بيدك، تحبس في أول سطر.
              </p>
            </div>

          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center max-w-xl mx-auto space-y-2">
            <p className="text-xs sm:text-sm font-bold text-white">
              💡 الحل ليس في إضافة ساعات عشوائية، بل في امتلاك نظام واضح يقودك خطوة بخطوة.
            </p>
            <Link href="/auth/register" onClick={() => handlePrimaryCtaClick("problem_cta")}>
              <span className="text-amber-400 hover:text-amber-300 text-xs font-black underline flex items-center justify-center gap-1">
                <span>ابدأ رحلتك المنظمة مجاناً الآن</span>
                <Arrow className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 4 — الحل: الأعمدة الثلاثة بنماذج واجهات حقيقية              */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#0B1222] border-b border-white/[0.08]" id="solution-section" dir="rtl">
        <Container size="lg" className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>الأعمدة الثلاثة لمنظومة الشاطر</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              كيف يحوّل الشاطر فوضى البكالوريا إلى مسار واضح؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              ثلاثة محاور أساسية تكمل بعضها: تعرف هدفك الجامعي أولاً، تلتزم بالدراسة اليومية، وترمم أخطاءك قبل الامتحان.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1: Orientation */}
            <div className="p-6 rounded-3xl bg-[#070B14] border border-emerald-500/30 hover:border-emerald-400 transition-all text-right space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                    <Compass className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    العمود الأول
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">① التوجيه: واش نقدر نقرا؟</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  تحسب معدلك الموزون الرسمي وتعرف كل التخصصات المؤهل لها (طب، ذكاء اصطناعي، مدارس عليا) بالمنشور الوزاري الحقيقي، باش تعرف بالضبط علامات المواد الأساسية اللي لازم تجيبها.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08]">
                <Link
                  href="/orientation"
                  onClick={() => handleSecondaryCtaClick("pillar_orientation")}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
                >
                  <span>جرّب مستكشف التوجيه الآن</span>
                  <Arrow className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Diwan Focus */}
            <div className="p-6 rounded-3xl bg-[#070B14] border border-amber-500/30 hover:border-amber-400 transition-all text-right space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                    <Landmark className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
                    العمود الثاني
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">② التركيز: ديوان العلم 🏛️</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  طاولة مذاكرة حية ثلاثية الأبعاد (3D Majlis) تجمعك مع زملاء من نفس شعبتك. توقيت بومودورو موحد، حل على الكراس بسلم التنقيط، وبدون أي إشعارات أو أصوات تشتت تركيزك.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08]">
                <Link
                  href="/diwan"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center justify-between"
                >
                  <span>استكشف طاولات ديوان العلم</span>
                  <Arrow className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Diagnostic & Error Lab */}
            <div className="p-6 rounded-3xl bg-[#070B14] border border-rose-500/30 hover:border-rose-400 transition-all text-right space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
                    <Brain className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/20">
                    العمود الثالث
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">③ النتيجة: التشخيص ومعمل الأخطاء</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  الغلطة في الشاطر معلومة لا تضيع. كل تمرين تعثرت فيه يتم التقاطه آلياً في معمل الأخطاء (Error Lab)، وتبرمج لك خوارزمية التكرار المتباعد مهمة علاجية واختبار توأم لتأكيد التمكن.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08]">
                <Link
                  href="/diagnostic"
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center justify-between"
                >
                  <span>ابدأ التشخيص البيداغوجي</span>
                  <Arrow className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          <div className="text-center pt-2">
            <Link href="/auth/register" onClick={() => handlePrimaryCtaClick("pillars_bottom")}>
              <Button
                variant="primary"
                size="lg"
                className="font-black px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm shadow-xl shadow-amber-500/20 cursor-pointer hover:scale-[1.02]"
              >
                <span>ابدأ مجاناً</span>
                <Arrow className="w-4 h-4 ms-2" />
              </Button>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 5 — ديوان العلم ومجالس المذاكرة الحقيقية (3D MAJLIS)         */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#070B14] border-b border-white/[0.08]" id="majlis-section" dir="rtl">
        <Container size="lg" className="space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Visual Preview */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0B1222] shadow-2xl p-4 group">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full">
                  <Image
                    src="/illustrations/majlis-table-bg.jpg"
                    alt="طاولة مجلس العلم التفاعلية"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1222] via-[#0B1222]/30 to-transparent" />
                  
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>مجلس دراسة مباشر: حل تمرين على الكراس</span>
                  </div>

                  <div className="absolute bottom-3 inset-x-3 p-3.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-right space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">موضوع الدارة الكهربائية RC</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px]">
                        متزامن عبر Supabase
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      توقيت موحد، إنهاء الحل بورقة وقلم، وظهور علامة الصح الخضراء وكشف سلم التنقيط الوزاري فوراً.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">مخصص لطلاب نفس الشعبة لضمان الجدية</span>
                  <Link href="/diwan" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                    <span>احجز مقعدك في المجلس</span>
                    <Arrow className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Description & 4 Modes */}
            <div className="lg:col-span-6 space-y-6 text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                <span>فضاء المذاكرة الجماعية الصامتة</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                ديوان العلم: طاولتك مع زملائك بجدية البكالوريا الحقيقية
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                تطبيق كامل لمفهوم Focus Study بدون مشتتات أو غرف صوتية مفتوحة. تدخل إلى مجلس محدد لشعبتك، تلتزم بالوقت، وتتدرب على حل التمارين بالكتابة الحقيقية.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>حل تمرين على الكراس ✍️</span>
                  </div>
                  <p className="text-slate-400 leading-tight">
                    عداد مشترك، تصحيح ذاتي، وترحيل الأخطاء لمعمل الذاكرة.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>تحديات السرعة والتواريخ ⚡</span>
                  </div>
                  <p className="text-slate-400 leading-tight">
                    15 ثانية لكل سؤال لترسيخ التواريخ والشخصيات بالترتيب الفوري.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>حلقة الحفظ والتثبيت 🧠</span>
                  </div>
                  <p className="text-slate-400 leading-tight">
                    حجب الكلمات المفتاحية واختبار الاسترجاع النشط الفوري.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>محاكاة موضوع كامل 📝</span>
                  </div>
                  <p className="text-slate-400 leading-tight">
                    توقيت رسمي كامل لتدريب النفس على إدارة الضغط والوقت.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link href="/diwan" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto font-black px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs shadow-lg cursor-pointer"
                  >
                    <span>ادخل ديوان العلم 🏛️</span>
                    <Arrow className="w-3.5 h-3.5 ms-1.5" />
                  </Button>
                </Link>
                <span className="text-[11px] text-slate-400">بيئة دراسية نظيفة 100% بدون تشويش</span>
              </div>

            </div>

          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 6 — التشخيص + معمل الأخطاء (مقارنة قبل / بعد)               */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#0B1222] border-b border-white/[0.08]" id="diagnostic-section" dir="rtl">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <Brain className="w-3.5 h-3.5 text-rose-400" />
              <span>منهجية معمل الأخطاء والتكرار المتباعد</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              الفرق بين مراجعة عشوائية.. وخريطة علاج مخصصة
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              الامتحان الرسمي لا يسامح على الأخطاء المنهجية المتكررة. إليك كيف يعالج الشاطر ثغراتك:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Old Random Way */}
            <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-right space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                <h3 className="text-base font-black text-rose-300">الطريقة التقليدية العشوائية ❌</h3>
                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                  تضييع نقاط مجانية
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>حل تمارين كثيرة متشابهة تعطي شعوراً زائفاً بالفهم دون لمس نقاط الضعف الحقيقية.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>الخطأ يُنسى بعد يومين ويتكرر بنفس الطريقة في الفرض وفي امتحان البكالوريا.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>عدم معرفة سبب الخطأ: هل هو نقص حفظ؟ تسرع في الحساب؟ أم جهل بسلم التنقيط؟</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>مراجعة المواد الثانوية على حساب المواد الأساسية ذات المعاملات المصيرية (6 و 7).</span>
                </li>
              </ul>
            </div>

            {/* The Shater Way */}
            <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 text-right space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <h3 className="text-base font-black text-emerald-300">طريقة الشاطر الذكية ✅</h3>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  ترميم حقيقي للثغرات
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>تشخيص أولي للمهارات:</strong> كشف المهارات الجزئية المفقودة بدقة في كل وحدة.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>معمل الأخطاء (Error Lab):</strong> حفظ آلي لكل تمرين أخطأت فيه وتصنيفه حسب نوع التعثر.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>إعادة اختبار توأم (Retest):</strong> تكرار متباعد بسؤال جديد مشابه للتأكد من زوال الخطأ نهائياً.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>المخطط اليومي التلقائي:</strong> تحويل الأخطاء لمهام يومية محددة لا تترك لك مجالاً للتسويف.</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="text-center pt-2">
            <Link href="/diagnostic">
              <Button
                variant="outline"
                size="md"
                className="rounded-2xl border-white/10 text-white hover:bg-white/[0.08] text-xs font-bold px-6 py-4 cursor-pointer"
              >
                <span>ابدأ التشخيص البيداغوجي لشعبتك مجاناً 🎯</span>
                <Arrow className="w-3.5 h-3.5 ms-2" />
              </Button>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 7 — الامتحانات الرسمية + QUICK RECALL (قسم خفيف)            */}
      {/* =================================================================== */}
      <section className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]" id="exams-section" dir="rtl">
        <Container size="lg">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/30 via-[#0B1222] to-amber-950/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-2 text-center md:text-right max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>أرشيف امتحانات البكالوريا 2008 - 2026</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                جميع مواضيع البكالوريا الرسمية بسلالم التنقيط الوزارية
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                مصنفة حسب الشعب، الوحدات، والسنوات مع محاكي Quick Recall لتثبيت التواريخ، المصطلحات، والقوانين الفيزيائية بالاسترجاع النشط.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link href="/exams" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto rounded-2xl border-white/10 text-white hover:bg-white/[0.08] text-xs font-bold px-6 py-4 cursor-pointer"
                >
                  <FileText className="w-4 h-4 me-1.5 text-blue-400" />
                  <span>تصفح بنك البكالوريات</span>
                </Button>
              </Link>

              <Link href="/auth/register" onClick={() => handlePrimaryCtaClick("exams_cta")} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-6 py-4 cursor-pointer"
                >
                  <span>ابدأ مجاناً</span>
                  <Arrow className="w-3.5 h-3.5 ms-1.5" />
                </Button>
              </Link>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 8 — الدليل الاجتماعي (قواعد الصدق الصارمة)                  */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#0B1222] border-b border-white/[0.08]" id="social-proof-section" dir="rtl">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <MessageSquareQuote className="w-3.5 h-3.5 text-blue-400" />
              <span>تجارب وعِبر البكالوريا الموثقة</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              نصائح حقيقية من متفوقين سبقوك وخاضوا نفس التجربة
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              عصارة تجارب منتقاة من بنك تجارب الشاطر عبر مختلف الولايات للتعلم من أخطائهم واختصار الطريق.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#070B14] border border-white/[0.08] text-right space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    معدل 18.94 • علوم تجريبية
                  </span>
                  <span className="text-[11px] text-slate-400">ولاية سطيف</span>
                </div>
                <h4 className="text-sm font-black text-white">سر تثبيت التواريخ والمصطلحات</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  «كنت كلما حفظت درساً أقوم بحجب الكلمات وإعادة استرجاعها على ورقة بيضاء. الاسترجاع النشط هو السر الحقيقي للثبات في الذاكرة طويلة المدى وعدم النسيان يوم الامتحان.»
                </p>
              </div>
              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
                منشور موثق في بنك تجارب البكالوريا
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#070B14] border border-white/[0.08] text-right space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    معدل 19.12 • رياضيات
                  </span>
                  <span className="text-[11px] text-slate-400">ولاية قسنطينة</span>
                </div>
                <h4 className="text-sm font-black text-white">العلامة الكاملة في مادة الرياضيات</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  «حللت جميع مواضيع البكالوريا الرسمية من 2008 مع التدقيق الصارم في سلم التنقيط المعتمد. النتيجة النهائية ليست كل شيء، المنهجية وطريقة صياغة البرهان هي الأساس.»
                </p>
              </div>
              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
                منشور موثق في بنك تجارب البكالوريا
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#070B14] border border-white/[0.08] text-right space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    معدل 17.80 • تقني رياضي
                  </span>
                  <span className="text-[11px] text-slate-400">ولاية وهران</span>
                </div>
                <h4 className="text-sm font-black text-white">تفادي فخاخ التحويل والوحدات في الفيزياء</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  «كنت أخطئ دائماً في التحويل بين الميلي ثانية والثانية ووحدات السعة في الدارة RC. تدوين الخطأ في معمل الأخطاء جعلني أنتبه له في البكالوريا تلقائياً دون تسرع.»
                </p>
              </div>
              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
                منشور موثق في بنك تجارب البكالوريا
              </div>
            </div>

          </div>

          <div className="text-center pt-2">
            <Link href="/experiences">
              <span className="text-xs text-slate-400 hover:text-white underline font-bold">
                تصفح جميع نصائح وتجارب المتفوقين في بنك التجارب ←
              </span>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 9 — قِسْم الأولياء (DEDICATED PARENTS SECTION)                */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#070B14] border-b border-white/[0.08]" id="parents-section" dir="rtl">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Visual/Image for Parent Assurance */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="rounded-3xl border border-white/10 bg-[#0B1222] p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">إلى أولياء أمور طلاب البكالوريا</h4>
                    <span className="text-[11px] text-slate-400">راحة بالكم ومرافقة تفوق أبنائكم مسؤوليتنا</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <strong className="text-white block">ماذا يحصل عليه ابنكم أسبوعياً؟</strong>
                    <p className="text-slate-400">
                      خطة مراجعة يومية واضحة بدون تخبط، طاولات تركيز دراسية خالية من مواقع التواصل، وتقارير أداء تبيّن المهارات المتقنة بدقة.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <strong className="text-white block">حماية تامة من التشتت وضياع الوقت</strong>
                    <p className="text-slate-400">
                      المنصة بيئة أكاديمية مغلقة لا تحتوي على صور أو محادثات عشوائية، ومصممة لغرس الانضباط والمسؤولية الذاتية لدى الطالب.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <strong className="text-white block">توصيل كود التفعيل والدفع عند الاستلام (58 ولاية)</strong>
                    <p className="text-slate-400">
                      لا تحتاجون لبطاقة بنكية. يصلكم ظرف المنصة الرسمي إلى باب المنزل مع الموزع، وتدفعون نقداً عند الاستلام.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <a
                    href={`https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
                      LANDING_CONFIG.support.parentMessage
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleWhatsAppClick("parent")}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/25"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تواصل معنا كوليّ أمر عبر واتساب للاستفسار والطلب</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Parent Copy */}
            <div className="lg:col-span-7 space-y-5 text-right order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ركن الأولياء والعائلات</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                نعلم قلقكم على مستقبل ابنكم.. <br />
                <span className="text-amber-400">الشاطر يمنحكم الطمأنينة والانضباط المدروس.</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                سنة البكالوريا ليست مجرد مجهود فردي للطالب، بل هي استثمار عائلي كامل في الوقت والمال والأعصاب. بدلاً من مراقبة الهاتف والصراخ المستمر حول إضاعة الوقت، تمنح منصة الشاطر ابنكم مساراً يومياً موجهاً يحميه من فوضى الإنترنت ويوجه طاقته نحو ما يُحدث فارقاً حقيقياً في النتيجة.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <strong className="text-white block mb-0.5">شفافية كاملة في الأسعار</strong>
                  <span className="text-slate-400">اشتراك سنوي واحد يغطي كامل الموسم دون مصاريف خفية.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <strong className="text-white block mb-0.5">تجربة مجانية كاملة</strong>
                  <span className="text-slate-400">أسبوع كامل لاختبار جودة المنصة وملاحظة الفرق قبل أي قرار بالدفع.</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
                    LANDING_CONFIG.support.parentMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleWhatsAppClick("parent")}
                  className="w-full sm:w-auto text-center"
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto rounded-2xl border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold px-6 py-4 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>محادثة خاصة بالأولياء عبر واتساب</span>
                  </Button>
                </a>
                <span className="text-[11px] text-slate-400">فريقنا متاح للإجابة على جميع تساؤلاتكم التربوية</span>
              </div>

            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 10 — الفترة المجانية + الأسعار وطرق الدفع بالتفصيل         */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#0B1222] border-b border-white/[0.08]" id="pricing-section" dir="rtl">
        <Container size="lg" className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>اشتراكات واضحة بدون غموض</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              ابدأ بـ 7 أيام تجربة مجانية (0 دج).. ثم اختر ما يناسبك
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              لا نطلب أي بطاقة بنكية عند التسجيل. جرّب المنصة بحرية، وادفع فقط إذا شعرت بالفرق الحقيقي في مستواك.
            </p>
          </div>

          {/* Pricing Cards Grid (Dynamic from LANDING_CONFIG) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {LANDING_CONFIG.plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-6 sm:p-8 rounded-3xl transition-all cursor-pointer text-right flex flex-col justify-between relative border ${
                    isSelected
                      ? "bg-[#070B14] border-amber-400 shadow-2xl shadow-amber-400/10 scale-[1.02]"
                      : "bg-[#070B14]/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.badgeAr && (
                    <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-md">
                      {plan.badgeAr}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{plan.nameAr}</h3>
                      <p className="text-xs text-slate-400 pt-1">{plan.descriptionAr}</p>
                    </div>

                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                        {plan.priceDzd.toLocaleString("fr-DZ")}
                      </span>
                      <span className="text-sm font-bold text-slate-300">دج</span>
                      <span className="text-xs text-slate-400 font-medium">/ {plan.periodAr}</span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] space-y-2.5">
                      <div className="text-xs font-bold text-slate-300">ما يشمله الاشتراك:</div>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link href="/auth/register" onClick={() => handlePrimaryCtaClick(`pricing_${plan.id}`)}>
                      <Button
                        variant={isSelected ? "primary" : "outline"}
                        size="md"
                        className={`w-full font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20"
                            : "border-white/10 text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <span>ابدأ مجاناً</span>
                        <Arrow className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <span className="text-[10px] text-slate-400 text-center block pt-2">
                      أسبوع كامل مجاناً قبل أي دفع
                    </span>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Payment Methods Breakdown */}
          <div className="max-w-4xl mx-auto space-y-6 pt-4">
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-black text-white">3 طرق دفع مريحة تناسب كل ولايات الجزائر</h3>
              <p className="text-xs text-slate-400">تختار الطريقة بعد انتهاء فترة الـ 7 أيام المجانية بكل وضوح وبدون تعقيد:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LANDING_CONFIG.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-right space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{method.nameAr}</span>
                    {method.id === "baridimob" && <Smartphone className="w-4 h-4 text-emerald-400" />}
                    {method.id === "ccp" && <FileText className="w-4 h-4 text-blue-400" />}
                    {method.id === "cod" && <Truck className="w-4 h-4 text-purple-400" />}
                  </div>

                  <span className="text-[10px] text-emerald-400 font-bold block bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit">
                    {method.speedAr}
                  </span>

                  <ol className="space-y-1.5 text-[11px] text-slate-300 list-decimal list-inside leading-relaxed">
                    {method.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 11 — الأسئلة الشائعة (FAQ) وتفكيك الاعتراضات                */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-[#070B14] border-b border-white/[0.08]" id="faq-section" dir="rtl">
        <Container size="md" className="space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>الأسئلة الشائعة</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              كل ما يدور في بالك.. بإجابات صريحة ومباشرة
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              إجابات واضحة على أكثر التساؤلات شيوعاً بين الطلاب والأولياء.
            </p>
          </div>

          <div className="space-y-3">
            {LANDING_CONFIG.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-[#0B1222] overflow-hidden transition-all text-right"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-black text-white leading-snug">
                      {faq.question}
                    </span>
                    <span className="shrink-0 text-slate-400">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-white/[0.04] text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2 text-xs">
            <span className="text-slate-400 block">عندك سؤال آخر لم تجد إجابته هنا؟</span>
            <a
              href={`https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
                LANDING_CONFIG.support.studentMessage
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleWhatsAppClick("student")}
              className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>تواصل مع فريق الدعم مباشرة عبر واتساب</span>
            </a>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 12 — CTA الختامي + التذييل (FINAL CTA & FOOTER)             */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#070B14] via-[#0B1222] to-[#070B14] border-b border-white/[0.08] relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="md" className="relative z-10 text-center space-y-8">
          
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-block">
              {trialDays} أيام تجربة استكشافية مجانية (0 دج)
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              الباك ماشي صدفة.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                والشاطر يحط خدمتك في بلاصتها.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              لا تؤجل انطلاقتك حتى تفوتك الأشهر الأولى. انضم الآن، احسب معدلك الموزون، وادخل مجلس العلم اليوم.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register" onClick={() => handlePrimaryCtaClick("final_footer")} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-black px-10 py-5 rounded-2xl text-base bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-2xl shadow-amber-500/30 cursor-pointer hover:scale-[1.02]"
              >
                <span>ابدأ مجاناً</span>
                <Arrow className="w-4 h-4 ms-2" />
              </Button>
            </Link>

            <Link href="/orientation" onClick={() => handleSecondaryCtaClick("final_footer")} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-5 rounded-2xl font-bold text-sm bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]"
              >
                <span>جرّب واش نقدر نقرا</span>
              </Button>
            </Link>
          </div>

          <div className="pt-6 space-y-1 text-xs text-slate-400">
            <div className="font-bold text-white text-sm">الشاطر | SHATER BAC 2026/2027</div>
            <div>نبني الإنسان الشاطر، ونبدأ بالبكالوريا.</div>
            <div className="text-amber-400 font-bold pt-0.5">« ماشي غير تقرا... كيفاش توصل. »</div>
          </div>

        </Container>
      </section>

      {/* COMPACT FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#070B14] py-10 text-xs text-slate-400" dir="rtl">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Logo size="sm" showTagline={false} />
              <span className="text-[11px] text-slate-400">
                © {new Date().getFullYear()} SHATER BAC — جميع الحقوق محفوظة لطلاب الجزائر 🇩🇿
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold flex-wrap justify-center">
              <Link href="/orientation" className="text-emerald-400 hover:underline font-bold">واش نقدر نقرا؟ 🎓</Link>
              <Link href="/diwan" className="text-amber-400 hover:underline font-bold">ديوان العلم 🏛️</Link>
              <Link href="/diagnostic" className="hover:text-white">التشخيص</Link>
              <Link href="/error-lab" className="hover:text-white">معمل الأخطاء</Link>
              <Link href="/exams" className="hover:text-white">بنك البكالوريات</Link>
              <Link href="/curriculum" className="hover:text-white">الدروس والملخصات</Link>
              <Link href="/experiences" className="hover:text-white">بنك التجارب</Link>
              <Link href="/planner" className="hover:text-white">المخطط اليومي</Link>
              <Link href="/calculator" className="hover:text-white">حاسبة المعدل</Link>
              <Link href="/faq" className="hover:text-white">الأسئلة الشائعة</Link>
              <Link href="/auth" className="hover:text-white">تسجيل الدخول</Link>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>منصة الشاطر مصممة خصيصاً للتحضير المتفوق لشهادة البكالوريا الجزائرية.</span>
            <a
              href={`https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
                LANDING_CONFIG.support.studentMessage
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleWhatsAppClick("student")}
              className="text-emerald-400 font-bold hover:underline"
            >
              خدمة الدعم والاستفسارات عبر واتساب:{" "}
              <span dir="ltr" className="font-mono inline-block text-left" style={{ unicodeBidi: "isolate" }}>
                {LANDING_CONFIG.support.displayPhone}
              </span>
            </a>
          </div>
        </Container>
      </footer>

      {/* MOBILE STICKY BOTTOM CTA BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 p-3 bg-[#0B1222]/95 backdrop-blur-xl border-t border-white/10 md:hidden z-30 flex items-center justify-between gap-3 shadow-2xl"
        dir="rtl"
      >
        <div className="text-right">
          <span className="text-xs font-black text-white block">SHATER BAC 2026/2027</span>
          <span className="text-[10px] text-emerald-400 font-bold">{trialDays} أيام تجربة مجانية (0 دج)</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/orientation"
            onClick={() => handleSecondaryCtaClick("mobile_sticky")}
            className="shrink-0"
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs px-3 py-2 bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            >
              <span>التوجيه 🎓</span>
            </Button>
          </Link>
          <Link
            href="/auth/register"
            onClick={() => handlePrimaryCtaClick("mobile_sticky")}
            className="shrink-0"
          >
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl font-black text-xs px-4 py-2 bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
            >
              <span>ابدأ مجاناً</span>
              <Arrow className="w-3.5 h-3.5 ms-1" />
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
