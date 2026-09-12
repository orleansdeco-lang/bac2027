/**
 * BAC Mastery V1 — Scalable Subject Registry
 * Prompt 20: Comprehensive Subject Model & Methodology Linkage
 * 
 * Strict Architectural Rules:
 * 1. ZERO UI coupling: Educational taxonomy decoupled from presentation.
 * 2. Explicit Content Language: UI language and educational content language are distinct.
 * 3. Formal Provenance: Every subject carries statutory reference and verification state.
 */

import { SubjectId, StreamId, TechniqueMathSpecialty } from "@/types/education";
import { SubjectRegistryItem } from "./types";

export const SUBJECT_REGISTRY: Record<SubjectId, SubjectRegistryItem> = {
  // 1. MATHEMATICS
  math: {
    id: "math",
    code: "MATH",
    name_ar: "الرياضيات",
    name_fr: "Mathématiques",
    streamIds: ["sciences_exp", "math", "technique_math", "gestion_eco", "lettres_philo", "langues_etrangeres"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "mathematics",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: true,
    coefficientProvenance: {
      standardBaseline: 5,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 7 للرياضيات، 6 للتقني رياضي، 5 للعلوم التجريبية والتسيير، 2 للآداب واللغات.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — مادة الرياضيات للتعليم الثانوي",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 2. PHYSICS & CHEMISTRY
  physics: {
    id: "physics",
    code: "PHY",
    name_ar: "العلوم الفيزيائية",
    name_fr: "Sciences Physiques",
    streamIds: ["sciences_exp", "math", "technique_math"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "physics_chemistry",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: true,
    coefficientProvenance: {
      standardBaseline: 5,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 6 للرياضيات والتقني رياضي، 5 للعلوم التجريبية.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — مادة العلوم الفيزيائية",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 3. NATURAL SCIENCES (SNV)
  natural_sciences: {
    id: "natural_sciences",
    code: "SNV",
    name_ar: "علوم الطبيعة والحياة",
    name_fr: "Sciences de la Nature et de la Vie",
    streamIds: ["sciences_exp", "math"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "natural_sciences",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: true,
    coefficientProvenance: {
      standardBaseline: 6,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 6 للعلوم التجريبية (المادة الأساسية المميزة)، 2 لشعبة الرياضيات.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — مادة علوم الطبيعة والحياة",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 4. ARABIC LANGUAGE & LITERATURE
  arabic: {
    id: "arabic",
    code: "AR",
    name_ar: "اللغة العربية وآدابها",
    name_fr: "Langue et Littérature Arabes",
    streamIds: ["sciences_exp", "math", "technique_math", "gestion_eco", "lettres_philo", "langues_etrangeres"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "languages",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 3,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 6 لآداب وفلسفة، 5 للغات أجنبية، 3 للشعب العلمية والتسيير.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — اللغة العربية وآدابها",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 5. PHILOSOPHY
  philosophy: {
    id: "philosophy",
    code: "PHIL",
    name_ar: "الفلسفة",
    name_fr: "Philosophie",
    streamIds: ["sciences_exp", "math", "technique_math", "gestion_eco", "lettres_philo", "langues_etrangeres"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "philosophy",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 2,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 6 لآداب وفلسفة (مادة مميزة)، 2 لباقي الشعب.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — مادة الفلسفة",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 6. FRENCH LANGUAGE
  french: {
    id: "french",
    code: "FR",
    name_ar: "اللغة الفرنسية",
    name_fr: "Français",
    streamIds: ["sciences_exp", "math", "technique_math", "gestion_eco", "lettres_philo", "langues_etrangeres"],
    contentLanguage: "fr",
    textDirection: "ltr",
    methodologyFamily: "languages",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 2,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 5 للغات أجنبية، 3 لآداب وفلسفة، 2 لباقي الشعب.",
    },
    provenance: {
      source: "Programme officiel du Ministère de l'Éducation Nationale — Français",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 7. ENGLISH LANGUAGE
  english: {
    id: "english",
    code: "ENG",
    name_ar: "اللغة الإنجليزية",
    name_fr: "Anglais",
    streamIds: ["sciences_exp", "math", "technique_math", "gestion_eco", "lettres_philo", "langues_etrangeres"],
    contentLanguage: "en",
    textDirection: "ltr",
    methodologyFamily: "languages",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 2,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 5 للغات أجنبية، 3 لآداب وفلسفة، 2 لباقي الشعب.",
    },
    provenance: {
      source: "Official Ministry Curriculum — English Language Syllabus",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 8. ISLAMIC STUDIES
  islamic_studies: {
    id: "islamic_studies",
    code: "ISL",
    name_ar: "العلوم الإسلامية",
    name_fr: "Sciences Islamiques",
    streamIds: ["sciences_exp", "math", "technique_math", "gestion_eco", "lettres_philo", "langues_etrangeres"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "islamic_studies",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 2,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 2 لجميع شعب البكالوريا.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — العلوم الإسلامية",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 9. HISTORY & GEOGRAPHY
  history_geography: {
    id: "history_geography",
    code: "HG",
    name_ar: "التاريخ والجغرافيا",
    name_fr: "Histoire-Géographie",
    streamIds: ["sciences_exp", "math", "technique_math", "gestion_eco", "lettres_philo", "langues_etrangeres"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "history_geography",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 2,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 4 لآداب وفلسفة والتسيير والاقتصاد، 2 لباقي الشعب.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — التاريخ والجغرافيا",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 10. ACCOUNTING & FINANCIAL MANAGEMENT
  accounting_finance: {
    id: "accounting_finance",
    code: "ACC",
    name_ar: "التسيير المحاسبي والمالي",
    name_fr: "Gestion Comptable et Financière",
    streamIds: ["gestion_eco"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "economics_management",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 6,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 6 (المادة المميزة الرئيسية لشعبة التسيير والاقتصاد).",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — التسيير المحاسبي والمالي",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 11. ECONOMICS & MANAGEMENT
  economics_management: {
    id: "economics_management",
    code: "ECO",
    name_ar: "الاقتصاد والمناجمنت",
    name_fr: "Économie et Management",
    streamIds: ["gestion_eco"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "economics_management",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 5,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 5 لشعبة التسيير والاقتصاد.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — الاقتصاد والمناجمنت",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 12. LAW
  law: {
    id: "law",
    code: "LAW",
    name_ar: "القانون",
    name_fr: "Droit",
    streamIds: ["gestion_eco"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "economics_management",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 2,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 2 لشعبة التسيير والاقتصاد.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — مادة القانون",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 13. CIVIL ENGINEERING (TM - Génie Civil)
  civil_eng: {
    id: "civil_eng",
    code: "GC",
    name_ar: "الهندسة المدنية",
    name_fr: "Génie Civil",
    streamIds: ["technique_math"],
    specialtyIds: ["civil_eng"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "technique_math",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: true,
    coefficientProvenance: {
      standardBaseline: 7,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 7 للمادة المميزة لفرع الهندسة المدنية.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — الهندسة المدنية",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 14. MECHANICAL ENGINEERING (TM - Génie Mécanique)
  mechanical_eng: {
    id: "mechanical_eng",
    code: "GM",
    name_ar: "الهندسة الميكانيكية",
    name_fr: "Génie Mécanique",
    streamIds: ["technique_math"],
    specialtyIds: ["mechanical_eng"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "technique_math",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: true,
    coefficientProvenance: {
      standardBaseline: 7,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 7 للمادة المميزة لفرع الهندسة الميكانيكية.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — الهندسة الميكانيكية",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 15. ELECTRICAL ENGINEERING (TM - Génie Électrique)
  electrical_eng: {
    id: "electrical_eng",
    code: "GE",
    name_ar: "الهندسة الكهربائية",
    name_fr: "Génie Électrique",
    streamIds: ["technique_math"],
    specialtyIds: ["electrical_eng"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "technique_math",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: true,
    coefficientProvenance: {
      standardBaseline: 7,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 7 للمادة المميزة لفرع الهندسة الكهربائية.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — الهندسة الكهربائية",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 16. PROCESS ENGINEERING (TM - Génie des Procédés)
  process_eng: {
    id: "process_eng",
    code: "GP",
    name_ar: "هندسة الطرائق",
    name_fr: "Génie des Procédés",
    streamIds: ["technique_math"],
    specialtyIds: ["process_eng"],
    contentLanguage: "ar",
    textDirection: "rtl",
    methodologyFamily: "technique_math",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: true,
    coefficientProvenance: {
      standardBaseline: 7,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 7 للمادة المميزة لفرع هندسة الطرائق.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — هندسة الطرائق",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },

  // 17. THIRD FOREIGN LANGUAGE (Langues Étrangères)
  third_language: {
    id: "third_language",
    code: "L3",
    name_ar: "اللغة الأجنبية الثالثة (إسبانية / ألمانية / إيطالية)",
    name_fr: "Troisième Langue Vivante (Espagnol / Allemand / Italien)",
    streamIds: ["langues_etrangeres"],
    contentLanguage: "es", // Canonical representation for 3rd language
    textDirection: "ltr",
    methodologyFamily: "languages",
    curriculumStatus: "active",
    verificationStatus: "OFFICIAL_HISTORICAL",
    academicYear: "2026-2027",
    isScientific: false,
    coefficientProvenance: {
      standardBaseline: 4,
      status: "OFFICIAL_HISTORICAL",
      officialDocumentRef: "Décret Exécutif n° 07-142 du 19 mai 2007",
      notes: "المعامل: 4 لشعبة اللغات الأجنبية.",
    },
    provenance: {
      source: "البرنامج الرسمي لوزارة التربية الوطنية — اللغة الأجنبية الثالثة",
      sourceType: "ministry_curriculum",
      rightsStatus: "official_public_curriculum",
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSubjectRegistryItem(id: SubjectId): SubjectRegistryItem {
  const item = SUBJECT_REGISTRY[id];
  if (!item) {
    throw new Error(`Unknown SubjectId: "${id}". Expected one of: ${Object.keys(SUBJECT_REGISTRY).join(", ")}`);
  }
  return item;
}

export function getAllSubjects(): SubjectRegistryItem[] {
  return Object.values(SUBJECT_REGISTRY);
}

export function getSubjectsForStream(
  streamId: StreamId,
  specialtyId?: TechniqueMathSpecialty
): SubjectRegistryItem[] {
  return Object.values(SUBJECT_REGISTRY).filter((sub) => {
    if (!sub.streamIds.includes(streamId)) return false;
    if (streamId === "technique_math" && sub.specialtyIds) {
      if (!specialtyId) return false; // unknown specialty strictly isolates engineering subjects
      return sub.specialtyIds.includes(specialtyId);
    }
    return true;
  });
}

export function resolveContentLanguage(id: SubjectId): "ar" | "fr" | "en" | "es" | "de" | "it" {
  return getSubjectRegistryItem(id).contentLanguage;
}

export function resolveTextDirection(id: SubjectId): "rtl" | "ltr" {
  return getSubjectRegistryItem(id).textDirection;
}

