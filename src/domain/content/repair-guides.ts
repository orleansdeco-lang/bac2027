/**
 * BAC Mastery — Error Repair Guides Catalog
 * Prompt 12: Targeted 5-15 minute remediation guides mapped to Error Lab taxonomy
 * 
 * Invariant: Content Purity (ZERO user_id).
 */

import { RepairGuide } from "./types";

export const PROMPT12_REPAIR_GUIDES: RepairGuide[] = [
  // 1. Math Chain Rule Sign Error
  {
    id: "repair_math_chain_sign",
    skillId: "math_derivatives_chain_rule",
    suspectedErrorType: "calculation_error",
    title_ar: "إصلاح خطأ الإشارة في اشتقاق الدوال الأسية المركبة",
    whyItHappens_ar: "يحدث الخطأ بسبب التسرع في كتابة e^(-x) دون استخراج مشتقة الأس (-1) كعامل ضرب مستقل، مما يقلب إشارة المشتقة ويغير جدول التغيرات كلياً.",
    diagnosis_ar: "إذا كتبت [e^(-2x)]' = 2*e^(-2x) أو e^(-2x) دون إشارة سالب، فأنت تعاني من خطأ إشارة في قاعدة السلسلة.",
    repairSteps_ar: [
      "الخطوة 1: اكتب الدالة الأسية وضع دائرة بقلم الرصاص حول العبارة الموجودة في الأس u(x).",
      "الخطوة 2: احسب مشتقة ما بداخل الدائرة u'(x) جانباً وضعها بين قوسين إجباريين.",
      "الخطوة 3: أعد كتابة المشتقة بالصيغة: [e^u]' = (u') * e^u قبل أي عملية نشر أو تبسيط.",
    ],
    microPracticePrompt_ar: "احسب مشتقة الدالة h(x) = e^(-4x + 1) بتطبيق الخطوات الثلاث بدقة.",
    microPracticeSolution_ar: "ما بداخل الأس هو u(x) = -4x + 1 ومشتقتها u'(x) = -4. إذن المشتقة هي: h'(x) = -4 * e^(-4x + 1).",
    estimatedMinutes: 8,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 2. Math Asymptote Interpretation Error
  {
    id: "repair_math_asymptote_interpretation",
    skillId: "math_asymptotes_limits",
    suspectedErrorType: "methodology_error",
    title_ar: "إصلاح منهجية التمييز بين المستقيم المقارب الأفقي والعمودي",
    whyItHappens_ar: "الخلط بين متغير الفاصلة x ومتغير الترتيبة y عند صياغة معادلة المستقيم المقارب هندسياً بعد حساب النهاية.",
    diagnosis_ar: "إذا كتبت أن النهاية عند اللانهاية تعطي x = b، أو أن النهاية غير المنتهية عند عدد تعطي y = a، فأنت تخلط بين المحاور.",
    repairSteps_ar: [
      "الخطوة 1: تذكر القاعدة الذهبية: المعادلة تكون دائماً بدلالة المتغير الذي يؤول إلى عدد ثابت.",
      "الخطوة 2: إذا كان f(x) يؤول إلى العدد b لما x يؤول إلى اللانهاية، فإن الترتيبة ثباتها b، إذن المقارب هو y = b (أفقي موازٍ لمحور الفواصل).",
      "الخطوة 3: إذا كان x يؤول إلى العدد a بينما f(x) تؤول إلى اللانهاية، فإن الفاصلة ثباتها a، إذن المقارب هو x = a (عمودي موازٍ لمحور التراتيب).",
    ],
    microPracticePrompt_ar: "إذا كانت lim f(x) = -3 لما x يؤول إلى +مالانهاية، فما هي معادلة المستقيم المقارب وما نوعه؟",
    microPracticeSolution_ar: "معادلة المستقيم المقارب هي y = -3 وهو مستقيم مقارب أفقي موازٍ لمحور الفواصل بجوار +مالانهاية.",
    estimatedMinutes: 10,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 3. Physics RC Units Conversion Error
  {
    id: "repair_physics_rc_units",
    skillId: "physics_rc_time_constant",
    suspectedErrorType: "calculation_error",
    title_ar: "إصلاح أخطاء تحويل الوحدات في الدارات الكهربائية RC",
    whyItHappens_ar: "استعمال المقادير كما هي مكتوبة في نص المسألة (مثل kOhm و microFarad و ms) في الآلة الحاسبة دون تحويلها إلى الوحدات الدولية الأساسية.",
    diagnosis_ar: "إذا حصلت على سعة مكثفة بالأرقام الكبيرة (مثل 2000 أو 0.5 بدلاً من 10^-6)، فأنت حتماً لم تحول الكيلوأوم أو الميلي ثانية.",
    repairSteps_ar: [
      "الخطوة 1: جدول التحويل الإجباري: 1 kOhm = 10^3 Ohm، و 1 ms = 10^(-3) s، و 1 microF = 10^(-6) F.",
      "الخطوة 2: اكتب معطيات التمرين فوراً بالوحدات الدولية بجانب المسألة قبل كتابة أي قانون في ورقة الإجابة.",
      "الخطوة 3: اكتب القانون حرفياً: C = tau / R، ثم عوض بالأرقام ذات القوى العشرية وأطر النتيجة مع الوحدة F.",
    ],
    microPracticePrompt_ar: "احسب C إذا كان tau = 2 ms و R = 5 kOhm مع كتابة النتيجة بالترميز العلمي.",
    microPracticeSolution_ar: "tau = 2 * 10^(-3) s و R = 5 * 10^3 Ohm. إذن C = (2 * 10^(-3)) / (5 * 10^3) = 0.4 * 10^(-6) F = 4 * 10^(-7) F.",
    estimatedMinutes: 10,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 4. Physics RC Tangent Misconception
  {
    id: "repair_physics_rc_tangent_misconception",
    skillId: "physics_rc_time_constant",
    suspectedErrorType: "misunderstood_concept",
    title_ar: "إصلاح قراءة ثابت الزمن tau من مماس المنحنى عند المبدأ",
    whyItHappens_ar: "الخلط بين نقطة تقاطع المماس مع المقارب الأفقي uC = E (التي تعطي tau) وبين زمن النظام الدائم الذي يقارب 5*tau.",
    diagnosis_ar: "إذا اعتبرت أن نهاية الشحن في المنحنى هي tau بدلاً من 5*tau، فإن مفهومك لسرعة الاستجابة يحتاج ضبطاً.",
    repairSteps_ar: [
      "الخطوة 1: ارسم خطاً عمودياً من نقطة تقاطع المماس عند t=0 مع المستقيم المقارب uC = E نحو محور الفواصل.",
      "الخطوة 2: النقطة الناتجة على محور الفواصل هي بالضبط قيمة tau.",
      "الخطوة 3: تحقق دائماً: قيمة توتر المكثفة عند اللحظة tau يجب أن توافق 0.63 من القيمة العظمى E.",
    ],
    microPracticePrompt_ar: "في دارة شحن مكثفة حيث E = 6 V، يقطع مماس المبدأ الخط uC = 6 V عند t = 1.5 s. ما هي قيمة tau وما هي قيمة uC(1.5 s)؟",
    microPracticeSolution_ar: "ثابت الزمن هو tau = 1.5 s مباشرة، وتوتر المكثفة عند هذه اللحظة هو uC(tau) = 0.63 * 6 = 3.78 V.",
    estimatedMinutes: 10,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 5. SNV Transcription Direction Error
  {
    id: "repair_snv_transcription_direction",
    skillId: "snv_protein_synthesis",
    suspectedErrorType: "forgot_information",
    title_ar: "إصلاح الخلط بين اتجاه قراءة الـ ADN وبناء الـ ARNm",
    whyItHappens_ar: "نسيان أن السلاسل الحيوية تكون دوماً متعاكسة الاتجاه (Antiparallèle) وأن أنزيم البوليميراز يقرأ في اتجاه ويعاكسه في البناء.",
    diagnosis_ar: "إذا كتبت أن أنزيم ARN بوليميراز يقرأ من 5' إلى 3' أو بنيت ARNm في اتجاه 3' إلى 5'، فهذا خطأ في الاتجاهات الحيوية.",
    repairSteps_ar: [
      "الخطوة 1: احفظ القاعدة المنهجية: 'القراءة تبدأ بـ 3، والبناء يبدأ بـ 5'.",
      "الخطوة 2: على السلسلة الناسخة: اتجاه حركة الأنزيم دائماً من النهاية 3' نحو النهاية 5'.",
      "الخطوة 3: على سلسلة الـ ARNm المركبة: اتجاه البناء يبدأ من النهاية 5' الفوسفاتية نحو النهاية 3' الهيدروكسيلية.",
    ],
    microPracticePrompt_ar: "إذا كانت السلسلة الناسخة 3'- A-T-G -5' فما هو اتجاه وسلسلة ARNm الناتجة؟",
    microPracticeSolution_ar: "سلسلة الـ ARNm تبنى في الاتجاه 5' نحو 3' وتكون: 5'- U-A-C -3'.",
    estimatedMinutes: 8,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 6. SNV Document Analysis vs Superficial Description
  {
    id: "repair_snv_document_analysis",
    skillId: "snv_scientific_analysis_method",
    suspectedErrorType: "methodology_error",
    title_ar: "إصلاح منهجية استغلال الوثائق في العلوم: الانتقال من الوصف إلى التحليل والاستنتاج",
    whyItHappens_ar: "الاكتفاء بقراءة أرقام المنحنى البياني حرفياً (الوصف السطحي) دون ربط التغير بالدلالة البيولوجية ودون صياغة استنتاج صريح.",
    diagnosis_ar: "إذا كان تعليقك على الوثيقة ينتهي بـ 'نلاحظ تزايد المنحنى ثم تناقصه' دون قول 'مما يدل على...' ودون استنتاج، فأنت تخسر نصف علامة التمرين.",
    repairSteps_ar: [
      "الخطوة 1: التعريف بالوثيقة: 'تمثل الوثيقة تغيرات [المتغير على محور التراتيب] بدلالة [المتغير على محور الفواصل] حيث نلاحظ:'",
      "الخطوة 2: تفكيك المعطيات مع إبراز الدلالة: قسّم المنحنى إلى فترات واذكر القيمة وعلل دلالتها الحيوية باستعمال 'مما يدل على...'.",
      "الخطوة 3: الاستنتاج الإجباري المستقل: اختم بجملة واحدة تجيب مباشرة على الهدف البيولوجي من التجربة: 'ومنه نستنتج أن...'.",
    ],
    microPracticePrompt_ar: "وثيقة تبين انعدام تركيب البروتين عند إضافة مادة ألفا-أمانيتين المثبطة لـ ARN بوليميراز. ما هو الاستنتاج المنهجي الصحيح؟",
    microPracticeSolution_ar: "الاستنتاج المنهجي: نستنتج أن نشاط أنزيم ARN بوليميراز ضروري لحدوث عملية الاستنساخ وبالتالي تركيب البروتين.",
    estimatedMinutes: 12,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },
];
