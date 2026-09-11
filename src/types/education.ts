/**
 * BAC Mastery - Educational Structure Types
 * Designed to be STREAM-AGNOSTIC and EXAM-AGNOSTIC (supports BAC & future BEM).
 */

export type ExamType = "BAC" | "BEM";

export type EducationLevel = "secondary" | "middle_school";

export type StreamId =
  | "sciences_exp"
  | "math"
  | "technique_math"
  | "gestion_eco"
  | "lettres_philo"
  | "langues_etrangeres";

export type TechniqueMathSpecialty =
  | "civil_eng"
  | "mechanical_eng"
  | "electrical_eng"
  | "process_eng";

export type SubjectId =
  | "math"
  | "physics"
  | "natural_sciences"
  | "arabic"
  | "philosophy"
  | "french"
  | "english"
  | "islamic_studies"
  | "history_geography"
  | "accounting_finance"
  | "economics_management"
  | "law"
  | "mechanical_eng"
  | "civil_eng"
  | "electrical_eng"
  | "process_eng"
  | "third_language";

export interface Subject {
  id: SubjectId;
  code: string;
  name_ar: string;
  name_fr: string;
  isScientific: boolean;
}

export interface StreamSubjectRule {
  subjectId: SubjectId;
  coefficient: number;
  isCoreSubject: boolean;
}

export interface Stream {
  id: StreamId;
  examType: ExamType;
  code: string;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  subjects: StreamSubjectRule[];
}
