-- ==============================================================================
-- 052_conversion_funnel_intelligence.sql
-- SHATER OPERATIONS INTELLIGENCE: Authoritative First-Party Conversion Funnel & Attribution
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly Additive & Non-Destructive: Preserves all existing tables and learner data.
-- 2. Observable Ground Truth: Zero mocked/fake numbers. Zero fake CAC, ROAS, or LTV.
-- 3. Strict 8-Stage Full-Funnel Taxonomy:
--    VISITOR -> ENGAGED VISITOR -> SIGNUP STARTED -> REGISTERED STUDENT ->
--    ACTIVATED STUDENT -> TRIAL STARTED -> PAYMENT SUBMITTED -> PAID STUDENT
-- 4. Attribution Integrity:
--    Revenue attributed ONLY when a strict first-party link exists from payment_orders -> student_profiles -> analytics_visitors.
-- 5. Attribution Completeness Warning:
--    Explicitly calculates percentage of unlinked/untracked registrations (REAL / PARTIAL / UNAVAILABLE).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_attribution
  ON public.analytics_visitors(user_id, first_channel, first_utm_source)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_campaign
  ON public.analytics_visitors(first_utm_campaign)
  WHERE first_utm_campaign IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_signup_detect
  ON public.analytics_events(event_name, occurred_at DESC);

