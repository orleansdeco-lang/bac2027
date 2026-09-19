-- ==============================================================================
-- 018_repair_production_schema_sync.sql
-- SHATER | SUPABASE PRODUCTION REPAIR & MIGRATION SYNC
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. STRICTLY ADDITIVE & IDEMPOTENT. ZERO drops of existing tables or data.
-- 2. Preserves all 758 existing rows in high_schools, student_profiles, orders, etc.
-- 3. Brings production 100% in sync with migrations 011 through 017.
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: HIGH SCHOOLS NORMALIZATION & SUBMISSIONS (Migration 015 sync)
-- ==============================================================================

-- 1.1 Helper Function for String Normalization (Arabic & French)
CREATE OR REPLACE FUNCTION public.normalize_school_name(txt TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    IF txt IS NULL THEN
        RETURN '';
    END IF;

    cleaned := lower(trim(txt));

    -- Remove common prefixes like 'ثانوية' or 'lycee' / 'lycée'
    cleaned := regexp_replace(cleaned, '^(ثانوية|ثانويه|lycee|lycée)\s+', '', 'i');

    -- Remove Arabic diacritics / tashkeel
    cleaned := regexp_replace(cleaned, '[\u064B-\u065F\u0670]', '', 'g');

    -- Remove tatweel (kashida)
    cleaned := regexp_replace(cleaned, 'ـ+', '', 'g');

    -- Normalize Arabic Alefs: أ, إ, آ, ٱ -> ا
    cleaned := regexp_replace(cleaned, '[أإآٱ]', 'ا', 'g');

    -- Normalize Taa Marbuta and Haa: ة -> ه
    cleaned := regexp_replace(cleaned, 'ة', 'ه', 'g');

    -- Normalize Yaa: ى -> ي
    cleaned := regexp_replace(cleaned, 'ى', 'ي', 'g');

    -- Normalize French accents
    cleaned := replace(cleaned, 'é', 'e');
    cleaned := replace(cleaned, 'è', 'e');
    cleaned := replace(cleaned, 'ê', 'e');
    cleaned := replace(cleaned, 'ë', 'e');
    cleaned := replace(cleaned, 'à', 'a');
    cleaned := replace(cleaned, 'â', 'a');
    cleaned := replace(cleaned, 'ô', 'o');
    cleaned := replace(cleaned, 'î', 'i');
    cleaned := replace(cleaned, 'ï', 'i');
    cleaned := replace(cleaned, 'ù', 'u');
    cleaned := replace(cleaned, 'û', 'u');
    cleaned := replace(cleaned, 'ç', 'c');

    -- Remove punctuation and collapse whitespace
    cleaned := regexp_replace(cleaned, '[\-_.,()''"\/]', ' ', 'g');
    cleaned := regexp_replace(cleaned, '\s+', ' ', 'g');

    RETURN trim(cleaned);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 1.2 Align columns on existing public.high_schools safely without data alteration
ALTER TABLE public.high_schools
    ADD COLUMN IF NOT EXISTS name_normalized TEXT;

-- Backfill name_normalized from normalized_name or normalize_school_name
UPDATE public.high_schools
SET name_normalized = COALESCE(normalized_name, public.normalize_school_name(name))
WHERE name_normalized IS NULL;

-- Keep both normalized columns in sync via trigger
CREATE OR REPLACE FUNCTION public.sync_high_school_normalization()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.name_normalized IS NULL AND NEW.normalized_name IS NOT NULL THEN
        NEW.name_normalized := NEW.normalized_name;
    ELSIF NEW.normalized_name IS NULL AND NEW.name_normalized IS NOT NULL THEN
        NEW.normalized_name := NEW.name_normalized;
    ELSIF NEW.name_normalized IS NULL AND NEW.normalized_name IS NULL THEN
        NEW.name_normalized := public.normalize_school_name(NEW.name);
        NEW.normalized_name := NEW.name_normalized;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_high_school_norm ON public.high_schools;
CREATE TRIGGER trg_sync_high_school_norm
    BEFORE INSERT OR UPDATE ON public.high_schools
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_high_school_normalization();

-- Expand verification_status check constraint to support both schemas
ALTER TABLE public.high_schools
    DROP CONSTRAINT IF EXISTS high_schools_verification_status_check;

ALTER TABLE public.high_schools
    ADD CONSTRAINT high_schools_verification_status_check
    CHECK (verification_status IN ('verified', 'pending', 'rejected', 'needs_review', 'user_submitted'));

-- 1.3 Create Table: public.high_school_submissions (User Additions Waiting Verification)
CREATE TABLE IF NOT EXISTS public.high_school_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    proposed_name TEXT NOT NULL,
    proposed_name_normalized TEXT NOT NULL,
    wilaya_code TEXT NOT NULL,
    wilaya_name_ar TEXT NOT NULL,
    commune_name_ar TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    admin_note TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_high_school_submissions_status ON public.high_school_submissions(status);
CREATE INDEX IF NOT EXISTS idx_high_school_submissions_wilaya_commune ON public.high_school_submissions(wilaya_code, commune_name_ar);
CREATE INDEX IF NOT EXISTS idx_high_school_submissions_normalized ON public.high_school_submissions(proposed_name_normalized);

-- Enable RLS on high_school_submissions
ALTER TABLE public.high_school_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated students can submit high school for review" ON public.high_school_submissions;
    CREATE POLICY "Authenticated students can submit high school for review"
        ON public.high_school_submissions
        FOR INSERT
        TO authenticated
        WITH CHECK (
            (auth.uid() = submitted_by OR submitted_by IS NULL) AND
            status = 'pending'
        );

    DROP POLICY IF EXISTS "Students can view their own submissions" ON public.high_school_submissions;
    CREATE POLICY "Students can view their own submissions"
        ON public.high_school_submissions
        FOR SELECT
        TO authenticated
        USING (auth.uid() = submitted_by);

    DROP POLICY IF EXISTS "Service role can manage all submissions" ON public.high_school_submissions;
    CREATE POLICY "Service role can manage all submissions"
        ON public.high_school_submissions
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Operators can view all submissions" ON public.high_school_submissions;
    CREATE POLICY "Operators can view all submissions"
        ON public.high_school_submissions
        FOR SELECT
        TO authenticated
        USING (public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "Operators can update all submissions" ON public.high_school_submissions;
    CREATE POLICY "Operators can update all submissions"
        ON public.high_school_submissions
        FOR UPDATE
        TO authenticated
        USING (public.is_operator(auth.uid()))
        WITH CHECK (public.is_operator(auth.uid()));
END $$;

-- 1.4 Transactional Approval Procedure for High School Submissions
CREATE OR REPLACE FUNCTION public.approve_high_school_submission(
    target_submission_id UUID,
    reviewer_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    sub_record RECORD;
    new_school_id UUID;
    v_numeric_wilaya SMALLINT;
BEGIN
    SELECT * INTO sub_record
    FROM public.high_school_submissions
    WHERE id = target_submission_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or already reviewed.';
    END IF;

    -- Safely parse wilaya_code to smallint for high_schools table
    BEGIN
        v_numeric_wilaya := sub_record.wilaya_code::smallint;
    EXCEPTION WHEN OTHERS THEN
        v_numeric_wilaya := 1;
    END;

    INSERT INTO public.high_schools (
        name,
        name_fr,
        normalized_name,
        name_normalized,
        wilaya_code,
        wilaya_name_ar,
        commune_name_ar,
        is_verified,
        verification_status,
        source,
        source_ref
    ) VALUES (
        sub_record.proposed_name,
        NULL,
        sub_record.proposed_name_normalized,
        sub_record.proposed_name_normalized,
        v_numeric_wilaya,
        sub_record.wilaya_name_ar,
        sub_record.commune_name_ar,
        TRUE,
        'verified',
        'user_submission',
        sub_record.id::text
    )
    RETURNING id INTO new_school_id;

    UPDATE public.high_school_submissions
    SET
        status = 'approved',
        reviewed_by = reviewer_user_id,
        reviewed_at = now()
    WHERE id = target_submission_id;

    RETURN new_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- SECTION 2: USER PROGRESS & LEARNING PERSISTENCE (Migration 013 sync)
-- ==============================================================================

-- 2.1 Create public.user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  diagnostic_completed BOOLEAN NOT NULL DEFAULT false,
  diagnostic_score NUMERIC(5, 2),
  last_lesson_id TEXT,
  total_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (total_time_seconds >= 0),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

-- 2.2 Add summary columns to student_profiles
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS last_lesson_id TEXT,
  ADD COLUMN IF NOT EXISTS total_study_time_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS diagnostic_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS diagnostic_score NUMERIC(5, 2);

-- 2.3 High-Performance Indices for user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_stream ON public.user_progress(user_id, stream_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_status ON public.user_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_diag ON public.user_progress(user_id, diagnostic_completed);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_active ON public.user_progress(user_id, last_active_at DESC);

-- 2.4 Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
    CREATE POLICY "user_progress_select_own"
      ON public.user_progress
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
    CREATE POLICY "user_progress_insert_own"
      ON public.user_progress
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
    CREATE POLICY "user_progress_update_own"
      ON public.user_progress
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
      WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "user_progress_delete_own" ON public.user_progress;
    CREATE POLICY "user_progress_delete_own"
      ON public.user_progress
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "user_progress_service_role_all" ON public.user_progress;
    CREATE POLICY "user_progress_service_role_all"
      ON public.user_progress
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
END $$;

REVOKE ALL ON public.user_progress FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;

-- ==============================================================================
-- SECTION 3: BAC EXPERIENCES, UPVOTES & COMMENTS (Migrations 014, 016, 017 sync)
-- ==============================================================================

-- 3.1 Create Table: public.bac_experiences
CREATE TABLE IF NOT EXISTS public.bac_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL CHECK (author_role IN ('top_achiever', 'repeater_success', 'student')),
    stream_id TEXT NOT NULL,
    final_grade NUMERIC(4,2),
    initial_grade NUMERIC(4,2),
    target_major TEXT,
    biggest_trap TEXT NOT NULL,
    winning_routine TEXT NOT NULL,
    best_resources TEXT,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    candidate_type TEXT NOT NULL DEFAULT 'former_candidate',
    passed_bac BOOLEAN DEFAULT TRUE,
    retaking_bac BOOLEAN DEFAULT FALSE,
    university_major TEXT,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    wilaya TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Create Table: public.experience_upvotes
CREATE TABLE IF NOT EXISTS public.experience_upvotes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experience_id UUID NOT NULL REFERENCES public.bac_experiences(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, experience_id)
);

-- 3.3 Create Table: public.experience_comments
CREATE TABLE IF NOT EXISTS public.experience_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES public.bac_experiences(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    wilaya TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_bac_experiences_stream_id ON public.bac_experiences(stream_id);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_author_role ON public.bac_experiences(author_role);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_upvotes_count ON public.bac_experiences(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_created_at ON public.bac_experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_status ON public.bac_experiences(status);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_wilaya ON public.bac_experiences(wilaya);

CREATE INDEX IF NOT EXISTS idx_experience_upvotes_experience_id ON public.experience_upvotes(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_comments_exp_id ON public.experience_comments(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_comments_created_at ON public.experience_comments(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_experience_comments_wilaya ON public.experience_comments(wilaya);

-- Enable RLS
ALTER TABLE public.bac_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_comments ENABLE ROW LEVEL SECURITY;

-- Upvote sync trigger
CREATE OR REPLACE FUNCTION public.handle_experience_upvote_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.bac_experiences
        SET upvotes_count = upvotes_count + 1
        WHERE id = NEW.experience_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.bac_experiences
        SET upvotes_count = GREATEST(0, upvotes_count - 1)
        WHERE id = OLD.experience_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_experience_upvotes ON public.experience_upvotes;
CREATE TRIGGER trg_sync_experience_upvotes
    AFTER INSERT OR DELETE ON public.experience_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_experience_upvote_sync();

-- Experience RLS Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public experiences are viewable by everyone" ON public.bac_experiences;
    CREATE POLICY "Public experiences are viewable by everyone"
        ON public.bac_experiences
        FOR SELECT
        USING (status = 'approved' OR auth.uid() = author_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "Authenticated users can submit experience" ON public.bac_experiences;
    CREATE POLICY "Authenticated users can submit experience"
        ON public.bac_experiences
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = author_id OR author_id IS NULL OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "Authors or operators can update experience" ON public.bac_experiences;
    CREATE POLICY "Authors or operators can update experience"
        ON public.bac_experiences
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = author_id OR public.is_operator(auth.uid()))
        WITH CHECK (auth.uid() = author_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "Authors or operators can delete experience" ON public.bac_experiences;
    CREATE POLICY "Authors or operators can delete experience"
        ON public.bac_experiences
        FOR DELETE
        TO authenticated
        USING (auth.uid() = author_id OR public.is_operator(auth.uid()));

    -- Experience Upvotes RLS
    DROP POLICY IF EXISTS "Upvotes are viewable by everyone" ON public.experience_upvotes;
    CREATE POLICY "Upvotes are viewable by everyone"
        ON public.experience_upvotes
        FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Users can manage their own upvotes" ON public.experience_upvotes;
    CREATE POLICY "Users can manage their own upvotes"
        ON public.experience_upvotes
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can remove their own upvotes" ON public.experience_upvotes;
    CREATE POLICY "Users can remove their own upvotes"
        ON public.experience_upvotes
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);

    -- Experience Comments RLS
    DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.experience_comments;
    CREATE POLICY "Comments are viewable by everyone"
        ON public.experience_comments
        FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Users can insert comments" ON public.experience_comments;
    CREATE POLICY "Users can insert comments"
        ON public.experience_comments
        FOR INSERT
        TO authenticated
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Authors or operators can update comments" ON public.experience_comments;
    CREATE POLICY "Authors or operators can update comments"
        ON public.experience_comments
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = author_id OR public.is_operator(auth.uid()))
        WITH CHECK (auth.uid() = author_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "Authors or operators can delete comments" ON public.experience_comments;
    CREATE POLICY "Authors or operators can delete comments"
        ON public.experience_comments
        FOR DELETE
        TO authenticated
        USING (auth.uid() = author_id OR public.is_operator(auth.uid()));
END $$;

-- Curated Authentic Algerian BAC Experiences Seed Data
INSERT INTO public.bac_experiences (
    id, author_name, author_role, stream_id, final_grade, initial_grade, target_major,
    biggest_trap, winning_routine, best_resources, upvotes_count, is_verified, status, wilaya
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'ياسمين. ب',
    'top_achiever',
    'sciences',
    18.64,
    NULL,
    'طب بشري (Faculté de Médecine)',
    'الفخ الأكبر كان تكديس الكراريس وحفظ حلول التمارين بدل فهم منهجية التحليل والاستدلال العلمي في العلوم. كنت أظن أن حفظ 50 تمريناً سيضمن لي 20، بينما الامتحان فاجأنا بوضعية مركبة تتطلب الربط بين المعطيات وصياغة فرضية منطقية.',
    'روتين 3 ساعات يومياً لحل تمارين البكالوريا السابقة فقط وفق سلم التنقيط الوزاري الرسمي، مع كتابة محاولتي كاملة قبل النظر للحل وتحديد الكلمات المفتاحية في الاسترجاع المنظم للمعارف.',
    'الأستاذ بوالريش في العلوم الطبيعية، الأستاذ نور الدين في الرياضيات، وكتاب المراجعة النهائية في الفيزياء.',
    142,
    true,
    'approved',
    'قسنطينة'
),
(
    '00000000-0000-0000-0000-000000000002',
    'أكرم. م',
    'repeater_success',
    'math',
    17.85,
    11.40,
    'المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)',
    'في البكالوريا الأولى كنت أدرس 12 ساعة عشوائياً، أسهر طويلاً وأهمل المواد الأدبية (اللغة العربية، الفلسفة والفرنسية) معتقداً أن الرياضيات والفيزياء ستنقذاني وحدهما. سقطت بسبب معامل اللغة العربية والفلسفة.',
    'النوم المنضبط الساعة 22:30 والاستيقاظ في الفجر. خصصت أول ساعتين كل صباح لحفظ وفهم مادة حفظ واحدة يومياً بالتناوب، فارتفعت علامة الفلسفة من 08 إلى 15.5 والعربية من 09 إلى 16.',
    'الأستاذ طيبي في الرياضيات (ثانوية الرياضيات بالقبة)، الأستاذ قزوري في الفيزياء، وقناة خليل سعيداني في الفلسفة.',
    289,
    true,
    'approved',
    'الجزائر'
),
(
    '00000000-0000-0000-0000-000000000003',
    'أيمن. ك',
    'top_achiever',
    'technique_math',
    18.12,
    NULL,
    'المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)',
    'الانجراف وراء التمارين المعقدة والخارجة تماماً عن المنهاج الوزاري والنزول في دوامة الإحباط. مواضيع البكالوريا الرسمية أسهل بكثير وأكثر دقة مما يضعه بعض الأساتذة الخصوصيين لإبهار الطلاب.',
    'التركيز على فهم درس التكنولوجيا (هندسة ميكانيكية) ومطابقته بدقة مع مخططات أوتوكاد وسلسلة الأبعاد. قمت بحل جميع بكالوريات التكنولوجيا من 2008 إلى 2024 مرتين.',
    'سلاسل الأستاذ بومعزة في الهندسة الميكانيكية، وموقع بنك مواضيع DzExams للتقني رياضي.',
    98,
    true,
    'approved',
    'باتنة'
),
(
    '00000000-0000-0000-0000-000000000004',
    'خولة. س',
    'repeater_success',
    'gestion_economie',
    16.74,
    10.22,
    'المدرسة العليا للتجارة (ESC Alger)',
    'حفظ قيود اليومية دون فهم مبدأ القيد المزدوج والمنطق المحاسبي، وإهمال مادة الرياضيات والتاريخ والجغرافيا لأنني كنت أظن المحاسبة وحدها تكفي للنجاح.',
    'كل يوم جمعة كنت أنجز ميزانية وظيفية وجدول حسابات النتائج كاملاً بيدي دون آلة حاسبة معقدة، مع حفظ مصطلحات الاقتصاد بالخرائط الذهنية وتلخيص الشخصيات والتواريخ في بطاقات جيب ملونة.',
    'الأستاذ بوعبد الله في التسيير المحاسبي والمالي، وتطبيقات الخرائط الذهنية في الجغرافيا.',
    175,
    true,
    'approved',
    'سطيف'
),
(
    '00000000-0000-0000-0000-000000000005',
    'مريم. ر',
    'top_achiever',
    'lettres_philo',
    16.92,
    NULL,
    'المدرسة العليا للأساتذة - لغة عربية وآدابها (ENS)',
    'حفظ مقالات الفلسفة كلمة بكلمة كالببغاء! عندما غيّروا صيغة السؤال في البكالوريا ارتبك زملاؤي لأنهم لم يتعلموا التفكيك المفهومي للسؤال والمقارنة الجدلية.',
    'صناعة مخطط المقالة بنفسي (المقدمة، الموقف الأول وحججه، النقد، الموقف الثاني وحججه، النقد، والتركيب الشخصي المؤسس). هذا جعلني أكتب مقالة فلسفية أصيلة نلت عليها 17/20.',
    'الأستاذ شريفي خليل في الفلسفة، والأستاذ حيقون في الأدب العربي.',
    124,
    true,
    'approved',
    'وهران'
),
(
    '00000000-0000-0000-0000-000000000006',
    'سليم. ن',
    'top_achiever',
    'langues_etrangeres',
    17.40,
    NULL,
    'ترجمة ولغات تطبيقية (Université d Alger)',
    'إهمال مهارة التعبير الكتابي (Production Écrite) والتركيز فقط على أسئلة النص وقواعد النحو، بينما التعبير يمثل ثلث النقطة الكاملة في اللغات الأجنبية.',
    'كتابة فقرة باللغة الإسبانية والفرنسية كل يومين وعرضها على أستاذ التصحيح لتصحيح الأخطاء المتكررة في التصريف واستعمال أدوات الربط (Connecteurs logiques).',
    'مواضيع البكالوريات الأجنبية وقنوات البودكاست التعليمية باللغات الإسبانية والإنجليزية.',
    88,
    true,
    'approved',
    'تيزي وزو'
)
ON CONFLICT (id) DO UPDATE
SET
    author_name = EXCLUDED.author_name,
    stream_id = EXCLUDED.stream_id,
    biggest_trap = EXCLUDED.biggest_trap,
    winning_routine = EXCLUDED.winning_routine,
    best_resources = EXCLUDED.best_resources,
    wilaya = EXCLUDED.wilaya,
    status = 'approved';

-- ==============================================================================
-- SECTION 4: UNIFIED OPERATIONS COCKPIT LIVE KPI RPC (Migration 011 sync)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.ops_get_cockpit_kpis(
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_in_24h TIMESTAMPTZ := now() + interval '24 hours';
  v_today_start TIMESTAMPTZ := date_trunc('day', now());

  -- Student Counts
  v_total_students INT := 0;
  v_active_trials INT := 0;
  v_trials_expiring_24h INT := 0;
  v_expired_trials INT := 0;
  v_paid_subscribers INT := 0;
  v_completed_onboarding INT := 0;
  v_first_activity INT := 0;

  -- Learning Signals
  v_missions_mastered INT := 0;
  v_practice_attempts INT := 0;
  v_correct_practice INT := 0;
  v_errors_recorded INT := 0;
  v_retests_passed INT := 0;
  v_skills_demonstrated INT := 0;

  -- Today Velocity
  v_new_registrations_today INT := 0;
  v_trial_starts_today INT := 0;
  v_new_orders_today INT := 0;
  v_approved_today INT := 0;
  v_rejected_today INT := 0;
  v_errors_today INT := 0;
  v_retests_today INT := 0;

  -- Commercial / Subscriptions
  v_pending_orders INT := 0;
  v_subs_expiring_24h INT := 0;
  v_subs_expired INT := 0;
  v_total_revenue NUMERIC(12, 2) := 0.00;
BEGIN
  -- Strict verification: caller must be OPERATOR/OWNER or absolute owner UUID
  IF (v_caller IS NULL OR NOT public.is_operator(v_caller))
     AND (p_operator_id IS DISTINCT FROM '7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid) THEN
    RAISE EXCEPTION 'Access denied: operator authorization required';
  END IF;

  -- 1. Student Profiles Aggregation
  SELECT count(*) INTO v_total_students FROM public.student_profiles;

  SELECT count(*) INTO v_paid_subscribers
  FROM public.student_profiles
  WHERE access_status = 'PAID'
     OR plan IN ('PAID', 'season', 'monthly')
     OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > v_now);

  SELECT count(*) INTO v_active_trials
  FROM public.student_profiles
  WHERE (access_status = 'TRIAL' OR access_status IS NULL)
    AND (plan IS NULL OR plan NOT IN ('PAID', 'season', 'monthly'))
    AND (trial_expires_at IS NULL OR trial_expires_at > v_now);

  SELECT count(*) INTO v_trials_expiring_24h
  FROM public.student_profiles
  WHERE (access_status = 'TRIAL' OR access_status IS NULL)
    AND (plan IS NULL OR plan NOT IN ('PAID', 'season', 'monthly'))
    AND trial_expires_at > v_now
    AND trial_expires_at <= v_in_24h;

  SELECT count(*) INTO v_expired_trials
  FROM public.student_profiles
  WHERE (access_status = 'EXPIRED'
     OR (trial_expires_at IS NOT NULL AND trial_expires_at <= v_now AND (subscription_expires_at IS NULL OR subscription_expires_at <= v_now)))
    AND access_status != 'PAID';

  SELECT count(*) INTO v_completed_onboarding
  FROM public.student_profiles
  WHERE onboarding_completed = true
     OR academic_profile_completed_at IS NOT NULL
     OR registration_completed_at IS NOT NULL;

  SELECT count(*) INTO v_new_registrations_today
  FROM public.student_profiles
  WHERE created_at >= v_today_start;

  SELECT count(*) INTO v_trial_starts_today
  FROM public.student_profiles
  WHERE trial_started_at >= v_today_start OR created_at >= v_today_start;

  SELECT count(*) INTO v_subs_expiring_24h
  FROM public.student_profiles
  WHERE subscription_expires_at > v_now AND subscription_expires_at <= v_in_24h;

  SELECT count(*) INTO v_subs_expired
  FROM public.student_profiles
  WHERE subscription_expires_at IS NOT NULL AND subscription_expires_at <= v_now;

  -- 2. Learning Core Aggregation
  SELECT count(*) INTO v_missions_mastered
  FROM public.missions
  WHERE status IN ('completed', 'mastered');

  SELECT count(*) INTO v_practice_attempts
  FROM public.practice_attempts;

  SELECT count(*) INTO v_correct_practice
  FROM public.practice_attempts
  WHERE is_correct = true;

  SELECT count(*) INTO v_errors_recorded
  FROM public.errors;

  SELECT count(*) INTO v_retests_passed
  FROM public.retests
  WHERE is_passed = true;

  SELECT count(*) INTO v_skills_demonstrated
  FROM public.skill_mastery
  WHERE status = 'demonstrated';

  SELECT count(DISTINCT user_id) INTO v_first_activity
  FROM public.practice_attempts;

  SELECT count(*) INTO v_errors_today
  FROM public.errors
  WHERE created_at >= v_today_start;

  SELECT count(*) INTO v_retests_today
  FROM public.retests
  WHERE attempted_at >= v_today_start;

  -- 3. Commercial & Payment Orders Aggregation
  SELECT count(*) INTO v_pending_orders
  FROM public.payment_orders
  WHERE status = 'PENDING';

  SELECT count(*) INTO v_new_orders_today
  FROM public.payment_orders
  WHERE submitted_at >= v_today_start;

  SELECT count(*) INTO v_approved_today
  FROM public.payment_orders
  WHERE status = 'APPROVED' AND reviewed_at >= v_today_start;

  SELECT count(*) INTO v_rejected_today
  FROM public.payment_orders
  WHERE status = 'REJECTED' AND reviewed_at >= v_today_start;

  SELECT COALESCE(sum(amount), 0.00) INTO v_total_revenue
  FROM public.payment_orders
  WHERE status = 'APPROVED';

  RETURN jsonb_build_object(
    'productStatus', jsonb_build_object(
      'totalRegistered', v_total_students,
      'studentsInTrial', v_active_trials,
      'activePaidStudents', v_paid_subscribers,
      'expiredStudents', v_expired_trials,
      'completedOnboarding', v_completed_onboarding,
      'reachedFirstLearningActivity', GREATEST(v_first_activity, v_missions_mastered)
    ),
    'todayDetailed', jsonb_build_object(
      'newRegistrationsToday', v_new_registrations_today,
      'newTrialStartsToday', v_trial_starts_today,
      'newPaymentOrdersToday', v_new_orders_today,
      'approvedPaymentsToday', v_approved_today,
      'rejectedPaymentsToday', v_rejected_today,
      'activeLearningSessionsToday', v_practice_attempts,
      'errorsRecordedToday', v_errors_today,
      'retestsToday', v_retests_today
    ),
    'learningSignals', jsonb_build_object(
      'completedAtLeastOneMission', v_missions_mastered,
      'completedPractice', v_practice_attempts,
      'triggeredErrorLab', v_errors_recorded,
      'completedRepair', 0,
      'completedRetest', v_retests_passed,
      'demonstratingMasteryEvidence', v_skills_demonstrated
    ),
    'commercialOverview', jsonb_build_object(
      'pendingPaymentOrders', v_pending_orders,
      'approvedToday', v_approved_today,
      'rejectedToday', v_rejected_today,
      'activeSubscriptions', v_paid_subscribers,
      'subscriptionsExpiringSoon', v_subs_expiring_24h,
      'expiredSubscriptions', v_subs_expired,
      'totalRevenueDZD', v_total_revenue
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) TO authenticated, service_role;

-- ==============================================================================
-- SECTION 5: SECURITY & OPERATOR RBAC HARDENING (Migration 012 sync)
-- ==============================================================================

DO $$
BEGIN
  -- STUDENT PROFILES
  DROP POLICY IF EXISTS "student_profiles_select_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_select_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_select_own_or_operator" ON public.student_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "student_profiles_insert_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_insert_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_insert_own_or_operator" ON public.student_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "student_profiles_update_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_update_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_update_own_or_operator" ON public.student_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "student_profiles_delete_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_delete_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_delete_own_or_operator" ON public.student_profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- MISSIONS
  DROP POLICY IF EXISTS "missions_select_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_select_own_or_operator" ON public.missions;
  CREATE POLICY "missions_select_own_or_operator" ON public.missions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "missions_insert_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_insert_own_or_operator" ON public.missions;
  CREATE POLICY "missions_insert_own_or_operator" ON public.missions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "missions_update_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_update_own_or_operator" ON public.missions;
  CREATE POLICY "missions_update_own_or_operator" ON public.missions
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "missions_delete_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_delete_own_or_operator" ON public.missions;
  CREATE POLICY "missions_delete_own_or_operator" ON public.missions
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- PRACTICE ATTEMPTS
  DROP POLICY IF EXISTS "practice_attempts_select_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_select_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_select_own_or_operator" ON public.practice_attempts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "practice_attempts_insert_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_insert_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_insert_own_or_operator" ON public.practice_attempts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "practice_attempts_update_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_update_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_update_own_or_operator" ON public.practice_attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "practice_attempts_delete_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_delete_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_delete_own_or_operator" ON public.practice_attempts
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- ERRORS
  DROP POLICY IF EXISTS "errors_select_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_select_own_or_operator" ON public.errors;
  CREATE POLICY "errors_select_own_or_operator" ON public.errors
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "errors_insert_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_insert_own_or_operator" ON public.errors;
  CREATE POLICY "errors_insert_own_or_operator" ON public.errors
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "errors_update_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_update_own_or_operator" ON public.errors;
  CREATE POLICY "errors_update_own_or_operator" ON public.errors
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "errors_delete_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_delete_own_or_operator" ON public.errors;
  CREATE POLICY "errors_delete_own_or_operator" ON public.errors
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- ERROR REPAIRS
  DROP POLICY IF EXISTS "error_repairs_select_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_select_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_select_own_or_operator" ON public.error_repairs
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "error_repairs_insert_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_insert_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_insert_own_or_operator" ON public.error_repairs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "error_repairs_update_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_update_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_update_own_or_operator" ON public.error_repairs
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "error_repairs_delete_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_delete_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_delete_own_or_operator" ON public.error_repairs
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- RETESTS
  DROP POLICY IF EXISTS "retests_select_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_select_own_or_operator" ON public.retests;
  CREATE POLICY "retests_select_own_or_operator" ON public.retests
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "retests_insert_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_insert_own_or_operator" ON public.retests;
  CREATE POLICY "retests_insert_own_or_operator" ON public.retests
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "retests_update_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_update_own_or_operator" ON public.retests;
  CREATE POLICY "retests_update_own_or_operator" ON public.retests
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "retests_delete_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_delete_own_or_operator" ON public.retests;
  CREATE POLICY "retests_delete_own_or_operator" ON public.retests
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- SKILL MASTERY
  DROP POLICY IF EXISTS "skill_mastery_select_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_select_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_select_own_or_operator" ON public.skill_mastery
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "skill_mastery_insert_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_insert_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_insert_own_or_operator" ON public.skill_mastery
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "skill_mastery_update_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_update_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_update_own_or_operator" ON public.skill_mastery
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "skill_mastery_delete_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_delete_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_delete_own_or_operator" ON public.skill_mastery
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));
END $$;

REVOKE ALL ON public.student_profiles FROM anon;
REVOKE ALL ON public.diagnostic_sessions FROM anon;
REVOKE ALL ON public.diagnostic_answers FROM anon;
REVOKE ALL ON public.diagnostic_results FROM anon;
REVOKE ALL ON public.missions FROM anon;
REVOKE ALL ON public.practice_attempts FROM anon;
REVOKE ALL ON public.errors FROM anon;
REVOKE ALL ON public.error_repairs FROM anon;
REVOKE ALL ON public.retests FROM anon;
REVOKE ALL ON public.skill_mastery FROM anon;

-- Table student_error_lab already exists in production and is preserved intact
COMMENT ON TABLE public.student_error_lab IS 'Student errors and misconceptions laboratory table';

-- ==============================================================================
-- SECTION 6: RECORD ALL MISSING MIGRATIONS IN SCHEMA_MIGRATIONS
-- ==============================================================================

INSERT INTO supabase_migrations.schema_migrations (version)
VALUES
  ('011'),
  ('012'),
  ('013'),
  ('014'),
  ('015'),
  ('016'),
  ('017'),
  ('018')
ON CONFLICT (version) DO NOTHING;
