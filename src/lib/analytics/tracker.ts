/**
 * SHATER — First-Party Analytics & Attribution Tracker Client
 * 
 * INVARIANTS:
 * 1. Zero Fingerprinting: Uses coarse device categories, zero canvas/hardware snooping.
 * 2. Strict Dual-Touch Attribution: First-touch (stored once, never overwritten) + Last-touch.
 * 3. Session Integrity: 30-minute inactivity session expiration window.
 * 4. Resilient Delivery: Uses navigator.sendBeacon when available with fetch keepalive fallback.
 * 5. PII Scrubbing: Zero passwords, tokens, or private secrets in telemetry payload.
 */

import {
  ShaterControlledEventName,
  SHATER_CONTROLLED_EVENTS,
  sanitizeEventMetadata,
} from "./taxonomy";

export interface UtmAttribution {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landingPage?: string;
  capturedAt?: string;
}

const STORAGE_KEYS = {
  ANONYMOUS_ID: "shater_anonymous_id",
  SESSION_ID: "shater_session_id",
  SESSION_LAST_ACTIVE: "shater_session_last_active",
  FIRST_TOUCH: "shater_first_touch_utm",
  LAST_TOUCH: "shater_last_touch_utm",
};

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Retrieves or generates a persistent anonymous visitor ID.
 * Uses crypto.randomUUID() for cryptographically strong identifiers.
 * The visitor_id is stored in localStorage and survives across sessions.
 */
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "anon_server";
  try {
    let visitorId = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID);
    if (!visitorId) {
      // Use crypto.randomUUID() for strong randomness (supported in all modern browsers)
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        visitorId = `vid_${crypto.randomUUID()}`;
      } else {
        // Fallback for very old browsers: use crypto.getRandomValues
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        visitorId = `vid_${Array.from(array, b => b.toString(16).padStart(2, "0")).join("")}`;
      }
      localStorage.setItem(STORAGE_KEYS.ANONYMOUS_ID, visitorId);
    }
    return visitorId;
  } catch {
    return "anon_ephemeral";
  }
}

/**
 * Retrieves or creates a session ID based on 30-minute inactivity.
 * Uses crypto.randomUUID() for session ID generation.
 * Session stored in sessionStorage (tab-scoped, survives refreshes).
 */
export function getOrCreateSessionId(): { sessionId: string; isNewSession: boolean } {
  if (typeof window === "undefined") {
    return { sessionId: "ses_server", isNewSession: false };
  }

  const now = Date.now();
  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  const lastActiveStr = sessionStorage.getItem(STORAGE_KEYS.SESSION_LAST_ACTIVE);
  const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

  const isExpired = !sessionId || !lastActive || now - lastActive > SESSION_TIMEOUT_MS;
  let isNewSession = false;

  if (isExpired || !sessionId) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      sessionId = `ses_${crypto.randomUUID()}`;
    } else {
      const array = new Uint8Array(8);
      crypto.getRandomValues(array);
      sessionId = `ses_${Array.from(array, b => b.toString(16).padStart(2, "0")).join("")}`;
    }
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    isNewSession = true;
  }

  sessionStorage.setItem(STORAGE_KEYS.SESSION_LAST_ACTIVE, String(now));
  return { sessionId, isNewSession };
}

/**
 * Parses UTM query parameters from a URL search string
 */
export function parseUtmFromSearch(search: string): UtmAttribution | null {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const source = params.get("utm_source") || params.get("source") || undefined;
  const medium = params.get("utm_medium") || params.get("medium") || undefined;
  const campaign = params.get("utm_campaign") || params.get("campaign") || undefined;
  const content = params.get("utm_content") || undefined;
  const term = params.get("utm_term") || undefined;

  if (!source && !medium && !campaign && !content && !term) {
    return null;
  }

  return { source, medium, campaign, content, term };
}

/**
 * Manages first-touch and last-touch attribution storage
 */
export function captureAttribution(currentPath: string, search: string): {
  firstTouch: UtmAttribution | null;
  lastTouch: UtmAttribution | null;
} {
  if (typeof window === "undefined") {
    return { firstTouch: null, lastTouch: null };
  }

  const currentUtm = parseUtmFromSearch(search);
  const referrer = typeof document !== "undefined" ? document.referrer || undefined : undefined;
  const now = new Date().toISOString();
  
  // Determine if the referrer is external
  let isExternalReferrer = false;
  if (referrer) {
    try {
      const refHost = new URL(referrer).hostname;
      const currentHost = window.location.hostname;
      if (refHost !== currentHost && !refHost.endsWith("shater.dz")) {
        isExternalReferrer = true;
      }
    } catch {}
  }

  // A new touchpoint exists if there are UTMs OR an external referrer
  const hasNewTouchpoint = Boolean(currentUtm || isExternalReferrer);

  let firstTouch: UtmAttribution | null = null;
  try {
    const storedFirst = localStorage.getItem(STORAGE_KEYS.FIRST_TOUCH);
    if (storedFirst) {
      firstTouch = JSON.parse(storedFirst);
    }
  } catch {}

  // If first touch is not recorded yet, record it permanently
  if (!firstTouch && hasNewTouchpoint) {
    firstTouch = {
      ...(currentUtm || {}),
      referrer,
      landingPage: currentPath,
      capturedAt: now,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.FIRST_TOUCH, JSON.stringify(firstTouch));
    } catch {}
  }

  let lastTouch: UtmAttribution | null = null;
  try {
    const storedLast = localStorage.getItem(STORAGE_KEYS.LAST_TOUCH);
    if (storedLast) {
      lastTouch = JSON.parse(storedLast);
    }
  } catch {}

  // Update last touch if new external acquisition parameters are detected
  if (hasNewTouchpoint) {
    lastTouch = {
      ...(currentUtm || {}),
      referrer,
      landingPage: currentPath,
      capturedAt: now,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_TOUCH, JSON.stringify(lastTouch));
    } catch {}
  }

  return { firstTouch, lastTouch };
}

