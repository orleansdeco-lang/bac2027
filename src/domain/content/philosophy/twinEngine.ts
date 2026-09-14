/**
 * BAC Mastery — Philosophy Twin Retest & Methodology Error Engine
 * Integrates directly with Error Lab, ErrorRepository, and student_error_lab
 * 
 * Specially designed for Algerian BAC Stream: Lettres & Philosophie
 * Tracks high-stakes methodology fallacies (e.g. converting investigation to dialectic,
 * missing real-world examples, destructive critique) and issues isomorphic twin retests.
 */

import { ErrorRecord, SuspectedErrorType } from "@/types/mission";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { CommonMethodologyFallacy } from "./types";

export type PhilosophyMethodologyErrorType =
  | "investigation_to_dialectic"       // تحويل الاستقصاء بالوضع إلى جدل
  | "missing_real_world_examples"      // غياب الأمثلة الواقعية والاكتفاء بالسرد الإنشائي
  | "conflating_schools"               // خلط المدارس الفلسفية دون تمايز
  | "destructive_critique_without_praise" // نقد هادم دون تثمين
  | "unjustified_personal_opinion"     // رأي شخصي بدون تبرير منطقي
  | "lack_of_philosophical_terms";     // فقر المصطلحات الفلسفية

export interface PhilosophyErrorRegistrationParams {
  userId?: string;
  lessonId: string;
  skillId: string;
  fallacyType: PhilosophyMethodologyErrorType;
  studentAttemptSnippet?: string;
  customNote_ar?: string;
  confidence?: 1 | 2 | 3 | 4 | 5;
}

export interface PhilosophyTwinRetest {
  id: string;
  retestSkillId: string;
  targetFallacyType: PhilosophyMethodologyErrorType;
  title_ar: string;
  context_ar: string;
  prompt_ar: string;
  methodRequired_ar: string;
  isomorphicScenario_ar: string;
  expectedStructuralMilestones_ar: string[];
  rubricAdvice_ar: string;
  sampleModelAnswer_ar: string;
}

/**
 * Authoritative Catalog of Isomorphic Twin Retests for Methodology Errors
 */
export const PHILOSOPHY_TWIN_RETEST_CATALOG: Record<
  PhilosophyMethodologyErrorType,
  PhilosophyTwinRetest
