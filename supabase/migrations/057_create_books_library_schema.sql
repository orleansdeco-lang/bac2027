-- Migration 057: Create Books Library Schema
-- Description: Digital Library & Reference Hub for BAC Algerian students (books, professor series, summaries, exam solutions).

CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    category TEXT NOT NULL CHECK (category IN ('official', 'professor_series', 'summary', 'exam_solutions')),
    subject TEXT NOT NULL CHECK (subject IN ('math', 'physics', 'science', 'arabic', 'philosophy', 'islamic', 'history_geo', 'english', 'french')),
    streams TEXT[] NOT NULL DEFAULT '{}',
    cover_url TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT,
    pages_count INTEGER,
    year_edition TEXT,
    downloads_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance and Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books (category);
CREATE INDEX IF NOT EXISTS idx_books_subject ON public.books (subject);
CREATE INDEX IF NOT EXISTS idx_books_is_featured ON public.books (is_featured);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_downloads_count ON public.books (downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_streams ON public.books USING GIN (streams);

-- Full-text / fast search index on title and author
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON public.books (title);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON public.books (author);

-- Enable Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Allow anonymous and authenticated students to view all books
DROP POLICY IF EXISTS "Public read access for books" ON public.books;
CREATE POLICY "Public read access for books"
    ON public.books
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2. Full Access for Service Role (Internal background tasks & Admin APIs)
DROP POLICY IF EXISTS "Full access for service role on books" ON public.books;
CREATE POLICY "Full access for service role on books"
    ON public.books
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Insert and Update Policy for Authenticated Admin/Operators
DROP POLICY IF EXISTS "Admin insert access for books" ON public.books;
CREATE POLICY "Admin insert access for books"
    ON public.books
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update access for books" ON public.books;
CREATE POLICY "Admin update access for books"
    ON public.books
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin delete access for books" ON public.books;
CREATE POLICY "Admin delete access for books"
    ON public.books
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Secure RPC function for atomically incrementing download counter
CREATE OR REPLACE FUNCTION increment_book_downloads(target_book_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.books
    SET downloads_count = downloads_count + 1
    WHERE id = target_book_id
    RETURNING downloads_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon and authenticated
GRANT EXECUTE ON FUNCTION increment_book_downloads(UUID) TO anon, authenticated, service_role;
