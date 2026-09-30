import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDataQualityReport } from "@/lib/admin/analytics-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/data-quality
 * Detects missing subjects, streams, exercise skills, solutions,
 * orphan/duplicate records, unpublished items, and incomplete orientation records.
 * Guarded by 'platform.read' permission.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("platform.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const report = await getDataQualityReport(context.token);
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("[AdminDataQuality] Error generating quality report:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate data quality report", details: err?.message },
      { status: 500 }
    );
  }
}
