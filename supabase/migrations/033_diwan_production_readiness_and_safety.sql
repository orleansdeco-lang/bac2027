-- ==============================================================================
-- 033_diwan_production_readiness_and_safety.sql
-- SHATER BAC — Production Readiness, Safety, RLS Hardening & Reports
-- ==============================================================================

-- 1. ADD OFFICIAL SCHEDULED FLAGS TO MAJLIS ROOMS
ALTER TABLE public.majlis_rooms
  ADD COLUMN IF NOT EXISTS is_official BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recurring_time TEXT, -- e.g. "20:00"
  ADD COLUMN IF NOT EXISTS is_empty_notified BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_majlis_rooms_official ON public.majlis_rooms (is_official, scheduled_start);

-- 2. MAJLIS RSVP TABLE (Authentic "سأحضر" counter for scheduled tables)
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

-- 3. MAJLIS REPORTS TABLE (Moderation & Safety)
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

-- 4. HARDEN ROW LEVEL SECURITY POLICIES

-- Enable RLS on new tables
ALTER TABLE public.majlis_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_reports ENABLE ROW LEVEL SECURITY;

-- RSVP Policies
CREATE POLICY "Public read majlis_rsvp"
  ON public.majlis_rsvp FOR SELECT
  USING (true);

CREATE POLICY "Authenticated insert majlis_rsvp"
  ON public.majlis_rsvp FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id);

CREATE POLICY "Authenticated delete majlis_rsvp"
  ON public.majlis_rsvp FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id);

-- Reports Policies
CREATE POLICY "Authenticated insert majlis_reports"
  ON public.majlis_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = reporter_user_id);

CREATE POLICY "Admin read majlis_reports"
  ON public.majlis_reports FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.student_profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'operator')
    )
  );

CREATE POLICY "Admin update majlis_reports"
  ON public.majlis_reports FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.student_profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin', 'operator')
    )
  );

-- Replace Permissive Members Update/Delete with Authoritative Checks
DROP POLICY IF EXISTS "Public update majlis_members" ON public.majlis_members;
DROP POLICY IF EXISTS "Public delete majlis_members" ON public.majlis_members;

CREATE POLICY "Owner or Host update majlis_members"
  ON public.majlis_members FOR UPDATE
  USING (
    auth.uid()::text = user_id OR
    EXISTS (
      SELECT 1 FROM public.majlis_rooms r
      WHERE r.id = majlis_members.room_id AND r.host_user_id = auth.uid()
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Owner or Host delete majlis_members"
  ON public.majlis_members FOR DELETE
  USING (
    auth.uid()::text = user_id OR
    EXISTS (
      SELECT 1 FROM public.majlis_rooms r
      WHERE r.id = majlis_members.room_id AND r.host_user_id = auth.uid()
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 5. REALTIME PUBLICATION REGISTRATION FOR RSVP
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.majlis_rsvp;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
