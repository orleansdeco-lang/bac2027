"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OrderTrackingData } from "@/lib/orders/tracking";
import { OrderTimeline } from "./OrderTimeline";
import { SubscriptionActivatedCard } from "./SubscriptionActivatedCard";
import {
  Package,
  Truck,
  MapPin,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface OrderTrackingViewProps {
  tracking: OrderTrackingData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function OrderTrackingView({
  tracking,
  onRefresh,
  isRefreshing = false,
}: OrderTrackingViewProps) {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyOrder = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(tracking.order_number);
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    }
  };

  const handleCopyTracking = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  // WhatsApp Support Link with pre-filled message
  const whatsappNumber = "+213550853234";
  const whatsappMessage = encodeURIComponent(
    `السلام عليكم، أود الاستفسار عن حالة طلبي في منصة شاطر رقم: ${tracking.order_number}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors mb-2"
          >
            <BackArrow className="w-4 h-4" />
            <span>العودة إلى قائمة طلباتي</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-theme-text">
              تتبع مسار الطلب
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card-muted border border-theme">
              <span className="font-mono text-base font-black text-[var(--color-primary)]">
                {tracking.order_number}
              </span>
              <button
                type="button"
                onClick={handleCopyOrder}
                className="p-1 rounded-lg hover:bg-card text-theme-muted hover:text-theme-text transition-colors"
                title="نسخ رقم الطلب"
              >
                {copiedOrder ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions / Refresh */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>تحديث الحالة</span>
            </Button>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>مساعدة واتساب</span>
          </a>
        </div>
      </div>

      {/* 2. CELEBRATORY CARD (When subscription is active) */}
      {tracking.subscription.is_active && (
        <SubscriptionActivatedCard subscription={tracking.subscription} />
      )}

      {/* 3. MAIN GRID: TIMELINE (LEFT/CENTER) + SUMMARY SIDEBAR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ------------------------------------------------------------- */}
        {/* MAIN: 8-STAGE TIMELINE (7 COLS)                               */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="p-6 sm:p-7 rounded-3xl border border-theme bg-card shadow-clay">
            <OrderTimeline timeline={tracking.timeline} />
          </Card>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SIDEBAR: ORDER & SHIPPING DETAILS (5 COLS)                    */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-6">
          {/* Card 1: Plan & Amount */}
          <Card className="p-5 sm:p-6 rounded-3xl border border-theme bg-card shadow-clay space-y-4">
            <h3 className="text-sm font-bold text-theme-text border-b border-theme pb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--color-primary)]" />
              <span>تفاصيل الباقة والمستحقات</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-theme-muted">الخطة المطلوبة:</span>
                <span className="font-bold text-theme-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{tracking.plan.name}</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-theme-muted">مدة الاشتراك:</span>
                <span className="font-bold text-theme-text font-mono">
                  {tracking.plan.duration}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-theme-muted">طريقة الدفع:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 text-[11px]">
                  <CreditCard className="w-3 h-3" />
                  <span>{tracking.financials.payment_method}</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-theme-muted">حالة الدفع:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold border text-[11px] ${
                    tracking.financials.is_paid
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  }`}
                >
                  {tracking.financials.is_paid ? "تم الدفع وتأكيد الاستلام" : "الدفع كاش عند الباب"}
                </span>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-theme flex justify-between items-baseline">
                <span className="text-xs font-bold text-theme-text">المبلغ المطلوب تسليمه:</span>
                <div className="text-left font-mono">
                  <span className="text-xl font-black text-[var(--color-primary)]">
                    {tracking.financials.formatted_amount}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Delivery Destination */}
          <Card className="p-5 sm:p-6 rounded-3xl border border-theme bg-card shadow-clay space-y-4">
            <h3 className="text-sm font-bold text-theme-text border-b border-theme pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>عنوان الاستلام</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-theme-muted">المستلم:</span>
                <span className="font-bold text-theme-text">
                  {tracking.shipping.recipient_name}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-theme-muted">الولاية والبلدية:</span>
                <span className="font-bold text-theme-text">
                  {tracking.shipping.wilaya}
                  {tracking.shipping.commune ? ` • ${tracking.shipping.commune}` : ""}
                </span>
              </div>

              {tracking.shipping.address && (
                <div className="pt-2 border-t border-theme/60 space-y-1">
                  <span className="text-theme-muted block text-[11px]">العنوان بالتفصيل:</span>
                  <p className="text-theme-text font-medium leading-relaxed bg-card-muted/50 p-2.5 rounded-xl border border-theme/60">
                    {tracking.shipping.address}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Card 3: Carrier Details (if available) */}
          {(tracking.shipping.carrier || tracking.shipping.tracking_number) && (
            <Card className="p-5 sm:p-6 rounded-3xl border border-theme bg-card shadow-clay space-y-3">
              <h3 className="text-sm font-bold text-theme-text border-b border-theme pb-2.5 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>بيانات شركة التوصيل</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                {tracking.shipping.carrier && (
                  <div className="flex justify-between items-center">
                    <span className="text-theme-muted">شركة الشحن:</span>
                    <span className="font-bold text-theme-text">
                      {tracking.shipping.carrier}
                    </span>
                  </div>
                )}

                {tracking.shipping.tracking_number && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-theme-muted block text-[11px]">رقم بوليصة الشحن (Tracking #):</span>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-card-muted border border-theme">
                      <span className="font-mono font-black text-theme-text text-sm">
                        {tracking.shipping.tracking_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(tracking.shipping.tracking_number!)}
                        className="p-1 rounded-lg hover:bg-card text-theme-muted hover:text-theme-text transition-colors"
                        title="نسخ رقم التتبع"
                      >
                        {copiedTracking ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {tracking.shipping.tracking_url && (
                  <a
                    href={tracking.shipping.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 font-bold transition-colors text-xs mt-2"
                  >
                    <span>فتح رابط التتبع على موقع الناقل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </Card>
          )}

          {/* Card 4: Support & Guidance */}
          <Card className="p-5 rounded-3xl border border-theme bg-card shadow-clay space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>تحتاج مساعدة أو استفسار؟</span>
            </div>
            <p className="text-[11px] text-theme-muted leading-relaxed">
              فريق دعم شاطر جاهز لمساعدتك وتحديثك بموعد وصول الموزع إلى بيتك على مدار أيام الأسبوع.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>مراسلة الدعم عبر الواتساب</span>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
