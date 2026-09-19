/**
 * SHATER — Google Analytics 4 (GA4) Integration & Helper Foundation
 * 
 * DESIGN & PRIVACY PRINCIPLES:
 * 1. ZERO PII: Never send full names, phone numbers, emails, passwords, tokens,
 *    student answers, notebook content, uploaded files, or Supabase UUIDs to GA4.
 * 2. SEPARATION OF CONCERNS: GA4 is strictly reserved for traffic, acquisition,
 *    page views, and high-level marketing analytics. Detailed pedagogical learning
 *    data remains in Supabase.
 * 3. SSR & Guard Safe: All utilities verify environment and window.gtag presence.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Checks whether Google Analytics is active and accessible in the client environment
 */
export function isGAEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    Boolean(GA_MEASUREMENT_ID)
  );
}

/**
 * Sanitizes event parameters to strictly strip PII and pedagogical learner data
 */
function sanitizeGAParams(params: Record<string, unknown>): Record<string, unknown> {
  const forbiddenKeywords = new Set([
    "email",
    "password",
    "token",
    "jwt",
    "secret",
    "auth",
    "phone",
    "telephone",
    "fullname",
    "name",
    "userid",
    "user_id",
    "studentid",
    "student_id",
    "supabase_id",
    "answer",
    "answers",
    "solution",
    "notebook",
    "file",
    "upload",
  ]);

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    if (forbiddenKeywords.has(lowerKey)) continue;

    // Check for stringified tokens or emails
    if (typeof value === "string") {
      if (value.includes("@") && value.includes(".")) continue; // Email pattern
      if (/bearer\s+/i.test(value)) continue; // Bearer token
      if (value.length > 200) continue; // Long text / notes
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Tracks a page view in GA4 (used if manual dispatch is ever required)
 */
export function pageview(url: string): void {
  if (!isGAEnabled() || !GA_MEASUREMENT_ID) return;

  try {
    window.gtag!("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  } catch {
    // Gracefully ignore telemetry error in production
  }
}

/**
 * Tracks a safe web marketing or high-level navigation event in GA4
 */
export function trackGAEvent(
  action: string,
  params: Record<string, unknown> = {}
): void {
  if (!isGAEnabled()) return;

  try {
    const cleanParams = sanitizeGAParams(params);
    window.gtag!("event", action, cleanParams);
  } catch {
    // Gracefully ignore telemetry error in production
  }
}