> = {
  investigation_to_dialectic: {
    id: "twin_phil_investigation_defense",
    retestSkillId: "lp_phil_retest_investigation_structure",
    targetFallacyType: "investigation_to_dialectic",
    title_ar: "اختبار التوأم: هيكلة مقالة الاستقصاء بالوضع دون الانزلاق إلى الجدل",
    context_ar: "إشكالية: الفلسفة واللغة والفكر (المشكلة الثانية: اللغة والفكر)",
    prompt_ar: "قيل: 'إن الفكر أسبق من اللغة وهو صانعها ومبدعها'. دافع عن صحة هذه الأطروحة.",
    methodRequired_ar: "استقصاء بالوضع (Défense d'une thèse)",
    isomorphicScenario_ar: `
طُلب منك الدفاع الحصري عن الاتجاه الانفصالي (برغسون، ديكارت) الذي يرى أسبقية الفكر على اللغة.
المهمة التوأم: أثبت أنك لن تقع مجدداً في فخ عرض الموقف المعارض (الاتجاه الاتصالي) كطرف مساوٍ، بل التزم بهيكل الاستقصاء بالوضع.
    `.trim(),
    expectedStructuralMilestones_ar: [
      "1. المقدمة: التمهيد الوظيفي، طرح فكرة شائعة (اللغة والفكر صنوان)، ثم الفكرة الصائبة (أسبقية الفكر)، وطرح المشكلة بصيغة الدفاع: كيف نثبت مشروعية الدفاع عن هذه الأطروحة؟",
      "2. عرض منطق الأطروحة: تقديم حجج الاتجاه الانفصالي (برغسون: عجز اللغة عن مواكبة ديمومة الفكر، ظاهرة الحبسة، الفكر يفيض عن الألفاظ).",
      "3. تدعيم الأطروحة بحجج شخصية وأمثلة واقعية: التفكير الرياضي الخالص، لحظة الإلهام الشعري قبل تدوينه في كلمات.",
      "4. نقد منطق الخصوم: عرض موجز لموقف الخصوم (الاتجاه الواحدي الاتصالي: ميرلوبونتي، دولاكروا) ثم نقدهم وبيان قصورهم دون منحهم وزناً جدلياً مساوياً.",
      "5. الخاتمة: التأكيد الصريح على صحة الأطروحة وقابليتها للتبني والأخذ بها.",
    ],
    rubricAdvice_ar: "احذر تماماً من استخدام عبارة 'نقيض الأطروحة' أو إجراء 'تركيب توافقي'. المقالة دفاع خالص عن قضية واحدة.",
    sampleModelAnswer_ar: "الخاتمة النموذجية للاستقصاء: 'بناءً على ما تقدم من براهين منطقية وشواهد نفسية، يتجلى لنا بوضوح أن الأطروحة القائلة بأسبقية الفكر على اللغة أطروحة صحيحة وسليمة في سياقها؛ ولذلك فإن الأخذ بها والدفاع عنها وتبنيها موقف مشروع ومبرر عقلياً.'",
  },

  missing_real_world_examples: {
    id: "twin_phil_empirical_examples",
    retestSkillId: "lp_phil_retest_empirical_examples",
    targetFallacyType: "missing_real_world_examples",
    title_ar: "اختبار التوأم: تطعيم الحجج الفلسفية بالأمثلة الواقعية والمشاهد الحية",
    context_ar: "إشكالية: فلسفة العلوم والرياضيات (المشكلة: أصل المفاهيم الرياضية)",
    prompt_ar: "هل المفاهيم الرياضية مستخلصة من التجربة الحسية أم فطرية في العقل؟",
    methodRequired_ar: "طريقة جدلية (تدعيم الحجج بالأمثلة)",
    isomorphicScenario_ar: `
اكتب فقرة حجاجية تدعم فيها الموقف الحسي التجريبي (جون لوك، جون ستيوارت ميل) مستخدماً 3 أمثلة حسية وواقعية من التاريخ الطبيعي والتعليم الأولي.
    `.trim(),
    expectedStructuralMilestones_ar: [
      "مثال 1: أصل العد عند الحضارات القديمة (الحصى وعظام الحيوانات واستخدام أصابع اليدين كأداة حسية أولى للحساب).",
      "مثال 2: الهندسة التطبيقية عند قدماء المصريين (مسح الأراضي الزراعية بعد فيضان النيل التي ولدت علم الجيومتريا).",
      "مثال 3: تدريس الرياضيات للطفل الصغير في الروضة والمرحلة الابتدائية عبر الخشيبات والقريصات والمجسمات الملموسة.",
    ],
    rubricAdvice_ar: "في كل حجة تذكرها، اجعل الصياغة بالشكل التالي: [الفكرة الفلسفية] + [قول الفيلسوف] + [مثال تطبيقي دقيق من الواقع].",
    sampleModelAnswer_ar: "إن المفاهيم الرياضية لم تنشأ مجردة دفعة واحدة، بل كانت ملتصقة بالواقع الحسي؛ فشعوب بابل ومصر القديمة لم تكتشف المستطيل والمثلث في عالم المثل، بل فرضته ضرورة إعادة مسح الحقول الزراعية بعد انحسار فيضان نهر النيل، كما أن الطفل الصغير لا يستوعب مفهوم العدد (3) إلا من خلال ملامسة ثلاثة تفاحات أو خشيبات حسية.",
  },

  conflating_schools: {
    id: "twin_phil_epistemic_distinctions",
    retestSkillId: "lp_phil_retest_epistemic_distinctions",
    targetFallacyType: "conflating_schools",
    title_ar: "اختبار التوأم: التمييز الصارم بين المذهب العقلي والمذهب الحسي التجريبي",
    context_ar: "إشكالية: نظرية المعرفة ونشأة الأفكار",
    prompt_ar: "بين الفارق الجوهري بين ديكارت وجون لوك في تفسير إدراك العالم الخارجي.",
    methodRequired_ar: "طريقة المقارنة والفرز المفهومي",
    isomorphicScenario_ar: "صياغة فقرة تميز بدقة بين النزعة العقلية الفطرية (ديكارت) والنزعة الحسية التراكمية (لوك).",
    expectedStructuralMilestones_ar: [
      "بيان أن العقليين يثبتون أفكاراً فطرية سابقة عن التجربة (كفكرة الله، النفس، الامتداد).",
      "بيان أن الحسيين ينفون تماماً أي فكرة فطرية ويعتبرون العقل صفحة بيضاء تبدأ معرفتها من الحواس.",
      "توضيح أن نقطة التقائهما الوحيدة هي اعتبار الإدراك وظيفة 'ذاتية' مقابلة لموضوعية الغشتالت.",
    ],
    rubricAdvice_ar: "استخدم ألفاظ المقارنة الدقيقة: 'في حين يذهب...' / 'بخلاف ما يراه...' / 'ورغم اتفاقهما في... إلا أنهما يتباينان في...'",
    sampleModelAnswer_ar: "رغم أن كلا من ديكارت وجون لوك يتفقان على أن الإدراك ينبع من فاعلية الذات الإنسانية، إلا أن بينهما فجوة مذهبية عميقة؛ فبينما يؤكد ديكارت أن العقل يملك أفكاراً فطرية سابقة عن كل تجربة حسية ويجعل الحواس مصدراً للشك والخداع، يرى جون لوك أن العقل يولد كصفحة بيضاء خالية من كل نقش وأن الحواس هي المنبع الأوحد والوحيد الذي يغذي الذهن بمادته الخام.",
  },

  destructive_critique_without_praise: {
    id: "twin_phil_objective_critique",
    retestSkillId: "lp_phil_retest_objective_critique",
    targetFallacyType: "destructive_critique_without_praise",
    title_ar: "اختبار التوأم: صياغة النقد الفلسفي المتوازن (تثمين الإيجابيات قبل بيان الحدود)",
    context_ar: "إشكالية: النظرية الغشتالتية في الإدراك",
    prompt_ar: "قدم نقداً موضوعياً متوازناً لنظرية الشكل (Gestalt) في تفسير الإدراك.",
    methodRequired_ar: "نقد موضوعي مركب (Critique objective)",
    isomorphicScenario_ar: "صياغة نقد للغشتالت يتضمن جملة تثمين واضحة لا تقل عن سطرين، تليها حدود الموقف ونقائصه المعتمدة وزارياً.",
    expectedStructuralMilestones_ar: [
      "1. التثمين: لا يمكن إنكار ما قدمته النظرية الغشتالتية من تجارب رائدة أثبتت كليّة الإدراك وقوانين الانتظام البنيوي.",
      "2. الانتقال المنهجي: لكن، بالرغم من هذه الإسهامات القيمة، إلا أنهم بالغوا في...",
      "3. بيان النقائص: تحويل الذات المدركة إلى مجرد متلق سلبي خاضع لأشكال المادة، وإهمال العوامل الذاتية (الانتباه، الرغبة، الثقافة).",
    ],
    rubricAdvice_ar: "ابدأ دائماً بـ: 'صحيح أن هذا الموقف قد أصاب حينما... غير أنهم أفرطوا في...'",
    sampleModelAnswer_ar: "صحيح أن أنصار النظرية الغشتالتية قد وفقوا إلى حد بعيد في الكشف عن القوانين البنيوية الموضوعية التي تحكم إدراكنا للشكل الكلي متجاوزين النزعة الذرية السطحية؛ غير أنهم بالغوا في تجريد الذات المدركة من كل فاعلية واعتبروها مستجيباً آلياً سلبياً لبنية الموضوع الخارجي، متناسين أن الذات الإنسانية تدرك الأشياء وفق دوافعها النفسية وخبراتها التربوية واهتماماتها الخاصة.",
  },

  unjustified_personal_opinion: {
    id: "twin_phil_justified_synthesis",
    retestSkillId: "lp_phil_retest_justified_synthesis",
    targetFallacyType: "unjustified_personal_opinion",
    title_ar: "اختبار التوأم: بناء الرأي الشخصي المؤسس في محطة التركيب",
    context_ar: "إشكالية: الإحساس والإدراك بين الذات والموضوع",
    prompt_ar: "صغ رأياً شخصياً مبرراً يختم محطة التركيب بين الذات والموضوع.",
    methodRequired_ar: "تبرير الرأي الشخصي في التركيب",
    isomorphicScenario_ar: "كتابة رأي شخصي في 4 أسطر يبدأ بعبارة واضحة ويقدم حجة جديدة مع مثال واقعي نوعي.",
    expectedStructuralMilestones_ar: [
      "الصياغة: وفي رأيي الشخصي المؤسس، أرى أن...",
      "التبرير النظري: تبرير الترجيح أو التوفيق بحجة منطقية أو إبستيمولوجية.",
      "المثال الواقعي التبريري: مثال تفاعل الطبيب أو السائق أو القارئ في بيئته.",
    ],
    rubricAdvice_ar: "تجنب تماماً التبرير العاطفي مثل 'لأنه يعجبني' أو 'لأنه الأسهل'. التبرير يجب أن يكون حجة عقلية مستندة إلى الواقع.",
    sampleModelAnswer_ar: "وفي تقديري الشخصي، أرى أن الفصل بين الذات والموضوع في الإدراك هو فصل نظري مفتعل أملته النزعات المذهبية الأحادية؛ وتبريري لذلك يستند إلى الواقع المعاش، حيث يثبت السلوك الإنساني أن الإدراك فعل لقاء عضوي بين الطرفين؛ فالطبيب المشخص لصورة الأشعة يرى بعينه بقعاً وأشكالاً منتظمة بقوانين الغشتالت (الموضوع)، لكنه لا يدرك وجود المرض إلا بنشاطه الذهني وخبرته الطبية التراكمية (الذات).",
  },

  lack_of_philosophical_terms: {
    id: "twin_phil_lexicon_enrichment",
    retestSkillId: "lp_phil_retest_lexicon_enrichment",
    targetFallacyType: "lack_of_philosophical_terms",
    title_ar: "اختبار التوأم: توظيف المعجم الفلسفي الدقيق والارتقاء باللغة عن الركاكة",
    context_ar: "المفاهيم الفلسفية الأساسية في نظرية المعرفة",
    prompt_ar: "استبدل التعبيرات العامية الركيكة بالمصطلحات الفلسفية الأكاديمية المقابلة لها.",
    methodRequired_ar: "دقة المصطلحات الفلسفية",
    isomorphicScenario_ar: "تحويل فقرة إنشائية ركيكة إلى فقرة فلسفية رصينة مليئة بالمفاهيم الدقيقة.",
    expectedStructuralMilestones_ar: [
      "استبدال 'العقل يحسب ويفكر' بـ 'الحكم العقلي الاستدلالي'.",
      "استبدال 'حاجة واضحة قدامنا' بـ 'معطى موضوعي محايث'.",
      "استبدال 'الموقفين متفقين ويخدمو مع بعض' بـ 'العلاقة التضايفية الجدلية التكاملية'.",
    ],
    rubricAdvice_ar: "المصحح في البكالوريا يمنح نقطة سلامة اللغة بناءً على كثافة المصطلحات الفلسفية الصحيحة.",
    sampleModelAnswer_ar: "عوضاً عن القول بأن 'الحواس والعقل يشتغلان سوياً لمعرفة الأشياء في الدنيا'، نصوغها فلسفياً: 'إن عملية الإدراك تتأسس على علاقة تضايفية جدلية وثيقة تتكامل فيها المعطيات الحسية المباشرة مع المقولات العقلية القبلية لتأويل بنية العالم الخارجي.'",
  },
};

