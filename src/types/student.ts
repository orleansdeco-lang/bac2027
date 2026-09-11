/**
 * BAC Mastery - Student & Goal Engine Types
 */

import { ExamType, StreamId, SubjectId } from "./education";

export interface StudentProfile {
  id: string;
  fullName: string;
  examType: ExamType;
  streamId: StreamId;
  targetExamYear: number;
  createdAt: string;
}

export interface SubjectGoalTarget {
  subjectId: SubjectId;
  currentEstimatedScore: number; // 0 - 20
  targetScore: number;           // 0 - 20
}

export interface GoalSettings {
  studentId: string;
  targetOverallScore: number;       // e.g. 16.50
  currentEstimatedOverall: number;  // e.g. 11.20
  weeklyStudyHours: number;         // e.g. 15 hours
  desiredSpecialty: string;         // e.g. 'Médecine', 'ESI Alger', 'Polytechnique'
  subjectTargets: SubjectGoalTarget[];
  perceivedDifficulties: SubjectId[];
  updatedAt: string;
}
