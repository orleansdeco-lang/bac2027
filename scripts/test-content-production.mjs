import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 12: CONTENT PRODUCTION VERIFICATION SUITE");
console.log("  Authoritative Verification: 23 Comprehensive Suites (A through W)");
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
    if (reqPath.includes("topics")) return loadTs("src/data/curriculum/topics.ts");
    if (reqPath.includes("skills")) return loadTs("src/data/curriculum/skills.ts");
    if (reqPath.includes("practice-questions")) return loadTs("src/data/curriculum/practice-questions.ts");
    if (reqPath.includes("sciences-exp")) return loadTs("src/data/practice/sciences-exp/index.ts");
    if (reqPath.includes("mappings")) return loadTs("src/domain/content/mappings.ts");
    if (reqPath.includes("types")) return loadTs("src/domain/content/types.ts");
    if (reqPath.includes("schemas")) return loadTs("src/domain/content/schemas.ts");
    if (reqPath.includes("validation")) return loadTs("src/domain/content/validation.ts");
    if (reqPath.includes("curriculum")) return loadTs("src/data/curriculum/index.ts");
    if (reqPath.includes("lessons")) return loadTs("src/domain/content/lessons.ts");
    if (reqPath.includes("repair-guides")) return loadTs("src/domain/content/repair-guides.ts");
    if (reqPath.includes("study-methods")) return loadTs("src/domain/content/study-methods.ts");
    if (reqPath.includes("expert-guidance")) return loadTs("src/domain/content/expert-guidance.ts");
    if (reqPath.includes("motivation")) return loadTs("src/domain/content/motivation.ts");
    if (reqPath.includes("mini-exams")) return loadTs("src/domain/content/mini-exams.ts");
    return {};
  }, m);

  return m.exports;
}

// -----------------------------------------------------------------------------
// LOAD CONTENT DOMAIN DATASETS
// -----------------------------------------------------------------------------

const mappingsModule = loadTs("src/domain/content/mappings.ts");
const schemasModule = loadTs("src/domain/content/schemas.ts");
const validationModule = loadTs("src/domain/content/validation.ts");
const lessonsModule = loadTs("src/domain/content/lessons.ts");
const repairGuidesModule = loadTs("src/domain/content/repair-guides.ts");
const studyMethodsModule = loadTs("src/domain/content/study-methods.ts");
const expertGuidanceModule = loadTs("src/domain/content/expert-guidance.ts");
const motivationModule = loadTs("src/domain/content/motivation.ts");
const miniExamsModule = loadTs("src/domain/content/mini-exams.ts");

const dataset = mappingsModule.getFullContentDataset();
const validationReport = validationModule.validateContentArchitecture(dataset);

let passedCount = 0;

function runSuite(letter, name, fn) {
  try {
    fn();
    console.log(`  [PASS] Suite ${letter}: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] Suite ${letter}: ${name}`);
    console.error(`         ${err.message}`);
    process.exit(1);
  }
}

// =============================================================================
// SUITE A: Official Curriculum Alignment & Ministerial Coefficients
// =============================================================================
runSuite("A", "Official Curriculum Alignment & Ministerial Coefficients", () => {
  assert.strictEqual(dataset.curriculum.id, "curr_bac_sciences_exp");
  assert.strictEqual(dataset.curriculum.streamId, "sciences_exp");
  assert.strictEqual(dataset.curriculum.educationLevel, "secondary");
  assert.strictEqual(dataset.curriculum.examType, "BAC");

  const subjects = dataset.subjects;
  assert.strictEqual(subjects.length, 3);

  const math = subjects.find((s) => s.id === "math");
  const physics = subjects.find((s) => s.id === "physics");
  const snv = subjects.find((s) => s.id === "natural_sciences");

  assert(math, "Math subject must exist");
  assert(physics, "Physics subject must exist");
  assert(snv, "Natural Sciences subject must exist");

  // Arrêté n° 54 official coefficients: Math 7, Physics 6, SNV 6
  assert.strictEqual(math.coefficientProvenance.value, 7, "Math coefficient must be 7");
  assert.strictEqual(physics.coefficientProvenance.value, 6, "Physics coefficient must be 6");
  assert.strictEqual(snv.coefficientProvenance.value, 6, "SNV coefficient must be 6");
});

