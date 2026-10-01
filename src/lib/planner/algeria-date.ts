/**
 * SHATER Planner — Algerian Timezone & Date Calculations
 * Timezone: Africa/Algiers (UTC+1, Standard Time all year round)
 * Week Start: Saturday (السبت) matching the Algerian academic & social rhythm
 */

import { PlannerEvent, StudySession, DailyReflection } from "./types";

export const ALGERIA_TIMEZONE = "Africa/Algiers";

/**
 * Returns the current date in Algeria as YYYY-MM-DD string
 */
export function getAlgeriaDateString(date: Date = new Date()): string {
  // Using Intl with en-CA produces standard ISO-like YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ALGERIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Returns the current time in Algeria as HH:MM string (24h)
 */
export function getAlgeriaTimeString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: ALGERIA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date);
}

export interface AlgeriaWeekDay {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  nameAr: string;
  nameFr: string;
  isToday: boolean;
  isSelected: boolean;
}

/**
 * Returns 7 days for the week containing referenceDateStr, starting from Saturday (السبت)
 */
export function getAlgeriaWeekDays(
  referenceDateStr: string = getAlgeriaDateString(),
  selectedDateStr: string = referenceDateStr
): AlgeriaWeekDay[] {
  const [year, month, day] = referenceDateStr.split("-").map(Number);
  const refDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  // In JS: Sunday=0, Monday=1, ... Saturday=6
  // We want Saturday to be index 0
  const jsDay = refDate.getUTCDay();
  // Distance back to Saturday: if jsDay is 6 (Sat) -> 0; if 0 (Sun) -> 1; if 1 (Mon) -> 2...
  const daysSinceSaturday = (jsDay + 1) % 7;

  const saturday = new Date(refDate);
  saturday.setUTCDate(refDate.getUTCDate() - daysSinceSaturday);

  const todayStr = getAlgeriaDateString();
  const dayNamesAr = [
    "السبت",
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ];
  const dayNamesFr = ["Sam", "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven"];

  return Array.from({ length: 7 }, (_, i) => {
    const current = new Date(saturday);
    current.setUTCDate(saturday.getUTCDate() + i);

    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, "0");
    const d = String(current.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    return {
      date: dateStr,
      dayNumber: current.getUTCDate(),
      nameAr: dayNamesAr[i],
      nameFr: dayNamesFr[i],
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr,
    };
  });
}

/**
 * Calculates authoritative study streak from completed events, sessions, and reflections.
 * Does NOT inject fake baseline minimums (e.g. no Math.max(streak, 6)).
 */
export function calculateAuthoritativeStreak(
  events: Array<{ date: string; status?: string; completed_at?: string }>,
  sessions: Array<{ started_at?: string; actual_duration_seconds?: number; status?: string }>,
  reflections: Array<{ date: string }>,
  todayIso: string = getAlgeriaDateString()
): number {
  const activeDates = new Set<string>();

  // 1. Completed planner events
  for (const e of events) {
    const isDone = e.status === "COMPLETED" || e.status === "completed";
    if (isDone && e.date) {
      activeDates.add(e.date);
    }
  }

  // 2. Completed study sessions (> 2 minutes)
  for (const s of sessions) {
    if (s.started_at && (s.actual_duration_seconds ?? 0) >= 120) {
      const datePart = s.started_at.split("T")[0];
      if (datePart) activeDates.add(datePart);
    }
  }

  // 3. Daily reflections
  for (const r of reflections) {
    if (r.date) {
      activeDates.add(r.date);
    }
  }

  if (activeDates.size === 0) {
    return 0;
  }

  const [tY, tM, tD] = todayIso.split("-").map(Number);
  const cursor = new Date(Date.UTC(tY, tM - 1, tD, 12, 0, 0));

  let streak = 0;

  // Check if today has activity
  if (activeDates.has(todayIso)) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  } else {
    // If today has no activity yet, check yesterday
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const yesterdayY = cursor.getUTCFullYear();
    const yesterdayM = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const yesterdayD = String(cursor.getUTCDate()).padStart(2, "0");
    const yesterdayIso = `${yesterdayY}-${yesterdayM}-${yesterdayD}`;

    if (!activeDates.has(yesterdayIso)) {
      return 0; // Streak broken
    }
  }

  // Walk backwards day by day
  for (let i = 0; i < 365; i++) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cursor.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    if (activeDates.has(dateStr)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
