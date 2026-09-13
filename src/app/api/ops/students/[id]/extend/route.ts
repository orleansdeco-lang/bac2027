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

    const body = await req.json().catch(() => ({}));
    const extensionType = body.type || "1_month";
    const days = body.days ? Number(body.days) : undefined;
    const reason = body.reason || undefined;

    const result = await extendStudentSubscription(authRes.userId!, studentId, {
      type: extensionType,
      days,
      reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newExpiresAt: result.newExpiresAt,
      message: "Subscription successfully extended.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to extend student subscription", details: err?.message },
      { status: 500 }
    );
  }
}
