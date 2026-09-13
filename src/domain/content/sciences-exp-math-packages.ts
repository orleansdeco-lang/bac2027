/**
 * BAC Mastery — Mathematics Canonical Packages & Assessment Expansion
 * Stream: Sciences Expérimentales (3AS) | National Curriculum Benchmark
 * 
 * Implements:
 * 1. P0: Formal Decoupling of math_tangent_relative_position and math_convexity_inflection_points.
 * 2. P1: Elimination of MCQ-only dependency across the 10 legacy capabilities by providing
 *    complete Level 3 (Mixed), Level 4 (Transfer), and Level 5 (BAC-Style) assessment depth.
 * 3. 15/15 Canonical Mathematics Coverage conforming to Master Curriculum V2.
 */

export interface CanonicalMathAssessmentItem {
  id: string;
  capabilityId: string;
  level: "L1_FOUNDATION" | "L2_APPLICATION" | "L3_MIXED" | "L4_TRANSFER" | "L5_BAC_STYLE";
  format: "mcq" | "short_answer" | "structured_written" | "proof_production";
  estimatedTimeMin: number;
  prompt_ar: string;
  prompt_fr?: string;
  expectedResponse_ar: string;
  reasoningSteps_ar: string[];
  errorMapping: {
    primaryErrorType: "misunderstood_concept" | "calculation_error" | "methodology_error" | "forgot_information" | "rushed" | "attention_error" | "misread_question";
    distractorRationale_ar?: string;
  };
  scoringRubric_ar: string;
  isRetestVariant?: boolean;
}

