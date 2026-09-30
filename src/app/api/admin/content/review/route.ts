import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  listKnowledgeItems,
  getKnowledgeItemById,
  reviewKnowledgeItem,
  ReviewActionType,
  ReviewActionOptions,
  ContentLifecycleStatus,
} from "@/lib/admin/knowledge-agent";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content/review
 * Lists educational items in the ingestion pipeline.
 * Guard: Requires 'content.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("content.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("id");

  if (itemId) {
    const item = getKnowledgeItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: `الوثيقة [${itemId}] غير موجودة.` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, item });
  }

  const status = (searchParams.get("status") as ContentLifecycleStatus) || undefined;
  const subject = searchParams.get("subject") || undefined;
  const stream = searchParams.get("stream") || undefined;
  const isDuplicateParam = searchParams.get("isDuplicate");
  const isDuplicate = isDuplicateParam !== null ? isDuplicateParam === "true" : undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const items = listKnowledgeItems({
    status,
    subject,
    stream,
    isDuplicate,
    limit,
  });

  return NextResponse.json({
    success: true,
    total: items.length,
    items,
  });
}

/**
 * POST /api/admin/content/review
 * Executes a human review action: approve, publish, reject, edit, merge, request_review.
 * Guard: Requires 'content.manage'.
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("content.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json().catch(() => null);
    const itemId = body?.itemId?.trim();
    const action = body?.action as ReviewActionType;
    const options = (body?.options || {}) as ReviewActionOptions;

    if (!itemId || !action) {
      return NextResponse.json(
        { success: false, error: "itemId و action مطلوبان لإتمام المراجعة." },
        { status: 400 }
      );
    }

    const result = await reviewKnowledgeItem(itemId, action, options, context);

    return NextResponse.json({
      success: true,
      item: result.item,
      messageAr: result.messageAr,
    });
  } catch (err: any) {
    console.error("[ContentReviewRoute] Error processing review:", err);
    return NextResponse.json(
      { success: false, error: err.message || "تعذر إتمام عملية المراجعة." },
      { status: 400 }
    );
  }
}
