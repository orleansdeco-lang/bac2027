"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

function getOrCreateVisitorDeviceId(): string {
  if (typeof window === "undefined") return "dev_ssr";
  try {
    let did = localStorage.getItem("shater_visitor_device_id");
    if (!did) {
      did = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("shater_visitor_device_id", did);
    }
    return did;
  } catch {
    return `dev_fallback_${Date.now()}`;
  }
}

function getOrCreateVisitorSessionId(): string {
  if (typeof window === "undefined") return "ses_ssr";
  try {
    let sid = sessionStorage.getItem("bac_visitor_session_id");
    if (!sid) {
      // Tie session to device ID if available
      const deviceId = getOrCreateVisitorDeviceId();
      sid = `ses_${deviceId.replace("dev_", "")}_${Date.now().toString(36)}`;
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

    // STRICT INVARIANT: Never track operator/admin actions or internal API routes as public visitor traffic!
    if (!pathname || pathname.startsWith("/ops") || pathname.startsWith("/api")) {
      return;
    }

    const fullUrl = window.location.href;
    const search = window.location.search;
    const trackingKey = `${pathname}${search}`;

    // Prevent duplicate calls on same path and query
    if (lastTrackedKey.current === trackingKey) return;
    lastTrackedKey.current = trackingKey;

    const deviceId = getOrCreateVisitorDeviceId();
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
        sessionId: deviceId, // Use consistent device ID so a visitor is counted once per day
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

  // Periodic heartbeat every 90 seconds while tab is active to keep live presence accurate
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      // Strictly ignore ops pages
      if (!pathname || pathname.startsWith("/ops") || pathname.startsWith("/api")) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const deviceId = getOrCreateVisitorDeviceId();
      const userId = user?.id || null;

      fetch("/api/telemetry/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname || "/",
          sessionId: deviceId,
          userId,
          isHeartbeat: true,
        }),
      }).catch(() => {});
    }, 90000);

    return () => clearInterval(interval);
  }, [pathname, user?.id]);

  return null;
}
