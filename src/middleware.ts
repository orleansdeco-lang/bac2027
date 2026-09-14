import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Authoritative Absolute Owner Credentials
 */
const OWNER_EMAIL = "azinox27@gmail.com";
const OWNER_UUID = "7f7f704e-d9f1-4edf-9952-591f41fc0c55";

/**
 * Checks if a parsed object corresponds to the Absolute Owner
 */
function isOwnerPayload(payload: any): boolean {
  if (!payload || typeof payload !== "object") return false;
  const email = (payload.email || payload.user_metadata?.email || "")?.toLowerCase();
  const sub = (payload.sub || payload.id || "")?.toLowerCase();
  return email === OWNER_EMAIL.toLowerCase() || sub === OWNER_UUID.toLowerCase();
}

/**
 * Inspects a token, cookie value, or JSON payload to check for Absolute Owner credentials
 */
function checkIsOwner(raw: string | undefined | null): boolean {
  if (!raw) return false;

  // 1. Direct match or substring in raw cookie/token
  const lower = raw.toLowerCase();
  if (lower.includes(OWNER_EMAIL.toLowerCase()) || lower.includes(OWNER_UUID.toLowerCase())) {
    return true;
  }

  // 2. Try parsing as JSON (e.g. Supabase session array, user object)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed[0]) {
      if (checkIsOwner(String(parsed[0]))) return true;
    }
    if (isOwnerPayload(parsed)) return true;
    if (parsed.access_token && checkIsOwner(String(parsed.access_token))) return true;
    if (parsed.user && isOwnerPayload(parsed.user)) return true;
  } catch {}

  // 3. Try decoding JWT payload (header.payload.signature)
  try {
    const parts = raw.split(".");
    if (parts.length >= 2) {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decodedJson = atob(base64);
      const payload = JSON.parse(decodedJson);
      if (isOwnerPayload(payload)) return true;
    }
  } catch {}

  return false;
}

/**
 * Next.js Edge Middleware
 * Route guard and immediate pass-through for Absolute Owner on /ops routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /ops operations center routes
  if (pathname.startsWith("/ops")) {
    // 1. Check Authorization header
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (authHeader && checkIsOwner(authHeader.replace(/^Bearer\s+/i, ""))) {
      const response = NextResponse.next();
      response.headers.set("x-operations-route", "true");
      response.headers.set("x-operations-owner", "true");
      response.headers.set("x-operations-role", "OWNER");
      return response;
    }

    // 2. Check cookies (ops_auth_token, sb-access-token, sb-*-auth-token, etc.)
    const allCookies = request.cookies.getAll();
    for (const cookie of allCookies) {
      if (checkIsOwner(cookie.value)) {
        const response = NextResponse.next();
        response.headers.set("x-operations-route", "true");
        response.headers.set("x-operations-owner", "true");
        response.headers.set("x-operations-role", "OWNER");
        return response;
      }
    }

    // 3. General /ops route pass-through: allow OpsLayout and API routes to handle authentication gracefully
    const response = NextResponse.next();
    response.headers.set("x-operations-route", "true");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*"],
};
