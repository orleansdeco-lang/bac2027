-- ==============================================================================
-- 026_campus_and_majlis_tables.sql
-- SHATER BAC — Campus Community Knowledge Bank & 3D Majlis Interactive Tables
-- Invariant: Strict RLS, Authoritative Persistence, Multi-Device Sync
-- ==============================================================================

-- 1. CAMPUS POSTS TABLE (Knowledge Bank: Experiences, Summaries, Tricky Problems)
CREATE TABLE IF NOT EXISTS public.campus_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL DEFAULT '👨‍🎓',
  author_stream TEXT NOT NULL DEFAULT 'sciences_exp',
  author_badge TEXT,
  type TEXT NOT NULL CHECK (type IN ('EXPERIENCE', 'SUMMARY', 'TRICKY_EXAM_PROBLEM')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  stream TEXT NOT NULL DEFAULT 'ALL',
  subject_id TEXT NOT NULL DEFAULT 'ALL',
  lesson TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  bookmarks_count INTEGER NOT NULL DEFAULT 0 CHECK (bookmarks_count >= 0),
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning-fast filtered feeds
CREATE INDEX IF NOT EXISTS idx_campus_posts_stream ON public.campus_posts (stream);
CREATE INDEX IF NOT EXISTS idx_campus_posts_subject ON public.campus_posts (subject_id);
CREATE INDEX IF NOT EXISTS idx_campus_posts_type ON public.campus_posts (type);
CREATE INDEX IF NOT EXISTS idx_campus_posts_created_at ON public.campus_posts (created_at DESC);

-- 2. CAMPUS BAG ITEMS TABLE (Student Personal Backpack Bookmarks)
CREATE TABLE IF NOT EXISTS public.campus_bag_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.campus_posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  stream TEXT NOT NULL DEFAULT 'ALL',
  subject_id TEXT NOT NULL DEFAULT 'ALL',
  lesson TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_post_bookmark UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_campus_bag_user_id ON public.campus_bag_items (user_id);

-- 3. POST LIKES TRACKING TABLE (Ensures 1 Like Per User)
CREATE TABLE IF NOT EXISTS public.campus_post_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.campus_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- 4. MAJLIS TABLES TABLE (Synchronous Collaborative Study Tables)
CREATE TABLE IF NOT EXISTS public.majlis_tables (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  stream TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  lesson TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('PAPER_PRACTICE', 'DIGITAL_QUIZ', 'GROUP_MEMORIZATION')),
  capacity INTEGER NOT NULL DEFAULT 6 CHECK (capacity >= 2 AND capacity <= 8),
  seats JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('LOBBY', 'ACTIVE', 'COMPLETED')),
  current_phase TEXT NOT NULL DEFAULT 'READING_SOLVING',
  time_remaining_seconds INTEGER NOT NULL DEFAULT 900,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  active_material JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_majlis_tables_stream ON public.majlis_tables (stream);
CREATE INDEX IF NOT EXISTS idx_majlis_tables_status ON public.majlis_tables (status);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.campus_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majlis_tables ENABLE ROW LEVEL SECURITY;

-- Campus Posts RLS Policies:
-- Any authenticated user can read posts
CREATE POLICY "Authenticated users can read campus posts"
  ON public.campus_posts FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own posts
CREATE POLICY "Authenticated users can insert posts"
  ON public.campus_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON public.campus_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Campus Bag Items RLS Policies:
-- Users can only view their own bag
CREATE POLICY "Users view own bag items"
  ON public.campus_bag_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bag items"
  ON public.campus_bag_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own bag items"
  ON public.campus_bag_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Majlis Tables RLS Policies:
CREATE POLICY "Authenticated users can view active tables"
  ON public.majlis_tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tables"
  ON public.majlis_tables FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Authenticated users can update tables"
  ON public.majlis_tables FOR UPDATE
  TO authenticated
  USING (true);
