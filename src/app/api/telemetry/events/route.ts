import { NextResponse } from "next/server";
import { processTelemetryBatch } from "@/lib/operations/telemetry";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/telemetry/events
 * Ingestion endpoint for client-buffered telemetry events.
 * 
 * INVARIANTS:
 * - Server validates event name against domain allowlist
 * - Derives user_id from verified JWT (does not trust client user_id blindly)
 * - Deduplicates identical event IDs
 * - Graceful failure with 200/202 status to prevent client crashes
 */
export async function POST(req: Request) {
  try {
    // 1. Verify caller identity if Bearer token present
    let serverDerivedUserId: string | null = null;
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ") && isSupabaseConfigured && supabase) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) {
          serverDerivedUserId = user.id;
        }
      } catch {
        // Fallback: anonymous or unverified user_id
      }
    }

    // 2. Parse payload safely
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