// =============================================================================
// SUITE B: Topic & Skill Hierarchy Integrity
// =============================================================================
runSuite("B", "Topic & Skill Hierarchy Integrity", () => {
  assert.strictEqual(dataset.topics.length, 14, "Expected exactly 14 curriculum topics");
  assert.strictEqual(dataset.skills.length, 31, "Expected exactly 31 curriculum skills");

  const topicIds = new Set(dataset.topics.map((t) => t.id));
  const subjectIds = new Set(dataset.subjects.map((s) => s.id));

  for (const topic of dataset.topics) {
    assert(subjectIds.has(topic.subjectId), `Topic ${topic.id} has invalid subjectId ${topic.subjectId}`);
    assert.strictEqual(topic.curriculumId, dataset.curriculum.id);
  }

  for (const skill of dataset.skills) {
    assert(topicIds.has(skill.topicId), `Skill ${skill.id} references non-existent topicId ${skill.topicId}`);
    assert(subjectIds.has(skill.subjectId), `Skill ${skill.id} references non-existent subjectId ${skill.subjectId}`);
    assert.strictEqual(skill.streamId, "sciences_exp");
  }
});

// =============================================================================
// SUITE C: Learning Objectives & Bloom Taxonomy Alignment
// =============================================================================
runSuite("C", "Learning Objectives & Bloom Taxonomy Alignment", () => {
  assert(dataset.learningObjectives && dataset.learningObjectives.length >= 5, "Expected learning objectives to exist");
  const skillIds = new Set(dataset.skills.map((s) => s.id));

  for (const lo of dataset.learningObjectives) {
    assert.ok(lo.id, "LO missing id");
    assert.ok(lo.code, "LO missing code");
    assert.ok(skillIds.has(lo.skillId), `LO ${lo.id} references non-existent skill ${lo.skillId}`);
    assert.ok(schemasModule.VALID_BLOOM_LEVELS.has(lo.bloomLevel), `LO ${lo.id} has invalid Bloom level ${lo.bloomLevel}`);
    assert.ok(lo.description_ar && lo.description_ar.length > 5, `LO ${lo.id} missing description_ar`);
    assert.ok(lo.description_fr && lo.description_fr.length > 5, `LO ${lo.id} missing description_fr`);
  }
});

// =============================================================================
// SUITE D: Prerequisite DAG Cycle-Free Integrity
// =============================================================================
runSuite("D", "Prerequisite DAG Cycle-Free Integrity", () => {
  const skillMap = new Map(dataset.skills.map((s) => [s.id, s]));
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(skillId) {
    visited.add(skillId);
    recursionStack.add(skillId);

    const skill = skillMap.get(skillId);
    if (skill && skill.prerequisites) {
      for (const prereqId of skill.prerequisites) {
        assert(skillMap.has(prereqId), `Skill ${skillId} has non-existent prereq ${prereqId}`);
        assert.notStrictEqual(prereqId, skillId, `Skill ${skillId} self-references`);
        if (!visited.has(prereqId)) {
          dfs(prereqId);
        } else if (recursionStack.has(prereqId)) {
          throw new Error(`Cycle detected involving ${prereqId}`);
        }
      }
    }
    recursionStack.delete(skillId);
  }

  for (const skill of dataset.skills) {
    if (!visited.has(skill.id)) {
      dfs(skill.id);
    }
  }
});

// =============================================================================
// SUITE E: Practice Questions Completeness & Options
// =============================================================================
runSuite("E", "Practice Questions Completeness & Options", () => {
  assert.strictEqual(dataset.practiceQuestions.length, 31, "Expected 31 practice questions");

  for (const q of dataset.practiceQuestions) {
    assert([1, 2, 3].includes(q.difficulty), `Invalid difficulty ${q.difficulty} in ${q.id}`);
    assert(q.options.length >= 3, `Question ${q.id} must have >= 3 options`);
    const optionIds = q.options.map((o) => o.id);
    assert(optionIds.includes(q.correctAnswerId), `Question ${q.id} correctAnswerId not in options`);
    assert.strictEqual(q.isRetestVariant, false);
    assert(q.prompt_ar && q.prompt_ar.length > 5);
    assert(q.prompt_fr && q.prompt_fr.length > 5);
  }
});

