/**
 * BAC Mastery — Durable Visitor Analytics Service (Shopify-Style V2)
 * Real-time active visitors, 24-hour hourly traffic aggregation, campaign/link attribution,
 * and Supabase persistence.
 */

import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { classifyChannel } from "../analytics/attribution";

export interface VisitorLogEntry {
  id: string;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  hour: number; // 0..23
  sessionId: string;
  userId?: string | null;
  path: string;
  fullUrl?: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser?: string;
  os?: string;
  referrer?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  refCode?: string;
  queryParams?: Record<string, string>;
  ip?: string;
  isHeartbeat?: boolean;
}

export interface HourlyTrafficBucket {
  hour: number;
  label: string; // e.g. "14:00"
  visitors: number;
  pageviews: number;
}

export interface CampaignLinkStat {
  campaignKey: string;
  source: string;
  campaign?: string;
  refCode?: string;
  totalVisits: number;
  uniqueVisitors: number;
  lastVisitAt: string;
}

export interface ReferrerStat {
  domain: string;
  label: string;
  count: number;
  percentage: number;
}

export interface VisitorAnalyticsSummaryV2 {
  liveVisitorsCount: number;
  todayUniqueVisitors: number;
  todayPageviews: number;
  yesterdayUniqueVisitors: number;
  yesterdayPageviews: number;
  growthRatePercent: number;
  hourlyTrafficToday: HourlyTrafficBucket[];
  deviceRatios: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topCampaignLinks: CampaignLinkStat[];
  topReferrers: ReferrerStat[];
  topPaths: { path: string; count: number }[];
  recentLogs: VisitorLogEntry[];
}

function getDurableVisitorsPath(): string {
  const dir = path.join(process.cwd(), ".runtime");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "visitor_logs.json");
}

let memoryVisitorLogs: VisitorLogEntry[] = [];
let isLoaded = false;

function loadDurableLogs(): VisitorLogEntry[] {
  if (isLoaded) return memoryVisitorLogs;
  if (typeof window !== "undefined") return [];

  try {
    const filePath = getDurableVisitorsPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        memoryVisitorLogs = list;
      }
    }
  } catch {}

  isLoaded = true;
  return memoryVisitorLogs;
}

function saveDurableLogs(): void {
  if (typeof window !== "undefined") return;
  try {
    const filePath = getDurableVisitorsPath();
    if (memoryVisitorLogs.length > 50000) {
      memoryVisitorLogs = memoryVisitorLogs.slice(0, 50000);
    }
    fs.writeFileSync(filePath, JSON.stringify(memoryVisitorLogs, null, 2), "utf8");
  } catch {}
}

function extractReferrerDomain(refUrl?: string): { domain: string; label: string } {
  if (!refUrl) return { domain: "direct", label: "مباشر (Direct)" };
  try {
    const url = new URL(refUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes("whatsapp")) return { domain: "whatsapp.com", label: "واتساب (WhatsApp)" };
    if (host.includes("facebook") || host.includes("fb.me") || host.includes("l.facebook")) return { domain: "facebook.com", label: "فيسبوك (Facebook)" };
    if (host.includes("instagram")) return { domain: "instagram.com", label: "إنستغرام (Instagram)" };
    if (host.includes("telegram") || host.includes("t.me")) return { domain: "telegram.org", label: "تيليغرام (Telegram)" };
    if (host.includes("tiktok")) return { domain: "tiktok.com", label: "تيك توك (TikTok)" };
    if (host.includes("google")) return { domain: "google.com", label: "جوجل (Google Search)" };
    if (host.includes("youtube")) return { domain: "youtube.com", label: "يوتيوب (YouTube)" };
    if (host.includes("linkedin")) return { domain: "linkedin.com", label: "لينكد إن (LinkedIn)" };

    return { domain: host, label: host };
  } catch {
    return { domain: "external", label: "مصدر خارجي" };
  }
}

