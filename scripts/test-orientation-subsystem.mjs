// ==============================================================================
// scripts/test-orientation-subsystem.mjs
// Automated Verification Suite for Algerian University Orientation Subsystem (MESRS)
// ==============================================================================

import assert from 'assert';
import { OFFICIAL_WILAYAS } from '../src/lib/orientation/data/wilayas.ts';
import { OFFICIAL_BAC_STREAMS } from '../src/lib/orientation/data/streams.ts';
import { OFFICIAL_FIELDS } from '../src/lib/orientation/data/fields.ts';
import { OFFICIAL_INSTITUTIONS } from '../src/lib/orientation/data/institutions.ts';
import { OFFICIAL_PROGRAMS } from '../src/lib/orientation/data/programs.ts';
import {
  calculateWeightedAverage,
  evaluateProgramOffer,
  evaluateAllPrograms,
  OFFICIAL_DISCLAIMER,
} from '../src/lib/orientation/orientation-engine.ts';

console.log('🧪 Starting Orientation Subsystem Verification Suite...\n');

// -----------------------------------------------------------------------------
// Test 1: 58 Official Algerian Wilayas
// -----------------------------------------------------------------------------
console.log('1. Checking Wilayas Dataset...');
assert.strictEqual(OFFICIAL_WILAYAS.length, 58, 'Must contain exactly 58 official Algerian wilayas');
assert.strictEqual(OFFICIAL_WILAYAS[0].code, '01', 'First wilaya must be 01 (Adrar)');
assert.strictEqual(OFFICIAL_WILAYAS[15].code, '16', 'Wilaya 16 must be Alger');
assert.strictEqual(OFFICIAL_WILAYAS[57].code, '58', 'Last wilaya must be 58 (El Meniaa)');
console.log('   ✅ 58 Official Wilayas verified.\n');

// -----------------------------------------------------------------------------
// Test 2: Official BAC Streams
// -----------------------------------------------------------------------------
console.log('2. Checking Official BAC Streams...');
assert.strictEqual(OFFICIAL_BAC_STREAMS.length, 6, 'Must contain exactly 6 official BAC streams');
const streamIds = OFFICIAL_BAC_STREAMS.map(s => s.id);
assert(streamIds.includes('sciences_exp'), 'Sciences Exp must be present');
assert(streamIds.includes('math'), 'Math must be present');
assert(streamIds.includes('technique_math'), 'Technique Math must be present');
assert(streamIds.includes('gestion_eco'), 'Gestion et Economie must be present');
assert(streamIds.includes('lettres_philo'), 'Lettres et Philo must be present');
assert(streamIds.includes('langues_etrangeres'), 'Langues Etrangeres must be present');
console.log('   ✅ 6 Official BAC streams verified.\n');

// -----------------------------------------------------------------------------
// Test 3: Mathematical Formula Engine
// -----------------------------------------------------------------------------
console.log('3. Checking Weighted Average Calculation Engine...');
// Formula: (2 * Math + Physics) / 3
const formulaESI = {
  expressionAr: '(2 × Math + Physics) / 3',
  expressionFr: '(2M + P) / 3',
  divisor: 3,
  terms: [
    { subject: 'math', coefficient: 2 },
    { subject: 'physics', coefficient: 1 },
  ],
};

const weightedESI = calculateWeightedAverage(formulaESI, 16.0, {
  mathematics: 18.0,
  physics: 15.0,
});
// (2 * 18 + 15) / 3 = 51 / 3 = 17.00
assert.strictEqual(weightedESI, 17.00, 'Weighted ESI calculation must equal 17.00');

// Formula: (Math + 2 * Sciences + Physics) / 4
const formulaMed = {
  expressionAr: '(Math + 2 * Sciences + Physics) / 4',
  expressionFr: '(M + 2S + P) / 4',
  divisor: 4,
  terms: [
    { subject: 'math', coefficient: 1 },
    { subject: 'natural_sciences', coefficient: 2 },
    { subject: 'physics', coefficient: 1 },
  ],
};

