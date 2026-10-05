import { NextResponse } from "next/server";
import { extractAuthenticatedUserId, isServerOperator } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { fetchAuthoritativeStudentProfile, saveServerStudentProfile } from "@/lib/operations/students";
import { recordAuthoritativeBusinessEvent } from "@/lib/operations/telemetry";
import { toCanonicalAlgerianPhone, normalizeAlgerianPhone } from "@/domain/administrative/phone-validation";

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

    const trialStartedAt = existingProfile?.trial_started_at || existingProfile?.created_at || new Date().toISOString();
    const trialExpiresAt = existingProfile?.trial_expires_at
      ? new Date(existingProfile.trial_expires_at).getTime()
      : new Date(trialStartedAt).getTime() + 3 * 24 * 60 * 60 * 1000;
    const isTrialExpired = Date.now() > trialExpiresAt;

    if (isPaidActive) {
      effectiveAccessStatus = "PAID";
    } else if (latestOrder && latestOrder.status === "REJECTED") {
      effectiveAccessStatus = "REJECTED";
      rejectionReason = latestOrder.rejection_reason || "تم رفض وصل التحويل";
    } else if (isTrialExpired) {
      effectiveAccessStatus = "EXPIRED";
      if (existingProfile?.access_status === "PAID") {
        recordAuthoritativeBusinessEvent({
          eventName: "subscription_expired",
          userId: targetStudentId,
          metadata: {
            previous_plan: effectivePlan,
            expired_at: subExpiresAt,
          },
          pagePath: "/api/student/sync",
        }).catch((e) => console.warn("[Sync] subscription_expired event error:", e));
      }
    } else {
      effectiveAccessStatus = "TRIAL";
    }

    // 4. Update demographic profile fields in Supabase PostgreSQL (access_status is authoritative)
    const resolvedStreamId = body.streamId || existingProfile?.stream_id || "sciences_exp";
    const rawTargetScore = Number(body.targetScore);
    const resolvedTargetScore = !isNaN(rawTargetScore) && rawTargetScore >= 10 && rawTargetScore <= 20
      ? rawTargetScore
      : (Number(existingProfile?.target_score) || 16.0);

    const updatePayload: Record<string, any> = {
      id: targetStudentId,
      user_id: targetStudentId,
      education_level: body.educationLevel || existingProfile?.education_level || "secondary",
      exam_type: body.examType || existingProfile?.exam_type || "bac",
      stream_id: resolvedStreamId,
      target_score: resolvedTargetScore,
      updated_at: new Date().toISOString(),
      access_status: effectiveAccessStatus,
      plan: effectivePlan,
    };

    if (body.firstName !== undefined) updatePayload.first_name = body.firstName;
    if (body.lastName !== undefined) updatePayload.last_name = body.lastName;

    if (body.studentPhone !== undefined && body.studentPhone.trim() !== "") {
      const canonicalPhone = toCanonicalAlgerianPhone(body.studentPhone);
      const localPhone = normalizeAlgerianPhone(body.studentPhone);

      // If the student changes their phone number, automatically revoke verification
      const isPhoneChanged = existingProfile && (
        (existingProfile.canonical_phone && existingProfile.canonical_phone !== canonicalPhone) ||
        (existingProfile.student_phone && existingProfile.student_phone !== localPhone)
      );

      if (isPhoneChanged) {
        updatePayload.phone_verified = false;
        updatePayload.phone_verified_at = null;
      }

      const { data: dupPhone } = await client
        .from("student_profiles")
        .select("id")
        .neq("id", targetStudentId)
        .or(`student_phone.eq.${localPhone},student_phone.eq.${canonicalPhone},canonical_phone.eq.${canonicalPhone}`)
        .limit(1)
        .maybeSingle();

      if (dupPhone) {
        return NextResponse.json(
          {
            success: false,
            error: "رقم الهاتف مسجل بالفعل في حساب طالب آخر. لا يمكن استخدام نفس الرقم في أكثر من حساب.",
          },
          { status: 409 }
        );
      }

      updatePayload.student_phone = localPhone;
      updatePayload.canonical_phone = canonicalPhone;
    }

    if (body.parentPhone !== undefined) updatePayload.parent_phone = body.parentPhone;
    if (body.studentStatus !== undefined) updatePayload.student_status = body.studentStatus;
    if (body.wilayaCode !== undefined) updatePayload.wilaya_code = body.wilayaCode;
    if (body.wilayaName !== undefined) updatePayload.wilaya_name = body.wilayaName;
    if (body.communeCode !== undefined) updatePayload.commune_code = body.communeCode;
    if (body.communeName !== undefined) updatePayload.commune_name = body.communeName;
    if (body.schoolName !== undefined) updatePayload.school_name = body.schoolName;
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

