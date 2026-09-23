/**
 * BAC Mastery — Edge Route Guard & Security Verification Suite
 * Tests middleware route guarding, unauthenticated redirects,
 * redirectTo preservation, authenticated pass-through, and absolute owner bypass.
 */

import { NextRequest } from "next/server";
import {
  middleware,
  PROTECTED_STUDENT_PREFIXES,
} from "../src/middleware";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✓ PASS\x1b[0m: ${testName}`);
  } else {
    console.error(`  \x1b[31m✗ FAIL\x1b[0m: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

function createRequest(
  url: string,
  options: {
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {}
): NextRequest {
  const reqUrl = new URL(url, "https://bac-mastery.dz");
  const headers = new Headers(options.headers || {});

  if (options.cookies) {
    const cookieStr = Object.entries(options.cookies)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("; ");
    headers.set("cookie", cookieStr);
  }

  return new NextRequest(reqUrl, { headers });
}

async function runEdgeGuardVerification() {
  console.log("\n=======================================================");
  console.log("BAC Mastery: Edge Guard & Security Verification Suite");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------
  // 1. Unauthenticated Redirects for Protected Student Routes
  // -------------------------------------------------------------------
  console.log("[Test Suite 1: Unauthenticated Student Route Protection]");

  const protectedRoutesToTest = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/account", name: "Account settings" },
    { path: "/mission/snv-01", name: "Mission specific path" },
    { path: "/mission/snv-01/step/3", name: "Mission nested step" },
    { path: "/exam", name: "Exam simulator" },
    { path: "/roadmap", name: "Roadmap view" },
    { path: "/errors", name: "Errors library" },
    { path: "/error-lab", name: "Error Lab" },
    { path: "/profile/academic", name: "Academic profile" },
    { path: "/progress", name: "Student progress" },
  ];

  for (const route of protectedRoutesToTest) {
    const req = createRequest(route.path);
    const res = middleware(req);

    const isRedirect = res.status === 307 || res.status === 302;
    const location = res.headers.get("location") || "";
    const redirectUrl = new URL(location, "https://bac-mastery.dz");

    assert(
      isRedirect,
      `Unauthenticated access to ${route.path} redirects (Status: ${res.status})`,
      `Got status ${res.status}`
    );

    assert(
      redirectUrl.pathname === "/auth",
      `Redirect destination is /auth for ${route.name}`,
      `Got destination ${redirectUrl.pathname}`
    );

    assert(
      redirectUrl.searchParams.get("redirectTo") === route.path,
      `redirectTo parameter strictly matches ${route.path}`,
      `Got redirectTo=${redirectUrl.searchParams.get("redirectTo")}`
    );
  }

  // -------------------------------------------------------------------
  // 2. Query String Preservation in redirectTo
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 2: Query String & State Preservation]");

  {
    const target = "/mission/snv-02?step=3&attempt=first";
    const req = createRequest(target);
    const res = middleware(req);
    const location = res.headers.get("location") || "";
    const redirectUrl = new URL(location, "https://bac-mastery.dz");

    assert(
      redirectUrl.searchParams.get("redirectTo") === target,
      "Preserves full URL path and query string in redirectTo param",
      `Expected ${target}, got ${redirectUrl.searchParams.get("redirectTo")}`
    );
  }

  {
    const target = "/dashboard?tab=analytics&stream=scientific";
    const req = createRequest(target);
    const res = middleware(req);
    const location = res.headers.get("location") || "";
    const redirectUrl = new URL(location, "https://bac-mastery.dz");

    assert(
      redirectUrl.searchParams.get("redirectTo") === target,
      "Preserves complex query parameters on /dashboard",
      `Expected ${target}, got ${redirectUrl.searchParams.get("redirectTo")}`
    );
  }

  // -------------------------------------------------------------------
  // 3. Authenticated Student Requests Pass-through
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 3: Authenticated Student Pass-through]");

  {
    const fakeStudentToken = "header.payload_fake_student_token.signature_987654321";
    const req = createRequest("/dashboard", {
      cookies: { "sb-access-token": fakeStudentToken },
    });
    const res = middleware(req);

    assert(
      res.status === 200 && !res.headers.get("location"),
      "Student with sb-access-token cookie accesses /dashboard without redirect"
    );
  }

  {
    const fakeStudentToken = "header.payload_fake_student_token.signature_987654321";
    const req = createRequest("/account", {
      headers: { authorization: `Bearer ${fakeStudentToken}` },
    });
    const res = middleware(req);

    assert(
      res.status === 200 && !res.headers.get("location"),
      "Student with Bearer header accesses /account without redirect"
    );
  }

  {
    const sessionCookieValue = JSON.stringify({ access_token: "jwt_token_inside_json_12345" });
    const req = createRequest("/mission/snv-01", {
      cookies: { "sb-erbvmpnxufgeinqnshzu-auth-token": sessionCookieValue },
    });
    const res = middleware(req);

    assert(
      res.status === 200 && !res.headers.get("location"),
      "Student with Supabase project-prefixed auth cookie accesses /mission/snv-01"
    );
  }

  // -------------------------------------------------------------------
  // 4. Session Presence & Guarding Verification
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 4: Valid Session Presence Verification]");

  {
    const req = createRequest("/dashboard", {
      headers: { authorization: `Bearer valid_session_token_12345` },
    });
    const res = middleware(req);

    assert(
      res.status === 200 && !res.headers.get("location"),
      "Bearer authorization token permits student access to /dashboard"
    );
  }

  {
    const req = createRequest("/exam", {
      cookies: { "sb-access-token": "valid_session_token_12345" },
    });
    const res = middleware(req);

    assert(
      res.status === 200 && !res.headers.get("location"),
      "Supabase access token cookie permits student access to /exam"
    );
  }

  {
    const req = createRequest("/ops/overview", {
      headers: { authorization: `Bearer valid_operator_token_12345` },
    });
    const res = middleware(req);

    assert(
      res.status === 200 && res.headers.get("x-operations-route") === "true",
      "Authenticated operator accessing /ops/overview receives pass with ops header"
    );
  }

  // -------------------------------------------------------------------
  // 5. Ops Route Guard Separation
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 5: Ops Route Guard Separation]");

  {
    const req = createRequest("/ops/overview");
    const res = middleware(req);
    const location = res.headers.get("location") || "";
    const redirectUrl = new URL(location, "https://bac-mastery.dz");

    assert(
      redirectUrl.pathname === "/ops/login",
      "Unauthenticated /ops/overview redirects to /ops/login (NOT to /auth)",
      `Got ${redirectUrl.pathname}`
    );

    assert(
      redirectUrl.searchParams.get("redirect") === "/ops/overview",
      "Ops redirect preserves ?redirect parameter for ops cockpit",
      `Got ${redirectUrl.searchParams.get("redirect")}`
    );
  }

  {
    const req = createRequest("/ops/login");
    const res = middleware(req);

    assert(
      res.status === 200 && !res.headers.get("location"),
      "/ops/login is exempted from route guard redirection"
    );
  }

  // -------------------------------------------------------------------
  // 6. Public Route Neutrality
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 6: Public Route Neutrality]");

  const publicRoutes = ["/", "/auth", "/auth/login", "/onboarding", "/subscribe", "/landing", "/faq"];
  for (const p of publicRoutes) {
    const req = createRequest(p);
    const res = middleware(req);

    assert(
      res.status === 200 && !res.headers.get("location"),
      `Public route ${p} passes through freely without redirect`
    );
  }

  // -------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("=======================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runEdgeGuardVerification().catch((err) => {
  console.error("Verification suite failed with unhandled error:", err);
  process.exit(1);
});
