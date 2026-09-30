import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  generateDailyIntelligenceReport,
  logDailyReportAudit,
} from "@/lib/admin/daily-report-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ai/daily-report
 * Fetches the authoritative SHATER Daily Intelligence Report.
 * Authoritative Guard: Requires 'ai.use' or 'platform.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("platform.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const report = await generateDailyIntelligenceReport(context.token, false);
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("[DailyReportAPI] Error generating report:", err);
    return NextResponse.json(
      { success: false, error: "تعذر توليد تقرير الذكاء اليومي", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai/daily-report
 * Forces on-demand generation of a fresh SHATER Daily Intelligence Report,
 * and securely logs an audit entry without storing sensitive PII.
 * Authoritative Guard: Requires 'ai.use'.
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("ai.use", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const report = await generateDailyIntelligenceReport(context.token, true);

    // Audit report generation without PII
    await logDailyReportAudit(context.userId, context.role, report);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("[DailyReportAPI] Error refreshing report:", err);
    return NextResponse.json(
      { success: false, error: "تعذر تحديث تقرير الذكاء اليومي", details: err?.message },
      { status: 500 }
    );
  }
}
