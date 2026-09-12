/**
 * BAC Mastery — Sciences Expérimentales Full Stream Curriculum Audit
 * Prompt 25: Authoritative curriculum baseline, cross-subject transfer matrix, and depth taxonomy.
 * 
 * Statutory Provenance:
 * - Executive Decree No. 07-142 of May 19, 2007 (المرسوم التنفيذي رقم 07-142) -> OFFICIAL_HISTORICAL.
 * - Ministerial Decision No. 36 (September 2026) cancelling Decision No. 20 -> CURRENT_OFFICIAL_MICRO_EVIDENCE_INSUFFICIENT.
 * - Authentic ONEC BAC Exam Archives (2015-2024) -> AUTHENTIC_BAC_ONEC.
 */

import { StreamId, SubjectId } from "@/types/education";

export type SubjectRole = "CORE_ENGINE" | "SUPPORTING" | "LANGUAGE" | "HUMANITIES" | "ORIENTATION";

export interface StreamSubjectAuditItem {
  subjectId: SubjectId;
  name_ar: string;
  name_fr: string;
  role: SubjectRole;
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
}

/**
 * 1. Official Stream Subject Registry Audit (Sciences Expérimentales)
 */
export const SCIENCES_EXP_SUBJECT_AUDIT: StreamSubjectAuditItem[] = [
  {
    subjectId: "natural_sciences",
    name_ar: "علوم الطبيعة والحياة",
    name_fr: "Sciences de la Nature et de la Vie",
    role: "CORE_ENGINE",
    baselineCoefficient: 6,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 10,
    diagnosticDepth: "deep_calibrated",
    pedagogicalContractDepth: "full_13_element",
    errorTaxonomyDepth: "canonical_sub_types",
    retestDepth: "isomorphic_twins",
  },
  {
    subjectId: "physics",
    name_ar: "العلوم الفيزيائية",
    name_fr: "Sciences Physiques",
    role: "CORE_ENGINE",
    baselineCoefficient: 5,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 11,
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
    baselineCoefficient: 5,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 10,
    diagnosticDepth: "deep_calibrated",
    pedagogicalContractDepth: "full_13_element",
    errorTaxonomyDepth: "canonical_sub_types",
    retestDepth: "isomorphic_twins",
  },
  {
    subjectId: "arabic",
    name_ar: "اللغة العربية وآدابها",
    name_fr: "Langue et Littérature Arabes",
    role: "SUPPORTING",
    baselineCoefficient: 3,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 4,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
  {
    subjectId: "philosophy",
    name_ar: "الفلسفة",
    name_fr: "Philosophie",
    role: "HUMANITIES",
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 4,
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
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 4,
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
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 4,
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
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 4,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
  {
    subjectId: "history_geography",
    name_ar: "التاريخ والجغرافيا",
    name_fr: "Histoire-Géographie",
    role: "HUMANITIES",
    baselineCoefficient: 2,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    statutoryReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    pilotSkillCount: 4,
    diagnosticDepth: "methodological_checkpoint",
    pedagogicalContractDepth: "methodology_profile",
    errorTaxonomyDepth: "methodology_errors",
    retestDepth: "transfer_prompts",
  },
];

/**
 * 2. Authentic Cross-Subject Transfer Matrix (Sciences Expérimentales)
 */
export const SCIENCES_EXP_TRANSFER_LINKS: CrossSubjectTransferLink[] = [
  {
    id: "link_math_physics_diff_eq_rc",
    sourceSubject: "math",
    targetSubject: "physics",
    sourceSkillId: "math_derivatives_chain_rule",
    targetSkillId: "physics_rc_differential_equation",
    conceptLink_ar: "اشتقاق الدوال الأسية المركبة وحل المعادلات التفاضلية من الرتبة الأولى",
    conceptLink_fr: "Dérivation des fonctions composées et équations différentielles d'ordre 1",
    pedagogicalRationale_ar: "حل المعادلة التفاضلية لشحن المكثفة du_C/dt + u_C/tau = E/tau يعتمد مباشرة على اشتقاق دالة الأسية u_C(t) = E(1 - e^(-t/tau)). التلميذ الذي يخطئ في اشتقاق الدالة الداخلية في الرياضيات سيعجز عن التحقق من حل المعادلة في الفيزياء.",
    pedagogicalRationale_fr: "La vérification de la solution u_C(t) = E(1 - e^(-t/tau)) repose rigoureusement sur la dérivation de la composée exponentielle.",
    bacTransferExample_ar: "بكالوريا 2021 علوم تجريبية (الموضوع الأول، التمرين الثاني): إثبات أن u_C(t) حل للمعادلة التفاضلية.",
    bacTransferExample_fr: "BAC 2021 Sciences Exp : vérification analytique de la solution exponentielle du dipôle RC.",
  },
  {
    id: "link_math_physics_decay_log",
    sourceSubject: "math",
    targetSubject: "physics",
    sourceSkillId: "math_logarithm_domain_limits",
    targetSkillId: "physics_nuclear_decay_law",
    conceptLink_ar: "خواص الدالة اللوغاريتمية واستخراج زمن نصف العمر وزمن التفكك",
    conceptLink_fr: "Propriétés du logarithme népérien et temps de demi-vie t1/2",
    pedagogicalRationale_ar: "العلاقة ln(N0/N) = lambda*t أو استخراج t1/2 = ln(2)/lambda تتطلب إتقان خواص ln الجبرية لتجنب خلط الإشارات في المنحنيات الخطية ln(A) = f(t).",
    pedagogicalRationale_fr: "L'exploitation des droites d'activité ln(A) = -lambda*t + ln(A0) exige une maîtrise parfaite des propriétés de ln.",
    bacTransferExample_ar: "بكالوريا 2022 علوم تجريبية (الموضوع الثاني): تحديد ثابت النشاطية الإشعاعية بيانيا من ميل مستقيم ln(A).",
    bacTransferExample_fr: "BAC 2022 Sciences Exp : exploitation de la droite ln(A) = f(t) pour déterminer la constante radioactive.",
  },
  {
    id: "link_math_snv_tvi_kinetics",
    sourceSubject: "math",
    targetSubject: "natural_sciences",
    sourceSkillId: "math_intermediate_value_method",
    targetSkillId: "snv_enzyme_kinetics_active_site",
    conceptLink_ar: "الرتابة، الاستمرار، وتفسير منحنيات التشبع والتوازن البيولوجي",
    conceptLink_fr: "Monotonie, continuité et seuils de saturation enzymatique",
    pedagogicalRationale_ar: "تحليل منحنى النشاط الإنزيمي بدلالة تركيز الركيزة أو الـ pH يعتمد على استيعاب مفهوم التغير الرتيب ثم ثبات السرعة عند التشبع التام للمواقع الفعالة.",
    pedagogicalRationale_fr: "L'interprétation de la cinétique enzymatique (phase d'accélération puis plateau de saturation) mobilise l'analyse de variations.",
    bacTransferExample_ar: "بكالوريا 2023 علوم تجريبية: دراسة تأثير مثبط نوعي على سرعة التفاعل الإنزيمي.",
    bacTransferExample_fr: "BAC 2023 Sciences Exp : étude comparative de cinétique enzymatique avec inhibiteur.",
  },
  {
    id: "link_snv_physics_document_methodology",
    sourceSubject: "natural_sciences",
    targetSubject: "physics",
    sourceSkillId: "snv_scientific_analysis_method",
    targetSkillId: "physics_reaction_rate_monitoring",
    conceptLink_ar: "منهجية استغلال الوثائق البيانية والتفريق بين الملاحظة والتفسير",
    conceptLink_fr: "Exploitation rigoureuse des documents graphiques : observation vs interprétation",
    pedagogicalRationale_ar: "منهجية العلوم الطبيعية في قراءة المنحنيات (تفكيك الوثيقة إلى مجالات، تحديد الملاحظة بدقة، ثم تقديم التفسير السببي) تنطبق بحذافيرها على قراءة منحنيات المتابعة الزمنية في الكيمياء وتحديد زمن نصف التفاعل t1/2.",
    pedagogicalRationale_fr: "La rigueur méthodologique d'analyse documentaire en SNV s'applique directement à l'exploitation des courbes cinétiques chimiques.",
    bacTransferExample_ar: "بكالوريا 2024 علوم تجريبية: استغلال جدول تقدم التفاعل ومنحنى تطور الناقلية.",
    bacTransferExample_fr: "BAC 2024 Sciences Exp : exploitation combinée tableau d'avancement et courbe de suivi cinétique.",
  },
];

/**
 * 3. Curriculum Audit Summary Helper
 */
export function getSciencesExpCurriculumAuditSummary() {
  const coreSubjects = SCIENCES_EXP_SUBJECT_AUDIT.filter((s) => s.role === "CORE_ENGINE");
  const supportingSubjects = SCIENCES_EXP_SUBJECT_AUDIT.filter((s) => s.role !== "CORE_ENGINE");

  const totalCoreCoefficients = coreSubjects.reduce((sum, s) => sum + s.baselineCoefficient, 0);
  const totalStreamCoefficients = SCIENCES_EXP_SUBJECT_AUDIT.reduce((sum, s) => sum + s.baselineCoefficient, 0);

  return {
    streamId: "sciences_exp" as StreamId,
    streamName_ar: "علوم تجريبية",
    streamName_fr: "Sciences Expérimentales",
    legalReference: "Décret Exécutif n° 07-142 (OFFICIAL_HISTORICAL)",
    academicYear: "2026-2027",
    decision36Status: "CURRENT_OFFICIAL_MICRO_EVIDENCE_INSUFFICIENT",
    subjectsCount: SCIENCES_EXP_SUBJECT_AUDIT.length,
    coreSubjectsCount: coreSubjects.length,
    totalCanonicalSkills: 31,
    coreCoefficientWeightPercent: Math.round((totalCoreCoefficients / totalStreamCoefficients) * 100),
    crossSubjectTransferLinksCount: SCIENCES_EXP_TRANSFER_LINKS.length,
    realStudentValidation: "PENDING" as const,
  };
}
