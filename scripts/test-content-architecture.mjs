import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 11: CONTENT ARCHITECTURE VERIFICATION");
console.log("  Authoritative Verification: Suites A through P");
console.log("==================================================================\n");

// -----------------------------------------------------------------------------
// HELPER: Transpile and load TypeScript module in pure Node.js
// -----------------------------------------------------------------------------

function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  const code = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const m = { exports: {} };
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
// SUITE A: Subject -> Topic -> Skill Hierarchy Integrity
// =============================================================================
runSuite("A", "Subject -> Topic -> Skill Hierarchy Integrity", () => {
  assert.strictEqual(dataset.subjects.length, 3, "Expected 3 subjects (Math, Physics, SNV)");
  assert.strictEqual(dataset.topics.length, 14, "Expected 14 topics");
  assert.strictEqual(dataset.skills.length, 31, "Expected 31 skills");

  const subjectIds = new Set(dataset.subjects.map((s) => s.id));
  const topicMap = new Map(dataset.topics.map((t) => [t.id, t]));

  for (const topic of dataset.topics) {
    assert.ok(subjectIds.has(topic.subjectId), `Topic ${topic.id} references invalid subject ${topic.subjectId}`);
    assert.strictEqual(topic.curriculumId, dataset.curriculum.id, `Topic ${topic.id} curriculumId mismatch`);
  }

  for (const skill of dataset.skills) {
    const parentTopic = topicMap.get(skill.topicId);
    assert.ok(parentTopic, `Skill ${skill.id} references missing topic ${skill.topicId}`);
    assert.strictEqual(skill.subjectId, parentTopic.subjectId, `Skill ${skill.id} subjectId does not match topic`);
    assert.strictEqual(skill.streamId, parentTopic.streamId, `Skill ${skill.id} streamId does not match topic`);
  }
});

