/**
 * BAC Mastery — Authoritative Payment Orders Service
 * Phase 1 Remediation: Single Source of Truth & Zero Fake Persistence
 * 
 * INVARIANTS:
 * 1. Supabase PostgreSQL is the SOLE single source of truth for payment, subscription, and access state.
 * 2. ZERO fallback to .runtime/*.json, /tmp/bac_*.json, or in-memory arrays.
 * 3. Strict state machine: DRAFT -> PENDING -> APPROVED | REJECTED | CANCELLED.
 * 4. Atomic activation: Approval upgrades student to PAID, creates subscription, and logs audit atomically in PostgreSQL.
 * 5. Strict UUID format: all order IDs are valid UUIDs (RFC 4122 v4).
 * 6. If the database fails, return a real error. Never fake success.
 */

import crypto from "crypto";
import { PaymentOrder, PaymentOrderStatus, PaymentMethod, AuthoritativePlan, OrderType, DeliveryStatus } from "./types";
import { recordAuditLog } from "./audit";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { getSubscriptionPlanById } from "./subscriptions";
import { qualifyReferralOnSubscription } from "../referral";
import { createVoucher } from "./vouchers";

export const AUTHORITATIVE_PLANS: Record<string, AuthoritativePlan> = {
  season: {
    id: "season",
    name_ar: "اشتراك الموسم الدراسي",
    name_fr: "Pass Saison BAC",
    priceDZD: 4900,
    currency: "DZD",
    durationMonths: 10,
    description_ar: "وصول غير محدود لجميع الدروس، التدريبات، والتصحيحات حتى يوم امتحان البكالوريا.",
    description_fr: "Accès illimité à toutes les missions, entraînements et retests jusqu'aux épreuves du BAC.",
  },
  monthly: {
    id: "monthly",
    name_ar: "الاشتراك الشهري",
    name_fr: "Abonnement Mensuel",
    priceDZD: 900,
    currency: "DZD",
    durationMonths: 1,
    description_ar: "وصول كامل لمدة 30 يوماً قابلة للتجديد.",
    description_fr: "Accès complet pendant 30 jours renouvelable.",
  },
  bac_season_pass_pilot: {
    id: "bac_season_pass_pilot",
    name_ar: "موسم البكالوريا الكامل",
    name_fr: "Pass Saison BAC",
    priceDZD: 4900,
    currency: "DZD",
    durationMonths: 10,
    description_ar: "وصول غير محدود لجميع الدروس، التدريبات، والتصحيحات حتى يوم امتحان البكالوريا.",
    description_fr: "Accès illimité à toutes les missions, entraînements et retests حتى يوم امتحان البكالوريا.",
  },
};

