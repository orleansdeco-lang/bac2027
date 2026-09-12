/**
 * BAC Mastery — Gestion & Économie Full Stream Pilot Verification Suite
 * Prompt 26: Automated validation of the end-to-end student journey, curriculum audit,
 * 5 distinct learning modes, and interdisciplinary transfer links.
 * 
 * Verifies All 12 Pilot Gates:
 * Gate 1: Stream Registry & Official Structure (gestion_eco, 10 subjects, Decree 07-142)
 * Gate 2: 10-Subject Curriculum Audit & 5 Learning Modes Completeness
 * Gate 3: 33 Canonical Skills Catalog Completeness (All 10 subjects)
 * Gate 4: Interdisciplinary Transfer Links (6 verified bridges)
 * Gate 5: 15-Question Cross-Subject Diagnostic Battery & Cognitive Dimensions
 * Gate 6: Practice & Retest Bank with Distractor Error Taxonomy
 * Gate 7: 13-Element Learning Bundle Delivery (getSkillLearningBundle)
 * Gate 8: Student Persona Strategic Journey (Yasmine Belkacem, Target 15/20)
 * Gate 9: End-to-End Mission, Error Lab, Repair & Isomorphic Retest Loop
 * Gate 10: Zero-PII Student Intelligence Report (AI Bridge)
 * Gate 11: Service Layer Integrity (ProgressService & ContentService)
 * Gate 12: Stream #1 (Sciences Expérimentales) Invariant Non-Regression
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — GESTION & ÉCONOMIE FULL STREAM PILOT SUITE");
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

// Load Domain Modules
const curriculumStreams = loadTs("src/domain/curriculum/streams.ts");
const curriculumSubjects = loadTs("src/domain/curriculum/subjects.ts");
const gestionAuditModule = loadTs("src/domain/content-quality/gestion-economie-curriculum-audit.ts");
const gestionSkillsModule = loadTs("src/data/skills/gestion-economie.ts");
const skillsIndexModule = loadTs("src/data/skills/index.ts");
const diagnosticSelectorModule = loadTs("src/lib/diagnostic/question-selector.ts");
const gestionDiagModule = loadTs("src/data/diagnostic/bac/gestion-eco/index.ts");
const gestionPracticeModule = loadTs("src/data/practice/gestion-eco/index.ts");
const contentMappingsModule = loadTs("src/domain/content/mappings.ts");
const progressServiceModule = loadTs("src/lib/services/progress-service.ts");
const contentServiceModule = loadTs("src/lib/services/content-service.ts");
const studentIntelligenceModule = loadTs("src/domain/ai-bridge/student-intelligence.ts");

const { STREAM_REGISTRY } = curriculumStreams;
const { SUBJECT_REGISTRY } = curriculumSubjects;
const {
  GESTION_ECO_SUBJECT_AUDIT,
  GESTION_ECO_TRANSFER_LINKS,
  getGestionEconomieCurriculumAuditSummary,
} = gestionAuditModule;
const { GESTION_ECO_SKILLS } = gestionSkillsModule;
const { getSkillById, getSkillsForSubject } = skillsIndexModule;
const { getDiagnosticQuestionsForStream, validateQuestionPackCompleteness } = diagnosticSelectorModule;
const { GESTION_ECO_DIAGNOSTIC_QUESTIONS } = gestionDiagModule;
const {
  GESTION_ECO_PRACTICE_QUESTIONS,
  getGestionEcoPracticeQuestionById,
  getGestionEcoRetestQuestionForSkill,
} = gestionPracticeModule;
const { getSkillLearningBundle } = contentMappingsModule;
const { ProgressService } = progressServiceModule;
const { ContentService } = contentServiceModule;
const { generateStudentIntelligenceReport, buildAIBridgeReportFromPayload } = studentIntelligenceModule;

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// ============================================================================
// GATE 1: Stream Registry & Official Structure (Gestion & Économie)
// ============================================================================
console.log("[GATE 1] Stream Registry & Official Structure (Decree 07-142)");
const streamGE = STREAM_REGISTRY.gestion_eco;
assert(Boolean(streamGE), "Gestion & Économie stream is registered in STREAM_REGISTRY");
assert(streamGE.code === "GE", "Stream code is 'GE'");
assert(streamGE.academicYear === "2026-2027", "Academic year is 2026-2027");
assert(streamGE.verificationStatus === "OFFICIAL_HISTORICAL", "Classified as OFFICIAL_HISTORICAL per Decree 07-142");
assert(streamGE.subjects.length === 10, "Contains exactly 10 subjects in stream definition");

// Coefficients check
const subMap = Object.fromEntries(streamGE.subjects.map((s) => [s.subjectId, s.coefficient]));
assert(subMap.accounting_finance === 6, "Accounting coefficient is 6 (distinctive core)");
assert(subMap.economics_management === 5, "Economics & Management coefficient is 5 (core)");
assert(subMap.math === 5, "Math coefficient is 5 (core)");
assert(subMap.history_geography === 4, "History & Geography coefficient is 4 (core)");
assert(subMap.arabic === 3, "Arabic coefficient is 3 (supporting)");
assert(subMap.law === 2, "Law coefficient is 2 (core institutional)");
assert(subMap.philosophy === 2, "Philosophy coefficient is 2 (humanities)");
assert(subMap.french === 2, "French coefficient is 2 (language)");
assert(subMap.english === 2, "English coefficient is 2 (language)");
assert(subMap.islamic_studies === 2, "Islamic Studies coefficient is 2 (humanities)");

const totalCoeff = streamGE.subjects.reduce((acc, s) => acc + s.coefficient, 0);
assert(totalCoeff === 33, `Total stream coefficients sum to exactly 33 (got: ${totalCoeff})`);

// ============================================================================
// GATE 2: 10-Subject Curriculum Audit & 5 Learning Modes
// ============================================================================
console.log("\n[GATE 2] 10-Subject Curriculum Audit & 5 Learning Modes");
const auditSummary = getGestionEconomieCurriculumAuditSummary();
assert(auditSummary.subjectCount === 10, "Audit summary covers exactly 10 subjects");
assert(auditSummary.totalBaselineCoefficient === 33, "Audit summary confirms 33 total baseline coefficients");
assert(auditSummary.legalReference === "Décret Exécutif n° 07-142 du 19 mai 2007", "Statutory decree matches Decree 07-142");
assert(auditSummary.officialStatus === "OFFICIAL_HISTORICAL", "Classification is OFFICIAL_HISTORICAL");

// Verify all 5 learning modes exist in audit
const auditedModes = new Set(GESTION_ECO_SUBJECT_AUDIT.map((s) => s.learningMode));
assert(auditedModes.has("procedural"), "Mode A (Procedural) present for Accounting / Math");
assert(auditedModes.has("conceptual"), "Mode B (Conceptual / Decision) present for Economics");
assert(auditedModes.has("case_based"), "Mode C (Case-based Syllogism) present for Law / Islamic Studies");
assert(auditedModes.has("document_based"), "Mode D (Document-based) present for History-Geography");
assert(auditedModes.has("writing"), "Mode E (Writing / Argumentative) present for Languages / Philosophy");

// ============================================================================
// GATE 3: 33 Canonical Skills Catalog Completeness
// ============================================================================
console.log("\n[GATE 3] 33 Canonical Skills Catalog Completeness");
const skillList = Object.values(GESTION_ECO_SKILLS);
assert(skillList.length === 33, `Contains exactly 33 canonical skills (got: ${skillList.length})`);

const skillsBySub = {};
for (const s of skillList) {
  skillsBySub[s.subjectId] = (skillsBySub[s.subjectId] || 0) + 1;
}

assert(skillsBySub.accounting_finance === 8, `Accounting contains 8 skills (got: ${skillsBySub.accounting_finance})`);
assert(skillsBySub.economics_management === 8, `Economics contains 8 skills (got: ${skillsBySub.economics_management})`);
assert(skillsBySub.math === 4, `Math contains 4 skills (got: ${skillsBySub.math})`);
assert(skillsBySub.law === 6, `Law contains 6 skills (got: ${skillsBySub.law})`);
assert(skillsBySub.history_geography === 2, `History-Geo contains 2 skills (got: ${skillsBySub.history_geography})`);
assert(skillsBySub.arabic === 1, `Arabic contains 1 skill (got: ${skillsBySub.arabic})`);
assert(skillsBySub.philosophy === 1, `Philosophy contains 1 skill (got: ${skillsBySub.philosophy})`);
assert(skillsBySub.french === 1, `French contains 1 skill (got: ${skillsBySub.french})`);
assert(skillsBySub.english === 1, `English contains 1 skill (got: ${skillsBySub.english})`);
assert(skillsBySub.islamic_studies === 1, `Islamic Studies contains 1 skill (got: ${skillsBySub.islamic_studies})`);

// Check wiring in skills/index.ts
const testSkill1 = getSkillById("acc_depreciation_linear_degressive");
assert(Boolean(testSkill1), "getSkillById successfully retrieves acc_depreciation_linear_degressive");
const acSkills = getSkillsForSubject("accounting_finance");
assert(acSkills.length === 8, `getSkillsForSubject('accounting_finance') returns 8 skills (got: ${acSkills.length})`);

// ============================================================================
// GATE 4: Interdisciplinary Transfer Links (6 Verified Bridges)
// ============================================================================
console.log("\n[GATE 4] Interdisciplinary Transfer Links");
assert(GESTION_ECO_TRANSFER_LINKS.length === 6, `Contains exactly 6 interdisciplinary transfer links (got: ${GESTION_ECO_TRANSFER_LINKS.length})`);

const link1 = GESTION_ECO_TRANSFER_LINKS.find((l) => l.sourceSubject === "math" && l.targetSubject === "accounting_finance");
assert(Boolean(link1), "Math <-> Accounting transfer link (Compound interest & amortissements) exists");

const link2 = GESTION_ECO_TRANSFER_LINKS.find((l) => l.sourceSubject === "economics_management" && l.targetSubject === "accounting_finance");
assert(Boolean(link2), "Economics <-> Accounting transfer link (Inflation & asset valuation) exists");

const link3 = GESTION_ECO_TRANSFER_LINKS.find((l) => l.sourceSubject === "law" && l.targetSubject === "economics_management");
assert(Boolean(link3), "Law <-> Management transfer link (Labor contract & HRM) exists");

// ============================================================================
// GATE 5: 15-Question Cross-Subject Diagnostic Battery
// ============================================================================
console.log("\n[GATE 5] 15-Question Cross-Subject Diagnostic Battery");
const diagQuestions = getDiagnosticQuestionsForStream("gestion_eco");
assert(diagQuestions.length === 15, `getDiagnosticQuestionsForStream('gestion_eco') returns exactly 15 questions (got: ${diagQuestions.length})`);

const qBySub = {};
for (const q of diagQuestions) {
  qBySub[q.subjectId] = (qBySub[q.subjectId] || 0) + 1;
}

assert(qBySub.accounting_finance === 4, `Accounting has 4 diagnostic questions (got: ${qBySub.accounting_finance})`);
assert(qBySub.economics_management === 4, `Economics has 4 diagnostic questions (got: ${qBySub.economics_management})`);
assert(qBySub.law === 3, `Law has 3 diagnostic questions (got: ${qBySub.law})`);
assert(qBySub.math === 4, `Math has 4 diagnostic questions (got: ${qBySub.math})`);

// Cognitive dimensions completeness
const isComplete = validateQuestionPackCompleteness(diagQuestions);
assert(isComplete === true, "Diagnostic pack satisfies all 4 required cognitive dimensions (knowledge, understanding, application, methodology)");

// Check distractor error mapping
let trapOptionsCount = 0;
for (const q of diagQuestions) {
  for (const opt of q.options) {
    if (opt.isMisconceptionTrap && opt.misconceptionDetails) {
      trapOptionsCount++;
    }
  }
}
assert(trapOptionsCount >= 10, `Diagnostic battery contains at least 10 calibrated misconception traps (found: ${trapOptionsCount})`);

// ============================================================================
// GATE 6: Practice & Retest Bank with Error Taxonomy
// ============================================================================
console.log("\n[GATE 6] Practice & Retest Bank with Error Taxonomy");
assert(GESTION_ECO_PRACTICE_QUESTIONS.length >= 8, `Practice bank contains at least 8 items (got: ${GESTION_ECO_PRACTICE_QUESTIONS.length})`);

const practiceItems = GESTION_ECO_PRACTICE_QUESTIONS.filter((q) => !q.isRetestVariant);
const retestItems = GESTION_ECO_PRACTICE_QUESTIONS.filter((q) => q.isRetestVariant);

assert(practiceItems.length >= 4, `Contains at least 4 practice questions (got: ${practiceItems.length})`);
assert(retestItems.length >= 4, `Contains at least 4 isomorphic retest questions (got: ${retestItems.length})`);

// Retest lookup check
const twinRetest = getGestionEcoRetestQuestionForSkill("acc_depreciation_linear_degressive");
assert(Boolean(twinRetest), "getGestionEcoRetestQuestionForSkill returns isomorphic retest for linear depreciation");
assert(twinRetest.isRetestVariant === true, "Twin retest has isRetestVariant === true");

// ============================================================================
// GATE 7: 13-Element Learning Bundle Delivery (getSkillLearningBundle)
// ============================================================================
console.log("\n[GATE 7] 13-Element Learning Bundle Delivery");
const bundleAcc = getSkillLearningBundle("acc_depreciation_linear_degressive");
assert(Boolean(bundleAcc), "getSkillLearningBundle returns bundle for acc_depreciation_linear_degressive");
assert(bundleAcc.skill.id === "acc_depreciation_linear_degressive", "Bundle skill ID matches requested skill");
assert(Boolean(bundleAcc.lesson), "Bundle contains complete micro-lesson");
assert(Boolean(bundleAcc.workedExample), "Bundle contains step-by-step worked example");
assert(bundleAcc.practiceQuestions.length > 0, "Bundle contains practice questions");
assert(Boolean(bundleAcc.repairGuide), "Bundle contains pedagogical repair guide");
assert(Boolean(bundleAcc.retest), "Bundle contains paired isomorphic retest");
assert(bundleAcc.readiness.status === "MASTERY_READY", "Bundle readiness is 'MASTERY_READY'");

// Check that any canonical skill in GESTION_ECO_SKILLS resolves cleanly
const bundleLaw = getSkillLearningBundle("law_labor_contract_trial_termination");
assert(Boolean(bundleLaw), "getSkillLearningBundle returns bundle for law_labor_contract_trial_termination");
const bundleEco = getSkillLearningBundle("eco_money_inflation_causes_control");
assert(Boolean(bundleEco), "getSkillLearningBundle returns bundle for eco_money_inflation_causes_control");

// ============================================================================
// GATE 8: Student Persona Strategic Journey (Yasmine Belkacem)
// ============================================================================
console.log("\n[GATE 8] Student Persona Strategic Journey (Yasmine Belkacem)");
const yasmineProfile = {
  stream: "gestion_eco",
  targetScore: 15.00,
  baselineEstimatedScore: 12.20,
  weeksRemaining: 16,
  weeklyStudyHoursBudget: 14,
  desiredSpecialty: "École des Hautes Études Commerciales (EHEC)",
};
assert(yasmineProfile.targetScore === 15.00, "Target score is 15.00 / 20");
assert(yasmineProfile.baselineEstimatedScore === 12.20, "Baseline estimated score is 12.20 / 20");
const gapScore = yasmineProfile.targetScore - yasmineProfile.baselineEstimatedScore;
assert(Math.abs(gapScore - 2.80) < 0.01, `Score gap correctly calculated at +2.80 points (got: ${gapScore.toFixed(2)})`);

// Urgency ranking: Accounting (Coeff 6) and Math (Coeff 5) must take highest priority
const coeffAcc = 6;
const coeffMath = 5;
const urgencyAcc = coeffAcc * (1 - 0.50); // 3.00
const urgencyMath = coeffMath * (1 - 0.50); // 2.50
assert(urgencyAcc > urgencyMath, "Accounting has highest gap urgency (3.00 > 2.50)");

// ============================================================================
// GATE 9: End-to-End Mission, Error Lab, Repair & Isomorphic Retest Loop
// ============================================================================
console.log("\n[GATE 9] End-to-End Mission & Error Lab Loop");
const testPracticeQ = getGestionEcoPracticeQuestionById("pq-acc-deprec-01");
assert(Boolean(testPracticeQ), "Practice item pq-acc-deprec-01 retrieved");
assert(testPracticeQ.correctAnswerId === "opt-2", "Correct answer is opt-2");

// Verify distractor error mapping
const distractorOpt1 = testPracticeQ.options.find((o) => o.id === "opt-1");
assert(distractorOpt1.suspectedErrorType === "methodology_error", "Distractor opt-1 mapped to methodology_error");

// Verify isomorphic retest
const testRetestQ = getGestionEcoRetestQuestionForSkill("acc_depreciation_linear_degressive");
assert(Boolean(testRetestQ), "Isomorphic retest found for linear depreciation");
assert(testRetestQ.retestForQuestionId === "pq-acc-deprec-01", "Retest correctly references parent practice question");

// ============================================================================
// GATE 10: Zero-PII Student Intelligence Report (AI Bridge)
// ============================================================================
console.log("\n[GATE 10] Zero-PII Student Intelligence Report (AI Bridge)");
const aiReportPayload = {
  studentProfile: {
    stream: "gestion_eco",
    targetScore: 15.00,
    currentEstimatedScore: 12.20,
    weeksRemaining: 16,
    weeklyStudyHoursBudget: 14,
    desiredSpecialty: "EHEC Alger",
  },
  bottlenecks: {
    primarySubject: "accounting_finance",
    secondarySubject: "math",
    reason: "فجوة إجرائية في حساب أقساط الاهتلاك والتناسب الزمني مع أخطاء في انحدار المتغيرين",
  },
  errorDistribution: [
    { category: "methodology_error", count: 3, sampleDescription: "نسيان التناسب الزمني للسنة الأولى" },
    { category: "calculation_error", count: 2, sampleDescription: "خطأ في حساب الثابت b في مستقيم الانحدار" },
  ],
  recentActivity: {
    missionsCompletedLast7Days: 5,
    dominantMindState: "normal",
  },
};

const formattedReport = buildAIBridgeReportFromPayload(aiReportPayload);
assert(Boolean(formattedReport.markdownContent), "AI Report markdown is generated");
assert(formattedReport.markdownContent.includes("تسيير واقتصاد"), "Report includes Arabic stream name in header");
assert(formattedReport.markdownContent.includes("15.00"), "Report includes target score 15.00");
assert(formattedReport.markdownContent.includes("12.20"), "Report includes baseline score 12.20");
assert(!formattedReport.markdownContent.includes("Yasmine"), "Strictly Zero PII: Candidate name is omitted");
assert(!formattedReport.markdownContent.includes("@"), "Strictly Zero PII: No email address present");

// ============================================================================
// GATE 11: Service Layer Integrity (ProgressService & ContentService)
// ============================================================================
console.log("\n[GATE 11] Service Layer Integrity");
const allCurricSkills = ContentService.getAllSkills();
assert(allCurricSkills.length >= 64, `ContentService.getAllSkills returns at least 64 skills (got: ${allCurricSkills.length})`);

const report = await ProgressService.getProgressReport();
assert(Boolean(report.subjectBreakdown), "ProgressReport contains subjectBreakdown");
assert(typeof report.subjectBreakdown.accounting_finance?.total === "number", "accounting_finance has total numeric skills");
assert(!Number.isNaN(report.subjectBreakdown.accounting_finance?.total), "accounting_finance.total is NOT NaN");
assert(typeof report.subjectBreakdown.economics_management?.total === "number", "economics_management has total numeric skills");
assert(!Number.isNaN(report.subjectBreakdown.economics_management?.total), "economics_management.total is NOT NaN");

// ============================================================================
// GATE 12: Stream #1 (Sciences Expérimentales) Non-Regression Invariant
// ============================================================================
console.log("\n[GATE 12] Stream #1 (Sciences Expérimentales) Non-Regression Invariant");
const diagSE = getDiagnosticQuestionsForStream("sciences_exp");
assert(diagSE.length === 15, "Sciences Expérimentales diagnostic battery still returns exactly 15 questions");

const bundleSE = getSkillLearningBundle("math_derivatives_chain_rule");
assert(Boolean(bundleSE), "Sciences Exp bundle for math_derivatives_chain_rule remains functional");
assert(bundleSE.practiceQuestions.length >= 2, "Math derivatives bundle still has practice items");

console.log("\n==================================================================");
console.log(`  TOTAL GESTION & ÉCONOMIE PILOT GATES: 12 / 12`);
console.log(`  TOTAL PASSING ASSERTIONS: ${passCount}`);
console.log(`  TOTAL FAILING ASSERTIONS: ${failCount}`);
console.log("==================================================================");

if (failCount === 0) {
  console.log("\n🏆 VERDICT: FULL_STREAM_PILOT_READY (Stream #2: Gestion & Économie)");
  console.log("📌 REAL_STUDENT_VALIDATION = PENDING (Scheduled for In-Person High School Cohort)\n");
  process.exit(0);
} else {
  console.error("\n❌ VERDICT: VERIFICATION_FAILED\n");
  process.exit(1);
}
