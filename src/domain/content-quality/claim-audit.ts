/**
 * BAC Mastery — Automated Content Claim Audit Engine
 * 
 * Scans educational content, explanations, and metadata for dangerous,
 * misleading, or legally unsupported claims:
 * - Fake score guarantees ("علامة مضمونة", "guaranteed 20/20")
 * - False official claims ("تصحيح وزاري رسمي", "معايير التصحيح الوزاري الرسمية")
 * - Unsupported coefficient claims for BAC 2027
 * - Forbidden threshold terminology ("العتبة")
 * - Unsubstantiated BAC topic probability claims ("موضوع مؤكد في البكالوريا")
 */

import { ClaimAuditResult, ClaimViolation, SourceClassification } from "./types";

interface AuditRule {
  pattern: RegExp;
  category: ClaimViolation["category"];
  severity: ClaimViolation["severity"];
  reason: string;
  remediation: string;
  requiresOfficialExemption?: boolean;
}

const AUDIT_RULES: AuditRule[] = [
  // 1. Score Guarantees
  {
    pattern: /(علامة مضمونة|نضمن لك|ستحصل حتماً على|guaranteed score|guarantee.*20)/i,
    category: "score_guarantee",
    severity: "BLOCKER",
    reason: "يحظر منعاً باتاً تقديم وعود تجارية بالحصول على علامة معينة في البكالوريا.",
    remediation: "استبدل الوعد بصياغة بيداغوجية موضوعية تركز على إتقان الخطوات والمهارات.",
  },

  // 2. Forbidden Threshold Terminology
  {
    pattern: /(عتبة الدروس|عتبة البكالوريا|العتبة الرسمية)/i,
    category: "forbidden_threshold_term",
    severity: "BLOCKER",
    reason: "مصطلح 'العتبة' ملغى رسمياً من المنظومة التربوية الجزائرية ولا يجوز الترويج له.",
    remediation: "احذف الإشارة إلى العتبة وأكد على تغطية الكفاءات المبرمجة نظامياً.",
  },

  // 3. Unsupported Topic Probability
  {
    pattern: /(موضوع مؤكد في البكالوريا|سؤال مضمون 100%|توقع مؤكد لشهادة|probability of this topic.*100%)/i,
    category: "exam_prediction",
    severity: "BLOCKER",
    reason: "التكهن الجازم بأسئلة البكالوريا ممارسة غير تربوية ومضللة للتلاميذ.",
    remediation: "استبدل التوقع بعبارة: 'نمط متكرر في اختبارات البكالوريا السابقة'.",
  },

  // 4. Current Official Coefficient Claims for 2027 without Disclaimer
  {
    pattern: /(المعامل الرسمي لـ 2027|معاملات بكالوريا 2027 الرسمية|official BAC 2027 coefficient)/i,
    category: "coefficient_misrepresentation",
    severity: "BLOCKER",
    reason: "تم إلغاء القرار السابق الخاص بالمعاملات بتاريخ 10 سبتمبر 2026؛ لا يجوز ادعاء وجود معاملات رسمية جديدة لـ 2027.",
    remediation: "صنّف المعامل كمرجع تاريخي (OFFICIAL_HISTORICAL) وفق المرسوم 07-142 بانتظار النصوص الجديدة.",
  },

  // 5. Ministry Correction Criteria Assertion
  {
    pattern: /(تصحيح وزاري رسمي ملزم|معايير التصحيح الوزاري القطعية|official ministerial correction criteria)/i,
    category: "unsupported_official_claim",
    severity: "WARNING",
    reason: "شبكات التصحيح الوزارية استرشادية للجان التصحيح وتتغير سنوياً؛ لا يجوز ادعاء وجود معيار مطلق.",
    remediation: "استخدم صياغة: 'حل نموذجي وفق الدليل البيداغوجي المعتمد'.",
    requiresOfficialExemption: true,
  },

  // 6. Absolutist Syllabus Completeness
  {
    pattern: /(المنهاج الوزاري الكامل 100%|برنامج البكالوريا الشامل الحصري)/i,
    category: "syllabus_absolutism",
    severity: "WARNING",
    reason: "تجنب ادعاءات الاحتكار والكمال المطلق غير المثبتة رسمياً.",
    remediation: "صغ العبارة بوضوح: 'تغطية للكفاءات الأساسية المستهدفة في المنهاج'.",
  },
];

export interface AuditClaimOptions {
  sourceClassification?: SourceClassification;
  allowOfficialCitations?: boolean;
}

/**
 * Audits a text string against claim rules and returns a structured result.
 */
export function auditClaimString(
  text: string,
  options?: AuditClaimOptions
): ClaimAuditResult {
  if (!text || typeof text !== "string") {
    return {
      isClean: true,
      violations: [],
      blockerCount: 0,
      warningCount: 0,
    };
  }

  const violations: ClaimViolation[] = [];

  for (const rule of AUDIT_RULES) {
    if (rule.requiresOfficialExemption && options?.allowOfficialCitations) {
      if (options.sourceClassification === "OFFICIAL_CURRENT") {
        continue; // Exempted if citing a verified official source
      }
    }

    const match = text.match(rule.pattern);
    if (match) {
      const matchIndex = match.index ?? 0;
      const start = Math.max(0, matchIndex - 30);
      const end = Math.min(text.length, matchIndex + match[0].length + 30);
      const excerpt = text.substring(start, end).replace(/\n/g, " ").trim();

      violations.push({
        matchedPattern: match[0],
        severity: rule.severity,
        category: rule.category,
        excerpt: `...${excerpt}...`,
        reason: rule.reason,
        remediation: rule.remediation,
      });
    }
  }

  const blockerCount = violations.filter((v) => v.severity === "BLOCKER").length;
  const warningCount = violations.filter((v) => v.severity === "WARNING").length;

  return {
    isClean: blockerCount === 0 && warningCount === 0,
    violations,
    blockerCount,
    warningCount,
  };
}
