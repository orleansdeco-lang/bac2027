import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getAllUnifiedOrders } from "@/lib/operations/orders-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/orders
 * Returns all live e-commerce delivery and subscription orders with summary breakdown.
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "غير مصرح: يلزم صلاحية مشغل النظام." },
      { status: 403 }
    );
  }

  try {
    const { orders, summary } = await getAllUnifiedOrders(operator.token);
    return NextResponse.json({
      success: true,
      orders,
      summary,
      totalCount: orders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل تحميل قائمة الطلبات" },
      { status: 500 }
    );
  }
}
