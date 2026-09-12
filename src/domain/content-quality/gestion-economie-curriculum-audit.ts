/**
 * BAC Mastery — Gestion & Économie Full Stream Curriculum Audit
 * Prompt 26: Authoritative curriculum baseline, cross-subject transfer matrix, and depth taxonomy.
 * 
 * Statutory Provenance:
 * - Executive Decree No. 07-142 of May 19, 2007 (المرسوم التنفيذي رقم 07-142) -> OFFICIAL_HISTORICAL.
 * - Ministerial Decision No. 36 (September 2026) cancelling Decision No. 20 -> CURRENT_OFFICIAL_MICRO_EVIDENCE_INSUFFICIENT.
 * - Authentic ONEC BAC Exam Archives (2015-2024) -> AUTHENTIC_BAC_ONEC.
 */

import { StreamId, SubjectId } from "@/types/education";

export type SubjectRole = "CORE_ENGINE" | "SUPPORTING" | "LANGUAGE" | "HUMANITIES" | "ORIENTATION";

export type LearningMode = "procedural" | "conceptual" | "case_based" | "document_based" | "writing";

export interface StreamSubjectAuditItem {
  subjectId: SubjectId;
  name_ar: string;
  name_fr: string;
  role: SubjectRole;
  learningMode: LearningMode;
  baselineCoefficient: number;
  coefficientStatus: "OFFICIAL_HISTORICAL";
  statutoryReference: string;
  pilotSkillCount: number;
  diagnosticDepth: "deep_calibrated" | "methodological_checkpoint" | "survey";
  pedagogicalContractDepth: "full_13_element" | "methodology_profile";
  errorTaxonomyDepth: "canonical_sub_types" | "methodology_errors";
  retestDepth: "isomorphic_twins" | "transfer_prompts";
}

export interface CrossSubjectTransferLink {
  id: string;
  sourceSubject: SubjectId;
  targetSubject: SubjectId;
  sourceSkillId: string;
  targetSkillId: string;
  conceptLink_ar: string;
  conceptLink_fr: string;
  pedagogicalRationale_ar: string;
  pedagogicalRationale_fr: string;
  bacTransferExample_ar: string;
  bacTransferExample_fr: string;
  evidenceClass: "OFFICIAL_HISTORICAL" | "AUTHENTIC_BAC_ONEC" | "BAC_MASTERY_DERIVED";
}

/**
 * 1. Official Stream Subject Registry Audit (Gestion & Économie)
 * Exactly 10 Subjects established under Executive Decree 07-142
 */
