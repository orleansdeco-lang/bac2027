import { NextResponse } from "next/server";
import { requirePermission, requireAdmin } from "@/lib/admin/auth";
import { getAdminAuditLogs, recordAdminAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit
 * Fetches append-only administrative audit trail.
 * Authoritative Guard: Requires 'audit.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("audit.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || undefined;
  const resourceType = searchParams.get("resourceType") || undefined;
  const actorUserId = searchParams.get("actorUserId") || undefined;
  const limit = Number(searchParams.get("limit")) || 50;
  const offset = Number(searchParams.get("offset")) || 0;

  try {
    const { logs, total } = await getAdminAuditLogs(
      {
        action,
        resourceType,
        actorUserId,
        limit,
        offset,
      },
      authResult.context.token
    );

    return NextResponse.json({ success: true, logs, total });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/audit
 * Allows administrative subsystems to append an audit log entry.
 * Authoritative Guard: Requires active admin session.
 */
export async function POST(req: Request) {
  const authResult = await requireAdmin(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json();
    if (!body.action || !body.resourceType || !body.resourceId) {
      return NextResponse.json(
        { success: false, error: "Missing required audit fields: action, resourceType, resourceId" },
        { status: 400 }
      );
    }

    const log = await recordAdminAudit(
      {
        actorUserId: context.userId,
        actorRole: context.role,
        action: body.action,
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        reason: body.reason,
        beforeState: body.beforeState,
        afterState: body.afterState,
        metadata: body.metadata,
      },
      context.token
    );

    return NextResponse.json({ success: true, log });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to append audit entry", details: err?.message },
      { status: 500 }
    );
  }
}
