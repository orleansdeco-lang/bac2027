"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

export interface LandingUtmParams {
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
}

const STORAGE_KEY = "shater_landing_attribution";

export function useLandingUtm(defaultSource: string = "lp_main") {
  const [params, setParams] = useState<LandingUtmParams>({ source: defaultSource });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Read existing attribution from storage if available
      let stored: LandingUtmParams = {};
      const rawStored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (rawStored) {
        try {
          stored = JSON.parse(rawStored);
        } catch {
          // ignore corrupted data
        }
      }

      // 2. Read new query params directly from window.location
      const searchParams = new URLSearchParams(window.location.search);
      const qSource = searchParams.get("source") || undefined;
      const qUtmSource = searchParams.get("utm_source") || undefined;
      const qUtmMedium = searchParams.get("utm_medium") || undefined;
      const qUtmCampaign = searchParams.get("utm_campaign") || undefined;
      const qUtmTerm = searchParams.get("utm_term") || undefined;
      const qUtmContent = searchParams.get("utm_content") || undefined;
      const qRef = searchParams.get("ref") || undefined;

      const merged: LandingUtmParams = {
        source: qSource || stored.source || defaultSource,
        utm_source: qUtmSource || stored.utm_source,
        utm_medium: qUtmMedium || stored.utm_medium,
        utm_campaign: qUtmCampaign || stored.utm_campaign,
        utm_term: qUtmTerm || stored.utm_term,
        utm_content: qUtmContent || stored.utm_content,
        ref: qRef || stored.ref,
      };

      setParams(merged);

      // Save to sessionStorage and localStorage for multi-page persistence
      const serialized = JSON.stringify(merged);
      sessionStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(STORAGE_KEY, serialized);

      // If ref is present, also store pending referral code
      if (merged.ref) {
        localStorage.setItem("shater_pending_referral_code", merged.ref.trim().toUpperCase());
      }
    } catch {
      // Graceful fallback for SSR or restricted storage environments
    }
  }, [defaultSource]);

  /**
   * Helper to build a CTA URL containing all preserved UTM and source params
   */
  const buildAuthUrl = useCallback(
    (
      basePath: string = "/auth",
      options: {
        mode?: "signup" | "login";
        redirectTo?: string;
        customSource?: string;
      } = {}
    ) => {
      const { mode = "signup", redirectTo, customSource } = options;
      const url = new URL(basePath, "https://shater-bac.dz");
      url.searchParams.set("mode", mode);

      const effectiveSource = customSource || params.source || defaultSource;
      if (effectiveSource) {
        url.searchParams.set("source", effectiveSource);
      }

      if (params.utm_source) url.searchParams.set("utm_source", params.utm_source);
      if (params.utm_medium) url.searchParams.set("utm_medium", params.utm_medium);
      if (params.utm_campaign) url.searchParams.set("utm_campaign", params.utm_campaign);
      if (params.utm_term) url.searchParams.set("utm_term", params.utm_term);
      if (params.utm_content) url.searchParams.set("utm_content", params.utm_content);
      if (params.ref) url.searchParams.set("ref", params.ref);

      if (redirectTo) {
        url.searchParams.set("redirectTo", redirectTo);
      }

      // Return relative pathname + search
      return `${url.pathname}${url.search}`;
    },
    [params, defaultSource]
  );

  return {
    params,
    buildAuthUrl,
  };
}
