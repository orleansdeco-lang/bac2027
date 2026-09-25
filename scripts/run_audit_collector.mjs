import { OFFICIAL_PROGRAMS } from '../src/lib/orientation/data/programs.ts';
import { OFFICIAL_INSTITUTIONS } from '../src/lib/orientation/data/institutions.ts';
import { OFFICIAL_WILAYAS } from '../src/lib/orientation/data/wilayas.ts';
import { OFFICIAL_FIELDS } from '../src/lib/orientation/data/fields.ts';
import { OFFICIAL_BAC_STREAMS } from '../src/lib/orientation/data/streams.ts';

console.log('=== OFFICIAL DATA STATS AUDIT ===');
console.log(`Wilayas count: ${OFFICIAL_WILAYAS.length}`);
console.log(`Streams count: ${OFFICIAL_BAC_STREAMS.length}`);
console.log(`Fields count: ${OFFICIAL_FIELDS.length}`);
console.log(`Institutions count: ${OFFICIAL_INSTITUTIONS.length}`);
console.log(`Programs count: ${OFFICIAL_PROGRAMS.length}`);

let totalOffers = 0;
let totalEligibilityRules = 0;
let totalWeightedFormulas = 0;
let totalCutoffs = 0;
let cutoffs2025 = 0;
let cutoffs2024 = 0;
let cutoffsOther = 0;

const programsSummary = [];
const formulasSet = new Map();
const institutionTypes = new Map();
const streamRulesCount = new Map();

for (const inst of OFFICIAL_INSTITUTIONS) {
  institutionTypes.set(inst.institutionType, (institutionTypes.get(inst.institutionType) || 0) + 1);
}

for (const prog of OFFICIAL_PROGRAMS) {
  const progOffers = prog.institutions?.length || 0;
  totalOffers += progOffers;
  const rules = prog.eligibilityRules?.length || 0;
  totalEligibilityRules += rules;

  for (const r of (prog.eligibilityRules || [])) {
    streamRulesCount.set(r.bacStreamId, (streamRulesCount.get(r.bacStreamId) || 0) + 1);
    if (r.weightedFormula) {
      totalWeightedFormulas++;
      const key = `${r.weightedFormula.expressionFr} | Div: ${r.weightedFormula.divisor}`;
      if (!formulasSet.has(key)) {
        formulasSet.set(key, {
          expressionFr: r.weightedFormula.expressionFr,
          expressionAr: r.weightedFormula.expressionAr,
          divisor: r.weightedFormula.divisor,
          terms: r.weightedFormula.terms,
          programs: [prog.nameFr],
        });
      } else {
        formulasSet.get(key).programs.push(prog.nameFr);
      }
    }
  }

  for (const c of (prog.cutoffs || [])) {
    totalCutoffs++;
    if (c.academicYear === '2025-2026' || c.academicYear === '2025') cutoffs2025++;
    else if (c.academicYear === '2024-2025' || c.academicYear === '2024') cutoffs2024++;
    else cutoffsOther++;
  }

  programsSummary.push({
    code: prog.programCode,
    nameAr: prog.nameAr,
    nameFr: prog.nameFr,
    fieldId: prog.fieldId,
    offersCount: progOffers,
    rulesCount: rules,
    cutoffsCount: prog.cutoffs?.length || 0,
    scopes: prog.institutions?.map(i => i.registrationScope) || [],
  });
}

console.log('\n--- DETAILED COUNTS ---');
console.log(`Total Institution Offers: ${totalOffers}`);
console.log(`Total Eligibility Rules: ${totalEligibilityRules}`);
console.log(`Total Weighted Formulas used: ${totalWeightedFormulas}`);
console.log(`Unique Formulas: ${formulasSet.size}`);
console.log(`Total Cutoffs: ${totalCutoffs} (2025: ${cutoffs2025}, 2024: ${cutoffs2024}, Other: ${cutoffsOther})`);

console.log('\n--- INSTITUTION TYPES ---');
for (const [t, c] of institutionTypes.entries()) {
  console.log(`  ${t}: ${c}`);
}

console.log('\n--- RULES PER STREAM ---');
for (const [s, c] of streamRulesCount.entries()) {
  console.log(`  ${s}: ${c}`);
}

console.log('\n--- UNIQUE WEIGHTED FORMULAS ---');
for (const [k, f] of formulasSet.entries()) {
  console.log(`  Formula: ${k}`);
  console.log(`  Ar: ${f.expressionAr}`);
  console.log(`  Programs (${f.programs.length}): ${f.programs.slice(0, 3).join(', ')}${f.programs.length > 3 ? '...' : ''}`);
}

console.log('\n--- PROGRAMS INVENTORY ---');
for (const p of programsSummary) {
  console.log(`  [Code ${p.code}] ${p.nameFr} (${p.nameAr}) - Field: ${p.fieldId}, Offers: ${p.offersCount}, Rules: ${p.rulesCount}, Cutoffs: ${p.cutoffsCount}`);
}
