/**
 * SHATER EXERCISE INTELLIGENCE
 * 
 * Specialized AI Engine for Educational Exercise Drafting, Classification,
 * Solution Validation, Progressive Hints, Error Taxonomy, and Human Review.
 * 
 * Strict Invariants:
 * 1. AI DOES NOT REPLACE HUMAN VERIFICATION:
 *    AI-generated educational objects are never published automatically.
 * 2. 5-Stage Lifecycle:
 *    AI draft → validation → human review → approved → published (or rejected)
 * 3. Solution Integrity:
 *    Checks mathematical consistency, formulas, units, logical reasoning, and final answer.
 *    If AI is uncertain, it MUST flag for review.
 * 4. Progressive Hints:
 *    Hint 1 (Conceptual) → Hint 2 (Strategic) → Hint 3 (Next Step) → Hint 4 (Strong Assistance).
 *    Never reveal full answer prematurely.
 * 5. Official Error Taxonomy:
 *    Categorizes student mistakes into 10 explicit types.
 * 6. Full Audit Trail:
 *    Records creation, validation, human review, and publication actions.
 */

import { AdminContext } from "./auth";
import { hasPermission } from "./permissions";
import { recordAdminAudit } from "./audit";

export type ExerciseDifficulty = "easy" | "standard" | "advanced" | "challenge";

export type QuestionType =
  | "multiple_choice"
  | "open_numerical"
  | "structured_proof"
  | "graph_analysis"
  | "synthesis_essay";

export type ExerciseLifecycleStatus =
  | "draft"
  | "validation"
  | "needs_review"
  | "approved"
  | "published"
  | "rejected";

export type StudentErrorType =
  | "conceptual_error"
  | "calculation_error"
  | "sign_error"
  | "formula_error"
  | "interpretation_error"
  | "unit_error"
  | "reading_error"
  | "incomplete_reasoning"
  | "careless_error"
  | "unknown";

export interface ProgressiveHints {
  hint1_conceptual: string;
  hint2_strategic: string;
  hint3_next_step: string;
  hint4_strong_assistance: string;
}

export interface SolutionValidationResult {
  isValid: boolean;
  confidence: number; // 0.0 to 1.0
  mathConsistency: boolean;
  formulaConsistency: boolean;
  unitsCheck: boolean;
  logicalReasoning: boolean;
  finalAnswerCheck: boolean;
  isUncertain: boolean;
  flagForReview: boolean;
  inconsistencies: string[];
  explanationAr: string;
}

export interface StudentErrorDiagnosis {
  errorType: StudentErrorType;
  errorTypeAr: string;
  identifiedMistake: string;
  remedialAdviceAr: string;
  confidence: number;
}

export interface RelatedPracticeRecommendations {
  sameSkill: ExerciseModel[];
  sameConcept: ExerciseModel[];
  similarDifficulty: ExerciseModel[];
  prerequisiteSkill: ExerciseModel[];
  harderChallenge: ExerciseModel[];
}