// =============================================================================
// SUITE B: Learning Objective Mapping & Bloom Taxonomy
// =============================================================================
runSuite("B", "Learning Objective Mapping & Bloom Taxonomy", () => {
  assert.ok(dataset.learningObjectives && dataset.learningObjectives.length > 0, "Learning objectives must exist");
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
// SUITE C: Practice vs Retest Distinct Separation (31 + 31 = 62)
// =============================================================================
runSuite("C", "Practice vs Retest Distinct Separation (31 + 31 = 62 questions)", () => {
  assert.strictEqual(dataset.practiceQuestions.length, 31, "Expected 31 practice questions");
  assert.strictEqual(dataset.retestQuestions.length, 31, "Expected 31 retest questions");

  for (const pq of dataset.practiceQuestions) {
    assert.strictEqual(pq.isRetestVariant, false, `Practice question ${pq.id} must have isRetestVariant === false`);
    assert.strictEqual(pq.retestForQuestionId, undefined, `Practice question ${pq.id} must not have retestForQuestionId`);
  }

  for (const rq of dataset.retestQuestions) {
    assert.strictEqual(rq.isRetestVariant, true, `Retest question ${rq.id} must have isRetestVariant === true`);
    assert.ok(rq.retestForQuestionId, `Retest question ${rq.id} must specify retestForQuestionId`);
    assert.notStrictEqual(rq.id, rq.retestForQuestionId, `Retest ID cannot equal practice ID`);
  }
});

// =============================================================================
// SUITE D: Source Provenance Tracking
// =============================================================================
runSuite("D", "Source Provenance Tracking Across All Entities", () => {
  assert.ok(dataset.sources && dataset.sources.length >= 4, "Expected at least 4 authoritative sources");
  const sourceIds = new Set(dataset.sources.map((s) => s.id));

  // Check curriculum
  assert.ok(sourceIds.has(dataset.curriculum.sourceId), `Curriculum references unknown source`);
  assert.ok(schemasModule.VALID_SOURCE_TYPES.has(dataset.curriculum.sourceType));

  // Check subjects
  for (const s of dataset.subjects) {
    assert.ok(sourceIds.has(s.sourceId), `Subject ${s.id} references unknown source ${s.sourceId}`);
    assert.ok(schemasModule.VALID_SOURCE_TYPES.has(s.sourceType));
  }

  // Check topics
  for (const t of dataset.topics) {
    assert.ok(sourceIds.has(t.sourceId), `Topic ${t.id} references unknown source`);
    assert.ok(schemasModule.VALID_SOURCE_TYPES.has(t.sourceType));
  }

  // Check skills
  for (const sk of dataset.skills) {
    assert.ok(sourceIds.has(sk.sourceId), `Skill ${sk.id} references unknown source`);
    assert.ok(schemasModule.VALID_SOURCE_TYPES.has(sk.sourceType));
  }

  // Check questions
  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    assert.ok(sourceIds.has(q.sourceId), `Question ${q.id} references unknown source`);
    assert.ok(schemasModule.VALID_SOURCE_TYPES.has(q.sourceType));
  }
});

// =============================================================================
// SUITE E: Rights Status & Separation of Original vs Official References
// =============================================================================
runSuite("E", "Rights Status & Separation of Original vs Official References", () => {
  for (const pq of dataset.practiceQuestions) {
    assert.strictEqual(pq.sourceType, "original_bac_mastery", `Practice question ${pq.id} must be original_bac_mastery`);
    assert.strictEqual(pq.rightsStatus, "original", `Practice question ${pq.id} rights must be 'original'`);
  }

  for (const rq of dataset.retestQuestions) {
    assert.strictEqual(rq.sourceType, "original_bac_mastery", `Retest question ${rq.id} must be original_bac_mastery`);
    assert.strictEqual(rq.rightsStatus, "original", `Retest question ${rq.id} rights must be 'original'`);
  }

  for (const pbr of dataset.pastBacExamReferences) {
    assert.strictEqual(pbr.rightsStatus, "official_reference", `Past exam ref ${pbr.id} must be 'official_reference'`);
  }
});

// =============================================================================
// SUITE F: Academic Year Modeling
// =============================================================================
runSuite("F", "Academic Year Modeling across Entities", () => {
  assert.strictEqual(dataset.curriculum.academicYear, "2024-2025");
  for (const t of dataset.topics) {
    assert.strictEqual(t.academicYear, "2024-2025", `Topic ${t.id} missing academicYear`);
  }
  for (const s of dataset.skills) {
    assert.strictEqual(s.academicYear, "2024-2025", `Skill ${s.id} missing academicYear`);
  }
  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    assert.strictEqual(q.academicYear, "2024-2025", `Question ${q.id} missing academicYear`);
  }
});

// =============================================================================
// SUITE G: Content Purity (ZERO User ID Ownership)
// =============================================================================
runSuite("G", "Content Purity: Zero user_id across all content entities", () => {
  const allObjects = [
    dataset.curriculum,
    ...dataset.subjects,
    ...dataset.topics,
    ...dataset.skills,
    ...dataset.learningObjectives,
    ...dataset.practiceQuestions,
    ...dataset.retestQuestions,
    ...dataset.pastBacExamReferences,
    ...dataset.sources,
    ...dataset.verificationRecords,
    ...dataset.resources,
  ];

  for (const obj of allObjects) {
    assert.ok(!("user_id" in obj), `Entity ${obj.id} contains prohibited user_id`);
    assert.ok(!("userId" in obj), `Entity ${obj.id} contains prohibited userId`);
    assert.ok(!("student_id" in obj), `Entity ${obj.id} contains prohibited student_id`);
    assert.ok(!("studentId" in obj), `Entity ${obj.id} contains prohibited studentId`);
  }
});

