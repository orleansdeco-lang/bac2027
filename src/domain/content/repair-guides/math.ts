/**
 * BAC Mastery — Mathematics Error Repair Guides (Sciences Expérimentales 3AS)
 * Prompt 13: Targeted 5-15 minute remediation guides mapped to Error Lab taxonomy
 * 
 * 10 Skills covered.
 * Invariant: Content Purity (ZERO user_id).
 */

import { RepairGuide } from "../types";

export const MATH_REPAIR_GUIDES: RepairGuide[] = [
  // 1. math_derivatives_chain_rule
  {
    id: "repair_math_chain_sign",
    skillId: "math_derivatives_chain_rule",
    suspectedErrorType: "calculation_error",
    title_ar: "إصلاح خطأ الإشارة ومشتقة الأس في اشتقاق الدوال الأسية المركبة",
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

  // 2. math_intermediate_value_method
  {
    id: "repair_math_tvi_monotony",
    skillId: "math_intermediate_value_method",
    suspectedErrorType: "methodology_error",
    title_ar: "إصلاح منهجية البرهان على وجود حل وحيد بمبرهنة القيم المتوسطة",
    whyItHappens_ar: "إغفال شرط الاستمرار أو شرط الرتابة التامة والاكتفاء بحساب f(a)*f(b) < 0 فقط، مما يؤدي لخصم نصف نقطة السؤال في البكالوريا.",
    diagnosis_ar: "إذا كتبت مباشرة: 'بما أن f(1)*f(2) < 0 إذن المعادلة تقبل حلاً وحيداً' دون إثبات الاستمرار والرتابة التامة، فصياغتك ناقصة.",
    repairSteps_ar: [
      "الخطوة 1: ابدأ دوماً بذكر طبيعة الدالة واستمرارها: 'الدالة f مستمرة على المجال [a, b] لأنها دالة مألوفة/كثيرة حدود'.",
      "الخطوة 2: صرح برتابة الدالة مستنداً إلى إشارة المشتقة: 'ولدينا f'(x) > 0 فإن f متزايدة تماماً على [a, b]'.",
      "الخطوة 3: احسب f(a) و f(b) واكتب شرط الجداء: f(a) * f(b) < 0.",
      "الخطوة 4: اكتب الجملة الختامية الرسمية: 'وحسب مبرهنة القيم المتوسطة، المعادلة f(x) = 0 تقبل حلاً وحيداً alpha في المجال ]a, b['.",
    ],
    microPracticePrompt_ar: "إذا كانت g(x) = x^3 + x مستمرة ومتزايدة تماماً على [0, 1] و g(0) = 0 و g(1) = 2، فما هو نص النتيجة بالنسبة للمعادلة g(x) = 1؟",
    microPracticeSolution_ar: "بما أن g مستمرة ومتزايدة تماماً على [0, 1] والعدد 1 محصور بين g(0) و g(1)، فحسب مبرهنة القيم المتوسطة المعادلة g(x) = 1 تقبل حلاً وحيداً في المجال ]0, 1[.",
    estimatedMinutes: 10,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 3. math_asymptotes_limits
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

  // 4. math_tangent_convexity
  {
    id: "repair_math_tangent_sign",
    skillId: "math_tangent_convexity",
    suspectedErrorType: "calculation_error",
    title_ar: "إصلاح أخطاء الإشارة في دراسة الوضع النسبي ونقاط الانعطاف",
    whyItHappens_ar: "إغفال الأقواس عند حساب الفرق f(x) - y مما يؤدي لخطأ في إشارة الحد الثابت وانقلاب الوضع النسبي بين المنحنى والمماس.",
    diagnosis_ar: "إذا كانت معادلة المماس y = 2x - 3 وكتبت الفرق f(x) - 2x - 3 بدلاً من f(x) - 2x + 3، فهذا خطأ أقواس كلاسيكي.",
    repairSteps_ar: [
      "الخطوة 1: اكتب دائماً صيغة الفرق بأقواس صريحة: D(x) = f(x) - (y).",
      "الخطوة 2: عوض معادلة المماس بين القوسين: D(x) = f(x) - (ax + b).",
      "الخطوة 3: انشر إشارة الناقص بعناية: D(x) = f(x) - ax - b ثم بسط العبارة وشكل جدول الإشارة.",
    ],
    microPracticePrompt_ar: "احسب الفرق f(x) - y إذا كان f(x) = x^2 + x - 1 والمماس y = 3x - 2.",
    microPracticeSolution_ar: "D(x) = (x^2 + x - 1) - (3x - 2) = x^2 + x - 1 - 3x + 2 = x^2 - 2x + 1 = (x - 1)^2 >= 0 (المنحنى يقع دوماً فوق المماس ويمسه عند x = 1).",
    estimatedMinutes: 8,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 5. math_exponential_properties_equations
  {
    id: "repair_math_exp_negative_variable",
    skillId: "math_exponential_properties_equations",
    suspectedErrorType: "misunderstood_concept",
    title_ar: "إصلاح فخ قبول الحلول السالبة عند تغيير المتغير X = e^x",
    whyItHappens_ar: "معاملة المعادلة المضاعفة كمعادلة عادية ونسيان أن المقدار الأسي e^x موجب تماماً ولا يمكن أن يساوي عدداً سالباً أو صفراً.",
    diagnosis_ar: "إذا حصلت على X = -3 وكتبت x = ln(-3)، فأنت تخرق المبادئ الأساسية لمجموعة تعريف الدالة اللوغاريتمية والأسية.",
    repairSteps_ar: [
      "الخطوة 1: فور كتابة 'نضع X = e^x'، اكتب فوراً بخط عريض بجانبها: 'مع الشرط X > 0 قطعاً'.",
      "الخطوة 2: بعد حل معادلة المميز دلتا واستخراج قيم X، قارن كل حل بالصفر مباشرة.",
      "الخطوة 3: اشطب أي حل X <= 0 واكتب بجانبه 'مرفوض لأن e^x > 0 دوماً على R'.",
      "الخطوة 4: طبق اللوغاريتم فقط على الحلول الموجبة تماماً: x = ln(X_موجب).",
    ],
    microPracticePrompt_ar: "حل المعادلة X^2 + X - 6 = 0 حيث X = e^x واستخرج قيم x المقبولة فقط.",
    microPracticeSolution_ar: "المميز دلتا = 25، والحلان هما X_1 = -3 و X_2 = 2. الحل X_1 = -3 مرفوض لأن e^x > 0. والحل X_2 = 2 مقبول ومنه x = ln(2).",
    estimatedMinutes: 10,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 6. math_logarithm_domain_limits
  {
    id: "repair_math_log_domain_condition",
    skillId: "math_logarithm_domain_limits",
    suspectedErrorType: "misunderstood_concept",
    title_ar: "إصلاح تحديد مجال تعريف الدوال اللوغاريتمية المركبة ln(u(x))",
    whyItHappens_ar: "الخلط بين شرط الدالة الجذرية (أكبر أو يساوي الصفر) وشرط الدالة اللوغاريتمية (أكبر تماماً من الصفر قطعاً).",
    diagnosis_ar: "إذا وضعت مجالات مغلقة عند القيم التي تعدم ما بداخل اللوغاريتم مثل [2, +∞[ بدلاً من ]2, +∞[، فمجال التعريف غير صحيح.",
    repairSteps_ar: [
      "الخطوة 1: اكتب شرط وجود اللوغاريتم بصيغة المتباينة الصارمة: u(x) > 0 (أكبر تماماً، لا يساوي الصفر أبداً).",
      "الخطوة 2: إذا كان u(x) كسراً A(x)/B(x)، ضع جدول إشارة كامل للكسر وألغِ القيم التي تعدم البسط والمقام بخطين عموديين.",
      "الخطوة 3: اختر المجالات التي تكون فيها الإشارة موجبة (+) وافتح المجالات عند جميع الحدود.",
    ],
    microPracticePrompt_ar: "عين مجال تعريف الدالة f(x) = ln(3 - x).",
    microPracticeSolution_ar: "الشرط: 3 - x > 0 أي x < 3. إذن مجموعة التعريف هي المجال المفتوح D_f = ]-∞, 3[.",
    estimatedMinutes: 8,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 7. math_induction_reasoning
  {
    id: "repair_math_induction_circular",
    skillId: "math_induction_reasoning",
    suspectedErrorType: "methodology_error",
    title_ar: "إصلاح الاستدلال الدائري في مرحلة الوراثة بالبرهان بالتراجع",
    whyItHappens_ar: "الانطلاق من العلاقة المطلوب إثباتها P(n+1) واستعمالها كمعطى مسبق، وهو خطأ منطقي يرفضه مصحح البكالوريا قطعاً.",
    diagnosis_ar: "إذا بدأت مرحلة الوراثة بكتابة: 'لدينا u_(n+1) < 2 ومنه...'، فأنت تقع في فخ الاستدلال الدائري.",
    repairSteps_ar: [
      "الخطوة 1: اكتب الصياغة المنهجية المعتمدة: 'نفرض صحة P(n) (أي u_n < 2) ونبرهن صحة P(n+1) (أي نبرهن أن u_(n+1) < 2)'.",
      "الخطوة 2: ضع يدك على الفرضية فقط: ابدأ السطر بـ 'لدينا بالفرض: u_n < 2'.",
      "الخطوة 3: طبق العمليات الرياضية (الضرب في معامل، الجمع) على طرفي المتراجحة بالترتيب حتى تظهر عبارة u_(n+1) في الطرف الأيسر.",
    ],
    microPracticePrompt_ar: "إذا كان u_(n+1) = 2*u_n + 3 وفرضنا بالتراجع أن u_n > 0، كيف تبرهن أن u_(n+1) > 0؟",
    microPracticeSolution_ar: "ننطلق حصراً من الفرضية: لدينا بالفرض u_n > 0. بالضرب في 2 الموجب: 2*u_n > 0. بإضافة 3 للطرفين: 2*u_n + 3 > 3 > 0. أي u_(n+1) > 0، فالخاصية وراثية.",
    estimatedMinutes: 10,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 8. math_sequence_reasoning
  {
    id: "repair_math_sequence_monotone_limit",
    skillId: "math_sequence_reasoning",
    suspectedErrorType: "misunderstood_concept",
    title_ar: "إصلاح التمييز بين مبرهنة التقارب وحساب النهاية الفعلية للمتتالية",
    whyItHappens_ar: "الاعتقاد الخاطئ بأن العدد الذي يحد المتتالية من الأعلى هو حتماً نهايتها، وتجاهل حل المعادلة f(L) = L.",
    diagnosis_ar: "إذا برهنت أن u_n < 4 واستنتجت مباشرة أن lim u_n = 4، فأنت تخلط بين الحاد الأعلى والنهاية.",
    repairSteps_ar: [
      "الخطوة 1: مبرهنة التقارب تثبت الوجود فقط: 'بما أن (u_n) متزايدة ومحدودة من الأعلى فإنها متقاربة نحو نهاية حقيقية L'.",
      "الخطوة 2: لحساب النهاية L: بما أن u_(n+1) = f(u_n) والدالة f مستمرة، فإن نهاية المتتالية L تحقق المعادلة: f(L) = L.",
      "الخطوة 3: حل المعادلة f(L) = L جبرياً واستخرج الحل المتوافق مع مجال قيم المتتالية.",
    ],
    microPracticePrompt_ar: "إذا كانت u_(n+1) = (1/3)*u_n + 2 وكانت متقاربة نحو L، احسب قيمة L بدقة.",
    microPracticeSolution_ar: "نحل المعادلة L = (1/3)*L + 2. ننقل للطرف الأول: L - (1/3)*L = 2 أي (2/3)*L = 2 ومنه L = 2 * (3/2) = 3.",
    estimatedMinutes: 10,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 9. math_arithmetic_geometric_auxiliary
  {
    id: "repair_math_geom_term_shift",
    skillId: "math_arithmetic_geometric_auxiliary",
    suspectedErrorType: "calculation_error",
    title_ar: "إصلاح خطأ الأس في عبارة الحد العام للمتتالية الهندسية (n مقابل n-1)",
    whyItHappens_ar: "تطبيق الصيغة v_n = v_0 * q^n بشكل أعمى عندما يكون الحد الأول للمتتالية هو v_1 وليس v_0.",
    diagnosis_ar: "إذا كانت المتتالية معرفة ابتداء من n=1 وكتبت v_n = v_1 * q^n، فجميع حسابات المجاميع والحدود ستكون خاطئة بفارق رتبة.",
    repairSteps_ar: [
      "الخطوة 1: تحقق أولاً من دليل الحد الأول المعطى في المسألة (هل هو n=0 أم n=1؟).",
      "الخطوة 2: طبق القانون العام الشامل: v_n = v_p * q^(n - p) حيث p هو دليل الحد الأول.",
      "الخطوة 3: إذا كان الحد الأول v_0 فإن p=0 والعبارة v_n = v_0 * q^n. وإذا كان الحد الأول v_1 فإن p=1 والعبارة v_n = v_1 * q^(n-1).",
    ],
    microPracticePrompt_ar: "متتالية هندسية أساسها q = 2 وحدها الأول v_1 = 5. اكتب عبارة v_n بدلالة n.",
    microPracticeSolution_ar: "الحد الأول هو v_1 إذن p = 1. العبارة هي: v_n = v_1 * q^(n-1) = 5 * 2^(n-1).",
    estimatedMinutes: 8,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },

  // 10. math_conditional_probability_tree
  {
    id: "repair_math_prob_bayes_inversion",
    skillId: "math_conditional_probability_tree",
    suspectedErrorType: "misunderstood_concept",
    title_ar: "إصلاح قلب الشرط في الاحتمالات الشرطية ودستور بايز",
    whyItHappens_ar: "صعوبة التمييز اللغوي في نص المسألة بين 'احتمال وقوع A علماً أن B قد وقعت' وبين 'احتمال وقوع B علماً أن A قد وقعت'.",
    diagnosis_ar: "إذا طلب منك حساب احتمال أن يكون الجهاز من المصنع 1 علماً أنه معيب، وكتبت P_{M1}(D) بدلاً من P_D(M1)، فهذا خطأ في تحديد الشرط.",
    repairSteps_ar: [
      "الخطوة 1: اقرأ الجملة بتركيز وابحث عن عبارة: 'علماً أن' أو 'إذا علمنا أن'.",
      "الخطوة 2: الحادثة التي تأتي بعد 'علماً أن' هي الحادثة المحققة (الشرط) وتكتب دائماً في الأسفل كدليل: P_{الشرط}(المطلوب).",
      "الخطوة 3: اكتب قانون الاحتمال الشرطي: P_{الشرط}(المطلوب) = P(المطلوب ∩ الشرط) / P(الشرط).",
    ],
    microPracticePrompt_ar: "إذا كان P(A ∩ B) = 0.12 و P(B) = 0.40، احسب الاحتمال الشرطي P_B(A).",
    microPracticeSolution_ar: "الشرط هو B ويكتب في المقام: P_B(A) = P(A ∩ B) / P(B) = 0.12 / 0.40 = 0.30.",
    estimatedMinutes: 8,
    sourceId: "src-bac-mastery-pedagogy",
    sourceType: "original_bac_mastery",
    rightsStatus: "original",
    verificationStatus: "verified",
    academicYear: "2024-2025",
    isActive: true,
  },
];
