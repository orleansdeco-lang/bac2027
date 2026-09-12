/**
 * BAC Mastery V1 — Canonical Stream & Specialty Registry
 * Prompt 20: Generic Multi-Stream Architecture
 * 
 * Official Algerian Legal Reference:
 * Executive Decree No. 07-142 of May 19, 2007 (المرسوم التنفيذي رقم 07-142 المؤرخ في 19 مايو 2007)
 * establishing the evaluation rules, certification, and stream structures of secondary education.
 * 
 * Note on Coefficients:
 * Classified as OFFICIAL_HISTORICAL. In accordance with Prompt 20 Section 3, no coefficient
 * is labeled as OFFICIAL_CURRENT without an explicit annual circular citation for 2026-2027.
 */

import { StreamId, TechniqueMathSpecialty } from "@/types/education";
import { StreamDefinition, SpecialtyDefinition, StreamSubjectRule } from "./types";

// ============================================================================
// 1. TECHNIQUE MATH SPECIALTY REGISTRY (4 INDEPENDENT ENGINEERING BRANCHES)
// ============================================================================

export const SPECIALTY_REGISTRY: Record<TechniqueMathSpecialty, SpecialtyDefinition> = {
  civil_eng: {
    id: "civil_eng",
    code: "GC",
    name_ar: "هندسة مدنية",
    name_fr: "Génie Civil",
    streamId: "technique_math",
    specialtySubjectId: "civil_eng",
    specialtyCoefficient: 7,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    description_ar: "الهياكل، ميكانيكا التربة، مواد البناء، ومقاومة المواد والخرسانة المسلحة.",
    description_fr: "Ouvrages, géotechnique, mécanique des structures et résistance des matériaux.",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
  },
  mechanical_eng: {
    id: "mechanical_eng",
    code: "GM",
    name_ar: "هندسة ميكانيكية",
    name_fr: "Génie Mécanique",
    streamId: "technique_math",
    specialtySubjectId: "mechanical_eng",
    specialtyCoefficient: 7,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    description_ar: "الآليات، التحليل البنيوي، السينماتيك، والديناميك، وتصميم الأنظمة الميكانيكية.",
    description_fr: "Cinématique, statique, dynamique, dimensionnement et conception mécanique.",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
  },
  electrical_eng: {
    id: "electrical_eng",
    code: "GE",
    name_ar: "هندسة كهربائية",
    name_fr: "Génie Électrique",
    streamId: "technique_math",
    specialtySubjectId: "electrical_eng",
    specialtyCoefficient: 7,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    description_ar: "الأنظمة المنطقية، المعالجات الدقيقة، الدوائر الكهربائية، والإلكترونيات الخطية ورقمية.",
    description_fr: "Circuits électriques, électronique de puissance, logique combinatoire et séquentielle.",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
  },
  process_eng: {
    id: "process_eng",
    code: "GP",
    name_ar: "هندسة الطرائق",
    name_fr: "Génie des Procédés",
    streamId: "technique_math",
    specialtySubjectId: "process_eng",
    specialtyCoefficient: 7,
    coefficientStatus: "OFFICIAL_HISTORICAL",
    description_ar: "الكيمياء الصناعية، العمليات الموحدة، الديناميكا الحرارية، وتفاعلات البلمرة والتصنيع.",
    description_fr: "Chimie industrielle, opérations unitaires, thermodynamique et cinétique des réacteurs.",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
  },
};

// ============================================================================
// 2. THE 6 CANONICAL ALGERIAN BAC STREAMS REGISTRY
// ============================================================================

