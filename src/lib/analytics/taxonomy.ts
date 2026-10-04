/**
 * SHATER — Controlled Analytics Event Taxonomy & Validation
 * 
 * INVARIANTS:
 * 1. Strict Taxonomy: Only approved product, acquisition, monetization, and engagement events.
 * 2. Zero PII: Passwords, tokens, phone numbers, emails, and full student identities are scrubbed.
 * 3. Payload Bounds: Maximum 4KB metadata JSON, keys limited to 20, values max 500 chars.
 * 4. Idempotency: Critical conversion events are deduplicated to prevent double-counting.
 */

export const SHATER_CONTROLLED_EVENTS = {
  // ACQUISITION
  PAGE_VIEW: "page_view",
  PAGE_LEAVE: "page_leave",
  SESSION_START: "session_start",

  // REGISTRATION
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN: "login",
  LOGOUT: "logout",

  // PRODUCT
  DIWAN_OPENED: "diwan_opened",
  DIWAN_TABLE_CREATED: "diwan_table_created",
  DIWAN_TABLE_JOINED: "diwan_table_joined",
  PLANNER_OPENED: "planner_opened",
  EXAM_OPENED: "exam_opened",
  EXAM_STARTED: "exam_started",
  EXAM_COMPLETED: "exam_completed",
  SUMMARY_OPENED: "summary_opened",
  SUBJECT_OPENED: "subject_opened",
  CALCULATOR_USED: "calculator_used",
  ORIENTATION_OPENED: "orientation_opened",

  // MONETIZATION
  TRIAL_STARTED: "trial_started",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_CREATED: "subscription_created",
  PAYMENT_SUBMITTED: "payment_submitted",
  PAYMENT_CONFIRMED: "payment_confirmed",
  SUBSCRIPTION_EXPIRED: "subscription_expired",

  // ENGAGEMENT
  SESSION_ACTIVITY: "session_activity",
} as const;

export type ShaterControlledEventName =
  typeof SHATER_CONTROLLED_EVENTS[keyof typeof SHATER_CONTROLLED_EVENTS];

export const CONTROLLED_EVENTS_SET = new Set<string>(
  Object.values(SHATER_CONTROLLED_EVENTS)
);

/**
 * Critical conversion events requiring strict idempotency window
 */
export const CRITICAL_CONVERSION_EVENTS = new Set<string>([
  SHATER_CONTROLLED_EVENTS.SIGNUP_COMPLETED,
  SHATER_CONTROLLED_EVENTS.TRIAL_STARTED,
  SHATER_CONTROLLED_EVENTS.CHECKOUT_STARTED,
  SHATER_CONTROLLED_EVENTS.PAYMENT_SUBMITTED,
  SHATER_CONTROLLED_EVENTS.PAYMENT_CONFIRMED,
  SHATER_CONTROLLED_EVENTS.SUBSCRIPTION_CREATED,
]);

/**
 * Forbidden keys that could contain student PII or authentication secrets
 */
export const FORBIDDEN_METADATA_KEYS = new Set<string>([
  "password",
  "password_hash",
  "token",
  "access_token",
  "refresh_token",
  "secret",
  "bearer",
  "jwt",
  "api_key",
  "apikey",
  "phone",
  "student_phone",
  "parent_phone",
  "email",
  "student_email",
  "parent_email",
  "full_name",
  "first_name",
  "last_name",
  "address",
  "national_id",
  "nin",
]);

export interface StandardAnalyticsEventPayload {
  eventId: string;
  visitorId: string;
  sessionId: string;
  userId?: string | null;
  eventName: ShaterControlledEventName | string;
  timestamp: string;
  pagePath?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Validates and scrubs event metadata to enforce privacy, size limits, and security.
 */
export function sanitizeEventMetadata(
  meta?: Record<string, unknown>
): Record<string, unknown> {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};

  const clean: Record<string, unknown> = {};
  let keyCount = 0;

  for (const [rawKey, rawVal] of Object.entries(meta)) {
    if (keyCount >= 20) break; // Maximum 20 keys per event

    const key = rawKey.trim().toLowerCase();
    if (FORBIDDEN_METADATA_KEYS.has(key)) continue;

    // Scrub values
    if (typeof rawVal === "string") {
      // Check for JWT-like strings or Bearer headers
      if (/bearer\s+[A-Za-z0-9-_=.]+/i.test(rawVal)) continue;
      if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(rawVal) && rawVal.length > 30) {
        continue;
      }
      // Check for Algerian phone numbers in strings
      if (/(05|06|07|02)\d{8}/.test(rawVal.replace(/\s+/g, ""))) continue;
      // Truncate long strings to 500 characters
      clean[rawKey] = rawVal.slice(0, 500);
      keyCount++;
    } else if (typeof rawVal === "number" || typeof rawVal === "boolean") {
      clean[rawKey] = rawVal;
      keyCount++;
    } else if (rawVal === null || rawVal === undefined) {
      // omit null/undefined
    } else if (typeof rawVal === "object" && !Array.isArray(rawVal)) {
      // Shallow nested object (max 1 level)
      const subClean: Record<string, unknown> = {};
      for (const [sk, sv] of Object.entries(rawVal)) {
        if (FORBIDDEN_METADATA_KEYS.has(sk.toLowerCase())) continue;
        if (typeof sv === "string" || typeof sv === "number" || typeof sv === "boolean") {
          subClean[sk] = typeof sv === "string" ? sv.slice(0, 200) : sv;
        }
      }
      clean[rawKey] = subClean;
      keyCount++;
    }
  }

  // Ensure overall size does not exceed 4KB
  const str = JSON.stringify(clean);
  if (str.length > 4096) {
    return { truncated: true, summary: "Metadata exceeded 4KB limit" };
  }

  return clean;
}
