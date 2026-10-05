"use client";

import React from "react";
import { Book } from "@/types/book";
import { getSubjectMeta, getCategoryMeta, LIBRARY_STREAMS } from "@/lib/constants/library";
import {
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  FileText,
  Bookmark,
  GraduationCap,
} from "lucide-react";

interface BookA4ReaderProps {
  book: Book;
  pageNumber: number;
  totalPages: number;
  onJumpToPage: (page: number) => void;
}

// Curriculum breakdown & key reference concepts by subject
const SUBJECT_CURRICULUM_DATA: Record<
  string,
  {
    units: { number: number; title: string; desc: string; page: number }[];
    goldenRules: { title: string; content: string }[];
    methodologyTips: string[];
    commonMistakes: string[];
  }
> = {
  civil_engineering: {
    units: [
      { number: 1, title: "الميكانيك المطبقة والأنظمة المثلثية (Isostatisme)", desc: "حساب ردود الأفعال، عزل العقد، وتحديد جهود القضبان (شد / ضغط)", page: 12 },
      { number: 2, title: "الخرسانة المسلحة (Béton Armé - BAEL 91)", desc: "حساب مقاطع التسليح العرضي والطولي عند الحالة القصوى ELU و ELS", page: 48 },
      { number: 3, title: "مقاومة المواد (RDM) - قوى القص وعزوم الانحناء", desc: "رسم مخططات الجهود القاطعة T(x) وعزوم الانحناء M(x) وتحديد المقاطع الحرجة", page: 94 },
      { number: 4, title: "كودات البناء وحساب المنشآت العلوية والسفلية", desc: "الأساسات، الأعمدة، الروافد، والأرضيات وكيفية تنفيذها ومراقبة جودتها", page: 142 },
    ],
    goldenRules: [
      { title: "شرط التوازن العام للأنظمة المثلثية", content: "ΣFx = 0 و ΣFy = 0 و ΣM/A = 0، والتحقق الحسابي الدائم قبل الانتقال لعزل العقد." },
      { title: "حساب الإجهاد الناظمي المسموح به", content: "σ = N / S ≤ σ_adm، مع التحقق من معيار الأمان واستقرار القضبان ضد التحنيب (Flambement)." },
      { title: "التسليح في الخرسانة المسلحة (ELU)", content: "Nu ≤ N_ultime = Br·fc28 / (0.9·γb) + A·fe / γs، والالتزام بالنسب الدنيا والقصوى للتسليح." },
    ],
    methodologyTips: [
      "في مسائل الأنظمة المثلثية، ارسم دائماً مخطط الجسم الطليق (DFL) موضحاً جهات القوى وردود الأفعال بدقة قبل كتابة المعادلات.",
      "تأكد دائماً من مطابقة الوحدات: القوى بالكيلونيوتن (kN)، الأبعاد بالمتر (m)، والإجهادات بالميغاباسكال (MPa = N/mm²).",
      "في مخططات RDM، تذكر أن قيمة العزم الأقصى M_max توافق دائماً النقطة التي ينعدم فيها الجهد القاطع T(x) = 0.",
    ],
    commonMistakes: [
      "الخلط بين إشارة الشد (+) وإشارة الضغط (-) في جدول حساب جهود القضبان المثلثية.",
      "نسيان معاملات الأمان في حسابات الخرسانة: γb = 1.5 للخرسانة و γs = 1.15 لفولاذ التسليح.",
    ],
  },
  mechanical_engineering: {
    units: [
      { number: 1, title: "الأنظمة الآلية والتحليل الوظيفي (SADT & FAST)", desc: "دفتر الشروط، مخطط الوظائف، والتحليل التنازلي للآلات والأنظمة الصناعية", page: 10 },
      { number: 2, title: "مقاومة المواد RDM (الشد البسيط، القص، والانحناء)", desc: "حساب الإجهادات ومعامل الأمان واختيار أبعاد المحاور والمسامير", page: 54 },
      { number: 3, title: "دراسة الإنشاء ونقل الحركة والمسننات والمحامل", desc: "التركيب الحركي، تحديد نسب نقل السرعة r، وتركيب المدحرجات بتوافقات دقيقة", page: 110 },
      { number: 4, title: "التصنيع الميكانيكي وإعداد أدوات التثبيت والقطع", desc: "حساب سرعات القطع Vc وسرعة الدوران N والتغذية f على مخارط ومفارز CNC", page: 168 },
    ],
    goldenRules: [
      { title: "نسبة نقل الحركة في مسننات السرعة", content: "r = N_sort / N_ent = (-1)^k · (Z_menantes / Z_menees)، مع حساب العزم المنقول بدقة." },
      { title: "شرط المقاومة في الشد البسيط", content: "σ = N / S_min ≤ Rpe = Re / s، مع الأخذ بالحسبان لمعامل التركيز على الإجهاد Kt." },
    ],
    methodologyTips: [
      "في قراءة الرسم التجميعي، ابدأ دائماً بتحديد سلسلة نقل الحركة من المحرك نحو الأجزاء المنفذة.",
      "انتبه لاتجاه القوى المحورية والإشعاعية عند تركيب المحامل والوسادات المتدحرجة.",
    ],
    commonMistakes: [
      "عدم احترام قواعد التوافقات الميكانيكية (Ajustements) مثل H7/g6 للمنزلقات و H7/p6 للتركيب بالضغط.",
    ],
  },
  accounting: {
    units: [
      { number: 1, title: "أعمال نهاية السنة: التسويات واهتلاك التثبيتات", desc: "الاهتلاك الخطي، المتناقص، المتزايد، واختبار خسائر القيمة لنظام SCF", page: 14 },
      { number: 2, title: "تسوية المخزونات وحسابات الزبائن والمؤونات", desc: "الزبائن المشكوك فيهم، أرصدة الحساب 416، والمخزونات المتدهورة الحساب 39", page: 62 },
      { number: 3, title: "الميزانية الوظيفية ومؤشرات التوازن المالي", desc: "حساب رأس المال العامل FRNG، واحتياجات رأس المال BFR، والخزينة الصافية TN", page: 118 },
      { number: 4, title: "حسابات النتائج وتحليل الاستغلال التفاضلي", desc: "الهامش على التكلفة المتغيرة MCV، عتبة المردودية SR، ونقطة الصفر ومخططات الأمان", page: 176 },
    ],
    goldenRules: [
      { title: "قاعدة التوازن المالي الوظيفي", content: "FRNG - BFR = TN، و TN = خزينة الأصول (51+53) - خزينة الخصوم (519)." },
      { title: "عتبة المردودية (Seuil de Rentabilité)", content: "SR = التكاليف الثابتة CF / معدل الهامش على التكلفة المتغيرة (MCV/CA)." },
    ],
    methodologyTips: [
      "في قيود اليومية، تأكد دائماً من تسجيل رقم الحساب واسمه بالكامل، مع كتابة شرح مختصر وواضح للقيد.",
      "في أعمال نهاية السنة، ابدأ دائماً بتفريغ ميزان المراجعة قبل الجرد لتجنب التكرار في الحسابات.",
    ],
    commonMistakes: [
      "حساب قسط الاهتلاك السنوي دون مراعاة فترة الشراء (حساب أشهر الاستعمال التناسبية n/12).",
    ],
  },
  economics: {
    units: [
      { number: 1, title: "النقود والوظائف والكتلة النقدية والنظام المصرفي", desc: "تعريف النقود، خصائصها، وظائفها، البنك المركزي، والبنوك التجارية", page: 16 },
      { number: 2, title: "السوق والأسعار والمنافسة وقوانين العرض والطلب", desc: "هياكل الأسواق، توازن السوق، ومرونات الطلب والعرض السعرية والدخلية", page: 58 },
      { number: 3, title: "التجارة الخارجية، ميزان المدفوعات، وسياسات الصرف", desc: "الصادرات، الواردات، التعريفات الجمركية، وهيكل ميزان المدفوعات الجزائري", page: 104 },
      { number: 4, title: "التضخم والبطالة: الأسباب والآثار واستراتيجيات المعالجة", desc: "أنواع البطالة، مؤشر أسعار المستهلك CPI، والسياسات النقدية والمالية الكابحة", page: 152 },
    ],
    goldenRules: [
      { title: "معادلة فيشر النقدية الكلاسيكية", content: "M · V = P · T، حيث تبيّن العلاقة المباشرة بين الكتلة النقدية ومستوى الأسعار والتضخم." },
      { title: "هيكل ميزان المدفوعات", content: "الحساب الجاري + حساب رأس المال + الحساب المالي + صافي السهو والخطأ = 0." },
    ],
    methodologyTips: [
      "اعتمد دائماً على التعريفات الأكاديمية الدقيقة المعتمدة في المقرر الوزاري دون ارتجال لغوي.",
      "في معالجة الوضعيات الإدماجية، قسّم إجابتك إلى: تشخيص الظاهرة، تحليل الأسباب، والحلول المقترحة.",
    ],
    commonMistakes: [
      "الخلط بين مفهوم البنك المركزي (بنك الجزائر) والبنوك التجارية الودائعية ووظائف كل منهما.",
    ],
  },
  math: {
    units: [
      { number: 1, title: "الدوال العددية، الأسية واللوغاريتمية والمناقشة البيانية", desc: "النهايات، الاشتقاق، الاستمرارية، مبرهنة القيم المتوسطة، والمقاربات", page: 15 },
      { number: 2, title: "المتتاليات العددية والبرهان بالتراجع", desc: "المتتاليات الحسابية والهندسية، التقارب، وحساب المجاميع والجداءات", page: 75 },
      { number: 3, title: "الاحتمالات والمتغيرات العشوائية وقوانين التوزيع", desc: "العد، الترتيبات والتوفيقات، الاحتمال الشرطي، ودستور الاحتمال الكلي", page: 130 },
      { number: 4, title: "الأعداد المركبة والتحويلات النقطية في المستوي", desc: "الشكل الجبري والمثلثي والآسي، معادلات الدرجة الثانية، والتشابه المباشر", page: 185 },
    ],
    goldenRules: [
      { title: "مبرهنة القيم المتوسطة (TVI)", content: "إذا كانت f مستمرة ورتيبة تماماً على [a, b] و f(a)·f(b) < 0، فإن المعادلة f(x)=0 تقبل حلاً وحيداً α." },
      { title: "مشتقة الدالة المركبة", content: "(g ∘ f)'(x) = f'(x) · g'(f(x))، ومشتقة الدالة الأسية: (e^u)' = u' · e^u." },
    ],
    methodologyTips: [
      "في دراسة الدوال، انتبه دائماً لمجال التعريف قبل حساب أي نهاية أو مشتقة.",
      "ارسم جدول التغيرات كاملاً متضمناً قيم النهايات والمشتقة والصور لربطه بدقة بالرسم البياني.",
    ],
    commonMistakes: [
      "نسيان إضافة ثابت التكامل C في الدوال الأصلية أو الخلط بين قواعد اللوغاريتم النيبيري.",
    ],
  },
  physics: {
    units: [
      { number: 1, title: "المتابعة الزمنية لتحول كيميائي في وسط مائي", desc: "السرعات، زمن نصف التفاعل t1/2، المعايرة اللونية، وقياس الناقلية", page: 18 },
      { number: 2, title: "الظواهر الكهربائية (ثنائي القطب RC و RL والاهتزازات)", desc: "المعادلات التفاضلية، ثابت الزمن τ، والطاقة المخزنة في المكثفة والوشيعة", page: 68 },
      { number: 3, title: "التحولات النووية، النشاط الإشعاعي، والطاقة المحررة", desc: "قانون التناقص الإشعاعي، التناقص الكتلوي، والانشطار والاندماج النووي", page: 122 },
      { number: 4, title: "تطور جملة ميكانيكية (قوانين نيوتن وحركة الكواكب)", desc: "السقوط الشاقولي، حركة الأقمار والكواكب، وحركة القذائف في المستوي", page: 175 },
    ],
    goldenRules: [
      { title: "القانون الثاني لنيوتن", content: "ΣF_ext = m · a_G في مرجع غاليلي مناسب (سطحي أرضي، جيو مركزي، أو هيليو مركزي)." },
      { title: "ثابت الزمن في دارة RC و RL", content: "τ = R·C في الدارة المكثفة، و τ = L / (R + r) في دارة الوشيعة." },
    ],
    methodologyTips: [
      "حدد دائماً الجملة الميكانيكية والمرجع المختار والقوى الخارجية المؤثرة قبل تطبيق قانون نيوتن.",
      "في الكيمياء، اكتب جدول التقدم واضحاً بالرموز والوحدات قبل كتابة علاقات السرعة.",
    ],
    commonMistakes: [
      "عدم تحويل الوحدات الدولية: تحويل الساعات والدقائق إلى ثوانٍ، والغرامات إلى كيلوغرامات.",
    ],
  },
  science: {
    units: [
      { number: 1, title: "آليات تركيب البروتين والترجمة والاستنساخ", desc: "الـ ARN الرسول، الشفرة الوراثية، ومراحل الانطلاق والاستطالة والنهاية", page: 14 },
      { number: 2, title: "العلاقة بين بنية ووظيفة البروتين والنشاط الإنزيمي", desc: "البنيات الفراغية، الموقع الفعال، وتأثير pH ودرجة الحرارة ومثبطات التفاعل", page: 60 },
      { number: 3, title: "دور البروتينات في الدفاع عن الذات (المناعة)", desc: "المناعة الخلطية والخلوية، الخلايا اللمفاوية LB و LT، ومعقد التوافق CMH", page: 115 },
      { number: 4, title: "دور البروتينات في الاتصال العصبي والمشبكي", desc: "كمون الراحة والعمل، إدماج الإشارات العصبية، ومضخات Na+/K+ ومستقبلات الأستيل كولين", page: 180 },
    ],
    goldenRules: [
      { title: "منهجية المسعى العلمي والاستدلال", content: "التحليل المنظم (تحديد الظاهرة + قراءة المعطيات + دلالة التغيرات) يليها الاستنتاج المحكم." },
      { title: "التركيب والتفسير البنائي", content: "ربط النتائج المحصل عليها بالمعلومات المكتسبة لبناء إجابة شاملة للمشكلة البيولوجية المطروحة." },
    ],
    methodologyTips: [
      "فرّق بين الأفعال الأدائية: حلّل (وصف + دلالة)، فسّر (تقديم الأسباب والآليات)، استنتج (استخلاص قاعدة علمية).",
      "دعّم نصوصك العلمية برسم تخطيطي وظيفي مرفق بالعناوين والبيانات الكاملة.",
    ],
    commonMistakes: [
      "إسقاط الاستنتاج عند تقديم التحليل المقارن، أو إهمال دور التكامل البنيوي في المشابك المناعية والعصبية.",
    ],
  },
};

