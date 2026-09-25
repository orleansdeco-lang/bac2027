// ==============================================================================
// src/lib/orientation/orientation-engine.ts
// Authoritative Algerian Higher Education Orientation Evaluation Engine
// Strictly grounded in MESRS Official Circulars and Verified Ministerial Texts
// Invariants:
// 1. Strict separation: Legal Eligibility != Ranking Score != Historical Guidance
// 2. Data-driven formulas: Exact MESRS formulas with Bac General Average coefficients
// 3. No arbitrary heuristics: -0.50 rule removed; historical cutoffs never alter eligibility
// 4. Missing data: Returns UNKNOWN, never converts to 0 or falsifies eligibility
// ==============================================================================

import {
  StudentBacProfile,
  Program,
  InstitutionOffer,
  AdmissionRule,
  ProgramEvaluationResult,
  OrientationReport,
  EligibilityStatus,
  HistoricalComparison,
  WeightedFormula,
  BacSubjectCode,
  DataTrustStatus,
} from '@/types/orientation';
import { isSubjectApplicableToStream } from './data/streams';
import { getSource } from './data/sources';

export const OFFICIAL_ORIENTATION_YEAR = '2026-2027';
export const OFFICIAL_CIRCULAR_REF = 'المنشور الوزاري رقم 01 المؤرخ في 11 جويلية 2024 والمحيّن لدورة 2026 - وزارة التعليم العالي والبحث العلمي';
export const OFFICIAL_DISCLAIMER = 'تنبيه نظام التوجيه الرسمي: استيفاء الشروط البيداغوجية يمنحك الحق في الترشح قانوناً (الأهلية)، بينما القبول النهائي يخضع للترتيب التنافسي المباشر بحسب المقاعد البيداغوجية المتاحة ورغبات حاملي شهادة البكالوريا الجدد. معدلات السنوات السابقة هي مؤشرات استرشادية ولا تشكل ضماناً للقبول.';

/**
 * Maps subject identifier to user grade
 */
export function getSubjectGrade(grades: StudentBacProfile['grades'], subject: BacSubjectCode): number | null {
  if (!grades) return null;
  switch (subject) {
    case 'math':
      return grades.mathematics ?? null;
    case 'physics':
      return grades.physics ?? null;
    case 'natural_sciences':
      return grades.naturalSciences ?? null;
    case 'arabic':
      return grades.arabic ?? null;
    case 'french':
      return grades.french ?? null;
    case 'english':
      return grades.english ?? null;
    case 'philosophy':
      return grades.philosophy ?? null;
    case 'history_geo':
      return grades.historyGeo ?? null;
    case 'accounting':
      return grades.accounting ?? null;
    default:
      return null;
  }
}

/**
 * Translates subject key to Arabic label
 */
export function getSubjectArabicName(subject: BacSubjectCode | string): string {
  switch (subject) {
    case 'general_average':
      return 'المعدل العام للبكالوريا';
    case 'math':
      return 'الرياضيات';
    case 'physics':
      return 'العلوم الفيزيائية';
    case 'natural_sciences':
      return 'علوم الطبيعة والحياة';
    case 'arabic':
      return 'اللغة العربية';
    case 'french':
      return 'اللغة الفرنسية';
    case 'english':
      return 'اللغة الإنجليزية';
    case 'philosophy':
      return 'الفلسفة';
    case 'history_geo':
      return 'التاريخ والجغرافيا';
    case 'accounting':
      return 'التسيير المحاسبي والمالي';
    default:
      return subject;
  }
}

/**
 * Calculates authoritative weighted average from structured formula terms
 * Exact official formula: Sum(term_value * coeff) / divisor
 */
export function calculateWeightedAverage(
  formula: WeightedFormula | null,
  generalAverage: number,
  grades?: StudentBacProfile['grades']
): number | null {
  if (!formula || !formula.terms || formula.terms.length === 0) {
    return generalAverage;
  }

  let numerator = 0;

  for (const term of formula.terms) {
    if (term.subject === 'general_average') {
      numerator += generalAverage * term.coefficient;
    } else {
      const grade = getSubjectGrade(grades, term.subject);
      if (grade === null || isNaN(grade)) {
        return null; // Missing required subject grade for formula
      }
      numerator += grade * term.coefficient;
    }
  }

  const result = numerator / formula.divisor;
  return Math.round(result * 100) / 100;
}

