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

  // 1. If item has an explicit streamId, it must match
  if (item.streamId && item.streamId !== streamId) {
    return false;
  }

  // 2. If item has a subjectId, verify the subject belongs to the stream
  if (item.subjectId) {
    const normalizedSubject = item.subjectId === "mathematics" ? "math" : item.subjectId;
    if (!isSubjectAllowedForStream(normalizedSubject, streamId, specialty)) {
      return false;
    }
  }

  // 3. Prevent cross-stream skill prefix leakage
  if (item.skillId) {
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

