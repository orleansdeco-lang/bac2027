/**
 * SHATER Study OS — Must-Win 3 Derivation Service
 * Phase 2: Computes the 3 highest-priority daily objectives grounded in REAL student telemetry.
 * Invariant: Never invent explanations; reason codes must derive from authentic pedagogical evidence.
 */

import { DashboardService } from "@/lib/services/dashboard-service";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { MasteryRepository } from "@/lib/repositories/mastery-repository";
import { DiagnosticRepository } from "@/lib/repositories/diagnostic-repository";
import { PlannerStorage } from "@/lib/planner/storage";
import { PlannerEvent } from "@/lib/planner/types";
import { getSubjectMeta } from "@/lib/focus/focus-engine";
import { ErrorRecord, MasteryEvidence } from "@/types/mission";

export type MustWinSourceType =
  | "shater_repair"
  | "shater_retest"
  | "shater_mission"
  | "personal_task";

export type MustWinWhyCategory =
  | "recurring_error"
  | "retest_ready"
  | "diagnostic_bottleneck"
  | "emerging_skill"
  | "curriculum_step"
  | "personal_commitment";

export interface MustWinItem {
  id: string;
  sourceType: MustWinSourceType;
  title: string;
  subjectId: string;
  subjectNameAr: string;
  subjectHex: string;
  skillId?: string;
  missionId?: string;
  plannerEventId?: string;
  estimatedMinutes: number;
  whyTextAr: string;
  whyCategory: MustWinWhyCategory;
  status: "pending" | "in_progress" | "completed";
  priorityOrder: number; // 1, 2, 3
  isCompleted: boolean;
}

export interface MustWinSummary {
  items: MustWinItem[];
  hasDiagnostic: boolean;
  hasEnoughData: boolean;
  totalEstimatedMinutes: number;
  completedCount: number;
}

