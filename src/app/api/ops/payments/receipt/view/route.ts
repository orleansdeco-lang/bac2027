import { NextResponse } from "next/server";
import { extractAuthenticatedCaller } from "@/lib/operations/auth";
import { getReceiptViewUrl } from "@/lib/operations/receipts";
import { getPaymentOrderById } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/payments/receipt/view
 * Generates a short-lived view URL for an order's payment receipt.
 * Strict authorization:
 * - Operator/Owner: allowed to view any receipt.
 * - Content Reviewer: strictly denied (403).
 * - Student: allowed ONLY to view their own receipt (cross-user denied with 403).
 */
export async function GET(req: Request) {
  const caller = await extractAuthenticatedCaller(req);
  if (!caller?.userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required to view receipts" },
      { status: 401 }
    );
  }

  // Content Reviewers explicitly denied receipt viewing
  if (caller.isContentReviewer) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Content Reviewers are denied receipt access" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  let receiptPath = searchParams.get("path") || searchParams.get("receiptPath");

  if (!orderId && !receiptPath) {
    return NextResponse.json(
      { success: false, error: "orderId or path parameter is required" },
      { status: 400 }
    );
  }

  if (orderId && !receiptPath) {
    const order = await getPaymentOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Payment order not found" },
        { status: 404 }
      );
    }
    if (!order.receiptPath) {
      return NextResponse.json(
        { success: false, error: "Order does not have an attached receipt" },
        { status: 404 }
      );
    }
    receiptPath = order.receiptPath;
  }

  const viewRes = await getReceiptViewUrl(receiptPath!, {
    userId: caller.userId,
    role: caller.role || undefined,
  });

  if (!viewRes.success) {
    return NextResponse.json(
      { success: false, error: viewRes.error },
      { status: viewRes.status || 500 }
    );
  }

  return NextResponse.json({
    success: true,
    url: viewRes.url,
  });
}
