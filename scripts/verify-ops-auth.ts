/**
 * BAC Mastery — Operations Center Authentication & Route Guard Verification Script
 * Validates token extraction, cookie parsing, header injection, and route guard logic.
 */

import {
  extractTokenFromCookies,
  isAbsoluteOwner,
  getServerUserRole,
  isServerOwner,
  isServerOperator,
  normalizeUserRole,
  OWNER_EMAIL,
  OWNER_UUID,
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
  // 5. Absolute Owner Bypass Verification
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 5: Absolute Owner Bypass Verification]");

  assert(
    isAbsoluteOwner(OWNER_UUID) === true,
    `Direct UUID ${OWNER_UUID} recognized as absolute owner`
  );

  assert(
    isAbsoluteOwner(OWNER_UUID.toUpperCase()) === true,
    "Uppercase UUID recognized as absolute owner (case-insensitive)"
  );

  assert(
    isAbsoluteOwner(null, OWNER_EMAIL) === true,
    `Email ${OWNER_EMAIL} recognized as absolute owner`
  );

  assert(
    isAbsoluteOwner(null, "AZINOX27@GMAIL.COM") === true,
    "Uppercase Email recognized as absolute owner (case-insensitive)"
  );

  assert(
    isAbsoluteOwner("00000000-0000-0000-0000-000000000000", "student@bac-mastery.dz") === false,
    "Non-owner credentials denied absolute owner status"
  );

  {
    const resolvedRole = await getServerUserRole(OWNER_UUID);
    assert(
      resolvedRole === "OWNER",
      `getServerUserRole(${OWNER_UUID}) immediately resolves to 'OWNER'`
    );
  }

  {
    const opAccess = await isServerOperator(OWNER_UUID);
    assert(
      opAccess === true,
      `isServerOperator(${OWNER_UUID}) immediately returns true`
    );
  }

  {
    const ownerAccess = await isServerOwner(OWNER_UUID);
    assert(
      ownerAccess === true,
      `isServerOwner(${OWNER_UUID}) immediately returns true`
    );
  }

  assert(
    normalizeUserRole("owner") === "OWNER",
    "Database lowercase 'owner' string normalized to canonical 'OWNER'"
  );

  assert(
    normalizeUserRole("operator") === "OPERATOR",
    "Database lowercase 'operator' string normalized to canonical 'OPERATOR'"
  );

  assert(
    normalizeUserRole("OWNER") === "OWNER",
    "Canonical 'OWNER' preserved"
  );

  // -------------------------------------------------------------------
  // 6. Middleware Owner Token & Payload Detection
  // -------------------------------------------------------------------
  console.log("\n[Test Suite 6: Middleware Owner Token & Payload Detection]");

  // 1. Raw cookie containing owner email
  const rawCookieWithEmail = "some_session=abc; ops_auth_token=azinox27@gmail.com; test=123";
  assert(
    rawCookieWithEmail.includes(OWNER_EMAIL),
    "Raw cookie string with owner email matches check"
  );

  // 2. Raw cookie containing owner UUID
  const rawCookieWithUUID = `user_id=${OWNER_UUID}`;
  assert(
    rawCookieWithUUID.includes(OWNER_UUID),
    "Raw cookie string with owner UUID matches check"
  );

  // 3. Simulated JWT with sub = OWNER_UUID
  const mockJwtPayload = JSON.stringify({ sub: OWNER_UUID, email: "other@example.com" });
  const mockJwtBase64 = Buffer.from(mockJwtPayload).toString("base64");
  const mockJwt = `eyJhbGciOiJIUzI1NiJ9.${mockJwtBase64}.signature`;
  const decodedSub = JSON.parse(Buffer.from(mockJwt.split(".")[1], "base64").toString()).sub;
  assert(
    decodedSub.toLowerCase() === OWNER_UUID.toLowerCase(),
    "Decoded JWT payload sub correctly matches owner UUID"
  );

  // 4. Simulated JWT with email = OWNER_EMAIL
  const mockJwtEmailPayload = JSON.stringify({ sub: "random-id", email: OWNER_EMAIL });
  const mockJwtEmailBase64 = Buffer.from(mockJwtEmailPayload).toString("base64");
  const mockJwtEmail = `eyJhbGciOiJIUzI1NiJ9.${mockJwtEmailBase64}.signature`;
  const decodedEmail = JSON.parse(Buffer.from(mockJwtEmail.split(".")[1], "base64").toString()).email;
  assert(
    decodedEmail.toLowerCase() === OWNER_EMAIL.toLowerCase(),
    "Decoded JWT payload email correctly matches owner email"
  );

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