export const MustWinService = {
  /**
   * Derives exactly up to 3 Must-Win objectives grounded in genuine data
   */
  async getMustWinObjectives(userId: string, todayIso?: string): Promise<MustWinSummary> {
    const targetDate = todayIso || new Date().toISOString().split("T")[0];

    // Fetch real data sources in parallel
    const [dashboardData, errorsMap, masteryMap, diagResult, plannerEvents] = await Promise.all([
      DashboardService.getDashboardData(userId).catch(() => null),
      ErrorRepository.getErrors(userId).catch(() => ({})),
      MasteryRepository.getMasteryRecords(userId).catch(() => ({})),
      DiagnosticRepository.getResults(userId).catch(() => null),
      PlannerStorage.loadEvents(userId).catch(() => []),
    ]);

    const errorList: ErrorRecord[] = Object.values(errorsMap || {});
    const masteryList: MasteryEvidence[] = Object.values(masteryMap || {});
    const hasDiagnostic = Boolean(diagResult || dashboardData?.hasCompletedDiagnostic);

    // Filter today's planner events
    const todayEvents = plannerEvents.filter(
      (e) => (e.date === targetDate || e.start_time) && e.status !== "cancelled"
    );

    const mustWinItems: MustWinItem[] = [];

    // -------------------------------------------------------------
    // SLOT 1: Primary Pedagogical Priority (Active Repair or Today's Mission)
    // -------------------------------------------------------------
    // Check if there is an active recurring error needing repair
    const urgentError = errorList.find(
      (e) =>
        (e.repairStatus === "identified" || e.repairStatus === "repair_started") &&
        (e.isRecurring || (e.attemptCount && e.attemptCount > 1))
    ) || errorList.find(
      (e) => e.repairStatus === "identified" || e.repairStatus === "repair_started"
    );

    const tm = dashboardData?.todaysMission;

    if (urgentError) {
      const subMeta = getSubjectMeta(urgentError.subjectId);
      mustWinItems.push({
        id: `repair-${urgentError.id}`,
        sourceType: "shater_repair",
        title: `${subMeta.nameAr} — إصلاح الخطأ في المهارة`,
        subjectId: urgentError.subjectId,
        subjectNameAr: subMeta.nameAr,
        subjectHex: subMeta.hexColor,
        skillId: urgentError.skillId,
        missionId: urgentError.missionId,
        estimatedMinutes: 20,
        whyTextAr: urgentError.isRecurring
          ? "لأن هذا الخطأ تكرر في الممارسة السابقة؛ معالجته اليوم تضمن حماية نقاطك في البكالوريا."
          : "لأن المنظومة رصدت ثغرة في حل هذا التمرين وتحتاج إلى تفكيك وتصحيح.",
        whyCategory: "recurring_error",
        status: "pending",
        priorityOrder: 1,
        isCompleted: false,
      });
    } else if (tm && tm.mission) {
      const subMeta = getSubjectMeta(tm.subjectId);
      mustWinItems.push({
        id: `mission-${tm.mission.id}`,
        sourceType: "shater_mission",
        title: `${subMeta.nameAr} — ${tm.skillTitle_ar}`,
        subjectId: tm.subjectId,
        subjectNameAr: subMeta.nameAr,
        subjectHex: subMeta.hexColor,
        skillId: tm.mission.skillId,
        missionId: tm.mission.id,
        estimatedMinutes: tm.estimatedMinutes || 30,
        whyTextAr: tm.whyText_ar || "هذه المهمة تمثل خطوتك التالية الأساسية لتثبيت تحصيلك.",
        whyCategory:
          tm.rationale?.reasonCode === "diagnostic_bottleneck"
            ? "diagnostic_bottleneck"
            : "curriculum_step",
        status: tm.mission.status === "mastered" ? "completed" : "pending",
        priorityOrder: 1,
        isCompleted: tm.mission.status === "mastered",
      });
    }

    // -------------------------------------------------------------
    // SLOT 2: Consolidation / Retest or Secondary Mission
    // -------------------------------------------------------------
    // Check if there is a twin retest ready
    const retestReadyError = errorList.find((e) => e.repairStatus === "repair_completed");
    const un = dashboardData?.upNext;

    if (retestReadyError && mustWinItems.length < 2) {
      const subMeta = getSubjectMeta(retestReadyError.subjectId);
      mustWinItems.push({
        id: `retest-${retestReadyError.id}`,
        sourceType: "shater_retest",
        title: `${subMeta.nameAr} — اختبار التحقق من تثبيت المهارة`,
        subjectId: retestReadyError.subjectId,
        subjectNameAr: subMeta.nameAr,
        subjectHex: subMeta.hexColor,
        skillId: retestReadyError.skillId,
        missionId: retestReadyError.missionId,
        estimatedMinutes: 15,
        whyTextAr: "لأنك أكملت مراجعة الخطأ، والآن وقت حل تمرين توأم للتأكد من زوال الضعف نهائياً.",
        whyCategory: "retest_ready",
        status: "pending",
        priorityOrder: 2,
        isCompleted: false,
      });
    } else if (un && un.mission && mustWinItems.length < 2) {
      const subMeta = getSubjectMeta(un.subjectId);
      mustWinItems.push({
        id: `mission-next-${un.mission.id}`,
        sourceType: "shater_mission",
        title: `${subMeta.nameAr} — ${un.skillTitle_ar}`,
        subjectId: un.subjectId,
        subjectNameAr: subMeta.nameAr,
        subjectHex: subMeta.hexColor,
        skillId: un.mission.skillId,
        missionId: un.mission.id,
        estimatedMinutes: un.estimatedMinutes || 25,
        whyTextAr: un.reason_ar || "المهارة المنطقية التالية حسب التدرج التعلمي لشعبتك.",
        whyCategory: "curriculum_step",
        status: "pending",
        priorityOrder: 2,
        isCompleted: false,
      });
    } else {
      // Check for emerging skill needing consolidation
      const emerging = masteryList.find((m) => m.masteryStatus === "emerging");
      if (emerging && mustWinItems.length < 2) {
        const subMeta = getSubjectMeta(emerging.subjectId);
        mustWinItems.push({
          id: `emerging-${emerging.skillId}`,
          sourceType: "shater_mission",
          title: `${subMeta.nameAr} — تثبيت مهارة بدأت فيها`,
          subjectId: emerging.subjectId,
          subjectNameAr: subMeta.nameAr,
          subjectHex: subMeta.hexColor,
          skillId: emerging.skillId,
          estimatedMinutes: 25,
          whyTextAr: "لأنك بدأت في هذه المهارة خطوة إيجابية، وتحتاج تدريباً موجزاً لتثبيتها كمهارة مكتسبة.",
          whyCategory: "emerging_skill",
          status: "pending",
          priorityOrder: 2,
          isCompleted: false,
        });
      }
    }

    // -------------------------------------------------------------
    // SLOT 3: Personal Planner Task or Progressive Curriculum Objective
    // -------------------------------------------------------------
    // Find uncompleted personal planner event for today
    const uncompletedPersonalTask = todayEvents.find(
      (e) => e.status !== "completed" && e.status !== "COMPLETED"
    );

    if (uncompletedPersonalTask && mustWinItems.length < 3) {
      const subId = uncompletedPersonalTask.subject_id || uncompletedPersonalTask.subjectId || "math";
      const subMeta = getSubjectMeta(subId);
      mustWinItems.push({
        id: `planner-${uncompletedPersonalTask.id}`,
        sourceType: "personal_task",
        title: uncompletedPersonalTask.title,
        subjectId: subId,
        subjectNameAr: subMeta.nameAr,
        subjectHex: subMeta.hexColor,
        plannerEventId: uncompletedPersonalTask.id,
        estimatedMinutes: uncompletedPersonalTask.duration_minutes || uncompletedPersonalTask.durationMinutes || 30,
        whyTextAr: "مهمة شخصية مبرمجة في جدولك اليومي للمراجعة والتدريب الذاتي.",
        whyCategory: "personal_commitment",
        status: uncompletedPersonalTask.status === "in_progress" ? "in_progress" : "pending",
        priorityOrder: mustWinItems.length + 1,
        isCompleted: false,
      });
    }

    // If still have empty slots, fill with remaining today's planner events (even if completed)
    if (mustWinItems.length < 3) {
      for (const evt of todayEvents) {
        if (mustWinItems.length >= 3) break;
        if (mustWinItems.some((item) => item.plannerEventId === evt.id)) continue;

        const subId = evt.subject_id || evt.subjectId || "math";
        const subMeta = getSubjectMeta(subId);
        const isDone = evt.status === "completed" || evt.status === "COMPLETED";

        mustWinItems.push({
          id: `planner-${evt.id}`,
          sourceType: "personal_task",
          title: evt.title,
          subjectId: subId,
          subjectNameAr: subMeta.nameAr,
          subjectHex: subMeta.hexColor,
          plannerEventId: evt.id,
          estimatedMinutes: evt.duration_minutes || evt.durationMinutes || 30,
          whyTextAr: isDone
            ? "تم إنجاز هذه المهمة بنجاح اليوم."
            : "مهمة مبرمجة في مخططك اليومي.",
          whyCategory: "personal_commitment",
          status: isDone ? "completed" : "pending",
          priorityOrder: mustWinItems.length + 1,
          isCompleted: isDone,
        });
      }
    }

    // Reassign priority order 1, 2, 3
    mustWinItems.forEach((item, index) => {
      item.priorityOrder = index + 1;
    });

    const totalEstimatedMinutes = mustWinItems.reduce((acc, i) => acc + i.estimatedMinutes, 0);
    const completedCount = mustWinItems.filter((i) => i.isCompleted).length;

    return {
      items: mustWinItems,
      hasDiagnostic,
      hasEnoughData: mustWinItems.length > 0,
      totalEstimatedMinutes,
      completedCount,
    };
  },
};