export const STREAM_REGISTRY: Record<StreamId, StreamDefinition> = {
  // 1. SCIENCES EXPÉRIMENTALES
  sciences_exp: {
    id: "sciences_exp",
    code: "SE",
    name_ar: "علوم تجريبية",
    name_fr: "Sciences Expérimentales",
    description_ar: "تركيز تكاملي مكثف على علوم الطبيعة والحياة، العلوم الفيزيائية، والرياضيات.",
    description_fr: "Trilogie fondamentale en sciences de la nature et de la vie, physique-chimie et mathématiques.",
    examType: "BAC",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    verificationStatus: "OFFICIAL_HISTORICAL",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    subjects: [
      { subjectId: "natural_sciences", coefficient: 6, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "physics", coefficient: 5, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "math", coefficient: 5, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "french", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "english", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
    ],
  },

  // 2. MATHÉMATIQUES
  math: {
    id: "math",
    code: "M",
    name_ar: "رياضيات",
    name_fr: "Mathématiques",
    description_ar: "شعبة النخبة العلمية القائمة على التجريد والاستدلال والبرهان الصارم في الرياضيات والفيزياء.",
    description_fr: "Filière d'excellence théorique axée sur la rigueur de la démonstration mathématique et la physique approfondie.",
    examType: "BAC",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    verificationStatus: "OFFICIAL_HISTORICAL",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    subjects: [
      { subjectId: "math", coefficient: 7, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "physics", coefficient: 6, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "natural_sciences", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "french", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "english", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
    ],
  },

  // 3. TECHNIQUE MATHÉMATIQUES
  technique_math: {
    id: "technique_math",
    code: "TM",
    name_ar: "تقني رياضي",
    name_fr: "Technique Mathématiques",
    description_ar: "تخصص هندسي تطبيقي متقدم في أحد الفروع الأربعة مدعوماً بقاعدة رياضيات وفيزياء صلبة.",
    description_fr: "Formation technologique et d'ingénierie appliquée dans l'un des 4 génies avec socle maths et physique.",
    examType: "BAC",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    verificationStatus: "OFFICIAL_HISTORICAL",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    supportedSpecialties: ["civil_eng", "mechanical_eng", "electrical_eng", "process_eng"],
    subjects: [
      { subjectId: "math", coefficient: 6, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "physics", coefficient: 6, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "french", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "english", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
    ],
  },

  // 4. GESTION ET ÉCONOMIE
  gestion_eco: {
    id: "gestion_eco",
    code: "GE",
    name_ar: "تسيير واقتصاد",
    name_fr: "Gestion & Économie",
    description_ar: "علوم الإدارة، المحاسبة والمالية، الاقتصاد والمناجمنت، والقانون مع الرياضيات التطبيقية.",
    description_fr: "Comptabilité financière, économie d'entreprise, management stratégique et droit civil/commercial.",
    examType: "BAC",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    verificationStatus: "OFFICIAL_HISTORICAL",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    subjects: [
      { subjectId: "accounting_finance", coefficient: 6, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "economics_management", coefficient: 5, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "math", coefficient: 5, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 4, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "law", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "philosophy", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "french", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "english", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
    ],
  },

  // 5. LETTRES ET PHILOSOPHIE
  lettres_philo: {
    id: "lettres_philo",
    code: "LP",
    name_ar: "آداب وفلسفة",
    name_fr: "Lettres & Philosophie",
    description_ar: "التفكير الفلسفي النقدي، التحليل الأدبي والبلاغي المعمق في اللغة العربية، والتاريخ والجغرافيا.",
    description_fr: "Dissertation philosophique rigoureuse, stylistique littéraire arabe et histoire-géographie approfondie.",
    examType: "BAC",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    verificationStatus: "OFFICIAL_HISTORICAL",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    subjects: [
      { subjectId: "philosophy", coefficient: 6, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "arabic", coefficient: 6, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 4, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "french", coefficient: 3, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "english", coefficient: 3, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "math", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
    ],
  },

  // 6. LANGUES ÉTRANGÈRES
  langues_etrangeres: {
    id: "langues_etrangeres",
    code: "LE",
    name_ar: "لغات أجنبية",
    name_fr: "Langues Étrangères",
    description_ar: "إتقان اللغات الأجنبية (الفرنسية، الإنجليزية، ولغة ثالثة: إسبانية، ألمانية، أو إيطالية) مع الأدب العربي.",
    description_fr: "Plurilinguisme appliqué : français, anglais, troisième langue vivante et littérature arabe.",
    examType: "BAC",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    verificationStatus: "OFFICIAL_HISTORICAL",
    officialReference: "Décret Exécutif n° 07-142 du 19 mai 2007",
    subjects: [
      { subjectId: "french", coefficient: 5, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "english", coefficient: 5, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "arabic", coefficient: 5, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "third_language", coefficient: 4, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
      { subjectId: "math", coefficient: 2, coefficientStatus: "OFFICIAL_HISTORICAL", isCoreSubject: false },
    ],
  },
};

// ============================================================================
// 3. PURE HELPER & RESOLUTION FUNCTIONS
// ============================================================================

export function getStreamDefinition(streamId: StreamId): StreamDefinition {
  const stream = STREAM_REGISTRY[streamId];
  if (!stream) {
    throw new Error(`Unknown StreamId: "${streamId}". Expected one of: ${Object.keys(STREAM_REGISTRY).join(", ")}`);
  }
  return stream;
}

export function getAllStreams(): StreamDefinition[] {
  return Object.values(STREAM_REGISTRY);
}

export function getSpecialtyDefinition(specialtyId: TechniqueMathSpecialty): SpecialtyDefinition {
  const specialty = SPECIALTY_REGISTRY[specialtyId];
  if (!specialty) {
    throw new Error(`Unknown TechniqueMathSpecialty: "${specialtyId}". Expected one of: ${Object.keys(SPECIALTY_REGISTRY).join(", ")}`);
  }
  return specialty;
}

export function getAllSpecialties(): SpecialtyDefinition[] {
  return Object.values(SPECIALTY_REGISTRY);
}

/**
 * Resolves the active subjects for a student's stream and optional specialty.
 * 
 * STRICT PROMPT 20 SAFETY RULES:
 * 1. For non-Technique Math streams, returns standard curriculum subjects.
 * 2. For Technique Math:
 *    - If specialty is undefined/null/unknown, returns base subjects only.
 *    - NEVER silently defaults to mechanical_eng or any other branch!
 *    - If valid specialty provided, injects that specific branch subject with coefficient 7.
 */
export function resolveStreamSubjects(
  streamId: StreamId,
  specialtyId?: TechniqueMathSpecialty | null
): StreamSubjectRule[] {
  const stream = getStreamDefinition(streamId);

  if (streamId !== "technique_math") {
    return [...stream.subjects];
  }

  // Base subjects for Technique Math (Math, Physics, Arabic, Philo, French, English, Islam, Hist-Geo)
  const baseSubjects = stream.subjects.filter(
    (s) =>
      s.subjectId !== "civil_eng" &&
      s.subjectId !== "mechanical_eng" &&
      s.subjectId !== "electrical_eng" &&
      s.subjectId !== "process_eng"
  );

  // If specialty is unknown, DO NOT invent one. Keep it unknown.
  if (!specialtyId || !(specialtyId in SPECIALTY_REGISTRY)) {
    return [...baseSubjects];
  }

  // Known specialty explicitly specified: inject specialty subject
  const spec = SPECIALTY_REGISTRY[specialtyId];
  return [
    {
      subjectId: spec.specialtySubjectId,
      coefficient: spec.specialtyCoefficient,
      coefficientStatus: spec.coefficientStatus,
      isCoreSubject: true,
      notes_ar: `المادة المميزة للتخصص: ${spec.name_ar}`,
      notes_fr: `Matière de spécialité : ${spec.name_fr}`,
    },
    ...baseSubjects,
  ];
}
