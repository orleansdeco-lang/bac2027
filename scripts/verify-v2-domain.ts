import {
  // Mastery
  CANONICAL_MASTERY_STATES,
  isCanonicalMasteryStatus,
  assertValidMasteryStatus,
  mapLegacyMasteryStatus,

  // Errors & Retest
  CANONICAL_ERROR_TAXONOMY,
  isCanonicalErrorType,
  assertValidErrorType,
  mapLegacyErrorCode,
  MAX_ALLOWED_REPAIR_CYCLES,

  // Mission & Duration
  CANONICAL_MISSION_TYPES,
  MISSION_DURATION_CLASSES,
  DURATION_CLASS_BOUNDS,
  classifyDurationMinutes,
  validateDurationClassMinutes,
  mapLegacyMissionType,

  // Assessment & Diagnostic Layers
  DIAGNOSTIC_LAYERS,
  DIAGNOSTIC_LAYER_METADATA,
  isDiagnosticLayer,

  // Evidence
  assertNonScalarEvidence,
  MultiDimensionalEvidenceVectors,
  CognitiveEvidence,

  // Retention
  RetentionEvidenceVectors,
  RetentionScheduler,
  RetentionSchedule,

  // Decision & Priority
  PRIORITY_HIERARCHY_GATES,
  PriorityReasonCode,
  mapLegacyReasonCode,

  // State Authority
  assertAuthoritativeStateBoundary,

  // IDs
  toSkillId,
  toStudentId,
  toQuestionId,
  toEvidenceId,
  toAttemptId,
} from '../src/domain/v2';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function assertThrows(fn: () => void, expectedSnippet: string, message: string) {
  try {
    fn();
    console.error(`❌ FAIL: Expected function to throw, but it did not. (${message})`);
    process.exit(1);
  } catch (err: any) {
    if (expectedSnippet && !err.message.includes(expectedSnippet)) {
      console.error(`❌ FAIL: Threw error but missing snippet "${expectedSnippet}". Got: "${err.message}". (${message})`);
      process.exit(1);
    }
    console.log(`✅ PASS: ${message}`);
  }
}

