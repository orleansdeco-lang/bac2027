-- ==============================================================================
-- 🏛️ MIGRATION 036: DIWAN RESILIENT ROOM CREATION & SCHEMA ALIGNMENT
-- Ensures bulletproof compatibility for all student auth states (online, offline, anon)
-- ==============================================================================

-- 1. Ensure columns exist on majlis_rooms
ALTER TABLE public.majlis_rooms
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 45,
  ADD COLUMN IF NOT EXISTS timer_end TIMESTAMPTZ;

-- 2. Relax foreign key on host_user_id so local/deterministic accounts (usr_std_...) are supported
ALTER TABLE public.majlis_rooms
  DROP CONSTRAINT IF EXISTS majlis_rooms_host_user_id_fkey;

-- 3. Ensure columns exist on majlis_members
ALTER TABLE public.majlis_members
  ADD COLUMN IF NOT EXISTS wilaya_code TEXT DEFAULT '16';

-- 4. Ensure columns exist on majlis_reports
ALTER TABLE public.majlis_reports
  ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'STUDENT',
  ADD COLUMN IF NOT EXISTS message_id TEXT,
  ADD COLUMN IF NOT EXISTS message_content TEXT;

-- 5. Restore resilient RLS policies on majlis_rooms
DROP POLICY IF EXISTS "Public insert majlis_rooms" ON public.majlis_rooms;
DROP POLICY IF EXISTS "Authenticated insert majlis_rooms" ON public.majlis_rooms;
CREATE POLICY "Public insert majlis_rooms"
  ON public.majlis_rooms FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public update majlis_rooms" ON public.majlis_rooms;
CREATE POLICY "Public update majlis_rooms"
  ON public.majlis_rooms FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. Resilient RLS for majlis_members
DROP POLICY IF EXISTS "Public insert majlis_members" ON public.majlis_members;
CREATE POLICY "Public insert majlis_members"
  ON public.majlis_members FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public update majlis_members" ON public.majlis_members;
CREATE POLICY "Public update majlis_members"
  ON public.majlis_members FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete majlis_members" ON public.majlis_members;
CREATE POLICY "Public delete majlis_members"
  ON public.majlis_members FOR DELETE
  USING (true);

-- 7. Resilient RLS for majlis_messages
DROP POLICY IF EXISTS "Public insert majlis_messages" ON public.majlis_messages;
CREATE POLICY "Public insert majlis_messages"
  ON public.majlis_messages FOR INSERT
  WITH CHECK (true);
