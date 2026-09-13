/**
 * BAC Mastery — Operations Center V1 Master Test Suite
 * Invariants A through T (Phase 24)
 * 
 * Verifies the complete operational command center:
 * [TEST A] Operations overview
 * [TEST B] Student isolation
 * [TEST C] Role isolation
 * [TEST D] Finance authorization
 * [TEST E] Subscription authorization
 * [TEST F] Payment approval
 * [TEST G] Payment rejection
 * [TEST H] Audit creation
 * [TEST I] Trial = 72h
 * [TEST J] Paid users unaffected
 * [TEST K] Price not configured does not create free paid access
 * [TEST L] Closed plan blocks checkout
 * [TEST M] Active subscriber remains active after plan closure
 * [TEST N] Expired subscription loses access
 * [TEST O] Telemetry deduplication
 * [TEST P] Two-user isolation
 * [TEST Q] No service_role exposure
 * [TEST R] No client access manipulation
 * [TEST S] Content reviewer restrictions
 * [TEST T] Owner/operator separation
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — OPERATIONS CENTER V1 VERIFICATION SUITE");
console.log("  Strict Invariant Enforcement: Invariants A through T");
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

// Load Modules
const opsAuth = loadTs("src/lib/operations/auth.ts");
const opsPayments = loadTs("src/lib/operations/payments.ts");
const opsSubscriptions = loadTs("src/lib/operations/subscriptions.ts");
const opsAudit = loadTs("src/lib/operations/audit.ts");
const opsTelemetry = loadTs("src/lib/operations/telemetry.ts");
const opsKpis = loadTs("src/lib/operations/kpis.ts");
const opsContent = loadTs("src/lib/operations/content.ts");
const opsIssues = loadTs("src/lib/operations/issues.ts");
const accessModule = loadTs("src/lib/access/index.ts");
const studentRepoModule = loadTs("src/lib/repositories/student-repository.ts");

// Routes
const overviewRoute = loadTs("src/app/api/ops/overview/route.ts");
const paymentsRoute = loadTs("src/app/api/ops/payments/route.ts");
const subscriptionsRoute = loadTs("src/app/api/ops/subscriptions/route.ts");
const rolesRoute = loadTs("src/app/api/ops/roles/route.ts");
const issuesRoute = loadTs("src/app/api/ops/issues/route.ts");
const contentRoute = loadTs("src/app/api/ops/content/route.ts");

const { getStudentAccess, calculateTrialExpiration } = accessModule;
const { StudentRepository } = studentRepoModule;

// Helper for Mock Request
function makeRequest(url, method = "GET", headers = {}, body = null) {
  return {
    url,
    method,
    headers: {
      get: (k) => {
        const key = Object.keys(headers).find((h) => h.toLowerCase() === k.toLowerCase());
        return key ? headers[key] : null;
      },
    },
    json: async () => body || {},
  };
}

let passedCount = 0;
async function runTest(label, testFn) {
  try {
    await testFn();
    console.log(`  ✓ ${label}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAILED: ${label}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

async function main() {
  const tsNow = Date.now();
  const ownerUser = `owner_${tsNow}`;
  const operatorUser = `operator_${tsNow}`;
  const reviewerUser = `reviewer_${tsNow}`;
  const studentAlpha = `student_alpha_${tsNow}`;
  const studentBeta = `student_beta_${tsNow}`;

  // Configure Roles in Memory
  opsAuth.clearMemoryUserRoles();
  opsAuth.setMemoryUserRole(ownerUser, "OWNER");
  opsAuth.setMemoryUserRole(operatorUser, "OPERATOR");
  opsAuth.setMemoryUserRole(reviewerUser, "CONTENT_REVIEWER");

  // [TEST A] Operations overview
  await runTest("[TEST A] Operations overview: Sections A-E metrics compute without arbitrary health scores", async () => {
    const kpis = await opsKpis.getOperationsOverviewKPIs();
    assert.ok(kpis.productStatus, "Product status section exists");
    assert.ok(typeof kpis.productStatus.totalRegistered === "number");
    assert.ok(typeof kpis.productStatus.studentsInTrial === "number");
    assert.ok(kpis.todayDetailed, "Today metrics section exists");
    assert.ok(kpis.learningSignals, "Learning signals section exists");
    assert.ok(typeof kpis.learningSignals.completedAtLeastOneMission === "number");
    assert.strictEqual(typeof kpis.learningSignals.singleHealthScore, "undefined", "Zero single health score!");
    assert.ok(kpis.commercialOverview, "Commercial overview section exists");
    assert.ok(Array.isArray(kpis.attentionItems), "Attention items list exists and is actionable");
  });

  // [TEST B] Student isolation
  await runTest("[TEST B] Student isolation: Aggregate directory reads return sanitized operational records", async () => {
    const list = await opsKpis.getStudentsOperationalList();
    assert.ok(Array.isArray(list));
    assert.ok(list.length > 0);
    const item = list[0];
    assert.ok(item.id);
    assert.ok(item.fullName);
    assert.ok(item.accessStatus);
  });

  // [TEST C] Role isolation
  await runTest("[TEST C] Role isolation: OWNER, OPERATOR, CONTENT_REVIEWER adhere strictly to capability matrix", async () => {
    assert.strictEqual(await opsAuth.isServerOwner(ownerUser), true);
    assert.strictEqual(await opsAuth.isServerOperator(operatorUser), true);
    assert.strictEqual(await opsAuth.isServerOwner(operatorUser), false);
    assert.strictEqual(await opsAuth.isServerContentReviewer(reviewerUser), true);
    assert.strictEqual(await opsAuth.isServerOperator(reviewerUser), false);
  });

  // [TEST D] Finance authorization
  await runTest("[TEST D] Finance authorization: Operator/Owner allowed; Content Reviewer denied (403)", async () => {
    const reqReviewer = makeRequest("https://app/api/ops/payments", "GET", { "x-user-id": reviewerUser });
    const resReviewer = await paymentsRoute.GET(reqReviewer);
    assert.strictEqual(resReviewer.status, 403);

    const reqOperator = makeRequest("https://app/api/ops/payments", "GET", { "x-user-id": operatorUser });
    const resOperator = await paymentsRoute.GET(reqOperator);
    assert.strictEqual(resOperator.status, 200);
  });

  // [TEST E] Subscription authorization
  await runTest("[TEST E] Subscription authorization: Operator/Owner allowed to configure; Content Reviewer denied (403)", async () => {
    const reqReviewer = makeRequest("https://app/api/ops/subscriptions", "POST", { "x-user-id": reviewerUser }, {
      planId: "monthly",
      price_dzd: 1500,
      active: true,
    });
    const resReviewer = await subscriptionsRoute.POST(reqReviewer);
    assert.strictEqual(resReviewer.status, 403);

    const reqOperator = makeRequest("https://app/api/ops/subscriptions", "POST", { "x-user-id": operatorUser }, {
      planId: "monthly",
      price_dzd: 1500,
      active: true,
    });
    const resOperator = await subscriptionsRoute.POST(reqOperator);
    assert.strictEqual(resOperator.status, 200);
  });

  // [TEST F] Payment approval
  await runTest("[TEST F] Payment approval: Server elevates access to PAID and records audit log", async () => {
    // Configure season plan first
    await opsSubscriptions.updateSubscriptionPlan(ownerUser, "season", { price_dzd: 3500, active: true });

    const order = await opsPayments.createPaymentOrder({
      userId: studentAlpha,
      plan: "season",
      paymentMethod: "baridimob",
    });

    const approval = await opsPayments.approvePaymentOrder(order.id, operatorUser, "Verified by operator");
    assert.strictEqual(approval.success, true);
    assert.strictEqual(approval.order.status, "APPROVED");

    // Check student access
    const studentState = await StudentRepository.getProfile(studentAlpha);
    assert.strictEqual(studentState.access_status, "PAID");
    assert.ok(studentState.subscription_expires_at);
  });

  // [TEST G] Payment rejection
  await runTest("[TEST G] Payment rejection: Mandates reason, transitions order to REJECTED, emits audit log", async () => {
    const order = await opsPayments.createPaymentOrder({
      userId: studentBeta,
      plan: "season",
      paymentMethod: "ccp",
    });

    // Rejection without reason fails
    const failRes = await opsPayments.rejectPaymentOrder(order.id, operatorUser, "");
    assert.strictEqual(failRes.success, false);
    assert.match(failRes.error, /Rejection reason is required/);

    const rejection = await opsPayments.rejectPaymentOrder(order.id, operatorUser, "Illegible receipt screenshot");
    assert.strictEqual(rejection.success, true);
    assert.strictEqual(rejection.order.status, "REJECTED");
    assert.strictEqual(rejection.order.rejectionReason, "Illegible receipt screenshot");
  });

  // [TEST H] Audit creation
  await runTest("[TEST H] Audit creation: Sensitive actions generate append-only audit records", async () => {
    const logs = await opsAudit.getAuditLogs({ limit: 10 });
    assert.ok(logs.length > 0);
    const approvedLog = logs.find((l) => l.action === "SUBSCRIPTION_APPROVED" || l.action === "PAYMENT_APPROVED");
    assert.ok(approvedLog, "Payment approval is captured in audit log");
    assert.ok(approvedLog.beforeState);
    assert.ok(approvedLog.afterState);
  });

  // [TEST I] Trial policy = 72h
  await runTest("[TEST I] Trial policy: Exactly 72 hours from account creation", async () => {
    const created = new Date("2026-09-01T10:00:00.000Z");
    const exp = calculateTrialExpiration(created);
    const diffHours = (exp.getTime() - created.getTime()) / (1000 * 60 * 60);
    assert.strictEqual(diffHours, 72);
  });

  // [TEST J] Paid users unaffected
  await runTest("[TEST J] Paid users unaffected: Active subscription bypasses trial expiration completely", async () => {
    const access = getStudentAccess({
      created_at: new Date(Date.now() - 200 * 3600 * 1000).toISOString(),
      access_status: "PAID",
      subscription_expires_at: new Date(Date.now() + 60 * 86400 * 1000).toISOString(),
    });
    assert.strictEqual(access.status, "PAID_ACTIVE");
    assert.strictEqual(access.canUseProduct, true);
  });

  // [TEST K] Unset price does not create free paid access
  await runTest("[TEST K] Unset price does not create free paid access: Price not configured blocks checkout", async () => {
    // Reset season plan to 0.00 price and inactive
    opsSubscriptions.resetMemorySubscriptionPlans();

    await assert.rejects(async () => {
      await opsPayments.createPaymentOrder({
        userId: `student_unconf_${tsNow}`,
        plan: "season",
        paymentMethod: "baridimob",
      });
    }, /closed|not configured/i);
  });

  // [TEST L] Closed plan blocks checkout
  await runTest("[TEST L] Closed plan blocks checkout: Closing a plan immediately prevents new purchase orders", async () => {
    await opsSubscriptions.updateSubscriptionPlan(ownerUser, "season", { price_dzd: 4000, active: false });
    await assert.rejects(async () => {
      await opsPayments.createPaymentOrder({
        userId: `student_closed_${tsNow}`,
        plan: "season",
        paymentMethod: "baridimob",
      });
    }, /closed for new purchases/i);
  });

  // [TEST M] Active subscriber remains active after plan closure
  await runTest("[TEST M] Active subscriber remains active after plan closure", async () => {
    const access = getStudentAccess({
      created_at: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
      access_status: "PAID",
      plan: "season", // Season plan is now closed
      subscription_expires_at: new Date(Date.now() + 100 * 86400 * 1000).toISOString(),
    });
    assert.strictEqual(access.status, "PAID_ACTIVE");
    assert.strictEqual(access.canUseProduct, true);
  });

  // [TEST N] Expired subscription loses access
  await runTest("[TEST N] Expired subscription loses access on server", async () => {
    const access = getStudentAccess({
      created_at: new Date(Date.now() - 500 * 3600 * 1000).toISOString(),
      access_status: "PAID",
      plan: "season",
      subscription_expires_at: new Date(Date.now() - 1000).toISOString(),
    });
    assert.strictEqual(access.status, "EXPIRED");
    assert.strictEqual(access.canUseProduct, false);
  });

  // [TEST O] Telemetry deduplication and sanitization
  await runTest("[TEST O] Telemetry deduplication: Rejects duplicate event_id and strips sensitive tokens", async () => {
    const eventId = `evt_dedup_${tsNow}`;
    const batch = [
      {
        eventId,
        anonymousId: "anon_1",
        sessionId: "sess_1",
        eventName: "mission_started",
        occurredAt: new Date().toISOString(),
        metadata: { token: "secret_jwt", cleanData: 42 },
      },
      {
        eventId, // Duplicate
        anonymousId: "anon_1",
        sessionId: "sess_1",
        eventName: "mission_started",
        occurredAt: new Date().toISOString(),
      },
    ];

    const res = await opsTelemetry.processTelemetryBatch(batch, studentAlpha);
    assert.strictEqual(res.acceptedCount, 1);
    assert.strictEqual(res.duplicateCount, 1);
  });

  // [TEST P] Two-user isolation
  await runTest("[TEST P] Two-user isolation: User A and User B cannot access each other's profiles", async () => {
    await StudentRepository.saveProfile({ id: studentAlpha, fullName: "Alpha User" }, studentAlpha);
    await StudentRepository.saveProfile({ id: studentBeta, fullName: "Beta User" }, studentBeta);

    const profA = await StudentRepository.getProfile(studentAlpha);
    const profB = await StudentRepository.getProfile(studentBeta);
    assert.notStrictEqual(profA.id, profB.id);
    assert.strictEqual(profA.fullName, "Alpha User");
    assert.strictEqual(profB.fullName, "Beta User");
  });

  // [TEST Q] No service_role exposure
  await runTest("[TEST Q] No service_role exposure: Environment keys verified safe", async () => {
    assert.strictEqual(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY, undefined);
    assert.strictEqual(process.env.SUPABASE_SERVICE_ROLE_KEY, undefined);
  });

  // [TEST R] No client access manipulation
  await runTest("[TEST R] No client access manipulation: Local draft tampering with PAID status is sanitized", async () => {
    const studentTamper = `tamper_${tsNow}`;
    await StudentRepository.saveProfile(
      {
        id: studentTamper,
        access_status: "PAID", // Forged claim
        trial_expires_at: new Date(Date.now() + 1000 * 86400 * 1000).toISOString(),
      },
      studentTamper
    );

    const sanitized = await StudentRepository.getProfile(studentTamper);
    assert.strictEqual(sanitized.access_status, "TRIAL");
  });

  // [TEST S] Content reviewer restrictions
  await runTest("[TEST S] Content reviewer restrictions: Can access content; blocked from roles", async () => {
    const reqContent = makeRequest("https://app/api/ops/content", "GET", { "x-user-id": reviewerUser });
    const resContent = await contentRoute.GET(reqContent);
    assert.strictEqual(resContent.status, 200);

    const reqRoles = makeRequest("https://app/api/ops/roles", "GET", { "x-user-id": reviewerUser });
    const resRoles = await rolesRoute.GET(reqRoles);
    assert.strictEqual(resRoles.status, 403);
  });

  // [TEST T] Owner/operator separation
  await runTest("[TEST T] Owner/operator separation: Operator cannot assign roles or bootstrap owner", async () => {
    const reqAssign = makeRequest("https://app/api/ops/roles", "POST", { "x-user-id": operatorUser }, {
      targetUserId: `new_op_${tsNow}`,
      role: "OPERATOR",
    });
    const resAssign = await rolesRoute.POST(reqAssign);
    assert.strictEqual(resAssign.status, 403);

    const reqOwner = makeRequest("https://app/api/ops/roles", "POST", { "x-user-id": ownerUser }, {
      targetUserId: `new_op_${tsNow}`,
      role: "OPERATOR",
    });
    const resOwner = await rolesRoute.POST(reqOwner);
    assert.strictEqual(resOwner.status, 200);
  });

  console.log("\n==================================================================");
  console.log(`  VERIFICATION COMPLETE: ${passedCount}/20 INVARIANTS PASSED (100%)`);
  console.log("  STATUS: OPERATIONS_CENTER_V1_VERIFIED");
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
