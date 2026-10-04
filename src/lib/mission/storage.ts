import { Mission, PracticeSession, ErrorRecord, MasteryEvidence } from "@/types/mission";
import { SpacedReviewSchedule } from "@/domain/learning/types";

export const STORAGE_KEYS = {
  MISSIONS: "bac_mastery_missions",
  ACTIVE_MISSION_ID: "bac_mastery_active_mission_id",
  PRACTICE_SESSIONS: "bac_mastery_practice_sessions",
  ERRORS: "bac_mastery_errors",
  MASTERY: "bac_mastery_mastery",
  SPACED_SCHEDULES: "bac_mastery_spaced_schedules",
} as const;

export function getStorageKey(baseKey: string, userId?: string): string {
  if (userId) return `${baseKey}_${userId}`;
  return baseKey;
}

// -----------------------------------------------------------------------------
// Missions Storage
// -----------------------------------------------------------------------------

export function loadMissions(userId?: string): Record<string, Mission> {
  if (typeof window === "undefined") return {};
  try {
    const key = getStorageKey(STORAGE_KEYS.MISSIONS, userId);
    let raw = localStorage.getItem(key);
    if (!raw && !userId) {
      raw = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    }
    return raw ? (JSON.parse(raw) as Record<string, Mission>) : {};
  } catch (e) {
    console.error("Failed to load missions from storage", e);
    return {};
  }
}

export function saveMissions(missions: Record<string, Mission>, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(STORAGE_KEYS.MISSIONS, userId);
    localStorage.setItem(key, JSON.stringify(missions));
  } catch (e) {
    console.error("Failed to save missions to storage", e);
  }
}

export function saveMission(mission: Mission, userId?: string): void {
  const all = loadMissions(userId);
  all[mission.id] = { ...mission, updatedAt: new Date().toISOString() };
  saveMissions(all, userId);
}

export function getMissionById(id: string, userId?: string): Mission | undefined {
  const all = loadMissions(userId);
  return all[id];
}

export function getActiveMissionId(userId?: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getStorageKey(STORAGE_KEYS.ACTIVE_MISSION_ID, userId);
    return localStorage.getItem(key) || (!userId ? localStorage.getItem(STORAGE_KEYS.ACTIVE_MISSION_ID) : null);
  } catch (e) {
    return null;
  }
}

export function setActiveMissionId(id: string, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(STORAGE_KEYS.ACTIVE_MISSION_ID, userId);
    localStorage.setItem(key, id);
  } catch (e) {
    console.error("Failed to set active mission id", e);
  }
}

// -----------------------------------------------------------------------------
// Practice Sessions Storage
// -----------------------------------------------------------------------------

export function loadPracticeSessions(userId?: string): Record<string, PracticeSession> {
  if (typeof window === "undefined") return {};
  try {
    const key = getStorageKey(STORAGE_KEYS.PRACTICE_SESSIONS, userId);
    let raw = localStorage.getItem(key);
    if (!raw && !userId) {
      raw = localStorage.getItem(STORAGE_KEYS.PRACTICE_SESSIONS);
    }
    return raw ? (JSON.parse(raw) as Record<string, PracticeSession>) : {};
  } catch (e) {
    console.error("Failed to load practice sessions from storage", e);
    return {};
  }
}

export function savePracticeSession(session: PracticeSession, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadPracticeSessions(userId);
    all[session.id] = session;
    const key = getStorageKey(STORAGE_KEYS.PRACTICE_SESSIONS, userId);
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save practice session to storage", e);
  }
}

export function getPracticeSessionById(id: string, userId?: string): PracticeSession | undefined {
  const all = loadPracticeSessions(userId);
  return all[id];
}

export function getActiveSessionForMission(missionId: string, userId?: string): PracticeSession | undefined {
  const all = loadPracticeSessions(userId);
  return Object.values(all).find((s) => s.missionId === missionId && s.status === "active");
}

// -----------------------------------------------------------------------------
// Error Lab Storage
// -----------------------------------------------------------------------------

export function loadErrorRecords(userId?: string): Record<string, ErrorRecord> {
  if (typeof window === "undefined") return {};
  try {
    const key = getStorageKey(STORAGE_KEYS.ERRORS, userId);
    let raw = localStorage.getItem(key);
    if (!raw && !userId) {
      raw = localStorage.getItem(STORAGE_KEYS.ERRORS);
    }
    return raw ? (JSON.parse(raw) as Record<string, ErrorRecord>) : {};
  } catch (e) {
    console.error("Failed to load error records from storage", e);
    return {};
  }
}

export function saveErrorRecord(record: ErrorRecord, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadErrorRecords(userId);
    all[record.id] = { ...record, updatedAt: new Date().toISOString() };
    const key = getStorageKey(STORAGE_KEYS.ERRORS, userId);
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save error record to storage", e);
  }
}