// =============================================================================
// SUITE F: Retest Twin Separation & Structural Transfer
// =============================================================================
runSuite("F", "Retest Twin Separation & Structural Transfer", () => {
  assert.strictEqual(dataset.retestQuestions.length, 31, "Expected 31 retest questions");
  const practiceMap = new Map(dataset.practiceQuestions.map((q) => [q.id, q]));

  for (const rq of dataset.retestQuestions) {
    assert.strictEqual(rq.isRetestVariant, true);
    assert(practiceMap.has(rq.retestForQuestionId), `Retest ${rq.id} references invalid parent ${rq.retestForQuestionId}`);

    const pq = practiceMap.get(rq.retestForQuestionId);
    assert.strictEqual(rq.skillId, pq.skillId, `Retest ${rq.id} skillId does not match parent`);
    assert.strictEqual(rq.difficulty, pq.difficulty, `Retest ${rq.id} difficulty does not match parent`);
    assert.notStrictEqual(rq.prompt_ar, pq.prompt_ar, `Retest ${rq.id} has duplicate prompt with parent`);
  }
});

// =============================================================================
// SUITE G: Distractor Error Taxonomy Linkage
// =============================================================================
runSuite("G", "Distractor Error Taxonomy Linkage", () => {
  let totalDistractorsChecked = 0;
  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    for (const opt of q.options) {
      if (opt.id !== q.correctAnswerId && opt.suspectedErrorType) {
        assert(schemasModule.VALID_ERROR_TAXONOMY.has(opt.suspectedErrorType), `Invalid taxonomy ${opt.suspectedErrorType} in option ${opt.id}`);
        totalDistractorsChecked++;
      }
    }
  }
  assert(totalDistractorsChecked > 50, "Expected > 50 mapped distractors across question bank");
});

// =============================================================================
// SUITE H: Active 14-Element Lessons Structure
// =============================================================================
runSuite("H", "Active 14-Element Lessons Structure", () => {
  assert(dataset.lessons && dataset.lessons.length >= 4, "Expected >= 4 pilot lessons");

  for (const l of dataset.lessons) {
    assert(l.id && l.skillId && l.subjectId && l.topicId, `Missing core identifiers in lesson ${l.id}`);
    assert(l.title_ar && l.title_fr, `Missing bilingual titles in lesson ${l.id}`);
    assert(l.targetCapability_ar && l.targetCapability_ar.length > 20, `Missing target capability in ${l.id}`);
    assert(l.whatYouMustKnow_ar && l.whatYouMustKnow_ar.length > 10, `Missing whatYouMustKnow in ${l.id}`);
    assert(l.whyThisMatters_ar && l.whyThisMatters_ar.length > 20, `Missing whyThisMatters in ${l.id}`);
    assert(l.coreConcept_ar && l.coreConcept_ar.length > 20, `Missing coreConcept in ${l.id}`);
    assert(l.simpleExplanation_ar && l.simpleExplanation_ar.length > 20, `Missing simpleExplanation in ${l.id}`);
    assert(l.workedExample, `Missing workedExample in ${l.id}`);
    assert(l.commonMistakes && l.commonMistakes.length >= 2, `Expected >= 2 common mistakes in ${l.id}`);
    assert(l.howToKnowYouUnderstood_ar, `Missing howToKnowYouUnderstood in ${l.id}`);
    assert(l.quickRecallPrompt_ar && l.quickRecallAnswer_ar, `Missing quick recall in ${l.id}`);
  }
});

// =============================================================================
// SUITE I: Worked Examples Procedural Completeness
// =============================================================================
runSuite("I", "Worked Examples Procedural Completeness", () => {
  for (const l of dataset.lessons) {
    const we = l.workedExample;
    assert(we.id && we.skillId, `Missing id or skillId in worked example of ${l.id}`);
    assert(we.problem_ar && we.problem_ar.length > 10, `Missing problem_ar in worked example of ${l.id}`);
    assert(we.howToThink_ar && we.howToThink_ar.length > 15, `Missing howToThink_ar in worked example of ${l.id}`);
    assert(we.stepByStepSolution_ar && we.stepByStepSolution_ar.length >= 3, `Expected >= 3 steps in worked example of ${l.id}`);
    assert(we.finalAnswer_ar && we.finalAnswer_ar.length > 3, `Missing finalAnswer_ar in worked example of ${l.id}`);
    assert(we.verificationTip_ar && we.verificationTip_ar.length > 10, `Missing verificationTip_ar in worked example of ${l.id}`);
  }
});

