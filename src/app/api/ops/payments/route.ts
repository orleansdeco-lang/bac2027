import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getPaymentOrders, createPaymentOrder } from "@/lib/operations/payments";
import { PaymentOrderStatus } from "@/lib/operations/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/payments - List orders (Operator only)
 * POST /api/ops/payments - Create new payment order (Student or Operator)
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.userId) {
      return NextResponse.json(
        { success: false, error: "Missing required order payload (userId required)" },
        { status: 400 }
      );
    }

    // Verify caller if authenticated
    let effectiveUserId = body.userId;
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ") && isSupabaseConfigured && supabase) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) {
          effectiveUserId = user.id; // Force authenticated ID
        }
      } catch {
        // Continue with body.userId
      }
    }

    const order = await createPaymentOrder({
      userId: effectiveUserId,
      plan: body.plan,
      amount: body.amount,
      currency: "DZD",
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
      { success: false, error: "Failed to create order", details: err?.message },
      { status: 500 }
    );
  }
}
