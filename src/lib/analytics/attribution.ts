/**
 * SHATER — First-Party Acquisition Attribution
 * 
 * Classifies traffic sources into meaningful marketing channels.
 * Preserves original acquisition intent by filtering out internal traffic.
 */

export type ChannelType = 
  | "direct"
  | "organic_search"
  | "social"
  | "paid_social"
  | "paid_search"
  | "referral"
  | "telegram"
  | "unknown";

const SEARCH_ENGINES = ["google.", "bing.", "yahoo.", "duckduckgo.", "yandex.", "ecosia.", "ask."];
const SOCIAL_NETWORKS = ["facebook.", "fb.me", "instagram.", "tiktok.", "twitter.", "t.co", "x.com", "linkedin.", "lnkd.in", "snapchat.", "pinterest."];
const INTERNAL_DOMAINS = ["shater.dz", "localhost", "127.0.0.1"];

/**
 * Checks if a given referrer URL is internal to the SHATER platform.
 */
export function isInternalReferrer(referrer: string | null | undefined): boolean {
  if (!referrer) return false;
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    return INTERNAL_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    // If it can't be parsed as a URL, treat as external/unknown
    return false;
  }
}

/**
 * Extracts the domain from a referrer URL.
 */
export function extractDomain(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Classifies a visit into a standardized marketing channel.
 */
export function classifyChannel(
  source: string | null | undefined,
  medium: string | null | undefined,
  referrer: string | null | undefined
): ChannelType {
  const s = (source || "").toLowerCase();
  const m = (medium || "").toLowerCase();
  const r = referrer ? extractDomain(referrer) || "" : "";

  // 1. Paid Search (Google Ads, Bing Ads)
  if (m === "cpc" || m === "ppc" || m === "paidsearch") {
    if (SEARCH_ENGINES.some(se => s.includes(se.replace(".", "")) || r.includes(se))) {
      return "paid_search";
    }
    // If CPC but not search engine, might be paid social or display. Check social.
    if (SOCIAL_NETWORKS.some(sn => s.includes(sn.replace(".", "")) || r.includes(sn))) {
      return "paid_social";
    }
  }

  // 2. Paid Social (Meta Ads, TikTok Ads)
  if (m === "paidsocial" || m === "paid_social" || m === "cpa" || (m === "cpc" && SOCIAL_NETWORKS.some(sn => s.includes(sn.replace(".", "")) || r.includes(sn)))) {
    return "paid_social";
  }

  // 3. Telegram (Common enough to get its own channel in Algeria)
  if (s.includes("telegram") || m.includes("telegram") || r.includes("telegram.org") || r.includes("t.me")) {
    return "telegram";
  }

  // 4. Organic Social
  if (m === "social" || m === "social-network" || m === "social-media" || SOCIAL_NETWORKS.some(sn => s.includes(sn.replace(".", "")) || r.includes(sn))) {
    return "social";
  }

  // 5. Organic Search
  if (m === "organic" || SEARCH_ENGINES.some(se => s.includes(se.replace(".", "")) || r.includes(se))) {
    return "organic_search";
  }

  // 6. Referral
  if (m === "referral" || (r && !INTERNAL_DOMAINS.some(id => r === id || r.endsWith(`.${id}`)))) {
    return "referral";
  }

  // 7. Direct / Internal (No UTMs, no external referrer)
  if (!s && !m && (!r || isInternalReferrer(referrer))) {
    return "direct";
  }

  // Fallback
  return "unknown";
}
