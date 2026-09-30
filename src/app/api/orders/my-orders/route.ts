import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { AUTHORITATIVE_PLANS } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

export interface StudentOrderResponse {
  id: string;
  order_number: string;
  plan_name: string;
  plan_duration: string;
  amount: number;
  currency: string;
  formatted_price: string;
  created_at: string;
  formatted_date: string;
  statuses: {
    order: {
      key: string;
      label: string;
      badge_variant: "default" | "success" | "warning" | "error" | "info";
    };
    delivery: {
      key: string;
      label: string;
      badge_variant: "default" | "success" | "warning" | "error" | "info";
      carrier?: string;
      tracking_number?: string;
    };
    payment: {
      key: string;
      label: string;
      badge_variant: "default" | "success" | "warning" | "error" | "info";
    };
    subscription: {
      key: string;
      label: string;
      badge_variant: "default" | "success" | "warning" | "error" | "info";
    };
  };
  shipping: {
    wilaya: string;
    commune: string;
    address: string;
  };
}

/**
 * Maps raw database order statuses to human-friendly Arabic labels and color variants.
 * Strictly avoids exposing internal operator notes, admin IDs, or financial margins.
 */
function mapOrderStatuses(order: any, shipment?: any, payment?: any, subscription?: any) {
  // 1. Order Status mapping
  const rawOrderStatus = (order?.status || "PENDING").toUpperCase();
  let orderLabel = "مسجل";
  let orderVariant: "default" | "success" | "warning" | "error" | "info" = "info";

  switch (rawOrderStatus) {
    case "PENDING":
      orderLabel = "قيد المراجعة";
      orderVariant = "warning";
      break;
    case "CONFIRMED":
      orderLabel = "تم التأكيد";
      orderVariant = "info";
      break;
    case "PROCESSING":
      orderLabel = "قيد التجهيز";
      orderVariant = "info";
      break;
    case "SHIPPED":
      orderLabel = "تم الشحن";
      orderVariant = "success";
      break;
    case "COMPLETED":
      orderLabel = "مكتمل";
      orderVariant = "success";
      break;
    case "CANCELLED":
      orderLabel = "ملغى";
      orderVariant = "error";
      break;
    default:
      orderLabel = rawOrderStatus;
      orderVariant = "default";
  }

  // 2. Delivery Status mapping
  const rawDeliveryStatus = (shipment?.status || order?.delivery_status || "PENDING").toUpperCase();
  let deliveryLabel = "قيد الانتظار";
  let deliveryVariant: "default" | "success" | "warning" | "error" | "info" = "warning";

  switch (rawDeliveryStatus) {
    case "PENDING":
      deliveryLabel = "قيد الانتظار";
      deliveryVariant = "warning";
      break;
    case "SHIPPED":
      deliveryLabel = "تم الشحن";
      deliveryVariant = "info";
      break;
    case "OUT_FOR_DELIVERY":
      deliveryLabel = "في الطريق";
      deliveryVariant = "info";
      break;
    case "DELIVERED":
      deliveryLabel = "تم التوصيل";
      deliveryVariant = "success";
      break;
    case "FAILED":
      deliveryLabel = "تعذر التوصيل";
      deliveryVariant = "error";
      break;
    case "RETURNED":
      deliveryLabel = "مرتجع";
      deliveryVariant = "error";
      break;
    default:
      deliveryLabel = rawDeliveryStatus;
      deliveryVariant = "default";
  }

  // 3. Payment Status mapping
  const rawPaymentStatus = (payment?.status || (order?.payment_method === "cash" ? "COD" : order?.status) || "COD").toUpperCase();
  let paymentLabel = "الدفع عند الاستلام";
  let paymentVariant: "default" | "success" | "warning" | "error" | "info" = "warning";

  switch (rawPaymentStatus) {
    case "COD":
    case "PENDING":
      paymentLabel = "الدفع عند الاستلام";
      paymentVariant = "info";
      break;
    case "DELIVERED_PENDING_SETTLEMENT":
      paymentLabel = "تم الاستلام (بانتظار التسوية)";
      paymentVariant = "warning";
      break;
    case "PAID":
    case "APPROVED":
      paymentLabel = "تم الدفع";
      paymentVariant = "success";
      break;
    case "FAILED":
    case "REJECTED":
      paymentLabel = "فشل الدفع";
      paymentVariant = "error";
      break;
    case "REFUNDED":
      paymentLabel = "مسترجع";
      paymentVariant = "default";
      break;
    default:
      paymentLabel = rawPaymentStatus;
      paymentVariant = "default";
  }

  // 4. Subscription Status mapping
  const rawSubStatus = (subscription?.status || (payment?.status === "PAID" ? "ACTIVE" : "PENDING")).toUpperCase();
  let subLabel = "في انتظار الدفع";
  let subVariant: "default" | "success" | "warning" | "error" | "info" = "warning";

  switch (rawSubStatus) {
    case "PENDING":
      subLabel = "في انتظار الدفع";
      subVariant = "warning";
      break;
    case "ACTIVE":
      subLabel = "مفعّل";
      subVariant = "success";
      break;
    case "EXPIRED":
      subLabel = "منتهي";
      subVariant = "default";
      break;
    case "CANCELLED":
    case "REVOKED":
    case "SUSPENDED":
      subLabel = "موقوف";
      subVariant = "error";
      break;
    default:
      subLabel = rawSubStatus;
      subVariant = "default";
  }

  return {
    order: { key: rawOrderStatus, label: orderLabel, badge_variant: orderVariant },
    delivery: {
      key: rawDeliveryStatus,
      label: deliveryLabel,
      badge_variant: deliveryVariant,
      carrier: shipment?.carrier || "Yalidine Express",
      tracking_number: shipment?.tracking_number || undefined,
    },
    payment: { key: rawPaymentStatus, label: paymentLabel, badge_variant: paymentVariant },
    subscription: { key: rawSubStatus, label: subLabel, badge_variant: subVariant },
  };
}

function formatArabicDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
      "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function resolvePlanMetadata(planId?: string) {
  const pId = (planId || "season").toLowerCase();
  if (pId === "monthly") {
    return { name: "الاشتراك الشهري", duration: "شهر واحد (30 يوماً)" };
  }
  if (pId === "quarterly" || pId === "3_months" || pId === "trimestre") {
    return { name: "SHATER BAC", duration: "3 أشهر" };
  }
  if (pId === "season" || pId === "bac_season_pass_pilot") {
    return { name: "SHATER BAC (موسم كامل)", duration: "10 أشهر (حتى البكالوريا)" };
  }
  const authPlan = AUTHORITATIVE_PLANS[pId];
  if (authPlan) {
    return {
      name: authPlan.name_ar,
      duration: `${authPlan.durationMonths} أشهر`,
    };
  }
  return { name: `باقة شاطر (${planId})`, duration: "موسم البكالوريا" };
}

/**
 * GET /api/orders/my-orders
 * Returns all physical COD and digital orders belonging strictly to the authenticated student.
 * 
 * STRICT INVARIANTS:
 * 1. Only reads orders belonging to caller ID.
 * 2. Does NOT expose internal operator data, admin notes, reviewer IDs, or settlement internals.
 * 3. Read-only: Student cannot mutate price, order status, delivery, payment, or tracking.
 */
