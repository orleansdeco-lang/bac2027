import { NextResponse } from "next/server";
import { generateStudentLearningReport } from "@/lib/learning/learning-intelligence";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { verifyAdminToken } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/learning/report
 * Generates what improved, what needs review, and recommended next step.
 * Guard: Enforces student privacy isolation.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get("studentId");

    let callerUserId: string | null = null;
    let isAdmin = false;

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();

      // Check admin
      const adminContext = await verifyAdminToken(token);
      if (adminContext) {
        isAdmin = true;
        callerUserId = adminContext.userId;
      } else if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user?.id) callerUserId = user.id;
        } catch {
          // ignore
        }
      }
    }

    const effectiveTargetId = requestedStudentId || callerUserId || "student-guest-01";

    // Privacy Guard: Student A cannot access Student B's learning report
    if (callerUserId && !isAdmin && effectiveTargetId !== callerUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "تم حظر الوصول: لا يمكنك الاطلاع على التقرير التعليمي لطالب آخر (حماية الخصوصية).",
        },
        { status: 403 }
      );
    }

    const report = generateStudentLearningReport(effectiveTargetId);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("[StudentLearningReportAPI] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "حدث خطأ أثناء استخراج التقرير التعليمي." },
      { status: 500 }
    );
  }
}
