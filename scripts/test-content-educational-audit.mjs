import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 12.1: EDUCATIONAL QUALITY AUDIT SUITE");
console.log("  Verification of Curriculum, Twins, Lessons, and Content Integrity");
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
  fn(m.exports, (reqPath) => {
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
  }, m);

  return m.exports;
}

// -----------------------------------------------------------------------------
// LOAD DATASETS
// -----------------------------------------------------------------------------

const mappingsModule = loadTs("src/domain/content/mappings.ts");
const schemasModule = loadTs("src/domain/content/schemas.ts");
const dataset = mappingsModule.getFullContentDataset();

let passedSuites = 0;
let totalSuites = 0;

function runAuditSuite(name, fn) {
  totalSuites++;
  try {
    fn();
    console.log(`  [PASS] Suite ${totalSuites}: ${name}`);
    passedSuites++;
  } catch (err) {
    console.error(`  [FAIL] Suite ${totalSuites}: ${name}`);
    console.error(`         Error: ${err.message}`);
    process.exit(1);
  }
}

// =============================================================================
// 1. SOURCE REGISTRY & DOCUMENTATION INTEGRITY
// =============================================================================
runAuditSuite("Source Registry & Evidentiary Classification Documentation", () => {
  const sourceRegPath = path.resolve("docs/bac-mastery/CONTENT_SOURCE_REGISTRY.md");
  const claimRegPath = path.resolve("docs/bac-mastery/CONTENT_CLAIM_REGISTRY.md");
  const auditDocPath = path.resolve("docs/bac-mastery/CONTENT_EDUCATIONAL_AUDIT.md");
  const verifReportPath = path.resolve("docs/bac-mastery/CONTENT_VERIFICATION_REPORT.md");

  assert(fs.existsSync(sourceRegPath), "CONTENT_SOURCE_REGISTRY.md must exist");
  assert(fs.existsSync(claimRegPath), "CONTENT_CLAIM_REGISTRY.md must exist");
  assert(fs.existsSync(auditDocPath), "CONTENT_EDUCATIONAL_AUDIT.md must exist");
  assert(fs.existsSync(verifReportPath), "CONTENT_VERIFICATION_REPORT.md must exist");

  const sourceContent = fs.readFileSync(sourceRegPath, "utf8");
  assert(sourceContent.includes("OFFICIAL_CURRENT"), "Source registry must define OFFICIAL_CURRENT");
  assert(sourceContent.includes("OFFICIAL_HISTORICAL"), "Source registry must define OFFICIAL_HISTORICAL");
  assert(sourceContent.includes("BAC_MASTERY_DERIVED"), "Source registry must define BAC_MASTERY_DERIVED");
  assert(sourceContent.includes("RESEARCH_SUPPORTED"), "Source registry must define RESEARCH_SUPPORTED");
  assert(sourceContent.includes("UNVERIFIED"), "Source registry must define UNVERIFIED");
  assert(sourceContent.includes("SRC-OFFICIAL-MEN-ARRETE-54-2007"), "Decree 54/2007 must be registered");
  assert(sourceContent.includes("SRC-OFFICIAL-MEN-PRESS-2026-07-30"), "Ministerial press conference of July 2026 must be registered");
});

// =============================================================================
// 2. CURRICULUM HIERARCHY & SUBJECT RATIOS
// =============================================================================
runAuditSuite("Curriculum Hierarchy & Stream Coefficients", () => {
  assert.strictEqual(dataset.subjects.length, 3, "Expected exactly 3 core subjects");
  assert.strictEqual(dataset.topics.length, 14, "Expected exactly 14 topics");
  assert.strictEqual(dataset.skills.length, 31, "Expected exactly 31 skills");

  const math = dataset.subjects.find(s => s.id === "math");
  const physics = dataset.subjects.find(s => s.id === "physics");
  const snv = dataset.subjects.find(s => s.id === "natural_sciences");

  assert(math && math.coefficientProvenance.value === 7, "Math coefficient must be 7");
  assert(physics && physics.coefficientProvenance.value === 6, "Physics coefficient must be 6");
  assert(snv && snv.coefficientProvenance.value === 6, "SNV coefficient must be 6");

  // Verify skills per subject: Math=10, Physics=11, SNV=10
  const mathSkills = dataset.skills.filter(s => s.subjectId === "math");
  const physSkills = dataset.skills.filter(s => s.subjectId === "physics");
  const snvSkills = dataset.skills.filter(s => s.subjectId === "natural_sciences");

  assert.strictEqual(mathSkills.length, 10, "Expected 10 Math skills");
  assert.strictEqual(physSkills.length, 11, "Expected 11 Physics skills");
  assert.strictEqual(snvSkills.length, 10, "Expected 10 SNV skills");
});

