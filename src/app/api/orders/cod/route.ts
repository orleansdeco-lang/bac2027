import { NextResponse } from "next/server";
import { createCodOrder } from "@/lib/operations/payments";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";

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

    // Resolve user ID: from session or body
    let userId = await extractAuthenticatedUserId(req);
    if (!userId && body.userId) {
      userId = body.userId;
    }
    if (!userId) {
      userId = `guest_${cleanPhone}`;
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.replace(/^Bearer\s+/i, "").trim()
      : null;

    const order = await createCodOrder(
      {
        userId,
        plan,
        shippingName: shippingName.trim(),
        shippingPhone: cleanPhone,
        shippingWilaya: shippingWilaya.trim(),
        shippingCommune: (shippingCommune || "").trim(),
        shippingAddress: shippingAddress.trim(),
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
