import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getPlatformOverview, getDataQualityReport } from "@/lib/admin/analytics-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/overview
 * Returns verified platform overview metrics & data health score.
 * Shows only data that actually exists.
 * Authoritative Guard: Requires 'platform.read' or 'analytics.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("platform.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const [overview, dataQuality] = await Promise.all([
      getPlatformOverview(context.token),
      getDataQualityReport(context.token),
    ]);

    return NextResponse.json({
      success: true,
      overview,
      dataQuality: {
        healthScore: dataQuality.healthScore,
        totalIssuesCount: dataQuality.totalIssuesCount,
        criticalIssues: dataQuality.issues.filter((i) => i.severity === "critical").length,
      },
      caller: {
        role: context.role,
        isOwner: context.isOwner,
      },
    });
  } catch (err: any) {
    console.error("[AdminOverview] Error fetching overview:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load platform overview", details: err?.message },
      { status: 500 }
    );
  }
}