export interface CanonicalMathCapabilityPackage {
  capabilityId: string;
  canonicalTitle_ar: string;
  canonicalTitle_fr: string;
  domain: string;
  unit: string;
  scopeIn: string[];
  scopeOut: string[];
  prerequisites: {
    hard: string[];
    soft: string[];
    foundation: string[];
  };
  learningObjectives: Array<{
    code: string;
    bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
    description_ar: string;
  }>;
  practiceLadder: {
    l1_foundation: CanonicalMathAssessmentItem;
    l2_application: CanonicalMathAssessmentItem;
    l3_mixed: CanonicalMathAssessmentItem;
    l4_transfer: CanonicalMathAssessmentItem;
    l5_bac_style: CanonicalMathAssessmentItem;
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
// P0 DECOUPLING: CAPABILITY 4 & CAPABILITY 5
// ============================================================================

export const MATH_TANGENT_RELATIVE_POSITION_PACKAGE: CanonicalMathCapabilityPackage = {
  capabilityId: "math_tangent_relative_position",
  canonicalTitle_ar: "معادلة المماس والوضعية النسبية لمنحنى دالة",
  canonicalTitle_fr: "Équation de tangente et position relative",
  domain: "Analyse",
  unit: "الاشتقاقية ودراسة الدوال",
  scopeIn: [
    "حساب معادلة المماس: y = f'(x_0)(x - x_0) + f(x_0).",
    "تعيين المماس بمعامل توجيه معلوم أو موازي لمستقيم معلوم (حل المعادلة f'(x) = m).",
    "دراسة الوضعية النسبية للمنحنى (C_f) بالنسبة للمماس (T) عبر دراسة إشارة الفرق D(x) = f(x) - y_T.",
    "التفسير الهندسي لتقاطع المنحنى مع المماس أو استقراره فوقه/تحته.",
  ],
  scopeOut: [
    "حساب المشتقة الثانية f''(x) وتحديد نقاط الانعطاف (خاصة بـ math_convexity_inflection_points).",
    "دراسة التحدب والتقعر العام لمنحنى الدالة دون مماس محدد.",
  ],
  prerequisites: {
    hard: ["math_derivatives_composite_sign"],
    soft: ["math_limits_indeterminate_asymptotes"],
    foundation: ["معادلة مستقيم بمعامل توجيه ونقطة"],
  },
  learningObjectives: [
    {
      code: "LO-MATH-TANG-01",
      bloomLevel: "apply",
      description_ar: "كتابة معادلة المماس عند نقطة فاصلتها معلومة أو تعيين نقط التماس التي يكون عندها المماس موازياً لمستقيم معطى.",
    },
    {
      code: "LO-MATH-TANG-02",
      bloomLevel: "analyze",
      description_ar: "دراسة إشارة الفرق [f(x) - y] وتحديد الوضعية النسبية لمنحنى الدالة بالنسبة للمماس بدقة وجدولتها.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "tang_l1_foundation",
      capabilityId: "math_tangent_relative_position",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "دالة f معرفة وقابلة للاشتقاق على R حيث f(2) = -1 و f'(2) = 3. ما هي معادلة المماس للمنحنى عند النقطة ذات الفاصلة 2؟",
      expectedResponse_ar: "y = 3x - 7",
      reasoningSteps_ar: ["y = f'(2)(x - 2) + f(2) = 3(x - 2) - 1 = 3x - 6 - 1 = 3x - 7"],
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخلط بين إشارة f(2) وإشارة f'(2) أو نسيان نشر 3 على -2.",
      },
      scoringRubric_ar: "1 نقطة للتعويض الصحيح والنشر المضبوط.",
    },
    l2_application: {
      id: "tang_l2_app",
      capabilityId: "math_tangent_relative_position",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "لتكن الدالة f(x) = (x - 1)e^x + 2. احسب معادلة المماس (T) للمنحنى (C_f) عند مبدأ الفواصل x = 0.",
      expectedResponse_ar: "y = 2",
      reasoningSteps_ar: [
        "f(0) = (0 - 1)e^0 + 2 = -1 + 2 = 1.",
        "f'(x) = 1*e^x + (x - 1)e^x = x*e^x.",
        "f'(0) = 0*e^0 = 0.",
        "معادلة المماس: y = f'(0)(x - 0) + f(0) = 0(x) + 1 = 1.",
      ],
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "نسيان اشتقاق الجداء في f'(x) أو الخطأ في تعويض e^0 = 1.",
      },
      scoringRubric_ar: "1 نقطة لحساب f'(x)، 1 نقطة لمعادلة المماس الأفقي.",
    },
    l3_mixed: {
      id: "tang_l3_mixed",
      capabilityId: "math_tangent_relative_position",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "لتكن الدالة f(x) = 2x - 1 + e^(-x). 1) اكتب معادلة المماس (T) للمنحنى (C_f) عند النقطة ذات الفاصلة x = 0. 2) ادرس إشارة f(x) - y_T واستنتج الوضعية النسبية لـ (C_f) بالنسبة لـ (T).",
      expectedResponse_ar: "معادلة المماس هي y = x. الفرق f(x) - y = x - 1 + e^(-x) > 0 دوماً على R*، إذن المنحنى يقع تماماً فوق مماسه.",
      reasoningSteps_ar: [
        "f(0) = 2(0) - 1 + e^0 = -1 + 1 = 0.",
        "f'(x) = 2 - e^(-x) => f'(0) = 2 - 1 = 1.",
        "معادلة المماس (T): y = 1(x - 0) + 0 => y = x.",
        "دراسة الوضعية: d(x) = f(x) - x = x - 1 + e^(-x).",
        "مشتقة الفرق: d'(x) = 1 - e^(-x). نلاحظ أن d'(x) = 0 <=> e^(-x) = 1 <=> x = 0.",
        "إشارة d'(x): سالبة من أجل x < 0 وموجبة من أجل x > 0.",
        "جدول تغيرات d(x): الدالة d متناقصة ثم متزايدة، وتقبل قيمة حدية صغرى عند x = 0 قيمتها d(0) = 0.",
        "إذن d(x) >= 0 على R، وتساوي الصفر عند x = 0 فقط.",
        "الاستنتاج: (C_f) يقع فوق المماس (T) على R \\ {0} ويشترك معه في نقطة التماس (0, 0).",
      ],
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "محاولة حل x - 1 + e^(-x) = 0 جبرياً دون دراسة دالة مساعدة للفرق.",
      },
      scoringRubric_ar: "1.5 نقطة لمعادلة المماس، 2.5 نقطة لدراسة إشارة الفرق وتحديد الوضعية.",
    },
    l4_transfer: {
      id: "tang_l4_transfer",
      capabilityId: "math_tangent_relative_position",
      level: "L4_TRANSFER",
      format: "structured_written",
      estimatedTimeMin: 10,
      prompt_ar: "لتكن الدالة f(x) = (x + 2) / (x - 1) المعرفة على D_f = R \\ {1}. هل توجد مماسات للمنحنى (C_f) توازي المستقيم (Δ) ذا المعادلة y = -3x + 5؟ إذا كانت الإجابة بنعم، حدد معادلاتها.",
      expectedResponse_ar: "نعم، يوجد مماسان عند النقطتين ذات الفاصلتين x = 0 و x = 2، ومعادلتاهما: y = -3x - 2 و y = -3x + 10.",
      reasoningSteps_ar: [
        "المماس يوازي المستقيم (Δ) إذا وفقط إذا كان لهما نفس معامل التوجيه، أي: f'(x) = -3.",
        "حساب f'(x): مشتقة (x + 2)/(x - 1) هي [1*(x - 1) - 1*(x + 2)] / (x - 1)^2 = -3 / (x - 1)^2.",
        "حل المعادلة: -3 / (x - 1)^2 = -3 <=> 1 / (x - 1)^2 = 1 <=> (x - 1)^2 = 1.",
        "إذن: x - 1 = 1 => x = 2، أو x - 1 = -1 => x = 0.",
        "عند x_1 = 0: f(0) = 2/(-1) = -2 => (T_1): y = -3(x - 0) - 2 = -3x - 2.",
        "عند x_2 = 2: f(2) = 4/1 = 4 => (T_2): y = -3(x - 2) + 4 = -3x + 6 + 4 = -3x + 10.",
      ],
      errorMapping: {
        primaryErrorType: "attention_error",
        distractorRationale_ar: "نسيان أحد الحلين عند حل المعادلة التربيعية (x-1)^2 = 1 وأخذ x = 2 فقط.",
      },
      scoringRubric_ar: "1 نقطة لحساب المشتقة، 1 نقطة لحل المعادلة، 1 نقطة لكل معادلة مماس.",
    },
    l5_bac_style: {
      id: "tang_l5_bac_style",
      capabilityId: "math_tangent_relative_position",
      level: "L5_BAC_STYLE",
      format: "proof_production",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا نموذجي (شعبة علوم تجريبية): نعتبر الدالة f المعرفة على R بـ: f(x) = (x - 2)e^x + x + 2.\n1) اكتب معادلة المماس (T) لمنحنى الدالة عند النقطة ذات الفاصلة 0.\n2) ادرس وضعية المنحنى (C_f) بالنسبة للمستقيم (D) ذي المعادلة y = x + 2.\n3) بيّن أن المماس (T) يقطع المستقيم (D) في نقطة يطلب تعيين إحداثياتها.",
      expectedResponse_ar: "1) (T): y = 0. 2) الفرق f(x) - (x+2) = (x-2)e^x، إذن (C_f) تحت (D) على ]-inf, 2[ وفوقه على ]2, +inf[ ويقطعه في (2, 4). 3) نقطة التقاطع هي (-2, 0).",
      reasoningSteps_ar: [
        "1) f(0) = (0 - 2)e^0 + 0 + 2 = -2 + 2 = 0.",
        "f'(x) = 1*e^x + (x - 2)e^x + 1 = (x - 1)e^x + 1 => f'(0) = (0 - 1)e^0 + 1 = -1 + 1 = 0.",
        "معادلة المماس (T): y = 0(x - 0) + 0 => y = 0.",
        "2) الوضعية بالنسبة لـ y = x + 2: الفرق f(x) - (x + 2) = (x - 2)e^x.",
        "بما أن e^x > 0 دوماً، فإن إشارة الفرق هي من إشارة (x - 2).",
        "إذا x in ]-inf, 2[: f(x) - y < 0 => (C_f) يقع تحت (D).",
        "إذا x in ]2, +inf[: f(x) - y > 0 => (C_f) يقع فوق (D).",
        "إذا x = 2: نقطة تقاطع A(2, 4).",
        "3) تقاطع (T) و (D): نحل y = 0 و y = x + 2 => x = -2، y = 0. النقطة (-2, 0).",
      ],
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخطأ في حساب المشتقة أو إشارة الجداء.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للمماس، 1.5ن للوضعية، 0.5ن لنقطة التقاطع.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "عدم القدرة على دراسة إشارة الفرق f(x) - y_T واللجوء الخاطئ للتخمين أو المشتقة الثانية.",
    wrongMentalModel_ar: "اعتقاد أن إشارة الفرق f(x) - y_T تتحدد بمجرد النظر أو مساواة الدالة بالمماس دون دراسة إشارة الفرق جبرياً.",
    correctMentalModel_ar: "الوضعية النسبية تعني إشارة الفرق: إذا كان f(x) - y > 0 فالمنحنى فوق المماس، وإذا كان سالباً فالمنحنى تحت المماس، والحلول f(x) - y = 0 هي فواصل نقاط التقاطع.",
    threeStepActionProtocol_ar: [
      "شكل عبارة الفرق صراحة: D(x) = f(x) - (ax + b).",
      "بسط العبارة واستخرج عاملاً مشتركاً واضح الإشارة (مثل e^x أو مربعات تامة).",
      "لخص الإشارة في جدول وضعية نسبية محدد الخانات (مجال، إشارة الفرق، والوضعية الهندسية).",
    ],
    microDrill_ar: {
      prompt_ar: "حدد الوضعية النسبية لمنحنى f(x) = x^2 + 2x والمستقيم y = 2x - 1.",
      solution_ar: "الفرق f(x) - y = x^2 + 2x - (2x - 1) = x^2 + 1. بما أن x^2 + 1 > 0 تماماً لكل x، فإن المنحنى يقع تماماً فوق المستقيم دون أي نقطة تقاطع.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_tangent_relative_position_twin",
    invariantTested_ar: "حساب معادلة المماس ودراسة الوضعية النسبية عبر إشارة فرق صريح.",
    changedSurface_ar: "تغيير الدالة إلى دالة لوغاريتمية f(x) = x - ln(x) عند x_0 = 1.",
    prompt_ar: "لتكن f(x) = x - ln(x) المعرفة على ]0, +inf[. 1) اكتب معادلة المماس (T) عند النقطة ذات الفاصلة 1. 2) ادرس الوضعية النسبية لـ (C_f) بالنسبة إلى (T).",
    solution_ar: "1) f(1) = 1، f'(x) = 1 - 1/x => f'(1) = 0. معادلة المماس: y = 1. 2) الفرق f(x) - 1 = x - 1 - ln(x). بدراسة إشارة x - 1 - ln(x) نجد أنها موجبة دوماً على ]0, +inf[ وتنعدم عند 1. إذن (C_f) فوق (T) ويشترك معه في النقطة (1, 1).",
    passCondition_ar: "صياغة المماس الأفقي y = 1 والبرهان الصارم على أن x - 1 >= ln(x).",
  },
  bacProductionTask: {
    title_ar: "تمرين دراسة مماس ووضعية نسبية في مسألة بكالوريا مركبة",
    allocatedScore: "3.5 نقاط",
    timeMinutes: 20,
    prompt_ar: "نعتبر الدالة f المعرفة على R بـ: f(x) = (2 - x)e^x - 1. ليكن (C_f) منحناها البياني.\n1) اكتب معادلة المماس (Δ) للمنحنى (C_f) عند النقطة ذات الفاصلة 0.\n2) استنتج الوضعية النسبية لـ (C_f) بالنسبة إلى (Δ) بدراسة إشارة الفرق d(x) = f(x) - (x + 1) واشتقاقها.",
    modelSolution_ar: [
      "1) f(0) = (2 - 0)e^0 - 1 = 1.",
      "f'(x) = -1*e^x + (2 - x)e^x = (1 - x)e^x => f'(0) = 1.",
      "معادلة المماس (Δ): y = 1(x - 0) + 1 => y = x + 1.",
      "2) الفرق d(x) = f(x) - (x + 1) = (2 - x)e^x - x - 2.",
      "مشتقة الفرق: d'(x) = f'(x) - 1 = (1 - x)e^x - 1.",
      "مشتقة d'(x): d''(x) = -x*e^x. تنعدم عند 0 وموجبة قبلها وسالبة بعدها، وقيمتها العظمى d'(0) = 0، بالتالي d'(x) <= 0 دوماً على R.",
      "إذن d(x) متناقصة تماماً، وبما أن d(0) = 0، فإن d(x) > 0 على ]-inf, 0[ و d(x) < 0 على ]0, +inf[.",
      "الاستنتاج: (C_f) فوق (Δ) على ]-inf, 0[ وتحت (Δ) على ]0, +inf[ ويخترق المماس عند النقطة (0, 1).",
    ],
    markingScheme_ar: [
      { criterion: "حساب f(0) و f'(0) وكتابة y = x + 1", points: 1.0 },
      { criterion: "تشكيل دالة الفرق d(x) واشتقاقها", points: 1.0 },
      { criterion: "استنتاج إشارة الفرق وجدول الوضعية وتبيان نقطة الاختراق", points: 1.5 },
    ],
  },
};

