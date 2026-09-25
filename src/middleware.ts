import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "/campus",
  "/tutor",
];

/**
 * Checks if the request contains any valid authentication token or Supabase session cookie
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
 * Route guard enforcing session presence for student and ops routes.
 * Authoritative cryptographic and RBAC checks are executed in Route Handlers.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // 1. OPERATIONS CENTER GUARD (/ops/*)
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
  // 2. PROTECTED STUDENT ROUTES GUARD
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
  // 3. PUBLIC & UNGUARDED ROUTES (Default pass-through)
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
    "/campus/:path*",
    "/tutor/:path*",
  ],
};
