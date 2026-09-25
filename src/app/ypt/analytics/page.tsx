"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLearningAccessGate } from "@/lib/hooks";
import { useAuth } from "@/lib/auth/hooks";
import { AnalyticsService } from "@/lib/study-os/analytics-service";
import { StudyAnalyticsDashboard } from "@/components/study-os";
import { StudyOsAnalyticsReport } from "@/types/study-analytics";
import { StreamId } from "@/types/education";
import { Compass, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function YptAnalyticsPage() {
  const { user } = useAuth();
  const gate = useLearningAccessGate();
  const [report, setReport] = useState<StudyOsAnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const effectiveUserId = user?.id || gate.profile?.id || (gate.profile as any)?.userId || "demo-user";
  const effectiveStream = (gate.profile?.streamId || (gate.profile as any)?.stream || "sciences_exp") as StreamId;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await AnalyticsService.getStudentAnalytics(effectiveUserId, effectiveStream);
        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        console.error("Failed to load YPT analytics:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveUserId, effectiveStream]);

  if (isLoading || !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center space-y-4">
        <Compass className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        <p className="text-xs sm:text-sm text-theme-muted font-sans">
          جاري استخراج مؤشرات نشاط التركيز وتقدم التعلم الحقيقي...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <StudyAnalyticsDashboard report={report} />
    </div>
  );
}
