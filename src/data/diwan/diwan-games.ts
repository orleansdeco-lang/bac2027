/**
 * SHATER BAC — Diwan Multiplayer Challenges Bank
 * 
 * Supports the 5 extensible game types for Algerian BAC students:
 * 1. SPEED_RUSH (أسرع واحد): Single question, first correct answer immediately wins.
 * 2. TRUE_FALSE_BLITZ (صح ولا خطأ): Rapid-fire true/false statements, 10-15s.
 * 3. BRAIN_RUSH (تفكير سريع): Quick logic, deduction, and units.
 * 4. BAC_SPRINT (سباق المنهاج): Direct exam syllabus multiple-choice challenge.
 * 5. MEMORY_BATTLE (معركة الذاكرة): 3-5 items shown for 6 seconds, then prompt tests memory.
 */

import { DiwanGameQuestion, DiwanGameType } from "@/types/diwan";

// ============================================================================
// 1. SPEED RUSH (أسرع واحد — أول إجابة صحيحة تكسب الجولة)
// ============================================================================
export const SPEED_RUSH_QUESTIONS: Record<string, DiwanGameQuestion[]> = {
  math: [
    {
      id: "sr-math-1",
      prompt_ar: "احسب ذهنياً: ما هي نهاية (3n² - 5) / (2n² + 7) عندما يؤول n إلى +∞؟",
      options: ["0", "3/2", "+∞", "1"],
      correctIndex: 1,
      explanation_ar: "نهاية حاصل قسمة أعلى حدين: 3n² / 2n² = 3/2.",
      timeLimitSeconds: 20,
      subject: "math",
      gameType: "SPEED_RUSH",
    },
    {
      id: "sr-math-2",
      prompt_ar: "إذا كانت f(x) = ln(4x)، فما هي قيمة f'(1)؟",
      options: ["4", "1", "1/4", "ln(4)"],
      correctIndex: 1,
      explanation_ar: "f'(x) = 4/(4x) = 1/x، وعند x = 1 المشتقة تساوي 1.",
      timeLimitSeconds: 20,
      subject: "math",
      gameType: "SPEED_RUSH",
    },
    {
      id: "sr-math-3",
      prompt_ar: "متتالية حسابية حدها الأول u₁ = 3 وأساسها r = 4. ما هو الحد u₅؟",
      options: ["19", "23", "15", "16"],
      correctIndex: 0,
      explanation_ar: "u₅ = u₁ + 4r = 3 + 4(4) = 19.",
      timeLimitSeconds: 20,
      subject: "math",
      gameType: "SPEED_RUSH",
    },
  ],
  physics: [
    {
      id: "sr-phys-1",
      prompt_ar: "دارة RC: مكثفة سعتها C = 100 µF وناقل أومي R = 10 kΩ. ثابت الزمن τ هو:",
      options: ["1 ثانية", "0.1 ثانية", "10 ثوانٍ", "0.01 ثانية"],
      correctIndex: 0,
      explanation_ar: "τ = R · C = 10⁴ · 10⁻⁴ = 1 s.",
      timeLimitSeconds: 20,
      subject: "physics",
      gameType: "SPEED_RUSH",
    },
    {
      id: "sr-phys-2",
      prompt_ar: "في المتابعة بالناقلية، وحدة الناقلية النوعية σ في الجملة الدولية هي:",
      options: ["S / m", "S · m", "Ω / m", "V / m"],
      correctIndex: 0,
      explanation_ar: "وحدة الناقلية النوعية هي السيمنس على المتر (S/m أو S·m⁻¹).",
      timeLimitSeconds: 20,
      subject: "physics",
      gameType: "SPEED_RUSH",
    },
  ],
  sciences: [
    {
      id: "sr-sci-1",
      prompt_ar: "كم عدد القواعد الآزوتية في رامزة وراثية تشفر لحمض أميني واحد؟",
      options: ["3 قواعد", "4 قواعد", "2 قاعدتان", "1 قاعدة واحدة"],
      correctIndex: 0,
      explanation_ar: "الرامزة الثلاثية تتكون من 3 نكليوتيدات (قواعد آزوتية).",
      timeLimitSeconds: 15,
      subject: "sciences",
      gameType: "SPEED_RUSH",
    },
  ],
};

