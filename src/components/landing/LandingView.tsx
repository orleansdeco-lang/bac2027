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
        className="relative pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#070B14] via-[#0B1222] to-[#070B14]"
        id="hero-section"
        dir="rtl"
      >
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-[450px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <Container size="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Main Copy Column (Condensed: Headline ≤ 8 words, Subtitle ≤ 2 lines) */}
            <div className="lg:col-span-6 text-center lg:text-right space-y-5">
              
              {/* Official Stream & Scope Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-300">
                  <ShaterIcon size={14} />
                  <span>نظام تشغيل البكالوريا 2026/2027 🇩🇿</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تغطية 6 شُعب</span>
                </div>
              </div>

              {/* Main Headline (Strictly ≤ 8 words) */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.25]">
                مش غير تقرا... <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300">
                  كيفاش تراجع ووين توصل.
                </span>
              </h1>

              {/* Subtitle (Strictly ≤ 2 lines) */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                منظومة ذكية تجمع مستكشف التوجيه الرسمي، مجالس المذاكرة المتزامنة، ومعمل رصد الأخطاء لضمان نتيجتك يوم الامتحان.
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
                    className="w-full sm:w-auto font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Sparkles className="h-4 w-4 text-slate-950" />
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
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Compass className="h-4 w-4 text-emerald-400" />
                    <span>جرّب واش نقدر نقرا</span>
                  </Button>
                </Link>
              </div>

              {/* Frictionless Trust Badges */}
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{trialDays} أيام تجربة مجانية كاملة (0 دج)</span>
                </span>
                <span>•</span>
                <span>بدون بطاقة بنكية</span>
                <span>•</span>
                <span>بدون أي التزام</span>
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
      <section className="py-5 sm:py-6 bg-[#0B1222] border-b border-white/[0.06]" dir="rtl">
        <Container size="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-0.5">
              <div className="text-xs font-black text-amber-400 flex items-center justify-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                <span>المنشور الوزاري رقم 01</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">مبني على دورة 2026/2027 الرسمية</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-0.5">
              <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>58 ولاية جزائرية</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">تغطية لكل ثانويات الوطن</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-0.5">
              <div className="text-xs font-black text-blue-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>تجربة بدون بطاقة</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">ابدأ الآن بدون إدخال وسيلة دفع</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-0.5">
              <div className="text-xs font-black text-purple-400 flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>البطاقة الذهبية / كود للبيت</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">الدفع عند الاستلام لـ 58 ولاية</p>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3 — المشكلة: 4 عوائق حقيقية في شريط مدمج (CONDENSED STRIP)   */}
      {/* =================================================================== */}
      <section className="py-10 sm:py-14 bg-[#070B14] border-b border-white/[0.08]" id="problem-section" dir="rtl">
        <Container size="lg" className="space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>واقع التحضير اليومي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              أربعة عوائق يومية ننهيها تماماً
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              الخلل ليس في ذكائك، بل في غياب نظام واضح يوجه تركيزك.
            </p>
          </div>

          {/* Compact 4-Card Horizontal Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <div className="p-4 rounded-2xl bg-[#0B1222] border border-white/[0.06] hover:border-rose-500/30 transition-all text-right space-y-2">
              <span className="text-2xl block">📱</span>
              <h3 className="text-xs font-black text-white">التمرير وتأنيب الضمير</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ساعات تضيع في إنستغرام وتيك توك، والكراس لا يفتح، وتنام بحرقة وتأنيب ضمير.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1222] border border-white/[0.06] hover:border-amber-500/30 transition-all text-right space-y-2">
              <span className="text-2xl block">🎲</span>
              <h3 className="text-xs font-black text-white">توهم الفهم بالمراجعة</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                حل تمارين معتادة مكررة ثم الاصطدام بالأسئلة المنهجية المركبة في الفرض والباك.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1222] border border-white/[0.06] hover:border-blue-500/30 transition-all text-right space-y-2">
              <span className="text-2xl block">😰</span>
              <h3 className="text-xs font-black text-white">ضبابية الهدف الجامعي</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                تعب مستمر دون معرفة المعدل الموزون الحقيقي للتخصص الذي تحلم به.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1222] border border-white/[0.06] hover:border-purple-500/30 transition-all text-right space-y-2">
              <span className="text-2xl block">📚</span>
              <h3 className="text-xs font-black text-white">تخمة الفيديوهات والملفات</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                تراكم عشرات القنوات والملخصات دون تدريب حقيقي بورقة وقلم بسلالم التنقيط.
              </p>
            </div>

          </div>

          <div className="text-center pt-1">
            <Link
              href={signupUrl}
              onClick={() => handlePrimaryCtaClick("problem_cta")}
              className="text-amber-400 hover:text-amber-300 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <span>انتقل إلى الدراسة المنظمة مع الشاطر مجاناً</span>
              <Arrow className="w-3.5 h-3.5" />
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 4 — الحل: الأعمدة الثلاثة (THREE PILLARS)                    */}
      {/* =================================================================== */}
      <section className="py-12 sm:py-16 bg-[#0B1222] border-b border-white/[0.08]" id="solution-section" dir="rtl">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>منظومة متكاملة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              الأعمدة الثلاثة للتحضير المتفوق للبكالوريا
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              تحدد هدفك، تلتزم يومياً بالمذاكرة، وترمم أخطاءك قبل الامتحان.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Pillar 1: Orientation */}
            <div className="p-5 rounded-3xl bg-[#070B14] border border-emerald-500/30 hover:border-emerald-400 transition-all text-right space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                    <Compass className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    العمود 1
                  </span>
                </div>
                <h3 className="text-base font-black text-white">① التوجيه: واش نقدر نقرا؟</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  حساب المعدل الموزون الرسمي ومعرفة التخصصات المؤهل لها بالمنشور الوزاري الحقيقي لتحديد موادك المصيرية.
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <Link
                  href="/orientation"
                  onClick={() => handleSecondaryCtaClick("pillar_orientation")}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
                >
                  <span>مستكشف التوجيه الجامعي</span>
                  <Arrow className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Diwan Focus */}
            <div className="p-5 rounded-3xl bg-[#070B14] border border-amber-500/30 hover:border-amber-400 transition-all text-right space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                    <Landmark className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    العمود 2
                  </span>
                </div>
                <h3 className="text-base font-black text-white">② التركيز: ديوان العلم 🏛️</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  طاولات مذاكرة حية تجمعك بزملاء شعبتك. توقيت موحد وحل على الكراس بسلم التنقيط بدون أي مشتتات.
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <Link
                  href="/diwan"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center justify-between"
                >
                  <span>استكشف طاولات ديوان العلم</span>
                  <Arrow className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Diagnostic & Error Lab */}
            <div className="p-5 rounded-3xl bg-[#070B14] border border-rose-500/30 hover:border-rose-400 transition-all text-right space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
                    <Brain className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                    العمود 3
                  </span>
                </div>
                <h3 className="text-base font-black text-white">③ النتيجة: معمل الأخطاء 🔬</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  رصد آلي لكل تمرين أخطأت فيه، وإعادة برمجته بتكرار متباعد واختبار توأم للتأكد من إتقانه قبل البكالوريا.
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <Link
                  href="/diagnostic"
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center justify-between"
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
                className="font-black px-7 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>ابدأ مجاناً</span>
                <Arrow className="w-3.5 h-3.5 ms-1.5" />
              </Button>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 5 — ديوان العلم ومجالس المذاكرة الحقيقية                     */}
      {/* =================================================================== */}
      <section className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]" id="majlis-section" dir="rtl">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Preview */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0B1222] shadow-2xl p-3 sm:p-4 group">
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

                  <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-right space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">موضوع الدارة الكهربائية RC (كمثال تطبيقي)</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px]">
                        مزامنة لحظية
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      توقيت موحد، حل بالورقة والقلم، واحتساب النتيجة بسلم التنقيط الوزاري فوراً.
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">مخصص لطلاب نفس الشعبة لضمان الجدية</span>
                  <Link href="/diwan" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                    <span>احجز مقعدك في المجلس</span>
                    <Arrow className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Description & 4 Study Modes */}
            <div className="lg:col-span-6 space-y-5 text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                <span>المذاكرة الجماعية الصامتة</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                ديوان العلم: طاولتك مع زملائك بتركيز تام
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                تطبيق لمفهوم Focus Study بدون مشتتات. تدخل إلى مجلس محدد لشعبتك، تلتزم بالوقت، وتتدرب على حل التمارين بالكتابة الحقيقية.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>حل تمرين على الكراس ✍️</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-tight">
                    عداد مشترك، تصحيح ذاتي، وترحيل الأخطاء لمعمل الذاكرة.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>تحديات السرعة والتواريخ ⚡</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-tight">
                    15 ثانية لكل سؤال لترسيخ التواريخ والشخصيات فورا.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span>حلقة الحفظ والتثبيت 🧠</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-tight">
                    حجب الكلمات المفتاحية واختبار الاسترجاع النشط الفوري.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                  <div className="font-black text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>محاكاة موضوع كامل 📝</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-tight">
                    توقيت رسمي كامل للتدريب على إدارة الوقت والضغط.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                <Link href="/diwan" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto font-black px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs shadow-md cursor-pointer"
                  >
                    <span>ادخل ديوان العلم 🏛️</span>
                    <Arrow className="w-3.5 h-3.5 ms-1.5" />
                  </Button>
                </Link>
                <span className="text-[11px] text-slate-400">بيئة أكاديمية خالية من المحادثات العشوائية</span>
              </div>

            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 6 — الامتحانات الرسمية (2016 - 2026)                        */}
      {/* =================================================================== */}
      <section className="py-10 sm:py-12 bg-[#0B1222] border-b border-white/[0.08]" id="exams-section" dir="rtl">
        <Container size="lg">
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/30 via-[#070B14] to-amber-950/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-5">
            
            <div className="space-y-1.5 text-center md:text-right max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>أرشيف امتحانات البكالوريا 2016 - 2026</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                مواضيع البكالوريا الرسمية بسلالم التنقيط الوزارية
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                مصنفة حسب الشعب والوحدات، مع محاكي Quick Recall لتثبيت التواريخ والمصطلحات بالاسترجاع النشط.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link href="/exams" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto rounded-2xl border-white/10 text-white hover:bg-white/[0.08] text-xs font-bold px-5 py-3 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 me-1.5 text-blue-400" />
                  <span>تصفح بنك البكالوريات</span>
                </Button>
              </Link>

              <Link href={signupUrl} onClick={() => handlePrimaryCtaClick("exams_cta")} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-6 py-3 cursor-pointer"
                >
                  <span>ابدأ مجاناً</span>
                  <Arrow className="w-3.5 h-3.5 ms-1" />
                </Button>
              </Link>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 7 — ركن الأولياء (COMPACT WITH LINK TO /parents)            */}
      {/* =================================================================== */}
      <section className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]" id="parents-section" dir="rtl">
        <Container size="lg">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1222] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <div className="space-y-3 text-right max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>إلى أولياء أمور طلبة البكالوريا</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                نعلم قلقكم على مستقبل ابنكم.. الشاطر يمنحه الانضباط وراحة البال
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                بيئة أكاديمية نظيفة وخالية من مواقع التواصل والمحادثات العشوائية، مع خطة يومية واضحة والدفع عند الاستلام (COD) متاح لـ 58 ولاية.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <Link href="/parents" className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1">
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
                  className="w-full rounded-2xl border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold px-6 py-3.5 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>تواصل خاص بالأولياء عبر واتساب</span>
                </Button>
              </a>
              <Link href="/parents" className="w-full text-center">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full rounded-2xl border-white/10 text-slate-300 hover:bg-white/[0.05] text-xs font-semibold px-6 py-3"
                >
                  <span>صفحة الأولياء المستقلة</span>
                </Button>
              </Link>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 8 — الأسعار وطرق الدفع (PRICING & ACCORDION PAYMENT)       */}
      {/* =================================================================== */}
      <section className="py-12 sm:py-16 bg-[#0B1222] border-b border-white/[0.08]" id="pricing-section" dir="rtl">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>اشتراكات واضحة بدون غموض</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ابدأ بـ 7 أيام تجربة مجانية (0 دج)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              لا نطلب أي بطاقة بنكية عند التسجيل. جرّب المنصة بحرية كاملة.
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
                      ? "bg-[#070B14] border-amber-400 shadow-xl shadow-amber-400/10 scale-[1.01]"
                      : "bg-[#070B14]/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.badgeAr && (
                    <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-md">
                      {plan.badgeAr}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-black text-white">{plan.nameAr}</h3>
                      <p className="text-xs text-slate-400 pt-0.5">{plan.descriptionAr}</p>
                    </div>

                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-amber-400">
                        {plan.priceDzd.toLocaleString("fr-DZ")}
                      </span>
                      <span className="text-sm font-bold text-slate-300">دج</span>
                      <span className="text-xs text-slate-400 font-medium">/ {plan.periodAr}</span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] space-y-2">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
                            ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20"
                            : "border-white/10 text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <span>ابدأ مجاناً</span>
                        <Arrow className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <span className="text-[10px] text-slate-400 text-center block pt-1.5">
                      أسبوع كامل مجاناً قبل أي دفع
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Methods (Foldable Accordion) */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-white/[0.08] bg-[#070B14] overflow-hidden text-right">
            <button
              type="button"
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
              className="w-full p-4 flex items-center justify-between gap-4 text-right cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>3 طرق دفع مريحة تناسب كل ولايات الجزائر (البطاقة الذهبية، بريدي موب، كود للبيت)</span>
              </div>
              <span className="text-slate-400 shrink-0">
                {showPaymentDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {showPaymentDetails && (
              <div className="p-4 sm:p-6 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-3">
                {LANDING_CONFIG.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-black text-white">
                      <span>{method.nameAr}</span>
                      {method.id === "baridimob" && <Smartphone className="w-4 h-4 text-emerald-400" />}
                      {method.id === "ccp" && <FileText className="w-4 h-4 text-blue-400" />}
                      {method.id === "cod" && <Truck className="w-4 h-4 text-purple-400" />}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold block bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                      {method.speedAr}
                    </span>
                    <ol className="space-y-1 text-[11px] text-slate-300 list-decimal list-inside leading-relaxed">
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
      <section className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]" id="faq-section" dir="rtl">
        <Container size="md" className="space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>الأسئلة الشائعة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              إجابات واضحة ومباشرة
            </h2>
          </div>

          <div className="space-y-2.5">
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
                    className="w-full p-4 flex items-center justify-between gap-4 text-right cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-black text-white leading-snug">
                      {faq.question}
                    </span>
                    <span className="shrink-0 text-slate-400">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
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
              className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
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
      <section className="py-14 sm:py-20 bg-gradient-to-b from-[#070B14] via-[#0B1222] to-[#070B14] border-b border-white/[0.08] relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[250px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="md" className="relative z-10 text-center space-y-6">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-block">
            {trialDays} أيام تجربة مجانية كاملة (0 دج)
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            الباك ماشي صدفة.. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
              والشاطر يحط خدمتك في بلاصتها.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-lg mx-auto">
            احسب معدلك الموزون، وادخل مجلس العلم اليوم بدون أي التزام مالي.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={signupUrl} onClick={() => handlePrimaryCtaClick("final_footer")} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-black px-8 py-4 rounded-2xl text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 cursor-pointer hover:scale-[1.02]"
              >
                <span>ابدأ مجاناً</span>
                <Arrow className="w-4 h-4 ms-2" />
              </Button>
            </Link>

            <Link href="/orientation" onClick={() => handleSecondaryCtaClick("final_footer")} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-xs sm:text-sm bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]"
              >
                <span>جرّب واش نقدر نقرا</span>
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* COMPACT FOOTER WITH LEGAL LINKS */}
      <footer className="border-t border-white/[0.08] bg-[#070B14] py-8 text-xs text-slate-400" dir="rtl">
        <Container size="lg" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Logo size="sm" showTagline={false} />
              <span className="text-[11px] text-slate-400">
                © {new Date().getFullYear()} SHATER BAC — منصة التحضير المتفوق للبكالوريا الجزائرية 🇩🇿
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold flex-wrap justify-center">
              <Link href="/orientation" className="text-emerald-400 hover:underline font-bold">واش نقدر نقرا؟</Link>
              <Link href="/diwan" className="text-amber-400 hover:underline font-bold">ديوان العلم</Link>
              <Link href="/diagnostic" className="hover:text-white">التشخيص</Link>
              <Link href="/exams" className="hover:text-white">بنك البكالوريات</Link>
              <Link href="/curriculum" className="hover:text-white">الدروس</Link>
              <Link href="/experiences" className="hover:text-white">بنك التجارب</Link>
              <Link href="/faq" className="hover:text-white">الأسئلة الشائعة</Link>
              <Link href="/privacy" className="text-slate-300 hover:text-white underline">سياسة الخصوصية</Link>
              <Link href="/terms" className="text-slate-300 hover:text-white underline">شروط الاستخدام</Link>
              <Link href="/auth" className="hover:text-white">تسجيل الدخول</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>مبني على المنشور الوزاري رقم 01 لوزارة التعليم العالي دورة 2026/2027.</span>
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
          <span className="text-xs font-black text-white block">SHATER BAC</span>
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
            href={signupUrl}
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
