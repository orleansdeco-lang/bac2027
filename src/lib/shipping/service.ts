/**
 * Centralized Shipping Service
 * Handles manual Admin inputs, status transitions, and extensible Webhook updates.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { recordAuditLog } from "@/lib/operations/audit";
import { UpdateShipmentParams, ShipmentStatus } from "./types";
import { resolveCarrierInfo, normalizeShipmentStatus } from "./carriers";

export async function updateOrderShipment(
  params: UpdateShipmentParams,
  token?: string | null
): Promise<{ success: boolean; message: string; shipment?: any }> {
  const client = (token ? createAuthenticatedSupabaseClient(token) : null) || getAdminClient() || supabase;
  if (!isSupabaseConfigured || !client) {
    throw new Error("قاعدة البيانات غير متصلة.");
  }

  const {
    orderId,
    carrier: carrierInput,
    trackingNumber,
    shippingDate,
    status: statusInput,
    notes,
    source = "ADMIN_MANUAL",
    actor,
  } = params;

  const now = new Date().toISOString();

  // Load existing shipment and order
  const { data: existingShipment } = await client
    .from("shipments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  const { data: existingOrder } = await client
    .from("orders")
    .select("id, order_number, status, user_id, amount")
    .eq("id", orderId)
    .maybeSingle();

  if (!existingOrder && !existingShipment) {
    throw new Error(`الطلب برقم المعرّف (${orderId}) غير موجود في النظام.`);
  }

  // Resolve carrier metadata
  const resolvedCarrier = carrierInput
    ? resolveCarrierInfo(carrierInput).name
    : existingShipment?.carrier || "Yalidine Express";

  const resolvedTracking = trackingNumber !== undefined
    ? (trackingNumber ? trackingNumber.trim() : null)
    : existingShipment?.tracking_number;

  const resolvedStatus: ShipmentStatus = statusInput
    ? normalizeShipmentStatus(statusInput)
    : (existingShipment?.status as ShipmentStatus) || "PENDING";

  // Build shipment update payload
  const shipmentUpdates: Record<string, any> = {
    carrier: resolvedCarrier,
    tracking_number: resolvedTracking,
    status: resolvedStatus,
    status_notes: notes || existingShipment?.status_notes || null,
    updated_at: now,
  };

  // Shipping date
  if (shippingDate) {
    try {
      shipmentUpdates.shipped_at = new Date(shippingDate).toISOString();
    } catch {
      shipmentUpdates.shipped_at = shippingDate;
    }
  } else if (resolvedStatus === "SHIPPED" && !existingShipment?.shipped_at) {
    shipmentUpdates.shipped_at = now;
  }

  // Status specific lifecycle timestamps
  if (resolvedStatus === "OUT_FOR_DELIVERY" && !existingShipment?.out_for_delivery_at) {
    shipmentUpdates.out_for_delivery_at = now;
  }
  if (resolvedStatus === "DELIVERED") {
    shipmentUpdates.delivered_at = existingShipment?.delivered_at || now;
  }
  if (resolvedStatus === "FAILED") {
    shipmentUpdates.failed_at = existingShipment?.failed_at || now;
  }
  if (resolvedStatus === "RETURNED") {
    shipmentUpdates.returned_at = existingShipment?.returned_at || now;
  }

  // Update or Insert into public.shipments
  if (existingShipment) {
    await client
      .from("shipments")
      .update(shipmentUpdates)
      .eq("order_id", orderId);
  } else {
    await client
      .from("shipments")
      .insert({
        order_id: orderId,
        ...shipmentUpdates,
        created_at: now,
      });
  }

  // Synchronize canonical orders table:
  // - tracking_number
  // - status (if SHIPPED or RETURNED/CANCELLED)
  const orderUpdates: Record<string, any> = {
    tracking_number: resolvedTracking,
    updated_at: now,
  };

  if (resolvedStatus === "SHIPPED" && existingOrder?.status !== "COMPLETED") {
    orderUpdates.status = "SHIPPED";
  } else if (resolvedStatus === "RETURNED") {
    orderUpdates.status = "CANCELLED";
  }

  if (existingOrder) {
    await client.from("orders").update(orderUpdates).eq("id", orderId);
  }

  // Golden Invariant: DELIVERED != PAID
  // When shipment is DELIVERED, payment transitions to DELIVERED_PENDING_SETTLEMENT
  if (resolvedStatus === "DELIVERED") {
    await client
      .from("payments")
      .update({
        status: "DELIVERED_PENDING_SETTLEMENT",
        updated_at: now,
      })
      .eq("order_id", orderId)
      .neq("status", "PAID"); // Never demote PAID back to pending settlement!
  } else if (resolvedStatus === "RETURNED") {
    await client
      .from("payments")
      .update({
        status: "FAILED",
        updated_at: now,
      })
      .eq("order_id", orderId)
      .neq("status", "PAID");
  }

  // Legacy sync to payment_orders table
  try {
    const legacyUpdates: Record<string, any> = {
      delivery_status: resolvedStatus,
      updated_at: now,
    };
    if (resolvedTracking) {
      legacyUpdates.tracking_number = resolvedTracking;
    }
    if (resolvedStatus === "SHIPPED") {
      legacyUpdates.status = "SHIPPED";
    } else if (resolvedStatus === "RETURNED") {
      legacyUpdates.status = "CANCELLED";
    }

    await client.from("payment_orders").update(legacyUpdates).eq("id", orderId);
  } catch (legErr) {
    console.warn("[ShippingService] Legacy payment_orders sync warning:", legErr);
  }

  // Immutable Audit Log
  await recordAuditLog({
    actorUserId: actor.userId,
    actorRole: actor.role as any,
    action: "SHIPMENT_DISPATCHED" as any,
    targetType: "shipment" as any,
    targetId: orderId,
    reason: notes || `تحديث بيانات الشحن (${source}): شركة التوصيل = ${resolvedCarrier}، رقم التتبع = ${resolvedTracking || "غير محدد"}، الحالة = ${resolvedStatus}`,
    beforeState: {
      carrier: existingShipment?.carrier,
      tracking_number: existingShipment?.tracking_number,
      status: existingShipment?.status,
    },
    afterState: {
      carrier: resolvedCarrier,
      tracking_number: resolvedTracking,
      status: resolvedStatus,
      source,
    },
  });

  return {
    success: true,
    message: `تم تحديث بيانات الشحن والتتبع بنجاح (الحالة: ${resolvedStatus} | شركة التوصيل: ${resolvedCarrier}).`,
    shipment: {
      order_id: orderId,
      ...shipmentUpdates,
    },
  };
}
