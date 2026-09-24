/**
 * Yeolpumta (YPT) - BAC Edition Types & Interfaces
 * Designed for High-Performance Algerian Baccalaureate Preparation
 */

import { StreamId } from "./education";

export type StudyTimerMode = "stopwatch" | "pomodoro";
export type PomodoroPhase = "work" | "short_break" | "long_break";

export interface YptSubject {
  id: string;
  nameAr: string;
  nameFr: string;
  hexColor: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  icon: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectNameAr: string;
  subjectHex: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  date: string; // YYYY-MM-DD
  mode: StudyTimerMode;
}

export interface TimelineSlotData {
  index: number; // 0 to 143 (10-minute blocks)
  hour: number;  // 0 to 23
  minute: number; // 0, 10, 20, 30, 40, 50
  timeString: string; // "14:20"
  subjectId: string | null;
  subjectNameAr?: string;
  subjectHex?: string;
  isCurrent?: boolean;
}

export interface PeerStudent {
  id: string;
  name: string;
  avatar: string;
  wilaya: string;
  streamId: StreamId;
  streamLabelAr: string;
  subjectId: string;
  subjectNameAr: string;
  subjectHex: string;
  status: "studying" | "break";
  elapsedMinutes: number;
  todayTotalMinutes: number;
  dailyGoalHours: number;
  quote?: string;
}

export interface PeerMilestone {
  id: string;
  studentName: string;
  avatar: string;
  stream: string;
  subjectName: string;
  actionText: string;
  timeAgo: string;
}

export interface MustWinTask {
  id: string;
  text: string;
  subjectId: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
}

export interface DailyYptState {
  date: string; // YYYY-MM-DD
  targetMinutes: number; // default 360 (6 hours)
  timelineSlots: (string | null)[]; // 144 items
  tasks: MustWinTask[];
  sessions: StudySession[];
  streakDays: number;
}