/**
 * GET /api/student/sync
 * Securely retrieves the authenticated student's authoritative profile, subscriptions, and latest order.
 * Uses PostgreSQL as the single authoritative source of truth, bypassing browser RLS issues.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:ops_auth_token|sb-access-token)=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
    }

    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to fetch student profile" },
        { status: 401 }
      );
    }

    const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json(
        { success: false, error: "Database service unavailable" },
        { status: 503 }
      );
    }

    // Query profile, subscription, and latest payment order in parallel
    const [profileRes, subRes, orderRes] = await Promise.all([
      client
        .from("student_profiles")
        .select("*")
        .eq("id", callerId)
        .maybeSingle(),
      client
        .from("subscriptions")
        .select("*")
        .eq("student_id", callerId)
        .eq("status", "ACTIVE")
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("payment_orders")
        .select("*")
        .eq("user_id", callerId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const rawProfile = profileRes.data;
    const activeSub = subRes.data;
    const latestOrder = orderRes.data;

    // Check if user has an active paid subscription
    const isPaidActive = Boolean(
      activeSub ||
      (rawProfile?.access_status === "PAID" &&
        rawProfile?.subscription_expires_at &&
        new Date(rawProfile.subscription_expires_at).getTime() > Date.now())
    );

    const now = Date.now();
    const trialStartedAt = rawProfile?.trial_started_at || rawProfile?.created_at || new Date().toISOString();
    const trialExpiresAt = rawProfile?.trial_expires_at
      ? new Date(rawProfile.trial_expires_at).toISOString()
      : new Date(new Date(trialStartedAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const isTrialExpired = now > new Date(trialExpiresAt).getTime();

    let accessStatus: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED" = "TRIAL";
    if (isPaidActive) {
      accessStatus = "PAID";
    } else if (latestOrder && latestOrder.status === "REJECTED") {
      accessStatus = "REJECTED";
    } else if (isTrialExpired) {
      accessStatus = "EXPIRED";
    } else {
      accessStatus = "TRIAL";
    }

    // Build synthesized strategic profile for the frontend
    const profile = {
      id: callerId,
      educationLevel: rawProfile?.education_level || "secondary",
      examType: (rawProfile?.exam_type || "bac").toUpperCase(),
      streamId: rawProfile?.stream_id || "sciences_exp",
      targetScore: Number(rawProfile?.target_score) || 16.0,
      subjectEstimates: rawProfile?.raw_draft?.subjectEstimates || {},
      availableTime: rawProfile?.raw_draft?.availableTime || "12_to_18",
      studyEnergy: rawProfile?.energy_state || rawProfile?.raw_draft?.studyEnergy || "normal",
      firstName: rawProfile?.first_name || rawProfile?.raw_draft?.firstName || "",
      lastName: rawProfile?.last_name || rawProfile?.raw_draft?.lastName || "",
      fullName: [rawProfile?.first_name, rawProfile?.last_name].filter(Boolean).join(" ").trim() || rawProfile?.email || "طالب شاطر",
      email: rawProfile?.email,
      studentPhone: rawProfile?.student_phone || rawProfile?.raw_draft?.studentPhone || "",
      parentPhone: rawProfile?.parent_phone || rawProfile?.raw_draft?.parentPhone || "",
      studentStatus: rawProfile?.student_status || rawProfile?.raw_draft?.studentStatus || "schooled",
      schoolName: rawProfile?.school_name !== undefined ? rawProfile?.school_name : rawProfile?.raw_draft?.schoolName,
      wilayaCode: rawProfile?.wilaya_code || rawProfile?.raw_draft?.wilayaCode || "",
      wilayaName: rawProfile?.wilaya_name || rawProfile?.raw_draft?.wilayaName || "",
      communeCode: rawProfile?.commune_code || rawProfile?.raw_draft?.communeCode || "",
      communeName: rawProfile?.commune_name || rawProfile?.raw_draft?.communeName || "",
      accessStatus,
      access_status: accessStatus,
      plan: activeSub?.plan_id || rawProfile?.plan || "season",
      trialStartedAt,
      trialExpiresAt,
      subscriptionStartedAt: activeSub?.started_at || rawProfile?.subscription_started_at,
      subscriptionExpiresAt: activeSub?.expires_at || rawProfile?.subscription_expires_at,
      rejectionReason: latestOrder?.status === "REJECTED" ? latestOrder.rejection_reason : rawProfile?.rejection_reason,
      createdAt: rawProfile?.created_at || new Date().toISOString(),
      updatedAt: rawProfile?.updated_at || new Date().toISOString(),
      phoneVerified: Boolean(rawProfile?.phone_verified),
    };

    return NextResponse.json({
      success: true,
      profile,
      activeSubscription: activeSub || null,
      latestOrder: latestOrder || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