export async function recordVisitorHit(input: {
  sessionId: string;
  path: string;
  fullUrl?: string;
  userId?: string | null;
  userAgent?: string;
  referrer?: string;
  ip?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmContent?: string;
  utmTerm?: string;
  refCode?: string;
  queryParams?: Record<string, string>;
  isHeartbeat?: boolean;
  anonymousId?: string;
  visitorId?: string;
  firstTouch?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  } | null;
  lastTouch?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  } | null;
  deviceType?: "mobile" | "desktop" | "tablet";
  browser?: string;
  os?: string;
}): Promise<VisitorLogEntry> {
  loadDurableLogs();

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  const hour = now.getHours();

  const ua = (input.userAgent || "").toLowerCase();
  let deviceType: "mobile" | "desktop" | "tablet" = input.deviceType || "desktop";
  if (!input.deviceType) {
    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
      deviceType = "tablet";
    } else if (/mobile|iphone|android|phone|ipod/i.test(ua)) {
      deviceType = "mobile";
    }
  }

  let browser = input.browser || "Other";
  if (!input.browser) {
    if (/edg\//i.test(ua)) browser = "Edge";
    else if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua)) browser = "Safari";
  }

  let os = input.os || "Other";
  if (!input.os) {
    if (/windows/i.test(ua)) os = "Windows";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/macintosh|mac os/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";
  }

  const { domain: referrerDomain } = extractReferrerDomain(input.referrer);

  const entry: VisitorLogEntry = {
    id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: now.toISOString(),
    date: dateStr,
    time: timeStr,
    hour,
    sessionId: input.sessionId || "ses_anon",
    userId: input.userId || null,
    path: input.path || "/",
    fullUrl: input.fullUrl,
    deviceType,
    browser,
    os,
    referrer: input.referrer || undefined,
    referrerDomain,
    utmSource: input.lastTouch?.source || input.utmSource || input.firstTouch?.source || undefined,
    utmCampaign: input.lastTouch?.campaign || input.utmCampaign || input.firstTouch?.campaign || undefined,
    utmMedium: input.lastTouch?.medium || input.utmMedium || input.firstTouch?.medium || undefined,
    refCode: input.refCode || undefined,
    queryParams: input.queryParams,
    ip: input.ip ? input.ip.split(",")[0].trim() : undefined,
    isHeartbeat: input.isHeartbeat,
  };

  memoryVisitorLogs.unshift(entry);
  saveDurableLogs();

  // Asynchronously persist to Supabase (both visitor_hits and analytics_sessions)
  if (isSupabaseConfigured && supabase) {
    const anonymousId = input.anonymousId || `anon_${entry.sessionId}`;
    const visitorId = input.visitorId || anonymousId;
    
    const channel = classifyChannel(
      input.firstTouch?.source || input.utmSource,
      input.firstTouch?.medium || input.utmMedium,
      entry.referrer
    );

    // 1. visitor_hits — direct insert with error logging
    supabase
      .from("visitor_hits")
      .insert({
        session_id: entry.sessionId,
        user_id: entry.userId || null,
        path: entry.path,
        full_url: entry.fullUrl || null,
        query_params: entry.queryParams || {},
        referrer: entry.referrer || null,
        utm_source: entry.utmSource || null,
        utm_campaign: entry.utmCampaign || null,
        utm_medium: entry.utmMedium || null,
        ref_code: entry.refCode || null,
        device_type: entry.deviceType,
        browser: entry.browser || null,
        os: entry.os || null,
        ip_hash: entry.ip || null,
        created_at: entry.timestamp,
      })
      .then(({ error }) => {
        if (error) console.warn("[Analytics] visitor_hits insert failed:", error.message);
      }, (err) => {
        console.warn("[Analytics] visitor_hits insert exception:", err?.message);
      });

    // 2. analytics_sessions — try RPC first, fall back to direct insert
    supabase
      .rpc("record_session_identity", {
        p_session_id: entry.sessionId,
        p_visitor_id: visitorId,
        p_anonymous_id: anonymousId,
        p_user_id: entry.userId || null,
        p_landing_page: entry.path,
        p_referrer: entry.referrer || null,
        p_source: input.firstTouch?.source || input.utmSource || null,
        p_medium: input.firstTouch?.medium || input.utmMedium || null,
        p_campaign: input.firstTouch?.campaign || input.utmCampaign || null,
        p_content: input.firstTouch?.content || input.utmContent || null,
        p_term: input.firstTouch?.term || input.utmTerm || null,
        p_channel: channel,
        p_device_type: entry.deviceType,
        p_browser: entry.browser || null,
        p_os: entry.os || null,
        p_ip_hash: entry.ip || null,
        p_country: "DZ",
      })
      .then(({ error }) => {
        if (error) {
          console.warn("[Analytics] record_session_identity RPC failed, using direct insert fallback:", error.message);
          
          const sessionPayload: Record<string, any> = {
            session_id: entry.sessionId,
            anonymous_id: anonymousId,
            user_id: entry.userId || null,
            landing_page: entry.path,
            referrer: entry.referrer || null,
            first_utm_source: input.firstTouch?.source || input.utmSource || null,
            first_utm_medium: input.firstTouch?.medium || input.utmMedium || null,
            first_utm_campaign: input.firstTouch?.campaign || input.utmCampaign || null,
            first_utm_content: input.firstTouch?.content || input.utmContent || null,
            first_utm_term: input.firstTouch?.term || input.utmTerm || null,
            last_utm_source: input.lastTouch?.source || input.utmSource || null,
            last_utm_medium: input.lastTouch?.medium || input.utmMedium || null,
            last_utm_campaign: input.lastTouch?.campaign || input.utmCampaign || null,
            device_type: entry.deviceType,
            browser: entry.browser || null,
            os: entry.os || null,
            ip_hash: entry.ip || null,
            country: "DZ",
            pageviews_count: 1,
            started_at: entry.timestamp,
            last_activity_at: entry.timestamp,
            is_active: true,
          };

          // Try insert with visitor_id first
          supabase!
            .from("analytics_sessions")
            .insert({ ...sessionPayload, visitor_id: visitorId })
            .then(({ error: insertErr }) => {
              if (insertErr) {
                // If column doesn't exist, retry without visitor_id
                if (insertErr.code === "PGRST204" || insertErr.message?.includes("visitor_id")) {
                  supabase!
                    .from("analytics_sessions")
                    .insert(sessionPayload)
                    .then(({ error: fallbackErr }) => {
                      if (fallbackErr && fallbackErr.code !== "23505") {
                        console.warn("[Analytics] analytics_sessions fallback insert failed:", fallbackErr.message);
                      }
                    }, () => {});
                } else if (insertErr.code !== "23505") {
                  console.warn("[Analytics] analytics_sessions insert failed:", insertErr.message);
                }
              }
            }, () => {});
        }
      }, (err) => {
        console.warn("[Analytics] record_session_identity exception:", err?.message);
      });
  }

  return entry;
}

