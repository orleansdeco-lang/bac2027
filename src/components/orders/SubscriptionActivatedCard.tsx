"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActivatedSubscriptionInfo } from "@/lib/orders/tracking";
import {
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface SubscriptionActivatedCardProps {
  subscription: ActivatedSubscriptionInfo;
}

export function SubscriptionActivatedCard({
  subscription,
}: SubscriptionActivatedCardProps) {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  if (!subscription.is_active) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-card to-card shadow-clay text-theme-text space-y-6">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 font-black text-2xl">
            ✓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                تم تفعيل اشتراكك بنجاح!
              </h3>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
              مرحباً بك في أسرة شاطر، حسابك مفعل الآن وكافة الدروس والملخصات والامتحانات مفتوحة لك.
            </p>
          </div>
        </div>

        {/* Active Badge */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>اشتراك ساري المفعول</span>
        </span>
      </div>

      {/* Plan & Dates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. الخطة */}
        <div className="p-4 rounded-2xl bg-card-muted/60 border border-theme/80 space-y-1">
          <span className="text-[11px] font-bold text-theme-muted flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>خطة الاشتراك:</span>
          </span>
          <div className="text-base font-black text-theme-text">
            {subscription.plan_name}
          </div>
          <div className="text-xs text-theme-muted font-medium">
            {subscription.plan_duration}
          </div>
        </div>

        {/* 2. تاريخ البدء */}
        <div className="p-4 rounded-2xl bg-card-muted/60 border border-theme/80 space-y-1">
          <span className="text-[11px] font-bold text-theme-muted flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>تاريخ بدء الاشتراك:</span>
          </span>
          <div className="text-base font-black font-mono text-theme-text">
            {subscription.formatted_starts_at || "منذ تأكيد الدفع"}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            مفعّل بالكامل
          </div>
        </div>

        {/* 3. تاريخ الانتهاء */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>تاريخ الانتهاء:</span>
          </span>
          <div className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300">
            {subscription.formatted_expires_at || "نهاية موسم البكالوريا"}
          </div>
          <div className="text-xs text-theme-muted font-medium">
            {subscription.days_remaining !== null ? (
              <span>متبقي: <strong className="text-theme-text font-bold">{subscription.days_remaining}</strong> يوماً</span>
            ) : (
              <span>صالح طيلة الموسم الدراسي</span>
            )}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-theme-muted">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>يمكنك الوصول لكافة الدروس والملخصات من أي جهاز عبر تسجيل الدخول بحسابك.</span>
        </div>

        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto rounded-2xl font-black text-sm px-6 py-3 shadow-clay gap-2"
          >
            <span>الدخول إلى لوحة الدراسة الآن</span>
            <Arrow className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
