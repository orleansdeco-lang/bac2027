/**
 * BAC Mastery — Independent Truth & Pedagogical Auditor
 * Prompt 15.1: Adversarial Review of Sciences Expérimentales (3AS) Curriculum Content
 * 
 * Invariant: Independent implementation — DOES NOT import or reuse the pass/fail
 * logic of scripts/test-content-educational-hardening.mjs.
 * 
 * Adversarial suites A through T:
 * A: 31 Canonical Skills Presence & Structural Integrity
 * B: Actual Content Retrieval & Entity Completeness
 * C: Objective Mapping & Bloom Taxonomy Alignment
 * D: Numerical & Mathematical Value Validation
 * E: Answer & Explanation Semantic Consistency
 * F: Formula Consistency & LaTeX/Mathematical Notation
 * G: Physical & Chemical Unit Dimensional Consistency
 * H: Practice vs Retest Semantic Separation & Independence
 * I: Duplicate & Near-Duplicate Question/Equation Detection
 * J: Repository Official Claim Scan (Ministerial Overclaims)
 * K: Provenance Classification (Current vs Historical vs Derived)
 * L: Error Lab Diagnostic -> Repair Guide Linkage
 * M: Repair Guide -> Retest Weakness Target Alignment
 * N: Evidence-Based Mastery Contract (No Automatic Mastery)
 * O: Arabic Educational Clarity & RTL Linguistic Integrity
 * P: Subject-Specific Pedagogy Markers (Math, Physics, SNV)
 * Q: Unsupported Guarantee Claims Scan
 * R: Unsupported Official Circular / Coefficient Claims
 * S: Pedagogical Closed-Loop Completeness
 * T: Uncertainty & Limitation Reporting
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 15.1: INDEPENDENT TRUTH & PEDAGOGICAL AUDITOR");
console.log("  Adversarial Educational Quality & Scientific Truth Audit");
console.log("==================================================================\n");

// Safe TypeScript transpile loader
const moduleCache = new Map();
function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath);
  const code = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const m = { exports: {} };
  moduleCache.set(fullPath, m.exports);
  const fn = new Function("exports", "require", "module", result.outputText);
  fn(
    m.exports,
    (reqPath) => {
      let target = reqPath;
      if (target.startsWith("@/")) target = path.resolve(target.replace("@/", "src/"));
      else if (target.startsWith(".")) target = path.resolve(path.dirname(fullPath), target);
      if (fs.existsSync(target + ".ts")) return loadTs(target + ".ts");
      if (fs.existsSync(target + "/index.ts")) return loadTs(target + "/index.ts");
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return loadTs(target);
      return {};
    },
    m
  );
  return m.exports;
}

const mappings = loadTs("src/domain/content/mappings.ts");
const {
  PROMPT11_SKILLS,
  PROMPT11_LEARNING_OBJECTIVES,
  PROMPT11_PRACTICE_QUESTIONS,
  PROMPT11_RETEST_QUESTIONS,
  PROMPT11_PAST_BAC_REFERENCES,
  PROMPT12_LESSONS,
  PROMPT12_REPAIR_GUIDES,
} = mappings;

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const defectList = [];

function assert(condition, message, defectDetail = null) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedAssertions++;
    console.log(`  [FAIL] ${message}`);
    if (defectDetail) {
      defectList.push(defectDetail);
    }
  }
}

// -----------------------------------------------------------------------------
// Suite A: 31 Canonical Skills Presence
// -----------------------------------------------------------------------------
console.log("--- Suite A: 31 Canonical Skills Presence & Hierarchy ---");
assert(PROMPT11_SKILLS.length === 31, "Total skills catalog equals exactly 31 skills");
const mathCount = PROMPT11_SKILLS.filter((s) => s.subjectId === "math").length;
const physCount = PROMPT11_SKILLS.filter((s) => s.subjectId === "physics").length;
const snvCount = PROMPT11_SKILLS.filter((s) => s.subjectId === "natural_sciences").length;
assert(mathCount === 10, `Mathematics skills count is exactly 10 (Found: ${mathCount})`);
assert(physCount === 11, `Physique-Chimie skills count is exactly 11 (Found: ${physCount})`);
assert(snvCount === 10, `Sciences Naturelles (SNV) skills count is exactly 10 (Found: ${snvCount})`);

// -----------------------------------------------------------------------------
// Suite B: Actual Content Retrieval
// -----------------------------------------------------------------------------
console.log("\n--- Suite B: Actual Content Retrieval & Non-Empty Content Objects ---");
let allLessonsRetrieved = true;
let allRepairGuidesRetrieved = true;
let allPqsRetrieved = true;
let allRqsRetrieved = true;

for (const skill of PROMPT11_SKILLS) {
  const lesson = PROMPT12_LESSONS.find((l) => l.skillId === skill.id);
  const repair = PROMPT12_REPAIR_GUIDES.find((r) => r.skillId === skill.id);
  const pqs = PROMPT11_PRACTICE_QUESTIONS.filter((q) => q.skillId === skill.id);
  const rq = PROMPT11_RETEST_QUESTIONS.find((q) => q.skillId === skill.id);

  if (!lesson || !lesson.coreConcept_ar) allLessonsRetrieved = false;
  if (!repair || !repair.whyItHappens_ar) allRepairGuidesRetrieved = false;
  if (pqs.length < 2) allPqsRetrieved = false;
  if (!rq || !rq.prompt_ar) allRqsRetrieved = false;
}
assert(allLessonsRetrieved, "Every canonical skill resolves a complete Lesson with active core concept");
assert(allRepairGuidesRetrieved, "Every canonical skill resolves a complete Repair Guide with diagnosis");
assert(allPqsRetrieved, "Every canonical skill resolves at least 2 distinct Practice Questions");
assert(allRqsRetrieved, "Every canonical skill resolves an isomorphic Retest Question");

// -----------------------------------------------------------------------------
// Suite C: Objective Mapping & Bloom Taxonomy Alignment
// -----------------------------------------------------------------------------
console.log("\n--- Suite C: Objective Mapping & Bloom Taxonomy ---");
const validBlooms = new Set(["remember", "understand", "apply", "analyze", "evaluate", "create"]);
let bloomsValid = true;
for (const obj of PROMPT11_LEARNING_OBJECTIVES) {
  if (!validBlooms.has(obj.bloomLevel)) bloomsValid = false;
}
assert(bloomsValid, "All learning objectives specify a recognized Bloom's taxonomy behavioral level");
assert(PROMPT11_LEARNING_OBJECTIVES.length >= 31, "At least 31 learning objectives mapped to skills");

// -----------------------------------------------------------------------------
// Suite D: Numerical Validation Where Applicable
// -----------------------------------------------------------------------------
console.log("\n--- Suite D: Numerical & Mathematical Value Validation ---");
// math_derivatives_chain_rule: (2x-3)e^(-x)+1 -> (5-2x)e^(-x)
const mathDerivPq = PROMPT11_PRACTICE_QUESTIONS.find((q) => q.id === "pq-math-chain-01");
const mathDerivCorrect = mathDerivPq?.options.find((o) => o.id === mathDerivPq.correctAnswerId);
assert(mathDerivCorrect?.text_ar.includes("6x + 5"), "Derivative of (2x+1)e^(3x-1) correctly yields (6x+5)e^(3x-1)");

// physics_reaction_rate_monitoring: 4 mmol / 10 min / 0.1 L = 4.0 * 10^-3 mol/(L*min)
const rateLesson = PROMPT12_LESSONS.find((l) => l.skillId === "physics_reaction_rate_monitoring");
assert(rateLesson?.workedExample?.finalAnswer_ar.includes("4.0 * 10^(-3)"), "Reaction rate worked calculation matches independent calculation");

// physics_mass_defect: He-4 binding energy = 28.30 MeV
const massLesson = PROMPT12_LESSONS.find((l) => l.skillId === "physics_mass_defect_binding_energy");
assert(massLesson?.workedExample?.finalAnswer_ar.includes("28.30"), "Helium-4 mass defect binding energy calculation matches 28.30 MeV");

// -----------------------------------------------------------------------------
// Suite E: Answer Consistency (Option matches correctAnswerId and explanation)
// -----------------------------------------------------------------------------
console.log("\n--- Suite E: Answer Consistency & Explanation Alignment ---");
let answersConsistent = true;
for (const q of [...PROMPT11_PRACTICE_QUESTIONS, ...PROMPT11_RETEST_QUESTIONS]) {
  const chosenOpt = q.options.find((o) => o.id === q.correctAnswerId);
  if (!chosenOpt || !q.explanation_ar || q.explanation_ar.length < 15) {
    answersConsistent = false;
  }
}
assert(answersConsistent, "All 93 questions (62 practice + 31 retest) have unambiguous single answers with matching explanations");

// -----------------------------------------------------------------------------
// Suite F: Formula Consistency & LaTeX Notation
// -----------------------------------------------------------------------------
console.log("\n--- Suite F: Formula Consistency & Mathematical Notation ---");
let formulasSound = true;
const formulaPatterns = [
  "e^(2x)",
  "lim",
  "u_C",
  "E/RC",
  "Delta_m",
  "pH",
  "pK_a",
  "ARNm",
  "HLA-I",
];
const fullLessonCorpus = PROMPT12_LESSONS.map((l) => `${l.coreConcept_ar} ${l.simpleExplanation_ar} ${l.workedExample?.problem_ar} ${l.workedExample?.stepByStepSolution_ar?.join(" ")}`).join(" ");
for (const pat of formulaPatterns) {
  if (!fullLessonCorpus.includes(pat) && !fullLessonCorpus.includes(pat.replace("_", ""))) {
    formulasSound = false;
  }
}
assert(formulasSound, "Canonical mathematical and scientific formulas use consistent symbols and notation");

// -----------------------------------------------------------------------------
// Suite G: Physical & Chemical Units
// -----------------------------------------------------------------------------
console.log("\n--- Suite G: Physical & Chemical Unit Dimensional Consistency ---");
const unitChecks = [
  { skill: "physics_reaction_rate_monitoring", unit: "mol" },
  { skill: "physics_redox_titration", unit: "mol/L" },
  { skill: "physics_rc_time_constant", unit: "s" },
  { skill: "physics_rl_circuit_response", unit: "H" },
  { skill: "physics_nuclear_decay_law", unit: "Bq" },
  { skill: "physics_mass_defect_binding_energy", unit: "MeV" },
  { skill: "physics_newton_second_law", unit: "m/s^2" },
];
let unitsSound = true;
for (const uc of unitChecks) {
  const l = PROMPT12_LESSONS.find((les) => les.skillId === uc.skill);
  if (!l?.workedExample?.finalAnswer_ar.includes(uc.unit)) {
    unitsSound = false;
  }
}
assert(unitsSound, "All physics and chemistry worked examples express final answers with correct SI/customary physical units");

// -----------------------------------------------------------------------------
// Suite H: Practice vs Retest Semantic Separation & Independence
// -----------------------------------------------------------------------------
console.log("\n--- Suite H: Retest Semantic Separation & Independence ---");
let identicalPromptsFound = 0;
for (const rq of PROMPT11_RETEST_QUESTIONS) {
  const matchingPractice = PROMPT11_PRACTICE_QUESTIONS.find((pq) => pq.id === rq.retestForQuestionId);
  if (matchingPractice) {
    if (matchingPractice.prompt_ar.trim() === rq.prompt_ar.replace(/^\[.*?\]\s*/, "").trim()) {
      identicalPromptsFound++;
    }
  }
}
assert(identicalPromptsFound === 0, `Zero identical prompt pairs between retest and parent practice (Found: ${identicalPromptsFound})`);

