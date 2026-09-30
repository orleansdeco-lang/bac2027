"use client";

import React, { useEffect, useState, useMemo } from "react";
import { adminFetch } from "@/lib/admin/client";
import { AdminOrderRecord, AdminOrderSummary } from "@/lib/admin/orders";
import { ALGERIAN_WILAYAS } from "@/domain/administrative/algeria-administrative";
import {
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  X,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Phone,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Eye,
  FileText,
  DollarSign,
  ArrowUpRight,
  Send,
  Ban,
  CheckSquare,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [summary, setSummary] = useState<AdminOrderSummary>({
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
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [deliveryStatus, setDeliveryStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [wilayaFilter, setWilayaFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Selected Order for Modal / Drawer
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Dedicated Secure Workflow Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [settlementNote, setSettlementNote] = useState("");
  const [activationReason, setActivationReason] = useState("");

  // Action Inputs inside modal
  const [carrierInput, setCarrierInput] = useState("YALIDINE");
  const [trackingInput, setTrackingInput] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (orderStatus !== "ALL") params.set("orderStatus", orderStatus);
      if (deliveryStatus !== "ALL") params.set("deliveryStatus", deliveryStatus);
      if (paymentStatus !== "ALL") params.set("paymentStatus", paymentStatus);
      if (planFilter !== "ALL") params.set("plan", planFilter);
      if (wilayaFilter !== "ALL") params.set("wilaya", wilayaFilter);
      if (dateFilter) params.set("dateFrom", dateFilter);

      const res = await adminFetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل تحميل بيانات الطلبات");
      }

      setOrders(data.orders || []);
      if (data.summary) {
        setSummary(data.summary);
      }

      // If an order is currently selected, update its reference from the fresh list
      if (selectedOrder) {
        const updated = (data.orders || []).find((o: AdminOrderRecord) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err: any) {
      setError(err?.message || "تعذر الاتصال بخدمة إدارة الطلبات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderStatus, deliveryStatus, paymentStatus, planFilter, wilayaFilter, dateFilter]);

  // Execute Server Action
  const handleAction = async (action: string, extraParams: Record<string, any> = {}) => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await adminFetch("/api/admin/orders/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          action,
          params: {
            ...extraParams,
            carrier: carrierInput,
            trackingNumber: trackingInput || undefined,
            notes: actionNotes || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل تنفيذ العملية.");
      }

      setActionMessage({ text: data.message || "تم تنفيذ العملية بنجاح.", type: "success" });
      await fetchOrders();
    } catch (err: any) {
      setActionMessage({ text: err.message || "حدث خطأ أثناء تنفيذ الإجراء.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedOrderNumber(text);
      setTimeout(() => setCopiedOrderNumber(null), 2000);
    }
  };

  const openOrderModal = (ord: AdminOrderRecord) => {
    setSelectedOrder(ord);
    setCarrierInput(ord.shipment.carrier || "YALIDINE");
    setTrackingInput(ord.shipment.tracking_number || "");
    setActionNotes("");
    setActionMessage(null);
  };

  const resetFilters = () => {
    setSearch("");
    setOrderStatus("ALL");
    setDeliveryStatus("ALL");
    setPaymentStatus("ALL");
    setPlanFilter("ALL");
    setWilayaFilter("ALL");
    setDateFilter("");
  };

  // Badge stylers
  const getOrderStatusBadge = (st: string) => {
    switch (st) {
      case "PENDING":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">قيد المراجعة</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">تم التأكيد</span>;
      case "PROCESSING":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">قيد التجهيز</span>;
      case "SHIPPED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">تم الشحن</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">مكتمل</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">ملغى</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">{st}</span>;
    }
  };

  const getDeliveryStatusBadge = (st: string) => {
    switch (st) {
      case "PENDING":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">قيد الانتظار</span>;
      case "SHIPPED":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">تم الشحن</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">في الطريق</span>;
      case "DELIVERED":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">تم التوصيل</span>;
      case "RETURNED":
      case "FAILED":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">مرتجع / فشل</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">{st}</span>;
    }
  };

  const getPaymentStatusBadge = (st: string) => {
    switch (st) {
      case "COD":
      case "PENDING":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">الدفع عند الاستلام</span>;
      case "DELIVERED_PENDING_SETTLEMENT":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">بانتظار التسوية</span>;
      case "PAID":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">مدفوع (PAID)</span>;
      case "FAILED":
      case "REFUNDED":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">{st}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">{st}</span>;
    }
  };

  const getSubscriptionBadge = (st: string) => {
    switch (st) {
      case "ACTIVE":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">مفعّل ✓</span>;
      case "PENDING":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">في انتظار الدفع</span>;
      case "EXPIRED":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">منتهي</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">{st}</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-100" dir="rtl">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER                                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>إدارة طلبات شاطر (COD & Physical Kit Management)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Operations
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                متابعة شحن العلب المادية، تسوية الدفع عند الاستلام، وتفعيل الاشتراكات بصلاحيات مشددة وسجل تدقيق شامل.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-700/60 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DASHBOARD KPI METRICS (THE 8 REQUIRED CARDS)                */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Orders */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">إجمالي الطلبات</span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{summary.totalOrders}</span>
        </div>

        {/* Pending */}
        <div className="bg-[#0D1526] border border-amber-500/20 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-amber-400 font-bold block">قيد الانتظار</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{summary.pending}</span>
        </div>

        {/* Processing */}
        <div className="bg-[#0D1526] border border-indigo-500/20 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-indigo-400 font-bold block">قيد التجهيز</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">{summary.processing}</span>
        </div>

        {/* Shipped */}
        <div className="bg-[#0D1526] border border-purple-500/20 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-purple-400 font-bold block">تم الشحن</span>
          <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">{summary.shipped}</span>
        </div>

        {/* Delivered */}
        <div className="bg-[#0D1526] border border-blue-500/20 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-blue-400 font-bold block">تم التوصيل</span>
          <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{summary.delivered}</span>
        </div>

        {/* COD Pending */}
        <div className="bg-[#0D1526] border border-amber-500/20 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-amber-300 font-bold block">COD معلق</span>
          <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{summary.codPending}</span>
        </div>

        {/* Paid */}
        <div className="bg-[#0D1526] border border-emerald-500/20 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-emerald-400 font-bold block">تم الدفع (PAID)</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{summary.paid}</span>
        </div>

        {/* Returned */}
        <div className="bg-[#0D1526] border border-rose-500/20 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-rose-400 font-bold block">مرتجع</span>
          <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">{summary.returned}</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. FILTERS TOOLBAR                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>فلترة وتصفية الطلبات</span>
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث برقم الطلب، الاسم، الهاتف..."
              className="w-full bg-[#091122] border border-[#1E293B] text-slate-200 text-xs rounded-xl pr-8 pl-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Order Status */}
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="bg-[#091122] border border-[#1E293B] text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">حالة الطلب: الكل</option>
            <option value="PENDING">قيد المراجعة (PENDING)</option>
            <option value="CONFIRMED">مؤكد (CONFIRMED)</option>
            <option value="PROCESSING">قيد التجهيز (PROCESSING)</option>
            <option value="SHIPPED">تم الشحن (SHIPPED)</option>
            <option value="COMPLETED">مكتمل (COMPLETED)</option>
            <option value="CANCELLED">ملغى (CANCELLED)</option>
          </select>

          {/* Delivery Status */}
          <select
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value)}
            className="bg-[#091122] border border-[#1E293B] text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">حالة التوصيل: الكل</option>
            <option value="PENDING">قيد الانتظار (PENDING)</option>
            <option value="SHIPPED">تم الشحن (SHIPPED)</option>
            <option value="OUT_FOR_DELIVERY">في الطريق (OUT_FOR_DELIVERY)</option>
            <option value="DELIVERED">تم التوصيل (DELIVERED)</option>
            <option value="RETURNED">مرتجع (RETURNED)</option>
            <option value="FAILED">فشل التوصيل (FAILED)</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="bg-[#091122] border border-[#1E293B] text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">حالة الدفع: الكل</option>
            <option value="COD">الدفع عند الاستلام (COD)</option>
            <option value="DELIVERED_PENDING_SETTLEMENT">بانتظار التسوية (PENDING SETTLEMENT)</option>
            <option value="PAID">مدفوع ومحصل (PAID)</option>
            <option value="FAILED">فشل الدفع (FAILED)</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-[#091122] border border-[#1E293B] text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">الخطة: الكل</option>
            <option value="season">الموسم الدراسي الكامل (4900 دج)</option>
            <option value="quarterly">SHATER BAC (1500 دج)</option>
            <option value="monthly">الاشتراك الشهري (900 دج)</option>
          </select>

          {/* Wilaya Filter */}
          <select
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}
            className="bg-[#091122] border border-[#1E293B] text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">الولاية: كل الولايات</option>
            {ALGERIAN_WILAYAS.map((w) => (
              <option key={w.code} value={w.name_ar}>
                {w.code} - {w.name_ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. ORDERS TABLE (THE 10 REQUIRED COLUMNS)                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-[#091122] text-slate-400 font-bold border-b border-[#1E293B] select-none">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>جاري تحميل بيانات الطلبات...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    لا توجد طلبات مطابقة للمعايير المحددة.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-[#131E35] transition-colors cursor-pointer group"
                    onClick={() => openOrderModal(ord)}
                  >
                    {/* Order # */}
                    <td className="py-3 px-4 font-mono font-black text-amber-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.order_number}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(ord.order_number);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity"
                          title="نسخ"
                        >
                          {copiedOrderNumber === ord.order_number ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Student */}
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {ord.student.full_name}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap" dir="ltr">
                      {ord.student.phone}
                    </td>

                    {/* Wilaya */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-200">{ord.shipping_address.wilaya}</span>
                      {ord.shipping_address.commune && (
                        <span className="text-slate-400 text-[11px] block">{ord.shipping_address.commune}</span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-indigo-300">{ord.plan.name}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {ord.amount.toLocaleString()} دج
                    </td>

                    {/* Delivery Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getDeliveryStatusBadge(ord.shipment.status)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getPaymentStatusBadge(ord.payment.status)}
                    </td>

                    {/* Subscription Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSubscriptionBadge(ord.subscription.status)}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString("ar-DZ", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderModal(ord);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
                      >
                        معاينة وإدارة
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. ORDER DETAIL DRAWER / MODAL (FULL SERVER-SIDE ACTIONS)     */}
      {/* ------------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="bg-[#0D182E] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-[#091122]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      تفاصيل الطلب: {selectedOrder.order_number}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedOrder.order_number)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="نسخ رقم الطلب"
                    >
                      {copiedOrderNumber === selectedOrder.order_number ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    تاريخ الطلب: {new Date(selectedOrder.created_at).toLocaleString("ar-DZ")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Feedback Alert */}
              {actionMessage && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                    actionMessage.type === "success"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {actionMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* Status Ribbon (4 Decoupled States) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#091122] border border-slate-700/80">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">1. حالة الطلب (Order):</span>
                  <div>{getOrderStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">2. حالة التوصيل (Delivery):</span>
                  <div>{getDeliveryStatusBadge(selectedOrder.shipment.status)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">3. حالة الدفع (Payment):</span>
                  <div>{getPaymentStatusBadge(selectedOrder.payment.status)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">4. الاشتراك (Subscription):</span>
                  <div>{getSubscriptionBadge(selectedOrder.subscription.status)}</div>
                </div>
              </div>

              {/* Grid 2 Columns: Student/Shipping + Plan/Financial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Student & Shipping Info */}
                <div className="p-4 rounded-2xl bg-[#091122] border border-slate-700/80 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <User className="w-3.5 h-3.5" />
                    <span>معلومات الطالب والتوصيل</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">الاسم الكامل:</span>
                      <strong className="text-white">{selectedOrder.student.full_name}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">رقم الهاتف:</span>
                      <strong className="text-amber-300 font-mono" dir="ltr">{selectedOrder.student.phone}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">الولاية:</span>
                      <strong className="text-white">{selectedOrder.shipping_address.wilaya}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">البلدية:</span>
                      <strong className="text-white">{selectedOrder.shipping_address.commune || "—"}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">العنوان بالتفصيل:</span>
                      <span className="text-slate-200 text-left max-w-xs">{selectedOrder.shipping_address.address || "—"}</span>
                    </div>

                    {selectedOrder.shipping_address.delivery_notes && (
                      <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300 text-[11px]">
                        <span className="font-bold text-slate-400 block">ملاحظات التوصيل:</span>
                        <span>{selectedOrder.shipping_address.delivery_notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Plan & Payment Details */}
                <div className="p-4 rounded-2xl bg-[#091122] border border-slate-700/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>الخطة والمستحقات المالية</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">الخطة المطلوبة:</span>
                      <strong className="text-white">{selectedOrder.plan.name}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">مدة الاشتراك:</span>
                      <strong className="text-white">{selectedOrder.plan.duration_months} أشهر</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">سعر الباقة:</span>
                      <span className="font-mono text-white">{selectedOrder.amount.toLocaleString()} دج</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">مصاريف الشحن:</span>
                      <span className="text-emerald-400 font-bold">مجاناً (0 دج)</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                      <span className="text-slate-300">الإجمالي المستحق كاش:</span>
                      <span className="text-amber-300 font-mono font-black">{selectedOrder.amount.toLocaleString()} دج</span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-400">شركة التوصيل:</span>
                      <span className="font-bold text-white">{selectedOrder.shipment.carrier}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">رقم التتبع (Tracking):</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {selectedOrder.shipment.tracking_number || "غير محدد بعد"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Inputs: Carrier & Tracking */}
              <div className="p-4 rounded-2xl bg-[#091122] border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>تحديث بيانات الشحن والتتبع</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">شركة الشحن:</label>
                    <select
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className="w-full bg-[#0D182E] border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="YALIDINE">Yalidine Express</option>
                      <option value="ZR_EXPRESS">ZR Express</option>
                      <option value="KAZI_TOUR">Kazi Tour</option>
                      <option value="EMS">EMS الجزائر</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">رقم التتبع (Tracking Number):</label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="مثال: YAL-9840124"
                      className="w-full bg-[#0D182E] border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={actionLoading || !trackingInput.trim()}
                      onClick={() => handleAction("ADD_TRACKING_NUMBER")}
                      className="w-full px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      حفظ رقم التتبع
                    </button>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SERVER ACTIONS BAR (THE 9 MANDATORY ACTIONS)                  */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>إجراءات معالجة الطلب (Server-Side Actions):</span>
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {/* Action 1: Confirm Order */}
                  <button
                    type="button"
                    disabled={actionLoading || selectedOrder.status !== "PENDING"}
                    onClick={() => handleAction("CONFIRM_ORDER")}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>تأكيد الطلب (Confirm Order)</span>
                  </button>

                  {/* Action 2: Mark Processing */}
                  <button
                    type="button"
                    disabled={actionLoading || selectedOrder.status === "PROCESSING" || selectedOrder.status === "SHIPPED"}
                    onClick={() => handleAction("MARK_PROCESSING")}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>قيد التجهيز (Mark Processing)</span>
                  </button>

                  {/* Action 3: Mark Shipped */}
                  <button
                    type="button"
                    disabled={actionLoading || selectedOrder.shipment.status === "SHIPPED" || selectedOrder.shipment.status === "DELIVERED"}
                    onClick={() => handleAction("MARK_SHIPPED")}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>تم الشحن (Mark Shipped)</span>
                  </button>

                  {/* Action 4: Mark Delivered (DELIVERED != PAID) */}
                  <button
                    type="button"
                    disabled={actionLoading || selectedOrder.shipment.status === "DELIVERED"}
                    onClick={() => handleAction("MARK_DELIVERED")}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>تم التوصيل (Mark Delivered)</span>
                  </button>

                  {/* Action 5: Mark COD Paid (Opens Confirmation Modal) */}
                  {selectedOrder.payment.status === "PAID" ? (
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 select-none">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم تأكيد الدفع ✓ (PAID)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setSettlementNote("");
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-102"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>تأكيد استلام الدفع</span>
                    </button>
                  )}

                  {/* Action 6: Activate Subscription (Gated behind Payment = PAID) */}
                  {selectedOrder.subscription.status === "ACTIVE" ? (
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 select-none">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>الاشتراك مفعّل ومتاح للطالب ✓ (ACTIVE)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading || selectedOrder.payment.status !== "PAID"}
                      onClick={() => {
                        setActivationReason("");
                        setIsActivationModalOpen(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                        selectedOrder.payment.status === "PAID"
                          ? "bg-amber-600 hover:bg-amber-500 hover:scale-102 ring-2 ring-amber-400/40"
                          : "bg-slate-700/60 opacity-50 cursor-not-allowed"
                      }`}
                      title={selectedOrder.payment.status !== "PAID" ? "يتطلب تأكيد استلام الدفع أولاً (PAID)" : "تفعيل اشتراك الطالب"}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>تفعيل الاشتراك</span>
                    </button>
                  )}

                  {/* Action 7: Mark Returned */}
                  <button
                    type="button"
                    disabled={actionLoading || selectedOrder.shipment.status === "RETURNED"}
                    onClick={() => handleAction("MARK_RETURNED")}
                    className="px-3 py-2 rounded-xl bg-orange-700/60 hover:bg-orange-600 text-orange-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>طرد مرتجع (Mark Returned)</span>
                  </button>

                  {/* Action 8: Cancel Order */}
                  <button
                    type="button"
                    disabled={actionLoading || selectedOrder.status === "CANCELLED"}
                    onClick={() => handleAction("CANCEL_ORDER")}
                    className="px-3 py-2 rounded-xl bg-rose-700/60 hover:bg-rose-600 text-rose-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>إلغاء الطلب (Cancel Order)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-[#091122]">
              <span className="text-[11px] text-slate-400">
                جميع الإجراءات تُنفذ server-side وتُسجل في سجل التدقيق الأمني (Operations Audit Log).
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. CONFIRMATION MODAL: MARK COD PAID (تأكيد استلام الدفع)      */}
      {/* ============================================================= */}
      {isPaymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-[#0B132B] border-2 border-emerald-500/40 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>تأكيد استلام الدفع</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exact Required Order / Amount / Method Display */}
            <div className="p-4 rounded-2xl bg-[#091122] border border-slate-700/80 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans">Order:</span>
                <span className="font-bold text-amber-300 text-sm tracking-wider">{selectedOrder.order_number}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans">Amount:</span>
                <span className="font-bold text-emerald-400 text-base">{selectedOrder.amount.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans">Payment method:</span>
                <span className="font-bold text-white uppercase">{selectedOrder.payment.method || "COD"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 block font-sans">
                ملاحظات التسوية البنكية أو رقم الحوالة من شركة الشحن (اختياري):
              </label>
              <input
                type="text"
                value={settlementNote}
                onChange={(e) => setSettlementNote(e.target.value)}
                placeholder="مثال: تم تأكيد استلام الحوالة من شركة التوصيل ياليدين"
                className="w-full bg-[#091122] border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed font-sans">
              ⚠️ تنبيه: لن يتم تفعيل الاشتراك تلقائياً؛ يمكنك مراجعة وتفعيل الاشتراك لاحقاً عبر زر "تفعيل الاشتراك".
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={async () => {
                  await handleAction("MARK_COD_PAID", { notes: settlementNote });
                  setIsPaymentModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>تأكيد الدفع</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. CONFIRMATION MODAL: ACTIVATE SUBSCRIPTION (تفعيل الاشتراك) */}
      {/* ============================================================= */}
      {isActivationModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-[#0B132B] border-2 border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>تفعيل الاشتراك</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsActivationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#091122] border border-slate-700/80 space-y-2.5 text-xs font-sans">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Order:</span>
                <span className="font-bold text-amber-300 font-mono">{selectedOrder.order_number}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-white">{selectedOrder.student.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Plan:</span>
                <span className="font-bold text-indigo-300">{selectedOrder.plan.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Starts at:</span>
                <span className="font-mono text-emerald-400 font-bold">الآن (Server Time)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Expires at:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  بعد {selectedOrder.plan.duration_months} أشهر (حتى البكالوريا)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed font-sans">
              ✓ تم التحقق: حالة الدفع مسجلة كـ PAID. عند التأكيد، ستتم ترقية حساب الطالب وتفعيل كافة ميزات المنصة فورياً.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsActivationModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={async () => {
                  await handleAction("ACTIVATE_SUBSCRIPTION", { reason: activationReason });
                  setIsActivationModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>تفعيل الاشتراك</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
