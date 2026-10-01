import { NextResponse } from "next/server";
import { extractAndVerifyFinanceOperator } from "@/lib/operations/auth";
import { getVisitorAnalyticsDetailed, getLiveVisitorsCount } from "@/lib/operations/visitors";
import { getOperationsAnalyticsSummary } from "@/lib/operations/analytics-store";
import { getAdminClient } from "@/lib/supabase/admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/analytics/visitors
 * Provides live visitor metrics, full visitor logs, UTM campaigns, and device breakdowns.
 */
export async function GET(req: Request) {
  const authRes = await extractAndVerifyFinanceOperator(req);
  if (!authRes.authorized) {
    return NextResponse.json(
      { success: false, error: authRes.error || "Unauthorized: Operator access required" },
      { status: authRes.status }
    );
  }

  try {
    const detailed = getVisitorAnalyticsDetailed();
    const liveCount = getLiveVisitorsCount(5);
    const storeSummary = await getOperationsAnalyticsSummary().catch(() => null);

    // Also attempt to read any recorded sessions from Supabase analytics_sessions
    let dbSessions: any[] = [];
    const client = getAdminClient() || supabase;
    if (isSupabaseConfigured && client) {
      try {
        const { data: sessions } = await client
          .from("analytics_sessions")
          .select("*")
          .order("last_activity_at", { ascending: false })
          .limit(100);
        if (sessions && sessions.length > 0) {
          dbSessions = sessions;
        }
      } catch {}
    }

    // Merge logs from storeSummary and detailed
    const combinedLogs = [...detailed.recentLogs];
    if (storeSummary?.activeSessions) {
      for (const s of storeSummary.activeSessions) {
        if (!combinedLogs.some((l) => l.sessionId === s.sessionId)) {
          combinedLogs.unshift({
            id: s.sessionId,
            timestamp: s.lastActivityAt,
            date: s.startedAt.slice(0, 10),
            time: s.startedAt.slice(11, 19),
            hour: new Date(s.startedAt).getHours(),
            sessionId: s.sessionId,
            userId: s.userId,
            path: s.path,
            fullUrl: s.path,
            deviceType: s.deviceType,
            browser: s.browser || "Browser",
            os: "OS",
            referrer: s.referrer || undefined,
            utmSource: s.utmSource || undefined,
            utmCampaign: s.utmCampaign || undefined,
          });
        }
      }
    }

    // Include DB sessions if not already in memory
    for (const dbs of dbSessions) {
      if (!combinedLogs.some((l) => l.sessionId === dbs.session_id)) {
        combinedLogs.push({
          id: dbs.session_id,
          timestamp: dbs.last_activity_at || dbs.created_at,
          date: (dbs.created_at || new Date().toISOString()).slice(0, 10),
          time: (dbs.created_at || new Date().toISOString()).slice(11, 19),
          hour: new Date(dbs.created_at || Date.now()).getHours(),
          sessionId: dbs.session_id,
          userId: dbs.user_id,
          path: dbs.landing_page || "/",
          fullUrl: dbs.landing_page || "/",
          deviceType: (dbs.device_type as any) || "desktop",
          browser: dbs.browser || "Web",
          os: "OS",
          referrer: dbs.referrer || undefined,
          utmSource: dbs.first_utm_source || undefined,
          utmCampaign: dbs.first_utm_campaign || undefined,
        });
      }
    }

    const effectiveLiveCount = Math.max(liveCount, storeSummary?.liveVisitorsNow || 0);
    const effectiveTodayCount = Math.max(detailed.todayUniqueVisitors, storeSummary?.todayVisitors || 0);
    const effectiveTodayPageviews = Math.max(detailed.todayPageviews, storeSummary?.todayPageviews || 0);

    return NextResponse.json({
      success: true,
      liveCount: effectiveLiveCount,
      todayUniqueVisitors: effectiveTodayCount,
      todayPageviews: effectiveTodayPageviews,
      yesterdayUniqueVisitors: detailed.yesterdayUniqueVisitors,
      yesterdayPageviews: detailed.yesterdayPageviews,
      growthRatePercent: detailed.growthRatePercent,
      deviceRatios: storeSummary?.deviceBreakdown ? {
        mobile: storeSummary.deviceBreakdown.mobile,
        desktop: storeSummary.deviceBreakdown.desktop,
        tablet: storeSummary.deviceBreakdown.tablet,
      } : detailed.deviceRatios,
      topCampaignLinks: detailed.topCampaignLinks,
      topReferrers: detailed.topReferrers,
      topPaths: detailed.topPaths,
      recentLogs: combinedLogs.slice(0, 100),
      topWilayas: storeSummary?.topWilayas || [],
      topSources: storeSummary?.topSources || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve visitor analytics" },
      { status: 500 }
    );
  }
}
