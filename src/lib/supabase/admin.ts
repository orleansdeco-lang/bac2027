/**
 * BAC Mastery — Server-Only Authoritative Supabase Client
 * 
 * CRITICAL SECURITY INVARIANTS:
 * 1. This file is STRICTLY server-only. Any attempt to import in browser throws immediately.
 * 2. SUPABASE_SERVICE_ROLE_KEY must NEVER be prefixed with NEXT_PUBLIC_.
 * 3. Never masquerade anon key as admin. If service_role key is missing, return null or throw.
 */

import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("SECURITY VIOLATION: Admin Supabase client cannot be executed in browser context.");
}

const DEFAULT_SUPABASE_URL = "https://erbvmpnxufgeinqnshzu.supabase.co";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isServiceRoleConfigured = Boolean(serviceRoleKey && serviceRoleKey.length > 20);

/**
 * Returns a privileged Supabase client powered by the service_role secret key.
 * Bypasses RLS policies and executes authoritative platform operations.
 */
export function getAdminClient() {
  if (!serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
