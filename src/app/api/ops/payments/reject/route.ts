import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { rejectPaymentOrder } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/reject
 * Rejects a payment order with an explicit mandatory reason.
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
    const reason = body.reason;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "Rejection reason is required." },
        { status: 400 }
      );
    }

    const result = await rejectPaymentOrder(orderId, operator.userId, reason.trim());
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Rejection failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order rejected and audit log recorded.",
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Rejection exception", details: err?.message },
      { status: 500 }
    );
  }
}
