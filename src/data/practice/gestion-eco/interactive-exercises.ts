/**
 * BAC Mastery — Gestion & Économie Interactive Exercises
 * Real-world Algerian Baccalaureate exercises for Accounting & Finance
 * Features:
 * - Interactive Accounting Journal (SCF)
 * - Methodological Step-by-Step Resolution
 */

import { PracticeQuestion } from "@/types/mission";
import {
  JournalEntrySolution,
  StepByStepSolution,
} from "@/types/interactive-exercise";

// ============================================================================
// 1. ACCOUNTING JOURNAL SOLUTION & EXERCISE (اهتلاك خطي لشاحنة نقل)
// ============================================================================

export const LINEAR_DEPRECIATION_JOURNAL_SOLUTION: JournalEntrySolution = {
  expectedDate: "31/12/2021",
  expectedLabel_ar: "تسجيل قسط اهتلاك شاحنة النقل لسنة 2021",
  expectedDebits: [
    {
      code: "681",
      name_ar: "مخصصات الاهتلاكات والمؤونات وخسائر القيمة - أصول غير جارية",
      amount: 180000,
      tolerance: 1,
    },
  ],
  expectedCredits: [
    {
      code: "28182",
      alternativeCodes: ["2818", "28182"],
      name_ar: "اهتلاك معدات النقل",
      amount: 180000,
      tolerance: 1,
    },
  ],
  pedagogicalExplanation_ar:
    "معدل الاهتلاك الخطي t = 100/5 = 20%. مدة الاستعمال من 01/04/2021 إلى 31/12/2021 = 9 أشهر. قسط اهتلاك 2021: A = 1,200,000 × 20% × (9/12) = 180,000 دج. في 31/12/2021 يسجل القيد بجعل ح/681 مديناً بمبلغ 180,000 دج وح/28182 (أو 2818) دائناً بنفس المبلغ.",
  pedagogicalExplanation_fr:
    "Taux linéaire t = 20%. Prorata temporis du 01/04 au 31/12 = 9 mois. Annuité 2021: A = 1 200 000 × 20% × 9/12 = 180 000 DA. Écriture : Débit 681 (180 000 DA) et Crédit 28182 (180 000 DA).",
  commonMistakes: [
    {
      triggerCodes: ["2182", "218"],
      feedback_ar:
        "استعملت حساب الأصل (2182) بدلاً من حساب الاهتلاك (28182). في قيود نهاية السنة لا نخفض الأصل مباشرة بل نستعمل حساب الاهتلاك المتراكم.",
    },
    {
      triggerCodes: ["685"],
      feedback_ar:
        "حساب 685 مخصص للعناصر غير العادية/الجارية، أما اهتلاك التثبيتات فيسجل دائماً في ح/681 (أصول غير جارية).",
    },
  ],
};

export const GESTION_ECO_JOURNAL_QUESTION: PracticeQuestion = {
  id: "pq-acc-deprec-journal-01",
  educationLevel: "secondary",
  examType: "bac",
  streamId: "gestion_eco",
  subjectId: "accounting_finance",
  skillId: "acc_depreciation_linear_degressive",
  dimension: "application",
  difficulty: 3,
  type: "journal_entry" as any,
  exerciseType: "journal_entry",
  prompt_ar:
    "بتاريخ 31/12/2021، سجّل في دفتر يومية المؤسسة قسط الاهتلاك السنوي لشاحنة نقل البضائع. علماً أن المؤسسة اقتنتها بتاريخ 01/04/2021 بقيمة 1,200,000 دج، وتُهتلك خطياً على مدار 5 سنوات (20%). تأكد من سلامة أرقام الحسابات وتوازن القيد.",
  prompt_fr:
    "Au 31/12/2021, enregistrez au journal l'annuité d'amortissement linéaire du camion acquis le 01/04/2021 pour 1 200 000 DA (durée 5 ans, taux 20%).",
  options: [
    {
      id: "opt-j1",
      text_ar: "مدين ح/681 (180,000 دج) / دائن ح/28182 (180,000 دج)",
      text_fr: "Débit 681 (180 000 DA) / Crédit 28182 (180 000 DA)",
    },
  ],
  correctAnswerId: "opt-j1",
  interactiveConfig: {
    exerciseType: "journal_entry",
    journalSolution: LINEAR_DEPRECIATION_JOURNAL_SOLUTION,
  },
  explanation_ar:
    "القسط السنوي مع التناسب الزمني: A = 1,200,000 × 20% × (9/12) = 180,000 دج. القيد النظامي وفق SCF: مدين ح/681 ودائن ح/28182 بمبلغ 180,000 دج.",
  explanation_fr:
    "Annuité proratisée = 180 000 DA. Écriture conforme SCF : Débit 681 et Crédit 28182.",
  repairHint_ar:
    "تذكر: ح/681 في المدين بمبلغ القسط (180,000 دج) وحساب الاهتلاك ح/28182 في الدائن بنفس المبلغ.",
  expectedTimeSeconds: 120,
  tags: ["accounting", "journal", "depreciation", "scf"],
  version: 1,
  isRetestVariant: false,
};

