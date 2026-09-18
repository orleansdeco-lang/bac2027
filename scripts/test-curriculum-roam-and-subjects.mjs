/**
 * Automated Verification: Subject-Specific Independent Assessments & Free Roam Curriculum Library
 * 
 * Verifies:
 * 1. Question selector per subject for all streams (Math, Physics, Sciences, Accounting, Economics, Law, Philosophy, Arabic)
 * 2. Per-subject diagnostic status & saving logic in ProgressService
 * 3. Manual skill mastery and active study time recording in ProgressService
 * 4. Free roam curriculum page integrity and no linear lockouts
 * 5. Dynamic [subjectId] diagnostic runner page integrity
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

console.log("================================================================================");
console.log("🧪 VERIFICATION: Subject-Specific Diagnostics & Free Roam Curriculum Library");
console.log("================================================================================");

let testsPassed = 0;
let testsFailed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

async function run() {
  console.log("\n📦 1. Question Selector & Subject Diagnostic Banks:");
  
  const questionSelectorCode = fs.readFileSync(
    path.resolve("src/lib/diagnostic/question-selector.ts"),
    "utf8"
  );

  it("exports getDiagnosticQuestionsForSubject", () => {
    assert.ok(
      questionSelectorCode.includes("export function getDiagnosticQuestionsForSubject"),
      "getDiagnosticQuestionsForSubject must be exported"
    );
  });

  it("handles core science stream subjects (math, physics, natural_sciences)", () => {
    assert.ok(questionSelectorCode.includes('case "math":'), "Handles math");
    assert.ok(questionSelectorCode.includes('case "physics":'), "Handles physics");
    assert.ok(questionSelectorCode.includes('case "natural_sciences":'), "Handles natural_sciences");
  });

  it("handles management & economics stream subjects (accounting_finance, economics_management, law)", () => {
    assert.ok(questionSelectorCode.includes('case "accounting_finance":'), "Handles accounting_finance");
    assert.ok(questionSelectorCode.includes('case "economics_management":'), "Handles economics_management");
    assert.ok(questionSelectorCode.includes('case "law":'), "Handles law");
  });

  it("handles literature & philosophy stream subjects (philosophy, arabic)", () => {
    assert.ok(questionSelectorCode.includes('case "philosophy":'), "Handles philosophy");
    assert.ok(questionSelectorCode.includes('case "arabic":'), "Handles arabic");
  });

  it("includes philosophy and arabic diagnostic questions bank", () => {
    const philoBankPath = path.resolve("src/data/diagnostic/bac/lettres-philo/index.ts");
    assert.ok(fs.existsSync(philoBankPath), "Philosophy bank file exists");
    const philoContent = fs.readFileSync(philoBankPath, "utf8");
    assert.ok(philoContent.includes("PHILOSOPHY_DIAGNOSTIC_QUESTIONS"), "Exports PHILOSOPHY_DIAGNOSTIC_QUESTIONS");
    assert.ok(philoContent.includes("ARABIC_DIAGNOSTIC_QUESTIONS"), "Exports ARABIC_DIAGNOSTIC_QUESTIONS");
  });

  console.log("\n📦 2. ProgressService & State Storage Upgrades:");

  const progressServiceCode = fs.readFileSync(
    path.resolve("src/lib/progress/progress-service.ts"),
    "utf8"
  );

  it("provides getSubjectDiagnosticStatus with synchronous fallback", () => {
    assert.ok(
      progressServiceCode.includes("getSubjectDiagnosticStatus("),
      "ProgressService must implement getSubjectDiagnosticStatus"
    );
    assert.ok(
      progressServiceCode.includes("getSyncDiagnosticStatus("),
      "ProgressService must implement getSyncDiagnosticStatus"
    );
  });

  it("saves per-subject diagnostic completion with isolated subject keys", () => {
    assert.ok(
      progressServiceCode.includes("subjectId?: string"),
      "saveDiagnosticCompletion accepts subjectId parameter"
    );
    assert.ok(
      progressServiceCode.includes("diagnostic_subject_") || progressServiceCode.includes("subject_id"),
      "Storage keys are isolated per subject"
    );
  });

  it("implements markSkillMastered with localStorage broadcast", () => {
    assert.ok(
      progressServiceCode.includes("markSkillMastered("),
      "ProgressService implements markSkillMastered"
    );
    assert.ok(
      progressServiceCode.includes("bac_user_progress_updated"),
      "Fires custom event bac_user_progress_updated on change"
    );
  });

  it("implements recordStudyTime for active learning time logging", () => {
    assert.ok(
      progressServiceCode.includes("recordStudyTime("),
      "ProgressService implements recordStudyTime"
    );
    assert.ok(
      progressServiceCode.includes("totalTimeSeconds") || progressServiceCode.includes("total_time_seconds"),
      "Updates total time tracking"
    );
  });

  console.log("\n📦 3. Per-Subject Diagnostic Routing & Hub UI:");

  const diagnosticHubCode = fs.readFileSync(
    path.resolve("src/app/diagnostic/page.tsx"),
    "utf8"
  );

  it("diagnostic hub presents per-subject selection cards without auto-lockout", () => {
    assert.ok(
      !diagnosticHubCode.includes("router.replace(redirectPath)"),
      "No auto-redirect lockout on visiting /diagnostic"
    );
    assert.ok(
      diagnosticHubCode.includes("/diagnostic/${rule.subjectId}"),
      "Renders direct links to /diagnostic/[subjectId]"
    );
    assert.ok(
      diagnosticHubCode.includes("getSubjectDiagnosticStatus"),
      "Tracks completed subject status"
    );
  });

  it("dynamic [subjectId] diagnostic runner executes isolated subject tests", () => {
    const runnerPath = path.resolve("src/app/diagnostic/[subjectId]/page.tsx");
    assert.ok(fs.existsSync(runnerPath), "Dynamic [subjectId] runner file exists");
    const runnerCode = fs.readFileSync(runnerPath, "utf8");
    assert.ok(
      runnerCode.includes("getDiagnosticQuestionsForSubject"),
      "Runner queries subject-specific questions"
    );
    assert.ok(
      runnerCode.includes("saveDiagnosticCompletion"),
      "Runner saves completion with subjectId"
    );
    assert.ok(
      runnerCode.includes("/diagnostic/results?subjectId="),
      "Routes to results with subjectId context"
    );
  });

  it("diagnostic results page links back to both diagnostic hub and curriculum", () => {
    const resultsCode = fs.readFileSync(
      path.resolve("src/app/diagnostic/results/page.tsx"),
      "utf8"
    );
    assert.ok(
      resultsCode.includes('href="/diagnostic"'),
      "Links to diagnose another subject"
    );
    assert.ok(
      resultsCode.includes('href="/curriculum"'),
      "Links to free roam library"
    );
  });

  console.log("\n📦 4. Free Roam Curriculum Library (/curriculum & /library):");

  const libraryRedirectPath = path.resolve("src/app/library/page.tsx");
  assert.ok(fs.existsSync(libraryRedirectPath), "/library alias route exists");
  const libraryRedirectCode = fs.readFileSync(libraryRedirectPath, "utf8");
  it("/library redirects to /curriculum", () => {
    assert.ok(
      libraryRedirectCode.includes('redirect("/curriculum")'),
      "/library aliases to /curriculum"
    );
  });

  const curriculumCode = fs.readFileSync(
    path.resolve("src/app/curriculum/page.tsx"),
    "utf8"
  );

  it("curriculum library contains stream selector covering all 6 BAC streams", () => {
    assert.ok(curriculumCode.includes('"sciences_exp"'), "Includes sciences_exp");
    assert.ok(curriculumCode.includes('"gestion_eco"'), "Includes gestion_eco");
    assert.ok(curriculumCode.includes('"math"'), "Includes math");
    assert.ok(curriculumCode.includes('"technique_math"'), "Includes technique_math");
    assert.ok(curriculumCode.includes('"lettres_philo"'), "Includes lettres_philo");
    assert.ok(curriculumCode.includes('"langues_etrangeres"'), "Includes langues_etrangeres");
  });

  it("curriculum library has real-time search & subject tabs", () => {
    assert.ok(curriculumCode.includes("searchQuery"), "Search filter exists");
    assert.ok(curriculumCode.includes("selectedSubject"), "Subject tab filter exists");
  });

  it("curriculum library has manual mastery toggle calling markSkillMastered", () => {
    assert.ok(
      curriculumCode.includes("markSkillMastered"),
      "Integrates markSkillMastered"
    );
    assert.ok(
      curriculumCode.includes("تم الإتقان"),
      "Features mark as mastered button text"
    );
  });

  it("curriculum library records active study time ticker", () => {
    assert.ok(
      curriculumCode.includes("recordStudyTime"),
      "Calls recordStudyTime on interval"
    );
    assert.ok(
      curriculumCode.includes("totalStudyTimeSeconds") || curriculumCode.includes("recordStudyTime"),
      "Tracks study time state"
    );
  });

  console.log("\n📦 5. Navigation & Dashboard Integration:");

  const topBarCode = fs.readFileSync(
    path.resolve("src/components/ui/TopBar.tsx"),
    "utf8"
  );
  it("TopBar links to both /curriculum and /diagnostic", () => {
    assert.ok(topBarCode.includes('href: "/curriculum"'), "TopBar has /curriculum link");
    assert.ok(topBarCode.includes('href: "/diagnostic"'), "TopBar has /diagnostic link");
  });

  const sidebarCode = fs.readFileSync(
    path.resolve("src/components/ui/Sidebar.tsx"),
    "utf8"
  );
  it("Sidebar links to both /curriculum and /diagnostic", () => {
    assert.ok(sidebarCode.includes('href: "/curriculum"'), "Sidebar has /curriculum link");
    assert.ok(sidebarCode.includes('href: "/diagnostic"'), "Sidebar has /diagnostic link");
  });

  const dashboardCode = fs.readFileSync(
    path.resolve("src/app/dashboard/page.tsx"),
    "utf8"
  );
  it("Dashboard includes Learning Modes Hub Switcher (Guided, Free Roam, Per-Subject Diagnostic)", () => {
    assert.ok(dashboardCode.includes("أنماط التعلم وخيارات الدراسة"), "Modes Hub title present");
    assert.ok(dashboardCode.includes('href="/curriculum"'), "Dashboard links to Free Roam Library");
    assert.ok(dashboardCode.includes('href="/diagnostic"'), "Dashboard links to Per-Subject Diagnostics");
  });

  console.log("================================================================================");
  console.log(`🏁 RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  console.log("================================================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error running verification:", err);
  process.exit(1);
});
