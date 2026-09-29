-- ==============================================================================
-- 034_harden_diwan_production_security.sql
-- SHATER BAC — Production Hardening for Diwan El-Ilm (Majlis, Knowledge & Safety)
-- Strict RLS, Atomic Seat Reservation, Anti-Harassment Blocking & Chat Security
-- ==============================================================================

-- 1. MAJLIS BLOCKS TABLE (Anti-Harassment & Student Safety)
CREATE TABLE IF NOT EXISTS public.majlis_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_majlis_blocks UNIQUE (user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_majlis_blocks_user ON public.majlis_blocks (user_id);
CREATE INDEX IF NOT EXISTS idx_majlis_blocks_blocked ON public.majlis_blocks (blocked_user_id);

ALTER TABLE public.majlis_blocks ENABLE ROW LEVEL SECURITY;

-- 2. HARDEN RLS FOR MAJLIS ROOMS
DROP POLICY IF EXISTS "Public read majlis_rooms" ON public.majlis_rooms;
DROP POLICY IF EXISTS "Public insert majlis_rooms" ON public.majlis_rooms;
DROP POLICY IF EXISTS "Public update majlis_rooms" ON public.majlis_rooms;

-- Read: Anyone can view rooms
CREATE POLICY "Public read majlis_rooms"
  ON public.majlis_rooms FOR SELECT
  USING (true);

-- Insert: Authenticated users only. Host user must be the caller.
CREATE POLICY "Authenticated insert majlis_rooms"
  ON public.majlis_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (host_user_id IS NULL OR host_user_id = auth.uid())
  );

-- Update: Only room host or authorized operator can modify room
CREATE POLICY "Host or operator update majlis_rooms"
  ON public.majlis_rooms FOR UPDATE
  TO authenticated
  USING (
    host_user_id = auth.uid() OR
    public.is_operator(auth.uid())
  )
  WITH CHECK (
    host_user_id = auth.uid() OR
    public.is_operator(auth.uid())
  );

-- Delete: Only room host or operator
CREATE POLICY "Host or operator delete majlis_rooms"
  ON public.majlis_rooms FOR DELETE
  TO authenticated
  USING (
    host_user_id = auth.uid() OR
    public.is_operator(auth.uid())
  );

-- 3. HARDEN RLS FOR MAJLIS MEMBERS
DROP POLICY IF EXISTS "Public read majlis_members" ON public.majlis_members;
DROP POLICY IF EXISTS "Public insert majlis_members" ON public.majlis_members;
DROP POLICY IF EXISTS "Public update majlis_members" ON public.majlis_members;
DROP POLICY IF EXISTS "Owner or Host update majlis_members" ON public.majlis_members;
DROP POLICY IF EXISTS "Owner or Host delete majlis_members" ON public.majlis_members;
DROP POLICY IF EXISTS "Public delete majlis_members" ON public.majlis_members;

-- Read: Everyone can view seated members
CREATE POLICY "Public read majlis_members"
  ON public.majlis_members FOR SELECT
  USING (true);

-- Insert: Caller can ONLY insert themselves as a member
CREATE POLICY "Self insert majlis_members"
  ON public.majlis_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()::text OR
    public.is_operator(auth.uid())
  );

-- Update: Member can update their own status/score, OR room host can update, OR operator
CREATE POLICY "Self, host, or operator update majlis_members"
  ON public.majlis_members FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()::text OR
    public.is_operator(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.majlis_rooms
      WHERE id = majlis_members.room_id AND host_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()::text OR
    public.is_operator(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.majlis_rooms
      WHERE id = majlis_members.room_id AND host_user_id = auth.uid()
    )
  );

-- Delete: Member can leave, host can kick, or operator
CREATE POLICY "Self, host, or operator delete majlis_members"
  ON public.majlis_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()::text OR
    public.is_operator(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.majlis_rooms
      WHERE id = majlis_members.room_id AND host_user_id = auth.uid()
    )
  );

