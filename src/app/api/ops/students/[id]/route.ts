import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getPaymentOrders } from "@/lib/operations/payments";
import { getAuditLogs } from "@/lib/operations/audit";
import { getStoredTelemetryEvents } from "@/lib/operations/telemetry";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const operator = await extractAndVerifyOperator(request);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
    );
  }

  const studentId = params.id;

  try {
    let studentProfile: any = null;

    if (isSupabaseConfigured && supabase) {
      // 1. Try safe operator RPC
      const { data: dossierData, error: dossierError } = await supabase.rpc(
        "ops_get_student_dossier",
        { p_student_id: studentId, p_operator_id: operator.userId }
      );

      if (!dossierError && dossierData) {
        studentProfile = dossierData;
      } else {
        // Direct query fallback
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("id", studentId)
          .maybeSingle();

        if (!error && data) {
          studentProfile = data;
        }
      }
    }

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "Student profile not found" },
        { status: 404 }
      );
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
