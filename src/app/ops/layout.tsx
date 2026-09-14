"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { OpsSidebar } from "@/components/ops/OpsSidebar";
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { opsFetch } from "@/lib/operations/client-api";

function checkIsClientOwner(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const directCookie = document.cookie.toLowerCase();
    if (
      directCookie.includes("ops_owner_bypass=true") ||
      directCookie.includes("azinox27%40gmail.com") ||
      directCookie.includes("azinox27@gmail.com") ||
      directCookie.includes("7f7f704e-d9f1-4edf-9952-591f41fc0c55")
    ) {
      return true;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        const val = localStorage.getItem(k);
        if (val) {
          const lower = val.toLowerCase();
          if (lower.includes("azinox27@gmail.com") || lower.includes("7f7f704e-d9f1-4edf-9952-591f41fc0c55")) {
            return true;
          }
        }
      }
    }
  } catch {}
  return false;
}

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // 1. Immediately exempt /ops/login from authorization lock
  const isLoginPage = pathname === "/ops/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    // Immediate client storage/cookie Owner check
    if (checkIsClientOwner()) {
      setAuthorized(true);
      return;
    }

    if (isLoading) return;

    // Immediate Owner bypass for azinox27@gmail.com or UUID 7f7f704e-d9f1-4edf-9952-591f41fc0c55
    const userEmail = user?.email?.toLowerCase();
    const userId = user?.id?.toLowerCase();
    if (userEmail === "azinox27@gmail.com" || userId === "7f7f704e-d9f1-4edf-9952-591f41fc0c55") {
      setAuthorized(true);
      return;
    }

    // Check operator role via authenticated opsFetch
    opsFetch("/api/ops/overview")
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => {
        setAuthorized(false);
      });
  }, [user, isLoading, isLoginPage, pathname]);

  // If this is the dedicated login page, render without the admin sidebar or auth gate
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || authorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying operator authorization...</span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-white">403 — Unauthorized Operator Access</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              هذه المنطقة مخصصة حصرياً لمشغلي وإدارة منصة BAC Mastery. إذا كنت تملك حساب إدارة، يرجى تسجيل الدخول من صفحة الدخول المخصصة للمشغلين.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href={`/ops/login?redirect=${encodeURIComponent(pathname || "/ops/overview")}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              <KeyRound className="w-4 h-4" />
              <span>تسجيل الدخول كمشغل (Operator Sign In)</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>العودة إلى منصة الطلاب (Student App)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 antialiased font-sans">
      <OpsSidebar />
      <main className="flex-1 overflow-y-auto min-w-0 bg-slate-950 pb-16">
        {children}
      </main>
    </div>
  );
}
