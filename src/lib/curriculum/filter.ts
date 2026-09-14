/**
 * BAC Mastery — Pure Curriculum Routing & Stream Filtering Engine
 * 
 * Strict Invariants:
 * 1. Absolute Stream Isolation: Each stream accesses ONLY its official Algerian BAC subjects.
 * 2. Strict Gestion & Économie Isolation: NEVER allow "natural_sciences" or "physics" in any shape or form.
 * 3. Robust Alias Normalization: "management", "gestion", "gestion_eco", etc., map deterministically.
 * 4. Zero Cross-Stream Fallback Pollution: Unknown or missing streams never pollute with unauthorized subjects.
 */

import { StreamId, SubjectId, TechniqueMathSpecialty } from "@/types/education";
import { resolveStreamSubjects } from "@/domain/curriculum/streams";

export interface StreamSubjectMeta {
  subjectId: SubjectId;
  name_ar: string;
  name_fr: string;
  coef: number;
  color: string;
  count: number;
}

export interface StreamMetadata {
  streamId: StreamId;
  code: string;
  name_ar: string;
  name_fr: string;
  totalSkills: number;
  subjects: StreamSubjectMeta[];
}

/**
 * Normalizes any stream representation (IDs, aliases, Arabic labels, abbreviations)
 * into a canonical Algerian Baccalaureate StreamId.
 */
export function normalizeStreamId(rawStream?: string | null): StreamId | null {
  if (!rawStream || typeof rawStream !== "string") return null;

  const s = rawStream.trim().toLowerCase().replace(/[\s\-_]+/g, "_");

  // 1. Gestion & Économie (Management / Economics)
  if (
    s === "gestion_eco" ||
    s === "gestion" ||
    s === "management" ||
    s === "gestion_economie" ||
    s === "ge" ||
    s.includes("تسيير") ||
    s.includes("اقتصاد")
  ) {
    return "gestion_eco";
  }

  // 2. Sciences Expérimentales (Experimental Sciences)
  if (
    s === "sciences_exp" ||
    s === "sciences" ||
    s === "science" ||
    s === "experimental_sciences" ||
    s === "sciences_experimentales" ||
    s === "se" ||
    s.includes("تجريبية")
  ) {
    return "sciences_exp";
  }

  // 3. Mathématiques (Pure Mathematics)
  if (
    s === "math" ||
    s === "maths" ||
    s === "mathematics" ||
    s === "mathematiques" ||
    s === "m" ||
    s === "رياضيات"
  ) {
    return "math";
  }

  // 4. Technique Mathématiques (Technical Math / Engineering)
  if (
    s === "technique_math" ||
    s === "technique" ||
    s === "technique_mathematiques" ||
    s === "tm" ||
    s.includes("تقني")
  ) {
    return "technique_math";
  }

  // 5. Lettres et Philosophie (Literature & Philosophy)
  if (
    s === "lettres_philo" ||
    s === "lettres" ||
    s === "philo" ||
    s === "lettres_philosophie" ||
    s === "lp" ||
    s.includes("فلسفة") ||
    s.includes("آداب") ||
    s.includes("اداب")
  ) {
    return "lettres_philo";
  }

  // 6. Langues Étrangères (Foreign Languages)
  if (
    s === "langues_etrangeres" ||
    s === "langues" ||
    s === "le" ||
    s.includes("لغات")
  ) {
    return "langues_etrangeres";
  }

  return null;
}

/**
 * Normalizes stream ID with a safe fallback.
 */
export function normalizeStreamIdWithDefault(
  rawStream?: string | null,
  fallback: StreamId = "sciences_exp"
): StreamId {
  return normalizeStreamId(rawStream) || fallback;
}

/**
 * Returns the exact list of officially authorized subjects for a stream.
 * Guarantees zero leakage of unauthorized disciplines.
 */
export function getAuthorizedSubjectsForStream(
  rawStream?: string | null,
  specialtyId?: TechniqueMathSpecialty | null
): SubjectId[] {
  const streamId = normalizeStreamId(rawStream);
  if (!streamId) return [];

  const rules = resolveStreamSubjects(streamId, specialtyId);
  const subjects = rules.map((r) => r.subjectId);

  // STRICT INVARIANT ENFORCEMENT:
  // Gestion & Économie must NEVER have Natural Sciences or Physics
  if (streamId === "gestion_eco") {
    return subjects.filter((s) => s !== "natural_sciences" && s !== "physics");
  }

  // Math stream must NEVER have Natural Sciences as a curriculum subject
  if (streamId === "math") {
    return subjects.filter((s) => s !== "natural_sciences");
  }

  // Literary & Language streams must NEVER have Natural Sciences or Physics
  if (streamId === "lettres_philo" || streamId === "langues_etrangeres") {
    return subjects.filter((s) => s !== "natural_sciences" && s !== "physics");
  }

  return subjects;
}

