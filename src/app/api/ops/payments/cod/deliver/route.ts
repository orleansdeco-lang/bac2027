import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator } from "@/lib/operations/auth";
import { confirmCodDelivery } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/cod/deliver
 * Confirms COD delivery by courier/operator, collects cash, and activates student subscription.
 * Strictly requires OPERATOR or OWNER role.
 */
export async function POST(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized || !authRes.userId) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Operator role required" },
      { status: authRes.status }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "معرف الطلب (orderId) مطلوب" },
        { status: 400 }
      );
    }

    const result = await confirmCodDelivery(orderId, authRes.userId, notes);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "فشل تأكيد تسليم الطلب" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم تأكيد تسليم بطاقة شاطر وتفعيل اشتراك الطالب بنجاح.",
      order: result.order,
    });
  } catch (err: any) {
    console.error("[API] Error confirming COD delivery:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء تأكيد تسليم الطلب", details: err?.message },
      { status: 500 }
    );
  }
}
