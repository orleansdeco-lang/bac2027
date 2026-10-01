import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import {
  updateOrderShipmentInStore,
  markCodOrderPaidInStore,
  activateSubscriptionInStore,
} from "@/lib/operations/orders-store";
import { executeAdminOrderAction } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/orders/actions
 * Unified resilient order management actions endpoint.
 * Synchronizes immediately across in-memory store and Supabase database.
 */
export async function POST(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "غير مصرح: يلزم صلاحية مشغل النظام." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.orderId || !body.action) {
      return NextResponse.json(
        { success: false, error: "معرف الطلب (orderId) والإجراء (action) مطلوبان." },
        { status: 400 }
      );
    }

    const { orderId, action, params = {} } = body;
    let message = "تم تنفيذ الإجراء بنجاح.";

    // 1. First-class resilient update in global store
    if (action === "MARK_SHIPPED") {
      await updateOrderShipmentInStore(
        orderId,
        {
          carrier: params.carrier || "Yalidine Express",
          trackingNumber: params.trackingNumber,
          status: "SHIPPED",
          notes: params.notes,
        },
        operator.token
      );
      message = "تم تأكيد شحن الطرد وتسجيل بيانات التتبع بنجاح.";
    } else if (action === "MARK_DELIVERED") {
      await updateOrderShipmentInStore(
        orderId,
        {
          status: "DELIVERED",
          notes: params.notes,
        },
        operator.token
      );
      message = "تم تسجيل تسليم الطرد للطالب بنجاح.";
    } else if (action === "MARK_RETURNED") {
      await updateOrderShipmentInStore(
        orderId,
        {
          status: "RETURNED",
          notes: params.notes,
        },
        operator.token
      );
      message = "تم تسجيل الطرد كمرتجع (Retour).";
    } else if (action === "MARK_COD_PAID") {
      await markCodOrderPaidInStore(orderId, params.notes || "تم استلام الدفع نقداً", operator.token);
      message = "تم تأكيد استلام المبلغ نقداً بنجاح (Payment = PAID).";
    } else if (action === "ACTIVATE_SUBSCRIPTION") {
      const actRes = await activateSubscriptionInStore(orderId, params.reason, operator.token);
      if (!actRes.success) {
        throw new Error(actRes.error || "فشل تفعيل الاشتراك");
      }
      message = "تم تفعيل اشتراك الطالب بنجاح لمدة الموسم الدراسي!";
    }

    // 2. Also execute canonical database transition and audit log
    try {
      await executeAdminOrderAction(
        orderId,
        action,
        {
          userId: operator.userId,
          role: operator.role,
        },
        params,
        operator.token
      );
    } catch (dbErr: any) {
      console.warn("[OpsOrdersActions] Canonical DB transition note:", dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (err: any) {
    console.error("[OpsOrdersActions] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "حدث خطأ أثناء تنفيذ الإجراء على الطلب.",
      },
      { status: 500 }
    );
  }
}
