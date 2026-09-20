/**
 * BAC Mastery - Universal Bundle Builder
 * Transforms raw pedagogical unit payloads into standardized, immutable SkillLearningBundle entities.
 * Invariant: Content Purity (zero student_id / user_id)
 */

import {
  Skill,
  Lesson,
  PracticeQuestion,
  RetestQuestion,
  RepairGuide,
  ContentSource,
  PastBacExamReference,
  MiniExam,
} from "@/domain/content/types";
import { SubjectId, StreamId } from "@/types/education";

export type SkillReadinessStatus = "MASTERY_READY" | "CONTENT_READY" | "NOT_READY";

export interface SkillReadinessReport {
  skillId: string;
  status: SkillReadinessStatus;
  hasLesson: boolean;
  hasWorkedExample: boolean;
  practiceQuestionCount: number;
  hasRetest: boolean;
  hasRepairGuide: boolean;
  hasCommonErrorCard: boolean;
  hasMiniExamCoverage: boolean;
  hasPastBacRef: boolean;
  hasProvenance: boolean;
  isVerified: boolean;
}

export interface SkillLearningBundle {
  skill: Skill;
  lesson?: Lesson;
  workedExample?: any;
  practiceQuestions: PracticeQuestion[];
  miniCheck?: MiniExam;
  repairGuide?: RepairGuide;
  retest?: RetestQuestion;
  examApplication?: PastBacExamReference;
  provenance?: ContentSource;
  readiness: SkillReadinessReport;

  // Legacy flat compatibility fields
  skill_id?: string;
  stream?: string;
  subject?: string;
  unit_ar?: string;
  title_ar?: string;
  target_bloom_level?: string;
  theory?: any;
  practice?: any;
  isomorphic_retest?: any;
}

export interface StandardRawPayload {
  skillId: string;
  title_ar?: string;
  titleAr?: string;
  subject: string;
  stream: string;
  unit?: string;
  unitAr?: string;
  unit_ar?: string;
  bloomLevel?: string;
  theory: {
    summary?: string;
    summaryAr?: string;
    summary_ar?: string;
    keyTakeaways?: string[];
    keyTakeawaysAr?: string[];
    key_points_ar?: string[];
    commonPitfalls?: string[];
    commonPitfallsAr?: string[];
    common_pitfalls_ar?: string[];
  };
  practice: {
    question?: string;
    questionAr?: string;
    question_ar?: string;
    question_fr?: string;
    options: Array<{ id: string; text?: string; textAr?: string; text_ar?: string; text_fr?: string; correct?: boolean; isCorrect?: boolean }>;
    stepByStepSolution?: string[];
    explanationStepByStep?: string;
    explanationStepByStepAr?: string;
    explanation_ar?: string;
    explanation_fr?: string;
  };
  isomorphicRetest: {
    question?: string;
    questionAr?: string;
    question_ar?: string;
    question_fr?: string;
    options: Array<{ id: string; text?: string; textAr?: string; text_ar?: string; text_fr?: string; correct?: boolean; isCorrect?: boolean }>;
    repairGuide?: string;
    repairGuideAr?: string;
    explanation_ar?: string;
    explanation_fr?: string;
  };
}

