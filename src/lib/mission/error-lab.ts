import {
  ErrorRecord,
  MasteryEvidence,
  PracticeQuestion,
  SuspectedErrorType,
  Mission,
} from "@/types/mission";
import { SubjectId } from "@/types/education";
import {
  saveErrorRecord,
  getErrorRecordById,
  getAllErrorsList,
  saveMasteryEvidence,
  getMasteryEvidence,
  getMissionById,
  saveMission,
} from "./storage";

export interface CreateErrorRecordParams {
  sessionId: string;
  question: PracticeQuestion;
  missionId: string;
  selectedAnswerId: string;
  confidence: 1 | 2 | 3 | 4 | 5;
}

/**
 * Deterministic Error Pattern Detection:
 * Checks if 2 or more errors on the same skill share the same suspected error type.
 */
export function detectRecurringError(
  skillId: string,
  errorType: SuspectedErrorType,
  currentErrorId?: string
): boolean {
  if (errorType === "unknown") return false;
  const allErrors = getAllErrorsList();
  const matching = allErrors.filter(
    (e) => e.skillId === skillId && e.suspectedErrorType === errorType
  );
  if (currentErrorId && !matching.some((e) => e.id === currentErrorId)) {
    return matching.length + 1 >= 2;
  }
  return matching.length >= 2;
}

/**
 * Creates a new ErrorRecord when a question is answered incorrectly
 */
