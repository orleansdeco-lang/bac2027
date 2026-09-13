import { NextRequest, NextResponse } from "next/server";
import { isServerOperator, isServerOwner } from "@/lib/operations/auth";
import { getPaymentOrders } from "@/lib/operations/payments";
import { getAuditLogs } from "@/lib/operations/audit";
import { getStoredTelemetryEvents } from "@/lib/operations/telemetry";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const callerUserId = request.headers.get("x-user-id");
  const isOperator =
    process.env.NODE_ENV !== "production" ||
    (callerUserId && ((await isServerOperator(callerUserId)) || (await isServerOwner(callerUserId))));

  if (!isOperator) {
    return NextResponse.json(
      { error: "Forbidden: Operator or Owner access required." },
      { status: 403 }
    );
  }

  const studentId = params.id;

  try {
    let studentProfile: any = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", studentId)
        .maybeSingle();

      if (!error && data) {
        studentProfile = data;
      }
    }

    if (!studentProfile) {
      // Baseline fallback for local testing
      studentProfile = {
        id: studentId,
        user_id: studentId,
        first_name: "أمين",
        last_name: "بلقاسم",
        email: "student@bacmastery.dz",
        student_phone: "0550123456",
        parent_phone: "0660123456",
        stream_id: "sciences_exp",
        wilaya_name: "الجزائر",
        commune_name: "الجزائر الوسطى",
        target_score: 17.5,
        education_level: "secondary",
        exam_type: "bac",
        energy_state: "normal",
        weekly_study_hours: 12,
        onboarding_completed: true,
        access_status: "TRIAL",
        plan: "PILOT_TRIAL",
        trial_started_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        trial_expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Fetch related payment orders
    const allOrders = await getPaymentOrders({ userId: studentId });

    // Fetch related audit logs
    const auditLogs = await getAuditLogs({ limit: 50 });
    const studentAuditLogs = auditLogs.filter(
      (a) => a.targetId === studentId || a.beforeState?.user_id === studentId || a.afterState?.user_id === studentId
    );

    // Fetch related telemetry
    const allTelemetry = getStoredTelemetryEvents(500);
    const studentTelemetry = allTelemetry
      .filter((t) => t.userId === studentId)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      profile: studentProfile,
      orders: allOrders,
      auditLogs: studentAuditLogs,
      telemetry: studentTelemetry,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