/**
 * The Philosophy Twin Engine
 * Core singleton engine providing error registration, Error Lab synchronization,
 * and adaptive twin retest matching.
 */
export const PhilosophyTwinEngine = {
  /**
   * Registers a philosophical methodology fallacy directly into Error Lab
   * and synchronizes it with Supabase (student_error_lab view / errors table).
   */
  async registerMethodologyError(
    params: PhilosophyErrorRegistrationParams
  ): Promise<{
    errorRecord: ErrorRecord;
    twinRetest: PhilosophyTwinRetest;
    remediationGuide_ar: string;
  }> {
    const {
      userId,
      lessonId,
      skillId,
      fallacyType,
      studentAttemptSnippet,
      customNote_ar,
      confidence = 3,
    } = params;

    const twinRetest = PHILOSOPHY_TWIN_RETEST_CATALOG[fallacyType];
    const now = new Date().toISOString();
    const errorId = `err-phil-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Build authoritative ErrorRecord
    const errorRecord: ErrorRecord = {
      id: errorId,
      studentId: userId,
      sessionId: `session_phil_${lessonId}`,
      questionId: `q_${lessonId}_${fallacyType}`,
      missionId: `mission_phil_${lessonId}`,
      subjectId: "philosophy",
      skillId: skillId || twinRetest.retestSkillId,
      selectedAnswer: studentAttemptSnippet || "methodology_flaw_detected",
      correctAnswer: twinRetest.sampleModelAnswer_ar,
      suspectedErrorType: "methodology_error",
      errorSource: "system_inferred",
      confidence,
      repairStatus: "identified",
      isRecurring: false,
      attemptCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Save to LocalStorage / Memory via ErrorRepository
    await ErrorRepository.saveError(errorRecord, userId);

    // 2. Explicit synchronization with Supabase student_error_lab / errors table
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const cloudPayload = {
          id: errorRecord.id,
          user_id: userId,
          mission_id: errorRecord.missionId,
          skill_id: errorRecord.skillId,
          question_id: errorRecord.questionId,
          subject_id: "philosophy",
          system_inferred_error_type: "methodology_error",
          student_selected_error_type: fallacyType,
          status: "identified",
          is_recurring: false,
          occurrence_count: 1,
          created_at: now,
          updated_at: now,
          metadata: {
            fallacyType,
            lessonId,
            customNote_ar,
            twinRetestId: twinRetest.id,
          },
        };

        // Upsert directly to errors table which backs the student_error_lab view
        const { error: upsertErr } = await supabase
          .from("errors")
          .upsert(cloudPayload, { onConflict: "id" });

        if (upsertErr) {
          console.warn("PhilosophyTwinEngine: Supabase upsert error:", upsertErr.message);
        }
      } catch (err) {
        console.error("PhilosophyTwinEngine exception during cloud sync:", err);
      }
    }

    return {
      errorRecord,
      twinRetest,
      remediationGuide_ar: twinRetest.rubricAdvice_ar,
    };
  },

  /**
   * Retrieves the Isomorphic Twin Retest tailored to a specific methodology error
   */
  getTwinRetest(fallacyType: PhilosophyMethodologyErrorType): PhilosophyTwinRetest {
    return PHILOSOPHY_TWIN_RETEST_CATALOG[fallacyType];
  },

  /**
   * Submits a student's twin retest answer, validates key milestones,
   * updates the repair status in Error Lab, and records mastery evidence.
   */
  async submitTwinRetestAnswer(params: {
    userId?: string;
    errorRecordId: string;
    fallacyType: PhilosophyMethodologyErrorType;
    studentAnswer_ar: string;
  }): Promise<{
    passed: boolean;
    score: number; // 0 to 20
    feedback_ar: string;
    matchedMilestonesCount: number;
    updatedStatus: "retest_passed" | "retest_failed";
  }> {
    const { userId, errorRecordId, fallacyType, studentAnswer_ar } = params;
    const twin = PHILOSOPHY_TWIN_RETEST_CATALOG[fallacyType];

    // Evaluate answer against expected milestones
    let matchedMilestones = 0;
    const lowerAnswer = studentAnswer_ar.trim();

    // Check specific structural tokens according to fallacy
    if (fallacyType === "investigation_to_dialectic") {
      // Must NOT contain dialectic keywords
      const hasDialecticDrift =
        lowerAnswer.includes("نقيض الأطروحة") ||
        lowerAnswer.includes("التركيب") ||
        lowerAnswer.includes("الرأي التوفيقي");
      
      const hasDefenseKeywords =
        lowerAnswer.includes("الدفاع") ||
        lowerAnswer.includes("أطروحة صحيحة") ||
        lowerAnswer.includes("تبنيها") ||
        lowerAnswer.includes("مشروعية الأخذ بها");

      if (!hasDialecticDrift && hasDefenseKeywords && lowerAnswer.length > 80) {
        matchedMilestones = 5;
      } else if (!hasDialecticDrift && lowerAnswer.length > 50) {
        matchedMilestones = 3;
      }
    } else if (fallacyType === "missing_real_world_examples") {
      const hasExampleSignifiers =
        lowerAnswer.includes("مثال") ||
        lowerAnswer.includes("الواقع") ||
        lowerAnswer.includes("تجربة") ||
        lowerAnswer.includes("الطفل") ||
        lowerAnswer.includes("الحصى") ||
        lowerAnswer.includes("النيل");
      
      if (hasExampleSignifiers && lowerAnswer.length > 70) {
        matchedMilestones = 3;
      }
    } else {
      if (lowerAnswer.length > 60) matchedMilestones = 3;
    }

    const passed = matchedMilestones >= 3;
    const score = passed ? 16 + matchedMilestones : 8;
    const updatedStatus = passed ? "retest_passed" : "retest_failed";

    // Update error record status in ErrorRepository
    const errorsMap = await ErrorRepository.getErrors(userId);
    const existing = errorsMap[errorRecordId];
    if (existing) {
      const updatedRecord: ErrorRecord = {
        ...existing,
        repairStatus: updatedStatus,
        updatedAt: new Date().toISOString(),
      };
      await ErrorRepository.saveError(updatedRecord, userId);
    }

    const feedback_ar = passed
      ? `ممتاز! لقد اجتزت اختبار التوأم بنجاح وأثبتت قدرتك على ضبط ${twin.methodRequired_ar} وتفادي فخ ${twin.title_ar}. تم تحديث سجلك في مختبر الأخطاء بنجاح.`
      : `إجابتك تحتاج إلى مزيد من الدقة المنهجية. تأكد من استيفاء المعايير التالية: ${twin.expectedStructuralMilestones_ar.join(" | ")}`;

    return {
      passed,
      score,
      feedback_ar,
      matchedMilestonesCount: matchedMilestones,
      updatedStatus,
    };
  },
};
