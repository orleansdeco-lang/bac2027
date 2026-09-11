import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 07: CONTENT MODEL VERIFICATION SUITE");
console.log("  Authoritative Verification: 20 Comprehensive Test Suites");
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
// LOAD ACTUAL DATASETS
// -----------------------------------------------------------------------------

const topicsModule = loadTs("src/data/curriculum/topics.ts");
const skillsModule = loadTs("src/data/curriculum/skills.ts");
const questionsModule = loadTs("src/data/curriculum/practice-questions.ts");
const curriculumIndexModule = loadTs("src/data/curriculum/index.ts");
const pilotSkillsModule = loadTs("src/data/skills/index.ts");
const pilotPracticeModule = loadTs("src/data/practice/sciences-exp/index.ts");

const TOPICS = topicsModule.CURRICULUM_TOPICS;
const SKILLS_MAP = skillsModule.ALL_CURRICULUM_SKILLS;
const SKILLS = Object.values(SKILLS_MAP);
const QUESTIONS = questionsModule.EXPANDED_PRACTICE_QUESTIONS;

const VALID_DIMENSIONS = new Set([
  "knowledge",
  "understanding",
  "application",
  "methodology",
  "speed",
  "confidence",
]);

const VALID_ERROR_TAXONOMY = new Set([
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

let passedCount = 0;

function runTest(num, name, fn) {
  try {
    fn();
    console.log(`  [PASS] Test ${String(num).padStart(2, "0")}: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] Test ${String(num).padStart(2, "0")}: ${name}`);
    console.error(`         ${err.message}`);
    process.exit(1);
  }
}

// =============================================================================
// TEST 01: Topics count (14 topics: Math 4, Physics 5, SNV 5)
// =============================================================================
runTest(1, "Total topics count is 14 (Math: 4, Physics: 5, SNV: 5)", () => {
  assert.strictEqual(TOPICS.length, 14, `Expected 14 topics, got ${TOPICS.length}`);
  const mathTopics = TOPICS.filter((t) => t.subjectId === "math");
  const physicsTopics = TOPICS.filter((t) => t.subjectId === "physics");
  const snvTopics = TOPICS.filter((t) => t.subjectId === "natural_sciences");

  assert.strictEqual(mathTopics.length, 4, `Expected 4 Math topics, got ${mathTopics.length}`);
  assert.strictEqual(physicsTopics.length, 5, `Expected 5 Physics topics, got ${physicsTopics.length}`);
  assert.strictEqual(snvTopics.length, 5, `Expected 5 SNV topics, got ${snvTopics.length}`);
});

// =============================================================================
// TEST 02: Topic structure completeness
// =============================================================================
runTest(2, "Topic structure completeness and active status", () => {
  for (const topic of TOPICS) {
    assert.ok(topic.id && typeof topic.id === "string", `Topic missing id: ${JSON.stringify(topic)}`);
    assert.ok(topic.subjectId, `Topic ${topic.id} missing subjectId`);
    assert.ok(topic.title_ar && topic.title_ar.trim().length > 0, `Topic ${topic.id} missing title_ar`);
    assert.ok(topic.title_fr && topic.title_fr.trim().length > 0, `Topic ${topic.id} missing title_fr`);
    assert.ok(typeof topic.order === "number", `Topic ${topic.id} missing numeric order`);
    assert.strictEqual(topic.isActive, true, `Topic ${topic.id} should be active`);
  }
});

// =============================================================================
// TEST 03: Curriculum skills count (31 skills: Math 10, Physics 11, SNV 10)
// =============================================================================
runTest(3, "Total curriculum skills count is 31 (Math: 10, Physics: 11, SNV: 10)", () => {
  assert.strictEqual(SKILLS.length, 31, `Expected 31 skills, got ${SKILLS.length}`);
  const mathSkills = SKILLS.filter((s) => s.subjectId === "math");
  const physicsSkills = SKILLS.filter((s) => s.subjectId === "physics");
  const snvSkills = SKILLS.filter((s) => s.subjectId === "natural_sciences");

  assert.strictEqual(mathSkills.length, 10, `Expected 10 Math skills, got ${mathSkills.length}`);
  assert.strictEqual(physicsSkills.length, 11, `Expected 11 Physics skills, got ${physicsSkills.length}`);
  assert.strictEqual(snvSkills.length, 10, `Expected 10 SNV skills, got ${snvSkills.length}`);
});

// =============================================================================
// TEST 04: Skill-to-topic mapping integrity
// =============================================================================
runTest(4, "Every skill maps to an existing, active topic", () => {
  const topicIds = new Set(TOPICS.map((t) => t.id));
  for (const skill of SKILLS) {
    assert.ok(topicIds.has(skill.topicId), `Skill ${skill.id} references invalid topicId: ${skill.topicId}`);
    const parentTopic = TOPICS.find((t) => t.id === skill.topicId);
    assert.strictEqual(skill.subjectId, parentTopic.subjectId,
      `Skill ${skill.id} subjectId (${skill.subjectId}) does not match topic subjectId (${parentTopic.subjectId})`);
  }
});

// =============================================================================
// TEST 05: Bilingual skill titles and descriptions
// =============================================================================
runTest(5, "Every skill has non-empty bilingual titles and descriptions", () => {
  for (const skill of SKILLS) {
    assert.ok(skill.title_ar && skill.title_ar.trim().length > 3, `Skill ${skill.id} missing title_ar`);
    assert.ok(skill.title_fr && skill.title_fr.trim().length > 3, `Skill ${skill.id} missing title_fr`);
    assert.ok(skill.description_ar && skill.description_ar.trim().length > 10, `Skill ${skill.id} missing description_ar`);
    assert.ok(skill.description_fr && skill.description_fr.trim().length > 10, `Skill ${skill.id} missing description_fr`);
  }
});

// =============================================================================
// TEST 06: Repair strategy and steps completeness
// =============================================================================
runTest(6, "Every skill has actionable repair strategy and multi-step guides (ar & fr)", () => {
  for (const skill of SKILLS) {
    assert.ok(skill.repairStrategy_ar && skill.repairStrategy_ar.trim().length > 5,
      `Skill ${skill.id} missing repairStrategy_ar`);
    assert.ok(skill.repairStrategy_fr && skill.repairStrategy_fr.trim().length > 5,
      `Skill ${skill.id} missing repairStrategy_fr`);
    assert.ok(Array.isArray(skill.repairSteps_ar) && skill.repairSteps_ar.length >= 3,
      `Skill ${skill.id} must have >= 3 repairSteps_ar`);
    assert.ok(Array.isArray(skill.repairSteps_fr) && skill.repairSteps_fr.length >= 3,
      `Skill ${skill.id} must have >= 3 repairSteps_fr`);
  }
});

// =============================================================================
// TEST 07: Prerequisite reference integrity
// =============================================================================
runTest(7, "All prerequisite IDs exist in the curriculum skills catalog", () => {
  const skillIds = new Set(SKILLS.map((s) => s.id));
  for (const skill of SKILLS) {
    assert.ok(Array.isArray(skill.prerequisites), `Skill ${skill.id} prerequisites must be an array`);
    for (const prereqId of skill.prerequisites) {
      assert.ok(skillIds.has(prereqId), `Skill ${skill.id} has invalid prerequisite ID: ${prereqId}`);
    }
  }
});

// =============================================================================
// TEST 08: Directed Acyclic Graph (DAG) cycle detection
// =============================================================================
runTest(8, "No circular prerequisite dependencies exist (DAG validation)", () => {
  const visited = new Set();
  const recursionStack = new Set();

  function checkCycle(skillId, path = []) {
    visited.add(skillId);
    recursionStack.add(skillId);

    const skill = SKILLS_MAP[skillId];
    if (skill && skill.prerequisites) {
      for (const prereqId of skill.prerequisites) {
        if (!visited.has(prereqId)) {
          checkCycle(prereqId, [...path, skillId]);
        } else if (recursionStack.has(prereqId)) {
          throw new Error(`Cycle detected: ${[...path, skillId, prereqId].join(" -> ")}`);
        }
      }
    }

    recursionStack.delete(skillId);
  }

  for (const skill of SKILLS) {
    if (!visited.has(skill.id)) {
      checkCycle(skill.id);
    }
  }
});

// =============================================================================
// TEST 09: Self-prerequisite integrity
// =============================================================================
runTest(9, "No skill lists itself as a prerequisite", () => {
  for (const skill of SKILLS) {
    assert.ok(!skill.prerequisites.includes(skill.id),
      `Skill ${skill.id} cannot be its own prerequisite`);
  }
});

// =============================================================================
// TEST 10: Difficulty level validation (1, 2, or 3)
// =============================================================================
runTest(10, "Skill difficulty is constrained to integer bounds [1, 2, 3]", () => {
  for (const skill of SKILLS) {
    assert.ok([1, 2, 3].includes(skill.difficulty),
      `Skill ${skill.id} has invalid difficulty: ${skill.difficulty}`);
  }
});

// =============================================================================
// TEST 11: Cognitive dimensions validity
// =============================================================================
runTest(11, "Skill cognitive dimensions are mapped to valid diagnostic dimensions", () => {
  for (const skill of SKILLS) {
    assert.ok(Array.isArray(skill.cognitiveDimensions) && skill.cognitiveDimensions.length > 0,
      `Skill ${skill.id} must have at least one cognitive dimension`);
    for (const dim of skill.cognitiveDimensions) {
      assert.ok(VALID_DIMENSIONS.has(dim),
        `Skill ${skill.id} has invalid dimension: ${dim}`);
    }
  }
});

// =============================================================================
// TEST 12: Expanded practice questions count (44 questions)
// =============================================================================
runTest(12, "Expanded practice question bank has exactly 44 questions (22 practice + 22 retest)", () => {
  assert.strictEqual(QUESTIONS.length, 44, `Expected 44 questions, got ${QUESTIONS.length}`);
  const practiceQuestions = QUESTIONS.filter((q) => !q.isRetestVariant);
  const retestQuestions = QUESTIONS.filter((q) => q.isRetestVariant);

  assert.strictEqual(practiceQuestions.length, 22, `Expected 22 practice questions, got ${practiceQuestions.length}`);
  assert.strictEqual(retestQuestions.length, 22, `Expected 22 retest questions, got ${retestQuestions.length}`);
});

// =============================================================================
// TEST 13: Question option structure and single correct answer
// =============================================================================
runTest(13, "Every question has valid options (3-4) and exactly one correct answer", () => {
  for (const q of QUESTIONS) {
    assert.ok(Array.isArray(q.options) && q.options.length >= 3 && q.options.length <= 4,
      `Question ${q.id} must have 3-4 options, got ${q.options?.length}`);
    const correctOptions = q.options.filter((opt) => opt.id === q.correctAnswerId);
    assert.strictEqual(correctOptions.length, 1,
      `Question ${q.id} must have exactly one correct option matching correctAnswerId ${q.correctAnswerId}`);
  }
});

// =============================================================================
// TEST 14: Distractor error taxonomy linkage
// =============================================================================
runTest(14, "All distractors have valid suspectedErrorType in Error Lab taxonomy", () => {
  let distractorCount = 0;
  for (const q of QUESTIONS) {
    const distractors = q.options.filter((opt) => opt.id !== q.correctAnswerId);
    for (const d of distractors) {
      if (d.suspectedErrorType) {
        assert.ok(VALID_ERROR_TAXONOMY.has(d.suspectedErrorType),
          `Question ${q.id} distractor ${d.id} has invalid error type: ${d.suspectedErrorType}`);
        distractorCount++;
      }
    }
  }
  assert.ok(distractorCount > 50, `Expected > 50 mapped distractors, got ${distractorCount}`);
});

// =============================================================================
// TEST 15: Paired retest variants linkage
// =============================================================================
runTest(15, "Every retest variant correctly links to a parent practice question", () => {
  const practiceMap = new Map(QUESTIONS.filter((q) => !q.isRetestVariant).map((q) => [q.id, q]));
  const retestQuestions = QUESTIONS.filter((q) => q.isRetestVariant);

  for (const rq of retestQuestions) {
    assert.ok(rq.retestForQuestionId, `Retest ${rq.id} missing retestForQuestionId`);
    const parent = practiceMap.get(rq.retestForQuestionId);
    assert.ok(parent, `Retest ${rq.id} references non-existent parent: ${rq.retestForQuestionId}`);
    assert.strictEqual(rq.skillId, parent.skillId,
      `Retest ${rq.id} skillId (${rq.skillId}) must match parent (${parent.skillId})`);
    assert.strictEqual(rq.subjectId, parent.subjectId,
      `Retest ${rq.id} subjectId (${rq.subjectId}) must match parent (${parent.subjectId})`);
  }
});

// =============================================================================
// TEST 16: Unseen retest guarantee (no verbatim identical clones)
// =============================================================================
runTest(16, "Unseen retest guarantee: Retest IDs and prompts differ from practice twin", () => {
  const retestQuestions = QUESTIONS.filter((q) => q.isRetestVariant);
  const practiceMap = new Map(QUESTIONS.filter((q) => !q.isRetestVariant).map((q) => [q.id, q]));

  for (const rq of retestQuestions) {
    const parent = practiceMap.get(rq.retestForQuestionId);
    assert.notStrictEqual(rq.id, parent.id, `Retest ID cannot equal practice ID: ${rq.id}`);
    assert.notStrictEqual(rq.prompt_ar.trim(), parent.prompt_ar.trim(),
      `Retest ${rq.id} prompt_ar must not be verbatim clone of practice question`);
  }
});

// =============================================================================
// TEST 17: Backward compatibility with Pilot questions and skills
// =============================================================================
runTest(17, "Backward compatibility: Pilot skills (9) and questions (18) remain intact", () => {
  const pilotSkills = pilotSkillsModule.SCIENCES_EXP_SKILLS;
  const pilotQuestions = pilotPracticeModule.SCIENCES_EXP_PRACTICE_QUESTIONS;

  assert.strictEqual(Object.keys(pilotSkills).length, 9, "Must retain exactly 9 pilot skills");
  assert.strictEqual(pilotQuestions.length, 18, "Must retain exactly 18 pilot questions");

  // Verify getSkillById resolves both pilot and newly expanded skills
  assert.ok(pilotSkillsModule.getSkillById("math_derivatives_chain_rule"), "Must resolve pilot skill");
  assert.ok(pilotSkillsModule.getSkillById("math_asymptotes_limits"), "Must resolve expanded skill");

  // Verify getPracticeQuestionById resolves both pilot and expanded questions
  assert.ok(pilotPracticeModule.getPracticeQuestionById("pq-math-chain-01"), "Must resolve pilot practice question");
  assert.ok(pilotPracticeModule.getPracticeQuestionById("pq-math-asymptotes-01"), "Must resolve expanded practice question");
});

// =============================================================================
// TEST 18: Curriculum query helper functions
// =============================================================================
runTest(18, "Curriculum query helpers return accurate relational data", () => {
  const allTopics = curriculumIndexModule.getAllTopics();
  assert.strictEqual(allTopics.length, 14);

  const mathTopics = curriculumIndexModule.getTopicsForSubject("math");
  assert.strictEqual(mathTopics.length, 4);

  const fnSkills = curriculumIndexModule.getSkillsForTopic("math_topic_functions");
  assert.ok(fnSkills.length >= 3, `Expected >= 3 skills for math_topic_functions, got ${fnSkills.length}`);

  const chainSkill = curriculumIndexModule.getCurriculumSkillById("math_derivatives_chain_rule");
  assert.ok(chainSkill, "Must retrieve chain rule skill by ID");

  const prereqs = curriculumIndexModule.getPrerequisitesForSkill("math_tangent_convexity");
  assert.ok(prereqs.some((p) => p.id === "math_derivatives_chain_rule"),
    "math_tangent_convexity must have math_derivatives_chain_rule as prerequisite");
});

// =============================================================================
// TEST 19: Strict Educational Scope (BAC Sciences Expérimentales 3AS)
// =============================================================================
runTest(19, "Strict Educational Scope: All content scoped to BAC Sciences Expérimentales (3AS)", () => {
  for (const topic of TOPICS) {
    assert.strictEqual(topic.streamId, "sciences_exp", `Topic ${topic.id} must be sciences_exp`);
    assert.strictEqual(topic.educationLevel, "secondary", `Topic ${topic.id} must be secondary`);
  }
  for (const skill of SKILLS) {
    assert.strictEqual(skill.streamId, "sciences_exp", `Skill ${skill.id} must be sciences_exp`);
    assert.ok(["math", "physics", "natural_sciences"].includes(skill.subjectId),
      `Skill ${skill.id} subjectId must be math, physics, or natural_sciences`);
  }
});

// =============================================================================
// TEST 20: Non-overclaiming verification in Content Model
// =============================================================================
runTest(20, "Non-overclaiming verification: Zero prohibited claims in curriculum datasets", () => {
  const topicsStr = JSON.stringify(TOPICS);
  const skillsStr = JSON.stringify(SKILLS);
  const questionsStr = JSON.stringify(QUESTIONS);

  const forbiddenTerms = [
    "official coefficient",
    "predictedBACScore",
    "official prediction",
    "garantie de réussite",
  ];

  for (const term of forbiddenTerms) {
    assert.ok(!topicsStr.includes(term), `Topics dataset must not contain forbidden term: ${term}`);
    assert.ok(!skillsStr.includes(term), `Skills dataset must not contain forbidden term: ${term}`);
    assert.ok(!questionsStr.includes(term), `Questions dataset must not contain forbidden term: ${term}`);
  }
});

// =============================================================================
// SUMMARY
// =============================================================================
console.log("\n==================================================================");
console.log(`  RESULTS: ${passedCount}/20 SUITES PASSED (0 FAILURES)`);
console.log("  ALL 20/20 CONTENT MODEL VERIFICATION SUITES PASSED WITH 100% SUCCESS!");
console.log("==================================================================\n");
