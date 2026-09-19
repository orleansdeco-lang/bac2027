/**
 * BAC Mastery — Student Learning Context & Deterministic Subject Authorization
 * 
 * Canonical Source of Truth for Student Identity, Stream Lock, and Content Authorization.
 * Invariant: Every learning surface MUST respect the authenticated student's stream context.
 * Zero cross-stream content leakage at domain, service, repository, and UI levels.
 */

import { StreamId, TechniqueMathSpecialty } from "@/types/education";
import { StudentStatus } from "@/types/registration";
import { resolveStreamSubjects, StreamSubjectRule } from "@/domain/curriculum/streams";
import { SUBJECT_REGISTRY } from "@/domain/curriculum/subjects";

export interface StudentLearningContext {
  userId: string;
  stream: StreamId;
  studentStatus: StudentStatus;
  wilayaCode: string;
  wilayaName?: string;
  communeCode: string;
  communeName?: string;
  schoolName: string | null;
  targetScore: number;
  targetSpecialty?: string | null;
  techniqueMathSpecialty?: TechniqueMathSpecialty | null;
  trialStartedAt: string;
  trialExpiresAt: string;
  isTrialActive: boolean;
  canUseProduct: boolean;
  registrationCompletedAt?: string | null;
  academicProfileCompletedAt?: string | null;
}

/**
 * Returns the deterministic list of authorized subjects for a student or stream.
 * NEVER returns all subjects and hides cards in React.
 */
export function getStudentSubjects(
  contextOrStream: StudentLearningContext | StreamId,
  specialtyId?: TechniqueMathSpecialty | null
): StreamSubjectRule[] {
  const streamId = typeof contextOrStream === "string" ? contextOrStream : contextOrStream.stream;
  const specialty = typeof contextOrStream === "object"
    ? contextOrStream.techniqueMathSpecialty
    : specialtyId;

  return resolveStreamSubjects(streamId, specialty);
}

/**
 * Validates whether a specific subject belongs to the student's authorized stream curriculum.
 */
export function isSubjectAllowedForStream(
  subjectId: string,
  streamId: StreamId,
  specialtyId?: TechniqueMathSpecialty | null
): boolean {
  const allowed = resolveStreamSubjects(streamId, specialtyId);
  return allowed.some((rule) => rule.subjectId === subjectId);
}

/**
 * Validates whether a content item (subject, skill, or question) is compatible with the student's stream.
 * Returns false if the content belongs to another stream.
 */