export function createErrorRecord(params: CreateErrorRecordParams): ErrorRecord {
  const { sessionId, question, missionId, selectedAnswerId, confidence } = params;

  const chosenOption = question.options.find((opt) => opt.id === selectedAnswerId);
  const suspectedErrorType: SuspectedErrorType =
    chosenOption?.suspectedErrorType ?? "unknown";

  const now = new Date().toISOString();
  const id = `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const isRecurring = detectRecurringError(question.skillId, suspectedErrorType, id);

  const record: ErrorRecord = {
    id,
    sessionId,
    questionId: question.id,
    missionId,
    subjectId: question.subjectId,
    skillId: question.skillId,
    selectedAnswer: selectedAnswerId,
    correctAnswer: question.correctAnswerId,
    suspectedErrorType,
    errorSource: "system_inferred",
    confidence,
    repairStatus: "identified",
    isRecurring,
    attemptCount: 1,
    retestFailureCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  saveErrorRecord(record);

  // If this error made the pattern recurring, mark earlier matching records too
  if (isRecurring) {
    const allErrors = getAllErrorsList();
    allErrors
      .filter(
        (e) =>
          e.skillId === question.skillId &&
          e.suspectedErrorType === suspectedErrorType &&
          !e.isRecurring
      )
      .forEach((e) => {
        e.isRecurring = true;
        saveErrorRecord(e);
      });
  }

  // Mark mission status as repair_needed
  const mission = getMissionById(missionId);
  if (mission && mission.status !== "mastered") {
    mission.status = "repair_needed";
    saveMission(mission);
  }

  return record;
}

/**
 * Updates the student's self-selected attribution of why the error occurred
 */
export function updateStudentErrorAttribution(
  errorId: string,
  errorType: SuspectedErrorType
): ErrorRecord | undefined {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;

  record.suspectedErrorType = errorType;
  record.errorSource = "student_selected";
  record.updatedAt = new Date().toISOString();

  // Re-evaluate recurrence based on updated attribution
  record.isRecurring = detectRecurringError(record.skillId, errorType, record.id);
  saveErrorRecord(record);

  if (record.isRecurring) {
    const allErrors = getAllErrorsList();
    allErrors
      .filter(
        (e) =>
          e.skillId === record.skillId &&
          e.suspectedErrorType === errorType &&
          !e.isRecurring
      )
      .forEach((e) => {
        e.isRecurring = true;
        saveErrorRecord(e);
      });
  }

  return record;
}

/**
 * Confirms the student's error attribution
 */
export function confirmErrorAttribution(errorId: string): ErrorRecord | undefined {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;

  record.errorSource = "confirmed";
  record.updatedAt = new Date().toISOString();
  saveErrorRecord(record);
  return record;
}

/**
 * Advances the error repair lifecycle to repair_started
 */
export function startRepairAction(errorId: string): ErrorRecord | undefined {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;

  record.repairStatus = "repair_started";
  record.updatedAt = new Date().toISOString();

  saveErrorRecord(record);
  return record;
}

/**
 * Marks repair steps as completed and enables the retest
 */
export function completeRepairAction(errorId: string): ErrorRecord | undefined {
  const record = getErrorRecordById(errorId);
  if (!record) return undefined;

  record.repairStatus = "repair_completed";
  record.updatedAt = new Date().toISOString();
  saveErrorRecord(record);

  // Update parent mission to retest_ready
  const mission = getMissionById(record.missionId);
  if (mission && mission.status !== "mastered") {
    mission.status = "retest_ready";
    saveMission(mission);
  }

  return record;
}

/**
 * Evaluates the retest outcome and implements evidence-based mastery
 * RULES:
 * 1. One correct initial answer != mastery. Mastery requires error identified + repair + passed retest.
 * 2. Retest failure is bounded to maximum 2 repair/retest cycles before transitioning to needs_more_work.
 */
export function evaluateRetestOutcome(
  errorId: string,
  retestQuestionId: string,
  isCorrect: boolean,
  confidence: 1 | 2 | 3 | 4 | 5
): {
  outcome: "mastered" | "retest_failed" | "needs_more_work";
  record: ErrorRecord;
  evidence?: MasteryEvidence;
} {
  const record = getErrorRecordById(errorId);
  if (!record) {
    throw new Error(`Error record ${errorId} not found`);
  }

  const now = new Date().toISOString();

  if (isCorrect) {
    // Retest Passed -> Register demonstrated mastery
    record.repairStatus = "retest_passed";
    record.updatedAt = now;
    saveErrorRecord(record);

    const existingEvidence = getMasteryEvidence(record.skillId);
    const confidenceSignals = existingEvidence
      ? [...existingEvidence.confidenceSignals, confidence]
      : [record.confidence, confidence];

    const evidence: MasteryEvidence = {
      skillId: record.skillId,
      missionId: record.missionId,
      subjectId: record.subjectId,
      evidenceType: "repair_retest_success",
      practiceAttempts: (existingEvidence?.practiceAttempts || 0) + 1,
      correctAttempts: (existingEvidence?.correctAttempts || 0) + 1,
      retestAttempts: (record.retestFailureCount || 0) + 1,
      successfulRetests: 1,
      confidenceSignals,
      masteryStatus: "demonstrated",
      achievedAt: now,
      // Backward compatibility fields
      masteredAt: now,
      retestQuestionId,
      retestConfidence: confidence,
      status: "mastered",
    };
    saveMasteryEvidence(evidence);

    // Mark mission as mastered
    const mission = getMissionById(record.missionId);
    if (mission) {
      mission.status = "mastered";
      saveMission(mission);
    }

    return {
      outcome: "mastered",
      record,
      evidence,
    };
  } else {
    // Retest Failed -> Increment failure count and check cycle limit
    record.retestFailureCount = (record.retestFailureCount || 0) + 1;
    record.repairStatus = "retest_failed";
    record.updatedAt = now;
    saveErrorRecord(record);

    const mission = getMissionById(record.missionId);

    // Max 2 cycles rule: if 2 failures, transition to needs_more_work
    if (record.retestFailureCount >= 2) {
      if (mission) {
        mission.status = "needs_more_work";
        saveMission(mission);
      }
      return {
        outcome: "needs_more_work",
        record,
      };
    } else {
      if (mission) {
        mission.status = "repair_needed";
        saveMission(mission);
      }
      return {
        outcome: "retest_failed",
        record,
      };
    }
  }
}

/**
 * Records positive evidence when student answers an initial practice question correctly.
 * NOTE: One correct answer does NOT equal demonstrated mastery!
 * It is recorded as "emerging" evidence.
 */
export function recordPracticeSuccess(
  missionId: string,
  skillId: string,
  subjectId: SubjectId,
  confidence: 1 | 2 | 3 | 4 | 5
): MasteryEvidence {
  const now = new Date().toISOString();
  const existingEvidence = getMasteryEvidence(skillId);
  const confidenceSignals = existingEvidence
    ? [...existingEvidence.confidenceSignals, confidence]
    : [confidence];

  const evidence: MasteryEvidence = {
    missionId,
    skillId,
    subjectId,
    evidenceType: "practice_success",
    practiceAttempts: (existingEvidence?.practiceAttempts || 0) + 1,
    correctAttempts: (existingEvidence?.correctAttempts || 0) + 1,
    retestAttempts: existingEvidence?.retestAttempts || 0,
    successfulRetests: existingEvidence?.successfulRetests || 0,
    confidenceSignals,
    masteryStatus: "emerging", // NOT demonstrated
    achievedAt: now,
    status: "needs_further_work",
  };

  saveMasteryEvidence(evidence);

  const mission = getMissionById(missionId);
  if (mission && mission.status !== "mastered") {
    mission.status = "in_progress";
    saveMission(mission);
  }

  return evidence;
}

/**
 * Analyzes confidence signals to spot misconceptions or underconfidence
 */
export function analyzeConfidenceSignal(
  isCorrect: boolean,
  confidence: 1 | 2 | 3 | 4 | 5
): {
  type:
    | "misconception_signal"
    | "underconfidence_signal"
    | "recognized_weakness"
    | "calibrated_mastery"
    | "normal";
  label_ar: string;
  label_fr: string;
  description_ar: string;
  description_fr: string;
} {
  if (!isCorrect && confidence >= 4) {
    return {
      type: "misconception_signal",
      label_ar: "إشارة فهم مغلوط (Misconception)",
      label_fr: "Signal d'incompréhension",
      description_ar:
        "كنت واثقاً من إجابتك لكن النتيجة كانت خاطئة. هذا يشير إلى فكرة مغلوطة تحتاج لتصحيح جذري وليس مجرد خطأ عابر.",
      description_fr:
        "Vous étiez confiant mais la réponse est incorrecte. Cela suggère une fausse conception à corriger à la racine.",
    };
  }
  if (isCorrect && confidence <= 2) {
    return {
      type: "underconfidence_signal",
      label_ar: "تردد ونقص ثقة",
      label_fr: "Manque d'assurance",
      description_ar:
        "أجبت بشكل صحيح ولكنك كنت متردداً. تحتاج إلى تكرار منظم لترسيخ الثقة في قدراتك.",
      description_fr:
        "Bonne réponse mais avec hésitation. Une répétition ciblée renforcera votre confiance.",
    };
  }
  if (!isCorrect && confidence <= 2) {
    return {
      type: "recognized_weakness",
      label_ar: "وعي بنقطة الضعف",
      label_fr: "Faiblesse identifiée",
      description_ar:
        "أنت مدرك لعدم تمكنك من هذا السؤال، وهذا وعي ممتاز يساعدنا على بناء الأساس من جديد.",
      description_fr:
        "Vous êtes conscient de votre difficulté, c'est une bonne base pour reconstruire la notion.",
    };
  }
  if (isCorrect && confidence >= 4) {
    return {
      type: "calibrated_mastery",
      label_ar: "تحكم واثق ومتطابق",
      label_fr: "Maîtrise assurée",
      description_ar: "إجابة صحيحة مع ثقة متطابقة ومبررة.",
      description_fr: "Réponse correcte avec une confiance justifiée.",
    };
  }
  return {
    type: "normal",
    label_ar: "إشارة متوازنة",
    label_fr: "Signal équilibré",
    description_ar: "استجابة عادية ضمن مسار التعلم.",
    description_fr: "Réponse standard dans le parcours.",
  };
}

export interface AdaptiveRepairPlan {
  strategyTitle_ar: string;
  strategyTitle_fr: string;
  steps_ar: string[];
  steps_fr: string[];
  keyTakeaway_ar: string;
  keyTakeaway_fr: string;
}

/**
 * Returns tailored remediation strategy by error type
 */
export function getAdaptiveRepairPlan(
  skillId: string,
  errorType: SuspectedErrorType,
  confidence: number
): AdaptiveRepairPlan {
  switch (errorType) {
    case "forgot_information":
      return {
        strategyTitle_ar: "استرجاع المعلومة والقاعدة الأساسية",
        strategyTitle_fr: "Rappel de la formule et définition clé",
        steps_ar: [
          "أعد كتابة التعريف أو القاعدة الرياضية/العلمية على ورقة بيضاء دون النظر إلى الحل.",
          "حدد بدقة الكلمة المفتاحية أو الشرط الذي غاب عن ذهنك أثناء الإجابة.",
          "قم بصياغة مثال بسيط جداً يوضح متى تنطبق هذه القاعدة ومتى لا تنطبق.",
        ],
        steps_fr: [
          "Réécrivez la règle ou définition sur feuille blanche sans regarder.",
          "Identifiez la condition clé oubliée.",
          "Formulez un exemple simple d'application.",
        ],
        keyTakeaway_ar:
          "الحفظ لا يكفي؛ الاسترجاع النشط من الذاكرة هو ما يثبت المعلومة يوم الامتحان.",
        keyTakeaway_fr: "La mémorisation active surpasse la relecture passive.",
      };
    case "calculation_error":
      return {
        strategyTitle_ar: "تدقيق الحسابات والخطوات الوسيطة",
        strategyTitle_fr: "Vérification du calcul et des étapes intermédiaires",
        steps_ar: [
          "أعد الحساب خطوة بخطوة واكتب العمليات الوسيطة ولا تعتمد على الحساب الذهني السريع.",
          "انتبه بشكل خاص للإشارات السلبية (-)، والأقواس، وتوحيد المقامات أو الوحدات.",
          "تحقق من منطقية النتيجة (مثلاً: الاحتمال محصور بين 0 و 1، التركيز موجب، إلخ).",
        ],
        steps_fr: [
          "Recalculez étape par étape sans sauter de ligne intermédiaire.",
          "Faites particulièrement attention aux signes (-), parenthèses et unités.",
          "Vérifiez l'ordre de grandeur et la cohérence physique/mathématique.",
        ],
        keyTakeaway_ar:
          "أغلب نقاط البكالوريا تضيع في إشارة ناقص أو خطأ حسابي تافه؛ التروي يوفر عليك نقاطاً ثمينة.",
        keyTakeaway_fr:
          "La rigueur sur les étapes intermédiaires évite les pertes de points bêtes.",
      };
    case "misunderstood_concept":
      return {
        strategyTitle_ar: "تفكيك المفهوم وتصحيح الفكرة المغلوطة",
        strategyTitle_fr: "Déconstruction de la notion et correction du concept",
        steps_ar: [
          "اقرأ التفسير بتمعن وحدد الفرق الدقيق بين ما اعتقدته وبين الحقيقة العلمية.",
          "اشرح الفكرة بصوتك وبأسلوبك الخاص وكأنك تشرحها لزميل لك.",
          "اربط المفهوم بتمثيل بياني أو تجربة ملموسة إن أمكن لتثبيت الفهم.",
        ],
        steps_fr: [
          "Analysez l'explication pour voir la différence avec votre hypothèse.",
          "Expliquez le concept avec vos propres mots.",
          "Associez-le à une représentation graphique ou un schéma.",
        ],
        keyTakeaway_ar:
          "الفهم الحقيقي يجعلك قادراً على حل أي تمرين مهما تغير شكله؛ لا تحفظ الحل بل افهم المنطق.",
        keyTakeaway_fr:
          "Comprendre le mécanisme permet de résoudre n'importe quelle variante.",
      };
    case "methodology_error":
      return {
        strategyTitle_ar: "ضبط المنهجية وصياغة الإجابة النموذجية للبكالوريا",
        strategyTitle_fr: "Rigueur méthodologique et rédaction type BAC",
        steps_ar: [
          "راجع هيكل الإجابة المتوقع في سلم تنقيط البكالوريا (الفرضيات، البرهان، الاستنتاج).",
          "تأكد من ذكر الشروط المسبقة (مثل: الاستمرارية وقابلية الاشتقاق قبل تطبيق المبرهنة).",
          "تجنب القفز إلى النتيجة دون تبرير رياضي أو علمي واضح ومكتوب.",
        ],
        steps_fr: [
          "Vérifiez les critères du barème officiel du BAC (hypothèse, démonstration, conclusion).",
          "Mentionnez explicitement les conditions d'application (continuité, etc.).",
          "Ne sautez pas à la conclusion sans justification préalable.",
        ],
        keyTakeaway_ar:
          "في البكالوريا، المصحح لا يمنح النقطة للنتيجة وحدها؛ طريقة الوصول إليها وتبريرها هي الأساس.",
        keyTakeaway_fr:
          "Au BAC, la justification méthodologique rapporte plus que le résultat brut.",
      };
    case "misread_question":
      return {
        strategyTitle_ar: "تفكيك نص السؤال والكلمات المفتاحية",
        strategyTitle_fr: "Lecture active de la consigne et repérage des mots-clés",
        steps_ar: [
          "أعد قراءة السؤال وسطر تحت الأفعال الإجرائية (احسب، فسر، استنتج، بين أن...).",
          "انتبه للمحددات والقيود: المجال الزمني، مجال التعريف، الوحدات المطلوبة.",
          "أعد صياغة المطلوب بجملة استفهامية خاصة بك قبل البدء في التفكير بالحل.",
        ],
        steps_fr: [
          "Surlignez les verbes d'action (calculer, déduire, justifier).",
          "Notez les contraintes : domaine de définition, unités.",
          "Reformulez la question avant de répondre.",
        ],
        keyTakeaway_ar:
          "فهم السؤال نصف الجواب؛ القراءة الهادئة لنص التمرين تمنعك من الإجابة عن سؤال لم يُطرح أصلاً.",
        keyTakeaway_fr: "Bien lire l'énoncé évite le hors-sujet.",
      };
    case "rushed":
      return {
        strategyTitle_ar: "التحكم في الإيقاع والتأني قبل الحسم",
        strategyTitle_fr: "Gestion du rythme et temporisation",
        steps_ar: [
          "خذ نفساً عميقاً ولا تضغط على الإجابة حتى تقرأ جميع الخيارات المتاحة بعناية.",
          "تأكد من استبعاد الخيارات الخاطئة بدليل واضح قبل اختيار البديل الذي تراه صحيحاً.",
          "درب نفسك على إعطاء كل سؤال وقته الطبيعي دون تسرع غير مبرر.",
        ],
        steps_fr: [
          "Lisez toutes les options avant de choisir.",
          "Éliminez méthodiquement les réponses fausses.",
          "Donnez-vous 30 secondes de réflexion avant de valider.",
        ],
        keyTakeaway_ar:
          "السرعة بدون دقة خسارة مجانية للنقاط؛ الاتزان والتركيز هما سر النجاح في البكالوريا.",
        keyTakeaway_fr:
          "Vitesse sans précision est une perte sèche de points.",
      };
    case "unknown":
    default:
      return {
        strategyTitle_ar: "استكشاف الخطأ وتحديد نقطة الغموض",
        strategyTitle_fr: "Exploration de l'erreur et levée du doute",
        steps_ar: [
          "تتبع حل السؤال خطوة بخطوة وحدد السطر الأول الذي شعرت فيه بعدم الوضوح.",
          "هل المشكل في عدم تذكر القانون، أم في عدم فهم السؤال، أم في طريقة الحل؟",
          "حدد السبب الصادق ثم اختر تصنيف الخطأ المناسب لنقدم لك خطة الإصلاح الدقيقة.",
        ],
        steps_fr: [
          "Suivez la solution pas à pas et repérez l'étape où le doute apparaît.",
          "Identifiez la nature exacte du blocage (formule, logique, calcul).",
          "Choisissez la catégorie adaptée pour guider la remédiation.",
        ],
        keyTakeaway_ar:
          "الاعتراف بعدم معرفة سبب الخطأ هو أول خطوة صادقة نحو تصحيحه؛ سنكتشفه معاً.",
        keyTakeaway_fr:
          "Identifier honnêtement la cause est le début de la remédiation.",
      };
  }
}
