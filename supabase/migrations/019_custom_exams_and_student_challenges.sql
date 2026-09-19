-- ==============================================================================
-- 019_custom_exams_and_student_challenges.sql
-- Migration: Ops Custom Exams Bank & Student Community Challenges
-- ==============================================================================

-- 1. Table for Admin / Ops manually added exams and subjects
CREATE TABLE IF NOT EXISTS public.custom_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    stream_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'term_exam', -- 'official_bac', 'term_1', 'term_2', 'term_3', 'mock_exam'
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    term INTEGER, -- 1, 2, 3 (NULL if official bac)
    topic_name TEXT,
    school_name TEXT,
    wilaya TEXT,
    file_url TEXT NOT NULL,
    solution_url TEXT,
    has_solution BOOLEAN NOT NULL DEFAULT FALSE,
    difficulty TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'advanced', 'challenge'
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for fast querying in /exams and /ops/exams
CREATE INDEX IF NOT EXISTS idx_custom_exams_stream_subject ON public.custom_exams(stream_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_custom_exams_exam_type ON public.custom_exams(exam_type);
CREATE INDEX IF NOT EXISTS idx_custom_exams_year_term ON public.custom_exams(year, term);
CREATE INDEX IF NOT EXISTS idx_custom_exams_is_published ON public.custom_exams(is_published);
CREATE INDEX IF NOT EXISTS idx_custom_exams_created_at ON public.custom_exams(created_at DESC);

-- Enable RLS for custom_exams
ALTER TABLE public.custom_exams ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view published custom exams" ON public.custom_exams;
    CREATE POLICY "Public can view published custom exams"
        ON public.custom_exams
        FOR SELECT
        USING (is_published = true OR auth.role() = 'service_role');

    DROP POLICY IF EXISTS "Operators and service role can insert custom exams" ON public.custom_exams;
    CREATE POLICY "Operators and service role can insert custom exams"
        ON public.custom_exams
        FOR INSERT
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Operators and service role can update custom exams" ON public.custom_exams;
    CREATE POLICY "Operators and service role can update custom exams"
        ON public.custom_exams
        FOR UPDATE
        USING (true);

    DROP POLICY IF EXISTS "Operators and service role can delete custom exams" ON public.custom_exams;
    CREATE POLICY "Operators and service role can delete custom exams"
        ON public.custom_exams
        FOR DELETE
        USING (true);
END $$;


-- 2. Table for Student Community Challenges & Exercises
CREATE TABLE IF NOT EXISTS public.student_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    wilaya TEXT,
    stream_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    topic_name TEXT,
    title TEXT NOT NULL,
    content_text TEXT,
    file_url TEXT,
    file_type TEXT NOT NULL DEFAULT 'none', -- 'none', 'image', 'pdf'
    has_solution BOOLEAN NOT NULL DEFAULT FALSE,
    solution_text TEXT,
    solution_file_url TEXT,
    difficulty_level TEXT NOT NULL DEFAULT 'medium', -- 'normal', 'medium', 'hard', 'genius'
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'approved', -- 'approved', 'pending', 'hidden'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_challenges_status'
    ) THEN
        ALTER TABLE public.student_challenges
            ADD CONSTRAINT chk_student_challenges_status CHECK (status IN ('approved', 'pending', 'hidden'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_challenges_file_type'
    ) THEN
        ALTER TABLE public.student_challenges
            ADD CONSTRAINT chk_student_challenges_file_type CHECK (file_type IN ('none', 'image', 'pdf'));
    END IF;
END $$;

-- Indexes for student challenges
CREATE INDEX IF NOT EXISTS idx_student_challenges_stream_subject ON public.student_challenges(stream_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_student_challenges_status ON public.student_challenges(status);
CREATE INDEX IF NOT EXISTS idx_student_challenges_created_at ON public.student_challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_challenges_upvotes ON public.student_challenges(upvotes_count DESC);

-- Enable RLS on student_challenges
ALTER TABLE public.student_challenges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view approved student challenges" ON public.student_challenges;
    CREATE POLICY "Public can view approved student challenges"
        ON public.student_challenges
        FOR SELECT
        USING (status = 'approved' OR auth.uid() = author_id OR auth.role() = 'service_role');

    DROP POLICY IF EXISTS "Users can insert challenges" ON public.student_challenges;
    CREATE POLICY "Users can insert challenges"
        ON public.student_challenges
        FOR INSERT
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Authors and operators can update challenges" ON public.student_challenges;
    CREATE POLICY "Authors and operators can update challenges"
        ON public.student_challenges
        FOR UPDATE
        USING (auth.uid() = author_id OR auth.role() = 'service_role');

    DROP POLICY IF EXISTS "Authors and operators can delete challenges" ON public.student_challenges;
    CREATE POLICY "Authors and operators can delete challenges"
        ON public.student_challenges
        FOR DELETE
        USING (auth.uid() = author_id OR auth.role() = 'service_role');
END $$;


-- 3. Table for Challenge Comments & Discussion
CREATE TABLE IF NOT EXISTS public.challenge_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.student_challenges(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    wilaya TEXT,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_solution_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_comments_challenge_id ON public.challenge_comments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_comments_created_at ON public.challenge_comments(created_at ASC);

-- Enable RLS on challenge_comments
ALTER TABLE public.challenge_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Challenge comments are viewable by everyone" ON public.challenge_comments;
    CREATE POLICY "Challenge comments are viewable by everyone"
        ON public.challenge_comments
        FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Authenticated and guest users can insert comments" ON public.challenge_comments;
    CREATE POLICY "Authenticated and guest users can insert comments"
        ON public.challenge_comments
        FOR INSERT
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Authors and operators can delete comments" ON public.challenge_comments;
    CREATE POLICY "Authors and operators can delete comments"
        ON public.challenge_comments
        FOR DELETE
        USING (auth.uid() = author_id OR auth.role() = 'service_role');
END $$;


-- 4. Table for Challenge Upvotes
CREATE TABLE IF NOT EXISTS public.challenge_upvotes (
    challenge_id UUID NOT NULL REFERENCES public.student_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (challenge_id, user_id)
);

ALTER TABLE public.challenge_upvotes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Challenge upvotes are viewable by everyone" ON public.challenge_upvotes;
    CREATE POLICY "Challenge upvotes are viewable by everyone"
        ON public.challenge_upvotes
        FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Authenticated users can insert upvotes" ON public.challenge_upvotes;
    CREATE POLICY "Authenticated users can insert upvotes"
        ON public.challenge_upvotes
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can remove their own upvotes" ON public.challenge_upvotes;
    CREATE POLICY "Users can remove their own upvotes"
        ON public.challenge_upvotes
        FOR DELETE
        USING (auth.uid() = user_id);
END $$;


-- 5. Storage buckets setup for exam_documents and community_uploads
DO $$
BEGIN
    -- Exam documents bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'exam_documents',
        'exam_documents',
        true,
        20971520, -- 20MB
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 20971520,
        allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    -- Community uploads bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'community_uploads',
        'community_uploads',
        true,
        15728640, -- 15MB
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 15728640,
        allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
END $$;

-- Storage policies
DO $$
BEGIN
    -- Public read for exam_documents
    DROP POLICY IF EXISTS "Public can view exam documents" ON storage.objects;
    CREATE POLICY "Public can view exam documents"
        ON storage.objects FOR SELECT
        USING (bucket_id IN ('exam_documents', 'community_uploads'));

    -- Upload policy for exam_documents and community_uploads
    DROP POLICY IF EXISTS "Allow upload to exam_documents and community_uploads" ON storage.objects;
    CREATE POLICY "Allow upload to exam_documents and community_uploads"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id IN ('exam_documents', 'community_uploads'));

    -- Delete policy
    DROP POLICY IF EXISTS "Allow delete on community and exam documents" ON storage.objects;
    CREATE POLICY "Allow delete on community and exam documents"
        ON storage.objects FOR DELETE
        USING (bucket_id IN ('exam_documents', 'community_uploads'));
END $$;
