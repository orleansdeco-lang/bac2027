"use client";

import React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { BacAverageCalculator } from "@/components/calculator/BacAverageCalculator";
import { Badge } from "@/components/ui/Badge";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function CalculatorClient() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";

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

        {/* Dedicated BAC Average Calculator */}
        <div className="pt-2">
          <BacAverageCalculator />
        </div>
      </Container>
    </AppShell>
  );
}
