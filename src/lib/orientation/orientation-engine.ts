// ==============================================================================
// src/lib/orientation/orientation-engine.ts
// Authoritative Algerian Higher Education Orientation Evaluation Engine
// Grounded strictly in the Official Ministerial Circular (circulaire.mesrs.dz)
// ==============================================================================

import {
  StudentBacProfile,
  Program,
  InstitutionOffer,
  AdmissionRule,
  ProgramEvaluationResult,
  OrientationReport,
  EligibilityStatus,
  WeightedFormula,
} from '@/types/orientation';

export const OFFICIAL_ORIENTATION_YEAR = '2026-2027';
export const OFFICIAL_CIRCULAR_REF = 'المنشور الوزاري رقم 01 المؤرخ في جويلية 2024 والمعدل لدورة 2026 - وزارة التعليم العالي والبحث العلمي';
export const OFFICIAL_DISCLAIMER = 'تنبيه نظام التوجيه الرسمي: استيفاء الشروط البيداغوجية يمنحك الحق في الترشح فقط (الأهلية القانونية)، بينما القبول النهائي يخضع للترتيب التنافسي المباشر بحسب المقاعد البيداغوجية المتاحة ورغبات حاملي شهادة البكالوريا الجدد.';

/**
 * Maps subject identifier to user grade
 */
