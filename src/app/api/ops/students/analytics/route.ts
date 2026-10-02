import { NextResponse } from "next/server";
import { extractAndVerifyOperator, extractTokenFromCookies } from "@/lib/operations/auth";
import { getRegisteredStudentsAnalytics, AnalyticsPeriod } from "@/lib/operations/students-analytics";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/students/analytics
 * Returns authoritative database-backed analytics for registered students:
 * - 11 Core Student KPIs
 * - Daily Growth Time Series (7d, 30d, 90d)
 * - Daily Active Students Time Series (7d, 30d, 90d)
 * - Conversion Funnel (Registered -> Activated -> Active -> Trial -> Paid)
 * - Paginated & Searchable Student Directory with true lastActiveAt
 * 
 * Strictly requires OPERATOR or OWNER role.
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
    const periodParam = (url.searchParams.get("period") || "30d") as AnalyticsPeriod;
    const validPeriod: AnalyticsPeriod = ["today", "7d", "30d", "90d"].includes(periodParam)
      ? periodParam
      : "30d";

    const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
    const pageSize = parseInt(url.searchParams.get("limit") || "25", 10) || 25;
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const stream = url.searchParams.get("stream") || "all";
    const wilaya = url.searchParams.get("wilaya") || "all";

    const data = await getRegisteredStudentsAnalytics({
      period: validPeriod,
      page,
      pageSize,
      search,
      status,
      stream,
      wilaya,
      operatorId: operator.userId,
      token: operator.token || token,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error("[OPS_STUDENTS_ANALYTICS_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate registered students analytics", details: err?.message },
      { status: 500 }
    );
  }
}
