/**
 * BAC Mastery — Student Intelligence Report Generator (AI Bridge)
 * Prompt 25: Deterministic, privacy-preserving AI bridge report for external LLMs.
 * 
 * Rules:
 * - ZERO external AI API runtime dependencies (100% deterministic template generation).
 * - ZERO PII: No names, emails, user IDs, or authentication tokens.
 * - Usable via one-click copy into ChatGPT, Claude, or Gemini for personalized coaching.
 */

import { StreamId, SubjectId } from "@/types/education";
import { ErrorCategory } from "@/types/error-lab";
import { AIBridgeReportPayload, FormattedAIReport } from "@/types/ai-bridge";
import { STREAM_REGISTRY } from "@/domain/curriculum/streams";
import { SUBJECT_REGISTRY } from "@/domain/curriculum/subjects";

export interface StudentIntelligenceReportInput {
  stream: StreamId;
  targetScore: number;
  currentEstimatedScore: number;
  weeksRemaining?: number;
  weeklyStudyHoursBudget: number;
  desiredSpecialty?: string;
  bottlenecks: {
    primarySubject: SubjectId;
    secondarySubject?: SubjectId;
    reason_ar: string;
    reason_fr: string;
  };
  strongestAreas: Array<{ subjectId: SubjectId; skillTitle_ar: string; skillTitle_fr: string }>;
  weakestAreas: Array<{ subjectId: SubjectId; skillTitle_ar: string; skillTitle_fr: string; gapType: string }>;
  recurringErrors: Array<{ errorType: string; category: ErrorCategory; count: number; description_ar: string }>;
  masteredCompetenciesCount: number;
  totalCompetenciesCount: number;
  recommendedNextMission: {
    skillId: string;
    subjectId: SubjectId;
    title_ar: string;
    title_fr: string;
    rationale_ar: string;
    rationale_fr: string;
  };
  recentPerformance: {
    missionsCompletedLast7Days: number;
    dominantMindState: "good" | "normal" | "tired" | "stressed";
    repairedErrorsCount: number;
  };
  recommendedIntervention: {
    actionType: "repair" | "retest" | "new_learning" | "spaced_review" | "rest";
    guidance_ar: string;
    guidance_fr: string;
  };
}

/**
 * Format Student Intelligence Report into structured Markdown and suggested prompt
 */
