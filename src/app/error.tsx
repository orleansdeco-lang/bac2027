"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans antialiased flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E2D5] shadow-lg">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            خطأ غير متوقع
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1E3A34]">
            حدث خطأ أثناء تحميل الصفحة
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            نعتذر عن هذا الخطأ المؤقت. يمكنك إعادة المحاولة أو العودة للصفحة الرئيسية.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
