/**
 * SHATER Study OS — Silent Study Room & Body Doubling Types
 * Phase 4: Virtual Study Table with Maximum 6 Visible Seats.
 * 
 * CORE PRINCIPLE:
 * "نقرا مع ناس آخرين، بصمت."
 * Distraction-free, zero social network noise, privacy-first.
 */

import { SubjectId } from "@/types/education";

export type PresenceStatus =
  | "ONLINE"    // In the room observing / waiting
  | "SEATED"    // Sitting at a seat, preparing or reviewing
  | "FOCUSING"  // In active focus session (synced with Focus Engine)
  | "PAUSED"    // Focus session temporarily paused
  | "AWAY";     // Idle / mobile backgrounded

export interface RoomSeatOccupant {
  /** Ephemeral anonymous identifier generated for this client tab/session */
  presenceId: string;
  /** Seat index: 0, 1, 2, 3, 4, or 5 (strictly max 6 seats) */
  seatIndex: number;
  /** First name or non-identifiable pseudonym (e.g. "أحمد" or "طالب بكالوريا") */
  displayName: string;
  /** Calm academic emoji avatar (e.g. "👨‍🎓", "👩‍🎓", "🧠", "📚", "⚡", "🎯") */
  avatar: string;
  /** Stream identifier (e.g. "sciences_exp") */
  streamId: string;
  /** Arabic stream title (e.g. "علوم تجريبية") */
  streamLabel: string;
  /** Subject identifier (e.g. "math") */
  subjectId: SubjectId | string;
  /** Arabic subject name (e.g. "الرياضيات") */
  subjectName: string;
  /** Subject theme color */
  subjectHex: string;
  /** Current presence status */
  status: PresenceStatus;
  /** ISO string of when focus session started. Used to compute duration LOCALLY. NO ticks over network! */
  startedAt: string | null;
  /** Optional, non-sensitive study goal note */
  goalNote?: string;
  /** Flag computed on client side */
  isCurrentUser?: boolean;
  /** Epoch ms timestamp of last active heartbeat */
  lastActiveAt: number;
}

export interface EncourageBroadcastPayload {
  targetSeatIndex: number;
  senderSeatIndex?: number;
  timestamp: number;
}

export interface SilentStudyRoomState {
  roomName: string;
  /** Exactly 6 seat slots (index 0 to 5) */
  seats: (RoomSeatOccupant | null)[];
  /** Seat occupied by current student, or null if observer */
  activeSeatIndex: number | null;
  /** Count of active seated students (0 to 6) */
  occupiedSeatsCount: number;
  /** Count of silent observers (students in room without a seat) */
  spectatorsCount: number;
  /** Whether connected to Supabase Realtime channel */
  isConnected: boolean;
  /** Last received encouragement map (seatIndex -> timestamp) for animation triggers */
  encouragements: Record<number, number>;
}
