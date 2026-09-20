import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { redeemVoucher } from "@/lib/operations/vouchers";

export const dynamic = "force-dynamic";

/**
 * POST /api/vouchers/redeem
 * Redeems a physical SHATER Pass voucher code and authoritatively unlocks subscription.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.voucherCode) {
      return NextResponse.json(
        { success: false, error: "رمز بطاقة شاطر مطلوب للتفعيل" },
        { status: 400 }
      );
    }

    let userId = body.userId;
    if (!userId) {
      userId = await extractAuthenticatedUserId(req);
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لتفعيل بطاقة شاطر" },
        { status: 401 }
      );
    }

    const result = await redeemVoucher(userId, body.voucherCode);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message || "رمز البطاقة غير صالح أو تم تفعيله مسبقاً" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || "مبروك! تم تفعيل اشتراكك الكامل بنجاح بواسطة بطاقة شاطر.",
      planId: result.planId,
      subscriptionExpiresAt: result.subscriptionExpiresAt,
    });
  } catch (err: any) {
    console.error("[API] Voucher redemption error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "فشل تفعيل البطاقة، يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  }
}
