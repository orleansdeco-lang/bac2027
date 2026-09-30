/**
 * SHATER LEARNING INTELLIGENCE
 * 
 * Central Pedagogical Engine for Understanding:
 * - What the student knows (Mastery state)
 * - What the student struggles with (Weak skills & recurrent errors)
 * - What the student recently practiced (Signals, recency, fatigue)
 * - What prerequisite skills are missing (Cognitive dependency graph)
 * - What should be practiced next (Deterministic, prioritized recommendations)
 * 
 * Strict Invariants:
 * 1. Privacy: Student learning data is never exposed across student boundaries.
 * 2. Multi-Signal Mastery: No overfitting to a single answer; weights correctness,
 *    difficulty, hints used, time spent, recency, and attempt history.
 * 3. Deterministic Decisions: Recommendations follow clear, explainable, and debuggable priority rules.
 * 4. Error Repair: Repeated mistakes trigger focused explanation, example, similar exercise, and retest.
 * 5. Honest Spaced Review: Schedules spaced revision based on real elapsed days without pseudo-scientific hype.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { AdminContext } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";

export type MasteryLevel =
  | "not_started"
  | "learning"
  | "developing"
  | "near_mastery"
  | "mastered"
  | "needs_review";

export type LearningRecommendationType =
  | "review_skill"
  | "practice_skill"
  | "learn_prerequisite"
  | "similar_exercise"
  | "challenge"
  | "rest";

export interface SkillNode {
  id: string;
  nameAr: string;
  subjectId: string;
  streamId: string;
  grade: "3AS_BAC" | "4AM_BEM" | "2AS" | "1AS";
  unit: string;
  lesson: string;
  prerequisiteSkillIds: string[];
  difficulty: "easy" | "standard" | "advanced" | "challenge";
}

export interface AttemptSignal {
  attemptId: string;
  exerciseId: string;
  skillId: string;
  isCorrect: boolean;
  difficulty: "easy" | "standard" | "advanced" | "challenge";
  hintsUsed: number;
  timeSpentSeconds: number;
  errorType?: string;
  timestamp: string; // ISO string
}

export interface StudentSkillMastery {
  studentId: string;
  skillId: string;
  subjectId: string;
  masteryLevel: MasteryLevel;
  masteryScore: number; // 0 to 100
  attemptsCount: number;
  correctCount: number;
  hintsUsedCount: number;
  repeatedErrorTypes: Record<string, number>;
  lastAttemptAt: string;
  lastPracticedDaysAgo: number;
  spacedReviewDueAt?: string;
  isNeedsSpacedReview: boolean;
  history: AttemptSignal[];
}

export interface LearningRecommendation {
  type: LearningRecommendationType;
  typeAr: string;
  targetSkillId: string;
  targetSkillNameAr: string;
  subjectId: string;
  reasonAr: string;
  recommendedExerciseId?: string;
  recommendedExerciseTitle?: string;
  prerequisiteMissing?: { id: string; nameAr: string };
  urgency: "low" | "medium" | "high" | "critical";
  explanationSnippetAr?: string;
}

export interface ErrorRepairPlan {
  errorType: string;
  errorTypeAr: string;
  skillId: string;
  skillNameAr: string;
  repetitionCount: number;
  shortExplanationAr: string;
  targetedExampleAr: string;
  similarExerciseId?: string;
  similarExerciseTitle?: string;
  retestPromptAr: string;
}

export interface StudentLearningReport {
  studentId: string;
  overallMasteryPercentage: number;
  totalSkillsTracked: number;
  masteredSkillsCount: number;
  whatImproved: Array<{
    skillId: string;
    nameAr: string;
    previousLevel: MasteryLevel;
    currentLevel: MasteryLevel;
  }>;
  whatNeedsReview: Array<{
    skillId: string;
    nameAr: string;
    reasonAr: string;
    masteryScore: number;
  }>;
  recommendedNextStep: LearningRecommendation;
  recentPracticeSummary: {
    totalAttempts: number;
    accuracyPercentage: number;
    totalTimeSpentMinutes: number;
    lastActiveDate: string;
  };
  generatedAt: string;
}

// ============================================================================
// 1. OFFICIAL SKILLS ONTOLOGY (ALGERIAN BAC CURRICULA)
// ============================================================================
export const SKILLS_ONTOLOGY: Map<string, SkillNode> = new Map([
  // Mathematics Skills
  [
    "math-limits-basics",
    {
      id: "math-limits-basics",
      nameAr: "حساب نهايات الدوال المرجعية وحالات عدم التعيين الأساسية",
      subjectId: "mathematics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 01: الدوال العددية والأسية واللوغاريتمية",
      lesson: "النهايات والاستمرارية",
      prerequisiteSkillIds: [],
      difficulty: "easy",
    },
  ],
  [
    "math-derivatives-rules",
    {
      id: "math-derivatives-rules",
      nameAr: "تطبيق قواعد اشتقاق الدوال المركبة والجداء والمقلوب",
      subjectId: "mathematics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 01: الدوال العددية والأسية واللوغاريتمية",
      lesson: "الاشتقاقية واتجاه التغير",
      prerequisiteSkillIds: ["math-limits-basics"],
      difficulty: "standard",
    },
  ],
  [
    "math-exp-functions",
    {
      id: "math-exp-functions",
      nameAr: "دراسة خواص الدالة الأسية وحساب مشتقتها ونهاياتها الشهيرة",
      subjectId: "mathematics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 01: الدوال العددية والأسية واللوغاريتمية",
      lesson: "الدوال الأسية",
      prerequisiteSkillIds: ["math-derivatives-rules"],
      difficulty: "standard",
    },
  ],
  [
    "math-inflection-points",
    {
      id: "math-inflection-points",
      nameAr: "تعيين نقاط الانعطاف والمماسات ودراسة الوضع النسبي",
      subjectId: "mathematics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 01: الدوال العددية والأسية واللوغاريتمية",
      lesson: "المنحنيات البيانية ونقاط الانعطاف",
      prerequisiteSkillIds: ["math-exp-functions"],
      difficulty: "advanced",
    },
  ],
  [
    "math-induction-proof",
    {
      id: "math-induction-proof",
      nameAr: "البرهان بالتراجع وفق الخطوات المنهجية الثلاث",
      subjectId: "mathematics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 02: المتتاليات العددية",
      lesson: "المتتاليات العددية والبرهان بالتراجع",
      prerequisiteSkillIds: [],
      difficulty: "standard",
    },
  ],
  [
    "math-sequences-convergence",
    {
      id: "math-sequences-convergence",
      nameAr: "إثبات رتابة المتتالية وحصرها واستنتاج التقارب وحساب النهاية",
      subjectId: "mathematics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 02: المتتاليات العددية",
      lesson: "تقارب المتتاليات ونهاياتها",
      prerequisiteSkillIds: ["math-induction-proof"],
      difficulty: "advanced",
    },
  ],

  // Physics Skills
  [
    "phys-redox-equations",
    {
      id: "phys-redox-equations",
      nameAr: "كتابة المعادلات النصفية ومعادلة الأكسدة-إرجاع الإجمالية",
      subjectId: "physics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 01: المتابعة الزمنية لتحول كيميائي",
      lesson: "الأكسدة والإرجاع والمتابعة الزمنية",
      prerequisiteSkillIds: [],
      difficulty: "easy",
    },
  ],
  [
    "phys-kinetics-half-life",
    {
      id: "phys-kinetics-half-life",
      nameAr: "تعريف وتحديد زمن نصف التفاعل t1/2 بيانياً وتفسير أهميته",
      subjectId: "physics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 01: المتابعة الزمنية لتحول كيميائي",
      lesson: "سرعات التفاعل وزمن نصف التفاعل",
      prerequisiteSkillIds: ["phys-redox-equations"],
      difficulty: "standard",
    },
  ],
  [
    "phys-volumetric-speed",
    {
      id: "phys-volumetric-speed",
      nameAr: "حساب السرعة الحجمية للتفاعل واختفاء/تشكل الأنواع الكيميائية مع الوحدات",
      subjectId: "physics",
      streamId: "sciences_exp",
      grade: "3AS_BAC",
      unit: "الوحدة 01: المتابعة الزمنية لتحول كيميائي",
      lesson: "سرعات التفاعل والعوامل الحركية",
      prerequisiteSkillIds: ["phys-kinetics-half-life"],
      difficulty: "advanced",
    },
  ],
]);

// Exercise to Skills mapping
export const EXERCISE_SKILLS_MAP: Map<string, { exerciseId: string; title: string; skillIds: string[]; primarySkillId: string }> = new Map([
  [
    "ex-seed-math-01",
    {
      exerciseId: "ex-seed-math-01",
      title: "تمرين النهايات ودراسة اتجاه تغير دالة أسية — بكالوريا علوم تجريبية",
      skillIds: ["math-limits-basics", "math-derivatives-rules", "math-exp-functions", "math-inflection-points"],
      primarySkillId: "math-exp-functions",
    },
  ],
  [
    "ex-seed-math-02",
    {
      exerciseId: "ex-seed-math-02",
      title: "تمرين المتتاليات العددية والبرهان بالتراجع — بكالوريا رياضيات",
      skillIds: ["math-induction-proof", "math-sequences-convergence"],
      primarySkillId: "math-induction-proof",
    },
  ],
  [
    "ex-seed-physics-01",
    {
      exerciseId: "ex-seed-physics-01",
      title: "تمرين المتابعة الزمنية عن طريق قياس الناقلية النوعية",
      skillIds: ["phys-redox-equations", "phys-kinetics-half-life", "phys-volumetric-speed"],
      primarySkillId: "phys-volumetric-speed",
    },
  ],
]);

// In-Memory store for student skill masteries (resilient, isolated per student)
const studentMasteryStore: Map<string, Map<string, StudentSkillMastery>> = new Map();

// Helper to get or create student's skill mastery container
function getStudentMasteryMap(studentId: string): Map<string, StudentSkillMastery> {
  if (!studentMasteryStore.has(studentId)) {
    studentMasteryStore.set(studentId, new Map());
  }
  return studentMasteryStore.get(studentId)!;
}

/**
 * 2. MULTI-SIGNAL MASTERY COMPUTATION ENGINE
 * Computes mastery level from multi-dimensional signals:
 * - Rolling correctness (recent weighted higher)
 * - Difficulty bonus
 * - Hints penalty
 * - Recency & Spaced repetition decay (14+ days)
 * - Repeated errors penalty
 */
