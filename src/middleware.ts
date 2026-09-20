import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Authoritative Absolute Owner Credentials
 */
export const OWNER_EMAIL = "azinox27@gmail.com";
export const OWNER_UUID = "7f7f704e-d9f1-4edf-9952-591f41fc0c55";

/**
 * Protected learner route prefixes requiring active authentication
 */
export const PROTECTED_STUDENT_PREFIXES = [
  "/dashboard",
  "/mission",
  "/exam",
  "/roadmap",
  "/errors",
  "/error-lab",
  "/account",
  "/profile",
  "/progress",
  "/curriculum",
  "/mind",
];

/**
 * Checks if a parsed object corresponds to the Absolute Owner
 */
export function isOwnerPayload(payload: any): boolean {
  if (!payload || typeof payload !== "object") return false;
  const email = (payload.email || payload.user_metadata?.email || "")?.toLowerCase();
  const sub = (payload.sub || payload.id || "")?.toLowerCase();
  return email === OWNER_EMAIL.toLowerCase() || sub === OWNER_UUID.toLowerCase();
}

/**
 * Inspects a token, cookie value, or JSON payload to check for Absolute Owner credentials
 */
export function checkIsOwner(raw: string | undefined | null): boolean {
  if (!raw) return false;

  // Try parsing as JSON (e.g. Supabase session array, user object)
  try {
    const parsed = JSON.parse(raw);
    if (isOwnerPayload(parsed)) return true;
    if (parsed.user && isOwnerPayload(parsed.user)) return true;
  } catch {}

  // Try decoding JWT payload (header.payload.signature)
  try {
    const parts = raw.split(".");
    if (parts.length === 3) {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decodedJson = atob(base64);
      const payload = JSON.parse(decodedJson);
      if (isOwnerPayload(payload)) return true;
    }
  } catch {}

  return false;
}

/**
 * Checks if the request comes from the Absolute Owner (via Authorization header or cookies)
 */
export function isOwnerRequest(request: NextRequest): boolean {
  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && checkIsOwner(authHeader.replace(/^Bearer\s+/i, ""))) {
    return true;
  }

  // 2. Check cookies
  const allCookies = request.cookies.getAll();
  for (const cookie of allCookies) {
    if (checkIsOwner(cookie.value)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the request contains any valid authentication token or Supabase session
 */
export function hasActiveSession(request: NextRequest): boolean {
  // 1. Authorization header
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token && token.length > 10) return true;
  }

  // 2. Check cookies
  const allCookies = request.cookies.getAll();
  for (const cookie of allCookies) {
    const name = cookie.name.toLowerCase();
    const val = cookie.value;
    if (!val) continue;

    // Recognized auth cookie names
    if (
      name === "sb-access-token" ||
      name === "ops_auth_token" ||
      name === "bac_auth_token" ||
      name === "auth_token" ||
      name.includes("-auth-token")
    ) {
      if (val.length > 5) return true;
    }

    // Check if raw cookie contains a session JSON or JWT pattern
    if (val.includes("access_token") || val.split(".").length === 3) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a given pathname matches any protected student route
 */
export function isProtectedStudentRoute(pathname: string): boolean {
  return PROTECTED_STUDENT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

/**
 * Next.js Edge Middleware
 * Route guard and immediate pass-through for Absolute Owner,
 * protection of student routes with ?redirectTo=/auth preservation,
 * and ops center authorization.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // 1. ABSOLUTE OWNER BYPASS (Immediate pass-through on ALL routes)
  // ---------------------------------------------------------------------------
  const isOwner = isOwnerRequest(request);
  if (isOwner) {
    const response = NextResponse.next();
    if (pathname.startsWith("/ops")) {
      response.headers.set("x-operations-route", "true");
      response.headers.set("x-operations-owner", "true");
      response.headers.set("x-operations-role", "OWNER");
    }
    return response;
  }

  // ---------------------------------------------------------------------------
  // 2. OPERATIONS CENTER GUARD (/ops/*)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/ops")) {
    // Exempt /ops/login from interception
    if (pathname === "/ops/login") {
      return NextResponse.next();
    }

    // Check for operator session
    const hasSession = hasActiveSession(request);
    if (!hasSession) {
      const loginUrl = new URL("/ops/login", request.url);
      const originalPath = pathname + search;
      loginUrl.searchParams.set("redirect", originalPath);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-operations-route", "true");
    return response;
  }

  // ---------------------------------------------------------------------------
  // 3. PROTECTED STUDENT ROUTES GUARD
  // ['/dashboard', '/mission/:path*', '/exam', '/roadmap', '/errors', '/account', '/profile/:path*']
  // ---------------------------------------------------------------------------
  if (isProtectedStudentRoute(pathname)) {
    const hasSession = hasActiveSession(request);

    if (!hasSession) {
      // Immediate redirection to /auth with preserved destination
      const redirectUrl = new URL("/auth", request.url);
      const destination = pathname + search;
      redirectUrl.searchParams.set("redirectTo", destination);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 4. PUBLIC & UNGUARDED ROUTES (Default pass-through)
  // ---------------------------------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ops/:path*",
    "/dashboard/:path*",
    "/mission/:path*",
    "/exam/:path*",
    "/roadmap/:path*",
    "/error-lab/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/progress/:path*",
    "/curriculum/:path*",
    "/mind/:path*",
  ],
};
