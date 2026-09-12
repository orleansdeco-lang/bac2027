/**
 * BAC Mastery — External Learning Resource Layer Implementation
 * Prompt 20.1: Curated External Resources, Provenance & Return-Action Contracts
 * 
 * Rules:
 * - BAC Mastery is NOT a link directory.
 * - Every external resource must have a clear pedagogical purpose and explainable recommendation rationale.
 * - ZERO scraping or copyright reproduction: BAC Mastery links only.
 * - Every recommendation MUST declare a return action (active recall, retest twin, micro-drill).
 * - URLs must be validated and sanitized (untrusted input safety).
 */

import { SubjectId } from "@/types/education";
import {
  ExternalLearningResource,
  ResourceRecommendation,
  ResourceEducationalPurpose,
  ResourceReturnAction,
  ProvenanceQualityClassification,
  EscalationEvidence,
} from "./types";

// =============================================================================
// 1. URL SAFETY & CONTRACT VALIDATION
// =============================================================================

export interface ResourceValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates external URL safety: must be valid HTTPS or HTTP protocol,
 * no javascript:, data:, or executable URIs.
 */
export function isSafeExternalUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Validates an ExternalLearningResource against pedagogical and provenance invariants.
 */
export function validateExternalResourceContract(
  resource: ExternalLearningResource
): ResourceValidationResult {
  const errors: string[] = [];

  if (!resource.id || typeof resource.id !== "string" || resource.id.trim() === "") {
    errors.push("External resource must have a valid non-empty id.");
  }

  if (!resource.skillId || typeof resource.skillId !== "string") {
    errors.push("External resource must target a specific skillId.");
  }

  if (!resource.subjectId) {
    errors.push("External resource must declare a subjectId.");
  }

  if (!isSafeExternalUrl(resource.url)) {
    errors.push(`External resource URL must be a valid http(s) URL: ${resource.url}`);
  }

  if (!resource.provider || resource.provider.trim() === "") {
    errors.push("External resource must name a provider/author.");
  }

  // Purpose validation
  const validPurposes: ResourceEducationalPurpose[] = [
    "UNDERSTAND",
    "REVIEW",
    "VISUALIZE",
    "PRACTICE",
    "EXAM_METHOD",
    "REPAIR",
    "GO_DEEPER",
    "PREREQUISITE",
  ];
  if (!validPurposes.includes(resource.purpose)) {
    errors.push(`Invalid educational purpose: ${resource.purpose}`);
  }

  // Return action validation
  const validReturnActions: ResourceReturnAction[] = [
    "active_recall",
    "isomorphic_retest",
    "guided_repair_step",
    "practice_micro_drill",
    "checkpoint_quiz",
  ];
  if (!validReturnActions.includes(resource.suggestedReturnAction)) {
    errors.push(`Invalid return action: ${resource.suggestedReturnAction}`);
  }

  // Explainability invariant
  if (!resource.whyRecommended_ar || resource.whyRecommended_ar.trim().length < 10) {
    errors.push("External resource must have an explicit Arabic whyRecommended explanation.");
  }

  // Provenance validation
  const validProvenances: ProvenanceQualityClassification[] = [
    "OFFICIAL_CURRENT",
    "OFFICIAL_HISTORICAL",
    "RESEARCH_SUPPORTED",
    "BAC_MASTERY_DERIVED",
    "PROVISIONAL",
    "UNVERIFIED",
  ];
  if (!validProvenances.includes(resource.sourceQuality)) {
    errors.push(`Invalid source quality classification: ${resource.sourceQuality}`);
  }

  if (!resource.rightsStatus) {
    errors.push("External resource must declare rightsStatus (e.g. external_reference_only).");
  }

  if (!resource.verificationStatus) {
    errors.push("External resource must declare verificationStatus.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// 2. CANONICAL EXEMPLAR EXTERNAL RESOURCES
// =============================================================================

export const CANONICAL_EXEMPLAR_EXTERNAL_RESOURCES: ExternalLearningResource[] = [
  {
    id: "res_math_exp_limits_indeterminate_video",
    title_ar: "إزالة حالات عدم التعيين في الدوال الأسية — شرح مرئي مفصل",
    title_fr: "Levée des indéterminations dans les fonctions exponentielles — Vidéo",
    provider: "Algerian National Educational Channel (CRDP)",
    url: "https://crdp.education.dz/resources/math/terminale/exponentielle-limites",
    resourceType: "video",
    subjectId: "math",
    skillId: "math_exp_limits_indeterminate",
    streamId: "sciences_exp",
    language: "ar",
    direction: "rtl",
    difficulty: 2,
    estimatedDurationMinutes: 12,
    purpose: "VISUALIZE",
    sourceQuality: "OFFICIAL_CURRENT",
    rightsStatus: "external_reference_only",
    verificationStatus: "verified",
    verifiedAt: "2026-09-12",
    lastCheckedAt: "2026-09-12",
    description_ar: "درس مرئي يقدم أمثلة متدرجة لإخراج العامل المشترك وتطبيق التزايد المقارن لإزالة حالات عدم التعيين.",
    description_fr: "Leçon vidéo officielle présentant des exemples progressifs pour lever les indéterminations.",
    whyRecommended_ar: "فشلت في تطبيق التزايد المقارن مرتين، وهذا الفيديو يفكك الخطوات الجبرية بشكل متسلسل قبل العودة لإعادة الاختبار.",
    whyRecommended_fr: "Recommandé suite à des échecs répétés pour visualiser les étapes algébriques avant le retest.",
    suggestedReturnAction: "isomorphic_retest",
  },
  {
    id: "res_phys_rc_equations_official_doc",
    title_ar: "وثيقة توجيهية رسمية: حل المعادلة التفاضلية لدارة RC",
    title_fr: "Document officiel d'accompagnement: Équation différentielle du circuit RC",
    provider: "General Inspectorate of National Education (MEN)",
    url: "https://education.gov.dz/inspect/physique/bac/rc-guide-officiel.pdf",
    resourceType: "official_document",
    subjectId: "physics",
    skillId: "phys_rc_dipole_response",
    streamId: "sciences_exp",
    language: "ar",
    direction: "rtl",
    difficulty: 2,
    estimatedDurationMinutes: 10,
    purpose: "EXAM_METHOD",
    sourceQuality: "OFFICIAL_CURRENT",
    rightsStatus: "official_reference",
    verificationStatus: "verified",
    verifiedAt: "2026-09-12",
    lastCheckedAt: "2026-09-12",
    description_ar: "الدليل المنهجي الوزاري لكتابة قانون جمع التوترات وتحديد الثوابت A و τ في الحل الرياضي للدارة RC.",
    description_fr: "Guide méthodologique ministériel sur la loi d'additivité des tensions et la détermination des constantes.",
    whyRecommended_ar: "لديك خطأ في المنهجية الرسمية لتحديد الثوابت؛ هذه الوثيقة توضح الصياغة النموذجية المطلوبة في البكالوريا.",
    whyRecommended_fr: "Clarifie la méthodologie officielle requise pour le BAC.",
    suggestedReturnAction: "checkpoint_quiz",
  },
  {
    id: "res_snv_protein_synthesis_interactive",
    title_ar: "محاكاة تفاعلية لحركة الريبوزوم وتشكيل السلسلة الببتيدية",
    title_fr: "Animation interactive de la traduction et chaîne peptidique",
    provider: "Open Educational Resource (Pedagogical Sciences Pool)",
    url: "https://oer.educ.algerie.dz/simulations/biologie/ribosome-traduction",
    resourceType: "interactive",
    subjectId: "natural_sciences",
    skillId: "snv_protein_synthesis_translation",
    streamId: "sciences_exp",
    language: "ar",
    direction: "rtl",
    difficulty: 2,
    estimatedDurationMinutes: 8,
    purpose: "UNDERSTAND",
    sourceQuality: "RESEARCH_SUPPORTED",
    rightsStatus: "external_reference_only",
    verificationStatus: "verified",
    verifiedAt: "2026-09-12",
    lastCheckedAt: "2026-09-12",
    description_ar: "محاكاة مرئية متحركة لحركة الريبوزوم رامزة برامزة وقراءة ARNm وتشكيل الروابط الببتيدية مع رامزة التوقف.",
    description_fr: "Simulation visuelle de la traduction codon par codon.",
    whyRecommended_ar: "هناك خلط بين موقع الربط وموقع الإطلاق؛ المحاكاة تجسد الحركة الميكانيكية للريبوزوم.",
    whyRecommended_fr: "Recommandé pour visualiser le mouvement du ribosome et clarifier les rôles des sites P et A.",
    suggestedReturnAction: "active_recall",
  },
];

// =============================================================================
// 3. RECOMMENDATION GENERATOR & RETURN ACTION ENGINE
// =============================================================================

export interface RecommendResourceInput {
  skillId: string;
  evidence: EscalationEvidence;
}

/**
 * Deterministically recommends an external resource based on student struggle evidence.
 * Always includes reasonCode, human-readable rationale, and strict return action.
 */
export function recommendExternalResource(
  input: RecommendResourceInput
): ResourceRecommendation | null {
  const { skillId, evidence } = input;
  const matchingResources = CANONICAL_EXEMPLAR_EXTERNAL_RESOURCES.filter(
    (res) => res.skillId === skillId
  );

  if (matchingResources.length === 0) {
    return null;
  }

  const resource = matchingResources[0];

  // Determine reason code based on accumulated evidence
  let reasonCode: ResourceRecommendation["reasonCode"] = "CONCEPTUAL_MISUNDERSTANDING";
  let reason_ar = "نوصي بمراجعة هذا المورد المعتمد لتعميق فهمك للمفهوم.";
  let reason_fr = "Ressource recommandée pour approfondir la compréhension du concept.";

  if (evidence.retestFailed || evidence.retestFailureCount > 0) {
    reasonCode = "REPEATED_RETEST_FAILURE";
    reason_ar = `فشلت في اختبار التوأم (${evidence.retestFailureCount} مرة)؛ هذا المورد يوضح المفهوم بأسلوب بديل قبل إعادة المحاولة.`;
    reason_fr = `Échec au retest (${evidence.retestFailureCount} fois) ; cette ressource offre une explication alternative.`;
  } else if (evidence.dominantErrorType === "methodology_error") {
    reasonCode = "METHODOLOGY_BLOCK";
    reason_ar = "لديك تعثر في منهجية صياغة الحل والتطبيق؛ هذا المرجع يقدم نمذجة خطوة بخطوة للحل النموذجي.";
    reason_fr = "Difficulté méthodologique identifiée ; cette ressource modélise la démarche étape par étape.";
  } else if (evidence.unmasteredPrerequisites.length > 0) {
    reasonCode = "PREREQUISITE_GAP";
    reason_ar = `هناك مكتسبات قبلية تحتاج تدعيماً (${evidence.unmasteredPrerequisites.join(", ")}) قبل مواصلة التدريب.`;
    reason_fr = `Prérequis non consolidés (${evidence.unmasteredPrerequisites.join(", ")}) nécessitant un rappel.`;
  } else if (evidence.studentExplicitRequest === "need_visual" || evidence.studentExplicitRequest === "need_external_resource") {
    reasonCode = "STUDENT_EXPLICIT_REQUEST";
    reason_ar = "بناءً على طلبك لشرح مرئي أو مصدر خارجي، اخترنا لك هذا المرجع الموثوق.";
    reason_fr = "Ressource certifiée sélectionnée suite à votre demande expresse.";
  }

  return {
    resourceId: resource.id,
    skillId: resource.skillId,
    reasonCode,
    reason_ar,
    reason_fr,
    purpose: resource.purpose,
    priority: evidence.retestFailureCount > 1 ? "high" : "medium",
    expectedOutcome_ar: "استيعاب الخطوات الأساسية ثم العودة فوراً لإتمام خطوة التحقق في BAC Mastery.",
    expectedOutcome_fr: "Compréhension des étapes clés puis retour immédiat sur BAC Mastery pour validation.",
    returnAction: resource.suggestedReturnAction,
  };
}

// =============================================================================
// 4. QUERY UTILITIES
// =============================================================================

export function getExternalResourcesForSkill(skillId: string): ExternalLearningResource[] {
  return CANONICAL_EXEMPLAR_EXTERNAL_RESOURCES.filter((res) => res.skillId === skillId);
}

export function getExternalResourceById(id: string): ExternalLearningResource | undefined {
  return CANONICAL_EXEMPLAR_EXTERNAL_RESOURCES.find((res) => res.id === id);
}

export function getAllCanonicalExternalResources(): ExternalLearningResource[] {
  return [...CANONICAL_EXEMPLAR_EXTERNAL_RESOURCES];
}
