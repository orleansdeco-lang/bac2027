/**
 * BAC MASTERY — 72-HOUR TRIAL & DYNAMIC PRICING VERIFICATION SUITE
 * 
 * Verifies 14 Critical Commercial & Access Invariants:
 * A. New account → 72h trial
 * B. Existing 48h-era trial → corrected to account_created_at + 72h
 * C. Existing PAID student → unchanged
 * D. Expired trial → no access
 * E. Active trial → access
 * F. Client cannot manipulate expiration
 * G. LocalStorage cannot grant access
 * H. Server time is authoritative
 * I. No hardcoded 3900 DZD
 * J. No hardcoded 1500 DZD
 * K. Operations can configure prices later
 * L. Student cannot modify price
 * M. Student cannot modify plan authority
 * N. Approval still resolves commercial values server-side
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — 72-HOUR TRIAL & DYNAMIC PRICING TEST SUITE");
console.log("  Strict Invariant Enforcement: Access, Expiration & Pricing");
console.log("==================================================================\n");

// Robust TS Transpile Loader
const moduleCache = new Map();
function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath);
  }

  const code = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const m = { exports: {} };
  moduleCache.set(fullPath, m.exports);

  const fn = new Function("exports", "require", "module", result.outputText);
  fn(
    m.exports,
    (reqPath) => {
      if (reqPath === "next/server") {
        return {
          NextResponse: {
            json: (data, init) => ({
              status: init?.status || 200,
              json: async () => data,
            }),
          },
        };
      }
      let target = reqPath;
      if (target.startsWith("@/")) {
        target = path.resolve(target.replace("@/", "src/"));
      } else if (target.startsWith(".")) {
        target = path.resolve(path.dirname(fullPath), target);
      }
      if (fs.existsSync(target + ".ts")) return loadTs(target + ".ts");
      if (fs.existsSync(target + ".tsx")) return loadTs(target + ".tsx");
      if (fs.existsSync(target + "/index.ts")) return loadTs(target + "/index.ts");
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return loadTs(target);
      try {
        return reqPath;
      } catch {
        return {};
      }
    },
    m
  );

  return m.exports;
}

const accessModule = loadTs("src/lib/access/index.ts");
const opsSubscriptions = loadTs("src/lib/operations/subscriptions.ts");
const opsPayments = loadTs("src/lib/operations/payments.ts");
const opsAuth = loadTs("src/lib/operations/auth.ts");
const studentRepoModule = loadTs("src/lib/repositories/student-repository.ts");
const paymentsRoute = loadTs("src/app/api/ops/payments/route.ts");

let passed = 0;
let failed = 0;

async function runTest(tag, description, testFn) {
  try {
    await testFn();
    console.log(`  ✓ [TEST ${tag}] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [TEST ${tag}] FAILED: ${description}`);
    console.error(`    ${err.message}\n`);
    failed++;
  }
}

async function runAll() {
  const serverNow = new Date("2026-09-13T12:00:00.000Z");

  // --------------------------------------------------------------------------
  // TEST A: New account → 72h trial
  // --------------------------------------------------------------------------
  await runTest("A", "New account → exact 72h trial duration anchored to creation timestamp", async () => {
    const createdAt = serverNow.toISOString();
    const expiresAt = accessModule.calculateTrialExpiration(new Date(createdAt));
    const expectedExpiryMs = serverNow.getTime() + 72 * 60 * 60 * 1000;
    
    assert.strictEqual(expiresAt.getTime(), expectedExpiryMs, "Expiration must be exactly createdAt + 72h");
    
    const profile = {
      id: "usr_new_student_1",
      created_at: createdAt,
      trial_started_at: createdAt,
      trial_expires_at: expiresAt.toISOString(),
      access_status: "TRIAL",
      plan: "PILOT_TRIAL",
    };

    const decision = accessModule.getStudentAccess(profile, serverNow);
    assert.strictEqual(decision.status, "TRIAL_ACTIVE");
    assert.strictEqual(decision.canUseProduct, true);
    assert.strictEqual(decision.remainingHours, 72);
  });

  // --------------------------------------------------------------------------
  // TEST B: Existing 48h-era trial → corrected to account_created_at + 72h
  // --------------------------------------------------------------------------
  await runTest("B", "Existing 48h-era trial → corrected to account_created_at + 72h", async () => {
    // Student registered 50 hours ago with 48h trial expiration (which would be 2 hours expired under 48h)
    const registered50hAgo = new Date(serverNow.getTime() - 50 * 60 * 60 * 1000);
    const old48hExpiry = new Date(registered50hAgo.getTime() + 48 * 60 * 60 * 1000); // in the past!

    const legacyProfile = {
      id: "usr_legacy_48h_student",
      created_at: registered50hAgo.toISOString(),
      trial_started_at: registered50hAgo.toISOString(),
      trial_expires_at: old48hExpiry.toISOString(), // old 48h timestamp
      access_status: "TRIAL",
      plan: "PILOT_TRIAL",
    };

    // Under 72h policy: 50h elapsed means 22h remain (ACTIVE)
    const decision = accessModule.getStudentAccess(legacyProfile, serverNow);
    assert.strictEqual(decision.status, "TRIAL_ACTIVE", "Legacy 48h user must be active at 50h elapsed under 72h rule");
    assert.strictEqual(decision.canUseProduct, true);
    assert.strictEqual(decision.remainingHours, 22, "Must have exactly 22 hours remaining");
    
    // Authoritative expiration date must reflect created_at + 72h
    const expected72hExpiryMs = registered50hAgo.getTime() + 72 * 60 * 60 * 1000;
    assert.strictEqual(new Date(decision.trialExpiresAt).getTime(), expected72hExpiryMs);
  });

  // --------------------------------------------------------------------------
  // TEST C: Existing PAID student → unchanged
  // --------------------------------------------------------------------------
  await runTest("C", "Existing PAID student → unchanged (paid status & subscription dates preserved)", async () => {
    const subStarted = new Date(serverNow.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const subExpires = new Date(serverNow.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const paidStudent = {
      id: "usr_paid_student_1",
      created_at: new Date(serverNow.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      access_status: "PAID",
      plan: "season",
      subscription_started_at: subStarted,
      subscription_expires_at: subExpires,
    };

    const decision = accessModule.getStudentAccess(paidStudent, serverNow);
    assert.strictEqual(decision.status, "PAID_ACTIVE");
    assert.strictEqual(decision.canUseProduct, true);
    assert.strictEqual(decision.accessStatus, "PAID");
    assert.strictEqual(decision.subscriptionExpiresAt, subExpires);
    assert.strictEqual(decision.remainingDays, 60);
  });

  // --------------------------------------------------------------------------
  // TEST D: Expired trial → no access
  // --------------------------------------------------------------------------
  await runTest("D", "Expired trial → no access (server time > created_at + 72h)", async () => {
    // Registered 75 hours ago
    const registered75hAgo = new Date(serverNow.getTime() - 75 * 60 * 60 * 1000);
    const profile = {
      id: "usr_expired_student",
      created_at: registered75hAgo.toISOString(),
      trial_started_at: registered75hAgo.toISOString(),
      access_status: "TRIAL",
      plan: "PILOT_TRIAL",
    };

    const decision = accessModule.getStudentAccess(profile, serverNow);
    assert.strictEqual(decision.status, "TRIAL_EXPIRED");
    assert.strictEqual(decision.canUseProduct, false);
    assert.strictEqual(decision.remainingHours, 0);
    assert.strictEqual(decision.remainingMilliseconds, 0);
  });

  // --------------------------------------------------------------------------
  // TEST E: Active trial → access
  // --------------------------------------------------------------------------
  await runTest("E", "Active trial → access (server time < created_at + 72h)", async () => {
    // Registered 10 hours ago
    const registered10hAgo = new Date(serverNow.getTime() - 10 * 60 * 60 * 1000);
    const profile = {
      id: "usr_active_student",
      created_at: registered10hAgo.toISOString(),
      trial_started_at: registered10hAgo.toISOString(),
      access_status: "TRIAL",
      plan: "PILOT_TRIAL",
    };

    const decision = accessModule.getStudentAccess(profile, serverNow);
    assert.strictEqual(decision.status, "TRIAL_ACTIVE");
    assert.strictEqual(decision.canUseProduct, true);
    assert.strictEqual(decision.remainingHours, 62);
  });

  // --------------------------------------------------------------------------
  // TEST F: Client cannot manipulate expiration
  // --------------------------------------------------------------------------
  await runTest("F", "Client cannot manipulate expiration (arbitrary client trial_expires_at clamped to 72h)", async () => {
    // Registered 80 hours ago (should be expired)
    const registered80hAgo = new Date(serverNow.getTime() - 80 * 60 * 60 * 1000);
    // Malicious client sets trial_expires_at to 30 days in the future!
    const tamperedFutureDate = new Date(serverNow.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const tamperedProfile = {
      id: "usr_tamper_attempt",
      created_at: registered80hAgo.toISOString(),
      trial_started_at: registered80hAgo.toISOString(),
      trial_expires_at: tamperedFutureDate, // Forged future date
      access_status: "TRIAL",
      plan: "PILOT_TRIAL",
    };

    const decision = accessModule.getStudentAccess(tamperedProfile, serverNow);
    assert.strictEqual(decision.status, "TRIAL_EXPIRED", "Tampered date must be clamped back to created_at + 72h");
    assert.strictEqual(decision.canUseProduct, false);
  });

  // --------------------------------------------------------------------------
  // TEST G: LocalStorage cannot grant access
  // --------------------------------------------------------------------------
  await runTest("G", "LocalStorage cannot grant access (forged PAID in local draft sanitized)", async () => {
    // Local draft in localStorage claims access_status = "PAID"
    const localDraftProfile = {
      id: "profile_local_123",
      created_at: new Date(serverNow.getTime() - 90 * 60 * 60 * 1000).toISOString(),
      access_status: "PAID", // Forged
      plan: "PAID", // Forged
    };

    // Save profile through repository logic
    await studentRepoModule.StudentRepository.saveProfile(localDraftProfile, "usr_real_server_id");
    const retrieved = await studentRepoModule.StudentRepository.getProfile("usr_real_server_id");

    // If unauthenticated or offline fallback, access_status must not elevate to PAID
    assert.notStrictEqual(retrieved.access_status, "PAID", "Local fallback must never elevate student to PAID without server authority");
  });

  // --------------------------------------------------------------------------
  // TEST H: Server time is authoritative
  // --------------------------------------------------------------------------
  await runTest("H", "Server time is authoritative (client clock manipulation is ineffective)", async () => {
    // Registered 80 hours ago relative to serverNow
    const registered80hAgo = new Date(serverNow.getTime() - 80 * 60 * 60 * 1000);
    const profile = {
      id: "usr_clock_test",
      created_at: registered80hAgo.toISOString(),
      trial_started_at: registered80hAgo.toISOString(),
      access_status: "TRIAL",
      plan: "PILOT_TRIAL",
    };

    // Evaluate against server reference date
    const decision = accessModule.getStudentAccess(profile, serverNow);
    assert.strictEqual(decision.status, "TRIAL_EXPIRED");
    assert.strictEqual(decision.canUseProduct, false);
  });

  // --------------------------------------------------------------------------
  // TEST I & J: No hardcoded 3900 or 1500 DZD
  // --------------------------------------------------------------------------
  await runTest("I & J", "No hardcoded 3900 DZD or 1500 DZD in initial plan catalog or authoritative plans", async () => {
    opsSubscriptions.resetMemorySubscriptionPlans();
    const plans = await opsSubscriptions.getSubscriptionPlans();
    
    for (const p of plans) {
      assert.notStrictEqual(p.price_dzd, 3900, `Plan ${p.id} must not have hardcoded price 3900`);
      assert.notStrictEqual(p.price_dzd, 1500, `Plan ${p.id} must not have hardcoded price 1500`);
      assert.strictEqual(p.price_dzd, 0, `Plan ${p.id} must have neutral price 0 until configured`);
      assert.strictEqual(p.active, false, `Plan ${p.id} must be inactive until operator sets price`);
    }

    const authPlans = opsPayments.AUTHORITATIVE_PLANS;
    assert.strictEqual(authPlans.season.priceDZD, 0, "AUTHORITATIVE_PLANS.season must be 0");
    assert.strictEqual(authPlans.monthly.priceDZD, 0, "AUTHORITATIVE_PLANS.monthly must be 0");
  });

  // --------------------------------------------------------------------------
  // TEST K: Operations can configure prices later
  // --------------------------------------------------------------------------
  await runTest("K", "Operations can configure prices later (updates persisted and reflected)", async () => {
    const operatorId = "usr_ops_lead_" + Date.now();
    opsAuth.setMemoryUserRole(operatorId, "OPERATOR");

    // Operator configures new season price: 5,200 DZD and opens plan
    const updateSeason = await opsSubscriptions.updateSubscriptionPlan(operatorId, "season", {
      price_dzd: 5200,
      active: true,
    });
    assert.strictEqual(updateSeason.success, true);
    assert.strictEqual(updateSeason.plan.price_dzd, 5200);
    assert.strictEqual(updateSeason.plan.active, true);

    // Operator configures new monthly price: 1,800 DZD and opens plan
    const updateMonthly = await opsSubscriptions.updateSubscriptionPlan(operatorId, "monthly", {
      price_dzd: 1800,
      active: true,
    });
    assert.strictEqual(updateMonthly.success, true);
    assert.strictEqual(updateMonthly.plan.price_dzd, 1800);
    assert.strictEqual(updateMonthly.plan.active, true);

    const retrievedSeason = await opsSubscriptions.getSubscriptionPlanById("season");
    assert.strictEqual(retrievedSeason.price_dzd, 5200);

    const retrievedMonthly = await opsSubscriptions.getSubscriptionPlanById("monthly");
    assert.strictEqual(retrievedMonthly.price_dzd, 1800);
  });

  // --------------------------------------------------------------------------
  // TEST L: Student cannot modify price
  // --------------------------------------------------------------------------
  await runTest("L", "Student cannot modify price (forged amounts are blocked or overwritten)", async () => {
    const studentId = "usr_student_attacker_" + Date.now();
    
    // Student attempts to submit forged price 100 DZD via API
    const req = {
      url: "http://localhost:3000/api/ops/payments",
      method: "POST",
      headers: {
        get: (h) => (h.toLowerCase() === "x-test-user-id" ? studentId : "application/json"),
      },
      json: async () => ({
        userId: studentId,
        plan: "season",
        amount: 100.0, // Forged amount
      }),
    };

    const res = await paymentsRoute.POST(req);
    assert.strictEqual(res.status, 400, "Price forgery must return 400 Bad Request");
    const body = await res.json();
    assert.ok(body.error.includes("Price manipulation detected"));
  });

  // --------------------------------------------------------------------------
  // TEST M: Student cannot modify plan authority
  // --------------------------------------------------------------------------
  await runTest("M", "Student cannot modify plan authority (cannot activate closed plans or modify catalog)", async () => {
    const studentId = "usr_student_normal_" + Date.now();
    
    // Normal student attempts to update subscription plan
    const res = await opsSubscriptions.updateSubscriptionPlan(studentId, "season", {
      price_dzd: 10,
      active: true,
    });
    assert.strictEqual(res.success, false, "Student update must be rejected");
    assert.ok(res.error?.includes("Forbidden") || res.error?.includes("finance authorization"));
  });

  // --------------------------------------------------------------------------
  // TEST N: Approval still resolves commercial values server-side
  // --------------------------------------------------------------------------
  await runTest("N", "Approval still resolves commercial values server-side (dynamic duration & status)", async () => {
    const operatorId = "usr_operator_finance_" + Date.now();
    const studentId = "usr_approved_student_" + Date.now();
    opsAuth.setMemoryUserRole(operatorId, "OPERATOR");

    // 1. Student creates legitimate order for 'season'
    const order = await opsPayments.createPaymentOrder({
      userId: studentId,
      plan: "season",
      paymentMethod: "baridimob",
    });
    assert.strictEqual(order.amount, 5200, "Must adopt operator-configured price of 5,200 DZD");
    assert.strictEqual(order.status, "PENDING");

    // 2. Operator approves order
    const approval = await opsPayments.approvePaymentOrder(order.id, operatorId, "Proof verified via BaridiMob receipt");
    assert.strictEqual(approval.success, true);
    assert.strictEqual(approval.order?.status, "APPROVED");

    // 3. Verify student profile elevated dynamically with duration
    const studentProfile = await studentRepoModule.StudentRepository.getProfile(studentId);
    assert.strictEqual(studentProfile.access_status, "PAID");
    assert.strictEqual(studentProfile.plan, "season");
    assert.ok(studentProfile.subscription_started_at);
    assert.ok(studentProfile.subscription_expires_at);

    // Dynamic duration check: season has 10 months duration (~300 days)
    const startedMs = new Date(studentProfile.subscription_started_at).getTime();
    const expiresMs = new Date(studentProfile.subscription_expires_at).getTime();
    const durationDays = Math.round((expiresMs - startedMs) / (1000 * 60 * 60 * 24));
    assert.ok(durationDays >= 280 && durationDays <= 315, `Duration must be ~10 months, got ${durationDays} days`);
  });

  console.log("\n==================================================================");
  console.log(`  VERIFICATION COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log(`  STATUS: ${failed === 0 ? "ALL 14 INVARIANTS CERTIFIED" : "FAILURES DETECTED"}`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error("Suite fatal error:", err);
  process.exit(1);
});
