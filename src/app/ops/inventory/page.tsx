"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Sliders,
  DollarSign,
  Boxes,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";
import { KitInventoryItem, InventorySummary } from "@/lib/operations/inventory-store";

export default function OperationsInventoryPage() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Quick Restock Modal
  const [restockModalItem, setRestockModalItem] = useState<KitInventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);

  async function fetchInventory(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await opsFetch("/api/ops/inventory");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) {
          setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchInventory(false);
  }, []);

  async function handleAdjustStock(itemId: string, deltaHand: number) {
    setActionLoadingId(itemId);
    setToast(null);

    try {
      const res = await opsFetch("/api/ops/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, deltaHand }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToast({ message: json.message || "تم تحديث المخزون بنجاح", type: "success" });
        if (json.summary) setSummary(json.summary);
      } else {
        setToast({ message: json.error || "تعذر تحديث المخزون", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "فشل الاتصال بالخادم", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  }

  const items = summary?.items || [];
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.nameAr.toLowerCase().includes(q) ||
      item.nameFr.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/80 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/ops" className="hover:text-indigo-400 transition-colors">
              لوحة القيادة
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">مخزون العلب الورقية والحقائب</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-indigo-400" />
            <span>إدارة مخزون حقائب الشاطر والمطبوعات الذكية</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة العلب الجاهزة، بطاقات التفعيل NFC، الكتيبات الورقية، وصناديق الشحن المقواة
          </p>
        </div>

        <button
          onClick={() => fetchInventory(true)}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
          <span>تحديث المخزون</span>
        </button>
      </div>

      {/* Low Stock Banner Alert */}
      {summary?.hasLowStockAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300">
                تنبيه اقتراب نفاد المخزون (Low Stock Alert)
              </div>
              <div className="text-xs text-amber-300/80 mt-0.5">
                يوجد {summary.lowStockItems.length} صنف وصل إلى حد الأمان الأدنى ويحتاج إلى إعادة طباعة أو توريد عاجل.
              </div>
            </div>
          </div>
          <div className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            تنبيه حرج
          </div>
        </div>
      )}

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-[#0D1526] border border-indigo-500/30">
          <div className="text-xs text-indigo-300 font-semibold">علب الحقائب المتاحة للشحن الفوري</div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {summary?.totalKitsAvailable || 0} <span className="text-sm font-normal text-slate-400">علبة</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>محجوزة لطلبات قيد المعالجة:</span>
            <span className="font-bold text-amber-400 font-mono">{summary?.totalKitsReserved || 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#0D1526] border border-emerald-500/30">
          <div className="text-xs text-emerald-300 font-semibold">إجمالي تقييم المخزون المادي</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
            {(summary?.totalInventoryValuationDzd || 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">دج</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            على أساس تكلفة الإنتاج والطباعة الفعلية
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#0D1526] border border-purple-500/30">
          <div className="text-xs text-purple-300 font-semibold">إجمالي أصناف المخزون المسجلة</div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {summary?.items.length || 0} <span className="text-sm font-normal text-slate-400">مكونات</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            علب + بطاقات + مذكرات + كرتون
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-[#0D1526] border border-amber-500/30">
          <div className="text-xs text-amber-300 font-semibold">حالة مخزون الأمان</div>
          <div className="text-2xl font-black font-mono mt-2 text-white">
            {summary?.hasLowStockAlert ? (
              <span className="text-amber-400">بحاجة للتوريد</span>
            ) : (
              <span className="text-emerald-400">مستقر وكافي</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            حد الأمان الأدنى لكل صنف محدد مسبقاً
          </div>
        </div>
      </div>

      {/* Inventory Search & Table */}
      <div className="bg-[#0D1526] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في المخزون بالاسم أو الرمز (SKU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div className="text-xs text-slate-400">
            إجمالي العناصر: <strong className="text-white font-mono">{filteredItems.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[11px] font-bold">
              <tr>
                <th className="p-4">الرمز (SKU)</th>
                <th className="p-4">اسم الصنف والمكون</th>
                <th className="p-4">المخزون الفعلي (Hand)</th>
                <th className="p-4">المحجوز (Reserved)</th>
                <th className="p-4">المتاح الفوري (Available)</th>
                <th className="p-4">حد الأمان</th>
                <th className="p-4">تكلفة الوحدة</th>
                <th className="p-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    جاري تحميل بيانات المخزون...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    لا توجد أصناف مطابقة للبحث.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const available = Math.max(0, item.quantityOnHand - item.quantityReserved);
                  const isLow = available <= item.safetyThreshold;
                  const isActionLoading = actionLoadingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400 text-xs">
                        {item.sku}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">
                          {item.nameAr}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {item.nameFr}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-200">
                        {item.quantityOnHand}
                      </td>
                      <td className="p-4 font-mono text-amber-400 font-semibold">
                        {item.quantityReserved}
                      </td>
                      <td className="p-4 font-mono font-black text-sm">
                        <span className={isLow ? "text-rose-400" : "text-emerald-400"}>
                          {available}
                        </span>
                        {isLow && (
                          <span className="mr-2 text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            منخفض
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {item.safetyThreshold}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {item.unitCostDzd.toLocaleString()} دج
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(item.id, 10)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all text-[11px] font-bold flex items-center gap-1"
                            title="إضافة 10 قطع للمخزون"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>10+</span>
                          </button>

                          <button
                            onClick={() => handleAdjustStock(item.id, -1)}
                            disabled={isActionLoading || item.quantityOnHand <= 0}
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition-all text-[11px] font-bold flex items-center gap-1"
                            title="خصم قطعة واحدة"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>1-</span>
                          </button>

                          <button
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQty(50);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-all"
                          >
                            إعادة توريد
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Custom Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1526] border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span>إعادة توريد وإضافة كمية للمخزون</span>
              </h3>
              <button
                onClick={() => setRestockModalItem(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>الصنف:</strong> {restockModalItem.nameAr}</div>
              <div><strong>الرمز:</strong> {restockModalItem.sku}</div>
              <div><strong>الكمية الحالية:</strong> {restockModalItem.quantityOnHand} قطعة</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                الكمية الجديدة الموردة (قطع)
              </label>
              <input
                type="number"
                min={1}
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={async () => {
                  await handleAdjustStock(restockModalItem.id, restockQty);
                  setRestockModalItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/30"
              >
                تأكيد إضافة {restockQty} قطعة
              </button>
              <button
                onClick={() => setRestockModalItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
