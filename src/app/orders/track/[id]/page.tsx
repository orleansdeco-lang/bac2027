"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderTrackingView } from "@/components/orders/OrderTrackingView";
import { OrderTrackingData } from "@/lib/orders/tracking";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function OrderTrackingDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const orderId = decodeURIComponent(rawId);

  const [tracking, setTracking] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/track`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل تحميل تفاصيل التتبع للطلب.");
      }
      setTracking(data.tracking);
    } catch (err: any) {
      setError(err?.message || "تعذر تحميل بيانات التتبع.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [orderId]);

  return (
    <AppShell activeNav="orders">
      <Container size="lg" className="py-6 sm:py-10 space-y-6" dir="rtl">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto animate-spin">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-theme-muted">
              جاري تحميل مسار الطلب ({orderId})...
            </p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center space-y-5 rounded-3xl border border-rose-500/30 bg-rose-500/5 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-theme-text">تعذر العثور على الطلب</h2>
              <p className="text-xs text-theme-muted leading-relaxed">{error}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/orders/track">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                  بحث عن طلب آخر
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl text-xs font-bold"
                onClick={fetchTracking}
              >
                إعادة المحاولة
              </Button>
            </div>
          </Card>
        ) : tracking ? (
          <OrderTrackingView
            tracking={tracking}
            onRefresh={fetchTracking}
            isRefreshing={loading}
          />
        ) : null}
      </Container>
    </AppShell>
  );
}
