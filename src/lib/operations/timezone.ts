/**
 * SHATER Operations — Algeria Local Timezone Standard
 * 
 * INVARIANT:
 * Platform operates in Algeria (UTC+1 year-round, Africa/Algiers, no DST).
 * Regardless of server runtime location (e.g. UTC on Vercel serverless),
 * all "Today", "Week", "Month" analytics boundaries must align with Algerian midnight.
 */

/**
 * Returns the start of today in Algeria (00:00:00.000 UTC+1) as an ISO string.
 */
export function getAlgeriaTodayStartIso(date: Date = new Date()): string {
  // Convert UTC timestamp to Algeria calendar components (UTC+1)
  const algeriaMs = date.getTime() + 1 * 60 * 60 * 1000;
  const algeriaDate = new Date(algeriaMs);
  const year = algeriaDate.getUTCFullYear();
  const month = String(algeriaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(algeriaDate.getUTCDate()).padStart(2, "0");
  
  // Return ISO string for Algeria midnight (which is 23:00 UTC of previous day)
  return new Date(`${year}-${month}-${day}T00:00:00+01:00`).toISOString();
}

/**
 * Returns the start of this week in Algeria (7 days ago midnight).
 */
export function getAlgeriaWeekStartIso(date: Date = new Date()): string {
  const todayStart = new Date(getAlgeriaTodayStartIso(date));
  return new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Returns the start of this month in Algeria (30 days ago midnight).
 */
export function getAlgeriaMonthStartIso(date: Date = new Date()): string {
  const todayStart = new Date(getAlgeriaTodayStartIso(date));
  return new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Formats a timestamp into an Algeria local date string (YYYY-MM-DD).
 */
export function formatAlgeriaDateKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const algeriaMs = d.getTime() + 1 * 60 * 60 * 1000;
  const algeriaDate = new Date(algeriaMs);
  const year = algeriaDate.getUTCFullYear();
  const month = String(algeriaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(algeriaDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
