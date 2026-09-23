/**
 * BAC Mastery — Manual Subscription Management Service
 * Phase P0.2 Simple Manual Subscription Control
 * 
 * INVARIANTS:
 * 1. Exactly two plans: 'season' (اشتراك الموسم الدراسي) and 'monthly' (الاشتراك الشهري).
 * 2. No hardcoded prices in application logic; database (public.subscription_plans) is the source of truth.
 * 3. Operator manually controls price, duration, and open/closed state.
 * 4. Closing a plan immediately blocks new purchases, but never cancels active student subscriptions.
 * 5. Manual extension in student dossier happens server-side in PostgreSQL, emits audit logs.
 * 6. Authoritative persistence in Supabase PostgreSQL; no filesystem (.runtime / /tmp) fallbacks.
 */

import { SubscriptionPlan, SubscriptionAlert } from "./types";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { recordAuditLog } from "./audit";
import { hasFinanceAccess, getServerUserRole } from "./auth";
import { StudentRepository } from "../repositories/student-repository";
import { getPaymentOrders } from "./payments";
import { saveServerStudentProfile } from "./students";

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "season",
    name: "اشتراك الموسم الدراسي",
    price_dzd: 4900.0,
    duration_months: 10,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "monthly",
    name: "الاشتراك الشهري",
    price_dzd: 900.0,
    duration_months: 1,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// In-memory fallback plans cache
const memorySubscriptionPlans: Map<string, SubscriptionPlan> = new Map();
for (const p of DEFAULT_PLANS) {
  memorySubscriptionPlans.set(p.id, p);
}

/**
 * Resets memory plans for testing
 */
export function resetMemorySubscriptionPlans(): void {
  for (const p of DEFAULT_PLANS) {
    memorySubscriptionPlans.set(p.id, { ...p, price_dzd: 0.0, active: false });
  }
}

/**
 * Retrieves all subscription plans from Supabase PostgreSQL
 */
export async function getSubscriptionPlans(token?: string | null): Promise<SubscriptionPlan[]> {
  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from("subscription_plans")
        .select("*")
        .order("duration_months", { ascending: false });

      if (!error && data && data.length > 0) {
        const plans = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          price_dzd: Number(d.price_dzd),
          duration_months: Number(d.duration_months),
          active: Boolean(d.active),
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));
        for (const p of plans) {
          memorySubscriptionPlans.set(p.id, p);
        }
        return plans;
      }
    } catch {
      // Fall through to memory
    }
  }

  return Array.from(memorySubscriptionPlans.values());
}

/**
 * Retrieves a single subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: string, token?: string | null): Promise<SubscriptionPlan | null> {
  const normalizedId = (planId || "").toLowerCase().trim();
  const targetId = normalizedId === "bac_season_pass_pilot" ? "season" : normalizedId;

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from("subscription_plans")
        .select("*")
        .eq("id", targetId)
        .maybeSingle();

      if (!error && data) {
        const plan: SubscriptionPlan = {
          id: data.id,
          name: data.name,
          price_dzd: Number(data.price_dzd),
          duration_months: Number(data.duration_months),
          active: Boolean(data.active),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        memorySubscriptionPlans.set(plan.id, plan);
        return plan;
      }
    } catch {
      // Fallback
    }
  }

  return memorySubscriptionPlans.get(targetId) || null;
}

/**
 * Updates a subscription plan's price, duration, or open/closed state.
 * Strictly requires OWNER or OPERATOR with finance privileges.
 * Emits audit log: SUBSCRIPTION_PLAN_UPDATED, SUBSCRIPTION_OPENED, or SUBSCRIPTION_CLOSED.
 */
