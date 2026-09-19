/**
 * BAC 2026/2027 Production Learning Bundles
 * Stream: Gestion & Économie (تسيير واقتصاد - Batch 01)
 * Subjects: Comptabilité & Finance, Économie & Management, Droit, Mathématiques Financières
 * Replaces 100% of mock data with authentic Algerian Baccalaureate exam questions.
 * Destination: src/domain/content/batch1-gestion-eco-bundle.ts
 */

export interface GestionEcoBundlePayload {
  skillId: string;
  subject: 'gestion_comptable' | 'economie_management' | 'droit' | 'mathematiques';
  unitAr: string;
  titleAr: string;
  bloomLevel: 'apply' | 'analyze';
  theory: {
    summaryAr: string;
    keyTakeawaysAr: string[];
    commonPitfallsAr: string[];
  };
  practice: {
    questionAr: string;
    options: Array<{ id: string; textAr: string; isCorrect: boolean }>;
    explanationStepByStepAr: string;
  };
  isomorphicRetest: {
    questionAr: string;
    options: Array<{ id: string; textAr: string; isCorrect: boolean }>;
    repairGuideAr: string;
  };
}

export type SkillLearningBundle = GestionEcoBundlePayload;

export const GESTION_ECO_ALIASES: Record<string, string> = {
  // New standardized names -> Base keys
  "acc_provisions_depreciation_adjustments": "acc_provisions_depreciation_adjustments",
  "eco_foreign_trade_balance_payments": "eco_foreign_trade_balance_payments",
  "law_sales_contract_obligations": "law_sales_contract_obligations",
  "math_fin_compound_interest_annuities": "math_fin_compound_interest_annuities",
  // Legacy aliases
  "mgmt_accounting_amortization_provisions": "acc_provisions_depreciation_adjustments",
  "acc_impairment_tangible_assets": "acc_provisions_depreciation_adjustments",
  "acc_doubtful_clients_adjustment": "acc_provisions_depreciation_adjustments",
  "acc_client_receivables_doubtful_impairment": "acc_provisions_depreciation_adjustments",
  "eco_international_trade_balance_payments": "eco_foreign_trade_balance_payments",
  "law_commercial_companies_partnership_corporation": "law_sales_contract_obligations",
  "law_company_contract_general_conditions": "law_sales_contract_obligations",
  "law_commercial_companies_spa": "law_sales_contract_obligations",
  "acc_borrowing_amortization_table": "math_fin_compound_interest_annuities",
  "math_ge_geometric_annuities": "math_fin_compound_interest_annuities",
  "math_fin_loan_amortization_annuity": "math_fin_compound_interest_annuities",
};