export function getLiveVisitorsCount(windowMinutes: number = 5): number {
  loadDurableLogs();
  const cutoff = Date.now() - windowMinutes * 60 * 1000;

  const activeSessions = new Set<string>();
  for (const log of memoryVisitorLogs) {
    const timeMs = new Date(log.timestamp).getTime();
    if (timeMs >= cutoff) {
      activeSessions.add(log.sessionId);
    }
  }

  return activeSessions.size;
}

export function getShopifyHourlyTraffic(targetDate?: string): HourlyTrafficBucket[] {
  loadDurableLogs();
  const dateStr = targetDate || new Date().toISOString().slice(0, 10);

  // Initialize 24 buckets for 00:00 to 23:00
  const buckets: { visitors: Set<string>; pageviews: number }[] = Array.from(
    { length: 24 },
    () => ({ visitors: new Set<string>(), pageviews: 0 })
  );

  for (const log of memoryVisitorLogs) {
    if (log.date === dateStr) {
      const h = typeof log.hour === "number" && log.hour >= 0 && log.hour <= 23
        ? log.hour
        : new Date(log.timestamp).getHours();

      buckets[h].pageviews++;
      buckets[h].visitors.add(log.sessionId);
    }
  }

  return buckets.map((b, i) => ({
    hour: i,
    label: `${String(i).padStart(2, "0")}:00`,
    visitors: b.visitors.size,
    pageviews: b.pageviews,
  }));
}

export function getCampaignAttribution(limitDays: number = 30): CampaignLinkStat[] {
  loadDurableLogs();
  const cutoff = Date.now() - limitDays * 24 * 60 * 60 * 1000;

  const map = new Map<
    string,
    {
      source: string;
      campaign?: string;
      refCode?: string;
      visits: number;
      visitors: Set<string>;
      lastVisitAt: string;
    }
  >();

  for (const log of memoryVisitorLogs) {
    const timeMs = new Date(log.timestamp).getTime();
    if (timeMs < cutoff) continue;

    // Detect if this hit was from a shared link or campaign
    const source = log.utmSource || (log.refCode ? `ref:${log.refCode}` : null);
    if (!source && !log.utmCampaign && !log.refCode) continue;

    const key = `${source || "link"}_${log.utmCampaign || "general"}_${log.refCode || "none"}`;
    let item = map.get(key);
    if (!item) {
      item = {
        source: source || "رابط مخصص",
        campaign: log.utmCampaign,
        refCode: log.refCode,
        visits: 0,
        visitors: new Set(),
        lastVisitAt: log.timestamp,
      };
      map.set(key, item);
    }

    item.visits++;
    item.visitors.add(log.sessionId);
    if (new Date(log.timestamp) > new Date(item.lastVisitAt)) {
      item.lastVisitAt = log.timestamp;
    }
  }

  return Array.from(map.entries())
    .map(([campaignKey, val]) => ({
      campaignKey,
      source: val.source,
      campaign: val.campaign,
      refCode: val.refCode,
      totalVisits: val.visits,
      uniqueVisitors: val.visitors.size,
      lastVisitAt: val.lastVisitAt,
    }))
    .sort((a, b) => b.totalVisits - a.totalVisits)
    .slice(0, 25);
}

