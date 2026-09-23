import { createClient } from "@supabase/supabase-js";
import { getAdminClient, isServiceRoleConfigured } from "./admin";

if (typeof window !== "undefined") {
  throw new Error("SECURITY VIOLATION: server.ts can only be executed in a Node.js server context.");
}

/**
 * Server-side Supabase client scaffolding for Route Handlers and Server Actions.
 */

const DEFAULT_SUPABASE_URL = "https://erbvmpnxufgeinqnshzu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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
 * Returns a privileged client using service_role key if available.
 * Does NOT masquerade anon key as admin.
 */
export function createAdminSupabaseClient() {
  return getAdminClient();
}

export { isServiceRoleConfigured };
