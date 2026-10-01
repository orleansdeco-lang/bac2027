-- Migration 045: Create exam_files storage bucket and configure public access
-- This ensures exam PDFs can be hosted natively inside Supabase Storage

-- 1. Insert bucket into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exam_files',
    'exam_files',
    true,
    52428800, -- 50 MB
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf'];

-- 2. Allow public read access to all files in exam_files bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access for exam_files'
    ) THEN
        CREATE POLICY "Public Access for exam_files"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'exam_files');
    END IF;
END $$;

-- 3. Allow service role and authenticated uploads to exam_files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Insert access for exam_files'
    ) THEN
        CREATE POLICY "Insert access for exam_files"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'exam_files');
    END IF;
END $$;
