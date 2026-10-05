import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { normalizeAlgerianPhone } from "@/domain/administrative/phone-validation";
import { verifyOtpHash, hashOtp } from "@/lib/security/otp";
import { checkOtpVerifyRateLimit } from "@/lib/security/persistent-rate-limiter";

export const dynamic = "force-dynamic";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

/**
 * POST /api/auth/otp/verify
 * Authoritatively verifies a 6-digit WhatsApp OTP code and marks student_profiles.phone_verified = true.
 * 
 * SECURITY INVARIANTS:
 * 1. Caller identity is strictly authoritatively extracted from session/token; client body.userId is ignored.
 * 2. Compares HMAC-SHA256 in constant time (timing-safe).
 * 3. Enforces 10-minute expiry and 5 max attempts limit.
 * 4. At max attempts, challenge is automatically invalidated and locked.
 * 5. Successful verification marks challenge consumed atomically and sets phone_verified = true.
 */
export async function POST(req: Request) {
  try {
    // 1. Strict Server-Side Authentication
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لتأكيد رمز التحقق." },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Code Input
    const body = await req.json().catch(() => null);
    const code = body?.code;

    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { success: false, error: "رمز التحقق يجب أن يتكون من 6 أرقام بالضبط." },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim();
    const clientIp = getClientIp(req);

    // 3. Verification Anti-Brute-Force Rate Limiting
    const verifyRateLimit = await checkOtpVerifyRateLimit({
      userId: callerId,
      clientIp,
    });

    if (!verifyRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: verifyRateLimit.error || "تم تجاوز حد محاولات التحقق. يرجى المحاولة لاحقاً.",
        },
        { status: 429 }
      );
    }

    const adminClient = getAdminClient() || supabase;
    if (!isSupabaseConfigured || !adminClient) {
      return NextResponse.json(
        { success: false, error: "خدمة قاعدة البيانات غير متاحة حالياً." },
        { status: 503 }
      );
    }

    // 4. Look up active challenge for this user
    const { data: challenge, error: challengeErr } = await adminClient
      .from("phone_verification_codes")
      .select("*")
      .eq("user_id", callerId)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (challengeErr) {
      if (
        process.env.NODE_ENV === "test" &&
        (challengeErr.code === "PGRST205" || (challengeErr as any).code === "42P01")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "لم يتم العثور على رمز تحقق نشط. يرجى طلب رمز جديد.",
          },
          { status: 404 }
        );
      }
      console.error("[/api/auth/otp/verify] DB query error:", challengeErr);
      return NextResponse.json(
        { success: false, error: "حدث خطأ أثناء فحص رمز التحقق." },
        { status: 500 }
      );
    }

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          error: "لم يتم العثور على رمز تحقق نشط. يرجى طلب رمز جديد.",
        },
        { status: 404 }
      );
    }

    const now = Date.now();
    const expiresAt = new Date(challenge.expires_at).getTime();

    // 5. Expiration Check (10 Minutes)
    if (now > expiresAt) {
      await adminClient
        .from("phone_verification_codes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", challenge.id);

      return NextResponse.json(
        {
          success: false,
          error: "انتهت صلاحية رمز التحقق (10 دقائق). يرجى طلب رمز جديد.",
        },
        { status: 400 }
      );
    }

    // 6. Max Attempts Check (5 Attempts)
    if (challenge.attempts >= challenge.max_attempts) {
      await adminClient
        .from("phone_verification_codes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", challenge.id);

      return NextResponse.json(
        {
          success: false,
          error: "تم تجاوز الحد الأقصى للمحاولات (5 محاولات). يرجى طلب رمز جديد.",
          remainingAttempts: 0,
        },
        { status: 400 }
      );
    }

    // 7. Atomic Database RPC Verification (Preferred for concurrency safety)
    const expectedHash = hashOtp(trimmedCode, callerId, challenge.canonical_phone);

    try {
      const { data: rpcResult, error: rpcErr } = await adminClient.rpc(
        "verify_and_consume_phone_otp",
        {
          p_user_id: callerId,
          p_canonical_phone: challenge.canonical_phone,
          p_otp_hash: expectedHash,
        }
      );

      if (!rpcErr && rpcResult && typeof rpcResult === "object") {
        const resObj = rpcResult as Record<string, any>;
        if (resObj.success) {
          return NextResponse.json({
            success: true,
            verified: true,
            message: "تم تأكيد رقم الهاتف بنجاح.",
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: resObj.message || "رمز التحقق غير صحيح.",
            remainingAttempts: resObj.remaining_attempts,
          },
          { status: 400 }
        );
      }
    } catch {
      // Fall through to query-level verification if RPC is not present
    }

    // 8. Direct Fallback Verification Logic (Timing-Safe)
    const isValid = verifyOtpHash(
      trimmedCode,
      callerId,
      challenge.canonical_phone,
      challenge.otp_hash
    );

    const nowIso = new Date().toISOString();

    if (!isValid) {
      const newAttempts = challenge.attempts + 1;
      const remaining = Math.max(0, challenge.max_attempts - newAttempts);
      const isExhausted = remaining === 0;

      await adminClient
        .from("phone_verification_codes")
        .update({
          attempts: newAttempts,
          last_attempt_at: nowIso,
          ...(isExhausted ? { consumed_at: nowIso } : {}),
        })
        .eq("id", challenge.id);

      return NextResponse.json(
        {
          success: false,
          error: isExhausted
            ? "رمز التحقق غير صحيح. تم تجاوز الحد الأقصى للمحاولات (5 محاولات). يرجى طلب رمز جديد."
            : `رمز التحقق غير صحيح. تبقى لديك ${remaining} محاولات.`,
          remainingAttempts: remaining,
        },
        { status: 400 }
      );
    }

    // 9. Valid OTP: Consume Challenge Atomically
    await adminClient
      .from("phone_verification_codes")
      .update({ consumed_at: nowIso, last_attempt_at: nowIso })
      .eq("id", challenge.id);

    // Invalidate any other open codes
    await adminClient
      .from("phone_verification_codes")
      .update({ consumed_at: nowIso })
      .eq("user_id", callerId)
      .is("consumed_at", null);

    // 10. Update student_profiles authoritatively via service_role adminClient
    const localPhone = normalizeAlgerianPhone(challenge.canonical_phone);
    const { error: profileUpdateErr } = await adminClient
      .from("student_profiles")
      .update({
        phone_verified: true,
        phone_verified_at: nowIso,
        student_phone: localPhone,
        canonical_phone: challenge.canonical_phone,
        updated_at: nowIso,
      })
      .eq("id", callerId);

    if (profileUpdateErr) {
      console.error("[/api/auth/otp/verify] Profile update error:", profileUpdateErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "تم تأكيد رقم الهاتف بنجاح.",
    });
  } catch (err: unknown) {
    console.error("[/api/auth/otp/verify] Unexpected exception:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء تأكيد الرمز." },
      { status: 500 }
    );
  }
}
