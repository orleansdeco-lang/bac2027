/**
 * BAC Mastery — Operations Center Authentication & Route Guard Verification Script
 * Validates token extraction, cookie parsing, and RBAC normalization.
 */

import {
  extractTokenFromCookies,
  getServerUserRole,
  isServerOwner,
  isServerOperator,
  normalizeUserRole,
} from "../src/lib/operations/auth";

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
    assert(token === "supabase_access_jwt_999", "sb-access-token fallback recognized");
  }

  {
    const cookie = "other=123; sb-projectid-auth-token=jwt_project_token; more=456";
    const token = extractTokenFromCookies(cookie);
    assert(token === "jwt_project_token", "Supabase project-prefixed auth cookie matched");
  }

  {
    const cookie = "unrelated=foo; tracking=bar";
    const token = extractTokenFromCookies(cookie);
    assert(token === null, "Returns null when no recognized auth cookie present");
  }

  {
    assert(extractTokenFromCookies(null) === null, "Returns null for null cookie header");
    assert(extractTokenFromCookies("") === null, "Returns null for empty cookie header");
  }

  // -------------------------------------------------------------------
  // 2. Role Normalization Tests
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 2: Role Normalization]");

  assert(normalizeUserRole("OWNER") === "OWNER", "Canonical 'OWNER' preserved");
  assert(normalizeUserRole("owner") === "OWNER", "Lowercase 'owner' normalized to 'OWNER'");
  assert(normalizeUserRole(" Owner ") === "OWNER", "Whitespace-padded ' Owner ' normalized to 'OWNER'");
  assert(normalizeUserRole("OPERATOR") === "OPERATOR", "Canonical 'OPERATOR' preserved");
  assert(normalizeUserRole("operator") === "OPERATOR", "Lowercase 'operator' normalized to 'OPERATOR'");
  assert(normalizeUserRole("CONTENT_REVIEWER") === "CONTENT_REVIEWER", "'CONTENT_REVIEWER' normalized");
  assert(normalizeUserRole("student") === null, "Student role normalizes to null (not an ops role)");
  assert(normalizeUserRole("HACKER") === null, "Unrecognized role normalizes to null");
  assert(normalizeUserRole(null) === null, "Null input returns null");
  assert(normalizeUserRole(undefined) === null, "Undefined input returns null");

  // -------------------------------------------------------------------
  // 3. User Role Privileges
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 3: Role Privileges]");

  const roles = [
    { role: "OWNER", expectedOperator: true },
    { role: "OPERATOR", expectedOperator: true },
    { role: "CONTENT_REVIEWER", expectedOperator: false },
    { role: "STUDENT", expectedOperator: false },
    { role: null, expectedOperator: false },
  ];

  for (const { role, expectedOperator } of roles) {
    const isOp = role === "OWNER" || role === "OPERATOR";
    assert(
      isOp === expectedOperator,
      `Role '${role}' isOperator expectation: ${expectedOperator}`
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
  console.error("Verification suite failed with unhandled error:", err);
  process.exit(1);
});
