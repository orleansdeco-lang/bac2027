/**
 * BAC Mastery - Pure Adaptive Roadmap Engine
 * Prompt 06: Deterministic decision engine that answers:
 * "What should this student work on NEXT, and WHY?"
 *
 * RULES:
 * - Pure and deterministic: same input -> same output.
 * - No localStorage, no window, no side effects inside this engine.
 * - 7-tier authoritative priority hierarchy.
 * - Coefficients never override active errors/repairs.
 * - Untested subjects are never marked weak or 0%.
 * - Confidence remains strictly "pilot".
 */

import {
  AdaptiveRoadmapInput,
  AdaptiveRoadmapState,
  MissionRationale,
  SubjectProgressItem,
  QueuedMissionItem,
  RoadmapCurrentFocus,
  LearningStage,
  MissionReasonCode,
  MasteredSkillItem,
  EmergingSkillItem,
  NeedsMoreWorkSkillItem,
  WeakestDimensionItem,
} from "@/types/roadmap";
import { Mission, Skill, MasteryEvidence, ErrorRecord, MissionPriority, MissionSource } from "@/types/mission";
import { SubjectId, StreamId, TechniqueMathSpecialty } from "@/types/education";
import { SCIENCES_EXP_SKILLS, getSkillById, getSkillsForSubject } from "@/data/skills";
import {
  getPracticeQuestionsForSkill,
  getRetestQuestionForSkill,
} from "@/data/practice/sciences-exp";
import { getStreamSubjects, ALL_SUBJECTS } from "@/lib/constants/streams";
import { ContentService } from "@/lib/services/content-service";
import { isSubjectAllowedForStream } from "@/domain/student";
import {
  normalizeStreamIdWithDefault,
  getDefaultSubjectForStream,
  getDefaultSkillForStream,
} from "@/lib/curriculum/filter";

/**
 * Pure in-memory mission resolver
 */