const weightedMed = calculateWeightedAverage(formulaMed, 16.50, {
  mathematics: 16.0,
  naturalSciences: 18.0,
  physics: 16.0,
});
// (16 + 2 * 18 + 16) / 4 = 68 / 4 = 17.00
assert.strictEqual(weightedMed, 17.00, 'Weighted Medicine calculation must equal 17.00');

// Missing grade returns null
const weightedMissing = calculateWeightedAverage(formulaMed, 16.50, {
  mathematics: 16.0,
  // naturalSciences is missing!
  physics: 16.0,
});
assert.strictEqual(weightedMissing, null, 'Missing subject grade must return null');
console.log('   ✅ Formula Engine verified.\n');

// -----------------------------------------------------------------------------
// Test 4: Stream Invariants & Legal Gatekeepers
// -----------------------------------------------------------------------------
console.log('4. Checking Stream Invariants & Ministerial Restrictions...');
const medProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '011');
assert(medProg, 'Doctorat en Médecine must be in catalog');

// Case A: Literary student applying to Medicine
const literaryStudent = {
  streamId: 'lettres_philo',
  wilayaId: 16,
  generalAverage: 18.50,
  grades: { arabic: 19, philosophy: 18 },
};

const medOfferAlger = medProg.institutions[0];
const literaryMedResult = evaluateProgramOffer(literaryStudent, medProg, medOfferAlger);
assert.strictEqual(literaryMedResult.eligibilityStatus, 'NOT_ELIGIBLE', 'Literary student MUST NOT be eligible for Medicine');
assert(literaryMedResult.blockers.some(b => b.includes('غير مقبولة')), 'Must report stream is not accepted');

// Case B: Science student with high average applying to Medicine in Alger
const scienceStudentAlger = {
  streamId: 'sciences_exp',
  wilayaId: 16,
  generalAverage: 17.20,
  grades: { mathematics: 17.0, naturalSciences: 17.5, physics: 17.0 },
};

const scienceMedResult = evaluateProgramOffer(scienceStudentAlger, medProg, medOfferAlger);
assert.strictEqual(scienceMedResult.eligibilityStatus, 'COMPETITIVE', 'High score science student in Alger must be COMPETITIVE for Medicine');
assert.strictEqual(scienceMedResult.priority, 1, 'Sciences Exp must be Priority 1 for Medicine');

// Case C: Science student with general average < 15.00 (fails ministerial threshold)
const lowScoreScience = {
  streamId: 'sciences_exp',
  wilayaId: 16,
  generalAverage: 14.80,
  grades: { mathematics: 15.0, naturalSciences: 15.0, physics: 15.0 },
};

const lowScoreMedResult = evaluateProgramOffer(lowScoreScience, medProg, medOfferAlger);
assert.strictEqual(lowScoreMedResult.eligibilityStatus, 'NOT_ELIGIBLE', 'Average below 15.00 must be NOT_ELIGIBLE for Medicine');
assert(lowScoreMedResult.blockers.some(b => b.includes('أقل من الحد الأدنى القانوني')), 'Must report average below legal threshold');
console.log('   ✅ Stream Invariants & Legal Thresholds verified.\n');

// -----------------------------------------------------------------------------
// Test 5: Geographic Scopes (National vs Regional vs Local)
// -----------------------------------------------------------------------------
console.log('5. Checking Geographic Rules Enforcement...');
// ESI Alger is National
const esiProg = OFFICIAL_PROGRAMS.find(p => p.programCode === '071');
const esiOffer = esiProg.institutions[0];
const studentOuargla = {
  streamId: 'math',
  wilayaId: 30, // Ouargla
  generalAverage: 18.50,
  grades: { mathematics: 19.0, physics: 18.0 },
};

