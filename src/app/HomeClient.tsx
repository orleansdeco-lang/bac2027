"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ProgressService } from "@/lib/progress/progress-service";
import { LandingView } from "@/components/landing/LandingView";

export function HomeClient() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const localAuth = localStorage.getItem("bac_auth_user");
      const uid = localAuth ? JSON.parse(localAuth)?.id : undefined;
      if (uid) {
        const sync = ProgressService.getSyncDiagnosticStatus(uid);
        return sync.completed;
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    const effectiveUserId =
      user?.id ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
        : undefined);

    if (effectiveUserId) {
      const sync = ProgressService.getSyncDiagnosticStatus(effectiveUserId);
      if (sync.completed) {
        setIsRedirecting(true);
        const target = sync.lastLessonId ? `/mission/${sync.lastLessonId}` : "/dashboard";
        router.replace(target);
        return;
      }

      ProgressService.checkDiagnosticStatus(effectiveUserId).then((res) => {
        if (res.completed) {
          setIsRedirecting(true);
          const target = res.lastLessonId ? `/mission/${res.lastLessonId}` : "/dashboard";
          router.replace(target);
        }
      });
    }
  }, [user, router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-theme-text gap-3">
        <div className="animate-pulse text-sm font-bold text-[var(--color-primary)] font-mono tracking-widest">
          SHATER BAC...
        </div>
        <p className="text-xs text-theme-secondary font-medium">
          جاري نقلك إلى مسارك الدراسي ومهمتك الحالية...
        </p>
      </div>
    );
  }

  return <LandingView />;
}
