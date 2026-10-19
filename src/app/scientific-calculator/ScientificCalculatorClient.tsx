"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { ScientificCalculator } from "@/components/calculator/ScientificCalculator";
import { StudentMathPhysicsTools } from "@/components/calculator/StudentMathPhysicsTools";
import { NumWorksCalculator } from "@/components/calculator/numworks/NumWorksCalculator";
import { Calculator, LineChart } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function ScientificCalculatorClient() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";

  // Main Tabs State: 'scientific' | 'numworks'
  const [activeTab, setActiveTab] = useState<"scientific" | "numworks">("scientific");

  return (
    <AppShell activeNav="scientific-calculator">
      <Container size="xl" className="py-4 sm:py-6 space-y-5">
        {/* ========================================================= */}
        {/* Professional Segmented Control (Tabs Switcher - RTL/LTR)  */}
        {/* ========================================================= */}
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="flex justify-center w-full"
        >
          <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto p-1.5 bg-card/80 backdrop-blur-sm rounded-2xl border border-theme shadow-sm">
            {/* Tab 1: Scientific Calculator (Casio) */}
            <button
              type="button"
              onClick={() => setActiveTab("scientific")}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === "scientific"
                  ? "bg-[#2C5E54] text-white shadow-md shadow-[#2C5E54]/25 scale-[1.01]"
                  : "text-theme-muted hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              <span>{isAr ? "الآلة الحاسبة العلمية" : "Calculatrice Scientifique"}</span>
              <span className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-mono">
                Casio fx-991
              </span>
            </button>

            {/* Tab 2: NumWorks Graphing Calculator */}
            <button
              type="button"
              onClick={() => setActiveTab("numworks")}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === "numworks"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.01]"
                  : "text-theme-muted hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              <LineChart className="w-4 h-4 shrink-0" />
              <span>{isAr ? "آلة NumWorks البيانية" : "NumWorks Graphique"}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-900 dark:text-amber-200 font-bold">
                {isAr ? "بيانية" : "Graphique"}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Content View 1: Existing Scientific Calculator (Casio)     */}
        {/* ========================================================= */}
        {activeTab === "scientific" && (
          <div className="space-y-8 transition-opacity duration-300">
            {/* 1. Main Tactile Scientific Calculator (Preserved Completely) */}
            <div>
              <ScientificCalculator />
            </div>

            {/* 2. Extra Student Tools: Equations (Delta), Unit Converter, Percentages */}
            <div>
              <StudentMathPhysicsTools />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Content View 2: NumWorks Graphing Calculator               */}
        {/* ========================================================= */}
        {activeTab === "numworks" && (
          <div className="space-y-6 transition-opacity duration-300">
            {/* Custom Interactive Web UI */}
            <div className="w-full">
              <NumWorksCalculator />
            </div>

            {/* Features Highlights Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                  📈
                </div>
                <h3 className="font-bold text-sm text-theme-text">
                  {isAr ? "راسم الدوال التفاعلي (Grapheur)" : "Grapheur Interactif"}
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  {isAr
                    ? "أدخل دوالك الرياضية f(x) و g(x) مع تمثيل بياني حي عبر Canvas، وتكبير وتصغير المحاور، وتتبع إحداثيات النقاط وجدول القيم التلقائي."
                    : "Tracez vos fonctions avec repère cartésien, zoom dynamique, suivi des coordonnées et tableau de valeurs."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
                  🐍
                </div>
                <h3 className="font-bold text-sm text-theme-text">
                  {isAr ? "محرر بايثون الرياضي (Python)" : "Script Python BAC"}
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  {isAr
                    ? "نفّذ خوارزميات البكالوريا البرمجية مباشرة: خوارزمية التنصيف (Dichotomie)، حساب حدود المتتاليات، فحص الأعداد الأولية، والعاملي."
                    : "Exécutez vos scripts Python pour la méthode de dichotomie, les suites numériques et la primalité."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base">
                  🎲
                </div>
                <h3 className="font-bold text-sm text-theme-text">
                  {isAr ? "الإحصاء والاحتمالات والمعادلات" : "Stats, Probas & Équations"}
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  {isAr
                    ? "حساب التوزيع الطبيعي والثنائي مع رسم منحنى غاوس، حل معادلات الدرجة الثانية بالمميز Δ والجذور المركبة، والمدرج التكراري للإحصاء."
                    : "Loi normale de Gauss, loi binomiale, résolution quadratique avec Delta et histogramme statistique."}
                </p>
              </div>
            </div>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
