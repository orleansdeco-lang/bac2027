import { NextResponse } from "next/server";
import { createCodOrder } from "@/lib/operations/payments";
import { extractAuthenticatedUserId, isServerOperator } from "@/lib/operations/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders/cod
 * Places a Cash on Delivery (COD) order for the physical SHATER Pass card.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "الرجاء تقديم بيانات الطلب كاملة" },
        { status: 400 }
      );
    }

    const {
      shippingName,
      shippingPhone,
      parentPhone,
      shippingWilaya,
      shippingCommune,
      shippingAddress,
      plan = "season",
      notes,
    } = body;

    const effectiveAddress = (shippingAddress || shippingCommune || shippingWilaya || "توصيل للولاية").trim();

    if (!shippingName || !shippingPhone || !shippingWilaya) {
      return NextResponse.json(
        { success: false, error: "الاسم، رقم الهاتف، والولاية مطلوبة لإتمام طلب التوصيل" },
        { status: 400 }
      );
    }

    // Phone number basic Algerian validation
    const cleanPhone = shippingPhone.replace(/\s+/g, "");
    if (!/^(05|06|07|02)\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال رقم هاتف جزائري صالح (05 / 06 / 07)" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.replace(/^Bearer\s+/i, "").trim()
      : null;

    // Resolve user ID: if caller is authenticated, verify ownership or operator privileges
    const callerId = await extractAuthenticatedUserId(req);
    let userId: string | null = null;

    if (callerId) {
      if (body.userId && body.userId !== callerId) {
        const isOperator = await isServerOperator(callerId, token);
        if (!isOperator) {
          return NextResponse.json(
            { success: false, error: "غير مصرح لك بإنشاء طلب باسم مستخدم آخر." },
            { status: 403 }
          );
        }
        userId = body.userId;
      } else {
        userId = callerId;
      }
    } else {
      // Unauthenticated caller cannot claim any existing student UUID
      userId = null;
    }

    const cleanParentPhone = parentPhone ? parentPhone.replace(/\s+/g, "") : undefined;

    const order = await createCodOrder(
      {
        userId,
        plan,
        shippingName: shippingName.trim(),
        shippingPhone: cleanPhone,
        parentPhone: cleanParentPhone,
        shippingWilaya: shippingWilaya.trim(),
        shippingCommune: (shippingCommune || "").trim(),
        shippingAddress: effectiveAddress,
        notes,
        studentEmail: body.studentEmail,
      },
      token
    );

    return NextResponse.json({
      success: true,
      message: "تم تسجيل طلب بطاقة شاطر بنجاح! سيتم الاتصال بك لتأكيد التوصيل والدفع عند الاستلام.",
      order,
    });
  } catch (err: any) {
    console.error("[API] Error placing COD order:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "فشل تسجيل الطلب، يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  }
}