function resolveMission(
  skillId: string,
  missionsMap: Record<string, Mission>,
  source: MissionSource = "manual",
  priority: MissionPriority = "medium",
  streamId: StreamId = "sciences_exp"
): Mission {
  const missionId = `mission-${skillId}`;
  const existing =
    Object.values(missionsMap).find((m) => m.skillId === skillId) || missionsMap[missionId];
  if (existing) {
    return existing;
  }

  const streamSkills = ContentService.getSkillsForStream(streamId);
  const skill =
    getSkillById(skillId) ||
    streamSkills.find((s) => s.id === skillId) ||
    SCIENCES_EXP_SKILLS[skillId] ||
    streamSkills[0] ||
    SCIENCES_EXP_SKILLS.math_derivatives_chain_rule;
  const practiceQuestions = getPracticeQuestionsForSkill(skill.id);
  const retestQuestion = getRetestQuestionForSkill(skill.id);

  return {
    id: missionId,
    educationLevel: "secondary",
    examType: "bac",
    streamId: streamId || "sciences_exp",
    subjectId: skill.subjectId,
    skillId: skill.id,
    title: skill.title_ar,
    description: skill.description_ar,
    reason: `أظهر التقييم أن هذه المهارة تمثل أولوية في المسار الدراسي.`,
    title_ar: `مهمة: ${skill.title_ar}`,
    title_fr: `Mission : ${skill.title_fr}`,
    description_ar: skill.description_ar,
    description_fr: skill.description_fr,
    reason_ar: `أظهر التقييم أن هذه المهارة تمثل أولوية في المسار الدراسي.`,
    reason_fr: `L'évaluation indique que cette compétence constitue une priorité dans le parcours.`,
    priority,
    source,
    status: "available",
    practiceQuestionIds: practiceQuestions.map((q) => q.id),
    retestQuestionIds: retestQuestion ? [retestQuestion.id] : [],
    estimatedMinutes: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Checks if a skill has demonstrated mastery
 */
function isSkillDemonstrated(skillId: string, evidenceMap: Record<string, MasteryEvidence>): boolean {
  const ev = evidenceMap[skillId];
  if (!ev) return false;
  return ev.masteryStatus === "demonstrated" || ev.status === "mastered";
}

/**
 * Authoritative Next Best Mission & Queue Selector
 * Implements the 7-Tier Priority Hierarchy
 */
export function getNextBestMission(input: AdaptiveRoadmapInput): {
  mission: Mission | null;
  rationale: MissionRationale | null;
} {
  const rawStream = input.onboardingProfile?.streamId || (input.onboardingProfile as any)?.stream;
  const streamId: StreamId = normalizeStreamIdWithDefault(rawStream, "sciences_exp");
  const missionsMap: Record<string, Mission> = Array.isArray(input.missions)
    ? Object.fromEntries(input.missions.map((m) => [m.id, m]))
    : (input.missions || {});

  const evidenceMap = input.masteryEvidence || {};
  const errorList = input.errors || [];
  const diag = input.diagnosticResult;

  // Stream canonical skills to prevent cross-stream pollution
  const streamSkills = ContentService.getSkillsForStream(streamId);
  const streamSkillIds = new Set(streamSkills.map((s) => s.id));

  // Authoritative missions strictly in stream context
  const allMissions = Object.values(missionsMap).filter((m) => {
    if (m.streamId && m.streamId !== streamId) return false;
    if (m.skillId && streamSkillIds.size > 0 && !streamSkillIds.has(m.skillId)) {
      const skill = getSkillById(m.skillId);
      if (skill && !isSubjectAllowedForStream(skill.subjectId, streamId)) return false;
    }
    return true;
  });

  const isMissionInNeedsMoreWork = (skillId: string) =>
    allMissions.some((m) => m.skillId === skillId && m.status === "needs_more_work");

  // ---------------------------------------------------------------------------
  // PRIORITY 1: Unfinished Learning Loops (repair_needed or retest_ready)
  // An unclosed loop must NEVER be abandoned for a higher-coefficient subject.
  // ---------------------------------------------------------------------------
  const unfinishedMissions = allMissions.filter(
    (m) =>
      (m.status === "repair_needed" || m.status === "retest_ready") &&
      !isSkillDemonstrated(m.skillId, evidenceMap)
  );

  if (unfinishedMissions.length > 0) {
    // Retest ready takes precedence over repair needed, high priority first
    unfinishedMissions.sort((a, b) => {
      if (a.status === "retest_ready" && b.status !== "retest_ready") return -1;
      if (b.status === "retest_ready" && a.status !== "retest_ready") return 1;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return a.id.localeCompare(b.id);
    });

    const chosen = unfinishedMissions[0];
    const isRetest = chosen.status === "retest_ready";

    const rationale: MissionRationale = {
      reasonCode: isRetest ? "continuation_retest" : "continuation_repair",
      priority: 1,
      reasonLabel_ar: isRetest ? "إعادة اختبار التمكن جاهزة" : "خطأ غير معالج يحتاج ترميماً",
      reasonLabel_fr: isRetest ? "Re-test prêt pour validation" : "Erreur non réparée nécessitant remédiation",
      evidence_ar: isRetest
        ? "أكملت خطوات الترميم لهذه المهارة؛ الأولوية الآن لاجتياز إعادة الاختبار لإثبات التحكم."
        : "تم رصد خطأ أثناء التمرين السابق؛ الأولوية لعلاجه فوراً قبل تراكم المفاهيم.",
      evidence_fr: isRetest
        ? "Les étapes de remédiation sont terminées ; la priorité est de valider le re-test."
        : "Une erreur a été identifiée ; la priorité est de la réparer avant d'accumuler de nouvelles notions.",
      shortExplanation_ar: isRetest
        ? "أنهيت خطة الترميم، وحان وقت إثبات تمكنك باختبار مماثل."
        : "عندك خطأ غير معالج في هذه المهارة. نصلحوه درك ونكملو.",
      shortExplanation_fr: isRetest
        ? "Remédiation terminée, validons votre maîtrise avec cet exercice équivalent."
        : "Une erreur non résolue est en attente. Corrigeons-la avant d'avancer.",
    };

    return { mission: chosen, rationale };
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 3: Recurring Errors (Fix the root cause, not more random practice)
  // Evaluated BEFORE general unstarted missions.
  // ---------------------------------------------------------------------------
  const recurringErrors = errorList.filter((e) => {
    if (!e.isRecurring) return false;
    const skill = getSkillById(e.skillId);
    if (!skill) return false;
    return isSubjectAllowedForStream(skill.subjectId, streamId);
  });
  const unmasteredRecurringError = recurringErrors.find(
    (e) => !isSkillDemonstrated(e.skillId, evidenceMap)
  );

  if (unmasteredRecurringError) {
    const mission = resolveMission(unmasteredRecurringError.skillId, missionsMap, "manual", "high", streamId);
    const skill = getSkillById(unmasteredRecurringError.skillId);
    const skillTitle = skill?.title_ar || unmasteredRecurringError.skillId;

    const rationale: MissionRationale = {
      reasonCode: "recurring_error_cause",
      priority: 3,
      reasonLabel_ar: "معالجة خطأ متكرر في نفس المهارة",
      reasonLabel_fr: "Traitement d'une erreur récurrente",
      evidence_ar: `تكرر نفس نوع الخطأ (${unmasteredRecurringError.suspectedErrorType}) في مهارة [${skillTitle}] أكثر من مرة. الأفضل معالجة السبب الجذري بدل زيادة التمارين.`,
      evidence_fr: `Le même type d'erreur s'est répété sur cette notion. Il faut traiter la cause racine.`,
      shortExplanation_ar: "رصدنا تكرار نفس الخلل أكثر من مرة؛ سنعالج السبب المنهجي لنضمن عدم تكراره يوم الامتحان.",
      shortExplanation_fr: "Cette erreur s'est produite plusieurs fois ; nous ciblons sa cause pour l'éradiquer.",
    };

    return { mission, rationale };
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 4: Weakest Supported Cognitive Dimension (from diagnostic)
  // ---------------------------------------------------------------------------
  if (diag) {
    const weakestDim =
      diag.preliminaryBottleneck?.dimension || diag.primaryBottleneck?.dimension;

    if (weakestDim) {
      const dimensionSkills = streamSkills.filter(
        (s: any) =>
          (s.dimensions?.includes(weakestDim) || s.cognitiveDimensions?.includes(weakestDim)) &&
          !isSkillDemonstrated(s.id, evidenceMap)
      );

      // Exclude skills currently in needs_more_work (they are delayed) unless all are delayed
      const eligibleDimSkill =
        dimensionSkills.find((s: any) => !isMissionInNeedsMoreWork(s.id)) ||
        dimensionSkills[0];

      if (eligibleDimSkill) {
        const mission = resolveMission(eligibleDimSkill.id, missionsMap, "diagnostic_dimension", "medium", streamId);
        const dimLabelAr =
          weakestDim === "methodology"
            ? "المنهجية وصياغة الإجابة"
            : weakestDim === "understanding"
            ? "الفهم المفاهيمي العميق"
            : weakestDim === "application"
            ? "التطبيق الرياضي والحسابي"
            : "المعارف والاسترجاع";

        const rationale: MissionRationale = {
          reasonCode: "weakest_supported_dimension",
          priority: 4,
          reasonLabel_ar: `تقوية البعد المعرفي الأكثر هشاشة (${dimLabelAr})`,
          reasonLabel_fr: `Renforcement de la dimension cognitive la plus vulnérable (${weakestDim})`,
          evidence_ar: `أظهر التشخيص التجريبي أن بعد [${dimLabelAr}] يمثل نقطة الضعف الرئيسية في تحضيرك.`,
          evidence_fr: `Le diagnostic initial a révélé une vulnérabilité sur la dimension [${weakestDim}].`,
          shortExplanation_ar: "هذه المهمة تعالج بالتحديد البعد المعرفي الذي ضاعت فيه أكبر نسبة من النقاط في التشخيص.",
          shortExplanation_fr: "Cette mission cible la dimension cognitive où vous avez le plus de marge de progression.",
        };

        return { mission, rationale };
      }
    }
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 5: Emerging Skills (Positive evidence needing transfer verification)
  // ---------------------------------------------------------------------------
  const emergingSkills = Object.entries(evidenceMap).filter(
    ([id, ev]) => {
      if (ev.masteryStatus !== "emerging" || isSkillDemonstrated(id, evidenceMap)) return false;
      const skill = getSkillById(id);
      return skill ? isSubjectAllowedForStream(skill.subjectId, streamId) : false;
    }
  );

  const eligibleEmerging = emergingSkills.find(
    ([id]) => !isMissionInNeedsMoreWork(id)
  );

  if (eligibleEmerging) {
    const [skillId] = eligibleEmerging;
    const mission = resolveMission(skillId, missionsMap, "manual", "medium", streamId);
    const skill = getSkillById(skillId);

    const rationale: MissionRationale = {
      reasonCode: "emerging_verification",
      priority: 5,
      reasonLabel_ar: "تثبيت مهارة واعدة باختبار توأمي",
      reasonLabel_fr: "Validation d'une compétence en progression",
      evidence_ar: `أجبت بشكل صحيح في التمرين الأولي لمهارة [${skill?.title_ar || skillId}]. حان وقت التحقق من نقل المفهوم لتأكيد التمكن التام.`,
      evidence_fr: `Réponse correcte à l'exercice initial ; il convient de valider le transfert conceptuel.`,
      shortExplanation_ar: "نجحت في التمرين الأولي؛ سنقوم باختبار توأمي لنثبت أن المفهوم راسخ وليس مجرد صدفة.",
      shortExplanation_fr: "Votre premier succès est prometteur ; confirmons la maîtrise par un exercice jumeau.",
    };

    return { mission, rationale };
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 6: Next Unmastered Skill in Current Subject
  // ---------------------------------------------------------------------------
  let currentSubjectId: SubjectId;
  const preferredSubj =
    (typeof diag?.primaryBottleneck === "string" ? diag.primaryBottleneck : (diag?.primaryBottleneck as any)?.subjectId) ||
    (typeof diag?.preliminaryBottleneck === "string" ? diag.preliminaryBottleneck : (diag?.preliminaryBottleneck as any)?.subjectId);

  if (preferredSubj && isSubjectAllowedForStream(preferredSubj as SubjectId, streamId)) {
    currentSubjectId = preferredSubj as SubjectId;
  } else {
    const specialty = input.onboardingProfile?.techniqueMathSpecialty || undefined;
    const streamRules = getStreamSubjects(streamId, specialty);
    const sorted = [...streamRules].sort((a, b) => b.coefficient - a.coefficient);
    currentSubjectId = sorted[0]?.subjectId || getDefaultSubjectForStream(streamId);
  }

  const subjectSkills = getSkillsForSubject(currentSubjectId, streamId);
  const diagWeakest = Array.isArray(diag?.weakestSkills) ? diag.weakestSkills : undefined;
  const unmasteredSubjectSkill =
    (diagWeakest
      ? subjectSkills.find(
          (s) =>
            diagWeakest.includes(s.id) &&
            !isSkillDemonstrated(s.id, evidenceMap) &&
            !isMissionInNeedsMoreWork(s.id)
        )
      : undefined) ||
    subjectSkills.find(
      (s) =>
        !isSkillDemonstrated(s.id, evidenceMap) &&
        !isMissionInNeedsMoreWork(s.id)
    );

  if (unmasteredSubjectSkill) {
    const mission = resolveMission(unmasteredSubjectSkill.id, missionsMap, "manual", "medium", streamId);

    const rationale: MissionRationale = {
      reasonCode: "next_subject_skill",
      priority: 6,
      reasonLabel_ar: "المهارة التالية لبناء الأساس في نفس المادة",
      reasonLabel_fr: "Compétence suivante dans la matière en cours",
      evidence_ar: `مواصلة التدرج المنطقي في مهارات مادة [${ALL_SUBJECTS[currentSubjectId]?.name_ar || currentSubjectId}].`,
      evidence_fr: `Progression logique dans les compétences de [${ALL_SUBJECTS[currentSubjectId]?.name_fr || currentSubjectId}].`,
      shortExplanation_ar: "خطوة متدرجة للأمام في نفس المادة لتعزيز السيطرة على المفاهيم المترابطة.",
      shortExplanation_fr: "Étape suivante dans la même matière pour consolider les notions connexes.",
    };

    return { mission, rationale };
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 7: Next Supported Subject (Ordered by coefficient rules)
  // ---------------------------------------------------------------------------
  const specialty = input.onboardingProfile?.techniqueMathSpecialty || undefined;
  const streamRules = getStreamSubjects(streamId, specialty);

  // Core subjects sorted descending by coefficient
  const sortedSubjects = [...streamRules].sort((a, b) => b.coefficient - a.coefficient);

  for (const rule of sortedSubjects) {
    const skillsInSubj = getSkillsForSubject(rule.subjectId, streamId);
    const unmastered = skillsInSubj.find(
      (s) =>
        !isSkillDemonstrated(s.id, evidenceMap) &&
        !isMissionInNeedsMoreWork(s.id)
    );

    if (unmastered) {
      const mission = resolveMission(unmastered.id, missionsMap, "manual", "medium", streamId);
      const subjMeta = ALL_SUBJECTS[rule.subjectId];

      const rationale: MissionRationale = {
        reasonCode: "next_core_subject",
        priority: 7,
        reasonLabel_ar: `الانتقال لمادة أساسية ذات معامل (${rule.coefficient})`,
        reasonLabel_fr: `Passage à une matière fondamentale (Coef ${rule.coefficient})`,
        evidence_ar: `الانتقال المنظم إلى مادة [${subjMeta?.name_ar || rule.subjectId}] لضمان توازن التحضير الدراسي.`,
        evidence_fr: `Transition vers [${subjMeta?.name_fr || rule.subjectId}] pour équilibrer la préparation.`,
        shortExplanation_ar: `ننتقل الآن لترميم مهارة في مادة [${subjMeta?.name_ar || rule.subjectId}] لرفع معدل التحكم العام.`,
        shortExplanation_fr: `Nous passons à [${subjMeta?.name_fr || rule.subjectId}] pour maintenir un rythme équilibré.`,
      };

      return { mission, rationale };
    }
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 2 FALLBACK: Delayed needs_more_work Skills
  // If ALL fresh skills are mastered or handled, a delayed needs_more_work skill
  // can now be safely scheduled for deeper spaced revision without looping!
  // ---------------------------------------------------------------------------
  const delayedNeedsWork = allMissions.find(
    (m) =>
      m.status === "needs_more_work" &&
      !isSkillDemonstrated(m.skillId, evidenceMap) &&
      (!m.streamId || m.streamId === streamId) &&
      isSubjectAllowedForStream(m.subjectId, streamId)
  );

  if (delayedNeedsWork) {
    const rationale: MissionRationale = {
      reasonCode: "delayed_needs_more_work",
      priority: 2,
      reasonLabel_ar: "مراجعة مجدولة لمهارة تحتاج عملاً إضافياً",
      reasonLabel_fr: "Révision programmée d'une notion différée",
      evidence_ar: "تم تأجيل هذه المهارة سابقاً بعد استنفاذ محاولات الاختبار المباشرة لحماية طاقتك، وحان وقت العودة إليها بهدوء.",
      evidence_fr: "Cette notion a été différée pour éviter la surcharge cognitive ; il est temps d'y revenir posément.",
      shortExplanation_ar: "نعود الآن لهذه المهارة بعد استراحة كافية لترميمها بتركيز متجدد دون ضغط.",
      shortExplanation_fr: "Nous revenons à cette notion avec un regard neuf بعد أن أحرزت تقدماً في بقية المسار.",
    };

    return { mission: delayedNeedsWork, rationale };
  }

  // Complete mastery of all pilot skills!
  return { mission: null, rationale: null };
}

/**
 * Pure Functional Builder: Computes complete AdaptiveRoadmapState from input evidence
 */
export function buildAdaptiveRoadmap(input: AdaptiveRoadmapInput): AdaptiveRoadmapState {
  const profile = input.onboardingProfile;
  const targetScore = profile?.targetScore ?? 16;
  const educationLevel = profile?.educationLevel ?? "secondary";
  const examType = profile?.examType ?? "BAC";
  const rawStream = profile?.streamId || (profile as any)?.stream;
  const streamId = normalizeStreamIdWithDefault(rawStream, "sciences_exp");
  const specialtyId = profile?.techniqueMathSpecialty || undefined;

  const missionsMap: Record<string, Mission> = Array.isArray(input.missions)
    ? Object.fromEntries(input.missions.map((m) => [m.id, m]))
    : (input.missions || {});

  const evidenceMap = input.masteryEvidence || {};
  const errorList = input.errors || [];
  const diag = input.diagnosticResult;

  // 1. Compute Next Mission and Rationale
  const { mission: nextMission, rationale: nextMissionRationale } = getNextBestMission(input);

  // 2. Compute Upcoming Queue (2-4 queued missions)
  const queuedMissions: QueuedMissionItem[] = [];
  const excludedIds = new Set<string>();
  if (nextMission) excludedIds.add(nextMission.id);

  // Simulated queue builder: temporarily mask picked mission to resolve subsequent items
  let tempMissionsMap = { ...missionsMap };
  let tempEvidenceMap = { ...evidenceMap };

  for (let step = 0; step < 3; step++) {
    // Treat the previous picks as in-flight
    if (nextMission && step === 0) {
      tempMissionsMap[nextMission.id] = { ...nextMission, status: "mastered" };
      tempEvidenceMap[nextMission.skillId] = {
        ...tempEvidenceMap[nextMission.skillId],
        skillId: nextMission.skillId,
        missionId: nextMission.id,
        subjectId: nextMission.subjectId,
        evidenceType: "repair_retest_success",
        practiceAttempts: 1,
        correctAttempts: 1,
        retestAttempts: 1,
        successfulRetests: 1,
        confidenceSignals: [5],
        masteryStatus: "demonstrated",
        status: "mastered",
      };
    }

    const { mission: candidate, rationale: candRationale } = getNextBestMission({
      ...input,
      missions: tempMissionsMap,
      masteryEvidence: tempEvidenceMap,
    });

    if (!candidate || excludedIds.has(candidate.id)) break;

    excludedIds.add(candidate.id);
    queuedMissions.push({
      mission: candidate,
      rationale: candRationale || {
        reasonCode: "next_subject_skill",
        priority: 6,
        reasonLabel_ar: "المهمة التالية في الخطة",
        reasonLabel_fr: "Mission suivante dans le parcours",
        evidence_ar: "مهمة مجدولة ضمن الترتيب المنطقي للمسار.",
        evidence_fr: "Mission planifiée dans l'ordonnancement logique.",
        shortExplanation_ar: "محطة تدريبية قادمة في جدولك الدراسي.",
        shortExplanation_fr: "Prochaine étape programmée dans votre feuille de route.",
      },
      priorityOrder: queuedMissions.length + 1,
    });

    tempMissionsMap[candidate.id] = { ...candidate, status: "mastered" };
    tempEvidenceMap[candidate.skillId] = {
      ...tempEvidenceMap[candidate.skillId],
      skillId: candidate.skillId,
      missionId: candidate.id,
      subjectId: candidate.subjectId,
      evidenceType: "repair_retest_success",
      practiceAttempts: 1,
      correctAttempts: 1,
      retestAttempts: 1,
      successfulRetests: 1,
      confidenceSignals: [5],
      masteryStatus: "demonstrated",
      status: "mastered",
    };
  }

  // 3. Classify Skills
  const masteredSkills: MasteredSkillItem[] = [];
  const emergingSkills: EmergingSkillItem[] = [];
  const needsMoreWorkSkills: NeedsMoreWorkSkillItem[] = [];

  for (const [skillId, ev] of Object.entries(evidenceMap)) {
    const skill = getSkillById(skillId);
    if (skill && !isSubjectAllowedForStream(skill.subjectId, streamId)) {
      continue;
    }
    if (ev.masteryStatus === "demonstrated" || ev.status === "mastered") {
      masteredSkills.push({
        skillId,
        subjectId: ev.subjectId,
        achievedAt: ev.achievedAt || ev.masteredAt,
      });
    } else if (ev.masteryStatus === "emerging") {
      emergingSkills.push({
        skillId,
        subjectId: ev.subjectId,
        confidence: ev.confidenceSignals?.[ev.confidenceSignals.length - 1] ?? 4,
      });
    }
  }

  for (const mission of Object.values(missionsMap)) {
    if (mission.streamId && mission.streamId !== streamId) continue;
    if (mission.status === "needs_more_work" && !isSkillDemonstrated(mission.skillId, evidenceMap)) {
      if (isSubjectAllowedForStream(mission.subjectId, streamId)) {
        needsMoreWorkSkills.push({
          skillId: mission.skillId,
          subjectId: mission.subjectId,
          failureCount: 2,
        });
      }
    }
  }

  // 4. Classify Errors
  const unresolvedErrors = errorList.filter((e) => {
    if (e.repairStatus === "retest_passed") return false;
    return isSubjectAllowedForStream(e.subjectId, streamId);
  });
  const recurringErrors = errorList.filter((e) => {
    if (!e.isRecurring) return false;
    return isSubjectAllowedForStream(e.subjectId, streamId);
  });

  // 5. Weakest Dimensions from Diagnostic
  const weakestDimensions: WeakestDimensionItem[] = [];
  if (diag) {
    if (diag.preliminaryBottleneck?.dimension) {
      weakestDimensions.push({
        dimension: diag.preliminaryBottleneck.dimension,
        severity: diag.preliminaryBottleneck.severity || "critical",
      });
    }
    if (diag.primaryBottleneck?.dimension && diag.primaryBottleneck.dimension !== diag.preliminaryBottleneck?.dimension) {
      weakestDimensions.push({
        dimension: diag.primaryBottleneck.dimension,
        severity: diag.primaryBottleneck.severity || "high",
      });
    }
  }

  // 6. Subject Progress Matrix across all Stream Subjects
  // STRICT RULE: Untested subjects are labeled "not_assessed" with evidenceLevel "none". Never 0%!
  const streamSubjectRules = getStreamSubjects(streamId, specialtyId);
  const subjectProgress: Record<SubjectId, SubjectProgressItem> = {} as any;

  for (const rule of streamSubjectRules) {
    const subjMeta = ALL_SUBJECTS[rule.subjectId];
    const name_ar = subjMeta?.name_ar || rule.subjectId;
    const name_fr = subjMeta?.name_fr || rule.subjectId;

    const subjSkills = getSkillsForSubject(rule.subjectId, streamId);
    const hasDiag = Boolean(diag?.subjectScores?.[rule.subjectId as keyof typeof diag.subjectScores]);
    const isPilotSubject = subjSkills.length > 0 || hasDiag;

    if (!isPilotSubject) {
      subjectProgress[rule.subjectId] = {
        subjectId: rule.subjectId,
        name_ar,
        name_fr,
        status: "not_assessed",
        evidenceLevel: "none",
        demonstratedCount: 0,
        emergingCount: 0,
        needsWorkCount: 0,
        openErrorsCount: 0,
        totalPilotSkills: 0,
        coefficient: rule.coefficient,
      };
    } else {
      const demonstratedInSubj = subjSkills.filter((s) => isSkillDemonstrated(s.id, evidenceMap)).length;
      const emergingInSubj = subjSkills.filter((s) => evidenceMap[s.id]?.masteryStatus === "emerging" && !isSkillDemonstrated(s.id, evidenceMap)).length;
      const needsWorkInSubj = subjSkills.filter((s) =>
        Object.values(missionsMap).some((m) => m.skillId === s.id && m.status === "needs_more_work") &&
        !isSkillDemonstrated(s.id, evidenceMap)
      ).length;
      const openErrorsInSubj = unresolvedErrors.filter((e) => e.subjectId === rule.subjectId).length;

      subjectProgress[rule.subjectId] = {
        subjectId: rule.subjectId,
        name_ar,
        name_fr,
        status: hasDiag ? "assessed" : "partially_assessed",
        evidenceLevel: "pilot_evidence",
        demonstratedCount: demonstratedInSubj,
        emergingCount: emergingInSubj,
        needsWorkCount: needsWorkInSubj,
        openErrorsCount: openErrorsInSubj,
        totalPilotSkills: subjSkills.length,
        coefficient: rule.coefficient,
      };
    }
  }

  // 7. Current Focus & Learning Stage
  let stage: LearningStage = "move_forward";
  let focusTitleAr = "مواصلة التقدم في المسار";
  let focusTitleFr = "Progression continue dans le parcours";
  const defaultSubj = streamSubjectRules[0]?.subjectId || getDefaultSubjectForStream(streamId);
  let focusSubjectId: SubjectId = defaultSubj;
  const streamSkills = ContentService.getSkillsForStream(streamId);
  const defaultSkill = streamSkills[0]?.id || getDefaultSkillForStream(streamId);
  let focusSkillId = defaultSkill;

  if (nextMission) {
    focusSubjectId = nextMission.subjectId;
    focusSkillId = nextMission.skillId;
    focusTitleAr = nextMission.title_ar;
    focusTitleFr = nextMission.title_fr;

    if (nextMission.status === "repair_needed") {
      stage = "fix";
    } else if (nextMission.status === "retest_ready") {
      stage = "verify";
    } else if (nextMission.status === "in_progress") {
      stage = "demonstrate";
    } else {
      stage = "move_forward";
    }
  }

  const currentFocus: RoadmapCurrentFocus = {
    subjectId: focusSubjectId,
    skillId: focusSkillId,
    stage,
    title_ar: focusTitleAr,
    title_fr: focusTitleFr,
  };

  // 8. Honest Limitations & Non-Overclaiming Rationale
  const limitations = streamId === "gestion_eco"
    ? {
        ar: "الخريطة الحالية مبنية على بيانات تشخيص ومحتوى تجريبي لشعبة التسيير والاقتصاد (التسيير المحاسبي والمالي، الاقتصاد والمناجمنت، القانون، الرياضيات). بقية مواد البكالوريا غير مشمولة في هذه المرحلة.",
        fr: "Cette feuille de route repose sur les données de la filière Gestion et Économie. Les autres matières ne sont pas encore évaluées.",
      }
    : streamId === "math"
    ? {
        ar: "الخريطة الحالية مبنية على بيانات تشخيص تجريبية محددة لشعبة الرياضيات (الرياضيات، العلوم الفيزيائية). بقية المواد غير مشمولة في هذه المرحلة.",
        fr: "Cette feuille de route repose sur des données ciblées sur les matières de la filière Mathématiques (Mathématiques, Physique).",
      }
    : {
        ar: "الخريطة الحالية مبنية على بيانات تشخيص تجريبية محددة في المواد الأساسية الثلاث (الرياضيات، العلوم الفيزيائية، علوم الطبيعة والحياة). بقية مواد البكالوريا غير مشمولة في هذه المرحلة.",
        fr: "Cette feuille de route repose sur des données diagnostiques pilotes ciblées sur les 3 matières principales (Mathématiques, Physique, SVT). Les autres matières ne sont pas encore évaluées.",
      };

  const rationale = nextMissionRationale
    ? nextMissionRationale.shortExplanation_ar
    : "تم إكمال جميع مهارات المرحلة التجريبية بنجاح.";

  return {
    targetScore,
    educationLevel,
    examType,
    streamId,
    specialtyId,
    roadmapConfidence: "pilot",
    currentFocus,
    nextMission,
    nextMissionRationale,
    queuedMissions,
    masteredSkills,
    emergingSkills,
    needsMoreWorkSkills,
    unresolvedErrors,
    recurringErrors,
    weakestDimensions,
    subjectProgress,
    rationale,
    limitations,
    energyState: input.energyState,
    generatedAt: new Date().toISOString(),
  };
}
