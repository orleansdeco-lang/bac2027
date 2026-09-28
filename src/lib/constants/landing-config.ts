import { TRIAL_DURATION_DAYS } from "@/lib/access";
import { CANONICAL_PLANS } from "@/lib/payment/manual-pilot-provider";

export interface LandingPlanSummary {
  id: string;
  nameAr: string;
  priceDzd: number;
  periodAr: string;
  badgeAr?: string;
  descriptionAr: string;
  features: string[];
  isPopular?: boolean;
}

export const LANDING_CONFIG = {
  // Centralized trial settings
  trialDurationDays: TRIAL_DURATION_DAYS,
  trialPriceDzd: 0,
  
  // Real platform metrics verified from project files
  stats: {
    officialYear: "2026/2027",
    circularRef: "مبني على المنشور الوزاري رقم 01 لوزارة التعليم العالي والبحث العلمي دورة 2026/2027",
    wilayasCount: 58,
    streamsCount: 6,
    examArchiveYears: "2016 - 2026", // Verified in src/data/exams/index.ts (2008-2015 is [TODO])
    // Transparent placeholders for metrics pending real-time database connection
    activeStudentsPlaceholder: "[أدخل الرقم الحقيقي للطلاب]",
    studyHoursPlaceholder: "[أدخل مجموع الساعات المسجلة]",
  },

  // Authoritative plans from payment provider
  plans: [
    {
      id: "season",
      nameAr: CANONICAL_PLANS.season.name_ar,
      priceDzd: CANONICAL_PLANS.season.priceDZD,
      periodAr: "موسم دراسي كامل (حتى البكالوريا)",
      badgeAr: "الأكثر اختياراً وتوفيراً ⭐",
      isPopular: true,
      descriptionAr: "وصول شامل لكل الشعب والمواد حتى آخر يوم في امتحان البكالوريا.",
      features: [
        "مجالس العلم التفاعلية (طاولات مذاكرة متزامنة)",
        "معمل الأخطاء (Error Lab) بنظام التكرار المتباعد",
        "مستكشف التوجيه وحساب المعدلات الموزونة الرسمية",
        "مواضيع البكالوريا الرسمية (2016-2026) بسلالم التنقيط",
        "خطة المراجعة اليومية الذكية المكيّفة",
        "دعم تربوي مستمر عبر المنصة",
      ],
    },
    {
      id: "monthly",
      nameAr: CANONICAL_PLANS.monthly.name_ar,
      priceDzd: CANONICAL_PLANS.monthly.priceDZD,
      periodAr: "لمدة 30 يوماً (قابل للتجديد)",
      badgeAr: "مرونة كاملة",
      isPopular: false,
      descriptionAr: "تجربة شهرية كاملة الصلاحيات تناسب الراغبين في التدرج والمرونة.",
      features: [
        "مجالس العلم التفاعلية",
        "معمل الأخطاء والتشخيص الأسبوعي",
        "مستكشف التوجيه والمعدل الموزون",
        "بنك البكالوريات والحلول النموذجية",
        "بدون التزام.. تجدد متى شئت",
      ],
    },
  ] as LandingPlanSummary[],

  // Payment methods breakdown for Algeria
  paymentMethods: [
    {
      id: "baridimob",
      nameAr: "بريدي موب (BaridiMob)",
      speedAr: "تفعيل فوري بعد إرسال الوصل",
      icon: "Smartphone",
      steps: [
        "اختر الخطة وانسخ رقم RIP الخاص بالمنصة.",
        "حوّل المبلغ عبر تطبيق BaridiMob الرسمي من هاتفك.",
        "ارفع لقطة شاشة وصل التحويل، ويُفعّل حسابك مباشرة.",
      ],
    },
    {
      id: "ccp",
      nameAr: "حوالة بريدية (CCP)",
      speedAr: "تفعيل خلال ساعات العمل",
      icon: "FileCheck",
      steps: [
        "سدّد المبلغ في أي مكتب بريد جزائري عبر الحوالة البريدية.",
        "التقط صورة واضحة لوصل الدفع الأزرق/الأصفر.",
        "أرسل صورة الوصل لتأكيد الاشتراك وتفعيل الحساب.",
      ],
    },
    {
      id: "cod",
      nameAr: "الدفع عند الاستلام (COD لـ 58 ولاية)",
      speedAr: "يصلك كود التفعيل مع الموزع للبيت",
      icon: "Truck",
      steps: [
        "سجّل طلبك وعنوانك في أي ولاية جزائرية.",
        "يصلك ظرف الشاطر الرسمي يحتوي على كود التفعيل ودليل البكالوريا.",
        "ادفع نقداً لعامل التوصيل عند استلام الظرف وفعّل كودك مباشرة.",
      ],
    },
  ],

  // Direct WhatsApp & Email Support
  support: {
    email: "contact@shater-bac.dz",
    phone: "+213550853234",
    displayPhone: "+213 550 85 32 34",
    studentMessage: "مرحباً منصة الشاطر، أنا تلميذ بكالوريا وأريد استفساراً حول المنصة.",
    parentMessage: "السلام عليكم، أنا ولي تلميذ بكالوريا وأود التعرف على طريقة الاشتراك ومرافقة ابني عبر منصة الشاطر.",
  },

  // 3 Hero Headline Alternatives for conversion testing
  heroHeadlineOptions: [
    {
      id: "option_a", // Active Recommended
      badge: "الخيار الأقرب ليوميات التلميذ (المعتمد حالياً)",
      headline: "مش غير تقرا... تعرف كيفاش تقرا، واش تراجع، ووين حاب توصل.",
      subheadline: "المنظومة الجزائرية المتكاملة للبكالوريا: مستكشف التوجيه الجامعي، مجالس المذاكرة المتزامنة، ومعمل رصد الثغرات قبل الامتحان.",
    },
    {
      id: "option_b",
      badge: "تركيز على النتيجة وتفادي التشتت",
      headline: "احبس المراجعة العشوائية. ابدأ بالهدف وضاعف تركيزك للباك.",
      subheadline: "منصة ذكية تحسب معدلك الموزون للجامعة، تجمعك مع زملاء جادين في مجالس العلم، وتصلح أخطاءك أولاً بأول.",
    },
    {
      id: "option_c",
      badge: "مباشر وقصير للهاتف وتيك توك",
      headline: "الباك يحتاج نظام ماشي زهر. خطة، طاولة مذاكرة، وتوجيه دقيق.",
      subheadline: "كل ما تحتاجه للبكالوريا في مكان واحد: واش نقدر نقرا؟، مجالس علم بدون تشتيت، وبنك تجارب المتفوقين.",
    },
  ],

  // 3 CTA Text Alternatives
  ctaTextOptions: [
    {
      id: "cta_a", // Active Recommended
      primary: "ابدأ مجاناً",
      secondary: "جرّب واش نقدر نقرا",
      description: "صيغة موحدة، واضحة، بدون التزام (تزيل حاجز الدفع الأولي).",
    },
    {
      id: "cta_b",
      primary: "افتح حسابك مجاناً (7 أيام)",
      secondary: "احسب تخصصاتك المؤهلة",
      description: "صيغة تركز على مدة التجربة الصفرية والميزة الفورية.",
    },
    {
      id: "cta_c",
      primary: "جرّب الشاطر الآن (0 دج)",
      secondary: "استكشف طاولات المذاكرة",
      description: "صيغة تركز على السعر الصفري وتخفيف الاحتكاك المالي.",
    },
  ],

  // FAQ Dismantling Real Objections (Conscious, Complete, Truthful)
  faqs: [
    {
      question: "هل المنصة مناسبة لشعبتي بالمعاملات والمواد الرسمية؟",
      answer: "نعم، المنصة مبنية للشعب الست الرسمية: العلوم التجريبية، الرياضيات، التقني الرياضي، التسيير والاقتصاد، الآداب والفلسفة، واللغات الأجنبية؛ بحساب المعاملات الوزارية ومواضيع امتحانات البكالوريا الرسمية.",
    },
    {
      question: "هل التمارين وسلالم التنقيط متوافقة مع المنهاج الجزائري الرسمي؟",
      answer: "كل تمرين وموضوع في المنصة مستمد من المنهاج الصادر عن وزارة التربية الوطنية وبنك امتحانات البكالوريا الرسمية (2016-2026) مع اعتماد سلالم التنقيط الوزارية النموذجية.",
    },
    {
      question: "كيفاش نسلك وأنا ماعنديش بطاقة بنكية أو البطاقة الذهبية؟",
      answer: "وفّرنا 3 طرق دفع مرنة: الدفع عند الاستلام (COD) حيث يصلك كود التفعيل إلى باب منزلك في 58 ولاية وتدفع نقداً للموزع، أو عبر تطبيق بريدي موب (BaridiMob)، أو عبر حوالة بريدية في أي مكتب بريد (CCP).",
    },
    {
      question: "واش يصرا بعد ما تخلص 7 أيام المجانية؟ هل كاين اقتطاع تلقائي؟",
      answer: "لا يوجد أي اقتطاع تلقائي ولا نطلب أي معلومات بنكية عند التسجيل. بعد انتهاء 7 أيام المجانية، تختار بنفسك إما إكمال الاشتراك بإحدى طرق الدفع أو التوقف، مع بقاء تقدمك الدراسي محفوظاً.",
    },
    {
      question: "هل المنصة تخدم مليح فالهاتف الضعيف وبـ 3G/4G؟",
      answer: "نعم، صُممت المنصة وفق معايير خفيفة جداً (Mobile-First) باستهلاك بيانات منخفض جداً وسرعة تحميل فورية دون الحاجة لكمبيوتر مكتبي أو إنترنت عالي السرعة.",
    },
    {
      question: "ما الفرق بين الشاطر وبين قنوات يوتيوب ومجموعات تيليغرام؟",
      answer: "اليوتيوب والتيليغرام يعرضان مئات الساعات غير المترابطة بدون اختبار ولا تصحيح لأخطائك. الشاطر نظام متكامل: يحدد هدفك بالمعدل الموزون، يلزمك بطاولة دراسة صامتة متزامنة، ويعالج ثغراتك خطوة بخطوة.",
    },
  ],
};
