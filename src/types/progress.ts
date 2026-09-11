/**
 * BAC Mastery - Progress & Exam Mode Engine Types
 */

import { SubjectId } from "./education";

export interface ProgressSummary {
  studentId: string;
  targetOverallScore: number;
  currentEstimatedOverall: number;
  overallGap: number;
  masteryPercentage: number;
  activeBottleneckSubject: SubjectId;
  totalMissionsCompleted: number;
  totalErrorsLogged: number;
  totalErrorsRepaired: number;
  errorRepairRatePercentage: number;
  examReadinessIndex: number; // 0 - 100
  isExamModeActive: boolean;
  daysUntilBAC?: number;
}

export interface WeeklyReview {
  id: string;
  studentId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  missionsCompleted: number;
  missionsPlanned: number;
  pointsGainedEstimate: number;
  errorsResolvedCount: number;
  dominantMindState: string;
  nextWeekFocus_ar: string;
  nextWeekFocus_fr: string;
}