/**
 * Evaluates a single program offer for a given student baccalaureate profile
 */
export function evaluateProgramOffer(
  student: StudentBacProfile,
  program: Program,
  offer: InstitutionOffer
): ProgramEvaluationResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const additionalRequirements: string[] = [];
  let missingRequiredGrade = false;

  // 1. Find admission rule matching student's stream
  const rule = program.eligibilityRules?.find(r => r.bacStreamId === student.streamId) || null;

  if (!rule) {
    blockers.push(`شعبة البكالوريا (${student.streamId}) غير مقبولة في هذا التخصص وفق المنشور الوزاري.`);
    return {
      program,
      institutionOffer: offer,
      rule: null,
      eligibilityStatus: 'NOT_ELIGIBLE',
      calculatedWeightedAverage: null,
      studentAverageUsed: student.generalAverage,
      priority: null,
      reasons,
      blockers,
      warnings,
      historicalComparison: 'NO_HISTORICAL_DATA',
      historicalCutoffs: [],
      additionalRequirements,
      officialDisclaimer: OFFICIAL_DISCLAIMER,
      dataStatus: 'VERIFIED',
      source: program.sourceId ? getSource(program.sourceId) : null,
    };
  }

  // 2. Priority in Circular
  reasons.push(`الأولوية في الترتيب: ${rule.priority === 1 ? 'الأولوية 1 (أولوية قصوى)' : `الأولوية ${rule.priority}`}`);

  // 3. Geographic Scope Check (Wilaya of High School Baccalaureate)
  if (offer.registrationScope === 'national') {
    reasons.push('التسجيل وطني: متاح لحاملي البكالوريا من جميع ولايات الوطن (58 ولاية).');
  } else if (offer.registrationScope === 'regional' || offer.registrationScope === 'local') {
    if (offer.eligibleWilayas && offer.eligibleWilayas.length > 0) {
      if (!offer.eligibleWilayas.includes(student.wilayaId)) {
        blockers.push(`التسجيل في هذه المؤسسة ${offer.registrationScope === 'regional' ? 'جهوي' : 'محلي'} وغير متاح لولاية نيل البكالوريا (ولاية رقم ${student.wilayaId}).`);
      } else {
        reasons.push(`الدائرة الجغرافية: ولاية نيل البكالوريا (${student.wilayaId}) تقع ضمن النطاق ${offer.registrationScope === 'regional' ? 'الجهوي' : 'المحلي'} المؤهل.`);
      }
    } else if (offer.institution.wilayaId !== student.wilayaId && offer.registrationScope === 'local') {
      blockers.push(`التسجيل محلي مخصص لحاملي بكالوريا ولاية ${offer.institution.wilayaId} فقط.`);
    } else if (offer.registrationScope === 'regional' && (!offer.eligibleWilayas || offer.eligibleWilayas.length === 0)) {
      warnings.push('التسجيل جهوي: لم تحدد قائمة الولايات المؤهلة بدقة في الملحق الجغرافي المسجل.');
    }
  }

  // 4. Minimum General Average Check
  if (rule.minimumGeneralAverage !== null) {
    if (student.generalAverage < rule.minimumGeneralAverage) {
      blockers.push(`المعدل العام المحصل عليه (${student.generalAverage.toFixed(2)}) أقل من الحد الأدنى القانوني للترشح (${rule.minimumGeneralAverage.toFixed(2)}).`);
    } else {
      reasons.push(`استيفاء شرط المعدل العام الأدنى: ${student.generalAverage.toFixed(2)} >= ${rule.minimumGeneralAverage.toFixed(2)}.`);
    }
  }

  // 5. Subject Specific Minimum Thresholds
  if (rule.mathematicsMin !== null) {
    const mathGrade = getSubjectGrade(student.grades, 'math');
    if (mathGrade !== null) {
      if (mathGrade < rule.mathematicsMin) {
        blockers.push(`نقطة الرياضيات (${mathGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.mathematicsMin.toFixed(2)}).`);
      } else {
        reasons.push(`استيفاء شرط مادة الرياضيات: ${mathGrade.toFixed(2)} >= ${rule.mathematicsMin.toFixed(2)}.`);
      }
    } else {
      missingRequiredGrade = true;
      warnings.push(`يشترط الحصول على علامة >= ${rule.mathematicsMin.toFixed(2)} في الرياضيات. لم يتم إدخال العلامة بعد.`);
    }
  }

  if (rule.physicsMin !== null) {
    const physGrade = getSubjectGrade(student.grades, 'physics');
    if (physGrade !== null) {
      if (physGrade < rule.physicsMin) {
        blockers.push(`نقطة العلوم الفيزيائية (${physGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.physicsMin.toFixed(2)}).`);
      } else {
        reasons.push(`استيفاء شرط مادة الفيزياء: ${physGrade.toFixed(2)} >= ${rule.physicsMin.toFixed(2)}.`);
      }
    } else {
      missingRequiredGrade = true;
      warnings.push(`يشترط الحصول على علامة >= ${rule.physicsMin.toFixed(2)} في الفيزياء. لم يتم إدخال العلامة بعد.`);
    }
  }

  // Natural sciences: verify applicability to stream first!
  if (rule.naturalSciencesMin !== null && isSubjectApplicableToStream(student.streamId, 'natural_sciences')) {
    const natGrade = getSubjectGrade(student.grades, 'natural_sciences');
    if (natGrade !== null) {
      if (natGrade < rule.naturalSciencesMin) {
        blockers.push(`نقطة علوم الطبيعة والحياة (${natGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.naturalSciencesMin.toFixed(2)}).`);
      } else {
        reasons.push(`استيفاء شرط مادة العلوم الطبيعية: ${natGrade.toFixed(2)} >= ${rule.naturalSciencesMin.toFixed(2)}.`);
      }
    } else {
      missingRequiredGrade = true;
      warnings.push(`يشترط الحصول على علامة >= ${rule.naturalSciencesMin.toFixed(2)} في علوم الطبيعة والحياة.`);
    }
  }

  if (rule.englishMin !== null) {
    const engGrade = getSubjectGrade(student.grades, 'english');
    if (engGrade !== null) {
      if (engGrade < rule.englishMin) {
        blockers.push(`نقطة اللغة الإنجليزية (${engGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.englishMin.toFixed(2)}).`);
      } else {
        reasons.push(`استيفاء شرط مادة الإنجليزية: ${engGrade.toFixed(2)} >= ${rule.englishMin.toFixed(2)}.`);
      }
    } else {
      missingRequiredGrade = true;
      warnings.push(`يشترط الحصول على علامة >= ${rule.englishMin.toFixed(2)} في اللغة الإنجليزية.`);
    }
  }

  if (rule.requiredSubject !== null && rule.requiredSubjectMin !== null) {
    const reqSub = rule.requiredSubject as BacSubjectCode;
    if (isSubjectApplicableToStream(student.streamId, reqSub)) {
      const reqGrade = getSubjectGrade(student.grades, reqSub);
      const subName = getSubjectArabicName(reqSub);
      if (reqGrade !== null) {
        if (reqGrade < rule.requiredSubjectMin) {
          blockers.push(`نقطة ${subName} (${reqGrade.toFixed(2)}) أقل من الحد الأدنى المشترط (${rule.requiredSubjectMin.toFixed(2)}).`);
        } else {
          reasons.push(`استيفاء شرط مادة ${subName}: ${reqGrade.toFixed(2)} >= ${rule.requiredSubjectMin.toFixed(2)}.`);
        }
      } else {
        missingRequiredGrade = true;
        warnings.push(`يشترط الحصول على ${rule.requiredSubjectMin.toFixed(2)} أو أكثر في مادة ${subName}.`);
      }
    }
  }

  // 6. Calculate Weighted Average
  const calculatedWeighted = calculateWeightedAverage(rule.weightedFormula, student.generalAverage, student.grades);

  if (rule.weightedFormula) {
    if (calculatedWeighted !== null) {
      reasons.push(`المعدل الموزون المحسوب وفق المعادلة الوزارية: ${calculatedWeighted.toFixed(2)} [صيغة الحساب: ${rule.weightedFormula.expressionAr}].`);
      if (rule.minimumWeightedAverage !== null) {
        if (calculatedWeighted < rule.minimumWeightedAverage) {
          blockers.push(`المعدل الموزون (${calculatedWeighted.toFixed(2)}) أقل من العتبة الدنيا المحددة في المنشور (${rule.minimumWeightedAverage.toFixed(2)}).`);
        }
      }
    } else {
      warnings.push(`الترتيب يعتمد على المعدل الموزون (${rule.weightedFormula.expressionAr}). يرجى إدخال علامات المواد لحسابه.`);
    }
  }

  // 7. Additional conditions (ENS interviews, medical check, age limit)
  let hasConditionalRequirements = false;
  if (rule.additionalConditions && rule.additionalConditions.length > 0) {
    for (const cond of rule.additionalConditions) {
      additionalRequirements.push(`${cond.titleAr}: ${cond.descriptionAr}`);
      if (cond.type === 'medical_interview' || cond.type === 'physical_aptitude') {
        hasConditionalRequirements = true;
      }
    }
  }

  // 8. Determine Student Score used for ranking
  const studentScore = (rule.rankingBasis === 'weighted_average' && calculatedWeighted !== null)
    ? calculatedWeighted
    : student.generalAverage;

  // 9. Determine Strict Legal Eligibility Status
  let eligibilityStatus: EligibilityStatus = 'ELIGIBLE';

  if (blockers.length > 0) {
    eligibilityStatus = 'NOT_ELIGIBLE';
  } else if (missingRequiredGrade || (rule.rankingBasis === 'weighted_average' && calculatedWeighted === null && rule.weightedFormula)) {
    eligibilityStatus = 'UNKNOWN'; // Missing required subject grades to judge eligibility/formula
  } else if (hasConditionalRequirements) {
    eligibilityStatus = 'CONDITIONAL'; // Eligible, but requires interview / medical exam
  }

  // 10. Historical Cutoffs Analysis (Separated, purely informational)
  const cutoffs = getHistoricalCutoffs(program, offer.institution.id, student.streamId);
  let historicalComparison: HistoricalComparison = 'NO_HISTORICAL_DATA';

  if (cutoffs.length > 0) {
    const latestCutoff = cutoffs[0];
    const targetCutoff = (rule.rankingBasis === 'weighted_average' && latestCutoff.weightedCutoff !== null)
      ? latestCutoff.weightedCutoff
      : latestCutoff.generalCutoff;

    if (targetCutoff !== null) {
      const diff = studentScore - targetCutoff;
      if (diff >= 0) {
        historicalComparison = 'ABOVE_HISTORICAL_CUTOFF';
        reasons.push(`مؤشر تاريخي: معدلك (${studentScore.toFixed(2)}) أعلى من آخر معدل قبول مسجل لهذه الشعبة (${targetCutoff.toFixed(2)}).`);
      } else if (diff >= -0.25) {
        historicalComparison = 'NEAR_HISTORICAL_CUTOFF';
        warnings.push(`مؤشر تاريخي: معدلك (${studentScore.toFixed(2)}) قريب من آخر معدل قبول مسجل (${targetCutoff.toFixed(2)}).`);
      } else {
        historicalComparison = 'BELOW_HISTORICAL_CUTOFF';
        warnings.push(`مؤشر تاريخي: معدلك (${studentScore.toFixed(2)}) يمنحك حق الترشح قانوناً، لكنه أقل من معدل القبول الأخير (${targetCutoff.toFixed(2)}).`);
      }
    }
  }

  const dataStatus: DataTrustStatus = rule.verificationStatus || 'VERIFIED';
  const source = rule.sourceId ? getSource(rule.sourceId) : (program.sourceId ? getSource(program.sourceId) : null);

  return {
    program,
    institutionOffer: offer,
    rule,
    eligibilityStatus,
    calculatedWeightedAverage: calculatedWeighted,
    studentAverageUsed: studentScore,
    priority: rule.priority,
    reasons,
    blockers,
    warnings,
    historicalComparison,
    historicalCutoffs: cutoffs,
    additionalRequirements,
    officialDisclaimer: OFFICIAL_DISCLAIMER,
    dataStatus,
    source,
  };
}