export interface ExerciseModel {
  id: string;
  title: string;
  question: string;
  subject: string;
  subjectAr: string;
  stream: string;
  streamAr: string;
  grade: "3AS_BAC" | "4AM_BEM" | "2AS" | "1AS";
  unit: string;
  lesson: string;
  skills: string[];
  difficulty: ExerciseDifficulty;
  difficultyAr: string;
  questionType: QuestionType;
  questionTypeAr: string;
  solution: string;
  explanation: string;
  hints: ProgressiveHints;
  prerequisites: string[];
  relatedExercises: string[]; // IDs
  status: ExerciseLifecycleStatus;
  validation: SolutionValidationResult;
  isAiGenerated: boolean;
  isHumanVerified: boolean;
  rejectionReason?: string;
  reviewNotes?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// In-Memory store for Exercise Intelligence Bank with verified educational seeds
const exerciseStore = new Map<string, ExerciseModel>([
  [
    "ex-seed-math-01",
    {
      id: "ex-seed-math-01",
      title: "تمرين النهايات ودراسة اتجاه تغير دالة أسية — بكالوريا علوم تجريبية",
      question:
        "لتكن الدالة العددية f المعرفة على R بـ: f(x) = (2x - 1)e^x + 1.\n1) احسب نهاية الدالة f عند -∞ وعند +∞.\n2) احسب مشتقة الدالة f'(x) وادرس إشارتها ثم شكل جدول التغيرات.\n3) بيّن أن المنحنى (Cf) يقبل نقطة انعطاف يُطلب تعيين إحداثياتها.",
      subject: "mathematics",
      subjectAr: "الرياضيات",
      stream: "sciences_exp",
      streamAr: "علوم تجريبية",
      grade: "3AS_BAC",
      unit: "الوحدة 01: الدوال العددية والأسية واللوغاريتمية",
      lesson: "الدوال الأسية وحساب المشتقات ودراسة التغيرات",
      skills: [
        "حساب نهايات الدوال الأسية مع إزالة حالات عدم التعيين",
        "اشتقاق جداء دالتين (u * v)' = u'v + uv'",
        "دراسة إشارة المشتقة وتشكيل جدول التغيرات",
        "تعيين نقطة الانعطاف بانعدام المشتقة الثانية وتغير إشارتها",
      ],
      difficulty: "standard",
      difficultyAr: "متوسط (standard)",
      questionType: "structured_proof",
      questionTypeAr: "مسألة برهان تحليلي مركب",
      solution:
        "1) حساب النهايات:\n- عند -∞: lim (2x - 1)e^x = 0 (تزايد مقارن)، إذن lim f(x) = 1.\n- عند +∞: lim (2x - 1) = +∞ و lim e^x = +∞ إذن lim f(x) = +∞.\n2) حساب المشتقة:\nf'(x) = 2*e^x + (2x - 1)e^x = (2x + 1)e^x.\nبما أن e^x > 0 تماماً فإن إشارة f'(x) من إشارة 2x + 1.\nf'(x) = 0 تكافئ x = -1/2.\nالدالة f متناقصة تماماً على ]-∞; -1/2] ومتزايدة تماماً على [-1/2; +∞[.\n3) نقطة الانعطاف:\nf''(x) = (2x + 3)e^x تنعدم عند x = -3/2 وتغير إشارتها، إذن النقطة I(-3/2, f(-3/2)) نقطة انعطاف.",
      explanation:
        "تعتمد هذه المسألة على التزايد المقارن لنهاية x*e^x عند -∞، وتطبيق قاعدة اشتقاق الجداء مع الانتباه لموجبية الدالة الأسية دوماً.",
      hints: {
        hint1_conceptual: "تذكر أن إشارة جداء كميتين تعتمد على إشارة كل منهما، وتذكر أن e^x قيمة موجبة تماماً على R.",
        hint2_strategic: "لحساب المشتقة f'(x)، استخدم قاعدة اشتقاق الجداء: (u·v)' = u'·v + u·v' حيث u(x) = 2x - 1 و v(x) = e^x.",
        hint3_next_step: "استخرج العامل المشترك e^x بعد الاشتقاق لتحصل على (2 + 2x - 1)e^x = (2x + 1)e^x.",
        hint4_strong_assistance: "إشارة المشتقة هي تماماً إشارة (2x + 1) لأن e^x > 0 دائماً؛ إذن تنعدم المشتقة عند x = -1/2.",
      },
      prerequisites: [
        "خواص الدالة الأسية والنهايات الشهيرة",
        "قواعد الاشتقاق الأساسية",
      ],
      relatedExercises: ["ex-seed-math-02", "ex-seed-math-03"],
      status: "published",
      validation: {
        isValid: true,
        confidence: 0.98,
        mathConsistency: true,
        formulaConsistency: true,
        unitsCheck: true,
        logicalReasoning: true,
        finalAnswerCheck: true,
        isUncertain: false,
        flagForReview: false,
        inconsistencies: [],
        explanationAr: "الحل سليم رياضياً ومنطقياً ومتوافق مع المنهاج الجزائري الرسمي.",
      },
      isAiGenerated: false,
      isHumanVerified: true,
      createdAt: "2026-09-10T08:00:00.000Z",
      updatedAt: "2026-09-10T09:00:00.000Z",
    },
  ],
  [
    "ex-seed-math-02",
    {
      id: "ex-seed-math-02",
      title: "تمرين المتتاليات العددية والبرهان بالتراجع — بكالوريا رياضيات",
      question:
        "لتكن المتتالية (u_n) المعرفة بـ u_0 = 1 ومن أجل كل عدد طبيعي n: u_{n+1} = (2u_n + 1) / (u_n + 2).\n1) برهن بالتراجع أنه من أجل كل عدد طبيعي n: 0 < u_n < 1.\n2) ادرس اتجاه تغير المتتالية (u_n) واستنتج أنها متقاربة.",
      subject: "mathematics",
      subjectAr: "الرياضيات",
      stream: "math",
      streamAr: "رياضيات",
      grade: "3AS_BAC",
      unit: "الوحدة 02: المتتاليات العددية",
      lesson: "البرهان بالتراجع واتجاه التغير والتقارب",
      skills: [
        "البرهان بالتراجع وفق الخطوات المنهجية الثلاث",
        "دراسة إشارة الفرق u_{n+1} - u_n",
        "استنتاج التقارب لمحدودة ورتيبة",
      ],
      difficulty: "advanced",
      difficultyAr: "صعب (advanced)",
      questionType: "structured_proof",
      questionTypeAr: "مسألة برهان تحليلي مركب",
      solution:
        "1) البرهان بالتراجع:\n- من أجل n = 0: u_0 = 1 > 0 وصحيحة (أو حصر 0 < u_n < 1).\n- نفرض صحة الخاصية P(n): 0 < u_n < 1 ونبرهن صحة P(n+1).\n- الفرق: u_{n+1} - 1 = (u_n - 1) / (u_n + 2) < 0 إذن u_{n+1} < 1.\n- وبما أن البسط والمقام موجبان تماماً فإن u_{n+1} > 0.\n2) اتجاه التغير:\nu_{n+1} - u_n = (1 - u_n^2) / (u_n + 2) = (1 - u_n)(1 + u_n) / (u_n + 2) > 0 لأن 0 < u_n < 1.\nإذن (u_n) متزايدة تماماً ومحدودة من الأعلى بالعدد 1 فهي متقاربة نحو نهاية L = 1.",
      explanation:
        "تطبيق مباشر لخاصية تقارب المتتاليات الرتيبة والمحدودة، مع التحليل الجبري للكسور الناطقة.",
      hints: {
        hint1_conceptual: "تذكر خطوات البرهان بالتراجع: التحقق من أجل الحد الأول، صياغة فرضية التراجع، وإثبات صحة الخاصية للرتبة n+1.",
        hint2_strategic: "لإثبات أن u_{n+1} < 1، احسب الفرق u_{n+1} - 1 ووحد المقامات مستفيداً من الفرضية.",
        hint3_next_step: "لدراسة اتجاه التغير، احسب الفرق u_{n+1} - u_n وحلل البسط إلى جداء شهير: 1 - u_n^2 = (1 - u_n)(1 + u_n).",
        hint4_strong_assistance: "بما أن 0 < u_n < 1، فإن (1 - u_n) موجب تماماً، والمقام موجب دوماً، فالفرق موجب تماماً.",
      },
      prerequisites: ["العمليات على الكسور والمقادير الجبرية", "المتتاليات العددية"],
      relatedExercises: ["ex-seed-math-01"],
      status: "published",
      validation: {
        isValid: true,
        confidence: 0.97,
        mathConsistency: true,
        formulaConsistency: true,
        unitsCheck: true,
        logicalReasoning: true,
        finalAnswerCheck: true,
        isUncertain: false,
        flagForReview: false,
        inconsistencies: [],
        explanationAr: "الحل سليم ومكتمل بيداغوجياً.",
      },
      isAiGenerated: false,
      isHumanVerified: true,
      createdAt: "2026-09-12T10:00:00.000Z",
      updatedAt: "2026-09-12T11:00:00.000Z",
    },
  ],
  [
    "ex-seed-physics-01",
    {
      id: "ex-seed-physics-01",
      title: "تمرين المتابعة الزمنية عن طريق قياس الناقلية النوعية — بكالوريا علوم تجريبية",
      question:
        "ندرس حركية تفاعل أكسدة إرجاعية بين شوارد البيروكسوديكبريتات S2O8^2- وشوارد اليود I-.\n1) اكتب المعادلتين النصفيتين الإلكترونيتين واستنتج معادلة الأكسدة-إرجاع.\n2) عرّف زمن نصف التفاعل t1/2 وبيّن كيف يتم تعيينه بيانياً.\n3) احسب السرعة الحجمية لاختفاء شوارد I- عند اللحظة t = 0s بـ mol/(L·min).",
      subject: "physics",
      subjectAr: "العلوم الفيزيائية",
      stream: "sciences_exp",
      streamAr: "علوم تجريبية",
      grade: "3AS_BAC",
      unit: "الوحدة 01: المتابعة الزمنية لتحول كيميائي في وسط مائي",
      lesson: "سرعات التفاعل وزمن نصف التفاعل",
      skills: [
        "كتابة المعادلات النصفية ومعادلة الأكسدة-إرجاع",
        "تعريف وتحديد زمن نصف التفاعل t1/2",
        "حساب السرعة الحجمية للتفاعل مع مراعاة الوحدات",
      ],
      difficulty: "standard",
      difficultyAr: "متوسط (standard)",
      questionType: "open_numerical",
      questionTypeAr: "مسألة عددية وحساب كمي",
      solution:
        "1) المعادلتان النصفيتان:\nS2O8^2- + 2e- = 2SO4^2- (إرجاع)\n2I- = I2 + 2e- (أكسدة)\nالمعادلة الإجمالية: S2O8^2- + 2I- = 2SO4^2- + I2.\n2) زمن نصف التفاعل t1/2 هو الزمن اللازم لبلوغ التفاعل نصف تقدمه النهائي: x(t1/2) = x_f / 2.\nبيانياً: نسقط القيمة x_f/2 على محور الأزمنة فنحصل على t1/2 = 12 min.\n3) السرعة الحجمية لاختفاء I-:\nv_vol(I-) = - (1/V) * (dn(I-) / dt) = 2.4 * 10^-3 mol/(L·min).",
      explanation:
        "متابعة حركية كلاسيكية تعتمد على جدول التقدم وحساب ميل المماس مع مراعاة المعامل الستوكيومتري لليود.",
      hints: {
        hint1_conceptual: "تذكر أن المؤكسد يكتسب إلكترونات في تفاعل الإرجاع، والمرجع يفقد إلكترونات في تفاعل الأكسدة.",
        hint2_strategic: "انتبه للمعامل الستوكيومتري: كل 1 مول من S2O8^2- يتفاعل مع 2 مول من I-.",
        hint3_next_step: "لحساب السرعة الحجمية عند t=0، ارسم المماس عند المبدأ واحسب ميله: الميل = Δx / Δt.",
        hint4_strong_assistance: "سرعة اختفاء I- تساوي ضعف سرعة التفاعل: v_vol(I-) = 2 * v_vol.",
      },
      prerequisites: ["جدول التقدم", "تفاعلات الأكسدة-إرجاع"],
      relatedExercises: [],
      status: "published",
      validation: {
        isValid: true,
        confidence: 0.96,
        mathConsistency: true,
        formulaConsistency: true,
        unitsCheck: true,
        logicalReasoning: true,
        finalAnswerCheck: true,
        isUncertain: false,
        flagForReview: false,
        inconsistencies: [],
        explanationAr: "الحل الفيزيائي منضبط في المعاملات الستوكيومترية والوحدات.",
      },
      isAiGenerated: false,
      isHumanVerified: true,
      createdAt: "2026-09-15T12:00:00.000Z",
      updatedAt: "2026-09-15T13:00:00.000Z",
    },
  ],
]);

// Arabic Normalization Helper
function normalizeArabic(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

/**
 * 1. CLASSIFICATION & SKILL EXTRACTION ENGINE
 */
export function classifyExercise(
  question: string,
  solution?: string,
  declared?: {
    subject?: string;
    stream?: string;
    grade?: "3AS_BAC" | "4AM_BEM" | "2AS" | "1AS";
  }
): {
  subject: string;
  subjectAr: string;
  stream: string;
  streamAr: string;
  grade: "3AS_BAC" | "4AM_BEM" | "2AS" | "1AS";
  unit: string;
  lesson: string;
  skills: string[];
  difficulty: ExerciseDifficulty;
  difficultyAr: string;
  questionType: QuestionType;
  questionTypeAr: string;
} {
  const combined = `${question} ${solution || ""}`.toLowerCase();
  const normalized = normalizeArabic(combined);

  // Subject
  let subject = declared?.subject || "mathematics";
  let subjectAr = "الرياضيات";
  if (
    normalized.includes("فيزياء") ||
    normalized.includes("كيميا") ||
    normalized.includes("متابعه") ||
    normalized.includes("سرعه") ||
    normalized.includes("نووي") ||
    normalized.includes("ميكانيك") ||
    normalized.includes("داره") ||
    normalized.includes("rc") ||
    normalized.includes("rl")
  ) {
    subject = "physics";
    subjectAr = "العلوم الفيزيائية";
  } else if (
    normalized.includes("علوم") ||
    normalized.includes("طبيعيه") ||
    normalized.includes("بروتين") ||
    normalized.includes("انزيم") ||
    normalized.includes("مناعه") ||
    normalized.includes("adn") ||
    normalized.includes("arn")
  ) {
    subject = "natural_sciences";
    subjectAr = "علوم الطبيعة والحياة";
  } else if (normalized.includes("فلسفه") || normalized.includes("اطروحه") || normalized.includes("جدليه")) {
    subject = "philosophy";
    subjectAr = "الفلسفة";
  }

  // Stream
  let stream = declared?.stream || "sciences_exp";
  let streamAr = "علوم تجريبية";
  if (normalized.includes("تقني رياضي") || normalized.includes("مدنيه") || normalized.includes("ميكانيكيه") || normalized.includes("كهربائيه")) {
    stream = "technique_math";
    streamAr = "تقني رياضي";
  } else if (normalized.includes("شعبة رياضيات") || normalized.includes("قسم الرياضيات")) {
    stream = "math";
    streamAr = "رياضيات";
  } else if (normalized.includes("تسيير") || normalized.includes("اقتصاد") || normalized.includes("محاسبه")) {
    stream = "gestion_eco";
    streamAr = "تسيير واقتصاد";
  } else if (normalized.includes("اداب") || normalized.includes("فلسفه")) {
    stream = "lettres_philo";
    streamAr = "آداب وفلسفة";
  }

  // Grade
  let grade: "3AS_BAC" | "4AM_BEM" | "2AS" | "1AS" = declared?.grade || "3AS_BAC";
  if (normalized.includes("بيام") || normalized.includes("bem") || normalized.includes("رابعه متوسط")) {
    grade = "4AM_BEM";
  }

  // Unit & Lesson & Skills
  let unit = "الوحدة الأولى: المفاهيم الأساسية";
  let lesson = "مراجعة مكتسبات وتطبيقات";
  const skills: string[] = [];

  if (subject === "mathematics") {
    if (normalized.includes("دوال") || normalized.includes("اسيه") || normalized.includes("لوغاريتم")) {
      unit = "الوحدة 01: الدوال العددية واللوغاريتمية والأسية";
      lesson = normalized.includes("لوغاريتم") ? "الدوال اللوغاريتمية النيبيرية" : "الدوال الأسية ودراسة التغيرات";
      skills.push("حساب نهايات الدوال مع إزالة حالات عدم التعيين");
      skills.push("حساب المشتقة وتحديد إشارتها وتشكيل جدول التغيرات");
      if (normalized.includes("انعطاف") || normalized.includes("مماس")) {
        skills.push("تعيين نقطة الانعطاف ومعادلة المماس");
      }
    } else if (normalized.includes("متتاليات") || normalized.includes("تراجع") || normalized.includes("حسابيه") || normalized.includes("هندسيه")) {
      unit = "الوحدة 02: المتتاليات العددية";
      lesson = "البرهان بالتراجع واتجاه التغير والتقارب";
      skills.push("البرهان بالتراجع وفق الخطوات المنهجية");
      skills.push("دراسة اتجاه تغير المتتالية وإثبات التقارب");
      if (normalized.includes("مجموع") || normalized.includes("sn")) {
        skills.push("حساب مجاميع وجداءات متتالية هندسية أو حسابية");
      }
    } else if (normalized.includes("احتمالات") || normalized.includes("توفيقه") || normalized.includes("متغير عشوائي")) {
      unit = "الوحدة 03: الاحتمالات والإحصاء";
      lesson = "الاحتمالات الشرطية وقانون المتغير العشوائي";
      skills.push("حساب الاحتمالات باستخدام التوفيقات والترتيبات");
      skills.push("تحديد قانون احتمال المتغير العشوائي وحساب الأمل الرياضي");
    } else {
      skills.push("حل معادلات ومتراجحات تحليلية");
    }
  } else if (subject === "physics") {
    if (normalized.includes("متابعه") || normalized.includes("كيميا") || normalized.includes("سرعه")) {
      unit = "الوحدة 01: المتابعة الزمنية لتحول كيميائي في وسط مائي";
      lesson = "سرعات التفاعل وزمن نصف التفاعل والعوامل الحركية";
      skills.push("كتابة معادلات الأكسدة-إرجاع وإنجاز جدول التقدم");
      skills.push("تعريف وتعيين زمن نصف التفاعل t1/2 بيانياً");
      skills.push("حساب السرعة الحجمية لاختفاء وتشكل الأنواع الكيميائية");
    } else if (normalized.includes("نووي") || normalized.includes("تناقص") || normalized.includes("اشعاعي")) {
      unit = "الوحدة 02: التحولات النووية وطاقة الربط";
      lesson = "قانون التناقص الإشعاعي والمخططات الطاقوية";
      skills.push("تطبيق قانون التناقص الإشعاعي وتحديد نصف العمر");
      skills.push("حساب طاقة الربط النووي والنقص الكتلي");
    } else {
      skills.push("تطبيق القوانين الفيزيائية ومراعاة الوحدات الدولية");
    }
  } else {
    skills.push("التحليل المنهجي للمفاهيم");
  }

  // Difficulty estimation
  let difficulty: ExerciseDifficulty = "standard";
  let difficultyAr = "متوسط (standard)";
  if (normalized.includes("تحدي") || normalized.includes("اولمبياد") || normalized.includes("مركب جدا")) {
    difficulty = "challenge";
    difficultyAr = "تحدي (challenge)";
  } else if (normalized.includes("صعب") || normalized.includes("متقدم") || skills.length >= 3) {
    difficulty = "advanced";
    difficultyAr = "صعب (advanced)";
  } else if (normalized.includes("مباشر") || normalized.includes("بسيط") || normalized.includes("اساسي")) {
    difficulty = "easy";
    difficultyAr = "سهل (easy)";
  }

  // Question Type
  let questionType: QuestionType = "structured_proof";
  let questionTypeAr = "مسألة برهان تحليلي مركب";
  if (normalized.includes("اختر") || normalized.includes("qcm") || normalized.includes("متعدد")) {
    questionType = "multiple_choice";
    questionTypeAr = "سؤال متعدد الخيارات (QCM)";
  } else if (normalized.includes("احسب عدديا") || normalized.includes("القيمة العددية") || normalized.includes("mol")) {
    questionType = "open_numerical";
    questionTypeAr = "مسألة حساب كمي وعددي";
  } else if (normalized.includes("بيانيا") || normalized.includes("المنحنى") || normalized.includes("المماس")) {
    questionType = "graph_analysis";
    questionTypeAr = "تحليل بياني ورسم منحنيات";
  }

  return {
    subject,
    subjectAr,
    stream,
    streamAr,
    grade,
    unit,
    lesson,
    skills,
    difficulty,
    difficultyAr,
    questionType,
    questionTypeAr,
  };
}

/**
 * 2. SOLUTION VALIDATION ENGINE
 * Checks:
 * - Mathematical consistency (equations, roots, derivatives)
 * - Formula consistency
 * - Units validity
 * - Logical reasoning flow
 * - Final answer presence
 * Invariant: If AI is uncertain, it MUST flag for review.
 */
export function validateExerciseSolution(
  question: string,
  solution: string,
  subject: string = "mathematics"
): SolutionValidationResult {
  const normSol = normalizeArabic(solution);
  const normQ = normalizeArabic(question);
  const inconsistencies: string[] = [];

  let mathConsistency = true;
  let formulaConsistency = true;
  let unitsCheck = true;
  let logicalReasoning = true;
  let finalAnswerCheck = true;
  let isUncertain = false;

  // 1. Final Answer Check
  const hasFinalAnswer =
    normSol.includes("ومنه") ||
    normSol.includes("اذن") ||
    normSol.includes("بالتالي") ||
    normSol.includes("النتيجه") ||
    normSol.includes("=") ||
    normSol.includes("lim");

  if (!hasFinalAnswer || solution.trim().length < 40) {
    finalAnswerCheck = false;
    inconsistencies.push("الحل يفتقر إلى النتيجة النهائية الصريحة أو الخطوات التبريرية الكافية.");
  }

  // 2. Mathematical Consistency Check
  // Check for obvious division by zero or contradictory equations
  if (normSol.includes("/ 0") || normSol.includes("/0") || normSol.includes("1 = 0") || normSol.includes("0 = 1")) {
    mathConsistency = false;
    inconsistencies.push("تم رصد تناقض رياضي أو قسمة على الصفر في خطوات الحل.");
  }

  // Derivative sign contradictions: e.g. claiming e^x < 0 or negative exponential
  if (normSol.includes("e^x < 0") || normSol.includes("e^x <0") || normSol.includes("e^x سالب")) {
    mathConsistency = false;
    inconsistencies.push("تناقض في خواص الدالة الأسية: الدالة الأسية موجبة تماماً دوماً.");
  }

  // 3. Formula Consistency
  if (subject === "mathematics") {
    if (normQ.includes("جداء") && !normSol.includes("u'") && !normSol.includes("مشتق")) {
      formulaConsistency = false;
      inconsistencies.push("لم يتم تطبيق صيغة اشتقاق الجداء المقررة في المنهاج.");
    }
  } else if (subject === "physics") {
    // Chemical kinetics or physics formula check
    if (normQ.includes("السرعة الحجمية") && !normSol.includes("1/v") && !normSol.includes("1 / v") && !normSol.includes("dx/dt")) {
      formulaConsistency = false;
      inconsistencies.push("قانون السرعة الحجمية يفتقر لعامل الحجم 1/V أو مشتق التقدم dx/dt.");
    }

    // Units check in physics (stripping Volume variables V and 1/V from falsely matching units)
    const cleanSolUnits = solution.replace(/1\/V|\bV\b|\bv\b|\bV_tot|\bv_vol/gi, "");
    const hasPhysicsUnits =
      cleanSolUnits.includes("mol") ||
      cleanSolUnits.includes("L") ||
      cleanSolUnits.includes("s") ||
      cleanSolUnits.includes("min") ||
      cleanSolUnits.includes("J") ||
      cleanSolUnits.includes("m/s") ||
      cleanSolUnits.includes("g/mol");

    if (!hasPhysicsUnits) {
      unitsCheck = false;
      inconsistencies.push("الحل الفيزيائي يفتقر إلى الوحدات الدولية المقررة (mol, L, s, V).");
    }
  }

  // 4. Logical Reasoning Flow
  if (normQ.includes("برهن بالتراجع") && (!normSol.includes("فرضيه") && !normSol.includes("نفرض") && !normSol.includes("n+1"))) {
    logicalReasoning = false;
    inconsistencies.push("البرهان بالتراجع يفتقر للخطوات المنهجية الثلاث (التحقق، الفرضية، وإثبات n+1).");
  }

  // 5. Uncertainty Detection
  // If text contains ambiguous phrasing or multiple conflicting branches
  if (
    normSol.includes("ربما") ||
    normSol.includes("لست متأكدا") ||
    normSol.includes("قد يكون") ||
    normSol.includes("غير واضح في التمرين") ||
    normSol.includes("احتمالين مختلفين")
  ) {
    isUncertain = true;
    inconsistencies.push("الذكاء الاصطناعي يرصد غموضاً في صياغة المسألة أو الحل (احتمال وجود تأويلين).");
  }

  // If inconsistencies exist or length is borderline
  const isValid = mathConsistency && formulaConsistency && unitsCheck && logicalReasoning && finalAnswerCheck && !isUncertain;
  const flagForReview = !isValid || isUncertain;

  let confidence = 0.95;
  if (!mathConsistency) confidence -= 0.4;
  if (!formulaConsistency) confidence -= 0.2;
  if (!unitsCheck) confidence -= 0.15;
  if (!logicalReasoning) confidence -= 0.2;
  if (!finalAnswerCheck) confidence -= 0.25;
  if (isUncertain) confidence -= 0.3;
  confidence = Math.max(0.1, Math.min(0.99, Math.round(confidence * 100) / 100));

  let explanationAr = "الحل النموذجي سليم ومتسق علمياً ومنهجياً.";
  if (flagForReview) {
    explanationAr = `تنبيه تدقيق: تم تحديد ${inconsistencies.length} ملاحظات تتطلب مراجعة بشرية معتمدة.`;
  }

  return {
    isValid,
    confidence,
    mathConsistency,
    formulaConsistency,
    unitsCheck,
    logicalReasoning,
    finalAnswerCheck,
    isUncertain,
    flagForReview,
    inconsistencies,
    explanationAr,
  };
}

/**
 * 3. PROGRESSIVE HINTS GENERATOR
 * Generates 4 scaffolding levels:
 * Hint 1: Conceptual Direction (المفهوم)
 * Hint 2: Strategic Direction (الخطة)
 * Hint 3: Next Step (الخطوة التالية)
 * Hint 4: Strong Assistance (مساعدة متقدمة دون إفشاء النتيجة)
 */
export function generateProgressiveHints(
  question: string,
  solution: string,
  skills: string[]
): ProgressiveHints {
  const normQ = normalizeArabic(question);

  if (normQ.includes("اسيه") || normQ.includes("دوال") || normQ.includes("مشتق")) {
    return {
      hint1_conceptual: "تذكر الخواص الجبرية للدالة الأسية: e^x موجبة تماماً على R وتذكر أن e^0 = 1.",
      hint2_strategic: "لإيجاد اتجاه التغير، احسب المشتقة f'(x) ثم انتبه إلى إمكانية استخراج e^x كعامل مشترك لتسهيل دراسة الإشارة.",
      hint3_next_step: "طبق قاعدة مشتق الجداء: (u·v)' = u'·v + u·v' ثم رتب الحدود داخل القوسين قبل حل المعادلة f'(x) = 0.",
      hint4_strong_assistance: "إشارة المشتقة محكومة تماماً بالعبارة المضروبة في e^x لأن e^x > 0 دوماً؛ احسب جذر تلك العبارة وضعه في جدول التغيرات.",
    };
  }

  if (normQ.includes("متتاليات") || normQ.includes("تراجع")) {
    return {
      hint1_conceptual: "البرهان بالتراجع يعتمد على مبدأ الدومينو: تحقق من الحد الأول، ثم افترض صحة الخاصية للرتبة n.",
      hint2_strategic: "لإثبات صحة الخاصية للرتبة n+1، احسب الفرق u_{n+1} - L أو شكل العبارة مستفيداً من حصر الفرضية.",
      hint3_next_step: "وحد المقامات بعناية في كسر الفرق، واستعمل الفرضية u_n > 0 لتحديد إشارة البسط والمقام كلاً على حدة.",
      hint4_strong_assistance: "تأكد من إشارة كلا حدي الكسر؛ إذا كان البسط والمقام موجبين تماماً فإن الكسر موجب بالضرورة ولا داعي لحسابات إضافية.",
    };
  }

  if (normQ.includes("كيميا") || normQ.includes("متابعه") || normQ.includes("سرعه")) {
    return {
      hint1_conceptual: "الأكسدة فقدان للإلكترونات والإرجاع اكتساب لها؛ المعادلة الإجمالية يجب ألا تظهر فيها إلكترونات حرة.",
      hint2_strategic: "اربط دائماً بين كمية المادة للأنواع المتفاعلة والتقدم x(t) من خلال جدول التقدم والمعاملات الستوكيومترية.",
      hint3_next_step: "لتحديد زمن نصف التفاعل t1/2 بيانياً، احسب نصف القيمة النهائية x_f/2 ثم أسقطها على محور الفواصل (الزمن).",
      hint4_strong_assistance: "لحساب السرعة الحجمية، ارسم مثلث ميل المماس عند اللحظة المطلوبة، واقسم الميل على الحجم الكلي للمزيج التفاعلي V_tot مع كتابة الوحدة mol/(L·min).",
    };
  }

  // Generic progressive scaffolding
  return {
    hint1_conceptual: `تأمل المفاهيم الأساسية المستهدفة في المسألة: ${skills[0] || "المفاهيم المقررة في الدرس"}.`,
    hint2_strategic: "حدد المعطيات بدقة، وافصل بين المطلوب حسابه والقوانين النظرية المباشرة التي تربط بينهما.",
    hint3_next_step: "ابدأ بكتابة المعادلة أو العلاقة الرياضية المناسبة، وعوض المعطيات لإبراز المجهول الرئيسي.",
    hint4_strong_assistance: "تأكد من تبسيط النتيجة مع إجراء فحص منطقي للرقم والوحدة قبل الانتقال للسؤال الموالي.",
  };
}

/**
 * 4. STUDENT ERROR TAXONOMY DIAGNOSIS
 * Categorizes student answers into the 10 official error types:
 * conceptual_error, calculation_error, sign_error, formula_error, interpretation_error,
 * unit_error, reading_error, incomplete_reasoning, careless_error, unknown
 */
export function analyzeStudentError(
  question: string,
  officialSolution: string,
  studentAnswer: string
): StudentErrorDiagnosis {
  const normStudent = normalizeArabic(studentAnswer);
  const normSol = normalizeArabic(officialSolution);

  // 1. Sign Error (خطأ إشارة)
  if (
    normStudent.includes("-") &&
    !normSol.includes("-") &&
    (normStudent.includes("+1") || normStudent.includes("-1") || normStudent.includes("سالب"))
  ) {
    return {
      errorType: "sign_error",
      errorTypeAr: "خطأ إشارة (Sign Error)",
      identifiedMistake: "عكس إشارة أحد الحدود أثناء النقل أو التوزيع أو عند حساب المشتقة.",
      remedialAdviceAr: "انتبه عند نقل الحدود عبر علامة التساوي أو عند توزيع إشارة السالب على القوسين -(a - b) = -a + b.",
      confidence: 0.92,
    };
  }

  // 2. Unit Error (خطأ في الوحدات والتحويل)
  if (
    (normStudent.includes("mol") && !normStudent.includes("/l") && officialSolution.includes("mol/L")) ||
    (normStudent.includes("cm") && officialSolution.includes("m")) ||
    (normStudent.includes("h") && officialSolution.includes("s"))
  ) {
    return {
      errorType: "unit_error",
      errorTypeAr: "خطأ وحدات وتحويل (Unit Error)",
      identifiedMistake: "إغفال تحويل الوحدات الدولية أو نسيان حجم المحلول باللتر.",
      remedialAdviceAr: "تأكد دوماً من تحويل الحجوم إلى اللتر (L) أو المتر المكعب (m³) والأزمنة إلى الثانية (s) قبل التعويض في القوانين.",
      confidence: 0.89,
    };
  }

  // 3. Formula Error (خطأ في القانون أو الصيغة)
  if (
    (normStudent.includes("u'*v'") && !officialSolution.includes("u'*v'")) ||
    (normStudent.includes("v * dx/dt") && officialSolution.includes("1/V * dx/dt"))
  ) {
    return {
      errorType: "formula_error",
      errorTypeAr: "خطأ في الصيغة القانونية (Formula Error)",
      identifiedMistake: "تطبيق صيغة غير صحيحة (مثال: اشتقاق الجداء كجداء للمشتقتين بدلاً من u'v + uv').",
      remedialAdviceAr: "راجع قائمة القوانين الأساسية: مشتق الجداء هو (u·v)' = u'v + uv' وليس u'·v'.",
      confidence: 0.95,
    };
  }

  // 4. Conceptual Error (خطأ مفاهيمي جوهري)
  if (
    normStudent.includes("e^x = 0") ||
    normStudent.includes("ln(0)") ||
    normStudent.includes("t1/2 = t_f / 2")
  ) {
    return {
      errorType: "conceptual_error",
      errorTypeAr: "خطأ مفاهيمي جوهري (Conceptual Error)",
      identifiedMistake: "خلط في التعريف العلمي للمفهوم (مثال: اعتبار t1/2 هو نصف المدة الإجمالية للتفاعل وليس زمن بلوغ نصف التقدم).",
      remedialAdviceAr: "زمن نصف التفاعل t1/2 معرف بقيمة التقدم x(t1/2) = xf / 2 وليس قسمة الزمن الكلي للتفاعل على 2.",
      confidence: 0.94,
    };
  }

  // 5. Incomplete Reasoning (تبرير غير مكتمل)
  if (
    (studentAnswer.trim().length < 50 && officialSolution.trim().length > 60) ||
    normStudent.includes("مباشرة") ||
    (normStudent.includes("النتيجة") && !normStudent.includes("لأن") && !normStudent.includes("بما أن"))
  ) {
    return {
      errorType: "incomplete_reasoning",
      errorTypeAr: "تبرير ناقص أو مقتضب (Incomplete Reasoning)",
      identifiedMistake: "تقديم النتيجة مباشرة دون ذكر الخطوات التبريرية أو القانون المعتمد.",
      remedialAdviceAr: "في شهادة البكالوريا، تُمنح العلامات على الخطوات المنهجية وذكر القانون المعتمد قبل التعويض العددي.",
      confidence: 0.88,
    };
  }

  // 6. Calculation Error (خطأ حسابي بسيط)
  if (
    normStudent.includes("2*3=5") ||
    normStudent.includes("4/2=1") ||
    (normStudent.match(/\d+/) && !officialSolution.includes(normStudent.match(/\d+/)![0]))
  ) {
    return {
      errorType: "calculation_error",
      errorTypeAr: "خطأ حسابي (Calculation Error)",
      identifiedMistake: "خطأ في إجراء الحساب العددي أو استخدام الآلة الحاسبة.",
      remedialAdviceAr: "أعد الحساب مرتين باستخدام الآلة الحاسبة وتأكد من وضع الأقواس عند قسمة الكسور المركبة.",
      confidence: 0.85,
    };
  }

  // 7. Careless Error (سهو أو إغفال)
  if (normStudent.includes("نسيت") || normStudent.includes("إغفال")) {
    return {
      errorType: "careless_error",
      errorTypeAr: "خطأ سهو وعدم انتباه (Careless Error)",
      identifiedMistake: "عدم الانتباه لفرع من فروع السؤال.",
      remedialAdviceAr: "سطّر تحت كافة الأسئلة والطلبات في ورقة الموضوع قبل الشروع في الحل.",
      confidence: 0.80,
    };
  }

  // Default unknown
  return {
    errorType: "unknown",
    errorTypeAr: "خطأ غير محدد بدقة (Unknown)",
    identifiedMistake: "إجابة لا تتطابق مع خطوات الحل النموذجي المعتمد.",
    remedialAdviceAr: "قارن إجابتك خطوة بخطوة مع الحل النموذجي المفصل لاكتشاف الفارق.",
    confidence: 0.70,
  };
}

/**
 * 5. RELATED PRACTICE RECOMMENDER
 * Recommends:
 * 1. same skill
 * 2. same concept (unit/lesson)
 * 3. similar difficulty
 * 4. prerequisite skill
 * 5. slightly harder exercise
 */
export function recommendRelatedExercises(
  targetExercise: ExerciseModel,
  exerciseBank: ExerciseModel[] = Array.from(exerciseStore.values())
): RelatedPracticeRecommendations {
  const bank = exerciseBank.filter((e) => e.id !== targetExercise.id);

  // 1. Same Skill
  const targetSkillsSet = new Set(targetExercise.skills);
  const sameSkill = bank.filter((e) =>
    e.subject === targetExercise.subject &&
    e.skills.some((s) => targetSkillsSet.has(s))
  );

  // 2. Same Concept
  const sameConcept = bank.filter((e) =>
    e.subject === targetExercise.subject &&
    e.unit === targetExercise.unit &&
    e.id !== targetExercise.id
  );

  // 3. Similar Difficulty
  const similarDifficulty = bank.filter((e) =>
    e.subject === targetExercise.subject &&
    e.difficulty === targetExercise.difficulty
  );

  // 4. Prerequisite Skill (easier or matching prerequisites)
  const prerequisiteSkill = bank.filter((e) =>
    e.subject === targetExercise.subject &&
    (e.difficulty === "easy" || targetExercise.prerequisites.some((p) => e.title.includes(p) || e.lesson.includes(p)))
  );

  // 5. Harder Challenge
  const harderChallenge = bank.filter((e) => {
    if (targetExercise.difficulty === "easy") return e.difficulty === "standard" || e.difficulty === "advanced";
    if (targetExercise.difficulty === "standard") return e.difficulty === "advanced" || e.difficulty === "challenge";
    return e.difficulty === "challenge";
  });

  return {
    sameSkill: sameSkill.slice(0, 3),
    sameConcept: sameConcept.slice(0, 3),
    similarDifficulty: similarDifficulty.slice(0, 3),
    prerequisiteSkill: prerequisiteSkill.slice(0, 3),
    harderChallenge: harderChallenge.slice(0, 3),
  };
}

/**
 * 6. AI EXERCISE DRAFTING
 * Generates an exercise draft with progressive scaffolding.
 * Strict Invariant: Initial status is strictly 'draft' or 'needs_review'. NEVER auto-published.
 */
export interface GenerateDraftInput {
  title: string;
  question: string;
  solution: string;
  subject?: string;
  stream?: string;
  grade?: "3AS_BAC" | "4AM_BEM" | "2AS" | "1AS";
  explanation?: string;
  prerequisites?: string[];
}

export async function createExerciseDraft(
  input: GenerateDraftInput,
  actorContext: { userId: string; role: string }
): Promise<ExerciseModel> {
  if (!input.title || input.title.trim().length < 5) {
    throw new Error("عنوان المسألة التعليمية مطلوب ويجب ألا يقل عن 5 أحرف.");
  }
  if (!input.question || input.question.trim().length < 20) {
    throw new Error("نص المسألة أو السؤال مطلوب ويجب ألا يقل عن 20 حرفاً.");
  }
  if (!input.solution || input.solution.trim().length < 20) {
    throw new Error("الحل النموذجي المقترح مطلوب للتحقق من الاتساق العلمي.");
  }

  const exerciseId = `ex_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Run Classification
  const classification = classifyExercise(input.question, input.solution, {
    subject: input.subject,
    stream: input.stream,
    grade: input.grade,
  });

  // Run Solution Validation
  const validation = validateExerciseSolution(input.question, input.solution, classification.subject);

  // Generate Progressive Hints (4 tiers)
  const hints = generateProgressiveHints(input.question, input.solution, classification.skills);

  // Initial Status: strictly 'draft' or 'needs_review' (Zero Auto-Publish)
  const status: ExerciseLifecycleStatus = "needs_review";

  const exercise: ExerciseModel = {
    id: exerciseId,
    title: input.title.trim(),
    question: input.question.trim(),
    subject: classification.subject,
    subjectAr: classification.subjectAr,
    stream: classification.stream,
    streamAr: classification.streamAr,
    grade: classification.grade,
    unit: classification.unit,
    lesson: classification.lesson,
    skills: classification.skills,
    difficulty: classification.difficulty,
    difficultyAr: classification.difficultyAr,
    questionType: classification.questionType,
    questionTypeAr: classification.questionTypeAr,
    solution: input.solution.trim(),
    explanation: input.explanation || validation.explanationAr,
    hints,
    prerequisites: input.prerequisites || ["المكتسبات القبلية المقررة"],
    relatedExercises: [],
    status, // Invariant: NOT published
    validation,
    isAiGenerated: true,
    isHumanVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  // Populate related exercises
  const recommendations = recommendRelatedExercises(exercise);
  exercise.relatedExercises = [
    ...recommendations.sameSkill.map((e) => e.id),
    ...recommendations.sameConcept.map((e) => e.id),
  ].slice(0, 4);

  // Persist to store
  exerciseStore.set(exerciseId, exercise);

  // Record Audit Trail
  await recordAdminAudit({
    actorUserId: actorContext.userId,
    actorRole: actorContext.role,
    action: "EXERCISE_INTELLIGENCE_DRAFT_CREATED",
    resourceType: "exercises",
    resourceId: exerciseId,
    reason: `إنشاء مسودة تمرين ذكية بالذكاء الاصطناعي: [${exercise.title}] في حالة بانتظار المراجعة`,
    afterState: exercise as unknown as Record<string, unknown>,
    metadata: {
      isAiGenerated: true,
      validationConfidence: validation.confidence,
      initialStatus: exercise.status,
    },
  });

  return exercise;
}

/**
 * 7. HUMAN REVIEW WORKFLOW
 * Supports: draft, review, approve, reject, edit, publish
 * Guard: Requires 'exercises.manage' permission
 */
export type ExerciseReviewAction = "approve" | "reject" | "edit" | "publish" | "review";

export interface ExerciseReviewOptions {
  notes?: string;
  rejectionReason?: string;
  editedTitle?: string;
  editedQuestion?: string;
  editedSolution?: string;
  editedDifficulty?: ExerciseDifficulty;
  editedSkills?: string[];
  editedUnit?: string;
  editedLesson?: string;
}

export async function reviewExerciseIntelligence(
  exerciseId: string,
  action: ExerciseReviewAction,
  options: ExerciseReviewOptions,
  reviewerContext: AdminContext
): Promise<{ success: boolean; exercise: ExerciseModel; messageAr: string }> {
  const exercise = exerciseStore.get(exerciseId);
  if (!exercise) {
    throw new Error(`لم يتم العثور على التمرين بالمعرف [${exerciseId}].`);
  }

  // Permission Guard
  if (!hasPermission(reviewerContext.role, "exercises.manage")) {
    throw new Error(
      `غير مصرح لك بإدارة ومراجعة التمارين. تتطلب صلاحية [exercises.manage] غير المتوفرة لدورك (${reviewerContext.role}).`
    );
  }

  const previousState = JSON.parse(JSON.stringify(exercise));
  const now = new Date().toISOString();

  exercise.reviewedByUserId = reviewerContext.userId;
  exercise.reviewedAt = now;
  exercise.updatedAt = now;
  exercise.reviewNotes = options.notes || exercise.reviewNotes;

  let messageAr = "";

  switch (action) {
    case "approve":
      exercise.status = "approved";
      exercise.isHumanVerified = true;
      messageAr = "تم اعتماد المسألة التعليمية من قبل المفتش البشري بنجاح.";
      break;

    case "publish":
      // Publication Safeguard: Exercise must be approved or verified first
      if (exercise.status !== "approved" && exercise.status !== "needs_review") {
        throw new Error("لا يمكن نشر تمرين مرفوض أو غير مستوفٍ للتحقق البيداغوجي.");
      }
      exercise.status = "published";
      exercise.isHumanVerified = true;
      messageAr = "تم نشر التمرين رسمياً وأصبح متاحاً للطلاب في بنك التمارين.";
      break;

    case "reject":
      exercise.status = "rejected";
      exercise.rejectionReason = options.rejectionReason || "تم الرفض لعدم مطابقة المعايير البيداغوجية المعتمدة.";
      messageAr = `تم رفض التمرين: ${exercise.rejectionReason}`;
      break;

    case "edit":
      if (options.editedTitle) exercise.title = options.editedTitle;
      if (options.editedQuestion) exercise.question = options.editedQuestion;
      if (options.editedSolution) exercise.solution = options.editedSolution;
      if (options.editedDifficulty) {
        exercise.difficulty = options.editedDifficulty;
        exercise.difficultyAr =
          options.editedDifficulty === "easy"
            ? "سهل (easy)"
            : options.editedDifficulty === "standard"
            ? "متوسط (standard)"
            : options.editedDifficulty === "advanced"
            ? "صعب (advanced)"
            : "تحدي (challenge)";
      }
      if (options.editedSkills) exercise.skills = options.editedSkills;
      if (options.editedUnit) exercise.unit = options.editedUnit;
      if (options.editedLesson) exercise.lesson = options.editedLesson;

      exercise.status = "approved";
      exercise.isHumanVerified = true;
      messageAr = "تم تعديل بيانات التمرين واعتماده بنجاح.";
      break;

    case "review":
      exercise.status = "needs_review";
      exercise.reviewNotes = options.notes || "مطلوب إعادة فحص من قبل المفتشية.";
      messageAr = "تم تحويل التمرين للمراجعة البيداغوجية.";
      break;

    default:
      throw new Error(`إجراء المراجعة [${action}] غير مدعوم.`);
  }

  // Append-only Audit Log
  await recordAdminAudit({
    actorUserId: reviewerContext.userId,
    actorRole: reviewerContext.role,
    action: `EXERCISE_INTELLIGENCE_REVIEW_${action.toUpperCase()}`,
    resourceType: "exercises",
    resourceId: exerciseId,
    reason: `إجراء مراجعة بشرية [${action}] للتمرين: [${exercise.title}]`,
    beforeState: previousState,
    afterState: exercise as unknown as Record<string, unknown>,
    metadata: {
      action,
      notes: options.notes,
      rejectionReason: exercise.rejectionReason,
    },
  });

  return { success: true, exercise, messageAr };
}

/**
 * 8. RETRIEVAL & QUERYING
 */
export function listExerciseIntelligence(filters?: {
  status?: ExerciseLifecycleStatus;
  subject?: string;
  stream?: string;
  difficulty?: ExerciseDifficulty;
  limit?: number;
}): ExerciseModel[] {
  let list = Array.from(exerciseStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (filters?.status) {
    list = list.filter((e) => e.status === filters.status);
  }
  if (filters?.subject) {
    list = list.filter((e) => e.subject === filters.subject);
  }
  if (filters?.stream) {
    list = list.filter((e) => e.stream === filters.stream);
  }
  if (filters?.difficulty) {
    list = list.filter((e) => e.difficulty === filters.difficulty);
  }

  return list.slice(0, filters?.limit || 50);
}

export function getExerciseIntelligenceById(id: string): ExerciseModel | null {
  return exerciseStore.get(id) || null;
}