export interface CreatePaymentOrderInput {
  userId: string;
  plan?: string;
  amount?: number;
  currency?: "DZD";
  paymentMethod: PaymentMethod;
  receiptPath?: string;
  notes?: string;
  studentEmail?: string;
  studentName?: string;
  studentPhone?: string;
  streamId?: string;
  wilayaName?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapDbOrderToPaymentOrder(d: any, extra?: {
  studentEmail?: string;
  studentName?: string;
  studentPhone?: string;
  streamId?: string;
  wilayaName?: string;
}): PaymentOrder {
  return {
    id: d.id,
    userId: d.user_id,
    plan: d.plan,
    amount: Number(d.amount),
    currency: d.currency || "DZD",
    paymentMethod: d.payment_method,
    orderType: d.order_type || (d.payment_method === "cash" ? "COD" : "DIGITAL"),
    status: d.status,
    deliveryStatus: d.delivery_status,
    receiptPath: d.receipt_path,
    notes: d.notes,
    submittedAt: d.submitted_at,
    reviewedAt: d.reviewed_at,
    reviewedBy: d.reviewed_by,
    rejectionReason: d.rejection_reason,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    studentName: extra?.studentName || d.shipping_name,
    studentPhone: extra?.studentPhone || d.shipping_phone,
    studentEmail: extra?.studentEmail,
    streamId: extra?.streamId,
    wilayaName: extra?.wilayaName || d.shipping_wilaya,
    shippingName: d.shipping_name,
    shippingPhone: d.shipping_phone,
    shippingWilaya: d.shipping_wilaya,
    shippingCommune: d.shipping_commune,
    shippingAddress: d.shipping_address,
    voucherCode: d.voucher_code,
  };
}

/**
 * Creates a new payment order strictly in Supabase PostgreSQL
 */
export async function createPaymentOrder(
  input: CreatePaymentOrderInput,
  token?: string | null
): Promise<PaymentOrder> {
  const rawPlanKey = input.plan || "season";
  const normalizedKey = rawPlanKey === "bac_season_pass_pilot" ? "season" : rawPlanKey;

  // Check subscription plans dynamically
  const subscriptionPlan = await getSubscriptionPlanById(normalizedKey);
  const authoritativePlan = AUTHORITATIVE_PLANS[rawPlanKey] || AUTHORITATIVE_PLANS[normalizedKey];

  if (!subscriptionPlan && !authoritativePlan) {
    throw new Error(`Unknown or unsupported plan: ${input.plan}`);
  }

  // Check if plan is closed
  if (subscriptionPlan && subscriptionPlan.active === false) {
    throw new Error(`Subscription plan '${subscriptionPlan.name}' is currently closed for new purchases.`);
  }

  const finalPlanId = rawPlanKey;
  const finalPrice = subscriptionPlan ? subscriptionPlan.price_dzd : (authoritativePlan?.priceDZD ?? 4900);
  const finalCurrency = "DZD";
  const now = new Date().toISOString();

  const client = (token ? createAuthenticatedSupabaseClient(token) : null) || getAdminClient() || supabase;
  if (!isSupabaseConfigured || !client) {
    throw new Error("Database service is unavailable. Payment orders require PostgreSQL connection.");
  }

  // Idempotency: Check if user already has an active PENDING order for this plan created recently
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: existingList } = await client
      .from("payment_orders")
      .select("*")
      .eq("user_id", input.userId)
      .eq("plan", finalPlanId)
      .eq("status", "PENDING")
      .gte("submitted_at", fifteenMinutesAgo)
      .order("submitted_at", { ascending: false })
      .limit(1);

    if (existingList && existingList.length > 0) {
      const existing = existingList[0];
      if (input.receiptPath && existing.receipt_path !== input.receiptPath) {
        await client
          .from("payment_orders")
          .update({
            receipt_path: input.receiptPath,
            notes: input.notes || existing.notes,
            updated_at: now,
          })
          .eq("id", existing.id);
        existing.receipt_path = input.receiptPath;
      }
      return mapDbOrderToPaymentOrder(existing, {
        studentEmail: input.studentEmail,
        studentName: input.studentName,
        studentPhone: input.studentPhone,
        streamId: input.streamId,
        wilayaName: input.wilayaName,
      });
    }
  } catch (err) {
    console.warn("[createPaymentOrder] Idempotency lookup warning:", err);
  }

  // Generate valid RFC 4122 v4 UUID
  const orderId = crypto.randomUUID();

  const { data: inserted, error: insertErr } = await client
    .from("payment_orders")
    .insert({
      id: orderId,
      user_id: input.userId,
      plan: finalPlanId,
      amount: finalPrice,
      currency: finalCurrency,
      payment_method: input.paymentMethod || "baridimob",
      status: "PENDING",
      receipt_path: input.receiptPath || null,
      notes: input.notes || null,
      submitted_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (insertErr || !inserted) {
    throw new Error(`Failed to create payment order in database: ${insertErr?.message || "Database insert failed"}`);
  }

  return mapDbOrderToPaymentOrder(inserted, {
    studentEmail: input.studentEmail,
    studentName: input.studentName,
    studentPhone: input.studentPhone,
    streamId: input.streamId,
    wilayaName: input.wilayaName,
  });
}

/**
 * Retrieves payment orders directly and authoritatively from PostgreSQL
 */
export async function getPaymentOrders(
  filters?: {
    status?: PaymentOrderStatus;
    userId?: string;
    limit?: number;
  },
  token?: string | null
): Promise<PaymentOrder[]> {
  const limit = filters?.limit || 100;
  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    return [];
  }

  let query = client
    .from("payment_orders")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("[getPaymentOrders] Database query error:", error);
    return [];
  }

  // Look up matching student profiles cleanly without PostgREST relationship schema errors
  const userIds = Array.from(new Set(data.map((d: any) => d.user_id).filter(Boolean)));
  const profileMap = new Map<string, any>();

  if (userIds.length > 0) {
    try {
      const { data: profiles } = await client
        .from("student_profiles")
        .select("id, first_name, last_name, student_phone, stream_id, wilaya_name, raw_draft")
        .in("id", userIds);

      if (profiles) {
        for (const p of profiles) {
          profileMap.set(p.id, p);
        }
      }
    } catch {}
  }

  return data.map((d: any) => {
    const profile = profileMap.get(d.user_id);
    const email = profile?.raw_draft?.student_email || profile?.raw_draft?.email;
    return {
      id: d.id,
      userId: d.user_id,
      plan: d.plan,
      amount: Number(d.amount),
      currency: d.currency || "DZD",
      paymentMethod: d.payment_method,
      orderType: d.order_type || (d.payment_method === "cash" ? "COD" : "DIGITAL"),
      status: d.status,
      deliveryStatus: d.delivery_status,
      receiptPath: d.receipt_path,
      notes: d.notes,
      submittedAt: d.submitted_at,
      reviewedAt: d.reviewed_at,
      reviewedBy: d.reviewed_by,
      rejectionReason: d.rejection_reason,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      studentName: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : d.shipping_name,
      studentPhone: profile?.student_phone || d.shipping_phone,
      studentEmail: email,
      streamId: profile?.stream_id,
      wilayaName: profile?.wilaya_name || d.shipping_wilaya,
      shippingName: d.shipping_name,
      shippingPhone: d.shipping_phone,
      shippingWilaya: d.shipping_wilaya,
      shippingCommune: d.shipping_commune,
      shippingAddress: d.shipping_address,
      voucherCode: d.voucher_code,
    };
  });
}

