import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminOrders, AdminOrdersFilter } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders
 * Returns all orders with KPI summary for Admin Control Center.
 * Authoritative Guard: Requires 'orders.read' permission.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("orders.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);

  const filters: AdminOrdersFilter = {
    search: searchParams.get("search") || undefined,
    orderStatus: searchParams.get("orderStatus") || undefined,
    deliveryStatus: searchParams.get("deliveryStatus") || undefined,
    paymentStatus: searchParams.get("paymentStatus") || undefined,
    plan: searchParams.get("plan") || undefined,
    wilaya: searchParams.get("wilaya") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 100,
    offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
  };

  try {
    const result = await getAdminOrders(filters, authResult.context.token);
    return NextResponse.json({
      success: true,
      summary: result.summary,
      orders: result.orders,
    });
  } catch (err: any) {
    console.error("[AdminOrdersAPI] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "تعذر تحميل بيانات الطلبات." },
      { status: 500 }
    );
  }
}
