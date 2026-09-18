import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import {
  HelpCircle,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  FileCheck2,
  Calculator,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة حول البكالوريا الجزائرية ومنصة الشاطر | FAQ",
  description:
    "إجابات منهجية وشاملة عن أكثر الأسئلة طرحاً حول التحضير للبكالوريا الجزائرية 2027، حساب المعدل، المعدل الموزون للطب، مواضيع البكالوريا السابقة مع التصحيح، وكيفية التدرب مع منصة الشاطر.",
  keywords: [
    "الأسئلة الشائعة البكالوريا الجزائرية",
    "تاريخ بكالوريا 2027 الجزائر",
    "المعدل الموزون للطب في الجزائر",
    "كيفية اختيار موضوع البكالوريا",
    "مراجعة البكالوريا للمترشحين الأحرار",
    "منصة الشاطر بكالوريا",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "الأسئلة الشائعة حول البكالوريا الجزائرية 2027 | الشاطر SHATER",
    description:
      "كل ما تحتاج معرفته عن امتحانات البكالوريا، المنهجية المعتمدة، وشروط التفوق الدراسي في منصة الشاطر.",
    images: [
      {
        url: "/illustrations/shater-hero.jpg",
        width: 1200,
        height: 630,
        alt: "الأسئلة الشائعة حول البكالوريا - الشاطر",
      },
    ],
    type: "article",
  },
};

