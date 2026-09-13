import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator } from "@/lib/operations/auth";
import { rejectPaymentOrder } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/reject
 * Rejects a payment order with an explicit mandatory reason.
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
    const reason = body.reason;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "Rejection reason is mandatory." },
        { status: 400 }
      );
    }

    const result = await rejectPaymentOrder(orderId, authRes.userId, reason.trim());
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