// =============================================================================
// 3. ALL 31 PRACTICE & RETEST TWIN PAIRS AUDIT
// =============================================================================
runAuditSuite("31 Practice & Retest Problem Pairs (100% VALID_TWIN)", () => {
  assert(dataset.practiceQuestions.length >= 62, "Expected >= 62 practice questions");
  assert.strictEqual(dataset.retestQuestions.length, 31, "Expected 31 retest questions");

  const practiceById = new Map();
  dataset.practiceQuestions.forEach(q => practiceById.set(q.id, q));

  const retestBySkill = new Map();
  dataset.retestQuestions.forEach(q => retestBySkill.set(q.skillId, q));

  let validTwinsCount = 0;

  for (const skill of dataset.skills) {
    const rq = retestBySkill.get(skill.id);
    assert(rq, `Missing retest question for skill: ${skill.id}`);
    const pq = practiceById.get(rq.retestForQuestionId);
    assert(pq, `Missing paired practice question ${rq.retestForQuestionId} for skill: ${skill.id}`);

    // Twin verification checks
    assert.strictEqual(rq.isRetestVariant, true, `Question ${rq.id} must be marked as retest variant`);
    assert.strictEqual(pq.isRetestVariant, false, `Question ${pq.id} must NOT be marked as retest variant`);
    assert.strictEqual(rq.skillId, pq.skillId, `Skill ID mismatch for skill ${skill.id}`);
    assert.strictEqual(rq.difficulty, pq.difficulty, `Difficulty mismatch for skill ${skill.id}`);
    assert.notStrictEqual(rq.prompt_ar, pq.prompt_ar, `Retest prompt must not be identical to practice for skill ${skill.id}`);
    assert.notStrictEqual(rq.id, pq.id, `Question IDs must be distinct for skill ${skill.id}`);

    // Both must have valid options and single correct answer
    assert(pq.options.length >= 3, `Practice question ${pq.id} must have >= 3 options`);
    assert(rq.options.length >= 3, `Retest question ${rq.id} must have >= 3 options`);
    assert(pq.options.some(o => o.id === pq.correctAnswerId), `Practice ${pq.id} correctAnswerId invalid`);
    assert(rq.options.some(o => o.id === rq.correctAnswerId), `Retest ${rq.id} correctAnswerId invalid`);

    validTwinsCount++;
  }

  assert.strictEqual(validTwinsCount, 31, "All 31 skills must have verified VALID_TWIN pairs");
});

// =============================================================================
// 4. DISTRACTOR ERROR TAXONOMY INTEGRITY
// =============================================================================
runAuditSuite("Distractor Error Taxonomy Linkage", () => {
  const validTaxonomy = schemasModule.VALID_ERROR_TAXONOMY;
  let mappedDistractors = 0;

  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    for (const opt of q.options) {
      if (opt.id !== q.correctAnswerId && opt.suspectedErrorType) {
        assert(validTaxonomy.has(opt.suspectedErrorType), `Invalid taxonomy ${opt.suspectedErrorType} in ${q.id} option ${opt.id}`);
        mappedDistractors++;
      }
    }
  }

  assert(mappedDistractors >= 60, `Expected >= 60 mapped distractors across bank, got ${mappedDistractors}`);
});

