-- Migration 044: Add Stream Column to Resources Table
-- Enables filtering educational resources by academic branch/stream (شعب علمية، تسيير واقتصاد، آداب وفلسفة، إلخ)

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS stream TEXT;
CREATE INDEX IF NOT EXISTS idx_resources_stream ON public.resources (stream);
