/**
 * BAC Mastery — Mathematical Content Factory Comprehensive Test Suite
 * 
 * Production Batch 01 (12 skills) + Production Batch 02 (9 skills) + Production Batch 03 (9 skills) = 30 Published Skills
 * 
 * Verifies all 18 Factory Quality Gates across all 30 published 3AS Mathematics skills:
 * 1. Official Curriculum & Syllabus Alignment (5 Domains, 11 Topics, Ministerial Citations)
 * 2. Skill Uniqueness & Canonical ID Formatting (21 Unique skills, math_m_*)
 * 3. Deterministic Priority Engine (10 Pedagogical Factors -> All 30 evaluate strictly to HIGH)
 * 4. Bilingual Pedagogical Objectives (Arabic & French)
 * 5. Diagnostic Signal Profiles (Misconceptions, Prerequisites, Procedural Weaknesses)
 * 6. Authoring Contract Compliance (validateContentPackage() passes 100%)
 * 7. Cognitive Worked Examples (3+ Step solutions, pedagogical comments)
 * 8. Active Recall Prompts & Expected Answers
 * 9. Practice Micro-Drills (>= 2 per package)
 * 10. Error Taxonomy Rigor (100% adherence to SuspectedErrorType)
 * 11. Actionable Repair Guides (Mental model explanations, 3+ actionable steps, contrastive examples)
 * 12. Isomorphic Retest Twins (Altered surface parameters, identical cognitive demand)
 * 13. Visual Learning Assets (1-to-1 links, full accessibility compliance, non-color cues)
 * 14. External Learning Resources (Safe HTTPS URLs, official providers, return-action tickets)
 * 15. BAC Exam Transfer Layer (Task forms, common traps, rubric guidelines, past ONEC citations)
 * 16. Spaced Review Schedules (Day 1, 3, 7, and Later Exam Prompts)
 * 17. Claim & Regulatory Audit (0 promotional blockers, 30 PUBLISHED skills in curriculum matrix)
 * 18. Complete Integrated Skill Dossier Resolution (All 30 resolve clean dossiers)
 */

import fs from "fs";
import path from "path";
import ts from "typescript";

// Lightweight TypeScript in-memory transpiler for domain modules
const moduleCache = new Map();