// =============================================================================
// SUITE J: Targeted Error Repair Guides (5-15 min)
// =============================================================================
runSuite("J", "Targeted Error Repair Guides (5-15 min)", () => {
  assert(dataset.repairGuides && dataset.repairGuides.length >= 6, "Expected >= 6 repair guides");

  for (const rg of dataset.repairGuides) {
    assert(rg.id && rg.skillId && rg.suspectedErrorType, `Missing core identifiers in repair guide ${rg.id}`);
    assert(rg.title_ar && rg.whyItHappens_ar && rg.diagnosis_ar, `Missing diagnostic info in ${rg.id}`);
    assert(rg.repairSteps_ar && rg.repairSteps_ar.length >= 3, `Expected >= 3 repair steps in ${rg.id}`);
    assert(rg.microPracticePrompt_ar && rg.microPracticeSolution_ar, `Missing micro-practice in ${rg.id}`);
    assert(rg.estimatedMinutes >= 5 && rg.estimatedMinutes <= 15, `Estimated minutes must be 5-15 in ${rg.id}`);
    assert.strictEqual(rg.isActive, true);
  }
});

// =============================================================================
// SUITE K: Actionable Study Methods Library
// =============================================================================
runSuite("K", "Actionable Study Methods Library", () => {
  assert(dataset.studyMethods && dataset.studyMethods.length >= 13, "Expected >= 13 study methods");
  const expectedCategories = new Set([
    "reading",
    "memorization",
    "revision",
    "problem_solving",
    "error_repair",
    "weekly_review",
    "exam_prep",
    "time_management",
  ]);

  for (const sm of dataset.studyMethods) {
    assert(expectedCategories.has(sm.category), `Invalid category ${sm.category} in study method ${sm.id}`);
    assert(sm.practicalSteps_ar && sm.practicalSteps_ar.length >= 3, `Expected >= 3 practical steps in ${sm.id}`);
    assert(sm.exampleScenario_ar && sm.commonTrap_ar, `Missing scenario or trap in ${sm.id}`);
    assert(sm.estimatedMinutes > 0, `estimatedMinutes must be > 0 in ${sm.id}`);
    assert.strictEqual(sm.isActive, true);
  }
});

// =============================================================================
// SUITE L: Evidence-Based Expert Guidance
// =============================================================================
runSuite("L", "Evidence-Based Expert Guidance", () => {
  assert(dataset.expertGuidance && dataset.expertGuidance.length >= 7, "Expected >= 7 expert guidance entries");

  for (const eg of dataset.expertGuidance) {
    assert(eg.expertName && eg.expertField && eg.institutionOrAffiliation, `Missing attribution in ${eg.id}`);
    assert(eg.primaryPublication && eg.primaryPublication.length > 5, `Missing publication in ${eg.id}`);
    assert(["Tier 1 (High)", "Tier 2 (Moderate)", "Tier 3 (Foundational)"].includes(eg.evidenceLevel));
    assert(eg.principle_ar && eg.actionForStudent_ar, `Missing principle or action in ${eg.id}`);
    assert.strictEqual(eg.isActive, true);
  }
});

// =============================================================================
// SUITE M: Action-Oriented Motivation & Mindset
// =============================================================================
runSuite("M", "Action-Oriented Motivation & Mindset", () => {
  assert(dataset.motivationalPrinciples && dataset.motivationalPrinciples.length >= 7, "Expected >= 7 principles");

  for (const mp of dataset.motivationalPrinciples) {
    assert(mp.category && mp.title_ar && mp.principle_ar && mp.actionPrompt_ar, `Missing fields in ${mp.id}`);
    assert.strictEqual(mp.rightsStatus, "original");
    assert.strictEqual(mp.isActive, true);
  }
});

// =============================================================================
// SUITE N: Verified Historical Quotes
// =============================================================================
runSuite("N", "Verified Historical Quotes", () => {
  assert(dataset.verifiedQuotes && dataset.verifiedQuotes.length >= 4, "Expected >= 4 verified quotes");

  for (const vq of dataset.verifiedQuotes) {
    assert(vq.quote_original && vq.translation_ar && vq.author && vq.verifiedSource, `Missing fields in quote ${vq.id}`);
    assert.strictEqual(vq.isActive, true);
  }
});

