import { OFFICIAL_PROGRAMS } from '../src/lib/orientation/data/programs.ts';

for (const p of OFFICIAL_PROGRAMS) {
  console.log(`\n================================================================`);
  console.log(`PROGRAM [${p.programCode}] ${p.nameFr} (${p.nameAr})`);
  console.log(`Field: ${p.fieldId} | Degree: ${p.degreeType} | Duration: ${p.durationYears}y`);
  console.log(`Offers (${p.institutions?.length || 0}):`);
  for (const inst of (p.institutions || [])) {
    console.log(`  - ${inst.institution.shortName} | Scope: ${inst.registrationScope} | Wilayas: ${inst.eligibleWilayas ? inst.eligibleWilayas.join(',') : 'ALL'}`);
  }
  console.log(`Rules (${p.eligibilityRules?.length || 0}):`);
  for (const r of (p.eligibilityRules || [])) {
    console.log(`  - Stream: ${r.bacStreamId} | Priority: ${r.priority} | Ranking: ${r.rankingBasis}`);
    console.log(`    MinGenAvg: ${r.minimumGeneralAverage} | MinWeightedAvg: ${r.minimumWeightedAverage}`);
    console.log(`    Subject Mins: Math=${r.mathematicsMin}, Phys=${r.physicsMin}, NatSci=${r.naturalSciencesMin}, Arabic=${r.arabicMin}, French=${r.frenchMin}, English=${r.englishMin}`);
    if (r.requiredSubject) console.log(`    Required Subject: ${r.requiredSubject} >= ${r.requiredSubjectMin}`);
    if (r.weightedFormula) console.log(`    Formula: ${r.weightedFormula.expressionFr} [Ar: ${r.weightedFormula.expressionAr}] Div: ${r.weightedFormula.divisor}`);
    if (r.additionalConditions?.length) console.log(`    Additional Conditions: ${JSON.stringify(r.additionalConditions)}`);
  }
}
