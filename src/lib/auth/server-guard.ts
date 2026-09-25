import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StudentRepository } from "@/lib/repositories/student-repository";
import { getStudentAccess, StudentAccessDecision } from "@/lib/access";
import { StrategicProfile } from "@/types/onboarding";

export interface ServerAuthResult {
  authenticated: boolean;
  authorized: boolean;
  userId?: string;
  userEmail?: string;
  profile?: StrategicProfile | null;
  accessDecision?: StudentAccessDecision | null;
  errorResponse?: NextResponse;
}

/**
 * Extracts session token from headers or cookies
 */
export function extractAuthToken(req: NextRequest | Request): string | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token.length > 5) return token;
  }

  // NextRequest cookies
  if ("cookies" in req && typeof req.cookies?.getAll === "function") {
    const cookies = req.cookies.getAll();
    for (const c of cookies) {
      const name = c.name.toLowerCase();
      if (
        name === "sb-access-token" ||
        name === "bac_auth_token" ||
        name === "auth_token" ||
        name.includes("-auth-token")
      ) {
        if (c.value && c.value.length > 5) return c.value;
      }
    }
  }

  // Standard Cookie header
  const rawCookie = req.headers.get("cookie");
  if (rawCookie) {
    const parts = rawCookie.split(";").map((p) => p.trim());
    for (const part of parts) {
      const [name, val] = part.split("=");
      if (!name || !val) continue;
      const lower = name.toLowerCase();
      if (
        lower === "sb-access-token" ||
        lower === "bac_auth_token" ||
        lower === "auth_token" ||
        lower.includes("-auth-token")
      ) {
        return decodeURIComponent(val);
      }
    }
  }

  return null;
}

/**
 * Authoritative Server-Side Guard for Route Handlers
 * Verifies authentication AND active subscription/trial window.
 */
export async function requireServerAuth(
  req: NextRequest | Request,
  options?: { requireActiveSubscription?: boolean }
): Promise<ServerAuthResult> {
  const token = extractAuthToken(req);

  // Fallback dev header or query param for automated testing if configured
  const devUserId = req.headers.get("x-user-id");

  let verifiedUserId: string | null = null;
  let verifiedEmail: string | undefined;

  if (token && isSupabaseConfigured && supabase) {
    try {
      const serverClient = createServerSupabaseClient(token) || supabase;
      const {
        data: { user },
        error,
      } = await serverClient.auth.getUser(token);

      if (!error && user?.id) {
        verifiedUserId = user.id;
        verifiedEmail = user.email;
      }
    } catch (e) {
      console.warn("[ServerGuard] Token verification exception:", e);
    }
  }

  // Allow dev/test tokens or devUserId in non-production environments
  if (!verifiedUserId && (token?.startsWith("dev-") || devUserId) && process.env.NODE_ENV !== "production") {
    verifiedUserId = devUserId || "00000000-0000-0000-0000-000000000001";
    verifiedEmail = "dev@shater-bac.dz";
  }

  // 1. Authentication check
  if (!verifiedUserId) {
    return {
      authenticated: false,
      authorized: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "يجب تسجيل الدخول للوصول إلى هذه الخدمة.",
        },
        { status: 401 }
      ),
    };
  }

  // 2. Fetch authoritative profile & verify subscription status
  let profile: StrategicProfile | null = null;
  try {
    profile = await StudentRepository.getProfile(verifiedUserId);
  } catch (err) {
    console.warn("[ServerGuard] Failed to fetch student profile:", err);
  }

  const accessDecision = getStudentAccess(profile);

  // 3. Subscription & 7-Day Trial Gate
  if (options?.requireActiveSubscription !== false && !accessDecision.canUseProduct) {
    return {
      authenticated: true,
      authorized: false,
      userId: verifiedUserId,
      userEmail: verifiedEmail,
      profile,
      accessDecision,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Subscription Required",
          reason: accessDecision.reason,
          message: "انتهت فترة التجربة المجانية (7 أيام). يرجى الاشتراك للمتابعة.",
          redirectUrl: "/subscribe",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authenticated: true,
    authorized: true,
    userId: verifiedUserId,
    userEmail: verifiedEmail,
    profile,
    accessDecision,
  };
}
