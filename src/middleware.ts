import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public Landing Pages accessible to unauthenticated visitors.
 * CRITICAL RULE: Exactly these landing surfaces are public.
 * Sub-routes of /student (e.g. /student/dashboard, /student/error-lab) are STRICTLY NOT PUBLIC.
 */
export const PUBLIC_LANDING_PAGES = new Set([
  "/",
  "/landing",
  "/student",
  "/students",
  "/parents",
  "/privacy",
  "/terms",
]);

/**
 * Public Auth & Login Route prefixes/paths
 */
export const PUBLIC_AUTH_PATHS = [
  "/auth",
  "/register",
  "/ops/login",
  "/admin/login",
];

/**
 * Legacy export for backwards compatibility with external imports
 */
export const PROTECTED_STUDENT_PREFIXES = [
  "/dashboard",
  "/mission",
  "/exam",
  "/exams",
  "/planner",
  "/diwan",
  "/student",
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
  "/orientation",
  "/diagnostic",
  "/faq",
  "/annales",
  "/calculator",
  "/scientific-calculator",
  "/onboarding",
  "/subscribe",
  "/checkout",
  "/orders",
  "/table",
  "/ypt",
];

/**
 * Checks if the request path matches static assets or Next.js internals
 */
export function isStaticAsset(path: string): boolean {
  if (
    path.startsWith("/_next") ||
    path.startsWith("/illustrations") ||
    path.startsWith("/images") ||
    path.startsWith("/icons") ||
    path.startsWith("/brand") ||
    path.startsWith("/fonts") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml"
  ) {
    return true;
  }

  // Matches static file extensions (.svg, .png, .jpg, .webp, .ico, etc.)
  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|pdf|woff|woff2|ttf|eot|css|js|map)$/i.test(path);
}

/**
 * Checks if the request path is a public API route permitted for unauthenticated visitors
 */
export function isPublicApi(path: string): boolean {
  return (
    path === "/api/auth/check-phone" ||
    path.startsWith("/api/auth/") ||
    path === "/api/server-time" ||
    path === "/api/telemetry/visitor" ||
    path === "/api/telemetry/events" ||
    path === "/api/subscriptions/plans" ||
    path === "/api/schools/search" ||
    path === "/api/schools/submit" ||
    path === "/api/ops/auth/verify" ||
    path.startsWith("/api/webhooks/")
  );
}

/**
 * Checks if the request path is one of the allowed public landing pages
 * IMPORTANT: Strictly exact matches (e.g. /student is public, but /student/* is NOT public!)
 */
export function isPublicLandingPage(path: string): boolean {
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return PUBLIC_LANDING_PAGES.has(normalized);
}

/**
 * Checks if the request path is an authentication or login flow
 */
export function isAuthFlow(path: string): boolean {
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return (
    normalized === "/auth" ||
    normalized.startsWith("/auth/") ||
    normalized === "/register" ||
    normalized === "/ops/login" ||
    normalized === "/admin/login"
  );
}

/**
 * Checks if the request contains any valid authentication token or Supabase session cookie
 */
export function hasActiveSession(request: NextRequest): boolean {
  // 1. Authorization header (Bearer token)
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
      name === "ops_operator" ||
      name === "ops_admin" ||
      name === "bac_auth_token" ||
      name === "auth_token" ||
      name.includes("-auth-token")
    ) {
      if (val.length >= 1) return true;
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
  const normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (isStaticAsset(normalized) || isPublicLandingPage(normalized) || isAuthFlow(normalized) || isPublicApi(normalized)) {
    return false;
  }
  return true;
}

/**
 * Next.js Edge Middleware
 * Authoritative Server-Side Guard implementing a strict Allowlist / Default-Deny Security Model.
 *
 * UNREGISTERED / ANONYMOUS VISITORS:
 * - Only 3 public landing surfaces allowed: /, /student, /parents (+ auth pages, static assets, public APIs)
 * - /student is public, but /student/* (e.g. /student/dashboard, /student/error-lab) REQUIRES AUTH.
 * - All internal application pages redirect server-side (307) to /auth?redirectTo=...
 * - All internal API endpoints return 401 Unauthorized JSON.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const normalizedPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  // ---------------------------------------------------------------------------
  // 1. STATIC ASSETS & NEXT.JS INTERNALS (Instant Pass-through)
  // ---------------------------------------------------------------------------
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 2. PUBLIC LANDING PAGES (Only /, /student, /parents, /terms, /privacy)
  // ---------------------------------------------------------------------------
  if (isPublicLandingPage(normalizedPath)) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 3. AUTHENTICATION & LOGIN PAGES (/auth, /auth/*, /ops/login, /admin/login)
  // ---------------------------------------------------------------------------
  if (isAuthFlow(normalizedPath)) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 4. PUBLIC LANDING & ONBOARDING APIS
  // ---------------------------------------------------------------------------
  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 5. SESSION CHECK
  // ---------------------------------------------------------------------------
  const hasSession = hasActiveSession(request);

  // ---------------------------------------------------------------------------
  // 6. OPERATIONS & SHATER CONTROL CENTER GUARD (/admin/* and /ops/*)
  // ---------------------------------------------------------------------------
  if (normalizedPath.startsWith("/admin") || normalizedPath.startsWith("/ops")) {
    if (!hasSession) {
      const loginUrl = new URL("/ops/login", request.url);
      const destination = pathname + search;
      loginUrl.searchParams.set("redirect", destination);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-operations-route", "true");
    response.headers.set("x-admin-route", "true");
    return response;
  }

  // ---------------------------------------------------------------------------
  // 7. UNAUTHENTICATED REQUEST TO PROTECTED ROUTE (Default Deny)
  // ---------------------------------------------------------------------------
  if (!hasSession) {
    // If it is an internal API endpoint -> 401 Unauthorized JSON
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          code: "AUTH_REQUIRED",
          message: "يجب تسجيل الدخول للوصول إلى هذه الخدمة.",
        },
        { status: 401 }
      );
    }

    // Direct page access -> Redirect to /auth preserving target destination
    const redirectUrl = new URL("/auth", request.url);
    const destination = pathname + search;
    redirectUrl.searchParams.set("redirectTo", destination);
    return NextResponse.redirect(redirectUrl);
  }

  // ---------------------------------------------------------------------------
  // 8. AUTHENTICATED ACCESS ALLOWED
  // ---------------------------------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
