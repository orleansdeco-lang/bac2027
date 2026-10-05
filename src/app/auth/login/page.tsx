"use client";

import React, { Suspense } from "react";
import { PhoneAuthCard } from "@/components/auth/PhoneAuthCard";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { Loader2 } from "lucide-react";

function LoginContent() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas px-4 py-6 sm:py-10">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <LanguageSwitcher />
        <ThemeSelector />
      </div>

      <div className="my-auto py-8">
        <PhoneAuthCard initialMode="login" />
      </div>

      <div className="w-full max-w-md mx-auto text-center text-xs text-theme-muted">
        <span>© {new Date().getFullYear()} SHATER • جميع الحقوق محفوظة</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
