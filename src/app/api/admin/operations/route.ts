import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  getOperationsOverview,
  getLiveActiveSessions,
  getVisitorAnalytics,
  getTrafficAcquisition,
  getCampaignsList,
  getFunnelMetrics,
  getTrackingHealth,
} from "@/lib/admin/operations-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/operations
 * Unified endpoint for the SHATER Operations Center
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("platform.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const [overview, live, channels, campaigns, funnel, health, visitors] = await Promise.all([
      getOperationsOverview(),
      getLiveActiveSessions(5),
      getTrafficAcquisition(),
      getCampaignsList(),
      getFunnelMetrics(),
      getTrackingHealth(),
      getVisitorAnalytics(7),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview,
        live,
        channels,
        campaigns,
        funnel,
        health,
        visitors,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des données opérationnelles",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