export const GESTION_ECO_SUBJECT_AUDIT: StreamSubjectAuditItem[] = [
  {
    subjectId: "accounting_finance",
    name_ar: "التسيير المحاسبي والمالي",
    name_fr: "Gestion Comptable et Financière",
    role: "CORE_ENGINE",
    learningMode: "procedural",
    baselineCoefficient: 6,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 8,
    diagnosticDepth: "deep_calibrated",
    pedagogicalContractDepth: "full_13_element",
    errorTaxonomyDepth: "canonical_sub_types",
    retestDepth: "isomorphic_twins",
  },
  {
    subjectId: "economics_management",
    name_ar: "الاقتصاد والمناجمنت",
    name_fr: "Économie et Management",
    role: "CORE_ENGINE",
    learningMode: "conceptual",
    baselineCoefficient: 5,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 8,
    diagnosticDepth: "deep_calibrated",
    pedagogicalContractDepth: "full_13_element",
    errorTaxonomyDepth: "canonical_sub_types",
    retestDepth: "isomorphic_twins",
  },
  {
    subjectId: "math",
    name_ar: "الرياضيات",
    name_fr: "Mathématiques",
    role: "CORE_ENGINE",
    learningMode: "procedural",
    baselineCoefficient: 5,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 10, // 4 new economic-applied + 6 foundation math
    diagnosticDepth: "deep_calibrated",
    pedagogicalContractDepth: "full_13_element",
    errorTaxonomyDepth: "canonical_sub_types",
    retestDepth: "isomorphic_twins",
  },
  {
    subjectId: "history_geography",
    name_ar: "التاريخ والجغرافيا",
    name_fr: "Histoire et Géographie",
    role: "CORE_ENGINE",
    learningMode: "document_based",
    baselineCoefficient: 4,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 2,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "full_13_element",
    errorTaxonomyDepth: "canonical_sub_types",
    retestDepth: "isomorphic_twins",
  },
  {
    subjectId: "arabic",
    name_ar: "اللغة العربية وآدابها",
    name_fr: "Langue et Littérature Arabes",
    role: "SUPPORTING",
    learningMode: "writing",
    baselineCoefficient: 3,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 1,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
  {
    subjectId: "law",
    name_ar: "القانون",
    name_fr: "Droit",
    role: "CORE_ENGINE",
    learningMode: "case_based",
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 6,
    diagnosticDepth: "deep_calibrated",
    pedagogicalContractDepth: "full_13_element",
    errorTaxonomyDepth: "canonical_sub_types",
    retestDepth: "isomorphic_twins",
  },
  {
    subjectId: "philosophy",
    name_ar: "الفلسفة",
    name_fr: "Philosophie",
    role: "HUMANITIES",
    learningMode: "writing",
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 1,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
  {
    subjectId: "french",
    name_ar: "اللغة الفرنسية",
    name_fr: "Français",
    role: "LANGUAGE",
    learningMode: "writing",
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 1,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
  {
    subjectId: "english",
    name_ar: "اللغة الإنجليزية",
    name_fr: "Anglais",
    role: "LANGUAGE",
    learningMode: "writing",
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 1,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
  {
    subjectId: "islamic_studies",
    name_ar: "العلوم الإسلامية",
    name_fr: "Sciences Islamiques",
    role: "HUMANITIES",
    learningMode: "case_based",
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 1,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
];

/**
 * 2. Cross-Subject Transfer Matrix (6 Legitimate Interdisciplinary Bridges)
 */
export const GESTION_ECO_TRANSFER_LINKS: CrossSubjectTransferLink[] = [
  {
    id: "transfer-math-acc-annuities",
    sourceSubject: "math",
    targetSubject: "accounting_finance",
    sourceSkillId: "math_ge_geometric_annuities",
    targetSkillId: "acc_borrowing_amortization_table",
    conceptLink_ar: "المتتاليات الهندسية وقوانين الفائدة المركبة لحساب دفعات القروض وجداول استهلاكها",
    conceptLink_fr: "Suites géométriques et mathématiques financières pour le calcul des annuités d'emprunt",
    pedagogicalRationale_ar: "قانون الدفعة الثابتة a = V0 * [i / (1 - (1+i)^-n)] مشتق مباشرة من مجموع حدود متتالية هندسية أساسها (1+i). إتقان هذا المفهوم في الرياضيات يزيل عائق الحفظ الأعمى في المحاسبة.",
    pedagogicalRationale_fr: "La formule de l'annuité constante dérive directement de la somme des termes d'une suite géométrique de raison (1+i).",
    bacTransferExample_ar: "بكالوريا 2022 تسيير واقتصاد (الموضوع الأول - المسألة الأولى): حساب معدل الفائدة والدفعة السنوية وجدول استهلاك القرض العادي.",
    bacTransferExample_fr: "BAC 2022 Gestion & Économie (Sujet 1) : Détermination du taux d'intérêt, de l'annuité et du tableau d'amortissement.",
    evidenceClass: "AUTHENTIC_BAC_ONEC",
  },
  {
    id: "transfer-math-acc-linear-regression",
    sourceSubject: "math",
    targetSubject: "accounting_finance",
    sourceSkillId: "math_ge_linear_regression_least_squares",
    targetSkillId: "acc_break_even_cost_analysis",
    conceptLink_ar: "التعديل الخطي بطريقة المربعات الصغرى لتقدير التكاليف الثابتة والمتغيرة وحساب عتبة المردودية",
    conceptLink_fr: "Ajustement linéaire par la méthode des moindres carrés pour la séparation des coûts fixes et variables",
    pedagogicalRationale_ar: "معادلة مستقيم الانحدار y = ax + b تسمح بعزل التكلفة المتغيرة للوحدة (الميل a) والتكاليف الثابتة الإجمالية (الحد الثابت b)، وهو المدخل المباشر لمحاسبة التسيير وحساب عتبة المردودية.",
    pedagogicalRationale_fr: "La droite de régression y = ax + b isole le coût variable unitaire (pente a) et les coûts fixes (ordonnée à l'origine b).",
    bacTransferExample_ar: "بكالوريا 2021 تسيير واقتصاد (الموضوع الثاني): تعديل أرقام الأعمال وحساب التكاليف المتوقعة ونقطة الصفر.",
    bacTransferExample_fr: "BAC 2021 Gestion & Économie (Sujet 2) : Ajustement du chiffre d'affaires et calcul du seuil de rentabilité.",
    evidenceClass: "AUTHENTIC_BAC_ONEC",
  },
  {
    id: "transfer-eco-acc-inventory-inflation",
    sourceSubject: "economics_management",
    targetSubject: "accounting_finance",
    sourceSkillId: "eco_inflation_purchasing_power",
    targetSkillId: "acc_inventory_regularization_depreciation",
    conceptLink_ar: "أثر التضخم وتقلبات الأسعار السوقية على تقييم المخزونات واختبار خسائر القيمة وفق النظام المحاسبي المالي SCF",
    conceptLink_fr: "Impact de l'inflation et des variations de cours sur l'évaluation des stocks et tests de dépréciation (SCF)",
    pedagogicalRationale_ar: "فهم آليات التضخم وارتفاع الأسعار في الاقتصاد يفسر للتلميذ سبب وجوب مقارنة تكلفة الشراء بالقيمة السوقية الصافية القابلة للتحقق وتكوين مؤونات خسائر القيمة (حساب 39).",
    pedagogicalRationale_fr: "La compréhension de l'inflation éclaire la règle prudentielle de comparaison coût d'achat vs valeur nette de réalisation.",
    bacTransferExample_ar: "بكالوريا 2023 تسيير واقتصاد (الموضوع الأول): تسوية مخزونات التموينات والمواد الأولية مع خسارة القيمة.",
    bacTransferExample_fr: "BAC 2023 Gestion & Économie (Sujet 1) : Régularisation des stocks et dépréciation selon les cours actuels.",
    evidenceClass: "AUTHENTIC_BAC_ONEC",
  },
  {
    id: "transfer-law-mgmt-contract-termination",
    sourceSubject: "law",
    targetSubject: "economics_management",
    sourceSkillId: "law_individual_employment_contract",
    targetSkillId: "eco_management_human_resources_conflict",
    conceptLink_ar: "التكييف القانوني للتسريح التأديبي وإنهاء علاقة العمل وتوظيفه في إدارة الموارد البشرية وحل النزاعات",
    conceptLink_fr: "Qualification juridique de la rupture du contrat de travail et gestion stratégique des conflits RH",
    pedagogicalRationale_ar: "المادة 73 من قانون العمل 90-11 تحدد الأخطاء الجسيمة؛ واستيعابها في مادة القانون يمنح التلميذ القدرة على اتخاذ قرار إداري قانوني سليم في وضعية مناجمنت لتفادي التسريح التعسفي.",
    pedagogicalRationale_fr: "L'article 73 de la loi 90-11 fonde la décision managériale de rupture et prévient le licenciement abusif.",
    bacTransferExample_ar: "بكالوريا 2020 تسيير واقتصاد (موضوع القانون والمناجمنت): دراسة حالة نزاع عمالي فردي وتحديد مدى قانونية قرار الفصل.",
    bacTransferExample_fr: "BAC 2020 (Droit & Management) : Étude de cas sur le licenciement d'un cadre et qualification juridique du litige.",
    evidenceClass: "AUTHENTIC_BAC_ONEC",
  },
  {
    id: "transfer-hg-eco-bretton-woods-trade",
    sourceSubject: "history_geography",
    targetSubject: "economics_management",
    sourceSkillId: "hg_ge_world_economy_poles",
    targetSkillId: "eco_international_trade_balance_payments",
    conceptLink_ar: "تطور النظام النقدي الدولي وهيمنة الدولار الأمريكي وتأثيره على ميزان المدفوعات والتجارة الخارجية للجزائر",
    conceptLink_fr: "Évolution du système monétaire international, hégémonie du dollar et balance des paiements algérienne",
    pedagogicalRationale_ar: "دراسة اتفاقيات بريتون وودز والقطبية الاقتصادية في التاريخ والجغرافيا تمكن التلميذ من استيعاب تسعير النفط بالدولار وتذبذب أسعار الصرف وأثرها المباشر على الميزان التجاري الجزائري.",
    pedagogicalRationale_fr: "L'étude historique des accords de Bretton Woods éclaire le rôle du dollar dans la balance commerciale nationale.",
    bacTransferExample_ar: "بكالوريا 2019 تسيير واقتصاد: تفسير أسباب عجز الميزان التجاري الجزائري بالاستناد لتذبذب أسعار المحروقات والدولار.",
    bacTransferExample_fr: "BAC 2019 : Analyse du déficit de la balance commerciale liée aux fluctuations monétaires internationales.",
    evidenceClass: "AUTHENTIC_BAC_ONEC",
  },
  {
    id: "transfer-fr-mgmt-document-analysis",
    sourceSubject: "french",
    targetSubject: "economics_management",
    sourceSkillId: "fr_ge_compte_rendu_economique",
    targetSkillId: "eco_strategic_planning_swot_diagnostic",
    conceptLink_ar: "تقنيات التلخيص واستخراج الحجج والأرقام من وثيقة اقتصادية باللغة الفرنسية لبناء التشخيص الاستراتيجي SWOT",
    conceptLink_fr: "Techniques du compte rendu objectif appliquées à l'extraction d'opportunités et menaces dans une synthèse stratégique",
    pedagogicalRationale_ar: "القدرة على استخراج المعلومة الموضوعية والتمييز بين المعطيات الداخلية والخارجية في نصوص الإدارة باللغة الفرنسية تدعم إنجاز مصفوفة سوات (SWOT) بنجاح.",
    pedagogicalRationale_fr: "L'extraction méthodique d'arguments dans un texte informatif/argumentatif sert directement au diagnostic stratégique SWOT.",
    bacTransferExample_ar: "بكالوريا 2021 مادة الفرنسية للشعب العلمية والتسيير: نص حول التحول الرقمي للمؤسسات واستخراج مؤشرات التنافسية.",
    bacTransferExample_fr: "BAC 2021 Français : Texte sur la digitalisation des entreprises et extraction des axes de performance.",
    evidenceClass: "AUTHENTIC_BAC_ONEC",
  },
];

export function getGestionEconomieCurriculumAuditSummary() {
  const totalCoeff = GESTION_ECO_SUBJECT_AUDIT.reduce((acc, s) => acc + s.baselineCoefficient, 0);
  const coreSubjects = GESTION_ECO_SUBJECT_AUDIT.filter((s) => s.role === "CORE_ENGINE");
  const coreCoeff = coreSubjects.reduce((acc, s) => acc + s.baselineCoefficient, 0);
  const totalSkills = GESTION_ECO_SUBJECT_AUDIT.reduce((acc, s) => acc + s.pilotSkillCount, 0);

  return {
    streamId: "gestion_eco",
    streamName_ar: "تسيير واقتصاد",
    streamName_fr: "Gestion & Économie",
    officialStatus: "OFFICIAL_HISTORICAL",
    legalReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    subjectCount: GESTION_ECO_SUBJECT_AUDIT.length,
    totalBaselineCoefficient: totalCoeff,
    coreSubjectCount: coreSubjects.length,
    coreCoefficientSum: coreCoeff,
    coreCoefficientWeightPercentage: ((coreCoeff / totalCoeff) * 100).toFixed(1) + "%",
    totalPilotSkills: totalSkills,
    interdisciplinaryTransferLinksCount: GESTION_ECO_TRANSFER_LINKS.length,
    learningModesDistribution: {
      procedural: GESTION_ECO_SUBJECT_AUDIT.filter((s) => s.learningMode === "procedural").length,
      conceptual: GESTION_ECO_SUBJECT_AUDIT.filter((s) => s.learningMode === "conceptual").length,
      case_based: GESTION_ECO_SUBJECT_AUDIT.filter((s) => s.learningMode === "case_based").length,
      document_based: GESTION_ECO_SUBJECT_AUDIT.filter((s) => s.learningMode === "document_based").length,
      writing: GESTION_ECO_SUBJECT_AUDIT.filter((s) => s.learningMode === "writing").length,
    },
  };
}