// Generic subject fallback
const DEFAULT_CURRICULUM = {
  units: [
    { number: 1, title: "المفاهيم والأسس البيداغوجية الشاملة", desc: "شرح معمق للقواعد الأساسية والمحاور المفتاحية وفق المنهاج الجزائري الرسمي", page: 12 },
    { number: 2, title: "القواعد والمنهجيات المعتمدة للبكالوريا", desc: "طرق التحليل، معايير التقييم وسلم التنقيط المعتمد من المفتشية العامة للبيداغوجيا", page: 55 },
    { number: 3, title: "بنك التطبيقات والوضعيات الإدماجية المحلولة", desc: "تمارين وتطبيقات مع الإجابات النموذجية المفصلة وشبكة تنقيط مقترحة", page: 110 },
    { number: 4, title: "حوليات مواضيع البكالوريات السابقة والتوقعات", desc: "نماذج اختبارات شاملة مع النصائح الذهبية للتحضير النفسي والمنهجي", page: 165 },
  ],
  goldenRules: [
    { title: "الالتزام بالمنهجية الوزارية الرسمية", content: "اعتماد الخطوات الإجرائية المحددة في دليل إعداد مواضيع البكالوريا الرسمي للحصول على النقطة الكاملة." },
    { title: "التنظيم والوضوح في التحرير", content: "ترقيم الإجابات، استخدام لغة أكاديمية رصينة، وتفادي التشطيب للحفاظ على وضوح ورقة الامتحان." },
  ],
  methodologyTips: [
    "ابدأ بقراءة الموضوع كاملاً بتمعن لمدة 15 دقيقة قبل الشروع في التحرير لاختيار الموضوع الأنسب.",
    "قسّم وقت الامتحان بعناية بما يضمن تخصيص 20 دقيقة أخيرة للمراجعة الشاملة وتدقيق الحسابات والبيانات.",
  ],
  commonMistakes: [
    "التسرع في الإجابة دون فهم سياق الوضعية المطروحة أو إغفال الأسئلة الجزئية المركبة.",
  ],
};

