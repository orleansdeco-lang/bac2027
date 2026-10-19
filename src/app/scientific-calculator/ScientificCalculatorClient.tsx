"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { ScientificCalculator } from "@/components/calculator/ScientificCalculator";
import { StudentMathPhysicsTools } from "@/components/calculator/StudentMathPhysicsTools";
import { NumWorksCalculator } from "@/components/calculator/numworks/NumWorksCalculator";
import { NumWorksSimulatorIframe } from "@/components/calculator/numworks/NumWorksSimulatorIframe";
import { Badge } from "@/components/ui/Badge";
import {
  Calculator,
  LineChart,
  Cpu,
  Globe,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function ScientificCalculatorClient() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";

  // Main Tabs State: 'scientific' | 'numworks'
  const [activeTab, setActiveTab] = useState<"scientific" | "numworks">("scientific");

  // NumWorks Sub-mode: 'custom' (Interactive Web UI) | 'simulator' (Official Iframe)
  const [numworksMode, setNumworksMode] = useState<"custom" | "simulator">("custom");

  return (
    <AppShell activeNav="scientific-calculator">
      <Container size="xl" className="py-6 sm:py-8 space-y-6">
        {/* ========================================================= */}
        {/* Header Banner                                             */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2C5E54]/15 text-[#2C5E54] dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              🔬
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-theme-text font-serif">
                  {isAr ? "مختبر الآلات الحاسبة العلمية والبيانية" : "Laboratoire de Calculatrices BAC"}
                </h1>
                <Badge
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold text-[10px]"
                >
                  {isAr ? "Casio ClassWiz + NumWorks" : "Casio + NumWorks"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
                {isAr
                  ? "اختر الآلة الحاسبة المناسبة لك للتحضير للبكالوريا: الآلة العلمية الكلاسيكية Casio أو الآلة البيانية المتطورة NumWorks مع محاكي الرسم البياني وبايثون."
                  : "Choisissez la calculatrice adaptée pour le BAC: Scientifique classique Casio ou Graphique avancée NumWorks avec traceur et Python."}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Professional Segmented Control (Tabs Switcher - RTL/LTR)  */}
        {/* ========================================================= */}
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1.5 rounded-2xl bg-muted/30 dark:bg-slate-800/40 border border-theme backdrop-blur-xs"
        >
          {/* Main Tabs Segmented Control */}
          <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto p-1 bg-card rounded-xl border border-theme shadow-inner">
            {/* Tab 1: Scientific Calculator (Casio) */}
            <button
              type="button"
              onClick={() => setActiveTab("scientific")}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
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
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === "numworks"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.01]"
                  : "text-theme-muted hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              <LineChart className="w-4 h-4 shrink-0" />
              <span>{isAr ? "آلة NumWorks البيانية" : "NumWorks Graphique"}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-900 dark:text-amber-200 font-bold">
                {isAr ? "جديد" : "NEW"}
              </span>
            </button>
          </div>

          {/* NumWorks Sub-Switch (Only visible when NumWorks tab is active) */}
          {activeTab === "numworks" && (
            <div className="flex items-center gap-1.5 p-1 bg-card rounded-xl border border-theme text-xs w-full sm:w-auto justify-center">
              <span className="text-[11px] text-theme-muted px-2 hidden sm:inline">
                {isAr ? "وضع العرض:" : "Mode:"}
              </span>

              <button
                type="button"
                onClick={() => setNumworksMode("custom")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  numworksMode === "custom"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-theme-muted hover:text-theme-text hover:bg-card-hover"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{isAr ? "الوضع التفاعلي المدمج (Custom Web UI)" : "Web UI Intégrée"}</span>
              </button>

              <button
                type="button"
                onClick={() => setNumworksMode("simulator")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  numworksMode === "simulator"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-theme-muted hover:text-theme-text hover:bg-card-hover"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isAr ? "المحاكي الرسمي الكامل (Official Simulator)" : "Simulateur Officiel"}</span>
              </button>
            </div>
          )}
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
            {numworksMode === "custom" ? (
              <>
                {/* Custom Interactive Web UI */}
                <div className="w-full">
                  <NumWorksCalculator />
                </div>

                {/* Features Highlights Guide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
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
              </>
            ) : (
              /* Official Simulator Iframe */
              <div className="w-full">
                <NumWorksSimulatorIframe />
              </div>
            )}
          </div>
        )}
      </Container>
    </AppShell>
  );
}