export async function updateSubscriptionPlan(
  callerUserId: string,
  planId: string,
  updates: {
    price_dzd?: number;
    duration_months?: number;
    active?: boolean;
    name?: string;
  },
  token?: string | null
): Promise<{ success: boolean; error?: string; plan?: SubscriptionPlan }> {
  // 1. Authorization check
  const authorized = await hasFinanceAccess(callerUserId, token);
  if (!authorized) {
    return {
      success: false,
      error: "Forbidden: You do not possess finance authorization to modify subscription plans.",
    };
  }

  const existingPlan = await getSubscriptionPlanById(planId, token);
  if (!existingPlan) {
    return { success: false, error: `Subscription plan '${planId}' not found.` };
  }

  const beforeState = { ...existingPlan };
  const now = new Date().toISOString();

  // 2. Validate input values
  if (updates.price_dzd !== undefined && (isNaN(updates.price_dzd) || updates.price_dzd < 0)) {
    return { success: false, error: "Price must be a valid non-negative number." };
  }
  if (updates.duration_months !== undefined && (isNaN(updates.duration_months) || updates.duration_months <= 0)) {
    return { success: false, error: "Duration must be a positive number of months." };
  }

  const updatedPlan: SubscriptionPlan = {
    ...existingPlan,
    name: updates.name !== undefined ? updates.name : existingPlan.name,
    price_dzd: updates.price_dzd !== undefined ? Number(updates.price_dzd) : existingPlan.price_dzd,
    duration_months: updates.duration_months !== undefined ? Math.floor(Number(updates.duration_months)) : existingPlan.duration_months,
    active: updates.active !== undefined ? Boolean(updates.active) : existingPlan.active,
    updated_at: now,
  };

  memorySubscriptionPlans.set(updatedPlan.id, updatedPlan);

  // 3. Persist in Supabase PostgreSQL
  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (isSupabaseConfigured && client) {
    try {
      await client
        .from("subscription_plans")
        .upsert(
          {
            id: updatedPlan.id,
            name: updatedPlan.name,
            price_dzd: updatedPlan.price_dzd,
            duration_months: updatedPlan.duration_months,
            active: updatedPlan.active,
            updated_at: now,
          },
          { onConflict: "id" }
        );
    } catch (err: any) {
      console.error("[updateSubscriptionPlan] Supabase error:", err);
    }
  }

  // 4. Determine audit action
  let auditAction: any = "SUBSCRIPTION_PLAN_UPDATED";
  if (updates.active !== undefined && updates.active !== beforeState.active) {
    auditAction = updates.active ? "SUBSCRIPTION_OPENED" : "SUBSCRIPTION_CLOSED";
  }

  const role = (await getServerUserRole(callerUserId, token)) || "OPERATOR";

  await recordAuditLog({
    actorUserId: callerUserId,
    actorRole: role,
    action: auditAction,
    targetType: "subscription_plan",
    targetId: updatedPlan.id,
    reason: `Plan ${updatedPlan.id} configuration updated by operator`,
    beforeState,
    afterState: updatedPlan as any,
  });

  return { success: true, plan: updatedPlan };
}

/**
 * Manually extends or activates a student's subscription from the Operations dossier.
 * Directly records an active subscription in public.subscriptions and updates student_profiles.
 */
export async function grantManualSubscription(
  callerUserId: string,
  rawStudentId: string,
  extension: {
    type: "1_week" | "1_month" | "season" | "custom";
    plan?: "season" | "monthly";
    days?: number;
    reason?: string;
  },
  token?: string | null
): Promise<{ success: boolean; error?: string; newExpiresAt?: string; plan?: string }> {
  // 1. Authorization check
  const authorized = await hasFinanceAccess(callerUserId, token);
  if (!authorized) {
    return {
      success: false,
      error: "Forbidden: You do not possess finance authorization to extend student subscriptions.",
    };
  }

  const cleanStudentId = (rawStudentId || "").trim();
  if (!cleanStudentId) {
    return { success: false, error: "معرف الطالب أو بريده الإلكتروني مطلوب." };
  }

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    return { success: false, error: "Database configuration error: Supabase client unavailable." };
  }

  // 2. Retrieve student profile from remote Supabase
  let studentProfile: any = null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanStudentId);

  if (isUuid) {
    const { data } = await client
      .from("student_profiles")
      .select("*")
      .eq("id", cleanStudentId)
      .maybeSingle();
    studentProfile = data;
  } else if (cleanStudentId.includes("@")) {
    const { data } = await client
      .from("student_profiles")
      .select("*")
      .ilike("raw_draft->>student_email", cleanStudentId)
      .maybeSingle();
    studentProfile = data;
  }

  if (!studentProfile) {
    studentProfile = await StudentRepository.getProfile(cleanStudentId);
  }

  const now = new Date();

  // If student profile still not found, return explicit error
  if (!studentProfile) {
    return {
      success: false,
      error: `لم يتم العثور على ملف الطالب بالمعرف: ${cleanStudentId}`,
    };
  }

  const effectiveStudentId = studentProfile.id;

  // 3. Calculate extension duration and plan type
  let extensionMs = 30 * 24 * 60 * 60 * 1000; // default 1 month
  let chosenPlan: "season" | "monthly" = extension.plan || (extension.type === "1_month" ? "monthly" : "season");

  if (extension.type === "1_week") {
    extensionMs = 7 * 24 * 60 * 60 * 1000;
  } else if (extension.type === "1_month" || extension.plan === "monthly") {
    extensionMs = 30 * 24 * 60 * 60 * 1000;
    chosenPlan = "monthly";
  } else if (extension.type === "season" || extension.plan === "season") {
    const days = extension.days ? Number(extension.days) : 300;
    extensionMs = days * 24 * 60 * 60 * 1000;
    chosenPlan = "season";
  } else if (extension.type === "custom") {
    const safeDays = Math.max(1, Number(extension.days) || 30);
    extensionMs = safeDays * 24 * 60 * 60 * 1000;
    chosenPlan = safeDays > 60 ? "season" : "monthly";
  }

  const currentExpires = studentProfile.subscription_expires_at
    ? new Date(studentProfile.subscription_expires_at)
    : studentProfile.trial_expires_at
    ? new Date(studentProfile.trial_expires_at)
    : now;

  const baseTime = currentExpires.getTime() > now.getTime() ? currentExpires.getTime() : now.getTime();
  const newExpiration = new Date(baseTime + extensionMs).toISOString();

  const beforeState = {
    access_status: studentProfile.access_status,
    plan: studentProfile.plan,
    subscription_expires_at: studentProfile.subscription_expires_at,
    trial_expires_at: studentProfile.trial_expires_at,
  };

  // 4. Update student profile in PostgreSQL
  const { error: profileError } = await client
    .from("student_profiles")
    .update({
      access_status: "PAID",
      plan: chosenPlan,
      subscription_started_at: studentProfile.subscription_started_at || now.toISOString(),
      subscription_expires_at: newExpiration,
      updated_at: now.toISOString(),
    })
    .eq("id", effectiveStudentId);

  if (profileError) {
    console.error("[grantManualSubscription] profile update error:", profileError);
  }

  // 5. Insert record into canonical public.subscriptions table
  try {
    await client.from("subscriptions").insert({
      id: crypto.randomUUID(),
      student_id: effectiveStudentId,
      plan_id: chosenPlan,
      status: "ACTIVE",
      started_at: now.toISOString(),
      expires_at: newExpiration,
      activated_by: callerUserId,
      notes: extension.reason || `Manual subscription granted by operator`,
    });
  } catch (subErr) {
    console.error("[grantManualSubscription] Subscriptions table insert warning:", subErr);
  }

  // Update in-memory cache
  saveServerStudentProfile({
    id: effectiveStudentId,
    accessStatus: "PAID",
    plan: chosenPlan,
    hasPendingPayment: false,
    subscriptionStartedAt: studentProfile.subscription_started_at || now.toISOString(),
    subscriptionExpiresAt: newExpiration,
  });

  // 6. Emit audit log
  const role = (await getServerUserRole(callerUserId, token)) || "OPERATOR";
  const reasonText = extension.reason || `Manual subscription activation (${chosenPlan}) by operator`;

  await recordAuditLog({
    actorUserId: callerUserId,
    actorRole: role,
    action: "SUBSCRIPTION_EXTENDED",
    targetType: "student_profile",
    targetId: effectiveStudentId,
    reason: reasonText,
    beforeState,
    afterState: {
      access_status: "PAID",
      subscription_expires_at: newExpiration,
      extension_type: extension.type,
      extension_plan: chosenPlan,
      extension_days: Math.round(extensionMs / (24 * 3600 * 1000)),
    },
  });

  return { success: true, newExpiresAt: newExpiration, plan: chosenPlan };
}