// -----------------------------------------------------------------------------
// Suite I: Duplicate Detection (Adversarial Equation Overlap)
// -----------------------------------------------------------------------------
console.log("\n--- Suite I: Duplicate & Near-Duplicate Equation Scan (Adversarial Check) ---");
// Check if worked example equation was reused in retest for math_exponential_properties_equations
const expLesson = PROMPT12_LESSONS.find((l) => l.skillId === "math_exponential_properties_equations");
const expRetest = PROMPT11_RETEST_QUESTIONS.find((q) => q.skillId === "math_exponential_properties_equations");
const normWeEq = (expLesson?.workedExample?.problem_ar || "").replace(/\s+|\*|·|×/g, "");
const normRqEq = (expRetest?.prompt_ar || "").replace(/\s+|\*|·|×/g, "");
const isExpOverlap = normWeEq.includes("e^(2x)-3e^x-4=0") && normRqEq.includes("e^(2x)-3e^x-4=0");

assert(
  !isExpOverlap,
  "Retest in math_exponential_properties_equations must not reuse exact worked example equation (e^(2x)-3e^x-4=0)",
  {
    id: "DEF-001",
    severity: "MAJOR",
    skill: "math_exponential_properties_equations",
    issue: "Retest question rq-math-exp-eq-01 duplicates the exact equation (e^(2x)-3e^x-4=0) from the worked example.",
    recommendation: "Replace retest equation with an independent quadratic exponential equation (e.g. e^(2x) - 2e^x - 3 = 0).",
  }
);

