"use client";

import React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { ScientificCalculator } from "@/components/calculator/ScientificCalculator";
import { StudentMathPhysicsTools } from "@/components/calculator/StudentMathPhysicsTools";
import { Badge } from "@/components/ui/Badge";
import { Calculator } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function ScientificCalculatorClient() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";

  return (
    <AppShell activeNav="scientific-calculator">
      <Container size="xl" className="py-6 sm:py-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2C5E54]/15 text-[#2C5E54] dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              🔬
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-theme-text font-serif">
                  {isAr ? "الآلة الحاسبة العلمية للبكالوريا" : "Calculatrice Scientifique"}
                </h1>
                <Badge variant="outline" size="sm" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold text-[10px]">
                  {isAr ? "مجهزة بكافة دوال البكالوريا" : "Fonctions Complètes BAC"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
                {isAr
                  ? "آلة حاسبة علمية متطورة مع حساب الدوال، اللوغاريتم، الأسس، الاحتمالات، وأدوات الفيزياء والرياضيات المساعدة."
                  : "Calculatrice scientifique avancée pour le BAC avec fonctions, logarithmes, probabilités et constantes."}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Main Tactile Scientific Calculator */}
        <div>
          <ScientificCalculator />
        </div>

        {/* 2. Extra Student Tools: Equations (Delta), Unit Converter, Percentages */}
        <div>
          <StudentMathPhysicsTools />
        </div>
      </Container>
    </AppShell>
  );
}
