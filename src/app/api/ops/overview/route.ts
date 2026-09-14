import { NextResponse } from "next/server";
import { extractAndVerifyOperator, extractTokenFromCookies } from "@/lib/operations/auth";
import { getOperationsOverviewKPIs } from "@/lib/operations/kpis";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/overview
 * Returns executive & operational KPIs for the Operations Cockpit.
 * Guarded: Requires OPERATOR or OWNER role.
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
    );
  }

  // Extract bearer token to authenticate Supabase queries under caller's credentials
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
    token = extractTokenFromCookies(cookieHeader);
  }

  try {
    const kpis = await getOperationsOverviewKPIs(operator.userId, token);
    return NextResponse.json({ success: true, kpis });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load overview KPIs", details: err?.message },
      { status: 500 }
    );
  }
}

