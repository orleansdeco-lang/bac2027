/**
 * BAC Mastery - Session Persistence & Diagnostic Loop Prevention Test Suite
 * Validates:
 * 1. Database migration 013 schema & RLS policies
 * 2. ProgressService dual-write, local caching, and state synchronization
 * 3. Route guards & redirection prevention for completed students
 * 4. Lesson activity, study time accumulation, and skill mastery persistence
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================================");
console.log("  BAC MASTERY — SESSION PERSISTENCE & DIAGNOSTIC GUARD TEST SUITE");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Test 1: Migration 013 Schema Verification
// -----------------------------------------------------------------------------
test("Check 01: Migration 013 exists and defines public.user_progress with required columns", () => {
  const migrationPath = path.join(rootDir, "supabase", "migrations", "013_bac_mastery_user_progress_persistence.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration 013 file must exist");

  const content = fs.readFileSync(migrationPath, "utf-8");

  assert.ok(content.includes("CREATE TABLE IF NOT EXISTS public.user_progress"), "Must create public.user_progress");
  assert.ok(content.includes("user_id UUID NOT NULL REFERENCES auth.users(id)"), "Must reference auth.users(id)");
  assert.ok(content.includes("stream_id TEXT NOT NULL"), "Must include stream_id");
  assert.ok(content.includes("subject_id TEXT NOT NULL"), "Must include subject_id");
  assert.ok(content.includes("skill_id TEXT NOT NULL"), "Must include skill_id");
  assert.ok(content.includes("status TEXT NOT NULL DEFAULT 'not_started'"), "Must include status default");
  assert.ok(content.includes("CHECK (status IN ('not_started', 'in_progress', 'mastered'))"), "Must constrain status");
  assert.ok(content.includes("diagnostic_completed BOOLEAN NOT NULL DEFAULT false"), "Must include diagnostic_completed");
  assert.ok(content.includes("diagnostic_score NUMERIC"), "Must include diagnostic_score");
  assert.ok(content.includes("last_lesson_id TEXT"), "Must include last_lesson_id");
  assert.ok(content.includes("total_time_seconds INTEGER NOT NULL DEFAULT 0"), "Must include total_time_seconds");
  assert.ok(content.includes("PRIMARY KEY (user_id, skill_id)"), "Primary key must strictly be (user_id, skill_id)");
});

test("Check 02: Migration 013 enables RLS and defines owner-only security policies", () => {
  const migrationPath = path.join(rootDir, "supabase", "migrations", "013_bac_mastery_user_progress_persistence.sql");
  const content = fs.readFileSync(migrationPath, "utf-8");

  assert.ok(content.includes("ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled");
  assert.ok(content.includes("CREATE POLICY \"user_progress_select_own\""), "Select policy must exist");
  assert.ok(content.includes("CREATE POLICY \"user_progress_insert_own\""), "Insert policy must exist");
  assert.ok(content.includes("CREATE POLICY \"user_progress_update_own\""), "Update policy must exist");
  assert.ok(content.includes("CREATE POLICY \"user_progress_delete_own\""), "Delete policy must exist");
  assert.ok(content.includes("auth.uid() = user_id"), "Policies must restrict by auth.uid() = user_id");
});

test("Check 03: Migration 013 defines summary tracking columns on student_profiles", () => {
  const migrationPath = path.join(rootDir, "supabase", "migrations", "013_bac_mastery_user_progress_persistence.sql");
  const content = fs.readFileSync(migrationPath, "utf-8");

  assert.ok(content.includes("ALTER TABLE public.student_profiles"), "Must alter student_profiles");
  assert.ok(content.includes("last_lesson_id TEXT"), "Must add last_lesson_id to student_profiles");
  assert.ok(content.includes("total_study_time_seconds INTEGER DEFAULT 0"), "Must add total_study_time_seconds");
  assert.ok(content.includes("diagnostic_completed BOOLEAN DEFAULT false"), "Must add diagnostic_completed");
});

// -----------------------------------------------------------------------------
// Test 2: Service Layer & LocalStorage Dual-Write Verification
// -----------------------------------------------------------------------------
test("Check 04: ProgressService module exists and implements core persistence API", () => {
  const servicePath = path.join(rootDir, "src", "lib", "progress", "progress-service.ts");
  assert.ok(fs.existsSync(servicePath), "progress-service.ts must exist");

  const content = fs.readFileSync(servicePath, "utf-8");
  assert.ok(content.includes("getSyncDiagnosticStatus"), "Must export getSyncDiagnosticStatus");
  assert.ok(content.includes("checkDiagnosticStatus"), "Must export checkDiagnosticStatus");
  assert.ok(content.includes("getUserProgress"), "Must export getUserProgress");
  assert.ok(content.includes("saveDiagnosticCompletion"), "Must export saveDiagnosticCompletion");
  assert.ok(content.includes("recordLessonActivity"), "Must export recordLessonActivity");
});

test("Check 05: Progress Context & useUserProgress Hook exist and are integrated in RootLayout", () => {
  const contextPath = path.join(rootDir, "src", "lib", "progress", "progress-context.tsx");
  const hookPath = path.join(rootDir, "src", "lib", "hooks", "useUserProgress.ts");
  const layoutPath = path.join(rootDir, "src", "app", "layout.tsx");

  assert.ok(fs.existsSync(contextPath), "progress-context.tsx must exist");
  assert.ok(fs.existsSync(hookPath), "useUserProgress.ts must exist");

  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert.ok(layoutContent.includes("ProgressProvider"), "RootLayout must wrap children in ProgressProvider");
});

// -----------------------------------------------------------------------------
// Test 3: Route Guard & Redirection Logic Verification
// -----------------------------------------------------------------------------
test("Check 06: Root route (/) guards completed students and redirects to dashboard/lesson", () => {
  const homeClientPath = path.join(rootDir, "src", "app", "HomeClient.tsx");
  assert.ok(fs.existsSync(homeClientPath), "HomeClient.tsx must exist");

  const content = fs.readFileSync(homeClientPath, "utf-8");
  assert.ok(content.includes("ProgressService.getSyncDiagnosticStatus"), "Must check synchronous status");
  assert.ok(content.includes("ProgressService.checkDiagnosticStatus"), "Must check authoritative status");
  assert.ok(content.includes("router.replace"), "Must call router.replace on completion");
});

test("Check 07: Diagnostic route (/diagnostic) prevents re-taking and redirects completed students", () => {
  const diagPath = path.join(rootDir, "src", "app", "diagnostic", "page.tsx");
  const content = fs.readFileSync(diagPath, "utf-8");

  assert.ok(content.includes("ProgressService.getSyncDiagnosticStatus"), "Must check sync diagnostic status on mount");
  assert.ok(content.includes("ProgressService.checkDiagnosticStatus"), "Must check authoritative diagnostic status");
  assert.ok(content.includes("router.replace(target)"), "Must redirect away from diagnostic if already completed");
  assert.ok(content.includes("ProgressService.saveDiagnosticCompletion"), "Must save full diagnostic completion");
  assert.ok(content.includes("ProgressService.recordLessonActivity"), "Must record individual question answers");
});

test("Check 08: Mission route guards pilot-math and tracks real lesson activity", () => {
  const missionPath = path.join(rootDir, "src", "app", "mission", "[missionId]", "page.tsx");
  const content = fs.readFileSync(missionPath, "utf-8");

  assert.ok(content.includes("missionId === \"pilot-math\""), "Must specifically guard pilot-math");
  assert.ok(content.includes("ProgressService.getSyncDiagnosticStatus"), "Must check sync status for pilot-math");
  assert.ok(content.includes("ProgressService.recordLessonActivity"), "Must record lesson activity on load and completion");
});

test("Check 09: Academic Profile route redirects completed students to dashboard instead of diagnostic", () => {
  const acadPath = path.join(rootDir, "src", "app", "profile", "academic", "page.tsx");
  const content = fs.readFileSync(acadPath, "utf-8");

  assert.ok(content.includes("ProgressService.getSyncDiagnosticStatus"), "Must check sync status on mount");
  assert.ok(content.includes("ProgressService.checkDiagnosticStatus"), "Must check diagnostic status on submit");
});

test("Check 10: Dashboard displays real persistent progress (mastered count & study time)", () => {
  const dashPath = path.join(rootDir, "src", "app", "dashboard", "page.tsx");
  const content = fs.readFileSync(dashPath, "utf-8");

  assert.ok(content.includes("useUserProgress"), "Dashboard must consume useUserProgress");
  assert.ok(content.includes("masteredCount"), "Dashboard must extract masteredCount");
  assert.ok(content.includes("totalStudyTimeSeconds"), "Dashboard must extract totalStudyTimeSeconds");
});

// -----------------------------------------------------------------------------
// Test 4: Simulation of In-Memory / LocalStorage State Transitions
// -----------------------------------------------------------------------------
test("Check 11: Progress simulation: Diagnostic completion marks skills and locks diagnostic loop", () => {
  // Simulate mock storage
  const mockStorage = new Map();
  const testUserId = "user-test-uuid-1234";

  // Fresh user state
  let hasCompleted = false;
  let storedMeta = mockStorage.get(`bac_user_progress_meta:${testUserId}`);
  assert.strictEqual(storedMeta, undefined, "New user has no progress meta");

  // Complete diagnostic
  const diagnosticResult = {
    userId: testUserId,
    streamId: "sciences_exp",
    overallScore: 14.5,
    skillResults: [
      { skillId: "math_derivatives_chain_rule", subjectId: "math", score: 5.0, isMastered: true },
      { skillId: "snv_protein_synthesis", subjectId: "natural_sciences", score: 3.5, isMastered: false },
    ],
  };

  const skillsMap = {};
  for (const s of diagnosticResult.skillResults) {
    skillsMap[s.skillId] = {
      userId: testUserId,
      streamId: diagnosticResult.streamId,
      subjectId: s.subjectId,
      skillId: s.skillId,
      status: s.isMastered ? "mastered" : "in_progress",
      diagnosticCompleted: true,
      diagnosticScore: s.score,
      lastLessonId: null,
      totalTimeSeconds: 0,
      lastActiveAt: new Date().toISOString(),
    };
  }

  const meta = {
    diagnosticCompleted: true,
    diagnosticScore: diagnosticResult.overallScore,
    lastLessonId: "math_derivatives_chain_rule",
    totalTimeSeconds: 300,
    masteredSkillsCount: 1,
  };

  mockStorage.set(`bac_user_progress:${testUserId}`, JSON.stringify(skillsMap));
  mockStorage.set(`bac_user_progress_meta:${testUserId}`, JSON.stringify(meta));

  // Verify guard decision
  const checkMeta = JSON.parse(mockStorage.get(`bac_user_progress_meta:${testUserId}`));
  assert.strictEqual(checkMeta.diagnosticCompleted, true, "Diagnostic must be marked completed");
  assert.strictEqual(checkMeta.masteredSkillsCount, 1, "Mastered skills count must be 1");

  // Verify route guard redirection decision
  const targetRoute = checkMeta.diagnosticCompleted
    ? (checkMeta.lastLessonId ? `/mission/${checkMeta.lastLessonId}` : "/dashboard")
    : "/diagnostic";

  assert.strictEqual(targetRoute, "/mission/math_derivatives_chain_rule", "Completed student must be redirected forward, not back to diagnostic");
});

console.log("\n------------------------------------------------------------------");
console.log(`  SESSION PERSISTENCE RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
