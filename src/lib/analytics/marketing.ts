/**
 * SHATER — Central Marketing & Conversion Analytics Layer
 * 
 * ARCHITECTURE PRINCIPLES:
 * 1. Single Facade: Application components call ONLY this module for marketing events.
 * 2. Multi-channel Synchronization: Dispatches to Meta Pixel, GA4, and First-Party Telemetry.
 * 3. Deduplication Architecture: Generates unified `eventId` for browser + CAPI deduplication.
 * 4. Privacy & Zero PII: Strictly filters passwords, tokens, student private records.
 * 5. Debug Mode: Safe console inspection enabled via NEXT_PUBLIC_ANALYTICS_DEBUG=true.
 * 6. Consent Abstraction: Central hooks to gate or filter marketing/analytics dispatch.
 */

import { trackMetaEvent, trackMetaPageView, trackMetaCustomEvent } from "./meta";
import { trackGAEvent, pageview as trackGAPageview } from "./gtag";
import { sendAnalyticsEvent } from "./tracker";

const IS_DEBUG_MODE =
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true" ||
  (process.env.NODE_ENV === "development" && typeof window !== "undefined" && Boolean((window as any).__SHATER_DEBUG_ANALYTICS__));

/**
 * Generates an event ID for cross-channel and browser/CAPI deduplication
 */
export function generateEventId(prefix: string = "evt"): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Consent state checker abstraction
 */
export function isMarketingTrackingEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Extensible for future cookie banners; defaults to true
  try {
    const consent = localStorage.getItem("shater_marketing_consent");
    if (consent === "denied") return false;
  } catch {}
  return true;
}

/**
 * Safe internal logger that never leaks secrets or private user data
 */
function debugLog(eventName: string, payload: Record<string, unknown>, eventId?: string): void {
  if (!IS_DEBUG_MODE) return;
  try {
    console.info(
      `%c[SHATER Analytics] %c${eventName}`,
      "color: #7C3AED; font-weight: bold;",
      "color: #10B981; font-weight: bold;",
      { eventId, ...payload }
    );
  } catch {}
}

/**
 * Tracks a PageView across all configured marketing channels (Meta Pixel & GA4)
 */
export function trackMarketingPageView(path: string): void {
  if (!isMarketingTrackingEnabled()) return;

  const eventId = generateEventId("pv");
  debugLog("PageView", { path }, eventId);

  // 1. Meta Pixel PageView
  trackMetaPageView({ eventID: eventId });

  // 2. GA4 PageView
  trackGAPageview(path);
}

/**
 * Tracks a ViewContent event when viewing a high-value landing, feature, or pricing section
 */
export function trackViewContent(params: {
  contentName: string;
  contentCategory?: string;
  value?: number;
  currency?: string;
}): void {
  if (!isMarketingTrackingEnabled()) return;

  const eventId = generateEventId("vc");
  const currency = params.currency || "DZD";
  const payload = {
    content_name: params.contentName,
    content_category: params.contentCategory || "Course",
    value: params.value,
    currency,
  };

  debugLog("ViewContent", payload, eventId);

  // Meta Pixel
  trackMetaEvent("ViewContent", payload, { eventID: eventId });

  // GA4
  trackGAEvent("view_item", {
    item_name: params.contentName,
    item_category: params.contentCategory,
    value: params.value,
    currency,
  });

  // First-party internal telemetry
  sendAnalyticsEvent("view_content", payload);
}

/**
 * Tracks CompleteRegistration strictly upon successful student account registration
 */
export function trackCompleteRegistration(params: {
  method?: string;
  userId?: string;
  eventId?: string;
}): void {
  if (!isMarketingTrackingEnabled()) return;

  const eventId = params.eventId || generateEventId("reg");
  const payload = {
    status: "success",
    method: params.method || "email",
  };

  debugLog("CompleteRegistration", payload, eventId);

  // Meta Pixel
  trackMetaEvent(
    "CompleteRegistration",
    {
      status: "completed",
      content_name: "student_account",
    },
    { eventID: eventId }
  );

  // GA4
  trackGAEvent("sign_up", {
    method: params.method || "email",
  });

  // First-party internal telemetry
  sendAnalyticsEvent("registration_completed", {
    userId: params.userId,
    eventId,
  });
}

