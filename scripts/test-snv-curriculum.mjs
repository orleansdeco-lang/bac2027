import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — SNV CURRICULUM VERIFICATION SUITE (3AS)");
console.log("  Testing Weeks 01 to 12 (Days 1 to 55 + Checkpoints + Mock Exam)");
console.log("==================================================================\n");

function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  const code = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const m = { exports: {} };
  const fn = new Function("exports", "require", "module", result.outputText);
  fn(m.exports, () => ({}), m);
  return m.exports;
}

const snv = loadTs("src/domain/content/snv-daily-lessons.ts");

const weeks = [
  { num: 1, name: "Week 01", data: snv.snvWeek01Lessons },
  { num: 2, name: "Week 02", data: snv.snvWeek02Lessons },
  { num: 3, name: "Week 03", data: snv.snvWeek03Lessons },
  { num: 4, name: "Week 04", data: snv.snvWeek04Lessons },
  { num: 5, name: "Week 05", data: snv.snvWeek05Lessons },
  { num: 6, name: "Week 06", data: snv.snvWeek06Lessons },
  { num: 7, name: "Week 07", data: snv.snvWeek07Lessons },
  { num: 8, name: "Week 08", data: snv.snvWeek08Lessons },
  { num: 9, name: "Week 09", data: snv.snvWeek09Lessons },
  { num: 10, name: "Week 10", data: snv.snvWeek10Lessons },
  { num: 11, name: "Week 11", data: snv.snvWeek11Lessons },
];

const checkpoints = [
  { num: 1, id: "snv_checkpoint_week01_antibiotics", data: snv.snvWeek01Checkpoint },
  { num: 2, id: "snv_checkpoint_week02_thalassemia", data: snv.snvWeek02Checkpoint },
  { num: 3, id: "snv_checkpoint_week03_electrophoresis_ribonuclease", data: snv.snvWeek03Checkpoint },
  { num: 4, id: "snv_checkpoint_week04_peptide_charge_denaturation", data: snv.snvWeek04Checkpoint },
  { num: 5, id: "snv_checkpoint_unit02_sickle_cell_anemia", data: snv.snvUnit02CapstoneCheckpoint },
  { num: 6, id: "snv_checkpoint_week06_koshland_saturation", data: snv.snvWeek06Checkpoint },
  { num: 7, id: "snv_checkpoint_week07_gout_allopurinol", data: snv.snvWeek07Checkpoint },
  { num: 8, id: "snv_checkpoint_week08_ouchterlony_blood_transfusion", data: snv.snvWeek08Checkpoint },
  { num: 9, id: "snv_checkpoint_week09_agammaglobulinemia_bruton", data: snv.snvWeek09Checkpoint },
  { num: 10, id: "snv_checkpoint_week10_zinkernagel_cmh_restriction", data: snv.snvWeek10Checkpoint },
  { num: 11, id: "snv_checkpoint_week11_sarcoma_pd1_immunotherapy", data: snv.snvWeek11Checkpoint },
];

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log("  [PASS] " + name);
    passed++;
  } catch (err) {
    console.error("  [FAIL] " + name);
    console.error("         " + err.message);
    process.exit(1);
  }
}

// 1. Total weeks and lesson count
test("11 weeks exported, each with exactly 5 lessons (total 55 lessons)", () => {
  assert.strictEqual(weeks.length, 11);
  weeks.forEach((w) => {
    assert.ok(Array.isArray(w.data), `Week ${w.num} is not an array`);
    assert.strictEqual(w.data.length, 5, `Week ${w.num} has ${w.data.length} lessons, expected 5`);
  });
});

// 2. Day continuity
test("Days 1 to 55 form a contiguous, non-overlapping sequence", () => {
  let expectedDay = 1;
  weeks.forEach((w) => {
    w.data.forEach((lesson) => {
      assert.strictEqual(lesson.dayNumber, expectedDay, `Lesson ${lesson.id} has day ${lesson.dayNumber}, expected ${expectedDay}`);
      expectedDay++;
    });
  });
  assert.strictEqual(expectedDay, 56);
});

// 3. Complete field integrity for all 55 lessons
test("All 55 lessons adhere to strict schema requirements", () => {
  const seenIds = new Set();
  weeks.forEach((w) => {
    w.data.forEach((lesson) => {
      assert.ok(lesson.id && !seenIds.has(lesson.id), `Duplicate or missing lesson ID: ${lesson.id}`);
      seenIds.add(lesson.id);
      assert.strictEqual(lesson.subjectId, "sciences_naturelles");
      assert.strictEqual(lesson.streamId, "sciences_exp");
      assert.ok(lesson.unitTitle_ar && lesson.unitTitle_ar.length > 5);
      assert.ok(lesson.title_ar && lesson.title_ar.length > 5);
      assert.ok(lesson.targetCapability_ar && lesson.targetCapability_ar.length > 10);
      assert.ok(lesson.coreConcept_ar && lesson.coreConcept_ar.length > 30);
      assert.ok(lesson.simpleExplanation_ar && lesson.simpleExplanation_ar.length > 30);

      // External resource
      assert.ok(lesson.externalResource, `Lesson ${lesson.id} missing externalResource`);
      assert.strictEqual(lesson.externalResource.platform, "youtube");
      assert.ok(lesson.externalResource.channelName);
      assert.ok(lesson.externalResource.title);
      assert.ok(lesson.externalResource.videoUrl.startsWith("https://www.youtube.com/"));
      assert.ok(lesson.externalResource.targetTimestamp);

      // Common mistakes
      assert.ok(Array.isArray(lesson.commonMistakes) && lesson.commonMistakes.length >= 1);
      lesson.commonMistakes.forEach((cm) => {
        assert.ok(cm.trap_ar && cm.trap_ar.length > 5);
        assert.ok(cm.explanation_ar && cm.explanation_ar.length > 5);
        assert.ok(cm.remedy_ar && cm.remedy_ar.length > 5);
      });

      // Quick recall
      assert.ok(lesson.quickRecallPrompt_ar && lesson.quickRecallPrompt_ar.length > 5);
      assert.ok(lesson.quickRecallAnswer_ar && lesson.quickRecallAnswer_ar.length > 3);
    });
  });
});

