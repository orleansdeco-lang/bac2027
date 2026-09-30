"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderTrackingView } from "@/components/orders/OrderTrackingView";
import { OrderTrackingData } from "@/lib/orders/tracking";
import { Package, AlertCircle, RefreshCw, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export default function OrderTrackingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const rawId = params?.id as string;
  const orderId = rawId ? decodeURIComponent(rawId) : "";

  const [tracking, setTracking] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrackingData = async (isManualRefresh = false) => {
    if (!orderId) return;
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/track`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "تعذر العثور على الطلب المطلوب.");
      }

      setTracking(data.tracking);
      setError(null);
    } catch (err: any) {
      console.error("[OrderTrackingPage] Fetch error:", err);
      setError(err?.message || "حدث خطأ أثناء تحميل بيانات التتبع.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, [orderId]);

  return (
    <AppShell activeNav="orders">
      <Container size="lg" className="py-6 sm:py-8 space-y-6" dir="rtl">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4 text-theme-muted">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            <p className="text-sm font-bold">جاري تحميل مسار وحالة الطلب...</p>
          </div>
        ) : error || !tracking ? (
          <div className="max-w-md mx-auto py-12 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-theme-text">تعذر تحميل بيانات الطلب</h2>
              <p className="text-xs text-theme-muted leading-relaxed">
                {error || "لم نتمكن من العثور على بيانات التتبع لهذا الطلب."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => fetchTrackingData(false)}
                className="w-full sm:w-auto rounded-xl font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </Button>
              <Link href="/dashboard/orders" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-bold">
                  <BackArrow className="w-3.5 h-3.5" />
                  <span>العودة لطلباتي</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <OrderTrackingView
            tracking={tracking}
            onRefresh={() => fetchTrackingData(true)}
            isRefreshing={isRefreshing}
          />
        )}
      </Container>
    </AppShell>
  );
}
