import { NextResponse } from "next/server";
import { extractAndVerifyOperator, extractTokenFromCookies } from "@/lib/operations/auth";
import { getConversionFunnelData, FunnelPeriod } from "@/lib/operations/conversion-funnel";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/analytics/funnel
 * Returns authoritative 8-stage conversion funnel and acquisition attribution data:
 * - VISITOR -> ENGAGED VISITOR -> SIGNUP STARTED -> REGISTERED STUDENT ->
 *   ACTIVATED STUDENT -> TRIAL STARTED -> PAYMENT SUBMITTED -> PAID STUDENT
 * - Headline conversion ratios (visitor->registration, registration->activation, activation->trial, trial->paid)
 * - Acquisition breakdown by standard sources (Meta, Google, TikTok, Telegram, Organic, Direct, Referral, Unknown)
 * - Campaign-level breakdown with revenue attribution
 * - Attribution completeness quality status (REAL / PARTIAL / UNAVAILABLE)
 * 
 * Strictly protected by Operations authorization.
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
    const periodParam = (url.searchParams.get("period") || "30d") as FunnelPeriod;
    const validPeriod: FunnelPeriod = ["today", "7d", "30d", "90d", "custom"].includes(periodParam)
      ? periodParam
      : "30d";

    const customStartDate = url.searchParams.get("startDate") || undefined;
    const customEndDate = url.searchParams.get("endDate") || undefined;

    const data = await getConversionFunnelData({
      period: validPeriod,
      customStartDate,
      customEndDate,
      operatorId: operator.userId,
      token: operator.token || token,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error("[OPS_CONVERSION_FUNNEL_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate conversion funnel data", details: err?.message },
      { status: 500 }
    );
  }
}
