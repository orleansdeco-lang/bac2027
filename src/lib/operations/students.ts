/**
 * BAC Mastery — Authoritative Student Service
 * PostgreSQL is the sole single source of truth for student access and profiles.
 * Eliminates all filesystem (.runtime/students.json, /tmp/bac_students.json) fake persistence.
 */

import { StudentOperationalSummary } from "./types";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export function isRealStudentId(id?: string): boolean {
  if (!id) return false;
  const lower = id.toLowerCase();
  if (
    lower.startsWith("test-") ||
    lower.startsWith("test_") ||
    lower.startsWith("mock-") ||
    lower.startsWith("mock_") ||
    lower.startsWith("dummy-") ||
    lower.startsWith("dummy_")
  ) {
    return false;
  }
  return true;
}

const memoryServerStudents = new Map<string, StudentOperationalSummary>();

/**
 * Loads cached student profiles from memory.
 * Does NOT access filesystem (.runtime or /tmp).
 */
export function loadServerStudentProfiles(): StudentOperationalSummary[] {
  // Filter out any mock/test entries from memory
  for (const [id] of Array.from(memoryServerStudents.entries())) {
    if (!isRealStudentId(id)) {
      memoryServerStudents.delete(id);
    }
  }

  const all = Array.from(memoryServerStudents.values());
  (globalThis as any).__BAC_STUDENTS_REGISTRY__ = all;
  return all;
}

/**
 * Saves a student profile into memory cache only (no filesystem writes).
 */
export function saveServerStudentProfile(student: Partial<StudentOperationalSummary> & { id: string }): StudentOperationalSummary {
  const existing = memoryServerStudents.get(student.id);

  // Protect PAID status if currently PAID or if subscription expires in the future
  const subExpiresAt = student.subscriptionExpiresAt || existing?.subscriptionExpiresAt;
  const isPaidActive = Boolean(
    (existing?.accessStatus === "PAID" || student.accessStatus === "PAID") &&
    subExpiresAt &&
    new Date(subExpiresAt).getTime() > Date.now()
  );

  let finalAccessStatus: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED" = "TRIAL";
  if (isPaidActive || student.accessStatus === "PAID" || (existing?.accessStatus === "PAID" && student.accessStatus !== "EXPIRED" && student.accessStatus !== "REJECTED")) {
    finalAccessStatus = "PAID";
  } else if (student.accessStatus) {
    finalAccessStatus = student.accessStatus;
  } else if (existing?.accessStatus) {
    finalAccessStatus = existing.accessStatus;
  }

  const updated: StudentOperationalSummary = {
    id: student.id,
    fullName: student.fullName || existing?.fullName || "طالب مسجل",
    email: student.email || existing?.email,
    studentPhone: student.studentPhone || existing?.studentPhone,
    parentPhone: student.parentPhone || existing?.parentPhone,
    streamId: student.streamId || existing?.streamId || "sciences_exp",
    wilayaName: student.wilayaName || existing?.wilayaName,
    communeName: student.communeName || existing?.communeName,
    accessStatus: finalAccessStatus,
    plan:
      finalAccessStatus === "PAID" && (!student.plan || student.plan === "PILOT_TRIAL")
        ? existing?.plan || "season"
        : student.plan || existing?.plan || "season",
    trialStartedAt: student.trialStartedAt || existing?.trialStartedAt || new Date().toISOString(),
    trialExpiresAt: student.trialExpiresAt || existing?.trialExpiresAt,
    remainingHours: student.remainingHours !== undefined ? student.remainingHours : existing?.remainingHours ?? 168,
    targetScore: student.targetScore !== undefined ? student.targetScore : existing?.targetScore ?? 16.0,
    completedMissionsCount: student.completedMissionsCount || existing?.completedMissionsCount || 0,
    demonstratedSkillsCount: student.demonstratedSkillsCount || existing?.demonstratedSkillsCount || 0,
    activeErrorsCount: student.activeErrorsCount || existing?.activeErrorsCount || 0,
    resolvedRetestsCount: student.resolvedRetestsCount || existing?.resolvedRetestsCount || 0,
    lastActiveAt: new Date().toISOString(),
    hasPendingPayment: student.hasPendingPayment !== undefined ? student.hasPendingPayment : existing?.hasPendingPayment ?? false,
    subscriptionStartedAt: student.subscriptionStartedAt || existing?.subscriptionStartedAt,
    subscriptionExpiresAt: subExpiresAt,
    rejectionReason: student.rejectionReason !== undefined ? student.rejectionReason : existing?.rejectionReason,
    createdAt: student.createdAt || existing?.createdAt || new Date().toISOString(),
    onboardingCompleted: student.onboardingCompleted !== undefined ? student.onboardingCompleted : existing?.onboardingCompleted ?? true,
    referral_code: student.referral_code || existing?.referral_code,
    referred_by_code: student.referred_by_code || existing?.referred_by_code,
    credit_balance_dzd: student.credit_balance_dzd !== undefined ? student.credit_balance_dzd : existing?.credit_balance_dzd ?? 0,
  };

  memoryServerStudents.set(student.id, updated);
  (globalThis as any).__BAC_STUDENTS_REGISTRY__ = Array.from(memoryServerStudents.values());

  return updated;
}

/**
 * Authoritatively fetches a student profile directly from Supabase PostgreSQL.
 */
export async function fetchAuthoritativeStudentProfile(
  studentId: string,
  token?: string | null
): Promise<StudentOperationalSummary | null> {
  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) return null;

  try {
    const { data: profile, error } = await client
      .from("student_profiles")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (error || !profile) return null;

    // Check active subscription in canonical subscriptions table
    const { data: activeSub } = await client
      .from("subscriptions")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "ACTIVE")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isPaid = Boolean(activeSub || profile.access_status === "PAID");
    const summary: StudentOperationalSummary = {
      id: profile.id,
      fullName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email || "طالب مسجل",
      email: profile.email,
      studentPhone: profile.student_phone,
      parentPhone: profile.parent_phone,
      streamId: profile.stream_id || "sciences_exp",
      wilayaName: profile.wilaya_name,
      communeName: profile.commune_name,
      accessStatus: isPaid ? "PAID" : (profile.access_status || "TRIAL"),
      plan: activeSub?.plan_id || profile.plan || "season",
      trialStartedAt: profile.trial_started_at || profile.created_at,
      trialExpiresAt: profile.trial_expires_at,
      remainingHours: profile.remaining_hours ?? 168,
      targetScore: profile.target_score ?? 16.0,
      completedMissionsCount: profile.completed_missions_count || 0,
      demonstratedSkillsCount: profile.demonstrated_skills_count || 0,
      activeErrorsCount: profile.active_errors_count || 0,
      resolvedRetestsCount: profile.resolved_retests_count || 0,
      lastActiveAt: profile.last_active_at || profile.updated_at,
      hasPendingPayment: profile.has_pending_payment || false,
      subscriptionStartedAt: activeSub?.started_at || profile.subscription_started_at,
      subscriptionExpiresAt: activeSub?.expires_at || profile.subscription_expires_at,
      rejectionReason: profile.rejection_reason,
      createdAt: profile.created_at,
      onboardingCompleted: profile.onboarding_completed ?? true,
      referral_code: profile.referral_code,
      referred_by_code: profile.referred_by_code,
      credit_balance_dzd: profile.credit_balance_dzd || 0,
    };

    memoryServerStudents.set(studentId, summary);
    return summary;
  } catch (err) {
    console.error("[fetchAuthoritativeStudentProfile] Error:", err);
    return null;
  }
}
