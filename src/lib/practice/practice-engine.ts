/**
 * SHATER | الشاطر — Unified Practice & Pedagogical Learning Engine
 * 
 * Synthesizes mastery learning principles (Khan Academy, Brilliant, IXL, ALEKS, Photomath)
 * strictly calibrated for the Algerian Baccalaureate curriculum.
 */

import { PracticeQuestion, PracticeOption, SuspectedErrorType, MasteryStatus } from "@/types/mission";
import { SubjectId, StreamId } from "@/types/education";
import { EXPANDED_PRACTICE_QUESTIONS } from "@/data/curriculum/practice-questions";
import { EXPANDED_PRACTICE_QUESTIONS_SET2 } from "@/data/curriculum/practice-questions-set2";

// ============================================================================
// DATA CONTRACTS & INTERFACES
// ============================================================================

export type PracticeMode =
  | "quick_drill"      // تمرين سريع (1-3 أسئلة)
  | "standard_session" // تدريب مكثف (5-8 أسئلة)
  | "skill_mastery"    // تثبيت مهارة محددة
  | "error_repair"     // معالجة أخطاء معمل الأخطاء
  | "bac_challenge"    // تحدي بكالوريا رسمي
  | "exam_simulation"; // محاكاة امتحان مؤقت

export interface PedagogicalHint {
  level: 1 | 2 | 3 | 4;
  title_ar: string;
  badge_ar: string;
  content_ar: string;
  unlocked: boolean;
}

export interface PedagogicalStepBreakdown {
  stepNumber: number;
  title_ar: string;
  whatWeDid_ar: string;   // واش درنا؟
  whyWeDidIt_ar: string;  // علاش درناه؟
  mathFormula?: string;
}

export interface StructuredSolution {
  givenInfo_ar: string[];             // 1. المعطيات
  coreIdea_ar: string;                // 2. الفكرة الرياضية / العلمية
  steps: PedagogicalStepBreakdown[];  // 3. خطوات الحل التفصيلية
  finalConclusion_ar: string;         // 4. النتيجة والتحقق
  bacTip_ar?: string;                 // نصيحة خاصة بورقة امتحان البكالوريا
  commonPitfalls_ar?: string[];       // أخطاء شائعة يجب تفاديها
}

export interface AnswerDiagnostic {
  isCorrect: boolean;
  selectedOptionId?: string;
  errorType?: SuspectedErrorType;
  friendlyTitle_ar: string;
  diagnosticExplanation_ar: string;
  actionAdvice_ar: string;
  skillName_ar?: string;
}

export interface SkillMasteryState {
  skillId: string;
  subjectId: SubjectId;
  status: "not_acquired" | "in_progress" | "near_mastery" | "mastered";
  totalAttempts: number;
  correctAttempts: number;
  hintsUsedCount: number;
  retestPassed: boolean;
  lastTrainedAt: string;
}

// Local Storage Key
const SKILL_MASTERY_STORAGE_KEY = "shater_skill_mastery_v2";

// ============================================================================
// PRACTICE ENGINE SERVICE
// ============================================================================

