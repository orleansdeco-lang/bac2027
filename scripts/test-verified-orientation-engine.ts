// ==============================================================================
// scripts/test-verified-orientation-engine.ts
// Comprehensive Regression Test Suite for SHATER Algerian University Orientation Engine
// Validates Cases A through G against official MESRS standards and ministerial circulars
// ==============================================================================

import { evaluateProgramOffer, evaluateAllPrograms } from '../src/lib/orientation/orientation-engine';
import { VERIFIED_PROGRAMS } from '../src/lib/orientation/data/programs';
import { StudentBacProfile, Program, InstitutionOffer } from '../src/types/orientation';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         -> ${details}`);
  }
}

console.log('================================================================');
console.log('  SHATER VERIFIED ORIENTATION ENGINE - REGRESSION TEST SUITE');
console.log('  Official Year: 2026-2027 | Ministerial Circular Verification');
console.log('================================================================\n');

// Find key programs
const medProgram = VERIFIED_PROGRAMS.find(p => p.id === 'prog-med-01')!;
const esiProgram = VERIFIED_PROGRAMS.find(p => p.id === 'prog-esi-01')!;
const epauProgram = VERIFIED_PROGRAMS.find(p => p.id === 'prog-epau-01')!;

if (!medProgram || !esiProgram || !epauProgram) {
  console.error('Fatal: Core programs (Medicine, ESI, EPAU) not found in VERIFIED_PROGRAMS.');
  process.exit(1);
}

// ------------------------------------------------------------------------------
// TEST CASE A: Medicine Formula Verification
// ------------------------------------------------------------------------------
console.log('--- TEST CASE A: Medicine Formula ((2*Bac) + Sciences) / 3 ---');
{
  const studentA: StudentBacProfile = {
    generalAverage: 18.50,
    streamId: 'sciences_exp',
    wilayaId: 16,
    grades: {
      mathematics: 18.0,
      physics: 18.0,
      naturalSciences: 17.0,
    },
  };

  const medOffer = medProgram.institutions[0];
  const resultA = evaluateProgramOffer(studentA, medProgram, medOffer);

  const expectedScore = Math.round(((18.50 * 2 + 17.0) / 3) * 100) / 100; // 18.00
  const oldBuggyScore = Math.round(((18.0 + 2 * 17.0 + 18.0) / 4) * 100) / 100; // 17.50

  assert(resultA.eligibilityStatus === 'ELIGIBLE', 'Case A.1: Status is ELIGIBLE');
  assert(resultA.priority === 1, 'Case A.2: Priority is 1 for Sciences Exp');
  assert(
    resultA.calculatedWeightedAverage === 18.00,
    `Case A.3: Calculated weighted score is exactly 18.00 (got ${resultA.calculatedWeightedAverage})`,
    `Expected 18.00, got ${resultA.calculatedWeightedAverage}. Old buggy formula would have given ${oldBuggyScore}.`
  );
  assert(
    resultA.calculatedWeightedAverage !== oldBuggyScore,
    'Case A.4: Old unverified formula ((Math + 2*Sciences + Phys)/4) is NOT used'
  );
}

// ------------------------------------------------------------------------------
// TEST CASE B: ESI Formula Verification
// ------------------------------------------------------------------------------
console.log('\n--- TEST CASE B: ESI Formula ((2*Bac) + Math) / 3 ---');
{
  const studentB: StudentBacProfile = {
    generalAverage: 18.50,
    streamId: 'math',
    wilayaId: 16,
    grades: {
      mathematics: 13.0,
      physics: 12.0,
    },
  };

  const esiOffer = esiProgram.institutions[0];
  const resultB = evaluateProgramOffer(studentB, esiProgram, esiOffer);

  const expectedScore = Math.round(((18.50 * 2 + 13.0) / 3) * 100) / 100; // 16.67
  const oldBuggyScore = Math.round(((2 * 13.0 + 12.0) / 3) * 100) / 100; // 12.67

  assert(resultB.eligibilityStatus === 'ELIGIBLE', 'Case B.1: Status is ELIGIBLE');
  assert(
    resultB.calculatedWeightedAverage === 16.67,
    `Case B.2: ESI weighted score is 16.67 (got ${resultB.calculatedWeightedAverage})`,
    `Expected 16.67, got ${resultB.calculatedWeightedAverage}. Old unverified formula gave ${oldBuggyScore}.`
  );
  assert(
    resultB.studentAverageUsed === 16.67,
    'Case B.3: Ranking score used is the calculated weighted average 16.67'
  );
}

// ------------------------------------------------------------------------------
// TEST CASE C: EPAU Architecture Formula Verification
// ------------------------------------------------------------------------------
console.log('\n--- TEST CASE C: EPAU Architecture Formula ((2*Bac) + Math + Phys) / 4 ---');
{
  const studentC: StudentBacProfile = {
    generalAverage: 18.50,
    streamId: 'math',
    wilayaId: 16,
    grades: {
      mathematics: 14.0,
      physics: 14.0,
    },
  };

  const epauOffer = epauProgram.institutions[0];
  const resultC = evaluateProgramOffer(studentC, epauProgram, epauOffer);

  const expectedScore = Math.round(((18.50 * 2 + 14.0 + 14.0) / 4) * 100) / 100; // 16.25

  assert(resultC.eligibilityStatus === 'ELIGIBLE', 'Case C.1: Status is ELIGIBLE');
  assert(
    resultC.calculatedWeightedAverage === 16.25,
    `Case C.2: EPAU weighted score is 16.25 (got ${resultC.calculatedWeightedAverage})`,
    `Expected 16.25, got ${resultC.calculatedWeightedAverage}`
  );
  assert(
    resultC.studentAverageUsed === 16.25,
    'Case C.3: Ranking score used is 16.25'
  );
}

// ------------------------------------------------------------------------------
// TEST CASE D: Stream-Subject Incompatibility (Technique Math in Medicine)
// ------------------------------------------------------------------------------
console.log('\n--- TEST CASE D: Technique Math in Medicine (No Natural Sciences) ---');
{
  const studentD: StudentBacProfile = {
    generalAverage: 16.50,
    streamId: 'technique_math',
    wilayaId: 16,
    grades: {
      mathematics: 17.0,
      physics: 16.0,
      // Note: naturalSciences is undefined because Technique Math students do not study natural sciences
    },
  };

  const medOffer = medProgram.institutions[0];
  const resultD = evaluateProgramOffer(studentD, medProgram, medOffer);

  assert(
    resultD.eligibilityStatus === 'ELIGIBLE',
    `Case D.1: Technique Math student is ELIGIBLE for Medicine without natural sciences (got ${resultD.eligibilityStatus})`
  );
  assert(
    resultD.priority === 2,
    `Case D.2: Priority is 2 according to official circular (got ${resultD.priority})`
  );
  assert(
    resultD.studentAverageUsed === 16.50,
    `Case D.3: Ranked directly by General Average (16.50) without weighted science formula`
  );
  assert(
    !resultD.blockers.some(b => b.includes('علوم الطبيعة')),
    'Case D.4: No blocker falsely complaining about missing natural sciences'
  );
}

// ------------------------------------------------------------------------------
// TEST CASE E: Missing Required Subject Grade Handling
// ------------------------------------------------------------------------------
console.log('\n--- TEST CASE E: Missing Required Grade Returns UNKNOWN (Never 0) ---');
{
  const studentE: StudentBacProfile = {
    generalAverage: 18.50,
    streamId: 'sciences_exp',
    wilayaId: 16,
    grades: {
      // Intentionally missing natural sciences for a stream that requires it in the formula
      mathematics: 18.0,
      physics: 18.0,
    },
  };

  const medOffer = medProgram.institutions[0];
  const resultE = evaluateProgramOffer(studentE, medProgram, medOffer);

  assert(
    resultE.eligibilityStatus === 'UNKNOWN',
    `Case E.1: Status is UNKNOWN when formula subject is missing (got ${resultE.eligibilityStatus})`
  );
  assert(
    resultE.calculatedWeightedAverage === null,
    'Case E.2: Calculated weighted average is null (not defaulted to 0)'
  );
  assert(
    resultE.warnings.some(w => w.includes('يرجى إدخال علامات المواد')),
    'Case E.3: Helpful warning informs student to provide required grade'
  );
}

// ------------------------------------------------------------------------------
// TEST CASE F: Stream-Stratified Historical Cutoffs
// ------------------------------------------------------------------------------
console.log('\n--- TEST CASE F: Stream-Stratified Cutoffs Verification ---');
{
  const offer = medProgram.institutions.find(i => i.institution.id === 'inst-univ-alger1')!;

  // Student 1: Sciences Exp with 16.40
  const studentF1: StudentBacProfile = {
    generalAverage: 16.40,
    streamId: 'sciences_exp',
    wilayaId: 16,
    grades: { naturalSciences: 16.40 },
  };
  const resultF1 = evaluateProgramOffer(studentF1, medProgram, offer);

  // Student 2: Technique Math with 16.40
  const studentF2: StudentBacProfile = {
    generalAverage: 16.40,
    streamId: 'technique_math',
    wilayaId: 16,
    grades: {},
  };
  const resultF2 = evaluateProgramOffer(studentF2, medProgram, offer);

  // Student 3: Math with 16.40
  const studentF3: StudentBacProfile = {
    generalAverage: 16.40,
    streamId: 'math',
    wilayaId: 16,
    grades: { naturalSciences: 16.40 },
  };
  const resultF3 = evaluateProgramOffer(studentF3, medProgram, offer);

  // Sciences Exp cutoff: 16.33 weighted. 16.40 >= 16.33 -> ABOVE_HISTORICAL_CUTOFF
  assert(
    resultF1.historicalComparison === 'ABOVE_HISTORICAL_CUTOFF',
    `Case F.1: Sciences Exp student is ABOVE historical cutoff (16.40 >= 16.33) (got ${resultF1.historicalComparison})`
  );

  // Technique Math cutoff: 16.82 general. 16.40 < 16.82 (diff -0.42 < -0.25) -> BELOW_HISTORICAL_CUTOFF
  assert(
    resultF2.historicalComparison === 'BELOW_HISTORICAL_CUTOFF',
    `Case F.2: Technique Math student is BELOW stream-specific cutoff 16.82 (got ${resultF2.historicalComparison})`
  );

  // Math cutoff: 16.45 weighted. 16.40 is -0.05 below -> NEAR_HISTORICAL_CUTOFF
  assert(
    resultF3.historicalComparison === 'NEAR_HISTORICAL_CUTOFF',
    `Case F.3: Math student is NEAR stream-specific cutoff 16.45 (diff -0.05) (got ${resultF3.historicalComparison})`
  );

  // Verify all cutoffs returned are stratified by stream
  assert(
    resultF1.historicalCutoffs.every(c => c.stream === 'sciences_exp'),
    'Case F.4: Result F1 cutoffs contain only sciences_exp cutoffs'
  );
  assert(
    resultF2.historicalCutoffs.every(c => c.stream === 'technique_math'),
    'Case F.5: Result F2 cutoffs contain only technique_math cutoffs'
  );
}

// ------------------------------------------------------------------------------
// TEST CASE G: Absence of Arbitrary -0.50 Heuristic
// ------------------------------------------------------------------------------
console.log('\n--- TEST CASE G: Absence of Arbitrary -0.50 Heuristic ---');
{
  // Student with 15.50 applying to Medicine where minimum requirement is 15.00
  // But historical cutoff is 16.33 (diff is -0.83, well below old -0.50 cutoff)
  const studentG: StudentBacProfile = {
    generalAverage: 15.50,
    streamId: 'sciences_exp',
    wilayaId: 16,
    grades: {
      naturalSciences: 15.50,
      mathematics: 15.0,
      physics: 15.0,
    },
  };

  const medOffer = medProgram.institutions[0];
  const resultG = evaluateProgramOffer(studentG, medProgram, medOffer);

  assert(
    resultG.eligibilityStatus === 'ELIGIBLE',
    `Case G.1: Student is legally ELIGIBLE because generalAverage (15.50) >= minimum (15.00) (got ${resultG.eligibilityStatus})`
  );
  assert(
    resultG.historicalComparison === 'BELOW_HISTORICAL_CUTOFF',
    `Case G.2: Historical comparison is BELOW_HISTORICAL_CUTOFF (purely advisory)`
  );
  assert(
    resultG.blockers.length === 0,
    'Case G.3: Zero blockers generated from historical cutoff deficit'
  );
}

// ------------------------------------------------------------------------------
// SUMMARY REPORT
// ------------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  REGRESSION TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
if (failedTests > 0) {
  console.log(`  CRITICAL: ${failedTests} test(s) failed!`);
  console.log('================================================================\n');
  process.exit(1);
} else {
  console.log('  ALL REGRESSION INVARIANTS SATISFIED (A through G)');
  console.log('  DATA TRUST STATUS: VERIFIED');
  console.log('================================================================\n');
  process.exit(0);
}
