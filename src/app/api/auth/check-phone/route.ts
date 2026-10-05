import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { toCanonicalAlgerianPhone, normalizeAlgerianPhone, validateAlgerianPhone } from "@/domain/administrative/phone-validation";
import { checkPersistentRateLimit } from "@/lib/security/persistent-rate-limiter";

export const dynamic = "force-dynamic";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

/**
 * POST /api/auth/check-phone
 * Validates and checks uniqueness of an Algerian phone number across student_profiles.
 * Prevents trial abuse where an individual creates multiple accounts with the same phone.
 */
export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    if (clientIp !== "127.0.0.1" && clientIp !== "::1") {
      const rateLimit = await checkPersistentRateLimit(
        `check_phone_ip:${clientIp}`,
        "check_phone",
        clientIp,
        30,
        300
      );
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, isUnique: false, error: "تم تجاوز عدد محاولات فحص الأرقام. يرجى الانتظار 5 دقائق." },
          { status: 429 }
        );
      }
    }

    const body = await req.json().catch(() => null);
    const phoneInput = body?.phone;
    const currentUserId = body?.userId;

    if (!phoneInput || typeof phoneInput !== "string") {
      return NextResponse.json(
        { success: false, isUnique: false, error: "يرجى إدخال رقم الهاتف." },
        { status: 400 }
      );
    }

    const validation = validateAlgerianPhone(phoneInput);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          isUnique: false,
          error: validation.error_ar || "رقم الهاتف غير صالح.",
        },
        { status: 400 }
      );
    }

    const canonical = toCanonicalAlgerianPhone(phoneInput);
    const local = normalizeAlgerianPhone(phoneInput);

    const client = getAdminClient() || supabase;
    if (!isSupabaseConfigured || !client) {
      // In offline/unconfigured mode, permit client validation
      return NextResponse.json({
        success: true,
        isUnique: true,
        canonical,
        normalized: local,
      });
    }

    // Check student_profiles for existing accounts using this phone
    // We check both canonical (+213...) and local (05/06/07...) as well as raw input
    let query = client
      .from("student_profiles")
      .select("id, student_phone, canonical_phone")
      .or(`student_phone.eq.${local},student_phone.eq.${canonical},canonical_phone.eq.${canonical}`);

    if (currentUserId) {
      query = query.neq("id", currentUserId);
    }

    const { data: existing, error } = await query.limit(1);

    if (error) {
      console.warn("[/api/auth/check-phone] Database check error:", error);
      // Fail closed or return warning
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        isUnique: false,
        error: "رقم الهاتف هذا مسجل بالفعل في حساب آخر. يرجى تسجيل الدخول بحسابك السابق للاستمرار.",
        canonical,
        normalized: local,
      });
    }

    return NextResponse.json({
      success: true,
      isUnique: true,
      canonical,
      normalized: local,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
