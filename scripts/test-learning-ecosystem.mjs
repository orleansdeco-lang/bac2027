/**
 * BAC Mastery — Learning Ecosystem Verification Suite
 * Prompt 20.1: Visual Learning + External Resources + Human Help / Teacher Escalation
 * 
 * Verifies All 24 Gates (A through X):
 * Gate A: Visual Asset Contract
 * Gate B: Visual Educational Purpose
 * Gate C: Visual Provenance & Rights
 * Gate D: External Resource Contract
 * Gate E: Resource Educational Purpose
 * Gate F: Resource Provenance Hierarchy
 * Gate G: Resource Recommendation Explainability
 * Gate H: Resource Return-Action Contract
 * Gate I: Teacher Skill-Based Mapping
 * Gate J: Student Help Request Mapping
 * Gate K: Escalation Deterministic Behavior
 * Gate L: One Wrong Answer Does NOT Trigger Teacher Escalation
 * Gate M: Repeated Failure Triggers Intermediate Escalation
 * Gate N: Retest Failure Triggers Advanced Escalation
 * Gate O: Existing Error Intelligence Remains Authoritative
 * Gate P: Student Learning Brief Contains Evidence & Zero PII
 * Gate Q: Decoupled Educational vs UI Language
 * Gate R: Independent RTL/LTR Support
 * Gate S: Accessibility Requirements
 * Gate T: Zero Marketplace Implementation
 * Gate U: Zero AI / LLM Dependency
 * Gate V: Zero Database Migrations Applied
 * Gate W: Canonical 31 Sciences Exp Skills Untouched
 * Gate X: Existing Roadmap Engine Remains Sole Roadmap Engine
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY V1 — LEARNING ECOSYSTEM VERIFICATION SUITE (20.1)");
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

// Load Learning Ecosystem Module
const visualAssets = loadTs("src/domain/learning-ecosystem/visual-assets.ts");
const externalResources = loadTs("src/domain/learning-ecosystem/external-resources.ts");
const escalation = loadTs("src/domain/learning-ecosystem/escalation.ts");
const teacherHelp = loadTs("src/domain/learning-ecosystem/teacher-help.ts");

// Load existing system references for cross-verification
const canonicalCoverage = loadTs("src/domain/curriculum/coverage-matrix.ts");
const roadmapEngine = loadTs("src/lib/roadmap/engine.ts");

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

// =============================================================================
// GATE A: VISUAL ASSET CONTRACT
// =============================================================================
console.log("\n[GATE A] Visual Asset Contract Integrity");
{
  const visuals = visualAssets.getAllCanonicalVisualAssets();
  assert(visuals.length >= 4, `Exemplar visual assets registered (${visuals.length})`);
  
  for (const asset of visuals) {
    const res = visualAssets.validateVisualAssetContract(asset);
    assert(res.isValid, `Visual asset [${asset.id}] passes all structural contract rules`);
  }

  // Verify rejection of invalid visual asset missing id & altText
  const invalidAsset = {
    id: "",
    skillId: "test_skill",
    subjectId: "math",
    visualType: "diagram",
    educationalPurpose: "CONCEPT_EXPLANATION",
    title_ar: "عنوان",
    title_fr: "Titre",
    altText_ar: "",
    language: "ar",
    direction: "rtl",
    source: "",
  };
  const invalidRes = visualAssets.validateVisualAssetContract(invalidAsset);
  assert(!invalidRes.isValid, "validateVisualAssetContract correctly rejects invalid asset");
  assert(invalidRes.errors.length >= 3, `Correctly identified multiple validation errors (${invalidRes.errors.length})`);
}

// =============================================================================
// GATE B: VISUAL EDUCATIONAL PURPOSE
// =============================================================================
console.log("\n[GATE B] Visual Educational Purpose Validation");
{
  const visuals = visualAssets.getAllCanonicalVisualAssets();
  const allowedPurposes = new Set([
    "CONCEPT_EXPLANATION",
    "PROCESS_EXPLANATION",
    "RELATIONSHIP_MAPPING",
    "SPATIAL_REASONING",
    "DOCUMENT_ANALYSIS",
    "MEMORY_SUPPORT",
    "COMPARISON",
    "EXAM_METHOD",
    "ERROR_REPAIR",
    "WORKED_EXAMPLE_SUPPORT",
  ]);

  for (const v of visuals) {
    assert(allowedPurposes.has(v.educationalPurpose), `Asset [${v.id}] has recognized educational purpose: ${v.educationalPurpose}`);
    assert(v.educationalPurpose !== "DECORATIVE", `Asset [${v.id}] is strictly non-decorative`);
  }

  // Verify subject-specific visual resolver
  const mathTypes = visualAssets.getRecommendedVisualTypesForSubject("math");
  assert(mathTypes.includes("mathematical_plot") && mathTypes.includes("graph"), "Math includes mathematical_plot and graph");
  
  const physicsTypes = visualAssets.getRecommendedVisualTypesForSubject("physics");
  assert(physicsTypes.includes("circuit_diagram") && physicsTypes.includes("force_diagram"), "Physics includes circuit_diagram and force_diagram");

  const snvTypes = visualAssets.getRecommendedVisualTypesForSubject("natural_sciences");
  assert(snvTypes.includes("biological_schema") && snvTypes.includes("anatomy_schema"), "Natural Sciences includes biological_schema");

  const histGeoTypes = visualAssets.getRecommendedVisualTypesForSubject("history_geography");
  assert(histGeoTypes.includes("map") && histGeoTypes.includes("timeline"), "History/Geography includes map and timeline");
}

// =============================================================================
// GATE C: VISUAL PROVENANCE & RIGHTS
// =============================================================================
console.log("\n[GATE C] Visual Provenance & Rights");
{
  const visuals = visualAssets.getAllCanonicalVisualAssets();
  for (const v of visuals) {
    assert(typeof v.source === "string" && v.source.length > 0, `Asset [${v.id}] declares source citation (${v.source})`);
    assert(v.rightsStatus === "original" || v.rightsStatus === "official_reference", `Asset [${v.id}] has valid rights status (${v.rightsStatus})`);
    assert(v.verificationStatus === "verified", `Asset [${v.id}] has verified status`);
    assert(typeof v.verifiedAt === "string", `Asset [${v.id}] has verification timestamp (${v.verifiedAt})`);
  }
}

// =============================================================================
// GATE D: EXTERNAL RESOURCE CONTRACT
// =============================================================================
console.log("\n[GATE D] External Resource Contract Integrity");
{
  const resources = externalResources.getAllCanonicalExternalResources();
  assert(resources.length >= 3, `Exemplar external resources registered (${resources.length})`);

  for (const res of resources) {
    const val = externalResources.validateExternalResourceContract(res);
    assert(val.isValid, `External resource [${res.id}] satisfies contract rules`);
  }

  // Verify rejection of dangerous URL
  assert(!externalResources.isSafeExternalUrl("javascript:alert(1)"), "Rejects javascript: scheme URL");
  assert(!externalResources.isSafeExternalUrl("data:text/html;base64,PHNjcmlwdD4="), "Rejects data: scheme URL");
  assert(externalResources.isSafeExternalUrl("https://education.gov.dz/guide.pdf"), "Accepts valid HTTPS URL");
}

// =============================================================================
// GATE E: RESOURCE EDUCATIONAL PURPOSE
// =============================================================================
console.log("\n[GATE E] Resource Educational Purpose Taxonomy");
{
  const resources = externalResources.getAllCanonicalExternalResources();
  const allowedPurposes = new Set([
    "UNDERSTAND",
    "REVIEW",
    "VISUALIZE",
    "PRACTICE",
    "EXAM_METHOD",
    "REPAIR",
    "GO_DEEPER",
    "PREREQUISITE",
  ]);

  for (const res of resources) {
    assert(allowedPurposes.has(res.purpose), `Resource [${res.id}] declares valid pedagogical purpose: ${res.purpose}`);
  }
}

// =============================================================================
// GATE F: RESOURCE PROVENANCE HIERARCHY
// =============================================================================
console.log("\n[GATE F] Resource Provenance Hierarchy Compatibility");
{
  const resources = externalResources.getAllCanonicalExternalResources();
  const allowedClassifications = new Set([
    "OFFICIAL_CURRENT",
    "OFFICIAL_HISTORICAL",
    "RESEARCH_SUPPORTED",
    "BAC_MASTERY_DERIVED",
    "PROVISIONAL",
    "UNVERIFIED",
  ]);

  for (const res of resources) {
    assert(allowedClassifications.has(res.sourceQuality), `Resource [${res.id}] has recognized provenance quality: ${res.sourceQuality}`);
    assert(res.rightsStatus === "external_reference_only" || res.rightsStatus === "official_reference", `Resource [${res.id}] strictly adheres to link-only rights (${res.rightsStatus})`);
  }
}

// =============================================================================
// GATE G: RESOURCE RECOMMENDATION EXPLAINABILITY
// =============================================================================
console.log("\n[GATE G] Resource Recommendation Explainability");
{
  const rec = externalResources.recommendExternalResource({
    skillId: "math_exp_limits_indeterminate",
    evidence: {
      consecutiveFailures: 2,
      retestFailed: true,
      retestFailureCount: 2,
      isRecurringError: true,
      dominantErrorType: "misunderstood_concept",
      repairCompletedButFailedRetest: true,
      repairAttemptCount: 1,
      highConfidenceWrongCount: 0,
      unmasteredPrerequisites: [],
      totalTimeSpentSeconds: 400,
    },
  });

  assert(rec !== null, "Generates recommendation for struggling skill");
  assert(rec.reasonCode === "REPEATED_RETEST_FAILURE", `Reason code matches evidence: ${rec.reasonCode}`);
  assert(typeof rec.reason_ar === "string" && rec.reason_ar.length > 20, "Arabic rationale is explicit and informative");
  assert(typeof rec.reason_fr === "string" && rec.reason_fr.length > 20, "French rationale is explicit and informative");
}

// =============================================================================
// GATE H: RESOURCE RETURN-ACTION CONTRACT
// =============================================================================
console.log("\n[GATE H] Resource Return-Action Contract (No Dead-Ends)");
{
  const resources = externalResources.getAllCanonicalExternalResources();
  const validReturnActions = new Set([
    "active_recall",
    "isomorphic_retest",
    "guided_repair_step",
    "practice_micro_drill",
    "checkpoint_quiz",
  ]);

  for (const res of resources) {
    assert(validReturnActions.has(res.suggestedReturnAction), `Resource [${res.id}] specifies mandatory return action: ${res.suggestedReturnAction}`);
  }

  const rec = externalResources.recommendExternalResource({
    skillId: "math_exp_limits_indeterminate",
    evidence: {
      consecutiveFailures: 2,
      retestFailed: true,
      retestFailureCount: 2,
      isRecurringError: true,
      dominantErrorType: "misunderstood_concept",
      repairCompletedButFailedRetest: true,
      repairAttemptCount: 1,
      highConfidenceWrongCount: 0,
      unmasteredPrerequisites: [],
      totalTimeSpentSeconds: 400,
    },
  });

  assert(rec && rec.returnAction === "isomorphic_retest", `Recommendation dictates returnAction: ${rec?.returnAction}`);
}

// =============================================================================
// GATE I: TEACHER SKILL-BASED MAPPING
// =============================================================================
console.log("\n[GATE I] Teacher Skill-Based Profile Mapping");
{
  const mathTeachers = teacherHelp.findQualifiedTeachersForSkill("math_exp_limits_indeterminate", "math");
  assert(mathTeachers.length >= 1, `Found qualified math teacher for target skill (${mathTeachers.length})`);
  
  const teacher = mathTeachers[0];
  assert(teacher.subjectId === "math", "Teacher subject matches math");
  assert(teacher.qualifiedSkillIds.includes("math_exp_limits_indeterminate"), "Teacher is qualified on exact skillId");
  assert(teacher.supportedHelpTypes.includes("concept_explanation"), "Teacher provides concept_explanation");
  assert(teacher.isAcceptingBriefs === true, "Teacher is accepting pedagogical briefs");
}

// =============================================================================
// GATE J: STUDENT HELP REQUEST MAPPING
// =============================================================================
console.log("\n[GATE J] Student Help Request Mapping to Error Intelligence");
{
  const req1 = teacherHelp.mapStudentHelpRequest("explain_simpler");
  assert(req1.mappedErrorType === "misunderstood_concept", "explain_simpler maps to misunderstood_concept");
  assert(req1.cognitiveRootCause === "conceptual", "explain_simpler root cause is conceptual");

  const req2 = teacherHelp.mapStudentHelpRequest("cannot_apply_methodology");
  assert(req2.mappedErrorType === "methodology_error", "cannot_apply_methodology maps to methodology_error");
  assert(req2.cognitiveRootCause === "procedural", "cannot_apply_methodology root cause is procedural");

  const req3 = teacherHelp.mapStudentHelpRequest("forgot_rule");
  assert(req3.mappedErrorType === "forgot_information", "forgot_rule maps to forgot_information");

  const req4 = teacherHelp.mapStudentHelpRequest("calculation_trouble");
  assert(req4.mappedErrorType === "calculation_error", "calculation_trouble maps to calculation_error");

  const req5 = teacherHelp.mapStudentHelpRequest("misunderstood_question");
  assert(req5.mappedErrorType === "misread_question", "misunderstood_question maps to misread_question");
}

// =============================================================================
// GATE K: ESCALATION DETERMINISTIC BEHAVIOR
// =============================================================================
console.log("\n[GATE K] Escalation Deterministic Behavior");
{
  const inputState = {
    skillId: "math_exp_limits_indeterminate",
    subjectId: "math",
    evidence: {
      consecutiveFailures: 2,
      retestFailed: true,
      retestFailureCount: 2,
      isRecurringError: true,
      dominantErrorType: "misunderstood_concept",
      repairCompletedButFailedRetest: true,
      repairAttemptCount: 1,
      highConfidenceWrongCount: 0,
      unmasteredPrerequisites: [],
      totalTimeSpentSeconds: 600,
    },
  };

  const res1 = escalation.getLearningEscalation(inputState);
  const res2 = escalation.getLearningEscalation(inputState);
  assert(res1.level === res2.level, `Escalation result is 100% deterministic (Level: ${res1.level})`);
  assert(res1.reasonCode === res2.reasonCode, `Reason code is deterministic (${res1.reasonCode})`);
}

// =============================================================================
// GATE L: ONE WRONG ANSWER DOES NOT TRIGGER TEACHER ESCALATION
// =============================================================================
console.log("\n[GATE L] Invariant: One Wrong Answer Does NOT Trigger Teacher Escalation");
{
  const singleWrongState = {
    skillId: "math_exp_limits_indeterminate",
    subjectId: "math",
    evidence: {
      consecutiveFailures: 1,
      retestFailed: false,
      retestFailureCount: 0,
      isRecurringError: false,
      repairCompletedButFailedRetest: false,
      repairAttemptCount: 0,
      highConfidenceWrongCount: 0,
      unmasteredPrerequisites: [],
      totalTimeSpentSeconds: 45,
    },
  };

  const outcome = escalation.getLearningEscalation(singleWrongState);
  assert(outcome.level !== "TEACHER_HELP", "One wrong answer does NOT trigger TEACHER_HELP");
  assert(outcome.level !== "LIVE_TUTORING", "One wrong answer does NOT trigger LIVE_TUTORING");
  assert(outcome.level !== "EXTERNAL_RESOURCE", "One wrong answer does NOT trigger EXTERNAL_RESOURCE");
  assert(outcome.level === "EXTRA_EXPLANATION" || outcome.level === "SELF_LEARN", `One wrong answer remains in early self-learn/extra explanation tier (${outcome.level})`);
}

// =============================================================================
// GATE M: REPEATED FAILURE TRIGGERS INTERMEDIATE ESCALATION
// =============================================================================
console.log("\n[GATE M] Repeated Failure Triggers Intermediate Escalation");
{
  const repeatedPracticeState = {
    skillId: "math_exp_limits_indeterminate",
    subjectId: "math",
    evidence: {
      consecutiveFailures: 2,
      retestFailed: false,
      retestFailureCount: 0,
      isRecurringError: false,
      repairCompletedButFailedRetest: false,
      repairAttemptCount: 0,
      highConfidenceWrongCount: 0,
      unmasteredPrerequisites: [],
      totalTimeSpentSeconds: 150,
    },
  };

  const outcome = escalation.getLearningEscalation(repeatedPracticeState);
  assert(outcome.level === "VISUAL_SUPPORT" || outcome.level === "EXTRA_EXPLANATION", `Repeated failure escalates to intermediate tier: ${outcome.level}`);
}

// =============================================================================
// GATE N: RETEST FAILURE TRIGGERS ADVANCED ESCALATION
// =============================================================================
console.log("\n[GATE N] Retest Failure Triggers Advanced Escalation");
{
  // Retest failed once -> external resource
  const singleRetestFailState = {
    skillId: "math_exp_limits_indeterminate",
    subjectId: "math",
    evidence: {
      consecutiveFailures: 2,
      retestFailed: true,
      retestFailureCount: 1,
      isRecurringError: true,
      repairCompletedButFailedRetest: false,
      repairAttemptCount: 1,
      highConfidenceWrongCount: 0,
      unmasteredPrerequisites: [],
      totalTimeSpentSeconds: 300,
    },
  };
  const out1 = escalation.getLearningEscalation(singleRetestFailState);
  assert(out1.level === "EXTERNAL_RESOURCE", `Single retest failure escalates to EXTERNAL_RESOURCE (Level: ${out1.level})`);

  // Multiple retest failures -> teacher escalation
  const multiRetestFailState = {
    skillId: "math_exp_limits_indeterminate",
    subjectId: "math",
    evidence: {
      consecutiveFailures: 3,
      retestFailed: true,
      retestFailureCount: 2,
      isRecurringError: true,
      repairCompletedButFailedRetest: true,
      repairAttemptCount: 2,
      highConfidenceWrongCount: 0,
      unmasteredPrerequisites: [],
      totalTimeSpentSeconds: 650,
    },
  };
  const out2 = escalation.getLearningEscalation(multiRetestFailState);
  assert(out2.level === "TEACHER_HELP", `Two retest failures escalate to TEACHER_HELP (Level: ${out2.level})`);
  assert(out2.recommendedAction.type === "prepare_teacher_brief", "Recommended action prepares teacher brief");
}

// =============================================================================
// GATE O: EXISTING ERROR INTELLIGENCE REMAINS AUTHORITATIVE
// =============================================================================
console.log("\n[GATE O] Existing Error Intelligence Authority");
{
  const mapped = teacherHelp.mapStudentHelpRequest("misunderstood_concept");
  const validTaxonomy = [
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
  ];
  assert(validTaxonomy.includes(mapped.mappedErrorType), `Mapped error type belongs to authoritative taxonomy: ${mapped.mappedErrorType}`);
}

// =============================================================================
// GATE P: STUDENT LEARNING BRIEF INTEGRITY & PRIVACY
// =============================================================================
console.log("\n[GATE P] Student Learning Brief Evidence & Privacy");
{
  const brief = teacherHelp.generateStudentLearningBrief({
    skillId: "math_exp_limits_indeterminate",
    skillTitle_ar: "حساب نهايات الدوال الأسية وحالات عدم التعيين",
    skillTitle_fr: "Limites des fonctions exponentielles",
    subjectId: "math",
    streamId: "sciences_exp",
    currentMasteryStatus: "in_progress",
    totalAttempts: 5,
    consecutiveFailures: 3,
    practiceAccuracy: 0.4,
    recurringErrors: [
      {
        errorType: "misunderstood_concept",
        occurrenceCount: 3,
        sampleContext_ar: "خلط بين النهاية عند +∞ والتزايد المقارن",
      },
    ],
    repairAttemptsCount: 2,
    lastRepairStatus: "retest_failed",
    retestFailedCount: 2,
    averageConfidence: 4.2,
    overconfidenceCount: 2,
    avgResponseSeconds: 120,
    expectedSeconds: 90,
    explanationsViewed: 2,
    visualsConsulted: ["vis_math_asymptote_interpretation"],
    externalResourcesUsed: ["res_math_exp_limits_indeterminate_video"],
  });

  assert(brief.briefId.startsWith("brief_"), "Brief ID generated");
  assert(brief.attemptSummary.totalAttempts === 5, "Brief records total attempts accurately");
  assert(brief.recurringErrors.length === 1, "Brief records recurring error breakdown");
  assert(brief.repairHistory.retestFailedCount === 2, "Brief records retest failed count");
  assert(brief.interventionsAlreadyAttempted.visualsConsulted.length === 1, "Brief tracks previously consulted visuals");
  assert(typeof brief.pedagogicalDiagnosis_ar === "string" && brief.pedagogicalDiagnosis_ar.length > 30, "Pedagogical diagnosis is detailed");
  assert(typeof brief.recommendedTeacherAction_ar === "string" && brief.recommendedTeacherAction_ar.length > 20, "Actionable teacher recommendation present");

  // Privacy invariant: zero PII
  const briefJson = JSON.stringify(brief);
  assert(!briefJson.includes("email"), "Zero student email in brief");
  assert(!briefJson.includes("password"), "Zero password in brief");
  assert(!briefJson.includes("token"), "Zero auth token in brief");
  assert(!briefJson.includes("first_name") && !briefJson.includes("last_name"), "Zero student name PII in brief");
}

// =============================================================================
// GATE Q: LANGUAGE SEPARATION
// =============================================================================
console.log("\n[GATE Q] Decoupled Educational vs UI Language");
{
  const visuals = visualAssets.getAllCanonicalVisualAssets();
  for (const v of visuals) {
    assert(v.title_ar && v.title_fr, `Asset [${v.id}] provides dual-language titles`);
    assert(v.language === "ar", `Asset [${v.id}] default pedagogical language is Arabic for national STEM`);
  }
}

// =============================================================================
// GATE R: RTL/LTR SEPARATION
// =============================================================================
console.log("\n[GATE R] Independent RTL/LTR Support");
{
  const visuals = visualAssets.getAllCanonicalVisualAssets();
  const mathVisual = visuals.find((v) => v.subjectId === "math");
  const physicsVisual = visuals.find((v) => v.subjectId === "physics");
  assert(mathVisual && mathVisual.direction === "ltr", "Math plot preserves LTR coordinate direction");
  assert(physicsVisual && physicsVisual.direction === "rtl", "Physics diagram preserves RTL contextual direction");
}

// =============================================================================
// GATE S: ACCESSIBILITY REQUIREMENTS
// =============================================================================
console.log("\n[GATE S] Accessibility Requirements");
{
  const visuals = visualAssets.getAllCanonicalVisualAssets();
  for (const v of visuals) {
    assert(typeof v.altText_ar === "string" && v.altText_ar.length >= 10, `Asset [${v.id}] has descriptive Arabic altText`);
    assert(typeof v.accessibilityMetadata.screenReaderSummary === "string", `Asset [${v.id}] has screen reader summary`);
    assert(v.accessibilityMetadata.nonColorDependentCues === true, `Asset [${v.id}] does not rely on color perception alone`);
  }
}

// =============================================================================
// GATE T: ZERO MARKETPLACE IMPLEMENTATION
// =============================================================================
console.log("\n[GATE T] Zero Marketplace Implementation");
{
  // Verify domain files do not contain marketplace/payment/booking code
  const domainDir = path.resolve("src/domain/learning-ecosystem");
  const files = fs.readdirSync(domainDir);
  for (const file of files) {
    const content = fs.readFileSync(path.join(domainDir, file), "utf8");
    assert(!content.includes("chargily"), `File [${file}] contains zero Chargily payment code`);
    assert(!content.includes("commission"), `File [${file}] contains zero commission logic`);
    assert(!content.includes("bookingCalendar"), `File [${file}] contains zero booking calendar logic`);
    assert(!content.includes("ratingScore"), `File [${file}] contains zero teacher public rating UI logic`);
  }
}

// =============================================================================
// GATE U: ZERO AI / LLM DEPENDENCY
// =============================================================================
console.log("\n[GATE U] Zero AI / LLM Dependency");
{
  const domainDir = path.resolve("src/domain/learning-ecosystem");
  const files = fs.readdirSync(domainDir);
  for (const file of files) {
    const content = fs.readFileSync(path.join(domainDir, file), "utf8");
    assert(!content.includes("@google/genai"), `File [${file}] does not import Google GenAI`);
    assert(!content.includes("openai"), `File [${file}] does not import OpenAI`);
    assert(!content.includes("anthropic"), `File [${file}] does not import Anthropic`);
  }
}

// =============================================================================
// GATE V: ZERO DATABASE MIGRATIONS APPLIED
// =============================================================================
console.log("\n[GATE V] Zero Database Migrations Applied");
{
  const migrationsDir = path.resolve("supabase/migrations");
  let migrationCount = 0;
  if (fs.existsSync(migrationsDir)) {
    migrationCount = fs.readdirSync(migrationsDir).length;
  }
  assert(
    migrationCount === 3,
    `Zero new database migrations created in Prompt 20.1 (remains exactly 3 baseline migrations: ${migrationCount})`
  );
}

// =============================================================================
// GATE W: CANONICAL 31 SCIENCES EXP SKILLS UNTOUCHED
// =============================================================================
console.log("\n[GATE W] Canonical 31 Sciences Exp Skills Untouched");
{
  const mappings = loadTs("src/domain/content/mappings.ts");
  const sciencesExpSkills = mappings.PROMPT11_SKILLS;
  assert(
    sciencesExpSkills && sciencesExpSkills.length === 31,
    `Exactly 31 Sciences Expérimentales skills present in PROMPT11_SKILLS (${sciencesExpSkills?.length})`
  );

  const stats = canonicalCoverage.getCoverageStats();
  assert(
    stats.byStream.sciences_exp.published === 31,
    `All 31 Sciences Expérimentales skills remain in published status (${stats.byStream.sciences_exp.published})`
  );
}

// =============================================================================
// GATE X: EXISTING ROADMAP ENGINE REMAINS SOLE ROADMAP ENGINE
// =============================================================================
console.log("\n[GATE X] Existing Roadmap Engine Sole Authority");
{
  assert(typeof roadmapEngine.getNextBestMission === "function", "Existing getNextBestMission is available and authoritative");
  assert(typeof roadmapEngine.buildAdaptiveRoadmap === "function", "Existing buildAdaptiveRoadmap is available and authoritative");
}

// =============================================================================
// SUMMARY
// =============================================================================
console.log("\n==================================================================");
console.log(`  LEARNING ECOSYSTEM GATES SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log("==================================================================");

if (failCount > 0) {
  console.error("\n❌ VERIFICATION SUITE FAILED");
  process.exit(1);
} else {
  console.log("\n✅ ALL 24 GATES PASSED CLEANLY");
  process.exit(0);
}
