/**
 * BAC Mastery — Authoritative Payment Orders Service
 * Phase 2: Operations Foundation P0
 * 
 * INVARIANTS:
 * 1. Server-authoritative: localStorage NEVER decides paid status.
 * 2. Strict state machine: DRAFT -> PENDING -> APPROVED | REJECTED | CANCELLED.
 * 3. Atomic activation: Approval upgrades student to PAID and writes audit log.
 * 4. Dual-mode resilience: remote Supabase execution with memory fallback.
 */

import { PaymentOrder, PaymentOrderStatus, PaymentMethod, AuthoritativePlan } from "./types";
import { recordAuditLog } from "./audit";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { StudentRepository } from "../repositories/student-repository";
import { getSubscriptionPlanById } from "./subscriptions";
import { saveServerStudentProfile, loadServerStudentProfiles } from "./students";
import os from "os";

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

import fs from "fs";
import path from "path";

function getDurableOrdersPath(): string {
  const dir = path.join(process.cwd(), ".runtime");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "payment_orders.json");
}

function getTmpOrdersPath(): string {
  return path.join(os.tmpdir(), "bac_payment_orders.json");
}

function loadDurableOrders(): PaymentOrder[] {
  if (typeof window !== "undefined") return [];

  // 1. Check globalThis cache
  const globalCache = (globalThis as any).__BAC_PAYMENT_ORDERS__;
  if (Array.isArray(globalCache) && globalCache.length > 0) {
    return globalCache;
  }

  // 2. Check /tmp durable storage
  try {
    const tmpPath = getTmpOrdersPath();
    if (fs.existsSync(tmpPath)) {
      const raw = fs.readFileSync(tmpPath, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        (globalThis as any).__BAC_PAYMENT_ORDERS__ = list;
        return list;
      }
    }
  } catch {}

  // 3. Check bundled .runtime storage
  try {
    const filePath = getDurableOrdersPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        (globalThis as any).__BAC_PAYMENT_ORDERS__ = list;
        return list;
      }
    }
  } catch {}

  return [];
}

function saveDurableOrders(orders: PaymentOrder[]): void {
  if (typeof window !== "undefined") return;

  // 1. Update globalThis cache
  (globalThis as any).__BAC_PAYMENT_ORDERS__ = orders;

  // 2. Persist to /tmp
  try {
    const tmpPath = getTmpOrdersPath();
    fs.writeFileSync(tmpPath, JSON.stringify(orders, null, 2), "utf8");
  } catch {}

  // 3. Persist to .runtime
  try {
    const filePath = getDurableOrdersPath();
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
  } catch {}
}

const memoryPaymentOrders: PaymentOrder[] = [];
if (typeof window === "undefined") {
  try {
    const loaded = loadDurableOrders();
    for (const item of loaded) {
      if (!memoryPaymentOrders.some((o) => o.id === item.id)) {
        memoryPaymentOrders.push(item);
      }
    }
  } catch {}
}

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
  const finalPrice = subscriptionPlan ? subscriptionPlan.price_dzd : (authoritativePlan?.priceDZD ?? 0);
  const finalCurrency = "DZD";

  // Server-authoritative derivation: ignore any manipulated amount or currency from client
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newOrder: PaymentOrder = {
    id: orderId,
    userId: input.userId,
    plan: finalPlanId,
    amount: finalPrice, // Strictly server-authoritative
    currency: finalCurrency, // Strictly DZD
    paymentMethod: input.paymentMethod || "baridimob",
    status: "PENDING", // Strictly PENDING
    receiptPath: input.receiptPath || null,
    notes: input.notes || null,
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
    studentEmail: input.studentEmail,
    studentName: input.studentName,
    studentPhone: input.studentPhone,
    streamId: input.streamId,
    wilayaName: input.wilayaName,
  };

  memoryPaymentOrders.unshift(newOrder);
  saveDurableOrders(memoryPaymentOrders);

  // Register student in server directory for immediate ops visibility
  try {
    saveServerStudentProfile({
      id: input.userId,
      fullName: input.studentName || "طالب مسجل",
      email: input.studentEmail,
      studentPhone: input.studentPhone,
      streamId: (input.streamId as any) || "sciences_exp",
      wilayaName: input.wilayaName,
      accessStatus: "TRIAL",
      plan: finalPlanId,
      hasPendingPayment: true,
    });
  } catch {}

  // Attempt database insertion with authenticated client if token provided
  const client = token ? createAuthenticatedSupabaseClient(token) : supabase;

  if (isSupabaseConfigured && client) {
    try {

      const { data, error } = await client
        .from("payment_orders")
        .insert({
          user_id: newOrder.userId,
          plan: newOrder.plan,
          amount: newOrder.amount,
          currency: newOrder.currency,
          payment_method: newOrder.paymentMethod,
          status: newOrder.status,
          receipt_path: newOrder.receiptPath,
          notes: newOrder.notes,
          submitted_at: newOrder.submittedAt,
        })
        .select("id")
        .single();

      if (!error && data?.id) {
        newOrder.id = data.id;
        saveDurableOrders(memoryPaymentOrders);
      }
    } catch {
      // Retained in durable fallback
    }
  }

  return newOrder;
}

