/**
 * BAC Mastery - AI Bridge Engine Types
 * Zero-API external intelligence report format exportable to ChatGPT, Claude, or Gemini.
 */

import { StreamId, SubjectId } from "./education";
import { ErrorCategory } from "./error-lab";

export interface AIBridgeReportPayload {
  studentProfile: {
    stream: StreamId;
    targetScore: number;
    currentEstimatedScore: number;
    weeksRemaining: number;
    weeklyStudyHoursBudget: number;
    desiredSpecialty: string;
  };
  bottlenecks: {
    primarySubject: SubjectId;
    secondarySubject?: SubjectId;
    reason: string;
  };
  errorDistribution: {
    category: ErrorCategory;
    count: number;
    sampleDescription?: string;
  }[];
  recentActivity: {
    missionsCompletedLast7Days: number;
    dominantMindState: string;
  };
}

export interface FormattedAIReport {
  markdownContent: string;
  suggestedPrompt: string;
  recommendedAI: ("ChatGPT" | "Claude" | "Gemini")[];
  generatedAt: string;
}
