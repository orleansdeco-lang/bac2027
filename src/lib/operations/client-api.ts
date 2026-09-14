/**
 * BAC Mastery — Operations Center Authenticated Fetch Client
 * Ensures all client requests to /api/ops/* include the operator Bearer token and credentials.
 */

import { supabase } from "@/lib/supabase/client";

/**
 * Get current operator auth token from Supabase session, localStorage, or cookie
 */
export async function getOperatorToken(): Promise<string | null> {
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

      const rawAuth = localStorage.getItem("bac_auth_user");
      if (rawAuth) {
        const parsed = JSON.parse(rawAuth);
        if (parsed?.access_token) return parsed.access_token;
      }
    } catch {}
  }

  // 3. Check document cookie for ops_auth_token
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )ops_auth_token=([^;]*)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

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
