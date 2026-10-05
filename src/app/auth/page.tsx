"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { getRegistrationDraft } from "@/lib/onboarding/profile";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { PhoneAuthCard } from "@/components/auth/PhoneAuthCard";
import { Loader2 } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const rawRedirectTo = searchParams.get("redirectTo");
  const mode = searchParams.get("mode") === "login" ? "login" : "signup";

  // If already logged in, redirect directly to dashboard or wizard
  useEffect(() => {
    if (!isLoading && user) {
      StudentService.getProfile(user.id).then((p) => {
        const regDraft = getRegistrationDraft(user.id);
        const target = rawRedirectTo && rawRedirectTo.startsWith("/") ? rawRedirectTo : "/dashboard";
        const isRegistered = Boolean(
          p?.registrationCompletedAt ||
          (p as any)?.registration_completed_at ||
          (p?.firstName && p?.streamId && p?.firstName !== "طالب") ||
          ((p as any)?.first_name && (p as any)?.stream_id && (p as any)?.first_name !== "طالب") ||
          (regDraft?.registrationCompletedAt && (regDraft?.firstName || regDraft?.streamId))
        );

        if (!isRegistered) {
          router.replace(rawRedirectTo ? `/auth/register?redirectTo=${encodeURIComponent(rawRedirectTo)}` : "/auth/register");
        } else {
          router.replace(target);
        }
      });
    }
  }, [user, isLoading, router, rawRedirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas px-4 py-6 sm:py-10">
      {/* Top Bar with Language and Theme controls */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <LanguageSwitcher />
        <ThemeSelector />
      </div>

      {/* Main Authentication Card */}
      <div className="my-auto py-8">
        <PhoneAuthCard initialMode={mode} redirectTo={rawRedirectTo} />
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-theme-muted">
        <span>© {new Date().getFullYear()} SHATER • جميع الحقوق محفوظة</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
