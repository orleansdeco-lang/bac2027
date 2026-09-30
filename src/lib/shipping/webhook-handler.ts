import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { updateOrderShipment } from "./service";
import { normalizeShipmentStatus, resolveCarrierInfo } from "./carriers";
import { ShipmentStatus } from "./types";

/**
 * Normalizes incoming carrier webhook payloads into a standard format.
 * Future carrier integrations (Yalidine, ZR Express, Maystro, etc.) can hook in here.
 */
export function parseCarrierWebhookPayload(
  carrierSlug: string,
  body: any
): {
  trackingNumber: string | null;
  status: ShipmentStatus;
  notes: string | null;
  carrierName: string;
} {
  const carrierInfo = resolveCarrierInfo(carrierSlug);

  // Default extraction logic (common payload formats used by Algerian logistics APIs)
  const trackingNumber =
    body.tracking_number ||
    body.tracking ||
    body.trackingNumber ||
    body.parcel_id ||
    body.code_barre ||
    body.codeBarre ||
    null;

  const rawStatus =
    body.status ||
    body.delivery_status ||
    body.parcel_status ||
    body.etat ||
    body.statut ||
    null;

  const status = normalizeShipmentStatus(rawStatus);

  const notes =
    body.note ||
    body.notes ||
    body.motif ||
    body.comment ||
    body.reason ||
    `Webhook status update: ${rawStatus || "UNKNOWN"}`;

  return {
    trackingNumber: trackingNumber ? String(trackingNumber).trim() : null,
    status,
    notes: String(notes),
    carrierName: carrierInfo.name,
  };
}

/**
 * Authoritative Webhook Processor
 * Finds the order corresponding to tracking number and updates shipment status.
 */
export async function processCarrierWebhook(
  carrierSlug: string,
  payload: any,
  headers?: Record<string, string>
): Promise<{
  success: boolean;
  message: string;
  orderId?: string;
  trackingNumber?: string;
  status?: ShipmentStatus;
}> {
  const parsed = parseCarrierWebhookPayload(carrierSlug, payload);

  if (!parsed.trackingNumber) {
    return {
      success: false,
      message: "لم يتم العثور على رقم التتبع (tracking_number) داخل حمولة الـ Webhook.",
    };
  }

  const client = getAdminClient() || supabase;
  if (!isSupabaseConfigured || !client) {
    throw new Error("قاعدة البيانات غير متصلة.");
  }

  // 1. Locate order by tracking_number in shipments
  const { data: shipmentRow } = await client
    .from("shipments")
    .select("order_id, tracking_number, status, carrier")
    .eq("tracking_number", parsed.trackingNumber)
    .maybeSingle();

  // Or locate by tracking_number in canonical orders
  let orderId = shipmentRow?.order_id;
  if (!orderId) {
    const { data: orderRow } = await client
      .from("orders")
      .select("id")
      .eq("tracking_number", parsed.trackingNumber)
      .maybeSingle();
    orderId = orderRow?.id;
  }

  if (!orderId) {
    return {
      success: false,
      message: `لم يتم العثور على أي طلب مسجل برقم التتبع: ${parsed.trackingNumber}`,
      trackingNumber: parsed.trackingNumber,
    };
  }

  // 2. Execute authoritative shipment status update
  const updateResult = await updateOrderShipment({
    orderId,
    carrier: parsed.carrierName,
    trackingNumber: parsed.trackingNumber,
    status: parsed.status,
    notes: `[Carrier Webhook: ${parsed.carrierName}] ${parsed.notes}`,
    source: "CARRIER_WEBHOOK",
    actor: {
      userId: "00000000-0000-0000-0000-000000000000", // System / Webhook actor
      role: "webhook",
    },
  });

  return {
    success: true,
    message: updateResult.message,
    orderId,
    trackingNumber: parsed.trackingNumber,
    status: parsed.status,
  };
}
