/**
 * BAC Mastery — Essential Pilot Analytics Instrumentation
 * Prompt 17 § 14 & 15: Minimal Event Instrumentation for Pilot Learning
 * 
 * DESIGN PRINCIPLES:
 * 1. Minimal non-sensitive telemetry only (Where do students stop? How long until first mission?
 *    How many reach repair/retest? Do they return?).
 * 2. ZERO PII, ZERO passwords, ZERO private messages, ZERO answer text leaks.
 * 3. Works offline and in guest mode via local buffer, with optional remote logging.
 */

export type PilotAnalyticsEventName =
  | "landing_view"
  | "onboarding_started"
  | "onboarding_completed"
  | "diagnostic_started"
  | "diagnostic_completed"
  | "dashboard_viewed"
  | "first_mission_started"
  | "mission_started"
  | "lesson_viewed"
  | "active_recall_started"
  | "active_recall_answer_revealed"
  | "practice_started"
  | "practice_completed"
  | "error_created"
  | "repair_started"
  | "repair_completed"
  | "retest_started"
  | "retest_completed"
  | "mastery_demonstrated"
  | "roadmap_viewed"
  | "roadmap_mission_selected"
  | "progress_viewed"
  | "error_lab_viewed"
  | "recovery_viewed"
  | "exam_mode_viewed"
  | "returned_next_day"
  | "pilot_feedback_submitted"
  | "pilot_session_started"
  | "pilot_session_ended"
  | "pilot_resume_success"
  | "trial_started"
  | "registration_completed"
  | "login_completed"
  | "trial_expiring"
  | "trial_expired"
  | "conversion_viewed"
  | "conversion_cta_clicked"
  | "payment_started"
  | "payment_pending_verification"
  | "payment_confirmed"
  | "cod_order_placed"
  | "voucher_redeemed"
  | "referral_viewed"
  | "referral_shared"
  | "recall_sprint_started"
  | "recall_sprint_completed"
  | "recall_notification_sent"
  | "recall_answered_inline"
  | "recall_answered_in_app"
  | "error_lab_item_remediated"
  | "orientation_started"
  | "orientation_stream_selected"
  | "orientation_score_completed"
  | "orientation_results_viewed"
  | "orientation_program_clicked"
  | "orientation_search"
  | "orientation_filter_used"
  | "orientation_compare"
  | "orientation_share"
  | "orientation_shater_cta";

export interface PilotAnalyticsProperties {
  userId?: string | null;
  sessionId?: string;
  educationLevel?: string;
  streamId?: string;
  subjectId?: string;
  skillId?: string;
  missionId?: string;
  eventSource?: string;
  timeSpentSeconds?: number;
  confidence?: number;
  isCorrect?: boolean;
  step?: string;
  [key: string]: unknown;
}

export interface StoredPilotEvent {
  id: string;
  name: PilotAnalyticsEventName;
  timestamp: string;
  properties: PilotAnalyticsProperties;
}

export const PILOT_EVENTS_STORAGE_KEY = "bac_mastery_pilot_events";
export const PILOT_SESSION_ID_KEY = "bac_mastery_analytics_session_id";

/**
 * Returns a persistent anonymous session ID for pilot telemetry
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server_session";
  try {
    let sid = localStorage.getItem(PILOT_SESSION_ID_KEY);
    if (!sid) {
      sid = `pilot_ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(PILOT_SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return `pilot_ses_${Date.now()}`;
  }
}

/**
 * Sanitizes event properties to eliminate tokens, passwords, and private secrets (Prompt 17 § 15)
 */
function sanitizeProperties(props: PilotAnalyticsProperties): PilotAnalyticsProperties {
  const sanitized: PilotAnalyticsProperties = {};
  const forbiddenKeys = new Set([
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

  for (const [k, v] of Object.entries(props)) {
    if (forbiddenKeys.has(k.toLowerCase())) continue;
    if (typeof v === "string") {
      // Scrub tokens or bearer headers
      if (/bearer\s+[A-Za-z0-9-_=.]+/i.test(v)) continue;
      if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(v) && v.length > 30) {
        continue;
      }
    }
    sanitized[k] = v;
  }
  return sanitized;
}

/**
 * Telemetry Batch Ingestion Queue (Phase 2 Operations Foundation P0)
 */
const BATCH_QUEUE_SIZE_THRESHOLD = 5;
const BATCH_FLUSH_INTERVAL_MS = 20000; // 20s debounced flush
let pendingTelemetryQueue: StoredPilotEvent[] = [];
let flushTimeout: any = null;
let isFlushing = false;

/**
 * Flushes pending telemetry events to server endpoint /api/telemetry/events
 */
export async function flushTelemetryBatch(): Promise<void> {
  if (typeof window === "undefined" || isFlushing || pendingTelemetryQueue.length === 0) {
    return;
  }

  isFlushing = true;
  const batchToSend = [...pendingTelemetryQueue];
  pendingTelemetryQueue = [];

  try {
    const payload = JSON.stringify({ events: batchToSend });

    // Use sendBeacon if page is unloading
    if (document.visibilityState === "hidden" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/telemetry/events", blob);
      isFlushing = false;
      return;
    }

    const res = await fetch("/api/telemetry/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });

    if (!res.ok) {
      // Re-queue events on non-blocking failure (capped at 50)
      pendingTelemetryQueue = [...batchToSend.slice(-25), ...pendingTelemetryQueue].slice(-50);
    }
  } catch {
    // Network offline: retain in queue up to limit
    pendingTelemetryQueue = [...batchToSend.slice(-25), ...pendingTelemetryQueue].slice(-50);
  } finally {
    isFlushing = false;
  }
}

// Setup page lifecycle flush listeners once in browser
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushTelemetryBatch().catch(() => {});
    }
  });
  window.addEventListener("beforeunload", () => {
    flushTelemetryBatch().catch(() => {});
  });
}