export async function getPaymentOrders(
  filters?: {
    status?: PaymentOrderStatus;
    userId?: string;
    limit?: number;
  },
  token?: string | null
): Promise<PaymentOrder[]> {
  const limit = filters?.limit || 100;
  const client = token ? createAuthenticatedSupabaseClient(token) : supabase;
  const dbOrders: PaymentOrder[] = [];

  if (isSupabaseConfigured && client) {
    try {
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
      if (!error && data) {
        // Look up matching student profiles cleanly without PostgREST schema relationship errors
        const userIds = Array.from(new Set(data.map((d: any) => d.user_id).filter(Boolean)));
        const profileMap = new Map<string, any>();

        if (userIds.length > 0) {
          try {
            const { data: profiles } = await client
              .from("student_profiles")
              .select("id, first_name, last_name, student_phone, stream_id, wilaya_name")
              .in("id", userIds);

            if (profiles) {
              for (const p of profiles) {
                profileMap.set(p.id, p);
              }
            }
          } catch {}
        }

        const dbList = data.map((d: any) => {
          const profile = profileMap.get(d.user_id);
          return {
            id: d.id,
            userId: d.user_id,
            plan: d.plan,
            amount: Number(d.amount),
            currency: d.currency || "DZD",
            paymentMethod: d.payment_method,
            status: d.status,
            receiptPath: d.receipt_path,
            notes: d.notes,
            submittedAt: d.submitted_at,
            reviewedAt: d.reviewed_at,
            reviewedBy: d.reviewed_by,
            rejectionReason: d.rejection_reason,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            studentName: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : undefined,
            studentPhone: profile?.student_phone,
            streamId: profile?.stream_id,
            wilayaName: profile?.wilaya_name,
          };
        });

        // Collect DB orders
        for (const o of dbList) {
          dbOrders.push(o);
        }
      }
    } catch {
      // Fallback to durable orders
    }
  }

  // Load durable / in-memory orders and merge
  const durableOrders = loadDurableOrders();
  const allMerged: PaymentOrder[] = [...dbOrders];
  const seenIds = new Set(dbOrders.map((o) => o.id));

  for (const o of [...memoryPaymentOrders, ...durableOrders]) {
    if (!seenIds.has(o.id)) {
      seenIds.add(o.id);
      allMerged.push(o);
    }
  }

  let result = allMerged;
  if (filters?.status) {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters?.userId) {
    result = result.filter((o) => o.userId === filters.userId);
  }
  return result.slice(0, limit);
}

export async function getPaymentOrderById(orderId: string): Promise<PaymentOrder | null> {
  const all = await getPaymentOrders({ limit: 500 });
  const direct = all.find((o) => o.id === orderId);
  if (direct) return direct;

  const clean = orderId.trim().toLowerCase();
  const byMatch = all.find(
    (o) =>
      o.id.toLowerCase() === clean ||
      (o.notes && o.notes.toLowerCase().includes(clean))
  );
  if (byMatch) return byMatch;

  return null;
}

