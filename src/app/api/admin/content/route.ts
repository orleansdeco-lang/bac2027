import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getContentOperationsReport } from "@/lib/operations/content";
import { ContentVerificationStatus, ContentProvenanceSource } from "@/lib/operations/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content
 * Curriculum and educational content verification & provenance report.
 * Guarded by 'content.read' permission.
 */
export async function GET(request: NextRequest) {
  const authResult = await requirePermission("content.read", request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);
  const stream = searchParams.get("stream") || undefined;
  const subject = searchParams.get("subject") || undefined;
  const status = (searchParams.get("status") as ContentVerificationStatus) || undefined;
  const sourceType = (searchParams.get("sourceType") as ContentProvenanceSource) || undefined;
  const language = searchParams.get("language") || undefined;
  const missingVerificationOnly = searchParams.get("missingVerificationOnly") === "true";
  const missingResourcesOnly = searchParams.get("missingResourcesOnly") === "true";

  try {
    const report = getContentOperationsReport({
      stream,
      subject,
      status,
      sourceType,
      language,
      missingVerificationOnly,
      missingResourcesOnly,
    });

    return NextResponse.json({
      success: true,
      report,
      caller: {
        role: authResult.context.role,
        permissions: authResult.context.permissions,
      },
    });
  } catch (err: any) {
    console.error("[AdminContent] Error generating content report:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate content report", details: err?.message },
      { status: 500 }
    );
  }
}
