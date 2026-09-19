import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client scaffolding for Route Handlers and Server Actions.
 */

const DEFAULT_SUPABASE_URL = "https://erbvmpnxufgeinqnshzu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function createServerSupabaseClient(token?: string | null) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Returns a privileged client using service_role key if available, otherwise anon client.
 */
export function createAdminSupabaseClient() {
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    return null;
  }
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}
