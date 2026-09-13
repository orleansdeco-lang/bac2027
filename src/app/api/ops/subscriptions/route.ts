import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator, extractAuthenticatedUserId } from "@/lib/operations/auth";
import {
  getSubscriptionPlans,
  getSubscriptionAlerts,
  updateSubscriptionPlan,
} from "@/lib/operations/subscriptions";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/subscriptions
 * Retrieves all subscription plans and live subscription alerts.
 * Operator / Owner only. Content Reviewer blocked with 403.
 */
export async function GET(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Finance operator access required" },
      { status: authRes.status }
    );
  }

  try {
    const [plans, alerts] = await Promise.all([
      getSubscriptionPlans(),
      getSubscriptionAlerts(),
    ]);

    return NextResponse.json({ success: true, plans, alerts });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription plans and alerts", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/subscriptions
 * Updates a subscription plan's price, duration, or open/closed state.
 * Strictly requires OWNER or OPERATOR with finance privileges.
 * Content Reviewer is blocked with 403 Forbidden.
 */
export async function POST(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Finance operator access required" },
      { status: authRes.status }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.planId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'planId' in payload" },
        { status: 400 }
      );
    }

    const { planId, price_dzd, duration_months, active, name } = body;

    const result = await updateSubscriptionPlan(authRes.userId!, planId, {
      price_dzd,
      duration_months,
      active,
      name,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, plan: result.plan });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update subscription plan", details: err?.message },
      { status: 500 }
    );
  }
}