// ============================================================================
// 2. STEP-BY-STEP SOLUTION & EXERCISE (الخطوات المنهجية لحساب الاهتلاك)
// ============================================================================

export const LINEAR_DEPRECIATION_STEPS_SOLUTION: StepByStepSolution = {
  steps: [
    {
      stepIndex: 1,
      title_ar: "المرحلة 1: حساب معدل الاهتلاك الخطي السنوي (t)",
      title_fr: "Étape 1: Calcul du taux d'amortissement linéaire (t)",
      prompt_ar:
        "بالاعتماد على مدة المنفعة N = 5 سنوات، احسب معدل الاهتلاك الخطي السنوي t (أدخل القيمة بالنسبة المئوية %):",
      expectedInputType: "number",
      expectedValue: 20,
      tolerance: 0.5,
      unit_ar: "%",
      hint_ar: "قانون معدل الاهتلاك الخطي: t = 100 / N، حيث N تمثل عدد السنوات.",
      mistakeFeedback_ar:
        "المعدل غير صحيح. تذكر قسمة 100 على 5 سنوات للحصول على 20%.",
      pedagogicalTip_ar: "معدل 5 سنوات هو دائماً 20%، ومعدل 4 سنوات هو 25%.",
    },
    {
      stepIndex: 2,
      title_ar: "المرحلة 2: تحديد عدد أشهر الاستعمال لسنة 2021 (m)",
      title_fr: "Étape 2: Nombre de mois d'utilisation pour 2021 (m)",
      prompt_ar:
        "بما أن الشاحنة اقتنيت في 01/04/2021، كم شهراً استُعملت الشاحنة خلال السنة المالية 2021 حتى 31/12/2021؟",
      expectedInputType: "number",
      expectedValue: 9,
      tolerance: 0,
      unit_ar: "أشهر",
      hint_ar:
        "احسب الأشهر من شهر الاقتناء (أفريل) حتى شهر ديسمبر: 12 - 4 + 1 = 9 أشهر كاملة.",
      mistakeFeedback_ar:
        "عدد الأشهر غير دقيق. بما أن الشراء تم في أول أفريل، يحسب شهر أفريل كاملاً (من شهر 4 إلى شهر 12 = 9 أشهر).",
      pedagogicalTip_ar:
        "إذا تم الشراء قبل أو يوم 15 من الشهر، يحتسب الشهر كاملاً.",
    },
    {
      stepIndex: 3,
      title_ar: "المرحلة 3: حساب قسط الاهتلاك لسنة 2021 (A)",
      title_fr: "Étape 3: Calcul de l'annuité d'amortissement 2021 (A)",
      prompt_ar:
        "احسب قسط اهتلاك سنة 2021 مع تطبيق قاعدة التناسب الزمني (Prorata temporis):",
      expectedInputType: "number",
      expectedValue: 180000,
      tolerance: 50,
      unit_ar: "دج",
      hint_ar: "صيغة القسط: A = V0 × t × (m / 12) = 1,200,000 × 20% × (9 / 12).",
      mistakeFeedback_ar:
        "حساب القسط غير مطابق. تأكد من ضرب 1,200,000 في 0.20 ثم في (9 / 12).",
      pedagogicalTip_ar:
        "تجنب حساب قسط سنة كاملة (240,000 دج) وتذكر التناسب الزمني.",
    },
    {
      stepIndex: 4,
      title_ar: "المرحلة 4: حساب القيمة المحاسبية الصافية (VNC) في 31/12/2021",
      title_fr: "Étape 4: Calcul de la Valeur Nette Comptable (VNC) au 31/12/2021",
      prompt_ar:
        "احسب القيمة المحاسبية الصافية VNC للشاحنة في نهاية السنة الأولى (31/12/2021):",
      expectedInputType: "number",
      expectedValue: 1020000,
      tolerance: 50,
      unit_ar: "دج",
      hint_ar: "القيمة المحاسبية الصافية: VNC = V0 - A2021 = 1,200,000 - 180,000.",
      mistakeFeedback_ar:
        "النتيجة غير صحيحة. اطرح قسط 2021 (180,000 دج) من القيمة الأصلية (1,200,000 دج).",
      pedagogicalTip_ar:
        "في نهاية السنة الأولى، مجموع الاهتلاكات المتراكمة يساوي قسط السنة الأولى فقط.",
    },
  ],
  finalConclusion_ar:
    "ممتاز! لقد استخرجت المعطيات الأساسية بنجاح: المعدل t = 20%، مدة الاستعمال m = 9 أشهر، قسط الاهتلاك A = 180,000 دج، والقيمة الصافية VNC = 1,020,000 دج. بهذا تكون جاهزاً لتسجيل القيد المحاسبي في اليومية بثقة تامة.",
  finalConclusion_fr:
    "Félicitations ! Vous maîtrisez la méthode de calcul de l'annuité linéaire et de la VNC.",
};

