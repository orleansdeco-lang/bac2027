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
  | "SPEED_RUSH"       // سرعة البديهة والمنهج
  | "TRUE_FALSE_BLITZ" // صح أم خطأ في 10 ثوانٍ
  | "FORMULA_SHOWDOWN" // تحدي القوانين والوحدات
  | "LOGIC_SPRINT";    // تحدي الذكاء والمنطق الوزاري

export type DiwanGameStatus =
  | "WAITING"
  | "COUNTDOWN"
  | "IN_ROUND"
  | "ROUND_SUMMARY"
  | "FINISHED";

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

export interface DiwanMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  message_type: DiwanMessageType;
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
}

export interface DiwanGameSession {
  id: string;
  room_id: string;
  game_type: DiwanGameType;
  subject: string;
  status: DiwanGameStatus;
  current_round: number;
  total_rounds: number;
  round_duration_seconds: number;
  active_question?: DiwanGameQuestion | null;
  host_user_id: string;
  round_end_time?: string | null;
  players?: DiwanGamePlayer[];
  created_at: string;
}