// ============================================================================
// 2. TRUE FALSE BLITZ (صح ولا خطأ — 10 ثوانٍ خاطفة)
// ============================================================================
export const TRUE_FALSE_QUESTIONS: Record<string, DiwanGameQuestion[]> = {
  math: [
    {
      id: "tf-math-1",
      prompt_ar: "كل متتالية متزايدة ومحدودة من الأعلى هي متتالية متقاربة حتماً.",
      options: ["صح ✅", "خطأ ❌"],
      correctIndex: 0,
      explanation_ar: "مبرهنة التقارب المونوتوني: التزايد والمحدودية من الأعلى يضمنان التقارب دائماً.",
      timeLimitSeconds: 12,
      subject: "math",
      gameType: "TRUE_FALSE_BLITZ",
    },
    {
      id: "tf-math-2",
      prompt_ar: "نهاية الدالة f(x) = e^x / x عند -∞ تساوي +∞.",
      options: ["صح ✅", "خطأ ❌"],
      correctIndex: 1,
      explanation_ar: "عند -∞: e^x تؤول لـ 0، و x تؤول لـ -∞، إذن حاصل القسمة 0/-∞ = 0 وليس +∞.",
      timeLimitSeconds: 12,
      subject: "math",
      gameType: "TRUE_FALSE_BLITZ",
    },
    {
      id: "tf-math-3",
      prompt_ar: "إذا كان أساس المتتالية الهندسية q = -0.5، فإن نهايتها عند +∞ تساوي 0.",
      options: ["صح ✅", "خطأ ❌"],
      correctIndex: 0,
      explanation_ar: "بما أن |q| < 1، فإن lim q^n = 0 وبالتالي المتتالية متقاربة نحو 0.",
      timeLimitSeconds: 12,
      subject: "math",
      gameType: "TRUE_FALSE_BLITZ",
    },
  ],
  physics: [
    {
      id: "tf-phys-1",
      prompt_ar: "التوتر بين طرفي مكثفة مفرغة في اللحظة t = 0 مباشرة بعد غلق القاطعة يساوي E.",
      options: ["صح ✅", "خطأ ❌"],
      correctIndex: 1,
      explanation_ar: "خطأ، التوتر بين طرفي المكثفة مستمر ولا يتغير آنياً: u_C(0) = 0 V.",
      timeLimitSeconds: 12,
      subject: "physics",
      gameType: "TRUE_FALSE_BLITZ",
    },
    {
      id: "tf-phys-2",
      prompt_ar: "زمن نصف العمر t₁/₂ لعينة مشعة يتناقص كلما انخفضت درجة حرارة المخبر.",
      options: ["صح ✅", "خطأ ❌"],
      correctIndex: 1,
      explanation_ar: "خطأ، التفكك الإشعاعي ظاهرة نووية تلقائية لا تتأثر بالعوامل الفيزيائية كالحرارة والضغط.",
      timeLimitSeconds: 12,
      subject: "physics",
      gameType: "TRUE_FALSE_BLITZ",
    },
  ],
  history_geo: [
    {
      id: "tf-hist-1",
      prompt_ar: "أُنشئت هيئة الأمم المتحدة في عام 1945 بعد نهاية الحرب العالمية الثانية.",
      options: ["صح ✅", "خطأ ❌"],
      correctIndex: 0,
      explanation_ar: "صحيح، تأسست رسمياً في 24 أكتوبر 1945 بمؤتمر سان فرانسيسكو.",
      timeLimitSeconds: 12,
      subject: "history_geo",
      gameType: "TRUE_FALSE_BLITZ",
    },
    {
      id: "tf-hist-2",
      prompt_ar: "مؤتمر الصومام 1956 أقر أولوية السياسي على العسكري والداخل على الخارج.",
      options: ["صح ✅", "خطأ ❌"],
      correctIndex: 0,
      explanation_ar: "صحيح، هذان هما المبدآن التنظيميان الشهيران لمقررات الصومام.",
      timeLimitSeconds: 12,
      subject: "history_geo",
      gameType: "TRUE_FALSE_BLITZ",
    },
  ],
};

