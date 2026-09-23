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
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "Payment verified by operator";

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(orderId)) {
      return NextResponse.json(
        { success: false, error: `Invalid order ID format: "${orderId}". Order ID must be a standard UUID.` },
        { status: 400 }
      );
    }

    const result = await approvePaymentOrder(orderId, authRes.userId, reason, authRes.token);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Approval failed in database." },
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
