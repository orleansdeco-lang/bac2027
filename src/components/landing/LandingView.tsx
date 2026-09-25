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
  GraduationCap,
  Compass,
  Calculator,
  Zap,
  Brain,
  FileText,
  Users,
  Award,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Flame,
  Star,
  Share2,
  Calendar,
  Landmark,
  Bot,
  TrendingUp,
} from "lucide-react";

export function LandingView() {
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // Active showcase tabs
  const [activeStudyMode, setActiveStudyMode] = useState<"PAPER" | "SPEED" | "RECALL" | "EXAM">("PAPER");
  const [activeProductTab, setActiveProductTab] = useState<"error_lab" | "majlis" | "diagnostic" | "planner">("majlis");

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
      
      {/* 0. Top Live Announcement Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-emerald-500/20 border-b border-white/10 px-4 py-2.5 text-center text-xs font-bold text-white flex items-center justify-center gap-3 relative z-30 shadow-sm" dir="rtl">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <span className="text-slate-200">
          جديد البكالوريا: فتح <strong>«ديوان العلم ومجالس المذاكرة الحية 🏛️»</strong> و <strong>«مستكشف التوجيه الجامعي 🎓»</strong> لجميع الشعب مجاناً.
        </span>
        <Link
          href="/diwan"
          className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-full text-[11px] font-black transition-all shrink-0 shadow-md shadow-amber-500/20"
        >
          <span>ادخل المجلس 🪑</span>
          <Arrow className="w-3 h-3" />
        </Link>
      </div>

      {/* Smart Greeting for Logged-in Students */}
      {user && (
        <div className="bg-[#101B33] border-b border-blue-500/30 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3 relative z-20" dir="rtl">
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
      {/* SECTION 1 — HERO: MODERN, DYNAMIC & PREMIUM                         */}
      {/* =================================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#070B14] via-[#0B1222] to-[#070B14]" dir="rtl">
        {/* Ambient Warm & Cool Lighting Cones */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-[450px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <Container size="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-center lg:text-right space-y-6">
              
              {/* Feature Pills Bar */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold text-blue-400">
                  <ShaterIcon size={16} />
                  <span>BAC 2027 🇩🇿 المنظومة الذكية</span>
                </div>
                <Link
                  href="/diwan"
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 transition-all shadow-xs hover:scale-105"
                >
                  <Landmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>ديوان مجالس العلم 🏛️</span>
                </Link>
                <Link
                  href="/orientation"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-300 transition-all shadow-xs hover:scale-105"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حاسبة التوجيه الجامعي 🎓</span>
                </Link>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.25]">
                الباك يحتاج خدمة ذكية. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-blue-400">
                  الشاطر يجمع لك الطاولات التفاعلية، بنك التجارب، والتوجيه الدقيق.
                </span>
              </h1>

              {/* Secondary Subtext */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                منظومة جزائرية شاملة تجمع <strong>مجالس المذاكرة الحية (3D Majlis)</strong> بدون مشتتات، 
                <strong> وعصارة نصائح المتفوقين بمعدلات 18 و 19</strong>، 
                مع <strong>معمل رصد الأخطاء</strong> وحساب <strong>المعدل الموزون للتخصصات الجامعية</strong>.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 flex-wrap">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-black px-8 py-5 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 transition-all cursor-pointer hover:scale-105"
                  >
                    <Sparkles className="h-5 w-5 text-slate-950" />
                    <span>ابدأ مجانًا (7 أيام - 0 دج)</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/diwan" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-5 rounded-2xl font-bold text-sm bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/40 text-blue-300 flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Landmark className="h-4 w-4 text-blue-400" />
                    <span>ادخل مجلس العلم الآن 🪑</span>
                  </Button>
                </Link>

                <Link href="/orientation" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-5 rounded-2xl font-bold text-sm bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <GraduationCap className="h-4 w-4 text-emerald-400" />
                    <span>واش نقدر نقرا؟ (حاسبة التوجيه)</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 text-xs text-slate-400 font-medium flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>أسبوع تجربة مجانية كاملة</span>
                </span>
                <span>•</span>
                <span>بدون بطاقة بنكية</span>
                <span>•</span>
                <span>مطابق 100% للمنهاج الوزاري 🇩🇿</span>
              </div>
            </div>

            {/* Right Showcase: Interactive Cozy Majlis Visual Teaser */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0B1222] shadow-2xl p-3 sm:p-4 max-w-md w-full backdrop-blur-xl group">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full">
                  <Image
                    src="/illustrations/majlis-table-bg.jpg"
                    alt="طاولة مجلس العلم التفاعلية للبكالوريا"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1222] via-[#0B1222]/40 to-transparent" />
                  
                  {/* Floating Live Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>مجلس دراسة مباشر: ثنائي القطب RC</span>
                  </div>

                  {/* Mode Card Preview */}
                  <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-right space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>حل تمرين على الكراس + سلم التنقيط</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        6/6 طلاب حاضرون
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      توقيت موحد متزامن عبر Supabase، تصحيح ذاتي، وترحيل الأخطاء لمعمل الذاكرة.
                    </p>
                  </div>
                </div>

                {/* Sub-bar below teaser */}
                <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {["yassine", "sarah", "ali"].map((ch, i) => (
                        <div key={i} className="relative w-6 h-6 rounded-full border border-[#0B1222] overflow-hidden">
                          <Image src={`/illustrations/characters/${ch}.jpg`} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">+1,200 طاولة مفتوحة اليوم</span>
                  </div>
                  <Link href="/diwan" className="text-amber-400 font-bold text-xs hover:underline flex items-center gap-1">
                    <span>احجز مقعدك</span>
                    <Arrow className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 2 — STATS & HIGH-IMPACT METRICS STRIP                      */}
      {/* =================================================================== */}
      <section className="py-8 sm:py-10 bg-[#0B1222] border-b border-white/[0.06]" dir="rtl">
        <Container size="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">94+</div>
              <div className="text-xs font-bold text-white">طاولة مجلس علم حية</div>
              <div className="text-[11px] text-slate-400">دراسة جماعية متزامنة</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">58</div>
              <div className="text-xs font-bold text-white">ولاية ممثلة</div>
              <div className="text-[11px] text-slate-400">تجارب من كل أنحاء الوطن</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">2008-2026</div>
              <div className="text-xs font-bold text-white">مواضيع بكالوريا رسمية</div>
              <div className="text-[11px] text-slate-400">مع الحلول وسلالم التنقيط</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">100%</div>
              <div className="text-xs font-bold text-white">بدون تشتيت أو أصوات</div>
              <div className="text-[11px] text-slate-400">تركيز دراسي أكاديمي بحت</div>
            </div>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3 — ديوان العلم ومجالس المذاكرة الحقيقية                   */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-[#070B14] border-b border-white/[0.08] relative overflow-hidden" id="majlis-showcase" dir="rtl">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <Container size="lg" className="relative z-10 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Landmark className="w-4 h-4" />
              <span>فضاء مجالس العلم التفاعلي الحقيقي</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              طاولتك مع زملائك.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                مذاكرة متزامنة بجدية البكالوريا الحقيقية
              </span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              محرك متعدد اللاعبين مبني على Supabase Realtime، يُلزم بحسب الشعبة، بدون إعلانات أو مشغلات موسيقى تشتت ذهنك، مع 4 أنماط دراسة متكاملة:
            </p>
          </div>

          {/* 4 Interactive Study Modes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Mode 1: Paper Practice */}
            <div className="p-5 rounded-3xl bg-[#0B1222] border border-amber-500/30 hover:border-amber-400 shadow-xl transition-all space-y-3 text-right">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">حل تمرين على الكراس ✍️</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                موضوع رسمي مع عداد مشترك. عند الانتهاء تضغط «أنهيت الحل» لتظهر علامة صح خضراء على مقعدك ويكشف سلم التنقيط الوزاري.
              </p>
              <div className="pt-2 text-[11px] text-amber-300 font-bold border-t border-white/[0.06]">
                • تقييم ذاتي وترحيل الأخطاء لمعمل الذاكرة
              </div>
            </div>

            {/* Mode 2: Speed Battle */}
            <div className="p-5 rounded-3xl bg-[#0B1222] border border-blue-500/30 hover:border-blue-400 shadow-xl transition-all space-y-3 text-right">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">تحديات السرعة والتواريخ ⚡</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                أسئلة سريعة (15 ثانية لكل سؤال) في التواريخ، الشخصيات، القوانين الفيزيائية، مع ترتيب فوري للمتصدرين في مركز الطاولة.
              </p>
              <div className="pt-2 text-[11px] text-blue-300 font-bold border-t border-white/[0.06]">
                • نقاط حسب سرعة الإجابة وحفظ الأخطاء
              </div>
            </div>

            {/* Mode 3: Group Memorization */}
            <div className="p-5 rounded-3xl bg-[#0B1222] border border-purple-500/30 hover:border-purple-400 shadow-xl transition-all space-y-3 text-right">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">حلقة الحفظ والتثبيت 🧠</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                قراءة متأنية لبطاقات الحفظ المشتركة، تليها مرحلة حجب الكلمات المفتاحية واختبار الاسترجاع النشط الفوري للذاكرة.
              </p>
              <div className="pt-2 text-[11px] text-purple-300 font-bold border-t border-white/[0.06]">
                • تثبيت دائم بالـ Active Recall
              </div>
            </div>

            {/* Mode 4: Full Exam */}
            <div className="p-5 rounded-3xl bg-[#0B1222] border border-emerald-500/30 hover:border-emerald-400 shadow-xl transition-all space-y-3 text-right">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">حل موضوع بكالوريا كامل 📝</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                محاكاة حقيقية لظروف الامتحان الرسمي بتوقيت كامل (ساعتان فأكثر) وتقسيم المهام وتصحيح المنهجية بدقة.
              </p>
              <div className="pt-2 text-[11px] text-emerald-300 font-bold border-t border-white/[0.06]">
                • تدريب نفسي ومنهجي على مواضيع الوزارة
              </div>
            </div>

          </div>

          {/* CTA Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#0B1222] to-blue-500/15 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="text-lg sm:text-xl font-black text-white">هل أنت مستعد لمذاكرة جماعية حقيقية؟</h4>
              <p className="text-xs text-slate-300">افتح طاولتك الخاصة أو انضم إلى مجلس نشط لشعبتك الآن مجاناً.</p>
            </div>
            <Link href="/diwan">
              <Button
                variant="primary"
                size="lg"
                className="font-bold px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm shadow-xl shadow-amber-500/20"
              >
                <span>دخول مجلس العلم 🏛️</span>
                <Arrow className="w-4 h-4 ms-2" />
              </Button>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 4 — مستكشف التوجيه الجامعي وحاسبة المعدل الموزون           */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-[#0B1222] border-b border-white/[0.08] relative overflow-hidden" id="orientation-section" dir="rtl">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <Container size="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Visual Teaser: Dynamic Score & Major Cards */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-6 sm:p-8 rounded-[32px] bg-[#070B14] border border-white/10 shadow-2xl space-y-5">
                
                {/* Score Header Preview */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/30">
                      🎓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">شعبة علوم تجريبية • المنشور الرسمي</span>
                      <span className="text-base font-black text-white">معدل البكالوريا التقديري</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-emerald-600 text-white font-mono font-black text-xl shadow-md">
                    15.40
                  </div>
                </div>

                {/* Specialties Teaser Cards */}
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🩺</span>
                      <div>
                        <div className="text-xs font-bold text-white">علوم طبية (Médecine)</div>
                        <div className="text-[11px] text-slate-400">المعدل الموزون: ((2×Bac) + علوم) ÷ 3</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      تنافسي
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💻</span>
                      <div>
                        <div className="text-xs font-bold text-white">إعلام آلي وذكاء اصطناعي (ESI & ENSIA)</div>
                        <div className="text-[11px] text-slate-400">المعدل الموزون: ((2×Bac) + رياضيات) ÷ 3</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      مؤهل للتسجيل ✅
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📐</span>
                      <div>
                        <div className="text-xs font-bold text-white">المدرسة الوطنية العليا للذكاء الاصطناعي</div>
                        <div className="text-[11px] text-slate-400">حسب الترتيب الوطني والمقاعد</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      مؤهل للتسجيل ✅
                    </span>
                  </div>
                </div>

                {/* Micro Disclaimer */}
                <div className="text-[11px] text-slate-400 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] flex items-center gap-2">
                  <span>🏛️</span>
                  <span>مبني 100% على المنشور الوزاري الرسمي وقرارات وزارة التعليم العالي MESRS.</span>
                </div>

              </div>
            </div>

            {/* Content & Call to Action */}
            <div className="lg:col-span-6 space-y-5 text-right order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
                <span>أداة استكشاف التوجيه الرسمية مجانية</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                واش نقدر نقرا؟ <br />
                <span className="text-emerald-400">
                  احسب معدلك الموزون واكتشف تخصصاتك بدقة.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                لا تبقَ تائهاً بين الشائعات والتكهنات العشوائية. ضع علاماتك التقديرية واحصل فوراً على قائمتك المؤهلة للمدارس العليا، كليات الطب، الصيدلة، والهندسة بالمعادلات الوزارية الحقيقية.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs">
                    <strong className="block text-white mb-0.5">معاملات رسمية</strong>
                    <span className="text-slate-400">حساب دقيق لجميع الشعب الست.</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs">
                    <strong className="block text-white mb-0.5">المعدل الموزون</strong>
                    <span className="text-slate-400">تطبيق معادلات الطب والإعلام الآلي.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link href="/orientation" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-black px-8 py-5 rounded-2xl text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>جرّب "واش نقدر نقرا؟" الآن مجاناً</span>
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/calculator" className="w-full sm:w-auto text-center">
                  <span className="text-xs font-bold text-slate-300 hover:text-white underline">
                    أو احسب معدل البكالوريا العام فقط ←
                  </span>
                </Link>
              </div>

            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 5 — بنك تجارب ونماذج المتفوقين بمعدلات 18 و 19              */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-[#070B14] border-b border-white/[0.08]" id="experiences-showcase" dir="rtl">
        <Container size="lg" className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <MessageSquareQuote className="w-4 h-4" />
              <span>بنك التجارب والعِبر الرسمية للبكالوريا</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              عصارة تجارب الناجحين.. <br />
              <span className="text-blue-400">
                اقرأ أسرار الذين سبقوك واختصر على نفسك الطريق
              </span>
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              نصائح موثقة من أصحاب المراتب الأولى عبر مختلف الولايات، مع إمكانية حفظ التجارب في محفظتك الخاصة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-[#0B1222] border border-white/[0.08] shadow-xl space-y-4 text-right flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    معدل 18.94 • علوم تجريبية
                  </span>
                  <span className="text-slate-400 text-[10px]">ولاية سطيف</span>
                </div>
                <h3 className="text-base font-black text-white">كيف حفظت التاريخ والجغرافيا بدون نسيان؟</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  «كنت كلما حفظت درساً أقوم بحجب الكلمات وإعادة استرجاعها على ورقة بيضاء. الاسترجاع النشط هو السر الحقيقي للثبات في الذاكرة طويلة المدى.»
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] text-[11px] text-blue-400 font-bold flex items-center justify-between">
                <span>تثبيت التواريخ والشخصيات</span>
                <Arrow className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-[#0B1222] border border-white/[0.08] shadow-xl space-y-4 text-right flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    معدل 19.12 • رياضيات
                  </span>
                  <span className="text-slate-400 text-[10px]">ولاية قسنطينة</span>
                </div>
                <h3 className="text-base font-black text-white">سر العلامة الكاملة 20/20 في الرياضيات</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  «حللت جميع مواضيع البكالوريا من 2008 مع التركيز الصارم على سلم التنقيط المعتمد. النتيجة النهائية ليست كل شيء، المنهجية هي الأساس.»
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] text-[11px] text-emerald-400 font-bold flex items-center justify-between">
                <span>منهجية التبرير الرياضي</span>
                <Arrow className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-[#0B1222] border border-white/[0.08] shadow-xl space-y-4 text-right flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    معدل 17.80 • تقني رياضي
                  </span>
                  <span className="text-slate-400 text-[10px]">ولاية وهران</span>
                </div>
                <h3 className="text-base font-black text-white">فخاخ الدارة RC والتسرع في الحساب</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  «كنت أخطئ دائماً في التحويل بين الميلي ثانية والثانية ووحدات السعة. تدوين الخطأ في معمل الأخطاء جعلني أنتبه له في البكالوريا تلقائياً.»
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] text-[11px] text-purple-400 font-bold flex items-center justify-between">
                <span>تجنب أخطاء الوحدات</span>
                <Arrow className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link href="/diwan?tab=experiences">
              <Button variant="outline" size="md" className="rounded-2xl border-white/10 text-white hover:bg-white/[0.06] text-xs font-bold px-6 py-4">
                <span>تصفح كل التجارب والنصائح في ديوان العلم</span>
                <Arrow className="w-3.5 h-3.5 ms-2" />
              </Button>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 6 — معمل الأخطاء والمخطط الدراسي اليومي الذكي              */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-[#0B1222] border-b border-white/[0.08]" id="error-lab-section" dir="rtl">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-right">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                <Brain className="w-3.5 h-3.5" />
                <span>معمل الأخطاء والتكرار المتباعد</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                الغلط في الشاطر معلومة. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
                  لا يضيع.. بل يُبنى عليه نجاحك.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                أي تعثر في المجلس أو في حل التمارين التفاعلية يتم التقاطه تلقائياً وتوثيقه في <strong>«معمل الأخطاء»</strong>، 
                ثم جدولته كمهمة مراجعة مركزة في <strong>مخططك اليومي (Daily Planner)</strong> عبر خوارزمية التكرار المتباعد.
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm font-bold text-white">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>التقاط فوري لأخطاء مجالس العلم والتمارين الكتابية.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تشخيص سبب الخطأ (مفهوم غير مستوعب، تسرع، أو خطأ حسابي).</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>إعادة اختبار توأم (Retest) لتأكيد الإتقان النهائي.</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/error-lab">
                  <Button variant="outline" size="md" className="rounded-2xl border-white/10 text-white hover:bg-white/[0.06] font-bold text-xs px-6 py-4">
                    <span>فتح معمل الأخطاء ومخطط الدراسة ←</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Error Lab Interactive Preview Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-white/10 bg-[#070B14] p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-slate-300">سجل معمل الأخطاء النشط</span>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    3 أخطاء قيد الترميم
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5 text-right">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300">فيزياء: ثابت الزمن τ في الدارة RC</span>
                    <span className="text-[10px] text-slate-400 font-mono">اليوم 20:00</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    «تم إدراج قانون τ = R × C والتذكير بوحدة الثانية (s) في جدول مراجعة الليلة للتثبيت.»
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-1.5 text-right">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-300">رياضيات: اتجاه تغير متتالية معرفة بعلاقة تراجعية</span>
                    <span className="text-[10px] text-slate-400 font-mono">غداً 18:30</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    «مهمة إثبات بالتراجع مدتها 20 دقيقة وسؤال تطبيقي توأم لضمان عدم التعثر.»
                  </p>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-emerald-400 font-bold">
                    ✨ كل خطأ يتم حله يُرفع من السجل ويرفع معدلك بنقاط مؤكدة.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 7 — الشعب الرسمية الست للبكالوريا الجزائرية               */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-[#070B14] border-b border-white/[0.08]" id="streams-section" dir="rtl">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              مخصص بالكامل لشعبتك الرسمية
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              لكل شعبة موادها، معاملاتها، طاولات مجالسها، ومعادلات ترتيبها الجامعي الرسمية.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(ALGERIAN_BAC_STREAMS).map(([key, meta]) => (
              <Link
                key={key}
                href={`/curriculum?stream=${key}`}
                className="p-4 rounded-2xl bg-[#0B1222] border border-white/[0.08] hover:border-amber-400/50 hover:bg-white/[0.04] transition-all text-center space-y-2 group cursor-pointer"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  {key === "sciences_exp" ? "🧬" : key === "math" ? "📐" : key === "technique_math" ? "⚙️" : key === "gestion_eco" ? "📊" : key === "lettres_philo" ? "📜" : "🌍"}
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  {meta.name_ar}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono block">
                  BAC 2027
                </span>
              </Link>
            ))}
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 8 — المعلم الذكي الشاطر (AI Pedagogical Tutor)             */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-[#0B1222] border-b border-white/[0.08]" id="tutor-section" dir="rtl">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5 text-right">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
                <Bot className="w-3.5 h-3.5" />
                <span>المعلم التربوي الذكي</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                معلمك الخاص 24/7.. <br />
                <span className="text-blue-400">
                  يشرح لك بمنهجية فاينمان وبدون هلوسة.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                تطبيق تربوي صارم مدرب على المنهاج الجزائري. لا يعطيك الحلول الجاهزة لتنسخها، بل يقودك خطوة بخطوة بالأسئلة التوجيهية لتفهم المبدأ بنفسك.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
                  <strong className="text-white block mb-0.5">تبسيط المفاهيم الصعبة</strong>
                  <span className="text-slate-400 text-[11px]">شرح بالدارجة وبأمثلة من الواقع.</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
                  <strong className="text-white block mb-0.5">منهجية الإجابة النموذجية</strong>
                  <span className="text-slate-400 text-[11px]">مراعاة معايير التنقيط الوزارية.</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/tutor">
                  <Button variant="outline" size="md" className="rounded-2xl border-white/10 text-white hover:bg-white/[0.06] font-bold text-xs px-6 py-4">
                    <span>تحدث مع المعلم الذكي الشاطر ←</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Chat Box Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-white/10 bg-[#070B14] p-5 sm:p-6 shadow-2xl space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    ش
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">المعلم الشاطر 🤖</span>
                    <span className="text-[10px] text-emerald-400">متصل وجاهز للمساعدة</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-slate-200 ml-auto max-w-[85%] text-right">
                    «أستاذ، راني نخلط بين المقصد الضروري والحاجي في العلوم الإسلامية، كيفاش نفرق بيناتهم في الباك؟»
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-600/25 border border-blue-500/40 text-blue-100 mr-auto max-w-[90%] text-right space-y-1.5 leading-relaxed">
                    <p className="font-bold text-amber-300">طريقة بسيطة وعملية:</p>
                    <p>
                      <strong>المقصد الضروري:</strong> إذا فُقد تنعدم الحياة ويختل النظام (مثل القتل لحفظ النفس، أو الردة لحفظ الدين).
                    </p>
                    <p>
                      <strong>المقصد الحاجي:</strong> إذا فُقد لا تنعدم الحياة، بصح تولي صعيبة وفيها حرج وميل (مثل الرخص الشرعية كالجمع وقصر الصلاة للمسافر).
                    </p>
                    <p className="text-[10px] text-blue-300 font-bold pt-1">
                      جرب تصنف: «تشريع البيع والإجارة» ضروري ولا حاجي؟
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* SECTION 9 — العرض النهائي والتجربة المجانية (FINAL CALL TO ACTION)  */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#070B14] via-[#0B1222] to-[#070B14] border-b border-white/[0.08] relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="md" className="relative z-10 text-center space-y-8">
          
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-block">
              أسبوع تجربة استكشافية كاملة (7 أيام - 0 دج)
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              الباك ماشي صدفة.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                والشاطر يحط خدمتك في مكانها.
              </span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              انضم الآن لآلاف الطلاب الجزائريين الذين ينظمون مذاكرتهم في مجلس العلم ويرفعون معدلاتهم بنظام.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-black px-10 py-5 rounded-2xl text-base bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-2xl shadow-amber-500/30 cursor-pointer hover:scale-105"
              >
                <span>ابدأ مجانًا الآن</span>
                <Arrow className="w-4 h-4 ms-2" />
              </Button>
            </Link>

            <Link href="/diwan" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-5 rounded-2xl font-bold text-sm bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]"
              >
                <span>استكشف ديوان العلم 🏛️</span>
              </Button>
            </Link>
          </div>

          {/* Brand Philosophy */}
          <div className="pt-6 space-y-1 text-xs text-slate-400">
            <div className="font-bold text-white text-sm">الشاطر | SHATER BAC 2027</div>
            <div>نبني الإنسان الشاطر، ونبدأ بالبكالوريا.</div>
            <div className="text-amber-400 font-bold pt-0.5">« ماشي واش تقرا. كيفاش توصل. »</div>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* COMPACT RICH FOOTER                                                */}
      {/* =================================================================== */}
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
              <Link href="/diwan" className="text-amber-400 hover:underline font-bold">ديوان العلم 🏛️</Link>
              <Link href="/orientation" className="text-emerald-400 hover:underline font-bold">حاسبة التوجيه 🎓</Link>
              <Link href="/experiences" className="hover:text-white">بنك التجارب</Link>
              <Link href="/calculator" className="hover:text-white">حاسبة المعدل</Link>
              <Link href="/curriculum" className="hover:text-white">الدروس والملخصات</Link>
              <Link href="/exams" className="hover:text-white">بنك البكالوريات</Link>
              <Link href="/error-lab" className="hover:text-white">معمل الأخطاء</Link>
              <Link href="/planner" className="hover:text-white">المخطط اليومي</Link>
              <Link href="/tutor" className="hover:text-white">المعلم الذكي</Link>
              <Link href="/faq" className="hover:text-white">الأسئلة الشائعة</Link>
              <Link href="/auth" className="hover:text-white">تسجيل الدخول</Link>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>منصة الشاطر مصممة خصيصاً للتحضير المتفوق لشهادة البكالوريا الجزائرية.</span>
            <a
              href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى استفسار حول منصة الشاطر للبكالوريا.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              خدمة الدعم والاستفسارات عبر واتساب:{" "}
              <span dir="ltr" className="font-mono inline-block text-left" style={{ unicodeBidi: "isolate" }}>
                +213 550 85 32 34
              </span>
            </a>
          </div>
        </Container>
      </footer>

      {/* =================================================================== */}
      {/* MOBILE STICKY BOTTOM CTA BAR                                       */}
      {/* =================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#0B1222]/95 backdrop-blur-xl border-t border-white/10 md:hidden z-30 flex items-center justify-between gap-3 shadow-2xl" dir="rtl">
        <div className="text-right">
          <span className="text-xs font-black text-white block">الشاطر BAC 2027</span>
          <span className="text-[10px] text-emerald-400 font-bold">أسبوع تجربة مجانية (0 دج)</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/diwan" className="shrink-0">
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs px-3 py-2 bg-blue-500/10 border-blue-500/30 text-blue-300">
              <span>المجلس 🏛️</span>
            </Button>
          </Link>
          <Link href="/auth/register" className="shrink-0">
            <Button variant="primary" size="sm" className="rounded-xl font-black text-xs px-4 py-2 bg-amber-400 text-slate-950">
              <span>ابدأ الآن</span>
              <Arrow className="w-3.5 h-3.5 ms-1" />
            </Button>
          </Link>
        </div>
      </div>

    </AppShell>
  );
}