/**
 * Extracts and sorts historical cutoffs for a program, institution, and BAC stream
 */
function getHistoricalCutoffs(program: Program, institutionId: string, streamId: string) {
  if (!program.cutoffs || program.cutoffs.length === 0) return [];

  return program.cutoffs
    .filter(c => {
      // Must match institution if specified
      if (c.institutionId && c.institutionId !== institutionId) return false;
      // Must match stream if specified (or unstratified)
      if (c.bacStreamId && c.bacStreamId !== streamId) return false;
      // Only include verified or official cutoffs
      return c.isOfficial && c.verificationStatus !== 'LEGACY_UNVERIFIED';
    })
    .sort((a, b) => b.academicYear.localeCompare(a.academicYear))
    .map(c => ({
      year: c.academicYear,
      stream: c.bacStreamId,
      generalCutoff: c.cutoffGeneralAverage,
      weightedCutoff: c.cutoffWeightedAverage,
      source: c.source,
      isOfficial: c.isOfficial,
    }));
}

/**
 * Evaluates student profile across all programs in catalog
 */
export function evaluateAllPrograms(
  student: StudentBacProfile,
  programs: Program[]
): OrientationReport {
  const results: ProgramEvaluationResult[] = [];

  for (const prog of programs) {
    if (!prog.isActive) continue;

    const offers = prog.institutions && prog.institutions.length > 0
      ? prog.institutions
      : [];

    for (const offer of offers) {
      const evaluation = evaluateProgramOffer(student, prog, offer);
      results.push(evaluation);
    }
  }

  // Sort results by:
  // 1. Eligibility Status (ELIGIBLE > CONDITIONAL > UNKNOWN > NOT_ELIGIBLE)
  // 2. Stream Priority (Priority 1 first)
  // 3. Historical Comparison (ABOVE > NEAR > BELOW > NO_DATA)
  // 4. Student Score
  const statusRank: Record<EligibilityStatus, number> = {
    ELIGIBLE: 1,
    CONDITIONAL: 2,
    UNKNOWN: 3,
    INSUFFICIENT_DATA: 4,
    NOT_ELIGIBLE: 5,
  };

  const comparisonRank: Record<HistoricalComparison, number> = {
    ABOVE_HISTORICAL_CUTOFF: 1,
    NEAR_HISTORICAL_CUTOFF: 2,
    NO_HISTORICAL_DATA: 3,
    BELOW_HISTORICAL_CUTOFF: 4,
  };

  results.sort((a, b) => {
    const rankDiff = statusRank[a.eligibilityStatus] - statusRank[b.eligibilityStatus];
    if (rankDiff !== 0) return rankDiff;

    const pA = a.priority ?? 99;
    const pB = b.priority ?? 99;
    if (pA !== pB) return pA - pB;

    const compDiff = comparisonRank[a.historicalComparison] - comparisonRank[b.historicalComparison];
    if (compDiff !== 0) return compDiff;

    return b.studentAverageUsed - a.studentAverageUsed;
  });

  const eligibleCount = results.filter(r => r.eligibilityStatus === 'ELIGIBLE').length;
  const conditionalCount = results.filter(r => r.eligibilityStatus === 'CONDITIONAL').length;
  const unknownCount = results.filter(r => r.eligibilityStatus === 'UNKNOWN').length;
  const notEligibleCount = results.filter(r => r.eligibilityStatus === 'NOT_ELIGIBLE').length;

  return {
    studentProfile: student,
    totalEvaluated: results.length,
    eligibleCount,
    conditionalCount,
    unknownCount,
    notEligibleCount,
    programs: results,
    generatedAt: new Date().toISOString(),
    officialYear: OFFICIAL_ORIENTATION_YEAR,
    circularReference: OFFICIAL_CIRCULAR_REF,
    dataTrustStatus: 'VERIFIED',
  };
}