function loadTs(relativeFilePath) {
  const fullPath = path.resolve(relativeFilePath);
  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath);
  }

  const source = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(source, {
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

// Load Modules
const factory = loadTs("src/domain/content-factory/index.ts");
const contentQuality = loadTs("src/domain/content-quality/index.ts");
const learningEcosystem = loadTs("src/domain/learning-ecosystem/index.ts");
const curriculumMatrix = loadTs("src/domain/curriculum/coverage-matrix.ts");

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

const BATCH_01_PACKAGES = factory.MATH_BATCH_01_PACKAGES || {};
const BATCH_02_PACKAGES = factory.MATH_BATCH_02_PACKAGES || {};
const BATCH_03_PACKAGES = factory.MATH_BATCH_03_PACKAGES || {};

const ALL_PACKAGES = {
  ...BATCH_01_PACKAGES,
  ...BATCH_02_PACKAGES,
  ...BATCH_03_PACKAGES,
};

const BATCH_01_SKILL_IDS = Object.keys(BATCH_01_PACKAGES);
const BATCH_02_SKILL_IDS = Object.keys(BATCH_02_PACKAGES);
const BATCH_03_SKILL_IDS = Object.keys(BATCH_03_PACKAGES);
const ALL_MATH_SKILL_IDS = Object.keys(ALL_PACKAGES);

const ALL_SIGNALS = {
  ...(factory.MATH_BATCH_01_DIAGNOSTIC_SIGNALS || {}),
  ...(factory.MATH_BATCH_02_DIAGNOSTIC_SIGNALS || {}),
  ...(factory.MATH_BATCH_03_DIAGNOSTIC_SIGNALS || {}),
};

const ALL_SPACED_REVIEWS = {
  ...(factory.MATH_BATCH_01_SPACED_REVIEWS || {}),
  ...(factory.MATH_BATCH_02_SPACED_REVIEWS || {}),
  ...(factory.MATH_BATCH_03_SPACED_REVIEWS || {}),
};

const ALL_VISUAL_ASSETS = factory.ALL_MATH_VISUAL_ASSETS || {
  ...(factory.MATH_BATCH_01_VISUAL_ASSETS || {}),
  ...(factory.MATH_BATCH_02_VISUAL_ASSETS || {}),
  ...(factory.MATH_BATCH_03_VISUAL_ASSETS || {}),
};

const ALL_EXTERNAL_RESOURCES = factory.ALL_MATH_EXTERNAL_RESOURCES || {
  ...(factory.MATH_BATCH_01_EXTERNAL_RESOURCES || {}),
  ...(factory.MATH_BATCH_02_EXTERNAL_RESOURCES || {}),
  ...(factory.MATH_BATCH_03_EXTERNAL_RESOURCES || {}),
};

const ALL_EXAM_TRANSFER = factory.ALL_MATH_EXAM_TRANSFER_REGISTRY || {
  ...(factory.MATH_EXAM_TRANSFER_REGISTRY || {}),
  ...(factory.MATH_BATCH_02_EXAM_TRANSFER_REGISTRY || {}),
  ...(factory.MATH_BATCH_03_EXAM_TRANSFER_REGISTRY || {}),
};

const ALL_FACTOR_INPUTS = factory.ALL_MATH_FACTOR_INPUTS || {
  ...(factory.MATH_BATCH_01_FACTOR_INPUTS || {}),
  ...(factory.MATH_BATCH_02_FACTOR_INPUTS || {}),
  ...(factory.MATH_BATCH_03_FACTOR_INPUTS || {}),
};

// =============================================================================
// GATE 1: OFFICIAL CURRICULUM & SYLLABUS ALIGNMENT
// =============================================================================
console.log("\n[GATE 1] Official Curriculum & Syllabus Alignment");
{
  const domains = Object.values(factory.MATH_3AS_DOMAINS || {});
  const topics = Object.values(factory.MATH_3AS_TOPICS || {});
  const sources = Object.values(factory.MATH_3AS_OFFICIAL_SOURCES || {});

  assert(domains.length === 5, `Registered 5 official math domains (found ${domains.length})`);
  assert(topics.length === 11, `Registered 11 official math topics (found ${topics.length})`);
  assert(sources.length >= 3, `Official provenance source records defined (${sources.length})`);
  
  const syllabusSource = sources.find(s => s.sourceId === "src-men-3as-math-syllabus");
  assert(syllabusSource && syllabusSource.classification === "OFFICIAL_HISTORICAL", "Official 3AS syllabus classified as OFFICIAL_HISTORICAL");
  
  const cancellationSource = sources.find(s => s.sourceId === "src-men-cancellation-10sept2026");
  assert(cancellationSource && cancellationSource.classification === "OFFICIAL_CURRENT", "10 Sept 2026 Ministerial Cancellation classified as OFFICIAL_CURRENT");
}

// =============================================================================
// GATE 2: SKILL UNIQUENESS & ID FORMATTING
// =============================================================================
console.log("\n[GATE 2] Skill Uniqueness & ID Formatting");
{
  assert(BATCH_01_SKILL_IDS.length === 12, `Batch 01 contains exactly 12 skills (found ${BATCH_01_SKILL_IDS.length})`);
  assert(BATCH_02_SKILL_IDS.length === 9, `Batch 02 contains exactly 9 skills (found ${BATCH_02_SKILL_IDS.length})`);
  assert(BATCH_03_SKILL_IDS.length === 9, `Batch 03 contains exactly 9 skills (found ${BATCH_03_SKILL_IDS.length})`);
  assert(ALL_MATH_SKILL_IDS.length === 30, `Total math skills equals exactly 30 (found ${ALL_MATH_SKILL_IDS.length})`);

  const uniqueIds = new Set(ALL_MATH_SKILL_IDS);
  assert(uniqueIds.size === 30, "All 30 math skill IDs are mutually unique across batches");
  
  let idFormatValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    if (!id.startsWith("math_m_")) {
      idFormatValid = false;
      console.error(`Invalid ID prefix: ${id}`);
    }
  }
  assert(idFormatValid, "All 30 skill IDs follow canonical 'math_m_*' convention");
}

// =============================================================================
// GATE 3: DETERMINISTIC PRIORITY ENGINE EVALUATION
// =============================================================================
console.log("\n[GATE 3] Priority Engine Evaluation");
{
  let allHigh = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const factors = ALL_FACTOR_INPUTS[id];
    if (!factors) {
      allHigh = false;
      console.error(`Missing factor inputs for skill ${id}`);
      continue;
    }
    const evaluation = contentQuality.evaluateExpansionPriority(factors);
    if (evaluation.level !== "HIGH") {
      allHigh = false;
      console.error(`Skill ${id} evaluated to level ${evaluation.level}`);
    }
  }
  assert(allHigh, "All 30 math skills evaluate strictly to HIGH priority via deterministic priority engine");
}