const FAQ_LIST = [
  {
    question: "متى يُجرى امتحان شهادة البكالوريا في الجزائر عادةً؟",
    answer:
      "يُجرى امتحان شهادة التعليم الثانوي (البكالوريا) في الجزائر سنوياً في الأسبوع الأول أو الثاني من شهر جوان (يونيو)، ويمتد على مدار 5 أيام متتالية حسب الجدول الزمني الرسمي المحدد من قِبل وزارة التربية الوطنية والديوان الوطني للامتحانات والمسابقات (ONEC).",
  },
  {
    question: "كيف يُحسب المعدل الموزون للقبول في التخصصات الطبية وكليات النخبة؟",
    answer:
      "المعدل الموزون هو صيغة رياضية تعتمدها وزارة التعليم العالي والبحث العلمي لتوجيه حاملي البكالوريا؛ بحيث يُحسب في العلوم الطبية وفق المعادلة: (معدل البكالوريا العام × 2 + علامة علوم الطبيعة والحياة) مقسوماً على 3. وفي التخصصات الهندسية والإعلام الآلي، تُستبدل علامة العلوم بعلامة الرياضيات والفيزياء وفق المنشور الوزاري السنوي.",
  },
  {
    question: "ما هي قاعدة الـ 30 دقيقة الذهبية لاختيار الموضوع في البكالوريا؟",
    answer:
      "قاعدة الـ 30 دقيقة هي استراتيجية منهجية معتمدة من مفتشي التربية: في كل امتحان، يُعطى الطالب موضوعين اختياريين و30 دقيقة إضافية. يُنصح بقضاء 15 دقيقة لقراءة الموضوعين معاً دون البدء بالحل، 10 دقائق لتقييم النقاط المضمونة بنسبة 100%، و5 دقائق لاتخاذ قرار نهائي غير قابل للرجوع، ثم إخفاء الموضوع الآخر نهائياً.",
  },
  {
    question: "ما الذي يميز منصة الشاطر (SHATER) عن مجرد تحميل ملخصات PDF؟",
    answer:
      "منصة الشاطر ليست مكتبة ملفات عشوائية، بل هي منظومة تدريب ذكية قائمة على التشخيص الدقيق ومعالجة الثغرات: تبدأ بقياس مستواك في كل كفاءة، تقدم لك مهمات تدريبية مركزة، وتحتوي على 'معمل الأخطاء' الذي يحلل أين أخطأت ولماذا، ليعيد تدريبك باختبارات توأمية حتى تتقن الحل بنسبة 100% بمقاييس التصحيح الوزاري.",
  },
  {
    question: "هل توفر المنصة مواضيع البكالوريا الرسمية السابقة مع التصحيح النموذجي؟",
    answer:
      "نعم، توفر المنصة بنكاً كاملاً لمواضيع البكالوريا الرسمية الصادرة عن الديوان الوطني للامتحانات والمسابقات (ONEC) مقسمة ومصنفة حسب المواد والوحدات التعليمية، ومرفقة بسلالم التنقيط الوزارية النموذجية وملاحظات اللجان البيداغوجية.",
  },
  {
    question: "هل يمكن للمترشحين الأحرار (Candidats Libres) الاستفادة من منصة الشاطر؟",
    answer:
      "بالتأكيد. الشاطر مصمم خصيصاً ليمنح المترشح الحر مساراً دراسياً منظماً وموجهاً يغنيه عن الدروس الخصوصية المشتتة، حيث يوفر له التشخيص الذاتي المستمر، التدرج السنوي للدروس، والتدريب على نمط الأسئلة الوزارية دون الحاجة لأستاذ خاص.",
  },
  {
    question: "كيف تساعدني حاسبة معدل البكالوريا المتاحة في المنصة؟",
    answer:
      "تسمح لك حاسبة معدل الشاطر بوضع فرضيات مختلفة لنقاطك، مع احتساب المعاملات الرسمية لكل شعبة بدقة، وتوضح لك فوراً ما هي المدارس العليا (كليات الطب، الذكاء الاصطناعي، المدارس المتعددة التقنيات، كليات التجارة) التي تفتح أبوابها أمام هذا المعدل.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans antialiased">
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "الأسئلة الشائعة", url: "/faq" },
        ]}
      />
      <FAQJsonLd items={FAQ_LIST} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-serif font-black text-2xl text-[#1E3A34]">
              الشاطر
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-[#2C5E54]">الأسئلة الشائعة</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/bac-2027"
              className="text-xs font-bold text-slate-700 hover:text-[#2C5E54] transition-colors hidden sm:inline-block"
            >
              دليل الشعب
            </Link>
            <Link
              href="/calculator"
              className="text-xs font-bold text-slate-700 hover:text-[#2C5E54] transition-colors hidden sm:inline-block"
            >
              حاسبة المعدل
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

      {/* Hero */}
      <section className="px-4 pt-12 pb-10 md:pt-16 md:pb-12 border-b border-[#E8E2D5] text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2C5E54]/10 text-[#2C5E54] text-xs font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>مركز المساعدة والمعلومات المنهجية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#1E3A34] leading-tight">
            الأسئلة الأكثر شيوعاً حول البكالوريا الجزائرية
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            إجابات موثوقة تستند إلى المناشير الوزارية الرسمية وخبرة الأساتذة والمفتشين لمساعدتك على تنظيم مراجعتك بثقة.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {FAQ_LIST.map((item, idx) => (
          <details
            key={idx}
            className="group bg-white rounded-3xl border border-[#E8E2D5] p-6 transition-all hover:border-[#2C5E54] shadow-sm open:shadow-md"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-open:text-[#2C5E54] transition-colors">
                {item.question}
              </h2>
              <span className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center text-slate-600 group-open:rotate-180 transition-transform shrink-0">
                <ChevronDown className="w-4 h-4" />
              </span>
            </summary>
            <p className="mt-4 pt-4 border-t border-[#F2ECE1] text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              {item.answer}
            </p>
          </details>
        ))}

        {/* Action Card */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-[#EFE9DC] to-[#F7F3EA] border border-[#E4DED2] text-center space-y-4">
          <h3 className="text-xl font-serif font-black text-[#1E3A34]">
            لديك سؤال آخر أو تريد البدء في التدريب العملي؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            انضم إلى منظومة الشاطر واكتشف مستواك الحقيقي في مواد شعبتك عبر تشخيص أولي سريع ومجاني.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2C5E54] text-white text-xs font-bold shadow-md hover:bg-[#234b43] transition-all"
            >
              <span>ابدأ التشخيص المجاني الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#E8E2D5] text-slate-800 text-xs font-bold hover:border-[#2C5E54] transition-all"
            >
              <Calculator className="w-4 h-4 text-[#2C5E54]" />
              <span>جرب حاسبة المعدل</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] bg-[#F2ECE1]/40 py-8 px-4 text-center text-xs text-slate-500 mt-16">
        <p>© 2026-2027 الشاطر (SHATER) — كل الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
