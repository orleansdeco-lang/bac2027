import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  BookOpen,
  Calculator,
  Compass,
  FileCheck2,
  GraduationCap,
  Sparkles,
  Target,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "دليل البكالوريا الجزائرية BAC 2027 | الشعب، المعاملات، وبرنامج التحضير",
  description:
    "الدليل الشامل للبكالوريا الجزائرية 2027 (BAC 2027): استكشف معاملات جميع الشعب، نصائح التوجيه المدرسي والجامعي، خطط المراجعة الذكية، وبنك مواضيع البكالوريا الرسمية مع منصة الشاطر.",
  keywords: [
    "البكالوريا الجزائرية 2027",
    "BAC 2027 الجزائر",
    "شعب البكالوريا في الجزائر",
    "معاملات مواد البكالوريا",
    "برنامج مراجعة البكالوريا 2027",
    "تحضير شهادة التعليم الثانوي",
    "الشاطر بكالوريا",
  ],
  alternates: {
    canonical: "/bac-2027",
  },
  openGraph: {
    title: "دليل البكالوريا الجزائرية BAC 2027 | الشاطر",
    description:
      "كل ما يحتاجه طالب البكالوريا 2027 في الجزائر: المعاملات الرسمية، برنامج المراجعة المتوازن، وروابط التحضير الذكي لكل شعبة.",
    images: [
      {
        url: "/illustrations/shater-hero.jpg",
        width: 1200,
        height: 630,
        alt: "دليل البكالوريا الجزائرية 2027 - منصة الشاطر",
      },
    ],
    type: "article",
  },
};

const STREAMS = [
  {
    slug: "sciences-experimentales",
    name: "شعبة العلوم التجريبية",
    french: "Sciences Expérimentales",
    badge: "الأكثر إقبالاً",
    highlight: "التركيز على العلوم الطبيعية والفيزياء والرياضيات للدخول إلى كليات الطب والمدارس العليا.",
    coeffs: "علوم طبيعية (6) • فيزياء (5) • رياضيات (5)",
  },
  {
    slug: "mathematiques",
    name: "شعبة الرياضيات",
    french: "Mathématiques",
    badge: "نخبة التحليل",
    highlight: "الأولوية الأولى لكليات الذكاء الاصطناعي والإعلام الآلي الآلي والمدارس الهندسية الكبرى.",
    coeffs: "رياضيات (7) • فيزياء (6) • لغة عربية (3)",
  },
  {
    slug: "technique-mathematiques",
    name: "شعبة تقني رياضي",
    french: "Technique Mathématiques",
    badge: "هندسة تطبيقية",
    highlight: "التخصص الدقيق: هندسة ميكانيكية، مدنية، كهربائية، أو طرائق مع أساس رياضي متين.",
    coeffs: "تكنولوجيا (6) • رياضيات (6) • فيزياء (6)",
  },
  {
    slug: "gestion-economie",
    name: "شعبة تسيير واقتصاد",
    french: "Gestion et Économie",
    badge: "عالم المال والأعمال",
    highlight: "طريق المدارس العليا للإدارة، العلوم الاقتصادية، والتجارة الدولية والمالية.",
    coeffs: "تسيير محاسبي (6) • اقتصاد ومناجمنت (5) • رياضيات (5)",
  },
  {
    slug: "lettres-philosophie",
    name: "شعبة آداب وفلسفة",
    french: "Lettres et Philosophie",
    badge: "الفكر والتحليل الأدبي",
    highlight: "بوابة كليات الحقوق والعلوم السياسية، اللغات، والإعلام والعلوم الإنسانية.",
    coeffs: "فلسفة (6) • لغة عربية (6) • تاريخ وجغرافيا (4)",
  },
  {
    slug: "langues-etrangeres",
    name: "شعبة لغات أجنبية",
    french: "Langues Étrangères",
    badge: "التواصل الدبلوماسي",
    highlight: "إتقان اللغات الأجنبية (فرنسية، إنجليزية، إسبانية/ألمانية/إيطالية) والترجمة.",
    coeffs: "لغة ثالثة (5) • فرنسية (5) • إنجليزية (5)",
  },
];

