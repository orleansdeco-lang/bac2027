/**
 * SHATER Study OS — Analytics Application Service
 * Phase 5: Rigorous distinction between Study Activity and Real Learning Progress
 * 
 * CORE PRINCIPLE:
 * "Studying for 8 hours does not automatically mean 8 hours of learning."
 * Distinguishes study effort (activity) from verified mastery (evidence).
 */

import { StreamId, SubjectId } from "@/types/education";
import {
  StudyOsAnalyticsReport,
  HorizonReport,
  DailyActivityPoint,
  SubjectFocusPoint,
  UnresolvedWeakness,
  AnalyticsTimeHorizon,
} from "@/types/study-analytics";
import { PlannerStorage } from "@/lib/planner/storage";
import { StudySession, PlannerEvent } from "@/lib/planner/types";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { MasteryRepository } from "@/lib/repositories/mastery-repository";
import { MissionRepository } from "@/lib/repositories/mission-repository";
import { RetestRepository, RetestAttemptRecord } from "@/lib/repositories/retest-repository";
import { StudentRepository } from "@/lib/repositories/student-repository";
import { ContentService } from "@/lib/services/content-service";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS, getStreamSubjects } from "@/lib/constants/streams";
import { getSubjectMeta } from "@/lib/focus/focus-engine";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";
import { ErrorRecord } from "@/types/mission";

const ERROR_TYPE_LABELS_AR: Record<string, string> = {
  forgot_information: "نسيت المعلومة / القانون",
  misunderstood_concept: "سوء فهم للمفهوم الأساسي",
  misread_question: "تسرع في قراءة المعطيات",
  calculation_error: "خطأ حسابي أو تقني",
  methodology_error: "خلل في المنهجية أو خطوات الحل",
  unknown: "خطأ غير محدد",
};

// Arabic day names indexed by getDay() (0 = Sunday, 6 = Saturday)
const ARABIC_DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

// Timezone offset for Algeria (UTC+1)
const ALGERIA_OFFSET_MS = 60 * 60 * 1000;

function toAlgiersDate(dateInput?: string | number | Date): Date {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + ALGERIA_OFFSET_MS);
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the 7 days of the current Algerian academic week (Saturday to Friday).
 */
function getAlgiersWeekDays(referenceDate: Date): { dateKey: string; dayNameAr: string; date: Date }[] {
  const d = new Date(referenceDate);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
  // Distance from last Saturday: if Saturday (6) diff is 0, if Sunday (0) diff is 1, etc.
  const diffToSaturday = (dayOfWeek + 1) % 7;
  
  const saturday = new Date(d);
  saturday.setDate(d.getDate() - diffToSaturday);
  saturday.setHours(0, 0, 0, 0);

  const weekDays: { dateKey: string; dayNameAr: string; date: Date }[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(saturday);
    current.setDate(saturday.getDate() + i);
    weekDays.push({
      dateKey: formatDateKey(current),
      dayNameAr: ARABIC_DAYS[current.getDay()],
      date: current,
    });
  }
  return weekDays;
}

