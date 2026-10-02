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
import {
  SHATER_CONTROLLED_EVENTS,
  CRITICAL_CONVERSION_EVENTS,
  FORBIDDEN_METADATA_KEYS as FORBIDDEN_KEYS,
  sanitizeEventMetadata,
} from "../analytics/taxonomy";

export const ALLOWED_TELEMETRY_EVENTS = new Set([
  // CONTROLLED FIRST-PARTY TAXONOMY (Prompt requirements)
  // Acquisition
  "page_view",
  "session_start",

  // Registration
  "signup_started",
  "signup_completed",
  "login",
  "logout",

  // Product
  "diwan_opened",
  "diwan_table_created",
  "diwan_table_joined",
  "planner_opened",
  "exam_opened",
  "exam_started",
  "exam_completed",
  "summary_opened",
  "subject_opened",
  "calculator_used",
  "orientation_opened",

  // Monetization
  "trial_started",
  "checkout_started",
  "subscription_created",
  "payment_submitted",
  "payment_confirmed",
  "subscription_expired",

  // Engagement
  "session_activity",

  // LEGACY DOMAIN EVENTS (Preserved for backwards compatibility)
  "visitor",
  "landing",
  "landing_view",
  "cta",
  "cta_clicked",
  "conversion_viewed",
  "conversion_cta_clicked",
  "registration_started",
  "registration_completed",
  "login_completed",
  "onboarding_started",
  "onboarding_completed",
  "diagnostic_started",
  "diagnostic_completed",
  "dashboard_viewed",
  "first_mission_started",
  "mission_started",
  "mission_completed",
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
  "mastery_evidence",
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
  "orientation_started",
  "orientation_stream_selected",
  "orientation_score_completed",
  "orientation_results_viewed",
  "orientation_program_clicked",
  "ad_impression",
  "ad_clicked",
  "view_content",
  "lead_generated",
  "trial_expiring",
  "trial_expired",
  "checkout_initiated",
  "payment_started",
  "payment_order_created",
  "payment_pending_verification",
  "payment_rejected",
  "api_error",
  "telemetry_error",
  "access_denied",
]);

// Sliding rate limiter: max 120 events / 60 seconds per client key
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(key: string, maxEvents = 120, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    if (rateLimitMap.size > 10000) {
      const first = rateLimitMap.keys().next().value;
      if (first) rateLimitMap.delete(first);
    }
    return true;
  }

  if (entry.count >= maxEvents) {
    return false;
  }

  entry.count++;
  return true;
}

// Critical conversion deduplication cache (5-minute window)
const conversionDedupeCache = new Map<string, number>();

