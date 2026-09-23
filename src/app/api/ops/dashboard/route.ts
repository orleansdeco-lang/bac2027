import { NextResponse } from "next/server";
import { extractAndVerifyOperator, extractTokenFromCookies } from "@/lib/operations/auth";
import { getOperationsDashboardData } from "@/lib/operations/dashboard";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/dashboard
 * Central Operations Intelligence & Telemetry Funnel API:
 * - Real-time student distribution (PAID, TRIAL, EXPIRED)
 * - Pending queue with > 12h stale warning
 * - Multi-period revenue (Today, Week, Month, All-time)
 * - Engagement signals (Active students, lessons, exercises, study hours)
 * - Actionable alerts (expiring subscriptions, stale orders, dropoffs)
 * - Student journey telemetry conversion funnel
 * - Learning intelligence metrics
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
    const data = await getOperationsDashboardData(operator.userId, token);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load operations dashboard data", details: err?.message },
      { status: 500 }
    );
  }
}