/**
 * Validates whether a subject belongs to the student's authorized stream curriculum.
 * Strict boolean check with explicit hard blocks against unauthorized disciplines.
 */
export function isSubjectAuthorizedForStream(
  subjectId: string,
  rawStream?: string | null,
  specialtyId?: TechniqueMathSpecialty | null
): boolean {
  if (!subjectId) return false;
  const streamId = normalizeStreamId(rawStream);
  if (!streamId) return false;

  const normalizedSubject =
    subjectId === "science" ? "natural_sciences" :
    subjectId === "mathematics" ? "math" :
    subjectId === "accounting" ? "accounting_finance" :
    subjectId;

  // HARD DEFENSE 1: Gestion & Économie must NEVER access natural_sciences or physics
  if (streamId === "gestion_eco") {
    if (
      normalizedSubject === "natural_sciences" ||
      normalizedSubject === "physics" ||
      normalizedSubject === "science"
    ) {
      return false;
    }
  }

  // HARD DEFENSE 2: Math stream must NEVER access natural_sciences
  if (streamId === "math") {
    if (normalizedSubject === "natural_sciences" || normalizedSubject === "science") {
      return false;
    }
  }

  // HARD DEFENSE 3: Literary streams must NEVER access science subjects
  if (streamId === "lettres_philo" || streamId === "langues_etrangeres") {
    if (
      normalizedSubject === "natural_sciences" ||
      normalizedSubject === "physics" ||
      normalizedSubject === "science"
    ) {
      return false;
    }
  }

  const authorizedList = getAuthorizedSubjectsForStream(streamId, specialtyId);
  return authorizedList.includes(normalizedSubject as SubjectId);
}

/**
 * Authoritative default subject for a given stream.
 * Prevents defaulting to "math" or "sciences" when inside Gestion & Économie.
 */
export function getDefaultSubjectForStream(rawStream?: string | null): SubjectId {
  const streamId = normalizeStreamId(rawStream);
  switch (streamId) {
    case "gestion_eco":
      return "accounting_finance";
    case "math":
      return "math";
    case "technique_math":
      return "math";
    case "lettres_philo":
      return "philosophy";
    case "langues_etrangeres":
      return "french";
    case "sciences_exp":
    default:
      return "natural_sciences";
  }
}

/**
 * Authoritative default skill ID for a given stream.
 * Used for fallback mission escalation without cross-stream contamination.
 */
export function getDefaultSkillForStream(rawStream?: string | null): string {
  const streamId = normalizeStreamId(rawStream);
  switch (streamId) {
    case "gestion_eco":
      return "acc_depreciation_linear_degressive";
    case "math":
      return "math_derivatives_chain_rule";
    case "technique_math":
      return "math_derivatives_chain_rule";
    case "lettres_philo":
      return "philo_essay_methodology";
    case "langues_etrangeres":
      return "french_text_analysis";
    case "sciences_exp":
    default:
      return "math_exp_limits_indeterminate";
  }
}

/**
 * Authoritative default skill title for a given stream.
 */
export function getDefaultSkillTitleForStream(
  rawStream?: string | null,
  isAr: boolean = true
): string {
  const streamId = normalizeStreamId(rawStream);
  switch (streamId) {
    case "gestion_eco":
      return isAr
        ? "اهتلاك التثبيتات العينية وإعداد جدول الاهتلاك"
        : "Amortissements des immobilisations et tableaux d'amortissement";
    case "math":
      return isAr
        ? "الاشتقاقية وتركيب الدوال وتطبيقاتها"
        : "Dérivation et composition de fonctions";
    case "technique_math":
      return isAr
        ? "الاشتقاقية وتطبيقاتها الهندسية"
        : "Dérivation et applications d'ingénierie";
    case "lettres_philo":
      return isAr
        ? "منهجية المقالة الفلسفية المقارنة والجدلية"
        : "Méthodologie de la dissertation philosophique";
    case "langues_etrangeres":
      return isAr
        ? "تقنيات تحليل النص الحجاجي والتلخيص"
        : "Techniques d'analyse de texte et compte rendu";
    case "sciences_exp":
    default:
      return isAr
        ? "حساب النهايات في الدوال الأسية وحالات عدم التعيين"
        : "Calcul des limites exponentielles et indéterminations";
  }
}

