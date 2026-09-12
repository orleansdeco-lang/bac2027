/**
 * BAC Mastery — Student Registration & Academic Profile Types
 */

import { StreamId, TechniqueMathSpecialty } from "./education";

export type StudentStatus = "schooled" | "free";

export type StudyMethodType =
  | "alone"
  | "with_teacher"
  | "private_lessons"
  | "with_friends"
  | "videos_youtube"
  | "mixed";

export type CurrentSelfAssessmentType = "good" | "average" | "weak" | "lost";

export interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  studentPhone: string;
  parentPhone?: string;
  studentStatus: StudentStatus;
  streamId: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  wilayaCode: string;
  wilayaName: string;
  communeCode: string;
  communeName: string;
  schoolName?: string | null;
  registrationCompletedAt?: string;
}

export interface AcademicProfileData {
  targetScore: number; // 0 to 20
  annualAverageYear1?: number | null;
  annualAverageYear1Remembered?: boolean;
  annualAverageYear2?: number | null;
  annualAverageYear2Remembered?: boolean;
  hasTargetSpecialty?: boolean | "undecided" | null;
  targetSpecialty?: string | null;
  studyMethods: StudyMethodType[];
  currentSelfAssessment: CurrentSelfAssessmentType;
  academicProfileCompletedAt?: string;
}

export interface CompleteStudentProfile extends StudentRegistrationData, AcademicProfileData {
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStep =
  | "identity"     // Step 1: Welcome & Identity
  | "status"       // Step 2: Student Status
  | "stream"       // Step 3: BAC Stream
  | "location"     // Step 4: Wilaya & Commune
  | "school"       // Step 5: School Name (Schooled only)
  | "confirmation";// Step 6: Confirmation Summary