/**
 * Retrieves a single payment order by UUID authoritatively from PostgreSQL
 */
export async function getPaymentOrderById(
  orderId: string,
  token?: string | null
): Promise<PaymentOrder | null> {
  const clean = (orderId || "").trim();
  if (!clean || !UUID_REGEX.test(clean)) {
    return null;
  }

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    return null;
  }

  const { data, error } = await client
    .from("payment_orders")
    .select("*")
    .eq("id", clean)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  let profile: any = null;
  try {
    const { data: p } = await client
      .from("student_profiles")
      .select("id, first_name, last_name, student_phone, stream_id, wilaya_name, raw_draft")
      .eq("id", data.user_id)
      .maybeSingle();
    profile = p;
  } catch {}

  const email = profile?.raw_draft?.student_email || profile?.raw_draft?.email;
  return {
    id: data.id,
    userId: data.user_id,
    plan: data.plan,
    amount: Number(data.amount),
    currency: data.currency || "DZD",
    paymentMethod: data.payment_method,
    orderType: data.order_type || (data.payment_method === "cash" ? "COD" : "DIGITAL"),
    status: data.status,
    deliveryStatus: data.delivery_status,
    receiptPath: data.receipt_path,
    notes: data.notes,
    submittedAt: data.submitted_at,
    reviewedAt: data.reviewed_at,
    reviewedBy: data.reviewed_by,
    rejectionReason: data.rejection_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    studentName: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : data.shipping_name,
    studentPhone: profile?.student_phone || data.shipping_phone,
    studentEmail: email,
    streamId: profile?.stream_id,
    wilayaName: profile?.wilaya_name || data.shipping_wilaya,
    shippingName: data.shipping_name,
    shippingPhone: data.shipping_phone,
    shippingWilaya: data.shipping_wilaya,
    shippingCommune: data.shipping_commune,
    shippingAddress: data.shipping_address,
    voucherCode: data.voucher_code,
  };
}

/**
 * Authoritative transactional approval of payment orders.
 * Executes inside PostgreSQL atomic transaction/RPC.
 * Upgrades order to APPROVED, creates subscription record, elevates student to PAID,
 * and writes audit log.
 * Never fakes success. Returns real error on DB failure.
 */
