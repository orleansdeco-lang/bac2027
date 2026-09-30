import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getErrorStatistics } from "@/lib/admin/analytics-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/errors
 * Returns Error Intelligence for supported error types and documents missing data models.
 * Guarded by 'learning.read' permission.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("learning.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const errorStats = await getErrorStatistics(context.token);
    return NextResponse.json({
      success: true,
      errorStats,
    });
  } catch (err: any) {
    console.error("[AdminErrors] Error fetching error statistics:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load error statistics", details: err?.message },
      { status: 500 }
    );
  }
}
