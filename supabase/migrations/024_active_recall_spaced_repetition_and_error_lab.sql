-- ==============================================================================
-- 024_active_recall_spaced_repetition_and_error_lab.sql
-- BAC Mastery - Active Recall & Spaced Repetition Engine + Error Lab Subsystem
-- Database: Supabase PostgreSQL 15+
-- ==============================================================================

-- 1. Ensure current_term column in student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS current_term INTEGER NOT NULL DEFAULT 1 CHECK (current_term IN (1, 2, 3));

-- 2. Flash Questions Bank
CREATE TABLE IF NOT EXISTS public.flash_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream TEXT NOT NULL, -- e.g. 'sciences_exp', 'math', 'technique_math', 'gestion_eco', 'lettres_philo', 'langues_etrangeres', or 'all'
  subject TEXT NOT NULL, -- 'تاريخ', 'جغرافيا', 'إسلامية', 'فلسفة', 'لغات', 'مواد علمية'
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  unit_code TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('تاريخ', 'شخصية', 'مصطلح', 'سؤال فوري')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- JSON array of 4 choices: ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"]
  correct_option_index INTEGER NOT NULL CHECK (correct_option_index >= 0 AND correct_option_index <= 3),
  explanation TEXT NOT NULL,
  target_lesson_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flash_questions_stream_subject_term 
ON public.flash_questions(stream, subject, term);

CREATE INDEX IF NOT EXISTS idx_flash_questions_term 
ON public.flash_questions(term);

CREATE INDEX IF NOT EXISTS idx_flash_questions_unit_code 
ON public.flash_questions(unit_code);

-- 3. Notification Preferences (Web Push & Active Recall Trainer)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_minutes INTEGER NOT NULL DEFAULT 60 CHECK (frequency_minutes IN (30, 60, 120)),
  active_hours_start TIME NOT NULL DEFAULT '08:00:00',
  active_hours_end TIME NOT NULL DEFAULT '22:00:00',
  enabled_subjects TEXT[] NOT NULL DEFAULT ARRAY['تاريخ', 'جغرافيا', 'إسلامية', 'فلسفة']::TEXT[],
  push_subscription JSONB DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_notification_sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_active 
ON public.notification_preferences(is_active) WHERE is_active = true;

