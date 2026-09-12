/**
 * BAC Mastery - Progress Application Service
 * Aggregates verified student learning evidence (zero fake metrics)
 */

import { MasteryRepository } from "@/lib/repositories/mastery-repository";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { MissionRepository } from "@/lib/repositories/mission-repository";
import { RetestRepository } from "@/lib/repositories/retest-repository";
import { ContentService } from "./content-service";

export interface ProgressReport {
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
  };
}

export const ProgressService = {
  async getProgressReport(userId?: string): Promise<ProgressReport> {
    const [masteryMap, errorsMap, missionsMap, retestsList] = await Promise.all([
      MasteryRepository.getMasteryRecords(userId),
      ErrorRepository.getErrors(userId),
      MissionRepository.getMissions(userId),
      RetestRepository.getAllRetests(userId),
    ]);

    const allSkills = ContentService.getAllSkills();
    const skillsMap = new Map(allSkills.map((s) => [s.id, s]));

    const demonstratedSkills: ProgressReport["demonstratedSkills"] = [];
    const emergingSkills: ProgressReport["emergingSkills"] = [];

    for (const [skillId, evidence] of Object.entries(masteryMap)) {
      const skill = skillsMap.get(skillId);
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
      .map((e) => ({
        errorId: e.id,
        skillId: e.skillId,
        questionId: e.questionId,
        status: e.repairStatus,
      }));

    const repairedErrorsCount = errorsList.filter(
      (e) => e.repairStatus === "repair_completed" || e.repairStatus === "retest_passed"
    ).length;

    const retestSuccessCount = retestsList.filter((r) => r.isPassed).length;

    const completedMissionsCount = Object.values(missionsMap).filter(
      (m) => m.status === "mastered"
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
      const tot = allSkills.filter((s) => aliases.includes(s.subjectId)).length;
      return { demonstrated: dem, emerging: em, total: tot };
    };

    return {
      demonstratedSkills,
      emergingSkills,
      activeErrors,
      repairedErrorsCount,
      retestSuccessCount,
      completedMissionsCount,
      subjectBreakdown: {
        mathematics: getCountForSubject("mathematics"),
        physics: getCountForSubject("physics"),
        natural_sciences: getCountForSubject("natural_sciences"),
      },
    };
  },
};
