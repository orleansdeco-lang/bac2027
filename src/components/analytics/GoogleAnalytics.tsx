import Script from "next/script";

/**
 * SHATER — Google Analytics 4 (GA4) Root Integration Component
 * 
 * DESIGN SPECIFICATION:
 * - Next.js 14 App Router optimized with strategy="afterInteractive".
 * - Zero external package overhead (relies exclusively on native next/script).
 * - Measurement ID loaded strictly from environment variable NEXT_PUBLIC_GA_MEASUREMENT_ID.
 * - If the environment variable is not defined, renders null without error or script injection.
 * - Prevents duplicate tracking by leveraging GA4 Enhanced Measurement for client-side routing.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}