// ============================================================================
// 3. BRAIN RUSH (تفكير سريع واستنتاج ذكي)
// ============================================================================
export const BRAIN_RUSH_QUESTIONS: Record<string, DiwanGameQuestion[]> = {
  math: [
    {
      id: "br-math-1",
      prompt_ar: "منحنى دالة يقبل نقطة انعطاف عند x₀ = 2. هذا يعني حتماً أن:",
      options: [
        "المشتقة الأولى تنعدم وتغير إشارتها",
        "المشتقة الثانية تنعدم وتغير إشارتها عند 2",
        "الدالة غير قابلة للاشتقاق عند 2",
        "الدالة تقبل قيمة حدية عظمى",
      ],
      correctIndex: 1,
      explanation_ar: "الشرط الكافي لنقطة الانعطاف هو انعدام المشتقة الثانية f''(x) وتغيير إشارتها.",
      timeLimitSeconds: 25,
      subject: "math",
      gameType: "BRAIN_RUSH",
    },
    {
      id: "br-math-2",
      prompt_ar: "دالة تحقق f(-x) = -f(x) لكل x ∈ ℝ، ومنحناها يمر بالنقطة A(2, 5). النقطة التي يمر بها حتماً هي:",
      options: ["(-2, 5)", "(2, -5)", "(-2, -5)", "(0, 5)"],
      correctIndex: 2,
      explanation_ar: "الدالة فردية ومتناظرة بالنسبة للمبدأ: f(-2) = -f(2) = -5، إذن تمر بـ (-2, -5).",
      timeLimitSeconds: 25,
      subject: "math",
      gameType: "BRAIN_RUSH",
    },
  ],
  physics: [
    {
      id: "br-phys-1",
      prompt_ar: "في تفاعل أسترة كيميائي، للحصول على مردود يفوق 67% لكحول أولي نلجأ إلى:",
      options: [
        "إضافة وسيط حمضي فقط",
        "استعمال كلور البيروفوسفات",
        "استبدال الحمض الكربوكسيلي بأنهيدريد الحمض",
        "خفض درجة الحرارة",
      ],
      correctIndex: 2,
      explanation_ar: "أنهيدريد الحمض يجعل التفاعل تاماً وسريعاً وناشراً للحرارة مع مردود يقارب 100%.",
      timeLimitSeconds: 25,
      subject: "physics",
      gameType: "BRAIN_RUSH",
    },
  ],
};

// ============================================================================
// 4. BAC SPRINT (سباق البكالوريا والمنهاج الوزاري)
// ============================================================================
export const BAC_SPRINT_QUESTIONS: Record<string, DiwanGameQuestion[]> = {
  math: [
    {
      id: "bs-math-1",
      prompt_ar: "إذا كانت (Un) متتالية معرفة بـ U₀ = 1 و Un+1 = 2Un + 3، فإن المتتالية Vn = Un + 3 هي متتالية هندسية أساسها:",
      options: ["q = 3", "q = 2", "q = 1/2", "q = 5"],
      correctIndex: 1,
      explanation_ar: "Vn+1 = Un+1 + 3 = 2Un + 6 = 2(Un + 3) = 2Vn، إذن الأساس q = 2.",
      timeLimitSeconds: 30,
      subject: "math",
      gameType: "BAC_SPRINT",
    },
    {
      id: "bs-math-2",
      prompt_ar: "حل المعادلة التفاضلية y' + 3y = 0 هو مجموعة الدوال المعرفة على ℝ بـ:",
      options: ["f(x) = C · e^(3x)", "f(x) = C · e^(-3x)", "f(x) = -3x + C", "f(x) = e^(-3x) + C"],
      correctIndex: 1,
      explanation_ar: "حلول y' = ay هي f(x) = C·e^(ax)، وهنا a = -3 فتكون f(x) = C·e^(-3x).",
      timeLimitSeconds: 30,
      subject: "math",
      gameType: "BAC_SPRINT",
    },
  ],
  sciences: [
    {
      id: "bs-sci-1",
      prompt_ar: "العنصر الذي ينقل الأحماض الأمينية إلى الريبوزوم أثناء عملية الترجمة هو:",
      options: ["ARNm", "ARNt", "ARNr", "إنزيم التنشيط"],
      correctIndex: 1,
      explanation_ar: "الـ ARNt (حمض ريبي نووي ناقل) هو المسؤول عن تثبيت ونقل الحمض الأميني الموافق لمضاد الرامزة.",
      timeLimitSeconds: 25,
      subject: "sciences",
      gameType: "BAC_SPRINT",
    },
  ],
  philosophy: [
    {
      id: "bs-philo-1",
      prompt_ar: "في فلسفة العلوم، صاحب مبدأ «قابلية التكذيب أو التفنيد» كمعيار للتمييز بين العلم واللاعلم هو:",
      options: ["كارل بوبر", "فرانسيس بيكون", "كلود برنار", "أوغست كونت"],
      correctIndex: 0,
      explanation_ar: "كارل بوبر هو فيلسوف العقلانية النقدية وصاحب معيار القابلية للتفنيد (Falsifiability).",
      timeLimitSeconds: 25,
      subject: "philosophy",
      gameType: "BAC_SPRINT",
    },
  ],
};

