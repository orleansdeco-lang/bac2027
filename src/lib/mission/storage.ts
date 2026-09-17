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

// -----------------------------------------------------------------------------
// Missions Storage
// -----------------------------------------------------------------------------

export function loadMissions(): Record<string, Mission> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    return raw ? (JSON.parse(raw) as Record<string, Mission>) : {};
  } catch (e) {
    console.error("Failed to load missions from storage", e);
    return {};
  }
}

export function saveMissions(missions: Record<string, Mission>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  } catch (e) {
    console.error("Failed to save missions to storage", e);
  }
}

export function saveMission(mission: Mission): void {
  const all = loadMissions();
  all[mission.id] = { ...mission, updatedAt: new Date().toISOString() };
  saveMissions(all);
}

export function getMissionById(id: string): Mission | undefined {
  const all = loadMissions();
  return all[id];
}

export function getActiveMissionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_MISSION_ID);
  } catch (e) {
    return null;
  }
}

export function setActiveMissionId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MISSION_ID, id);
  } catch (e) {
    console.error("Failed to set active mission id", e);
  }
}

// -----------------------------------------------------------------------------
// Practice Sessions Storage
// -----------------------------------------------------------------------------

export function loadPracticeSessions(): Record<string, PracticeSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRACTICE_SESSIONS);
    return raw ? (JSON.parse(raw) as Record<string, PracticeSession>) : {};
  } catch (e) {
    console.error("Failed to load practice sessions from storage", e);
    return {};
  }
}

export function savePracticeSession(session: PracticeSession): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadPracticeSessions();
    all[session.id] = session;
    localStorage.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save practice session to storage", e);
  }
}

export function getPracticeSessionById(id: string): PracticeSession | undefined {
  const all = loadPracticeSessions();
  return all[id];
}

export function getActiveSessionForMission(missionId: string): PracticeSession | undefined {
  const all = loadPracticeSessions();
  return Object.values(all).find((s) => s.missionId === missionId && s.status === "active");
}

// -----------------------------------------------------------------------------
// Error Lab Storage
// -----------------------------------------------------------------------------

export function loadErrorRecords(): Record<string, ErrorRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ERRORS);
    return raw ? (JSON.parse(raw) as Record<string, ErrorRecord>) : {};
  } catch (e) {
    console.error("Failed to load error records from storage", e);
    return {};
  }
}

export function saveErrorRecord(record: ErrorRecord): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadErrorRecords();
    all[record.id] = { ...record, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save error record to storage", e);
  }
}

export function getErrorRecordById(id: string): ErrorRecord | undefined {
  const all = loadErrorRecords();
  return all[id];
}

export function getErrorsForMission(missionId: string): ErrorRecord[] {
  const all = loadErrorRecords();
  return Object.values(all).filter((e) => e.missionId === missionId);
}

export function getAllErrorsList(): ErrorRecord[] {
  const all = loadErrorRecords();
  return Object.values(all).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getRecurringErrors(): ErrorRecord[] {
  const all = getAllErrorsList();
  return all.filter((e) => e.isRecurring);
}

export function getOpenErrors(): ErrorRecord[] {
  const all = getAllErrorsList();
  return all.filter(
    (e) => e.repairStatus !== "retest_passed"
  );
}

export function getRemediatedErrors(): ErrorRecord[] {
  const all = getAllErrorsList();
  return all.filter((e) => e.repairStatus === "retest_passed");
}

// -----------------------------------------------------------------------------
// Mastery Evidence Storage
// -----------------------------------------------------------------------------

export function loadMasteryRecords(): Record<string, MasteryEvidence> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTERY);
    return raw ? (JSON.parse(raw) as Record<string, MasteryEvidence>) : {};
  } catch (e) {
    console.error("Failed to load mastery records from storage", e);
    return {};
  }
}

export function saveMasteryEvidence(evidence: MasteryEvidence): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadMasteryRecords();
    all[evidence.skillId] = evidence;
    localStorage.setItem(STORAGE_KEYS.MASTERY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save mastery evidence to storage", e);
  }
}

export function getMasteryEvidence(skillId: string): MasteryEvidence | undefined {
  const all = loadMasteryRecords();
  return all[skillId];
}

export function isSkillMastered(skillId: string): boolean {
  const all = loadMasteryRecords();
  const evidence = all[skillId];
  if (!evidence) return false;
  return evidence.masteryStatus === "demonstrated" || evidence.status === "mastered";
}

// -----------------------------------------------------------------------------
// Spaced Review Storage
// -----------------------------------------------------------------------------

export function loadSpacedReviewSchedules(): Record<string, SpacedReviewSchedule> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPACED_SCHEDULES);
    return raw ? (JSON.parse(raw) as Record<string, SpacedReviewSchedule>) : {};
  } catch (e) {
    console.error("Failed to load spaced review schedules from storage", e);
    return {};
  }
}

export function saveSpacedReviewSchedule(schedule: SpacedReviewSchedule): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadSpacedReviewSchedules();
    all[schedule.skillId] = schedule;
    localStorage.setItem(STORAGE_KEYS.SPACED_SCHEDULES, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save spaced review schedule to storage", e);
  }
}

// -----------------------------------------------------------------------------
// Development Reset Utility
// -----------------------------------------------------------------------------

export function clearAllMissionData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.MISSIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_MISSION_ID);
    localStorage.removeItem(STORAGE_KEYS.PRACTICE_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.ERRORS);
    localStorage.removeItem(STORAGE_KEYS.MASTERY);
    localStorage.removeItem(STORAGE_KEYS.SPACED_SCHEDULES);
  } catch (e) {
    console.error("Failed to clear mission data", e);
  }
}