// =============================================================================
// SUITE H: Prerequisite Directed Acyclic Graph (DAG) Cycle-Free
// =============================================================================
runSuite("H", "Prerequisite DAG Cycle-Free & Self-Reference Prevention", () => {
  const skillMap = new Map(dataset.skills.map((s) => [s.id, s]));
  const visited = new Set();
  const recursionStack = new Set();

  function checkCycle(skillId, path = []) {
    visited.add(skillId);
    recursionStack.add(skillId);

    const skill = skillMap.get(skillId);
    if (skill && skill.prerequisites) {
      for (const prereqId of skill.prerequisites) {
        assert.ok(skillMap.has(prereqId), `Skill ${skillId} has non-existent prereq ${prereqId}`);
        assert.notStrictEqual(prereqId, skillId, `Skill ${skillId} lists itself as prereq`);

        if (!visited.has(prereqId)) {
          checkCycle(prereqId, [...path, skillId]);
        } else if (recursionStack.has(prereqId)) {
          throw new Error(`Cycle detected: ${[...path, skillId, prereqId].join(" -> ")}`);
        }
      }
    }

    recursionStack.delete(skillId);
  }

  for (const skill of dataset.skills) {
    if (!visited.has(skill.id)) {
      checkCycle(skill.id);
    }
  }
});

// =============================================================================
// SUITE I: Bilingual Completeness (Arabic & French Parity)
// =============================================================================
runSuite("I", "Bilingual Completeness across All Content Entities", () => {
  for (const t of dataset.topics) {
    assert.ok(t.title_ar && t.title_ar.trim().length > 3, `Topic ${t.id} missing title_ar`);
    assert.ok(t.title_fr && t.title_fr.trim().length > 3, `Topic ${t.id} missing title_fr`);
  }
  for (const s of dataset.skills) {
    assert.ok(s.title_ar && s.title_ar.trim().length > 3, `Skill ${s.id} missing title_ar`);
    assert.ok(s.title_fr && s.title_fr.trim().length > 3, `Skill ${s.id} missing title_fr`);
    assert.ok(s.description_ar && s.description_ar.trim().length > 5, `Skill ${s.id} missing description_ar`);
    assert.ok(s.description_fr && s.description_fr.trim().length > 5, `Skill ${s.id} missing description_fr`);
  }
  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    assert.ok(q.prompt_ar && q.prompt_ar.trim().length > 5, `Question ${q.id} missing prompt_ar`);
    assert.ok(q.prompt_fr && q.prompt_fr.trim().length > 5, `Question ${q.id} missing prompt_fr`);
    assert.ok(q.explanation_ar && q.explanation_ar.trim().length > 5, `Question ${q.id} missing explanation_ar`);
    assert.ok(q.explanation_fr && q.explanation_fr.trim().length > 5, `Question ${q.id} missing explanation_fr`);
  }
});

// =============================================================================
// SUITE J: Difficulty Constraints [1, 2, 3]
// =============================================================================
runSuite("J", "Difficulty Constraints [1, 2, 3]", () => {
  for (const s of dataset.skills) {
    assert.ok([1, 2, 3].includes(s.difficulty), `Skill ${s.id} invalid difficulty ${s.difficulty}`);
  }
  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    assert.ok([1, 2, 3].includes(q.difficulty), `Question ${q.id} invalid difficulty ${q.difficulty}`);
  }
});

// =============================================================================
// SUITE K: Distractor Error Taxonomy Mapping
// =============================================================================
runSuite("K", "Distractor Error Taxonomy Mapping (Error Lab Linkage)", () => {
  let mappedDistractors = 0;
  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    for (const opt of q.options) {
      if (opt.id !== q.correctAnswerId && opt.suspectedErrorType) {
        assert.ok(schemasModule.VALID_ERROR_TAXONOMY.has(opt.suspectedErrorType),
          `Question ${q.id} option ${opt.id} invalid error type: ${opt.suspectedErrorType}`);
        mappedDistractors++;
      }
    }
  }
  assert.ok(mappedDistractors > 50, `Expected > 50 mapped distractors, got ${mappedDistractors}`);
});

// =============================================================================
// SUITE L: Question Option Structure & Single Correct Answer
// =============================================================================
runSuite("L", "Question Option Structure & Single Correct Answer", () => {
  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    assert.ok(Array.isArray(q.options) && q.options.length >= 3 && q.options.length <= 4,
      `Question ${q.id} options count (${q.options?.length}) out of [3, 4]`);
    const matching = q.options.filter((o) => o.id === q.correctAnswerId);
    assert.strictEqual(matching.length, 1, `Question ${q.id} must have exactly one matching correct answer`);
  }
});