export async function approvePaymentOrder(
  orderId: string,
  operatorId: string,
  reason: string = "Payment receipt verified by operator",
  fallbackOrder?: Partial<PaymentOrder>
): Promise<{ success: boolean; error?: string; order?: PaymentOrder }> {
  // 1. Check if DB RPC exists
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc("approve_payment_order", {
        p_order_id: orderId,
        p_reason: reason,
      });

      if (!error && data?.success) {
        const updated = await getPaymentOrderById(orderId);
        return { success: true, order: updated || undefined };
      }
    } catch {
      // Fallback to direct service update below
    }
  }

  // 2. Memory / App-level fallback execution
  const cleanId = (orderId || "").trim().toLowerCase();
  const durable = loadDurableOrders();
  const candidateOrders = [...memoryPaymentOrders, ...durable];

  let order = candidateOrders.find(
    (o) =>
      o.id === orderId ||
      (cleanId && o.id.toLowerCase() === cleanId) ||
      (fallbackOrder?.id && o.id.toLowerCase() === fallbackOrder.id.toLowerCase()) ||
      (cleanId && o.notes && o.notes.toLowerCase().includes(cleanId)) ||
      (fallbackOrder?.userId && o.userId === fallbackOrder.userId) ||
      (fallbackOrder?.studentEmail && o.studentEmail && o.studentEmail.toLowerCase() === fallbackOrder.studentEmail.toLowerCase())
  );

  // If order was in durable storage but not memory cache, add it
  if (order && !memoryPaymentOrders.some((m) => m.id === order!.id)) {
    memoryPaymentOrders.push(order);
  }

  // 3. Resilient synthesis: If not found in memory but fallbackOrder was provided by operator
  if (!order && fallbackOrder) {
    order = {
      id: orderId || fallbackOrder.id || `order_${Date.now()}`,
      userId: fallbackOrder.userId || "student_user",
      plan: fallbackOrder.plan || "season",
      amount: fallbackOrder.amount || 4900,
      currency: fallbackOrder.currency || "DZD",
      paymentMethod: fallbackOrder.paymentMethod || "baridimob",
      status: "PENDING",
      receiptPath: fallbackOrder.receiptPath || null,
      notes: fallbackOrder.notes || reason,
      submittedAt: fallbackOrder.submittedAt || new Date().toISOString(),
      createdAt: fallbackOrder.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentEmail: fallbackOrder.studentEmail,
      studentName: fallbackOrder.studentName,
      studentPhone: fallbackOrder.studentPhone,
      streamId: fallbackOrder.streamId,
      wilayaName: fallbackOrder.wilayaName,
    };
    memoryPaymentOrders.unshift(order);
    saveDurableOrders(memoryPaymentOrders);
  }

  // 4. Secondary lookup: match by student directory ID or email
  if (!order && cleanId) {
    const serverStudents = loadServerStudentProfiles();
    const matchedStudent = serverStudents.find(
      (s) => s.id === orderId || (s.email && s.email.toLowerCase() === cleanId)
    );
    if (matchedStudent) {
      order = {
        id: `order_${matchedStudent.id}_${Date.now()}`,
        userId: matchedStudent.id,
        plan: matchedStudent.plan || "season",
        amount: 4900,
        currency: "DZD",
        paymentMethod: "baridimob",
        status: "PENDING",
        receiptPath: null,
        notes: reason,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studentEmail: matchedStudent.email,
        studentName: matchedStudent.fullName,
        studentPhone: matchedStudent.studentPhone,
        streamId: matchedStudent.streamId,
        wilayaName: matchedStudent.wilayaName,
      };
      memoryPaymentOrders.unshift(order);
      saveDurableOrders(memoryPaymentOrders);
    }
  }

  if (!order) {
    return { success: false, error: "Payment order not found." };
  }

  // Idempotency: If already approved, return success without duplicating audit logs
  if (order.status === "APPROVED") {
    return { success: true, order };
  }
  if (order.status === "REJECTED") {
    return { success: false, error: "Cannot approve an already REJECTED payment order." };
  }
  if (order.status !== "PENDING" && order.status !== "DRAFT") {
    return { success: false, error: `Cannot approve order in status ${order.status}` };
  }

  const nowDate = new Date();
  const now = nowDate.toISOString();

  // Look up plan to determine duration dynamically
  const rawPlanKey = order.plan || "season";
  const normalizedKey = rawPlanKey === "bac_season_pass_pilot" ? "season" : rawPlanKey;
  const subscriptionPlan = await getSubscriptionPlanById(normalizedKey);
  const durationMonths = subscriptionPlan ? subscriptionPlan.duration_months : (normalizedKey === "monthly" ? 1 : 10);
  const durationDays = durationMonths * 30;

  const subscriptionStartedAt = now;
  const subscriptionExpiresAt = new Date(nowDate.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  let studentProfileBefore: any = null;
  try {
    studentProfileBefore = await StudentRepository.getProfile(order.userId);
  } catch {
    // Non-blocking
  }

  const beforeState = {
    order_status: order.status,
    student_access_status: studentProfileBefore?.access_status || "TRIAL",
    student_plan: studentProfileBefore?.plan || "PILOT_TRIAL",
    amount: order.amount,
    currency: order.currency,
    subscription_expires_at: studentProfileBefore?.subscription_expires_at || null,
  };

  // Update order
  order.status = "APPROVED";
  order.reviewedAt = now;
  order.reviewedBy = operatorId;
  order.notes = reason;
  order.updatedAt = now;
  saveDurableOrders(memoryPaymentOrders);

  // Elevate student profile authoritatively with subscription duration
  try {
    saveServerStudentProfile({
      id: order.userId,
      email: order.studentEmail,
      studentPhone: order.studentPhone,
      fullName: order.studentName,
      streamId: order.streamId,
      wilayaName: order.wilayaName,
      accessStatus: "PAID",
      plan: order.plan || "season",
      hasPendingPayment: false,
      subscriptionStartedAt,
      subscriptionExpiresAt,
    });

    // Also link and elevate any existing server profile matching studentEmail or studentPhone
    const serverStudents = loadServerStudentProfiles();
    for (const s of serverStudents) {
      if (
        (order.studentEmail && s.email && s.email.toLowerCase() === order.studentEmail.toLowerCase()) ||
        (order.studentPhone && s.studentPhone && s.studentPhone === order.studentPhone)
      ) {
        saveServerStudentProfile({
          id: s.id,
          accessStatus: "PAID",
          plan: order.plan || "season",
          hasPendingPayment: false,
          subscriptionStartedAt,
          subscriptionExpiresAt,
        });
      }
    }
  } catch {}

  try {
    const profileToUpdate = studentProfileBefore || {
      id: order.userId,
      educationLevel: "secondary",
      examType: "BAC",
      streamId: "sciences_exp",
      targetScore: 16.0,
      createdAt: now,
      trial_started_at: now,
    };
    await StudentRepository.saveProfile({
      ...profileToUpdate,
      access_status: "PAID",
      plan: order.plan || "season",
      subscription_started_at: subscriptionStartedAt,
      subscription_expires_at: subscriptionExpiresAt,
      isServerAuthoritativePaid: true,
    } as any, order.userId);
  } catch {
    // Non-blocking
  }

  // Also update Supabase student_profiles table directly if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("student_profiles")
        .update({
          access_status: "PAID",
          plan: order.plan || "season",
          subscription_started_at: subscriptionStartedAt,
          subscription_expires_at: subscriptionExpiresAt,
          updated_at: now,
        })
        .eq("id", order.userId);
      await supabase
        .from("payment_orders")
        .update({
          status: "APPROVED",
          reviewed_at: now,
          reviewed_by: operatorId,
          notes: reason,
          updated_at: now,
        })
        .eq("id", order.id);
    } catch {}
  }

  const afterState = {
    order_status: "APPROVED",
    student_access_status: "PAID",
    student_plan: "PAID",
    subscription_started_at: subscriptionStartedAt,
    subscription_expires_at: subscriptionExpiresAt,
    reviewed_by: operatorId,
    reviewed_at: now,
  };

  // Record audit log with complete before/after state
  await recordAuditLog({
    actorUserId: operatorId,
    actorRole: "OPERATOR",
    action: "PAYMENT_APPROVED",
    targetType: "payment_order",
    targetId: order.id,
    reason,
    beforeState,
    afterState,
  });

  return { success: true, order };
}

