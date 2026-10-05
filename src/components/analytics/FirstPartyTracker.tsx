"use client";

import React, { useEffect, useRef, Suspense, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendVisitorHit, trackProductEvent, sendAnalyticsEvent } from "@/lib/analytics/tracker";
import { useAuth } from "@/lib/auth/context";

function formatDwellDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}ث`;
  }
  const mins = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  if (mins < 60) {
    return remSec > 0 ? `${mins}د ${remSec}ث` : `${mins}د`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}س ${remMins}د`;
}

function FirstPartyTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const lastTrackedRef = useRef<string>("");
  const currentPathRef = useRef<string>("");
  const enteredAtTimeRef = useRef<number>(0);
  const enteredAtIsoRef = useRef<string>("");
  const lastLeaveSentTimeRef = useRef<number>(0);

  // Helper to emit page_leave event with precise entry, exit, and dwell duration
  const emitPageLeave = useCallback((now: number = Date.now()) => {
    const path = currentPathRef.current;
    const enteredAtMs = enteredAtTimeRef.current;
    if (!path || !enteredAtMs) return;

    // Strictly exclude internal operations, admin, and API routes
    if (path.startsWith("/ops") || path.startsWith("/admin") || path.startsWith("/api")) {
      return;
    }

    // Avoid duplicate emit if already sent within 1000ms for this page
    if (now - lastLeaveSentTimeRef.current < 1000) return;

    const dwellMs = now - enteredAtMs;
    const durationSeconds = Math.max(1, Math.round(dwellMs / 1000));
    const exitedAtIso = new Date(now).toISOString();

    sendAnalyticsEvent("page_leave", {
      path,
      pagePath: path,
      entered_at: enteredAtIsoRef.current || new Date(enteredAtMs).toISOString(),
      exited_at: exitedAtIso,
      duration_seconds: durationSeconds,
      formatted_duration: formatDwellDuration(durationSeconds),
    });

    lastLeaveSentTimeRef.current = now;
  }, []);

  // Track page navigation & SPA route transitions
  useEffect(() => {
    if (!pathname) return;

    // Strictly exclude internal operations, admin, and API routes from visitor analytics
    if (pathname.startsWith("/ops") || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const currentKey = `${pathname}?${searchParams?.toString() || ""}`;
    if (lastTrackedRef.current === currentKey) return;

    const now = Date.now();

    // If transitioning from a previous page, record page_leave for it
    if (currentPathRef.current && currentPathRef.current !== pathname) {
      emitPageLeave(now);
    }

    lastTrackedRef.current = currentKey;
    currentPathRef.current = pathname;
    enteredAtTimeRef.current = now;
    enteredAtIsoRef.current = new Date(now).toISOString();
    lastLeaveSentTimeRef.current = 0;

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
      entered_at: enteredAtIsoRef.current,
    });
  }, [pathname, searchParams, user?.id, emitPageLeave]);

  // Handle tab visibility change, pagehide, and window closure
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        // Tab minimized or visitor switched away: record page_leave
        emitPageLeave(now);
      } else if (document.visibilityState === "visible") {
        // Tab restored to view: reset dwell entry time so idle background time isn't counted
        enteredAtTimeRef.current = now;
        enteredAtIsoRef.current = new Date(now).toISOString();
        lastLeaveSentTimeRef.current = 0;
      }
    };

    const handlePageHide = () => {
      emitPageLeave(Date.now());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      emitPageLeave(Date.now());
    };
  }, [emitPageLeave]);

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