-- 4. Student Recall States (Leitner Spaced Repetition + Error Lab)
CREATE TABLE IF NOT EXISTS public.student_recall_states (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.flash_questions(id) ON DELETE CASCADE,
  box_level INTEGER NOT NULL DEFAULT 0 CHECK (box_level >= 0 AND box_level <= 5),
  consecutive_correct INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ DEFAULT NULL,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_in_error_lab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_recall_states_user_due 
ON public.student_recall_states(user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_recall_states_user_error_lab 
ON public.student_recall_states(user_id, is_in_error_lab);

-- 5. Row Level Security (RLS)
ALTER TABLE public.flash_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_recall_states ENABLE ROW LEVEL SECURITY;

-- flash_questions RLS
DROP POLICY IF EXISTS "flash_questions_select_all" ON public.flash_questions;
CREATE POLICY "flash_questions_select_all" ON public.flash_questions
  FOR SELECT TO authenticated, anon USING (true);

-- notification_preferences RLS
DROP POLICY IF EXISTS "notification_preferences_select_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_select_own" ON public.notification_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_insert_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_insert_own" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_update_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_update_own" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_delete_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_delete_own" ON public.notification_preferences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- student_recall_states RLS
DROP POLICY IF EXISTS "student_recall_states_select_own" ON public.student_recall_states;
CREATE POLICY "student_recall_states_select_own" ON public.student_recall_states
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "student_recall_states_insert_own" ON public.student_recall_states;
CREATE POLICY "student_recall_states_insert_own" ON public.student_recall_states
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "student_recall_states_update_own" ON public.student_recall_states;
CREATE POLICY "student_recall_states_update_own" ON public.student_recall_states
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Authoritative RPC: process_recall_answer
CREATE OR REPLACE FUNCTION public.process_recall_answer(
  p_question_id UUID,
  p_selected_option_index INT,
  p_source TEXT DEFAULT 'in_app'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_question RECORD;
  v_state RECORD;
  v_is_correct BOOLEAN;
  v_new_box_level INT := 0;
  v_consecutive_correct INT := 0;
  v_error_count INT := 0;
  v_is_in_error_lab BOOLEAN := false;
  v_remediated BOOLEAN := false;
  v_next_review TIMESTAMPTZ;
  v_event_id TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Fetch question details
  SELECT * INTO v_question FROM public.flash_questions WHERE id = p_question_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  v_is_correct := (v_question.correct_option_index = p_selected_option_index);

  -- 2. Fetch existing state or initialize
  SELECT * INTO v_state 
  FROM public.student_recall_states 
  WHERE user_id = v_user_id AND question_id = p_question_id;

  IF FOUND THEN
    v_new_box_level := v_state.box_level;
    v_consecutive_correct := v_state.consecutive_correct;
    v_error_count := v_state.error_count;
    v_is_in_error_lab := v_state.is_in_error_lab;
  END IF;

  -- 3. Adaptive Leitner & Error Lab rules
  IF NOT v_is_correct THEN
    -- On mistake:
    v_error_count := v_error_count + 1;
    v_consecutive_correct := 0;
    v_is_in_error_lab := true;
    v_new_box_level := GREATEST(0, v_new_box_level - 1);
    -- 4 hours review window for remediation
    v_next_review := now() + INTERVAL '4 hours';
  ELSE
    -- On correct answer:
    v_consecutive_correct := v_consecutive_correct + 1;

    IF v_is_in_error_lab THEN
      -- Needs 2 consecutive correct answers to leave error lab
      IF v_consecutive_correct >= 2 THEN
        v_is_in_error_lab := false;
        v_remediated := true;
        v_new_box_level := LEAST(5, v_new_box_level + 1);
        -- Leitner interval based on box level
        v_next_review := CASE v_new_box_level
          WHEN 1 THEN now() + INTERVAL '1 day'
          WHEN 2 THEN now() + INTERVAL '3 days'
          WHEN 3 THEN now() + INTERVAL '7 days'
          WHEN 4 THEN now() + INTERVAL '14 days'
          ELSE now() + INTERVAL '30 days'
        END;
      ELSE
        -- Still in error lab: review next session (12 hours)
        v_next_review := now() + INTERVAL '12 hours';
      END IF;
    ELSE
      -- Normal spaced repetition promotion
      v_new_box_level := LEAST(5, v_new_box_level + 1);
      v_next_review := CASE v_new_box_level
        WHEN 1 THEN now() + INTERVAL '1 day'
        WHEN 2 THEN now() + INTERVAL '3 days'
        WHEN 3 THEN now() + INTERVAL '7 days'
        WHEN 4 THEN now() + INTERVAL '14 days'
        ELSE now() + INTERVAL '30 days'
      END;
    END IF;
  END IF;

  -- 4. Upsert recall state
  INSERT INTO public.student_recall_states (
    user_id,
    question_id,
    box_level,
    consecutive_correct,
    error_count,
    last_reviewed_at,
    next_review_at,
    is_in_error_lab,
    updated_at
  ) VALUES (
    v_user_id,
    p_question_id,
    v_new_box_level,
    v_consecutive_correct,
    v_error_count,
    now(),
    v_next_review,
    v_is_in_error_lab,
    now()
  )
  ON CONFLICT (user_id, question_id) DO UPDATE SET
    box_level = EXCLUDED.box_level,
    consecutive_correct = EXCLUDED.consecutive_correct,
    error_count = EXCLUDED.error_count,
    last_reviewed_at = EXCLUDED.last_reviewed_at,
    next_review_at = EXCLUDED.next_review_at,
    is_in_error_lab = EXCLUDED.is_in_error_lab,
    updated_at = now();

  -- 5. Record telemetry events
  v_event_id := 'rec_' || gen_random_uuid()::text;
  INSERT INTO public.telemetry_events (
    event_id,
    anonymous_id,
    session_id,
    user_id,
    event_name,
    occurred_at,
    route,
    stream,
    subject,
    content_id,
    metadata
  ) VALUES (
    v_event_id,
    v_user_id::text,
    'recall_session',
    v_user_id,
    CASE WHEN p_source = 'inline_push' THEN 'recall_answered_inline' ELSE 'recall_answered_in_app' END,
    now(),
    '/student/arena/quick-recall',
    v_question.stream,
    v_question.subject,
    p_question_id::text,
    jsonb_build_object(
      'is_correct', v_is_correct,
      'selected_option', p_selected_option_index,
      'correct_option', v_question.correct_option_index,
      'source', p_source,
      'box_level', v_new_box_level,
      'is_in_error_lab', v_is_in_error_lab,
      'consecutive_correct', v_consecutive_correct
    )
  );

  -- Log remediation event if student successfully repaired the error
  IF v_remediated THEN
    INSERT INTO public.telemetry_events (
      event_id,
      anonymous_id,
      session_id,
      user_id,
      event_name,
      occurred_at,
      route,
      stream,
      subject,
      content_id,
      metadata
    ) VALUES (
      'rem_' || gen_random_uuid()::text,
      v_user_id::text,
      'recall_session',
      v_user_id,
      'error_lab_item_remediated',
      now(),
      '/student/error-lab',
      v_question.stream,
      v_question.subject,
      p_question_id::text,
      jsonb_build_object(
        'question_id', p_question_id,
        'final_box_level', v_new_box_level,
        'total_errors_overcome', v_error_count
      )
    );
  END IF;

  -- 6. Return comprehensive response
  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'correct_option_index', v_question.correct_option_index,
    'explanation', v_question.explanation,
    'target_lesson_url', v_question.target_lesson_url,
    'new_box_level', v_new_box_level,
    'is_in_error_lab', v_is_in_error_lab,
    'consecutive_correct', v_consecutive_correct,
    'remediated', v_remediated,
    'next_review_at', v_next_review
  );
END;
$$;

-- 7. Authoritative RPC: get_due_recall_questions
-- Returns questions strictly respecting student's stream and current_term.
-- Prioritizes: 1. Error Lab items, 2. Spaced Review items, 3. New unreviewed questions.
CREATE OR REPLACE FUNCTION public.get_due_recall_questions(
  p_limit INT DEFAULT 5,
  p_subject TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  stream TEXT,
  subject TEXT,
  term INT,
  unit_code TEXT,
  lesson_id TEXT,
  question_type TEXT,
  question_text TEXT,
  options JSONB,
  correct_option_index INT,
  explanation TEXT,
  target_lesson_url TEXT,
  box_level INT,
  consecutive_correct INT,
  error_count INT,
  is_in_error_lab BOOLEAN,
  next_review_at TIMESTAMPTZ,
  priority_tier INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_student_stream TEXT;
  v_student_term INT := 1;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch student profile stream and term
  SELECT COALESCE(stream_id, 'sciences_exp'), COALESCE(current_term, 1)
  INTO v_student_stream, v_student_term
  FROM public.student_profiles
  WHERE id = v_user_id;

  IF v_student_stream IS NULL THEN
    v_student_stream := 'sciences_exp';
  END IF;

  RETURN QUERY
  WITH candidate_questions AS (
    SELECT 
      q.id,
      q.stream,
      q.subject,
      q.term,
      q.unit_code,
      q.lesson_id,
      q.question_type,
      q.question_text,
      q.options,
      q.correct_option_index,
      q.explanation,
      q.target_lesson_url,
      COALESCE(s.box_level, 0) AS box_level,
      COALESCE(s.consecutive_correct, 0) AS consecutive_correct,
      COALESCE(s.error_count, 0) AS error_count,
      COALESCE(s.is_in_error_lab, false) AS is_in_error_lab,
      COALESCE(s.next_review_at, now()) AS next_review_at,
      CASE 
        -- Priority 1: In error lab and due
        WHEN s.is_in_error_lab = true AND s.next_review_at <= now() THEN 1
        -- Priority 2: In error lab (upcoming)
        WHEN s.is_in_error_lab = true THEN 2
        -- Priority 3: Regular spaced review and due
        WHEN s.question_id IS NOT NULL AND s.next_review_at <= now() THEN 3
        -- Priority 4: Brand new questions not yet answered
        WHEN s.question_id IS NULL THEN 4
        -- Priority 5: Regular questions not yet due
        ELSE 5
      END AS priority_tier
    FROM public.flash_questions q
    LEFT JOIN public.student_recall_states s 
      ON s.question_id = q.id AND s.user_id = v_user_id
    WHERE 
      -- STRICT TERM REJECTION: Never return questions beyond current term!
      q.term <= v_student_term
      -- Stream filter: match student stream or universal questions ('all')
      AND (
        q.stream = 'all' 
        OR q.stream = v_student_stream
        OR (v_student_stream IN ('sciences_exp', 'math', 'technique_math') AND q.stream = 'scientific')
        OR (v_student_stream IN ('lettres_philo', 'langues_etrangeres') AND q.stream = 'literary')
      )
      -- Optional subject filter
      AND (p_subject IS NULL OR q.subject = p_subject)
  )
  SELECT 
    cq.id,
    cq.stream,
    cq.subject,
    cq.term,
    cq.unit_code,
    cq.lesson_id,
    cq.question_type,
    cq.question_text,
    cq.options,
    cq.correct_option_index,
    cq.explanation,
    cq.target_lesson_url,
    cq.box_level,
    cq.consecutive_correct,
    cq.error_count,
    cq.is_in_error_lab,
    cq.next_review_at,
    cq.priority_tier
  FROM candidate_questions cq
  ORDER BY 
    cq.priority_tier ASC,
    cq.next_review_at ASC,
    random()
  LIMIT p_limit;
END;
$$;

-- 8. Seed Algerian BAC Curriculum Chronology (Term 1, 2, 3)
INSERT INTO public.flash_questions (
  stream, subject, term, unit_code, lesson_id, question_type, 
  question_text, options, correct_option_index, explanation, target_lesson_url
) VALUES
-- =================== TERM 1: الحرب الباردة، الثورة (54-56)، التقدم والتخلف ===================
(
  'all', 'تاريخ', 1, 'HIS_U1_L1', 'cold-war-formation', 'تاريخ',
  'في أي عام تم الإعلان عن مبدأ ترومان الهادف لتقديم مساعدات عسكرية واقتصادية لليونان وتركيا لمنع المد الشيوعي؟',
  '["1945", "1947", "1949", "1953"]'::jsonb,
  1,
  'أعلن الرئيس الأمريكي هاري ترومان عن مبدأه في 12 مارس 1947 لاحتواء الخطر السوفيتي في شرق المتوسط.',
  '/curriculum/history/cold-war#truman'
),
(
  'all', 'تاريخ', 1, 'HIS_U1_L1', 'cold-war-marshall', 'تاريخ',
  'ما هو تاريخ الإعلان عن مشروع مارشال لإنعاش الاقتصاد الأوروبي الغربي بعد الحرب العالمية الثانية؟',
  '["5 جوان 1947", "24 أكتوبر 1945", "4 أفريل 1949", "14 ماي 1955"]'::jsonb,
  0,
  'أعلن وزير الخارجية الأمريكي جورج مارشال عن مشروعه في جامعة هارفارد في 5 جوان 1947 بميزانية فاقت 12 مليار دولار.',
  '/curriculum/history/cold-war#marshall'
),
(
  'all', 'تاريخ', 1, 'HIS_U1_L1', 'cold-war-nato', 'مصطلح',
  'ما هو الحلف العسكري الغربي الذي تأسس في 4 أفريل 1949 لمواجهة الخطر الشيوعي؟',
  '["حلف وارسو", "حلف شمال الأطلسي (الناتو)", "حلف بغداد", "حلف جنوب شرق آسيا (سياتو)"]'::jsonb,
  1,
  'حلف الشمال الأطلسي (NATO) تأسس بواشنطن في 4 أفريل 1949 كأبرز حلف عسكري غربي برئاسة الولايات المتحدة.',
  '/curriculum/history/cold-war#nato'
),
(
  'all', 'تاريخ', 1, 'HIS_U1_L1', 'cold-war-truman-char', 'شخصية',
  'رئيس أمريكي قاد بلاده في نهاية الحرب العالمية الثانية، أمر بالقنبلة الذرية على اليابان وصاحب استراتيجية الاحتواء ومبدأ 1947:',
  '["فرانكلين روزفلت", "هاري ترومان", "دوايت أيزنهاور", "جون كينيدي"]'::jsonb,
  1,
  'هاري ترومان (Harry Truman): رئيس و.م.أ (1945-1953)، ارتبط اسمه بالقنبلة الذرية ومبدأ ترومان وتفجير الحرب الباردة.',
  '/curriculum/history/characters#truman'
),
(
  'all', 'تاريخ', 1, 'HIS_U1_L1', 'cold-war-zhdanov-char', 'شخصية',
  'سياسي سوفيتي ومقرّب من ستالين، صاحب أطروحة الكتلتين (الغربية الإمبريالية والشرقية الديمقراطية) ومؤسس الكومنفورم 1947:',
  '["أندريه جدانوف", "نيكيتا خروتشوف", "فياتشيسلاف مولوتوف", "ليونيد بريجنيف"]'::jsonb,
  0,
  'أندريه جدانوف (Andrei Zhdanov): منظر أيديولوجي سوفيتي، قدم مبدأ جدانوف في سبتمبر 1947 وأنشأ مكتب الإعلام الشيوعي الكومنفورم.',
  '/curriculum/history/characters#zhdanov'
),
(
  'all', 'تاريخ', 1, 'HIS_U2_L1', 'rev-outbreak-1954', 'تاريخ',
  'في أي تاريخ دقيق انطلقت أولى رصاصات الثورة التحريرية الجزائرية المباركة؟',
  '["1 نوفمبر 1954", "8 ماي 1945", "20 أوت 1955", "19 سبتمبر 1958"]'::jsonb,
  0,
  'اندلعت الثورة التحريرية الكبرى في الساعة الصفر من ليلة الإثنين 1 نوفمبر 1954 بشن أكثر من 30 عملية عسكرية متزامنة.',
  '/curriculum/history/algerian-revolution#outbreak'
),
(
  'all', 'تاريخ', 1, 'HIS_U2_L1', 'rev-north-constantine', 'تاريخ',
  'ما هو التاريخ المفصلي لهجومات الشمال القسنطيني بقيادة البطل زيغود يوسف التي فكت الحصار عن الأوراس وأكدت شعبية الثورة؟',
  '["20 أوت 1955", "20 أوت 1956", "1 نوفمبر 1954", "23 مارس 1954"]'::jsonb,
  0,
  'هجومات الشمال القسنطيني وقعت في منتصف نهار 20 أوت 1955، وحققت نقلة استراتيجية بدحض ادعاءات فرنسا حول تمرد محلي.',
  '/curriculum/history/algerian-revolution#constantine'
),
(
  'all', 'تاريخ', 1, 'HIS_U2_L1', 'rev-soummam-conference', 'تاريخ',
  'في أي تاريخ ومكان انعقد مؤتمر الصومام التاريخي لإعادة هيكلة وتنظيم الثورة التحريرية ومؤسساتها؟',
  '["20 أوت 1956 بقرية إيفري أوزلاقن", "1 نوفمبر 1954 بالأوراس", "19 سبتمبر 1958 بالقاهرة", "18 مارس 1962 بإيفيان"]'::jsonb,
  0,
  'انعقد مؤتمر الصومام في 20 أوت 1956 بقرية إيفري (وادي الصومام)، وأقر أولوية السياسي على العسكري والداخل على الخارج.',
  '/curriculum/history/algerian-revolution#soummam'
),
(
  'all', 'تاريخ', 1, 'HIS_U2_L1', 'rev-benboulaid-char', 'شخصية',
  'أحد أبرز قادة مفجري الثورة ومؤسسي جبهة التحرير، لُقّب بـ "أب الثورة الجزائرية" وقائد المنطقة الأولى (الأوراس):',
  '["مصطفى بن بولعيد", "العربي بن مهيدي", "ديدوش مراد", "زيغود يوسف"]'::jsonb,
  0,
  'مصطفى بن بولعيد: قائد المنطقة الأولى (الأوراس)، موّل الثورة بماله الخاص واستشهد بانفجار مذياع ملغوم في 22 مارس 1956.',
  '/curriculum/history/characters#benboulaid'
),
(
  'all', 'تاريخ', 1, 'HIS_U2_L1', 'rev-benmhidi-char', 'شخصية',
  'بطل ثوري وقائد المنطقة الخامسة (وهران)، صاحب المقولة الخالدة "ألقوا بالثورة إلى الشارع يحتضنها الشعب" وقائد معركة الجزائر العاصمة:',
  '["العربي بن مهيدي", "عبان رمضان", "كريم بلقاسم", "رابح بيطاط"]'::jsonb,
  0,
  'العربي بن مهيدي: عضو لجنة الستة المفجرة للثورة، أشرف على إضراب الثمانية أيام ومعركة الجزائر واستشهد تحت التعذيب في مارس 1957.',
  '/curriculum/history/characters#benmhidi'
),
(
  'all', 'جغرافيا', 1, 'GEO_U1_L1', 'north-south-divide', 'مصطلح',
  'ما هو الخط الجغرافي الاصطلاحي الذي يفصل بين دول الشمال المتقدم ودول الجنوب النامي؟',
  '["خط الاستواء", "خط براندت (Brandt Line)", "خط غرينتش", "مدار السرطان"]'::jsonb,
  1,
  'خط براندت وضعه المستشار الألماني ويلي براندت سنة 1980 لتقسيم العالم اقتصادياً إلى شمال متقدم وجنوب نامٍ/متخلف.',
  '/curriculum/geography/development-gap#brandt'
),
(
  'all', 'جغرافيا', 1, 'GEO_U1_L1', 'hdi-concept', 'مصطلح',
  'مؤشر مركب تقيس به الأمم المتحدة مستوى الرفاه والتقدم البشري بين 0 و 1 معتمداً على الصحة والتعليم والدخل الفردي:',
  '["مؤشر التنمية البشرية (IDH)", "الناتج الداخلي الخام (PIB)", "معدل الخصوبة", "ميزان المدفوعات"]'::jsonb,
  0,
  'مؤشر التنمية البشرية (HDI/IDH) تم استحداثه سنة 1990 من طرف برنامج الأمم المتحدة الإنمائي ومحمود الحق وأمارتيا سن.',
  '/curriculum/geography/development-gap#hdi'
),

-- =================== TERM 2: التعايش السلمي، الثورة (56-62)، القوى الاقتصادية ===================
(
  'all', 'تاريخ', 2, 'HIS_U1_L2', 'cold-war-peaceful-coexistence', 'مصطلح',
  'مفهوم سياسي جديد طرحته القيادة السوفيتية الثلاثية (الترويكا وخروتشوف) بعد وفاة ستالين 1953 يقوم على تجنب الحرب النووية والقبول بتعدد الأنظمة:',
  '["التعايش السلمي", "حرب النجوم", "سياسة ملء الفراغ", "السباق نحو التسلح"]'::jsonb,
  0,
  'التعايش السلمي دعا إليه نيكيتا خروتشوف سنة 1956 لإيجاد صيغة تفاهم وتعاون بين القوتين العظميين وتفادي الصدام المباشر.',
  '/curriculum/history/cold-war#peaceful-coexistence'
),
(
  'all', 'تاريخ', 2, 'HIS_U1_L2', 'cold-war-khrushchev-char', 'شخصية',
  'زعيم سوفيتي تولى الحكم بعد ستالين، قاد مبادرة التعايش السلمي وشهدت فترته أزمة الصواريخ الكوبية وبناء جدار برلين 1961:',
  '["نيكيتا خروتشوف", "فلاديمير لينين", "ميخائيل غورباتشوف", "ليونيد بريجنيف"]'::jsonb,
  0,
  'نيكيتا خروتشوف: الأمين العام للحزب الشيوعي السوفيتي (1953-1964)، أعلن عن سياسة التعايش السلمي وسحب الصواريخ من كوبا 1962.',
  '/curriculum/history/characters#khrushchev'
),
(
  'all', 'تاريخ', 2, 'HIS_U1_L2', 'cold-war-nonaligned-movement', 'تاريخ',
  'في أي تاريخ ومؤتمر تأسست رسمياً "حركة عدم الانحياز" المتبنية للحياد الإيجابي إزاء صراع المعسكرين؟',
  '["مؤتمر بلغراد (1-6 سبتمبر 1961)", "مؤتمر باندونغ (1955)", "مؤتمر يالطا (1945)", "مؤتمر القاهرة (1964)"]'::jsonb,
  0,
  'تأسست حركة عدم الانحياز رسمياً في مؤتمر بلغراد بجمهورية يوغسلافيا السابقة في سبتمبر 1961 بحضور 25 دولة نامية.',
  '/curriculum/history/cold-war#nonaligned'
),
(
  'all', 'تاريخ', 2, 'HIS_U2_L2', 'rev-evian-accords', 'تاريخ',
  'ما هو تاريخ توقيع اتفاقيات إيفيان الثانية التي أقرت وقف إطلاق النار واستقلال الجزائر الكامل؟',
  '["18 مارس 1962", "19 مارس 1962", "5 جويلية 1962", "11 ديسمبر 1960"]'::jsonb,
  0,
  'وُقعت اتفاقيات إيفيان الثانية بين الوفد الجزائري برئاسة كريم بلقاسم والوفد الفرنسي في 18 مارس 1962، وطبق وقف إطلاق النار في 19 مارس.',
  '/curriculum/history/algerian-revolution#evian'
),
(
  'all', 'تاريخ', 2, 'HIS_U2_L2', 'rev-demonstrations-1960', 'تاريخ',
  'ما هو التاريخ المشرّف للمظاهرات الشعبية العارمة في الجزائر التي أسقطت فكرة "الجزائر فرنسية" أمام الرأي العام العالمي وهيئة الأمم المتحدة؟',
  '["11 ديسمبر 1960", "17 أكتوبر 1961", "8 ماي 1945", "5 جويلية 1962"]'::jsonb,
  0,
  'مظاهرات 11 ديسمبر 1960 رفعت شعار "الجزائر مسلمة مستقلة"، وأكدت تلاحم الشعب مع جبهة وجيش التحرير الوطني.',
  '/curriculum/history/algerian-revolution#demonstrations1960'
),
(
  'all', 'تاريخ', 2, 'HIS_U2_L2', 'rev-de-gaulle-char', 'شخصية',
  'جنرال فرنسي ومؤسس الجمهورية الخامسة، استلم الحكم 1958 لوأد الثورة بمشاريع إغرائية (قسنطينة) وعسكرية ثم اضطر للتفاوض:',
  '["شارل ديغول", "غي مولي", "رينيه كوتي", "فرانسوا ميتران"]'::jsonb,
  0,
  'شارل ديغول (Charles de Gaulle): رئيس فرنسا (1958-1969)، طرح مشروع سلم الشجعان ومخطط قسنطينة قبل الرضوخ للتفاوض وإقرار حق تقرير المصير.',
  '/curriculum/history/characters#degaulle'
),
(
  'all', 'جغرافيا', 2, 'GEO_U2_L1', 'usa-economic-power', 'مصطلح',
  'ما هو الإقليم الاقتصادي الأقدم والأهم في الولايات المتحدة الأمريكية الذي يضم حزام التصنيع وميجالوبوليس بوسطن-واشنطن؟',
  '["إقليم الشمال الشرقي", "إقليم الجنوب (حزام الشمس)", "إقليم الغرب المطل على الهادئ", "إقليم السهول الكبرى"]'::jsonb,
  0,
  'إقليم الشمال الشرقي الأمريكي هو مهد النهضة الصناعية، يتركز به ثلث السكان وأكبر البورصات (Wall Street) والمجمعات الحضرية.',
  '/curriculum/geography/major-powers#usa-northeast'
),
(
  'all', 'جغرافيا', 2, 'GEO_U2_L2', 'eu-treaty-maastricht', 'تاريخ',
  'في أي معاهدة عام 1992 تحولت "المجموعة الاقتصادية الأوروبية" إلى "الاتحاد الأوروبي" وإقرار العملة الموحدة (اليورو)؟',
  '["معاهدة ماستريخت (Maastricht)", "معاهدة روما 1957", "معاهدة لشبونة 2007", "اتفاقية باريس 1951"]'::jsonb,
  0,
  'معاهدة ماستريخت بهولندا (وقعّت في 7 فيفري 1992 وطبقت في 1993) أرست دعائم الوحدة الاقتصادية والنقدية والسياسية لأوروبا.',
  '/curriculum/geography/major-powers#eu-maastricht'
),

-- =================== TERM 3: حركات التحرر، استعادة السيادة، قضايا التنمية ===================
(
  'all', 'تاريخ', 3, 'HIS_U3_L1', 'liberation-bandung', 'تاريخ',
  'في أي تاريخ ومكان انعقد المؤتمر الأفرو-آسيوي الذي أدان الاستعمار ودعم حق الشعوب المستعمرة في تقرير مصيرها؟',
  '["مؤتمر باندونغ بإندونيسيا (18-24 أفريل 1955)", "مؤتمر بلغراد (1961)", "مؤتمر القاهرة (1957)", "مؤتمر أكرا (1958)"]'::jsonb,
  0,
  'مؤتمر باندونغ بإندونيسيا عام 1955 جمع 29 دولة أفريقية وآسيوية وكان النواة الأولى لانطلاق حركة التحرر وعدم الانحياز.',
  '/curriculum/history/liberation-movements#bandung'
),
(
  'all', 'تاريخ', 3, 'HIS_U3_L2', 'algeria-oil-nationalization', 'تاريخ',
  'في أي تاريخ أعلن الرئيس هواري بومدين قرار تأميم المحروقات واستعادة الجزائر سيادتها الكاملة على ثرواتها الباطنية؟',
  '["24 فيفري 1971", "8 ماي 1966", "19 جوان 1965", "5 جويلية 1962"]'::jsonb,
  0,
  'أعلن الرئيس بومدين تأميم المحروقات في خطاب 24 فيفري 1971 التاريخي بمناسبة ذكرى تأسيس الاتحاد العام للعمال الجزائريين (UGTA).',
  '/curriculum/history/building-algeria#oil-nationalization'
),
(
  'all', 'تاريخ', 3, 'HIS_U3_L2', 'algeria-tripoli-charter', 'مصطلح',
  'ما هو الميثاق والبرنامج السياسي الذي صادق عليه المجلس الوطني للثورة الجزائرية في جوان 1962 لرسم معالم الدولة المستقلة؟',
  '["ميثاق طرابلس", "ميثاق الصومام", "ميثاق الجزائر 1964", "ميثاق أول نوفمبر"]'::jsonb,
  0,
  'ميثاق طرابلس (ليبيا - جوان 1962) حدد الخيارات الأساسية للجزائر المستقلة: الخيار الاشتراكي، الإصلاح الزراعي، والسياسة الخارجية التحررية.',
  '/curriculum/history/building-algeria#tripoli'
),
(
  'all', 'جغرافيا', 3, 'GEO_U3_L1', 'brazil-emerging-power', 'مصطلح',
  'ما هو المصطلح الاقتصادي الذي يُطلق على دول الجنوب ذات النمو الاقتصادي السريع والتصنيع المتنامي كالبرازيل والهند وجنوب إفريقيا؟',
  '["القوى الصاعدة / الاقتصاديات الناشئة", "الدول النامية المتخلفة", "دول العالم الرابع", "دول المحيط"]'::jsonb,
  0,
  'القوى الصاعدة (Emerging Powers) تشكل تكتلات اقتصادية كبرى كـ BRICS وتتميز بمعدلات نمو مرتفعة ومشاركة قوية في التجارة الدولية.',
  '/curriculum/geography/development-issues#emerging-powers'
)
ON CONFLICT DO NOTHING;

-- Verification query check
COMMENT ON TABLE public.flash_questions IS 'Authoritative question bank for Active Recall and Spaced Repetition engine.';
COMMENT ON TABLE public.notification_preferences IS 'Learner notification and spaced repetition trainer preferences.';
COMMENT ON TABLE public.student_recall_states IS 'Leitner box progress, error tracking and Error Lab remediation loop state.';