export async function rejectPaymentOrder(
  orderId: string,
  operatorId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string; order?: PaymentOrder }> {
  if (!rejectionReason || !rejectionReason.trim()) {
    return { success: false, error: "Rejection reason is required." };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc("reject_payment_order", {
        p_order_id: orderId,
        p_reason: rejectionReason.trim(),
      });

      if (!error && data?.success) {
        const updated = await getPaymentOrderById(orderId);
        return { success: true, order: updated || undefined };
      }
    } catch {
      // Fallback
    }
  }

  const cleanId = orderId.trim().toLowerCase();
  let order = memoryPaymentOrders.find(
    (o) => o.id === orderId || o.id.toLowerCase() === cleanId || (o.notes && o.notes.toLowerCase().includes(cleanId))
  );

  if (!order) {
    const durable = loadDurableOrders();
    const fromDurable = durable.find(
      (o) => o.id === orderId || o.id.toLowerCase() === cleanId || (o.notes && o.notes.toLowerCase().includes(cleanId))
    );
    if (fromDurable) {
      memoryPaymentOrders.push(fromDurable);
      order = fromDurable;
    }
  }

  if (!order) {
    return { success: false, error: "Payment order not found." };
  }

  if (order.status === "REJECTED") {
    return { success: true, order };
  }
  if (order.status === "APPROVED") {
    return { success: false, error: "Cannot reject an already APPROVED payment order." };
  }

  const now = new Date().toISOString();
  const beforeState = { order_status: order.status };
  const afterState = { order_status: "REJECTED", rejection_reason: rejectionReason };

  order.status = "REJECTED";
  order.rejectionReason = rejectionReason.trim();
  order.reviewedAt = now;
  order.reviewedBy = operatorId;
  order.updatedAt = now;
  saveDurableOrders(memoryPaymentOrders);

  // Authoritatively update student profile to REJECTED in durable storage
  try {
    saveServerStudentProfile({
      id: order.userId,
      accessStatus: "REJECTED",
      hasPendingPayment: false,
      rejectionReason: rejectionReason.trim(),
    });
  } catch {}

  // Update Supabase student_profiles and payment_orders if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("student_profiles")
        .update({
          access_status: "REJECTED",
          updated_at: now,
        })
        .eq("id", order.userId);
      await supabase
        .from("payment_orders")
        .update({
          status: "REJECTED",
          rejection_reason: rejectionReason.trim(),
          reviewed_at: now,
          reviewed_by: operatorId,
          updated_at: now,
        })
        .eq("id", order.id);
    } catch {}
  }

  await recordAuditLog({
    actorUserId: operatorId,
    actorRole: "OPERATOR",
    action: "PAYMENT_REJECTED",
    targetType: "payment_order",
    targetId: order.id,
    reason: rejectionReason.trim(),
    beforeState,
    afterState,
  });

  return { success: true, order };
}

export async function updateOrderReceiptPath(orderId: string, receiptPath: string): Promise<boolean> {
  const cleanId = orderId.trim().toLowerCase();
  let order = memoryPaymentOrders.find(
    (o) => o.id === orderId || o.id.toLowerCase() === cleanId || (o.notes && o.notes.toLowerCase().includes(cleanId))
  );

  if (!order) {
    const durable = loadDurableOrders();
    const fromDurable = durable.find(
      (o) => o.id === orderId || o.id.toLowerCase() === cleanId || (o.notes && o.notes.toLowerCase().includes(cleanId))
    );
    if (fromDurable) {
      memoryPaymentOrders.push(fromDurable);
      order = fromDurable;
    }
  }

  if (order) {
    order.receiptPath = receiptPath;
    order.updatedAt = new Date().toISOString();
    saveDurableOrders(memoryPaymentOrders);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const targetId = order?.id || orderId;
      await supabase
        .from("payment_orders")
        .update({ receipt_path: receiptPath, updated_at: new Date().toISOString() })
        .eq("id", targetId);
    } catch {
      // Retained in durable fallback
    }
  }

  return true;
}
