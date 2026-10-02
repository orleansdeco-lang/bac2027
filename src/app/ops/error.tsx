"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, KeyRound, ArrowLeft } from "lucide-react";

export default function OpsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Operations Cockpit caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 font-sans antialiased flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            تنبيه نظام العمليات
          </span>
          <h1 className="text-lg font-bold text-white">حدث خطأ أثناء تحميل لوحة العمليات</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            تعذر استكمال عرض واجهة العمليات. يمكنك إعادة المحاولة أو إعادة تسجيل الدخول بحساب المشغل.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة (Retry)</span>
          </button>

          <Link
            href="/ops/login"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#131D31] hover:bg-slate-800 border border-[#1E293B] text-slate-300 text-xs font-semibold transition-colors"
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>تسجيل الدخول كمشغل (Operator Sign In)</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة لمنصة الطالب</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
