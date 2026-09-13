/**
 * BAC Mastery — Natural & Life Sciences (SNV) Canonical Packages & Assessment Expansion
 * Stream: Sciences Expérimentales (3AS) | Algerian National Curriculum Benchmark
 * 
 * Implements:
 * 1. 17 Active Canonical Capabilities covering Molecular Biology, Immunology, Neurophysiology, Bioenergetics, and Cross-Cutting Methodology
 * 2. Strict Disciplinary SNV Pedagogy:
 *    Document/Data -> Objective Observation -> Information Extraction -> Biological Interpretation -> Causal Reasoning -> Conclusion -> Functional Model
 * 3. Strict distinction between What Document Shows vs What Student Infers vs What Student Concludes
 * 4. 5-Tier Practice Ladder (L1 Foundation, L2 Application, L3 Mixed, L4 Transfer, L5 BAC-Style)
 * 5. Error Lab 7-canonical taxonomy strict mapping
 * 6. 5-15 minute targeted Repair Protocols
 * 7. Isomorphic Retest Twins testing genuine biological transfer
 * 8. Multi-part BAC Production Tasks with BAC_MASTERY_INTERNAL_RUBRIC
 * 9. Conservative 2026-2027 curriculum progression marking (Respiration marked CURRENT_PROGRESS_UNVERIFIED)
 */

export interface CanonicalSNVAssessmentItem {
  id: string;
  capabilityId: string;
  level: "L1_FOUNDATION" | "L2_APPLICATION" | "L3_MIXED" | "L4_TRANSFER" | "L5_BAC_STYLE";
  format: "mcq" | "short_answer" | "structured_written" | "document_analysis" | "scientific_reasoning" | "functional_schema";
  estimatedTimeMin: number;
  prompt_ar: string;
  expectedResponse_ar: string | string[];
  reasoningSteps_ar: string[];
  biologicalModel_ar: {
    system_ar: string;
    experimentalConditions_ar: string;
    governingBiologicalMechanisms_ar: string[];
    evidenceExtracted_ar: string;
    deductionOrConclusion_ar: string;
  };
  errorMapping: {
    primaryErrorType: "misunderstood_concept" | "calculation_error" | "methodology_error" | "forgot_information" | "rushed" | "attention_error" | "misread_question";
    distractorRationale_ar?: string;
  };
  scoringRubric_ar: string;
  isRetestVariant?: boolean;
}

export interface CanonicalSNVCapabilityPackage {
  capabilityId: string;
  canonicalTitle_ar: string;
  canonicalTitle_fr: string;
  discipline: "natural_sciences";
  domain: string;
  unit: string;
  status: "APPROVED" | "APPROVED_WITH_MINOR_EDITS";
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
  coreConcepts_ar: string[];
  lessonPackage: {
    overview_ar: string;
    biologicalMechanism_ar: string[];
    evidenceAndObservation_ar: string;
    scientificReasoning_ar: string;
    biologicalConclusion_ar: string;
  };
  workedModel: {
    problem_ar: string;
    documentData_ar: string;
    observation_ar: string;
    interpretation_ar: string;
    deduction_ar: string;
  };
  practiceLadder: {
    l1_foundation: CanonicalSNVAssessmentItem;
    l2_application: CanonicalSNVAssessmentItem;
    l3_mixed: CanonicalSNVAssessmentItem;
    l4_transfer: CanonicalSNVAssessmentItem;
    l5_bac_style: CanonicalSNVAssessmentItem;
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
  sourceAndEvidence: {
    evidenceLevel: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    sourceDetails: string;
    historicalBacRef?: string;
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION" | "CURRENT_PROGRESS_UNVERIFIED";
  };
}

// ============================================================================
// 1. snv_protein_synthesis_transcription_maturation
// ============================================================================

export const SNV_PROTEIN_SYNTHESIS_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_protein_synthesis_transcription_maturation",
  canonicalTitle_ar: "آليات التعبير المورثي: الاستنساخ الحيوي للـ ARNm ونضجه",
  canonicalTitle_fr: "Mécanismes de l'expression génétique : transcription et maturation de l'ARNm",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "آليات تركيب البروتين",
  status: "APPROVED",
  scopeIn: [
    "بنية المورثة (ADN) والسلسلة الناسخة (3'->5') والسلسلة غير الناسخة (5'->3').",
    "آلية الاستنساخ ومراحله الثلاث (الانطلاق، الاستطالة، النهاية) ودور أنزيم ARN بوليميراز وطاقة ATP.",
    "تكامل القواعد الآزوتية واستبدال الثيمين (T) باليوراسيل (U) في شريط ARNm الناتج.",
    "مفهوم نضج الـ ARNm عند حقيقيات النوى (حذف القطع غير الدالة وتجميع القطع الدالة).",
    "التجريب الحيوي: المعاملة باليوراسيل المشع والتصوير الإشعاعي الذاتي لتحديد مقر الاستنساخ.",
  ],
  scopeOut: [
    "الآليات المتقدمة للربط البديل والجسيمات الربطية الفوسفورية الدقيقة غير المقررة على 3AS.",
    "عوامل الاستنساخ التنسيقية المعقدة الخاصة بالدراسات الجامعية.",
  ],
  prerequisites: {
    hard: ["بنية الـ ADN والقواعد الآزوتية المتقابلة (A=T, C≡G)"],
    soft: ["مفهوم الخلية وحقيقيات النوى وبنية النواة والهيولى"],
    foundation: ["مفهوم النمط الظاهري والنمط الوراثي والتعبير المورثي"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_TRANS_01",
      bloomLevel: "apply",
      description_ar: "ينمذج السلسلة المستنسخة ويوجه شريط الـ ARNm المتشكل في الاتجاه 5'->3' مبرزاً تكامل القواعد الآزوتية.",
    },
    {
      code: "LO_SNV_TRANS_02",
      bloomLevel: "analyze",
      description_ar: "يحلل نتائج التصوير الإشعاعي الذاتي بحقن اليوراسيل المشع ويفسر ظاهرة الاستنساخ وانتقال الـ ARNm إلى الهيولى.",
    },
    {
      code: "LO_SNV_TRANS_03",
      bloomLevel: "create",
      description_ar: "يحرر نصاً علمياً مهيكلاً أو رسماً وظيفياً يصف آلية عمل أنزيم ARN بوليميراز وشروط حدوث الاستنساخ.",
    },
  ],
  coreConcepts_ar: [
    "الاستنساخ هو تصنيع حيوي لنسخة متممة من السلسلة الناسخة للـ ADN في صورة ARNm في النواة.",
    "أنزيم ARN بوليميراز يقرأ السلسلة الناسخة من 3' نحو 5' ويبني شريط الـ ARNm من 5' نحو 3'.",
    "اليوراسيل (U) قاعدة آزوتية نوعية للـ ARN تحل محل الثيمين (T) وترتبط برابطتين هيدروجينيتين مع الأدينين (A).",
    "نضج الـ ARNm: يتشكل في النواة ARN أولي يتعرض لحذف القطع غير الدالة (Introns) وربط القطع الدالة (Exons) ليصبح ARNm ناضجاً.",
  ],
  lessonPackage: {
    overview_ar: "التعبير المورثي ينطلق في النواة بعملية الاستنساخ التي تنقل المعلومة الوراثية من الـ ADN إلى جزيء وسيط هو الـ ARNm.",
    biologicalMechanism_ar: [
      "1. الانطلاق: يتعرف ARN بوليميراز على بداية المورثة، يكسر الروابط الهيدروجينية، وتتباعد سلسلتا ADN.",
      "2. الاستطالة: يتحرك الأنزيم على طول السلسلة الناسخة في الاتجاه 3'->5' ويركب نيوكليوتيدات ريبية حرة متممة في الاتجاه 5'->3'.",
      "3. النهاية: يصل الأنزيم إلى إشارة النهاية، ينفصل عن الـ ADN، ويتحرر شريط الـ ARNm وتلتحم سلسلتا الـ ADN من جديد.",
    ],
    evidenceAndObservation_ar: "ظهور الإشعاع في النواة بعد دقائق من حقن اليوراسيل المشع، ثم انتقاله لاحقاً إلى الهيولى يثبت أن الـ ARNm يركب في النواة ثم يهاجر إلى الهيولى.",
    scientificReasoning_ar: "بما أن الـ ADN محبوس في النواة وتركيب البروتين يتم في الهيولى، وبما أن اليوراسيل يدخل حصراً في تركيب الـ ARN، فإن الإشعاع يوثق تشكل رسول حركي ينقل الرسالة المشفرة.",
    biologicalConclusion_ar: "الاستنساخ هو المرحلة الأولى للتعبير المورثي التي تحافظ على سلامة الـ ADN الأصلي وتضمن تصنيع نسخة رسول قابلة للترجمة في الهيولى.",
  },
  workedModel: {
    problem_ar: "أعطيت قطعة السلسلة الناسخة التالية: 3'-TAC-CGG-ATA-ACT-5'. المطلوب: استنتاج تسلسل الـ ARNm والتعليل المنهجي.",
    documentData_ar: "قطعة السلسلة الناسخة الموجهة 3'->5'.",
    observation_ar: "السلسلة المعطاة موجهة من 3' نحو 5' وتحتوي القواعد A, T, C, G.",
    interpretation_ar: "أنزيم ARN بوليميراز يركب نيوكليوتيدات ريبية حرة متممة للسلسلة الناسخة ومتعاكسة القطبية (5'->3')، حيث يقابل T القاعدة A، ويقابل A القاعدة U، ويقابل C القاعدة G، ويقابل G القاعدة C.",
    deduction_ar: "تسلسل الـ ARNm الناتج هو: 5'-AUG-GCC-UAU-UGA-3'.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_trans_l1",
      capabilityId: "snv_protein_synthesis_transcription_maturation",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "ما هو اتجاه قراءة السلسلة الناسخة واتجاه تركيب جزيء ARNm بواسطة أنزيم ARN بوليميراز؟",
      expectedResponse_ar: "قراءة السلسلة الناسخة من 3' نحو 5'، وتركيب ARNm من 5' نحو 3'.",
      reasoningSteps_ar: [
        "تذكر القطبية الجزيئية لأنزيمات البلمرة الحيوية.",
        "تكامل القواعد يتطلب تعاكس قطبية الشريطين المتكاملين.",
      ],
      biologicalModel_ar: {
        system_ar: "النواة الخلوية وحقيقيات النوى.",
        experimentalConditions_ar: "شروط حيوية طبيعية تتوفر على طاقة ATP وريبونيوكليوتيدات حرة.",
        governingBiologicalMechanisms_ar: ["البلمرة الحيوية للـ ARN بتدخل أنزيم ARN بوليميراز."],
        evidenceExtracted_ar: "اتجاه القراءة 3'->5' واتجاه البناء 5'->3'.",
        deductionOrConclusion_ar: "شريط ARNm يبدأ بالطرف 5' وينتهي بالطرف 3'.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "عكس الاتجاهين أو اعتبارهما متطابقين 3'->5' خطأ شائع ناتج عن نسيان تعاكس قطبية السلاسل.",
      },
      scoringRubric_ar: "درجة كاملة لاختيار اتجاه القراءة 3'->5' والبناء 5'->3'.",
    },
    l2_application: {
      id: "snv_trans_l2",
      capabilityId: "snv_protein_synthesis_transcription_maturation",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "إليك جزء من السلسلة غير الناسخة لمورثة: 5'-ATG-GGC-TTC-TAA-3'. استنتج تسلسل القواعد في شريط الـ ARNm المماثل لها مع التعليل.",
      expectedResponse_ar: "تسلسل الـ ARNm هو: 5'-AUG-GGC-UUC-UAA-3'. التعليل: شريط الـ ARNm يماثل السلسلة غير الناسخة في الترتيب والاتجاه (5'->3') مع استبدال كل ثيمين (T) باليوراسيل (U).",
      reasoningSteps_ar: [
        "التمييز بين السلسلة الناسخة والسلسلة غير الناسخة.",
        "السلسلة غير الناسخة مطابقة في الشفرة للـ ARNm ما عدا استبدال T بـ U.",
      ],
      biologicalModel_ar: {
        system_ar: "المورثة والشريط غير الناسخ.",
        experimentalConditions_ar: "استنساخ شريط ADN.",
        governingBiologicalMechanisms_ar: ["التكامل المزدوج: السلسلة الناسخة متممة لغير الناسخة، والـ ARNm متمم للناسخة."],
        evidenceExtracted_ar: "السلسلة المعطاة غير ناسخة وموجهة 5'->3'.",
        deductionOrConclusion_ar: "تطابق تسلسل ARNm مع السلسلة غير الناسخة مع تعويض T بـ U.",
      },
      errorMapping: {
        primaryErrorType: "misread_question",
        distractorRationale_ar: "معاملة السلسلة غير الناسخة كسلسلة ناسخة واشتقاق متممها خطأ ناتج عن عدم قراءة صيغة السؤال بدقة.",
      },
      scoringRubric_ar: "0.5 ن لكتابة التسلسل الصحيح، 0.5 ن للتعليل العلمي.",
    },
    l3_mixed: {
      id: "snv_trans_l3",
      capabilityId: "snv_protein_synthesis_transcription_maturation",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة صورة بالمجهر الإلكتروني لظاهرة الاستنساخ (شجرة ميلر) تظهر خيط ADN تخرج منه سلاسل متعددة من ARNm بأطوال متزايدة. حلل الوثيقة مبيناً اتجاه الاستنساخ وأهمية تشكل عدة جزيئات ARNm في آن واحد.",
      expectedResponse_ar: "التحليل: نلاحظ خيط ADN ترتبط به نقاط كثيفة تمثل أنزيمات ARN بوليميراز، تنطلق منها خيوط جانبية (ARNm) يتزايد طولها تدريجياً في اتجاه محدد. الاتجاه هو من السلاسل الأقصر نحو السلاسل الأطول. الأهمية: تكثيف التعبير المورثي وتصنيع كميات معتبرة من ARNm في وقت وجيز.",
      reasoningSteps_ar: [
        "تقديم الوثيقة: إظهار بنية شجرة الاستنساخ بالمجهر الإلكتروني.",
        "تحديد العلاقة: استطالة شريط ARNm كلما تقدم الأنزيم على المورثة.",
        "الاستنتاج: اتجاه حركة الأنزيم والجدوى الحيوية للتعبير المورثي المتزامن.",
      ],
      biologicalModel_ar: {
        system_ar: "مورثة في طور النشاط النسخي المكثف.",
        experimentalConditions_ar: "تحضير مجهري بالانتشار المفرط (تقنية ميلر).",
        governingBiologicalMechanisms_ar: ["الاستنساخ المتزامن لجزيئات متعددة من نفس المورثة."],
        evidenceExtracted_ar: "تدرج أطوال خيوط الـ ARNm الجانبية.",
        deductionOrConclusion_ar: "اتجاه الاستنساخ يحدده اتجاه استطالة الخيوط، والهدف هو المردودية الحيوية السريعة.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "تحديد اتجاه الاستنساخ من الأطول إلى الأقصر يعكس خللاً منهجياً في ربط المعطى الملاحظ بالنمو الزمني.",
      },
      scoringRubric_ar: "0.5 ن لتقديم الوثيقة، 0.5 ن لتحليل تدرج الأطوال، 0.5 ن لتحديد الاتجاه، 0.5 ن للأهمية الحيوية.",
    },
    l4_transfer: {
      id: "snv_trans_l4",
      capabilityId: "snv_protein_synthesis_transcription_maturation",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "مادة ألفا-أمانيتين (α-amanitine) سم يستخرج من فطر سام يثبط نوعياً أنزيم ARN بوليميراز II. بينت التجارب أن حقن هذا السم يؤدي إلى توقف سريع لتركيب البروتينات في خلايا كبد الفأر دون التأثير على استهلاك الأكسجين أو ATP. فسر سبب توقف تركيب البروتين، وبين ما إذا كان التأثير مباشراً أم غير مباشر.",
      expectedResponse_ar: "التفسير: السم يثبط أنزيم ARN بوليميراز II المسؤول عن استنساخ المورثات، مما يمنع تصنيع جزيئات الـ ARNm. ومع النفاذ الطبيعي لجزيئات الـ ARNm السابقة في الهيولى بفعل أنزيمات التفكيك، تتوقف الترجمة لغياب القالب الحامل للرسالة الوراثية. التأثير على تركيب البروتين هو تأثير غير مباشر ناتج عن تثبيط المرحلة السابقة (الاستنساخ).",
      reasoningSteps_ar: [
        "استغلال المعطى: تثبيط ARN بوليميراز II مع ثبات الطاقة.",
        "الربط المنطقي: توقف الاستنساخ -> غياب تشكل ARNm جديد -> توقف الترجمة لاحقاً.",
        "الاستنتاج: التأثير على تصنيع البروتين غير مباشر لأن الموقع المستهدف هو مرحلة الاستنساخ في النواة.",
      ],
      biologicalModel_ar: {
        system_ar: "خلايا كبدية معالجة بمثبط أنزيمي نوعي.",
        experimentalConditions_ar: "إضافة مادة ألفا-أمانيتين مع متابعة مؤشرات حيوية.",
        governingBiologicalMechanisms_ar: ["التبعية الإلزامية لمرحلة الترجمة على توفر نواتج الاستنساخ (ARNm)."],
        evidenceExtracted_ar: "توقف تركيب البروتين مع بقاء ATP سالماً وتثبيط ARN بوليميراز.",
        deductionOrConclusion_ar: "الاستنساخ شرط قبلي إلزامي لحدوث الترجمة.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن السم يثبط الريبوزومات مباشرة دليل على عدم استيعاب موقع ونوعية عمل الإنزيم المثبط.",
      },
      scoringRubric_ar: "1 ن للربط بين تثبيط الإنزيم وتوقف تشكل ARNm، 1 ن للتعليل الدقيق لكون التأثير غير مباشر.",
    },
    l5_bac_style: {
      id: "snv_trans_l5",
      capabilityId: "snv_protein_synthesis_transcription_maturation",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "نص علمي مهيكل (مقدمة، مشكلة، عرض، خاتمة): اشرح في نص علمي منظم كيف تضمن الخلية الحية نقل المعلومة الوراثية بدقة وأمان من النواة إلى الهيولى، مبرزاً آليات التكامل النيوكليوتيدي والقطبية الجزيئية أثناء الاستنساخ.",
      expectedResponse_ar: "المقدمة: تشكل المورثة في الـ ADN الدعامة الجزيئية للمعلومة الوراثية في النواة، والتي تترجم في الهيولى إلى بروتينات نوعية. المشكلة: فكيف تضمن الخلية نقل هذه المعلومة بدقة وأمان دون مغادرة الـ ADN للنواة؟ العرض: تبدأ العملية بالاستنساخ بتدخل أنزيم ARN بوليميراز عبر 3 مراحل: 1) الانطلاق: يتعرف الأنزيم على بداية المورثة ويفتح سلسلتي الـ ADN بكسر الروابط الهيدروجينية. 2) الاستطالة: يقرأ الأنزيم السلسلة الناسخة في الاتجاه 3'->5' ويركب شريط ARNm في الاتجاه 5'->3' وفق تكامل القواعد (A مع U، T مع A، C مع G). 3) النهاية: ينفصل الأنزيم عند نهاية المورثة ويتحرر شريط الـ ARNm. عند حقيقيات النوى، ينضج الـ ARNm بحذف القطع غير الدالة وربط القطع الدالة، ثم يهاجر عبر الثقوب النووية إلى الهيولى محمياً وموجهاً. الخاتمة: يمثل الـ ARNm نسخة أمينة ومتحركة للمعلومة الوراثية تسمح بالتعبير المورثي مع صيانة النسخة الأصلية للـ ADN داخل النواة.",
      reasoningSteps_ar: [
        "هيكلة النص: مقدمة مشكلة، عرض مفصل علمياً، خاتمة تركيبية.",
        "استعمال المصطلحات العلمية الدقيقة: سلسلة ناسخة، قطبية، تكامل نيوكليوتيدي، ARNm ناضج.",
      ],
      biologicalModel_ar: {
        system_ar: "آلية التعبير المورثي في حقيقيات النوى.",
        experimentalConditions_ar: "صياغة علمية منهجية وفق معايير البكالوريا الجزائرية.",
        governingBiologicalMechanisms_ar: ["الاستنساخ، النضج، الهجرة النووية-الهيولية."],
        evidenceExtracted_ar: "تكامل القواعد والاتجاهات 3' و 5'.",
        deductionOrConclusion_ar: "سلامة النمط الوراثي مع تأمين الترجمة الهيولية.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "غياب المشكلة العلمية أو السرد العشوائي دون ربط المراحل بالقطبية والتكامل يفقده معايير النص العلمي.",
      },
      scoringRubric_ar: "1 ن للمقدمة والمشكلة، 3 ن للعرض بمراحله ومصطلحاته الدقيقة، 1 ن للخاتمة (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين السلسلة الناسخة وغير الناسخة، أو كتابة شريط ARNm موجه 3'->5' أو يحتوي على الثيمين (T).",
    wrongMentalModel_ar: "الاعتقاد بأن الـ ARNm ينسخ من أي سلسلة عشوائياً، أو أن الـ ARN يحتوي على الثيمين كنسخة كربونية من الـ ADN.",
    correctMentalModel_ar: "الـ ADN يحمل شريطين متضادين: السلسلة الناسخة (3'->5') هي القالب الوحيد، وشريط الـ ARNm يركب دوماً في الاتجاه 5'->3' متكاملاً معها ويحمل اليوراسيل (U) بدلاً من الثيمين (T).",
    threeStepActionProtocol_ar: [
      "1. حدد فوراً السلسلة الناسخة: اتجاه قراءتها دوماً من 3' نحو 5'.",
      "2. ابنِ شريط الـ ARNm في الاتجاه المعاكس حتماً: 5' نحو 3'.",
      "3. طبق التكامل: كل T في السلسلة الناسخة تقابل A، وكل A تقابل U، وكل C تقابل G، وافحص خلو الناتج من T.",
    ],
    microDrill_ar: {
      prompt_ar: "استنسخ القطعة الناسخة التالية مبيناً الاتجاه: 3'-TAC-AAG-TCC-ACT-5'.",
      solution_ar: "الناتج هو شريط ARNm موجه: 5'-AUG-UUC-AGG-UGA-3'.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_trans_retest_01",
    invariantTested_ar: "اشتقاق تسلسل ARNm المتكامل ومراعاة قطبية 5' و 3' واستبدال T بـ U.",
    changedSurface_ar: "تغيير السياق إلى مورثة هرمون الأنسولين البشري وإعطاء السلسلة غير الناسخة بدلاً من الناسخة.",
    prompt_ar: "إليك بداية السلسلة غير الناسخة لمورثة الأنسولين: 5'-ATG-GCC-CTG-TGG-3'. اكتب السلسلة الناسخة المتممة لها في الـ ADN، ثم اكتب جزيء الـ ARNm الناتج عن الاستنساخ محدداً قطبيتهما بدقة.",
    solution_ar: "السلسلة الناسخة (3'->5'): 3'-TAC-CGG-GAC-ACC-5'. جزيء الـ ARNm (5'->3'): 5'-AUG-GCC-CUG-UGG-3'.",
    passCondition_ar: "صحة الاتجاهين وتكامل القواعد وخلو الـ ARNm من الثيمين تماماً.",
  },
  bacProductionTask: {
    title_ar: "تمرين استدلال علمي: تأثير مركب الكورديسيبين على تركيب الـ ARNm",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "الكورديسيبين (Cordycepine) مركب طبيعي مضاد للأورام يشبه بنيوياً النيوكليوتيد الأدينوزين ولكنه يفتقر لمجموعة الهيدروكسيل (3'-OH). تم قياس كمية الـ ARNm المصنعة في خلايا ورمية في غياب ووجود الكورديسيبين، فلوحظ تشكل سلاسل ARNm قصيرة جداً متوقفة الاستطالة. 1) باستغلال معطيات الوثيقة ومكتسباتك، فسر سبب توقف استطالة الـ ARNm في وجود الكورديسيبين. 2) استنتج الأهمية العلاجية لهذا المركب في القضاء على الخلايا السرطانية.",
    modelSolution_ar: [
      "1) استغلال المعطيات والتفسير: أنزيم ARN بوليميراز يربط النيوكليوتيدات الريبية الحرة عن طريق تشكيل رابطة إستر-فوسفاتية بين النهاية 3'-OH للنيوكليوتيد السابق والنهاية 5'-فوسفات للنيوكليوتيد اللاحق. بما أن الكورديسيبين نظير بنيوي للأدينوزين، فإن الأنزيم يدمجه في شريط الـ ARNm النامي. ولكن لافتقاره للمجموعة 3'-OH الحرة، يتعذر ربط أي نيوكليوتيد لاحق به، مما يؤدي إلى التوقف النهائي والمبكر لعملية الاستطالة وتحرير سلاسل ARNm قصيرة مبتورة وغير وظيفية.",
      "2) الاستنتاج العلاجي: توقف استنساخ جزيئات ARNm كاملة يؤدي إلى غياب الرسائل الوراثية المشفرة للبروتينات الضرورية لانقسام ونمو الخلية السرطانية، مما يدفعها نحو الموت الخلوي المبرمج، وهو ما يبرر استعمال الكورديسيبين كعلاج واعد مضاد للأورام.",
    ],
    markingScheme_ar: [
      { criterion: "تحديد آلية تشكل الرابطة الفوسفاتية وحاجة الاستطالة لمجموعة 3'-OH حرة", points: 2.0 },
      { criterion: "تفسير إدماج الكورديسيبين وتوقف استطالة شريط الـ ARNm", points: 2.0 },
      { criterion: "الاستنتاج العلاجي الدقيق بخصوص موت الخلايا الورمية", points: 1.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي للتعليم الثانوي الجزائري - كتاب علوم الطبيعة والحياة 3AS (ص 12-25)",
    historicalBacRef: "BAC 2021 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 2. snv_genetic_code_translation_activation
// ============================================================================

export const SNV_GENETIC_CODE_TRANSLATION_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_genetic_code_translation_activation",
  canonicalTitle_ar: "الترجمة الحيوية: الشفرة الوراثية وتنشيط الأحماض الأمينية",
  canonicalTitle_fr: "Traduction biologique : code génétique et activation des acides aminés",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "آليات تركيب البروتين",
  status: "APPROVED",
  scopeIn: [
    "خصائص الشفرة الوراثية: التثليث (الرامزات)، الترادف، رامزة الانطلاق (AUG) ورامزات التوقف (UAA, UAG, UGA).",
    "تنشيط الأحماض الأمينية: إنزيم التنشيط (Aminoacyl-tRNA synthétase)، جزيء ARNt، الروابط عالية الطاقة (ATP).",
    "مراحل الترجمة في الهيولى: الانطلاق، الاستطالة (الموقع P والموقع A، ببتيديل ترانسفيراز)، النهاية وتفكك المعقد.",
    "الريبوزومات والبوليزوم (Polyribosome) والمردودية الحيوية للخلية.",
    "أنواع الطفرات النقطية (صامتة، استبدال مغيرة للمعنى، غير معنى بإدخال رامزة توقف، إزاحة) وعواقبها.",
  ],
  scopeOut: [
    "عوامل البدء والاستطالة الخاصة بالترجمة عند حقيقيات النوى (eIF, eEF) بتفاصيلها الجزيئية الجامعية.",
    "التعديلات الكيميائية ما بعد الترجمة المعقدة في جهاز غولجي.",
  ],
  prerequisites: {
    hard: ["snv_protein_synthesis_transcription_maturation"],
    soft: ["مفهوم الأحماض الأمينية والروابط الببتيدية"],
    foundation: ["طبيعة الـ ARNm المحتوي على الرامزات"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_TRANS_ACT_01",
      bloomLevel: "apply",
      description_ar: "يفك شفرة تسلسل نيوكليوتيدي لـ ARNm مستعيناً بجدول الشفرة الوراثية ويحدد السلسلة الببتيدية المتشكلة.",
    },
    {
      code: "LO_SNV_TRANS_ACT_02",
      bloomLevel: "analyze",
      description_ar: "يشرح آلية تنشيط الأحماض الأمينية ودور إنزيم التنشيط وجزيء ARNt و ATP في ضمان الترجمة الدقيقة.",
    },
    {
      code: "LO_SNV_TRANS_ACT_03",
      bloomLevel: "evaluate",
      description_ar: "يحلل عواقب الطفرات الوراثية المختلفة (استبدال، حذف، إضافة) على بنية ووظيفة السلسلة الببتيدية.",
    },
  ],
  coreConcepts_ar: [
    "الترجمة هي التعبير عن تتابع الرامزات الثلاثية في ARNm إلى تتابع محدد من الأحماض الأمينية.",
    "تنشيط الحمض الأميني خطوة قبلية حاسمة في الهيولى تتطلب إنزيم نوعي، حمض أميني، ARNt مخصص، وطاقة ATP.",
    "الريبوزوم هو العضية المسؤولة عن الترجمة ويحتوي على موقعين تحفيزيين P (الببتيديل) و A (الأمينوأسيل).",
    "رامزات التوقف (UAA, UAG, UGA) لا تشفر لأي حمض أميني ويؤدي وصولها إلى الموقع A إلى تحرير السلسلة الببتيدية.",
  ],
  lessonPackage: {
    overview_ar: "الترجمة هي المرحلة الثانية في التعبير المورثي حيث يترجم النص النيوكليوتيدي إلى نص ببتيدي في الهيولى بواسطة الريبوزومات وجزيئات ARNt المنشطة.",
    biologicalMechanism_ar: [
      "1. تنشيط الأحماض الأمينية: يربط إنزيم نوعي الحمض الأميني بموقع التثبيت على جزيء ARNt النوعي باستهلاك ATP متشكلاً معقد (حمض أميني-ARNt).",
      "2. الانطلاق: ترتبط تحت الوحدة الصغرى بالنهاية 5' لـ ARNm، ويتوضع ARNt الخاص بالميثيونين على رامزة البدء AUG في الموقع P، ثم تلتحق تحت الوحدة الكبرى.",
      "3. الاستطالة: يتوضع معقد (حمض أميني 2-ARNt) في الموقع A وفق تكامل مضاد الرامزة مع الرامزة، تتشكل رابطة ببتيدية، يتحرك الريبوزوم بمقدار رامزة واحدة 5'->3'.",
      "4. النهاية: وصول الموقع A إلى إحدى رامزات التوقف يستدعي عامل التحرير، وتنفصل السلسلة الببتيدية وتتحرر تحت الوحدات الريبوزومية.",
    ],
    evidenceAndObservation_ar: "صور المجهر الإلكتروني للبوليزوم تظهر عدة ريبوزومات متصلة بنفس خيط ARNm، وكل ريبوزوم يحمل سلسلة ببتيدية يزداد طولها كلما اقترب من النهاية 3'.",
    scientificReasoning_ar: "وجود سلاسل ببتيدية متدرجة الطول على طول خيط ARNm يثبت القراءة الخطية الاتجاهية من 5' إلى 3' وتكرار القراءة يزيد المردودية الحيوية للبروتين.",
    biologicalConclusion_ar: "الترجمة تحول المعلومة الوراثية المشفرة إلى بروتينات وظيفية تترجم النمط الوراثي إلى نمط ظاهري خلوي وعضوي.",
  },
  workedModel: {
    problem_ar: "أعطيت قطعة الـ ARNm التالية: 5'-AUG-CCU-UAC-UGA-3'. استنتج السلسلة الببتيدية الناتجة ومضادات الرامزات لكل حمض أميني.",
    documentData_ar: "جدول الشفرة الوراثية: AUG=Met, CCU=Pro, UAC=Tyr, UGA=Stop.",
    observation_ar: "القطعة تبدأ بـ AUG وتنتهي برامزة توقف UGA، وتضم 4 رامزات.",
    interpretation_ar: "AUG تشفر للميثيونين الأول في الموقع P، CCU تشفر للبرولين في الموقع A، UAC تشفر للتيروزين، UGA رامزة توقف تحرر السلسلة.",
    deduction_ar: "السلسلة الببتيدية المتشكلة: Met-Pro-Tyr (ثم ينفصل Met لاحقاً). مضادات الرامزات على ARNt هي: 3'-UAC-5'، 3'-GGA-5'، 3'-AUG-5'.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_trans_act_l1",
      capabilityId: "snv_genetic_code_translation_activation",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "كم عدد الأحماض الأمينية في سلسلة ببتيدية مستنسخة ومترجمة من قطعة ARNm تحتوي على 45 نيوكليوتيداً تنتهي برامزة توقف وتخضع لإزالة الميثيونين الابتدائي؟",
      expectedResponse_ar: "13 حمضاً أمينياً. (45 ÷ 3 = 15 رامزة؛ 15 - 1 رامزة توقف = 14 حمضاً؛ 14 - 1 ميثيونين ابتدائي = 13 حمضاً أمينياً في البروتين النهائي).",
      reasoningSteps_ar: [
        "حساب عدد الرامزات: 45 / 3 = 15 رامزة.",
        "استبعاد رامزة التوقف: 15 - 1 = 14 حمضاً.",
        "استبعاد الميثيونين الابتدائي المنفصل: 14 - 1 = 13 حمضاً أمينياً.",
      ],
      biologicalModel_ar: {
        system_ar: "الريبوزوم والسلسلة الببتيدية الناتجة.",
        experimentalConditions_ar: "معالجة حسابية لقواعد الشفرة الوراثية.",
        governingBiologicalMechanisms_ar: ["التثليث، عدم تشفير رامزات التوقف، انفصال الميثيونين الأولي."],
        evidenceExtracted_ar: "45 نيوكليوتيداً تنتهي برامزة توقف.",
        deductionOrConclusion_ar: "السلسلة الببتيدية النهائية تضم 13 حمضاً أمينياً.",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "احتساب رامزة التوقف كحمض أميني أو نسيان حذف الميثيونين الابتدائي خطأ متكرر في الحسابات الجزيئية.",
      },
      scoringRubric_ar: "درجة كاملة للوصول إلى 13 مع كتابة الخطوات الحسابية الثلاث.",
    },
    l2_application: {
      id: "snv_trans_act_l2",
      capabilityId: "snv_genetic_code_translation_activation",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "ما هي الشروط الجزيئية الضرورية لتشكل الرابطة الببتيدية الأولى أثناء مرحلة الاستطالة في الترجمة؟",
      expectedResponse_ar: "الشروط هي: توضع معقد (Met-ARNt) في الموقع P، توضع معقد (حمض أميني 2-ARNt) في الموقع A وفق تكامل الرامزة ومضاد الرامزة، وتوفر إنزيم ببتيديل ترانسفيراز وطاقة GTP/ATP لربط مجموعة الأمين للحمض الثاني بمجموعة الكربوكسيل للميثيونين.",
      reasoningSteps_ar: [
        "تحديد موقعي الريبوزوم P و A.",
        "الشرط الإنزيمي (ببتيديل ترانسفيراز) والشرط الطاقي وتوفر الأحماض المنشطة.",
      ],
      biologicalModel_ar: {
        system_ar: "المعقد الريبوزومي الوظيفي 80S.",
        experimentalConditions_ar: "وسط خالي من الخلايا يحتوي ريبوزومات وأحماض منشطة وطاقة.",
        governingBiologicalMechanisms_ar: ["التحفيز الإنزيمي لتشكل الرابطة الببتيدية."],
        evidenceExtracted_ar: "شروط تشكل أول رابطة ببتيدية.",
        deductionOrConclusion_ar: "تطلب شغل الموقعين معاً وتدخل ببتيديل ترانسفيراز.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "نسيان دور إنزيم ببتيديل ترانسفيراز أو اشتراط توضع الموقع A خطأ ناتج عن حفظ سطحي.",
      },
      scoringRubric_ar: "0.5 ن لشغل الموقعين P و A، 0.5 ن لذكر الإنزيم والطاقة.",
    },
    l3_mixed: {
      id: "snv_trans_act_l3",
      capabilityId: "snv_genetic_code_translation_activation",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة تجربة استخدام المضاد الحيوي ريسينوسين (Ricinocine) في وسط يحتوي عناصر الترجمة. يبين المنحنى البياني تناقصاً حاداً في إدماج اللوسين المشع في السلاسل الببتيدية مع تراكم معقدات (حمض أميني-ARNt) حرة في الهيولى. حلل النتائج واستنتج المستوى الجزيئي لتأثير المضاد الحيوي.",
      expectedResponse_ar: "التحليل: في غياب المضاد الحيوي يتزايد إدماج اللوسين المشع في البروتين دلالة على استمرار الترجمة. عند إضافة الريسينوسين ينخفض إدماج اللوسين حتى ينعدم بينما تتراكم معقدات (حمض أميني-ARNt) الحرة في الوسط. الاستنتاج: المضاد الحيوي لا يؤثر على مرحلة تنشيط الأحماض الأمينية بل يثبط عمل الريبوزوم مباشرة أثناء قراءة الـ ARNm أو تشكيل الروابط الببتيدية.",
      reasoningSteps_ar: [
        "قراءة مؤشرات الوثيقة: إدماج اللوسين (الترجمة) وتراكم الأحماض المنشطة.",
        "المقارنة: التنشيط سليم والترجمة متوقفة.",
        "الاستنتاج السببي: استهداف الريبوزوم حصراً.",
      ],
      biologicalModel_ar: {
        system_ar: "جهاز الترجمة الهيولي معالج بمضاد حيوي نوعي.",
        experimentalConditions_ar: "تتبع الإشعاع والوسم النظيري للأحماض الأمينية.",
        governingBiologicalMechanisms_ar: ["الفصل بين مرحلة تنشيط الأحماض ومرحلة القراءة والربط على الريبوزوم."],
        evidenceExtracted_ar: "تراكم معقد (AA-ARNt) مع توقف تركيب السلاسل الببتيدية.",
        deductionOrConclusion_ar: "الموقع المستهدف هو الريبوزوم ومرحلة الترجمة الفعلية.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "استنتاج أن المضاد يمنع تنشيط الأحماض الأمينية يناقض المعطى الصريح لتراكم معقدات (AA-ARNt).",
      },
      scoringRubric_ar: "0.5 ن لتحليل المنحنى، 0.5 ن لتحليل تراكم المعقدات، 1.0 ن للاستنتاج الدقيق.",
    },
    l4_transfer: {
      id: "snv_trans_act_l4",
      capabilityId: "snv_genetic_code_translation_activation",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "أصيبت مورثة بروتين إنزيمي بطفرتين مختلفتين في موقعين مختلفين: الطفرة (أ) أدت إلى استبدال النيوكليوتيد رقم 12 (G) بـ (A) في الرامزة GAG فصارت GAA (كلاهما يشفر لحمض الجلوتاميك Glu). الطفرة (ب) أدت إلى حذف نيوكليوتيد واحد في الرامزة الخامسة. قارن بين العواقب المتوقعة لكل طفرة على البنية الفضائية والنشاط الحيوي للإنزيم مبرراً إجابتك.",
      expectedResponse_ar: "المقارنة والتبرير: الطفرة (أ) هي طفرة استبدال صامتة (Mutation silencieuse)؛ بما أن الرامزتين GAG و GAA تشفران لنفس الحمض الأميني (Glu) بسبب خاصية ترادف الشفرة الوراثية، فإن السلسلة الببتيدية تبقى متطابقة تماماً وتحافظ على بنيتها الفراغية ونشاطها الإنزيمي الكامل. أما الطفرة (ب) فهي طفرة حذف نيوكليوتيد تؤدي إلى إزاحة إطار القراءة (Frameshift mutation) لجميع الرامزات التالية، مما يغير تسلسل الأحماض الأمينية بالكامل أو يظهر رامزة توقف مبكرة، وينتج بروتين مبتور أو غير مطابق يفقد بنيته الفراغية ونشاطه الوظيفي نهائياً.",
      reasoningSteps_ar: [
        "تحليل الطفرة (أ): ترادف الشفرة الوراثية -> عدم تغير الحمض الأميني -> طفرة صامتة.",
        "تحليل الطفرة (ب): إزاحة إطار القراءة -> تغير شامل لما بعد الطفرة -> فقدان الوظيفة.",
      ],
      biologicalModel_ar: {
        system_ar: "التعبير المورثي وتأثير الطفرات على البنية البروتينية.",
        experimentalConditions_ar: "مقارنة نمطين من الطفرات النقطية (استبدال مرادف مقابل حذف).",
        governingBiologicalMechanisms_ar: ["الترادف الوراثي وإطار القراءة الثلاثي للريبوزوم."],
        evidenceExtracted_ar: "GAG -> GAA مقابل حذف نيوكليوتيد.",
        deductionOrConclusion_ar: "ليس كل طفرة تخرب البروتين؛ الطفرات الصامتة تحافظ على الوظيفة بينما الإزاحة تخربها.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "التعميم بأن 'أي طفرة تغير البروتين حتماً' خطأ مفاهيمي شائع يغفل خاصية ترادف الشفرة الوراثية.",
      },
      scoringRubric_ar: "1 ن للتحليل والتبرير الدقيق للطفرة (أ)، 1 ن للتحليل والتبرير الدقيق للطفرة (ب).",
    },
    l5_bac_style: {
      id: "snv_trans_act_l5",
      capabilityId: "snv_genetic_code_translation_activation",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا (استدلال علمي): مادة البوروميسين (Puromycine) تشبه بنيوياً النهاية 3' للـ ARNt المحمل بحمض أميني (Tyrosyl-tRNA). عند إضافتها لمستخلص خلوي، يرتبط البوروميسين بالموقع A للريبوزوم، ويشكل رابطة ببتيدية مع السلسلة النامية في الموقع P، ثم ينفصل فوراً حاملاً السلسلة الببتيدية المبتورة. 1) فسر سبب تشكل الرابطة الببتيدية بين السلسلة والبوروميسين. 2) استنتج سبب توقف الترجمة وتحرير سلاسل ببتيدية غير مكتملة. 3) مثل برسم تخطيطي وظيفي عليه كامل البيانات آلية تثبيط الترجمة بالبوروميسين.",
      expectedResponse_ar: [
        "1) التفسير: نظراً للتشابه البنيوي الكبير بين البوروميسين والنهاية 3' لمعقد Tyrosyl-tRNA، يتعرف الريبوزوم عليه ويتوضع في الموقع A الشاغر. وبما أن البوروميسين يملك زمرة أمينية حرة، فإن إنزيم ببتيديل ترانسفيراز يحفز تشكل رابطة ببتيدية بينه وبين السلسلة الببتيدية الموجودة في الموقع P كما لو كان حمضاً أمينياً حقيقياً.",
        "2) سبب توقف الترجمة: بعد تشكل الرابطة، لا يستطيع البوروميسين التثبت المستقر في الموقع A لغياب بقية بنية الـ ARNt، كما لا يستطيع الريبوزوم الانتقال للرامزة التالية. يؤدي ذلك إلى انفصال معقد (السلسلة الببتيدية-بوروميسين) قبل الأوان، مما يوقف الاستطالة ويحرر بروتينات مبتورة غير مكتملة تفقد وظيفتها الحيوية.",
        "3) الرسم التخطيطي الوظيفي: يوضح الريبوزوم بتحت وحدتيه (الصغرى والكبرى)، شريط ARNm 5'->3'، الموقع P يحمل السلسلة النامية، الموقع A يشغله جزيء البوروميسين بدلاً من ARNt، سهم يوضح تشكل الرابطة الببتيدية، وسهم يوضح تحرر السلسلة المبتورة وانفصال الريبوزوم، مع العنوان: 'رسم تخطيطي وظيفي يوضح آلية تثبيط الترجمة بواسطة البوروميسين'.",
      ],
      reasoningSteps_ar: [
        "استغلال التشابه البنيوي لتفسير التوضع في الموقع A.",
        "تفسير حدوث التحفيز الإنزيمي (الرابطة الببتيدية) ثم الفشل الميكانيكي في التحرك والانفصال.",
        "تركيب الاستنتاج ورسم النموذج الوظيفي المفسر للظاهرة.",
      ],
      biologicalModel_ar: {
        system_ar: "الريبوزوم في طور الاستطالة ومعالجة بمثبط تشابهي.",
        experimentalConditions_ar: "تثبيط تنافسي على الموقع التحفيزي A.",
        governingBiologicalMechanisms_ar: ["الخصوصية البنيوية للموقع A، دور ببتيديل ترانسفيراز، والتحرك الاتجاهي."],
        evidenceExtracted_ar: "تشابه تركيبي مع Tyrosyl-tRNA وتشكل رابطة وانفصال مبكر.",
        deductionOrConclusion_ar: "تحرير سلاسل ببتيدية مبتورة يوقف التعبير المورثي وظيفياً.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن البوروميسين يمنع تشكل الرابطة الببتيدية يناقض معطى التجربة الصريح بتشكل الرابطة معه.",
      },
      scoringRubric_ar: "1.5 ن لتفسير التشكل، 1.5 ن لسبب التوقف والانفصال، 2.0 ن للرسم التخطيطي الوظيفي الدقيق (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخطأ في حساب عدد الأحماض الأمينية بإدراج رامزة التوقف، أو عدم التمييز بين الطفرات الصامتة والمغيرة للمعنى.",
    wrongMentalModel_ar: "الاعتقاد بأن كل رامزة تعني حمضاً أمينياً حتى نهاية السلسلة، أو أن أي تغير في الـ ADN يغير طبيعة البروتين حتماً.",
    correctMentalModel_ar: "رامزات التوقف الثلاث (UAA, UAG, UGA) إشارات توقف لا تقابلها أي أحماض أمينية؛ والشفرة الوراثية مترادفة حيث تشفر عدة رامزات لنفس الحمض الأميني مما يحمي الخلية من بعض الطفرات.",
    threeStepActionProtocol_ar: [
      "1. قسم شريط الـ ARNm دوماً إلى ثلاثيات بدءاً من 5'-AUG.",
      "2. عند مصادفة UAA أو UAG أو UGA توقف فوراً ولا تحتسبها كحمض أميني.",
      "3. في الطفرات: افحص دائماً جدول الشفرة الوراثية قبل الحكم؛ إذا بقي الحمض الأميني نفسه فالطفرة صامتة والبروتين سليم.",
    ],
    microDrill_ar: {
      prompt_ar: "قطعة ARNm: 5'-AUG-AAA-GUG-UAA-3'. ما عدد الأحماض الأمينية المتشكلة؟",
      solution_ar: "عدد الأحماض هو 3 أحماض أمينية (Met-Lys-Val) لأن الرامزة UAA رامزة توقف لا تشفر لأي حمض.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_trans_act_retest_01",
    invariantTested_ar: "تأثير المضادات الحيوية المثبطة للترجمة وآلية إدماج الأحماض الأمينية.",
    changedSurface_ar: "تغيير المضاد الحيوي إلى الكلورامفينيكول (Chloramphénicol) الذي يثبط إنزيم ببتيديل ترانسفيراز دون أن يمنع توضع ARNt في الموقع A.",
    prompt_ar: "الكلورامفينيكول مضاد حيوي يثبط نوعياً إنزيم ببتيديل ترانسفيراز في الريبوزوم. بين ما إذا كان هذا الدواء يسمح بتوضع معقدات (AA-ARNt) في الموقعين P و A، وفسر لماذا يتوقف تركيب البروتين تماماً في وجوده.",
    solution_ar: "نعم، يسمح بتوضع معقدات (AA-ARNt) في الموقعين P و A لأن التوضع يعتمد على تكامل الرامزة ومضاد الرامزة فقط. يتوقف تركيب البروتين لأن تثبيط ببتيديل ترانسفيراز يمنع كيميائياً تشكل الرابطة الببتيدية بين الحمضين، فيتعذر انتقال السلسلة النامية ويتجمد الريبوزوم في مكانه دون استطالة.",
    passCondition_ar: "التمييز الدقيق بين مرحلة التوضع المتكامل ومرحلة التحفيز الإنزيمي للرابطة الببتيدية.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: تشخيص متلازمة هيموغلوبينية ناجمة عن طفرة نقطية",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "تتميز الثلاسيميا بيتا (β-thalassémie) بفقر دم حاد ناتج عن غياب سلسلة بيتا للهيموغلوبين. تم تحليل تتابع الـ ARNm لمورثة بيتا غلوبين لدى شخص سليم وشخص مصاب، فلوحظ أن الرامزة رقم 39 لدى السليم هي 5'-CAG-3' (تشفر للجلوتامين Gln)، بينما لدى الشخص المصاب حدث استبدال للقاعدة C بالقاعدة U فأصبحت الرامزة 5'-UAG-3'. 1) فسر سبب الغياب التام للبروتين الوظيفي لدى الشخص المصاب. 2) اقترح حلاً علاجياً جينياً حديثاً يمكنه تصحيح هذا الخلل.",
    modelSolution_ar: [
      "1) التفسير الجزيئي: أدى استبدال السيتوزين C باليوراسيل U في الرامزة رقم 39 إلى تحويل رامزة الجلوتامين (CAG) إلى رامزة التوقف (UAG)، وهي طفرة غير معنى (Mutation non-sens). عند وصول الريبوزوم إلى الرامزة 39 أثناء الترجمة، يتعرف عليها عامل التحرير وتتوقف الترجمة قبل أوانها، مما يحرر ببتيداً قصيراً جداً (38 حمضاً فقط بدلاً من 146 حمضاً)، وهو ببتيد غير مكتمل وغير مستقر يتعرض للتفكيك السريع، مما يفسر الغياب التام لسلسلة بيتا غلوبين الوظيفية وظهور فقر الدم الحاد.",
      "2) المقترح العلاجي: يمكن استخدام تقنية التعديل الجيني (مثل كريسبر-كاس9 أو تعديل القواعد Base Editing) لتصحيح النيوكليوتيد الطافر في الخلايا الجذعية المكونة للدم المستخلصة من المريض بإعادة استبدال U بـ C، ثم إعادة زرعها لإنتاج كريات دم حمراء قادرة على تصنيع الهيموغلوبين الطبيعي.",
    ],
    markingScheme_ar: [
      { criterion: "تحديد نوع الطفرة وتحولها إلى رامزة توقف مبكرة (طفرة غير معنى)", points: 2.0 },
      { criterion: "تفسير التوقف المبكر للترجمة وتفكك الببتيد القصير غير الوظيفي", points: 2.0 },
      { criterion: "اقتراح علاج جيني علمي منطقي متلائم مع الحالة", points: 1.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 26-45)",
    historicalBacRef: "BAC 2019 Sciences Expérimentales Sujet 2 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 3. snv_protein_structure_amphoteric_ionization
// ============================================================================

export const SNV_PROTEIN_STRUCTURE_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_protein_structure_amphoteric_ionization",
  canonicalTitle_ar: "العلاقة بين بنية ووظيفة البروتين: السلوك الأمفوتيري والتأين",
  canonicalTitle_fr: "Relation structure-fonction des protéines : comportement amphotère et ionisation",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "العلاقة بين بنية ووظيفة البروتين",
  status: "APPROVED",
  scopeIn: [
    "البنية العامة للحمض الأميني (الكربون ألفا، الوظيفة الأمينية، الوظيفة الكربوكسيلية، الجذر R).",
    "الخاصية الحمقلية (الأمفوتيرية / Zwitterion) والشحنة الكهربائية الإجمالية وفق pH الوسط و pHi.",
    "مستويات البنية الفراغية للبروتين (أولية، ثانوية، ثالثية، رابعية) والروابط الكيميائية المساهمة في استقرارها (شاردية، هيدروجينية، كارهة للماء، جسور ثنائية الكبريت).",
    "فصل الأحماض الأمينية والبروتينات بتقنية الهجرة الكهربائية (Électrophorèse).",
    "تأثير تغيرات الـ pH ودرجة الحرارة على استقرار البنية الفراغية وفقدان الوظيفة الحيوية.",
  ],
  scopeOut: [
    "حسابات ثابت التشرد pKa الدقيقة لكل جذر حمض أميني بالمعادلات الكيميائية التفصيلية (خاص بالكيمياء).",
    "دراسة مخطط راماتشاندران (Ramachandran plot) للزوايا ثنائية السطح الخاصة بالجامعة.",
  ],
  prerequisites: {
    hard: ["snv_genetic_code_translation_activation"],
    soft: ["مفهوم الـ pH والشوارد الموجبة والسالبة والمصعد والمهبط"],
    foundation: ["الرابطة الببتيدية وتشكل السلسلة البيبتيدية"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_STRUCT_01",
      bloomLevel: "apply",
      description_ar: "يحدد الشحنة الكهربائية الإجمالية للحمض الأميني وجهة هجرته الكهربائية بمقارنة pH الوسط بـ pHi.",
    },
    {
      code: "LO_SNV_STRUCT_02",
      bloomLevel: "analyze",
      description_ar: "يصنف الروابط المساهمة في الحفاظ على البنية الثالثية للبروتين ويفسر تموضع الجذور الكارهة للماء نحو الداخل.",
    },
    {
      code: "LO_SNV_STRUCT_03",
      bloomLevel: "evaluate",
      description_ar: "يعلل فقدان النشاط النوعي للبروتين عند تغير الـ pH عبر تخريب الروابط الشاردية وتغير الشحنات في الموقع الفعال.",
    },
  ],
  coreConcepts_ar: [
    "الأحماض الأمينية مركبات حمقلية (أمفوتيرية) تسلك سلوك الحمض في الوسط القاعدي وسلوك الأساس في الوسط الحامضي.",
    "إذا كان pH < pHi يسلك الحمض الأميني سلوك أساس ويكتسب بروتوناً (+)، فينجذب نحو المهبط (القطب السالب).",
    "إذا كان pH > pHi يسلك الحمض الأميني سلوك حمض ويفقد بروتوناً (-)، فينجذب نحو المصعد (القطب الموجب).",
    "تكتسب البروتينات بنية فراغية محددة وثابتة بفضل تشكل روابط كيميائية بين جذور أحماض أمينية محددة ومتباعدة في السلسلة الأولية.",
  ],
  lessonPackage: {
    overview_ar: "تتوقف الوظيفة الحيوية للبروتين على بنيته الفراغية ثلاثية الأبعاد، والتي تتحكم فيها الطبيعة الكيميائية للأحماض الأمينية المكونة له وسلوكها الشاردي وفق شروط الوسط.",
    biologicalMechanism_ar: [
      "1. السلوك الحمقلي: عند نقطة التعادل الكهربائي pHi يكون مجموع الشحنات الموجبة مساوياً للسالبة (شحنة إجمالية معدومة).",
      "2. التأين وفق الـ pH: في وسط حامضي غني بالـ H+ تتشرد المجموعة الأمينية (-NH3+) وتبقى الكربوكسيلية غير متشردة (-COOH) فتكون الشحنة موجبة؛ والعكس في الوسط القاعدي.",
      "3. التواء السلسلة واستقرار البنية: تتفاعل جذور الأحماض الأمينية لتشكل روابط شاردية بين الشحنات المتعاكسة، وجسور كبريتية تساهمية قوية بين السيستيينات، وروابط هيدروجينية، وتتجمع الجذور الكارهة للماء نحو الداخل هرباً من الوسط المائي.",
    ],
    evidenceAndObservation_ar: "نتائج الهجرة الكهربائية لمزيج من 3 أحماض أمينية عند pH = 6.0 تظهر هجرة حمض نحو المصعد، وحمض نحو المهبط، وبقاء الثالث في خط البداية دون حركة.",
    scientificReasoning_ar: "اختلاف اتجاه ومسافة الهجرة الكهربائية عند نفس الـ pH يثبت اختلاف قيم الـ pHi وبالتالي اختلاف الشحنة الإجمالية الناجمة عن طبيعة الجذور R.",
    biologicalConclusion_ar: "البنية الفراغية للبروتين مشفرة وراثياً في تسلسل أحماضه الأمينية، وأي تغير في الـ pH أو طفرة في جذر حاسم يفكك الروابط ويخرب الوظيفة.",
  },
  workedModel: {
    problem_ar: "حمض الألانين (Alanine) يملك جذراً متعادلاً R=-CH3 وقيمة pHi=6.0. وُضع في جهاز الهجرة الكهربائية في وسط ذي pH=2.0. حدد شحنته الإجمالية وجهة هجرته مع كتابة صيغته الشاردية.",
    documentData_ar: "pHi للألانين = 6.0، pH الوسط = 2.0.",
    observation_ar: "pH الوسط (2.0) أقل بكثير من pHi الألانين (6.0)، أي أن الوسط حامضي قوي غني بشوارد H+.",
    interpretation_ar: "يسلك الألانين سلوك أساس: تكسب وظيفته الأمينية بروتوناً وتصبح -NH3+، بينما تبقى وظيفته الكربوكسيلية غير متشردة -COOH. تصبح شحنته الإجمالية (+1).",
    deduction_ar: "الصيغة الشاردية هي: H3N+-CH(CH3)-COOH، وبما أن شحنته موجبة فإنه يهاجر نحو القطب السالب (المهبط Cathode).",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_struct_l1",
      capabilityId: "snv_protein_structure_amphoteric_ionization",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "عند نقطة التعادل الكهربائي (pI أو pHi) للحمض الأميني، كيف تكون شحنته الكهربائية الإجمالية وما هو سلوكه في جهاز الهجرة الكهربائية؟",
      expectedResponse_ar: "شحنته الإجمالية معدومة (0)، ويبقى في منتصف الشريط دون هجرة نحو أي من القطبين.",
      reasoningSteps_ar: [
        "تذكر تعريف نقطة التعادل الكهربائي pHi.",
        "تساوي الشحنات الموجبة مع السالبة -> شحنة صافية صفرية.",
      ],
      biologicalModel_ar: {
        system_ar: "حمض أميني في محلول دارئ عند pH = pHi.",
        experimentalConditions_ar: "جهاز الهجرة الكهربائية تحت توتر كهربائي مناسب.",
        governingBiologicalMechanisms_ar: ["التشرد المتوازن للوظيفتين (-NH3+ و -COO-)."],
        evidenceExtracted_ar: "pH = pHi.",
        deductionOrConclusion_ar: "انعدام القوة الكهروستاتيكية الموجهة وثبات العينة في المركز.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن الحمض الأميني عند pHi لا يحمل أي شحنة مطلقاً (غير متأين) خطأ؛ فهو يحمل شحنتين متعاكستين متساويتين (شاردة ثنائية القطب Zwitterion).",
      },
      scoringRubric_ar: "درجة كاملة لاختيار الشحنة المعدومة والبقاء في المنتصف.",
    },
    l2_application: {
      id: "snv_struct_l2",
      capabilityId: "snv_protein_structure_amphoteric_ionization",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "حمض الجلوتاميك (Acide glutamique) يملك جذراً كربوكسيلياً R = -CH2-CH2-COOH وقيمة pHi = 3.2. وُضع عند pH = 7.0. احسب شحنته الإجمالية وحدد جهة هجرته.",
      expectedResponse_ar: "بما أن pH = 7.0 > pHi (3.2)، فإن الوسط قاعدي بالنسبة له. يسلك سلوك حمض ويفقد البروتونات: تتأين الوظيفة الكربوكسيلية الرئيسية (-COO-) ووظيفة الجذر (-COO-) وتتأين الأمينية (-NH3+). الشحنة الإجمالية = (+1) + (-1) + (-1) = (-1). يهاجر نحو القطب الموجب (المصعد Anode).",
      reasoningSteps_ar: [
        "مقارنة pH بـ pHi: 7.0 > 3.2 -> سلوك حمض.",
        "حساب تأين وظائف الجذر والوظائف الرئيسية عند pH=7.",
        "النتيجة: شحنة سالبة (-1) وهجرة نحو المصعد.",
      ],
      biologicalModel_ar: {
        system_ar: "حمض أميني حمضي ثلاثي الوظائف.",
        experimentalConditions_ar: "وسط فيزيولوجي معتدل pH=7.",
        governingBiologicalMechanisms_ar: ["فقدان البروتونات من المجموعات الكربوكسيلية عند pH مرتفع."],
        evidenceExtracted_ar: "pH=7.0 و pHi=3.2 مع جذر كربوكسيلي.",
        deductionOrConclusion_ar: "شحنة سالبة هجرة نحو المصعد.",
      },
      errorMapping: {
        primaryErrorType: "calculation_error",
        distractorRationale_ar: "إهمال تأين وظيفة الجذر وحساب شحنة الأطراف فقط يؤدي إلى شحنة خاطئة.",
      },
      scoringRubric_ar: "0.5 ن للشحنة الصحيحة (-1)، 0.5 ن لجهة الهجرة مع التعليل.",
    },
    l3_mixed: {
      id: "snv_struct_l3",
      capabilityId: "snv_protein_structure_amphoteric_ionization",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تم إجراء هجرة كهربائية لمزيج من ثلاثة أحماض أمينية: الليسين (pHi=9.7)، الألانين (pHi=6.0)، وحمض الأسبارتيك (pHi=3.0) عند باهاء pH=6.0. مثلت بقع الهجرة بالبقع A (عند المهبط)، B (في المنتصف)، C (عند المصعد). انسب كل حمض أميني للبقعة الموافقة مع التعليل العلمي الدقيق.",
      expectedResponse_ar: "النسب والتعليل: 1) البقعة B تمثل الألانين، لأن pH الوسط (6.0) يساوي تماماً pHi الألانين، فتكون شحنته الإجمالية معدومة ويبقى في منتصف الشريط دون هجرة. 2) البقعة A تمثل الليسين، لأن pH الوسط (6.0) < pHi (9.7)، فالوسط حامضي بالنسبة له ويسلك سلوك أساس ويكتسب بروتوناً وتكون شحنته موجبة فينجذب نحو المهبط (القطب السالب). 3) البقعة C تمثل حمض الأسبارتيك، لأن pH الوسط (6.0) > pHi (3.0)، فالوسط قاعدي بالنسبة له ويسلك سلوك حمض ويفقد بروتونات وتكون شحنته سالبة فينجذب نحو المصعد (القطب الموجب).",
      reasoningSteps_ar: [
        "تحليل معطيات pH = 6.0 ومقارنتها بكل قيمة pHi.",
        "استنتاج الشحنة: ألانين=0، ليسين=+، أسبارتيك=-.",
        "الربط مع أقطاب الجهاز: 0 في B، + في A (مهبط)، - في C (مصعد).",
      ],
      biologicalModel_ar: {
        system_ar: "تقنية الفصل بالهجرة الكهربائية لمزيج أميني.",
        experimentalConditions_ar: "pH ثابت = 6.0.",
        governingBiologicalMechanisms_ar: ["الخاصية الحمقلية وهجرة الشوارد في حقل كهربائي."],
        evidenceExtracted_ar: "قيم pHi متباينة (9.7، 6.0، 3.0) عند pH=6.0.",
        deductionOrConclusion_ar: "فصل نقي وكامل للأحماض الثلاثة بناءً على شحنتها الكهربائية الصافية.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "عكس قطبي المصعد والمهبط بالاعتقاد بأن الشحنة السالبة تذهب للقطب السالب خطأ كهروستاتيكي فادح.",
      },
      scoringRubric_ar: "0.5 ن لكل نسبة صحيحة مع تعليلها العلمي (المجموع 1.5 ن) + 0.5 ن للصياغة المنطقية.",
    },
    l4_transfer: {
      id: "snv_struct_l4",
      capabilityId: "snv_protein_structure_amphoteric_ionization",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "بروتين الريبونوكلياز (Ribonucléase) يتكون من 124 حمضاً أمينياً ويحتوي على 4 جسور ثنائية الكبريت. عند معاملته بمركب بيتا-مركبتوإيثانول (المفكك للجسور الكبريتية) واليوريا (المفككة للروابط الهيدروجينية)، يفقد البروتين بنيته الفراغية ونشاطه الإنزيمي تماماً. عند إزالة هاتين المادتين تدريجياً عبر الديلزة، يستعيد البروتين بنيته الفراغية الطبيعية ونشاطه بنسبة 100%. فسر هذه النتائج وماذا تستنتج حول مصدر المعلومة المحددة للبنية الفراغية؟",
      expectedResponse_ar: "التفسير: تعمل اليوريا وبيتا-مركبتوإيثانول على تكسير الروابط الكيميائية (الهيدروجينية وجسور ثنائية الكبريت) المسؤولة عن تماسك واستقرار البنية الثالثية للإنزيم دون كسر الروابط الببتيدية، فيتحول إلى سلسلة خطية عشوائية تفقد الموقع الفعال وبالتالي تفقد النشاط الإنزيمي. عند إزالة المادتين، وبما أن التسلسل الخطي للأحماض الأمينية (البنية الأولية) ظل سالماً، فإن التجاذبات الكيميائية الفطرية بين الجذور المتقابلة تعيد تشكل نفس الروابط تلقائياً في الفضاء، مما يعيد تشكيل البنية الفراغية الأصلية والموقع الفعال. الاستنتاج: المعلومة الضرورية والكافية لتحديد البنية الفراغية للبروتين مشفرة كلياً في بنيته الأولية (تسلسل وطبيعة الأحماض الأمينية).",
      reasoningSteps_ar: [
        "استغلال تجربة أنفينسن (Anfinsen): تفكيك الروابط غير الببتيدية -> فقدان الوظيفة.",
        "استغلال العودة التلقائية: سلامة البنية الأولية تسمح بالانطواء الصحيح.",
        "الاستنتاج: البنية الأولية هي المحددة والمشفرة للبنية الفضائية ثلاثية الأبعاد.",
      ],
      biologicalModel_ar: {
        system_ar: "إنزيم ريبونوكلياز وتجربة الانطواء التلقائي لأنفينسن.",
        experimentalConditions_ar: "تخريب عكوس للروابط غير التساهمية وجسور الكبريت.",
        governingBiologicalMechanisms_ar: ["الانطواء التلقائي الموجه بالبنية الأولية واستقرار الطاقة الدنيا."],
        evidenceExtracted_ar: "استعادة 100% من النشاط بمجرد إزالة المواد المخربة.",
        deductionOrConclusion_ar: "البنية الفضائية تشتق حتمياً من البنية الأولية الوراثية.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن المواد الكيميائية كسرت الروابط الببتيدية يفسد التفسير، لأن كسر الروابط الببتيدية تمزق غير عكوس يستحيل أن يعود تلقائياً.",
      },
      scoringRubric_ar: "1 ن لتفسير التخريب العكوس للروابط التثبيتية، 1 ن للاستنتاج الدقيق حول البنية الأولية.",
    },
    l5_bac_style: {
      id: "snv_struct_l5",
      capabilityId: "snv_protein_structure_amphoteric_ionization",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا (مهمة مركبة): يمثل بروتين الميوجلوبين ناقلاً للأكسجين في العضلات. بينت الدراسات البلورية أن السلسلة الببتيدية للميوجلوبين تنطوي بحيث تتمركز الأحماض الأمينية الكارهة للماء (مثل Val, Leu, Phe) في القلب الداخلي للجزيء، بينما تتمركز الأحماض الأمينية القطبية والمشحونة (مثل Lys, Glu, Asp) على السطح الخارجي الملامس للماء. في طفرة وراثية استبدل الحمض الأميني Val رقم 68 الواقع في القلب الداخلي بحمض الأسبارتيك Asp، فلوحظ تشوه البنية الفراغية وترسب البروتين وفقدانه لوظيفته. 1) فسر تموضع الأحماض الأمينية في الميوجلوبين الطبيعي وعلاقته بالانحلالية في الماء. 2) علل سبب تشوه البنية وترسب البروتين الطافر. 3) وضح برسم تخطيطي بسيط الروابط الأربع المساهمة في استقرار البنية الثالثية للبروتين.",
      expectedResponse_ar: [
        "1) التفسير: في الوسط الخلوي المائي، تتدافع الجذور الكارهة للماء (اللاقطبية) نحو مركز الجزيء لتجنب التماس مع جزيئات الماء وتشكل روابط كارهة للماء مستقرة طاقياً. في المقابل، تشكل الجذور القطبية والمشحونة الواقعة على السطح الخارجي روابط هيدروجينية وأيونية مع جزيئات الماء المحيطة، مما يمنح البروتين غلاف تميه (Couche d'hydratation) يضمن انحلاليته الكاملة في السيتوبلازم وأداء وظيفته بنجاح.",
        "2) تعليل تشوه البروتين الطافر: الفالين حمض أميني كاره للماء وصغير الحجم ومستقر في القلب الداخلي؛ استبداله بالأسبارتيك وهو حمض قطبي يحمل شحنة سالبة (-COO-) داخل القلب الكاره للماء يؤدي إلى تنافر شحنات قوي وتنافر كهروسكوني مع البيئة الدهنية الداخلية، مما يخل بالاستقرار الطاقي ويؤدي إلى انفتاح البنية الفراغية (Dénaturation). خروج الجذور الكارهة للماء إلى السطح يجعل البروتين غير قابل للذوبان فيترسب ويفقد وظيفته الحيوية.",
        "3) الرسم التخطيطي: رسم لسلسلة ببتيدية ملتوية يوضح: رابطة شاردية بين (-NH3+ و -COO-)، رابطة هيدروجينية بين (-OH و -CO-)، جسر ثنائي الكبريت تساهمي بين جذري سيستيين (-S-S-)، وتجاذب الجذور الكارهة للماء (مثل حلقات البنزين لـ Phe)، مع وضع عنوان وإطار للرسم.",
      ],
      reasoningSteps_ar: [
        "تفسير التوزيع المكاني للأحماض: قطبية في السطح (انحلالية) وكارهة في العمق (استقرار).",
        "تفسير الأثر الكارثي لإدخال شحنة سالبة في بيئة لا قطبية.",
        "نمذجة الروابط الأربع بالرسم التخطيطي الوظيفي الدقيق.",
      ],
      biologicalModel_ar: {
        system_ar: "بروتين كروي منحل وانطواؤه الفراغي وفق قطبية الجذور.",
        experimentalConditions_ar: "مقارنة السلالة الطبيعية بالطافرة في وسط مائي خلوي.",
        governingBiologicalMechanisms_ar: ["الاستقرار الديناميكي الحراري، غلاف التميه، والروابط التثبيتية."],
        evidenceExtracted_ar: "Val في الداخل مقابل Asp المشحون وترسب البروتين.",
        deductionOrConclusion_ar: "موقع ونوع الجذر الأميني محدد صارم للبنية والانحلالية.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "إغفال دور الماء وغلاف التميه والتركيز فقط على شكل الجزيء دون ذكر الأساس الكيميائي للانحلالية.",
      },
      scoringRubric_ar: "1.5 ن لتفسير التموضع والانحلالية، 1.5 ن لتعليل أثر الطفرة والتنافر الداخلي، 2.0 ن للرسم التخطيطي للروابط الأربع (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين سلوك الحمض والأساس، والاعتقاد بأن الوسط الحامضي يجعل الحمض سالباً أو يهاجر للمصعد.",
    wrongMentalModel_ar: "الاعتقاد بأن الحمض الأميني يهاجر دائماً نحو القطب المماثل لشحنته، أو أن الحمض يسلك نفس السلوك مهما تغير pH الوسط.",
    correctMentalModel_ar: "في الوسط الحامضي (pH < pHi) يكتسب بروتوناً وتكون شحنته موجبة فينجذب نحو المهبط السالب؛ وفي الوسط القاعدي (pH > pHi) يفقد بروتوناً وتكون شحنته سالبة فينجذب نحو المصعد الموجب.",
    threeStepActionProtocol_ar: [
      "1. قارن فوراً قيمة pH الوسط بقيمة pHi المعطاة للحمض الأميني.",
      "2. إذا كان pH < pHi فالشحنة الإجمالية موجبة (+)، وإذا كان pH > pHi فالشحنة الإجمالية سالبة (-).",
      "3. جهة الهجرة تعاكس الشحنة: الشحنة الموجبة تهاجر للمهبط السالب، والشحنة السالبة تهاجر للمصعد الموجب.",
    ],
    microDrill_ar: {
      prompt_ar: "حمض أميني pHi=5.5 وُضع عند pH=9.0. ما هي شحنته وجهة هجرته؟",
      solution_ar: "بما أن pH=9.0 > pHi فإنه يسلك سلوك حمض وشحنته سالبة (-) ويهاجر نحو القطب الموجب (المصعد).",
    },
  },
  isomorphicRetest: {
    retestId: "snv_struct_retest_01",
    invariantTested_ar: "تحديد سلوك التأين الكهربائي لحمض أميني قاعدي وجهة هجرته وفق pH الوسط.",
    changedSurface_ar: "تغيير الحمض الأميني إلى الأرجنين (Arginine) ذو الجذر القاعدي و pHi = 10.8 عند درجات باهاء مختلفة.",
    prompt_ar: "حمض الأرجنين يملك نقطة تعادل كهربائي pHi = 10.8. وُضع في جهاز الهجرة الكهربائية عند باهاءين مختلفين: التجربة 1 عند pH = 7.0، والتجربة 2 عند pH = 12.0. حدد شحنته الإجمالية وجهة هجرته في كل تجربة مع التعليل.",
    solution_ar: "التجربة 1 (pH=7.0 < pHi): الوسط حامضي بالنسبة له، يسلك سلوك أساس ويكتسب بروتونات، شحنته موجبة (+) ويهاجر نحو المهبط (القطب السالب). التجربة 2 (pH=12.0 > pHi): الوسط قاعدي بالنسبة له، يسلك سلوك حمض ويفقد بروتونات، شحنته سالبة (-) ويهاجر نحو المصعد (القطب الموجب).",
    passCondition_ar: "صحة الشحنتين وجهتي الهجرة مع التعليل المقارن بـ pHi.",
  },
  bacProductionTask: {
    title_ar: "تمرين بكالوريا: العلاقة بين البنية الفراغية للغلوبين وفقر الدم المنجلي (Drepanocytose)",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "مرض فقر الدم المنجلي ناتج عن طفرة استبدال في المورثة المشفرة لسلسلة بيتا للهيموغلوبين، حيث يستبدل الحمض الأميني رقم 6 وهو حمض الجلوتاميك (Glu) المشحون والقطبي بالحمض الأميني الفالين (Val) الكاره للماء. عند انخفاض ضغط الأكسجين في الدم الوريدي، يتشوه شكل كريات الدم الحمراء وتصبح منجلية هشة تسد الشعيرات الدموية. 1) قارن بين الخاصية الكيميائية للجذر R لحمض الجلوتاميك والفالين. 2) فسر على المستوى الجزيئي كيف يؤدي استبدال Glu بـ Val إلى تشكل ألياف صلبة من الهيموغلوبين المشوه (HbS) وترسبه داخل الكرية. 3) استنتج أهمية ثبات البنية الأولية في الحفاظ على التخصص الوظيفي للبروتين.",
    modelSolution_ar: [
      "1) المقارنة الكيميائية: حمض الجلوتاميك (Glu) حمض أميني قطبي مشحون بشحنة سالبة عند pH الدم (7.4) لاحتواء جذره على مجموعة كربوكسيلية (-COO-)، وهو محب للماء يساهم في تشكيل روابط قطبية مع جزيئات الماء وذوبان الهيموغلوبين. بينما الفالين (Val) حمض أميني لا قطبي، كاره للماء، جذره هيدروكربوني متعادل يميل للتجمع والابتعاد عن الماء.",
      "2) التفسير الجزيئي لتشكل الألياف: في الهيموغلوبين الطبيعي (HbA)، يتوضع حمض الجلوتاميك على السطح الخارجي لجزيء الهيموغلوبين محافظاً على انحلاله. في الهيموغلوبين الطافر (HbS)، يحل الفالين الكاره للماء على السطح الخارجي للجزيء، مما يخلق 'بقعة كارهة للماء' شاذة ومكشوفة على السطح. عند انخفاض ضغط الأكسجين وانتقال الهيموغلوبين إلى الحالة غير المؤكسجة (Désoxy-HbS)، تظهر على جزيء مجاور منطقة كارهة للماء متكاملة معها، فتتجاذب جزيئات HbS المتجاورة عبر روابط كارهة للماء وتتكدس وتتجمع في صورة ألياف أنبوبية صلبة طويلة تترسب داخل الكرية الحمراء، مسببة تشوه غشائها الخلوي إلى الشكل المنجلي وانسداد الشعيرات.",
      "3) الاستنتاج: يحدد تسلسل وطبيعة الأحماض الأمينية في البنية الأولية نوع وتموضع الروابط الكيميائية التي تؤمن انطواء البنية الثالثية وتوزيع الجذور المحبة والكارهة للماء؛ وأي تغير في حمض أميني واحد قد يغير الخصائص الفيزيائية والكيميائية للسطح ويؤدي إلى فقدان الوظيفة الحيوية وظهور اختلالات مرضية خطيرة.",
    ],
    markingScheme_ar: [
      { criterion: "المقارنة الكيميائية الدقيقة بين جذر Glu و جذر Val", points: 1.5 },
      { criterion: "تفسير نشوء البقع الكارهة وتكدس ألياف HbS عند إزالة الأكسجين", points: 2.5 },
      { criterion: "الاستنتاج المنهجي حول حتمية البنية الأولية للوظيفة", points: 1.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 46-65)",
    historicalBacRef: "BAC 2018 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 4. snv_enzyme_kinetics_active_site_regulation
// ============================================================================

export const SNV_ENZYME_KINETICS_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_enzyme_kinetics_active_site_regulation",
  canonicalTitle_ar: "النشاط الإنزيمي: الموقع الفعال والتنظيم الحركي",
  canonicalTitle_fr: "Activité enzymatique : site actif et régulation cinétique",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "النشاط الإنزيمي للبروتينات",
  status: "APPROVED",
  scopeIn: [
    "مفهوم الإنزيم كوسيط حيوي نوعي يتميز بالتأثير النوعي المزدوج (نوعية تجاه الركيزة ونوعية تجاه التفاعل).",
    "بنية الموقع الفعال (Site actif): موقع التثبيت وموقع التحفيز والتكامل المحفز (Ajustement induit).",
    "الحركية الإنزيمية: العلاقة بين السرعة الابتدائية Vi وتركيز مادة التفاعل [S] وحالة التشبع والسرعة الأعظمية Vmax.",
    "تأثير درجة الحرارة: التمييز بين التثبيط العكوس بالبرودة (انخفاض الطاقة الحركية) والتخريب غير العكوس بالحرارة المرتفعة (انكسار الروابط).",
    "تأثير باهاء الوسط (pH): تغير الحالة الشاردية لجذور الأحماض الأمينية في الموقع الفعال.",
    "المثبطات التنافسية وغير التنافسية وتفسير المنحنيات التجريبية.",
  ],
  scopeOut: [
    "معادلة ميكائيليس-مينتن الرياضية التفصيلية وحساب ثابت Km بيانيا (Lineweaver-Burk) غير المقررة على 3AS.",
    "دراسة الحركية التآزرية لإنزيمات الألوستيري (Allostérie) بمستويات جامعية.",
  ],
  prerequisites: {
    hard: ["snv_protein_structure_amphoteric_ionization"],
    soft: ["مفهوم التفاعل الكيميائي والسرعة الابتدائية"],
    foundation: ["البنية الفراغية للبروتين والروابط الكيميائية"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_ENZ_01",
      bloomLevel: "analyze",
      description_ar: "يحلل منحنيات السرعة الابتدائية بدلالة تركيز مادة التفاعل ويفسر ظاهرة التشبع بتشكل المعقدات [ES].",
    },
    {
      code: "LO_SNV_ENZ_02",
      bloomLevel: "evaluate",
      description_ar: "يميز علمياً ومنهجياً بين التثبيط المؤقت العكوس في درجات الحرارة المنخفضة والتخريب غير العكوس في درجات الحرارة المرتفعة.",
    },
    {
      code: "LO_SNV_ENZ_03",
      bloomLevel: "apply",
      description_ar: "يفسر آلية تأثير تغيرات الـ pH على النشاط الإنزيمي بربطها بالحالة الشاردية للأحماض الأمينية للموقع الفعال.",
    },
  ],
  coreConcepts_ar: [
    "الإنزيم وسيط حيوي بروتيني يسرع التفاعل دون أن يستهلك فيه ويتميز بنوعية اتجاه مادة التفاعل ونوعية التفاعل.",
    "يتشكل أثناء التفاعل معقد إنزيم-مادة التفاعل [ES] على مستوى تجويف نوعي يدعى الموقع الفعال بالتكامل المحفز.",
    "عند التراكيز العالية لمادة التفاعل تشغل جميع المواقع الفعالة للإنزيم فيصل التفاعل إلى السرعة القصوى Vmax (التشبع).",
    "الحرارة المرتفعة تفكك الروابط غير التساهمية وتخرب البنية الفضائية نهائياً، بينما البرودة تجمد الحركة التصادمية عكوساً.",
  ],
  lessonPackage: {
    overview_ar: "الإنزيمات بروتينات ذات تخصص وظيفي نوعي تحفز التفاعلات الأيضية بكفاءة عالية وفق شروط فيزيولوجية دقيقة من الحرارة والـ pH.",
    biologicalMechanism_ar: [
      "1. تشكل المعقد [ES]: يؤدي اقتراب الركيزة من الموقع الفعال إلى تحفيز تغير طفيف في شكله الفضائي لتطويقها بدقة (تكامل محفز).",
      "2. التثبيت والتحفيز: ترتبط الركيزة بأحماض موقع التثبيت بروابط انتقالية ضعيفة، وتتدخل أحماض موقع التحفيز بكسر أو تركيب الروابط الكيميائية متشكلاً الناتج P.",
      "3. تحرر الناتج وإعادة الاستعمال: ينفصل الناتج P ويستعيد الإنزيم شكله الأولي ليكون جاهزاً لدورة تفاعلية جديدة: E + S <-> [ES] -> E + P.",
    ],
    evidenceAndObservation_ar: "منحنى Vi بدلالة [S] يبين تزايداً خطياً في السرعة عند التراكيز الضعيفة، ثم ثباتها تدريجياً عند قيمة أعظمية Vmax مهما زاد تركيز الركيزة.",
    scientificReasoning_ar: "ثبات السرعة عند Vmax يثبت أن عدد جزيئات الإنزيم في الوسط محدود، وعند التراكيز المرتفعة للركيزة تصبح جميع المواقع الفعالة مشغولة بالمعقد [ES] فلا يجد الفائض موقعاً للارتباط.",
    biologicalConclusion_ar: "النشاط الإنزيمي مشروط بسلامة الموقع الفعال وبنيته الفراغية وتأثر هذه البنية بالعوامل البيئية ينظم التفاعلات الحيوية داخل الخلية.",
  },
  workedModel: {
    problem_ar: "تم قياس نشاط إنزيم في 3 أنابيب: الأنبوب 1 عند درجة حرارة 0°C؛ الأنبوب 2 عند 37°C؛ الأنبوب 3 عند 70°C. بعد 10 دقائق أعيدت الأنابيب الثلاثة إلى 37°C وقيس النشاط. فسر النتائج الملاحظة.",
    documentData_ar: "النشاط في الأنبوب 1 = 0 ثم استعاد 100%؛ الأنبوب 2 = 100% وظل 100%؛ الأنبوب 3 = 0 وظل 0.",
    observation_ar: "الأنبوب 1 توقف نشاطه عند 0°C لكنه استعاده كلياً عند 37°C؛ بينما الأنبوب 3 توقف نشاطه عند 70°C وظل منعدماً نهائياً حتى بعد إعادته لـ 37°C.",
    interpretation_ar: "في الأنبوب 1 (0°C): انخفاض الحرارة أدى إلى تدني الطاقة الحركية للجزيئات ونقص التصادمات الفعالة دون المساس بالروابط الكيميائية (تثبيط عكوس). في الأنبوب 3 (70°C): الطاقة الحركية المفرطة كسرت الروابط الضعيفة (الهيدروجينية والشاردية) التي تحافظ على بنية الموقع الفعال مما أدى إلى تخريبه نهائياً وبشكل غير عكوس.",
    deduction_ar: "الحرارة المنخفضة تبطئ النشاط عكوساً، بينما الحرارة المرتفعة تخرب الإنزيم نهائياً.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_enz_l1",
      capabilityId: "snv_enzyme_kinetics_active_site_regulation",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "ماذا يحدث لجزيئات الإنزيم عند الوصول إلى السرعة الابتدائية القصوى (Vmax) في وسط يحتوي على تركيز مفرط من مادة التفاعل؟",
      expectedResponse_ar: "تصبح جميع المواقع الفعالة لجزيئات الإنزيم مشبعة ومرتبطة بمادة التفاعل في صورة معقدات [ES].",
      reasoningSteps_ar: [
        "استحضار مفهوم حالة التشبع الحركي الإنزيمي.",
        "الربط بين Vmax وتشبع جميع المواقع الفعالة المتاحة.",
      ],
      biologicalModel_ar: {
        system_ar: "تفاعل إنزيمي في شروط مخبرية مثلى.",
        experimentalConditions_ar: "تركيز إنزيم ثابت مع تركيز ركيزة فائض [S] >> [E].",
        governingBiologicalMechanisms_ar: ["تشكل المعقد الإنزيمي وحالة التشبع."],
        evidenceExtracted_ar: "الوصول إلى Vmax وثبات السرعة.",
        deductionOrConclusion_ar: "تشبع 100% من المواقع الفعالة.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن الإنزيم استهلك أو تكسر عند Vmax خطأ مفاهيمي، فالإنزيم وسيط حيوي لا يستهلك أثناء التفاعل.",
      },
      scoringRubric_ar: "درجة كاملة لاختيار تشبع المواقع الفعالة بالمعقدات [ES].",
    },
    l2_application: {
      id: "snv_enz_l2",
      capabilityId: "snv_enzyme_kinetics_active_site_regulation",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "يمتلك إنزيم التربسين في موقعه الفعال الحمض الأميني Asp رقم 189 ذو الشحنة السالبة (-COO-) الذي يثبت ركائز تحتوي على حمض الليسين ذو الشحنة الموجبة. فسر لماذا ينعدم نشاط التربسين في وسط ذي pH = 1.0.",
      expectedResponse_ar: "في وسط ذي pH = 1.0 (حامضي قوي)، يكتسب جذر حمض الأسبارتيك بروتوناً وتتحول شحنته من سالبة (-COO-) إلى متعادلة (-COOH). بزوال الشحنة السالبة في موقع التثبيت، يستحيل تشكل الرابطة الشاردية مع الليسين الموجب في الركيزة، مما يمنع تثبيت الركيزة وتشكل المعقد [ES] فينعدم النشاط.",
      reasoningSteps_ar: [
        "تحديد الحالة الشاردية لـ Asp في pH=1.0: يكتسب بروتوناً ويفقد شحنته السالبة.",
        "علاقة الشحنة بتشكل الرابطة الشاردية مع الركيزة.",
        "النتيجة: فشل التثبيت -> انعدام النشاط.",
      ],
      biologicalModel_ar: {
        system_ar: "الموقع الفعال لإنزيم التربسين وتأثره بالحموضة.",
        experimentalConditions_ar: "وسط حامضي شديد pH=1.0.",
        governingBiologicalMechanisms_ar: ["التشرد البروتوني للمجموعات الكربوكسيلية وتثبيت الركيزة."],
        evidenceExtracted_ar: "Asp189 سالب يفقد شحنته عند pH=1.",
        deductionOrConclusion_ar: "تخرب موقع التثبيت الشاردي يعطل تشكل المعقد [ES].",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "القول بأن 'الإنزيم تخرب' دون تفسير التغير الشاردي المحدد لجذر الأسبارتيك يعد نقصاً في التبرير البيوكيميائي.",
      },
      scoringRubric_ar: "0.5 ن لتغير شحنة Asp إلى متعادلة، 0.5 ن لمنع تشكل الرابطة الشاردية والمعقد [ES].",
    },
    l3_mixed: {
      id: "snv_enz_l3",
      capabilityId: "snv_enzyme_kinetics_active_site_regulation",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة قياس السرعة الابتدائية لتفاعل إنزيمي بدلالة [S] في غياب وفي وجود مادة كيميائية (I). يظهر المنحنى في وجود (I) انخفاض السرعة الابتدائية عند التراكيز المنخفضة لمادة التفاعل، ولكن عند تراكيز عالية جداً من [S] تصل السرعة إلى نفس قيمة Vmax المسجلة في غياب (I). حلل الوثيقة واستنتج النمط التثبيطي للمادة (I).",
      expectedResponse_ar: "التحليل: في غياب المادة (I)، تتزايد السرعة الابتدائية تدريجياً مع زيادة [S] حتى تثبت عند Vmax. في وجود المادة (I)، تسجل سرعات ابتدائية أقل عند التراكيز الضعيفة للركيزة، ولكن مع زيادة تركيز الركيزة تواصل السرعة ارتفاعها حتى تبلغ نفس السرعة القصوى Vmax عند التراكيز المرتفعة جداً. الاستنتاج: المادة (I) مثبط تنافسي (Inhibiteur compétitif) يشبه بنيوياً مادة التفاعل ويتنافس معها على شغل الموقع الفعال، ويمكن إزاحته والتغلب على تأثيره برفع تركيز الركيزة.",
      reasoningSteps_ar: [
        "مقارنة المنحنيين عند التراكيز الضعيفة والعالية لـ [S].",
        "ملاحظة الوصول إلى نفس Vmax في النهاية.",
        "الاستنتاج: التثبيط تنافسي عكوس يتم التغلب عليه بزيادة مادة التفاعل.",
      ],
      biologicalModel_ar: {
        system_ar: "حركية إنزيمية معالجة بمثبط كيميائي نوعي.",
        experimentalConditions_ar: "قياس Vi بدلالة [S] مع وبدون المثبط.",
        governingBiologicalMechanisms_ar: ["التنافس الجزيئي على نفس الموقع الفعال بين الركيزة والمثبط."],
        evidenceExtracted_ar: "انخفاض Vi في التراكيز الضعيفة وبلوغ نفس Vmax عند التراكيز العالية.",
        deductionOrConclusion_ar: "المثبط تنافسي بنيوياً مع الركيزة.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "استنتاج أن المثبط غير تنافسي أو خرب الإنزيم يناقض إمكانية الوصول لنفس Vmax عند رفع تركيز الركيزة.",
      },
      scoringRubric_ar: "0.5 ن للمقارنة، 0.5 ن لتفسير بلوغ Vmax، 1.0 ن للاستنتاج الدقيق للمثبط التنافسي.",
    },
    l4_transfer: {
      id: "snv_enz_l4",
      capabilityId: "snv_enzyme_kinetics_active_site_regulation",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "بكتيريا تعيش في الينابيع الحارة (Thermus aquaticus) تمتلك إنزيم بوليميراز (Taq polymérase) يعمل بكفاءة قصوى عند 75°C ولا يتخرب عند 95°C، بينما إنزيم البوليميراز البشري يتخرب تماماً عند 50°C. بينت دراسة مقارنة للبنية الفراغية للإنزيمين أن إنزيم البكتيريا الحارة يملك عدداً أكبر بكثير من الروابط الشاردية والجسور الكبريتية وتداخلاً كثيفاً للجذور الكارهة للماء. فسر قدرة إنزيم Taq على مقاومة التخريب الحراري مستنداً إلى معطيات البنية الجزيئية.",
      expectedResponse_ar: "التفسير: الحرارة المرتفعة تزيد الطاقة الحركية للجزيئات وتعمل على تفكيك الروابط الكيميائية الضعيفة (الهيدروجينية والشاردية) التي تحافظ على البنية الفراغية للموقع الفعال، كما يحدث في الإنزيم البشري قليل الروابط التساهمية. أما إنزيم Taq polymérase، فيمتلك بنية فضائية مدعمة بعدد هائل من الجسور ثنائية الكبريت (روابط تساهمية قوية تتطلب طاقة حرارية هائلة لكسرها)، وروابط شاردية وتجاذبات كارهة للماء متراصة بكثافة. هذه الشبكة المتماسكة من الروابط تمنح البنية الفراغية صلابة استثنائية تقاوم التفكك الحراري وتصون شكل الموقع الفعال حتى عند 95°C، مما يسمح له بأداء وظيفته دون تخريب.",
      reasoningSteps_ar: [
        "تحديد آلية التخريب الحراري: كسر الروابط الضعيفة بفعل الطاقة الحركية.",
        "ربط كثافة الجسور الكبريتية والروابط القوية بالصلابة الترموديناميكية لإنزيم Taq.",
        "الاستنتاج: استقرار البنية الفراغية عند الحرارة العالية نتيجة مباشرة لعدد ونوع الروابط التثبيتية.",
      ],
      biologicalModel_ar: {
        system_ar: "إنزيمات بكتيريا البيئات المتطرفة (Extrêmophiles).",
        experimentalConditions_ar: "مقارنة ثبات البنية عند درجات حرارة مرتفعة (75°C - 95°C).",
        governingBiologicalMechanisms_ar: ["الاستقرار الجزيئي بالروابط التساهمية ثنائية الكبريت وتراصف الجذور."],
        evidenceExtracted_ar: "كثرة جسور الكبريت والروابط الشاردية في إنزيم Taq.",
        deductionOrConclusion_ar: "التكيف الجزيئي للإنزيمات مشفر في البنية الفراغية المقاومة للحرارة.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "القول بأن إنزيم Taq لا يمتلك موقعاً فعالاً أو أن حرارته المثلى معجزة لا تفسير لها يخالف المنطق العلمي القائم على قوة الروابط الكيميائية.",
      },
      scoringRubric_ar: "1 ن لتفسير أثر الحرارة على كسر الروابط، 1 ن لتفسير دور الجسور التساهمية في ثبات إنزيم Taq.",
    },
    l5_bac_style: {
      id: "snv_enz_l5",
      capabilityId: "snv_enzyme_kinetics_active_site_regulation",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا: يعاني بعض الأشخاص من عدم تحمل اللاكتوز نتيجة نقص أو خلل في إنزيم اللاكتاز (Lactase). يمثل الشكل (أ) آلية التكامل المحفز بين الإنزيم واللاكتوز حيث يؤدي تثبيت اللاكتوز إلى تقارب الحمضين Glu198 و Glu380 في الموقع الفعال لحدوث الحلمأة. يمثل الشكل (ب) نتائج تجريبية لقياس سرعة حلمأة اللاكتوز في درجات حرارة مختلفة (10°C, 37°C, 65°C) وعند درجات باهاء مختلفة (3, 6, 10). 1) اشرح مفهوم 'التكامل المحفز' مستعيناً بمعطيات الشكل (أ). 2) فسر النتائج التجريبية للشكل (ب) محدداً الشروط المثلى لعمل الإنزيم. 3) قدم نصيحة غذائية مدعمة علمياً لشخص مصاب بنقص اللاكتاز يرغب في شرب الحليب.",
      expectedResponse_ar: [
        "1) شرح التكامل المحفز: الموقع الفعال للإنزيم لا يملك مسبقاً شكلاً مطابقاً تماماً لمادة التفاعل بل شكلاً متمماً جزئياً؛ عند اقتراب اللاكتوز، تحفز المجموعات الكيميائية للركيزة أحماض الموقع الفعال على تغيير طفيف في تموضعها الفضائي، فتتقارب الأحماض المحفزة (Glu198 و Glu380) بدقة حول الرابطة الأوزيدية للاكتوز، مما يسمح بتطويق الركيزة بإحكام وحدوث تفاعل الحلمأة بكفاءة عالية.",
        "2) تفسير الشكل (ب) والشروط المثلى: أ) تأثير الحرارة: عند 10°C السرعة ضعيفة جداً لانخفاض الطاقة الحركية وتناقص التصادمات؛ عند 37°C تبلغ السرعة قيمتها الأعظمية (الحرارة المثلى) لتوفر حركة تصادمية مناسبة مع سلامة البنية؛ عند 65°C تنعدم السرعة لتخرب البنية الفراغية للموقع الفعال بكسر الروابط غير التساهمية (تخريب غير عكوس). ب) تأثير الـ pH: عند pH=6 تبلغ السرعة قيمتها القصوى (الـ pH الأمثل) حيث تتواجد الأحماض Glu198 و Glu380 في الحالة الشاردية المناسبة للتحفيز؛ عند pH=3 تكتسب الجذور بروتونات (-COOH) وتفقد شحنتها، وعند pH=10 تفقد بروتوناتها وتتغير شحنات الموقع فيفشل التكامل والتحفيز. الشروط المثلى: حرارة 37°C و pH=6.",
        "3) النصيحة الغذائية المدعمة علمياً: يُنصح بتناول حليب منزوع اللاكتوز صناعياً (معالج مسبقاً بإنزيم اللاكتاز ومفكك إلى جلوكوز وجلاكتوز)، أو تناول كبسولات إنزيم اللاكتاز التجاري عند استهلاك مشتقات الحليب لتعويض النقص الإنزيمي المعوي وتفادي التخمر والاضطرابات الهضمية.",
      ],
      reasoningSteps_ar: [
        "شرح آلية التكامل المحفز بدقة جزيئية.",
        "تفسير منحنيات الحرارة والـ pH وربطها بالطاقة الحركية والحالة الشاردية.",
        "استخلاص الشروط المثلى واقتراح حل تطبيقي بيولوجي سليم.",
      ],
      biologicalModel_ar: {
        system_ar: "إنزيم اللاكتاز المعوي وحلمأة سكر الحليب.",
        experimentalConditions_ar: "تغير منهجي لدرجات الحرارة والباهاء مع دراسة التكامل المحفز.",
        governingBiologicalMechanisms_ar: ["التكامل المحفز، التأين الشاردي، والتخريب الحراري."],
        evidenceExtracted_ar: "تقارب Glu198 و Glu380، والقمم عند 37°C و pH=6.",
        deductionOrConclusion_ar: "النشاط الإنزيمي محكوم بصرامة بالهندسة الفضائية للموقع الفعال وشروط الوسط.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الخلط بين التكامل التام (نموذج القفل والمفتاح لفيشر) والتكامل المحفز لكوشلاند يمثل خطأ في استيعاب التغير الفراغي المستحث.",
      },
      scoringRubric_ar: "1.5 ن لشرح التكامل المحفز، 2.5 ن لتفسير الشروط المثلى (حرارة و pH)، 1.0 ن للنصيحة العلمية (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "استعمال مصطلح 'تخرب الإنزيم' عند درجات الحرارة المنخفضة (0°C)، أو إغفال التغير الشاردي عند تغير الـ pH.",
    wrongMentalModel_ar: "الاعتقاد بأن البرودة تخرب الموقع الفعال كما تفعل السخونة تماماً.",
    correctMentalModel_ar: "البرودة تجمد الحركة وتبطئ التصادمات دون مساس بالروابط (تثبيط عكوس يسترجع بالتدفئة)، بينما الحرارة العالية تكسر الروابط وتغير شكل الموقع الفعال نهائياً (تخريب غير عكوس).",
    threeStepActionProtocol_ar: [
      "1. انظر لدرجة الحرارة: إذا كانت منخفضة (0°C - 10°C) اكتب فوراً: 'تثبيط عكوس ناتج عن قلة الطاقة الحركية، والبنية سالمة'.",
      "2. إذا كانت مرتفعة (>50°C) اكتب: 'تخريب غير عكوس بكسر الروابط غير التساهمية وتشوه الموقع الفعال نهائياً'.",
      "3. إذا كان العامل هو الـ pH: ركز على 'تغير الحالة الشاردية لجذور الأحماض الأمينية في الموقع الفعال'.",
    ],
    microDrill_ar: {
      prompt_ar: "إنزيم تم وضعه في 0°C لمدة ساعة ثم أعيد تدريجياً لـ 37°C. ماذا يحدث لنشاطه ولماذا؟",
      solution_ar: "يستعيد الإنزيم كامل نشاطه الطبيعي لأن البرودة تسبب تثبيطاً مؤقتاً عكوساً بنقص حركة الجزيئات دون المساس بالبنية الفضائية للموقع الفعال.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_enz_retest_01",
    invariantTested_ar: "التمييز بين التثبيط الحراري العكوس والتخريب غير العكوس وتأثير الـ pH.",
    changedSurface_ar: "تغيير الإنزيم إلى الأميلاز اللعابي (Amylase salivaire) الذي يعمل في الفم عند pH=7 و 37°C وينتقل إلى المعدة عند pH=2.",
    prompt_ar: "يفرز إنزيم الأميلاز اللعابي في الفم حيث يفكك النشا بكفاءة عند pH = 7.0 و 37°C. عند ابتلاع اللقمة ووصولها إلى المعدة (pH = 2.0)، يتوقف تفكيك النشا كلياً. فسر جزيئياً سبب توقف نشاط الأميلاز في المعدة، وبين ما إذا كان هذا التوقف عكوساً أم غير عكوس.",
    solution_ar: "في المعدة ذات الوسط الحامضي الشديد (pH=2.0)، تكتسب المجموعات الكربوكسيلية لجذور أحماض الموقع الفعال بروتونات H+ فتتغير حالتها الشاردية وشحناتها وتتكسر الروابط الشاردية المسؤولة عن شكل الموقع الفعال، مما يمنع تثبيت النشا. ونظراً لشدة الحموضة وتأثير إنزيمات البيبسين المعدية، فإن هذا التخرب غير عكوس ويفقد الأميلاز بنيته ونشاطه نهائياً.",
    passCondition_ar: "ربط توقف النشاط بالحالة الشاردية وانكسار الروابط وتحديد عدم العكوسية.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: تصميم دواء مضاد لإنزيم الأستيل كولين إستراز لمعالجة ألزهايمر",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "يتميز مرض ألزهايمر بنقص حاد في الناقل العصبي الأستيل كولين في المشابك الدماغية نتيجة سرعة تفكيكه بواسطة إنزيم أستيل كولين إستراز (AChE). لعلاج الأعراض، طُور دواء 'دونيبيزيل' (Donépézil). يوضح الشكل (1) بنية الموقع الفعال للإنزيم أثناء تفكيك الأستيل كولين، ويوضح الشكل (2) تراكيز الأستيل كولين في المشابك بدلالة جرعة الدواء المعطاة، حيث بينت التحاليل البلورية أن الدواء يرتبط بالموقع الفعال للإنزيم دون أن يتعرض للحلمأة. 1) استخرج من الشكل (1) الخصائص البنيوية للموقع الفعال. 2) فسر آلية عمل دواء دونيبيزيل ومساهمته في التخفيف من أعراض المرض. 3) ما نوع التثبيط الذي يمارسه هذا الدواء؟ برر إجابتك.",
    modelSolution_ar: [
      "1) الخصائص البنيوية للموقع الفعال: الموقع الفعال عبارة عن جيب ثلاثي الأبعاد يتكون من أحماض أمينية محددة وراثياً ومتباعدة في البنية الأولية لكنها متقاربة فراغياً بفعل انطواء السلسلة، وينقسم إلى موقع تثبيت (يرتبط بمجموعات الأستيل كولين بروابط ضعيفة) وموقع تحفيز يحتوي على ثالوث تحفيزي يكسر الرابطة الإسترية.",
      "2) آلية عمل الدواء والتخفيف من المرض: يرتبط دواء دونيبيزيل بالموقع الفعال لإنزيم AChE بفضل تشابهه الفراغي معه، وبما أنه لا يتعرض للحلمأة فإنه يشغل الموقع ويمنع جزيئات الأستيل كولين الطبيعية من الارتباط به. يؤدي تثبيط الإنزيم إلى بقاء الأستيل كولين في الشق المشبكي لفترة أطول وزيادة تركيزه، مما يرفع احتمالية تثبته على المستقبلات بعد المشبكية وتكرار توليد السيالة العصبية، فيعوض العجز الناجم عن تنكس العصبونات ويخفف من تدهور الذاكرة والوظائف الإدراكية.",
      "3) نوع التثبيط والتبرير: التثبيط هو تثبيط تنافسي عكوس (Inhibition compétitive)، لأن الدواء يتنافس مباشرة مع مادة التفاعل الطبيعية على نفس الموقع الفعال للإنزيم ولا يخرب البنية تساهمياً.",
    ],
    markingScheme_ar: [
      { criterion: "استخراج الخصائص البنيوية للموقع الفعال (الجيب، التقارب الفضائي، موقعي التثبيت والتحفيز)", points: 1.5 },
      { criterion: "تفسير آلية التثبيط وزيادة تركيز الناقل في الشق المشبكي", points: 2.5 },
      { criterion: "تحديد نوع التثبيط التنافسي مع التبرير العلمي", points: 1.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 66-85)",
    historicalBacRef: "BAC 2022 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};


// ============================================================================
// 5. snv_self_nonself_hla_recognition
// ============================================================================

export const SNV_SELF_NONSELF_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_self_nonself_hla_recognition",
  canonicalTitle_ar: "المناعة: التمييز بين الذات واللاذات ونظام الـ HLA",
  canonicalTitle_fr: "Immunité : distinction soi / non-soi et système HLA",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "دور البروتينات في الدفاع عن الذات",
  status: "APPROVED",
  scopeIn: [
    "مفهوم الذات واللاذات والمحددات المستضدية (Epitopes).",
    "معقد التوافق النسيجي الرئيسي (CMH / HLA) وأصنافه: CMH-I على جميع الخلايا ذات النواة، و CMH-II على الخلايا العارضة (CPA: بالعات، خلايا شجيرية، LB).",
    "المنشأ والخصائص الوراثية لنظام الـ HLA: تعدد المورثات، تعدد الأليلات، وتساوي السيادة (Codominance)، وغياب العبور مما يمنح هوية بيولوجية فريدة لكل فرد.",
    "الزمر الدموية وفق نظامي ABO و Rhesus كجزيئات سكرية بروتينية غشائية ومحددات للذات.",
    "تفسير قبول أو رفض الطعوم النسيجية وفق التوافق الوراثي للـ HLA.",
  ],
  scopeOut: [
    "الجينات الثانوية للـ CMH غير المقررة (HLA-E, HLA-G) والتفاصيل المناعية الجنينية المتقدمة.",
    "آليات أمراض المناعة الذاتية النادرة خارج المنهاج الوزاري لـ 3AS.",
  ],
  prerequisites: {
    hard: ["snv_protein_structure_amphoteric_ionization"],
    soft: ["مفهوم الغشاء الهيولي والفسيفسائي المائع والبروتينات السكرية الغشائية"],
    foundation: ["مفهوم الزمر الدموية والوراثة المندلية وتساوي السيادة"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_HLA_01",
      bloomLevel: "understand",
      description_ar: "يميز بين جزيئات CMH-I و CMH-II من حيث البنية السلسيلية وتوزعها الخلوي وطبيعة البيبتيد المعروض (داخلي المنشأ مقابل خارجي المنشأ).",
    },
    {
      code: "LO_SNV_HLA_02",
      bloomLevel: "analyze",
      description_ar: "يعلل التنوع الهائل لجزيئات الـ HLA بين الأفراد بخصائص المورثات (تعدد المورثات والأليلات وتساوي السيادة).",
    },
    {
      code: "LO_SNV_HLA_03",
      bloomLevel: "evaluate",
      description_ar: "يفسر نتائج زرع الطعوم وتوافق الزمر الدموية بنية وظيفية لمحددات الذات على أسطح الأغشية الخلوية.",
    },
  ],
  coreConcepts_ar: [
    "تتحدد الهوية البيولوجية للفرد ببروتينات سكرية غشائية مشفرة وراثياً تعرف بمعقد التوافق النسيجي الكبير (CMH/HLA).",
    "جزيئات CMH-I توجد على سطح جميع الخلايا ذات النواة وتعرض ببتيدات مستضدية ذات منشأ داخلي (فيروسية أو ورمية).",
    "جزيئات CMH-II توجد نوعياً على أسطح الخلايا العارضة للمستضد (CPA) وتعرض ببتيدات ذات منشأ خارجي مهضومة جزئياً.",
    "تتميز مورثات الـ HLA بتعدد أليلاتها المشفرة وتساوي سيادتها وغياب السيادة التامة، مما يجعل لكل فرد تركيبة فريدة باستثناء التوائم الحقيقية.",
  ],
  lessonPackage: {
    overview_ar: "الجهاز المناعي يتعرف على خلايا العضوية ويحميها بفضل بطاقة هوية بيولوجية جزيئية بروتينية تعرف بنظام الـ HLA، وتعتبر أي بنية غريبة تختلف عنها 'لاذات' تستدعي الاستجابة المناعية.",
    biologicalMechanism_ar: [
      "1. بنية CMH-I: تتكون من سلسلة ببتيدية ثقيلة ألفا (α) مدمجة في الغشاء ومتعددة الأشكال وثلاثية المجالات، مرتبطة بسلسلة خفيفة غير متعددة الأشكال تدعى بيتا-2-ميكروغلوبولين (β2m)، وبينهما تجويف يثبت ببتيدات بـ 8-10 أحماض أمينية.",
      "2. بنية CMH-II: تتكون من سلسلتين متماثلتي الطول مدمجتين في الغشاء (سلسلة ألفا α وسلسلة بيتا β) كلاهما متعددة الأشكال، وتشكلان تجويفاً يتسع لببتيدات أكبر (13-18 حمضاً أمينياً).",
      "3. المراقبة المناعية: الخلايا اللمفاوية تفحص باستمرار البيبتيدات المعروضة في تجاويف الـ CMH؛ إذا كان البيبتيد ذاتياً عادياً لا تستجيب، وإذا كان غريباً تطلق الرد المناعي الدفاعي.",
    ],
    evidenceAndObservation_ar: "تجارب زرع الطعوم بين فئران من سلالات مختلفة تظهر رفض الطعم بعد 10-12 يوماً بينما يقبل بين فئران نفس السلالة النقية أو التوائم الحقيقية المتطابقة جينياً.",
    scientificReasoning_ar: "رفض الطعم بين أفراد مختلفين وراثياً يثبت وجود مستقبلات مناعية تتعرف نوعياً على جزيئات الـ HLA الغريبة وتعتبرها لاذات وتجند ضدها خلايا لمفاوية قاتلة.",
    biologicalConclusion_ar: "جزيئات الـ HLA هي الركيزة الجزيئية للتعرف المناعي، واختلافها بين البشر يحمي النوع من الانقراض الجماعي بجائحة واحدة، ولكنه يشكل العائق الرئيسي في زراعة الأعضاء.",
  },
  workedModel: {
    problem_ar: "أجريت عملية زرع كلية لشخص مريض من متبرعين اثنين: المتبرع 1 أخ شقيق للمريض، والمتبرع 2 متبرع غريب. بعد أسبوعين، فحصت عينات من الكليتين المزروعتين فلوحظ بقاء كلية المتبرع 1 وظيفية بينما تعرضت كلية المتبرع 2 لارتشاح لمفاوي حاد وتنخر نسيجي ورفض الطعم. فسر هذا التباين مستنداً إلى الخصائص الوراثية لنظام الـ HLA.",
    documentData_ar: "المتبرع 1 شقيق وقبول الطعم، المتبرع 2 غريب ورفض الطعم الحاد بعد 14 يوماً.",
    observation_ar: "كلية الأخ الشقيق قبلت بينما كلية المتبرع الغريب رفضت بشدة خلال 14 يوماً بتدخل الخلايا اللمفاوية.",
    interpretation_ar: "بما أن مورثات الـ HLA تقع متقاربة على الصبغي 6 وتورث في صورة كتلة واحدة (Haplotype) دون عبور وبتساوي سيادة، فإن احتمال التوافق التام بين الإخوة هو 25% والتوافق الجزئي 50%، مما قلل التباين المناعي مع المتبرع 1. في المقابل، المتبرع الغريب يمتلك تشكيلة أليلات HLA مختلفة تماماً نظراً لتعدد الأليلات الهائل في المجتمع، فتعرفت اللمفاويات التائية للمريض على جزيئات الـ HLA الغريبة في الكلية المزروعة واعتبرتها لاذات ونشطت ضدها استجابة مناعية خلوية أدت إلى تخريب النسيج المزروع.",
    deduction_ar: "نجاح زرع الطعوم مشروط بمدى التوافق الجيني لجزيئات الـ HLA بين المعطي والمستقبل لتفادي تحفيز الاستجابة المناعية الرافضة.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_hla_l1",
      capabilityId: "snv_self_nonself_hla_recognition",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "على أسطح أي من الخلايا التالية تتواجد جزيئات معقد التوافق النسيجي من الصنف الثاني (CMH-II) حصراً؟",
      expectedResponse_ar: "الخلايا العارضة للمستضد (CPA) مثل البالعات الكبيرة والخلايا الشجيرية واللمفاويات B.",
      reasoningSteps_ar: [
        "استرجاع التوزيع النسيجي لصنفي الـ CMH.",
        "CMH-I على جميع الخلايا ذات النواة، و CMH-II مقصور على الخلايا المناعية العارضة.",
      ],
      biologicalModel_ar: {
        system_ar: "الجهاز المناعي وخلاياه المتخصصة.",
        experimentalConditions_ar: "فحص مجهري فلوري نوعي باستخدام أجسام مضادة مفلورة موجهة ضد الصنفين.",
        governingBiologicalMechanisms_ar: ["التعبير الجيني النوعي لمورثات الصنف الثاني في الخلايا العارضة."],
        evidenceExtracted_ar: "وجود CMH-II حصراً على خلايا CPA.",
        deductionOrConclusion_ar: "التخصص الوظيفي لعرض المستضدات للمفاويات التائية المساعدة.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "الاعتقاد بأن CMH-II موجود على جميع الخلايا أو على كريات الدم الحمراء (التي تفتقر للنواة أصلاً) خطأ في استرجاع المعلومات.",
      },
      scoringRubric_ar: "درجة كاملة لاختيار الخلايا العارضة للمستضد (CPA).",
    },
    l2_application: {
      id: "snv_hla_l2",
      capabilityId: "snv_self_nonself_hla_recognition",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "علل لماذا يستحيل نظرياً وعملياً وجود شخصين يحملان نفس جزيئات الـ HLA تماماً في المجتمع البشري (باستثناء التوائم الحقيقية).",
      expectedResponse_ar: "التعليل: يعود ذلك إلى ثلاث خصائص وراثية لنظام الـ HLA: 1) تعدد المورثات (A, B, C للصنف I و DP, DQ, DR للصنف II). 2) تعدد الأليلات الهائل لكل مورثة (عشرات إلى مئات الأليلات لكل موقع). 3) تساوي السيادة (Codominance) حيث تعبر جميع الأليلات الموروثة من الأب والأم معاً على سطح الغشاء. هذا المزيج الرياضي يعطي مليارات التراكيب الوراثية الممكنة، مما يجعل كل فرد يملك هوية بيولوجية فريدة لا يطابقه فيها إلا توأمه الحقيقي الناتج عن نفس البيضة الملقحة.",
      reasoningSteps_ar: [
        "ذكر المورثات المتعددة والأليلات المتعددة.",
        "ذكر مبدأ تساوي السيادة الرياضي.",
        "الاستنتاج: الفرادة البيولوجية لكل كائن بشري.",
      ],
      biologicalModel_ar: {
        system_ar: "الوراثة الجزيئية للصبغي رقم 6 عند الإنسان.",
        experimentalConditions_ar: "دراسة التنوع الوراثي البشري.",
        governingBiologicalMechanisms_ar: ["التنوع الأليلي الهائل والتعبير المتكافئ دون سيادة."],
        evidenceExtracted_ar: "تعدد المورثات، تعدد الأليلات، تساوي السيادة.",
        deductionOrConclusion_ar: "البصمة المناعية الفردية الفريدة.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "إهمال خاصية تساوي السيادة والاكتفاء بذكر 'كثرة الأليلات' يضعف التبرير الوراثي لنظام الـ HLA.",
      },
      scoringRubric_ar: "0.5 ن لتعدد المورثات والأليلات، 0.5 ن لتساوي السيادة والفرادة البيولوجية.",
    },
    l3_mixed: {
      id: "snv_hla_l3",
      capabilityId: "snv_self_nonself_hla_recognition",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة اختبار التراص الدموي لتحديد زمرة دم شخص (س) باستخدام أمصال اختبار تحتوي على أجسام مضادة نوعية: لوحظ حدوث تراص عند إضافة مصل مضاد A (Anti-A) وتراص عند إضافة مصل مضاد D (Anti-D)، بينما لم يحدث أي تراص مع مصل مضاد B (Anti-B). 1) استنتج الزمرة الدموية للشخص (س) محدداً نمطه الظاهري والمولدات الغشائية للذات لديه. 2) هل يمكن لهذا الشخص التبرع بالدم لشخص زمرته O+؟ علل إجابتك مناعياً.",
      expectedResponse_ar: "1) الاستنتاج: حدوث التراص مع مضاد A يثبت وجود مولد الضد الغشائي A على كريات دمه، وعدم حدوث التراص مع مضاد B يثبت غياب مولد الضد B، وحدوث التراص مع مضاد D يثبت وجود مولد الضد الريزوس (Rh+). وعليه، فإن الزمرة الدموية للشخص هي: A موجب (A+). 2) إمكانية التبرع لشخص O+: يستحيل التبرع له. التعليل المناعي: مصل الشخص ذي الزمرة O+ يحتوي طبيعياً على أجسام مضادة نوعية مضادة لـ A (Anti-A) في بلازما دمه؛ عند نقل دم الشخص (A+) إليه، ترتبط الأجسام المضادة للمستقبل بمولدات الضد A الموجودة على كريات دم المعطي مشكلة معقدات مناعية تؤدي إلى تراص وتحلل دموي فوري يهدد حياة المريض.",
      reasoningSteps_ar: [
        "قراءة نتائج التراص: تراص مع Anti-A و Anti-D يعني وجود مولد A وعامل Rhesus.",
        "تحديد الزمرة: A+.",
        "فحص التوافق المناعي: مصل الزمرة O يحمل مضادات A و B، مما يسبب رفضاً وتراصاً فورياً لدم A+.",
      ],
      biologicalModel_ar: {
        system_ar: "نظام الزمر الدموية ABO و Rhesus وتفاعلات التراص المناعي.",
        experimentalConditions_ar: "اختبار مصل الاختبار المصلي المخبري المباشر.",
        governingBiologicalMechanisms_ar: ["الارتباط النوعي بين مولد الضد الغشائي والجسم المضاد المصلي وتراص الخلايا."],
        evidenceExtracted_ar: "تراص مع Anti-A و Anti-Rh وغياب التراص مع Anti-B.",
        deductionOrConclusion_ar: "الزمرة A+ وخطورة نقلها لمستقبل O+.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين مولد الضد الموجود على الغشاء والجسم المضاد الموجود في المصل يؤدي لعكس قواعد نقل الدم.",
      },
      scoringRubric_ar: "1.0 ن لتحديد الزمرة A+ مع تعليل المولدات الغشائية، 1.0 ن لتعليل استحالة النقل إلى O+ مع ذكر Anti-A.",
    },
    l4_transfer: {
      id: "snv_hla_l4",
      capabilityId: "snv_self_nonself_hla_recognition",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "فيروس الحصبة الخلوية السيتوميجالوفيروس (CMV) يفرز بروتيناً فيروسياً يسمى US11 يوجه جزيئات CMH-I المصنعة حديثاً في الخلية المصابة نحو التفكيك في الجسيمات التأكسدية والبروتيازوم، مما يخفض كثافة CMH-I على غشاء الخلية إلى أقل من 5%. فسر كيف تسمح هذه الاستراتيجية للفيروس بالإفلات من الجهاز المناعي، واقترح الآلية الدفاعية البديلة التي تستعملها العضوية للقضاء على مثل هذه الخلايا التي فقدت CMH-I.",
      expectedResponse_ar: "التفسير: الخلايا اللمفاوية التائية السامة (LTC) تتعرف على الخلايا المصابة بالتعرف المزدوج عبر تثبت مستقبلها TCR على معقد (CMH-I - ببتيد مستضدي فيروسي). بتفكيك جزيئات CMH-I ومنع ظهورها على الغشاء، تصبح الخلية المصابة 'غير مرئية' للخلايا اللمفاوية التائية LTC، فلا تستطيع هذه الأخيرة التعرف عليها أو تفجيرها، مما يتيح للفيروس التكاثر بحرية دون إزعاج مناعي تكيفي. الآلية البديلة: تمتلك العضوية خلايا مناعية فطرية تدعى الخلايا القاتلة الطبيعية (Cellules NK / Natural Killers) التي تراقب باستمرار كثافة CMH-I؛ إذا وجدت خلية طبيعية تحمل CMH-I فإنها تتثبط، أما إذا التقت بخلية فقدت CMH-I فإن مستقبلاتها المنشطة تتفعل فوراً وتفرز البيرفورين والجرانزيم لتدمير الخلية المصابة رغم إفلاتها من اللمفاويات التائية.",
      reasoningSteps_ar: [
        "استغلال المعطى: خفض كثافة CMH-I في الخلية المصابة.",
        "ربط CMH-I بآلية التعرف المزدوج للمفاويات LTC.",
        "الاستنتاج: الإفلات من LTC والتعويض بخلايا المناعة الفطرية NK التي تقتل الخلايا منزوعة الـ CMH-I.",
      ],
      biologicalModel_ar: {
        system_ar: "استراتيجيات الإفلات المناعي الفيروسي والمراقبة الخلوية المزدوجة.",
        experimentalConditions_ar: "إصابة فيروسية متطورة مع تعديل بروتينات الغشاء.",
        governingBiologicalMechanisms_ar: ["التعرف المزدوج المعتمد على CMH-I والمراقبة التثبيطية لخلايا NK."],
        evidenceExtracted_ar: "غياب CMH-I يمنع تعرف LTC ويفعل خلايا NK.",
        deductionOrConclusion_ar: "تكامل خطوط الدفاع المناعية (المتكيفة والفطرية) لسد ثغرات الإفلات.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن غياب CMH-I يجعل الخلية غير قابلة للإصابة بالفيروس يقلب السبب بالنتيجة.",
      },
      scoringRubric_ar: "1 ن لتفسير الإفلات من اللمفاويات التائية التكيفية، 1 ن لاقتراح وتبرير دور خلايا NK.",
    },
    l5_bac_style: {
      id: "snv_hla_l5",
      capabilityId: "snv_self_nonself_hla_recognition",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا: تمثل الوثيقة شجرة نسب عائلة يحتاج فيها الابن المصاب بفشل كلوي لزرع كلية. يوضح الجدول معطيات الأنماط الوراثية لأليلات الـ HLA للأب والأم وأربعة أبناء (س، ع، ف، ص حيث ف هو المريض). أظهرت المعطيات أن أليلات الصبغي 6 للأب هي (H1: A1, B8, DR3) و (H2: A2, B44, DR4)، وللأم هي (H3: A3, B7, DR2) و (H4: A11, B35, DR1). 1) بين لماذا تورث أليلات الـ HLA ككتلة واحدة (Haplotype). 2) حدد بالتحليل الوراثي احتمالات التوافق بين الابن المريض (ف) وإخوته. 3) إذا كان نمط الابن المريض هو (H1 / H3)، ونمط الابن (س) هو (H1 / H3)، ونمط الابن (ع) هو (H2 / H4)، ونمط الابن (ص) هو (H1 / H4)، رتب الإخوة الثلاثة حسب الأفضلية كمتبرعين للابن (ف) مع التعليل العلمي.",
      expectedResponse_ar: [
        "1) تعليل توارث الأليلات ككتلة واحدة: يعود ذلك إلى التموضع المتقارب جداً لمورثات الـ HLA على الذراع القصير للصبغي رقم 6، مما يمنع حدوث العبور الصبغي (Crossing-over) بينها أثناء الانقسام المنصف، فتنتقل مجموعة مورثات الصبغي الواحد كاملة ومجتمعة (Haplotype) من كل والد إلى الأبناء ككتلة متراصة.",
        "2) احتمالات التوافق بين الإخوة: كل ابن يرث حتماً هابلوتيباً من الأب (H1 أو H2) وهابلوتيباً من الأم (H3 أو H4)، فتكون الأنماط الممكنة للأبناء أربعة بنسب متساوية (25% لكل نمط): (H1/H3), (H1/H4), (H2/H3), (H2/H4). وعليه: احتمال التوافق التام (100% تطابق) هو 25%، احتمال التوافق النصفي (50% تطابق بمشاركة هابلوتيب واحد) هو 50%، واحتمال عدم التوافق التام (0% تطابق) هو 25%.",
        "3) ترتيب الإخوة كمتبرعين والتعليل: - المرتبة الأولى: الابن (س) لأن نمطه هو (H1 / H3) وهو متطابق تماماً بنسبة 100% مع نمط المريض (ف)، مما يضمن تطابق جزيئات CMH-I و CMH-II وتفادي تحفيز الاستجابة المناعية الرافضة وتقليل الحاجة للأدوية المثبطة للمناعة. - المرتبة الثانية: الابن (ص) ذو النمط (H1 / H4) لأنه يملك توافقاً نصفياً (50%) بمشاركته الهابلوتيب H1 مع المريض، مما يعطي فرصة لنجاح الزرع مع علاج مناعي داعم. - المرتبة الأخيرة: الابن (ع) ذو النمط (H2 / H4) لأنه يختلف تماماً في كلا الهابلوتيبين عن المريض (0% توافق)، مما يؤدي حتماً إلى رفض مناعي حاد للكلية المزروعة.",
      ],
      reasoningSteps_ar: [
        "تفسير التوارث بالارتباط المطلق على الصبغي 6 وغياب العبور.",
        "حساب الاحتمالات الوراثية للأبناء الأربعة وشبكة التوزيع.",
        "مطابقة هابلوتيبات الإخوة وترتيبهم: س (100%) ثم ص (50%) ثم ع (0%).",
      ],
      biologicalModel_ar: {
        system_ar: "التشخيص الجزيئي للتوافق النسيجي لزراعة الأعضاء.",
        experimentalConditions_ar: "تحديد النمط الفرداني للهابلوتيبات الوراثية العائلية.",
        governingBiologicalMechanisms_ar: ["الارتباط الصبغي الوثيق، تساوي السيادة، وتوافق الـ CMH."],
        evidenceExtracted_ar: "ف (H1/H3) يطابق س (H1/H3) تماماً ويختلف كلياً عن ع (H2/H4).",
        deductionOrConclusion_ar: "الاختيار الأمثل للمتبرع لضمان بقاء العضو المزروع.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الاعتقاد بأن الأخوة دائماً متطابقون مناعياً أو إغفال التوزيع الاحتمالي للهابلوتيبات خطأ في الاستدلال الوراثي.",
      },
      scoringRubric_ar: "1.0 ن لتعليل التوارث الكتلي، 1.5 ن لشبكة الاحتمالات الوراثية، 2.5 ن للترتيب والتعليل المناعي الدقيق (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين خلايا وجود CMH-I و CMH-II، أو اعتبار الـ HLA نظاماً يتبع السيادة التامة لمندل.",
    wrongMentalModel_ar: "الاعتقاد بأن جزيئات الـ HLA تكون متطابقة بين الآباء والأبناء بنسبة 100%، أو أن كريات الدم الحمراء تحمل CMH.",
    correctMentalModel_ar: "كريات الدم الحمراء عديمة النواة ولا تحمل CMH إطلاقاً (تحمل فقط مستضدات ABO و Rh)؛ و CMH-I موجود على كل الخلايا ذات النواة بينما CMH-II مقصور على الخلايا العارضة CPA؛ ومورثات الـ HLA متساوية السيادة كلياً.",
    threeStepActionProtocol_ar: [
      "1. حدد نوع الخلية: إذا كانت كرية دم حمراء فهي خالية من CMH وتحمل مولدات ABO/Rh.",
      "2. إذا كانت خلية جسدية ذات نواة (كبد، كلية، جلد...) فهي تحمل CMH-I فقط؛ وإذا كانت خلية عارضة (بالعة، LB، شجيرية) فهي تحمل CMH-I و CMH-II معاً.",
      "3. في الوراثة: ادمج أليلات الأب والأم معاً دون تفضيل أو سيادة (تساوي سيادة تام).",
    ],
    microDrill_ar: {
      prompt_ar: "شخص ورث من والده الأليل HLA-A1 ومن والدته الأليل HLA-A2. أي الأليلين يظهر على غشاء خلاياه؟",
      solution_ar: "يظهر الأليلان معاً (HLA-A1 و HLA-A2) في آن واحد على غشاء خلاياه بفضل خاصية تساوي السيادة (Codominance).",
    },
  },
  isomorphicRetest: {
    retestId: "snv_hla_retest_01",
    invariantTested_ar: "التوافق النسيجي للهابلوتيبات الوراثية وتطابق الزمر الدموية.",
    changedSurface_ar: "تغيير الحالة لزرع نقي العظام بين أقارب مع الأخذ بالاعتبار الزمرة الدموية ونظام HLA.",
    prompt_ar: "يحتاج مريض لزرع نقي العظام، زمرته الدموية B+ ونمطه الـ HLA هو (H1/H4). تقدم متبرعان: الأول شقيق زمرته O+ ونمطه (H1/H4)، والثاني ابن عم زمرته B+ ونمطه (H2/H3). أيهما يمثل الخيار الصحيح للزرع مع التعليل البيولوجي الدقيق؟",
    solution_ar: "المتبرع الأول (الشقيق) هو الخيار الصحيح؛ لأن زرع نقي العظام يعتمد بشكل جوهري وأساسي على التطابق التام لجزيئات معقد الـ HLA لتجنب رفض الخلايا الجذعية المزروعة أو حدوث داء الطعم ضد المضيف (GVHD)، وبما أن الشقيق متطابق 100% في الـ HLA (H1/H4) والزمرة O معطي عام للكريات فلن تحدث مشاكل تراص، بينما ابن العم غير متوافق تماماً في الـ HLA (0% توافق) مما يؤدي حتماً إلى فشل الزرع والموت المناعي.",
    passCondition_ar: "إعطاء الأولوية القصوى لتطابق الـ HLA التام على الزمرة الدموية في زرع الأنسجة ونقي العظام.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: المراقبة المناعية وتمايز الخلايا اللمفاوية التائية في الغدة السعترية",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "تكتسب اللمفاويات التائية كفاءتها المناعية في الغدة السعترية (Thymus) عبر عمليتي انتقاء صارمتين: الانتقاء الإيجابي (Sélection positive) في القشرة حيث يتم الإبقاء فقط على الخلايا التي تتعرف مستقبلاتها TCR على جزيئات CMH الذاتية، والانتقاء السلبي (Sélection négative) في اللب حيث يتم تدمير الخلايا التي تتعرف بقوة شديدة على البيبتيدات الذاتية المعروضة. 1) فسر العواقب البيولوجية في حال فشل الانتقاء الإيجابي وإفلات خلايا لا تتعرف على CMH. 2) فسر العواقب البيولوجية في حال فشل الانتقاء السلبي وإفلات خلايا تتعرف بقوة على ببتيدات الذات. 3) استنتج دور نضج الخلايا التائية في ترسيخ مفهوم التسامح المناعي الذاتي (Tolérance immunitaire).",
    modelSolution_ar: [
      "1) عواقب فشل الانتقاء الإيجابي: إذا أفلتت خلايا لمفاوية تائية لا تستطيع مستقبلاتها TCR التعرف على جزيئات الـ CMH الذاتية، فإن هذه الخلايا ستكون عاجزة وظيفياً عن المراقبة المناعية في المحيط، ولن تستطيع الاستجابة لأي خلية عارضة CPA أو خلية مصابة لغياب القدرة على التعرف المزدوج، مما يسبب عجزاً مناعياً نوعياً ضد الميكروبات.",
      "2) عواقب فشل الانتقاء السلبي: إذا أفلتت خلايا لمفاوية تائية تتعرف بقوة وألفة عالية على البيبتيدات الذاتية للنسيج البشري، فإنها ستهاجم خلايا وأنسجة العضوية السليمة في المحيط وتفرز ضدها عوامل سامة أو تجند أجساماً مضادة، مما يؤدي إلى ظهور أمراض المناعة الذاتية الخطيرة (Maladies auto-immunes) مثل التصلب اللويحي، الذئبة الحمراء، وداء السكري من النوع الأول.",
      "3) الاستنتاج: نضج الخلايا التائية في الغدة السعترية هو عملية تدريب وانتقاء حيوية تضمن توفير جيش لمفاوي نوعي قادر على تمييز الذات ومقيد بالـ CMH الذاتي (عبر الانتقاء الإيجابي)، مع استئصال وتفكيك جميع الخلايا ذاتية التفاعل (عبر الانتقاء السلبي بالموت الخلوي المبرمج)، وهو ما يؤسس مبدأ التسامح المناعي الذي يحمي أعضاء الجسم من التدمير الذاتي مع الحفاظ على قدرة الدفاع الشرس ضد الغزاة الأجانب.",
    ],
    markingScheme_ar: [
      { criterion: "تفسير عواقب فشل الانتقاء الإيجابي (العجز المناعي الوظيفي)", points: 1.5 },
      { criterion: "تفسير عواقب فشل الانتقاء السلبي (أمراض المناعة الذاتية وتخريب الذات)", points: 2.0 },
      { criterion: "استنتاج مفهوم التسامح المناعي وأهميته الحيوية", points: 1.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 86-105)",
    historicalBacRef: "BAC 2020 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 6. snv_humoral_immunity_antibody_complex
// ============================================================================

export const SNV_HUMORAL_IMMUNITY_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_humoral_immunity_antibody_complex",
  canonicalTitle_ar: "المناعة الخلطية: الانتقاء النسيلي للأجسام المضادة والمعقد المناعي",
  canonicalTitle_fr: "Immunité humorale : sélection clonale des anticorps et complexe immun",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "دور البروتينات في الدفاع عن الذات",
  status: "APPROVED",
  scopeIn: [
    "الاستجابة المناعية النوعية ذات الوساطة الخلطية ومجال تدخلها (مستضدات حرة، سموم، بكتيريا في الأخلاط).",
    "اللمفاويات B (LB): منشؤها ونضجها في نخاع العظام ومستقبلاتها الغشائية (BCR: أضداد غشائية).",
    "الانتقاء النسيلي للمفاويات B بالتثبت النوعي للمستضد، ومراحل التكاثر والتمايز بتدخل الأنترلوكين (IL-2 / عوامل التحفيز).",
    "الخلايا البلازمية (Plasmocytes) وتميزها الهيولي (تطور الشبكة الهيولية المحببة وجهاز غولجي لإنتاج مكثف للأضداد).",
    "بنية الجسم المضاد (سلسلتان ثقيلتان H، سلسلتان خفيفتان L، مناطق متغيرة V تشكل موقعي التثبيت، ومنطقة ثابتة C تحدد الصنف والموقع المستجيب).",
    "المعقد المناعي (Complexe immun): تشكله، تأثيراته (إبطال المفعول، التراص، الترسيب) والتخلص منه بالبلعمة عبر مستقبلات Fc.",
  ],
  scopeOut: [
    "التبديل الصنفي للجلوبولينات المناعية (Isotype switching IgM -> IgG) بالتفاصيل الوراثية الدقيقة غير المقررة.",
    "دراسة تفاعلات المسار الكلاسيكي والبديل للمتمم (Système du complément C1-C9) بتفاصيلها البيوكيميائية المعقدة.",
  ],
  prerequisites: {
    hard: ["snv_self_nonself_hla_recognition"],
    soft: ["بنية الخلية الإفرازية والشبكة الإندوبلازمية وجهاز غولجي"],
    foundation: ["مفهوم مولد الضد والجسم المضاد والبلعمة"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_HUM_01",
      bloomLevel: "understand",
      description_ar: "يصف بنية الجسم المضاد مبرزاً التخصص الوظيفي لموقعي التثبيت وموقع التثبت على البالعات الكبيرة.",
    },
    {
      code: "LO_SNV_HUM_02",
      bloomLevel: "analyze",
      description_ar: "يحلل مراحل الاستجابة الخلطية ويفسر الانتقاء النسيلي للمفاويات B وتمايزها إلى خلايا بلازمية مفرزة وخلايا ذاكرة.",
    },
    {
      code: "LO_SNV_HUM_03",
      bloomLevel: "apply",
      description_ar: "يشرح آلية إبطال مفعول المستضد بتشكل المعقد المناعي ومراحل التخلص منه بظاهرة البلعمة المدعمة.",
    },
  ],
  coreConcepts_ar: [
    "الاستجابة المناعية الخلطية ترتكز على إفراز أجسام مضادة سارية في المصل نوعية لمولد الضد الذي حرض على إنتاجها.",
    "يمتلك كل جسم مضاد موقعين متماثلين لتثبيت محدد المستضد (Paratopes) يشكلان تكاملاً بنيوياً مع محددات المستضد (Epitopes).",
    "تشكل المعقد المناعي (جسم مضاد - مستضد) يبطل سمية المستضد ويمنع انتشاره وتثبته على الخلايا الهدف دون أن يخربه بذاته.",
    "يتم التخلص النهائي من المعقد المناعي بواسطة البالعات الكبيرة التي تمتلك مستقبلات نوعية للقطعة الثابتة (Fc) للجسم المضاد.",
  ],
  lessonPackage: {
    overview_ar: "تتصدى المناعة الخلطية للمستضدات الحرة في السوائل البيولوجية بإنتاج جزيئات دفاعية نوعية عالية الدقة هي الأجسام المضادة المصنعة من طرف الخلايا البلازمية.",
    biologicalMechanism_ar: [
      "1. التعرف والانتقاء النسيلي: يتعرف المستضد نوعياً على مستنسخة LB التي تحمل مستقبلات BCR متممة لمحدداته، مما ينشط نسيلتها.",
      "2. التكاثر والتمايز: تتلقى اللمفاويات B المنتقاة إشارات تنشيطية (IL-2 من اللمفاويات Th)، فتنقسم مشكلة لمة كبيرة، يتمايز جزء منها إلى خلايا ذاكرة (LBm) وجزء إلى خلايا بلازمية مفرزة.",
      "3. تشكل المعقد المناعي: تفرز الخلايا البلازمية آلاف الأجسام المضادة الحرة التي تنتشر في الأخلاط وترتبط نوعياً بمولد الضد مشكلة شبكات مناعية (معقدات مناعية).",
      "4. البلعمة: ترتبط المنطقة الثابتة للأجسام المضادة المشكلة للمعقد بمستقبلات غشائية نوعية على سطح البالعة الكبيرة، فتتحفز الإحاطة بالأرجل الكاذبة والبلعمة والهضم الأنزيمي.",
    ],
    evidenceAndObservation_ar: "حقن مصل حيوان محصن ضد كزاز لفأر سليم يمنحه حماية فورية مؤقتة ضد سم الكزاز، بينما حقن مصل حيوان غير محصن يؤدي لموت الفأر عند التسميم.",
    scientificReasoning_ar: "انتقال الحماية بواسطة المصل الخالي من الخلايا يثبت أن العوامل الدفاعية جزيئات بروتينية ذائبة في الأخلاط وهي الأجسام المضادة الموجهة نوعياً ضد سم الكزاز.",
    biologicalConclusion_ar: "المناعة الخلطية سلاح نوعي فعال يترصد السموم والجراثيم الحرة ويشلها عبر المعقدات المناعية تمهيداً لابتلاعها وهضمها التام.",
  },
  workedModel: {
    problem_ar: "تم حقن أرنبين بمستضدين مختلفين: الأرنب 1 حقن بألبومين مصل الثور (BSA)، والأرنب 2 حقن بذيفان الدفتيريا (Anatoxine). بعد أسبوعين استخلص مصل الأرنب 1 وأضيف إلى أنبوبين: الأنبوب (أ) يحتوي على BSA، والأنبوب (ب) يحتوي على ذيفان الدفتيريا. لوحظ تشكل راسب أبيض في الأنبوب (أ) فقط، بينما ظل الأنبوب (ب) شفافاً رائقاً. 1) فسر سبب تشكل الراسب في الأنبوب (أ) فقط. 2) ما اسم الظاهرة المشاهدة وما طبيعة الراسب المتشكل؟",
    documentData_ar: "مصل الأرنب 1 ضد BSA أحدث راسباً مع BSA فقط ولم يحدث راسباً مع ذيفان الدفتيريا.",
    observation_ar: "تشكل راسب نوعي فقط عند خلط مصل الأرنب 1 مع المستضد الذي حرض إنتاجه (BSA).",
    interpretation_ar: "يحتوي مصل الأرنب 1 على أجسام مضادة نوعية موجهة ضد محددات ألبومين الثور (Anti-BSA). عند التقائها مع BSA، يرتبط كل جسم مضاد بجزيئتين من المستضد عبر موقعي التثبيت، مما يشكل شبكة جزيئية ثلاثية الأبعاد غير قابلة للذوبان تترسب في قاع الأنبوب (تفاعل الترسيب). لم يتشكل راسب مع الدفتيريا لأن الأجسام المضادة تتميز بنوعية بنيوية صارمة تجاه محددات المستضد المحرض، فتعذر التكامل البنيوي والارتباط.",
    deduction_ar: "الظاهرة هي تفاعل الترسيب النوعي، والراسب المتشكل هو معقدات مناعية (أجسام مضادة - مستضد) تثبت مبدأ النوعية المطلقة للأجسام المضادة.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_hum_l1",
      capabilityId: "snv_humoral_immunity_antibody_complex",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "أي أجزاء جزيء الجسم المضاد مسؤول عن الارتباط النوعي بمحددات مولد الضد (Epitopes)؟",
      expectedResponse_ar: "المناطق المتغيرة (Fab / Paratopes) المشكلة من نهايات السلاسل الخفيفة والثقيلة معاً.",
      reasoningSteps_ar: [
        "استرجاع بنية الجسم المضاد ذات الشكل Y.",
        "المنطقة المتغيرة مسؤولة عن التثبيت والنوعية، والمنطقة الثابتة مسؤولة عن التثبت على البالعات والمتمم.",
      ],
      biologicalModel_ar: {
        system_ar: "جزيء الغلوبولين المناعي (IgG).",
        experimentalConditions_ar: "دراسة البنية البلورية ثلاثية الأبعاد للجسم المضاد.",
        governingBiologicalMechanisms_ar: ["التكامل الفراغي بين الباراتوب والإبيتوب."],
        evidenceExtracted_ar: "الموقع المتغير في ذراعي الـ Y.",
        deductionOrConclusion_ar: "الموقع المتغير يحدد نوعية المستضد.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اختيار المنطقة الثابتة (Fc) يعكس خلطاً خطيراً بين موقع تثبيت المستضد وموقع تثبت الجسم المضاد على غشاء البالعة الكبيرة.",
      },
      scoringRubric_ar: "درجة كاملة لاختيار المناطق المتغيرة (مواقع التثبيت).",
    },
    l2_application: {
      id: "snv_hum_l2",
      capabilityId: "snv_humoral_immunity_antibody_complex",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "تمتلك الخلية البلازمية (Plasmocyte) شبكة هيولية محببة نامية جداً وجهاز غولجي متطوراً وعدداً كبيراً من الميتوكوندريا مقارنة بالخلية اللمفاوية B الأصلية. علل هذه المميزات البنيوية بربطها بالتخصص الوظيفي للخلية البلازمية.",
      expectedResponse_ar: "التعليل: الخلية البلازمية خلية متمايزة ومخصصة بالكامل لإنتاج وإفراز كميات هائلة من الأجسام المضادة (وهي بروتينات إفرازية بمعدل آلاف الجزيئات في الثانية). الشبكة الهيولية المحببة النامية تؤمن الترجمة والتركيب المكثف للبروتينات الإفرازية، جهاز غولجي المتطور يؤمن نضج وتغليف وإفراز الأجسام المضادة في حويصلات إفرازية، والميتوكوندريا الكثيرة تؤمن إنتاج الطاقة الحيوية (ATP) اللازمة لتنشيط الأحماض وحركة الحويصلات والإطراح الخلوي.",
      reasoningSteps_ar: [
        "ربط العضية بوظيفتها: الشبكة المحببة (تركيب البروتين الإفرازي).",
        "جهاز غولجي (النضج والإفراز). الميتوكوندريا (توفير طاقة ATP).",
        "الاستنتاج: التوافق البنيوي التام مع وظيفة مصنع إنتاج الأجسام المضادة.",
      ],
      biologicalModel_ar: {
        system_ar: "خلية بلازمية نشطة تحت المجهر الإلكتروني.",
        experimentalConditions_ar: "مقارنة السيتولوجية البنيوية بين LB الساكنة والخلية البلازمية.",
        governingBiologicalMechanisms_ar: ["التمايز الخلوي والتعبير الجيني المكثف للبروتينات الإفرازية."],
        evidenceExtracted_ar: "تضخم الشبكة وجهاز غولجي والميتوكوندريا.",
        deductionOrConclusion_ar: "تخصص فائق في التصنيع البروتيني الدفاعي.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "ذكر الشبكة الهيولية دون ذكر جهاز غولجي والميتوكوندريا يعد نقصاً في الإحاطة بالدعامة البنيوية للإفراز الخلوي.",
      },
      scoringRubric_ar: "0.5 ن للشبكة وغولجي (تركيب وإفراز)، 0.5 ن للميتوكوندريا وتوفير الطاقة.",
    },
    l3_mixed: {
      id: "snv_hum_l3",
      capabilityId: "snv_humoral_immunity_antibody_complex",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة قياس تركيز الأجسام المضادة في مصل شخص حقن بنفس المستضد في زمنين متباعدين (الحقن الأولي عند الزاوية ز0، والحقن الثانوي عند ز30 يوماً). يظهر المنحنى في الاستجابة الأولية مرحلة كمون تدوم 7 أيام قبل ظهور الأضداد وتصل قمتها بعد 15 يوماً بتركيز منخفض؛ بينما في الاستجابة الثانوية تدوم مرحلة الكمون يومين فقط وتصل القمة إلى تركيز هائل يفوق الأولية بعشرة أضعاف. حلل المنحنى واستنتج الدعامة الخلوية المسؤولة عن خصائص الاستجابة الثانوية.",
      expectedResponse_ar: "التحليل: بعد الحقن الأول، نسجل استجابة أولية بطيئة (كمون 7 أيام) بإنتاج كميات ضئيلة من الأجسام المضادة تتناقص تدريجياً. أما بعد الحقن الثاني بنفس المستضد، نسجل استجابة ثانوية فورية وسريعة جداً (كمون أقل من يومين) بإنتاج كميات هائلة ومرتفعة جداً من الأجسام المضادة تستمر لفترة طويلة في المصل. الاستنتاج: الدعامة الخلوية المسؤولة عن سرعة وكثافة الاستجابة الثانوية هي تشكل خلايا الذاكرة اللمفاوية (LBm) أثناء الاستجابة الأولية؛ وهي خلايا طويلة العمر ذات حساسية عالية تتعرف فورياً على نفس المستضد وتتكاثر وتتمايز بسرعة قصوى دون الحاجة لمراحل الانتقاء الطويلة.",
      reasoningSteps_ar: [
        "مقارنة المؤشرات: زمن الكمون (7 أيام مقابل يومين)، سرعة الصعود، وتركيز الأضداد النهائي.",
        "الربط المنطقي: السرعة والوفرة تعني وجود خلايا مهيأة مسبقاً.",
        "الاستنتاج: دور خلايا الذاكرة B (LBm) في المناعة المكتسبة والتلقيح.",
      ],
      biologicalModel_ar: {
        system_ar: "الاستجابة المناعية الخلطية الأولية والثانوية (المصلية).",
        experimentalConditions_ar: "حقن أولي يليه حقن تذكيري للمستضد.",
        governingBiologicalMechanisms_ar: ["الذاكرة المناعية وسرعة تمايز خلايا LBm."],
        evidenceExtracted_ar: "قصر فترة الكمون وارتفاع تركيز الأضداد 10 أضعاف في الاستجابة الثانوية.",
        deductionOrConclusion_ar: "خلايا الذاكرة LBm تؤمن المناعة الدائمة والتمنيع باللقاحات.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الادعاء بأن الاستجابة الثانوية أسرع لأن المستضد صار أضعف خطأ فادح يقلب المنطق المناعي للذاكرة الخلوية.",
      },
      scoringRubric_ar: "0.5 ن لمقارنة زمن الكمون، 0.5 ن لمقارنة كمية ومدة الأضداد، 1.0 ن لاستنتاج دور خلايا الذاكرة LBm.",
    },
    l4_transfer: {
      id: "snv_hum_l4",
      capabilityId: "snv_humoral_immunity_antibody_complex",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "تمت معالجة بالعات كبيرة بمادة كيميائية تمنع ظهور المستقبلات الغشائية للقطعة الثابتة (Fc) للأجسام المضادة على غشائها، ثم وضعت هذه البالعات في وسطين: الوسط (أ) يحتوي على بكتيريا حرة فقط؛ والوسط (ب) يحتوي على معقدات مناعية مشكلة من نفس البكتيريا وأجسام مضادة نوعية. بينت النتائج أن نسبة بلعمة البكتيريا كانت ضعيفة جداً ومتماثلة في كلا الوسطين (أ) و (ب)، بينما في شروط طبيعية تكون بلعمة المعقدات في الوسط (ب) أسرع بـ 100 مرة. فسر هذه النتائج وماذا تستنتج حول دور الجسم المضاد في إقصاء المستضد؟",
      expectedResponse_ar: "التفسير: في الشروط الطبيعية، تبتلع البالعات الكبيرة الأجسام الغريبة الحرة ببلعمة غير نوعية بطيئة وغير مدعمة. أما في وجود الأجسام المضادة، فإن تشكل المعقد المناعي يبرز القطعة الثابتة (Fc) للأضداد نحو الخارج، فترتبط نوعياً بمستقبلات Fc المتواجدة على غشاء البالعة الكبيرة؛ هذا التثبت النوعي يحفز الأرجل الكاذبة فوراً ويسرع الإحاطة والبلعمة بما يعرف بـ 'البلعمة المدعمة' (Opsonisation). عند تثبيط ظهور مستقبلات Fc، تفقد البالعة قدرتها على التعرف المباشر على الأجسام المضادة للمعقد المناعي، فيلغى تأثير الدعم السريع، وتقتصر البالعة على البلعمة البطيئة العادية. الاستنتاج: الجسم المضاد لا يخرب المستضد بنفسه بل يبطل مفعوله ويقوم بـ 'وسمه وتسهيل ابتلاعه' عبر توجيهه نحو مستقبلات Fc للبالعات الكبيرة لتسريع إقصائه التام.",
      reasoningSteps_ar: [
        "استغلال دور مستقبلات Fc في تسريع البلعمة (البلعمة المدعمة).",
        "تفسير ثبات معدل البلعمة الضعيف عند حجب مستقبلات Fc.",
        "الاستنتاج: الأجسام المضادة وسائط تثبيط وتوجيه وتسهيل للبلعمة وليست أدوات هضم مباشر.",
      ],
      biologicalModel_ar: {
        system_ar: "التكامل الوظيفي بين الأجسام المضادة والخلايا البالعة الكبيرة.",
        experimentalConditions_ar: "تعديل مستقبلات الغشاء الخلوي Fc.",
        governingBiologicalMechanisms_ar: ["البلعمة المدعمة بالربط النوعي بين المنطقة Fc ومستقبلات البالعة."],
        evidenceExtracted_ar: "انخفاض سرعة بلعمة المعقدات إلى المستوى الضعيف العادي عند غياب مستقبلات Fc.",
        deductionOrConclusion_ar: "الأجسام المضادة جسور نوعية تسهل الالتهام الخلوي النهائي.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن الجسم المضاد يفرز إنزيمات تحلل البكتيريا بمفرده خطأ شائع؛ فالتحليل يتم حصراً داخل فجوة البلعمة للبالعة.",
      },
      scoringRubric_ar: "1 ن لتفسير دور مستقبلات Fc والبلعمة المدعمة، 1 ن للاستنتاج الدقيق حول دور الجسم المضاد كوسيط إبطال وتسهيل.",
    },
    l5_bac_style: {
      id: "snv_hum_l5",
      capabilityId: "snv_humoral_immunity_antibody_complex",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا (استدلال علمي مدعم بمخطط): للدغات العقارب خطورة قاتلة ناتجة عن ذيفان عقربي بروتيني سريع الانتشار في الدم يسبب شللاً عصبياً. لعلاج المصاب، يحقن فوراً بمصل مضاد للسم (Sérothérapie)، بينما للوقاية طويلة الأمد يستعمل اللقاح (Vaccination). 1) فسر كيف يؤدي المصل المحقون إلى إيقاف المفعول السام لذيفان العقرب في دقائق معدودة. 2) قارن بين العلاج بالمصل والعلاج باللقاح من حيث: مصدر الأجسام المضادة، سرعة الفعالية، ومدة الحماية. 3) مثل برسم تخطيطي وظيفي دقيق مراحل تشكل المعقد المناعي وبلعمته بواسطة البالعة الكبيرة موضحاً البيانات التالية: (ذيفان العقرب، جسم مضاد نوعي، موقع التثبيت، القطعة Fc، مستقبل Fc، أرجل كاذبة، فجوة بالعة، ليسوزومات، إطراح الفضلات).",
      expectedResponse_ar: [
        "1) آلية إيقاف المفعول السام بالمصل: يحتوي المصل العلاجي على تركيز عالٍ من الأجسام المضادة النوعية الجاهزة الموجهة ضد ذيفان العقرب. بمجرد حقنها في الدم، ترتبط الأجسام المضادة بمواقع تثبيتها المتغيرة نوعياً مع محددات السم، مشكلة معقدات مناعية مستقرة؛ هذا الارتباط يحجب المواقع الفعالة للسم ويمنعه بنيوياً من التثبت على مستقبلاته الغشائية في القنوات العصبية، مما يبطل مفعوله السام فورياً ويمنع حدوث الشلل.",
        "2) جدول المقارنة: - العلاج بالمصل (Sérothérapie): مصدر الأجسام المضادة خارجي (منقول من كائن آخر محصن)، الفعالية فورية ولحظية (خلال دقائق)، مدة الحماية مؤقتة وقصيرة (تزول بزوال واستهلاك الأضداد في بضعة أسابيع). - العلاج باللقاح (Vaccination): مصدر الأجسام المضادة داخلي ذاتي (تصنعها خلايا العضوية البلازمية بعد تحفيز بلقاح غير ضار)، الفعالية متأخرة وبطيئة (تتطلب أياماً إلى أسابيع لتشكل المستنسخات)، مدة الحماية طويلة وممتدة لسنوات بفضل تشكل خلايا الذاكرة اللمفاوية.",
        "3) الرسم التخطيطي الوظيفي: رسم منظم ومؤطر يوضح 4 مراحل متسلسلة بأسهم: أ) تشكل المعقد المناعي بارتباط الأجسام المضادة بذيفان العقرب. ب) تثبت المعقد عبر القطعة Fc على مستقبلات غشاء البالعة الكبيرة. ج) إحاطة المعقد بأرجل كاذبة وتشكل فجوة بلعمة تندمج معها الليزوزومات المحملة بالإنزيمات الهاضمة. د) هضم المستضد وتفكيكه وإطراح الفضلات عبر الإطراح الخلوي، مع وضع كامل البيانات الواردة في نص السؤال وعنوان: 'رسم تخطيطي وظيفي يوضح آلية تشكل المعقد المناعي والتخلص منه بالبلعمة المدعمة'.",
      ],
      reasoningSteps_ar: [
        "تفسير إبطال السمية بالمطابقة الفضائية وحجب المواقع الفعالة.",
        "المقارنة المنهجية بين المصلية واللقاحية (جاهز فوري مؤقت مقابل ذاتي بطيء دائم).",
        "تمثيل المراحل الأربع بالرسم التخطيطي الوظيفي الشامل.",
      ],
      biologicalModel_ar: {
        system_ar: "المعالجة المصلية للتسمم العقربي والمناعة الخلطية.",
        experimentalConditions_ar: "تدخل طبي علاجي إسعافي ومقارنة مع التلقيح الوقائي.",
        governingBiologicalMechanisms_ar: ["الارتباط النوعي، إبطال المفعول، والتخلص بالبلعمة المدعمة."],
        evidenceExtracted_ar: "حماية فورية بالمصل مقابل حماية دائمة باللقاح.",
        deductionOrConclusion_ar: "المصل علاج إسعافي واللقاح وقاية استراتيجية بالذاكرة.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اقتراح تلقيح المصاب بلدغة العقرب بدلاً من حقن المصل خطأ قاتل في التطبيق الطبي للمناعة، لأن اللقاح يتطلب أسبوعاً لإنتاج الأضداد بينما السم يقتل في ساعات.",
      },
      scoringRubric_ar: "1.5 ن لآلية إبطال السمية، 1.5 ن لجدول المقارنة الثلاثي، 2.0 ن للرسم التخطيطي الكامل والمفصل (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الاعتقاد بأن الجسم المضاد يقتل أو يحلل المستضد بنفسه، أو الخلط بين المصل (علاج فوري مؤقت) واللقاح (وقاية بطيئة دائمة).",
    wrongMentalModel_ar: "تخيل الجسم المضاد كإنزيم يمزق البكتيريا، أو اعتبار اللقاح والمصل مترادفين في السرعة والمفعول.",
    correctMentalModel_ar: "الجسم المضاد يبطل الفعالية ويشكل معقداً مناعياً يسهل ابتلاعه بواسطة البالعة الكبيرة (البلعمة المدعمة)؛ والمصل أضداد جاهزة فورية مؤقتة بينما اللقاح تحفيز لإنتاج ذاتي طويل الأمد بفضل خلايا الذاكرة.",
    threeStepActionProtocol_ar: [
      "1. في وظيفة الجسم المضاد: اكتب دائماً: 'إبطال مفعول ومنع انتشار وتسهيل البلعمة، ولا يخرب المستضد بمفرده'.",
      "2. في البلعمة: بين أن الارتباط يتم بين المنطقة الثابتة Fc للجسم المضاد والمستقبلات الغشائية للبالعة الكبيرة.",
      "3. في المقارنة: المصل = أضداد جاهزة، مفعول فوري، حماية مؤقتة. اللقاح = مستضد مضعف، مفعول بطيء، حماية دائمة بفضل خلايا الذاكرة.",
    ],
    microDrill_ar: {
      prompt_ar: "ما مصير المعقد المناعي بعد تشكله في المصل؟",
      solution_ar: "يتم التخلص منه بظاهرة البلعمة حيث ترتبط القطعة الثابتة Fc للجسم المضاد بمستقبلاتها على غشاء البالعة الكبيرة، فتحاط بأرجل كاذبة وتهضم بواسطة الإنزيمات الليزوزومية.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_hum_retest_01",
    invariantTested_ar: "تشكل المعقد المناعي مع سم التيتانوس (الكزاز) ومقارنة اللقاح والمصل.",
    changedSurface_ar: "تطبيق على حادث عمل بجرح ملوث بصدأ يحمل أبواغ بكتيريا الكزاز لشخص لم يجدد لقاحه منذ 15 سنة.",
    prompt_ar: "تعرض عامل بناء لجرح عميق بمسمار صدئ ملوث ببكتيريا الكزاز المفرزة لذيفان الكزاز القاتل. استقبله الطبيب وقرر فوراً حقنه بجرعة من المصل المضاد للكزاز في العضد الأيمن وجرعة من لقاح الكزاز (الأناتوكسين) في العضد الأيسر. علل الإجراء المزدوج الذي اتخذه الطبيب مبرراً سبب استخدام المصل واللقاح معاً في موقعين منفصلين.",
    solution_ar: "التعليل المناعي: 1) حقن المصل في العضد الأيمن يوفر حماية فورية عاجلة بأجسام مضادة نوعية جاهزة تحاصر ذيفان الكزاز وتبطل سميته في الدم فورياً لإنقاذ حياة العامل قبل وصول السم للأعصاب. 2) حقن اللقاح في العضد الأيسر يحفز الجهاز المناعي للعامل على استجابة مناعية ذاتية بطيئة لإنتاج أجسام مضادة خاصة به وتشكيل خلايا ذاكرة تضمن له حماية وقائية ممتدة لسنوات قادمة. 3) تم الحقن في موقعين منفصلين حتى لا تلتقي الأجسام المضادة الجاهزة للمصل مع لقاح الأناتوكسين في نفس الموضع فترتبط به وتشكل معقداً مناعياً يبطل اللقاح قبل أن يتاح له تحفيز اللمفاويات البائية للمريض.",
    passCondition_ar: "تبرير الدور الإسعافي الفوري للمصل والدور الوقائي المستقبلي للقاح وعلة الفصل المكاني للحقن.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: تشخيص المايلوما المتعددة (Myélome multiple) واضطراب إنتاج الأجسام المضادة",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "المايلوما المتعددة ورم خبيث يصيب نخاع العظام ناتج عن تكاثر سرطاني لنسيلة واحدة من الخلايا البلازمية. يمثل الشكل (1) الرحلان الكهربائي لبروتينات مصل شخص سليم وشخص مصاب حيث يظهر لدى المصاب ذروة حادة وضخمة في شريط الغاما-غلوبولينات (أجسام مضادة وحيدة النسيلة). يمثل الشكل (2) فحصاً مجهرياً لنخاع العظام يظهر اكتظاظاً كبيراً بخلايا بلازمية ضخمة غير طبيعية. 1) فسر ظهور الذروة الضخمة في منطقة الغاما-غلوبولين لدى المريض. 2) رغم الارتفاع الهائل لكمية الأجسام المضادة في دم المريض، فإنه يعاني من عجز مناعي وتكرار الإصابة بالعدوى البكتيرية. قدم تفسيراً علمياً مدعماً لهذا التناقض الظاهري.",
    modelSolution_ar: [
      "1) تفسير ظهور الذروة الضخمة: تنشأ المايلوما عن ورم سرطاني يصيب خلية بلازمية واحدة في نخاع العظام، فتتكاثر بشكل عشوائي غير خاضع للرقابة مشكلة لمة سرطانية هائلة (Clône tumoral) متماثلة وراثياً. تقوم جميع هذه الخلايا الورمية بإفراز نفس النوع والنمط الوحيد من الجسم المضاد المتطابق (Anticorps monoclonal) وبكميات قياسية تتدفق إلى المصل. في تقنية الرحلان الكهربائي، تهاجر هذه الأجسام المضادة المتطابقة بنفس السرعة والشحنة، فتتجمع كلها في نفس النطاق الكهربائي مشكلة ذروة ضيقة وحادة وشديدة الكثافة في منطقة الغاما-غلوبولينات.",
      "2) تفسير التناقض المناعي وتكرار العدوى: يعود هذا التناقض إلى مبدأ التنوع النوعي المناعي: فالكميات الهائلة من الأجسام المضادة لدى المريض هي كلها ناتجة عن نسيلة سرطانية واحدة، أي أنها موجهة نحو محدد مستضدي واحد وغير وظيفية في مقاومة الأمراض الأخرى. من جهة ثانية، يؤدي التكاثر السرطاني الكثيف للخلايا الورمية داخل نخاع العظام إلى مزاحمة و'خنق' الخلايا الجذعية المناعية الطبيعية وتثبيط المستنسخات الأخرى من اللمفاويات B الطبيعية، مما يمنع إنتاج الأجسام المضادة المتنوعة الضرورية للتصدي لمختلف أنواع البكتيريا والفيروسات المهاجمة، فيصبح المريض في حالة عجز مناعي حقيقي وعرضة مستمرة للعدوى الانتهازية المتكررة.",
    ],
    markingScheme_ar: [
      { criterion: "تفسير نشوء الذروة بالورم أحادي النسيلة والإنتاج المفرط لنوع وحيد من الأضداد", points: 2.5 },
      { criterion: "تفسير التناقض المناعي بفقدان التنوع وقمع الخلايا المناعية الطبيعية في النخاع", points: 2.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 106-125)",
    historicalBacRef: "BAC 2017 Sciences Expérimentales Sujet 2 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 7. snv_cellular_immunity_ltc_cytotoxicity
// ============================================================================

export const SNV_CELLULAR_IMMUNITY_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_cellular_immunity_ltc_cytotoxicity",
  canonicalTitle_ar: "المناعة الخلوية: الخلايا التائية السامة (LTC) والسمية الخلوية",
  canonicalTitle_fr: "Immunité cellulaire : lymphocytes T cytotoxiques (LTC) et cytotoxicité",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "دور البروتينات في الدفاع عن الذات",
  status: "APPROVED",
  scopeIn: [
    "مجال تدخل المناعة الخلوية (الخلايا المصابة بفيروسات، الخلايا السرطانية، وخلايا الطعوم الغريبة).",
    "اللمفاويات T8 (LT8): منشؤها في نخاع العظام ونضجها وانتقاؤها في الغدة السعترية والمستقبل الغشائي (TCR ومؤشر CD8).",
    "الانتقاء النسيلي للمفاويات LT8 بالتعرف المزدوج على معقد (CMH-I - ببتيد مستضدي).",
    "التكاثر والتمايز: دور الإنترلوكين (IL-2) المفرز من طرف Th في تمايز LT8 إلى خلايا سامة فاعلة (LTC) وخلايا ذاكرة (LT8m).",
    "آلية السمية الخلوية (Cytotoxicité): إفراز البيرفورين (Perforine) والجرانزيم (Granzyme)، تشكل الثقوب الغشائية، دخول الماء والصوديوم، وتحفيز الموت الخلوي المبرمج (Apoptose) والتحلل الخلوي.",
    "سلامة الخلية LTC وانفصالها لمهاجمة خلايا مصابة أخرى، وبلعمة الأشلاء الخلوية بالبالعات.",
  ],
  scopeOut: [
    "مسار الموت الخلوي عبر مستقبلات الموت Fas/FasL وتنشيط الكاسبازات بتفاصيلها الجزيئية المتقدمة.",
    "الاستجابة المناعية ضد الطفيليات متعددة الخلايا الكبيرة التابعة لعلم الطفيليات الطبية.",
  ],
  prerequisites: {
    hard: ["snv_self_nonself_hla_recognition"],
    soft: ["مفهوم الغشاء الخلوي والضغط الإسموزي والتوازن المائي الأيوني"],
    foundation: ["بنية الخلية اللمفاوية وتمايز الخلايا"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_CELL_01",
      bloomLevel: "understand",
      description_ar: "يشرح مفهوم التعرف المزدوج للمفاويات LTC عبر التكامل البنيوي لمستقبل TCR ومؤشر CD8 مع معقد (CMH-I - ببتيد مستضدي).",
    },
    {
      code: "LO_SNV_CELL_02",
      bloomLevel: "analyze",
      description_ar: "يصف بالتسلسل الزمني مراحل الصدمة السمية وإفراز حبيبات البيرفورين والجرانزيم وتفكك الخلية الهدف.",
    },
    {
      code: "LO_SNV_CELL_03",
      bloomLevel: "evaluate",
      description_ar: "يفسر تخصص وسلامة الخلية LTC أثناء مهاجمتها وتدميرها للخلايا السرطانية أو المصابة بالفيروسات.",
    },
  ],
  coreConcepts_ar: [
    "الاستجابة الخلوية تنفذها خلايا لمفاوية تائية سامة (LTC) متمايزة من لمفاويات LT8 منتقاة بتدخل IL-2 من اللمفاويات المساعدة Th.",
    "التعرف المزدوج شرط حتمي: يتعرف مستقبل TCR على الببتيد الغريب ومؤشر CD8 على جزيئة CMH-I للخلية الهدف في آن واحد.",
    "تفرز LTC في حيز التماس بروتين البيرفورين الذي يتبلمر في وجود شوارد Ca2+ مشكلاً قنوات وثقوباً تسمح بدخول الجرانزيم والماء.",
    "تتحلل الخلية الهدف بفعل الصدمة الحلولية والتفكيك الأنزيمي للمادة الوراثية (الموت الخلوي المبرمج)، بينما تظل الخلية LTC سالمة.",
  ],
  lessonPackage: {
    overview_ar: "عندما تنجح الفيروسات أو الطفرات السرطانية في التخفي داخل الخلايا، تتدخل المناعة الخلوية عبر اللمفاويات التائية السامة لاكتشاف وتدمير الخلايا المصابة بدقة جراحية.",
    biologicalMechanism_ar: [
      "1. التعرف المزدوج والالتصاق: تلتصق LTC بالخلية المصابة عبر ارتباط TCR و CD8 بالمعقد (CMH-I - ببتيد مستضدي) المشكل على غشائها.",
      "2. قطبية الإفراز: تهاجر الحبيبات السامة نحو منطقة التماس وتفرز محتوياتها بالإطراح الخلوي في الفجوة المجهرية الفاصلة.",
      "3. تشكل القنوات والتخريب: يتبلمر البيرفورين ليشكل ثقوباً أسطوانية في غشاء الخلية الهدف، يتدفق عبرها الماء وشوارد الصوديوم مؤدية لانتفاخ حلولي، ويدخل إنزيم الجرانزيم الذي ينشط إنزيمات التدمير الذاتي للـ ADN.",
      "4. التحلل والانفصال: تتمزق الخلية المصابة وتموت مبرمجاً، وتنفصل الخلية LTC سالمة لتبحث عن خلية هدف أخرى وتكرر العملية.",
    ],
    evidenceAndObservation_ar: "تجارب زرنكرناجل ودوهرتي (Zinkernagel & Doherty): وضع لمفاويات تائية مأخوذة من فأر (سلالة A) مصاب بفيروس LCM مع خلايا مستهدفة: تدمرت خلايا السلالة A المصابة بنفس الفيروس، بينما لم تدمر خلايا السلالة A السليمة، ولم تدمر خلايا السلالة B المصابة بنفس الفيروس.",
    scientificReasoning_ar: "عدم تدمير خلايا السلالة B المصابة رغم وجود الفيروس يثبت أن التعرف لا يتم على الفيروس وحده، بل يتطلب تطابق CMH-I للذات (السلالة A) مع الببتيد الفيروسي، وهو الإثبات القاطع لمبدأ التعرف المزدوج.",
    biologicalConclusion_ar: "المناعة الخلوية استجابة حاسمة لتطهير العضوية من البؤر الفيروسية والأورام عبر قتل الخلايا الذاتية المتمردة بفضل آلية السمية الخلوية المبرمجة.",
  },
  workedModel: {
    problem_ar: "وضعت خلايا LTC مستخلصة من فأر سليم محصن ضد فيروس (V) في ثلاثة أوساط تجريبية: الوسط 1: مع خلايا كبدية لنفس الفأر مصابة بالفيروس (V) في وجود شوارد الكالسيوم Ca2+. الوسط 2: مع نفس الخلايا الكبدية المصابة ولكن في وسط منزوع الكالسيوم كلياً بإضافة مركب EDTA. الوسط 3: مع خلايا كبدية لفأر من سلالة نسيجية مختلفة تماماً مصابة بنفس الفيروس (V) وفي وجود Ca2+. فسر النتائج الملاحظة بعد 4 ساعات في الأوساط الثلاثة.",
    documentData_ar: "الوسط 1: تحلل 95% من الخلايا الكبدية. الوسط 2: التصاق اللمفاويات بالخلايا المصابة دون حدوث أي تحلل (0%). الوسط 3: عدم حدوث أي التصاق أو تحلل (0%).",
    observation_ar: "حدث تحلل ممتاز في الوسط 1 بتوفر Ca2+ والقرابة النسيجية؛ بينما في الوسط 2 حدث التصاق دون تحلل؛ وفي الوسط 3 انعدم الالتصاق والتحلل كلياً.",
    interpretation_ar: "في الوسط 1: حدث التعرف المزدوج بين TCR للخلية LTC ومعقد (CMH-I - ببتيد V) لتوفر التوافق النسيجي، ثم أفرز البيرفورين وتبلمر في غشاء الخلية بفضل وجود شوارد Ca2+ مما أحدث الصدمة السمية والتحلل. في الوسط 2: حدث التعرف المزدوج والالتصاق الطبيعي، ولكن غياب شوارد الكالسيوم منع بلمرة جزيئات البيرفورين في الغشاء الهدف، فتوقفت السمية ولم تتحلل الخلايا. في الوسط 3: اختلاف جزيئات CMH-I للسلالة النسيجية الأخرى منع حدوث التعرف المزدوج من الأصل، فلم تتثبت LTC ولم تفرز محتوياتها السامة.",
    deduction_ar: "السمية الخلوية مشروطة بحدوث التعرف المزدوج المقيد بـ CMH-I الذاتي، وتتطلب حتماً توفر شوارد الكالسيوم لبلمرة البيرفورين وإحداث التحلل.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_cell_l1",
      capabilityId: "snv_cellular_immunity_ltc_cytotoxicity",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "ما هي الجزيئات الغشائية المسؤولة عن ظاهرة 'التعرف المزدوج' بين الخلية اللمفاوية LTC والخلية المصابة؟",
      expectedResponse_ar: "المستقبل التائي (TCR) ومؤشر CD8 على غشاء LTC يتعرفان معاً على معقد (CMH-I وببتيد مستضدي) على غشاء الخلية المصابة.",
      reasoningSteps_ar: [
        "استرجاع شروط تعرف اللمفاويات التائية السامة.",
        "التعرف المزدوج = التعرف على الببتيد الغريب والـ CMH-I الذاتي في آن واحد.",
      ],
      biologicalModel_ar: {
        system_ar: "مشبك مناعي بين LTC وخلية هدف.",
        experimentalConditions_ar: "تماس خلوي تحت المجهر الإلكتروني والمجهر المفلور.",
        governingBiologicalMechanisms_ar: ["التعرف المزدوج المقيد بالـ CMH الذاتي."],
        evidenceExtracted_ar: "TCR + CD8 يقابلان CMH-I + ببتيد مستضدي.",
        deductionOrConclusion_ar: "شرط الانطلاق الحصري للسمية الخلوية.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "القول بأن التعرف المزدوج يعني التعرف على بكتيريا وفيروس معاً يعكس عدم فهم المصطلح المناعي الأساسي للتعرف المزدوج.",
      },
      scoringRubric_ar: "درجة كاملة لذكر TCR و CD8 مع معقد CMH-I والببتيد.",
    },
    l2_application: {
      id: "snv_cell_l2",
      capabilityId: "snv_cellular_immunity_ltc_cytotoxicity",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "فسر لماذا لا تتأثر الخلية اللمفاوية السامة (LTC) بجزيئات البيرفورين التي تفرزها، وتظل سالمة بعد تفجير الخلية الهدف.",
      expectedResponse_ar: "التفسير: تفرز الخلية LTC حبيبات البيرفورين بإطراح قطبي موجه حصراً نحو الفجوة المجهرية المغلقة في منطقة التماس المباشر مع الخلية الهدف؛ كما يحتوي غشاء الخلية LTC على بروتينات وقائية خاصة (تسمى البروتيبيكتين Protectine) تمنع بلمرة البيرفورين على غشائها الذاتي، بالإضافة إلى غياب التوتر الغشائي الذي يسهل التثقيب، مما يصونها سالمة لتنفصل وتستأنف مهاجمة أهداف أخرى.",
      reasoningSteps_ar: [
        "الإفراز القطبي الموجه نحو منطقة التماس فقط.",
        "امتلاك غشاء LTC لبروتينات حماية ومقاومة لتثقيب البيرفورين.",
        "النتيجة: سلامة LTC المستمرة للمطاردة المناعية.",
      ],
      biologicalModel_ar: {
        system_ar: "الخلية اللمفاوية LTC بعد الصدمة السمية.",
        experimentalConditions_ar: "متابعة الخلية LTC حية بالمجهر الضوئي الحيوي.",
        governingBiologicalMechanisms_ar: ["الإفراز الموجه والحماية الذاتية من السموم الخلوية."],
        evidenceExtracted_ar: "موت الخلية الهدف وبقاء LTC سالمة تماماً.",
        deductionOrConclusion_ar: "الاستعمال المتكرر الفعال للمفاويات LTC.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "الاعتقاد بأن LTC تموت مع الخلية الهدف يغفل دورها الحيوي كخلية مقاتلة متكررة الهجوم.",
      },
      scoringRubric_ar: "0.5 ن لقطبية الإفراز نحو منطقة التماس، 0.5 ن للآليات الوقائية لغشاء LTC.",
    },
    l3_mixed: {
      id: "snv_cell_l3",
      capabilityId: "snv_cellular_immunity_ltc_cytotoxicity",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة قياس نسبة تحرير الكروم المشع (51Cr) من خلايا مستهدفة (دلالة على تمزق غشائها وتحللها) بعد حضنها مع لمفاويات LTC بنسب عددية مختلفة (LTC / خلايا هدف). يظهر المنحنى ارتفاعاً تدريجياً لنسبة تحرير 51Cr من 10% عند نسبة 1:1 إلى أن تبلغ 85% عند نسبة 20:1. أما عند إضافة مادة كيميائية تمنع عمل إنزيمات الغرانزيم، فإن نسبة تحرر 51Cr تنخفض إلى 30% فقط وتتأخر كثيراً. حلل النتائج واستنتج التكامل الوظيفي بين البيرفورين والجرانزيم في حدوث السمية الخلوية.",
      expectedResponse_ar: "التحليل: ترتفع نسبة تحلل الخلايا الهدف (تحرر 51Cr) طردياً مع زيادة النسبة العددية للمفاويات LTC المقاتلة حتى تبلغ ذروتها (85%) عند نسبة 20:1 دلالة على كفاءة التدمير الخلوي. عند تثبيط الجرانزيم، تتدنى نسبة التحلل بشدة وتقتصر على 30% فقط، مما يدل على أن التحلل بالثقوب الغشائية للبيرفورين وحدها غير كافٍ لإبادة الخلية بسرعة. الاستنتاج: هناك تكامل وظيفي حتمي بين المادتين: البيرفورين يشكل المعابر والقنوات الغشائية التي تسهل نفاذ الجرانزيم، والجرانزيم يدخل إلى الهيولى والنواة ليفعل التدمير الإنزيمي للمورثات ويحفز الموت الخلوي المبرمج، مما يضمن موتاً سريعاً ومؤكداً للخلية الهدف.",
      reasoningSteps_ar: [
        "قراءة تطور تحرر 51Cr بدلالة نسبة LTC.",
        "تحليل التراجع الحاد عند غياب الجرانزيم.",
        "الاستنتاج: البيرفورين يفتح الأبواب الغشائية والجرانزيم ينفذ الإعدام الأنزيمي المبرمج.",
      ],
      biologicalModel_ar: {
        system_ar: "القياس النظيري للسمية الخلوية بواسطة الكروم المشع 51Cr.",
        experimentalConditions_ar: "تثبيط إنزيمي نوعي للجرانزيم.",
        governingBiologicalMechanisms_ar: ["التعاون الجزيئي بين البيرفورين (تثقيب) والجرانزيم (تفكيك نووي)."],
        evidenceExtracted_ar: "انخفاض التحلل من 85% إلى 30% عند غياب الجرانزيم.",
        deductionOrConclusion_ar: "التكامل الحتمي لتحقيق أقصى كفاءة سمية.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "استنتاج أن الجرانزيم لا دور له بناء على بقاء 30% تحلل يناقض الانخفاض الهائل بنسبة 55% في الفعالية.",
      },
      scoringRubric_ar: "0.5 ن لتحليل علاقة التحرر بزيادة LTC، 0.5 ن لتحليل أثر غياب الجرانزيم، 1.0 ن لاستنتاج التكامل الوظيفي.",
    },
    l4_transfer: {
      id: "snv_cell_l4",
      capabilityId: "snv_cellular_immunity_ltc_cytotoxicity",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "الخلايا السرطانية في بعض أورام الميلانوما الجلدية تطور طفرة تؤدي إلى غياب بروتين البيتا-2-ميكروغلوبولين (β2m)، مما يمنع جزيئات CMH-I من الهجرة والاستقرار على الغشاء الهيولي للخلية الورمية. فسر كيف تمكن هذه الطفرة الورم من التكاثر والانتشار الخبيث دون أن تدمره الخلايا التائية السامة LTC المتواجدة بكثرة في بيئة الورم.",
      expectedResponse_ar: "التفسير: يتكون جزيء CMH-I وظيفياً من اتحاد السلسلة الثقيلة ألفا مع سلسلة بيتا-2-ميكروغلوبولين (β2m)؛ في غياب β2m، يفشل جزيء CMH-I في الانطواء الصحيح وفي تثبيت الببتيد المستضدي السرطاني في تجويفه، ويتعذر انتقاله عبر جهاز غولجي إلى الغشاء الهيولي. تصبح الخلايا السرطانية مجردة كلياً من CMH-I السطحي. وبما أن الخلايا اللمفاوية السامة LTC مقيدة بالتعرف المزدوج وتتطلب إلزامياً وجود CMH-I للارتباط عبر مؤشر CD8 ومستقبل TCR، فإنها تعجز تماماً عن التعرف على هذه الخلايا الورمية وتعتبرها 'غير مرئية'، مما يسمح للورم بالإفلات من الرقابة المناعية والتكاثر العشوائي وتشكيل نقائل خبيثة.",
      reasoningSteps_ar: [
        "ربط غياب β2m بفشل ظهور CMH-I على سطح الخلية الورمية.",
        "ربط غياب CMH-I باستحالة حدوث التعرف المزدوج لمفاويات LTC.",
        "الاستنتاج: الإفلات المناعي التام والتكاثر الورمي الحر.",
      ],
      biologicalModel_ar: {
        system_ar: "خلايا الورم القتامي (Mélanome) واستراتيجيات التخفي المناعي.",
        experimentalConditions_ar: "طفرة جينية في بروتين تثبيت معقد التوافق النسيجي.",
        governingBiologicalMechanisms_ar: ["الاشتراط الحتمي لـ CMH-I لتفعيل اللمفاويات التائية السامة."],
        evidenceExtracted_ar: "غياب β2m -> غياب CMH-I -> عجز LTC عن التدخل.",
        deductionOrConclusion_ar: "فقدان معقد العرض يمنح الورم حصانة من الاستجابة الخلوية.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن غياب β2m يقتل الخلية السرطانية يقلب المعنى البيولوجي للطفرة التي تمنحها ميزة البقاء والهروب.",
      },
      scoringRubric_ar: "1 ن لتفسير دور β2m في ظهور CMH-I، 1 ن لتفسير عجز LTC عن التعرف المزدوج والإفلات المناعي.",
    },
    l5_bac_style: {
      id: "snv_cell_l5",
      capabilityId: "snv_cellular_immunity_ltc_cytotoxicity",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا (مهمة مركبة): لتحديد شروط الاستجابة المناعية الخلوية، أجريت التجارب التاريخية لزرنكرناجل ودوهرتي الموضحة في الجدول التالي، حيث تم استخلاص خلايا طحالية (لمفاويات T) من فئران محصنة ضد فيروس LCM وحضنت مع خلايا عصبية في أوساط مختلفة: الوسط 1: لمفاويات من فأر سلالة A + خلايا عصبية لسلالة A مصابة بفيروس LCM -> النتيجة: تحلل الخلايا العصبية بنسبة 90%. الوسط 2: لمفاويات من فأر سلالة A + خلايا عصبية لسلالة A سليمة -> النتيجة: عدم التحلل (0%). الوسط 3: لمفاويات من فأر سلالة A + خلايا عصبية لسلالة B مصابة بفيروس LCM -> النتيجة: عدم التحلل (0%). الوسط 4: لمفاويات من فأر سلالة A + خلايا عصبية لسلالة A مصابة بفيروس آخر (فيروس الجدري) -> النتيجة: عدم التحلل (0%). 1) حلل نتائج الأوساط الأربعة تحليلاً مقارناً. 2) ما هي المعلومة الأساسية المستخلصة من مقارنة الوسط 1 بالوسطين 2 و 4؟ 3) ما هي المعلومة الأساسية المستخلصة من مقارنة الوسط 1 بالوسط 3؟ 4) استنتج المفهوم المناعي الشامل لعمل اللمفاويات التائية المقاتلة ودعمه برسم تخطيطي وظيفي لمرحلة التعرف المزدوج.",
      expectedResponse_ar: [
        "1) التحليل المقارن: نلاحظ حدوث تحلل خلوي كثيف (90%) حصراً في الوسط 1 حيث تجمعت اللمفاويات التائية مع خلايا من نفس السلالة النسيجية A ومصابة بنفس الفيروس LCM. في المقابل، انعدم التحلل كلياً (0%) في الحالات التالية: إذا كانت الخلايا من نفس السلالة ولكنها سليمة (الوسط 2)، أو إذا كانت مصابة بنفس الفيروس ولكنها من سلالة مختلفة B (الوسط 3)، أو إذا كانت من نفس السلالة ولكنها مصابة بفيروس مختلف (الوسط 4).",
        "2) المعلومة المستخلصة من (1 مقابل 2 و 4): اللمفاويات التائية السامة نوعية بدقة للمستضد الفيروسي المحرض؛ فهي لا تهاجم الخلايا السليمة، ولا تهاجم الخلايا المصابة بفيروس آخر مختلف، مما يثبت شرط وجود 'الببتيد المستضدي النوعي'.",
        "3) المعلومة المستخلصة من (1 مقابل 3): اللمفاويات التائية مقيدة بجزيئات معقد التوافق النسيجي (CMH-I) للذات؛ فرغم أن خلايا السلالة B مصابة بنفس الفيروس LCM تماماً، إلا أن اللمفاويات عجزت عن تدميرها لاختلاف جزيئات CMH-I، مما يثبت شرط 'تطابق CMH الذات'.",
        "4) الاستنتاج الشامل والرسم التخطيطي: المفهوم المناعي هو 'التعرف المزدوج المشروط' (Double reconnaissance): الخلايا اللمفاوية LTC لا تتعرف على المستضد الحر بمفرده، ولا تتعرف على CMH بمفرده، بل تتعرف نوعياً في آن واحد على المعقد المتكامل (CMH-I الذاتي + ببتيد مستضدي لاذاتي) عبر التكامل البنيوي المزدوج لمستقبلاتها TCR ومؤشر CD8. الرسم التخطيطي يوضح: غشاء الخلية LTC يحمل TCR و CD8، يلامس غشاء الخلية المصابة الذي يحمل جزيء CMH-I وفي تجويفه ببتيد فيروسي، مع أسهم توضح التكامل المزدوج الدقيق وعنوان: 'رسم تخطيطي وظيفي لآلية التعرف المزدوج بين LTC وخلية هدف'.",
      ],
      reasoningSteps_ar: [
        "التحليل المقارن المنهجي للأوساط الأربعة.",
        "استخلاص شرط نوعية الببتيد الفيروسي من (1 ضد 2 و 4).",
        "استخلاص شرط تطابق CMH الذاتي من (1 ضد 3).",
        "تركيب مفهوم التعرف المزدوج وتجسيده برسم تخطيطي وظيفي مؤطر.",
      ],
      biologicalModel_ar: {
        system_ar: "تجارب زرنكرناجل ودوهرتي التاريخية في علم المناعة (نوبل 1996).",
        experimentalConditions_ar: "اختبار قيود التوافق النسيجي ونوعية المستضد.",
        governingBiologicalMechanisms_ar: ["التعرف المزدوج المقيد بالـ CMH-I الذاتي."],
        evidenceExtracted_ar: "التحلل مشروط بتطابق السلالة ونوع الفيروس معاً.",
        deductionOrConclusion_ar: "الأساس الجزيئي للاستجابة المناعية الخلوية.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "دمج الأسئلة وسرد استنتاج عام دون الإجابة التفصيلية على دلالة كل مقارنة يفقد الطالب درجات الاستدلال المنهجي للبكالوريا.",
      },
      scoringRubric_ar: "1.0 ن للتحليل المقارن، 1.0 ن للمعلومة الأولى، 1.0 ن للمعلومة الثانية، 2.0 ن للاستنتاج والرسم الوظيفي الدقيق (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الاعتقاد بأن LTC تهاجم البكتيريا الحرة في الدم، أو إغفال شرط تطابق CMH-I في التعرف المزدوج.",
    wrongMentalModel_ar: "الاعتقاد بأن LTC تبلع الخلايا كالبالعة، أو أنها تتعرف على الفيروسات العائمة في المصل.",
    correctMentalModel_ar: "LTC لا تتدخل إطلاقاً ضد المستضدات الحرة؛ هي متخصصة حصراً في تدمير الخلايا المصابة والسرطانية بالتعرف المزدوج على (CMH-I + ببتيد)، وتقتلها بالتثقيب بالبيرفورين والجرانزيم دون ابتلاع.",
    threeStepActionProtocol_ar: [
      "1. حدد موقع المستضد: إذا كان حراً في الأخلاط -> استجابة خلطية (أجسام مضادة)؛ إذا كان داخل خلية ذاتية -> استجابة خلوية (LTC).",
      "2. في التعرف: اذكر دائماً 'التعرف المزدوج على معقد CMH-I وببتيد مستضدي بواسطة TCR و CD8'.",
      "3. في آلية القتل: اذكر 'إفراز البيرفورين والجرانزيم، تشكل الثقوب، تدفق الماء، الصدمة الحلولية، والموت الخلوي المبرمج'.",
    ],
    microDrill_ar: {
      prompt_ar: "لماذا لا تهاجم اللمفاويات LTC الفيروسات الحرة السابحة في الدم؟",
      solution_ar: "لأن مستقبلات TCR للخلية LTC عاجزة عن الارتباط بالمستضدات الحرة، وتتطلب حصراً أن يعرض الببتيد المستضدي محمولاً داخل تجويف جزيء CMH-I على سطح غشاء خلوي.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_cell_retest_01",
    invariantTested_ar: "التعرف المزدوج للـ LTC وتدمير الخلايا السرطانية الذاتية.",
    changedSurface_ar: "تطبيق على العلاج المناعي بالخلايا التائية CAR-T المعاد برمجتها وراثياً ضد اللوكيميا.",
    prompt_ar: "تقنية CAR-T cells هي علاج مناعي حديث يتم فيه تعديل اللمفاويات التائية وراثياً لتزويدها بمستقبل صنعي هجين (CAR) قادر على الارتباط المباشر ببروتين ورمي سطحي (CD19) على خلايا اللوكيميا السرطانية دون الحاجة لجزيئات CMH-I. فسر كيف تتغلب هذه التقنية على مشكلة إفلات الخلايا السرطانية التي فقدت جزيئات CMH-I من قبضة المناعة الطبيعية.",
    solution_ar: "التفسير: الخلايا التائية الطبيعية مقيدة بالتعرف المزدوج الإلزامي وتعتمد على وجود CMH-I للارتباط؛ لذا إذا خفضت الخلية السرطانية كثافة CMH-I فإنها تفلت من القتل. في المقابل، يمتلك المستقبل الصنعي الهجين (CAR) موقع تثبيت يشبه الجسم المضاد يتعرف مباشرة وبشكل مستقل على البروتين السطحي CD19 للخلية السرطانية دون أي اشتراط لوجود CMH-I؛ هذا الارتباط المباشر يفعل الإفراز القطبي لحبيبات البيرفورين والجرانزيم، مما يتيح إبادة وتدمير الخلايا السرطانية حتى لو كانت مجردة تماماً من CMH-I.",
    passCondition_ar: "إدراك الاستغناء عن شرط CMH-I بواسطة المستقبل الهجين لتحقيق السمية المباشرة.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: آلية دفاع الجسم ضد الورم الحليمي وعواقب العوز المناعي",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "فيروس الورم الحليمي البشري (HPV) يصيب الخلايا الظهارية لعنق الرحم ويدمج جيناته مسرطناً إياها لتنتج بروتينات شاذة مسرطنة (E6 و E7). لدى الأشخاص ذوي المناعة السليمة، يتم القضاء التلقائي على الخلايا المتحولة بنسبة 90%، بينما لدى المصابين بنقص المناعة يتطور المرض إلى سرطان غازٍ. 1) فسر الآلية المناعية الخلوية التي تقضي بها العضوية السليمة على الخلايا المسرطنة بواسطة HPV. 2) ما نوع الاستجابة المناعية المسؤولة عن ذلك؟ برر اختيارك بنوع المستضد والخلايا المنفذة. 3) فسر لماذا يؤدي تثبيط المناعة لدى مريض زرع أعضاء إلى ارتفاع خطر الإصابة بهذا السرطان.",
    modelSolution_ar: [
      "1) الآلية المناعية الخلوية: تقوم الخلايا المصابة بـ HPV بتفكيك جزء من البروتينات الشاذة المسرطنة (E6 و E7) في البروتيازوم وعرض الببتيدات الناتجة في تجويف جزيئات CMH-I على سطح غشائها. تتعرف اللمفاويات التائية LT8 نوعياً على هذا المعقد بالتعرف المزدوج (TCR + CD8)، وبتحفيز من إنترلوكين 2 (IL-2) المفرز من الخلايا Th، تتكاثر وتتمايز إلى لمفاويات سامة فاعلة (LTC). ترتبط LTC بالخلية المتحولة بالتعرف المزدوج وتفرز حبيبات البيرفورين والجرانزيم، مما يؤدي إلى تثقيب غشائها وإحداث صدمة حلولية وتنشيط الموت الخلوي المبرمج، فتباد الخلايا المسرطنة وتطهر المنطقة.",
      "2) نوع الاستجابة والتبرير: استجابة مناعية نوعية ذات وساطة خلوية. التبرير: لأن المستضد ذو منشأ داخلي يتواجد داخل الخلايا الذاتية المتحولة (فيروسي/ورمي)، ولأن الخلايا المنفذة والمخربة هي خلايا لمفاوية تائية سامة (LTC) تتدخل بالتماس الخلوي المباشر وليس بأجسام مضادة ذائبة.",
      "3) تفسير أثر تثبيط المناعة: الأدوية المثبطة للمناعة (المعطاة لمرضى زرع الأعضاء لمنع رفض الطعم) تعمل على تثبيط تكاثر وتمايز اللمفاويات التائية ومنع إفراز IL-2؛ يؤدي هذا العجز في أعداد ونشاط اللمفاويات التائية المساعدة (Th) والسامة (LTC) إلى تعطيل منظومة المراقبة المناعية الخلوية، فتفلت الخلايا الظهارية المتحولة بـ HPV من التدمير وتتكاثر بحرية وتتراكم فيها الطفرات لتتحول إلى ورم سرطاني خبيث غازٍ للأنسجة المجاورة.",
    ],
    markingScheme_ar: [
      { criterion: "تفسير الآلية الخلوية الكاملة (عرض CMH-I، تعرف مزدوج، تنشيط بـ IL-2، سمية بالبيرفورين)", points: 2.5 },
      { criterion: "تحديد وتعليل نوع الاستجابة ذات الوساطة الخلوية", points: 1.0 },
      { criterion: "تفسير أثر التثبيط المناعي على تعطيل المراقبة وتطور الورم", points: 1.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 126-145)",
    historicalBacRef: "BAC 2016 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 8. snv_immune_cooperation_interleukin_hiv
// ============================================================================

export const SNV_IMMUNE_COOPERATION_HIV_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_immune_cooperation_interleukin_hiv",
  canonicalTitle_ar: "التعاون المناعي: دور الإنترلوكينات وفيروس السيدا (VIH)",
  canonicalTitle_fr: "Coopération immunitaire : rôle des interleukines et virus du VIH",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "دور البروتينات في الدفاع عن الذات",
  status: "APPROVED",
  scopeIn: [
    "مفهوم التعاون المناعي الخلوي بين البالعات الكبيرة (CPA) واللمفاويات التائية والبائية.",
    "اللمفاويات T4 (LT4): منشؤها ونضجها والمستقبل الغشائي (TCR ومؤشر CD4)، والتعرف المزدوج على معقد (CMH-II - ببتيد مستضدي) للبالعة.",
    "التنشيط المتبادل: إفراز الأنترلوكين-1 (IL-1) من CPA، وإفراز الأنترلوكين-2 (IL-2) من LT4 المنشطة وتأثيره المحفز الذاتي والرجعي.",
    "تمايز LT4 إلى خلايا تائية مساعدة (Th / LTh) كقائد أوركسترا الاستجابة المناعية بشقيها الخلطي والخلوي.",
    "فيروس فقدان المناعة المكتسبة (VIH): بنيته (غلاف دهني، البروتين السكري gp120، الأنزيمات: النسخ العكسي، الإدماج، ومادته الوراثية ARN).",
    "دورة تكاثر الفيروس واستهدافه النوعي للخلايا الحاملة لمستقبل CD4 (خاصة LT4 والبالعات).",
    "مراحل الإصابة بالسيدا (العدوى الأولية، مرحلة الترقب والكمون غير العرضي، ومرحلة السيدا المعلن بانهيار عدد LT4 وظهور الأمراض الانتهازية).",
  ],
  scopeOut: [
    "بروتوكولات الأدوية المضادة للفيروسات القهقرية الثلاثية (Trithérapie) بأسماء الجزيئات الكيميائية الصيدلانية الدقيقة.",
    "الطفرات في المستقبلات المساعدة CCR5 و CXCR4 بتفاصيلها الجزيئية المتقدمة.",
  ],
  prerequisites: {
    hard: ["snv_humoral_immunity_antibody_complex", "snv_cellular_immunity_ltc_cytotoxicity"],
    soft: ["مفهوم الفيروسات والنسخ العكسي والتكاثر داخل الخلايا المضيفة"],
    foundation: ["أنواع الخلايا المناعية ووظائفها الأساسية"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_COOP_01",
      bloomLevel: "analyze",
      description_ar: "يحلل تجارب التعاون الخلوي (تجارب كلاصون وموسيي وماربروك) ويثبت ضرورة اللمفاويات Th لتنشيط وتكاثر LB و LT8.",
    },
    {
      code: "LO_SNV_COOP_02",
      bloomLevel: "understand",
      description_ar: "يصف دور الإنترلوكينات (IL-1 و IL-2) كرسائل كيميائية وسيطة بين الخلايا المناعية تؤمن تمايزها الوظيفي.",
    },
    {
      code: "LO_SNV_COOP_03",
      bloomLevel: "evaluate",
      description_ar: "يفسر جزيئياً وسريرياً انهيار الاستجابة المناعية الخلطية والخلوية معاً عند استهداف فيروس السيدا للمفاويات LT4.",
    },
  ],
  coreConcepts_ar: [
    "التعاون المناعي ظاهرة حيوية تتطلب تظافر البالعات العارضة (CPA) مع الخلايا المساعدة Th لتحفيز الخلايا المنفذة LB و LT8.",
    "اللمفاويات التائية المساعدة (Th) هي المحرك الأساسي للاستجابة المناعية النوعية بإفرازها وسائط كيميائية منشطة هي الإنترلوكينات (IL-2).",
    "فيروس VIH يتطفل نوعياً على الخلايا الحاملة لمستقبلات CD4 (أهمها LT4) بفضل التكامل البنيوي للبروتين السكري gp120.",
    "تدمير اللمفاويات LT4 وانخفاضها دون 200 خلية/ملم³ يشل التعاون المناعي ويعطل الاستجابتين الخلطية والخلوية معاً، مسبباً متلازمة السيدا.",
  ],
  lessonPackage: {
    overview_ar: "تتكامل مكونات الجهاز المناعي في شبكة تواصل كيميائي متقنة تقودها الخلايا التائية المساعدة Th عبر الإنترلوكينات؛ وعندما يضرب فيروس السيدا هذا المركز العصبي تنهار الدفاعات كلياً.",
    biologicalMechanism_ar: [
      "1. العرض والتنشيط: تبتلع البالعة الكبيرة المستضد وتعرض ببتيداته على CMH-II؛ تتعرف عليها LT4 بالتعرف المزدوج (TCR + CD4) وتفرز البالعة IL-1 لتنشيطها.",
      "2. التحفيز الذاتي والتمايز: تفرز LT4 المنشطة إنترلوكين 2 (IL-2) وتركب مستقبلاته الغشائية، فتحفز نفسها ذاتياً لتتكاثر وتتمايز إلى خلايا مساعدة مفرزة Th وخلايا ذاكرة LT4m.",
      "3. قيادة الاستجابة: تفرز خلايا Th وسائط IL-2 التي ترتبط بمستقبلات نوعية ظهرت على اللمفاويات LB و LT8 المنتقاة بمولد الضد، مما يحفز انقسامها وتمايزها إلى خلايا بلازمية مفرزة للأضداد وخلايا LTC سامة.",
      "4. استهداف فيروس VIH: يتثبت الفيروس ببروتينه gp120 على مستقبل CD4 للمفاويات LT4، يدمج غلافه ويدخل كبسيدته، ينسخ ARN إلى ADN بواسطة إنزيم النسخ العكسي، يدمجه في نواة الخلية بواسطة إنزيم الإدماج، ثم يستغل جهاز الخلية لإنتاج جزيئات فيروسية جديدة تتبرعم وتفجر الخلية المضيفة.",
    ],
    evidenceAndObservation_ar: "تجربة ماربروك (غرفة ذات وسطين مفصولين بغشاء نافذ للجزيئات وغير نافذ للخلايا): وضعت اللمفاويات B في الحجرة السفلية واللمفاويات Th في العلوية في وجود المستضد، فتمايزت LB وأفرزت كميات هائلة من الأجسام المضادة.",
    scientificReasoning_ar: "إنتاج الأجسام المضادة رغم انفصال الخلايا بغشاء عازل يثبت أن التأثير المنشط للمفاويات Th لا يتطلب تماساً مباشراً بل يتم عبر جزيئات بروتينية كيميائية ذائبة قابلة للانتشار وهي الإنترلوكينات.",
    biologicalConclusion_ar: "اللمفاويات Th هي الركيزة المحورية للاستجابة المناعية، واستهدافها من قبل فيروس السيدا يقطع شريان الاتصال الكيميائي ويؤدي إلى انهيار الدفاع المناعي بالكامل.",
  },
  workedModel: {
    problem_ar: "تم تتبع ثلاثة مؤشرات حيوية لدى شخص مصاب بفيروس السيدا (VIH) على مدار 10 سنوات: عدد اللمفاويات T4، كمية شحنة الفيروس (ARN-VIH في البلازما)، وتركيز الأجسام المضادة المصلية ضد الفيروس (Anti-VIH). في السنوات الخمس الأولى (مرحلة الكمون): ظل عدد T4 مستقراً نسبياً (>500 خلية/ملم³)، الشحنة الفيروسية منخفضة، والأجسام المضادة مرتفعة. بعد السنة الثامنة (مرحلة السيدا المعلن): انهار عدد T4 إلى أقل من 150 خلية/ملم³، انخفضت كمية الأجسام المضادة بشدة، وارتفعت الشحنة الفيروسية انفجارياً مع ظهور أورام خبيثة والتهابات رئوية انتهازية أدت للوفاة. 1) فسر العلاقة بين انهيار عدد T4 وتدهور تركيز الأجسام المضادة والشحنة الفيروسية. 2) استنتج سبب تسمية المرض بـ 'متلازمة فقدان المناعة المكتسبة'.",
    documentData_ar: "تتبع لـ 10 سنوات: انهيار T4 دون 150 يتزامن مع انهيار الأجسام المضادة وتفجر الشحنة الفيروسية وظهور الأمراض الانتهازية.",
    observation_ar: "بقاء T4 مرتفعاً يحفظ الأجسام المضادة ويحاصر الفيروس؛ وانهيار T4 يؤدي لانهيار الأجسام المضادة وتفلت الفيروس التام.",
    interpretation_ar: "اللمفاويات T4 هي المصدر الوحيد للخلايا التائية المساعدة (Th) التي تفرز الإنترلوكين 2 (IL-2) الضروري لتحفيز تكاثر وتمايز اللمفاويات B إلى خلايا بلازمية مفرزة للأجسام المضادة ولتحفيز تمايز LT8 إلى LTC. عندما يدمر فيروس السيدا معظم خلايا LT4 وينزل تعدادها دون العتبة الحرجة (200 خلية/ملم³)، ينعدم إفراز IL-2، فيتعطل تمايز الخلايا البلازمية وتتوقف الاستجابة الخلطية (انخفاض الأضداد)، وتتعطل الاستجابة الخلوية (عجز LTC)، مما يحرر الفيروس من كل رقابة مناعية ويتكاثر بانفجار ويجعل العضوية عاجزة عن مقاومة أبسط الجراثيم الانتهازية.",
    deduction_ar: "سمي المرض بـ 'فقدان المناعة المكتسبة' لأن الخلل ليس وراثياً بل مكتسب ناتج عن تدمير فيروسي نوعي لخلايا التنسيق والتنشيط المناعي التكيفي (LT4/Th).",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_coop_l1",
      capabilityId: "snv_immune_cooperation_interleukin_hiv",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "ما هو المستقبل الغشائي النوعي الرئيسي الذي يستهدفه البروتين السكري السطحي gp120 لفيروس السيدا (VIH) للنفاذ إلى الخلية المضيفة؟",
      expectedResponse_ar: "المستقبل الغشائي CD4 المتواجد أساساً على سطح اللمفاويات التائية المساعدة (LT4) والبالعات الكبيرة.",
      reasoningSteps_ar: [
        "استرجاع الآلية الجزيئية لعدوى فيروس السيدا.",
        "التكامل البنيوي الدقيق بين بروتين الفيروس السكري gp120 والمستقبل الخلوي CD4.",
      ],
      biologicalModel_ar: {
        system_ar: "تثبت فيروس VIH على الخلية الهدف المضيفة.",
        experimentalConditions_ar: "دراسة مجهرية كيميائية حيوية للمستقبلات الغشائية.",
        governingBiologicalMechanisms_ar: ["التكامل البنيوي عالي الألفة بين بروتين الفيروس السطحي والمستقبل الخلوي."],
        evidenceExtracted_ar: "gp120 يرتبط نوعياً بمستقبل CD4.",
        deductionOrConclusion_ar: "الاستهداف الانتقائي للمفاويات T4 والخلايا العارضة.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "اختيار مؤشر CD8 أو BCR خطأ شائع ناتج عن الخلط بين أصناف اللمفاويات التائية والبائية.",
      },
      scoringRubric_ar: "درجة كاملة لاختيار مستقبل CD4.",
    },
    l2_application: {
      id: "snv_coop_l2",
      capabilityId: "snv_immune_cooperation_interleukin_hiv",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "بين الدور المزدوج للإنترلوكين 2 (IL-2) في تنشيط الخلية اللمفاوية LT4 ذاتها وتنشيط الخلايا اللمفاوية الأخرى في الاستجابة المناعية.",
      expectedResponse_ar: "الدور المزدوج للإنترلوكين 2: 1) تأثير ذاتي (Autocrine): تفرز الخلية LT4 المنشطة مركب IL-2 وتظهر في نفس الوقت مستقبلات نوعية له (IL-2R) على غشائها، فيرتبط بها ذاتياً محفزاً نسيلتها على التكاثر السريع والتمايز إلى خلايا Th وخلايا ذاكرة. 2) تأثير غيري (Paracrine): ينتشر IL-2 في الوسط المحيط ويرتبط بمستقبلات IL-2R التي ظهرت على اللمفاويات LB واللمفاويات LT8 المنتقاة بواسطة المستضد، فيحفزها على التكاثر والتمايز إلى خلايا بلازمية مفرزة للأضداد وخلايا سامة LTC.",
      reasoningSteps_ar: [
        "تحديد التأثير الذاتي لـ IL-2 على LT4 نفسها (تكاثر وتمايز إلى Th).",
        "تحديد التأثير المحفز لـ IL-2 على LB و LT8 (الخلطي والخلوي).",
      ],
      biologicalModel_ar: {
        system_ar: "شبكة الاتصال والتنشيط الخلوي بالوسائط الكيميائية.",
        experimentalConditions_ar: "إفراز وإنترلوكينات ذات تأثير موضعي وعام.",
        governingBiologicalMechanisms_ar: ["التحفيز الذاتي المتكرر والتحفيز المتصالب للمفاويات المناعية."],
        evidenceExtracted_ar: "تأثير IL-2 على الخلية المفرزة وعلى الخلايا المجاورة.",
        deductionOrConclusion_ar: "الإنترلوكين 2 هو المحفز العام لجميع فروع الاستجابة المناعية النوعية.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن IL-2 يفرز من البالعة أو ينشط فقط اللمفاويات B يغفل دوره الذاتي المحوري ودوره في المناعة الخلوية.",
      },
      scoringRubric_ar: "0.5 ن لشرح التأثير الذاتي (Autocrine)، 0.5 ن لشرح التأثير الغيري على LB و LT8 (Paracrine).",
    },
    l3_mixed: {
      id: "snv_coop_l3",
      capabilityId: "snv_immune_cooperation_interleukin_hiv",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة تجربة كلاصون (Claman) حيث تم تعريض فئران لجرعة مميتة من الإشعاع لتدمير جهازها المناعي كلياً، ثم وزعت على أربع مجموعات وحقنت بكرات الدم الحمراء للخروف (GRBC كمستضد): المجموعة 1: حقنت بـ LB فقط -> النتيجة: عدم إنتاج أضداد (0). المجموعة 2: حقنت بـ LT فقط -> النتيجة: عدم إنتاج أضداد (0). المجموعة 3: حقنت بـ (LB + LT) معاً -> النتيجة: إنتاج كثيف للأجسام المضادة ضد GRBC. المجموعة 4: حقنت بـ (LB + LT المعاملة بمادة تمنع إفراز السيتوكينات) -> النتيجة: عدم إنتاج أضداد (0). حلل النتائج واستنتج الشروط الضرورية لإنتاج الأجسام المضادة من طرف اللمفاويات B.",
      expectedResponse_ar: "التحليل: نلاحظ أن حقن اللمفاويات B وحدها أو اللمفاويات T وحدها لم يسمح بإنتاج أي جسم مضاد ضد المستضد GRBC؛ بينما أدى الجمع بين اللمفاويات B واللمفاويات T معاً إلى إنتاج كثيف وفعال للأجسام المضادة النوعية. وفي المجموعة 4، عندما عطل إفراز السيتوكينات في اللمفاويات T رغم وجودها المادي مع LB، انعدم إنتاج الأجسام المضادة كلياً. الاستنتاج: إنتاج الأجسام المضادة من طرف اللمفاويات B مشروط بحدوث تعاون مناعي إلزامي مع اللمفاويات التائية (Th)، وهذا التعاون لا يكتفي بالوجود الخلوي بل يتطلب وظيفياً إفراز وسائط كيميائية منشطة (الإنترلوكينات) لتحفيز اللمفاويات B على التكاثر والتمايز إلى خلايا بلازمية مفرزة.",
      reasoningSteps_ar: [
        "تحليل غياب الأضداد في المجموعتين 1 و 2.",
        "تحليل الإنتاج الكثيف في المجموعة 3 (ضرورة الاجتماع).",
        "تحليل فشل المجموعة 4 (إلزامية السيتوكينات/الإنترلوكينات).",
        "الاستنتاج: التعاون المناعي الكيميائي شرط حتمي للتمايز البلازمي.",
      ],
      biologicalModel_ar: {
        system_ar: "تجارب كلاصون الكلاسيكية لإثبات التعاون اللمفاوي T-B.",
        experimentalConditions_ar: "حيوانات مشععة معوضة بخلايا مناعية معزولة.",
        governingBiologicalMechanisms_ar: ["التعاون الخلوي المشروط بالوسائط الإفرازية (Interleukines)."],
        evidenceExtracted_ar: "انعدام الإنتاج بـ LB وحدها، ونجاحه بـ LB+LT، وفشله بتثبيط السيتوكينات.",
        deductionOrConclusion_ar: "التمايز البلازمي يتطلب إشارات كيميائية إلزامية من Th.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "استنتاج أن 'اللمفاويات T هي التي تصنع الأجسام المضادة' خطأ مفاهيمي فادح يجهل أن الصانع الحصري هو الخلايا البلازمية المتمايزة من LB.",
      },
      scoringRubric_ar: "0.5 ن لمقارنة المجموعات 1 و 2 و 3، 0.5 ن لدلالة المجموعة 4، 1.0 ن للاستنتاج الدقيق حول التعاون المناعي الكيميائي.",
    },
    l4_transfer: {
      id: "snv_coop_l4",
      capabilityId: "snv_immune_cooperation_interleukin_hiv",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "أشخاص قليلون جداً في العالم يمتلكون طفرة جينية وراثية نادرة تدعى (CCR5-delta32)، حيث يفتقر غشاء خلاياهم التائية للمستقبل المساعد CCR5 الذي يتعاون مع CD4 أثناء دخول فيروس السيدا. أظهرت الفحوصات أن هؤلاء الأشخاص لا يصابون إطلاقاً بمرض السيدا حتى عند تعرضهم المتكرر للفيروس، وتظل مستويات LT4 لديهم طبيعية تماماً. فسر الحصانة المناعية الاستثنائية لهؤلاء الأشخاص، واقترح استراتيجية علاجية حديثة مستوحاة من هذه الظاهرة لعلاج مرضى السيدا.",
      expectedResponse_ar: "التفسير: عملية اختراق فيروس السيدا لغشاء الخلية المضيفة تتم عبر خطوتين إلزاميتين متتاليتين: أولاً ارتباط البروتين السكري الفيروسي gp120 بمستقبل CD4 الأساسي، وثانياً حدوث تغير فراغي في gp120 يسمح له بالارتباط بالمستقبل المساعد CCR5؛ هذا الارتباط المزدوج هو الذي يحفز إدخال بروتين الاندماج الفيروسي gp41 في غشاء الخلية وحدوث اندماج الغلافين وتحرير مادة الفيروس داخل الهيولى. لدى الأفراد حاملي طفرة CCR5-delta32، يغيب هذا المستقبل المساعد كلياً، وبالتالي رغم تثبت الفيروس الأولي على CD4 فإنه يعجز عن إتمام عملية الاندماج والدخول، ويبقى محبوساً في الخارج ويتعرض للبلعمة والزوال، فتظل خلايا LT4 سليمة ومعافاة ويستمر الجهاز المناعي في عمله بكفاءة كاملة. الاستراتيجية العلاجية المقترحة: تطبيق تقنية العلاج الجيني وتعديل الجينات (مثل تقنية كريسبر-كاس9 CRISPR-Cas9) على الخلايا الجذعية المكونة للدم لمرضى السيدا لتعطيل المورثة المشفرة لمستقبل CCR5، ثم إعادة زرعها لإنتاج خلايا مناعية وخلايا LT4 مقاومة تماماً لدخول وتكاثر الفيروس.",
      reasoningSteps_ar: [
        "تفسير آلية الدخول المعتمدة على المستقبل المساعد CCR5 واندماج الغشاء.",
        "ربط غياب CCR5 بفشل الاندماج وعجز الفيروس عن دخول الخلية المضيفة.",
        "اقتراح التعديل الجيني الموجه كحل استراتيجي لعلاج المرض.",
      ],
      biologicalModel_ar: {
        system_ar: "الآليات الجزيئية لنفاذ الفيروسات القهقرية وتطبيقات العلاج الجيني.",
        experimentalConditions_ar: "طفرة وراثية طبيعية تحمي من العدوى الفيروسية.",
        governingBiologicalMechanisms_ar: ["الاندماج الغشائي المشروط بالمستقبل المساعد والتعطيل الجيني الهادف."],
        evidenceExtracted_ar: "غياب CCR5 يمنع دخول الفيروس ويحمي خلايا LT4.",
        deductionOrConclusion_ar: "استهداف المستقبلات الخلوية استراتيجية فعالة لهزيمة الفيروسات المتغيرة.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن طفرة CCR5 تجعل الفيروس ينتحر أو تفرز مضادات حيوية ينم عن فهم غير جزيئي لآلية التعطيل.",
      },
      scoringRubric_ar: "1 ن لتفسير دور المستقبل المساعد في الاندماج والدخول، 1 ن لاقتراح الاستراتيجية الجينية المستوحاة علمياً.",
    },
    l5_bac_style: {
      id: "snv_coop_l5",
      capabilityId: "snv_immune_cooperation_interleukin_hiv",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "نص علمي مهيكل (مقدمة، مشكلة، عرض، خاتمة): اشرح في نص علمي منسق ومنظم الآليات الجزيئية والخلوية للتعاون المناعي المنسق بواسطة اللمفاويات التائية المساعدة (Th)، مبرزاً الأثر المدمر لفيروس فقدان المناعة المكتسبة (VIH) على شل الاستجابتين الخلطية والخلوية معاً وظهور مرحلة السيدا المعلن.",
      expectedResponse_ar: "المقدمة: يرتكز الدفاع المناعي النوعي المكتسب على استجابتين متكاملتين: خلطية تنفذها الأجسام المضادة وخلوية تنفذها اللمفاويات التائية السامة. وتتوقف فاعلية هذين الخطين على تعاون مناعي وثيق تقوده اللمفاويات التائية المساعدة Th. المشكلة: فما هي الآليات الجزيئية لهذا التعاون المناعي، وكيف يؤدي استهداف فيروس السيدا للمفاويات LT4 إلى انهيار الدفاعات المناعية كلياً؟ العرض: 1) آليات التعاون المناعي: تنطلق العملية بابتلاع البالعة الكبيرة (CPA) للمستضد وعرض ببتيداته على جزيئات CMH-II. تتعرف اللمفاويات T4 على هذا المعقد بالتعرف المزدوج عبر مستقبلاتها TCR ومؤشر CD4، وتفرز البالعة الإنترلوكين 1 (IL-1) لتنشيطها. تفرز اللمفاويات T4 المنشطة الإنترلوكين 2 (IL-2) الذي يمارس تحفيزاً ذاتياً يضاعف نسيلتها ويمايزها إلى خلايا مساعدة وظيفية (Th). تفرز خلايا Th وسائط IL-2 التي تستهدف اللمفاويات B واللمفاويات LT8 المنتقاة بمولد الضد؛ هذا التحفيز الكيميائي هو الذي يحث اللمفاويات B على التكاثر والتمايز إلى خلايا بلازمية مفرزة للأجسام المضادة (المناعة الخلطية)، ويحث اللمفاويات LT8 على التكاثر والتمايز إلى خلايا LTC سامة (المناعة الخلوية). 2) الأثر المدمر لفيروس السيدا (VIH): يستهدف فيروس السيدا نوعياً اللمفاويات LT4 بفضل التكامل البنيوي لبروتينه السكري gp120 مع مستقبل CD4. بعد النفاذ والنسخ العكسي والإدماج في المورثات، يتكاثر الفيروس مسبباً موت وتدمير خلايا LT4. يؤدي التناقص المستمر لـ LT4 وانخفاضها الحاد دون 200 خلية/ملم³ إلى غياب خلايا Th وانقطاع إفراز الإنترلوكين 2، مما يشل قدرة اللمفاويات B و LT8 على التكاثر والتمايز رغم وجود المستضدات، فتتعطل الاستجابة الخلطية والخلوية معاً. الخاتمة: تشكل اللمفاويات Th قائد الأوركسترا للجهاز المناعي؛ لذا يمثل استهدافها بفيروس السيدا ضربة قاضية لمركز التنسيق المناعي تؤدي إلى عجز تام واستسلام العضوية للأمراض الانتهازية الفتاكة.",
      reasoningSteps_ar: [
        "هيكلة النص وفق المعايير الرسمية: مقدمة تنتهي بمشكلة علمية، عرض مفصل علمياً، خاتمة موجزة وتركيبية.",
        "شرح التعاون المناعي: CPA -> IL-1 -> LT4 -> IL-2 -> Th -> تحفيز LB و LT8.",
        "شرح أثر فيروس السيدا: استهداف CD4 -> تدمير LT4 -> غياب IL-2 -> شلل الخلطي والخلوي.",
      ],
      biologicalModel_ar: {
        system_ar: "شبكة التنسيق المناعي الشاملة وتفككها المرضي بفيروس السيدا.",
        experimentalConditions_ar: "صياغة نص علمي تركيبي لموضوع بكالوريا رسمي.",
        governingBiologicalMechanisms_ar: ["التعاون المناعي، الإشارات الكيميائية بالإنترلوكين، والاستهداف الفيروسي."],
        evidenceExtracted_ar: "تكامل خطوط الدفاع واعتمادها المشترك على Th و IL-2.",
        deductionOrConclusion_ar: "الاستهداف الانتقائي لـ LT4 يعطل كل المنظومة المناعية المكتسبة.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "إغفال دور البالعات الكبيرة في العرض أو عدم ذكر الإنترلوكينات (IL-1 و IL-2) يفقد النص دعامته الجزيئية الأساسية.",
      },
      scoringRubric_ar: "1.0 ن للمقدمة والمشكلة، 3.0 ن للعرض بتفاصيله الدقيقة (تعاون + أثر الفيروس)، 1.0 ن للخاتمة (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الاعتقاد بأن الإنترلوكين 2 ينشط اللمفاويات B فقط دون الخلوية، أو اختزال دور Th في إفراز الأجسام المضادة مباشرة.",
    wrongMentalModel_ar: "الاعتقاد بأن اللمفاويات Th تفرز أجساماً مضادة بنفسها، أو أن الفيروس يقتل اللمفاويات B مباشرة.",
    correctMentalModel_ar: "اللمفاويات Th لا تفرز أجساماً مضادة ولا تقتل الخلايا مباشرة؛ هي خلايا إفرازية تنظيمية تفرز الإنترلوكين 2 الذي ينشط اللمفاويات B (للخلطية) واللمفاويات LT8 (للخلوية)؛ وفيروس السيدا يدمر LT4 فيسقط التنشيط عن الطرفين.",
    threeStepActionProtocol_ar: [
      "1. تذكر دائماً: البالعة تعرض على LT4 -> تفرز IL-1 -> LT4 تفرز IL-2 ذاتياً وتتحول إلى Th.",
      "2. الخلية Th تفرز IL-2 المنشط لكل من: اللمفاويات B (لتنتج أضداداً) واللمفاويات LT8 (لتنتج خلايا سامة LTC).",
      "3. عند ذكر السيدا: الفيروس يدمر LT4 حصراً، فتنعدم Th وينعدم IL-2، فتتوقف LB و LT8 معاً رغم سلامتها الأصلية.",
    ],
    microDrill_ar: {
      prompt_ar: "لماذا يصاب مريض السيدا بعجز في المناعة الخلطية رغم أن فيروس السيدا لا يتطفل على اللمفاويات B؟",
      solution_ar: "لأن اللمفاويات B تعجز عن التكاثر والتمايز إلى خلايا بلازمية مفرزة للأجسام المضادة في غياب الإشارات المنشطة (الإنترلوكين 2) التي توفرها اللمفاويات Th المدمرة بواسطة الفيروس.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_coop_retest_01",
    invariantTested_ar: "التعاون المناعي ودور الإنترلوكين 2 والتكامل بين الفروع المناعية.",
    changedSurface_ar: "تطبيق على حالة مرض العوز المناعي الشديد المشترك (SCID) الناتج عن طفرة وراثية في مستقبل الإنترلوكين 2 (IL-2R).",
    prompt_ar: "مرض العوز المناعي المشترك الشديد (SCID المرتبط بالصبغي X) ناتج عن طفرة وراثية تؤدي إلى غياب السلسلة غاما المشتركة لمستقبلات الإنترلوكين 2 (IL-2R) على أسطح اللمفاويات. يعيش الرضع المصابون داخل فقاعة معقمة تماماً لعجزهم عن مقاومة أي عدوى. فسر لماذا يسبب خلل مستقبل الإنترلوكين 2 عجزاً شاملاً في كل من المناعة الخلطية والمناعة الخلوية معاً رغم وجود اللمفاويات في دم المريض.",
    solution_ar: "التفسير: وجود اللمفاويات التائية والبائية وانتقاؤها النوعي بمولدات الضد لا يكفي بذاته لإطلاق الاستجابة المناعية، بل يشترط حتماً استقبال إشارات كيميائية تحفيزية بواسطة الإنترلوكين 2 (IL-2). عندما تغيب مستقبلات IL-2R السليمة عن أسطح الخلايا المناعية بسبب الطفرة، تعجز اللمفاويات T4 عن إتمام التحفيز الذاتي لتشكيل خلايا Th، وتعجز اللمفاويات B المنتقاة عن استقبال رسائل التكاثر والتمايز البلازمي فتغيب الأجسام المضادة (شلل الخلطية)، وتعجز اللمفاويات LT8 عن استقبال رسائل التمايز إلى LTC فتنعدم الخلايا السامة (شلل الخلوية)، مما يسبب شللاً تاماً ومزدوجاً للدفاع المناعي التكيفي.",
    passCondition_ar: "ربط غياب مستقبلات IL-2 بالعجز التكاثري والتمايزي في كلا المسارين الخلطي والخلوي.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: استراتيجية تطوير لقاح ضد فيروس السيدا وعقبة التنوع الطفري",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "رغم مرور عقود على اكتشاف فيروس فقدان المناعة المكتسبة (VIH)، لم ينجح المجتمع العلمي حتى اليوم في إنتاج لقاح وقائي فعال ضده. يمثل الشكل (1) آلية عمل إنزيم النسخ العكسي (Transcriptase inverse) للفيروس والذي يفتقر لآلية التصحيح الذاتي فيرتكب خطأ نيوكليوتيدياً واحداً في كل دورة نسخ تقريباً، مما يؤدي إلى تغير مستمر في البنية الفضائية ومحددات البروتين السكري السطحي gp120. يمثل الشكل (2) تطور تنوع السلالات الفيروسية داخل جسم مريض واحد عبر الزمن. 1) فسر انطلاقاً من الشكل (1) سبب التنوع الهائل لسلالات فيروس VIH وظهور متحورات جديدة باستمرار. 2) علل فشل اللقاحات التقليدية المعتمدة على بروتين gp120 المعزول في حماية العضوية من العدوى. 3) اقترح فرضية منطقية لتصميم لقاح ذكي يتغلب على هذه العقبة الطفرية.",
    modelSolution_ar: [
      "1) تفسير التنوع الهائل لسلالات الفيروس: إنزيم النسخ العكسي المسؤول عن تحويل ARN الفيروسي إلى ADN متمم يتميز بمعدل خطأ طفري استثنائي الارتفاع لافتقاره لنشاط التدقيق والتصحيح الذاتي (Correction d'épreuves). كل طفرة نقطية تؤدي إلى استبدال أحماض أمينية في سلسلة البروتين السكري gp120، مما يغير بنيته الفراغية ومحدداته المستضدية السطحية باستمرار، فتنشأ في كل دورة تكاثر سلالات ومتحورات فيروسية جديدة داخل نفس العضوية.",
      "2) تعليل فشل اللقاحات التقليدية: اللقاحات التقليدية تعتمد على إثارة استجابة خلطية وتشكيل خلايا ذاكرة وأجسام مضادة نوعية لمحددات معينة من بروتين gp120؛ لكن سرعة وتواتر الطفرات تجعل الفيروس يغير شكل أزراره السطحية gp120 قبل أن تتشكل الأجسام المضادة ضده، فتصبح الأجسام المضادة والذاكرة المناعية المشكلة غير متوافقة بنيوياً مع السلالات الجديدة الطافرة ويعجز الجسم المضاد عن التثبت عليها، مما يمكن الفيروس من الإفلات التام من التحييد المناعي.",
      "3) الفرضية لتصميم لقاح ذكي: تصميم لقاح يوجه الاستجابة المناعية نحو 'المناطق الثابتة المحمية' في بروتين gp120 والتي تشكل موقع الارتباط النوعي الإلزامي بمستقبل CD4؛ فهذه المنطقة لا يمكن للفيروس أن يطفر فيها لأن أي تغيير في شكلها يفقده القدرة على الارتباط بـ CD4 واختراق الخلايا المضيفة، مما يحرمه من القدرة على العدوى ويجعله عاجزاً عن الإفلات من الأجسام المضادة المستهدفة لتلك البقعة الثابتة.",
    ],
    markingScheme_ar: [
      { criterion: "تفسير نشوء التنوع الطفري بغياب التصحيح الذاتي لإنزيم النسخ العكسي", points: 2.0 },
      { criterion: "تعليل فشل اللقاح بتغير محددات gp120 وفقدان التكامل مع الأضداد والذاكرة", points: 2.0 },
      { criterion: "اقتراح فرضية استهداف المناطق الثابتة المحمية المرتبطة بـ CD4", points: 1.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 146-165)",
    historicalBacRef: "BAC 2015 Sciences Expérimentales Sujet 2 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};



// ============================================================================
// 9. snv_resting_potential_ionic_mechanisms
// ============================================================================

export const SNV_RESTING_POTENTIAL_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_resting_potential_ionic_mechanisms",
  canonicalTitle_ar: "الاتصال العصبي: الآليات الشاردية لكمون الراحة",
  canonicalTitle_fr: "Communication nerveuse : mécanismes ioniques du potentiel de repos",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "دور البروتينات في الاتصال العصبي",
  status: "APPROVED",
  scopeIn: [
    "مفهوم كمون الراحة (Potentiel de repos / -70 mV) واستقطاب الغشاء الهيولي لليف العصبي.",
    "التوزع المتباين لشوارد الصوديوم والبوتاسيوم: تركيز K+ مرتفع في الداخل (هيولى)، وتركيز Na+ مرتفع في الخارج.",
    "النفاذية غير المتساوية عبر قنوات التسرب (Canaux de fuite): نفاذية عالية للبوتاسيوم ونفاذية ضعيفة جداً للصوديوم (انتشار ميسر سلبي وفق التدرج).",
    "النقل الفعال عبر مضخة الصوديوم/البوتاسيوم (Pompe Na+/K+ ATPase): طرد 3Na+ نحو الخارج وإدخال 2K+ نحو الداخل باستهلاك طاقة ATP ضد تدرج التركيز.",
    "التجارب الدالة: استخدام السموم الأيضية (DNP / Cyanure) ومركب الأوابين (Ouabaïne) المثبط للمضخة وتتبع الإشعاع الشاردي.",
  ],
  scopeOut: [
    "معادلة نيرنست (Nernst equation) ومعادلة غولدمان-هودجكين-كاتز الرياضية المتقدمة الخاصة بالجامعة.",
    "حساب التيارات الكهربائية للخلية المفردة بتقنية Patch-Clamp بتفاصيل الفيزياء الحيوية.",
  ],
  prerequisites: {
    hard: ["snv_protein_structure_amphoteric_ionization"],
    soft: ["مفهوم الغشاء الفسيفسائي والانتشار والحلولية والنقل الفعال"],
    foundation: ["بنية العصبون والليف العصبي وجهاز راسم الاهتزاز المهبطي"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_REST_01",
      bloomLevel: "understand",
      description_ar: "يفسر الاستقطاب الغشائي لكمون الراحة (-70 mV) بالتوزع المتباين لشوارد Na+ و K+ والنفاذية الانتقائية لقنوات التسرب.",
    },
    {
      code: "LO_SNV_REST_02",
      bloomLevel: "analyze",
      description_ar: "يحلل تجارب الوسم الإشعاعي والتثبيط الأيضي ويثبت ضرورة مضخة Na+/K+ ATPase في الحفاظ على ثبات كمون الراحة.",
    },
    {
      code: "LO_SNV_REST_03",
      bloomLevel: "apply",
      description_ar: "يركب علاقة سببية بين النقل السلبي المبدد للتدرج والنقل الفعال المعوض له لصيانة الجاهزية الكهربائية للعصبون.",
    },
  ],
  coreConcepts_ar: [
    "كمون الراحة هو فرق كمون كهربائي مستقر عبر غشاء الليف العصبي غير المنبه يبلغ حوالي -70 mV، بحيث يكون السطح الداخلي سالباً والخارجي موجباً.",
    "يعود أصل كمون الراحة إلى التوزع غير المتساوي للشوارد: [K+] داخل الخلية أعلى بكثير من خارجها، و [Na+] خارج الخلية أعلى بكثير من داخلها.",
    "تسمح قنوات التسرب المفتوحة باستمرار بهجرة سلبية لشوارد K+ نحو الخارج بكميات أكبر بكثير من دخول Na+، مما يراكم شحنات موجبة في الخارج وسالبة في الداخل.",
    "مضخة Na+/K+ ATPase بروتين غشائي إنزيمي يعمل باستمرار ضد تدرج التركيز (طرد 3Na+ مقابل إدخال 2K+ باستهلاك ATP) لضمان ثبات التراكيز الغشائية.",
  ],
  lessonPackage: {
    overview_ar: "العصبونات خلايا قابلة للتنبيه تحافظ في حالة الراحة على طاقة كامنة مخزونة في صورة فرق كمون كهربائي غشائي سالب تدعمه بروتينات قنوات التسرب والمضخات الشاردية.",
    biologicalMechanism_ar: [
      "1. التوزع غير المتكافئ: يمتلك الليف العصبي تركيزاً هيولياً مرتفعاً لـ K+ (حوالي 140 mM) مقابل منخفض في الخارج (5 mM)، والعكس تماماً لـ Na+ (15 mM في الداخل مقابل 145 mM في الخارج).",
      "2. الهجرة عبر قنوات التسرب: يحتوي الغشاء على قنوات تسرب بروتينية مفتوحة دوماً، حيث تكون نفاذية الغشاء لـ K+ أكبر بنحو 50 إلى 100 مرة من نفاذيته لـ Na+. يخرج K+ حراً بالتدرج حاملاً شحناته الموجبة، بينما تعجز الشوارد العضوية السالبة الكبيرة (البروتينات) عن الخروج، فيستقطب الغشاء سالبياً في الداخل.",
      "3. دور مضخة Na+/K+: خروج K+ المستمر ودخول Na+ الطفيف يهدد بزوال التدرج وتلاشي كمون الراحة؛ تتدخل مضخة Na+/K+ بنقل فعال عكس التدرج يستهلك جزيئة ATP لطرد 3Na+ وإدخال 2K+، مما يعيد الشوارد لمواقعها ويحافظ على ثبات كمون الراحة عند -70 mV.",
    ],
    evidenceAndObservation_ar: "عند وضع إلكترود الاستقبال المجهري على السطح الخارجي لليف العصبي العملاق للكاليمار لا يسجل أي فرق كمون (0 mV)؛ وبمجرد اختراق الإلكترود للداخل يرتسم انحراف فوري مستقر عند -70 mV.",
    scientificReasoning_ar: "تسجيل -70 mV بمجرد الدخول للهيولى يثبت أن الاستقطاب الغشائي خاصية غشائية حيوية ملازمة للعصبون الحي السليم ناتجة عن التوزيع غير المتناظر للشحنات والشوارد.",
    biologicalConclusion_ar: "كمون الراحة هو حالة توازن ديناميكي نشط بين تسرب شاردي سلبي مبدد وتدخل فعال معاكس للمضخة يضمن استعداد الليف لتوليد ونقل السيالة العصبية.",
  },
  workedModel: {
    problem_ar: "تم حجز ليف عصبي عملاق للكاليمار في وسط فيزيولوجي يحتوي شوارد Na+ و K+. تم حقن مادة DNP (مثبط اصطناع ATP في الميتوكوندريا) داخل المحور العصبي، فلوحظ الانخفاض التدريجي لكمون الراحة من -70 mV حتى قارب 0 mV بعد ساعتين، وتساوت تراكيز الشوارد على جانبي الغشاء. عند حقن كمية كافية من ATP داخل الليف المعالج، استعاد كمون الراحة قيمته الطبيعية (-70 mV) وعاد التباين الشاردي. 1) فسر آلية تأثير مادة DNP وحقن ATP على كمون الراحة. 2) ماذا تستنتج حول متطلبات الحفاظ على كمون الراحة؟",
    documentData_ar: "DNP يخفض الكمون إلى 0 وتتساوى التراكيز، وحقن ATP يعيد الكمون إلى -70 mV ويعيد التباين الشاردي.",
    observation_ar: "تثبيط الطاقة يزيل كمون الراحة ويلغي التدرج الشاردي، وإمداد الطاقة المباشر يعيد بناء كمون الراحة فورياً.",
    interpretation_ar: "تمنع مادة DNP تركيب ATP الضروري لعمل مضخة Na+/K+ ATPase؛ وبتوقف المضخة تستمر قنوات التسرب في تسريب K+ للخارج و Na+ للداخل وفق التدرج الطبيعي دون تعويض، مما يؤدي إلى تلاشي التدرج الشاردي تدريجياً وانعدام الاستقطاب الغشائي (0 mV). عند حقن ATP، تجد المضخة الطاقة الضرورية لاستئناف عملها فتقوم بنقل الشوارد عكس تدرج تركيزها (طرد Na+ وإدخال K+)، مما يعيد بناء التباين الشاردي واسترجاع كمون الراحة الطبيعي -70 mV.",
    deduction_ar: "الحفاظ على كمون الراحة وثبات التدرج الشاردي عملية حيوية نشطة تتطلب استهلاكاً مستمراً لطاقة ATP بواسطة مضخة Na+/K+ ATPase.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_rest_l1",
      capabilityId: "snv_resting_potential_ionic_mechanisms",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "ما هو عدد واتجاه حركة شوارد Na+ و K+ المنقولة بواسطة مضخة Na+/K+ ATPase خلال دورة تحفيزية واحدة تستهلك جزيئة واحدة من ATP؟",
      expectedResponse_ar: "طرد 3 شوارد صوديوم (3Na+) نحو الخارج مقابل إدخال شاردتي بوتاسيوم (2K+) نحو الداخل.",
      reasoningSteps_ar: [
        "استرجاع الآلية الوظيفية للمضخة الغشائية.",
        "3 Na+ نحو الخارج، 2 K+ نحو الداخل باستهلاك 1 ATP.",
      ],
      biologicalModel_ar: {
        system_ar: "مضخة الصوديوم/البوتاسيوم الغشائية.",
        experimentalConditions_ar: "شروط فيزيولوجية حيوية متوفرة على ATP.",
        governingBiologicalMechanisms_ar: ["النقل الفعال الكهربائي غير المتناظر."],
        evidenceExtracted_ar: "طرد 3Na+ مقابل إدخال 2K+.",
        deductionOrConclusion_ar: "المساهمة في الشحنة السالبة الداخلية وصيانة التدرج.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "عكس الأعداد (2 Na+ مقابل 3 K+) أو عكس الاتجاهات خطأ شائع ناتج عن الحفظ غير الدقيق للمعادلة البيوكيميائية للمضخة.",
      },
      scoringRubric_ar: "درجة كاملة لاختيار 3 Na+ للخارج و 2 K+ للداخل.",
    },
    l2_application: {
      id: "snv_rest_l2",
      capabilityId: "snv_resting_potential_ionic_mechanisms",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "علل لماذا يكون السطح الداخلي لغشاء الليف العصبي سالباً بالنسبة للسطح الخارجي أثناء الراحة رغم أن شوارد Na+ و K+ كلاهما موجبة الشحنة.",
      expectedResponse_ar: "التعليل: يعود ذلك إلى عاملين أساسيين: 1) النفاذية الانتقائية العالية للغشاء لشوارد البوتاسيوم مقارنة بالصوديوم؛ حيث تسمح قنوات التسرب بهجرة سريعة ومستمرة لشوارد K+ الموجبة من الداخل نحو الخارج بالانتشار الميسر، بينما تعجز البروتينات والشوارد العضوية السالبة الكبيرة الحجم والمتواجدة في الهيولى عن اختراق الغشاء، فتترك شحنة سالبة داخلية غير معوضة. 2) مضخة Na+/K+ تطرد 3 شحنات موجبة (3Na+) للخارج مقابل إدخال شحنتين موجبتين فقط (2K+) للداخل، مما يضيف فرق شحنة سالب صافٍ نحو الداخل.",
      reasoningSteps_ar: [
        "ذكر نفاذية قنوات تسرب K+ وخروج الشحنات الموجبة.",
        "احتباس الأنيونات العضوية السالبة داخل الهيولى.",
        "الدور غير المتناظر للمضخة (3 موجبة للخارج مقابل 2 للداخل).",
      ],
      biologicalModel_ar: {
        system_ar: "غشاء الليف العصبي في حالة الراحة.",
        experimentalConditions_ar: "توازن القوى الكهروكيميائية للشوارد الغشائية.",
        governingBiologicalMechanisms_ar: ["التسرب الشاردي التفاضلي والاحتباس الأنيوني الداخلي."],
        evidenceExtracted_ar: "نفاذية K+ العالية واحتجاز البروتينات السالبة داخل الهيولى.",
        deductionOrConclusion_ar: "استقطاب الغشاء بسلبية داخلية مستقرة (-70 mV).",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بوجود شوارد سالبة حرة تتدفق بكثرة إلى الداخل يغفل أن السبب الرئيسي هو خروج الشحنات الموجبة (K+) واحتباس الجزيئات العضوية الكبيرة.",
      },
      scoringRubric_ar: "0.5 ن لخروج K+ واحتباس البروتينات السالبة، 0.5 ن لعدم التناظر الشحني للمضخة (3 Na+ مقابل 2 K+).",
    },
    l3_mixed: {
      id: "snv_rest_l3",
      capabilityId: "snv_resting_potential_ionic_mechanisms",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة قياس كمون الراحة لليف عصبي وُضع في أوساط فيزيولوجية متزايدة التركيز من شاردة البوتاسيوم [K+]ext (من 5 mM إلى 100 mM). يظهر المنحنى ارتفاع كمون الغشاء تدريجياً من -70 mV حتى وصل إلى -15 mV (نقص في الاستقطاب). في تجربة مقابلة، لم يؤدِ تغيير تركيز شوارد الصوديوم الخارجية [Na+]ext إلى أي تغير يذكر في كمون الراحة. حلل الوثيقة تحليلاً مقارناً واستنتج الشاردة المسؤولة أساساً عن تحديد قيمة كمون الراحة مع التعليل.",
      expectedResponse_ar: "التحليل المقارن: نلاحظ أن زيادة تركيز شوارد البوتاسيوم في الوسط الخارجي [K+]ext تؤدي إلى تناقص الاستقطاب الغشائي وصعود كمون الغشاء من -70 mV نحو الصفر (-15 mV). في المقابل، فإن التغيير الواسع في تركيز شوارد الصوديوم الخارجية [Na+]ext لا يؤثر مطلقاً على قيمة كمون الراحة ويبقى ثابتاً عند -70 mV. الاستنتاج: الشاردة المسؤولة الأساسية عن تحديد قيمة كمون الراحة هي شاردة البوتاسيوم (K+). التعليل: يمتلك غشاء الليف العصبي نفاذية سائدة وشبه كلية لشاردة البوتاسيوم لكثرة قنوات تسرب K+ مقارنة بقنوات الصوديوم، وعند زيادة [K+] الخارجي ينخفض تدرج التركيز بين الداخل والخارج، فيقل خروج K+ الموجب نحو الخارج، مما يؤدي إلى تناقص فرط السلبية الداخلية واقتراب الكمون من الصفر.",
      reasoningSteps_ar: [
        "مقارنة تأثير زيادة [K+] الخارجي بتأثير زيادة [Na+].",
        "الاستنتاج: K+ هي المحددة والمتحكمة في كمون الراحة.",
        "التعليل: سيادة قنوات تسرب البوتاسيوم وتأثير تدرج التركيز الكهروكيميائي.",
      ],
      biologicalModel_ar: {
        system_ar: "الاستقطاب الغشائي لليف العصبي وتجارب تعديل الشوارد الخارجية.",
        experimentalConditions_ar: "تراكيز متدرجة لـ K+ و Na+ في محلول التروية.",
        governingBiologicalMechanisms_ar: ["النفاذية التفاضلية لشوارد K+ عبر قنوات التسرب."],
        evidenceExtracted_ar: "حساسية كمون الراحة لـ [K+]ext وثباته التام تجاه [Na+]ext.",
        deductionOrConclusion_ar: "كمون الراحة هو بالأساس كمون انتشار شاردة البوتاسيوم.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "استنتاج أن الصوديوم هو المسؤول عن كمون الراحة يعكس قراءة مقلوبة تماماً لمعطيات المنحنى التجريبي.",
      },
      scoringRubric_ar: "0.5 ن للتحليل المقارن، 0.5 ن للاستنتاج، 1.0 ن للتعليل البيولوجي الدقيق.",
    },
    l4_transfer: {
      id: "snv_rest_l4",
      capabilityId: "snv_resting_potential_ionic_mechanisms",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "مركب الأوابين (Ouabaïne) سم مستخرج من نبات إفريقي يثبط نوعياً موقع تثبيت شاردة البوتاسيوم على السطح الخارجي لمضخة Na+/K+ ATPase. بينت القياسات المجهرية أن إضافة الأوابين لليف عصبي عملاق لا تحدث أي تغير فوري في كمون الراحة (-70 mV) في الدقائق الأولى، ولكن بعد تنبيه متكرر لآلاف المرات أو بعد مرور عدة ساعات يبدأ كمون الراحة في التلاشي البطيء حتى ينعدم تماماً. فسر سبب بقاء كمون الراحة ثابتاً في الدقائق الأولى رغم تثبيط المضخة، وعلل سبب تلاشيه التدريجي اللاحق.",
      expectedResponse_ar: "التفسير والتعليل: 1) سبب الثبات الأولي: كمون الراحة لا يتولد لحظياً بواسطة المضخة بل ينتج مباشرة عن التباين الأيوني القائم مسبقاً وعن خروج K+ عبر قنوات التسرب؛ ونظراً لأن كمية الشوارد التي تعبر قنوات التسرب في كل دقيقة ضئيلة جداً مقارنة بالمخزون الشاردي الهائل داخل هيولى المحور العصبي العملاق، فإن التدرج الأيوني يظل كافياً للمحافظة على كمون الراحة عند -70 mV لفترة من الزمن حتى مع توقف المضخة التام. 2) سبب التلاشي التدريجي اللاحق: بتعطيل المضخة بالأوابين، تصبح العضوية عاجزة عن طرد Na+ المتسرب للداخل وعاجزة عن استرجاع K+ المتسرب للخارج. مع مرور الساعات ومع التنبيهات المتكررة التي تزيد من دخول Na+ وخروج K+، تتبدد المدخرات الشاردية تدريجياً وتتساوى التراكيز على جانبي الغشاء، فينعدم تدرج التركيز ويتوقف خروج البوتاسيوم، مما يؤدي إلى الزوال النهائي للاستقطاب ووصول كمون الغشاء إلى الصفر.",
      reasoningSteps_ar: [
        "التمييز بين التوليد المباشر للكمون (قنوات التسرب) والحفاظ البعيد المدى (المضخة).",
        "تفسير ثبات الدقائق الأولى بضخامة المخزون الشاردي داخل الهيولى.",
        "تعليل التلاشي بالتبدد الحتمي للتدرج نتيجة غياب التعويض النشط للمضخة.",
      ],
      biologicalModel_ar: {
        system_ar: "محور عصبي معالج بالأوابين والمتابعة الزمنية للتوازن الشاردي.",
        experimentalConditions_ar: "تثبيط كيميائي دوائي نوعي لمضخة Na+/K+.",
        governingBiologicalMechanisms_ar: ["القصور الذاتي للتباين الشاردي وتراكم الخسائر الشاردية في غياب الضخ."],
        evidenceExtracted_ar: "ثبات الكمون مبدئياً وتلاشيه البطيء بعد استنزاف التدرج.",
        deductionOrConclusion_ar: "دور المضخة صيانة طويلة الأمد للتدرج وليست مولداً كهربائياً آنياً وحيداً.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن تثبيط المضخة يصفر كمون الراحة في نفس الثانية يعكس فهماً مغلوطاً يخلط بين دور قنوات التسرب الفورية ودور المضخة التراكمي.",
      },
      scoringRubric_ar: "1 ن لتفسير الثبات الأولي استناداً لضخامة المخزون الشاردي، 1 ن لتعليل التلاشي التدريجي اللاحق بفقدان التدرج.",
    },
    l5_bac_style: {
      id: "snv_rest_l5",
      capabilityId: "snv_resting_potential_ionic_mechanisms",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا: يمثل الشكل (1) رسماً تخطيطياً للبروتينات الغشائية المسؤولة عن كمون الراحة في ليف عصبي. يمثل الشكل (2) نتائج تجريبية لقياس التدفق الشاردي لشوارد الصوديوم والبوتاسيوم المشعة في شروط تجريبية مختلفة: شروط طبيعية، بعد إضافة السيانيد، وبعد حقن ATP في الهيولى. 1) تعرف على البروتينات الغشائية (أ) و (ب) الممثلة في الشكل (1) مع إبراز الفروق الوظيفية الأساسية بينهما. 2) حلل النتائج التجريبية للشكل (2) تحليلاً مقارناً. 3) اكتب نصاً علمياً وجيزاً (عرض مهيكل) تلخص فيه كيف يؤمن التكامل الوظيفي بين النقل الإيجابي (السلبي) والنقل الفعال ثبات واستقرار كمون الراحة عند -70 mV في الخلايا العصبية الحية.",
      expectedResponse_ar: [
        "1) التعرف على البروتينات الغشائية والفروق بينها: - البروتين (أ) يمثل قنوات التسرب (Canaux de fuite): وهي بروتينات ذات نقل سلبي (ميسر) دائم الانفتاح، تنقل الشوارد وفق تدرج التركيز الكهروكيميائي، ولا تستهلك طاقة ATP، ونفاذيتها لـ K+ أعلى بكثير من Na+. - البروتين (ب) يمثل مضخة الصوديوم/البوتاسيوم (Pompe Na+/K+ ATPase): وهي بروتين إنزيمي ذو نقل فعال نشط، ينقل الشوارد عكس تدرج التركيز (طرد 3Na+ وإدخال 2K+)، ويستهلك طاقة حيوية ناتجة عن إماهة ATP.",
        "2) التحليل المقارن للشكل (2): في الشروط الطبيعية، نسجل تدفقاً خارجاً مستمراً لـ Na+ وتدفقاً داخلاً لـ K+ بمعدل ثابت دلالة على النشاط الدائم للمضخة. عند إضافة مادة السيانيد (مثبط التنفس الخلوي)، ينخفض تدفق الصوديوم نحو الخارج وتدفق البوتاسيوم نحو الداخل بشكل حاد حتى ينعدم كلياً بسبب توقف إنتاج ATP. عند حقن كمية من ATP داخل الهيولى رغم بقاء السيانيد، يستعيد تدفق الشوارد مستواه الطبيعي فورياً قبل أن يعاود الانخفاض بعد نفاذ كمية الـ ATP المحقونة. يدل ذلك على أن عمل المضخة الشاردية غير مرتبط مباشرة بالتنفس بل مشروط حصراً بتوفر جزيئات ATP كطاقة تشغيلية مباشرة.",
        "3) النص العلمي (العرض المهيكل): تؤمن الخلية العصبية ثبات كمون الراحة بفضل تكامل وظيفي دقيق بين نمطين من النقل: أولاً: النقل السلبي عبر قنوات التسرب المفتوحة دوماً؛ ونظراً لكثرة قنوات تسرب البوتاسيوم، تهاجر شوارد K+ باستمرار نحو السطح الخارجي للغشاء وفق تدرج تركيزها التنازلي، تاركة وراءها في الهيولى بروتينات سالبة الشحنة عاجزة عن النفاذ، مما يولد استقطاباً كهربائياً بسطح خارجي موجب وداخل سالب يقدر بـ -70 mV. ثانياً: النقل الفعال عبر مضخة Na+/K+ ATPase؛ هذا التسرب السلبي المستمر لـ K+ نحو الخارج ولدخول Na+ نحو الداخل يهدد بتبدد التدرج الشاردي وتلاشي كمون الراحة؛ هنا تتدخل المضخة باستمرار وبنقل فعال معاكس يستهلك طاقة إماهة ATP، فتقوم بطرد 3 شوارد Na+ نحو الخارج وإعادة إدخال شاردتي K+ نحو الداخل، مما يعوض بدقة الشوارد المتسربة ويحافظ على ثبات التراكيز الأيونية الغشائية وعلى استقرار كمون الراحة وجاهزية العصبون لنقل الإشارات العصبية.",
      ],
      reasoningSteps_ar: [
        "التمييز البنيوي والوظيفي بين قنوات التسرب والمضخة.",
        "التحليل المقارن لتجارب التثبيط بالسيانيد وإعادة التزويد بـ ATP.",
        "صياغة العرض العلمي التركيبي للتكامل بين النقل السلبي والنقل الفعال.",
      ],
      biologicalModel_ar: {
        system_ar: "منظومة الحفاظ على كمون الراحة في العصبون الحي.",
        experimentalConditions_ar: "تتبع التدفق الشاردي النظيري ومعايرة الطاقة الخلوية.",
        governingBiologicalMechanisms_ar: ["التكامل الوظيفي بين الانتشار الميسر والنقل الفعال المعوض."],
        evidenceExtracted_ar: "توقف التدفق بالسيانيد واسترجاعه بـ ATP.",
        deductionOrConclusion_ar: "كمون الراحة توازن حركي مستقر محكوم بالطاقة.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الخلط بين قنوات التسرب المفتوحة دائماً والقنوات الفولطية المبوبة كهربائياً خطأ جسيم يخل بدراسة كمون الراحة.",
      },
      scoringRubric_ar: "1.0 ن للتعرف والمقارنة، 1.5 ن للتحليل المقارن وتفسير ATP، 2.5 ن للنص العلمي المهيكل الدقيق (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين قنوات التسرب وقنوات كمون العمل الفولطية، أو اعتبار أن المضخة هي المسؤولة وحدها عن كمون الراحة.",
    wrongMentalModel_ar: "الاعتقاد بأن كمون الراحة ينتج عن قنوات كمون العمل المبوبة كهربائياً، أو أن الغشاء في حالة الراحة لا يمرر أي شوارد.",
    correctMentalModel_ar: "قنوات كمون العمل الفولطية مغلقة تماماً أثناء الراحة؛ كمون الراحة تحكمه قنوات التسرب المفتوحة دائماً (نفاذية عالية لـ K+) ومضخة Na+/K+ التي تعوض الشوارد المتسربة باستهلاك ATP.",
    threeStepActionProtocol_ar: [
      "1. في الراحة: القنوات الفولطية مغلقة؛ القنوات العاملة هي قنوات التسرب ومضخة Na+/K+.",
      "2. سبب السالبية الداخلية: قنوات تسرب K+ تخرج شحنات موجبة للخارج بكثرة مع احتباس الجزيئات السالبة الكبيرة في الداخل.",
      "3. دور المضخة: طرد 3Na+ وإدخال 2K+ باستهلاك 1 ATP لصيانة التدرج من الزوال.",
    ],
    microDrill_ar: {
      prompt_ar: "ماذا يحدث للتدرج الشاردي ولكمون الراحة إذا نفذت جزيئات ATP تماماً من الخلية العصبية؟",
      solution_ar: "تتوقف مضخة Na+/K+ عن العمل وتستمر قنوات التسرب في نقل الشوارد حتى تتساوى التراكيز على جانبي الغشاء، فيتلاشى التدرج الشاردي ويزول كمون الراحة تدريجياً حتى يصبح 0 mV.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_rest_retest_01",
    invariantTested_ar: "التكامل بين النقل السلبي عبر قنوات التسرب والنقل الفعال بالمضخة.",
    changedSurface_ar: "تطبيق على الخلايا العضلية القلبية وتأثير نقص التروية ونقص الأكسجين (Ischémie) على كمون الراحة.",
    prompt_ar: "أثناء الجلطة القلبية، يؤدي انسداد الشريان التاجي إلى حرمان الخلايا العضلية القلبية من الأكسجين والجلوكوز، مما يوقف التنفس الخلوي ويؤدي لتلاشي كمون الراحة الغشائي وحدوث اضطراب خطير في النظم القلبي. فسر جزيئياً تسلسل الأحداث المؤدية لتلاشي كمون الراحة عند انقطاع الأكسجين.",
    solution_ar: "التفسير الجزيئي: يؤدي انقطاع الأكسجين إلى توقف أكسدة الركائز في الميتوكوندريا وتوقف الفسفرة التأكسدية، مما يسبب نضوب مخزون الخلية من طاقة ATP. يؤدي غياب ATP إلى شلل فوري لنشاط مضخة Na+/K+ ATPase؛ ومع استمرار التسرب السلبي لشوارد البوتاسيوم للخارج والصوديوم للداخل عبر قنوات التسرب المفتوحة دون تعويض، تتساوى التراكيز الشاردية تدريجياً، مما يؤدي إلى زوال الاستقطاب الغشائي واقتراب كمون الراحة من الصفر وتوقف التوصيل الكهربائي الطبيعي.",
    passCondition_ar: "ربط نقص الأكسجين بنضوب ATP وتوقف المضخة وتبدد التدرج الشاردي عبر قنوات التسرب.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: تشخيص شلل العضلات الدوري العائلي المرتبط بفرط بوتاسيوم الدم",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "الشلل الدوري العائلي بفرط بوتاسيوم الدم (Paralysie périodique hyperkaliémique) مرض وراثي يتميز بنوبات شلل عضلي حاد بعد المجهود البدني تترافق مع ارتفاع ملحوظ في تركيز البوتاسيوم البلازمي [K+]ext إلى أكثر من 8 mM (القيمة الطبيعية 4 mM). يمثل الشكل (1) قياس كمون الراحة للألياف العضلية لشخص سليم وشخص مصاب أثناء النوبة حيث يسجل لدى المصاب كمون راحة بقيمة -50 mV بدلاً من -70 mV. 1) فسر انطلاقاً من الآليات الشاردية لكمون الراحة كيف يؤدي ارتفاع البوتاسيوم الخارجي إلى صعود كمون الراحة إلى -50 mV (إلغاء جزئي للاستقطاب). 2) علل لماذا يؤدي هذا الإلغاء الجزئي الدائم للاستقطاب إلى فقدان استجابة العضلة للتنبيه العصبي وحدوث الشلل الرخو. 3) اقترح علاجاً دوائياً عاجلاً للحد من خطورة النوبة.",
    modelSolution_ar: [
      "1) تفسير صعود كمون الراحة إلى -50 mV: يتحدد كمون الراحة أساساً بالتدفق الخارجي لشوارد البوتاسيوم عبر قنوات التسرب وفق تدرج التركيز بين الداخل والخارج. عند ارتفاع تركيز البوتاسيوم في البلازما والسائل البيني المحيط بالألياف [K+]ext إلى 8 mM، ينخفض انحدار وتدرج التركيز بين الهيولى والوسط الخارجي، فتقل القوة المحركة الكيميائية التي تدفع K+ للخروج عبر قنوات التسرب، فيقل عدد الشحنات الموجبة المغادرة للخلية ويزداد تراكم الشحنات الموجبة في الداخل، مما يؤدي إلى تناقص السلبية الداخلية وصعود كمون الغشاء من -70 mV إلى -50 mV (حالة زوال استقطاب جزئي دائم).",
      "2) تعليل حدوث الشلل الرخو وفقدان الاستجابة: توليد كمون العمل وتقلص العضلة يشترط انطلاقاً من كمون راحة مستقطب طبيعي (-70 mV) تكون فيه القنوات الغشائية الفولطية للصوديوم (Na_v) مغلقة وجاهزة للانفتاح فور التنبيه. عند بقاء كمون الغشاء ثابتاً عند -50 mV لفترة طويلة، تدخل قنوات الصوديوم الفولطية (Na_v) في حالة 'تعطيل خامل دائم' (Inactivation permanente)، حيث تنغلق بوابات التعطيل الداخلية للبروتين دون أن تستطيع الانفتاح مجدداً إلا بعد عودة الغشاء إلى -70 mV. وعليه، تصبح القنوات الفولطية عاجزة عن توليد أي تيار صوديومي داخل استجابة للأستيل كولين، فتفشل العضلة في توليد كمونات عمل وتفقد قدرتها على الانقباض وتدخل في شلل رخو تام.",
      "3) المقترح العلاجي العاجل: حقن محاليل مدرة للبوتاسيوم عبر الكلى، أو إعطاء الأنسولين مع الجلوكوز وريدياً؛ فالأنسولين ينشط بقوة مضخات Na+/K+ ATPase في الأنسجة الكبدية والعضلية مما يسرع إدخال البوتاسيوم الفائض من الدم إلى داخل الخلايا وخفض [K+] البلازمي إلى مستواه الطبيعي، فتعود الليف لاستقطابه الأصلي (-70 mV) وتستعيد العضلات حركتها.",
    ],
    markingScheme_ar: [
      { criterion: "تفسير أثر ارتفاع البوتاسيوم الخارجي على تناقص تدرج K+ وصعود الكمون إلى -50 mV", points: 2.0 },
      { criterion: "تعليل الشلل بتعطيل القنوات الفولطية للصوديوم وفشل توليد كمون العمل", points: 2.0 },
      { criterion: "اقتراح حل علاجي علمي منطقي لخفض بوتاسيوم الدم (أنسولين أو مدرات)", points: 1.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 166-185)",
    historicalBacRef: "BAC 2021 Sciences Expérimentales Sujet 2 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 10. snv_action_potential_voltage_gated_channels
// ============================================================================

export const SNV_ACTION_POTENTIAL_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_action_potential_voltage_gated_channels",
  canonicalTitle_ar: "الاتصال العصبي: كمون العمل والقنوات المبوبة كهربائياً",
  canonicalTitle_fr: "Communication nerveuse : potentiel d'action et canaux voltage-dépendants",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "دور البروتينات في الاتصال العصبي",
  status: "APPROVED",
  scopeIn: [
    "مفهوم كمون العمل أحادي الطور (Potentiel d'action) ومراحله الزمنية: زوال الاستقطاب، عودة الاستقطاب، فرط الاستقطاب، والعودة لكمون الراحة.",
    "عتبة التنبيه وقانون الكل أو العدم (Loi du tout ou rien) وتشفير الرسالة العصبية بتواتر كمونات العمل.",
    "القنوات المبوبة كهربائياً (Canaux voltage-dépendants): قنوات الصوديوم الفولطية (Na_v) وقنوات البوتاسيوم الفولطية (K_v).",
    "الآلية الجزيئية: الانفتاح السريع لقنوات Na_v ودخول Na+ السريع (زوال الاستقطاب)، انغلاق قنوات Na_v والانفتاح المتأخر لقنوات K_v وخروج K+ (عودة الاستقطاب)، واستمرار خروج K+ (فرط الاستقطاب).",
    "دور مضخة Na+/K+ في استعادة التراكيز الشاردية الأولية بعد كمون العمل.",
    "انتشار السيالة العصبية: التيارات المحلية في الألياف عديمة النخاعين والانتشار القفزي (Conduction saltatoire) في الألياف النخاعينية عبر تضيقات رانفيي (Nœuds de Ranvier).",
    "دور الاستعصاء (Période réfractaire) وأهميته في فرض اتجاه أحادي لانتشار السيالة.",
  ],
  scopeOut: [
    "معادلات المحاكاة الرياضية لهودجكين وهكسلي لنفاذية الغشاء بدلالة الزمن.",
    "النماذج الحركية لتعطيل القنوات بالكرة والسلسلة (Ball-and-chain model) بمستويات جامعية.",
  ],
  prerequisites: {
    hard: ["snv_resting_potential_ionic_mechanisms"],
    soft: ["مفهوم التنبيه الفعال وعتبة التنبيه ورسم الاهتزاز المهبطي"],
    foundation: ["بنية الغشاء الهيولي والقنوات البروتينية"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_ACT_01",
      bloomLevel: "analyze",
      description_ar: "يربط كل طور من أطوار كمون العمل بالحالة الانفتاحية والانغلاقية والتدفق الشاردي للقنوات المبوبة كهربائياً (Na_v و K_v).",
    },
    {
      code: "LO_SNV_ACT_02",
      bloomLevel: "apply",
      description_ar: "يفسر سرعة الانتشار الفائقة للسيالة العصبية في الألياف النخاعينية بآلية النقل القفزي عبر تضيقات رانفيي الغنية بالقنوات الفولطية.",
    },
    {
      code: "LO_SNV_ACT_03",
      bloomLevel: "evaluate",
      description_ar: "يعلل الاتجاه الأحادي لانتشار الرسالة العصبية بظاهرة دور الاستعصاء الناتج عن خمول قنوات Na_v.",
    },
  ],
  coreConcepts_ar: [
    "كمون العمل هو تغير كهربائي عابر وسريع في كمون الغشاء ينشأ عند وصول التنبيه إلى عتبة زوال الاستقطاب (حوالي -50 mV).",
    "طور زوال الاستقطاب ناتج عن انفتاح سريع لقنوات الصوديوم المبوبة كهربائياً وتدفق كثيف وسريع لشوارد Na+ نحو الداخل.",
    "طور عودة الاستقطاب ناتج عن انغلاق قنوات Na_v وانفتاح متأخر لقنوات البوتاسيوم الفولطية وتدفق K+ نحو الخارج.",
    "ينتقل كمون العمل في اتجاه واحد دون ارتداد بفضل دور الاستعصاء حيث تكون قنوات Na_v في حالة خمول غير قابلة للتحفيز فوراً.",
  ],
  lessonPackage: {
    overview_ar: "الرسالة العصبية إشارة كهربائية مشفرة بتواتر كمونات العمل، وتتحكم في توليدها وسرعة انتقالها قنوات غشائية بروتينية مبوبة كهربائياً تفتح وتغلق وفق توتر الغشاء.",
    biologicalMechanism_ar: [
      "1. زوال الاستقطاب: عند تنبيه فعال يصل بالكمون إلى العتبة (-50 mV)، تفتح قنوات Na_v الحساسة للفولطية فيتدفق Na+ هائلاً للداخل عاكساً القطبية (+30 mV).",
      "2. عودة الاستقطاب: بعد حوالي 1 ميلي ثانية، تنغلق قنوات Na_v وتفتح قنوات K_v الفولطية ببطء، فيخرج K+ متدفقاً للخارج معيداً السلبية للداخل.",
      "3. فرط الاستقطاب: تأخر انغلاق قنوات K_v يسمح بخروج فائض من البوتاسيوم فيهبط الكمون إلى -80 mV قبل أن تغلق تماماً وتتدخل مضخة Na+/K+ لإعادة ضبط الراحة.",
      "4. الانتشار القفزي: في الألياف النخاعينية المغلفة بغمد النخاعين العازل، تتركز قنوات Na_v و K_v بكثافة في تضيقات رانفيي غير المعزولة فقط؛ تقفز التيارات المحلية من تضيق إلى آخر رافعة سرعة التوصيل إلى أكثر من 100 م/ثانية باقتصاد كبير في الطاقة.",
    ],
    evidenceAndObservation_ar: "تقنية Patch-Clamp على قطعة غشائية معزولة تظهر تسجيل تيارات داخلة سالبة خاطفة عند إزالة الاستقطاب يلغيها سم TTX، متبوعة بتيارات خارجة موجبة بطيئة يلغيها مركب TEA.",
    scientificReasoning_ar: "تثبيط التيار الداخل حصراً بسم TTX وتثبيط التيار الخارج بـ TEA يثبت وجود نوعين مستقلين من القنوات البروتينية المبوبة كهربائياً: قنوات Na_v وقنوات K_v.",
    biologicalConclusion_ar: "القنوات المبوبة كهربائياً هي المحركات الجزيئية لإشارة العمل، وتوزعها في تضيقات رانفيي يؤمن النقل العصبي فائق السرعة الضروري للتحكم العضلي والحسي.",
  },
  workedModel: {
    problem_ar: "تم حقن سم التيترودوتوكسين (TTX المستخرج من سمك الفهقة) في وسط فيزيولوجي يحوي ليفاً عصبياً، ثم طبق تنبيه فعال. سجل جهاز راسم الاهتزاز غياباً تاماً لكمون العمل وثبات الكمون عند -70 mV. عند غسل الليف واستبدال TTX بمركب رباعي إيثيل الأمونيوم (TEA) وتطبيق نفس التنبيه، سجل كمون عمل مبتور تميز بزوال استقطاب طبيعي (+30 mV) مع بطء شديد في عودة الاستقطاب وغياب تام لفرط الاستقطاب. فسر نتائج التجربتين وحدد دور كل قناة.",
    documentData_ar: "TTX يلغي كمون العمل كلياً؛ TEA يسمح بزوال الاستقطاب ويبطئ عودة الاستقطاب ويلغي فرط الاستقطاب.",
    observation_ar: "TTX يمنع انطلاق كمون العمل، بينما TEA يعطل مرحلة العودة وفرط الاستقطاب دون أن يمنع الصعود.",
    interpretation_ar: "مادة TTX تثبط نوعياً قنوات الصوديوم المبوبة كهربائياً (Na_v)؛ وبمنع دخول شوارد Na+ يتعذر زوال الاستقطاب وتفشل الخلية في بلوغ قمة كمون العمل فيغيب كلياً. مركب TEA يثبط نوعياً قنوات البوتاسيوم المبوبة كهربائياً (K_v) دون التأثير على Na_v؛ لذا حدث زوال الاستقطاب طبيعياً بتدفق Na+، ولكن بتعطيل قنوات K_v عجز البوتاسيوم عن الخروج السريع عبر قنواته الفولطية، فتمت عودة الاستقطاب ببطء شديد عبر قنوات التسرب فقط وغاب طور فرط الاستقطاب المرتبط بتأخر انغلاق K_v.",
    deduction_ar: "قنوات Na_v الفولطية مسؤولة حصراً عن طور زوال الاستقطاب، بينما قنوات K_v الفولطية مسؤولة عن سرعة عودة الاستقطاب وطور فرط الاستقطاب.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_act_l1",
      capabilityId: "snv_action_potential_voltage_gated_channels",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "ما هي الظاهرة الأيونية المسؤولة مباشرة عن طور 'زوال الاستقطاب' (Dépolarisation) أثناء كمون العمل؟",
      expectedResponse_ar: "الانفتاح السريع لقنوات الصوديوم المبوبة كهربائياً وتدفق شوارد Na+ السريع نحو الداخل.",
      reasoningSteps_ar: [
        "استرجاع الأطوار الأيونية لكمون العمل.",
        "زوال الاستقطاب = تيار صوديومي داخل سريع عبر قنوات Na_v.",
      ],
      biologicalModel_ar: {
        system_ar: "غشاء ليف عصبي في طور زوال الاستقطاب.",
        experimentalConditions_ar: "تنبيه كهربائي فعال يتجاوز العتبة.",
        governingBiologicalMechanisms_ar: ["الانفتاح الفولطي لقنوات Na_v والانجذاب الكهروكيميائي للـ Na+."],
        evidenceExtracted_ar: "دخول Na+ السريع وانعكاس القطبية إلى +30 mV.",
        deductionOrConclusion_ar: "المسؤول الحصري عن زوال الاستقطاب.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن زوال الاستقطاب سببه دخول الكالسيوم أو خروج البوتاسيوم يعكس خلطاً بين مشابك الإفراز وكمون عمل الليف.",
      },
      scoringRubric_ar: "درجة كاملة لاختيار انفتاح قنوات Na_v ودخول Na+ السريع.",
    },
    l2_application: {
      id: "snv_act_l2",
      capabilityId: "snv_action_potential_voltage_gated_channels",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "بين كيف يتم تشفير الرسالة العصبية على مستوى الليف العصبي المعزول عند زيادة شدة التنبيه الفعال فوق العتبة.",
      expectedResponse_ar: "التشفير يتم بتواتر كمونات العمل (Fréquence des potentiels d'action): عند زيادة شدة التنبيه، تبقى سعة كمون العمل ثابتة لا تتغير (تخضع لقانون الكل أو العدم)، بينما يزداد عدد وتواتر كمونات العمل المتولدة في وحدة الزمن؛ فكلما زادت شدة التنبيه تقاربت كمونات العمل وزاد تواترها.",
      reasoningSteps_ar: [
        "تذكر قانون الكل أو العدم (سعة ثابتة لا تزيد بزيادة التنبيه).",
        "تحديد نمط التشفير الكهربائي على طول الليف: التشفير التواتري (الترددي).",
      ],
      biologicalModel_ar: {
        system_ar: "الليف العصبي المعزول وجهاز التسجيل المهبطي.",
        experimentalConditions_ar: "تطبيق شدات تنبيه متزايدة فوق العتبة (ت1 < ت2 < ت3).",
        governingBiologicalMechanisms_ar: ["قانون الكل أو العدم والترميز التواتري الرقمي للسيالة."],
        evidenceExtracted_ar: "ثبات السعة وتزايد التواتر مع شدة المنبه.",
        deductionOrConclusion_ar: "الرسالة مشفرة بتواتر كمونات العمل في الليف.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن زيادة شدة التنبيه تزيد من سعة كمون العمل (الارتفاع) يناقض قانون الكل أو العدم الصارم للألياف المعزولة.",
      },
      scoringRubric_ar: "0.5 ن لذكر ثبات السعة وخضوعها لقانون الكل أو العدم، 0.5 ن لزيادة تواتر كمونات العمل في الثانية.",
    },
    l3_mixed: {
      id: "snv_act_l3",
      capabilityId: "snv_action_potential_voltage_gated_channels",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة تجربة تطبيق تنبيهين فعالين متتاليين (ت1 ثم ت2) على ليف عصبي مع تقليص الفاصل الزمني (Δt) بينهما: عند فاصل Δt = 10 ms نسجل كموني عمل متطابقين تماماً. عند تقليص الفاصل إلى Δt = 1.5 ms نسجل كمون العمل الأول فقط بينما لا يظهر أي أثر للتنبيه الثاني ت2. عند فاصل Δt = 3 ms نسجل كمون العمل الأول يليه كمون عمل ثانٍ بسعة منخفضة. فسر هذه النتائج انطلاقاً من مفهوم 'دور الاستعصاء' (Période réfractaire) والحالة الجزيئية لقنوات Na_v.",
      expectedResponse_ar: "التفسير: 1) عند فاصل Δt = 1.5 ms: يكون الليف في 'دور الاستعصاء المطلق' (Période réfractaire absolue) حيث تكون جميع قنوات الصوديوم الفولطية (Na_v) في حالة خمول غير نشط (Inactivée) ومغلقة ببوابات التعطيل الداخلية؛ وفي هذه الحالة يستحيل فتح القنوات مهما بلغت شدة التنبيه الثاني، فلا يتولد أي كمون عمل. 2) عند فاصل Δt = 3 ms: يدخل الليف في 'دور الاستعصاء النسبي' (Période réfractaire relative) حيث استعادت نسبة من قنوات Na_v جاهزيتها للانفتاح بينما لا تزال نسبة أخرى خاملة وقنوات K_v لا تزال مفتوحة؛ التنبيه ت2 يفتح فقط القنوات الجاهزة فيكون تدفق الصوديوم أقل، مما يولد كمون عمل بسعة أقل. 3) عند فاصل Δt = 10 ms: انتهى دور الاستعصاء تماماً واسترجعت 100% من قنوات Na_v حالتها المغلقة القابلة للتنشيط، فتولد كمون عمل ثانٍ بكامل سعته الطبيعية.",
      reasoningSteps_ar: [
        "ربط زمن 1.5 ms بدور الاستعصاء المطلق وخمول قنوات Na_v التام.",
        "ربط زمن 3 ms بدور الاستعصاء النسبي والاسترجاع الجزئي للقنوات.",
        "ربط زمن 10 ms بالاسترجاع الوظيفي الكامل للقنوات الفولطية.",
      ],
      biologicalModel_ar: {
        system_ar: "الحركية الانتقالية لقنوات الصوديوم الفولطية (مغلقة -> مفتوحة -> خاملة -> مغلقة).",
        experimentalConditions_ar: "تنبيه مزدوج متقارب زمنياً بتقنية التحفيز المتتالي.",
        governingBiologicalMechanisms_ar: ["دور الاستعصاء وحالة الخمول الغشائي."],
        evidenceExtracted_ar: "انعدام الاستجابة في 1.5 ms واستجابة جزئية في 3 ms وتامة في 10 ms.",
        deductionOrConclusion_ar: "دور الاستعصاء محكوم بالدورة الجزيئية لخمول قنوات Na_v.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "تفسير غياب كمون العمل الثاني بـ 'تعب الليف' أو 'نفاذ الطاقة' يعكس تفسيراً سطحياً يغفل الحالة البيوفيزيائية لقنوات Na_v.",
      },
      scoringRubric_ar: "0.5 ن لتفسير دور الاستعصاء المطلق وخمول القنوات، 0.5 ن لدور الاستعصاء النسبي، 1.0 ن للاستنتاج الجزيئي الدقيق.",
    },
    l4_transfer: {
      id: "snv_act_l4",
      capabilityId: "snv_action_potential_voltage_gated_channels",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "مرض التصلب اللويحي (Sclérose en plaques) مرض مناعي ذاتي يقوم فيه الجهاز المناعي بمهاجمة وتجريد الألياف العصبية من غمد النخاعين (Démyélinisation) في المادة البيضاء للجهاز العصبي المركزي. يؤدي تجريد النخاعين إلى هبوط كارثي في سرعة السيالة العصبية أو توقف انتقالها كلياً وحدوث شلل واضطرابات بصرية. فسر على المستوى الجزيئي والغشائي سبب توقف انتقال السيالة العصبية في المناطق منزوعة النخاعين مستنداً إلى توزع القنوات المبوبة كهربائياً.",
      expectedResponse_ar: "التفسير: في الألياف العصبية الطبيعية ذات النخاعين، تتركز القنوات المبوبة كهربائياً (Na_v و K_v) بكثافة هائلة حصراً في تضيقات رانفيي (Nœuds de Ranvier)، بينما يكون الغشاء المغطى بغمد النخاعين خالياً تماماً من هذه القنوات ومعزولاً كهربائياً، مما يفرض على السيالة الانتقال السريع قفزاً من تضيق لآخر (نقل قفزي). عند تآكل وتخريب غمد النخاعين بفعل الهجوم المناعي، يتعرى غشاء الليف العصبي في الأجزاء البينية؛ وبما أن هذا الجزء العاري لا يحتوي أصلاً على قنوات Na_v مبوبة كهربائياً، ولا يملك عزلاً كهربائياً يحفظ التيارات المحلية، فإن التيارات الكهربائية الصوديومية المتولدة في التضيق السابق تتسرب وتتبدد كلياً عبر الغشاء المائي المكشوف قبل أن تصل للتضيق الموالي، فلا تبلغ شدتها عتبة زوال الاستقطاب (-50 mV) ويعجز الليف عن تجديد كمون العمل، مما يؤدي إلى الحصار التام للرسالة العصبية وظهور أعراض الشلل وفقدان الوظائف العصبية.",
      reasoningSteps_ar: [
        "تحديد التوزيع الحصري لقنوات Na_v في تضيقات رانفيي فقط وغيابها في الأجزاء المغمدة.",
        "تفسير تبدد وتسرب التيارات المحلية في المساحات المكشوفة العارية.",
        "النتيجة: العجز عن بلوغ العتبة وتوقف انتشار الإشارة العصبية كلياً.",
      ],
      biologicalModel_ar: {
        system_ar: "الاعتلالات المزيلة للنخاعين في الجهاز العصبي المركزي.",
        experimentalConditions_ar: "مقارنة النقل القفزي السليم بالنقل المبتور في الألياف المتآكلة.",
        governingBiologicalMechanisms_ar: ["الانتشار القفزي وتبدد التيارات عبر المقاومة الغشائية المنخفضة."],
        evidenceExtracted_ar: "غياب القنوات الفولطية تحت النخاعين وتسرب التيارات بعد زوال العازل.",
        deductionOrConclusion_ar: "غمد النخاعين ضرورة هندسية لتأمين النقل القفزي السريع.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن غمد النخاعين هو الذي يولد كمون العمل خطأ؛ فالنخاعين عازل ميكانيكي كهربائي ومولدات الكمون هي القنوات الفولطية في تضيقات رانفيي.",
      },
      scoringRubric_ar: "1 ن لتفسير التمركز الحصري للقنوات في تضيقات رانفيي، 1 ن لتفسير تبدد التيارات وفشل بلوغ العتبة.",
    },
    l5_bac_style: {
      id: "snv_act_l5",
      capabilityId: "snv_action_potential_voltage_gated_channels",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا (استدلال علمي): يستخدم أطباء الأسنان مخدر 'الليدوكايين' (Lidocaïne) موضعياً لإلغاء الشعور بالألم أثناء جراحة الأسنان. يمثل الشكل (1) قياس التيارات الأيونية الغشائية لليف عصبي حسي بتقنية Patch-Clamp قبل وبعد تطبيق الليدوكايين بتركيزين مختلفين (1 mM و 5 mM). يمثل الشكل (2) نموذجاً جزيئياً ثلاثي الأبعاد يبين تثبت جزيء الليدوكايين داخل التجويف الداخلي المسامي لقناة الصوديوم المبوبة كهربائياً (Na_v). 1) استخرج من الشكل (1) تأثير الليدوكايين على التيارات الأيونية الغشائية. 2) اشرح انطلاقاً من الشكلين (1) و (2) الآلية الجزيئية الدقيقة التي يمنع بها الليدوكايين انتقال الإحساس بالألم إلى الدماغ. 3) بين لماذا يزول مفعول المخدر تدريجياً بعد ساعات ويستعيد المريض الإحساس بالألم الطبيعي.",
      expectedResponse_ar: [
        "1) استخراج تأثير الليدوكايين من الشكل (1): نلاحظ في غياب الليدوكايين تسجيل تيار شاردي داخل سريع لسعة كبيرة يوافق تدفق Na+ المولد لزوال الاستقطاب. عند إضافة الليدوكايين بتركيز 1 mM، ينخفض تيار الصوديوم الداخل بنسبة 60%؛ وعند رفع التركيز إلى 5 mM ينعدم تيار الصوديوم الداخل كلياً (0%) دون التأثير على تيار البوتاسيوم الخارج المتأخر. نستنتج أن الليدوكايين يثبط نوعياً التيار الشاردي الداخلي للصوديوم بطريقة تعتمد على الجرعة.",
        "2) الآلية الجزيئية لمنع الإحساس بالألم: ترتبط جزيئات الليدوكايين المنحلة بالدهون بالمسام الداخلي لقنوات الصوديوم المبوبة كهربائياً (Na_v) في الألياف العصبية الحسية الناقلة للألم، وتسد الفتحة الأيونية للقناة سداً فيزيائياً مباشراً؛ هذا الانسداد يمنع تدفق شوارد Na+ نحو الهيولى عند وصول التنبيهات المؤلمة، فيتعذر حدوث زوال الاستقطاب ولا يبلغ الكمون الغشائي عتبة التنبيه، مما يؤدي إلى فشل توليد كمونات العمل الحسية وغياب أي رسائل عصبية متجهة نحو القشرة المخية، وبالتالي غياب تام للشعور بالألم في المنطقة المعالجة.",
        "3) زوال مفعول المخدر واستعادة الإحساس: ارتباط الليدوكايين بالمسام الداخلي لقنوات Na_v هو ارتباط عكوس وغير تساهمي (روابط ضعيفة)، وبفعل الجريان الدموي المستمر والتروية النسيجية، تنفصل جزيئات المخدر تدريجياً عن القنوات وتنتقل إلى الدورة الدموية العامة ليتم تفكيكها أيضياً في الكبد وإطراحها عبر الكلى؛ وبتحرر قنوات Na_v تستعيد جاهزيتها الكاملة للانفتاح وتستأنف توليد كمونات العمل عند التنبيه، فيعود الإحساس بالألم طبيعياً.",
      ],
      reasoningSteps_ar: [
        "استخراج التثبيط الانتقائي المعتمد على الجرعة لتيار الصوديوم الداخل.",
        "تفسير السد المسامي الفيزيائي لقنوات Na_v ومنع زوال الاستقطاب وكمون العمل الحسي.",
        "تعليل زوال المفعول بالعكوسية والتفكيك الكبدي والإطراح الكلوي التدريجي.",
      ],
      biologicalModel_ar: {
        system_ar: "التخدير الموضعي وقنوات الصوديوم الفولطية للألياف العصبية الحسية.",
        experimentalConditions_ar: "دراسة دوائية بالباتش كلامب والنمذجة الجزيئية.",
        governingBiologicalMechanisms_ar: ["الحصار المسامي المباشر لقنوات Na_v وإلغاء التيارات الصاعدة."],
        evidenceExtracted_ar: "تلاشي تيار الصوديوم وسد المسام الداخلي بواسطة الليدوكايين.",
        deductionOrConclusion_ar: "التسكين الموضعي يتم بتعطيل توليد ونقل الإشارات العصبية في مهدها.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن الليدوكايين يقتل العصب أو يخرب الألياف بصورة دائمة يناقض تماماً عودة الإحساس الطبيعي بعد زوال التخدير.",
      },
      scoringRubric_ar: "1.0 ن لاستخراج التثبيط النوعي من الشكل 1، 2.5 ن لشرح الآلية الجزيئية لسد القنوات ومنع الكمون، 1.5 ن لتعليل زوال المفعول بالعكوسية (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين قنوات Na_v و قنوات K_v، أو الاعتقاد بأن كمون العمل ينتشر في الاتجاهين ارتدادياً في العضوية.",
    wrongMentalModel_ar: "الاعتقاد بأن كمون العمل ينعكس ويرتد إلى الخلف بعد مروره، أو أن قنوات الصوديوم والبوتاسيوم تفتح وتغلق في نفس اللحظة.",
    correctMentalModel_ar: "قنوات Na_v تفتح فورياً وتغلق بسرعة وتدخل في خمول (دور استعصاء يمنع الارتداد تماماً)، بينما قنوات K_v تفتح متأخرة وتغلق ببطء (مسببة فرط الاستقطاب)؛ والانتشار دائماً في اتجاه واحد نحو المشبك.",
    threeStepActionProtocol_ar: [
      "1. زوال الاستقطاب = انفتاح قنوات Na_v ودخول Na+ السريع (+30 mV).",
      "2. عودة الاستقطاب = انغلاق Na_v وانفتاح قنوات K_v وخروج K+ المتأخر.",
      "3. اتجاه السيالة: أحادي دوماً بسبب خمول قنوات Na_v في دور الاستعصاء الذي يمنع رجوع الموجة إلى الخلف.",
    ],
    microDrill_ar: {
      prompt_ar: "لماذا لا ترتد موجة زوال الاستقطاب إلى الوراء أثناء انتشارها على طول المحور العصبي؟",
      solution_ar: "لأن المنطقة السابقة التي عبرها كمون العمل تكون في دور استعصاء مطلق حيث تكون قنوات الصوديوم Na_v خاملة وغير قابلة للانفتاح، مما يفرض حركة السيالة إلى الأمام فقط.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_act_retest_01",
    invariantTested_ar: "تثبيط قنوات الصوديوم الفولطية Na_v وآلية التسكين العصبي.",
    changedSurface_ar: "تطبيق على سم العقرب ذو الذيفان الذي يمنع انغلاق قنوات Na_v ويبقيها مفتوحة بصفة مستمرة.",
    prompt_ar: "ذيفان عقربي خطير يرتبط بقنوات الصوديوم المبوبة كهربائياً (Na_v) ويمنع انغلاقها، مما يبقيها مفتوحة باستمرار بعد التنبيه. فسر عواقب هذا السم على مخطط كمون العمل وعلى استرخاء العضلات التي يعصبها هذا الليف.",
    solution_ar: "التفسير: يؤدي بقاء قنوات Na_v مفتوحة باستمرار إلى استمرار تدفق شوارد الصوديوم الموجبة نحو الداخل، مما يتعذر معه حدوث عودة الاستقطاب الطبيعية ويجعل الغشاء معلقاً في حالة زوال استقطاب دائم. يؤدي هذا التنشيط المستمر إلى إرسال قطار متواصل وعشوائي من الإشارات العصبية نحو المشابك العضلية، مما يتسبب في إفراز دائم للأستيل كولين وحدوث تقلص تشنجي مستمر للعضلات (Spasmes tétaniques) دون أي استرخاء، مما قد يفضي للوفاة بالاختناق لتشنج عضلات القفص الصدري.",
    passCondition_ar: "ربط عدم انغلاق Na_v بزوال الاستقطاب المستمر وفشل عودة الاستقطاب وتشنج العضلات الدائم.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: الفعالية العصبية الفائقة للألياف النخاعينية واقتصاد الطاقة الحيوية",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "تمتلك الثدييات نوعين من الألياف العصبية: ألياف عديمة النخاعين (Amélinisées) بقطر 1 μm وسرعة نقل 1 m/s، وألياف نخاعينية (Myélinisées) بنفس القطر وسرعة نقل تفوق 50 m/s. تم قياس استهلاك الأكسجين وجزيئات ATP لكل 1000 كمون عمل منقول في كلا النوعين، فتبين أن الألياف النخاعينية تستهلك طاقة ATP أقل بـ 300 مرة من الألياف عديمة النخاعين. 1) فسر كيف يؤدي وجود غمد النخاعين إلى زيادة سرعة نقل السيالة العصبية بـ 50 ضعفاً. 2) علل انخفاض استهلاك الطاقة الحيوية ATP في الألياف النخاعينية بربطه بآلية كمون العمل ومضخة Na+/K+. 3) استنتج الأهمية التطورية لظهور الألياف النخاعينية في الجهاز العصبي للفقاريات.",
    modelSolution_ar: [
      "1) تفسير زيادة سرعة النقل: غمد النخاعين مادة دهنية فوسفوليبيدية عازلة للكهرباء ذات مقاومة كهربائية عالية جداً تلف المحور العصبي، باستثناء فجوات مجهرية منتظمة تسمى تضيقات رانفيي (Nœuds de Ranvier). يمنع هذا الغلاف العازل تسرب التيارات الأيونية عبر الغشاء في المناطق المغمدة، مما يجبر الشحنات الكهربائية على القفز عبر تيارات محلية بينية من تضيق رانفيي إلى التضيق المجاور له مباشرة (النقل القفزي Conduction saltatoire). وبما أن إزالة الاستقطاب وتدفق الشوارد ينحصران فقط في المساحات الضئيلة لتضيقات رانفيي بدلاً من تحفيز الغشاء نقطة بنقطة على كامل طول المحور، فإن سرعة انتشار موجة زوال الاستقطاب ترتفع قفزياً بأكثر من 50 ضعفاً.",
      "2) تعليل انخفاض استهلاك ATP: في الألياف عديمة النخاعين، يتم تبادل شوارد Na+ و K+ على امتداد كامل مساحة الغشاء، مما يدخل مليارات الشوارد التي تتطلب عملاً جباراً ومضنياً لمضخة Na+/K+ ATPase لاستهلاك كميات هائلة من ATP لإعادة ضبط التراكيز. أما في الألياف النخاعينية، فإن تبادل الشوارد وتدفقها عبر قنوات Na_v و K_v محصور بدقة في تضيقات رانفيي التي لا تمثل سوى أقل من 0.5% من إجمالي مساحة سطح المحور؛ هذا يعني أن عدد الشوارد المتدفقة إجمالاً قليل جداً، وبالتالي يتطلب إعادة ضخها مجهوداً طاقياً متواضعاً من المضخات، مما يفسر انخفاض استهلاك طاقة ATP بأكثر من 300 مرة مقارنة بالألياف غير النخاعينية.",
      "3) الأهمية التطورية للألياف النخاعينية: وفر ظهور غمد النخاعين للفقاريات ميزتين بيولوجيتين حاسمتين: أ) سرعة استجابة فائقة وردود أفعال لحظية تحمي الكائن من المخاطر وتؤمن التنسيق الحركي الدقيق. ب) ترشيد واقتصاد هائل في استهلاك الطاقة الأيضية وحجم النسيج العصبي، مما أتاح بناء أدمغة ضخمة ومعقدة تضم مليارات العصبونات المتراصة في حيز مكاني وطاقي محدود دون استنزاف مفرط لغذاء الكائن الحي.",
    ],
    markingScheme_ar: [
      { criterion: "تفسير النقل القفزي ودور العزل النخاعيني في تضيقات رانفيي", points: 2.0 },
      { criterion: "تعليل اقتصاد الطاقة بحصر التبادل الشاردي وعمل المضخة في تضيقات رانفيي فقط", points: 2.0 },
      { criterion: "استنتاج الأهمية التطورية التنسيقية والطاقية في الفقاريات", points: 1.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 186-205)",
    historicalBacRef: "BAC 2020 Sciences Expérimentales Sujet 2 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 11. snv_synaptic_transmission_summation_integration
// ============================================================================

export const SNV_SYNAPTIC_TRANSMISSION_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_synaptic_transmission_summation_integration",
  canonicalTitle_ar: "الاتصال العصبي: النقل المشبكي والإدماج العصبي",
  canonicalTitle_fr: "Communication nerveuse : transmission synaptique et intégration neuronale",
  discipline: "natural_sciences",
  domain: "التخصص الوظيفي للبروتينات",
  unit: "دور البروتينات في الاتصال العصبي",
  status: "APPROVED",
  scopeIn: [
    "بنية المشبك الكيميائي: الغشاء قبل المشبكي، الشق المشبكي، والغشاء بعد المشبكي الحامل للمستقبلات القنوية.",
    "آلية النقل المشبكي: وصول كمونات العمل قبل المشبكية، انفتاح قنوات Ca2+ الفولطية، تدفق Ca2+، وهجرة والتحام حويصلات الإطراح وتحرير الوسيط الكيميائي (مثل الأستيل كولين أو GABA).",
    "تثبت الوسيط العصبي على المستقبلات القنوية الكيميائية (المبوبة كيميائياً):",
    "- المشابك التنبيهية (PPSE): انفتاح قنوات Na+ الكيميائية وتدفق Na+ مسبباً زوال استقطاب بعد مشبكي تنبيهي.",
    "- المشابك التثبيطية (PPSI): انفتاح قنوات Cl- الكيميائية وتدفق Cl- مسبباً فرط استقطاب بعد مشبكي تثبيطي.",
    "إلغاء مفعول الوسيط العصبي: التفكيك الأنزيمي (أستيل كولين إستراز AChE) أو إعادة الامتصاص قبل المشبكي.",
    "الإدماج العصبي (Intégration neuronale): التجميع الفضائي (Sommation spatiale) والتجميع الزمني (Sommation temporelle) على مستوى القطعة الابتدائية (S.I.) للعصبون المحرك وتوليد كمون العمل إذا بلغت المحصلة عتبة التنبيه.",
    "تأثير السموم والمخدرات على المشابك (الكورار، سم البوتولينوم، الغازات العصبية، الفاليوم، والمورفين).",
  ],
  scopeOut: [
    "المشابك الكهربائية الثنائية (Gap junctions) الخاصة بعلم الأنسجة المتقدم.",
    "المسارات البيوكيميائية للرسول الثاني داخل العصبون (AMPc, Protéine G) غير المقررة على شعبة علوم تجريبية.",
  ],
  prerequisites: {
    hard: ["snv_action_potential_voltage_gated_channels"],
    soft: ["مفهوم الإفراز الخلوي والحويصلات والتركيز التدرجي"],
    foundation: ["بنية المشابك والمنعكس العضلي والنخاع الشوكي"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_SYN_01",
      bloomLevel: "analyze",
      description_ar: "يحلل خطوات النقل المشبكي الكيميائي ويربط تدفق شوارد Ca2+ بتحرير المبلغ العصبي وخصائص المستقبلات القنوية.",
    },
    {
      code: "LO_SNV_SYN_02",
      bloomLevel: "understand",
      description_ar: "يميز بين المشبك التنبيهي والمشبك التثبيطي انطلاقاً من طبيعة المبلغ والشوارد المتدفقة (Na+ لـ PPSE مقابل Cl- لـ PPSI).",
    },
    {
      code: "LO_SNV_SYN_03",
      bloomLevel: "apply",
      description_ar: "يحسب المحصلة الجبرية للإدماج العصبي (التجميع الفضائي والزمني) على مستوى القطعة الابتدائية S.I. ويتوقع الاستجابة.",
    },
  ],
  coreConcepts_ar: [
    "المشبك موقع اتصال وظيفي يربط بين عصبون وخلية أخرى، ويتم فيه تحويل الرسالة الكهربائية إلى رسالة كيميائية مشفرة بتركيز الوسيط العصبي.",
    "دخول شوارد Ca2+ عبر القنوات الفولطية للزر قبل المشبكي هو الإشارة الآمرة بهجرة الحويصلات وإطراح المبلغ العصبي في الشق المشبكي.",
    "المستقبلات بعد المشبكية قنوات مبوبة كيميائياً: انفتاح قنوات Na+ يولد زوال استقطاب تنبيهي (PPSE)، وانفتاح قنوات Cl- يولد فرط استقطاب تثبيطي (PPSI).",
    "يدمج العصبون المحرك في القطعة الابتدائية (S.I.) مجموع كمونات PPSE و PPSI جمعاً جبرياً فضائياً وزمنياً، فإذا بلغت المحصلة العتبة يولد كمون عمل بعد مشبكي.",
  ],
  lessonPackage: {
    overview_ar: "تعمل المشابك كبوابات تحكم ذكية في الجهاز العصبي، حيث لا تكتفي بنقل الإشارات بل تدمجها وتفلترها وتعدلها عبر التوازن الدقيق بين التنبيه والتثبيط.",
    biologicalMechanism_ar: [
      "1. تحرير الوسيط: يؤدي وصول كمون العمل لنهاية المحور إلى فتح قنوات Ca2+ الفولطية، وتدفق Ca2+ يحفز اندماج حويصلات الوسيط (مثل الأستيل كولين) مع الغشاء وتحريرها في الشق المشبكي.",
      "2. التأثير بعد المشبكي: يرتبط الوسيط بمستقبلاته القنوية الكيميائية؛ في المشبك التنبيهي تفتح قنوات Na+ فيتدفق Na+ للداخل مسبباً زوال استقطاب موضعي (PPSE)؛ وفي المشبك التثبيطي يفرز GABA فيفتح قنوات Cl- مسبباً تدفق Cl- وفرط استقطاب (PPSI).",
      "3. إيقاف الإشارة: يفكك إنزيم الأستيل كولين إستراز (AChE) الوسيط فورياً إلى كولين وحمض الخل ويعاد امتصاص الكولين، أو يعاد التقاط GABA، مما يغلق القنوات ويمنع التنبيه المستمر.",
      "4. الإدماج العصبي: تتجمع إشارات PPSE و PPSI الواردة من مشابك مختلفة (تجميع فضائي) أو المتتالية بسرعة من نفس المشبك (تجميع زمني) وتنتقل إلى القطعة الابتدائية (S.I.)؛ إذا كانت المحصلة الجبرية Σ(PPSE) - Σ(PPSI) ≥ عتبة التنبيه (-50 mV) تتولد كمونات عمل بعد مشبكية؛ وإذا كانت دون العتبة تتلاشى الإشارة ولا يمر أي كمون.",
    ],
    evidenceAndObservation_ar: "تنبيه متزامن لعصبونين قبليين (ع1 تنبيهي وع2 تثبيطي) متصلين بنفس العصبون المحرك: عند تنبيه ع1 منفرداً نسجل PPSE بسعة 12 mV يولد كمون عمل؛ وعند تنبيه ع2 منفرداً نسجل PPSI بسعة -8 mV؛ وعند تنبيه ع1 و ع2 معاً في نفس اللحظة نسجل زوال استقطاب ضعيفاً بسعة 4 mV يعجز عن بلوغ العتبة فلا يتولد كمون عمل.",
    scientificReasoning_ar: "تسجيل محصلة 4 mV عند التنبيه المتزامن (+12 + (-8) = +4 mV) يثبت رياضياً وبيولوجياً أن العصبون بعد المشبكي يقوم بجمع جبري فضائي دقيق للكمونات التنبيهية والتثبيطية لتحديد القرار الحركي.",
    biologicalConclusion_ar: "الإدماج العصبي هو الحساب الحيوي الذي يعالج به الجهاز العصبي آلاف الإشارات المتضاربة لتنسيق المنعكسات وحماية الجسم من التشنجات والحركات المتضاربة.",
  },
  workedModel: {
    problem_ar: "يتلقى عصبون محرك نخاعي ثلاثة مشابك عصبية قبل مشبكية: المشبك (أ) تنبيهي يولد PPSE بقيمة +10 mV عند العصبون المحرك. المشبك (ب) تنبيهي يولد PPSE بقيمة +8 mV. المشبك (ج) تثبيطي يولد PPSI بقيمة -6 mV. علماً أن كمون الراحة للعصبون المحرك هو -70 mV وعتبة توليد كمون العمل عند القطعة الابتدائية S.I. هي -55 mV. 1) احسب عتبة زوال الاستقطاب اللازمة لانطلاق كمون العمل. 2) ما هي الاستجابة المسجلة عند تنبيه المشبكين (أ) و (ب) معاً في نفس اللحظة؟ 3) ما هي الاستجابة المسجلة عند تنبيه المشابك الثلاثة (أ) و (ب) و (ج) معاً في نفس اللحظة؟",
    documentData_ar: "الكمون = -70 mV، العتبة = -55 mV، المشبك أ = +10، ب = +8، ج = -6.",
    observation_ar: "فارق الجهد المطلوب لبلوغ العتبة هو الانتقال من -70 إلى -55 mV.",
    interpretation_ar: "1) العتبة اللازمة لزوال الاستقطاب: ΔV = (-55) - (-70) = +15 mV. يجب أن تبلغ محصلة التجميع الجبري +15 mV على الأقل لفتح قنوات Na_v عند القطعة الابتدائية S.I. 2) عند تنبيه (أ) و (ب) معاً: المحصلة الجبرية الفضائية = (+10) + (+8) = +18 mV. بما أن +18 mV > +15 mV (تم تجاوز العتبة)، فإن القطعة الابتدائية تفتح قنواتها الفولطية ونسجل كمون عمل بعد مشبكي ينتشر على طول المحور المحرك. 3) عند تنبيه (أ) و (ب) و (ج) معاً: المحصلة الجبرية = (+10) + (+8) + (-6) = +12 mV. بما أن +12 mV < +15 mV (دون العتبة)، يعجز العصبون عن بلوغ عتبة التنبيه ونسجل فقط زوال استقطاب دون عتبي موضعي يتلاشى دون توليد أي كمون عمل.",
    deduction_ar: "يقوم العصبون المحرك بدمج كمونات المشابك بالجمع الجبري؛ ولا يتولد كمون العمل إلا إذا فاقت المحصلة العتبة الحرجة (+15 mV).",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_syn_l1",
      capabilityId: "snv_synaptic_transmission_summation_integration",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 3,
      prompt_ar: "ما هي الشاردة المسؤولة عن توليد كمون الغشاء بعد المشبكي التثبيطي (PPSI) عند انفتاح المستقبلات القنوية الخاصة بمبلغ الـ GABA؟",
      expectedResponse_ar: "شاردة الكلور السالبة (Cl-) التي تتدفق من الشق المشبكي نحو هيولى العصبون بعد المشبكي مسببة فرط استقطاب.",
      reasoningSteps_ar: [
        "استرجاع الآلية الشاردية للمشبك التثبيطي.",
        "مبلغ GABA يفتح قنوات الكلور الكيميائية -> تدفق Cl- نحو الداخل -> فرط استقطاب PPSI.",
      ],
      biologicalModel_ar: {
        system_ar: "غشاء بعد مشبكي تثبيطي يحمل مستقبلات GABA-A.",
        experimentalConditions_ar: "تثبيت كمون الغشاء والقياس الشاردي.",
        governingBiologicalMechanisms_ar: ["انفتاح قنوات الكلور المبوبة كيميائياً."],
        evidenceExtracted_ar: "دخول Cl- السالب يرفع السلبية الداخلية (فرط استقطاب).",
        deductionOrConclusion_ar: "الآلية الشاردية لتوليد الـ PPSI.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اختيار شاردة الصوديوم Na+ يمثل خلطاً معكوساً فادحاً بين المشبك التنبيهي (دخول Na+) والمشبك التثبيطي (دخول Cl-).",
      },
      scoringRubric_ar: "درجة كاملة لاختيار شاردة الكلور Cl- المتدفقة للداخل.",
    },
    l2_application: {
      id: "snv_syn_l2",
      capabilityId: "snv_synaptic_transmission_summation_integration",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 5,
      prompt_ar: "قارن بين المستقبلات القنوية المبوبة كيميائياً (في المشبك) والقنوات المبوبة كهربائياً (في الليف) من حيث: موقع التواجد، وعامل التحكم في الانفتاح.",
      expectedResponse_ar: "المقارنة: 1) القنوات المبوبة كيميائياً: تتواجد حصراً على مستوى الغشاء بعد المشبكي، وعامل انفتاحها هو الارتباط النوعي للوسيط الكيميائي العصبي بمستقبلها الغشائي. 2) القنوات المبوبة كهربائياً: تتواجد على طول غشاء المحور العصبي وفي القطعة الابتدائية S.I. وتضيقات رانفيي، وعامل انفتاحها هو التغير الكهربائي في كمون الغشاء (بلوغ عتبة زوال الاستقطاب).",
      reasoningSteps_ar: [
        "تحديد التموضع الغشائي لكل نمط (غشاء بعد مشبكي مقابل محور أسطواني).",
        "تحديد المثير الفيزيائي/الكيميائي المسبب للانفتاح (مبلغ كيميائي مقابل تغير كمون الغشاء).",
      ],
      biologicalModel_ar: {
        system_ar: "أنماط القنوات الأيونية البروتينية في الاتصال العصبي.",
        experimentalConditions_ar: "دراسة خلوية مقارنة للمستقبلات والقنوات الغشائية.",
        governingBiologicalMechanisms_ar: ["التبويب الكيميائي Ligand-gated مقابل التبويب الكهربائي Voltage-gated."],
        evidenceExtracted_ar: "اختلاف مواقع التواجد وشروط التشغيل.",
        deductionOrConclusion_ar: "التكامل بين الإشارة الكيميائية الموضعية والإشارة الكهربائية المنتشرة.",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "الاعتقاد بأن القنوات الكيميائية توجد في المحور الأسطواني يغفل حصرها الصارم في الغشاء بعد المشبكي.",
      },
      scoringRubric_ar: "0.5 ن لمقارنة موقع التواجد، 0.5 ن لمقارنة عامل التحكم في الانفتاح.",
    },
    l3_mixed: {
      id: "snv_syn_l3",
      capabilityId: "snv_synaptic_transmission_summation_integration",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 8,
      prompt_ar: "تمثل الوثيقة قياس تركيز الكالسيوم الداخلي في النهاية قبل المشبكية وكمية الأستيل كولين المحررة وسعة الـ PPSE في ثلاث حالات: الحالة 1: تنبيه عادي في وسط يحوي Ca2+ -> دخول كثيف لـ Ca2+، تحرير 100 وحدة وسيط، PPSE بسعة 15 mV. الحالة 2: تنبيه عادي في وسط خالٍ من Ca2+ بإضافة مادة حاجبة -> عدم دخول Ca2+، عدم تحرير الوسيط (0)، وعدم تسجيل أي PPSE (0 mV). الحالة 3: حقن مباشر لشوارد Ca2+ داخل النهاية قبل المشبكية دون تطبيق أي تنبيه كهربائي -> تحرير فوري لـ 100 وحدة وسيط وتسجيل PPSE بسعة 15 mV. حلل التجارب تحليلاً مقارناً واستنتج دور شوارد Ca2+ في النقل المشبكي.",
      expectedResponse_ar: "التحليل المقارن: نلاحظ في الحالة 1 أن التنبيه في وجود Ca2+ يؤدي لتدفقه للداخل محرراً الوسيط العصبي ومحدثاً زوال استقطاب بعد مشبكي. في الحالة 2، عند غياب Ca2+ ورغم تطبيق التنبيه الكهربائي، لم يفرز الوسيط ولم يتولد أي كمون بعد مشبكي دلالة على عجز التنبيه الكهربائي بمفرده عن إفراز الوسيط. في الحالة 3، أدى مجرد إدخال شوارد Ca2+ للداخل دون أي تنبيه كهربائي إلى إفراز كامل للوسيط وتوليد نفس الـ PPSE الطبيعي. الاستنتاج: شوارد الكالسيوم (Ca2+) هي الوسيط الداخلي والإشارة المباشرة الحتمية والضرورية والكافية لتحفيز هجرة والتحام حويصلات الوسيط العصبي بالغشاء قبل المشبكي وإفراغ محتواها بالشق المشبكي.",
      reasoningSteps_ar: [
        "تحليل فشل التنبيه في غياب Ca2+ (الحالة 2).",
        "تحليل كفاية Ca2+ بمفرده لإحداث الإفراز دون تنبيه (الحالة 3).",
        "الاستنتاج: Ca2+ هو المحرك والمفتاح الإلزامي للإطراح الخلوي المشبكي.",
      ],
      biologicalModel_ar: {
        system_ar: "النهاية المشبكية والاقتران الكهربائي-الإفرازي.",
        experimentalConditions_ar: "تعديل شوارد الكالسيوم والحقن المجهري الداخلي.",
        governingBiologicalMechanisms_ar: ["الإطراح الخلوي المشروط بتدفق شوارد Ca2+."],
        evidenceExtracted_ar: "غياب الإفراز بغياب Ca2+، وحدوث الإفراز بحقن Ca2+ منفرداً.",
        deductionOrConclusion_ar: "الكالسيوم هو الميكانيزم الحتمي لتحرير النواقل العصبية.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "استنتاج أن التنبيه الكهربائي لا فائدة له يغفل أن التنبيه الكهربائي هو الذي يفتح قنوات Ca2+ الفولطية في الحالة الطبيعية.",
      },
      scoringRubric_ar: "0.5 ن لتحليل الحالتين 1 و 2، 0.5 ن لدلالة الحالة 3، 1.0 ن لاستنتاج دور Ca2+ الحتمي.",
    },
    l4_transfer: {
      id: "snv_syn_l4",
      capabilityId: "snv_synaptic_transmission_summation_integration",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "غاز السارين (Sarin) سلاح كيميائي خطير يثبط نهائياً وتساهمياً إنزيم أستيل كولين إستراز (AChE) في المشابك العصبية العضلية. يتعرض المصاب بهذا الغاز لتشنج وتصلب عضلي مستمر يتبعه شلل اختناقي وموت سريع. فسر على المستوى المشبكي الجزيئي كيف يؤدي تثبيط إنزيم AChE إلى التشنج العضلي المستمر ثم الموت.",
      expectedResponse_ar: "التفسير الجزيئي: في الحالة الطبيعية، يقوم إنزيم أستيل كولين إستراز بتفكيك الأستيل كولين في الشق المشبكي خلال أجزاء من الميلي ثانية إلى كولين وحمض الخل، مما ينهي مفعوله ويسمح بانغلاق قنوات Na+ الكيميائية واسترخاء الليف العضلي استعداداً لأوامر جديدة. عند تثبيط إنزيم AChE بواسطة غاز السارين، يتعذر تفكيك الأستيل كولين ويظل متراكماً بتركيز عالٍ ومستمراً في الارتباط بمستقبلاته القنوية بعد المشبكية دون انقطاع؛ يؤدي هذا إلى بقاء قنوات الصوديوم مفتوحة بصفة دائمة وتدفق مستمر لشوارد Na+، مما يولد سلسلة لا نهائية ومكثفة من كمونات العمل العضلية تسبب تشنجاً عضلياً مفرطاً وتصلباً لا إرادياً. وعندما يصيب هذا التشنج الدائم عضلات الحجاب الحاجز والقفص الصدري، تعجز الرئتان عن أداء حركات الشهيق والزفير، فيموت الضحية سريعاً بالاختناق ونقص الأكسجين الحاد.",
      reasoningSteps_ar: [
        "تحديد الدور الطبيعي لإنزيم AChE في إيقاف الإشارة المشبكية.",
        "تفسير تراكم الأستيل كولين وبقاء قنوات Na+ مفتوحة والتدفق المستمر للسيالات.",
        "ربط التشنج الدائم لعضلات التنفس بالاختناق والوفاة.",
      ],
      biologicalModel_ar: {
        system_ar: "المشبك العصبي العضلي وتأثير الغازات السامة للأعصاب.",
        experimentalConditions_ar: "تثبيط غير عكوس لإنزيم التفكيك المشبكي.",
        governingBiologicalMechanisms_ar: ["التحفيز المشبكي المستمر والعجز عن الاسترخاء الخلوي."],
        evidenceExtracted_ar: "تراكم الأستيل كولين -> فتح دائم للقنوات -> تشنج اختناقي قاتل.",
        deductionOrConclusion_ar: "إنهاء الإشارة المشبكية لا يقل أهمية حيوية عن إطلاقها.",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن غاز السارين يمنع إفراز الأستيل كولين يعكس خلطاً بينه وبين سم البوتولينوم (البوتوكس) الذي يمنع التحرير ويسبب شللاً رخواً.",
      },
      scoringRubric_ar: "1 ن لتفسير تراكم الأستيل كولين وبقاء قنوات Na+ مفتوحة، 1 ن للربط بالتشنج الدائم وعضلات التنفس والموت.",
    },
    l5_bac_style: {
      id: "snv_syn_l5",
      capabilityId: "snv_synaptic_transmission_summation_integration",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 15,
      prompt_ar: "تمرين بكالوريا (مهمة مركبة): في تجربة على المنعكس العضلي، يتلقى العصبون المحرك للعضلة الباسطة للساق مشبكين: مشبكاً تنبيهياً من الليف الحسي للعضلة الباسطة نفسها (عصبون حسي Ia يفرز الأستيل كولين)، ومشبكاً تثبيطياً من عصبون جامع (Interneurone يفرز GABA منشط من العضلة القابضة المضادة). يمثل الشكل (1) بنية المشبكين ومواقع التسجيل. يمثل الشكل (2) تسجيلات الكمونات الغشائية عند العصبون المحرك في حالات تنبيه مختلفة. 1) فسر آلية توليد فرط الاستقطاب (PPSI) في المشبك التثبيطي بواسطة عصبون الـ GABA. 2) وضح بالرسم البياني والشرح كيف يدمج العصبون المحرك التنبيه الحسي مع التثبيط الوارد من العضلة المضادة في حركة المنعكس الرضفي. 3) قدم رسماً تخطيطياً وظيفياً شاملاً للمشبك الكيميائي التنبيهي موضحاً كامل البيانات الوظيفية.",
      expectedResponse_ar: [
        "1) آلية توليد الـ PPSI بواسطة GABA: عند وصول كمون العمل إلى نهاية العصبون الجامع، تفتح قنوات Ca2+ الفولطية مسببة هجرة حويصلات GABA وإفرازها في الشق المشبكي؛ يرتبط مبلغ الـ GABA بمستقبلاته القنوية النوعية على الغشاء بعد المشبكي للعصبون المحرك، مما يحفز انفتاح قنوات شوارد الكلور (Cl-) الكيميائية. تتدفق شوارد Cl- السالبة من الشق المشبكي نحو هيولى العصبون المحرك وفق تدرج تركيزها، مما يزيد من السلبية الداخلية للغشاء ويهبط بالكمون من -70 mV إلى -75 mV محدثاً فرط استقطاب بعد مشبكي تثبيطي (PPSI) يخفض قابلية الخلية للتنبيه.",
        "2) دمج الإشارات في المنعكس الرضفي: أثناء ضرب الوتر الرضفي، تتمدد العضلة الباسطة فترسل أليافها الحسية قطاراً من كمونات العمل إلى النخاع الشوكي يتفرع إلى طريقين: طريق مباشر يولد كمونات تنبيهية قوية Σ(PPSE) في العصبون المحرك للعضلة الباسطة، وطريق غير مباشر ينشط العصبون الجامع ليولد كمونات تثبيطية Σ(PPSI) في العصبون المحرك للعضلة القابضة المعاكسة. يقوم العصبون المحرك للباسطة بدمج التنبيه القوي الذي يفوق العتبة فيتقلص الفخذ، بينما يقوم العصبون المحرك للقابضة بجمع التثبيط الوارد فيثبط كمونه تماماً وتبقى العضلة القابضة في حالة استرخاء تام، مما يضمن حدوث الحركة التوافقية السلسة للساق دون تضاد حركي.",
        "3) الرسم التخطيطي الوظيفي: رسم متقن ومؤطر لمشبك تنبيهي يحتوي على: زر قبل مشبكي (ميتوكوندريا، حويصلات الأستيل كولين، قنوات Ca2+ الفولطية)، شق مشبكي (جزيئات أستيل كولين، إنزيم AChE)، غشاء بعد مشبكي (مستقبلات قنوية كيميائية لـ Na+، شوارد Na+ متدفقة للداخل، كمون PPSE)، وسهم يوضح اتجاه النقل مع عنوان: 'رسم تخطيطي وظيفي لآلية النقل المشبكي في مشبك تنبيهي'.",
      ],
      reasoningSteps_ar: [
        "تفسير آلية عمل GABA وقنوات الكلور وفرط الاستقطاب بدقة جزيئية.",
        "تفسير التنسيق الحركي الثنائي (تقلص الباسطة واسترخاء القابضة) بالإدماج المتوازي.",
        "رسم المخطط المشبكي الوظيفي التنبيهي الكامل بالبيانات الدقيقة.",
      ],
      biologicalModel_ar: {
        system_ar: "الدائرة العصبية للمنعكس العضلي الرضفي والمشابك النخاعية.",
        experimentalConditions_ar: "تنبيه ميكانيكي وتسجيل كهربائي متزامن متعدد المواقع.",
        governingBiologicalMechanisms_ar: ["التعصيب المتبادل (Innervation réciproque) والإدماج العصبي."],
        evidenceExtracted_ar: "PPSE للباسطة وتثبيط بواسطة عصبون جامع للقابضة.",
        deductionOrConclusion_ar: "الإدماج العصبي هو الركيزة المنسقة للتوافق العضلي الحركي.",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "إغفال دور العصبون الجامع التثبيطي في استرخاء العضلة المضادة يعكس نقصاً في فهم القوس الانعكاسية للمنعكس العضلي.",
      },
      scoringRubric_ar: "1.5 ن لآلية الـ PPSI و GABA، 1.5 ن لشرح التنسيق والتعصيب المتبادل في المنعكس، 2.0 ن للرسم التخطيطي المشبكي الدقيق (BAC_MASTERY_INTERNAL_RUBRIC).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين المشبك التنبيهي والتثبيطي في نوع الشوارد المتدفقة، أو العجز عن حساب المحصلة الجبرية للإدماج العصبي.",
    wrongMentalModel_ar: "الاعتقاد بأن المشبك التثبيطي يفرز سيالة سالبة تسري في العصب، أو أن العصبون المحرك ينفذ أول تنبيه يصله دون دمج.",
    correctMentalModel_ar: "المشبك التثبيطي يفرز GABA يفتح قنوات Cl- فيحدث فرط استقطاب موضعي (PPSI)؛ والعصبون المحرك يجمع حسابياً كل ما يصله في القطعة الابتدائية S.I. (جمع جبري) ليقرر توليد كمون عمل أو البقاء ساكناً.",
    threeStepActionProtocol_ar: [
      "1. مشبك تنبيهي = أستيل كولين -> فتح قنوات Na+ -> تدفق Na+ -> زوال استقطاب PPSE (+).",
      "2. مشبك تثبيطي = GABA -> فتح قنوات Cl- -> تدفق Cl- -> فرط استقطاب PPSI (-).",
      "3. الإدماج: اجمع قيم الـ PPSE واطرح منها قيم الـ PPSI؛ إذا كانت المحصلة الجبرية ≥ عتبة التنبيه في القطعة الابتدائية -> يتولد كمون عمل.",
    ],
    microDrill_ar: {
      prompt_ar: "عصبون تلقى في نفس اللحظة PPSE بقيمة +12 mV و PPSI بقيمة -5 mV، وعتبة التنبيه تتطلب زوال استقطاب بقيمة +10 mV. هل يتولد كمون عمل؟",
      solution_ar: "المحصلة الجبرية = (+12) + (-5) = +7 mV. بما أن +7 mV أقل من العتبة المطلوبة (+10 mV)، فلن يتولد أي كمون عمل في القطعة الابتدائية.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_syn_retest_01",
    invariantTested_ar: "الإدماج العصبي والتجميع الفضائي والزمني وتأثير الأدوية المهدئة.",
    changedSurface_ar: "تطبيق على أدوية البنزوديازيبين (Valium) التي تزيد من ألفة مستقبلات GABA-A لشوارد الكلور وتأثيرها المهدئ للعضلات.",
    prompt_ar: "دواء الفاليوم (Valium) مهدئ عصبي يرتبط بمستقبلات GABA-A الغشائية ويزيد من مدة انفتاح قنوات الكلور في وجود مادة GABA. فسر كيف يؤدي هذا الدواء إلى استرخاء العضلات المشدودة وتسكين نوبات الصرع والتشنج العصبي الحاد.",
    solution_ar: "التفسير: بزيادة مدة انفتاح قنوات الكلور، يسمح الفاليوم بتدفق كميات مضاعفة من شوارد Cl- السالبة نحو داخل العصبونات الحركية، مما يضخم سعة ومدى فرط الاستقطاب التثبيطي (PPSI). في عملية الإدماج العصبي على مستوى القطعة الابتدائية S.I.، تصبح التيارات التثبيطية السالبة طاغية ومسيطرة على أي إشارات تنبيهية واردة، فتجعل المحصلة الجبرية بعيدة جداً عن عتبة التنبيه (-50 mV)، مما يعطل توليد كمونات العمل الحركية ويخفض تواتر السيالات المتجهة للعضلات، فيزول التشنج وتسترخي العضلات وتهدأ النوبات الصرعية.",
    passCondition_ar: "ربط زيادة تدفق الكلور بفرط الاستقطاب المضخم وخفض المحصلة الجبرية دون العتبة.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: سم الكورار (Curare) والتنافس الجزيئي على المستقبلات الغشائية للوحة المحركة",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "استخدمت قبائل الهنود الحمر سم 'الكورار' في سهام الصيد لإحداث شلل فوري للطرائد، ويستخدم اليوم بمشتقاته في التخدير الجراحي لإرخاء العضلات. يمثل الشكل (1) قياس سعة كمون اللوحة المحركة (PPSE) للعضلة بدلالة تراكيز متزايدة من الكورار في وجود تركيز ثابت من الأستيل كولين، فلوحظ انخفاض السعة تدريجياً حتى انعدمت عند تركيز 10 μM وتوقفت العضلة عن التقلص. يمثل الشكل (2) بنية جزيئية مقارنة للأستيل كولين والكورار تبين تشابه قطبيتهما الفضائية ومنافستهما على نفس موقع التثبيت لمستقبلات AChR. 1) فسر النتائج التجريبية للشكل (1) مستعيناً بمعطيات الشكل (2). 2) ما نوع التأثير الذي يمارسه الكورار على المستقبلات بعد المشبكية؟ برر إجابتك. 3) إذا كان المريض في نهاية العملية الجراحية تحت تأثير الكورار، فاقترح دواءً يمكن حقنه لإلغاء مفعول الكورار فورياً وإيقاظ العضلات مع التعليل البيولوجي.",
    modelSolution_ar: [
      "1) تفسير النتائج بالتشابه البنيوي: يمتلك الكورار تشابهاً بنيوياً جزئياً مع الأستيل كولين يسمح له بالارتباط النوعي بنفس موقع التثبيت على المستقبلات القنوية الكيميائية (AChR) على الغشاء بعد المشبكي للوحة المحركة؛ ولكنه بارتباطه لا يفتح القناة الشاردية (حاجب غير وظيفي). مع زيادة تركيز الكورار، يتنافس مع الأستيل كولين ويزيحه تدريجياً من مواقعه، فتنخفض نسبة القنوات المفتوحة ويقل تدفق شوارد Na+، مما يؤدي إلى تناقص سعة الـ PPSE تدريجياً حتى تنعدم تماماً عند 10 μM لانسداد جميع المستقبلات، فيعجز الغشاء عن توليد كمون عمل وتسترخي العضلة وتصاب بالشلل التام.",
      "2) نوع التأثير والتبرير: تأثير تثبيطي تنافسي عكوس (Inhibition compétitive réversible). التبرير: لأن الكورار يتنافس مباشرة مع المبلغ الطبيعي (الأستيل كولين) على نفس موقع التثبيت الغشائي دون أن يغير البنية تساهمياً، ويمكن التغلب عليه وإزاحته برفع تركيز الأستيل كولين في الشق المشبكي.",
      "3) المقترح الدوائي لإلغاء مفعول الكورار: حقن دواء مثبط لإنزيم أستيل كولين إستراز (مثل النيوستيغمين Néostigmine). التعليل البيولوجي: بتثبيط إنزيم التفكيك AChE، يتوقف هدم الأستيل كولين ويتراكم بتركيزات هائلة في الشق المشبكي؛ هذا الارتفاع القياسي في تركيز الأستيل كولين يرجح كفة التنافس لصالحه وفق قانون فعل الكتلة، فيزيح جزيئات الكورار ويحتل المستقبلات الغشائية AChR من جديد، مما يؤدي إلى فتح قنوات Na+ وتوليد كمونات العمل واستعادة العضلات لقدرتها على الانقباض والحركة الطبيعية.",
    ],
    markingScheme_ar: [
      { criterion: "تفسير انخفاض وسقوط PPSE بالتنافس الفراغي وحجب قنوات Na+", points: 2.0 },
      { criterion: "تحديد وتبرير نوع التأثير التنافسي العكوس", points: 1.5 },
      { criterion: "اقتراح مثبط AChE (نيوستيغمين) مع التعليل التنافسي لإزاحة الكورار", points: 1.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 206-235)",
    historicalBacRef: "BAC 2019 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};



// ============================================================================
// 12. snv_photosynthesis_photochemical_phase
// ============================================================================

export const SNV_PHOTOCHEM_PHASE_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_photosynthesis_photochemical_phase",
  canonicalTitle_ar: "التركيب الضوئي: تفاعلات المرحلة الكيموضوئية وأكسدة الماء والفسفرة الضوئية",
  canonicalTitle_fr: "Photosynthèse : phase photochimique, photolyse de l'eau et photophosphorylation",
  discipline: "natural_sciences",
  domain: "التحولات الطاقوية",
  unit: "آليات تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة (المرحلة الكيموضوئية)",
  status: "APPROVED",
  scopeIn: [
    "البنية فوق الخلوية للصانعة الخضراء (Chloroplaste): الغشاء المزدوج، التيلاكويد (Thylakoïde)، الحشوة (Stroma)، والتجويف الداخلي.",
    "الأنظمة الضوئية (Photosystèmes PSII و PSI): صبغات هوائية لاقطة ومركز تفاعل يضم كلوروفيل أ، وامتصاص الفوتونات وتحرير الإلكترونات عالية الطاقة.",
    "الأكسدة الضوئية للماء (Photolyse de l'eau) على مستوى الوجه الداخلي لـ PSII في تجويف التيلاكويد: 2H2O -> O2 + 4H+ + 4e-.",
    "سلسلة نواقل الإلكترونات في غشاء التيلاكويد (T1, T2, T3 و T'1, T'2) وانتقال الإلكترونات تلقائياً وفق تزايد كمون الأكسدة والإرجاع (E°).",
    "إرجاع المستقبل الأخير للإلكترونات في الحشوة: NADP+ + 2H+ + 2e- -> NADPH,H+ بواسطة إنزيم NADP-réductase.",
    "توليد تدرج تركيز البروتونات (ΔpH) عبر غشاء التيلاكويد بتراكم H+ في التجويف (أكسدة الماء وضخ البروتونات بواسطة الناقل الوسيط T2 البلاستوكينون) مقابل انخفاضها في الحشوة.",
    "الفسفرة الضوئية (Photophosphorylation): تدفق البروتونات عبر الكريات المذنبة (ATP synthase) وفق تدرج التركيز وتوليد ATP من ADP + Pi.",
    "التجارب الدالة: تجربة هيل (Hill) لاشتراط المستقبل المؤكسد الاصطناعي، وتجربة جاغندورف (Jagendorf) لإثبات كفاية تدرج الـ pH في الظلام لاصطناع ATP.",
  ],
  scopeOut: [
    "الصيغ الكيميائية المفصلة لأشباه الكاروتين والزانثوفيل وأطياف الامتصاص التفصيلية غير المقررة.",
    "مسار الفسفرة الضوئية الدائرية (Photophosphorylation cyclique) بتفاصيله المتقدمة خارج البرنامج الوزاري لـ 3AS.",
  ],
  prerequisites: {
    hard: ["snv_enzyme_kinetics_active_site_regulation"],
    soft: ["مفهوم الأكسدة والإرجاع وكمون الأكسدة والإرجاع في الكيمياء"],
    foundation: ["بنية الخلية النباتية والصانعات الخضراء وأهمية الضوء واليخضور"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_PHOTO_01",
      bloomLevel: "understand",
      description_ar: "يفسر آلية الأكسدة الضوئية للماء وتدفق الإلكترونات عبر السلسلة التركيبية الضوئية حتى إرجاع المستقبل النهائي NADP+.",
    },
    {
      code: "LO_SNV_PHOTO_02",
      bloomLevel: "analyze",
      description_ar: "يحلل الشروط التجريبية لاصطناع الـ ATP ويثبت أن الكريات المذنبة تستغل الطاقة الكامنة في تدرج الـ pH المتولد عن النشاط الكيموضوئي.",
    },
    {
      code: "LO_SNV_PHOTO_03",
      bloomLevel: "evaluate",
      description_ar: "يقيم تأثير مبيدات الأعشاب والمثبطات الكيميائية على السلسلة التركيبية وتدفق الطاقة.",
    },
  ],
  coreConcepts_ar: [
    "التيلاكويد (Thylakoïde): الكيس الغشائي الحاوي على الصبغات اليخضورية وسلسلة التركيب الضوئي.",
    "الأنظمة الضوئية (PSII / PSI): معقدات بروتينية صبغية تستقبل الطاقة الضوئية وتتأكسد بطرد إلكترونات عالية الطاقة.",
    "أكسدة الماء الضوئية: تفاعل يجري في تجويف التيلاكويد يحرر O2 كناتج ثانوي ويوفر الإلكترونات لتعويض عجز PSII.",
    "تدرج الـ pH (ΔpH): تراكم البروتونات H+ داخل التجويف وانخفاضها في الحشوة مما يولد قوة دافعة بروتونية.",
    "الكرية المذنبة (ATP synthase): إنزيم قنوي يستغل سيل البروتونات التلقائي نحو الحشوة لفسفرة ADP إلى ATP.",
    "نواتج المرحلة الكيموضوئية: ATP و NADPH,H+ الضروريان لاختزال الكربون في المرحلة التالية.",
  ],
  lessonPackage: {
    overview_ar: "تعد المرحلة الكيموضوئية الخطوة الأولى في التركيب الضوئي، حيث تحول الطاقة الضوئية إلى طاقة كيميائية مخزنة في نواتج مؤقتة عالية الطاقة (ATP و NADPH,H+) مع تحرير غاز الأكسجين (O2) الناتج عن أكسدة جزيئات الماء.",
    biologicalMechanism_ar: [
      "1. التقاط الطاقة الضوئية: تمتص الصبغات الهوائية في النظامين الضوئيين (PSII و PSI) فوتونات الضوء وتنقل الطاقة بالرنين نحو مركز التفاعل (كلوروفيل أ P680 و P700)، مما يؤدي إلى تهيجهما وفقدان إلكترونات عالية الطاقة نحو النواقل الأولية.",
      "2. أكسدة الماء وتعويض الإلكترونات: يتعرض جزيء الماء للأكسدة الضوئية في تجويف التيلاكويد بواسطة إنزيم مرتبط بـ PSII: 2H2O -> O2 + 4H+ + 4e-. تعوض هذه الإلكترونات العجز الإلكتروني المستمر في مركز التفاعل لـ PSII، في حين ينطلق غاز O2 إلى الوسط الخارجي وتتراكم شوارد H+ في التجويف.",
      "3. انتقال الإلكترونات واختزال NADP+: تسري الإلكترونات المحررة من PSII تلقائياً عبر سلسلة النواقل (T1, T2, T3) وفق تزايد كمون الأكسدة والإرجاع وصولاً إلى PSI؛ وعند تهيج PSI بالضوء تنطلق إلكتروناته عبر (T'1, T'2) لتصل إلى الإنزيم المرجع NADP-réductase في الحشوة، والذي يرجع المستقبل الأخير: NADP+ + 2H+ + 2e- -> NADPH,H+.",
      "4. تشكل تدرج البروتونات والفسفرة الضوئية: أثناء انتقال الإلكترونات، يقوم الناقل T2 (البلاستوكينون) بضخ شوارد H+ من الحشوة إلى التجويف، مضيفاً إياها إلى البروتونات الناتجة عن أكسدة الماء، فينشأ تدرج كيميائي أوزمولي حاد (تراكم H+ وانخفاض الـ pH في التجويف مقارنة بالحشوة). يؤدي هذا التدرج إلى خروج البروتونات عبر الكريات المذنبة دافعة إياها لربط Pi بالـ ADP واصطناع الـ ATP.",
    ],
    evidenceAndObservation_ar: "بينت تجارب هيل (Hill) على تيلاكويدات معزولة خالية من الحشوة وفي وجود مستقبل مؤكسد اصطناعي (شوارد الحديد Fe3+) أن انطلاق O2 يشترط حتماً وجود الضوء والمستقبل المؤكسد. وبينت تجربة جاغندورف (Jagendorf) أن وضع تيلاكويدات معزولة في وسط حامضي (pH=4) حتى يتشبع تجويفها بالبروتونات ثم نقلها إلى وسط قاعدي (pH=8) في الظلام مع إضافة ADP و Pi يؤدي فوراً إلى إنتاج كميات معتبرة من ATP بمجرد وجود تدرج الـ pH دون حاجة للضوء أو أكسدة الماء في تلك اللحظة.",
    scientificReasoning_ar: "نستدل من تجربة هيل على أن أكسدة الماء وانطلاق الأكسجين مرتبطان بتوفر مستقبل مؤكسد يستقبل الإلكترونات ولا يرتبطان بوجود CO2. ونستدل من تجربة جاغندورف على أن الكريات المذنبة تتصرف كمحركات نانوية تستمد طاقتها التحفيزية مباشرة من الطاقة الكامنة لتدرج البروتونات (الانتشار الميسر لشوارد H+ من الوسط الحامضي إلى الوسط القاعدي) لربط الـ Pi بالـ ADP، مما يثبت أن دور السلسلة الكيموضوئية هو خلق هذا التدرج البروتوني واختزال النواقل.",
    biologicalConclusion_ar: "تتكامل أكسدة الماء وانتقال الإلكترونات عبر غشاء التيلاكويد مع ضخ البروتونات لتوليد تدرج pH محفز للكريات المذنبة، وينتج عن هذه المرحلة ناتجان طاقويان أساسيان: ATP و NADPH,H+، ينطلقان في الحشوة ليشكلا القوة الاختزالية والطاقوية المحركة للمرحلة الكيميوحيوية اللاحقة.",
  },
  workedModel: {
    problem_ar: "لدراسة شروط الفسفرة الضوئية، عزلت صانعات خضراء وحُضرت تيلاكويدات سليمة وعولجت بأوساط تجريبية مختلفة بالضوء والظلام، وقيس تركيز ATP في الوسط. فسر بيولوجياً النتائج التجريبية الآتية: الوسط 1 (ضوء + ADP + Pi): إنتاج ATP مرتفع؛ الوسط 2 (ظلام + ADP + Pi): انعدام إنتاج ATP؛ الوسط 3 (ضوء + ADP + Pi + مادة DNP التي تجعل غشاء التيلاكويد نفوذاً للبروتونات H+): انعدام إنتاج ATP مع استمرار انطلاق غاز O2 واختزال NADP+.",
    documentData_ar: "البيانات: في الوسط 1 (الشاهد) يتشكل ATP في وجود الضوء و ADP و Pi. في الوسط 2 ينعدم الإنتاج في غياب الضوء. في الوسط 3 مع مادة DNP والضوء، ينعدم تشكل ATP كلياً بينما يستمر انطلاق O2 واختزال المستقبل بنفس الكفاءة.",
    observation_ar: "نلاحظ أن مادة DNP أبطلت تماماً قدرة التيلاكويد على اصطناع ATP دون أن تعطل تفاعلات أكسدة الماء وانتقال الإلكترونات وانطلاق O2 واختزال المستقبل.",
    interpretation_ar: "تفسير الوسط 1: الضوء يفعل الأنظمة الضوئية فيؤدي إلى انتقال الإلكترونات وضخ البروتونات وتشكل تدرج الـ pH الذي يدفع الكريات المذنبة لاصطناع ATP. الوسط 2: غياب الضوء يوقف نشاط الأنظمة الضوئية فيغيب تدرج البروتونات. الوسط 3: مادة DNP فككت الارتباط (Découplant) بجعل الغشاء نفوذاً لشوارد H+، مما أدى إلى تسرب البروتونات من التجويف نحو الحشوة مباشرة عبر الغشاء وزوال تدرج الـ pH فورياً، فعجزت البروتونات عن المرور عبر الكريات المذنبة ولم يتشكل ATP، مع بقاء تدفق الإلكترونات في السلسلة الضوئية نشطاً.",
    deduction_ar: "نستنتج أن اصطناع الـ ATP بالفسفرة الضوئية لا يعتمد مباشرة على الضوء أو أكسدة الماء بحد ذاتهما، بل يشترط حتماً وجود تدرج كيميائي أوزمولي للبروتونات (ΔpH) عبر غشاء تيلاكويد سليم غير نفوذ لـ H+ إلا عبر الكريات المذنبة.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_photo_l1_01",
      capabilityId: "snv_photosynthesis_photochemical_phase",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 4,
      prompt_ar: "ما هو المصدر المباشر للإلكترونات التي تعوض العجز الإلكتروني في مركز التفاعل للنظام الضوئي الثاني (PSII) أثناء المرحلة الكيموضوئية؟\nأ) أكسدة جزيئات غاز CO2 في الحشوة\nب) الأكسدة الضوئية لجزيئات الماء (H2O) في تجويف التيلاكويد\nج) إرجاع جزيئات NADP+ بواسطة الكريات المذنبة\nد) تفكيك جزيئات ATP في الحشوة",
      expectedResponse_ar: "ب) الأكسدة الضوئية لجزيئات الماء (H2O) في تجويف التيلاكويد",
      reasoningSteps_ar: [
        "يتحمس مركز تفاعل PSII بالضوء ويفقد إلكتروناته نحو الناقل الأول T1.",
        "يتم تعويض هذا النقص مباشرة عن طريق أكسدة الماء وفق التفاعل: 2H2O -> O2 + 4H+ + 4e- على مستوى الوجه الداخلي لغشاء التيلاكويد.",
      ],
      biologicalModel_ar: {
        system_ar: "غشاء التيلاكويد وتجويفه الداخلي",
        experimentalConditions_ar: "إضاءة التيلاكويدات السليمة",
        governingBiologicalMechanisms_ar: ["التهيج الضوئي لـ PSII", "الأكسدة الضوئية للماء تحرر الإلكترونات والبروتونات والأكسجين"],
        evidenceExtracted_ar: "معادلة أكسدة الماء التجريبية",
        deductionOrConclusion_ar: "الماء هو المعطي الأول للإلكترونات في التركيب الضوئي الأكسجيني",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن CO2 هو مصدر الإلكترونات هو خلط فادح مع المرحلة الكيميوحيوية التي يتم فيها تثبيت الكربون باستهلاك الإلكترونات وليس منحها.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: درجة واحدة لاختيار الخيار الصحيح (ب).",
    },
    l2_application: {
      id: "snv_photo_l2_01",
      capabilityId: "snv_photosynthesis_photochemical_phase",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 7,
      prompt_ar: "بين في نص علمي دقيق كيف يساهم انتقال الإلكترونات عبر سلسلة التركيب الضوئي في إنشاء القوة الدافعة البروتونية (تدرج الـ pH) عبر غشاء التيلاكويد.",
      expectedResponse_ar: "يساهم انتقال الإلكترونات في بناء تدرج الـ pH عبر آليتين متكاملتين:\n1) أكسدة الماء في تجويف التيلاكويد: تحرر شوارد H+ مباشرة داخل التجويف مما يرفع تركيزها ويخفض الـ pH داخله.\n2) نشاط الناقل الوسيط T2 (البلاستوكينون): عند استقباله الإلكترونات من T1، يلتقط بروتونات H+ من الحشوة، وعند أكسدته بنقل الإلكترونات إلى المركب التالي، يضخ تلك البروتونات ويقذفها في تجويف التيلاكويد ضد تدرج التركيز.\n3) استهلاك بروتونات H+ في الحشوة أثناء إرجاع NADP+ إلى NADPH,H+ بواسطة إنزيم NADP-réductase.\nتتضافر هذه العمليات لجعل تجويف التيلاكويد حامضياً (pH منخفض) مقارنة بالحشوة (pH مرتفع)، فينشأ تدرج كيميائي أوزمولي يدفع شوارد H+ للتدفق التلقائي عبر الكريات المذنبة.",
      reasoningSteps_ar: [
        "تحديد مصادر تراكم H+ في التجويف (أكسدة الماء + ضخ الناقل T2).",
        "تحديد عوامل استهلاك H+ في الحشوة (إرجاع NADP+).",
        "استنتاج تدرج الـ pH الحاصل وأثره على الكرية المذنبة.",
      ],
      biologicalModel_ar: {
        system_ar: "غشاء التيلاكويد الفاصل بين الحشوة والتجويف",
        experimentalConditions_ar: "نشاط السلسلة التركيبية الكيموضوئية في وجود الضوء",
        governingBiologicalMechanisms_ar: ["الضخ الكيميائي الحيوي للبروتونات", "الأكسدة الحيوية للماء", "توليد القوة الدافعة البروتونية"],
        evidenceExtracted_ar: "قياس الـ pH المقارن بين الحشوة والتجويف في الضوء",
        deductionOrConclusion_ar: "تدرج الـ pH نتاج مشترك لأكسدة الماء وضخ النواقل واستهلاك الحشوة لـ H+",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "إهمال دور الناقل T2 في ضخ البروتونات وحصر مصدر H+ في أكسدة الماء فقط يمثل نقصاً معلوماتياً رئيسياً.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لأكسدة الماء في التجويف، 1.0 ن لضخ البروتونات بواسطة T2، 0.5 ن لاستهلاك H+ في الحشوة، 0.5 ن للربط بتدرج الـ pH والكرية المذنبة.",
    },
    l3_mixed: {
      id: "snv_photo_l3_01",
      capabilityId: "snv_photosynthesis_photochemical_phase",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "تمثل الوثيقة قياس تركيز غاز O2 المنطلق في معلق تيلاكويدات معزولة في الشروط التجريبية التالية:\n- الفترة ز0 إلى ز1: في الظلام، عدم إضافة أي مادة.\n- الفترة ز1 إلى ز2: إضاءة مستمرة مع عدم إضافة أي مادة.\n- عند اللحظة ز2: حقن كاشف هيل (محلول يحوي شوارد Fe3+ المؤكسدة) مع استمرار الإضاءة.\n- عند اللحظة ز3: إطفاء الضوء كلياً مع بقاء كاشف هيل.\nحلل معطيات الوثيقة مبرزاً دلالة كل مرحلة، وماذا تستنتج حول شروط انطلاق غاز الأكسجين؟",
      expectedResponse_ar: "تحليل الوثيقة:\n- من ز0 إلى ز1 (في الظلام وبدون كاشف): نلاحظ ثبات تركيز O2 عند قيمة دنيا (انعدام انطلاق O2)، مما يدل على أن الظلام لا يسمح بحدوث تفاعلات أكسدة الماء.\n- من ز1 إلى ز2 (في الضوء وبدون كاشف): نلاحظ استمرار ثبات تركيز O2 عند الصفر تقريباً رغم توفر الضوء، مما يدل على أن الضوء بمفرده غير كافٍ لانطلاق الأكسجين لغياب المستقبل المؤكسد للإلكترونات.\n- من ز2 إلى ز3 (في وجود الضوء وحقن كاشف هيل Fe3+): نلاحظ تصاعداً سريعاً وشبه خطي في تركيز O2 المنطلق، مما يدل على أن توفر الضوء متزامناً مع وجود مستقبل مؤكسد اصطناعي (Fe3+) سمح بسريان الإلكترونات في السلسلة وإتمام أكسدة الماء الضوئية وتحرير O2.\n- بعد ز3 (في الظلام مع وجود الكاشف): نلاحظ توقفاً فورياً لارتفاع تركيز O2 وثباته عند القيمة المسجلة، مما يدل على توقف أكسدة الماء فور انقطاع الضوء.\nالاستنتاج: انطلاق غاز الأكسجين في المرحلة الكيموضوئية يشترط حتماً توافر شرطين متلازمين معاً: وجود الضوء المنشط للأنظمة الضوئية ووجود مستقبل مؤكسد للإلكترونات في الوسط.",
      reasoningSteps_ar: [
        "تقسيم التسجيل الزمني إلى 4 فترات دقيقة وفق المتغيرات (ضوء/ظلام، وجود/غياب المستقبل).",
        "قراءة قيم وسلوك منحنى O2 (ثبات، صعود سريع، ثبات).",
        "تفسير كل مرحلة بربطها بالحالة الوظيفية لأكسدة الماء والسلسلة.",
        "استخراج الاستنتاج الشامل الجامع للشرطين الإلزاميين.",
      ],
      biologicalModel_ar: {
        system_ar: "معلق تيلاكويدات معزولة مخبرياً",
        experimentalConditions_ar: "تغيير الإضاءة وحقن المستقبل المؤكسد Fe3+",
        governingBiologicalMechanisms_ar: ["الارتباط التلازمي بين أكسدة الماء واختزال المستقبل الضوئي"],
        evidenceExtracted_ar: "انطلاق O2 فقط وحصراً عند تزامن الضوء مع وجود Fe3+",
        deductionOrConclusion_ar: "أكسدة الماء الضوئية تتطلب إضاءة ومستقبلاً مؤكسداً للإلكترونات",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الاكتفاء بوصف سطحي (المنحنى يرتفع ثم يثبت) دون ربط ذلك بالمتغيرات التجريبية أو استخراج الدلالة البيولوجية لكل فترة.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 0.5 ن لكل مرحلة من المراحل الأربع (مجموع 2.0 ن للتحليل)، و 1.0 ن لصياغة الاستنتاج العلمي الدقيق.",
    },
    l4_transfer: {
      id: "snv_photo_l4_01",
      capabilityId: "snv_photosynthesis_photochemical_phase",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 12,
      prompt_ar: "مبيد الأعشاب 'الأترازين' (Atrazine) مركب كيميائي يستعمل في الزراعة للقضاء على النباتات الضارة. أظهرت الأبحاث البيوكيميائية أن الأترازين يرتبط نوعياً بموقع تثبيت البلاستوكينون (T2) على معقد النظام الضوئي الثاني (PSII)، مما يمنع انتقال الإلكترونات من T1 إلى T2. فسر استدلالاً بالآليات الجزيئية كيف يؤدي رش الأترازين إلى موت النباتات المعاملة به عبر شل المرحلة الكيموضوئية.",
      expectedResponse_ar: "الاستدلال العلمي والتفسير الجزيئي:\n1) حجب السلسلة الإلكترونية: بارتباط الأترازين بموقع التثبيت على مستوى PSII ومنع نقل الإلكترونات من T1 إلى T2، تنقطع السلسلة التركيبية الضوئية تماماً وتبقى نواقل الإلكترونات السابقة في حالة مرجعة مشبعة، مما يمنع مركز التفاعل P680 من طرد إلكترونات جديدة ويشل نشاطه.\n2) توقف أكسدة الماء: بعجز P680 عن فقد الإلكترونات، يتوقف تفاعل أكسدة الماء في تجويف التيلاكويد لغياب العامل المؤكسد الجاذب للإلكترونات، فينعدم انطلاق O2.\n3) انعدام تدرج البروتونات والـ ATP: يؤدي توقف انتقال الإلكترونات وتوقف أكسدة الماء وتعطيل الناقل T2 إلى انعدام ضخ البروتونات نحو التجويف وزوال تدرج الـ pH كلياً، فتعجز الكريات المذنبة عن اصطناع الـ ATP.\n4) غياب اختزال NADP+: لا تصل الإلكترونات إلى PSI أو NADP-réductase، فينعدم تشكل NADPH,H+.\nالنتيجة النهائية: انعدام نواتج المرحلة الكيموضوئية (ATP و NADPH,H+) يشل المرحلة الكيميوحيوية التالية تماماً، فتعجز النبتة عن تثبيت CO2 وبناء المادة العضوية والسكريات، مما يؤدي إلى نفاذ مدخراتها الطاقوية وموتها التدريجي.",
      reasoningSteps_ar: [
        "تحديد موقع تأثير الأترازين على السلسلة التركيبية (بين T1 و T2).",
        "تتبع الآثار الجزيئية التسلسلية: انسداد السلسلة -> شلل أكسدة الماء -> زوال تدرج H+ -> توقف اصطناع ATP و NADPH,H+.",
        "ربط النقص الطاقوي بعجز النبتة عن تركيب غذائها وموتها.",
      ],
      biologicalModel_ar: {
        system_ar: "غشاء التيلاكويد تحت تأثير مثبط كيميائي تنافسي",
        experimentalConditions_ar: "معاملة النبات بمبيد الأترازين",
        governingBiologicalMechanisms_ar: ["انسداد مسار الإلكترونات", "توقف الفسفرة الضوئية", "الموت جوعاً طاقوياً"],
        evidenceExtracted_ar: "الموقع الجزيئي لتثبيط الأترازين",
        deductionOrConclusion_ar: "تعطيل أي ناقل في السلسلة يشل إنتاج ATP و NADPH,H+ ويوقف التركيب الحيوي كاملاً",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء بأن الأترازين يسمم النبتة مباشرة عبر تدمير الجذور أو الخلايا دون تفسير الشلل الطاقوي للمرحلة الكيموضوئية.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لشرح انقطاع السلسلة وتوقف أكسدة الماء، 1.0 ن لتفسير زوال تدرج H+ وتوقف ATP، 1.0 ن لتوقف NADPH,H+ وشلل التخليق العضوي والموت.",
    },
    l5_bac_style: {
      id: "snv_photo_l5_01",
      capabilityId: "snv_photosynthesis_photochemical_phase",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 18,
      prompt_ar: "أجرى العالم جاغندورف وزملاؤه تجربة تاريخية لإثبات دور التدرج الكيميائي الحيوي في اصطناع الـ ATP:\nالمرحلة 1: وضعت تيلاكويدات معزولة وسليمة في الظلام داخل وسط ذي باهاء حمضي (pH = 4.0) لمدة كافية حتى استقر باهاء تجويف التيلاكويدات عند 4.0.\nالمرحلة 2: نُقلت هذه التيلاكويدات فجأة وفي الظلام إلى وسط جديد ذي باهاء قاعدي (pH = 8.0) يحتوي على ADP و Pi المشعين.\nالنتيجة: لوحظ تشكل فوري وسريع لجزيئات ATP المشعة في الوسط، واستمر هذا الاصطناع لفترة وجيزة ثم توقف نهائياً.\n1) برر إبقاء التيلاكويدات في الظلام طوال مراحل التجربة.\n2) فسر على المستوى الجزيئي آلية اصطناع الـ ATP في المرحلة 2، وعلل سبب توقف هذا الاصطناع بعد فترة قصيرة.\n3) بين ماذا كانت ستكون النتيجة لو أضيف في المرحلة 2 مركب نيجيريسين (Nigéricine) الذي يسمح بالتبادل الحر لشوارد H+ مع K+ عبر غشاء التيلاكويد.",
      expectedResponse_ar: "1) تبرير إبقاء التيلاكويدات في الظلام: تم استبعاد الضوء تماماً لإلغاء أي نشاط للأنظمة الضوئية وسلسلة انتقال الإلكترونات وأكسدة الماء، وذلك لضمان أن اصطناع الـ ATP ناتج حصراً وبطريقة مستقلة عن تدرج الـ pH الاصطناعي المفروض تجريبياً وليس عن تفاعلات ضوئية طبيعية.\n2) التفسير الجزيئي لاصطناع ATP وتوقفه:\n- الآلية: بنقل التيلاكويدات المشبعة بـ H+ (pH داخلي = 4) إلى وسط خارجي ذي pH = 8، نشأ تدرج كيميائي أوزمولي حاد للبروتونات (تدرج 4 وحدات pH أي تركيز H+ في الداخل أكبر بـ 10000 مرة من الخارج). ونظراً لعدم نفاذية الغشاء لـ H+، تدفقت البروتونات تلقائياً وبقوة عبر الكريات المذنبة نحو الخارج وفق تدرج التركيز، مما أتاح للكرية المذنبة استغلال هذه الطاقة الحركية لفسفرة ADP و Pi واصطناع ATP.\n- تعليل توقف الاصطناع: مع استمرار خروج شوارد H+ نحو الوسط الخارجي، يتناقص تركيزها الداخلي ويرتفع الـ pH في التجويف تدريجياً حتى يتعادل الباهاء الداخلي مع الخارجي (زوال تدرج الـ pH)، فينعدم السيل البروتوني المحرك للكرية المذنبة ويتوقف الاصطناع كلياً.\n3) النتيجة في وجود النيجيريسين مع التعليل: ستنعدم كمية الـ ATP المصطنعة تماماً (صفر)؛ التعليل: مركب النيجيريسين يجعل الغشاء نفوذاً لـ H+، فتتسرب البروتونات مباشرة عبر الليبيدات المفسفرة للغشاء دون المرور عبر الكريات المذنبة، مما يؤدي إلى زوال تدرج الـ pH فورياً دون توليد أي طاقة ميكانيكية حيوية للفسفرة.",
      reasoningSteps_ar: [
        "التحكم في المتغيرات: تفسير عزل المتغير الضوئي لضبط السببية العلمية.",
        "التفسير البيوفيزيائي لتدرج الـ pH وتدفق H+ عبر الكريات المذنبة.",
        "تفسير التوازن الديناميكي وزوال التدرج بتعادل التركيز.",
        "التنبؤ العلمي الدقيق لأثر مادة مفرقة للتدرج البروتوني.",
      ],
      biologicalModel_ar: {
        system_ar: "تيلاكويدات في وسط اصطناعي ذي درجات pH متباينة",
        experimentalConditions_ar: "الظلام التام مع التبديل الفجائي للـ pH الخارجي وإضافة ركائز الفسفرة",
        governingBiologicalMechanisms_ar: ["النظرية الكيميائية الأوزمولية (Mitchell / Jagendorf)", "الفسفرة المعتمدة على القوة الدافعة البروتونية"],
        evidenceExtracted_ar: "اصطناع ATP في الظلام فقط بوجود تدرج pH",
        deductionOrConclusion_ar: "تدرج الـ pH شرط كافٍ ومباشر لدفع الكريات المذنبة نحو الفسفرة",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "افتراض أن الكريات المذنبة تصنع ATP لأنها امتصت الضوء أو أن التوقف ناتج عن استهلاك الـ ADP فقط بدلاً من زوال تدرج التركيز.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لتبرير الظلام، 2.0 ن للتفسير الجزيئي لاصطناع ATP والتعليل الرياضي لزوال التدرج، 1.0 ن لتحليل أثر النيجيريسين والتسرب الغشائي المباشر.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين دور الضوء المباشر في أكسدة الماء والتهيج الصبغي، ودوره غير المباشر في اصطناع ATP عبر تدرج البروتونات، أو الاعتقاد الخاطئ بأن الكريات المذنبة 'تضخ' البروتونات باستهلاك الطاقة بدلاً من أن البروتونات تدفق عبرها تلقائياً لتوليد ATP.",
    wrongMentalModel_ar: "الضوء يصنع الـ ATP مباشرة أو الكريات المذنبة تستهلك ATP لتدخل شوارد H+.",
    correctMentalModel_ar: "الضوء يؤكسد الماء ويحرك الإلكترونات، والنواقل تضخ H+ لتخلق خزان بروتونات عالي الضغط في التجويف؛ والكرية المذنبة كالتوربين المائي تفتح الباب لتدفق H+ التلقائي لتصنع ATP.",
    threeStepActionProtocol_ar: [
      "1. تتبع مسار الإلكترونات منفصلاً: من H2O -> PSII -> سلسلة النواقل -> PSI -> NADP+ (إنتاج NADPH,H+).",
      "2. تتبع مسار البروتونات H+: تتجمع في تجويف التيلاكويد (من أكسدة الماء + ضخ T2) وتخرج عبر الكريات المذنبة نحو الحشوة (توليد ATP).",
      "3. تطبيق قاعدة جاغندورف الذهبية: تدرج pH سليم = اصطناع ATP، غياب تدرج pH (حتى في وجود الضوء) = انعدام ATP.",
    ],
    microDrill_ar: {
      prompt_ar: "تمت إضافة مادة سامة لغشاء التيلاكويد أوقفت عمل مضخة T2 فقط دون التأثير على أكسدة الماء بواسطة PSII. هل يستمر إنتاج ATP بنفس الوتيرة؟ برر إجابتك.",
      solution_ar: "لا يستمر بنفس الوتيرة بل ينخفض بشدة؛ لأن نصف أو معظم تدرج الـ pH يعتمد على ضخ شوارد H+ النشط بواسطة T2 من الحشوة، وفي غيابه يبقى فقط ما تحرره أكسدة الماء وهو غير كافٍ للحفاظ على تدرج كيميائي أوزمولي قوي وفعال للفسفرة.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_photo_retest_01",
    invariantTested_ar: "الربط بين تدرج الـ pH واصطناع الـ ATP واشتراط سلامة غشاء التيلاكويد.",
    changedSurface_ar: "تطبيق على مادة كلوريد الأمونيوم (NH4Cl) التي تعمل كحاجب كيميائي يستهلك شوارد H+ في تجويف التيلاكويد.",
    prompt_ar: "مادة كلوريد الأمونيوم (NH4Cl) مركب كيميائي نفوذ للغشاء يتفكك في تجويف التيلاكويد إلى NH3 و H+ مشكلاً أيونات NH4+ التي تعجز عن الخروج، مما يؤدي إلى استهلاك البروتونات الحرة في التجويف ورفع الباهاء (pH) الداخلي إلى 8.0 في وجود الضوء المستمر. تنبأ بالنتائج المتوقعة على كل من: 1) انطلاق غاز O2، 2) إرجاع NADP+، 3) اصطناع الـ ATP. برر إجابتك علمياً.",
    solution_ar: "التنبؤ والتبرير العلمي:\n1) انطلاق غاز O2: يستمر انطلاق O2 بل قد يزداد تسارعاً، لأن انتقال الإلكترونات غير معطل وزوال تدرج البروتونات يرفع من سرعة سريان الإلكترونات في السلسلة.\n2) إرجاع NADP+: يستمر إرجاع NADP+ إلى NADPH,H+ بانتظام لاستمرار تدفق الإلكترونات ووصولها للناقل الأخير.\n3) اصطناع الـ ATP: يتوقف اصطناع ATP كلياً وينعدم، لأن ارتباط H+ وتثبيته رفع باهاء التجويف إلى 8.0 معادلاً إياه مع باهاء الحشوة، فزال تدرج الـ pH وانعدمت القوة الدافعة البروتونية اللازمة لتشغيل الكريات المذنبة.",
    passCondition_ar: "التمييز الدقيق بين استمرار سريان الإلكترونات وأكسدة الماء وتوقف اصطناع ATP بزوال التدرج البروتوني.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: دراسة آلية عمل مبيد الديارون (DCMU) وتأثيره على المحاصيل الزراعية",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "مركب الديارون (DCMU) من أشهر مبيدات الأعشاب الانتقائية المستخدمة في مكافحة الحشائش في حقول قصب السكر والقطن. لقياس تأثيره، تم وضع تيلاكويدات في وسط يحوي كاشف هيل ومستقبل مؤكسد مع إضاءة مستمرة، ثم حقن DCMU عند اللحظة ز1. يوضح الشكل (1) تطور كمية O2 المنطلقة قبل وبعد ز1. يوضح الشكل (2) مخططاً بنيوياً لموقع تثبيت DCMU على بروتين D1 في معقد النظام الضوئي الثاني (PSII) حيث يمنع انتقال الإلكترونات نحو البلاستوكينون T2. 1) استخرج من الشكل (1) تأثير مركب DCMU على انطلاق الأكسجين. 2) فسر انطلاقاً من الشكل (2) الآلية الجزيئية لهذا التأثير وأثره على اصطناع الـ ATP وإرجاع NADP+. 3) برر لماذا يؤدي رش هذا المبيد إلى ذبول النباتات وموتها بعد بضعة أيام.",
    modelSolution_ar: [
      "1) استخراج التأثير من الشكل (1): قبل اللحظة ز1 (في وجود الضوء والمستقبل)، كان انطلاق O2 يتزايد خطياً وبوتيرة سريعة؛ وفور حقن مركب DCMU عند ز1، توقف انطلاق الأكسجين فورياً وثبت تركيزه في الوسط، مما يبين أن DCMU يثبط تفاعل أكسدة الماء انطلاقاً من اللحظة الأولى لحقنه.",
      "2) التفسير الجزيئي للآلية وأثرها الطاقوي: بارتباط DCMU ببروتين D1 في PSII، يحجب موقع استقبال الإلكترونات فيمنع انتقالها من مركز التفاعل P680 إلى الناقل T2. يؤدي هذا الانسداد إلى تشبع P680 بالإلكترونات وعجزه عن التأكسد، مما يوقف فورياً أكسدة الماء وتعويض الإلكترونات فينقطع انطلاق O2. نتيجة انقطاع سيل الإلكترونات، يتوقف ضخ شوارد H+ بواسطة T2 ويزول تدرج الـ pH عبر غشاء التيلاكويد، فتشل الكريات المذنبة ويتوقف اصطناع ATP تماماً، كما تنقطع الإلكترونات عن PSI فيتوقف إرجاع NADP+ وينعدم تشكل NADPH,H+.",
      "3) تبرير ذبول وموت النباتات: غياب نواتج المرحلة الكيموضوئية (ATP و NADPH,H+) يشل تفاعلات حلقة كالفن في الحشوة، فيتوقف تثبيت CO2 وبناء السكريات الثلاثية والنشاء. مع استمرار استهلاك الخلايا لطاقتها الكامنة دون تعويض، تنفد مدخرات النبتة ويتوقف اصطناع الجزيئات الحيوية وترميم الخلايا، مما يؤدي إلى انهيار العمليات الأيضية وذبول النبات وموته جوعاً.",
    ],
    markingScheme_ar: [
      { criterion: "استخراج توقف انطلاق O2 فور حقن DCMU من الشكل (1)", points: 1.0 },
      { criterion: "التفسير الجزيئي لحجب بروتين D1 وانسداد السلسلة وتوقف أكسدة الماء", points: 2.0 },
      { criterion: "الربط بانعدام ATP و NADPH,H+ وشلل حلقة كالفن وموت النبتة", points: 2.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 170-195)",
    historicalBacRef: "BAC 2017 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 13. snv_photosynthesis_calvin_cycle_synthesis
// ============================================================================

export const SNV_CALVIN_CYCLE_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_photosynthesis_calvin_cycle_synthesis",
  canonicalTitle_ar: "التركيب الضوئي: المرحلة الكيميوحيوية وتثبيت ثاني أكسيد الكربون وحلقة كالفن",
  canonicalTitle_fr: "Photosynthèse : phase biochimique, fixation du CO2 et cycle de Calvin",
  discipline: "natural_sciences",
  domain: "التحولات الطاقوية",
  unit: "آليات تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة (المرحلة الكيميوحيوية)",
  status: "APPROVED",
  scopeIn: [
    "مقر المرحلة الكيميوحيوية: الحشوة (Stroma) وغناها بإنزيم الريبولوز ثنائي الفوسفات كربوكسيلاز/أوكسيجيناز (Rubisco) ونواتج المرحلة الأولى (ATP و NADPH,H+).",
    "تثبيت CO2: ارتباط غاز ثاني أكسيد الكربون مع السكر الخماسي ريبولوز ثنائي الفوسفات (RuBP: Ribulose 1,5-bisphosphate) ليشكل مركباً سداسياً غير مستقر ينشطر فوراً إلى جزيئتين من حمض الفوسفوغليسيريك (APG: 3-Phosphoglycérate).",
    "إرجاع APG: فسفرة واختزال APG إلى سكر ثلاثي مفسفر فوسفوغليسيرالدهيد (PGAL / Triose phosphate) باستهلاك نواتج المرحلة الكيموضوئية (جزيئات ATP وطاقة الإلكترونات والبروتونات لـ NADPH,H+).",
    "تجديد الـ RuBP واصطناع السكريات: استخدام جزء من جزيئات PGAL لتجديد مستقبل CO2 (RuBP) مع استهلاك إضافي للـ ATP، واستخدام الجزء الآخر لاصطناع الجلوكوز ثم النشاء والسكروز والمواد العضوية.",
    "التكامل الوظيفي الوثيق بين المرحلتين: تستهلك الحشوة ATP و NADPH,H+ وتعيد تدوير ADP + Pi و NADP+ الضروريين لعمل التيلاكويدات في المرحلة الكيموضوئية.",
    "التجارب الدالة: تجربة كالفن وبنسون (Calvin & Benson) باستخدام طحلب الكلوريلا والكربون المشع 14C وتتبع المركبات المفصولة بالكروماتوغرافيا، وتجارب غافرون (Gaffron) لبيان أثر قطع الضوء ونفاد CO2 على تركيز APG و RuBP.",
  ],
  scopeOut: [
    "آليات الأيض التناوبي C4 و CAM الخاصة بالنباتات المدارية والصحراوية الخارجة عن البرنامج المرجعي.",
    "الآليات التفصيلية للأكسدة الضوئية التنفسية (Photorespiration) والإنزيمات الوسيطة المعقدة لحلقة التجديد.",
  ],
  prerequisites: {
    hard: ["snv_photosynthesis_photochemical_phase"],
    soft: ["مفهوم الكروماتوغرافيا ثنائية الأبعاد والتسجيل الإشعاعي"],
    foundation: ["التركيب العضوي للسكريات والنشويات في النبات الأخضر"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_CALVIN_01",
      bloomLevel: "understand",
      description_ar: "يوضح خطوات حلقة كالفن (التثبيت، الإرجاع، التجديد) ودور إنزيم الروبيسكو ونواتج المرحلة الكيموضوئية في كل خطوة.",
    },
    {
      code: "LO_SNV_CALVIN_02",
      bloomLevel: "analyze",
      description_ar: "يحلل منحنيات تجارب غافرون وتغير كميات RuBP و APG عند تغيير شروط الإضاءة أو تركيز CO2 ويستنتج العلاقات التبادلية بين المركبات.",
    },
    {
      code: "LO_SNV_CALVIN_03",
      bloomLevel: "evaluate",
      description_ar: "يبرهن على التكامل الوظيفي المزدوج بين تفاعلات التيلاكويد (الكيموضوئية) وتفاعلات الحشوة (الكيميوحيوية).",
    },
  ],
  coreConcepts_ar: [
    "حشوة الصانعة (Stroma): الموقع الكيميائي الحيوي المائي الحاوي على إنزيمات حلقة كالفن وموقع تصنيع السكريات.",
    "إنزيم الروبيسكو (Rubisco): الإنزيم الرئيسي المسؤول عن دمج وتثبيت CO2 المعدني في المركبات العضوية.",
    "مركب RuBP: ريبولوز ثنائي الفوسفات، سكر خماسي يمثل المستقبل الأولي لغاز CO2.",
    "مركب APG: حمض فوسفوغليسيريك، أول مركب عضوي كربوني ثابت يظهر بعد تثبيت CO2 المشع.",
    "سكر ثلاثي PGAL: سكر فوسفاتي ثلاثي ناتج عن اختزال APG ويمثل نقطة الانطلاق لبناء النشاء وتجديد RuBP.",
    "التكامل الوظيفي: دورة المواد بين التيلاكويد والحشوة (تصدير ATP و NADPH,H+، واسترجاع ADP + Pi و NADP+).",
  ],
  lessonPackage: {
    overview_ar: "تمثل المرحلة الكيميوحيوية (حلقة كالفن) المرحلة الثانية من التركيب الضوئي، وتحدث في حشوة الصانعة الخضراء حيث يتم إرجاع وتثبيت غاز ثاني أكسيد الكربون غير العضوي (CO2) ودمجه في جزيئات سكرية عضوية باستهلاك نواتج المرحلة الكيموضوئية (ATP و NADPH,H+).",
    biologicalMechanism_ar: [
      "1. خطوة تثبيت CO2: يرتبط كل جزيء CO2 بجزيء من الريبولوز ثنائي الفوسفات (RuBP: 5 كربون) بفضل النشاط التحفيزي لإنزيم الروبيسكو (Rubisco)، ليتشكل مركب سداسي الكربون غير مستقر وسرعان ما ينشطر إلى جزيئتين من حمض الفوسفوغليسيريك (APG: 3 كربون لكل جزيء).",
      "2. خطوة الإرجاع واستهلاك نواتج المرحلة الأولى: تتم فسفرة APG بواسطة ATP ثم اختزاله بواسطة الإلكترونات والبروتونات المحمولة على NADPH,H+، فيتحول إلى فوسفوغليسيرالدهيد (PGAL / سكر ثلاثي مفسفر)، مع انطلاق ADP و Pi و NADP+ الحرة التي تعود للتيلاكويدات.",
      "3. خطوة اصطناع المادة العضوية وتجديد RuBP: لتثبيت 6 جزيئات CO2، تتشكل 12 جزيئة من PGAL؛ تستخدم جزيئتان (2 PGAL) في اصطناع جزيء جلوكوز (C6H12O6) الذي يتبلمر لاحقاً إلى نشاء، بينما تستخدم الجزيئات العشر المتبقية (10 PGAL) في سلسلة تفاعلات إنزيمية معقدة تعيد تجديد 6 جزيئات من مستقبل الـ RuBP مع استهلاك جزيئات إضافية من الـ ATP.",
      "4. الارتباط الوظيفي الدوري: لا تعمل حلقة كالفن إلا في وجود ATP و NADPH,H+ المتوفرين من التيلاكويد، كما أن التيلاكويد يتوقف نشاطه إذا لم تسترجع الحشوة جزيئات ADP و NADP+ المؤكسدة، مما يجعل المرحلتين متكاملتين تكاملاً بنيوياً وحيوياً حتمياً.",
    ],
    evidenceAndObservation_ar: "في تجربة كالفن، وضع معلق طحلب الكلوريلا في جهاز خاص مع إمداده بـ 14CO2 والضوء، وحقنت العينات في كحول مغلي بعد فترات زمنية دقيقة جداً (من ثانية إلى بضع دقائق) لوقف التفاعلات الحيوية فوراً. أظهر التحليل الكروماتوغرافي المشع ظهور APG المشع بعد ثانيتين فقط كأول مركب كربوني مشع، تلاه ظهور السكريات الثلاثية (PGAL) والأحادية ثم النشاء بعد 5 ثوانٍ إلى دقائق.",
    scientificReasoning_ar: "نستدل من الظهور المبكر لـ APG في الثانية الثانية على أنه الناتج الأولي المباشر لتثبيت CO2. ونستدل من ظهور PGAL والسكريات لاحقاً على أن APG يخضع لاختزال إنزيمي متدرج يتحول بموجبه إلى سكريات ثلاثية وأحادية، وهو ما يفسر ضرورة تزويد الحشوة بالطاقة والقوة المرجعة المخزنة في ATP و NADPH,H+.",
    biologicalConclusion_ar: "تعد حلقة كالفن الآلية الحيوية المركزية التي تربط العالم المعدني غير الحي بالعالم العضوي الحي، حيث تثبت ذرات الكربون في جزيئات سكرية تشكل عماد الطاقة والغذاء لكافة الكائنات الحية على كوكب الأرض.",
  },
  workedModel: {
    problem_ar: "في تجربة غافرون، عُرّض معلق طحالب خضراء لإضاءة مستمرة في وجود 14CO2 حتى استقرت كميات APG و RuBP عند قيم ثابتة (توازن حركي). عند اللحظة ز1، تم الانتقال المفاجئ من الضوء إلى الظلام التام مع بقاء تركيز CO2 ثابتاً ومتاحاً. لوحظ فوراً: انخفاض حاد في كمية RuBP حتى انعدم، وتزايد سريع في كمية APG حتى بلغ قيمة عظمى ثم استقر. فسر هذه التغيرات على المستوى الجزيئي واستنتج العلاقة بين المركبين.",
    documentData_ar: "البيانات: قبل ز1 (في الضوء): ثبات كميات RuBP و APG. بعد ز1 (في الظلام التام مع توفر CO2): انخفاض وانعدام RuBP، وتراكم حاد لمركب APG.",
    observation_ar: "نلاحظ أن إطفاء الضوء أدى إلى نفاد واختفاء السكر الخماسي RuBP وتراكم الحمض العضوي APG رغم بقاء غاز CO2 متوفراً في الوسط.",
    interpretation_ar: "تفسير انعدام RuBP: في الظلام وبوجود غاز CO2 المستمر، يواصل إنزيم الروبيسكو تثبيت CO2 على جزيئات RuBP المتبقية، فيستهلكها ويحولها إلى APG؛ ونظراً لغياب الضوء، تتوقف تفاعلات المرحلة الكيموضوئية وتنفد جزيئات ATP و NADPH,H+، مما يمنع إعادة تجديد RuBP انطلاقاً من PGAL، فينفد الـ RuBP تدريجياً حتى ينعدم كلياً.\nتفسير تراكم APG: استمرار تحول RuBP إلى APG بدمج CO2 يؤدي إلى تشكل كميات جديدة من APG؛ لكن تحويل APG إلى PGAL يتطلب وجوباً استهلاك ATP و NADPH,H+، وبغيابهما في الظلام يتعطل اختزال APG فيتراكم في الحشوة ولا يستطيع إكمال مساره نحو السكريات.",
    deduction_ar: "نستنتج أن RuBP هو المستقبل المباشر لـ CO2، وأن تحويل APG إلى RuBP وسكريات يتطلب حتماً نواتج المرحلة الكيموضوئية (ATP و NADPH,H+)، مما يثبت الاعتماد الوثيق للمرحلة الكيميوحيوية على نواتج المرحلة الضوئية.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_calvin_l1_01",
      capabilityId: "snv_photosynthesis_calvin_cycle_synthesis",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 4,
      prompt_ar: "ما هو المركب الكيميائي الأول الثابت كربونياً الذي يظهر بعد تثبيت غاز 14CO2 في حلقة كالفن عند نباتات التمثيل الضوئي؟\nأ) سكر الجلوكوز (Glucose)\nب) حمض الفوسفوغليسيريك (APG / 3-PGA)\nج) ريبولوز ثنائي الفوسفات (RuBP)\nد) النشا الحشوي (Amidon)",
      expectedResponse_ar: "ب) حمض الفوسفوغليسيريك (APG / 3-PGA)",
      reasoningSteps_ar: [
        "في تجارب كالفن وبنسون، أظهر التصوير الإشعاعي بعد ثانيتين ظهور مركب واحد يحتوي على الكربون المشع 14C.",
        "هذا المركب هو حمض الفوسفوغليسيريك ثلاثي الكربون الناتج عن انشطار المركب السداسي غير المستقر.",
      ],
      biologicalModel_ar: {
        system_ar: "حشوة الصانعة الخضراء لطحلب الكلوريلا",
        experimentalConditions_ar: "تغذية بالطحلب في وجود 14CO2 والضوء مع التوقيف الفوري بعد ثانيتين",
        governingBiologicalMechanisms_ar: ["تثبيت CO2 بواسطة إنزيم الروبيسكو", "انشطار المركب الوسيط السداسي"],
        evidenceExtracted_ar: "الكروماتوغرافيا ثنائية الأبعاد وتحديد الإشعاع",
        deductionOrConclusion_ar: "APG هو المستقلب العضوي الأول الثابت في حلقة كالفن",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين المركب الأول RuBP الذي يثبت CO2 والمركب الناتج الأول APG، أو التسرع باختيار الجلوكوز كناتج نهائي للتركيب الضوئي.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: درجة كاملة لاختيار الخيار الصحيح (ب).",
    },
    l2_application: {
      id: "snv_calvin_l2_01",
      capabilityId: "snv_photosynthesis_calvin_cycle_synthesis",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 7,
      prompt_ar: "علل بيولوجياً: لماذا يتوقف تثبيت ثاني أكسيد الكربون (CO2) في حشوة الصانعة الخضراء بعد بضع ثوانٍ إلى دقائق من وضع النبات في الظلام، رغم أن إنزيم الروبيسكو لا يتطلب الضوء مباشرة لنشاطه؟",
      expectedResponse_ar: "يتوقف تثبيت CO2 في الظلام لسببين متتاليين:\n1) ارتباط تثبيت CO2 بوجود السكر الخماسي RuBP: يقوم إنزيم الروبيسكو بربط CO2 مع مادة التفاعل الخاصة به وهي الـ RuBP.\n2) نفاد الـ RuBP في الظلام: إعادة تجديد جزيئات الـ RuBP انطلاقاً من السكريات الثلاثية (PGAL) تشترط استهلاك نواتج المرحلة الكيموضوئية (ATP و NADPH,H+). في الظلام، تتوقف التيلاكويدات عن إمداد الحشوة بهذه المركبات الطاقوية وتنفد مدخراتها السريعة، مما يؤدي إلى توقف حلقة كالفن واستهلاك كامل مخزون الـ RuBP وتحوله إلى APG دون أن يتم تجديده.\nبفقدان مادة التفاعل الأساسية (RuBP)، يعجز إنزيم الروبيسكو عن تثبيت أي جزيء إضافي من CO2 ويتوقف التثبيت نهائياً.",
      reasoningSteps_ar: [
        "تحديد حاجة إنزيم الروبيسكو للركيزة RuBP لتثبيت CO2.",
        "توضيح آلية تجديد RuBP بالاعتماد الإلزامي على ATP و NADPH,H+.",
        "استنتاج نفاد الركيزة في الظلام وشلل التثبيت.",
      ],
      biologicalModel_ar: {
        system_ar: "حشوة الصانعة الخضراء في غياب الإضاءة",
        experimentalConditions_ar: "حجب الضوء مع بقاء CO2",
        governingBiologicalMechanisms_ar: ["الاعتمادية الطاقوية لحلقة كالفن على التيلاكويد"],
        evidenceExtracted_ar: "توقف تثبيت CO2 بعد انقطاع الضوء بفترة وجيزة",
        deductionOrConclusion_ar: "المرحلة الكيميوحيوية مظلمة كيميائياً لكنها تابعة ضوئياً عبر وسائط الطاقة",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن إنزيم الروبيسكو نفسه يتفكك في الظلام أو أن الضوء ينشطه مباشرة.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لتحديد استهلاك ونفاد ركيزة RuBP، 1.0 ن لربط تجديد RuBP بنفاد ATP و NADPH,H+ في الظلام.",
    },
    l3_mixed: {
      id: "snv_calvin_l3_01",
      capabilityId: "snv_photosynthesis_calvin_cycle_synthesis",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "تمثل الوثيقة تطور كميتي RuBP و APG في معلق طحالب الكلوريلا المعرض لضوء مستمر في حالتين تجريبيتين:\n- الحالة 1 (من ز0 إلى ز1): تركيز CO2 مرتفع وثابت (1%).\n- الحالة 2 (من ز1 إلى ز2): خفض مفاجئ لتركيز CO2 إلى نسبة شبه منعدمة (0.003%) مع استمرار الضوء.\nأظهرت النتائج في الحالة 2: انخفاضاً حاداً وسريعاً في كمية APG، وتراكماً سريعاً في كمية RuBP حتى بلغت قيمة عظمى مرتفعة.\nحلل معطيات الوثيقة تحليلاً مقارناً وفسر بيولوجياً سبب تراكم RuBP وانخفاض APG في الحالة 2.",
      expectedResponse_ar: "التحليل المقارن:\n- في الحالة 1 (في وجود الضوء وتركيز CO2 مرتفع 1%): نلاحظ استقرار كميتي كل من APG و RuBP عند قيم ثابتة متوازنة، مما يدل على وجود توازن حركي مستمر بين استهلاك وإنتاج المركبين في حلقة كالفن.\n- في الحالة 2 (عند خفض تركيز CO2 إلى 0.003% مع بقاء الضوء): نلاحظ تناقصاً سريعاً وشديداً لكمية APG يقابله تزايد سريع وحاد لكمية RuBP حتى تستقر عند قيمة مرتفعة جداً، مما يدل على اختلال التوازن الحركي لصالح RuBP على حساب APG.\nالتفسير البيولوجي:\n1) سبب انخفاض APG: بانعدام غاز CO2، يتعطل تفاعل الكربكسلة لإنزيم الروبيسكو ويتوقف تشكل جزيئات جديدة من APG؛ وبما أن الضوء ما زال متوفراً، فإن ATP و NADPH,H+ متوفران بكثرة، مما يسمح باستمرار اختزال جزيئات الـ APG المتبقية وتحويلها سريعاً إلى PGAL، فيتناقص مخزون APG حتى يكاد ينعدم.\n2) سبب تراكم RuBP: استمرار توفر ATP والمشتقات السكرية يسمح بتجديد جزيئات RuBP انطلاقاً من PGAL؛ ولكن نظراً لغياب CO2 في الوسط، تعجز جزيئات RuBP المتجددة عن التفاعل أو استهلاك نفسها في الكربكسلة، فتتراكم في الحشوة دون أن تجد ما تتفاعل معه.",
      reasoningSteps_ar: [
        "المقارنة الدقيقة بين حالة التوازن (CO2 كافٍ) وحالة الاختلال (CO2 منعدم).",
        "تفسير انخفاض APG بتوقف إنتاجه واستمرار استهلاكه في الاختزال لتوفر ATP و NADPH,H+.",
        "تفسير تراكم RuBP باستمرار تجديده وعجزه عن الاستهلاك لغياب CO2.",
      ],
      biologicalModel_ar: {
        system_ar: "حلقة كالفن تحت صدمة نفاد الكربون المعدني",
        experimentalConditions_ar: "إضاءة مستمرة مع خفض حاد لتركيز CO2",
        governingBiologicalMechanisms_ar: ["الاقتران الدوري والتوازن الحركي لركائز حلقة كالفن"],
        evidenceExtracted_ar: "تراكم RuBP وتناقص APG الفوري عند سحب CO2",
        deductionOrConclusion_ar: "RuBP هو المستقبل الذي يستهلك CO2 و APG هو نتاج هذا التثبيت",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "عكس التفسير بين المركبين أو ادعاء أن RuBP يتحول مباشرة إلى APG دون حاجة لـ CO2.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن للتحليل المقارن السليم للحالتين، 1.0 ن لتفسير انخفاض APG، 1.0 ن لتفسير تراكم RuBP.",
    },
    l4_transfer: {
      id: "snv_calvin_l4_01",
      capabilityId: "snv_photosynthesis_calvin_cycle_synthesis",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 12,
      prompt_ar: "في ظروف الجفاف الشديد والحرارة المرتفعة صيفاً، تلجأ النباتات البرية إلى غلق ثغورها الورقية (Stomates) لتقليل فقدان الماء بالنتح. أظهرت القياسات الحيوكيميائية على هذه النباتات بعد ساعات من غلق الثغور في وضح النهار: انخفاضاً حاداً في تثبيت CO2، تراجعاً في اصطناع السكريات، وتراكماً للمركب RuBP يليه لاحقاً انخفاض في وتيرة انطلاق غاز O2 من التيلاكويدات رغم استمرار الإشعاع الشمسي القوي. فسر استدلالاً بالآليات الجزيئية كيف يؤدي غلق الثغور إلى شل المرحلتين الكيميوحيوية والكيموضوئية معاً.",
      expectedResponse_ar: "الاستدلال والتفسير الجزيئي:\n1) أثر غلق الثغور على المرحلة الكيميوحيوية:\n- يؤدي غلق الثغور الورقية لمنع التبخر إلى منع دخول غاز CO2 الجوي إلى الغرف تحت الثغرية وأنسجة الورقة، فينخفض تركيزه الداخلي بشدة.\n- في غياب CO2، يتعطل تفاعل الكربكسلة الذي يحفزه إنزيم الروبيسكو، فيتوقف تحويل RuBP إلى APG؛ ويتراكم RuBP مؤقتاً ويتوقف بناء السكريات الثلاثية والنشاء.\n2) أثر شلل حلقة كالفن الرجعي على المرحلة الكيموضوئية:\n- بتوقف حلقة كالفن، يتوقف استهلاك نواتج التيلاكويد (ATP و NADPH,H+)، وتتعطل عملية إرجاع الفوسفات غير العضوي وتفريغ النواقل المرجعة، مما يؤدي إلى نفاد جزيئات الـ ADP + Pi ونفاد مستقبلات الإلكترونات المؤكسدة (NADP+) في الحشوة.\n- في غياب المستقبل المؤكسد الأخير (NADP+)، تنسد سلسلة نواقل الإلكترونات في التيلاكويد وتتشبع بالنواقل المرجعة، فيعجز مركز التفاعل في PSII عن طرد إلكترونات جديدة وتتوقف الأكسدة الضوئية للماء، مما يؤدي بالتبعية إلى انخفاض وتوقف انطلاق غاز الأكسجين (O2) رغم شدة الضوء.\nالخلاصة: يؤكد هذا التسلسل السببي التأثير المتبادل والتكامل الوظيفي الإلزامي بين المرحلتين: شلل تفاعلات الحشوة لغياب الركيزة الكربونية يرتد تلقائياً ليشل تفاعلات التيلاكويد لغياب الركائز الطاقوية والمستقبلات المؤكسدة.",
      reasoningSteps_ar: [
        "ربط غلق الثغور بنقص CO2 الداخلي وتوقف الكربكسلة وتراكم RuBP.",
        "تتبع الآثار الرجعية على التيلاكويد: عدم استهلاك ATP و NADPH,H+ -> نفاد ADP و NADP+.",
        "انسداد سلسلة نقل الإلكترونات وتوقف أكسدة الماء وانطلاق O2.",
      ],
      biologicalModel_ar: {
        system_ar: "الخلية النباتية الكاملة تحت الإجهاد المائي الحاد",
        experimentalConditions_ar: "إضاءة شديدة مع غلق فيزيولوجي للثغور",
        governingBiologicalMechanisms_ar: ["التغذية الراجعة السلبية لتراكم النواقل المرجعة", "التكامل المزدوج للتركيب الضوئي"],
        evidenceExtracted_ar: "تراجع تثبيت الكربون تلاه تراجع انطلاق الأكسجين في الضوء",
        deductionOrConclusion_ar: "توقف تفاعلات الحشوة يشل حتماً تفاعلات التيلاكويد بفقدان المستقبلات المؤكسدة",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "حصر أثر غلق الثغور في منع الضوء أو الاعتقاد بأن التيلاكويدات تستمر في انطلاق الأكسجين بلا نهاية وبمعزل عن حلقة كالفن.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5 ن لتفسير شلل حلقة كالفن بنقص CO2، 1.5 ن لتفسير التغذية الراجعة وتوقف أكسدة الماء لغياب NADP+، 1.0 ن لاستنتاج التكامل الوظيفي المزدوج.",
    },
    l5_bac_style: {
      id: "snv_calvin_l5_01",
      capabilityId: "snv_photosynthesis_calvin_cycle_synthesis",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 18,
      prompt_ar: "لدراسة تفاعلات حلقة كالفن، استعمل باحثون مركب حمض اليودوأسيتيك (Iodoacétate) وهو مثبط نوعي غير عكوس لإنزيم 'ثلاثي فوسفات ديهيدروجيناز' (Triose-phosphate déshydrogénase) المسؤول في الحشوة عن اختزال 1,3-ثنائي فوسفوغليسيرات إلى PGAL باستهلاك NADPH,H+.\nتمت إضافة هذا المثبط إلى معلق صانعات خضراء سليمة مضاءة باستمرار في وجود 14CO2 وقيست تغيرات المواد المشعة ونواتج التيلاكويد.\n1) بين المتغيرات المتوقعة لكميات كل من: APG، RuBP، والسكريات السداسية المشعة بعد إضافة المثبط مع التعليل البيولوجي.\n2) ما هو الأثر المتوقع لحقن هذا المثبط على كمية غاز O2 المنطلقة من الصانعات الخضراء؟ برر إجابتك بالربط بين المرحلتين.\n3) لخص في رسم وظيفي تخطيطي مبسط العلاقات التبادلية بين تفاعلات التيلاكويد وتفاعلات الحشوة مبرزاً المواد المتبادلة بينهما.",
      expectedResponse_ar: "1) المتغيرات المتوقعة مع التعليل البيولوجي:\n- كمية APG: تتراكم بشكل هائل وتتزايد كميتها؛ التعليل: لأن تفاعل تثبيت CO2 على RuBP مستمر بإنزيم الروبيسكو، بينما تفاعل اختزال APG ومشتقاته نحو PGAL قد ثُبط كلياً بفعل مادة اليودوأسيتيك، مما يمنع استهلاكه فيتراكم.\n- كمية RuBP: تنخفض تدريجياً حتى تنعدم كلياً؛ التعليل: لأن RuBP يستهلك باستمرار في الكربكسلة مع CO2، بينما توقف تشكل PGAL يمنع كلياً إعادة تجديد جزيئات الـ RuBP في الحلقة.\n- كمية السكريات السداسية المشعة: تتوقف عن التزايد وتبقى منعدمة تقريباً؛ التعليل: لأن السكريات السداسية تشيد انطلاقاً من جزيئات PGAL، وبتثبيط إنزيم الاختزال يغيب PGAL وتتعطل كل مسارات البناء الحيوي للنشويات والسكريات.\n2) الأثر المتوقع على انطلاق غاز O2 والتبرير:\n- الأثر: ينخفض انطلاق غاز O2 تدريجياً حتى يتوقف نهائياً.\n- التبرير: بتثبيط إنزيم الاختزال، يتوقف استهلاك NADPH,H+ في الحشوة، فيبقى في حالته المرجعة وتنفد جزيئات NADP+ المؤكسدة في الحشوة؛ بغياب المستقبل النهائي للإلكترونات، تتوقف سلسلة النواقل في غشاء التيلاكويد عن العمل ويتشبع P680 بالإلكترونات، مما يمنع حدوث الأكسدة الضوئية للماء فيتوقف فوراً تحرير غاز O2.\n3) ملخص العلاقات التبادلية (الرسم الوظيفي):\n- التيلاكويد: يستقبل الضوء و H2O -> يحرر O2، ويصدر نحو الحشوة ATP و NADPH,H+.\n- الحشوة: تستقبل CO2 ونواتج التيلاكويد -> تنتج السكريات العضوية، وتعيد تصدير ADP + Pi و NADP+ المؤكسدة نحو التيلاكويد لإعادة شحنها.",
      reasoningSteps_ar: [
        "تحليل نقطة التثبيط الكيميائي في مسار الحلقة (خطوة الاختزال نحو PGAL).",
        "استنتاج عواقب التثبيط على الركائز قبل الخطوة (تراكم APG) وبعد الخطوة (انعدام PGAL و RuBP والسكريات).",
        "ربط تراكم النواقل المرجعة بتعطيل أكسدة الماء وانطلاق الأكسجين.",
        "بناء نموذج تركيبي متكامل للمبادلات بين الحشوة والتيلاكويد.",
      ],
      biologicalModel_ar: {
        system_ar: "حشوة الصانعة الخضراء تحت تأثير مثبط نوعي لمسار الاختزال",
        experimentalConditions_ar: "إضاءة وتغذية بـ 14CO2 مع حقن اليودوأسيتيك",
        governingBiologicalMechanisms_ar: ["الانسداد الإنزيمي الموضعي", "الترابط الميتابوليكي بين التيلاكويد والحشوة"],
        evidenceExtracted_ar: "تراكم وسائط التفاعل الأولية وانعدام المركبات اللاحقة",
        deductionOrConclusion_ar: "تثبيط اختزال APG يشل حلقة كالفن ويعطل السلسلة الضوئية بالارتداد السلبي",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الظن بأن تثبيط إنزيم في الحشوة لا يمس إطلاقاً عمل التيلاكويد أو انطلاق غاز O2 لكون التيلاكويد يقع في حيز غشائي منفصل.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5 ن للمتغيرات الثلاثة وتعليلها، 1.5 ن لتفسير توقف انطلاق O2 بالاقتران مع NADP+، 1.0 ن لتحديد مدخلات ومخرجات الرسم التخطيطي التبادلي.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين مفهوم 'المرحلة المظلمة' وافتراض أنها تحدث في الليل باستقلالية تامة، أو العجز عن تتبع دورة الكربون ومعرفة سبب تراكم أو نفاد RuBP و APG عند تغيير متغيرات الإضاءة أو تركيز CO2.",
    wrongMentalModel_ar: "حلقة كالفن تعمل في الليل والظلام لأنها تسمى المرحلة المظلمة.",
    correctMentalModel_ar: "حلقة كالفن لا تحتاج فوتونات الضوء كجسيمات لكنها تحتاج 'بطاريات' الضوء (ATP و NADPH,H+) المشحونة نهاراً، فإذا فرغت البطاريات في الظلام توقفت الحلقة في بضع ثوانٍ.",
    threeStepActionProtocol_ar: [
      "1. حدد التفاعل الأول: CO2 + RuBP (5C) -> 2 APG (3C) بواسطة إنزيم الروبيسكو (لا يحتاج ATP).",
      "2. حدد التفاعل الثاني: APG + ATP + NADPH,H+ -> PGAL (3C) (يحتاج حصراً نواتج التيلاكويد).",
      "3. طبق قاعدة التوازن: قطع الضوء = توقف الخطوة 2 وتراكم APG ونفاد RuBP؛ قطع CO2 = توقف الخطوة 1 وتراكم RuBP وتناقص APG.",
    ],
    microDrill_ar: {
      prompt_ar: "في تجربة على حلقة كالفن، متى نلاحظ تراكماً حاداً لمركب RuBP: هل عند إطفاء الضوء أم عند خفض تركيز CO2؟ علل في جملة واحدة.",
      solution_ar: "نلاحظ تراكم RuBP عند خفض تركيز CO2؛ لأن تجديده من PGAL يستمر لتوفر ATP بينما يتعطل استهلاكه في التثبيت لغياب غاز CO2.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_calvin_retest_01",
    invariantTested_ar: "التحكم في ديناميكية حلقة كالفن والارتباط بين نواتج التيلاكويد وتثبيت الكربون.",
    changedSurface_ar: "تطبيق على مادة الغليسيرالدهيد (Glycéraldéhyde) المثبطة لإنزيم فسفوريبولوكيناز (Phosphoribulokinase) الذي يركب RuBP في الخطوة الأخيرة من الحلقة.",
    prompt_ar: "مركب الغليسيرالدهيد يثبط نوعياً إنزيم فسفوريبولوكيناز في حشوة الصانعة الخضراء، وهو الإنزيم المسؤول عن فسفرة الريبولوز أحادي الفوسفات إلى ريبولوز ثنائي الفوسفات (RuBP) باستهلاك الـ ATP. تنبأ بالآثار المترتبة عن إضافة هذا المركب في وجود الضوء و CO2 على كل من: 1) كمية RuBP، 2) تثبيت CO2، 3) مصير جزيئات ATP المتشكلة في التيلاكويدات. برر إجابتك.",
    solution_ar: "التنبؤ والتبرير العلمي:\n1) كمية RuBP: تنخفض تدريجياً حتى تنعدم تماماً؛ لأن الجزيئات المتوفرة تستهلك في التثبيت بينما يمنع المثبط تصنيع جزيئات جديدة منه.\n2) تثبيت CO2: يتوقف تماماً وينعدم بنفاد RuBP الذي يشكل المستقبل الإلزامي الوحيد الذي يعمل عليه إنزيم الروبيسكو.\n3) مصير جزيئات ATP المتشكلة: يقل استهلاكها وتتراكم في الحشوة إلى حين، مما يؤدي لنفاد جزيئات ADP الحرة بالتدريج، فيتباطأ عمل الكريات المذنبة في غشاء التيلاكويد نتيجة غياب الركائز (ADP + Pi).",
    passCondition_ar: "ربط تثبيط إنزيم تجديد RuBP بنفاده وتوقف تثبيت CO2 وانعكاس ذلك على دورة الـ ADP/ATP.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: كفاءة إنزيم الروبيسكو ومحاولات الهندسة الوراثية لتحسين المردود الزراعي",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "يعتبر إنزيم الروبيسكو (Rubisco) البروتين الأكثر وفرة على وجه الأرض، غير أنه يتميز ببطء تحفيزي ملحوظ؛ كما يمتلك ألفة لغاز الأكسجين O2 إلى جانب ألفته لغاز CO2. يمثل الشكل (1) قياس النشاط التحفيزي للروبيسكو وتثبيت الكربون في نبات القمح تحت تراكيز مختلفة من O2 الجوي (21% مقابل 2%). يمثل الشكل (2) مخططاً يقارن بين مسار تثبيت CO2 الطبيعي في حلقة كالفن والمسار البديل (التنفس الضوئي) الذي يستهلك فيه الروبيسكو جزيئات O2 ويهدر جزءاً من مركب RuBP منتجاً مركبات ثنائية الكربون (فوسفوغليكولات) دون اصطناع سكريات. 1) استخرج من الشكل (1) تأثير الأكسجين على كفاءة تثبيت CO2. 2) فسر انطلاقاً من الشكل (2) كيف يقلل التنفس الضوئي من المحصول السكري للنبات. 3) اقترح حلاً بيوتكنولوجياً مستقبلياً يهدف لرفع المردود المحصولي لنبات القمح مستنداً إلى معطيات الموضوع.",
    modelSolution_ar: [
      "1) استخراج التأثير من الشكل (1): نلاحظ أن تثبيت CO2 ومعدل التركيب الضوئي في تركيز أكسجين منخفض (2% O2) أعلى بكثير (زيادة تقارب 30-40%) مقارنة بتركيز الأكسجين الطبيعي في الهواء (21% O2)، مما يبين أن الأكسجين يمارس تأثيراً مثبطاً ومنافساً لتثبيت غاز CO2 بواسطة إنزيم الروبيسكو.",
      "2) تفسير تقليل المحصول السكري بالتنفس الضوئي: يمتلك الموقع الفعال لإنزيم الروبيسكو ألفة مزدوجة، فعند ارتفاع نسبة O2 يتنافس الأكسجين مع CO2 على نفس الموقع؛ فعوض أن يربط الروبيسكو CO2 مع RuBP ليعطي جزيئتين من APG، يقوم بأكسدة RuBP معطياً جزيئة واحدة من APG وجزيئة من فوسفوغليكولات غير المفيدة في صنع السكر. يتطلب التخلص من هذه المادة استهلاك طاقة إضافية وإطلاق جزيئات CO2 مثبتة سابقاً، مما يهدر قسماً كبيراً من مستقبل الـ RuBP ومن الـ ATP و NADPH,H+ دون إنتاج سكريات، فينخفض المردود الصافي لحلقة كالفن ويتراجع إنتاج النشاء والكتلة الحيوية.",
      "3) الاقتراح البيوتكنولوجي لرفع المحصول: إجراء تعديل وراثي (Génie génétique) للمورثة المشفرة للموقع الفعال لإنزيم الروبيسكو في نبات القمح، بهدف استبدال أحماض أمينية محددة تزيد من ألفته واصطفائيته الفراغية لغاز CO2 وتقلل من قدرته على الارتباط بالأكسجين، أو نقل مورثات مسار تثبيت الكربون C4 من نباتات الذرة إلى القمح لعزل الإنزيم في بيئة غنية دوماً بـ CO2 ومنع ظاهرة التنفس الضوئي.",
    ],
    markingScheme_ar: [
      { criterion: "استخراج الأثر التثبيطي للأكسجين على تثبيت CO2 من الشكل (1)", points: 1.0 },
      { criterion: "تفسير هدر RuBP والطاقة في التنفس الضوئي وتراجع بناء السكر من الشكل (2)", points: 2.5 },
      { criterion: "اقتراح تعديل وراثي لزيادة ألفة الموقع الفعال لـ CO2 أو نقل مورثات C4", points: 1.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 196-215)",
    historicalBacRef: "BAC 2018 Sciences Expérimentales Sujet 2 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 14. snv_cellular_respiration_glycolysis_krebs
// ============================================================================

export const SNV_CELLULAR_RESPIRATION_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_cellular_respiration_glycolysis_krebs",
  canonicalTitle_ar: "التنفس الخلوي: التحلل السكري، أكسدة البيروفيك، دورة كريبس والفسفرة التأكسدية",
  canonicalTitle_fr: "Respiration cellulaire : glycolyse, cycle de Krebs et phosphorylation oxydative",
  discipline: "natural_sciences",
  domain: "التحولات الطاقوية",
  unit: "آليات تحويل الطاقة الكيميائية الكامنة في الجزيئات العضوية إلى ATP (التنفس والتخمر)",
  status: "APPROVED_WITH_MINOR_EDITS",
  scopeIn: [
    "التحلل السكري (Glycolyse) في الهيولى الأساسية (Hyaloplasme): أكسدة الجلوكوز اللاهوائية إلى جزيئتين من حمض البيروفيك (Acide pyruvique) مع إنتاج 2 ATP و 2 NADH,H+.",
    "البنية فوق الخلوية للميتوكوندري (Mitochondrie): الغشاء الخارجي، الحيز بين الغشائين، الغشاء الداخلي الغني بالأعراف والإنزيمات التنفسية، والمادة الأساسية (Matrice).",
    "الأكسدة التنفسية في المادة الأساسية: أكسدة البيروفيك إلى أسيتيل مرافق الإنزيم أ (Acétyl-CoA) ثم دخوله في دورة كريبس (Cycle de Krebs) مع طرح CO2 واختزال النواقل (NADH,H+ و FADH2) وإنتاج ATP.",
    "الفسفرة التأكسدية (Phosphorylation oxydative) في الغشاء الداخلي للميتوكوندري: أكسدة النواقل المرجعة، انتقال الإلكترونات عبر السلسلة التنفسية وصولاً إلى O2 كمستقبل أخير لتشكيل H2O.",
    "ضخ البروتونات وتوليد تدرج H+ عبر الغشاء الداخلي (تراكم H+ في الحيز بين الغشائين) وتدفقها عبر الكريات المذنبة لاصطناع حصيلة طاقوية مرتفعة (حوالي 36 إلى 38 ATP لكل جزيء جلوكوز).",
    "مقارنة التنفس مع التخمر (Fermentation): مسار لاهوائي يتم في الهيولى بإرجاع البيروفيك دون تدخل الميتوكوندري مع مردود طاقوي ضعيف (2 ATP).",
  ],
  scopeOut: [
    "الحسابات التفصيلية المعقدة لبروتينات المكوك (Navettes glycérol-phosphate / malate-aspartate) الخارجة عن المنهاج.",
    "البنية البيوفيزيائية الذرية للمعقدات التنفسية الأربعة بتفاصيلها الجامعية التخصصية.",
  ],
  prerequisites: {
    hard: ["snv_enzyme_kinetics_active_site_regulation", "snv_photosynthesis_photochemical_phase"],
    soft: ["مفهوم الأكسدة والإرجاع وسلسلة نقل الإلكترونات وتدرج البروتونات"],
    foundation: ["بنية الخلية الحيوانية والنباتية ومفهوم الأيض الطاقوي والتنفس"],
    crossCutting: ["snv_document_analysis_information_extraction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_RESP_01",
      bloomLevel: "understand",
      description_ar: "يحدد مراحل الهدم الكلي للجلوكوز ومقارها الخلوية (التحلل في الهيولى، دورة كريبس في المادة الأساسية، والفسفرة التأكسدية في الأعراف).",
    },
    {
      code: "LO_SNV_RESP_02",
      bloomLevel: "analyze",
      description_ar: "يفسر آلية عمل السلسلة التنفسية والاقتران بين أكسدة النواقل وضخ البروتونات لاصطناع ATP واختزال O2 إلى ماء.",
    },
    {
      code: "LO_SNV_RESP_03",
      bloomLevel: "evaluate",
      description_ar: "يقارن بين المردود الطاقوي للتنفس الخلوي (هدم كلي) والتخمر (هدم جزئي) ويحلل أثر السموم والمثبطات التنفسية.",
    },
  ],
  coreConcepts_ar: [
    "التحلل السكري (Glycolyse): مرحلة هيولية لاهوائية مشتركة تشطر الجلوكوز إلى جزيئتين من البيروفيك.",
    "حمض البيروفيك (Pyruvate): مستقلب وسيط محوري ينفذ إلى الميتوكوندري لمواصلة الأكسدة في وجود O2.",
    "دورة كريبس (Cycle de Krebs): حلقة أكسدة كربونية في المادة الأساسية تحرر CO2 وتنتج طاقة ونواقل مرجعة.",
    "السلسلة التنفسية الغشائية: معقدات بروتينية في الغشاء الداخلي تنقل الإلكترونات نحو الأكسجين وتضخ H+ نحو الحيز.",
    "الفسفرة التأكسدية: استغلال القوة الدافعة البروتونية المتولدة عبر الغشاء الداخلي لتركيب كميات هائلة من الـ ATP.",
    "المستقبل النهائي (O2): جزيء الأكسجين الذي يستقبل الإلكترونات والبروتونات ليتشكل الماء التنفسي H2O.",
  ],
  lessonPackage: {
    overview_ar: "التنفس الخلوي هو آلية الهدم الإنزيمي الكلي للمادة العضوية (مثل الجلوكوز) في وجود الأكسجين، بهدف تحويل الطاقة الكيميائية الكامنة في الروابط الجزيئية إلى طاقة كيميائية حرة قابلة للاستعمال المباشر مخزنة في جزيئات الـ ATP، مع طرح فضلات معدنية خالية من الطاقة (CO2 و H2O).",
    biologicalMechanism_ar: [
      "1. التحلل السكري (الهيولى الأساسية): ينشطر جزيء الجلوكوز (6C) عبر تفاعلات وسيطة إلى جزيئتين من حمض البيروفيك (3C)، مع نزع الهيدروجين واختزال ناقلين: 2 NAD+ -> 2 NADH,H+، وفسفرة مادتين للـ ADP معطية حصيلة صافية قدرها 2 ATP بمعزل تام عن الأكسجين.",
      "2. أكسدة البيروفيك ودورة كريبس (المادة الأساسية للميتوكوندري): ينفذ البيروفيك إلى المادة الأساسية حيث ينزع منه كربون على شكل CO2 ويتحد مع مرافق الإنزيم أ مشكلاً أسيتيل-CoA (2C). يدخل هذا الأخير في دورة كريبس بالاتحاد مع مركب رباعي (حمض الأوكسالواسيتيك) ليتشكل حمض الليمون (الستريك 6C)، ثم تتوالى نزع الكربونات وطرح CO2 ونزع الهيدروجين، فتختزل النواقل (3 NADH,H+ و 1 FADH2 لكل جزيء أسيتيل) ويتشكل جزيء ATP واحد لكل دورة.",
      "3. الفسفرة التأكسدية (الغشاء الداخلي للميتوكوندري): تتأكسد النواقل المرجعة (NADH,H+ و FADH2) محررة إلكتروناتها وبروتوناتها في المعقدات الأولى للسلسلة التنفسية. تسري الإلكترونات تلقائياً عبر السلسلة وفق تزايد كمون الأكسدة والإرجاع نحو المستقبل الأخير وهو غاز الأكسجين O2، فيرجعه إلى ماء: 1/2 O2 + 2H+ + 2e- -> H2O.",
      "4. تدرج البروتونات والكرية المذنبة: أثناء سريان الإلكترونات، تضخ معقدات السلسلة بروتونات H+ من المادة الأساسية نحو الحيز بين الغشائين، فينشأ تدرج كيميائي أوزمولي حاد عبر الغشاء الداخلي. تتدفق البروتونات عائدة إلى المادة الأساسية عبر الكريات المذنبة محفزة إياها على فسفرة ADP إلى ATP بحصيلة إجمالية تقارب 36 إلى 38 ATP لكل جزيء جلوكوز كامل الهدم.",
    ],
    evidenceAndObservation_ar: "أظهرت القياسات البيولوجية في تجارب الاستهلاك التنفسي أنه عند إضافة الجلوكوز لمعلق ميتوكوندريات معزولة لا يطرأ أي استهلاك للأكسجين؛ بينما عند إضافة حمض البيروفيك يُسجل استهلاك فوري وكبير للأكسجين واصطناع هائل للـ ATP. كما بينت تجارب النفاذية والتدرج الشاردي أن إضافة مادة سامة مانعة لنفاذية O2 (مثل السيانيد) توقف فورياً أكسدة النواقل المرجعة وتوقف ضخ البروتونات وتلغي إنتاج ATP كلياً.",
    scientificReasoning_ar: "نستدل من عجز الميتوكوندريات عن استهلاك الجلوكوز المباشر على أن الغشاء الخارجي للميتوكوندري غير نفوذ للجلوكوز أو يفتقر للإنزيمات النوعية لتفكيكه، وأن الهدم الأولي للجلوكوز إلى بيروفيك يجب أن يتم حصراً في الهيولى الأساسية. ونستدل من أثر السيانيد على أن أكسدة النواقل وضخ البروتونات وعمل الكريات المذنبة مرتبطة ارتباطاً كيميائياً وحيوياً حتمياً بسريان الإلكترونات نحو غاز الأكسجين كمستقبل أخير.",
    biologicalConclusion_ar: "يمثل التنفس الخلوي استراتيجية الأكسدة الحيوية الأقصى كفاءة في عالم الأحياء، حيث يتم التفكيك الكامل للجلوكوز بمردود طاقوي يتجاوز 40% من الطاقة الكلية المخزنة، بفضل التعاون الوظيفي المحكم بين الهيولى الأساسية والميتوكوندري.",
  },
  workedModel: {
    problem_ar: "عُزلت ميتوكوندريات سليمة ووضعت في وسط خالٍ من O2 يحتوي على حمض البيروفيك و ADP و Pi ومركب مؤكسد. عند اللحظة ز1، تم حقن كمية محددة من غاز الأكسجين (O2). أظهرت القياسات: هبوطاً سريعاً في تركيز O2 حتى نفاده، رافقه انخفاض مفاجئ في pH الوسط الخارجي (الحيز بين الغشائين) ثم عودته للارتفاع بعد نفاد O2، وتزامناً مع ذلك تشكلت كمية محددة من الـ ATP. فسر هذه التغيرات على المستوى الجزيئي مبيناً علاقة استهلاك O2 باصطناع ATP.",
    documentData_ar: "البيانات: عند إضافة O2: استهلاك سريع للأكسجين، انخفاض باهاء الحيز الخارجي (زيادة H+)، واصطناع متزامن لـ ATP. بعد نفاد O2: توقف اصطناع ATP وارتفاع الباهاء تدريجياً نحو التعادل.",
    observation_ar: "نلاحظ أن تدفق البروتونات نحو الخارج واصطناع ATP يحدثان فقط أثناء وجود واستهلاك الأكسجين، ويتوقفان تماماً بمجرد نفاده.",
    interpretation_ar: "تفسير انخفاض pH الحيز الخارجي: وجود الأكسجين مكنه من أداء دوره كمستقبل أخير للإلكترونات في السلسلة التنفسية، مما أتاح للسلسلة نقل الإلكترونات المؤكسدة من النواقل المرجعة. أثناء هذا الانتقال، قامت معقدات السلسلة بضخ البروتونات H+ بنشاط من المادة الأساسية نحو الحيز بين الغشائين، مما أدى إلى تراكمها وانخفاض الباهاء فيه وتوليد تدرج بروتوني.\nتفسير اصطناع ATP: تدرج البروتونات دفع شوارد H+ للعودة التلقائية نحو المادة الأساسية عبر الكريات المذنبة، فاستغلت طاقتها الحركية لفسفرة ADP و Pi إلى ATP.\nتفسير التوقف بعد نفاد O2: بغياب المستقبل النهائي، انسدت السلسلة التنفسية وتوقف ضخ H+؛ ومع عودة البروتونات المتراكمة إلى الداخل عبر الكريات المذنبة عاد الباهاء للارتفاع وزال تدرج الـ pH، فتوقف اصطناع ATP كلياً.",
    deduction_ar: "نستنتج أن الأكسجين هو المحرك الإلزامي النهائي للفسفرة التأكسدية، حيث يحافظ على سريان الإلكترونات الضروري لضخ البروتونات وتوليد تدرج الـ pH الذي يدير الكريات المذنبة.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_resp_l1_01",
      capabilityId: "snv_cellular_respiration_glycolysis_krebs",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 4,
      prompt_ar: "أين تتم مرحلة التحلل السكري (Glycolyse) أثناء الهدم الخلوي للمادة العضوية، وما هي حصيلتها الطاقوية الصافية المباشرة من الـ ATP لكل جزيء جلوكوز؟\nأ) في المادة الأساسية للميتوكوندري، وتنتج 36 ATP\nب) في الهيولى الأساسية للخلية، وتنتج 2 ATP\nج) في الغشاء الداخلي للميتوكوندري، وتنتج 4 ATP\nد) في تجويف الشبكة الهيولية، وتنتج 1 ATP",
      expectedResponse_ar: "ب) في الهيولى الأساسية للخلية، وتنتج 2 ATP",
      reasoningSteps_ar: [
        "التحلل السكري مرحلة لاأكسجينية أولية تتم في سيتوبلازم (هيولى أساسية) الخلية.",
        "يستهلك التفاعل 2 ATP وينتج 4 ATP، فتكون الحصيلة الصافية المباشرة هي 2 ATP مع 2 NADH,H+.",
      ],
      biologicalModel_ar: {
        system_ar: "الهيولى الأساسية للخلية حقيقية النواة",
        experimentalConditions_ar: "هدم الجلوكوز في غياب أو وجود الأكسجين",
        governingBiologicalMechanisms_ar: ["التحلل السكري اللاهوائي الأولي"],
        evidenceExtracted_ar: "تحديد الموقع والحصيلة الطاقوية المباشرة",
        deductionOrConclusion_ar: "التحلل السكري مرحلة هيولية تنتج 2 ATP صافية فقط",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الخلط بين التحلل السكري والهدم الكلي التنفسي داخل الميتوكوندري الذي ينتج الحصيلة الكبرى من ATP.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: درجة كاملة لاختيار الخيار الصحيح (ب).",
    },
    l2_application: {
      id: "snv_resp_l2_01",
      capabilityId: "snv_cellular_respiration_glycolysis_krebs",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 7,
      prompt_ar: "علل بيولوجياً: لماذا يؤدي وضع ميتوكوندريات معزولة في وسط يحتوي على سكر الجلوكوز إلى انعدام النشاط التنفسي واستهلاك O2، بينما يؤدي تزويدها بحمض البيروفيك إلى انطلاق سريع ونشط للتنفس الخلوي؟",
      expectedResponse_ar: "يعود ذلك إلى الخصائص البنيوية والإنزيمية للميتوكوندري:\n1) عدم نفاذية الغشاء الخارجي للجلوكوز: جزيئة الجلوكوز ذات حجم قطبي نسبي ولا توجد على غشاء الميتوكوندري نواقل نوعية تسمح بمرورها إلى الداخل.\n2) غياب الإنزيمات النوعية: الميتوكوندري لا تحتوي في مادتها الأساسية أو أغشيتها على الإنزيمات المحللة للجلوكوز (إنزيمات التحلل السكري)؛ فهذه الإنزيمات تتواجد حصراً في الهيولى الأساسية.\n3) نفاذية واستجابة الميتوكوندري للبيروفيك: حمض البيروفيك يمتلك نواقل غشائية نوعية تمكنه من اختراق غشاء الميتوكوندري والوصول إلى المادة الأساسية، حيث تتوفر كافة الإنزيمات الضرورية لأكسدته (معقد البيروفيك ديهيدروجيناز وإنزيمات دورة كريبس)، مما يطلق أكسدة النواقل واستهلاك O2 فورا.",
      reasoningSteps_ar: [
        "تحديد غياب نواقل الجلوكوز وإنزيمات التحلل السكري في الميتوكوندري.",
        "تأكيد وجود نواقل البيروفيك والإنزيمات المؤكسدة له في المادة الأساسية.",
        "استنتاج ضرورة مرور الجلوكوز بمرحلة التحلل الهيولي أولاً.",
      ],
      biologicalModel_ar: {
        system_ar: "الميتوكوندريات المعزولة مخبرياً",
        experimentalConditions_ar: "المقارنة بين ركيزة الجلوكوز وركيزة حمض البيروفيك",
        governingBiologicalMechanisms_ar: ["النفاذية الانتقائية والتخصص الإنزيمي المكاني للمستقلبات"],
        evidenceExtracted_ar: "استهلاك O2 بوجود البيروفيك وانعدامه بوجود الجلوكوز",
        deductionOrConclusion_ar: "الميتوكوندري متخصصة في أكسدة نواتج التحلل السكري وليس الجلوكوز الأصلي",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الادعاء الخاطئ بأن الجلوكوز يدخل الميتوكوندري لكنه لا يجد الأكسجين، أو تجاهل التخصص المكاني للإنزيمات.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لتعليل عجز الميتوكوندري عن استعمال الجلوكوز (نفاذية وإنزيمات)، 1.0 ن لتعليل قدرتها على استهلاك البيروفيك.",
    },
    l3_mixed: {
      id: "snv_resp_l3_01",
      capabilityId: "snv_cellular_respiration_glycolysis_krebs",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "تمثل الوثيقة قياس تركيز غاز O2 في وسط يحوي معلق ميتوكوندريات سليمة في الشروط التالية:\n- عند ز0: الميتوكوندريات في محلول ملحي متساوي التوتر مع الأكسجين فقط.\n- عند ز1: حقن كمية من حمض البيروفيك.\n- عند ز2: حقن كمية كافية من الـ ADP و Pi.\n- عند ز3: حقن مادة السيانيد (Cyanure) السامة.\nأظهر المنحنى: ثبات O2 بين ز0 وز1؛ انخفاضاً طفيفاً وبطيئاً بين ز1 وز2؛ انخفاضاً سريعاً وشديد الانحدار بين ز2 وز3؛ وثباتاً أفقياً تاماً فور حقن السيانيد بعد ز3.\nحلل نتائج الوثيقة تحليلاً مدعماً بالدلالات البيولوجية، واستنتج شروط استهلاك الأكسجين في الميتوكوندري.",
      expectedResponse_ar: "التحليل والدلالة البيولوجية لكل مرحلة:\n- من ز0 إلى ز1: ثبات تركيز O2 عند قيمة عظمى، يدل على انعدام النشاط التنفسي في غياب الركيزة الأيضية المناسبة.\n- من ز1 إلى ز2 (بعد إضافة البيروفيك): انخفاض طفيف وبطيء في O2، يدل على بدء دخول البيروفيك وانطلاق أكسدته في دورة كريبس، لكن استهلاك O2 بقي ضعيفاً لغياب ركائز الفسفرة (ADP و Pi).\n- من ز2 إلى ز3 (بعد إضافة ADP و Pi): انخفاض سريع وحاد في تركيز O2، يدل على أن توفر ADP و Pi سمح بحدوث الفسفرة التأكسدية ونشاط الكريات المذنبة، مما أزال الإعاقة البروتونية وحفز السلسلة التنفسية على تسريع أكسدة النواقل واستهلاك O2 بأقصى سرعة (اقتران التنفس بالفسفرة).\n- بعد ز3 (بعد حقن السيانيد): ثبات فوري في تركيز O2 وتوقف استهلاكه تماماً، يدل على أن السيانيد سم قاتل يثبط إنزيمات السلسلة التنفسية (السيتوكروم أكسيداز) ويمنع تفاعل إرجاع O2 إلى ماء.\nالاستنتاج: يشترط استهلاك الأكسجين الفعال في الميتوكوندري توافر الركيزة الأيضية (حمض البيروفيك) واقتران السلسلة بركائز الفسفرة (ADP و Pi) وسلامة معقدات السلسلة التنفسية من المثبطات.",
      reasoningSteps_ar: [
        "تفكيك التسجيل الزمني إلى 4 فترات دقيقة وفق المواد المحقونة.",
        "ربط الانحدار البطيء بنقص ADP والانحدار السريع بحدوث الاقتران التنفسي الكامل.",
        "تفسير شلل السيانيد المباشر للسلسلة التنفسية.",
        "صياغة استنتاج يجمع شروط الاستهلاك التنفسي المقترن.",
      ],
      biologicalModel_ar: {
        system_ar: "معلق ميتوكوندريات في جهاز قياس الاستهلاك الأكسجيني",
        experimentalConditions_ar: "حقن تتابعي للبيروفيك ثم ركائز الفسفرة ثم سم السيانيد",
        governingBiologicalMechanisms_ar: ["الاقتران بين الأكسدة التنفسية والفسفرة التأكسدية (Contrôle respiratoire)"],
        evidenceExtracted_ar: "تسارع استهلاك O2 بوجود ADP وتوقفه التام بالسيانيد",
        deductionOrConclusion_ar: "استهلاك الأكسجين مقترن عضوياً بفسفرة ADP ويتعطل بمثبطات السلسلة",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "عدم الانتباه لدور ADP و Pi في تسريع استهلاك الأكسجين (ظاهرة التحكم التنفسي) والظن بأن إضافة البيروفيك تكفي وحدها لتحقيق أقصى استهلاك.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 0.5 ن لكل مرحلة (2.0 ن للتحليل)، 1.0 ن للاستنتاج العلمي المتكامل لشروط الاستهلاك الأكسجيني.",
    },
    l4_transfer: {
      id: "snv_resp_l4_01",
      capabilityId: "snv_cellular_respiration_glycolysis_krebs",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 12,
      prompt_ar: "مادة 2,4-ثنائي نترو الفينول (DNP) كانت تُستعمل قديماً كمادة لإنقاص الوزن لأنها تحرق الدهون بسرعة، قبل أن تُمنع عالمياً لتسببها في وفيات بحمى مفرطة (Hyperthermie). أظهرت التجارب على الميتوكوندريات المعالجة بـ DNP: استهلاكاً مرتفعاً جداً لغاز O2 وأكسدة سريعة للبيروفيك، يقابلهما انعدام تام لاصطناع الـ ATP وانبعاث حرارة مرتفعة جداً في الوسط.\nفسر استدلالاً بالآليات الجزيئية كيف يتسبب DNP في حرق السكريات والدهون دون إنتاج ATP وظهور الحرارة المميتة.",
      expectedResponse_ar: "الاستدلال والتفسير الجزيئي:\n1) آلية عمل DNP المفرقة للاقتران (Découplant):\n- مادة DNP مركب دهني محب للدسم قادر على حمل شوارد H+ ونقلها بحرية عبر الطبقة الفوسفوليبيدية المضاعفة للغشاء الداخلي للميتوكوندري.\n- يؤدي ذلك إلى تسرب البروتونات مباشرة من الحيز بين الغشائين إلى المادة الأساسية والالتفاف على الكريات المذنبة، مما يزيل تدرج الـ pH كلياً ويمنع بناء القوة الدافعة البروتونية.\n2) انعدام تشكل الـ ATP:\n- بغياب تدرج البروتونات عبر الكريات المذنبة، تعجز هذه الأخيرة عن الدوران وفسفرة ADP، فينعدم اصطناع ATP كلياً رغم النشاط الأيضي المكثف.\n3) تسارع أكسدة المستقلبات وانبعاث الحرارة المفرطة:\n- يزول العائق الكيميائي الأوزمولي المقاوم لضخ البروتونات، فتتحرر السلسلة التنفسية من أي كبح، مما يدفعها لأكسدة النواقل بأقصى سرعة واستهلاك هائل للأكسجين واستنزاف مستمر للبيروفيك والدهون المخزنة لتعويض النواقل المرجعة المستهلكة.\n- بما أن الطاقة الكيميائية الحرة الناتجة عن تدفق الإلكترونات وهدم الغذاء تعجز عن التخزين في روابط الـ ATP، فإنها تتبدد بالكامل على شكل طاقة حرارية ضائعة، مسببة ارتفاعاً خطيراً ومميت في درجة حرارة الجسم (الحمى المفرطة).",
      reasoningSteps_ar: [
        "تحديد الخاصية الجزيئية لـ DNP كناقل حر لـ H+ عبر الغشاء الداخلي.",
        "تفسير زوال تدرج الـ pH وانعدام تشكل ATP بتجاوز الكرية المذنبة.",
        "تفسير الاستهلاك المحموم للدهون وتبدد طاقة الأكسدة كحرارة مفرطة لغياب التخزين الفسفوري.",
      ],
      biologicalModel_ar: {
        system_ar: "الغشاء الداخلي للميتوكوندري تحت تأثير مادة مفككة للاقتران",
        experimentalConditions_ar: "معاملة الميتوكوندري بـ DNP وقياس الأيض والحرارة",
        governingBiologicalMechanisms_ar: ["تبديد الطاقة الكيميائية الأوزمولية", "فك الاقتران بين الأكسدة التنفسية والفسفرة التأكسدية"],
        evidenceExtracted_ar: "استهلاك أكسجين قياسي مع انعدام ATP وارتفاع الحرارة",
        deductionOrConclusion_ar: "سلامة تدرج الـ pH شرط لا غنى عنه لتحويل طاقة الأكسدة إلى روابط ATP حيوية",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن DNP يثبط السلسلة التنفسية أو يمنع استهلاك O2، بينما الحقيقة أنه يفرط في تحفيز الأكسدة مع شل الفسفرة فقط.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لتفسير تسرب H+ وزوال تدرج البروتونات، 1.0 ن لتفسير انعدام تشكل ATP، 1.0 ن لتفسير تسارع حرق الدهون وتبدد الطاقة كحرارة مميتة.",
    },
    l5_bac_style: {
      id: "snv_resp_l5_01",
      capabilityId: "snv_cellular_respiration_glycolysis_krebs",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 18,
      prompt_ar: "داء الميتوكوندريا (Myopathie mitochondriale) مجموعة اضطرابات وراثية نادرة تصيب الأعراف الميتوكوندرية وتؤدي إلى وهن عضلي شديد وتراكم حاد لحمض اللبن (Lactate) في دم المرضى عند بذل أدنى جهد عضلي.\nأظهرت التحاليل البيوكيميائية على خزعة عضلية لمريض مصاب طفرة تؤدي إلى غياب المعقد الرابع للسلسلة التنفسية (Cytochrome c oxydase) في ميتوكوندريات العضلات الهيكلية.\n1) فسر جزيئياً العجز الطاقوي الملاحظ عند المريض ووهنه العضلي رغم تناوله وجبات غذائية طبيعية.\n2) علل سبب التراكم المفرط لحمض اللبن في دم المريض عند بذل مجهود.\n3) قدم حوصلة تركيبية تقارن فيها بين الحصيلة الطاقوية لجزيء جلوكوز يهدم تنفسياً في الخلايا السليمة، وهدمه عند هذا المريض المصاب.",
      expectedResponse_ar: "1) التفسير الجزيئي للعجز الطاقوي والوهن العضلي:\n- المعقد الرابع (Cytochrome c oxydase) هو المحطة الأخيرة في السلسلة التنفسية للميتوكوندري، والمسؤول عن تسليم الإلكترونات إلى غاز الأكسجين (المستقبل النهائي) لإرجاعه إلى ماء.\n- غياب هذا المعقد يمنع تفريغ الإلكترونات على الأكسجين، فتنسد السلسلة التنفسية وتتشبع جميع المعقدات السابقة بالإلكترونات وتتوقف عن العمل.\n- يتوقف ضخ شوارد H+ ويزول تدرج الـ pH عبر الغشاء الداخلي، فتشل الكريات المذنبة وينعدم اصطناع الـ ATP بالفسفرة التأكسدية، كما تتعطل أكسدة النواقل (NADH,H+) مما يشل دورة كريبس بالتبعية.\n- بما أن تقلص الألياف العضلية يشترط إمداداً غزيراً من الـ ATP لتنشيط رؤوس الميوزين وانزلاق الأكتين، فإن هذا الشلل الطاقوي للميتوكوندري يسبب وهناً وارتخاءً عضلياً حاداً.\n2) تعليل التراكم المفرط لحمض اللبن:\n- أمام عجز الميتوكوندريات عن استهلاك البيروفيك والنواقل المرجعة، تلجأ الخلايا العضلية اضطرارياً إلى مسار التخمر اللبني (Fermentation lactique) في الهيولى الأساسية كمسار بديل وحيد لإعادة أكسدة جزيئات NADH,H+ الناتجة عن التحلل السكري لضمان استمرار هذا الأخير وتوليد الحد الأدنى من الطاقة.\n- يتم ذلك بإرجاع حمض البيروفيك بواسطة NADH,H+ إلى حمض اللبن تحت تأثير إنزيم LDH: حمض بيروفيك + NADH,H+ -> حمض لبن + NAD+.\n- يؤدي النشاط المكثف لهذا المسار التعويضي إلى إنتاج كميات هائلة من حمض اللبن الذي يطرح في الدم مسبباً حماضاً دموياً لاكتيكياً وتعباً عضلياً مضاعفاً.\n3) الحوصلة التركيبية المقارنة للحصيلة الطاقوية:\n- في الخلايا السليمة: هدم كلي للجلوكوز عبر التنفس الخلوي (تحلل سكري + دورة كريبس + فسفرة تأكسدية) يعطي حصيلة طاقوية مرتفعة جداً تبلغ حوالي 36 إلى 38 جزيء ATP لكل جزيء جلوكوز (مردود يتجاوز 40%).\n- عند المريض المصاب: يتعطل المسار الميتوكوندري بالكامل، ويقتصر الهدم على التحلل السكري المتبوع بالتخمر اللبني، وتكون الحصيلة الطاقوية هزيلة جداً تبلغ 2 جزيء ATP فقط لكل جزيء جلوكوز (مردود ضعيف جداً لا يتعدى 2%)، مما يفسر استهلاك المريض لكميات ضخمة من السكر مع بقاء العجز الطاقوي مسيطراً.",
      reasoningSteps_ar: [
        "تحديد أثر غياب المعقد الرابع على مسار تدفق الإلكترونات وسريان السلسلة.",
        "ربط انسداد السلسلة بتوقف تدرج H+ وتوقف الفسفرة التأكسدية والوهن.",
        "تفسير التحول القسري نحو التخمر اللبني لإعادة تدوير NAD+ وتراكم اللاكتات.",
        "المقارنة الستوكيومترية الصريحة للحصيلة الطاقوية: 36-38 ATP مقابل 2 ATP.",
      ],
      biologicalModel_ar: {
        system_ar: "العضلة الهيكلية لمريض يعاني اعتلالاً ميتوكوندرياً وراثياً",
        experimentalConditions_ar: "فحص خزعة عضلية مع بذل مجهود حركي",
        governingBiologicalMechanisms_ar: ["الانسداد التنفسي الجيني", "المسار التعويضي للتخمر اللبني وعجز الطاقة"],
        evidenceExtracted_ar: "غياب المعقد الرابع، وهن عضلي، وتراكم حاد للاكتات في الدم",
        deductionOrConclusion_ar: "غياب الفسفرة التأكسدية يحرم الخلية من 95% من طاقتها ويجبرها على التخمر الرديء",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد بأن حمض اللبن ناتج عن ميتوكوندريات المريض، وتجاهل كونه ناتجاً عن تفاعلات الهيولى الأساسية عند توقف الميتوكوندري.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5 ن لتفسير شلل السلسلة وتوقف الفسفرة التأكسدية والوهن، 1.5 ن لتعليل التخمر اللبني لإعادة أكسدة النواقل وطرح اللاكتات، 1.0 ن للمقارنة الطاقوية الشاملة (36-38 ATP مقابل 2 ATP).",
    },
  },
  repairProtocol: {
    diagnosis_ar: "الخلط بين مقر تفاعلات التنفس (الهيولى للتحلل، المادة الأساسية لكريبس، الغشاء الداخلي للفسفرة التأكسدية)، أو الاعتقاد بأن الأكسجين يدخل في تفاعلات التحلل السكري، أو العجز عن فهم أن التخمر مسار اضطراري لإعادة أكسدة النواقل عند غياب أو عجز السلسلة التنفسية.",
    wrongMentalModel_ar: "الأكسجين يفكك السكر مباشرة في الخلية أو التخمر ينتج ماءً و ATP وفير.",
    correctMentalModel_ar: "الجلوكوز يتفكك في السيتوبلازم لقطع أصغر (بيروفيك) ثم تحرقه الميتوكوندري؛ والأكسجين ينتظر في نهاية السلسلة الغشائية كالمكنسة ليسحب الإلكترونات والبروتونات ويشكل الماء، وهو ما يدير الكريات المذنبة لتصنع 36 ATP.",
    threeStepActionProtocol_ar: [
      "1. ارسم خريطة الأماكن: هيولى (تحلل سكري: 2 ATP) -> مادة أساسية (كريبس: طرح CO2 واختزال النواقل) -> أعراف ميتوكوندرية (سلسلة تنفسية واصطناع 32-34 ATP).",
      "2. تتبع دور O2: الأكسجين هو المستقبل النهائي للإلكترونات في الغشاء الداخلي، ويتحد مع H+ ليشكل H2O.",
      "3. قاعدة التخمر: غياب O2 أو تلف الميتوكوندري = توقف السلسلة = لجوء إجباري للتخمر لإنتاج 2 ATP فقط مع تراكم حمض اللبن أو الإيثانول.",
    ],
    microDrill_ar: {
      prompt_ar: "إذا تعطلت الكريات المذنبة في الميتوكوندري ولم تتأثر معقدات نقل الإلكترونات، هل يستمر استهلاك الأكسجين إلى ما لا نهاية؟ برر إجابتك.",
      solution_ar: "لا يستمر إلى ما لا نهاية بل يتباطأ ويتوقف؛ لأن استمرار ضخ H+ دون عودته عبر الكريات المذنبة يولد تدرجاً بروتونياً كهربائياً فائق القوة يعاكس ويمنع استمرار ضخ المزيد من البروتونات، مما يكبح سريان الإلكترونات ويوقف استهلاك الأكسجين (إعاقة كيميائية أوزمولية عكسية).",
    },
  },
  isomorphicRetest: {
    retestId: "snv_resp_retest_01",
    invariantTested_ar: "تحديد آليات السلسلة التنفسية والارتباط الوظيفي بين أكسدة النواقل واستهلاك O2 وتدرج البروتونات.",
    changedSurface_ar: "تطبيق على مادة روتينون (Roténone) وهي سم نباتي ومبيد حشرات يثبط المعقد الأول (Complexe I / NADH déshydrogénase) في الغشاء الداخلي للميتوكوندري.",
    prompt_ar: "مادة الروتينون (Roténone) سم نوعي يمنع انتقال الإلكترونات من جزيئات NADH,H+ إلى المعقد الأول في السلسلة التنفسية للميتوكوندري. تنبأ بالآثار المترتبة عن إضافة الروتينون إلى خلايا كبدية حية على: 1) أكسدة جزيئات NADH,H+، 2) استهلاك غاز O2، 3) إنتاج ATP الخلوي، 4) مصير حمض البيروفيك. برر تنبؤاتك علمياً.",
    solution_ar: "التنبؤ والتبرير العلمي:\n1) أكسدة NADH,H+: تتوقف أكسدته وتتراكم النواقل في حالتها المرجعة بالمادة الأساسية؛ لانسداد المعقد الأول المسؤول عن انتزاع إلكتروناتها.\n2) استهلاك غاز O2: ينخفض استهلاك الأكسجين بشدة ويكاد ينعدم؛ لانقطاع سيل الإلكترونات الواردة من المعقد الأول نحو الأكسجين.\n3) إنتاج ATP الخلوي: ينهار إنتاج ATP الميتوكوندري بزوال تدرج البروتونات وتوقف الكريات المذنبة، ويبقى فقط الإنتاج الهزيل للهيولى.\n4) مصير حمض البيروفيك: يتوقف دخوله في دورة كريبس لنفاد النواقل المؤكسدة (NAD+)، ويتحول قسراً في الهيولى إلى حمض اللبن بإعادة أكسدة النواقل الهيولية لإنقاذ الخلية طاقوياً.",
    passCondition_ar: "الربط المنطقي الدقيق بين تثبيط المعقد الأول وتراكم NADH,H+ وتراجع استهلاك الأكسجين والتحول القسري نحو حمض اللبن.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: التسمم بغاز أول أكسيد الكربون (CO) وشلل التنفس الخلوي",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "يعد غاز أول أكسيد الكربون (CO) المنبعث من المدافئ المعيبة 'القاتل الصامت' المسؤول عن مئات الوفيات سنوياً اختناقاً. يوضح الشكل (1) تشبع خضاب الدم بـ CO حيث يفوق ارتباطه بالهيموغلوبين 200 مرة ارتباط الأكسجين. ويوضح الشكل (2) بنية المعقد الرابع في السلسلة التنفسية للميتوكوندريات (Cytochrome c oxydase) حيث يرتبط CO بنفس موقع تثبيت O2 بروابط غير عكوسة مانعاً انتقال الإلكترونات إليه. 1) استخرج من المعطيات المستويين الفيزيولوجي والخلوي لتأثير غاز CO على تزويد العضوية بالطاقة. 2) فسر انطلاقاً من الشكل (2) الآلية الجزيئية التي تجعل CO قاتلاً سريعاً للخلايا الدماغية والقلبية تحديداً. 3) برر لماذا يعد وضع المصاب فوراً تحت تنفس اصطناعي بأكسجين نقي عالي الضغط (Oxygénothérapie hyperbare) الإسعاف الوحيد الناجع لإنقاذه.",
    modelSolution_ar: [
      "1) مستويا التأثير لغاز CO:\n- المستوى الفيزيولوجي الجهازي: الارتباط التنافسي القوي وغير العكوس بخضاب الدم (Carboxyhémoglobine) يمنع نقل غاز O2 من الرئتين نحو الأنسجة والخلايا.\n- المستوى الخلوي الجزيئي: التثبيط المباشر للمعقد الرابع في السلسلة التنفسية للميتوكوندريات وشلل تفاعلات الأكسدة التنفسية واصطناع الـ ATP.",
      "2) التفسير الجزيئي لسرعة موت خلايا الدماغ والقلب: بارتباط CO بموقع تثبيت O2 في السيتوكروم أكسيداز، تتعطل المرحلة النهائية للأكسدة التنفسية ويتوقف تدفق الإلكترونات في السلسلة التنفسية تماماً. يؤدي ذلك إلى زوال تدرج البروتونات وتوقف الكريات المذنبة وانهيار إنتاج ATP الميتوكوندري (فقدان 95% من الطاقة). ونظراً لأن الخلايا العصبية في الدماغ والخلايا العضلية في القلب خلايا شديدة التمايز والتخصص ذات استهلاك طاقوي هائل دائم، ولا تستطيع الاعتماد على التخمر اللبني لتلبية حاجاتها، فإن نفاد الـ ATP يؤدي في غضون دقائق إلى شلل مضخات الشوارد (Na+/K+)، واختلال التوازن الحلولي، وانتفاخ الخلايا وتمزقها، مما يسبب موتاً دماغياً وسكتة قلبية فورية.",
      "3) تبرير العلاج بالأكسجين عالي الضغط: بما أن التنافس بين CO و O2 على خضاب الدم وموقع المعقد الرابع محكوم بقانون فعل الكتلة، فإن تزويد المريض بأكسجين نقي 100% تحت ضغط عالٍ يرفع ضغط الأكسجين الذائب في البلازما إلى مستويات قياسية؛ هذا التركيز الهائل للأكسجين يرجح كفة التنافس لصالحه فيزيح جزيئات CO تدريجياً من مواقع ارتباطها بالمعقد الرابع وخضاب الدم، مما يسترجع عمل السلسلة التنفسية وينقذ الميتوكوندريات من الشلل الدائم قبل فوات الأوان.",
    ],
    markingScheme_ar: [
      { criterion: "استخراج مستويي تأثير CO (الدموي والخلوي الميتوكوندري)", points: 1.0 },
      { criterion: "التفسير الجزيئي لشلل السلسلة وانهيار ATP وموت الدماغ والقلب", points: 2.5 },
      { criterion: "تبرير الأكسجين عالي الضغط بإزاحة CO التنافسية واسترجاع التنفس", points: 1.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - كتاب العلوم الطبيعية 3AS (ص 216-240) | ملاحظة وزارية: تباين التوزيع السنوي الأخير",
    historicalBacRef: "BAC 2016 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "CURRENT_PROGRESS_UNVERIFIED",
  },
};



// ============================================================================
// 15. snv_document_analysis_information_extraction
// ============================================================================

export const SNV_DOC_ANALYSIS_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_document_analysis_information_extraction",
  canonicalTitle_ar: "المنهجية: استغلال الوثائق العلمية، استخراج المعلومات، والتحليل المقارن",
  canonicalTitle_fr: "Méthodologie : exploitation des documents, extraction d'informations et analyse comparative",
  discipline: "natural_sciences",
  domain: "المنهجية والكفاءات العرضية",
  unit: "استغلال الوثائق واستخراج المعلومات والتحليل المقارن",
  status: "APPROVED",
  scopeIn: [
    "التعريف الإجرائي المنهجي لمهمة التحليل: تقديم الوثيقة (طبيعتها وموضوعها وشروطها)، قراءة التغيرات المنظمة بدلالة الشروط مع استخراج معطيات عددية دقيقة بوحداتها، بيان الدلالة البيولوجية، وصياغة الاستنتاج المباشر.",
    "التمييز الصارم بين ثلاثة مستويات فكرية: 1) ما تبينه الوثيقة حسياً وعيانياً (الملاحظة والبيانات)، 2) ما تعنيه البيانات بيولوجياً (الدلالة المباشرة)، 3) ما يتم استخلاصه كإجابة عن المشكلة (الاستنتاج).",
    "التحليل المقارن للجداول والمنحنيات متعددة الشروط: تحديد أوجه التشابه وأوجه الاختلاف ودلالتها السببية وتجنب السرد المنفصل لكل شرط بمعزل عن الآخر.",
    "استغلال الوثائق المركبة: المنحنيات البيانية متعددة المنحنيات، الجداول الإحصائية، صور المجاهر الإلكترونية، وتسجيلات راسم الاهتزاز المهبطي.",
    "صياغة الاستنتاج العلمي السليم: استخراج أقصى حقيقة بيولوجية مثبتة بالوثيقة بصياغة دقيقة دون قفز استدلالي أو استباق لمعلومات لم تقدمها الوثيقة.",
  ],
  scopeOut: [
    "الوصف الأدبي السطحي الخالي من الدلالة البيولوجية أو الأرقام الدقيقة الداعمة.",
    "ادعاء وجود قالب لغوي وزاري ملزم بنصوص جامدة متكلفة لا سند لها في التوجيهات الرسمية.",
  ],
  prerequisites: {
    hard: [],
    soft: ["قراءة الجداول والمنحنيات الرياضية والمفاهيم البيولوجية الأساسية"],
    foundation: ["القدرة على الملاحظة العلمية الدقيقة والربط بين السبب والنتيجة"],
    crossCutting: ["snv_scientific_reasoning_hypothesis_validation"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_DOC_01",
      bloomLevel: "apply",
      description_ar: "يطبق خطوات استغلال الوثيقة العلمية (تقديم، تفكيك المعطيات مع أرقامها، إبراز الدلالة، وصياغة الاستنتاج).",
    },
    {
      code: "LO_SNV_DOC_02",
      bloomLevel: "analyze",
      description_ar: "يميز بدقة بين المعطى الوثائقي الملاحظ والدلالة البيولوجية المباشرة والاستنتاج العلمي المبرهن.",
    },
    {
      code: "LO_SNV_DOC_03",
      bloomLevel: "evaluate",
      description_ar: "ينجز تحليلاً مقارناً يربط بين مختلف الشروط التجريبية ويبرز دلالة أوجه التشابه والاختلاف.",
    },
  ],
  coreConcepts_ar: [
    "تقديم الوثيقة: صياغة افتتاحية تبين طبيعة الوثيقة (منحنى، جدول، رسم) وموضوع قياسها بدلالة المتغيرات.",
    "الملاحظة المنظمة: وصف تطور الظاهرة (تزايد، تناقص، ثبات) مع تقسيم الفترات أو الشروط وذكر القيم والوحدات.",
    "الدلالة البيولوجية: شرح المعنى الحيوي المباشر للملاحظة في سياق التجربة (ماذا يعني هذا الارتفاع أو الانخفاض).",
    "الاستنتاج العلمي: المعلومة الأساسية المجردة المستخلصة من الوثيقة والتي تجيب مباشرة على التساؤل المطروح.",
    "التحليل المقارن: دراسة متوازية لشروط تجريبية متعددة لإبراز التباين والتشابه الدال على السببية البيولوجية.",
  ],
  lessonPackage: {
    overview_ar: "تعد كفاءة استغلال الوثائق واستخراج المعلومات الكفاءة القاعدية المركزية في مادة علوم الطبيعة والحياة؛ فالوثيقة في البكالوريا ليست ملحقاً توضيحياً بل هي السند التجريبي الحصري الذي يُبنى عليه البرهان والاستدلال العلمي.",
    biologicalMechanism_ar: [
      "1. خطوة التعريف والتقديم: تحديد طبيعة الوثيقة (منحنى بياني، جدول نتائج، رسم تخطيطي، أعمدة بيانية...) وبيان ما تمثله بدقة (تغير المتغير التابع بدلالة المتغير المستقل وفي أي شروط فيزيولوجية).",
      "2. خطوة التفكيك والقراءة المنظمة: تجزئة الوثيقة إلى مجالات زمنية أو شروط تجريبية متجانسة؛ قراءة الاتجاه العام (تزايد، استقرار، تناقص)؛ وتدعيم الوصف بالقيم العددية البارزة (القيم الابتدائية، العظمى، والنهائية مع وحدات القياس الرسمية).",
      "3. خطوة إبراز الدلالة البيولوجية: الانتقال من الوصف العياني المجرد إلى المعنى الوظيفي؛ فمثلاً انخفاض تركيز مادة لا يوصف فقط بأنه 'نقصان' بل يقرن بدلالته: 'مما يدل على استهلاكها في التفاعل أو تفكيكها الإنزيمي'.",
      "4. خطوة صياغة الاستنتاج: التتويج المنطقي للتحليل؛ صياغة عبارة علمية تقريرية مركزة ومختصرة تمثل الحل المباشر للمشكل الذي وضعت الوثيقة لاختباره، وتكون مدعومة تماماً بالمعطيات دون أن تتجاوز حدود التجربة.",
    ],
    evidenceAndObservation_ar: "بينت مراجعة تصحيحات امتحانات البكالوريا الرسمية أن الإجابات التي تكتفي بالقراءة الرقمية السطحية (سرد أرقام دون ربطها بالدلالة البيولوجية) أو التي تقفز مباشرة إلى كتابة فقرة نظرية محفوظة من الدرس دون استثمار معطيات الوثيقة تُحرم من معظم العلامات المخصصة للمهمة؛ بينما تنال الإجابات المنهجية التي تبرز الملاحظة الرقمية متبوعة بالدلالة والاستنتاج العلامة الكاملة.",
    scientificReasoning_ar: "التحليل العلمي هو أداة استنطاق المعطيات: فالمعطى الرقمي هو 'الشاهد' في المحاكمة العلمية، والدلالة هي 'تفسير مدلول الشهادة'، والاستنتاج هو 'الحكم القضائي الصادر عن الأدلة'. لا يجوز إصدار الحكم قبل استعراض الأدلة، ولا يجوز استعراض الأدلة دون تفسير معناها الحيوي.",
    biologicalConclusion_ar: "إتقان استغلال الوثيقة يحرر التلميذ من فخ الحفظ الآلي الصم، ويمنحه منهجية تفكير علمية صارمة تمكنه من تفكيك أي سند تجريبي غير مألوف في مواضيع البكالوريا واستخراج المعرفة العلمية المبرهنة منه بيقين.",
  },
  workedModel: {
    problem_ar: "تمثل الوثيقة قياس كمية الأجسام المضادة الحرة في مصل أرنب حقن بمولد ضد (س) لأول مرة عند اليوم ز0، ثم حقن بنفس مولد الضد (س) مرة ثانية عند اليوم ز30.\n- بعد الحقن الأول (ز0): ظهرت الأجسام المضادة بعد أسبوع (ز7) وبلغت ذروة ضعيفة (10 وحدات اعتباطية) عند ز14 ثم تلاشت تدريجياً بحلول ز28.\n- بعد الحقن الثاني (ز30): ظهرت الأجسام المضادة فوراً بعد 24 ساعة (ز31)، وتزايدت بسرعة فائقة لتبلغ ذروة قياسية (1000 وحدة اعتباطية) عند ز35 واستمرت بتركيز مرتفع لفترة زمنية طويلة.\nاستغل الوثيقة استغلالاً منهجياً دقيقاً مبرزاً المقارنة بين الاستجابتين، وماذا تستنتج؟",
    documentData_ar: "البيانات: الحقن الأول (ز0): فترة استجابة متأخرة (7 أيام)، ذروة ضعيفة (10 وحدات)، اختفاء بعد 28 يوماً. الحقن الثاني (ز30): انطلاق فوري (يوم واحد)، ذروة هائلة ومضاعفة 100 مرة (1000 وحدة)، واستمرار طويل الأمد.",
    observation_ar: "التقديم: تمثل الوثيقة منحنى تغيرات كمية الأجسام المضادة في مصل الأرنب بدلالة الزمن إثر حقنتين متتاليتين لنفس مولد الضد (س).\nالقراءة المنظمة والمقارنة:\n- إثر التماس الأول مع مولد الضد (الاستجابة الأولية): نلاحظ مرحلة كمون طويلة مدتها أسبوع (من ز0 إلى ز7) ينعدم فيها ظهور الأجسام المضادة في المصل، تليها زيادة بطيئة وتدريجية في إنتاج الأضداد لتبلغ ذروة ضعيفة لا تتعدى 10 وحدات عند اليوم 14، ثم تتناقص ببطء لتختفي تقريباً بحلول اليوم 28.\n- إثر التماس الثاني بنفس مولد الضد (الاستجابة الثانوية): نلاحظ مرحلة كمون شبه منعدمة حيث يبدأ إنتاج الأضداد فوراً خلال 24 ساعة فقط، مع تصاعد عمودي وسريع جداً لكمية الأجسام المضادة لتبلغ ذروة قياسية بلغت 1000 وحدة (أعلى بـ 100 مرة من الذروة الأولية) عند اليوم 35، مع بقائها في المصل بتركيز مرتفع لفترة طويلة جداً تتجاوز عدة أسابيع.",
    interpretation_ar: "الدلالة البيولوجية: تأخر وضعف الاستجابة الأولية يدل على الوقت الذي يستغرقه الانتقاء النسيلي للمفاويات B الساذجة وتكاثرها وتمايزها إلى خلايا بلازمية مفرزة؛ بينما فورية وقوة واستدامة الاستجابة الثانوية تدل على وجود خلايا ذاكرة مناعية (LBm) تشكلت أثناء التماس الأول وتمتلك عمراً طويلاً وألفة عالية تمكنها من التكاثر والتمايز الفوري بمجرد التماس الثاني.",
    deduction_ar: "الاستنتاج: يتميز الجهاز المناعي بـ 'الذاكرة المناعية' التي تجعل الاستجابة المناعية الثانوية أسرع وأقوى وأكثر ديمومة ونوعية مقارنة بالاستجابة المناعية الأولية.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_doc_l1_01",
      capabilityId: "snv_document_analysis_information_extraction",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 4,
      prompt_ar: "في منهجية استغلال الوثائق العلمية لمادة علوم الطبيعة والحياة، أي من العبارات التالية تمثل 'ملاحظة مباشرة مدعمة بمعطى وثائقي' وليس 'تفسيراً بيولوجياً'؟\nأ) تم إفراز الناقل العصبي لأن قنوات الكالسيوم انفتحت إثر زوال الاستقطاب\nب) يرتفع تركيز السكر في الدم من 0.9 g/L عند ز0 ليصل إلى ذروة 1.6 g/L عند ز30\nج) يتوقف تركيب البروتين نتيجة عجز الريبوسومات عن قراءة الرامزات\nد) النبتة عاجزة عن التنفس بسبب تسمم السلسلة الميتوكوندرية",
      expectedResponse_ar: "ب) يرتفع تركيز السكر في الدم من 0.9 g/L عند ز0 ليصل إلى ذروة 1.6 g/L عند ز30",
      reasoningSteps_ar: [
        "الملاحظة المباشرة تصف فقط ما هو مرئي ومسجل في الوثيقة بأرقامه ووحداته دون إقحام آليات خفية غير مرئية في السند.",
        "الخيارات أ، ج، د تتضمن تفسيرات لآليات جزيئية غير مرئية مباشرة (انفتاح القنوات، عجز الريبوسوم، تسمم السلسلة) وليست قراءة معطى.",
      ],
      biologicalModel_ar: {
        system_ar: "منهجية القراءة الوثائقية المجردة",
        experimentalConditions_ar: "تسجيل عياني لمتغير حيوي عبر الزمن",
        governingBiologicalMechanisms_ar: ["الفصل الإبستيمولوجي بين الملاحظ والمعلل"],
        evidenceExtracted_ar: "البيانات الرقمية الصريحة للوثيقة",
        deductionOrConclusion_ar: "الملاحظة تقتصر على الوصف الدقيق للبيانات والأرقام",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "الخلط بين وصف المعطى الرقمي الظاهر في الوثيقة وبين التفسير البيولوجي للآلية الخفية المسببة له.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: درجة كاملة للاختيار الصحيح (ب).",
    },
    l2_application: {
      id: "snv_doc_l2_01",
      capabilityId: "snv_document_analysis_information_extraction",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 7,
      prompt_ar: "يمثل الجدول التالي قياس نسبة تشكل المعقدات المناعية بدلالة تراكيز متزايدة من الأجسام المضادة المضافة في وجود كمية ثابتة من مولد الضد (100 وحدة):\n- تركيز الأضداد 20: تشكل 15 معقداً مناعياً، مع بقاء مولد ضد حر في الوسط.\n- تركيز الأضداد 50: تشكل 40 معقداً مناعياً، مع بقاء مولد ضد حر.\n- تركيز الأضداد 100: تشكل 100 معقد مناعي، وانعدام وجود كل من الأضداد الحرة ومولد الضد الحر تماماً.\n- تركيز الأضداد 200: تشكل 100 معقد مناعي، مع وجود أجسام مضادة حرة فائضة في الوسط.\nقدم تحليلاً دقيقاً لمعطيات الجدول واستخرج دلالة حالة تركيز الأضداد 100.",
      expectedResponse_ar: "تحليل معطيات الجدول:\n- التقديم: يمثل الجدول تغيرات كمية المعقدات المناعية المتشكلة وحالة الوسط بدلالة تراكيز متزايدة من الأجسام المضادة المضافة لكمية ثابتة من مولد الضد (100 وحدة).\n- الملاحظة:\n  * عند التراكيز المنخفضة من الأجسام المضادة (من 20 إلى 50 وحدة): يتزايد عدد المعقدات المناعية طردياً من 15 إلى 40 معقداً، مع بقاء جزيئات من مولد الضد حرة غير مرتبطة في الوسط لقلة الأجسام المضادة.\n  * عند تركيز الأجسام المضادة 100 وحدة: يبلغ تشكل المعقدات المناعية قيمته العظمى التامة (100 معقد مناعي)، وتختفي تماماً الجزيئات الحرة لكلا الطرفين (انعدام مولد الضد الحر والأجسام المضادة الحرة).\n  * عند تركيز الأجسام المضادة المرتفع 200 وحدة: يستقر عدد المعقدات المناعية عند قيمته العظمى (100 معقد) دون زيادة، مع بقاء جزيئات فائضة من الأجسام المضادة حرة في الوسط لنفاد مولد الضد.\n- الدلالة البيولوجية لتركيز 100 وحدة: يدل تركيز 100 على تحقيق 'حالة التكافؤ' (Zone d'équivalence)، حيث تتساوى فيها مواقع التثبيت النوعية للأجسام المضادة (الباراتوبات) مع كامل محددات مولد الضد المتوفرة (الإبيتوبات)، مما يسمح بالارتباط التام والشامل وتحييد كامل مولد الضد دون أي فائض حر لكلا العنصرين.",
      reasoningSteps_ar: [
        "تقديم الجدول وتحديد المتغير التابع والمستقل والشرط الثابت.",
        "قراءة الحالات الثلاث: فائض مولد الضد، نقطة التعادل، وفائض الأجسام المضادة.",
        "استخراج الدلالة البيولوجية لمفهوم منطقة التكافؤ المناعية.",
      ],
      biologicalModel_ar: {
        system_ar: "تفاعل الترسيب المناعي في وسط سائل",
        experimentalConditions_ar: "كمية ثابتة من المستضد مع كميات متزايدة من الأجسام المضادة",
        governingBiologicalMechanisms_ar: ["قانون التكافؤ التفاعلي بين الباراتوب والإبيتوب"],
        evidenceExtracted_ar: "انعدام الجزيئات الحرة عند تركيز 100 بالضبط",
        deductionOrConclusion_ar: "تشكل المعقدات المناعية يبلغ أوجه عند التكافؤ الستوكيومتري بين الأضداد ومحددات المستضد",
      },
      errorMapping: {
        primaryErrorType: "attention_error",
        distractorRationale_ar: "تجاهل ملاحظة حالة الوسط (الأضداد الحرة ومولد الضد الحر) والتركيز فقط على عمود المعقدات المناعية، مما يفقد التحليل دلالته البيولوجية.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن للتحليل المنظم للحالات الثلاث، 1.0 ن لاستخراج وتفسير دلالة حالة التكافؤ عند تركيز 100.",
    },
    l3_mixed: {
      id: "snv_doc_l3_01",
      capabilityId: "snv_document_analysis_information_extraction",
      level: "L3_MIXED",
      format: "document_analysis",
      estimatedTimeMin: 10,
      prompt_ar: "تمثل الوثيقة دراسة مقارنة لتسجيلات جهاز راسم الاهتزاز المهبطي في غشائين بعد مشبكيين مختلفين (المشبك M1 والمشبك M2) إثر تنبيه فعال متماثل للعصبونين قبل المشبكيين في وجود مسجلين إلكترونيين دقيقين:\n- في المشبك M1: سجل الإلكترود زوال استقطاب بعد مشبكي بسعة (+15 mV) بلغت ذروتها بعد 2 ms ثم عادت لكمون الراحة.\n- في المشبك M2: سجل الإلكترود فرط استقطاب بعد مشبكي بسعة (-5 mV) استمر لمدة 4 ms ثم عاد لكمون الراحة.\n- تم حقن مادة 'الأستيل كولين' في الشق المشبكي لـ M1 فتكررت نفس الاستجابة (+15 mV)، بينما حقنت مادة 'الغابا' (GABA) في الشق لـ M2 فتكررت استجابة فرط الاستقطاب (-5 mV).\nحلل الوثيقة تحليلاً مقارناً مبرزاً دلالة كل تسجيل، واستنتج تصنيف المشبكين وخصائصهما الوظيفية.",
      expectedResponse_ar: "التحليل المقارن للوثيقة:\n- التقديم: تمثل الوثيقة تسجيلات كهربائية بعد مشبكية مقارنة بين مشبكين مختلفين (M1 و M2) إثر تنبيه فعال متماثل وحقن مواد كيميائية نوعية في الشق المشبكي.\n- المقارنة والملاحظة المدعمة بالقيم:\n  * في المشبك M1: يؤدي التنبيه قبل المشبكي إلى توليد زوال استقطاب في الغشاء بعد المشبكي ترتفع فيه الشحنة بمقدار (+15 mV) لتبلغ ذروتها في زمن وجيز (2 ms)، وهي نفس الاستجابة المسجلة تماماً عند حقن مادة الأستيل كولين منفردة في الشق.\n  * في المشبك M2: على العكس تماماً، يؤدي التنبيه المتماثل إلى توليد فرط استقطاب في الغشاء بعد المشبكي ينخفض فيه الكمون الغشائي تحت كمون الراحة بمقدار (-5 mV) ويستمر لفترة أطول (4 ms)، وهي نفس الاستجابة المطابقة تماماً لتأثير مادة الغابا (GABA).\n- الدلالة البيولوجية:\n  * استجابة زوال الاستقطاب في M1 تدل على أن المشبك M1 مشبك تنبيهي يفرز مبلغاً عصبياً منبهاً (الأستيل كولين) يؤدي لارتباطه بمستقبلات قنوية إلى تدفق شوارد موجبة داخلياً (Na+) مولداً كموناً بعد مشبكي تنبيهي (PPSE).\n  * استجابة فرط الاستقطاب في M2 تدل على أن المشبك M2 مشبك تثبيطي يفرز مبلغاً عصبياً مثبطاً (الغابا) يؤدي لارتباطه بمستقبلات قنوية إلى تدفق شوارد سالبة داخلياً (Cl-) مولداً كموناً بعد مشبكي تثبيطي (PPSI).\nالاستنتاج: تصنف المشابك العصبية وظيفياً إلى نوعين متمايزين تحكمهما طبيعة المبلغ العصبي والمستقبلات الغشائية: مشابك تنبيهية تعمل بمبلغات منبهة كالأستيل كولين وتولد PPSE، ومشابك تثبيطية تعمل بمبلغات مثبطة كالغابا وتولد PPSI.",
      reasoningSteps_ar: [
        "التقديم السليم للوثيقة والمقارنة المتوازية بين التسجيلين M1 و M2.",
        "ربط زوال الاستقطاب بالمبلغ المنبه وتدفق Na+، وفرط الاستقطاب بالمبلغ المثبط وتدفق Cl-.",
        "استخراج الاستنتاج الشامل المصنف للمشابك وفق معاييرها الوظيفية.",
      ],
      biologicalModel_ar: {
        system_ar: "المشابك العصبية التنبيهية والتثبيطية المقارنة",
        experimentalConditions_ar: "تنبيه متماثل مع المعاملة بمبلغات كيميائية نوعية",
        governingBiologicalMechanisms_ar: ["الترميز الكيميائي المشبكي والنوعية القنوية للـ PPSE والـ PPSI"],
        evidenceExtracted_ar: "تسجيل كمون PPSE (+15 mV) في M1 وكمون PPSI (-5 mV) في M2",
        deductionOrConclusion_ar: "المشابك العصبية تنقسم وظيفياً إلى تنبيهية (PPSE) وتثبيطية (PPSI) تبعاً لنوع المبلغ العصبي",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "سرد خصائص M1 ثم سرد خصائص M2 في فقرتين منفصلتين تماماً دون إقامة مقابلة ومقارنة مباشرة بين زوال الاستقطاب وفرط الاستقطاب.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن للتقديم والملاحظة المقارنة بالأرقام، 1.0 ن لاستخراج الدلالة البيولوجية للشحنات ونوع المبلغات، 1.0 ن للاستنتاج التصنيفي المكتمل.",
    },
    l4_transfer: {
      id: "snv_doc_l4_01",
      capabilityId: "snv_document_analysis_information_extraction",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 12,
      prompt_ar: "لدراسة سمية المعادن الثقيلة على النباتات المائية، تم قياس أثر تركيزات متزايدة من شوارد الكادميوم السامة (Cd2+) على ثلاثة مؤشرات حيوية لطحلب مائي في وسط تجريبي:\n1) النفاذية الغشائية للشوارد (تسرب شوارد البوتاسيوم K+ إلى الوسط الخارجي): ارتفعت من 5% في الشاهد إلى 85% عند تركيز 100 μM من الكادميوم.\n2) نشاط إنزيم الـ Catalase المضاد للأكسدة الخلوية: ارتفع نشاطه من 20 وحدة إلى 80 وحدة عند تركيز 25 μM، ثم انهار انحدارياً ليبلغ 5 وحدات فقط عند تركيز 100 μM.\n3) معدل التركيب الضوئي وانطلاق غاز O2: انخفض تدريجياً وبوتيرة حادة من 100% في الشاهد إلى 12% فقط عند 100 μM.\nحلل هذه المعطيات تحليلاً متكاملاً يربط بين المؤشرات الثلاثة، وصغ استنتاجاً علمياً موحداً يفسر آلية تسميم الطحلب بالكادميوم.",
      expectedResponse_ar: "التحليل التكاملي للمعطيات:\n- التقديم: تمثل المعطيات التجريبية قياس الاستجابة الخلوية والفيزيولوجية لطحلب مائي معرض لجرعات متزايدة من شوارد الكادميوم (Cd2+) عبر ثلاثة مؤشرات حيوية (سلامة الغشاء، الدفاع الإنزيمي المضاد للأكسدة، وكفاءة التركيب الضوئي).\n- تفكيك المعطيات والربط بين المؤشرات:\n  * عند التراكيز المنخفضة من الكادميوم (حتى 25 μM): نلاحظ استجابة دفاعية سريعة للطحلب تمثلت في مضاعفة نشاط إنزيم الكاتالاز بأربعة أضعاف (من 20 إلى 80 وحدة)، مما يدل على أن الخلية تعرضت لإجهاد تأكسدي أولي وحاولت التكيف معه بتفكيك الجذور الحرة الضارة، مع بقاء النفاذية الغشائية والتركيب الضوئي في حدود مقبولة.\n  * عند التراكيز المرتفعة من الكادميوم (حتى 100 μM): نلاحظ انهياراً حاداً في نشاط إنزيم الكاتالاز (انخفض إلى 5 وحدات)، تزامناً مع قفزة هائلة في نفاذية الغشاء وتسرب 85% من شوارد البوتاسيوم نحو الخارج، وانهيار كارثي لمعدل التركيب الضوئي بنسبة 88% (تراجع إلى 12%).\n- الدلالة والربط السببي: يدل عجز وانهيار إنزيم الكاتالاز عند الجرعات العالية على تجاوز الإجهاد التأكسدي لطاقة الخلية التحملية؛ حيث أدت الجذور الحرة المتراكمة والكادميوم مباشرة إلى أكسدة وتخريب الليبيدات المفسفرة للأغشية الخلوية وأغشية التيلاكويدات، مما سبب تمزقها وتلاشي استقطابها وتسرب محتوياتها الشاردية (K+)، وتخريب الأنظمة الضوئية وبالتالي شلل التركيب الضوئي وموت الخلية.\nالاستنتاج العلمي الموحد: تمارس شوارد الكادميوم سميتها الخلوية عبر تحريض إجهاد تأكسدي عنيف يؤدي عند التراكيز العالية إلى شل الإنزيمات الدفاعية وتدمير سلامة الأغشية الخلوية مما يشل العمليات الحيوية الاستقلابية (كالتركيب الضوئي) ويدمر التوازن الشاردي للخلية.",
      reasoningSteps_ar: [
        "تقديم المؤشرات وربطها بالجرعة السمية المتزايدة.",
        "التمييز بين مرحلة الدفاع الخلوي (التراكيز الضعيفة) ومرحلة الانهيار والتخريب (التراكيز المرتفعة).",
        "نسج العلاقة السببية: إجهاد تأكسدي -> شلل الكاتالاز -> تخريب الغشاء وتسرب K+ -> شلل التيلاكويدات والتركيب الضوئي.",
        "صياغة استنتاج موحد يجمع الآلية السمية كاملة.",
      ],
      biologicalModel_ar: {
        system_ar: "الخلية النباتية الطحلبية تحت تأثير الإجهاد الكيميائي للمعادن الثقيلة",
        experimentalConditions_ar: "التعريض لجرعات متدرجة من الكادميوم وقياس وظائف الغشاء والإنزيمات والطاقة",
        governingBiologicalMechanisms_ar: ["الإجهاد التأكسدي وانثقاب الأغشية الخلوية وتثبيط الإنزيمات الحيوية"],
        evidenceExtracted_ar: "تسرب 85% من K+ وتراجع الكاتالاز لـ 5 وحدات والتركيب الضوئي لـ 12%",
        deductionOrConclusion_ar: "الكادميوم يدمر حيوية الخلية عبر كسر الحواجز الغشائية وشل الدفاع الأنزيمي والطاقوي",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "تحليل كل مؤشر من المؤشرات الثلاثة في جزيرة معزولة دون بناء شبكة العلاقات السببية الرابطة بين أكسدة الأغشية وتثبيط التركيب الضوئي وتسرب الشوارد.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن للتقديم والتفكيك الرقمي للمؤشرات، 1.5 ن لبناء التفسير التكاملي السببي الرابط، 1.5 ن للاستنتاج العلمي الموحد.",
    },
    l5_bac_style: {
      id: "snv_doc_l5_01",
      capabilityId: "snv_document_analysis_information_extraction",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 18,
      prompt_ar: "في دراسة سريرية حول اضطرابات الغدة الدرقية، تم فحص ثلاث مجموعات من المرضى يعانون من أعراض أيضية متباينة:\n- المجموعة الشاهدة (أفراد أصحاء): تركيز هرمون TSH النخامي = 2.0 mU/L؛ تركيز هرمونات T3/T4 الدرقية = 15.0 pmol/L؛ النشاط الاستقلابي الأساسي = طبيعي 100%.\n- المجموعة (أ) (مرضى يعانون من فرط النشاط ونقص الوزن والحرارة المرتفعة): تركيز TSH منخفض جداً يكاد ينعدم = 0.05 mU/L؛ تركيز T3/T4 مرتفع جداً = 45.0 pmol/L؛ النشاط الاستقلابي = 160%.\n- المجموعة (ب) (مرضى يعانون من الخمول، زيادة الوزن، وعدم تحمل البرودة): تركيز TSH مرتفع جداً = 35.0 mU/L؛ تركيز T3/T4 منخفض جداً = 3.0 pmol/L؛ النشاط الاستقلابي = 65%.\n1) استغل معطيات الجدول استغلالاً منهجياً منظماً يبرز المقارنة بين المجموعات الثلاث.\n2) فسر انطلاقاً من معطيات التحليل الخلل الفيزيولوجي لدى مرضى المجموعتين (أ) و (ب) مبيناً موقع الإصابة الأولية (الغدة النخامية أم الغدة الدرقية).\n3) صغ استنتاجاً علمياً يوضح مفهوم المراقبة الرجعية السلبية التي تنظم إفراز هذه الهرمونات.",
      expectedResponse_ar: "1) استغلال معطيات الجدول (التحليل المقارن):\n- التقديم: يمثل الجدول قياسات هرمونية مقارنة لهرمون TSH النخامي وهرمونات T3/T4 الدرقية ومعدل النشاط الاستقلابي بين أفراد أصحاء ومرضى مجموعتين تعانيان من اضطرابات استقلابية.\n- القراءة المقارنة المنظمة:\n  * عند الأفراد الأصحاء (الشاهد): نلاحظ قيماً متوازنة طبيعية لكل من الهرمون النخامي المنشط TSH (2.0 mU/L) وهرمونات الغدة الدرقية T3/T4 (15.0 pmol/L) محققة نشاطاً استقلابياً مثالياً 100%.\n  * عند مرضى المجموعة (أ): نلاحظ تزايداً هائلاً في تركيز هرمونات الغدة الدرقية T3/T4 بلغ ثلاثة أضعاف القيمة الطبيعية (45.0 pmol/L) رافقه نشاط استقلابي مفرط (160%)، في حين سجل هرمون TSH النخامي انخفاضاً حاداً شبه منعدم (0.05 mU/L أي أقل بـ 40 مرة من الشاهد).\n  * عند مرضى المجموعة (ب): نلاحظ عكس ذلك تماماً؛ حيث انخفضت هرمونات T3/T4 الدرقية إلى مستويات متدنية جداً (3.0 pmol/L) رافقها انخفاض حاد في الاستقلاب (65%)، بينما سجل هرمون TSH النخامي ارتفاعاً قياسياً هائلاً بلغ 35.0 mU/L (أعلى بـ 17.5 مرة من الشاهد).\n2) التفسير وتحديد موقع الإصابة الأولية:\n- مرضى المجموعة (أ): موقع الخلل الأولي هو 'الغدة الدرقية' (فرط نشاط الغدة الدرقية الأولي - Hyperthyroïdie primaire). التفسير: تفرز الغدة الدرقية كميات هائلة من T3/T4 ذاتياً وبشكل مستقل عن التنبيه النخامي؛ هذا التركيز الفائق من هرمونات T3/T4 في الدم مارس مراقبة رجعية سالبة قوية ومفرطة ومستمرة على خلايا الفص الأمامي للغدة النخامية، مما كبح إفراز TSH وجعله شبه منعدم.\n- مرضى المجموعة (ب): موقع الخلل الأولي هو أيضاً 'الغدة الدرقية' (قصور الغدة الدرقية الأولي - Hypothyroïdie primaire). التفسير: تعاني الغدة الدرقية من تلف أو عجز في تركيب هرمونات T3/T4 مما أدى لهبوط حاد في تركيزها الدموي؛ أدى هذا الغياب للهرمونات الدرقية إلى رفع الكبح وإلغاء المراقبة الرجعية السالبة عن الغدة النخامية، فتحررت الخلايا النخامية وأفرزت كميات هائلة ومتصاعدة من TSH في محاولة غير مجدية لتنبيه الغدة الدرقية المصابة.\n3) الاستنتاج العلمي: تخضع هرمونات الغدة الدرقية لآلية تنظيم ذاتي عبر 'المراقبة الرجعية السالبة' (Rétrocontrôle négatif)، حيث يؤدي ارتفاع تركيز الهرمونات الطرفية (T3/T4) في الدم إلى تثبيط إفراز الهرمون الحاث النخامي (TSH)، بينما يؤدي انخفاضها إلى تنشيط وتحفيز إفرازه، مما يضمن ثبات المؤشرات الفيزيولوجية والاستقلابية للعضوية ضمن المجال الحيوي الطبيعي.",
      reasoningSteps_ar: [
        "بناء المقارنة الرقمية الدقيقة بين الشاهد والمجموعتين المرضيتين.",
        "تفسير السلوك الهرموني المعاكس بتطبيق مفهوم التغذية الراجعة السلبية لتحديد بؤرة الإصابة بدقة.",
        "استنتاج المبدأ الفيزيولوجي العام لضبط الإفراز الهرموني.",
      ],
      biologicalModel_ar: {
        system_ar: "المحور النخامي الدرقي والتنظيم الهرموني المتزن",
        experimentalConditions_ar: "فحص سريري هرموني لمتلازمتين استقلابيتين متناقضتين",
        governingBiologicalMechanisms_ar: ["التغذية الراجعة السلبية والحفاظ على التوازن الإفرازي الحيوي"],
        evidenceExtracted_ar: "التناسب العكسي الدقيق بين TSH و T3/T4 في كلا المتلازمتين",
        deductionOrConclusion_ar: "الهرمونات المستهدفة تضبط ذاتياً وتيرة إفراز الهرمونات المنشطة لها بمراقبة سالبة",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الاعتقاد الخاطئ بأن المجموعة (ب) تعاني من خلل نخامي لأن TSH مرتفع، وتجاهل كون الارتفاع مجرد استجابة رجعية طبيعية لغياب الكبح الدرقي.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5 ن للتحليل المقارن المنظم بالأرقام والوحدات، 1.5 ن للتفسير وتحديد موقع الخلل الدرقي للمجموعتين، 1.0 ن لصياغة الاستنتاج المحكم لآلية المراقبة الرجعية.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "تحويل مهمة استغلال الوثيقة إلى سرد نظري لمعلومات مسبقة من الدرس دون استخدام معطيات السند، أو إهمال القيم الرقمية، أو كتابة استنتاج لا علاقة له بما هو مثبت في الوثيقة المطروحة.",
    wrongMentalModel_ar: "المصحح يريد أن أكتب درسي كما حفظته والوثيقة مجرد زينة في ورقة الامتحان.",
    correctMentalModel_ar: "الوثيقة هي الحقيقة الوحيدة المتاحة؛ كل فكرة في إجابتك يجب أن تكون مربوطة بسلك غير مرئي مع رقم أو معلومة داخل الوثيقة.",
    threeStepActionProtocol_ar: [
      "1. قدم الوثيقة: ماذا تمثل (المتغير التابع بدلالة المتغير المستقل وفي أي شرط)؟",
      "2. فكك مع الأرقام: قسم الفترات، صف التغير، اذكر القيمة الابتدائية والعظمى والنهائية مع وحدتها، وأضف 'مما يدل على...'.",
      "3. استنتج: أجب في سطرين عن السؤال: 'ما هي المعلومة العامة التي أثبتتها هذه الوثيقة؟'.",
    ],
    microDrill_ar: {
      prompt_ar: "حلل هذه الجملة وبين الخلل المنهجي فيها: 'تبين الوثيقة أن إنزيم الأميلاز يفكك النشاء في الفم لأن الفم يحتوي على بيئة معتدلة وغدد لعابية تفرز اللعاب'.",
      solution_ar: "الخلل المنهجي: هذه الجملة تفسير نظري مسبق وليست تحليلاً؛ التحليل السليم يقتضي تقديم الوثيقة وذكر تطور كمية النشاء بالأرقام والزمن (تناقص النشاء وظهور سكر المالتوز مع الزمن) ثم بيان دلالتها.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_doc_retest_01",
    invariantTested_ar: "استغلال وثيقة غير مألوفة، استخراج الدلالة، والمقارنة السببية الرقمية.",
    changedSurface_ar: "تطبيق على وثيقة بيئية سمية تبين أثر تركيز المبيد الفطري (كابتان Captan) على نشاط بكتيريا العقد الجذرية المثبتة للنيتروجين ونمو نبات الفول.",
    prompt_ar: "يمثل الجدول قياس كتلة العقد الجذرية (بالميليغرام) وكمية الآزوت المثبت (μg/نبات) في نباتات فول عولجت تربتها بجرعات متزايدة من مبيد الفطريات كابتان (Captan):\n- جرعة 0 ppm (الشاهد): كتلة العقد 450 mg؛ الآزوت المثبت 1200 μg.\n- جرعة 10 ppm: كتلة العقد 430 mg؛ الآزوت المثبت 1150 μg.\n- جرعة 50 ppm: كتلة العقد 180 mg؛ الآزوت المثبت 300 μg.\n- جرعة 100 ppm: كتلة العقد 20 mg؛ الآزوت المثبت 15 μg.\nاستغل معطيات الجدول استغلالاً منهجياً دقيقاً، وماذا تستنتج حول أثر المبيد على التثبيت الحيوي للأزوت؟",
    solution_ar: "الاستغلال المنهجي:\n- التقديم: يمثل الجدول قياس كتلة العقد الجذرية وكمية الآزوت المثبت لدى نباتات الفول بدلالة تراكيز متزايدة من مبيد الفطريات (كابتان) المضاف للتربة.\n- القراءة والتحليل:\n  * عند الجرعات الضعيفة من المبيد (من 0 إلى 10 ppm): تبقى كتلة العقد الجذرية شبه ثابتة ومتقاربة جداً (انخفاض طفيف من 450 إلى 430 mg) ويحافظ تثبيت الآزوت على كفاءته العالية (1150 μg مقارنة بـ 1200 μg)، مما يدل على تحمل البكتيريا العقدية للجرعات الضئيلة من المبيد دون تأثر ملحوظ.\n  * عند الجرعات المتوسطة والمرتفعة (من 50 إلى 100 ppm): نلاحظ انخفاضاً حاداً وشديد الانحدار لكتلة العقد الجذرية لتصل إلى 20 mg فقط (تراجع بنسبة تفوق 95%)، تزامناً مع انهيار شبه تام لكمية الآزوت المثبت حيث هوت إلى 15 μg فقط عند 100 ppm، مما يدل على أن التراكيز العالية تمارس سمية فتاكة على بكتيريا الريزوبيوم فتمنع تشكل العقد وتشل نشاط إنزيم النيتروجيناز المثبت للآزوت.\nالاستنتاج: يمارس مبيد الفطريات كابتان تأثيراً ساماً ومثبطاً للتثبيت الحيوي للنيتروجين يتناسب طردياً مع تركيزه في التربة، حيث يؤدي تجاوزه لجرعة معينة إلى تدمير العقد الجذرية البكتيرية وشل إمداد النبات بالغذاء الآزوتي.",
    passCondition_ar: "التقديم السليم وتفكيك المجالين مع الأرقام والوحدات وربط كتلة العقد بكفاءة التثبيت في الاستنتاج.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: استغلال وثيقة بيوكيميائية حول تشخيص احتشاء عضلة القلب (Infarctus du myocarde)",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "احتشاء عضلة القلب (الجلطة القلبية) حالة طبية إسعافية تنتج عن انسداد الشريان التاجي وموت جزء من الخلايا العضلية القلبية. لتأكيد التشخيص السريري، يُعاير الأطباء أنزيمات وبروتينات قلبية دقيقة في دم المريض عبر الزمن. تمثل الوثيقة (1) المنحنيات البيانية لتغيرات التركيز المصلي لثلاثة واسمات قلبية بدلالة الساعات والأيام الموالية للشعور بألم الصدر الحاد: مركب الميوغلوبين (Myoglobine)، إنزيم الكرياتين كيناز القلبي (CK-MB)، وبروتين التروبونين القلبي (Troponine I). 1) استغل منحنيات الوثيقة (1) تحليلاً مقارناً مبرزاً خصائص ظهور وذروة واختفاء كل واسم بيولوجي في الدم. 2) فسر الدلالة الفيزيولوجية والخلية لظهور هذه البروتينات داخل المصل الدموي رغم أنها بروتينات سيتوبلازمية وبنيوية خاصة بخلايا العضلة القلبية. 3) حدد مبرراً الواسم الأكثر نجاعة لتأكيد حدوث احتشاء قديم مضى عليه 6 أيام.",
    modelSolution_ar: [
      "1) التحليل المقارن لمنحنيات الوثيقة (1):\n- التقديم: تمثل الوثيقة تغيرات التركيز المصلي لثلاثة واسمات بروتينية قلبية (الميوغلوبين، CK-MB، والتروبونين I) بدلالة الزمن (بالساعات والأيام) إثر نوبة ألم قلبي.\n- التحليل المقارن:\n  * مركب الميوغلوبين (Myoglobine): يظهر مبكراً جداً في الدم خلال الساعتين الأوليين (س2)، ويبلغ ذروة قياسية سريعة عند السادسة إلى الثامنة (س6-8)، ثم يتناقص بسرعة فائقة ليختفي كلياً من الدم بحلول 24 ساعة (اليوم الأول).\n  * إنزيم الكرياتين كيناز (CK-MB): يبدأ في الظهور بعد 4 إلى 6 ساعات، ويصل إلى ذروته بين 18 إلى 24 ساعة، ثم يتراجع تدريجياً ليعود لمستواه الطبيعي بعد 3 أيام (72 ساعة).\n  * بروتين التروبونين (Troponine I): يبدأ بالظهور في الدم بعد 4 إلى 6 ساعات تزامناً مع CK-MB، ويبلغ ذروة مرتفعة عند 24 ساعة، لكنه يتميز بالبقاء في المصل بتركيز مرتفع قابل للقياس لفترة طويلة جداً تمتد من 7 إلى 10 أيام قبل أن يختفي.\n- الدلالة البيولوجية: يدل التباين الزمني على اختلاف أحجام هذه الجزيئات وسرعة تحررها واستقلابها الكبدي والكلوي، حيث يعتبر الميوغلوبين واسماً مبكراً جداً بينما التروبونين واسم دائم ومستمر.",
      "2) التفسير الفيزيولوجي والخلوي لظهور الواسمات في الدم: في الحالة الطبيعية، تكون هذه البروتينات محبوسة ومحفوظة حصراً داخل هيولى وبنية اللييفات العضلية للخلايا القلبية غير نفوذة للغشاء؛ عند انسداد الشريان التاجي، ينقطع الأكسجين والجلوكوز عن المنطقة العضلية المنكوبة، فتتوقف الميتوكوندريات عن إنتاج ATP مما يؤدي إلى شلل مضخات الغشاء الهيولي وموت الخلايا القلبية وتنخرها (Nécrose). يؤدي تنخر الخلايا إلى تمزق أغشيتها الهيولية وانفجارها، فتتحرر محتوياتها البروتينية الداخلية وتتسرب مباشرة نحو الأوعية الدموية الشعرية المحيطة، فيرتفع تركيزها في المصل كدليل مباشر على تمزق وموت نسيج عضلي قلبي.",
      "3) تحديد الواسم الأنسب لاحتشاء قديم (6 أيام) والتبرير: الواسم الأكثر نجاعة هو بروتين 'التروبونين القلبي' (Troponine I) حصراً. التبرير: لأن كل من الميوغلوبين وإنزيم CK-MB يختفيان كلياً من المصل ويعودان لنسبتهما الطبيعية بعد 24 ساعة و 72 ساعة على التوالي؛ في حين يبقى التروبونين I مرتفعاً في الدم لمدة تصل إلى 10 أيام، مما يجعله الواسم الوحيد القادر على إثبات وتشخيص الجلطة بدقة بعد مضي 6 أيام من حدوثها.",
    ],
    markingScheme_ar: [
      { criterion: "التحليل المقارن المنظم للواسمات الثلاثة (البداية، الذروة، الاختفاء)", points: 2.0 },
      { criterion: "التفسير الفيزيولوجي بنقص التروية وتنخر الخلايا وتمزق الأغشية وتسرب البروتينات", points: 1.5 },
      { criterion: "تحديد التروبونين I مع التعليل الزمني الدقيق لديمومته حتى 10 أيام", points: 1.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - دليل بناء الاختبارات والتوجيهات المنهجية لمفتشية التعليم الثانوي لمادة علوم الطبيعة والحياة",
    historicalBacRef: "BAC 2021 Sciences Expérimentales Sujet 1 Exercice 1 & Sujet 2 Exercice 1",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 16. snv_scientific_reasoning_hypothesis_validation
// ============================================================================

export const SNV_SCIENTIFIC_REASONING_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_scientific_reasoning_hypothesis_validation",
  canonicalTitle_ar: "المنهجية: الاستدلال العلمي، صياغة الفرضيات التفسيرية، واختبارها وتأكيدها",
  canonicalTitle_fr: "Méthodologie : raisonnement scientifique, formulation et validation d'hypothèses",
  discipline: "natural_sciences",
  domain: "المنهجية والكفاءات العرضية",
  unit: "الاستدلال العلمي واختبار ومصادقة الفرضيات",
  status: "APPROVED",
  scopeIn: [
    "بناء المسعى التفسيري العلمي (Démarche explicative): رصد المشكلة العلمية من تناقض أو غموض في المعطيات، اقتراح فرضية تفسيرية منطقية مؤسسة، فحص واختبار الفرضية عبر التجارب والشروط المقارنة، والوصول إلى حل المشكلة والمصادقة على الفرضية.",
    "شروط الفرضية العلمية السليمة: أن تكون تفسيرية منطقية ترتكز على معطيات بيولوجية، قابلة للاختبار التجريبي، وتطرح آلية ممكنة لحل التناقض المطروح.",
    "الاستدلال العلمي المبني على مقارعة ومحاكمة الأدلة: تفكيك نتائج التجارب الشاهدة ومقارنتها بتجارب المتغيرات الحيوية، ربط الدليل بالفرضية (يدعم / يتوافق مع / يدحض / يستبعد).",
    "استعمال لغة علمية محترزة دقيقة: 'يتوافق مع الفرضية'، 'يدعم الفرضية'، 'يسمح باستبعاد الفرضية'، 'يعزز التفسير'؛ وتجنب لغة الجزم المطلق والتعميم التعسفي ('يثبت يقيناً دون أدنى شك') عندما تكون التجربة جزئية وتفحص جانباً واحداً فقط من الظاهرة.",
    "التنسيق المنطقي بين عدة وثائق مستقلة لنسج برهان علمي تركيبي يقود إلى الحل النهائي للمشكل.",
  ],
  scopeOut: [
    "القفز الاستدلالي المباشر دون تفنيد الفرضيات البديلة أو دون تأسيس البرهان على المعطيات التجريبية المعطاة.",
    "صياغة فرضيات في شكل أسئلة أو تكرار المشكلة بعبارة أخرى دون تقديم مقترح تفسيري لآلية بيولوجية.",
  ],
  prerequisites: {
    hard: ["snv_document_analysis_information_extraction"],
    soft: ["مبادئ المنطق الاستنتاجي والفرضي-الاستنتاجي"],
    foundation: ["التمييز بين المتغير المستقل والتابع والتحكم في شروط التجربة"],
    crossCutting: ["snv_functional_schema_synthesis_construction"],
  },
  learningObjectives: [
    {
      code: "LO_SNV_REAS_01",
      bloomLevel: "create",
      description_ar: "يصوغ فرضية تفسيرية منطقية قابلة للاختبار تجيب عن المشكل العلمي المؤسس على التناقض الوثائقي.",
    },
    {
      code: "LO_SNV_REAS_02",
      bloomLevel: "evaluate",
      description_ar: "يحاكم الفرضيات المنافسة ويربط المعطيات التجريبية بالفرضية الملائمة بالمصادقة أو الدحض بلغة علمية دقيقة.",
    },
    {
      code: "LO_SNV_REAS_03",
      bloomLevel: "analyze",
      description_ar: "ينسج مساراً برهانياً متعدد الخطوات يربط الأسباب بالنتائج وصولاً إلى بناء الحل التركيبي النهائي.",
    },
  ],
  coreConcepts_ar: [
    "المشكل العلمي: سؤال دقيق يبرز مفارقة أو تناقضاً بيولوجياً يحتاج إلى تفسير لآليته.",
    "الفرضية التفسيرية: إجابة مؤقتة مقترحة ومؤسسة علمياً تفسر الآلية المجهولة المسببة للظاهرة.",
    "الشاهد التجريبي (Témoin): حالة مرجعية تسمح بعزل أثر المتغير المستقل حصراً دون تداخل العوامل.",
    "المصادقة / الدحض: مطابقة المعطيات التجريبية مع التنبؤات المنطقية للفرضية لتأكيد صحتها أو نفيها.",
    "اللغة المحترزة: التعبير العلمي النسبي الدقيق الذي يربط الاستنتاج بحدود الأدلة المتاحة دون مبالغة.",
  ],
  lessonPackage: {
    overview_ar: "يمثل الاستدلال العلمي جوهر الممارسة العلمية في مادة علوم الطبيعة والحياة وفق المنهج البنائي؛ وهو المسار الفكري الذي ينتقل فيه التلميذ من رصد معطيات تبدو متناقضة إلى صياغة فرضيات ذكية تمثل آليات بيولوجية مفترضة، ثم اختبارها بإخضاعها لمحاكمة تجريبية صارمة وصولاً إلى الحقيقة المثبتة.",
    biologicalMechanism_ar: [
      "1. بناء المشكل العلمي: ينشأ المشكل دائماً من تصادم معلومتين: معلومة سابقة معروفة ومعطى تجريبي جديد يبدو متعارضاً معها (مثال: الخلايا البائية تتعرف على مولد الضد مباشرة، لكنها في بعض التجارب تعجز عن إفراز الأجسام المضادة في غيابه رغم التماس المباشر!).",
      "2. صياغة الفرضيات التفسيرية: اقتراح فرضية تقدم 'آلية جزيئية أو خلوية' منطقية تزيل التناقض؛ ويجب أن تكون الفرضية مصاغة بصيغة إخبارية جازمة مقترحة وليست سؤالاً (مثال: الفرضية: تتطلب الخلايا البائية إشارات كيميائية تحفيزية تفرزها خلايا لمفاوية مساعدة لتنشيط تكاثرها وتمايزها).",
      "3. المحاكمة التجريبية (الاختبار): دراسة تجارب مخصصة تفصل بين الفرضيات؛ ويتم فيها استخدام التجارب الشاهدة ومجموعات التثبيط أو الإضافة لعزل المتغيرات السببية بدقة متناهية.",
      "4. المصادقة والتركيب: استخلاص التوافق التام بين النتائج التجريبية والتنبؤ المنطقي للفرضية الصحيحة، مع إبراز تعارض النتائج مع الفرضيات الخاطئة؛ ثم تلخيص الآلية المثبتة في حوصلة تفسيرية نهائية مدعومة بالبراهين.",
    ],
    evidenceAndObservation_ar: "في اختبارات البكالوريا (خاصة التمرين الثاني ذو الـ 7 نقاط والتمرين الثالث ذو الـ 8 نقاط)، يُطلب من التلميذ صراحة: 'اقترح فرضية تفسر...' ثم 'صادق على صحة الفرضية المقترحة باستغلال الوثائق'. تُبنى شبكات التقييم على سلامة خطوات الاستدلال التفسيري والربط المنطقي بين التجارب والفرضيات والحرص على تفنيد الفرضيات البديلة.",
    scientificReasoning_ar: "الاستدلال ليس مجرد جمع معلومات بل هو 'بناء هندسي': كل وثيقة تمثل لبنة برهانية، والروابط المنطقية السببية (بما أن... وحيث أن... وهذا يدل على... وعليه فإن...) هي الملاط الذي يربط اللبنات ليشيد صرح التفسير النهائي الصامد أمام النقد العلمي.",
    biologicalConclusion_ar: "التمكن من الاستدلال العلمي يزود الطالب بعقلية العالم المحقق، القادر على تفكيك المشكلات الطبية والبيولوجية المركبة واقتراح حلول مفسرة مدعومة بالبراهين الدامغة.",
  },
  workedModel: {
    problem_ar: "مرض وهن العضلات الوبيل (Myasthénie) مرض نادر يتميز بضعف وارتخاء تدريجي للعضلات الإرادية وصعوبة في التنفس والبلع. أظهر الفحص المجهري سلامة العصبونات الحركية وقدرتها على توليد كمونات العمل ونضح الأستيل كولين بكميات طبيعية في الشق المشبكي للوحة المحركة. اقترح باحثون فرضيتين لتفسير الخلل:\n- الفرضية 1: وجود خلل وظيفي في قنوات الكالسيوم الفولطية للغشاء قبل المشبكي يعطل إفراز كميات كافية من الناقل.\n- الفرضية 2: وجود أجسام مضادة نوعية ذاتية ترتبط بمستقبلات الأستيل كولين النيكوتينية (AChR) على الغشاء بعد المشبكي وتحجبها.\nلدى فحص مصل المرضى، وُجدت كميات معتبرة من الأجسام المضادة ضد مستقبلات AChR، وعند حقن مصل مريض في فأر سليم ظهرت عليه أعراض الوهن العضلي خلال ساعات وتناقصت سعة كمون اللوحة المحركة (PPSE) بنسبة 85%.\nناقش صحة الفرضيتين مستدلاً بالمعطيات التجريبية، وصادق على الفرضية الصحيحة.",
    documentData_ar: "البيانات: سلامة العصبونات الحركية وكمية الأستيل كولين المنضوحة طبيعية؛ وجود أجسام مضادة ضد مستقبلات AChR في مصل المرضى؛ نقل مصل المريض للفأر السليم ينقل المرض فورياً ويخفض سعة PPSE بـ 85%.",
    observation_ar: "نلاحظ أن العصبون قبل المشبكي سليم ويفرز الأستيل كولين بانتظام، بينما مصل المريض يحتوي على أجسام مضادة نوعية ضد المستقبلات بعد المشبكية وله القدرة الحصرية على إحداث المرض وشل العضلة عند نقله إلى حيوان سليم.",
    interpretation_ar: "مناقشة ومحاكمة الفرضيتين:\n- مناقشة الفرضية 1: تنص الفرضية على وجود خلل في قنوات الكالسيوم الفولطية ونقص إفراز الأستيل كولين؛ لكن الفحص السريري أثبت سلامة العصبونات وإفرازها لكميات طبيعية من الأستيل كولين في الشق المشبكي، مما ينفي وجود أي خلل قبل مشبكي ويدحض الفرضية 1 تماماً ويستبعدها.\n- مناقشة ومصادقة الفرضية 2: بينت التحاليل وجود أجسام مضادة نوعية موجهة ضد مستقبلات AChR في مصل المرضى؛ وعند حقن هذا المصل في فأر سليم ظهر عليه نفس الشلل وانخفض الـ PPSE بنسبة 85%. هذا يدل بشكل قاطع على أن الأجسام المضادة الذاتية هي العامل المسبب للمرض؛ حيث تنتقل عبر الدم وترتبط نوعياً بمستقبلات الأستيل كولين على الغشاء بعد المشبكي للوحة المحركة، فتحجب مواقع تثبيت الأستيل كولين وتمنع انفتاح قنوات Na+، مما يعطل زوال استقطاب الغشاء العضلي ويعجز عن توليد كمون عمل، فتصاب العضلة بالارتخاء والوهن الشديد.",
    deduction_ar: "المصادقة: النتائج التجريبية تدحض الفرضية 1 دحضاً قاطعاً، وتتطابق كلياً مع الفرضية 2 وتؤكد صحتها: مرض وهن العضلات الوبيل هو مرض مناعي ذاتي ينتج عن أجسام مضادة تحجب المستقبلات الغشائية بعد المشبكية للأستيل كولين.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_reas_l1_01",
      capabilityId: "snv_scientific_reasoning_hypothesis_validation",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 4,
      prompt_ar: "أي من العبارات التالية تمثل 'فرضية تفسيرية بيولوجية سليمة' لعلاج حالة مريض يعاني من تخثر دموي مفرط ناتج عن فرط نشاط إنزيم الثرومبين؟\nأ) هل يمكن استخدام دواء يقلل من تجلط الدم لدى هذا المريض؟\nب) تخثر الدم ظاهرة فيزيولوجية تمنع النزيف وتشارك فيها الصفائح الدموية\nج) يعمل الدواء المقترح كمثبط تنافسي يرتبط بالموقع الفعال لإنزيم الثرومبين فيمنع ارتباطه بالفيبرينوجين\nد) يجب إجراء تجارب سريرية على الفئران للتأكد من سلامة الدواء",
      expectedResponse_ar: "ج) يعمل الدواء المقترح كمثبط تنافسي يرتبط بالموقع الفعال لإنزيم الثرومبين فيمنع ارتباطه بالفيبرينوجين",
      reasoningSteps_ar: [
        "الفرضية التفسيرية يجب أن تقترح آلية بيولوجية جزيئية محددة (تثبيط تنافسي للموقع الفعال) تشرح كيف يحل الدواء المشكلة.",
        "الخيار أ سؤال وليس فرضية؛ الخيار ب معلومة عامة؛ والخيار د إجراء تجريبي وليس فرضية.",
      ],
      biologicalModel_ar: {
        system_ar: "صياغة وتحديد مواصفات الفرضية العلمية",
        experimentalConditions_ar: "مشكلة سريرية مرتبطة بنشاط إنزيمي مفرط",
        governingBiologicalMechanisms_ar: ["الربط بين الآلية الجزيئية وحل المشكل الاستقلابي"],
        evidenceExtracted_ar: "المعايير المنهجية لصياغة الفرضيات",
        deductionOrConclusion_ar: "الفرضية السليمة تقدم آلية تفسيرية جزيئية صريحة وقابلة للاختبار",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "اختيار السؤال (أ) أو الوصف العام (ب) بدلاً من الفرضية التي تقترح آلية عمل جزيئية قابلة للاختبار.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: درجة كاملة لاختيار الخيار الصحيح (ج).",
    },
    l2_application: {
      id: "snv_reas_l2_01",
      capabilityId: "snv_scientific_reasoning_hypothesis_validation",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 7,
      prompt_ar: "لوحظ أن سلالة طافرة من بكتيريا E. coli قادرة على النمو في وسط اصطناعي يحتوي على سكر اللاكتوز كمصدر وحيد للكربون حتى في غياب الإنزيم المنشط المعتاد. اقترح فرضيتين منطقيتين ومختلفتين تفسران قدرة هذه السلالة الطافرة على تفكيك واستغلال اللاكتوز.",
      expectedResponse_ar: "الفرضيتان التفسيريتان المنطقيتان:\n- الفرضية 1: حدثت طفرة في المورثة المشفرة لبروتين الكابح (Represseur) أدت إلى فقدان بنيته الفراغية وعجزه عن الارتباط بالمشغل (Opérateur)، مما جعل التعبير المورثي لإنزيم البيتا غالاكتوزيداز (المفكك للاكتوز) مفتوحاً ومستمراً بشكل دائم وغير مشروط.\n- الفرضية 2: حدثت طفرة في الموقع المنظم للإنزيم (الموقع الفعال) أو في مورثة إنزيم آخر بديل أكسبته بنية فضائية متممة ومطابقة لسكر اللاكتوز، مما مكنه من الارتباط به وتفكيكه بكفاءة دون حاجة للمسار التنشيطي المعتاد.",
      reasoningSteps_ar: [
        "فهم المشكل البيولوجي: قدرة استثنائية مستمرة على هضم اللاكتوز.",
        "اقتراح آلية جينية تنظيمية (طفرة في الكابح تلغي الكبح).",
        "اقتراح آلية بنيوية إنزيمية بديلة (طفرة في إنزيم بديل تمنحه ألفة للاكتوز).",
      ],
      biologicalModel_ar: {
        system_ar: "التحكم الوراثي والتعبير الإنزيمي في البكتيريا",
        experimentalConditions_ar: "طفرة وراثية تؤدي لنمو غير مشروط على ركيزة غذائية",
        governingBiologicalMechanisms_ar: ["تنظيم التعبير المورثي", "تغير البنية الفضائية للمواقع الفعالة"],
        evidenceExtracted_ar: "النمو الطبيعي في غياب العامل المنشط",
        deductionOrConclusion_ar: "الفرضيات تركز على رفع الكبح الوراثي أو اكتساب ألفة تحفيزية بديلة",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "صياغة فرضيات عامة وسطحية مثل 'البكتيريا تعودت على الوسط' دون اقتراح آليات جزيئية وراثية وإنزيمية دقيقة.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن للفرضية التنظيمية الجينية الأولى، 1.0 ن للفرضية الإنزيمية البنيوية الثانية.",
    },
    l3_mixed: {
      id: "snv_reas_l3_01",
      capabilityId: "snv_scientific_reasoning_hypothesis_validation",
      level: "L3_MIXED",
      format: "scientific_reasoning",
      estimatedTimeMin: 10,
      prompt_ar: "أثناء دراسة انقسام الخلايا السرطانية، لاحظ باحثون أن دواءً جديداً يسمى 'الميتوستاتين' يوقف تكاثر الخلايا في المرحلة الاستوائية من الانقسام الخيطي. وضعت فرضيتان لتفسير ذلك:\n- الفرضية (أ): يمنع الدواء تضاعف الـ ADN في المرحلة البينية (S).\n- الفرضية (ب): يثبط الدواء بلمرة وتفكيك بروتينات التوبولين المشكلة لمغزل الانقسام اللالوني.\nأظهر قياس كمية ADN في الخلايا المعالجة أنها تضاعفت طبيعياً من كمية ك إلى 2ك؛ بينما أظهر الفحص المجهري الفلوري عجز الألياف الحركية للمغزل عن الارتباط بالجزئيات المركزية للصبغيات.\nاستدل بهذه النتائج لمناقشة الفرضيتين والمصادقة على الفرضية الصحيحة.",
      expectedResponse_ar: "الاستدلال العلمي ومناقشة الفرضيتين:\n1) محاكمة الفرضية (أ):\n- تنص الفرضية (أ) على أن الدواء يمنع تضاعف الـ ADN في المرحلة البينية.\n- المعطيات التجريبية تبين بوضوح أن كمية الـ ADN في الخلايا السرطانية المعالجة قد تضاعفت بشكل سليم وكامل من الكمية (ك) إلى الكمية (2ك)، مما يعني أن تفاعلات تضاعف الـ ADN ونشاط إنزيم ADN بوليميراز تم في المرحلة البينية دون أي إعاقة.\n- وعليه: هذه النتيجة تدحض الفرضية (أ) تماماً وتلغيها من التفسير.\n2) محاكمة والمصادقة على الفرضية (ب):\n- تنص الفرضية (ب) على أن الدواء يثبط بروتينات مغزل الانقسام اللالوني (التوبولين).\n- أظهر الفحص المجهري عجز ألياف المغزل اللالوني عن التثبت بالجسيمات المركزية للصبغيات، وعجزها عن تشكيل اللوحة الاستوائية وشل حركة الصبغيات المضاعفة في هذه المرحلة بالتحديد.\n- بما أن تشكل المغزل وحركته يعتمدان كلياً على ديناميكية بلمرة وتفكك بروتينات التوبولين، فإن هذه المعطيات تتوافق تماماً مع الفرضية (ب) وتفسر بدقة توقف الخلايا في المرحلة الاستوائية لتعذر انفصال الكروماتيدات نحو القطبين.\nالخلاصة والمصادقة: نلغي الفرضية (أ) لعدم توافقها مع تضاعف الـ ADN، ونصادق بيقين على صحة الفرضية (ب): يعمل دواء الميتوستاتين على استهداف بروتينات المغزل اللالوني ومنع بلمرتها مما يشل الانقسام الخيطي للخلايا السرطانية في المرحلة الاستوائية.",
      reasoningSteps_ar: [
        "مقارعة الفرضية (أ) بنتيجة تضاعف ADN واستنتاج دحضها.",
        "مقارعة الفرضية (ب) بنتيجة شلل المغزل والجسيم المركزي واستنتاج صحتها.",
        "صياغة المصادقة النهائية المنسجمة مع المعطيات.",
      ],
      biologicalModel_ar: {
        system_ar: "الخلايا السرطانية أثناء الانقسام الخيطي المتساوي",
        experimentalConditions_ar: "معاملة بدواء مضاد للانقسام وقياس ADN ومغزل الانقسام",
        governingBiologicalMechanisms_ar: ["ديناميكية الأنيبيبات الدقيقة لمغزل الانقسام والاستهداف الدوائي للسرطان"],
        evidenceExtracted_ar: "تضاعف الـ ADN إلى 2ك، وعجز ألياف المغزل عن التثبت بالصبغيات",
        deductionOrConclusion_ar: "المعطيات تدحض استهداف تضاعف المورثات وتؤكد استهداف هيكل المغزل اللالوني",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "المصادقة على الفرضية (ب) مباشرة دون تفنيد الفرضية (أ) بالدليل التجريبي، وهو خلل منهجي في مسار الاستدلال الإقصائي.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لدحض الفرضية (أ) بحجة تضاعف ADN، 1.0 ن لمصادقة الفرضية (ب) بحجة المغزل، 1.0 ن للخلاصة التركيبية المصادقة.",
    },
    l4_transfer: {
      id: "snv_reas_l4_01",
      capabilityId: "snv_scientific_reasoning_hypothesis_validation",
      level: "L4_TRANSFER",
      format: "scientific_reasoning",
      estimatedTimeMin: 12,
      prompt_ar: "يتميز سم 'التيدوتوكسين' (TTX) المستخرج من سمكة الفوغو بقدرته على إحداث شلل فوري للسيالة العصبية دون أن يؤثر على كمون الراحة (-70 mV). اقترح فريقان بحثيان فرضيتين متنافستين:\n- الفريق الأول: يثبط TTX مضخة Na+/K+ ATPase.\n- الفريق الثاني: يسد TTX قنوات الصوديوم الفولطية (Nav) في الغشاء الهيولي للمحور الأسطواني.\nأجريت تجربتان:\n- التجربة (1): وُضع ليف عصبي في ماء بحر اصطناعي مشع بـ 24Na+ ثم عولج بـ TTX، فلم يتأثر خروج شوارد Na+ المشعة نحو الخارج في وجود ATP.\n- التجربة (2): طُبق تنبيه فعال لليف العصبي المعالج بـ TTX، فغاب كلياً تيار الصوديوم الداخلي (INa) ولم يُسجل أي زوال استقطاب للغشاء.\nناقش نتائج التجربتين بالاستدلال العلمي المؤسس، وبين أي الفريقين قدم الفرضية الصائبة مع تبرير إقصاء الفرضية الأخرى.",
      expectedResponse_ar: "الاستدلال العلمي ومناقشة الفرضيتين:\n1) مناقشة فرضية الفريق الأول وإقصاؤها:\n- افترض الفريق الأول أن سم TTX يثبط مضخة Na+/K+ ATPase.\n- التجربة (1) تبين أن طرد شوارد Na+ المشعة نحو الخارج في وجود ATP استمر بشكل طبيعي ولم يتأثر إطلاقاً بحقن سم TTX. وبما أن طرد Na+ ضد تدرج التركيز وباستهلاك ATP هو النشاط الحصري لمضخة Na+/K+، فإن استمرار هذا الخروج يثبت قطيعاً أن المضخة سليمة 100% ونشاطها غير معطل بالسم.\n- كما أن معطيات الموضوع تؤكد أن كمون الراحة (-70 mV) بقي ثابتاً، ومعلوم أن ثبات كمون الراحة يتطلب حتماً نشاط المضخة.\n- وعليه: هذه الأدلة التجريبية والفيزيولوجية تدحض فرضية الفريق الأول دحضاً تاماً وتلغيها.\n2) مناقشة وتأكيد فرضية الفريق الثاني:\n- افترض الفريق الثاني أن TTX يسد قنوات الصوديوم المرتبطة بالفولطية (Nav).\n- التجربة (2) تثبت أنه عند تطبيق تنبيه فعال، غاب تماماً تيار الصوديوم الداخلي (INa) السريع، ولم يحدث أي زوال استقطاب للغشاء الهيولي. وبما أن تيار الدخول الداخلي لـ Na+ وانطلاق زوال الاستقطاب محكومان حصراً بانفتاح قنوات الصوديوم الفولطية Nav، فإن انعدام هذا التيار يؤكد أن هذه القنوات قد انسدت ومُنعت من الانفتاح بفعل ارتباط السم بها.\nالخلاصة: فرضية الفريق الثاني هي الفرضية الصائبة الوحيدة: سم TTX جزيء سام يرتبط بنوعية عالية بالقنوات الفولطية للصوديوم Nav ويسد فتحتها الخارجية، مانعاً تدفق Na+ نحو الداخل، مما يشل توليد وانتشار كمونات العمل مسبباً الشلل التام.",
      reasoningSteps_ar: [
        "استغلال التجربة (1) لدحض فرضية تثبيط المضخة بحجة استمرار طرد Na+ وثبات كمون الراحة.",
        "استغلال التجربة (2) لتأكيد انسداد قنوات Nav بحجة غياب تيار الصوديوم وزوال الاستقطاب.",
        "صياغة حكم نهائي مؤسس يؤيد الفريق الثاني ويقصي الفريق الأول.",
      ],
      biologicalModel_ar: {
        system_ar: "الغشاء الهيولي لليف العصبي تحت تأثير سم التيترودوتوكسين",
        experimentalConditions_ar: "تتبع الإشعاع الشاردي للضخ الفعال وقياس تيارات كمون العمل بالـ Patch-Clamp",
        governingBiologicalMechanisms_ar: ["النوعية الدوائية للمضخات مقابل القنوات الفولطية الشاردية"],
        evidenceExtracted_ar: "استمرار طرد Na+ بواسطة ATP وغياب تيار INa الفولطي تماماً",
        deductionOrConclusion_ar: "TTX حاجب نوعي لقنوات الصوديوم الفولطية وليس له أي أثر على المضخة الأيونية",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "الظن بأن أي سم يؤثر على الصوديوم يجب أن يستهدف المضخة، وتجاهل الفارق الوظيفي بين النقل الفعال للمضخة وتيار الانتشار الفولطي للقنوات.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5 ن لاستدلال التجربة (1) وإقصاء الفريق الأول، 1.5 ن لاستدلال التجربة (2) وتأكيد الفريق الثاني، 1.0 ن للخلاصة التركيبية الدقيقة.",
    },
    l5_bac_style: {
      id: "snv_reas_l5_01",
      capabilityId: "snv_scientific_reasoning_hypothesis_validation",
      level: "L5_BAC_STYLE",
      format: "structured_written",
      estimatedTimeMin: 18,
      prompt_ar: "مرض الكساح المقاوم لفيتامين د (Rachitisme vitamino-résistant) مرض وراثي يتميز بضعف تعظم الهيكل العظمي وتلين وتشوه العظام رغم تزويد المرضى بجرعات عالية من فيتامين د الطبيعي في غذائهم. فيزيولوجياً، يمتص فيتامين د من الأمعاء ويتحول في الكبد إلى هيدروكسي-فيتامين د (25-OH-D3)، ثم يتحول في الكلى بفضل إنزيم 1-ألفا-هيدروكسيلاز (1α-hydroxylase) إلى الهرمون الفعال كالسيتريول (1,25-(OH)2-D3) الذي يرتبط بمستقبل نووي (VDR) في الخلايا المعوية لتحفيز اصطناع بروتينات نقل وتثبيت الكالسيوم.\nاقترح الأطباء فرضيتين لتفسير أسباب هذا المرض:\n- الفرضية 1: طفرة تؤدي إلى غياب أو فقدان نشاط إنزيم 1-ألفا-هيدروكسيلاز في الكلى.\n- الفرضية 2: طفرة وراثية في مورثة المستقبل النووي VDR تمنع ارتباط الكالسيتريول به أو تمنع تنشيط التعبير المورثي لناقل الكالسيوم.\nتمت معايرة المركبات في بلازما مريض مصاب فبينت النتائج:\n- تركيز فيتامين د الكبدي (25-OH-D3) = طبيعي.\n- تركيز الهرمون الفعال الكالسيتريول (1,25-(OH)2-D3) = مرتفع جداً (أربعة أضعاف المعدل الطبيعي).\n- عند عزل خلايا معوية من المريض وحقنها بالكالسيتريول المشع، لوحظ ارتباط الهرمون بالمستقبلات VDR لكن لم يُسجل أي استنساخ للـ ARNm الخاص بنواقل الكالسيوم.\n1) ناقش باستدلال علمي منطقي الفرضيتين المقترحتين، وصادق على الفرضية الصائبة.\n2) اقترح حلاً علاجياً منطقياً ينقذ هذا المريض من التشوه العظمي استناداً إلى نتائج استدلالك.",
      expectedResponse_ar: "1) الاستدلال العلمي ومحاكمة الفرضيتين:\n- محاكمة الفرضية 1:\n  * تنص الفرضية 1 على وجود عجز في إنزيم 1-ألفا-هيدروكسيلاز الكلوي المسؤول عن تركيب الكالسيتريول الفعال.\n  * أظهرت التحاليل البلازمية للمريض أن تركيز هرمون الكالسيتريول الفعال (1,25-(OH)2-D3) ليس منخفضاً أو منعدماً بل هو مرتفع جداً ويبلغ 4 أضعاف القيمة الطبيعية، مما يثبت قطيعاً أن الإنزيم الكلوي 1-ألفا-هيدروكسيلاز سليم تماماً ونشط بكفاءة فائقة.\n  * وعليه: هذه النتيجة تدحض الفرضية 1 دحضاً تاماً وتقصيها كلياً.\n- محاكمة والمصادقة على الفرضية 2:\n  * تنص الفرضية 2 على وجود خلل في المستقبل النووي VDR أو في آلية تنشيط التعبير المورثي لناقل الكالسيوم.\n  * بينت التجربة الخلوية أن الكالسيتريول يرتبط بنجاح بالمستقبل النووي VDR، لكن هذا المعقد (هرمون-مستقبل) عاجز تماماً عن إطلاق استنساخ المورثة المشفرة لبروتينات نقل الكالسيوم، مما يثبت أن الطفرة الوراثية أصابت موقع التثبت على الـ ADN في المستقبل النووي (Domaine de liaison à l'ADN) أو موقع تنشيط الاستنساخ، مع سلامة موقع تثبيت الهرمون.\n  * وعليه: عجز الخلايا المعوية عن استنساخ نواقل الكالسيوم يمنع امتصاص الكالسيوم من لمعة الأمعاء نحو الدم، فيحدث نقص حاد في كلس الدم يتعذر معه تعظم وتصلب العظام، وتظهر تشوهات الكساح رغم وفرة فيتامين د والكالسيتريول.\n  * المصادقة: نلغي الفرضية 1، وتؤكد النتائج صحة الفرضية 2 مع تدقيقها: المرض ناتج عن طفرة في مستقبل VDR تعطل تنشيط التعبير المورثي لناقل الكالسيوم في الأمعاء.\n2) المقترح العلاجي المنطقي والتبرير:\n- المقترح العلاجي: حقن المريض بجرعات علاجية عالية ومكثفة من شوارد الكالسيوم (Calcium) والفوسفات مباشرة عن طريق الوريد (أو إعطائها فموياً بجرعات هائلة جداً تسمح بالامتصاص السلبي بالانتشار البسيط دون حاجة للنواقل الغشائية).\n- التبرير: بما أن مسار التحفيز الهرموني عبر فيتامين د ومستقبلاته معطل وراثياً ولا يمكن إصلاحه بإعطاء مزيد من الفيتامينات، فإن تزويد الدم مباشرة بالكالسيوم يرفع تركيزه البلازمي متجاوزاً عجز النواقل المعوية، مما يوفر شوارد الكالسيوم الكافية لتمعدن العظام وترسيب بلورات الهيدروكسي أباتيت وإعادة بناء العظام السليمة ووقف التشوهات.",
      reasoningSteps_ar: [
        "استغلال وفرة الكالسيتريول البلازمية لدحض الفرضية 1 الإنزيمية الكلوية.",
        "استغلال عجز استنساخ ARNm لناقل الكالسيوم رغم ارتباط الهرمون لمصادقة الفرضية 2 وتدقيق موقع الطفرة النووي.",
        "اقتراح بديل علاجي يتجاوز العقدة الجينية بتزويد الكالسيوم الوريدي المباشر لتصليب العظام.",
      ],
      biologicalModel_ar: {
        system_ar: "تنظيم امتصاص وتثبيت الكالسيوم العظمي عبر محور فيتامين د",
        experimentalConditions_ar: "معايرة بلازمية لهرمونات فيتامين د وفحص بيولوجي جزيئي للخلايا المعوية",
        governingBiologicalMechanisms_ar: ["الاستقبال النووي الهرموني وتنشيط التعبير المورثي للنواقل الغشائية"],
        evidenceExtracted_ar: "ارتفاع الكالسيتريول 4 أضعاف وانعدام استنساخ ARNm لنواقل الكالسيوم",
        deductionOrConclusion_ar: "المرض ناتج عن طفرة في موقع تنشيط الاستنساخ للمستقبل النووي VDR",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اقتراح معالجة المريض بجرعات إضافية من فيتامين د أو الكالسيتريول، وهو اقتراح غير مجدٍ لأن المشكلة تقع بعد الهرمون في المستقبل المعطل.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5 ن لدحض الفرضية 1 بحجة ارتفاع الكالسيتريول، 1.5 ن لمصادقة وتدقيق الفرضية 2 بعجز الاستنساخ، 1.0 ن لاقتراح تزويد الكالسيوم المباشر وتبريره.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "المصادقة على فرضية دون دحض الفرضيات المنافسة بالأدلة، أو استخدام لغة جزم مطلقة غير مبررة بالمعطيات الجزئية، أو الخلط بين إثبات صحة الفرضية وإعادة سرد المشكلة المطروحة.",
    wrongMentalModel_ar: "أختار الفرضية التي تعجبني وأكتب أنها صحيحة لأنني درستها في القسم.",
    correctMentalModel_ar: "الفرضية بريئة حتى تثبتها الأدلة؛ كل فرضية خاطئة يجب أن تعدمها بدليل صريح من الوثيقة، والفرضية الصحيحة تتطابق تنبؤاتها مع النتائج تماماً كبصمة الإصبع.",
    threeStepActionProtocol_ar: [
      "1. حاكم الفرضية الأولى: قارن منطقها مع الوثيقة؛ إذا تعارضت فاكتب: 'المعطى (س) يتعارض مع الفرضية (1) مما يدحضها وينفيها'.",
      "2. حاكم الفرضية الثانية: أظهر التوافق: 'النتيجة (ص) تتوافق تماماً مع الفرضية (2) حيث تفسر أن...'.",
      "3. صغ المصادقة: 'وعليه نصادق على صحة الفرضية (2) ونستنتج أن الآلية هي...' مستعملاً عبارات علمية محترزة.",
    ],
    microDrill_ar: {
      prompt_ar: "في تجربة لإثبات مقر تركيب البروتين، افترض تلميذ أن البروتين يركب داخل النواة. ما هو الدليل التجريبي القاطع من تجارب الوسم باليوراسيل والأحماض الأمينية المشعة الذي يدحض هذه الفرضية تماماً؟",
      solution_ar: "الدليل الداحض: ظهور الإشعاع الخاص بالأحماض الأمينية وتجمعه حصراً على مستوى الشبكة الهيولية المحببة والريبوسومات في الهيولى وانعدامه داخل النواة، مما يثبت أن مقر التركيب هو الهيولى ويدحض فرضية النواة.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_reas_retest_01",
    invariantTested_ar: "الاستدلال الإقصائي والمحاكمة المنطقية لفرضيتين متنافستين بلغة علمية دقيقة.",
    changedSurface_ar: "تطبيق على مرض فقر الدم الانحلالي الوراثي ودور إنزيم G6PD في حماية كريات الدم الحمراء من الإجهاد التأكسدي عند تناول حبوب الفول (Favisme).",
    prompt_ar: "مرض الفوال (Favisme) هو انحلال دموي حاد يصيب بعض الأفراد بعد تناولهم لحبوب الفول. فسر الأطباء هذا الانحلال بفرضيتين:\n- الفرضية (أ): تحتوي حبوب الفول على سم نباتي يرتبط ببروتينات الغشاء الهيولي لكريات الدم الحمراء ويثقبها كيميائياً.\n- الفرضية (ب): تحتوي حبوب الفول على مواد مؤكسدة (Vicines) تسبب أكسدة بروتينات الغشاء وتمزق الكريات الحمراء فقط لدى الأفراد الذين يمتلكون عجزاً وراثياً في إنزيم G6PD المسؤول عن تجديد النواقل المرجعة الحامية.\nأجريت دراسة على مجموعتين من الأشخاص تناولوا نفس الوجبة من الفول:\n- المجموعة 1 (أشخاص أصحاء): لم يطرأ عليهم أي انحلال دموي، وكانت مستويات إنزيم G6PD في كرياتهم طبيعية.\n- المجموعة 2 (المرضى المصابون بالانحلال): بينت التحاليل أن نشاط إنزيم G6PD في كرياتهم الحمراء منعدم تقريباً (أقل من 5% من الطبيعي).\nناقش صحة الفرضيتين بالاستدلال العلمي، وصادق على الفرضية الصائبة.",
    solution_ar: "الاستدلال العلمي ومحاكمة الفرضيتين:\n- مناقشة الفرضية (أ): تنص الفرضية (أ) على أن حبوب الفول تحتوي على سم يثقب كريات الدم الحمراء مباشرة؛ لو كان هذا السم موجوداً ويؤثر ذاتياً على جميع الكريات لأصاب الانحلال الدموي أفراد المجموعة 1 الأصحاء الذين تناولوا نفس الوجبة بنفس الكمية؛ لكن سلامتهم التامة تدل على أن حبوب الفول لا تؤذي الكريات الحمراء السليمة، مما يدحض الفرضية (أ) تماماً ويقصيها.\n- مناقشة والمصادقة على الفرضية (ب): تنص الفرضية (ب) على أن مواد الفول المؤكسدة تتطلب عجزاً في إنزيم G6PD لإحداث الانحلال؛ وهذا يتطابق كلياً مع نتائج المجموعة 2 التي أثبتت أن الانحلال لم يظهر إلا لدى الأفراد الذين يعانون من عجز وراثي حاد في إنزيم G6PD؛ فغياب هذا الإنزيم يحرم الكريات من إنتاج NADPH اللازم لإعادة إرجاع الغلوتاتيون الحامي للغشاء، فتتأكسد الليبيدات وتتمزق الكريات.\nالمصادقة: نلغي الفرضية (أ)، ونصادق على صحة الفرضية (ب): مرض الفوال ناتج عن تفاعل المواد المؤكسدة في الفول مع العجز الوراثي لإنزيم G6PD في الكريات الحمراء.",
    passCondition_ar: "استعمال سلامة المجموعة الشاهدة لدحض الفرضية الأولى، وربط عجز G6PD في المجموعة الثانية بمصادقة الفرضية الثانية.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: استدلال علمي حول آلية مقاومة البكتيريا للمضادات الحيوية (المثبطات الإنزيمية)",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "تعتبر بكتيريا المكورات العنقودية الذهبية المقاومة للميثيسيلين (SARM) من أخطر مسببات العدوى الاستشفائية. مضاد 'الميثيسيلين' ينتمي للبيتا-لاكتامين ويعمل على تثبيط إنزيم ترانسببتيداز (PLP) المسؤول عن بناء الجدار البكتيري مما يؤدي لموت البكتيريا. اقترح باحثون فرضيتين لتفسير مقاومة هذه السلالة:\n- الفرضية 1: تفرز بكتيريا SARM إنزيماً محللاً للمضاد الحيوي (إنزيم بيتا لاكتاماز Beta-lactamase) يكسر حلقة البيتا-لاكتامين ويبطل مفعول الدواء.\n- الفرضية 2: تمتلك بكتيريا SARM طفرة وراثية أنتجت شكلاً معدلاً من إنزيم بناء الجدار (بروتين PLP2a) يمتلك ألفة ضعيفة جداً للميثيسيلين مع احتفاظه بالقدرة على ربط الببتيدوغليكان وبناء الجدار.\nأظهرت التجارب:\n- التجربة (1): وُضع الميثيسيلين في راشح مستعمرة بكتيريا SARM لعدة ساعات ثم تم قياس تركيزه، فبقي تركيز المضاد الحيوي ثابتاً 100% دون أي تفكك.\n- التجربة (2): تم فحص بنية إنزيمات الجدار للبكتيريا المقاومة، فعُثر على بروتين جديد PLP2a، وتطلب تثبيطه جرعات تفوق 1000 مرة الجرعة الفعالة للبكتيريا الحساسة، مع استمرار بناء الجدار بكفاءة عالية في وجود الجرعات العلاجية للميثيسيلين.\n1) ناقش بالاستدلال العلمي صحة الفرضيتين وصادق على الفرضية الصائبة.\n2) بناءً على هذه النتائج، بين لماذا يعد إضافة مثبطات إنزيم البيتا-لاكتاماز (مثل حمض الكلافولانيك) خياراً علاجياً غير مجدٍ ضد بكتيريا SARM، واقترح استراتيجية بديلة للتغلب عليها.",
    modelSolution_ar: [
      "1) مناقشة الفرضيتين والمصادقة بالاستدلال العلمي:\n- مناقشة الفرضية 1:\n  * تنص الفرضية 1 على أن البكتيريا تقاوم الميثيسيلين بإفراز إنزيم البيتا لاكتاماز الذي يفكك جزيئة الدواء.\n  * أثبتت التجربة (1) أن وضع الميثيسيلين في راشح بكتيريا SARM لم يغير تركيزه إطلاقاً وبقي ثابتاً بنسبة 100%، مما يدل قطعاً على أن الراشح يخلو تماماً من أي نشاط إنزيمي مفكك للميثيسيلين، وأن الجزيئة الدوائية بقيت سليمة بكامل بنيتها وحلقتها.\n  * وعليه: هذه النتيجة تدحض الفرضية 1 تماماً وتلغيها من التفسير.\n- مناقشة والمصادقة على الفرضية 2:\n  * تنص الفرضية 2 على اكتساب البكتيريا لإنزيم جداري طافر (PLP2a) ذي ألفة منخفضة للمضاد الحيوي.\n  * أثبتت التجربة (2) وجود هذا البروتين الجديد PLP2a في البكتيريا المقاومة، وأظهرت التحاليل البيوكيميائية أنه يتطلب جرعات هائلة تفوق بـ 1000 مرة الجرعة الطبيعية لكي يرتبط به الميثيسيلين، في حين استمر هذا الإنزيم في بناء جدار البكتيريا بفعالية تامة في وجود الجرعات العلاجية للمضاد الحيوي.\n  * يدل هذا على أن الطفرة غيرت البنية الفضائية للموقع الفعال للإنزيم بحيث لم يعد يتكامل فراغياً مع الميثيسيلين، مع حفاظه على التكامل مع ركيزته الطبيعية (الببتيدوغليكان)، مما سمح للبكتيريا بمواصلة التكاثر وبناء جدارها دون أن تتأثر بوجود الدواء.\n  * المصادقة: نلغي الفرضية 1، وتصادق النتائج بيقين على صحة الفرضية 2: المقاومة ناتجة عن تعديل بنيوي في إنزيم الهدف (اكتساب PLP2a) وليس عن تفكيك الإنزيم للمضاد الحيوي.\n2) تعليل عدم جدوى حمض الكلافولانيك واقتراح الاستراتيجية البديلة:\n- التعليل: حمض الكلافولانيك مثبط نوعي لإنزيمات البيتا-لاكتاماز؛ وبما أن تجربة (1) أثبتت أن بكتيريا SARM لا تعتمد على هذا الإنزيم إطلاقاً ولا تفرزه في مقاومتها، فإن إضافة مثبط البيتا لاكتاماز يكون بلا أي جدوى سريرية لأن الهدف المفترض للإنزيم غائب أصلاً.\n- الاستراتيجية العلاجية البديلة: استخدام فئة مغايرة تماماً من المضادات الحيوية لا تستهدف إنزيمات الـ PLP، كاستخدام مضادات حيوية من عائلة الغليكوببتيدات (مثل الفانكومايسين Vancomycine) التي ترتبط مباشرة بركيزة الجدار (نهايات D-Ala-D-Ala) وتمنع بلمرتها مكانياً، أو مضادات تستهدف الريبوسومات البكتيرية وتثبط تركيب البروتين (مثل اللينيزوليد Linezolid).",
    ],
    markingScheme_ar: [
      { criterion: "استدلال التجربة (1) ودحض الفرضية 1 لغياب التفكيك الإنزيمي", points: 1.5 },
      { criterion: "استدلال التجربة (2) ومصادقة الفرضية 2 بالتعديل البنيوي لـ PLP2a", points: 1.5 },
      { criterion: "تعليل فشل مثبطات البيتا لاكتاماز واقتراح بديل صائب كالفانكومايسين", points: 2.0 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - التوجيهات التربوية الرسمية لمفتشية مادة علوم الطبيعة والحياة للطور الثانوي",
    historicalBacRef: "BAC 2023 Sciences Expérimentales Sujet 1 Exercice 2",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};

// ============================================================================
// 17. snv_functional_schema_synthesis_construction
// ============================================================================

export const SNV_FUNCTIONAL_SCHEMA_PACKAGE: CanonicalSNVCapabilityPackage = {
  capabilityId: "snv_functional_schema_synthesis_construction",
  canonicalTitle_ar: "المنهجية: بناء النماذج التفسيرية، المخططات الوظيفية، والتركيب البيولوجي",
  canonicalTitle_fr: "Méthodologie : modélisation fonctionnelle, schémas de synthèse et construction conceptuelle",
  discipline: "natural_sciences",
  domain: "المنهجية والكفاءات العرضية",
  unit: "بناء النماذج التفسيرية والمخططات الوظيفية والتركيبية",
  status: "APPROVED",
  scopeIn: [
    "بناء النماذج البيولوجية الوظيفية (Modélisation fonctionnelle): تحويل المعطيات النصية والآليات المستنتجة إلى مخطط تركيبي تفسيري يبرز العلاقات السببية بين الكيانات البيولوجية.",
    "العناصر الإلزامية للمخطط الوظيفي العلمي السليم: تحديد الكيانات البيولوجية (عضيات، جزيئات، مستقبلات، شوارد)، تحديد الحالات الفيزيولوجية، ترميز التحولات والآليات بأسهم موجهة ومعبرة (تنبيه، تثبيط، انتقال، إفراز).",
    "التسلسل الزمني والترتيب المنطقي للظواهر: تنظيم تدفق المعلومات والعمليات من المنبه الأولي إلى الاستجابة النهائية دون اختلال في الترتيب السببي.",
    "المعايير المنهجية الشكلية المساعدة: صياغة عنوان وظيفي دقيق وشامل يحدد الظاهرة والشرط التجريبي بدقة (دون فرض اشتراط تعسفي لموقع العنوان أعلى أو أسفل)، وضع بيانات واضحة وكاملة، ومفتاح مصطلحات ورموز إن لزم.",
    "التركيب البيولوجي النصي والمخططي: الربط التوليفي بين مختلف مستويات التنظيم الحيوية (الجزيئي، الخلوي، العضوي، والجهازي).",
  ],
  scopeOut: [
    "الرسوم التشريحية الصرفة المفرغة من العلاقات السببية والتدفق الوظيفي للمعلومات.",
    "فرض قواعد تزيين شكلية تعسفية لا علاقة لها بالدقة العلمية (مثل ادعاء وجوب وضع العنوان في الأسفل حصراً أو استعمال ألوان معينة).",
  ],
  prerequisites: {
    hard: ["snv_document_analysis_information_extraction", "snv_scientific_reasoning_hypothesis_validation"],
    soft: ["مهارات الرسم والتخطيط التجريدي والتنظيم الفضائي للعناصر"],
    foundation: ["فهم العلاقات السببية والترتيب الزمني للتفاعلات البيولوجية"],
    crossCutting: [],
  },
  learningObjectives: [
    {
      code: "LO_SNV_SCHEMA_01",
      bloomLevel: "create",
      description_ar: "ينجز مخططاً وظيفياً تفسيرياً متكاملاً يترجم الآليات البيولوجية المدروسة بدقة علمية ووضوح مفاهيمي.",
    },
    {
      code: "LO_SNV_SCHEMA_02",
      bloomLevel: "apply",
      description_ar: "يوظف الأسهم الموجهة والرموز الاصطلاحية للتعبير عن العلاقات السببية والتحولات الكيميائية والفيزيولوجية.",
    },
    {
      code: "LO_SNV_SCHEMA_03",
      bloomLevel: "evaluate",
      description_ar: "يقيم الصرامة العلمية لمخطط بيولوجي من حيث دقة الكيانات، التسلسل الزمني، وشمولية العنوان والبيانات.",
    },
  ],
  coreConcepts_ar: [
    "المخطط الوظيفي (Schéma fonctionnel): تمثيل تركيبي تخطيطي يبرز كيفية عمل النظام والعلاقات السببية بين مكوناته.",
    "الكيانات البيولوجية (Entités): المكونات المادية الممثلة في النموذج (غشاء، ريبوسوم، حويصل، مستقبل، هرمون).",
    "الأسهم الموجهة: أدوات الربط المنطقي التي تحدد اتجاه انتقال المادة أو الطاقة أو الرسالة أو التسلسل الزمني للأحداث.",
    "العنوان الوظيفي: عبارة علمية دقيقة تبدأ عادة بـ 'رسم تخطيطي وظيفي يوضح...' وتحدد الظاهرة والشرط المدروس بدقة.",
    "مفتاح الرموز: توضيح المعاني الاصطلاحية للأشكال والأسهم المستخدمة (سهم عادي لانتقال، سهم بخط متقطع لتثبيط، إلخ).",
  ],
  lessonPackage: {
    overview_ar: "المخطط الوظيفي والتركيب البيولوجي هو ذروة الأداء العلمي في مادة علوم الطبيعة والحياة؛ فهو اختبار لقدرة التلميذ على الانتقال من المعرفة التحليلية المجزأة إلى المعرفة التركيبية المنظمة، عبر بناء نموذج مفهومي يعكس حقيقة الآليات الحيوية المتفاعلة داخل الكائن الحي.",
    biologicalMechanism_ar: [
      "1. جرد الكيانات الفاعلة والشروط: قبل البدء في الرسم، يستخرج التلميذ من نصوص ووثائق الموضوع قائمة الكيانات البيولوجية المشاركة (الخلايا، العضيات، الجزيئات، الإنزيمات، الشوارد) ومحددات الوسط (وجود منبه، غياب مادة، تأثير دواء).",
      "2. التنسيق الفضائي والترتيب المنطقي: توزع الكيانات على مساحة الرسم بتناسق يراعي المقار الخلوية (هيولى، نواة، غشاء، شق مشبكي، دم) ويحترم التسلسل الزمني للأحداث من البداية (المحفز الأولي) إلى النهاية (الأثر الفيزيولوجي).",
      "3. تحديد مسارات العلاقات والأسهم الموجهة: ربط الكيانات بأسهم ذات دلالات محددة وصريحة:\n   - أسهم خطية موجهة لبيان حركة انتقال جزيئات أو شوارد.\n   - أسهم تحويل كيميائي لبيان تفاعل إنزيمي (ركيزة -> ناتج).\n   - أسهم تنشيط (+) أو تثبيط (-) لبيان التأثيرات التنظيمية والرجعية.",
      "4. التأطير المنهجي النهائي: وضع بيانات علمية دقيقة ومرتبة على جانبي المخطط، مفتاح للمصطلحات إن تعددت الأشكال الرمزية، وكتابة عنوان وظيفي دقيق وشامل يصف موضوع المخطط بدقة علمية كاملة.",
    ],
    evidenceAndObservation_ar: "في اختبارات البكالوريا (خاصة السؤال الأخير من التمرين الثاني أو التمرين الثالث)، تُسند علامة معتبرة (1.5 إلى 2.5 نقطة) لإنجاز رسم تخطيطي أو مخطط وظيفي تركيبي. تكشف معايير التصحيح الرسمية أن التركيز ينصب أساساً على 'الصحة العلمية للمعلومات والأسهم والترتيب المنطقي والبيانات' وليس على المهارة الفنية التشكيلية للتلميذ.",
    scientificReasoning_ar: "المخطط الوظيفي ليس عملاً فنياً زخرفياً، بل هو 'معادلة بيولوجية بصرية': كل سهم فيه يمثل فرضية برهانية، وكل رمز يمثل كياناً وظيفياً. وإذا انقلب اتجاه سهم واحد أو غاب كيان وسيط، انهار النموذج العلمي كاملاً وفقد معناه.",
    biologicalConclusion_ar: "بناء النماذج الوظيفية يمنح التلميذ القدرة على اختزال العمليات البيولوجية المعقدة في تراكيب بصرية متكاملة، مما يرسخ الفهم العميق للظواهر الحيوية ويمكنه من استرجاعها وربطها بيسر واقتدار.",
  },
  workedModel: {
    problem_ar: "انطلاقاً من معارفك المكتسبة حول مشبك كيميائي تنبيهي يعمل بالأستيل كولين، أنجز مخططاً وظيفياً تفسيرياً يوضح الآليات الجزيئية لنقل الرسالة العصبية على مستوى هذا المشبك، مبرزاً المراحل المتتالية من وصول كمون العمل قبل المشبكي حتى توليد كمون العمل بعد المشبكي وإلغاء مفعول المبلغ.",
    documentData_ar: "البيانات: كمون العمل قبل المشبكي، قنوات الكالسيوم الفولطية (Ca2+)، حويصلات الأستيل كولين، إطراح خلوي، شق مشبكي، مستقبلات قنوية كيميائية (AChR)، تدفق شوارد Na+، كمون بعد مشبكي (PPSE)، عتبة التنبيه، و إنزيم أستيل كولين إستراز (AChE).",
    observation_ar: "المطلوب بناء نموذج تفسيري متسلسل يربط الظواهر الكهربائية بالظواهر الكيميائية وعودة الاستقطاب الطبيعي.",
    interpretation_ar: "خطوات هندسة المخطط الوظيفي التفسيري:\n1) الإطار البنيوي: رسم تخطيطي لزر مشبكي قبل مشبكي، شق مشبكي، وغشاء بعد مشبكي.\n2) الكيانات المرقمة بالترتيب الزمني الحتمي:\n   - خطوة (1): وصول كمون العمل (زوال استقطاب الغشاء قبل المشبكي) -> سهم كهربائي نحو النهاية.\n   - خطوة (2): انفتاح قنوات الكالسيوم المرتبطة بالفولطية (Ca2+) -> سهم دخول لشوارد Ca2+ من الشق نحو الزر المشبكي.\n   - خطوة (3): هجرة حويصلات الأستيل كولين والتحامها بالغشاء قبل المشبكي -> إطراح خلوي وتحرير جزيئات الأستيل كولين في الشق المشبكي.\n   - خطوة (4): انتشار الأستيل كولين وتثبته النوعي على موقعي التثبيت للمستقبلات القنوية الكيميائية (AChR) على الغشاء بعد المشبكي.\n   - خطوة (5): انفتاح القنوات الكيميائية وتدفق داخلي سريع لشوارد الصوديوم (Na+) وفق تدرج التركيز.\n   - خطوة (6): توليد زوال استقطاب بعد مشبكي (PPSE) يبلغ عتبة التنبيه -> توليد كمون عمل بعد مشبكي وانتشاره على طول المحور.\n   - خطوة (7): الإلغاء السريع لمفعول المبلغ: تفكيك الأستيل كولين بواسطة إنزيم أستيل كولين إستراز (AChE) إلى أسيتات + كولين، وانغلاق قنوات Na+، وإعادة امتصاص الكولين نحو الزر قبل المشبكي.\n3) العنوان الوظيفي: 'رسم تخطيطي وظيفي يوضح الآليات الجزيئية للنقل المشبكي التنبيهي وتفكيك المبلغ العصبي'.",
    deduction_ar: "التقييم التركيبي: المخطط السليم هو الذي يوضح التحول المزدوج لطبيعة السيالة العصبية: من إشارة كهربائية (تواتر كمونات عمل) إلى رسالة كيميائية مشفرة بتركيز المبلغ في الشق، ثم إلى رسالة كهربائية بعد مشبكية مشفرة بسعة زوال الاستقطاب.",
  },
  practiceLadder: {
    l1_foundation: {
      id: "snv_schema_l1_01",
      capabilityId: "snv_functional_schema_synthesis_construction",
      level: "L1_FOUNDATION",
      format: "mcq",
      estimatedTimeMin: 4,
      prompt_ar: "ما هو الشرط الأساسي الذي يفرق بين 'رسم تخطيطي بنيوي لملاحظة مجهرية' و 'مخطط وظيفي تفسيري لظاهرة حيوية' في مادة علوم الطبيعة والحياة؟\nأ) أن المخطط الوظيفي يجب أن يُرسم بألوان زيتية خاصة داخل إطار دائري\nب) أن المخطط الوظيفي يعبر عن مسار ديناميكي وعلاقات سببية متسلسلة للأحداث باستخدام الأسهم الموجهة والرموز الاصطلاحية\nج) أن المخطط الوظيفي لا يحتوي أبداً على أي بيانات علمية أو عناوين توضيحية\nد) أن المخطط الوظيفي يقتصر فقط على الكائنات وحيدة الخلية دون غيرها",
      expectedResponse_ar: "ب) أن المخطط الوظيفي يعبر عن مسار ديناميكي وعلاقات سببية متسلسلة للأحداث باستخدام الأسهم الموجهة والرموز الاصطلاحية",
      reasoningSteps_ar: [
        "الرسم البنيوي يصف الشكل الثابت للعناصر كما ترى عيانياً أو مجهرياً.",
        "المخطط الوظيفي نموذج تفسيري ديناميكي يوضح كيفية عمل النظام والعلاقات السببية والتحولات عبر الزمن بأسهم موجهة.",
      ],
      biologicalModel_ar: {
        system_ar: "المفاهيم المنهجية لنمذجة الظواهر الحيوية",
        experimentalConditions_ar: "التمييز بين التوصيف السكوني والنمذجة الديناميكية",
        governingBiologicalMechanisms_ar: ["التعبير البصري عن السببية والتحول الوظيفي"],
        evidenceExtracted_ar: "التعريف الإبستيمولوجي للنموذج الوظيفي",
        deductionOrConclusion_ar: "المخطط الوظيفي يركز على السببية والمسار الديناميكي للعلاقات",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "اعتبار المخطط الوظيفي مجرد رسم شكلي جميل أو نفي الحاجة للبيانات والعناوين الدقيقة فيه.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: درجة كاملة لاختيار الخيار الصحيح (ب).",
    },
    l2_application: {
      id: "snv_schema_l2_01",
      capabilityId: "snv_functional_schema_synthesis_construction",
      level: "L2_APPLICATION",
      format: "short_answer",
      estimatedTimeMin: 7,
      prompt_ar: "حدد العناصر والكيانات البيولوجية والروابط السببية الإلزامية التي يجب أن يتضمنها مخطط وظيفي يوضح آلية القضاء على خلية سرطانية مستهدفة بواسطة اللمفاوية التائية السامة (LTC).",
      expectedResponse_ar: "العناصر والروابط السببية الإلزامية للمخطط:\n1) الكيانات البيولوجية المشاركة:\n   - الخلية التائية السامة (LTC) بغشائها ومستقبلاتها النوعية (TCR و CD8) وحويصلاتها الإفرازية الحاوية على البيرفورين والغرونزيم.\n   - الخلية السرطانية المستهدفة بغشائها وعارضها لمعقد التوافق النسيجي الصنف الأول (CMH-I) حاملاً ببتيداً مستضدياً غير ذاتي طافر.\n2) الروابط السببية والأسهم الوظيفية الموجهة:\n   - سهم التعرف المزدوج: تكامل بنيوي نوعي بين (TCR + CD8) من جهة LTC و (CMH-I + ببتيد ورمي) من جهة الخلية السرطانية.\n   - سهم التنشيط والتحفيز: إطلاق إشارة هيولية تؤدي لهجرة حويصلات الإفراز نحو منطقة التماس المشبكي المناعي.\n   - سهم الإطراح الخلوي: تحرير بروتينات البيرفورين وإنزيمات الغرونزيم في الفجوة الفاصلة.\n   - سهم بلمرة البيرفورين: تثبت جزيئات البيرفورين في غشاء الخلية السرطانية وتشكيل ثقوب وقنوات غشائية واسعة في وجود Ca2+.\n   - سهم دخول الغرونزيم وتدفق الماء: نفاذ إنزيمات الغرونزيم عبر الثقوب لتفعيل مسار الموت المبرمج (Apoptose)، مع تدفق حلولي للماء والشوارد مسبباً صدمة حلولية وموت وتحلل الخلية السرطانية.\n3) العنوان الوظيفي المقترح: 'مخطط وظيفي يوضح آلية السمية الخلوية لـ LTC وإقصاء الخلية السرطانية'.",
      reasoningSteps_ar: [
        "تحديد الكيانات الفاعلة (LTC والخلية الهدف بمستقبلاتها النوعية).",
        "تحديد الترتيب السببي الدقيق: تعرف مزدوج -> إطراح بيرفورين وغرونزيم -> ثقوب غشائية -> موت مبرمج وصدمة حلولية.",
        "صياغة العنوان الوظيفي الشامل.",
      ],
      biologicalModel_ar: {
        system_ar: "المشبك المناعي السام بين LTC والخلية السرطانية",
        experimentalConditions_ar: "الاستجابة المناعية الخلوية النوعية القاتلة",
        governingBiologicalMechanisms_ar: ["التعرف المزدوج وإفراز وتثقيب البيرفورين والموت المبرمج بالغرونزيم"],
        evidenceExtracted_ar: "المسار الحركي لتخريب الخلية الهدف",
        deductionOrConclusion_ar: "المخطط السليم يجسد تسلسل التعرف المزدوج وتخريب الغشاء والموت المبرمج",
      },
      errorMapping: {
        primaryErrorType: "forgot_information",
        distractorRationale_ar: "إغفال دور إنزيم الغرونزيم والاكتفاء بذكر البيرفورين فقط، أو نسيان تمثيل معقد التوافق النسيجي CMH-I ومستقبل CD8 في التعرف المزدوج.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن للكيانات المادية والتعرف المزدوج الكامل، 1.0 ن لتسلسل الأسهم الوظيفية للسمية الخلوية والعنوان.",
    },
    l3_mixed: {
      id: "snv_schema_l3_01",
      capabilityId: "snv_functional_schema_synthesis_construction",
      level: "L3_MIXED",
      format: "functional_schema",
      estimatedTimeMin: 10,
      prompt_ar: "بناءً على معطيات التعبير المورثي وتخليق البروتين عند حقيقيات النوى، أنجز مخططاً وظيفياً تركيبيابينياً متكاملاً يوضح مسار تدفق المعلومة الوراثية من المورثة في النواة حتى إنتاج بروتين وظيفي في الهيولى، مبرزاً المقار الخلوية، الجزيئات الفاعلة، ومراحل التحول المختلفة.",
      expectedResponse_ar: "تصميم وهندسة المخطط الوظيفي التركيبي:\n1) التقسيم المكاني للمقار الخلوية:\n   - حيز النواة (حقيقيات النوى) مفصولاً بالغلاف النووي الحاوي على الثقوب النووية.\n   - حيز الهيولى الأساسية الحاوي على الريبوسومات وجزيئات ARNt والإنزيمات.\n2) المسار التسلسلي للظواهر الحيوية والأسهم الموجهة:\n   - داخل النواة: قطعة ADN (سلسلة ناسخة 3'->5') خاضعة للاستنساخ الحيوي بواسطة إنزيم ARN بوليميراز وطاقة ATP لتشكيل شريط ARN ما قبل رسول (ARN pré-messager).\n   - خطوة النضج: حذف القطع غير الدالة وتجميع القطع الدالة لتشكيل ARNm ناضج.\n   - خطوة التصدير: سهم انتقال لـ ARNm الناضج عبر الثقب النووي نحو الهيولى.\n   - في الهيولى (مسار موازٍ): تنشيط الأحماض الأمينية بارتباط الحمض الأميني بالـ ARNt النوعي بواسطة إنزيم التنشيط واستهلاك ATP مشكلاً معقد (حمض أميني - ARNt).\n   - مرحلة الترجمة: التقاء ARNm بتحت وحدتي الريبوسوم، وتتابع مراحل الانطلاق (الرامزة AUG)، الاستطالة (تشكل الروابط الببتيدية وإزاحة الريبوسوم)، والنهاية (رامزة التوقف UAA/UAG/UGA وانفصال السلسلة الببتيدية وتفكك الريبوسوم).\n   - خطوة النضج الفضائي: انطواء السلسلة الببتيدية وتشكل الروابط الكيميائية الخاصة بالبنية الفراغية الثالثية أو الرابعة ليصبح بروتيناً وظيفياً.\n3) البيانات والعنوان:\n   - بيانات كاملة: ADN، ARN بوليميراز، ARNm، ثقب نووي، ريبوسوم، ARNt، حمض أميني، رابطة ببتيدية، بروتين وظيفي.\n   - العنوان الوظيفي: 'مخطط وظيفي تركيبي يوضح مسار التعبير المورثي من الاستنساخ النووي إلى الترجمة واكتساب البنية الفضائية في الهيولى'.",
      reasoningSteps_ar: [
        "تنظيم المخطط في حيزين: النواة (الاستنساخ والنضج) والهيولى (التنشيط والترجمة والنضج الفضائي).",
        "ربط الجزيئات بأسهم تدفق واضحة تبين تحول المعلومة من نووية إلى ببتيدية.",
        "وضع البيانات الشاملة والعنوان الوظيفي الدقيق.",
      ],
      biologicalModel_ar: {
        system_ar: "الخلية حقيقية النواة ومركز التحكم الوراثي",
        experimentalConditions_ar: "التعبير المورثي الطبيعي في الخلية الحية",
        governingBiologicalMechanisms_ar: ["الاستنساخ الحيوي", "تنشيط الأحماض الأمينية", "الترجمة الريبوسومية", "الانطواء البنيوي"],
        evidenceExtracted_ar: "المسار الخلوي المتدرج لتخليق البروتينات",
        deductionOrConclusion_ar: "المخطط يجسد التتابع المكاني والزمني من الشفرة النووية إلى الفعالية البروتينية",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "رسم الترجمة داخل النواة، أو نسيان خطوة تنشيط الأحماض الأمينية ومرحلة نضج الـ ARNm، مما يفقد المخطط دقته التركيبية في حقيقيات النوى.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن للتقسيم المكاني للنواة والهيولى والاستنساخ، 1.0 ن للترجمة وتنشيط الأحماض الأمينية والانطواء، 1.0 ن للبيانات والعنوان الوظيفي المكتمل.",
    },
    l4_transfer: {
      id: "snv_schema_l4_01",
      capabilityId: "snv_functional_schema_synthesis_construction",
      level: "L4_TRANSFER",
      format: "functional_schema",
      estimatedTimeMin: 12,
      prompt_ar: "يعمل دواء مضاد للاكتئاب (Fluoxétine / Prozac) على منع إعادة امتصاص الناقل العصبي السيروتونين (Sérotonine) في المشابك الدماغية، مما يبقيه في الشق المشبكي لفترة أطول ويعدل المزاج. أنجز مخططاً وظيفياً تفسيرياً يقارن بين عمل هذا المشبك في الحالة الطبيعية وعمله تحت تأثير دواء الفلوكسيتين، مبرزاً آليات الإفراز والتثبت والتأثير بعد المشبكي ومصير الناقل العصبي.",
      expectedResponse_ar: "بناء المخطط الوظيفي التفسيري المقارن:\n1) قسم الحالة الطبيعية (بدون دواء):\n   - وصول كمون العمل -> انفتاح قنوات الكالسيوم -> إطراح حويصلات السيروتونين في الشق المشبكي.\n   - تثبت السيروتونين على مستقبلاته النوعية بعد المشبكية -> توليد استجابة بعد مشبكية (PPSE).\n   - مصير السيروتونين: يعاد امتصاص معظمه سريعاً نحو الزر قبل المشبكي عبر مضخات ونواقل إعادة الامتصاص النوعية (SERT: Serotonin transporter) ليتوقف التنبيه وتعود المستقبلات لوضع الراحة.\n2) قسم الحالة تحت تأثير دواء الفلوكسيتين:\n   - يمثل دواء الفلوكسيتين كجزيء يثبت نوعياً على نواقل ومضخات إعادة الامتصاص (SERT) على الغشاء قبل المشبكي ويسدها.\n   - سهم انسداد ناقل SERT: عجز السيروتونين عن العودة للزر قبل المشبكي، مما يؤدي إلى بقائه وتراكمه بتركيز مرتفع ومستمر داخل الشق المشبكي.\n   - سهم التنشيط المديد: تكرار واستمرار تثبت السيروتونين على المستقبلات بعد المشبكية، مما يولد كمونات بعد مشبكية متكررة وتدفقاً مستمراً للسيالة في العصبون بعد المشبكي المسؤولة عن تحسين الحالة المزاجية وعلاج أعراض الاكتئاب.\n3) الإخراج المنهجي للمخطط:\n   - استخدام رموز متباينة للسيروتونين والدواء ونواقل SERT مع وضع مفتاح رمزي جانبي.\n   - وضع عنوان وظيفي دقيق: 'مخطط وظيفي مقارن يوضح آلية عمل المشبك السيروتونيني في الحالة الطبيعية وتحت تأثير دواء الفلوكسيتين المثبط لنواقل إعادة الامتصاص'.",
      reasoningSteps_ar: [
        "المقارنة المتوازية بين مسار إعادة الامتصاص السليم ومسار التثبيط الدوائي للناقل SERT.",
        "إبراز النتيجة بعد المشبكية: زوال التأثير السريع طبيعياً مقابل استمرار وتضخيم التنبيه مع الدواء.",
        "وضع العنوان ومفتاح الرموز الاصطلاحية.",
      ],
      biologicalModel_ar: {
        system_ar: "المشبك العصبي الدماغي تحت تأثير مثبطات استرداد السيروتونين الانتقائية (ISRS)",
        experimentalConditions_ar: "المقارنة بين الفيزيولوجيا الطبيعية والتدخل الدوائي العلاجي",
        governingBiologicalMechanisms_ar: ["إلغاء التنبيه المشبكي بإعادة الامتصاص", "التثبيط الدوائي التنافسي لنواقل النقل الغشائي"],
        evidenceExtracted_ar: "حجب نواقل SERT يؤدي لبقاء السيروتونين وتكرار تنبيه المستقبلات",
        deductionOrConclusion_ar: "المخطط المقارن يبرز بوضوح نقطة التدخل الجزيئي للدواء وأثرها الديناميكي",
      },
      errorMapping: {
        primaryErrorType: "misunderstood_concept",
        distractorRationale_ar: "رسم الدواء وهو يرتبط بالمستقبلات بعد المشبكية عوضاً عن ارتباطه بنواقل إعادة الامتصاص قبل المشبكية، وهو خطأ جوهري في تحديد الهدف الدوائي.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.5 ن للحالة الطبيعية وإعادة الامتصاص بناقل SERT، 1.5 ن لحالة الدواء وحجب الناقل وتراكم السيروتونين وتضخيم الإشارة، 1.0 ن للعنوان والمفتاح والتنظيم البصري.",
    },
    l5_bac_style: {
      id: "snv_schema_l5_01",
      capabilityId: "snv_functional_schema_synthesis_construction",
      level: "L5_BAC_STYLE",
      format: "functional_schema",
      estimatedTimeMin: 18,
      prompt_ar: "قدمت دراسة تجريبية حول التعاون المناعي إثر اختراق بكتيريا ممرضة للعضوية، حيث تتدخل الخلايا العارضة (CPA)، اللمفاويات المساعدة (LT4)، واللمفاويات البائية (LB) لإنتاج الأجسام المضادة النوعية.\nانطلاقاً من هذه المعطيات العلمية ومن معارفك، أنجز مخططاً وظيفياً تركيبيابينياً شاملاً يوضح مراحل الاستجابة المناعية الخلطية المكتسبة، مبرزاً بدقة التعاون الخلوي، الإشارات الكيميائية (الإنترلوكينات IL-1 و IL-2)، الانتقاء النسيلي، التكاثر والتمايز، وآلية التخلص النهائي من المستضد بتدخل المعقدات المناعية والبلعمة.",
      expectedResponse_ar: "بناء المخطط الوظيفي التركيبي الشامل للاستجابة الخلطية:\n1) بنية وتنظيم المخطط عبر 4 مراحل متعاقبة:\n   - المرحلة 1: مرحلة التعرف والانتقاء النسيلي والتعاون الخلوي:\n     * بلعمة البكتيريا ومعالجتها بواسطة البالعة الكبيرة / الخلية العارضة (CPA) وعرض محدداتها على CMH-II مع إفراز الإنترلوكين 1 (IL-1).\n     * تعرف اللمفاوية LT4 بنوعية بواسطة مستقبلها TCR+CD8/CD4 على معقد (CMH-II + ببتيد مستضدي)، مما ينشطها ويحفزها لتركيب مستقبلات IL-2.\n     * انتقاء نسيلة لمفاوية بائية نوعية (LB) بتعرف مستقبلها الغشائي BCR مباشرة على محدد مولد الضد السطحي، وتعبيرها عن مستقبلات IL-2.\n   - المرحلة 2: مرحلة التكاثر والتمايز (التضخيم):\n     * تفرز خلايا Th (المشتقة من LT4 المنشطة) جزيئات الإنترلوكين 2 (IL-2) التي تحفز ذاتياً تكاثر خلاياها، وتثبت على مستقبلات IL-2R للخلايا LB المنتقاة.\n     * تتكاثر خلايا LB بالانقسام الخيطي مشكلة لمة من الخلايا المتماثلة، يتمايز قسم منها إلى خلايا ذاكرة (LBm) ذات عمر طويل، ويتمايز القسم الأكبر إلى خلايا بلازمية (Plasmocytes) متطورة الشبكة الهيولية وجهاز غولجي مفرزة للأجسام المضادة.\n   - المرحلة 3: مرحلة التنفيذ والتحييد:\n     * إفراز ملايين الأجسام المضادة السارية النوعية في الأخلاط وسوائل الجسم.\n     * ارتباط الأجسام المضادة بواسطة موقعيها التثبيتيين (الباراتوبات) بمحددات مولد الضد (الإبيتوبات) مشكلة 'معقدات مناعية' تحيد سمية البكتيريا وتمنع تكاثرها وحركتها.\n   - المرحلة 4: مرحلة الإقصاء والتخلص بالبلعمة:\n     * تثبت المعقد المناعي عبر الجزء الثابت للجسم المضاد (منطقة Fc) على مستقبلات نوعية لغشاء البالعة الكبيرة.\n     * إحاطة المعقد بأرجل كاذبة وبلعمته وتشكل حويصل بلعمة يندمج مع الليزوزومات المحتوية على إنزيمات محللة لتفكيك مولد الضد بالكامل.\n2) المواصفات المنهجية الكاملة للمخطط:\n   - ترقيم المراحل بأسهم تسلسلية واضحة من اليسار لليمين أو من الأعلى للأسفل.\n   - وضع بيانات كاملة ومفتاح للرموز (BCR, TCR, CMH-II, IL-1, IL-2, Plasmocyte, إلخ).\n   - العنوان الوظيفي التركيبي: 'مخطط وظيفي تركيبي يوضح مراحل الاستجابة المناعية ذات الوساطة الخلطية وآليات التعاون الخلوي والتحييد والإقصاء'.",
      reasoningSteps_ar: [
        "تقسيم المخطط إلى مراحله الأربع الكبرى: انتقاء وتعاون، تضخيم وتمايز، تحييد، وإقصاء.",
        "تمثيل دقيق ومحكم لجزيئات الإشارة والتواصل (IL-1 من CPA، و IL-2 من Th).",
        "تمثيل المعقد المناعي ودور الجزء الثابت في تنشيط البلعمة.",
        "وضع الإخراج المنهجي الكامل من بيانات وعنوان ومفتاح.",
      ],
      biologicalModel_ar: {
        system_ar: "الجهاز المناعي التكيفي الخلطي والتعاون الخلوي المنسق",
        experimentalConditions_ar: "دخول مولد ضد خارجي بكتيري وإثارة الاستجابة النوعية",
        governingBiologicalMechanisms_ar: ["الانتقاء النسيلي المزدوج", "التأشير السيتوكيني بالإنترلوكينات", "التمايز البلازمي", "التحييد والبلعمة"],
        evidenceExtracted_ar: "المسار التكاملي المنظم من رصد المستضد حتى تفكيكه الكامل",
        deductionOrConclusion_ar: "المخطط التركيبي يجمع الآليات الخلوية والجزيئية في منظومة دفاعية واحدة متناسقة",
      },
      errorMapping: {
        primaryErrorType: "methodology_error",
        distractorRationale_ar: "اختزال تنشيط LB في مجرد عبارة سهمية دون تمثيل إشارات IL-2 أو الخلية العارضة CPA، أو إغفال مرحلة البلعمة وتثبت الجزء الثابت Fc.",
      },
      scoringRubric_ar: "BAC_MASTERY_INTERNAL_RUBRIC: 1.0 ن لمرحلة التعرف والانتقاء النسيلي وعرض CPA، 1.0 ن للتأشير بالإنترلوكينات والتكاثر والتمايز لـ Plasmocyte و LBm، 1.0 ن لتشكل المعقد المناعي، 1.0 ن للبلعمة وتفكيك المستضد، 1.0 ن للإخراج المنهجي والبيانات والعنوان الشامل.",
    },
  },
  repairProtocol: {
    diagnosis_ar: "رسم أشكال تشريحية ثابتة دون أسهم وظيفية معبرة، أو إغفال الأسهم التي تبين التحول السببي، أو كتابة عنوان شكلي غير وظيفي، أو عكس الترتيب الزمني للأحداث الحيوية.",
    wrongMentalModel_ar: "المطلوب في المخطط الوظيفي هو رسم جميل منمق كلوحة فنية، ولا يهم ترتيب الأسهم والبيانات.",
    correctMentalModel_ar: "المخطط الوظيفي خريطة مسار قطار: كل محطة يجب أن تسلم للمحطة التي تليها عبر سهم واضح؛ إذا انقطع سهم تاه القطار، والعنوان هو اسم الرحلة من نقطة الانطلاق إلى نقطة الوصول.",
    threeStepActionProtocol_ar: [
      "1. حدد الكيانات والبيئات: من هي العناصر الفاعلة وأين تقع (نواة، غشاء، شق مشبكي)؟",
      "2. ارسم أسهم التسلسل السببي: انطلق من المنبه، واربط كل خطوة بالتي تليها بأسهم موجهة وواضحة (تحول، إفراز، تنشيط).",
      "3. أطر المخطط منهجياً: ضع البيانات على خطوط أفقية منظمة، وضع مفتاحاً للرموز، واكتب عنواناً وظيفياً يبدأ بـ 'مخطط وظيفي يوضح...'.",
    ],
    microDrill_ar: {
      prompt_ar: "في مخطط لآلية عمل إنزيم، رسم طالب سهماً من النواتج إلى الموقع الفعال، وسهماً آخر من الإنزيم إلى مادة التفاعل دون تحديد المعقد. صحح هذا الخلل السببي.",
      solution_ar: "التصحيح: السهم ينطلق من مادة التفاعل والإنزيم نحو تشكل المعقد (إنزيم-مادة تفاعل E-S)، ومن المعقد ينطلق سهم التفكك والتحفيز معطياً إنزيماً سليماً ونواتج (E + P)، فالأسهم تتبع مسار التحول الكيميائي الحتمي من المتفاعلات إلى النواتج.",
    },
  },
  isomorphicRetest: {
    retestId: "snv_schema_retest_01",
    invariantTested_ar: "القدرة على ترجمة نص علمي وتجريبي معقد إلى نموذج ومخطط وظيفي تركيبي يحترم الكيانات والتسلسل السببي.",
    changedSurface_ar: "تطبيق على تنظيم التحلل السكري ودورة كريبس عبر التغذية الراجعة السلبية لتراكم جزيئات الـ ATP على إنزيم فسفوفروكتوكيناز (PFK).",
    prompt_ar: "عندما تفيض طاقة الخلية ويرتفع تركيز جزيئات الـ ATP إلى مستويات قياسية، يرتبط الـ ATP بموقع تنظيمي فراغي لإنزيم 'فسفوفروكتوكيناز' (PFK) في التحلل السكري بالهيولى الأساسية، مما يغير شكله ويثبط نشاطه كابحاً تفكيك الجلوكوز؛ وعندما ينخفض الـ ATP ويرتفع الـ AMP، يتحرر الإنزيم وينشط مجدداً.\nصمم مخططاً وظيفياً تفسيرياً موجزاً يوضح آلية هذا التنظيم التلقائي للاستقلاب الطاقوي عبر التغذية الراجعة، مبرزاً الكيانات، مسار التفاعل، وإشارات التثبيط والتنشيط مع عنوان ملائم.",
    solution_ar: "عناصر وتصميم المخطط التفسيري:\n1) مسار التفاعل الأساسي:\n   - الجلوكوز (C6) -> [إنزيم PFK] -> فركتوز ثنائي الفوسفات -> تحلل سكري -> حمض بيروفيك -> ميتوكوندري -> إنتاج جزيئات ATP وفيرة.\n2) مسارات التنظيم الرجعي (الأسهم الموجهة):\n   - سهم تغذية راجعة سلبية (-): ينطلق من وفرة تراكم ATP الميتوكوندري نحو الموقع التنظيمي لإنزيم PFK -> تثبيط نشاط الإنزيم -> إبطاء وتوقف التحلل السكري (توفير مدخرات الجلوكوز ومنع التبذير الطاقوي).\n   - سهم تغذية راجعة إيجابية (+): عند بذل مجهود واستهلاك ATP وتراكم جزيئات AMP والـ ADP -> ينطلق سهم تنشيط نحو إنزيم PFK لفك التثبيط واستعادة سرعة أكسدة الجلوكوز.\n3) العنوان الوظيفي للمخطط:\n   'مخطط وظيفي تفسيري يوضح آلية التنظيم الذاتي للتحلل السكري عبر المراقبة الرجعية السلبية لإنزيم PFK بتركيز الـ ATP'.",
    passCondition_ar: "تمثيل مسار التفاعل الإنزيمي بأسهم صحيحة وتمثيل سهمي التثبيط الرجعي (-) بـ ATP والتنشيط (+) بـ AMP وعنوان وظيفي متكامل.",
  },
  bacProductionTask: {
    title_ar: "مهمة بكالوريا: نمذجة المراقبة الهرمونية لنسبة السكر في الدم بتدخل الأنسولين والغلوكاغون",
    allocatedScore: "5.00 نقاط",
    timeMinutes: 25,
    prompt_ar: "يعتبر ثبات نسبة السكر في الدم (التحلون) عند القيمة الفيزيولوجية المرجعية (حوالي 1 g/L) نتيجة توازن ديناميكي دقيق بين نظامين هرمونيين متعاكسين تفرزهما جزر لانغرهانس في البنكرياس:\n- في حالة الإفراط السكري (بعد وجبة غنية بالسكريات): تتحسس خلايا بيتا (β) المركزية وتفرز هرمون الأنسولين الخافض للتحلون، والذي يحفز الخلايا الكبدية والعضلية والدهنية على تخزين الجلوكوز على شكل غليكوجين وثلاثي الغليسيريد.\n- في حالة القصور السكري (أثناء الصيام أو الجهد العضلي): تتحسس خلايا ألفا (α) المحيطية وتفرز هرمون الغلوكاغون المفرط للتحلون، والذي يحفز الخلايا الكبدية حصراً على إماهة الغليكوجين وتحرير الجلوكوز في الدم.\nانطلاقاً من هذا النص العلمي ومن معارفك، أنجز مخططاً وظيفياً تركيبياً متكاملاً يجسد جهاز التنظيم الذاتي للتحلون بنظاميه الخافض والمفرط، مبرزاً اللواقط، الرسائل الهرمونية، الأعضاء المنفذة، ونوع المراقبة الرجعية.",
    modelSolution_ar: [
      "1) هندسة المخطط الوظيفي التركيبي لجهاز التنظيم الذاتي للتحلون:\n- المحور المركزي للمخطط: القيمة المرجعية للتحلون (1 g/L في الدم) تمثل نقطة التوازن.\n- حلقة معالجة الإفراط السكري (النظام الخافض للتحلون):\n  * الاضطراب: ارتفاع نسبة السكر في الدم (> 1 g/L إثر وجبة).\n  * اللاقط والمفرز: خلايا بيتا (β) في جزر لانغرهانس تتحسس مباشرة وتفرز هرمون الأنسولين في الدم.\n  * الرسالة الهرمونية: الأنسولين (رسالة كيميائية مشفرة بتركيز الهرمون في البلازما).\n  * الأعضاء المنفذة: الكبد، العضلات (اصطناع الغليكوجين Glycogénogenèse)، والأنسجة الدهنية (اصطناع الليبيدات Lipogenèse)، مع تحفيز دخول الجلوكوز للخلايا.\n  * النتيجة: انخفاض نسبة السكر وعودتها إلى 1 g/L.\n  * المراقبة الرجعية: عودة التحلون إلى 1 g/L تكبح إفراز خلايا بيتا للأنسولين (تغذية راجعة سالبة).\n- حلقة معالجة القصور السكري (النظام المفرط للتحلون):\n  * الاضطراب: انخفاض نسبة السكر في الدم (< 1 g/L أثناء صيام).\n  * اللاقط والمفرز: خلايا ألفا (α) في جزر لانغرهانس تتحسس مباشرة وتفرز هرمون الغلوكاغون.\n  * الرسالة الهرمونية: الغلوكاغون (رسالة كيميائية مشفرة بالتركيز).\n  * العضو المنفذ: الكبد حصراً (تحفيز إماهة الغليكوجين Glycogénolyse وتصنيع الجلوكوز Néoglucogenèse) وطرحه في الدم.\n  * النتيجة: رفع نسبة السكر وعودتها إلى 1 g/L.\n  * المراقبة الرجعية: عودة التحلون إلى 1 g/L تكبح إفراز خلايا ألفا للغلوكاغون (تغذية راجعة سالبة).\n2) المعايير المنهجية والشكلية للمخطط:\n- رسم حلقتي التنظيم بشكل متقابل أو دائري متناسق تتوسطهما القيمة المرجعية للتحلون.\n- وضع بيانات كاملة ومفتاح للرموز والأسهم.\n- العنوان الوظيفي الشامل: 'مخطط وظيفي تركيبي يمثل جهاز التنظيم الذاتي لنسبة السكر في الدم (التحلون) بمفعول الأنسولين والغلوكاغون عبر المراقبة الرجعية السالبة'.",
    ],
    markingScheme_ar: [
      { criterion: "تمثيل حلقة الإفراط السكري (خلايا بيتا، الأنسولين، الأعضاء المنفذة، وخفض التحلون)", points: 2.0 },
      { criterion: "تمثيل حلقة القصور السكري (خلايا ألفا، الغلوكاغون، الكبد حصراً، ورفع التحلون)", points: 1.5 },
      { criterion: "إبراز المراقبة الرجعية السالبة والقيمة المرجعية والعنوان الوظيفي والبيانات", points: 1.5 },
    ],
  },
  sourceAndEvidence: {
    evidenceLevel: "B",
    sourceDetails: "المنهاج الرسمي - التوجيهات الرسمية لمفتشية مادة علوم الطبيعة والحياة لمرحلة التعليم الثانوي",
    historicalBacRef: "BAC 2014 Sciences Expérimentales Sujet 2 Exercice 1",
    progressionStatus: "VERIFIED_ANNUAL_PROGRESSION",
  },
};



// ============================================================================
// COMPLETE 17-CAPABILITY CANONICAL SNV EXPORT INDEX & MAP
// ============================================================================

export const SNV_IMMUNE_COOPERATION_PACKAGE = SNV_IMMUNE_COOPERATION_HIV_PACKAGE;

export const ALL_SNV_PACKAGES: CanonicalSNVCapabilityPackage[] = [
  SNV_PROTEIN_SYNTHESIS_PACKAGE,
  SNV_GENETIC_CODE_TRANSLATION_PACKAGE,
  SNV_PROTEIN_STRUCTURE_PACKAGE,
  SNV_ENZYME_KINETICS_PACKAGE,
  SNV_SELF_NONSELF_PACKAGE,
  SNV_HUMORAL_IMMUNITY_PACKAGE,
  SNV_CELLULAR_IMMUNITY_PACKAGE,
  SNV_IMMUNE_COOPERATION_HIV_PACKAGE,
  SNV_RESTING_POTENTIAL_PACKAGE,
  SNV_ACTION_POTENTIAL_PACKAGE,
  SNV_SYNAPTIC_TRANSMISSION_PACKAGE,
  SNV_PHOTOCHEM_PHASE_PACKAGE,
  SNV_CALVIN_CYCLE_PACKAGE,
  SNV_CELLULAR_RESPIRATION_PACKAGE,
  SNV_DOC_ANALYSIS_PACKAGE,
  SNV_SCIENTIFIC_REASONING_PACKAGE,
  SNV_FUNCTIONAL_SCHEMA_PACKAGE,
];

export const SNV_CAPABILITY_PACKAGES_MAP: Record<string, CanonicalSNVCapabilityPackage> = {
  snv_protein_synthesis_transcription_maturation: SNV_PROTEIN_SYNTHESIS_PACKAGE,
  snv_genetic_code_translation_activation: SNV_GENETIC_CODE_TRANSLATION_PACKAGE,
  snv_protein_structure_amphoteric_ionization: SNV_PROTEIN_STRUCTURE_PACKAGE,
  snv_enzyme_kinetics_active_site_regulation: SNV_ENZYME_KINETICS_PACKAGE,
  snv_self_nonself_hla_recognition: SNV_SELF_NONSELF_PACKAGE,
  snv_humoral_immunity_antibody_complex: SNV_HUMORAL_IMMUNITY_PACKAGE,
  snv_cellular_immunity_ltc_cytotoxicity: SNV_CELLULAR_IMMUNITY_PACKAGE,
  snv_immune_cooperation_interleukin_hiv: SNV_IMMUNE_COOPERATION_HIV_PACKAGE,
  snv_resting_potential_ionic_mechanisms: SNV_RESTING_POTENTIAL_PACKAGE,
  snv_action_potential_voltage_gated_channels: SNV_ACTION_POTENTIAL_PACKAGE,
  snv_synaptic_transmission_summation_integration: SNV_SYNAPTIC_TRANSMISSION_PACKAGE,
  snv_photosynthesis_photochemical_phase: SNV_PHOTOCHEM_PHASE_PACKAGE,
  snv_photosynthesis_calvin_cycle_synthesis: SNV_CALVIN_CYCLE_PACKAGE,
  snv_cellular_respiration_glycolysis_krebs: SNV_CELLULAR_RESPIRATION_PACKAGE,
  snv_document_analysis_information_extraction: SNV_DOC_ANALYSIS_PACKAGE,
  snv_scientific_reasoning_hypothesis_validation: SNV_SCIENTIFIC_REASONING_PACKAGE,
  snv_functional_schema_synthesis_construction: SNV_FUNCTIONAL_SCHEMA_PACKAGE,
};