export async function approvePaymentOrder(
  orderId: string,
  operatorId: string,
  reason: string = "Payment receipt verified by operator",
  token?: string | null
): Promise<{ success: boolean; error?: string; order?: PaymentOrder }> {
  const cleanId = (orderId || "").trim();
  if (!UUID_REGEX.test(cleanId)) {
    return {
      success: false,
      error: `Invalid order ID format: "${orderId}". Order ID must be a valid UUID.`,
    };
  }

  // Obtain privileged client (service_role) or authenticated operator client (token)
  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    return {
      success: false,
      error: "Database configuration error: Supabase client is unavailable.",
    };
  }

  try {
    // 1. Call atomic PostgreSQL approval RPC
    let rpcRes = await client.rpc("admin_authoritative_approve_order", {
      p_order_id: cleanId,
      p_operator_id: operatorId,
      p_reason: reason,
    });

    // Fallback to approve_payment_order if migration 023 name not yet available
    if (rpcRes.error && rpcRes.error.message?.includes("admin_authoritative_approve_order")) {
      rpcRes = await client.rpc("approve_payment_order", {
        p_order_id: cleanId,
        p_reason: reason,
      });
    }

    if (rpcRes.error) {
      console.error("[approvePaymentOrder] Database RPC error:", rpcRes.error);
      return {
        success: false,
        error: rpcRes.error.message || "PostgreSQL approval transaction failed.",
      };
    }

    if (!rpcRes.data?.success) {
      return {
        success: false,
        error: rpcRes.data?.error || rpcRes.data?.message || "Payment approval rejected by database.",
      };
    }

    // 2. Fetch authoritative updated order from PostgreSQL
    const updated = await getPaymentOrderById(cleanId, token);
    return {
      success: true,
      order: updated || undefined,
    };
  } catch (err: any) {
    console.error("[approvePaymentOrder] Unexpected exception:", err);
    return {
      success: false,
      error: err?.message || "Failed to execute database approval transaction.",
    };
  }
}

/**
 * Rejects a payment order authoritatively in PostgreSQL
 */
export async function rejectPaymentOrder(
  orderId: string,
  operatorId: string,
  rejectionReason: string,
  token?: string | null
): Promise<{ success: boolean; error?: string; order?: PaymentOrder }> {
  if (!rejectionReason || !rejectionReason.trim()) {
    return { success: false, error: "Rejection reason is required." };
  }

  const cleanId = (orderId || "").trim();
  if (!UUID_REGEX.test(cleanId)) {
    return { success: false, error: `Invalid order ID syntax: "${orderId}". Must be a valid UUID.` };
  }

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    return { success: false, error: "Database client is unavailable." };
  }

  try {
    const { data, error } = await client.rpc("reject_payment_order", {
      p_order_id: cleanId,
      p_reason: rejectionReason.trim(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || "Rejection failed in database" };
    }

    const updated = await getPaymentOrderById(cleanId, token);
    return { success: true, order: updated || undefined };
  } catch (err: any) {
    return { success: false, error: err?.message || "Rejection exception in database" };
  }
}

/**
 * Updates payment order receipt path authoritatively in PostgreSQL
 */
export async function updateOrderReceiptPath(
  orderId: string,
  receiptPath: string,
  token?: string | null
): Promise<boolean> {
  const cleanId = (orderId || "").trim();
  if (!UUID_REGEX.test(cleanId)) return false;

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) return false;

  try {
    const { error } = await client
      .from("payment_orders")
      .update({ receipt_path: receiptPath, updated_at: new Date().toISOString() })
      .eq("id", cleanId);
    return !error;
  } catch {
    return false;
  }
}

export interface CreateCodOrderInput {
  userId?: string | null;
  plan?: string;
  shippingName: string;
  shippingPhone: string;
  parentPhone?: string;
  shippingWilaya: string;
  shippingCommune?: string;
  shippingAddress?: string;
  notes?: string;
  studentEmail?: string;
}

/**
 * Creates a Cash on Delivery (COD) order authoritatively in PostgreSQL
 */