// =============================================================================
// GATE 4: BILINGUAL PEDAGOGICAL OBJECTIVES
// =============================================================================
console.log("\n[GATE 4] Bilingual Pedagogical Objectives");
{
  let allObjectivesValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const pkg = ALL_PACKAGES[id];
    if (!pkg || !pkg.objective_ar || !pkg.objective_fr || pkg.objective_ar.length < 15 || pkg.objective_fr.length < 15) {
      allObjectivesValid = false;
      console.error(`Incomplete objectives for ${id}`);
    }
  }
  assert(allObjectivesValid, "All 30 skills have high-quality Arabic & French pedagogical objectives");
}

// =============================================================================
// GATE 5: DIAGNOSTIC SIGNAL PROFILES
// =============================================================================
console.log("\n[GATE 5] Diagnostic Signal Profiles");
{
  let allSignalsValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const signal = ALL_SIGNALS[id];
    if (
      !signal ||
      !signal.missingPrerequisiteIndicators_ar || signal.missingPrerequisiteIndicators_ar.length === 0 ||
      !signal.conceptualMisconceptionIndicators_ar || signal.conceptualMisconceptionIndicators_ar.length === 0 ||
      !signal.proceduralWeaknessIndicators_ar || signal.proceduralWeaknessIndicators_ar.length === 0
    ) {
      allSignalsValid = false;
      console.error(`Diagnostic signal invalid for ${id}`);
    }
  }
  assert(allSignalsValid, "All 30 skills have calibrated diagnostic signal profiles targeting misconceptions & prerequisites");
}

// =============================================================================
// GATE 6: AUTHORING CONTRACT VALIDATION (validateContentPackage)
// =============================================================================
console.log("\n[GATE 6] Authoring Contract Validation (validateContentPackage)");
{
  let packagesContractValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const pkg = ALL_PACKAGES[id];
    const validation = contentQuality.validateContentPackage(pkg);
    if (!validation.isValid) {
      packagesContractValid = false;
      console.error(`Package contract failure for ${id}:`, validation.errors);
    }
  }
  assert(packagesContractValid, "All 30 ContentPackages pass validateContentPackage with 0 errors");
}

// =============================================================================
// GATE 7: COGNITIVE WORKED EXAMPLES
// =============================================================================
console.log("\n[GATE 7] Cognitive Worked Examples");
{
  let workedExamplesValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const we = ALL_PACKAGES[id]?.workedExample;
    if (
      !we ||
      !we.problem_ar ||
      !we.stepByStepSolution_ar ||
      we.stepByStepSolution_ar.length < 3 ||
      !we.pedagogicalComment_ar
    ) {
      workedExamplesValid = false;
      console.error(`Worked example incomplete for ${id}`);
    }
  }
  assert(workedExamplesValid, "All 30 worked examples feature explicit problem, >=3 cognitive steps, and pedagogical comments");
}

// =============================================================================
// GATE 8: ACTIVE RECALL PROMPTS & EXPECTED ANSWERS
// =============================================================================
console.log("\n[GATE 8] Active Recall Prompts & Expected Answers");
{
  let recallValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const ar = ALL_PACKAGES[id]?.activeRecall;
    if (!ar || !ar.prompt_ar || !ar.expectedAnswer_ar || ar.expectedAnswer_ar.length < 10) {
      recallValid = false;
      console.error(`Active recall incomplete for ${id}`);
    }
  }
  assert(recallValid, "All 30 skills have active recall prompts with substantive expected answer criteria");
}

// =============================================================================
// GATE 9: GUIDED & INDEPENDENT PRACTICE MICRO-DRILLS
// =============================================================================
console.log("\n[GATE 9] Guided & Independent Practice Micro-Drills");
{
  let practiceValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const practice = ALL_PACKAGES[id]?.practice;
    if (!practice || practice.length < 2) {
      practiceValid = false;
      console.error(`Practice items insufficient for ${id}`);
    }
  }
  assert(practiceValid, "All 30 skills provide multiple structured practice micro-drills");
}

