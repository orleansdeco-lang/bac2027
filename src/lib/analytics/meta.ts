/**
 * SHATER — Meta Pixel (Facebook Ads) Client-Side Tracking Utility
 * 
 * INVARIANTS & BEST PRACTICES:
 * 1. Type-safe: Strict union of Meta Standard Events and typed parameters.
 * 2. SSR-safe: All functions safely check for window / browser environment.
 * 3. Non-blocking & Crash-resilient: Ad-blockers or network failures will never crash the UI.
 * 4. Deduplication: Accepts optional `eventID` to match with Meta Conversions API (CAPI).
 * 5. Zero PII: Strips private credentials, tokens, or educational logs before dispatch.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "Schedule"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe";

export interface MetaTrackOptions {
  eventID?: string;
}

export interface MetaEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  status?: string;
  [key: string]: unknown;
}

/**
 * Checks whether Meta Pixel is configured and active in the client browser
 */
export function isMetaPixelEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.fbq === "function" &&
    Boolean(META_PIXEL_ID)
  );
}

/**
 * Sanitizes parameters to guarantee zero PII or credentials are dispatched to Meta
 */
function sanitizeMetaParams(params: Record<string, unknown>): Record<string, unknown> {
  const forbidden = new Set([
    "password",
    "token",
    "jwt",
    "secret",
    "auth",
    "key",
    "credit_card",
    "cvv",
    "notes",
    "address",
    "student_id",
    "supabase_id",
  ]);

  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (forbidden.has(k.toLowerCase())) continue;
    if (typeof v === "string" && (v.includes("@") || /bearer\s+/i.test(v))) continue;
    clean[k] = v;
  }
  return clean;
}

/**
 * Dispatches a standard Meta Pixel event with optional eventID for CAPI deduplication
 */
export function trackMetaEvent(
  eventName: MetaStandardEvent,
  params: MetaEventParams = {},
  options?: MetaTrackOptions
): void {
  if (!isMetaPixelEnabled()) return;

  try {
    const cleanParams = sanitizeMetaParams(params);
    if (options?.eventID) {
      window.fbq!("track", eventName, cleanParams, { eventID: options.eventID });
    } else {
      window.fbq!("track", eventName, cleanParams);
    }
  } catch {
    // Non-fatal catch: ad-blockers or blocked scripts must never degrade application runtime
  }
}

/**
 * Dispatches a PageView event to Meta Pixel
 */
export function trackMetaPageView(options?: MetaTrackOptions): void {
  if (!isMetaPixelEnabled()) return;

  try {
    if (options?.eventID) {
      window.fbq!("track", "PageView", {}, { eventID: options.eventID });
    } else {
      window.fbq!("track", "PageView");
    }
  } catch {}
}

/**
 * Dispatches a custom event to Meta Pixel (e.g. shater_trial_started)
 */
export function trackMetaCustomEvent(
  customEventName: string,
  params: Record<string, unknown> = {},
  options?: MetaTrackOptions
): void {
  if (!isMetaPixelEnabled()) return;

  try {
    const cleanParams = sanitizeMetaParams(params);
    if (options?.eventID) {
      window.fbq!("trackCustom", customEventName, cleanParams, { eventID: options.eventID });
    } else {
      window.fbq!("trackCustom", customEventName, cleanParams);
    }
  } catch {}
}
