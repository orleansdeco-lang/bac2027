import { DiagnosticAnalysisResult } from "@/types/diagnostic";
import { Mission, Skill } from "@/types/mission";
import { SCIENCES_EXP_SKILLS, getSkillById, getSkillsForSubject } from "@/data/skills";
import {
  getPracticeQuestionsForSkill,
  getRetestQuestionForSkill,
} from "@/data/practice/sciences-exp";
import {
  saveMission,
  getMissionById,
  loadMissions,
  isSkillMastered,
  getRecurringErrors,
} from "./storage";

/**
 * Maps a diagnostic result deterministically to the first high-priority repair mission
 */
export function generateMissionFromDiagnostic(
  diagnosticResult: DiagnosticAnalysisResult
): Mission {
  const bottleneck = diagnosticResult.preliminaryBottleneck || diagnosticResult.primaryBottleneck;
  const subjectId = bottleneck.subjectId;
  const weakestDimension = bottleneck.dimension;
  const traps = diagnosticResult.misconceptionTraps || [];

  let selectedSkillId = "math_derivatives_chain_rule";

  if (subjectId === "math") {
    const hasChainTrap = traps.some((t) => (t.trapDetails?.trapId || "").includes("chain-rule"));
    const hasTviTrap = traps.some((t) => (t.trapDetails?.trapId || "").includes("tvi"));

    if (hasChainTrap || weakestDimension === "application") {
      selectedSkillId = "math_derivatives_chain_rule";
    } else if (hasTviTrap || weakestDimension === "understanding" || weakestDimension === "methodology") {
      selectedSkillId = "math_intermediate_value_method";
    } else {
      selectedSkillId = "math_sequence_reasoning";
    }
  } else if (subjectId === "physics") {
    const hasDecayTrap = traps.some((t) => (t.trapDetails?.trapId || "").includes("decay"));
    const hasProjTrap = traps.some((t) => (t.trapDetails?.trapId || "").includes("projection") || (t.trapDetails?.trapId || "").includes("trig"));

    if (hasProjTrap || weakestDimension === "application") {
      selectedSkillId = "physics_newton_projections";
    } else if (hasDecayTrap || weakestDimension === "understanding") {
      selectedSkillId = "physics_decay_half_life";
    } else {
      selectedSkillId = "physics_rc_time_constant";
    }
  } else if (subjectId === "natural_sciences") {
    const hasDocTrap = traps.some((t) => (t.trapDetails?.trapId || "").includes("document") || (t.trapDetails?.trapId || "").includes("rote"));
    const hasImmTrap = traps.some((t) => (t.trapDetails?.trapId || "").includes("lyse") || (t.trapDetails?.trapId || "").includes("immune"));

    if (hasDocTrap || weakestDimension === "methodology") {
      selectedSkillId = "snv_document_exploitation";
    } else if (hasImmTrap || weakestDimension === "understanding") {
      selectedSkillId = "snv_immunity_reasoning";
    } else {
      selectedSkillId = "snv_protein_synthesis";
    }
  }

  return buildMissionForSkill(selectedSkillId, "diagnostic_bottleneck", "high");
}

/**
 * Builds a deterministic Mission entity for a given skill
 */
