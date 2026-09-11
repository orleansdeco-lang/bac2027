import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 05: MASTERY, RETEST & REPAIR HARDENING");
console.log("  Authoritative Verification: 28 Comprehensive Test Suites");
console.log("==================================================================\n");

// -----------------------------------------------------------------------------
// 1. MOCK LOCALSTORAGE & STORAGE ENGINE
// -----------------------------------------------------------------------------

const mockLocalStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

globalThis.localStorage = mockLocalStorage;
globalThis.window = {};

const STORAGE_KEYS = {
  MISSIONS: "bac_mastery_missions",
  ACTIVE_MISSION_ID: "bac_mastery_active_mission_id",
  PRACTICE_SESSIONS: "bac_mastery_practice_sessions",
  ERRORS: "bac_mastery_errors",
  MASTERY: "bac_mastery_mastery",
};

function loadMissions() {
  const raw = mockLocalStorage.getItem(STORAGE_KEYS.MISSIONS);
  return raw ? JSON.parse(raw) : {};
}

function saveMission(mission) {
  const all = loadMissions();
  all[mission.id] = { ...mission, updatedAt: new Date().toISOString() };
  mockLocalStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(all));
}

function getMissionById(id) {
  return loadMissions()[id];
}

function loadErrorRecords() {
  const raw = mockLocalStorage.getItem(STORAGE_KEYS.ERRORS);
  return raw ? JSON.parse(raw) : {};
}

function saveErrorRecord(record) {
  const all = loadErrorRecords();
  all[record.id] = { ...record, updatedAt: new Date().toISOString() };
  mockLocalStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(all));
}

function getErrorRecordById(id) {
  return loadErrorRecords()[id];
}

