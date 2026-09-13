import { NextResponse } from "next/server";
import { getSubscriptionPlans } from "@/lib/operations/subscriptions";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscriptions/plans
 * Public endpoint to fetch available subscription plans with current dynamic pricing and status.
 */
export async function GET() {
  try {
    const plans = await getSubscriptionPlans();
    return NextResponse.json({ success: true, plans });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load subscription plans", details: err?.message },
      { status: 500 }
    );
  }
}
