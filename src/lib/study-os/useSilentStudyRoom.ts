"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  RoomSeatOccupant,
  PresenceStatus,
  EncourageBroadcastPayload,
} from "@/types/study-room";
import { useFocus } from "@/context/FocusContext";
import { useAuth } from "@/lib/auth/hooks";
import { useLearningAccessGate } from "@/lib/hooks";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";
import { getSubjectMeta } from "@/lib/focus/focus-engine";

const CHANNEL_NAME = "realtime:shater-silent-room";
const MAX_SEATS = 6;
const LOCAL_STORAGE_SEAT_KEY = "shater_silent_seat_claim_v1";
const SESSION_PRESENCE_ID_KEY = "shater_study_presence_id";

// Predefined calm academic avatars
const ACADEMIC_AVATARS = ["👨‍🎓", "👩‍🎓", "🧠", "📚", "⚡", "🎯", "🔬", "💡"];

function getOrCreatePresenceId(): string {
  if (typeof window === "undefined") return "server-temp-id";
  let id = sessionStorage.getItem(SESSION_PRESENCE_ID_KEY);
  if (!id) {
    id = "pr_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
    sessionStorage.setItem(SESSION_PRESENCE_ID_KEY, id);
  }
  return id;
}

export function useSilentStudyRoom() {
  const { user } = useAuth();
  const gate = useLearningAccessGate();
  const { activeSession, isSessionActive, isPaused, startSession, openFocusMode } = useFocus();

  const [presenceId] = useState<string>(() => getOrCreatePresenceId());
  const [seats, setSeats] = useState<(RoomSeatOccupant | null)[]>(() =>
    Array(MAX_SEATS).fill(null)
  );
  const [activeSeatIndex, setActiveSeatIndex] = useState<number | null>(null);
  const [spectatorsCount, setSpectatorsCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [encouragements, setEncouragements] = useState<Record<number, number>>({});

  const channelRef = useRef<any>(null);
  const myOccupantStateRef = useRef<RoomSeatOccupant | null>(null);
  const lastEncourageSentRef = useRef<Record<number, number>>({});

  // Compute student profile presentation values (Strictly non-sensitive!)
  const studentDisplayName =
    gate.profile?.firstName ||
    (gate.profile as any)?.nickname ||
    (user?.user_metadata as any)?.first_name ||
    "طالب بكالوريا";

  const rawStream = gate.profile?.streamId || (gate.profile as any)?.stream || "sciences_exp";
  const streamInfo = ALGERIAN_BAC_STREAMS[rawStream as keyof typeof ALGERIAN_BAC_STREAMS];
  const streamLabel = streamInfo?.name_ar || "العلوم التجريبية";

  // Pick deterministic calm avatar based on presenceId
  const avatarIndex = Math.abs(
    presenceId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % ACADEMIC_AVATARS.length;
  const avatar = ACADEMIC_AVATARS[avatarIndex] || "👨‍🎓";

  // Helper to sync presence state from Supabase Realtime
  const parsePresenceState = useCallback(
    (presenceState: Record<string, any[]>) => {
      const newSeats: (RoomSeatOccupant | null)[] = Array(MAX_SEATS).fill(null);
      let activeIndex: number | null = null;
      let spectators = 0;

      // Flatten presences
      const allPresences: RoomSeatOccupant[] = [];
      for (const key of Object.keys(presenceState)) {
        const presences = presenceState[key] || [];
        for (const p of presences) {
          if (p && typeof p.seatIndex === "number") {
            allPresences.push(p as RoomSeatOccupant);
          } else {
            spectators += 1;
          }
        }
      }

      // Sort by seatIndex and timestamp to ensure deterministic seat mapping
      allPresences.sort((a, b) => (a.lastActiveAt || 0) - (b.lastActiveAt || 0));

      for (const p of allPresences) {
        if (p.seatIndex >= 0 && p.seatIndex < MAX_SEATS) {
          // If seat is not yet occupied by an active presence
          if (!newSeats[p.seatIndex]) {
            const isMe = p.presenceId === presenceId;
            newSeats[p.seatIndex] = {
              ...p,
              isCurrentUser: isMe,
            };
            if (isMe) {
              activeIndex = p.seatIndex;
            }
          }
        }
      }

      setSeats(newSeats);
      setActiveSeatIndex(activeIndex);
      setSpectatorsCount(spectators);
    },
    [presenceId]
  );

  // Initialize and maintain Supabase Realtime channel
  useEffect(() => {
    let isSubscribed = true;

    // Check for saved local seat claim on initial mount
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SEAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.presenceId === presenceId && typeof parsed.seatIndex === "number") {
          myOccupantStateRef.current = parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }

    if (!supabase) {
      // Local fallback mode when Supabase is unconfigured / offline
      setIsConnected(false);
      if (myOccupantStateRef.current) {
        const initialSeats = Array(MAX_SEATS).fill(null);
        initialSeats[myOccupantStateRef.current.seatIndex] = {
          ...myOccupantStateRef.current,
          isCurrentUser: true,
        };
        setSeats(initialSeats);
        setActiveSeatIndex(myOccupantStateRef.current.seatIndex);
      }
      return;
    }

    const channel = supabase.channel(CHANNEL_NAME, {
      config: {
        presence: {
          key: presenceId,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        if (!isSubscribed) return;
        const state = channel.presenceState();
        parsePresenceState(state);
      })
      .on("presence", { event: "join" }, () => {
        if (!isSubscribed) return;
        const state = channel.presenceState();
        parsePresenceState(state);
      })
      .on("presence", { event: "leave" }, () => {
        if (!isSubscribed) return;
        const state = channel.presenceState();
        parsePresenceState(state);
      })
      .on("broadcast", { event: "encourage" }, ({ payload }: { payload: EncourageBroadcastPayload }) => {
        if (!isSubscribed || !payload) return;
        setEncouragements((prev) => ({
          ...prev,
          [payload.targetSeatIndex]: Date.now(),
        }));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          // If we had a restored seat occupant, track it immediately
          if (myOccupantStateRef.current) {
            try {
              await channel.track(myOccupantStateRef.current);
            } catch (err) {
              console.warn("Failed to track restored seat presence:", err);
            }
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false);
        }
      });

    // Handle beforeunload to gracefully untrack
    const handleBeforeUnload = () => {
      if (channelRef.current && myOccupantStateRef.current) {
        channelRef.current.untrack().catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isSubscribed = false;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (channelRef.current) {
        channelRef.current.untrack().catch(() => {});
        channelRef.current.unsubscribe();
      }
    };
  }, [presenceId, parsePresenceState]);

  // Sync Focus Engine state into seat presence in real-time
  useEffect(() => {
    if (activeSeatIndex === null || !myOccupantStateRef.current) return;

    let targetStatus: PresenceStatus = "SEATED";
    let targetStartedAt: string | null = null;
    let targetSubjectId = myOccupantStateRef.current.subjectId;
    let targetSubjectName = myOccupantStateRef.current.subjectName;
    let targetSubjectHex = myOccupantStateRef.current.subjectHex;

    if (isSessionActive && activeSession) {
      targetStatus = isPaused ? "PAUSED" : "FOCUSING";
      targetStartedAt = activeSession.startedAt;

      if (activeSession.subjectId) {
        const meta = getSubjectMeta(activeSession.subjectId as SubjectId);
        targetSubjectId = activeSession.subjectId;
        targetSubjectName = meta.nameAr;
        targetSubjectHex = meta.hexColor;
      }
    } else {
      targetStatus = "SEATED";
      targetStartedAt = null;
    }

    const hasChanged =
      myOccupantStateRef.current.status !== targetStatus ||
      myOccupantStateRef.current.startedAt !== targetStartedAt ||
      myOccupantStateRef.current.subjectId !== targetSubjectId;

    if (hasChanged) {
      const updatedOccupant: RoomSeatOccupant = {
        ...myOccupantStateRef.current,
        status: targetStatus,
        startedAt: targetStartedAt,
        subjectId: targetSubjectId,
        subjectName: targetSubjectName,
        subjectHex: targetSubjectHex,
        lastActiveAt: Date.now(),
      };

      myOccupantStateRef.current = updatedOccupant;

      try {
        localStorage.setItem(LOCAL_STORAGE_SEAT_KEY, JSON.stringify(updatedOccupant));
      } catch {}

      if (channelRef.current && isConnected) {
        channelRef.current.track(updatedOccupant).catch(() => {});
      }

      setSeats((prev) => {
        const clone = [...prev];
        clone[activeSeatIndex] = { ...updatedOccupant, isCurrentUser: true };
        return clone;
      });
    }
  }, [
    activeSeatIndex,
    isSessionActive,
    isPaused,
    activeSession,
    isConnected,
  ]);

  // Claim a seat
  const sitAtSeat = useCallback(
    async (seatIndex: number, subjectId: string, goalNote?: string): Promise<boolean> => {
      if (seatIndex < 0 || seatIndex >= MAX_SEATS) return false;

      // Check if seat is currently occupied by someone else
      if (seats[seatIndex] && !seats[seatIndex]?.isCurrentUser) {
        return false;
      }

      const meta = getSubjectMeta(subjectId as SubjectId);
      const isCurrentlyFocusing = isSessionActive && !isPaused;

      const newOccupant: RoomSeatOccupant = {
        presenceId,
        seatIndex,
        displayName: studentDisplayName,
        avatar,
        streamId: rawStream,
        streamLabel,
        subjectId: subjectId,
        subjectName: meta.nameAr,
        subjectHex: meta.hexColor,
        status: isCurrentlyFocusing ? "FOCUSING" : "SEATED",
        startedAt: activeSession?.startedAt || null,
        goalNote: goalNote?.trim() || undefined,
        lastActiveAt: Date.now(),
      };

      myOccupantStateRef.current = newOccupant;

      try {
        localStorage.setItem(LOCAL_STORAGE_SEAT_KEY, JSON.stringify(newOccupant));
      } catch {}

      setActiveSeatIndex(seatIndex);
      setSeats((prev) => {
        const clone = [...prev];
        // Clear any previous seat occupied by user
        for (let i = 0; i < clone.length; i++) {
          if (clone[i]?.presenceId === presenceId) {
            clone[i] = null;
          }
        }
        clone[seatIndex] = { ...newOccupant, isCurrentUser: true };
        return clone;
      });

      if (channelRef.current && isConnected) {
        try {
          await channelRef.current.track(newOccupant);
        } catch (err) {
          console.warn("Failed to broadcast seat claim:", err);
        }
      }

      return true;
    },
    [
      seats,
      presenceId,
      studentDisplayName,
      avatar,
      rawStream,
      streamLabel,
      isSessionActive,
      isPaused,
      activeSession?.startedAt,
      isConnected,
    ]
  );

  // Leave active seat
  const leaveSeat = useCallback(async () => {
    if (activeSeatIndex === null) return;

    myOccupantStateRef.current = null;
    try {
      localStorage.removeItem(LOCAL_STORAGE_SEAT_KEY);
    } catch {}

    const leavingSeatIndex = activeSeatIndex;
    setActiveSeatIndex(null);

    setSeats((prev) => {
      const clone = [...prev];
      if (leavingSeatIndex >= 0 && leavingSeatIndex < MAX_SEATS) {
        if (clone[leavingSeatIndex]?.presenceId === presenceId) {
          clone[leavingSeatIndex] = null;
        }
      }
      return clone;
    });

    if (channelRef.current && isConnected) {
      try {
        await channelRef.current.untrack();
      } catch (err) {
        console.warn("Failed to broadcast seat exit:", err);
      }
    }
  }, [activeSeatIndex, presenceId, isConnected]);

  // Update goal note
  const updateGoalNote = useCallback(
    async (goalNote: string) => {
      if (activeSeatIndex === null || !myOccupantStateRef.current) return;

      const updated: RoomSeatOccupant = {
        ...myOccupantStateRef.current,
        goalNote: goalNote.trim() || undefined,
        lastActiveAt: Date.now(),
      };

      myOccupantStateRef.current = updated;
      try {
        localStorage.setItem(LOCAL_STORAGE_SEAT_KEY, JSON.stringify(updated));
      } catch {}

      setSeats((prev) => {
        const clone = [...prev];
        clone[activeSeatIndex] = { ...updated, isCurrentUser: true };
        return clone;
      });

      if (channelRef.current && isConnected) {
        try {
          await channelRef.current.track(updated);
        } catch {}
      }
    },
    [activeSeatIndex, isConnected]
  );

  // Send "☕ شجّع" encouragement
  const sendEncouragement = useCallback(
    (targetSeatIndex: number) => {
      if (targetSeatIndex < 0 || targetSeatIndex >= MAX_SEATS) return;

      const now = Date.now();
      const lastSent = lastEncourageSentRef.current[targetSeatIndex] || 0;
      // 10-second rate limit per seat to prevent noise
      if (now - lastSent < 10000) return;

      lastEncourageSentRef.current[targetSeatIndex] = now;

      // Trigger local animation immediately
      setEncouragements((prev) => ({
        ...prev,
        [targetSeatIndex]: now,
      }));

      // Broadcast to peers
      if (channelRef.current && isConnected) {
        channelRef.current
          .send({
            type: "broadcast",
            event: "encourage",
            payload: {
              targetSeatIndex,
              senderSeatIndex: activeSeatIndex ?? undefined,
              timestamp: now,
            },
          })
          .catch(() => {});
      }
    },
    [activeSeatIndex, isConnected]
  );

  const occupiedSeatsCount = seats.filter(Boolean).length;

  return {
    seats,
    activeSeatIndex,
    occupiedSeatsCount,
    spectatorsCount,
    isConnected,
    encouragements,
    sitAtSeat,
    leaveSeat,
    updateGoalNote,
    sendEncouragement,
    startFocusSession: (subjectId: string, goalNote?: string) => {
      startSession({
        mode: "25m",
        targetDurationMinutes: 25,
        subjectId: subjectId as SubjectId,
        taskTitle: goalNote || "جلسة تركيز صامتة 🪑",
      });
      openFocusMode();
    },
  };
}
