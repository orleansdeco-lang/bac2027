"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendVisitorHit, trackProductEvent } from "@/lib/analytics/tracker";
import { useAuth } from "@/lib/auth/context";

function FirstPartyTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lastTrackedRef = useRef<string>("");

  // Track page navigation
  useEffect(() => {
    if (!pathname) return;
    const currentKey = `${pathname}?${searchParams?.toString() || ""}`;
    if (lastTrackedRef.current === currentKey) return;
    lastTrackedRef.current = currentKey;

    sendVisitorHit({
      path: pathname,
      search: searchParams?.toString() || "",
      userId: user?.id || null,
      isHeartbeat: false,
    });

    // Controlled First-Party Acquisition Event: page_view
    trackProductEvent("page_view", {
      path: pathname,
      title: typeof document !== "undefined" ? document.title : "",
    });
  }, [pathname, searchParams, user?.id]);

  // Active session heartbeat every 45 seconds (5-min inactivity window)
  useEffect(() => {
    if (!pathname) return;
    const interval = setInterval(() => {
      sendVisitorHit({
        path: pathname,
        search: searchParams?.toString() || "",
        userId: user?.id || null,
        isHeartbeat: true,
      });

      // Controlled First-Party Engagement Event: session_activity
      trackProductEvent("session_activity", {
        path: pathname,
        interval_seconds: 45,
      });
    }, 45000);

    return () => clearInterval(interval);
  }, [pathname, searchParams, user?.id]);

  return null;
}

export function FirstPartyTracker() {
  return (
    <Suspense fallback={null}>
      <FirstPartyTrackerInner />
    </Suspense>
  );
}
