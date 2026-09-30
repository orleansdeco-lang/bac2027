import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getOperationsOverviewKPIs } from "@/lib/operations/kpis";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/overview
 * Returns executive and operational KPIs for the SHATER Control Center.
 * Authoritative Guard: Requires 'platform.read' or 'analytics.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("platform.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const kpis = await getOperationsOverviewKPIs(context.userId, context.token);
    return NextResponse.json({
      success: true,
      kpis,
      caller: {
        role: context.role,
        isOwner: context.isOwner,
      },
    });
  } catch (err: any) {
    console.error("[AdminOverview] Error fetching KPIs:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load overview KPIs", details: err?.message },
      { status: 500 }
    );
  }
}