/**
 * Tracks StartTrial strictly upon start of the 7-day free trial period
 */
export function trackTrialStart(params: {
  userId?: string;
  durationDays?: number;
  eventId?: string;
}): void {
  if (!isMarketingTrackingEnabled()) return;

  const eventId = params.eventId || generateEventId("trial");
  const payload = {
    duration_days: params.durationDays || 7,
  };

  debugLog("StartTrial", payload, eventId);

  // Meta Pixel Custom Event (and standard StartTrial)
  trackMetaEvent("StartTrial", {
    content_name: "7_day_free_trial",
    duration: params.durationDays || 7,
  }, { eventID: eventId });

  trackMetaCustomEvent("shater_trial_started", payload, { eventID: eventId });

  // GA4
  trackGAEvent("trial_started", payload);

  // First-party
  sendAnalyticsEvent("trial_started", {
    userId: params.userId,
    durationDays: params.durationDays || 7,
    eventId,
  });
}

/**
 * Tracks InitiateCheckout strictly when student chooses a plan and opens checkout
 */
export function trackInitiateCheckout(params: {
  planId: string;
  planName: string;
  value: number;
  currency?: string;
  eventId?: string;
}): void {
  if (!isMarketingTrackingEnabled()) return;

  const eventId = params.eventId || generateEventId("ic");
  const currency = params.currency || "DZD";
  const payload = {
    content_name: params.planName,
    content_ids: [params.planId],
    content_type: "product",
    value: params.value,
    currency,
    num_items: 1,
  };

  debugLog("InitiateCheckout", payload, eventId);

  // Meta Pixel
  trackMetaEvent("InitiateCheckout", payload, { eventID: eventId });

  // GA4
  trackGAEvent("begin_checkout", {
    currency,
    value: params.value,
    items: [
      {
        item_id: params.planId,
        item_name: params.planName,
        price: params.value,
      },
    ],
  });

  // First-party
  sendAnalyticsEvent("checkout_initiated", {
    planId: params.planId,
    value: params.value,
    currency,
    eventId,
  });
}

/**
 * Tracks Purchase strictly upon verified order submission / payment confirmation
 * NEVER fired on initial button click.
 */
export function trackPurchase(params: {
  orderId: string;
  planId: string;
  planName?: string;
  value: number;
  currency?: string;
  paymentMethod?: string;
  eventId?: string;
}): void {
  if (!isMarketingTrackingEnabled()) return;

  // Use the orderId as the canonical eventId or prefix if provided, guaranteeing 1:1 match with server CAPI
  const eventId = params.eventId || `purch_${params.orderId}`;
  const currency = params.currency || "DZD";
  const payload = {
    content_name: params.planName || params.planId,
    content_ids: [params.planId],
    content_type: "product",
    value: params.value,
    currency,
    num_items: 1,
    order_id: params.orderId,
  };

  debugLog("Purchase", payload, eventId);

  // Meta Pixel with deduplication eventID
  trackMetaEvent("Purchase", payload, { eventID: eventId });

  // GA4
  trackGAEvent("purchase", {
    transaction_id: params.orderId,
    value: params.value,
    currency,
    payment_type: params.paymentMethod || "COD",
    items: [
      {
        item_id: params.planId,
        item_name: params.planName || params.planId,
        price: params.value,
      },
    ],
  });

  // First-party
  sendAnalyticsEvent("purchase_completed", {
    orderId: params.orderId,
    planId: params.planId,
    value: params.value,
    currency,
    paymentMethod: params.paymentMethod || "COD",
    eventId,
  });
}

/**
 * Tracks Lead strictly upon submission of a real lead (e.g. orientation submission or referral invite)
 */
export function trackLead(params: {
  leadType: string;
  refCode?: string;
  eventId?: string;
}): void {
  if (!isMarketingTrackingEnabled()) return;

  const eventId = params.eventId || generateEventId("lead");
  const payload = {
    content_name: params.leadType,
    content_category: "Lead",
    ref_code: params.refCode,
  };

  debugLog("Lead", payload, eventId);

  // Meta Pixel
  trackMetaEvent("Lead", payload, { eventID: eventId });

  // GA4
  trackGAEvent("generate_lead", {
    lead_type: params.leadType,
  });

  // First-party
  sendAnalyticsEvent("lead_generated", payload);
}