export async function GET(req: Request) {
  try {
    const userId = await extractAuthenticatedUserId(req);
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لعرض طلباتك." },
        { status: 401 }
      );
    }

    const client = (token ? createAuthenticatedSupabaseClient(token) : null) || getAdminClient() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json(
        { success: false, error: "قاعدة البيانات غير متاحة حالياً." },
        { status: 503 }
      );
    }

    const sanitizedOrders: StudentOrderResponse[] = [];
    const seenOrderNumbers = new Set<string>();

    // 1. Try querying Migration 039 canonical tables: orders + shipments + payments + subscriptions + shipping_addresses
    try {
      const { data: canonicalOrders, error: ordErr } = await client
        .from("orders")
        .select(`
          id,
          order_number,
          plan_id,
          amount,
          currency,
          status,
          created_at,
          shipping_addresses (full_name, phone, wilaya, commune, address),
          shipments (carrier, tracking_number, status, shipped_at, delivered_at),
          payments (method, status, amount),
          subscriptions (status, starts_at, expires_at)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!ordErr && canonicalOrders && Array.isArray(canonicalOrders)) {
        for (const o of canonicalOrders) {
          const shipAddr = Array.isArray(o.shipping_addresses) ? o.shipping_addresses[0] : o.shipping_addresses;
          const shipment = Array.isArray(o.shipments) ? o.shipments[0] : o.shipments;
          const payment = Array.isArray(o.payments) ? o.payments[0] : o.payments;
          const subscription = Array.isArray(o.subscriptions) ? o.subscriptions[0] : o.subscriptions;

          const planMeta = resolvePlanMetadata(o.plan_id);
          const statuses = mapOrderStatuses(o, shipment, payment, subscription);

          seenOrderNumbers.add(o.order_number);
          sanitizedOrders.push({
            id: o.id,
            order_number: o.order_number,
            plan_name: planMeta.name,
            plan_duration: planMeta.duration,
            amount: Number(o.amount),
            currency: o.currency || "DA",
            formatted_price: `${Number(o.amount).toLocaleString()} DA`,
            created_at: o.created_at,
            formatted_date: formatArabicDate(o.created_at),
            statuses,
            shipping: {
              wilaya: shipAddr?.wilaya || "غير محدد",
              commune: shipAddr?.commune || "",
              address: shipAddr?.address || "",
            },
          });
        }
      }
    } catch (canonicalErr) {
      console.warn("[MyOrders] Canonical orders query warning:", canonicalErr);
    }

    // 2. Query legacy/sync table payment_orders for any orders not yet captured in canonical
    try {
      const { data: legacyOrders, error: legErr } = await client
        .from("payment_orders")
        .select(`
          id,
          plan,
          amount,
          currency,
          status,
          delivery_status,
          payment_method,
          shipping_wilaya,
          shipping_commune,
          shipping_address,
          created_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!legErr && legacyOrders && Array.isArray(legacyOrders)) {
        for (const lo of legacyOrders) {
          const pseudoOrderNumber = `SH-2026-${lo.id.substring(0, 6).toUpperCase()}`;
          if (seenOrderNumbers.has(pseudoOrderNumber) || seenOrderNumbers.has(lo.id)) {
            continue;
          }

          const planMeta = resolvePlanMetadata(lo.plan);
          const statuses = mapOrderStatuses(
            { status: lo.status === "APPROVED" ? "COMPLETED" : lo.status, delivery_status: lo.delivery_status },
            { carrier: "Yalidine Express", status: lo.delivery_status || "PENDING" },
            { status: lo.status === "APPROVED" ? "PAID" : "COD", method: lo.payment_method === "cash" ? "COD" : "CCP" },
            { status: lo.status === "APPROVED" ? "ACTIVE" : "PENDING" }
          );

          sanitizedOrders.push({
            id: lo.id,
            order_number: pseudoOrderNumber,
            plan_name: planMeta.name,
            plan_duration: planMeta.duration,
            amount: Number(lo.amount),
            currency: lo.currency || "DA",
            formatted_price: `${Number(lo.amount).toLocaleString()} DA`,
            created_at: lo.created_at,
            formatted_date: formatArabicDate(lo.created_at),
            statuses,
            shipping: {
              wilaya: lo.shipping_wilaya || "غير محدد",
              commune: lo.shipping_commune || "",
              address: lo.shipping_address || "",
            },
          });
        }
      }
    } catch (legErr) {
      console.warn("[MyOrders] Legacy payment_orders query warning:", legErr);
    }

    return NextResponse.json({
      success: true,
      orders: sanitizedOrders,
    });
  } catch (err: any) {
    console.error("[MyOrders] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "تعذر تحميل طلباتك، يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
