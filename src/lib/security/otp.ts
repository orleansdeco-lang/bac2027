/**
 * BAC Mastery — Server-Side Cryptographic OTP & Phone Verification Security
 * 
 * CRITICAL SECURITY INVARIANTS:
 * 1. Plaintext OTP codes are NEVER stored in database, logs, or API responses.
 * 2. OTP hashing uses HMAC-SHA256 bound to (userId, canonicalPhone, OTP) using a secret OTP_PEPPER.
 * 3. Timing-safe equality check prevents side-channel timing attacks.
 * 4. Production strictly requires process.env.OTP_PEPPER (fails fast if missing).
 * 5. Masks phone numbers in all logging and reporting.
 */

import crypto from "crypto";

export const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_COOLDOWN_SECONDS = 60;

/**
 * Retrieves the server-side pepper for HMAC OTP hashing.
 * In production, fails immediately if not configured.
 */
export function getOtpPepper(): string {
  const pepper = process.env.OTP_PEPPER;
  if (!pepper || pepper.trim().length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: OTP_PEPPER environment variable is missing in production."
      );
    }
    // Development / Test deterministic fallback pepper
    return "shater-dev-test-pepper-do-not-use-in-production-38f921";
  }
  return pepper;
}

/**
 * Generates a cryptographically secure 6-digit OTP.
 * Uses Node.js crypto.randomInt (uniform distribution, non-predictable).
 * Example output: "482910"
 */
export function generateOtp(): string {
  const codeInt = crypto.randomInt(100000, 1000000);
  return codeInt.toString();
}

/**
 * Hashes an OTP code bound to a specific user (or guest) and canonical phone using HMAC-SHA256 with OTP_PEPPER.
 * Resulting hash cannot be reversed or reused across different users or phone numbers.
 */
export function hashOtp(otp: string, userId: string | null | undefined, canonicalPhone: string): string {
  if (!otp || !canonicalPhone) {
    throw new Error("Missing required parameters for OTP hashing");
  }
  const pepper = getOtpPepper();
  const userKey = (userId || "guest").toLowerCase().trim();
  const payload = `${userKey}:${canonicalPhone.trim()}:${otp.trim()}`;
  return crypto.createHmac("sha256", pepper).update(payload).digest("hex");
}

/**
 * Compares a candidate OTP against a stored hash in constant time (timing-safe).
 */
export function verifyOtpHash(
  candidateOtp: string,
  userId: string | null | undefined,
  canonicalPhone: string,
  storedHash: string
): boolean {
  if (!candidateOtp || !canonicalPhone || !storedHash) {
    return false;
  }
  const computedHash = hashOtp(candidateOtp, userId, canonicalPhone);
  const candidateBuf = Buffer.from(computedHash, "utf-8");
  const storedBuf = Buffer.from(storedHash, "utf-8");

  if (candidateBuf.length !== storedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuf, storedBuf);
}

/**
 * Safely masks an Algerian phone number for logs and user notifications.
 * Never displays the full phone number in unauthenticated or public contexts.
 * Example: "+213555123456" -> "05 •• •• •• 56"
 * Example: "0555123456" -> "05 •• •• •• 56"
 */
export function maskPhone(phone: string): string {
  if (!phone) return "••••";
  const clean = phone.replace(/\D/g, "");
  // Convert 2135... to 05...
  let local = clean;
  if (local.startsWith("213") && local.length >= 11) {
    local = "0" + local.slice(3);
  } else if (!local.startsWith("0") && (local.startsWith("5") || local.startsWith("6") || local.startsWith("7"))) {
    local = "0" + local;
  }

  if (local.length === 10) {
    const prefix = local.slice(0, 2); // 05, 06, 07
    const suffix = local.slice(8);    // last 2 digits
    return `${prefix} •• •• •• ${suffix}`;
  }

  const start = phone.slice(0, 4);
  const end = phone.slice(-2);
  return `${start} •••• ${end}`;
}

/**
 * Formats Algerian phone into readable groups: 05 55 12 34 56
 */
export function formatAlgerianPhoneDisplay(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  let local = clean;
  if (local.startsWith("213") && local.length >= 11) {
    local = "0" + local.slice(3);
  }
  if (local.length === 10) {
    return `${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`;
  }
  return phone;
}
