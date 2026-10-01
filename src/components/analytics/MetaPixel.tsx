"use client";

import Script from "next/script";

/**
 * SHATER — Meta Pixel (Facebook Ads) Integration
 * 
 * DESIGN SPECIFICATION:
 * - Next.js App Router optimized using Next/Script strategy="afterInteractive".
 * - Only active if NEXT_PUBLIC_META_PIXEL_ID is defined.
 * - Dispatches PageView and enables standard event tracking for ads.
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (!pixelId) {
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
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Helper to dispatch standard Meta Pixel conversion events
 */
export function trackMetaEvent(
  eventName: "CompleteRegistration" | "Lead" | "Purchase" | "InitiateCheckout" | "ViewContent",
  params: Record<string, any> = {}
) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    try {
      (window as any).fbq("track", eventName, params);
    } catch {}
  }
}
