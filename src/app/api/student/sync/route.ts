import { NextResponse } from "next/server";
import { extractAuthenticatedUserId, isServerOperator } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { fetchAuthoritativeStudentProfile, saveServerStudentProfile } from "@/lib/operations/students";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/sync
 * Securely synchronizes a student's demographic profile to Supabase PostgreSQL.
 * Strictly prevents IDOR: caller must be authenticated and match target id (or have OPERATOR role).
 * Access status is strictly authoritatively derived from PostgreSQL (subscriptions / payment_orders)
 * and cannot be elevated or manipulated by client payloads.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json({ success: false, error: "Student id is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:ops_auth_token|sb-access-token)=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
    }

    // 1. Strict Authentication & IDOR Guard
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to synchronize student profile" },
        { status: 401 }
      );
    }

    if (body.id !== callerId) {
      const isOperator = await isServerOperator(callerId, token);
      if (!isOperator) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You cannot modify or synchronize another student's profile." },
          { status: 403 }
        );
      }
    }

    const targetStudentId = body.id;
    const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;

    if (!isSupabaseConfigured || !client) {
      return NextResponse.json(
        { success: false, error: "Database service unavailable" },
        { status: 503 }
      );
    }

    // 2. Authoritatively fetch student's active subscriptions and payment orders from PostgreSQL
    const [subRes, orderRes, profileRes] = await Promise.all([
      client
        .from("subscriptions")
        .select("*")
        .eq("student_id", targetStudentId)
        .eq("status", "ACTIVE")
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("payment_orders")
        .select("*")
        .eq("user_id", targetStudentId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("student_profiles")
        .select("*")
        .eq("id", targetStudentId)
        .maybeSingle(),
    ]);

    const activeSub = subRes.data;
    const latestOrder = orderRes.data;
    const existingProfile = profileRes.data;

    // 3. Determine authoritative access status (client cannot self-elevate)
    const isPaidActive = Boolean(
      activeSub ||
      (existingProfile?.access_status === "PAID" &&
        existingProfile?.subscription_expires_at &&
        new Date(existingProfile.subscription_expires_at).getTime() > Date.now())
    );

    let effectiveAccessStatus: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED" = "TRIAL";
    let effectivePlan = activeSub?.plan_id || existingProfile?.plan || "season";
    let subStartedAt = activeSub?.started_at || existingProfile?.subscription_started_at;
    let subExpiresAt = activeSub?.expires_at || existingProfile?.subscription_expires_at;
    let rejectionReason = existingProfile?.rejection_reason;

    const profileCreated = existingProfile?.created_at || existingProfile?.trial_started_at || new Date().toISOString();
    const isTrialExpired = Date.now() - new Date(profileCreated).getTime() > 7 * 24 * 60 * 60 * 1000;

    if (isPaidActive) {
      effectiveAccessStatus = "PAID";
    } else if (latestOrder && latestOrder.status === "REJECTED") {
      effectiveAccessStatus = "REJECTED";
      rejectionReason = latestOrder.rejection_reason || "تم رفض وصل التحويل";
    } else if (isTrialExpired) {
      effectiveAccessStatus = "EXPIRED";
    } else {
      effectiveAccessStatus = "TRIAL";
    }

    // 4. Update demographic profile fields in Supabase PostgreSQL (access_status is authoritative)
    const updatePayload: Record<string, any> = {
      id: targetStudentId,
      user_id: targetStudentId,
      updated_at: new Date().toISOString(),
      access_status: effectiveAccessStatus,
      plan: effectivePlan,
    };

    if (body.firstName !== undefined) updatePayload.first_name = body.firstName;
    if (body.lastName !== undefined) updatePayload.last_name = body.lastName;
    if (body.studentPhone !== undefined) updatePayload.student_phone = body.studentPhone;
    if (body.parentPhone !== undefined) updatePayload.parent_phone = body.parentPhone;
    if (body.studentStatus !== undefined) updatePayload.student_status = body.studentStatus;
    if (body.streamId !== undefined) updatePayload.stream_id = body.streamId;
    if (body.wilayaCode !== undefined) updatePayload.wilaya_code = body.wilayaCode;
    if (body.wilayaName !== undefined) updatePayload.wilaya_name = body.wilayaName;
    if (body.communeCode !== undefined) updatePayload.commune_code = body.communeCode;
    if (body.communeName !== undefined) updatePayload.commune_name = body.communeName;
    if (body.schoolName !== undefined) updatePayload.school_name = body.schoolName;
    if (body.targetScore !== undefined) updatePayload.target_score = body.targetScore;
    if (body.registrationCompletedAt) updatePayload.registration_completed_at = body.registrationCompletedAt;

    const { error: upsertError } = await client
      .from("student_profiles")
      .upsert(updatePayload, { onConflict: "id" });

    if (upsertError) {
      console.error("[/api/student/sync] Upsert error in PostgreSQL:", upsertError);
    }

    // 5. Fetch updated authoritative student summary
    const student = await fetchAuthoritativeStudentProfile(targetStudentId, token);

    // Update in-memory cache for any immediate local read
    if (student) {
      saveServerStudentProfile(student);
    }

    return NextResponse.json({
      success: true,
      student,
      latestOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
