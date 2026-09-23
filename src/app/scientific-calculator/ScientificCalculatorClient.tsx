"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { ScientificCalculator } from "@/components/calculator/ScientificCalculator";
import { BacAverageCalculator } from "@/components/calculator/BacAverageCalculator";
import { Badge } from "@/components/ui/Badge";
import { GraduationCap, ArrowLeft, ArrowRight, Atom, Calculator } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function ScientificCalculatorClient() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"scientific" | "average">("scientific");

  return (
    <AppShell activeNav="scientific-calculator">
      <Container size="xl" className="py-6 sm:py-8 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2C5E54]/15 text-[#2C5E54] dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              {activeTab === "scientific" ? "🔬" : "🎓"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-theme-text font-serif">
                  {activeTab === "scientific"
                    ? "الآلة الحاسبة العلمية ثلاثية الأبعاد (Casio FX Pro)"
                    : "حاسبة معدل البكالوريا 2027 والتوجيه الجامعي"}
                </h1>
                <Badge variant="outline" size="sm" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold text-[10px]">
                  {activeTab === "scientific" ? "3D Casio ClassWiz" : "معاملات رسمية معتمدة"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
                {activeTab === "scientific"
                  ? "تصميم فيزيائي واقعي بنظام LTR القياسي مع نقرات ميكانيكية، حساب الدوال، اللوغاريتم، الاحتمالات، وثوابت البكالوريا."
                  : "احسب معدلك الفصلي والنهائي التقديري واكتشف التخصصات الجامعية والمدارس العليا المتاحة أمامك."}
              </p>
            </div>
          </div>

          {/* Quick Switcher Buttons */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-theme shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("scientific")}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "scientific"
                  ? "bg-[#2C5E54] text-white shadow-xs"
                  : "text-theme-secondary hover:text-theme-text hover:bg-card"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>الآلة الحاسبة 🔬</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("average")}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "average"
                  ? "bg-[#2C5E54] text-white shadow-xs"
                  : "text-theme-secondary hover:text-theme-text hover:bg-card"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>حاسبة المعدل 🎓</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tool Content */}
        <div className="pt-2">
          {activeTab === "scientific" ? (
            <ScientificCalculator />
          ) : (
            <BacAverageCalculator />
          )}
        </div>
      </Container>
    </AppShell>
  );
}