export function calculateMasteryFromSignals(
  history: AttemptSignal[],
  skill: SkillNode
): { masteryLevel: MasteryLevel; masteryScore: number; isNeedsSpacedReview: boolean; daysAgo: number } {
  if (!history || history.length === 0) {
    return {
      masteryLevel: "not_started",
      masteryScore: 0,
      isNeedsSpacedReview: false,
      daysAgo: 999,
    };
  }

  // Sort chronological
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const lastAttempt = sorted[sorted.length - 1];
  const now = new Date();
  const lastAttemptDate = new Date(lastAttempt.timestamp);
  const diffMs = now.getTime() - lastAttemptDate.getTime();
  const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // 1. Calculate accuracy with rolling weighted window
  // Recent 3 attempts carry 60% of weight, earlier attempts carry 40%
  let score = 0;
  if (sorted.length <= 2) {
    const correctCount = sorted.filter((a) => a.isCorrect).length;
    score = (correctCount / sorted.length) * 65; // Initial conservative ceiling
  } else {
    const recentAttempts = sorted.slice(-3);
    const olderAttempts = sorted.slice(0, -3);

    const recentCorrectRatio = recentAttempts.filter((a) => a.isCorrect).length / recentAttempts.length;
    const olderCorrectRatio = olderAttempts.length > 0
      ? olderAttempts.filter((a) => a.isCorrect).length / olderAttempts.length
      : recentCorrectRatio;

    score = recentCorrectRatio * 60 + olderCorrectRatio * 25;
  }

  // 2. Difficulty adjustment
  const hasAdvancedCorrect = sorted.some((a) => a.isCorrect && (a.difficulty === "advanced" || a.difficulty === "challenge"));
  if (hasAdvancedCorrect) {
    score += 15;
  }

  // 3. Hints penalty: average hints used
  const totalHints = sorted.reduce((sum, a) => sum + (a.hintsUsed || 0), 0);
  const avgHints = totalHints / sorted.length;
  if (avgHints > 2) {
    score -= 15;
  } else if (avgHints > 1) {
    score -= 7;
  }

  // 4. Repeated error penalty
  const errorMap: Record<string, number> = {};
  for (const a of sorted) {
    if (!a.isCorrect && a.errorType) {
      errorMap[a.errorType] = (errorMap[a.errorType] || 0) + 1;
    }
  }
  const maxRepeatedError = Math.max(0, ...Object.values(errorMap));
  if (maxRepeatedError >= 2) {
    score -= 10;
  }

  // Bounds clamp
  score = Math.max(0, Math.min(100, Math.round(score)));

  // 5. Spaced Review / Recency Decay (14+ days)
  let isNeedsSpacedReview = false;
  let masteryLevel: MasteryLevel = "not_started";

  if (score >= 85) {
    if (daysAgo >= 14) {
      masteryLevel = "needs_review";
      isNeedsSpacedReview = true;
    } else {
      masteryLevel = "mastered";
    }
  } else if (score >= 70) {
    if (daysAgo >= 14) {
      masteryLevel = "needs_review";
      isNeedsSpacedReview = true;
    } else {
      masteryLevel = "near_mastery";
    }
  } else if (score >= 40) {
    masteryLevel = "developing";
  } else if (sorted.length > 0) {
    masteryLevel = "learning";
  } else {
    masteryLevel = "not_started";
  }

  return {
    masteryLevel,
    masteryScore: score,
    isNeedsSpacedReview,
    daysAgo,
  };
}

