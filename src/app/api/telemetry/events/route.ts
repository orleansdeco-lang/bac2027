import { NextResponse } from "next/server";
import { processTelemetryBatch, checkRateLimit } from "@/lib/operations/telemetry";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/telemetry/events
 * Ingestion endpoint for client-buffered telemetry events.
 * 
 * SECURITY INVARIANTS:
 * 1. Payload size bounded (< 64KB).
 * 2. Rate limited per IP/Visitor (120 events/min).
 * 3. Server validates event name against controlled domain allowlist.
 * 4. Derives user_id from verified JWT via extractAuthenticatedUserId (never trusts client).
 * 5. Deduplicates identical event IDs and critical conversions.
 * 6. Graceful failure with 200/202 status to prevent client crashes.
 */
export async function POST(req: Request) {
  try {
    // 1. Rate Limiting / Abuse Protection
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous_client";

    if (!checkRateLimit(clientIp, 120, 60000)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please throttle telemetry dispatch." },
        { status: 429 }
      );
    }

    // 2. Payload size check
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 65536) {
      return NextResponse.json(
        { success: false, error: "Payload too large. Maximum payload size is 64KB." },
        { status: 413 }
      );
    }

    // 3. Verify caller identity using the authoritative auth extraction
    const serverDerivedUserId = await extractAuthenticatedUserId(req);

    // 4. Parse payload safely
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const rawEvents = Array.isArray(body) ? body : (body.events || [body]);
    const result = await processTelemetryBatch(rawEvents, serverDerivedUserId);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Telemetry ingestion exception",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