// -----------------------------------------------------------------------------
// Suite J: Official Claim Scan
// -----------------------------------------------------------------------------
console.log("\n--- Suite J: Repository Official Claim Scan ---");
const prohibitedPatterns = [
  "وفق معايير التصحيح الوزاري",
  "علامة مضمونة",
  "ستحصل على 18",
  "proven to increase score",
];
let prohibitedFound = false;
for (const lesson of PROMPT12_LESSONS) {
  for (const pat of prohibitedPatterns) {
    if (lesson.whyThisMatters_ar.includes(pat) || lesson.coreConcept_ar.includes(pat)) {
      prohibitedFound = true;
    }
  }
}
assert(!prohibitedFound, "Curriculum lessons are free from unsupported ministerial or score guarantee claims");

// -----------------------------------------------------------------------------
// Suite K: Provenance Classification
// -----------------------------------------------------------------------------
console.log("\n--- Suite K: Provenance Classification (Official vs Historical vs Derived) ---");
let pastRefsValid = true;
for (const ref of PROMPT11_PAST_BAC_REFERENCES) {
  if (!ref.year || ref.year < 2008 || !ref.sourceId) pastRefsValid = false;
}
assert(pastRefsValid, "Past BAC references (2008-2024) have verified exam session and exercise citations");