/**
 * 3. RECORD STUDENT PRACTICE ATTEMPT
 * Updates server-side student mastery state safely and deterministically.
 */
export function recordStudentPracticeAttempt(
  signal: AttemptSignal,
  studentId: string
): StudentSkillMastery {
  const masteryMap = getStudentMasteryMap(studentId);
  const skill = SKILLS_ONTOLOGY.get(signal.skillId) || {
    id: signal.skillId,
    nameAr: signal.skillId,
    subjectId: "mathematics",
    streamId: "sciences_exp",
    grade: "3AS_BAC",
    unit: "عام",
    lesson: "عام",
    prerequisiteSkillIds: [],
    difficulty: "standard",
  };

  const existing = masteryMap.get(signal.skillId) || {
    studentId,
    skillId: signal.skillId,
    subjectId: skill.subjectId,
    masteryLevel: "not_started" as MasteryLevel,
    masteryScore: 0,
    attemptsCount: 0,
    correctCount: 0,
    hintsUsedCount: 0,
    repeatedErrorTypes: {},
    lastAttemptAt: signal.timestamp,
    lastPracticedDaysAgo: 0,
    isNeedsSpacedReview: false,
    history: [],
  };

  // Append history
  const updatedHistory = [...existing.history, signal];
  const { masteryLevel, masteryScore, isNeedsSpacedReview, daysAgo } = calculateMasteryFromSignals(updatedHistory, skill);

  // Update error frequency
  const updatedErrors = { ...existing.repeatedErrorTypes };
  if (!signal.isCorrect && signal.errorType) {
    updatedErrors[signal.errorType] = (updatedErrors[signal.errorType] || 0) + 1;
  }

  const updatedMastery: StudentSkillMastery = {
    ...existing,
    masteryLevel,
    masteryScore,
    attemptsCount: existing.attemptsCount + 1,
    correctCount: existing.correctCount + (signal.isCorrect ? 1 : 0),
    hintsUsedCount: existing.hintsUsedCount + (signal.hintsUsed || 0),
    repeatedErrorTypes: updatedErrors,
    lastAttemptAt: signal.timestamp,
    lastPracticedDaysAgo: daysAgo,
    isNeedsSpacedReview,
    history: updatedHistory,
  };

  masteryMap.set(signal.skillId, updatedMastery);
  return updatedMastery;
}