function getSubjectGrade(grades: StudentBacProfile['grades'], subject: string): number | null {
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
export function getSubjectArabicName(subject: string): string {
  switch (subject) {
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
 * Calculates official weighted average from formula
 */
export function calculateWeightedAverage(
  formula: WeightedFormula | null,
  generalAverage: number,
  grades?: StudentBacProfile['grades']
): number | null {
  if (!formula || !formula.terms || formula.terms.length === 0) {
    return generalAverage;
  }

  let totalTermsWeight = 0;
  let numerator = 0;

  for (const term of formula.terms) {
    const grade = getSubjectGrade(grades, term.subject);
    if (grade === null || isNaN(grade)) {
      return null; // Missing required subject grade
    }
    numerator += grade * term.coefficient;
    totalTermsWeight += term.coefficient;
  }

  // If formula divisor > sum of coefficients, the remainder is usually the general average
  // e.g. (GeneralAverage + 2 * English) / 3
  if (formula.divisor > totalTermsWeight) {
    const generalWeight = formula.divisor - totalTermsWeight;
    numerator += generalAverage * generalWeight;
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
      historicalCutoffs: getHistoricalCutoffs(program, offer.institution.id),
      additionalRequirements,
      officialDisclaimer: OFFICIAL_DISCLAIMER,
    };
  }

  // 2. Priority info
  reasons.push(`الأولوية في الترتيب: ${rule.priority === 1 ? 'الأولوية 1 (أولوية قصوى)' : `الأولوية ${rule.priority}`}`);

  // 3. Geographic Scope Check
  let geoEligible = true;
  if (offer.registrationScope === 'national') {
    reasons.push('التسجيل وطني: متاح لجميع ولايات الوطن (58 ولاية).');
  } else if (offer.registrationScope === 'regional' || offer.registrationScope === 'local') {
    if (offer.eligibleWilayas && offer.eligibleWilayas.length > 0) {
      if (!offer.eligibleWilayas.includes(student.wilayaId)) {
        geoEligible = false;
        blockers.push(`التسجيل في هذه المؤسسة ${offer.registrationScope === 'regional' ? 'جهوي' : 'محلي'} وغير متاح لولايتك (ولاية رقم ${student.wilayaId}).`);
      } else {
        reasons.push(`الدائرة الجغرافية: ولايتك (${student.wilayaId}) تقع ضمن النطاق ${offer.registrationScope === 'regional' ? 'الجهوي' : 'المحلي'} المؤهل.`);
      }
    } else if (offer.institution.wilayaId !== student.wilayaId && offer.registrationScope === 'local') {
      geoEligible = false;
      blockers.push(`التسجيل محلي مخصص لحاملي بكالوريا ولاية ${offer.institution.wilayaId} فقط.`);
    }
  }

  // 4. General Minimum Average Check
  if (rule.minimumGeneralAverage !== null) {
    if (student.generalAverage < rule.minimumGeneralAverage) {
      blockers.push(`المعدل العام المحصل عليه (${student.generalAverage.toFixed(2)}) أقل من الحد الأدنى القانوني للترشح (${rule.minimumGeneralAverage.toFixed(2)}).`);
    } else {
      reasons.push(`استيفاء شرط المعدل العام الأدنى: ${student.generalAverage.toFixed(2)} >= ${rule.minimumGeneralAverage.toFixed(2)}.`);
    }
  }

  // 5. Subject Specific Checks (Math, Physics, Sciences, Languages)
  if (rule.mathematicsMin !== null) {
    const mathGrade = getSubjectGrade(student.grades, 'math');
    if (mathGrade !== null) {
      if (mathGrade < rule.mathematicsMin) {
        blockers.push(`نقطة الرياضيات (${mathGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.mathematicsMin.toFixed(2)}).`);
      } else {
        reasons.push(`استيفاء شرط مادة الرياضيات: ${mathGrade.toFixed(2)} >= ${rule.mathematicsMin.toFixed(2)}.`);
      }
    } else {
      warnings.push(`يشترط الحصول على علامة >= ${rule.mathematicsMin.toFixed(2)} في الرياضيات. لم يتم إدخال العلامة.`);
    }
  }

  if (rule.physicsMin !== null) {
    const physGrade = getSubjectGrade(student.grades, 'physics');
    if (physGrade !== null) {
      if (physGrade < rule.physicsMin) {
        blockers.push(`نقطة العلوم الفيزيائية (${physGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.physicsMin.toFixed(2)}).`);
      }
    } else {
      warnings.push(`يشترط الحصول على علامة >= ${rule.physicsMin.toFixed(2)} في الفيزياء.`);
    }
  }

  if (rule.requiredSubject !== null && rule.requiredSubjectMin !== null) {
    const reqGrade = getSubjectGrade(student.grades, rule.requiredSubject);
    const subName = getSubjectArabicName(rule.requiredSubject);
    if (reqGrade !== null) {
      if (reqGrade < rule.requiredSubjectMin) {
        blockers.push(`نقطة ${subName} (${reqGrade.toFixed(2)}) أقل من الحد الأدنى المشترط (${rule.requiredSubjectMin.toFixed(2)}).`);
      }
    } else {
      warnings.push(`يشترط الحصول على ${rule.requiredSubjectMin.toFixed(2)} أو أكثر في مادة ${subName}.`);
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
      warnings.push(`التصنيف يعتمد على المعدل الموزون (${rule.weightedFormula.expressionAr}). يرجى ملء نقاط المواد لحسابه بدقة.`);
    }
  }

  // 7. Additional conditions (e.g. ENS interviews, age limit)
  if (rule.additionalConditions && rule.additionalConditions.length > 0) {
    for (const cond of rule.additionalConditions) {
      additionalRequirements.push(`${cond.titleAr}: ${cond.descriptionAr}`);
    }
  }

  // 8. Historical Cutoffs Analysis
  const cutoffs = getHistoricalCutoffs(program, offer.institution.id);
  const latestCutoff = cutoffs[0]; // Recent year

  const studentScore = (rule.rankingBasis === 'weighted_average' && calculatedWeighted !== null)
    ? calculatedWeighted
    : student.generalAverage;

  // 9. Determine Final Eligibility Status
  let eligibilityStatus: EligibilityStatus = 'ELIGIBLE';

  if (blockers.length > 0) {
    eligibilityStatus = 'NOT_ELIGIBLE';
  } else if (rule.rankingBasis === 'weighted_average' && calculatedWeighted === null && rule.weightedFormula) {
    eligibilityStatus = 'UNKNOWN';
  } else if (latestCutoff) {
    const targetCutoff = (rule.rankingBasis === 'weighted_average' && latestCutoff.weightedCutoff !== null)
      ? latestCutoff.weightedCutoff
      : latestCutoff.generalCutoff;

    if (targetCutoff !== null) {
      const diff = studentScore - targetCutoff;
      if (diff >= -0.50) {
        eligibilityStatus = 'COMPETITIVE';
        reasons.push(`معدلك (${studentScore.toFixed(2)}) منافس مقارنة بمعدل قبول السنة السابقة (${targetCutoff.toFixed(2)}).`);
      } else {
        eligibilityStatus = 'STRETCH';
        warnings.push(`معدلك (${studentScore.toFixed(2)}) يمنحك حق الترشح قانوناً، لكنه أقل من معدل القبول الأخير (${targetCutoff.toFixed(2)}).`);
      }
    }
  }

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
    historicalCutoffs: cutoffs,
    additionalRequirements,
    officialDisclaimer: OFFICIAL_DISCLAIMER,
  };
}

/**
 * Extracts and sorts historical cutoffs for a program & institution
 */
function getHistoricalCutoffs(program: Program, institutionId: string) {
  if (!program.cutoffs || program.cutoffs.length === 0) return [];

  return program.cutoffs
    .filter(c => !c.institutionId || c.institutionId === institutionId)
    .sort((a, b) => b.academicYear.localeCompare(a.academicYear))
    .map(c => ({
      year: c.academicYear,
      generalCutoff: c.cutoffGeneralAverage,
      weightedCutoff: c.cutoffWeightedAverage,
    }));
}

/**
 * Full engine evaluation across all programs in the database/dataset
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
  // 1. Eligibility Status (COMPETITIVE > ELIGIBLE > STRETCH > UNKNOWN > NOT_ELIGIBLE)
  // 2. Stream Priority (Priority 1 first)
  // 3. Duration/Prestige or Student Score
  const statusRank: Record<EligibilityStatus, number> = {
    COMPETITIVE: 1,
    ELIGIBLE: 2,
    STRETCH: 3,
    UNKNOWN: 4,
    NOT_ELIGIBLE: 5,
  };

  results.sort((a, b) => {
    const rankDiff = statusRank[a.eligibilityStatus] - statusRank[b.eligibilityStatus];
    if (rankDiff !== 0) return rankDiff;

    const pA = a.priority ?? 99;
    const pB = b.priority ?? 99;
    if (pA !== pB) return pA - pB;

    return b.studentAverageUsed - a.studentAverageUsed;
  });

  const eligibleCount = results.filter(r => r.eligibilityStatus === 'ELIGIBLE' || r.eligibilityStatus === 'COMPETITIVE' || r.eligibilityStatus === 'STRETCH').length;
  const competitiveCount = results.filter(r => r.eligibilityStatus === 'COMPETITIVE').length;
  const stretchCount = results.filter(r => r.eligibilityStatus === 'STRETCH').length;
  const notEligibleCount = results.filter(r => r.eligibilityStatus === 'NOT_ELIGIBLE').length;

  return {
    studentProfile: student,
    totalEvaluated: results.length,
    eligibleCount,
    competitiveCount,
    stretchCount,
    notEligibleCount,
    programs: results,
    generatedAt: new Date().toISOString(),
    officialYear: OFFICIAL_ORIENTATION_YEAR,
    circularReference: OFFICIAL_CIRCULAR_REF,
  };
}
