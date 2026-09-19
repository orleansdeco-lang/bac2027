/**
 * BAC 2026/2027 Production Learning Bundles
 * Stream: Sciences Expérimentales / Math / Technique Math (Term 2)
 * Subject: Mathematics (الأعداد المركبة، الهندسة الفضائية، والتكامل)
 * Destination: src/domain/content/math-term2-bundle.ts
 */

export interface SkillLearningBundle {
  skillId: string;
  title_ar: string;
  subject: 'math';
  stream: string;
  unit: string;
  bloomLevel: 'apply' | 'analyze';
  theory: {
    summary: string;
    keyTakeaways: string[];
    commonPitfalls: string[];
  };
  practice: {
    question: string;
    options: Array<{ id: string; text: string; correct: boolean }>;
    stepByStepSolution: string[];
  };
  isomorphicRetest: {
    question: string;
    options: Array<{ id: string; text: string; correct: boolean }>;
    repairGuide: string;
  };
}

export const MATH_TERM2_SCIENCES_BUNDLE: Record<string, SkillLearningBundle> = {
  // 1. الأعداد المركبة: الشكل الأسي ودستور دو موافر
  "math_complex_polar_exponential": {
    skillId: "math_complex_polar_exponential",
    title_ar: "الأعداد المركبة: الشكل الأسي ودستور دو موافر وحساب قوى الأعداد المركبة",
    subject: "math",
    stream: "sciences_exp",
    unit: "الأعداد المركبة والتحويلات النقطية",
    bloomLevel: "apply",
    theory: {
      summary: "يُكتب كل عدد مركب غير معدوم z = x + iy على الشكل الأسي z = r · e^(iθ) حيث r = |z| هي الطويلة و θ = arg(z) هي العمدة. يسمح دستور دو موافر بحساب قوى الأعداد المركبة: [r · e^(iθ)]^n = r^n · e^(i nθ) = r^n [cos(nθ) + i sin(nθ)] وتبسيط الزوايا بترديد 2π لتحديد ما إذا كان العدد حقيقياً أو تخيلياً صرفاً.",
      keyTakeaways: [
        "الشكل الأسي: z = r · e^(iθ) مع r = √(x² + y²) > 0 و cos(θ) = x/r و sin(θ) = y/r.",
        "دستور دو موافر: (e^(iθ))^n = e^(i nθ) و (cos θ + i sin θ)^n = cos(nθ) + i sin(nθ).",
        "طبيعة العدد المركب: z^n عدد حقيقي إذا وفقط إذا كان nθ = kπ (مع k ∈ ℤ).",
        "طبيعة العدد المركب: z^n تخيلي صرف إذا وفقط إذا كان nθ = π/2 + kπ (مع k ∈ ℤ)."
      ],
      commonPitfalls: [
        "نسيان رفع الطويلة r إلى الأس n وكتابة r بدلاً من r^n عند تطبيق دستور دو موافر.",
        "الخلط بين مضاعفات π الزوجية (التي تكافئ دورات كاملة 2kπ) والمضاعفات الفردية (التي تضيف زاوية π وتغير إشارة العدد)."
      ]
    },
    practice: {
      question: "ليكن العدد المركب z = -1 + i√3. ما هو الشكل الأسي الصحيح للعدد z، وما هي قيمة z^2026؟",
      options: [
        { id: "opt_a", text: "z = 2 · e^(i 2π/3) و z²⁰²⁶ = 2²⁰²⁶ · e^(i 2π/3)", correct: true },
        { id: "opt_b", text: "z = 2 · e^(i π/3) و z²⁰²⁶ = 2²⁰²⁶ · e^(i π/3)", correct: false },
        { id: "opt_c", text: "z = √2 · e^(i 2π/3) و z²⁰²⁶ = 2¹⁰¹³ · e^(i 4π/3)", correct: false },
        { id: "opt_d", text: "z = 2 · e^(i 5π/6) و z²⁰²⁶ = -2²⁰²⁶", correct: false }
      ],
      stepByStepSolution: [
        "1) حساب الطويلة: r = √((-1)² + (√3)²) = √(1 + 3) = 2.",
        "2) حساب العمدة: cos(θ) = -1/2 و sin(θ) = √3/2 (الربع الثاني)، إذن θ = 2π/3 [2π]. الشكل الأسي: z = 2 · e^(i 2π/3).",
        "3) تطبيق دو موافر: z^2026 = 2^2026 · e^(i 2026 · 2π/3) = 2^2026 · e^(i 4052π/3).",
        "4) قسمة الزاوية: 4052 = 3 × 1350 + 2، إذن 4052π/3 = 1350π + 2π/3 = 675(2π) + 2π/3 ≡ 2π/3 [2π].",
        "5) إذن: z^2026 = 2^2026 · e^(i 2π/3)."
      ]
    },
    isomorphicRetest: {
      question: "ليكن العدد المركب w = 1 + i. ما هي أصغر قيمة للعدد الطبيعي غير المعدوم n بحيث يكون w^n عدداً حقيقياً سالباً؟",
      options: [
        { id: "iso_a", text: "n = 4", correct: true },
        { id: "iso_b", text: "n = 2", correct: false },
        { id: "iso_c", text: "n = 8", correct: false },
        { id: "iso_d", text: "n = 6", correct: false }
      ],
      repairGuide: "عمدة w هي π/4 لأن w = √2 · e^(i π/4). يكون w^n حقيقياً سالباً إذا وفقط إذا كانت عمدة w^n تساوي π + 2kπ، أي n · (π/4) = (2k + 1)π ومنه n = 4(2k + 1). لأصغر عدد طبيعي موجب (k = 0) نجد n = 4."
    }
  },

  // 2. الهندسة في الفضاء: معادلة المستوي والتمثيل الوسيطي لمستقيم
  "math_space_geometry_plane_line": {
    skillId: "math_space_geometry_plane_line",
    title_ar: "الهندسة في الفضاء: معادلة المستوي، التمثيل الوسيطي لمستقيم، والتقاطع والمسافة",
    subject: "math",
    stream: "sciences_exp",
    unit: "الهندسة في الفضاء",
    bloomLevel: "apply",
    theory: {
      summary: "يتحدد المستوي (P) في الفضاء المنسوب لمعلم متعامد ومتجانس بنقطة A وشعاع ناظمي n⃗(a, b, c) عمودي عليه وتكون معادلته الديكارتية ax + by + cz + d = 0. بينما يتحدد المستقيم (D) بنقطة وشعاع توجيه u⃗(α, β, γ) بتمثيل وسيطي x = x0 + αt, y = y0 + βt, z = z0 + γt (t ∈ ℝ). إيجاد نقطة تقاطع مستقيم ومستوٍ يتم بتعويض معادلات المستقيم الوسيطية في معادلة المستوي لحساب قيمة الوسيط t.",
      keyTakeaways: [
        "معادلة المستوي الديكارتية: ax + by + cz + d = 0 حيث n⃗(a, b, c) شعاع ناظمي عمودي على المستوي.",
        "التمثيل الوسيطي لمستقيم يشمل A(x0, y0, z0) وموجه بـ u⃗(α, β, γ): x = x0 + αt، y = y0 + βt، z = z0 + γt.",
        "شرط توازي مستقيم ومستوٍ: تعامد شعاع التوجيه والشعاع الناظمي: n⃗ · u⃗ = 0.",
        "المسافة من نقطة M0(x0, y0, z0) إلى مستوٍ (P): d(M0, P) = |a x0 + b y0 + c z0 + d| / √(a² + b² + c²)."
      ],
      commonPitfalls: [
        "الخلط بين شرط توازي مستقيمين (ارتباط خطي لأشعّة التوجيه) وشرط توازي مستقيم ومستوٍ (تعامد شعاع التوجيه مع الناظمي n⃗ · u⃗ = 0).",
        "نسيان وضع الأقواس عند نشر إحداثيات المستقيم الوسيطية داخل معادلة المستوي مما يسبب أخطاء إشارة في حساب t."
      ]
    },
    practice: {
      question: "ليكن المستوي (P): 2x - y + 3z - 5 = 0 والمستقيم (D) ذو التمثيل الوسيطي: x = 1 + t, y = 2t, z = -1 + t (t ∈ ℝ). ما هي إحداثيات نقطة تقاطع المستقيم (D) مع المستوي (P)؟",
      options: [
        { id: "opt_a", text: "النقطة A(3, 4, 1)", correct: true },
        { id: "opt_b", text: "النقطة B(1, 0, -1)", correct: false },
        { id: "opt_c", text: "النقطة C(2, 2, 0)", correct: false },
        { id: "opt_d", text: "المستقيم يوازي المستوي ولا يتقاطعان", correct: false }
      ],
      stepByStepSolution: [
        "1) تعويض إحداثيات (D) في معادلة (P): 2(1 + t) - (2t) + 3(-1 + t) - 5 = 0.",
        "2) النشر والتبسيط: 2 + 2t - 2t - 3 + 3t - 5 = 0 => 3t - 6 = 0.",
        "3) إيجاد قيمة الوسيط: 3t = 6 => t = 2.",
        "4) تعويض t = 2 في التمثيل الوسيطي: x = 1 + 2 = 3، y = 2(2) = 4، z = -1 + 2 = 1.",
        "5) نقطة التقاطع الوحيدة هي A(3, 4, 1)."
      ]
    },
    isomorphicRetest: {
      question: "احسب المسافة بين النقطة B(1, 2, -1) والمستوي (P): 2x - 2y + z + 5 = 0.",
      options: [
        { id: "iso_a", text: "d(B, P) = 4/3 وحدة", correct: false },
        { id: "iso_b", text: "d(B, P) = 2 وحدة طول بالضبط", correct: false },
        { id: "iso_c", text: "d(B, P) = 1/3 وحدة", correct: false },
        { id: "iso_d", text: "d(B, P) = |2(1) - 2(2) + (-1) + 5| / √(4 + 4 + 1) = 2/3", correct: true }
      ],
      repairGuide: "قانون المسافة: d = |ax0 + by0 + cz0 + d| / √(a² + b² + c²). بتعويض B(1, 2, -1): البسط = |2(1) - 2(2) + (-1) + 5| = |2 - 4 - 1 + 5| = |2| = 2. والمقام = √(2² + (-2)² + 1²) = √(4 + 4 + 1) = √9 = 3. إذن المسافة هي 2/3."
    }
  },

  // 3. الحساب التكاملي: المكاملة بالتجزئة وحساب المساحات
  "math_integration_by_parts_area": {
    skillId: "math_integration_by_parts_area",
    title_ar: "الحساب التكاملي: المكاملة بالتجزئة وحساب مساحات السطوح المستوية",
    subject: "math",
    stream: "sciences_exp",
    unit: "الحساب التكاملي والدوال الأصلية",
    bloomLevel: "apply",
    theory: {
      summary: "تُستخدم المكاملة بالتجزئة لحساب تكامل جداء دالتين لا تتوفر لهما دالة أصلية مباشرة وفق القانون: ∫_a^b u(x)v'(x) dx = [u(x)v(x)]_a^b - ∫_a^b u'(x)v(x) dx. نعتمد على ترتيب الأسبقية لاختيار الدالة المراد اشتقاقها u(x) (قاعدة ALPES: الدوال اللوغاريتمية تسبق كثيرات الحدود وتسبق الدوال الأسية والمثلثية). كما تُحسب مساحة الحيز المحصور بين منحنيين بتكامل الفرق الموجب بينهما.",
      keyTakeaways: [
        "دستور المكاملة بالتجزئة: ∫ u v' = [u v] - ∫ u' v.",
        "قاعدة أسبقية الاشتقاق (ALPES): تمنح الأولوية لاختيار u(x) للدوال: ln(x) ثم كثيرات الحدود P(x) ثم الأسية e^x.",
        "مساحة الحيز المستوي المحصور بين Cf و Cg على [a, b]: A = ∫_a^b |f(x) - g(x)| dx بوحدة قياس المساحات (ua).",
        "إذا كان f(x) ≥ 0 على [a, b] فإن مساحة الحيز المحصور بين المنحني ومحور الفواصل هي A = ∫_a^b f(x) dx."
      ],
      commonPitfalls: [
        "الخطأ في إشارة الناقص قبل التكامل الثاني: - ∫ u' v، أو الخطأ في تعويض حدي التكامل العلوي والسفلي.",
        "نسيان القيمة المطلقة أو التأكد من الوضع النسبي (أعلى وأسفل) قبل حساب المساحة لتفادي الحصول على مساحة سالبة."
      ]
    },
    practice: {
      question: "باستعمال المكاملة بالتجزئة، ما هي القيمة المضبوطة للتكامل I = ∫₁^e x · ln(x) dx؟",
      options: [
        { id: "opt_a", text: "I = (e² + 1) / 4", correct: true },
        { id: "opt_b", text: "I = (e² - 1) / 2", correct: false },
        { id: "opt_c", text: "I = e² / 4", correct: false },
        { id: "opt_d", text: "I = (3e² + 1) / 4", correct: false }
      ],
      stepByStepSolution: [
        "1) نضع: u(x) = ln(x) ومنه u'(x) = 1/x.",
        "2) نضع: v'(x) = x ومنه دالتها الأصلية v(x) = x² / 2.",
        "3) تطبيق القانون: I = [ (x² / 2) ln(x) ]₁^e - ∫₁^e (1/x) · (x² / 2) dx.",
        "4) الحد الأول: عند e: (e²/2) ln(e) = e²/2. عند 1: (1/2) ln(1) = 0. الناتج = e²/2.",
        "5) التكامل المتبقي: ∫₁^e (x / 2) dx = [ x² / 4 ]₁^e = (e² / 4) - (1 / 4).",
        "6) حساب الفرق النهائي: I = e²/2 - (e²/4 - 1/4) = 2e²/4 - e²/4 + 1/4 = (e² + 1) / 4."
      ]
    },
    isomorphicRetest: {
      question: "احسب التكامل J = ∫₀^1 (2x + 1) · e^x dx باستعمال المكاملة بالتجزئة.",
      options: [
        { id: "iso_a", text: "J = e + 1", correct: true },
        { id: "iso_b", text: "J = 2e - 1", correct: false },
        { id: "iso_c", text: "J = 3e - 2", correct: false },
        { id: "iso_d", text: "J = e - 1", correct: false }
      ],
      repairGuide: "نضع u(x) = 2x + 1 => u'(x) = 2، ونضع v'(x) = e^x => v(x) = e^x. إذن J = [(2x + 1) e^x]₀^1 - ∫₀^1 2 e^x dx = (3e - 1) - [2 e^x]₀^1 = 3e - 1 - (2e - 2) = e + 1."
    }
  }
};

export function getMathTerm2Bundle(skillId: string): SkillLearningBundle | null {
  return MATH_TERM2_SCIENCES_BUNDLE[skillId] || null;
}
