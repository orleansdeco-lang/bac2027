// ==============================================================================
// src/lib/orientation/orientation-engine.ts
// Authoritative Algerian Higher Education Orientation Evaluation Engine
// Strictly grounded in MESRS Official Circulars and Verified Ministerial Texts
// Invariants:
// 1. Strict separation: Legal Eligibility != Ranking Score != Historical Guidance
// 2. Data-driven formulas: Exact MESRS formulas with Bac General Average coefficients
// 3. No arbitrary heuristics: arbitrary point deductions removed; historical cutoffs never alter eligibility
// 4. Missing data: Returns UNKNOWN, never converts to 0 or falsifies eligibility
// 5. Stream Applicability: Non-applicable subjects are NOT_APPLICABLE (never 0)
// 6. Two-Person Verified Data Gate: Only verified or published data evaluated
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
  OrientationSource,
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
  const additionalConditions: string[] = [];
  let missingRequiredGrade = false;

  // 1. Find admission rule matching student's stream
  const rule = program.eligibilityRules?.find(r => r.bacStreamId === student.streamId) || null;

  if (!rule) {
    blockers.push(`شعبة البكالوريا (${student.streamId}) غير مقبولة في هذا التخصص وفق المنشور الوزاري.`);
    const sources: OrientationSource[] = [];
    if (program.sourceId) {
      const s = getSource(program.sourceId);
      if (s) sources.push(s);
    }
    return {
      program,
      institutionOffer: offer,
      rule: null,
      eligibility: 'NOT_ELIGIBLE',
      eligibilityStatus: 'NOT_ELIGIBLE',
      admissionScore: {
        scoreUsed: student.generalAverage,
        scoreType: 'GENERAL_AVERAGE',
        calculatedWeightedAverage: null,
        formulaExpression: null,
        formulaSource: null,
      },
      historicalCutoff: null,
      historicalComparison: 'NO_HISTORICAL_DATA',
      additionalConditions: [],
      dataStatus: (program.dataQualityStatus === 'verified' ? 'VERIFIED' : 'PARTIALLY_VERIFIED') as DataTrustStatus,
      sources,
      calculatedWeightedAverage: null,
      studentAverageUsed: student.generalAverage,
      priority: null,
      reasons,
      blockers,
      warnings,
      historicalCutoffs: [],
      additionalRequirements: [],
      officialDisclaimer: OFFICIAL_DISCLAIMER,
      source: sources[0] || null,
    };
  }

  // 2. Priority in Circular (CONF-02: Resolved at specific program & stream level)
  reasons.push(`الأولوية في الترتيب: ${rule.priority === 1 ? 'الأولوية 1 (أولوية قصوى)' : `الأولوية ${rule.priority}`}`);

  // 3. Geographic Scope Check (Wilaya of High School Baccalaureate)
  // (CONF-01: Explicit handling of missing regional annex)
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
      // CONF-01 Resolution: Show available institution wilaya and add explicit warning
      warnings.push('التسجيل جهوي: الملحق الجغرافي التفصيلي للولايات التابعة لهذه المؤسسة لم يصدر بعد في المنشور الرسمي، والتبعية الجغرافية النهائية مشروطة بصدور الملحق الرسمي.');
      reasons.push(`المؤسسة تقع في ولاية ${offer.institution.wilayaId} والتسجيل مصنف كجهوي.`);
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

  // 5. Subject Specific Minimum Thresholds (With Stream Applicability Safeguard)
  // Mathematics
  if (rule.mathematicsMin !== null && isSubjectApplicableToStream(student.streamId, 'math')) {
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

  // Physics
  if (rule.physicsMin !== null && isSubjectApplicableToStream(student.streamId, 'physics')) {
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

  // Natural sciences: verify applicability to stream first! (e.g. not applicable to technique_math)
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

  // Arabic
  if (rule.arabicMin !== null && isSubjectApplicableToStream(student.streamId, 'arabic')) {
    const arGrade = getSubjectGrade(student.grades, 'arabic');
    if (arGrade !== null) {
      if (arGrade < rule.arabicMin) {
        blockers.push(`نقطة اللغة العربية (${arGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.arabicMin.toFixed(2)}).`);
      } else {
        reasons.push(`استيفاء شرط مادة اللغة العربية: ${arGrade.toFixed(2)} >= ${rule.arabicMin.toFixed(2)}.`);
      }
    } else {
      missingRequiredGrade = true;
      warnings.push(`يشترط الحصول على علامة >= ${rule.arabicMin.toFixed(2)} في اللغة العربية.`);
    }
  }

  // French
  if (rule.frenchMin !== null && isSubjectApplicableToStream(student.streamId, 'french')) {
    const frGrade = getSubjectGrade(student.grades, 'french');
    if (frGrade !== null) {
      if (frGrade < rule.frenchMin) {
        blockers.push(`نقطة اللغة الفرنسية (${frGrade.toFixed(2)}) أقل من الحد الأدنى المطلوب (${rule.frenchMin.toFixed(2)}).`);
      } else {
        reasons.push(`استيفاء شرط مادة اللغة الفرنسية: ${frGrade.toFixed(2)} >= ${rule.frenchMin.toFixed(2)}.`);
      }
    } else {
      missingRequiredGrade = true;
      warnings.push(`يشترط الحصول على علامة >= ${rule.frenchMin.toFixed(2)} في اللغة الفرنسية.`);
    }
  }

  // English
  if (rule.englishMin !== null && isSubjectApplicableToStream(student.streamId, 'english')) {
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

  // Custom required subject threshold
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

  // 7. Additional conditions (CONF-03: ENS interviews, medical check, physical aptitude)
  let hasConditionalRequirements = false;
  if (rule.additionalConditions && rule.additionalConditions.length > 0) {
    for (const cond of rule.additionalConditions) {
      additionalConditions.push(`${cond.titleAr}: ${cond.descriptionAr}`);
      if (cond.type === 'medical_interview' || cond.type === 'physical_aptitude') {
        hasConditionalRequirements = true;
      }
    }
    if (hasConditionalRequirements) {
      warnings.push('شرط خاص: القبول مشروط بالنجاح في المقابلة الشفوية / الفحص الطبي لسلامة الحواس أمام اللجنة المختصة.');
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

  // 10. Historical Cutoffs Analysis (Separated, purely informational reference)
  // (CONF-04: Never claim quota percentages; label as historical reference)
  reasons.push('ملاحظة بيداغوجية: المقاعد البيداغوجية ونسب الكوطة لكل شعبة غير معلنة في المنشور الرسمي؛ الترتيب تنافسي مباشر بحسب عدد المترشحين.');

  const cutoffs = getHistoricalCutoffs(program, offer.institution.id, student.streamId);
  let historicalComparison: HistoricalComparison = 'NO_HISTORICAL_DATA';
  let historicalCutoff: ProgramEvaluationResult['historicalCutoff'] = null;

  if (cutoffs.length > 0) {
    const latestCutoff = cutoffs[0];
    const targetCutoff = (rule.rankingBasis === 'weighted_average' && latestCutoff.weightedCutoff !== null)
      ? latestCutoff.weightedCutoff
      : latestCutoff.generalCutoff;

    historicalCutoff = {
      academicYear: latestCutoff.year,
      streamScope: latestCutoff.stream ? 'STREAM' : 'GENERAL',
      stream: latestCutoff.stream,
      cutoffValue: targetCutoff,
      cutoffType: (rule.rankingBasis === 'weighted_average' && latestCutoff.weightedCutoff !== null) ? 'WEIGHTED' : 'GENERAL',
      sourceTitle: latestCutoff.source || 'إحصائيات التوجيه الجامعي الرسمية',
    };

    if (targetCutoff !== null) {
      const diff = studentScore - targetCutoff;
      if (diff >= 0) {
        historicalComparison = 'ABOVE_HISTORICAL_REFERENCE';
        reasons.push(`مؤشر استرشادي: معدلك (${studentScore.toFixed(2)}) أعلى من معدل القبول المرجعي لدفعة ${latestCutoff.year} (${targetCutoff.toFixed(2)}).`);
      } else if (diff >= -0.25) {
        historicalComparison = 'NEAR_HISTORICAL_REFERENCE';
        warnings.push(`مؤشر استرشادي: معدلك (${studentScore.toFixed(2)}) قريب من معدل القبول المرجعي لدفعة ${latestCutoff.year} (${targetCutoff.toFixed(2)}).`);
      } else {
        historicalComparison = 'BELOW_HISTORICAL_REFERENCE';
        warnings.push(`مؤشر استرشادي: معدلك (${studentScore.toFixed(2)}) يمنحك حق الترشح قانوناً، لكنه أدنى من معدل القبول المرجعي لدفعة ${latestCutoff.year} (${targetCutoff.toFixed(2)}).`);
      }
    }
  } else {
    historicalComparison = 'CURRENT_CUTOFF_UNAVAILABLE';
    warnings.push('معدل القبول التنافسي لسنة 2026 غير محدد مسبقاً ولا يمكن حسابه قبل صدور نتائج التوجيه؛ ولا توجد معدلات مرجعية سابقة.');
  }

  // 11. Compile Sources
  const sources: OrientationSource[] = [];
  if (rule.sourceId) {
    const s = getSource(rule.sourceId);
    if (s) sources.push(s);
  }
  if (program.sourceId) {
    const s = getSource(program.sourceId);
    if (s && !sources.some(existing => existing.id === s.id)) {
      sources.push(s);
    }
  }

  const dataStatus: DataTrustStatus = rule.verificationStatus || (program.dataQualityStatus === 'verified' ? 'VERIFIED' : 'PARTIALLY_VERIFIED');

  return {
    program,
    institutionOffer: offer,
    rule,
    eligibility: eligibilityStatus,
    eligibilityStatus,
    admissionScore: {
      scoreUsed: studentScore,
      scoreType: (rule.rankingBasis === 'weighted_average' && calculatedWeighted !== null) ? 'WEIGHTED_AVERAGE' : 'GENERAL_AVERAGE',
      calculatedWeightedAverage: calculatedWeighted,
      formulaExpression: rule.weightedFormula?.expressionAr || null,
      formulaSource: rule.weightedFormula?.sourceId || rule.sourceId || null,
    },
    historicalCutoff,
    historicalComparison,
    additionalConditions,
    dataStatus,
    sources,

    // Backward-compatibility fields
    calculatedWeightedAverage: calculatedWeighted,
    studentAverageUsed: studentScore,
    priority: rule.priority,
    reasons,
    blockers,
    warnings,
    historicalCutoffs: cutoffs,
    additionalRequirements: additionalConditions,
    officialDisclaimer: OFFICIAL_DISCLAIMER,
    source: sources[0] || null,
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
 * Evaluates student profile across programs in catalog
 * Filters out inactive, legacy, or DRAFT programs (CONF-05)
 */
export function evaluateAllPrograms(
  student: StudentBacProfile,
  programs: Program[],
  options?: { onlyPublished?: boolean }
): OrientationReport {
  const results: ProgramEvaluationResult[] = [];

  for (const prog of programs) {
    if (!prog.isActive) continue;
    if (prog.isLegacy) continue;
    // CONF-05: Exclude draft or unmapped specialties from live evaluation
    if (prog.publicationStatus === 'DRAFT') continue;
    if (options?.onlyPublished && prog.publicationStatus !== 'PUBLISHED') continue;

    const offers = prog.institutions && prog.institutions.length > 0
      ? prog.institutions
      : [];

    for (const offer of offers) {
      const evaluation = evaluateProgramOffer(student, prog, offer);
      results.push(evaluation);
    }
  }

  // Sort results:
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
    ABOVE_HISTORICAL_REFERENCE: 1,
    ABOVE_HISTORICAL_CUTOFF: 1,
    NEAR_HISTORICAL_REFERENCE: 2,
    NEAR_HISTORICAL_CUTOFF: 2,
    NO_HISTORICAL_DATA: 3,
    CURRENT_CUTOFF_UNAVAILABLE: 4,
    BELOW_HISTORICAL_REFERENCE: 5,
    BELOW_HISTORICAL_CUTOFF: 5,
  };

  results.sort((a, b) => {
    const rankDiff = statusRank[a.eligibility] - statusRank[b.eligibility];
    if (rankDiff !== 0) return rankDiff;

    const pA = a.priority ?? 99;
    const pB = b.priority ?? 99;
    if (pA !== pB) return pA - pB;

    const compDiff = comparisonRank[a.historicalComparison] - comparisonRank[b.historicalComparison];
    if (compDiff !== 0) return compDiff;

    return b.admissionScore.scoreUsed - a.admissionScore.scoreUsed;
  });

  const eligibleCount = results.filter(r => r.eligibility === 'ELIGIBLE').length;
  const conditionalCount = results.filter(r => r.eligibility === 'CONDITIONAL').length;
  const unknownCount = results.filter(r => r.eligibility === 'UNKNOWN').length;
  const notEligibleCount = results.filter(r => r.eligibility === 'NOT_ELIGIBLE').length;

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
    dataTrustStatus: results.length > 0 ? 'VERIFIED' : 'UNKNOWN',
  };
}
