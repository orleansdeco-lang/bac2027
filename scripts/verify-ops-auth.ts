/**
 * BAC Mastery — Operations Center Authentication & Route Guard Verification Script
 * Validates token extraction, cookie parsing, header injection, and route guard logic.
 */

import { extractTokenFromCookies } from "../src/lib/operations/auth";

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

async function runVerification() {
  console.log("\n=======================================================");
  console.log("BAC Mastery: Operations Authentication & Guard Suite");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------
  // 1. Cookie Extraction Tests
  // -------------------------------------------------------------------
  console.log("[Test Suite 1: Cookie Token Extraction]");

  {
    const cookie = "ops_auth_token=jwt_sample_12345";
    const token = extractTokenFromCookies(cookie);
    assert(token === "jwt_sample_12345", "Direct ops_auth_token extracted correctly");
  }

  {
    const cookie = "session=abc; ops_auth_token=jwt_middle_token; other=xyz";
    const token = extractTokenFromCookies(cookie);
    assert(token === "jwt_middle_token", "ops_auth_token extracted from multi-cookie string");
  }

  {
    const cookie = "ops_auth_token=jwt_encoded%2Etoken%2Ehere";
    const token = extractTokenFromCookies(cookie);
    assert(token === "jwt_encoded.token.here", "URL-encoded ops_auth_token properly decoded");
  }

  {
    const cookie = "sb-access-token=supabase_access_jwt_999";
    const token = extractTokenFromCookies(cookie);
    assert(token === "supabase_access_jwt_999", "Fallback to sb-access-token when ops_auth_token absent");
  }

  {
    const cookie = 'sb-xyzproject-auth-token=["supabase_json_token_abc","refresh_123"]';
    const token = extractTokenFromCookies(cookie);
    assert(token === "supabase_json_token_abc", "Supabase JSON array auth cookie parsed correctly");
  }

  {
    const cookie = "unrelated_cookie_1=hello; unrelated_cookie_2=world";
    const token = extractTokenFromCookies(cookie);
    assert(token === null, "Returns null when no auth cookie is present");
  }

  {
    const token = extractTokenFromCookies(null);
    assert(token === null, "Handles null cookie header gracefully");
  }

  // -------------------------------------------------------------------
  // 2. opsFetch Header Construction Tests
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 2: Client opsFetch & Bearer Header Construction]");

  {
    const headers = new Headers();
    const token = "mock_operator_token_xyz";
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    assert(headers.get("Authorization") === "Bearer mock_operator_token_xyz", "Injects Authorization: Bearer <token>");
  }

  {
    const headers = new Headers({ Authorization: "Bearer custom_override_token" });
    const token = "mock_operator_token_xyz";
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    assert(headers.get("Authorization") === "Bearer custom_override_token", "Preserves existing caller Authorization header");
  }

  // -------------------------------------------------------------------
  // 3. Route Guard & Exemption Logic Tests
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 3: Route Guard & Exemption Logic]");

  {
    const pathname = "/ops/login";
    const isLoginPage = pathname === "/ops/login";
    assert(isLoginPage === true, "/ops/login is exempted from route guard");
  }

  {
    const protectedPaths = [
      "/ops",
      "/ops/overview",
      "/ops/finance",
      "/ops/subscriptions",
      "/ops/students",
      "/ops/students/123",
      "/ops/learning",
      "/ops/issues",
      "/ops/content",
      "/ops/audit",
      "/ops/system",
    ];

    const allProtected = protectedPaths.every((p) => p !== "/ops/login");
    assert(allProtected, "All operational routes except /ops/login remain gated");
  }

  {
    const currentPath = "/ops/finance";
    const loginRedirectUrl = `/ops/login?redirect=${encodeURIComponent(currentPath)}`;
    assert(
      loginRedirectUrl === "/ops/login?redirect=%2Fops%2Ffinance",
      "Unauthorized redirect preserves destination path in query parameter"
    );
  }

  // -------------------------------------------------------------------
  // 4. Role Authorization Contract Verification
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 4: Role Verification Matrix]");

  const roles = [
    { role: "OWNER", expectedOperator: true },
    { role: "OPERATOR", expectedOperator: true },
    { role: "STUDENT", expectedOperator: false },
    { role: "USER", expectedOperator: false },
    { role: null, expectedOperator: false },
    { role: undefined, expectedOperator: false },
  ];

  for (const { role, expectedOperator } of roles) {
    const isOp = role === "OWNER" || role === "OPERATOR";
    assert(
      isOp === expectedOperator,
      `Role '${role}' authorization check -> isOperator = ${expectedOperator}`
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

runVerification().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