export function buildMissionForSkill(
  skillId: string,
  source: "diagnostic_bottleneck" | "diagnostic_dimension" | "manual" = "manual",
  priority: "high" | "medium" | "low" = "medium"
): Mission {
  const skill = getSkillById(skillId) || SCIENCES_EXP_SKILLS.math_derivatives_chain_rule;
  const practiceQuestions = getPracticeQuestionsForSkill(skill.id);
  const retestQuestion = getRetestQuestionForSkill(skill.id);

  const practiceQuestionIds = practiceQuestions.map((q) => q.id);
  const retestQuestionIds = retestQuestion ? [retestQuestion.id] : [];

  const missionId = `mission-${skill.id}`;

  // Check if mission already exists in storage to preserve status
  const existing = getMissionById(missionId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();

  const mission: Mission = {
    id: missionId,
    educationLevel: "secondary",
    examType: "bac",
    streamId: "sciences_exp",
    subjectId: skill.subjectId,
    skillId: skill.id,
    title: skill.title_ar,
    description: skill.description_ar,
    reason: `التشخيص الأولي أظهر حاجة للترميم في [${skill.title_ar}].`,
    title_ar: `مهمة ترميم: ${skill.title_ar}`,
    title_fr: `Mission de réparation : ${skill.title_fr}`,
    description_ar: skill.description_ar,
    description_fr: skill.description_fr,
    reason_ar: `أظهر التشخيص الأولي أن هذه المهارة تمثل أولوية للترميم لكسر عائق البداية.`,
    reason_fr: `Le diagnostic initial indique que cette compétence constitue une priorité de remédiation.`,
    priority,
    source,
    status: "available",
    practiceQuestionIds,
    retestQuestionIds,
    estimatedMinutes: 15,
    createdAt: now,
    updatedAt: now,
  };

  saveMission(mission);
  return mission;
}

/**
 * Deterministically selects the next recommended mission based on evidence:
 * 1. High-priority unresolved errors (repair_needed or retest_ready)
 * 2. Recurring errors that have not reached demonstrated mastery
 * 3. Weakest dimension from diagnostic
 * 4. Next unmastered skill in the same subject
 * 5. Next unmastered skill in subsequent core subjects (by coefficient order)
 */
export function getNextRecommendedMission(
  currentMissionId?: string,
  diagnosticResult?: DiagnosticAnalysisResult | null
): Mission | null {
  const allMissions = Object.values(loadMissions());

  // Priority 1: High-priority unresolved errors in existing missions
  const unresolvedMissions = allMissions.filter(
    (m) =>
      m.id !== currentMissionId &&
      (m.status === "repair_needed" || m.status === "retest_ready") &&
      !isSkillMastered(m.skillId)
  );

  if (unresolvedMissions.length > 0) {
    unresolvedMissions.sort((a, b) => (a.priority === "high" ? -1 : 1));
    return unresolvedMissions[0];
  }

  // Priority 2: Recurring errors that have not reached demonstrated mastery
  const recurringErrors = getRecurringErrors();
  const unmasteredRecurring = recurringErrors.find(
    (e) => !isSkillMastered(e.skillId) && (!currentMissionId || e.missionId !== currentMissionId)
  );

  if (unmasteredRecurring) {
    return buildMissionForSkill(unmasteredRecurring.skillId, "manual", "high");
  }

  // Priority 3: Weakest dimension from diagnostic
  if (diagnosticResult) {
    const weakestDimension =
      diagnosticResult.preliminaryBottleneck?.dimension ||
      diagnosticResult.primaryBottleneck?.dimension;

    if (weakestDimension) {
      const dimensionSkill = Object.values(SCIENCES_EXP_SKILLS).find(
        (s) =>
          s.dimensions.includes(weakestDimension) &&
          !isSkillMastered(s.id) &&
          (!currentMissionId || `mission-${s.id}` !== currentMissionId)
      );

      if (dimensionSkill) {
        return buildMissionForSkill(dimensionSkill.id, "diagnostic_dimension", "medium");
      }
    }
  }

  // Priority 4: Next unmastered skill in the same subject
  let currentSubjectId = "math";
  if (currentMissionId) {
    const currentMission = getMissionById(currentMissionId);
    if (currentMission) {
      currentSubjectId = currentMission.subjectId;
    }
  } else if (diagnosticResult) {
    currentSubjectId =
      diagnosticResult.preliminaryBottleneck?.subjectId ||
      diagnosticResult.primaryBottleneck?.subjectId ||
      "math";
  }

  const sameSubjectSkills = getSkillsForSubject(currentSubjectId);
  const nextSameSubjectSkill = sameSubjectSkills.find(
    (s) => !isSkillMastered(s.id) && (!currentMissionId || `mission-${s.id}` !== currentMissionId)
  );

  if (nextSameSubjectSkill) {
    return buildMissionForSkill(nextSameSubjectSkill.id, "manual", "medium");
  }

  // Priority 5: Next unmastered skill in core subjects (natural_sciences, physics, math)
  const coreSubjects = ["natural_sciences", "physics", "math"];
  for (const subj of coreSubjects) {
    const subjSkills = getSkillsForSubject(subj);
    const candidate = subjSkills.find(
      (s) => !isSkillMastered(s.id) && (!currentMissionId || `mission-${s.id}` !== currentMissionId)
    );
    if (candidate) {
      return buildMissionForSkill(candidate.id, "manual", "medium");
    }
  }

  // Fallback: any unmastered skill
  const anyUnmastered = Object.values(SCIENCES_EXP_SKILLS).find(
    (s) => !isSkillMastered(s.id)
  );

  if (anyUnmastered) {
    return buildMissionForSkill(anyUnmastered.id, "manual", "low");
  }

  return null;
}

/**
 * Returns all available missions for a stream
 */
export function getAllAvailableMissionsForStream(streamId: string): Mission[] {
  if (streamId !== "sciences_exp") return [];
  return Object.keys(SCIENCES_EXP_SKILLS).map((skillId) =>
    buildMissionForSkill(skillId, "manual", "medium")
  );
}
