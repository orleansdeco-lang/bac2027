-- ==============================================================================
-- 016_enhance_bac_experiences_and_comments.sql
-- Migration: Enhanced Experiences Hub, Status Moderation, Student Tracks, and Comments
-- ==============================================================================

-- 1. Add status and moderation columns to public.bac_experiences
ALTER TABLE public.bac_experiences
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS candidate_type TEXT NOT NULL DEFAULT 'former_candidate',
    ADD COLUMN IF NOT EXISTS passed_bac BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS retaking_bac BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS university_major TEXT,
    ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Ensure constraint on status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_bac_experiences_status'
    ) THEN
        ALTER TABLE public.bac_experiences
            ADD CONSTRAINT chk_bac_experiences_status CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- Ensure existing curated and seed experiences are marked as 'approved'
UPDATE public.bac_experiences
SET status = 'approved'
WHERE status = 'pending';

-- 2. Create table for comments on experiences: public.experience_comments
CREATE TABLE IF NOT EXISTS public.experience_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES public.bac_experiences(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast comments querying
CREATE INDEX IF NOT EXISTS idx_experience_comments_exp_id ON public.experience_comments(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_comments_created_at ON public.experience_comments(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_status ON public.bac_experiences(status);

-- 3. Enable RLS on comments
ALTER TABLE public.experience_comments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for public.experience_comments
DO $$
BEGIN
    DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.experience_comments;
    CREATE POLICY "Comments are viewable by everyone"
        ON public.experience_comments
        FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Users can insert comments" ON public.experience_comments;
    CREATE POLICY "Users can insert comments"
        ON public.experience_comments
        FOR INSERT
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Authors can delete their comments" ON public.experience_comments;
    CREATE POLICY "Authors can delete their comments"
        ON public.experience_comments
        FOR DELETE
        USING (auth.uid() = author_id OR public.is_operator(auth.uid()));
END $$;

-- 5. Update RLS on public.bac_experiences for public vs operator view
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public experiences are viewable by everyone" ON public.bac_experiences;
    CREATE POLICY "Public experiences are viewable by everyone"
        ON public.bac_experiences
        FOR SELECT
        USING (status = 'approved' OR auth.uid() = author_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "Operators can update any experience" ON public.bac_experiences;
    CREATE POLICY "Operators can update any experience"
        ON public.bac_experiences
        FOR UPDATE
        USING (public.is_operator(auth.uid()) OR auth.uid() = author_id)
        WITH CHECK (public.is_operator(auth.uid()) OR auth.uid() = author_id);
END $$;
