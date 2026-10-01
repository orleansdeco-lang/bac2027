"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";

interface OrderShipment {
  carrier: string;
  trackingNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "RETURNED";
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
}

interface OrderPayment {
  status: "PENDING" | "PAID" | "COD" | "REJECTED";
  method: string;
  paidAt?: string;
}

interface UnifiedOrder {
  id: string;
  orderNumber: string;
  studentName: string;
  phone: string;
  email?: string;
  wilaya: string;
  commune: string;
  address: string;
  planName: string;
  amount: number;
  deliveryFee: number;
  totalAmount: number;
  isStopDesk: boolean;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "PAID" | "RETURNED" | "CANCELLED";
  orderType: "COD" | "ONLINE" | "BANK_TRANSFER";
  shipment: OrderShipment;
  payment: OrderPayment;
  subscriptionActivated: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersSummary {
  totalOrders: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  codPending: number;
  paid: number;
  returned: number;
}

export default function OperationsOrdersPage() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [summary, setSummary] = useState<OrdersSummary>({
    totalOrders: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    codPending: 0,
    paid: 0,
    returned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("ALL");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Action modals
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [shippingModalOrder, setShippingModalOrder] = useState<UnifiedOrder | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("Yalidine Express");
  const [returnModalOrder, setReturnModalOrder] = useState<UnifiedOrder | null>(null);
  const [returnReasonInput, setReturnReasonInput] = useState("الزبون لم يرد على الهاتف بعد عدة محاولات");

  // Fetch orders
  async function fetchOrders(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await opsFetch("/api/ops/orders");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOrders(json.orders || []);
          if (json.summary) setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // Quick Action Handler
  async function handleAction(orderId: string, action: string, params: Record<string, any> = {}) {
    setActionLoadingId(orderId);
    setActionToast(null);

    try {
      const res = await opsFetch("/api/ops/orders/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action, params }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setActionToast({ message: json.message || "تم تنفيذ العملية بنجاح", type: "success" });
        await fetchOrders(true);
      } else {
        setActionToast({ message: json.error || "تعذر تنفيذ العملية", type: "error" });
      }
    } catch (err: any) {
      setActionToast({ message: err?.message || "فشل الاتصال بالخادم", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Filtered orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tab filter
      if (activeTab === "PENDING" && order.status !== "PENDING") return false;
      if (activeTab === "PROCESSING" && order.status !== "PROCESSING") return false;
      if (activeTab === "SHIPPED" && order.status !== "SHIPPED") return false;
      if (activeTab === "DELIVERED" && order.status !== "DELIVERED") return false;
      if (activeTab === "PAID" && (order.status !== "PAID" && order.payment.status !== "PAID")) return false;
      if (activeTab === "RETURNED" && order.status !== "RETURNED" && order.status !== "CANCELLED") return false;

      // 2. Wilaya filter
      if (selectedWilaya !== "ALL" && order.wilaya !== selectedWilaya) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = order.studentName.toLowerCase().includes(q);
        const matchPhone = order.phone.includes(q);
        const matchOrderNo = order.orderNumber.toLowerCase().includes(q);
        const matchTracking = order.shipment?.trackingNumber?.toLowerCase().includes(q);
        const matchWilaya = order.wilaya?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchOrderNo && !matchTracking && !matchWilaya) return false;
      }

      return true;
    });
  }, [orders, activeTab, selectedWilaya, searchQuery]);

  // List of unique Wilayas in current orders
  const availableWilayas = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.wilaya) set.add(o.wilaya);
    });
    return Array.from(set).sort();
  }, [orders]);

  // Bulk selection toggles
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleToggleSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Export Yalidine CSV Format
  const handleExportYalidineCSV = () => {
    const listToExport = selectedOrders.length > 0
      ? orders.filter((o) => selectedOrders.includes(o.id))
      : filteredOrders;

    if (listToExport.length === 0) {
      alert("لا توجد طلبات للتصدير");
      return;
    }

    const headers = [
      "Order_Number",
      "Customer_Name",
      "Phone",
      "Wilaya",
      "Commune",
      "Address",
      "Is_Stopdesk",
      "Products",
      "Price_COD_DZD",
      "Tracking_Carrier",
      "Status",
    ];

    const rows = listToExport.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.studentName}"`,
      `"${o.phone}"`,
      `"${o.wilaya}"`,
      `"${o.commune || ""}"`,
      `"${(o.address || "").replace(/"/g, '""')}"`,
      o.isStopDesk ? "1" : "0",
      `"${o.planName}"`,
      o.amount,
      `"${o.shipment?.trackingNumber || ""}"`,
      `"${o.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shater_yalidine_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Labels
  const handlePrintLabels = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100" dir="rtl">
      {/* Action Toast */}
      {actionToast && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-xl transition-all ${
            actionToast.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/80 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <span>{actionToast.message}</span>
          </div>
          <button
            onClick={() => setActionToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner / Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/ops" className="hover:text-indigo-400 transition-colors">
              لوحة القيادة
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">إدارة الطلبات والتوصيل (E-Commerce)</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Truck className="w-7 h-7 text-indigo-400" />
            <span>إدارة طلبيات حقائب الشاطر والتوصيل السريع</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
              YALIDINE EXPRESS CONNECT
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            المعالجة الحية للطلبيات، إسناد أرقام التتبع، تصدير ملفات ياليدين، والتحصيل المالي اللحظي
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>تحديث ({filteredOrders.length})</span>
          </button>

          <button
            onClick={handleExportYalidineCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير كشف ياليدين (CSV)</span>
          </button>

          <button
            onClick={handlePrintLabels}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة البوليصات</span>
          </button>
        </div>
      </div>

      {/* 8 Pipeline Stage Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { id: "ALL", label: "كل الطلبات", count: summary.totalOrders, color: "text-white bg-slate-800/80 border-slate-700" },
          { id: "PENDING", label: "جديدة للتأكيد", count: summary.pending, color: "text-amber-300 bg-amber-950/30 border-amber-800/50" },
          { id: "PROCESSING", label: "قيد التغليف", count: summary.processing, color: "text-blue-300 bg-blue-950/30 border-blue-800/50" },
          { id: "SHIPPED", label: "مع الموزع", count: summary.shipped, color: "text-purple-300 bg-purple-950/30 border-purple-800/50" },
          { id: "DELIVERED", label: "تم التسليم", count: summary.delivered, color: "text-teal-300 bg-teal-950/30 border-teal-800/50" },
          { id: "PAID", label: "تم التحصيل", count: summary.paid, color: "text-emerald-300 bg-emerald-950/30 border-emerald-800/50" },
          { id: "RETURNED", label: "راجعة / ملغاة", count: summary.returned, color: "text-rose-300 bg-rose-950/30 border-rose-800/50" },
          { id: "COD_WAIT", label: "مستحقات COD", count: summary.codPending, color: "text-cyan-300 bg-cyan-950/30 border-cyan-800/50" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                tab.color
              } ${
                isActive
                  ? "ring-2 ring-indigo-500 scale-[1.02] shadow-lg"
                  : "hover:border-slate-500 opacity-90 hover:opacity-100"
              }`}
            >
              <span className="text-[11px] font-medium opacity-80 block truncate">{tab.label}</span>
              <span className="text-xl font-black mt-1 font-mono">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search, Wilaya Filter & Bulk Action Toolbar */}
      <div className="bg-[#0D1526] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الهاتف، رقم الطلب، أو التتبع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Wilaya Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="ALL">جميع الولايات ({availableWilayas.length})</option>
              {availableWilayas.map((w) => (
                <option key={w} value={w} className="bg-slate-900 text-white">
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk actions indication */}
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs text-indigo-300 font-semibold">
              <span>تم تحديد {selectedOrders.length} طلب</span>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-xs text-slate-400 hover:text-white underline mr-1"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0D1526] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-4">رقم الطلب والتاريخ</th>
                <th className="p-4">بيانات التلميذ والعنوان</th>
                <th className="p-4">المنتج والحزمة</th>
                <th className="p-4">المبلغ والدفع</th>
                <th className="p-4">حالة الشحن والتتبع</th>
                <th className="p-4">الحالة العامة</th>
                <th className="p-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>جاري تحميل بيانات الطلبيات المباشرة...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    لا توجد طلبيات مطابقة للمعايير المحددة.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrders.includes(order.id);
                  const isActionLoading = actionLoadingId === order.id;

                  // Clean phone number for WhatsApp
                  const cleanPhone = (order.phone || "").replace(/\D/g, "");
                  const intlPhone = cleanPhone.startsWith("0") ? `213${cleanPhone.slice(1)}` : cleanPhone;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isSelected ? "bg-indigo-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Order No & Date */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-white text-xs">
                          {order.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(order.createdAt).toLocaleDateString("ar-DZ")}</span>
                          <span>{new Date(order.createdAt).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </td>

                      {/* Student & Address */}
                      <td className="p-4">
                        <div className="font-bold text-slate-200 text-sm">
                          {order.studentName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${order.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-indigo-400 font-mono"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{order.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(`السلام عليكم ${order.studentName}، نتصل بكم بخصوص طلبكم لحقيبة الشاطر للبكالوريا رقم ${order.orderNumber}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                            title="مراسلة عبر واتساب"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="font-semibold text-slate-300">{order.wilaya}</span>
                          {order.commune && <span>- {order.commune}</span>}
                          {order.isStopDesk && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              مكتب Stopdesk
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="p-4">
                        <div className="font-semibold text-indigo-300 text-xs">
                          {order.planName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          حقيبة فيزيائية + كود التفعيل الذكي
                        </div>
                      </td>

                      {/* Amount & Payment */}
                      <td className="p-4">
                        <div className="font-mono font-black text-emerald-400 text-sm">
                          {order.amount.toLocaleString()} دج
                        </div>
                        <div className="mt-1">
                          {order.payment?.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                              <Check className="w-3 h-3" />
                              تم التحصيل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              دفع عند الاستلام (COD)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Shipment & Tracking */}
                      <td className="p-4">
                        {order.shipment?.trackingNumber ? (
                          <div className="space-y-1">
                            <a
                              href={`https://yalidine.com/tracking/?tracking=${order.shipment.trackingNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 underline"
                            >
                              <span>{order.shipment.trackingNumber}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="text-[10px] text-slate-400">
                              {order.shipment.carrier || "Yalidine Express"}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <span>لم يتم إسناد رقم التتبع</span>
                          </div>
                        )}
                      </td>

                      {/* Order Status Badge */}
                      <td className="p-4">
                        {order.status === "PAID" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            مكتمل ومدفوع
                          </span>
                        )}
                        {order.status === "DELIVERED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                            تم التسليم للزبون
                          </span>
                        )}
                        {order.status === "SHIPPED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            قيد التوصيل (ياليدين)
                          </span>
                        )}
                        {order.status === "PROCESSING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            قيد التجهيز والتغليف
                          </span>
                        )}
                        {order.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            جديد قيد التأكيد
                          </span>
                        )}
                        {order.status === "RETURNED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            طرد راجع
                          </span>
                        )}
                      </td>

                      {/* Quick Actions Buttons */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Ship / Assign Tracking */}
                          {order.status === "PENDING" || order.status === "PROCESSING" ? (
                            <button
                              onClick={() => {
                                setShippingModalOrder(order);
                                setTrackingNumberInput(order.shipment?.trackingNumber || "");
                              }}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all"
                            >
                              <Truck className="w-3 h-3" />
                              <span>شحن</span>
                            </button>
                          ) : null}

                          {/* Mark Delivered */}
                          {order.status === "SHIPPED" && (
                            <button
                              onClick={() => handleAction(order.id, "MARK_DELIVERED")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-teal-600/20 transition-all"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تسليم</span>
                            </button>
                          )}

                          {/* Settle COD & Activate */}
                          {order.payment?.status !== "PAID" && (order.status === "DELIVERED" || order.status === "SHIPPED") && (
                            <button
                              onClick={() => handleAction(order.id, "MARK_COD_PAID")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>تحصيل وتفعيل</span>
                            </button>
                          )}

                          {/* Mark Returned */}
                          {order.status !== "RETURNED" && order.status !== "PAID" && (
                            <button
                              onClick={() => {
                                setReturnModalOrder(order);
                              }}
                              disabled={isActionLoading}
                              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 font-semibold text-[10px] transition-colors"
                              title="تسجيل كراجع"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
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

      {/* Tracking Modal */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1526] border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span>إسناد كود الشحن مع ياليدين</span>
              </h3>
              <button
                onClick={() => setShippingModalOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>الطلب:</strong> {shippingModalOrder.orderNumber}</div>
              <div><strong>الزبون:</strong> {shippingModalOrder.studentName} ({shippingModalOrder.phone})</div>
              <div><strong>العنوان:</strong> {shippingModalOrder.wilaya} - {shippingModalOrder.commune}</div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">شركة التوصيل</label>
                <input
                  type="text"
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">رقم التتبع (Tracking Number)</label>
                <input
                  type="text"
                  placeholder="مثال: yal-12345678"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={async () => {
                  if (!trackingNumberInput.trim()) {
                    alert("يرجى إدخال رقم التتبع");
                    return;
                  }
                  await handleAction(shippingModalOrder.id, "MARK_SHIPPED", {
                    trackingNumber: trackingNumberInput.trim(),
                    carrier: carrierInput,
                  });
                  setShippingModalOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/30"
              >
                تأكيد الشحن
              </button>
              <button
                onClick={() => setShippingModalOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1526] border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>تسجيل الطرد كراجع (Returned)</span>
              </h3>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              هل أنت متأكد من تسجيل طرد {returnModalOrder.studentName} ({returnModalOrder.orderNumber}) كراجع؟
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">سبب الرجوع</label>
              <textarea
                value={returnReasonInput}
                onChange={(e) => setReturnReasonInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={async () => {
                  await handleAction(returnModalOrder.id, "MARK_RETURNED", {
                    reason: returnReasonInput,
                  });
                  setReturnModalOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30"
              >
                تأكيد كراجع
              </button>
              <button
                onClick={() => setReturnModalOrder(null)}
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
