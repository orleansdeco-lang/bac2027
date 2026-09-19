-- ==============================================================================
-- 017_add_wilaya_and_comment_moderation.sql
-- Migration: Add Wilaya to Experiences & Comments, Allow Author & Operator Edit/Delete
-- ==============================================================================

-- 1. Add wilaya column to public.bac_experiences
ALTER TABLE public.bac_experiences
    ADD COLUMN IF NOT EXISTS wilaya TEXT;

-- 2. Add wilaya and updated_at columns to public.experience_comments
ALTER TABLE public.experience_comments
    ADD COLUMN IF NOT EXISTS wilaya TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- 3. Index on wilaya for fast geo filtering
CREATE INDEX IF NOT EXISTS idx_bac_experiences_wilaya ON public.bac_experiences(wilaya);
CREATE INDEX IF NOT EXISTS idx_experience_comments_wilaya ON public.experience_comments(wilaya);

-- 4. Update RLS policies on public.experience_comments for author & operator edit/delete
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authors or operators can update comments" ON public.experience_comments;
    CREATE POLICY "Authors or operators can update comments"
        ON public.experience_comments
        FOR UPDATE
        USING (auth.uid() = author_id OR public.is_operator(auth.uid()))
        WITH CHECK (auth.uid() = author_id OR public.is_operator(auth.uid()));

    DROP POLICY IF EXISTS "Authors or operators can delete comments" ON public.experience_comments;
    CREATE POLICY "Authors or operators can delete comments"
        ON public.experience_comments
        FOR DELETE
        USING (auth.uid() = author_id OR public.is_operator(auth.uid()));
END $$;