// =============================================================================
// SUITE M: Unseen Retest Guarantee (Distinct Problem Twin)
// =============================================================================
runSuite("M", "Unseen Retest Guarantee: Distinct Problem Instances", () => {
  const practiceMap = new Map(dataset.practiceQuestions.map((pq) => [pq.id, pq]));

  for (const rq of dataset.retestQuestions) {
    const parent = practiceMap.get(rq.retestForQuestionId);
    assert.ok(parent, `Retest ${rq.id} missing parent practice question: ${rq.retestForQuestionId}`);
    assert.strictEqual(rq.skillId, parent.skillId, `Retest skill ${rq.skillId} must match parent ${parent.skillId}`);
    assert.strictEqual(rq.subjectId, parent.subjectId, `Retest subject must match parent`);
    assert.notStrictEqual(rq.id, parent.id, `Retest ID cannot equal practice ID`);
    assert.notStrictEqual(rq.prompt_ar.trim(), parent.prompt_ar.trim(),
      `Retest prompt must not be identical clone of practice prompt`);
  }
});

// =============================================================================
// SUITE N: Actionable Remediation Guides (Strategy & Steps)
// =============================================================================
runSuite("N", "Actionable Remediation Guides (Strategy & >= 3 Steps in AR & FR)", () => {
  for (const s of dataset.skills) {
    assert.ok(s.repairStrategy_ar && s.repairStrategy_ar.trim().length > 5, `Skill ${s.id} missing repairStrategy_ar`);
    assert.ok(s.repairStrategy_fr && s.repairStrategy_fr.trim().length > 5, `Skill ${s.id} missing repairStrategy_fr`);
    assert.ok(Array.isArray(s.repairSteps_ar) && s.repairSteps_ar.length >= 3,
      `Skill ${s.id} repairSteps_ar must have at least 3 steps`);
    assert.ok(Array.isArray(s.repairSteps_fr) && s.repairSteps_fr.length >= 3,
      `Skill ${s.id} repairSteps_fr must have at least 3 steps`);
  }
});

// =============================================================================
// SUITE O: Backward Compatibility with Existing Pilot Datasets
// =============================================================================
runSuite("O", "Backward Compatibility with Existing Pilot Datasets", () => {
  const curriculumIdx = loadTs("src/data/curriculum/index.ts");
  const allTopics = curriculumIdx.getAllTopics();
  const allSkills = curriculumIdx.getAllCurriculumSkills();
  const allQuestions = curriculumIdx.ALL_PRACTICE_QUESTIONS;

  assert.strictEqual(allTopics.length, 14, "Must maintain 14 topics in curriculum index");
  assert.strictEqual(allSkills.length, 31, "Must maintain 31 skills in curriculum index");
  assert.strictEqual(allQuestions.length, 62, "Must maintain 62 questions in curriculum index");
});

// =============================================================================
// SUITE P: Integration Contract with Student-Owned Engines
// =============================================================================
runSuite("P", "Integration Contract with Student-Owned Engines (Purity & Independence)", () => {
  // 12 Quality Rules Engine evaluation
  assert.strictEqual(validationReport.isValid, true,
    `Validation report failed with ${validationReport.violations.length} violations: ${JSON.stringify(validationReport.violations)}`);
  assert.strictEqual(validationReport.summary.passedRules.length, 12, "All 12 Content Quality Rules must PASS");
  assert.strictEqual(validationReport.summary.failedRules.length, 0, "Zero Content Quality Rules failed");
  assert.ok(validationReport.totalEntitiesChecked > 100, `Expected > 100 entities checked, got ${validationReport.totalEntitiesChecked}`);
});

// =============================================================================
// SUMMARY
// =============================================================================
console.log("\n==================================================================");
console.log(`  RESULTS: ${passedCount}/16 SUITES (A-P) PASSED (0 FAILURES)`);
console.log("  ALL 16/16 CONTENT ARCHITECTURE SUITES PASSED WITH 100% SUCCESS!");
console.log("==================================================================\n");
