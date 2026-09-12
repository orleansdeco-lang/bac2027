import { ContentPackage } from "@/domain/content-quality/types";

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
};

import { GESTION_ECO_SKILLS } from "@/data/skills/gestion-economie";

export function getGestionEcoContentPackage(skillId: string): ContentPackage | null {
  if (GESTION_ECO_PACKAGES[skillId]) {
    return GESTION_ECO_PACKAGES[skillId];
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
