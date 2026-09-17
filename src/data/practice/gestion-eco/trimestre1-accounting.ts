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
      explanation_ar: "المبلغ خارج الرسم HT = 238,000 / 1.19 = 200,000 دج. خسارة القيمة = 200,000 × 0.40 = 80,000 دج."
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
