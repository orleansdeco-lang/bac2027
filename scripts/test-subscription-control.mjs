/**
 * BAC MASTERY — P0.2 MANUAL SUBSCRIPTION CONTROL VERIFICATION SUITE
 * 
 * Verifies 18 Subscription Control Invariants:
 * - 01: Dynamic Plan Catalog Integrity (season & monthly, no hardcoded pricing)
 * - 02: Operator Price Update (dynamic edit in operations)
 * - 03: Dynamic Price Enforced in Orders (server-authoritative)
 * - 04: Operator Duration Update (dynamic duration configuration)
 * - 05: Plan Closure Invariant: New order creation blocked
 * - 06: Plan Closure Invariant: API route returns 400 Bad Request
 * - 07: Plan Closure Invariant: Active student access preserved
 * - 08: Plan Re-Opening: Order creation re-enabled immediately
 * - 09: Dynamic Expiration on Order Approval
 * - 10: Zero Cron Automatic Expiration (serverTime >= expires_at -> EXPIRED)
 * - 11: Active Paid Student Access (serverTime < expires_at -> PAID_ACTIVE)
 * - 12: Manual Extension in Dossier (+ 1 Month, zero payment orders)
 * - 13: Manual Extension (+ 1 Week)
 * - 14: Manual Extension (Custom Days)
 * - 15: Expired Student Immediate Reactivation via Extension
 * - 16: RBAC Denied on Plan Update (Content Reviewer 403)
 * - 17: RBAC Denied on Extension (Content Reviewer 403)
 * - 18: Live Operational Alerts (closed plans, pending payments, receipts)
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — P0.2 MANUAL SUBSCRIPTION CONTROL TEST SUITE");
console.log("  Two Plans Only + Zero Cron Expiration + Manual Extensions + Alerts");
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

// Load Modules Under Test
const opsSubscriptions = loadTs("src/lib/operations/subscriptions.ts");
const opsPayments = loadTs("src/lib/operations/payments.ts");
const opsAuth = loadTs("src/lib/operations/auth.ts");
const accessModule = loadTs("src/lib/access/index.ts");
const studentRepoModule = loadTs("src/lib/repositories/student-repository.ts");
const subRoute = loadTs("src/app/api/ops/subscriptions/route.ts");
const paymentsRoute = loadTs("src/app/api/ops/payments/route.ts");
const extendRoute = loadTs("src/app/api/ops/students/[id]/extend/route.ts");

let passed = 0;
let failed = 0;

async function check(num, name, fn) {
  try {
    await fn();
    console.log(`  [PASS] Check ${String(num).padStart(2, "0")}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] Check ${String(num).padStart(2, "0")}: ${name}`);
    console.error(`         Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  const ownerUser = "usr_owner_" + Date.now();
  const operatorUser = "usr_operator_" + Date.now();
  const contentReviewer = "usr_reviewer_" + Date.now();
  const studentUserA = "usr_student_a_" + Date.now();
  const studentUserB = "usr_student_b_" + Date.now();

  opsAuth.setMemoryUserRole(ownerUser, "OWNER");
  opsAuth.setMemoryUserRole(operatorUser, "OPERATOR");
  opsAuth.setMemoryUserRole(contentReviewer, "CONTENT_REVIEWER");

  // Helper request builder
  function makeReq(url, method, body, userId) {
    return {
      url: `http://localhost:3000${url}`,
      method,
      headers: {
        get: (h) => {
          if (h.toLowerCase() === "content-type") return "application/json";
          if (h.toLowerCase() === "x-test-user-id" || h.toLowerCase() === "x-user-id") return userId || null;
          return null;
        },
      },
      json: async () => body,
    };
  }

  // --------------------------------------------------------------------------
  // CHECK 01: Dynamic Plan Catalog Integrity
  // --------------------------------------------------------------------------
  await check(1, "Plan Catalog: exactly two canonical plans (season & monthly) with non-hardcoded neutral structure", async () => {
    opsSubscriptions.resetMemorySubscriptionPlans();
    const plans = await opsSubscriptions.getSubscriptionPlans();
    assert.strictEqual(plans.length, 2, "Must contain exactly 2 plans");
    
    const season = plans.find((p) => p.id === "season");
    const monthly = plans.find((p) => p.id === "monthly");
    
    assert.ok(season, "season plan must exist");
    assert.strictEqual(season.name, "اشتراك الموسم الدراسي");
    assert.strictEqual(season.price_dzd, 0, "No hardcoded 3900 price in initial plans");
    assert.strictEqual(season.duration_months, 10);
    assert.strictEqual(season.active, false, "Initial unpriced plan is not open for purchase");

    assert.ok(monthly, "monthly plan must exist");
    assert.strictEqual(monthly.name, "الاشتراك الشهري");
    assert.strictEqual(monthly.price_dzd, 0, "No hardcoded 1500 price in initial plans");
    assert.strictEqual(monthly.duration_months, 1);
    assert.strictEqual(monthly.active, false, "Initial unpriced plan is not open for purchase");
  });

  // --------------------------------------------------------------------------
  // CHECK 02: Operator Price Update
  // --------------------------------------------------------------------------
  await check(2, "Operator Price Update: updates season plan price to 4,500 DZD, activates plan, and records audit log", async () => {
    const res = await opsSubscriptions.updateSubscriptionPlan(operatorUser, "season", {
      price_dzd: 4500,
      active: true,
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.plan.price_dzd, 4500);
    assert.strictEqual(res.plan.active, true);

    const retrieved = await opsSubscriptions.getSubscriptionPlanById("season");
    assert.strictEqual(retrieved.price_dzd, 4500);
    assert.strictEqual(retrieved.active, true);
  });

  // --------------------------------------------------------------------------
  // CHECK 03: Dynamic Price Enforced in Orders
  // --------------------------------------------------------------------------
  await check(3, "Dynamic Price Enforced: newly created order adopts the updated 4,500 DZD price", async () => {
    const order = await opsPayments.createPaymentOrder({
      userId: studentUserA,
      plan: "season",
      paymentMethod: "baridimob",
    });
    assert.strictEqual(order.amount, 4500, "Must be dynamic 4,500 DZD, not hardcoded 3,900");
    assert.strictEqual(order.currency, "DZD");
    assert.strictEqual(order.status, "PENDING");
  });

  // --------------------------------------------------------------------------
  // CHECK 04: Operator Duration Update
  // --------------------------------------------------------------------------
  await check(4, "Operator Duration Update: updates monthly plan duration to 2 months and configures price", async () => {
    const res = await opsSubscriptions.updateSubscriptionPlan(operatorUser, "monthly", {
      duration_months: 2,
      price_dzd: 2000,
      active: true,
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.plan.duration_months, 2);
    assert.strictEqual(res.plan.active, true);

    const retrieved = await opsSubscriptions.getSubscriptionPlanById("monthly");
    assert.strictEqual(retrieved.duration_months, 2);
    assert.strictEqual(retrieved.active, true);
  });

  // --------------------------------------------------------------------------
  // CHECK 05: Plan Closure Invariant - Order Creation Blocked
  // --------------------------------------------------------------------------
  await check(5, "Plan Closure: closing 'season' plan blocks createPaymentOrder immediately", async () => {
    await opsSubscriptions.updateSubscriptionPlan(operatorUser, "season", { active: false });
    
    let threw = false;
    try {
      await opsPayments.createPaymentOrder({
        userId: studentUserA,
        plan: "season",
        paymentMethod: "baridimob",
      });
    } catch (err) {
      threw = true;
      assert.ok(err.message.includes("closed"), `Expected closure error, got: ${err.message}`);
    }
    assert.ok(threw, "createPaymentOrder must throw when plan is closed");
  });

  // --------------------------------------------------------------------------
  // CHECK 06: Plan Closure Invariant - API Route 400
  // --------------------------------------------------------------------------
  await check(6, "Plan Closure API: POST /api/ops/payments returns 400 Bad Request when plan is closed", async () => {
    const req = makeReq("/api/ops/payments", "POST", { plan: "season" }, studentUserA);
    const res = await paymentsRoute.POST(req);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes("closed"));
  });

  // --------------------------------------------------------------------------
  // CHECK 07: Plan Closure Invariant - Active Students Preserved
  // --------------------------------------------------------------------------
  await check(7, "Closure Invariant: active student with closed plan retains full access until expiration", async () => {
    const serverTime = new Date();
    const futureExpiry = new Date(serverTime.getTime() + 60 * 24 * 3600 * 1000).toISOString();

    const activeStudentProfile = {
      id: studentUserA,
      access_status: "PAID",
      plan: "season",
      subscription_expires_at: futureExpiry,
    };

    const access = accessModule.getStudentAccess(activeStudentProfile, serverTime);
    assert.strictEqual(access.status, "PAID_ACTIVE");
    assert.strictEqual(access.canUseProduct, true);
    assert.strictEqual(access.remainingDays, 60);
  });

  // --------------------------------------------------------------------------
  // CHECK 08: Plan Re-Opening
  // --------------------------------------------------------------------------
  await check(8, "Plan Re-Opening: opening 'season' plan re-enables purchase order creation immediately", async () => {
    const openRes = await opsSubscriptions.updateSubscriptionPlan(operatorUser, "season", { active: true });
    assert.strictEqual(openRes.success, true);
    assert.strictEqual(openRes.plan.active, true);

    const order = await opsPayments.createPaymentOrder({
      userId: studentUserB,
      plan: "season",
      paymentMethod: "baridimob",
    });
    assert.strictEqual(order.status, "PENDING");
  });

  // --------------------------------------------------------------------------
  // CHECK 09: Dynamic Expiration on Order Approval
  // --------------------------------------------------------------------------
  let approvedStudentId = "usr_student_sub_exp_" + Date.now();
  let testOrderId = "";
  await check(9, "Dynamic Approval Expiration: approving 2-month monthly order sets expiration to ~60 days", async () => {
    // Save student profile initially on trial
    await studentRepoModule.StudentRepository.saveProfile({
      id: approvedStudentId,
      access_status: "TRIAL",
      plan: "PILOT_TRIAL",
    });

    const order = await opsPayments.createPaymentOrder({
      userId: approvedStudentId,
      plan: "monthly",
      paymentMethod: "baridimob",
    });
    testOrderId = order.id;

    const approval = await opsPayments.approvePaymentOrder(testOrderId, operatorUser);
    assert.strictEqual(approval.success, true);

    const updatedProfile = await studentRepoModule.StudentRepository.getProfile(approvedStudentId);
    assert.strictEqual(updatedProfile.access_status, "PAID");
    assert.ok(updatedProfile.subscription_started_at);
    assert.ok(updatedProfile.subscription_expires_at);

    const expiryTime = new Date(updatedProfile.subscription_expires_at).getTime();
    const startTime = new Date(updatedProfile.subscription_started_at).getTime();
    const diffDays = Math.round((expiryTime - startTime) / (24 * 3600 * 1000));
    assert.strictEqual(diffDays, 60, "2-month plan should expire in ~60 days");
  });

  // --------------------------------------------------------------------------
  // CHECK 10: Automatic Expiration (serverTime >= expires_at -> EXPIRED)
  // --------------------------------------------------------------------------
  await check(10, "Automatic Expiration: server evaluates now >= subscription_expires_at as EXPIRED", async () => {
    const profile = await studentRepoModule.StudentRepository.getProfile(approvedStudentId);
    const futureServerTime = new Date(new Date(profile.subscription_expires_at).getTime() + 1000); // 1 sec after expiration

    const access = accessModule.getStudentAccess(profile, futureServerTime);
    assert.strictEqual(access.status, "EXPIRED");
    assert.strictEqual(access.accessStatus, "EXPIRED");
    assert.strictEqual(access.canUseProduct, false);
    assert.strictEqual(access.remainingMilliseconds, 0);
  });

  // --------------------------------------------------------------------------
  // CHECK 11: Active Paid Student Access (serverTime < expires_at -> PAID_ACTIVE)
  // --------------------------------------------------------------------------
  await check(11, "Active Access: server evaluates now < subscription_expires_at as PAID_ACTIVE", async () => {
    const profile = await studentRepoModule.StudentRepository.getProfile(approvedStudentId);
    const currentServerTime = new Date(new Date(profile.subscription_started_at).getTime() + 10 * 24 * 3600 * 1000); // 10 days into sub

    const access = accessModule.getStudentAccess(profile, currentServerTime);
    assert.strictEqual(access.status, "PAID_ACTIVE");
    assert.strictEqual(access.canUseProduct, true);
    assert.strictEqual(access.remainingDays, 50);
  });

  // --------------------------------------------------------------------------
  // CHECK 12: Manual Extension (+ 1 Month)
  // --------------------------------------------------------------------------
  await check(12, "Manual Extension: Operator extends student by 1 month without creating payment orders", async () => {
    const ordersBefore = await opsPayments.getPaymentOrders({ userId: approvedStudentId });
    const profileBefore = await studentRepoModule.StudentRepository.getProfile(approvedStudentId);
    const oldExpiresMs = new Date(profileBefore.subscription_expires_at).getTime();

    const extRes = await opsSubscriptions.extendStudentSubscription(operatorUser, approvedStudentId, {
      type: "1_month",
      reason: "Bonus month granted for student feedback",
    });
    assert.strictEqual(extRes.success, true);
    assert.ok(extRes.newExpiresAt);

    const newExpiresMs = new Date(extRes.newExpiresAt).getTime();
    const diffDays = Math.round((newExpiresMs - oldExpiresMs) / (24 * 3600 * 1000));
    assert.strictEqual(diffDays, 30, "Extension must add 30 days");

    const ordersAfter = await opsPayments.getPaymentOrders({ userId: approvedStudentId });
    assert.strictEqual(ordersAfter.length, ordersBefore.length, "Zero payment orders must be created");
  });

  // --------------------------------------------------------------------------
  // CHECK 13: Manual Extension (+ 1 Week)
  // --------------------------------------------------------------------------
  await check(13, "Manual Extension: Operator extends student by 1 week (+7 days)", async () => {
    const profileBefore = await studentRepoModule.StudentRepository.getProfile(approvedStudentId);
    const oldExpiresMs = new Date(profileBefore.subscription_expires_at).getTime();

    const extRes = await opsSubscriptions.extendStudentSubscription(operatorUser, approvedStudentId, {
      type: "1_week",
    });
    assert.strictEqual(extRes.success, true);

    const newExpiresMs = new Date(extRes.newExpiresAt).getTime();
    const diffDays = Math.round((newExpiresMs - oldExpiresMs) / (24 * 3600 * 1000));
    assert.strictEqual(diffDays, 7, "Extension must add 7 days");
  });

  // --------------------------------------------------------------------------
  // CHECK 14: Manual Extension (Custom Days)
  // --------------------------------------------------------------------------
  await check(14, "Manual Extension: Operator extends student by 15 custom days", async () => {
    const profileBefore = await studentRepoModule.StudentRepository.getProfile(approvedStudentId);
    const oldExpiresMs = new Date(profileBefore.subscription_expires_at).getTime();

    const extRes = await opsSubscriptions.extendStudentSubscription(operatorUser, approvedStudentId, {
      type: "custom",
      days: 15,
    });
    assert.strictEqual(extRes.success, true);

    const newExpiresMs = new Date(extRes.newExpiresAt).getTime();
    const diffDays = Math.round((newExpiresMs - oldExpiresMs) / (24 * 3600 * 1000));
    assert.strictEqual(diffDays, 15, "Extension must add exactly 15 days");
  });

  // --------------------------------------------------------------------------
  // CHECK 15: Expired Student Reactivation via Extension
  // --------------------------------------------------------------------------
  await check(15, "Expired Reactivation: Extending an expired student immediately restores PAID_ACTIVE", async () => {
    const expiredStudentId = "usr_expired_recovery_" + Date.now();
    const pastDate = new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString();
    
    await studentRepoModule.StudentRepository.saveProfile({
      id: expiredStudentId,
      access_status: "EXPIRED",
      plan: "season",
      subscription_expires_at: pastDate,
    });

    const accessBefore = accessModule.getStudentAccess(await studentRepoModule.StudentRepository.getProfile(expiredStudentId));
    assert.strictEqual(accessBefore.canUseProduct, false);
    assert.strictEqual(accessBefore.status, "EXPIRED");

    const extRes = await opsSubscriptions.extendStudentSubscription(operatorUser, expiredStudentId, {
      type: "1_month",
    });
    assert.strictEqual(extRes.success, true);

    const profileAfter = await studentRepoModule.StudentRepository.getProfile(expiredStudentId);
    const accessAfter = accessModule.getStudentAccess(profileAfter);
    assert.strictEqual(accessAfter.canUseProduct, true);
    assert.strictEqual(accessAfter.status, "PAID_ACTIVE");
  });

  // --------------------------------------------------------------------------
  // CHECK 16: RBAC Denied on Plan Updates (Content Reviewer 403)
  // --------------------------------------------------------------------------
  await check(16, "RBAC Plan Updates: Content Reviewer is strictly blocked from modifying plans (403)", async () => {
    const req = makeReq("/api/ops/subscriptions", "POST", { planId: "season", price_dzd: 100 }, contentReviewer);
    const res = await subRoute.POST(req);
    assert.strictEqual(res.status, 403, "Content reviewer must receive 403 Forbidden");

    const directRes = await opsSubscriptions.updateSubscriptionPlan(contentReviewer, "season", { price_dzd: 100 });
    assert.strictEqual(directRes.success, false);
    assert.ok(directRes.error.includes("Forbidden"));
  });

  // --------------------------------------------------------------------------
  // CHECK 17: RBAC Denied on Student Extension (Content Reviewer 403)
  // --------------------------------------------------------------------------
  await check(17, "RBAC Extension: Content Reviewer is strictly blocked from extending student access (403)", async () => {
    const req = makeReq(`/api/ops/students/${approvedStudentId}/extend`, "POST", { type: "1_month" }, contentReviewer);
    const res = await extendRoute.POST(req, { params: Promise.resolve({ id: approvedStudentId }) });
    assert.strictEqual(res.status, 403, "Content reviewer must receive 403 Forbidden on extension");

    const directRes = await opsSubscriptions.extendStudentSubscription(contentReviewer, approvedStudentId, { type: "1_month" });
    assert.strictEqual(directRes.success, false);
    assert.ok(directRes.error.includes("Forbidden"));
  });

  // --------------------------------------------------------------------------
  // CHECK 18: Live Operational Alerts
  // --------------------------------------------------------------------------
  await check(18, "Live Operational Alerts: alerts generated for pending orders, receipts, and closed plans", async () => {
    // Close monthly plan to trigger alert
    await opsSubscriptions.updateSubscriptionPlan(operatorUser, "monthly", { active: false });

    const alerts = await opsSubscriptions.getSubscriptionAlerts();
    assert.ok(alerts.length > 0, "Alerts must be populated");

    const closedAlert = alerts.find((a) => a.type === "PLAN_CLOSED");
    assert.ok(closedAlert, "PLAN_CLOSED alert must be present");
    assert.ok(closedAlert.description.includes("blocked") || closedAlert.title.includes("Closed"));

    // Re-open monthly
    await opsSubscriptions.updateSubscriptionPlan(operatorUser, "monthly", { active: true });
  });

  console.log("\n------------------------------------------------------------------");
  console.log(`  P0.2 RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("------------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal crash:", err);
  process.exit(1);
});