/**
 * Detailed stream presentation metadata, strictly isolated per stream.
 * Eliminates fallback contamination when rendering cards, donuts, or headers.
 */
const STREAM_METADATA_REGISTRY: Record<StreamId, StreamMetadata> = {
  gestion_eco: {
    streamId: "gestion_eco",
    code: "GE",
    name_ar: "شعبة التسيير والاقتصاد",
    name_fr: "Gestion & Économie",
    totalSkills: 33,
    subjects: [
      { subjectId: "accounting_finance", name_ar: "تسيير مالي ومحاسبي", name_fr: "Gestion Fin.", coef: 6, color: "#5F8F86", count: 9 },
      { subjectId: "economics_management", name_ar: "اقتصاد ومناجمنت", name_fr: "Économie", coef: 5, color: "#D7A66A", count: 8 },
      { subjectId: "math", name_ar: "رياضيات", name_fr: "Math", coef: 5, color: "#6E9B7B", count: 8 },
      { subjectId: "law", name_ar: "قانون", name_fr: "Droit", coef: 2, color: "#C8796B", count: 8 },
    ],
  },
  sciences_exp: {
    streamId: "sciences_exp",
    code: "SE",
    name_ar: "شعبة العلوم التجريبية",
    name_fr: "Sciences Expérimentales",
    totalSkills: 31,
    subjects: [
      { subjectId: "math", name_ar: "رياضيات", name_fr: "Math", coef: 7, color: "#5F8F86", count: 10 },
      { subjectId: "natural_sciences", name_ar: "علوم الطبيعة والحياة", name_fr: "SNV", coef: 6, color: "#6E9B7B", count: 10 },
      { subjectId: "physics", name_ar: "علوم فيزيائية", name_fr: "Physique", coef: 6, color: "#D7A66A", count: 11 },
    ],
  },
  math: {
    streamId: "math",
    code: "M",
    name_ar: "شعبة الرياضيات",
    name_fr: "Mathématiques",
    totalSkills: 30,
    subjects: [
      { subjectId: "math", name_ar: "رياضيات", name_fr: "Math", coef: 7, color: "#5F8F86", count: 15 },
      { subjectId: "physics", name_ar: "علوم فيزيائية", name_fr: "Physique", coef: 6, color: "#D7A66A", count: 15 },
    ],
  },
  technique_math: {
    streamId: "technique_math",
    code: "TM",
    name_ar: "شعبة تقني رياضي",
    name_fr: "Technique Mathématiques",
    totalSkills: 30,
    subjects: [
      { subjectId: "mechanical_eng", name_ar: "تكنولوجيا وهندسة", name_fr: "Génie", coef: 7, color: "#D7A66A", count: 15 },
      { subjectId: "math", name_ar: "رياضيات", name_fr: "Math", coef: 6, color: "#5F8F86", count: 15 },
    ],
  },
  lettres_philo: {
    streamId: "lettres_philo",
    code: "LP",
    name_ar: "شعبة آداب وفلسفة",
    name_fr: "Lettres et Philosophie",
    totalSkills: 20,
    subjects: [
      { subjectId: "philosophy", name_ar: "فلسفة", name_fr: "Philosophie", coef: 6, color: "#C8796B", count: 10 },
      { subjectId: "arabic", name_ar: "لغة عربية وآدابها", name_fr: "Langue Arabe", coef: 6, color: "#6E9B7B", count: 10 },
    ],
  },
  langues_etrangeres: {
    streamId: "langues_etrangeres",
    code: "LE",
    name_ar: "شعبة لغات أجنبية",
    name_fr: "Langues Étrangères",
    totalSkills: 20,
    subjects: [
      { subjectId: "third_language", name_ar: "لغة أجنبية ثالثة", name_fr: "Langue 3", coef: 5, color: "#C8796B", count: 10 },
      { subjectId: "french", name_ar: "لغة فرنسية", name_fr: "Français", coef: 5, color: "#5F8F86", count: 5 },
      { subjectId: "english", name_ar: "لغة إنجليزية", name_fr: "Anglais", coef: 5, color: "#D7A66A", count: 5 },
    ],
  },
};

/**
 * Resolves full stream metadata cleanly without risking fallback pollution.
 */
export function getStreamMetadata(rawStream?: string | null): StreamMetadata {
  const streamId = normalizeStreamId(rawStream) || "sciences_exp";
  return STREAM_METADATA_REGISTRY[streamId];
}