-- 4. HARDEN RLS FOR MAJLIS MESSAGES
DROP POLICY IF EXISTS "Public read majlis_messages" ON public.majlis_messages;
DROP POLICY IF EXISTS "Public insert majlis_messages" ON public.majlis_messages;

-- Read: Everyone can read in-room messages
CREATE POLICY "Public read majlis_messages"
  ON public.majlis_messages FOR SELECT
  USING (true);

-- Insert: Only authenticated users where user_id = auth.uid(), AND must be seated member of room
CREATE POLICY "Seated member insert majlis_messages"
  ON public.majlis_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid()::text OR public.is_operator(auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.majlis_members
      WHERE room_id = majlis_messages.room_id AND user_id = auth.uid()::text
    )
  );

-- Delete: Author, host of room, or operator
CREATE POLICY "Author, host, or operator delete majlis_messages"
  ON public.majlis_messages FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()::text OR
    public.is_operator(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.majlis_rooms
      WHERE id = majlis_messages.room_id AND host_user_id = auth.uid()
    )
  );

-- 5. HARDEN RLS FOR MAJLIS REPORTS (Zero Leakage)
DROP POLICY IF EXISTS "Authenticated insert majlis_reports" ON public.majlis_reports;
DROP POLICY IF EXISTS "Admin read majlis_reports" ON public.majlis_reports;
DROP POLICY IF EXISTS "Admin update majlis_reports" ON public.majlis_reports;

-- Insert: Authenticated student submitting report
CREATE POLICY "Authenticated insert majlis_reports"
  ON public.majlis_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_user_id = auth.uid()::text);

-- Read: STRICTLY operators only
CREATE POLICY "Operators only read majlis_reports"
  ON public.majlis_reports FOR SELECT
  TO authenticated
  USING (public.is_operator(auth.uid()));

-- Update: STRICTLY operators only
CREATE POLICY "Operators only update majlis_reports"
  ON public.majlis_reports FOR UPDATE
  TO authenticated
  USING (public.is_operator(auth.uid()))
  WITH CHECK (public.is_operator(auth.uid()));

-- 6. HARDEN RLS FOR MAJLIS RSVP
DROP POLICY IF EXISTS "Public read majlis_rsvp" ON public.majlis_rsvp;
DROP POLICY IF EXISTS "Authenticated insert majlis_rsvp" ON public.majlis_rsvp;
DROP POLICY IF EXISTS "Authenticated delete majlis_rsvp" ON public.majlis_rsvp;

CREATE POLICY "Public read majlis_rsvp"
  ON public.majlis_rsvp FOR SELECT
  USING (true);

CREATE POLICY "Self insert majlis_rsvp"
  ON public.majlis_rsvp FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Self delete majlis_rsvp"
  ON public.majlis_rsvp FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- 7. RLS FOR MAJLIS BLOCKS
DROP POLICY IF EXISTS "Users manage own blocks" ON public.majlis_blocks;
CREATE POLICY "Users read own blocks"
  ON public.majlis_blocks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own blocks"
  ON public.majlis_blocks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own blocks"
  ON public.majlis_blocks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 8. ATOMIC STORED FUNCTION: TAKE SEAT
