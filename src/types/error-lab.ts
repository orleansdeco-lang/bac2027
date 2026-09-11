/**
 * BAC Mastery - Error Lab Engine Types
 * Errors are precious data: Error -> Classify -> Understand -> Repair -> Retest
 */

import { SubjectId } from "./education";

export type ErrorCategory =
  | "forgot_information"   // نسيان المعلومة أو القاعدة
  | "did_not_understand"   // عدم فهم المفهوم أو الظاهرة
  | "method_unknown"       // عدم معرفة طريقة الحل
  | "calculation_error"    // خطأ في الحساب أو الإشارة
  | "misread_question"     // سوء قراءة نص السؤال
  | "rushed"               // التسرع وعدم التحقق
  | "lack_of_practice"     // نقص التدريب والتطبيق
  | "methodology_error"    // خطأ منهجي في صياغة الإجابة
  | "time_management"      // سوء توزيع الوقت في التمرين
  | "attention_error";     // عدم الانتباه للوحدات أو الشروط

export interface ErrorClassificationMeta {
  type: ErrorCategory;
  name_ar: string;
  name_fr: string;
  defaultRemediation_ar: string;
  defaultRemediation_fr: string;
}

export interface LoggedError {
  id: string;
  studentId: string;
  subjectId: SubjectId;
  topicTitle: string;
  exerciseReference?: string;
  category: ErrorCategory;
  studentNote?: string;
  isRepaired: boolean;
  repairAttemptCount: number;
  loggedAt: string;
  repairedAt?: string;
}

export interface RepairMissionPlan {
  errorLogId: string;
  subjectId: SubjectId;
  category: ErrorCategory;
  actionRequired_ar: string;
  actionRequired_fr: string;
  retestRequired: boolean;
  status: "pending" | "in_progress" | "repaired";
}
