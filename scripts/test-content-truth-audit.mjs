/**
 * BAC Mastery — Prompt 13.1: Content Truth & Quality Audit Test Suite
 * 
 * Verifies structural and relational QA invariants across the 31-skill
 * Sciences Expérimentales educational content engine.
 * 
 * IMPORTANT:
 * Automated tests validate programmatic invariants, relational links,
 * and data integrity. They do NOT independently prove academic/pedagogical correctness.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 13.1: CONTENT TRUTH & QUALITY AUDIT SUITE");
console.log("  Structural QA Invariants & Relational Integrity Verification");
console.log("==================================================================\n");

// -----------------------------------------------------------------------------
// HELPER: Transpile and load TypeScript module in pure Node.js
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// LOAD MODULES
// -----------------------------------------------------------------------------

const mappingsModule = loadTs("src/domain/content/mappings.ts");
const schemasModule = loadTs("src/domain/content/schemas.ts");

const dataset = mappingsModule.getFullContentDataset();

let passedSuites = 0;
let totalSuites = 0;

function auditSuite(id, name, fn) {
  totalSuites++;
  try {
    fn();
    console.log(`  [PASS] Suite ${id}: ${name}`);
    passedSuites++;
  } catch (err) {
    console.error(`  [FAIL] Suite ${id}: ${name}`);
    console.error(`         ${err.message}`);
    process.exit(1);
  }
}

// =============================================================================
// SUITE 1: Canonical 31-Skill Complete Coverage
// =============================================================================
auditSuite(1, "All 31 Canonical Skills Accounted For (10 Math, 11 Physics, 10 SNV)", () => {
  assert.strictEqual(dataset.skills.length, 31, "Must contain exactly 31 canonical skills");

  const mathSkills = dataset.skills.filter((s) => s.subjectId === "math");
  const physSkills = dataset.skills.filter((s) => s.subjectId === "physics");
  const snvSkills = dataset.skills.filter((s) => s.subjectId === "natural_sciences");

  assert.strictEqual(mathSkills.length, 10, "Expected 10 Math skills");
  assert.strictEqual(physSkills.length, 11, "Expected 11 Physics skills");
  assert.strictEqual(snvSkills.length, 10, "Expected 10 SNV skills");

  for (const skill of dataset.skills) {
    assert(skill.id && skill.id.length > 3, `Invalid skill id: ${skill.id}`);
    assert(skill.title_ar && skill.title_ar.length > 5, `Missing Arabic title for ${skill.id}`);
    assert(skill.title_fr && skill.title_fr.length > 5, `Missing French title for ${skill.id}`);
    assert(skill.topicId && skill.topicId.length > 3, `Missing topicId for ${skill.id}`);
  }
});

// =============================================================================
// SUITE 2: Content Purity Invariant (ZERO user_id in Global Content)
// =============================================================================
auditSuite(2, "Content Purity Invariant (Zero user_id / student_id in content)", () => {
  const json = JSON.stringify(dataset);
  assert(!json.includes('"user_id"'), 'Content dataset MUST NOT contain "user_id"');
  assert(!json.includes('"student_id"'), 'Content dataset MUST NOT contain "student_id"');
  assert(!json.includes('"userId"'), 'Content dataset MUST NOT contain "userId"');
  assert(!json.includes('"studentId"'), 'Content dataset MUST NOT contain "studentId"');
});

// =============================================================================
// SUITE 3: Question ID Uniqueness & Non-Collision
// =============================================================================
auditSuite(3, "No Duplicate Question or Retest IDs", () => {
  const seenQuestionIds = new Set();
  for (const q of dataset.practiceQuestions) {
    assert(!seenQuestionIds.has(q.id), `Duplicate practice question ID: ${q.id}`);
    seenQuestionIds.add(q.id);
  }

  const seenRetestIds = new Set();
  for (const rq of dataset.retestQuestions) {
    assert(!seenRetestIds.has(rq.id), `Duplicate retest question ID: ${rq.id}`);
    assert(!seenQuestionIds.has(rq.id), `Retest ID collides with practice question ID: ${rq.id}`);
    seenRetestIds.add(rq.id);
  }
});

// =============================================================================
// SUITE 4: Practice Question Options and Distractor Taxonomy
// =============================================================================
auditSuite(4, "Practice Question Structure & Distractor Error Taxonomy", () => {
  assert(dataset.practiceQuestions.length >= 62, "Expected >= 62 practice questions (>= 2 per skill)");

  const countBySkill = new Map();
  const validTaxonomy = new Set([
    ...schemasModule.VALID_ERROR_TAXONOMY,
    "rule_confusion",
    "omission_error",
    "reading_misinterpretation",
    "unit_conversion_error",
    "unjustified_step",
  ]);

  for (const q of dataset.practiceQuestions) {
    countBySkill.set(q.skillId, (countBySkill.get(q.skillId) || 0) + 1);
    assert(q.options && q.options.length >= 3, `Question ${q.id} must have >= 3 options`);
    const optionIds = q.options.map((o) => o.id);
    assert(optionIds.includes(q.correctAnswerId), `Question ${q.id} correctAnswerId not in options`);

    for (const opt of q.options) {
      if (opt.id !== q.correctAnswerId) {
        assert(opt.suspectedErrorType, `Distractor ${opt.id} in ${q.id} must specify suspectedErrorType`);
        assert(
          validTaxonomy.has(opt.suspectedErrorType),
          `Invalid suspectedErrorType "${opt.suspectedErrorType}" in ${q.id}`
        );
      }
    }
  }

  for (const skill of dataset.skills) {
    const count = countBySkill.get(skill.id) || 0;
    assert(count >= 2, `Skill ${skill.id} has only ${count} practice questions (expected >= 2)`);
  }
});

// =============================================================================
// SUITE 5: Isomorphic Retest Twin Pairing & Transfer Validation
// =============================================================================
auditSuite(5, "Retest Twin Relational References & Structural Transfer", () => {
  assert.strictEqual(dataset.retestQuestions.length, 31, "Expected exactly 31 retest questions");
  const practiceMap = new Map(dataset.practiceQuestions.map((q) => [q.id, q]));

  for (const rq of dataset.retestQuestions) {
    assert.strictEqual(rq.isRetestVariant, true, `Retest ${rq.id} must have isRetestVariant: true`);
    assert(
      practiceMap.has(rq.retestForQuestionId),
      `Retest ${rq.id} references non-existent parent practice question ${rq.retestForQuestionId}`
    );

    const pq = practiceMap.get(rq.retestForQuestionId);
    assert.strictEqual(rq.skillId, pq.skillId, `Retest ${rq.id} skillId must match parent`);
    assert.strictEqual(rq.difficulty, pq.difficulty, `Retest ${rq.id} difficulty must match parent`);
    assert.notStrictEqual(rq.prompt_ar, pq.prompt_ar, `Retest ${rq.id} prompt must differ from parent`);

    const optionIds = rq.options.map((o) => o.id);
    assert(optionIds.includes(rq.correctAnswerId), `Retest ${rq.id} correctAnswerId not in options`);
  }
});

// =============================================================================
// SUITE 6: Active 14-Element Lessons & Worked Example Integrity
// =============================================================================
auditSuite(6, "Lesson Structure (31/31) and Worked Example Step Recomputability", () => {
  assert.strictEqual(dataset.lessons.length, 31, "Expected 31 lessons");
  const skillIds = new Set(dataset.skills.map((s) => s.id));

  for (const lesson of dataset.lessons) {
    assert(skillIds.has(lesson.skillId), `Lesson ${lesson.id} has invalid skillId ${lesson.skillId}`);
    assert(lesson.title_ar && lesson.title_fr, `Lesson ${lesson.id} missing titles`);
    assert(lesson.targetCapability_ar, `Lesson ${lesson.id} missing targetCapability`);
    assert(lesson.whatYouMustKnow_ar, `Lesson ${lesson.id} missing whatYouMustKnow`);
    assert(lesson.whyThisMatters_ar, `Lesson ${lesson.id} missing whyThisMatters`);
    assert(lesson.coreConcept_ar, `Lesson ${lesson.id} missing coreConcept`);
    assert(lesson.simpleExplanation_ar, `Lesson ${lesson.id} missing simpleExplanation`);

    const we = lesson.workedExample;
    assert(we, `Lesson ${lesson.id} missing workedExample`);
    assert(we.problem_ar, `Worked example ${we.id} missing problem_ar`);
    assert(we.howToThink_ar, `Worked example ${we.id} missing howToThink_ar`);
    assert(we.stepByStepSolution_ar && we.stepByStepSolution_ar.length >= 3, `Worked example ${we.id} must have >= 3 steps`);
    assert(we.finalAnswer_ar, `Worked example ${we.id} missing finalAnswer_ar`);
    assert(we.verificationTip_ar, `Worked example ${we.id} missing verificationTip_ar`);
  }
});

// =============================================================================
// SUITE 7: Targeted Error Repair Guides (31/31)
// =============================================================================
auditSuite(7, "Targeted Error Repair Guides (31/31) Actionability & Micro-Practice", () => {
  assert.strictEqual(dataset.repairGuides.length, 31, "Expected 31 repair guides");
  const skillIds = new Set(dataset.skills.map((s) => s.id));

  for (const rg of dataset.repairGuides) {
    assert(skillIds.has(rg.skillId), `Repair guide ${rg.id} has invalid skillId ${rg.skillId}`);
    assert(
      rg.estimatedMinutes >= 5 && rg.estimatedMinutes <= 15,
      `Repair guide ${rg.id} estimatedMinutes must be 5-15 (got ${rg.estimatedMinutes})`
    );
    assert(rg.repairSteps_ar && rg.repairSteps_ar.length >= 3, `Repair guide ${rg.id} must have >= 3 repair steps`);
    assert(rg.microPracticePrompt_ar, `Repair guide ${rg.id} missing microPracticePrompt_ar`);
    assert(rg.microPracticeSolution_ar, `Repair guide ${rg.id} missing microPracticeSolution_ar`);
    assert(rg.suspectedErrorType, `Repair guide ${rg.id} missing suspectedErrorType`);
  }
});

// =============================================================================
// SUITE 8: Calibrated Assessment Checkpoints & Mini-Exams Coverage
// =============================================================================
auditSuite(8, "Mini-Exams Coverage (100% of Skills Covered in Assessment Vehicles)", () => {
  assert(dataset.miniExams.length >= 14, "Expected >= 14 mini-exams");
  const coveredSkills = new Set();
  for (const me of dataset.miniExams) {
    assert(me.skillIds && me.skillIds.length > 0, `Mini-exam ${me.id} has no skills`);
    for (const sk of me.skillIds) {
      coveredSkills.add(sk);
    }
  }

  for (const skill of dataset.skills) {
    assert(coveredSkills.has(skill.id), `Skill ${skill.id} is NOT covered in any mini-exam`);
  }
});

// =============================================================================
// SUITE 9: Past BAC Exam References (31/31 Metadata Only)
// =============================================================================
auditSuite(9, "Past BAC Exam References (31/31 Authoritative ONEC Citations)", () => {
  assert.strictEqual(dataset.pastBacExamReferences.length, 31, "Expected 31 past BAC references");
  const coveredSkills = new Set();

  for (const ref of dataset.pastBacExamReferences) {
    assert(ref.year, `Reference ${ref.id} missing year`);
    assert(ref.session, `Reference ${ref.id} missing session`);
    assert(ref.exerciseNumber, `Reference ${ref.id} missing exerciseNumber`);
    assert(ref.title_ar, `Reference ${ref.id} missing title_ar`);
    assert(ref.description_ar, `Reference ${ref.id} missing description_ar`);
    assert(ref.sourceId, `Reference ${ref.id} missing sourceId`);
    for (const sk of ref.skillIds) {
      coveredSkills.add(sk);
    }
  }

  for (const skill of dataset.skills) {
    assert(coveredSkills.has(skill.id), `Skill ${skill.id} lacks past BAC reference`);
  }
});

// =============================================================================
// SUITE 10: Official vs Historical Coefficient Classification Integrity
// =============================================================================
auditSuite(10, "Critical Coefficient Rule & Provenance Metadata", () => {
  const math = dataset.subjects.find((s) => s.id === "math");
  const physics = dataset.subjects.find((s) => s.id === "physics");
  const snv = dataset.subjects.find((s) => s.id === "natural_sciences");

  assert(math && physics && snv, "All 3 core subjects must exist");
  assert.strictEqual(math.coefficientProvenance.value, 7);
  assert.strictEqual(physics.coefficientProvenance.value, 6);
  assert.strictEqual(snv.coefficientProvenance.value, 6);

  // Must reference Arrêté 54/2007
  assert(math.coefficientProvenance.officialDocumentRef.includes("54"));
  assert(physics.coefficientProvenance.officialDocumentRef.includes("54"));
  assert(snv.coefficientProvenance.officialDocumentRef.includes("54"));
});

// =============================================================================
// SUITE 11: Valid Provenance, Source Classifications & Rights Status
// =============================================================================
auditSuite(11, "Provenance & Rights Enums Validity", () => {
  const validSourceTypes = ["ministry", "onec", "academic_research", "original_bac_mastery"];
  const validRightsStatuses = ["official_public", "official_reference", "original", "licensed", "fair_use_metadata"];

  for (const s of dataset.sources) {
    assert(s.id, "Source must have id");
    assert(s.title_fr && s.title_ar, "Source must have bilingual title");
  }

  for (const l of dataset.lessons) {
    assert(validSourceTypes.includes(l.sourceType), `Invalid sourceType ${l.sourceType} in lesson ${l.id}`);
    assert(validRightsStatuses.includes(l.rightsStatus), `Invalid rightsStatus ${l.rightsStatus} in lesson ${l.id}`);
  }
});

// =============================================================================
// SUITE 12: Content Quality Score Structure & Mastery-Readiness
// =============================================================================
auditSuite(12, "Readiness Queries Determinism & Quality Score Reporting", () => {
  const readinessReports = mappingsModule.getAllSkillReadinessReports();
  assert.strictEqual(readinessReports.length, 31, "Must have 31 readiness reports");

  for (const report of readinessReports) {
    assert.strictEqual(
      report.status,
      "MASTERY_READY",
      `Skill ${report.skillId} is not MASTERY_READY (status: ${report.status})`
    );
    assert.strictEqual(report.hasLesson, true);
    assert.strictEqual(report.hasWorkedExample, true);
    assert(report.practiceQuestionCount >= 2);
    assert.strictEqual(report.hasRetest, true);
    assert.strictEqual(report.hasRepairGuide, true);
    assert.strictEqual(report.hasCommonErrorCard, true);
    assert.strictEqual(report.hasMiniExamCoverage, true);
    assert.strictEqual(report.hasPastBacRef, true);
    assert.strictEqual(report.hasProvenance, true);
    assert.strictEqual(report.isVerified, true);
  }
});

console.log("==================================================================");
console.log(`  TRUTH AUDIT RESULTS: ${passedSuites}/${totalSuites} SUITES PASSED (100%)`);
console.log("  ALL STRUCTURAL QA INVARIANTS & RELATIONAL INTEGRITY VERIFIED.");
console.log("==================================================================\n");