-- Prevents race conditions, enforces capacity & stream check at DB level
CREATE OR REPLACE FUNCTION public.majlis_take_seat_atomic(
  p_room_id TEXT,
  p_user_id TEXT,
  p_user_name TEXT,
  p_user_avatar TEXT,
  p_user_stream TEXT,
  p_preferred_seat INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_current_count INTEGER;
  v_existing_member RECORD;
  v_target_seat INTEGER;
  v_new_member RECORD;
  v_occupied_seats INTEGER[];
BEGIN
  -- 1. Lock room row for atomic concurrency
  SELECT id, capacity, stream, status
  INTO v_room
  FROM public.majlis_rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ROOM_NOT_FOUND', 'message', 'المجلس غير موجود');
  END IF;

  IF v_room.status != 'ACTIVE' THEN
    RETURN jsonb_build_object('success', false, 'error', 'ROOM_NOT_ACTIVE', 'message', 'المجلس غير نشط حالياً');
  END IF;

  -- 2. Stream Match Check
  IF v_room.stream != 'ALL' AND v_room.stream != p_user_stream THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'STREAM_MISMATCH',
      'message', 'هذا المجلس مخصص لشعبة أخرى. يمكنك المشاهدة فقط كزائر.'
    );
  END IF;

  -- 3. Check if user already seated
  SELECT * INTO v_existing_member
  FROM public.majlis_members
  WHERE room_id = p_room_id AND user_id = p_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'allowed', true, 'member', row_to_json(v_existing_member));
  END IF;

  -- 4. Capacity & Occupancy Check
  SELECT COUNT(*), array_agg(seat_index)
  INTO v_current_count, v_occupied_seats
  FROM public.majlis_members
  WHERE room_id = p_room_id;

  IF v_current_count >= v_room.capacity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ROOM_FULL',
      'message', 'المجلس ممتلئ بالكامل (اكتملت المقاعد).'
    );
  END IF;

  -- 5. Determine Target Seat Index
  IF v_occupied_seats IS NULL THEN
    v_occupied_seats := ARRAY[]::INTEGER[];
  END IF;

  v_target_seat := p_preferred_seat;
  IF v_target_seat < 0 OR v_target_seat >= v_room.capacity OR v_target_seat = ANY(v_occupied_seats) THEN
    -- Find lowest available seat
    FOR i IN 0..(v_room.capacity - 1) LOOP
      IF NOT (i = ANY(v_occupied_seats)) THEN
        v_target_seat := i;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- 6. Insert new member
  INSERT INTO public.majlis_members (
    room_id,
    user_id,
    user_name,
    user_avatar,
    user_stream,
    seat_index,
    status,
    score,
    finished_paper,
    joined_at
  ) VALUES (
    p_room_id,
    p_user_id,
    p_user_name,
    COALESCE(p_user_avatar, '👨‍🎓'),
    p_user_stream,
    v_target_seat,
    'SOLVING',
    0,
    false,
    now()
  )
  RETURNING * INTO v_new_member;

  RETURN jsonb_build_object(
    'success', true,
    'allowed', true,
    'member', row_to_json(v_new_member)
  );
END;
$$;

-- 9. ATOMIC STORED FUNCTION: LEAVE SEAT
CREATE OR REPLACE FUNCTION public.majlis_leave_seat_atomic(
  p_room_id TEXT,
  p_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member RECORD;
  v_duration_seconds INTEGER;
BEGIN
  SELECT * INTO v_member
  FROM public.majlis_members
  WHERE room_id = p_room_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'NOT_SEATED');
  END IF;

  v_duration_seconds := GREATEST(1, EXTRACT(EPOCH FROM (now() - v_member.joined_at))::INTEGER);

  DELETE FROM public.majlis_members
  WHERE room_id = p_room_id AND user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'duration_seconds', v_duration_seconds,
    'joined_at', v_member.joined_at,
    'ended_at', now()
  );
END;
$$;

-- 10. REALTIME PUBLICATION REGISTRATION
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.majlis_blocks;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- 11. ENHANCE CAMPUS POSTS (Status moderation & DB like sync)
ALTER TABLE public.campus_posts
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_campus_posts_status'
  ) THEN
    ALTER TABLE public.campus_posts
      ADD CONSTRAINT chk_campus_posts_status CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Trigger to automatically synchronize campus_posts.likes_count with campus_post_likes
CREATE OR REPLACE FUNCTION public.handle_campus_post_like_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.campus_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.campus_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_campus_post_likes ON public.campus_post_likes;
CREATE TRIGGER trg_sync_campus_post_likes
  AFTER INSERT OR DELETE ON public.campus_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_campus_post_like_sync();

-- Authors can delete their own posts
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.campus_posts;
CREATE POLICY "Authors can delete own posts"
  ON public.campus_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_operator(auth.uid()));
