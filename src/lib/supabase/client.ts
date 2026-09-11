import { createClient } from "@supabase/supabase-js";

/**
 * BAC Mastery - Supabase Client Scaffolding
 * Provides type-safe access to Supabase with graceful fallback when environment
 * variables are not yet configured (0 DZD local mode).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
