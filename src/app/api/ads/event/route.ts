import { NextResponse } from "next/server";
import { recordAdImpression, recordAdClick } from "@/lib/ads/ad-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/ads/event
 * Records advertising telemetry: impressions, standard clicks, and direct WhatsApp clicks.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const campaignId = body?.campaignId;
    const eventType = body?.eventType as "impression" | "click" | "whatsapp_click";
    const studentId = body?.studentId;

    if (!campaignId || !eventType) {
      return NextResponse.json(
        { success: false, error: "معرف الحملة ونوع الحدث مطلوبان." },
        { status: 400 }
      );
    }

    if (eventType === "impression") {
      await recordAdImpression(campaignId, studentId);
    } else if (eventType === "click") {
      await recordAdClick(campaignId, false, studentId);
    } else if (eventType === "whatsapp_click") {
      await recordAdClick(campaignId, true, studentId);
    }

    return NextResponse.json({
      success: true,
      message: `تم تسجيل حدث [${eventType}] بنجاح.`,
    });
  } catch (err: any) {
    console.error("[AdsEventAPI] Error recording ad event:", err);
    return NextResponse.json(
      { success: false, error: "تعذر تسجيل حدث الإعلان", details: err?.message },
      { status: 500 }
    );
  }
}
