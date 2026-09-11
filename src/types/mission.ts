/**
 * BAC Mastery - Missions Engine Types
 * Core pedagogical loop: Diagnostic -> Mission -> Practice -> Error -> Repair -> Retest -> Mastery
 */

import { SubjectId, StreamId, ExamType, EducationLevel } from "./education";
import { DiagnosticDimension } from "./diagnostic";

export type MissionType =
  | "understand"    // فهم وبناء المفهوم
  | "practice"      // حل تمارين محددة
  | "error_review"  // مراجعة أخطاء سابقة
  | "mini_test"     // اختبار مصغر للتحقق
  | "rest_reset";   // راحة واسترجاع طاقة

export type MissionStatus =
  | "available"
  | "in_progress"
  | "repair_needed"
  | "retest_ready"
  | "needs_more_work"
  | "mastered"
  | "pending"
  | "completed";

export type MissionPriority = "high" | "medium" | "low";

export type MissionSource =
  | "diagnostic_bottleneck"
  | "diagnostic_dimension"
  | "manual";

/**
 * Targeted academic competence / skill model
 */
export interface Skill {
  id: string;
  topicId?: string;
  subjectId: SubjectId;
  streamId?: StreamId;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  dimensions: DiagnosticDimension[];
  cognitiveDimensions?: DiagnosticDimension[];
  prerequisites?: string[];
  difficulty?: 1 | 2 | 3;
  order?: number;
  isActive?: boolean;
  repairStrategy_ar: string;
  repairStrategy_fr: string;
  repairSteps_ar: string[];
  repairSteps_fr: string[];
}

/**
 * Practice question option
 */
export interface PracticeOption {
  id: string;
  text_ar: string;
  text_fr: string;
  suspectedErrorType?: SuspectedErrorType;
}

/**
 * Practice question model
 */
export interface PracticeQuestion {
  id: string;
  educationLevel: "secondary";
  examType: "bac";
  streamId: StreamId;
  subjectId: SubjectId;
  skillId: string;
  dimension: DiagnosticDimension;
  difficulty: 1 | 2 | 3;
  type: "mcq" | "short_answer" | "true_false";
  prompt_ar: string;
  prompt_fr: string;
  options: PracticeOption[];
  correctAnswerId: string;
  explanation_ar: string;
  explanation_fr: string;
  repairHint_ar?: string;
  repairHint_fr?: string;
  expectedTimeSeconds: number; // Product benchmark estimate, not ministerial
  tags: string[];
  version: number;
  isRetestVariant?: boolean;
  retestForQuestionId?: string;
}

/**
 * Core Mission entity
 */
export interface Mission {
  id: string;
  educationLevel: "secondary";
  examType: "bac";
  streamId: StreamId;
  subjectId: SubjectId;
  skillId: string;
  title: string;
  description: string;
  reason: string;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  reason_ar: string;
  reason_fr: string;
  priority: MissionPriority;
  source: MissionSource;
  status: MissionStatus;
  practiceQuestionIds: string[];
  retestQuestionIds: string[];
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cognitive & methodological error taxonomy for Error Lab
 */
export type SuspectedErrorType =
  | "forgot_information"      // نسيت المعلومة
  | "misunderstood_concept"   // ما فهمتش الفكرة
  | "methodology_error"       // عرفت الفكرة بصح ما عرفتش نطبقها منهجياً
  | "calculation_error"       // غلطت في الحساب
  | "misread_question"        // ما فهمتش السؤال مليح
  | "rushed"                  // استعجلت
  | "lack_of_practice"        // نحتاج تمارين أكثر
  | "time_management"         // مشكل في تسيير الوقت
  | "attention_error"         // قلة تركيز
  | "unknown";                // ما نعرفش

export type ErrorSource =
  | "system_inferred"
  | "student_selected"
  | "confirmed";

export type RepairStatus =
  | "identified"
  | "repair_started"
  | "repair_completed"
  | "retest_passed"
  | "retest_failed";

/**
 * Record representing a mistake tracked in Error Lab
 */
export interface ErrorRecord {
  id: string;
  studentId?: string;
  sessionId: string;
  questionId: string;
  missionId: string;
  subjectId: SubjectId;
  skillId: string;
  selectedAnswer: string;
  correctAnswer: string;
  suspectedErrorType: SuspectedErrorType;
  errorSource: ErrorSource;
  confidence: 1 | 2 | 3 | 4 | 5;
  repairStatus: RepairStatus;
  isRecurring?: boolean;
  attemptCount?: number;
  retestFailureCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Single response within a practice session
 */
export interface PracticeResponse {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  responseTimeSeconds?: number;
  confidence: 1 | 2 | 3 | 4 | 5;
  errorRecordId?: string;
}

/**
 * Practice session tracker
 */
export interface PracticeSession {
  id: string;
  missionId: string;
  questionIds: string[];
  currentQuestionIndex: number;
  startedAt: string;
  completedAt?: string;
  responses: PracticeResponse[];
  status: "active" | "completed" | "repair_needed" | "retest";
  isRetest?: boolean;
}

/**
 * Three-tier evidence-based mastery status
 * - not_yet: Insufficient evidence
 * - emerging: Initial practice success, unverified
 * - demonstrated: Error diagnosed, repaired, and validated via retest
 */
export type MasteryStatus = "not_yet" | "emerging" | "demonstrated";

/**
 * Evidence of mastery for a skill
 */
export interface MasteryEvidence {
  missionId: string;
  skillId: string;
  subjectId: SubjectId;
  evidenceType: "practice_success" | "repair_retest_success" | "verification_success";
  practiceAttempts: number;
  correctAttempts: number;
  retestAttempts: number;
  successfulRetests: number;
  confidenceSignals: number[];
  masteryStatus: MasteryStatus;
  achievedAt?: string;
  // Backward compatibility fields
  masteredAt?: string;
  retestQuestionId?: string;
  retestConfidence?: number;
  status?: "mastered" | "needs_further_work";
}

/**
 * Backward compatibility models for daily scheduling
 */
export interface DailyMission {
  id: string;
  roadmapItemId?: string;
  subjectId: SubjectId;
  type: MissionType;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  estimatedDurationMin: number;
  actualDurationMin?: number;
  status: MissionStatus;
  priorityOrder: number;
  scheduledDate: string;
  completedAt?: string;
}

export interface DayMissionPlan {
  date: string;
  totalEstimatedMinutes: number;
  mindStateRecorded?: string;
  missions: DailyMission[];
  isRecoveryModeActive: boolean;
}