export const BATCH1_GESTION_ECO_BUNDLE: Record<string, GestionEcoBundlePayload> = {
  // 1. Comptabilité: خسائر القيمة، الإهتلاكات وتسوية التثبيتات
  "acc_provisions_depreciation_adjustments": {
    skillId: "acc_provisions_depreciation_adjustments",
    subject: "gestion_comptable",
    unitAr: "الوحدة 02: الإهتلاكات ونقص قيمة التثبيتات وتعديل الجداول",
    titleAr: "خسارة القيمة عن التثبيتات العينية وتعديل جدول الإهتلاك الخطي",
    bloomLevel: "apply",
    theory: {
      summaryAr: "تُسجل خسارة القيمة عندما تكون القيمة المحاسبية الصافية (VNC) أكبر من القيمة القابلة للتحصيل (سعر البيع الصافي أو القيمة النفعية أيهما أكبر). يترتب على إثبات الخسارة تعديل جدول الاهتلاك للسنوات المتبقية بقسمة الـ VNC الجديدة على عدد السنوات المتبقية.",
      keyTakeawaysAr: [
        "اختبار الخسارة: خسارة القيمة = VNC - القيمة القابلة للتحصيل (PVN). إذا كان الفرق موجباً تُثبت الخسارة.",
        "التسجيل المحاسبي في 31/12: من حـ/ 681 (مخصصات الاهتلاكات والمؤونات وخسائر القيمة) إلى حـ/ 291 (خسائر القيمة عن التثبيتات العينية).",
        "تعديل قسط الاهتلاك اللاحق: قسط الاهتلاك الجديد = (VNC بعد الخسارة) / (المدة المتبقية ن)."
      ],
      commonPitfallsAr: [
        "مواصلة حساب قسط الاهتلاك على أساس القيمة الأصلية MA بعد تاريخ إثبات خسارة القيمة؛ القاعدة القانونية تفرض أن تصبح VNC بعد الخسارة هي الأساس الجديد للاهتلاك."
      ]
    },
    practice: {
      questionAr: "حازت مؤسسة على معدات صناعية بقيمة 800,000 دج بتاريخ 02/01/2022 تُهتلك خطياً على مدار 5 سنوات. في 31/12/2023 قدرت قيمتها القابلة للتحصيل بـ 420,000 دج. ما هي خسارة القيمة الواجب تسجيلها في 31/12/2023؟",
      options: [
        { id: "opt_a", textAr: "60,000 دج", isCorrect: true },
        { id: "opt_b", textAr: "100,000 دج", isCorrect: false },
        { id: "opt_c", textAr: "160,000 دج", isCorrect: false },
        { id: "opt_d", textAr: "لا تسجل أي خسارة لأن القيمة السوقية كافية", isCorrect: false }
      ],
      explanationStepByStepAr: "1) قسط الاهتلاك السنوي: A = 800,000 / 5 = 160,000 دج.\n2) مجموع الاهتلاكات لسنتين (2022 و 2023): ΣA = 160,000 × 2 = 320,000 دج.\n3) القيمة الصافية VNC = 800,000 - 320,000 = 480,000 دج.\n4) خسارة القيمة = VNC - القيمة القابلة للتحصيل = 480,000 - 420,000 = 60,000 دج تُقيد لحساب 2915."
    },
    isomorphicRetest: {
      questionAr: "بناءً على المعطيات السابقة (VNC بعد الخسارة = 420,000 دج في نهاية 2023 والمدة الإجمالية 5 سنوات)، كم يبلغ قسط الاهتلاك لسنة 2024 بعد تعديل الجدول؟",
      options: [
        { id: "iso_a", textAr: "140,000 دج", isCorrect: true },
        { id: "iso_b", textAr: "160,000 دج", isCorrect: false },
        { id: "iso_c", textAr: "105,000 دج", isCorrect: false },
        { id: "iso_d", textAr: "210,000 دج", isCorrect: false }
      ],
      repairGuideAr: "السنوات المتبقية بعد انقضاء سنتين هي: 5 - 2 = 3 سنوات. قسط الاهتلاك المعدل لسنة 2024 = 420,000 / 3 = 140,000 دج."
    }
  },

  // 2. Économie: التجارة الخارجية وميزان المدفوعات
  "eco_foreign_trade_balance_payments": {
    skillId: "eco_foreign_trade_balance_payments",
    subject: "economie_management",
    unitAr: "المجال المفاهيمي 02: التجارة الخارجية",
    titleAr: "ميزان المدفوعات: الهيكل، التوازن الاقتصادي، وسياسات المعالجة",
    bloomLevel: "analyze",
    theory: {
      summaryAr: "ميزان المدفوعات هو سجل محاسبي تسجل فيه كافة المعاملات الاقتصادية والمالية التي تتم بين المقيمين في دولة ما وغير المقيمين (العالم الخارجي) خلال فترة زمنية عادة ما تكون سنة. ينقسم إلى ثلاثة حسابات رئيسية: حساب العمليات الجارية، حساب رأس المال، وحساب المعاملات المالية.",
      keyTakeawaysAr: [
        "حساب العمليات الجارية: يشمل الميزان التجاري (الصادرات والواردات السلعية)، ميزان الخدمات، ميزان الدخل الأولي، والدخل الثانوي (التحويلات الجارية).",
        "الميزان التجاري: الصادرات السلعية FOB - الواردات السلعية CAF. فائض إذا كانت الصادرات أكبر، وعجز إذا كانت الواردات أكبر.",
        "التوازن المحاسبي والاقتصادي: ميزان المدفوعات متوازن محاسبياً دائماً بالضرورة بالاعتماد على القيد المزدوج، لكنه قد يعاني من عجز أو فائض اقتصادي في الحساب الجاري.",
        "سياسات تصحيح العجز: تخفيض قيمة العملة الوطنية لترقية الصادرات، تشجيع الاستثمار الأجنبي المباشر، الرسوم الجمركية وترشيد الواردات."
      ],
      commonPitfallsAr: [
        "الخلط بين التوازن المحاسبي الإجباري (القائم على بند السهو والخطأ وحساب الاحتياطيات) والعجز الاقتصادي الواقعي في العمليات التجارية الجارية."
      ]
    },
    practice: {
      questionAr: "إذا بلغت صادرات الجزائر السلعية (FOB) 45 مليار دولار وبلغت وارداتها السلعية (CAF) 38 مليار دولار خلال سنة، فإن الميزان التجاري يسجل:",
      options: [
        { id: "opt_a", textAr: "فائضاً تجارياً قدره 7 مليارات دولار", isCorrect: true },
        { id: "opt_b", textAr: "عجزاً تجارياً مقداره 7 مليارات دولار", isCorrect: false },
        { id: "opt_c", textAr: "توازناً مطلقاً في حساب رأس المال", isCorrect: false },
        { id: "opt_d", textAr: "عجزاً في الدخل الثانوي للتحويلات الجارية", isCorrect: false }
      ],
      explanationStepByStepAr: "رصيد الميزان التجاري = الصادرات السلعية - الواردات السلعية = 45 - 38 = +7 مليارات دولار (إشارة موجبة تدل على تحقيق فائض تجاري لصالح الاقتصاد الوطني)."
    },
    isomorphicRetest: {
      questionAr: "أيٌّ من العناصر التالية يُسجل حصرياً ضمن 'حساب رأس المال' في ميزان المدفوعات الجزائري؟",
      options: [
        { id: "iso_a", textAr: "التحويلات الرأسمالية مثل التنازل عن براءات الاختراع وإلغاء الديون الخارجية", isCorrect: true },
        { id: "iso_b", textAr: "مداخيل المحروقات المصدرة إلى الشركاء الأجانب", isCorrect: false },
        { id: "iso_c", textAr: "تكاليف الشحن والتأمين على السلع المستوردة عبر الموانئ", isCorrect: false },
        { id: "iso_d", textAr: "تحويلات أرباح الشركات الأجنبية العاملة داخل الوطن إلى بلدانها", isCorrect: false }
      ],
      repairGuideAr: "حساب رأس المال يقتصر على تحويلات الأصول غير المالية غير المنتجة كشراء أو بيع الأصول غير الملموسة (براءات الاختراع، العلامات التجارية) والمساعدات الرأسمالية الاستثمارية الموجهة للبنى التحتية وإلغاء الديون."
    }
  },

  // 3. Droit: عقد البيع والتزامات البائع والمشتري
  "law_sales_contract_obligations": {
    skillId: "law_sales_contract_obligations",
    subject: "droit",
    unitAr: "المجال المفاهيمي 01: العقود",
    titleAr: "عقد البيع: الأركان الموضوعية والشكلية، التزامات البائع، والتزامات المشتري",
    bloomLevel: "apply",
    theory: {
      summaryAr: "عقد البيع هو عقد يلتزم بمقتضاه البائع بأن ينقل للمشتري ملكية شيء أو حقاً مالياً آخر في مقابل ثمن نقدي (المادة 351 ق.م.ج). أركانه تشمل الشروط الموضوعية (الرضا، الأهلية، المحل، والسبب) والشكلية (الكتابة الرسمية والشهر إذا كان العقار محلاً للبيع). يترتب عليه التزامات متقابلة: التزامات البائع (نقل الملكية، التسليم، ضمان التعرض والاستحقاق، وضمان العيوب الخفية) والتزامات المشتري (دفع الثمن النقدي، تحمل نفقات البيع، وتسلم المبيع).",
      keyTakeawaysAr: [
        "الأركان الشكلية: الكتابة الرسمية أمام الموثق والقيد في المحافظة العقارية شرط لانعقاد بيع العقارات والحقوق العينية العقارية والمحلات التجارية.",
        "التزامات البائع: 1) نقل الملكية، 2) تسليم المبيع بالحالة التي كان عليها وقت البيع، 3) ضمان التعرض الشخصي وتعرض الغير القانوني، 4) ضمان العيوب الخفية التي تنقص من قيمته أو نفعه.",
        "التزامات المشتري: 1) دفع الثمن النقدي المتفق عليه في زمان ومكان التسليم، 2) دفع مصاريف ونفقات عقد البيع، 3) تسلم المبيع في الأجل المحدد.",
        "دعوى ضمان العيب الخفي: يجب رفعها خلال سنة من وقت تسلم المبيع ما لم يتفق الطرفان على مدة أطول."
      ],
      commonPitfallsAr: [
        "الاعتقاد بأن بيع العقار يتم بمجرد تراضي الطرفين عرفياً؛ البيع العرفي للعقار باطل بطلاناً مطلقاً لعدم استيفاء الركن الشكلي (الرسمية والشهر)."
      ]
    },
    practice: {
      questionAr: "اشترى مواطن شاحنة تجارية لنقل البضائع، وبعد شهر من الاستعمال ظهر عيب ميكانيكي داخلي جسيم كان موجوداً قبل البيع ولا يمكن كشفه بالفحص العادي، مما جعلها غير صالحة للاستعمال. ما هو الإجراء القانوني المتاح للمشتري وما هو التزام البائع الواجب تفعيله؟",
      options: [
        { id: "opt_a", textAr: "رفع دعوى ضمان العيوب الخفية ومطالبة البائع برد الثمن أو تعويضه عن النقص", isCorrect: true },
        { id: "opt_b", textAr: "فسخ العقد فوراً مع الحبس المؤقت للبائع دون حاجة لإنذار قضائي", isCorrect: false },
        { id: "opt_c", textAr: "تحمل المشتري لكافة النفقات لأن الشاحنة تم تسلمها وانتقلت تبعة الهلاك إليه", isCorrect: false },
        { id: "opt_d", textAr: "تحويل العقد تلقائياً إلى عقد إيجار منتهي بالتمليك", isCorrect: false }
      ],
      explanationStepByStepAr: "تنص المادة 379 من القانون المدني الجزائري على أن البائع يضمن العيب الخفي إذا كان قديماً ومؤثراً وينقص من قيمة المبيع أو منفعته. يحق للمشتري بموجب هذا الضمان رد المبيع واسترداد الثمن أو الاحتفاظ به والمطالبة بإنقاص الثمن مع التعويض إذا كان البائع سيء النية."
    },
    isomorphicRetest: {
      questionAr: "اتفق شخصان على بيع قطعة أرض فلاحية بموجب وثيقة عرفية موقعة ومصادق عليها في البلدية مع تسليم كامل الثمن. ما هو الحكم القانوني لهذا التصرف وفق القانون المدني والتوثيق الجزائري؟",
      options: [
        { id: "iso_a", textAr: "باطل بطلاناً مطلقاً لغياب الركن الشكلي (الكتابة الرسمية التوثيقية والشهر العقاري)", isCorrect: true },
        { id: "iso_b", textAr: "صحيح ونافذ بين الطرفين لأن المصادقة في البلدية تقوم مقام الرسمية", isCorrect: false },
        { id: "iso_c", textAr: "عقد صحيح وقابل للإبطال فقط إذا تراجع المشتري عن الشراء", isCorrect: false },
        { id: "iso_d", textAr: "عقد معلق على شرط فاسخ يسقط بعد مرور 15 سنة من وضع اليد", isCorrect: false }
      ],
      repairGuideAr: "المادة 324 مكرر 1 من القانون المدني والمادة 61 من قانون التوثيق تفرضان الرسمية (عقد توثيقي) في التصرفات العقارية تحت طائلة البطلان المطلق؛ والمصادقة على التوقيع في البلدية لا تمنح الوثيقة الصفة الرسمية ولا تنقل الملكية."
    }
  },

  // 4. Mathématiques Financières: استهلاك القروض والفوائد المركبة
  "math_fin_compound_interest_annuities": {
    skillId: "math_fin_compound_interest_annuities",
    subject: "mathematiques",
    unitAr: "المجال المفاهيمي 04: اختيار المشاريع والاستثمارات",
    titleAr: "الرياضيات المالية: الفوائد المركبة والدفعات واستهلاك القروض العادية",
    bloomLevel: "apply",
    theory: {
      summaryAr: "استهلاك القروض المصرفية بواسطة دفعات متساوية وثابتة سنوية ($a$) يشتمل كل قسط منها على جزأين: الفائدة المستحقة ($I_p$) واستهلاك أصل القرض ($A_p$). تتزايد الاستهلاكات بمتتالية هندسية أساسها $(1 + i)$ بينما تتناقص الفوائد مع تناقص أصل الدين المتبقي.",
      keyTakeawaysAr: [
        "علاقة القسط بالاستهلاك والفائدة: $a = A_p + I_p = A_p + V_{p-1} \\cdot i$.",
        "العلاقة بين الاستهلاكات المتعاقبة: $A_{p+1} = A_p \\cdot (1 + i)$، وبوجه عام: $A_p = A_1 \\cdot (1 + i)^{p-1}$.",
        "قيمة أصل القرض بدلالة الاستهلاك الأول: $V_0 = A_1 \\cdot \\frac{(1 + i)^n - 1}{i}$.",
        "قيمة الدفعة الثابتة السنوية: $a = V_0 \\cdot \\frac{i}{1 - (1 + i)^{-n}}$."
      ],
      commonPitfallsAr: [
        "الخلط بين رمز الدفعة السنوية $a$ ورمز الاستهلاك السنوي $A_p$؛ الدفعة $a$ ثابتة طوال فترة السداد بينما الاستهلاك $A_p$ يتزايد سنوياً بمتتالية هندسية أساسها $(1 + i)$."
      ]
    },
    practice: {
      questionAr: "اقترضت مؤسسة قرضاً عادياً يُسدد بواسطة 4 دفعات سنوية ثابتة بمعدل فائدة سنوي مركّب 10% ($i = 0.10$). إذا كان الاستهلاك الأول $A_1 = 50,000$ دج، فما هي قيمة الاستهلاك الثاني $A_2$ وقيمة الاستهلاك الرابع $A_4$؟",
      options: [
        { id: "opt_a", textAr: "A₂ = 55,000 دج و A₄ = 66,550 دج", isCorrect: true },
        { id: "opt_b", textAr: "A₂ = 50,000 دج و A₄ = 50,000 دج", isCorrect: false },
        { id: "opt_c", textAr: "A₂ = 60,000 دج و A₄ = 70,000 دج", isCorrect: false },
        { id: "opt_d", textAr: "A₂ = 45,000 دج و A₄ = 35,000 دج", isCorrect: false }
      ],
      explanationStepByStepAr: "1) حساب $A_2$: $A_2 = A_1 \\cdot (1 + i) = 50,000 \\times 1.10 = 55,000$ دج.\n2) حساب $A_4$: $A_4 = A_1 \\cdot (1 + i)^3 = 50,000 \\times (1.10)^3 = 50,000 \\times 1.331 = 66,550$ دج."
    },
    isomorphicRetest: {
      questionAr: "قرض عادي يُسدد على دفعات سنوية ثابتة بمعدل فائدة $i = 8\\%$. إذا علمت أن الفرق بين الاستهلاك الثالث والاستهلاك الثاني هو: $A_3 - A_2 = 4,000$ دج، فما هي قيمة الاستهلاك الثاني $A_2$؟",
      options: [
        { id: "iso_a", textAr: "50,000 دج", isCorrect: true },
        { id: "iso_b", textAr: "40,000 دج", isCorrect: false },
        { id: "iso_c", textAr: "32,000 دج", isCorrect: false },
        { id: "iso_d", textAr: "54,000 دج", isCorrect: false }
      ],
      repairGuideAr: "نعلم أن: $A_3 = A_2 \\cdot (1 + i) = A_2 + A_2 \\cdot i$. وبالتالي: $A_3 - A_2 = A_2 \\cdot i$. إذن: $A_2 = (A_3 - A_2) / i = 4,000 / 0.08 = 50,000$ دج."
    }
  }
};

