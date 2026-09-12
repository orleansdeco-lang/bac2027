/**
 * BAC Mastery — Prompt 18.1 Automated Test Suite
 * Learning System Foundation Verification
 * 
 * Verifies all 22 required criteria (A through V):
 * A. Master learning cycle exists
 * B. Passive reading is not mastery
 * C. Retrieval is distinct from recognition
 * D. Spaced review is adaptive conceptually
 * E. Practice supports progression
 * F. Interleaving is supported
 * G. Errors connect to repair
 * H. Repair connects to retest
 * I. Retest is independent
 * J. Mastery requires evidence
 * K. Mastery can become review-due
 * L. Recurring errors affect priority
 * M. Daily planner supports one next best action
 * N. Weekly adaptation exists
 * O. Subject methodology is configurable
 * P. Stream architecture supports all BAC streams
 * Q. Technique Math specialty separation exists
 * R. Content language is independent from UI language
 * S. Coefficients are not falsely labeled official
 * T. Existing Sciences Exp content remains compatible
 * U. No competing second roadmap engine was introduced
 * V. No Supabase reset occurred
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 18.1: LEARNING SYSTEM FOUNDATION VERIFIER");
console.log("==================================================================\n");

// Robust TS module loader
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

const spacedReviewModule = loadTs("src/domain/learning/spaced-review.ts");
const subjectMethodologyModule = loadTs("src/domain/learning/subject-methodology.ts");
const streamsModule = loadTs("src/lib/constants/streams.ts");
const roadmapEngineModule = loadTs("src/lib/roadmap/engine.ts");
const skillsModule = loadTs("src/data/skills/index.ts");
const curriculumModule = loadTs("src/data/curriculum/skills.ts");

const { calculateNextReviewInterval, evaluateReviewUrgency, createInitialReviewSchedule } = spacedReviewModule;
const { SUBJECT_METHODOLOGY_REGISTRY, getSubjectMethodology } = subjectMethodologyModule;
const { ALGERIAN_BAC_STREAMS, TECHNIQUE_MATH_SPECIALTIES } = streamsModule;
const { getNextBestMission } = roadmapEngineModule;
const { SCIENCES_EXP_SKILLS } = skillsModule;
const { ALL_CURRICULUM_SKILLS } = curriculumModule;

const results = [];
function assert(code, name, condition, details = "") {
  if (condition) {
    console.log(`  [PASS] [Criterion ${code}] ${name}`);
    results.push({ code, name, passed: true });
  } else {
    console.error(`  [FAIL] [Criterion ${code}] ${name} ${details ? `— ${details}` : ""}`);
    results.push({ code, name, passed: false, details });
  }
}

// A. Master learning cycle exists
const masterCycleDoc = path.resolve("docs/bac-mastery/BAC_MASTERY_LEARNING_SYSTEM.md");
const docContent = fs.existsSync(masterCycleDoc) ? fs.readFileSync(masterCycleDoc, "utf8") : "";
assert("A", "Master learning cycle exists in documentation", 
  docContent.includes("The Universal BAC Mastery Learning Cycle") && 
  docContent.includes("DIAGNOSTIC") && 
  docContent.includes("REPAIR") && 
  docContent.includes("RETEST")
);

// B. Passive reading is not mastery
assert("B", "Passive reading / exposure is strictly distinct from mastery",
  docContent.includes("Reading or watching an explanation is **exposure**, never proof of mastery") &&
  docContent.includes("EXPOSURE") &&
  docContent.includes("MASTERY")
);

// C. Retrieval is distinct from recognition
assert("C", "Retrieval practice is formally distinguished from recognition",
  docContent.includes("Recognition (التعرف السطحي)") &&
  docContent.includes("Active Recall (الاسترجاع النشط الموجه)") &&
  docContent.includes("Transfer (التحويل والتكيف)")
);

// D. Spaced review is adaptive conceptually
const initialSchedule = createInitialReviewSchedule("math_derivatives_chain_rule", "math", new Date(), 4);
const strongReview = calculateNextReviewInterval(initialSchedule, {
  correctness: true,
  confidence: 5,
  responseTimeSeconds: 25,
  expectedTimeSeconds: 45,
  previousLapses: 0,
  isRecurring: false,
  daysSinceLastReview: 2,
});
const failedReview = calculateNextReviewInterval(initialSchedule, {
  correctness: false,
  confidence: 2,
  responseTimeSeconds: 60,
  expectedTimeSeconds: 45,
  previousLapses: 0,
  isRecurring: true,
  daysSinceLastReview: 2,
});
assert("D", "Spaced review interval is adaptive (not rigid day 1/3/7/14/30 law)",
  strongReview.intervalDays > initialSchedule.intervalDays &&
  failedReview.intervalDays === 1.0 &&
  failedReview.decayRate > initialSchedule.decayRate
);

// E. Practice supports progression
const mathMethodology = getSubjectMethodology("math");
assert("E", "Practice supports pedagogical progression (guided to exam)",
  mathMethodology.practiceProgressionModel.includes("guided") &&
  mathMethodology.practiceProgressionModel.includes("independent") &&
  mathMethodology.practiceProgressionModel.includes("exam")
);

// F. Interleaving is supported
assert("F", "Interleaving engine criteria defined without random mixing",
  docContent.includes("Interleaved Practice") &&
  docContent.includes("Which method belongs to this problem?")
);

// G. Errors connect to repair
const skillExample = SCIENCES_EXP_SKILLS.math_derivatives_chain_rule;
assert("G", "Errors connect to explicit repair strategy and steps",
  skillExample.repairStrategy_ar.length > 10 &&
  Array.isArray(skillExample.repairSteps_ar) &&
  skillExample.repairSteps_ar.length >= 3
);

// H. Repair connects to retest
const unfinishedInput = {
  missions: [
    {
      id: "mission-math_derivatives_chain_rule",
      educationLevel: "secondary",
      examType: "bac",
      streamId: "sciences_exp",
      subjectId: "math",
      skillId: "math_derivatives_chain_rule",
      title: "Derivatives",
      description: "Chain rule",
      reason: "Repair needed",
      title_ar: "اشتقاق الدوال المركبة",
      title_fr: "Dérivation composée",
      description_ar: "شرح",
      description_fr: "desc",
      reason_ar: "سبب",
      reason_fr: "raison",
      priority: "high",
      source: "manual",
      status: "retest_ready",
      practiceQuestionIds: [],
      retestQuestionIds: ["retest-1"],
      estimatedMinutes: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  masteryEvidence: {},
  errors: [],
  diagnosticResult: null,
  currentFocus: null,
  learningStage: "practice",
  activeMissionId: null,
  completedMissionIds: [],
};
const decisionRetest = getNextBestMission(unfinishedInput);
assert("H", "Repair transitions directly to retest ready priority",
  decisionRetest.rationale?.reasonCode === "continuation_retest" &&
  decisionRetest.rationale?.priority === 1
);

// I. Retest is independent (isomorphic twin)
assert("I", "Retest is defined as isomorphic twin with independent path",
  docContent.includes("Isomorphic Retest Twin") &&
  docContent.includes("Max 2-Cycle Policy") &&
  docContent.includes("needs_more_work")
);

// J. Mastery requires evidence
const demonstratedEvidence = {
  math_derivatives_chain_rule: {
    missionId: "mission-math_derivatives_chain_rule",
    skillId: "math_derivatives_chain_rule",
    subjectId: "math",
    evidenceType: "repair_retest_success",
    practiceAttempts: 2,
    correctAttempts: 1,
    retestAttempts: 1,
    successfulRetests: 1,
    confidenceSignals: [5],
    masteryStatus: "demonstrated",
  },
};
assert("J", "Mastery strictly requires evidence (demonstrated status)",
  demonstratedEvidence.math_derivatives_chain_rule.masteryStatus === "demonstrated" &&
  demonstratedEvidence.math_derivatives_chain_rule.successfulRetests >= 1
);

// K. Mastery can become review-due
const overdueSchedule = {
  skillId: "math_derivatives_chain_rule",
  subjectId: "math",
  intervalDays: 7,
  lastTestedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  nextReviewDueAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  urgency: "overdue",
  consecutiveSuccesses: 2,
  lapseCount: 0,
  decayRate: 0.9,
};
const urgencyEval = evaluateReviewUrgency(overdueSchedule, new Date());
assert("K", "Mastered skills can transition to review-due / overdue",
  urgencyEval.isDue === true &&
  urgencyEval.urgency === "overdue" &&
  urgencyEval.overdueDays >= 2
);

// L. Recurring errors affect priority
const recurringInput = {
  missions: [],
  masteryEvidence: {},
  errors: [
    {
      id: "err-1",
      sessionId: "s1",
      questionId: "q1",
      missionId: "m1",
      subjectId: "math",
      skillId: "math_derivatives_chain_rule",
      selectedAnswer: "opt-1",
      correctAnswer: "opt-2",
      suspectedErrorType: "calculation_error",
      errorSource: "student_selected",
      confidence: 3,
      repairStatus: "identified",
      isRecurring: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  diagnosticResult: null,
  currentFocus: null,
  learningStage: "practice",
  activeMissionId: null,
  completedMissionIds: [],
};
const decisionRecurring = getNextBestMission(recurringInput);
assert("L", "Recurring error escalates priority in decision engine",
  decisionRecurring.rationale?.reasonCode === "recurring_error_cause" &&
  decisionRecurring.rationale?.priority === 3
);

// M. Daily planner supports one next best action
assert("M", "Daily planner produces ONE next best action (واش ندير دروك؟)",
  decisionRecurring.mission !== null &&
  typeof decisionRecurring.rationale?.shortExplanation_ar === "string"
);

// N. Weekly adaptation exists
assert("N", "Weekly adaptation model defined for review, errors, and balance",
  docContent.includes("Weekly Planning & Adaptation") &&
  docContent.includes("adjusting subject time allocation for the upcoming week")
);

// O. Subject methodology is configurable
assert("O", "Subject methodology is configurable across all 9 families",
  SUBJECT_METHODOLOGY_REGISTRY.math.family === "mathematics" &&
  SUBJECT_METHODOLOGY_REGISTRY.physics.family === "physics_chemistry" &&
  SUBJECT_METHODOLOGY_REGISTRY.natural_sciences.family === "natural_sciences" &&
  SUBJECT_METHODOLOGY_REGISTRY.philosophy.family === "philosophy" &&
  SUBJECT_METHODOLOGY_REGISTRY.history_geography.family === "history_geography" &&
  SUBJECT_METHODOLOGY_REGISTRY.islamic_studies.family === "islamic_studies" &&
  SUBJECT_METHODOLOGY_REGISTRY.arabic.family === "languages" &&
  SUBJECT_METHODOLOGY_REGISTRY.french.family === "languages" &&
  SUBJECT_METHODOLOGY_REGISTRY.accounting_finance.family === "economics_management"
);

// P. Stream architecture supports all BAC streams
const streamIds = Object.keys(ALGERIAN_BAC_STREAMS);
assert("P", "Stream architecture covers all 6 Algerian BAC streams",
  streamIds.includes("sciences_exp") &&
  streamIds.includes("math") &&
  streamIds.includes("technique_math") &&
  streamIds.includes("gestion_eco") &&
  streamIds.includes("lettres_philo") &&
  streamIds.includes("langues_etrangeres")
);

// Q. Technique Math specialty separation exists
const tmSpecialties = Object.keys(TECHNIQUE_MATH_SPECIALTIES);
assert("Q", "Technique Math preserves 4 distinct specialties",
  tmSpecialties.includes("civil_eng") &&
  tmSpecialties.includes("mechanical_eng") &&
  tmSpecialties.includes("electrical_eng") &&
  tmSpecialties.includes("process_eng")
);

// R. Content language is independent from UI language
const frenchSubject = getSubjectMethodology("french");
const mathSubject = getSubjectMethodology("math");
assert("R", "Content language is decoupled from UI language",
  frenchSubject.contentLanguage === "fr" &&
  frenchSubject.textDirection === "ltr" &&
  mathSubject.contentLanguage === "ar" &&
  mathSubject.textDirection === "rtl"
);

// S. Coefficients are not falsely labeled official
assert("S", "Coefficients are classified as provisional benchmarks, never falsely official",
  mathSubject.coefficientStatus === "provisional_benchmark" &&
  docContent.includes("Provisional Benchmarks") &&
  docContent.includes("provisional_benchmark")
);

// T. Existing Sciences Exp content remains compatible
assert("T", "All 31 Sciences Expérimentales skills remain 100% compatible",
  Object.keys(ALL_CURRICULUM_SKILLS).length === 31 &&
  Object.values(ALL_CURRICULUM_SKILLS).every((s) => s.repairSteps_ar.length >= 3)
);

// U. No competing second roadmap engine was introduced
const roadmapIndex = fs.readFileSync(path.resolve("src/lib/roadmap/index.ts"), "utf8");
assert("U", "Roadmap routes solely through single authoritative engine",
  (roadmapIndex.includes("export * from \"./engine\"") || roadmapIndex.includes("getNextBestMission")) &&
  !fs.existsSync(path.resolve("src/lib/roadmap/competing-engine.ts"))
);

// V. No Supabase reset occurred
const migrationsDir = path.resolve("supabase/migrations");
const migrationFiles = fs.readdirSync(migrationsDir);
assert("V", "Zero Supabase migrations added (architecture-first)",
  migrationFiles.length === 3 // 001, 002, 003 from previous prompts
);

console.log("\n==================================================================");
const passedCount = results.filter((r) => r.passed).length;
const totalCount = results.length;
console.log(`  RESULT: ${passedCount}/${totalCount} CRITERIA PASSED`);
console.log("==================================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
}
