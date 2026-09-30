import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { executeAdminAIQuery } from "@/lib/admin/ai-service";
import { ADMIN_AI_TOOLS_REGISTRY } from "@/lib/admin/ai-tools";
import { recordAdminAudit } from "@/lib/admin/audit";
import { hasPermission } from "@/lib/admin/permissions";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ai
 * Returns available approved AI tools and current admin permissions.
 * Authoritative Guard: Requires 'ai.use'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("ai.use", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  const tools = Object.values(ADMIN_AI_TOOLS_REGISTRY).map((tool) => ({
    name: tool.name,
    nameAr: tool.nameAr,
    description: tool.description,
    requiredPermission: tool.requiredPermission,
    authorized: hasPermission(context.role, tool.requiredPermission),
  }));

  return NextResponse.json({
    success: true,
    admin: {
      id: context.userId,
      role: context.role,
    },
    tools,
  });
}

/**
 * POST /api/admin/ai
 * Dispatches conversational administrative AI query through typed tools.
 * Authoritative Guard: Requires 'ai.use'.
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("ai.use", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json().catch(() => null);
    const message = body?.message?.trim();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "الرسالة مطلوبة للاستعلام" },
        { status: 400 }
      );
    }

    const history = Array.isArray(body?.history) ? body.history : [];

    // Execute query within admin context
    const result = await executeAdminAIQuery(context, message, history);

    // Record audit event for AI command execution
    await recordAdminAudit({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "AI_COMMAND_PROCESSED",
      resourceType: "AI_COMMAND_CENTER",
      resourceId: "chat-query",
      metadata: {
        queryLength: message.length,
        toolsUsed: result.toolsExecuted.map((t) => t.name),
        warningsCount: result.warnings?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      toolsExecuted: result.toolsExecuted,
      structuredData: result.structuredData,
      warnings: result.warnings,
    });
  } catch (err: any) {
    console.error("[AdminAIRoute] Error executing command:", err);
    return NextResponse.json(
      { success: false, error: "تعذر معالجة الاستعلام الذكي", details: err?.message },
      { status: 500 }
    );
  }
}
