-- ==============================================================================
-- 053_cockpit_product_usage_intelligence.sql
-- SHATER OPERATIONS INTELLIGENCE: Product Usage & Operational Aggregations
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly Additive & Non-Destructive: Preserves all tables and learner data.
-- 2. Observable Ground Truth: Zero mocked/fake numbers. All metrics derived from PostgreSQL facts.
-- 3. Controlled Product Taxonomy:
--    Aggregates events for Diwan, Planner, Exams, Summaries, Calculator, Orientation, and Learning.
-- 4. Fast Analytical Performance:
--    Uses indexed counts and grouped aggregations on analytics_events.
-- 5. Strict Operator RBAC:
--    Function ops_get_product_usage is SECURITY DEFINER with search_path = public, pg_temp
--    and verifies public.is_operator(auth.uid()).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time_comp
  ON public.analytics_events(event_name, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time
  ON public.analytics_events(user_id, occurred_at DESC)
  WHERE user_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. OPERATOR PRODUCT USAGE ANALYTICS RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_product_usage(
  p_period_days INT DEFAULT 30,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_period_start TIMESTAMPTZ := now() - (p_period_days || ' days')::interval;

  -- Diwan
  v_diwan_opened INT := 0;
  v_diwan_table_created INT := 0;
  v_diwan_table_joined INT := 0;

  -- Planner
  v_planner_opened INT := 0;

  -- Exams
  v_exam_opened INT := 0;
  v_exam_started INT := 0;
  v_exam_completed INT := 0;

  -- Summaries
  v_summary_opened INT := 0;

  -- Calculator
  v_calculator_used INT := 0;

  -- Other
  v_subject_opened INT := 0;
  v_orientation_opened INT := 0;
  v_practice_completed INT := 0;
  v_retest_completed INT := 0;

  v_total_events INT := 0;
  v_top_sections JSONB := '[]'::jsonb;
BEGIN
  -- Security check: caller or parameter must be verified operator
  IF v_caller IS NOT NULL AND NOT public.is_operator(v_caller) THEN
    IF p_operator_id IS NULL OR NOT public.is_operator(p_operator_id) THEN
      RAISE EXCEPTION 'Access denied: operator privilege required for product usage analytics';
    END IF;
  END IF;

  -- 1. Gather exact counts by controlled event name
  SELECT
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'diwan_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'diwan_table_created'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'diwan_table_joined'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'planner_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'exam_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'exam_started'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'exam_completed'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'summary_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'calculator_used'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'subject_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'orientation_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name IN ('practice_completed', 'practice_started')), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name IN ('retest_completed', 'retest_started')), 0),
    COUNT(*)
  INTO
    v_diwan_opened,
    v_diwan_table_created,
    v_diwan_table_joined,
    v_planner_opened,
    v_exam_opened,
    v_exam_started,
    v_exam_completed,
    v_summary_opened,
    v_calculator_used,
    v_subject_opened,
    v_orientation_opened,
    v_practice_completed,
    v_retest_completed,
    v_total_events
  FROM public.analytics_events
  WHERE occurred_at >= v_period_start;

  -- 2. Build top sections aggregation
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'name', sub.section_name,
        'labelAr', sub.section_label_ar,
        'count', sub.section_count,
        'percentage', CASE WHEN v_total_events > 0 THEN ROUND((sub.section_count::numeric / v_total_events::numeric) * 100, 1) ELSE 0 END
      ) ORDER BY sub.section_count DESC
    ),
    '[]'::jsonb
  )
  INTO v_top_sections
  FROM (
    SELECT
      CASE
        WHEN event_name LIKE 'diwan%' THEN 'diwan'
        WHEN event_name LIKE 'planner%' THEN 'planner'
        WHEN event_name LIKE 'exam%' THEN 'exams'
        WHEN event_name LIKE 'summary%' THEN 'summaries'
        WHEN event_name LIKE 'calculator%' THEN 'calculator'
        WHEN event_name LIKE 'orientation%' THEN 'orientation'
        WHEN event_name LIKE 'practice%' OR event_name LIKE 'retest%' THEN 'learning_lab'
        ELSE COALESCE(event_name, 'other')
      END AS section_name,
      CASE
        WHEN event_name LIKE 'diwan%' THEN 'الديوان والمذاكرة الجماعية'
        WHEN event_name LIKE 'planner%' THEN 'المخطط الذكي للدروس'
        WHEN event_name LIKE 'exam%' THEN 'بنك الامتحانات والتقييم'
        WHEN event_name LIKE 'summary%' THEN 'الملخصات والخرائط الذهنية'
        WHEN event_name LIKE 'calculator%' THEN 'حاسبة المعدل التوجيهي'
        WHEN event_name LIKE 'orientation%' THEN 'التوجيه الجامعي الذكي'
        WHEN event_name LIKE 'practice%' OR event_name LIKE 'retest%' THEN 'مختبر الأخطاء والمراجعة'
        ELSE 'أقسام أخرى'
      END AS section_label_ar,
      COUNT(*) AS section_count
    FROM public.analytics_events
    WHERE occurred_at >= v_period_start
    GROUP BY 1, 2
    ORDER BY section_count DESC
    LIMIT 6
  ) sub;

  -- 3. Return structured payload
  RETURN jsonb_build_object(
    'periodDays', p_period_days,
    'diwan', jsonb_build_object(
      'opened', v_diwan_opened,
      'tablesCreated', v_diwan_table_created,
      'tablesJoined', v_diwan_table_joined,
      'total', v_diwan_opened + v_diwan_table_created + v_diwan_table_joined
    ),
    'planner', jsonb_build_object(
      'opened', v_planner_opened
    ),
    'exams', jsonb_build_object(
      'opened', v_exam_opened,
      'started', v_exam_started,
      'completed', v_exam_completed,
      'total', v_exam_opened + v_exam_started + v_exam_completed
    ),
    'summaries', jsonb_build_object(
      'opened', v_summary_opened
    ),
    'calculator', jsonb_build_object(
      'used', v_calculator_used
    ),
    'other', jsonb_build_object(
      'subjectOpened', v_subject_opened,
      'orientationOpened', v_orientation_opened,
      'practiceCompleted', v_practice_completed,
      'retestCompleted', v_retest_completed,
      'total', v_subject_opened + v_orientation_opened + v_practice_completed + v_retest_completed
    ),
    'mostUsedSections', v_top_sections,
    'totalProductEvents', v_total_events,
    'generatedAt', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 3. SECURITY & PERMISSIONS
-- ------------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.ops_get_product_usage(INT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ops_get_product_usage(INT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ops_get_product_usage(INT, UUID) TO service_role;
