/**
 * BAC Mastery - Student & Goal Engine Types
 */

import { ExamType, StreamId, SubjectId, TechniqueMathSpecialty } from "./education";
import { StudentStatus, StudyMethodType, CurrentSelfAssessmentType } from "./registration";
import { AvailableTimeRange, StudyEnergyState } from "./onboarding";

export interface StudentProfile {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  studentPhone?: string;
  parentPhone?: string;
  studentStatus?: StudentStatus;
  examType?: ExamType;
  streamId: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  currentTerm?: 1 | 2 | 3;
  current_term?: 1 | 2 | 3;
  wilayaCode?: string;
  wilayaName?: string;
  communeCode?: string;
  communeName?: string;
  schoolName?: string | null;
  targetScore?: number;
  targetExamYear?: number;
  targetSpecialty?: string | null;
  studyMethods?: StudyMethodType[];
  currentSelfAssessment?: CurrentSelfAssessmentType;
  availableTime?: AvailableTimeRange;
  studyEnergy?: StudyEnergyState;
  trialStartedAt?: string;
  trialExpiresAt?: string;
  trialStatus?: string;
  isTrialActive?: boolean;
  canUseProduct?: boolean;
  registrationCompletedAt?: string | null;
  academicProfileCompletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
