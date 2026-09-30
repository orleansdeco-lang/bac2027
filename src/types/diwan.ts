/**
 * SHATER BAC — Diwan Digital Study Table & Multiplayer Contracts
 * 
 * "طاولة مراجعة رقمية جزائرية"
 * Real-time study sessions, instant peer chat, and in-table multiplayer showdowns.
 */

import { StreamId } from "./education";

export type StudentActivityStatus = "studying" | "writing" | "answering" | "playing" | "helping";

export type DiwanMessageType = "chat" | "question" | "help" | "reaction" | "system";

export type DiwanGameType =
  | "SPEED_RUSH"       // أسرع واحد: أول إجابة صحيحة تكسب
  | "TRUE_FALSE_BLITZ" // صح ولا خطأ في 10 ثوانٍ
  | "BRAIN_RUSH"       // Brain Rush: أسئلة منطق وتفكير سريع
  | "BAC_SPRINT"       // BAC Sprint: سؤال وزاري من الدروس
  | "MEMORY_BATTLE"    // Memory Battle: تذكر عناصر لثوانٍ ثم الإجابة
  | "FORMULA_SHOWDOWN" // (تحدي القوانين والوحدات)
  | "LOGIC_SPRINT";    // (تحدي الذكاء الوزاري)

export type DiwanGameStatus =
  | "WAITING"
  | "READY"
  | "STARTING"
  | "PLAYING"
  | "RESULT"
  | "FINISHED"
  | "COUNTDOWN"       // DB compatible alias
  | "IN_ROUND"        // DB compatible alias
  | "ROUND_SUMMARY";  // DB compatible alias

export interface DiwanTable {
  id: string;
  title: string;
  subject: string;
  topic: string;
  stream: StreamId;
  capacity: number;
  status: "ACTIVE" | "FULL" | "IN_GAME" | "CLOSED";
  host_user_id?: string;
  duration_minutes: number;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DiwanMember {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  wilaya_code: string;
  current_status: StudentActivityStatus;
  seat_index: number;
  school?: string;
  stream?: StreamId | string;
  currentTopic?: string;
  joined_at: string;
  last_seen_at?: string;
}

export type DiwanMessageStatus = "VISIBLE" | "HIDDEN" | "DELETED" | "FLAGGED";

export type DiwanReportReason = "إساءة" | "تنمر" | "محتوى غير مناسب" | "سبام" | "غش" | "أخرى";

export interface DiwanMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  message_type: DiwanMessageType;
  status?: DiwanMessageStatus;
  reply_to_id?: string | null;
  attachment_url?: string | null;
  is_deleted?: boolean;
  created_at: string;
}

export interface DiwanGameQuestion {
  id: string;
  prompt_ar: string;
  options: string[];
  correctIndex: number;
  explanation_ar: string;
  timeLimitSeconds: number;
  subject: string;
  stream?: string;
  gameType?: DiwanGameType;
  memoryItems?: string[]; // Used for MEMORY_BATTLE showcase before answering
  memoryDurationSeconds?: number;
}

export interface DiwanGamePlayer {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  score: number;
  streak: number;
  last_answer_correct?: boolean;
  has_answered?: boolean;
}

export interface DiwanGameSession {
  id: string;
  room_id: string;
  game_type: DiwanGameType;
  subject: string;
  topic?: string;
  status: DiwanGameStatus;
  current_round: number;
  total_rounds: number;
  round_duration_seconds: number;
  active_question?: DiwanGameQuestion | null;
  host_user_id: string;
  host_user_name?: string;
  round_end_time?: string | null;
  first_solver_id?: string | null;
  first_solver_name?: string | null;
  players?: DiwanGamePlayer[];
  created_at: string;
}
