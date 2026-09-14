/**
 * BAC Mastery — Philosophy Essay Pedagogical Architecture
 * Specifically designed for Stream: Lettres et Philosophie (شعبة الآداب والفلسفة)
 * 
 * Defines authoritative structures for philosophical essay lessons, methodology types,
 * thesis/antithesis/synthesis paradigms, quotes, real-life examples, video resources,
 * and methodology fallacies.
 */

import { SubjectId, StreamId } from "@/types/education";
import { ErrorCategory } from "@/types/error-lab";

/**
 * 1. Methodology Types for Algerian BAC Philosophy
 * - dialectic: الطريقة الجدلية (قضية ضد نقيضها مع التركيب)
 * - investigation_defense: استقصاء بالوضع (الدفاع عن أطروحة وتبنيها)
 * - comparison: طريقة المقارنة (أوجه الاختلاف والتشابه ومواطن التداخل)
 * - text_analysis: طريقة تحليل نص فلسفي (موقف صاحب النص وحججه ونقده)
 */
export type PhilosophyMethodType =
  | "dialectic"
  | "investigation_defense"
  | "comparison"
  | "text_analysis";

/**
 * 2. Synthesis Approach Types in Dialectical Essays
 * - compromise (التوفيق / التركيب التوفيقي): الجمع والتكامل بين الموقفين
 * - preference (التغليب / التركيب التغليبي): ترجيح أحد الموقفين بحجة كافية وقاطعة
 * - transcendence (التجاوز / التركيب التجاوزي): تجاوز الموقفين معاً إلى أفق فلسفي أعلى
 */
export type SynthesisApproachType =
  | "compromise"
  | "preference"
  | "transcendence";

/**
 * Philosophical Schools recognized in the official curriculum
 */
export type PhilosophicalSchool =
  | "rationalism"         // المذهب العقلي
  | "empiricism"           // المذهب الحسي / التجريبي
  | "gestalt"              // النظرية الغشتالتية (الشكلية)
  | "phenomenology"        // المذهب الظواهري (الفينومينولوجي)
  | "existentialism"       // المذهب الوجودي
  | "pragmatism"           // المذهب البراغماتي (النفعي)
  | "critical_idealism"    // الفلسفة النقدية الكانطية
  | "materialism"          // المذهب المادي / التجريبي الحديث
  | "sociological"         // النزعة الاجتماعية السوسيولوجية (دوركايم وهالبواكس)
  | "islamic_philosophy"   // الفلسفة الإسلامية
  | "classic_philosophy";  // الفلسفة اليونانية الكلاسيكية

/**
 * Authoritative philosophical quote with pedagogical context
 */
export interface PhilosophicalQuote {
  id: string;
  quote_ar: string;
  philosopher: string;
  sourceBook_ar?: string;
  context_ar?: string;
  usageGuidance_ar: string; // كيف يستشهد بها الطالب بذكاء في المقال لتفادي الحشو
}

/**
 * Real-life empirical example grounding abstract philosophical ideas
 */
export interface RealLifeExample {
  id: string;
  title_ar: string;
  description_ar: string;
  domain:
    | "everyday_life"      // الواقع اليومي المعاش
    | "scientific_fact"    // حقيقة علمية أو تجربة نفسية/فيزيولوجية
    | "history_of_ideas"   // محطة تاريخية
    | "art_and_culture"    // الأدب والفن
    | "social_phenomena";  // ظاهرة اجتماعية
  pedagogicalValue_ar: string; // كيف يبرهن هذا المثال على الموقف في سلم التصحيح
}

/**
 * Detailed structure for a philosophical position (Thesis or Antithesis)
 */
export interface PositionView {
  title_ar: string;
  thesisStatement_ar: string;
  representatives: string[]; // أسماء الفلاسفة (ديكارت، كانط، دافيد هيوم...)
  schools: PhilosophicalSchool[];
  arguments_ar: Array<{
    id: string;
    premise_ar: string;
    explanation_ar: string;
  }>;
  quotes: PhilosophicalQuote[];
  realLifeExamples: RealLifeExample[];
  critique: {
    positiveAspect_ar: string; // قيمة الموقف وتثمينه (لا يمكن إنكار ما قدمه هذا الاتجاه...)
    negativeAspect_ar: string; // حدود الموقف ونقائصه (لكنهم بالغوا في... وأهملوا...)
  };
}

