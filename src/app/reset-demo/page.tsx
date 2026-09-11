"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { clearAllMissionData } from "@/lib/mission";
import { RotateCcw, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ResetDemoPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const handleResetMissions = () => {
    clearAllMissionData();
    setCleared(true);
    setTimeout(() => {
      router.push("/roadmap");
    }, 1200);
  };

  const handleFullReset = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      setCleared(true);
      setTimeout(() => {
        router.push("/onboarding");
      }, 1200);
    }
  };

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <Container size="sm">
        <Card className="p-6 sm:p-8 border-slate-200 bg-white shadow-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-2">
            <Badge variant="warning" size="sm">
              Development & QA Utility
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Reset Demonstration State
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Safely reset local storage data for automated tests, mission lifecycle verification,
              and clean demonstration loops.
            </p>
          </div>

          {cleared ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Storage successfully cleared! Redirecting...</span>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <Button size="lg" fullWidth onClick={handleResetMissions}>
                <RotateCcw className="h-4 w-4" />
                <span>Reset Missions, Errors & Mastery Only</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                fullWidth
                onClick={handleFullReset}
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <span>Full Reset (Including Onboarding & Diagnostic)</span>
              </Button>

              <Link href="/roadmap" className="block pt-2">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Roadmap</span>
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </Container>
    </main>
  );
}
