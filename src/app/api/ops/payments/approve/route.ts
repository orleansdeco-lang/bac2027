import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator } from "@/lib/operations/auth";
import { approvePaymentOrder } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/approve
 * Approves a payment order and authoritatively elevates student access to PAID.
 * Strictly requires OPERATOR or OWNER role with finance access.
 * Content Reviewer is explicitly denied with 403.
 */
export async function POST(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized || !authRes.userId) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Finance operator access required" },
      { status: authRes.status }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId;
    const reason = body.reason || "Payment verified by operator";

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const result = await approvePaymentOrder(orderId, authRes.userId, reason);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Approval failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order approved and student access upgraded to PAID.",
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Approval exception", details: err?.message },
      { status: 500 }
    );
  }
}