/**
 * Synthesis structure (محطة التركيب)
 */
export interface SynthesisView {
  approachType: SynthesisApproachType;
  title_ar: string;
  rationale_ar: string;       // تبرير اختيار هذا النوع من التركيب (توفيق/تغليب/تجاوز)
  synthesizedThesis_ar: string;
  arguments_ar: string[];
  quotes: PhilosophicalQuote[];
  realLifeExamples: RealLifeExample[];
  personalOpinion: {
    opinion_ar: string;
    justification_ar: string; // التبرير الإلزامي لنيل النقطة الكاملة في البكالوريا
  };
}

/**
 * Verified teacher video resource
 */
export interface PhilosophyVideoResource {
  id: string;
  teacherName_ar: string; // مثل "الأستاذ حمداش" أو "الأستاذ خليل سعيد"
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
 * Methodology and reasoning fallacies tracked in the Error Lab
 */
export interface CommonMethodologyFallacy {
  id: string;
  trapCode: string;
  trapTitle_ar: string;
  category: ErrorCategory;
  description_ar: string;
  dangerLevel: "critical" | "high" | "medium";
  bacPenaltyPoints: number; // تقدير النقاط المفقودة في البكالوريا (من 0.5 إلى 4 نقاط)
  badExample_ar: string;
  correctRemedy_ar: string;
  twinRetestSkillId: string; // معرف مهارة اختبار التوأم لمعالجة هذا الخطأ
}

/**
 * Ministerial Bareme (سلم التصحيح الوزاري المعتمد)
 */
export interface PhilosophyBaremeCriterion {
  stage: "introduction" | "thesis" | "antithesis" | "synthesis" | "conclusion";
  stageTitle_ar: string;
  maxPoints: number;
  subCriteria: Array<{
    description_ar: string;
    points: number;
  }>;
  evaluationTips_ar: string[];
}

/**
 * Main Philosophy Essay Lesson Specification
 */
export interface PhilosophyEssayLesson {
  id: string;
  slug: string;
  unitId: string;
  unitTitle_ar: string;      // مثلاً: "الإشكالية الأولى: في إدراك العالم الخارجي"
  issueTitle_ar: string;     // مثلاً: "المشكلة الأولى: الإحساس والإدراك"
  subjectId: SubjectId;      // "philosophy"
  streamId: StreamId;        // "lettres_philo"
  methodType: PhilosophyMethodType;
  
  // 1. طرح المشكلة (المقدمة)
  introduction: {
    context_ar: string;            // التمهيد الوظيفي
    philosophicalParadox_ar: string; // العناد الفلسفي والمفارقة
    problemQuestion_ar: string;     // صياغة الإشكال بدقة وسلامة لغوية
    guidanceNotes_ar: string[];
  };

  // 2. محاولة حل المشكلة (العرض)
  thesis: PositionView;            // الموقف الأول
  antithesis: PositionView;        // الموقف النقيض
  synthesis: SynthesisView;         // التركيب وتبرير الرأي الشخصي

  // 3. حل المشكلة (الخاتمة)
  conclusion: {
    resolution_ar: string;          // النتيجة النهائية المتسقة منطقياً مع التحليل
    epistemicValue_ar: string;      // القيمة المعرفية والإجابة المباشرة عن الإشكال
    openHorizonQuestion_ar?: string; // أفق فلسفي متجدد دون إثارة تناقض
  };

  // 4. الموارد المساعدة وفخاخ الأخطاء وسلالم التنقيط
  videoSources: PhilosophyVideoResource[];
  commonFallacies: CommonMethodologyFallacy[];
  officialBareme: PhilosophyBaremeCriterion[];

  metadata: {
    academicYear: string;
    bacExamReferences?: string[]; // دورات البكالوريا التي ورد فيها هذا الموضوع (مثلاً BAC 2022, BAC 2019)
    estimatedWritingMinutes: number; // عادة 180 إلى 210 دقيقة في الامتحان الرسمي
    difficultyLevel: "intermediate" | "advanced";
  };
}
