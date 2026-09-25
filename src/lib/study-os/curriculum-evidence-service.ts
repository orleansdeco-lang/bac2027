/**
 * SHATER Study OS — Curriculum & Pedagogical Evidence Service
 * Phase 3: Connects curriculum structure to authentic learning evidence.
 * 
 * CORE INVARIANT:
 * "A student checking 'درس' does NOT automatically mean 'أتقن الدرس'."
 * Activity (self-study check) is strictly distinguished from Pedagogical Evidence (Demonstrated Mastery).
 */

import { StreamId, SubjectId } from "@/types/education";
import { ContentService } from "@/lib/services/content-service";
import { MasteryRepository } from "@/lib/repositories/mastery-repository";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { DiagnosticRepository } from "@/lib/repositories/diagnostic-repository";
import { CURRICULUM_TOPICS } from "@/data/curriculum/topics";
import { getStreamSubjects, ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { getSubjectMeta } from "@/lib/focus/focus-engine";
import { ErrorRecord, MasteryEvidence } from "@/types/mission";
import { Skill } from "@/domain/content/types";

export type SkillPedagogicalState =
  | "NOT_STARTED"
  | "STARTED"
  | "NEEDS_REPAIR"
  | "RETEST_READY"
  | "DEMONSTRATED";

export interface CurriculumSkillWithEvidence {
  skillId: string;
  subjectId: string;
  topicId: string;
  title_ar: string;
  title_fr?: string;
  description_ar?: string;
  state: SkillPedagogicalState;
  isDemonstrated: boolean; // TRUE only if verified through genuine practice/retest evidence!
  isSelfReported: boolean; // Checked by student as self-read without verified assessment
  errorId?: string;
  missionId?: string;
  actionText: string;
  actionType: "repair" | "retest" | "practice" | "lesson" | "mastered";
}

export interface CurriculumUnitWithEvidence {
  id: string;
  subjectId: string;
  title_ar: string;
  title_fr?: string;
  description_ar?: string;
  order: number;
  skills: CurriculumSkillWithEvidence[];
  totalSkills: number;
  demonstratedCount: number;
  needsRepairCount: number;
  retestReadyCount: number;
  startedCount: number;
  notStartedCount: number;
  masteryPercentage: number;
  status: "mastered" | "needs_attention" | "in_progress" | "untouched";
}

export interface CurriculumSubjectWithEvidence {
  subjectId: SubjectId;
  name_ar: string;
  name_fr: string;
  hexColor: string;
  coefficient: number;
  isCore: boolean;
  units: CurriculumUnitWithEvidence[];
  totalSkills: number;
  demonstratedCount: number;
  needsRepairCount: number;
  retestReadyCount: number;
  startedCount: number;
  notStartedCount: number;
  masteryPercentage: number;
  recommendedAction: {
    label: string;
    skillId: string;
    skillTitleAr: string;
    actionText: string;
    actionType: "repair" | "retest" | "practice";
  } | null;
}

export interface CurriculumTreeSummary {
  streamId: StreamId;
  streamNameAr: string;
  subjects: CurriculumSubjectWithEvidence[];
  totalSkillsCount: number;
  demonstratedSkillsCount: number;
  needsRepairSkillsCount: number;
  retestReadySkillsCount: number;
  overallMasteryPercentage: number;
}

export const CurriculumEvidenceService = {
  /**
   * Fetches and compiles the entire stream curriculum with real pedagogical evidence
   */
  async getCurriculumTree(
    userId: string,
    streamId: StreamId,
    userManualSkills: Record<string, { status?: string }> = {}
  ): Promise<CurriculumTreeSummary> {
    // 1. Efficient parallel fetch of all learning evidence (No N+1 queries)
    const [masteryMap, errorsMap, diagResult] = await Promise.all([
      MasteryRepository.getMasteryRecords(userId).catch(() => ({})),
      ErrorRepository.getErrors(userId).catch(() => ({})),
      DiagnosticRepository.getResults(userId).catch(() => null),
    ]);

    const errorList: ErrorRecord[] = Object.values(errorsMap || {});
    const masteryList: MasteryEvidence[] = Object.values(masteryMap || {});

    // 2. Retrieve canonical skills for this specific stream (Strict stream isolation)
    const rawSkills = ContentService.getSkillsForStream(streamId);

    // 3. Retrieve stream subjects sorted by official coefficient descending
    const streamSubjectRules = [...getStreamSubjects(streamId)].sort(
      (a, b) => b.coefficient - a.coefficient
    );

    // Map errors by skillId
    const errorsBySkill = new Map<string, ErrorRecord>();
    for (const err of errorList) {
      errorsBySkill.set(err.skillId, err);
    }

    // Map mastery by skillId
    const masteryBySkill = new Map<string, MasteryEvidence>();
    for (const m of masteryList) {
      masteryBySkill.set(m.skillId, m);
    }

    // Map topics
    const relevantTopics = CURRICULUM_TOPICS.filter(
      (t) => t.streamId === streamId || t.educationLevel === "secondary"
    );

    const compiledSubjects: CurriculumSubjectWithEvidence[] = [];

    let totalStreamSkills = 0;
    let totalStreamDemonstrated = 0;
    let totalStreamNeedsRepair = 0;
    let totalStreamRetestReady = 0;

    for (const rule of streamSubjectRules) {
      const subjectId = rule.subjectId;
      const subMeta = getSubjectMeta(subjectId);
      const subjectSkills = rawSkills.filter((s) => s.subjectId === subjectId);

      if (subjectSkills.length === 0) continue;

      // Group skills by unit/topic
      const subjectTopics = relevantTopics.filter((t) => t.subjectId === subjectId);

      // Create units map
      const unitsMap = new Map<string, CurriculumUnitWithEvidence>();

      // Initialize defined topics
      for (const top of subjectTopics) {
        unitsMap.set(top.id, {
          id: top.id,
          subjectId: subjectId,
          title_ar: top.title_ar,
          title_fr: top.title_fr,
          description_ar: top.description_ar,
          order: top.order || 99,
          skills: [],
          totalSkills: 0,
          demonstratedCount: 0,
          needsRepairCount: 0,
          retestReadyCount: 0,
          startedCount: 0,
          notStartedCount: 0,
          masteryPercentage: 0,
          status: "untouched",
        });
      }

      // Default unit for skills without matching topic
      const defaultTopicId = `${subjectId}_unit_general`;
      if (!unitsMap.has(defaultTopicId)) {
        unitsMap.set(defaultTopicId, {
          id: defaultTopicId,
          subjectId: subjectId,
          title_ar: `الوحدات الأساسية — ${subMeta.nameAr}`,
          order: 999,
          skills: [],
          totalSkills: 0,
          demonstratedCount: 0,
          needsRepairCount: 0,
          retestReadyCount: 0,
          startedCount: 0,
          notStartedCount: 0,
          masteryPercentage: 0,
          status: "untouched",
        });
      }

      // Process skills and determine authentic pedagogical state
      for (const skill of subjectSkills) {
        const errorRecord = errorsBySkill.get(skill.id);
        const masteryRecord = masteryBySkill.get(skill.id);
        const isManuallyChecked = userManualSkills[skill.id]?.status === "mastered";

        let state: SkillPedagogicalState = "NOT_STARTED";
        let isDemonstrated = false;
        let isSelfReported = false;
        let actionText = "ابدأ الدرس";
        let actionType: "repair" | "retest" | "practice" | "lesson" | "mastered" = "lesson";

        // Authoritative Pedagogical Evidence Precedence
        if (errorRecord) {
          if (errorRecord.repairStatus === "identified" || errorRecord.repairStatus === "repair_started") {
            state = "NEEDS_REPAIR";
            actionText = "صلح الخطأ";
            actionType = "repair";
          } else if (errorRecord.repairStatus === "repair_completed") {
            state = "RETEST_READY";
            actionText = "عاود الاختبار";
            actionType = "retest";
          } else if (errorRecord.repairStatus === "retest_passed") {
            state = "DEMONSTRATED";
            isDemonstrated = true;
            actionText = "المهارة مثبتة";
            actionType = "mastered";
          }
        } else if (masteryRecord) {
          if (masteryRecord.masteryStatus === "demonstrated") {
            state = "DEMONSTRATED";
            isDemonstrated = true;
            actionText = "المهارة مثبتة";
            actionType = "mastered";
          } else if (masteryRecord.masteryStatus === "emerging") {
            state = "STARTED";
            actionText = "تدرب على المهارة";
            actionType = "practice";
          }
        } else if (isManuallyChecked) {
          // Manual self-study indicator (ACTIVITY ONLY — does not count as demonstrated mastery!)
          state = "STARTED";
          isSelfReported = true;
          actionText = "تحقق من الإتقان";
          actionType = "practice";
        }

        const skillItem: CurriculumSkillWithEvidence = {
          skillId: skill.id,
          subjectId: skill.subjectId,
          topicId: skill.topicId || defaultTopicId,
          title_ar: skill.title_ar,
          title_fr: skill.title_fr,
          description_ar: skill.description_ar,
          state,
          isDemonstrated,
          isSelfReported,
          errorId: errorRecord?.id,
          missionId: errorRecord?.missionId,
          actionText,
          actionType,
        };

        const targetUnit = unitsMap.get(skillItem.topicId) || unitsMap.get(defaultTopicId)!;
        targetUnit.skills.push(skillItem);
      }

      // Compute statistics for each unit
      const compiledUnits: CurriculumUnitWithEvidence[] = [];
      let subjectDemonstrated = 0;
      let subjectNeedsRepair = 0;
      let subjectRetestReady = 0;
      let subjectStarted = 0;
      let subjectNotStarted = 0;
      let recommendedSkill: {
        label: string;
        skillId: string;
        skillTitleAr: string;
        actionText: string;
        actionType: "repair" | "retest" | "practice";
      } | null = null;

      const allUnits = Array.from(unitsMap.values());
      for (const unit of allUnits) {
        if (unit.skills.length === 0) continue;

        unit.totalSkills = unit.skills.length;
        unit.demonstratedCount = unit.skills.filter((s: CurriculumSkillWithEvidence) => s.isDemonstrated).length;
        unit.needsRepairCount = unit.skills.filter((s: CurriculumSkillWithEvidence) => s.state === "NEEDS_REPAIR").length;
        unit.retestReadyCount = unit.skills.filter((s: CurriculumSkillWithEvidence) => s.state === "RETEST_READY").length;
        unit.startedCount = unit.skills.filter((s: CurriculumSkillWithEvidence) => s.state === "STARTED").length;
        unit.notStartedCount = unit.skills.filter((s: CurriculumSkillWithEvidence) => s.state === "NOT_STARTED").length;

        unit.masteryPercentage =
          unit.totalSkills > 0
            ? Math.round((unit.demonstratedCount / unit.totalSkills) * 100)
            : 0;

        if (unit.needsRepairCount > 0) {
          unit.status = "needs_attention";
        } else if (unit.demonstratedCount === unit.totalSkills) {
          unit.status = "mastered";
        } else if (unit.startedCount > 0 || unit.demonstratedCount > 0) {
          unit.status = "in_progress";
        } else {
          unit.status = "untouched";
        }

        subjectDemonstrated += unit.demonstratedCount;
        subjectNeedsRepair += unit.needsRepairCount;
        subjectRetestReady += unit.retestReadyCount;
        subjectStarted += unit.startedCount;
        subjectNotStarted += unit.notStartedCount;

        // Find highest priority actionable skill for recommendation
        if (!recommendedSkill) {
          const repairSkill = unit.skills.find((s: CurriculumSkillWithEvidence) => s.state === "NEEDS_REPAIR");
          if (repairSkill) {
            recommendedSkill = {
              label: "إصلاح خطأ عاجل",
              skillId: repairSkill.skillId,
              skillTitleAr: repairSkill.title_ar,
              actionText: "صلح الخطأ 🔧",
              actionType: "repair",
            };
          } else {
            const retestSkill = unit.skills.find((s: CurriculumSkillWithEvidence) => s.state === "RETEST_READY");
            if (retestSkill) {
              recommendedSkill = {
                label: "اختبار تثبيت جاهز",
                skillId: retestSkill.skillId,
                skillTitleAr: retestSkill.title_ar,
                actionText: "عاود الاختبار 🧪",
                actionType: "retest",
              };
            } else {
              const startSkill = unit.skills.find((s: CurriculumSkillWithEvidence) => s.state === "STARTED" || s.state === "NOT_STARTED");
              if (startSkill) {
                recommendedSkill = {
                  label: "الخطوة التالية الموصى بها",
                  skillId: startSkill.skillId,
                  skillTitleAr: startSkill.title_ar,
                  actionText: "تدرب الآن 🎯",
                  actionType: "practice",
                };
              }
            }
          }
        }

        compiledUnits.push(unit);
      }

      compiledUnits.sort((a, b) => a.order - b.order);

      const totalSkills = subjectSkills.length;
      const masteryPercentage =
        totalSkills > 0 ? Math.round((subjectDemonstrated / totalSkills) * 100) : 0;

      totalStreamSkills += totalSkills;
      totalStreamDemonstrated += subjectDemonstrated;
      totalStreamNeedsRepair += subjectNeedsRepair;
      totalStreamRetestReady += subjectRetestReady;

      compiledSubjects.push({
        subjectId,
        name_ar: subMeta.nameAr,
        name_fr: subMeta.nameFr,
        hexColor: subMeta.hexColor,
        coefficient: rule.coefficient,
        isCore: rule.isCoreSubject,
        units: compiledUnits,
        totalSkills,
        demonstratedCount: subjectDemonstrated,
        needsRepairCount: subjectNeedsRepair,
        retestReadyCount: subjectRetestReady,
        startedCount: subjectStarted,
        notStartedCount: subjectNotStarted,
        masteryPercentage,
        recommendedAction: recommendedSkill,
      });
    }

    const overallMasteryPercentage =
      totalStreamSkills > 0
        ? Math.round((totalStreamDemonstrated / totalStreamSkills) * 100)
        : 0;

    const streamInfo = ALGERIAN_BAC_STREAMS[streamId];

    return {
      streamId,
      streamNameAr: streamInfo?.name_ar || streamId,
      subjects: compiledSubjects,
      totalSkillsCount: totalStreamSkills,
      demonstratedSkillsCount: totalStreamDemonstrated,
      needsRepairSkillsCount: totalStreamNeedsRepair,
      retestReadySkillsCount: totalStreamRetestReady,
      overallMasteryPercentage,
    };
  },
};