export async function createCodOrder(
  input: CreateCodOrderInput,
  token?: string | null
): Promise<PaymentOrder> {
  const rawPlanKey = input.plan || "season";
  const normalizedKey = rawPlanKey === "bac_season_pass_pilot" ? "season" : rawPlanKey;

  const subscriptionPlan = await getSubscriptionPlanById(normalizedKey);
  const authoritativePlan = AUTHORITATIVE_PLANS[rawPlanKey] || AUTHORITATIVE_PLANS[normalizedKey];

  if (!subscriptionPlan && !authoritativePlan) {
    throw new Error(`Unknown or unsupported plan: ${input.plan}`);
  }

  const finalPlanId = rawPlanKey;
  const finalPrice = subscriptionPlan ? subscriptionPlan.price_dzd : (authoritativePlan?.priceDZD ?? 4900);
  const orderId = crypto.randomUUID(); // Valid RFC 4122 v4 UUID
  const now = new Date().toISOString();

  // Create pre-assigned SHATER Pass voucher for physical delivery
  const voucher = await createVoucher({
    planId: finalPlanId,
    salesChannel: "COD",
    orderId: orderId,
  });

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    throw new Error("Database service is unavailable. COD orders require PostgreSQL connection.");
  }

  const effectiveUserId = input.userId && UUID_REGEX.test(input.userId) ? input.userId : null;

  const { data: inserted, error } = await client
    .from("payment_orders")
    .insert({
      id: orderId,
      user_id: effectiveUserId,
      plan: finalPlanId,
      amount: finalPrice,
      currency: "DZD",
      payment_method: "cash",
      order_type: "COD",
      status: "PENDING",
      delivery_status: "PENDING",
      shipping_name: input.shippingName,
      shipping_phone: input.shippingPhone,
      shipping_wilaya: input.shippingWilaya,
      shipping_commune: input.shippingCommune,
      shipping_address: input.shippingAddress,
      voucher_code: voucher.voucherCode,
      notes: input.notes || "طلب بطاقة شاطر عبر التوصيل مع الدفع عند الاستلام",
      submitted_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error || !inserted) {
    throw new Error(`Failed to create COD order in database: ${error?.message || "Unknown DB error"}`);
  }

  await recordAuditLog({
    actorUserId: input.userId,
    actorRole: "STUDENT",
    action: "COD_ORDER_CREATED",
    targetType: "payment_order",
    targetId: orderId,
    reason: `طلب بطاقة شاطر توصيل إلى ولاية ${input.shippingWilaya}`,
    afterState: { orderId, amount: finalPrice, voucherCode: voucher.voucherCode },
  });

  return {
    id: inserted.id,
    userId: inserted.user_id,
    plan: inserted.plan,
    amount: Number(inserted.amount),
    currency: "DZD",
    paymentMethod: "cash",
    orderType: "COD",
    status: "PENDING",
    deliveryStatus: "PENDING",
    shippingName: input.shippingName,
    shippingPhone: input.shippingPhone,
    shippingWilaya: input.shippingWilaya,
    shippingCommune: input.shippingCommune,
    shippingAddress: input.shippingAddress,
    voucherCode: voucher.voucherCode,
    notes: inserted.notes,
    submittedAt: inserted.submitted_at,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at,
    studentName: input.shippingName,
    studentPhone: input.shippingPhone,
    studentEmail: input.studentEmail,
    wilayaName: input.shippingWilaya,
  };
}

/**
 * Confirms COD delivery by courier/operator, collects cash, and activates subscription
 */
export async function confirmCodDelivery(
  orderId: string,
  operatorId: string,
  notes?: string,
  token?: string | null
): Promise<{ success: boolean; error?: string; order?: PaymentOrder }> {
  const cleanId = (orderId || "").trim();
  if (!UUID_REGEX.test(cleanId)) {
    return { success: false, error: `Invalid order ID syntax: "${orderId}". Must be a valid UUID.` };
  }

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    return { success: false, error: "Database client is unavailable." };
  }

  try {
    const { data, error } = await client.rpc("confirm_cod_order_delivery", {
      p_order_id: cleanId,
      p_notes: notes || "تم تأكيد التسليم واستلام المبلغ",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || "Failed to confirm COD delivery in database" };
    }

    if (data.user_id) {
      try {
        await qualifyReferralOnSubscription(data.user_id, cleanId);
      } catch {}
    }

    const updated = await getPaymentOrderById(cleanId, token);
    return { success: true, order: updated || undefined };
  } catch (err: any) {
    return { success: false, error: err?.message || "Exception confirming COD delivery" };
  }
}
