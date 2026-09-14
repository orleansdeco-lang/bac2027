/**
 * BAC Mastery - Mission Application Service
 * Orchestrates the full 8-step mission execution loop with persistent state transitions
 */

import { Mission, PracticeResponse, ErrorRecord, MasteryEvidence } from "@/types/mission";
import {
  MissionRepository,
  PracticeRepository,
  ErrorRepository,
  RepairRepository,
  RetestRepository,
  MasteryRepository,
  StudentRepository,
} from "@/lib/repositories";
import { ContentService } from "./content-service";
import { loadMissions, saveMission, setActiveMissionId, getActiveMissionId } from "@/lib/mission/storage";
import { getComputedAdaptiveRoadmap, getNextBestMission } from "@/lib/roadmap";
import { SubjectId, StreamId } from "@/types/education";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";

export const MissionService = {
  /**
   * Get mission by ID with full content bundle
   */
  async getMissionWithBundle(missionId: string, userId?: string) {
    const missions = await MissionRepository.getMissions(userId);
    let mission = missions[missionId];

    // If mission not found by ID, find by skillId or construct default
    if (!mission) {
      const skillId = missionId.startsWith("mission-") ? missionId.replace("mission-", "") : missionId;
      mission = Object.values(missions).find((m) => m.skillId === skillId) as Mission;
    }

    const skillId = mission?.skillId || (missionId.startsWith("mission-") ? missionId.replace("mission-", "") : missionId);
    const bundle = ContentService.getBundle(skillId);

    // If mission still not found in store, create default mission from bundle
    if (!mission && bundle) {
      let resolvedStream: StreamId = (bundle.skill as any).streamId || "sciences_exp";
      if (userId) {
        const p = await StudentRepository.getProfile(userId);
        if (p?.streamId) {
          resolvedStream = normalizeStreamIdWithDefault(p.streamId, resolvedStream);
        }
      }

      mission = {
        id: `mission-${skillId}`,
        educationLevel: "secondary",
        examType: "bac",
        streamId: resolvedStream,
        subjectId: bundle.skill.subjectId,
        skillId: bundle.skill.id,
        title: bundle.skill.title_ar,
        description: bundle.skill.description_ar,
        reason: "أظهر التقييم أن هذه المهارة تمثل أولوية في المسار الدراسي.",
        title_ar: `مهمة: ${bundle.skill.title_ar}`,
        title_fr: `Mission : ${bundle.skill.title_fr}`,
        description_ar: bundle.skill.description_ar,
        description_fr: bundle.skill.description_fr,
        reason_ar: "أظهر التقييم أن هذه المهارة تمثل أولوية في المسار الدراسي.",
        reason_fr: "L'évaluation indique que cette compétence constitue une priorité dans le parcours.",
        priority: "high",
        source: "diagnostic_bottleneck",
        status: "available",
        practiceQuestionIds: bundle.practiceQuestions.map((q) => q.id),
        retestQuestionIds: bundle.retest ? [bundle.retest.id] : [],
        estimatedMinutes: bundle.lesson?.estimatedMinutes || 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await MissionRepository.saveMissions({ [mission.id]: mission }, userId);
    }

    return {
      mission,
      bundle,
    };
  },

  /**
   * Record practice question response and persist attempt
   */
  async recordPracticeAttempt(params: {
    missionId: string;
    skillId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    confidence: 1 | 2 | 3 | 4 | 5;
    timeSpentSeconds: number;
    userId?: string;
  }) {
    const response: PracticeResponse = {
      questionId: params.questionId,
      selectedAnswer: params.selectedAnswer,
      isCorrect: params.isCorrect,
      confidence: params.confidence,
      responseTimeSeconds: params.timeSpentSeconds,
    };

    const session = {
      id: `session-${Date.now()}`,
      missionId: params.missionId,
      questionIds: [params.questionId],
      currentQuestionIndex: 0,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      responses: [response],
      status: (params.isCorrect ? "completed" : "repair_needed") as "completed" | "repair_needed",
      isRetest: false,
    };

    await PracticeRepository.savePracticeSession(session, params.userId, params.skillId);

    // If correct on first try, mark skill as emerging
    if (params.isCorrect) {
      const masteryEvidence: MasteryEvidence = {
        missionId: params.missionId,
        skillId: params.skillId,
        subjectId: (params.skillId.split("_")[0] || "general") as SubjectId,
        evidenceType: "practice_success",
        practiceAttempts: 1,
        correctAttempts: 1,
        retestAttempts: 0,
        successfulRetests: 0,
        confidenceSignals: [params.confidence],
        masteryStatus: "emerging",
        achievedAt: new Date().toISOString(),
      };
      await MasteryRepository.saveMasteryRecord(masteryEvidence, params.userId);
    }

    return { response, session };
  },

  /**
   * Record an error in Error Lab and update mission status to repair_needed
   */
  async recordError(params: {
    missionId: string;
    skillId: string;
    questionId: string;
    subjectId: SubjectId;
    suspectedErrorType: string;
    selectedAnswer?: string;
    correctAnswer?: string;
    confidence?: 1 | 2 | 3 | 4 | 5;
    userId?: string;
  }): Promise<ErrorRecord> {
    const errorRecord: ErrorRecord = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sessionId: `session-${params.missionId}`,
      missionId: params.missionId,
      skillId: params.skillId,
      questionId: params.questionId,
      subjectId: params.subjectId,
      selectedAnswer: params.selectedAnswer || "",
      correctAnswer: params.correctAnswer || "",
      confidence: params.confidence || 3,
      suspectedErrorType: (params.suspectedErrorType || "misunderstood_concept") as any,
      errorSource: "system_inferred",
      repairStatus: "identified",
      isRecurring: false,
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ErrorRepository.saveError(errorRecord, params.userId);
    await MissionRepository.updateMissionStatus(params.missionId, "repair_needed", params.userId);

    return errorRecord;
  },

  /**
   * Start repair process
   */
  async startRepair(errorId: string, errorRecord: ErrorRecord, userId?: string) {
    const updatedError: ErrorRecord = {
      ...errorRecord,
      repairStatus: "repair_started",
      updatedAt: new Date().toISOString(),
    };
    await ErrorRepository.saveError(updatedError, userId);

    await RepairRepository.saveRepair(
      {
        id: `repair-${errorId}`,
        errorId: errorId,
        userId: userId,
        stepsCompleted: ["step-1"],
        status: "in_progress",
        startedAt: new Date().toISOString(),
      },
      userId
    );

    return updatedError;
  },

  /**
   * Complete repair process
   */
  async completeRepair(errorId: string, errorRecord: ErrorRecord, reflection?: string, userId?: string) {
    const updatedError: ErrorRecord = {
      ...errorRecord,
      repairStatus: "repair_completed",
      updatedAt: new Date().toISOString(),
    };
    await ErrorRepository.saveError(updatedError, userId);

    if (updatedError.missionId) {
      await MissionRepository.updateMissionStatus(updatedError.missionId, "retest_ready", userId);
    }

    await RepairRepository.saveRepair(
      {
        id: `repair-${errorId}`,
        errorId: errorId,
        userId: userId,
        stepsCompleted: ["step-1", "step-2", "step-3", "step-4"],
        studentReflection: reflection,
        status: "completed",
        startedAt: errorRecord.createdAt,
        completedAt: new Date().toISOString(),
      },
      userId
    );

    return updatedError;
  },

  /**
   * Record retest outcome and update mastery accordingly
   */
  async recordRetestOutcome(params: {
    missionId: string;
    skillId: string;
    subjectId: SubjectId;
    errorRecord: ErrorRecord;
    practiceQuestionId: string;
    retestQuestionId: string;
    isPassed: boolean;
    selectedAnswer: string;
    confidence: number;
    userId?: string;
  }) {
    // 1. Save retest attempt
    await RetestRepository.saveRetest(
      {
        id: `retest-${Date.now()}`,
        errorId: params.errorRecord.id,
        userId: params.userId,
        skillId: params.skillId,
        practiceQuestionId: params.practiceQuestionId,
        retestQuestionId: params.retestQuestionId,
        isPassed: params.isPassed,
        selectedAnswer: params.selectedAnswer,
        confidence: params.confidence,
        attemptedAt: new Date().toISOString(),
      },
      params.userId
    );

    // 2. Update error status
    const newErrorStatus = params.isPassed ? "retest_passed" : "retest_failed";
    const updatedError: ErrorRecord = {
      ...params.errorRecord,
      repairStatus: newErrorStatus,
      updatedAt: new Date().toISOString(),
    };
    await ErrorRepository.saveError(updatedError, params.userId);

    // 3. Update mission and mastery states
    if (params.isPassed) {
      await MissionRepository.updateMissionStatus(params.missionId, "mastered", params.userId);

      const masteryEvidence: MasteryEvidence = {
        missionId: params.missionId,
        skillId: params.skillId,
        subjectId: params.subjectId,
        evidenceType: "repair_retest_success",
        practiceAttempts: 1,
        correctAttempts: 0,
        retestAttempts: 1,
        successfulRetests: 1,
        confidenceSignals: [params.confidence],
        masteryStatus: "demonstrated",
        achievedAt: new Date().toISOString(),
        status: "mastered",
      };
      await MasteryRepository.saveMasteryRecord(masteryEvidence, params.userId);
    } else {
      await MissionRepository.updateMissionStatus(params.missionId, "needs_more_work", params.userId);
    }

    return {
      isPassed: params.isPassed,
      errorRecord: updatedError,
    };
  },
};
