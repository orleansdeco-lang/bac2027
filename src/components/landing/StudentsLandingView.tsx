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
  Award,
  Check,
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
  const shareMessage = `السلام عليكم، لقيت هاد المنصة الجزائرية للباك (الشاطر) فيها تنظيم هايل ومجالس تركيز ومستكشف التوجيه وتجربة مجانية 7 أيام بدون دفع. شوفو تفاصيل الأولياء هنا: https://shater-bac.dz/parents`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      <div className="min-h-screen bg-[#F7F3EA] text-[#0F172A] selection:bg-[#DCE9E4] selection:text-[#0F172A] font-sans" dir="rtl">
        
        {/* =================================================================== */}
        {/* SCREEN 1: THE NIGHTTIME EMOTIONAL HOOK                             */}
        {/* =================================================================== */}
        <section className="relative pt-12 sm:pt-18 pb-16 border-b border-[#E4DED2] overflow-hidden bg-gradient-to-b from-[#F7F3EA] via-[#FAF7F0] to-[#F7F3EA]">
          <div className="absolute top-1/4 right-1/4 w-[450px] h-[350px] bg-[#5F8F86]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-[#D7A66A]/10 rounded-full blur-3xl pointer-events-none" />

          <Container size="lg" className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-7 text-center lg:text-right space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DCE9E4] border border-[#5F8F86]/30 text-[#385853] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#5F8F86]" />
                  <span>فضاء طلاب البكالوريا 2026/2027 🇩🇿</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.25]">
                  نهار النتائج.. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#26302F] via-[#5F8F86] to-[#D7A66A]">
                    وين حاب تكون؟
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#334155] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  تخيل لحظة خروج كشف النقاط: زغاريد في الدار، دموع فرحة الوالدين، وعلامتك تسمح لك تخيّر التخصص اللي حلمت بيه وأنت مرتاح الرأس. هذا اليوم يبدأ بالقرارات اللي تاخذها الليلة.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link href={signupUrl} className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto font-black px-8 py-4 rounded-2xl bg-[#5F8F86] hover:bg-[#527D75] text-white text-sm shadow-lg shadow-[#5F8F86]/20 cursor-pointer hover:scale-[1.02] transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>ابدأ مجاناً (7 أيام • 0 دج)</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </Link>

                  <a href="#dream-selector" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm bg-white hover:bg-[#FAF7F0] border-[#E4DED2] text-[#0F172A] shadow-sm"
                    >
                      <Target className="w-4 h-4 text-[#D7A66A]" />
                      <span>اكتشف معدل حلمك الجامعي</span>
                    </Button>
                  </a>
                </div>

                <div className="text-xs text-[#475569] flex items-center justify-center lg:justify-start gap-3 pt-1 flex-wrap">
                  <span className="text-[#245431] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9B7B]" />
                    <span>بدون بطاقة بنكية</span>
                  </span>
                  <span>•</span>
                  <span>بدون أي التزام</span>
                  <span>•</span>
                  <span>تغطية 6 شُعب</span>
                </div>
              </div>

              {/* Expressive Photo Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative rounded-3xl overflow-hidden border border-[#E4DED2] bg-white p-3 shadow-card max-w-md w-full">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full border border-[#E4DED2]">
                    <Image
                      src="/illustrations/shater-hero.jpg"
                      alt="طالب جزائري يدرس بتركيز وهدوء ليلاً"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/75 via-transparent to-transparent" />
                    <div className="absolute bottom-3 right-3 left-3 text-right">
                      <span className="text-[11px] font-bold text-white bg-[#5F8F86] px-2.5 py-0.5 rounded-full inline-block">
                        تركيز حقيقي ✍️
                      </span>
                      <p className="text-xs text-white/95 pt-1 font-bold">
                        كراس 200 صفحة، آلة حاسبة، وحل بسلم التنقيط الوزاري
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 2: DREAM SELECTOR (وين حاب توصل؟)                            */}
        {/* =================================================================== */}
        <section id="dream-selector" className="py-12 sm:py-16 bg-[#FAF7F0] border-b border-[#E4DED2]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F2EB] border border-[#6E9B7B]/30 text-[#245431] text-xs font-bold">
                <Compass className="w-3.5 h-3.5 text-[#6E9B7B]" />
                <span>حدد وجهتك قبل أن تبدأ</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A]">
                وين حاب توصل؟ اختر هدفك:
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
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
                    className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer border flex flex-col items-center justify-between gap-2 shadow-sm ${
                      isSelected
                        ? "bg-white border-2 border-[#5F8F86] shadow-clay scale-105"
                        : "bg-white border-[#E4DED2] hover:border-[#5F8F86]/40 text-[#334155]"
                    }`}
                  >
                    <span className="text-2xl">{dream.icon}</span>
                    <span className="text-xs font-black text-[#0F172A] leading-tight">
                      {dream.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#385853] font-bold bg-[#DCE9E4] px-2 py-0.5 rounded-full border border-[#5F8F86]/30">
                      {dream.minAvg}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Dream Focus Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E4DED2] max-w-2xl mx-auto text-right space-y-4 shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DED2]">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedDream.icon}</span>
                  <div>
                    <h3 className="text-base font-black text-[#0F172A]">{selectedDream.title}</h3>
                    <span className="text-xs text-[#8C5D23] font-bold">{selectedDream.category}</span>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xs text-[#475569] block">المعدل التقريبي</span>
                  <span className="text-lg font-black text-[#5F8F86]">{selectedDream.minAvg}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#334155]">
                <strong className="text-[#0F172A] block font-bold">المواد الحاسمة التي تصنع المعدل الموزون:</strong>
                <p className="leading-relaxed text-[#475569]">{selectedDream.keySubjects}</p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <Link
                  href="/orientation"
                  className="text-xs font-bold text-[#5F8F86] hover:text-[#527D75] underline flex items-center gap-1"
                >
                  <span>افتح مستكشف التوجيه وحساب المعدل الموزون الرسمي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <Link href={signupUrl}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-xl font-black text-xs px-4 py-2 bg-[#5F8F86] hover:bg-[#527D75] text-white shadow-sm"
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
        <section className="py-12 sm:py-16 bg-[#F7F3EA] border-b border-[#E4DED2]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9EAE8] border border-[#C8796B]/30 text-[#9E3A2B] text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-[#C8796B]" />
                <span>الصراحة مع النفس</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                ثلاثة أفخاخ تسرق منك البكالوريا كل يوم
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] text-right space-y-2.5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-[#F9EAE8] text-[#C8796B] flex items-center justify-center font-bold text-lg">
                  📱
                </div>
                <h3 className="text-sm font-black text-[#0F172A]">1. وهم "10 دقائق استراحة"</h3>
                <p className="text-xs text-[#475569] leading-relaxed font-medium">
                  تفتح التيليغرام أو إنستغرام لتبحث عن ملخص، فتجد نفسك بعد ساعتين تتصفح ريلز عشوائية. يضيع وقتك وتنهي يومك بالإحباط وتأنيب الضمير.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] text-right space-y-2.5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-[#F9EFE2] text-[#D7A66A] flex items-center justify-center font-bold text-lg">
                  📖
                </div>
                <h3 className="text-sm font-black text-[#0F172A]">2. الحفظ الأعمى دون منهجية</h3>
                <p className="text-xs text-[#475569] leading-relaxed font-medium">
                  تحفظ الدروس كأنها نصوص مكررة، ولكن نهار الباك تتفاجأ بأسئلة الاستدلال العلمي والتحليل المقارن وسلالم التنقيط الوزارية الدقيقة.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] text-right space-y-2.5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-[#DCE9E4] text-[#5F8F86] flex items-center justify-center font-bold text-lg">
                  🛋️
                </div>
                <h3 className="text-sm font-black text-[#0F172A]">3. الدراسة الفردية المعزولة</h3>
                <p className="text-xs text-[#475569] leading-relaxed font-medium">
                  الدراسة وحدك في الغرفة بدون مؤقت وبدون رفاق جادين تجعلك تسوّف وتؤجل مهام اليوم إلى الغد، حتى تتراكم الدروس وتتحول لكابوس.
                </p>
              </div>

            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 4: THE 3-STEP SOLUTION IN SHATER                             */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#FAF7F0] border-b border-[#E4DED2]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE9E4] border border-[#5F8F86]/30 text-[#385853] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#5F8F86]" />
                <span>طريقة الشاطر</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                ثلاث خطوات تحول دراستك إلى تفوق مضمون
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] text-right space-y-3 shadow-sm hover:shadow-card transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-[#DCE9E4] text-[#385853] flex items-center justify-center font-bold border border-[#5F8F86]/30">
                    <Brain className="w-4 h-4 text-[#5F8F86]" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#385853] bg-[#DCE9E4] px-2 py-0.5 rounded-full">الخطوة 1</span>
                </div>
                <h3 className="text-base font-black text-[#0F172A]">تشخيص ذكي يحدد ثغراتك</h3>
                <p className="text-xs text-[#475569] leading-relaxed font-medium">
                  تختبر مستواك في كل وحدة، والمنصة تفرز لك بدقة القوانين والمفاهيم التي تخطئ فيها وتضعها في معمل الأخطاء لترميمها.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] text-right space-y-3 shadow-sm hover:shadow-card transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-[#F9EFE2] text-[#8C5D23] flex items-center justify-center font-bold border border-[#D7A66A]/30">
                    <FileText className="w-4 h-4 text-[#D7A66A]" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#8C5D23] bg-[#F9EFE2] px-2 py-0.5 rounded-full">الخطوة 2</span>
                </div>
                <h3 className="text-base font-black text-[#0F172A]">مسار يومي بالورقة والقلم</h3>
                <p className="text-xs text-[#475569] leading-relaxed font-medium">
                  مهمات يومية محددة لا تترك لك مجالاً للتسويف. تحل التمارين على كراسك وتصححها بنماذج الوزارة وسلم التنقيط الرسمي.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E4DED2] text-right space-y-3 shadow-sm hover:shadow-card transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-[#E8F2EB] text-[#245431] flex items-center justify-center font-bold border border-[#6E9B7B]/30">
                    <Landmark className="w-4 h-4 text-[#6E9B7B]" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#245431] bg-[#E8F2EB] px-2 py-0.5 rounded-full">الخطوة 3</span>
                </div>
                <h3 className="text-base font-black text-[#0F172A]">مجالس علم حية مع الزملاء</h3>
                <p className="text-xs text-[#475569] leading-relaxed font-medium">
                  طاولات دراسة متزامنة ومباشرة تجمعك مع طلاب شعبتك. تشعر بجو المنافسة والالتزام الصامت دون إشعارات أو تشتيت.
                </p>
              </div>

            </div>

            <div className="text-center pt-2">
              <Link href={signupUrl}>
                <Button
                  variant="primary"
                  size="md"
                  className="font-black px-8 py-4 rounded-2xl bg-[#5F8F86] hover:bg-[#527D75] text-white text-xs shadow-md shadow-[#5F8F86]/20 cursor-pointer"
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
        <section className="py-14 sm:py-20 bg-gradient-to-b from-[#F7F3EA] via-[#FAF7F0] to-[#EFE9DC] border-b border-[#E4DED2]">
          <Container size="md" className="text-center space-y-6">
            
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] w-full max-w-lg mx-auto border border-[#E4DED2] shadow-card">
              <Image
                src="/illustrations/bac-success-joy.jpg"
                alt="فرحة نهار إعلان نتائج البكالوريا مع العائلة"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="text-xs font-bold text-white bg-[#5F8F86] px-3 py-1 rounded-full">
                  نهار إعلان النتائج.. الفرحة الكبرى 🎓
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] leading-tight">
              «فرّح والديك.. هذا الحلم يستاهل التزامك اليوم»
            </h2>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xl mx-auto font-medium">
              تعب والديك وسهرهم معك يستحق منك انطلاقة حقيقية. شارك معهم تجربة المنصة وتعرف على راحة البال التي توفرها لهم أيضاً.
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4DED2] max-w-lg mx-auto space-y-3 shadow-sm">
              <span className="text-xs text-[#0F172A] font-bold block">
                هل تريد إشراك والديك وإطلاعهم على المنصة؟
              </span>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#5F8F86] hover:bg-[#527D75] text-white font-black text-xs transition-all shadow-md shadow-[#5F8F86]/20"
              >
                <Share2 className="w-4 h-4" />
                <span>شارك رابط دليل الأولياء مع والديك عبر واتساب 📲</span>
              </a>
              <span className="text-[10px] text-[#475569] block">
                سيرسل رسالة جاهزة تتضمن رابط صفحة الأولياء لشرح الأمان والدفع عند الاستلام.
              </span>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4 text-xs text-[#475569]">
              <Link href="/orientation" className="text-[#5F8F86] hover:underline font-bold">
                مستكشف التوجيه
              </Link>
              <span>•</span>
              <Link href="/diwan" className="text-[#8C5D23] hover:underline font-bold">
                ديوان العلم
              </Link>
              <span>•</span>
              <Link href="/exams" className="hover:text-[#0F172A]">
                بنك البكالوريات
              </Link>
              <span>•</span>
              <Link href="/parents" className="hover:text-[#0F172A]">
                صفحة الأولياء
              </Link>
            </div>

          </Container>
        </section>

      </div>
    </AppShell>
  );
}
