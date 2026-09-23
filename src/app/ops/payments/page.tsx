"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  FileText,
  ExternalLink,
  Download,
  Banknote,
  PackageCheck,
  Truck,
  Phone,
  MessageCircle,
  Eye,
  User,
  MapPin,
  GraduationCap,
  Calendar,
  ChevronRight,
  ShieldCheck,
  ZoomIn,
  RotateCw,
  X,
  Sparkles,
} from "lucide-react";
import { PaymentOrder } from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

export default function OpsPaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "COD">("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modals state
  const [rejectingOrder, setRejectingOrder] = useState<PaymentOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionCustomText, setRejectionCustomText] = useState("");
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [previewReceiptTitle, setPreviewReceiptTitle] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Fetch orders from server
  async function fetchOrders(isManualRefresh = false) {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await opsFetch("/api/ops/payments?limit=200");
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } else {
        showToast("error", "فشل تحميل قائمة الطلبات من الخادم");
      }
    } catch (err: any) {
      showToast("error", err?.message || "حدث خطأ أثناء جلب الطلبات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function showToast(type: "success" | "error" | "info", text: string) {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }

  // Authoritative Approval Handler
  async function handleApprove(order: PaymentOrder) {
    if (processingId) return;
    setProcessingId(order.id);

    try {
      const res = await opsFetch("/api/ops/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: "تم التحقق من الوصل والموافقة عبر لوحة العمليات",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update order in state authoritatively
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "APPROVED",
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: "OPERATOR",
                }
              : o
          )
        );
        showToast(
          "success",
          `تمت الموافقة بنجاح على الطلب (${order.id.slice(0, 8)}) وترقية الطالب إلى PAID فوراً!`
        );
      } else {
        showToast("error", data.error || "فشلت الموافقة في قاعدة البيانات");
      }
    } catch (err: any) {
      showToast("error", err?.message || "حدث استثناء أثناء تأكيد الدفع");
    } finally {
      setProcessingId(null);
    }
  }

  // Authoritative Rejection Handler
  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingOrder || processingId) return;

    const finalReason =
      rejectionReason === "custom"
        ? rejectionCustomText.trim()
        : rejectionReason || "وصل التحويل غير واضح أو غير مطابق للمبلغ";

    if (!finalReason) {
      showToast("error", "يرجى تحديد أو إدخال سبب الرفض");
      return;
    }

    setProcessingId(rejectingOrder.id);

    try {
      const res = await opsFetch("/api/ops/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: rejectingOrder.id,
          reason: finalReason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === rejectingOrder.id
              ? {
                  ...o,
                  status: "REJECTED",
                  rejectionReason: finalReason,
                  reviewedAt: new Date().toISOString(),
                }
              : o
          )
        );
        showToast("info", `تم رفض الطلب (${rejectingOrder.id.slice(0, 8)}) وحفظ السبب في قاعدة البيانات.`);
        setRejectingOrder(null);
        setRejectionReason("");
        setRejectionCustomText("");
      } else {
        showToast("error", data.error || "فشل تسجيل رفض الطلب في قاعدة البيانات");
      }
    } catch (err: any) {
      showToast("error", err?.message || "حدث خطأ أثناء معالجة الرفض");
    } finally {
      setProcessingId(null);
    }
  }

  // Filtered & Searched Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter === "PENDING" && order.status !== "PENDING") return false;
      if (statusFilter === "APPROVED" && order.status !== "APPROVED") return false;
      if (statusFilter === "REJECTED" && order.status !== "REJECTED") return false;
      if (statusFilter === "COD" && order.orderType !== "COD") return false;

      // Method filter
      if (methodFilter !== "ALL" && order.paymentMethod !== methodFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const studentName = (order.studentName || order.shippingName || "").toLowerCase();
        const studentEmail = (order.studentEmail || "").toLowerCase();
        const studentPhone = (order.studentPhone || order.shippingPhone || "").toLowerCase();
        const wilaya = (order.wilayaName || order.shippingWilaya || "").toLowerCase();
        const orderId = order.id.toLowerCase();
        const plan = order.plan.toLowerCase();

        return (
          studentName.includes(q) ||
          studentEmail.includes(q) ||
          studentPhone.includes(q) ||
          wilaya.includes(q) ||
          orderId.includes(q) ||
          plan.includes(q)
        );
      }

      return true;
    });
  }, [orders, statusFilter, methodFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING");
    const approved = orders.filter((o) => o.status === "APPROVED");
    const rejected = orders.filter((o) => o.status === "REJECTED");
    const cod = orders.filter((o) => o.orderType === "COD");
    const totalRevenue = approved.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const pendingRevenue = pending.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    return {
      total,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      codCount: cod.length,
      totalRevenue,
      pendingRevenue,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : "bg-indigo-950/90 border-indigo-500/50 text-indigo-200"
          }`}
        >
          {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === "error" && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === "info" && <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-lg mr-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              إدارة المدفوعات والاشتراكات
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#131D31] text-indigo-400 border border-indigo-500/30">
                Operations Center
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            مراجعة وتأكيد وصولات الدفع وتفعيل حسابات الطلاب في Supabase عبر معاملات ذرية (Atomic Transactions).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131D31] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>تحديث القائمة</span>
          </button>

          <Link
            href="/ops/subscriptions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>ضبط أسعار الخطط</span>
          </Link>
        </div>
      </div>

      {/* Real-Time KPIs Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Pending Card */}
        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            statusFilter === "PENDING"
              ? "bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10"
              : "bg-[#0D1526]/80 hover:bg-[#0D1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium">في الانتظار (Review Queue)</span>
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="text-2xl font-black text-white">{stats.pendingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            بقيمة: <span className="font-mono text-amber-300">{stats.pendingRevenue.toLocaleString()} دج</span>
          </div>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            statusFilter === "APPROVED"
              ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
              : "bg-[#0D1526]/80 hover:bg-[#0D1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">الطلبات المقبولة (PAID)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{stats.approvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            الإيرادات: <span className="font-mono text-emerald-300">{stats.totalRevenue.toLocaleString()} دج</span>
          </div>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => setStatusFilter("REJECTED")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            statusFilter === "REJECTED"
              ? "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-500/10"
              : "bg-[#0D1526]/80 hover:bg-[#0D1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium">المرفوضة (Rejected)</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{stats.rejectedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">وصل غير صالح أو ملغى</div>
        </div>

        {/* COD Card */}
        <div
          onClick={() => setStatusFilter("COD")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            statusFilter === "COD"
              ? "bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
              : "bg-[#0D1526]/80 hover:bg-[#0D1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-medium">الدفع عند الاستلام (COD)</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{stats.codCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">توصيل بطاقات شاطر</div>
        </div>

        {/* Total Orders Card */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            statusFilter === "ALL"
              ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
              : "bg-[#0D1526]/80 hover:bg-[#0D1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-medium">إجمالي الطلبات (All)</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">كامل سجل المنظومة</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "COD"] as const).map((filter) => {
            const isActive = statusFilter === filter;
            const labels = {
              ALL: `الكل (${stats.total})`,
              PENDING: `في الانتظار (${stats.pendingCount})`,
              APPROVED: `مقبول (${stats.approvedCount})`,
              REJECTED: `مرفوض (${stats.rejectedCount})`,
              COD: `توصيل (${stats.codCount})`,
            };
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-[#131D31] text-slate-400 hover:text-white hover:bg-[#1A263F]"
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        {/* Search & Method Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Method Selector */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[#131D31] border border-[#1E293B] text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">كافة طرق الدفع</option>
            <option value="baridimob">بريدي موب (BaridiMob)</option>
            <option value="ccp">حوالة بريدية (CCP)</option>
            <option value="cash">نقداً (Cash / COD)</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الهاتف، الولاية، المعرف..."
              className="w-full bg-[#131D31] border border-[#1E293B] text-white placeholder-slate-500 text-xs rounded-xl pr-9 pl-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">جاري تحميل قائمة المدفوعات من قاعدة البيانات...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#131D31] border border-[#1E293B] flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">لا توجد طلبات دفع مطابقة</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              لم نجد أي طلبات تتوافق مع معايير البحث والفلترة المحددة. جرب تغيير الفلتر أو إلغاء البحث.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#10192E] text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-[#1E293B]">
                <tr>
                  <th className="py-3.5 px-4">الطالب والمعلومات</th>
                  <th className="py-3.5 px-4">الخطة والمبلغ</th>
                  <th className="py-3.5 px-4">طريقة الدفع</th>
                  <th className="py-3.5 px-4">صورة الوصل (Receipt)</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">التاريخ</th>
                  <th className="py-3.5 px-4 text-center">إجراءات التحقق والموافقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 font-medium">
                {filteredOrders.map((order) => {
                  const isPending = order.status === "PENDING";
                  const isApproved = order.status === "APPROVED";
                  const isRejected = order.status === "REJECTED";
                  const isProcessing = processingId === order.id;

                  const studentName = order.studentName || order.shippingName || "طالب بدون اسم";
                  const studentPhone = order.studentPhone || order.shippingPhone;
                  const studentWilaya = order.wilayaName || order.shippingWilaya;
                  const studentStream = order.streamId;

                  const isSeason = order.plan === "season" || order.plan === "bac_season_pass_pilot";
                  const planLabel = isSeason ? "اشتراك الموسم الدراسي (سنة كاملة)" : "الاشتراك الشهري (30 يوم)";
                  const planPrice = Number(order.amount) || (isSeason ? 4900 : 900);

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors hover:bg-[#131D31]/70 ${
                        isPending ? "bg-amber-950/10" : ""
                      }`}
                    >
                      {/* Student Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-950 to-purple-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0 mt-0.5">
                            {studentName.charAt(0) || "ط"}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white hover:text-indigo-400 transition-colors">
                                {studentName}
                              </span>
                              {order.userId && (
                                <Link
                                  href={`/ops/students/${order.userId}`}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 font-mono"
                                  title="فتح ملف الطالب الشامل (Student 360°)"
                                >
                                  <span>Dossier</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                              {studentPhone && (
                                <span className="flex items-center gap-1 font-mono text-slate-300">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {studentPhone}
                                  <a
                                    href={`https://wa.me/213${studentPhone.replace(/^0/, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300 mr-1"
                                    title="مراسلة عبر واتساب"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </a>
                                </span>
                              )}
                              {studentWilaya && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {studentWilaya}
                                </span>
                              )}
                              {studentStream && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                                  {studentStream}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Amount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isSeason
                                ? "bg-purple-950/60 text-purple-300 border-purple-800/60"
                                : "bg-blue-950/60 text-blue-300 border-blue-800/60"
                            }`}
                          >
                            {planLabel}
                          </span>
                          <div className="text-sm font-black text-white font-mono">
                            {planPrice.toLocaleString()}{" "}
                            <span className="text-[10px] font-normal text-slate-400 font-sans">دج</span>
                          </div>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          {order.paymentMethod === "baridimob" && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] font-bold">
                              بريدي موب (BaridiMob)
                            </span>
                          )}
                          {order.paymentMethod === "ccp" && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[11px] font-bold">
                              حوالة بريدية (CCP)
                            </span>
                          )}
                          {order.paymentMethod === "cash" && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              دفع عند الاستلام (COD)
                            </span>
                          )}
                          {!["baridimob", "ccp", "cash"].includes(order.paymentMethod) && (
                            <span className="text-slate-400 font-mono text-[11px]">{order.paymentMethod}</span>
                          )}
                        </div>
                      </td>

                      {/* Receipt Preview */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {order.receiptPath ? (
                          <button
                            onClick={() => {
                              setPreviewReceiptUrl(order.receiptPath!);
                              setPreviewReceiptTitle(`وصل تحويل الطالب: ${studentName}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A263F] hover:bg-[#223354] border border-indigo-500/30 text-indigo-300 hover:text-white text-[11px] font-bold transition-all shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة الوصل</span>
                          </button>
                        ) : order.orderType === "COD" ? (
                          <span className="text-[10px] text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md">
                            توصيل بطاقة فعلية
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">لم يرفق وصل</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-300 text-[11px] font-bold animate-pulse">
                            <Clock className="w-3 h-3" />
                            بانتظار المراجعة
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            مقبول ومفعل (PAID)
                          </span>
                        )}
                        {isRejected && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/50 text-rose-300 text-[11px] font-bold">
                              <XCircle className="w-3 h-3" />
                              مرفوض
                            </span>
                            {order.rejectionReason && (
                              <p className="text-[10px] text-rose-400/80 max-w-xs truncate" title={order.rejectionReason}>
                                {order.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        <div>
                          {new Date(order.submittedAt || order.createdAt).toLocaleDateString("ar-DZ", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(order.submittedAt || order.createdAt).toLocaleTimeString("ar-DZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isPending && (
                            <>
                              {/* Approve Button */}
                              <button
                                onClick={() => handleApprove(order)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>موافقة وتفعيل</span>
                              </button>

                              {/* Reject Button */}
                              <button
                                onClick={() => setRejectingOrder(order)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-rose-950/80 border border-rose-800/40 text-rose-300 hover:text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>رفض</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                              <ShieldCheck className="w-4 h-4" />
                              <span>مفعل في Supabase</span>
                            </div>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleApprove(order)}
                              disabled={isProcessing}
                              className="text-[11px] text-slate-400 hover:text-emerald-400 underline transition-colors"
                            >
                              إعادة قبول
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                {previewReceiptTitle || "معاينة وصل الدفع"}
              </h3>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-2xl p-2 border border-slate-800">
              <img
                src={previewReceiptUrl}
                alt="Payment Receipt"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131D31] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح في تبويب مستقل بدقة كاملة</span>
              </a>

              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-[#0D1526] border border-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-rose-400">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <XCircle className="w-4 h-4 text-rose-400" />
                رفض طلب الدفع
              </h3>
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed">
              أنت على وشك رفض طلب الدفع للطالب{" "}
              <strong className="text-white">
                {rejectingOrder.studentName || rejectingOrder.shippingName || rejectingOrder.id.slice(0, 8)}
              </strong>
              . يرجى توضيح سبب الرفض ليظهر للطالب في حسابه ويسجل في سجل العمليات.
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">سبب الرفض المعتمد:</label>

              {[
                "وصل التحويل غير واضح أو غير مقروء",
                "المبلغ المحول في الوصل لا يطابق سعر الخطة المحددة",
                "وصل التحويل مكرر أو تم استخدامه مسبقاً",
                "رقم المعاملة غير مطابق لسجلات الحساب البريدي",
                "custom",
              ].map((reasonOption) => {
                const isSelected =
                  reasonOption === "custom"
                    ? rejectionReason === "custom"
                    : rejectionReason === reasonOption;

                return (
                  <label
                    key={reasonOption}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-rose-950/30 border-rose-500/50 text-white"
                        : "bg-[#131D31] border-[#1E293B] text-slate-400 hover:bg-[#1A263F]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reasonOption}
                      checked={isSelected}
                      onChange={() => setRejectionReason(reasonOption)}
                      className="accent-rose-500"
                    />
                    <span>{reasonOption === "custom" ? "سبب مخصص آخر (كتابة يدوية)..." : reasonOption}</span>
                  </label>
                );
              })}

              {rejectionReason === "custom" && (
                <textarea
                  required
                  value={rejectionCustomText}
                  onChange={(e) => setRejectionCustomText(e.target.value)}
                  placeholder="اكتب سبب الرفض بالتفصيل..."
                  rows={3}
                  className="w-full bg-[#131D31] border border-rose-500/40 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#131D31] hover:bg-[#1E293B] text-slate-300 text-xs font-semibold"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={processingId !== null}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {processingId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>تأكيد الرفض في قاعدة البيانات</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