export default function Bac2027HubPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans antialiased">
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "دليل البكالوريا 2027", url: "/bac-2027" },
        ]}
      />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl text-[#1E3A34] tracking-tight">
              الشاطر
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#2C5E54]/10 text-[#2C5E54]">
              BAC 2027
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/calculator"
              className="text-xs font-bold text-slate-700 hover:text-[#2C5E54] transition-colors hidden sm:inline-block"
            >
              حاسبة المعدل
            </Link>
            <Link
              href="/curriculum"
              className="text-xs font-bold text-slate-700 hover:text-[#2C5E54] transition-colors hidden sm:inline-block"
            >
              الدروس والملخصات
            </Link>
            <Link
              href="/exams"
              className="text-xs font-bold text-slate-700 hover:text-[#2C5E54] transition-colors hidden sm:inline-block"
            >
              مواضيع وحلول
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold transition-all shadow-sm"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#E8E2D5]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2C5E54]/10 text-[#2C5E54] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>البوابة الرسمية للتحضير الأكاديمي المتوازن</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#1E3A34] leading-tight">
            دليل البكالوريا الجزائرية 2027
            <br />
            <span className="text-[#2C5E54]">من الفهم والتثبيت، إلى التميز في الامتحان</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            شهادة البكالوريا ليست مجرد حفظ للمعلومات؛ بل هي استراتيجية ذكية لإتقان المعاملات الأساسية،
            إدارة الوقت، وتجنب فخاخ التصحيح النموذجي الوزاري.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-sm font-bold shadow-md transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>احسب معدلك وتوقع تخصصك الجامعي</span>
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#2C5E54] text-slate-800 text-sm font-bold shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#2C5E54]" />
              <span>تصفح المنهاج والدروس</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6 Streams Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C5E54] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>مسارات البكالوريا في الجزائر</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1E3A34]">
            اختر شعبتك واكتشف المعاملات ومفاتيح النجاح
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            لكل شعبة خصوصيتها ومنهجيتها الخاصة. اضغط على شعبتك للاطلاع على التفاصيل الكاملة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STREAMS.map((st) => (
            <Link
              key={st.slug}
              href={`/bac-2027/${st.slug}`}
              className="group p-6 rounded-3xl bg-white border border-[#E8E2D5] hover:border-[#2C5E54] hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2C5E54]/10 text-[#2C5E54]">
                    {st.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{st.french}</span>
                </div>
                <h3 className="text-xl font-bold text-[#1E3A34] group-hover:text-[#2C5E54] transition-colors">
                  {st.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{st.highlight}</p>
              </div>

              <div className="pt-5 border-t border-[#F2ECE1] mt-5 space-y-2">
                <div className="text-[11px] font-mono text-slate-500">{st.coeffs}</div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C5E54] group-hover:underline">
                  <span>تفاصيل الشعبة والمنهاج</span>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Strategic Golden Rules */}
      <section className="bg-[#F2ECE1]/60 border-y border-[#E8E2D5] px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1E3A34]">
              المحاور الثلاثة للتفوق في بكالوريا 2027
            </h2>
            <p className="text-sm text-slate-600">
              ما الذي يفرّق بين الطالب المتفوق والطالب المشتت؟
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D5] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#2C5E54]/10 text-[#2C5E54] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1. التشخيص ومعرفة الثغرات</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                لا تبدأ بحل مواضيع كاملة وأنت تعاني من ثغرات مفاهيمية في أساسيات السنة الأولى والثانية. ابدأ دائماً بتحديد أين تخطئ بالضبط.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D5] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#2C5E54]/10 text-[#2C5E54] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">2. إدارة الوقت وقاعدة الـ 30 دقيقة</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                في قاعة الامتحان، خصص أول نصف ساعة لقراءة كلا الموضوعين ومقارنة النقاط المضمونة، ولا تبدأ أبداً قبل اتخاذ قرار حاسم.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D5] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#2C5E54]/10 text-[#2C5E54] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">3. الانضباط بسلالم التصحيح الوزارية</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                الوصول للنتيجة الصحيحة لا يكفي إن لم تكن الصياغة والوحدات والتعليلات مطابقة لشبكة التقويم الوزارية (ONEC).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fast Resource Links */}
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        <h2 className="text-xl font-serif font-black text-[#1E3A34] text-center">
          أدوات ومصادر تهمك الآن في مسيرتك
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/calculator"
            className="p-5 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#2C5E54] flex items-center gap-3 transition-all"
          >
            <Calculator className="w-8 h-8 text-[#2C5E54] shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900">حاسبة معدل البكالوريا</div>
              <div className="text-[11px] text-slate-500">حساب فوري بالمعاملات والتوجيه</div>
            </div>
          </Link>
          <Link
            href="/exams"
            className="p-5 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#2C5E54] flex items-center gap-3 transition-all"
          >
            <FileCheck2 className="w-8 h-8 text-[#2C5E54] shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900">بنك مواضيع البكالوريا</div>
              <div className="text-[11px] text-slate-500">مواضيع رسمية سابقة مع التصحيح</div>
            </div>
          </Link>
          <Link
            href="/faq"
            className="p-5 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#2C5E54] flex items-center gap-3 transition-all"
          >
            <HelpCircle className="w-8 h-8 text-[#2C5E54] shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900">الأسئلة الأكثر شيوعاً</div>
              <div className="text-[11px] text-slate-500">إجابات منهجية لكل استفساراتك</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] bg-[#F2ECE1]/40 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026-2027 الشاطر (SHATER) — منظومة التحضير الذكي للبكالوريا الجزائرية.</p>
        <p className="mt-1">جميع المناهج والمواضيع تتبع التدرج البيداغوجي لوزارة التربية الوطنية الجزائرية.</p>
      </footer>
    </div>
  );
}
