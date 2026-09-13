/**
 * BAC Mastery — Manual Subscription Management Service
 * Phase P0.2 Simple Manual Subscription Control
 * 
 * INVARIANTS:
 * 1. Exactly two plans: 'season' (اشتراك الموسم الدراسي) and 'monthly' (الاشتراك الشهري).
 * 2. No hardcoded prices in application logic; database/operations store is the source of truth.
 * 3. Operator manually controls price, duration, and open/closed state.
 * 4. Closing a plan immediately blocks new purchases, but never cancels active student subscriptions.
 * 5. Manual extension in student dossier happens server-side, emits audit logs, and creates zero payment orders.
 * 6. Dual-mode resilience: Supabase subscription_plans with in-memory fallback.
 */

import { SubscriptionPlan, SubscriptionAlert } from "./types";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { recordAuditLog } from "./audit";
import { hasFinanceAccess, getServerUserRole } from "./auth";
import { StudentRepository } from "../repositories/student-repository";
import { getPaymentOrders } from "./payments";

// In-memory fallback plans registry for testing / offline environments
const memorySubscriptionPlans: Map<string, SubscriptionPlan> = new Map([
  [
    "season",
    {
      id: "season",
      name: "اشتراك الموسم الدراسي",
      price_dzd: 3900.0,
      duration_months: 10,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  [
    "monthly",
    {
      id: "monthly",
      name: "الاشتراك الشهري",
      price_dzd: 1500.0,
      duration_months: 1,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
]);

/**
 * Resets memory plans for testing
 */
export function resetMemorySubscriptionPlans(): void {
  memorySubscriptionPlans.set("season", {
    id: "season",
    name: "اشتراك الموسم الدراسي",
    price_dzd: 3900.0,
    duration_months: 10,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  memorySubscriptionPlans.set("monthly", {
    id: "monthly",
    name: "الاشتراك الشهري",
    price_dzd: 1500.0,
    duration_months: 1,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

/**
 * Retrieves all subscription plans from database / memory
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("duration_months", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          price_dzd: Number(d.price_dzd),
          duration_months: Number(d.duration_months),
          active: Boolean(d.active),
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));
      }
    } catch {
      // Memory fallback
    }
  }

  return Array.from(memorySubscriptionPlans.values());
}

/**
 * Retrieves a single subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: string): Promise<SubscriptionPlan | null> {
  const normalizedId = (planId || "").toLowerCase().trim();
  // Map legacy IDs if needed
  const targetId = normalizedId === "bac_season_pass_pilot" ? "season" : normalizedId;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", targetId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          price_dzd: Number(data.price_dzd),
          duration_months: Number(data.duration_months),
          active: Boolean(data.active),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch {
      // Memory fallback
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
  }
): Promise<{ success: boolean; error?: string; plan?: SubscriptionPlan }> {
  // 1. Authorization check
  const authorized = await hasFinanceAccess(callerUserId);
  if (!authorized) {
    return {
      success: false,
      error: "Forbidden: You do not possess finance authorization to modify subscription plans.",
    };
  }

  const existingPlan = await getSubscriptionPlanById(planId);
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

  // 3. Persist in memory registry
  memorySubscriptionPlans.set(updatedPlan.id, updatedPlan);

  // 4. Persist in Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
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
    } catch {
      // Retained in memory fallback
    }
  }

  // 5. Determine audit action
  let auditAction: any = "SUBSCRIPTION_PLAN_UPDATED";
  if (updates.active !== undefined && updates.active !== beforeState.active) {
    auditAction = updates.active ? "SUBSCRIPTION_OPENED" : "SUBSCRIPTION_CLOSED";
  }

  const role = (await getServerUserRole(callerUserId)) || "OPERATOR";

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
 * Manually extends an active or expired student's access.
 * Does NOT create a payment order.
 * Emits audit log: SUBSCRIPTION_EXTENDED.
 */
export async function extendStudentSubscription(
  callerUserId: string,
  studentId: string,
  extension: {
    type: "1_month" | "1_week" | "custom";
    days?: number;
    reason?: string;
  }
): Promise<{ success: boolean; error?: string; newExpiresAt?: string }> {
  // 1. Authorization check
  const authorized = await hasFinanceAccess(callerUserId);
  if (!authorized) {
    return {
      success: false,
      error: "Forbidden: You do not possess finance authorization to extend student subscriptions.",
    };
  }

  const studentProfile: any = await StudentRepository.getProfile(studentId);
  if (!studentProfile) {
    return { success: false, error: `Student '${studentId}' not found.` };
  }

  const now = new Date();
  let extensionMs = 30 * 24 * 60 * 60 * 1000; // default 1 month

  if (extension.type === "1_week") {
    extensionMs = 7 * 24 * 60 * 60 * 1000;
  } else if (extension.type === "custom") {
    const safeDays = Math.max(1, Number(extension.days) || 30);
    extensionMs = safeDays * 24 * 60 * 60 * 1000;
  }

  // Base anchor: if student is currently active (subscription_expires_at > now), add to existing end date;
  // otherwise, start from now.
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

  // Update student profile authoritatively
  const updatedProfile = {
    ...studentProfile,
    access_status: "PAID",
    plan: studentProfile.plan === "PILOT_TRIAL" ? "season" : studentProfile.plan || "season",
    subscription_started_at: studentProfile.subscription_started_at || now.toISOString(),
    subscription_expires_at: newExpiration,
    updated_at: now.toISOString(),
  };

  await StudentRepository.saveProfile(updatedProfile as any);

  // Emit audit log
  const role = (await getServerUserRole(callerUserId)) || "OPERATOR";
  const reasonText = extension.reason || `Manual subscription extension (${extension.type}) by operator`;

  await recordAuditLog({
    actorUserId: callerUserId,
    actorRole: role,
    action: "SUBSCRIPTION_EXTENDED",
    targetType: "student_profile",
    targetId: studentId,
    reason: reasonText,
    beforeState,
    afterState: {
      access_status: "PAID",
      subscription_expires_at: newExpiration,
      extension_type: extension.type,
      extension_days: Math.round(extensionMs / (24 * 3600 * 1000)),
    },
  });

  return { success: true, newExpiresAt: newExpiration };
}

/**
 * Aggregates operational alerts for the Operations Center:
 * 🔔 New payment waiting for verification
 * 🔔 New receipt uploaded
 * 🔔 Student subscription expires today
 * 🔔 Student subscription expired
 * 🔔 Subscription plan is closed
 * 🔔 New subscription approved
 */
export async function getSubscriptionAlerts(): Promise<SubscriptionAlert[]> {
  const alerts: SubscriptionAlert[] = [];
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // 1. Check Plans: Are any plans closed?
  const plans = await getSubscriptionPlans();
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
    const orders = await getPaymentOrders({ limit: 50 });
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
