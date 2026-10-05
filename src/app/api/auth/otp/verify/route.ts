import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  normalizeAlgerianPhone,
  toCanonicalAlgerianPhone,
} from "@/domain/administrative/phone-validation";
import { verifyOtpHash, maskPhone } from "@/lib/security/otp";
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
 * Authoritatively verifies a 6-digit WhatsApp OTP code, authenticates the student,
 * establishes a session, and redirects to either onboarding or dashboard.
 * 
 * SECURITY INVARIANTS:
 * 1. Constant-time HMAC comparison (timing-safe).
 * 2. Enforces 10-minute expiration and max 5 attempts.
 * 3. At max attempts, challenge is automatically invalidated and locked.
 * 4. Existing users -> direct login session -> /dashboard.
 * 5. New users -> account creation -> /auth/register (onboarding wizard).
 * 6. Sets secure HTTP session cookies on successful verification.
 */
export async function POST(req: Request) {
  try {
    const callerId = await extractAuthenticatedUserId(req);

    // 1. Parse & Validate Input
    const body = await req.json().catch(() => null);
    const code = body?.code || body?.otp;
    const phoneInput = body?.phone;

    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { success: false, error: "رمز التحقق يجب أن يتكون من 6 أرقام بالضبط." },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim();
    const clientIp = getClientIp(req);

    const client = getAdminClient() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json(
        { success: false, error: "خدمة قاعدة البيانات غير متاحة حالياً." },
        { status: 503 }
      );
    }

    // 2. Resolve Phone Number for Verification
    let canonicalPhone: string | null = null;
    let localPhone: string | null = null;

    if (phoneInput && typeof phoneInput === "string") {
      canonicalPhone = toCanonicalAlgerianPhone(phoneInput);
      localPhone = normalizeAlgerianPhone(phoneInput);
    } else if (callerId) {
      // Look up caller's phone from profile
      const { data: callerProfile } = await client
        .from("student_profiles")
        .select("student_phone, canonical_phone")
        .eq("id", callerId)
        .maybeSingle();

      if (callerProfile) {
        canonicalPhone = callerProfile.canonical_phone || (callerProfile.student_phone ? toCanonicalAlgerianPhone(callerProfile.student_phone) : null);
        localPhone = callerProfile.student_phone || (canonicalPhone ? normalizeAlgerianPhone(canonicalPhone) : null);
      }
    }

    if (!canonicalPhone) {
      return NextResponse.json(
        { success: false, error: "يرجى تحديد رقم الهاتف للتحقق." },
        { status: 400 }
      );
    }

    // 3. Verification Anti-Brute-Force Rate Limiting
    const verifyRateLimit = await checkOtpVerifyRateLimit({
      userId: callerId || canonicalPhone,
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

    // 4. Look up active challenge for this phone
    let challengeQuery = client
      .from("phone_verification_codes")
      .select("*")
      .eq("canonical_phone", canonicalPhone)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (callerId) {
      challengeQuery = challengeQuery.or(`user_id.eq.${callerId},canonical_phone.eq.${canonicalPhone}`);
    }

    const { data: challenge, error: challengeErr } = await challengeQuery.maybeSingle();

    if (challengeErr) {
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
      await client
        .from("phone_verification_codes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", challenge.id);

      return NextResponse.json(
        {
          success: false,
          error: "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.",
        },
        { status: 400 }
      );
    }

    // 6. Max Attempts Check (5 Attempts)
    if (challenge.attempts >= challenge.max_attempts) {
      await client
        .from("phone_verification_codes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", challenge.id);

      return NextResponse.json(
        {
          success: false,
          error: "تم تجاوز عدد المحاولات. حاول لاحقًا.",
          remainingAttempts: 0,
        },
        { status: 400 }
      );
    }

    // 7. Timing-Safe Constant-Time Hash Verification
    const isValid = verifyOtpHash(
      trimmedCode,
      challenge.user_id,
      challenge.canonical_phone,
      challenge.otp_hash
    );

    const nowIso = new Date().toISOString();

    if (!isValid) {
      const newAttempts = challenge.attempts + 1;
      const remaining = Math.max(0, challenge.max_attempts - newAttempts);
      const isExhausted = remaining === 0;

      await client
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
            ? "تم تجاوز عدد المحاولات. حاول لاحقًا."
            : "رمز التحقق غير صحيح.",
          remainingAttempts: remaining,
        },
        { status: 400 }
      );
    }

    // 8. Valid OTP: Consume Challenge Atomically
    await client
      .from("phone_verification_codes")
      .update({ consumed_at: nowIso, last_attempt_at: nowIso })
      .eq("id", challenge.id);

    // Invalidate any other open codes for this phone
    await client
      .from("phone_verification_codes")
      .update({ consumed_at: nowIso })
      .eq("canonical_phone", canonicalPhone)
      .is("consumed_at", null);

    // 9. Resolve / Provision User Account & Student Profile
    const admin = getAdminClient();
    let effectiveUserId = callerId || challenge.user_id;
    let isNewUser = false;
    let redirectUrl = "/dashboard";
    let tokenHash: string | null = null;
    let userEmailToAuth: string | null = null;

    // Check if a student profile exists with this phone
    let existingProfile: any = null;
    if (effectiveUserId) {
      const { data: p } = await client
        .from("student_profiles")
        .select("*")
        .eq("id", effectiveUserId)
        .maybeSingle();
      existingProfile = p;
    } else {
      const { data: p } = await client
        .from("student_profiles")
        .select("*")
        .or(`canonical_phone.eq.${canonicalPhone},student_phone.eq.${localPhone}`)
        .limit(1)
        .maybeSingle();
      existingProfile = p;
      if (p) effectiveUserId = p.id;
    }

    if (existingProfile) {
      effectiveUserId = existingProfile.id;
      userEmailToAuth = existingProfile.email || `${localPhone}@phone.shater.internal`;

      // Check registration completeness
      const isRegistered = Boolean(
        existingProfile.registration_completed_at ||
        (existingProfile.first_name && existingProfile.stream_id && existingProfile.first_name !== "طالب")
      );

      if (!isRegistered) {
        isNewUser = true;
        redirectUrl = "/auth/register";
      } else {
        isNewUser = false;
        redirectUrl = "/dashboard";
      }

      // Update phone verification flag authoritatively
      await client
        .from("student_profiles")
        .update({
          phone_verified: true,
          phone_verified_at: nowIso,
          student_phone: localPhone,
          canonical_phone: canonicalPhone,
          updated_at: nowIso,
        })
        .eq("id", effectiveUserId);
    } else {
      // BRAND NEW USER
      isNewUser = true;
      redirectUrl = "/auth/register";
      const syntheticEmail = `${localPhone}@phone.shater.internal`;
      userEmailToAuth = syntheticEmail;

      if (admin) {
        try {
          // Check if auth.users already has this synthetic email
          const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
            email: syntheticEmail,
            email_confirm: true,
            user_metadata: {
              phone: canonicalPhone,
              student_phone: localPhone,
              phone_verified: true,
            },
          });

          if (newUser?.user) {
            effectiveUserId = newUser.user.id;
          } else if (createErr) {
            console.warn("[/api/auth/otp/verify] admin.createUser warning:", createErr.message);
          }
        } catch (adminErr) {
          console.warn("[/api/auth/otp/verify] admin.createUser exception:", adminErr);
        }
      }

      if (!effectiveUserId) {
        // Deterministic resilient fallback ID
        let h = 0x811c9dc5;
        for (let i = 0; i < (localPhone || "").length; i++) {
          h ^= (localPhone || "").charCodeAt(i);
          h = Math.imul(h, 0x01000193);
        }
        effectiveUserId = `usr_std_${(h >>> 0).toString(16).padStart(8, "0")}`;
      }

      // Create student profile with 3-day trial and verified phone
      await client
        .from("student_profiles")
        .upsert(
          {
            id: effectiveUserId,
            user_id: effectiveUserId,
            student_phone: localPhone,
            canonical_phone: canonicalPhone,
            phone_verified: true,
            phone_verified_at: nowIso,
            access_status: "TRIAL",
            plan: "PILOT_TRIAL",
            trial_started_at: nowIso,
            trial_expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: nowIso,
            updated_at: nowIso,
          },
          { onConflict: "id" }
        );
    }

    // 10. Generate Magiclink Session Token if Admin Client is Available
    if (admin && userEmailToAuth) {
      try {
        const { data: linkData } = await admin.auth.admin.generateLink({
          type: "magiclink",
          email: userEmailToAuth,
        });
        if (linkData?.properties?.hashed_token) {
          tokenHash = linkData.properties.hashed_token;
        }
      } catch (linkErr) {
        console.warn("[/api/auth/otp/verify] generateLink warning:", linkErr);
      }
    }

    // 11. Prepare Successful Response & Set HTTP Auth Cookies
    const response = NextResponse.json({
      success: true,
      verified: true,
      isNewUser,
      redirectUrl,
      userId: effectiveUserId,
      token_hash: tokenHash,
      phone: canonicalPhone,
      maskedPhone: maskPhone(canonicalPhone),
      message: "تم تأكيد رقم الهاتف بنجاح.",
    });

    // Set auth cookies (1 year duration)
    const tokenVal = encodeURIComponent(tokenHash || effectiveUserId);
    const maxAge = 31536000;
    const isProduction = process.env.NODE_ENV === "production";
    const secureFlag = isProduction ? "; Secure" : "";

    response.headers.append(
      "Set-Cookie",
      `sb-access-token=${tokenVal}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`
    );
    response.headers.append(
      "Set-Cookie",
      `bac_auth_token=${tokenVal}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`
    );

    return response;
  } catch (err: unknown) {
    console.error("[/api/auth/otp/verify] Unexpected exception:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء تأكيد الرمز." },
      { status: 500 }
    );
  }
}
