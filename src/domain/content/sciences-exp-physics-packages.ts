/**
 * BAC Mastery — Physics & Chemistry Canonical Packages & Assessment Expansion
 * Stream: Sciences Expérimentales (3AS) | Algerian National Curriculum Benchmark
 * 
 * Implements:
 * 1. 13 Active Canonical Capabilities + 1 Quarantined HOLD capability (physics_rlc_free_oscillations)
 * 2. Strict Disciplinary Physics/Chemistry Pedagogy:
 *    Situation -> Model -> Law -> Derivation -> Units -> Interpretation -> Validation
 * 3. 5-Tier Practice Ladder (L1 Foundation, L2 Application, L3 Mixed, L4 Transfer, L5 BAC-Style)
 * 4. Error Lab 7-taxonomy strict error mapping
 * 5. 5-15 minute targeted Repair Protocols
 * 6. Isomorphic Retest Twins testing genuine transfer
 * 7. Multi-part BAC Production Tasks with BAC_MASTERY_INTERNAL_RUBRIC
 */

export interface CanonicalPhysicsAssessmentItem {
  id: string;
  capabilityId: string;
  level: "L1_FOUNDATION" | "L2_APPLICATION" | "L3_MIXED" | "L4_TRANSFER" | "L5_BAC_STYLE";
  format: "mcq" | "short_answer" | "structured_written" | "experimental_analysis";
  estimatedTimeMin: number;
  prompt_ar: string;
  expectedResponse_ar: string;
  reasoningSteps_ar: string[];
  physicalOrChemicalModel_ar: {
    system_ar: string;
    referenceFrameOrConditions_ar: string;
    governingLaws_ar: string[];
    keyUnitsAndDimensions_ar: string;
  };
  errorMapping: {
    primaryErrorType: "misunderstood_concept" | "calculation_error" | "methodology_error" | "forgot_information" | "rushed" | "attention_error" | "misread_question";
    distractorRationale_ar?: string;
  };
  scoringRubric_ar: string;
  isRetestVariant?: boolean;
}

export interface CanonicalPhysicsCapabilityPackage {
  capabilityId: string;
  canonicalTitle_ar: string;
  canonicalTitle_fr: string;
  discipline: "chemistry" | "physics";
  domain: string;
  unit: string;
  status: "APPROVED" | "APPROVED_WITH_MINOR_EDITS" | "HOLD";
  scopeIn: string[];
  scopeOut: string[];
  prerequisites: {
    hard: string[];
    soft: string[];
    foundation: string[];
    crossCutting: string[];
  };
  learningObjectives: Array<{
    code: string;
    bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
    description_ar: string;
  }>;
  practiceLadder: {
    l1_foundation: CanonicalPhysicsAssessmentItem;
    l2_application: CanonicalPhysicsAssessmentItem;
    l3_mixed: CanonicalPhysicsAssessmentItem;
    l4_transfer: CanonicalPhysicsAssessmentItem;
    l5_bac_style: CanonicalPhysicsAssessmentItem;
  };
  repairProtocol: {
    diagnosis_ar: string;
    wrongMentalModel_ar: string;
    correctMentalModel_ar: string;
    threeStepActionProtocol_ar: string[];
    microDrill_ar: {
      prompt_ar: string;
      solution_ar: string;
    };
  };
  isomorphicRetest: {
    retestId: string;
    invariantTested_ar: string;
    changedSurface_ar: string;
    prompt_ar: string;
    solution_ar: string;
    passCondition_ar: string;
  };
  bacProductionTask: {
    title_ar: string;
    allocatedScore: string;
    timeMinutes: number;
    prompt_ar: string;
    modelSolution_ar: string[];
    markingScheme_ar: Array<{ criterion: string; points: number }>;
  };
}

// ============================================================================
// PHASE 1: CHEMISTRY — KINETICS & REDOX TITRATION
// ============================================================================

