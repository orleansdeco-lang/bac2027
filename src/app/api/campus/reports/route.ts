import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";
import { sanitizeSingleLine } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.authorized || !authResult.userId) {
      if (authResult.errorResponse) return authResult.errorResponse;
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (reason)" },
        { status: 400 }
      );
    }

    const {
      reportedUserId,
      reportedUserName,
      roomId,
      reason,
      details,
      targetType = "STUDENT",
      messageId,
      messageContent,
    } = body;

    if (targetType === "STUDENT" && !reportedUserId) {
      return NextResponse.json(
        { success: false, error: "Missing reportedUserId for student report" },
        { status: 400 }
      );
    }

    const cleanReason = sanitizeSingleLine(reason, 100);
    const cleanDetails = details ? sanitizeSingleLine(details, 500) : "";
    const cleanReportedName = reportedUserName ? sanitizeSingleLine(reportedUserName, 100) : "";
    const cleanMessageContent = messageContent ? sanitizeSingleLine(messageContent, 500) : null;
    const cleanTargetType = ["STUDENT", "MESSAGE", "ROOM"].includes(targetType) ? targetType : "STUDENT";

    const client = getAdminClient() || supabase;
    if (client && isSupabaseConfigured) {
      const { error } = await client.from("majlis_reports").insert({
        reporter_user_id: authResult.userId,
        reported_user_id: reportedUserId || null,
        reported_user_name: cleanReportedName || null,
        room_id: roomId || null,
        reason: cleanReason,
        details: cleanDetails,
        target_type: cleanTargetType,
        message_id: messageId || null,
        message_content: cleanMessageContent,
        status: "PENDING",
      });

      if (error) {
        console.error("[API Majlis Report] Error inserting:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم استلام البلاغ بنجاح وسيتم مراجعته فوراً من قبل مشرفي المنصة. شكراً لحرصك على بيئة دراسية محترمة.",
    });
  } catch (err) {
    console.error("[API Majlis Report] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.authorized || !authResult.profile) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Role check: admin, super_admin, or operator only
    const userRole = (authResult.profile as any)?.role || "student";
    if (!["admin", "super_admin", "operator"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const client = getAdminClient() || supabase;
    if (!client || !isSupabaseConfigured) {
      return NextResponse.json({ success: true, reports: [] });
    }

    const { data, error } = await client
      .from("majlis_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reports: data || [] });
  } catch (err) {
    console.error("[API Majlis Reports GET] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
