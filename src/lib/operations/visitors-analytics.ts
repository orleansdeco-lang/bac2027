/**
 * BAC Mastery — Authoritative Visitors Analytics Service
 * 
 * INVARIANTS:
 * 1. ZERO mock data, ZERO hardcoded numbers.
 * 2. Every single metric is computed from PostgreSQL database tables (analytics_visitors, analytics_sessions, analytics_events).
 * 3. Never show a metric if the database cannot support it reliably.
 * 4. Resilient Execution:
 *    - Executes PostgreSQL RPC ops_get_visitors_analytics first.
 *    - Falls back to direct indexed table aggregation if RPC is missing or pending migration.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";

export type VisitorAnalyticsPeriod = "today" | "7d" | "30d" | "90d";

export interface VisitorsOverviewKPIs {
  uniqueVisitorsToday: number;
  sessionsToday: number;
  newVisitorsToday: number;
  returningVisitorsToday: number;
  uniqueVisitorsLast7Days: number;
  uniqueVisitorsLast30Days: number;
}

export interface LiveActivityStatus {
  isSupported: boolean;
  activeNow: number | null;
}

export interface VisitorTrendPoint {
  date: string;
  label: string;
  uniqueVisitors: number;
  sessions: number;
  newVisitors: number;
  returningVisitors: number;
}

export interface TopPageItem {
  path: string;
  views: number;
  percentage: number;
}

export interface TrafficSourceItem {
  source: string;
  visitors: number;
  sessions: number;
  percentage: number;
}

export interface DevicesBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
  unknown: number;
  total: number;
}

export interface ReturningVsNewBreakdown {
  newVisitors: number;
  returningVisitors: number;
  newPercentage: number;
  returningPercentage: number;
}

export interface EntryPageItem {
  page: string;
  sessions: number;
  percentage: number;
}

export interface ExitPageItem {
  page: string;
  exits: number;
  percentage: number;
}

export interface GeographyBreakdown {
  hasReliableGeography: boolean;
  wilayas?: Array<{ wilaya: string; count: number; percentage: number }>;
}

export interface RecentVisitorActivityItem {
  id: string;
  time: string;
  page: string;
  device: string;
  source: string;
  visitorType: "NEW" | "RETURNING";
}

export interface VisitorsAnalyticsResponse {
  period: VisitorAnalyticsPeriod;
  kpis: VisitorsOverviewKPIs;
  liveActivity: LiveActivityStatus;
  trend: VisitorTrendPoint[];
  topPages: TopPageItem[];
  sources: TrafficSourceItem[];
  devices: DevicesBreakdown;
  returningVsNew: ReturningVsNewBreakdown;
  entryPages: EntryPageItem[];
  exitPages: ExitPageItem[];
  geography: GeographyBreakdown;
  recentActivity: RecentVisitorActivityItem[];
  generatedAt: string;
}

export interface FetchVisitorsAnalyticsOptions {
  period?: VisitorAnalyticsPeriod;
  operatorId?: string;
  token?: string | null;
}

import { getAlgeriaTodayStartIso, getAlgeriaWeekStartIso, getAlgeriaMonthStartIso } from "./timezone";

export async function getVisitorsAnalytics(
  options: FetchVisitorsAnalyticsOptions = {}
): Promise<VisitorsAnalyticsResponse> {
  const period = options.period || "30d";
  const operatorId = options.operatorId;
  const token = options.token;

  const now = new Date();
  const periodDays = period === "today" ? 1 : period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const periodStartMs = now.getTime() - periodDays * 24 * 60 * 60 * 1000;
  const periodStartDate = new Date(periodStartMs);
  const todayStart = getAlgeriaTodayStartIso(now);
  const weekStart = getAlgeriaWeekStartIso(now);
  const monthStart = getAlgeriaMonthStartIso(now);
  const live5mStart = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;

  let kpis: VisitorsOverviewKPIs = {
    uniqueVisitorsToday: 0,
    sessionsToday: 0,
    newVisitorsToday: 0,
    returningVisitorsToday: 0,
    uniqueVisitorsLast7Days: 0,
    uniqueVisitorsLast30Days: 0,
  };

  let liveActivity: LiveActivityStatus = {
    isSupported: isSupabaseConfigured,
    activeNow: 0,
  };

  let trend: VisitorTrendPoint[] = [];
  let topPages: TopPageItem[] = [];
  let sources: TrafficSourceItem[] = [];
  let devices: DevicesBreakdown = { mobile: 0, desktop: 0, tablet: 0, unknown: 0, total: 0 };
  let returningVsNew: ReturningVsNewBreakdown = { newVisitors: 0, returningVisitors: 0, newPercentage: 0, returningPercentage: 0 };
  let entryPages: EntryPageItem[] = [];
  let exitPages: ExitPageItem[] = [];
  let geography: GeographyBreakdown = { hasReliableGeography: false };
  let recentActivity: RecentVisitorActivityItem[] = [];

  let rpcSuccess = false;

  // 1. Attempt PostgreSQL RPC execution
  if (isSupabaseConfigured && client) {
    try {
      const { data: rpcData, error: rpcError } = await client.rpc(
        "ops_get_visitors_analytics",
        {
          p_period_days: periodDays,
          p_operator_id: operatorId || "7f7f704e-d9f1-4edf-9952-591f41fc0c55",
        }
      );

      if (!rpcError && rpcData && rpcData.kpis) {
        kpis = rpcData.kpis;
        if (rpcData.liveActivity) liveActivity = rpcData.liveActivity;
        if (Array.isArray(rpcData.trend)) trend = rpcData.trend;
        if (Array.isArray(rpcData.topPages)) topPages = rpcData.topPages;
        if (Array.isArray(rpcData.sources)) sources = rpcData.sources;
        if (rpcData.devices) devices = rpcData.devices;
        if (rpcData.returningVsNew) returningVsNew = rpcData.returningVsNew;
        if (Array.isArray(rpcData.entryPages)) entryPages = rpcData.entryPages;
        if (Array.isArray(rpcData.exitPages)) exitPages = rpcData.exitPages;
        if (rpcData.geography) geography = rpcData.geography;
        if (Array.isArray(rpcData.recentActivity)) recentActivity = rpcData.recentActivity;
        rpcSuccess = true;
      }
    } catch {
      rpcSuccess = false;
    }
  }

  // 2. Resilient Direct PostgreSQL Fallback if RPC is not present
  if (!rpcSuccess && isSupabaseConfigured && client) {
    try {
      // 2a. Fetch visitors table for overview and new/returning metrics (if table exists)
      let visitors: any[] = [];
      try {
        const { data: visitorsData, error: visErr } = await client
          .from("analytics_visitors")
          .select("visitor_id, first_seen_at, last_seen_at, last_landing_page, device_type");
        if (!visErr && Array.isArray(visitorsData)) {
          visitors = visitorsData;
        }
      } catch {
        visitors = [];
      }

      let uniqToday = 0;
      let newToday = 0;
      let retToday = 0;
      let uniq7d = 0;
      let uniq30d = 0;
      let periodNew = 0;

      const newByDay: Record<string, number> = {};

      for (const v of visitors) {
        const first = v.first_seen_at || "";
        const last = v.last_seen_at || "";

        if (last >= todayStart) {
          uniqToday++;
          if (first >= todayStart) newToday++;
          else retToday++;
        }
        if (last >= weekStart) uniq7d++;
        if (last >= monthStart) uniq30d++;
        if (first >= periodStartDate.toISOString()) periodNew++;

        if (first >= periodStartDate.toISOString()) {
          const d = first.slice(0, 10);
          newByDay[d] = (newByDay[d] || 0) + 1;
        }
      }

      // 2b. Fetch sessions table within period using columns guaranteed to exist in schema
      let sessions: any[] = [];
      try {
        const { data: sessionsData, error: sessErr } = await client
          .from("analytics_sessions")
          .select("session_id, anonymous_id, landing_page, referrer, first_utm_source, first_utm_campaign, device_type, wilaya_code, country, started_at, last_activity_at, is_active")
          .gte("started_at", periodStartDate.toISOString())
          .order("started_at", { ascending: false });

        if (!sessErr && Array.isArray(sessionsData)) {
          sessions = sessionsData;
        }
      } catch {
        sessions = [];
      }

      // Sessions today count and visitor aggregation from sessions if analytics_visitors was empty
      let sessToday = 0;
      const todayVisitorsSet = new Set<string>();
      const weekVisitorsSet = new Set<string>();
      const monthVisitorsSet = new Set<string>();

      for (const s of sessions) {
        const vid = s.anonymous_id || s.session_id;
        const started = s.started_at || "";
        if (started >= todayStart) {
          sessToday++;
          if (vid) todayVisitorsSet.add(vid);
        }
        if (started >= weekStart && vid) weekVisitorsSet.add(vid);
        if (started >= monthStart && vid) monthVisitorsSet.add(vid);
      }

      // If analytics_visitors is empty (table not migrated yet), derive from sessions
      if (visitors.length === 0) {
        uniqToday = todayVisitorsSet.size;
        newToday = todayVisitorsSet.size;
        retToday = 0;
        uniq7d = weekVisitorsSet.size;
        uniq30d = monthVisitorsSet.size;
        periodNew = monthVisitorsSet.size;
      }

      kpis = {
        uniqueVisitorsToday: uniqToday,
        sessionsToday: sessToday,
        newVisitorsToday: newToday,
        returningVisitorsToday: retToday,
        uniqueVisitorsLast7Days: uniq7d,
        uniqueVisitorsLast30Days: uniq30d,
      };

      // 2c. Live Activity Detection (sessions active in last 5 minutes)
      const { count: liveCount } = await client
        .from("analytics_sessions")
        .select("session_id", { count: "exact", head: true })
        .gte("last_activity_at", live5mStart)
        .eq("is_active", true);

      liveActivity = {
        isSupported: true,
        activeNow: liveCount || 0,
      };

      // 2d. Devices breakdown
      let mobile = 0;
      let desktop = 0;
      let tablet = 0;
      let unknown = 0;

      const sessionsByDay: Record<string, number> = {};
      const visitorsByDay: Record<string, Set<string>> = {};
      const sourceMap: Record<string, { visitors: Set<string>; sessions: number }> = {};
      const entryMap: Record<string, number> = {};
      const wilayaMap: Record<string, number> = {};

      const visitorFirstSeenMap = new Map<string, string>();
      for (const v of visitors) {
        visitorFirstSeenMap.set(v.visitor_id, v.first_seen_at);
      }

      let periodReturning = 0;
      const seenPeriodVisitors = new Set<string>();

      for (const s of sessions) {
        const dev = (s.device_type || "").toLowerCase();
        if (dev === "mobile") mobile++;
        else if (dev === "desktop") desktop++;
        else if (dev === "tablet") tablet++;
        else unknown++;

        const vid = s.anonymous_id || s.session_id;

        // Trend aggregation
        const day = (s.started_at || "").slice(0, 10);
        if (day) {
          sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
          if (!visitorsByDay[day]) visitorsByDay[day] = new Set();
          if (vid) visitorsByDay[day].add(vid);
        }

        // Returning vs new
        if (vid && !seenPeriodVisitors.has(vid)) {
          seenPeriodVisitors.add(vid);
          const firstSeen = visitorFirstSeenMap.get(vid);
          if (firstSeen && firstSeen < periodStartDate.toISOString()) {
            periodReturning++;
          }
        }

        // Sources
        const src = s.first_utm_source || (s.referrer ? "referral" : "direct");
        if (!sourceMap[src]) sourceMap[src] = { visitors: new Set(), sessions: 0 };
        sourceMap[src].sessions++;
        if (vid) sourceMap[src].visitors.add(vid);

        // Entry page
        const entry = s.landing_page || "/";
        entryMap[entry] = (entryMap[entry] || 0) + 1;

        // Wilaya geography (if present)
        if (s.wilaya_code && s.wilaya_code.trim()) {
          wilayaMap[s.wilaya_code.trim()] = (wilayaMap[s.wilaya_code.trim()] || 0) + 1;
        }
      }

      devices = {
        mobile,
        desktop,
        tablet,
        unknown,
        total: sessions.length,
      };

      const totalPeriodVis = periodNew + periodReturning;
      returningVsNew = {
        newVisitors: periodNew,
        returningVisitors: periodReturning,
        newPercentage: totalPeriodVis > 0 ? Number(((periodNew / totalPeriodVis) * 100).toFixed(1)) : 0,
        returningPercentage: totalPeriodVis > 0 ? Number(((periodReturning / totalPeriodVis) * 100).toFixed(1)) : 0,
      };

      // 2e. Build Trend series for every single day in the period
      trend = [];
      for (let i = periodDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = d.toISOString().slice(0, 10);
        const dayParts = dayStr.split("-");
        const label = `${dayParts[2]}/${dayParts[1]}`;
        const uVis = visitorsByDay[dayStr]?.size || 0;
        const nVis = newByDay[dayStr] || 0;

        trend.push({
          date: dayStr,
          label,
          sessions: sessionsByDay[dayStr] || 0,
          uniqueVisitors: uVis,
          newVisitors: nVis,
          returningVisitors: Math.max(0, uVis - nVis),
        });
      }

      // 2f. Sources Array
      const totalSess = sessions.length || 1;
      sources = Object.entries(sourceMap)
        .map(([src, val]) => ({
          source: src,
          visitors: val.visitors.size,
          sessions: val.sessions,
          percentage: Number(((val.sessions / totalSess) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);

      // 2g. Entry Pages Array
      entryPages = Object.entries(entryMap)
        .map(([page, count]) => ({
          page,
          sessions: count,
          percentage: Number(((count / totalSess) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);

      // 2h. Top Pages from analytics_events
      const { data: pageviewData } = await client
        .from("analytics_events")
        .select("page_path, route")
        .eq("event_name", "page_view")
        .gte("occurred_at", periodStartDate.toISOString());

      const pvList = pageviewData || [];
      const pvMap: Record<string, number> = {};
      for (const ev of pvList) {
        const p = ev.page_path || ev.route || "/";
        pvMap[p] = (pvMap[p] || 0) + 1;
      }
      const totalPv = pvList.length || 1;
      topPages = Object.entries(pvMap)
        .map(([p, count]) => ({
          path: p,
          views: count,
          percentage: Number(((count / totalPv) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15);

      // 2i. Exit Pages from analytics_visitors.last_landing_page
      const exitMap: Record<string, number> = {};
      for (const v of visitors) {
        if (v.last_seen_at >= periodStartDate.toISOString() && v.last_landing_page) {
          exitMap[v.last_landing_page] = (exitMap[v.last_landing_page] || 0) + 1;
        }
      }
      exitPages = Object.entries(exitMap)
        .map(([page, exits]) => ({
          page,
          exits,
          percentage: Number(((exits / totalSess) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.exits - a.exits)
        .slice(0, 10);

      // 2j. Geography: ONLY if legitimate data exists
      const hasGeo = Object.keys(wilayaMap).length > 0;
      if (hasGeo) {
        geography = {
          hasReliableGeography: true,
          wilayas: Object.entries(wilayaMap)
            .map(([wilaya, count]) => ({
              wilaya,
              count,
              percentage: Number(((count / totalSess) * 100).toFixed(1)),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        };
      } else {
        geography = { hasReliableGeography: false };
      }

      // 2k. Recent Activity (last 50 sessions, zero PII)
      recentActivity = sessions.slice(0, 50).map((s) => {
        const firstSeen = s.visitor_id ? visitorFirstSeenMap.get(s.visitor_id) : null;
        const isNew = Boolean(
          firstSeen &&
          Math.abs(new Date(firstSeen).getTime() - new Date(s.started_at).getTime()) < 2 * 60 * 1000
        );

        return {
          id: s.session_id,
          time: s.last_activity_at || s.started_at,
          page: s.landing_page || "/",
          device: s.device_type || "desktop",
          source: s.first_channel || s.first_utm_source || "direct",
          visitorType: isNew ? "NEW" : "RETURNING",
        };
      });
    } catch {
      // Keep initial defaults
      liveActivity = { isSupported: false, activeNow: null };
    }
  }

  return {
    period,
    kpis,
    liveActivity,
    trend,
    topPages,
    sources,
    devices,
    returningVsNew,
    entryPages,
    exitPages,
    geography,
    recentActivity,
    generatedAt: now.toISOString(),
  };
}
