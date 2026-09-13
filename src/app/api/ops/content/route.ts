import { NextRequest, NextResponse } from "next/server";
import { isServerOperator, isServerContentReviewer, isServerOwner } from "@/lib/operations/auth";
import { getContentOperationsReport } from "@/lib/operations/content";
import { ContentVerificationStatus, ContentProvenanceSource } from "@/lib/operations/types";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const isAuthorized = Boolean(
    userId &&
      ((await isServerOperator(userId)) ||
        (await isServerContentReviewer(userId)) ||
        (await isServerOwner(userId)))
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
