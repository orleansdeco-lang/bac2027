-- ==============================================================================
-- 022_shater_planner_core_system.sql
-- SHATER Planner Core System: Personal & Academic Management Foundation
-- Supports: Planner Events, Study Sessions, Daily Reflections, Preferences & Notifications
-- Invariant: Strict Privacy & RLS (Owner-Only Access)
-- ==============================================================================

-- 1. Planner Events Table (Tasks, Schedule & Fixed Commitments)
CREATE TABLE IF NOT EXISTS public.planner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'STUDY', 'PRACTICE', 'MISSION', 'REVIEW', 'EXAM',
    'HOMEWORK', 'TUTORING', 'SCHOOL', 'PERSONAL',
    'BREAK', 'SPORT', 'SLEEP', 'OTHER'
  )),
  date DATE NOT NULL, -- YYYY-MM-DD
  start_time TEXT NOT NULL, -- HH:MM (24-hour format)
  end_time TEXT, -- HH:MM
  duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
  stream_id TEXT NOT NULL DEFAULT 'sciences_exp',
  subject_id TEXT, -- e.g. 'math', 'physics', 'natural_sciences'
  skill_id TEXT, -- canonical skill reference if linked to curriculum
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'CANCELLED')),
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'AI', 'ROADMAP', 'RECURRING')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Study Sessions Table (Timer-Tracked Active Study Activity)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.planner_events(id) ON DELETE SET NULL,
  stream_id TEXT NOT NULL DEFAULT 'sciences_exp',
  subject_id TEXT NOT NULL,
  skill_id TEXT,
  planned_duration_minutes INTEGER NOT NULL DEFAULT 45,
  actual_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (actual_duration_seconds >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'ABANDONED', 'PAUSED')),
  interruptions_count INTEGER NOT NULL DEFAULT 0 CHECK (interruptions_count >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Daily Reflections Table (Evening Journal & Mood Tracking)
CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL, -- YYYY-MM-DD
  what_learned TEXT NOT NULL,
  day_mood TEXT NOT NULL CHECK (day_mood IN ('EXCELLENT', 'GOOD', 'AVERAGE', 'DIFFICULT')),
  hardest_part TEXT,
  tomorrow_goal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_daily_reflection_user_date UNIQUE (user_id, date)
);

-- 4. Planner Preferences Table (Personal & Aesthetic Settings)
CREATE TABLE IF NOT EXISTS public.planner_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_preference TEXT NOT NULL DEFAULT 'boys' CHECK (theme_preference IN ('boys', 'girls', 'bac-mastery')),
  planning_style TEXT NOT NULL DEFAULT 'HYBRID' CHECK (planning_style IN ('MANUAL', 'AI_ASSISTED', 'HYBRID')),
  preferred_study_times TEXT[] NOT NULL DEFAULT ARRAY['morning', 'evening'],
  study_days TEXT[] NOT NULL DEFAULT ARRAY['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  fixed_commitments JSONB NOT NULL DEFAULT '[]'::jsonb,
  daily_study_target_minutes INTEGER NOT NULL DEFAULT 120 CHECK (daily_study_target_minutes > 0),
  bac_target_score NUMERIC(4, 2) NOT NULL DEFAULT 15.00 CHECK (bac_target_score >= 0 AND bac_target_score <= 20),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Notification Preferences Table (Smart & Spiritual Notifications)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  morning_reminder BOOLEAN NOT NULL DEFAULT true,
  upcoming_task_reminder BOOLEAN NOT NULL DEFAULT true,
  task_start_reminder BOOLEAN NOT NULL DEFAULT true,
  completion_encouragement BOOLEAN NOT NULL DEFAULT true,
  evening_reflection_reminder BOOLEAN NOT NULL DEFAULT true,
  spiritual_reminders BOOLEAN NOT NULL DEFAULT false,
  morning_time TEXT NOT NULL DEFAULT '08:00',
  evening_time TEXT NOT NULL DEFAULT '21:00',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Planner Behavioral Analytics Events Table
CREATE TABLE IF NOT EXISTS public.planner_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. BAC Results Table (Longitudinal Future Data Foundation)
CREATE TABLE IF NOT EXISTS public.bac_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  passed BOOLEAN NOT NULL,
  overall_average NUMERIC(4, 2) NOT NULL CHECK (overall_average >= 0 AND overall_average <= 20),
  mention TEXT CHECK (mention IN ('PASSABLE', 'ASSEZ_BIEN', 'BIEN', 'TRES_BIEN', 'EXCELLENT')),
  result_year INTEGER NOT NULL,
  subject_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- Indices for High-Speed Retrieval
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_planner_events_user_date ON public.planner_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_planner_events_user_status ON public.planner_events(user_id, status);
CREATE INDEX IF NOT EXISTS idx_planner_events_user_type ON public.planner_events(user_id, type);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON public.study_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON public.daily_reflections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_planner_tracking_events_user_type ON public.planner_tracking_events(user_id, event_type);

-- ==============================================================================
-- Row Level Security (RLS) - Owner-Only Isolation
-- ==============================================================================
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bac_results ENABLE ROW LEVEL SECURITY;

-- planner_events policies
DROP POLICY IF EXISTS "planner_events_owner" ON public.planner_events;
CREATE POLICY "planner_events_owner" ON public.planner_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- study_sessions policies
DROP POLICY IF EXISTS "study_sessions_owner" ON public.study_sessions;
CREATE POLICY "study_sessions_owner" ON public.study_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- daily_reflections policies
DROP POLICY IF EXISTS "daily_reflections_owner" ON public.daily_reflections;
CREATE POLICY "daily_reflections_owner" ON public.daily_reflections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- planner_preferences policies
DROP POLICY IF EXISTS "planner_preferences_owner" ON public.planner_preferences;
CREATE POLICY "planner_preferences_owner" ON public.planner_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- notification_preferences policies
DROP POLICY IF EXISTS "notification_preferences_owner" ON public.notification_preferences;
CREATE POLICY "notification_preferences_owner" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- planner_tracking_events policies
DROP POLICY IF EXISTS "planner_tracking_events_owner" ON public.planner_tracking_events;
CREATE POLICY "planner_tracking_events_owner" ON public.planner_tracking_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- bac_results policies
DROP POLICY IF EXISTS "bac_results_owner" ON public.bac_results;
CREATE POLICY "bac_results_owner" ON public.bac_results
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
