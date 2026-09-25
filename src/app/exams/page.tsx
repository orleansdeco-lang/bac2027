"use client";

export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { FileText } from "lucide-react";
import { ExamsView } from "@/components/exams/ExamsView";

export default function ExamsPage() {
  return (
    <Suspense
      fallback={
        <AppShell activeNav="exams">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <FileText className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs text-theme-muted font-sans">
                جاري تحميل بنك امتحانات البكالوريا الشامل...
              </p>
            </div>
          </div>
        </AppShell>
      }
    >
      <ExamsView />
    </Suspense>
  );
}
