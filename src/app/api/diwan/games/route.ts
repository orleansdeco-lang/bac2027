/**
 * SHATER BAC — Server-Evaluated Diwan Multiplayer Challenge Controller
 * 
 * Strict Anti-Cheat & Real-Time Protocol:
 * - Server validates session, player membership, active question, and timing.
 * - Server determines answer correctness and computes score & speed bonus.
 * - Server locks "SPEED_RUSH" winner atomically on first verified correct answer.
 * - State transitions: WAITING -> READY -> STARTING -> PLAYING -> RESULT -> FINISHED.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  DiwanGameSession,
  DiwanGamePlayer,
  DiwanGameType,
  DiwanGameStatus,
  DiwanGameQuestion,
} from "@/types/diwan";
import { getChallengeQuestions } from "@/data/diwan/diwan-games";

// Resilient in-memory storage for local/demo/0 DZD operations
const inMemorySessions = new Map<string, DiwanGameSession>();
const inMemoryPlayers = new Map<string, DiwanGamePlayer[]>();
const inMemoryQuestions = new Map<string, DiwanGameQuestion[]>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const roomId = searchParams.get("roomId");

  // Fetch active session by room
  if (roomId && !sessionId) {
    // Check in-memory first
    const active = Array.from(inMemorySessions.values()).find(
      (s) => s.room_id === roomId && s.status !== "FINISHED"
    );
    if (active) {
      const players = inMemoryPlayers.get(active.id) || [];
      return NextResponse.json({ session: active, players });
    }

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("diwan_game_sessions")
        .select("*, players:diwan_game_players(*)")
        .eq("room_id", roomId)
        .neq("status", "FINISHED")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        return NextResponse.json({ session: data, players: data.players || [] });
      }
    }

    return NextResponse.json({ session: null, players: [] });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId or roomId" }, { status: 400 });
  }

  // Fetch by sessionId
  const session = inMemorySessions.get(sessionId);
  if (session) {
    const players = inMemoryPlayers.get(sessionId) || [];
    return NextResponse.json({ session, players });
  }

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("diwan_game_sessions")
      .select("*, players:diwan_game_players(*)")
      .eq("id", sessionId)
      .maybeSingle();

    if (data) {
      return NextResponse.json({ session: data, players: data.players || [] });
    }
  }

  return NextResponse.json({ error: "Session not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      // ----------------------------------------------------------------------
      // 1. CREATE CHALLENGE
      // ----------------------------------------------------------------------
      case "CREATE_CHALLENGE": {
        const { roomId, gameType, subject, topic, hostUser, totalRounds = 3 } = body;
        if (!roomId || !gameType || !subject || !hostUser?.id) {
          return NextResponse.json({ error: "Missing required challenge fields" }, { status: 400 });
        }

        const validRounds = Math.min(Math.max(1, totalRounds), 5);
        const questions = getChallengeQuestions(subject, gameType as DiwanGameType, validRounds);
        const firstQuestion = questions[0] || null;

        const newSessionId = `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const session: DiwanGameSession = {
          id: newSessionId,
          room_id: roomId,
          game_type: gameType as DiwanGameType,
          subject,
          topic: topic || "مراجعة شاملة",
          status: "WAITING",
          current_round: 1,
          total_rounds: validRounds,
          round_duration_seconds: firstQuestion?.timeLimitSeconds || 20,
          active_question: firstQuestion,
          host_user_id: hostUser.id,
          host_user_name: hostUser.name,
          first_solver_id: null,
          first_solver_name: null,
          created_at: new Date().toISOString(),
        };

        const initialPlayer: DiwanGamePlayer = {
          id: `player-${Date.now()}`,
          session_id: newSessionId,
          user_id: hostUser.id,
          user_name: hostUser.name,
          user_avatar: hostUser.avatar || "/illustrations/characters/scholar.jpg",
          score: 0,
          streak: 0,
          has_answered: false,
        };

        inMemorySessions.set(newSessionId, session);
        inMemoryPlayers.set(newSessionId, [initialPlayer]);
        inMemoryQuestions.set(newSessionId, questions);

        // Attempt Supabase sync
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from("diwan_game_sessions").insert({
              id: newSessionId,
              room_id: roomId,
              game_type: gameType,
              subject,
              status: "WAITING",
              current_round: 1,
              total_rounds: validRounds,
              round_duration_seconds: firstQuestion?.timeLimitSeconds || 20,
              active_question: firstQuestion,
              host_user_id: hostUser.id,
            });

            await supabase.from("diwan_game_players").insert({
              session_id: newSessionId,
              user_id: hostUser.id,
              user_name: hostUser.name,
              user_avatar: hostUser.avatar,
              score: 0,
              streak: 0,
            });
          } catch (e) {
            console.warn("Supabase game insert fallback to memory:", e);
          }
        }

        return NextResponse.json({
          session,
          players: [initialPlayer],
          question: firstQuestion,
        });
      }

      // ----------------------------------------------------------------------
      // 2. JOIN CHALLENGE
      // ----------------------------------------------------------------------
      case "JOIN_CHALLENGE": {
        const { sessionId, user } = body;
        if (!sessionId || !user?.id) {
          return NextResponse.json({ error: "Missing sessionId or user" }, { status: 400 });
        }

        const session = inMemorySessions.get(sessionId);
        if (!session) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (session.status !== "WAITING" && session.status !== "READY") {
          return NextResponse.json({ error: "Game already in progress" }, { status: 400 });
        }

        const currentPlayers = inMemoryPlayers.get(sessionId) || [];
        let player = currentPlayers.find((p) => p.user_id === user.id);

        if (!player) {
          player = {
            id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            session_id: sessionId,
            user_id: user.id,
            user_name: user.name,
            user_avatar: user.avatar || "/illustrations/characters/scholar.jpg",
            score: 0,
            streak: 0,
            has_answered: false,
          };
          currentPlayers.push(player);
          inMemoryPlayers.set(sessionId, currentPlayers);

          // If 2 or more players joined, mark READY
          if (currentPlayers.length >= 2 && session.status === "WAITING") {
            session.status = "READY";
          }
        }

        return NextResponse.json({ session, players: currentPlayers, player });
      }

      // ----------------------------------------------------------------------
      // 3. START COUNTDOWN (READY -> STARTING)
      // ----------------------------------------------------------------------
      case "START_COUNTDOWN": {
        const { sessionId, userId } = body;
        const session = inMemorySessions.get(sessionId);
        if (!session) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Verify host
        if (session.host_user_id !== userId) {
          return NextResponse.json({ error: "Only host can start game" }, { status: 403 });
        }

        session.status = "STARTING";
        return NextResponse.json({ session });
      }

      // ----------------------------------------------------------------------
      // 4. START ROUND (STARTING -> PLAYING)
      // ----------------------------------------------------------------------
      case "START_ROUND": {
        const { sessionId } = body;
        const session = inMemorySessions.get(sessionId);
        if (!session) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const questions = inMemoryQuestions.get(sessionId) || [];
        const currentQ = questions[session.current_round - 1] || questions[0];

        session.status = "PLAYING";
        session.active_question = currentQ;
        session.first_solver_id = null;
        session.first_solver_name = null;

        const duration = currentQ?.timeLimitSeconds || 20;
        session.round_duration_seconds = duration;
        session.round_end_time = new Date(Date.now() + duration * 1000).toISOString();

        // Reset players answered state for this round
        const players = inMemoryPlayers.get(sessionId) || [];
        players.forEach((p) => {
          p.has_answered = false;
        });

        return NextResponse.json({ session, question: currentQ, players });
      }

      // ----------------------------------------------------------------------
      // 5. SUBMIT ANSWER (STRICT SERVER-SIDE VERIFICATION)
      // ----------------------------------------------------------------------
      case "SUBMIT_ANSWER": {
        const { sessionId, userId, roundNumber, selectedIndex, clientTimestamp } = body;
        const session = inMemorySessions.get(sessionId);
        if (!session) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (session.status !== "PLAYING") {
          return NextResponse.json({ error: "Round is not active" }, { status: 400 });
        }

        // Anti-cheat: Check round timing (with 1500ms network latency grace)
        const now = Date.now();
        const endTime = session.round_end_time ? Date.parse(session.round_end_time) : now;
        if (now > endTime + 1500) {
          return NextResponse.json({ error: "Answer rejected: time expired" }, { status: 400 });
        }

        const players = inMemoryPlayers.get(sessionId) || [];
        const player = players.find((p) => p.user_id === userId);
        if (!player) {
          return NextResponse.json({ error: "Player not registered" }, { status: 403 });
        }

        // Anti-cheat: Prevent answering twice in same round
        if (player.has_answered) {
          return NextResponse.json({ error: "Answer already recorded for this round" }, { status: 400 });
        }
        player.has_answered = true;

        const currentQ = session.active_question;
        const isCorrect = currentQ ? selectedIndex === currentQ.correctIndex : false;

        let pointsAwarded = 0;
        let isFirstSolver = false;

        // Specific Rules by Game Type
        if (session.game_type === "SPEED_RUSH") {
          if (isCorrect) {
            // Atomic check: Is this player the first correct solver?
            if (!session.first_solver_id) {
              session.first_solver_id = player.user_id;
              session.first_solver_name = player.user_name;
              isFirstSolver = true;
              pointsAwarded = 100;
              // First correct solver wins the round -> transition to RESULT immediately!
              session.status = "RESULT";
            } else {
              // Later correct answer
              pointsAwarded = 25;
            }
          }
        } else {
          // Standard scoring (accuracy + speed bonus)
          if (isCorrect) {
            const timeRemainingSec = Math.max(0, Math.floor((endTime - now) / 1000));
            const speedBonus = Math.min(50, Math.floor((timeRemainingSec / session.round_duration_seconds) * 50));
            pointsAwarded = 50 + speedBonus;
          }
        }

        // Server updates player state
        player.score += pointsAwarded;
        player.streak = isCorrect ? player.streak + 1 : 0;
        player.last_answer_correct = isCorrect;

        // Check if all players have answered
        const allAnswered = players.every((p) => p.has_answered);
        if (allAnswered && session.status === "PLAYING") {
          session.status = "RESULT";
        }

        return NextResponse.json({
          verified: true,
          isCorrect,
          pointsAwarded,
          isFirstSolver,
          firstSolverName: session.first_solver_name,
          currentScore: player.score,
          streak: player.streak,
          sessionStatus: session.status,
          players,
        });
      }

      // ----------------------------------------------------------------------
      // 6. NEXT ROUND OR FINISH
      // ----------------------------------------------------------------------
      case "NEXT_ROUND": {
        const { sessionId, userId } = body;
        const session = inMemorySessions.get(sessionId);
        if (!session) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (session.current_round < session.total_rounds) {
          session.current_round += 1;
          const questions = inMemoryQuestions.get(sessionId) || [];
          const nextQ = questions[session.current_round - 1];

          session.status = "STARTING";
          session.active_question = nextQ;
          session.first_solver_id = null;
          session.first_solver_name = null;
          session.round_duration_seconds = nextQ?.timeLimitSeconds || 20;

          const players = inMemoryPlayers.get(sessionId) || [];
          players.forEach((p) => {
            p.has_answered = false;
          });

          return NextResponse.json({ session, nextQuestion: nextQ, players });
        } else {
          session.status = "FINISHED";
          const players = inMemoryPlayers.get(sessionId) || [];
          return NextResponse.json({ session, players, finished: true });
        }
      }

      // ----------------------------------------------------------------------
      // 7. FINISH / REMATCH
      // ----------------------------------------------------------------------
      case "FINISH_GAME": {
        const { sessionId } = body;
        const session = inMemorySessions.get(sessionId);
        if (session) {
          session.status = "FINISHED";
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("Diwan game API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