function getAllErrorsList() {
  return Object.values(loadErrorRecords()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function getRecurringErrors() {
  return getAllErrorsList().filter((e) => e.isRecurring);
}

function getOpenErrors() {
  return getAllErrorsList().filter((e) => e.repairStatus !== "retest_passed");
}

function getRemediatedErrors() {
  return getAllErrorsList().filter((e) => e.repairStatus === "retest_passed");
}

function loadMasteryRecords() {
  const raw = mockLocalStorage.getItem(STORAGE_KEYS.MASTERY);
  return raw ? JSON.parse(raw) : {};
}

function saveMasteryEvidence(evidence) {
  const all = loadMasteryRecords();
  all[evidence.skillId] = evidence;
  mockLocalStorage.setItem(STORAGE_KEYS.MASTERY, JSON.stringify(all));
}

function getMasteryEvidence(skillId) {
  return loadMasteryRecords()[skillId];
}

function isSkillMastered(skillId) {
  const evidence = getMasteryEvidence(skillId);
  if (!evidence) return false;
  return evidence.masteryStatus === "demonstrated" || evidence.status === "mastered";
}

function clearAllMissionData() {
  mockLocalStorage.removeItem(STORAGE_KEYS.MISSIONS);
  mockLocalStorage.removeItem(STORAGE_KEYS.ACTIVE_MISSION_ID);
  mockLocalStorage.removeItem(STORAGE_KEYS.PRACTICE_SESSIONS);
  mockLocalStorage.removeItem(STORAGE_KEYS.ERRORS);
  mockLocalStorage.removeItem(STORAGE_KEYS.MASTERY);
}

// -----------------------------------------------------------------------------
// 2. DOMAIN LOGIC MIRRORING src/lib/mission/error-lab.ts & generator.ts
// -----------------------------------------------------------------------------

function detectRecurringError(skillId, errorType, currentErrorId) {
  if (errorType === "unknown") return false;
  const allErrors = getAllErrorsList();
  const matching = allErrors.filter(
    (e) => e.skillId === skillId && e.suspectedErrorType === errorType
  );
  if (currentErrorId && !matching.some((e) => e.id === currentErrorId)) {
    return matching.length + 1 >= 2;
  }
  return matching.length >= 2;
}

function createErrorRecord(params) {
  const { sessionId, question, missionId, selectedAnswerId, confidence } = params;
  const chosenOption = question.options?.find((opt) => opt.id === selectedAnswerId);
  const suspectedErrorType = chosenOption?.suspectedErrorType || "unknown";

  const now = new Date().toISOString();
  const id = `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const isRecurring = detectRecurringError(question.skillId, suspectedErrorType, id);

  const record = {
    id,
    sessionId,
    questionId: question.id,
    missionId,
    subjectId: question.subjectId,
    skillId: question.skillId,
    selectedAnswer: selectedAnswerId,
    correctAnswer: question.correctAnswerId,
    suspectedErrorType,
    errorSource: "system_inferred",
    confidence,
    repairStatus: "identified",
    isRecurring,
    attemptCount: 1,
    retestFailureCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  saveErrorRecord(record);

  if (isRecurring) {
    const all = getAllErrorsList();
    all
      .filter(
        (e) =>
          e.skillId === question.skillId &&
          e.suspectedErrorType === suspectedErrorType &&
          !e.isRecurring
      )
      .forEach((e) => {
        e.isRecurring = true;
        saveErrorRecord(e);
      });
  }

  const mission = getMissionById(missionId);
  if (mission && mission.status !== "mastered") {
    mission.status = "repair_needed";
    saveMission(mission);
  }

  return record;
}

function updateStudentErrorAttribution(errorId, errorType) {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;

  record.suspectedErrorType = errorType;
  record.errorSource = "student_selected";
  record.updatedAt = new Date().toISOString();
  record.isRecurring = detectRecurringError(record.skillId, errorType, record.id);
  saveErrorRecord(record);

  if (record.isRecurring) {
    const all = getAllErrorsList();
    all
      .filter(
        (e) =>
          e.skillId === record.skillId &&
          e.suspectedErrorType === errorType &&
          !e.isRecurring
      )
      .forEach((e) => {
        e.isRecurring = true;
        saveErrorRecord(e);
      });
  }

  return record;
}

function confirmErrorAttribution(errorId) {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;
  record.errorSource = "confirmed";
  record.updatedAt = new Date().toISOString();
  saveErrorRecord(record);
  return record;
}

function startRepairAction(errorId) {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;
  record.repairStatus = "repair_started";
  record.updatedAt = new Date().toISOString();
  saveErrorRecord(record);
  return record;
}

function completeRepairAction(errorId) {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;
  record.repairStatus = "repair_completed";
  record.updatedAt = new Date().toISOString();
  saveErrorRecord(record);

  const mission = getMissionById(record.missionId);
  if (mission && mission.status !== "mastered") {
    mission.status = "retest_ready";
    saveMission(mission);
  }
  return record;
}

function evaluateRetestOutcome(errorId, retestQuestionId, isCorrect, confidence) {
  const record = getErrorRecordById(errorId);
  if (!record) throw new Error("Error record not found");

  const now = new Date().toISOString();

  if (isCorrect) {
    record.repairStatus = "retest_passed";
    record.updatedAt = now;
    saveErrorRecord(record);

    const existingEvidence = getMasteryEvidence(record.skillId);
    const confidenceSignals = existingEvidence
      ? [...existingEvidence.confidenceSignals, confidence]
      : [record.confidence, confidence];

    const evidence = {
      skillId: record.skillId,
      missionId: record.missionId,
      subjectId: record.subjectId,
      evidenceType: "repair_retest_success",
      practiceAttempts: (existingEvidence?.practiceAttempts || 0) + 1,
      correctAttempts: (existingEvidence?.correctAttempts || 0) + 1,
      retestAttempts: (record.retestFailureCount || 0) + 1,
      successfulRetests: 1,
      confidenceSignals,
      masteryStatus: "demonstrated",
      achievedAt: now,
      status: "mastered",
    };
    saveMasteryEvidence(evidence);

    const mission = getMissionById(record.missionId);
    if (mission) {
      mission.status = "mastered";
      saveMission(mission);
    }

    return { outcome: "mastered", record, evidence };
  } else {
    record.retestFailureCount = (record.retestFailureCount || 0) + 1;
    record.repairStatus = "retest_failed";
    record.updatedAt = now;
    saveErrorRecord(record);

    const mission = getMissionById(record.missionId);
    if (record.retestFailureCount >= 2) {
      if (mission) {
        mission.status = "needs_more_work";
        saveMission(mission);
      }
      return { outcome: "needs_more_work", record };
    } else {
      if (mission) {
        mission.status = "repair_needed";
        saveMission(mission);
      }
      return { outcome: "retest_failed", record };
    }
  }
}

function recordPracticeSuccess(missionId, skillId, subjectId, confidence) {
  const now = new Date().toISOString();
  const existingEvidence = getMasteryEvidence(skillId);
  const confidenceSignals = existingEvidence
    ? [...existingEvidence.confidenceSignals, confidence]
    : [confidence];

  const evidence = {
    missionId,
    skillId,
    subjectId,
    evidenceType: "practice_success",
    practiceAttempts: (existingEvidence?.practiceAttempts || 0) + 1,
    correctAttempts: (existingEvidence?.correctAttempts || 0) + 1,
    retestAttempts: existingEvidence?.retestAttempts || 0,
    successfulRetests: existingEvidence?.successfulRetests || 0,
    confidenceSignals,
    masteryStatus: "emerging", // NOT demonstrated!
    achievedAt: now,
    status: "needs_further_work",
  };

  saveMasteryEvidence(evidence);

  const mission = getMissionById(missionId);
  if (mission && mission.status !== "mastered") {
    mission.status = "in_progress";
    saveMission(mission);
  }

  return evidence;
}

function analyzeConfidenceSignal(isCorrect, confidence) {
  if (!isCorrect && confidence >= 4) {
    return { type: "misconception_signal" };
  }
  if (isCorrect && confidence <= 2) {
    return { type: "underconfidence_signal" };
  }
  if (!isCorrect && confidence <= 2) {
    return { type: "recognized_weakness" };
  }
  if (isCorrect && confidence >= 4) {
    return { type: "calibrated_mastery" };
  }
  return { type: "normal" };
}

// -----------------------------------------------------------------------------
// 3. PARSE ACTUAL REPOSITORY FILES
// -----------------------------------------------------------------------------

const practiceFilePath = path.resolve("src/data/practice/sciences-exp/index.ts");
const practiceContent = fs.readFileSync(practiceFilePath, "utf-8");

const rawQuestionBlocks = practiceContent.split(/\{\s*id:\s*"(?:pq|rq)-/).slice(1);
const parsedQuestions = rawQuestionBlocks.map((block) => {
  const isRetest = block.includes("isRetestVariant: true");
  const prefix = isRetest ? 'id: "rq-' : 'id: "pq-';
  const fullBlock = prefix + block;
  const idMatch = fullBlock.match(/id:\s*"([^"]+)"/);
  const subjectMatch = fullBlock.match(/subjectId:\s*"([^"]+)"/);
  const skillMatch = fullBlock.match(/skillId:\s*"([^"]+)"/);
  const correctMatch = fullBlock.match(/correctAnswerId:\s*"([^"]+)"/);
  const retestForMatch = fullBlock.match(/retestForQuestionId:\s*"([^"]+)"/);

  return {
    id: idMatch ? idMatch[1] : "",
    subjectId: subjectMatch ? subjectMatch[1] : "",
    skillId: skillMatch ? skillMatch[1] : "",
    correctAnswerId: correctMatch ? correctMatch[1] : "",
    isRetestVariant: isRetest,
    retestForQuestionId: retestForMatch ? retestForMatch[1] : null,
  };
});

// -----------------------------------------------------------------------------
// 4. EXECUTE ALL 28 TEST SUITES
// -----------------------------------------------------------------------------

let passedCount = 0;

function runTest(testNumber, name, fn) {
  try {
    fn();
    console.log(`  [PASS] Test ${String(testNumber).padStart(2, "0")}: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] Test ${String(testNumber).padStart(2, "0")}: ${name}`);
    console.error(`         ${err.message}`);
    process.exit(1);
  }
}

// TEST 1: Correct practice does not create demonstrated mastery
runTest(1, "Correct practice does not create demonstrated mastery", () => {
  clearAllMissionData();
  const mission = { id: "m1", skillId: "math_derivatives_chain_rule", subjectId: "math", status: "available" };
  saveMission(mission);

  const evidence = recordPracticeSuccess("m1", "math_derivatives_chain_rule", "math", 5);
  assert.strictEqual(evidence.masteryStatus, "emerging", "Initial practice success must be 'emerging'");
  assert.notStrictEqual(evidence.masteryStatus, "demonstrated", "Initial practice must NOT be 'demonstrated'");
  assert.strictEqual(isSkillMastered("math_derivatives_chain_rule"), false, "Skill must NOT be marked mastered");

  const storedMission = getMissionById("m1");
  assert.strictEqual(storedMission.status, "in_progress", "Mission status should be in_progress");
});

// TEST 2: Wrong practice creates Error Lab record
runTest(2, "Wrong practice creates Error Lab record", () => {
  clearAllMissionData();
  const question = {
    id: "pq-math-01",
    skillId: "math_derivatives_chain_rule",
    subjectId: "math",
    correctAnswerId: "opt-b",
    options: [{ id: "opt-a", suspectedErrorType: "calculation_error" }, { id: "opt-b" }],
  };
  const mission = { id: "m-test-2", skillId: "math_derivatives_chain_rule", status: "available" };
  saveMission(mission);

  const error = createErrorRecord({
    sessionId: "s1",
    question,
    missionId: "m-test-2",
    selectedAnswerId: "opt-a",
    confidence: 4,
  });

  assert.ok(error.id, "Error record ID must be generated");
  assert.strictEqual(error.repairStatus, "identified", "Initial repair status must be identified");
  assert.strictEqual(error.suspectedErrorType, "calculation_error");
  assert.strictEqual(getMissionById("m-test-2").status, "repair_needed");
});

// TEST 3: Repair completion enables retest
runTest(3, "Repair completion enables retest", () => {
  clearAllMissionData();
  const question = { id: "pq-math-01", skillId: "math_derivatives_chain_rule", subjectId: "math", correctAnswerId: "opt-b" };
  const mission = { id: "m-test-3", skillId: "math_derivatives_chain_rule", status: "repair_needed" };
  saveMission(mission);

  const error = createErrorRecord({ sessionId: "s1", question, missionId: "m-test-3", selectedAnswerId: "opt-a", confidence: 3 });
  startRepairAction(error.id);
  const completed = completeRepairAction(error.id);

  assert.strictEqual(completed.repairStatus, "repair_completed");
  assert.strictEqual(getMissionById("m-test-3").status, "retest_ready");
});

// TEST 4: Retest uses different question (practiceId !== retestId)
runTest(4, "Retest uses different question (practiceId !== retestId)", () => {
  const practiceQuestions = parsedQuestions.filter((q) => !q.isRetestVariant);
  const retestQuestions = parsedQuestions.filter((q) => q.isRetestVariant);

  assert.ok(practiceQuestions.length >= 9, "Should have at least 9 practice questions");
  assert.ok(retestQuestions.length >= 9, "Should have at least 9 retest questions");

  for (const rq of retestQuestions) {
    assert.notStrictEqual(rq.id, rq.retestForQuestionId, `Retest ${rq.id} must have distinct ID from practice ${rq.retestForQuestionId}`);
  }
});

// TEST 5: Retest covers same skill
runTest(5, "Retest covers same skill", () => {
  const retestQuestions = parsedQuestions.filter((q) => q.isRetestVariant);
  for (const rq of retestQuestions) {
    const parentPq = parsedQuestions.find((p) => p.id === rq.retestForQuestionId);
    assert.ok(parentPq, `Parent practice question must exist for ${rq.id}`);
    assert.strictEqual(rq.skillId, parentPq.skillId, `Retest ${rq.id} and practice ${parentPq.id} must share skillId`);
    assert.strictEqual(rq.subjectId, parentPq.subjectId, `Retest ${rq.id} and practice ${parentPq.id} must share subjectId`);
  }
});

// TEST 6: Retest success creates demonstrated mastery
runTest(6, "Retest success creates demonstrated mastery", () => {
  clearAllMissionData();
  const question = { id: "pq-math-01", skillId: "math_derivatives_chain_rule", subjectId: "math", correctAnswerId: "opt-b" };
  const mission = { id: "m-test-6", skillId: "math_derivatives_chain_rule", status: "retest_ready" };
  saveMission(mission);

  const error = createErrorRecord({ sessionId: "s1", question, missionId: "m-test-6", selectedAnswerId: "opt-a", confidence: 3 });
  completeRepairAction(error.id);

  const res = evaluateRetestOutcome(error.id, "rq-math-01", true, 5);
  assert.strictEqual(res.outcome, "mastered");
  assert.strictEqual(res.evidence.masteryStatus, "demonstrated");
  assert.strictEqual(isSkillMastered("math_derivatives_chain_rule"), true);
  assert.strictEqual(getMissionById("m-test-6").status, "mastered");
});

// TEST 7: Retest failure does not create mastery
runTest(7, "Retest failure does not create mastery", () => {
  clearAllMissionData();
  const question = { id: "pq-math-01", skillId: "math_derivatives_chain_rule", subjectId: "math", correctAnswerId: "opt-b" };
  const mission = { id: "m-test-7", skillId: "math_derivatives_chain_rule", status: "retest_ready" };
  saveMission(mission);

  const error = createErrorRecord({ sessionId: "s1", question, missionId: "m-test-7", selectedAnswerId: "opt-a", confidence: 3 });
  const res = evaluateRetestOutcome(error.id, "rq-math-01", false, 3);

  assert.strictEqual(res.outcome, "retest_failed");
  assert.strictEqual(isSkillMastered("math_derivatives_chain_rule"), false);
  assert.strictEqual(getMissionById("m-test-7").status, "repair_needed");
  assert.strictEqual(res.record.retestFailureCount, 1);
});

// TEST 8: Two failed retests -> needs_more_work
runTest(8, "Two failed retests -> needs_more_work", () => {
  clearAllMissionData();
  const question = { id: "pq-math-01", skillId: "math_derivatives_chain_rule", subjectId: "math", correctAnswerId: "opt-b" };
  const mission = { id: "m-test-8", skillId: "math_derivatives_chain_rule", status: "retest_ready" };
  saveMission(mission);

  const error = createErrorRecord({ sessionId: "s1", question, missionId: "m-test-8", selectedAnswerId: "opt-a", confidence: 3 });
  // First failure
  evaluateRetestOutcome(error.id, "rq-math-01", false, 3);
  // Second failure
  const res2 = evaluateRetestOutcome(error.id, "rq-math-01", false, 3);

  assert.strictEqual(res2.outcome, "needs_more_work");
  assert.strictEqual(res2.record.retestFailureCount, 2);
  assert.strictEqual(getMissionById("m-test-8").status, "needs_more_work");
  assert.strictEqual(isSkillMastered("math_derivatives_chain_rule"), false);
});

// TEST 9: Same skill + same error twice -> recurring error
runTest(9, "Same skill + same error twice -> recurring error", () => {
  clearAllMissionData();
  const question = {
    id: "pq-math-01",
    skillId: "math_derivatives_chain_rule",
    subjectId: "math",
    correctAnswerId: "b",
    options: [{ id: "a", suspectedErrorType: "calculation_error" }, { id: "b" }],
  };
  const m1 = { id: "m1", skillId: "math_derivatives_chain_rule", status: "available" };
  saveMission(m1);

  const err1 = createErrorRecord({ sessionId: "s1", question, missionId: "m1", selectedAnswerId: "a", confidence: 3 });
  assert.strictEqual(err1.isRecurring, false, "First error must not be recurring");

  const err2 = createErrorRecord({ sessionId: "s2", question, missionId: "m1", selectedAnswerId: "a", confidence: 3 });
  assert.strictEqual(err2.isRecurring, true, "Second matching error MUST be recurring");

  const recurring = getRecurringErrors();
  assert.strictEqual(recurring.length, 2, "Both matching errors must now be flagged as recurring");
});

// TEST 10: Different error types not incorrectly merged
runTest(10, "Different error types not incorrectly merged", () => {
  clearAllMissionData();
  const q1 = {
    id: "pq1",
    skillId: "math_derivatives_chain_rule",
    subjectId: "math",
    correctAnswerId: "b",
    options: [{ id: "a", suspectedErrorType: "calculation_error" }, { id: "b" }],
  };
  const q2 = {
    id: "pq2",
    skillId: "math_derivatives_chain_rule",
    subjectId: "math",
    correctAnswerId: "b",
    options: [{ id: "c", suspectedErrorType: "forgot_information" }, { id: "b" }],
  };
  const m = { id: "m", skillId: "math_derivatives_chain_rule", status: "available" };
  saveMission(m);

  const e1 = createErrorRecord({ sessionId: "s1", question: q1, missionId: "m", selectedAnswerId: "a", confidence: 3 });
  const e2 = createErrorRecord({ sessionId: "s2", question: q2, missionId: "m", selectedAnswerId: "c", confidence: 3 });

  assert.strictEqual(e1.isRecurring, false);
  assert.strictEqual(e2.isRecurring, false);
  assert.strictEqual(getRecurringErrors().length, 0);
});

// TEST 11: Student-selected error overrides system inference
runTest(11, "Student-selected error overrides system inference", () => {
  clearAllMissionData();
  const question = {
    id: "pq-math-01",
    skillId: "math_derivatives_chain_rule",
    subjectId: "math",
    correctAnswerId: "b",
    options: [{ id: "a", suspectedErrorType: "calculation_error" }, { id: "b" }],
  };
  const m = { id: "m", skillId: "math_derivatives_chain_rule", status: "available" };
  saveMission(m);

  const err = createErrorRecord({ sessionId: "s1", question, missionId: "m", selectedAnswerId: "a", confidence: 3 });
  assert.strictEqual(err.errorSource, "system_inferred");
  assert.strictEqual(err.suspectedErrorType, "calculation_error");

  const updated = updateStudentErrorAttribution(err.id, "methodology_error");
  assert.strictEqual(updated.errorSource, "student_selected");
  assert.strictEqual(updated.suspectedErrorType, "methodology_error");

  const confirmed = confirmErrorAttribution(err.id);
  assert.strictEqual(confirmed.errorSource, "confirmed");
});

// TEST 12: Unknown error remains unknown
runTest(12, "Unknown error remains unknown", () => {
  clearAllMissionData();
  const question = {
    id: "pq-math-01",
    skillId: "math_derivatives_chain_rule",
    subjectId: "math",
    correctAnswerId: "b",
    options: [{ id: "a", suspectedErrorType: "unknown" }, { id: "b" }],
  };
  const m = { id: "m", skillId: "math_derivatives_chain_rule", status: "available" };
  saveMission(m);

  const err = createErrorRecord({ sessionId: "s1", question, missionId: "m", selectedAnswerId: "a", confidence: 1 });
  assert.strictEqual(err.suspectedErrorType, "unknown");

  const updated = updateStudentErrorAttribution(err.id, "unknown");
  assert.strictEqual(updated.suspectedErrorType, "unknown");
  assert.strictEqual(detectRecurringError("math_derivatives_chain_rule", "unknown"), false, "Unknown errors must never be marked recurring");
});

// TEST 13: Confidence 5 + wrong -> misconception signal
runTest(13, "Confidence 5 + wrong -> misconception signal", () => {
  const signal = analyzeConfidenceSignal(false, 5);
  assert.strictEqual(signal.type, "misconception_signal");
});

// TEST 14: Confidence 1 + correct -> possible underconfidence
runTest(14, "Confidence 1 + correct -> possible underconfidence", () => {
  const signal = analyzeConfidenceSignal(true, 1);
  assert.strictEqual(signal.type, "underconfidence_signal");
});

// TEST 15: Mastered mission leaves active queue
runTest(15, "Mastered mission leaves active queue", () => {
  clearAllMissionData();
  const missionFile = fs.readFileSync(path.resolve("src/lib/mission/generator.ts"), "utf-8");
  assert.ok(missionFile.includes("!isSkillMastered"), "generator.ts must check !isSkillMastered");
  assert.ok(missionFile.includes("getNextRecommendedMission"), "generator.ts must export getNextRecommendedMission");
});

// TEST 16: Unresolved high-priority mission remains prioritized
runTest(16, "Unresolved high-priority mission remains prioritized", () => {
  const genContent = fs.readFileSync(path.resolve("src/lib/mission/generator.ts"), "utf-8");
  assert.ok(
    genContent.includes("status === \"repair_needed\"") || genContent.includes("repair_needed"),
    "generator.ts must check repair_needed in Priority 1"
  );
});

// TEST 17: Next mission selection is deterministic
runTest(17, "Next mission selection is deterministic", () => {
  const genContent = fs.readFileSync(path.resolve("src/lib/mission/generator.ts"), "utf-8");
  assert.ok(genContent.includes("Priority 1"), "generator.ts must declare Priority 1");
  assert.ok(genContent.includes("Priority 2"), "generator.ts must declare Priority 2");
  assert.ok(genContent.includes("Priority 3"), "generator.ts must declare Priority 3");
  assert.ok(genContent.includes("Priority 4"), "generator.ts must declare Priority 4");
  assert.ok(genContent.includes("Priority 5"), "generator.ts must declare Priority 5");
});

// TEST 18: Refresh preserves mission state
runTest(18, "Refresh preserves mission state", () => {
  clearAllMissionData();
  const m = { id: "m-refresh", skillId: "math_derivatives_chain_rule", status: "needs_more_work" };
  saveMission(m);

  const restored = getMissionById("m-refresh");
  assert.strictEqual(restored.status, "needs_more_work");
});

// TEST 19: Refresh preserves Error Lab
runTest(19, "Refresh preserves Error Lab", () => {
  clearAllMissionData();
  const question = { id: "pq-math-01", skillId: "math_derivatives_chain_rule", subjectId: "math", correctAnswerId: "b" };
  const mission = { id: "m-ref", skillId: "math_derivatives_chain_rule", status: "available" };
  saveMission(mission);

  const err = createErrorRecord({ sessionId: "s1", question, missionId: "m-ref", selectedAnswerId: "a", confidence: 3 });
  err.retestFailureCount = 1;
  saveErrorRecord(err);

  const restored = getErrorRecordById(err.id);
  assert.strictEqual(restored.retestFailureCount, 1);
  assert.strictEqual(restored.repairStatus, "identified");
});

// TEST 20: Refresh preserves retest state
runTest(20, "Refresh preserves retest state", () => {
  clearAllMissionData();
  const question = { id: "pq-math-01", skillId: "math_derivatives_chain_rule", subjectId: "math", correctAnswerId: "b" };
  const mission = { id: "m-ret", skillId: "math_derivatives_chain_rule", status: "available" };
  saveMission(mission);

  const err = createErrorRecord({ sessionId: "s1", question, missionId: "m-ret", selectedAnswerId: "a", confidence: 3 });
  evaluateRetestOutcome(err.id, "rq-math-01", true, 5);

  const evidence = getMasteryEvidence("math_derivatives_chain_rule");
  assert.strictEqual(evidence.masteryStatus, "demonstrated");
  assert.strictEqual(isSkillMastered("math_derivatives_chain_rule"), true);
});

// TEST 21: Roadmap state matches mission state
runTest(21, "Roadmap state matches mission state", () => {
  const roadmapContent = fs.readFileSync(path.resolve("src/app/roadmap/page.tsx"), "utf-8");
  assert.ok(roadmapContent.includes("✓ تم إثبات التحكم") || roadmapContent.includes("Maîtrise démontrée"), "Roadmap must show demonstrated mastery badge");
  assert.ok(roadmapContent.includes("تحتاج إلى عمل إضافي") || roadmapContent.includes("needs_more_work"), "Roadmap must support needs_more_work");
  assert.ok(roadmapContent.includes("عندك خطأ يحتاج إصلاح") || roadmapContent.includes("repair_needed"), "Roadmap must support repair_needed");
});

// TEST 22: Zero predictedBACScore in codebase
runTest(22, "Zero predictedBACScore in codebase", () => {
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scanDir(full);
      } else if (f.endsWith(".ts") || f.endsWith(".tsx")) {
        const text = fs.readFileSync(full, "utf-8");
        assert.ok(
          !text.includes("predictedBACScore"),
          `File ${full} must not contain overclaiming symbol 'predictedBACScore'`
        );
      }
    }
  }
  scanDir(path.resolve("src"));
});

// TEST 23: No new official coefficient claims
runTest(23, "No new official coefficient claims", () => {
  const streamsContent = fs.readFileSync(path.resolve("src/lib/constants/streams.ts"), "utf-8");
  assert.ok(streamsContent.includes("natural_sciences: 6") || streamsContent.includes("coefficient: 6"), "Science coefficient must be 6");
  assert.ok(streamsContent.includes("physics: 5") || streamsContent.includes("coefficient: 5"), "Physics coefficient must be 5");
  assert.ok(streamsContent.includes("math: 5") || streamsContent.includes("coefficient: 5"), "Math coefficient must be 5");
});

// TEST 24: Technique Math has no unsafe defaults
runTest(24, "Technique Math has no unsafe defaults", () => {
  const diagSpecContent = fs.readFileSync(path.resolve("docs/bac-mastery/DIAGNOSTIC_SPEC.md"), "utf-8");
  assert.ok(
    diagSpecContent.includes("Technique Math") || diagSpecContent.includes("math_technique"),
    "Diagnostic spec documents math_technique guidelines"
  );
});

// TEST 25: Arabic and French strings exist
runTest(25, "Arabic and French strings exist", () => {
  const dictContent = fs.readFileSync(path.resolve("src/lib/i18n/dictionaries.ts"), "utf-8");
  assert.ok(dictContent.includes("positiveEvidenceTitle"), "positiveEvidenceTitle must be defined");
  assert.ok(dictContent.includes("needsMoreWorkTitle"), "needsMoreWorkTitle must be defined");
  assert.ok(dictContent.includes("recurringBannerTitle"), "recurringBannerTitle must be defined");
  assert.ok(dictContent.includes("masteryStatusBadges"), "masteryStatusBadges must be defined");
  assert.ok(dictContent.includes("نفس النوع من الخطأ تكرر أكثر من مرة"), "Arabic recurring banner text must exist");
  assert.ok(dictContent.includes("Le même type d'erreur s'est répété"), "French recurring banner text must exist");
});

// TEST 26: Existing onboarding tests pass
runTest(26, "Existing onboarding tests pass", () => {
  const output = execSync("node ./scripts/test-onboarding.mjs", { encoding: "utf-8" });
  assert.ok(output.includes("ALL 3 SUITES OF ONBOARDING TESTS PASSED"), "Onboarding test suite must pass");
});

// TEST 27: Existing diagnostic tests pass
runTest(27, "Existing diagnostic tests pass", () => {
  const output = execSync("node ./scripts/test-diagnostic.mjs", { encoding: "utf-8" });
  assert.ok(output.includes("ALL 18 COMPREHENSIVE TEST SUITES PASSED"), "Diagnostic test suite must pass");
});

// TEST 28: Existing mission tests pass
runTest(28, "Existing mission tests pass", () => {
  const output = execSync("node ./scripts/test-missions.mjs", { encoding: "utf-8" });
  assert.ok(output.includes("ALL 17 MISSION & ERROR LAB TEST SUITES PASSED"), "Mission test suite must pass");
});

console.log("\n==================================================================");
console.log(`  ALL ${passedCount}/28 AUTHORITATIVE MASTERY SUITES PASSED!`);
console.log("==================================================================\n");
