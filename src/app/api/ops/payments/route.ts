import { NextResponse } from "next/server";
import {
  extractAndVerifyFinanceOperator,
  extractAuthenticatedUserId,
  isServerOperator,
} from "@/lib/operations/auth";
import {
  getPaymentOrders,
  createPaymentOrder,
  AUTHORITATIVE_PLANS,
} from "@/lib/operations/payments";
import { PaymentOrderStatus } from "@/lib/operations/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/payments - List orders (Operator/Owner with Finance access only)
 * Strictly blocks Content Reviewer and normal students with 403.
 */
export async function GET(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Finance operator access required" },
      { status: authRes.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as PaymentOrderStatus | null;
  const userId = searchParams.get("userId") || undefined;

  try {
    const orders = await getPaymentOrders({
      status: status || undefined,
      userId,
      limit: 100,
    });
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/payments - Create new payment order
 * Strictly enforces server-authoritative price catalog, currency, and verified user identity.
 * Rejects price tampering, currency forgery, status elevation, and user spoofing.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Missing required order payload" },
        { status: 400 }
      );
    }

    // 1. Authenticate caller strictly
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to create a payment order" },
        { status: 401 }
      );
    }

    // 2. Prevent User ID Spoofing: student cannot create orders for another user
    let effectiveUserId = callerId;
    if (body.userId && body.userId !== callerId) {
      const isOperator = await isServerOperator(callerId);
      if (!isOperator) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: User ID spoofing attempt detected. You cannot create an order for another student.",
          },
          { status: 403 }
        );
      }
      effectiveUserId = body.userId;
    }

    // 3. Plan validation
    const requestedPlan = body.plan || "bac_season_pass_pilot";
    const catalogPlan = AUTHORITATIVE_PLANS[requestedPlan];
    if (!catalogPlan) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown or unsupported plan: '${body.plan}'. Valid plans: ${Object.keys(AUTHORITATIVE_PLANS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 4. Anti-Tamper: Price manipulation check
    if (body.amount !== undefined && Number(body.amount) !== catalogPlan.priceDZD) {
      return NextResponse.json(
        {
          success: false,
          error: `Price manipulation detected. Plan '${requestedPlan}' price is ${catalogPlan.priceDZD} DZD, received ${body.amount}.`,
        },
        { status: 400 }
      );
    }

    // 5. Anti-Tamper: Currency manipulation check
    if (body.currency !== undefined && body.currency !== catalogPlan.currency) {
      return NextResponse.json(
        {
          success: false,
          error: `Currency manipulation detected. Currency must be '${catalogPlan.currency}', received '${body.currency}'.`,
        },
        { status: 400 }
      );
    }

    // 6. Anti-Tamper: Status elevation check
    if (body.status !== undefined && body.status !== "PENDING" && body.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: `Status manipulation detected. Client cannot initialize order with status '${body.status}'. Initial status must be 'PENDING'.`,
        },
        { status: 400 }
      );
    }

    // Create authoritative order
    const order = await createPaymentOrder({
      userId: effectiveUserId,
      plan: catalogPlan.id,
      amount: catalogPlan.priceDZD,
      currency: catalogPlan.currency,
      paymentMethod: body.paymentMethod || "baridimob",
      receiptPath: body.receiptPath,
      notes: body.notes,
      studentEmail: body.studentEmail,
      studentName: body.studentName,
      studentPhone: body.studentPhone,
      streamId: body.streamId,
      wilayaName: body.wilayaName,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create payment order", details: err?.message },
      { status: 500 }
    );
  }
}
