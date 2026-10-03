"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Package,
  Truck,
  CreditCard,
  Sparkles,
  Calendar,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { StudentOrderResponse } from "@/app/api/orders/my-orders/route";

interface StudentOrderCardProps {
  order: StudentOrderResponse;
}

export function StudentOrderCard({ order }: StudentOrderCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadgeClass = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "warning":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "info":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "error":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  return (
    <Card className="p-5 sm:p-6 rounded-3xl border border-theme bg-card shadow-clay space-y-5 transition-all hover:border-[var(--color-primary)]/40 text-theme-text">
      {/* Top Header: Order Number & Date */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-black tracking-wider text-theme-text">
                {order.order_number}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-card-muted hover:bg-card-muted/80 text-theme-muted hover:text-theme-text transition-colors"
                title="نسخ رقم الطلب"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <span className="text-[11px] text-theme-muted flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{order.formatted_date}</span>
            </span>
          </div>
        </div>

        {/* Price & Duration */}
        <div className="text-left font-mono">
          <div className="text-xl sm:text-2xl font-black text-[var(--color-primary)]">
            {order.formatted_price}
          </div>
          <div className="text-[11px] text-theme-muted font-sans font-bold">
            {order.plan_duration}
          </div>
        </div>
      </div>

      {/* Plan Title */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="space-y-0.5">
          <span className="text-xs text-theme-muted font-semibold block">الخطة المطلوبة:</span>
          <h4 className="text-sm sm:text-base font-bold text-theme-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{order.plan_name}</span>
          </h4>
        </div>
        <div className="text-xs text-theme-muted">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card-muted border border-theme text-[11px] font-medium">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            <span>باقة مادية Physical Kit</span>
          </span>
        </div>
      </div>

      {/* 4 Statuses Grid: Order, Delivery, Payment, Subscription */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-card-muted/50 border border-theme">
        {/* 1. حالة الطلب */}
        <div className="space-y-1.5 p-2 rounded-xl bg-card border border-theme/60">
          <span className="text-[10px] text-theme-muted font-bold block">الطلب:</span>
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 w-full justify-center ${getStatusBadgeClass(order.statuses.order.badge_variant)}`}>
            <span>{order.statuses.order.label}</span>
          </div>
        </div>

        {/* 2. حالة التوصيل */}
        <div className="space-y-1.5 p-2 rounded-xl bg-card border border-theme/60">
          <span className="text-[10px] text-theme-muted font-bold block">التوصيل:</span>
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 w-full justify-center ${getStatusBadgeClass(order.statuses.delivery.badge_variant)}`}>
            <Truck className="w-3 h-3 shrink-0" />
            <span>{order.statuses.delivery.label}</span>
          </div>
        </div>

        {/* 3. حالة الدفع */}
        <div className="space-y-1.5 p-2 rounded-xl bg-card border border-theme/60">
          <span className="text-[10px] text-theme-muted font-bold block">الدفع:</span>
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 w-full justify-center ${getStatusBadgeClass(order.statuses.payment.badge_variant)}`}>
            <CreditCard className="w-3 h-3 shrink-0" />
            <span>{order.statuses.payment.label}</span>
          </div>
        </div>

        {/* 4. حالة الاشتراك */}
        <div className="space-y-1.5 p-2 rounded-xl bg-card border border-theme/60">
          <span className="text-[10px] text-theme-muted font-bold block">الاشتراك:</span>
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 w-full justify-center ${getStatusBadgeClass(order.statuses.subscription.badge_variant)}`}>
            {order.statuses.subscription.key === "ACTIVE" ? (
              <CheckCircle2 className="w-3 h-3 shrink-0" />
            ) : (
              <Clock className="w-3 h-3 shrink-0" />
            )}
            <span>{order.statuses.subscription.label}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address & Carrier Info (Safe, Non-Admin) */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-theme-muted border-t border-theme/70">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>
            <strong className="text-theme-text">{order.shipping.wilaya}</strong>
            {order.shipping.commune ? ` • ${order.shipping.commune}` : ""}
            {order.shipping.address ? ` (${order.shipping.address})` : ""}
          </span>
        </div>

        {/* Carrier & Tracking details if dispatched */}
        {(order.statuses.delivery.carrier || order.statuses.delivery.tracking_number) && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-[11px]">
            {order.statuses.delivery.carrier && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card-muted border border-theme text-theme-muted">
                <Truck className="w-3 h-3 text-indigo-500" />
                <span>{order.statuses.delivery.carrier}</span>
              </span>
            )}

            {order.statuses.delivery.formatted_shipped_at && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card-muted border border-theme text-theme-muted">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>شُحنت: {order.statuses.delivery.formatted_shipped_at}</span>
              </span>
            )}

            {order.statuses.delivery.tracking_number && (
              <div className="flex items-center gap-1.5 font-mono bg-card-muted px-2.5 py-1 rounded-xl border border-theme">
                <span>التتبع:</span>
                <strong className="text-theme-text font-bold">
                  {order.statuses.delivery.tracking_number}
                </strong>
                {order.statuses.delivery.tracking_url && (
                  <a
                    href={order.statuses.delivery.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-[var(--color-primary)] transition-colors text-indigo-400"
                    title="تتبع الشحنة بموقع شركة التوصيل"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action: Track Order Timeline (8 Stages) */}
      <div className="pt-3 border-t border-theme/70 flex items-center justify-between gap-3">
        <span className="text-[11px] text-theme-muted">
          متابعة مراحل الشحن، التوصيل، والدفع وتفعيل الاشتراك:
        </span>
        <Link href={`/orders/track/${encodeURIComponent(order.id || order.order_number)}`}>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]">
            <Clock className="w-3.5 h-3.5" />
            <span>تتبع مسار الطلب (Timeline)</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </Card>
  );
}
