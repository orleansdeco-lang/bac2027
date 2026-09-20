import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getReferralSummary, recordReferralSignup } from "@/lib/referral";

export const dynamic = "force-dynamic";

/**
 * GET /api/referral
 * Returns the student's referral dashboard summary, credit balance, share URL, and referred friends list.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      userId = await extractAuthenticatedUserId(req);
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const host = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const origin = host ? `${proto}://${host}` : undefined;

    const summary = await getReferralSummary(userId, origin);
    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    console.error("[API] Error fetching referral summary:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load referral details", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referral
 * Records a pending referral signup for a new student using an existing student's referral code.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.referralCode) {
      return NextResponse.json(
        { success: false, error: "رمز الإحالة مطلوب" },
        { status: 400 }
      );
    }

    let referredUserId = body.referredUserId;
    if (!referredUserId) {
      referredUserId = await extractAuthenticatedUserId(req);
    }

    if (!referredUserId) {
      return NextResponse.json(
        { success: false, error: "معرف الطالب مطلوب" },
        { status: 401 }
      );
    }

    const result = await recordReferralSignup(referredUserId, body.referralCode);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message || "رمز الإحالة غير صالح أو تم استخدامه" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم تسجيل رمز الإحالة بنجاح",
    });
  } catch (err: any) {
    console.error("[API] Error recording referral:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء معالجة رمز الإحالة", details: err?.message },
      { status: 500 }
    );
  }
}
