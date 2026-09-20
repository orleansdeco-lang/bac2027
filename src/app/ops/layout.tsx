"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { OpsSidebar } from "@/components/ops/OpsSidebar";
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { opsFetch } from "@/lib/operations/client-api";
import { AdminNotifications } from "@/components/ops/AdminNotifications";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 1. Immediately exempt /ops/login from authorization lock
  const isLoginPage = pathname === "/ops/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    if (isLoading) return;

    if (!user) {
      setAuthorized(false);
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
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying operator authorization...</span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-6 sm:p-7 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-white">403 — Unauthorized Operator Access</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              هذه المنطقة مخصصة حصرياً لمشغلي وإدارة منظومة الشاطر | SHATER. إذا كنت تملك حساب إدارة، يرجى تسجيل الدخول من صفحة الدخول المخصصة للمشغلين.
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#131D31] hover:bg-slate-800 border border-[#1E293B] text-slate-300 text-xs font-semibold transition-colors"
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080D1A] text-slate-100 antialiased font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <OpsSidebar />
      </div>

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#080D1A]/95 backdrop-blur-xl border-b border-[#1E293B] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-[#0D1526] border border-[#1E293B] text-slate-300 hover:text-white"
            title="فتح القائمة"
          >
            <div className="space-y-1 w-4">
              <span className="block h-0.5 w-4 bg-current rounded-full"></span>
              <span className="block h-0.5 w-3 bg-current rounded-full"></span>
              <span className="block h-0.5 w-4 bg-current rounded-full"></span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
              BAC
            </div>
            <span className="text-xs font-bold text-white tracking-tight">Operations Cockpit</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminNotifications />
          <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE
          </span>
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 bg-[#0D1526] border border-[#1E293B]"
            title="العودة لتطبيق الطالب"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Modal */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[80vw] h-full shadow-2xl">
            <OpsSidebar onClose={() => setIsMobileDrawerOpen(false)} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-[#080D1A] pb-24 md:pb-12">
        {/* Desktop Top Control Bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 bg-[#080D1A]/90 border-b border-[#1E293B]/70 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              نظام المراقبة والتحكم اللحظي
            </span>
            <span className="text-xs text-slate-400">
              مركز إدارة منصة الشاطر | SHATER BAC
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AdminNotifications />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1526] border border-[#1E293B] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <span>تطبيق الطالب</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {children}
      </main>

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080D1A]/95 backdrop-blur-2xl border-t border-[#1E293B] flex items-center justify-around py-2 px-1 text-slate-400">
        <Link
          href="/ops/overview"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] transition-colors ${
            pathname === "/ops/overview" ? "text-indigo-400 font-bold" : "hover:text-slate-200"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">⚡</div>
          <span>الرئيسية</span>
        </Link>
        <Link
          href="/ops/finance"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] transition-colors ${
            pathname === "/ops/finance" ? "text-indigo-400 font-bold" : "hover:text-slate-200"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">💳</div>
          <span>الطلبات</span>
        </Link>
        <Link
          href="/ops/subscriptions"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] transition-colors ${
            pathname === "/ops/subscriptions" ? "text-indigo-400 font-bold" : "hover:text-slate-200"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">🏷️</div>
          <span>الأسعار</span>
        </Link>
        <Link
          href="/ops/students"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] transition-colors ${
            pathname === "/ops/students" ? "text-indigo-400 font-bold" : "hover:text-slate-200"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">👥</div>
          <span>الطلاب</span>
        </Link>
      </nav>
    </div>
  );
}
