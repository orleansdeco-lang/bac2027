import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getPaymentOrders } from "@/lib/operations/payments";
import { getAuditLogs } from "@/lib/operations/audit";
import { getStoredTelemetryEvents } from "@/lib/operations/telemetry";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";

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
  if (!studentId) {
    return NextResponse.json(
      { success: false, error: "Student ID is required" },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  if (!token) {
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:ops_auth_token|sb-access-token)=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!isSupabaseConfigured || !client) {
    return NextResponse.json(
      { success: false, error: "Database configuration error: Supabase client unavailable." },
      { status: 500 }
    );
  }

  try {
    let studentProfile: any = null;

    // 1. Direct query from student_profiles
    const { data, error } = await client
      .from("student_profiles")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (!error && data) {
      studentProfile = data;
    } else {
      // Fallback to ops_get_student_dossier RPC if profile not directly found
      const { data: dossierData, error: dossierError } = await client.rpc(
        "ops_get_student_dossier",
        { p_student_id: studentId, p_operator_id: operator.userId }
      );
      if (!dossierError && dossierData) {
        studentProfile = dossierData;
      }
    }

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "Student profile not found" },
        { status: 404 }
      );
    }

    // 2. Fetch student's email from auth.users via admin client if not already present
    const admin = getAdminClient();
    if (admin) {
      try {
        const { data: authUser } = await admin.auth.admin.getUserById(studentId);
        if (authUser?.user?.email) {
          studentProfile.email = authUser.user.email;
        }
      } catch {
        // Fall back to profile raw_draft
        studentProfile.email =
          studentProfile.raw_draft?.student_email ||
          studentProfile.raw_draft?.email ||
          studentProfile.email;
      }
    }

    // 3. Fetch related subscriptions from canonical public.subscriptions table
    let studentSubscriptions: any[] = [];
    try {
      const { data: subData, error: subError } = await client
        .from("subscriptions")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (!subError && subData) {
        studentSubscriptions = subData;
      }
    } catch (subErr) {
      console.warn("[Student360] Subscriptions query warning:", subErr);
    }

    // 4. Fetch related payment orders
    const allOrders = await getPaymentOrders({ userId: studentId }, token);

    // 5. Fetch related audit logs
    const auditLogs = await getAuditLogs({ targetId: studentId, limit: 50 });
    const additionalLogs = await getAuditLogs({ actorUserId: studentId, limit: 20 });
    const combinedAuditLogs = [...auditLogs, ...additionalLogs].filter(
      (v, idx, arr) => arr.findIndex((x) => x.id === v.id) === idx
    );

    // 6. Fetch related telemetry
    const allTelemetry = getStoredTelemetryEvents(500);
    const studentTelemetry = allTelemetry
      .filter((t) => t.userId === studentId)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      profile: studentProfile,
      subscriptions: studentSubscriptions,
      orders: allOrders,
      auditLogs: combinedAuditLogs,
      telemetry: studentTelemetry,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

