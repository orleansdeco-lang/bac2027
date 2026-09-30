"use client";

import React from "react";
import { Printer, Download, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

interface PrintKitClientToolbarProps {
  orderNumber: string;
}

export function PrintKitClientToolbar({ orderNumber }: PrintKitClientToolbarProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-[#0B132B] border border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <span>وثيقة العلبة المادية (SHATER Physical Kit Slip)</span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {orderNumber}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            تنسيق A4 مخصص للإرفاق مع الطرد — اختر "حفظ كـ PDF" أو اطبعها مباشرة.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/admin/orders"
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للطلبات</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          title="اختر Save as PDF من نافذة الطباعة"
        >
          <Download className="w-4 h-4" />
          <span>تحميل PDF</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition-all shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-102"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة الوثيقة (Print)</span>
        </button>
      </div>
    </div>
  );
}
