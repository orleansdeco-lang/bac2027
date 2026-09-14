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
 * Creates an authenticated Supabase client using an operator/student Bearer token.
 * Passes the Authorization header so RLS policies and SECURITY DEFINER RPCs evaluate auth.uid().
 */
export function createAuthenticatedSupabaseClient(token?: string | null) {
  if (!isSupabaseConfigured || typeof createClient !== "function") return null;
  if (!token) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

