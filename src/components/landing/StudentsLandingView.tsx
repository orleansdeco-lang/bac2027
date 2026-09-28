"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/ui/AppShell";
import { Logo, ShaterIcon } from "@/components/ui/Logo";
import { useLandingUtm } from "@/lib/hooks/useLandingUtm";
import { LANDING_CONFIG } from "@/lib/constants/landing-config";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Compass,
  Landmark,
  Brain,
  FileText,
  Target,
  Heart,
  Share2,
  Clock,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

interface DreamTarget {
  id: string;
  title: string;
  category: string;
  minAvg: string;
  keySubjects: string;
  icon: string;
}

const DREAMS: DreamTarget[] = [
  {
    id: "med",
    title: "كلية الطب والصيدلة وطب الأسنان",
    category: "العلوم الطبية",
    minAvg: "16.50+",
    keySubjects: "العلوم الطبيعية (معامل 6 أو 7) والرياضيات والفيزياء",
    icon: "🩺",
  },
  {
    id: "ai",
    title: "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)",
    category: "مدارس النخبة العليا",
    minAvg: "17.00+",
    keySubjects: "الرياضيات والفيزياء (المعدل الموزون الرسمي)",
    icon: "🤖",
  },
  {
    id: "polytech",
    title: "المدرسة الوطنية متعددة التقنيات (ENP)",
    category: "الهندسة والتكنولوجيا",
    minAvg: "16.00+",
    keySubjects: "الرياضيات، التكنولوجيا والفيزياء",
    icon: "📐",
  },
  {
    id: "cs",
    title: "المدرسة العليا للإعلام الآلي (ESI)",
    category: "علوم الحاسوب والبرمجيات",
    minAvg: "17.20+",
    keySubjects: "الرياضيات والفيزياء مع المعدل الموزون",
    icon: "💻",
  },
  {
    id: "ens",
    title: "المدارس العليا للأساتذة (ENS)",
    category: "التعليم العالي والتربية",
    minAvg: "15.00+",
    keySubjects: "مادة التخصص في شعبتك (أدب، علوم، لغات، تاريخ)",
    icon: "🎓",
  },
  {
    id: "law_eco",
    title: "الحقوق، الإدارة والعلوم الاقتصادية",
    category: "العلوم الإنسانية والاقتصادية",
    minAvg: "13.50+",
    keySubjects: "التسيير المالي، الاقتصاد، الفلسفة واللغات",
    icon: "⚖️",
  },
];

