"use client";

import React, { useEffect, useRef, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaPageView, trackMetaEvent, trackMetaCustomEvent, isMetaPixelEnabled } from "@/lib/analytics/meta";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Listens to Next.js App Router route transitions and dispatches single, deduplicated PageViews
 */
function MetaPixelNavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !PIXEL_ID) return;

    // Filter out internal operational routes
    if (pathname.startsWith("/ops") || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const currentKey = `${pathname}?${searchParams?.toString() || ""}`;
    if (lastTrackedKeyRef.current === currentKey) {
      return; // Deduplicate Strict Mode / identical re-renders
    }
    lastTrackedKeyRef.current = currentKey;

    // Dispatch PageView
    trackMetaPageView();
  }, [pathname, searchParams]);

  return null;
}

/**
 * SHATER — Meta Pixel Root Integration Component
 * 
 * INVARIANTS:
 * 1. Single Central Integration: Placed once in root layout.
 * 2. Next.js 14 App Router Compatible: Tracks client-side navigation without duplicates.
 * 3. SSR & Guard Safe: If NEXT_PUBLIC_META_PIXEL_ID is not configured, renders null.
 * 4. Non-blocking: Uses strategy="afterInteractive" to preserve Core Web Vitals.
 */
export function MetaPixel() {
  if (!PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
          `,
        }}
      />
      <Suspense fallback={null}>
        <MetaPixelNavigationTracker />
      </Suspense>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Re-export helpers for backward compatibility
export { trackMetaEvent, trackMetaCustomEvent, isMetaPixelEnabled };