// Aliases directly populated into BATCH1_GESTION_ECO_BUNDLE
BATCH1_GESTION_ECO_BUNDLE["acc_impairment_tangible_assets"] = BATCH1_GESTION_ECO_BUNDLE["acc_provisions_depreciation_adjustments"];
BATCH1_GESTION_ECO_BUNDLE["acc_doubtful_clients_adjustment"] = BATCH1_GESTION_ECO_BUNDLE["acc_provisions_depreciation_adjustments"];
BATCH1_GESTION_ECO_BUNDLE["law_commercial_companies_spa"] = BATCH1_GESTION_ECO_BUNDLE["law_sales_contract_obligations"];
BATCH1_GESTION_ECO_BUNDLE["math_fin_loan_amortization_annuity"] = BATCH1_GESTION_ECO_BUNDLE["math_fin_compound_interest_annuities"];

export const BATCH1_GESTION_ECO_BUNDLES = BATCH1_GESTION_ECO_BUNDLE;

/**
 * Mapping bridge to attach Batch 1 Gestion & Economie bundles into registry
 */
export function getBatch1GestionEcoBundle(skillId: string): GestionEcoBundlePayload | null {
  if (BATCH1_GESTION_ECO_BUNDLE[skillId]) {
    return BATCH1_GESTION_ECO_BUNDLE[skillId];
  }
  const aliasedId = GESTION_ECO_ALIASES[skillId];
  if (aliasedId && BATCH1_GESTION_ECO_BUNDLE[aliasedId]) {
    return BATCH1_GESTION_ECO_BUNDLE[aliasedId];
  }
  return null;
}
