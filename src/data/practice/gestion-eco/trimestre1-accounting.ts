// src/data/practice/gestion-eco/trimestre1-accounting.ts

import { PracticeQuestion, SuspectedErrorType } from "@/types/mission";
import { SubjectId, StreamId } from "@/types/education";

export interface DiagnosticPracticeItem {
  id: string;
  skillId: string;
  subjectId: string;
  streamId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompt_ar: string;
  options_ar?: string[];
  correctAnswer_ar: string;
  explanation_ar: string;
  trapType: "misconception" | "calculation" | "methodology" | "reading_error";
  commonTrap_ar: string;
  twinQuestion: {
    id: string;
    prompt_ar: string;
    options_ar?: string[];
    correctAnswer_ar: string;
    explanation_ar: string;
  };
}

export const gestionEcoT1Practice: DiagnosticPracticeItem[] = [
  // ── 1. الاهتلاك الخطي وقسط الاهتلاك المشترك ──
  {
    id: "diag_acc_amort_linear_01",
    skillId: "mgmt_accounting_amortization_provisions",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "حازت مؤسسة على معدات مكتب بقيمة 500,000 دج بتاريخ 01/07/N، مدة نفعيتها 5 سنوات وتُهتلك خطياً. ما هي قيمة قسط الاهتلاك الخاص بسنة الحيازة (سنة N)؟",
    options_ar: [
      "50,000 دج",
      "100,000 دج",
      "25,000 دج",
      "75,000 دج"
    ],
    correctAnswer_ar: "50,000 دج",
    explanation_ar: "معدل الاهتلاك t = 100 / 5 = 20%. قسط الاهتلاك السنوي هو 500,000 × 0.20 = 100,000 دج. بما أن الحيازة تمت في 01/07، فإن قسط السنة الأولى يخص 6 أشهر فقط: A_N = 100,000 × (6/12) = 50,000 دج.",
    trapType: "calculation",
    commonTrap_ar: "نسيان تطبيق قاعدة التناسب الزمني (Prorata temporis) وحساب قسط سنة كاملة (100,000 دج) رغم أن الشراء تم في منتصف السنة.",
    twinQuestion: {
      id: "twin_acc_amort_linear_01",
      prompt_ar: "اقتنت مؤسسة سيارة نفعية بمبلغ 1,200,000 دج بتاريخ 01/10/N تهتلك بمعدل خطي 20%. ما هو قسط الاهتلاك المسجل في 31/12/N؟",
      options_ar: [
        "60,000 دج",
        "240,000 دج",
        "120,000 دج",
        "80,000 دج"
      ],
      correctAnswer_ar: "60,000 دج",
      explanation_ar: "القسط السنوي: 1,200,000 × 0.20 = 240,000 دج. الأشهر المستعملة في سنة N هي (أكتوبر، نوفمبر، ديسمبر = 3 أشهر). القسط = 240,000 × (3/12) = 60,000 دج."
    }
  },

  // ── 2. خسارة القيمة عن التثبيتات وإعادة الجدولة ──
  {
    id: "diag_acc_depreciation_test_01",
    skillId: "mgmt_accounting_amortization_provisions",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "advanced",
    prompt_ar: "شاحنة قيمتها الأصلية 2,000,000 دج بمعدل اهتلاك 20% خطياً. في 31/12/N (بعد سنتين كاملتين من الاستعمال) قُدر سعر بيعها الصافي المحتمل بمبلغ 1,050,000 دج. ما هو قيد التسوية الواجب تسجيله في اليومية؟",
    options_ar: [
      "تسجيل خسارة قيمة بمبلغ 150,000 دج بجعل حـ/681 مديناً وحـ/2918 دائناً",
      "تسجيل خسارة قيمة بمبلغ 150,000 دج بجعل حـ/2818 مديناً وحـ/681 دائناً",
      "لا نسجل أي خسارة لأن القيمة المحاسبية أكبر من سعر السوق",
      "تسجيل قسط اهتلاك إضافي بمبلغ 950,000 دج"
    ],
    correctAnswer_ar: "تسجيل خسارة قيمة بمبلغ 150,000 دج بجعل حـ/681 مديناً وحـ/2918 دائناً",
    explanation_ar: "مجموع الاهتلاكات بعد سنتين: ΣA = 2,000,000 × 0.20 × 2 = 800,000 دج. القيمة المحاسبية الصافية: VNC = 2,000,000 - 800,000 = 1,200,000 دج. سعر السوق PVN = 1,050,000 دج. بما أن PVN < VNC، فهناك خسارة قيمة: PV = 1,200,000 - 1,050,000 = 150,000 دج. التسجيل: مدين 681 ودائن 2918.",
    trapType: "methodology",
    commonTrap_ar: "الخلط بين حساب الاهتلاك المتراكم (حـ/28) وحساب خسارة القيمة (حـ/29) أو عكس أطراف القيد المحاسبي.",
    twinQuestion: {
      id: "twin_acc_depreciation_test_01",
      prompt_ar: "آلة صناعية تكلفتها 800,000 دج و VNC في نهاية السنة الثالثة تساوي 320,000 دج. أظهر اختبار خسارة القيمة أن القيمة القابلة للتحصيل تساوي 270,000 دج. ما هي قيمة الخسارة المسجلة في حـ/2915؟",
      options_ar: [
        "50,000 دج",
        "320,000 دج",
        "270,000 دج",
        "لا توجد خسارة"
      ],
      correctAnswer_ar: "50,000 دج",
      explanation_ar: "خسارة القيمة = VNC - القيمة القابلة للتحصيل = 320,000 - 270,000 = 50,000 دج."
    }
  },

  // ── 3. تسوية حسابات الزبائن المشكوك فيهم ──
  {
    id: "diag_acc_clients_doubtful_01",
    skillId: "mgmt_accounting_amortization_provisions",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "advanced",
    prompt_ar: "الزبون 'سمير' مدين بمبلغ 119,000 دج (TTC متضمن الرسم 19%). قُدرت نسبة احتمال عدم التسديد بـ 30%. ما هو مبلغ خسارة القيمة الواجب تكوينه لأول مرة؟",
    options_ar: [
      "30,000 دج",
      "35,700 دج",
      "19,000 دج",
      "22,610 دج"
    ],
    correctAnswer_ar: "30,000 دج",
    explanation_ar: "خسارة القيمة في المحاسبة تُحسب دوماً على المبلغ خارج الرسم (HT). المبلغ خارج الرسم = 119,000 / 1.19 = 100,000 دج. خسارة القيمة = 100,000 × 0.30 = 30,000 دج.",
    trapType: "misconception",
    commonTrap_ar: "حساب نسبة خسارة القيمة مباشرة على المبلغ الإجمالي متضمن الرسم (119,000 × 0.30 = 35,700 دج) وهو خطأ يرفضه المصحح لأن الرسم TVA لا تتحمله المؤسسة بل الدولة.",
    twinQuestion: {
      id: "twin_acc_clients_doubtful_01",
      prompt_ar: "دين الزبون 'كريم' يبلغ 238,000 دج TTC (معدل الرسم 19%). إذا أعلنت المؤسسة عن احتمال خسارة 40% من دينه، فما هو مبلغ الخسارة المحسوب خارج الرسم؟",
      options_ar: [
        "80,000 دج",
        "95,200 دج",
        "40,000 دج",
        "45,220 دج"
      ],
      correctAnswer_ar: "80,000 دج",
      explanation_ar: "المبلغ خارج الرسم = 238,000 / 1.19 = 200,000 دج. مبلغ الخسارة المحسوب = 200,000 × 0.40 = 80,000 دج.",
    },
  },

  // ── 4. الاهتلاك المتناقص (أستاذ ياسين حجام وأستاذ توام عبدالصمد) ──
  {
    id: "diag_acc_amort_degressive_hadjem_01",
    skillId: "acc_depreciation_linear_degressive",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "اقتنت مؤسسة معدات صناعية بقيمة 360,000 دج بتاريخ 02/01/2015 مدة نفعيتها 5 سنوات وتُهتلك بطريقة الاهتلاك المتناقص. ما هو قسط اهتلاك السنة الأولى وقيد تسويته في 31/12/2015؟",
    options_ar: [
      "144,000 دج (مدين ح/681، دائن ح/2815)",
      "72,000 دج (مدين ح/681، دائن ح/2815)",
      "180,000 دج (مدين ح/681، دائن ح/215)",
      "144,000 دج (مدين ح/2815، دائن ح/681)"
    ],
    correctAnswer_ar: "144,000 دج (مدين ح/681، دائن ح/2815)",
    explanation_ar: "معدل الاهتلاك الخطي t = 100/5 = 20%. المعامل الضريبي لـ 5 سنوات = 2. معدل الاهتلاك المتناقص t' = 20% × 2 = 40%. قسط السنة الأولى: A1 = 360,000 × 40% = 144,000 دج. القيد: مدين ح/681 ودائن ح/2815.",
    trapType: "methodology",
    commonTrap_ar: "تطبيق المعدل الخطي (20%) بدلاً من المتناقص (40%) أو عكس طرفي القيد المحاسبي بين المدين والدائن.",
    twinQuestion: {
      id: "twin_acc_amort_degressive_hadjem_01",
      prompt_ar: "اقتنت مؤسسة سيارة نفعية بقيمة 180,000 دج بتاريخ 01/01/2015 مدتها النفعية 5 سنوات وتُهتلك متناقصاً (t' = 40%). كم يبلغ قسط اهتلاك السنة الأولى في 31/12/2015؟",
      options_ar: [
        "72,000 دج",
        "36,000 دج",
        "90,000 دج",
        "45,000 دج"
      ],
      correctAnswer_ar: "72,000 دج",
      explanation_ar: "قسط السنة الأولى = 180,000 × 40% = 72,000 دج."
    }
  },

  // ── 5. الاهتلاك المتزايد وقانون المقام (أستاذ ياسين حجام وتوام عبدالصمد) ──
  {
    id: "diag_acc_amort_progressive_hadjem_02",
    skillId: "acc_depreciation_linear_degressive",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "اقتنت مؤسسة آلة صناعية بقيمة 96,000 دج بتاريخ 02/01/2015 مدة نفعيتها 5 سنوات تُهتلك بطريقة الاهتلاك المتزايد. ما هو قسط اهتلاك السنة الأولى المسجل في 31/12/2015؟",
    options_ar: [
      "6,400 دج",
      "19,200 دج",
      "32,000 دج",
      "12,800 دج"
    ],
    correctAnswer_ar: "6,400 دج",
    explanation_ar: "في الاهتلاك المتزايد، مقام معدل الاهتلاك S = (N × (N+1)) / 2 = (5 × 6) / 2 = 15. معدل السنة الأولى = 1/15. قسط السنة الأولى A1 = 96,000 × (1/15) = 6,400 دج.",
    trapType: "calculation",
    commonTrap_ar: "قسمة القيمة الأصلية على 5 بدلاً من تطبيق قانون مجموع أرقام السنوات (المقام S = 15).",
    twinQuestion: {
      id: "twin_acc_amort_progressive_hadjem_02",
      prompt_ar: "معدات صناعية بقيمة 400,000 دج تهتلك متزايداً على مدار 4 سنوات (S = 1+2+3+4 = 10). ما هو قسط اهتلاك السنة الثالثة؟",
      options_ar: [
        "120,000 دج",
        "40,000 دج",
        "80,000 دج",
        "160,000 دج"
      ],
      correctAnswer_ar: "120,000 دج",
      explanation_ar: "معدل السنة الثالثة هو 3/10. قسط السنة الثالثة = 400,000 × (3/10) = 120,000 دج."
    }
  },

  // ── 6. الميزانية الوظيفية ومؤشرات التوازن (بكالوريا 2019 - أستاذ عبدالخالق عودة) ──
  {
    id: "diag_acc_functional_balance_aouda_01",
    skillId: "acc_functional_balance_sheet_indicators",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "advanced",
    prompt_ar: "في ميزانية وظيفية لمؤسسة، بلغت الموارد الثابتة 7,090,000 دج والاستخدامات الثابتة 6,050,000 دج، وبلغت الأصول المتداولة للاستغلال وخارج الاستغلال 1,702,000 دج والخصوم المتداولة للاستغلال وخارج الاستغلال 1,510,000 دج. ما هي قيمتا FRNG و BFR ودلالتهما المالية؟",
    options_ar: [
      "FRNG = 1,040,000 دج و BFR = 192,000 دج (توازن مالي وأمان نقدي)",
      "FRNG = 1,040,000 دج و BFR = -192,000 دج (عجز في رأس المال)",
      "FRNG = 192,000 دج و BFR = 1,040,000 دج (اختلال هيكلي)",
      "FRNG = 848,000 دج و BFR = 1,040,000 دج (عدم كفاية الموارد)"
    ],
    correctAnswer_ar: "FRNG = 1,040,000 دج و BFR = 192,000 دج (توازن مالي وأمان نقدي)",
    explanation_ar: "FRNG = الموارد الثابتة - الاستخدامات الثابتة = 7,090,000 - 6,050,000 = 1,040,000 دج. BFR = الأصول المتداولة (استغلال + خارج استغلال) - الخصوم المتداولة (استغلال + خارج استغلال) = 1,702,000 - 1,510,000 = 192,000 دج. والخزينة الصافية TN = 1,040,000 - 192,000 = 848,000 دج (موجبة تعني فائض سيولة وأماناً مالياً).",
    trapType: "methodology",
    commonTrap_ar: "طرح الاستخدامات من الموارد بالعكس أو الخلط بين قيمتي الاستغلال والقيم الإجمالية للأصول المتداولة.",
    twinQuestion: {
      id: "twin_acc_functional_balance_aouda_01",
      prompt_ar: "إذا كانت الموارد الثابتة لمؤسسة 3,620,000 دج، الاستخدامات الثابتة 3,500,000 دج، واحتياج رأس المال العامل BFR يساوي 20,000 دج. كم تبلغ الخزينة الصافية TN؟",
      options_ar: [
        "100,000 دج",
        "120,000 دج",
        "20,000 دج",
        "140,000 دج"
      ],
      correctAnswer_ar: "100,000 دج",
      explanation_ar: "FRNG = 3,620,000 - 3,500,000 = 120,000 دج. الخزينة الصافية TN = FRNG - BFR = 120,000 - 20,000 = 100,000 دج."
    }
  },

  // ── 7. محاسبة التكاليف والنتيجة التحليلية الصافية (أستاذ حاكمي) ──
  {
    id: "diag_acc_cost_accounting_hakmi_01",
    skillId: "acc_break_even_cost_analysis",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "advanced",
    prompt_ar: "في محاسبة التكاليف، إذا بلغت النتيجة التحليلية الإجمالية لمنتجين 450,000 دج، والعناصر الإضافية 50,000 دج، والأعباء غير المعتبرة 20,000 دج. فما هي النتيجة التحليلية الصافية للمؤسسة؟",
    options_ar: [
      "480,000 دج",
      "420,000 دج",
      "380,000 دج",
      "520,000 دج"
    ],
    correctAnswer_ar: "480,000 دج",
    explanation_ar: "النتيجة التحليلية الصافية = النتيجة التحليلية الإجمالية + العناصر الإضافية - الأعباء غير المعتبرة = 450,000 + 50,000 - 20,000 = 480,000 دج (ربح تحليلي صافٍ).",
    trapType: "misconception",
    commonTrap_ar: "طرح العناصر الإضافية أو إضافة الأعباء غير المعتبرة بالخطأ؛ تذكر أن العناصر الإضافية تضاف والأعباء غير المعتبرة تخصم.",
    twinQuestion: {
      id: "twin_acc_cost_accounting_hakmi_01",
      prompt_ar: "النتيجة التحليلية الإجمالية لمنتج بلغت 200,000 دج، والعناصر الإضافية 15,000 دج، والأعباء غير المعتبرة 25,000 دج. ما هي النتيجة التحليلية الصافية؟",
      options_ar: [
        "190,000 دج",
        "210,000 دج",
        "240,000 دج",
        "160,000 دج"
      ],
      correctAnswer_ar: "190,000 دج",
      explanation_ar: "النتيجة التحليلية الصافية = 200,000 + 15,000 - 25,000 = 190,000 دج."
    }
  }
];

