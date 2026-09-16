/**
 * BAC Mastery — Operations Center Authenticated Fetch Client
 * Ensures all client requests to /api/ops/* include the operator Bearer token and credentials.
 */

import { supabase } from "@/lib/supabase/client";

export async function getAuthToken(): Promise<string | null> {
  // 1. Check active Supabase session
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
    } catch {}
  }

  // 2. Check localStorage
  if (typeof window !== "undefined") {
    try {
      const directOpsToken = localStorage.getItem("ops_auth_token");
      if (directOpsToken) return directOpsToken;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes("-auth-token")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.access_token) return parsed.access_token;
            if (Array.isArray(parsed) && parsed[0]) return parsed[0];
          }
        }
      }

      const rawAuth = localStorage.getItem("bac_auth_user");
      if (rawAuth) {
        const parsed = JSON.parse(rawAuth);
        if (parsed?.access_token) return parsed.access_token;
      }
    } catch {}
  }

  // 3. Check document cookie for ops_auth_token or sb-access-token
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )ops_auth_token=([^;]*)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    const sbMatch = document.cookie.match(/(?:^|; )sb-access-token=([^;]*)/);
    if (sbMatch && sbMatch[1]) {
      return decodeURIComponent(sbMatch[1]);
    }
  }

  return null;
}

/**
 * Get current operator auth token (alias of getAuthToken)
 */
export const getOperatorToken = getAuthToken;

/**
 * Authenticated fetch helper for /api/ops endpoints
 */
export async function opsFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getOperatorToken();

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: "include", // Ensure cookies (ops_auth_token) are transmitted
  });
}
