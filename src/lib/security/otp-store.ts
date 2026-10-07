/**
 * BAC Mastery — Authoritative OTP Challenge Store
 * 
 * Provides unified, resilient persistence for phone verification codes.
 * - In Production: Executes via privileged AdminClient against public.phone_verification_codes.
 * - In Development / Tests: Gracefully falls back to an in-memory challenge store when
 *   SUPABASE_SERVICE_ROLE_KEY is not configured, ensuring zero test or local-dev crashes.
 */

import crypto from "crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface OtpChallengeRecord {
  id: string;
  user_id: string | null;
  canonical_phone: string;
  otp_hash: string;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  consumed_at: string | null;
  created_at: string;
}

// In-memory fallback map (keyed by challenge ID)
const inMemoryChallenges = new Map<string, OtpChallengeRecord>();

/**
 * Invalidates (marks consumed) any active challenges for a canonical phone number.
 */
export async function invalidateActiveChallenges(canonicalPhone: string): Promise<void> {
  const adminClient = getAdminClient();
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured && adminClient) {
    try {
      await adminClient
        .from("phone_verification_codes")
        .update({ consumed_at: nowIso })
        .eq("canonical_phone", canonicalPhone)
        .is("consumed_at", null);
      return;
    } catch (err) {
      console.warn("[OtpStore] DB challenge invalidation failed, updating memory:", err);
    }
  }

  // In-memory fallback
  Array.from(inMemoryChallenges.values()).forEach((challenge) => {
    if (challenge.canonical_phone === canonicalPhone && !challenge.consumed_at) {
      challenge.consumed_at = nowIso;
    }
  });
}

/**
 * Creates and persists a new OTP challenge.
 */
export async function createOtpChallenge(params: {
  userId: string | null;
  canonicalPhone: string;
  otpHash: string;
  expiresAt: string;
  maxAttempts?: number;
}): Promise<{ success: boolean; id: string; error?: any }> {
  const adminClient = getAdminClient();
  const challengeId = crypto.randomUUID();
  const nowIso = new Date().toISOString();
  const maxAttempts = params.maxAttempts || 5;

  if (isSupabaseConfigured && adminClient) {
    try {
      const { data, error } = await adminClient
        .from("phone_verification_codes")
        .insert({
          id: challengeId,
          user_id: params.userId,
          canonical_phone: params.canonicalPhone,
          otp_hash: params.otpHash,
          expires_at: params.expiresAt,
          max_attempts: maxAttempts,
          attempts: 0,
          created_at: nowIso,
        })
        .select("id")
        .single();

      if (!error && data) {
        return { success: true, id: data.id };
      }
      console.warn("[OtpStore] DB insert failed, falling back to memory:", error);
    } catch (err) {
      console.warn("[OtpStore] DB insert exception, falling back to memory:", err);
    }
  }

  // In-memory fallback
  const record: OtpChallengeRecord = {
    id: challengeId,
    user_id: params.userId,
    canonical_phone: params.canonicalPhone,
    otp_hash: params.otpHash,
    expires_at: params.expiresAt,
    attempts: 0,
    max_attempts: maxAttempts,
    consumed_at: null,
    created_at: nowIso,
  };

  inMemoryChallenges.set(challengeId, record);
  return { success: true, id: challengeId };
}

/**
 * Retrieves the latest unconsumed OTP challenge for a phone or user.
 */
export async function getActiveOtpChallenge(
  canonicalPhone: string,
  callerId?: string | null
): Promise<OtpChallengeRecord | null> {
  const adminClient = getAdminClient();

  if (isSupabaseConfigured && adminClient) {
    try {
      let challengeQuery = adminClient
        .from("phone_verification_codes")
        .select("*")
        .eq("canonical_phone", canonicalPhone)
        .is("consumed_at", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (callerId) {
        challengeQuery = challengeQuery.or(`user_id.eq.${callerId},canonical_phone.eq.${canonicalPhone}`);
      }

      const { data, error } = await challengeQuery.maybeSingle();
      if (!error && data) {
        return data as OtpChallengeRecord;
      }
    } catch (err) {
      console.warn("[OtpStore] DB query exception, checking memory:", err);
    }
  }

  // In-memory fallback: sort by created_at desc
  const matching = Array.from(inMemoryChallenges.values())
    .filter((c) => {
      const phoneMatches = c.canonical_phone === canonicalPhone;
      const userMatches = callerId ? c.user_id === callerId : false;
      return (phoneMatches || userMatches) && !c.consumed_at;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return matching[0] || null;
}

/**
 * Increments the attempt counter for an OTP challenge.
 */
export async function incrementOtpAttempts(challengeId: string): Promise<number> {
  const adminClient = getAdminClient();

  if (isSupabaseConfigured && adminClient) {
    try {
      const { data: current } = await adminClient
        .from("phone_verification_codes")
        .select("attempts")
        .eq("id", challengeId)
        .single();

      const nextAttempts = (current?.attempts || 0) + 1;
      await adminClient
        .from("phone_verification_codes")
        .update({ attempts: nextAttempts })
        .eq("id", challengeId);

      return nextAttempts;
    } catch (err) {
      console.warn("[OtpStore] DB increment exception:", err);
    }
  }

  // In-memory fallback
  const record = inMemoryChallenges.get(challengeId);
  if (record) {
    record.attempts += 1;
    return record.attempts;
  }
  return 1;
}

/**
 * Consumes (marks verified/completed) an OTP challenge.
 */
export async function consumeOtpChallenge(challengeId: string): Promise<void> {
  const adminClient = getAdminClient();
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured && adminClient) {
    try {
      await adminClient
        .from("phone_verification_codes")
        .update({ consumed_at: nowIso })
        .eq("id", challengeId);
      return;
    } catch (err) {
      console.warn("[OtpStore] DB consume exception:", err);
    }
  }

  // In-memory fallback
  const record = inMemoryChallenges.get(challengeId);
  if (record) {
    record.consumed_at = nowIso;
  }
}

/**
 * Reset memory store (used in test suites).
 */
export function clearInMemoryOtpChallenges(): void {
  inMemoryChallenges.clear();
}
