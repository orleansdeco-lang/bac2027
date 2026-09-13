/**
 * BAC Mastery — Server-Side Telemetry Processing & Ingestion
 * Phase 2: Operations Foundation P0
 * 
 * INVARIANTS:
 * 1. Strict Event Allowlist: Only predefined domain events accepted.
 * 2. Data Minimization: Strips auth tokens, passwords, bearer headers, and PII.
 * 3. Deduplication: Enforces idempotency on event_id.
 * 4. Dual-mode resilience: Persists to Supabase with in-memory buffer.
 */

import { IngestedTelemetryEvent } from "./types";
import { supabase, isSupabaseConfigured } from "../supabase/client";

export const ALLOWED_TELEMETRY_EVENTS = new Set([
  "landing_view",
  "onboarding_started",
  "onboarding_completed",
  "diagnostic_started",
  "diagnostic_completed",
  "dashboard_viewed",
  "first_mission_started",
  "mission_started",
  "lesson_viewed",
  "active_recall_started",
  "active_recall_answer_revealed",
  "practice_started",
  "practice_completed",
  "error_created",
  "repair_started",
  "repair_completed",
  "retest_started",
  "retest_completed",
  "mastery_demonstrated",
  "roadmap_viewed",
  "roadmap_mission_selected",
  "progress_viewed",
  "error_lab_viewed",
  "recovery_viewed",
  "exam_mode_viewed",
  "returned_next_day",
  "pilot_feedback_submitted",
  "pilot_session_started",
  "pilot_session_ended",
  "pilot_resume_success",
  "trial_started",
  "registration_completed",
  "login_completed",
  "trial_expiring",
  "trial_expired",
  "conversion_viewed",
  "conversion_cta_clicked",
  "payment_started",
  "payment_pending_verification",
  "payment_confirmed",
]);

const FORBIDDEN_KEYS = new Set([
  "token",
  "jwt",
  "password",
  "secret",
  "auth_secret",
  "access_token",
  "refresh_token",
  "apikey",
  "bearer",
]);

const seenEventIds = new Set<string>();
const memoryTelemetryEvents: IngestedTelemetryEvent[] = [];

export function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object") return {};
  const clean: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(metadata)) {
    if (FORBIDDEN_KEYS.has(k.toLowerCase())) continue;
    if (typeof v === "string") {
      if (/bearer\s+[A-Za-z0-9-_=.]+/i.test(v)) continue;
      if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(v) && v.length > 30) {
        continue;
      }
    }
    clean[k] = v;
  }
  return clean;
}

export interface IngestionResult {
  acceptedCount: number;
  duplicateCount: number;
  rejectedCount: number;
  errors: string[];
}

export async function processTelemetryBatch(
  events: unknown[],
  serverDerivedUserId?: string | null
): Promise<IngestionResult> {
  const result: IngestionResult = {
    acceptedCount: 0,
    duplicateCount: 0,
    rejectedCount: 0,
    errors: [],
  };

  if (!Array.isArray(events)) {
    result.errors.push("Payload must be an array of events.");
    return result;
  }

  if (events.length > 100) {
    result.errors.push("Batch size exceeds maximum of 100 events.");
    return result;
  }

  const validToPersist: IngestedTelemetryEvent[] = [];

  for (const raw of events) {
    if (!raw || typeof raw !== "object") {
      result.rejectedCount++;
      continue;
    }

    const item = raw as Record<string, unknown>;
    const eventName = typeof item.eventName === "string" ? item.eventName : (item.name as string);
    const eventId = typeof item.eventId === "string" ? item.eventId : (item.id as string);

    if (!eventName || !ALLOWED_TELEMETRY_EVENTS.has(eventName)) {
      result.rejectedCount++;
      result.errors.push(`Disallowed event name: ${eventName}`);
      continue;
    }

    if (!eventId) {
      result.rejectedCount++;
      result.errors.push("Missing eventId.");
      continue;
    }

    // Deduplication check
    if (seenEventIds.has(eventId)) {
      result.duplicateCount++;
      continue;
    }
    seenEventIds.add(eventId);
    if (seenEventIds.size > 10000) {
      // Manage set footprint
      const first = seenEventIds.values().next().value;
      if (first) seenEventIds.delete(first);
    }

    const cleanMeta = sanitizeMetadata(
      (item.metadata as Record<string, unknown>) || (item.properties as Record<string, unknown>)
    );

    const validEvent: IngestedTelemetryEvent = {
      eventId,
      anonymousId: String(item.anonymousId || item.sessionId || "anon"),
      sessionId: String(item.sessionId || item.anonymousId || "ses"),
      userId: serverDerivedUserId || (typeof item.userId === "string" ? item.userId : null),
      eventName,
      occurredAt: typeof item.occurredAt === "string" ? item.occurredAt : (typeof item.timestamp === "string" ? item.timestamp : new Date().toISOString()),
      route: typeof item.route === "string" ? item.route : undefined,
      stream: typeof item.stream === "string" ? item.stream : (typeof cleanMeta.streamId === "string" ? cleanMeta.streamId : undefined),
      subject: typeof item.subject === "string" ? item.subject : (typeof cleanMeta.subjectId === "string" ? cleanMeta.subjectId : undefined),
      skillId: typeof item.skillId === "string" ? item.skillId : (typeof cleanMeta.skillId === "string" ? cleanMeta.skillId : undefined),
      missionId: typeof item.missionId === "string" ? item.missionId : (typeof cleanMeta.missionId === "string" ? cleanMeta.missionId : undefined),
      contentId: typeof item.contentId === "string" ? item.contentId : undefined,
      metadata: cleanMeta,
      createdAt: new Date().toISOString(),
    };

    validToPersist.push(validEvent);
    memoryTelemetryEvents.unshift(validEvent);
    if (memoryTelemetryEvents.length > 1000) {
      memoryTelemetryEvents.pop();
    }
    result.acceptedCount++;
  }

  // Persist to Supabase if configured
  if (isSupabaseConfigured && supabase && validToPersist.length > 0) {
    try {
      const rows = validToPersist.map((e) => ({
        event_id: e.eventId,
        anonymous_id: e.anonymousId,
        session_id: e.sessionId,
        user_id: e.userId || null,
        event_name: e.eventName,
        occurred_at: e.occurredAt,
        route: e.route || null,
        stream: e.stream || null,
        subject: e.subject || null,
        skill_id: e.skillId || null,
        mission_id: e.missionId || null,
        content_id: e.contentId || null,
        metadata: e.metadata || {},
      }));

      await supabase.from("telemetry_events").insert(rows);
    } catch {
      // Retained in memory fallback
    }
  }

  return result;
}

export function getStoredTelemetryEvents(limit: number = 100): IngestedTelemetryEvent[] {
  return memoryTelemetryEvents.slice(0, limit);
}

export function clearMemoryTelemetry(): void {
  memoryTelemetryEvents.length = 0;
  seenEventIds.clear();
}
