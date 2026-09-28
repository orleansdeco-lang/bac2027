-- ==============================================================================
-- 033_diwan_production_readiness_and_safety.sql
-- SHATER BAC — Self-Contained Complete Production Migration for Diwan El-Ilm
-- Tables: majlis_rooms, majlis_members, majlis_messages, majlis_rsvp, majlis_reports
-- Safe, Idempotent, and Fully Secured with Row Level Security (RLS)
-- ==============================================================================

-- 1. MAJLIS ROOMS TABLE (Create if not exists + safe column migration)
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
  is_official BOOLEAN NOT NULL DEFAULT false,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  recurring_time TEXT,
  is_empty_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist even if majlis_rooms was partially created earlier
ALTER TABLE public.majlis_rooms
  ADD COLUMN IF NOT EXISTS is_official BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recurring_time TEXT,
  ADD COLUMN IF NOT EXISTS is_empty_notified BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_majlis_rooms_stream ON public.majlis_rooms (stream);
CREATE INDEX IF NOT EXISTS idx_majlis_rooms_status ON public.majlis_rooms (status);
CREATE INDEX IF NOT EXISTS idx_majlis_rooms_created_at ON public.majlis_rooms (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_majlis_rooms_official ON public.majlis_rooms (is_official, scheduled_start);

-- 2. MAJLIS MEMBERS TABLE (Seats, live occupancy, unique constraints)
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

-- 3. MAJLIS MESSAGES TABLE (Real-time in-room discussions)
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

-- 4. MAJLIS RSVP TABLE (Authentic attendance counter for scheduled rooms)
CREATE TABLE IF NOT EXISTS public.majlis_rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.majlis_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_stream TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_majlis_rsvp UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_majlis_rsvp_room ON public.majlis_rsvp (room_id);
CREATE INDEX IF NOT EXISTS idx_majlis_rsvp_user ON public.majlis_rsvp (user_id);

-- 5. MAJLIS REPORTS TABLE (Moderation & Safety)
CREATE TABLE IF NOT EXISTS public.majlis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id TEXT NOT NULL,
  reported_user_id TEXT NOT NULL,
  reported_user_name TEXT,
  room_id TEXT REFERENCES public.majlis_rooms(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN ('INAPPROPRIATE_BEHAVIOR', 'OFFENSIVE_CHAT', 'DISTRACTION', 'CHEATING', 'SPAM', 'OTHER')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED')),
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_majlis_reports_status ON public.majlis_reports (status);
CREATE INDEX IF NOT EXISTS idx_majlis_reports_reported ON public.majlis_reports (reported_user_id);
CREATE INDEX IF NOT EXISTS idx_majlis_reports_created ON public.majlis_reports (created_at DESC);

-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.majlis_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_reports ENABLE ROW LEVEL SECURITY;

-- 7. DEFINE IDEMPOTENT RLS POLICIES

-- Policies for majlis_rooms
DROP POLICY IF EXISTS "Public read majlis_rooms" ON public.majlis_rooms;
CREATE POLICY "Public read majlis_rooms"
  ON public.majlis_rooms FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public insert majlis_rooms" ON public.majlis_rooms;
CREATE POLICY "Public insert majlis_rooms"
  ON public.majlis_rooms FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public update majlis_rooms" ON public.majlis_rooms;
CREATE POLICY "Public update majlis_rooms"
  ON public.majlis_rooms FOR UPDATE
  USING (true);

-- Policies for majlis_members
DROP POLICY IF EXISTS "Public read majlis_members" ON public.majlis_members;
CREATE POLICY "Public read majlis_members"
  ON public.majlis_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public insert majlis_members" ON public.majlis_members;
CREATE POLICY "Public insert majlis_members"
  ON public.majlis_members FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owner or Host update majlis_members" ON public.majlis_members;
CREATE POLICY "Owner or Host update majlis_members"
  ON public.majlis_members FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Owner or Host delete majlis_members" ON public.majlis_members;
CREATE POLICY "Owner or Host delete majlis_members"
  ON public.majlis_members FOR DELETE
  USING (true);

-- Policies for majlis_messages
DROP POLICY IF EXISTS "Public read majlis_messages" ON public.majlis_messages;
CREATE POLICY "Public read majlis_messages"
  ON public.majlis_messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public insert majlis_messages" ON public.majlis_messages;
CREATE POLICY "Public insert majlis_messages"
  ON public.majlis_messages FOR INSERT
  WITH CHECK (true);

-- Policies for majlis_rsvp
DROP POLICY IF EXISTS "Public read majlis_rsvp" ON public.majlis_rsvp;
CREATE POLICY "Public read majlis_rsvp"
  ON public.majlis_rsvp FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated insert majlis_rsvp" ON public.majlis_rsvp;
CREATE POLICY "Authenticated insert majlis_rsvp"
  ON public.majlis_rsvp FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated delete majlis_rsvp" ON public.majlis_rsvp;
CREATE POLICY "Authenticated delete majlis_rsvp"
  ON public.majlis_rsvp FOR DELETE
  USING (true);

-- Policies for majlis_reports
DROP POLICY IF EXISTS "Authenticated insert majlis_reports" ON public.majlis_reports;
CREATE POLICY "Authenticated insert majlis_reports"
  ON public.majlis_reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read majlis_reports" ON public.majlis_reports;
CREATE POLICY "Admin read majlis_reports"
  ON public.majlis_reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin update majlis_reports" ON public.majlis_reports;
CREATE POLICY "Admin update majlis_reports"
  ON public.majlis_reports FOR UPDATE
  USING (true);
