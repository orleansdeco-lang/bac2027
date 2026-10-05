import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  validateAlgerianPhone,
  toCanonicalAlgerianPhone,
  normalizeAlgerianPhone,
} from "@/domain/administrative/phone-validation";
import {
  generateOtp,
  hashOtp,
  OTP_EXPIRATION_MS,
  OTP_MAX_ATTEMPTS,
  OTP_COOLDOWN_SECONDS,
  maskPhone,
} from "@/lib/security/otp";
import { checkOtpSendRateLimit } from "@/lib/security/persistent-rate-limiter";
import { getWhatsAppProvider } from "@/lib/whatsapp/provider";

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
 * POST /api/auth/otp/send
 * Dispatches a server-generated 6-digit WhatsApp OTP to the authenticated student's phone.
 * 
 * SECURITY INVARIANTS:
 * 1. Caller identity is strictly authoritatively extracted from session/token; client body.userId is ignored.
 * 2. Enforces phone number format (must be Algerian mobile: 05, 06, 07).
 * 3. Enforces persistent rate limiting (60s cooldown, 4/hr/phone, 4/hr/user, 10/hr/IP).
 * 4. Invalidates any existing active challenge for this user/phone before inserting a new one.
 * 5. OTP is hashed using HMAC-SHA256 with server-side OTP_PEPPER. Plaintext OTP is NEVER stored.
 * 6. Plaintext OTP is NEVER returned in response or leaked in stdout.
 */
export async function POST(req: Request) {
  try {
    // 1. Strict Server-Side Authentication
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لطلب رمز التحقق." },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Input Phone
    const body = await req.json().catch(() => null);
    const phoneInput = body?.phone;

    if (!phoneInput || typeof phoneInput !== "string") {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال رقم الهاتف." },
        { status: 400 }
      );
    }

    const validation = validateAlgerianPhone(phoneInput);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error_ar || "رقم الهاتف غير صالح." },
        { status: 400 }
      );
    }

    const localPhone = normalizeAlgerianPhone(phoneInput);
    // WhatsApp OTP requires mobile line (05, 06, 07)
    if (!/^(05|06|07)\d{8}$/.test(localPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: "رمز التحقق عبر واتساب متاح فقط لأرقام الهاتف المحمولة (05 / 06 / 07).",
        },
        { status: 400 }
      );
    }

    const canonicalPhone = toCanonicalAlgerianPhone(phoneInput);
    const clientIp = getClientIp(req);

    const client = getAdminClient() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json(
        { success: false, error: "خدمة قاعدة البيانات غير متاحة حالياً." },
        { status: 503 }
      );
    }

    // 3. Uniqueness Check against already verified profiles (Anti-Enumeration Guard)
    const { data: existingVerified, error: checkError } = await client
      .from("student_profiles")
      .select("id")
      .neq("id", callerId)
      .eq("phone_verified", true)
      .or(`canonical_phone.eq.${canonicalPhone},student_phone.eq.${localPhone}`)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.warn("[/api/auth/otp/send] Uniqueness check DB error:", checkError.message);
    }

    if (existingVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "رقم الهاتف هذا مسجل ومؤكد بالفعل في حساب آخر. يرجى تسجيل الدخول بحسابك السابق.",
        },
        { status: 409 }
      );
    }

    // 4. Persistent Rate Limiting & Cooldown Guard
    const rateLimit = await checkOtpSendRateLimit({
      userId: callerId,
      canonicalPhone,
      clientIp,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimit.error || "تم تجاوز حد الطلبات المسموح به. يرجى الانتظار.",
          cooldownSeconds: rateLimit.cooldownSeconds || 60,
        },
        { status: 429 }
      );
    }

    // 5. Invalidate Any Previous Active Challenge for this user/phone
    const nowIso = new Date().toISOString();
    await client
      .from("phone_verification_codes")
      .update({ consumed_at: nowIso })
      .or(`user_id.eq.${callerId},canonical_phone.eq.${canonicalPhone}`)
      .is("consumed_at", null);

    // 6. Cryptographically Generate & Hash OTP
    const rawOtp = generateOtp();
    const otpHash = hashOtp(rawOtp, callerId, canonicalPhone);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();

    // 7. Persist OTP Challenge (Only HMAC hash is stored)
    const { error: insertError } = await client
      .from("phone_verification_codes")
      .insert({
        user_id: callerId,
        canonical_phone: canonicalPhone,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        max_attempts: OTP_MAX_ATTEMPTS,
        created_at: nowIso,
      });

    if (insertError) {
      console.error("[/api/auth/otp/send] Failed to persist OTP challenge:", insertError);
      return NextResponse.json(
        { success: false, error: "تعذر إنشاء رمز التحقق. يرجى إعادة المحاولة." },
        { status: 500 }
      );
    }

    // 8. Dispatch OTP via WhatsApp Provider Abstraction
    const provider = getWhatsAppProvider();
    const sendResult = await provider.sendOtp({
      phone: canonicalPhone,
      code: rawOtp,
    });

    if (!sendResult.success) {
      console.error(
        `[/api/auth/otp/send] WhatsApp dispatch failed for recipient=${maskPhone(canonicalPhone)}:`,
        sendResult.error
      );

      // Invalidate the unused challenge so user isn't locked out by a failed send
      await client
        .from("phone_verification_codes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("user_id", callerId)
        .eq("canonical_phone", canonicalPhone)
        .is("consumed_at", null);

      return NextResponse.json(
        {
          success: false,
          error: "تعذر إرسال رمز التحقق عبر واتساب حالياً. يرجى التأكد من الرقم أو المحاولة بعد لحظات.",
        },
        { status: 502 }
      );
    }

    // 9. Return Safe Response (Plaintext OTP is NEVER leaked)
    return NextResponse.json({
      success: true,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
      message: "تم إرسال رمز التحقق بنجاح عبر واتساب.",
    });
  } catch (err: unknown) {
    console.error("[/api/auth/otp/send] Unexpected exception:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
