/**
 * BAC Mastery - Active Recall & Spaced Repetition Engine Types
 */

export type FlashQuestionType = "تاريخ" | "شخصية" | "مصطلح" | "سؤال فوري";

export interface FlashQuestion {
  id: string;
  stream: string;
  subject: string;
  term: 1 | 2 | 3;
  unit_code: string;
  lesson_id: string;
  question_type: FlashQuestionType;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  target_lesson_url: string;
  created_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  frequency_minutes: 30 | 60 | 120;
  active_hours_start: string; // HH:mm:ss or HH:mm
  active_hours_end: string;   // HH:mm:ss or HH:mm
  enabled_subjects: string[];
  push_subscription: PushSubscriptionJSON | null;
  is_active: boolean;
  last_notification_sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentRecallState {
  user_id: string;
  question_id: string;
  box_level: number; // 0 to 5 (Leitner system)
  consecutive_correct: number;
  error_count: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  is_in_error_lab: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RecallQuestionWithState extends FlashQuestion {
  box_level?: number;
  consecutive_correct?: number;
  error_count?: number;
  is_in_error_lab?: boolean;
  next_review_at?: string;
  priority_tier?: number;
}

export interface RecallAnswerSubmission {
  questionId: string;
  selectedOptionIndex: number;
  source: "in_app" | "inline_push";
}

export interface RecallAnswerResult {
  is_correct: boolean;
  correct_option_index: number;
  explanation: string;
  target_lesson_url: string;
  new_box_level: number;
  is_in_error_lab: boolean;
  consecutive_correct: number;
  remediated: boolean;
  next_review_at: string;
}

export interface ErrorLabSummary {
  totalErrors: number;
  inErrorLabCount: number;
  remediatedCount: number;
  remediationRatePercent: number;
  bySubject: Record<string, { total: number; remediated: number; active: number }>;
}
