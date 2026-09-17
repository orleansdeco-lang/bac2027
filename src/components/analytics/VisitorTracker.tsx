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

export function VisitorTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Prevent duplicate calls on same path render
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const sessionId = getOrCreateVisitorSessionId();
    const userId = user?.id || null;

    fetch("/api/telemetry/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        sessionId,
        userId,
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }),
    }).catch(() => {});
  }, [pathname, user?.id]);

  // Periodic heartbeat every 4 minutes to keep live visitor status accurate
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionId = getOrCreateVisitorSessionId();
      const userId = user?.id || null;

      fetch("/api/telemetry/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: window.location.pathname,
          sessionId,
          userId,
        }),
      }).catch(() => {});
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return null;
}