export const GESTION_ECO_STEPS_QUESTION: PracticeQuestion = {
  id: "pq-acc-deprec-steps-01",
  educationLevel: "secondary",
  examType: "bac",
  streamId: "gestion_eco",
  subjectId: "accounting_finance",
  skillId: "acc_depreciation_linear_degressive",
  dimension: "application",
  difficulty: 2,
  type: "step_by_step" as any,
  exerciseType: "step_by_step",
  prompt_ar:
    "حازت مؤسسة على شاحنة نقل بضائع بقيمة 1,200,000 دج بتاريخ 01/04/2021 تُهتلك خطياً على مدار 5 سنوات. اتبع المراحل المنهجية لحساب القسط والقيمة المحاسبية الصافية VNC خطوة بخطوة:",
  prompt_fr:
    "Acquisition d'un camion pour 1 200 000 DA le 01/04/2021 (durée 5 ans). Suivez les étapes pour calculer l'annuité et la VNC :",
  options: [
    {
      id: "opt-s1",
      text_ar: "القسط: 180,000 دج ؛ VNC = 1,020,000 دج",
      text_fr: "Annuité : 180 000 DA ; VNC = 1 020 000 DA",
    },
  ],
  correctAnswerId: "opt-s1",
  interactiveConfig: {
    exerciseType: "step_by_step",
    stepSolution: LINEAR_DEPRECIATION_STEPS_SOLUTION,
  },
  explanation_ar:
    "t = 20%, m = 9 أشهر. A = 1,200,000 × 20% × (9/12) = 180,000 دج. VNC = 1,200,000 - 180,000 = 1,020,000 دج.",
  explanation_fr:
    "t = 20%, m = 9 mois. A = 1 200 000 × 20% × (9/12) = 180 000 DA. VNC = 1 020 000 DA.",
  repairHint_ar: "طبق قانون التناسب الزمني A = V0 * t * (m/12).",
  expectedTimeSeconds: 150,
  tags: ["accounting", "steps", "depreciation", "linear"],
  version: 1,
  isRetestVariant: false,
};
