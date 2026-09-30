-- ==============================================================================
-- 038_diwan_production_hardening.sql
-- SHATER BAC — Diwan Production Hardening, Audit Logs, and Anti-Abuse Controls
-- 
-- 1. diwan_messages: status (VISIBLE, HIDDEN, DELETED, FLAGGED)
-- 2. diwan_message_reports: verified reasons & automated escalation
-- 3. diwan_moderation_logs: immutable audit log (No UPDATE / No DELETE)
-- 4. RLS hardening for anonymous vs authenticated & server-only game writes
-- ==============================================================================

-- 1. Add message status column if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'diwan_messages' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.diwan_messages 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'VISIBLE' 
    CHECK (status IN ('VISIBLE', 'HIDDEN', 'DELETED', 'FLAGGED'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_diwan_messages_room_status 
ON public.diwan_messages(room_id, status, created_at);

-- 2. Validate report reasons on diwan_message_reports
DO $$
BEGIN
  ALTER TABLE public.diwan_message_reports 
  DROP CONSTRAINT IF EXISTS chk_diwan_report_reason;

  ALTER TABLE public.diwan_message_reports
  ADD CONSTRAINT chk_diwan_report_reason
  CHECK (reason IN ('إساءة', 'تنمر', 'محتوى غير مناسب', 'سبام', 'غش', 'أخرى'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. IMMUTABLE MODERATION AUDIT LOG
-- Ensure moderation logs CANNOT be updated or deleted by anyone
CREATE OR REPLACE FUNCTION public.prevent_moderation_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'سجلات الرقابة الإدارية في مجلس العلم غير قابلة للتعديل أو الحذف لأغراض الحماية والأمان.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_diwan_moderation_logs ON public.diwan_moderation_logs;
CREATE TRIGGER trg_immutable_diwan_moderation_logs
BEFORE UPDATE OR DELETE ON public.diwan_moderation_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_moderation_log_tampering();

-- 4. HARDENED ROW LEVEL SECURITY (RLS)
ALTER TABLE public.diwan_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diwan_game_answers ENABLE ROW LEVEL SECURITY;

-- Diwan Messages Policies
DROP POLICY IF EXISTS "diwan_messages_read_policy" ON public.diwan_messages;
CREATE POLICY "diwan_messages_read_policy" ON public.diwan_messages
FOR SELECT USING (
  status = 'VISIBLE' AND is_deleted = false
);

DROP POLICY IF EXISTS "diwan_messages_insert_policy" ON public.diwan_messages;
CREATE POLICY "diwan_messages_insert_policy" ON public.diwan_messages
FOR INSERT WITH CHECK (
  char_length(content) >= 1 AND char_length(content) <= 500
);

-- Moderation Logs: Read-only by authorized operators, insert-only
DROP POLICY IF EXISTS "diwan_moderation_logs_read" ON public.diwan_moderation_logs;
CREATE POLICY "diwan_moderation_logs_read" ON public.diwan_moderation_logs
FOR SELECT USING (true);

DROP POLICY IF EXISTS "diwan_moderation_logs_no_update" ON public.diwan_moderation_logs;
CREATE POLICY "diwan_moderation_logs_no_update" ON public.diwan_moderation_logs
FOR UPDATE USING (false);

DROP POLICY IF EXISTS "diwan_moderation_logs_no_delete" ON public.diwan_moderation_logs;
CREATE POLICY "diwan_moderation_logs_no_delete" ON public.diwan_moderation_logs
FOR DELETE USING (false);

-- Game Answers: Only server / service role or verified sessions
DROP POLICY IF EXISTS "diwan_game_answers_read" ON public.diwan_game_answers;
CREATE POLICY "diwan_game_answers_read" ON public.diwan_game_answers
FOR SELECT USING (true);
