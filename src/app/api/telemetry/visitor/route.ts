import { NextResponse } from "next/server";
import { recordVisitorHit, getLiveVisitorsCount } from "@/lib/operations/visitors";

export const dynamic = "force-dynamic";

/**
 * POST /api/telemetry/visitor
 * Ingestion endpoint for recording real-time and historical visitor activity.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get("user-agent") || undefined;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const referrer = req.headers.get("referer") || body.referrer || undefined;

    const sessionId = body.sessionId || "ses_guest";
    const path = body.path || "/";
    const userId = body.userId || null;

    recordVisitorHit({
      sessionId,
      path,
      userId,
      userAgent,
      referrer,
      ip,
    });

    const liveCount = getLiveVisitorsCount(15);

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
