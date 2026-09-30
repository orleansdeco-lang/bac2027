/**
 * SHATER BAC — Diwan Multiplayer Challenges Bank
 * Fast-paced questions for in-table real-time multiplayer showdowns (Students vs Students).
 */

import { DiwanGameQuestion, DiwanGameType } from "@/types/diwan";

export const DIWAN_MULTIPLAYER_QUESTIONS: Record<string, DiwanGameQuestion[]> = {
  math: [
    {
      id: "mg-math-1",
      prompt_ar: "ما هي نهاية المتتالية (Un) حيث Un = (5n² - 2) / (n² + 4) عندما يؤول n إلى +∞؟",
      options: ["+∞", "5", "0", "1/5"],
      correctIndex: 1,
      explanation_ar: "نأخذ حاصل قسمة الحدين الأعلى درجة: 5n² / n² = 5 مباشرة.",
      timeLimitSeconds: 20,
      subject: "math",
    },
    {
      id: "mg-math-2",
      prompt_ar: "مشتقة الدالة f(x) = e^(2x - 3) على ℝ هي:",
      options: ["e^(2x - 3)", "2 · e^(2x - 3)", "(2x - 3) · e^(2x - 3)", "-2 · e^(2x - 3)"],
      correctIndex: 1,
      explanation_ar: "مشتقة e^u هي u' · e^u، ومع u(x) = 2x - 3 فإن u' = 2.",
      timeLimitSeconds: 20,
      subject: "math",
    },
    {
      id: "mg-math-3",
      prompt_ar: "إذا كانت f(1) = -2 و f(3) = 4 وكانت f مستمرة ورتيبة تماماً على [1, 3]، فكم حلاً للمعادلة f(x) = 0؟",
      options: ["لا يوجد حل", "حل وحيد تماماً", "حلان", "عدد غير منته من الحلول"],
      correctIndex: 1,
      explanation_ar: "حسب مبرهنة القيم المتوسطة، بما أن f مستمرة ورتيبة تماماً و f(1)·f(3) < 0، يوجد حل وحيد تماماً.",
      timeLimitSeconds: 20,
      subject: "math",
    },
    {
      id: "mg-math-4",
      prompt_ar: "نهاية ln(x) / x عندما يؤول x إلى +∞ تساوي:",
      options: ["+∞", "1", "0", "-∞"],
      correctIndex: 2,
      explanation_ar: "نهاية شهيرة للتزايد المقارن: x ينمو أسرع بكثير من ln(x)، إذن النتيجة 0.",
      timeLimitSeconds: 20,
      subject: "math",
    },
    {
      id: "mg-math-5",
      prompt_ar: "المستقيم المقارب الأفقي لمنحنى الدالة f(x) = (2x + 1) / (x - 3) عند اللانهاية معادلته:",
      options: ["y = 2", "x = 3", "y = -1/3", "x = 2"],
      correctIndex: 0,
      explanation_ar: "lim 2x / x = 2، إذن المستقيم y = 2 هو مقارب أفقي بجوار ±∞.",
      timeLimitSeconds: 20,
      subject: "math",
    },
  ],

  physics: [
    {
      id: "mg-phys-1",
      prompt_ar: "ما هي الوحدة الدولية لثابت الزمن τ في الدارة RC لشحن مكثفة؟",
      options: ["الفولت (V)", "الثانية (s)", "الأوم (Ω)", "الفاراد (F)"],
      correctIndex: 1,
      explanation_ar: "التحليل البعدي لـ τ = RC يعطي بُعد الزمن، وحدته الدولية هي الثانية (s).",
      timeLimitSeconds: 20,
      subject: "physics",
    },
    {
      id: "mg-phys-2",
      prompt_ar: "عند اللحظة t = 5τ، نسبة شحن المكثفة تكون تقريباً:",
      options: ["50%", "63%", "99%", "100% تماماً"],
      correctIndex: 2,
      explanation_ar: "عند t = 5τ تبلغ شحنة المكثفة حوالي 99% من قيمتها الأعظمية ونعتبر النظام دائم.",
      timeLimitSeconds: 20,
      subject: "physics",
    },
    {
      id: "mg-phys-3",
      prompt_ar: "النشاط الإشعاعي A(t) لعينة مشعة يُقاس في النظام الدولي بوحدة:",
      options: ["الجول (J)", "البكريل (Bq)", "الكوري (Ci)", "المول (mol)"],
      correctIndex: 1,
      explanation_ar: "الوحدة الدولية للنشاط الإشعاعي هي البكريل (Bq) ويمثل تفككاً واحداً في الثانية.",
      timeLimitSeconds: 20,
      subject: "physics",
    },
    {
      id: "mg-phys-4",
      prompt_ar: "في المعايرة اللونية، يُعرّف التكافؤ بأنه اللحظة التي يكون فيها المزيج التفاعلي:",
      options: ["في حالة توقف", "ستوكيومترياً تماماً", "فائضاً في المتفاعل المعاير", "حمضياً دائماً"],
      correctIndex: 1,
      explanation_ar: "التكافؤ هو اللحظة التي يُستهلك فيها المتفاعلان وفق المعاملات الستوكيومترية للموازنة.",
      timeLimitSeconds: 20,
      subject: "physics",
    },
  ],

  sciences: [
    {
      id: "mg-sci-1",
      prompt_ar: "المقر الخلوي الدقيق لعملية استنساخ الـ ARNm عند حقيقيات النوى هو:",
      options: ["الهيولى", "النواة", "جهاز غولجي", "الريبوزوم"],
      correctIndex: 1,
      explanation_ar: "تتم عملية الاستنساخ داخل النواة انطلاقاً من إحدى سلسلتي الـ ADN بواسطة إنزيم ARN بوليميراز.",
      timeLimitSeconds: 20,
      subject: "sciences",
    },
    {
      id: "mg-sci-2",
      prompt_ar: "رامزة الانطلاق الموحدة في الترجمة الوراثية هي AUG وتوافق الحمض الأميني:",
      options: ["الفالين", "الميثيونين", "اللايزين", "الألانين"],
      correctIndex: 1,
      explanation_ar: "الرامزة AUG تشفر دائماً للحمض الأميني ميثيونين (Met) في بداية السلسلة.",
      timeLimitSeconds: 20,
      subject: "sciences",
    },
    {
      id: "mg-sci-3",
      prompt_ar: "تتميز الإنزيمات بنوعية مزدوجة بالنسبة لـ:",
      options: ["درجة الحرارة و pH", "مادة التفاعل ونوع التفاعل", "الخلية والعضو", "التركيز والزمن"],
      correctIndex: 1,
      explanation_ar: "الإنزيم نوعي اتجاه الركيزة (مادة التفاعل) ونوعي اتجاه نوع التفاعل الكيميائي المحفز.",
      timeLimitSeconds: 20,
      subject: "sciences",
    },
  ],

  history_geo: [
    {
      id: "mg-hist-1",
      prompt_ar: "انعقد مؤتمر الصومام التاريخي للثورة التحريرية الجزائرية في تاريخ:",
      options: ["1 نوفمبر 1954", "20 أوت 1955", "20 أوت 1956", "19 مارس 1962"],
      correctIndex: 2,
      explanation_ar: "انعقد مؤتمر الصومام بقرية إيفري في 20 أوت 1956 وأعاد تنظيم وتأطير الثورة التحريرية.",
      timeLimitSeconds: 20,
      subject: "history_geo",
    },
    {
      id: "mg-hist-2",
      prompt_ar: "تأسست المنظمة الخاصة (OS) لإعداد الكفاح المسلح في تاريخ:",
      options: ["15-16 فيفري 1947", "8 ماي 1945", "23 مارس 1954", "10 أوت 1954"],
      correctIndex: 0,
      explanation_ar: "أُنشئت المنظمة الخاصة في مؤتمر حركة انتصار الحريات الديمقراطية يومي 15-16 فيفري 1947.",
      timeLimitSeconds: 20,
      subject: "history_geo",
    },
    {
      id: "mg-hist-3",
      prompt_ar: "مبدأ ترومان 1947 في الحرب الباردة كان عبارة عن:",
      options: ["حلف عسكري نووي", "مساعدات مالية لدول أوروبا المهددة بالشيوعية", "معاهدة سلام مع السوفيات", "إنزال عسكري في آسيا"],
      correctIndex: 1,
      explanation_ar: "مشروع ترومان في مارس 1947 قدم 400 مليون دولار لليونان وتركيا لمحاصرة المد الشيوعي.",
      timeLimitSeconds: 20,
      subject: "history_geo",
    },
  ],

  philosophy: [
    {
      id: "mg-philo-1",
      prompt_ar: "الفيلسوف القائل بأن «الدهشة هي أصل كل تفلسف وتفكير» هو:",
      options: ["ديكارت", "أرسطو", "كانط", "نيتشه"],
      correctIndex: 1,
      explanation_ar: "أرسطو في كتابه ما وراء الطبيعة بيّن أن الدهشة هي الباعث الأول للإنسان على التفلسف.",
      timeLimitSeconds: 20,
      subject: "philosophy",
    },
    {
      id: "mg-philo-2",
      prompt_ar: "العلاقة المنطقية بين المشكلة والإشكالية هي علاقة:",
      options: ["انفصال وتضاد تام", "احتواء وتداخل: المشكلة جزء من الإشكالية", "تطابق تام ومترادف", "تناقض يستحيل جمعهما"],
      correctIndex: 1,
      explanation_ar: "الإشكالية قضية فلسفية كلية معقدة تحتوي في طياتها عدة مشكلات فرعية جزئية.",
      timeLimitSeconds: 20,
      subject: "philosophy",
    },
  ],

  arabic: [
    {
      id: "mg-arab-1",
      prompt_ar: "في شعر المنفى والحنين (مثل البارودي وأحمد شوقي)، ينتمي النص إلى مدرسة:",
      options: ["الرابطة القلمية", "الديوان", "الإحياء والبعث (الكلاسيكية)", "أبولو"],
      correctIndex: 2,
      explanation_ar: "البارودي وشوقي من رواد مدرسة الإحياء والبعث الكلاسيكية التي تحاكي فحول الشعر القديم.",
      timeLimitSeconds: 20,
      subject: "arabic",
    },
    {
      id: "mg-arab-2",
      prompt_ar: "إعراب «إذا» الفجائية في جملة: «خرجتُ فإذا المطرُ هاطلٌ» هو:",
      options: ["ظرف زمان متضمن معنى الشرط", "حرف فجاءة مبني لا محل له من الإعراب", "اسم شرط جازم", "مفعول فيه منصوب"],
      correctIndex: 1,
      explanation_ar: "إذا الفجائية حرف مبني على السكون لا محل له من الإعراب وتأتي غالباً بعد الفاء الرابطة.",
      timeLimitSeconds: 20,
      subject: "arabic",
    },
  ],
};

/**
 * Helper to fetch a randomized round of multiplayer questions for a table
 */
export function getMultiplayerRoundQuestions(subject: string, count: number = 4): DiwanGameQuestion[] {
  const bank = DIWAN_MULTIPLAYER_QUESTIONS[subject] || DIWAN_MULTIPLAYER_QUESTIONS.math;
  const shuffled = [...bank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
