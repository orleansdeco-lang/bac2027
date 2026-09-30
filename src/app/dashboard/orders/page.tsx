"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { StudentOrdersSection } from "@/components/orders/StudentOrdersSection";
import { Package, Truck, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export default function StudentOrdersPage() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <AppShell activeNav="orders">
      <Container size="lg" className="py-6 sm:py-8 space-y-6" dir="rtl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
          >
            <BackArrow className="w-4 h-4" />
            <span>العودة للوحة التحكم</span>
          </Link>

          <Link href="/checkout?plan=season">
            <Button variant="primary" size="sm" className="rounded-xl font-bold gap-1.5 shadow-sm text-xs">
              <Truck className="w-3.5 h-3.5" />
              <span>طلب باقة جديدة (COD)</span>
            </Button>
          </Link>
        </div>

        {/* Orders Section (All Orders) */}
        <StudentOrdersSection limit={50} showAllLink={false} />
      </Container>
    </AppShell>
  );
}
