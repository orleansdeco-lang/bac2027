import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { approvePaymentOrder } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/approve
 * Approves a payment order and authoritatively elevates student access to PAID.
 * Strictly requires OPERATOR or OWNER role.
 */
export async function POST(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
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

    const result = await approvePaymentOrder(orderId, operator.userId, reason);
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
