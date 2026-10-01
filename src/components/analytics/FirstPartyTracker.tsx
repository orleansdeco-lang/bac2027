"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendVisitorHit } from "@/lib/analytics/tracker";
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