async function run() {
  console.log('==================================================================');
  console.log('  BAC MASTERY V2 — CANONICAL DOMAIN LAYER TEST SUITE (TASK 1.0)');
  console.log('==================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST 1: Mastery Model Invariants
  // ---------------------------------------------------------------------------
  console.log('[TEST 1] Auditing Canonical Mastery States & Non-Scalar Invariant...');
  assert(CANONICAL_MASTERY_STATES.length === 4, 'Exactly 4 authoritative mastery states defined');
  assert(isCanonicalMasteryStatus('not_yet'), 'State "not_yet" is recognized');
  assert(isCanonicalMasteryStatus('emerging'), 'State "emerging" is recognized');
  assert(isCanonicalMasteryStatus('demonstrated'), 'State "demonstrated" is recognized');
  assert(isCanonicalMasteryStatus('review_due'), 'State "review_due" is recognized');

  // Must reject non-canonical strings
  assert(!isCanonicalMasteryStatus('mastered'), '"mastered" is not an authoritative state');
  assert(!isCanonicalMasteryStatus('needs_more_work'), '"needs_more_work" is not an authoritative state');

  // Must reject numeric values as mastery states
  assertThrows(
    () => assertValidMasteryStatus(0.73 as any),
    'Numeric value (0.73) rejected',
    'Arbitrary numeric score (0.73) rejected as mastery state'
  );
  assertThrows(
    () => assertValidMasteryStatus(1.0 as any),
    'Numeric value (1) rejected',
    'Perfect numeric score (1.0) rejected as mastery state'
  );

  // Adapter testing
  assert(mapLegacyMasteryStatus('mastered') === 'demonstrated', 'Legacy "mastered" maps to "demonstrated"');
  assert(mapLegacyMasteryStatus('needs_more_work') === 'not_yet', 'Legacy "needs_more_work" maps to "not_yet"');
  assert(mapLegacyMasteryStatus('overdue') === 'review_due', 'Legacy "overdue" maps to "review_due"');
  assert(mapLegacyMasteryStatus('in_progress') === 'emerging', 'Legacy "in_progress" maps to "emerging"');

  // ---------------------------------------------------------------------------
  // TEST 2: Error Taxonomy & Retest Policy
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 2] Auditing 10 Canonical Error Types & 2-Cycle Repair Invariant...');
  assert(CANONICAL_ERROR_TAXONOMY.length === 10, 'Exactly 10 canonical error taxonomy types defined');
  for (const type of CANONICAL_ERROR_TAXONOMY) {
    assert(isCanonicalErrorType(type), `Canonical error type recognized: ${type}`);
  }

  assertThrows(
    () => assertValidErrorType('concept_confusion'),
    'Invalid error taxonomy type: "concept_confusion"',
    'Legacy error code rejected by strict validator'
  );

  // Adapter testing: Legacy codes map cleanly
  assert(mapLegacyErrorCode('concept_confusion') === 'misunderstood_concept', 'concept_confusion -> misunderstood_concept');
  assert(mapLegacyErrorCode('calculation_slip') === 'calculation_error', 'calculation_slip -> calculation_error');
  assert(mapLegacyErrorCode('keyword_missing') === 'methodology_error', 'keyword_missing -> methodology_error');
  assert(mapLegacyErrorCode('methodology_flaw') === 'methodology_error', 'methodology_flaw -> methodology_error');
  assert(mapLegacyErrorCode('time_pressure') === 'time_management', 'time_pressure -> time_management');
  assert(mapLegacyErrorCode('reading_comprehension') === 'misread_question', 'reading_comprehension -> misread_question');
  assert(mapLegacyErrorCode('did_not_understand') === 'misunderstood_concept', 'did_not_understand -> misunderstood_concept');
  assert(mapLegacyErrorCode('method_unknown') === 'methodology_error', 'method_unknown -> methodology_error');
  assert(mapLegacyErrorCode('unknown_arbitrary_string') === 'unknown', 'Unknown string maps safely to "unknown"');

  // Invariant: Max 2 repair cycles
  assert(MAX_ALLOWED_REPAIR_CYCLES === 2, 'Max allowed repair cycles is strictly 2');

  // ---------------------------------------------------------------------------
  // TEST 3: Mission Duration Classes
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 3] Auditing 4 Mission Duration Classes & Duration Boundaries...');
  assert(MISSION_DURATION_CLASSES.length === 4, 'Exactly 4 duration classes defined');
  assert(DURATION_CLASS_BOUNDS.MICRO.min === 5 && DURATION_CLASS_BOUNDS.MICRO.max === 10, 'MICRO is 5–10 min');
  assert(DURATION_CLASS_BOUNDS.SHORT.min === 10 && DURATION_CLASS_BOUNDS.SHORT.max === 20, 'SHORT is 10–20 min');
  assert(DURATION_CLASS_BOUNDS.STANDARD.min === 20 && DURATION_CLASS_BOUNDS.STANDARD.max === 35, 'STANDARD is 20–35 min');
  assert(DURATION_CLASS_BOUNDS.DEEP.min === 35 && DURATION_CLASS_BOUNDS.DEEP.max === 60, 'DEEP is 35–60 min');

  // Classification verification
  assert(classifyDurationMinutes(7) === 'MICRO', '7 minutes classified as MICRO');
  assert(classifyDurationMinutes(15) === 'SHORT', '15 minutes classified as SHORT');
  assert(classifyDurationMinutes(25) === 'STANDARD', '25 minutes classified as STANDARD');
  assert(classifyDurationMinutes(50) === 'DEEP', '50 minutes classified as DEEP');

  // Duration validation
  assert(validateDurationClassMinutes('MICRO', 8) === true, '8 min valid for MICRO');
  assert(validateDurationClassMinutes('MICRO', 15) === false, '15 min invalid for MICRO');
  assert(validateDurationClassMinutes('STANDARD', 25) === true, '25 min valid for STANDARD');
  assert(validateDurationClassMinutes('STANDARD', 10) === false, '10 min invalid for STANDARD');

  // ---------------------------------------------------------------------------
  // TEST 4: Diagnostic Layers L0–L5
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 4] Auditing Diagnostic Layers L0 to L5 Representation...');
  assert(DIAGNOSTIC_LAYERS.length === 6, 'Exactly 6 diagnostic layers defined');
  assert(isDiagnosticLayer('L0'), 'L0 recognized');
  assert(isDiagnosticLayer('L1'), 'L1 recognized');
  assert(isDiagnosticLayer('L2'), 'L2 recognized');
  assert(isDiagnosticLayer('L3'), 'L3 recognized');
  assert(isDiagnosticLayer('L4'), 'L4 recognized');
  assert(isDiagnosticLayer('L5'), 'L5 recognized');
  assert(!isDiagnosticLayer('L6'), 'L6 rejected');
  assert(!isDiagnosticLayer('quiz'), '"quiz" rejected');

  assert(Boolean(DIAGNOSTIC_LAYER_METADATA.L0.purpose), 'L0 has routing layer metadata');
  assert(Boolean(DIAGNOSTIC_LAYER_METADATA.L3.purpose), 'L3 has prerequisite probe metadata');
  assert(Boolean(DIAGNOSTIC_LAYER_METADATA.L5.purpose), 'L5 has transfer probe metadata');

  // ---------------------------------------------------------------------------
  // TEST 5: Epistemic Evidence Non-Scalar Model
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 5] Auditing Non-Scalar Evidence Vectors & Separation from Attempt...');
  const mockVectors: MultiDimensionalEvidenceVectors = {
    correctness: true,
    confidence: 4,
    responseSpeedRatio: 0.95,
    hintsUsedCount: 0,
    practiceTier: 'independent',
    confidenceAlignment: 'well_calibrated',
    evidenceStrength: 'strong',
  };

  const validEvidence: CognitiveEvidence = {
    id: toEvidenceId('ev_test_001'),
    attemptId: toAttemptId('att_test_001'),
    skillId: toSkillId('math_derivatives_chain_rule'),
    subjectId: 'math',
    source: 'practice',
    isDemonstratedSuccess: true,
    vectors: mockVectors,
    isRecurringLapse: false,
    derivedAt: new Date().toISOString(),
  };

  assertNonScalarEvidence(validEvidence);
  console.log('✅ PASS: Structured multi-dimensional evidence validated');

  assertThrows(
    () => assertNonScalarEvidence(0.85 as any),
    'Evidence must be a structured CognitiveEvidence object',
    'Scalar float (0.85) rejected as evidence'
  );

  // ---------------------------------------------------------------------------
  // TEST 6: Retention Model (6 Frozen Vectors & Pluggable Scheduler)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 6] Auditing 6 Frozen Retention Vectors & Replaceable Scheduler...');
  const mockRetentionEvidence: RetentionEvidenceVectors = {
    correctness: true,
    confidence: 5,
    responseSpeedRatio: 0.8,
    lapseHistory: 0,
    decayFactor: 1.0,
    daysElapsed: 3,
  };

  assert(mockRetentionEvidence.correctness === true, 'Dimension 1: correctness present');
  assert(mockRetentionEvidence.confidence === 5, 'Dimension 2: confidence present');
  assert(mockRetentionEvidence.responseSpeedRatio === 0.8, 'Dimension 3: responseSpeedRatio present');
  assert(mockRetentionEvidence.lapseHistory === 0, 'Dimension 4: lapseHistory present');
  assert(mockRetentionEvidence.decayFactor === 1.0, 'Dimension 5: decayFactor present');
  assert(mockRetentionEvidence.daysElapsed === 3, 'Dimension 6: daysElapsed present');

  // Test pluggable scheduler interface without SM-2 dependency
  const mockCustomScheduler: RetentionScheduler = {
    name: 'pilot-empirical-v1',
    version: '1.0.0',
    evaluateUrgency(schedule, refDate) {
      return { urgency: 'fresh', isDue: false, overdueDays: 0 };
    },
    updateSchedule(current, evidence) {
      return {
        ...current,
        intervalDays: evidence.correctness ? current.intervalDays * 2 : 1.0,
        consecutiveSuccesses: evidence.correctness ? current.consecutiveSuccesses + 1 : 0,
      };
    },
  };

  assert(mockCustomScheduler.name === 'pilot-empirical-v1', 'Custom pluggable scheduler satisfied interface cleanly');

  // ---------------------------------------------------------------------------
  // TEST 7: Decision Engine Hierarchy & "Weakest Skill != Highest Priority"
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 7] Auditing Priority Hierarchy: "Weakest Skill != Highest Priority"...');
  assert(PRIORITY_HIERARCHY_GATES.continuation_retest.isHardSafetyGate === true, 'Gate 1 (Retest) is a hard safety gate');
  assert(PRIORITY_HIERARCHY_GATES.continuation_repair.isHardSafetyGate === true, 'Gate 2 (Repair) is a hard safety gate');
  assert(PRIORITY_HIERARCHY_GATES.critical_retention_overdue.isHardSafetyGate === true, 'Gate 3 (Retention) is a hard safety gate');
  assert(PRIORITY_HIERARCHY_GATES.unmastered_prerequisite.isHardSafetyGate === true, 'Gate 4 (Prerequisite) is a hard safety gate');

  // Prove that a critical retention review (Rank 3) precedes a weak curriculum skill (Rank 7)
  const retentionRank = PRIORITY_HIERARCHY_GATES.critical_retention_overdue.priorityRank;
  const progressionRank = PRIORITY_HIERARCHY_GATES.active_subject_progression.priorityRank;
  assert(retentionRank < progressionRank, `Retention review (Rank ${retentionRank}) precedes progression (Rank ${progressionRank})`);

  // Prove that prerequisite gap (Rank 4) precedes downstream advancement
  const prereqRank = PRIORITY_HIERARCHY_GATES.unmastered_prerequisite.priorityRank;
  assert(prereqRank < progressionRank, `Prerequisite fix (Rank ${prereqRank}) precedes progression (Rank ${progressionRank})`);

  // ---------------------------------------------------------------------------
  // TEST 8: State Authority Boundaries
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 8] Auditing State Authority Boundary Guards...');
  assertThrows(
    () => assertAuthoritativeStateBoundary('react_component'),
    'Mutation denied: Source "react_component"',
    'React component denied authority to mutate learner state'
  );
  assertThrows(
    () => assertAuthoritativeStateBoundary('ui_client'),
    'Mutation denied: Source "ui_client"',
    'UI Client denied authority to mutate learner state'
  );
  assertThrows(
    () => assertAuthoritativeStateBoundary('ai_assistant'),
    'Mutation denied: Source "ai_assistant"',
    'AI Assistant denied authority to mutate learner state'
  );

  // Authorized source passes without throwing
  assertAuthoritativeStateBoundary('evidence_engine');
  console.log('✅ PASS: Authorized backend engine source allowed');

  console.log('\n==================================================================');
  console.log('🎉 ALL V2 DOMAIN CONTRACT INVARIANTS VERIFIED SUCCESSFULLY!');
  console.log('==================================================================');
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
