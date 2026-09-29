-- ==============================================================================
-- 035_diwan_monitored_chat_and_extensions.sql
-- SHATER BAC — Enhancements for Diwan El-Ilm
-- 1. Wilaya & Avatar Persistence on Seats
-- 2. Room Duration & Auto-Completion on Empty
-- 3. Time Extension Mechanism by Host (+15m)
-- 4. Monitored Chat & Comprehensive Reporting (Student, Message, Room)
-- ==============================================================================

-- 1. ADD WILAYA CODE TO MAJLIS MEMBERS
ALTER TABLE public.majlis_members
  ADD COLUMN IF NOT EXISTS wilaya_code TEXT DEFAULT '16';

-- 2. ADD DURATION MINUTES TO MAJLIS ROOMS
ALTER TABLE public.majlis_rooms
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 45;

-- 3. ENHANCE MAJLIS REPORTS (Support Target Types: Student, Message, Room)
ALTER TABLE public.majlis_reports
  ADD COLUMN IF NOT EXISTS target_type TEXT NOT NULL DEFAULT 'STUDENT',
  ADD COLUMN IF NOT EXISTS message_id UUID,
  ADD COLUMN IF NOT EXISTS message_content TEXT;

-- Make reported_user_id nullable to allow Room-level reports
ALTER TABLE public.majlis_reports
  ALTER COLUMN reported_user_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_majlis_reports_target_type'
  ) THEN
    ALTER TABLE public.majlis_reports
      ADD CONSTRAINT chk_majlis_reports_target_type CHECK (target_type IN ('STUDENT', 'MESSAGE', 'ROOM'));
  END IF;
END $$;

-- 4. UPDATE ATOMIC STORED FUNCTION: TAKE SEAT
-- Accepts wilaya code and persists it authoritatively
CREATE OR REPLACE FUNCTION public.majlis_take_seat_atomic(
  p_room_id TEXT,
  p_user_id TEXT,
  p_user_name TEXT,
  p_user_avatar TEXT,
  p_user_stream TEXT,
  p_preferred_seat INTEGER DEFAULT 0,
  p_wilaya_code TEXT DEFAULT '16'
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
    RETURN jsonb_build_object('success', false, 'error', 'ROOM_NOT_ACTIVE', 'message', 'المجلس غير نشط أو تم إغلاقه');
  END IF;

  -- 2. Stream Match Check (Strict Albanian Baccalaureate Stream Lock)
  IF v_room.stream != 'ALL' AND v_room.stream != p_user_stream THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'STREAM_MISMATCH',
      'message', 'هذا المجلس مخصص لشعبة أخرى. يمكنك المشاهدة فقط كزائر.'
    );
  END IF;

  -- 3. Check if user already seated (update wilaya and avatar if changed)
  SELECT * INTO v_existing_member
  FROM public.majlis_members
  WHERE room_id = p_room_id AND user_id = p_user_id;

  IF FOUND THEN
    UPDATE public.majlis_members
    SET
      wilaya_code = COALESCE(p_wilaya_code, wilaya_code, '16'),
      user_avatar = COALESCE(p_user_avatar, user_avatar)
    WHERE room_id = p_room_id AND user_id = p_user_id
    RETURNING * INTO v_existing_member;

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

  -- 6. Insert new member with wilaya code and avatar
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
    wilaya_code,
    joined_at
  ) VALUES (
    p_room_id,
    p_user_id,
    p_user_name,
    COALESCE(p_user_avatar, '/illustrations/characters/scholar.jpg'),
    p_user_stream,
    v_target_seat,
    'SOLVING',
    0,
    false,
    COALESCE(p_wilaya_code, '16'),
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

-- 5. UPDATE ATOMIC STORED FUNCTION: LEAVE SEAT
-- Auto-completes room when 0 members remain!
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
  v_remaining_count INTEGER;
BEGIN
  SELECT * INTO v_member
  FROM public.majlis_members
  WHERE room_id = p_room_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'NOT_SEATED');
  END IF;

  v_duration_seconds := GREATEST(1, EXTRACT(EPOCH FROM (now() - v_member.joined_at))::INTEGER);

  -- Delete member
  DELETE FROM public.majlis_members
  WHERE room_id = p_room_id AND user_id = p_user_id;

  -- Check remaining members in the room
  SELECT COUNT(*) INTO v_remaining_count
  FROM public.majlis_members
  WHERE room_id = p_room_id;

  -- Auto-close room when empty!
  IF v_remaining_count = 0 THEN
    UPDATE public.majlis_rooms
    SET status = 'COMPLETED', updated_at = now()
    WHERE id = p_room_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'duration_seconds', v_duration_seconds,
    'remaining_members', v_remaining_count,
    'room_completed', (v_remaining_count = 0),
    'joined_at', v_member.joined_at,
    'ended_at', now()
  );
END;
$$;

-- 6. ATOMIC STORED FUNCTION: EXTEND ROOM TIME (+15 Minutes)
-- Allows the room host (or operator) to grant a time extension
CREATE OR REPLACE FUNCTION public.majlis_extend_room_time(
  p_room_id TEXT,
  p_host_user_id TEXT,
  p_additional_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_new_timer_end TIMESTAMPTZ;
  v_clamped_minutes INTEGER;
BEGIN
  v_clamped_minutes := LEAST(60, GREATEST(5, p_additional_minutes));

  SELECT * INTO v_room
  FROM public.majlis_rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ROOM_NOT_FOUND', 'message', 'المجلس غير موجود');
  END IF;

  -- Host authorization check
  IF v_room.host_user_id IS NOT NULL AND v_room.host_user_id::text != p_host_user_id AND NOT public.is_operator(p_host_user_id::uuid) THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'صاحب المجلس فقط من يملك صلاحية تمديد الوقت');
  END IF;

  -- Calculate new timer end: from current timer_end or now() if already past
  v_new_timer_end := GREATEST(now(), COALESCE(v_room.timer_end, now())) + (v_clamped_minutes * INTERVAL '1 minute');

  UPDATE public.majlis_rooms
  SET
    timer_end = v_new_timer_end,
    updated_at = now()
  WHERE id = p_room_id;

  RETURN jsonb_build_object(
    'success', true,
    'room_id', p_room_id,
    'new_timer_end', v_new_timer_end,
    'additional_minutes', v_clamped_minutes
  );
END;
$$;

-- 7. RE-VERIFY RLS POLICIES FOR MAJLIS REPORTS
DROP POLICY IF EXISTS "Authenticated insert majlis_reports" ON public.majlis_reports;
CREATE POLICY "Authenticated insert majlis_reports"
  ON public.majlis_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_user_id = auth.uid()::text
  );
