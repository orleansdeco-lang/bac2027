import { NextResponse } from "next/server";
import { extractAndVerifyOperator, extractTokenFromCookies } from "@/lib/operations/auth";
import { getVisitorsAnalytics, VisitorAnalyticsPeriod } from "@/lib/operations/visitors-analytics";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/analytics/visitors
 * Provides authoritative database-backed visitors analytics:
 * - 6 Core Visitors Overview KPIs
 * - Live Activity detection (or explicit indicator if unsupported)
 * - Visitors Trend (unique visitors, sessions, new visitors, returning visitors)
 * - Traffic Sources breakdown
 * - Top Pages by views
 * - Devices breakdown (mobile, desktop, tablet, unknown)
 * - Returning vs New visitor breakdown
 * - Entry Pages
 * - Exit / Last Pages
 * - Coarse Geography (only when reliable data exists)
 * - Recent Visitor Activity (anonymized, zero PII)
 * 
 * Protected by Operations authorization.
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
    );
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
    token = extractTokenFromCookies(cookieHeader);
  }

  try {
    const url = new URL(req.url);
    const periodParam = (url.searchParams.get("period") || url.searchParams.get("days") || "30d") as string;
    
    // Normalize period string
    let validPeriod: VisitorAnalyticsPeriod = "30d";
    if (periodParam === "today" || periodParam === "1") validPeriod = "today";
    else if (periodParam === "7d" || periodParam === "7") validPeriod = "7d";
    else if (periodParam === "90d" || periodParam === "90") validPeriod = "90d";
    else validPeriod = "30d";

    const data = await getVisitorsAnalytics({
      period: validPeriod,
      operatorId: operator.userId,
      token: operator.token || token,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error("[OPS_VISITORS_ANALYTICS_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve visitor analytics", details: err?.message },
      { status: 500 }
    );
  }
}
