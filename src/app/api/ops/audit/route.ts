import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getAuditLogs } from "@/lib/operations/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/audit
 * Returns append-only audit trail entries with filters.
 * Strictly requires OPERATOR or OWNER role.
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
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
