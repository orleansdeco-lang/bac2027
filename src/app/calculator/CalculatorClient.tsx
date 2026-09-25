"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BacAverageCalculator } from "@/components/calculator/BacAverageCalculator";
import { Badge } from "@/components/ui/Badge";
import { GraduationCap, ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function CalculatorClient() {
  const { locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <AppShell activeNav="calculator">
      <Container size="xl" className="py-6 sm:py-8 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2C5E54]/15 text-[#2C5E54] dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-theme-text font-serif">
                  {isAr ? "حاسبة معدل البكالوريا 2027 والتوجيه الجامعي" : "Calculateur de Moyenne BAC & Orientation"}
                </h1>
                <Badge variant="outline" size="sm" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold text-[10px]">
                  {isAr ? "معاملات رسمية معتمدة" : "Coefficients Officiels"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
                {isAr
                  ? "اختر شعبتك، ضع نقاطك المتوقعة أو التجريبية، واكتشف معدلك التقديري والتخصصات الجامعية المتاحة أمامك."
                  : "Sélectionnez votre filière et estimez votre moyenne du BAC ainsi que vos filières universitaires."}
              </p>
            </div>
          </div>
        </div>

        {/* Modern Orientation Gateway Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-start">
            <span className="text-2xl sm:text-3xl shrink-0">🏛️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {isAr ? "جديد: مستكشف التوجيه الجامعي الذكي" : "Nouveau : Explorateur d'Orientation"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  {isAr ? "واش نقدر نقرا؟" : "Explore"}
                </span>
              </div>
              <p className="text-xs text-theme-secondary mt-0.5">
                {isAr
                  ? "تريد استكشاف كل المدارس العليا والتخصصات المؤهل لها قانوناً بالمنشور الوزاري ومعادلات الترتيب الموزونة؟"
                  : "Découvrez toutes les grandes écoles et filières accessibles selon votre filière et vos notes."}
              </p>
            </div>
          </div>
          <Link href="/orientation" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs px-5 py-2.5 shadow-sm flex items-center justify-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "دخول مستكشف التوجيه" : "Explorer l'orientation"}</span>
              <NextArrow className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Dedicated BAC Average Calculator */}
        <div className="pt-2">
          <BacAverageCalculator />
        </div>
      </Container>
    </AppShell>
  );
}