export function getReferrerDomains(limitDays: number = 30): ReferrerStat[] {
  loadDurableLogs();
  const cutoff = Date.now() - limitDays * 24 * 60 * 60 * 1000;

  const map = new Map<string, { label: string; count: number }>();
  let total = 0;

  for (const log of memoryVisitorLogs) {
    const timeMs = new Date(log.timestamp).getTime();
    if (timeMs < cutoff) continue;

    const { domain, label } = extractReferrerDomain(log.referrer);
    const existing = map.get(domain) || { label, count: 0 };
    existing.count++;
    map.set(domain, existing);
    total++;
  }

  return Array.from(map.entries())
    .map(([domain, data]) => ({
      domain,
      label: data.label,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function getVisitorAnalyticsDetailed(targetDate?: string): VisitorAnalyticsSummaryV2 {
  loadDurableLogs();

  const liveVisitorsCount = getLiveVisitorsCount(5);
  const now = new Date();
  const todayStr = targetDate || now.toISOString().slice(0, 10);

  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

  let todayPageviews = 0;
  const todayVisitors = new Set<string>();

  let yesterdayPageviews = 0;
  const yesterdayVisitors = new Set<string>();

  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  const pathCounts = new Map<string, number>();

  for (const log of memoryVisitorLogs) {
    if (log.date === todayStr) {
      todayPageviews++;
      todayVisitors.add(log.sessionId);

      if (log.deviceType === "mobile") mobileCount++;
      else if (log.deviceType === "tablet") tabletCount++;
      else desktopCount++;

      const p = log.path || "/";
      pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
    } else if (log.date === yesterdayStr) {
      yesterdayPageviews++;
      yesterdayVisitors.add(log.sessionId);
    }
  }

  const totalDev = mobileCount + desktopCount + tabletCount;
  const deviceRatios = {
    mobile: totalDev > 0 ? Math.round((mobileCount / totalDev) * 100) : 0,
    desktop: totalDev > 0 ? Math.round((desktopCount / totalDev) * 100) : 0,
    tablet: totalDev > 0 ? Math.round((tabletCount / totalDev) * 100) : 0,
  };

  const todayCount = todayVisitors.size;
  const yesterdayCount = yesterdayVisitors.size;
  const growthRatePercent =
    yesterdayCount > 0
      ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
      : todayCount > 0
      ? 100
      : 0;

  const hourlyTrafficToday = getShopifyHourlyTraffic(todayStr);
  const topCampaignLinks = getCampaignAttribution(30);
  const topReferrers = getReferrerDomains(30);

  const topPaths = Array.from(pathCounts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    liveVisitorsCount,
    todayUniqueVisitors: todayCount,
    todayPageviews,
    yesterdayUniqueVisitors: yesterdayCount,
    yesterdayPageviews,
    growthRatePercent,
    hourlyTrafficToday,
    deviceRatios,
    topCampaignLinks,
    topReferrers,
    topPaths,
    recentLogs: memoryVisitorLogs.slice(0, 50),
  };
}

export function getVisitorAnalytics(limitDays: number = 30) {
  const detailed = getVisitorAnalyticsDetailed();
  return {
    todayCount: detailed.todayUniqueVisitors,
    todayPageviews: detailed.todayPageviews,
    yesterdayCount: detailed.yesterdayUniqueVisitors,
    yesterdayPageviews: detailed.yesterdayPageviews,
    growthRatePercent: detailed.growthRatePercent,
    deviceRatios: detailed.deviceRatios,
    topPaths: detailed.topPaths,
    topReferrers: detailed.topReferrers,
    recentLogs: detailed.recentLogs,
  };
}

export function exportVisitorLogsToCsv(limit: number = 2000): string {
  loadDurableLogs();

  const headers = [
    "ID",
    "التاريخ والوقت",
    "المسار",
    "الرابط الكامل",
    "المصدر / الحملة",
    "كود الإحالة",
    "المصدر الخارجي (Referrer)",
    "نوع الجهاز",
    "المتصفح",
    "النظام",
    "معرف الجلسة",
  ];

  const rows = memoryVisitorLogs.slice(0, limit).map((log) => [
    log.id,
    `"${log.date} ${log.time}"`,
    `"${log.path}"`,
    `"${log.fullUrl || log.path}"`,
    `"${log.utmSource || log.utmCampaign || "مباشر"}"`,
    `"${log.refCode || "—"}"`,
    `"${log.referrerDomain || log.referrer || "مباشر"}"`,
    `"${log.deviceType}"`,
    `"${log.browser || "—"}"`,
    `"${log.os || "—"}"`,
    `"${log.sessionId}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return csvContent;
}
