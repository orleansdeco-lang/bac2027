"use client";

import React, { useEffect, useState } from "react";
import { AdminOrderRecord } from "@/lib/admin/orders";
import { PhysicalKitDocumentData } from "@/lib/kit/types";
import { buildPhysicalKitDocumentData } from "@/lib/kit/generator";
import { PhysicalKitDocument } from "./PhysicalKitDocument";
import {
  Printer,
  Download,
  X,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Package,
} from "lucide-react";

interface PhysicalKitModalProps {
  order: AdminOrderRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function PhysicalKitModal({ order, isOpen, onClose }: PhysicalKitModalProps) {
  const [data, setData] = useState<PhysicalKitDocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !order) return;

    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://shater-bac.dz";
        const docData = await buildPhysicalKitDocumentData(order, origin);
        if (isMounted) {
          setData(docData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to build kit document:", err);
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, order]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleOpenStandalone = () => {
    if (typeof window !== "undefined") {
      window.open(`/admin/orders/${order.id}/kit`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print Specific CSS to isolate the document */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden;
          }
          .a4-print-target,
          .a4-print-target * {
            visibility: visible;
          }
          .a4-print-target {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="bg-[#0B132B] border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-[#091122] flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>وثيقة علبة شاطر المادية (Physical Kit Print Slip)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {order.order_number}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                وثيقة A4 مجهزة للطباعة والإرفاق داخل طرد شركة التوصيل مع البطاقة الذكية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Open in new Tab */}
            <button
              type="button"
              onClick={handleOpenStandalone}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="فتح في نافذة كاملة مستقلة"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نافذة جديدة</span>
            </button>

            {/* Download PDF button (triggers browser PDF generation) */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !data}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="حفظ كملف PDF"
            >
              <Download className="w-4 h-4" />
              <span>تحميل PDF</span>
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !data}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black transition-all shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-102"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة (Print)</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / A4 Document Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-900/60 flex justify-center">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RotateCcw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs text-slate-400">جاري توليد وثيقة الـ Kit وتوليد رموز الـ QR...</p>
            </div>
          ) : data ? (
            <div className="a4-print-target shadow-2xl rounded-2xl overflow-hidden">
              <PhysicalKitDocument data={data} />
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-rose-400">
              تعذر توليد وثيقة الـ Kit للطلب المحدد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
