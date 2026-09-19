import { ContentPackage } from "@/domain/content-quality/types";
import { GESTION_ECO_ALIASES } from "./batch1_gestion_eco_real_content";

/**
 * BAC Mastery — Gestion & Économie Canonical Content Packages
 * Complete 13-element pedagogical packages for all learning modes.
 */
export const GESTION_ECO_PACKAGES: Record<string, ContentPackage> = {
  // ===========================================================================
  // 1. ACCOUNTING & FINANCE (Mode A: Procedural)
  // ===========================================================================
  acc_depreciation_linear_degressive: {
    packageId: "pkg_acc_deprec_linear_degressive",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    topicId: "acc_topic_amortissements",
    skillId: "acc_depreciation_linear_degressive",
    objective_ar: "حساب قسط الاهتلاك السنوي، وتحديد القيمة المحاسبية الصافية VNC، وإجراء قيود التسوية في اليومية (ح/681 إلى ح/28).",
    objective_fr: "Calcul des annuités, détermination de la VNC et enregistrement comptable de régularisation (681 à 28).",
    prerequisites: [],
    lesson: {
      title_ar: "أعمال نهاية السنة: الاهتلاكات ونقص قيمة التثبيتات",
      contentMarkdown_ar: `### المفهوم القانوني والمحاسبي للاهتلاك
الاهتلاك هو استهلاك للمنافع الاقتصادية المرتبطة بأصل عيني أو معنوي عبر الزمن نتيجة الاستعمال أو التقادم التكنولوجي وفق النظام المحاسبي المالي SCF.

### طريقة الاهتلاك الخطي (Amortissement linéaire)
- معدل الاهتلاك الخطي: $$t = \frac{100}{N}\%$$ حيث N مدة النفع بالسنوات.
- القسط السنوي العادي: $$A = V_0 \times t$$
- قسط التناسب الزمني (Prorata temporis) للسنة الأولى:
  $$A_1 = V_0 \times t \times \frac{m}{12}$$
  حيث m عدد أشهر الاستعمال من تاريخ الاقتناء حتى 31/12 (أي شهر اقتني فيه قبل 15 يحتسب كاملاً).

### التسجيل المحاسبي لقيود التسوية في 31/12/N
- **مدين**: ح/681 (مخصصات الاهتلاكات والمؤونات وخسائر القيمة - أصول غير جارية)
- **دائن**: ح/281x (اهتلاك التثبيتات العينية) بمبلغ القسط السنوي المحسوب.`,
      keyTakeaway_ar: "التناسب الزمني للأشهر المستغلة في السنة الأولى إلزامي بموجب مبدأ الاستحقاق، والقيد دائماً من ح/681 إلى ح/28x.",
    },
    workedExample: {
      problem_ar: "اقتنت المؤسسة شاحنة بـ 1,200,000 دج في 01/04/2021 مدة نفعها 5 سنوات. احسب قسط 2021 وقيمة VNC في 31/12/2021 وسجل القيد.",
      stepByStepSolution_ar: [
        "حساب معدل الاهتلاك: t = 100 / 5 = 20%.",
        "حساب عدد أشهر الاستعمال لسنة 2021: من شهر أفريل إلى ديسمبر = 9 أشهر.",
        "حساب القسط: A = 1,200,000 * 0.20 * (9/12) = 180,000 دج.",
        "حساب VNC = 1,200,000 - 180,000 = 1,020,000 دج.",
        "التسجيل المحاسبي في 31/12/2021: مدين ح/681 بـ 180,000 دج، دائن ح/2818 بـ 180,000 دج.",
      ],
      pedagogicalComment_ar: "التركيز على حساب الأشهر الفعلية من شهر الحيازة يمنع خطأ احتساب سنة كاملة.",
    },
    activeRecall: {
      prompt_ar: "ما هو الحساب الدائن في قيد تسجيل قسط اهتلاك معدات النقل في 31/12؟",
      expectedAnswer_ar: "ح/2818 (اهتلاك معدات النقل).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_deprec_item_01",
        prompt_ar: "ما هو قسط اهتلاك آلة قيمتها 500,000 دج اقتنيت في 01/07/2023 تهتلك على 5 سنوات؟",
        optionsCount: 4,
        correctAnswerId: "opt_acc_d1_correct",
        explanation_ar: "A = 500,000 * 20% * (6/12) = 50,000 دج.",
        distractorErrorMappings: {
          opt_acc_d1_w1: "misunderstood_concept",
          opt_acc_d1_w2: "calculation_error",
          opt_acc_d1_w3: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_acc_deprec_item_twin",
      parentPracticeQuestionId: "pq_acc_deprec_item_01",
      prompt_ar: "[إعادة اختبار] آلة صناعية بقيمة 800,000 دج اقتنيت في 01/10/2023 تهتلك على 4 سنوات. احسب قسط 2023.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_acc_d_twin_correct",
      explanation_ar: "t = 25%. m = 3 أشهر. A = 800,000 * 25% * (3/12) = 50,000 دج.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "دليل تصحيح خطأ التناسب الزمني في الاهتلاكات",
      mentalModelExplanation_ar: "يقع التلميذ في خطأ نسيان التناسب الزمني حين يعامل سنة الحيازة كسنة كاملة متجاهلاً تاريخ الشراء.",
      actionableSteps_ar: [
        "انظر فوراً لتاريخ الاقتناء المذكور في نص التمرين.",
        "احسب عدد الأشهر من تاريخ الحيازة حتى 31/12: m = 13 - رقم الشهر.",
        "طبق صيغة التناسب الزمني: A = Vo * t * (m/12).",
        "تأكد أن القيد في اليومية يستخدم ح/681 مديناً وح/28x دائناً.",
      ],
      contrastiveWorkedExample: "حيازة في 01/04: الخطأ حساب 12 شهراً، الصواب حساب 9 أشهر (9/12).",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_tableau_amortissement"],
    externalResourceIds: ["res_scf_journal_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "سؤال دائم في الجزء الأول من موضوع المحاسبة لبكالوريا التسيير والاقتصاد (4 إلى 6 نقاط).",
      commonPitfalls_ar: ["نسيان التناسب الزمني", "استعمال حساب الأصل بدلاً من حساب الاهتلاك"],
      officialBacPastRefIds: ["BAC_GE_2023_Sujet1_Ex1", "BAC_GE_2022_Sujet2_Ex1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "حساب الاهتلاك الخطي هو خطوتك الأولى والمضمونة لحصد نقاط المحاسبة في البكالوريا.",
      nextBestActionHint_ar: "انتقل إلى جدول الاهتلاك المتناقص.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "الجريدة الرسمية للجمهورية الجزائرية - المرسوم التنفيذي 07-142 والنظام المحاسبي المالي",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ===========================================================================
  // 2. ECONOMICS & MANAGEMENT (Mode B: Conceptual)
  // ===========================================================================
  eco_money_inflation_causes_control: {
    packageId: "pkg_eco_inflation_causes_control",
    streamId: "gestion_eco",
    subjectId: "economics_management",
    topicId: "eco_topic_monnaie_inflation",
    skillId: "eco_money_inflation_causes_control",
    objective_ar: "تحليل ميكانيزمات التضخم وأنواعه، وربط أدوات السياسة النقدية والمالية بكبح الضغوط التضخمية.",
    objective_fr: "Analyse des mécanismes de l'inflation et mise en œuvre des politiques monétaire et budgétaire.",
    prerequisites: [],
    lesson: {
      title_ar: "التضخم: أسبابه، آثاره، ووسائل معالجته بالسياسات الاقتصادية",
      contentMarkdown_ar: `### تعريف التضخم
هو حركة صعودية مستمرة وملموسة للمستوى العام للأسعار مع انخفاض القدرة الشرائية للنقود.

### أنواع التضخم حسب الأسباب
1. **تضخم الطلب (Inflation par la demande)**: زيادة الطلب الكلي عن العرض الكلي للسلع والخدمات عند التشغيل الكامل.
2. **تضخم التكاليف (Inflation par les coûts)**: ارتفاع تكاليف عناصر الإنتاج (أجور، مواد أولية مستوردة، طاقة).
3. **التضخم النقدي**: الإفراط في الإصدار النقدي دون مقابل حقيقي من الإنتاج.

### السياسة النقدية العلاجية (Politique monétaire restrictive)
يقوم البنك المركزي بتطبيق أدوات السياسة الانكماشية:
- رفع معدل إعادة الخصم لكبح الاقتراض.
- رفع نسبة الاحتياطي الإجباري للبنوك لتجميد السيولة.
- بيع السندات الحكومية في السوق المفتوحة لسحب فائض النقود.`,
      keyTakeaway_ar: "التمييز بين أسباب التضخم شرط لاختيار السياسة الاقتصادية المناسبة (علاج تضخم الطلب بالسياسة النقدية والمالية الانكماشية).",
    },
    workedExample: {
      problem_ar: "شهد اقتصاد ارتفاعاً للأسعار بنسبة 8% ناتجاً عن زيادة الأجور ونفقات النقل البحري للمواد المستوردة. حدد نوع التضخم والإجراءات النقدية المناسبة.",
      stepByStepSolution_ar: [
        "تحديد السبب: ارتفاع مدخلات الإنتاج (أجور وتكاليف النقل المستورد).",
        "تكييف النوع: تضخم التكاليف (Inflation par les coûts).",
        "الإجراء النقدي: تدخل البنك المركزي برفع سعر الفائدة ورفع نسبة الاحتياطي الإجباري للحد من السيولة الفائضة.",
        "النتيجة المتوقعة: انخفاض القروض الموجهة للمضاربة والاستهلاك وكبح تصاعد الأسعار.",
      ],
      pedagogicalComment_ar: "الربط بين السبب والإجراء العلاجي هو جوهر التنقيط في البكالوريا.",
    },
    activeRecall: {
      prompt_ar: "ماذا يحدث للكتلة النقدية عندما يرفع البنك المركزي نسبة الاحتياطي الإجباري؟",
      expectedAnswer_ar: "تنكمش الكتلة النقدية نتيجة تراجع قدرة البنوك التجارية على خلق النقود والائتمان.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_eco_infl_item_01",
        prompt_ar: "أي أداة نقدية يفضلها البنك المركزي لسحب السيولة مباشرة من السوق المفتوحة؟",
        optionsCount: 4,
        correctAnswerId: "opt_eco_open_market",
        explanation_ar: "بيع السندات الحكومية في السوق المفتوحة يسحب السيولة النقدية من البنوك والجمهور.",
        distractorErrorMappings: {
          opt_eco_d1: "misunderstood_concept",
          opt_eco_d2: "forgot_information",
          opt_eco_d3: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_eco_infl_item_twin",
      parentPracticeQuestionId: "pq_eco_infl_item_01",
      prompt_ar: "[إعادة اختبار] عندما يخفض البنك المركزي معدل إعادة الخصم، ما هدفه الاقتصادي؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_eco_twin_correct",
      explanation_ar: "خفض معدل إعادة الخصم يهدف إلى تشجيع الاستثمار ومنح القروض وتنشيط النشاط الاقتصادي في فترات الركود.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "دليل ضبط أدوات السياسة النقدية وأثرها",
      mentalModelExplanation_ar: "يخلط الطلاب بين السياسة النقدية التوسعية (في الركود) والسياسة النقدية الانكماشية (في التضخم).",
      actionableSteps_ar: [
        "شخص الوضع الاقتصادي: هل المشكلة تضخم أم ركود؟",
        "إذا كان تضخماً: السياسة المطلوبة انكماشية (رفع الفائدة، رفع الاحتياطي الإجباري، بيع السندات).",
        "إذا كان ركوداً: السياسة المطلوبة توسعية (خفض الفائدة، خفض الاحتياطي الإجباري، شراء السندات).",
      ],
      contrastiveWorkedExample: "في التضخم: نرفع معدل إعادة الخصم لكبح القروض؛ لا نخفضه أبداً.",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_eco_inflation_diagram"],
    externalResourceIds: ["res_bank_of_algeria_policy"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "محور مركزي في أسئلة المقال والتحليل الاقتصادي في موضوع البكالوريا.",
      commonPitfalls_ar: ["الخلط بين تضخم الطلب وتضخم التكاليف", "عكس اتجاه أدوات السياسة النقدية"],
      officialBacPastRefIds: ["BAC_GE_2024_Sujet2_Eco", "BAC_GE_2021_Sujet1_Eco"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "المفاهيم الاقتصادية ترتكز على المنطق السببي؛ اربط السبب بالأداة بالنتيجة لتضمن العلامة الكاملة.",
      nextBestActionHint_ar: "انتقل إلى درس النظام المصرفي وبنك الجزائر.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "المنهاج الرسمي لمادة الاقتصاد والمناجمنت - وزارة التربية الوطنية",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ===========================================================================
  // 3. LAW (Mode C: Case-based Syllogism)
  // ===========================================================================
  law_labor_contract_trial_termination: {
    packageId: "pkg_law_labor_contract_trial",
    streamId: "gestion_eco",
    subjectId: "law",
    topicId: "law_topic_contrat_travail",
    skillId: "law_labor_contract_trial_termination",
    objective_ar: "تطبيق قواعد القانون 90-11 على النوازل العمالية: مدة فترة التجربة، حالات الفسخ المشروع، والتسريح التعسفي.",
    objective_fr: "Application du droit du travail (loi 90-11) aux cas pratiques : période d'essai et licenciement.",
    prerequisites: [],
    lesson: {
      title_ar: "عقد العمل: التكوين، فترة التجربة، والإنهاء القانوني لعلاقة العمل",
      contentMarkdown_ar: `### شروط وتكييف عقد العمل (القانون 90-11)
- **الأصل**: عقد العمل غير محدد المدة (CDI).
- **الاستثناء**: عقد العمل محدد المدة (CDD) المنصوص عليه في المادة 12 بحالات حصرية (أشغال مؤقتة، استخلاف عامل، تزايد استثنائي في العمل).

### فترة التجربة (Période d'essai)
- لا تتجاوز 6 أشهر كقاعدة عامة (المادة 18)، ويمكن أن ترفع إلى 12 شهراً للمناصب ذات التأهيل العالي باتفاقيات جماعية.
- خلال فترة التجربة يجوز فسخ العقد دون تعويض أو إشعار مسبق.
- بعد انقضاء فترة التجربة يصبح العقد نهائياً ولا ينتهي إلا بالحالات القانونية للمادة 66.

### التسريح التعسفي (Licenciement abusif)
- إنهاء عقد العمل دون سبب قانوني جدي أو خرقاً للإجراءات التأديبية.
- الجزاء: إعادة إدماج العامل بالمؤسسة مع الحفاظ على حقوقه، أو تعويض مالي عادل لا يقل عن 6 أشهر أجر (المادة 73 مكرر).`,
      keyTakeaway_ar: "حل النازلة القانونية في البكالوريا يتطلب منهجية القياس القضائي: الوقائع -> السند القانوني -> التكييف القانوني -> الحل والحكم.",
    },
    workedExample: {
      problem_ar: "وظف محاسب بعقد CDI وحددت فترة التجربة بـ 9 أشهر. في الشهر السابع فسخ العقد بإرادة منفردة دون خطأ مهني. ما حكم هذا الفسخ؟",
      stepByStepSolution_ar: [
        "الوقائع: تشغيل محاسب مع اشتراط فترة تجربة 9 أشهر وفسخ العقد في الشهر السابع.",
        "السند القانوني: المادة 18 من القانون 90-11 تحدد سقف فترة التجربة بـ 6 أشهر للمناصب العادية.",
        "التكييف القانوني: بند الـ 9 أشهر باطل، والمحاسب يعتبر مثبتاً نهائياً بعد الشهر السادس، وإنهاء العقد في الشهر السابع لا يدخل ضمن التجربة.",
        "الحكم والحل: الفسخ تسريح تعسفي يستوجب إعادة الإدماج أو دفع التعويضات المالية المنصوص عليها في المادة 73 مكرر.",
      ],
      pedagogicalComment_ar: "الاستدلال بالمواد القانونية وحماية النظام العام العمالي هو المعيار الحاسم في التنقيط.",
    },
    activeRecall: {
      prompt_ar: "ما هو الحد الأقصى القانوني لفترة التجربة للعامل العادي وفق المادة 18 من قانون العمل؟",
      expectedAnswer_ar: "6 أشهر كحد أقصى.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_law_contract_item_01",
        prompt_ar: "متى يتحول عقد العمل محدد المدة (CDD) قانوناً إلى عقد غير محدد المدة (CDI)؟",
        optionsCount: 4,
        correctAnswerId: "opt_law_cdd_to_cdi",
        explanation_ar: "يتحول حكماً إلى CDI إذا أبرم دون توفر إحدى حالات المادة 12 أو إذا استمر العامل في أداء مهامه بعد انتهاء مدته دون تجديد.",
        distractorErrorMappings: {
          opt_law_d1: "misunderstood_concept",
          opt_law_d2: "methodology_error",
          opt_law_d3: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_law_contract_item_twin",
      parentPracticeQuestionId: "pq_law_contract_item_01",
      prompt_ar: "[إعادة اختبار] ما هو الأثر القانوني لاستمرار علاقة العمل بعد انتهاء المدة المحددة في عقد CDD دون فسخ أو تجديد مكتوب؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_law_twin_correct",
      explanation_ar: "يتحول العقد بقوة القانون إلى عقد غير محدد المدة (CDI).",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "دليل حل النوازل والوضعيات القانونية",
      mentalModelExplanation_ar: "يجيب التلاميذ غالباً بانطباع شخصي عاطفي بدلاً من الاستناد الصارم إلى نصوص القانون ومواده.",
      actionableSteps_ar: [
        "استخرج الوقائع المادية المجردة من سند التمرين.",
        "استحضر القاعدة القانونية ذات الصلة من القانون 90-11 أو القانون التجاري.",
        "كيف الوقائع وفق القاعدة: هل العمل مشروع؟ هل الشرط باطل؟ هل انتهت الآجال؟",
        "صغ الحل القانوني والنتيجة بأسلوب فقهي محكم.",
      ],
      contrastiveWorkedExample: "لا تقل 'المدير ظلمه ويستحق تعويض'، بل قل: 'الفسخ خرق المادة 18 ويعد تسريحاً تعسفياً موجب للتعويض طبقاً للمادة 73 مكرر'.",
    },
    visualNecessity: "VISUAL_NOT_NEEDED",
    visualAssetIds: [],
    externalResourceIds: ["res_algerian_labor_law_90_11"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "الوضعية التقويمية (Cas pratique) تمثل 8 نقاط كاملة من موضوع القانون في البكالوريا.",
      commonPitfalls_ar: ["غياب التكييف القانوني", "إهمال ذكر الأساس التشريعي"],
      officialBacPastRefIds: ["BAC_GE_2023_Droit_Sujet1", "BAC_GE_2020_Droit_Sujet2"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "القانون مادة مبنية على المنطق الإجرائي؛ رتب إجابتك كالقاضي لتحصل على العلامة التامة.",
      nextBestActionHint_ar: "انتقل إلى النزاعات الجماعية للعمل والإضراب.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "المنهاج الرسمي لمادة القانون - وزارة التربية الوطنية والقانون 90-11",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ===========================================================================
  // 4. MATHEMATICS (Mode A: Quantitative Regression & Sequences)
  // ===========================================================================
  math_two_variable_statistics_regression: {
    packageId: "pkg_math_two_variable_stats",
    streamId: "gestion_eco",
    subjectId: "math",
    topicId: "math_topic_statistiques_regression",
    skillId: "math_two_variable_statistics_regression",
    objective_ar: "تمثيل سحابة النقط، وتعيين النقطة المتوسطة G، وحساب مستقيم الانحدار الخطي بالمربعات الصغرى للتنبؤ الاقتصادي.",
    objective_fr: "Ajustement linéaire par la méthode des moindres carrés et prévisions économiques.",
    prerequisites: [],
    lesson: {
      title_ar: "الإحصاء والمتغيرين: مستقيم الانحدار والتعديل الخطي",
      contentMarkdown_ar: `### السلسلة الإحصائية لمتغيرين (x, y)
- النقطة المتوسطة: $$G(\bar{x}, \bar{y})$$ حيث $\bar{x} = \frac{1}{N}\sum x_i$ و $\bar{y} = \frac{1}{N}\sum y_i$.
- التباين: $$V(x) = \frac{1}{N}\sum x_i^2 - (\bar{x})^2$$
- التباين المشترك: $$Cov(x, y) = \frac{1}{N}\sum x_i y_i - \bar{x} \cdot \bar{y}$$

### مستقيم الانحدار الخطي لـ y على x (Moindres carrés)
معادلته من الشكل:
$$y = ax + b$$
حيث:
$$a = \frac{Cov(x, y)}{V(x)}, \quad b = \bar{y} - a \cdot \bar{x}$$

المستقيم يمر حتماً بالنقطة المتوسطة $G(\bar{x}, \bar{y})$، ويستعمل لتقدير وتوقع القيم المستقبلية للمتغير التابع y.`,
      keyTakeaway_ar: "معامل التوجيه a يقسم دائماً على تباين المتغير المستقل V(x)، وحساب b يتطلب طرح a*x̄ من ȳ.",
    },
    workedExample: {
      problem_ar: "أظهرت معطيات مبيعات: x̄ = 4، ȳ = 15، Cov(x, y) = 12، و V(x) = 4. اكتب معادلة مستقيم الانحدار وقدر y عند x = 6.",
      stepByStepSolution_ar: [
        "حساب معامل التوجيه: a = Cov(x, y) / V(x) = 12 / 4 = 3.",
        "حساب الثابت: b = ȳ - a * x̄ = 15 - (3 * 4) = 15 - 12 = 3.",
        "معادلة مستقيم التعديل: y = 3x + 3.",
        "التحقق: يمر بالنقطة المتوسطة G(4, 15) لأن 3(4) + 3 = 15.",
        "التقدير عند x = 6: y = 3(6) + 3 = 18 + 3 = 21.",
      ],
      pedagogicalComment_ar: "التحقق من مرور المستقيم بالنقطة G يضمن سلامة الحسابات.",
    },
    activeRecall: {
      prompt_ar: "ما هي النقطة الإجبارية التي يمر بها مستقيم الانحدار الخطي؟",
      expectedAnswer_ar: "النقطة المتوسطة للسلسلة الإحصائية G(x̄, ȳ).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_reg_item_01",
        prompt_ar: "إذا كان Cov(x, y) = 20 و V(x) = 5، فما هو معامل التوجيه a لمستقيم الانحدار؟",
        optionsCount: 4,
        correctAnswerId: "opt_math_reg_a4",
        explanation_ar: "a = Cov(x, y) / V(x) = 20 / 5 = 4.",
        distractorErrorMappings: {
          opt_math_d1: "calculation_error",
          opt_math_d2: "misunderstood_concept",
          opt_math_d3: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_math_reg_item_twin",
      parentPracticeQuestionId: "pq_math_reg_item_01",
      prompt_ar: "[إعادة اختبار] إذا كان Cov(x, y) = 15 و V(x) = 5، و ȳ = 20، و x̄ = 3، فما هو الثابت b في معادلة المستقيم؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_math_reg_twin_b",
      explanation_ar: "a = 15/5 = 3. b = ȳ - a*x̄ = 20 - (3*3) = 20 - 9 = 11.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "دليل تفادي الأخطاء في حساب مستقيم الانحدار الخطي",
      mentalModelExplanation_ar: "يخلط الطلاب بين تباين x وتباين y في مقام معامل التوجيه، أو ينسون طرح a*x̄ عند حساب الثابت b.",
      actionableSteps_ar: [
        "تأكد من كتابة قانون a بشكل صريح: Cov(x, y) / V(x).",
        "احسب a أولاً واختزله إلى عدد عشري أو كسر مضبوط.",
        "احسب b بتطبيق b = ȳ - a * x̄ وانتبه للإشارات السالبة.",
        "عوض إحداثيي النقطة G للتأكد من صحة المعادلة قبل التنبؤ.",
      ],
      contrastiveWorkedExample: "خطأ شائع: قسمة Cov على V(y) بدلاً من V(x).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["visual_math_nuage_points"],
    externalResourceIds: ["res_stats_moindres_carres"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تمرين إحصاء كامل (4 إلى 5 نقاط) شبه مؤكد في مواضيع بكالوريا التسيير والاقتصاد.",
      commonPitfalls_ar: ["الخلط بين مستقيم y على x ومستقيم x على y", "خطأ في حساب الثابت b"],
      officialBacPastRefIds: ["BAC_GE_2023_Math_Sujet2", "BAC_GE_2021_Math_Sujet1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "تمرين الإحصاء هو أسهل نقاط يمكنك كسبها في رياضيات التسيير؛ تدرب على الدقة الحسابية فقط.",
      nextBestActionHint_ar: "انتقل إلى المتتاليات العددية في النمذجة الاقتصادية.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات - شعبة تسيير واقتصاد",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ===========================================================================
  // 5. BATCH 01 AUTHENTIC PACKAGES (Replacing Mock Data)
  // ===========================================================================
  acc_impairment_tangible_assets: {
    packageId: "pkg_acc_impairment_tangible_assets",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    topicId: "acc_topic_amortissements",
    skillId: "acc_impairment_tangible_assets",
    objective_ar: "خسارة القيمة عن التثبيتات العينية وتعديل جدول الإهتلاك",
    objective_fr: "Dépréciation des immobilisations corporelles et révision du plan d'amortissement.",
    prerequisites: ["acc_depreciation_linear_degressive"],
    lesson: {
      title_ar: "خسارة القيمة عن التثبيتات العينية وتعديل جدول الإهتلاك",
      contentMarkdown_ar: `### خسارة القيمة عن التثبيتات العينية
تُسجل خسارة القيمة عندما تكون القيمة المحاسبية الصافية (VNC) أكبر من القيمة القابلة للتحصيل (سعر البيع الصافي أو القيمة النفعية أيهما أكبر). يترتب على إثبات الخسارة تعديل جدول الاهتلاك للسنوات المتبقية بقسمة الـ VNC الجديدة على عدد السنوات المتبقية.

### القواعد الحسابية الأساسية:
- اختبار الخسارة: خسارة القيمة = VNC - القيمة القابلة للتحصيل (PVN). إذا كان الفرق موجباً تُثبت الخسارة.
- التسجيل المحاسبي في 31/12: من حـ/ 681 (مخصصات الاهتلاكات والمؤونات وخسائر القيمة) إلى حـ/ 291 (خسائر القيمة عن التثبيتات العينية).
- تعديل قسط الاهتلاك اللاحق: قسط الاهتلاك الجديد = (VNC بعد الخسارة) / (المدة المتبقية ن).`,
      keyTakeaway_ar: "اختبار الخسارة: خسارة القيمة = VNC - القيمة القابلة للتحصيل، والتعديل اللاحق يقسم VNC الجديدة على السنوات المتبقية.",
    },
    workedExample: {
      problem_ar: "حازت مؤسسة على معدات صناعية بقيمة 800,000 دج بتاريخ 02/01/2022 تُهتلك خطياً على مدار 5 سنوات. في 31/12/2023 قدرت قيمتها القابلة للتحصيل بـ 420,000 دج. ما هي خسارة القيمة الواجب تسجيلها في 31/12/2023؟",
      stepByStepSolution_ar: [
        "قسط الاهتلاك السنوي: A = 800,000 / 5 = 160,000 دج.",
        "مجموع الاهتلاكات لسنتين (2022 و 2023): ΣA = 160,000 × 2 = 320,000 دج.",
        "القيمة الصافية VNC = 800,000 - 320,000 = 480,000 دج.",
        "خسارة القيمة = VNC - القيمة القابلة للتحصيل = 480,000 - 420,000 = 60,000 دج تُقيد لحساب 2915.",
      ],
      pedagogicalComment_ar: "مقارنة VNC بالقيمة القابلة للتحصيل تحدد وجود الخسارة من عدمها بدقة.",
    },
    activeRecall: {
      prompt_ar: "ما هو الحساب الدائن عند تسجيل خسارة القيمة عن التثبيتات العينية في 31/12؟",
      expectedAnswer_ar: "حـ/ 291 (خسائر القيمة عن التثبيتات العينية).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_impair_01",
        prompt_ar: "حازت مؤسسة على معدات صناعية بقيمة 800,000 دج بتاريخ 02/01/2022 تُهتلك خطياً على مدار 5 سنوات. في 31/12/2023 قدرت قيمتها القابلة للتحصيل بـ 420,000 دج. ما هي خسارة القيمة الواجب تسجيلها في 31/12/2023؟",
        optionsCount: 4,
        correctAnswerId: "opt_a",
        explanation_ar: "1) قسط الاهتلاك السنوي: A = 800,000 / 5 = 160,000 دج.\n2) مجموع الاهتلاكات لسنتين (2022 و 2023): ΣA = 160,000 × 2 = 320,000 دج.\n3) القيمة الصافية VNC = 800,000 - 320,000 = 480,000 دج.\n4) خسارة القيمة = VNC - القيمة القابلة للتحصيل = 480,000 - 420,000 = 60,000 دج تُقيد لحساب 2915.",
        distractorErrorMappings: {
          opt_b: "calculation_error",
          opt_c: "misunderstood_concept",
          opt_d: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_acc_impair_twin",
      parentPracticeQuestionId: "pq_acc_impair_01",
      prompt_ar: "[إعادة اختبار] بناءً على المعطيات السابقة (VNC بعد الخسارة = 420,000 دج في نهاية 2023 والمدة الإجمالية 5 سنوات)، كم يبلغ قسط الاهتلاك لسنة 2024 بعد تعديل الجدول؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "iso_a",
      explanation_ar: "السنوات المتبقية بعد انقضاء سنتين هي: 5 - 2 = 3 سنوات. قسط الاهتلاك المعدل لسنة 2024 = 420,000 / 3 = 140,000 دج.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "دليل تصحيح خطأ تعديل جدول الاهتلاك بعد خسارة القيمة",
      mentalModelExplanation_ar: "مواصلة حساب قسط الاهتلاك على أساس القيمة الأصلية MA بعد تاريخ إثبات خسارة القيمة؛ القاعدة تفرض أن تصبح VNC بعد الخسارة هي الأساس الجديد للاهتلاك.",
      actionableSteps_ar: [
        "احسب VNC بتاريخ إثبات الخسارة.",
        "اطرح القيمة القابلة للتحصيل لتحديد خسارة القيمة.",
        "اجعل VNC الجديدة هي الأساس للأقساط المتبقية.",
        "اقسم VNC الجديدة على عدد السنوات المتبقية فقط.",
      ],
      contrastiveWorkedExample: "الأساس الجديد = 420,000 دج مقسومة على 3 سنوات = 140,000 دج وليس 800,000 / 5.",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_tableau_amortissement"],
    externalResourceIds: ["res_scf_journal_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "سؤال أساسي في أعمال نهاية السنة في بكالوريا التسيير والاقتصاد.",
      commonPitfalls_ar: ["نسيان تعديل قسط الاهتلاك بعد الخسارة", "حساب الخسارة على أساس القيمة الإجمالية"],
      officialBacPastRefIds: ["BAC_GE_2023_Sujet1_Ex1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "خسائر القيمة وتعديل جدول الاهتلاك سؤال مضمون عند اتباع الخطوات المنهجية.",
      nextBestActionHint_ar: "انتقل إلى تسوية الزبائن المشكوك فيهم.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "الجريدة الرسمية - النظام المحاسبي المالي SCF",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  acc_doubtful_clients_adjustment: {
    packageId: "pkg_acc_doubtful_clients_adjustment",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    topicId: "acc_topic_amortissements",
    skillId: "acc_doubtful_clients_adjustment",
    objective_ar: "الزبائن المشكوك فيهم وتعديل خسائر القيمة وحالات الإفلاس",
    objective_fr: "Créances clients douteux, ajustement des dépréciations et constatation des pertes sur créances irrécouvrables.",
    prerequisites: ["acc_depreciation_linear_degressive"],
    lesson: {
      title_ar: "الزبائن المشكوك فيهم وتعديل خسائر القيمة وحالات الإفلاس",
      contentMarkdown_ar: `### تسوية حسابات الزبائن
تخضع ديون الزبائن للمتابعة في نهاية السنة المالية: تحويل الزبون العادي إلى مشكوك فيه (حـ/ 416)، تكوين أو تعديل خسارة القيمة (حـ/ 491)، وحالة الإفلاس النهائي مع ترصيد الرسم على القيمة المضافة المحصل (حـ/ 4457).

### القواعد الأساسية:
- التحويل من زبون عادي إلى مشكوك فيه: القيمة الإجمالية المتضمنة للرسم TTC تُقيد من حـ/ 416 إلى حـ/ 411.
- حساب خسارة القيمة: الخسارة تُحسب دائماً على المبلغ خارج الرسم: HT = TTC / 1.19.
- تعديل الخسارة: إذا كانت الخسارة الحالية > السابقة: تسجيل زيادة من حـ/ 685 إلى حـ/ 491. وإذا كانت الحالية < السابقة: تسجيل استرجاع من حـ/ 491 إلى حـ/ 785.
- الإفلاس الحقيقي: الخسارة الحقيقية تظهر في حـ/ 654 (خسائر عن حسابات دائنة غير قابلة للتحصيل) بمبلغ HT الصافي غير المغطى بالمؤونة.`,
      keyTakeaway_ar: "حساب خسارة القيمة للزبائن المشكوك فيهم يُحسب دائماً على المبلغ خارج الرسم HT وليس المتضمن للرسم TTC.",
    },
    workedExample: {
      problem_ar: "الزبون 'سمير' مدين بمبلغ 119,000 دج (TTC معدل الرسم 19%). قدرت المؤسسة في 31/12/2023 احتمال عدم استرجاع 40% من دينه. ما هو مبلغ خسارة القيمة الواجب تكوينها؟",
      stepByStepSolution_ar: [
        "حساب الدين خارج الرسم: HT = 119,000 / 1.19 = 100,000 دج.",
        "خسارة القيمة التقديرية = 100,000 × 0.40 = 40,000 دج.",
        "القيد: من حـ/ 685 إلى حـ/ 491 بمبلغ 40,000 دج.",
      ],
      pedagogicalComment_ar: "التحويل الصارم إلى المبلغ خارج الرسم HT يمنع الوقوع في الخطأ الشائع بحساب النسبة على TTC.",
    },
    activeRecall: {
      prompt_ar: "على أي مبلغ تُحسب خسارة القيمة لزبون مشكوك فيه؟",
      expectedAnswer_ar: "على المبلغ خارج الرسم (HT = TTC / 1.19).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_doubtful_01",
        prompt_ar: "الزبون 'سمير' مدين بمبلغ 119,000 دج (TTC معدل الرسم 19%). قدرت المؤسسة في 31/12/2023 احتمال عدم استرجاع 40% من دينه. ما هو مبلغ خسارة القيمة الواجب تكوينها؟",
        optionsCount: 4,
        correctAnswerId: "opt_a",
        explanation_ar: "1) حساب الدين خارج الرسم: HT = 119,000 / 1.19 = 100,000 دج.\n2) خسارة القيمة التقديرية = 100,000 × 0.40 = 40,000 دج.\n3) القيد: من حـ/ 685 إلى حـ/ 491 بمبلغ 40,000 دج.",
        distractorErrorMappings: {
          opt_b: "calculation_error",
          opt_c: "misunderstood_concept",
          opt_d: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_acc_doubtful_twin",
      parentPracticeQuestionId: "pq_acc_doubtful_01",
      prompt_ar: "[إعادة اختبار] في 31/12/2024 أعلن الزبون سمير إفلاسه نهائياً بعد أن سدد للمؤسسة مبلغ 59,500 دج TTC خلال العام، وكانت خسارته السابقة 40,000 دج. ما هو رصيد الخسارة غير القابلة للتحصيل حـ/ 654؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "iso_a",
      explanation_ar: "الرصيد الباقي TTC = 119,000 - 59,500 = 59,500 دج. الرصيد خارج الرسم HT = 59,500 / 1.19 = 50,000 دج. بما أن الخسارة السابقة المشكلة كانت 40,000 دج فقط، فإن الخسارة الحقيقية غير المغطاة = 50,000 - 40,000 = 10,000 دج تُسجل في المدين لحساب 654.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "دليل ضبط حسابات الزبائن المشكوك فيهم والإفلاس",
      mentalModelExplanation_ar: "حساب خسارة القيمة أو نسبة الاحتمال على المبلغ المتضمن للرسم TTC بدلاً من خارج الرسم HT خطأ محاسبي يجب تفاديه.",
      actionableSteps_ar: [
        "حول المبلغ دوماً إلى خارج الرسم: HT = TTC / 1.19.",
        "احسب خسارة القيمة التقديرية الحالية بضرب HT في النسبة.",
        "قارن الخسارة الحالية بالخسارة السابقة لتسجيل الزيادة أو الاسترجاع.",
        "في حالة الإفلاس رصد حساب 4457 وحساب 491 وسجل الفارق في حـ/ 654.",
      ],
      contrastiveWorkedExample: "119,000 TTC = 100,000 HT. الخسارة 40% = 40,000 دج وليس 47,600 دج.",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_tableau_amortissement"],
    externalResourceIds: ["res_scf_journal_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "وضعية الزبائن المشكوك فيهم من الثوابت الامتحانية السنوية في البكالوريا.",
      commonPitfalls_ar: ["الضرب المباشر في TTC", "نسيان ترصيد TVA عند الإفلاس"],
      officialBacPastRefIds: ["BAC_GE_2022_Sujet1_Ex2"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "قاعدة HT هي المفتاح السحري لكل مسائل الزبائن المشكوك فيهم.",
      nextBestActionHint_ar: "انتقل إلى ميزان المدفوعات والتجارة الخارجية.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "النظام المحاسبي المالي - تسوية حسابات الغير",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  eco_foreign_trade_balance_payments: {
    packageId: "pkg_eco_foreign_trade_balance_payments",
    streamId: "gestion_eco",
    subjectId: "economics_management",
    topicId: "eco_topic_monnaie_inflation",
    skillId: "eco_foreign_trade_balance_payments",
    objective_ar: "ميزان المدفوعات: الهيكل، التوازن الاقتصادي، وسياسات المعالجة",
    objective_fr: "Commerce extérieur, structure de la balance des paiements et politiques d'ajustement.",
    prerequisites: ["eco_money_inflation_causes_control"],
    lesson: {
      title_ar: "ميزان المدفوعات: الهيكل، التوازن الاقتصادي، وسياسات المعالجة",
      contentMarkdown_ar: `### ميزان المدفوعات
ميزان المدفوعات هو سجل محاسبي تسجل فيه كافة المعاملات الاقتصادية والمالية التي تتم بين المقيمين في دولة ما وغير المقيمين (العالم الخارجي) خلال فترة زمنية عادة ما تكون سنة. ينقسم إلى ثلاثة حسابات رئيسية: حساب العمليات الجارية، حساب رأس المال، وحساب المعاملات المالية.

### العناصر الجوهرية:
- حساب العمليات الجارية: يشمل الميزان التجاري (الصادرات والواردات السلعية)، ميزان الخدمات، ميزان الدخل الأولي، والدخل الثانوي (التحويلات الجارية).
- الميزان التجاري: الصادرات السلعية FOB - الواردات السلعية CAF. فائض إذا كانت الصادرات أكبر، وعجز إذا كانت الواردات أكبر.
- التوازن المحاسبي والاقتصادي: ميزان المدفوعات متوازن محاسبياً دائماً بالضرورة بالاعتماد على القيد المزدوج، لكنه قد يعاني من عجز أو فائض اقتصادي في الحساب الجاري.
- سياسات تصحيح العجز: تخفيض قيمة العملة الوطنية لترقية الصادرات، تشجيع الاستثمار الأجنبي المباشر، الرسوم الجمركية وترشيد الواردات.`,
      keyTakeaway_ar: "الميزان التجاري = الصادرات FOB - الواردات CAF. التوازن المحاسبي دائم بينما التوازن الاقتصادي يرتبط برصيد الحساب الجاري.",
    },
    workedExample: {
      problem_ar: "إذا بلغت صادرات الجزائر السلعية (FOB) 45 مليار دولار وبلغت وارداتها السلعية (CAF) 38 مليار دولار خلال سنة، فإن الميزان التجاري يسجل:",
      stepByStepSolution_ar: [
        "تحديد قانون الميزان التجاري: الرصيد = الصادرات السلعية FOB - الواردات السلعية CAF.",
        "التعويض العددي: 45 - 38 = +7 مليارات دولار.",
        "النتيجة: إشارة موجبة تدل على تحقيق فائض تجاري لصالح الاقتصاد الوطني.",
      ],
      pedagogicalComment_ar: "الصادرات تُقوّم دائماً فوب (FOB) والواردات سيف (CAF).",
    },
    activeRecall: {
      prompt_ar: "ما هي الحسابات الثلاثة الرئيسية لميزان المدفوعات؟",
      expectedAnswer_ar: "1) حساب العمليات الجارية، 2) حساب رأس المال، 3) حساب المعاملات المالية.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_eco_trade_01",
        prompt_ar: "إذا بلغت صادرات الجزائر السلعية (FOB) 45 مليار دولار وبلغت وارداتها السلعية (CAF) 38 مليار دولار خلال سنة، فإن الميزان التجاري يسجل:",
        optionsCount: 4,
        correctAnswerId: "opt_a",
        explanation_ar: "رصيد الميزان التجاري = الصادرات السلعية - الواردات السلعية = 45 - 38 = +7 مليارات دولار (إشارة موجبة تدل على تحقيق فائض تجاري لصالح الاقتصاد الوطني).",
        distractorErrorMappings: {
          opt_b: "calculation_error",
          opt_c: "misunderstood_concept",
          opt_d: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_eco_trade_twin",
      parentPracticeQuestionId: "pq_eco_trade_01",
      prompt_ar: "[إعادة اختبار] أيٌّ من العناصر التالية يُسجل حصرياً ضمن 'حساب رأس المال' في ميزان المدفوعات الجزائري؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "iso_a",
      explanation_ar: "حساب رأس المال يقتصر على تحويلات الأصول غير المالية غير المنتجة كشراء أو بيع الأصول غير الملموسة (براءات الاختراع، العلامات التجارية) والمساعدات الرأسمالية الاستثمارية الموجهة للبنى التحتية وإلغاء الديون.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "دليل التمييز بين حسابات ميزان المدفوعات والتوازن المحاسبي والاقتصادي",
      mentalModelExplanation_ar: "الخلط بين التوازن المحاسبي الإجباري (القائم على بند السهو والخطأ وحساب الاحتياطيات) والعجز الاقتصادي الواقعي في العمليات التجارية الجارية.",
      actionableSteps_ar: [
        "فرق بين الصادرات والواردات السلعية (الميزان التجاري) وميزان الخدمات والتحويلات.",
        "ميزان المدفوعات متوازن محاسبياً دائماً بحكم القيد المزدوج.",
        "الحكم على وجود عجز أو فائض اقتصادي يكون من خلال رصيد الحساب الجاري.",
      ],
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_eco_inflation_diagram"],
    externalResourceIds: ["res_bank_of_algeria_policy"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "محور مبرمج في أسئلة التحليل الاقتصادي وحساب الأرصدة التجارية.",
      commonPitfalls_ar: ["الخلط بين حساب رأس المال والحساب المالي"],
      officialBacPastRefIds: ["BAC_GE_2023_Eco_Sujet1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "فهم بنية ميزان المدفوعات يمنحك إجابة واثقة ومنظمة في أسئلة الاقتصاد.",
      nextBestActionHint_ar: "انتقل إلى شركات المساهمة في القانون التجاري.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "المنهاج الرسمي لمادة الاقتصاد والمناجمنت - التجارة الخارجية",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  law_commercial_companies_spa: {
    packageId: "pkg_law_commercial_companies_spa",
    streamId: "gestion_eco",
    subjectId: "law",
    topicId: "law_topic_contrat_travail",
    skillId: "law_commercial_companies_spa",
    objective_ar: "شركة المساهمة (SPA): التأسيس، رأس المال، والمسؤولية القانونية",
    objective_fr: "Société par Actions (SPA) : constitution, capital social et responsabilité des actionnaires.",
    prerequisites: ["law_labor_contract_trial_termination"],
    lesson: {
      title_ar: "شركة المساهمة (SPA): التأسيس، رأس المال، والمسؤولية القانونية",
      contentMarkdown_ar: `### شركة المساهمة في القانون التجاري الجزائري
شركة المساهمة هي النموذج الأبرز لشركات الأموال في القانون التجاري الجزائري. ينقسم رأسمالها إلى أسهم قابلة للتداول، وتتحدد مسؤولية الشريك فيها بقدر ما يملكه من أسهم فقط، ولا يكتسب الشريك فيها صفة التاجر.

### الخصائص القانونية:
- عدد الشركاء: لا يقل عن 7 مساهمين على الأقل.
- الحد الأدنى لرأس المال: 5 ملايين دينار جزائري (5,000,000 دج) في حالة اللجوء العلني للادخار، ومليون دينار جزائري (1,000,000 دج) في حالة عدم اللجوء العلني للادخار.
- طبيعة الأسهم: حصص نقدية أو عينية، ولا يجوز تقديم حصص بالعمل. الأسهم قابلة للتداول بالطرق التجارية.
- الإدارة: يديرها إما مجلس إدارة يترأسه رئيس مجلس الإدارة (PDG)، أو مجلس مديرين تحت رقابة مجلس المراقبة.`,
      keyTakeaway_ar: "شركة المساهمة شركة أموال: الحد الأدنى 7 مساهمين، رأس المال 1 أو 5 ملايين دج، ومسؤولية المساهم محدودة بقيمة أسهمه دون اكتساب صفة التاجر.",
    },
    workedExample: {
      problem_ar: "يرغب مجموعة من المستثمرين في تأسيس شركة مساهمة (SPA) دون اللجوء العلني للادخار في الجزائر. ما هو الحد الأدنى القانوني لعدد الشركاء ورأس المال التأسيسي وفق القانون التجاري؟",
      stepByStepSolution_ar: [
        "الاستناد إلى المادة 592 من القانون التجاري الجزائري: عدد المساهمين لا يقل عن 7.",
        "الاستناد إلى المادة 594: رأس المال الأدنى بدون لجوء علني للادخار هو 1,000,000 دج (ومع اللجوء للادخار 5,000,000 دج).",
        "النتيجة: 7 مساهمين ورأس مال قدره 1,000,000 دج على الأقل.",
      ],
      pedagogicalComment_ar: "التمييز بين حالتي اللجوء للادخار وعدم اللجوء إليه حاسم في تحديد رأس المال الأدنى.",
    },
    activeRecall: {
      prompt_ar: "ما هو الحد الأدنى لعدد المساهمين في شركة المساهمة وفق القانون التجاري الجزائري؟",
      expectedAnswer_ar: "7 مساهمين على الأقل.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_law_spa_01",
        prompt_ar: "يرغب مجموعة من المستثمرين في تأسيس شركة مساهمة (SPA) دون اللجوء العلني للادخار في الجزائر. ما هو الحد الأدنى القانوني لعدد الشركاء ورأس المال التأسيسي وفق القانون التجاري؟",
        optionsCount: 4,
        correctAnswerId: "opt_a",
        explanation_ar: "نصت المادة 592 من القانون التجاري الجزائري على ألا يقل عدد المساهمين عن 7، والمادة 594 حددت رأس المال الأدنى بـ 1,000,000 دج إذا كانت الشركة لا تدعو الجمهور للاكتتاب، و5,000,000 دج في حالة اللجوء للادخار.",
        distractorErrorMappings: {
          opt_b: "misunderstood_concept",
          opt_c: "forgot_information",
          opt_d: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_law_spa_twin",
      parentPracticeQuestionId: "pq_law_spa_01",
      prompt_ar: "[إعادة اختبار] توفي أحد المساهمين في شركة مساهمة وكان يملك 10% من أسهمها. ما هو الأثر القانوني لوفاته على استمرار الشركة ومسؤولية ورثته؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "iso_a",
      explanation_ar: "شركات الأموال تقوم على الاعتبار المالي وليس الشخصي؛ وفاة أحد المساهمين أو إفلاسه لا يؤثر إطلاقاً على قيام الشركة، وتنتقل ملكية الأسهم كورقة مالية إلى الورثة الشرعيين.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "دليل التمييز بين شركات الأموال وشركات الأشخاص",
      mentalModelExplanation_ar: "الاعتقاد بأن الشريك في شركة المساهمة يكتسب صفة التاجر أو يُسأل عن ديون الشركة في أمواله الخاصة؛ هذه من خصائص شركة التضامن فقط.",
      actionableSteps_ar: [
        "تذكر أن شركة المساهمة شركة أموال تقوم على رأس المال لا على الاعتبار الشخصي.",
        "المسؤولية محدودة دائماً بقدر الحصص (قيمة الأسهم).",
        "وفاة الشريك أو إفلاسه لا يحل الشركة وتنتقل الأسهم للورثة.",
      ],
    },
    visualNecessity: "VISUAL_NOT_NEEDED",
    visualAssetIds: [],
    externalResourceIds: ["res_algerian_labor_law_90_11"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "سؤال متكرر في الجزء النظري والتطبيقي لموضوع القانون في البكالوريا.",
      commonPitfalls_ar: ["الخلط بين رأس المال في حالة الاكتتاب العام والخاص"],
      officialBacPastRefIds: ["BAC_GE_2021_Droit_Sujet1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "أحكام الشركات التجارية في القانون واضحة ومحددة بمواد تشريعية ثابتة.",
      nextBestActionHint_ar: "انتقل إلى استهلاك القروض في الرياضيات المالية.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "القانون التجاري الجزائري - الشركات التجارية",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  math_fin_loan_amortization_annuity: {
    packageId: "pkg_math_fin_loan_amortization_annuity",
    streamId: "gestion_eco",
    subjectId: "math",
    topicId: "math_topic_statistiques_regression",
    skillId: "math_fin_loan_amortization_annuity",
    objective_ar: "استهلاك القروض العادية ذات الدفعات السنوية الثابتة",
    objective_fr: "Amortissement des emprunts indivis à annuités constantes.",
    prerequisites: ["math_two_variable_statistics_regression"],
    lesson: {
      title_ar: "استهلاك القروض العادية ذات الدفعات السنوية الثابتة",
      contentMarkdown_ar: `### استهلاك القروض العادية على أقساط ثابتة
استهلاك القروض المصرفية بواسطة دفعات متساوية وثابتة سنوية ($a$) يشتمل كل قسط منها على جزأين: الفائدة المستحقة ($I_p$) واستهلاك أصل القرض ($A_p$). تتزايد الاستهلاكات بمتتالية هندسية أساسها $(1 + i)$ بينما تتناقص الفوائد مع تناقص أصل الدين المتبقي.

### العلاقات الرياضية الأساسية:
- علاقة القسط بالاستهلاك والفائدة: $a = A_p + I_p = A_p + V_{p-1} \\cdot i$.
- العلاقة بين الاستهلاكات المتعاقبة: $A_{p+1} = A_p \\cdot (1 + i)$، وبوجه عام: $A_p = A_1 \\cdot (1 + i)^{p-1}$.
- قيمة أصل القرض بدلالة الاستهلاك الأول: $V_0 = A_1 \\cdot \\frac{(1 + i)^n - 1}{i}$.
- قيمة الدفعة الثابتة السنوية: $a = V_0 \\cdot \\frac{i}{1 - (1 + i)^{-n}}$.`,
      keyTakeaway_ar: "الدفعة السنوية a ثابتة، بينما الاستهلاكات Ap تتزايد بمتتالية هندسية أساسها (1+i) والفوائد تتناقص.",
    },
    workedExample: {
      problem_ar: "اقترضت مؤسسة قرضاً عادياً يُسدد بواسطة 4 دفعات سنوية ثابتة بمعدل فائدة سنوي مركّب 10% ($i = 0.10$). إذا كان الاستهلاك الأول $A_1 = 50,000$ دج، فما هي قيمة الاستهلاك الثاني $A_2$ وقيمة الاستهلاك الرابع $A_4$؟",
      stepByStepSolution_ar: [
        "حساب الاستهلاك الثاني: A₂ = A₁ · (1 + i) = 50,000 × 1.10 = 55,000 دج.",
        "حساب الاستهلاك الرابع: A₄ = A₁ · (1 + i)³ = 50,000 × (1.10)³ = 50,000 × 1.331 = 66,550 دج.",
      ],
      pedagogicalComment_ar: "الاستهلاك يتزايد بمتتالية هندسية أساسها (1+i).",
    },
    activeRecall: {
      prompt_ar: "ما هي المتتالية التي تتبعها الاستهلاكات السنوية (A_p) في القرض العادي؟",
      expectedAnswer_ar: "متتالية هندسية أساسها (1 + i).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_loan_01",
        prompt_ar: "اقترضت مؤسسة قرضاً عادياً يُسدد بواسطة 4 دفعات سنوية ثابتة بمعدل فائدة سنوي مركّب 10% ($i = 0.10$). إذا كان الاستهلاك الأول $A_1 = 50,000$ دج، فما هي قيمة الاستهلاك الثاني $A_2$ وقيمة الاستهلاك الرابع $A_4$؟",
        optionsCount: 4,
        correctAnswerId: "opt_a",
        explanation_ar: "1) حساب A₂: A₂ = A₁ · (1 + i) = 50,000 × 1.10 = 55,000 دج.\n2) حساب A₄: A₄ = A₁ · (1 + i)³ = 50,000 × (1.10)³ = 50,000 × 1.331 = 66,550 دج.",
        distractorErrorMappings: {
          opt_b: "misunderstood_concept",
          opt_c: "calculation_error",
          opt_d: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_math_loan_twin",
      parentPracticeQuestionId: "pq_math_loan_01",
      prompt_ar: "[إعادة اختبار] قرض عادي يُسدد على دفعات سنوية ثابتة بمعدل فائدة $i = 8\\%$. إذا علمت أن الفرق بين الاستهلاك الثالث والاستهلاك الثاني هو: $A_3 - A_2 = 4,000$ دج، فما هي قيمة الاستهلاك الثاني $A_2$؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "iso_a",
      explanation_ar: "نعلم أن: A₃ = A₂ · (1 + i) = A₂ + A₂ · i. وبالتالي: A₃ - A₂ = A₂ · i. إذن: A₂ = (A₃ - A₂) / i = 4,000 / 0.08 = 50,000 دج.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "دليل حل مسائل استهلاك القروض ذات الدفعات الثابتة",
      mentalModelExplanation_ar: "الخلط بين رمز الدفعة السنوية a ورمز الاستهلاك السنوي Ap؛ الدفعة a ثابتة بينما الاستهلاك Ap يتزايد سنوياً بمتتالية هندسية أساسها (1 + i).",
      actionableSteps_ar: [
        "فرق بين الدفعة السنوية a (ثابتة) والاستهلاك السنوي Ap (متزايد).",
        "استعمل العلاقة Ap = A1 * (1 + i)^(p-1).",
        "تذكر أن الفرق بين استهلاكين متتاليين: A(p+1) - Ap = Ap * i.",
      ],
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["visual_math_nuage_points"],
    externalResourceIds: ["res_stats_moindres_carres"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "مسألة القروض الاستثمارية تتكرر بانتظام في الجزء الثاني من موضوع الرياضيات لبكالوريا التسيير.",
      commonPitfalls_ar: ["الخلط بين n و n-1 في الأس", "الخلط بين a و A"],
      officialBacPastRefIds: ["BAC_GE_2022_Math_Sujet2"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "قوانين الرياضيات المالية دقيقة، وبمجرد كتابة القانون الصحيح تصبح الحسابات مباشرة.",
      nextBestActionHint_ar: "أكملت الحزم الخمس بنجاح!",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات - شعبة تسيير واقتصاد",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },
};

import { GESTION_ECO_SKILLS } from "@/data/skills/gestion-economie";

export function getGestionEcoContentPackage(skillId: string): ContentPackage | null {
  if (GESTION_ECO_PACKAGES[skillId]) {
    return GESTION_ECO_PACKAGES[skillId];
  }

  const aliasedId = GESTION_ECO_ALIASES[skillId];
  if (aliasedId && GESTION_ECO_PACKAGES[aliasedId]) {
    return GESTION_ECO_PACKAGES[aliasedId];
  }

  const skill = GESTION_ECO_SKILLS[skillId];
  if (!skill) return null;

  return {
    packageId: "pkg_" + skill.id,
    streamId: "gestion_eco",
    subjectId: skill.subjectId,
    topicId: skill.topicId || "topic_" + skill.subjectId,
    skillId: skill.id,
    objective_ar: skill.description_ar,
    objective_fr: skill.description_fr,
    prerequisites: skill.prerequisites || [],
    lesson: {
      title_ar: skill.title_ar,
      contentMarkdown_ar: `### ${skill.title_ar}\n\n${skill.description_ar}\n\n**الاستراتيجية المنهجية:**\n${skill.repairStrategy_ar}`,
      keyTakeaway_ar: skill.repairStrategy_ar,
    },
    workedExample: {
      problem_ar: `تطبيق منهجي على كفاءة: ${skill.title_ar}`,
      stepByStepSolution_ar: skill.repairSteps_ar.length > 0 ? skill.repairSteps_ar : ["تطبيق القواعد المنهجية المعتمدة في المنهاج الرسمي."],
      pedagogicalComment_ar: "اتباع الخطوات المنهجية بالترتيب يضمن الدقة والحصول على العلامة الكاملة.",
    },
    activeRecall: {
      prompt_ar: `ما هي القاعدة المنهجية الأساسية في ${skill.title_ar}؟`,
      expectedAnswer_ar: skill.repairStrategy_ar,
      concealedInitially: true,
    },
    practice: [
      {
        id: `pq_${skill.id}_01`,
        prompt_ar: `سؤال تطبيقي في: ${skill.title_ar}`,
        optionsCount: 4,
        correctAnswerId: `opt_${skill.id}_correct`,
        explanation_ar: skill.repairStrategy_ar,
        distractorErrorMappings: {
          [`opt_${skill.id}_w1`]: "misunderstood_concept",
          [`opt_${skill.id}_w2`]: "methodology_error",
          [`opt_${skill.id}_w3`]: "calculation_error",
        },
      },
    ],
    retest: {
      id: `rq_${skill.id}_twin`,
      parentPracticeQuestionId: `pq_${skill.id}_01`,
      prompt_ar: `[إعادة اختبار] تمرين توأم على: ${skill.title_ar}`,
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: `opt_${skill.id}_twin_correct`,
      explanation_ar: skill.repairStrategy_ar,
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: `دليل معالجة التعثر في: ${skill.title_ar}`,
      mentalModelExplanation_ar: skill.repairStrategy_ar,
      actionableSteps_ar: skill.repairSteps_ar,
    },
    visualNecessity: "VISUAL_NOT_NEEDED",
    visualAssetIds: [],
    externalResourceIds: [],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "محور مبرمج في المنهاج الرسمي لبكالوريا شعبة التسيير والاقتصاد.",
      commonPitfalls_ar: [],
      officialBacPastRefIds: [],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: `أنت في المسار الصحيح لإتقان ${skill.title_ar}.`,
      nextBestActionHint_ar: "واصل حل التمارين التطبيقية.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "المرسوم التنفيذي رقم 07-142 المنظم لشهادة البكالوريا - وزارة التربية الوطنية",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  };
}
