"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import {
  Smartphone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  RefreshCw,
  Edit2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  validateAlgerianPhone,
  normalizeAlgerianPhone,
  toCanonicalAlgerianPhone,
} from "@/domain/administrative/phone-validation";
import { maskPhone, formatAlgerianPhoneDisplay } from "@/lib/security/otp";

interface PhoneAuthCardProps {
  initialMode?: "signup" | "login";
  onAuthSuccess?: (result: { isNewUser: boolean; redirectUrl: string }) => void;
  redirectTo?: string | null;
}

export function PhoneAuthCard({
  initialMode = "signup",
  onAuthSuccess,
  redirectTo,
}: PhoneAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { direction, locale } = useTranslation();
  const isRtl = direction === "rtl";
  const { signInWithPhoneOtp, verifyPhoneOtp, user, isLoading: authLoading } = useAuth();

  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [maskedPhoneDisplay, setMaskedPhoneDisplay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update mode from query parameter or prop
  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "login" || qMode === "signup") {
      setMode(qMode);
    } else {
      setMode(initialMode);
    }
  }, [searchParams, initialMode]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === "otp") {
      const firstInput = otpInputRefs.current[0];
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 80);
      }
    }
  }, [step]);

  // Format phone as user types: digits only, max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 10) {
      setPhone(raw);
      if (errorMsg) setErrorMsg(null);
    }
  };

  const cleanPhone = phone.trim();
  const isPhoneValid = /^(05|06|07)\d{8}$/.test(cleanPhone) || /^(5|6|7)\d{8}$/.test(cleanPhone);

  // Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = validateAlgerianPhone(cleanPhone);
    if (!validation.isValid) {
      setErrorMsg(validation.error_ar || "أدخل رقم هاتف صحيح يبدأ بـ 05 أو 06 أو 07.");
      return;
    }

    const localFormatted = normalizeAlgerianPhone(cleanPhone);
    if (!/^(05|06|07)\d{8}$/.test(localFormatted)) {
      setErrorMsg("رمز التحقق عبر واتساب متاح فقط لأرقام الهاتف المحمولة (05 / 06 / 07).");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signInWithPhoneOtp(localFormatted);
      if (!result.success) {
        setErrorMsg(result.error || "تعذر إرسال رمز التحقق. يرجى إعادة المحاولة.");
        if (result.cooldownSeconds) setCooldown(result.cooldownSeconds);
      } else {
        const canonical = toCanonicalAlgerianPhone(localFormatted);
        setMaskedPhoneDisplay(result.maskedPhone || maskPhone(canonical));
        setCooldown(result.cooldownSeconds || 60);
        setOtpDigits(["", "", "", "", "", ""]);
        setStep("otp");
      }
    } catch {
      setErrorMsg("حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle individual OTP digit change
  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    if (errorMsg) setErrorMsg(null);

    // Auto-advance to next box if a digit was entered
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are filled
    if (char && index === 5 && updated.every((d) => d.length === 1)) {
      triggerVerification(updated.join(""));
    }
  };

  // Handle keydown for backspace navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        e.preventDefault();
        const updated = [...otpDigits];
        updated[index - 1] = "";
        setOtpDigits(updated);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      if (isRtl && index < 5) otpInputRefs.current[index + 1]?.focus();
      else if (!isRtl && index > 0) otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      if (isRtl && index > 0) otpInputRefs.current[index - 1]?.focus();
      else if (!isRtl && index < 5) otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste for 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
      triggerVerification(pasted);
    } else if (pasted.length > 0) {
      const updated = [...otpDigits];
      for (let i = 0; i < pasted.length && i < 6; i++) {
        updated[i] = pasted[i];
      }
      setOtpDigits(updated);
      const nextFocus = Math.min(5, pasted.length);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  // Verify OTP
  const triggerVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length !== 6 || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const localFormatted = normalizeAlgerianPhone(cleanPhone);
    try {
      const result = await verifyPhoneOtp(localFormatted, code);
      if (!result.success) {
        setErrorMsg(result.error || "رمز التحقق غير صحيح.");
        setSubmitting(false);
      } else {
        setSuccessMsg("تم التحقق بنجاح! جاري الدخول...");

        if (onAuthSuccess) {
          onAuthSuccess(result);
        } else {
          const effectiveRedirect = redirectTo || result.redirectUrl || (result.isNewUser ? "/auth/register" : "/dashboard");
          setTimeout(() => {
            router.replace(effectiveRedirect);
          }, 600);
        }
      }
    } catch {
      setErrorMsg("حدث خطأ أثناء تأكيد الرمز. يرجى إعادة المحاولة.");
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVerification();
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const isOtpComplete = otpDigits.every((d) => d.length === 1);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header / Brand */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block transition-transform active:scale-95">
          <Logo size="lg" />
        </Link>
      </div>

      <div className="bg-theme-card border border-theme shadow-card rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        {step === "phone" ? (
          <div>
            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-theme-text tracking-tight">
                {mode === "signup" ? "أنشئ حسابك" : "تسجيل الدخول"}
              </h1>
              <p className="text-sm text-theme-muted mt-1.5 font-medium">
                {mode === "signup"
                  ? "أدخل رقم هاتفك للبدء"
                  : "أدخل رقم هاتفك للمتابعة"}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Phone Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="phone-input"
                  className="block text-xs font-bold text-theme-text mb-2 text-right"
                >
                  رقم الهاتف المحمول
                </label>
                <div
                  dir="ltr"
                  className="flex items-center rounded-2xl border border-theme bg-theme-input focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 transition-all overflow-hidden"
                >
                  {/* Country Prefix Badge */}
                  <div className="flex items-center gap-1.5 px-3.5 py-3 bg-canvas/60 border-r border-theme text-theme-text text-sm font-bold select-none shrink-0">
                    <span className="text-base">🇩🇿</span>
                    <span className="font-mono text-xs">+213</span>
                  </div>

                  {/* Number Input */}
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="05 XX XX XX XX"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={submitting}
                    className="w-full px-3.5 py-3 bg-transparent text-theme-text font-mono text-base font-semibold placeholder:text-theme-muted/40 focus:outline-none"
                    autoFocus
                  />

                  {/* Format Hint or Validation Indicator */}
                  {cleanPhone.length >= 9 && (
                    <div className="px-3 shrink-0">
                      {isPhoneValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-75" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-theme-muted mt-1.5 text-right font-medium">
                  يقبل الأرقام التي تبدأ بـ 05، 06، أو 07
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting || !isPhoneValid}
                className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-md shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2 group transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إرسال الرمز...</span>
                  </>
                ) : (
                  <>
                    <span>متابعة</span>
                    {isRtl ? (
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </>
                )}
              </Button>
            </form>

            {/* Trust / Channel Badge */}
            <div className="mt-5 pt-4 border-t border-theme/60 flex items-center justify-center gap-2 text-xs text-theme-muted">
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>سيصلك رمز التحقق عبر <strong>واتساب</strong></span>
            </div>

            {/* Mode Switch Link */}
            <div className="mt-5 text-center">
              {mode === "signup" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg(null);
                  }}
                  className="text-xs text-theme-muted hover:text-[var(--color-primary)] font-medium transition-colors"
                >
                  لديك حساب بالفعل؟{" "}
                  <span className="font-bold text-[var(--color-primary)] underline underline-offset-4">
                    تسجيل الدخول
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                  }}
                  className="text-xs text-theme-muted hover:text-[var(--color-primary)] font-medium transition-colors"
                >
                  ليس لديك حساب؟{" "}
                  <span className="font-bold text-[var(--color-primary)] underline underline-offset-4">
                    أنشئ حسابك الآن
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: OTP Verification Screen */
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-theme-text tracking-tight">
                تأكيد رقم هاتفك
              </h1>
              <p className="text-xs text-theme-muted mt-1.5 font-medium">
                أرسلنا رمز التحقق المكون من 6 أرقام إلى:
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas border border-theme">
                <span className="font-mono font-bold text-sm text-theme-text dir-ltr">
                  {maskedPhoneDisplay || formatAlgerianPhoneDisplay(cleanPhone)}
                </span>
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="text-theme-muted hover:text-[var(--color-primary)] transition-colors p-0.5"
                  title="تغيير رقم الهاتف"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div
                role="status"
                className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in zoom-in-95 duration-200"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              {/* 6 Digit Input Boxes */}
              <div dir="ltr" className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    onPaste={handlePaste}
                    disabled={submitting || Boolean(successMsg)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-2xl border border-theme bg-theme-input text-theme-text focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all focus:outline-none"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting || !isOtpComplete || Boolean(successMsg)}
                className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-md shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تأكيد</span>
                  </>
                )}
              </Button>
            </form>

            {/* Resend & Change Phone Actions */}
            <div className="mt-6 pt-5 border-t border-theme/60 space-y-3 text-center">
              <div>
                {cooldown > 0 ? (
                  <span className="text-xs text-theme-muted font-medium">
                    إعادة إرسال الرمز خلال{" "}
                    <strong className="font-mono text-theme-text font-bold">
                      {cooldown} ثانية
                    </strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline underline-offset-4 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة إرسال الرمز عبر واتساب</span>
                  </button>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  disabled={submitting}
                  className="text-xs text-theme-muted hover:text-theme-text font-medium transition-colors"
                >
                  تغيير رقم الهاتف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security note */}
      <p className="text-center text-[11px] text-theme-muted/70 mt-5 font-medium">
        منصة الشاطر التعليمية • بكالوريا 2027 • محمي ومشفر بالكامل
      </p>
    </div>
  );
}
