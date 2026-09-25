-- ==============================================================================
-- 032_majlis_realtime_multiplayer_engine.sql
-- SHATER BAC — Synchronous Multiplayer Majlis Study Engine Powered by Supabase Realtime
-- Strict Stream Rules, Persistent Rooms, Live Seating, Shared Timers, & Instant Chat
-- ==============================================================================

-- 1. MAJLIS ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.majlis_rooms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  stream TEXT NOT NULL,
  subject TEXT NOT NULL,
  lesson TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('PAPER_PRACTICE', 'SPEED_BATTLE', 'GROUP_MEMORIZATION', 'FULL_EXAM', 'DIGITAL_QUIZ')),
  host_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  capacity INTEGER NOT NULL DEFAULT 6 CHECK (capacity >= 2 AND capacity <= 8),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('LOBBY', 'ACTIVE', 'COMPLETED')),
  current_step TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  timer_end TIMESTAMPTZ,
  active_material JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_majlis_rooms_stream ON public.majlis_rooms (stream);
CREATE INDEX IF NOT EXISTS idx_majlis_rooms_status ON public.majlis_rooms (status);
CREATE INDEX IF NOT EXISTS idx_majlis_rooms_created_at ON public.majlis_rooms (created_at DESC);

-- 2. MAJLIS MEMBERS TABLE (Seat occupancy, live status, score, paper completion)
CREATE TABLE IF NOT EXISTS public.majlis_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.majlis_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '👨‍🎓',
  user_stream TEXT NOT NULL DEFAULT 'sciences_exp',
  seat_index INTEGER NOT NULL CHECK (seat_index >= 0 AND seat_index < 8),
  status TEXT NOT NULL DEFAULT 'SOLVING' CHECK (status IN ('SEATED', 'SOLVING', 'FINISHED', 'SPECTATING')),
  score INTEGER NOT NULL DEFAULT 0,
  finished_paper BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_majlis_room_seat UNIQUE (room_id, seat_index),
  CONSTRAINT uq_majlis_room_user UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_majlis_members_room ON public.majlis_members (room_id);
CREATE INDEX IF NOT EXISTS idx_majlis_members_user ON public.majlis_members (user_id);

-- 3. MAJLIS MESSAGES TABLE (Real-time in-room peer discussions)
CREATE TABLE IF NOT EXISTS public.majlis_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.majlis_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_stream TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_majlis_messages_room ON public.majlis_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_majlis_messages_created_at ON public.majlis_messages (created_at ASC);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.majlis_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_messages ENABLE ROW LEVEL SECURITY;

-- Permissive policies for rooms
CREATE POLICY "Public read majlis_rooms"
  ON public.majlis_rooms FOR SELECT
  USING (true);

CREATE POLICY "Public insert majlis_rooms"
  ON public.majlis_rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update majlis_rooms"
  ON public.majlis_rooms FOR UPDATE
  USING (true);

-- Permissive policies for members
CREATE POLICY "Public read majlis_members"
  ON public.majlis_members FOR SELECT
  USING (true);

CREATE POLICY "Public insert majlis_members"
  ON public.majlis_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update majlis_members"
  ON public.majlis_members FOR UPDATE
  USING (true);

CREATE POLICY "Public delete majlis_members"
  ON public.majlis_members FOR DELETE
  USING (true);

-- Permissive policies for messages
CREATE POLICY "Public read majlis_messages"
  ON public.majlis_messages FOR SELECT
  USING (true);

CREATE POLICY "Public insert majlis_messages"
  ON public.majlis_messages FOR INSERT
  WITH CHECK (true);

-- 5. REALTIME PUBLICATION REGISTRATION
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.majlis_rooms;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.majlis_members;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.majlis_messages;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
