import { NextResponse } from "next/server";
import { saveServerStudentProfile } from "@/lib/operations/students";
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

    // 1. Save to durable server registry for immediate /ops visibility
    const student = saveServerStudentProfile({
      id: body.id,
      fullName: body.fullName || `${body.firstName || ""} `.trim() || undefined,
      email: body.email,
      studentPhone: body.studentPhone,
      streamId: body.streamId,
      wilayaName: body.wilayaName,
      communeName: body.communeName,
      targetScore: body.targetScore,
      accessStatus: body.accessStatus,
      plan: body.plan,
      onboardingCompleted: body.onboardingCompleted !== undefined ? body.onboardingCompleted : true,
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

    return NextResponse.json({ success: true, student });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