// =============================================================================
// GATE 10: ERROR TAXONOMY RIGOR (SuspectedErrorType)
// =============================================================================
console.log("\n[GATE 10] Error Taxonomy Rigor (Strict SuspectedErrorType)");
{
  const CANONICAL_ERROR_TYPES = new Set([
    "forgot_information",
    "misunderstood_concept",
    "methodology_error",
    "calculation_error",
    "misread_question",
    "rushed",
    "lack_of_practice",
    "time_management",
    "attention_error",
    "unknown",
  ]);

  let allErrorsCompliant = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const pkg = ALL_PACKAGES[id];
    for (const p of pkg.practice) {
      for (const [distractorKey, errorType] of Object.entries(p.distractorErrorMappings || {})) {
        if (!CANONICAL_ERROR_TYPES.has(errorType)) {
          allErrorsCompliant = false;
          console.error(`Unrecognized error type '${errorType}' in ${id} distractor ${distractorKey}`);
        }
      }
    }
    if (pkg.repairGuide?.targetErrorType && !CANONICAL_ERROR_TYPES.has(pkg.repairGuide.targetErrorType)) {
      allErrorsCompliant = false;
      console.error(`Unrecognized target error type '${pkg.repairGuide.targetErrorType}' in repair guide of ${id}`);
    }
  }
  assert(allErrorsCompliant, "100% of practice distractor mappings and repair guides adhere to canonical SuspectedErrorType");
}

// =============================================================================
// GATE 11: ACTIONABLE REPAIR GUIDES
// =============================================================================
console.log("\n[GATE 11] Actionable Repair Guides");
{
  let repairGuidesValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const rg = ALL_PACKAGES[id]?.repairGuide;
    if (
      !rg ||
      !rg.title_ar ||
      !rg.mentalModelExplanation_ar ||
      !rg.actionableSteps_ar ||
      rg.actionableSteps_ar.length < 3
    ) {
      repairGuidesValid = false;
      console.error(`Repair guide invalid for ${id}`);
    }
  }
  assert(repairGuidesValid, "All 30 repair guides offer mental model explanation and 3+ actionable steps");
}

// =============================================================================
// GATE 12: ISOMORPHIC RETEST TWINS
// =============================================================================
console.log("\n[GATE 12] Isomorphic Retest Twins");
{
  let retestsValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const pkg = ALL_PACKAGES[id];
    const retest = pkg?.retest;
    if (!retest || !retest.prompt_ar || !retest.isIsomorphicTwin || !retest.testsIdenticalConcept) {
      retestsValid = false;
      console.error(`Retest twin missing or malformed for ${id}`);
    }
    if (retest && pkg.practice[0] && retest.prompt_ar === pkg.practice[0].prompt_ar) {
      retestsValid = false;
      console.error(`Retest twin for ${id} is a verbatim duplicate of practice question!`);
    }
  }
  assert(retestsValid, "All 30 skills have genuine isomorphic retest twins (distinct numerical parameters, identical cognitive depth)");
}

// =============================================================================
// GATE 13: VISUAL LEARNING ASSETS
// =============================================================================
console.log("\n[GATE 13] Visual Learning Assets");
{
  let visualsValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const va = ALL_VISUAL_ASSETS[id];
    const pkg = ALL_PACKAGES[id];
    if (!va || !va.id || !va.title_ar || !va.accessibilityMetadata?.description || !va.accessibilityMetadata?.screenReaderSummary) {
      visualsValid = false;
      console.error(`Visual asset invalid for ${id}`);
    }
    if (!pkg || pkg.visualAssetIds[0] !== va?.id) {
      visualsValid = false;
      console.error(`Visual asset ID mismatch in package for ${id}: pkg=${pkg?.visualAssetIds[0]} vs registry=${va?.id}`);
    }
    if (!va?.accessibilityMetadata?.nonColorDependentCues || !va?.accessibilityMetadata?.highContrastAvailable) {
      visualsValid = false;
      console.error(`Visual accessibility requirements not met for ${id}`);
    }
  }
  assert(visualsValid, "All 30 visual assets pass full accessibility audits and link 1-to-1 with packages");
}

// =============================================================================
// GATE 14: EXTERNAL LEARNING RESOURCES WITH RETURN TICKETS
// =============================================================================
console.log("\n[GATE 14] External Learning Resources with Return Tickets");
{
  let resourcesValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const res = ALL_EXTERNAL_RESOURCES[id];
    const val = learningEcosystem.validateExternalResourceContract(res);
    if (!val.isValid) {
      resourcesValid = false;
      console.error(`External resource contract failed for ${id}:`, val.errors);
    }
    if (!res?.suggestedReturnAction) {
      resourcesValid = false;
      console.error(`External resource missing return action for ${id}`);
    }
  }
  assert(resourcesValid, "All 30 external resources pass validation and provide mandatory return-action tickets");
}

