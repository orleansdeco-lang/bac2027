import { OFFICIAL_PROGRAMS } from '../src/lib/orientation/data/programs.ts';
import fs from 'fs';

const details = OFFICIAL_PROGRAMS.map(p => ({
  id: p.id,
  code: p.programCode,
  nameAr: p.nameAr,
  nameFr: p.nameFr,
  trainingType: p.trainingType,
  degreeType: p.degreeType,
  durationYears: p.durationYears,
  academicYear: p.academicYear,
  institutionsCount: p.institutions?.length || 0,
  institutions: p.institutions?.map(i => ({
    nameAr: i.institution.nameAr,
    nameFr: i.institution.nameFr,
    type: i.institution.institutionType,
    scope: i.registrationScope,
    eligibleWilayasCount: i.eligibleWilayas?.length || 0,
    eligibleWilayas: i.eligibleWilayas || [],
  })),
  rulesCount: p.eligibilityRules?.length || 0,
  rules: p.eligibilityRules?.map(r => ({
    stream: r.bacStreamId,
    priority: r.priority,
    rankingBasis: r.rankingBasis,
    minGenAvg: r.minimumGeneralAverage,
    minWeightedAvg: r.minimumWeightedAverage,
    mathMin: r.mathematicsMin,
    physMin: r.physicsMin,
    natSciMin: r.naturalSciencesMin,
    arabicMin: r.arabicMin,
    frenchMin: r.frenchMin,
    englishMin: r.englishMin,
    requiredSubject: r.requiredSubject,
    requiredSubjectMin: r.requiredSubjectMin,
    formulaFr: r.weightedFormula?.expressionFr,
    formulaAr: r.weightedFormula?.expressionAr,
    dataConfidence: r.dataConfidence,
    additionalConditions: r.additionalConditions,
  })),
  cutoffsCount: p.cutoffs?.length || 0,
  cutoffs: p.cutoffs?.map(c => ({
    year: c.academicYear,
    institutionId: c.institutionId,
    stream: c.bacStreamId,
    priority: c.priority,
    generalCutoff: c.cutoffGeneralAverage,
    weightedCutoff: c.cutoffWeightedAverage,
    source: c.source,
    sourceUrl: c.sourceUrl,
    isOfficial: c.isOfficial,
  })),
}));

fs.writeFileSync('scripts/programs_audit_dump.json', JSON.stringify(details, null, 2), 'utf-8');
console.log('Dumped all 15 programs to scripts/programs_audit_dump.json');
