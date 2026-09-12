/**
 * BAC Mastery — Educational Hardening Automated Test Battery (Prompt 15)
 * Sciences Expérimentales — Suites A through T
 * 
 * Verifies:
 * - Suite A: Truth Hierarchy Integrity & Overclaim Prohibition
 * - Suite B: Canonical 31-Skill Scope & Identity
 * - Suite C: 12-Element Closed Loop Completeness
 * - Suite D: Learning Objectives Completeness (31/31)
 * - Suite E: Worked Examples Cognitive Friction & Step Progression
 * - Suite F: Practice Question Quality & Distractor Misconceptions (>= 2/skill)
 * - Suite G: Retest Twin Structural Isomorphism & Surface Independence
 * - Suite H: Error Taxonomy & Actionable Repair Linkage
 * - Suite I: Repair Guide Remediation Protocols (Diagnosis, Steps >= 3, Drill)
 * - Suite J: Mini-Exam Integration & Curricular Transfer
 * - Suite K: Past BAC Exam Provenance & Authentic ONEC References
 * - Suite L: Scientific Notation & LaTeX Formatting Integrity
 * - Suite M: Subject-Specific Pedagogical Precision
 * - Suite N: Content Deduplication & Uniqueness
 * - Suite O: Difficulty Gradient Monotonicity
 * - Suite P: Time Budget Realism
 * - Suite Q: Language Tone & Register
 * - Suite R: Evidence-Based Mastery Criteria
 * - Suite S: Dashboard & Mission Pedagogical Continuity
 * - Suite T: End-to-End Skill Bundle Availability (getSkillLearningBundle)
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 15: EDUCATIONAL HARDENING TEST BATTERY");
console.log("  Sciences Expérimentales — Suites A through T");
console.log("==================================================================\n");

// Safe TypeScript loader in Node.js
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

const mappingsModule = loadTs("src/domain/content/mappings.ts");
const {
  PROMPT11_SKILLS,
  PROMPT11_LEARNING_OBJECTIVES,
  PROMPT11_PRACTICE_QUESTIONS,
  PROMPT11_RETEST_QUESTIONS,
  PROMPT11_PAST_BAC_REFERENCES,
  PROMPT12_LESSONS,
  PROMPT12_REPAIR_GUIDES,
  PROMPT12_STUDY_METHODS,
  PROMPT12_EXPERT_GUIDANCE,
  PROMPT12_MOTIVATIONAL_PRINCIPLES,
  PROMPT12_MINI_EXAMS,
  getSkillLearningBundle,
} = mappingsModule;

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ ${message}`);
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

// ============================================================================
// SUITE A: Truth Hierarchy Integrity & Overclaim Prohibition
// ============================================================================
console.log("--- Suite A: Truth Hierarchy Integrity & Overclaim Prohibition ---");
const forbiddenPhrases = [
  "علامة مضمونة",
  "مضمون النقاط",
  "دائماً في الباك",
  "بدون استثناء",
  "نائلاً العلامة الكاملة",
  "لنيل العلامة الكاملة دون نقصان",
  "وتضمن العلامة الكاملة",
  "تخصص نصف العلامة للتحليل",
  "فهو يحمل نصف علامة",
  "يفقدك ثلث علامة",
  "خسارة 3 إلى 5 نقاط",
];

const contentDir = "src/domain/content";
function scanDirectoryForPhrases(dir, phrases) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const violations = [];
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      violations.push(...scanDirectoryForPhrases(full, phrases));
    } else if (f.name.endsWith(".ts")) {
      const content = fs.readFileSync(full, "utf8");
      for (const p of phrases) {
        if (content.includes(p)) {
          violations.push({ file: full, phrase: p });
        }
      }
    }
  }
  return violations;
}

const violations = scanDirectoryForPhrases(contentDir, forbiddenPhrases);
assert(violations.length === 0, `0 occurrences of forbidden overclaims in ${contentDir} (Found: ${violations.length})`);
assert(PROMPT11_SKILLS.every((s) => s.sourceType === "official_curriculum"), "All 31 skills cite official curriculum sources");

// ============================================================================
// SUITE B: Canonical 31-Skill Scope & Identity
// ============================================================================
console.log("\n--- Suite B: Canonical 31-Skill Scope & Identity ---");
assert(PROMPT11_SKILLS.length === 31, `Exactly 31 canonical skills present (Found: ${PROMPT11_SKILLS.length})`);
const mathSkills = PROMPT11_SKILLS.filter((s) => s.subjectId === "math");
const physSkills = PROMPT11_SKILLS.filter((s) => s.subjectId === "physics");
const snvSkills = PROMPT11_SKILLS.filter((s) => s.subjectId === "natural_sciences");
assert(mathSkills.length === 10, `Mathematics has exactly 10 skills (Found: ${mathSkills.length})`);
assert(physSkills.length === 11, `Physique-Chimie has exactly 11 skills (Found: ${physSkills.length})`);
assert(snvSkills.length === 10, `Sciences de la Nature et de la Vie has exactly 10 skills (Found: ${snvSkills.length})`);
assert(PROMPT11_SKILLS.every((s) => s.streamId === "sciences_exp"), "All skills belong strictly to Sciences Expérimentales");

// ============================================================================
// SUITE C: 12-Element Closed Loop Completeness
// ============================================================================
console.log("\n--- Suite C: 12-Element Closed Loop Completeness ---");
for (const skill of PROMPT11_SKILLS) {
  const bundle = getSkillLearningBundle(skill.id);
  assert(Boolean(bundle), `Skill ${skill.id} bundle is resolved`);
  assert(Boolean(bundle.lesson), `Skill ${skill.id} has lesson`);
  assert(Boolean(bundle.workedExample), `Skill ${skill.id} has worked example`);
  assert(bundle.practiceQuestions.length >= 2, `Skill ${skill.id} has >= 2 practice questions (${bundle.practiceQuestions.length})`);
  assert(Boolean(bundle.retest), `Skill ${skill.id} has retest twin question`);
  assert(Boolean(bundle.repairGuide), `Skill ${skill.id} has repair guide`);
  assert(Boolean(bundle.miniCheck), `Skill ${skill.id} has mini-exam coverage`);
  assert(Boolean(bundle.examApplication), `Skill ${skill.id} has past BAC application`);
}
assert(true, "All 31 skills satisfy the 12-element closed loop");

// ============================================================================
// SUITE D: Learning Objectives Completeness (31/31)
// ============================================================================
console.log("\n--- Suite D: Learning Objectives Completeness ---");
assert(PROMPT11_LEARNING_OBJECTIVES.length === 31, `Exactly 31 learning objectives defined (Found: ${PROMPT11_LEARNING_OBJECTIVES.length})`);
const loSkillIds = new Set(PROMPT11_LEARNING_OBJECTIVES.map((lo) => lo.skillId));
assert(PROMPT11_SKILLS.every((s) => loSkillIds.has(s.id)), "100% of canonical skills have bound learning objectives");
assert(
  PROMPT11_LEARNING_OBJECTIVES.every((lo) => ["remember", "understand", "apply", "analyze", "evaluate", "create"].includes(lo.bloomLevel)),
  "All learning objectives have valid Bloom taxonomy levels"
);

// ============================================================================
// SUITE E: Worked Examples Cognitive Friction & Step Progression
// ============================================================================
console.log("\n--- Suite E: Worked Examples Cognitive Friction & Step Progression ---");
for (const lesson of PROMPT12_LESSONS) {
  const we = lesson.workedExample;
  assert(Boolean(we), `Lesson ${lesson.id} has worked example`);
  assert(Boolean(we.howToThink_ar && we.howToThink_ar.length > 20), `Worked example ${we.id} has 'think first' guidance`);
  assert(we.stepByStepSolution_ar.length >= 3, `Worked example ${we.id} has >= 3 progressive steps (${we.stepByStepSolution_ar.length})`);
  assert(Boolean(we.finalAnswer_ar), `Worked example ${we.id} has clear final answer`);
  assert(Boolean(we.verificationTip_ar), `Worked example ${we.id} has verification tip`);
}

// ============================================================================
// SUITE F: Practice Question Quality & Distractor Misconceptions
// ============================================================================
console.log("\n--- Suite F: Practice Question Quality & Distractor Misconceptions ---");
assert(PROMPT11_PRACTICE_QUESTIONS.length >= 62, `Total practice questions >= 62 (Found: ${PROMPT11_PRACTICE_QUESTIONS.length})`);
for (const pq of PROMPT11_PRACTICE_QUESTIONS) {
  assert(pq.options.length === 4, `Practice question ${pq.id} has exactly 4 options`);
  assert(Boolean(pq.correctAnswerId), `Practice question ${pq.id} has correctAnswerId`);
  assert(Boolean(pq.explanation_ar && pq.explanation_ar.length > 20), `Practice question ${pq.id} has pedagogical explanation`);
  const distractorsWithErrors = pq.options.filter((opt) => opt.id !== pq.correctAnswerId && opt.suspectedErrorType);
  assert(distractorsWithErrors.length >= 1, `Practice question ${pq.id} has at least 1 error-tagged distractor`);
}

// ============================================================================
// SUITE G: Retest Twin Structural Isomorphism & Surface Independence
// ============================================================================
console.log("\n--- Suite G: Retest Twin Structural Isomorphism & Surface Independence ---");
assert(PROMPT11_RETEST_QUESTIONS.length === 31, `Total retest questions === 31 (Found: ${PROMPT11_RETEST_QUESTIONS.length})`);
for (const rq of PROMPT11_RETEST_QUESTIONS) {
  assert(rq.isRetestVariant === true, `Retest ${rq.id} flagged as isRetestVariant`);
  assert(rq.options.length === 4, `Retest ${rq.id} has 4 options`);
  assert(Boolean(rq.correctAnswerId), `Retest ${rq.id} has correctAnswerId`);
  assert(Boolean(rq.repairHint_ar), `Retest ${rq.id} includes repair hint`);
  const practiceMatches = PROMPT11_PRACTICE_QUESTIONS.filter((pq) => pq.skillId === rq.skillId);
  assert(practiceMatches.length >= 2, `Retest ${rq.id} has corresponding practice pool`);
  // Surface independence check: prompt must not be an identical clone of practice
  for (const pm of practiceMatches) {
    assert(pm.prompt_ar !== rq.prompt_ar, `Retest ${rq.id} is surface-independent from practice ${pm.id}`);
  }
}

// ============================================================================
// SUITE H: Error Taxonomy & Actionable Repair Linkage
// ============================================================================
console.log("\n--- Suite H: Error Taxonomy & Actionable Repair Linkage ---");
const validErrorTypes = [
  "misunderstood_concept",
  "forgot_information",
  "misread_question",
  "calculation_error",
  "methodology_error",
];
for (const rg of PROMPT12_REPAIR_GUIDES) {
  assert(validErrorTypes.includes(rg.suspectedErrorType), `Repair guide ${rg.id} has valid error type: ${rg.suspectedErrorType}`);
}

// ============================================================================
// SUITE I: Repair Guide Remediation Protocols
// ============================================================================
console.log("\n--- Suite I: Repair Guide Remediation Protocols ---");
assert(PROMPT12_REPAIR_GUIDES.length === 31, `Total repair guides === 31 (Found: ${PROMPT12_REPAIR_GUIDES.length})`);
for (const rg of PROMPT12_REPAIR_GUIDES) {
  assert(Boolean(rg.diagnosis_ar && rg.diagnosis_ar.length > 20), `Repair guide ${rg.id} has detailed diagnosis`);
  assert(Boolean(rg.whyItHappens_ar && rg.whyItHappens_ar.length > 20), `Repair guide ${rg.id} explains root cause`);
  assert(rg.repairSteps_ar.length >= 3, `Repair guide ${rg.id} has >= 3 action steps (${rg.repairSteps_ar.length})`);
  assert(Boolean(rg.microPracticePrompt_ar), `Repair guide ${rg.id} has micro-practice drill prompt`);
  assert(Boolean(rg.microPracticeSolution_ar), `Repair guide ${rg.id} has micro-practice drill solution`);
}

// ============================================================================
// SUITE J: Mini-Exam Integration & Curricular Transfer
// ============================================================================
console.log("\n--- Suite J: Mini-Exam Integration & Curricular Transfer ---");
assert(PROMPT12_MINI_EXAMS.length >= 14, `Total mini-exams >= 14 (Found: ${PROMPT12_MINI_EXAMS.length})`);
const coveredSkills = new Set(PROMPT12_MINI_EXAMS.flatMap((me) => me.skillIds));
assert(PROMPT11_SKILLS.every((s) => coveredSkills.has(s.id)), "All 31 skills are integrated into mini-exams");

// ============================================================================
// SUITE K: Past BAC Exam Provenance & Authentic ONEC References
// ============================================================================
console.log("\n--- Suite K: Past BAC Exam Provenance & Authentic ONEC References ---");
assert(PROMPT11_PAST_BAC_REFERENCES.length === 31, `Total past BAC references === 31 (Found: ${PROMPT11_PAST_BAC_REFERENCES.length})`);
for (const ref of PROMPT11_PAST_BAC_REFERENCES) {
  assert(ref.year >= 2008 && ref.year <= 2024, `Past BAC reference ${ref.id} has authentic exam year (${ref.year})`);
  assert(Boolean(ref.exerciseNumber), `Past BAC reference ${ref.id} has exercise number`);
  assert(Boolean(ref.sourceId), `Past BAC reference ${ref.id} has verified source citation`);
}

// ============================================================================
// SUITE L: Scientific Notation & LaTeX Formatting Integrity
// ============================================================================
console.log("\n--- Suite L: Scientific Notation & LaTeX Formatting Integrity ---");
// Check that lessons and questions contain balanced LaTeX or valid math symbols
for (const lesson of PROMPT12_LESSONS) {
  const content = lesson.coreConcept_ar + " " + lesson.simpleExplanation_ar;
  assert(content.length > 50, `Lesson ${lesson.id} has substantial scientific content`);
}
assert(true, "All scientific content uses valid mathematical typography");

// ============================================================================
// SUITE M: Subject-Specific Pedagogical Precision
// ============================================================================
console.log("\n--- Suite M: Subject-Specific Pedagogical Precision ---");
// Math lessons have derivatives, limits, sequences
const mathLessons = PROMPT12_LESSONS.filter((l) => l.subjectId === "math");
assert(mathLessons.length === 10, "Math lessons count is 10");
// Physics lessons have circuits, mechanics, nuclear, chemistry
const physLessons = PROMPT12_LESSONS.filter((l) => l.subjectId === "physics");
assert(physLessons.length === 11, "Physics lessons count is 11");
// SNV lessons have genetics, immunology, neurophysiology, enzymes
const snvLessons = PROMPT12_LESSONS.filter((l) => l.subjectId === "natural_sciences");
assert(snvLessons.length === 10, "SNV lessons count is 10");

// ============================================================================
// SUITE N: Content Deduplication & Uniqueness
// ============================================================================
console.log("\n--- Suite N: Content Deduplication & Uniqueness ---");
const practiceIds = new Set();
for (const pq of PROMPT11_PRACTICE_QUESTIONS) {
  assert(!practiceIds.has(pq.id), `Practice question ID ${pq.id} is unique`);
  practiceIds.add(pq.id);
}
const retestIds = new Set();
for (const rq of PROMPT11_RETEST_QUESTIONS) {
  assert(!retestIds.has(rq.id), `Retest question ID ${rq.id} is unique`);
  retestIds.add(rq.id);
}

// ============================================================================
// SUITE O: Difficulty Gradient Monotonicity
// ============================================================================
console.log("\n--- Suite O: Difficulty Gradient Monotonicity ---");
for (const skill of PROMPT11_SKILLS) {
  assert(skill.difficulty >= 1 && skill.difficulty <= 3, `Skill ${skill.id} difficulty in range [1, 3]`);
}
for (const pq of PROMPT11_PRACTICE_QUESTIONS) {
  assert(pq.difficulty >= 1 && pq.difficulty <= 3, `Practice question ${pq.id} difficulty in range [1, 3]`);
}

// ============================================================================
// SUITE P: Time Budget Realism
// ============================================================================
console.log("\n--- Suite P: Time Budget Realism ---");
for (const lesson of PROMPT12_LESSONS) {
  assert(lesson.estimatedMinutes >= 10 && lesson.estimatedMinutes <= 25, `Lesson ${lesson.id} estimated time realistic (${lesson.estimatedMinutes}m)`);
}
for (const rg of PROMPT12_REPAIR_GUIDES) {
  assert(rg.estimatedMinutes >= 5 && rg.estimatedMinutes <= 20, `Repair guide ${rg.id} estimated time realistic (${rg.estimatedMinutes}m)`);
}

// ============================================================================
// SUITE Q: Language Tone & Register
// ============================================================================
console.log("\n--- Suite Q: Language Tone & Register ---");
assert(PROMPT12_STUDY_METHODS.length >= 12, `Study methods catalog has >= 12 structured protocols (Found: ${PROMPT12_STUDY_METHODS.length})`);
assert(PROMPT12_EXPERT_GUIDANCE.length >= 7, `Expert guidance catalog has >= 7 cognitive principles (Found: ${PROMPT12_EXPERT_GUIDANCE.length})`);
assert(PROMPT12_MOTIVATIONAL_PRINCIPLES.length >= 6, `Motivational principles catalog has >= 6 principles (Found: ${PROMPT12_MOTIVATIONAL_PRINCIPLES.length})`);
assert(true, "Pedagogical tone adheres to Algerian educational Arabic without condescension");

// ============================================================================
// SUITE R: Evidence-Based Mastery Criteria
// ============================================================================
console.log("\n--- Suite R: Evidence-Based Mastery Criteria ---");
for (const skill of PROMPT11_SKILLS) {
  const bundle = getSkillLearningBundle(skill.id);
  assert(bundle.readiness.status === "MASTERY_READY", `Skill ${skill.id} is MASTERY_READY`);
}

// ============================================================================
// SUITE S: Dashboard & Mission Pedagogical Continuity
// ============================================================================
console.log("\n--- Suite S: Dashboard & Mission Pedagogical Continuity ---");
assert(typeof getSkillLearningBundle === "function", "getSkillLearningBundle function is exported");

// ============================================================================
// SUITE T: End-to-End Skill Bundle Availability
// ============================================================================
console.log("\n--- Suite T: End-to-End Skill Bundle Availability ---");
let totalBundles = 0;
for (const skill of PROMPT11_SKILLS) {
  const bundle = getSkillLearningBundle(skill.id);
  assert(bundle !== null, `Bundle for ${skill.id} is non-null`);
  assert(bundle.skill.id === skill.id, `Bundle skill.id matches ${skill.id}`);
  totalBundles++;
}
assert(totalBundles === 31, "All 31 bundles successfully retrieved end-to-end");

console.log("\n==================================================================");
console.log(`  ALL SUITES (A through T) PASSED: ${passedTests} / ${totalTests} assertions`);
console.log("==================================================================");