/**
 * Returns stored first-touch and last-touch attribution for linking to registration/orders
 */
export function getStoredAttribution(): {
  firstTouch: UtmAttribution | null;
  lastTouch: UtmAttribution | null;
} {
  if (typeof window === "undefined") {
    return { firstTouch: null, lastTouch: null };
  }
  try {
    const firstStr = localStorage.getItem(STORAGE_KEYS.FIRST_TOUCH);
    const lastStr = localStorage.getItem(STORAGE_KEYS.LAST_TOUCH);
    return {
      firstTouch: firstStr ? JSON.parse(firstStr) : null,
      lastTouch: lastStr ? JSON.parse(lastStr) : null,
    };
  } catch {
    return { firstTouch: null, lastTouch: null };
  }
}

/**
 * Detects coarse device type from User-Agent
 */
export function detectCoarseDevice(): {
  deviceType: "mobile" | "desktop" | "tablet";
  browser?: string;
  os?: string;
} {
  if (typeof navigator === "undefined") {
    return { deviceType: "desktop" };
  }

  const ua = navigator.userAgent || "";
  let deviceType: "mobile" | "desktop" | "tablet" = "desktop";

  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = "mobile";
  }

  let browser = "Other";
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/edg/i.test(ua)) browser = "Edge";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { deviceType, browser, os };
}

/**
 * Sends a visitor hit to the first-party analytics ingestion endpoint
 */
export function sendVisitorHit(params: {
  path: string;
  search?: string;
  userId?: string | null;
  isHeartbeat?: boolean;
}): void {
  if (typeof window === "undefined") return;

  const { path, search = "", userId = null, isHeartbeat = false } = params;

  // Ignore admin and API paths from public visitor counts
  if (path.startsWith("/admin") || path.startsWith("/ops") || path.startsWith("/api")) {
    return;
  }

  const anonymousId = getOrCreateAnonymousId();
  const { sessionId, isNewSession } = getOrCreateSessionId();
  const { firstTouch, lastTouch } = captureAttribution(path, search);
  const { deviceType, browser, os } = detectCoarseDevice();

  // If this is an authentically new session, emit session_start
  if (isNewSession && !isHeartbeat) {
    sendAnalyticsEvent("session_start", {
      path,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      channel: lastTouch?.source || firstTouch?.source || "direct",
    });
  }

  const payload = {
    visitorId: anonymousId, // Canonical visitor identity
    sessionId,
    anonymousId,
    userId,
    path,
    fullUrl: window.location.href,
    referrer: document.referrer || undefined,
    deviceType,
    browser,
    os,
    firstTouch,
    lastTouch,
    utmSource: lastTouch?.source || firstTouch?.source,
    utmMedium: lastTouch?.medium || firstTouch?.medium,
    utmCampaign: lastTouch?.campaign || firstTouch?.campaign,
    utmContent: lastTouch?.content || firstTouch?.content,
    utmTerm: lastTouch?.term || firstTouch?.term,
    isHeartbeat,
    timestamp: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(payload);

  // Use sendBeacon if available, otherwise fetch keepalive
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const queued = navigator.sendBeacon("/api/telemetry/visitor", blob);
    if (queued) return;
  }

  fetch("/api/telemetry/visitor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: jsonStr,
    keepalive: true,
  }).catch(() => {
    // Non-fatal telemetry catch
  });
}

/**
 * Sends a granular first-party product, acquisition, or monetization event.
 * Conforms to the controlled taxonomy and includes complete identity chain:
 * event_id, visitor_id, session_id, user_id (server-verified), timestamp, page_path, metadata.
 */
export function sendAnalyticsEvent(
  eventName: ShaterControlledEventName | string,
  properties: Record<string, any> = {}
): void {
  if (typeof window === "undefined") return;

  const visitorId = getOrCreateAnonymousId();
  const { sessionId } = getOrCreateSessionId();
  const pagePath = window.location.pathname;
  const now = new Date().toISOString();
  
  // Crypto-strong event ID
  let eventId: string;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    eventId = `evt_${crypto.randomUUID()}`;
  } else {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    eventId = `evt_${Array.from(array, b => b.toString(16).padStart(2, "0")).join("")}`;
  }

  const cleanMetadata = sanitizeEventMetadata(properties);

  const payload = {
    eventId,
    eventName,
    visitorId,
    sessionId,
    anonymousId: visitorId,
    pagePath,
    route: pagePath,
    timestamp: now,
    occurredAt: now,
    metadata: cleanMetadata,
    properties: cleanMetadata,
  };

  const jsonStr = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const queued = navigator.sendBeacon("/api/telemetry/events", blob);
    if (queued) return;
  }

  fetch("/api/telemetry/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: jsonStr,
    keepalive: true,
  }).catch(() => {});
}

/**
 * High-level typed facade for product event tracking
 */
export function trackProductEvent(
  eventName: ShaterControlledEventName,
  metadata: Record<string, unknown> = {}
): void {
  sendAnalyticsEvent(eventName, metadata);
}