// 4. Term 1 aggregated collections
test("snvTerm1Lessons and snvTerm1Checkpoints integrity", () => {
  assert.ok(Array.isArray(snv.snvTerm1Lessons), "snvTerm1Lessons must be an array");
  assert.strictEqual(snv.snvTerm1Lessons.length, 55, `Expected 55 lessons in snvTerm1Lessons, got ${snv.snvTerm1Lessons.length}`);
  assert.ok(Array.isArray(snv.snvTerm1Checkpoints), "snvTerm1Checkpoints must be an array");
  assert.strictEqual(snv.snvTerm1Checkpoints.length, 11, `Expected 11 checkpoints in snvTerm1Checkpoints, got ${snv.snvTerm1Checkpoints.length}`);
});

// 5. Checkpoints verification
test("All 11 checkpoints have valid context, task step, keywords, and twin retest", () => {
  checkpoints.forEach((cp) => {
    const d = cp.data;
    assert.ok(d, `Missing checkpoint ${cp.num}`);
    assert.strictEqual(d.id, cp.id);
    assert.ok(d.title_ar && d.title_ar.length > 5);
    assert.ok(d.context_ar && d.context_ar.length > 30);

    assert.ok(d.taskStep, `Checkpoint ${cp.num} missing taskStep`);
    assert.ok(d.taskStep.instruction_ar && d.taskStep.instruction_ar.length > 10);
    assert.ok(Array.isArray(d.taskStep.expectedKeywords) && d.taskStep.expectedKeywords.length >= 2);
    assert.ok(d.taskStep.fullSolution_ar && d.taskStep.fullSolution_ar.length > 30);

    assert.ok(d.twinRetest, `Checkpoint ${cp.num} missing twinRetest`);
    assert.ok(d.twinRetest.id && d.twinRetest.id.length > 5);
    assert.ok(d.twinRetest.title_ar && d.twinRetest.title_ar.length > 5);
    assert.ok(d.twinRetest.context_ar && d.twinRetest.context_ar.length > 20);
    assert.ok(d.twinRetest.question_ar && d.twinRetest.question_ar.length > 10);
    assert.ok(d.twinRetest.correctAnswer_ar && d.twinRetest.correctAnswer_ar.length > 10);
  });
});

// 6. Term 1 Official Mock Exam (Week 12 D-Day Simulation)
test("Term 1 Official Mock Exam (snvWeek12MockExam & snvTerm1Exam) structure and completeness", () => {
  const exam = snv.snvTerm1Exam;
  assert.ok(exam, "snvTerm1Exam must exist");
  assert.strictEqual(exam.id, "snv_term1_official_mock_exam");
  assert.strictEqual(exam.durationMinutes, 270);
  assert.strictEqual(exam.totalPoints, 20);
  assert.ok(Array.isArray(exam.instructions_ar) && exam.instructions_ar.length >= 3);
  assert.ok(Array.isArray(exam.topics) && exam.topics.length === 2, "Exam must have exactly 2 topics");

  exam.topics.forEach((topic) => {
    assert.ok([1, 2].includes(topic.topicNumber));
    assert.ok(topic.theme_ar && topic.theme_ar.length > 10);
    assert.strictEqual(topic.exercises.length, 3, `Topic ${topic.topicNumber} must have 3 exercises`);

    const ex1 = topic.exercises.find((e) => e.exerciseNumber === 1);
    const ex2 = topic.exercises.find((e) => e.exerciseNumber === 2);
    const ex3 = topic.exercises.find((e) => e.exerciseNumber === 3);

    assert.strictEqual(ex1.type, "restitution_5pts");
    assert.strictEqual(ex1.points, 5);
    assert.strictEqual(ex2.type, "scientific_reasoning_7pts");
    assert.strictEqual(ex2.points, 7);
    assert.strictEqual(ex3.type, "scientific_investigation_8pts");
    assert.strictEqual(ex3.points, 8);

    topic.exercises.forEach((ex) => {
      assert.ok(ex.title_ar && ex.title_ar.length > 5);
      assert.ok(ex.context_ar && ex.context_ar.length > 20);
      assert.ok(Array.isArray(ex.documents) && ex.documents.length >= 1);
      assert.ok(Array.isArray(ex.questions_ar) && ex.questions_ar.length >= 1);
      assert.ok(Array.isArray(ex.officialBareme) && ex.officialBareme.length >= 2);

      const baremeTotal = ex.officialBareme.reduce((sum, b) => sum + b.points, 0);
      assert.strictEqual(baremeTotal, ex.points, `Bareme total for ${ex.title_ar} must equal ${ex.points} pts`);
    });
  });
});

console.log(`\n  RESULTS: ${passed}/6 SUITES PASSED (0 FAILURES)`);
console.log("  ALL SNV TERM 1 LESSONS, CHECKPOINTS & MOCK EXAM 100% VERIFIED!\n");
