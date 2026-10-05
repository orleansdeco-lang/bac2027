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
 * Hashes an OTP code bound to a specific user and canonical phone using HMAC-SHA256 with OTP_PEPPER.
 * Resulting hash cannot be reversed or reused across different users or phone numbers.
 */
export function hashOtp(otp: string, userId: string, canonicalPhone: string): string {
  if (!otp || !userId || !canonicalPhone) {
    throw new Error("Missing required parameters for OTP hashing");
  }
  const pepper = getOtpPepper();
  const payload = `${userId.toLowerCase()}:${canonicalPhone.trim()}:${otp.trim()}`;
  return crypto.createHmac("sha256", pepper).update(payload).digest("hex");
}

/**
 * Compares a candidate OTP against a stored hash in constant time (timing-safe).
 */
export function verifyOtpHash(
  candidateOtp: string,
  userId: string,
  canonicalPhone: string,
  storedHash: string
): boolean {
  if (!candidateOtp || !userId || !canonicalPhone || !storedHash) {
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
 * Example: "+213555123456" -> "+2135***3456"
 * Example: "0555123456" -> "0555***3456"
 */
export function maskPhone(phone: string): string {
  if (!phone) return "****";
  const clean = phone.trim();
  if (clean.length < 8) return "****";
  const start = clean.slice(0, 5);
  const end = clean.slice(-4);
  return `${start}***${end}`;
}
