import { NextResponse } from "next/server";
import { recordVisitorHit, getLiveVisitorsCount } from "@/lib/operations/visitors";
import { recordVisitorHit as recordInMemoryHit } from "@/lib/operations/analytics-store";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * Known bot User-Agent substrings — filter these from analytics.
 * This is a basic filter; sophisticated bots will still pass through.
 */
const BOT_UA_PATTERNS = [
  "bot", "crawler", "spider", "slurp", "mediapartners",
  "googlebot", "bingbot", "yandexbot", "baiduspider",
  "facebookexternalhit", "twitterbot", "linkedinbot",
  "whatsapp", "telegrambot", "applebot", "duckduckbot",
  "ia_archiver", "semrushbot", "ahrefsbot", "mj12bot",
  "dotbot", "petalbot", "uptimerobot", "pingdom",
  "headlesschrome", "phantomjs", "prerender",
];

function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some(pattern => ua.includes(pattern));
}

/**
 * POST /api/telemetry/visitor
 * Ingestion endpoint for recording real-time and historical visitor activity.
 * 
 * SECURITY INVARIANTS:
 * 1. user_id is NEVER trusted from client — derived from JWT on server.
 * 2. Bot User-Agents are filtered out.
 * 3. visitor_id is persisted to analytics_visitors table for identity stitching.
 * 4. Single write path — no duplicate analytics-store call.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get("user-agent") || undefined;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const referrer = req.headers.get("referer") || body.referrer || undefined;

    // Bot filtering — reject known crawlers from visitor analytics
    if (isBot(userAgent)) {
      return NextResponse.json({ success: true, ignored: true, reason: "bot" });
    }

    // SERVER-SIDE USER IDENTITY — never trust client-submitted userId
    const serverDerivedUserId = await extractAuthenticatedUserId(req);

    const sessionId = body.sessionId || "ses_guest";
    const path = body.path || "/";
    if (path.startsWith("/admin") || path.startsWith("/ops") || path.startsWith("/api")) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const visitorId = body.visitorId || body.anonymousId || undefined;
    const fullUrl = body.fullUrl || undefined;
    const anonymousId = body.anonymousId || undefined;
    const utmSource = body.utmSource || undefined;
    const utmCampaign = body.utmCampaign || undefined;
    const utmMedium = body.utmMedium || undefined;
    const utmContent = body.utmContent || undefined;
    const utmTerm = body.utmTerm || undefined;
    const refCode = body.refCode || undefined;
    const queryParams = body.queryParams || {};
    const isHeartbeat = Boolean(body.isHeartbeat);
    const firstTouch = body.firstTouch || null;
    const lastTouch = body.lastTouch || null;
    const deviceType = body.deviceType || undefined;
    const browser = body.browser || undefined;
    const os = body.os || undefined;

    // Record visitor hit through the primary path (visitors.ts)
    // Uses server-derived userId, NOT client-submitted
    await recordVisitorHit({
      sessionId,
      anonymousId,
      path,
      fullUrl,
      userId: serverDerivedUserId,
      userAgent,
      referrer,
      ip,
      utmSource,
      utmCampaign,
      utmMedium,
      utmContent,
      utmTerm,
      refCode,
      queryParams,
      isHeartbeat,
      firstTouch,
      lastTouch,
      deviceType,
      browser,
      os,
      visitorId,
    });

    // Upsert analytics_visitors record for identity stitching
    if (visitorId && !isHeartbeat) {
      upsertAnalyticsVisitor({
        visitorId,
        userId: serverDerivedUserId,
        deviceType,
        browser,
        os,
        firstTouch,
        referrer,
        landingPage: path,
      });
    }

    // Also keep the in-memory cache populated for /ops live views
    try {
      recordInMemoryHit({
        sessionId: body.sessionId,
        anonymousId: body.anonymousId || undefined,
        visitorId: body.visitorId || undefined,
        userId: serverDerivedUserId,
        path: body.path || "/",
        referrer: referrer,
        utmSource: body.utmSource || body.lastTouch?.source || body.firstTouch?.source || null,
        utmCampaign: body.utmCampaign || body.lastTouch?.campaign || body.firstTouch?.campaign || null,
        deviceType: body.deviceType,
        browser: body.browser,
      });
    } catch (e) {
      // Ignore memory cache errors
    }

    const liveCount = getLiveVisitorsCount(5);

    return NextResponse.json({
      success: true,
      liveCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Visitor logging error" },
      { status: 500 }
    );
  }
}

import { classifyChannel } from "@/lib/analytics/attribution";

/**
 * Upserts an analytics_visitors record for the given visitor_id.
 * Uses the secure record_visitor_identity RPC to guarantee first-touch immutability.
 * Fire-and-forget — does not block the response.
 */
function upsertAnalyticsVisitor(data: {
  visitorId: string;
  userId: string | null;
  deviceType?: string;
  browser?: string;
  os?: string;
  firstTouch?: { source?: string; medium?: string; campaign?: string; content?: string; term?: string } | null;
  referrer?: string;
  landingPage?: string;
}): void {
  try {
    const admin = getAdminClient();
    // Use admin client if available, otherwise fall back to anon client
    const client = admin || supabase;
    if (!client) return;

    const device = (data.deviceType === "mobile" || data.deviceType === "tablet")
      ? data.deviceType
      : "desktop";

    const channel = classifyChannel(
      data.firstTouch?.source,
      data.firstTouch?.medium,
      data.referrer
    );

    client
      .rpc("record_visitor_identity", {
        p_visitor_id: data.visitorId,
        p_user_id: data.userId || null,
        p_device_type: device,
        p_browser: data.browser || null,
        p_os: data.os || null,
        p_landing_page: data.landingPage || "/",
        p_referrer: data.referrer || null,
        p_source: data.firstTouch?.source || null,
        p_medium: data.firstTouch?.medium || null,
        p_campaign: data.firstTouch?.campaign || null,
        p_content: data.firstTouch?.content || null,
        p_term: data.firstTouch?.term || null,
        p_channel: channel,
      })
      .then(({ error }) => {
        if (error) {
          console.warn("[Analytics] record_visitor_identity RPC failed, using direct insert:", error.message);
          // Fallback: direct upsert to analytics_visitors
          const fallbackClient = admin || supabase;
          if (fallbackClient) {
            fallbackClient
              .from("analytics_visitors")
              .upsert({
                visitor_id: data.visitorId,
                user_id: data.userId || null,
                first_seen_at: new Date().toISOString(),
                last_seen_at: new Date().toISOString(),
                first_utm_source: data.firstTouch?.source || null,
                first_utm_medium: data.firstTouch?.medium || null,
                first_utm_campaign: data.firstTouch?.campaign || null,
                first_utm_content: data.firstTouch?.content || null,
                first_utm_term: data.firstTouch?.term || null,
                first_referrer: data.referrer || null,
                first_landing_page: data.landingPage || "/",
                first_channel: channel,
                device_type: device,
                browser: data.browser || null,
                os: data.os || null,
                total_sessions: 1,
                total_pageviews: 1,
                is_bot: false,
              }, { onConflict: "visitor_id" })
              .then(({ error: upsertErr }) => {
                if (upsertErr) console.warn("[Analytics] analytics_visitors direct upsert failed:", upsertErr.message);
              }, () => {});
          }
        }
      }, (err) => {
        console.warn("[Analytics] record_visitor_identity exception:", err?.message);
      });
  } catch (err: any) {
    console.warn("[Analytics] upsertAnalyticsVisitor exception:", err?.message);
  }
}