// =============================================================================
// 5. ACTIVE 14-ELEMENT LESSON ARCHITECTURE
// =============================================================================
runAuditSuite("Active 14-Element Lessons Structure & Worked Examples", () => {
  assert.strictEqual(dataset.lessons.length, 31, "Expected exactly 31 lessons");

  const practicedSkillIds = new Set(dataset.practiceQuestions.map(q => q.skillId));

  for (const lesson of dataset.lessons) {
    assert.ok(lesson.id, "Lesson missing id");
    assert.ok(lesson.skillId, "Lesson missing skillId");
    assert.ok(practicedSkillIds.has(lesson.skillId), `Lesson ${lesson.id} target skill has no practice question`);

    // 14 Core Element Invariants
    assert.ok(lesson.whatYouMustKnow_ar && lesson.whatYouMustKnow_ar.length > 10, `Lesson ${lesson.id} missing whatYouMustKnow_ar`);
    assert.ok(lesson.whyThisMatters_ar && lesson.whyThisMatters_ar.length > 10, `Lesson ${lesson.id} missing whyThisMatters_ar`);
    assert.ok(lesson.coreConcept_ar && lesson.coreConcept_ar.length > 10, `Lesson ${lesson.id} missing coreConcept_ar`);
    assert.ok(lesson.simpleExplanation_ar && lesson.simpleExplanation_ar.length > 10, `Lesson ${lesson.id} missing simpleExplanation_ar`);
    assert.ok(lesson.workedExample, `Lesson ${lesson.id} missing workedExample`);
    assert.ok(lesson.workedExample.problem_ar && lesson.workedExample.problem_ar.length > 10, `Lesson ${lesson.id} missing workedExample problem`);
    assert.ok(lesson.workedExample.howToThink_ar && lesson.workedExample.howToThink_ar.length > 10, `Lesson ${lesson.id} missing workedExample howToThink_ar`);
    assert.ok(lesson.workedExample.stepByStepSolution_ar && lesson.workedExample.stepByStepSolution_ar.length >= 2, `Lesson ${lesson.id} workedExample must have >= 2 steps`);
    assert.ok(lesson.commonMistakes && lesson.commonMistakes.length >= 2, `Lesson ${lesson.id} must have >= 2 common mistakes`);
    assert.ok(lesson.howToKnowYouUnderstood_ar && lesson.howToKnowYouUnderstood_ar.length > 10, `Lesson ${lesson.id} missing howToKnowYouUnderstood_ar`);
    assert.ok(lesson.quickRecallPrompt_ar && lesson.quickRecallPrompt_ar.length > 5, `Lesson ${lesson.id} missing quickRecallPrompt_ar`);
    assert.ok(lesson.quickRecallAnswer_ar && lesson.quickRecallAnswer_ar.length > 5, `Lesson ${lesson.id} missing quickRecallAnswer_ar`);
    assert.ok(lesson.practiceQuestionIds && lesson.practiceQuestionIds.length >= 1, `Lesson ${lesson.id} missing practiceQuestionIds`);
    assert.ok(lesson.whatToDoIfYouFail_ar && lesson.whatToDoIfYouFail_ar.length > 10, `Lesson ${lesson.id} missing whatToDoIfYouFail_ar`);
    assert.ok(lesson.summaryCard, `Lesson ${lesson.id} missing summaryCard`);
    assert.ok(lesson.retestQuestionId, `Lesson ${lesson.id} missing retestQuestionId`);
  }
});

// =============================================================================
// 6. TARGETED ERROR REPAIR GUIDES
// =============================================================================
runAuditSuite("Targeted 5-15 Minute Error Repair Guides", () => {
  assert.strictEqual(dataset.repairGuides.length, 31, "Expected exactly 31 repair guides");

  const validTaxonomy = schemasModule.VALID_ERROR_TAXONOMY;

  for (const rg of dataset.repairGuides) {
    assert.ok(rg.id, "RepairGuide missing id");
    assert.ok(rg.skillId, "RepairGuide missing skillId");
    assert.ok(validTaxonomy.has(rg.suspectedErrorType), `RepairGuide ${rg.id} invalid error type ${rg.suspectedErrorType}`);
    assert.ok(rg.title_ar && rg.title_ar.length > 5, `RepairGuide ${rg.id} missing title_ar`);
    assert.ok(rg.diagnosis_ar && rg.diagnosis_ar.length > 10, `RepairGuide ${rg.id} missing diagnosis_ar`);
    assert.ok(rg.whyItHappens_ar && rg.whyItHappens_ar.length > 10, `RepairGuide ${rg.id} missing whyItHappens_ar`);
    assert.ok(rg.repairSteps_ar && rg.repairSteps_ar.length >= 3, `RepairGuide ${rg.id} must have >= 3 repair steps`);
    assert.ok(rg.microPracticePrompt_ar && rg.microPracticePrompt_ar.length > 10, `RepairGuide ${rg.id} missing microPracticePrompt_ar`);
    assert.ok(rg.microPracticeSolution_ar && rg.microPracticeSolution_ar.length > 10, `RepairGuide ${rg.id} missing microPracticeSolution_ar`);
    assert(rg.estimatedMinutes >= 5 && rg.estimatedMinutes <= 15, `RepairGuide ${rg.id} duration must be 5-15 min, got ${rg.estimatedMinutes}`);
  }
});

// =============================================================================
// 7. STUDY METHODS & EXPERT EVIDENCE
// =============================================================================
runAuditSuite("Actionable Study Methods & Evidence-Based Expert Guidance", () => {
  assert.strictEqual(dataset.studyMethods.length, 13, "Expected 13 study methods");
  assert.strictEqual(dataset.expertGuidance.length, 7, "Expected 7 expert guidance entries");

  for (const sm of dataset.studyMethods) {
    assert.ok(sm.id && sm.title_ar && sm.title_fr, `Study method ${sm.id} missing titles`);
    assert.ok(sm.practicalSteps_ar && sm.practicalSteps_ar.length >= 3, `Study method ${sm.id} must have >= 3 execution steps`);
  }

  for (const eg of dataset.expertGuidance) {
    assert.ok(eg.expertName, "Expert guidance missing expertName");
    assert.ok(eg.primaryPublication, `Expert ${eg.expertName} missing primaryPublication citation`);
    assert(["Tier 1 (High)", "Tier 2 (Moderate)", "Tier 3 (Foundational)"].includes(eg.evidenceLevel));
    assert.ok(eg.principle_ar && eg.principle_ar.length > 20);
    assert.ok(eg.actionForStudent_ar && eg.actionForStudent_ar.length > 20);
  }
});

