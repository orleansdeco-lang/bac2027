import { NextResponse } from "next/server";
import { serveMatchingAds } from "@/lib/ads/ad-service";
import { StudentTargetingContext, AdPlacement } from "@/lib/ads/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/ads/serve
 * Student-facing engine that retrieves matching active ads based on real targeting constraints.
 * Enforces mandatory «إعلان» badge and frequency capping.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const context: StudentTargetingContext = {
      studentId: body.studentId,
      wilayaCode: body.wilayaCode ? Number(body.wilayaCode) : undefined,
      commune: body.commune,
      streamId: body.streamId,
      grade: body.grade,
      currentSubject: body.currentSubject,
      currentPage: body.currentPage || "home",
      placement: (body.placement as AdPlacement) || "sidebar",
    };

    const ads = await serveMatchingAds(context);

    return NextResponse.json({
      success: true,
      ads,
      count: ads.length,
    });
  } catch (err: any) {
    console.error("[AdsServeAPI] Error serving matching ads:", err);
    return NextResponse.json(
      { success: false, error: "تعذر استرجاع الإعلانات المناسبة", details: err?.message },
      { status: 500 }
    );
  }
}
