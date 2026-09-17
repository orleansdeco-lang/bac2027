/**
 * BAC Mastery — Durable Visitor Analytics Service
 * Real-time active visitors & historical date-by-date traffic aggregation.
 */

import fs from "fs";
import path from "path";

export interface VisitorLogEntry {
  id: string;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  sessionId: string;
  userId?: string | null;
  path: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser?: string;
  os?: string;
  referrer?: string;
  ip?: string;
}

export interface DailyVisitorStat {
  date: string;
  uniqueVisitors: number;
  pageviews: number;
  mobileCount: number;
  desktopCount: number;
  tabletCount: number;
  authenticatedCount: number;
  topPaths: { path: string; count: number }[];
}

export interface VisitorAnalyticsSummary {
  liveVisitorsCount: number;
  todayUniqueVisitors: number;
  todayPageviews: number;
  todayMobileRatio: number;
  todayDesktopRatio: number;
  byDate: DailyVisitorStat[];
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
    // Maintain maximum 30,000 entries
    if (memoryVisitorLogs.length > 30000) {
      memoryVisitorLogs = memoryVisitorLogs.slice(0, 30000);
    }
    fs.writeFileSync(filePath, JSON.stringify(memoryVisitorLogs, null, 2), "utf8");
  } catch {}
}

export function recordVisitorHit(input: {
  sessionId: string;
  path: string;
  userId?: string | null;
  userAgent?: string;
  referrer?: string;
  ip?: string;
}): VisitorLogEntry {
  loadDurableLogs();

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);

  const ua = (input.userAgent || "").toLowerCase();
  let deviceType: "mobile" | "desktop" | "tablet" = "desktop";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|android|phone|ipod/i.test(ua)) {
    deviceType = "mobile";
  }

  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/macintosh|mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  const entry: VisitorLogEntry = {
    id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    date: dateStr,
    time: timeStr,
    sessionId: input.sessionId || "ses_anon",
    userId: input.userId || null,
    path: input.path || "/",
    deviceType,
    browser,
    os,
    referrer: input.referrer || undefined,
    ip: input.ip ? input.ip.split(",")[0].trim() : undefined,
  };

  memoryVisitorLogs.unshift(entry);
  saveDurableLogs();

  return entry;
}

export function getLiveVisitorsCount(windowMinutes: number = 15): number {
  loadDurableLogs();
  const cutoff = Date.now() - windowMinutes * 60 * 1000;

  const activeSessions = new Set<string>();
  for (const log of memoryVisitorLogs) {
    const timeMs = new Date(log.timestamp).getTime();
    if (timeMs >= cutoff) {
      activeSessions.add(log.sessionId);
    } else {
      // Since logs are sorted newest-first, we can stop early if timeMs is too old
      break;
    }
  }

  return Math.max(1, activeSessions.size); // Minimum 1 for current active admin
}

export function getVisitorAnalytics(limitDays: number = 30): VisitorAnalyticsSummary {
  loadDurableLogs();

  const liveVisitorsCount = getLiveVisitorsCount(15);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Group by date
  const dateMap = new Map<
    string,
    {
      sessions: Set<string>;
      pageviews: number;
      mobileCount: number;
      desktopCount: number;
      tabletCount: number;
      authSessions: Set<string>;
      pathCounts: Map<string, number>;
    }
  >();

  for (const log of memoryVisitorLogs) {
    let stat = dateMap.get(log.date);
    if (!stat) {
      stat = {
        sessions: new Set<string>(),
        pageviews: 0,
        mobileCount: 0,
        desktopCount: 0,
        tabletCount: 0,
        authSessions: new Set<string>(),
        pathCounts: new Map<string, number>(),
      };
      dateMap.set(log.date, stat);
    }

    stat.pageviews++;
    stat.sessions.add(log.sessionId);

    if (log.userId) {
      stat.authSessions.add(log.userId);
    }

    if (log.deviceType === "mobile") stat.mobileCount++;
    else if (log.deviceType === "tablet") stat.tabletCount++;
    else stat.desktopCount++;

    const p = log.path || "/";
    stat.pathCounts.set(p, (stat.pathCounts.get(p) || 0) + 1);
  }

  // If today has no entries yet, create default entry with at least live user
  if (!dateMap.has(todayStr)) {
    dateMap.set(todayStr, {
      sessions: new Set(["current_operator"]),
      pageviews: 1,
      mobileCount: 0,
      desktopCount: 1,
      tabletCount: 0,
      authSessions: new Set(),
      pathCounts: new Map([["/ops", 1]]),
    });
  }

  // Sort dates descending
  const sortedDates = Array.from(dateMap.keys()).sort().reverse().slice(0, limitDays);

  const byDate: DailyVisitorStat[] = sortedDates.map((date) => {
    const raw = dateMap.get(date)!;
    const topPaths = Array.from(raw.pathCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      date,
      uniqueVisitors: raw.sessions.size,
      pageviews: raw.pageviews,
      mobileCount: raw.mobileCount,
      desktopCount: raw.desktopCount,
      tabletCount: raw.tabletCount,
      authenticatedCount: raw.authSessions.size,
      topPaths,
    };
  });

  const todayData = dateMap.get(todayStr);
  const todayUniqueVisitors = todayData ? todayData.sessions.size : 1;
  const todayPageviews = todayData ? todayData.pageviews : 1;
  const totalDevices = (todayData?.mobileCount || 0) + (todayData?.desktopCount || 0) + (todayData?.tabletCount || 0);
  const todayMobileRatio = totalDevices > 0 ? Math.round(((todayData?.mobileCount || 0) / totalDevices) * 100) : 0;
  const todayDesktopRatio = totalDevices > 0 ? Math.round(((todayData?.desktopCount || 0) / totalDevices) * 100) : 100;

  return {
    liveVisitorsCount,
    todayUniqueVisitors,
    todayPageviews,
    todayMobileRatio,
    todayDesktopRatio,
    byDate,
    recentLogs: memoryVisitorLogs.slice(0, 50),
  };
}
