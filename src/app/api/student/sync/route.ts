import { NextResponse } from "next/server";
import { saveServerStudentProfile, loadServerStudentProfiles } from "@/lib/operations/students";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/sync
 * Securely synchronizes a student's profile to server storage and Supabase.
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

    // 1. Authoritative check: Search existing server profiles
    const serverProfiles = loadServerStudentProfiles();
    const existingServerProfile = serverProfiles.find(
      (s) =>
        s.id === body.id ||
        (body.email && s.email && s.email.toLowerCase() === body.email.toLowerCase()) ||
        (body.studentPhone && s.studentPhone && s.studentPhone === body.studentPhone)
    );

    // 2. Authoritative check: Look up all payment orders matching id, email, or phone
    const { getPaymentOrders } = await import("@/lib/operations/payments");
    const allOrders = await getPaymentOrders({ limit: 200 }, token);
    const userOrders = allOrders.filter(
      (o) =>
        o.userId === body.id ||
        (body.email && o.studentEmail && o.studentEmail.toLowerCase() === body.email.toLowerCase()) ||
        (body.studentPhone && o.studentPhone && o.studentPhone === body.studentPhone)
    );
    const approvedOrder = userOrders.find((o) => o.status === "APPROVED");
    const latestOrder = userOrders[0];

    // Check if student has valid active paid subscription
    const existingSubExpires = existingServerProfile?.subscriptionExpiresAt;
    const isExistingPaidActive = Boolean(
      existingServerProfile?.accessStatus === "PAID" &&
      existingSubExpires &&
      new Date(existingSubExpires).getTime() > Date.now()
    );

    // Determine authoritative paid status strictly from verified database records
    const isAuthoritativePaid = Boolean(
      approvedOrder ||
      isExistingPaidActive
    );

    let effectiveAccessStatus: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED" = "TRIAL";
    let effectivePlan = approvedOrder?.plan || existingServerProfile?.plan || body.plan || "season";
    let subStartedAt = approvedOrder?.reviewedAt || existingServerProfile?.subscriptionStartedAt;
    let subExpiresAt = existingSubExpires;
    let rejectionReason = existingServerProfile?.rejectionReason;

    const profileCreated = existingServerProfile?.createdAt || existingServerProfile?.trialStartedAt || body.createdAt || new Date().toISOString();
    const isTrialExpired = Date.now() - new Date(profileCreated).getTime() > 7 * 24 * 60 * 60 * 1000;

    if (isAuthoritativePaid) {
      effectiveAccessStatus = "PAID";
      if (approvedOrder) {
        effectivePlan = approvedOrder.plan || "season";
        subStartedAt = approvedOrder.reviewedAt || approvedOrder.updatedAt || approvedOrder.submittedAt || new Date().toISOString();
        const durationMonths = effectivePlan === "monthly" ? 1 : 10;
        subExpiresAt = new Date(new Date(subStartedAt).getTime() + durationMonths * 30 * 86400000).toISOString();
      }
    } else if (latestOrder && latestOrder.status === "REJECTED") {
      effectiveAccessStatus = "REJECTED";
      rejectionReason = latestOrder.rejectionReason || "تم رفض وصل التحويل";
    } else if (isTrialExpired) {
      effectiveAccessStatus = "EXPIRED";
    } else {
      effectiveAccessStatus = "TRIAL";
    }

    // 3. Save to durable server registry for immediate /ops visibility
    const student = saveServerStudentProfile({
      id: body.id,
      fullName: body.fullName || `${body.firstName || ""} ${body.lastName || ""}`.trim() || existingServerProfile?.fullName || undefined,
      email: body.email || existingServerProfile?.email,
      studentPhone: body.studentPhone || existingServerProfile?.studentPhone,
      parentPhone: body.parentPhone || existingServerProfile?.parentPhone,
      streamId: body.streamId || existingServerProfile?.streamId,
      wilayaName: body.wilayaName || existingServerProfile?.wilayaName,
      communeName: body.communeName || existingServerProfile?.communeName,
      targetScore: body.targetScore ?? existingServerProfile?.targetScore,
      accessStatus: effectiveAccessStatus,
      plan: effectivePlan,
      subscriptionStartedAt: subStartedAt,
      subscriptionExpiresAt: subExpiresAt,
      rejectionReason,
      onboardingCompleted: body.onboardingCompleted !== undefined ? body.onboardingCompleted : (existingServerProfile?.onboardingCompleted ?? true),
    });

    // 2. Also attempt Supabase upsert if configured and client available
    const client = token ? createAuthenticatedSupabaseClient(token) : supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client.from("student_profiles").upsert(
          {
            id: body.id,
            user_id: body.id,
            first_name: body.firstName,
            last_name: body.lastName,
            student_phone: body.studentPhone,
            parent_phone: body.parentPhone,
            student_status: body.studentStatus,
            stream_id: body.streamId || "sciences_exp",
            wilaya_code: body.wilayaCode,
            wilaya_name: body.wilayaName,
            commune_code: body.communeCode,
            commune_name: body.communeName,
            school_name: body.schoolName,
            target_score: body.targetScore || 16.0,
            registration_completed_at: body.registrationCompletedAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch {
        // Non-blocking fallback
      }
    }

    return NextResponse.json({ success: true, student, latestOrder });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