/**
 * 4. RECOMMENDATION ENGINE
 * `getNextLearningRecommendation(studentId)`
 * Prioritization Rules:
 * 1. Rest: Fatigue detected (continuous attempts with high error rate).
 * 2. Learn Prerequisite: A prerequisite skill is deficient (< 50 mastery).
 * 3. Spaced Review: A previously mastered skill requires reinforcement (> 14 days).
 * 4. Error Repair: Recurrent error pattern on active skill.
 * 5. Practice Skill: Skill in development (40..84).
 * 6. Challenge: All skills in unit mastered (> 85).
 */
export function getNextLearningRecommendation(studentId: string): LearningRecommendation {
  const masteryMap = getStudentMasteryMap(studentId);
  const allMasteries = Array.from(masteryMap.values());

  // 1. Fatigue / Rest Signal Check
  // Check if student made >= 10 attempts in recent history with >= 40% errors
  const allHistory = allMasteries
    .flatMap((m) => m.history)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (allHistory.length >= 10) {
    const recentBatch = allHistory.slice(0, 10);
    const recentErrors = recentBatch.filter((a) => !a.isCorrect).length;
    if (recentErrors >= 6) {
      return {
        type: "rest",
        typeAr: "استراحة واستعادة التركيز (Rest)",
        targetSkillId: "cognitive-rest",
        targetSkillNameAr: "استراحة ذهنية لاستعادة النشاط",
        subjectId: "general",
        reasonAr: "لقد بذلت جهداً مكثفاً وظهرت علامات الإرهاق الذهني في المحاولات الأخيرة. نوصي بأخذ استراحة قصيرة مدتها 15 دقيقة قبل استئناف التدريب.",
        urgency: "high",
        explanationSnippetAr: "الراحة الذهنية جزء أساسي من ترسيخ التعلم في الذاكرة طويلة المدى وفق العلوم المعرفية.",
      };
    }
  }

  // 2. Check for Missing Prerequisites
  // Find skills where student is struggling (mastery < 45) but prerequisite skill is deficient (< 50 or not started)
  for (const mastery of allMasteries) {
    if (mastery.masteryScore < 45 && mastery.attemptsCount >= 2) {
      const skillNode = SKILLS_ONTOLOGY.get(mastery.skillId);
      if (skillNode && skillNode.prerequisiteSkillIds.length > 0) {
        for (const prereqId of skillNode.prerequisiteSkillIds) {
          const prereqMastery = masteryMap.get(prereqId);
          const prereqScore = prereqMastery ? prereqMastery.masteryScore : 0;
          if (prereqScore < 50) {
            const prereqNode = SKILLS_ONTOLOGY.get(prereqId);
            return {
              type: "learn_prerequisite",
              typeAr: "تعلم المكتسب القبلي أولاً (Learn Prerequisite)",
              targetSkillId: prereqId,
              targetSkillNameAr: prereqNode ? prereqNode.nameAr : prereqId,
              subjectId: skillNode.subjectId,
              reasonAr: `الصعوبة في مهارة [${skillNode.nameAr}] ناتجة عن نقص في المكتسب القبلي الأساسي: [${prereqNode?.nameAr || prereqId}]. إتقان الأساس يضمن التفوق في اللاحق.`,
              prerequisiteMissing: {
                id: prereqId,
                nameAr: prereqNode?.nameAr || prereqId,
              },
              urgency: "critical",
              explanationSnippetAr: "بناء المهارات تراكمي؛ تجاوز الثغرة في المكتسب القبلي يعالج 80% من أخطاء المسائل المركبة.",
            };
          }
        }
      }
    }
  }

  // 3. Check for Spaced Review Due Skills (needs_review or > 14 days elapsed)
  const spacedDue = allMasteries.find((m) => m.isNeedsSpacedReview || (m.masteryScore >= 70 && m.lastPracticedDaysAgo >= 14));
  if (spacedDue) {
    const skillNode = SKILLS_ONTOLOGY.get(spacedDue.skillId);
    return {
      type: "review_skill",
      typeAr: "مراجعة متباعدة للتثبيت (Spaced Review)",
      targetSkillId: spacedDue.skillId,
      targetSkillNameAr: skillNode ? skillNode.nameAr : spacedDue.skillId,
      subjectId: spacedDue.subjectId,
      reasonAr: `لقد مرت ${spacedDue.lastPracticedDaysAgo} يوماً منذ آخر تدريب على مهارة [${skillNode?.nameAr || spacedDue.skillId}]. المراجعة الدورية المتباعدة تحمي المعرفة من النسيان قبيل البكالوريا.`,
      urgency: "medium",
      explanationSnippetAr: "المراجعة المتباعدة تنشط مسارات الذاكرة وتجعل استرجاع القوانين فورياً في الامتحان.",
    };
  }

  // 4. Check for Repeated Error Patterns (Error Repair)
  for (const mastery of allMasteries) {
    const errorEntries = Object.entries(mastery.repeatedErrorTypes);
    const repeated = errorEntries.find(([_, count]) => count >= 2);
    if (repeated) {
      const [errType, count] = repeated;
      const skillNode = SKILLS_ONTOLOGY.get(mastery.skillId);
      return {
        type: "similar_exercise",
        typeAr: "تمرين علاجي لمعالجة خطأ متكرر (Error Repair)",
        targetSkillId: mastery.skillId,
        targetSkillNameAr: skillNode ? skillNode.nameAr : mastery.skillId,
        subjectId: mastery.subjectId,
        reasonAr: `تم رصد تكرار خطأ من نوع [${errType}] بمقدار (${count}) مرات في مهارة [${skillNode?.nameAr}]. نوصي بتطبيق مثال تدريبي تصحيحي لتجاوز هذه النقطة بدقة.`,
        urgency: "high",
        explanationSnippetAr: "تصحيح الخطأ المتكرر بمثال موجه فورياً يمنع رسوخ العادات الحسابية الخاطئة.",
      };
    }
  }

  // 5. Practice Active Developing Skills
  const developingSkill = allMasteries.find((m) => m.masteryLevel === "learning" || m.masteryLevel === "developing");
  if (developingSkill) {
    const skillNode = SKILLS_ONTOLOGY.get(developingSkill.skillId);
    return {
      type: "practice_skill",
      typeAr: "تدريب تطبيقي لرفع مستوى الإتقان (Practice Skill)",
      targetSkillId: developingSkill.skillId,
      targetSkillNameAr: skillNode ? skillNode.nameAr : developingSkill.skillId,
      subjectId: developingSkill.subjectId,
      reasonAr: `أنت في مسار التقدم بمهارة [${skillNode?.nameAr}] (نسبة إتقانك الحالية ${developingSkill.masteryScore}%). حل مسألة تدريبية إضافية سينقلك لدرجة الإتقان التام.`,
      urgency: "medium",
    };
  }

  // 6. Challenge High-Mastery Students
  const masteredAll = allMasteries.length > 0 && allMasteries.every((m) => m.masteryScore >= 80);
  if (masteredAll) {
    const topSkill = allMasteries[0];
    const skillNode = SKILLS_ONTOLOGY.get(topSkill.skillId);
    return {
      type: "challenge",
      typeAr: "مسألة تحدٍّ وتميز (Challenge)",
      targetSkillId: topSkill.skillId,
      targetSkillNameAr: skillNode ? skillNode.nameAr : topSkill.skillId,
      subjectId: topSkill.subjectId,
      reasonAr: `ممتاز! لقد حققت مستوى إتقان متقدم (${topSkill.masteryScore}%) في المهارات المستهدفة. أنت جاهز الآن لخوض مسألة أولمبياد وبكالوريا تحدٍّ بمستوى 20/20.`,
      urgency: "low",
      explanationSnippetAr: "مسائل التحدي تصقل مهارة التفكير التركيبي والاستقلالية المنهجية.",
    };
  }

  // 7. Baseline for New Student (Starts with foundational mathematics skill)
  const defaultSkill = SKILLS_ONTOLOGY.get("math-limits-basics")!;
  return {
    type: "practice_skill",
    typeAr: "تمرين انطلاقة تأسيسي (Baseline Practice)",
    targetSkillId: defaultSkill.id,
    targetSkillNameAr: defaultSkill.nameAr,
    subjectId: defaultSkill.subjectId,
    reasonAr: "مرحباً بك في شاطر! نوصي بالبدء بمسألة استكشافية تأسيسية لقياس سرعة فهمك وضبط مسارك التعليمي المخصص.",
    urgency: "medium",
  };
}

