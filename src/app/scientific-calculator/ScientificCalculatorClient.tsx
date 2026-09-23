"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { ScientificCalculator } from "@/components/calculator/ScientificCalculator";
import { Badge } from "@/components/ui/Badge";
import { GraduationCap, ArrowLeft, ArrowRight, BookOpen, Atom } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function ScientificCalculatorClient() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <AppShell activeNav="scientific-calculator">
      <Container size="xl" className="py-6 sm:py-10 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-2xl shadow-xs">
              🔬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-theme-text font-serif">
                  الآلة الحاسبة العلمية ثلاثية الأبعاد (Casio FX Pro)
                </h1>
                <Badge variant="outline" size="sm" className="border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10 font-bold text-[10px]">
                  3D Casio ClassWiz
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
                تصميم فيزيائي واقعي مجسم مع نقرات ميكانيكية، حساب الدوال، الأسس، اللوغاريتم، الاحتمالات، وثوابت البكالوريا.
              </p>
            </div>
          </div>

          <Link href="/calculator">
            <button
              type="button"
              className="py-2.5 px-4 rounded-2xl bg-card-muted hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] border border-theme text-xs font-bold transition-all flex items-center gap-2 text-theme-secondary shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>الذهاب إلى حاسبة معدل البكالوريا</span>
              <NextArrow className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* 3D Physical Calculator Component */}
        <div className="pt-2">
          <ScientificCalculator />
        </div>
      </Container>
    </AppShell>
  );
}