const esiOuarglaResult = evaluateProgramOffer(studentOuargla, esiProg, esiOffer);
assert.strictEqual(esiOuarglaResult.eligibilityStatus, 'COMPETITIVE', 'National school accepts Wilaya 30');

// Regional Medicine Alger Faculty (covers 16, 9, 35, 42). Student from Wilaya 31 (Oran) must be geographically blocked from Alger
const studentOran = {
  streamId: 'sciences_exp',
  wilayaId: 31, // Oran
  generalAverage: 17.50,
  grades: { mathematics: 17.0, naturalSciences: 18.0, physics: 17.0 },
};

const oranInAlgerMed = evaluateProgramOffer(studentOran, medProg, medOfferAlger);
assert.strictEqual(oranInAlgerMed.eligibilityStatus, 'NOT_ELIGIBLE', 'Student from Oran cannot enroll in Alger Medicine faculty');
assert(oranInAlgerMed.blockers.some(b => b.includes('الدائرة الجغرافية') || b.includes('جهوي')), 'Must report geographic scope restriction');

// But Oran student in Oran Medicine faculty is COMPETITIVE!
const medOfferOran = medProg.institutions.find(i => i.institution.id === 'inst-univ-oran1');
const oranInOranMed = evaluateProgramOffer(studentOran, medProg, medOfferOran);
assert.strictEqual(oranInOranMed.eligibilityStatus, 'COMPETITIVE', 'Student from Oran IS eligible in Oran Faculty of Medicine');
console.log('   ✅ Geographic Scopes verified.\n');

// -----------------------------------------------------------------------------
// Test 6: Invariant Non-Confusion (Eligibility != Competitive Cutoff)
// -----------------------------------------------------------------------------
console.log('6. Checking Invariant: Legal Eligibility vs Competitive Cutoffs...');
// Student with 15.20 in Sciences Exp in Alger: meets legal minimum 15.00, but below 2025 cutoff (16.92)
const stretchStudent = {
  streamId: 'sciences_exp',
  wilayaId: 16,
  generalAverage: 15.20,
  grades: { mathematics: 15.0, naturalSciences: 15.5, physics: 15.0 },
};

const stretchResult = evaluateProgramOffer(stretchStudent, medProg, medOfferAlger);
assert.strictEqual(stretchResult.eligibilityStatus, 'STRETCH', 'Must be classified as STRETCH, NOT_ELIGIBLE is false because legal minimum is met');
assert(stretchResult.warnings.some(w => w.includes('أقل من معدل القبول الأخير')), 'Must warn about historical cutoff');
assert.strictEqual(stretchResult.officialDisclaimer, OFFICIAL_DISCLAIMER, 'Official disclaimer must be present');
console.log('   ✅ Eligibility vs Cutoff distinction verified.\n');

// -----------------------------------------------------------------------------
// Test 7: Full Engine Evaluation Report Generation
// -----------------------------------------------------------------------------
console.log('7. Running Full Multi-Program Evaluation Report...');
const fullReport = evaluateAllPrograms(scienceStudentAlger, OFFICIAL_PROGRAMS);
assert(fullReport.totalEvaluated > 0, 'Must evaluate programs');
assert(fullReport.competitiveCount > 0, 'Must have competitive programs');
assert(fullReport.eligibleCount >= fullReport.competitiveCount, 'Eligible count >= competitive count');
assert.strictEqual(fullReport.officialYear, '2026-2027', 'Official circular year must be 2026-2027');
console.log(`   ✅ Evaluated ${fullReport.totalEvaluated} programs offers:`);
console.log(`      - Competitive: ${fullReport.competitiveCount}`);
console.log(`      - Stretch: ${fullReport.stretchCount}`);
console.log(`      - Eligible total: ${fullReport.eligibleCount}`);
console.log(`      - Not Eligible: ${fullReport.notEligibleCount}`);
console.log('\n🎉 ALL 7 ORIENTATION SUBSYSTEM VERIFICATION TESTS PASSED!\n');
