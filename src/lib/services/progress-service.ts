/**
 * BAC Mastery - Progress Application Service
 * Aggregates verified student learning evidence (zero fake metrics)
 */

import { MasteryRepository } from "@/lib/repositories/mastery-repository";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { MissionRepository } from "@/lib/repositories/mission-repository";
import { RetestRepository } from "@/lib/repositories/retest-repository";
import { ContentService } from "./content-service";

import { StudentRepository } from "@/lib/repositories/student-repository";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { StreamId } from "@/types/education";
import { getStudentSubjects } from "@/domain/student";

export interface ProgressReport {
  streamId: StreamId;
  demonstratedSkills: Array<{ skillId: string; title_ar: string; title_fr: string; subjectId: string }>;
  emergingSkills: Array<{ skillId: string; title_ar: string; title_fr: string; subjectId: string }>;
  activeErrors: Array<{ errorId: string; skillId: string; questionId: string; status: string }>;
  repairedErrorsCount: number;
  retestSuccessCount: number;
  completedMissionsCount: number;
  subjectBreakdown: {
    mathematics: { demonstrated: number; emerging: number; total: number };
    physics: { demonstrated: number; emerging: number; total: number };
    natural_sciences: { demonstrated: number; emerging: number; total: number };
    accounting_finance?: { demonstrated: number; emerging: number; total: number };
    economics_management?: { demonstrated: number; emerging: number; total: number };
    law?: { demonstrated: number; emerging: number; total: number };
    history_geography?: { demonstrated: number; emerging: number; total: number };
    [key: string]: { demonstrated: number; emerging: number; total: number } | undefined;
  };
}

export const ProgressService = {
  async getProgressReport(userId?: string, streamIdParam?: StreamId): Promise<ProgressReport> {
    const [profile, masteryMap, errorsMap, missionsMap, retestsList] = await Promise.all([
      StudentRepository.getProfile(userId),
      MasteryRepository.getMasteryRecords(userId),
      ErrorRepository.getErrors(userId),
      MissionRepository.getMissions(userId),
      RetestRepository.getAllRetests(userId),
    ]);

    const localProfile = getStrategicProfile();
    const effectiveStream: StreamId =
      streamIdParam ||
      (profile?.streamId as StreamId) ||
      (localProfile?.streamId as StreamId) ||
      "sciences_exp";

    // Strictly scope all skills to the student's authorized stream
    const streamSkills = ContentService.getSkillsForStream(effectiveStream);
    const skillsMap = new Map(streamSkills.map((s) => [s.id, s]));

    const demonstratedSkills: ProgressReport["demonstratedSkills"] = [];
    const emergingSkills: ProgressReport["emergingSkills"] = [];

    for (const [skillId, evidence] of Object.entries(masteryMap)) {
      const skill = skillsMap.get(skillId);
      // Invariant: Do not count mastery for skills outside the student's stream!
      if (!skill) continue;

      if (evidence.masteryStatus === "demonstrated" || evidence.status === "mastered") {
        demonstratedSkills.push({
          skillId,
          title_ar: skill.title_ar,
          title_fr: skill.title_fr,
          subjectId: skill.subjectId,
        });
      } else if (evidence.masteryStatus === "emerging") {
        emergingSkills.push({
          skillId,
          title_ar: skill.title_ar,
          title_fr: skill.title_fr,
          subjectId: skill.subjectId,
        });
      }
    }

    const errorsList = Object.values(errorsMap);
    const activeErrors = errorsList
      .filter((e) => e.repairStatus === "identified" || e.repairStatus === "repair_started")
      .filter((e) => skillsMap.has(e.skillId)) // only errors for skills in student's stream
      .map((e) => ({
        errorId: e.id,
        skillId: e.skillId,
        questionId: e.questionId,
        status: e.repairStatus,
      }));

    const repairedErrorsCount = errorsList.filter(
      (e) => (e.repairStatus === "repair_completed" || e.repairStatus === "retest_passed") && skillsMap.has(e.skillId)
    ).length;

    const retestSuccessCount = retestsList.filter((r) => r.isPassed).length;

    const completedMissionsCount = Object.values(missionsMap).filter(
      (m) => m.status === "mastered" && skillsMap.has(m.skillId)
    ).length;

    // Subject breakdown with alias normalization (math / mathematics)
    const normalizeSubj = (subj: string) => {
      if (subj === "mathematics" || subj === "math") return ["math", "mathematics"];
      return [subj];
    };

    const getCountForSubject = (subj: string) => {
      const aliases = normalizeSubj(subj);
      const dem = demonstratedSkills.filter((s) => aliases.includes(s.subjectId)).length;
      const em = emergingSkills.filter((s) => aliases.includes(s.subjectId)).length;
      const tot = streamSkills.filter((s) => aliases.includes(s.subjectId)).length;
      return { demonstrated: dem, emerging: em, total: tot };
    };

    // Populate authorized stream subjects
    const authorizedSubjects = getStudentSubjects(effectiveStream, profile?.techniqueMathSpecialty);
    const breakdown: ProgressReport["subjectBreakdown"] = {
      mathematics: getCountForSubject("math"),
      physics: getCountForSubject("physics"),
      natural_sciences: getCountForSubject("natural_sciences"),
      accounting_finance: getCountForSubject("accounting_finance"),
      economics_management: getCountForSubject("economics_management"),
      law: getCountForSubject("law"),
      history_geography: getCountForSubject("history_geography"),
    };

    for (const rule of authorizedSubjects) {
      breakdown[rule.subjectId] = getCountForSubject(rule.subjectId);
    }
    // Maintain backward compatibility for mathematics alias
    breakdown.mathematics = getCountForSubject("math");

    return {
      streamId: effectiveStream,
      demonstratedSkills,
      emergingSkills,
      activeErrors,
      repairedErrorsCount,
      retestSuccessCount,
      completedMissionsCount,
      subjectBreakdown: breakdown,
    };
  },
};
