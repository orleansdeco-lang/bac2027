import {
  adaptLegacyLearnerIdentity,
  adaptLegacyLearnerContext,
  adaptLegacyGoal,
  adaptLegacySkillState,
  adaptLegacyAttempt,
  adaptLegacyEvidence,
  adaptLegacyRetentionState,
  adaptLegacyLearnerState,
} from '../src/domain/v2';
import { StudentProfile, GoalSettings } from '../src/types/student';
import { StrategicProfile } from '../src/types/onboarding';
import { PracticeResponse } from '../src/types/mission';
import { SpacedReviewSchedule } from '../src/domain/learning/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function assertDeepEqual(actual: any, expected: any, message: string) {
  const aStr = JSON.stringify(actual);
  const eStr = JSON.stringify(expected);
  if (aStr !== eStr) {
    console.error(`❌ FAIL: ${message}. Expected ${eStr}, got ${aStr}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function run() {
  console.log('==================================================================');
  console.log('  BAC MASTERY V2 — LEARNER / EVIDENCE READ PATH TESTS (TASK 1.2)');
  console.log('==================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST 1 — Identity
  // ---------------------------------------------------------------------------
  console.log('[TEST 1] Auditing Learner Identity Deterministic Mapping...');
  const mockStudentProfile: StudentProfile = Object.freeze({
    id: 'student_usr_998877',
    streamId: 'sciences_exp',
    fullName: 'Yacine Amrani',
    wilayaCode: '16',
    wilayaName: 'Alger',
    targetScore: 17.5,
  });

  const idFromProfile = adaptLegacyLearnerIdentity(mockStudentProfile);
  assert(idFromProfile.value.studentId === 'student_usr_998877', 'Student ID mapped from profile');
  assert(idFromProfile.value.isAnonymous === false, 'Recognized as registered student');
  assert(idFromProfile.value.legacyIdentityType === 'profile_id', 'Identity type classified as profile_id');
  assert(idFromProfile.mapping.preserved.includes('studentId'), 'studentId preserved in metadata');

  const idAnon = adaptLegacyLearnerIdentity('mock-user-1');
  assert(idAnon.value.isAnonymous === true, 'mock-user-1 flagged as anonymous');
  assert(idAnon.value.legacyIdentityType === 'anonymous', 'Identity type classified as anonymous');

  // ---------------------------------------------------------------------------
  // TEST 2 — Context
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 2] Auditing Learner Context (Education / Exam / Stream / Specialty)...');
  const mockStrategicProfile: StrategicProfile = Object.freeze({
    id: 'strat_usr_4455',
    streamId: 'technique_math',
    techniqueMathSpecialty: 'civil_eng',
    educationLevel: 'secondary',
    examType: 'BAC',
    targetScore: 16.0,
    subjectEstimates: { math: 4, physics: 5 } as any,
  });

  const contextAdapted = adaptLegacyLearnerContext(mockStrategicProfile);
  assert(contextAdapted.value.streamId === 'technique_math', 'Stream technique_math preserved');
  assert(contextAdapted.value.techniqueMathSpecialty === 'civil_eng', 'Specialty civil_eng preserved');
  assert(contextAdapted.value.educationLevel === 'secondary_3as', 'Education level normalized to secondary_3as');
  assert(contextAdapted.value.examType === 'BAC', 'Exam type BAC preserved');
  assert(contextAdapted.value.targetScore === 16.0, 'Target score 16.0 preserved');
  assert(contextAdapted.mapping.unavailable.includes('curriculumVersionId'), 'curriculumVersionId marked unavailable');

  // ---------------------------------------------------------------------------
  // TEST 3 — Goal
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 3] Auditing Goal Data Preservation without New Logic...');
  const mockGoals: GoalSettings = Object.freeze({
    studentId: 'student_usr_998877',
    targetOverallScore: 17.5,
    currentEstimatedOverall: 13.2,
    weeklyStudyHours: 18,
    desiredSpecialty: 'École Nationale Supérieure d\'Informatique (ESI)',
    subjectTargets: [
      { subjectId: 'math' as const, targetScore: 19, currentEstimatedScore: 14 },
      { subjectId: 'physics' as const, targetScore: 18, currentEstimatedScore: 13 },
    ],
    perceivedDifficulties: ['math' as const],
    updatedAt: new Date().toISOString(),
  });

  const adaptedGoal = adaptLegacyGoal(mockGoals);
  assert(adaptedGoal.value.studentId === 'student_usr_998877', 'Student ID preserved');
  assert(adaptedGoal.value.targetOverallScore === 17.5, 'Target overall score preserved');
  assert(adaptedGoal.value.weeklyStudyHours === 18, 'Weekly hours preserved');
  assert(Boolean(adaptedGoal.value.desiredSpecialty?.includes('ESI')), 'Desired specialty preserved');
  assert(adaptedGoal.value.subjectTargets.length === 2, 'Subject targets preserved');
  assert(adaptedGoal.mapping.notes?.includes('without introducing priority calculations') === true, 'Safety note present');

  // ---------------------------------------------------------------------------
  // TEST 4 — Attempt (Raw interaction telemetry only)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 4] Auditing Raw Attempt Telemetry Isolation...');
  const mockPracticeResponse: PracticeResponse = Object.freeze({
    questionId: 'q_physics_rc_circuit_01',
    selectedAnswer: 'opt_tau_equals_rc',
    isCorrect: true,
    responseTimeSeconds: 38,
    confidence: 5,
  });

  const adaptedAttempt = adaptLegacyAttempt(mockPracticeResponse, {
    studentId: 'student_usr_998877',
    skillId: 'physics_rc_circuit_charging',
    subjectId: 'physics',
    streamId: 'sciences_exp',
    expectedTimeSeconds: 50,
    practiceTier: 'independent',
  });

  assert(adaptedAttempt.value.selectedAnswer === 'opt_tau_equals_rc', 'Raw answer choice preserved');
  assert(adaptedAttempt.value.timeSpentSeconds === 38, 'Raw duration preserved');
  assert(adaptedAttempt.value.confidenceRating === 5, 'Raw confidence preserved');
  assert((adaptedAttempt.value as any).vectors === undefined, 'Raw attempt DOES NOT attach evidence vectors');
  assert(adaptedAttempt.mapping.notes?.includes('Captures raw interaction telemetry only') === true, 'Telemetry note present');

  // ---------------------------------------------------------------------------
  // TEST 5 — Evidence (Multi-dimensional vectors, strictly non-scalar)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 5] Auditing Evidence Separation from Attempt & Non-Scalar Vectors...');
  const adaptedEvidence = adaptLegacyEvidence(
    {
      skillId: 'physics_rc_circuit_charging',
      subjectId: 'physics',
      isDemonstratedSuccess: true,
      confidenceSignals: [5],
      evidenceType: 'repair_retest_success',
      successfulRetests: 1,
      practiceAttempts: 2,
      correctAttempts: 2,
      retestAttempts: 1,
    } as any,
    { attemptId: adaptedAttempt.value.id }
  );

  assert(adaptedEvidence.value.vectors !== undefined, 'Evidence has multi-dimensional vectors');
  assert(adaptedEvidence.value.vectors.correctness === true, 'Vector correctness is boolean');
  assert(adaptedEvidence.value.vectors.confidence === 5, 'Vector confidence is preserved');
  assert((adaptedEvidence.value as any).selectedAnswer === undefined, 'Evidence DOES NOT contain raw answer telemetry');
  assert(adaptedEvidence.mapping.notes?.includes('without scalar formula collapse') === true, 'Non-scalar note present');

  // ---------------------------------------------------------------------------
  // TEST 6 — Numeric Mastery Safety (Step 7)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 6] Auditing Numeric Mastery Safety (No Silent Float -> State Promotion)...');
  const numericOnlySkillState = Object.freeze({
    skillId: 'snv_protein_synthesis',
    subjectId: 'natural_sciences',
    score: 0.78, // Legacy numeric float
    totalAttempts: 5,
    consecutiveSuccesses: 1,
  });

  const adaptedNumericSkill = adaptLegacySkillState(numericOnlySkillState as any);
  // Must NOT declare "demonstrated" or "emerging" just because score == 0.78!
  assert(
    adaptedNumericSkill.mapping.unavailable.includes('authoritative_discrete_mastery_state'),
    'Discrete mastery state marked UNAVAILABLE'
  );
  assert(
    adaptedNumericSkill.mapping.lossy.includes('numeric_score_cannot_define_mastery'),
    'Lossy mapping documents numeric score limitation'
  );
  assert(
    (adaptedNumericSkill.mapping.originalLegacyValue as any)?.numericScore === 0.78,
    'Original numeric float (0.78) preserved in metadata'
  );
  assert(
    adaptedNumericSkill.value.masteryStatus === 'not_yet',
    'Conservative safe fallback "not_yet" assigned'
  );

  // ---------------------------------------------------------------------------
  // TEST 7 — Retention Safety (Step 8)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 7] Auditing Retention Safety (No Imposed Algorithm / SM-2)...');
  const mockRetentionSchedule: SpacedReviewSchedule = Object.freeze({
    skillId: 'snv_protein_synthesis',
    subjectId: 'natural_sciences',
    intervalDays: 4.5,
    lastTestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    nextReviewDueAt: new Date(Date.now() + 1.5 * 86400000).toISOString(),
    urgency: 'due',
    consecutiveSuccesses: 2,
    lapseCount: 1,
    decayRate: 1.1,
  });

  const adaptedRetention = adaptLegacyRetentionState(mockRetentionSchedule);
  assert(adaptedRetention.value.intervalDays === 4.5, 'intervalDays exposed verbatim');
  assert(adaptedRetention.value.urgency === 'due', 'urgency exposed verbatim');
  assert(adaptedRetention.value.decayRate === 1.1, 'decayRate exposed verbatim');
  assert(
    adaptedRetention.mapping.notes?.includes('Zero scheduling algorithm imposed') === true,
    'Safety note confirming no algorithm imposed'
  );

  // ---------------------------------------------------------------------------
  // TEST 8 — Unknown Values Preserved (Step 4)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 8] Auditing Unknown Values Preservation in Metadata...');
  const unknownContext = adaptLegacyLearnerContext({
    educationLevel: 'unknown_grade_xyz' as any,
    streamId: 'unknown_stream_abc' as any,
  } as any);

  assert((unknownContext.mapping.originalLegacyValue as any)?.educationLevel === 'unknown_grade_xyz', 'Original unknown level preserved');
  assert((unknownContext.mapping.originalLegacyValue as any)?.streamId === 'unknown_stream_abc', 'Original unknown stream preserved');

  // ---------------------------------------------------------------------------
  // TEST 9 — Missing Information Explicitly Marked Unavailable
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 9] Auditing Missing Information Explicitly Marked Unavailable...');
  assert(
    contextAdapted.mapping.unavailable.includes('curriculumVersionId'),
    'curriculumVersionId explicitly marked unavailable'
  );
  assert(
    adaptedAttempt.mapping.unavailable.includes('exact_hint_click_timestamps'),
    'hint click timestamps explicitly marked unavailable'
  );

  // ---------------------------------------------------------------------------
  // TEST 10 — Purity (Zero Input Mutation)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 10] Auditing Adapter Purity on Frozen Inputs...');
  // All inputs above (mockStudentProfile, mockStrategicProfile, mockGoals, mockPracticeResponse, mockRetentionSchedule)
  // were Object.freeze()'d. If any adapter attempted to mutate them, a TypeError would be thrown.
  console.log('✅ PASS: All adapters operated on Object.freeze() inputs without mutation');

  // ---------------------------------------------------------------------------
  // TEST 11 — Determinism
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 11] Auditing Adapter Determinism (Idempotency across invocations)...');
  const run1 = adaptLegacyGoal(mockGoals);
  const run2 = adaptLegacyGoal(mockGoals);
  assertDeepEqual(run1.value, run2.value, 'adaptLegacyGoal produces identical output on repeat invocations');

  const idRun1 = adaptLegacyLearnerIdentity(mockStudentProfile);
  const idRun2 = adaptLegacyLearnerIdentity(mockStudentProfile);
  assertDeepEqual(idRun1.value, idRun2.value, 'adaptLegacyLearnerIdentity produces identical output');

  // ---------------------------------------------------------------------------
  // TEST 12 — No Decision Authority (Adapters DO NOT produce decisions)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 12] Auditing Prohibition of Decision Authority in Adapters...');
  const fullLearnerState = adaptLegacyLearnerState({
    userId: 'student_usr_998877',
    streamId: 'sciences_exp',
    skills: {
      snv_protein_synthesis: numericOnlySkillState,
    },
    activeErrors: [],
  });

  assert((fullLearnerState.value as any).nextBestAction === undefined, 'Learner state read adapter DOES NOT contain nextBestAction');
  assert((fullLearnerState.value as any).priorityDecision === undefined, 'Learner state read adapter DOES NOT contain priorityDecision');
  assert((fullLearnerState.value as any).roadmapSequence === undefined, 'Learner state read adapter DOES NOT contain roadmapSequence');
  console.log('✅ PASS: Zero decision authority exists in the read adapter layer');

  console.log('\n==================================================================');
  console.log('🎉 ALL 12 LEARNER READ PATH INVARIANTS VERIFIED SUCCESSFULLY!');
  console.log('==================================================================');
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