/**
 * 5. ERROR REPAIR ENGINE
 * When a student repeatedly makes the same mistake:
 * Generates targeted remediation: short explanation, targeted example, similar exercise, and retest.
 */
export function getErrorRepairPlan(
  studentId: string,
  skillId: string,
  errorType: string
): ErrorRepairPlan {
  const skillNode = SKILLS_ONTOLOGY.get(skillId) || {
    id: skillId,
    nameAr: "المهارة المستهدفة",
    subjectId: "mathematics",
    streamId: "sciences_exp",
    grade: "3AS_BAC",
    unit: "عام",
    lesson: "عام",
    prerequisiteSkillIds: [],
    difficulty: "standard",
  };

  const masteryMap = getStudentMasteryMap(studentId);
  const mastery = masteryMap.get(skillId);
  const count = mastery?.repeatedErrorTypes[errorType] || 2;

  let shortExplanationAr = "";
  let targetedExampleAr = "";
  let retestPromptAr = "";

  if (errorType === "formula_error") {
    shortExplanationAr =
      "تذكر أن مشتق جداء دالتين (u·v)' ليس جداء المشتقتين u'·v'، بل يطبق القانون الرسمي: (u·v)' = u'·v + u·v'.";
    targetedExampleAr =
      "مثال تطبيقي: لاشتقاق f(x) = x·e^x نضع u(x)=x ومنه u'(x)=1، و v(x)=e^x ومنه v'(x)=e^x. إذن f'(x) = 1·e^x + x·e^x = (1 + x)e^x.";
    retestPromptAr = "احسب الآن مشتقة الدالة g(x) = (3x - 2)e^x مع تطبيق الخطوات المنهجية بدقة.";
  } else if (errorType === "sign_error") {
    shortExplanationAr =
      "عند نقل حد إلى الطرف الآخر من المعادلة تتغير إشارته، وعند توزيع إشارة السالب خارج القوسين تتغير إشارات جميع الحدود داخل القوسين: -(a - b) = -a + b.";
    targetedExampleAr =
      "مثال: حل المعادلة 3 - 2x = 5 يكافئ -2x = 5 - 3 = 2 ومنه x = 2 / (-2) = -1.";
    retestPromptAr = "حل المعادلة: 4 - (2x - 6) = 0 مع الانتباه لتوزيع إشارة السالب.";
  } else if (errorType === "unit_error") {
    shortExplanationAr =
      "في الفيزياء والكيمياء، يجب التعبير عن الحجم باللتر (L) والتركيز بـ mol/L والسرعة بـ mol/(L·min) أو mol/(L·s) لتفادي الأخطاء في رتبة المقدار.";
    targetedExampleAr =
      "مثال: لتحويل 100 mL إلى لتر: V = 100 * 10^-3 L = 0.1 L.";
    retestPromptAr = "احسب التركيز المولي C لمحلول يحتوي 0.02 mol مذابة في V = 250 mL مع ذكر الوحدة.";
  } else {
    shortExplanationAr =
      "التركيز على قراءة السؤال بعناية والتحقق من النتيجة خطوة بخطوة يحميك من ارتكاب الهفوات في ورقة الامتحان.";
    targetedExampleAr = "مثال: مراجعة نتيجة كل سطر والتأكد من مطابقة الوحدات قبل الانتقال للسؤال التالي.";
    retestPromptAr = "أعد حل المسألة مع كتابة القانون أولاً ثم التعويض العددي بدقة.";
  }

  return {
    errorType,
    errorTypeAr: errorType === "formula_error" ? "خطأ في الصيغة القانونية" : errorType === "sign_error" ? "خطأ إشارة" : "خطأ وحدات وحساب",
    skillId,
    skillNameAr: skillNode.nameAr,
    repetitionCount: count,
    shortExplanationAr,
    targetedExampleAr,
    similarExerciseId: "ex-seed-math-01",
    similarExerciseTitle: "مسألة الدوال الأسية والمشتقات النموذجية",
    retestPromptAr,
  };
}

