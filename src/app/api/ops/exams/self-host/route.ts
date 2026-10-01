import { NextRequest, NextResponse } from "next/server";
import { selfHostExamPdf, batchSelfHostResources } from "@/lib/services/exam-self-hosting-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { resourceId, remotePdfUrl, subject, title, isBatch, limit } = body;

    if (isBatch) {
      const batchRes = await batchSelfHostResources(limit ? Number(limit) : 20);
      return NextResponse.json({ success: true, ...batchRes });
    }

    if (!resourceId || !remotePdfUrl) {
      return NextResponse.json(
        { error: "resourceId and remotePdfUrl are required for single self-host" },
        { status: 400 }
      );
    }

    const result = await selfHostExamPdf(resourceId, remotePdfUrl, subject, title);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (err: any) {
    console.error("API self-host route error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
