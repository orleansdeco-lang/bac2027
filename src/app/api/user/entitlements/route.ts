import { NextRequest, NextResponse } from "next/server";
import { extractAuthToken } from "@/lib/auth/server-guard";
import { getUserEntitlements } from "@/lib/access/entitlements";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/entitlements
 * Authoritative endpoint for client UI to retrieve validated server entitlements.
 */
export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    let userId = "guest";

    if (token && isSupabaseConfigured && supabase) {
      try {
        const serverClient = createServerSupabaseClient(token) || supabase;
        const {
          data: { user },
        } = await serverClient.auth.getUser(token);

        if (user?.id) {
          userId = user.id;
        }
      } catch (e) {
        // Fall back to token if it looks like a user ID
        if (token.startsWith("usr_") || /^[0-9a-f-]{36}$/i.test(token)) {
          userId = token;
        }
      }
    } else if (token && (token.startsWith("usr_") || /^[0-9a-f-]{36}$/i.test(token))) {
      userId = token;
    }

    const entitlements = await getUserEntitlements(userId, token);

    return NextResponse.json({
      success: true,
      entitlements,
    });
  } catch (err: any) {
    console.error("[/api/user/entitlements] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve user entitlements",
        message: err?.message,
      },
      { status: 500 }
    );
  }
}