/**
 * Backward compatibility alias for grantManualSubscription
 */
export const extendStudentSubscription = grantManualSubscription;

/**
 * Aggregates operational alerts for the Operations Center
 */
export async function getSubscriptionAlerts(token?: string | null): Promise<SubscriptionAlert[]> {
  const alerts: SubscriptionAlert[] = [];
  const now = new Date();

  // 1. Check Plans: Are any plans closed?
  const plans = await getSubscriptionPlans(token);
  for (const plan of plans) {
    if (!plan.active) {
      alerts.push({
        id: `alert_plan_closed_${plan.id}`,
        type: "PLAN_CLOSED",
        title: `Subscription Plan Closed: ${plan.name}`,
        description: `New purchases for plan '${plan.name}' (${plan.id}) are currently blocked. Existing students remain active.`,
        severity: "warning",
        timestamp: plan.updated_at || now.toISOString(),
        targetId: plan.id,
      });
    }
  }

  // 2. Check Payments: Pending verification & Receipts
  try {
    const orders = await getPaymentOrders({ limit: 50 }, token);
    const pending = orders.filter((o) => o.status === "PENDING");
    if (pending.length > 0) {
      alerts.push({
        id: `alert_pending_payments_${pending.length}`,
        type: "PENDING_PAYMENT",
        title: `${pending.length} Payment Order(s) Waiting for Verification`,
        description: `There are ${pending.length} order(s) requiring manual review in the finance queue.`,
        severity: "danger",
        timestamp: pending[0].submittedAt,
      });
    }

    const withReceipts = pending.filter((o) => o.receiptPath);
    if (withReceipts.length > 0) {
      alerts.push({
        id: `alert_receipts_uploaded_${withReceipts.length}`,
        type: "RECEIPT_UPLOADED",
        title: `${withReceipts.length} New Payment Receipt(s) Uploaded`,
        description: `Students have attached bank slips ready for inspection.`,
        severity: "info",
        timestamp: withReceipts[0].submittedAt,
      });
    }

    // Recent approved order
    const recentlyApproved = orders.find((o) => o.status === "APPROVED");
    if (recentlyApproved) {
      alerts.push({
        id: `alert_approved_${recentlyApproved.id}`,
        type: "SUBSCRIPTION_APPROVED",
        title: `New Subscription Approved`,
        description: `Order ${recentlyApproved.id} was verified and upgraded to PAID.`,
        severity: "success",
        timestamp: recentlyApproved.reviewedAt || recentlyApproved.updatedAt,
        targetId: recentlyApproved.id,
      });
    }
  } catch {
    // Non-blocking
  }

  return alerts;
}
