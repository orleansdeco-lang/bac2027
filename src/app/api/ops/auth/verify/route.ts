import { NextResponse } from "next/server";
import {
  extractAuthenticatedUserId,
  getServerUserRole,
  isAbsoluteOwner,
} from "@/lib/operations/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/auth/verify
 * Validates operator session token, verifies role in user_roles, and establishes ops cookie.
 */
export async function POST(req: Request) {
  try {
    let token: string | null = null;

    // 1. Try reading body JSON for explicit token passed by login client
    try {
      const body = await req.json();
      if (body && typeof body.token === "string") {
        token = body.token.trim();
      }
    } catch {}

    // 2. Try Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace(/^Bearer\s+/i, "").trim();
      }
    }

    let userId: string | null = null;
    let userEmail: string | null = null;

    if (token && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user?.id) {
        userId = data.user.id;
        userEmail = data.user.email || null;
      }
    }

    // 3. Fallback to existing cookie/header extraction
    if (!userId) {
      userId = await extractAuthenticatedUserId(req);
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          error: "Authentication required: No valid session token provided",
        },
        { status: 401 }
      );
    }

    // 4. Absolute Owner immediate check or database role verification
    const isOwner = isAbsoluteOwner(userId, userEmail);
    const role = isOwner ? "OWNER" : await getServerUserRole(userId);
    const isOperator = isOwner || role === "OWNER" || role === "OPERATOR";

    if (!isOperator) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          role,
          userId,
          email: userEmail,
          error: "Unauthorized: This account does not possess OPERATOR or OWNER privileges.",
        },
        { status: 403 }
      );
    }

    // 5. Successful verification: set cookie and return authorized payload
    const response = NextResponse.json({
      success: true,
      authorized: true,
      role,
      userId,
      email: userEmail,
    });

    if (token) {
      response.cookies.set("ops_auth_token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        authorized: false,
        error: "Verification failed",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ops/auth/verify
 * Quick liveness check for current request operator authorization
 */
export async function GET(req: Request) {
  const userId = await extractAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, authorized: false, error: "Not logged in" },
      { status: 401 }
    );
  }

  const isOwner = isAbsoluteOwner(userId);
  const role = isOwner ? "OWNER" : await getServerUserRole(userId);
  const isOperator = isOwner || role === "OWNER" || role === "OPERATOR";

  if (!isOperator) {
    return NextResponse.json(
      { success: false, authorized: false, role, error: "Operator access denied" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    authorized: true,
    role: isOwner ? "OWNER" : role,
    userId,
  });
}
