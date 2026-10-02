"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/ui/AppShell";
import { Logo, ShaterIcon } from "@/components/ui/Logo";
import { StudentService } from "@/lib/services";
import { StudentProfile } from "@/types/student";
import { trackEvent } from "@/lib/analytics";
import { LANDING_CONFIG } from "@/lib/constants/landing-config";
import { HeroInteractiveOrientation } from "./HeroInteractiveOrientation";
import { useLandingUtm } from "@/lib/hooks/useLandingUtm";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Compass,
  Landmark,
  Brain,
  FileText,
  Zap,
  Award,
  Users,
  ShieldCheck,
  Smartphone,
  Truck,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Target,
  Smile,
} from "lucide-react";

export function LandingView() {
  const { t, direction } = useTranslation();
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const { buildAuthUrl } = useLandingUtm("lp_main");

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active pricing tab
  const [selectedPlanId, setSelectedPlanId] = useState<string>("season");

  // Payment methods folded accordion state
  const [showPaymentDetails, setShowPaymentDetails] = useState<boolean>(false);

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

  const signupUrl = buildAuthUrl("/auth/register");

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

      <div className="min-h-screen bg-[#F7F3EA] text-[#0F172A] selection:bg-[#DCE9E4] selection:text-[#0F172A] font-sans" dir="rtl">
        {/* 0. Top Live Announcement Banner */}
        <div
          className="bg-[#EFE9DC] border-b border-[#E4DED2] px-4 py-2 text-center text-xs font-semibold text-[#0F172A] flex items-center justify-center gap-3 relative z-30"
          dir="rtl"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#5F8F86] animate-ping shrink-0" />
          <span className="text-[#334155]">
            جديد البكالوريا 2026/2027: تم فتح <strong>«مستكشف التوجيه وحساب المعدل الموزون»</strong> مجاناً لجميع الشعب.
          </span>
          <Link
            href="/orientation"
            onClick={() => handleSecondaryCtaClick("top_announcement")}
            className="inline-flex items-center gap-1 bg-[#5F8F86] hover:bg-[#527D75] text-white px-3 py-0.5 rounded-full text-[11px] font-bold transition-all shrink-0 shadow-sm"
          >
            <span>جرّب واش نقدر نقرا</span>
            <Arrow className="w-3 h-3" />
          </Link>
        </div>

        {/* Returning User Notification Banner */}
        {user && (
          <div
            className="bg-[#DCE9E4] border-b border-[#5F8F86]/30 text-[#0F172A] px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3 relative z-20"
            dir="rtl"
          >
            <span>
              {`مرحباً بك مجدداً ${studentName ? studentName : ""}! خريطتك التعليمية ومجلس العلم بانتظارك.`}
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 bg-[#5F8F86] hover:bg-[#527D75] text-white px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 shadow-sm"
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
          className="relative pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-[#E4DED2] overflow-hidden bg-gradient-to-b from-[#F7F3EA] via-[#FAF7F0] to-[#F7F3EA]"
          id="hero-section"
          dir="rtl"
        >
          {/* Subtle Warm Brand Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#5F8F86]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 left-10 w-[450px] h-[350px] bg-[#D7A66A]/10 rounded-full blur-3xl pointer-events-none" />

          <Container size="lg" className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Main Copy Column */}
              <div className="lg:col-span-6 text-center lg:text-right space-y-5">
                
                {/* Official Stream & Scope Pill */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5F8F86]/30 bg-[#DCE9E4] px-3.5 py-1 text-xs font-bold text-[#385853]">
                    <ShaterIcon size={14} />
                    <span>نظام تشغيل البكالوريا 2026/2027 🇩🇿</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#6E9B7B]/30 bg-[#E8F2EB] px-3 py-1 text-xs font-bold text-[#245431]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9B7B]" />
                    <span>تغطية 6 شُعب رسمية</span>
                  </div>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F172A] leading-[1.25]">
                  مش غير تقرا... <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#26302F] via-[#5F8F86] to-[#D7A66A]">
                    كيفاش تراجع ووين توصل.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-[#334155] leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  منظومة ذكية تجمع مستكشف التوجيه الرسمي، مجالس المذاكرة المتزامنة، ومعمل رصد الأخطاء لضمان نتيجتك يوم الامتحان بكل ثقة وهدوء.
                </p>

                {/* Primary & Secondary Call to Actions */}
                <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 flex-wrap">
                  <Link
                    href={signupUrl}
                    onClick={() => handlePrimaryCtaClick("hero_primary")}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm bg-[#5F8F86] hover:bg-[#527D75] text-white shadow-lg shadow-[#5F8F86]/25 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                      <span>اكتشف مستواك وابنِ خطتك للباك 🚀</span>
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
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm bg-white hover:bg-[#FAF7F0] border-[#E4DED2] text-[#0F172A] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Compass className="h-4 w-4 text-[#5F8F86]" />
                      <span>جرّب واش نقدر نقرا</span>
                    </Button>
                  </Link>
                </div>

                {/* Frictionless Trust Badges */}
                <div className="text-xs text-[#475569] font-medium flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[#245431] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9B7B]" />
                    <span>{trialDays} أيام تجربة مجانية كاملة (0 دج)</span>
                  </span>
                  <span>•</span>
                  <span>بدون بطاقة بنكية</span>
                  <span>•</span>
                  <span>بدون أي التزام مسبق</span>
                </div>

                {/* Hero Student Trust Snippet with Authentic Visual */}
                <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <Image
                      src="/illustrations/shater-hero.jpg"
                      alt="طالب جزائري يدرس بتركيز"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#0F172A]">مذاكرة هادئة ومنهجية</p>
                    <p className="text-[11px] text-[#475569]">حل بالكراس وسلالم التنقيط الوزارية الرسمية</p>
                  </div>
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
        {/* SECTION 2 — شريط الثقة الموثق (TRUST STRIP)                         */}
        {/* =================================================================== */}
        <section className="py-5 sm:py-6 bg-[#EFE9DC]/60 border-b border-[#E4DED2]" dir="rtl">
          <Container size="lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              
              <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] shadow-sm space-y-0.5">
                <div className="text-xs font-black text-[#8C5D23] flex items-center justify-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-[#D7A66A]" />
                  <span>المنشور الوزاري رقم 01</span>
                </div>
                <p className="text-[11px] text-[#475569] font-medium">مبني على دورة 2026/2027 الرسمية</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] shadow-sm space-y-0.5">
                <div className="text-xs font-black text-[#245431] flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#6E9B7B]" />
                  <span>58 ولاية جزائرية</span>
                </div>
                <p className="text-[11px] text-[#475569] font-medium">تغطية لكل ثانويات الوطن</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] shadow-sm space-y-0.5">
                <div className="text-xs font-black text-[#385853] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5F8F86]" />
                  <span>تجربة بدون بطاقة</span>
                </div>
                <p className="text-[11px] text-[#475569] font-medium">ابدأ الآن بدون إدخال وسيلة دفع</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] shadow-sm space-y-0.5">
                <div className="text-xs font-black text-[#8C5D23] flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#D7A66A]" />
                  <span>البطاقة الذهبية / كود للبيت</span>
                </div>
                <p className="text-[11px] text-[#475569] font-medium">الدفع عند الاستلام لـ 58 ولاية</p>
              </div>

            </div>
          </Container>
        </section>

        {/* =================================================================== */}
        {/* NEW HIGH-EMOTION SECTION: قصة طالب البكالوريا: قبل الشاطر وبعده     */}
        {/* =================================================================== */}
        <section className="py-14 sm:py-20 bg-[#F7F3EA] border-b border-[#E4DED2]" id="transformation-story" dir="rtl">
          <Container size="lg" className="space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F9EFE2] border border-[#D7A66A]/40 text-[#8C5D23] text-xs font-bold">
                <Heart className="w-3.5 h-3.5 text-[#D7A66A]" />
                <span>التحول الحقيقي في رحلتك</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                من حيرة التشتت وضياع الوقت.. إلى وضوح الهدف والسكينة الذهنية
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                عايشنا تجارب آلاف طلاب البكالوريا في الجزائر.. الفرق بين من يحقق حلمه ومن يتعثر ليس الذكاء، بل النظام والتركيز.
              </p>
            </div>

            {/* Emotional Side-by-Side Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
              
              {/* Card 1: Before Shater */}
              <div className="rounded-3xl bg-white border border-[#E4DED2] p-5 sm:p-7 shadow-sm hover:shadow-card transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Photo Before */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] w-full border border-[#E4DED2]">
                    <Image
                      src="/illustrations/shater-overwhelmed.jpg"
                      alt="طالب متشتت بين مئات الملفات ومشتتات الهاتف"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#F9EAE8] border border-[#C8796B]/30 text-[#9E3A2B] text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C8796B]" />
                      <span>قبل الشاطر: دوامة الاستنزاف</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <h3 className="text-lg font-black text-[#0F172A]">تراكم الدروس، تشتت المراجع وتأنيب الضمير</h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      ساعات تضيع في التنقل بين قنوات تيليغرام ومجموعات فيسبوك، تنزيل عشرات الملخصات دون فتحها، ثم النوم كل ليلة بحرقة قلب وإحساس بالتقصير.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs text-[#334155] border-t border-[#E4DED2] pt-3">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8796B] font-bold">✕</span>
                      <span>ساعات تضيع في الشاشات والفيديوهات دون تدريب فعلي بالورقة والقلم.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8796B] font-bold">✕</span>
                      <span>تكرار نفس الأخطاء في الفروض دون معرفة السبب الحقيقي وراء خسارة النقاط.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8796B] font-bold">✕</span>
                      <span>خوف دائم وقلق عائلي من عدم الوصول للمعدل المؤهل للتخصص المنشود.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 text-center text-xs text-[#475569] font-medium bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E4DED2]">
                  طاقة مهدورة دون نتيجة ملموسة في ورقة الامتحان
                </div>
              </div>

              {/* Card 2: After Shater */}
              <div className="rounded-3xl bg-white border-2 border-[#5F8F86] p-5 sm:p-7 shadow-clay transition-all flex flex-col justify-between space-y-5 relative">
                <div className="absolute -top-3.5 right-6 px-3.5 py-0.5 rounded-full bg-[#5F8F86] text-white font-black text-xs shadow-md">
                  مسارك المضمون مع الشاطر ✨
                </div>

                <div className="space-y-4">
                  {/* Photo After */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] w-full border border-[#DCE9E4]">
                    <Image
                      src="/illustrations/shater-confidence.jpg"
                      alt="طالب يراجع بثقة وهدوء مع الشاطر"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#E8F2EB] border border-[#6E9B7B]/30 text-[#245431] text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9B7B]" />
                      <span>مع الشاطر: راحة البال والتحكم</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <h3 className="text-lg font-black text-[#0F172A]">وضوح الهدف، انضباط يومي، وترميم فوري للثغرات</h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      خطة مراجعة يومية محددة بالدقيقة، مجالس مذاكرة حية تجمعك بزملاء شعبتك للحل بالكراس، ومعمل ذكي يلتقط أخطاءك ليعيد تدريبك عليها حتى تتقنها تماماً.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs text-[#334155] border-t border-[#E4DED2] pt-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#5F8F86] shrink-0 mt-0.5" />
                      <span><strong>معرفة المعدل الموزون الحقيقي</strong> وموادك المصيرية بالمنشور الوزاري من اليوم الأول.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#5F8F86] shrink-0 mt-0.5" />
                      <span><strong>ديوان العلم:</strong> تركيز جماعي صامت وحل على الكراس بسلم التنقيط بدون مشتتات.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#5F8F86] shrink-0 mt-0.5" />
                      <span><strong>معمل الأخطاء والذاكرة:</strong> تحويل كل عثرة إلى نقطة قوة قبل يوم الامتحان الرسمي.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Link href={signupUrl} onClick={() => handlePrimaryCtaClick("transformation_card")}>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full rounded-2xl bg-[#5F8F86] hover:bg-[#527D75] text-white font-black text-xs py-3 shadow-md shadow-[#5F8F86]/20 cursor-pointer"
                    >
                      <span>عالج ثغراتك وابدأ التحضير الذكي 🎯</span>
                      <Arrow className="w-3.5 h-3.5 ms-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 3 — المشكلة: 4 عوائق حقيقية في شريط مدمج (CONDENSED STRIP)   */}
        {/* =================================================================== */}
        <section className="py-10 sm:py-14 bg-[#FAF7F0] border-b border-[#E4DED2]" id="problem-section" dir="rtl">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9EAE8] border border-[#C8796B]/30 text-[#9E3A2B] text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-[#C8796B]" />
                <span>واقع التحضير اليومي</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                أربعة عوائق يومية ننهيها تماماً
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-medium">
                الخلل ليس في قدراتك، بل في غياب نظام واضح يوجه تركيزك ويحمي جهدك.
              </p>
            </div>

            {/* Compact 4-Card Horizontal Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <div className="p-4 rounded-2xl bg-white border border-[#E4DED2] hover:border-[#C8796B]/50 transition-all text-right space-y-2 shadow-sm">
                <span className="text-2xl block">📱</span>
                <h3 className="text-xs font-black text-[#0F172A]">التمرير وتأنيب الضمير</h3>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  ساعات تضيع في إنستغرام وتيك توك، والكراس لا يفتح، وتنام بحرقة وتأنيب ضمير.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E4DED2] hover:border-[#D7A66A]/50 transition-all text-right space-y-2 shadow-sm">
                <span className="text-2xl block">🎲</span>
                <h3 className="text-xs font-black text-[#0F172A]">توهم الفهم بالمراجعة</h3>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  حل تمارين مكررة روتينية ثم الاصطدام بالأسئلة المنهجية المركبة في الفرض والباك.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E4DED2] hover:border-[#5F8F86]/50 transition-all text-right space-y-2 shadow-sm">
                <span className="text-2xl block">😰</span>
                <h3 className="text-xs font-black text-[#0F172A]">ضبابية الهدف الجامعي</h3>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  تعب مستمر دون معرفة المعدل الموزون الحقيقي للتخصص الذي تحلم به بالمنشور الوزاري.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E4DED2] hover:border-[#5F8F86]/50 transition-all text-right space-y-2 shadow-sm">
                <span className="text-2xl block">📚</span>
                <h3 className="text-xs font-black text-[#0F172A]">تخمة الفيديوهات والملفات</h3>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  تراكم عشرات القنوات والملخصات دون تدريب حقيقي بورقة وقلم بسلالم التنقيط.
                </p>
              </div>

            </div>

            <div className="text-center pt-1">
              <Link
                href={signupUrl}
                onClick={() => handlePrimaryCtaClick("problem_cta")}
                className="text-[#385853] hover:text-[#0F172A] text-xs font-bold inline-flex items-center gap-1.5 underline decoration-[#5F8F86]"
              >
                <span>انتقل إلى الدراسة المنظمة مع الشاطر مجاناً لمدة 7 أيام</span>
                <Arrow className="w-3.5 h-3.5" />
              </Link>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 4 — الحل: الأعمدة الثلاثة (THREE PILLARS)                    */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#F7F3EA] border-b border-[#E4DED2]" id="solution-section" dir="rtl">
          <Container size="lg" className="space-y-10">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE9E4] border border-[#5F8F86]/30 text-[#385853] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#5F8F86]" />
                <span>منظومة متكاملة للتفوق</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                الأعمدة الثلاثة للتحضير المتفوق للبكالوريا
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-medium">
                تحدد هدفك، تلتزم يومياً بالمذاكرة الحقيقية، وترمم ثغراتك قبل الامتحان.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Pillar 1: Orientation */}
              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] hover:border-[#5F8F86] transition-all text-right space-y-3 flex flex-col justify-between shadow-sm hover:shadow-card">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-2xl bg-[#DCE9E4] text-[#385853] flex items-center justify-center font-bold border border-[#5F8F86]/30">
                      <Compass className="w-4 h-4 text-[#5F8F86]" />
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#DCE9E4] text-[#385853] px-2 py-0.5 rounded-full border border-[#5F8F86]/30">
                      العمود 1
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0F172A]">① التوجيه: واش نقدر نقرا؟</h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    حساب المعدل الموزون الرسمي ومعرفة التخصصات المؤهل لها بالمنشور الوزاري الحقيقي لتحديد موادك المصيرية بدقة.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E4DED2]">
                  <Link
                    href="/orientation"
                    onClick={() => handleSecondaryCtaClick("pillar_orientation")}
                    className="text-xs font-bold text-[#5F8F86] hover:text-[#527D75] flex items-center justify-between"
                  >
                    <span>مستكشف التوجيه الجامعي</span>
                    <Arrow className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Pillar 2: Diwan Focus */}
              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] hover:border-[#D7A66A] transition-all text-right space-y-3 flex flex-col justify-between shadow-sm hover:shadow-card">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-2xl bg-[#F9EFE2] text-[#8C5D23] flex items-center justify-center font-bold border border-[#D7A66A]/40">
                      <Landmark className="w-4 h-4 text-[#D7A66A]" />
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#F9EFE2] text-[#8C5D23] px-2 py-0.5 rounded-full border border-[#D7A66A]/30">
                      العمود 2
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0F172A]">② التركيز: ديوان العلم 🏛️</h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    طاولات مذاكرة حية تجمعك بزملاء شعبتك. توقيت موحد وحل على الكراس بسلم التنقيط الوزاري بدون أي مشتتات.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E4DED2]">
                  <Link
                    href="/diwan"
                    className="text-xs font-bold text-[#8C5D23] hover:text-[#6D4518] flex items-center justify-between"
                  >
                    <span>استكشف طاولات ديوان العلم</span>
                    <Arrow className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Pillar 3: Diagnostic & Error Lab */}
              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] hover:border-[#C8796B] transition-all text-right space-y-3 flex flex-col justify-between shadow-sm hover:shadow-card">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-2xl bg-[#F9EAE8] text-[#9E3A2B] flex items-center justify-center font-bold border border-[#C8796B]/30">
                      <Brain className="w-4 h-4 text-[#C8796B]" />
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#F9EAE8] text-[#9E3A2B] px-2 py-0.5 rounded-full border border-[#C8796B]/30">
                      العمود 3
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0F172A]">③ النتيجة: معمل الأخطاء 🔬</h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    رصد آلي لكل تمرين أخطأت فيه، وإعادة برمجته بتكرار متباعد واختبار توأم للتأكد من إتقانه التام قبل البكالوريا.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E4DED2]">
                  <Link
                    href="/diagnostic"
                    className="text-xs font-bold text-[#9E3A2B] hover:text-[#7A2A1E] flex items-center justify-between"
                  >
                    <span>التشخيص ومعمل الأخطاء</span>
                    <Arrow className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

            <div className="text-center pt-1">
              <Link href={signupUrl} onClick={() => handlePrimaryCtaClick("pillars_bottom")}>
                <Button
                  variant="primary"
                  size="md"
                  className="font-black px-7 py-3.5 rounded-2xl bg-[#5F8F86] hover:bg-[#527D75] text-white text-xs shadow-md shadow-[#5F8F86]/20 cursor-pointer"
                >
                  <span>جرّب الركائز الثلاث وفعّل جاهزيتك ⚡</span>
                  <Arrow className="w-3.5 h-3.5 ms-1.5" />
                </Button>
              </Link>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 5 — ديوان العلم ومجالس المذاكرة الحقيقية                     */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#FAF7F0] border-b border-[#E4DED2]" id="majlis-section" dir="rtl">
          <Container size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Visual Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative rounded-3xl overflow-hidden border border-[#E4DED2] bg-white shadow-card p-3 sm:p-4 group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full border border-[#E4DED2]">
                    <Image
                      src="/illustrations/shater-friends.jpg"
                      alt="مجموعة من طلاب البكالوريا يدرسون بتركيز وتعاون"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/20 to-transparent" />
                    
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#E8F2EB] border border-[#6E9B7B]/40 text-[#245431] text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-[#6E9B7B] animate-pulse" />
                      <span>مجلس دراسة مباشر: حل تمرين على الكراس</span>
                    </div>

                    <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#E4DED2] text-right space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0F172A]">موضوع الدارة الكهربائية RC (تطبيق حي)</span>
                        <span className="font-mono text-[#245431] font-bold bg-[#E8F2EB] px-2 py-0.5 rounded-full text-[10px]">
                          مزامنة هادئة
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569] leading-tight">
                        توقيت موحد، حل بالورقة والقلم، واحتساب النتيجة بسلم التنقيط الوزاري فوراً.
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-[#E4DED2] flex items-center justify-between text-xs">
                    <span className="text-[#475569] font-medium">مخصص لطلاب نفس الشعبة لضمان الجدية التامة</span>
                    <Link href="/diwan" className="text-[#5F8F86] font-bold hover:underline flex items-center gap-1">
                      <span>احجز مقعدك في المجلس</span>
                      <Arrow className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Description & 4 Study Modes */}
              <div className="lg:col-span-6 space-y-5 text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9EFE2] border border-[#D7A66A]/40 text-[#8C5D23] text-xs font-bold">
                  <Landmark className="w-3.5 h-3.5 text-[#D7A66A]" />
                  <span>المذاكرة الجماعية الصامتة</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] leading-tight">
                  ديوان العلم: طاولتك مع زملائك بتركيز تام
                </h2>

                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-medium">
                  تطبيق لمفهوم Focus Study بدون مشتتات. تدخل إلى مجلس محدد لشعبتك، تلتزم بالوقت، وتتدرب على حل التمارين بالكتابة الحقيقية.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] space-y-0.5 shadow-sm">
                    <div className="font-black text-[#0F172A] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#D7A66A]" />
                      <span>حل تمرين على الكراس ✍️</span>
                    </div>
                    <p className="text-[#475569] text-[11px] leading-tight">
                      عداد مشترك، تصحيح ذاتي، وترحيل الأخطاء لمعمل الذاكرة.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] space-y-0.5 shadow-sm">
                    <div className="font-black text-[#0F172A] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#5F8F86]" />
                      <span>تحديات السرعة والتواريخ ⚡</span>
                    </div>
                    <p className="text-[#475569] text-[11px] leading-tight">
                      15 ثانية لكل سؤال لترسيخ التواريخ والشخصيات فوراً.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] space-y-0.5 shadow-sm">
                    <div className="font-black text-[#0F172A] flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-[#C8796B]" />
                      <span>حلقة الحفظ والتثبيت 🧠</span>
                    </div>
                    <p className="text-[#475569] text-[11px] leading-tight">
                      حجب الكلمات المفتاحية واختبار الاسترجاع النشط الفوري.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E4DED2] space-y-0.5 shadow-sm">
                    <div className="font-black text-[#0F172A] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#6E9B7B]" />
                      <span>محاكاة موضوع كامل 📝</span>
                    </div>
                    <p className="text-[#475569] text-[11px] leading-tight">
                      توقيت رسمي كامل للتدريب على إدارة الوقت والضغط.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                  <Link href={user ? "/diwan" : "/auth?redirectTo=/diwan"} className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full sm:w-auto font-black px-6 py-3 rounded-2xl bg-[#5F8F86] hover:bg-[#527D75] text-white text-xs shadow-md shadow-[#5F8F86]/20 cursor-pointer"
                    >
                      <span>ادخل مجالس العلم مع زملائك 🏛️</span>
                      <Arrow className="w-3.5 h-3.5 ms-1.5" />
                    </Button>
                  </Link>
                  <span className="text-[11px] text-[#475569]">مذاكرة حية وجلسات تركيز هادئة</span>
                </div>

              </div>

            </div>
          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 6 — الامتحانات الرسمية (2016 - 2026)                        */}
        {/* =================================================================== */}
        <section className="py-10 sm:py-12 bg-[#F7F3EA] border-b border-[#E4DED2]" id="exams-section" dir="rtl">
          <Container size="lg">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4DED2] shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
              
              <div className="space-y-1.5 text-center md:text-right max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCE9E4] text-[#385853] text-[11px] font-bold border border-[#5F8F86]/30">
                  <FileText className="w-3.5 h-3.5 text-[#5F8F86]" />
                  <span>أرشيف امتحانات البكالوريا 2016 - 2026</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">
                  مواضيع البكالوريا الرسمية بسلالم التنقيط الوزارية
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed font-medium">
                  مصنفة حسب الشعب والوحدات، مع محاكي Quick Recall لتثبيت التواريخ والمصطلحات بالاسترجاع النشط.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <Link href={user ? "/exams" : "/auth?redirectTo=/exams"} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto rounded-2xl border-[#E4DED2] text-[#0F172A] hover:bg-[#FAF7F0] text-xs font-bold px-5 py-3 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 me-1.5 text-[#5F8F86]" />
                    <span>تصفح بنك البكالوريات</span>
                  </Button>
                </Link>

                <Link href={signupUrl} onClick={() => handlePrimaryCtaClick("exams_cta")} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto rounded-2xl bg-[#5F8F86] hover:bg-[#527D75] text-white text-xs font-black px-6 py-3 cursor-pointer shadow-md shadow-[#5F8F86]/20"
                  >
                    <span>تدرّب على مواضيع البكالوريا الرسمية 📝</span>
                    <Arrow className="w-3.5 h-3.5 ms-1" />
                  </Button>
                </Link>
              </div>

            </div>
          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 7 — ركن الأولياء (COMPACT WITH EMOTIONAL PHOTOGRAPH)        */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#FAF7F0] border-b border-[#E4DED2]" id="parents-section" dir="rtl">
          <Container size="lg">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4DED2] shadow-card flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Parent Photo Card */}
              <div className="relative w-full lg:w-72 h-64 lg:h-72 rounded-2xl overflow-hidden border border-[#E4DED2] shrink-0 shadow-sm">
                <Image
                  src="/illustrations/shater-parent.jpg"
                  alt="ولي أمر يتابع تقدم ابنه براحة واطمئنان"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 right-3 left-3 text-right">
                  <span className="text-[11px] font-bold text-white bg-[#5F8F86] px-2.5 py-0.5 rounded-full inline-block">
                    مرافقة واطمئنان 👨‍👩‍👧
                  </span>
                  <p className="text-[11px] text-white/90 pt-1 leading-snug">
                    انضباط دراسي يحمي ابنكم من فوضى الإنترنت
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-right flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F2EB] border border-[#6E9B7B]/30 text-[#245431] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6E9B7B]" />
                  <span>إلى أولياء أمور طلبة البكالوريا</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-[#0F172A] leading-tight">
                  نعلم قلقكم على مستقبل ابنكم.. الشاطر يمنحه الانضباط وراحة البال
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-medium">
                  بيئة أكاديمية نظيفة وخالية من مواقع التواصل والمحادثات العشوائية، مع خطة يومية واضحة والدفع عند الاستلام (COD) متاح لـ 58 ولاية.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <Link href="/parents" className="text-[#5F8F86] font-bold hover:underline inline-flex items-center gap-1">
                    <span>اقرأ دليل الأولياء الكامل لمنظومة الشاطر</span>
                    <Arrow className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="shrink-0 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <a
                  href={`https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
                    LANDING_CONFIG.support.parentMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleWhatsAppClick("parent")}
                  className="w-full text-center"
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full rounded-2xl border-[#6E9B7B]/40 text-[#245431] hover:bg-[#E8F2EB] text-xs font-bold px-6 py-3.5 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-[#6E9B7B]" />
                    <span>تواصل خاص بالأولياء عبر واتساب</span>
                  </Button>
                </a>
                <Link href="/parents" className="w-full text-center">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full rounded-2xl border-[#E4DED2] text-[#334155] hover:bg-[#FAF7F0] text-xs font-semibold px-6 py-3 shadow-sm"
                  >
                    <span>صفحة الأولياء المستقلة</span>
                  </Button>
                </Link>
              </div>

            </div>
          </Container>
        </section>

        {/* =================================================================== */}
        {/* NEW HIGH-EMOTION SECTION: فرحة نهار نتائج البكالوريا               */}
        {/* =================================================================== */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-[#F7F3EA] via-[#FAF7F0] to-[#EFE9DC]/60 border-b border-[#E4DED2]" dir="rtl">
          <Container size="lg">
            <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E4DED2] shadow-card">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-7 space-y-4 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F9EFE2] border border-[#D7A66A]/40 text-[#8C5D23] text-xs font-bold">
                    <Award className="w-3.5 h-3.5 text-[#D7A66A]" />
                    <span>الهدف الأسمى الذي نشتغل عليه معاً</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] leading-tight">
                    لحظة إعلان النتائج.. الفرحة التي تستحق كل دقيقة تركيز اليوم 🎓
                  </h2>

                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-medium">
                    تخيل تلك اللحظة: هاتف يرن، زغاريد تملأ أركان البيت، دموع الفرح في عيون الوالدين، ورسالة القبول في تخصصك الجامعي الذي حلمت به.. البكالوريا ليست مجرد امتحان، بل تتويج لتعب سنين وافتخار عائلتك بك.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E4DED2] text-xs text-[#475569] space-y-1">
                    <p className="font-bold text-[#0F172A]">«كل دقيقة تلتزم فيها بحل موضوع اليوم، تقربك خطوة من هاد النهار.»</p>
                    <p className="text-[11px]">الشاطر يرافقك كل يوم لكي تدخل قاعة الامتحان وأنت واثق من ورقتك ومعدلك.</p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Link href={signupUrl} onClick={() => handlePrimaryCtaClick("joy_section")} className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full sm:w-auto font-black px-7 py-3.5 rounded-2xl bg-[#5F8F86] hover:bg-[#527D75] text-white text-xs shadow-md shadow-[#5F8F86]/20 cursor-pointer"
                      >
                        <span>ابنِ فرحتك نهار النتائج من اليوم 🎓</span>
                        <Arrow className="w-3.5 h-3.5 ms-1.5" />
                      </Button>
                    </Link>
                    <span className="text-xs text-[#475569]">3 أيام تجربة كاملة لكافة ميزات المنصة</span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full border-2 border-white shadow-clay">
                    <Image
                      src="/illustrations/bac-success-joy.jpg"
                      alt="فرحة نهار نتائج البكالوريا والنجاح بتفوق مع العائلة"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E4DED2] text-center">
                      <span className="text-xs font-black text-[#0F172A]">فرحة النجاح مع العائلة والشهادة 🇩🇿</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 8 — الأسعار وطرق الدفع (PRICING & ACCORDION PAYMENT)       */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#F7F3EA] border-b border-[#E4DED2]" id="pricing-section" dir="rtl">
          <Container size="lg" className="space-y-10">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE9E4] border border-[#5F8F86]/30 text-[#385853] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#5F8F86]" />
                <span>اشتراكات واضحة بدون غموض</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                جرّب المنظومة لـ 3 أيام كاملة (0 دج)
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-medium">
                لا نطلب أي بطاقة بنكية عند التسجيل. جرّب المنصة بحرية كاملة وتأكد من فائدتها.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {LANDING_CONFIG.plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-6 rounded-3xl transition-all cursor-pointer text-right flex flex-col justify-between relative border ${
                      isSelected
                        ? "bg-white border-2 border-[#5F8F86] shadow-clay scale-[1.01]"
                        : "bg-white border border-[#E4DED2] hover:border-[#5F8F86]/40 shadow-sm"
                    }`}
                  >
                    {plan.badgeAr && (
                      <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#5F8F86] text-white font-black text-[11px] shadow-sm">
                        {plan.badgeAr}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-black text-[#0F172A]">{plan.nameAr}</h3>
                        <p className="text-xs text-[#475569] pt-0.5">{plan.descriptionAr}</p>
                      </div>

                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-black font-mono text-[#5F8F86]">
                          {plan.priceDzd.toLocaleString("fr-DZ")}
                        </span>
                        <span className="text-sm font-bold text-[#0F172A]">دج</span>
                        <span className="text-xs text-[#475569] font-medium">/ {plan.periodAr}</span>
                      </div>

                      <div className="pt-2 border-t border-[#E4DED2] space-y-2">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#334155]">
                            <Check className="w-3.5 h-3.5 text-[#5F8F86] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5">
                      <Link href={signupUrl} onClick={() => handlePrimaryCtaClick(`pricing_${plan.id}`)}>
                        <Button
                          variant={isSelected ? "primary" : "outline"}
                          size="md"
                          className={`w-full font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 ${
                            isSelected
                              ? "bg-[#5F8F86] hover:bg-[#527D75] text-white shadow-md shadow-[#5F8F86]/20"
                              : "border-[#E4DED2] text-[#0F172A] hover:bg-[#FAF7F0]"
                          }`}
                        >
                          <span>اختر هذه الخطة وابدأ تجربتك 🌟</span>
                          <Arrow className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <span className="text-[10px] text-[#475569] text-center block pt-1.5">
                        3 أيام كاملة مجاناً قبل أي دفع
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Methods (Foldable Accordion) */}
            <div className="max-w-4xl mx-auto rounded-2xl border border-[#E4DED2] bg-white overflow-hidden text-right shadow-sm">
              <button
                type="button"
                onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                className="w-full p-4 flex items-center justify-between gap-4 text-right cursor-pointer hover:bg-[#FAF7F0] transition-colors"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#0F172A]">
                  <Truck className="w-4 h-4 text-[#D7A66A]" />
                  <span>3 طرق دفع مريحة تناسب كل ولايات الجزائر (البطاقة الذهبية، بريدي موب، كود للبيت)</span>
                </div>
                <span className="text-[#475569] shrink-0">
                  {showPaymentDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {showPaymentDetails && (
                <div className="p-4 sm:p-6 border-t border-[#E4DED2] grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#FAF7F0]">
                  {LANDING_CONFIG.paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="p-3.5 rounded-xl bg-white border border-[#E4DED2] space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-black text-[#0F172A]">
                        <span>{method.nameAr}</span>
                        {method.id === "baridimob" && <Smartphone className="w-4 h-4 text-[#6E9B7B]" />}
                        {method.id === "ccp" && <FileText className="w-4 h-4 text-[#5F8F86]" />}
                        {method.id === "cod" && <Truck className="w-4 h-4 text-[#D7A66A]" />}
                      </div>
                      <span className="text-[10px] text-[#245431] font-bold block bg-[#E8F2EB] px-2 py-0.5 rounded w-fit border border-[#6E9B7B]/30">
                        {method.speedAr}
                      </span>
                      <ol className="space-y-1 text-[11px] text-[#475569] list-decimal list-inside leading-relaxed">
                        {method.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 9 — الأسئلة الشائعة (FAQ ACCORDION)                         */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#FAF7F0] border-b border-[#E4DED2]" id="faq-section" dir="rtl">
          <Container size="md" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE9E4] border border-[#5F8F86]/30 text-[#385853] text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-[#5F8F86]" />
                <span>الأسئلة الشائعة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                إجابات واضحة ومباشرة
              </h2>
            </div>

            <div className="space-y-2.5">
              {LANDING_CONFIG.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#E4DED2] bg-white overflow-hidden transition-all text-right shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between gap-4 text-right cursor-pointer hover:bg-[#FAF7F0] transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-black text-[#0F172A] leading-snug">
                        {faq.question}
                      </span>
                      <span className="shrink-0 text-[#475569]">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#5F8F86]" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#E4DED2] text-xs sm:text-sm text-[#475569] leading-relaxed font-medium">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2 text-xs">
              <a
                href={`https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
                  LANDING_CONFIG.support.studentMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleWhatsAppClick("student")}
                className="text-[#5F8F86] font-bold hover:underline inline-flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>عندك سؤال آخر؟ تواصل مع الدعم عبر واتساب</span>
              </a>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SECTION 10 — الختام والتذييل القانوني المكتمل                       */}
        {/* =================================================================== */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FAF7F0] to-[#EFE9DC] border-b border-[#E4DED2] relative overflow-hidden" dir="rtl">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[250px] bg-[#5F8F86]/10 rounded-full blur-3xl pointer-events-none" />

          <Container size="md" className="relative z-10 text-center space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-[#E8F2EB] text-[#245431] border border-[#6E9B7B]/30 text-xs font-bold inline-block">
              {trialDays} أيام تجربة مجانية كاملة (0 دج)
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] leading-tight">
              الباك ماشي صدفة.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#26302F] via-[#5F8F86] to-[#D7A66A]">
                والشاطر يحط خدمتك في بلاصتها.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-medium max-w-lg mx-auto">
              احسب معدلك الموزون، وادخل مجلس العلم اليوم بدون أي التزام مالي.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={signupUrl} onClick={() => handlePrimaryCtaClick("final_footer")} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto font-black px-8 py-4 rounded-2xl text-sm bg-[#5F8F86] hover:bg-[#527D75] text-white shadow-lg shadow-[#5F8F86]/25 cursor-pointer hover:scale-[1.02]"
                >
                  <span>انضم لنخبة المتفوقين في البكالوريا ✨</span>
                  <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </Link>

              <Link href="/orientation" onClick={() => handleSecondaryCtaClick("final_footer")} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-xs sm:text-sm bg-white border-[#E4DED2] text-[#0F172A] hover:bg-[#FAF7F0] shadow-sm"
                >
                  <span>جرّب واش نقدر نقرا</span>
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* COMPACT FOOTER WITH LEGAL LINKS */}
        <footer className="border-t border-[#E4DED2] bg-[#EFE9DC] py-8 text-xs text-[#475569]" dir="rtl">
          <Container size="lg" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#E4DED2]">
              <div className="flex items-center gap-3">
                <Logo size="sm" showTagline={false} />
                <span className="text-[11px] text-[#475569]">
                  © {new Date().getFullYear()} SHATER BAC — منصة التحضير المتفوق للبكالوريا الجزائرية 🇩🇿
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold flex-wrap justify-center">
                <Link href="/orientation" className="text-[#5F8F86] hover:underline font-bold">واش نقدر نقرا؟</Link>
                <Link href="/diwan" className="text-[#8C5D23] hover:underline font-bold">ديوان العلم</Link>
                <Link href="/diagnostic" className="hover:text-[#0F172A]">التشخيص</Link>
                <Link href="/exams" className="hover:text-[#0F172A]">بنك البكالوريات</Link>
                <Link href="/curriculum" className="hover:text-[#0F172A]">الدروس</Link>
                <Link href="/experiences" className="hover:text-[#0F172A]">بنك التجارب</Link>
                <Link href="/faq" className="hover:text-[#0F172A]">الأسئلة الشائعة</Link>
                <Link href="/privacy" className="text-[#334155] hover:text-[#0F172A] underline">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-[#334155] hover:text-[#0F172A] underline">شروط الاستخدام</Link>
                <Link href="/auth" className="hover:text-[#0F172A]">تسجيل الدخول</Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#475569]">
              <span>مبني على المنشور الوزاري رقم 01 لوزارة التعليم العالي دورة 2026/2027.</span>
              <a
                href={`https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
                  LANDING_CONFIG.support.studentMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleWhatsAppClick("student")}
                className="text-[#5F8F86] font-bold hover:underline"
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
          className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t border-[#E4DED2] md:hidden z-30 flex items-center justify-between gap-3 shadow-elevated"
          dir="rtl"
        >
          <div className="text-right">
            <span className="text-xs font-black text-[#0F172A] block">SHATER BAC</span>
            <span className="text-[10px] text-[#245431] font-bold">{trialDays} أيام تجربة مجانية (0 دج)</span>
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
                className="rounded-xl font-bold text-xs px-3 py-2 bg-[#F7F3EA] border-[#E4DED2] text-[#385853]"
              >
                <span>التوجيه 🎓</span>
              </Button>
            </Link>
            <Link
              href={signupUrl}
              onClick={() => handlePrimaryCtaClick("mobile_sticky")}
              className="shrink-0"
            >
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl font-black text-xs px-4 py-2 bg-[#5F8F86] text-white shadow-md shadow-[#5F8F86]/20"
              >
                <span>سجّل وانطلق 🚀</span>
                <Arrow className="w-3.5 h-3.5 ms-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
