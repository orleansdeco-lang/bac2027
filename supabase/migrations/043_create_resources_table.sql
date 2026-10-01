-- Migration 043: Create Resources Table
-- Description: Stores scraped BAC/BEM exam topics, summaries, and exercises with metadata and PDF links.

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    term INT,
    title TEXT NOT NULL,
    source_url TEXT UNIQUE NOT NULL,
    pdf_links TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance and Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources (subject);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources (category);
CREATE INDEX IF NOT EXISTS idx_resources_term ON public.resources (term);
CREATE INDEX IF NOT EXISTS idx_resources_source_url ON public.resources (source_url);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Allow anonymous and authenticated users to browse resources
CREATE POLICY "Public read access for resources"
    ON public.resources
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2. Full Access for Service Role
CREATE POLICY "Full access for service role on resources"
    ON public.resources
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Insert and Update Policy for Scraper / Ingestion Scripts
CREATE POLICY "Scraper insert access for resources"
    ON public.resources
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Scraper update access for resources"
    ON public.resources
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
