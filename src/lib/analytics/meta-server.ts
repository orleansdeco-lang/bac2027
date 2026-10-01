/**
 * SHATER — Meta Conversions API (CAPI) Server-Side Service
 * 
 * INVARIANTS:
 * 1. STRICTLY SERVER-SIDE: Never imported in client components. META_ACCESS_TOKEN never reaches browser.
 * 2. Deduplication: Accepts and forwards the exact same `event_id` used by the browser Meta Pixel.
 * 3. Non-blocking & Resilient: Uses AbortController timeout. Failures NEVER block business orders or signups.
 * 4. Privacy & Hashing: Normalizes and SHA-256 hashes user parameters (phone, email) per Meta specs.
 * 5. Zero Crash: If credentials are not configured, exits silently with diagnostic status.
 */

import crypto from "crypto";

const META_PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;
const GRAPH_API_VERSION = "v20.0";
const REQUEST_TIMEOUT_MS = 4000;

export interface MetaServerEventPayload {
  eventName: "Purchase" | "CompleteRegistration" | "InitiateCheckout" | "Lead";
  eventId: string;
  eventSourceUrl?: string;
  userData?: {
    email?: string;
    phone?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    externalId?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    contentName?: string;
    contentIds?: string[];
    contentType?: string;
    orderId?: string;
    numItems?: number;
  };
}

/**
 * Hashes a string using SHA-256 after lowercase normalization
 */
function hashSha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Normalizes an Algerian phone number to international E.164 format (+213...) before hashing
 */
function normalizePhoneForMeta(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `213${digits.substring(1)}`;
  }
  if (digits.startsWith("213")) {
    return digits;
  }
  return `213${digits}`;
}

/**
 * Sends a conversion event to Meta Graph API Conversions endpoint
 */
export async function sendMetaServerEvent(payload: MetaServerEventPayload): Promise<{
  success: boolean;
  status: "sent" | "skipped" | "failed";
  error?: string;
}> {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    return {
      success: false,
      status: "skipped",
      error: "Meta CAPI credentials (META_PIXEL_ID or META_ACCESS_TOKEN) are not configured.",
    };
  }

  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Format user data with required hashing
    const formattedUserData: Record<string, unknown> = {};
    if (payload.userData?.email) {
      formattedUserData.em = [hashSha256(payload.userData.email)];
    }
    if (payload.userData?.phone) {
      formattedUserData.ph = [hashSha256(normalizePhoneForMeta(payload.userData.phone))];
    }
    if (payload.userData?.externalId) {
      formattedUserData.external_id = [hashSha256(payload.userData.externalId)];
    }
    if (payload.userData?.clientIpAddress) {
      formattedUserData.client_ip_address = payload.userData.clientIpAddress;
    }
    if (payload.userData?.clientUserAgent) {
      formattedUserData.client_user_agent = payload.userData.clientUserAgent;
    }

    const eventData: Record<string, unknown> = {
      event_name: payload.eventName,
      event_time: currentTimestamp,
      event_id: payload.eventId,
      action_source: "website",
      event_source_url: payload.eventSourceUrl || "https://shater.dz",
      user_data: formattedUserData,
      custom_data: payload.customData
        ? {
            value: payload.customData.value,
            currency: payload.customData.currency || "DZD",
            content_name: payload.customData.contentName,
            content_ids: payload.customData.contentIds,
            content_type: payload.customData.contentType || "product",
            order_id: payload.customData.orderId,
            num_items: payload.customData.numItems || 1,
          }
        : undefined,
    };

    const requestBody: Record<string, unknown> = {
      data: [eventData],
    };

    // If a test event code is configured in environment, append it for Meta Events Manager test console
    if (META_TEST_EVENT_CODE) {
      requestBody.test_event_code = META_TEST_EVENT_CODE;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(
      META_ACCESS_TOKEN
    )}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn("[Meta CAPI] Server dispatch non-fatal error:", result?.error?.message || response.statusText);
      return {
        success: false,
        status: "failed",
        error: result?.error?.message || "Meta API response error",
      };
    }

    return {
      success: true,
      status: "sent",
    };
  } catch (err: any) {
    console.warn("[Meta CAPI] Network or timeout non-fatal exception:", err.message);
    return {
      success: false,
      status: "failed",
      error: err.message,
    };
  }
}
