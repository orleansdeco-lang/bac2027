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

export type HistoricalStreamId =
  | "sciences_nature_vie"
  | "sciences_exactes"
  | "technologie"
  | "sciences_eco_gestion"
  | "lettres_sciences_humaines"
  | "lettres_langues_vivantes";

export type ExtendedStreamId = StreamId | "arts" | HistoricalStreamId;

export type TechniqueMathSpecialty =
  | "civil_eng"
  | "mechanical_eng"
  | "electrical_eng"
  | "process_eng";

export type StandardSubjectId =
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

export type ExtendedSubjectId =
  | StandardSubjectId
  | "german"
  | "spanish"
  | "italian"
  | "tamazight"
  | "art_specialty"
  | "art_history";

export type SubjectId = StandardSubjectId;

export interface Subject<S = SubjectId> {
  id: S;
  code: string;
  name_ar: string;
  name_fr: string;
  isScientific: boolean;
}

export type ExtendedSubject = Subject<ExtendedSubjectId>;

export interface StreamSubjectRule<S = SubjectId> {
  subjectId: S;
  coefficient: number;
  isCoreSubject: boolean;
}

export interface Stream<T = StreamId, S = SubjectId> {
  id: T;
  examType: ExamType;
  code: string;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  subjects: StreamSubjectRule<S>[];
}

export type ExtendedStream = Stream<ExtendedStreamId, ExtendedSubjectId>;