export function convertToPracticeQuestions(items: DiagnosticPracticeItem[]): PracticeQuestion[] {
  const result: PracticeQuestion[] = [];

  for (const item of items) {
    const diffMap: Record<string, 1 | 2 | 3> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };
    const diff = diffMap[item.difficulty] || 2;
    const mappedSubjectId = (item.subjectId === "accounting" ? "accounting_finance" : item.subjectId) as SubjectId;

    const trapToErrorType: Record<string, SuspectedErrorType> = {
      misconception: "misunderstood_concept",
      calculation: "calculation_error",
      methodology: "methodology_error",
      reading_error: "misread_question",
    };
    const suspectedErr = trapToErrorType[item.trapType] || "misunderstood_concept";

    // 1. Primary Practice Question
    const primaryOptions = (item.options_ar || []).map((opt, idx) => ({
      id: `opt-${idx + 1}`,
      text_ar: opt,
      text_fr: opt,
      ...(opt !== item.correctAnswer_ar ? { suspectedErrorType: suspectedErr } : {}),
    }));

    const correctOpt = primaryOptions.find((o) => o.text_ar === item.correctAnswer_ar);
    const correctOptId = correctOpt ? correctOpt.id : "opt-1";

    result.push({
      id: item.id,
      educationLevel: "secondary",
      examType: "bac",
      streamId: item.streamId as StreamId,
      subjectId: mappedSubjectId,
      skillId: item.skillId,
      dimension: "application",
      difficulty: diff,
      type: "mcq",
      prompt_ar: item.prompt_ar,
      prompt_fr: item.prompt_ar,
      options: primaryOptions,
      correctAnswerId: correctOptId,
      explanation_ar: item.explanation_ar,
      explanation_fr: item.explanation_ar,
      repairHint_ar: item.commonTrap_ar,
      repairHint_fr: item.commonTrap_ar,
      expectedTimeSeconds: 90,
      tags: [item.subjectId, item.skillId, item.trapType],
      version: 1,
      isRetestVariant: false,
    });

    // 2. Paired Retest Variant from twinQuestion
    const twinOptions = (item.twinQuestion.options_ar || []).map((opt, idx) => ({
      id: `opt-${idx + 1}`,
      text_ar: opt,
      text_fr: opt,
      ...(opt !== item.twinQuestion.correctAnswer_ar ? { suspectedErrorType: suspectedErr } : {}),
    }));

    const correctTwinOpt = twinOptions.find((o) => o.text_ar === item.twinQuestion.correctAnswer_ar);
    const correctTwinOptId = correctTwinOpt ? correctTwinOpt.id : "opt-1";

    result.push({
      id: item.twinQuestion.id,
      educationLevel: "secondary",
      examType: "bac",
      streamId: item.streamId as StreamId,
      subjectId: mappedSubjectId,
      skillId: item.skillId,
      dimension: "application",
      difficulty: diff,
      type: "mcq",
      prompt_ar: item.twinQuestion.prompt_ar,
      prompt_fr: item.twinQuestion.prompt_ar,
      options: twinOptions,
      correctAnswerId: correctTwinOptId,
      explanation_ar: item.twinQuestion.explanation_ar,
      explanation_fr: item.twinQuestion.explanation_ar,
      expectedTimeSeconds: 90,
      tags: [item.subjectId, item.skillId, "twin_retest"],
      version: 1,
      isRetestVariant: true,
      retestForQuestionId: item.id,
    });
  }

  return result;
}

export const GESTION_ECO_T1_PRACTICE_QUESTIONS: PracticeQuestion[] = convertToPracticeQuestions(gestionEcoT1Practice);
