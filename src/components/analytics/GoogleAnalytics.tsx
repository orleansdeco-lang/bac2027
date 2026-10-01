"use client";

import React, { useEffect, useRef, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview as trackGAPageview } from "@/lib/analytics/gtag";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function GoogleAnalyticsNavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !GA_ID) return;

    // Filter out internal operational routes
    if (pathname.startsWith("/ops") || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const currentKey = `${pathname}?${searchParams?.toString() || ""}`;
    if (lastTrackedKeyRef.current === currentKey) {
      return;
    }
    lastTrackedKeyRef.current = currentKey;

    trackGAPageview(currentKey);
  }, [pathname, searchParams]);

  return null;
}

/**
 * SHATER — Google Analytics 4 (GA4) Root Integration Component
 * 
 * INVARIANTS:
 * 1. Single Central Integration: Placed once in root layout.
 * 2. App Router Navigation: Tracks client transitions without duplicate initial hits.
 * 3. SSR & Guard Safe: If NEXT_PUBLIC_GA_MEASUREMENT_ID is not configured, renders null.
 * 4. Zero PII: Strictly anonymized high-level web telemetry.
 */
export function GoogleAnalytics() {
  if (!GA_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              send_page_view: false,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsNavigationTracker />
      </Suspense>
    </>
  );
}
