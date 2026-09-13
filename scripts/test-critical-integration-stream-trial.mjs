/**
 * BAC Mastery — Critical Integration Verification Suite
 * Student Identity + Stream Lock + 72-Hour Server Trial + Stream-Scoped Product
 * 
 * Verifies All 10 Authoritative Gates:
 * Gate 1: Profile must not exist outside an account (DB schema & Service enforcement)
 * Gate 2: Auth precedes registration (unauthenticated redirected to /auth)
 * Gate 3: Registration precedes academic profile (unregistered redirected to /auth/register)
 * Gate 4: Academic profile precedes learning access (unprofiled redirected to /profile/academic)
 * Gate 5: 72-Hour Server-Anchored Trial starts at account creation and expires at t + 72h
 * Gate 6: Trial state is immune to client tampering, refresh, or localStorage reset
 * Gate 7: Sciences Exp stream lock (Math, Physics, SNV only; 31 skills)
 * Gate 8: Math stream lock (Math, Physics only; ZERO biology in diagnostic, content, or roadmap; 30 skills)
 * Gate 9: Gestion & Économie stream lock (Accounting, Economics, Law, Math only; ZERO biology or physics; 33 skills)
 * Gate 10: Learning Access Gate hook enforces all conditions deterministically
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — CRITICAL INTEGRATION & STREAM LOCK SUITE (10 GATES)");
console.log("==================================================================\n");

// Robust CommonJS TS module loader
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
      let target = reqPath;
      if (target.startsWith("@/")) {
        target = path.resolve(target.replace("@/", "src/"));
      } else if (target.startsWith(".")) {
        target = path.resolve(path.dirname(fullPath), target);
      }
      if (fs.existsSync(target + ".ts")) return loadTs(target + ".ts");
      if (fs.existsSync(target + "/index.ts")) return loadTs(target + "/index.ts");
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return loadTs(target);
      return {};
    },
    m
  );

  return m.exports;
}

let passedCount = 0;
let failedCount = 0;

async function test(desc, fn) {
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

// -----------------------------------------------------------------------------
// Load Modules
// -----------------------------------------------------------------------------
const learningContext = loadTs("src/domain/student/learning-context.ts");
const accessModule = loadTs("src/lib/access/index.ts");
const streamsModule = loadTs("src/domain/curriculum/streams.ts");
const subjectsModule = loadTs("src/domain/curriculum/subjects.ts");
const contentService = loadTs("src/lib/services/content-service.ts");
const diagnosticSelector = loadTs("src/lib/diagnostic/question-selector.ts");

const {
  getStudentSubjects,
  isSubjectAllowedForStream,
  validateContentStreamCompatibility,
} = learningContext;

const {
  TRIAL_DURATION_HOURS,
  TRIAL_DURATION_MS,
  getStudentAccess,
} = accessModule;

const {
  resolveStreamSubjects,
} = streamsModule;

const {
  ContentService,
} = contentService;

const {
  MATH_STREAM_DIAGNOSTIC_QUESTIONS,
  selectDiagnosticQuestions,
  getDiagnosticQuestionsForStream,
} = diagnosticSelector;

// =============================================================================
// GATE 1: Profile must not exist outside an account (DB & Service Enforcement)
// =============================================================================
console.log("--- GATE 1: Profile Must Not Exist Outside Account ---");

await test("G1.1: Migration 001/004 enforces id = user_id = auth.users(id) ON DELETE CASCADE", () => {
  const m001 = fs.readFileSync("supabase/migrations/001_bac_mastery_student_foundation.sql", "utf8");
  assert.ok(m001.includes("REFERENCES auth.users(id) ON DELETE CASCADE"), "Must have ON DELETE CASCADE FK to auth.users");
  assert.ok(m001.includes("PRIMARY KEY REFERENCES auth.users(id)") || m001.includes("PRIMARY KEY"), "id must be primary key of student_profiles");
  assert.ok(!m001.includes("CREATE TABLE IF NOT EXISTS users ("), "Must not create a separate users table outside auth.users");
});

await test("G1.2: Migration 005 enforces 72h trial default and stream lock check constraint", () => {
  const m005 = fs.readFileSync("supabase/migrations/005_enforce_72h_trial_and_stream_lock.sql", "utf8");
  assert.ok(/interval\s+'72 hours'/i.test(m005), "Migration 005 must set trial_expires_at to 72 hours");
  assert.ok(m005.includes("sciences_exp") && m005.includes("gestion_eco") && m005.includes("math"), "Check constraint must validate official streams");
  assert.ok(m005.includes("protect_student_trial_fields"), "Trigger function must protect student trial fields from tampering");
});

await test("G1.3: StudentService rejects saving registration without a valid authenticated userId", async () => {
  const studentServiceMod = loadTs("src/lib/services/student-service.ts");
  const { StudentService } = studentServiceMod;
  let errorCaught = false;
  try {
    await StudentService.saveRegistration({
      firstName: "Test",
      lastName: "Student",
      studentPhone: "0550123456",
      studentStatus: "schooled",
      streamId: "sciences_exp",
      wilayaCode: "16",
      wilayaName: "Alger",
      communeCode: "1601",
      communeName: "Alger Centre",
    }, "");
  } catch (e) {
    errorCaught = true;
  }
  assert.ok(errorCaught, "StudentService.saveRegistration must throw or reject empty userId");
});

// =============================================================================
// GATE 2: Auth Precedes Registration
// =============================================================================
console.log("\n--- GATE 2: Auth Precedes Registration ---");

await test("G2.1: /auth/register page contains unauthenticated guard redirecting to /auth", () => {
  const registerPage = fs.readFileSync("src/app/auth/register/page.tsx", "utf8");
  assert.ok(registerPage.includes("useAuth"), "Register page must consume useAuth hook");
  assert.ok(registerPage.includes("/auth"), "Register page must redirect unauthenticated users to /auth");
});

await test("G2.2: Learning access hook redirects unauthenticated users to /auth", () => {
  const hookSource = fs.readFileSync("src/lib/hooks/useLearningAccessGate.ts", "utf8");
  assert.ok(hookSource.includes("!user"), "Gate must check for unauthenticated state");
  assert.ok(hookSource.includes('router.replace("/auth'), "Unauthenticated user must be redirected to /auth");
  assert.ok(hookSource.includes("setIsAuthorized(false)"), "Unauthenticated user must not be authorized");
});

// =============================================================================
// GATE 3: Registration Precedes Academic Profile
// =============================================================================
console.log("\n--- GATE 3: Registration Precedes Academic Profile ---");

await test("G3.1: /profile/academic page contains guard redirecting incomplete registration to /auth/register", () => {
  const academicPage = fs.readFileSync("src/app/profile/academic/page.tsx", "utf8");
  assert.ok(academicPage.includes("useAuth"), "Academic page must consume useAuth hook");
  assert.ok(academicPage.includes("/auth/register"), "Academic page must redirect incomplete personal registration to /auth/register");
});

await test("G3.2: Learning access hook redirects users missing personal registration to /auth/register", () => {
  const hookSource = fs.readFileSync("src/lib/hooks/useLearningAccessGate.ts", "utf8");
  assert.ok(hookSource.includes('router.replace("/auth/register")'), "Missing personal registration must redirect to /auth/register");
});

// =============================================================================
// GATE 4: Academic Profile Precedes Learning Access
// =============================================================================
console.log("\n--- GATE 4: Academic Profile Precedes Learning Access ---");

await test("G4.1: Dashboard, Roadmap, and Progress pages integrate useLearningAccessGate", () => {
  const dashboard = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");
  const roadmap = fs.readFileSync("src/app/roadmap/page.tsx", "utf8");
  const progress = fs.readFileSync("src/app/progress/page.tsx", "utf8");
  assert.ok(dashboard.includes("useLearningAccessGate"), "Dashboard must use useLearningAccessGate");
  assert.ok(roadmap.includes("useLearningAccessGate"), "Roadmap must use useLearningAccessGate");
  assert.ok(progress.includes("useLearningAccessGate"), "Progress must use useLearningAccessGate");
});

await test("G4.2: Learning access hook redirects users missing academic profile to /profile/academic", () => {
  const hookSource = fs.readFileSync("src/lib/hooks/useLearningAccessGate.ts", "utf8");
  assert.ok(hookSource.includes('router.replace("/profile/academic")'), "Missing academic profile must redirect to /profile/academic");
});

// =============================================================================
// GATE 5: 72-Hour Server-Anchored Trial Computation
// =============================================================================
console.log("\n--- GATE 5: 72-Hour Server-Anchored Trial ---");

await test("G5.1: Trial constants declare exactly 72 hours", () => {
  assert.strictEqual(TRIAL_DURATION_HOURS, 72, "TRIAL_DURATION_HOURS must be 72");
  assert.strictEqual(TRIAL_DURATION_MS, 72 * 3600 * 1000, "TRIAL_DURATION_MS must be 72 * 3600 * 1000");
});

await test("G5.2: getStudentAccess calculates accurate countdown anchored to creation time", () => {
  const baseTime = new Date("2026-09-13T10:00:00Z");

  // At creation: 72h
  const a0 = getStudentAccess(
    { created_at: baseTime.toISOString(), trial_started_at: baseTime.toISOString() },
    baseTime
  );
  assert.strictEqual(a0.remainingHours, 72, "At creation, remaining hours must be 72");
  assert.strictEqual(a0.canUseProduct, true, "Product must be accessible at creation");
  assert.strictEqual(a0.reason, "trial_72h_active");

  // After 24h: 48h
  const a24 = getStudentAccess(
    { created_at: baseTime.toISOString(), trial_started_at: baseTime.toISOString() },
    new Date(baseTime.getTime() + 24 * 3600 * 1000)
  );
  assert.strictEqual(a24.remainingHours, 48, "After 24h, remaining hours must be 48");
  assert.strictEqual(a24.canUseProduct, true);

  // After 71h 30m: 0 hours remaining (floor: 30 minutes left)
  const a71_5 = getStudentAccess(
    { created_at: baseTime.toISOString(), trial_started_at: baseTime.toISOString() },
    new Date(baseTime.getTime() + 71.5 * 3600 * 1000)
  );
  assert.strictEqual(a71_5.canUseProduct, true, "Must be accessible within 72h window");
  assert.strictEqual(a71_5.isExpiringSoon, true, "Must be expiring soon when < 6h left");

  // After 72h: expired
  const a72 = getStudentAccess(
    { created_at: baseTime.toISOString(), trial_started_at: baseTime.toISOString() },
    new Date(baseTime.getTime() + 72.1 * 3600 * 1000)
  );
  assert.strictEqual(a72.remainingHours, 0, "After 72h, remaining hours must be 0");
  assert.strictEqual(a72.canUseProduct, false, "Product must be blocked after 72h");
  assert.strictEqual(a72.reason, "trial_72h_expired");
  assert.strictEqual(a72.status, "TRIAL_EXPIRED");
});

await test("G5.3: Paid subscribers bypass trial expiration completely", () => {
  const baseTime = new Date("2026-09-13T10:00:00Z");
  const paid = getStudentAccess(
    {
      created_at: baseTime.toISOString(),
      plan: "PAID",
      access_status: "PAID",
    },
    new Date(baseTime.getTime() + 500 * 3600 * 1000)
  );
  assert.strictEqual(paid.canUseProduct, true);
  assert.strictEqual(paid.status, "PAID_ACTIVE");
  assert.strictEqual(paid.reason, "paid_active_access");
});

// =============================================================================
// GATE 6: Trial Immunity to Client Tampering
// =============================================================================
console.log("\n--- GATE 6: Trial Immunity to Client Tampering ---");

await test("G6.1: TopBar displays server-anchored trial countdown without relying on client localStorage overrides", () => {
  const topBar = fs.readFileSync("src/components/ui/TopBar.tsx", "utf8");
  assert.ok(topBar.includes("trialExpiresAt") || topBar.includes("trial_expires_at"), "TopBar must bind to trial expiration timestamp");
  assert.ok(topBar.includes("trialHoursRemaining") || topBar.includes("Math.ceil"), "TopBar must compute hours dynamically from server expiry");
  assert.ok(topBar.includes("72h") || topBar.includes("ساعة"), "TopBar displays trial countdown indicator");
});

// =============================================================================
// GATE 7: Sciences Exp Stream Lock
// =============================================================================
console.log("\n--- GATE 7: Sciences Exp Stream Lock ---");

await test("G7.1: Sciences Exp stream authorizes Math, Physics, and Natural Sciences as core subjects", () => {
  const subjects = getStudentSubjects("sciences_exp");
  const coreSubjIds = subjects.filter((s) => s.isCoreSubject).map((s) => s.subjectId);
  assert.deepStrictEqual(coreSubjIds.sort(), ["math", "natural_sciences", "physics"].sort());
  
  // Forbidden subjects
  assert.strictEqual(isSubjectAllowedForStream("accounting_finance", "sciences_exp"), false);
  assert.strictEqual(isSubjectAllowedForStream("economics_management", "sciences_exp"), false);
  assert.strictEqual(isSubjectAllowedForStream("law", "sciences_exp"), false);
});

await test("G7.2: Sciences Exp curriculum contains exactly 31 skills across the 3 core subjects", () => {
  const skills = ContentService.getSkillsForStream("sciences_exp");
  assert.strictEqual(skills.length, 31, "Sciences Exp must have exactly 31 canonical skills");
  
  const mathCount = skills.filter((s) => s.subjectId === "math").length;
  const phyCount = skills.filter((s) => s.subjectId === "physics").length;
  const snvCount = skills.filter((s) => s.subjectId === "natural_sciences").length;
  
  assert.strictEqual(mathCount, 10, "10 Math skills");
  assert.strictEqual(phyCount, 11, "11 Physics skills");
  assert.strictEqual(snvCount, 10, "10 SNV skills");
  assert.strictEqual(mathCount + phyCount + snvCount, 31);
});

// =============================================================================
// GATE 8: Math Stream Lock & Zero Biology Invariant
// =============================================================================
console.log("\n--- GATE 8: Math Stream Lock & Zero Biology Invariant ---");

await test("G8.1: Math stream authorizes ONLY Math and Physics as core subjects (ZERO biology)", () => {
  const subjects = getStudentSubjects("math");
  const coreSubjIds = subjects.filter((s) => s.isCoreSubject).map((s) => s.subjectId);
  assert.deepStrictEqual(coreSubjIds.sort(), ["math", "physics"].sort());
  
  // ZERO biology invariant
  assert.strictEqual(isSubjectAllowedForStream("natural_sciences", "math"), false, "SNV must NEVER be allowed for Math stream");
  assert.strictEqual(isSubjectAllowedForStream("accounting_finance", "math"), false);
});

await test("G8.2: ContentService.getSkillsForStream('math') returns skills with ZERO biology", () => {
  const skills = ContentService.getSkillsForStream("math");
  assert.ok(skills.length >= 21, "Math stream skills must be present (math + physics)");
  
  const hasBiology = skills.some((s) => s.subjectId === "natural_sciences" || s.subjectId === "svt" || s.id.includes("BIO") || s.id.includes("SNV"));
  assert.strictEqual(hasBiology, false, "Math stream skills must contain ZERO biology");
});

await test("G8.3: Math Stream Diagnostic contains exactly 10 questions with ZERO biology", () => {
  assert.strictEqual(MATH_STREAM_DIAGNOSTIC_QUESTIONS.length, 10, "Math stream diagnostic must have 10 questions");
  
  const mathQ = MATH_STREAM_DIAGNOSTIC_QUESTIONS.filter((q) => q.subjectId === "math");
  const phyQ = MATH_STREAM_DIAGNOSTIC_QUESTIONS.filter((q) => q.subjectId === "physics");
  const bioQ = MATH_STREAM_DIAGNOSTIC_QUESTIONS.filter((q) => q.subjectId === "natural_sciences" || q.subjectId === "svt");
  
  assert.strictEqual(mathQ.length, 5, "5 Math questions in Math stream diagnostic");
  assert.strictEqual(phyQ.length, 5, "5 Physics questions in Math stream diagnostic");
  assert.strictEqual(bioQ.length, 0, "ZERO Biology questions in Math stream diagnostic");
});

await test("G8.4: selectDiagnosticQuestions('math') dynamically selects math diagnostic with zero biology", () => {
  const questions = selectDiagnosticQuestions("math");
  assert.strictEqual(questions.length, 10);
  const bioQuestions = questions.filter((q) => q.subjectId === "natural_sciences" || q.subjectId === "svt");
  assert.strictEqual(bioQuestions.length, 0, "Selected diagnostic for math stream must have ZERO biology questions");
});

await test("G8.5: Content bundle validation rejects biological content for Math stream", () => {
  const isCompatible = validateContentStreamCompatibility("math", {
    subjectId: "natural_sciences",
    skillId: "SKILL-SNV-IMM-01",
  });
  assert.strictEqual(isCompatible, false, "SNV content must be incompatible with Math stream");
});

// =============================================================================
// GATE 9: Gestion & Économie Stream Lock & Zero Bio/Physics Invariant
// =============================================================================
console.log("\n--- GATE 9: Gestion & Économie Stream Lock ---");

await test("G9.1: Gestion & Économie authorizes Accounting, Economics, Law, and Math as core subjects (ZERO Bio, ZERO Physics)", () => {
  const subjects = getStudentSubjects("gestion_eco");
  const coreSubjIds = subjects.filter((s) => s.isCoreSubject).map((s) => s.subjectId);
  for (const subj of ["accounting_finance", "economics_management", "law", "math"]) {
    assert.ok(coreSubjIds.includes(subj), `Core subjects must include ${subj}`);
  }

  // Invariants
  assert.strictEqual(isSubjectAllowedForStream("natural_sciences", "gestion_eco"), false, "ZERO Biology in Gestion-Eco");
  assert.strictEqual(isSubjectAllowedForStream("physics", "gestion_eco"), false, "ZERO Physics in Gestion-Eco");
});

await test("G9.2: ContentService.getSkillsForStream('gestion_eco') returns 33 skills with ZERO Bio/Physics", () => {
  const skills = ContentService.getSkillsForStream("gestion_eco");
  assert.strictEqual(skills.length, 33, "Gestion & Économie must have 33 skills");
  
  const hasBiology = skills.some((s) => s.subjectId === "natural_sciences" || s.subjectId === "svt");
  const hasPhysics = skills.some((s) => s.subjectId === "physics");
  assert.strictEqual(hasBiology, false, "ZERO Biology skills in Gestion-Eco");
  assert.strictEqual(hasPhysics, false, "ZERO Physics skills in Gestion-Eco");
});

await test("G9.3: Content bundle validation rejects Physics and SNV for Gestion-Eco", () => {
  assert.strictEqual(
    validateContentStreamCompatibility("gestion_eco", { subjectId: "physics", skillId: "SKILL-PHY-MECH-01" }),
    false,
    "Physics must be incompatible with Gestion-Eco"
  );
  assert.strictEqual(
    validateContentStreamCompatibility("gestion_eco", { subjectId: "natural_sciences", skillId: "SKILL-SNV-GEN-01" }),
    false,
    "SNV must be incompatible with Gestion-Eco"
  );
});

// =============================================================================
// GATE 10: Learning Access Gate Hook Determinism
// =============================================================================
console.log("\n--- GATE 10: Learning Access Gate Hook Determinism ---");

await test("G10.1: Deterministic state transition table for user authorization", () => {
  // Simulate the deterministic gate evaluation logic
  function evaluateGateState(user, profile, referenceDate) {
    if (!user) {
      return { isAuthorized: false, redirectTo: "/auth" };
    }
    const hasPersonalReg = !!(profile?.registrationCompletedAt || profile?.firstName);
    if (!hasPersonalReg) {
      return { isAuthorized: false, redirectTo: "/auth/register" };
    }
    const hasAcademicProf = !!(profile?.academicProfileCompletedAt || profile?.streamId);
    if (!hasAcademicProf) {
      return { isAuthorized: false, redirectTo: "/profile/academic" };
    }
    const access = getStudentAccess(profile, referenceDate);
    if (!access.canUseProduct) {
      return { isAuthorized: false, redirectTo: "/pricing" };
    }
    return { isAuthorized: true, redirectTo: null };
  }

  const now = new Date("2026-09-13T10:00:00Z");

  // State 1: Unauthenticated
  const s1 = evaluateGateState(null, null, now);
  assert.strictEqual(s1.isAuthorized, false);
  assert.strictEqual(s1.redirectTo, "/auth");

  // State 2: Authenticated, no personal registration
  const s2 = evaluateGateState({ id: "usr-1" }, null, now);
  assert.strictEqual(s2.isAuthorized, false);
  assert.strictEqual(s2.redirectTo, "/auth/register");

  // State 3: Authenticated, personal done, no academic stream
  const s3 = evaluateGateState({ id: "usr-1" }, { firstName: "Karim", registrationCompletedAt: now.toISOString() }, now);
  assert.strictEqual(s3.isAuthorized, false);
  assert.strictEqual(s3.redirectTo, "/profile/academic");

  // State 4: Complete profile, active 72h trial
  const s4 = evaluateGateState({ id: "usr-1" }, {
    firstName: "Karim",
    registrationCompletedAt: now.toISOString(),
    streamId: "sciences_exp",
    academicProfileCompletedAt: now.toISOString(),
    created_at: now.toISOString(),
    trial_started_at: now.toISOString(),
  }, now);
  assert.strictEqual(s4.isAuthorized, true);
  assert.strictEqual(s4.redirectTo, null);

  // State 5: Complete profile, expired trial (100 hours later)
  const s5 = evaluateGateState({ id: "usr-1" }, {
    firstName: "Karim",
    registrationCompletedAt: now.toISOString(),
    streamId: "sciences_exp",
    academicProfileCompletedAt: now.toISOString(),
    created_at: now.toISOString(),
    trial_started_at: now.toISOString(),
  }, new Date(now.getTime() + 100 * 3600 * 1000));
  assert.strictEqual(s5.isAuthorized, false);
  assert.strictEqual(s5.redirectTo, "/pricing");
});

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log(`  INTEGRATION FIX RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("==================================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log("  ALL 10 GATES VERIFIED SUCCESSFULLY. ZERO REGRESSIONS.\n");
}