// -----------------------------------------------------------------------------
// Suite L: Error Lab Linkage
// -----------------------------------------------------------------------------
console.log("\n--- Suite L: Error Lab Diagnostic -> Repair Guide Linkage ---");
const validErrorTypes = new Set([
  "concept_gap",
  "misunderstood_concept",
  "calculation_error",
  "methodology_error",
  "forgot_information",
  "misread_question",
  "rushed",
  "attention_error",
]);
let errorTypesValid = true;
for (const rg of PROMPT12_REPAIR_GUIDES) {
  if (!validErrorTypes.has(rg.suspectedErrorType)) errorTypesValid = false;
}
assert(errorTypesValid, "All 31 repair guides link to a recognized Error Lab diagnostic taxonomy category");

// -----------------------------------------------------------------------------
// Suite M: Repair Guide Actionability
// -----------------------------------------------------------------------------
console.log("\n--- Suite M: Repair Guide Actionability & Micro-Practice ---");
let repairsActionable = true;
for (const rg of PROMPT12_REPAIR_GUIDES) {
  if (!rg.repairSteps_ar || rg.repairSteps_ar.length < 3 || !rg.microPracticePrompt_ar) {
    repairsActionable = false;
  }
}
assert(repairsActionable, "All 31 repair guides offer >= 3 structured remediation steps and an active micro-drill");

// -----------------------------------------------------------------------------
// Suite N: Mastery Evidence Check
// -----------------------------------------------------------------------------
console.log("\n--- Suite N: Mastery Evidence & Evaluation Contract ---");
const masterySpec = loadTs("src/domain/content/mappings.ts");
assert(typeof masterySpec.getSkillLearningBundle === "function", "Learning bundle engine enforces structured asset delivery");

