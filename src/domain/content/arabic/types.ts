/**
 * BAC Mastery — Arabic Language & Literature Pedagogical Architecture
 * Specifically designed for Algerian BAC Stream: Lettres et Philosophie (شعبة الآداب والفلسفة)
 * 
 * Defines authoritative structures for Arabic lessons, grammar rules, parsing cases (إعراب المفردات والجمل),
 * literary movements & phenomena (شعر المنفى، المهجر، الالتزام، الرمز والأسطورة),
 * critical evaluation questions (التقويم النقدي), and certified teacher video guides.
 */

import { SubjectId, StreamId } from "@/types/education";
import { ErrorCategory } from "@/types/error-lab";

/**
 * Categories of Arabic grammatical rules tested in BAC
 */
export type ArabicGrammarCategory =
  | "conditional_particles"  // أدوات الشرط (إذا، إذ، إذن، لولا، لوما...)
  | "adverbs"                // الظروف وأحكامها (حينئذٍ، يومئذٍ، مذ، منذ...)
  | "sentence_positions"     // الجمل التي لها محل والتي لا محل لها من الإعراب
  | "pronouns_and_modifiers" // الضمائر والتمييز والبدل وعطف البيان
  | "inflection_and_moods"   // الإعراب اللفظي والتقديري والممنوع من الصرف
  | "rhetorical_syntax";     // التقديم والتأخير والمسند والمسند إليه

/**
 * BAC exam parsing model for target words or phrases
 */
export interface BacParsingModel {
  session: string;             // دورة البكالوريا (مثال: BAC 2023 آداب وفلسفة)
  verseOrText_ar: string;      // الشاهد الشعري أو النثري
  targetWord_ar: string;       // الكلمة أو الجملة المطلوب إعرابها
  fullOfficialParsing_ar: string; // الإعراب النموذجي المعتمد في السلم الوزاري
  commentary_ar?: string;      // توجيه منهجي وملاحظات المصحح
}

/**
 * Detailed specification of a syntactic case for a tool or particle (e.g. إذا الشرطية، إذا الفجائية)
 */
export interface ArabicParsingCase {
  id: string;
  caseTitle_ar: string;          // مثلاً: إذا الظرفية الشرطية غير الجازمة
  semanticMeaning_ar: string;    // المعنى والدلالة (تفيد الظرفية والشرط والاستقبال)
  ruleConditions_ar: string[];   // شروط تحقق هذه الحالة
  exactParsingTemplate_ar: string; // قالب الإعراب الرسمي الكامل (حفظ إلزامي للتلميذ)
  followingSentenceRole_ar?: string; // إعراب الجملة الواقعة بعدها (مثلاً: في محل جر مضاف إليه)
  followingNounRule_ar?: string;     // حكم الاسم المرفوع الواقع بعدها (فاعل لفعل محذوف، نائب فاعل...)
  bacExamModels: BacParsingModel[];
}

/**
 * Parsing traps tracked in the Error Lab (مخبر الأخطاء)
 */
export interface ArabicParsingTrap {
  id: string;
  trapCode: string;             // رمز الفخ (مثلاً: AR_TRAP_IDA_SUDDEN_VS_CONDITIONAL)
  trapTitle_ar: string;         // عنوان الفخ
  category: ErrorCategory;      // تصنيف الخطأ
  description_ar: string;       // شرح فخ الإعراب وسببه الشائع
  dangerLevel: "critical" | "high" | "medium";
  bacPenaltyPoints: number;     // النقاط المفقودة في البكالوريا (من 0.5 إلى 2 ن)
  badExample_ar: string;        // الإعراب الخاطئ الشائع
  correctRemedy_ar: string;     // الإعراب الصحيح وطريقة كشف الفخ
  twinRetestSkillId: string;    // معرف مهارة الاختبار التوأم لإصلاح الخطأ
}

/**
 * Authoritative Arabic Grammar Rule
 */
export interface ArabicGrammarRule {
  id: string;
  toolName_ar: string;          // اسم الأداة أو القاعدة (مثلاً: أحكام وإعراب "إذا")
  ruleCategory: ArabicGrammarCategory;
  generalRule_ar: string;       // القاعدة العامة والضابط المنهجي
  parsingCases: ArabicParsingCase[];
  commonParsingTraps: ArabicParsingTrap[];
}

/**
 * A literary pioneer/poet representation
 */
export interface LiteraryPioneer {
  name_ar: string;              // اسم الشاعر/الأديب (مثلاً: محمود سامي البارودي)
  epithet_ar?: string;          // اللقب (مثلاً: رائد مدرسة البعث والإحياء / رب السيف والقلم)
  nationality_ar: string;       // الجنسية والموطن
  historicalBrief_ar: string;   // نبذة تاريخية وسياق النفي أو النشأة
  representativeWorks_ar: string[]; // الدواوين والمؤلفات
  notablePoemQuotes: Array<{
    verse_ar: string;           // البيت الشعري الشاهد
    explanation_ar: string;     // شرح البيت
    context_ar: string;         // مناسبته والظاهرة المعبر عنها
  }>;
}

/**
 * Characteristics of a Literary School (المدرسة الأدبية)
 */
export interface LiterarySchoolCharacteristics {
  name_ar: string;              // مثلاً: مدرسة البعث والإحياء (الكلاسيكية الجديدة)
  alternativeNames_ar: string[]; // مدرسة الصنعة اللفظية، الكلاسيكية العربية
  westernEquivalent_ar: string; // المذهب الكلاسيكي الغربي (Le Classicisme)
  principlesAndCharacteristics_ar: Array<{
    title_ar: string;
    description_ar: string;
    evidenceInPoetry_ar: string; // الشاهد الشعري من نصوص الرواد
  }>;
  formCharacteristics_ar: string[];    // خصائص المدرسة من حيث الشكل (الوزن، القافية، التصريع، جزالة الألفاظ...)
  contentCharacteristics_ar: string[]; // خصائص المدرسة من حيث المضمون (الحنين للوطن، المعارضة الشعرية، الفخر...)
}