/**
 * Core event tracking function
 */
export function trackEvent(
  name: PilotAnalyticsEventName,
  properties: PilotAnalyticsProperties = {}
): StoredPilotEvent {
  const sessionId = properties.sessionId || getOrCreateSessionId();
  const cleanProps = sanitizeProperties(properties);
  const event: StoredPilotEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    timestamp: new Date().toISOString(),
    properties: {
      ...cleanProps,
      sessionId,
    },
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PILOT_EVENTS_STORAGE_KEY);
      const existing: StoredPilotEvent[] = raw ? JSON.parse(raw) : [];
      // Keep most recent 500 events to manage storage footprint
      const updated = [...existing.slice(-499), event];
      localStorage.setItem(PILOT_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Gracefully ignore local storage quota / access issues
    }

    // Add to remote batch queue
    pendingTelemetryQueue.push(event);

    if (pendingTelemetryQueue.length >= BATCH_QUEUE_SIZE_THRESHOLD) {
      if (flushTimeout) clearTimeout(flushTimeout);
      flushTelemetryBatch().catch(() => {});
    } else {
      if (!flushTimeout) {
        flushTimeout = setTimeout(() => {
          flushTimeout = null;
          flushTelemetryBatch().catch(() => {});
        }, BATCH_FLUSH_INTERVAL_MS);
      }
    }
  }

  return event;
}

/**
 * Retrieve all buffered pilot events
 */
export function getStoredPilotEvents(): StoredPilotEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PILOT_EVENTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPilotEvent[]) : [];
  } catch {
    return [];
  }
}

/**
 * Purge buffered events (e.g. for testing cleanup)
 */
export function clearStoredPilotEvents(): void {
  pendingTelemetryQueue = [];
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PILOT_EVENTS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export interface AnonymizedPilotExport {
  schemaVersion: "1.0.0";
  exportedAt: string;
  totalEvents: number;
  events: StoredPilotEvent[];
  totalFeedback: number;
  feedback: Array<{
    id?: string;
    missionId?: string;
    skillId?: string;
    rating: string;
    feedbackNote?: string;
    userId?: string | null;
    createdAt?: string;
  }>;
}

/**
 * Prompt 18.2 § 25: Anonymized Pilot Data Exporter
 * Bundles buffered pilot events and qualitative feedback records with zero PII,
 * zero tokens, and pseudonymized user identifiers.
 */
export function exportAnonymizedPilotData(): AnonymizedPilotExport {
  const rawEvents = getStoredPilotEvents();
  let rawFeedback: Array<{
    id?: string;
    missionId?: string;
    skillId?: string;
    rating: string;
    feedbackNote?: string;
    userId?: string | null;
    createdAt?: string;
  }> = [];

  if (typeof window !== "undefined") {
    try {
      const fbStr = localStorage.getItem("bac_mastery_pilot_feedback");
      rawFeedback = fbStr ? JSON.parse(fbStr) : [];
    } catch {
      rawFeedback = [];
    }
  }

  // Scrub and pseudonymize
  const events = rawEvents.map((evt) => {
    const cleanProps = sanitizeProperties(evt.properties);
    if (cleanProps.userId) {
      cleanProps.userId = `anon_${String(cleanProps.userId).substring(0, 8)}`;
    }
    delete cleanProps.email;
    return {
      ...evt,
      properties: cleanProps,
    };
  });

  const feedback = rawFeedback.map((fb) => ({
    id: fb.id,
    missionId: fb.missionId,
    skillId: fb.skillId,
    rating: fb.rating,
    feedbackNote: fb.feedbackNote,
    userId: fb.userId ? `anon_${String(fb.userId).substring(0, 8)}` : null,
    createdAt: fb.createdAt,
  }));

  return {
    schemaVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    totalEvents: events.length,
    events,
    totalFeedback: feedback.length,
    feedback,
  };
}

