// src/data/practice/gestion-eco/trimestre1-full.ts

import { PracticeQuestion, SuspectedErrorType } from "@/types/mission";
import { SubjectId, StreamId } from "@/types/education";
import { DiagnosticPracticeItem } from "./trimestre1-accounting";

export const gestionEcoT1FullPractice: DiagnosticPracticeItem[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. التسيير المحاسبي والمالي: تسوية المخزونات وفروقات الجرد
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_acc_inventory_variance_01",
    skillId: "mgmt_accounting_amortization_provisions",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "في 31/12/N، أظهر الجرد المادي لمخزون البضائع (حـ/30) مبلغ 180,000 دج، بينما رصيد الحساب الدفتري هو 200,000 دج. إذا علمت أن فرق الجرد غير مبرر، فما هو قيد التسوية الصحيح؟",
    options_ar: [
      "مدين حـ/657 (أعباء استثنائية للتسيير الجاري) بمبلغ 20,000 دج ودائن حـ/30 بمبلغ 20,000 دج",
      "مدين حـ/30 بمبلغ 20,000 دج ودائن حـ/757 بمبلغ 20,000 دج",
      "مدين حـ/600 بمبلغ 20,000 دج ودائن حـ/30 بمبلغ 20,000 دج",
      "مدين حـ/30 بمبلغ 20,000 دج ودائن حـ/600 بمبلغ 20,000 دج"
    ],
    correctAnswer_ar: "مدين حـ/657 (أعباء استثنائية للتسيير الجاري) بمبلغ 20,000 دج ودائن حـ/30 بمبلغ 20,000 دج",
    explanation_ar: "فرق الجرد = الجرد المادي - الجرد المحاسبي = 180,000 - 200,000 = -20,000 دج (فارق سالب). بما أنه غير مبرر، يُسجل كعبء استثنائي في حـ/657 مقابل تخفيض المخزون حـ/30.",
    trapType: "methodology",
    commonTrap_ar: "استعمال حساب المشتريات المستهلكة (حـ/600) الذي يُستعمل حصراً عند وجود فرق جرد 'مبرر' وليس 'غير مبرر'.",
    twinQuestion: {
      id: "twin_acc_inventory_variance_01",
      prompt_ar: "أظهر الجرد المادي للمواد الأولية (حـ/31) مبلغ 350,000 دج وكان رصيدها المحاسبي 320,000 دج. إذا كان الفارق غير مبرر، فما هو حساب الإيرادات الدائن؟",
      options_ar: [
        "حـ/757 (منتوجات استثنائية عن عمليات التسيير) بمبلغ 30,000 دج",
        "حـ/601 (مواد أولية مستهلكة) بمبلغ 30,000 دج",
        "حـ/701 (مبيعات منتجات تامة) بمبلغ 30,000 دج",
        "حـ/657 بمبلغ 30,000 دج"
      ],
      correctAnswer_ar: "حـ/757 (منتوجات استثنائية عن عمليات التسيير) بمبلغ 30,000 دج",
      explanation_ar: "الفارق = 350,000 - 320,000 = +30,000 دج (موجب غير مبرر). يجعل حـ/31 مديناً وحـ/757 دائناً."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. التسيير المحاسبي والمالي: التنازل عن التثبيتات مع خسارة سابقة
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_acc_asset_disposal_01",
    skillId: "mgmt_accounting_amortization_provisions",
    subjectId: "accounting",
    streamId: "gestion_eco",
    difficulty: "advanced",
    prompt_ar: "تنازلت مؤسسة على الحساب (حـ/462) عن شاحنة قيمتها الأصلية 1,000,000 دج بمبلغ 350,000 دج. كانت اهتلاكاتها المتراكمة حتى تاريخ التنازل 600,000 دج، ولديها خسارة قيمة سابقة مسجلة بمبلغ 80,000 دج. ما هي نتيجة التنازل المحققة؟",
    options_ar: [
      "فائض قيمة (حـ/752) بمبلغ 30,000 دج",
      "ناقص قيمة (حـ/652) بمبلغ 50,000 دج",
      "فائض قيمة (حـ/752) بمبلغ 80,000 دج",
      "ناقص قيمة (حـ/652) بمبلغ 30,000 دج"
    ],
    correctAnswer_ar: "فائض قيمة (حـ/752) بمبلغ 30,000 دج",
    explanation_ar: "القيمة المحاسبية الصافية: VNC = المبلغ الأصلي - (الاهتلاك المتراكم + خسارة القيمة) = 1,000,000 - (600,000 + 80,000) = 320,000 دج. نتيجة التنازل = سعر التنازل - VNC = 350,000 - 320,000 = +30,000 دج (فائض قيمة يسجل في دائن حـ/752).",
    trapType: "calculation",
    commonTrap_ar: "إغفال طرح خسارة القيمة السابقة من القيمة الأصلية عند حساب VNC ليوم التنازل.",
    twinQuestion: {
      id: "twin_acc_asset_disposal_01",
      prompt_ar: "معدة صناعية تكلفتها 500,000 دج، اهتلاكها المتراكم 300,000 دج وخسارة قيمتها 40,000 دج. بيعت بشيك بنكي بمبلغ 120,000 دج. ما نتيجة التنازل؟",
      options_ar: [
        "ناقص قيمة بمبلغ 40,000 دج (حـ/652)",
        "فائض قيمة بمبلغ 20,000 دج (حـ/752)",
        "ناقص قيمة بمبلغ 80,000 دج (حـ/652)",
        "النتيجة معدومة (0 دج)"
      ],
      correctAnswer_ar: "ناقص قيمة بمبلغ 40,000 دج (حـ/652)",
      explanation_ar: "VNC = 500,000 - (300,000 + 40,000) = 160,000 دج. النتيجة = 120,000 - 160,000 = -40,000 دج (ناقص قيمة يسجل مديناً في حـ/652)."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. الاقتصاد والمناجمنت: الكتلة النقدية والمجمعات النقدية
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_eco_money_aggregates_01",
    skillId: "mgmt_economics_management_banking",
    subjectId: "economics",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "يتشكل المجمع النقدي الضيق M1 (كتلة وسائل الدفع الفورية) في الاقتصاد من:",
    options_ar: [
      "النقود الورقية والمعدنية + الودائع تحت الطلب (الحسابات الجارية والصكوك)",
      "النقود القانونية + الودائع لأجل والمدخرات قصيرة الأجل",
      "الودائع الاستثمارية طويلة الأجل وسندات الخزينة فقط",
      "الأوراق المالية وأسهم البورصة"
    ],
    correctAnswer_ar: "النقود الورقية والمعدنية + الودائع تحت الطلب (الحسابات الجارية والصكوك)",
    explanation_ar: "M1 هو مجمع السيولة التامة ويضم النقود القانونية (أوراق وقطع نقدية) والنقود الكتابية (الودائع الجارية تحت الطلب القابلة للتحويل فوراً بشيكات).",
    trapType: "misconception",
    commonTrap_ar: "خلط المجمع M1 مع المجمع M2 الذي يضيف الودائع الادخارية لأجل (شبه النقد).",
    twinQuestion: {
      id: "twin_eco_money_aggregates_01",
      prompt_ar: "ما هو العنصر الذي يضاف إلى المجمع النقدي M1 لنحصل على المجمع النقدي M2؟",
      options_ar: [
        "الودائع لأجل وحسابات الدفاتر الادخارية (شبه النقد)",
        "سندات الخزينة طويلة الأجل وأذونات الصندوق",
        "الذهب والعملات الأجنبية في البنك المركزي",
        "النقود الورقية المتداولة في السوق"
      ],
      correctAnswer_ar: "الودائع لأجل وحسابات الدفاتر الادخارية (شبه النقد)",
      explanation_ar: "العلاقة النظامية: M2 = M1 + الودائع لأجل وحسابات الادخار قصيرة الأجل (شبه النقد)."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. الاقتصاد والمناجمنت: أدوات السياسة النقدية للبنك المركزي
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_eco_central_bank_policy_01",
    skillId: "mgmt_economics_management_banking",
    subjectId: "economics",
    streamId: "gestion_eco",
    difficulty: "advanced",
    prompt_ar: "في حالة حدوث موجة تضخم حادة في الاقتصاد، ما هو الإجراء المباشر الذي يتخذه البنك المركزي للحد من حجم الائتمان والكتلة النقدية؟",
    options_ar: [
      "رفع معدل إعادة الخصم ورفع نسبة الاحتياطي الإجباري",
      "خفض سعر الفائدة لتشجيع الاستثمار",
      "شراء السندات الحكومية من السوق المفتوحة وضخ السيولة",
      "تخفيض نسبة الاحتياطي القانوني لدى البنوك التجارية"
    ],
    correctAnswer_ar: "رفع معدل إعادة الخصم ورفع نسبة الاحتياطي الإجباري",
    explanation_ar: "لمكافحة التضخم يتبع البنك المركزي سياسة نقدية انكماشية: رفع معدل إعادة الخصم يرفع تكلفة الاقتراض للبنوك، ورفع نسبة الاحتياطي الإجباري يقلص قدرة البنوك التجارية على خلق النقود والائتمان.",
    trapType: "reading_error",
    commonTrap_ar: "اختيار خفض الفائدة أو شراء السندات وهي إجراءات توسعية تطبق في الركود الاقتصادي وليس لمعالجة التضخم.",
    twinQuestion: {
      id: "twin_eco_central_bank_policy_01",
      prompt_ar: "عندما يتدخل البنك المركزي بائعاً للأوراق المالية في عمليات السوق المفتوحة (Open Market)، فإن هدفه الرئيسي هو:",
      options_ar: [
        "امتصاص السيولة الفائضة من البنوك والحد من عرض النقود",
        "ضخ سيولة نقدية إضافية في النظام المصرفي",
        "خفض معدلات الفائدة في الأسواق المالية",
        "زيادة حجم القروض الممنوحة للأفراد والمؤسسات"
      ],
      correctAnswer_ar: "امتصاص السيولة الفائضة من البنوك والحد من عرض النقود",
      explanation_ar: "بيع السندات يجعل البنوك تدفع نقوداً للبنك المركزي، مما يسحب السيولة النقدية من السوق ويكبح التضخم."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. القانون: أركان عقد العمل وعلاقات العمل الفردية
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_law_labor_contract_01",
    skillId: "mgmt_commercial_labor_law",
    subjectId: "law",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "يتميز عقد العمل الفردي عن سائر العقود المدنية والتجارية بوجود ركن جوهري إلزامي هو:",
    options_ar: [
      "علاقة التبعية القانونية (إشراف ورقابة صاحب العمل على العامل)",
      "تحديد الأجر المالي المتفق عليه بين الطرفين",
      "اشتراط كتابة العقد وتوثيقه لدى الموثق",
      "تحديد مدة زمنية محددة لا تتجاوز سنة واحدة"
    ],
    correctAnswer_ar: "علاقة التبعية القانونية (إشراف ورقابة صاحب العمل على العامل)",
    explanation_ar: "علاقة التبعية (Lien de subordination) هي المعيار الفاصل لعقد العمل؛ حيث يلتزم العامل بأداء العمل تحت إشراف وإدارة وتوجيه ورقابة صاحب العمل مقابل أجر.",
    trapType: "misconception",
    commonTrap_ar: "الاعتقاد بأن الكتابة ركن صحة في عقد العمل؛ عقد العمل يمكن إثباته بكافة الطرق حتى لو كان شفهياً، بينما التبعية هي الركن المميز.",
    twinQuestion: {
      id: "twin_law_labor_contract_01",
      prompt_ar: "الأصل في التشريع الجزائري (القانون 90-11) بالنسبة لمدة عقد العمل هو أن يبرم العقد لمدة:",
      options_ar: [
        "غير محددة (CDI)، ولا يبرم لمدة محددة إلا في الحالات المنصوص عليها قانوناً",
        "محددة دائماً بسنة واحدة قابلة للتجديد لمرة واحدة فقط",
        "محددة بـ 6 أشهر تحت التجربة الإلزامية",
        "خمس سنوات تجدد تلقائياً باتفاق الطرفين"
      ],
      correctAnswer_ar: "غير محددة (CDI)، ولا يبرم لمدة محددة إلا في الحالات المنصوص عليها قانوناً",
      explanation_ar: "المادة 11 من القانون 90-11 تنص على أن الأصل هو عقد عمل غير محدد المدة، أما العقد محدد المدة (CDD) فهو استثناء لحالات محددة كأشغال مؤقتة أو استخلاف عامل غائب."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. القانون: تسوية النزاعات العمالية الجماعية والإضراب
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_law_collective_disputes_01",
    skillId: "mgmt_commercial_labor_law",
    subjectId: "law",
    streamId: "gestion_eco",
    difficulty: "advanced",
    prompt_ar: "وفق قانون العمل الجزائري، ما هو الإجراء القانوني الإلزامي الأول الذي يجب استنفاذه قبل اللجوء إلى الإضراب عن العمل في نزاع جماعي؟",
    options_ar: [
      "المصالحة المباشرة عبر مفتشية العمل ومحاضر عدم الصلح",
      "رفع دعوى قضائية استعجالية أمام الغرفة الاجتماعية",
      "التوقف الفوري عن العمل وتوجيه إشعار في نفس اليوم",
      "الاحتكام مباشرة إلى التحكيم الإجباري لوزير العمل"
    ],
    correctAnswer_ar: "المصالحة المباشرة عبر مفتشية العمل ومحاضر عدم الصلح",
    explanation_ar: "التسلسل الإلزامي لحل النزاع الجماعي هو: المصالحة (عقد جلسات مع مفتش العمل)، وفي حال الفشل يحرر محضر عدم صلح، ثم الوساطة والتحكيم أو تقديم إشعار مسبق بالإضراب وفق الآجال القانونية والتصويت السري للعمال.",
    trapType: "methodology",
    commonTrap_ar: "إغفال مرحلة المصالحة الإدارية والاعتقاد بجواز الإضراب فور ظهور الخلاف المهني دون استنفاذ الإجراءات السابقة.",
    twinQuestion: {
      id: "twin_law_collective_disputes_01",
      prompt_ar: "ما هو الأثر القانوني المباشر لممارسة حق الإضراب القانوني على عقد العمل بالنسبة للعامل المضرب؟",
      options_ar: [
        "تعليق علاقة العمل (وقف أداء العمل ووقف دفع الأجر) مع بقاء العقد سارياً",
        "فسخ عقد العمل فوراً لارتكاب خطأ جسيم",
        "استمرار دفع الأجر كاملاً مع بقاء العامل في بيته",
        "تحويل عقد العمل من غير محدد المدة إلى عقد محدد المدة"
      ],
      correctAnswer_ar: "تعليق علاقة العمل (وقف أداء العمل ووقف دفع الأجر) مع بقاء العقد سارياً",
      explanation_ar: "الإضراب القانوني يعلق التزامات الطرفين: العامل يمتنع عن تقديم جهده، وصاحب العمل يعفى من دفع الأجر طيلة فترة التوقف، وتعود العلاقة لطبيعتها فور انتهاء الإضراب."
    }
  }
];

export function convertToPracticeQuestions(items: DiagnosticPracticeItem[]): PracticeQuestion[] {
  const result: PracticeQuestion[] = [];

  const subjectMapping: Record<string, SubjectId> = {
    accounting: "accounting_finance",
    economics: "economics_management",
    law: "law",
  };

  const trapToErrorType: Record<string, SuspectedErrorType> = {
    misconception: "misunderstood_concept",
    calculation: "calculation_error",
    methodology: "methodology_error",
    reading_error: "misread_question",
  };

  for (const item of items) {
    const diffMap: Record<string, 1 | 2 | 3> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };
    const diff = diffMap[item.difficulty] || 2;
    const mappedSubjectId = subjectMapping[item.subjectId] || (item.subjectId as SubjectId);
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

export const GESTION_ECO_T1_FULL_PRACTICE_QUESTIONS: PracticeQuestion[] = convertToPracticeQuestions(gestionEcoT1FullPractice);
