"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Package,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { StudentOrderCard } from "./StudentOrderCard";
import { StudentOrderResponse } from "@/app/api/orders/my-orders/route";
import { useTranslation } from "@/lib/i18n/context";

interface StudentOrdersSectionProps {
  limit?: number;
  showAllLink?: boolean;
  compact?: boolean;
}

export function StudentOrdersSection({
  limit,
  showAllLink = true,
  compact = false,
}: StudentOrdersSectionProps) {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const [orders, setOrders] = useState<StudentOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/my-orders");
      if (res.status === 401) {
        // Not logged in or guest
        setOrders([]);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.warn("Could not fetch student orders:", err);
      setError("تعذر تحديث قائمة الطلبات حالياً.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const displayedOrders = limit ? orders.slice(0, limit) : orders;

  return (
    <section className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-theme-text flex items-center gap-2">
              <span>طلباتي (My Orders)</span>
              {orders.length > 0 && (
                <Badge variant="outline" size="sm" className="font-mono text-xs">
                  {orders.length}
                </Badge>
              )}
            </h3>
            <p className="text-xs text-theme-muted">
              متابعة حالة شحن علبة شاطر المادية، الدفع عند الاستلام، وتفعيل الاشتراك
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-xl bg-card border border-theme text-theme-muted hover:text-theme-text transition-colors shadow-xs"
            title="تحديث الطلبات"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {showAllLink && orders.length > (limit || 0) && (
            <Link href="/orders/track">
              <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-[var(--color-primary)]">
                <span>تتبع الطلبات</span>
                <NextArrow className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <Card className="p-6 rounded-3xl border border-theme bg-card/60 animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-32 h-6 rounded-xl bg-card-muted" />
            <div className="w-20 h-6 rounded-xl bg-card-muted" />
          </div>
          <div className="w-full h-12 rounded-2xl bg-card-muted/50" />
        </Card>
      ) : orders.length === 0 ? (
        /* Empty State */
        <Card className="p-6 sm:p-8 rounded-3xl border border-dashed border-theme bg-card-muted/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-sm sm:text-base font-bold text-theme-text">
              لا توجد طلبات مسجلة بعد
            </h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              يمكنك الآن طلب علبة شاطر المادية (Physical VIP Kit) واستلامها عند باب بيتك مع الدفع عند الاستلام.
            </p>
          </div>
          <div>
            <Link href="/checkout?plan=season">
              <Button variant="primary" size="sm" className="rounded-xl font-bold gap-1.5 shadow-sm">
                <Truck className="w-4 h-4" />
                <span>طلب باقة شاطر المادية (COD)</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Order Cards List */
        <div className="space-y-4">
          {displayedOrders.map((ord) => (
            <StudentOrderCard key={ord.id} order={ord} />
          ))}
        </div>
      )}
    </section>
  );
}
