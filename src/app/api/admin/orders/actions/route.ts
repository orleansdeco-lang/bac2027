import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { executeAdminOrderAction } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/actions
 * Executes state transitions and administrative actions on orders server-side.
 * Authoritative Guard: Requires 'orders.manage' permission.
 * 
 * Supported Actions:
 * - CONFIRM_ORDER
 * - MARK_PROCESSING
 * - MARK_SHIPPED
 * - ADD_TRACKING_NUMBER
 * - MARK_DELIVERED
 * - MARK_RETURNED
 * - MARK_COD_PAID
 * - ACTIVATE_SUBSCRIPTION
 * - CANCEL_ORDER
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("orders.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.orderId || !body.action) {
      return NextResponse.json(
        { success: false, error: "معرف الطلب (orderId) ونوع الإجراء (action) مطلوبان." },
        { status: 400 }
      );
    }

    const { orderId, action, params = {} } = body;

    const result = await executeAdminOrderAction(
      orderId,
      action,
      {
        userId: authResult.context.userId,
        role: authResult.context.role,
      },
      params,
      authResult.context.token
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[AdminOrdersActionAPI] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "فشل تنفيذ الإجراء الإداري." },
      { status: 500 }
    );
  }
}