// =============================================================================
// SUITE O: Calibrated Mini-Exams
// =============================================================================
runSuite("O", "Calibrated Mini-Exams", () => {
  assert(dataset.miniExams && dataset.miniExams.length >= 6, "Expected >= 6 mini exams");
  const validTypes = new Set([
    "skill_quiz",
    "topic_test",
    "weekly_checkpoint",
    "subject_mini_exam",
    "weakness_exam",
    "mixed_exam",
  ]);

  for (const me of dataset.miniExams) {
    assert(validTypes.has(me.type), `Invalid mini exam type ${me.type} in ${me.id}`);
    assert(me.timeTargetMinutes > 0, `timeTargetMinutes must be > 0 in ${me.id}`);
    assert(me.passingScorePercent >= 50 && me.passingScorePercent <= 80, `Invalid passing score in ${me.id}`);
    assert(me.questionIds && me.questionIds.length >= 1, `Expected >= 1 questionIds in ${me.id}`);
    assert.strictEqual(me.isActive, true);
  }
});

// =============================================================================
// SUITE P: Past BAC Official Exam References
// =============================================================================
runSuite("P", "Past BAC Official Exam References", () => {
  assert(dataset.pastBacExamReferences && dataset.pastBacExamReferences.length >= 6, "Expected >= 6 past BAC references");

  for (const ref of dataset.pastBacExamReferences) {
    assert([2022, 2023].includes(ref.year), `Expected 2022 or 2023 year in ${ref.id}`);
    assert.strictEqual(ref.rightsStatus, "official_reference");
    assert(ref.exerciseNumber > 0, `exerciseNumber must be > 0 in ${ref.id}`);
    assert(ref.skillIds && ref.skillIds.length > 0, `skillIds must not be empty in ${ref.id}`);
  }
});

// =============================================================================
// SUITE Q: Content Purity Invariant (ZERO user_id)
// =============================================================================
runSuite("Q", "Content Purity Invariant (ZERO user_id across all entities)", () => {
  const allEntities = [
    dataset.curriculum,
    ...dataset.subjects,
    ...dataset.topics,
    ...dataset.skills,
    ...(dataset.learningObjectives || []),
    ...dataset.practiceQuestions,
    ...dataset.retestQuestions,
    ...(dataset.pastBacExamReferences || []),
    ...(dataset.sources || []),
    ...(dataset.verificationRecords || []),
    ...(dataset.resources || []),
    ...(dataset.lessons || []),
    ...(dataset.repairGuides || []),
    ...(dataset.studyMethods || []),
    ...(dataset.expertGuidance || []),
    ...(dataset.motivationalPrinciples || []),
    ...(dataset.verifiedQuotes || []),
    ...(dataset.miniExams || []),
  ];

  for (const entity of allEntities) {
    assert(!("user_id" in entity), `Entity ${entity.id} contains prohibited property 'user_id'`);
    assert(!("student_id" in entity), `Entity ${entity.id} contains prohibited property 'student_id'`);
    assert(!("userId" in entity), `Entity ${entity.id} contains prohibited property 'userId'`);
    assert(!("studentId" in entity), `Entity ${entity.id} contains prohibited property 'studentId'`);
  }
});

// =============================================================================
// SUITE R: Bilingual Completeness Across Core Entities
// =============================================================================
runSuite("R", "Bilingual Completeness Across Core Entities", () => {
  for (const s of dataset.subjects) {
    assert(s.title_ar && s.title_fr, `Subject ${s.id} missing bilingual titles`);
  }
  for (const t of dataset.topics) {
    assert(t.title_ar && t.title_fr, `Topic ${t.id} missing bilingual titles`);
  }
  for (const sk of dataset.skills) {
    assert(sk.title_ar && sk.title_fr, `Skill ${sk.id} missing bilingual titles`);
  }
  for (const q of dataset.practiceQuestions) {
    assert(q.prompt_ar && q.prompt_fr, `Question ${q.id} missing bilingual prompt`);
    assert(q.explanation_ar && q.explanation_fr, `Question ${q.id} missing bilingual explanation`);
  }
});

// =============================================================================
// SUITE S: Source Provenance & Rights Declaration
// =============================================================================
runSuite("S", "Source Provenance & Rights Declaration", () => {
  assert(dataset.sources && dataset.sources.length >= 4, "Expected >= 4 official sources");
  const sourceIds = new Set(dataset.sources.map((s) => s.id));

  for (const q of dataset.practiceQuestions) {
    assert(sourceIds.has(q.sourceId), `Question ${q.id} has invalid sourceId ${q.sourceId}`);
    assert(["original", "official_reference", "licensed"].includes(q.rightsStatus));
  }
  for (const l of dataset.lessons || []) {
    assert(sourceIds.has(l.sourceId), `Lesson ${l.id} has invalid sourceId ${l.sourceId}`);
  }
  for (const rg of dataset.repairGuides || []) {
    assert(sourceIds.has(rg.sourceId), `Repair guide ${rg.id} has invalid sourceId ${rg.sourceId}`);
  }
});