// ============================================================================
// 5. MEMORY BATTLE (معركة الذاكرة — عناصر تظهر لـ 6 ثوانٍ ثم سؤال عنها)
// ============================================================================
export const MEMORY_BATTLE_QUESTIONS: Record<string, DiwanGameQuestion[]> = {
  math: [
    {
      id: "mb-math-1",
      prompt_ar: "في البطاقة السابقة: ما هي العبارة التي كانت مكتوبة في الترتيب (رقم 3)؟",
      memoryItems: [
        "1. المتتالية الحسابية: Un = Up + (n-p)r",
        "2. مبرهنة التزايد المقارن: lim e^x / x = +∞",
        "3. نهاية شهيرة: lim (e^x - 1) / x = 1",
        "4. التكامل بالتجزئة: ∫u'v = uv - ∫uv'",
      ],
      memoryDurationSeconds: 6,
      options: [
        "المتتالية الحسابية",
        "نهاية شهيرة: lim (e^x - 1) / x = 1",
        "التكامل بالتجزئة",
        "مبرهنة التزايد المقارن",
      ],
      correctIndex: 1,
      explanation_ar: "العنصر رقم 3 كان النهاية الشهيرة المشتقة للعدد الأسي: lim (e^x - 1)/x = 1.",
      timeLimitSeconds: 20,
      subject: "math",
      gameType: "MEMORY_BATTLE",
    },
  ],
  physics: [
    {
      id: "mb-phys-1",
      prompt_ar: "من بين الوحدات الفيزيائية التي ظهرت في بطاقة الذاكرة: أي وحدة قاست النشاط الإشعاعي؟",
      memoryItems: [
        "• ثابت الزمن τ: الثانية [s]",
        "• الناقلية G: السيمنس [S]",
        "• النشاط الإشعاعي A: البكريل [Bq]",
        "• سعة المكثفة C: الفاراد [F]",
      ],
      memoryDurationSeconds: 6,
      options: ["الفاراد [F]", "السيمنس [S]", "البكريل [Bq]", "الأوم [Ω]"],
      correctIndex: 2,
      explanation_ar: "النشاط الإشعاعي مقاس بالبكريل (Bq) الذي يمثل تفككاً نووياً واحداً في الثانية.",
      timeLimitSeconds: 20,
      subject: "physics",
      gameType: "MEMORY_BATTLE",
    },
  ],
  history_geo: [
    {
      id: "mb-hist-1",
      prompt_ar: "أي حدث من أحداث الثورة التحريرية كان مؤرخاً في سنة 1956 في البطاقة؟",
      memoryItems: [
        "1954: اندلاع الثورة التحريرية في 1 نوفمبر",
        "1955: هجومات الشمال القسنطيني في 20 أوت",
        "1956: انعقاد مؤتمر الصومام التاريخي",
        "1962: إعلان الاستقلال الوطني ووقف القتال",
      ],
      memoryDurationSeconds: 6,
      options: [
        "اندلاع الثورة التحريرية",
        "هجومات الشمال القسنطيني",
        "انعقاد مؤتمر الصومام التاريخي",
        "تأسيس الحكومة المؤقتة",
      ],
      correctIndex: 2,
      explanation_ar: "مؤتمر الصومام انعقد في 20 أوت 1956 بقرية إيفري أوزلاقن.",
      timeLimitSeconds: 20,
      subject: "history_geo",
      gameType: "MEMORY_BATTLE",
    },
  ],
};

// ============================================================================
// MASTER RESOLVER: Get questions tailored to Subject, Game Type, and Topic
// ============================================================================
export function getChallengeQuestions(
  subject: string,
  gameType: DiwanGameType = "SPEED_RUSH",
  count: number = 3
): DiwanGameQuestion[] {
  let bank: DiwanGameQuestion[] = [];

  switch (gameType) {
    case "SPEED_RUSH":
      bank = SPEED_RUSH_QUESTIONS[subject] || SPEED_RUSH_QUESTIONS.math;
      break;
    case "TRUE_FALSE_BLITZ":
      bank = TRUE_FALSE_QUESTIONS[subject] || TRUE_FALSE_QUESTIONS.math;
      break;
    case "BRAIN_RUSH":
    case "LOGIC_SPRINT":
      bank = BRAIN_RUSH_QUESTIONS[subject] || BRAIN_RUSH_QUESTIONS.math;
      break;
    case "BAC_SPRINT":
    case "FORMULA_SHOWDOWN":
      bank = BAC_SPRINT_QUESTIONS[subject] || BAC_SPRINT_QUESTIONS.math;
      break;
    case "MEMORY_BATTLE":
      bank = MEMORY_BATTLE_QUESTIONS[subject] || MEMORY_BATTLE_QUESTIONS.math;
      break;
    default:
      bank = SPEED_RUSH_QUESTIONS[subject] || SPEED_RUSH_QUESTIONS.math;
  }

  // Fallback to speed rush if bank empty
  if (!bank || bank.length === 0) {
    bank = SPEED_RUSH_QUESTIONS.math;
  }

  const shuffled = [...bank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Backward-compatible alias
export function getMultiplayerRoundQuestions(subject: string, count: number = 4): DiwanGameQuestion[] {
  return getChallengeQuestions(subject, "BAC_SPRINT", count);
}
