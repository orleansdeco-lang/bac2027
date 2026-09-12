import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-Authoritative Time Endpoint
 * Prevents client device clock manipulation from tampering with trial expiry decisions.
 */
export async function GET() {
  const now = new Date();
  return NextResponse.json(
    {
      now: now.toISOString(),
      timestamp: now.getTime(),
      server: "bac_mastery_edge",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