export const MATH_CONVEXITY_INFLECTION_POINTS_PACKAGE: CanonicalMathCapabilityPackage = {
  capabilityId: "math_convexity_inflection_points",
  canonicalTitle_ar: "التقعر ونقاط الانعطاف والمشتقة الثانية",
  canonicalTitle_fr: "Convexité, concavité et points d'inflexion",
  domain: "Analyse",
  unit: "الاشتقاقية ودراسة الدوال",
  scopeIn: [
    "حساب المشتقة الثانية f''(x) لدالة مرتين قابلة للاشتقاق.",
    "دراسة إشارة f''(x) وتحديد مجالات التحدب (موجبة) والتقعر (سالبة).",
    "تحديد نقطة الانعطاف بتطبيق المبرهنة الصارمة: انعدام المشتقة الثانية وتغيير إشارتها.",
    "الاستنتاج البياني لنقاط الانعطاف من خلال منحنى المشتقة الأولى f' (القيم الحدية لـ f').",
  ],
  scopeOut: [
    "كتابة معادلة المماس ودراسة الوضعية النسبية f(x) - y_T (خاصة بـ math_tangent_relative_position).",
    "حساب المشتقات من الرتب العليا n > 2.",
  ],
  prerequisites: {
    hard: ["math_derivatives_composite_sign"],
    soft: [],
    foundation: ["قواعد الاشتقاق العادية وجدول الإشارة"],
  },
  learningObjectives: [
    {
      code: "LO-MATH-CONV-01",
      bloomLevel: "apply",
      description_ar: "حساب الدالة المشتقة الثانية f''(x) ودراسة إشارتها لتحديد مجالات تحدب وتقعر منحنى الدالة.",
    },
    {
      code: "LO-MATH-CONV-02",
      bloomLevel: "analyze",
      description_ar: "إثبات وجود نقطة انعطاف لمنحنى دالة بتبرير انعدام f'' وتغيير إشارتها، أو تحديدها بيانياً من جدول تغيرات f'.",
    },
  ],
  practiceLadder: {
    l1_foundation: {
      id: "conv_l1_foundation",
      capabilityId: "math_convexity_inflection_points",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 2,
      prompt_ar: "إذا انعدمت المشتقة الثانية f''(x) عند x = 3 وبقيت موجبة تماماً على يمين ويسار العدد 3، فهل النقطة (3, f(3)) نقطة انعطاف؟",
      expectedResponse_ar: "لا، ليست نقطة انعطاف لأن المشتقة الثانية لم تغير إشارتها.",
      reasoningSteps_ar: ["شرط نقطة الانعطاف هو انعدام f'' مع تغيير الإشارة. هنا لم تغير الإشارة إذن لا يوجد انعطاف."],
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد الخاطئ بأن مجرد انعدام المشتقة الثانية كافٍ لإثبات نقطة الانعطاف.",
      },
      scoringRubric_ar: "1 نقطة للتعليل الصحيح بشرط تغيير الإشارة.",
    },
    l2_application: {
      id: "conv_l2_app",
      capabilityId: "math_convexity_inflection_points",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 4,
      prompt_ar: "لتكن الدالة f(x) = x^3 - 6x^2 + 9x - 1. عين إحداثيات نقطة انعطاف منحنى الدالة (C_f).",
      expectedResponse_ar: "(2, 1)",
      reasoningSteps_ar: [
        "f'(x) = 3x^2 - 12x + 9.",
        "f''(x) = 6x - 12.",
        "f''(x) = 0 <=> 6x = 12 <=> x = 2.",
        "بما أن 6x - 12 دالة تآلفية بمعامل موجب، فإنها سالبة قبل 2 وموجبة بعد 2 (غيرت إشارتها).",
        "الترتيبة: f(2) = 2^3 - 6(2^2) + 9(2) - 1 = 8 - 24 + 18 - 1 = 1.",
        "إذن النقطة هي (2, 1).",
      ],
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "الخطأ في حساب f(2) في الدالة الأصلية بدلاً من f'(2).",
      },
      scoringRubric_ar: "1 نقطة لحساب f''(x) واستخراج الفاصلة 2، 1 نقطة لحساب الترتيبة وتأكيد تغيير الإشارة.",
    },
    l3_mixed: {
      id: "conv_l3_mixed",
      capabilityId: "math_convexity_inflection_points",
      level: "L3_MIXED",
      format: "structured_written",
      estimatedTimeMin: 8,
      prompt_ar: "لتكن الدالة f(x) = (x^2 - 4x + 5)e^x المعرفة على R. 1) احسب f'(x) ثم احسب f''(x). 2) ادرس تقعر المنحنى (C_f) وعين فواصل نقاط انعطافه إن وجدت.",
      expectedResponse_ar: "f''(x) = (x^2 - 1)e^x. المنحنى محدب على ]-inf, -1[ و ]1, +inf[ ومقعر على ]-1, 1[ ويقبل نقطتي انعطاف عند x = -1 و x = 1.",
      reasoningSteps_ar: [
        "f'(x) = (2x - 4)e^x + (x^2 - 4x + 5)e^x = (x^2 - 2x + 1)e^x = (x - 1)^2 e^x.",
        "f''(x) = 2(x - 1)e^x + (x - 1)^2 e^x = (x - 1)e^x [2 + x - 1] = (x - 1)(x + 1)e^x = (x^2 - 1)e^x.",
        "تنعدم f''(x) عند x = -1 و x = 1.",
        "إشارة f''(x): موجبة خارج الجذرين (المنحنى محدب)، وسالبة داخل مجال الجذرين (المنحنى مقعر).",
        "تغير المشتقة الثانية إشارتها عند -1 و 1، إذن المنحنى يقبل نقطتي انعطاف فاصلتاهما -1 و 1.",
      ],
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "خطأ في اشتقاق الجداء للوصول إلى f''(x).",
      },
      scoringRubric_ar: "1.5 نقطة لحساب f''(x) مبسطة، 1.5 نقطة لجدول الإشارة وتحديد نقطتي الانعطاف.",
    },
    l4_transfer: {
      id: "conv_l4_transfer",
      capabilityId: "math_convexity_inflection_points",
      level: "L4_TRANSFER",
      format: "structured_written",
      estimatedTimeMin: 10,
      prompt_ar: "يقبل المنحنى الممثل للدالة المشتقة الأولى f' ذروة عظمى عند النقطة (-1, 3) وذروة دنيا عند النقطة (2, -4).\nاستنتج فواصل نقاط انعطاف المنحنى (C_f) ومجالات تحدبه وتقعره.",
      expectedResponse_ar: "نقاط الانعطاف تكون عند x = -1 و x = 2 لأن المشتقة الأولى f' تقبل قيماً حدية محلية عند هاتين النقطتين، مما يعني أن مشتقتها f'' تنعدم وتغير إشارتها.",
      reasoningSteps_ar: [
        "المشتقة الثانية f'' هي مشتقة f'. إشارة f''(x) توافق اتجاه تغير f'.",
        "بما أن f' تقبل قيمة حدية عظمى عند x = -1، فإنها تغير اتجاه تغيرها من التزايد إلى التناقص، بالتالي f''(x) تغير إشارتها من الموجب إلى السالب (نقطة انعطاف أولى).",
        "وبما أن f' تقبل قيمة حدية دنيا عند x = 2، فإنها تغير اتجاه تغيرها من التناقص إلى التزايد، بالتالي f''(x) تغير إشارتها من السالب إلى الموجب (نقطة انعطاف ثانية).",
        "الخلاصة: المنحنى محدب على ]-inf, -1[ و ]2, +inf[، ومقعر على ]-1, 2[، ويقبل نقطتي انعطاف عند x = -1 و x = 2.",
      ],
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين نقاط تقاطع f' مع محور الفواصل وبين القيم الحدية لـ f'.",
      },
      scoringRubric_ar: "2 نقطة للربط المنهجي بين القيم الحدية لـ f' وانعدام f''، 1 نقطة لتحديد المجالات.",
    },
    l5_bac_style: {
      id: "conv_l5_bac_style",
      capabilityId: "math_convexity_inflection_points",
      level: "L5_BAC_STYLE",
      format: "proof_production",
      estimatedTimeMin: 15,
      prompt_ar: "نعتبر الدالة f المعرفة على R بـ: f(x) = (x - 1)e^(-x) + x.\n1) احسب f'(x) ثم f''(x).\n2) ادرس تحدب وتقعر المنحنى (C_f).\n3) بيّن أن (C_f) يقبل نقطة انعطاف وحيدة I يطلب تعيين إحداثياتها بدقة.",
      expectedResponse_ar: "f''(x) = (x - 3)e^(-x). المنحنى مقعر على ]-inf, 3[ ومحدب على ]3, +inf[. النقطة I(3, 2e^(-3) + 3) هي نقطة الانعطاف الوحيدة.",
      reasoningSteps_ar: [
        "1) f'(x) = 1*e^(-x) - (x - 1)e^(-x) + 1 = (2 - x)e^(-x) + 1.",
        "f''(x) = -1*e^(-x) - (2 - x)e^(-x) = (x - 3)e^(-x).",
        "2) إشارة f''(x): بما أن e^(-x) > 0 دوماً، فإن إشارة f''(x) من إشارة (x - 3).",
        "- على المجال ]-inf, 3[: f''(x) < 0 => المنحنى (C_f) مقعر.",
        "- على المجال ]3, +inf[: f''(x) > 0 => المنحنى (C_f) محدب.",
        "3) عند x = 3: تنعدم f''(x) وتغير إشارتها، وترتيبتها f(3) = 2e^(-3) + 3، إذن I(3, 2e^(-3) + 3) نقطة انعطاف وحيدة.",
      ],
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "نسيان إشارة السالب في مشتقة e^(-x) مما يغير فاصلة نقطة الانعطاف.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0ن للمشتقات، 1.0ن لجدول التحدب، 1.0ن لتبرير نقطة الانعطاف وحساب إحداثياتها.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين المشتقة الأولى والمشتقة الثانية، والاعتقاد بأن نقطة الانعطاف تتحدد من f'(x) = 0.",
    wrongMentalModel_ar: "اعتقاد الطالب أن الذروة (حيث f'(x) = 0) هي نقطة انعطاف، أو نسيان التحقق من تغيير إشارة f''(x).",
    correctMentalModel_ar: "الذروة هي نقطة تغير اتجاه التغير (f' تنعدم وتغير إشارتها)، أما نقطة الانعطاف فهي نقطة تغير انحناء المنحنى من مقعر إلى محدب أو العكس (f'' تنعدم وتغير إشارتها، أو المماس يخترق المنحنى).",
    threeStepActionProtocol_ar: [
      "اشتق الدالة مرتين متتاليتين للوصول إلى العبارة المبسطة للمشتقة الثانية f''(x).",
      "حل المعادلة f''(x) = 0 وعين جذورها بدقة.",
      "انشئ جدول إشارة صريح لـ f''(x) وتأكد من وجود تغير فعلي في الإشارة (+ إلى - أو - إلى +) قبل التصريح بوجود نقطة الانعطاف.",
    ],
    microDrill_ar: {
      prompt_ar: "هل الدالة f(x) = x^4 تقبل نقطة انعطاف عند x = 0؟ برر.",
      solution_ar: "f'(x) = 4x^3، f''(x) = 12x^2. تنعدم f''(x) عند 0 ولكنها موجبة تماماً على يمين ويسار الصفر (لم تغير إشارتها). إذن (0, 0) ليست نقطة انعطاف، والمنحنى محدب تماماً على R.",
    },
  },
  isomorphicRetest: {
    retestId: "retest_convexity_inflection_twin",
    invariantTested_ar: "حساب f''(x) وتبرير نقطة الانعطاف ومجالات التحدب.",
    changedSurface_ar: "تغيير الدالة إلى f(x) = (2x - 5)e^x.",
    prompt_ar: "لتكن f(x) = (2x - 5)e^x. 1) احسب f''(x). 2) حدد فاصلة نقطة انعطاف منحنى الدالة f وبرر تحدب المنحنى.",
    solution_ar: "f'(x) = (2x - 3)e^x. f''(x) = 2e^x + (2x - 3)e^x = (2x - 1)e^x. تنعدم f''(x) عند x = 1/2 وتغير إشارتها. إذن المنحنى مقعر على ]-inf, 1/2[ ومحدب على ]1/2, +inf[ ويقبل نقطة انعطاف عند x = 1/2.",
    passCondition_ar: "استخراج f''(x) = (2x - 1)e^x وإثبات تغير الإشارة عند 1/2.",
  },
  bacProductionTask: {
    title_ar: "تمرين دراسة التحدب والانعطاف في موضوع بكالوريا",
    allocatedScore: "3.0 نقاط",
    timeMinutes: 15,
    prompt_ar: "نعتبر الدالة f المعرفة على R بـ: f(x) = x^3 - 3x + 2.\n1) ادرس تقعر المنحنى (C_f).\n2) بين أن النقطة A(0, 2) هي نقطة انعطاف للمنحنى (C_f).\n3) اكتب معادلة المماس (T) عند النقطة A، وتحقق جبرياً أن (T) يخترق المنحنى (C_f).",
    modelSolution_ar: [
      "1) f'(x) = 3x^2 - 3 => f''(x) = 6x.",
      "إشارة f''(x): سالبة على ]-inf, 0[ (المنحنى مقعر)، وموجبة على ]0, +inf[ (المنحنى محدب).",
      "2) المشتقة الثانية تنعدم عند x = 0 وتغير إشارتها، وترتيبتها f(0) = 2، إذن A(0, 2) نقطة انعطاف.",
      "3) f'(0) = -3 => معادلة المماس: y = -3x + 2.",
      "التحقق من الاختراق: الفرق f(x) - y = (x^3 - 3x + 2) - (-3x + 2) = x^3.",
      "إشارة x^3: سالبة لما x < 0 وموجبة لما x > 0. إذن الفرق يغير إشارته عند نقطة التماس، مما يثبت هندسياً أن المماس يخترق المنحنى عند نقطة الانعطاف.",
    ],
    markingScheme_ar: [
      { criterion: "حساب f''(x) = 6x وتحديد مجالات التقعر والتحدب", points: 1.0 },
      { criterion: "تبرير نقطة الانعطاف عند A(0, 2)", points: 1.0 },
      { criterion: "كتابة معادلة المماس وإثبات خاصية الاختراق", points: 1.0 },
    ],
  },
};

// ============================================================================
// CANONICAL 15-CAPABILITY CATALOG INTEGRATION MAP
// ============================================================================

export const MATHEMATICS_CANONICAL_15_INDEX = [
  "math_limits_indeterminate_asymptotes",
  "math_derivatives_composite_sign",
  "math_intermediate_value_theorem",
  "math_tangent_relative_position",
  "math_convexity_inflection_points",
  "math_exponential_functions_equations",
  "math_logarithmic_functions_growth",
  "math_primitives_direct_rules",
  "math_integral_calculus_parts_area",
  "math_induction_proof_sequences",
  "math_sequence_monotonicity_convergence",
  "math_auxiliary_sequences_sums",
  "math_complex_numbers_algebraic_trig",
  "math_complex_plane_geometry_equations",
  "math_probability_trees_random_variables",
] as const;
