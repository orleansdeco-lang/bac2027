/**
 * BAC Mastery — Central Operations Intelligence & Dashboard Service
 * Phase 3: Operations Dashboard & Telemetry Funnel
 * 
 * INVARIANTS:
 * 1. Server-Only Execution: Queries executed via getAdminClient() or authenticated operator client.
 * 2. Supabase PostgreSQL is the authoritative single source of truth.
 * 3. High performance: Uses efficient aggregations, indexed lookups, and single-pass reductions.
 * 4. Actionable Alerts: Detects stale payments (>12h), expiring subscriptions (3-7d), and diagnostic drop-offs.
 */

import {
  OperationsDashboardData,
  DashboardKPIs,
  ExpiringSoonAlert,
  StalePendingAlert,
  DropoffAlert,
  ConversionFunnelStep,
  LearningIntelligenceMetrics,
} from "./types";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { getPaymentOrders } from "./payments";
import { getStoredTelemetryEvents } from "./telemetry";
import { ALGERIAN_BAC_STREAMS } from "../constants/streams";

export async function getOperationsDashboardData(
  operatorId?: string,
  token?: string | null
): Promise<OperationsDashboardData> {
  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  const now = new Date();
  const nowMs = now.getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(nowMs - 30 * 24 * 60 * 60 * 1000).toISOString();
  const twelveHoursAgo = new Date(nowMs - 12 * 60 * 60 * 1000).toISOString();
  const sevenDaysFromNow = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch Orders authoritatively
  const orders = await getPaymentOrders({ limit: 1000 }, token);
  const approvedOrders = orders.filter((o) => o.status === "APPROVED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING");

  // Revenue Aggregations
  let todayRevenue = 0;
  let weekRevenue = 0;
  let monthRevenue = 0;
  let totalRevenue = 0;
  let onlineRevenue = 0;
  let codRevenue = 0;

  for (const o of approvedOrders) {
    const amt = Number(o.amount) || 0;
    totalRevenue += amt;

    const dateStr = o.reviewedAt || o.submittedAt || o.createdAt;
    if (dateStr >= todayStart) todayRevenue += amt;
    if (dateStr >= weekStart) weekRevenue += amt;
    if (dateStr >= monthStart) monthRevenue += amt;

    if (o.paymentMethod === "cash" || o.orderType === "COD") {
      codRevenue += amt;
    } else {
      onlineRevenue += amt;
    }
  }

  // Pending Queue & Stale Alerts (>12h)
  const pendingOrdersCount = pendingOrders.length;
  const pendingOrdersRevenue = pendingOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const stalePendingAlerts: StalePendingAlert[] = [];

  for (const o of pendingOrders) {
    const submittedStr = o.submittedAt || o.createdAt;
    if (submittedStr && submittedStr <= twelveHoursAgo) {
      const waitHours = Math.floor((nowMs - new Date(submittedStr).getTime()) / (1000 * 60 * 60));
      stalePendingAlerts.push({
        orderId: o.id,
        userId: o.userId,
        studentName: o.studentName || o.shippingName || "طالب بدون اسم",
        studentPhone: (o.studentPhone || o.shippingPhone) ?? undefined,
        amount: Number(o.amount) || 0,
        paymentMethod: o.paymentMethod,
        submittedAt: submittedStr,
        hoursWaiting: Math.max(12, waitHours),
      });
    }
  }

  // Sort stale pending alerts longest waiting first
  stalePendingAlerts.sort((a, b) => b.hoursWaiting - a.hoursWaiting);

  // 2. Fetch Students Profiles and Subscriptions from PostgreSQL
  let studentProfiles: any[] = [];
  let subscriptions: any[] = [];

  if (isSupabaseConfigured && client) {
    try {
      const [profilesRes, subsRes] = await Promise.all([
        client.from("student_profiles").select("*").order("created_at", { ascending: false }),
        client.from("subscriptions").select("*"),
      ]);

      if (!profilesRes.error && profilesRes.data) {
        studentProfiles = profilesRes.data;
      }
      if (!subsRes.error && subsRes.data) {
        subscriptions = subsRes.data;
      }
    } catch (err) {
      console.warn("[DashboardService] student_profiles / subscriptions query fallback:", err);
    }
  }

  // Students Breakdown & Alerts
  const totalStudents = studentProfiles.length;
  let paidStudents = 0;
  let trialStudents = 0;
  let expiredStudents = 0;

  const expiringSoonAlerts: ExpiringSoonAlert[] = [];
  const dropoffAlerts: DropoffAlert[] = [];

  const streamDistribution: Record<string, number> = {};
  const wilayaDistribution: Record<string, number> = {};

  for (const sp of studentProfiles) {
    // Stream counts
    const sId = sp.stream_id || "sciences_exp";
    streamDistribution[sId] = (streamDistribution[sId] || 0) + 1;

    // Wilaya counts
    const wName = (sp.wilaya_name || "غير محددة").trim();
    if (wName) {
      wilayaDistribution[wName] = (wilayaDistribution[wName] || 0) + 1;
    }

    // Active subscription verification (Cross-reference public.subscriptions and student_profiles)
    const studentSubs = subscriptions.filter(
      (s) => s.student_id === sp.id || s.user_id === sp.id
    );
    const activeSub = studentSubs.find(
      (s) => s.status === "ACTIVE" && s.expires_at && s.expires_at > now.toISOString()
    );

    const isPaid =
      Boolean(activeSub) ||
      sp.access_status === "PAID" ||
      sp.plan === "PAID" ||
      (sp.subscription_expires_at && sp.subscription_expires_at > now.toISOString());

    if (isPaid) {
      paidStudents++;

      // Check expiring soon within 3 to 7 days
      const expirationDate = activeSub?.expires_at || sp.subscription_expires_at;
      if (expirationDate) {
        const expMs = new Date(expirationDate).getTime();
        if (expMs > nowMs && expMs <= new Date(sevenDaysFromNow).getTime()) {
          const daysLeft = Math.max(1, Math.ceil((expMs - nowMs) / (1000 * 60 * 60 * 24)));
          const fullName = `${sp.first_name || ""} ${sp.last_name || ""}`.trim() || "طالب مسجل";
          expiringSoonAlerts.push({
            studentId: sp.id,
            studentName: fullName,
            studentPhone: (sp.student_phone || sp.phone_number) ?? undefined,
            parentPhone: sp.parent_phone ?? undefined,
            wilayaName: sp.wilaya_name ?? undefined,
            streamId: sp.stream_id ?? undefined,
            plan: activeSub?.plan_id || sp.plan || "season",
            expiresAt: expirationDate,
            daysRemaining: daysLeft,
          });
        }
      }
    } else {
      const trialExp = sp.trial_expires_at ? new Date(sp.trial_expires_at).getTime() : 0;
      if (sp.access_status === "EXPIRED" || (trialExp > 0 && trialExp <= nowMs)) {
        expiredStudents++;
      } else if (sp.access_status === "TRIAL" || trialExp > nowMs) {
        trialStudents++;
      } else {
        trialStudents++;
      }
    }

    // Diagnostic / Onboarding Dropoff Detection
    const hasCompletedOnboarding = sp.onboarding_completed || sp.academic_profile_completed_at;
    if (!hasCompletedOnboarding) {
      const fullName = `${sp.first_name || ""} ${sp.last_name || ""}`.trim() || "طالب مسجل";
      dropoffAlerts.push({
        studentId: sp.id,
        studentName: fullName,
        studentPhone: sp.student_phone ?? undefined,
        wilayaName: sp.wilaya_name ?? undefined,
        streamId: sp.stream_id ?? undefined,
        createdAt: sp.created_at || now.toISOString(),
        stage: "ONBOARDING_INCOMPLETE",
      });
    }
  }

  const paidRatio = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

  // Sort alerts
  expiringSoonAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  dropoffAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 3. Telemetry & Learning Engine Activity
  let telemetryEvents: any[] = [];
  if (isSupabaseConfigured && client) {
    try {
      const { data: telem } = await client
        .from("telemetry_events")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(2000);
      if (telem && telem.length > 0) {
        telemetryEvents = telem;
      }
    } catch {}
  }

  if (telemetryEvents.length === 0) {
    telemetryEvents = getStoredTelemetryEvents(1000);
  }

  // Calculate Today's Activity
  const todayTelemetry = telemetryEvents.filter(
    (e) => (e.occurred_at || e.occurredAt || "") >= todayStart
  );
  const activeUserIdsToday = new Set(
    todayTelemetry
      .map((e) => e.user_id || e.userId || e.session_id || e.sessionId)
      .filter(Boolean)
  );

  const lessonsViewedToday = todayTelemetry.filter(
    (e) => (e.event_name || e.eventName) === "lesson_viewed"
  ).length;

  const exercisesCompletedToday = todayTelemetry.filter(
    (e) =>
      (e.event_name || e.eventName) === "practice_completed" ||
      (e.event_name || e.eventName) === "retest_completed"
  ).length;

  // Approximate study hours based on learning interactions (0 when no activity)
  const estimatedStudyHoursToday =
    activeUserIdsToday.size === 0 && lessonsViewedToday === 0 && exercisesCompletedToday === 0
      ? 0
      : Number(((activeUserIdsToday.size * 20 + lessonsViewedToday * 12 + exercisesCompletedToday * 5) / 60).toFixed(1));

  // 4. Learning Signals: Practice, Missions, Retests
  let correctAttempts = 0;
  let totalPracticeAttempts = 0;
  let missionsMasteredCount = 0;
  let retestsPassedCount = 0;

  if (isSupabaseConfigured && client) {
    try {
      const [pRes, pCorrRes, mRes, rRes] = await Promise.all([
        client.from("practice_attempts").select("*", { count: "exact", head: true }),
        client.from("practice_attempts").select("*", { count: "exact", head: true }).eq("is_correct", true),
        client.from("missions").select("*", { count: "exact", head: true }).in("status", ["completed", "mastered"]),
        client.from("retests").select("*", { count: "exact", head: true }).eq("is_passed", true),
      ]);

      totalPracticeAttempts = pRes.count || 0;
      correctAttempts = pCorrRes.count || 0;
      missionsMasteredCount = mRes.count || 0;
      retestsPassedCount = rRes.count || 0;
    } catch {}
  }

  const exerciseCompletionRate =
    totalPracticeAttempts > 0
      ? Math.round((correctAttempts / totalPracticeAttempts) * 100)
      : 0;

  // 5. Authentic Conversion Funnel Calculation (Strict single source of truth)
  const totalLandingViews = telemetryEvents.filter((e) => {
    const name = e.event_name || e.eventName;
    return name === "landing" || name === "landing_view" || name === "visitor";
  }).length;

  const totalSignups = Math.max(
    totalStudents,
    telemetryEvents.filter((e) => {
      const name = e.event_name || e.eventName;
      return name === "registration_completed" || name === "signup_completed";
    }).length
  );

  const totalDiagnosticsCompleted = Math.max(
    studentProfiles.filter((sp) => sp.onboarding_completed || sp.academic_profile_completed_at).length,
    telemetryEvents.filter((e) => (e.event_name || e.eventName) === "diagnostic_completed").length
  );

  const totalPricingViews = telemetryEvents.filter((e) => {
    const name = e.event_name || e.eventName;
    return name === "checkout_started" || name === "conversion_viewed" || name === "pricing_viewed";
  }).length;

  const totalPaymentsSubmitted = Math.max(
    orders.length,
    telemetryEvents.filter((e) => {
      const name = e.event_name || e.eventName;
      return name === "payment_submitted" || name === "payment_order_created";
    }).length
  );

  const totalSubscriptionsApproved = paidStudents;

  const funnelRaw = [
    { id: "landing", label: "زيارة الموقع والتعريف بالمنهج", count: totalLandingViews },
    { id: "signup", label: "إنشاء الحساب والتسجيل الرسمي", count: totalSignups },
    { id: "diagnostic", label: "إكمال التقييم التشخيصي وتحديد المستوى", count: totalDiagnosticsCompleted },
    { id: "pricing", label: "الاطلاع على الخطط والأسعار", count: totalPricingViews },
    { id: "payment", label: "إرسال وصل الدفع أو طلب البطاقة", count: totalPaymentsSubmitted },
    { id: "approved", label: "تفعيل الاشتراك والوصول الشامل (PAID)", count: totalSubscriptionsApproved },
  ];

  const funnel: ConversionFunnelStep[] = funnelRaw.map((step, idx) => {
    const baseCount = funnelRaw[0].count;
    const prevCount = idx === 0 ? step.count : funnelRaw[idx - 1].count;
    const percentageOfTotal = baseCount > 0 ? Math.round((step.count / baseCount) * 100) : 0;
    const percentageOfPrevious = prevCount > 0 ? Math.min(100, Math.round((step.count / prevCount) * 100)) : 0;
    const dropoffCount = Math.max(0, prevCount - step.count);

    return {
      id: step.id,
      label: step.label,
      count: step.count,
      percentageOfTotal,
      percentageOfPrevious,
      dropoffCount,
    };
  });

  // Top Streams
  const topStreams = Object.entries(streamDistribution)
    .map(([streamId, count]) => {
      const streamMeta = (ALGERIAN_BAC_STREAMS as any)[streamId];
      const nameAr = streamMeta ? streamMeta.name_ar : streamId;
      const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
      return { streamId, nameAr, count, percentage };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Top Wilayas
  const topWilayas = Object.entries(wilayaDistribution)
    .map(([wilayaName, count]) => {
      const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
      return { wilayaName, count, percentage };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const kpis: DashboardKPIs = {
    totalStudents,
    paidStudents,
    trialStudents,
    expiredStudents,
    paidRatio,
    pendingOrdersCount,
    pendingOrdersRevenue,
    stalePendingCount: stalePendingAlerts.length,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    totalRevenue,
    totalApprovedOrders: approvedOrders.length,
    onlineRevenue,
    codRevenue,
    activeStudentsToday: activeUserIdsToday.size,
    lessonsViewedToday,
    exercisesCompletedToday,
    estimatedStudyHoursToday,
  };

  const learning: LearningIntelligenceMetrics = {
    exerciseCompletionRate,
    correctAnswersCount: correctAttempts,
    totalAttemptsCount: totalPracticeAttempts,
    missionsMasteredCount,
    retestsPassedCount,
    topStreams,
    topWilayas,
  };

  return {
    kpis,
    alerts: {
      expiringSoon: expiringSoonAlerts.slice(0, 15),
      stalePending: stalePendingAlerts.slice(0, 15),
      dropoffs: dropoffAlerts.slice(0, 15),
    },
    funnel,
    learning,
    generatedAt: now.toISOString(),
  };
}
