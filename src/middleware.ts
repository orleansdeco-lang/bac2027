import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware
 * Route guard for /ops operations center.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /ops routes
  if (pathname.startsWith("/ops")) {
    // If request explicitly carries unauthenticated marker or lacks session, allow page-level auth guard to handle gracefully
    // Page layout (OpsLayout) performs rigorous server and client role verification
    const response = NextResponse.next();
    response.headers.set("x-operations-route", "true");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*"],
};