export function isDuplicateConversion(dedupeKey: string, windowMs = 300000): boolean {
  const now = Date.now();
  const lastSeen = conversionDedupeCache.get(dedupeKey);
  if (lastSeen && now - lastSeen < windowMs) {
    return true;
  }
  conversionDedupeCache.set(dedupeKey, now);
  if (conversionDedupeCache.size > 5000) {
    const first = conversionDedupeCache.keys().next().value;
    if (first) conversionDedupeCache.delete(first);
  }
  return false;
}

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

  if (events.length > 50) {
    result.errors.push("Batch size exceeds maximum of 50 events.");
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

    // Critical financial events CANNOT be emitted from unauthenticated public client telemetry
    if (eventName === "payment_confirmed" || eventName === "subscription_created") {
      result.rejectedCount++;
      result.errors.push(`Critical event "${eventName}" can only be generated authoritatively by server.`);
      continue;
    }

    if (!eventId) {
      result.rejectedCount++;
      result.errors.push("Missing eventId.");
      continue;
    }

    // Event ID Deduplication check
    if (seenEventIds.has(eventId)) {
      result.duplicateCount++;
      continue;
    }
    seenEventIds.add(eventId);
    if (seenEventIds.size > 10000) {
      const first = seenEventIds.values().next().value;
      if (first) seenEventIds.delete(first);
    }

    const visitorId = String(item.visitorId || item.anonymousId || "anon");
    const sessionId = String(item.sessionId || item.anonymousId || "ses");
    const pagePath = typeof item.pagePath === "string" ? item.pagePath : (typeof item.route === "string" ? item.route : "/");

    // Critical conversion deduplication (sliding 5-minute window)
    if (CRITICAL_CONVERSION_EVENTS.has(eventName)) {
      const actorKey = serverDerivedUserId || visitorId;
      const dedupeKey = `${eventName}:${actorKey}`;
      if (isDuplicateConversion(dedupeKey)) {
        result.duplicateCount++;
        continue;
      }
    }

    const rawMeta = (item.metadata as Record<string, unknown>) || (item.properties as Record<string, unknown>);
    const cleanMeta = sanitizeEventMetadata(rawMeta);

    const validEvent: IngestedTelemetryEvent = {
      eventId,
      visitorId,
      anonymousId: visitorId,
      sessionId,
      userId: serverDerivedUserId || null, // Server strictly decides user_id
      eventName,
      occurredAt: typeof item.occurredAt === "string" ? item.occurredAt : (typeof item.timestamp === "string" ? item.timestamp : new Date().toISOString()),
      route: pagePath,
      pagePath,
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
      // 1. Primary analytics_events table
      const analyticsRows = validToPersist.map((e) => ({
        event_id: e.eventId,
        visitor_id: e.visitorId || e.anonymousId,
        session_id: e.sessionId,
        anonymous_id: e.anonymousId,
        user_id: e.userId || null,
        event_name: e.eventName,
        page_path: e.pagePath || e.route || "/",
        route: e.route || e.pagePath || "/",
        properties: {
          ...e.metadata,
          stream: e.stream || null,
          subject: e.subject || null,
          skill_id: e.skillId || null,
          mission_id: e.missionId || null,
          content_id: e.contentId || null,
        },
        occurred_at: e.occurredAt,
      }));
      
      // Try with visitor_id and page_path first
      const { error: analyticsError } = await supabase.from("analytics_events").insert(analyticsRows);
      if (analyticsError) {
        console.warn("[Analytics] analytics_events insert failed:", analyticsError.message);
        // Fallback: insert without visitor_id and page_path (columns may not exist in production)
        const fallbackRows = validToPersist.map((e) => ({
          event_id: e.eventId,
          session_id: e.sessionId,
          anonymous_id: e.anonymousId,
          user_id: e.userId || null,
          event_name: e.eventName,
          route: e.route || e.pagePath || "/",
          properties: {
            ...e.metadata,
            page_path: e.pagePath || e.route || "/",
            visitor_id: e.visitorId || e.anonymousId,
            stream: e.stream || null,
            subject: e.subject || null,
            skill_id: e.skillId || null,
            mission_id: e.missionId || null,
            content_id: e.contentId || null,
          },
          occurred_at: e.occurredAt,
        }));
        const { error: fallbackError } = await supabase.from("analytics_events").insert(fallbackRows);
        if (fallbackError) {
          console.warn("[Analytics] analytics_events fallback insert also failed:", fallbackError.message);
        }
      }

      // 2. Legacy telemetry_events table
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
      const { error: legacyError } = await supabase.from("telemetry_events").insert(rows);
      if (legacyError) {
        console.warn("[Analytics] telemetry_events insert failed:", legacyError.message);
      }
    } catch (err: any) {
      console.warn("[Analytics] Supabase persistence exception:", err?.message);
    }
  }

  return result;
}

/**
 * Authoritative Server-Side Business Event Emitter.
 * Used exclusively by server endpoints when database state changes (e.g. order approved, subscription created).
 * The business tables remain the single source of truth; analytics records downstream visibility.
 */
export async function recordAuthoritativeBusinessEvent(params: {
  eventName: "subscription_created" | "payment_confirmed" | "subscription_expired";
  userId?: string | null;
  sessionId?: string;
  visitorId?: string;
  metadata?: Record<string, unknown>;
  pagePath?: string;
}): Promise<void> {
  const { eventName, userId, sessionId, visitorId, metadata, pagePath = "/" } = params;

  let eventId: string;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    eventId = `evt_${crypto.randomUUID()}`;
  } else {
    eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  const cleanMeta = sanitizeEventMetadata(metadata);
  const now = new Date().toISOString();

  const record: IngestedTelemetryEvent = {
    eventId,
    visitorId: visitorId || "server_authoritative",
    anonymousId: visitorId || "server_authoritative",
    sessionId: sessionId || "server_session",
    userId: userId || null,
    eventName,
    occurredAt: now,
    pagePath,
    route: pagePath,
    metadata: cleanMeta,
    createdAt: now,
  };

  memoryTelemetryEvents.unshift(record);
  if (memoryTelemetryEvents.length > 1000) {
    memoryTelemetryEvents.pop();
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("analytics_events").insert({
        event_id: eventId,
        visitor_id: visitorId || null,
        session_id: sessionId || "server_session",
        anonymous_id: visitorId || "server_authoritative",
        user_id: userId || null,
        event_name: eventName,
        page_path: pagePath,
        route: pagePath,
        properties: cleanMeta,
        occurred_at: now,
      });

      await supabase.from("telemetry_events").insert({
        event_id: eventId,
        anonymous_id: visitorId || "server_authoritative",
        session_id: sessionId || "server_session",
        user_id: userId || null,
        event_name: eventName,
        occurred_at: now,
        route: pagePath,
        metadata: cleanMeta,
      });
    } catch (e) {
      console.warn(`[Analytics] Failed to persist authoritative business event ${eventName}:`, e);
    }
  }
}

export function getStoredTelemetryEvents(limit: number = 100): IngestedTelemetryEvent[] {
  return memoryTelemetryEvents.slice(0, limit);
}

export function clearMemoryTelemetry(): void {
  memoryTelemetryEvents.length = 0;
  seenEventIds.clear();
}
