import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator } from "@/lib/operations/auth";
import { getVisitorAnalytics, getLiveVisitorsCount } from "@/lib/operations/visitors";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/analytics/visitors
 * Provides live visitor metrics, daily date breakdown, device ratios, and top visited routes.
 */
export async function GET(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Operator access required" },
      { status: authRes.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const limitDays = parseInt(searchParams.get("days") || "30", 10);

    const analytics = getVisitorAnalytics(limitDays);
    const liveCount = getLiveVisitorsCount(15);

    return NextResponse.json({
      success: true,
      liveCount,
      ...analytics,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve visitor analytics" },
      { status: 500 }
    );
  }
}
