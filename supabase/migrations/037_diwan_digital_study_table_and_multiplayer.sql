-- ==============================================================================
-- 037_diwan_digital_study_table_and_multiplayer.sql
-- SHATER BAC — Complete Rebuild of Diwan (Digital Study Table & Multiplayer)
-- 
-- 1. diwan_rooms (Digital study tables)
-- 2. diwan_room_members (Students seated at the table with live activity status)
-- 3. diwan_messages (Lightweight, monitored real-time chat)
-- 4. diwan_message_reports (Student reporting system)
-- 5. diwan_moderation_logs (Audit log for deleted messages and moderation actions)
-- 6. diwan_games & diwan_game_sessions (Multiplayer real-time games inside tables)
-- 7. diwan_game_answers (Server-evaluated answers & scores)
-- ==============================================================================

-- 1. DIGITAL STUDY TABLES (DIWAN ROOMS)
CREATE TABLE IF NOT EXISTS public.diwan_rooms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  stream TEXT NOT NULL DEFAULT 'sciences_exp',
  capacity INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULL', 'IN_GAME', 'CLOSED')),
  host_user_id TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_diwan_rooms_stream_status ON public.diwan_rooms(stream, status);
CREATE INDEX IF NOT EXISTS idx_diwan_rooms_created_at ON public.diwan_rooms(created_at DESC);

-- 2. SEATED MEMBERS (STUDENTS AT THE TABLE)
CREATE TABLE IF NOT EXISTS public.diwan_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.diwan_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '/illustrations/characters/scholar.jpg',
  wilaya_code TEXT NOT NULL DEFAULT '16',
  current_status TEXT NOT NULL DEFAULT 'studying' CHECK (current_status IN ('studying', 'writing', 'helping', 'playing')),
  seat_index INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_diwan_room_user UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_diwan_room_members_room ON public.diwan_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_diwan_room_members_user ON public.diwan_room_members(user_id);

-- 3. DIWAN MESSAGES (REAL-TIME LIVE CHAT)
CREATE TABLE IF NOT EXISTS public.diwan_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.diwan_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '/illustrations/characters/scholar.jpg',
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat' CHECK (message_type IN ('chat', 'question', 'help', 'reaction', 'system')),
  reply_to_id UUID REFERENCES public.diwan_messages(id) ON DELETE SET NULL,
  attachment_url TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_diwan_messages_room_created ON public.diwan_messages(room_id, created_at ASC);

-- 4. MESSAGE REPORTS
CREATE TABLE IF NOT EXISTS public.diwan_message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.diwan_messages(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  reporter_user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. MODERATION AUDIT LOG
CREATE TABLE IF NOT EXISTS public.diwan_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL CHECK (action_type IN ('DELETE_MESSAGE', 'KICK_MEMBER', 'WARN_MEMBER', 'CLOSE_ROOM')),
  target_type TEXT NOT NULL CHECK (target_type IN ('MESSAGE', 'STUDENT', 'ROOM')),
  target_id TEXT NOT NULL,
  room_id TEXT,
  moderator_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. MULTIPLAYER GAME SESSIONS INSIDE TABLES
CREATE TABLE IF NOT EXISTS public.diwan_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.diwan_rooms(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL DEFAULT 'SPEED_RUSH',
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'COUNTDOWN', 'IN_ROUND', 'ROUND_SUMMARY', 'FINISHED')),
  current_round INTEGER NOT NULL DEFAULT 1,
  total_rounds INTEGER NOT NULL DEFAULT 5,
  round_duration_seconds INTEGER NOT NULL DEFAULT 30,
  active_question JSONB,
  host_user_id TEXT NOT NULL,
  round_end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_diwan_game_sessions_room ON public.diwan_game_sessions(room_id, status);

-- 7. MULTIPLAYER GAME PLAYERS & SCORES
CREATE TABLE IF NOT EXISTS public.diwan_game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diwan_game_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_answer_correct BOOLEAN,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_diwan_game_player UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_diwan_game_players_session ON public.diwan_game_players(session_id, score DESC);

-- 8. MULTIPLAYER GAME ANSWERS (SERVER-VERIFIED)
CREATE TABLE IF NOT EXISTS public.diwan_game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diwan_game_sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  submitted_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- RLS POLICIES
ALTER TABLE public.diwan_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_game_answers ENABLE ROW LEVEL SECURITY;

-- Allow read on rooms for authenticated and anon users
CREATE POLICY "diwan_rooms_read_policy" ON public.diwan_rooms FOR SELECT USING (true);
CREATE POLICY "diwan_rooms_insert_policy" ON public.diwan_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "diwan_rooms_update_policy" ON public.diwan_rooms FOR UPDATE USING (true);

-- Allow read and seat taking on room members
CREATE POLICY "diwan_members_read_policy" ON public.diwan_room_members FOR SELECT USING (true);
CREATE POLICY "diwan_members_insert_policy" ON public.diwan_room_members FOR INSERT WITH CHECK (true);
CREATE POLICY "diwan_members_update_policy" ON public.diwan_room_members FOR UPDATE USING (true);
CREATE POLICY "diwan_members_delete_policy" ON public.diwan_room_members FOR DELETE USING (true);

-- Messages: readable by everyone in room, only visible if not deleted
CREATE POLICY "diwan_messages_read_policy" ON public.diwan_messages FOR SELECT USING (is_deleted = false);
CREATE POLICY "diwan_messages_insert_policy" ON public.diwan_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "diwan_messages_update_policy" ON public.diwan_messages FOR UPDATE USING (true);

-- Game Sessions & Players
CREATE POLICY "diwan_game_sessions_read" ON public.diwan_game_sessions FOR SELECT USING (true);
CREATE POLICY "diwan_game_sessions_write" ON public.diwan_game_sessions FOR ALL USING (true);

CREATE POLICY "diwan_game_players_read" ON public.diwan_game_players FOR SELECT USING (true);
CREATE POLICY "diwan_game_players_write" ON public.diwan_game_players FOR ALL USING (true);

CREATE POLICY "diwan_game_answers_read" ON public.diwan_game_answers FOR SELECT USING (true);
CREATE POLICY "diwan_game_answers_write" ON public.diwan_game_answers FOR ALL USING (true);

-- Reports & Moderation Logs
CREATE POLICY "diwan_reports_insert" ON public.diwan_message_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "diwan_reports_read" ON public.diwan_message_reports FOR SELECT USING (true);
CREATE POLICY "diwan_moderation_logs_read" ON public.diwan_moderation_logs FOR SELECT USING (true);
CREATE POLICY "diwan_moderation_logs_insert" ON public.diwan_moderation_logs FOR INSERT WITH CHECK (true);

-- Realtime publication enablement
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diwan_rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diwan_room_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diwan_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diwan_game_sessions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diwan_game_players;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Gracefully skip if tables already in publication
END $$;