// =============================================================================
// 8. VERIFIED QUOTES & MOTIVATION PRINCIPLES
// =============================================================================
runAuditSuite("Verified Quotes Attribution & Anti-Hype Motivation Principles", () => {
  assert.strictEqual(dataset.verifiedQuotes.length, 4, "Expected 4 verified quotes");
  assert.strictEqual(dataset.motivationalPrinciples.length, 7, "Expected 7 motivational principles");

  for (const q of dataset.verifiedQuotes) {
    assert.ok(q.author && q.author.length > 3, "Quote missing author");
    assert.ok(q.quote_original && q.quote_original.length > 10, "Quote missing original wording");
    assert.ok(q.verifiedSource && q.verifiedSource.length > 10, `Quote by ${q.author} missing verifiedSource documentation`);
    assert.ok(q.translation_ar && q.translation_ar.length > 10, "Quote missing translation_ar");
  }

  for (const p of dataset.motivationalPrinciples) {
    assert.ok(p.id && p.category && p.title_ar);
    assert.ok(p.principle_ar && p.principle_ar.length > 30, `Principle ${p.id} text too brief`);
    assert.ok(p.actionPrompt_ar && p.actionPrompt_ar.length > 10, `Principle ${p.id} missing actionPrompt_ar`);
  }
});

// =============================================================================
// 9. CALIBRATED MINI-EXAMS
// =============================================================================
runAuditSuite("Calibrated Mini-Exams Assessment Vehicles", () => {
  assert(dataset.miniExams.length >= 6, "Expected >= 6 mini exams");

  for (const me of dataset.miniExams) {
    assert.ok(me.id && me.title_ar && me.title_fr);
    assert.ok(me.questionIds && me.questionIds.length >= 1, `Mini-exam ${me.id} must contain >= 1 questions`);
    assert(me.timeTargetMinutes >= 10 && me.timeTargetMinutes <= 60, `Mini-exam ${me.id} time out of bounds`);
    assert(me.passingScorePercent >= 60 && me.passingScorePercent <= 90, `Mini-exam ${me.id} passing score out of bounds`);
  }
});

// =============================================================================
// 10. CONTENT PURITY INVARIANT (ZERO user_id)
// =============================================================================
runAuditSuite("Content Purity Invariant (ZERO user_id across entire content dataset)", () => {
  const json = JSON.stringify(dataset);
  const forbiddenPatterns = [
    /"user_id"/i,
    /"userId"/i,
    /"student_id"/i,
    /"studentId"/i,
  ];

  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(json), `Content purity violation: detected forbidden student pattern ${pattern} in content dataset`);
  }
});

// =============================================================================
// 11. TRUE COVERAGE REALITY METRIC CHECK
// =============================================================================
runAuditSuite("Strict Coverage Reality Metric Invariant (100% Mastery-Ready Coverage)", () => {
  const totalSkills = dataset.skills.length;
  const practiceSkills = new Set(dataset.practiceQuestions.map(q => q.skillId));
  const retestSkills = new Set(dataset.retestQuestions.map(q => q.skillId));
  const lessonSkills = new Set(dataset.lessons.map(l => l.skillId));
  const repairSkills = new Set(dataset.repairGuides.map(r => r.skillId));

  assert.strictEqual(totalSkills, 31, "Total skills must be 31");
  assert.strictEqual(practiceSkills.size, 31, "Practice questions must cover exactly 31 skills (100%)");
  assert.strictEqual(retestSkills.size, 31, "Retest questions must cover exactly 31 skills (100%)");
  assert.strictEqual(repairSkills.size, 31, "Repair guides cover all 31 skills (100%)");
  assert.strictEqual(lessonSkills.size, 31, "Active 14-element lessons cover all 31 skills (100%)");

  // Closed-loop mastery skills possess: Lesson + Practice + Retest + Repair
  const closedLoopSkills = [...lessonSkills].filter(s => practiceSkills.has(s) && retestSkills.has(s) && repairSkills.has(s));
  assert.strictEqual(closedLoopSkills.length, 31, "Expected exactly 31 fully closed-loop mastery-ready skills (100%)");
});

// =============================================================================
// SUMMARY & QUALITY GATE EXIT
// =============================================================================

console.log("\n==================================================================");
console.log(`  AUDIT SUITE SUMMARY: ${passedSuites}/${totalSuites} SUITES PASSED (100%)`);
console.log("  ALL CONTENT QUALITY & CURRICULUM AUDIT INVARIANTS SATISFIED.");
console.log("==================================================================\n");
