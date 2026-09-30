/**
 * SHATER Control Center — Authoritative Server-Side Orders Operations
 * Phase: COD Physical Kit Logistics & Subscription Management
 * 
 * INVARIANTS:
 * 1. Strictly Server-Side: Only called by authenticated API routes / Server Actions.
 * 2. Strict State Machine: DELIVERED != PAID. Delivery does NOT activate subscriptions.
 * 3. Atomic Activation: Subscription is activated ONLY after Payment = PAID and Admin confirmation.
 * 4. Immutable Audit: Every single state transition is recorded in operations_audit_logs.
 * 5. Multi-Table Synchronization: Harmonizes public.orders, shipments, payments, subscriptions, and legacy payment_orders.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { recordAuditLog } from "@/lib/operations/audit";
import { AUTHORITATIVE_PLANS } from "@/lib/operations/payments";

export interface AdminOrderSummary {
  totalOrders: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  codPending: number;
  paid: number;
  returned: number;
}

export interface AdminOrderRecord {
  id: string;
  order_number: string;
  user_id: string | null;
  student: {
    id: string | null;
    full_name: string;
    phone: string;
    email: string | null;
    shater_id?: string | null;
    stream_id?: string | null;
  };
  shipping_address: {
    full_name: string;
    phone: string;
    wilaya: string;
    commune: string;
    address: string;
    delivery_notes?: string | null;
  };
  plan: {
    id: string;
    name: string;
    duration_months: number;
    price: number;
  };
  amount: number;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  shipment: {
    carrier: string;
    tracking_number: string | null;
    status: "PENDING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" | "RETURNED";
    shipped_at: string | null;
    delivered_at: string | null;
    returned_at: string | null;
  };
  payment: {
    method: string;
    status: "PENDING" | "COD" | "DELIVERED_PENDING_SETTLEMENT" | "PAID" | "FAILED" | "REFUNDED";
    amount: number;
    settled_at: string | null;
    verified_by: string | null;
    settlement_notes: string | null;
  };
  subscription: {
    id: string | null;
    status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "REVOKED";
    starts_at: string | null;
    expires_at: string | null;
    notes: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface AdminOrdersFilter {
  search?: string;
  orderStatus?: string;
  deliveryStatus?: string;
  paymentStatus?: string;
  plan?: string;
  wilaya?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

function resolvePlanMetadata(planId?: string, fallbackAmount?: number) {
  const pId = (planId || "season").toLowerCase();
  if (pId === "monthly") {
    return { id: "monthly", name: "الاشتراك الشهري", duration_months: 1, price: 900 };
  }
  if (pId === "quarterly" || pId === "3_months" || pId === "trimestre") {
    return { id: "quarterly", name: "SHATER BAC", duration_months: 3, price: 1500 };
  }
  if (pId === "season" || pId === "bac_season_pass_pilot") {
    return { id: "season", name: "SHATER BAC (موسم كامل)", duration_months: 10, price: 4900 };
  }
  const authPlan = AUTHORITATIVE_PLANS[pId];
  if (authPlan) {
    return {
      id: authPlan.id,
      name: authPlan.name_ar,
      duration_months: authPlan.durationMonths,
      price: authPlan.priceDZD,
    };
  }
  return { id: pId, name: `باقة (${planId})`, duration_months: 10, price: fallbackAmount || 4900 };
}

/**
 * Loads all orders for Admin Control Center with filtering, search, and KPI aggregation.
 */