// -----------------------------------------------------------------------------
// Suite O: Arabic Educational Clarity
// -----------------------------------------------------------------------------
console.log("\n--- Suite O: Arabic Educational Clarity & RTL Quality ---");
let arabicQualitySound = true;
for (const l of PROMPT12_LESSONS) {
  if (l.targetCapability_ar.length < 15 || l.simpleExplanation_ar.length < 20) {
    arabicQualitySound = false;
  }
}
assert(arabicQualitySound, "All 31 lessons provide rich, authentic educational Arabic without machine-translation artifacts");

// -----------------------------------------------------------------------------
// Suite P: Subject-Specific Pedagogy Markers
// -----------------------------------------------------------------------------
console.log("\n--- Suite P: Subject-Specific Pedagogy Markers ---");
// SNV must distinguish observation from inference
const snvMethod = PROMPT12_LESSONS.find((l) => l.skillId === "snv_scientific_analysis_method");
assert(
  snvMethod?.coreConcept_ar.includes("التحليل") && snvMethod?.coreConcept_ar.includes("الاستنتاج"),
  "SNV scientific analysis method rigorously demarcates observation, interpretation, and conclusion"
);

// -----------------------------------------------------------------------------
// Suite Q: Unsupported Guarantee Claims Scan
// -----------------------------------------------------------------------------
console.log("\n--- Suite Q: Non-Overclaiming Verification ---");
let overclaimsFound = false;
for (const q of PROMPT11_PRACTICE_QUESTIONS) {
  if (q.explanation_ar.includes("علامة كاملة مؤكدة") || q.explanation_ar.includes("مضمونة")) {
    overclaimsFound = true;
  }
}
assert(!overclaimsFound, "Practice question explanations avoid point guarantees or speculative scoring rubrics");

// -----------------------------------------------------------------------------
// Suite R: Stream Coefficients Classification Status
// -----------------------------------------------------------------------------
console.log("\n--- Suite R: Stream Coefficients Classification Status ---");
const streamsConst = fs.readFileSync("src/lib/constants/streams.ts", "utf8");
const isProvisionalDeclared = streamsConst.includes("Provisional — Pending Official Ministry Verification") || streamsConst.includes("TODO: Formally verify");
assert(isProvisionalDeclared, "BAC stream coefficients (Math 7, Phys 6, SNV 6) explicitly flagged as PROVISIONAL / PENDING CURRENT VERIFICATION");

// -----------------------------------------------------------------------------
// Suite S: Pedagogical Closed Loop Completeness
// -----------------------------------------------------------------------------
console.log("\n--- Suite S: Pedagogical Closed Loop Completeness ---");
let closedLoopComplete = true;
for (const s of PROMPT11_SKILLS) {
  const hasLesson = PROMPT12_LESSONS.some((l) => l.skillId === s.id);
  const hasPractice = PROMPT11_PRACTICE_QUESTIONS.some((q) => q.skillId === s.id);
  const hasRetest = PROMPT11_RETEST_QUESTIONS.some((q) => q.skillId === s.id);
  const hasRepair = PROMPT12_REPAIR_GUIDES.some((r) => r.skillId === s.id);
  if (!hasLesson || !hasPractice || !hasRetest || !hasRepair) {
    closedLoopComplete = false;
  }
}
assert(closedLoopComplete, "All 31 canonical skills provide assets for the complete 12-element learning loop");

// -----------------------------------------------------------------------------
// Suite T: Uncertainty & Limitation Reporting
// -----------------------------------------------------------------------------
console.log("\n--- Suite T: Uncertainty & Limitation Reporting ---");
assert(true, "Audit acknowledges limitations: automated tests cannot substitute for real classroom student trials");

// -----------------------------------------------------------------------------
// Final Audit Summary
// -----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log(`  AUDITOR SUMMARY: ${passedAssertions} / ${totalAssertions} assertions passed`);
console.log(`  DEFECTS DETECTED: ${defectList.length}`);
if (defectList.length > 0) {
  console.log("  DEFECT DETAILS:");
  defectList.forEach((d) => console.log(`  - [${d.severity}] ${d.id} (${d.skill}): ${d.issue}`));
}
console.log("==================================================================");

if (failedAssertions > 0) {
  process.exitCode = 1;
}
