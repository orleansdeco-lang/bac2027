// ==============================================================================
// scripts/test-orientation-verification-gate.ts
// Comprehensive Test Suite for Algerian Higher Education Orientation Engine
// Target Academic Year: 2026-2027 (circulaire.mesrs.dz)
// ==============================================================================

import { OFFICIAL_PROGRAMS } from '../src/lib/orientation/data/programs';
import { OFFICIAL_INSTITUTIONS } from '../src/lib/orientation/data/institutions';
import { OFFICIAL_SOURCES } from '../src/lib/orientation/data/sources';
import {
  evaluateProgramOffer,
  evaluateAllPrograms,
  calculateWeightedAverage,
  getSubjectGrade,
  OFFICIAL_DISCLAIMER,
  OFFICIAL_ORIENTATION_YEAR,
} from '../src/lib/orientation/orientation-engine';
import { OrientationService } from '../src/lib/orientation/orientation-service';
import { StudentBacProfile, Program } from '../src/types/orientation';

console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║               SHATER | الشاطر — مستكشف التوجيه الجامعي الجزائري 2026-2027              ║');
console.log('║                      ORIENTATION VERIFICATION GATE TEST SUITE                                ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════╝\n');

let passCount = 0;
let failCount = 0;

function it(description: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          passCount++;
          console.log(`  ✓ ${description}`);
        })
        .catch(err => {
          failCount++;
          console.error(`  ✗ ${description}`);
          console.error(`    Error: ${err.message}`);
        });
    }
    passCount++;
    console.log(`  ✓ ${description}`);
  } catch (err: any) {
    failCount++;
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runTests() {
  console.log('1. FORMULA EXACTNESS & MATHEMATICAL INTEGRITY');
  console.log('---------------------------------------------');

  it('calculates Medicine weighted formula: ((2 * bac) + sciences) / 3', () => {
    const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011')!;
    const rule = medProg.eligibilityRules?.find(r => r.bacStreamId === 'sciences_exp')!;
    const generalAverage = 16.20;
    const grades = { naturalSciences: 18.00 };
    const weighted = calculateWeightedAverage(rule.weightedFormula, generalAverage, grades);
    // ((2 * 16.20) + 18.00) / 3 = (32.40 + 18.00) / 3 = 50.40 / 3 = 16.80
    if (weighted !== 16.80) throw new Error(`Expected 16.80 but got ${weighted}`);
  });

  it('calculates ESI weighted formula: ((2 * bac) + math) / 3', () => {
    const esiProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '071')!;
    const rule = esiProg.eligibilityRules?.find(r => r.bacStreamId === 'math')!;
    const generalAverage = 17.10;
    const grades = { mathematics: 19.50 };
    const weighted = calculateWeightedAverage(rule.weightedFormula, generalAverage, grades);
    // ((2 * 17.10) + 19.50) / 3 = (34.20 + 19.50) / 3 = 53.70 / 3 = 17.90
    if (weighted !== 17.90) throw new Error(`Expected 17.90 but got ${weighted}`);
  });

  it('returns general average if program uses ranking_basis = general_average without formula', () => {
    const stProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '051')!;
    const rule = stProg.eligibilityRules?.find(r => r.bacStreamId === 'sciences_exp')!;
    const weighted = calculateWeightedAverage(rule.weightedFormula, 14.50, {});
    if (weighted !== 14.50) throw new Error(`Expected 14.50 but got ${weighted}`);
  });

  console.log('\n2. STREAM APPLICABILITY & NON-APPLICABLE SUBJECT GUARDS');
  console.log('-------------------------------------------------------');

  it('does not penalize Technique Math student for unstudied natural sciences', () => {
    const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011')!;
    const offer = medProg.institutions![0];
    const tmStudent: StudentBacProfile = {
      streamId: 'technique_math',
      wilayaId: 16,
      generalAverage: 17.00,
      grades: {
        mathematics: 18.00,
        physics: 17.00,
        // naturalSciences NOT studied in TM
      },
    };
    const evalResult = evaluateProgramOffer(tmStudent, medProg, offer);
    if (evalResult.eligibility !== 'ELIGIBLE') {
      throw new Error(`Expected ELIGIBLE for TM student in Medicine, got: ${evalResult.eligibility} (${evalResult.blockers.join(', ')})`);
    }
    if (evalResult.admissionScore.scoreType !== 'GENERAL_AVERAGE') {
      throw new Error(`Expected GENERAL_AVERAGE for TM student, got: ${evalResult.admissionScore.scoreType}`);
    }
  });

  it('correctly evaluates Science Exp student with complete grades as ELIGIBLE for Medicine', () => {
    const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011')!;
    const offer = medProg.institutions![0]; // Alger 1 (wilayas 16, 9, 35, 42)
    const seStudent: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16, // Alger
      generalAverage: 16.50,
      grades: {
        mathematics: 16.00,
        physics: 17.00,
        naturalSciences: 18.00,
      },
    };
    const evalResult = evaluateProgramOffer(seStudent, medProg, offer);
    if (evalResult.eligibility !== 'ELIGIBLE') {
      throw new Error(`Expected ELIGIBLE but got ${evalResult.eligibility}: ${evalResult.blockers.join(', ')}`);
    }
    if (evalResult.admissionScore.scoreType !== 'WEIGHTED_AVERAGE') {
      throw new Error('Expected WEIGHTED_AVERAGE scoreType');
    }
  });

  console.log('\n3. LEGAL ELIGIBILITY vs HISTORICAL CUTOFF SEPARATION');
  console.log('---------------------------------------------------');

  it('marks student ELIGIBLE even when score is BELOW historical reference cutoff', () => {
    const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011')!;
    const offer = medProg.institutions![0];
    const student: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16,
      generalAverage: 15.20, // Above minimum legal threshold (15.00), but below 2024 cutoff (16.33)
      grades: {
        mathematics: 15.00,
        physics: 15.00,
        naturalSciences: 15.20,
      },
    };
    const evalResult = evaluateProgramOffer(student, medProg, offer);
    if (evalResult.eligibility !== 'ELIGIBLE') {
      throw new Error(`Student meets legal minimums, must be ELIGIBLE! Got: ${evalResult.eligibility}`);
    }
    if (evalResult.historicalComparison !== 'BELOW_HISTORICAL_REFERENCE') {
      throw new Error(`Expected BELOW_HISTORICAL_REFERENCE but got: ${evalResult.historicalComparison}`);
    }
    if (evalResult.historicalCutoff?.academicYear !== '2024-2025') {
      throw new Error(`Expected historical year 2024-2025, got: ${evalResult.historicalCutoff?.academicYear}`);
    }
  });

  it('marks historical comparison as CURRENT_CUTOFF_UNAVAILABLE when no historical cutoffs exist', () => {
    // Create synthetic program with no cutoffs
    const progNoCutoffs: Program = {
      ...OFFICIAL_PROGRAMS[0],
      cutoffs: [],
    };
    const student: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16,
      generalAverage: 15.00,
      grades: { naturalSciences: 16.00 },
    };
    const evalResult = evaluateProgramOffer(student, progNoCutoffs, progNoCutoffs.institutions![0]);
    if (evalResult.historicalComparison !== 'CURRENT_CUTOFF_UNAVAILABLE') {
      throw new Error(`Expected CURRENT_CUTOFF_UNAVAILABLE but got ${evalResult.historicalComparison}`);
    }
    if (evalResult.historicalCutoff !== null) {
      throw new Error('Expected historicalCutoff to be null');
    }
  });

  console.log('\n4. GEOGRAPHIC RESTRICTION & CONF-01 SAFEGUARD');
  console.log('---------------------------------------------');

  it('allows student within regional scope and blocks student outside regional scope', () => {
    const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011')!;
    const algerOffer = medProg.institutions!.find(i => i.institution.id === 'inst-univ-alger1')!;
    // Eligible wilayas for Alger 1: [16, 9, 35, 42]

    const algerStudent: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16, // Alger -> IN
      generalAverage: 16.00,
      grades: { naturalSciences: 16.00 },
    };
    const oranStudent: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 31, // Oran -> OUT of Alger 1 regional scope
      generalAverage: 16.00,
      grades: { naturalSciences: 16.00 },
    };

    const algerEval = evaluateProgramOffer(algerStudent, medProg, algerOffer);
    const oranEval = evaluateProgramOffer(oranStudent, medProg, algerOffer);

    if (algerEval.eligibility !== 'ELIGIBLE') {
      throw new Error(`Alger student should be ELIGIBLE, got: ${algerEval.eligibility}`);
    }
    if (oranEval.eligibility !== 'NOT_ELIGIBLE') {
      throw new Error(`Oran student at Alger 1 should be NOT_ELIGIBLE, got: ${oranEval.eligibility}`);
    }
    if (!oranEval.blockers.some(b => b.includes('غير متاح لولاية نيل البكالوريا'))) {
      throw new Error('Expected geographic rejection blocker');
    }
  });

  it('handles CONF-01 (regional annex missing) with explicit warning without false blocking', () => {
    const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011')!;
    const offerWithoutAnnex = {
      institution: OFFICIAL_INSTITUTIONS[0],
      registrationScope: 'regional' as const,
      eligibleWilayas: undefined, // Missing annex
    };
    const student: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16,
      generalAverage: 16.00,
      grades: { naturalSciences: 16.00 },
    };
    const evalResult = evaluateProgramOffer(student, medProg, offerWithoutAnnex);
    if (!evalResult.warnings.some(w => w.includes('الملحق الجغرافي التفصيلي'))) {
      throw new Error('Expected CONF-01 explicit warning regarding missing regional annex');
    }
  });

  console.log('\n5. CONDITIONAL REQUIREMENTS & ENS INTERVIEWS (CONF-03)');
  console.log('------------------------------------------------------');

  it('sets eligibility to CONDITIONAL for ENS Teacher Training programs requiring interview', () => {
    const ensProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '091')!; // ENS Math
    const offer = ensProg.institutions![0];
    const student: StudentBacProfile = {
      streamId: 'math',
      wilayaId: 16,
      generalAverage: 16.00,
      grades: { mathematics: 17.00 },
    };
    const evalResult = evaluateProgramOffer(student, ensProg, offer);
    if (evalResult.eligibility !== 'CONDITIONAL') {
      throw new Error(`Expected CONDITIONAL for ENS requiring interview, got: ${evalResult.eligibility}`);
    }
    if (evalResult.additionalConditions.length === 0) {
      throw new Error('Expected explicit textual conditions in additionalConditions');
    }
    if (!evalResult.warnings.some(w => w.includes('المقابلة الشفوية'))) {
      throw new Error('Expected warning informing student of required oral interview');
    }
  });

  console.log('\n6. MISSING GRADES HANDLING (UNKNOWN STATUS)');
  console.log('-------------------------------------------');

  it('returns UNKNOWN when required subject grade for weighted formula is missing', () => {
    const esiProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '071')!;
    const offer = esiProg.institutions![0];
    const studentMissingMath: StudentBacProfile = {
      streamId: 'math',
      wilayaId: 16,
      generalAverage: 18.00,
      grades: {
        // mathematics grade is MISSING!
        physics: 19.00,
      },
    };
    const evalResult = evaluateProgramOffer(studentMissingMath, esiProg, offer);
    if (evalResult.eligibility !== 'UNKNOWN') {
      throw new Error(`Expected UNKNOWN for missing required math grade, got: ${evalResult.eligibility}`);
    }
  });

  console.log('\n7. PUBLICATION GATE GUARD (PRODUCTION vs REVIEW MODE)');
  console.log('-----------------------------------------------------');

  await it('OrientationService.getPrograms() returns 0 programs in production mode (PUBLISHED = 0)', async () => {
    const prodPrograms = await OrientationService.getPrograms({ includeVerified: false });
    if (prodPrograms.length !== 0) {
      throw new Error(`Expected 0 published programs in production mode, got: ${prodPrograms.length}`);
    }
  });

  await it('OrientationService.getPrograms({ includeVerified: true }) returns all 15 verified programs', async () => {
    const reviewPrograms = await OrientationService.getPrograms({ includeVerified: true });
    if (reviewPrograms.length !== 15) {
      throw new Error(`Expected 15 programs in review mode, got: ${reviewPrograms.length}`);
    }
  });

  await it('OrientationService.evaluateStudentOrientation() in production mode returns 0 evaluated programs', async () => {
    const student: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16,
      generalAverage: 17.00,
    };
    const report = await OrientationService.evaluateStudentOrientation(student, { includeVerified: false });
    if (report.totalEvaluated !== 0) {
      throw new Error(`Expected totalEvaluated = 0 in production mode, got: ${report.totalEvaluated}`);
    }
  });

  await it('OrientationService.evaluateStudentOrientation({ includeVerified: true }) evaluates all verified programs', async () => {
    const student: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16,
      generalAverage: 17.00,
      grades: {
        mathematics: 16.00,
        physics: 17.00,
        naturalSciences: 18.00,
        arabic: 14.00,
        french: 15.00,
        english: 16.00,
      },
    };
    const report = await OrientationService.evaluateStudentOrientation(student, { includeVerified: true });
    if (report.totalEvaluated === 0) {
      throw new Error('Expected non-zero evaluated programs in review mode');
    }
    if (report.eligibleCount === 0) {
      throw new Error('Expected student with 17.00 to have eligible options in review mode');
    }
  });

  console.log('\n8. OFFICIAL DISCLAIMER & CONF-04/CONF-05 INVARIANTS');
  console.log('---------------------------------------------------');

  it('includes mandatory official disclaimer on every evaluation result', () => {
    const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011')!;
    const offer = medProg.institutions![0];
    const student: StudentBacProfile = {
      streamId: 'sciences_exp',
      wilayaId: 16,
      generalAverage: 16.00,
      grades: { naturalSciences: 16.00 },
    };
    const evalResult = evaluateProgramOffer(student, medProg, offer);
    if (!evalResult.officialDisclaimer || evalResult.officialDisclaimer !== OFFICIAL_DISCLAIMER) {
      throw new Error('Missing or altered official disclaimer');
    }
    if (!evalResult.officialDisclaimer.includes('لا تشكل ضماناً للقبول')) {
      throw new Error('Disclaimer must explicitly state historical cutoffs are not guarantees');
    }
  });

  it('CONF-04: includes pedagogical note that stream quotas are confidential and unstated', () => {
    const esiProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '071')!;
    const offer = esiProg.institutions![0];
    const student: StudentBacProfile = {
      streamId: 'math',
      wilayaId: 16,
      generalAverage: 18.00,
      grades: { mathematics: 18.00 },
    };
    const evalResult = evaluateProgramOffer(student, esiProg, offer);
    if (!evalResult.reasons.some(r => r.includes('المقاعد البيداغوجية ونسب الكوطة'))) {
      throw new Error('Expected CONF-04 quota explanation in reasons');
    }
  });

  console.log('\n================================================================================');
  console.log(`TOTAL TESTS:  ${passCount + failCount}`);
  console.log(`PASSED:       ${passCount}`);
  console.log(`FAILED:       ${failCount}`);
  console.log('================================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