export function StudentsLandingView() {
  const { buildAuthUrl } = useLandingUtm("lp_students");
  const [selectedDream, setSelectedDream] = useState<DreamTarget>(DREAMS[0]);
  const signupUrl = buildAuthUrl("/auth/register", { customSource: "lp_students" });
  const trialDays = LANDING_CONFIG.trialDurationDays;

  // WhatsApp share to parents text
  const shareMessage = `السلام عليكم، لقيت هاد المنصة الجزائرية للباك (الشاطر) منظمة وفيها مجالس تركيز ومستكشف التوجيه وتجربة مجانية 7 أيام بدون دفع. شوفو تفاصيل الأولياء هنا: https://shater-bac.dz/parents`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      <div className="min-h-screen bg-[#070B14] text-white selection:bg-amber-400 selection:text-slate-950 font-sans" dir="rtl">
        
        {/* =================================================================== */}
        {/* SCREEN 1: THE NIGHTTIME EMOTIONAL HOOK                             */}
        {/* =================================================================== */}
        <section className="relative pt-12 sm:pt-20 pb-16 border-b border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#0B1222] via-[#070B14] to-[#0B1222]">
          {/* Night ambient glows */}
          <div className="absolute top-1/4 right-1/4 w-[450px] h-[350px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <Container size="md" className="relative z-10 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>فضاء طلاب البكالوريا 2026/2027 🇩🇿</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.25]">
              نهار النتائج.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-300">
                وين حاب تكون؟
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
              تخيل لحظة خروج كشف النقاط: زغاريد في الدار، دموع فرحة الوالدين، وعلامتك تسمح لك تخيّر التخصص اللي حلمت بيه وأنت مرتاح الرأس. هذا اليوم يبدأ بالقرارات اللي تاخذها الليلة.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={signupUrl} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto font-black px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-sm shadow-xl shadow-amber-500/25 cursor-pointer hover:scale-[1.02] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>ابدأ مجاناً (7 أيام • 0 دج)</span>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>

              <a href="#dream-selector" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white"
                >
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>اكتشف معدل حلمك الجامعي</span>
                </Button>
              </a>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-3 pt-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>بدون بطاقة بنكية</span>
              </span>
              <span>•</span>
              <span>بدون أي التزام</span>
              <span>•</span>
              <span>تغطية 6 شُعب</span>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 2: DREAM SELECTOR (وين حاب توصل؟)                            */}
        {/* =================================================================== */}
        <section id="dream-selector" className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>حدد وجهتك قبل أن تبدأ</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                وين حاب توصل؟ اختر هدفك:
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                اضغط على التخصص لتعرف المعدل المطلوب وأهم المواد التي تصنع الفارق:
              </p>
            </div>

            {/* Dreams Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DREAMS.map((dream) => {
                const isSelected = selectedDream.id === dream.id;
                return (
                  <button
                    key={dream.id}
                    onClick={() => setSelectedDream(dream)}
                    type="button"
                    className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer border flex flex-col items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10 scale-105"
                        : "bg-[#0B1222] border-white/10 hover:border-white/20 text-slate-300"
                    }`}
                  >
                    <span className="text-2xl">{dream.icon}</span>
                    <span className="text-xs font-black text-white leading-tight">
                      {dream.title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">
                      {dream.minAvg}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Dream Focus Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B1222] border border-amber-500/30 max-w-2xl mx-auto text-right space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedDream.icon}</span>
                  <div>
                    <h3 className="text-base font-black text-white">{selectedDream.title}</h3>
                    <span className="text-xs text-amber-400 font-medium">{selectedDream.category}</span>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xs text-slate-400 block">المعدل التقريبي</span>
                  <span className="text-lg font-black text-emerald-400">{selectedDream.minAvg}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <strong className="text-white block font-bold">المواد الحاسمة التي تصنع المعدل الموزون:</strong>
                <p className="leading-relaxed text-slate-300">{selectedDream.keySubjects}</p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <Link
                  href="/orientation"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <span>افتح مستكشف التوجيه وحساب المعدل الموزون الرسمي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <Link href={signupUrl}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-xl font-black text-xs px-4 py-2 bg-amber-400 text-slate-950"
                  >
                    <span>ابدأ تحضير هذا الهدف</span>
                  </Button>
                </Link>
              </div>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 3: THE 3 REAL OBSTACLES (العوائق الثلاثة)                     */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#0B1222] border-b border-white/[0.08]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>الصراحة مع النفس</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ثلاثة أفخاخ تسرق منك البكالوريا كل يوم
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-3xl bg-[#070B14] border border-rose-500/30 text-right space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">
                  📱
                </div>
                <h3 className="text-sm font-black text-white">1. وهم "10 دقائق استراحة"</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  تفتح التيليغرام أو إنستغرام لتبحث عن ملخص، فتجد نفسك بعد ساعتين تتصفح ريلز عشوائية. يضيع وقتك وتنهي يومك بالإحباط وتأنيب الضمير.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#070B14] border border-amber-500/30 text-right space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                  📖
                </div>
                <h3 className="text-sm font-black text-white">2. الحفظ الأعمى دون منهجية</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  تحفظ الدروس كأنها نصوص شعرية، ولكن نهار الباك تتفاجأ بأسئلة الاستدلال العلمي والتحليل المقارن وسلالم التنقيط الوزارية الدقيقة.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#070B14] border border-purple-500/30 text-right space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                  🛋️
                </div>
                <h3 className="text-sm font-black text-white">3. الدراسة الفردية المعزولة</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  الدراسة وحدك في الغرفة بدون مؤقت وبدون رفاق جادين تجعلك تسوّف وتؤجل مهام اليوم إلى الغد، حتى تتراكم الدروس وتتحول لكابوس.
                </p>
              </div>

            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 4: THE 3-STEP SOLUTION IN SHATER                             */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>طريقة الشاطر</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ثلاث خطوات تحول دراستك إلى تفوق مضمون
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-3xl bg-[#0B1222] border border-emerald-500/30 text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Brain className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">الخطوة 1</span>
                </div>
                <h3 className="text-base font-black text-white">تشخيص ذكي يحدد ثغراتك</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  تختبر مستواك في كل وحدة، والمنصة تفرز لك بدقة القوانين والمفاهيم التي تخطئ فيها وتضعها في معمل الأخطاء لترميمها.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0B1222] border border-amber-500/30 text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400">الخطوة 2</span>
                </div>
                <h3 className="text-base font-black text-white">مسار يومي بالورقة والقلم</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  مهمات يومية محددة لا تترك لك مجالاً للتسويف. تحل التمارين على كراسك وتصححها بنماذج الوزارة وسلم التنقيط الرسمي.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0B1222] border border-blue-500/30 text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Landmark className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-400">الخطوة 3</span>
                </div>
                <h3 className="text-base font-black text-white">مجالس علم حية مع الزملاء</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  طاولات دراسة متزامنة ومباشرة تجمعك مع طلاب شعبتك. تشعر بجو المنافسة والالتزام الصامت دون إشعارات أو تشتيت.
                </p>
              </div>

            </div>

            <div className="text-center pt-2">
              <Link href={signupUrl}>
                <Button
                  variant="primary"
                  size="md"
                  className="font-black px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs shadow-lg cursor-pointer"
                >
                  <span>جرّب المنظومة مجاناً لـ 7 أيام</span>
                  <ArrowLeft className="w-4 h-4 ms-2" />
                </Button>
              </Link>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 5: EMOTIONAL CELEBRATION (فرّح والديك) + WHATSAPP SHARE       */}
        {/* =================================================================== */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-[#0B1222] via-[#070B14] to-[#070B14] border-b border-white/[0.08]">
          <Container size="md" className="text-center space-y-6">
            
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mx-auto border border-rose-500/30 shadow-lg shadow-rose-500/20">
              ❤️
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              «فرّح والديك.. هذا الحلم يستاهل التزامك اليوم»
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto font-medium">
              تعب والديك وسهرهم معك يستحق منك انطلاقة حقيقية. شارك معهم تجربة المنصة وتعرف على راحة البال التي توفرها لهم أيضاً.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-lg mx-auto space-y-3">
              <span className="text-xs text-amber-300 font-bold block">
                هل تريد إشراك والديك وإطلاعهم على المنصة؟
              </span>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-600/25"
              >
                <Share2 className="w-4 h-4" />
                <span>شارك رابط دليل الأولياء مع والديك عبر واتساب 📲</span>
              </a>
              <span className="text-[10px] text-slate-400 block">
                سيرسل رسالة جاهزة تتضمن رابط صفحة الأولياء لشرح الأمان والدفع عند الاستلام.
              </span>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
              <Link href="/orientation" className="text-emerald-400 hover:underline font-bold">
                مستكشف التوجيه
              </Link>
              <span>•</span>
              <Link href="/diwan" className="text-amber-400 hover:underline font-bold">
                ديوان العلم
              </Link>
              <span>•</span>
              <Link href="/exams" className="hover:text-white">
                بنك البكالوريات
              </Link>
              <span>•</span>
              <Link href="/parents" className="hover:text-white">
                صفحة الأولياء
              </Link>
            </div>

          </Container>
        </section>

      </div>
    </AppShell>
  );
}
