import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator } from "@/lib/operations/auth";
import { extendStudentSubscription } from "@/lib/operations/subscriptions";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/students/[id]/extend
 * Manually extends a student's access duration without creating payment orders.
 * Strictly requires OWNER or OPERATOR with finance privileges.
 * Content Reviewer is blocked with 403 Forbidden.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Finance operator access required" },
      { status: authRes.status }
    );
  }

  try {
    const resolvedParams = await params;
    const studentId = resolvedParams.id;
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required." },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:ops_auth_token|sb-access-token)=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
    }

    const body = await req.json().catch(() => ({}));
    const extensionType = body.type || (body.plan === "monthly" ? "1_month" : "custom");
    const days = body.days ? Number(body.days) : (body.plan === "monthly" || extensionType === "1_month" ? 30 : 365);
    const reason = body.reason || undefined;
    const plan = body.plan || (days > 60 ? "season" : "monthly");

    const result = await extendStudentSubscription(
      authRes.userId!,
      decodeURIComponent(studentId).trim(),
      {
        type: extensionType,
        days,
        reason,
        plan,
      },
      token
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newExpiresAt: result.newExpiresAt,
      plan: result.plan,
      message: "Subscription successfully extended.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to extend student subscription", details: err?.message },
      { status: 500 }
    );
  }
}