-- ------------------------------------------------------------------------------
-- 2. CONVERSION FUNNEL & ACQUISITION RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_conversion_funnel(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();

  -- Stage Counts
  v_count_visitors INT := 0;
  v_count_engaged INT := 0;
  v_count_signup_started INT := 0;
  v_count_registered INT := 0;
  v_count_activated INT := 0;
  v_count_trial INT := 0;
  v_count_payment_submitted INT := 0;
  v_count_paid INT := 0;

  -- Attribution Counts
  v_attributed_registrations INT := 0;
  v_unattributed_registrations INT := 0;
  v_unattributed_percentage NUMERIC(5, 1) := 0.0;
  v_attribution_status TEXT := 'UNAVAILABLE';

  -- Breakdown JSON
  v_stages JSONB := '[]'::jsonb;
  v_ratios JSONB;
  v_sources JSONB := '[]'::jsonb;
  v_campaigns JSONB := '[]'::jsonb;
  v_result JSONB;
BEGIN
  -- 1. Security Check: Operator role or Master UUID
  IF (v_caller IS NULL OR NOT public.is_operator(v_caller))
     AND (p_operator_id IS DISTINCT FROM '7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid) THEN
    RAISE EXCEPTION 'Access denied: operator authorization required';
  END IF;

  -- 2. Stage 1: VISITOR (Unique visitors first seen or active in period)
  SELECT count(*) INTO v_count_visitors
  FROM public.analytics_visitors
  WHERE first_seen_at >= p_start_date AND first_seen_at <= p_end_date;

  -- Fallback to sessions if visitors table has no rows in window
  IF v_count_visitors = 0 THEN
    SELECT count(DISTINCT visitor_id) INTO v_count_visitors
    FROM public.analytics_sessions
    WHERE started_at >= p_start_date AND started_at <= p_end_date;
  END IF;

  -- 3. Stage 2: ENGAGED VISITOR (>1 pageview or active interaction)
  SELECT count(DISTINCT visitor_id) INTO v_count_engaged
  FROM public.analytics_sessions
  WHERE started_at >= p_start_date AND started_at <= p_end_date
    AND pageviews_count > 1;

  -- 4. Stage 3: SIGNUP STARTED (Visited /auth/register or event signup_started)
  SELECT count(DISTINCT COALESCE(visitor_id, session_id)) INTO v_count_signup_started
  FROM public.analytics_events
  WHERE occurred_at >= p_start_date AND occurred_at <= p_end_date
    AND (
      event_name = 'signup_started'
      OR (
        event_name = 'page_view' 
        AND (
          COALESCE(page_path, route) LIKE '/auth/register%'
          OR COALESCE(page_path, route) LIKE '/register%'
        )
      )
    );

  -- 5. Stage 4: REGISTERED STUDENT
  SELECT count(*) INTO v_count_registered
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date;

  -- 6. Stage 5: ACTIVATED STUDENT (Onboarding completed or stream set)
  SELECT count(*) INTO v_count_activated
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND (
      onboarding_completed = true 
      OR academic_profile_completed_at IS NOT NULL 
      OR registration_completed_at IS NOT NULL
      OR stream_id IS NOT NULL
    );

  -- 7. Stage 6: TRIAL STARTED
  SELECT count(*) INTO v_count_trial
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND (
      trial_started_at IS NOT NULL 
      OR access_status = 'TRIAL'
    );

  -- 8. Stage 7: PAYMENT SUBMITTED (Payment order submitted in period)
  SELECT count(DISTINCT user_id) INTO v_count_payment_submitted
  FROM public.payment_orders
  WHERE submitted_at >= p_start_date AND submitted_at <= p_end_date;

  -- 9. Stage 8: PAID STUDENT (Paid status confirmed)
  SELECT count(*) INTO v_count_paid
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND (
      access_status = 'PAID'
      OR plan IN ('PAID', 'season', 'monthly')
      OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > v_now)
    );

  -- 10. Compute Step-by-Step Funnel Stages
  v_stages := jsonb_build_array(
    jsonb_build_object(
      'key', 'visitor',
      'label', 'زائر فريد (Visitor)',
      'count', v_count_visitors,
      'conversionFromPrev', 100.0,
      'conversionFromTop', 100.0,
      'definition', 'زائر مجهول أو معروف تم رصد أول زيارة له خلال الفترة المحددة'
    ),
    jsonb_build_object(
      'key', 'engaged_visitor',
      'label', 'زائر متفاعل (Engaged Visitor)',
      'count', v_count_engaged,
      'conversionFromPrev', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_engaged::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_engaged::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'definition', 'زائر قام بتصفح أكثر من صفحة واحدة أو تفاعل مع محتوى الموقع وتجاوز الارتداد'
    ),
    jsonb_build_object(
      'key', 'signup_started',
      'label', 'بدء التسجيل (Signup Started)',
      'count', v_count_signup_started,
      'conversionFromPrev', CASE WHEN v_count_engaged > 0 THEN ROUND((v_count_signup_started::numeric / v_count_engaged::numeric) * 100, 1) ELSE 0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_signup_started::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'definition', 'زائر فتح صفحة إنشاء الحساب /auth/register أو نقر على زر التسجيل'
    ),
    jsonb_build_object(
      'key', 'registered_student',
      'label', 'تلميذ مسجل (Registered Student)',
      'count', v_count_registered,
      'conversionFromPrev', CASE WHEN v_count_signup_started > 0 THEN ROUND((v_count_registered::numeric / v_count_signup_started::numeric) * 100, 1) ELSE 0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_registered::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'definition', 'حساب حقيقي تم إنشاؤه وتوثيقه في جدول student_profiles'
    ),
    jsonb_build_object(
      'key', 'activated_student',
      'label', 'تلميذ مفعّل (Activated Student)',
      'count', v_count_activated,
      'conversionFromPrev', CASE WHEN v_count_registered > 0 THEN ROUND((v_count_activated::numeric / v_count_registered::numeric) * 100, 1) ELSE 0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_activated::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'definition', 'تلميذ أكمل تحديد الشعبة والملف الأكاديمي وجاهز للدراسة'
    ),
    jsonb_build_object(
      'key', 'trial_started',
      'label', 'بدء التجربة (Trial Started)',
      'count', v_count_trial,
      'conversionFromPrev', CASE WHEN v_count_activated > 0 THEN ROUND((v_count_trial::numeric / v_count_activated::numeric) * 100, 1) ELSE 0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_trial::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'definition', 'تلميذ حصل على فترة تجربة نشطة للوصول إلى الدروس والتمارين'
    ),
    jsonb_build_object(
      'key', 'payment_submitted',
      'label', 'تقديم طلب دفع (Payment Submitted)',
      'count', v_count_payment_submitted,
      'conversionFromPrev', CASE WHEN v_count_trial > 0 THEN ROUND((v_count_payment_submitted::numeric / v_count_trial::numeric) * 100, 1) ELSE 0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_payment_submitted::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'definition', 'تلميذ أرسل وصل تحويل بريدي (CCP/BaridiMob) أو طلب دفع عند الاستلام'
    ),
    jsonb_build_object(
      'key', 'paid_student',
      'label', 'طالب مدفوع (Paid Student)',
      'count', v_count_paid,
      'conversionFromPrev', CASE WHEN v_count_payment_submitted > 0 THEN ROUND((v_count_paid::numeric / v_count_payment_submitted::numeric) * 100, 1) ELSE 0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_paid::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'definition', 'اشتراك مؤكد ومدفوع تم اعتماده من إدارة العمليات'
    )
  );

  -- 11. Headline Conversion Ratios
  v_ratios := jsonb_build_object(
    'visitorToRegistration', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_registered::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0.0 END,
    'registrationToActivation', CASE WHEN v_count_registered > 0 THEN ROUND((v_count_activated::numeric / v_count_registered::numeric) * 100, 1) ELSE 0.0 END,
    'activationToTrial', CASE WHEN v_count_activated > 0 THEN ROUND((v_count_trial::numeric / v_count_activated::numeric) * 100, 1) ELSE 0.0 END,
    'trialToPaid', CASE WHEN v_count_trial > 0 THEN ROUND((v_count_paid::numeric / v_count_trial::numeric) * 100, 1) ELSE 0.0 END,
    'overallConversion', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_paid::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0.0 END
  );

  -- 12. Attribution Completeness Warning Analysis
  SELECT count(*) INTO v_attributed_registrations
  FROM public.student_profiles sp
  JOIN public.analytics_visitors v ON v.user_id = sp.id
  WHERE sp.created_at >= p_start_date AND sp.created_at <= p_end_date
    AND v.first_channel IS NOT NULL AND v.first_channel != '';

  v_unattributed_registrations := GREATEST(0, v_count_registered - v_attributed_registrations);
  IF v_count_registered > 0 THEN
    v_unattributed_percentage := ROUND((v_unattributed_registrations::numeric / v_count_registered::numeric) * 100, 1);
  ELSE
    v_unattributed_percentage := 0.0;
  END IF;

  IF v_unattributed_percentage <= 20.0 THEN
    v_attribution_status := 'REAL';
  ELSIF v_unattributed_percentage < 100.0 THEN
    v_attribution_status := 'PARTIAL';
  ELSE
    v_attribution_status := 'UNAVAILABLE';
  END IF;

  -- 13. Acquisition Breakdown by Standard Channels:
  -- Meta, Google, TikTok, Telegram, Organic, Direct, Referral, Unknown
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'source', sub.canonical_source,
      'visitors', sub.visitor_count,
      'registrations', sub.reg_count,
      'trials', sub.trial_count,
      'paidStudents', sub.paid_count,
      'revenue', sub.rev_amount
    ) ORDER BY sub.visitor_count DESC
  ), '[]'::jsonb) INTO v_sources
  FROM (
    SELECT 
      CASE 
        WHEN lower(COALESCE(v.first_channel, v.first_utm_source, '')) IN ('facebook', 'instagram', 'meta', 'ig', 'fb', 'paid_social') THEN 'Meta'
        WHEN lower(COALESCE(v.first_channel, v.first_utm_source, '')) IN ('google', 'google_ads', 'paid_search') THEN 'Google'
        WHEN lower(COALESCE(v.first_channel, v.first_utm_source, '')) IN ('tiktok', 'tt') THEN 'TikTok'
        WHEN lower(COALESCE(v.first_channel, v.first_utm_source, '')) IN ('telegram', 'tg') THEN 'Telegram'
        WHEN lower(COALESCE(v.first_channel, v.first_utm_source, '')) IN ('organic', 'organic_search', 'search') THEN 'Organic'
        WHEN lower(COALESCE(v.first_channel, v.first_utm_source, '')) IN ('direct', '') OR v.first_channel IS NULL THEN 'Direct'
        WHEN lower(COALESCE(v.first_channel, v.first_utm_source, '')) IN ('referral') THEN 'Referral'
        ELSE 'Unknown'
      END AS canonical_source,
      count(DISTINCT v.visitor_id) AS visitor_count,
      count(DISTINCT sp.id) AS reg_count,
      count(DISTINCT CASE WHEN sp.access_status = 'TRIAL' OR sp.trial_started_at IS NOT NULL THEN sp.id ELSE NULL END) AS trial_count,
      count(DISTINCT CASE WHEN sp.access_status = 'PAID' THEN sp.id ELSE NULL END) AS paid_count,
      COALESCE(sum(po.amount), 0.00) AS rev_amount
    FROM public.analytics_visitors v
    LEFT JOIN public.student_profiles sp ON sp.id = v.user_id AND sp.created_at >= p_start_date AND sp.created_at <= p_end_date
    LEFT JOIN public.payment_orders po ON po.user_id = sp.id AND po.status = 'APPROVED'
    WHERE v.first_seen_at >= p_start_date AND v.first_seen_at <= p_end_date
    GROUP BY canonical_source
  ) sub;

  -- 14. Campaign-Level Breakdown (Where UTM Data Exists)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'campaign', sub.first_utm_campaign,
      'source', sub.first_utm_source,
      'visitors', sub.visitor_count,
      'registrations', sub.reg_count,
      'trial', sub.trial_count,
      'paid', sub.paid_count,
      'revenue', sub.rev_amount
    ) ORDER BY sub.visitor_count DESC
  ), '[]'::jsonb) INTO v_campaigns
  FROM (
    SELECT 
      v.first_utm_campaign,
      COALESCE(v.first_utm_source, 'unknown') AS first_utm_source,
      count(DISTINCT v.visitor_id) AS visitor_count,
      count(DISTINCT sp.id) AS reg_count,
      count(DISTINCT CASE WHEN sp.access_status = 'TRIAL' OR sp.trial_started_at IS NOT NULL THEN sp.id ELSE NULL END) AS trial_count,
      count(DISTINCT CASE WHEN sp.access_status = 'PAID' THEN sp.id ELSE NULL END) AS paid_count,
      COALESCE(sum(po.amount), 0.00) AS rev_amount
    FROM public.analytics_visitors v
    LEFT JOIN public.student_profiles sp ON sp.id = v.user_id AND sp.created_at >= p_start_date AND sp.created_at <= p_end_date
    LEFT JOIN public.payment_orders po ON po.user_id = sp.id AND po.status = 'APPROVED'
    WHERE v.first_seen_at >= p_start_date AND v.first_seen_at <= p_end_date
      AND v.first_utm_campaign IS NOT NULL AND v.first_utm_campaign != ''
    GROUP BY v.first_utm_campaign, COALESCE(v.first_utm_source, 'unknown')
    LIMIT 20
  ) sub;

  -- 15. Construct Output Payload
  v_result := jsonb_build_object(
    'stages', v_stages,
    'ratios', v_ratios,
    'sources', v_sources,
    'campaigns', v_campaigns,
    'attributionIntegrity', jsonb_build_object(
      'status', v_attribution_status,
      'attributedRegistrations', v_attributed_registrations,
      'unattributedRegistrations', v_unattributed_registrations,
      'unattributedPercentage', v_unattributed_percentage,
      'warningMessage', CASE 
        WHEN v_unattributed_percentage > 0 
        THEN 'بيانات الإسناد غير متوفرة لـ ' || v_unattributed_percentage || '% من المسجلين (Attribution unavailable for ' || v_unattributed_percentage || '% of registrations).'
        ELSE 'إسناد متكامل 100% لكافة التسجيلات عبر الهوية الأولى'
      END
    ),
    'startDate', p_start_date,
    'endDate', p_end_date,
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_conversion_funnel FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ops_get_conversion_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION public.ops_get_conversion_funnel TO service_role;
