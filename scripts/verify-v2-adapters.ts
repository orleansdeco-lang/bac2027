import {
  adaptLegacyEducationLevel,
  adaptLegacyExamType,
  adaptLegacyMasteryStatus,
  assertNumericNotMastery,
  adaptLegacyErrorCode,
  adaptLegacyMissionDuration,
  adaptLegacyMissionType,
  adaptLegacyDiagnosticQuestion,
  adaptPracticeResponseToRawAttempt,
  deriveCognitiveEvidenceFromAttempt,
} from '../src/domain/v2';
import { DiagnosticQuestion } from '../src/types/diagnostic';
import { PracticeResponse } from '../src/types/mission';

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
  console.log('  BAC MASTERY V2 — READ-ONLY ADAPTER INTEGRATION TESTS (TASK 1.1)');
  console.log('==================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST 1: Education Adapters & Determinism
  // ---------------------------------------------------------------------------
  console.log('[TEST 1] Auditing Education Adapters & Determinism...');
  const ed3as = adaptLegacyEducationLevel('secondary');
  assert(ed3as.value === 'secondary_3as', 'Legacy "secondary" maps to "secondary_3as"');
  assert(ed3as.mapping.isKnown === true, 'Mapping is known');

  const ed2as = adaptLegacyEducationLevel('2as');
  assert(ed2as.value === 'secondary_2as', '"2as" maps to "secondary_2as"');

  const edUnknown = adaptLegacyEducationLevel('middle_school_unknown');
  assert(edUnknown.value === 'secondary_3as', 'Unknown level falls back safely to "secondary_3as"');
  assert(edUnknown.mapping.isKnown === false, 'Unknown level marked isKnown: false');
  assert(edUnknown.mapping.originalLegacyValue === 'middle_school_unknown', 'Original legacy value preserved');

  const examBac = adaptLegacyExamType('bac');
  assert(examBac.value === 'BAC', 'Case-insensitive "bac" maps to "BAC"');
  assert(examBac.mapping.isKnown === true, 'BAC mapping is known');

  const examUnknown = adaptLegacyExamType('SAT');
  assert(examUnknown.value === 'BAC', 'Unknown exam falls back safely to "BAC"');
  assert(examUnknown.mapping.isKnown === false, 'Unknown exam marked isKnown: false');
  assert(examUnknown.mapping.originalLegacyValue === 'SAT', 'Original legacy exam preserved');

  // ---------------------------------------------------------------------------
  // TEST 2: Mastery Adapter & "needs_more_work" Guardrail
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 2] Auditing Mastery Adapter & Compatibility Guardrails...');
  const mDemonstrated = adaptLegacyMasteryStatus('demonstrated');
  assert(mDemonstrated.value === 'demonstrated', 'demonstrated maps exactly');
  assert(mDemonstrated.mapping.isKnown === true, 'demonstrated is known');

  const mMastered = adaptLegacyMasteryStatus('mastered');
  assert(mMastered.value === 'demonstrated', 'Legacy "mastered" alias maps to "demonstrated"');

  // Task 5 Guardrail on needs_more_work
  const mNeedsWork = adaptLegacyMasteryStatus('needs_more_work');
  assert(mNeedsWork.value === 'not_yet', 'Legacy "needs_more_work" maps to "not_yet"');
  assert(
    mNeedsWork.mapping.notes?.includes('LEGACY COMPATIBILITY MAPPING') === true,
    'Mapping contains explicit LEGACY COMPATIBILITY MAPPING note'
  );
  assert(
    mNeedsWork.mapping.lossy.some((l) => l.includes('specific_needs_more_work_failure_history')),
    'Mapping notes failure history loss in raw status alone'
  );

  // Rejection of numeric scores
  assertThrows(
    () => assertNumericNotMastery(0.75),
    'Numeric value (0.75) rejected',
    'Arbitrary numeric score (0.75) rejected from mastery adaptation'
  );

  // ---------------------------------------------------------------------------
  // TEST 3: Error Taxonomy & Unknown Value Preservation (Task 4)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 3] Auditing Error Taxonomy & Unknown Value Preservation...');
  const errCalc = adaptLegacyErrorCode('calculation_slip');
  assert(errCalc.value === 'calculation_error', 'calculation_slip maps to calculation_error');
  assert(errCalc.mapping.isKnown === true, 'calculation_slip is known');

  const errMethod = adaptLegacyErrorCode('keyword_missing');
  assert(errMethod.value === 'methodology_error', 'keyword_missing maps to methodology_error');

  // Unknown value must NEVER disappear silently
  const errUnknown = adaptLegacyErrorCode('future_neural_glitch');
  assert(errUnknown.value === 'unknown', 'Unknown error code maps to canonical "unknown"');
  assert(errUnknown.mapping.isKnown === false, 'Unknown error code marked isKnown: false');
  assert(
    errUnknown.mapping.originalLegacyValue === 'future_neural_glitch',
    'Original unknown code preserved in mapping metadata'
  );
  assert(
    errUnknown.mapping.notes?.includes('future_neural_glitch') === true,
    'Metadata notes describe the preserved unknown code'
  );

  // ---------------------------------------------------------------------------
  // TEST 4: Mission & Duration Preservation
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 4] Auditing Mission Type & Duration Value Preservation...');
  const mType = adaptLegacyMissionType('understand');
  assert(mType.value === 'new_concept', 'Legacy "understand" maps to "new_concept"');

  const durShort = adaptLegacyMissionDuration(15);
  assert(durShort.value.durationClass === 'SHORT', '15 min classified as SHORT');
  assert(durShort.value.estimatedMinutes === 15, 'Continuous 15 min preserved in value!');
  assert(durShort.mapping.preserved.includes('estimatedMinutes'), 'estimatedMinutes explicitly marked preserved');
  assert(durShort.mapping.derived.includes('durationClass'), 'durationClass explicitly marked derived');

  const durStandard = adaptLegacyMissionDuration(25);
  assert(durStandard.value.durationClass === 'STANDARD', '25 min classified as STANDARD');
  assert(durStandard.value.estimatedMinutes === 25, 'Continuous 25 min preserved in value!');

  // ---------------------------------------------------------------------------
  // TEST 5: Diagnostic Adapter & Zero Layer Fabrication
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 5] Auditing Diagnostic Adapter & Zero Layer Fabrication...');
  const mockDiagnosticQ: DiagnosticQuestion = {
    id: 'diag_snv_01',
    subjectId: 'natural_sciences',
    streamId: 'sciences_exp',
    topicId: 'snv_protein_synthesis',
    topic_ar: 'تركيب البروتين',
    topic_fr: 'Synthèse des protéines',
    questionType: 'error_identification',
    dimension: 'methodology',
    prompt_ar: 'حدد الخطأ في الوثيقة 1',
    prompt_fr: 'Identifier l\'erreur dans le document 1',
    options: [
      {
        id: 'opt_1',
        text_ar: 'الاستنساخ يحدث في الهيولى',
        text_fr: 'La transcription a lieu dans le hyaloplasme',
        isCorrect: true,
        rationale_ar: 'الاستنساخ يحدث في النواة عند حقيقيات النوى',
        rationale_fr: 'La transcription a lieu dans le noyau',
      },
    ],
    expectedSeconds: 90,
    bacRelevance_ar: 'منهجية استغلال الوثائق',
    bacRelevance_fr: 'Méthodologie d\'exploitation',
  };

  const adaptedDiag = adaptLegacyDiagnosticQuestion(mockDiagnosticQ);
  assert(adaptedDiag.value.format === 'error_identification', 'Question format identified correctly');
  assert(adaptedDiag.value.cognitiveDemand === 'analysis_synthesis', 'Methodology maps to analysis_synthesis');
  assert(
    adaptedDiag.value.diagnosticLayer === undefined,
    'INVARIANT VERIFIED: diagnosticLayer is strictly undefined (zero layer fabrication)'
  );
  assert(
    adaptedDiag.mapping.unavailable.some((u) => u.includes('diagnosticLayer')),
    'diagnosticLayer marked unavailable in metadata'
  );

  // ---------------------------------------------------------------------------
  // TEST 6: Attempt vs Evidence Strict Separation
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 6] Auditing Attempt vs Evidence Strict Separation...');
  const mockResponse: PracticeResponse = {
    questionId: 'q_math_limits_01',
    selectedAnswer: 'opt_b',
    isCorrect: true,
    responseTimeSeconds: 45,
    confidence: 4,
  };

  const rawAttempt = adaptPracticeResponseToRawAttempt({
    response: mockResponse,
    studentId: 'student_123',
    skillId: 'math_limits_continuity',
    subjectId: 'math',
    streamId: 'sciences_exp',
    expectedTimeSeconds: 60,
    practiceTier: 'independent',
  });

  assert(rawAttempt.questionId === 'q_math_limits_01', 'Raw attempt captures questionId');
  assert(rawAttempt.selectedAnswer === 'opt_b', 'Raw attempt captures user answer');
  assert(rawAttempt.timeSpentSeconds === 45, 'Raw attempt captures timing telemetry');
  assert((rawAttempt as any).vectors === undefined, 'Raw attempt DOES NOT have evidence vectors');

  const cognitiveEvidence = deriveCognitiveEvidenceFromAttempt(rawAttempt);
  assert(cognitiveEvidence.vectors !== undefined, 'Cognitive evidence HAS multi-dimensional vectors');
  assert(cognitiveEvidence.vectors.correctness === true, 'Vector 1: correctness == true');
  assert(cognitiveEvidence.vectors.confidence === 4, 'Vector 2: confidence == 4');
  assert(cognitiveEvidence.vectors.responseSpeedRatio === 45 / 60, 'Vector 3: speedRatio == 0.75');
  assert(cognitiveEvidence.vectors.confidenceAlignment === 'well_calibrated', 'Vector 4: calibrated');
  assert(cognitiveEvidence.vectors.evidenceStrength === 'strong', 'Vector 5: strength == strong');
  assert((cognitiveEvidence as any).selectedAnswer === undefined, 'Cognitive evidence DOES NOT store raw answer click');

  // ---------------------------------------------------------------------------
  // TEST 7: Input Immutability / Purity
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 7] Auditing Adapter Purity (Zero Input Mutation)...');
  const frozenResponse: PracticeResponse = Object.freeze({
    questionId: 'q_frozen_01',
    selectedAnswer: 'opt_a',
    isCorrect: true,
    responseTimeSeconds: 30,
    confidence: 5,
  });

  const frozenAttempt = adaptPracticeResponseToRawAttempt({
    response: frozenResponse,
    studentId: 'student_frozen',
    skillId: 'math_limits_continuity',
    subjectId: 'math',
    streamId: 'sciences_exp',
  });

  assert(frozenAttempt.questionId === 'q_frozen_01', 'Pure adaptation on frozen object succeeded');

  const frozenQuestion = Object.freeze({ ...mockDiagnosticQ });
  const diagFromFrozen = adaptLegacyDiagnosticQuestion(frozenQuestion);
  assert(diagFromFrozen.value.id === 'diag_snv_01', 'Pure adaptation on frozen diagnostic question succeeded');

  // ---------------------------------------------------------------------------
  // TEST 8: Reversibility & Idempotency
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 8] Auditing Reversibility & Documented Non-Reversible Mappings...');
  // Reversible mapping:
  const exam = adaptLegacyExamType('BAC');
  assert(exam.value === 'BAC', 'Exam BAC is reversible');

  // Non-reversible mapping documented:
  const aliasMastered = adaptLegacyMasteryStatus('mastered');
  assert(aliasMastered.value === 'demonstrated', 'mastered -> demonstrated');
  // Reverse from demonstrated would not recover "mastered":
  assert(aliasMastered.mapping.lossy.includes('legacy_mastered_alias_normalized'), 'Documented as lossy alias');

  console.log('\n==================================================================');
  console.log('🎉 ALL V2 ADAPTER INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================================');
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
