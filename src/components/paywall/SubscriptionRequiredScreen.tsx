"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { ShieldCheck, Sparkles, LogOut, CheckCircle, RefreshCw, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SubscriptionRequiredScreenProps {
  reason?: string;
  onRefresh?: () => void;
}

export function SubscriptionRequiredScreen({ reason, onRefresh }: SubscriptionRequiredScreenProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { direction, locale } = useTranslation();
  const isRTL = direction === "rtl" || locale === "ar";
  const [isChecking, setIsChecking] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth?mode=login");
    } catch {
      window.location.href = "/auth?mode=login";
    }
  };

  const handleCheckExistingSubscription = async () => {
    setIsChecking(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } finally {
      setTimeout(() => setIsChecking(false), 1000);
    }
  };

  return (
    <div
      dir={direction}
      className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300"
    >
      <div className="max-w-xl w-full bg-card border-2 border-theme-strong/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[var(--color-primary)]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 shadow-inner">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Primary Heading */}
        <h1 className="text-2xl sm:text-3xl font-black text-theme-text mb-3 tracking-tight">
          انتهت فترة التجربة الخاصة بك
        </h1>

        {/* Reassurance Message: User Data Preserved 100% */}
        <div className="bg-surface/80 border border-theme rounded-2xl p-4 sm:p-5 mb-6 text-start space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>حسابك وبياناتك ما زالوا محفوظين بأمان 100%</span>
          </div>
          <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
            تقدمك الدراسي، جدول المهام في الـ Planner، وسجل إجاباتك وملاحظاتك في ديوان العلم محفوظة بالكامل ولن تُحذف.
            للاستمرار في استخدام منصة الشاطر والاستفادة من توجيه الأستاذ الذكي وأرشيف البكالوريات، اختر اشتراكك المناسب.
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-surface/60 border border-theme text-start">
            <div className="text-[11px] font-bold text-theme-muted mb-0.5">الاشتراك الشهري</div>
            <div className="text-lg sm:text-xl font-black text-theme-text font-mono">1,500 <span className="text-xs font-sans font-bold">دج</span></div>
            <div className="text-[10px] text-theme-muted mt-1">تجديد شهري مرن</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/40 text-start relative">
            <span className="absolute -top-2 left-3 text-[9px] font-bold bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">
              الأوفر 🌟
            </span>
            <div className="text-[11px] font-bold text-[var(--color-primary)] mb-0.5">اشتراك الموسم (كامل السنة)</div>
            <div className="text-lg sm:text-xl font-black text-theme-text font-mono">4,900 <span className="text-xs font-sans font-bold">دج</span></div>
            <div className="text-[10px] text-theme-muted mt-1">حتى آخر يوم بكالوريا</div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/subscribe" className="w-full">
            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 text-base font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>اشترك الآن وفعّل حسابك</span>
            </Button>
          </Link>

          <button
            type="button"
            onClick={handleCheckExistingSubscription}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-surface hover:bg-surface/80 border border-theme text-theme-text transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin text-[var(--color-primary)]" : "text-theme-muted"}`} />
            <span>لدي اشتراك بالفعل (تحقق من حالة الدفع)</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 text-xs font-medium text-theme-muted hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج أو تغيير الحساب</span>
          </button>
        </div>
      </div>
    </div>
  );
}
