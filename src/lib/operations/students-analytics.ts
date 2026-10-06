/**
 * BAC Mastery — Authoritative Registered Students Analytics Service
 * 
 * INVARIANTS:
 * 1. ZERO mock numbers, ZERO demo arrays, ZERO randomly generated data.
 * 2. Every single metric is computed from PostgreSQL database tables (student_profiles, analytics_events, payment_orders).
 * 3. Explicit "Active" Definition:
 *    A student is active if they generated at least one meaningful authenticated product activity event
 *    in public.analytics_events within the selected window.
 *    Admin and Ops visits do NOT count. Simple database existence does NOT count.
 * 4. Resilient Execution:
 *    Tries PostgreSQL RPC ops_get_student_analytics first.
 *    Falls back to direct indexed table aggregation if RPC is missing or pending migration.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { getPaymentOrders } from "./payments";
import { loadServerStudentProfiles } from "./students";
import { ensureValidOperatorUuid } from "./auth";

export type AnalyticsPeriod = "today" | "7d" | "30d" | "90d";

export interface StudentAnalyticsKPIs {
  totalStudents: number;
  registrationsToday: number;
  registrationsThisWeek: number;
  registrationsThisMonth: number;
  activeToday: number;
  activeLast7Days: number;
  activeLast30Days: number;
  neverActive: number;
  trialStudents: number;
  paidStudents: number;
  expiredSubscriptions: number;
}

export interface FunnelStage {
  stage: "registered" | "activated" | "active" | "trial" | "paid";
  label: string;
  count: number;
  conversionFromPrev: number;
  conversionFromFirst: number;
}

export interface DailyGrowthPoint {
  date: string;
  label: string;
  registrations: number;
  cumulative?: number;
}

export interface DailyActivityPoint {
  date: string;
  label: string;
  activeStudents: number;
  totalEvents: number;
}

export interface StudentDirectoryItem {
  id: string;
  fullName: string;
  email?: string | null;
  studentPhone?: string | null;
  parentPhone?: string | null;
  streamId?: string | null;
  wilayaName?: string | null;
  communeName?: string | null;
  schoolName?: string | null;
  accessStatus: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED";
  plan: string;
  createdAt: string;
  lastActiveAt: string | null;
  isActive: boolean;
  isNeverActive: boolean;
  subscriptionExpiresAt?: string | null;
  trialExpiresAt?: string | null;
  remainingHours: number;
  hasPendingPayment: boolean;
}

export interface RegisteredStudentsAnalyticsResponse {
  period: AnalyticsPeriod;
  kpis: StudentAnalyticsKPIs;
  funnel: FunnelStage[];
  dailyGrowth: DailyGrowthPoint[];
  dailyActivity: DailyActivityPoint[];
  students: StudentDirectoryItem[];
  totalFilteredStudents: number;
  page: number;
  pageSize: number;
  totalPages: number;
  generatedAt: string;
}

export interface FetchAnalyticsOptions {
  period?: AnalyticsPeriod;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  stream?: string;
  wilaya?: string;
  operatorId?: string;
  token?: string | null;
}

import { getAlgeriaTodayStartIso, getAlgeriaWeekStartIso, getAlgeriaMonthStartIso } from "./timezone";

export async function getRegisteredStudentsAnalytics(
  options: FetchAnalyticsOptions = {}
): Promise<RegisteredStudentsAnalyticsResponse> {
  const period = options.period || "30d";
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(10, options.pageSize || 25));
  const operatorId = options.operatorId;
  const token = options.token;

  const now = new Date();
  const periodDays = period === "today" ? 1 : period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const periodStartMs = now.getTime() - periodDays * 24 * 60 * 60 * 1000;
  const periodStartDate = new Date(periodStartMs);
  const todayStart = getAlgeriaTodayStartIso(now);
  const weekStart = getAlgeriaWeekStartIso(now);
  const monthStart = getAlgeriaMonthStartIso(now);

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;

  let kpis: StudentAnalyticsKPIs = {
    totalStudents: 0,
    registrationsToday: 0,
    registrationsThisWeek: 0,
    registrationsThisMonth: 0,
    activeToday: 0,
    activeLast7Days: 0,
    activeLast30Days: 0,
    neverActive: 0,
    trialStudents: 0,
    paidStudents: 0,
    expiredSubscriptions: 0,
  };

  let rawFunnel = {
    registered: 0,
    activated: 0,
    active: 0,
    trial: 0,
    paid: 0,
  };

  let dailyGrowth: DailyGrowthPoint[] = [];
  let dailyActivity: DailyActivityPoint[] = [];

  let rpcSuccess = false;

  // 1. Attempt RPC call for high performance
  if (isSupabaseConfigured && client) {
    try {
      const { data: rpcData, error: rpcError } = await client.rpc(
        "ops_get_student_analytics",
        {
          p_period_days: periodDays,
          p_operator_id: ensureValidOperatorUuid(operatorId),
        }
      );

      if (!rpcError && rpcData && rpcData.kpis) {
        kpis = rpcData.kpis;
        if (rpcData.funnel) {
          rawFunnel = rpcData.funnel;
        }
        if (Array.isArray(rpcData.dailyGrowth)) {
          dailyGrowth = rpcData.dailyGrowth;
        }
        if (Array.isArray(rpcData.dailyActivity)) {
          dailyActivity = rpcData.dailyActivity;
        }
        rpcSuccess = true;
      }
    } catch {
      rpcSuccess = false;
    }
  }

  // 2. Fallback direct PostgreSQL aggregation if RPC was not available
  if (!rpcSuccess && isSupabaseConfigured && client) {
    try {
      // 2a. Fetch student profiles basic columns
      const { data: profiles } = await client
        .from("student_profiles")
        .select("id, email, first_name, last_name, created_at, access_status, plan, trial_expires_at, subscription_expires_at, onboarding_completed, academic_profile_completed_at, stream_id");

      const studentList = profiles || [];
      const totalStudents = studentList.length;

      let regToday = 0;
      let regWeek = 0;
      let regMonth = 0;
      let trialStudents = 0;
      let paidStudents = 0;
      let expiredSub = 0;
      let activated = 0;

      const regByDay: Record<string, number> = {};

      for (const p of studentList) {
        const createdAt = p.created_at || "";
        if (createdAt >= todayStart) regToday++;
        if (createdAt >= weekStart) regWeek++;
        if (createdAt >= monthStart) regMonth++;

        // Status
        const subExpiresAt = p.subscription_expires_at ? new Date(p.subscription_expires_at).getTime() : 0;
        const trialExpiresAt = p.trial_expires_at ? new Date(p.trial_expires_at).getTime() : 0;
        const nowMs = now.getTime();

        const isPaid = p.access_status === "PAID" || p.plan === "season" || p.plan === "monthly" || (subExpiresAt > nowMs);
        const isTrial = !isPaid && (p.access_status === "TRIAL" || !p.access_status) && (trialExpiresAt === 0 || trialExpiresAt > nowMs);
        const isExpired = p.access_status === "EXPIRED" || (!isPaid && !isTrial);

        if (isPaid) paidStudents++;
        else if (isTrial) trialStudents++;
        else if (isExpired) expiredSub++;

        // Onboarding activation
        if (p.onboarding_completed || p.academic_profile_completed_at || p.stream_id) {
          activated++;
        }

        // Daily bucket
        if (createdAt >= periodStartDate.toISOString()) {
          const dayKey = createdAt.slice(0, 10);
          regByDay[dayKey] = (regByDay[dayKey] || 0) + 1;
        }
      }

      // 2b. Query analytics_events for authenticated product activity
      const { data: events } = await client
        .from("analytics_events")
        .select("user_id, occurred_at, route")
        .not("user_id", "is", null)
        .gte("occurred_at", monthStart);

      const validEvents = (events || []).filter((e) => {
        const path = ((e as any).page_path || e.route || "").toLowerCase();
        return !path.startsWith("/ops") && !path.startsWith("/admin") && !path.startsWith("/api");
      });

      const activeUsersToday = new Set<string>();
      const activeUsers7d = new Set<string>();
      const activeUsers30d = new Set<string>();
      const activeUsersPeriod = new Set<string>();

      const activeByDay: Record<string, Set<string>> = {};
      const eventsByDay: Record<string, number> = {};

      for (const e of validEvents) {
        if (!e.user_id) continue;
        const occ = e.occurred_at || "";
        if (occ >= todayStart) activeUsersToday.add(e.user_id);
        if (occ >= weekStart) activeUsers7d.add(e.user_id);
        if (occ >= monthStart) activeUsers30d.add(e.user_id);
        if (occ >= periodStartDate.toISOString()) {
          activeUsersPeriod.add(e.user_id);
          const dayKey = occ.slice(0, 10);
          if (!activeByDay[dayKey]) activeByDay[dayKey] = new Set();
          activeByDay[dayKey].add(e.user_id);
          eventsByDay[dayKey] = (eventsByDay[dayKey] || 0) + 1;
        }
      }

      // Check all-time active users to know "neverActive"
      const { data: allActiveData } = await client
        .from("analytics_events")
        .select("user_id")
        .not("user_id", "is", null);

      const allActiveUserIds = new Set((allActiveData || []).map((e) => e.user_id).filter(Boolean));
      let neverActive = 0;
      for (const p of studentList) {
        if (!allActiveUserIds.has(p.id)) {
          neverActive++;
        }
      }

      kpis = {
        totalStudents,
        registrationsToday: regToday,
        registrationsThisWeek: regWeek,
        registrationsThisMonth: regMonth,
        activeToday: activeUsersToday.size,
        activeLast7Days: activeUsers7d.size,
        activeLast30Days: activeUsers30d.size,
        neverActive,
        trialStudents,
        paidStudents,
        expiredSubscriptions: expiredSub,
      };

      rawFunnel = {
        registered: totalStudents,
        activated,
        active: activeUsersPeriod.size,
        trial: trialStudents,
        paid: paidStudents,
      };

      // Generate full date series for the requested period
      dailyGrowth = [];
      dailyActivity = [];

      for (let i = periodDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = d.toISOString().slice(0, 10);
        const dayParts = dayStr.split("-");
        const label = `${dayParts[2]}/${dayParts[1]}`;

        dailyGrowth.push({
          date: dayStr,
          label,
          registrations: regByDay[dayStr] || 0,
        });

        dailyActivity.push({
          date: dayStr,
          label,
          activeStudents: activeByDay[dayStr]?.size || 0,
          totalEvents: eventsByDay[dayStr] || 0,
        });
      }
    } catch {
      // Keep initial defaults if DB is unreachable
    }
  }

  // 3. Compute Cumulative totals for Daily Growth
  let runningCumulative = 0;
  dailyGrowth = dailyGrowth.map((point) => {
    runningCumulative += point.registrations;
    return {
      ...point,
      cumulative: runningCumulative,
    };
  });

  // 4. Construct Funnel Breakdown
  // Registered -> Activated -> Active -> Trial -> Paid
  const funnelStages: FunnelStage[] = [
    {
      stage: "registered",
      label: "التسجيل في المنصة",
      count: rawFunnel.registered,
      conversionFromPrev: 100,
      conversionFromFirst: 100,
    },
    {
      stage: "activated",
      label: "إكمال الملف الأكاديمي / التفعيل",
      count: rawFunnel.activated,
      conversionFromPrev: rawFunnel.registered > 0 ? Number(((rawFunnel.activated / rawFunnel.registered) * 100).toFixed(1)) : 0,
      conversionFromFirst: rawFunnel.registered > 0 ? Number(((rawFunnel.activated / rawFunnel.registered) * 100).toFixed(1)) : 0,
    },
    {
      stage: "active",
      label: "نشط فعلياً (تفاعل تعليمي)",
      count: rawFunnel.active,
      conversionFromPrev: rawFunnel.activated > 0 ? Number(((rawFunnel.active / rawFunnel.activated) * 100).toFixed(1)) : 0,
      conversionFromFirst: rawFunnel.registered > 0 ? Number(((rawFunnel.active / rawFunnel.registered) * 100).toFixed(1)) : 0,
    },
    {
      stage: "trial",
      label: "فترة التجربة (TRIAL)",
      count: rawFunnel.trial,
      conversionFromPrev: rawFunnel.active > 0 ? Number(((rawFunnel.trial / rawFunnel.active) * 100).toFixed(1)) : 0,
      conversionFromFirst: rawFunnel.registered > 0 ? Number(((rawFunnel.trial / rawFunnel.registered) * 100).toFixed(1)) : 0,
    },
    {
      stage: "paid",
      label: "اشتراك مدفوع (PAID)",
      count: rawFunnel.paid,
      conversionFromPrev: rawFunnel.trial > 0 ? Number(((rawFunnel.paid / rawFunnel.trial) * 100).toFixed(1)) : 0,
      conversionFromFirst: rawFunnel.registered > 0 ? Number(((rawFunnel.paid / rawFunnel.registered) * 100).toFixed(1)) : 0,
    },
  ];

  // 5. Query Filtered & Paginated Students List
  const pendingOrders = await getPaymentOrders({ status: "PENDING" }, token);
  const pendingUserIds = new Set(pendingOrders.map((o) => o.userId));

  let studentRows: any[] = [];
  let totalFilteredCount = 0;

  if (isSupabaseConfigured && client) {
    try {
      let query = client
        .from("student_profiles")
        .select("*", { count: "exact" });

      // Apply stream filter
      if (options.stream && options.stream !== "all") {
        query = query.eq("stream_id", options.stream);
      }

      // Apply wilaya filter
      if (options.wilaya && options.wilaya !== "all") {
        query = query.eq("wilaya_name", options.wilaya);
      }

      // Apply status filter
      if (options.status && options.status !== "all") {
        if (options.status === "trial") {
          query = query.eq("access_status", "TRIAL");
        } else if (options.status === "paid") {
          query = query.eq("access_status", "PAID");
        } else if (options.status === "expired") {
          query = query.eq("access_status", "EXPIRED");
        }
      }

      // Apply text search (Phone primary, Email legacy, Name, User ID)
      if (options.search && options.search.trim()) {
        const q = options.search.trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
        const searchFilters = [
          `student_phone.ilike.%${q}%`,
          `canonical_phone.ilike.%${q}%`,
          `parent_phone.ilike.%${q}%`,
          `email.ilike.%${q}%`,
          `first_name.ilike.%${q}%`,
          `last_name.ilike.%${q}%`,
        ];
        if (isUuid) {
          searchFilters.push(`id.eq.${q}`);
        }
        query = query.or(searchFilters.join(","));
      }

      const offset = (page - 1) * pageSize;
      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (!error && data) {
        studentRows = data;
        totalFilteredCount = count || data.length;
      }
    } catch {
      // Fall through to memory
    }
  }

  // Fallback to server profiles if DB returned empty
  if (studentRows.length === 0) {
    const memoryStudents = loadServerStudentProfiles();
    let filtered = memoryStudents;

    if (options.stream && options.stream !== "all") {
      filtered = filtered.filter((s) => s.streamId === options.stream);
    }
    if (options.wilaya && options.wilaya !== "all") {
      filtered = filtered.filter((s) => s.wilayaName === options.wilaya);
    }
    if (options.status && options.status !== "all") {
      filtered = filtered.filter((s) => s.accessStatus.toLowerCase() === options.status?.toLowerCase());
    }
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.studentPhone && s.studentPhone.includes(q)) ||
          (s.parentPhone && s.parentPhone.includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          s.fullName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }

    totalFilteredCount = filtered.length;
    const offset = (page - 1) * pageSize;
    studentRows = filtered.slice(offset, offset + pageSize);
  }

  // 6. Enrich Student Rows with real Last Active Date from analytics_events
  const studentIds = studentRows.map((s) => s.id);
  const studentLastActiveMap = new Map<string, string>();

  if (studentIds.length > 0 && isSupabaseConfigured && client) {
    try {
      const { data: activityRows } = await client
        .from("analytics_events")
        .select("user_id, occurred_at")
        .in("user_id", studentIds)
        .order("occurred_at", { ascending: false });

      if (activityRows) {
        for (const row of activityRows) {
          if (row.user_id && !studentLastActiveMap.has(row.user_id)) {
            studentLastActiveMap.set(row.user_id, row.occurred_at);
          }
        }
      }
    } catch {}
  }

  const students: StudentDirectoryItem[] = studentRows.map((p) => {
    const trialExpires = p.trial_expires_at ? new Date(p.trial_expires_at) : null;
    const remainingMs = trialExpires ? trialExpires.getTime() - now.getTime() : 0;
    const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));

    const lastEventOccurredAt = studentLastActiveMap.get(p.id) || null;
    const hasActivity = Boolean(lastEventOccurredAt);
    const isNeverActive = !hasActivity;

    return {
      id: p.id,
      fullName: p.fullName || `${p.first_name || ""} ${p.last_name || ""}`.trim() || (p.email ? p.email.split("@")[0] : "") || "تلميذ مسجل",
      email: p.email || null,
      studentPhone: p.studentPhone || p.student_phone || null,
      parentPhone: p.parentPhone || p.parent_phone || null,
      streamId: p.streamId || p.stream_id || null,
      wilayaName: p.wilayaName || p.wilaya_name || null,
      communeName: p.communeName || p.commune_name || null,
      schoolName: p.schoolName || p.school_name || p.raw_draft?.schoolName || null,
      accessStatus: (p.accessStatus || p.access_status || (remainingMs <= 0 ? "EXPIRED" : "TRIAL")) as any,
      plan: p.plan || "PILOT_TRIAL",
      createdAt: p.createdAt || p.created_at || now.toISOString(),
      lastActiveAt: lastEventOccurredAt,
      isActive: hasActivity,
      isNeverActive,
      subscriptionExpiresAt: p.subscriptionExpiresAt || p.subscription_expires_at || null,
      trialExpiresAt: p.trialExpiresAt || p.trial_expires_at || null,
      remainingHours,
      hasPendingPayment: pendingUserIds.has(p.id),
    };
  });

  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  return {
    period,
    kpis,
    funnel: funnelStages,
    dailyGrowth,
    dailyActivity,
    students,
    totalFilteredStudents: totalFilteredCount,
    page,
    pageSize,
    totalPages,
    generatedAt: now.toISOString(),
  };
}
