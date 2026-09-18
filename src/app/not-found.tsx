import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowLeft, Home, Calculator, BookOpen, FileCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة 404 | الشاطر SHATER",
  description: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تصفح أدلة البكالوريا 2027 وحاسبة المعدل من هنا.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans antialiased flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E2D5] shadow-lg">
        <div className="w-16 h-16 rounded-3xl bg-[#2C5E54]/10 text-[#2C5E54] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            خطأ 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1E3A34]">
            الصفحة غير موجودة
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            يبدو أن الرابط الذي اتبعته غير صحيح أو أن الصفحة تم نقلها إلى مكان آخر. يمكنك العودة واستكشاف مسارات البكالوريا من الروابط أدناه.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/bac-2027"
              className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E8E2D5] text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>دليل BAC 2027</span>
            </Link>
            <Link
              href="/calculator"
              className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E8E2D5] text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>حاسبة المعدل</span>
            </Link>
            <Link
              href="/curriculum"
              className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E8E2D5] text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>الدروس والمنهاج</span>
            </Link>
            <Link
              href="/exams"
              className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E8E2D5] text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>مواضيع البكالوريا</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
