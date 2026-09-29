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
      title_ar: "أعمال نهاية السنة: الاهتلاكات، نقص قيمة التثبيتات، والتنازل عنها",
      contentMarkdown_ar: `### 1. المفهوم القانوني والمحاسبي للاهتلاك
الاهتلاك هو استهلاك للمنافع الاقتصادية المرتبطة بأصل عيني أو معنوي عبر الزمن نتيجة الاستعمال أو التقادم التكنولوجي وفق النظام المحاسبي المالي SCF.

### 2. طرق اهتلاك التثبيتات الثلاث:
#### أ. طريقة الاهتلاك الخطي (Amortissement linéaire):
- قسط ثابت طيلة العمر الإنتاجي: $$A = V_0 \times t = \frac{V_0}{N}$$
- معدل الاهتلاك: $$t = \frac{100}{N}\%$$
- التناسب الزمني للسنة الأولى في حال الحيازة خلال السنة:
  $$A_1 = V_0 \times t \times \frac{m}{12}$$
  حيث $m$ عدد أشهر الاستعمال (الشهر المقتنى فيه قبل يوم 15 يحسب كاملاً).

#### ب. طريقة الاهتلاك المتناقص (Amortissement dégressif):
- يؤدي إلى عبء متناقص يتركز في السنوات الأولى.
- معدل الاهتلاك المتناقص: $$t' = t \times \text{المعامل الضريبي}$$
  - **3 إلى 4 سنوات**: المعامل الضريبي = 1.5
  - **5 إلى 6 سنوات**: المعامل الضريبي = 2
  - **أكثر من 6 سنوات**: المعامل الضريبي = 2.5
- الأساس الخاضع للاهتلاك في بداية كل دورة هو القيمة المحاسبية الصافية $VNC$ للسنة السابقة.
- **قاعدة الانتقال للخطي:** ننتقل إلى الاهتلاك الخطي عندما يصبح:
  $$t' \le \frac{100}{\text{عدد السنوات المتبقية}}$$
  ويقسم الرصيد $VNC$ الباقي بالتساوي على السنوات المتبقية.

#### ج. طريقة الاهتلاك المتزايد (Amortissement progressif):
- أقساط اهتلاك متزايدة سنوياً، والأساس $MA$ ثابت.
- مقام معدل الاهتلاك: $$S = \frac{N(N+1)}{2} = 1 + 2 + \dots + N$$
- قسط السنة المعنية: $$A_n = MA \times \frac{\text{رقم السنة}}{S}$$

### 3. خسارة القيمة عن التثبيتات (ح/29) وتعديل جدول الاهتلاك:
- تختبر الخسارة بمقارنة $VNC$ بسعر البيع الصافي $PVN$:
  $$\text{خسارة القيمة } PV = VNC - PVN$$
- إذا كانت موجبة، نسجل القيد: **مدين ح/681** | **دائن ح/29x** (خسائر القيمة عن التثبيتات).
- بعد الخسارة يعدل قسط الاهتلاك للسنوات اللاحقة:
  $$A = \frac{MA - \sum A - PV}{\text{السنوات المتبقية}} = \frac{VNC_{\text{بعد الخسارة}}}{\text{السنوات المتبقية}}$$

### 4. التنازل عن التثبيتات العينية:
- نسجل في اليومية بتاريخ التنازل:
  - **مدين**: ح/512 (بنوك) أو ح/462 (حسابات دائنة عن التنازل).
  - **مدين**: ح/28x (الاهتلاك المتراكم حتى تاريخ التنازل).
  - **مدين**: ح/29x (خسائر القيمة السابقة إن وجدت).
  - **مدين**: ح/652 (نواقص القيمة في حال الخسارة الصافية).
  - **دائن**: ح/2xx (التكلفة الأصلية للمثبت MA).
  - **دائن**: ح/752 (فوائض القيمة في حال الربح الصافي).`,
      keyTakeaway_ar: "احفظ المعاملات الضريبية (1.5 - 2 - 2.5) وشرط الانتقال للخطي، وتذكر أن التنازل يتطلب إدراج ح/28 و ح/29 لترصيد الأصل تماماً.",
    },
    workedExample: {
      problem_ar: "اقتنت مؤسسة روضة معدات صناعية بقيمة 360,000 دج في 02/01/2015 تهتلك متناقصاً على مدار 5 سنوات. احسب قسط 2015 و 2016 وحدد سنة الانتقال للخطي وسجل قيد 31/12/2015.",
      stepByStepSolution_ar: [
        "معدل الاهتلاك الخطي t = 100 / 5 = 20%.",
        "المعامل الضريبي لـ 5 سنوات = 2، إذن t' = 20% × 2 = 40%.",
        "قسط سنة 2015: A1 = 360,000 × 40% = 144,000 دج. VNC1 = 216,000 دج.",
        "قسط سنة 2016: A2 = 216,000 × 40% = 86,400 دج. VNC2 = 129,600 دج.",
        "سنة 2017: A3 = 129,600 × 40% = 51,840 دج. VNC3 = 77,760 دج.",
        "في نهاية 2017 تبقى سنتان (2018 و 2019)، معدل المتبقي 100/2 = 50%.",
        "بما أن 40% < 50% يتم الانتقال للخطي في 2018 و 2019: A4 = A5 = 77,760 / 2 = 38,880 دج.",
        "التسجيل في 31/12/2015: مدين ح/681 بـ 144,000 دج ودائن ح/2815 بـ 144,000 دج.",
      ],
      pedagogicalComment_ar: "الاهتلاك المتناقص يختبر في البكالوريا عادة للسنوات الـ 5 (المعامل 2) والانتقال يكون في السنتين الأخيرتين.",
    },
    activeRecall: {
      prompt_ar: "ما هو المعامل الضريبي المطبق في الاهتلاك المتناقص لأصل مدة نفعيته 5 سنوات؟",
      expectedAnswer_ar: "المعامل الضريبي هو 2 (للمدد 5 أو 6 سنوات).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_deprec_item_01",
        prompt_ar: "معدات صناعية بقيمة 360,000 دج تهتلك متناقصاً على مدار 5 سنوات (t' = 40%). كم يبلغ قسط اهتلاك السنة الأولى؟",
        optionsCount: 4,
        correctAnswerId: "opt_acc_d1_correct",
        explanation_ar: "A1 = 360,000 × 40% = 144,000 دج.",
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
      prompt_ar: "[إعادة اختبار] سيارة نفعية بقيمة 180,000 دج تهتلك متناقصاً على 5 سنوات. كم يبلغ قسط اهتلاك سنتها الأولى؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_acc_d_twin_correct",
      explanation_ar: "A1 = 180,000 × 40% = 72,000 دج.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "دليل ضبط الاهتلاك المتناقص والمعاملات الضريبية",
      mentalModelExplanation_ar: "يخلط الطلاب بين المعاملات الضريبية (1.5 لـ 3-4 سنوات، 2 لـ 5-6 سنوات، 2.5 لأكثر من 6 سنوات) ويهملون شرط الانتقال للخطي.",
      actionableSteps_ar: [
        "احسب المعدل الخطي t = 100 / N.",
        "حدد المعامل الضريبي واضرب t في المعامل لاستخراج t'.",
        "احسب الأقساط متناقصة على أساس VNC بداية كل سنة.",
        "قارن t' مع (100 / السنوات المتبقية) وانتقل للخطي عند تساويهما أو تفوق النسبة المتبقية.",
      ],
      contrastiveWorkedExample: "5 سنوات: المعامل 2 ومعدل المتناقص 40%. الانتقال في السنتين الأخيرتين لأن 100/2 = 50% > 40%.",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_tableau_amortissement"],
    externalResourceIds: ["res_scf_journal_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "سؤال دائم في الجزء الأول من موضوع المحاسبة لبكالوريا التسيير والاقتصاد (4 إلى 6 نقاط).",
      commonPitfalls_ar: ["نسيان التناسب الزمني", "عدم الانتقال للخطي في السنتين الأخيرتين", "استعمال حساب الأصل بدلاً من حساب الاهتلاك"],
      officialBacPastRefIds: ["BAC_GE_2023_Sujet1_Ex1", "BAC_GE_2022_Sujet2_Ex1", "BAC_GE_2021_Sujet1_Ex1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "إتقان جدول الاهتلاكات وقيود التنازل يضمن لك 6 نقاط كاملة في التمرين الأول للبكالوريا.",
      nextBestActionHint_ar: "انتقل إلى درس تسوية المخزونات وحساب فوارق الجرد.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "الجريدة الرسمية للجمهورية الجزائرية - المرسوم التنفيذي 07-142 وملخص الأستاذ يوسي قادة والأستاذ ياسين حجام",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 1.1 INVENTORY REGULARIZATION (الوحدة 03: تسوية المخزونات)
  // ---------------------------------------------------------------------------
  acc_inventory_regularization_depreciation: {
    packageId: "pkg_acc_inventory_regularization",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    topicId: "acc_topic_stocks",
    skillId: "acc_inventory_regularization_depreciation",
    objective_ar: "تسوية المخزونات في الجرد المتناوب والدائم، معالجة فوارق الجرد المبررة وغير المبررة، وتسجيل خسائر القيمة وفواتير المشتريات المعلقة.",
    objective_fr: "Régularisation des stocks, inventaire intermittent et permanent, écarts et dépréciations.",
    prerequisites: ["acc_depreciation_linear_degressive"],
    lesson: {
      title_ar: "الوحدة 03: تسوية المخزونات وفوارق الجرد وخسائر القيمة",
      contentMarkdown_ar: `### 1. الجرد المتناوب (Inventaire intermittent):
- **إلغاء مخزون أول المدة (SI):**
  - للبضائع والمواد والتموينات: **مدين ح/603** | **دائن ح/30، ح/31، ح/32**.
  - للمنتجات المصنعة: **مدين ح/724** | **دائن ح/35**.
- **معاينة مخزون آخر المدة (SF) من واقع الجرد المادي:**
  - للبضائع والمواد والتموينات: **مدين ح/30، ح/31، ح/32** | **دائن ح/603**.
  - للمنتجات المصنعة: **مدين ح/35** | **دائن ح/724**.
- **ترصيد حساب المشتريات المخزنة (38x):**
  - **مدين ح/60x** | **دائن ح/38x**.

### 2. فوارق الجرد في الجرد الدائم (Écarts d'inventaire):
$$\\text{فرق الجرد} = \\text{الجرد المادي (الفعلي)} - \\text{الجرد المحاسبي (الدفتري)}$$
- **فروق غير مبررة:**
  - فرق سالب غير مبرر: **مدين ح/657** (أعباء استثنائية) | **دائن ح/3x**.
  - فرق موجب غير مبرر: **مدين ح/3x** | **دائن ح/757** (منتوجات استثنائية).
- **فروق مبررة:**
  - فرق سالب مبرر: **مدين ح/60x أو ح/724** | **دائن ح/3x أو ح/355**.
  - فرق موجب مبرر: **مدين ح/3x أو ح/355** | **دائن ح/60x أو ح/724**.

### 3. خسائر القيمة عن المخزونات (ح/39):
- خسارة القيمة = تكلفة الشراء - سعر البيع الصافي المحتمل في السوق.
- زيادة أو إثبات لأول مرة: **مدين ح/685** | **دائن ح/39x**.
- تخفيض أو إلغاء: **مدين ح/39x** | **دائن ح/785**.

### 4. تسويات عدم تطابق حركة الفواتير والمخزون:
- **عدم استلام فاتورة الشراء:** **مدين ح/38x** | **دائن ح/408** (موردو الفواتير التي لم تصل).
- **عدم استلام المخزون الفعلي (بضائع بالخارج):** **مدين ح/37x** | **دائن ح/38x** (أو ح/60x في المتناوب).`,
      keyTakeaway_ar: "في الجرد المتناوب نلغي SI ونثبت SF، وفي الجرد الدائم الفرق غير المبرر يسجل في ح/657 وح/757.",
    },
    workedExample: {
      problem_ar: "أظهر ميزان المراجعة قبل الجرد: بضائع (ح/30) = 400,000 دج. الجرد المادي أظهر وجود بضائع بقيمة 385,000 دج (الفرق غير مبرر). سجل قيد التسوية في 31/12.",
      stepByStepSolution_ar: [
        "فرق الجرد = الجرد المادي - الجرد المحاسبي = 385,000 - 400,000 = -15,000 دج (فرق سالب).",
        "تكييف الفرق: غير مبرر، إذن يعتبر عبئاً استثنائياً للتسيير الجاري (ح/657).",
        "التسجيل المحاسبي في 31/12: مدين ح/657 بمبلغ 15,000 دج، دائن ح/30 بمبلغ 15,000 دج.",
      ],
      pedagogicalComment_ar: "التمييز بين المبرر (ح/603) وغير المبرر (ح/657) نقطة أساسية في سلم التصحيح الوزاري.",
    },
    activeRecall: {
      prompt_ar: "ما هو الحساب المدين عند تسجيل فرق جرد سالب غير مبرر للبضائع؟",
      expectedAnswer_ar: "ح/657 (أعباء استثنائية للتسيير الجاري).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_inv_item_01",
        prompt_ar: "أظهر الجرد المادي لبضائع وجود 120,000 دج بينما رصيدها المحاسبي 110,000 دج وكان الفرق غير مبرر. ما القيد؟",
        optionsCount: 4,
        correctAnswerId: "opt_acc_inv_corr",
        explanation_ar: "فرق موجب غير مبرر (+10,000 دج): مدين ح/30 ودائن ح/757 بمبلغ 10,000 دج.",
        distractorErrorMappings: {
          opt_acc_inv_w1: "misunderstood_concept",
          opt_acc_inv_w2: "calculation_error",
          opt_acc_inv_w3: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_acc_inv_item_twin",
      parentPracticeQuestionId: "pq_acc_inv_item_01",
      prompt_ar: "[إعادة اختبار] استلمت المؤسسة بضائع مخزنة دون استلام فاتورتها بقيمة 50,000 دج. ما هو القيد في 31/12؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_acc_inv_twin_corr",
      explanation_ar: "مدين ح/380 ودائن ح/408 (موردو الفواتير التي لم تصل إلى أصحابها) بمبلغ 50,000 دج.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "دليل تسوية فوارق المخزونات وفواتير المشتريات المعلقة",
      mentalModelExplanation_ar: "الخلط بين الجرد الدائم والجرد المتناوب، وبين الفروق المبررة وغير المبررة.",
      actionableSteps_ar: [
        "احسب فرق الجرد = المادي - المحاسبي.",
        "إذا كان غير مبرر: مدين 657 (للسالب) أو دائن 757 (للموجب).",
        "إذا كان مبرراً: استخدم ح/603 أو ح/724 في الطرف المعاكس للأصل.",
        "للفواتير التي لم تصل: مدين 38x ودائن 408 دائماً.",
      ],
      contrastiveWorkedExample: "فرق سالب مبرر: مدين 603 دائن 30. فرق سالب غير مبرر: مدين 657 دائن 30.",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_stock_regularization"],
    externalResourceIds: ["res_scf_stock_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "يرد غالباً مع تمرين تسويات نهاية السنة بقيمة 3 إلى 5 نقاط.",
      commonPitfalls_ar: ["الخلط بين 657 و 603", "نسيان ترصيد ح/380 في الجرد المتناوب"],
      officialBacPastRefIds: ["BAC_GE_2022_Sujet1_Ex2", "BAC_GE_2020_Sujet2_Ex1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "تسوية المخزونات مسألة منهجية وقواعدها واضحة ومباشرة.",
      nextBestActionHint_ar: "انتقل إلى درس تسوية حسابات الزبائن والسندات.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "الجريدة الرسمية للجمهورية الجزائرية - النظام المحاسبي المالي وملخص الأستاذ يوسي قادة",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 1.2 CUSTOMER RECEIVABLES & PROVISIONS (الوحدة 04: تسوية الزبائن)
  // ---------------------------------------------------------------------------
  acc_client_receivables_doubtful_impairment: {
    packageId: "pkg_acc_client_receivables",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    topicId: "acc_topic_creances",
    skillId: "acc_client_receivables_doubtful_impairment",
    objective_ar: "تصنيف الزبائن العاديين والمشكوك فيهم، حساب خسارة القيمة خارج الرسم HT حصراً، ومعالجة حالات الزيادة والتخفيض والإفلاس وفق معايير SCF.",
    objective_fr: "Régularisation des créances clients, dépréciation HT, et insolvabilités (416, 491, 654, 4457).",
    prerequisites: ["acc_depreciation_linear_degressive"],
    lesson: {
      title_ar: "الوحدة 04: تسوية حسابات الزبائن والرسم على القيمة المضافة والإفلاس",
      contentMarkdown_ar: `### 1. القاعدة الذهبية لحساب خسائر القيمة عن الزبائن:
خسارة القيمة لا تحسب إطلاقاً على المبلغ متضمن الرسم TTC، بل تحسب دوماً على المبلغ خارج الرسم HT بعد خصم التسديدات:
$$HT = \\frac{\\text{TTC} - \\text{التسديدات}}{1.19}$$
لأن الرسم على القيمة المضافة $TVA$ (19%) هو حق ضريبي تسترجعه المؤسسة من الدولة عند الإفلاس ولا تتحمله كخسارة!

### 2. التكييف والتحويل:
- **زبون عادي يمر بصعوبات مالية:**
  1. تحويل الرصيد كاملاً متضمن الرسم TTC: **مدين ح/416** | **دائن ح/411**.
  2. إثبات خسارة القيمة التقديرية لأول مرة: **مدين ح/685** | **دائن ح/491** بمبلغ ($HT \\times \\text{النسبة}$).

### 3. تعديل خسارة القيمة في 31/12/N:
- نقارن الخسارة الحالية $PV_N$ بالخسارة السابقة $PV_{N-1}$:
  - إذا كانت $PV_N > PV_{N-1}$: زيادة مخصص (**مدين ح/685** | **دائن ح/491**).
  - إذا كانت $PV_N < PV_{N-1}$: استرجاع (**مدين ح/491** | **دائن ح/785**).
  - إذا كان الزبون سيسدد كل ما عليه: إلغاء الخسارة تماماً (**مدين ح/491** | **دائن ح/785**) وإعادة الزبون إلى عادي (**مدين ح/411** | **دائن ح/416**).

### 4. حالة إفلاس الزبون نهائياً (Insolvabilité définitive):
- **إفلاس زبون مشكوك فيه سبق تكوين خسارة له:**
  - **مدين**: ح/491 (الخسارة السابقة كاملة).
  - **مدين**: ح/4457 (رسم القيمة المضافة المحصل = $HT \\times 0.19$).
  - **مدين**: ح/654 (الخسائر عن الحسابات الدائنة غير القابلة للتحصيل = الفارق الصافي غير المغطى).
  - **دائن**: ح/416 (الرصيد المتبقي متضمن الرسم TTC).
  *(إذا كانت الخسارة السابقة أكبر من الخسارة الحقيقية، يسجل الفائض في دائن ح/785).*
- **إفلاس زبون عادي فجأة دون خسارة سابقة:**
  - لا يمر إطلاقاً عبر ح/491! نسجل:
    - **مدين ح/654** (المبلغ خارج الرسم HT)
    - **مدين ح/4457** (الرسم TVA)
    - **دائن ح/411** (الرصيد TTC).`,
      keyTakeaway_ar: "الخسارة تحسب على HT حصراً، والزبون العادي إذا أفلس مباشرة لا يمر إطلاقاً عبر ح/491.",
    },
    workedExample: {
      problem_ar: "زبون مشكوك فيه مدين بـ 119,000 دج TTC (سابقاً كونت له خسارة 40,000 دج). في 31/12 أعلن إفلاسه التام واستحال استرجاع أي دين. سجل قيد التسوية في اليومية.",
      stepByStepSolution_ar: [
        "الرصيد خارج الرسم: HT = 119,000 / 1.19 = 100,000 دج.",
        "الرسم على القيمة المضافة: TVA = 100,000 × 19% = 19,000 دج.",
        "الخسارة الحقيقية خارج الرسم = 100,000 دج. الخسارة المغطاة سابقاً بحساب 491 = 40,000 دج.",
        "الخسارة الصافية غير المغطاة = 100,000 - 40,000 = 60,000 دج تسجل في ح/654.",
        "التسجيل المحاسبي في 31/12:",
        "- مدين ح/491 بـ 40,000 دج (ترصيد الخسارة السابقة).",
        "- مدين ح/4457 بـ 19,000 دج (استرجاع الرسم).",
        "- مدين ح/654 بـ 60,000 دج (الخسارة الصافية الحقيقية).",
        "- دائن ح/416 بـ 119,000 دج (ترصيد حساب الزبون المشكوك فيه).",
      ],
      pedagogicalComment_ar: "توازن القيد: (40,000 + 19,000 + 60,000 = 119,000 دج) يضمن سلامة الحل.",
    },
    activeRecall: {
      prompt_ar: "كيف يسجل إفلاس زبون عادي لم تكن له أي خسارة قيمة سابقة؟",
      expectedAnswer_ar: "مدين ح/654 (HT) + مدين ح/4457 (TVA) دائن ح/411 (TTC) دون استعمال ح/491.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_client_item_01",
        prompt_ar: "زبون مشكوك فيه رصيده TTC هو 238,000 دج سدد 119,000 دج واحتمال الخسارة على الباقي 40%. كم تبلغ الخسارة الحالية؟",
        optionsCount: 4,
        correctAnswerId: "opt_acc_cl_corr",
        explanation_ar: "الباقي TTC = 119,000 دج. HT = 100,000 دج. الخسارة = 100,000 × 40% = 40,000 دج.",
        distractorErrorMappings: {
          opt_acc_cl_w1: "misunderstood_concept",
          opt_acc_cl_w2: "calculation_error",
          opt_acc_cl_w3: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_acc_client_item_twin",
      parentPracticeQuestionId: "pq_acc_client_item_01",
      prompt_ar: "[إعادة اختبار] زبون مشكوك فيه رصيده 59,500 دج TTC (سدد 0 دج) وتتوقع المؤسسة تحصيل 70% من دينه. كم خسارة القيمة؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_acc_cl_twin_corr",
      explanation_ar: "إذا توقعت تحصيل 70%، فإن نسبة عدم التحصيل هي 30%. HT = 59,500 / 1.19 = 50,000 دج. الخسارة = 50,000 × 30% = 15,000 دج.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "دليل حماية درجات الزبائن من فخ الـ TVA",
      mentalModelExplanation_ar: "الخطأ الأكثر شيوعاً في الجزائر هو حساب الخسارة على TTC أو عدم الانتباه لعبارة 'تتوقع تحصيل' مقابل 'تتوقع عدم تحصيل'.",
      actionableSteps_ar: [
        "اطرح التسديدات المسجلة خلال الدورة من رصيد الزبون TTC.",
        "اقسم الباقي على 1.19 للحصول على الدين خارج الرسم HT.",
        "انتبه لنص السؤال: إذا ذكر نسبة التحصيل اطرحها من 100% لاستخراج نسبة الخسارة.",
        "احسب الخسارة = HT × نسبة الخسارة وقارنها بالسابقة.",
      ],
      contrastiveWorkedExample: "تحصيل 70% يعني خسارة 30%. الخسارة = HT × 30% وليس HT × 70%.",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_clients_schema"],
    externalResourceIds: ["res_scf_tva_client_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تمرين الزبائن والمؤونات ثابت سنوياً في بكالوريا التسيير والاقتصاد (من 4 إلى 6 نقاط).",
      commonPitfalls_ar: ["حساب الخسارة على TTC", "الخلط بين نسبة التحصيل ونسبة عدم التحصيل", "استخدام ح/491 لزبون عادي"],
      officialBacPastRefIds: ["BAC_GE_2023_Sujet2_Ex1", "BAC_GE_2021_Sujet1_Ex1", "BAC_GE_2019_Sujet1_Ex1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "قسمة TTC على 1.19 قبل كل شيء هي المفتاح السري لدرجة كاملة في الزبائن.",
      nextBestActionHint_ar: "انتقل إلى درس الميزانية الوظيفية ونسب التحليل المالي.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "الجريدة الرسمية للجمهورية الجزائرية - النظام المحاسبي المالي ودليل الأستاذ يوسي قادة",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 1.3 FUNCTIONAL BALANCE SHEET (المجال 2: الميزانية الوظيفية والتحليل المالي)
  // ---------------------------------------------------------------------------
  acc_functional_balance_sheet_indicators: {
    packageId: "pkg_acc_functional_balance",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    topicId: "acc_topic_bilan_fonctionnel",
    skillId: "acc_functional_balance_sheet_indicators",
    objective_ar: "إعداد الميزانية الوظيفية بالقيم الإجمالية انطلاقاً من الميزانية المحاسبية، حساب مؤشرات التوازن المالي (FRNG, BFR, TN) بطريقتين مع التفسير، وحساب نسب الهيكلة والدوران (بكالوريا 2019/2021).",
    objective_fr: "Bilan fonctionnel en valeurs brutes, FRNG, BFR, TN et ratios de rotation (modèle officiel Bac).",
    prerequisites: ["acc_depreciation_linear_degressive"],
    lesson: {
      title_ar: "المجال المفاهيمي 02: الميزانية الوظيفية ومؤشرات التوازن ونسب التحليل المالي",
      contentMarkdown_ar: `### 1. الانتقال من الميزانية المحاسبية إلى الوظيفية:
- **الأصول الوظيفية:** تؤخذ دوماً بـ **القيم الإجمالية (Brute)**:
  - **الاستخدامات الثابتة (ES):** مجموع الأصول غير الجارية الإجمالية (معنوية + عينية + مالية).
  - **الأصول المتداولة (AC):** للاستغلال (مخزونات + زبائن + جزء الاستغلال من ح/486)، خارج الاستغلال (القيم المنقولة ح/50 + جزء غير عادي من ح/486)، وخزينة الأصول (بنوك ح/512 + صندوق ح/53).
- **الخصوم الوظيفية:**
  - **الموارد الثابتة (RS):**
    1. **الموارد الخاصة:** رأس المال + الاحتياطات + النتيجة الصافية + مؤونات الأخطار + **مجموع الاهتلاكات والمؤونات وخسائر القيمة للأصول بالكامل**.
    2. **الديون المالية:** الاقتراضات لدى مؤسسات القرض (ح/164) باستثناء المساهمات البنكية الجارية.
  - **الخصوم المتداولة (PC):** للاستغلال (موردو المخزونات والخدمات + ضرائب دائنة ما عدا على النتائج + جزء الاستغلال من ح/487)، خارج الاستغلال (موردو التثبيتات ح/404 + الضرائب على النتائج + جزء غير عادي من ح/487)، وخزينة الخصوم (المساهمات البنكية الجارية ح/519).

### 2. مؤشرات التوازن المالي الثلاثة وتفسيرها:
1. **رأس المال العامل الصافي الإجمالي ($FRNG$):**
   - من أعلى الميزانية: $$FRNG = \text{الموارد الثابتة} - \text{الاستخدامات الثابتة}$$
   - من أسفل الميزانية: $$FRNG = \text{الأصول المتداولة} - \text{الخصوم المتداولة}$$
   - **التفسير:** $FRNG > 0$ يعني تحقق هامش أمان ومساهمة الموارد الثابتة في تمويل الأصول المتداولة.
2. **احتياج رأس المال العامل ($BFR$):**
   - $$BFR = \text{أصول م. (استغلال + خ.استغلال)} - \text{خصوم م. (استغلال + خ.استغلال)} = BFRE + BFRHE$$
   - **التفسير:** يمثل الاحتياج المالي الناتج عن فترات الائتمان المخزنية والتجارية.
3. **الخزينة الصافية ($TN$):**
   - طريقة الخزينة: $$TN = \text{خزينة الأصول} - \text{خزينة الخصوم}$$
   - طريقة التوازن: $$TN = FRNG - BFR$$
   - **التفسير:** $TN > 0$ يعني يسر مالي وسيولة آمنة لمواجهة الالتزامات العاجلة.

### 3. نسب التحليل المالي ونسب الدوران:
- **نسبة تغطية الاستخدامات الثابتة:** $\frac{\text{الموارد الثابتة}}{\text{الاستخدامات الثابتة}} \ge 1$.
- **نسبة الاستدانة المالية:** $\frac{\text{الديون المالية} + \text{خزينة الخصوم}}{\text{التمويل الخاص}} \le 1$.
- **نسب الدوران (المخزون، الزبائن، الموردين):**
  - $\text{متوسط الرصيد} = \frac{\text{أول المدة} + \text{آخر المدة}}{2}$
  - $\text{معدل الدوران} = \frac{\text{التدفق السنوي}}{\text{متوسط الرصيد}}$
  - $\text{متوسط مدة الدوران بالأيام} = \frac{360}{\text{معدل الدوران}}$.`,
      keyTakeaway_ar: "الأصول تسجل بالقيم الإجمالية، ومجموع الاهتلاكات يضاف وجوباً للموارد الخاصة، و TN = FRNG - BFR.",
    },
    workedExample: {
      problem_ar: "في بكالوريا 2019، بلغت الموارد الثابتة 7,090,000 دج والاستخدامات الثابتة 6,050,000 دج والأصول المتداولة (HE+E) 1,702,000 دج والخصوم المتداولة (HE+E) 1,510,000 دج وخزينة الأصول 1,700,000 دج وخزينة الخصوم 852,000 دج. احسب وفسر FRNG و BFR و TN.",
      stepByStepSolution_ar: [
        "حساب FRNG: من أعلى الميزانية = 7,090,000 - 6,050,000 = 1,040,000 دج (موجب هامش أمان).",
        "حساب BFR: 1,702,000 - 1,510,000 = 192,000 دج (احتياج تمويلي لدورة النشاط).",
        "حساب TN بطريقتين:",
        "1) طريقة الخزينة: 1,700,000 - 852,000 = 848,000 دج.",
        "2) طريقة التوازن: FRNG - BFR = 1,040,000 - 192,000 = 848,000 دج.",
        "التفسير: المؤسسة في أمان مالي مريح وتملك سيولة نقدية كافية لمواجهة التزاماتها.",
      ],
      pedagogicalComment_ar: "التأكد من تطابق نتيجتي TN بطريقتين هو الضمان القطعي لصحة الحسابات في ورقة إجابة البكالوريا.",
    },
    activeRecall: {
      prompt_ar: "أين يدرج مجموع الاهتلاكات والمؤونات وخسائر القيمة عند إعداد الميزانية الوظيفية؟",
      expectedAnswer_ar: "يضاف إلى الموارد الخاصة ضمن كتلة الموارد الثابتة في جانب الخصوم.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_fb_item_01",
        prompt_ar: "موارد ثابتة 3,620,000 دج واستخدامات ثابتة 3,500,000 دج و BFR يساوي 20,000 دج. كم تبلغ الخزينة الصافية TN؟",
        optionsCount: 4,
        correctAnswerId: "opt_acc_fb_corr",
        explanation_ar: "FRNG = 3,620,000 - 3,500,000 = 120,000 دج. TN = 120,000 - 20,000 = 100,000 دج.",
        distractorErrorMappings: {
          opt_acc_fb_w1: "misunderstood_concept",
          opt_acc_fb_w2: "calculation_error",
          opt_acc_fb_w3: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_acc_fb_item_twin",
      parentPracticeQuestionId: "pq_acc_fb_item_01",
      prompt_ar: "[إعادة اختبار] إذا كان متوسط مخزون المواد الأولية 65,000 دج وتكلفة شراء المواد المباعة 650,000 دج، فكم يبلغ متوسط دوران المخزون بالأيام؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_acc_fb_twin_corr",
      explanation_ar: "معدل الدوران = 650,000 / 65,000 = 10 دورات. متوسط الدوران = 360 / 10 = 36 يوماً.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "دليل التوازن المالي وحساب المؤشرات بطريقتين",
      mentalModelExplanation_ar: "ينسى الطالب إدماج الاهتلاكات في الموارد الخاصة أو يخلط بين الأصول الصافية والإجمالية.",
      actionableSteps_ar: [
        "استعمل دائماً المبالغ الإجمالية للأصول.",
        "اجمع الاهتلاكات والمؤونات في الموارد الخاصة.",
        "احسب FRNG = الموارد الثابتة - الاستخدامات الثابتة.",
        "احسب BFR واطرحه من FRNG للتحقق من TN.",
      ],
      contrastiveWorkedExample: "FRNG يحسب من أعلى (RS - ES) ومن أسفل (AC - PC) ويجب أن يتطابق الرقمان تماماً.",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_bilan_fonctionnel"],
    externalResourceIds: ["res_scf_balance_sheet_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "الميزانية الوظيفية وحساب النتائج يشكلان الموضوع الثاني كاملاً (8 إلى 10 نقاط).",
      commonPitfalls_ar: ["إغفال إضافة مجموع الاهتلاكات للموارد الخاصة", "عدم تبرير العمليات الحسابية بطريقتين"],
      officialBacPastRefIds: ["BAC_GE_2021_Sujet2_Ex1", "BAC_GE_2019_Sujet2_Ex1"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "الميزانية الوظيفية هي أسهل 8 نقاط إذا ضبطت تصنيف الكتل الثلاثة.",
      nextBestActionHint_ar: "انتقل إلى درس محاسبة التكاليف والنتيجة التحليلية.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "الجريدة الرسمية للجمهورية الجزائرية - النظام المحاسبي المالي ودليل الأستاذ عبدالخالق عودة",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "official_reference",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 1.4 COST ACCOUNTING & ANALYTICAL RESULT (المجال 3: محاسبة التكاليف)
  // ---------------------------------------------------------------------------
  acc_cost_accounting_analytical: {
    packageId: "pkg_acc_cost_accounting",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    topicId: "acc_topic_couts",
    skillId: "acc_cost_accounting_analytical",
    objective_ar: "توزيع الأعباء غير المباشرة وتتبع المسار الخماسي للتكاليف: الشراء، الإنتاج، سعر التكلفة، النتيجة التحليلية والنتيجة الصافية (الأستاذ حاكمي).",
    objective_fr: "Comptabilité analytique de gestion : tableau de répartition, coûts d'achat, de production, de revient et résultat analytique net.",
    prerequisites: ["acc_depreciation_linear_degressive"],
    lesson: {
      title_ar: "المجال المفاهيمي 03: كيفية تحميل التكاليف وحساب النتيجة التحليلية الصافية",
      contentMarkdown_ar: `### 1. جدول توزيع الأعباء غير المباشرة:
- يوزع أعباء الأقسام الإضافية (الصيانة، الإدارة) على الأقسام الرئيسية (التموين، الورشات، التوزيع).
- تكلفة وحدة العمل = $\frac{\text{مجموع التوزيع الثانوي}}{\text{عدد وحدات العمل}}$.

### 2. المسار الحسابي الخماسي للتكاليف:
1. **تكلفة الشراء:**
   $$\text{تكلفة الشراء} = \text{ثمن الشراء} + \text{مصاريف الشراء المباشرة} + \text{مصاريف قسم التموين}$$
   ثم حساب التكلفة المتوسطة المرجحة:
   $$CMUP = \frac{\text{تكلفة شراء الفترة} + \text{تكلفة مخزون أول المدة}}{\text{كمية المشتريات} + \text{كمية مخزون أول المدة}}$$
2. **تكلفة الإنتاج:**
   $$\text{تكلفة الإنتاج} = \text{تكلفة المواد المستعملة (بـ CMUP)} + \text{مصاريف الإنتاج المباشرة (ساعات)} + \text{مصاريف ورشة 1 وورشة 2}$$
   ثم حساب التكلفة المرجحة لإنتاج الفترة + مخزون أول المدة من المنتجات التامة.
3. **سعر التكلفة:**
   $$\text{سعر التكلفة} = \text{تكلفة إنتاج المنتجات المباعة} + \text{مصاريف التوزيع المباشرة} + \text{مصاريف قسم التوزيع}$$
4. **النتيجة التحليلية لكل منتج:**
   $$\text{النتيجة التحليلية} = \text{رقم الأعمال (الكمية المباعة} \times \text{سعر البيع)} - \text{سعر التكلفة}$$
5. **النتيجة التحليلية الصافية الإجمالية:**
   $$\text{النتيجة التحليلية الصافية} = \sum \text{النتائج التحليلية للمنتجات} + \text{العناصر الإضافية} - \text{الأعباء غير المعتبرة}$$`,
      keyTakeaway_ar: "التسلسل إلزامي: شراء -> إنتاج -> سعر التكلفة -> نتيجة تحليلية -> نتيجة صافية (مع العناصر الإضافية والأعباء غير المعتبرة).",
    },
    workedExample: {
      problem_ar: "بلغت النتيجة التحليلية للمنتج (أ) 250,000 دج وللمنتج (ب) 200,000 دج، والعناصر الإضافية 50,000 دج والأعباء غير المعتبرة 20,000 دج. احسب النتيجة التحليلية الصافية للمؤسسة.",
      stepByStepSolution_ar: [
        "مجموع النتائج التحليلية للمنتجات = 250,000 + 200,000 = 450,000 دج.",
        "إضافة العناصر الإضافية: 450,000 + 50,000 = 500,000 دج.",
        "طرح الأعباء غير المعتبرة: 500,000 - 20,000 = 480,000 دج.",
        "النتيجة التحليلية الصافية = 480,000 دج (ربح تحليلي صافٍ).",
      ],
      pedagogicalComment_ar: "تذكر: العناصر الإضافية تضاف، والأعباء غير المعتبرة تطرح دائماً.",
    },
    activeRecall: {
      prompt_ar: "ما هي معادلة الانتقال من النتيجة التحليلية الإجمالية إلى النتيجة التحليلية الصافية؟",
      expectedAnswer_ar: "النتيجة الصافية = النتيجة الإجمالية + العناصر الإضافية - الأعباء غير المعتبرة.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_acc_cost_item_01",
        prompt_ar: "نتيجة إجمالية 300,000 دج وعناصر إضافية 30,000 دج وأعباء غير معتبرة 10,000 دج. كم النتيجة التحليلية الصافية؟",
        optionsCount: 4,
        correctAnswerId: "opt_acc_cost_corr",
        explanation_ar: "النتيجة الصافية = 300,000 + 30,000 - 10,000 = 320,000 دج.",
        distractorErrorMappings: {
          opt_acc_cost_w1: "misunderstood_concept",
          opt_acc_cost_w2: "calculation_error",
          opt_acc_cost_w3: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_acc_cost_item_twin",
      parentPracticeQuestionId: "pq_acc_cost_item_01",
      prompt_ar: "[إعادة اختبار] شراء 1,000 كغ بسعر 50 دج/كغ، مصاريف شراء مباشرة 5,000 دج ومصاريف تموين غير مباشرة 10,000 دج. ما تكلفة شراء الكيلوغرام الواحد؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_acc_cost_twin_corr",
      explanation_ar: "تكلفة الشراء الإجمالية = (1,000 × 50) + 5,000 + 10,000 = 65,000 دج. تكلفة الكغ = 65,000 / 1,000 = 65 دج/كغ.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "دليل ضبط مراحل محاسبة التكاليف وحساب CMUP",
      mentalModelExplanation_ar: "يغفل الطالب إدراج مخزون أول المدة في حساب التكلفة المتوسطة المرجحة CMUP.",
      actionableSteps_ar: [
        "احسب تكلفة شراء الفترة ثم أضف تكلفة مخزون أول المدة واقسم على مجموع الكميات لحساب CMUP.",
        "قيم المواد المستعملة دائماً بسعر CMUP الشراء.",
        "احسب تكلفة إنتاج الفترة وأضف مخزون أول المدة للمنتجات التامة لحساب CMUP الإنتاج.",
        "احسب سعر التكلفة = كمية مباعة × CMUP إنتاج + مصاريف التوزيع.",
      ],
      contrastiveWorkedExample: "CMUP = (مبلغ شراء الفترة + مبلغ مخزون 1) / (كمية شراء الفترة + كمية مخزون 1).",
    },
    visualNecessity: "VISUAL_USEFUL",
    visualAssetIds: ["visual_acc_cost_accounting_flow"],
    externalResourceIds: ["res_scf_cost_rules"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "مسألة محاسبة التكاليف ترد كخيار رئيسي في الجزء الثاني من البكالوريا (8 درجات).",
      commonPitfalls_ar: ["نسيان إضافة مخزون 1 في CMUP", "الخلط بين الكميات المنتجة والمباعة"],
      officialBacPastRefIds: ["BAC_GE_2022_Sujet2_Ex2", "BAC_GE_2020_Sujet1_Ex2"],
    },
    motivationSupport: {
      status: "NORMALIZED",
      microNormalizeText_ar: "محاسبة التكاليف جدول تسلسلي منظم، خطوة تقود للأخرى بثقة كاملة.",
      nextBestActionHint_ar: "أكملت الوحدات الأساسية! حل نموذج بكالوريا تدريبي الآن.",
    },
    provenance: {
      sourceId: "src-decree-07-142",
      sourceTitle: "الجريدة الرسمية للجمهورية الجزائرية - النظام المحاسبي المالي وملخص الأستاذ حاكمي",
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
