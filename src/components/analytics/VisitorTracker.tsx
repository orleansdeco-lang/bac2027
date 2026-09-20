"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

function getOrCreateVisitorSessionId(): string {
  if (typeof window === "undefined") return "ses_ssr";
  try {
    let sid = sessionStorage.getItem("bac_visitor_session_id");
    if (!sid) {
      sid = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("bac_visitor_session_id", sid);
    }
    return sid;
  } catch {
    return `ses_fallback_${Date.now()}`;
  }
}

function parseUrlParameters(): {
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  refCode?: string;
  rawQuery: Record<string, string>;
} {
  if (typeof window === "undefined") return { rawQuery: {} };
  try {
    const params = new URLSearchParams(window.location.search);
    const rawQuery: Record<string, string> = {};
    params.forEach((v, k) => {
      rawQuery[k] = v;
    });

    const utmSource = params.get("utm_source") || params.get("source") || undefined;
    const utmCampaign = params.get("utm_campaign") || params.get("campaign") || params.get("camp") || undefined;
    const utmMedium = params.get("utm_medium") || params.get("medium") || undefined;
    const refCode = params.get("ref") || params.get("referral") || params.get("code") || undefined;

    return {
      utmSource,
      utmCampaign,
      utmMedium,
      refCode,
      rawQuery,
    };
  } catch {
    return { rawQuery: {} };
  }
}

export function VisitorTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fullUrl = window.location.href;
    const search = window.location.search;
    const trackingKey = `${pathname}${search}`;

    // Prevent duplicate calls on same path and query
    if (lastTrackedKey.current === trackingKey) return;
    lastTrackedKey.current = trackingKey;

    const sessionId = getOrCreateVisitorSessionId();
    const userId = user?.id || null;
    const { utmSource, utmCampaign, utmMedium, refCode, rawQuery } = parseUrlParameters();

    fetch("/api/telemetry/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname || "/",
        fullUrl,
        search,
        sessionId,
        userId,
        referrer: document.referrer || undefined,
        utmSource,
        utmCampaign,
        utmMedium,
        refCode,
        queryParams: rawQuery,
      }),
    }).catch(() => {});
  }, [pathname, user?.id]);

  // Periodic heartbeat every 90 seconds while tab is active to keep live count 100% accurate
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      // Only ping if document is visible
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const sessionId = getOrCreateVisitorSessionId();
      const userId = user?.id || null;
      const { utmSource, utmCampaign, utmMedium, refCode, rawQuery } = parseUrlParameters();

      fetch("/api/telemetry/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: window.location.pathname || "/",
          fullUrl: window.location.href,
          sessionId,
          userId,
          isHeartbeat: true,
          utmSource,
          utmCampaign,
          utmMedium,
          refCode,
          queryParams: rawQuery,
        }),
      }).catch(() => {});
    }, 90 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return null;
}