export const AnalyticsService = {
  /**
   * Generates authoritative analytics report across Today, This Week, and Long Term.
   */
  async getStudentAnalytics(userId: string, streamIdParam?: StreamId): Promise<StudyOsAnalyticsReport> {
    const effectiveUserId = userId || "demo-user";
    const nowAlgiers = toAlgiersDate();
    const todayKey = formatDateKey(nowAlgiers);
    const weekDays = getAlgiersWeekDays(nowAlgiers);
    const weekDateKeys = new Set(weekDays.map((w) => w.dateKey));

    // Parallel fetch from authentic local/remote repositories
    const [rawSessions, rawEvents, errorsMap, masteryMap, missionsMap, retests, profile] =
      await Promise.all([
        PlannerStorage.loadStudySessions(effectiveUserId),
        PlannerStorage.loadEvents(effectiveUserId),
        ErrorRepository.getErrors(effectiveUserId),
        MasteryRepository.getMasteryRecords(effectiveUserId),
        MissionRepository.getMissions(effectiveUserId),
        RetestRepository.getAllRetests(effectiveUserId),
        StudentRepository.getProfile(effectiveUserId),
      ]);

    const errors = Object.values(errorsMap || {});
    const missions = Object.values(missionsMap || {});
    const masteryList = Object.values(masteryMap || {});

    const effectiveStream: StreamId = normalizeStreamIdWithDefault(
      streamIdParam || profile?.streamId,
      "sciences_exp"
    );
    const streamMeta = ALGERIAN_BAC_STREAMS[effectiveStream];
    const streamSkills = ContentService.getSkillsForStream(effectiveStream);
    const streamRules = getStreamSubjects(effectiveStream);
    const skillsMap = new Map(streamSkills.map((s) => [s.id, s]));

    // =========================================================================
    // 1. DEDUPLICATION & DATA CLEANING
    // =========================================================================
    // Filter out abandoned sessions and deduplicate by session id
    const seenSessionIds = new Set<string>();
    const validSessions: StudySession[] = [];
    for (const s of rawSessions) {
      if (!s.id || seenSessionIds.has(s.id)) continue;
      seenSessionIds.add(s.id);
      // Valid session must not be abandoned and must have >= 60 seconds
      if (s.status !== "abandoned" && (s.actualDurationSeconds || 0) >= 60) {
        validSessions.push(s);
      }
    }

    // Deduplicate planner events
    const seenEventIds = new Set<string>();
    const validEvents: PlannerEvent[] = [];
    for (const e of rawEvents) {
      if (!e.id || seenEventIds.has(e.id)) continue;
      seenEventIds.add(e.id);
      validEvents.push(e);
    }

    // Deduplicate errors
    const seenErrorIds = new Set<string>();
    const validErrors: ErrorRecord[] = [];
    for (const err of errors) {
      if (!err.id || seenErrorIds.has(err.id)) continue;
      seenErrorIds.add(err.id);
      validErrors.push(err);
    }

    // Deduplicate completed missions
    const seenMissionIds = new Set<string>();
    const completedMissions: any[] = [];
    for (const m of missions) {
      if (!m.id || seenMissionIds.has(m.id)) continue;
      seenMissionIds.add(m.id);
      if (m.status === "completed") {
        completedMissions.push(m);
      }
    }

    // =========================================================================
    // 2. STREAK CALCULATIONS
    // =========================================================================
    // Group study seconds by Algiers dateKey (qualifying threshold: >= 300 seconds / 5 mins)
    const dailyStudySeconds = new Map<string, number>();
    for (const s of validSessions) {
      const sDateKey = formatDateKey(toAlgiersDate(s.startedAt));
      const current = dailyStudySeconds.get(sDateKey) || 0;
      dailyStudySeconds.set(sDateKey, current + (s.actualDurationSeconds || 0));
    }

    const activeDaysSet = new Set<string>();
    for (const [dKey, totalSecs] of Array.from(dailyStudySeconds.entries())) {
      if (totalSecs >= 300) {
        activeDaysSet.add(dKey);
      }
    }

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(nowAlgiers);
    let checkKey = formatDateKey(checkDate);
    // If today has activity, streak starts today; otherwise check if yesterday was active
    if (!activeDaysSet.has(checkKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = formatDateKey(checkDate);
    }

    while (activeDaysSet.has(checkKey)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = formatDateKey(checkDate);
    }

    // Calculate longest historical streak
    const sortedActiveDates = Array.from(activeDaysSet).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevEpoch: number | null = null;

    for (const dStr of sortedActiveDates) {
      const currentEpoch = new Date(dStr).getTime();
      if (prevEpoch === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currentEpoch - prevEpoch) / (24 * 3600 * 1000));
        if (diffDays === 1) {
          tempStreak += 1;
        } else {
          tempStreak = 1;
        }
      }
      prevEpoch = currentEpoch;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // =========================================================================
    // 3. AGGREGATE ACTIVITY & LEARNING BY HORIZON
    // =========================================================================
    function computeHorizon(horizon: AnalyticsTimeHorizon): HorizonReport {
      // Filter sessions for this horizon
      const horizonSessions = validSessions.filter((s) => {
        const sKey = formatDateKey(toAlgiersDate(s.startedAt));
        if (horizon === "today") return sKey === todayKey;
        if (horizon === "week") return weekDateKeys.has(sKey);
        return true;
      });

      // Filter events for this horizon to compute target minutes
      const horizonEvents = validEvents.filter((e) => {
        const eKey = e.date || (e as any).scheduledDate;
        if (!eKey) return false;
        if (horizon === "today") return eKey === todayKey;
        if (horizon === "week") return weekDateKeys.has(eKey);
        return true;
      });

      // Compute total focus minutes
      const totalFocusSecs = horizonSessions.reduce(
        (sum, s) => sum + (s.actualDurationSeconds || 0),
        0
      );
      const focusMinutes = Math.round(totalFocusSecs / 60);

      // Target minutes
      let targetMinutes = horizonEvents.reduce(
        (sum, e) => sum + (e.durationMinutes || (e as any).duration_minutes || (e as any).targetMinutes || 25),
        0
      );
      // Sensible baseline default if student hasn't customized targets
      if (targetMinutes === 0) {
        targetMinutes = horizon === "today" ? 120 : horizon === "week" ? 720 : 3600;
      }

      // Unique subjects studied in this horizon
      const subjectsStudiedSet = new Set(horizonSessions.map((s) => s.subjectId));

      // Active days in this horizon
      const horizonActiveDays = new Set(
        horizonSessions.map((s) => formatDateKey(toAlgiersDate(s.startedAt)))
      ).size;

      // Daily distribution (for week horizon, maps all 7 week days)
      const dailyDistribution: DailyActivityPoint[] = weekDays.map((w) => {
        const daySessions = validSessions.filter(
          (s) => formatDateKey(toAlgiersDate(s.startedAt)) === w.dateKey
        );
        const dayEvents = validEvents.filter(
          (e) => (e.date || (e as any).scheduledDate) === w.dateKey
        );
        const dayFocusSecs = daySessions.reduce(
          (sum, s) => sum + (s.actualDurationSeconds || 0),
          0
        );
        const dayTargetMins = dayEvents.reduce(
          (sum, e) => sum + (e.durationMinutes || (e as any).duration_minutes || (e as any).targetMinutes || 25),
          0
        );
        return {
          date: w.dateKey,
          dayNameAr: w.dayNameAr,
          actualMinutes: Math.round(dayFocusSecs / 60),
          targetMinutes: dayTargetMins > 0 ? dayTargetMins : 90,
          sessionsCount: daySessions.length,
        };
      });

      // Subject focus distribution
      const subjectSecsMap = new Map<string, { seconds: number; sessionsCount: number }>();
      for (const s of horizonSessions) {
        const subId = s.subjectId || "math";
        const cur = subjectSecsMap.get(subId) || { seconds: 0, sessionsCount: 0 };
        subjectSecsMap.set(subId, {
          seconds: cur.seconds + (s.actualDurationSeconds || 0),
          sessionsCount: cur.sessionsCount + 1,
        });
      }

      const subjectDistribution: SubjectFocusPoint[] = [];
      for (const rule of streamRules) {
        const subId = rule.subjectId;
        const meta = getSubjectMeta(subId as SubjectId);
        const stat = subjectSecsMap.get(subId) || { seconds: 0, sessionsCount: 0 };
        const subMinutes = Math.round(stat.seconds / 60);
        const percentage =
          focusMinutes > 0 ? Math.round((subMinutes / focusMinutes) * 100) : 0;

        subjectDistribution.push({
          subjectId: subId,
          nameAr: meta.nameAr,
          hexColor: meta.hexColor,
          coefficient: rule.coefficient,
          focusMinutes: subMinutes,
          percentage,
          sessionsCount: stat.sessionsCount,
        });
      }
      subjectDistribution.sort((a, b) => b.focusMinutes - a.focusMinutes || b.coefficient - a.coefficient);

      // =======================================================================
      // REAL LEARNING EVIDENCE METRICS
      // =======================================================================
      // Filter repaired errors
      const repairedErrors = validErrors.filter((e) => {
        const isRepaired =
          e.repairStatus === "repair_completed" || e.repairStatus === "retest_passed";
        if (!isRepaired) return false;
        if (horizon === "longTerm") return true;

        const repairedDate = formatDateKey(
          toAlgiersDate((e as any).repairedAt || (e as any).updatedAt || e.createdAt)
        );

        if (horizon === "today") return repairedDate === todayKey;
        if (horizon === "week") return weekDateKeys.has(repairedDate);
        return true;
      });

      // Filter completed missions
      const horizonMissions = completedMissions.filter((m) => {
        if (horizon === "longTerm") return true;
        const compDate = m.completedAt
          ? formatDateKey(toAlgiersDate(m.completedAt))
          : formatDateKey(toAlgiersDate(m.updatedAt || m.createdAt));

        if (horizon === "today") return compDate === todayKey;
        if (horizon === "week") return weekDateKeys.has(compDate);
        return true;
      });

      // Retest successes
      const retestSuccesses = retests.filter((r: RetestAttemptRecord | any) => {
        if (!r.isPassed && !r.passed) return false;
        if (horizon === "longTerm") return true;
        const rDate = formatDateKey(toAlgiersDate(r.attemptedAt || r.createdAt));
        if (horizon === "today") return rDate === todayKey;
        if (horizon === "week") return weekDateKeys.has(rDate);
        return true;
      });

      // Demonstrated and emerging skills from authentic MasteryRepository
      const demonstratedSkills = masteryList.filter(
        (m) => m.masteryStatus === "demonstrated"
      );
      const emergingSkills = masteryList.filter(
        (m) => m.masteryStatus === "emerging"
      );

      // Unresolved Weaknesses: Every error needing repair leads to an action!
      const unresolvedErrors = validErrors.filter(
        (e) => e.repairStatus === "identified" || e.repairStatus === "repair_started"
      );

      const unresolvedWeaknesses: UnresolvedWeakness[] = unresolvedErrors.map((e) => {
        const skill = skillsMap.get(e.skillId);
        const subjMeta = getSubjectMeta(e.subjectId as SubjectId);
        const rootCauseAr =
          (e as any).misconception ||
          (e as any).rootCause ||
          ERROR_TYPE_LABELS_AR[e.suspectedErrorType] ||
          "خطأ بحاجة للمراجعة والتصحيح";

        return {
          errorId: e.id,
          skillId: e.skillId,
          subjectId: e.subjectId,
          subjectNameAr: subjMeta.nameAr,
          skillTitleAr: skill?.title_ar || e.skillId,
          rootCauseAr,
          occurredAt: e.createdAt,
          repairStatus: e.repairStatus as "identified" | "repair_started",
          actionUrl: `/student/error-lab?errorId=${e.id}`,
        };
      });

      const totalCurriculumSkills = streamSkills.length;
      const demonstratedMasteryPct =
        totalCurriculumSkills > 0
          ? Math.round((demonstratedSkills.length / totalCurriculumSkills) * 100)
          : 0;

      const labelsMap: Record<AnalyticsTimeHorizon, string> = {
        today: "اليوم",
        week: "هذا الأسبوع",
        longTerm: "المسار الإجمالي",
      };

      return {
        horizon,
        labelAr: labelsMap[horizon],
        activity: {
          focusMinutes,
          targetMinutes,
          sessionsCount: horizonSessions.length,
          activeDaysCount: horizon === "longTerm" ? activeDaysSet.size : horizonActiveDays,
          subjectsStudiedCount: subjectsStudiedSet.size,
          dailyDistribution,
          subjectDistribution,
          currentStreakDays: currentStreak,
          longestStreakDays: longestStreak,
        },
        learning: {
          repairedErrorsCount: repairedErrors.length,
          retestSuccessCount: retestSuccesses.length,
          completedMissionsCount: horizonMissions.length,
          demonstratedSkillsCount: demonstratedSkills.length,
          emergingSkillsCount: emergingSkills.length,
          unresolvedWeaknesses,
          totalCurriculumSkillsCount: totalCurriculumSkills,
          demonstratedMasteryPercentage: demonstratedMasteryPct,
        },
      };
    }

    return {
      generatedAt: new Date().toISOString(),
      streamId: effectiveStream,
      streamNameAr: streamMeta?.name_ar || "العلوم التجريبية",
      today: computeHorizon("today"),
      week: computeHorizon("week"),
      longTerm: computeHorizon("longTerm"),
    };
  },
};
