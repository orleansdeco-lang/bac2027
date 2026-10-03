import { createClient } from "@supabase/supabase-js";

/**
 * BAC Mastery - Supabase Client Scaffolding
 * Provides type-safe access to Supabase with graceful fallback when environment
 * variables are not yet configured (0 DZD local mode).
 */

const DEFAULT_SUPABASE_URL = "https://erbvmpnxufgeinqnshzu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured && typeof createClient === "function"
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Validates whether a token string is a structurally sound, non-expired Supabase JWT.
 * Prevents PostgREST PGRST301 errors ("Expected 3 parts in JWT; got 1" or "JWT expired")
 * when operator cookies (e.g. "ops_operator") or expired session tokens are passed.
 */
export function isValidSupabaseJwt(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.trim().split(".");
  if (parts.length !== 3) return false;
  try {
    const payloadPart = parts[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = typeof atob === "function"
      ? atob(base64)
      : Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(jsonStr);
    if (payload && typeof payload.exp === "number") {
      // Check expiration
      if (payload.exp * 1000 <= Date.now()) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates an authenticated Supabase client using an operator/student Bearer token.
 * Passes the Authorization header so RLS policies and SECURITY DEFINER RPCs evaluate auth.uid().
 * If token is missing, not a valid JWT, or expired, falls back to standard supabase client
 * so that PostgREST queries and SECURITY DEFINER RPCs succeed without PGRST301 rejection.
 */
export function createAuthenticatedSupabaseClient(token?: string | null) {
  if (!isSupabaseConfigured || typeof createClient !== "function") return null;
  if (!token || !isValidSupabaseJwt(token)) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