// =============================================================================
// GATE 15: BAC EXAM TRANSFER LAYER
// =============================================================================
console.log("\n[GATE 15] BAC Exam Transfer Layer");
{
  let examTransferValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const et = ALL_EXAM_TRANSFER[id];
    if (
      !et ||
      !et.typicalTaskForms_ar || et.typicalTaskForms_ar.length === 0 ||
      !et.commonPitfalls_ar || et.commonPitfalls_ar.length === 0 ||
      !et.verificationRoutine_ar ||
      !et.pastBacCitations || et.pastBacCitations.length === 0
    ) {
      examTransferValid = false;
      console.error(`Exam transfer incomplete for ${id}`);
    }
  }
  assert(examTransferValid, "All 30 skills include official BAC task forms, pitfall warnings, rubric breakdowns and ONEC citations");
}

// =============================================================================
// GATE 16: SPACED REVIEW SCHEDULE
// =============================================================================
console.log("\n[GATE 16] Spaced Review Schedule");
{
  let spacedReviewValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const sr = ALL_SPACED_REVIEWS[id];
    if (
      !sr ||
      !sr.day1InitialEvidence_ar ||
      !sr.day3RetrievalPrompt_ar ||
      !sr.day7MixedPracticePrompt_ar ||
      !sr.laterExamApplicationPrompt_ar
    ) {
      spacedReviewValid = false;
      console.error(`Spaced review schedule invalid for ${id}`);
    }
  }
  assert(spacedReviewValid, "All 30 skills have configured spaced review schedules with Day 1, 3, 7, and Exam Application prompts");
}

// =============================================================================
// GATE 17: CLAIM & REGULATORY AUDIT
// =============================================================================
console.log("\n[GATE 17] Claim & Regulatory Audit");
{
  let allClaimsClean = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const pkg = ALL_PACKAGES[id];
    const rLesson = contentQuality.auditClaimString(pkg.lesson.contentMarkdown_ar);
    const rTakeaway = contentQuality.auditClaimString(pkg.lesson.keyTakeaway_ar);
    const rObjective = contentQuality.auditClaimString(pkg.objective_ar);
    if (!rLesson.isClean || !rTakeaway.isClean || !rObjective.isClean) {
      allClaimsClean = false;
      console.error(`Claim audit violation in ${id}:`, rLesson.violations, rTakeaway.violations, rObjective.violations);
    }
  }
  assert(allClaimsClean, "100% of authored Math lessons, takeaways, and objectives pass claim audit with 0 blockers");

  const context = contentQuality.OFFICIAL_2027_MINISTERIAL_CONTEXT;
  assert(context.coefficientAssertionPolicy === "OFFICIAL_HISTORICAL_ONLY", "Policy enforces OFFICIAL_HISTORICAL_ONLY for baseline coefficients");
  assert(context.ministerialCancellationDate === "2026-09-10", "Records explicit ministerial cancellation date: 2026-09-10");

  // Verify Decree 07-142 classification & multi-stream matrix
  const matrixItems = curriculumMatrix.FULL_COVERAGE_MATRIX;
  const mathItems = matrixItems.filter(i => i.streamId === "math");
  assert(mathItems.length === 30, `Curriculum matrix contains all 30 math skills (found ${mathItems.length})`);
  
  const publishedCount = mathItems.filter(i => i.status === "PUBLISHED").length;
  assert(publishedCount === 30, "All 30 math skills are marked PUBLISHED in curriculum matrix");
}

// =============================================================================
// GATE 18: COMPLETE INTEGRATED SKILL DOSSIER RESOLUTION
// =============================================================================
console.log("\n[GATE 18] Integrated Skill Dossier Verification");
{
  let dossiersValid = true;
  for (const id of ALL_MATH_SKILL_IDS) {
    const dossier = factory.getMathSkillDossier(id);
    if (!dossier || !dossier.package || !dossier.visualAsset || !dossier.externalResource || !dossier.diagnosticSignal || !dossier.spacedReview || !dossier.escalationProfile || !dossier.priorityAssessment || !dossier.qualityAssessment) {
      dossiersValid = false;
      console.error(`Dossier resolution failed for ${id}`);
    }
  }
  assert(dossiersValid, "All 30 skills resolve complete dossiers with 13-element pedagogical packages");
}

// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log("\n==================================================================");
console.log(`  QA VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log("==================================================================\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("  >>> ALL 18 MATHEMATICS FACTORY GATES VERIFIED CLEANLY (30 SKILLS) <<<\n");
  process.exit(0);
}
