"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/context";
import {
  Package,
  Search,
  Truck,
  ArrowRight,
  ArrowLeft,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

function OrderTrackingLookupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderQuery.trim().toUpperCase();
    if (!clean) {
      setError("يرجى إدخال رقم الطلب المرجعي.");
      return;
    }
    setError(null);
    router.push(`/orders/track/${encodeURIComponent(clean)}`);
  };

  return (
    <AppShell activeNav="orders">
      <Container size="md" className="py-8 sm:py-12 space-y-8" dir="rtl">
        {/* Header */}
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto shadow-sm">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-text">
            تتبع مسار طلب باقة شاطر
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
            أدخل رقم طلبك المرجعي لمتابعة مراحل الشحن، التوصيل، والدفع وتفعيل اشتراكك لحظة بلحظة.
          </p>
        </div>

        {/* Search Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-theme bg-card shadow-clay space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>رقم الطلب المرجعي:</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderQuery}
                  onChange={(e) => {
                    setOrderQuery(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="مثال: SH-2026-000184"
                  className="w-full bg-card-muted border border-theme text-theme-text text-sm sm:text-base font-mono rounded-2xl px-4 py-3.5 pl-12 focus:outline-none focus:border-[var(--color-primary)] uppercase tracking-wider"
                  required
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-2xl font-black text-sm py-4 shadow-clay flex items-center justify-center gap-2"
            >
              <span>متابعة وتتبع الطلب</span>
              <NextArrow className="w-4 h-4" />
            </Button>
          </form>

          {/* Tips / Info */}
          <div className="pt-4 border-t border-theme/70 text-xs text-theme-muted space-y-2">
            <div className="flex items-center gap-2 font-bold text-theme-text">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أين أجد رقم الطلب الخاص بي؟</span>
            </div>
            <p className="leading-relaxed">
              تجد رقم الطلب في صفحة تأكيد الطلب فور إتمام الشراء، أو في رسالة التأكيد عبر البريد الإلكتروني ورسائل الواتساب، كما يظهر في قائمة طلباتي داخل لوحة الطالب.
            </p>
          </div>
        </Card>

        {/* Quick Link to My Orders */}
        <div className="text-center">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-[var(--color-primary)] transition-colors"
          >
            <span>عرض جميع طلباتي السابقة في لوحة التحكم</span>
            <NextArrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Container>
    </AppShell>
  );
}

export default function OrderTrackingLookupPage() {
  return (
    <Suspense
      fallback={
        <AppShell activeNav="orders">
          <Container size="md" className="py-8 sm:py-12" dir="rtl">
            <div className="py-16 text-center text-theme-muted text-sm font-bold">
              جاري تحميل صفحة تتبع الطلبات...
            </div>
          </Container>
        </AppShell>
      }
    >
      <OrderTrackingLookupContent />
    </Suspense>
  );
}
