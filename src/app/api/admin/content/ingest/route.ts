import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { ingestKnowledgeItem, IngestInput } from "@/lib/admin/knowledge-agent";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/content/ingest
 * Ingests, analyzes, classifies, and quality-checks educational content.
 * Guard: Requires 'content.manage' or 'content.read'.
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("content.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = (await req.json().catch(() => null)) as IngestInput;

    if (!body || !body.title) {
      return NextResponse.json(
        { success: false, error: "عنوان الوثيقة أو المحتوى مطلوب للاستقبال." },
        { status: 400 }
      );
    }

    const item = await ingestKnowledgeItem(body, {
      userId: context.userId,
      role: context.role,
    });

    return NextResponse.json({
      success: true,
      item,
      messageAr: "تم استقبال الوثيقة وتصنيفها آلياً بنجاح وهي بانتظار المراجعة والاعتماد البشري.",
    });
  } catch (err: any) {
    console.error("[KnowledgeIngestRoute] Error ingesting content:", err);
    return NextResponse.json(
      { success: false, error: err.message || "تعذر استقبال وتصنيف الوثيقة." },
      { status: 400 }
    );
  }
}
