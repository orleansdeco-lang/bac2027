import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  executeConfirmedAction,
  cancelAction,
  getActionProposal,
  listRecentActionProposals,
} from "@/lib/admin/ai-actions";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ai/actions
 * Lists recent action proposals or retrieves a specific proposal.
 * Guard: Requires 'ai.use'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("ai.use", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const actionId = searchParams.get("actionId");

  if (actionId) {
    const proposal = getActionProposal(actionId);
    if (!proposal) {
      return NextResponse.json(
        { success: false, error: `العملية المقترحة [${actionId}] غير موجودة أو انتهت صلاحيتها.` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, proposal });
  }

  const proposals = listRecentActionProposals(25);
  return NextResponse.json({ success: true, proposals });
}

/**
 * POST /api/admin/ai/actions
 * Handles explicit human confirmation (EXECUTE) or rejection (CANCEL) of a proposed action.
 * Guard:
 * - 'execute' requires 'ai.execute'
 * - 'cancel' requires 'ai.use'
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const actionType = body?.actionType as "execute" | "cancel";
  const actionId = body?.actionId?.trim();
  const idempotencyKey = body?.idempotencyKey?.trim() || actionId;

  if (!actionId || !actionType) {
    return NextResponse.json(
      { success: false, error: "actionId و actionType ('execute' | 'cancel') مطلوبان." },
      { status: 400 }
    );
  }

  if (actionType === "execute") {
    // Requires authoritative ai.execute permission
    const authResult = await requirePermission("ai.execute", req);
    if (!authResult.success) {
      return authResult.response;
    }

    try {
      const result = await executeConfirmedAction(actionId, authResult.context, idempotencyKey);
      return NextResponse.json({
        success: true,
        isDuplicate: result.isDuplicate || false,
        proposal: result.proposal,
        auditLogId: result.auditLogId,
        message: result.messageAr,
      });
    } catch (err: any) {
      console.error("[AIActionsRoute] Execution failed:", err);
      return NextResponse.json(
        { success: false, error: err.message || "تعذر تنفيذ العملية." },
        { status: 400 }
      );
    }
  } else if (actionType === "cancel") {
    // Requires ai.use permission
    const authResult = await requirePermission("ai.use", req);
    if (!authResult.success) {
      return authResult.response;
    }

    try {
      const reason = body?.cancelReason?.trim() || "إلغاء يدوي من قبل المشرف";
      const result = await cancelAction(actionId, reason, authResult.context);
      return NextResponse.json({
        success: true,
        proposal: result.proposal,
        message: result.messageAr,
      });
    } catch (err: any) {
      console.error("[AIActionsRoute] Cancellation failed:", err);
      return NextResponse.json(
        { success: false, error: err.message || "تعذر إلغاء العملية." },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    { success: false, error: "نوع العملية غير صالح. القيم المقبولة: 'execute' أو 'cancel'." },
    { status: 400 }
  );
}
