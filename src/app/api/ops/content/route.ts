import { NextRequest, NextResponse } from "next/server";
import { isServerOperator, isServerContentReviewer, isServerOwner, extractAndVerifyOperator } from "@/lib/operations/auth";
import { extractAdminContext } from "@/lib/admin/auth";
import { getContentOperationsReport } from "@/lib/operations/content";
import { ContentVerificationStatus, ContentProvenanceSource } from "@/lib/operations/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // First verify operator or admin session cryptographically via token
  const adminContext = await extractAdminContext(request);
  const operator = adminContext ? null : await extractAndVerifyOperator(request);

  const isAuthorized = Boolean(
    (adminContext && (adminContext.permissions.includes("content.read") || adminContext.role === "OWNER" || adminContext.role === "OPERATOR" || adminContext.role === "CONTENT_REVIEWER")) ||
    operator
  );

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Forbidden: Operations or Content Reviewer access required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const stream = searchParams.get("stream") || undefined;
  const subject = searchParams.get("subject") || undefined;
  const status = (searchParams.get("status") as ContentVerificationStatus) || undefined;
  const sourceType = (searchParams.get("sourceType") as ContentProvenanceSource) || undefined;
  const language = searchParams.get("language") || undefined;
  const missingVerificationOnly = searchParams.get("missingVerificationOnly") === "true";
  const missingResourcesOnly = searchParams.get("missingResourcesOnly") === "true";

  const report = getContentOperationsReport({
    stream,
    subject,
    status,
    sourceType,
    language,
    missingVerificationOnly,
    missingResourcesOnly,
  });

  return NextResponse.json(report);
}