/**
 * Ministerial Critical Evaluation Question & Official Answer (أسئلة التقويم النقدي)
 */
export interface MinisterialCriticalQuestion {
  id: string;
  question_ar: string;          // نص السؤال الوزاري كما يرد في البكالوريا
  officialAnswer_ar: string;    // الإجابة النموذجية المعتمدة في السلم الوزاري
  officialBaremePoints: number; // النقطة المخصصة (عادة من 3 إلى 4 نقاط)
  typicalMistakes_ar: string[]; // الأخطاء الشائعة التي تحرم التلميذ من النقطة
  pastBacSessions: string[];    // الدورات التي تكرر فيها السؤال
}

/**
 * Literary Topic & Movement Specification (موضوع التقويم النقدي)
 */
export interface ArabicLiteraryTopic {
  id: string;
  phenomenonTitle_ar: string;   // الظاهرة الأدبية (مثلاً: شعر المنفى ومدرسة البعث والإحياء)
  period_ar: string;            // العصر الأدبي (عصر النهضة الحديث)
  historicalContext_ar: string; // السياق التاريخي والأسباب السياسية والاجتماعية
  pioneers: LiteraryPioneer[];
  literarySchool: LiterarySchoolCharacteristics;
  ministerialCriticalQuestions: MinisterialCriticalQuestion[];
}

/**
 * Certified Teacher Video Resource for Arabic
 */
export interface ArabicVideoResource {
  id: string;
  teacherName_ar: string;       // مثل "الأستاذ خالد حماش" أو "الأستاذ مروان بن غالم"
  platform: "youtube" | "internal";
  videoUrl: string;
  title_ar: string;
  durationMinutes: number;
  targetedConcept_ar: string;
  keyTimestamps?: Array<{
    label_ar: string;
    startSeconds: number;
  }>;
}

/**
 * Bareme Criterion for Arabic Language Exam (20 points total)
 * Structure: البناء الفكري (8-10 ن) + البناء اللغوي (6-8 ن) + التقويم النقدي (4 ن)
 */
export interface ArabicBaremeCriterion {
  stage: "intellectual" | "linguistic" | "critical_evaluation";
  stageTitle_ar: string;
  maxPoints: number;
  subCriteria: Array<{
    description_ar: string;
    points: number;
  }>;
  evaluationTips_ar: string[];
}

/**
 * Main Comprehensive Arabic Lesson Specification
 */
export interface ArabicLesson {
  id: string;
  slug: string;
  unitId: string;
  unitTitle_ar: string;         // مثلاً: "الوحدة الأولى: في شعر المنفى وقواعد (إذا، إذ، حينئذ، إذن)"
  subjectId: SubjectId;         // "arabic"
  streamId: StreamId;           // "lettres_philo"

  // 1. البناء الفكري (المضمون الشعري والتحليل الدلالي)
  intellectualConstruction: {
    centralTheme_ar: string;     // الفكرة العامة للنص
    mainIdeas_ar: string[];      // الأفكار الأساسية
    textSummaryGuide_ar: {       // منهجية تلخيص النص (تقنية التلخيص 3 ن)
      method_ar: string;
      goldenRules_ar: string[];
      sampleModelSummary_ar: string;
    };
    emotionalAttitude_ar: string; // النزعات والعواطف والمواقف (الحنين، الألم، الفخر...)
    poemAtmosphere_ar: string;    // الجو النفسي للقصيدة
    dominantPattern_ar: string;   // النمط الغالب ومؤشراته (وصفي، سردي، حجاجي...)
  };

  // 2. البناء اللغوي (القواعد، البلاغة، الاتساق والانسجام، العروض)
  linguisticConstruction: {
    grammarRules: ArabicGrammarRule[]; // القواعد الإعرابية المقررة في الوحدة
    imageryAndRhetoric: Array<{        // الصور البيانية المقررة مع سر البلاغة
      type: "simile" | "metaphor" | "metonymy";
      title_ar: string;
      example_ar: string;
      rhetoricalSecret_ar: string;
    }>;
    cohesionAndCoherence_ar: {         // مظاهر الاتساق والانسجام
      connectiveTools_ar: string[];    // أدوات الربط والوصل
      referenceSystem_ar: string[];    // الضمائر وأسماء الإشارة ودورها في الإحالة القبلية والبعدية
      semanticField_ar: {
        domain_ar: string;             // الحقل الدلالي السائد
        terms_ar: string[];            // الألفاظ المنتمية إليه
      };
    };
    prosodyAndMeter?: {                // العروض والتقطيع الشعري
      meterName_ar: string;            // البحر الشعري (مثلاً: بحر الطويل أو البسيط)
      qafiya_ar: string;               // القافية وحروفها
      rawiyy_ar: string;               // الروي وحركته
    };
  };

  // 3. التقويم النقدي (شعر المنفى ومدارس الأدب) — 04 نقاط لشعبة الآداب والفلسفة
  criticalEvaluation: ArabicLiteraryTopic;

  // 4. الموارد التعليمية المعتمدة
  videoSources: ArabicVideoResource[];

  // 5. شبكة السلم الوزاري الرسمي
  officialBareme: ArabicBaremeCriterion[];

  metadata: {
    academicYear: string;
    bacExamReferences: string[];
    difficultyLevel: "intermediate" | "advanced";
  };
}