export const PracticeEngine = {
  /**
   * Returns all available questions combined across banks
   */
  getAllQuestions(): PracticeQuestion[] {
    return [...EXPANDED_PRACTICE_QUESTIONS, ...EXPANDED_PRACTICE_QUESTIONS_SET2];
  },

  /**
   * Fetches questions filtered by subject, stream, and optional skill
   */
  getQuestions(params: {
    subjectId?: SubjectId | string;
    streamId?: StreamId | string;
    skillId?: string;
    mode?: PracticeMode;
    limit?: number;
    includeRetests?: boolean;
  }): PracticeQuestion[] {
    const all = this.getAllQuestions();

    let filtered = all.filter((q) => {
      if (params.subjectId && params.subjectId !== "all" && q.subjectId !== params.subjectId) {
        return false;
      }
      if (params.streamId && params.streamId !== "all" && q.streamId !== params.streamId) {
        return false;
      }
      if (params.skillId && q.skillId !== params.skillId) {
        return false;
      }
      if (!params.includeRetests && q.isRetestVariant) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      // Fallback to all questions if none match stream exactly
      filtered = all.filter((q) => !params.includeRetests ? !q.isRetestVariant : true);
    }

    // Limit count based on practice mode
    const limit = params.limit || (params.mode === "quick_drill" ? 3 : params.mode === "skill_mastery" ? 4 : 6);
    return filtered.slice(0, limit);
  },

  /**
   * Finds the paired retest variant (rq-*) for a given question or skill to reinforce mastery
   */
  getReinforcementQuestion(question: PracticeQuestion): PracticeQuestion | null {
    const all = this.getAllQuestions();

    // 1. Look for explicit retest paired to this question
    const directRetest = all.find(
      (q) => q.isRetestVariant && (q.retestForQuestionId === question.id || q.id === `rq-${question.id.replace(/^pq-/, "")}`)
    );
    if (directRetest) return directRetest;

    // 2. Look for any retest question with the same skillId
    const skillRetest = all.find(
      (q) => q.skillId === question.skillId && q.id !== question.id
    );
    if (skillRetest) return skillRetest;

    return null;
  },

  /**
   * Generates a 4-tier progressive hint ladder for any question
   */
  generateHintLadder(question: PracticeQuestion): PedagogicalHint[] {
    const prompt = question.prompt_ar;
    const explanation = question.explanation_ar || "";

    // Extract formulas or key parts from explanation
    const mathMatch = explanation.match(/lim|e\^|\/|\\|f\(x\)|f'\(x\)|=|-|\+/g);

    return [
      {
        level: 1,
        title_ar: "تذكير بالمفهوم والقاعدة النظرية",
        badge_ar: "مفهوم أساسي",
        content_ar:
          question.repairHint_ar ||
          `تذكر في موضوع (${question.tags.join("، ")}): القاعدة المنهاجية المعتمدة ترتكز على التعويض والتبسيط المباشر قبل اللجوء إلى الحسابات المعقدة. تفحص نوع المعطيات والتعريفات المقررة في درسك.`,
        unlocked: false,
      },
      {
        level: 2,
        title_ar: "تحديد المعطيات والمطلوب بدقة",
        badge_ar: "فرز المعطيات",
        content_ar: `المعطى الأساسي في السؤال هو: «${prompt.slice(0, 120)}...». المطلوب منك هو استخراج النتيجة الدقيقة المطابقة لشروط ومجال التعريف، وتفادي الخلط بين المتغيرات.`,
        unlocked: false,
      },
      {
        level: 3,
        title_ar: "توجيه منهجي استراتيجي للحل",
        badge_ar: "استراتيجية الحل",
        content_ar: `ابدأ بحساب المقدار أو القاعدة الأساسية خطوة بخطوة. انتبه إلى إشارات السالب، والمقامات المنعدمة، وقواعد الأس أو اللوغاريتم إن وجدت. تخلص من الإجابات المستحيلة منطقياً أولاً.`,
        unlocked: false,
      },
      {
        level: 4,
        title_ar: "كشف الخطوة التالية والحل النموذجي",
        badge_ar: "الخطوة الحاسمة",
        content_ar: explanation || "راجع خطوات الحل المفصلة في الأسفل للوصول إلى الإجابة النموذجية المعتمدة رسمياً.",
        unlocked: false,
      },
    ];
  },

  /**
   * Deconstructs any question's resolution into 4 structured Algerian BAC sections:
   * 1. المعطيات 2. الفكرة 3. خطوات الحل (واش درنا وعلاش) 4. النتيجة والتحقق
   */
  buildStructuredSolution(question: PracticeQuestion): StructuredSolution {
    const rawExplanation = question.explanation_ar || "";
    const sentences = rawExplanation.split(/(?<=[.،؛:])\s+/).filter(Boolean);

    // Structure sentences into logical pedagogical steps
    const steps: PedagogicalStepBreakdown[] = sentences.length >= 2
      ? sentences.map((sentence, idx) => ({
          stepNumber: idx + 1,
          title_ar: `الخطوة ${idx + 1}: ${idx === 0 ? "تطبيق القاعدة الأساسية" : idx === 1 ? "الحساب والتبسيط" : "الاستنتاج النهائي"}`,
          whatWeDid_ar: sentence,
          whyWeDidIt_ar:
            idx === 0
              ? "لتحديد المسار المنهجي المطابق لسلم التنقيط الوزاري وعزل الحدود الفاعلة."
              : idx === 1
              ? "لإزالة الغموض وتفادي حالات عدم التعيين أو الأخطاء الحسابية في الإشارة."
              : "لصياغة النتيجة النهائية بدقة وبصورة جاهزة للمصادقة في ورقة الامتحان.",
        }))
      : [
          {
            stepNumber: 1,
            title_ar: "تطبيق القاعدة والتحليل المنهجي",
            whatWeDid_ar: rawExplanation || "قمنا بتطبيق خواص الدالة المعطاة وتبسيط العبارة خطوة بخطوة.",
            whyWeDidIt_ar: "للوصول إلى الإجابة الصحيحة وفق النموذج الوزاري للبكالوريا.",
          },
        ];

    return {
      givenInfo_ar: [
        `المعطيات الواردة في نص السؤال: ${question.prompt_ar}`,
        `المجال أو الشروط المحددة للمسألة`,
      ],
      coreIdea_ar:
        question.repairHint_ar ||
        "القاعدة الذهبية: الاعتماد على التعريف الرسمي والمبرهنات المعتمدة في المنهاج الجزائري دون تسرع.",
      steps,
      finalConclusion_ar: `إذن الإجابة الصحيحة والمعتمدة هي: الخيار الصحيح (${question.options.find((o) => o.id === question.correctAnswerId)?.text_ar || ""}).`,
      bacTip_ar:
        "نصيحة مصحح البكالوريا: لا تكتفِ بكتابة الحرف أو الرمز فقط في ورقة الإجابة، بل اذكر دائماً التبرير المنهجي المختصر لضمان العلامة الكاملة المخصصة للخطوة.",
      commonPitfalls_ar: [
        "الاستعجال في الحساب الذهني وإهمال إشارة السالب (-) عند النشر والتبسيط.",
        "نسيان التحقق من مجال التعريف أو القيود المفروضة على المتغير.",
      ],
    };
  },

  /**
   * Diagnoses an answer submission and returns constructive pedagogical feedback
   */
  diagnoseAnswer(question: PracticeQuestion, selectedOptionId: string): AnswerDiagnostic {
    const isCorrect = selectedOptionId === question.correctAnswerId;
    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    const errorType = selectedOption?.suspectedErrorType || "unknown";

    if (isCorrect) {
      return {
        isCorrect: true,
        selectedOptionId,
        friendlyTitle_ar: "ممتاز! إجابة صحيحة ومضبوطة 🎯",
        diagnosticExplanation_ar: "أحسنت! طبقت المنهجية السليمة واستخرجت النتيجة الصحيحة المتوافقة مع معايير البكالوريا.",
        actionAdvice_ar: "يمكنك الآن تثبيت المهارة عبر حل تمرين مشابه جديد أو الانتقال للسؤال التالي.",
      };
    }

    // Friendly diagnostic descriptions based on Algerian high school misconceptions
    const errorMap: Record<SuspectedErrorType, { title: string; explanation: string; advice: string }> = {
      calculation_error: {
        title: "مازال ما وصلناش! غلطة في الحساب أو الإشارة 🧮",
        explanation: "الفكرة العامة عندك صحيحة، لكن وقع انزلاق حسابي بسيط في الإشارة (+) أو (-) أو في النشر والتبسيط.",
        advice: "أعد الحساب بهدوء واكتب الخطوة على الورقة المسودة قبل الاختيار.",
      },
      misunderstood_concept: {
        title: "مازال ما وصلناش! التباس في المفهوم العلمي 💡",
        explanation: "يبدو أنك خلطت بين مفهومين متقاربين (مثل المستقيم المقارب الأفقي والعمودي أو نوع التفاعل).",
        advice: "اضغط على زر «شوف التلميح» لتتذكر التعريف المنهجي الدقيق للدرس.",
      },
      methodology_error: {
        title: "مازال ما وصلناش! خلل في المنهجية والترتيب 📐",
        explanation: "عرفت الهدف بصح طريقة التطبيق ناقصة خطوة وسيطة تضمن الوصول للحل.",
        advice: "تدرج في الخطوات واحدة بواحدة ولا تقفز مباشرة للنتيجة النهائية.",
      },
      forgot_information: {
        title: "مازال ما وصلناش! نسيان لقانون أو ثابت 🧠",
        explanation: "القانون أو العلاقة المطبقة تحتاج مراجعة وتثبيتاً في الذاكرة.",
        advice: "راجع البطاقة التذكيرية في سلم التلميحات وسجل القانون في كراسك.",
      },
      misread_question: {
        title: "مازال ما وصلناش! قراءة غير دقيقة لشروط السؤال 🔍",
        explanation: "قد تكون أهملت كلمة مفتاحية مثل «على الأقل»، «رتيبة تماماً»، أو «نهاية عند اللانهاية».",
        advice: "أعد قراءة السؤال بهدوء وسطّر تحت الكلمات المفتاحية الأساسية.",
      },
      rushed: {
        title: "مازال ما وصلناش! استعجلت في الاختيار ⏳",
        explanation: "الإجابة كانت سريعة جداً دون التحقق الكافي من بقية الخيارات المعروضة.",
        advice: "خذ وقتك، كل دقيقة تقضيها في التحقق تحميك من تضييع النقاط في البكالوريا.",
      },
      lack_of_practice: {
        title: "مازال ما وصلناش! تحتاج تمارين تطبيقية أكثر 📚",
        explanation: "هذا النوع من الأسئلة يتكرر كثيراً في مواضيع البكالوريا ويحتاج مرونة في الحل.",
        advice: "حل هذا التمرين ثم اضغط على «حل تمرين مشابه» لتثبيته نهائياً.",
      },
      time_management: {
        title: "مازال ما وصلناش! تسيير الوقت ⏱️",
        explanation: "تشتت الوقت المتاح يسبب ضغطاً يؤدي لاختيار خيار تقريبي.",
        advice: "ركز على فكرة واحدة وابدأ بالاستبعاد المنطقي للخيارات الخاطئة.",
      },
      attention_error: {
        title: "مازال ما وصلناش! قلة تركيز عابرة 🎯",
        explanation: "انتبهت للفكرة لكن اخترت خياراً شبيهاً جداً ومموه بهدف اختبار اليقظة.",
        advice: "قارن الخيارات بدقة حرفاً بحرف قبل الضغط على التحقق.",
      },
      unknown: {
        title: "مازال ما وصلناش! لا بأس، الخطأ بداية التعلم 💡",
        explanation: "الإجابة المختارة ليست هي النموذجية المعتمدة رسمياً لهذا السؤال.",
        advice: "استعن بسلم التلميحات المتدرج أو طالع خطوات الحل المفصلة لاكتشاف الفكرة.",
      },
    };

    const details = errorMap[errorType] || errorMap.unknown;

    return {
      isCorrect: false,
      selectedOptionId,
      errorType,
      friendlyTitle_ar: details.title,
      diagnosticExplanation_ar: details.explanation,
      actionAdvice_ar: details.advice,
    };
  },

  /**
   * Loads skill mastery stats from LocalStorage
   */
  getSkillMastery(skillId: string): SkillMasteryState | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(SKILL_MASTERY_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed[skillId] || null;
    } catch {
      return null;
    }
  },

  /**
   * Updates skill mastery based on an exercise completion
   */
  recordSkillAttempt(params: {
    skillId: string;
    subjectId: SubjectId;
    isCorrect: boolean;
    hintsUsed: number;
    isRetest?: boolean;
  }): SkillMasteryState {
    const existing = this.getSkillMastery(params.skillId) || {
      skillId: params.skillId,
      subjectId: params.subjectId,
      status: "not_acquired",
      totalAttempts: 0,
      correctAttempts: 0,
      hintsUsedCount: 0,
      retestPassed: false,
      lastTrainedAt: new Date().toISOString(),
    };

    const total = existing.totalAttempts + 1;
    const correct = existing.correctAttempts + (params.isCorrect ? 1 : 0);
    const hints = existing.hintsUsedCount + params.hintsUsed;
    const retestPassed = existing.retestPassed || (params.isRetest === true && params.isCorrect);

    // Compute updated mastery status:
    // - mastered: >= 2 correct, passed retest, low hints
    // - near_mastery: >= 2 correct
    // - in_progress: >= 1 attempt
    let status: SkillMasteryState["status"] = "in_progress";
    if (correct >= 2 && retestPassed) {
      status = "mastered";
    } else if (correct >= 2) {
      status = "near_mastery";
    } else if (correct >= 1) {
      status = "in_progress";
    }

    const updated: SkillMasteryState = {
      ...existing,
      totalAttempts: total,
      correctAttempts: correct,
      hintsUsedCount: hints,
      retestPassed,
      status,
      lastTrainedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(SKILL_MASTERY_STORAGE_KEY);
        const map = raw ? JSON.parse(raw) : {};
        map[params.skillId] = updated;
        localStorage.setItem(SKILL_MASTERY_STORAGE_KEY, JSON.stringify(map));
      } catch (err) {
        console.warn("Failed to persist skill mastery state", err);
      }
    }

    return updated;
  },
};