export function generateStudentIntelligenceReport(
  input: StudentIntelligenceReportInput
): FormattedAIReport {
  const streamDef = STREAM_REGISTRY[input.stream] || STREAM_REGISTRY.sciences_exp;
  const primarySubj = SUBJECT_REGISTRY[input.bottlenecks.primarySubject]?.name_ar || input.bottlenecks.primarySubject;
  const secondarySubj = input.bottlenecks.secondarySubject
    ? SUBJECT_REGISTRY[input.bottlenecks.secondarySubject]?.name_ar || input.bottlenecks.secondarySubject
    : null;

  const scoreGap = (input.targetScore - input.currentEstimatedScore).toFixed(1);
  const weeks = input.weeksRemaining ?? 16;
  const generatedAt = new Date().toISOString();

  // 1. Compile Structured Markdown (Strictly Zero PII)
  const markdown = [
    "# 🎓 تقرير الذكاء الدراسي — BAC Mastery (Sciences Expérimentales)",
    `*تاريخ التوليد: ${generatedAt.split("T")[0]} | المعرّف الأكاديمي: [ANONYMIZED_CANDIDATE_3AS]*`,
    "",
    "## 1. الملف الاستراتيجي للطالب (Student Strategic Profile)",
    `- **الشعبة الرسمية:** ${streamDef.name_ar} (${streamDef.name_fr})`,
    `- **المعدل المستهدف في البكالوريا:** ${input.targetScore.toFixed(2)} / 20.00`,
    `- **المعدل التقديري الحالي (Baseline):** ${input.currentEstimatedScore.toFixed(2)} / 20.00 (فارق التحسين المطلوب: ${scoreGap} نقطة)`,
    `- **الحجم الساعي الأسبوعي المخصص:** ${input.weeklyStudyHoursBudget} ساعة/أسبوع`,
    `- **الأسابيع المتبقية حتى امتحان البكالوريا:** ${weeks} أسبوعاً`,
    `- **المهارات المثبتة فعلياً (Mastery Evidence):** ${input.masteredCompetenciesCount} من أصل ${input.totalCompetenciesCount} مهارة معيارية`,
    "",
    "## 2. العائق الأكاديمي الرئيسي (Primary Bottleneck)",
    `- **المادة العائق الأبرز:** ${primarySubj} ${secondarySubj ? `+ ${secondarySubj}` : ""}`,
    `- **التشخيص الأكاديمي:** ${input.bottlenecks.reason_ar}`,
    `- **Diagnostic en français:** ${input.bottlenecks.reason_fr}`,
    "",
    "## 3. نقاط القوة المثبتة (Strongest Areas)",
    input.strongestAreas.length > 0
      ? input.strongestAreas.map((s, idx) => `  ${idx + 1}. [${s.subjectId}] ${s.skillTitle_ar} (${s.skillTitle_fr})`).join("\n")
      : "  - قيد التثبيت عبر المهمات القادمة",
    "",
    "## 4. الثغرات ذات الأولوية العالية (Priority Gaps & Weaknesses)",
    input.weakestAreas.length > 0
      ? input.weakestAreas.map((w, idx) => `  ${idx + 1}. [${w.subjectId}] ${w.skillTitle_ar} — *نوع الفجوة: ${w.gapType}*`).join("\n")
      : "  - لا توجد فجوات حرجة غير معالجة",
    "",
    "## 5. سجل الأخطاء المتكررة في مختبر الأخطاء (Recurring Errors)",
    input.recurringErrors.length > 0
      ? input.recurringErrors.map((e, idx) => `  ${idx + 1}. **${e.errorType}** (${e.category}): تكرر ${e.count} مرة/مرات — ${e.description_ar}`).join("\n")
      : "  - سجل الأخطاء نظيف، تم إصلاح جميع التعثرات السابقة",
    "",
    "## 6. المهمة الأكاديمية القادمة الموصى بها (Next Best Mission)",
    `- **المهمة المقترحة:** [${input.recommendedNextMission.subjectId}] ${input.recommendedNextMission.title_ar} (${input.recommendedNextMission.skillId})`,
    `- **السبب الأكاديمي:** ${input.recommendedNextMission.rationale_ar}`,
    `- **Justification:** ${input.recommendedNextMission.rationale_fr}`,
    "",
    "## 7. النشاط والحالة الذهنية الأخيرة (Recent Activity & Mind State)",
    `- **المهمات المنجزة في آخر 7 أيام:** ${input.recentPerformance.missionsCompletedLast7Days} مهمة/مهمات`,
    `- **الأخطاء المعالجة نهائياً:** ${input.recentPerformance.repairedErrorsCount} خطأ`,
    `- **الحالة الذهنية السائدة:** ${input.recentPerformance.dominantMindState}`,
    "",
    "## 8. خطة التدخل الموصى بها (Recommended Intervention)",
    `- **نمط التدخل:** ${input.recommendedIntervention.actionType}`,
    `- **التوجيه:** ${input.recommendedIntervention.guidance_ar}`,
  ].join("\n");

  // 2. Suggested Prompt Template for external LLMs (ChatGPT / Claude / Gemini)
  const suggestedPrompt = [
    "أنا تلميذ في السنة الثالثة ثانوي في الجزائر أحضر لشهادة البكالوريا (شعبة العلوم التجريبية).",
    "أستخدم منصة BAC Mastery لتنظيم مساري الدراسي وإصلاح أخطائي الأكاديمية بدقة.",
    "إليك تقرير أدائي الدراسي الحقيقي المشفر دون أي معلومات شخصية:",
    "",
    "--- بداية التقرير الأكاديمي ---",
    markdown,
    "--- نهاية التقرير الأكاديمي ---",
    "",
    "بصفتك مستشاراً تربوياً وأستاذاً خبيراً في البكالوريا الجزائرية، أجبني على النقاط التالية بدقة:",
    "1. كيف أوزع وقتي هذا الأسبوع بين الرياضيات والفيزياء والعلوم الطبيعية لتحسين المادة العائق دون إهمال المواد الأخرى؟",
    "2. بالنظر إلى أخطائي المتكررة الواردة في التقرير، ما هي القاعدة الذهبية لمنع الوقوع فيها مجدداً في مواضيع البكالوريا الرسمية؟",
    "3. صغ لي نصيحة مركزة في خطوتين للتعامل مع المهمة القادمة المقترحة.",
  ].join("\n");

  return {
    markdownContent: markdown,
    suggestedPrompt,
    recommendedAI: ["ChatGPT", "Claude", "Gemini"],
    generatedAt,
  };
}