// =============================================================================
// SUITE T: Content Query Helper API Completeness
// =============================================================================
runSuite("T", "Content Query Helper API Completeness", () => {
  assert.strictEqual(mappingsModule.getAllLessons().length, dataset.lessons.length);
  assert.strictEqual(mappingsModule.getAllRepairGuides().length, dataset.repairGuides.length);
  assert.strictEqual(mappingsModule.getAllStudyMethods().length, dataset.studyMethods.length);
  assert.strictEqual(mappingsModule.getAllExpertGuidance().length, dataset.expertGuidance.length);
  assert.strictEqual(mappingsModule.getAllMotivationalPrinciples().length, dataset.motivationalPrinciples.length);
  assert.strictEqual(mappingsModule.getAllVerifiedQuotes().length, dataset.verifiedQuotes.length);
  assert.strictEqual(mappingsModule.getAllMiniExams().length, dataset.miniExams.length);

  const mathLessons = mappingsModule.getLessonBySkillId("math_derivatives_chain_rule");
  assert(mathLessons, "getLessonBySkillId failed to return math chain rule lesson");

  const repairGuides = mappingsModule.getRepairGuidesForSkill("math_derivatives_chain_rule");
  assert(repairGuides.length > 0, "getRepairGuidesForSkill failed for math chain rule");

  const mathExams = mappingsModule.getMiniExamsForSubject("math");
  assert(mathExams.length > 0, "getMiniExamsForSubject failed for math");
});

// =============================================================================
// SUITE U: Automated Dataset Validation Integration
// =============================================================================
runSuite("U", "Automated Dataset Validation Integration (12 Rules)", () => {
  assert.strictEqual(validationReport.isValid, true, "Validation report isValid must be true");
  assert.strictEqual(validationReport.violations.length, 0, `Expected 0 violations, got ${validationReport.violations.length}`);
  assert(validationReport.totalEntitiesChecked > 100, `Expected > 100 entities checked, got ${validationReport.totalEntitiesChecked}`);
});

// =============================================================================
// SUITE V: Backward Compatibility & Engine Independence
// =============================================================================
runSuite("V", "Backward Compatibility & Engine Independence", () => {
  const curriculumModule = loadTs("src/data/curriculum/index.ts");
  assert(curriculumModule.ALL_PRACTICE_QUESTIONS, "ALL_PRACTICE_QUESTIONS must exist in curriculum module");
  assert.strictEqual(curriculumModule.ALL_PRACTICE_QUESTIONS.length, 62, "Expected 62 practice + retest questions in curriculum index");

  const skillsModule = loadTs("src/data/curriculum/skills.ts");
  assert(skillsModule.ALL_CURRICULUM_SKILLS, "ALL_CURRICULUM_SKILLS must exist");
  assert.strictEqual(Object.keys(skillsModule.ALL_CURRICULUM_SKILLS).length, 31);
});

// =============================================================================
// SUITE W: Remote Database Invariant & Supabase Contract
// =============================================================================
runSuite("W", "Remote Database Invariant & Supabase Contract (0 Content Migrations)", () => {
  // Verify that only student foundation migrations exist (0 content migrations)
  const migrationsDir = path.resolve("supabase/migrations");
  const files = fs.readdirSync(migrationsDir);
  for (const file of files) {
    const migrationSql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    // Content tables must not be defined in database migrations
    const prohibitedTables = ["lessons", "study_methods", "expert_guidance", "motivational_principles", "mini_exams", "repair_guides"];
    for (const table of prohibitedTables) {
      assert(!migrationSql.toLowerCase().includes(`create table public.${table}`), `Prohibited content table public.${table} found in migrations!`);
    }
  }
  // Ensure no content migrations were added
  assert(!files.some((f) => f.includes("content")), "No content migrations are permitted in database");
});

// =============================================================================
// FINAL SUMMARY
// =============================================================================
console.log("\n==================================================================");
console.log(`  RESULTS: ${passedCount}/23 SUITES (A-W) PASSED (0 FAILURES)`);
console.log("  ALL 23/23 CONTENT PRODUCTION SUITES PASSED WITH 100% SUCCESS!");
console.log("==================================================================\n");
