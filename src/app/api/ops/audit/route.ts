import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator } from "@/lib/operations/auth";
import { getAuditLogs } from "@/lib/operations/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/audit
 * Returns append-only audit trail entries with filters.
 * Strictly requires OPERATOR or OWNER role.
 * Content Reviewer is explicitly denied with 403.
 */
export async function GET(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Operator access required" },
      { status: authRes.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || undefined;
  const targetType = searchParams.get("targetType") || undefined;
  const actorUserId = searchParams.get("actorUserId") || undefined;
  const limit = Number(searchParams.get("limit")) || 50;

  try {
    const logs = await getAuditLogs({
      action,
      targetType,
      actorUserId,
      limit,
    });
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs", details: err?.message },
      { status: 500 }
    );
  }
}