export function BookA4Reader({ book, pageNumber, totalPages, onJumpToPage }: BookA4ReaderProps) {
  const subjectMeta = getSubjectMeta(book.subject) || {
    id: book.subject,
    label: "المادة المقررة",
    icon: "📚",
    group: "all" as const,
    groupLabel: "الكل",
  };
  const categoryMeta = getCategoryMeta(book.category);
  const curriculum = SUBJECT_CURRICULUM_DATA[book.subject] || DEFAULT_CURRICULUM;

  const streamLabels = book.streams
    .map((s) => LIBRARY_STREAMS.find((ls) => ls.id === s)?.label)
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="w-full flex flex-col items-center select-text" dir="rtl">
      {/* ========================================================================= */}
      {/* PAGE 1: COVER PAGE & OFFICIAL CURRICULUM TABLE OF CONTENTS                */}
      {/* ========================================================================= */}
      {pageNumber === 1 && (
        <div className="bg-white text-stone-900 shadow-2xl rounded-sm border border-stone-300 w-full max-w-4xl min-h-[960px] p-6 sm:p-10 flex flex-col justify-between print:shadow-none print:border-0 print:p-0">
          {/* Top National Header */}
          <div className="space-y-2 pb-4 border-b-2 border-stone-800 text-center select-none">
            <div className="text-xs sm:text-sm font-black font-sans tracking-wide text-stone-900">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </div>
            <div className="text-xs sm:text-sm font-bold text-stone-700 font-sans">
              وزارة التربية الوطنية — ديوان المطبوعات المدرسية والمراجع المعتمدة
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-stone-400 pt-2 mt-2 text-xs font-bold text-stone-900">
              <span>المكتبة الرقمية لشهادة البكالوريا 2025/2026</span>
              <span className="text-emerald-800 font-black">المادة: {subjectMeta.label}</span>
              <span className="text-stone-600 font-mono">طبعة {book.year_edition || "2025"}</span>
            </div>
          </div>

          {/* Book Identity Card */}
          <div className="my-6 p-5 sm:p-6 rounded-2xl bg-stone-50 border border-stone-300 flex flex-col sm:flex-row items-center gap-6">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-28 sm:w-36 h-40 sm:h-50 object-cover rounded-xl shadow-lg border border-stone-300 shrink-0"
              />
            ) : (
              <div className="w-28 sm:w-36 h-40 sm:h-50 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-12 h-12 text-emerald-700" />
              </div>
            )}

            <div className="flex-1 space-y-2.5 text-center sm:text-start">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${categoryMeta.badgeClasses}`}>
                  {categoryMeta.badgeLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-800 border border-stone-300">
                  {book.file_size || "45 MB"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {book.pages_count ? `${book.pages_count} صفحة` : "مرجع كامل"}
                </span>
              </div>

              <h1 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                {book.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-700">
                المؤلف والإعداد: <strong className="text-stone-900 font-black">{book.author || "وزارة التربية الوطنية"}</strong>
              </p>

              <div className="text-xs text-stone-600 pt-1">
                <strong>الشعب المعنية:</strong> {streamLabels || "كافة الشعب المعنية"}
              </div>
            </div>
          </div>

          {/* Curriculum Table of Contents */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-2">
              <h2 className="text-sm sm:text-base font-black text-emerald-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>فهرس المحتويات والوحدات التعليمية المعتمدة في هذا المرجع</span>
              </h2>
              <span className="text-xs text-stone-500 font-mono">المنهاج الوزاري</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {curriculum.units.map((unit) => (
                <div
                  key={unit.number}
                  className="p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {unit.number}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                        {unit.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed mt-0.5">
                        {unit.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                    صـ {unit.page}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Page Footer */}
          <div className="pt-4 mt-6 border-t border-stone-300 flex items-center justify-between text-xs text-stone-600">
            <span>منصة المتفوقين في شهادة البكالوريا 2025</span>
            <span className="font-mono font-bold text-stone-900">الصفحة 1 من {totalPages}</span>
            <button
              type="button"
              onClick={() => onJumpToPage(2)}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              الانتقال إلى الملخص والقواعد ⇦
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: GOLDEN RULES & ESSENTIAL FORMULAS / SUMMARY                       */}
      {/* ========================================================================= */}
      {pageNumber === 2 && (
        <div className="bg-white text-stone-900 shadow-2xl rounded-sm border border-stone-300 w-full max-w-4xl min-h-[960px] p-6 sm:p-10 flex flex-col justify-between print:shadow-none print:border-0 print:p-0">
          {/* Header */}
          <div className="pb-4 border-b-2 border-stone-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-stone-900">
                الملخص المركز والقواعد الذهبية — مادة {subjectMeta.label}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                مستخلص من مرجع: {book.title} ({book.author})
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
              قواعد الحفظ والحل السريع
            </span>
          </div>

          {/* Body Content */}
          <div className="flex-1 py-5 space-y-6">
            {/* Golden Rules */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-emerald-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>أهم العلاقات والقوانين المفصلية في هذا المرجع:</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {curriculum.goldenRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1"
                  >
                    <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>{rule.title}</span>
                    </div>
                    <p className="text-xs text-stone-800 leading-relaxed font-sans ps-5">
                      {rule.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Methodology Tips */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>منهجية الإجابة الرسمية للحصول على النقطة الكاملة في البكالوريا:</span>
              </h3>

              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
                {curriculum.methodologyTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Pitfalls to Avoid */}
            <div className="space-y-2.5">
              <h3 className="text-xs sm:text-sm font-black text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>أخطاء شائعة محذورة في مراكز تصحيح البكالوريا:</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-200 space-y-1.5">
                {curriculum.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-rose-950 leading-relaxed">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-6 border-t border-stone-300 flex items-center justify-between text-xs text-stone-600">
            <button
              type="button"
              onClick={() => onJumpToPage(1)}
              className="text-stone-700 font-bold hover:underline cursor-pointer"
            >
              ⇨ العودة إلى الغلاف والفهرس
            </button>
            <span className="font-mono font-bold text-stone-900">الصفحة 2 من {totalPages}</span>
            <button
              type="button"
              onClick={() => onJumpToPage(3)}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              الانتقال إلى الملاحظات والتحميل ⇦
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: RECOMMENDATIONS, SAMPLE EXERCISES & DOWNLOAD SUMMARY              */}
      {/* ========================================================================= */}
      {pageNumber === 3 && (
        <div className="bg-white text-stone-900 shadow-2xl rounded-sm border border-stone-300 w-full max-w-4xl min-h-[960px] p-6 sm:p-10 flex flex-col justify-between print:shadow-none print:border-0 print:p-0">
          {/* Header */}
          <div className="pb-4 border-b-2 border-stone-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-stone-900">
                برنامج المراجعة والتمارين المقترحة في {subjectMeta.label}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                توجيهات المفتشية العامة للبيداغوجيا للبكالوريا
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-black text-xs border border-indigo-300">
              خطة التفوق الدراسي
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 py-6 space-y-6">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>كيفية الاستفادة القصوى من هذا المرجع:</span>
              </h3>
              <ul className="text-xs text-stone-700 space-y-2 ps-4 list-disc leading-relaxed">
                <li>
                  <strong>المرحلة الأولى (الفهم والضبط):</strong> قراءة المفاهيم النظرية في كل وحدة تعليمية وتدوين المصطلحات والملاحظات على كراس خاص.
                </li>
                <li>
                  <strong>المرحلة الثانية (التطبيقات الموجهة):</strong> حل تمارين السلاسل المرفقة دون النظر إلى الحل النموذجي ومقارنة الخطوات مع شبكة التنقيط.
                </li>
                <li>
                  <strong>المرحلة الثالثة (المحاكاة الوزارية):</strong> حل مواضيع البكالوريات السابقة في ظروف مشابهة للامتحان الرسمي مع ضبط الوقت بدقة.
                </li>
              </ul>
            </div>

            {/* Document specs table */}
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-black text-stone-900">
                بطاقة التعريف التقنية للمرجع:
              </h3>
              <div className="border border-stone-300 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 divide-x divide-stone-300 bg-stone-100 font-bold p-2 border-b border-stone-300">
                  <span>الخاصية</span>
                  <span className="ps-3">التفاصيل</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-200 p-2 border-b border-stone-200">
                  <span className="font-semibold text-stone-700">العنوان الرسمي</span>
                  <span className="ps-3 font-bold text-stone-900">{book.title}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-200 p-2 border-b border-stone-200 bg-stone-50/50">
                  <span className="font-semibold text-stone-700">المؤلف / الجهة المعدة</span>
                  <span className="ps-3 text-stone-800">{book.author || "وزارة التربية الوطنية"}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-200 p-2 border-b border-stone-200">
                  <span className="font-semibold text-stone-700">التصنيف البيداغوجي</span>
                  <span className="ps-3 text-stone-800">{categoryMeta.label}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-200 p-2 border-b border-stone-200 bg-stone-50/50">
                  <span className="font-semibold text-stone-700">حجم الملف الرقمي</span>
                  <span className="ps-3 font-mono font-bold text-emerald-800">{book.file_size || "45 MB"}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-200 p-2">
                  <span className="font-semibold text-stone-700">سنة الطبعة المعتمدة</span>
                  <span className="ps-3 font-mono text-stone-800">{book.year_edition || "2025"}</span>
                </div>
              </div>
            </div>

            {/* Motivational Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white space-y-1 text-center">
              <Award className="w-6 h-6 mx-auto text-amber-300" />
              <div className="font-black text-sm">طريقك نحو التفوق والامتياز في البكالوريا</div>
              <p className="text-xs text-emerald-100">
                الاستمرار اليومي والمواظبة على حل التمارين المنهجية هما مفتاح العلامة الكاملة بإذن الله.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-6 border-t border-stone-300 flex items-center justify-between text-xs text-stone-600">
            <button
              type="button"
              onClick={() => onJumpToPage(2)}
              className="text-stone-700 font-bold hover:underline cursor-pointer"
            >
              ⇨ الصفحة السابقة (الملخص)
            </button>
            <span className="font-mono font-bold text-stone-900">الصفحة 3 من {totalPages}</span>
            <span className="text-emerald-700 font-bold">نهاية وثيقة القارئ المعتمد</span>
          </div>
        </div>
      )}
    </div>
  );
}