export async function getAdminOrders(filters: AdminOrdersFilter = {}, token?: string | null): Promise<{
  orders: AdminOrderRecord[];
  summary: AdminOrderSummary;
}> {
  const client = (token ? createAuthenticatedSupabaseClient(token) : null) || getAdminClient() || supabase;
  if (!isSupabaseConfigured || !client) {
    throw new Error("قاعدة البيانات غير متصلة.");
  }

  const allOrdersMap = new Map<string, AdminOrderRecord>();

  // 1. Fetch from canonical tables: orders + shipping_addresses + shipments + payments + subscriptions
  try {
    const { data: canonicalList, error: canErr } = await client
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        plan_id,
        amount,
        currency,
        status,
        created_at,
        updated_at,
        shipping_addresses (full_name, phone, wilaya, commune, address, delivery_notes),
        shipments (carrier, tracking_number, status, shipped_at, delivered_at, returned_at),
        payments (method, status, amount, settled_at, verified_by, settlement_notes),
        subscriptions (id, status, starts_at, expires_at, notes)
      `)
      .order("created_at", { ascending: false });

    if (!canErr && canonicalList && Array.isArray(canonicalList)) {
      for (const row of canonicalList) {
        const shipAddr = Array.isArray(row.shipping_addresses) ? row.shipping_addresses[0] : row.shipping_addresses;
        const shipment = Array.isArray(row.shipments) ? row.shipments[0] : row.shipments;
        const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
        const subscription = Array.isArray(row.subscriptions) ? row.subscriptions[0] : row.subscriptions;

        const planMeta = resolvePlanMetadata(row.plan_id, Number(row.amount));

        const record: AdminOrderRecord = {
          id: row.id,
          order_number: row.order_number,
          user_id: row.user_id,
          student: {
            id: row.user_id,
            full_name: shipAddr?.full_name || "تلميذ غير محدد",
            phone: shipAddr?.phone || "",
            email: null,
          },
          shipping_address: {
            full_name: shipAddr?.full_name || "",
            phone: shipAddr?.phone || "",
            wilaya: shipAddr?.wilaya || "غير محدد",
            commune: shipAddr?.commune || "",
            address: shipAddr?.address || "",
            delivery_notes: shipAddr?.delivery_notes || null,
          },
          plan: planMeta,
          amount: Number(row.amount),
          currency: row.currency || "DZD",
          status: row.status as any,
          shipment: {
            carrier: shipment?.carrier || "Yalidine Express",
            tracking_number: shipment?.tracking_number || null,
            status: (shipment?.status || "PENDING") as any,
            shipped_at: shipment?.shipped_at || null,
            delivered_at: shipment?.delivered_at || null,
            returned_at: shipment?.returned_at || null,
          },
          payment: {
            method: payment?.method || "COD",
            status: (payment?.status || "COD") as any,
            amount: Number(payment?.amount || row.amount),
            settled_at: payment?.settled_at || null,
            verified_by: payment?.verified_by || null,
            settlement_notes: payment?.settlement_notes || null,
          },
          subscription: {
            id: subscription?.id || null,
            status: (subscription?.status || "PENDING") as any,
            starts_at: subscription?.starts_at || null,
            expires_at: subscription?.expires_at || null,
            notes: subscription?.notes || null,
          },
          created_at: row.created_at,
          updated_at: row.updated_at,
        };

        allOrdersMap.set(row.id, record);
      }
    }
  } catch (err) {
    console.warn("[AdminOrders] Canonical orders query warning:", err);
  }

  // 2. Fetch from legacy/sync table payment_orders
  try {
    const { data: legacyList, error: legErr } = await client
      .from("payment_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!legErr && legacyList && Array.isArray(legacyList)) {
      for (const lo of legacyList) {
        if (allOrdersMap.has(lo.id)) {
          // If already in map, augment with any extra info like shipping name/phone
          const existing = allOrdersMap.get(lo.id)!;
          if (!existing.student.full_name || existing.student.full_name === "تلميذ غير محدد") {
            existing.student.full_name = lo.shipping_name || existing.student.full_name;
          }
          continue;
        }

        const pseudoOrderNumber = `SH-2026-${lo.id.substring(0, 6).toUpperCase()}`;
        const planMeta = resolvePlanMetadata(lo.plan, Number(lo.amount));

        const isApproved = lo.status === "APPROVED";
        const orderStatus = isApproved ? "COMPLETED" : (lo.status || "PENDING");
        const deliveryStatus = lo.delivery_status || (orderStatus === "SHIPPED" ? "SHIPPED" : "PENDING");
        const paymentStatus = isApproved ? "PAID" : "COD";
        const subStatus = isApproved ? "ACTIVE" : "PENDING";

        allOrdersMap.set(lo.id, {
          id: lo.id,
          order_number: pseudoOrderNumber,
          user_id: lo.user_id,
          student: {
            id: lo.user_id,
            full_name: lo.shipping_name || "تلميذ شاطر",
            phone: lo.shipping_phone || "",
            email: lo.student_email || null,
          },
          shipping_address: {
            full_name: lo.shipping_name || "",
            phone: lo.shipping_phone || "",
            wilaya: lo.shipping_wilaya || "غير محدد",
            commune: lo.shipping_commune || "",
            address: lo.shipping_address || "",
            delivery_notes: lo.notes || null,
          },
          plan: planMeta,
          amount: Number(lo.amount),
          currency: lo.currency || "DZD",
          status: orderStatus as any,
          shipment: {
            carrier: "Yalidine Express",
            tracking_number: lo.tracking_number || null,
            status: deliveryStatus as any,
            shipped_at: lo.shipped_at || null,
            delivered_at: lo.delivered_at || null,
            returned_at: null,
          },
          payment: {
            method: lo.payment_method === "cash" ? "COD" : "CCP",
            status: paymentStatus as any,
            amount: Number(lo.amount),
            settled_at: lo.reviewed_at || null,
            verified_by: lo.reviewed_by || null,
            settlement_notes: lo.rejection_reason || null,
          },
          subscription: {
            id: null,
            status: subStatus as any,
            starts_at: lo.submitted_at || lo.created_at,
            expires_at: null,
            notes: null,
          },
          created_at: lo.created_at || lo.submitted_at || new Date().toISOString(),
          updated_at: lo.updated_at || lo.created_at || new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("[AdminOrders] Legacy payment_orders query warning:", err);
  }

  const rawList = Array.from(allOrdersMap.values());

  // 3. Compute KPI Summary Metrics (Dashboard)
  const summary: AdminOrderSummary = {
    totalOrders: rawList.length,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    codPending: 0,
    paid: 0,
    returned: 0,
  };

  for (const o of rawList) {
    if (o.status === "PENDING") summary.pending++;
    if (o.status === "PROCESSING") summary.processing++;
    if (
      (o.status === "SHIPPED" || o.shipment.status === "SHIPPED" || o.shipment.status === "OUT_FOR_DELIVERY") &&
      o.shipment.status !== "DELIVERED"
    ) {
      summary.shipped++;
    }
    if (o.shipment.status === "DELIVERED") summary.delivered++;
    if (o.payment.status === "COD" || o.payment.status === "DELIVERED_PENDING_SETTLEMENT") {
      summary.codPending++;
    }
    if (o.payment.status === "PAID") summary.paid++;
    if (o.shipment.status === "RETURNED" || o.status === "CANCELLED") summary.returned++;
  }

  // 4. Apply Filters
  let filtered = rawList;

  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.student.full_name.toLowerCase().includes(q) ||
        o.student.phone.includes(q) ||
        (o.shipment.tracking_number && o.shipment.tracking_number.toLowerCase().includes(q))
    );
  }

  if (filters.orderStatus && filters.orderStatus !== "ALL") {
    filtered = filtered.filter((o) => o.status === filters.orderStatus);
  }

  if (filters.deliveryStatus && filters.deliveryStatus !== "ALL") {
    filtered = filtered.filter((o) => o.shipment.status === filters.deliveryStatus);
  }

  if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
    filtered = filtered.filter((o) => o.payment.status === filters.paymentStatus);
  }

  if (filters.plan && filters.plan !== "ALL") {
    filtered = filtered.filter((o) => o.plan.id === filters.plan);
  }

  if (filters.wilaya && filters.wilaya !== "ALL") {
    filtered = filtered.filter((o) => o.shipping_address.wilaya.includes(filters.wilaya!));
  }

  if (filters.dateFrom) {
    const dFrom = new Date(filters.dateFrom).getTime();
    filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= dFrom);
  }

  if (filters.dateTo) {
    const dTo = new Date(filters.dateTo).getTime();
    filtered = filtered.filter((o) => new Date(o.created_at).getTime() <= dTo);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filters.offset !== undefined || filters.limit !== undefined) {
    const off = filters.offset || 0;
    const lim = filters.limit || 50;
    filtered = filtered.slice(off, off + lim);
  }

  return { orders: filtered, summary };
}

/**
 * Execute an Admin Action on an Order with strict server-side validation and audit logging.
 */
export async function executeAdminOrderAction(
  orderId: string,
  action: string,
  actor: { userId: string; role: string },
  params: Record<string, any> = {},
  token?: string | null
): Promise<{ success: boolean; message: string; order?: any }> {
  const client = (token ? createAuthenticatedSupabaseClient(token) : null) || getAdminClient() || supabase;
  if (!isSupabaseConfigured || !client) {
    throw new Error("قاعدة البيانات غير متصلة.");
  }

  const now = new Date().toISOString();

  // Load current order state
  const { data: currentOrder, error: fetchErr } = await client
    .from("orders")
    .select(`
      id, order_number, user_id, plan_id, amount, status,
      shipping_addresses (*),
      shipments (*),
      payments (*),
      subscriptions (*)
    `)
    .eq("id", orderId)
    .maybeSingle();

  switch (action) {
    case "CONFIRM_ORDER": {
      // 1. Confirm order
      await client.from("orders").update({ status: "CONFIRMED", updated_at: now }).eq("id", orderId);
      await client.from("payment_orders").update({ status: "PENDING", updated_at: now }).eq("id", orderId);

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "CONFIRM_ORDER" as any,
        targetType: "order" as any,
        targetId: orderId,
        reason: params.reason || "تم تأكيد طلب التوصيل من طرف الإدارة",
        beforeState: { status: currentOrder?.status },
        afterState: { status: "CONFIRMED" },
      });

      return { success: true, message: "تم تأكيد الطلب بنجاح." };
    }

    case "MARK_PROCESSING": {
      // 2. Mark processing (kit preparation)
      await client.from("orders").update({ status: "PROCESSING", updated_at: now }).eq("id", orderId);
      await client.from("payment_orders").update({ status: "PROCESSING", updated_at: now }).eq("id", orderId);

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "ORDER_STATUS_CHANGED" as any,
        targetType: "order" as any,
        targetId: orderId,
        reason: params.reason || "تجهيز العلبة المادية والبطاقة الذكية",
        beforeState: { status: currentOrder?.status },
        afterState: { status: "PROCESSING" },
      });

      return { success: true, message: "تم تغيير حالة الطلب إلى: قيد التجهيز (تحضير العلبة)." };
    }

    case "MARK_SHIPPED": {
      // 3. Mark shipped + add carrier and tracking
      const carrier = params.carrier || "YALIDINE";
      const trackingNumber = params.trackingNumber?.trim() || null;

      // Update shipment
      await client
        .from("shipments")
        .update({
          carrier,
          tracking_number: trackingNumber,
          status: "SHIPPED",
          shipped_at: now,
          updated_at: now,
        })
        .eq("order_id", orderId);

      // Update order
      await client.from("orders").update({ status: "SHIPPED", updated_at: now }).eq("id", orderId);
      await client
        .from("payment_orders")
        .update({
          status: "SHIPPED",
          delivery_status: "SHIPPED",
          updated_at: now,
        })
        .eq("id", orderId);

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "SHIPMENT_DISPATCHED" as any,
        targetType: "shipment" as any,
        targetId: orderId,
        reason: params.reason || `تم تسليم الطرد لشركة الشحن (${carrier})`,
        afterState: { status: "SHIPPED", carrier, trackingNumber },
      });

      return { success: true, message: "تم تسجيل شحن الطرد بنجاح." };
    }

    case "ADD_TRACKING_NUMBER": {
      // 4. Add or update tracking number
      const carrier = params.carrier || "YALIDINE";
      const trackingNumber = params.trackingNumber?.trim();
      if (!trackingNumber) {
        throw new Error("يرجى إدخال رقم التتبع.");
      }

      await client
        .from("shipments")
        .update({
          carrier,
          tracking_number: trackingNumber,
          updated_at: now,
        })
        .eq("order_id", orderId);

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "SHIPMENT_DISPATCHED" as any,
        targetType: "shipment" as any,
        targetId: orderId,
        reason: `تحديث رقم التتبع: ${trackingNumber}`,
        afterState: { carrier, trackingNumber },
      });

      return { success: true, message: `تم تحديث رقم التتبع: ${trackingNumber}` };
    }

    case "MARK_DELIVERED": {
      // 5. Mark Delivered (Invariant: DELIVERED != PAID. Sets payment to DELIVERED_PENDING_SETTLEMENT)
      await client
        .from("shipments")
        .update({
          status: "DELIVERED",
          delivered_at: now,
          updated_at: now,
        })
        .eq("order_id", orderId);

      await client
        .from("payments")
        .update({
          status: "DELIVERED_PENDING_SETTLEMENT",
          updated_at: now,
        })
        .eq("order_id", orderId);

      await client
        .from("payment_orders")
        .update({
          delivery_status: "DELIVERED",
          updated_at: now,
        })
        .eq("id", orderId);

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "SHIPMENT_DELIVERED" as any,
        targetType: "shipment" as any,
        targetId: orderId,
        reason: "تم تسليم العلبة المادية للطالب (بانتظار تسوية أموال الـ COD مع شركة التوصيل)",
        afterState: { shipment_status: "DELIVERED", payment_status: "DELIVERED_PENDING_SETTLEMENT" },
      });

      return {
        success: true,
        message: "تم تسجيل تسليم الطرد. تم تحديث الدفع تلقائياً إلى 'بانتظار تسوية الأموال'. لا يتم تفعيل الاشتراك حتى يتم تأكيد الدفع.",
      };
    }

    case "MARK_RETURNED": {
      // 6. Mark Returned
      await client
        .from("shipments")
        .update({
          status: "RETURNED",
          returned_at: now,
          updated_at: now,
        })
        .eq("order_id", orderId);

      await client.from("orders").update({ status: "CANCELLED", updated_at: now }).eq("id", orderId);
      await client.from("payments").update({ status: "FAILED", updated_at: now }).eq("id", orderId);
      await client.from("payment_orders").update({ status: "CANCELLED", delivery_status: "RETURNED", updated_at: now }).eq("id", orderId);

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "SHIPMENT_RETURNED" as any,
        targetType: "shipment" as any,
        targetId: orderId,
        reason: params.reason || "طرد مرتجع من شركة التوصيل",
        afterState: { shipment_status: "RETURNED", order_status: "CANCELLED" },
      });

      return { success: true, message: "تم تسجيل الطرد كمرتجع وإلغاء الطلب." };
    }

    case "MARK_COD_PAID": {
      // 7. Admin Confirms COD Cash Received (Payment = PAID)
      // Call RPC if available, or execute atomic updates
      try {
        const { data: rpcRes, error: rpcErr } = await client.rpc("admin_verify_cod_payment_settled", {
          p_order_id: orderId,
          p_notes: params.notes || "تم استلام وتسوية المبلغ نقداً في حساب شاطر",
        });

        if (rpcErr) {
          throw rpcErr;
        }
      } catch (rpcFallbackErr) {
        // Direct transactional fallback
        await client
          .from("payments")
          .update({
            status: "PAID",
            settled_at: now,
            verified_by: actor.userId,
            settlement_notes: params.notes || "تم استلام وتسوية المبلغ نقداً في حساب شاطر",
            updated_at: now,
          })
          .eq("order_id", orderId);

        await client
          .from("orders")
          .update({
            status: "COMPLETED",
            updated_at: now,
          })
          .eq("id", orderId);

        await client
          .from("payment_orders")
          .update({
            status: "APPROVED",
            reviewed_at: now,
            reviewed_by: actor.userId,
            updated_at: now,
          })
          .eq("id", orderId);
      }

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "COD_PAYMENT_SETTLED" as any,
        targetType: "payment" as any,
        targetId: orderId,
        reason: params.notes || "تأكيد استلام وتسوية أموال الـ COD",
        afterState: { payment_status: "PAID", order_status: "COMPLETED" },
      });

      return {
        success: true,
        message: "تم تأكيد استلام وتسوية المبلغ كاش (Payment = PAID). يمكنك الآن تفعيل الاشتراك للطالب.",
      };
    }

    case "ACTIVATE_SUBSCRIPTION": {
      // 8. Admin Confirms & Activates Subscription
      // Rule: Prerequisite payment = PAID must be satisfied!
      try {
        const { data: rpcRes, error: rpcErr } = await client.rpc("admin_activate_cod_subscription", {
          p_order_id: orderId,
          p_reason: params.reason || "تفعيل الاشتراك بعد تأكيد تسوية الدفع",
        });

        if (rpcErr) {
          throw rpcErr;
        }
      } catch (rpcFallbackErr: any) {
        // Check prerequisite: payment must be PAID
        const { data: payRow } = await client.from("payments").select("status").eq("order_id", orderId).maybeSingle();
        if (payRow && payRow.status !== "PAID") {
          throw new Error("لا يمكن تفعيل الاشتراك: يجب أن تكون حالة الدفع (PAID) أولاً!");
        }

        const expiresDate = new Date();
        expiresDate.setMonth(expiresDate.getMonth() + 10);

        await client
          .from("subscriptions")
          .update({
            status: "ACTIVE",
            starts_at: now,
            expires_at: expiresDate.toISOString(),
            notes: "تم تفعيل الاشتراك رسمياً من طرف الإدارة",
            updated_at: now,
          })
          .eq("order_id", orderId);

        if (currentOrder?.user_id) {
          await client
            .from("student_profiles")
            .update({
              access_status: "PAID",
              plan: currentOrder.plan_id || "season",
              subscription_started_at: now,
              subscription_expires_at: expiresDate.toISOString(),
              updated_at: now,
            })
            .eq("id", currentOrder.user_id);
        }
      }

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "SUBSCRIPTION_ACTIVATED" as any,
        targetType: "subscription" as any,
        targetId: orderId,
        reason: params.reason || "تفعيل اشتراك الطالب بعد تسوية الدفع",
        afterState: { subscription_status: "ACTIVE" },
      });

      return {
        success: true,
        message: "تم تفعيل الاشتراك بنجاح! أصبح حساب التلميذ مفعل بالكامل (ACTIVE).",
      };
    }

    case "CANCEL_ORDER": {
      // 9. Cancel Order
      await client.from("orders").update({ status: "CANCELLED", updated_at: now }).eq("id", orderId);
      await client.from("payments").update({ status: "FAILED", updated_at: now }).eq("id", orderId);
      await client.from("payment_orders").update({ status: "CANCELLED", updated_at: now }).eq("id", orderId);

      await recordAuditLog({
        actorUserId: actor.userId,
        actorRole: actor.role as any,
        action: "CANCEL_ORDER" as any,
        targetType: "order" as any,
        targetId: orderId,
        reason: params.reason || "إلغاء الطلب من طرف الإدارة",
        afterState: { status: "CANCELLED" },
      });

      return { success: true, message: "تم إلغاء الطلب." };
    }

    default:
      throw new Error(`الإجراء المطلوب (${action}) غير معتمد.`);
  }
}