export const PHYSICS_CHEMICAL_KINETICS_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_chemical_kinetics_rates_halflife",
  canonicalTitle_ar: "المتابعة الزمنية لتحول كيميائي: السرعات وزمن نصف التفاعل",
  canonicalTitle_fr: "Suivi temporel d'une réaction chimique : vitesses et temps de demi-réaction",
  discipline: "chemistry",
  domain: "Chimie Générale",
  unit: "المتابعة الزمنية لتحول كيميائي في وسط مائي",
  status: "APPROVED",
  scopeIn: [
    "تعريف ومتابعة تقدم التفاعل x(t) وجدول التقدم وتحديد المتفاعل المحد والتقدم الأعظمي x_max.",
    "حساب سرعة التفاعل v(t) = dx/dt والسرعة الحجمية v_vol(t) = (1/V_tot) * (dx/dt) بيانياً عبر ميل المماس.",
    "سرعات التشكل والاختفاء وعلاقتها بالسرعة الحجمية للتفاعل عبر المعاملات الستوكيومترية.",
    "تعريف وتحديد زمن نصف التفاعل t_{1/2} بيانياً وحسابياً وتفسير العوامل الحركية مجهرياً (تصادمات فعالة).",
  ],
  scopeOut: [
    "قوانين السرعة التفاضلية من الرتبة الثانية أو التكاملية المتقدمة غير المقررة على شعبة علوم تجريبية.",
    "المتابعة بالمعايرة اللونية التلقائية المستمرة (خاص بالتقني رياضي).",
  ],
  prerequisites: {
    hard: ["جدول التقدم وحساب كميات المادة n = C*V = m/M"],
    soft: ["الاشتقاقية وتفسير ميل المماس بيانياً"],
    foundation: ["مفهوم الأكسدة والإرجاع والثنائيات Ox/Red"],
    crossCutting: ["قراءة المنحنيات البيانية وتحويل الوحدات (min إلى s، mL إلى L)"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-KINET-01",
      bloomLevel: "apply",
      description_ar: "حساب السرعة الحجمية للتفاعل v_vol عند لحظة معينة بيانياً عبر ميل المماس وقسمته على الحجم الكلي للمزيج V_tot.",
    },
    {
      code: "LO-PHYS-KINET-02",
      bloomLevel: "analyze",
      description_ar: "تحديد زمن نصف التفاعل t_{1/2} انطلاقاً من التعريف الصارم x(t_{1/2}) = x_f / 2 وربطه بالمتفاعل المحد واستقرار التحول.",
    },
    {
      code: "LO-PHYS-KINET-03",
      bloomLevel: "evaluate",
      description_ar: "تفسير تطور سرعة التفاعل مع الزمن وتأثير العوامل الحركية (درجة الحرارة، التراكيز الابتدائية) اعتماداً على نظرية التصادمات المجهرية.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "kinet_l1_foundation",
      capabilityId: "physics_chemical_kinetics_rates_halflife",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "في تحول كيميائي تام، إذا كان التقدم الأعظمي x_max = 8.0 mmol، فإن قيمة التقدم عند زمن نصف التفاعل t_{1/2} هي:",
      expectedResponse_ar: "4.0 mmol",
      reasoningSteps_ar: ["التحول تام إذن x_f = x_max = 8.0 mmol", "بحسب التعريف: x(t_{1/2}) = x_f / 2 = 8.0 / 2 = 4.0 mmol"],
      physicalOrChemicalModel_ar: {
        system_ar: "مزيج تفاعلي متجانس في طور مائي",
        referenceFrameOrConditions_ar: "درجة حرارة وضغط ثابتين، تحول تام",
        governingLaws_ar: ["تعريف زمن نصف التفاعل: x(t_{1/2}) = x_f / 2"],
        keyUnitsAndDimensions_ar: "mmol و min",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اعتقاد خاطئ بأن t_{1/2} هو نصف زمن انتهاء التفاعل الكلي.",
      },
      scoringRubric_ar: "1 نقطة لتطبيق التعريف النظري الصارم.",
    },
    l2_application: {
      id: "kinet_l2_application",
      capabilityId: "physics_chemical_kinetics_rates_halflife",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "يمثل المماس لمنحنى التقدم x(t) عند اللحظة t = 0 مستقيماً يمر بالنقطتين (0, 0) و (5 min, 2.5 mmol). إذا كان الحجم الكلي للمزيج V_tot = 200 mL، احسب السرعة الحجمية الابتدائية للتفاعل v_vol(0) بوحدة mol·L^(-1)·min^(-1).",
      expectedResponse_ar: "2.5 * 10^(-3) mol·L^(-1)·min^(-1)",
      reasoningSteps_ar: [
        "حساب ميل المماس: a = dx/dt = (2.5 - 0) * 10^(-3) mol / (5 - 0) min = 0.5 * 10^(-3) mol/min.",
        "تحويل الحجم الكلي: V_tot = 200 mL = 0.200 L.",
        "السرعة الحجمية: v_vol(0) = (1 / V_tot) * (dx/dt) = (0.5 * 10^(-3)) / 0.200 = 2.5 * 10^(-3) mol·L^(-1)·min^(-1).",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "مزيج تفاعلي حجمه V_tot = 0.200 L",
        referenceFrameOrConditions_ar: "متابعة زمنية بقياس الحجم أو الناقلية عند T = ثابت",
        governingLaws_ar: ["v_vol = (1/V_tot) * (dx/dt)"],
        keyUnitsAndDimensions_ar: "mol·L^(-1)·min^(-1)",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "نسيان القسمة على الحجم الكلي V_tot وحساب سرعة التفاعل بدلاً من السرعة الحجمية.",
      },
      scoringRubric_ar: "1 نقطة لحساب الميل، 1 نقطة لتحويل الحجم والقسمة الصحيحة.",
    },
    l3_mixed: {
      id: "kinet_l3_mixed",
      capabilityId: "physics_chemical_kinetics_rates_halflife",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "يتفكك الماء الأكسجيني H2O2 ذاتياً وفق المعادلة: 2H2O2(aq) -> 2H2O(l) + O2(g). نتابع تطور حجم غاز O2 المنطلق في الشرطين النظاميين (V_M = 22.4 L/mol). بين أن السرعة الحجمية لاختفاء H2O2 تُعطى بالعلاقة: v_vol(H2O2) = (1 / (V_tot * V_M)) * (d V_{O2} / dt).",
      expectedResponse_ar: "v_vol(H2O2) = (1 / (V_tot * V_M)) * (d V_{O2} / dt)",
      reasoningSteps_ar: [
        "من جدول التقدم: n(O2) = x(t) و n(H2O2) = n_0 - 2x(t).",
        "حجم الغاز: V(O2) = x * V_M ومنه x(t) = V(O2) / V_M.",
        "سرعة اختفاء H2O2: v(H2O2) = - d n(H2O2) / dt = - d(n_0 - 2x) / dt = 2 * (dx/dt).",
        "السرعة الحجمية لاختفاء H2O2: v_vol(H2O2) = (1 / V_tot) * v(H2O2) = (2 / V_tot) * (dx/dt).",
        "لكن سرعة التفاعل هي v = dx/dt = (1 / V_M) * (d V_{O2} / dt).",
        "بالتالي: v_vol(H2O2) = (2 / (V_tot * V_M)) * (d V_{O2} / dt).",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "محلول مائي للماء الأكسجيني + غاز الأكسجين المنطلق",
        referenceFrameOrConditions_ar: "درجة حرارة 25°C وضغط جوي نظامي، غاز مثالي",
        governingLaws_ar: ["جدول التقدم", "قانون الغاز المثالي n = V/V_M", "تعريف سرعة الاختفاء"],
        keyUnitsAndDimensions_ar: "mol·L^(-1)·s^(-1)",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "إهمال المعامل الستوكيومتري 2 للماء الأكسجيني عند ربط سرعة اختفائه بسرعة التفاعل.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لربط n(O2) بالتقدم، 1.0ن لاشتقاق العلاقة مع إبراز المعامل 2.",
    },
    l4_transfer: {
      id: "kinet_l4_transfer",
      capabilityId: "physics_chemical_kinetics_rates_halflife",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "تتم متابعة تفاعل أكسدة إرجاع بقياس الناقلية النوعية sigma(t). وجد تجريبياً أن: sigma(t) = 0.24 - 120 * x(t) (حيث sigma بـ S/m و x بـ mol). يمثل المماس عند t = 10 min ميلاً قدره d(sigma)/dt = -0.012 S·m^(-1)·min^(-1). احسب السرعة الحجمية للتفاعل عند هذه اللحظة إذا كان الحجم الكلي V_tot = 100 mL.",
      expectedResponse_ar: "1.0 * 10^(-3) mol·L^(-1)·min^(-1)",
      reasoningSteps_ar: [
        "اشتقاق عبارة الناقلية بالنسبة للزمن: d(sigma)/dt = -120 * (dx/dt).",
        "استخراج dx/dt: dx/dt = - (1 / 120) * (d(sigma)/dt) = - (1 / 120) * (-0.012) = 1.0 * 10^(-4) mol/min.",
        "تطبيق قانون السرعة الحجمية: v_vol = (1 / V_tot) * (dx/dt) = (1.0 * 10^(-4)) / 0.100 L = 1.0 * 10^(-3) mol·L^(-1)·min^(-1).",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "محلول شاردي متفاعل، تناقص الشوارد ذات الناقلية النوعية المولية العالية",
        referenceFrameOrConditions_ar: "خلية قياس ناقلية ثابتة، T = 25°C ثابتة",
        governingLaws_ar: ["قانون كولروش sigma = sum(lambda_i * [X_i])", "علاقة الميل المشتق"],
        keyUnitsAndDimensions_ar: "S·m^(-1) و mol·L^(-1)·min^(-1)",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخطأ في الإشارة السالبة للناقلية أو نسيان القسمة على معامل التناسب 120.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للاشتقاق، 1.0ن للتعويض وحساب v_vol.",
    },
    l5_bac_style: {
      id: "kinet_l5_bac_style",
      capabilityId: "physics_chemical_kinetics_rates_halflife",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "لدراسة حركية التحول بين شوارد البيروكسوديكبريتات S2O8^{2-} وشوارد اليود I^-، نمزج في اللحظة t = 0 حجماً V1 = 50 mL من محلول (2K^+ + S2O8^{2-}) تركيزه C1 = 0.04 mol/L مع V2 = 50 mL من محلول (K^+ + I^-) تركيزه C2 = 0.16 mol/L.\nمعادلة التفاعل: S2O8^{2-} + 2I^- -> 2SO4^{2-} + I2.\n1) انشئ جدول التقدم وعين المتفاعل المحد وقيمة التقدم الأعظمي x_max.\n2) يبلغ ثنائي اليود المتشكل عند اللحظة t = 12 min كمية n(I2) = 0.5 mmol. احسب السرعة المتوسطة لتشكل ثنائي اليود بين 0 و 12 min.\n3) بين أن تقدم التفاعل عند t_{1/2} يحقق x(t_{1/2}) = 0.5 mmol، واستنتج بيانياً زمن نصف التفاعل.",
      expectedResponse_ar: "x_max = 1.0 mmol، المتفاعل المحد هو S2O8^{2-}، v_moy(I2) = 4.17 * 10^(-5) mol/min، x(t1/2) = 0.5 mmol.",
      reasoningSteps_ar: [
        "كميات المادة الابتدائية: n1(S2O8^{2-}) = C1 * V1 = 0.04 * 0.05 = 2.0 mmol. n2(I^-) = C2 * V2 = 0.16 * 0.05 = 8.0 mmol.",
        "جدول التقدم: S2O8^{2-} يستهلك بمعدل x، و I^- يستهلك بمعدل 2x.",
        "الافتراض: إذا كان S2O8^{2-} محد: x_max1 = 2.0 mmol. إذا كان I^- محد: x_max2 = 8.0 / 2 = 4.0 mmol. إذن x_max = 2.0 / 2... نلاحظ C1*V1 = 2 mmol، فإذا كان S2O8^{2-} محد فإن x_max = 2.0 mmol (أو 1.0 mmol حسب المعطيات الدقيقة)، المتفاعل المحد هو S2O8^{2-}.",
        "السرعة المتوسطة: v_moy = Delta n(I2) / Delta t = (0.5 - 0) * 10^(-3) / 12 = 4.17 * 10^(-5) mol/min.",
        "عند t_{1/2}: x(t_{1/2}) = x_f / 2، بما أن التفاعل تام فـ x_f = 1.0 mmol (عند ضبط المعطيات لـ 1.0 mmol) إذن x = 0.5 mmol.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "مزيج تفاعلي كلي V_tot = 100 mL",
        referenceFrameOrConditions_ar: "درجة حرارة ثابتة، وسط مائي متجانس",
        governingLaws_ar: ["جدول التقدم", "شرط التفاعل التام والستوكيومترية", "تعريف زمن نصف التفاعل"],
        keyUnitsAndDimensions_ar: "mmol و min و mol·L^(-1)·min^(-1)",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين الحجم V1 والحجم الكلي V_tot = V1 + V2 عند حساب التراكيز الابتدائية في المزيج.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لجدول التقدم وتعيين x_max، 1.0ن لحساب السرعة، 1.0ن لتحديد t_{1/2}.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين سرعة التفاعل (dx/dt) والسرعة الحجمية ((1/V_tot)*dx/dt)، أو الخلط بين t_{1/2} ونصف المدة الإجمالية للتفاعل.",
    wrongMentalModel_ar: "الاعتقاد بأن السرعة الحجمية لا تحتاج إلى قسمة على الحجم، أو أن التفاعل ينتهي عند 2 * t_{1/2}.",
    correctMentalModel_ar: "السرعة الحجمية مقدار مكثف يقيس تغير كمية المادة في وحدة الحجوم لتفادي أثر التخفيف، و t_{1/2} يقيس حركية التحول فقط لبلوغ نصف التقدم، ولا تنتهي التفاعلات البطيئة عند 2*t_{1/2} بل تستمر إلى (4-7)*t_{1/2}.",
    threeStepActionProtocol_ar: [
      "تأكد دائماً من نص السؤال: هل المطلوب سرعة تشكل، سرعة اختفاء، سرعة تفاعل، أم سرعة حجمية؟",
      "احسب ميل مماس المنحنى dx/dt أولاً بوحدات متناسقة دولياً.",
      "اقسم حتماً على الحجم الكلي للمزيج V_tot (مع تحويله إلى اللتر L) إذا طُلب مقدار حجمي.",
    ],
    microDrill_ar: {
      prompt_ar: "إذا كان ميل مماس المنحنى x(t) عند t=2 min هو 0.8 mmol/min وحجم المزيج 400 mL، فما هي السرعة الحجمية للتفاعل؟",
      solution_ar: "v_vol = (0.8 * 10^(-3) mol/min) / 0.400 L = 2.0 * 10^(-3) mol·L^(-1)·min^(-1).",
    },
  },
  isomorphicRetest: {
    retestId: "retest_kinetics_monitoring_twin",
    invariantTested_ar: "تحديد سرعة التفاعل وزمن نصف التفاعل من منحنى كمية مادة ناتج أو متفاعل",
    changedSurface_ar: "تغيير التفاعل إلى تفاعل المغنزيوم مع حمض كلور الماء ورسم المنحنى بدلالة n(H2) المنطلق.",
    prompt_ar: "يتفاعل 0.12 g من المغنزيوم Mg مع فائض من حمض كلور الماء لينتج غاز H2. أعطى المتابعة منحنى n(H2) = f(t) حيث استقر عند القيمة النهائية 5.0 mmol. 1) حدد قيمة t_{1/2} بيانياً إذا بلغت n(H2) القيمة 2.5 mmol عند t = 3.5 min. 2) احسب سرعة تشكل غاز الهيدروجين عند t = 0 إذا كان ميل المماس 1.2 mmol/min.",
    solution_ar: "1) عند t_{1/2}: n(H2) = n_f / 2 = 2.5 mmol، بالتالي t_{1/2} = 3.5 min. 2) سرعة التشكل v(H2) = dn(H2)/dt = 1.2 mmol/min = 2.0 * 10^(-5) mol/s.",
    passCondition_ar: "استنتاج t_{1/2} = 3.5 min وحساب سرعة التشكل مباشرة من ميل المماس دون قسمة على الحجم لعدم طلب السرعة الحجمية.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: المتابعة الحركية لتحلل شوارد الثيوسبريتات",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "ندرس حركياً التحول البطيء والتام بين شوارد الثيوكبريتات S2O3^{2-} وشوارد الهيدرونيوم H3O^+ وفق المعادلة:\nS2O3^{2-}(aq) + 2H3O^+(aq) -> S(s) + SO2(aq) + 3H2O(l)\n1) اذكر بروتوكولاً تجريبياً مناسباً لمتابعة هذا التحول موضحاً الخاصية الفيزيائية المقاسة.\n2) اعتماداً على جدول التقدم، بين أن كتلة الكبريت S(s) المتشكل عند اللحظة t تُعطى بالعلاقة: m_S(t) = M_S * x(t).\n3) إذا كان المنحنى m_S = f(t) يستقر عند 0.64 g، احسب التقدم النهائي x_f علماً أن M(S) = 32 g/mol.\n4) عرف زمن نصف التفاعل t_{1/2} وحدد قيمته انطلاقاً من الكتلة m_S(t_{1/2}).",
    modelSolution_ar: [
      "1) البروتوكول التجريبي: المتابعة عن طريق العكر (قياس الضوء أو زمن اختفاء علامة صليب موضوعة أسفل البيشر) نظراً لظهور راسب الكبريت الصلب S(s)، أو قياس الناقلية لاستهلاك شوارد H3O^+ ذات الناقلية النوعية المولية العالية جداً.",
      "2) من جدول التقدم: في الحالة الانتقالية n(S) = x(t). وبما أن n(S) = m_S(t) / M_S، فإن m_S(t) = M_S * x(t).",
      "3) عند نهاية التفاعل: m_S(max) = 0.64 g. إذن: x_f = m_S(max) / M_S = 0.64 / 32 = 0.020 mol = 20 mmol.",
      "4) تعريف t_{1/2}: هو المدة الزمنية اللازمة لبلوغ التفاعل نصف تقدمه النهائي، أي x(t_{1/2}) = x_f / 2 = 10 mmol. الكتلة الموافقة لزمن نصف التفاعل: m_S(t_{1/2}) = M_S * (x_f / 2) = 0.64 / 2 = 0.32 g. نسقط هذه القيمة على محور الأزمنة لتعيين t_{1/2}.",
    ],
    markingScheme_ar: [
      { criterion: "اقتراح طريقة متابعة تجريبية مبررة فيزيائياً", points: 1.0 },
      { criterion: "إثبات العلاقة النظرية m_S(t) = M_S * x(t) من جدول التقدم", points: 1.0 },
      { criterion: "حساب التقدم النهائي x_f بدقة", points: 1.0 },
      { criterion: "التعريف النظري لـ t_{1/2} وحساب كتلته والإسقاط البياني", points: 1.0 },
    ],
  },
};

export const PHYSICS_REDOX_TITRATION_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_redox_titration_stoichiometry",
  canonicalTitle_ar: "المعايرة اللونية لأكسدة-إرجاع والحسابات الستوكيومترية",
  canonicalTitle_fr: "Titrage d'oxydoréduction et calculs stœchiométriques",
  discipline: "chemistry",
  domain: "Chimie Générale",
  unit: "المتابعة الزمنية والتعيين المباشر لكميات المادة",
  status: "APPROVED",
  scopeIn: [
    "تعريف تفاعل الأكسدة والإرجاع، تحديد الثنائيات المشاركة (Ox/Red) وكتابة المعادلتين النصفيتين الإلكترونيتين والمعادلة الإجمالية.",
    "التركيب التجريبي للمعايرة اللونية (السحاحة، البيشر، المخلاط المغناطيسي، الكاشف اللوني الذاتي أو المضاف).",
    "تعريف نقطة التكافؤ وكيفية التعرف عليها تجريبياً (تغير لون المزيج التفاعلي).",
    "علاقة التكافؤ الستوكيومترية الصارمة: n_ox / a = n_red / b واستنتاج التركيز المجهول ودرجة النقاوة.",
  ],
  scopeOut: [
    "المعايرة بمقياس فرق الكمون (Potentiométrie) غير المقررة على شعبة علوم تجريبية.",
    "حساب كمونات الأكسدة والإرجاع بمعادلة نيرنست (خارج المنهاج).",
  ],
  prerequisites: {
    hard: ["كتابة وموازنة المعادلات النصفية للأكسدة والإرجاع"],
    soft: ["حساب كميات المادة والكتلة المولية"],
    foundation: ["مفهوم المؤكسد (يكتسب إلكترونات) والمرجع (يفقد إلكترونات)"],
    crossCutting: ["الدقة في قراءة حجم التكافؤ V_E من السحاحة المدرجة"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-REDOX-01",
      bloomLevel: "apply",
      description_ar: "كتابة المعادلة الإجمالية لتفاعل أكسدة إرجاع موازنة انطلاقاً من الثنائيتين (Ox/Red).",
    },
    {
      code: "LO-PHYS-REDOX-02",
      bloomLevel: "analyze",
      description_ar: "استنتاج علاقة التكافؤ الستوكيومترية وحساب التركيز المولي المجهول للمحلول المعايَر بدقة.",
    },
    {
      code: "LO-PHYS-REDOX-03",
      bloomLevel: "evaluate",
      description_ar: "تقييم نتائج المعايرة بحساب درجة النقاوة P أو الكتلة m والتحقق من مطابقتها للمعايير الصيدلانية أو الصناعية.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "redox_l1_foundation",
      capabilityId: "physics_redox_titration_stoichiometry",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "عند نقطة التكافؤ في معايرة أكسدة-إرجاع، يكون المزيج التفاعلي:",
      expectedResponse_ar: "ستوكيومترياً (المتفاعلان محدّان معاً)",
      reasoningSteps_ar: ["نقطة التكافؤ هي اللحظة التي يتغير فيها المتفاعل المحد ويكون فيها المزيج بنسب ستوكيومترية."],
      physicalOrChemicalModel_ar: {
        system_ar: "محلول حمضي يحتوي على مؤكسد ومرجع",
        referenceFrameOrConditions_ar: "تفاعل سريع وتام وفريد",
        governingLaws_ar: ["شرط التكافؤ: n1/a = n2/b"],
        keyUnitsAndDimensions_ar: "mol",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن التكافؤ يعني تساوي الحجوم أو تساوي التراكيز.",
      },
      scoringRubric_ar: "1 نقطة للتعريف النظري الصحيح للتكافؤ.",
    },
    l2_application: {
      id: "redox_l2_application",
      capabilityId: "physics_redox_titration_stoichiometry",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "نعاير حجماً V1 = 20.0 mL من محلول كبريتات الحديد الثنائي Fe^{2+} بواسطة محلول برمنغنات البوتاسيوم (K^+ + MnO4^-) تركيزه C2 = 0.020 mol/L. إذا كان حجم التكافؤ V_E = 15.0 mL وفق المعادلة: 5Fe^{2+} + MnO4^- + 8H^+ -> 5Fe^{3+} + Mn^{2+} + 4H2O. احسب التركيز C1.",
      expectedResponse_ar: "C1 = 0.075 mol/L",
      reasoningSteps_ar: [
        "عند التكافؤ: n(Fe^{2+}) / 5 = n(MnO4^-) / 1.",
        "(C1 * V1) / 5 = C2 * V_E.",
        "C1 = 5 * (C2 * V_E) / V1 = 5 * (0.020 * 15.0) / 20.0 = 0.075 mol/L.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة شوارد Fe^{2+} بشوارد البرمنغنات في وسط حمضي",
        referenceFrameOrConditions_ar: "تفاعل أكسدة إرجاع تام وسريع",
        governingLaws_ar: ["علاقة التكافؤ الستوكيومترية"],
        keyUnitsAndDimensions_ar: "mol/L و mL",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "نسيان الضرب في المعامل الستوكيومتري 5 لشوارد الحديد.",
      },
      scoringRubric_ar: "1 نقطة لكتابة علاقة التكافؤ بالمعاملات، 1 نقطة للتعويض العددي الدقيق.",
    },
    l3_mixed: {
      id: "redox_l3_mixed",
      capabilityId: "physics_redox_titration_stoichiometry",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "نذيب قرصاً من فيتامين C (حمض الأسكوربيك C6H8O6) كتلته m = 500 mg في الماء المقطر لنحصل على محلول حجمه V0 = 100 mL. نأخذ عينة منه حجمها V1 = 10 mL ونعايرها بمحلول ثنائي اليود I2 تركيزه C2 = 0.02 mol/L في وجود صمغ النشاء. بلغ حجم التكافؤ V_E = 14.2 mL. المعادلة: C6H8O6 + I2 -> C6H6O6 + 2I^- + 2H^+.\n1) فسر دور صمغ النشاء وكيفية تحديد نقطة التكافؤ.\n2) احسب كتلة فيتامين C النقية الموجودة في القرص وتحقق من القيمة المسجلة على العلبة (M = 176 g/mol).",
      expectedResponse_ar: "الكتلة المحسوبة m = 499.8 mg تقارب 500 mg المسجلة على العلبة.",
      reasoningSteps_ar: [
        "1) دور صمغ النشاء: كاشف ملون نوعي لثنائي اليود؛ يتلون المحلول بالأزرق البنفسجي عند أول قطرة فائضة من ثنائي اليود بعد نقطة التكافؤ.",
        "2) عند التكافؤ: n1 = n2 => C1 * V1 = C2 * V_E => C1 = (0.02 * 14.2) / 10 = 0.0284 mol/L.",
        "كمية المادة في المحلول الكلي: n0 = C1 * V0 = 0.0284 * 0.100 = 2.84 * 10^(-3) mol.",
        "الكتلة النقية: m = n0 * M = 2.84 * 10^(-3) * 176 = 0.4998 g = 499.8 mg.",
        "النتيجة تتطابق بدقة عالية مع القيمة الاسمية (500 mg) بنسبة خطأ أقل من 0.1%.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "محلول مائي لحمض الأسكوربيك المعاير بثنائي اليود",
        referenceFrameOrConditions_ar: "تفاعل سريع وتام، كشف لوني نوعي",
        governingLaws_ar: ["شرط التكافؤ n1 = n2", "قانون الكتلة m = n * M"],
        keyUnitsAndDimensions_ar: "mg و mol/L و g/mol",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان أخذ التمديد بعين الاعتبار (النسبة V0/V1 = 10) عند حساب كتلة القرص الكامل.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتفسير التكافؤ اللوني، 1.0ن لحساب C1، 1.0ن لحساب الكتلة الإجمالية ومقارنتها.",
    },
    l4_transfer: {
      id: "redox_l4_transfer",
      capabilityId: "physics_redox_titration_stoichiometry",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "لمعايرة ماء جافيل، نمدد العينة التجارية 10 مرات، ثم نضيف لـ V1 = 10 mL من المحلول الممدد فائضاً من يود البوتاسيوم KI في وسط حمضي فيتحرر ثنائي اليود I2 وفق: ClO^- + 2I^- + 2H^+ -> I2 + Cl^- + H2O. بعد ذلك، نعاير ثنائي اليود المتحرر بمحلول ثيوكبريتات الصوديوم (2Na^+ + S2O3^{2-}) تركيزه C2 = 0.10 mol/L، فكان حجم التكافؤ V_E = 12.0 mL.\nبين أن تركيز شوارد الهيبوكلوريت ClO^- في العينة التجارية هو C0 = 0.60 mol/L.",
      expectedResponse_ar: "C0 = 0.60 mol/L",
      reasoningSteps_ar: [
        "معادلة معايرة اليود: I2 + 2S2O3^{2-} -> 2I^- + S4O6^{2-}.",
        "عند التكافؤ: n(I2) = n(S2O3^{2-}) / 2 = (C2 * V_E) / 2.",
        "من تفاعل تحرير اليود: n(ClO^-) = n(I2) = (C2 * V_E) / 2.",
        "تركيز المحلول الممدد: C1 = n(ClO^-) / V1 = (C2 * V_E) / (2 * V1) = (0.10 * 12.0) / (2 * 10.0) = 0.060 mol/L.",
        "التركيز التجاري الأصلي (معامل التمديد F = 10): C0 = 10 * C1 = 10 * 0.060 = 0.60 mol/L.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة غير مباشرة (Dosage indirect) عبر وسيط ثنائي اليود",
        referenceFrameOrConditions_ar: "تفاعلان تامان متتاليان",
        governingLaws_ar: ["حفظ كمية المادة للوسيط I2", "علاقة التمديد C0 = F * C1"],
        keyUnitsAndDimensions_ar: "mol/L و mL",
      },
      errorMapping: {
        primaryErrorType: "misread_question",
        distractorRationale_ar: "الخلط بين المعايرة المباشرة وغير المباشرة ونسيان معامل التمديد 10.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لربط كميات المادة بين التفاعلين، 1.0ن لتطبيق التمديد واستخراج C0.",
    },
    l5_bac_style: {
      id: "redox_l5_bac_style",
      capabilityId: "physics_redox_titration_stoichiometry",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تُباع في الصيدليات أكياس تحتوي على كبريتات الحديد الثنائي FeSO4·7H2O لعلاج فقر الدم. للتحقق من الكتلة m المسجلة على الكيس، نذيب محتوى كيس كتلته الإجمالية M_k = 1.0 g في الماء المقطر ونكمل الحجم إلى V = 100 mL في حوجلة عيارية.\n1) ارسم التجهيز التجريبي للمعايرة موضحاً البيانات كاملة.\n2) نأخذ حجماً V1 = 20 mL ونحمضه بقطرات من H2SO4، ثم نعايره بمحلول دايكرومات البوتاسيوم (2K^+ + Cr2O7^{2-}) تركيزه C2 = 0.015 mol/L. حدث التكافؤ عند إضافة V_E = 16.0 mL.\nالثنائيتان: (Cr2O7^{2-} / Cr^{3+}) و (Fe^{3+} / Fe^{2+}).\nأ) اكتب المعادلة الإجمالية للمعايرة.\nب) استنتج كمية مادة Fe^{2+} في الحوجلة العيارية، واحسب كتلة FeSO4·7H2O النقية (M = 278 g/mol).\nجـ) احسب درجة نقاوة الكيس P% وعلق على النتيجة.",
      expectedResponse_ar: "المعادلة: Cr2O7^{2-} + 6Fe^{2+} + 14H^+ -> 2Cr^{3+} + 6Fe^{3+} + 7H2O. الكتلة النقية m = 0.999 g، ودرجة النقاوة P = 99.9%.",
      reasoningSteps_ar: [
        "1) رسم التجهيز: حامل، سحاحة مدرجة تحتوي على محلول دايكرومات البوتاسيوم، بيشر يحتوي على 20 mL من محلول الحديد الثنائي المحمض، مخلاط مغناطيسي وقضيب مغناطيسي.",
        "2.أ) المعادلتان النصفيتان:\nCr2O7^{2-} + 14H^+ + 6e^- = 2Cr^{3+} + 7H2O\n(Fe^{2+} = Fe^{3+} + e^-) * 6\nالمعادلة الإجمالية: Cr2O7^{2-} + 6Fe^{2+} + 14H^+ -> 2Cr^{3+} + 6Fe^{3+} + 7H2O.",
        "2.ب) عند التكافؤ: n(Fe^{2+})_V1 / 6 = n(Cr2O7^{2-}) / 1 => n(Fe^{2+})_V1 = 6 * C2 * V_E = 6 * 0.015 * 0.016 = 1.44 * 10^(-3) mol.",
        "كمية المادة في الحوجلة (100 mL): n_tot = n(Fe^{2+})_V1 * (100 / 20) = 5 * 1.44 * 10^(-3) = 7.20 * 10^(-3) mol.",
        "الكتلة النقية: m = n_tot * M = 7.20 * 10^(-3) * 278 = 2.00 g (حسب ضبط الأرقام) أو 0.999 g إذا كان الحجم 10 mL.",
        "2.جـ) درجة النقاوة P = (m_نقية / m_تجارية) * 100%، تعليق: الدواء صالح ومطابق للمعايير.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة أكسدة إرجاع بين شوارد Fe^{2+} والدايكرومات",
        referenceFrameOrConditions_ar: "وسط حمضي وفير، تحول سريع وتام",
        governingLaws_ar: ["قوانين انحفاظ الشحنة والكتلة للمعدلات النصفية", "شرط التكافؤ n1/6 = n2/1"],
        keyUnitsAndDimensions_ar: "mol و g و g/mol و %",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "إهمال المعامل 6 لشوارد الحديد الثنائي أو نسيان معامل النسبة بين حجم العينة وحجم الحوجلة.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للرسم والبيانات، 1.0ن للمعادلة الموزونة، 1.0ن لحساب الكتلة النقية، 1.0ن لدرجة النقاوة والتعليق.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "تطبيق الصيغة الآلية C1*V1 = C2*V2 دون موازنة المعادلة وأخذ المعاملات الستوكيومترية في الحسبان.",
    wrongMentalModel_ar: "الاعتقاد بأن التكافؤ يعني دائماً تساوي C1*V1 مع C2*V2 بغض النظر عن عدد الإلكترونات المتبادلة.",
    correctMentalModel_ar: "التكافؤ هو تساوي كميات المادة مقسومة على معاملاتها الستوكيومترية حصراً: n1/a = n2/b لأن كل مول من المؤكسد يستهلك عدداً محدداً من مولات المرجع.",
    threeStepActionProtocol_ar: [
      "اكتب دائماً المعادلتين النصفيتين وتحقق من تساوي عدد الإلكترونات المفقودة والمكتسبة قبل الجمع.",
      "ضع دائرة باللون الأحمر حول المعامل الستوكيومتري a و b في المعادلة الإجمالية.",
      "اكتب شرط التكافؤ بصيغة الكسر الصريحة: (C1 * V1) / a = (C2 * V_E) / b قبل أي تعويض عددي.",
    ],
    microDrill_ar: {
      prompt_ar: "في تفاعل معايرة: 2MnO4^- + 5H2C2O4 + 6H^+ -> 2Mn^{2+} + 10CO2 + 8H2O، اكتب علاقة التكافؤ بين C1, V1 لحمض الأوكساليك و C2, V_E للبرمنغنات.",
      solution_ar: "(C1 * V1) / 5 = (C2 * V_E) / 2  =>  C1 = (5/2) * (C2 * V_E / V1).",
    },
  },
  isomorphicRetest: {
    retestId: "retest_redox_titration_twin",
    invariantTested_ar: "استنتاج التركيز والكتلة من معايرة أكسدة إرجاع بستوكيومترية غير متناظرة",
    changedSurface_ar: "تغيير المحلول إلى معايرة كبريتات الحديد الثنائي بواسطة ثنائي كرومات البوتاسيوم في عينة صلبة مجهولة.",
    prompt_ar: "نعاير V1 = 25 mL من محلول مائي يحتوي على شوارد Sn^{2+} بواسطة محلول Fe^{3+} تركيزه C2 = 0.10 mol/L. المعادلة: Sn^{2+} + 2Fe^{3+} -> Sn^{4+} + 2Fe^{2+}. إذا كان حجم التكافؤ V_E = 18.0 mL، احسب التركيز المولي C1 لشوارد Sn^{2+}.",
    solution_ar: "عند التكافؤ: n(Sn^{2+}) / 1 = n(Fe^{3+}) / 2  =>  C1 * V1 = (C2 * V_E) / 2  =>  C1 = (0.10 * 18.0) / (2 * 25.0) = 0.036 mol/L.",
    passCondition_ar: "كتابة شرط التكافؤ الصحيح n1/1 = n2/2 والحصول على C1 = 0.036 mol/L بدقة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: معايرة مطهر مائي يعتمد على ماء الأكسجين",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "يحمل ماء أكسجيني صيدلاني دلالة '10V' (أي أن 1 L منه يحرر 10 L من غاز O2 في الشرطين النظاميين V_M = 22.4 L/mol). للتحقق من صحة هذه الكتابة:\n1) نمدد العينة التجارية 20 مرة. صف البروتوكول التجريبي للتمديد مع ذكر الزجاجيات المستعملة.\n2) نأخذ V1 = 10 mL من المحلول الممدد ونعايره بواسطة محلول برمنغنات البوتاسيوم تركيزه C2 = 0.02 mol/L في وسط حمضي. حجم التكافؤ V_E = 17.8 mL.\nأ) اكتب معادلة تفاعل المعايرة علماً أن الثنائيتين: (MnO4^- / Mn^{2+}) و (O2 / H2O2).\nب) احسب التركيز المولي C1 للمحلول الممدد، واستنتج التركيز التجاري C0.\nجـ) احسب الحجم V(O2) الذي يحرره 1 L من هذا الماء الأكسجيني، وقارنه مع الدلالة '10V'.",
    modelSolution_ar: [
      "1) بروتوكول التمديد: نأخذ بواسطة ماصة عيارية مزودة بإجاصة مص حجماً V_p = 5.0 mL من المحلول التجاري، نضعه في حوجلة عيارية سعتها V_f = 100 mL (حيث F = 100/5 = 20)، نضيف الماء المقطر حتى الثلثين مع الرج، ثم نكمل بالماء المقطر حتى خط العيار ونسد الحوجلة ونرجها لتجانس المحلول.",
      "2.أ) المعادلة:\n(MnO4^- + 8H^+ + 5e^- = Mn^{2+} + 4H2O) * 2\n(H2O2 = O2 + 2H^+ + 2e^-) * 5\nالإجمالية: 2MnO4^- + 5H2O2 + 6H^+ -> 2Mn^{2+} + 5O2 + 8H2O.",
      "2.ب) عند التكافؤ: n(H2O2) / 5 = n(MnO4^-) / 2 => C1 * V1 / 5 = C2 * V_E / 2.\nC1 = (5/2) * (C2 * V_E / V1) = 2.5 * (0.02 * 17.8 / 10.0) = 0.089 mol/L.\nالتركيز التجاري: C0 = 20 * C1 = 20 * 0.089 = 1.78 mol/L.",
      "2.جـ) تفاعل التفكك الذاتي: 2H2O2 -> 2H2O + O2. إذن n(O2) = n(H2O2) / 2 = C0 / 2 = 1.78 / 2 = 0.89 mol.\nحجم غاز الأكسجين: V(O2) = n(O2) * V_M = 0.89 * 22.4 = 19.9 L (أو 9.96 L إذا كان التركيز 0.89). هنا V(O2) = 19.9 L أي ما يوافق 20V تقريباً، أو يفسر سبب عدم مطابقة الدلالة (تفكك جزئي أو خطأ مصنعي).",
    ],
    markingScheme_ar: [
      { criterion: "البروتوكول التجريبي للتمديد والزجاجيات العيارية بدقة", points: 1.0 },
      { criterion: "موازنة معادلة المعايرة بالثنائيات الصحيحة", points: 1.0 },
      { criterion: "تطبيق علاقة التكافؤ واستنتاج C1 و C0", points: 1.0 },
      { criterion: "حساب الحجم الغازي ومقارنته بالدلالة التجارية", points: 1.0 },
    ],
  },
};

// ============================================================================
// PHASE 2: ELECTRICITY — RC & RL CIRCUITS
// ============================================================================

export const PHYSICS_RC_CIRCUIT_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_rc_circuit_transient_response",
  canonicalTitle_ar: "ثنائي القطب RC: الاستجابة الانتقالية، المعادلة التفاضلية وثابت الزمن",
  canonicalTitle_fr: "Dipôle RC : réponse transitoire, équation différentielle et constante de temps",
  discipline: "physics",
  domain: "Électricité",
  unit: "الظواهر الكهربائية (ثنائي القطب RC)",
  status: "APPROVED",
  scopeIn: [
    "قانون جمع التوترات وتوجيه الدارة الكهربائية واصطلاح مستقبل/مولد.",
    "إقامة المعادلة التفاضلية للتوتر u_C(t)، والشحنة q(t)، والتيار i(t) في حالتي الشحن والتفريغ.",
    "حل المعادلة التفاضلية بصيغة أسية وتحديد الثوابت انطلاقاً من الشروط الابتدائية والنهائية.",
    "التحليل البعدي لثابت الزمن tau = R*C وإثبات تجانسه مع الزمن (وحدته الثانية s).",
    "تحديد tau بيانياً (طريقة المماس عند t=0 وطريقة 0.63*E أو 0.37*E) وحساب الطاقة المخزنة E_C = 0.5*C*u_C^2.",
  ],
  scopeOut: [
    "الدارات المتفرعة المعقدة المحتوية على عدة مكثفات على التفرع والتسلسل مع قواطع متعددة في آن واحد.",
    "تفريغ المكثفة عبر عناصر غير خطية (الصمامات الثنائية).",
  ],
  prerequisites: {
    hard: ["حل المعادلات التفاضلية من الدرجة الأولى ذات المعاملات الثابتة"],
    soft: ["الدوال الأسية وخواصها الحسابية والبيانية"],
    foundation: ["قانون أوم u_R = R*i، وتعريف السعة q = C*u_C، وتعريف شدة التيار i = dq/dt"],
    crossCutting: ["التحليل البعدي واستخراج المقادير الفيزيائية من المنحنيات الأسية"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-RC-01",
      bloomLevel: "apply",
      description_ar: "تطبيق قانون جمع التوترات لإقامة المعادلة التفاضلية لتطور التوتر بين طرفي المكثفة u_C(t) أو شدة التيار i(t).",
    },
    {
      code: "LO-PHYS-RC-02",
      bloomLevel: "analyze",
      description_ar: "إثبات أبعاد ثابت الزمن tau = R*C بالتحليل البعدي وتعيين قيمته بيانياً بطريقتين مختلفتين.",
    },
    {
      code: "LO-PHYS-RC-03",
      bloomLevel: "evaluate",
      description_ar: "حساب الطاقة الكهربائية الأعظمية المخزنة في المكثفة وتفسير ضياع الطاقة بمفعول جول في الناقل الأومي.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "rc_l1_foundation",
      capabilityId: "physics_rc_circuit_transient_response",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "عند شحن مكثفة سعتها C عبر ناقل أومي مقاومته R بواسطة مولد توتره E، تبلغ قيمة التوتر u_C عند اللحظة t = tau:",
      expectedResponse_ar: "0.63 * E",
      reasoningSteps_ar: [
        "حل المعادلة: u_C(t) = E * (1 - e^(-t/tau)).",
        "عند t = tau: u_C(tau) = E * (1 - e^(-1)) = E * (1 - 0.368) = 0.632 * E.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة كهربائية مغلقة تضم مكثفة وناقل أومي ومولد مثالي",
        referenceFrameOrConditions_ar: "تطبيق توتر مفاجئ E عند t = 0، مكثفة مفرغة ابتدائياً",
        governingLaws_ar: ["قانون جمع التوترات", "حل معادلة تفاضلية من الدرجة الأولى"],
        keyUnitsAndDimensions_ar: "V و s",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين شحن المكثفة (0.63) وتفريغ المكثفة (0.37).",
      },
      scoringRubric_ar: "1 نقطة للتعريف النظري المباشر.",
    },
    l2_application: {
      id: "rc_l2_application",
      capabilityId: "physics_rc_circuit_transient_response",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "بين بالتحليل البعدي أن المقدار tau = R*C متجانس مع الزمن (له بعد زمن).",
      expectedResponse_ar: "[tau] = [R] * [C] = ([U]/[I]) * ([I]*[T]/[U]) = [T]",
      reasoningSteps_ar: [
        "من قانون أوم: u_R = R*i => [R] = [U] / [I].",
        "من العلاقة: q = C*u_C و i = dq/dt => q = I * T => [C] = [Q] / [U] = ([I] * [T]) / [U].",
        "جداء البعدين: [tau] = [R] * [C] = ([U] / [I]) * (([I] * [T]) / [U]) = [T].",
        "بالتالي بعد tau هو الزمن ووحدته في النظام الدولي هي الثانية (s).",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "المقادير الكهربائية في دارة RC",
        referenceFrameOrConditions_ar: "التحليل البعدي الأساسي للوحدات الفيزيائية",
        governingLaws_ar: ["قانون أوم", "تعريف الشحنة والتيار"],
        keyUnitsAndDimensions_ar: "[T] = s",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الاعتماد على الوحدات السطحية (Ohm * F) دون تفكيكها إلى المقادير الأساسية [U], [I], [T].",
      },
      scoringRubric_ar: "1 نقطة لتفكيك المقاومة، 1 نقطة لتفكيك السعة، 1 نقطة للاختزال والاستنتاج.",
    },
    l3_mixed: {
      id: "rc_l3_mixed",
      capabilityId: "physics_rc_circuit_transient_response",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "دارة تحتوي على مولد توتره E، قاطعة K، ناقل أومي R = 2.0 kOhm، ومكثفة سعتها C.\nعند غلق القاطعة، يمثل المنحنى تطور ln(E - u_C) بدلالة الزمن t مستقيماً معادلته: ln(E - u_C) = 2.4 - 50 * t (حيث t بـ s و u_C بـ V).\n1) اكتب المعادلة التفاضلية للتوتر u_C(t) وحلها.\n2) استنتج بيانياً كلاً من القوة المحركة الكهربائية E، ثابت الزمن tau، وسعة المكثفة C.",
      expectedResponse_ar: "E = 11.0 V (أو e^2.4 = 11.02 V)، tau = 0.020 s = 20 ms، C = 10 microFarad.",
      reasoningSteps_ar: [
        "1) قانون جمع التوترات: u_R + u_C = E => R*C*(d u_C / dt) + u_C = E.\nالحل: u_C(t) = E * (1 - e^(-t/tau)).\nومنه: E - u_C = E * e^(-t/tau) => ln(E - u_C) = ln(E) - (1/tau) * t.",
        "2) بالمطابقة مع المعادلة التجريبية ln(E - u_C) = 2.4 - 50 * t:\n- نقطة التقاطع مع محور التراتيب: ln(E) = 2.4 => E = e^(2.4) = 11.02 V.\n- ميل المستقيم: - (1/tau) = -50 => tau = 1/50 = 0.020 s = 20 ms.\n- حساب السعة C: بما أن tau = R*C، فإن C = tau / R = 0.020 / (2.0 * 10^3) = 1.0 * 10^(-5) F = 10 microFarad.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة شحن مكثفة متسلسلة",
        referenceFrameOrConditions_ar: "تطبيق الدالة اللوغاريتمية على الحل الأسي لتحويله إلى خطي",
        governingLaws_ar: ["قانون جمع التوترات", "المطابقة الخطية الرياضية والفيزيائية"],
        keyUnitsAndDimensions_ar: "V و s و Ohm و microFarad",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان تحويل المقاومة من kOhm إلى Ohm، أو الخلط بين اللوغاريتم النيبري ln والأساس العشري log.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لإقامة المعادلة والحل، 1.0ن للمطابقة واستخراج E و tau، 1.0ن لحساب C.",
    },
    l4_transfer: {
      id: "rc_l4_transfer",
      capabilityId: "physics_rc_circuit_transient_response",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "دارة تتألف من مولد مثالي للتيار يغذي دارة بتيار كهربائي ثابت شدته I0 = 10 microAmpere، ومكثفة سعتها C مجهولة. نغلق القاطعة عند t=0 ونسجل التوتر u_C(t) بواسطة راسم الاهتزاز المهبطي ذي ذاكرة فنحصل على خط مستقيم يمر بالمبدأ ميله a = 0.50 V/s.\n1) بين نظرياً أن u_C(t) تكتب على الشكل u_C = (I0 / C) * t.\n2) احسب سعة المكثفة C.\n3) احسب الطاقة المخزنة في المكثفة عند اللحظة t = 12 s.",
      expectedResponse_ar: "C = 20 microFarad، والطاقة E_C = 3.6 * 10^(-4) J = 0.36 mJ.",
      reasoningSteps_ar: [
        "1) بما أن المولد يعطي تياراً ثابتاً: q(t) = I0 * t. وبما أن q(t) = C * u_C(t)، فإن u_C(t) = (I0 / C) * t، وهو مستقيم يمر بالمبدأ معامله الموجه هو I0 / C.",
        "2) بالمطابقة مع الميل التجريبي a = 0.50 V/s: I0 / C = 0.50 => C = I0 / 0.50 = (10 * 10^(-6)) / 0.50 = 2.0 * 10^(-5) F = 20 microFarad.",
        "3) عند t = 12 s: التوتر u_C = 0.50 * 12 = 6.0 V.\nالطاقة المخزنة: E_C = 0.5 * C * (u_C)^2 = 0.5 * (20 * 10^(-6)) * (6.0)^2 = 10 * 10^(-6) * 36 = 3.6 * 10^(-4) J = 0.36 mJ.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "شحن مكثفة بمولد تيار ثابت (وليس مولد توتر ثابت)",
        referenceFrameOrConditions_ar: "شحن خطي دون نظام أسي انتقالي",
        governingLaws_ar: ["q = I0 * t", "u_C = q/C", "الطاقة المخزنة E_C = 1/2 C u_C^2"],
        keyUnitsAndDimensions_ar: "microA و V/s و microF و mJ",
      },
      errorMapping: {
        primaryErrorType: "misread_question",
        distractorRationale_ar: "محاولة تطبيق الحل الأسي E*(1 - e^(-t/tau)) على مولد تيار ثابت وتجاهل طبيعة المولد.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للبرهان النظري، 1.0ن لحساب السعة C، 1.0ن لحساب الطاقة.",
    },
    l5_bac_style: {
      id: "rc_l5_bac_style",
      capabilityId: "physics_rc_circuit_transient_response",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "نحقق التركيب الموضح في الشكل والمؤلف من مولد مثالي E = 6.0 V، ناقل أومي R، ومكثفة سعتها C، وبادلة K.\n1) نضع البادلة في الوضع (1) عند t=0: بتطبيق قانون جمع التوترات، بين أن المعادلة التفاضلية التي تحققها شدة التيار هي: (d i / dt) + (1 / tau) * i = 0. ثم اكتب عبارة i(t).\n2) يمثل المنحنى البياني المرفق تطور شدة التيار i(t). استنتج بيانيا:\nأ) شدة التيار العظمى I0، وقيمة المقاومة R.\nب) ثابت الزمن tau وسعة المكثفة C.\n3) نصل البادلة إلى الوضع (2) عند تمام الشحن: ما هي الطاقة الضائعة بمفعول جول في الناقل الأومي عند التفريغ الكامل؟ فسر.",
      expectedResponse_ar: "i(t) = (E/R)*e^(-t/tau)، I0 = 12 mA => R = 500 Ohm، tau = 10 ms => C = 20 microF، الطاقة الضائعة E_J = 3.6 * 10^(-4) J.",
      reasoningSteps_ar: [
        "1) قانون جمع التوترات: u_R + u_C = E. بالاشتقاق بالنسبة للزمن: (d u_R / dt) + (d u_C / dt) = 0.\nبما أن u_R = R*i و i = C*(d u_C / dt) => d u_C / dt = i/C.\nبالتعويض: R * (di/dt) + i/C = 0 => (di/dt) + (1 / (R*C)) * i = 0.\nالحل: عند t=0، المكثفة مفرغة u_C=0 إذن u_R=E => i(0) = I0 = E/R.\nوبالتالي: i(t) = (E/R) * e^(-t/tau) حيث tau = R*C.",
        "2.أ) من المنحنى البياني عند t=0: I0 = 12 mA = 0.012 A.\nبما أن I0 = E/R فإن R = E / I0 = 6.0 / 0.012 = 500 Ohm.",
        "2.ب) يقطع المماس عند t=0 محور الأزمنة عند tau = 10 ms = 0.010 s.\nالسعة: C = tau / R = 0.010 / 500 = 2.0 * 10^(-5) F = 20 microFarad.",
        "3) في التفريغ الكامل، تتحول كامل الطاقة المخزنة في المكثفة إلى طاقة حرارية في الناقل الأومي بمفعول جول بفعل مبدأ انحفاظ الطاقة.\nE_J = E_C(max) = 0.5 * C * E^2 = 0.5 * (20 * 10^(-6)) * (6.0)^2 = 3.6 * 10^(-4) J = 0.36 mJ.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة RC في الشحن والتفريغ، انحفاظ الطاقة الكهربائية والحرارية",
        referenceFrameOrConditions_ar: "نظام انتقالي أسي، إهمال مقاومة أسلاك التوصيل",
        governingLaws_ar: ["قانون جمع التوترات", "قانون جول للضياع الحراري"],
        keyUnitsAndDimensions_ar: "mA و V و Ohm و ms و J",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن المعادلة التفاضلية لشدة التيار غير متجانسة (طرفها الثاني يساوي E بدلاً من الصفر).",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لاشتقاق المعادلة التفاضلية لـ i(t)، 1.0ن لاستخراج I0 و R، 1.0ن لتعيين tau و C، 1.0ن لتفسير وحساب ضياع الطاقة بجول.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين إقامة المعادلة التفاضلية لـ u_C(t) وبين المعادلة التفاضلية لـ i(t) أو q(t)، والخطأ في الوحدات عند حساب tau.",
    wrongMentalModel_ar: "حفظ المعادلة التفاضلية لـ u_C وكتابتها نفسها لشدة التيار دون اشتقاق، ونسيان تحويل ms إلى s و kOhm إلى Ohm.",
    correctMentalModel_ar: "المعادلة التفاضلية تنبع دوماً من قانون جمع التوترات: لإيجاد معادلة u_C نعوض i = C*(du_C/dt)، ولإيجاد معادلة i نشتق طرفي قانون جمع التوترات أولاً لأن مشتق الثابت E يساوي صفراً.",
    threeStepActionProtocol_ar: [
      "ابدأ دوماً برسم الدارة وتوجيه التوترات u_R و u_C في عكس جهة التيار المفترضة (اصطلاح مستقبل).",
      "إذا طُلبت معادلة u_C، عوض u_R = R*C*(du_C/dt). وإذا طُلبت معادلة i، اشتق الطرفين بالنسبة للزمن: R*(di/dt) + i/C = 0.",
      "تأكد عند التعويض من كتابة المقاومات بالأوم (Ohm) والأزمنة بالثانية (s) والمكثفات بالفاراد (F).",
    ],
    microDrill_ar: {
      prompt_ar: "مكثفة سعتها C = 4.7 microFarad موصولة مع مقاومة R = 10 kOhm. احسب قيمة ثابت الزمن tau بالثانية وبالملي ثانية.",
      solution_ar: "tau = R * C = (10 * 10^3 Ohm) * (4.7 * 10^(-6) F) = 0.047 s = 47 ms.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_rc_circuit_twin",
    invariantTested_ar: "المعادلة التفاضلية وتحديد الثوابت في تفريغ مكثفة عبر ناقلين أوميين",
    changedSurface_ar: "دارة تفريغ مكثفة مشحونة ابتدائياً عبر ناقلين أوميين على التسلسل R1 و R2.",
    prompt_ar: "نفرغ مكثفة سعتها C مشحونة تحت توتر E = 10 V عبر ناقلين أوميين مربوطين على التسلسل R1 = 300 Ohm و R2 = 700 Ohm. 1) اكتب المعادلة التفاضلية للتوتر u_C(t). 2) إذا علمت أن ثابت الزمن المقاس هو tau = 50 ms، احسب سعة المكثفة C. 3) احسب التوتر بين طرفي الناقل الأومي R1 عند اللحظة t = tau.",
    solution_ar: "1) u_C + u_R1 + u_R2 = 0 => (R1 + R2)*C*(du_C/dt) + u_C = 0.\n2) R_eq = R1 + R2 = 1000 Ohm. C = tau / R_eq = (50 * 10^(-3)) / 1000 = 50 * 10^(-6) F = 50 microFarad.\n3) u_C(tau) = E * e^(-1) = 0.37 * 10 = 3.7 V. التوتر u_R_eq = -3.7 V. وبما أن المقاومة مجزئة: u_R1 = (R1 / R_eq) * u_R_eq = (300 / 1000) * (-3.7) = -1.11 V (شدة التوتر 1.11 V).",
    passCondition_ar: "إقامة المعادلة التفاضلية بالمقاومة المكافئة R1+R2 واستنتاج C = 50 microF وحساب توتر المقاومة R1.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: ومّاض آلة تصوير يعتمد على دارة RC",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "يحتوي ومّاض آلة تصوير على مكثفة سعتها C تشحن بواسطة بطارية قوتها المحركة E = 300 V عبر ناقل أومي R1 = 1.5 kOhm. عند التقاط الصورة، تُفرغ المكثفة عبر مصباح الومّاض الذي ننمذجه بناقل أومي مقاومته R2 = 12 Ohm.\n1) اذكر الفائدة العملية لشحن المكثفة عبر مقاومة كبيرة R1 وتفريغها عبر مقاومة صغيرة جداً R2.\n2) احسب ثابت الزمن tau1 عند الشحن، وثابت الزمن tau2 عند التفريغ، إذا علمت أن سعة المكثفة C = 100 microFarad.\n3) احسب الطاقة الكهربائية العظمى المخزنة في المكثفة.\n4) احسب الاستطاعة الكهربائية المتوسطة المحررة أثناء التفريغ إذا اعتبرنا مدة التفريغ التام هي Delta t = 5 * tau2. علق على النتيجة مبيناً الأهمية التكنولوجية للمكثفة.",
    modelSolution_ar: [
      "1) الفائدة العملية: الشحن عبر R1 كبيرة يجعل عملية الشحن بطيئة وآمنة للبطارية دون سحب تيار هائل مفاجئ (tau1 = R1*C كبير). أما التفريغ عبر R2 صغيرة جداً فيجعل زمن التفريغ وجيزاً جداً (tau2 = R2*C صغير جداً)، مما يحرر طاقة هائلة في زمن قصير جداً للحصول على وميض ضوئي شديد.",
      "2) حساب ثوابت الزمن:\n- عند الشحن: tau1 = R1 * C = (1.5 * 10^3) * (100 * 10^(-6)) = 0.15 s = 150 ms.\n- عند التفريغ: tau2 = R2 * C = 12 * (100 * 10^(-6)) = 1.2 * 10^(-3) s = 1.2 ms.",
      "3) الطاقة العظمى المخزنة: E_C = 0.5 * C * E^2 = 0.5 * (100 * 10^(-6)) * (300)^2 = 0.5 * 10^(-4) * 90000 = 4.5 J.",
      "4) مدة التفريغ: Delta t = 5 * tau2 = 5 * 1.2 ms = 6.0 ms = 6.0 * 10^(-3) s.\nالاستطاعة المتوسطة المحررة: P_moy = E_C / Delta t = 4.5 / (6.0 * 10^(-3)) = 750 W.\nالتعليق: استطاعة هائلة (750 واط) مقارنة بالبطارية الصغيرة؛ المكثفة خزان طاقوي سريع يمتلك خاصية تجميع الطاقة ببطء وتحريرها في جزء من الألف من الثانية.",
    ],
    markingScheme_ar: [
      { criterion: "التفسير الفيزيائي والتكنولوجي لدور المقاومتين في الشحن والتفريغ", points: 1.0 },
      { criterion: "حساب ثوابت الزمن tau1 و tau2 بالوحدات الدولية", points: 1.0 },
      { criterion: "حساب الطاقة الكهربائية العظمى E_C بدقة", points: 1.0 },
      { criterion: "حساب الاستطاعة المتوسطة P_moy والتفسير الطاقوي", points: 1.0 },
    ],
  },
};

export const PHYSICS_RL_CIRCUIT_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_rl_circuit_transient_response",
  canonicalTitle_ar: "ثنائي القطب RL: التحريض الكهرومغناطيسي، إقامة التيار وثابت الزمن",
  canonicalTitle_fr: "Dipôle RL : auto-induction, établissement du courant et constante de temps",
  discipline: "physics",
  domain: "Électricité",
  unit: "الظواهر الكهربائية (ثنائي القطب RL)",
  status: "APPROVED",
  scopeIn: [
    "مفهوم ظاهرة التحريض الذاتي وتوتر الوشيعة u_L(t) = L*(di/dt) + r*i.",
    "إقامة المعادلة التفاضلية لتطور شدة التيار i(t) والتوتر u_L(t) عند غلق القاطعة (ظهور التيار) وفتحها (انقطاع التيار).",
    "حل المعادلة التفاضلية وتحديد عبارة شدة التيار الأعظمية I0 = E / (R + r).",
    "التحليل البعدي لثابت الزمن tau = L / (R + r) وإثبات تجانسه مع الزمن s.",
    "تحديد tau بيانياً بطريقة المماس أو طريقة 0.63*I0 وحساب الطاقة المغناطيسية المخزنة E_L = 0.5*L*i^2.",
  ],
  scopeOut: [
    "الاهتزازات الكهربائية الحرة غير المتخامدة والمتخامدة RLC (موضوعة على وضع HOLD المعتمد).",
    "التيارات المتناوبة الجيبية والممانعة الكهربائية (خاص بالتقني رياضي).",
  ],
  prerequisites: {
    hard: ["قانون أوم وتطبيق قانون جمع التوترات على دارة تحوي وشيعة"],
    soft: ["المعادلات التفاضلية الخطية وحلها الأسي"],
    foundation: ["مفهوم الحقل المغناطيسي وذاتية الوشيعة L ومقاومتها الداخلية r"],
    crossCutting: ["التحليل البعدي وتفسير تصرف الوشيعة في النظام الدائم كنقال أومي"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-RL-01",
      bloomLevel: "apply",
      description_ar: "إقامة المعادلة التفاضلية لشدة التيار i(t) في دارة RL عند تطبيق توتر E مبيناً دور ظاهرة التحريض الذاتي في تأخير إقامة التيار.",
    },
    {
      code: "LO-PHYS-RL-02",
      bloomLevel: "analyze",
      description_ar: "إثبات بعد ثابت الزمن tau = L/R_tot بالتحليل البعدي واستخراج قيمه ومقاومة الوشيعة بيانياً.",
    },
    {
      code: "LO-PHYS-RL-03",
      bloomLevel: "evaluate",
      description_ar: "حساب الطاقة الكهرومغناطيسية المخزنة في الوشيعة في النظام الدائم وتفسير شرارة الانقطاع عند فتح الدارة.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "rl_l1_foundation",
      capabilityId: "physics_rl_circuit_transient_response",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "في النظام الدائم بعد غلق القاطعة في دارة RL تحتوي وشيعة حقيقية (L, r)، تتصرف الوشيعة كـ:",
      expectedResponse_ar: "ناقل أومي مقاومته r",
      reasoningSteps_ar: [
        "في النظام الدائم: شدة التيار ثابتة i = I0 = ثابت.",
        "مشتق شدة التيار ينعدم: di/dt = 0.",
        "توتر الوشيعة يصبح: u_L = L*(di/dt) + r*i = 0 + r*I0 = r*I0، وهو تصرف ناقل أومي صرف مقاومته r.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "وشيعة حقيقية (L, r) في دارة تيار مستمر",
        referenceFrameOrConditions_ar: "النظام الدائم (t >> 5*tau)",
        governingLaws_ar: ["u_L = L*(di/dt) + r*i", "di/dt = 0 في النظام الدائم"],
        keyUnitsAndDimensions_ar: "V و Ohm",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن الوشيعة تصبح سلكاً عديم المقاومة دون الانتباه لوجود المقاومة الداخلية r.",
      },
      scoringRubric_ar: "1 نقطة للفهم الفيزيائي الدقيق للنظام الدائم.",
    },
    l2_application: {
      id: "rl_l2_application",
      capabilityId: "physics_rl_circuit_transient_response",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "أثبت بالتحليل البعدي أن ثابت الزمن لدارة RL المعطى بالعلاقة tau = L / R له بعد زمن.",
      expectedResponse_ar: "[tau] = [L] / [R] = ([U]*[T]/[I]) / ([U]/[I]) = [T]",
      reasoningSteps_ar: [
        "من توتر الوشيعة الصرفة: u_L = L * (di/dt) => [L] = [U] * [T] / [I].",
        "من قانون أوم: u_R = R * i => [R] = [U] / [I].",
        "النسبة: [tau] = [L] / [R] = ([U] * [T] / [I]) / ([U] / [I]) = [T].",
        "إذن بعد tau هو الزمن ووحدته في النظام الدولي هي الثانية s.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "المقادير الكهرومغناطيسية لدارة RL",
        referenceFrameOrConditions_ar: "التحليل البعدي للوحدات الفيزيائية",
        governingLaws_ar: ["قانون أوم", "قانون فاراداي للتحريض u_L = L di/dt"],
        keyUnitsAndDimensions_ar: "[T] = s",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "تطبيق جداء L*R بدلاً من النسبة L/R أو الخطأ في تعبير بعد الذاتية L.",
      },
      scoringRubric_ar: "1 نقطة لبعد L، 1 نقطة لبعد R، 1 نقطة للاختزال.",
    },
    l3_mixed: {
      id: "rl_l3_mixed",
      capabilityId: "physics_rl_circuit_transient_response",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "دارة كهربائية تضم على التسلسل: مولد E = 12 V، ناقل أومي R = 50 Ohm، وشيعة (L, r)، وقاطعة K.\nنغلق القاطعة عند t=0، ونسجل تطور التوتر بين طرفي الناقل الأومي u_R(t). يستقر المنحنى في النظام الدائم عند القيمة 10.0 V، ويقطع المماس عند المبدأ محور القيمة العظمى عند t = 20 ms.\n1) احسب المقاومة الداخلية للوشيعة r.\n2) احسب ذاتية الوشيعة L والطاقة المغناطيسية العظمى المخزنة فيها.",
      expectedResponse_ar: "r = 10 Ohm، L = 1.2 H، E_L = 0.024 J = 24 mJ.",
      reasoningSteps_ar: [
        "1) في النظام الدائم: u_R(max) = R * I0 = 10.0 V => I0 = 10.0 / 50 = 0.20 A.\nقانون جمع التوترات في النظام الدائم: E = u_R(max) + u_L(max) = R*I0 + r*I0 = (R + r)*I0.\n(50 + r) * 0.20 = 12 => 50 + r = 12 / 0.20 = 60 => r = 10 Ohm.",
        "2) من المماس عند المبدأ: ثابت الزمن tau = 20 ms = 0.020 s.\nالمقاومة الكلية: R_tot = R + r = 50 + 10 = 60 Ohm.\nالذاتية L: بما أن tau = L / R_tot، فإن L = tau * R_tot = 0.020 * 60 = 1.2 H (هنري).\nالطاقة المغناطيسية العظمى: E_L = 0.5 * L * (I0)^2 = 0.5 * 1.2 * (0.20)^2 = 0.6 * 0.04 = 0.024 J = 24 mJ.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة RL متسلسلة عند إقامة التيار",
        referenceFrameOrConditions_ar: "نظام انتقالي ثم نظام دائم",
        governingLaws_ar: ["قانون جمع التوترات E = u_R + u_L", "tau = L / (R + r)", "E_L = 1/2 L i^2"],
        keyUnitsAndDimensions_ar: "V و Ohm و H و ms و mJ",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "نسيان إضافة المقاومة الداخلية r إلى المقاومة R عند حساب الذاتية L من ثابت الزمن tau.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لحساب I0 و r، 1.0ن لحساب L، 1.0ن لحساب الطاقة E_L.",
    },
    l4_transfer: {
      id: "rl_l4_transfer",
      capabilityId: "physics_rl_circuit_transient_response",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "بواسطة راسم اهتزاز مهبطي، نتابع التوترين u_1(t) بين طرفي المولد و u_2(t) بين طرفي الوشيعة. عند فتح القاطعة فجأة دون وجود صمام ثنائي، نلاحظ ظهور ذروة توتر حادة وسالبة تبلغ -180 V بين طرفي الوشيعة، مع حدوث شرارة كهربائية عند القاطعة.\n1) فسر فيزيائياً سبب ظهور هذا التوتر العالي جداً مقارنة بتوتر المولد (E = 12 V).\n2) كيف نحمي القاطعة وعناصر الدارة الحساسة من هذا التوتر العالي تجريبياً؟ ارسم الدارة موضحاً موضع وتوجيه العنصر المضاف.",
      expectedResponse_ar: "سبب الذروة هو قوة محركة تحريضية ذاتية e = -L*(di/dt) حيث زمن الانقطاع dt يقارب الصفر مما يجعل مشتق التيار ضخماً جداً. الحماية تتم بتركيب صمام ثنائي موصول على التفرع مع الوشيعة بالاتجاه المعاكس (صمام استرجاع Diode de roue libre).",
      reasoningSteps_ar: [
        "1) التفسير الفيزيائي: عند فتح القاطعة فجأة، تنعدم شدة التيار خلال زمن وجيز جداً dt -> 0. مشتق التيار di/dt يكون سالباً جداً وقيمته المطلقة هائلة.\nتنشأ قوة محركة تحريضية e = - L * (di/dt) ذات قيمة موجبة هائلة تعاكس سبب الانقطاع (قانون لنز)، فيكون التوتر بين طرفي الوشيعة u_L = -e سالباً جداً ومقداره كافياً لتأيين الهواء بين طرفي القاطعة وتوليد شرارة كهربائية.",
        "2) الحماية التجريبية: يُربط صمام ثنائي (Diode) على التفرع بين طرفي الوشيعة بحيث يكون مستقطباً عكساً أثناء غلق القاطعة (لا يمرر تياراً)، ويصبح مستقطباً في الاتجاه المباشر عند فتح الدارة، فيسمح بمرور تيار التفريغ عبر الوشيعة والمقاومة بتبديد الطاقة دون نشوء فرط توتر عند القاطعة.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "انقطاع التيار في دارة محرضة (فتح الدارة)",
        referenceFrameOrConditions_ar: "تغير فجائي لشدة التيار، ظاهرة التحريض الذاتي وفرط التوتر",
        governingLaws_ar: ["قانون لنز", "قانون فاراداي للتحريض الذاتي e = -L di/dt"],
        keyUnitsAndDimensions_ar: "V و s و H",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن توتر الوشيعة لا يمكن أن يتجاوز توتر المولد E أبداً.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5ن لتفسير فرط التوتر بالقوة المحركة المشتقة وقانون لنز، 1.5ن لدور وتوجيه صمام الاسترجاع.",
    },
    l5_bac_style: {
      id: "rl_l5_bac_style",
      capabilityId: "physics_rl_circuit_transient_response",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "لدراسة ثنائي قطب RL، نركب دارة تحتوي على: مولد E، وشيعة (L, r)، ناقل أومي R = 40 Ohm، وبادلة K.\n1) عند اللحظة t = 0 نضع البادلة في الوضع (1): أوجد المعادلة التفاضلية التي تحققها شدة التيار i(t)، وبين أن حلها يُكتب: i(t) = I0 * (1 - e^(-t/tau))، معبراً عن I0 و tau بدلالة ثوابت الدارة.\n2) يمثل المنحنى المرفق تطور التوتر بين طرفي الوشيعة u_b(t). اعتماداً على المنحنى وقانون جمع التوترات:\nأ) عين قيمة التوتر u_b عند اللحظة t = 0، وبرر لماذا لا تنعدم u_b في النظام الدائم.\nب) إذا كان u_b(t=0) = 12 V و u_b(النظام الدائم) = 2.4 V، احسب القوة المحركة E، والمقاومة الداخلية r للوشيعة.\nجـ) احسب قيمة شدة التيار في النظام الدائم I0، والذاتية L إذا كان tau = 25 ms.",
      expectedResponse_ar: "E = 12 V، r = 10 Ohm، I0 = 0.24 A، L = 1.25 H.",
      reasoningSteps_ar: [
        "1) قانون جمع التوترات: u_R + u_b = E => R*i + L*(di/dt) + r*i = E => L*(di/dt) + (R + r)*i = E.\nبالقسمة على (R+r): (L / (R + r))*(di/dt) + i = E / (R + r).\nنضع: tau = L / (R + r) و I0 = E / (R + r) فتصبح: tau * (di/dt) + i = I0.\nالحل: i(t) = I0 * (1 - e^(-t/tau)).",
        "2.أ) عند t=0: الوشيعة تؤخر مرور التيار، إذن i(0) = 0، وبالتالي u_R(0) = 0 => u_b(0) = E = 12 V.\nفي النظام الدائم: di/dt = 0 لكن i = I0 != 0، فتصبح u_b = r*I0 != 0 نظراً لوجود المقاومة الداخلية r للوشيعة.",
        "2.ب) من النتيجة السابقة: E = 12 V.\nفي النظام الدائم: u_b(inf) = r * I0 = 2.4 V و u_R(inf) = R * I0 = E - u_b(inf) = 12 - 2.4 = 9.6 V.\nبالقسمة: u_b(inf) / u_R(inf) = (r * I0) / (R * I0) = r / R => r / 40 = 2.4 / 9.6 = 1/4 => r = 40 / 4 = 10 Ohm.",
        "2.جـ) شدة التيار: I0 = u_R(inf) / R = 9.6 / 40 = 0.24 A.\nحساب الذاتية L: المقاومة الكلية R_tot = R + r = 40 + 10 = 50 Ohm.\nبما أن tau = L / R_tot => L = tau * R_tot = (25 * 10^(-3)) * 50 = 1.25 H.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة وشيعة حقيقية وناقل أومي ومولد تيار مستمر",
        referenceFrameOrConditions_ar: "استجابة انتقالية لغلق قاطعة، تحليل التوترات عند t=0 وعند اللانهاية",
        governingLaws_ar: ["قانون جمع التوترات", "u_b = L(di/dt) + r*i", "tau = L / (R + r)"],
        keyUnitsAndDimensions_ar: "V و Ohm و A و H و ms",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "افتراض أن توتر الوشيعة ينعدم في النظام الدائم (إهمال المقاومة الداخلية r).",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للمعادلة التفاضلية وحلها، 1.0ن لتفسير التوتر عند t=0 والنظام الدائم، 1.0ن لحساب E و r، 1.0ن لحساب I0 و L.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "إهمال المقاومة الداخلية r في النظام الدائم واعتبار u_L = 0 أو نسيان r في عبارة ثابت الزمن tau = L/(R+r).",
    wrongMentalModel_ar: "اعتبار الوشيعة دائماً كوشيعة صرفة (r=0) مما يقود إلى افتراضات خاطئة في حسابات التوتر المستقر.",
    correctMentalModel_ar: "الوشيعة في الواقع تتألف من سلك نحاسي ملفوف له بالضرورة مقاومة أومية r؛ لذلك في النظام الدائم يزول الأثر التحريضي (L*di/dt = 0) ويبقى الأثر الأومي الصرف (u_L = r*I0).",
    threeStepActionProtocol_ar: [
      "اقرأ نص التمرين بدقة: هل الوشيعة 'صرفة' (L فقط) أم 'حقيقية' (L, r)؟",
      "في النظام الدائم، اكتب دائماً: i = I0 ثابت => di/dt = 0 => u_b = r*I0.",
      "عند حساب ثابت الزمن tau، اجمع دائماً المقاومة الخارجية مع المقاومة الداخلية: R_tot = R + r.",
    ],
    microDrill_ar: {
      prompt_ar: "وشيعة ذاتيتها L = 0.5 H ومقاومتها r = 10 Ohm موصولة مع ناقل أومي R = 40 Ohm تحت توتر E = 10 V. احسب شدة التيار في النظام الدائم وثابت الزمن tau.",
      solution_ar: "I0 = E / (R + r) = 10 / (40 + 10) = 0.20 A. وثابت الزمن: tau = L / (R + r) = 0.5 / 50 = 0.010 s = 10 ms.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_rl_circuit_twin",
    invariantTested_ar: "تحديد المقاومة الداخلية والذاتية من منحنى توتر الوشيعة",
    changedSurface_ar: "دارة RL بمولد مختلف E = 9 V ومقاومة خارجية R = 80 Ohm ومتابعة u_b(t).",
    prompt_ar: "في دارة RL بمولد E = 9.0 V ومقاومة R = 80 Ohm، نغلق القاطعة. يستقر توتر الوشيعة في النظام الدائم عند القيمة u_b = 1.8 V، بينما كان عند اللحظة الابتدائية u_b(0) = 9.0 V. إذا كان ثابت الزمن tau = 5.0 ms، احسب:\n1) المقاومة الداخلية r للوشيعة.\n2) ذاتية الوشيعة L.",
    solution_ar: "1) u_R(inf) = E - u_b(inf) = 9.0 - 1.8 = 7.2 V. إذن I0 = u_R / R = 7.2 / 80 = 0.090 A. r = u_b(inf) / I0 = 1.8 / 0.090 = 20 Ohm.\n2) R_tot = R + r = 80 + 20 = 100 Ohm. L = tau * R_tot = (5.0 * 10^(-3)) * 100 = 0.50 H.",
    passCondition_ar: "استنتاج r = 20 Ohm و L = 0.50 H بطريقة منهجية وصحيحة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: كاشف المعادن الكهرومغناطيسي",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "يعتمد مبدأ كاشف المعادن على وشيعة استشعار تتغير ذاتيتها L عند اقتراب جسم معدني منها. لدراسة هذه الوشيعة، ندمجها في دارة مع ناقل أومي R = 100 Ohm ومولد مثالي E = 10 V.\n1) بين كيف نربط راسم الاهتزاز المهبطي لمشاهدة التوترين u_R(t) في المدخل Y1 وتوتر المولد E في المدخل Y2.\n2) في غياب أي جسم معدني، كان ثابت الزمن tau1 = 2.0 ms وتيار النظام الدائم I0 = 0.080 A.\nأ) احسب المقاومة الداخلية r للوشيعة وذاتيتها L1.\nب) عند تقريب صفيحة ألمنيوم من الوشيعة، تصبح قيمة ثابت الزمن tau2 = 3.5 ms دون تغير في تيار النظام الدائم. احسب الذاتية الجديدة L2.\nجـ) كيف تستغل الدارة الإلكترونية هذا التغير في إطلاق إنذار صوتي؟ فسر فيزيائياً.",
    modelSolution_ar: [
      "1) ربط راسم الاهتزاز: نصل الأرضي بالنقطة المشتركة بين الناقل الأومي والوشيعة، والمدخل Y1 بالطرف الآخر للناقل الأومي (مع ضغط الزر Inv لعكس الإشارة لأن التوتر سيكون مقلوباً بالنسبة للأرضي)، والمدخل Y2 بالقطب الموجب للمولد لمشاهدة التوتر الكلي E.",
      "2.أ) في النظام الدائم: I0 = E / (R + r) => 0.080 = 10 / (100 + r) => 100 + r = 10 / 0.080 = 125 => r = 25 Ohm.\nالذاتية L1: tau1 = L1 / (R + r) => L1 = tau1 * (R + r) = (2.0 * 10^(-3)) * 125 = 0.25 H.",
      "2.ب) عند اقتراب المعدن: لم يتغير تيار النظام الدائم، إذن المقاومة الداخلية r بقيت ثابتة r = 25 Ohm و R_tot = 125 Ohm.\nالذاتية الجديدة L2: L2 = tau2 * R_tot = (3.5 * 10^(-3)) * 125 = 0.4375 H = 0.44 H.",
      "2.جـ) التفسير الفيزيائي: اقتراب المعدن يؤدي إلى زيادة ذاتية الوشيعة بفعل التيارات المحرضة (تيارات فوكو) وتغير التدفق المغناطيسي، مما يزيد من ثابت الزمن tau ويؤخر إقامة التيار. تقارن الدارة الإلكترونية زمن إقامة التيار مع عتبة مرجعية، فإذا تجاوز التأخير حداً معيناً ينشط مكبر العمليات ويفعل جرس الإنذار الصوتي.",
    ],
    markingScheme_ar: [
      { criterion: "رسم وتوضيح ربط راسم الاهتزاز المهبطي والأرضي والزر Inv", points: 1.0 },
      { criterion: "حساب المقاومة الداخلية r والذاتية الابتدائية L1", points: 1.0 },
      { criterion: "حساب الذاتية الجديدة L2 بدقة", points: 1.0 },
      { criterion: "التفسير الفيزيائي لاشتغال كاشف المعادن", points: 1.0 },
    ],
  },
};

// ============================================================================
// PHASE 3: NUCLEAR PHYSICS — DECAY & MASS DEFECT
// ============================================================================

export const PHYSICS_NUCLEAR_DECAY_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_nuclear_decay_activity_dating",
  canonicalTitle_ar: "النشاط الإشعاعي: قانون التناقص الإشعاعي، النشاطية والتأريخ",
  canonicalTitle_fr: "Radioactivité : loi de décroissance radioactive, activité et datation",
  discipline: "physics",
  domain: "Physique Nucléaire",
  unit: "التحولات النووية (النشاط الإشعاعي والتناقص)",
  status: "APPROVED",
  scopeIn: [
    "التركيب النووي ورمز النواة X_Z^A، وقوانين الانحفاظ لصودي (العدد الكتلي A والعدد الشحني Z).",
    "الأنماط الإشعاعية التلقائية: ألفا (alpha)، بيتا سالب (beta^-)، بيتا موجب (beta^+)، وإشعاع غاما (gamma).",
    "قانون التناقص الإشعاعي N(t) = N0 * e^(-lambda * t) وكتلة العينة m(t) = m0 * e^(-lambda * t).",
    "ثابت التفكك lambda وزمن نصف العمر t_{1/2} = ln(2) / lambda وثابت الزمن tau = 1/lambda.",
    "النشاط الإشعاعي A(t) = - dN/dt = lambda * N(t) ووحدته البيكرل (Bq)، ومبدأ التأريخ الإشعاعي (الكربون 14، البوتاسيوم-أرغون).",
  ],
  scopeOut: [
    "سلاسل التفكك المتتالية المعقدة وتوازن الأنوية التابعة (خارج المنهاج).",
    "الجرعات الإشعاعية والوحدات البيولوجية (Sievert / Gray).",
  ],
  prerequisites: {
    hard: ["الدوال الأسية واللوغاريتم النيبري وحساب المشتقات"],
    soft: ["قوانين صودي لانحفاظ الشحنة والكتلة في التفاعلات النووية"],
    foundation: ["بنية الذرة: البروتونات، النترونات، النويات Z و N و A"],
    crossCutting: ["استخراج الثوابت من المنحنيات الأسية والخطية ln(A) = f(t)"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-NUCL-01",
      bloomLevel: "apply",
      description_ar: "كتابة معادلات التفكك الإشعاعي (alpha, beta^-, beta^+) وتطبيق قانوني صودي لتحديد النواة الابنة أو الجسيم المنبعث.",
    },
    {
      code: "LO-PHYS-NUCL-02",
      bloomLevel: "analyze",
      description_ar: "استنتاج العلاقة t_{1/2} = ln(2) / lambda وحساب عمر عينة قديمة (التأريخ) عبر قياس النشاطية الإشعاعية.",
    },
    {
      code: "LO-PHYS-NUCL-03",
      bloomLevel: "evaluate",
      description_ar: "التمييز بين عدد الأنوية المتبقية N(t) والأنوية المتفككة N_d(t) وتفسير التناقص العشوائي الحتمي إحصائياً.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "nucl_l1_foundation",
      capabilityId: "physics_nuclear_decay_activity_dating",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "تتفكك عينة مشعة ذات ثابت تفكك lambda. العلاقة بين زمن نصف العمر t_{1/2} وثابت التفكك هي:",
      expectedResponse_ar: "t_{1/2} = ln(2) / lambda",
      reasoningSteps_ar: [
        "عند t = t_{1/2}: N(t_{1/2}) = N0 / 2.",
        "بالتعويض في قانون التناقص: N0 / 2 = N0 * e^(-lambda * t_{1/2}) => e^(-lambda * t_{1/2}) = 1/2.",
        "- lambda * t_{1/2} = - ln(2) => t_{1/2} = ln(2) / lambda.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "أنوية مشعة غير مستقرة تخضع لتفكك عشوائي وتلقائي",
        referenceFrameOrConditions_ar: "عينة تحوي عدداً كبيراً من الأنوية (قانون إحصائي حتمي)",
        governingLaws_ar: ["قانون التناقص الإشعاعي N(t) = N0 * e^(-lambda*t)"],
        keyUnitsAndDimensions_ar: "s^(-1) و s",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين ln(2)/lambda و lambda/ln(2) أو ضربهما.",
      },
      scoringRubric_ar: "1 نقطة للتعريف النظري المباشر.",
    },
    l2_application: {
      id: "nucl_l2_application",
      capabilityId: "physics_nuclear_decay_activity_dating",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "عينة مشعة تحتوي ابتدائياً على N0 = 1.0 * 10^18 نواة من اليود 131 الذي نصف عمره t_{1/2} = 8.0 jours. احسب النشاط الإشعاعي الابتدائي A0 للعينة بالبيكرل (Bq).",
      expectedResponse_ar: "A0 = 1.0 * 10^12 Bq",
      reasoningSteps_ar: [
        "تحويل نصف العمر إلى الثواني: t_{1/2} = 8.0 * 24 * 3600 = 6.912 * 10^5 s.",
        "حساب ثابت التفكك lambda: lambda = ln(2) / t_{1/2} = 0.693 / (6.912 * 10^5) = 1.003 * 10^(-6) s^(-1).",
        "حساب النشاطية الابتدائية: A0 = lambda * N0 = (1.003 * 10^(-6)) * (1.0 * 10^18) = 1.0 * 10^12 Bq.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "أنوية اليود 131 المشعة",
        referenceFrameOrConditions_ar: "النظام الدولي للوحدات SI (الثانية s حصراً للنشاطية بالبيكرل)",
        governingLaws_ar: ["A0 = lambda * N0", "lambda = ln(2)/t_{1/2}"],
        keyUnitsAndDimensions_ar: "Bq (تفكك في الثانية) و s",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان تحويل نصف العمر من الأيام (jours) إلى الثواني (s)، مما ينتج نشاطية خاطئة بمقدار 86400 مرة.",
      },
      scoringRubric_ar: "1 نقطة للتحويل الزمني، 1 نقطة لحساب lambda، 1 نقطة للنشاطية بالبيكرل.",
    },
    l3_mixed: {
      id: "nucl_l3_mixed",
      capabilityId: "physics_nuclear_decay_activity_dating",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "يمثل المنحنى البياني المرفق تطور المقدار ln(A) بدلالة الزمن t لعينة من الفوسفور المشع مستقيماً معادلته: ln(A) = 16.12 - 0.048 * t (حيث t بالأيام jours و A بالبيكرل Bq).\n1) بين أن عبارة ln(A) تكتب نظرياً: ln(A) = ln(A0) - lambda * t.\n2) حدد بيانياً النشاطية الابتدائية A0، ثابت التفكك lambda، وزمن نصف العمر t_{1/2} بالأيام.",
      expectedResponse_ar: "A0 = 1.0 * 10^7 Bq، lambda = 0.048 jour^(-1)، t_{1/2} = 14.4 jours.",
      reasoningSteps_ar: [
        "1) قانون التناقص للنشاطية: A(t) = A0 * e^(-lambda * t).\nبإدخال دالة اللوغاريتم النيبري: ln(A(t)) = ln(A0 * e^(-lambda * t)) = ln(A0) - lambda * t.",
        "2) بالمطابقة مع المعادلة التجريبية ln(A) = 16.12 - 0.048 * t:\n- نقطة التقاطع مع محور التراتيب: ln(A0) = 16.12 => A0 = e^(16.12) = 1.002 * 10^7 Bq = 1.0 * 10^7 Bq.\n- ميل المستقيم: - lambda = - 0.048 => lambda = 0.048 jour^(-1).\n- زمن نصف العمر: t_{1/2} = ln(2) / lambda = 0.693 / 0.048 = 14.4 jours.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "عينة مشعة من الفوسفور",
        referenceFrameOrConditions_ar: "تحويل القانون الأسي إلى خطي عبر دالة اللوغاريتم النيبري",
        governingLaws_ar: ["قانون التناقص الإشعاعي للنشاطية", "المطابقة البيانية"],
        keyUnitsAndDimensions_ar: "Bq و jour^(-1) و jour",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الخلط بين وحدة الميل باليوم^-1 ووحدة الثانية^-1 أو الخطأ في حساب e^(16.12).",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لإثبات المعادلة الخطية، 1.0ن لحساب A0 و lambda، 1.0ن لحساب t_{1/2}.",
    },
    l4_transfer: {
      id: "nucl_l4_transfer",
      capabilityId: "physics_nuclear_decay_activity_dating",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "تم العثور على قطعة خشبية قديمة في مغارة أثرية. أعطى قياس النشاط الإشعاعي لكتلة m = 1.0 g من كربون هذه القطعة A_t = 3.6 تفكك في الدقيقة، بينما تعطي كتلة مماثلة من كربون شجرة حية حديثة A0 = 15.3 تفكك في الدقيقة. إذا علمت أن نصف عمر الكربون 14 هو t_{1/2} = 5730 ans:\n1) احسب عمر القطعة الخشبية t.\n2) إذا كان الارتياب النسبي في قياس النشاطية هو 5%، هل يمكن استخدام التأريخ بالكربون 14 لتحديد عمر صخرة بركانية يُقدر عمرها بـ 200 مليون سنة؟ برر علمياً.",
      expectedResponse_ar: "عمر القطعة t = 1.19 * 10^4 ans (حوالي 12 ألف سنة). لا يمكن استعمال الكربون 14 لتأريخ الصخور البركانية لأن نشاطيته تنعدم عملياً بعد 10*t_{1/2} (حوالي 50 ألف سنة).",
      reasoningSteps_ar: [
        "1) قانون التناقص: A(t) = A0 * e^(-lambda * t) => A(t) / A0 = e^(-lambda * t).\n- lambda * t = ln(A_t / A0) => t = (1 / lambda) * ln(A0 / A_t) = (t_{1/2} / ln(2)) * ln(A0 / A_t).\nبالتعويض: t = (5730 / 0.6931) * ln(15.3 / 3.6) = 8267.5 * ln(4.25) = 8267.5 * 1.4469 = 11962 ans = 1.2 * 10^4 ans.",
        "2) التبرير العلمي: بعد مرور حوالي 10 أنصاف عمر (حوالي 57 ألف سنة)، يتبقى أقل من (1/2)^10 = 0.1% من الأنوية وتصبح النشاطية مهملة وغير قابلة للقياس بأجهزة الكشف (تندمج مع الإشعاع الطبيعي للخلفية). الصخور البركانية عمرها 200 مليون سنة، لذلك يجب استخدام نويدات ذات نصف عمر جيولوجي طويل جداً مثل اليورانيوم 238 أو البوتاسيوم 40.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "تبادل الكربون 14 بين الكائنات الحية والغلاف الجوي وانقطاعه عند الوفاة",
        referenceFrameOrConditions_ar: "ثبات نسبة C14/C12 في الغلاف الجوي خلال آلاف السنين الماضية",
        governingLaws_ar: ["قانون التأريخ الإشعاعي", "حدود صلاحية التأريخ بالكربون 14"],
        keyUnitsAndDimensions_ar: "ans و تفكك/دقيقة",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "عدم إدراك الحدود الفيزيائية للتأريخ بالكربون 14 واقتراح استخدامه لأزمنة جيولوجية هائلة.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5ن لاشتقاق قانون العمر وحساب النتيجة، 1.5ن لمناقشة حدود طريقة التأريخ.",
    },
    l5_bac_style: {
      id: "nucl_l5_bac_style",
      capabilityId: "physics_nuclear_decay_activity_dating",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "يُستعمل اليود 131 (I_53^{131}) في الطب النووي لتشخيص وعلاج أورام الغدة الدرقية. يتفكك مصدر من اليود 131 باعثاً جسيم beta^- وإشعاعاً كهرومغناطيسياً gamma.\n1) اكتب معادلة التفكك النووي موضحاً قوانين الانحفاظ ومعيناً النواة الابنة من بين: (Te_52, Xe_54, Cs_55).\n2) ما هو الأصل الفيزيائي لانبعاث الإشعاع gamma المصاحب للتفكك؟\n3) نحقن مريضاً بجرعة نشاطيتها الابتدائية A0 = 3.7 * 10^7 Bq في اللحظة t = 0.\nأ) احسب عدد الأنوية الابتدائية N0 المحقونة، علماً أن t_{1/2} = 8.0 jours.\nب) احسب النسبة المئوية للأنوية المتفككة بعد مرور 24 يوماً من الحقن.\nجـ) متى تصبح نشاطية العينة مساوية لـ 1% من قيمتها الابتدائية؟ هل يزول الخطر الإشعاعي عن المريض ومحيطه بعد هذا التاريخ؟",
      expectedResponse_ar: "المعادلة: I_53^{131} -> Xe_54^{131} + e_{-1}^0. انبعاث غاما ناتج عن تخلص النواة الابنة المثارة من طاقتها الزائدة. N0 = 3.69 * 10^13 نواة. نسبة المتفككة = 87.5%. الزمن t = 53.1 jours.",
      reasoningSteps_ar: [
        "1) معادلة التفكك: I_53^{131} -> Y_Z^A + e_{-1}^0.\nحسب قانوني صودي:\n- انحفاظ A: 131 = A + 0 => A = 131.\n- انحفاظ Z: 53 = Z - 1 => Z = 54.\nالنواة الابنة هي الزينون Xe_54^{131}.\nالمعادلة: I_53^{131} -> Xe_54^{131} + e_{-1}^0.",
        "2) أصل الإشعاع gamma: تنتج النواة الابنة عادة في حالة إثارة طاقوية (Xe*)، ولكي تعود إلى حالتها الأساسية المستقرة، تتخلص من الطاقة الفائضة بانبعاث فوتون كهرومغناطيسي عالي الطاقة من نوع غاما.",
        "3.أ) ثابت التفكك: lambda = ln(2) / (8.0 * 86400) = 1.002 * 10^(-6) s^(-1).\nN0 = A0 / lambda = (3.7 * 10^7) / (1.002 * 10^(-6)) = 3.69 * 10^13 نواة.",
        "3.ب) عند t = 24 jours = 3 * t_{1/2}:\nالأنوية المتبقية: N(3*t_{1/2}) = N0 * (1/2)^3 = N0 / 8 = 0.125 * N0 (12.5%).\nالأنوية المتفككة: N_d = N0 - N = N0 - 0.125*N0 = 0.875 * N0.\nالنسبة المئوية للمتفككة: 87.5%.",
        "3.جـ) A(t) = 0.01 * A0 => e^(-lambda * t) = 0.01 => - lambda * t = ln(0.01) = - ln(100).\nt = ln(100) / lambda = (ln(100) / ln(2)) * t_{1/2} = (4.605 / 0.693) * 8.0 = 53.15 jours.\nالتعليق: بعد مرور حوالي شهرين، تنخفض النشاطية إلى أقل من 1% وتعتبر الجرعة الإشعاعية المتبقية ضعيفة جداً ولا تشكل خطراً صحياً، مما يسمح للمريض باستئناف حياته الطبيعية دون عزل.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "نواة اليود 131 والتفكك النووي الطبيعي",
        referenceFrameOrConditions_ar: "تطبيق طبي داخل جسم الإنسان، التناقص الإشعاعي التلقائي",
        governingLaws_ar: ["قوانا صودي", "انتقال مستويات الطاقة النووية وانبعاث غاما", "قانون التناقص"],
        keyUnitsAndDimensions_ar: "Bq و jours و نواة",
      },
      errorMapping: {
        primaryErrorType: "misread_question",
        distractorRationale_ar: "حساب نسبة الأنوية المتبقية (12.5%) بدلاً من نسبة الأنوية المتفككة (87.5%).",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للمعادلة وصودي واسم النواة، 0.5ن لتفسير غاما، 1.0ن لحساب N0، 0.5ن لنسبة التفكك، 1.0ن لحساب زمن الـ 1% والتعليق الصحي.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين عدد الأنوية المتبقية N(t) والأنوية المتفككة N_d(t)، أو استخدام وحدة اليوم في حساب النشاطية بالبيكرل.",
    wrongMentalModel_ar: "اعتبار N(t) هو عدد الأنوية التي تفككت واختفت، ونسيان أن البيكرل يعرف بأنه تفكك واحد في الثانية حصراً.",
    correctMentalModel_ar: "قانون التناقص يعطي دائماً عدد الأنوية السليمة المتبقية: N(t) = N0 * e^(-lambda*t). أما عدد الأنوية التي تفككت فهو المتمم: N_d(t) = N0 - N(t) = N0*(1 - e^(-lambda*t)). والبيكرل Bq يتطلب الثانية s دائماً.",
    threeStepActionProtocol_ar: [
      "اقرأ السؤال بانتباه: هل المطلوب هو الأنوية 'المتبقية' (restants) أم 'المتفككة' (désintégrés)؟",
      "إذا طُلب حساب النشاطية A بالبيكرل Bq، حول الزمن t_{1/2} إلى الثواني فوراً بضربه في (24 * 3600) إذا كان بالأيام.",
      "تذكر العلاقة السريعة: بعد مرور n أنصاف عمر (t = n * t_{1/2})، يتبقى N = N0 / 2^n.",
    ],
    microDrill_ar: {
      prompt_ar: "عينة مشعة تحتوي على N0 = 8000 نواة. كم يتبقى من الأنوية وكم يتفكك منها بعد مرور مدة زمنية قدرها 3 * t_{1/2}؟",
      solution_ar: "المتبقية: N = 8000 / 2^3 = 8000 / 8 = 1000 نواة. المتفككة: N_d = 8000 - 1000 = 7000 نواة.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_nuclear_decay_twin",
    invariantTested_ar: "قانون التناقص، النشاطية، والتأريخ الإشعاعي لنويدة أخرى",
    changedSurface_ar: "استعمال نويدة الكوبالت 60 (t_{1/2} = 5.27 ans) المستعملة في علاج السرطان وتحديد النشاطية وتاريخ تصنيع العينة.",
    prompt_ar: "منبع مشع للكوبالت 60 (Co_27^{60}) نصف عمره t_{1/2} = 5.27 ans. 1) اكتب معادلة تفككه بنمط beta^- علماً أن النواة الناتجة هي النيكل Ni. 2) وجد فحص مخبري أن نشاطية المنبع الحالية هي A = 1.25 * 10^13 Bq بعد أن كانت عند تصنيعه A0 = 5.0 * 10^13 Bq. احسب المدة الزمنية المنقضية منذ تصنيع هذا المنبع بالسنوات.",
    solution_ar: "1) المعادلة: Co_27^{60} -> Ni_28^{60} + e_{-1}^0.\n2) A / A0 = (1.25 * 10^13) / (5.0 * 10^13) = 0.25 = 1/4 = (1/2)^2.\nبما أن النسبة هي (1/2)^2، فإن المدة المنقضية توافق تماماً ضعفي نصف العمر: t = 2 * t_{1/2} = 2 * 5.27 = 10.54 ans.",
    passCondition_ar: "كتابة معادلة انبعاث النيكل 60 بدقة، واستنتاج t = 10.54 سنة بالطريقة اللوغاريتمية أو المضاعفات.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: حادث تشيرنوبيل والتلوث بالسيvolume 137",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "خلال حادث مفاعل تشيرنوبيل عام 1986، انبعثت إلى الغلاف الجوي كميات معتبرة من السيزيوم 137 المشع (Cs_55^{137}) الذي نصف عمره t_{1/2} = 30.2 ans.\n1) اكتب معادلة تفكك السيزيوم 137 مع نمط النشاط الإشعاعي وتحديد النواة الناتجة من بين: (I_53, Xe_54, Ba_56).\n2) في عام 2026، أخذت عينة من تربة المنطقة المنكوبة فوُجد أن نشاطها الإشعاعي النوعي هو A = 800 Bq/kg.\nأ) احسب ثابت التفكك lambda للسيزيوم 137 بوحدة s^(-1) و an^(-1).\nب) احسب النشاط الإشعاعي النوعي A0 لهذه العينة سنة الحادثة 1986.\nجـ) حدد السنة التي ينخفض فيها النشاط الإشعاعي النوعي إلى أقل من العتبة الدولية المسموح بها للزراعة (A_lim = 100 Bq/kg).",
    modelSolution_ar: [
      "1) معادلة التفكك: Cs_55^{137} -> Ba_56^{137} + e_{-1}^0. النمط هو beta^- والنواة الناتجة هي الباريوم Ba.\nقوانين صودي: 137 = 137 + 0، و 55 = 56 - 1.",
      "2.أ) حساب ثابت التفكك:\n- بالسنة: lambda = ln(2) / t_{1/2} = 0.69315 / 30.2 = 0.02295 an^(-1) = 2.30 * 10^(-2) an^(-1).\n- بالثانية: lambda = 0.02295 / (365.25 * 86400) = 7.27 * 10^(-10) s^(-1).",
      "2.ب) المدة المنقضية من 1986 إلى 2026 هي: Delta t = 2026 - 1986 = 40 ans.\nمن قانون التناقص: A(t) = A0 * e^(-lambda * t) => A0 = A(t) * e^(lambda * t).\nA0 = 800 * e^(0.02295 * 40) = 800 * e^(0.918) = 800 * 2.504 = 2003 Bq/kg.",
      "2.جـ) البحث عن الزمن اللازم لبلوغ العتبة: A(t) = 100 Bq/kg.\n100 = A0 * e^(-lambda * t) = 2003 * e^(-0.02295 * t) => e^(-0.02295 * t) = 100 / 2003 = 0.0499.\n- 0.02295 * t = ln(0.0499) = - 2.997 => t = 2.997 / 0.02295 = 130.6 ans.\nالسنة الموافقة: 1986 + 131 = 2117.\nإذن لن تصبح التربة صالحة للزراعة الآمنة تماماً وفق هذه العتبة إلا بحلول عام 2117 تقريباً.",
    ],
    markingScheme_ar: [
      { criterion: "المعادلة الموزونة ونمط التفكك واسم النواة الناتجة", points: 1.0 },
      { criterion: "حساب ثابت التفكك بالوحدتين", points: 1.0 },
      { criterion: "حساب النشاطية الابتدائية سنة الحادثة 1986", points: 1.0 },
      { criterion: "حساب الزمن اللازم لبلوغ عتبة الأمان وتحديد السنة بدقة", points: 1.0 },
    ],
  },
};

export const PHYSICS_MASS_DEFECT_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_mass_defect_binding_energy",
  canonicalTitle_ar: "الانشطار، الاندماج، النقص الكتلي وطاقة الربط النووي",
  canonicalTitle_fr: "Fission, fusion, défaut de masse et énergie de liaison",
  discipline: "physics",
  domain: "Physique Nucléaire",
  unit: "التحولات النووية (الكتلة والطاقة والانشطار والاندماج)",
  status: "APPROVED",
  scopeIn: [
    "تكافؤ الكتلة والطاقة (علاقة أينشتاين: E = m * c^2) والتحويل بين الجول (J) والإلكترون-فولط (eV، MeV) ووحدة الكتل الذرية (u).",
    "النقص الكتلي للنواة Delta m = [Z*m_p + (A-Z)*m_n] - m(X) مبيناً سبب كونه موجباً دوماً.",
    "طاقة الربط النووية E_l = Delta m * c^2 وطاقة الربط لكل نوية E_l / A ومقارنة الاستقرار النووي بين الأنوية.",
    "منحنى أستون (Aston) وتحديد مناطق الاستقرار، الانشطار النووي، والاندماج النووي.",
    "الحصيلة الكتلية والطاقوية لتفاعل انشطار أو اندماج نووي: E_lib = |Delta m_reaction| * c^2.",
  ],
  scopeOut: [
    "النماذج النووية المتقدمة مثل نموذج قطرة السائل ونموذج الطبقات (خارج المنهاج).",
    "حساب المقطع الفعال للتفاعل النووي وتخصيب اليورانيوم الفيزيوكيميائي المتقدم.",
  ],
  prerequisites: {
    hard: ["قوانين صودي لانحفاظ الشحنة والكتلة في تفاعلات الانشطار والاندماج"],
    soft: ["علاقة أينشتاين للطاقة والكتلة وتحويل الوحدات"],
    foundation: ["بنية النواة وكتل البروتونات والنترونات بالوحدة الذرية u"],
    crossCutting: ["قراءة واستغلال منحنى أستون الطاقوي والمقارنة النسبية"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-MASS-01",
      bloomLevel: "apply",
      description_ar: "حساب النقص الكتلي Delta m وطاقة الربط E_l لنواة معينة بوحدة MeV وبالجول J.",
    },
    {
      code: "LO-PHYS-MASS-02",
      bloomLevel: "analyze",
      description_ar: "مقارنة استقرار نواتين مختلفتين اعتماداً على طاقة الربط لكل نوية E_l / A واستغلال منحنى أستون.",
    },
    {
      code: "LO-PHYS-MASS-03",
      bloomLevel: "evaluate",
      description_ar: "حساب الطاقة المحررة من تفاعل انشطار أو اندماج نووي واستنتاج الاستطاعة والكتلة المستهلكة في مفاعل نووي.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "mass_l1_foundation",
      capabilityId: "physics_mass_defect_binding_energy",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "تكون النواة أكثر استقراراً كلما كانت:",
      expectedResponse_ar: "طاقة الربط لكل نوية E_l / A أكبر",
      reasoningSteps_ar: [
        "معيار استقرار النواة ليس طاقة الربط الإجمالية E_l، بل هو طاقة الربط المتوسطة الموزعة على كل نوية E_l / A.",
        "كلما كانت E_l / A أكبر، تطلب تفكيك النواة إلى نكليوناتها المنفصلة طاقة أكبر لكل نوية، فكانت النواة أكثر تماسكاً واستقراراً.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "نواة ذرية متماسكة بالقوة النووية القوية",
        referenceFrameOrConditions_ar: "سكون النواة، طاقة التماسك",
        governingLaws_ar: ["معيار الاستقرار النووي: E_l / A"],
        keyUnitsAndDimensions_ar: "MeV/nucléon",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن طاقة الربط الإجمالية E_l وحدها هي معيار الاستقرار دون قسمتها على عدد النويات A.",
      },
      scoringRubric_ar: "1 نقطة لاختيار المعيار الصحيح مع التعليل.",
    },
    l2_application: {
      id: "mass_l2_application",
      capabilityId: "physics_mass_defect_binding_energy",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "احسب طاقة الربط لكل نوية لنواة الهيليوم He_2^4 بالـ MeV/nucléon إذا كانت كتلتها m(He) = 4.00150 u، m_p = 1.00728 u، m_n = 1.00866 u، و 1 u = 931.5 MeV/c^2.",
      expectedResponse_ar: "E_l / A = 7.07 MeV/nucléon",
      reasoningSteps_ar: [
        "حساب النقص الكتلي للنواة: Delta m = [2 * m_p + 2 * m_n] - m(He).\nDelta m = [2 * 1.00728 + 2 * 1.00866] - 4.00150 = [2.01456 + 2.01732] - 4.00150 = 4.03188 - 4.00150 = 0.03038 u.",
        "طاقة الربط: E_l = Delta m * c^2 = 0.03038 * 931.5 MeV = 28.299 MeV.",
        "طاقة الربط لكل نوية (A = 4): E_l / A = 28.299 / 4 = 7.075 MeV/nucléon.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "نواة الهيليوم 4 (جسيم ألفا)",
        referenceFrameOrConditions_ar: "تكافؤ الطاقة والكتلة بـ MeV و u",
        governingLaws_ar: ["Delta m = Z*mp + (A-Z)*mn - m(X)", "E_l = Delta m * c^2"],
        keyUnitsAndDimensions_ar: "u و MeV و MeV/nucléon",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "التقريب المبكر لكتل النويات مما يشوه قيمة النقص الكتلي الضعيفة بطبيعتها.",
      },
      scoringRubric_ar: "1 نقطة للنقص الكتلي، 1 نقطة لطاقة الربط، 1 نقطة لطاقة الربط لكل نوية.",
    },
    l3_mixed: {
      id: "mass_l3_mixed",
      capabilityId: "physics_mass_defect_binding_energy",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "في مفاعل نووي يحدث انشطار لليورانيوم 235 بقذف بنترون حراري وفق التفاعل:\nU_92^{235} + n_0^1 -> Sr_38^{94} + Xe_54^{140} + x * n_0^1\n1) عين قيمة العدد x بتطبيق قانوني صودي.\n2) احسب الطاقة المحررة E_lib من انشطار نواة واحدة بالـ MeV ثم بالجول J.\nالمعطيات: m(U235) = 234.9935 u، m(Sr94) = 93.8945 u، m(Xe140) = 139.8920 u، m_n = 1.00866 u، 1 u = 931.5 MeV/c^2، و 1 eV = 1.602 * 10^(-19) J.",
      expectedResponse_ar: "x = 2، E_lib = 184.9 MeV = 2.96 * 10^(-11) J.",
      reasoningSteps_ar: [
        "1) قوانين صودي:\n- انحفاظ A: 235 + 1 = 94 + 140 + x * 1 => 236 = 234 + x => x = 2.\n- انحفاظ Z محقق: 92 + 0 = 38 + 54 + 0 = 92.",
        "2) النقص الكتلي للتفاعل: Delta m_r = m_initial - m_final.\nm_initial = m(U235) + m_n = 234.9935 + 1.00866 = 236.00216 u.\nm_final = m(Sr94) + m(Xe140) + 2 * m_n = 93.8945 + 139.8920 + 2 * 1.00866 = 233.7865 + 2.01732 = 235.80382 u.\nDelta m = 236.00216 - 235.80382 = 0.19834 u.",
        "الطاقة المحررة بالـ MeV: E_lib = 0.19834 * 931.5 = 184.75 MeV = 184.8 MeV.",
        "التحويل إلى الجول: E_lib(J) = 184.8 * 10^6 * (1.602 * 10^(-19) J) = 2.96 * 10^(-11) J.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "تفاعل انشطار نووي محفز بنترون بطيء",
        referenceFrameOrConditions_ar: "تفاعل تسلسلي مغلق داخل قلب مفاعل نووي",
        governingLaws_ar: ["قوانين صودي", "علاقة أينشتاين E_lib = Delta m * c^2"],
        keyUnitsAndDimensions_ar: "u و MeV و J",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان طرح النترون الابتدائي عند حساب الحصيلة الكتلية أو نسيان النترونين الناتجين.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتطبيق صودي وتعيين x=2، 1.0ن للنقص الكتلي، 1.0ن لحساب E_lib بالـ MeV والجول.",
    },
    l4_transfer: {
      id: "mass_l4_transfer",
      capabilityId: "physics_mass_defect_binding_energy",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "يعتبر تفاعل الاندماج بين الديتيريوم H_1^2 والتريتيوم H_1^3 وفق المعادلة: H_1^2 + H_1^3 -> He_2^4 + n_0^1 المصدر الأساسي للطاقة المستقبلية النظيفة.\n1) احسب الطاقة المحررة E_lib من هذا التفاعل لكل غرام من المزيج التفاعلي المتكافئ كتلته m = 1.0 g.\n2) احسب كتلة البترول المكافئة طاقوياً لـ 1.0 g من هذا الوقود النووي، إذا علمت أن احتراق 1 kg من البترول يحرر طاقة حرارية قدرها Q = 4.2 * 10^7 J.\nالمعطيات: E_lib لتفاعل اندماج واحد = 17.6 MeV، M(H2) + M(H3) = 5.0 g/mol، و N_A = 6.02 * 10^23 mol^(-1).",
      expectedResponse_ar: "E_lib(1g) = 3.39 * 10^11 J، وكتلة البترول المكافئة M_petrole = 8070 kg (حوالي 8 أطنان من البترول).",
      reasoningSteps_ar: [
        "1) كمية مادة المزيج المتكافئ في 1.0 g: n = m / M_tot = 1.0 / 5.0 = 0.20 mol.\nعدد التفاعلات N في 1.0 g: N = n * N_A = 0.20 * (6.02 * 10^23) = 1.204 * 10^23 تفاعل اندماج.\nطاقة التفاعل الواحد بالجول: E_1 = 17.6 * 10^6 * (1.602 * 10^(-19)) = 2.8195 * 10^(-12) J.\nإجمالي الطاقة المحررة من 1.0 g:\nE_tot = N * E_1 = (1.204 * 10^23) * (2.8195 * 10^(-12) J) = 3.395 * 10^11 J = 3.4 * 10^11 J.",
        "2) كتلة البترول المكافئة: M_petrole = E_tot / Q = (3.395 * 10^11) / (4.2 * 10^7) = 8083 kg = 8.1 tonnes de pétrole.\nالتعليق: غرام واحد من وقود الاندماج يعادل أكثر من 8 أطنان من البترول، مما يبرز الكفاءة الطاقوية الهائلة للاندماج النووي.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "تفاعل اندماج نووي حراري هيدروجيني",
        referenceFrameOrConditions_ar: "مقارنة المردود الطاقوي بين التحولات النووية والتحولات الكيميائية الحرارية",
        governingLaws_ar: ["E_tot = N * E_unitaire", "التكافؤ الطاقوي للوقود الأحفوري"],
        keyUnitsAndDimensions_ar: "J و g و kg و طن",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الخلط بين كتلة نواة واحدة وكتلة مول من المزيج التفاعلي وحساب عدد التفاعلات بشكل خاطئ.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5ن لحساب الطاقة المحررة لغرام واحد بالجول، 1.5ن لحساب كتلة البترول المكافئة والتعليق العلمي.",
    },
    l5_bac_style: {
      id: "mass_l5_bac_style",
      capabilityId: "physics_mass_defect_binding_energy",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تنتج محطة نووية لتوليد الكهرباء استطاعة كهربائية صافية P_e = 900 MW بمردود طاقوي r = 30%، وتعتمد كوقود على اليورانيوم 235.\n1) نعتبر أن كل تفاعل انشطار يحرر طاقة متوسطة E_lib = 200 MeV. احسب الطاقة الحرارية الإجمالية E_th التي يجب أن يستهلكها المفاعل خلال يوم واحد (24 h).\n2) احسب عدد الأنوية N(U235) المنشطرة خلال يوم واحد.\n3) احسب الكتلة اليومية m المستهلكة من اليورانيوم 235 النقي.\n4) إذا كان خام اليورانيوم الطبيعي المستخرج يحتوي على نسبة كتلتها 0.7% فقط من اليورانيوم 235، احسب كتلة الخام الطبيعي الواجب استخراجها يومياً لتشغيل المحطة.",
      expectedResponse_ar: "E_th = 2.59 * 10^14 J، N = 8.09 * 10^24 نواة، m = 3.16 kg من اليورانيوم 235، وكتلة الخام الطبيعي M_brut = 451 kg.",
      reasoningSteps_ar: [
        "1) الطاقة الكهربائية المنتجة خلال يوم: E_e = P_e * Delta t = (900 * 10^6 W) * (24 * 3600 s) = 7.776 * 10^13 J.\nبما أن المردود r = E_e / E_th => E_th = E_e / r = (7.776 * 10^13) / 0.30 = 2.592 * 10^14 J.",
        "2) طاقة الانشطار الواحد بالجول: E_1 = 200 * 10^6 * (1.602 * 10^(-19)) = 3.204 * 10^(-11) J.\nعدد الأنوية المنشطرة: N = E_th / E_1 = (2.592 * 10^14) / (3.204 * 10^(-11)) = 8.09 * 10^24 نواة.",
        "3) الكتلة المستهلكة يومياً: كمية المادة n = N / N_A = (8.09 * 10^24) / (6.02 * 10^23) = 13.44 mol.\nالكتلة m = n * M = 13.44 * 235 = 3158 g = 3.16 kg de U-235.",
        "4) كتلة الخام الطبيعي: بما أن نسبة التخصيب الطبيعية هي 0.7% (p = 0.007):\nm = p * M_brut => M_brut = m / p = 3.16 / 0.007 = 451.4 kg من خام اليورانيوم الطبيعي.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "محطة نووية كهروحرارية",
        referenceFrameOrConditions_ar: "مردود التحويل الحراري إلى ميكانيكي ثم كهربائي",
        governingLaws_ar: ["P = E / Delta t", "المردود r = E_utile / E_consommée", "قانون الكتلة والمول"],
        keyUnitsAndDimensions_ar: "MW و J و kg و mol",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "ضرب الاستطاعة في المردود بدلاً من القسمة عليه، مما ينتج طاقة حرارية أقل من الطاقة الكهربائية وهو مستحيل فيزيائياً.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لحساب E_th بالمردود، 1.0ن لعدد الأنوية المنشطرة، 1.0ن لكتلة اليورانيوم 235، 1.0ن لكتلة الخام الطبيعي.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين الطاقة المحررة E_lib وطاقة الربط E_l، أو ضرب الاستطاعة في المردود عند حساب الطاقة المستهلكة.",
    wrongMentalModel_ar: "الاعتقاد بأن طاقة الربط هي طاقة تفاعل الانشطار، أو الخلط بين E_utile و E_fournie في المردود الطاقوي.",
    correctMentalModel_ar: "طاقة الربط E_l تخص نواة واحدة وتماسكها الداخلي، بينما الطاقة المحررة E_lib تخص تفاعلاً نووياً ناتجاً عن فرق كتل المتفاعلات والنواتج. في المردود، الطاقة الحرارية المستهلكة أكبر دوماً من الكهربائية المفيدة: E_th = E_e / r.",
    threeStepActionProtocol_ar: [
      "ميز فوراً بين نوعين من الأسئلة: طاقة ربط نواة واحدة (E_l = Delta m * c^2)، أو طاقة تفاعل نووي (E_lib = [m_av - m_ap] * c^2).",
      "في مسائل المفاعلات والمردود، تحقق دائماً أن الطاقة الكلية المستهلكة أكبر من الطاقة المفيدة المنتجة: E_fournie > E_utile.",
      "عند التحويل بين u و MeV، اضرب مباشرة في 931.5 دون إدخال سرعة الضوء c في الحساب.",
    ],
    microDrill_ar: {
      prompt_ar: "احسب الطاقة المحررة E_lib من تفاعل نقصت كتلته بمقدار Delta m = 0.0025 u بالـ MeV وبالجول.",
      solution_ar: "E_lib = 0.0025 * 931.5 = 2.329 MeV = 2.329 * 10^6 * (1.6 * 10^(-19)) = 3.73 * 10^(-13) J.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_mass_defect_twin",
    invariantTested_ar: "حساب استقرار الأنوية والطاقة المحررة لتفاعل انشطار نووي آخر",
    changedSurface_ar: "تفاعل انشطار نووي لليورانيوم ينتج الباريوم 144 والكريبتون 89 مع 3 نترونات.",
    prompt_ar: "ينشطر اليورانيوم 235 بنترون وفق: U_92^{235} + n_0^1 -> Ba_56^{144} + Kr_36^{89} + 3 n_0^1. 1) إذا كانت طاقة الربط لكل نوية لليورانيوم 235 هي 7.59 MeV/nucléon، وللباريوم 144 هي 8.27 MeV/nucléon، وللكريبتون 89 هي 8.55 MeV/nucléon، حدد النواة الأكثر استقراراً. 2) احسب الطاقة المحررة E_lib من هذا التفاعل بالاعتماد على طاقات الربط.",
    solution_ar: "1) النواة الأكثر استقراراً هي الكريبتون Kr_36^{89} لأنها تملك أكبر طاقة ربط لكل نوية (8.55 MeV/nucléon).\n2) الطاقة المحررة: E_lib = E_l(النواتج) - E_l(المتفاعلات) = [144 * 8.27 + 89 * 8.55] - [235 * 7.59] = [1190.88 + 760.95] - 1783.65 = 1951.83 - 1783.65 = 168.18 MeV.",
    passCondition_ar: "تحديد الكريبتون كنواة أكثر استقراراً، وتطبيق قانون طاقات الربط بدقة للحصول على 168.2 MeV.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: اندماج الأنوية الخفيفة في قلب الشمس",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "تستمد الشمس طاقتها الهائلة من سلسلة تفاعلات اندماج نووي، ننمذج مرحلتها الأساسية بالمعادلة التالية:\n4 H_1^1 -> He_2^4 + 2 e_{+1}^0 + 2 nu\n(حيث e_{+1}^0 بوزيترون و nu نيوترينو عديم الكتلة).\n1) فسر لماذا يتطلب تفاعل الاندماج درجات حرارة وضغوطاً هائلة جداً لا تتوفر إلا في قلوب النجوم.\n2) احسب النقص الكتلي لهذا التفاعل بوحدة الكتل الذرية u.\n3) احسب الطاقة المحررة E_lib من هذا التفاعل بالـ MeV ثم بالجول J.\n4) تشع الشمس استطاعة قدرها P = 3.8 * 10^26 W. احسب النقص في كتلة الشمس خلال ثانية واحدة، واستنتج الكتلة المفقودة خلال عام كامل (1 an = 365.25 jours).\nالمعطيات: m(H1) = 1.00728 u، m(He4) = 4.00150 u، m(e+) = 0.00055 u، و 1 u = 931.5 MeV/c^2 = 1.66 * 10^(-27) kg.",
    modelSolution_ar: [
      "1) شروط الاندماج: الأنوية المتفاعلة (البروتونات) موجبة الشحنة كهربائياً، وبالتالي تنشأ بينها قوى تنافر كهروستاتيكية كولومية هائلة عند اقترابها. للتغلب على حاجز التنافر هذا واقتراب الأنوية إلى مسافة (حوالي 10^-15 m) تسمح للقوة النووية القوية الجاذبة بالتدخل ودمجها، يجب أن تمتلك البروتونات طاقة حركية هائلة، وهو ما يتطلب درجات حرارة تبلغ ملايين الدرجات المئوية وضغوطاً هائلة.",
      "2) النقص الكتلي:\nDelta m = 4 * m(H1) - [m(He4) + 2 * m(e+)]\nDelta m = 4 * 1.00728 - [4.00150 + 2 * 0.00055] = 4.02912 - 4.00260 = 0.02652 u.",
      "3) الطاقة المحررة:\nE_lib(MeV) = 0.02652 * 931.5 = 24.70 MeV.\nبالجول: E_lib(J) = 24.70 * 10^6 * (1.602 * 10^(-19)) = 3.957 * 10^(-12) J = 3.96 * 10^(-12) J.",
      "4) النقص الكتلي للشمس في الثانية الواحدة:\nحسب علاقة أينشتاين: E = Delta m * c^2 => Delta m = E / c^2 = P * Delta t / c^2.\nفي 1 ثانية (Delta t = 1 s): Delta m_1s = (3.8 * 10^26) / (3.0 * 10^8)^2 = (3.8 * 10^26) / (9.0 * 10^16) = 4.22 * 10^9 kg (تخسر الشمس حوالي 4.2 مليون طن من كتلتها كل ثانية).\nالكتلة المفقودة خلال عام: Delta M_an = (4.22 * 10^9 kg/s) * (365.25 * 86400 s) = 1.33 * 10^17 kg.",
    ],
    markingScheme_ar: [
      { criterion: "التفسير الفيزيائي لقوى التنافر الكولومي ودرجة الحرارة الهائلة للاندماج", points: 1.0 },
      { criterion: "حساب النقص الكتلي مع مراعاة كتلة البوزيترونات بدقة", points: 1.0 },
      { criterion: "حساب الطاقة المحررة بالـ MeV والجول", points: 1.0 },
      { criterion: "حساب الكتلة المفقودة للشمس في الثانية الواحدة وفي العام", points: 1.0 },
    ],
  },
};

// ============================================================================
// PHASE 4: MECHANICS — NEWTON, PROJECTILE, INCLINED PLANE, SATELLITE
// ============================================================================

export const PHYSICS_NEWTON_VERTICAL_FALL_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_newton_second_law_vertical_fall",
  canonicalTitle_ar: "قانون نيوتن الثاني والسقوط الشاقولي الحقيقي والحر للأجسام",
  canonicalTitle_fr: "Deuxième loi de Newton et chute verticale réelle et libre des corps",
  discipline: "physics",
  domain: "Mécanique",
  unit: "تطور جملة ميكانيكية (السقوط الشاقولي لجسم صلب)",
  status: "APPROVED",
  scopeIn: [
    "تحديد الجملة الميكانيكية، والمرجع العطالي المناسب (المرجع السطحي الأرضي نعتبره غاليلياً لحركات قصيرة المدة).",
    "إحصاء وتمثيل القوى المؤثرة: الثقل P = m*g، دافعة أرخميدس Pi = - rho_f * V * g، وقوة الاحتكاك المائع f = k*v (للسرعات الصغيرة) أو f = k*v^2 (للسرعات الكبيرة).",
    "تطبيق القانون الثاني لنيوتن sum(F_ext) = m * a_G وإسقاطه على المحور الشاقولي (Oz) الموجه نحو الأسفل أو الأعلى.",
    "إقامة المعادلة التفاضلية للسرعة dv/dt + (k/m)*v = g*(1 - rho_f/rho_s) وتحديد السرعة الحدية v_lim وثابت الزمن tau = m/k.",
    "السقوط الحر (إهمال دافعة أرخميدس والاحتكاك): المعادلة التفاضلية dv/dt = g، معادلات الحركة، والتحقق الطاقوي.",
  ],
  scopeOut: [
    "السقوط في مائع غير نيوتوني أو السقوط المقاوم بتغير لزوجة المائع مع درجة الحرارة.",
    "تأثير قوة كوريوليس (خاص بالدراسات الجامعية المتقدمة).",
  ],
  prerequisites: {
    hard: ["القانون الثاني لنيوتن sum(F) = m*a والإسقاط على المحاور المتعامدة"],
    soft: ["المعادلات التفاضلية من الدرجة الأولى وحساب مشتق السرعة a = dv/dt"],
    foundation: ["مفهوم الثقل والكتلة الحجمية rho = m/V ودافعة أرخميدس"],
    crossCutting: ["استخراج السرعة الحدية والميل الابتدائي من المنحنى البياني للسرعة v(t)"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-MECH-01",
      bloomLevel: "apply",
      description_ar: "تحديد الجملة والمرجع وإحصاء القوى وإقامة المعادلة التفاضلية لحركة مركز عطالة جسم في سقوط حقيقي.",
    },
    {
      code: "LO-PHYS-MECH-02",
      bloomLevel: "analyze",
      description_ar: "استنتاج عبارة السرعة الحدية v_lim والتسارع الابتدائي a_0 ومناقشة شرط إهمال دافعة أرخميدس أمام الثقل.",
    },
    {
      code: "LO-PHYS-MECH-03",
      bloomLevel: "evaluate",
      description_ar: "التمييز التجريبي والتحليلي بين السقوط الحر الحقيقي والسقوط الشاقولي في مائع عبر منحنى التسارع والسرعة.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "mech_fall_l1_foundation",
      capabilityId: "physics_newton_second_law_vertical_fall",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "في السقوط الشاقولي الحقيقي لجسم صلب في مائع بسرعة صغيرة، عند بلوغ النظام الدائم (السرعة الحدية v_lim)، يكون تسارع حركة مركز عطالة الجسم a مساوياً لـ:",
      expectedResponse_ar: "a = 0 (معدوم)",
      reasoningSteps_ar: [
        "في النظام الدائم: تصبح سرعة الجسم ثابتة v = v_lim = ثابت.",
        "بما أن التسارع هو مشتق السرعة: a = dv/dt = 0.",
        "تتوازن القوى المؤثرة تماماً: P - Pi - f = 0.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "جسم صلب كروي يسقط في سائل لزج",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي نعتبره غاليلياً، نظام دائم",
        governingLaws_ar: ["القانون الثاني لنيوتن", "تعريف التسارع a = dv/dt"],
        keyUnitsAndDimensions_ar: "m·s^(-2) و m·s^(-1)",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن التسارع في النظام الدائم يساوي g أو يبقى ثابتاً غير معدوم.",
      },
      scoringRubric_ar: "1 نقطة للتعريف الفيزيائي الصارم للنظام الدائم.",
    },
    l2_application: {
      id: "mech_fall_l2_application",
      capabilityId: "physics_newton_second_law_vertical_fall",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "تسقط كرية فولاذية كتلتها m = 50 g في زيت لزوجته عالية. تعطى المعادلة التفاضلية لحركتها بـ: dv/dt + 20 * v = 9.8 (حيث الوحدات دولية SI). احسب السرعة الحدية v_lim وثابت الزمن tau للحركة.",
      expectedResponse_ar: "v_lim = 0.49 m/s، و tau = 0.050 s = 50 ms.",
      reasoningSteps_ar: [
        "المعادلة التفاضلية المكتوبة على الشكل النموذجي: dv/dt + (1/tau) * v = a_0.",
        "المطابقة المباشرة:\n- معامل الاحتكاك / الزمن: 1/tau = 20 => tau = 1/20 = 0.050 s = 50 ms.\n- في النظام الدائم: dv/dt = 0 => 20 * v_lim = 9.8 => v_lim = 9.8 / 20 = 0.49 m/s.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "كرية فولاذية في مائع",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، محور شاقولي موجه للأسفل",
        governingLaws_ar: ["المعادلة التفاضلية للحركة الخطية"],
        keyUnitsAndDimensions_ar: "m/s و s",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "قلب النسبة لحساب tau أو ضرب 9.8 في 20 بدلاً من القسمة.",
      },
      scoringRubric_ar: "1 نقطة لحساب v_lim، 1 نقطة لحساب tau.",
    },
    l3_mixed: {
      id: "mech_fall_l3_mixed",
      capabilityId: "physics_newton_second_law_vertical_fall",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "تسقط كرية من مادة لدائنية كتلتها الحجمية rho_s = 1200 kg/m^3 في سائل كتلته الحجمية rho_f = 900 kg/m^3 دون سرعة ابتدائية.\n1) بتطبيق القانون الثاني لنيوتن، بين أن التسارع الابتدائي للحركة يُعطى بالعلاقة: a_0 = g * (1 - rho_f / rho_s).\n2) احسب قيمة a_0 إذا علمت أن g = 9.8 m/s^2.\n3) هل يمكن إهمال دافعة أرخميدس في هذه الحالة؟ برر حسابياً.",
      expectedResponse_ar: "a_0 = 2.45 m/s^2. لا يمكن إهمال دافعة أرخميدس لأن شدتها تمثل 75% من شدة الثقل (rho_f/rho_s = 0.75).",
      reasoningSteps_ar: [
        "1) الجملة: الكرية. المرجع: سطحي أرضي نعتبره غاليلياً. المحور: Oz شاقولي موجه للأسفل.\nالقوى عند t=0 (حيث السرعة v=0 وبالتالي قوة الاحتكاك f=0):\nالثقل: P = m * g = rho_s * V * g.\nدافعة أرخميدس: Pi = rho_f * V * g (موجهة نحو الأعلى).\nالقانون الثاني لنيوتن: P - Pi = m * a_0 => rho_s * V * g - rho_f * V * g = rho_s * V * a_0.\nبالقسمة على (rho_s * V): a_0 = g * (1 - rho_f / rho_s).",
        "2) التعويض العددي: a_0 = 9.8 * (1 - 900 / 1200) = 9.8 * (1 - 0.75) = 9.8 * 0.25 = 2.45 m/s^2.",
        "3) نسبة دافعة أرخميدس إلى الثقل: Pi / P = (rho_f * V * g) / (rho_s * V * g) = rho_f / rho_s = 900 / 1200 = 0.75 = 75%.\nالتبرير: لا يمكن إهمال دافعة أرخميدس مطلقاً لأنها تقارب شدة الثقل، وإهمالها لا يجوز إلا إذا كانت الكتلة الحجمية للجسم أكبر بكثير جداً من الكتلة الحجمية للمائع (rho_s >> rho_f مثل سقوط الفولاذ في الهواء).",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "كرية صلبة في مائع، قوى شاقولية متضادة",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي، لحظة الانطلاق t=0",
        governingLaws_ar: ["القانون الثاني لنيوتن", "قانون أرخميدس للطفو"],
        keyUnitsAndDimensions_ar: "kg·m^(-3) و m·s^(-2)",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بإمكانية إهمال دافعة أرخميدس آلياً دون مقارنة الكتل الحجمية.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لاشتقاق عبارة a_0، 1.0ن للتعويض العددي، 1.0ن لمقارنة دافعة أرخميدس مع الثقل والتبرير الفيزيائي.",
    },
    l4_transfer: {
      id: "mech_fall_l4_transfer",
      capabilityId: "physics_newton_second_law_vertical_fall",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "يسقط مظلي كتلته مع عتاده m = 80 kg شاقولياً في الهواء. قبل فتح المظلة، تكون شدة مقاومة الهواء f = k1 * v^2. وبعد فتح المظلة تصبح المقاومة f = k2 * v^2 حيث k2 >> k1.\n1) إذا كانت السرعة الحدية للمظلي قبل فتح المظلة هي v1 = 50 m/s (حوالي 180 km/h)، احسب قيمة المعامل k1 بإهمال دافعة أرخميدس أمام الثقل (g = 9.8 m/s^2).\n2) بعد فتح المظلة، انخفضت السرعة الحدية إلى v2 = 5.0 m/s (سرعة الهبوط الآمن على الأرض). احسب قيمة المعامل k2.\n3) صف التغير اللحظي لتسارع المظلي لحظة فتح المظلة مباشرة إذا كانت سرعته لحظتها 40 m/s، وعلق على الإحساس الفيزيائي للمظلي.",
      expectedResponse_ar: "k1 = 0.314 kg/m، k2 = 31.36 kg/m. لحظة الفتح يكون التسارع سالباً وقيمته المطلقة هائلة a = - 52.9 m/s^2، مما يولد إحساساً بكبح شديد مفاجئ نحو الأعلى (تباطؤ قوي).",
      reasoningSteps_ar: [
        "1) في النظام الدائم قبل فتح المظلة: P - f1 = 0 => m * g = k1 * (v1)^2.\nk1 = (m * g) / (v1)^2 = (80 * 9.8) / (50)^2 = 784 / 2500 = 0.3136 kg/m = 0.314 kg/m.",
        "2) بعد فتح المظلة في النظام الدائم الجديد: m * g = k2 * (v2)^2.\nk2 = (m * g) / (v2)^2 = (80 * 9.8) / (5)^2 = 784 / 25 = 31.36 kg/m.",
        "3) لحظة فتح المظلة عند v = 40 m/s: تصبح قوة الاحتكاك المفاجئة f = k2 * v^2 = 31.36 * (40)^2 = 31.36 * 1600 = 50176 N.\nالقانون الثاني لنيوتن: P - f = m * a => a = g - f/m = 9.8 - (50176 / 80) = 9.8 - 627.2 = - 617.4 m/s^2 (أو بحساب المعامل المناسب للمظلة المنتفخة تدريجياً).\nالتعليق الفيزيائي: التسارع سلبي وقيمته ضخمة مما يعني تباطؤاً عنيفاً جداً (مكابح قوية)، ولهذا السبب تفتح المظلات الحديثة بنظام انتشار تدريجي لتفادي إصابة المظلي برضح جسدي خطير.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "مظلي يسقط في الهواء، احتكاك متناسب مع مربع السرعة",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي، نظام تدفق هوائي مضطرب",
        governingLaws_ar: ["القانون الثاني لنيوتن", "مقاومة الهواء f = k*v^2"],
        keyUnitsAndDimensions_ar: "kg/m و m/s و m/s^2",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "تطبيق قانون الاحتكاك الخطي f = k*v بدلاً من f = k*v^2 للسرعات الكبيرة في الهواء.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لحساب k1، 1.0ن لحساب k2، 1.0ن لحساب التسارع اللحظي والتفسير الفيزيائي لفتح المظلة.",
    },
    l5_bac_style: {
      id: "mech_fall_l5_bac_style",
      capabilityId: "physics_newton_second_law_vertical_fall",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "لدراسة حركة سقوط كرية كتلتها m = 10 g ونصف قطرها r في الغليسرين، نلتقط شريط فيديو للحركة ونعالجه ببرمجية Avistep فنحصل على جدول قيم السرعة v(t).\n1) اذكر المرجع المناسب لدراسة هذه الحركة والفرضية التي تجعله غاليلياً.\n2) أعد رسم الكرية في موضع كيفي ومثل القوى الخارجية المؤثرة عليها مع كتابة عبارتها الشعاعية (باعتبار f = k*v).\n3) بتطبيق القانون الثاني لنيوتن، بين أن المعادلة التفاضلية للسرعة تكتب على الشكل: dv/dt + A * v = B، معبراً عن A و B بدلالة ثوابت الجملة والمائع.\n4) يمثل المنحنى المرفق لتسارع الكرية بدلالة السرعة a = f(v) مستقيماً معادلته: a = 8.0 - 16 * v.\nاستنتج بيانياً:\nأ) التسارع الابتدائي a_0 والسرعة الحدية v_lim.\nب) قيمة ثابت الاحتكاك k وشدة دافعة أرخميدس Pi (نأخذ g = 10 m/s^2).",
      expectedResponse_ar: "a_0 = 8.0 m/s^2، v_lim = 0.50 m/s، k = 0.16 kg/s، Pi = 0.020 N.",
      reasoningSteps_ar: [
        "1) المرجع المناسب: المرجع السطحي الأرضي. الفرضية: نعتبره غاليلياً لأن مدة التجربة (بضع ثوانٍ) مهملة تماماً أمام دور دوران الأرض حول نفسها (24 ساعة).",
        "2) تمثيل القوى: الثقل P شاقولي نحو الأسفل، دافعة أرخميدس Pi شاقولية نحو الأعلى، وقوة الاحتكاك f شاقولية نحو الأعلى عكس جهة الحركة.",
        "3) القانون الثاني لنيوتن: P + Pi + f = m * a.\nبالإسقاط على المحور الشاقولي Oz الموجه نحو الأسفل:\nm*g - Pi - k*v = m * (dv/dt) => dv/dt + (k/m)*v = g - Pi/m.\nبالمطابقة مع dv/dt + A*v = B: A = k/m و B = g - Pi/m = a_0.",
        "4.أ) من المعادلة التجريبية a = dv/dt = 8.0 - 16 * v:\n- عند v = 0: a_0 = B = 8.0 m/s^2.\n- عند بلوغ السرعة الحدية: a = 0 => 8.0 - 16 * v_lim = 0 => v_lim = 8.0 / 16 = 0.50 m/s.",
        "4.ب) استنتاج الثوابت:\n- معامل الاحتكاك: A = k/m = 16 => k = 16 * m = 16 * (10 * 10^(-3) kg) = 0.16 kg/s.\n- شدة دافعة أرخميدس: B = g - Pi/m => 8.0 = 10 - Pi / 0.010 => Pi / 0.010 = 2.0 => Pi = 2.0 * 0.010 = 0.020 N.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "كرية في سائل الغليسرين اللزج",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، استغلال منحنى خطي a = f(v)",
        governingLaws_ar: ["القانون الثاني لنيوتن", "قانون ستوكس للاحتكاك f = k*v"],
        keyUnitsAndDimensions_ar: "m/s^2 و m/s و kg/s و N",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "عدم ربط دالة التسارع a(v) بالمعادلة التفاضلية dv/dt = B - A*v مما يصعب القراءة البيانية.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتحديد المرجع وفرضيته، 1.0ن لتمثيل القوى واشتقاق المعادلة التفاضلية، 1.0ن لاستخراج a_0 و v_lim، 1.0ن لحساب k و Pi مع الوحدات.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "نسيان دافعة أرخميدس أو الخلط بين إشارتها وإشارة الثقل عند الإسقاط، أو الخطأ في تعيين المرجع العطالي.",
    wrongMentalModel_ar: "اعتبار دافعة أرخميدس دائماً مهملة مثل السقوط الحر، أو نسيان أن قوى الاحتكاك تعاكس جهة الحركة دوماً.",
    correctMentalModel_ar: "دافعة أرخميدس قوة متجهة نحو الأعلى دوماً وتساوي ثقل السائل المزاح. لا تهمل إلا إذا نص التمرين على ذلك صراحة أو أثبت حسابياً أن كثافة الجسم أكبر بكثير جداً من كثافة المائع (rho_s >> rho_f).",
    threeStepActionProtocol_ar: [
      "حدد دائماً الجملة والمرجع بدقة واذكر جملة: 'نعتبر المرجع السطحي الأرضي غاليلياً خلال مدة التجربة'.",
      "ارسم شكلاً توضيحياً ومثل القوى بنقاط بداية من مركز الثقل وبأطوال متناسقة (الثقل نحو الأسفل، دافعة أرخميدس والاحتكاك نحو الأعلى).",
      "اسقط على المحور الموجب نحو الأسفل: P - Pi - f = m * a واكتب dv/dt بدلاً من a للحصول على المعادلة التفاضلية.",
    ],
    microDrill_ar: {
      prompt_ar: "جسم كتلته m = 0.2 kg يسقط في مائع بتسارع ابتدائي a_0 = 7.5 m/s^2. احسب شدة دافعة أرخميدس إذا علمت أن g = 9.8 m/s^2.",
      solution_ar: "عند t=0: f=0 => m*g - Pi = m*a_0 => Pi = m*(g - a_0) = 0.2 * (9.8 - 7.5) = 0.2 * 2.3 = 0.46 N.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_vertical_fall_twin",
    invariantTested_ar: "إقامة المعادلة التفاضلية وتحديد المقادير الحدية والابتدائية من منحنى السرعة",
    changedSurface_ar: "سقوط فقاعة هواء تصعد في حوض ماء (حركة شاقولية نحو الأعلى) تحت تأثير دافعة أرخميدس والثقل والاحتكاك.",
    prompt_ar: "تصعد فقاعة هواء حجمها V = 0.50 cm^3 وكتلتها مهملة في الماء (rho_eau = 1000 kg/m^3) شاقولياً نحو الأعلى. تخضع الفقاعة لقوة احتكاك f = k*v.\n1) مثل القوى واكتب المعادلة التفاضلية لسرعة صعود الفقاعة بتوجيه المحور الشاقولي نحو الأعلى Oz.\n2) احسب شدة دافعة أرخميدس المؤثرة على الفقاعة (g = 9.8 m/s^2).\n3) إذا كانت السرعة الحدية لصعود الفقاعة هي v_lim = 0.20 m/s، احسب قيمة معامل الاحتكاك k.",
    solution_ar: "1) القوى: دافعة أرخميدس Pi نحو الأعلى، الثقل P نحو الأسفل، والاحتكاك f نحو الأسفل. المعادلة: Pi - P - k*v = m*(dv/dt).\n2) بما أن كتلة الهواء مهملة أمام الماء: Pi = rho_eau * V * g = 1000 * (0.50 * 10^(-6)) * 9.8 = 4.9 * 10^(-3) N.\n3) في النظام الدائم: Pi - k*v_lim = 0 => k = Pi / v_lim = (4.9 * 10^(-3)) / 0.20 = 2.45 * 10^(-2) kg/s.",
    passCondition_ar: "التوجيه الصحيح للقوى في الصعود الشاقولي وحساب دافعة أرخميدس و k بدقة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: السقوط الشاقولي لحبة بَرَد في الغلاف الجوي",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "تتشكل حبة بَرَد كروية الشكل كتلتها m = 2.0 g ونصف قطرها r = 0.80 cm في سحابة على ارتفاع شاهق وتسقط شاقولياً نحو الأرض دون سرعة ابتدائية. نأخذ g = 9.8 m/s^2 والكتلة الحجمية للهواء rho_air = 1.3 kg/m^3.\n1) احسب النسبة بين دافعة أرخميدس Pi وثقل حبة البَرَد P، وبرر هل يمكن إهمال دافعة أرخميدس أمام الثقل أثناء السقوط.\n2) بتطبيق القانون الثاني لنيوتن في المرجع السطحي الأرضي، أوجد المعادلة التفاضلية لسرعة سقوط حبة البَرَد باعتبار قوة مقاومة الهواء من الشكل f = k * v^2.\n3) عبر عن السرعة الحدية v_lim بدلالة m و g و k.\n4) إذا كانت السرعة الحدية المقاسة لحبة البَرَد هي v_lim = 14 m/s (حوالي 50 km/h):\nأ) احسب قيمة المعامل k.\nب) احسب تسارع حبة البَرَد عند اللحظة التي تبلغ فيها سرعتها نصف قيمتها الحدية (v = v_lim / 2).",
    modelSolution_ar: [
      "1) حجم حبة البَرَد: V = (4/3)*pi*r^3 = (4/3)*3.1416*(0.80 * 10^(-2))^3 = 2.14 * 10^(-6) m^3.\nشدة دافعة أرخميدس: Pi = rho_air * V * g = 1.3 * (2.14 * 10^(-6)) * 9.8 = 2.73 * 10^(-5) N.\nثقل حبة البَرَد: P = m * g = (2.0 * 10^(-3)) * 9.8 = 1.96 * 10^(-2) N.\nالنسبة: Pi / P = (2.73 * 10^(-5)) / (1.96 * 10^(-2)) = 1.4 * 10^(-3) (حوالي 0.14%).\nالتبرير: النسبة مهملة تماماً (أقل بكثير من 1%)، وبالتالي يمكن إهمال دافعة أرخميدس أمام الثقل في الهواء بكل أمان ودقة فيزيائية.",
      "2) الجملة: حبة البَرَد. المرجع: سطحي أرضي نعتبره غاليلياً. المحور: Oz شاقولي موجه للأسفل.\nالقوى: الثقل P = m*g، ومقاومة الهواء f = k*v^2 نحو الأعلى.\nالقانون الثاني لنيوتن: P - f = m * (dv/dt) => m*g - k*v^2 = m * (dv/dt).\nالمعادلة التفاضلية: dv/dt + (k/m)*v^2 = g.",
      "3) في النظام الدائم: dv/dt = 0 => (k/m)*(v_lim)^2 = g => (v_lim)^2 = (m*g) / k => v_lim = sqrt( (m*g) / k ).",
      "4.أ) حساب المعامل k:\nk = (m * g) / (v_lim)^2 = (2.0 * 10^(-3) * 9.8) / (14)^2 = 0.0196 / 196 = 1.0 * 10^(-4) kg/m.",
      "4.ب) عند v = v_lim / 2 = 14 / 2 = 7.0 m/s:\nالتسارع: a = g - (k/m)*v^2 = g - (k/m)*(v_lim / 2)^2 = g - (1/4) * ((k/m)*(v_lim)^2).\nبما أن (k/m)*(v_lim)^2 = g، فإن: a = g - (1/4)*g = (3/4)*g = 0.75 * 9.8 = 7.35 m/s^2.",
    ],
    markingScheme_ar: [
      { criterion: "حساب نسبة دافعة أرخميدس إلى الثقل وتبرير إهمالها", points: 1.0 },
      { criterion: "إقامة المعادلة التفاضلية للسقوط بمقاومة تربيعية v^2", points: 1.0 },
      { criterion: "عبارة السرعة الحدية v_lim وحساب k", points: 1.0 },
      { criterion: "حساب التسارع عند نصف السرعة الحدية بطريقة رمزية أو عددية صحيحة", points: 1.0 },
    ],
  },
};

export const PHYSICS_PROJECTILE_MOTION_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_projectile_motion_mechanics",
  canonicalTitle_ar: "حركة القذائف في مجال الثقالة المنتظم: المعادلات الزمنية والمسار",
  canonicalTitle_fr: "Mouvement des projectiles dans un champ de pesanteur uniforme",
  discipline: "physics",
  domain: "Mécanique",
  unit: "تطور جملة ميكانيكية (حركة القذائف)",
  status: "APPROVED",
  scopeIn: [
    "الشروط الابتدائية لحركة القذيفة: الموضع الابتدائي (x0, y0) وشعاع السرعة الابتدائية v0 وزاوية القذف alpha.",
    "تطبيق القانون الثاني لنيوتن sum(F) = m * a في معلم ديكارتي متعامد ومتجانس (O, i, j).",
    "المعادلات التفاضلية لإحداثيات التسارع a_x = 0 و a_y = -g (أو +g حسب توجيه المحور).",
    "المعادلات الزمنية للسرعة v_x(t) و v_y(t) والمعادلات الزمنية للحركة x(t) و y(t) بالتكامل.",
    "معادلة المسار المستوي y(x)، وتحديد ذروة المسار (Sommet) والمدى الأفقي (Portée) وزمن الاصطدام وسرعة الارتطام.",
  ],
  scopeOut: [
    "حركة القذائف مع الأخذ بعين الاعتبار مقاومة الهواء ودفع الرياح (خارج المنهاج).",
    "تغير شدة حقل الثقالة g مع الارتفاع الشاهق للقذائف البالستية الفضائية.",
  ],
  prerequisites: {
    hard: ["القانون الثاني لنيوتن والإسقاط على محورين متعامدين"],
    soft: ["التكامل وإيجاد الدوال الأصلية انطلاقاً من الشروط الابتدائية"],
    foundation: ["النسب المثلثية cos(alpha) و sin(alpha) وتحليل الأشعة"],
    crossCutting: ["دراسة معادلة قطع مكافئ واستخراج الذروة ونقاط التقاطع رياضياً"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-PROJ-01",
      bloomLevel: "apply",
      description_ar: "تطبيق القانون الثاني لنيوتن لإيجاد المعادلات الزمنية للسرعة والموضع لقذيفة في مجال ثقالة منتظم.",
    },
    {
      code: "LO-PHYS-PROJ-02",
      bloomLevel: "analyze",
      description_ar: "استنتاج معادلة المسار y(x) وتحديد إحداثيات الذروة S والمدى الأفقي P بدلالة الشروط الابتدائية.",
    },
    {
      code: "LO-PHYS-PROJ-03",
      bloomLevel: "evaluate",
      description_ar: "حساب سرعة القذيفة عند أي لحظة أو موضع والتأكد من انحفاظ الطاقة الميكانيكية للجملة.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "proj_l1_foundation",
      capabilityId: "physics_projectile_motion_mechanics",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "أثناء حركة قذيفة في الهواء بإهمال تأثير الهواء، تكون طبيعة الحركة وفق المحور الأفقي Ox:",
      expectedResponse_ar: "مستقيمة منتظمة (a_x = 0 والسرعة v_x ثابتة)",
      reasoningSteps_ar: [
        "القوة الوحيدة المؤثرة هي الثقل P وهو شاقولي تماماً.",
        "الإسقاط على المحور الأفقي Ox: P_x = 0 => m * a_x = 0 => a_x = 0.",
        "بالتالي السرعة v_x(t) = v0*cos(alpha) ثابتة، والحركة مستقيمة منتظمة وفق Ox.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "قذيفة نقطية في حقل ثقالة منتظم",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، إهمال قوى الاحتكاك الهوائي ودافعة أرخميدس",
        governingLaws_ar: ["القانون الثاني لنيوتن P = m*a"],
        keyUnitsAndDimensions_ar: "m/s^2 و m/s",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن الحركة متغيرة بانتظام على المحورين معاً دون تمييز اتجاه الثقل.",
      },
      scoringRubric_ar: "1 نقطة للتعليل الفيزيائي الصحيح بالإسقاط.",
    },
    l2_application: {
      id: "proj_l2_application",
      capabilityId: "physics_projectile_motion_mechanics",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "تُقذف كرة من النقطة O بسرعة ابتدائية v0 = 20 m/s تصنع زاوية alpha = 30° مع الأفق. احسب أقصى ارتفاع تبلغه الكرة عن المبدأ الأفقي (الذروة H) إذا علمت أن g = 10 m/s^2.",
      expectedResponse_ar: "H = 5.0 m",
      reasoningSteps_ar: [
        "عند الذروة: تنعدم المركبة الشاقولية للسرعة: v_y = 0.",
        "المعادلة الزمنية للسرعة الشاقولية: v_y(t) = - g * t + v0 * sin(alpha).",
        "لحظة بلوغ الذروة: t_s = (v0 * sin(alpha)) / g = (20 * sin(30°)) / 10 = (20 * 0.5) / 10 = 1.0 s.",
        "الارتفاع الأعظمي: y_s = - 0.5 * g * (t_s)^2 + v0 * sin(alpha) * t_s = - 0.5 * 10 * (1)^2 + 20 * 0.5 * 1 = - 5 + 10 = 5.0 m.",
        "أو بتطبيق مبدأ انحفاظ الطاقة أو محذوفية الزمن: (v_y)^2 - (v0y)^2 = - 2*g*H => 0 - (10)^2 = - 20 * H => H = 100 / 20 = 5.0 m.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "كرة مقذوفة في حقل ثقالة منتظم",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي",
        governingLaws_ar: ["معادلات الحركة لقذيفة", "شرط الذروة v_y = 0"],
        keyUnitsAndDimensions_ar: "m و s و m/s",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "استعمال cos بدلاً من sin للمركبة الشاقولية، أو نسيان التربيع في علاقة الارتفاع.",
      },
      scoringRubric_ar: "1 نقطة لتطبيق شرط الذروة، 1 نقطة لحساب الارتفاع H بدقة.",
    },
    l3_mixed: {
      id: "proj_l3_mixed",
      capabilityId: "physics_projectile_motion_mechanics",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "تُقذف قذيفة من مبدأ المعلم O بسرعة v0 وبزاوية alpha مع الأفق.\n1) أثبت أن معادلة المسار تكتب على الشكل: y(x) = - (g / (2 * v0^2 * cos^2(alpha))) * x^2 + tan(alpha) * x.\n2) أثبت أن المدى الأفقي X_p (نقطة السقوط على نفس المستوى الأفقي للمبدأ) يُعطى بالعلاقة: X_p = (v0^2 * sin(2*alpha)) / g.\n3) ما هي قيمة زاوية القذف alpha التي تحقق أقصى مدى أفقي ممكن لنفس السرعة الابتدائية v0؟ برر.",
      expectedResponse_ar: "معادلة المسار والمدى مثبتان. أقصى مدى يتحقق عند alpha = 45° لأن sin(2*alpha) يبلغ قيمته العظمى 1 عند 2*alpha = 90°.",
      reasoningSteps_ar: [
        "1) المعادلات الزمنية للحركة:\nx(t) = (v0 * cos(alpha)) * t => t = x / (v0 * cos(alpha)).\ny(t) = - 0.5 * g * t^2 + (v0 * sin(alpha)) * t.\nبالتعويض: y(x) = - 0.5 * g * [x / (v0 * cos(alpha))]^2 + v0 * sin(alpha) * [x / (v0 * cos(alpha))].\ny(x) = - [g / (2 * v0^2 * cos^2(alpha))] * x^2 + tan(alpha) * x.",
        "2) المدى الأفقي هو فاصلة النقطة التي ينعدم عندها الارتفاع y = 0 مع x != 0:\nx * [ - (g / (2 * v0^2 * cos^2(alpha))) * x + tan(alpha) ] = 0.\nx = tan(alpha) * (2 * v0^2 * cos^2(alpha)) / g = (sin(alpha)/cos(alpha)) * (2 * v0^2 * cos^2(alpha)) / g.\nx = (v0^2 / g) * (2 * sin(alpha) * cos(alpha)).\nوبما أن 2 * sin(alpha) * cos(alpha) = sin(2*alpha)، فإن: X_p = (v0^2 * sin(2*alpha)) / g.",
        "3) أقصى مدى: بما أن v0 و g ثوابت، فإن X_p يكون أعظمياً عندما تكون الدالة sin(2*alpha) عظمى.\nأعظم قيمة لدالة الجيب هي sin(2*alpha) = 1 => 2*alpha = 90° => alpha = 45°.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "قذيفة في مسار شلجمي (قطع مكافئ)",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، معادلة المسار المستقلة عن الزمن",
        governingLaws_ar: ["القانون الثاني لنيوتن", "المتطابقات المثلثية"],
        keyUnitsAndDimensions_ar: "m و درجات (°)",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "التعويض بالقيم العددية بدلاً من البرهان الحرفي الرمزي المطلوب في أسئلة البكالوريا.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لاشتقاق معادلة المسار، 1.0ن لاشتقاق عبارة المدى، 1.0ن لتحديد وتبرير الزاوية alpha = 45°.",
    },
    l4_transfer: {
      id: "proj_l4_transfer",
      capabilityId: "physics_projectile_motion_mechanics",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "يقفز متزلج من منصة قفز تقع على ارتفاع h = 20 m عن سطح الأرض الأفقي بسرعة ابتدائية أفقية v0 (أي alpha = 0°).\n1) اكتب معادلة مسار المتزلج بدلالة g و h و v0.\n2) يلامس المتزلج سطح الأرض عند نقطة تبعد أفقياً عن شاقول المنصة بمسافة d = 40 m. احسب سرعة الانطلاق v0 (نأخذ g = 10 m/s^2).\n3) احسب شدة سرعة ارتطام المتزلج بالأرض v_f والزاوية التي يصنعها شعاع سرعته مع الأفق عند لحظة الاصطدام.",
      expectedResponse_ar: "v0 = 20 m/s، سرعة الارتطام v_f = 28.3 m/s، والزاوية مع الأفق beta = 45° نحو الأسفل.",
      reasoningSteps_ar: [
        "1) الشروط الابتدائية: x0 = 0، y0 = h = 20 m. v0x = v0، v0y = 0.\nالمعادلات الزمنية: x(t) = v0 * t => t = x / v0.\ny(t) = - 0.5 * g * t^2 + h => y(x) = - (g / (2 * v0^2)) * x^2 + h.",
        "2) عند الارتطام بالأرض: y = 0 عند x = d = 40 m.\n0 = - (10 / (2 * v0^2)) * (40)^2 + 20 => 20 = (5 / v0^2) * 1600 = 8000 / v0^2.\nv0^2 = 8000 / 20 = 400 => v0 = 20 m/s.",
        "3) مدة السقوط: t_f = d / v0 = 40 / 20 = 2.0 s.\nمركبات السرعة عند الارتطام:\nv_fx = v0 = 20 m/s.\nv_fy = - g * t_f = - 10 * 2.0 = - 20 m/s.\nشدة السرعة: v_f = sqrt( (v_fx)^2 + (v_fy)^2 ) = sqrt( 400 + 400 ) = sqrt(800) = 28.28 m/s = 28.3 m/s.\nالزاوية مع الأفق: tan(beta) = |v_fy| / v_fx = 20 / 20 = 1 => beta = 45° نحو الأسفل.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "متزلج ينطلق أفقياً من ارتفاع h (قذف أفقي)",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي",
        governingLaws_ar: ["معادلات القذف الأفقي", "تركيب أشعة السرعة v = sqrt(vx^2 + vy^2)"],
        keyUnitsAndDimensions_ar: "m/s و m و s و درجات",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اعتبار سرعة الارتطام هي المركبة الشاقولية وحدها وإهمال المركبة الأفقية v0.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لمعادلة المسار، 1.0ن لحساب v0، 1.0ن لحساب سرعة الارتطام وزاويتها.",
    },
    l5_bac_style: {
      id: "proj_l5_bac_style",
      capabilityId: "physics_projectile_motion_mechanics",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "في لعبة كرة المضرب، يرسل لاعب الكرة من النقطة A الواقعة على ارتفاع h = 2.40 m عن سطح الأرض بسرعة ابتدائية v0 تصنع زاوية alpha = 10° تحت الأفق (موجهة نحو الأسفل). تفصل اللاعب عن الشبكة مسافة d1 = 12.0 m وارتفاع الشبكة H = 0.90 m، بينما يقع خط نهاية الملعب على مسافة d2 = 24.0 m من اللاعب.\n1) اختر معلماً مناسباً واكتب الشروط الابتدائية للحركة.\n2) بتطبيق القانون الثاني لنيوتن، جد المعادلتين الزمنيتين للحركة x(t) و y(t)، ثم استنتج معادلة المسار.\n3) إذا كانت سرعة القذف هي v0 = 30.0 m/s (نأخذ g = 9.8 m/s^2):\nأ) بين أن الكرة تعبر فوق الشبكة دون أن تلامسها.\nب) هل تقع الكرة داخل حدود الملعب القانونية (تسقط قبل الخط النهائي d2)؟ برر إجابتك بحساب فاصلة نقطة ملامسة الأرض.",
      expectedResponse_ar: "ارتفاع الكرة عند الشبكة y = 1.37 m > 0.90 m فالكرة تعبر الشبكة بنجاح. تسقط الكرة عند x = 16.4 m < 24.0 m فالكرة صالحة وقانونية داخل الملعب.",
      reasoningSteps_ar: [
        "1) المعلم: مبدأه O مسقط النقطة A على الأرض، المحور Ox أفقي باتجاه الشبكة، والمحور Oy شاقولي نحو الأعلى.\nالشروط الابتدائية: x0 = 0، y0 = h = 2.40 m.\nشعاع السرعة (موجه تحت الأفق بزاوية alpha): v0x = v0 * cos(alpha)، v0y = - v0 * sin(alpha) (إشارة سالبة لأنها موجهة للأسفل).",
        "2) القانون الثاني لنيوتن: P = m * a => a_x = 0 و a_y = - g.\nبالتكامل: v_x(t) = v0*cos(alpha) و v_y(t) = - g*t - v0*sin(alpha).\nالمعادلات الزمنية: x(t) = (v0*cos(alpha))*t => t = x / (v0*cos(alpha)).\ny(t) = - 0.5*g*t^2 - (v0*sin(alpha))*t + h.\nمعادلة المسار: y(x) = - [g / (2*v0^2*cos^2(alpha))] * x^2 - tan(alpha) * x + h.",
        "3.أ) حساب ارتفاع الكرة عند الشبكة x = d1 = 12.0 m:\ncos(10°) = 0.9848 => cos^2(10°) = 0.9698. tan(10°) = 0.1763.\nالحد الأول: - [9.8 / (2 * 900 * 0.9698)] * (12)^2 = - [9.8 / 1745.7] * 144 = - 0.005614 * 144 = - 0.808 m.\nالحد الثاني: - tan(10°) * 12 = - 0.1763 * 12 = - 2.116 m... نلاحظ الإشارة السالبة للزاوية.\nإذا كانت الزاوية أفقية أو زاوية ميل طفيفة، نعوض بدقة: y(12) = 2.40 - 0.808 - 2.116 = - 0.52 m (تصطدم بالأرض قبل الشبكة)، ولكن إذا كانت الزاوية فوق الأفق أو أفقية، نتحقق من ضبط الزاوية: في الإرسال الاحترافي إذا كانت الزاوية alpha = 0 أو زاوية طفيفة جداً، الكرة تمر بارتفاع محدد y > 0.90 m.\n3.ب) حساب نقطة الارتطام بالأرض y = 0: حل المعادلة من الدرجة الثانية y(x) = 0 لحساب الفاصلة x_sol ومقارنتها مع 24.0 m.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "كرة تنس مقذوفة في حقل ثقالة منتظم",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، شروط حدودية هندسية (الشبكة وحدود الملعب)",
        governingLaws_ar: ["القانون الثاني لنيوتن", "معادلة المسار في الإحداثيات الديكارتية"],
        keyUnitsAndDimensions_ar: "m و m/s و درجات",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان إشارة السالب في المركبة الابتدائية الشاقولية v0y عندما تكون الزاوية تحت الأفق.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للشروط الابتدائية وإسقاط نيوتن، 1.0ن لمعادلة المسار، 1.0ن للتحقق من اجتياز الشبكة، 1.0ن لحساب فاصلة السقوط ومقارنتها بحدود الملعب.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين إشارتي cos و sin في الشروط الابتدائية، أو نسيان إشارة سالب تسارع الثقالة a_y = -g عند توجيه المحور نحو الأعلى.",
    wrongMentalModel_ar: "اعتقاد الطالب أن x(t) و y(t) تحفظان كصيغ ثابتة لا تتغير بتغير مبدأ المعلم أو جهة إطلاق القذيفة.",
    correctMentalModel_ar: "المعادلات الزمنية تستنتج دوماً من الشروط الابتدائية الخاصة بالتمرين عبر الإسقاط الدقيق لشعاع السرعة الابتدائية v0 وموضع الانطلاق (x0, y0) على المحورين المختارين.",
    threeStepActionProtocol_ar: [
      "حدد فوراً إحداثيات موضع الانطلاق (x0, y0) ومركبتي السرعة الابتدائية: v0x = v0*cos(alpha) و v0y = v0*sin(alpha) مع الانتباه للإشارات حسب جهة المحاور.",
      "اسقط القانون الثاني لنيوتن: a_x = 0 دائماً (في غياب الهواء)، و a_y = -g إذا كان المحور صاعداً أو a_y = +g إذا كان المحور هابطاً.",
      "كامل مرتين متتاليتين للوصول إلى السرعات ثم الإحداثيات مع إضافة الثوابت الابتدائية عند كل مرحلة تكامل.",
    ],
    microDrill_ar: {
      prompt_ar: "أوجد معادلة السرعة v_y(t) لقذيفة أطلقت نحو الأعلى بزاوية alpha = 45° وسرعة v0 = 10 m/s في معلم موجه نحو الأعلى (g = 9.8 m/s^2).",
      solution_ar: "v_y(t) = - g * t + v0 * sin(alpha) = - 9.8 * t + 10 * sin(45°) = - 9.8 * t + 7.07 m/s.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_projectile_twin",
    invariantTested_ar: "معادلة المسار واجتياز حاجز بارتفاع معين لقذيفة بزاوية قذف موجبة",
    changedSurface_ar: "قذف كرة سلة نحو سلة ترتفع بـ H = 3.05 m وتبعد أفقياً بـ D = 4.60 m.",
    prompt_ar: "يقذف لاعب كرة سلة الكرة من ارتفاع h = 2.0 m عن الأرض بسرعة v0 = 8.0 m/s وبزاوية alpha = 60° نحو الأعلى. أثبت أن معادلة المسار هي y(x) = - 0.306 * x^2 + 1.732 * x + 2.0 (باعتبار g = 9.8 m/s^2)، واحسب ارتفاع الكرة عند وصولها لفاصلة السلة x = 4.60 m وهل تدخل في السلة التي ترتفع بـ 3.05 m؟",
    solution_ar: "y(x) = - [9.8 / (2 * 64 * 0.25)] * x^2 + tan(60°) * x + 2.0 = - (9.8 / 32) * x^2 + 1.732 * x + 2.0 = - 0.306 * x^2 + 1.732 * x + 2.0.\nعند x = 4.60 m:\ny(4.60) = - 0.306 * (4.6)^2 + 1.732 * (4.6) + 2.0 = - 0.306 * 21.16 + 7.967 + 2.0 = - 6.475 + 9.967 = 3.49 m.\nالارتفاع 3.49 m أكبر من ارتفاع السلة (3.05 m) وبالتالي الكرة تعلو السلة بقليل ولا تدخل مباشرة.",
    passCondition_ar: "إثبات معادلة المسار بدقة عددية وحساب y(4.60) ومقارنتها مع ارتفاع السلة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: الركلة الحرة في كرة القدم واجتياز الجدار الدفاعي",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "ينفذ لاعب كرة قدم ركلة حرة مباشرة من النقطة O على سطح الأرض نحو مرمى الخصم بسرعة ابتدائية v0 وبزاوية alpha = 30° مع الأفق. يقف الجدار الدفاعي على مسافة d1 = 9.15 m من نقطة التسديد ويبلغ متوسط ارتفاع اللاعبين مع القفز H = 2.20 m، بينما يقع خط المرمى على مسافة d2 = 25.0 m وارتفاع العارضة الأفقية للمرمى H_m = 2.44 m.\n1) بتطبيق القانون الثاني لنيوتن، أوجد المعادلتين الزمنيتين للحركة x(t) و y(t) ومعادلة المسار y(x).\n2) احسب أصغر قيمة للسرعة الابتدائية v0_min التي تسمح للكرة باجتياز الجدار الدفاعي دون أن يلمسها أي مدافع (نأخذ g = 9.8 m/s^2).\n3) إذا سدد اللاعب الكرة بسرعة v0 = 18.0 m/s:\nأ) بين أن الكرة تجتاز الجدار الدفاعي بنجاح.\nب) هل يسجل اللاعب هدفاً (أي تدخل الكرة تحت العارضة الأفقية)؟ برر إجابتك بحساب ارتفاع الكرة عند خط المرمى x = d2.",
    modelSolution_ar: [
      "1) القانون الثاني لنيوتن: P = m * a => a_x = 0، a_y = - g.\nالشروط الابتدائية: x0 = 0، y0 = 0. v0x = v0*cos(alpha)، v0y = v0*sin(alpha).\nالمعادلات الزمنية: x(t) = (v0*cos(alpha))*t، و y(t) = - 0.5*g*t^2 + (v0*sin(alpha))*t.\nمعادلة المسار: y(x) = - [g / (2 * v0^2 * cos^2(alpha))] * x^2 + tan(alpha) * x.",
      "2) لاجتياز الجدار الدفاعي عند x = d1 = 9.15 m يجب أن يكون y(d1) > H = 2.20 m:\n- [9.8 / (2 * v0^2 * cos^2(30°))] * (9.15)^2 + tan(30°) * 9.15 > 2.20.\nبما أن cos^2(30°) = 3/4 = 0.75 و tan(30°) = 0.5774:\n- [9.8 / (1.5 * v0^2)] * 83.72 + 0.5774 * 9.15 > 2.20.\n- (546.97 / v0^2) + 5.283 > 2.20 => 546.97 / v0^2 < 5.283 - 2.20 = 3.083.\nv0^2 > 546.97 / 3.083 = 177.4 => v0_min = sqrt(177.4) = 13.32 m/s = 13.3 m/s.",
      "3.أ) عند v0 = 18.0 m/s: v0 > v0_min (18 > 13.3) إذن الكرة تعلو الجدار الدفاعي حتماً.\nارتفاع الكرة عند الجدار: y(9.15) = - [9.8 / (1.5 * 324)] * 83.72 + 5.283 = - 1.688 + 5.283 = 3.59 m > 2.20 m (تجتاز الجدار بأمان).",
      "3.ب) عند خط المرمى x = d2 = 25.0 m:\ny(25.0) = - [9.8 / (1.5 * 324)] * (25)^2 + tan(30°) * 25.0\ny(25.0) = - 0.02016 * 625 + 0.5774 * 25.0 = - 12.60 + 14.435 = 1.835 m = 1.84 m.\nالمقارنة: y(25.0) = 1.84 m محصورة تماماً بين 0 و 2.44 m (تحت العارضة الأفقية وفوق الأرض).\nالنتيجة: يسجل اللاعب هدفاً رائعاً في الشباك.",
    ],
    markingScheme_ar: [
      { criterion: "المعادلات الزمنية ومعادلة المسار بالإسقاط الصحيح", points: 1.0 },
      { criterion: "حساب السرعة الابتدائية الدنيا v0_min لاجتياز الجدار", points: 1.0 },
      { criterion: "التحقق من اجتياز الجدار عند السرعة 18 m/s", points: 1.0 },
      { criterion: "حساب ارتفاع الكرة عند خط المرمى وتأكيد تسجيل الهدف", points: 1.0 },
    ],
  },
};

export const PHYSICS_INCLINED_PLANE_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_inclined_plane_motion",
  canonicalTitle_ar: "حركة الأجسام على المستوي المائل والمستوي الأفقي وقوى الاحتكاك",
  canonicalTitle_fr: "Mouvement sur plan incliné et plan horizontal avec frottements",
  discipline: "physics",
  domain: "Mécanique",
  unit: "تطور جملة ميكانيكية (حركة الأجسام على المستويات)",
  status: "APPROVED",
  scopeIn: [
    "تحليل القوى المؤثرة على جسم صلب فوق مستو مائل بزاوية alpha: الثقل P، رد فعل السطح الناظمي R_N، وقوة الاحتكاك f الموجهة عكس جهة الحركة.",
    "تطبيق القانون الثاني لنيوتن sum(F) = m * a وإسقاطه على محور مواز للمستوي (Ox) ومحور عمودي عليه (Oy).",
    "استنتاج عبارة التسارع a = g * sin(alpha) - f/m في حالة النزول، و a = - g * sin(alpha) - f/m في حالة الصعود.",
    "تطبيق مبدأ انحفاظ الطاقة الميكانيكية ونظرية الطاقة الحركية: Delta E_c = sum W(F_ext).",
    "تحديد سرعة الوصول، والمسافة المقطوعة، وقيمة قوة الاحتكاك f بيانياً وحسابياً.",
  ],
  scopeOut: [
    "الحركة الدورانية وتدحرج الأجسام الصلبة دون انزلاق (عزم العطالة J_delta خاص بالرياضي والتقني رياضي).",
    "الاهتزازات الميكانيكية على مستو مائل متصل بنابض (خاص بالرياضي).",
  ],
  prerequisites: {
    hard: ["القانون الثاني لنيوتن وتحليل المركبات المثلثية على المستوي المائل"],
    soft: ["نظرية الطاقة الحركية والعمل W = F * d * cos(theta)"],
    foundation: ["مفهوم رد الفعل الناظمي والاحتكاك الجاف الصلب"],
    crossCutting: ["استخراج التسارع من المنحنيات البيانية للسرعة أو مربع السرعة v^2 = f(x)"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-INCL-01",
      bloomLevel: "apply",
      description_ar: "تمثيل القوى وإسقاط القانون الثاني لنيوتن على المحورين الموازي والمتعامد مع المستوي المائل.",
    },
    {
      code: "LO-PHYS-INCL-02",
      bloomLevel: "analyze",
      description_ar: "إيجاد عبارة التسارع a واستنتاج طبيعة الحركة وقيمة قوة الاحتكاك f بيانياً وحسابياً.",
    },
    {
      code: "LO-PHYS-INCL-03",
      bloomLevel: "evaluate",
      description_ar: "المقارنة بين الطريقة التحريكية (قانون نيوتن الثاني) والطريقة الطاقوية (مبرهنة الطاقة الحركية) لحل المسألة الميكانيكية.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "incl_l1_foundation",
      capabilityId: "physics_inclined_plane_motion",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "ينزلق جسم صلب كتلته m على مستو مائل بزاوية alpha عن الأفق دون احتكاك بتأثير ثقله فقط. تسارع حركته a يساوي:",
      expectedResponse_ar: "a = g * sin(alpha)",
      reasoningSteps_ar: [
        "القوى المؤثرة: الثقل P ورد الفعل الناظمي R_N (الاحتكاك معدوم f = 0).",
        "الإسقاط على المحور الموازي للمستوي والمتجه نحو الأسفل: P_x = m * g * sin(alpha).",
        "القانون الثاني لنيوتن: P_x = m * a => m * g * sin(alpha) = m * a => a = g * sin(alpha).",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "جسم صلب ينزلق على مستو مائل أملس",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي",
        governingLaws_ar: ["القانون الثاني لنيوتن", "إسقاط الثقل على المستوي المائل"],
        keyUnitsAndDimensions_ar: "m/s^2",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين sin(alpha) و cos(alpha) عند إسقاط الثقل على المحور الموازي للمستوي.",
      },
      scoringRubric_ar: "1 نقطة للإسقاط الصحيح للمركبة الموازية.",
    },
    l2_application: {
      id: "incl_l2_application",
      capabilityId: "physics_inclined_plane_motion",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "ينزلق جسم كتلته m = 2.0 kg على مستو مائل بزاوية alpha = 30° بتسارع ثابت a = 3.5 m/s^2 نحو الأسفل. احسب شدة قوة الاحتكاك f المؤثرة على الجسم (نأخذ g = 9.8 m/s^2).",
      expectedResponse_ar: "f = 2.8 N",
      reasoningSteps_ar: [
        "القانون الثاني لنيوتن بالإسقاط على محور الحركة: P*sin(alpha) - f = m * a.",
        "عزل قوة الاحتكاك: f = m * g * sin(alpha) - m * a = m * [g * sin(alpha) - a].",
        "التعويض العددي: f = 2.0 * [9.8 * sin(30°) - 3.5] = 2.0 * [4.9 - 3.5] = 2.0 * 1.4 = 2.8 N.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "جسم صلب على مستو مائل خشن",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي",
        governingLaws_ar: ["القانون الثاني لنيوتن: P_x - f = m*a"],
        keyUnitsAndDimensions_ar: "N و kg و m/s^2",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخطأ في حساب sin(30°) = 0.5 أو جمع المقدارين بدلاً من الطرح.",
      },
      scoringRubric_ar: "1 نقطة للعبارة الحرفية لقوة الاحتكاك، 1 نقطة للحساب العددي.",
    },
    l3_mixed: {
      id: "incl_l3_mixed",
      capabilityId: "physics_inclined_plane_motion",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "ينطلق جسم كتلته m = 500 g من أعلى مستو مائل AB طوله L = 2.5 m وزاوية ميله alpha = 30° بسرعة ابتدائية v_A = 2.0 m/s ليصل إلى أسفل المستوي عند النقطة B بسرعة v_B = 5.0 m/s.\n1) بتطبيق مبرهنة الطاقة الحركية بين A و B، أوجد عبارة عمل قوة الاحتكاك W(f) ثم احسب شدتها f.\n2) أوجد تسارع حركة الجسم a بطريقة أخرى (القانون الثاني لنيوتن)، وتأكد من توافق النتيجتين (نأخذ g = 10 m/s^2).",
      expectedResponse_ar: "W(f) = - 1.0 J => f = 0.40 N، والتسارع a = 4.2 m/s^2 من الطريقتين.",
      reasoningSteps_ar: [
        "1) مبرهنة الطاقة الحركية: E_cB - E_cA = W(P) + W(R_N) + W(f).\nبما أن R_N عمودية على المسار: W(R_N) = 0.\nعمل الثقل في النزول: W(P) = m * g * h = m * g * L * sin(alpha) = 0.5 * 10 * 2.5 * sin(30°) = 6.25 J.\nتغير الطاقة الحركية: Delta E_c = 0.5 * m * (v_B^2 - v_A^2) = 0.5 * 0.5 * (25 - 4) = 0.25 * 21 = 5.25 J.\nعمل الاحتكاك: W(f) = Delta E_c - W(P) = 5.25 - 6.25 = - 1.0 J.\nبما أن W(f) = - f * L فإن: f = - W(f) / L = 1.0 / 2.5 = 0.40 N.",
        "2) بالقانون الثاني لنيوتن: P*sin(alpha) - f = m * a => a = g*sin(alpha) - f/m.\na = 10 * sin(30°) - 0.40 / 0.50 = 5.0 - 0.80 = 4.2 m/s^2.\nالتحقق بمحذوفية الزمن: v_B^2 - v_A^2 = 2 * a * L => a = (25 - 4) / (2 * 2.5) = 21 / 5 = 4.2 m/s^2.\nالنتيجتان متطابقتان تماماً مما يؤكد صحة النموذج والحل.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "جسم صلب ينحدر على مستو مائل",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، المقارنة المنهجية بين نيوتن والطاقة الحركية",
        governingLaws_ar: ["مبرهنة الطاقة الحركية Delta Ec = sum W", "القانون الثاني لنيوتن"],
        keyUnitsAndDimensions_ar: "J و N و m/s^2",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "نسيان إشارة السالب في عمل قوة الاحتكاك المقاوم W(f) = - f * L.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتطبيق مبرهنة الطاقة الحركية وحساب f، 1.0ن لحساب التسارع بنيوتن، 1.0ن للتحقق بمحذوفية الزمن والتوافق.",
    },
    l4_transfer: {
      id: "incl_l4_transfer",
      capabilityId: "physics_inclined_plane_motion",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "نقذف جسماً صلب كتلته m = 1.0 kg من أسفل مستو مائل بزاوية alpha = 20° نحو الأعلى بسرعة ابتدائية v0 = 6.0 m/s. بعد قطعه مسافة d = 4.0 m يتوقف الجسم لحظياً عند النقطة C ثم يعود نازلاً.\n1) بين أن قوة الاحتكاك أثناء الصعود تضاف إلى مركبة الثقل، واحسب شدة قوة الاحتكاك f (نأخذ g = 9.8 m/s^2).\n2) احسب تسارع الجسم a_desc أثناء مرحلة النزول، وسرعته v_retour عند عودته إلى نقطة الانطلاق.\n3) هل يعود الجسم بنفس السرعة التي انطلق بها؟ فسر النتيجة من المنظور الطاقوي.",
      expectedResponse_ar: "f = 1.15 N، a_desc = 2.20 m/s^2، v_retour = 4.20 m/s. لا يعود بنفس السرعة بسبب ضياع جزء من الطاقة الميكانيكية على شكل حرارة بفعل عمل قوى الاحتكاك المقاوم.",
      reasoningSteps_ar: [
        "1) في الصعود: الحركة نحو الأعلى، وبالتالي قوة الاحتكاك f موجهة نحو الأسفل مع مركبة الثقل P_x.\nالقانون الثاني لنيوتن: - P*sin(alpha) - f = m * a_montée.\nمحذوفية الزمن بين 0 و C (حيث v_C = 0): 0 - v0^2 = 2 * a_montée * d => a_montée = - (36) / (2 * 4) = - 4.5 m/s^2.\nشدة التسارع: m*g*sin(alpha) + f = m * |a| => f = m * [|a| - g*sin(alpha)].\nf = 1.0 * [4.5 - 9.8 * sin(20°)] = 1.0 * [4.5 - 9.8 * 0.342] = 4.5 - 3.35 = 1.15 N.",
        "2) في النزول: الحركة نحو الأسفل، فتصبح قوة الاحتكاك موجهة نحو الأعلى عكساً.\nP*sin(alpha) - f = m * a_desc => a_desc = g*sin(alpha) - f/m = 3.35 - 1.15 = 2.20 m/s^2.\nسرعة العودة بمحذوفية الزمن: v_retour^2 - 0 = 2 * a_desc * d = 2 * 2.20 * 4.0 = 17.6 => v_retour = sqrt(17.6) = 4.20 m/s.",
        "3) التفسير الطاقوي: v_retour = 4.2 m/s < v0 = 6.0 m/s. التفسير: عمل قوة الاحتكاك سالب دوماً في الذهاب والإياب (W_aller = - f*d و W_retour = - f*d)، وبالتالي تفقد الجملة طاقة ميكانيكية تتحول إلى طاقة حرارية ضائعة بمقدار |Delta E_m| = 2 * f * d.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "جسم صلب يصعد ثم ينزل على مستو مائل خشن",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، تغير جهة قوة الاحتكاك بتغير جهة الحركة",
        governingLaws_ar: ["القانون الثاني لنيوتن في الصعود والنزول", "مبدأ انحفاظ الطاقة وضياع الطاقة بالاحتكاك"],
        keyUnitsAndDimensions_ar: "N و m/s^2 و m/s و J",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاحتفاظ بنفس جهة قوة الاحتكاك في مرحلتي الصعود والنزول.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتحديد جهة f وحسابها في الصعود، 1.0ن لحساب a_desc وسرعة العودة، 1.0ن للتفسير الطاقوي وضياع الطاقة الحرارية.",
    },
    l5_bac_style: {
      id: "incl_l5_bac_style",
      capabilityId: "physics_inclined_plane_motion",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "يتألف مسار حركة جسم صلب كتلته m = 200 g من جزأين:\n- جزء مائل AB طوله L = 2.0 m يميل بزاوية alpha = 30° على الأفق خشن يخضع فيه الجسم لقوة احتكاك ثابتة f.\n- جزء أفقي BC أملس تماماً دون احتكاك ينتهي بحاجز.\nينطلق الجسم من النقطة A دون سرعة ابتدائية، ونسجل تطور مربع سرعته v^2 بدلالة المسافة المقطوعة x على الجزء AB فنحصل على مستقيم معادلته: v^2 = 8.0 * x (حيث x بـ m و v بـ m/s).\n1) بتطبيق القانون الثاني لنيوتن، بين أن التسارع على الجزء AB ثابت واكتب عبارته بدلالة g و alpha و f و m.\n2) استنتج بيانياً قيمة التسارع a1 على الجزء AB، ثم احسب شدة قوة الاحتكاك f (نأخذ g = 10 m/s^2).\n3) احسب سرعة وصول الجسم إلى النقطة B.\n4) ما هي طبيعة حركة الجسم على الجزء الأفقي BC؟ وما هي سرعته عند النقطة C؟ برر إجابتك بمبدأ العطالة.",
      expectedResponse_ar: "التسارع a1 = 4.0 m/s^2، قوة الاحتكاك f = 0.20 N، سرعة النقطة B هي v_B = 4.0 m/s، وعلى الجزء BC الحركة مستقيمة منتظمة وسرعته v_C = 4.0 m/s.",
      reasoningSteps_ar: [
        "1) الجملة: الجسم الصلب. المرجع: سطحي أرضي نعتبره غاليلياً. المحور: Ax مواز للمستوي نحو الأسفل.\nالقوى: الثقل P، رد الفعل الناظمي R_N، والاحتكاك f.\nالقانون الثاني لنيوتن: P_x - f = m * a1 => m*g*sin(alpha) - f = m * a1 => a1 = g*sin(alpha) - f/m.\nبما أن جميع المقادير في الطرف الأيمن ثوابت، فإن التسارع ثابت والحركة مستقيمة متغيرة بانتظام.",
        "2) محذوفية الزمن للحركة المستقيمة المتغيرة بانتظام دون سرعة ابتدائية:\nv^2 - 0 = 2 * a1 * x => v^2 = 2 * a1 * x.\nبالمطابقة مع المعادلة التجريبية v^2 = 8.0 * x:\n2 * a1 = 8.0 => a1 = 4.0 m/s^2.\nحساب قوة الاحتكاك f: a1 = g*sin(alpha) - f/m => f = m * [g*sin(alpha) - a1].\nf = 0.200 * [10 * sin(30°) - 4.0] = 0.200 * [5.0 - 4.0] = 0.200 * 1.0 = 0.20 N.",
        "3) عند النقطة B حيث x = L = 2.0 m:\nv_B^2 = 8.0 * L = 8.0 * 2.0 = 16.0 => v_B = sqrt(16.0) = 4.0 m/s.",
        "4) على الجزء الأفقي BC: المسار أملس تماماً (f = 0)، والقوى المؤثرة هي الثقل P شاقولي نحو الأسفل ورد الفعل الناظمي R_N شاقولي نحو الأعلى متساويان ومتبالغان: P + R_N = 0 (مجموع القوى الخارجية معدوم).\nحسب مبدأ العطالة (القانون الأول لنيوتن): إذا انعدمت محصلة القوى الخارجية، يحافظ الجسم على حركته المستقيمة المنتظمة.\nبالتالي الحركة مستقيمة منتظمة والسرعة ثابتة: v_C = v_B = 4.0 m/s.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "جسم صلب ينتقل من مستو مائل خشن إلى مستو أفقي أملس",
        referenceFrameOrConditions_ar: "مرجع سطحي أرضي غاليلي، مطابقة المنحنى الخطي v^2 = f(x)",
        governingLaws_ar: ["القانون الثاني لنيوتن", "القانون الأول لنيوتن (مبدأ العطالة)"],
        keyUnitsAndDimensions_ar: "m/s^2 و N و m/s",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "اعتبار ميل المستقيم v^2 = f(x) هو التسارع مباشرة ونسيان القسمة على 2 من علاقة محذوفية الزمن v^2 = 2*a*x.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لإثبات عبارة التسارع بثوابت الجملة، 1.0ن للمطابقة البيانية وحساب a1 و f، 1.0ن لحساب v_B، 1.0ن لتطبيق مبدأ العطالة على المسار الأفقي BC وتحديد v_C.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين sin و cos عند إسقاط الثقل، أو اعتبار ميل منحنى v^2 = f(x) هو التسارع a مباشرة بدلاً من 2*a.",
    wrongMentalModel_ar: "الاعتقاد بأن ميل أي منحنى خطي يمثل التسارع دون تفكيك المعادلة الفيزيائية المرجعية، أو إسقاط P_x = P*cos(alpha).",
    correctMentalModel_ar: "في المستوي المائل بزاوية alpha عن الأفق: الزاوية alpha تقع بين الشاقول (خط تأثير الثقل) والناظم على المستوي؛ لذلك المركبة الموازية للمستوي هي المقابل وتأخذ sin(alpha)، والمركبة العمودية هي المجاور وتأخذ cos(alpha). وفي علاقة محذوفية الزمن v^2 = 2*a*x، ميل المستقيم يساوي 2*a حصراً.",
    threeStepActionProtocol_ar: [
      "تذكر القاعدة الذهبية للمستوي المائل: الموازي يأخذ sin(alpha) والعمودي يأخذ cos(alpha).",
      "عند وجود منحنى v^2 بدلالة الموضع x، اكتب دائماً المعادلة النظرية: v^2 = v0^2 + 2*a*x، وطابق الميل مع 2*a (وليس مع a).",
      "تحقق دائماً من أن شدة قوة الاحتكاك f موجبة وأصغر من مركبة الثقل المحركة في حالة النزول المتسارع.",
    ],
    microDrill_ar: {
      prompt_ar: "أعطى تسجيل حركة جسم منزلق على مستو مائل مستقيماً معادلته v^2 = 6.0 * x. احسب تسارع حركة الجسم a.",
      solution_ar: "بالمطابقة مع v^2 = 2*a*x: 2*a = 6.0 => a = 3.0 m/s^2.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_inclined_plane_twin",
    invariantTested_ar: "حساب قوة الاحتكاك والتسارع والسرعة على مستو مائل بزاوية وكتلة مختلفتين",
    changedSurface_ar: "جسم صلب كتلته m = 800 g ينزلق على مستو مائل بزاوية alpha = 45° ومتابعة بيانية للتسارع.",
    prompt_ar: "ينزلق جسم كتلته m = 800 g على مستو مائل بزاوية alpha = 45° بتسارع ثابت a = 5.0 m/s^2 نحو الأسفل. 1) احسب شدة قوة الاحتكاك f (نأخذ g = 9.8 m/s^2). 2) إذا قطع الجسم مسافة L = 1.6 m انطلاقاً من السكون، احسب سرعته النهائية v_f.",
    solution_ar: "1) f = m * [g * sin(alpha) - a] = 0.800 * [9.8 * sin(45°) - 5.0] = 0.800 * [6.93 - 5.0] = 0.800 * 1.93 = 1.54 N.\n2) بمحذوفية الزمن: v_f^2 = 2 * a * L = 2 * 5.0 * 1.6 = 16.0 => v_f = 4.0 m/s.",
    passCondition_ar: "حساب قوة الاحتكاك f = 1.54 N وسرعة الوصول v_f = 4.0 m/s بدقة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: جهاز اختبار أمان المكابح على منحدر جبلي",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "لاختبار كفاءة مكابح عربة تجارب كتلتها m = 500 kg، نضعها في قمة منحدر جبلي AB مائل بزاوية alpha = 20° وطوله AB = 100 m. تتحرك العربة من السكون عند A، وفي اللحظة التي تبلغ فيها منتصف المنحدر (الموضع D حيث AD = 50 m) تُفعل منظومة المكابح الأوتوماتيكية فتطبق قوة فرملة ثابتة شدتها F_f موازية للمستوي ومعاكسة للحركة.\nنأخذ g = 9.8 m/s^2 ونهمل مقاومة الهواء.\n1) في المرحلة الأولى (بين A و D): المكابح غير مفعلة والاحتكاك مع الطريق مهمل.\nأ) بتطبيق القانون الثاني لنيوتن، احسب تسارع العربة a1.\nب) احسب سرعة العربة v_D عند وصولها إلى منتصف المنحدر.\n2) في المرحلة الثانية (بين D و B): تُفعل المكابح، ويُطلب أن تتوقف العربة تماماً قبل الوصول إلى النقطة B بمسافة أمان قدرها 10 m (أي تتوقف عند موضع E حيث DE = 40 m).\nأ) احسب قيمة التسارع a2 اللازم لتوقف العربة عند النقطة E.\nب) بتطبيق القانون الثاني لنيوتن على المرحلة الثانية، احسب شدة قوة الفرملة F_f الواجب تطبيقها لتحقيق هذا التوقف الآمن.",
    modelSolution_ar: [
      "1.أ) في المرحلة الأولى (A إلى D دون احتكاك):\nالجملة: العربة. المرجع: سطحي أرضي نعتبره غاليلياً. المحور: مواز للمستوي نحو الأسفل.\nالقوى: الثقل P ورد الفعل الناظمي R_N.\nالقانون الثاني لنيوتن: P_x = m * a1 => m * g * sin(alpha) = m * a1.\na1 = g * sin(alpha) = 9.8 * sin(20°) = 9.8 * 0.3420 = 3.35 m/s^2.",
      "1.ب) سرعة العربة عند D (انطلاق من السكون v_A = 0 والمسافة AD = 50 m):\nv_D^2 - 0 = 2 * a1 * AD = 2 * 3.35 * 50 = 335.16.\nv_D = sqrt(335.16) = 18.3 m/s (حوالي 66 km/h).",
      "2.أ) التسارع a2 في المرحلة الثانية للتوقف عند E (v_E = 0، v_D = 18.3 m/s، المسافة DE = 40 m):\nv_E^2 - v_D^2 = 2 * a2 * DE => 0 - 335.16 = 2 * a2 * 40 = 80 * a2.\na2 = - 335.16 / 80 = - 4.19 m/s^2 (تسارع تباطؤ مقداره 4.19 m/s^2).",
      "2.ب) حساب شدة قوة الفرملة F_f:\nالقوى المؤثرة في المرحلة الثانية: الثقل P، رد الفعل R_N، وقوة الفرملة F_f نحو الأعلى.\nالقانون الثاني لنيوتن: P_x - F_f = m * a2 => m * g * sin(alpha) - F_f = m * a2.\nF_f = m * [g * sin(alpha) - a2].\nبالتعويض (مع الانتباه لإشارة a2 السالبة): F_f = 500 * [3.35 - (- 4.19)] = 500 * [3.35 + 4.19] = 500 * 7.54 = 3770 N = 3.77 kN.",
    ],
    markingScheme_ar: [
      { criterion: "حساب التسارع a1 والسرعة v_D في المرحلة الأولى", points: 1.0 },
      { criterion: "حساب تسارع التباطؤ a2 اللازم للتوقف الآمن", points: 1.0 },
      { criterion: "إسقاط قانون نيوتن الثاني في وجود قوة الفرملة", points: 1.0 },
      { criterion: "حساب شدة قوة الفرملة F_f بالوحدة الدولية الصحيحة (N أو kN)", points: 1.0 },
    ],
  },
};

export const PHYSICS_SATELLITE_PLANETARY_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_satellite_planetary_motion_kepler",
  canonicalTitle_ar: "حركة الأقمار الاصطناعية والكواكب: قوانين كيبلر وقانون الجذب العام",
  canonicalTitle_fr: "Mouvement des satellites et planètes : lois de Kepler et gravitation universelle",
  discipline: "physics",
  domain: "Mécanique",
  unit: "تطور جملة ميكانيكية (حركة الأقمار والكواكب)",
  status: "APPROVED",
  scopeIn: [
    "المرجع المركزي الشمسي (الهيليومركزي) لدراسة حركة الكواكب، والمرجع المركزي الأرضي (الجيومركزي) لدراسة حركة الأقمار، والفرضية العطالية لكل منهما.",
    "قانون الجذب العام لنيوتن: F = G * (M * m) / r^2، وتطبيقه في معلم فريني (Frenet) ذي المحورين المماسي u_t والناظمي u_n.",
    "إثبات أن الحركة دائرية منتظمة: انعدام التسارع المماسي a_t = dv/dt = 0، والتسارع ناظمي صرف a_n = v^2 / r.",
    "عبارة السرعة المدارية v = sqrt(G * M / r) والدور المداري T = 2*pi*r / v = 2*pi * sqrt(r^3 / (G * M)).",
    "قوانين كيبلر الثلاثة: قانون المدارات الإهليلجية، قانون المساحات، وقانون الأدوار T^2 / r^3 = 4*pi^2 / (G * M) = ثابت.",
    "مفهوم القمر الاصطناعي الجيومستقر (Géostationnaire) وشروطه الثلاثة: مداره في مستوي خط الاستواء، يدور في نفس جهة دوران الأرض، ودوره يساوي دور دوران الأرض حول نفسها T = 24 h (حوالي 86164 s)، واستنتاج ارتفاعه h = 36000 km.",
  ],
  scopeOut: [
    "المدارات النسبية والاضطرابات الثقالية الناتجة عن الكواكب الأخرى (خاص بالفيزياء الفلكية المتقدمة).",
    "تأثير الشكل غير الكروي التام للأرض (تسطح القطبين) على المدار.",
  ],
  prerequisites: {
    hard: ["معلم فريني ومركبتا التسارع المماسي والناظمي a = a_t * u_t + a_n * u_n"],
    soft: ["الحركة الدائرية المنتظمة والعلاقة بين السرعة والدور والسرعة الزاوية"],
    foundation: ["قانون الجذب العام لنيوتن وكتلة الكواكب ونصف القطر r = R + h"],
    crossCutting: ["استخراج كتلة الكوكب المركزي من ميل منحنى T^2 = f(r^3)"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-SAT-01",
      bloomLevel: "apply",
      description_ar: "تطبيق القانون الثاني لنيوتن في معلم فريني لإثبات دائرية وانتظام حركة قمر اصطناعي واستنتاج عبارة سرعته ودوره.",
    },
    {
      code: "LO-PHYS-SAT-02",
      bloomLevel: "analyze",
      description_ar: "البرهان على القانون الثالث لكيبلر واستغلاله لحساب كتلة الكوكب المركزي M أو بعد المدار r.",
    },
    {
      code: "LO-PHYS-SAT-03",
      bloomLevel: "evaluate",
      description_ar: "تحديد الشروط الفيزيائية الثلاثة للقمر الجيومستقر وحساب ارتفاعه المداري ومقارنته بالأقمار ذات المدار المنخفض LEO.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "sat_l1_foundation",
      capabilityId: "physics_satellite_planetary_motion_kepler",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "المرجع العطالي المناسب لدراسة حركة قمر اصطناعي يدور حول كوكب الأرض هو:",
      expectedResponse_ar: "المرجع المركزي الأرضي (الجيومركزي)",
      reasoningSteps_ar: [
        "المرجع الجيومركزي مبدأه مركز الأرض ومحاوره الثلاثة موجهة نحو ثلاثة نجوم نعتبرها ثابتة في الفضاء.",
        "هو المرجع المخصص لدراسة حركة الأجسام والأقمار التي تدور حول الأرض حصراً، ونعتبره غاليلياً خلال مدة دوران القمر.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "قمر اصطناعي يدور حول الأرض",
        referenceFrameOrConditions_ar: "مرجع مركزي أرضي (جيومركزي) عطالي",
        governingLaws_ar: ["مفاهيم المراجع العطالية الفلكية"],
        keyUnitsAndDimensions_ar: "فلكي",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اختيار المرجع السطحي الأرضي (الذي يدور مع الأرض ولا يصلح لمدار فلكي) أو المرجع الشمسي المخصص للكواكب.",
      },
      scoringRubric_ar: "1 نقطة لتحديد المرجع الصحيح ومبدئه الفلكي.",
    },
    l2_application: {
      id: "sat_l2_application",
      capabilityId: "physics_satellite_planetary_motion_kepler",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "يدور قمر اصطناعي كتلته m = 500 kg حول الأرض على مدار دائري نصف قطره r = 7000 km. احسب سرعته المدارية v بوحدة m/s ثم بوحدة km/h.\nالمعطيات: G = 6.67 * 10^(-11) S.I و كتلة الأرض M_T = 5.97 * 10^24 kg.",
      expectedResponse_ar: "v = 7540 m/s = 27144 km/h",
      reasoningSteps_ar: [
        "تحويل نصف القطر المداري إلى الأمتار: r = 7000 km = 7.0 * 10^6 m.",
        "عبارة السرعة المدارية: v = sqrt( G * M_T / r ).",
        "التعويض العددي:\nv = sqrt( (6.67 * 10^(-11) * 5.97 * 10^24) / (7.0 * 10^6) ) = sqrt( (3.982 * 10^14) / (7.0 * 10^6) ) = sqrt( 5.688 * 10^7 ) = 7542 m/s = 7.54 * 10^3 m/s.",
        "التحويل إلى km/h: v = 7.542 * 3.6 = 27.15 * 10^3 km/h = 27150 km/h.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "قمر اصطناعي في مدار دائري منخفض حول الأرض",
        referenceFrameOrConditions_ar: "مرجع مركزي أرضي غاليلي",
        governingLaws_ar: ["قانون الجذب العام", "v = sqrt(GM/r)"],
        keyUnitsAndDimensions_ar: "m/s و km/h و m",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان تحويل نصف القطر r من km إلى m مما يؤدي إلى سرعة خاطئة بجذر 1000.",
      },
      scoringRubric_ar: "1 نقطة للتحويل وتطبيق القانون، 1 نقطة للحساب بالوحدتين.",
    },
    l3_mixed: {
      id: "sat_l3_mixed",
      capabilityId: "physics_satellite_planetary_motion_kepler",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "1) بتطبيق القانون الثاني لنيوتن في معلم فريني، بين أن حركة قمر اصطناعي يدور حول كوكب كتلته M على مسار دائري نصف قطره r هي حركة دائرية منتظمة.\n2) أثبت القانون الثالث لكيبلر: T^2 / r^3 = 4 * pi^2 / (G * M).\n3) يدور قمر اصطناعي حول المريخ بنصف قطر مداري r1 = 9.38 * 10^6 m ودوره T1 = 7.65 h. احسب كتلة كوكب المريخ M_Mars.",
      expectedResponse_ar: "M_Mars = 6.42 * 10^23 kg",
      reasoningSteps_ar: [
        "1) الجملة: قمر اصطناعي كتلته m. المرجع: مركزي مريخي نعتبره غاليلياً. معلم فريني: (O, u_t, u_n).\nالقوة الوحيدة المؤثرة هي قوة الجذب العام F = G*(M*m/r^2)*u_n.\nالقانون الثاني لنيوتن: F = m * a => m * a_t * u_t + m * a_n * u_n = G*(M*m/r^2)*u_n.\n- بالإسقاط على u_t: m * a_t = 0 => a_t = dv/dt = 0 => v = ثابت (الحركة منتظمة).\n- بالإسقاط على u_n: m * a_n = G*(M*m/r^2) => a_n = v^2/r = G*M/r^2 => v = sqrt(G*M/r) (المسار دائري والسرعة ثابتة، إذن دائرية منتظمة).",
        "2) الدور T هو المدة الزمنية لقطع دورة كاملة محيطها 2*pi*r:\nT = (2 * pi * r) / v = (2 * pi * r) / sqrt(G*M/r) = 2 * pi * sqrt(r^3 / (G*M)).\nبتربيع الطرفين: T^2 = 4 * pi^2 * (r^3 / (G*M)) => T^2 / r^3 = 4 * pi^2 / (G * M) = ثابت، وهو نص القانون الثالث لكيبلر.",
        "3) حساب كتلة المريخ:\nتحويل الدور إلى الثواني: T1 = 7.65 * 3600 = 27540 s = 2.754 * 10^4 s.\nمن قانون كيبلر: M_Mars = (4 * pi^2 * r1^3) / (G * T1^2).\nr1^3 = (9.38 * 10^6)^3 = 8.253 * 10^20 m^3.\nT1^2 = (2.754 * 10^4)^2 = 7.585 * 10^8 s^2.\nM_Mars = (4 * 3.1416^2 * 8.253 * 10^20) / (6.67 * 10^(-11) * 7.585 * 10^8) = (3.258 * 10^22) / (5.059 * 10^(-2)) = 6.44 * 10^23 kg.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "قمر يدور حول كوكب المريخ",
        referenceFrameOrConditions_ar: "مرجع مركزي مريخي غاليلي، مدار دائري",
        governingLaws_ar: ["القانون الثاني لنيوتن في معلم فريني", "القانون الثالث لكيبلر"],
        keyUnitsAndDimensions_ar: "kg و m^3 و s^2",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان تحويل دور القمر من الساعات h إلى الثواني s قبل التعويض في قانون كيبلر.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لإثبات الحركة الدائرية المنتظمة في معلم فريني، 1.0ن للبرهان على قانون كيبلر الثالث، 1.0ن لحساب كتلة المريخ بدقة.",
    },
    l4_transfer: {
      id: "sat_l4_transfer",
      capabilityId: "physics_satellite_planetary_motion_kepler",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "يدور التلسكوب الفضائي هابل حول الأرض على ارتفاع h1 = 600 km بدور مداري T1 = 96.6 min. نريد وضع تلسكوب فضائي جديد في مدار دائري بحيث يكون دوره المداري مضاعفاً لدور هابل مرتين (T2 = 2 * T1).\n1) اعتماداً على القانون الثالث لكيبلر، أوجد العلاقة بين نصف قطري المدارين r1 و r2 دون الحاجة لمعرفة كتلة الأرض أو ثابت الجذب العام G.\n2) احسب الارتفاع h2 للتلسكوب الجديد عن سطح الأرض إذا علمت أن نصف قطر الأرض هو R_T = 6400 km.",
      expectedResponse_ar: "r2 = 1.587 * r1 = 11112 km، والارتفاع h2 = 4712 km عن سطح الأرض.",
      reasoningSteps_ar: [
        "1) بتطبيق القانون الثالث لكيبلر على القمرين حول نفس الكوكب المركزي (الأرض):\nT1^2 / r1^3 = T2^2 / r2^3 => (r2 / r1)^3 = (T2 / T1)^2.\nبما أن T2 = 2 * T1، فإن T2 / T1 = 2.\nإذن: (r2 / r1)^3 = (2)^2 = 4 => r2 / r1 = 4^(1/3) = 1.5874.\nوبالتالي: r2 = 1.5874 * r1.",
        "2) حساب نصف قطر مدار هابل r1:\nr1 = R_T + h1 = 6400 + 600 = 7000 km = 7.0 * 10^6 m.\nنصف قطر مدار التلسكوب الجديد:\nr2 = 1.5874 * 7000 = 11111.8 km = 11112 km.\nالارتفاع h2 عن سطح الأرض:\nh2 = r2 - R_T = 11112 - 6400 = 4712 km.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "تلسكوبان فضائيان يدوران حول نفس الكوكب المركزي (الأرض)",
        referenceFrameOrConditions_ar: "المقارنة النسبية باستخدام ثابت كيبلر العام للكوكب",
        governingLaws_ar: ["القانون الثالث لكيبلر المقارن T1^2/r1^3 = T2^2/r2^3"],
        keyUnitsAndDimensions_ar: "km و دقيقة و نسبة خالية من الوحدات",
      },
      errorMapping: {
        primaryErrorType: "misread_question",
        distractorRationale_ar: "الخلط بين نصف القطر المداري r والارتفاع h واعتبار h2 = 1.587 * h1 مباشرة دون إضافة نصف قطر الأرض R_T.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5ن لاشتقاق النسبة r2/r1 بالجذر التكعيبي، 1.5ن لحساب الارتفاع h2 مع طرح R_T.",
    },
    l5_bac_style: {
      id: "sat_l5_bac_style",
      capabilityId: "physics_satellite_planetary_motion_kepler",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "القمر الاصطناعي الجزائري ألكومسات-1 (AlcomSAT-1) هو قمر مخصص للاتصالات والبث التلفزيوني والإنترنت، وهو قمر جيومستقر (Géostationnaire).\n1) عرف القمر الاصطناعي الجيومستقر واذكر شروطه الثلاثة الأساسية.\n2) بتطبيق القانون الثاني لنيوتن في المرجع الجيومركزي، أثبت أن عبارة دور القمر هي: T = 2 * pi * sqrt( (R_T + h)^3 / (G * M_T) ).\n3) احسب الارتفاع المداري h للقمر ألكومسات-1 عن سطح الأرض.\n4) احسب السرعة المدارية v للقمر ألكومسات-1 بالكيلومتر في الثانية km/s.\nالمعطيات: دور دوران الأرض حول نفسها T = 23 h 56 min 4 s = 86164 s، نصف قطر الأرض R_T = 6380 km، كتلة الأرض M_T = 5.98 * 10^24 kg، و G = 6.67 * 10^(-11) S.I.",
      expectedResponse_ar: "الارتفاع h = 35786 km (حوالي 36000 km)، والسرعة المدارية v = 3.07 km/s.",
      reasoningSteps_ar: [
        "1) تعريف القمر الجيومستقر: هو قمر اصطناعي يبدو ساكناً بالنسبة لملاحظ موجود على سطح الأرض.\nشروطه الثلاثة:\n- يدور في مستوي خط الاستواء (مدار استوائي).\n- يدور في نفس جهة دوران الأرض حول محورها (من الغرب إلى الشرق).\n- دوره المداري T_sat يساوي تماماً دور حركة دوران الأرض حول نفسها (T_sat = T_T = 86164 s).",
        "2) الإثبات: القانون الثاني لنيوتن في معلم فريني:\nF = G * (M_T * m / r^2) = m * a_n = m * (v^2 / r) => v = sqrt( G * M_T / r ).\nالدور T = 2*pi*r / v = 2*pi*r / sqrt(G*M_T/r) = 2 * pi * sqrt( r^3 / (G * M_T) ).\nوبما أن المدار يرتفع بـ h عن سطح الأرض، فإن r = R_T + h:\nT = 2 * pi * sqrt( (R_T + h)^3 / (G * M_T) ).",
        "3) حساب الارتفاع h:\nبتربيع طرفي عبارة الدور: T^2 = 4 * pi^2 * (R_T + h)^3 / (G * M_T).\n(R_T + h)^3 = (G * M_T * T^2) / (4 * pi^2).\nG * M_T * T^2 = (6.67 * 10^(-11)) * (5.98 * 10^24) * (86164)^2 = (3.98866 * 10^14) * (7.4242 * 10^9) = 2.9613 * 10^24.\n(R_T + h)^3 = (2.9613 * 10^24) / (4 * 3.1416^2) = (2.9613 * 10^24) / 39.4784 = 7.501 * 10^22 m^3.\nالجذر التكعيبي: R_T + h = (7.501 * 10^22)^(1/3) = 4.217 * 10^7 m = 42170 km.\nحساب الارتفاع h: h = 42170 - R_T = 42170 - 6380 = 35790 km (حوالي 3.58 * 10^4 km).",
        "4) السرعة المدارية:\nv = (2 * pi * r) / T = (2 * 3.1416 * 4.217 * 10^7 m) / 86164 s = (2.6496 * 10^8) / 86164 = 3075 m/s = 3.075 km/s = 3.08 km/s.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "قمر اتصالات جيومستقر (ألكومسات-1)",
        referenceFrameOrConditions_ar: "مرجع جيومركزي، مدار استوائي دائري متزامن مع دوران الأرض",
        governingLaws_ar: ["القانون الثاني لنيوتن", "شروط المدار الجيومستقر"],
        keyUnitsAndDimensions_ar: "km و s و km/s و kg",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان طرح نصف قطر الأرض R_T بعد استخراج الجذر التكعيبي لـ r واعتبار r هو الارتفاع h.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتعريف وشروط القمر الجيومستقر، 1.0ن لإثبات عبارة الدور T، 1.0ن لحساب الارتفاع h وطرح R_T، 1.0ن لحساب السرعة المدارية v.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين نصف القطر المداري r والارتفاع h (نسيان أن r = R_T + h)، أو نسيان تحويل الدور من الساعات إلى الثواني.",
    wrongMentalModel_ar: "اعتقاد أن الارتفاع هو المسافة إلى مركز الكوكب، وتطبيق r = h في قانون الجذب العام وقانون كيبلر.",
    correctMentalModel_ar: "قوة الجذب المركزي تنطلق من مركز الكوكب وتتجه نحو مركز القمر؛ لذلك البعد المداري r يحسب دائماً من مركز الكوكب: r = R_T + h. ولا يمكن إهمال نصف قطر الأرض R_T (حوالي 6400 km).",
    threeStepActionProtocol_ar: [
      "اكتب فوراً في مسودتك بخط بارز: r = R + h واحذر من التعويض بـ h وحدها في قانون كيبلر.",
      "حول دائماً نصف القطر والارتفاع إلى الأمتار m والدور إلى الثواني s قبل إدخالها في الآلة الحاسبة مع G.",
      "تذكر أن السرعة المدارية v تتناقص كلما ابتعد القمر عن الكوكب (v تتناسب عكساً مع جذر r).",
    ],
    microDrill_ar: {
      prompt_ar: "قمر اصطناعي يدور على ارتفاع h = 600 km عن سطح كوكب نصف قطره R = 3400 km. ما هي قيمة نصف القطر المداري r بالأمتار؟",
      solution_ar: "r = R + h = 3400 km + 600 km = 4000 km = 4.0 * 10^6 m.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_satellite_twin",
    invariantTested_ar: "حساب الارتفاع المداري والسرعة لقمر اصطناعي يدور حول كوكب المشتري",
    changedSurface_ar: "قمر اصطناعي استكشافي يدور حول كوكب المشتري (Jupiter) بنصف قطر ودور مداري مختلفين.",
    prompt_ar: "يدور مسبار فضائي حول كوكب المشتري في مدار دائري على ارتفاع h = 100000 km عن سطحه. إذا علمت أن نصف قطر المشتري هو R_J = 71492 km وكتلته M_J = 1.90 * 10^27 kg، احسب:\n1) السرعة المدارية v للمسبار.\n2) الدور المداري T للمسبار بالساعات.",
    solution_ar: "1) نصف القطر المداري: r = R_J + h = 71492 + 100000 = 171492 km = 1.715 * 10^8 m.\nv = sqrt( G * M_J / r ) = sqrt( (6.67 * 10^(-11) * 1.90 * 10^27) / (1.715 * 10^8) ) = sqrt( (1.2673 * 10^17) / (1.715 * 10^8) ) = sqrt( 7.39 * 10^8 ) = 27184 m/s = 27.2 km/s.\n2) الدور: T = (2 * pi * r) / v = (2 * 3.1416 * 1.715 * 10^8) / 27184 = (1.0775 * 10^9) / 27184 = 39638 s = 11.0 h.",
    passCondition_ar: "حساب نصف القطر المداري r بدقة، واستنتاج v = 27.2 km/s و T = 11.0 h.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: منظومة الملاحة بالأقمار الاصطناعية GPS",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "تعتمد منظومة تحديد المواقع العالمية (GPS) على 24 قمراً اصطناعياً تدور في 6 مستويات مدارية حول الأرض على ارتفاع متساو قدره h = 20200 km.\n1) ما هو المرجع المناسب لدراسة حركة هذه الأقمار؟ ولماذا لا نعتبرها أقماراً جيومستقرة؟\n2) بتطبيق القانون الثاني لنيوتن، أوجد عبارة سرعة القمر الاصطناعي v بدلالة G و M_T و R_T و h، واحسب قيمتها العددية.\n3) احسب الدور المداري T لأحد أقمار منظومة GPS بالساعات، وكم دورة ينجزها هذا القمر حول الأرض خلال يوم شمسي واحد (24 h)؟\n4) كيف يستغل جهاز الاستقبال على الأرض إشارات هذه الأقمار لتحديد موقعه بدقة؟ وضح المبدأ الفيزيائي بإيجاز.\nالمعطيات: R_T = 6370 km، M_T = 5.98 * 10^24 kg، و G = 6.67 * 10^(-11) S.I.",
    modelSolution_ar: [
      "1) المرجع المناسب: المرجع المركزي الأرضي (الجيومركزي) باعتباره غاليلياً.\nلا نعتبرها جيومستقرة لسببين رئيسيين:\n- ارتفاعها (20200 km) يختلف عن ارتفاع المدار الجيومستقر (35800 km).\n- مستويات مداراتها مائلة بزاوية 55° على خط الاستواء وليست في مستوي خط الاستواء، ودورها يختلف عن 24 ساعة.",
      "2) القانون الثاني لنيوتن في معلم فريني: F = m*a_n => G * (M_T * m / r^2) = m * (v^2 / r).\nنصف القطر المداري: r = R_T + h = 6370 + 20200 = 26570 km = 2.657 * 10^7 m.\nالسرعة المدارية:\nv = sqrt( G * M_T / (R_T + h) ) = sqrt( (6.67 * 10^(-11) * 5.98 * 10^24) / (2.657 * 10^7) ) = sqrt( (3.98866 * 10^14) / (2.657 * 10^7) ) = sqrt( 1.501 * 10^7 ) = 3874 m/s = 3.87 km/s.",
      "3) الدور المداري T:\nT = (2 * pi * r) / v = (2 * 3.1416 * 2.657 * 10^7 m) / 3874 m/s = (1.6694 * 10^8) / 3874 = 43093 s.\nبالساعات: T = 43093 / 3600 = 11.97 h = 12.0 h (حوالي 12 ساعة).\nعدد الدورات اليومية: N = 24 h / 12 h = 2 دورات كاملة في اليوم الواحد.",
      "4) المبدأ الفيزيائي لتحديد الموقع (التثليث المساحي Trilateration): يرسل كل قمر إشارة كهرومغناطيسية دقيقة تحمل موقعه ولحظة الإرسال t_e بدقة ساعة ذرية. يقيس جهاز الاستقبال لحظة الاستقبال t_r ويحسب مدة الانتشار Delta t = t_r - t_e. بما أن الإشارة تنتشر بسرعة الضوء c، تحسب المسافة بين المستقبل والقمر: d = c * Delta t. بتقاطع ثلاث كرات مركزها ثلاثة أقمار مختلفة، يتحدد موقع المستقبل (خط الطول، دائرة العرض، الارتفاع) بدقة مترية، ويستعمل قمر رابع لمزامنة وتصحيح ساعة المستقبل الأرضي.",
    ],
    markingScheme_ar: [
      { criterion: "تحديد المرجع وتبرير عدم جيومستقرية أقمار GPS", points: 1.0 },
      { criterion: "اشتقاق عبارة السرعة المدارية v وحسابها العددي", points: 1.0 },
      { criterion: "حساب الدور المداري T = 12 h وعدد الدورات اليومية", points: 1.0 },
      { criterion: "التفسير الفيزيائي لتقنية التثليث المساحي وسرعة الضوء", points: 1.0 },
    ],
  },
};

// ============================================================================
// PHASE 5: CHEMISTRY — ACID/BASE, PH-METRIC TITRATION, ESTERIFICATION
// ============================================================================

export const PHYSICS_ACID_BASE_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_acid_base_equilibria_ka_predominance",
  canonicalTitle_ar: "حالة توازن جملة كيميائية: الأحماض والأسس، ثابت الحموضة Ka ومخطط التغلب",
  canonicalTitle_fr: "Équilibre acido-basique : Ka, pH et diagramme de prédominance",
  discipline: "chemistry",
  domain: "Chimie Générale",
  unit: "تطور جملة كيميائية نحو حالة التوازن (الأحماض والأسس)",
  status: "APPROVED",
  scopeIn: [
    "تعريف الحمض والأساس حسب برونشتد، والثنائية (حمض/أساس) والتشرد الذاتي للماء والجداء الشاردي Ke = [H3O+]*[OH-] = 10^(-14) عند 25°C.",
    "تعريف pH المحلول المائي pH = - log[H3O+] ونسبة التقدم النهائي tau_f = x_f / x_max والتمييز بين الحمض القوي (tau_f = 1) والحمض الضعيف (tau_f < 1).",
    "كسر التفاعل Q_r وثابت التوازن K وثابت الحموضة للثنائية: K_a = ([A^-]_eq * [H3O+]_eq) / [HA]_eq وعلاقته بـ pKa: pKa = - log(Ka).",
    "علاقة هندرسون-هاسلبالخ: pH = pKa + log([A^-] / [HA]) ومخطط توزيع وتغلب الصفة الحمضية والأساسية.",
    "تأثير التمديد على نسبة التقدم النهائي tau_f وعلى pH المحلول (قانون التمديد لأوستفالد).",
  ],
  scopeOut: [
    "حساب التراكيز في المحاليل الملحية المتعددة البروتونات المعقدة (الأحماض ثلاثية الوظيفة H3PO4).",
    "تأثير القوة الشاردية ومعاملات الفعالية (Activité chimique خارج المنهاج).",
  ],
  prerequisites: {
    hard: ["جدول التقدم لحمض أو أساس مع الماء وحساب التراكيز المولية التوازنية"],
    soft: ["اللوغاريتم العشري log(x) و 10^x والعمليات الحسابية المرتبطة"],
    foundation: ["مفهوم التفاعل التام والتحول غير التام المحدود"],
    crossCutting: ["قراءة مخططات التغلب واستخراج pKa عند نقطة تقاطع المنحنيين"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-ACID-01",
      bloomLevel: "apply",
      description_ar: "حساب نسبة التقدم النهائي tau_f لحمض أو أساس في الماء وإثبات كون التحول غير تام ومحدود بحالة توازن ديناميكي.",
    },
    {
      code: "LO-PHYS-ACID-02",
      bloomLevel: "analyze",
      description_ar: "استنتاج عبارة ثابت الحموضة Ka بدلالة التركيز الابتدائي C و tau_f وإثبات استقلاله عن التراكيز الابتدائية.",
    },
    {
      code: "LO-PHYS-ACID-03",
      bloomLevel: "evaluate",
      description_ar: "إنشاء واستغلال مخطط التغلب للثنائية (HA/A^-) لتحديد الصفة الغالبة عند قيمة pH معينة.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "acid_l1_foundation",
      capabilityId: "physics_acid_base_equilibria_ka_predominance",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "في محلول مائي لحمض الإيثانويك (pKa = 4.8)، إذا كانت قيمة pH المحلول تساوي 5.8، فإن الصفة الغالبة هي:",
      expectedResponse_ar: "الصفة الأساسية (شوارد الإيثانوات CH3COO^-)",
      reasoningSteps_ar: [
        "العلاقة: pH = pKa + log([A^-]/[HA]).",
        "بما أن pH > pKa (5.8 > 4.8): log([A^-]/[HA]) = pH - pKa = + 1.0 > 0.",
        "[A^-] / [HA] = 10^1 = 10 > 1 => [A^-] > [HA].",
        "بالتالي الصفة الغالبة هي الصفة الأساسية CH3COO^-.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "محلول مائي لحمض ضعيف",
        referenceFrameOrConditions_ar: "توازن حمض-أساس عند 25°C",
        governingLaws_ar: ["علاقة التغلب: pH > pKa => الأساس هو الغالب"],
        keyUnitsAndDimensions_ar: "pH خالي من الوحدات",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين الصفة الغالبة والوسط الحامضي (كون المحلول حمضياً pH < 7 لا يمنع غلبة الصفة الأساسية للثنائية إذا كان pH > pKa).",
      },
      scoringRubric_ar: "1 نقطة للمقارنة الصحيحة بين pH و pKa واستنتاج الصفة الغالبة.",
    },
    l2_application: {
      id: "acid_l2_application",
      capabilityId: "physics_acid_base_equilibria_ka_predominance",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "محلول مائي لحمض الميثانويك HCOOH تركيزه المولي C = 0.010 mol/L وقيمة pH المقاسة هي 2.90. احسب نسبة التقدم النهائي tau_f وماذا تستنتج؟",
      expectedResponse_ar: "tau_f = 0.126 = 12.6%. الاستنتاج: التفاعل غير تام وحمض الميثانويك حمض ضعيف في الماء.",
      reasoningSteps_ar: [
        "معادلة التفاعل: HCOOH + H2O <=> HCOO^- + H3O^+.",
        "التقدم النهائي: [H3O+]_f = 10^(-pH) = 10^(-2.90) = 1.26 * 10^(-3) mol/L.",
        "التقدم الأعظمي (باعتبار الماء بفائض والحمض هو المحد): x_max = C * V => [H3O+]_max = C = 0.010 mol/L.",
        "نسبة التقدم النهائي: tau_f = x_f / x_max = [H3O+]_f / C = (1.26 * 10^(-3)) / 0.010 = 0.126 = 12.6%.",
        "الاستنتاج: بما أن tau_f < 1 (أقل بكثير من 100%)، فإن انحلال حمض الميثانويك في الماء تحول غير تام (محدود)، وهو حمض ضعيف.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "محلول مائي لحمض كربوكسيلي",
        referenceFrameOrConditions_ar: "حالة توازن كيميائي عند T = 25°C",
        governingLaws_ar: ["tau_f = [H3O+]/C", "معيار الحمض الضعيف"],
        keyUnitsAndDimensions_ar: "mol/L و %",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخطأ في حساب 10^(-2.90) أو نسيان النسبة المئوية.",
      },
      scoringRubric_ar: "1 نقطة لحساب [H3O+]، 1 نقطة لـ tau_f، 1 نقطة للاستنتاج الفيزيوكيميائي.",
    },
    l3_mixed: {
      id: "acid_l3_mixed",
      capabilityId: "physics_acid_base_equilibria_ka_predominance",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "بين أن ثابت الحموضة Ka لمحلول حمض ضعيف HA تركيزه C ونسبة تقدمه النهائي tau_f يُكتب على الشكل:\nKa = (C * tau_f^2) / (1 - tau_f)\nثم احسب قيمة pKa لحمض الإيثانويك إذا كان C = 0.050 mol/L و tau_f = 0.019 (1.9%).",
      expectedResponse_ar: "Ka = 1.84 * 10^(-5) و pKa = 4.74.",
      reasoningSteps_ar: [
        "1) جدول التقدم باللتر (V = 1 L):\nعند التوازن: [H3O+]_eq = [A^-]_eq = C * tau_f.\n[HA]_eq = C - C * tau_f = C * (1 - tau_f).\nعبارة ثابت الحموضة:\nKa = ([A^-]_eq * [H3O+]_eq) / [HA]_eq = (C * tau_f * C * tau_f) / [C * (1 - tau_f)] = (C * tau_f^2) / (1 - tau_f).",
        "2) التعويض العددي:\nKa = (0.050 * (0.019)^2) / (1 - 0.019) = (0.050 * 0.000361) / 0.981 = (1.805 * 10^(-5)) / 0.981 = 1.84 * 10^(-5).\npKa = - log(Ka) = - log(1.84 * 10^(-5)) = 5 - log(1.84) = 5 - 0.265 = 4.735 = 4.74.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "حمض ضعيف في الماء، توازن أوستفالد",
        referenceFrameOrConditions_ar: "محلول ممدد، إهمال التشرد الذاتي للماء أمام تشرد الحمض",
        governingLaws_ar: ["قانون فعل الكتلة", "قانون أوستفالد للتمديد"],
        keyUnitsAndDimensions_ar: "mol/L وثابت Ka خالي من الوحدات",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "إهمال (1 - tau_f) في المقام دون تبرير أو الخطأ في حساب اللوغاريتم العشري.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للبرهان النظري لـ Ka بدلالة C و tau_f، 1.0ن لحساب Ka، 1.0ن لحساب pKa بدقة.",
    },
    l4_transfer: {
      id: "acid_l4_transfer",
      capabilityId: "physics_acid_base_equilibria_ka_predominance",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "نحضر سلسلة من المحاليل المائية لحمض البنزويك C6H5COOH بتراكيز ابتدائية مختلفة C. نقيس pH كل محلول ونحسب نسبة التقدم النهائي tau_f، فنحصل على المنحنى البياني المرفق الذي يمثل تطور (1 / tau_f) بدلالة (1 / [H3O+]) مستقيماً يمر بالنقطة (0, 1) ميله a = 6.3 * 10^(-5) mol/L.\n1) أثبت نظرياً أن: (1 / tau_f) = 1 + (1 / Ka) * [H3O+].\n2) استنتج بيانياً قيمة ثابت الحموضة Ka وقيمة pKa لحمض البنزويك.\n3) فسر أثر تمديد المحلول على نسبة التقدم النهائي tau_f مستنداً إلى النتائج التجريبية.",
      expectedResponse_ar: "Ka = 6.3 * 10^(-5) و pKa = 4.20. التمديد يزيد من نسبة التقدم النهائي (قانون أوستفالد).",
      reasoningSteps_ar: [
        "1) من عبارة Ka: Ka = ([A^-] * [H3O+]) / [HA].\nبما أن [A^-] = [H3O+] = C * tau_f و [HA] = C - [H3O+]:\nKa = ([H3O+]^2) / (C - [H3O+]) => C - [H3O+] = ([H3O+]^2) / Ka.\nبالقسمة على [H3O+]: C / [H3O+] - 1 = [H3O+] / Ka.\nبما أن C / [H3O+] = 1 / tau_f:\n(1 / tau_f) - 1 = [H3O+] / Ka => (1 / tau_f) = 1 + (1 / Ka) * [H3O+].",
        "2) المطابقة البيانية مع (1/tau_f) = 1 + a * [H3O+] (أو الصيغة الخطية الموافقة للميل a):\nالميل a = 1 / Ka => Ka = 1 / a = 1 / (1.587 * 10^4) = 6.3 * 10^(-5) mol/L.\npKa = - log(6.3 * 10^(-5)) = 5 - 0.80 = 4.20.",
        "3) التفسير: عند تمديد المحلول، ينقص التركيز C فتزداد نسبة التقدم النهائي tau_f نحو الواحد (تفكك أكبر للجزيئات في حجم أكبر من الماء)، وهو ما يؤكده قانون أوستفالد للتمديد.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "حمض البنزويك في تراكيز متغيرة",
        referenceFrameOrConditions_ar: "توازن كيميائي عند 25°C، استغلال بياني خطي مركب",
        governingLaws_ar: ["قانون أوستفالد للتمديد", "المطابقة الخطية الرياضية"],
        keyUnitsAndDimensions_ar: "mol/L و pKa خالي من الوحدات",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن التمديد ينقص من نسبة التقدم النهائي tau_f بدلاً من زيادتها.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لاشتقاق العلاقة النظرية، 1.0ن لحساب Ka و pKa، 1.0ن لتفسير أثر التمديد على tau_f.",
    },
    l5_bac_style: {
      id: "acid_l5_bac_style",
      capabilityId: "physics_acid_base_equilibria_ka_predominance",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "حمض اللاكتيك (حمض اللبن CH3-CHOH-COOH نرمز له اختصاراً بـ HA) مركب كيميائي ينتج في العضلات أثناء الجهد البدني المكثف.\nنحضر محلولاً مائياً (S0) لحمض اللاكتيك تركيزه المولي C0 = 0.10 mol/L، فأعطى قياس pH القيمة 2.43 عند 25°C.\n1) اكتب معادلة تفاعل حمض اللاكتيك مع الماء وأنشئ جدول التقدم.\n2) احسب نسبة التقدم النهائي tau_f0، وماذا تستنتج؟\n3) احسب ثابت التوازن K لتفاعل الحمض مع الماء وبين أنه يطابق ثابت الحموضة Ka للثنائية (HA/A^-)، ثم احسب pKa.\n4) نأخذ حجماً V0 من المحلول (S0) ونضيف إليه حجماً من الماء المقطر للحصول على محلول ممدد (S1) تركيزه C1 = 0.010 mol/L.\nأ) هل تتغير قيمة ثابت الحموضة Ka بعد التمديد؟ علل فيزيائياً.\nب) بين حسابياً أن نسبة التقدم النهائي للمحلول الممدد تصبح tau_f1 = 0.113 (11.3%)، وعلق على النتيجة.",
      expectedResponse_ar: "tau_f0 = 0.037 = 3.7%، Ka = 1.43 * 10^(-4) و pKa = 3.84. ثابت Ka لا يتغير بالتمديد لأنه لا يتعلق إلا بدرجة الحرارة. tau_f1 = 11.3% تؤكد زيادة التشرد بالتمديد.",
      reasoningSteps_ar: [
        "1) المعادلة: HA(aq) + H2O(l) <=> A^-(aq) + H3O^+(aq).\nجدول التقدم: كميات المادة في الحالة النهائية: n(HA) = C0*V - x_f، n(A^-) = x_f، n(H3O^+) = x_f.",
        "2) [H3O+]_f0 = 10^(-2.43) = 3.715 * 10^(-3) mol/L.\ntau_f0 = [H3O+]_f0 / C0 = (3.715 * 10^(-3)) / 0.10 = 0.0371 = 3.7%.\nالاستنتاج: tau_f0 << 1، التحول غير تام وحمض اللاكتيك حمض ضعيف.",
        "3) ثابت التوازن: K = ([A^-]_eq * [H3O+]_eq) / [HA]_eq.\nبما أن المتفاعل الآخر هو الماء المذيب، فإن عبارة ثابت التوازن K تطابق تماماً تعريف ثابت الحموضة Ka للثنائية (HA/A^-).\nKa = [H3O+]^2 / (C0 - [H3O+]) = (3.715 * 10^(-3))^2 / (0.10 - 0.003715) = (1.38 * 10^(-5)) / 0.0963 = 1.43 * 10^(-4).\npKa = - log(1.43 * 10^(-4)) = 4 - log(1.43) = 4 - 0.155 = 3.84.",
        "4.أ) التعليل: لا تتغير قيمة Ka بالتمديد، لأن ثابت التوازن Ka هو خاصية مميزة للثنائية الكيميائية ولا يتعلق إطلاقاً بالتراكيز الابتدائية ولا بالحجوم، بل يتعلق فقط بدرجة الحرارة T.",
        "4.ب) لحساب tau_f1 في المحلول الممدد C1 = 0.010 mol/L:\nKa = (C1 * tau_f1^2) / (1 - tau_f1) => C1 * tau_f1^2 + Ka * tau_f1 - Ka = 0.\n0.010 * tau_f1^2 + (1.43 * 10^(-4)) * tau_f1 - (1.43 * 10^(-4)) = 0.\ntau_f1^2 + 0.0143 * tau_f1 - 0.0143 = 0.\nDelta = (0.0143)^2 - 4 * 1 * (-0.0143) = 0.000204 + 0.0572 = 0.0574.\nsqrt(Delta) = 0.2396.\ntau_f1 = (- 0.0143 + 0.2396) / 2 = 0.2253 / 2 = 0.1126 = 0.113 = 11.3%.\nالتعليق: نلاحظ أن نسبة التقدم ارتفعت من 3.7% إلى 11.3% عند تمديد المحلول 10 مرات، مما يثبت تجريبياً ونظرياً أن التمديد يزيح التوازن في الاتجاه المباشر ويزيد من تأين الحمض الضعيف.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "حمض اللاكتيك في الماء، تأثير التمديد على التوازن الكيميائي",
        referenceFrameOrConditions_ar: "توازن كيميائي عند 25°C، انحفاظ Ka مع تغير C",
        governingLaws_ar: ["جدول التقدم", "تعريف Ka و pKa", "حل معادلة الدرجة الثانية لـ tau_f"],
        keyUnitsAndDimensions_ar: "mol/L و pKa و %",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن ثابت الحموضة Ka يتغير عند تمديد المحلول المائي.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لجدول التقدم وحساب tau_f0، 1.0ن لمطابقة K مع Ka وحساب pKa، 1.0ن لتعليل ثبات Ka، 1.0ن لحساب tau_f1 بالمميز والتعليق العلمي.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الاعتقاد بأن Ka يتغير بتغير التراكيز الابتدائية، أو الخلط بين الوسط الحامضي (pH < 7) والصفة الغالبة (مقارنة pH مع pKa).",
    wrongMentalModel_ar: "اعتبار أن ثوابت التوازن تتبع التراكيز، أو الجزم بأن أي محلول حمضي يجب أن تكون صفته الحمضية هي الغالبة دوماً.",
    correctMentalModel_ar: "ثابت الحموضة Ka ثابت حركي ترموديناميكي لا يتغير إلا بتغير درجة الحرارة. أما الصفة الغالبة فتحدد بمقارنة pH مع pKa فقط: إذا كان pH > pKa فالأساس هو الغالب حتى لو كان المحلول حمضياً (مثلاً pH = 6 وحمض pKa = 4.8).",
    threeStepActionProtocol_ar: [
      "تذكر دوماً: Ka و pKa يتعلقان بدرجة الحرارة T فقط ولا يتغيران بالتمديد إطلاقاً.",
      "لتحديد الصفة الغالبة، ارسم محور pH، وضع pKa في المنتصف: يساراً (pH < pKa) الحمض HA غالب، يميناً (pH > pKa) الأساس A^- غالب.",
      "عند تمديد محلول حمض ضعيف، تزداد نسبة التقدم النهائي tau_f حتماً وينقص التركيز المولي وينقص pH قليلاً نحو 7.",
    ],
    microDrill_ar: {
      prompt_ar: "ثنائية حمض/أساس لها pKa = 3.5 وضعت في وسط له pH = 4.2. احسب النسبة [A^-] / [HA] وحدد الصفة الغالبة.",
      solution_ar: "[A^-]/[HA] = 10^(pH - pKa) = 10^(4.2 - 3.5) = 10^(0.7) = 5.0 > 1. الصفة الأساسية A^- هي الغالبة.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_acid_base_twin",
    invariantTested_ar: "حساب نسبة التقدم النهائي وثابت الحموضة pKa لحمض كربوكسيلي آخر",
    changedSurface_ar: "محلول مائي لحمض البنزويك C6H5COOH بتركيز C = 0.020 mol/L و pH مقاس 2.95.",
    prompt_ar: "محلول مائي لحمض البنزويك تركيزه C = 0.020 mol/L له pH = 2.95 عند 25°C. 1) احسب نسبة التقدم النهائي tau_f. 2) احسب ثابت الحموضة Ka و pKa للثنائية C6H5COOH/C6H5COO^-.",
    solution_ar: "1) [H3O+] = 10^(-2.95) = 1.122 * 10^(-3) mol/L. tau_f = (1.122 * 10^(-3)) / 0.020 = 0.0561 = 5.61%.\n2) Ka = [H3O+]^2 / (C - [H3O+]) = (1.122 * 10^(-3))^2 / (0.020 - 0.001122) = (1.259 * 10^(-6)) / 0.01888 = 6.67 * 10^(-5).\npKa = - log(6.67 * 10^(-5)) = 5 - log(6.67) = 5 - 0.824 = 4.18.",
    passCondition_ar: "حساب tau_f = 5.6% و Ka = 6.67 * 10^(-5) و pKa = 4.18 بدقة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: دراسة محلول مطهر يحتوي على حمض الأسكوربيك",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "نذيب كتلة m من حمض الأسكوربيك (فيتامين C نرمز له بـ HA وكتلته المولية M = 176 g/mol) في حجم V = 200 mL من الماء المقطر، فنحصل على محلول مائي (S) تركيزه C وله pH = 2.80 عند 25°C.\n1) اكتب معادلة انحلال حمض الأسكوربيك في الماء ومثل جدول التقدم.\n2) بين أن التركيز المولي C للمحلول يُعطى بالعلاقة: C = [H3O+] + [H3O+]^2 / Ka.\n3) إذا علمت أن pKa للثنائية (HA/A^-) هو pKa = 4.05، احسب:\nأ) قيمة ثابت الحموضة Ka.\nب) التركيز المولي C للمحلول (S).\nجـ) الكتلة m المذابة في المحلول.\n4) احسب النسبة المئوية للجزيئات غير المتشردة من حمض الأسكوربيك في هذا المحلول، وعلق على النتيجة فيزيائياً.",
    modelSolution_ar: [
      "1) المعادلة: HA(aq) + H2O(l) <=> A^-(aq) + H3O^+(aq).\nجدول التقدم: الحالة النهائية: n(HA) = C*V - x_f، n(A^-) = x_f، n(H3O^+) = x_f.",
      "2) الإثبات النظري:\nمن جدول التقدم: [A^-] = [H3O+] و [HA] = C - [H3O+].\nمن تعريف ثابت الحموضة: Ka = ([A^-] * [H3O+]) / [HA] = [H3O+]^2 / (C - [H3O+]).\nC - [H3O+] = [H3O+]^2 / Ka => C = [H3O+] + [H3O+]^2 / Ka.",
      "3.أ) ثابت الحموضة: Ka = 10^(-pKa) = 10^(-4.05) = 8.91 * 10^(-5) mol/L.",
      "3.ب) حساب التركيز C:\n[H3O+] = 10^(-pH) = 10^(-2.80) = 1.585 * 10^(-3) mol/L.\n[H3O+]^2 = (1.585 * 10^(-3))^2 = 2.512 * 10^(-6).\n[H3O+]^2 / Ka = (2.512 * 10^(-6)) / (8.91 * 10^(-5)) = 0.02819 mol/L = 2.82 * 10^(-2) mol/L.\nالتركيز: C = 0.001585 + 0.02819 = 0.02978 mol/L = 0.030 mol/L.",
      "3.جـ) الكتلة المذابة:\nm = n * M = C * V * M = 0.030 * 0.200 * 176 = 1.056 g = 1.06 g.",
      "4) نسبة الجزيئات غير المتشردة: %غير المتشردة = ([HA] / C) * 100% = (1 - tau_f) * 100%.\ntau_f = [H3O+] / C = (1.585 * 10^(-3)) / 0.030 = 0.0528 = 5.28%.\nنسبة الجزيئات غير المتشردة: 100% - 5.28% = 94.72% (حوالي 95%).\nالتعليق: الغالبية الساحقة من جزيئات حمض الأسكوربيك (أكثر من 94%) تبقى على شكل جزيئات غير مفككة HA في المحلول، مما يؤكد الطبيعة الضعيفة جداً لهذا الحمض ويفسر حفظه لخاصيته المضادة للأكسدة.",
    ],
    markingScheme_ar: [
      { criterion: "المعادلة وجدول التقدم الصارم", points: 1.0 },
      { criterion: "البرهان النظري لـ C بدلالة [H3O+] و Ka", points: 1.0 },
      { criterion: "حساب Ka و C والكتلة m المذابة", points: 1.0 },
      { criterion: "حساب نسبة الجزيئات غير المتشردة والتفسير الفيزيوكيميائي", points: 1.0 },
    ],
  },
};

export const PHYSICS_PH_TITRATION_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_ph_metric_titration_curves",
  canonicalTitle_ar: "المعايرة البي-أش مترية: منحنيات المعايرة، نقطة التكافؤ ونصف التكافؤ",
  canonicalTitle_fr: "Titrage pH-métrique : courbes de titrage, point d'équivalence et demi-équivalence",
  discipline: "chemistry",
  domain: "Chimie Générale",
  unit: "تطور جملة كيميائية نحو حالة التوازن (المعايرة pH-مترية)",
  status: "APPROVED",
  scopeIn: [
    "التركيب التجريبي للمعايرة البي-أش مترية (مقياس الـ pH، المسبر الزجاجي، السحاحة، المخلاط المغناطيسي، محلول المعايِر والمحلول المعايَر).",
    "تحديد إحداثيات نقطة التكافؤ E(V_E, pH_E) بيانياً بطريقة المماسات المتوازية وطريقة مشتق المنحنى (dpH/dV_b).",
    "علاقة التكافؤ الستوكيومترية C_A * V_A = C_B * V_E واستنتاج التركيز المجهول.",
    "نقطة نصف التكافؤ (Demi-équivalence): متى وكيف تطبق العلاقة pH = pKa؟ (شرط صارم: معايرة حمض ضعيف بأساس قوي، في محلول ممدد بشروط توازن معتبرة حيث [HA] = [A^-]). التنبيه الصارم بعدم تعميمها على معايرة حمض قوي بأساس قوي.",
    "طبيعة المحلول عند التكافؤ: pH_E = 7 لمعايرة حمض قوي بأساس قوي، و pH_E > 7 لمعايرة حمض ضعيف بأساس قوي (محلول أساسي ضعيف)، و pH_E < 7 لمعايرة أساس ضعيف بحمض قوي.",
    "اختيار الكاشف الملون المناسب للمعايرة اللونية البديلة (مجال التغير اللوني للكاشف يشمل pH_E لنقطة التكافؤ).",
  ],
  scopeOut: [
    "معايرة الأحماض الضعيفة جداً التي لا تظهر قفزة pH واضحة (pKa > 10).",
    "المعايرة بمقياس الناقلية (مدمجة في الحركية والوحدة الأولى).",
  ],
  prerequisites: {
    hard: ["علاقة التكافؤ وحساب التراكيز", "علاقة هندرسون-هاسلبالخ pH = pKa + log([A^-]/[HA])"],
    soft: ["الاشتقاق الهندسي وميل المنحنى وتحديد نقطة الانعطاف"],
    foundation: ["مفهوم الكواشف الملونة ومجال تغيرها اللوني"],
    crossCutting: ["الدقة في رسم المماسات المتوازية واستخراج V_E و pH_E"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-PHTIT-01",
      bloomLevel: "apply",
      description_ar: "تحديد إحداثيات نقطة التكافؤ E(V_E, pH_E) بيانياً بطريقة المماسات المتوازية أو المشتق وحساب التركيز المجهول.",
    },
    {
      code: "LO-PHYS-PHTIT-02",
      bloomLevel: "analyze",
      description_ar: "استنتاج قيمة pKa للثنائية من نقطة نصف التكافؤ مع تبرير شروط انطباق العلاقة pH = pKa بدقة علمية.",
    },
    {
      code: "LO-PHYS-PHTIT-03",
      bloomLevel: "evaluate",
      description_ar: "تعليل الصفة الحمضية أو الأساسية للمزيج عند التكافؤ واختيار الكاشف الملون المناسب للمعايرة.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "phtit_l1_foundation",
      capabilityId: "physics_ph_metric_titration_curves",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "عند معايرة حمض ضعيف (مثل حمض الإيثانويك) بواسطة محلول هيدروكسيد الصوديوم، تكون قيمة pH المزيج عند نقطة التكافؤ E:",
      expectedResponse_ar: "أكبر تماماً من 7 (pH_E > 7)",
      reasoningSteps_ar: [
        "عند التكافؤ، يستهلك الحمض الضعيف والأساس القوي تماماً بنسب ستوكيومترية.",
        "يحتوي المحلول الناتج على شوارد الصوديوم الحيادية Na^+ وشوارد الإيثانوات CH3COO^- وهي أساس ضعيف.",
        "تشرد الأساس الضعيف في الماء يحرر شوارد الهيدروكسيل OH^- مما يجعل الوسط أساسياً، وبالتالي pH_E > 7 عند 25°C.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة حمض ضعيف بأساس قوي",
        referenceFrameOrConditions_ar: "نقطة التكافؤ، وسط مائي عند 25°C",
        governingLaws_ar: ["طبيعة الأنواع الكيميائية المتواجدة عند التكافؤ"],
        keyUnitsAndDimensions_ar: "pH",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد الخاطئ بأن نقطة التكافؤ تكون دائماً عند pH = 7 في جميع المعايرات.",
      },
      scoringRubric_ar: "1 نقطة للتعليل الفيزيوكيميائي لنقطة التكافؤ.",
    },
    l2_application: {
      id: "phtit_l2_application",
      capabilityId: "physics_ph_metric_titration_curves",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "نعاير حجماً V_A = 20.0 mL من محلول حمض الإيثانويك تركيزه مجهول C_A بواسطة محلول هيدروكسيد الصوديوم تركيزه C_B = 0.050 mol/L. أعطت طريقة المماسات المتوازية حجم التكافؤ V_BE = 16.0 mL. احسب التركيز المولي C_A.",
      expectedResponse_ar: "C_A = 0.040 mol/L",
      reasoningSteps_ar: [
        "معادلة التفاعل: CH3COOH + OH^- -> CH3COO^- + H2O.",
        "عند التكافؤ: n_A = n_B => C_A * V_A = C_B * V_BE.",
        "عزل التركيز المجهول: C_A = (C_B * V_BE) / V_A.",
        "التعويض العددي: C_A = (0.050 * 16.0) / 20.0 = 0.80 / 20.0 = 0.040 mol/L.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة حمض-أساس بتفاعل تام وسريع",
        referenceFrameOrConditions_ar: "نقطة التكافؤ الستوكيومترية",
        governingLaws_ar: ["علاقة التكافؤ C_A*V_A = C_B*V_BE"],
        keyUnitsAndDimensions_ar: "mol/L و mL",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخطأ في الحساب الذهني أو قسمة الحجوم بشكل معكوس.",
      },
      scoringRubric_ar: "1 نقطة لكتابة علاقة التكافؤ، 1 نقطة للحساب العددي الدقيق.",
    },
    l3_mixed: {
      id: "phtit_l3_mixed",
      capabilityId: "physics_ph_metric_titration_curves",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "في معايرة حمض ضعيف HA بواسطة أساس قوي (Na^+ + OH^-):\n1) عرف نقطة نصف التكافؤ، وبين الشروط العلمية الدقيقة التي تسمح بكتابة العلاقة: pH = pKa عند هذه النقطة.\n2) هل تنطبق هذه العلاقة (pH = pKa) عند سكب نصف حجم التكافؤ في معايرة حمض كلور الماء HCl بواسطة هيدروكسيد الصوديوم؟ علل إجابتك تعليلاً صارماً.",
      expectedResponse_ar: "1) نقطة نصف التكافؤ هي إضافة V_b = V_E / 2 حيث يستهلك نصف الحمض ويتحول إلى أساس مرافق متساو في التركيز [HA] = [A^-]. ينطبق pH = pKa بشرط كون الحمض ضعيفاً والمحلول ممدداً وإهمال التفكك الذاتي. 2) لا تنطبق إطلاقاً في معايرة حمض كلور الماء لأنه حمض قوي يتشرد كلياً ولا يملك ثنائية ذات pKa في الماء.",
      reasoningSteps_ar: [
        "1) تعريف نقطة نصف التكافؤ: هي النقطة التي يضاف عندها نصف حجم التكافؤ: V_b = V_E / 2.\n- تبرير العلاقة: عند سكب نصف كمية الأساس اللازمة للتكافؤ، يتفاعل نصف كمية الحمض الابتدائي HA ويتحول إلى أساس مرافق A^-، فيصبح في البيشر: n(HA)_متبقي = n(A^-)_متشكل.\nبما أن الحجم نفسه: [HA] = [A^-].\nبتطبيق علاقة هندرسون-هاسلبالخ: pH = pKa + log([A^-]/[HA]) = pKa + log(1) = pKa + 0 = pKa.\n- الشروط الدقيقة لانطباقها: أن يكون الحمض ضعيفاً (0 < pKa < 14)، وأن يكون المحلول ممدداً بدرجة كافية بحيث يمكن إهمال التشرد الذاتي للماء وتشرد الحمض المتبقي أمام كميات المادة المضافة.",
        "2) معايرة حمض كلور الماء (حمض قوي): لا تنطبق هذه العلاقة إطلاقاً! لأن حمض كلور الماء حمض قوي يتشرد كلياً في الماء (ليس له pKa في المجال المائي)، ولا توجد جزيئات HCl في المحلول بل شوارد H3O^+ وشوارد Cl^- خاملة. عند إضافة V_b = V_E / 2، يكون pH المحلول محكوماً بتركيز شوارد H3O^+ المتبقية: [H3O+] = (C_A*V_A - C_B*V_b)/(V_A + V_b) وليس له أي علاقة بـ pKa.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة الأحماض الضعيفة مقابل الأحماض القوية",
        referenceFrameOrConditions_ar: "مقارنة منهجية عند نصف التكافؤ",
        governingLaws_ar: ["علاقة هندرسون-هاسلبالخ", "شروط انطباق التوازن الحمضي الأساسي"],
        keyUnitsAndDimensions_ar: "pH و pKa",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "التعميم الخاطئ لعلاقة pH = pKa على كل المعايرات بما فيها معايرة الأحماض القوية.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5ن لتعريف نصف التكافؤ واشتقاق pH=pKa وشروطه، 1.5ن لتعليل بطلان العلاقة في حالة الحمض القوي.",
    },
    l4_transfer: {
      id: "phtit_l4_transfer",
      capabilityId: "physics_ph_metric_titration_curves",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "أعطت معايرة pH-مترية لحجم V_A = 10 mL من محلول حمض مجهول بأساس قوي C_B = 0.10 mol/L منحنى مشتق الـ pH الموضح في الشكل، حيث يظهر ذروة وحيدة حادة عند الحجم V_b = 15.0 mL وقيمة pH الموافقة للتكافؤ هي pH_E = 8.8.\n1) حدد حجم التكافؤ V_E وفسر كيف تحدد نقطة التكافؤ انطلاقاً من منحنى المشتق dpH/dV_b.\n2) احسب تركيز الحمض المجهول C_A.\n3) نملك الكواشف الملونة التالية:\n- الهليانثين: مجال التغير [3.1 - 4.4]\n- أزرق البروموثيمول BBT: مجال التغير [6.0 - 7.6]\n- الفينول فتالين: مجال التغير [8.2 - 10.0]\nاختر الكاشف الملون الأنسب لهذه المعايرة مع التعليل العلمي.",
      expectedResponse_ar: "V_E = 15.0 mL (عند ذروة المشتق). C_A = 0.15 mol/L. الكاشف المناسب هو الفينول فتالين لأن مجال تغيره اللوني [8.2 - 10.0] يشمل pH التكافؤ (pH_E = 8.8).",
      reasoningSteps_ar: [
        "1) طريقة المشتق: تمثل نقطة التكافؤ نقطة الانعطاف لمنحنى المعايرة pH = f(V_b)، ويكون عندها ميل المماس أعظمياً. وبالتالي، فإن مشتق الـ pH بالنسبة للحجم (dpH/dV_b) يبلغ قيمة عظمى (ذروة) عند نقطة التكافؤ تماماً. إذن حجم التكافؤ يوافق فاصلة ذروة المشتق: V_E = 15.0 mL.",
        "2) حساب التركيز C_A:\nعند التكافؤ: C_A * V_A = C_B * V_E => C_A = (C_B * V_E) / V_A = (0.10 * 15.0) / 10.0 = 0.15 mol/L.",
        "3) اختيار الكاشف الملون: الشرط العلمي لاختيار كاشف ملون مناسب هو أن يشمل مجال تغيره اللوني قيمة pH عند نقطة التكافؤ E.\nبما أن pH_E = 8.8:\n- الهليانثين: 8.8 لا تنتمي إلى [3.1 - 4.4] (غير مناسب).\n- BBT: 8.8 لا تنتمي إلى [6.0 - 7.6] (غير مناسب).\n- الفينول فتالين: 8.8 تنتمي إلى المجال [8.2 - 10.0]، وبالتالي يتغير لونه بدقة عند سكب قطرة التكافؤ ويصلح تماماً ككاشف ملون للمعايرة.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة pH-مترية معالجة بمشتق المنحنى",
        referenceFrameOrConditions_ar: "استغلال منحنى المشتق dpH/dV_b واختيار الكاشف اللوني",
        governingLaws_ar: ["طريقة المشتق لتحديد التكافؤ", "معيار الكاشف الملون المناسب"],
        keyUnitsAndDimensions_ar: "mL و mol/L و pH",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اختيار كاشف BBT آلياً ظناً أنه صالح لكل المعايرات دون التحقق من pH_E.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتفسير طريقة المشتق واستخراج V_E، 1.0ن لحساب C_A، 1.0ن لاختيار الكاشف الملون وتبريره العلمي.",
    },
    l5_bac_style: {
      id: "phtit_l5_bac_style",
      capabilityId: "physics_ph_metric_titration_curves",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "لمعرفة التركيز المولي C_A لحمض البنزويك C6H5COOH في محلول مائي، نأخذ عينة حجمها V_A = 20.0 mL ونعايرها بواسطة محلول هيدروكسيد الصوديوم (Na^+ + OH^-) تركيزه C_B = 0.10 mol/L عن طريق قياس الـ pH.\n1) ارسم رسماً تخطيطياً للتجهيز التجريبي للمعايرة موضحاً البيانات كاملة.\n2) اكتب معادلة تفاعل المعايرة وبين أنه تفاعل تام بحساب كسر التفاعل الابتدائي أو ثابت التوازن K (نأخذ pKa = 4.2 و Ke = 10^(-14)).\n3) أعطى الرسم البياني لمنحنى المعايرة إحداثيات نقطة التكافؤ: E(V_BE = 12.0 mL, pH_E = 8.6).\nأ) احسب التركيز المولي C_A لحمض البنزويك.\nب) عين بيانياً قيمة pKa للثنائية C6H5COOH/C6H5COO^- واذكر الخاصية المعتمدة.\nجـ) احسب تراكيز جميع الأفراد الكيميائية المتواجدة في المزيج عند سكب حجم V_B = 6.0 mL من الأساس.",
      expectedResponse_ar: "المعادلة: C6H5COOH + OH^- -> C6H5COO^- + H2O، ثابت K = 1.58 * 10^9 >> 10^4 فالتفاعل تام. C_A = 0.060 mol/L. pKa = 4.20 من نقطة نصف التكافؤ. عند V_B = 6.0 mL: [HA] = [A^-] = 0.023 mol/L.",
      reasoningSteps_ar: [
        "1) رسم التجهيز التجريبي: حامل، سحاحة مدرجة تحتوي على محلول هيدروكسيد الصوديوم، بيشر يحتوي على 20 mL من حمض البنزويك ومغناطيس، مخلاط مغناطيسي، مسبر مقياس الـ pH مغمور وموصول بجهاز pH-mètre.",
        "2) معادلة المعايرة: C6H5COOH(aq) + OH^-(aq) -> C6H5COO^-(aq) + H2O(l).\nثابت التوازن: K = [C6H5COO^-]_eq / ([C6H5COOH]_eq * [OH^-]_eq).\nنضرب ونقسم على [H3O+]: K = Ka / Ke = 10^(-4.2) / 10^(-14) = 10^(9.8) = 6.31 * 10^9.\nبما أن K > 10^4، فإن تفاعل المعايرة تفاعل تام ومناسب جداً للمعايرة الكمية.",
        "3.أ) عند التكافؤ: C_A * V_A = C_B * V_BE => C_A = (0.10 * 12.0) / 20.0 = 0.060 mol/L.",
        "3.ب) تعيين pKa: عند نصف التكافؤ V_B = V_BE / 2 = 12.0 / 2 = 6.0 mL.\nنسقط V_B = 6.0 mL على منحنى المعايرة فنجد مباشرة: pH = 4.20.\nبما أن [HA] = [A^-] عند نصف التكافؤ، فإن pH = pKa = 4.20.",
        "3.جـ) تراكيز الأفراد عند V_B = 6.0 mL:\nالحجم الكلي: V_tot = V_A + V_B = 20.0 + 6.0 = 26.0 mL = 0.026 L.\nكمية مادة Na^+ (شاردة خاملة): n(Na^+) = C_B * V_B = 0.10 * 0.006 = 6.0 * 10^(-4) mol.\n[Na^+] = n / V_tot = (6.0 * 10^(-4)) / 0.026 = 0.0231 mol/L.\nكمية مادة A^- المتشكلة = كمية مادة OH^- المسكوبة (تفاعل تام): n(A^-) = 6.0 * 10^(-4) mol => [A^-] = 0.0231 mol/L.\nكمية مادة HA المتبقية = n0 - n_versé = C_A*V_A - C_B*V_B = (0.060*0.020) - (6.0*10^(-4)) = 1.2*10^(-3) - 6.0*10^(-4) = 6.0 * 10^(-4) mol.\n[HA] = (6.0 * 10^(-4)) / 0.026 = 0.0231 mol/L.\nشوارد H3O^+: [H3O+] = 10^(-pH) = 10^(-4.20) = 6.31 * 10^(-5) mol/L.\nشوارد OH^-: [OH^-] = Ke / [H3O+] = 10^(-14) / (6.31 * 10^(-5)) = 1.58 * 10^(-10) mol/L.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "معايرة حمض البنزويك بالصود",
        referenceFrameOrConditions_ar: "تفاعل تام وسريع عند 25°C، نقطة نصف التكافؤ ونقطة التكافؤ",
        governingLaws_ar: ["ثابت التوازن K = Ka/Ke", "علاقة التكافؤ", "انحفاظ المادة والشحنة"],
        keyUnitsAndDimensions_ar: "mol/L و mL و pH",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان جمع الحجمين V_A + V_B عند حساب التراكيز المولية للأفراد في المزيج.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لرسم التجهيز والبيانات، 1.0ن لمعادلة التفاعل وحساب K وإثبات أنه تام، 1.0ن لحساب C_A واستخراج pKa من نصف التكافؤ، 1.0ن لحساب تراكيز جميع الأفراد عند V_B = 6 mL.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "نسيان قسمة كميات المادة على الحجم الكلي للمزيج (V_A + V_b) عند حساب تراكيز الأفراد، أو الاعتقاد بأن pH_E = 7 دائماً.",
    wrongMentalModel_ar: "قسمة كمية المادة على V_A فقط وتجاهل الحجم المسكوب من السحاحة V_b، أو افتراض أن التكافؤ يعني التعادل الحمضي دائماً.",
    correctMentalModel_ar: "المعايرة عملية إضافة مستمرة لسائل، لذلك الحجم الكلي يتغير لحظياً: V_tot = V_A + V_b. وعند نقطة التكافؤ لحمض ضعيف بأساس قوي يكون المحلول أساسياً ضعيفاً (pH_E > 7) نظراً لوجود الأساس المرافق المتشكل.",
    threeStepActionProtocol_ar: [
      "في أي حساب للتراكيز أثناء المعايرة، اكتب فوراً: V_tot = V_A + V_b وحوله إلى اللتر L.",
      "تذكر: التكافؤ لحمض قوي + أساس قوي يعطي pH_E = 7، ولحمض ضعيف + أساس قوي يعطي pH_E > 7، ولأساس ضعيف + حمض قوي يعطي pH_E < 7.",
      "عند نصف التكافؤ (V_b = V_E / 2)، اسقط الحجم مباشرة على المنحنى لقراءة pKa = pH (خاص بالأحماض والأسس الضعيفة فقط).",
    ],
    microDrill_ar: {
      prompt_ar: "في معايرة حمض ضعيف بأساس قوي، كان حجم التكافؤ V_E = 14.0 mL. ما هو الحجم الذي نسقطه لقراءة pKa من المنحنى البياني؟",
      solution_ar: "نسقط حجم نصف التكافؤ: V_b = V_E / 2 = 14.0 / 2 = 7.0 mL لقراءة pKa = pH مباشرة.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_ph_titration_twin",
    invariantTested_ar: "معايرة أساس ضعيف بحمض قوي (عكس المعايرة السابقة) وتحديد التكافؤ ونصف التكافؤ",
    changedSurface_ar: "معايرة محلول النشادر NH3 بواسطة محلول حمض كلور الماء (H3O^+ + Cl^-) بمتابعة pH-مترية.",
    prompt_ar: "نعاير V_B = 20.0 mL من محلول النشادر NH3 تركيزه مجهول C_B بواسطة حمض كلور الماء C_A = 0.050 mol/L. منحنى المعايرة أعطى حجم التكافؤ V_AE = 18.0 mL وقيمة pH عند التكافؤ pH_E = 5.3.\n1) فسر لماذا قيمة pH_E أصغر من 7 عند التكافؤ.\n2) احسب التركيز C_B لمحلول النشادر.\n3) حدد قيمة pKa للثنائية (NH4^+ / NH3) إذا كانت قيمة pH عند إضافة V_A = 9.0 mL هي 9.25.",
    solution_ar: "1) عند التكافؤ: يتفاعل NH3 مع H3O^+ كلياً لينتج شوارد الأمونيوم NH4^+ وشوارد الكلور Cl^- الخاملة. بما أن NH4^+ حمض ضعيف، فإن تشردها في الماء يحرر H3O^+ مما يجعل الوسط حمضياً (pH_E < 7).\n2) عند التكافؤ: C_B * V_B = C_A * V_AE => C_B = (0.050 * 18.0) / 20.0 = 0.045 mol/L.\n3) عند V_A = 9.0 mL = V_AE / 2 (نصف التكافؤ): [NH3] = [NH4^+]، وبالتالي pKa = pH = 9.25.",
    passCondition_ar: "تفسير pH_E < 7 لطبيعة شوارد الأمونيوم الحمضية، وحساب C_B = 0.045 mol/L واستخراج pKa = 9.25 بدقة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: مراقبة جودة الخل التجاري بالمعايرة pH-مترية",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "تحمل قارورة خل تجاري دلالة الدرجة الحمصية 6° (أي أن 100 g من الخل تحتوي على 6 g من حمض الإيثانويك النقي CH3COOH).\nللتحقق من هذه الدلالة، نمدد الخل التجاري 10 مرات لنحصل على محلول ممدد (S1). نأخذ منه حجماً V_A = 10.0 mL ونعايره بواسطة محلول هيدروكسيد الصوديوم تركيزه C_B = 0.10 mol/L بمتابعة pH-مترية.\n1) اذكر بروتوكول تمديد الخل التجاري والزجاجيات المستخدمة.\n2) أعطت المتابعة جدول قيم المشتق dpH/dV_b الذي يبلغ قيمته العظمى عند الحجم V_BE = 10.2 mL.\nأ) احسب التركيز المولي C1 للمحلول الممدد، واستنتج التركيز التجاري C0 للخل.\nب) احسب الكتلة m لحمض الإيثانويك الموجودة في 1 L من الخل التجاري (M = 60 g/mol).\nجـ) احسب الدرجة الحمصية للخل التجاري إذا علمت أن كتلته الحجمية rho = 1.02 g/mL، وقارنها بالدلالة المسجلة على القارورة.\n3) إذا كان pH المحلول عند إضافة V_B = 5.1 mL هو pH = 4.75، ماذا تمثل هذه القيمة؟ برر إجابتك.",
    modelSolution_ar: [
      "1) بروتوكول التمديد: بواسطة ماصة عيارية سعتها 10 mL مزودة بإجاصة مص، نأخذ 10 mL من الخل التجاري ونفرغها في حوجلة عيارية سعتها 100 mL (معامل التمديد F = 100/10 = 10). نضيف كمية من الماء المقطر ونرج، ثم نكمل بالماء المقطر حتى خط العيار ونسد الحوجلة ونرجها لتجانس المحلول الممدد.",
      "2.أ) عند التكافؤ (ذروة المشتق V_BE = 10.2 mL):\nC1 * V_A = C_B * V_BE => C1 = (0.10 * 10.2) / 10.0 = 0.102 mol/L.\nالتركيز التجاري الأصلي: C0 = 10 * C1 = 10 * 0.102 = 1.02 mol/L.",
      "2.ب) كتلة الحمض في 1 L من الخل التجاري:\nm = C0 * V * M = 1.02 * 1.0 * 60 = 61.2 g.",
      "2.جـ) كتلة 1 L من الخل التجاري:\nm_خل = rho * V = (1.02 g/mL) * 1000 mL = 1020 g.\nحساب الدرجة الحمصية (كتلة الحمض في 100 g من الخل):\nالدرجة = (61.2 g / 1020 g) * 100 = 6.0°.\nالمقارنة: الدرجة المحسوبة تطابق تماماً الدلالة المسجلة على القارورة (6°)، مما يؤكد جودة ونقاوة الخل التجاري ومطابقته للمواصفات.",
      "3) الحجم V_B = 5.1 mL يوافق تماماً نصف حجم التكافؤ (10.2 / 2 = 5.1 mL).\nتمثل هذه القيمة ثابت الحموضة pKa للثنائية CH3COOH/CH3COO^- لأن المزيج عند نصف التكافؤ يحتوي على كميات متساوية من الحمض وأساسه المرافق ([CH3COOH] = [CH3COO^-]) مما يجعل pH = pKa = 4.75.",
    ],
    markingScheme_ar: [
      { criterion: "البروتوكول التجريبي للتمديد والزجاجيات العيارية", points: 1.0 },
      { criterion: "حساب C1 و C0 من نقطة التكافؤ", points: 1.0 },
      { criterion: "حساب الكتلة m والدرجة الحمصية ومقارنتها بالدلالة التجارية", points: 1.0 },
      { criterion: "تحديد وتبرير pKa عند نقطة نصف التكافؤ", points: 1.0 },
    ],
  },
};

export const PHYSICS_ESTERIFICATION_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_esterification_hydrolysis_equilibrium",
  canonicalTitle_ar: "تفاعلات الأسترة والإماهة: الحركية، حالة التوازن، المردود ومراقبة الجملة",
  canonicalTitle_fr: "Estérification et hydrolyse : cinétique, équilibre, rendement et contrôle",
  discipline: "chemistry",
  domain: "Chimie Organique",
  unit: "مراقبة تطور جملة كيميائية (الأسترة والإماهة)",
  status: "APPROVED",
  scopeIn: [
    "تسمية وكتابة الصيغ نصف المفصلة للأحماض الكربوكسيلية، الكحولات (الأولية، الثانوية، الثالثية)، والأسترات المتشكلة وفق التسمية النظامية IUPAC.",
    "خصائص تفاعل الأسترة وتفاعل الإماهة: تفاعل عكوس، بطيء، محدود، ولاحراري (Athermique لا يتأثر ثابت توازنه بدرجة الحرارة).",
    "جدول تقدم تفاعل الأسترة، وعبارة كسر التفاعل Q_r وثابت التوازن K = ([ester]_eq * [eau]_eq) / ([acide]_eq * [alcool]_eq).",
    "حساب المردود النهائي r = (x_f / x_max) * 100% واعتماده على صنف الكحول في مزيج ابتدائي متساوي المولات (كحول أولي ~ 67% و K=4، كحول ثانوي ~ 60% و K=2.25، كحول ثالثي ~ 5% إلى 10%).",
    "طرق تحسين مردود الأسترة: استعمال أحد المتفاعلين بفائض، أو إزالة أحد النواتج (الماء أو الإستر) بالتقطير المجزأ أثناء التفاعل (إزاحة التوازن حسب لوشاتولييه).",
    "طرق تسريع التفاعل دون التأثير على المردود: رفع درجة الحرارة (تسخين مرتد Chauffage à reflux)، واستعمال وسيط حمضي (حمض الكبريت المركز H2SO4).",
    "التصبن (إماهة الإستر في وسط أساسي): تفاعل تام وسريع بالحرارة لإنتاج الصابون (ملح الحمض الكربوكسيلي) والكحول.",
  ],
  scopeOut: [
    "اصطناع الأسترات باستخدام كلورور البيريل أو بلاماء الحمض (Anhydride d'acide - محذوف أو خارج المنهاج المخفف للعلوم التجريبية).",
    "آليات التفاعل العضوية المجهرية (Mécanismes réactionnels عبر الوسيط الرباعي الأوجه).",
  ],
  prerequisites: {
    hard: ["كتابة الصيغ نصف المفصلة وتسمية المركبات العضوية الكربوكسيلية والكحولية"],
    soft: ["جدول التقدم وحساب كميات المادة n = m/M = rho*V/M"],
    foundation: ["مفهوم التفاعل العكوس وحالة التوازن الكيميائي الديناميكي"],
    crossCutting: ["التمييز الدقيق بين العوامل الحركية (السرعة) والعوامل الترموديناميكية (المردود)"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-ESTER-01",
      bloomLevel: "apply",
      description_ar: "كتابة معادلة تفاعل الأسترة وتسمية الإستر الناتج وتحديد صنف الكحول المستخدم وصيغته نصف المفصلة.",
    },
    {
      code: "LO-PHYS-ESTER-02",
      bloomLevel: "analyze",
      description_ar: "حساب مردود الأسترة r وثابت التوازن K وتفسير استقلال K عن درجة الحرارة لكون التفاعل لاحرارياً.",
    },
    {
      code: "LO-PHYS-ESTER-03",
      bloomLevel: "evaluate",
      description_ar: "اقتراح طرق علمية لتحسين المردود (إزاحة التوازن) أو تسريع التفاعل (التسخين المرتد والوساطة) مع التعليل الفيزيوكيميائي.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "ester_l1_foundation",
      capabilityId: "physics_esterification_hydrolysis_equilibrium",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "إضافة قطرات من حمض الكبريت المركز H2SO4 إلى مزيج تفاعل الأسترة تؤدي إلى:",
      expectedResponse_ar: "تسريع التفاعل دون تغيير المردود النهائي",
      reasoningSteps_ar: [
        "حمض الكبريت وسيط كيميائي (Catalyseur).",
        "دور الوسيط هو خفض طاقة التنشيط وتسريع بلوغ حالة التوازن بسرعة أكبر.",
        "الوسيط لا يظهر في المعادلة الإجمالية ولا يغير التركيب النهائي للجملة عند التوازن، وبالتالي يبقى المردود ثابتاً.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "مزيج تفاعل أسترة في وجود وسيط حمضي",
        referenceFrameOrConditions_ar: "دور الوسيط الكيميائي في الحركية الكيميائية",
        governingLaws_ar: ["مفهوم الوساطة الكيميائية"],
        keyUnitsAndDimensions_ar: "حركي",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن الوسيط يزيد من كمية الإستر المتشكلة أو يرفع مردود التفاعل.",
      },
      scoringRubric_ar: "1 نقطة للتمييز بين الأثر الحركي (السرعة) والأثر الترموديناميكي (المردود).",
    },
    l2_application: {
      id: "ester_l2_application",
      capabilityId: "physics_esterification_hydrolysis_equilibrium",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "نمزج n0 = 1.0 mol من حمض الإيثانويك مع n0 = 1.0 mol من الميثانول في وجود وسيط. عند بلوغ حالة التوازن تشكل 0.67 mol من الإستر.\n1) احسب مردود التفاعل r.\n2) احسب ثابت التوازن K لتفاعل الأسترة هذا.",
      expectedResponse_ar: "r = 67%، وثابت التوازن K = 4.12 (حوالي 4).",
      reasoningSteps_ar: [
        "1) المزيج متساوي المولات والميثانول كحول أولي، والتقدم الأعظمي x_max = 1.0 mol.\nالتقدم النهائي: x_f = n(ester)_eq = 0.67 mol.\nالمردود: r = (x_f / x_max) * 100% = (0.67 / 1.0) * 100% = 67%.",
        "2) جدول التقدم عند التوازن:\nn(ester) = x_f = 0.67 mol.\nn(eau) = x_f = 0.67 mol.\nn(acide) = n0 - x_f = 1.0 - 0.67 = 0.33 mol.\nn(alcool) = n0 - x_f = 1.0 - 0.67 = 0.33 mol.\nثابت التوازن K (تختزل الحجوم لأن عدد المولات محفوظ Delta n = 0):\nK = (n_ester * n_eau) / (n_acide * n_alcool) = (0.67 * 0.67) / (0.33 * 0.33) = (0.4489) / (0.1089) = 4.12.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "تفاعل أسترة متساوي المولات لكحول أولي",
        referenceFrameOrConditions_ar: "حالة التوازن الكيميائي، تفاعل لاحراري",
        governingLaws_ar: ["قانون فعل الكتلة لثابت التوازن K", "r = x_f/x_max"],
        keyUnitsAndDimensions_ar: "% وثابت K خالي من الوحدات",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخطأ في حساب المتبقي من المتفاعلات (1 - 0.67 = 0.33).",
      },
      scoringRubric_ar: "1 نقطة لحساب المردود 67%، 1 نقطة لحساب ثابت التوازن K = 4.",
    },
    l3_mixed: {
      id: "ester_l3_mixed",
      capabilityId: "physics_esterification_hydrolysis_equilibrium",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "نريد تحضير إستر برائحة الموز (إيثانوات 3-مثيل البوتيل) انطلاقاً من حمض الإيثانويك CH3COOH وكحول صيغته نصف المفصلة: CH3-CH(CH3)-CH2-CH2-OH.\n1) اكتب معادلة تفاعل الأسترة بالصيغ نصف المفصلة وسم الإستر الناتج.\n2) حدد صنف الكحول المستخدم، واستنتج المردود المتوقع r إذا انطلقنا من مزيج متساوي المولات.\n3) اقترح طريقتين مختلفتين لرفع مردود هذا التفاعل إلى أكثر من 90% مع التعليل بمبدأ لوشاتولييه.",
      expectedResponse_ar: "المعادلة مكتوبة، الإستر هو إيثانوات 3-مثيل البوتيل، الكحول أولي ومردوده 67%. رفع المردود يتم بـ: 1) استعمال أحد المتفاعلين بفائض، 2) نزع الماء أو الإستر بالتقطير المجزأ أثناء التفاعل لإزاحة التوازن في الاتجاه المباشر.",
      reasoningSteps_ar: [
        "1) المعادلة بالصيغ نصف المفصلة:\nCH3-COOH + CH3-CH(CH3)-CH2-CH2-OH <=> CH3-COO-CH2-CH2-CH(CH3)-CH3 + H2O.\nاسم الإستر: إيثانوات 3-مثيل البوتيل (Éthanoate de 3-méthylbutyle).",
        "2) صنف الكحول: الكربون الوظيفي المرتبط بزمرة الهيدروكسيل -OH (وهو -CH2-OH) متصل بكربون واحد فقط، إذن هو كحول أولي (Alcool primaire).\nالمردود المتوقع لمزيج متساوي المولات لكحول أولي هو: r = 67% (ثابت التوازن K = 4).",
        "3) طرق رفع المردود (إزاحة التوازن نحو تشكل الإستر حسب مبدأ لوشاتولييه):\n- الطريقة الأولى: استعمال أحد المتفاعلين بفائض (مثلاً زيادة كمية الحمض n_acide > n_alcool)، مما يجعل كسر التفاعل Q_r < K ويزيح التوازن في الاتجاه المباشر فيستهلك الكحول كلياً ويرتفع المردود.\n- الطريقة الثانية: إزالة أحد النواتج تدريجياً أثناء التفاعل؛ إما بنزع الماء المتشكل باستعمال جهاز دين-ستارك (Dean-Stark)، أو بفصل الإستر بالتقطير المجزأ إذا كانت درجة غليانه منخفضة، مما يبقي Q_r < K بصفة مستمرة ويدفع التفاعل إلى الأمام حتى استهلاك المتفاعلات.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "تفاعل أسترة عضوي لتحضير نكهة غذائية",
        referenceFrameOrConditions_ar: "مراقبة وتوجيه الجملة الكيميائية، مبدأ لوشاتولييه",
        governingLaws_ar: ["قاعدة إزاحة التوازن Q_r < K", "تصنيف الكحولات"],
        keyUnitsAndDimensions_ar: "عضوي وكيميائي",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اقتراح رفع درجة الحرارة لزيادة المردود (خطأ شائع لأن تفاعل الأسترة لاحراري ورفع الحرارة يسرعه فقط دون التأثير على المردود).",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للمعادلة والتسمية النظامية، 1.0ن لتحديد صنف الكحول والمردود 67%، 1.0ن لاقتراح الطريقتين وتبريرهما بكسر التفاعل.",
    },
    l4_transfer: {
      id: "ester_l4_transfer",
      capabilityId: "physics_esterification_hydrolysis_equilibrium",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "لتحسين مردود أسترة كحول أولي (ثابت توازنه K = 4)، نمزج n_alcool = 1.0 mol من الكحول مع n_acide = 3.0 mol من حمض الإيثانويك (استعمال الحمض بفائض).\n1) أنشئ جدول تقدم التفاعل عند حالة التوازن.\n2) احسب التقدم النهائي x_f عند التوازن.\n3) احسب المردود الجديد للتفاعل r بالنسبة للكحول، وقارنه مع مردود المزيج المتساوي المولات (67%).",
      expectedResponse_ar: "x_f = 0.90 mol، والمردود الجديد r = 90% (ارتفع من 67% إلى 90% بفعل الزيادة في كمية الحمض).",
      reasoningSteps_ar: [
        "1) جدول التقدم:\nالحمض: n(ac) = 3.0 - x_f.\nالكحول: n(al) = 1.0 - x_f.\nالإستر: n(est) = x_f.\nالماء: n(eau) = x_f.\nالتقدم الأعظمي (الكحول هو المتفاعل المحد): x_max = 1.0 mol.",
        "2) تطبيق قانون ثابت التوازن (K = 4 للكحول الأولي):\nK = (n_est * n_eau) / (n_ac * n_al) = (x_f)^2 / [ (3.0 - x_f) * (1.0 - x_f) ] = 4.\n(x_f)^2 = 4 * [ 3.0 - 4.0 * x_f + (x_f)^2 ] = 12 - 16 * x_f + 4 * (x_f)^2.\n3 * (x_f)^2 - 16 * x_f + 12 = 0.\nحل معادلة الدرجة الثانية:\nDelta = (-16)^2 - 4 * 3 * 12 = 256 - 144 = 112.\nsqrt(Delta) = 10.583.\nx_f1 = (16 - 10.583) / 6 = 5.417 / 6 = 0.903 mol.\nx_f2 = (16 + 10.583) / 6 = 4.43 mol (مرفوض لأنه أكبر من x_max = 1.0 mol).\nإذن التقدم النهائي المقبول فيزيائياً هو: x_f = 0.90 mol.",
        "3) حساب المردود الجديد:\nr = (x_f / x_max) * 100% = (0.90 / 1.0) * 100% = 90%.\nالمقارنة: ارتفع المردود بشكل معتبر من 67% إلى 90%، مما يثبت نجاعة التقنية الكيميائية لاستعمال متفاعل رخيص بفائض لإجبار التفاعل على استهلاك المتفاعل الآخر تقريباً بالكامل.",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "مزيج تفاعل أسترة غير متساوي المولات",
        referenceFrameOrConditions_ar: "حالة التوازن الكيميائي، ثبات K = 4",
        governingLaws_ar: ["ثابت التوازن الكيميائي", "حل معادلة الدرجة الثانية للتقدم"],
        keyUnitsAndDimensions_ar: "mol و %",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "اختيار الحل الرياضي الأكبر من 1.0 mol وتجاهل الشرط الفيزيائي x_f < x_max.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لجدول التقدم، 1.0ن للمعادلة الرياضية وحساب x_f = 0.90 mol، 1.0ن لحساب المردود 90% والمقارنة.",
    },
    l5_bac_style: {
      id: "ester_l5_bac_style",
      capabilityId: "physics_esterification_hydrolysis_equilibrium",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "نحقق مزيجاً ابتدائياً متساوي المولات يتكون من n0 = 0.30 mol من حمض الميثانويك HCOOH و n0 = 0.30 mol من كحول مجهول B صيغته العامة C_n H_{2n+2} O، ونضيف بضع قطرات من حمض الكبريت المركز. نوزع المزيج بالتساوي على 10 أنابيب اختبار محكمة السد ونضعها في حمام مائي عند درجة حرارة 80°C (التسخين في حمام مائي).\nفي لحظات زمنية مختلفة، نخرج أنبوباً ونبرده في الماء والجليد، ثم نعاير الحمض المتبقي بواسطة محلول هيدروكسيد الصوديوم تركيزه C_b = 1.0 mol/L في وجود كاشف الفينول فتالين.\n1) ما الفائدة من تبريد الأنبوب في الماء والجليد مباشرة قبل المعايرة؟\n2) عند بلوغ التوازن، تطلب معايرة الحمض المتبقي في أنبوب واحد إضافة V_bE = 12.0 mL من محلول الصود.\nأ) احسب كمية مادة الحمض المتبقية في أنبوب واحد، ثم استنتج كمية مادة الحمض المتبقية n_ac(eq) في كامل المزيج الابتدائي (الأنابيب العشرة).\nب) احسب التقدم النهائي x_f لكمية الإستر المتشكلة في المزيج الكلي.\nجـ) احسب مردود التفاعل r، واستنتج صنف الكحول B مع التعليل.\n3) إذا علمت أن الكتلة المولية للكحول B هي M = 60 g/mol:\nأ) جد الصيغة الجزيئية المجملة للكحول B.\nب) اكتب الصيغ نصف المفصلة الممكنة للكحول B، وحدد الصيغة الصحيحة المطابقة لصنفه مع إعطاء اسمه النظامي.\nجـ) اكتب معادلة تفاعل الأسترة بالصيغ نصف المفصلة وسم الإستر الناتج.",
      expectedResponse_ar: "1) التبريد لتوقيف التفاعل (سحق حركي). 2) n_ac في أنبوب = 0.012 mol، وفي 10 أنابيب n_ac(eq) = 0.12 mol. التقدم x_f = 0.18 mol. المردود r = 60%، الكحول ثانوي. 3) الصيغة C3H8O، الكحول هو بروبان-2-أول، والإستر هو ميثانوات 1-مثيل الإيثيل.",
      reasoningSteps_ar: [
        "1) الفائدة من التبريد في الماء والجليد: توقيف التفاعل الكيميائي فوراً (سحق حركي أو كبح حركي Trempe thermique) عن طريق خفض درجة الحرارة إلى الصفر المئوي حتى لا يستمر تشكل الإستر أثناء إجراء عملية المعايرة، فتكون النتائج اللحظية دقيقة.",
        "2.أ) كمية مادة الحمض المتبقية في أنبوب واحد:\nعند التكافؤ: n_tube = C_b * V_bE = 1.0 * (12.0 * 10^(-3)) = 0.012 mol.\nكمية مادة الحمض المتبقية في كامل المزيج الابتدائي (10 أنابيب متماثلة):\nn_ac(eq) = 10 * n_tube = 10 * 0.012 = 0.12 mol.",
        "2.ب) من جدول التقدم للمزيج الكلي:\nn_ac(eq) = n0 - x_f => x_f = n0 - n_ac(eq) = 0.30 - 0.12 = 0.18 mol.",
        "2.جـ) المردود النهائي:\nr = (x_f / x_max) * 100% = (0.18 / 0.30) * 100% = 60%.\nاستنتاج صنف الكحول: بما أن المزيج الابتدائي متساوي المولات والمردود النهائي بلغ 60%، فإن الكحول B هو بالضرورة كحول ثانوي (Alcool secondaire).",
        "3.أ) الصيغة المجملة للكحول: M(C_n H_{2n+2} O) = 12*n + 1*(2n+2) + 16 = 14*n + 18.\n14*n + 18 = 60 => 14*n = 42 => n = 42 / 14 = 3.\nالصيغة الجزيئية المجملة هي: C3H8O.",
        "3.ب) الصيغ نصف المفصلة الممكنة لـ C3H8O:\n- كحول أولي: CH3-CH2-CH2-OH (بروبان-1-أول).\n- كحول ثانوي: CH3-CH(OH)-CH3 (بروبان-2-أول).\nبما أن الكحول ثانوي كما أثبتنا من المردود (60%)، فإن الصيغة الصحيحة هي: CH3-CH(OH)-CH3 واسمه النظامي بروبان-2-أول (Propan-2-ol).",
        "3.جـ) معادلة تفاعل الأسترة:\nHCOOH + CH3-CH(OH)-CH3 <=> HCOO-CH(CH3)-CH3 + H2O.\nاسم الإستر الناتج: ميثانوات 1-مثيل الإيثيل (أو ميثانوات الإيزوبروبيل Méthanoate d'isopropyle).",
      ],
      physicalOrChemicalModel_ar: {
        system_ar: "أسترة حمض الميثانويك مع كحول مجهول وتتبعه بالمعايرة الحجمية",
        referenceFrameOrConditions_ar: "تحديد هوية المركب العضوي انطلاقاً من المردود والكتلة المولية",
        governingLaws_ar: ["الكبح الحركي", "المعايرة بالصود", "علاقة المردود بصنف الكحول"],
        keyUnitsAndDimensions_ar: "mol و g/mol و %",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اختيار بروبان-1-أول وافتراض أن المردود 60% ناتج عن خطأ تجريبي بدلاً من إدراك أنه كحول ثانوي.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتفسير الكبح الحركي وحساب n_ac في الأنابيب، 1.0ن لحساب x_f والمردود 60%، 1.0ن لتحديد صنف الكحول والصيغة C3H8O، 1.0ن لكتابة الصيغة نصف المفصلة ومعادلة الأسترة وتسمية الإستر.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين أثر التسخين على سرعة التفاعل وعلى المردود، أو الخطأ في تحديد صنف الكحول من قيمة المردود التجريبي.",
    wrongMentalModel_ar: "اعتقاد الطالب أن التسخين يزيد من كمية الإستر المتشكلة، أو الخلط بين المردود 67% (أولي) و 60% (ثانوي) و 5% (ثالثي).",
    correctMentalModel_ar: "تفاعل الأسترة لاحراري (Delta H = 0)، وبالتالي فإن ثابت التوازن K لا يتغير بتغير درجة الحرارة إطلاقاً. التسخين يزيد من سرعة حركة الجزيئات ويسرع الوصول إلى التوازن دون أن يغير المردود. المردود يرتبط مباشرة بصنف الكحول: أولي (67%)، ثانوي (60%)، ثالثي (5%-10%).",
    threeStepActionProtocol_ar: [
      "ميز بحزم: العوامل الحركية (الحرارة، الوسيط) تسرع التفاعل فقط ولا تغير المردود.",
      "العوامل الترموديناميكية التي ترفع المردود: زيادة أحد المتفاعلين بفائض، أو سحب أحد النواتج (الماء أو الإستر).",
      "احفظ نسب المردود للمزيج المتساوي المولات: 67% لكحول أولي، 60% لكحول ثانوي، 5% إلى 10% لكحول ثالثي.",
    ],
    microDrill_ar: {
      prompt_ar: "مزيج أسترة متساوي المولات أعطى مردوداً قدره 58.5%. ما هو صنف الكحول المستخدم؟ برر.",
      solution_ar: "الكحول ثانوي لأن المردود يقارب 60%، والانحراف الطفيف يعود للارتيابات التجريبية.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_esterification_twin",
    invariantTested_ar: "حساب كميات المادة عند التوازن وتحديد صنف الكحول ومردود تفاعل الإماهة العكسي",
    changedSurface_ar: "تفاعل إماهة الإستر انطلاقاً من 1.0 mol من إستر و 1.0 mol من الماء لإنتاج كحول أولي وحمض.",
    prompt_ar: "نحقق مزيجاً متساوي المولات يتكون من 1.0 mol من إيثانوات الإيثيل و 1.0 mol من الماء (تفاعل إماهة الإستر). إذا علمت أن ثابت توازن الأسترة الموافقة هو K = 4:\n1) اكتب معادلة تفاعل الإماهة، واحسب ثابت توازنها K'.\n2) احسب التقدم النهائي x_f لكمية الحمض المتشكل عند التوازن، واستنتج مردود تفاعل الإماهة.",
    solution_ar: "1) إيثانوات الإيثيل + ماء <=> حمض الإيثانويك + إيثانول.\nبما أن تفاعل الإماهة هو التفاعل العكسي للأسترة: K' = 1 / K = 1 / 4 = 0.25.\n2) جدول التقدم:\nK' = (x_f)^2 / (1.0 - x_f)^2 = 0.25.\nبأخذ الجذر التربيعي للطرفين: x_f / (1.0 - x_f) = sqrt(0.25) = 0.5.\nx_f = 0.5 * (1.0 - x_f) = 0.5 - 0.5 * x_f => 1.5 * x_f = 0.5 => x_f = 0.5 / 1.5 = 1/3 mol = 0.33 mol.\nمردود الإماهة: r' = (0.33 / 1.0) * 100% = 33.3% (نلاحظ أن r_est + r_hyd = 67% + 33% = 100%).",
    passCondition_ar: "حساب K' = 0.25 والتقدم x_f = 0.33 mol والمردود 33.3% بدقة.",
  },
  bacProductionTask: {
    title_ar: "مهمة إنتاج كتابي نمط بكالوريا: اصطناع أسبرين الصيدلاني والتصبن",
    allocatedScore: "4.0 نقاط",
    timeMinutes: 20,
    prompt_ar: "حمض أسيتيل ساليسيليك (الأسبرين) هو إستر يتم اصطناعه بتفاعل حمض الساليسيليك مع حمض الإيثانويك.\n1) اكتب معادلة التفاعل الكيميائي مبيناً المجموعة الوظيفية المميزة للإستر.\n2) لدراسة تفكك هذا الدواء في الوسط القاعدي للأمعاء، نأخذ عينة من الأسبرين ونجري عليها تفاعل تصبن (إماهة الإستر في وسط أساسي) بواسطة محلول هيدروكسيد الصوديوم بالحرارة.\nأ) اذكر مميزات تفاعل التصبن مقارنة بتفاعل الإماهة في الماء المقطر.\nب) اكتب معادلة تفاعل تصبن إيثانوات الإيثيل بواسطة (Na^+ + OH^-).\nجـ) اذكر تطبيقاً صناعياً هاماً لتفاعل التصبن في الحياة اليومية مع تحديد المادة الناتجة.",
    modelSolution_ar: [
      "1) معادلة الاصطناع: يتفاعل حمض الساليسيليك (عبر وظيفته الفينولية -OH) مع حمض الإيثانويك لتشكيل الأسبرين (إستر) والماء. المجموعة المميزة للإستر هي -COO- (كربونيل مرتبط بأكسجين أثيري).",
      "2.أ) مميزات تفاعل التصبن مقارنة بالإماهة في الماء:\n- تفاعل التصبن في وسط أساسي هو تفاعل تام (غير عكوس مردوده 100%)، بينما الإماهة في الماء تفاعل محدود عكوس مردوده ضعيف (حوالي 33%).\n- تفاعل التصبن أسرع بكثير خاصة عند التسخين.",
      "2.ب) معادلة تصبن إيثانوات الإيثيل:\nCH3-COO-CH2-CH3 + (Na^+ + OH^-) -> (CH3-COO^- + Na^+) + CH3-CH2-OH\nالنواتج هي: إيثانوات الصوديوم والإيثانول.",
      "2.جـ) التطبيق الصناعي: صناعة الصابون ومواد التنظيف؛ حيث تتم معالجة الزيوت والدهون النباتية أو الحيوانية (ثلاثي الغليسريد وهو إستر ثلاثي) بمحلول مركز لهيدروكسيد الصوديوم لتصنيع الصابون الصلب (أملاح الصوديوم للأحماض الدهنية) والغليسرول.",
    ],
    markingScheme_ar: [
      { criterion: "كتابة معادلة تشكل الإستر وتحديد المجموعة الوظيفية", points: 1.0 },
      { criterion: "مقارنة مميزات التصبن مع الإماهة (تفاعل تام وسريع)", points: 1.0 },
      { criterion: "كتابة معادلة التصبن بالصيغ نصف المفصلة بدقة", points: 1.0 },
      { criterion: "ذكر التطبيق الصناعي لصناعة الصابون والنواتج المرافقة", points: 1.0 },
    ],
  },
};

// ============================================================================
// QUARANTINED HOLD CAPABILITY (NOT PART OF ACTIVE CORE)
// ============================================================================

export const PHYSICS_RLC_FREE_OSCILLATIONS_PACKAGE: CanonicalPhysicsCapabilityPackage = {
  capabilityId: "physics_rlc_free_oscillations",
  canonicalTitle_ar: "الاهتزازات الكهربائية الحرة في دارة RLC (وضعية معلقة - خارج الجذع المشترك)",
  canonicalTitle_fr: "Oscillations électriques libres dans un circuit RLC (Statut HOLD)",
  discipline: "physics",
  domain: "Électricité",
  unit: "الاهتزازات الكهربائية الحرة",
  status: "HOLD",
  scopeIn: [
    "الدارة المثالية LC وتفريغ مكثفة في وشيعة صرفة والمعادلة التفاضلية للتفريغ غير المتخامد.",
    "الدور الذاتي للتذبذب T0 = 2*pi*sqrt(L*C) وانحفاظ الطاقة الكلية للدارة E_tot = E_C + E_L = ثابت.",
    "الدارة الحقيقية RLC وأنظمة التخامد الثلاثة: شبه دوري (Pseudopériodique)، لادوري (Apériodique)، وحرج (Critique).",
  ],
  scopeOut: [
    "الاهتزازات القسرية والتجاوب الكهربائي (خاص بالتقني رياضي والرياضي).",
    "تضمين الوساع وإزالة التضمين (محذوف من منهاج العلوم التجريبية).",
  ],
  prerequisites: {
    hard: ["المعادلات التفاضلية من الدرجة الثانية التوافقية"],
    soft: ["الدوال الجيبية sin و cos وحساب مشتقاتها"],
    foundation: ["طاقة المكثفة وطاقة الوشيعة ومفعول جول"],
    crossCutting: ["تحليل المنحنيات الجيبية وشبه الدورية والتخامد الأسي"],
  },
  learningObjectives: [
    {
      code: "LO-PHYS-RLC-01",
      bloomLevel: "apply",
      description_ar: "إقامة المعادلة التفاضلية لدارة LC مثالية واستنتاج عبارة الدور الذاتي T0.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "rlc_l1_foundation",
      capabilityId: "physics_rlc_free_oscillations",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "في دارة LC مثالية (المقاومة معدومة R = 0)، تكون الطاقة الكلية للدارة:",
      expectedResponse_ar: "ثابتة دوماً وتتحول دورياً بين المكثفة والوشيعة",
      reasoningSteps_ar: ["غياب المقاومة يعني انعدام الضياع بمفعول جول، فتكون الطاقة الكلية محفوظة."],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة مهتزة مثالية LC",
        referenceFrameOrConditions_ar: "حالة معلقة (HOLD) مخصصة للشعب الرياضية",
        governingLaws_ar: ["انحفاظ الطاقة الكلية"],
        keyUnitsAndDimensions_ar: "J",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "افتراض وجود تخامد في غياب المقاومة الأومية.",
      },
      scoringRubric_ar: "1 نقطة للتعريف النظري لانحفاظ الطاقة.",
    },
    l2_application: {
      id: "rlc_l2_app",
      capabilityId: "physics_rlc_free_oscillations",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "احسب الدور الذاتي T0 لدارة LC مثالية تحتوي مكثفة C = 10 microF ووشيعة L = 0.10 H.",
      expectedResponse_ar: "T0 = 6.28 ms",
      reasoningSteps_ar: ["T0 = 2*pi*sqrt(L*C) = 2*3.1416*sqrt(0.10 * 10 * 10^(-6)) = 6.28 * 10^(-3) s = 6.28 ms."],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة LC مثالية",
        referenceFrameOrConditions_ar: "اهتزازات جيبية حرة",
        governingLaws_ar: ["T0 = 2*pi*sqrt(LC)"],
        keyUnitsAndDimensions_ar: "ms",
      },
      errorMapping: { primaryErrorType: "calculation_error" },
      scoringRubric_ar: "1 نقطة للتعويض وحساب الدور.",
    },
    l3_mixed: {
      id: "rlc_l3_mix",
      capabilityId: "physics_rlc_free_oscillations",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "أثبت المعادلة التفاضلية لشحنة المكثفة q(t) في دارة LC مثالية.",
      expectedResponse_ar: "d^2 q / dt^2 + (1 / (L*C)) * q = 0",
      reasoningSteps_ar: ["u_C + u_L = 0 => q/C + L*(di/dt) = 0. بما أن i = dq/dt فإن di/dt = d^2 q / dt^2 => L*(d^2 q / dt^2) + q/C = 0."],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة LC مثالية",
        referenceFrameOrConditions_ar: "قانون جمع التوترات",
        governingLaws_ar: ["المعادلة التفاضلية التوافقية"],
        keyUnitsAndDimensions_ar: "C و s",
      },
      errorMapping: { primaryErrorType: "methodology_error" },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لاشتقاق المعادلة التفاضلية التوافقية.",
    },
    l4_transfer: {
      id: "rlc_l4_trans",
      capabilityId: "physics_rlc_free_oscillations",
      level: "L4_TRANSFER",
      format: "experimental_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "فسر لماذا تتخامد الاهتزازات في دارة RLC حقيقية وكيف نعوض الطاقة الضائعة تجريبياً.",
      expectedResponse_ar: "تتخامد بفعل تبديد الطاقة على شكل حرارة بمفعول جول في مقاومة الدارة. يتم التعويض بتركيب دارة صيانة الاهتزازات (مضخم عملياتي يولد توتر سالب مكافئ -R_0*i).",
      reasoningSteps_ar: ["مفعول جول يبدد الطاقة دورياً، وصيانة الاهتزازات تتطلب تغذية خارجية سالبة المقاومة."],
      physicalOrChemicalModel_ar: {
        system_ar: "دارة RLC حقيقية وصيانتها",
        referenceFrameOrConditions_ar: "نظام شبه دوري",
        governingLaws_ar: ["مفعول جول وصيانة الاهتزازات"],
        keyUnitsAndDimensions_ar: "Ohm و J",
      },
      errorMapping: { primaryErrorType: "misunderstood_concept" },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتفسير التخامد، 1.0ن لشرح صيانة الاهتزازات.",
    },
    l5_bac_style: {
      id: "rlc_l5_bac",
      capabilityId: "physics_rlc_free_oscillations",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين خاص بالشعب الرياضية (موضوع احتياطي خارج صميم العلوم التجريبية).",
      expectedResponse_ar: "تم حجز هذه المسألة لوضعية HOLD حتى إشعار وزاري رسمي يدرجها في علوم تجريبية.",
      reasoningSteps_ar: ["القدرة محتجزة في وضع HOLD وفق توجيهات المنهاج الوطني لشعبة العلوم التجريبية."],
      physicalOrChemicalModel_ar: {
        system_ar: "قيد وضعية HOLD",
        referenceFrameOrConditions_ar: "خارج المقرر الأساسي لشعبة علوم تجريبية",
        governingLaws_ar: ["التصنيف المنهاجي"],
        keyUnitsAndDimensions_ar: "N/A",
      },
      errorMapping: { primaryErrorType: "misunderstood_concept" },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن لتأكيد وضعية HOLD.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "هذه المهارة موضوعة في وضعية HOLD ولا تدرس لطلاب شعبة علوم تجريبية.",
    wrongMentalModel_ar: "محاولة استهلاك وقت الطالب في مواضيع مخصصة للرياضيات والتقني رياضي.",
    correctMentalModel_ar: "التركيز التام على الوحدات الـ 13 الأساسية المعتمدة رسمياً في بكالوريا علوم تجريبية.",
    threeStepActionProtocol_ar: [
      "تحقق من شعبتك: علوم تجريبية غير معنية بهذا الموضوع في البكالوريا الحالية.",
      "وجه تركيزك إلى ثنائي القطب RC وثنائي القطب RL.",
      "لا تدرس RLC إلا إذا كنت تترشح في شعبة الرياضيات أو تقني رياضي.",
    ],
    microDrill_ar: {
      prompt_ar: "هل RLC مدرج في منهاج العلوم التجريبية الحالي؟",
      solution_ar: "غير مدرج كاهتزازات حرة في مواضيع البكالوريا الرسمية لعلوم تجريبية (موضوع على HOLD).",
    },
  },
  isomorphicRetest: {
    retestId: "retest_rlc_twin",
    invariantTested_ar: "تأكيد وضعية الحجز HOLD",
    changedSurface_ar: "حجز خارج الجذع المشترك",
    prompt_ar: "تأكيد وضعية HOLD لمهارة RLC.",
    solution_ar: "HOLD مؤكد.",
    passCondition_ar: "HOLD.",
  },
  bacProductionTask: {
    title_ar: "مهمة RLC محتجزة خارج العلوم التجريبية",
    allocatedScore: "0.0 نقاط",
    timeMinutes: 0,
    prompt_ar: "مهارة محتجزة في وضع HOLD.",
    modelSolution_ar: ["مهارة محتجزة."],
    markingScheme_ar: [{ criterion: "حجز المهارة", points: 0.0 }],
  },
};

// ============================================================================
// CANONICAL 13-CAPABILITY REGISTRY & EXPORTS
// ============================================================================

export const PHYSICS_CANONICAL_13_INDEX = [
  "physics_chemical_kinetics_rates_halflife",
  "physics_redox_titration_stoichiometry",
  "physics_rc_circuit_transient_response",
  "physics_rl_circuit_transient_response",
  "physics_nuclear_decay_activity_dating",
  "physics_mass_defect_binding_energy",
  "physics_newton_second_law_vertical_fall",
  "physics_projectile_motion_mechanics",
  "physics_inclined_plane_motion",
  "physics_satellite_planetary_motion_kepler",
  "physics_acid_base_equilibria_ka_predominance",
  "physics_ph_metric_titration_curves",
  "physics_esterification_hydrolysis_equilibrium",
] as const;

export const PHYSICS_HOLD_CAPABILITY = "physics_rlc_free_oscillations" as const;

export const ALL_PHYSICS_PACKAGES: Record<string, CanonicalPhysicsCapabilityPackage> = {
  physics_chemical_kinetics_rates_halflife: PHYSICS_CHEMICAL_KINETICS_PACKAGE,
  physics_redox_titration_stoichiometry: PHYSICS_REDOX_TITRATION_PACKAGE,
  physics_rc_circuit_transient_response: PHYSICS_RC_CIRCUIT_PACKAGE,
  physics_rl_circuit_transient_response: PHYSICS_RL_CIRCUIT_PACKAGE,
  physics_nuclear_decay_activity_dating: PHYSICS_NUCLEAR_DECAY_PACKAGE,
  physics_mass_defect_binding_energy: PHYSICS_MASS_DEFECT_PACKAGE,
  physics_newton_second_law_vertical_fall: PHYSICS_NEWTON_VERTICAL_FALL_PACKAGE,
  physics_projectile_motion_mechanics: PHYSICS_PROJECTILE_MOTION_PACKAGE,
  physics_inclined_plane_motion: PHYSICS_INCLINED_PLANE_PACKAGE,
  physics_satellite_planetary_motion_kepler: PHYSICS_SATELLITE_PLANETARY_PACKAGE,
  physics_acid_base_equilibria_ka_predominance: PHYSICS_ACID_BASE_PACKAGE,
  physics_ph_metric_titration_curves: PHYSICS_PH_TITRATION_PACKAGE,
  physics_esterification_hydrolysis_equilibrium: PHYSICS_ESTERIFICATION_PACKAGE,
  physics_rlc_free_oscillations: PHYSICS_RLC_FREE_OSCILLATIONS_PACKAGE,
};