export function validateContentStreamCompatibility(
  contextOrStream: StudentLearningContext | StreamId,
  item: {
    streamId?: string;
    subjectId?: string;
    skillId?: string;
  }
): boolean {
  const streamId = typeof contextOrStream === "string" ? contextOrStream : contextOrStream.stream;
  const specialty = typeof contextOrStream === "object"
    ? contextOrStream.techniqueMathSpecialty
    : undefined;

  // 1. If item has an explicit streamId, it must match (unless item is for all streams / common)
  if (item.streamId && item.streamId !== streamId && item.streamId !== "all_streams" && item.streamId !== "common") {
    return false;
  }

  // 2. If item has a subjectId, verify the subject belongs to the stream
  if (item.subjectId) {
    const normalizedSubject = item.subjectId === "mathematics" ? "math" : item.subjectId;
    if (streamId === "technique_math" && !specialty) {
      const isEngineeringSubject =
        normalizedSubject === "civil_eng" ||
        normalizedSubject === "mechanical_eng" ||
        normalizedSubject === "electrical_eng" ||
        normalizedSubject === "process_eng" ||
        normalizedSubject === "genie_civil" ||
        normalizedSubject === "genie_mecanique" ||
        normalizedSubject === "genie_electrique" ||
        normalizedSubject === "genie_des_procedes";
      if (!isEngineeringSubject && !isSubjectAllowedForStream(normalizedSubject, streamId, specialty)) {
        return false;
      }
    } else if (!isSubjectAllowedForStream(normalizedSubject, streamId, specialty)) {
      return false;
    }
  }

  // 3. Prevent cross-stream skill prefix leakage
  if (item.skillId) {
    // Technique Math engineering skills (batch 04) belong EXCLUSIVELY to Technique Mathématiques
    const isTmSkill = item.skillId.startsWith("tm_");
    if (isTmSkill && streamId !== "technique_math") {
      return false;
    }

    // Within Technique Math, enforce specialty isolation if specialty is set
    if (isTmSkill && streamId === "technique_math" && specialty) {
      if ((item.skillId.startsWith("tm_civil_") || item.skillId.startsWith("tm_gc_")) && specialty !== "civil_eng") {
        return false;
      }
      if ((item.skillId.startsWith("tm_meca_") || item.skillId.startsWith("tm_gm_")) && specialty !== "mechanical_eng") {
        return false;
      }
      if ((item.skillId.startsWith("tm_elec_") || item.skillId.startsWith("tm_ge_")) && specialty !== "electrical_eng") {
        return false;
      }
      if ((item.skillId.startsWith("tm_proc_") || item.skillId.startsWith("tm_gp_")) && specialty !== "process_eng") {
        return false;
      }
    }

    // Gestion & Économie specific skills (accounting, eco, law, management, and gestion-specific philosophy/french)
    const isGestionSkill =
      item.skillId.startsWith("acc_") ||
      item.skillId.startsWith("eco_") ||
      item.skillId.startsWith("law_") ||
      item.skillId.startsWith("gestion_") ||
      item.skillId.startsWith("mgmt_") ||
      item.skillId.startsWith("phi_ge_") ||
      item.skillId.startsWith("fr_ge_");

    if (isGestionSkill && streamId !== "gestion_eco") {
      return false;
    }

    // Lettres & Philosophie specific skills (literature philosophy, arabic syntax, literature math)
    const isLettresPhiloSkill =
      item.skillId.startsWith("phi_lp_") ||
      item.skillId.startsWith("ar_lp_") ||
      item.skillId.startsWith("math_lp_") ||
      item.skillId.startsWith("phil_lp_") ||
      item.skillId.startsWith("arabic_lp_") ||
      item.skillId.startsWith("fr_lp_") ||
      item.skillId.startsWith("en_lp_");

    if (isLettresPhiloSkill && streamId !== "lettres_philo" && streamId !== "langues_etrangeres") {
      return false;
    }

    // Third language (Spanish, German, Italian) skills belong EXCLUSIVELY to Langues Étrangères
    const isThirdLangSkill =
      item.skillId.startsWith("esp_") ||
      item.skillId.startsWith("all_") ||
      item.skillId.startsWith("ita_");
    if (isThirdLangSkill && streamId !== "langues_etrangeres") {
      return false;
    }

    // Advanced Philosophy skills belong to Lettres & Philosophie
    const isAdvancedPhiloSkill =
      item.skillId.startsWith("phil_epistemology_") ||
      item.skillId.startsWith("phil_ethics_");
    if (isAdvancedPhiloSkill && streamId !== "lettres_philo") {
      return false;
    }

    // Arabic literature & rhetoric skills (Batch 05) belong to Lettres & Philo and Langues Étrangères
    const isBatch5ArabicSkill =
      item.skillId.startsWith("ar_poetry_") ||
      (item.skillId.startsWith("ar_rhetoric_") && item.skillId !== "ar_rhetoric_musnad_musnad_ilayh_syntax");
    if (isBatch5ArabicSkill && streamId !== "lettres_philo" && streamId !== "langues_etrangeres") {
      return false;
    }

    // Mathématiques stream exclusive factory skills (batch 01-03)
    const isMathStreamSkill = item.skillId.startsWith("math_m_");
    if (isMathStreamSkill && streamId !== "math" && streamId !== "technique_math") {
      return false;
    }

    // Biology / SNV skills belong EXCLUSIVELY to Sciences Expérimentales
    const isBioSkill =
      item.skillId.startsWith("snv_") ||
      item.skillId.includes("SNV") ||
      item.skillId.includes("BIO");
    if (streamId !== "sciences_exp" && isBioSkill) {
      return false;
    }

    // Physics skills should NEVER leak to Gestion-Eco, Lettres-Philo, or Langues-Étrangères
    const isPhysicsSkill =
      item.skillId.startsWith("phy_") ||
      item.skillId.includes("PHY") ||
      item.skillId.startsWith("physics_");
    if (
      (streamId === "gestion_eco" || streamId === "lettres_philo" || streamId === "langues_etrangeres") &&
      isPhysicsSkill
    ) {
      return false;
    }
  }

  return true;
}