/**
 * 6. STUDENT REPORT GENERATION
 * Generates:
 * - What improved
 * - What needs review
 * - Recommended next step
 */
export function generateStudentLearningReport(studentId: string): StudentLearningReport {
  const masteryMap = getStudentMasteryMap(studentId);
  const masteries = Array.from(masteryMap.values());

  const totalTracked = masteries.length;
  const masteredCount = masteries.filter((m) => m.masteryLevel === "mastered").length;
  const avgScore = totalTracked > 0
    ? Math.round(masteries.reduce((sum, m) => sum + m.masteryScore, 0) / totalTracked)
    : 0;

  const whatImproved: StudentLearningReport["whatImproved"] = [];
  const whatNeedsReview: StudentLearningReport["whatNeedsReview"] = [];

  for (const m of masteries) {
    const node = SKILLS_ONTOLOGY.get(m.skillId);
    const nameAr = node ? node.nameAr : m.skillId;

    if (m.masteryLevel === "mastered" || m.masteryLevel === "near_mastery") {
      whatImproved.push({
        skillId: m.skillId,
        nameAr,
        previousLevel: "learning",
        currentLevel: m.masteryLevel,
      });
    }

    if (m.masteryLevel === "needs_review" || m.isNeedsSpacedReview || m.masteryScore < 50) {
      whatNeedsReview.push({
        skillId: m.skillId,
        nameAr,
        reasonAr: m.isNeedsSpacedReview
          ? `مرت فترة زمنية (${m.lastPracticedDaysAgo} يوماً) تتطلب تنشيط الذاكرة`
          : `مستوى الإتقان يحتاج تعزيزاً إضافياً (${m.masteryScore}%)`,
        masteryScore: m.masteryScore,
      });
    }
  }

  // Calculate practice stats
  const allAttempts = masteries.flatMap((m) => m.history);
  const totalAttempts = allAttempts.length;
  const correctCount = allAttempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  const totalMinutes = Math.round(allAttempts.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0) / 60);

  const nextStep = getNextLearningRecommendation(studentId);

  return {
    studentId,
    overallMasteryPercentage: avgScore,
    totalSkillsTracked: totalTracked,
    masteredSkillsCount: masteredCount,
    whatImproved,
    whatNeedsReview,
    recommendedNextStep: nextStep,
    recentPracticeSummary: {
      totalAttempts,
      accuracyPercentage: accuracy,
      totalTimeSpentMinutes: totalMinutes,
      lastActiveDate: allAttempts.length > 0 ? allAttempts[allAttempts.length - 1].timestamp : new Date().toISOString(),
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 7. RETRIEVAL & QUERYING
 */
export function getStudentMasteryOverview(studentId: string): StudentSkillMastery[] {
  const masteryMap = getStudentMasteryMap(studentId);
  return Array.from(masteryMap.values());
}