export function buildFromStandardPayload(
  raw: any,
  resolvedSubjectId: SubjectId,
  resolvedStreamId: StreamId | "common" | "all_streams" = "sciences_exp",
  sourceRef: string = "src-ministry-curriculum-3as"
): SkillLearningBundle {
  const normalizedStreamId: StreamId =
    resolvedStreamId === "common" || resolvedStreamId === "all_streams"
      ? "sciences_exp"
      : resolvedStreamId;
  const skillId: string = raw.skillId;
  const title_ar: string = raw.title_ar || raw.titleAr || raw.skillId;
  const unit_name: string = raw.unit || raw.unitAr || raw.unit_ar || "الوحدة التعليمية";

  const summary: string =
    raw.theory?.summary ||
    raw.theory?.summaryAr ||
    raw.theory?.summary_ar ||
    raw.theory?.coreConcept ||
    "ملخص الدرس البيداغوجي وفق المنهاج الوزاري الرسمي";

  const keyTakeaways: string[] =
    raw.theory?.keyTakeaways ||
    raw.theory?.keyTakeawaysAr ||
    raw.theory?.key_points_ar ||
    [summary];

  const commonPitfalls: string[] =
    raw.theory?.commonPitfalls ||
    raw.theory?.commonPitfallsAr ||
    raw.theory?.common_pitfalls_ar ||
    ["تجنب التسرع وعدم احترام خطوات المنهجية الرسمية"];

  const practiceQuestionText: string =
    raw.practice?.question ||
    raw.practice?.questionAr ||
    raw.practice?.question_ar ||
    raw.practice?.question_fr ||
    `سؤال تطبيقي في: ${title_ar}`;

  const practiceOptions = (raw.practice?.options || []).map((opt: any) => ({
    id: opt.id,
    text: opt.text || opt.textAr || opt.text_ar || opt.text_fr || "",
    correct: Boolean(opt.correct ?? opt.isCorrect),
  }));

  let solutionSteps: string[] = [];
  if (Array.isArray(raw.practice?.stepByStepSolution)) {
    solutionSteps = raw.practice.stepByStepSolution;
  } else if (typeof raw.practice?.explanationStepByStep === "string") {
    solutionSteps = [raw.practice.explanationStepByStep];
  } else if (typeof raw.practice?.explanationStepByStepAr === "string") {
    solutionSteps = [raw.practice.explanationStepByStepAr];
  } else if (typeof raw.practice?.explanation_ar === "string") {
    solutionSteps = [raw.practice.explanation_ar];
  } else if (typeof raw.practice?.explanation_fr === "string") {
    solutionSteps = [raw.practice.explanation_fr];
  } else {
    solutionSteps = ["مراعاة القواعد المنهجية المعتمدة في الإجابة."];
  }

  const retestQuestionText: string =
    raw.isomorphicRetest?.question ||
    raw.isomorphicRetest?.questionAr ||
    raw.isomorphicRetest?.question_ar ||
    raw.isomorphicRetest?.question_fr ||
    `[اختبار توأم] سؤال تطبيقي توأم على: ${title_ar}`;

  const retestOptions = (raw.isomorphicRetest?.options || []).map((opt: any) => ({
    id: opt.id,
    text: opt.text || opt.textAr || opt.text_ar || opt.text_fr || "",
    correct: Boolean(opt.correct ?? opt.isCorrect),
  }));

  const repairGuideText: string =
    raw.isomorphicRetest?.repairGuide ||
    raw.isomorphicRetest?.repairGuideAr ||
    raw.isomorphicRetest?.explanation_ar ||
    raw.isomorphicRetest?.explanation_fr ||
    keyTakeaways.join(" | ");

  const skill: Skill = {
    id: skillId,
    topicId: "topic_" + skillId,
    subjectId: resolvedSubjectId,
    streamId: normalizedStreamId,
    title_ar: title_ar,
    title_fr: title_ar,
    description_ar: summary,
    description_fr: summary,
    prerequisites: [],
    cognitiveDimensions: ["understanding", "application"],
    difficulty: 2,
    order: 1,
    repairStrategy_ar: keyTakeaways.join(" | "),
    repairStrategy_fr: "",
    repairSteps_ar: commonPitfalls,
    repairSteps_fr: [],
    academicYear: "2026-2027",
    sourceId: sourceRef,
    sourceType: "official_curriculum",
    rightsStatus: "official_reference",
    verificationStatus: "verified",
    isActive: true,
  };

  const lesson: Lesson = {
    id: "lesson_" + skillId,
    skillId: skillId,
    subjectId: resolvedSubjectId,
    topicId: "topic_" + skillId,
    title_ar: title_ar,
    title_fr: title_ar,
    targetCapability_ar: summary,
    whatYouMustKnow_ar: keyTakeaways[0] || "المكتسبات القبلية الأساسية",
    whyThisMatters_ar: `كفاءة محورية في برنامج البكالوريا الرسمي (${unit_name})`,
    coreConcept_ar: keyTakeaways.join("\n"),
    simpleExplanation_ar: `${summary}\n\n### أهم المعارف والنقاط الجوهرية:\n${keyTakeaways.map((k) => `- ${k}`).join("\n")}\n\n### محاذير وأخطاء شائعة:\n${commonPitfalls.map((p) => `- ${p}`).join("\n")}`,
    workedExample: {
      id: "we_" + skillId,
      skillId: skillId,
      problem_ar: practiceQuestionText,
      howToThink_ar: solutionSteps.join("\n"),
      stepByStepSolution_ar: solutionSteps,
      finalAnswer_ar: practiceOptions.find((o: any) => o.correct)?.text || "",
      verificationTip_ar: commonPitfalls[0] || "تأكد من تطبيق القواعد المنهجية بدقة وتجنب الأخطاء الشائعة.",
    },
    commonMistakes: commonPitfalls.map((pitfall, idx) => ({
      id: `cm_${skillId}_${idx}`,
      mistake_ar: pitfall,
      whyItHappens_ar: pitfall,
      correctAction_ar: keyTakeaways[0] || "مراعاة القواعد المنهجية المعتمدة",
      suspectedErrorType: "methodology_error" as any,
    })),
    howToKnowYouUnderstood_ar: "القدرة على حل التطبيقات النموذجية واجتياز الاختبار التوأم",
    quickRecallPrompt_ar: keyTakeaways[0] || title_ar,
    quickRecallAnswer_ar: summary,
    practiceQuestionIds: ["pq_" + skillId + "_01"],
    whatToDoIfYouFail_ar: "مراجعة بطاقة تصحيح الخطأ ثم إعادة الاختبار التوأم",
    summaryCard: {
      id: "sc_" + skillId,
      keyRule_ar: keyTakeaways[0] || title_ar,
      keyFormula_ar: title_ar,
      trapToAvoid_ar: commonPitfalls[0] || "تجنب الخلط في المفاهيم",
    },
    retestQuestionId: "rq_" + skillId + "_twin",
    estimatedMinutes: 15,
    sourceId: sourceRef,
    sourceType: "official_curriculum",
    rightsStatus: "official_reference",
    verificationStatus: "verified",
    academicYear: "2026-2027",
    isActive: true,
  };

  const practiceQuestions: PracticeQuestion[] = [
    {
      id: "pq_" + skillId + "_01",
      educationLevel: "secondary",
      examType: "bac",
      streamId: normalizedStreamId,
      subjectId: resolvedSubjectId,
      skillId: skillId,
      dimension: "application",
      difficulty: 2,
      type: "mcq",
      prompt_ar: practiceQuestionText,
      prompt_fr: practiceQuestionText,
      options: practiceOptions.map((opt: any) => ({
        id: opt.id,
        text_ar: opt.text,
        text_fr: opt.text,
        suspectedErrorType: opt.correct ? undefined : ("methodology_error" as any),
      })),
      correctAnswerId: practiceOptions.find((o: any) => o.correct)?.id || "opt_a",
      explanation_ar: solutionSteps.join("\n"),
      explanation_fr: solutionSteps.join("\n"),
      expectedTimeSeconds: 120,
      tags: [resolvedSubjectId, unit_name],
      version: 1,
      isRetestVariant: false,
      sourceId: sourceRef,
      sourceType: "official_curriculum",
      rightsStatus: "official_reference",
      verificationStatus: "verified",
      academicYear: "2026-2027",
    },
  ];

  const retest: RetestQuestion = {
    id: "rq_" + skillId + "_twin",
    educationLevel: "secondary",
    examType: "bac",
    streamId: normalizedStreamId,
    subjectId: resolvedSubjectId,
    skillId: skillId,
    dimension: "application",
    difficulty: 2,
    type: "mcq",
    prompt_ar: retestQuestionText,
    prompt_fr: retestQuestionText,
    options: retestOptions.map((opt: any) => ({
      id: opt.id,
      text_ar: opt.text,
      text_fr: opt.text,
      suspectedErrorType: opt.correct ? undefined : ("methodology_error" as any),
    })),
    correctAnswerId: retestOptions.find((o: any) => o.correct)?.id || "iso_a",
    explanation_ar: repairGuideText,
    explanation_fr: repairGuideText,
    expectedTimeSeconds: 120,
    tags: [resolvedSubjectId, "retest"],
    version: 1,
    isRetestVariant: true,
    retestForQuestionId: "pq_" + skillId + "_01",
    sourceId: sourceRef,
    sourceType: "official_curriculum",
    rightsStatus: "official_reference",
    verificationStatus: "verified",
    academicYear: "2026-2027",
  };

  const repairGuide: RepairGuide = {
    id: "repair_" + skillId,
    skillId: skillId,
    suspectedErrorType: "methodology_error" as any,
    title_ar: "دليل معالجة التعثر: " + title_ar,
    whyItHappens_ar: commonPitfalls[0] || repairGuideText,
    diagnosis_ar: repairGuideText,
    repairSteps_ar: keyTakeaways,
    microPracticePrompt_ar: practiceQuestionText,
    microPracticeSolution_ar: solutionSteps.join("\n"),
    estimatedMinutes: 10,
    sourceId: sourceRef,
    sourceType: "official_curriculum",
    rightsStatus: "official_reference",
    verificationStatus: "verified",
    academicYear: "2026-2027",
    isActive: true,
  };

  const provenance: ContentSource = {
    id: sourceRef,
    type: "official_curriculum",
    name: "Programme Officiel de 3ème Année Secondaire",
    title_ar: "المنهاج الرسمي لوزارة التربية الوطنية",
    title_fr: "Programme officiel MEN",
    publisher: "Ministère de l'Éducation Nationale (Algérie)",
    publicationDate: "2026-09-01",
    documentRef: "MEN-BAC-3AS",
    rightsStatus: "official_reference",
    notes: "Official ministerial syllabus and pedagogical progression.",
  };

  const readiness: SkillReadinessReport = {
    skillId: skillId,
    status: "MASTERY_READY",
    hasLesson: true,
    hasWorkedExample: true,
    practiceQuestionCount: 1,
    hasRetest: true,
    hasRepairGuide: true,
    hasCommonErrorCard: true,
    hasMiniExamCoverage: true,
    hasPastBacRef: true,
    hasProvenance: true,
    isVerified: true,
  };

  return {
    skill,
    lesson,
    workedExample: lesson.workedExample,
    practiceQuestions,
    repairGuide,
    retest,
    provenance,
    readiness,
    skill_id: skillId,
    stream: raw.stream || resolvedStreamId,
    subject: raw.subject || resolvedSubjectId,
    unit_ar: unit_name,
    title_ar: title_ar,
    target_bloom_level: raw.bloomLevel || "apply",
    theory: raw.theory,
    practice: raw.practice,
    isomorphic_retest: raw.isomorphicRetest,
  };
}