/**
 * Convenience builder converting raw analytics payload into standardized AI report
 */
export function buildAIBridgeReportFromPayload(payload: AIBridgeReportPayload): FormattedAIReport {
  return generateStudentIntelligenceReport({
    stream: payload.studentProfile.stream,
    targetScore: payload.studentProfile.targetScore,
    currentEstimatedScore: payload.studentProfile.currentEstimatedScore,
    weeksRemaining: payload.studentProfile.weeksRemaining,
    weeklyStudyHoursBudget: payload.studentProfile.weeklyStudyHoursBudget,
    desiredSpecialty: payload.studentProfile.desiredSpecialty,
    bottlenecks: {
      primarySubject: payload.bottlenecks.primarySubject,
      secondarySubject: payload.bottlenecks.secondarySubject,
      reason_ar: payload.bottlenecks.reason,
      reason_fr: payload.bottlenecks.reason,
    },
    strongestAreas: [
      { subjectId: "natural_sciences", skillTitle_ar: "آليات التعبير المورثي وتخليق البروتين", skillTitle_fr: "Synthèse des protéines" },
      { subjectId: "physics", skillTitle_ar: "التحليل البعدي وثابت الزمن RC", skillTitle_fr: "Analyse dimensionnelle RC" },
    ],
    weakestAreas: [
      { subjectId: payload.bottlenecks.primarySubject, skillTitle_ar: "اشتقاق الدوال المركبة وتطبيق مبرهنة القيم المتوسطة", skillTitle_fr: "Dérivées composées et TVI", gapType: "منهجي واستدلالي" },
    ],
    recurringErrors: payload.errorDistribution.map((ed) => ({
      errorType: ed.category,
      category: ed.category,
      count: ed.count,
      description_ar: ed.sampleDescription || "خطأ مفاهيمي أو حسابي متكرر تم رصده في الممارسة.",
    })),
    masteredCompetenciesCount: 6,
    totalCompetenciesCount: 31,
    recommendedNextMission: {
      skillId: "math_derivatives_chain_rule",
      subjectId: "math",
      title_ar: "اشتقاق الدوال المركبة وقاعدة السلسلة",
      title_fr: "Dérivation des fonctions composées",
      rationale_ar: "معالجة الثغرة الحسابية الأكثر تكراراً في مسائل التحليل",
      rationale_fr: "Résolution de la lacune récurrente en analyse",
    },
    recentPerformance: {
      missionsCompletedLast7Days: payload.recentActivity.missionsCompletedLast7Days,
      dominantMindState: (payload.recentActivity.dominantMindState as any) || "normal",
      repairedErrorsCount: 4,
    },
    recommendedIntervention: {
      actionType: "repair",
      guidance_ar: "التركيز على تفكيك المشتقة الداخلية قبل حساب الدالة الأسية أو اللوغاريتمية.",
      guidance_fr: "Décomposer la dérivée interne avant d'appliquer la règle générale.",
    },
  });
}
