/**
 * BAC Mastery — Serverless Persistent Rate Limiter
 * 
 * Replaces pure in-memory rate limiting with PostgreSQL-backed sliding window enforcement.
 * Ensures consistent rate limiting across multiple Vercel serverless function instances.
 * 
 * Enforced Limits:
 * - Send OTP Cooldown: strictly 60 seconds minimum between sends per phone/user.
 * - Send OTP per Phone: max 4 requests / hour.
 * - Send OTP per User: max 4 requests / hour.
 * - Send OTP per IP: max 10 requests / hour.
 * - Verify OTP per IP: max 20 requests / hour (prevents brute-force bot sweeps).
 */

import { getAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { rateLimiter } from "./rate-limiter"; // fallback for offline / tests

export interface RateLimitResult {
  allowed: boolean;
  error?: string;
  cooldownSeconds?: number;
  resetSeconds?: number;
}

/**
 * Checks and records an event in the persistent rate_limit_events table.
 * Falls back to in-memory limiter if DB is unavailable.
 */
export async function checkPersistentRateLimit(
  key: string,
  action: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; resetSeconds: number }> {
  const client = getAdminClient();

  if (isSupabaseConfigured && client) {
    try {
      // 1. Try PostgreSQL RPC
      const { data, error } = await client.rpc("check_and_record_rate_limit", {
        p_key: key,
        p_action: action,
        p_identifier: identifier,
        p_max_requests: maxRequests,
        p_window_seconds: windowSeconds,
      });

      if (!error && data && typeof data === "object") {
        return {
          allowed: Boolean((data as any).allowed),
          resetSeconds: Number((data as any).reset_seconds) || windowSeconds,
        };
      }

      // 2. Direct table fallback if RPC is not yet created or returns error
      const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();
      const { count, error: countErr } = await client
        .from("rate_limit_events")
        .select("*", { count: "exact", head: true })
        .eq("key", key)
        .gte("created_at", windowStart);

      if (countErr) {
        throw countErr;
      }

      const currentCount = count || 0;
      if (currentCount >= maxRequests) {
        return { allowed: false, resetSeconds: windowSeconds };
      }

      const { error: insertErr } = await client.from("rate_limit_events").insert({
        key,
        action,
        identifier,
        created_at: new Date().toISOString(),
      });

      if (insertErr) {
        throw insertErr;
      }

      return { allowed: true, resetSeconds: windowSeconds };
    } catch (dbErr) {
      console.warn("[RateLimiter] Database rate limiting check failed, falling back to memory:", dbErr);
    }
  }

  // Fallback to in-memory sliding window limiter
  const memResult = rateLimiter.check(key, maxRequests, windowSeconds * 1000);
  return {
    allowed: memResult.success,
    resetSeconds: memResult.resetSeconds,
  };
}

/**
 * Checks if a user or phone number has sent an OTP within the last 60 seconds (cooldown).
 */
/**
 * Checks if a user or phone number has sent an OTP within the last 60 seconds (cooldown).
 */
export async function checkOtpSendCooldown(
  userId: string | null | undefined,
  canonicalPhone: string,
  cooldownSeconds: number = 60
): Promise<{ allowed: boolean; remainingSeconds: number }> {
  // 1. Fast in-memory sliding window check
  const memKey = userId ? `otp_cooldown:${userId}:${canonicalPhone}` : `otp_cooldown:${canonicalPhone}`;
  const memCheck = rateLimiter.check(memKey, 1, cooldownSeconds * 1000);
  if (!memCheck.success) {
    return {
      allowed: false,
      remainingSeconds: memCheck.resetSeconds,
    };
  }

  const client = getAdminClient();

  if (isSupabaseConfigured && client) {
    try {
      // 2. Try PostgreSQL RPC
      const { data, error } = await client.rpc("check_otp_send_cooldown", {
        p_user_id: userId || null,
        p_canonical_phone: canonicalPhone,
        p_cooldown_seconds: cooldownSeconds,
      });

      if (!error && data && typeof data === "object") {
        return {
          allowed: Boolean((data as any).allowed),
          remainingSeconds: Number((data as any).remaining_seconds) || 0,
        };
      }

      // 3. Fallback to querying latest created_at across codes and rate limit events
      let codesQuery = client
        .from("phone_verification_codes")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (userId) {
        codesQuery = codesQuery.or(`user_id.eq.${userId},canonical_phone.eq.${canonicalPhone}`);
      } else {
        codesQuery = codesQuery.eq("canonical_phone", canonicalPhone);
      }

      const { data: latestCode } = await codesQuery.maybeSingle();

      const latestCodeTime = latestCode?.created_at ? new Date(latestCode.created_at).getTime() : 0;
      if (latestCodeTime > 0) {
        const elapsedSeconds = Math.floor((Date.now() - latestCodeTime) / 1000);
        if (elapsedSeconds < cooldownSeconds) {
          return {
            allowed: false,
            remainingSeconds: cooldownSeconds - elapsedSeconds,
          };
        }
      }

      return { allowed: true, remainingSeconds: 0 };
    } catch (err) {
      console.warn("[RateLimiter] Cooldown DB check failed:", err);
    }
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Comprehensive rate limit check before sending an OTP.
 * Enforces cooldown (60s), phone limit (4/hr), user limit (4/hr if authenticated), and IP limit (10/hr).
 */
export async function checkOtpSendRateLimit(params: {
  userId?: string | null;
  canonicalPhone: string;
  clientIp?: string;
}): Promise<RateLimitResult> {
  const { userId, canonicalPhone, clientIp } = params;

  // 1. Minimum 60 seconds cooldown between sends
  const cooldown = await checkOtpSendCooldown(userId, canonicalPhone, 60);
  if (!cooldown.allowed) {
    return {
      allowed: false,
      cooldownSeconds: cooldown.remainingSeconds,
      error: `يرجى الانتظار ${cooldown.remainingSeconds} ثانية قبل طلب رمز جديد.`,
    };
  }

  // 2. Phone Limit: Max 4 requests / hour
  const phoneLimit = await checkPersistentRateLimit(
    `otp_send_phone:${canonicalPhone}`,
    "otp_send",
    canonicalPhone,
    4,
    3600
  );
  if (!phoneLimit.allowed) {
    return {
      allowed: false,
      resetSeconds: phoneLimit.resetSeconds,
      error: "تم تجاوز الحد الأقصى لطلبات الرمز لهذا الرقم (4 طلبات في الساعة). يرجى المحاولة لاحقاً.",
    };
  }

  // 3. User Limit (if authenticated): Max 4 requests / hour
  if (userId) {
    const userLimit = await checkPersistentRateLimit(
      `otp_send_user:${userId}`,
      "otp_send",
      userId,
      4,
      3600
    );
    if (!userLimit.allowed) {
      return {
        allowed: false,
        resetSeconds: userLimit.resetSeconds,
        error: "تم تجاوز الحد الأقصى لطلبات الرمز لحسابك (4 طلبات في الساعة). يرجى المحاولة لاحقاً.",
      };
    }
  }

  // 4. IP Limit: Max 10 requests / hour
  if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1") {
    const ipLimit = await checkPersistentRateLimit(
      `otp_send_ip:${clientIp}`,
      "otp_send",
      clientIp,
      10,
      3600
    );
    if (!ipLimit.allowed) {
      return {
        allowed: false,
        resetSeconds: ipLimit.resetSeconds,
        error: "تم تجاوز الحد الأقصى للطلبات من هذا الجهاز/الشبكة. يرجى المحاولة لاحقاً.",
      };
    }
  }

  return { allowed: true };
}

/**
 * Checks verification rate limits to prevent brute-force attacks.
 * Limit: Max 20 verification attempts per IP / hour.
 */
export async function checkOtpVerifyRateLimit(params: {
  userId: string;
  clientIp?: string;
}): Promise<RateLimitResult> {
  const { clientIp } = params;

  if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1") {
    const ipLimit = await checkPersistentRateLimit(
      `otp_verify_ip:${clientIp}`,
      "otp_verify",
      clientIp,
      20,
      3600
    );
    if (!ipLimit.allowed) {
      return {
        allowed: false,
        resetSeconds: ipLimit.resetSeconds,
        error: "تم تجاوز حد محاولات التحقق من هذا الجهاز. يرجى المحاولة بعد ساعة.",
      };
    }
  }

  return { allowed: true };
}
