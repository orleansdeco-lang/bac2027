"use client";

import React, { useEffect, useState } from "react";
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
  Zap,
  MessageCircle,
  ExternalLink,
  Download,
  Banknote,
  PackageCheck,
  Truck,
  Phone,
} from "lucide-react";
import { PaymentOrder } from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

export default function OpsFinancePage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<PaymentOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);
  const [directStudentId, setDirectStudentId] = useState("");
  const [directPlan, setDirectPlan] = useState<"season" | "monthly">("season");
  const [directActivating, setDirectActivating] = useState(false);
  const [directMessage, setDirectMessage] = useState<string | null>(null);

  async function handleDirectActivate(e: React.FormEvent) {
    e.preventDefault();
    const cleanId = directStudentId.trim();
    if (!cleanId) {
      alert("يرجى إدخال معرف الطالب (UUID أو البريد الإلكتروني).");
      return;
    }
    setDirectActivating(true);
    setDirectMessage(null);
    const isSeason = directPlan === "season";
    const planLabel = isSeason ? "سنة دراسية كاملة (365 يوم)" : "اشتراك شهري (30 يوم)";
    try {
      const res = await opsFetch(`/api/ops/students/${encodeURIComponent(cleanId)}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isSeason ? "custom" : "1_month",
          days: isSeason ? 365 : 30,
          plan: directPlan,
          reason: `تفعيل يدوي مباشر (${planLabel}) من صفحة المالية بعد مطابقة وصل واتساب`,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setDirectMessage(`✓ تم تفعيل حساب الطالب (${cleanId}) بنجاح (${planLabel}).`);
        setDirectStudentId("");
        fetchOrders();
      } else {
        alert(`فشل التفعيل: ${data?.error || "خطأ غير معروف"}`);
      }
    } catch {
      alert("حدث خطأ أثناء محاولة التفعيل.");
    } finally {
      setDirectActivating(false);
    }
  }

  async function handleViewReceipt(orderId: string) {
    setLoadingReceiptId(orderId);
    try {
      const res = await opsFetch(`/api/ops/payments/receipt/view?orderId=${orderId}`);
      const data = await res.json();
      if (data?.success && data?.url) {
        setPreviewReceiptUrl(data.url);
      } else {
        alert(data?.error || "فشل تحميل صورة الوصل");
      }
    } catch {
      alert("حدث خطأ أثناء محاولة عرض الوصل");
    } finally {
      setLoadingReceiptId(null);
    }
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const url = statusFilter === "all" ? "/api/ops/payments" : `/api/ops/payments?status=${statusFilter}`;
      const res = await opsFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.orders)) setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function handleApprove(orderId: string) {
    if (!confirm("هل أنت متأكد من قبول الطلب وتفعيل اشتراك التلميذ فورياً؟")) {
      return;
    }

    setProcessingId(orderId);
    setActionMessage(null);
    try {
      const res = await opsFetch("/api/ops/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: "Payment verified by operator in Operations Center" }),
      });

      const data = await res.json();
      if (data?.success) {
        setActionMessage(`✓ تم قبول الطلب #${orderId.slice(0, 8)} وتفعيل اشتراك التلميذ بنجاح.`);
        fetchOrders();
      } else {
        alert(data?.error || "فشل قبول الطلب.");
      }
    } catch {
      alert("خطأ في الاتصال أثناء قبول الطلب.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectingOrder || !rejectionReason.trim()) {
      alert("يرجى ذكر سبب الرفض.");
      return;
    }

    setProcessingId(rejectingOrder.id);
    setActionMessage(null);
    try {
      const res = await opsFetch("/api/ops/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: rejectingOrder.id, reason: rejectionReason.trim() }),
      });

      const data = await res.json();
      if (data?.success) {
        setActionMessage(`✓ تم رفض الطلب #${rejectingOrder.id.slice(0, 8)} وتدوين السبب.`);
        setRejectingOrder(null);
        setRejectionReason("");
        fetchOrders();
      } else {
        alert(data?.error || "فشل رفض الطلب.");
      }
    } catch {
      alert("خطأ في الاتصال أثناء رفض الطلب.");
    } finally {
      setProcessingId(null);
    }
  }

  function exportOrdersToCsv() {
    if (filteredOrders.length === 0) {
      alert("لا توجد طلبات لتصديرها.");
      return;
    }

    const headers = [
      "رقم الطلب",
      "اسم التلميذ",
      "هاتف التلميذ",
      "البريد الإلكتروني",
      "الولاية",
      "الباقة",
      "طريقة الدفع",
      "المبلغ (دج)",
      "الحالة",
      "تاريخ وتوقيت الطلب",
      "الملاحظات أو سبب الرفض",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${o.studentName || ""}"`,
      `"${o.studentPhone || ""}"`,
      `"${o.studentEmail || ""}"`,
      `"${o.wilayaName || ""}"`,
      `"${o.plan}"`,
      `"${o.paymentMethod === "cod" ? "دفع عند الاستلام" : "دفع إلكتروني"}"`,
      `"${o.amount}"`,
      `"${o.status}"`,
      `"${o.submittedAt ? new Date(o.submittedAt).toLocaleString("fr-DZ") : ""}"`,
      `"${(o.notes || o.rejectionReason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shater_finance_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredOrders = orders.filter((o) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = o.studentName ? o.studentName.toLowerCase().includes(q) : false;
      const matchPhone = o.studentPhone ? o.studentPhone.includes(q) : false;
      const matchEmail = o.studentEmail ? o.studentEmail.toLowerCase().includes(q) : false;
      const matchId = o.id.toLowerCase().includes(q);
      const matchUserId = o.userId.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchId && !matchUserId) return false;
    }

    if (methodFilter !== "all") {
      if (methodFilter === "cod" && o.paymentMethod !== "cod") return false;
      if (methodFilter === "online" && o.paymentMethod === "cod") return false;
    }

    return true;
  });

  // Calculate Real Financial Stats
  const approvedTotalDzd = orders
    .filter((o) => o.status === "APPROVED")
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const pendingTotalDzd = orders
    .filter((o) => o.status === "PENDING" || o.status === "DRAFT")
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const onlineOrdersCount = orders.filter((o) => o.paymentMethod !== "cod").length;
  const codOrdersCount = orders.filter((o) => o.paymentMethod === "cod").length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Banknote className="w-6 h-6 text-emerald-400" />
              <span>إدارة المعاملات المالية والاشتراكات</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
              بيانات حقيقية 100%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل التدفقات النقدية، مراجعة وصولات الدفع الإلكتروني، وطلبات الدفع عند الاستلام.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportOrdersToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصدير CSV / Excel</span>
          </button>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </div>

      {/* Success Notifications */}
      {actionMessage && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {directMessage && (
        <div className="p-3.5 bg-cyan-950/60 border border-cyan-800 rounded-2xl text-xs text-cyan-300 flex items-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{directMessage}</span>
        </div>
      )}

      {/* Financial KPIs Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 backdrop-blur-md">
          <div className="text-[11px] text-emerald-400">الإيرادات المؤكدة والمحصلة</div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
            {approvedTotalDzd.toLocaleString("fr-DZ")} <span className="text-xs text-emerald-400 font-sans">دج</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 backdrop-blur-md">
          <div className="text-[11px] text-amber-400">مبالغ قيد المراجعة والتحقق</div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
            {pendingTotalDzd.toLocaleString("fr-DZ")} <span className="text-xs text-amber-400 font-sans">دج</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] text-slate-400">عمليات الدفع الإلكتروني</div>
          <div className="text-xl sm:text-2xl font-extrabold text-cyan-300 font-mono mt-1">
            {onlineOrdersCount} <span className="text-xs text-slate-400 font-sans">طلب</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] text-slate-400">طلبات الدفع عند الاستلام</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono mt-1">
            {codOrdersCount} <span className="text-xs text-slate-400 font-sans">طلب</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Manual Payment Workflow & Direct Activation Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Official WhatsApp Channel */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-800/40 space-y-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>قناة استقبال وصولات الدفع (واتساب)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              قناة نشطة
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            يتم توجيه التلاميذ تلقائياً لإرسال وصل الدفع ومعرف الحساب إلى الرقم المخصص للمشرف:
          </p>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <span className="text-white font-bold tracking-wider" dir="ltr">+213 550 30 32 86</span>
            <a
              href="https://wa.me/213550303286"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-sans font-semibold"
            >
              <span>فتح المحادثة فوراً</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 2: 1-Click Direct Student Activation */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Zap className="w-4 h-4" />
            <span>تفعيل فوري مباشر لحساب التلميذ</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            عند استلام الوصل عبر واتساب أو مباشرة، ألصق معرف الطالب (UUID) أو بريده الإلكتروني لتفعيله:
          </p>

          <form onSubmit={handleDirectActivate} className="space-y-2">
            <div className="inline-flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setDirectPlan("season")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  directPlan === "season"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🎓 سنة كاملة (365 يوم)
              </button>
              <button
                type="button"
                onClick={() => setDirectPlan("monthly")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer mr-1 ${
                  directPlan === "monthly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📅 اشتراك شهري (30 يوم)
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={directStudentId}
                onChange={(e) => setDirectStudentId(e.target.value)}
                placeholder="معرف الطالب (UUID) أو بريده الإلكتروني..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={directActivating || !directStudentId.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {directActivating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>تفعيل...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    <span>تفعيل {directPlan === "season" ? "سنوي" : "شهري"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "all", label: "كل الطلبات" },
            { id: "PENDING", label: "قيد المراجعة" },
            { id: "APPROVED", label: "مقبول" },
            { id: "REJECTED", label: "مرفوض" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل طرق الدفع</option>
            <option value="online">دفع إلكتروني</option>
            <option value="cod">دفع عند الاستلام</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الهاتف..."
              className="w-full pr-8 pl-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">التلميذ / الحساب</th>
                <th className="py-3.5 px-4">الباقة</th>
                <th className="py-3.5 px-4">طريقة الدفع</th>
                <th className="py-3.5 px-4">المبلغ</th>
                <th className="py-3.5 px-4">حالة الطلب</th>
                <th className="py-3.5 px-4">الوصل / الملاحظات</th>
                <th className="py-3.5 px-4">توقيت الطلب</th>
                <th className="py-3.5 px-4 text-left">إجراء المشرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((o) => {
                const isPending = o.status === "PENDING" || o.status === "DRAFT";
                return (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">
                        {o.studentName || o.studentEmail || "تلميذ مسجل"}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400 mt-0.5" dir="ltr">
                        {o.studentPhone ? (
                          <a href={`tel:${o.studentPhone}`} className="hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{o.studentPhone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500">لا يوجد هاتف</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-semibold uppercase">
                        {o.plan === "season" ? "سنة كاملة" : o.plan === "monthly" ? "شهري" : o.plan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 font-medium">
                        {o.paymentMethod === "cod" ? "دفع عند الاستلام" : "دفع إلكتروني"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      {Number(o.amount).toLocaleString("fr-DZ")} <span className="text-xs text-slate-400 font-sans">دج</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                          o.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : o.status === "REJECTED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : o.status === "CANCELLED"
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {o.status === "APPROVED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : o.status === "REJECTED" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{o.status === "APPROVED" ? "مقبول" : o.status === "REJECTED" ? "مرفوض" : "قيد المراجعة"}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-xs">
                      <div className="truncate text-xs">{o.notes || o.rejectionReason || "—"}</div>
                      {o.receiptPath && (
                        <button
                          onClick={() => handleViewReceipt(o.id)}
                          disabled={loadingReceiptId === o.id}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{loadingReceiptId === o.id ? "جاري التحميل..." : "عرض وصل الدفع"}</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]" dir="ltr">
                      {o.submittedAt ? (
                        <div>
                          <div>{new Date(o.submittedAt).toLocaleDateString("fr-DZ")}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(o.submittedAt).toLocaleTimeString("fr-DZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-left">
                      {isPending ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(o.id)}
                            disabled={processingId === o.id}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            قبول وتفعيل
                          </button>
                          <button
                            onClick={() => setRejectingOrder(o)}
                            disabled={processingId === o.id}
                            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-400 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            رفض
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {o.reviewedBy ? `مؤكد` : "منتهي"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    {orders.length === 0
                      ? "لا توجد أي طلبات دفع وهمية. سجل المعاملات نظيف وواقعي 100%."
                      : "لا توجد طلبات تطابق الفلتر المحدد."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>رفض طلب الدفع</span>
            </div>

            <p className="text-xs text-slate-300">
              رفض الطلب <span className="font-mono text-white font-semibold">#{rejectingOrder.id.slice(0, 8)}</span> بمبلغ ({rejectingOrder.amount} دج).
              يرجى كتابة سبب الرفض بوضوح ليظهر في السجل:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: صورة الوصل غير واضحة، رقم العملية غير مطابق، الخ..."
              className="w-full h-24 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionReason("");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>وصل الدفع المرفوع</span>
              </div>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ إغلاق
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-2 flex items-center justify-center max-h-[70vh] overflow-auto">
              {previewReceiptUrl.startsWith("data:application/pdf") ? (
                <div className="text-center py-10 space-y-3">
                  <FileText className="w-12 h-12 text-red-400 mx-auto" />
                  <span className="text-xs text-slate-300 block">مستند PDF مرفق</span>
                  <a
                    href={previewReceiptUrl}
                    download="payment_receipt.pdf"
                    className="inline-block px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold"
                  >
                    تحميل ملف PDF
                  </a>
                </div>
              ) : (
                <img
                  src={previewReceiptUrl}
                  alt="وصل الدفع"
                  className="max-h-[65vh] object-contain rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
