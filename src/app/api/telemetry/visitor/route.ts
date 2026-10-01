import { NextResponse } from "next/server";
import { recordVisitorHit, getLiveVisitorsCount } from "@/lib/operations/visitors";

export const dynamic = "force-dynamic";

/**
 * POST /api/telemetry/visitor
 * Ingestion endpoint for recording real-time and historical visitor activity.
 * Supports full URL, UTM campaign sources, referral links, and live heartbeats.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get("user-agent") || undefined;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const referrer = req.headers.get("referer") || body.referrer || undefined;

    const sessionId = body.sessionId || "ses_guest";
    const path = body.path || "/";
    if (path.startsWith("/admin") || path.startsWith("/ops") || path.startsWith("/api")) {
      return NextResponse.json({ success: true, ignored: true });
    }
    const fullUrl = body.fullUrl || undefined;
    const userId = body.userId || null;
    const anonymousId = body.anonymousId || undefined;
    const utmSource = body.utmSource || undefined;
    const utmCampaign = body.utmCampaign || undefined;
    const utmMedium = body.utmMedium || undefined;
    const utmContent = body.utmContent || undefined;
    const utmTerm = body.utmTerm || undefined;
    const refCode = body.refCode || undefined;
    const queryParams = body.queryParams || {};
    const isHeartbeat = Boolean(body.isHeartbeat);
    const firstTouch = body.firstTouch || null;
    const lastTouch = body.lastTouch || null;
    const deviceType = body.deviceType || undefined;
    const browser = body.browser || undefined;
    const os = body.os || undefined;

    await recordVisitorHit({
      sessionId,
      anonymousId,
      path,
      fullUrl,
      userId,
      userAgent,
      referrer,
      ip,
      utmSource,
      utmCampaign,
      utmMedium,
      utmContent,
      utmTerm,
      refCode,
      queryParams,
      isHeartbeat,
      firstTouch,
      lastTouch,
      deviceType,
      browser,
      os,
    });

    const liveCount = getLiveVisitorsCount(5);

    return NextResponse.json({
      success: true,
      liveCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Visitor logging error" },
      { status: 500 }
    );
  }
}
