/**
 * BAC Mastery — Source Health & Staleness Monitor
 * 
 * Tracks external references, ministerial documents, and web links to prevent
 * broken URLs, outdated circulars, and link decay.
 * 
 * Rule: Stale sources are flagged for human review (SOURCE_STALE), never silently deleted.
 */

import { SourceHealthRecord, SourceHealthStatus, SourceClassification } from "./types";

export interface SourceHealthConfig {
  defaultValidityWindowDays: number; // Default: 180 days (6 months)
  warningWindowDays: number;         // Default: 120 days (4 months)
}

export const DEFAULT_SOURCE_HEALTH_CONFIG: SourceHealthConfig = {
  defaultValidityWindowDays: 180,
  warningWindowDays: 120,
};

/**
 * Calculates days elapsed between an ISO date string and a reference date (default now).
 */
export function getDaysSinceDate(isoDate: string, referenceDate: Date = new Date()): number {
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) {
    return 9999; // Invalid date treated as heavily stale
  }
  const diffMs = referenceDate.getTime() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Evaluates the freshness status of a source given its last checked timestamp.
 */
export function evaluateSourceHealth(
  lastCheckedAt: string,
  config: SourceHealthConfig = DEFAULT_SOURCE_HEALTH_CONFIG,
  referenceDate: Date = new Date()
): { status: SourceHealthStatus; daysSinceLastCheck: number; needsAudit: boolean } {
  const days = getDaysSinceDate(lastCheckedAt, referenceDate);

  let status: SourceHealthStatus = "FRESH";
  let needsAudit = false;

  if (days <= 30) {
    status = "FRESH";
  } else if (days <= config.warningWindowDays) {
    status = "VALID";
  } else if (days <= config.defaultValidityWindowDays) {
    status = "STALE_WARNING";
    needsAudit = true;
  } else {
    status = "SOURCE_STALE";
    needsAudit = true;
  }

  return {
    status,
    daysSinceLastCheck: days,
    needsAudit,
  };
}

/**
 * Validates a list of source health records and identifies items requiring inspection.
 */
export function filterSourcesNeedingReview(
  sources: SourceHealthRecord[],
  config: SourceHealthConfig = DEFAULT_SOURCE_HEALTH_CONFIG
): SourceHealthRecord[] {
  return sources.filter((src) => {
    const health = evaluateSourceHealth(src.lastCheckedAt, config);
    return health.needsAudit || health.status === "SOURCE_STALE";
  });
}