export function getErrorRecordById(id: string, userId?: string): ErrorRecord | undefined {
  const all = loadErrorRecords(userId);
  return all[id];
}

export function getErrorsForMission(missionId: string, userId?: string): ErrorRecord[] {
  const all = loadErrorRecords(userId);
  return Object.values(all).filter((e) => e.missionId === missionId);
}

export function getAllErrorsList(userId?: string): ErrorRecord[] {
  const all = loadErrorRecords(userId);
  return Object.values(all).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getRecurringErrors(userId?: string): ErrorRecord[] {
  const all = getAllErrorsList(userId);
  return all.filter((e) => e.isRecurring);
}

export function getOpenErrors(userId?: string): ErrorRecord[] {
  const all = getAllErrorsList(userId);
  return all.filter(
    (e) => e.repairStatus !== "retest_passed"
  );
}

export function getRemediatedErrors(userId?: string): ErrorRecord[] {
  const all = getAllErrorsList(userId);
  return all.filter((e) => e.repairStatus === "retest_passed");
}

// -----------------------------------------------------------------------------
// Mastery Evidence Storage
// -----------------------------------------------------------------------------

export function loadMasteryRecords(userId?: string): Record<string, MasteryEvidence> {
  if (typeof window === "undefined") return {};
  try {
    const key = getStorageKey(STORAGE_KEYS.MASTERY, userId);
    let raw = localStorage.getItem(key);
    if (!raw && !userId) {
      raw = localStorage.getItem(STORAGE_KEYS.MASTERY);
    }
    return raw ? (JSON.parse(raw) as Record<string, MasteryEvidence>) : {};
  } catch (e) {
    console.error("Failed to load mastery records from storage", e);
    return {};
  }
}

export function saveMasteryEvidence(evidence: MasteryEvidence, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadMasteryRecords(userId);
    all[evidence.skillId] = evidence;
    const key = getStorageKey(STORAGE_KEYS.MASTERY, userId);
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save mastery evidence to storage", e);
  }
}

export function getMasteryEvidence(skillId: string, userId?: string): MasteryEvidence | undefined {
  const all = loadMasteryRecords(userId);
  return all[skillId];
}

export function isSkillMastered(skillId: string, userId?: string): boolean {
  const all = loadMasteryRecords(userId);
  const evidence = all[skillId];
  if (!evidence) return false;
  return evidence.masteryStatus === "demonstrated" || (evidence as any).status === "mastered";
}

// -----------------------------------------------------------------------------
// Spaced Review Storage
// -----------------------------------------------------------------------------

export function loadSpacedReviewSchedules(userId?: string): Record<string, SpacedReviewSchedule> {
  if (typeof window === "undefined") return {};
  try {
    const key = getStorageKey(STORAGE_KEYS.SPACED_SCHEDULES, userId);
    let raw = localStorage.getItem(key);
    if (!raw && !userId) {
      raw = localStorage.getItem(STORAGE_KEYS.SPACED_SCHEDULES);
    }
    return raw ? (JSON.parse(raw) as Record<string, SpacedReviewSchedule>) : {};
  } catch (e) {
    console.error("Failed to load spaced review schedules from storage", e);
    return {};
  }
}

export function saveSpacedReviewSchedule(schedule: SpacedReviewSchedule, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadSpacedReviewSchedules(userId);
    all[schedule.skillId] = schedule;
    const key = getStorageKey(STORAGE_KEYS.SPACED_SCHEDULES, userId);
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save spaced review schedule to storage", e);
  }
}

// -----------------------------------------------------------------------------
// Development Reset Utility
// -----------------------------------------------------------------------------

export function clearAllMissionData(userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getStorageKey(STORAGE_KEYS.MISSIONS, userId));
    localStorage.removeItem(getStorageKey(STORAGE_KEYS.ACTIVE_MISSION_ID, userId));
    localStorage.removeItem(getStorageKey(STORAGE_KEYS.PRACTICE_SESSIONS, userId));
    localStorage.removeItem(getStorageKey(STORAGE_KEYS.ERRORS, userId));
    localStorage.removeItem(getStorageKey(STORAGE_KEYS.MASTERY, userId));
    localStorage.removeItem(getStorageKey(STORAGE_KEYS.SPACED_SCHEDULES, userId));
    if (!userId) {
      localStorage.removeItem(STORAGE_KEYS.MISSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_MISSION_ID);
      localStorage.removeItem(STORAGE_KEYS.PRACTICE_SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ERRORS);
      localStorage.removeItem(STORAGE_KEYS.MASTERY);
      localStorage.removeItem(STORAGE_KEYS.SPACED_SCHEDULES);
    }
  } catch (e) {
    console.error("Failed to clear mission data", e);
  }
}
