"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  UserX,
  Zap,
  RefreshCw,
  Download,
  Phone,
  Calendar,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { StudentOperationalSummary } from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

export default function OpsStudentsPage() {
  const [students, setStudents] = useState<StudentOperationalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [activatingId, setActivatingId] = useState<string | null>(null);

  // Clear obsolete cached mock students from previous sessions
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("bac_ops_cached_students");
      } catch {}
    }
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await opsFetch("/api/ops/students");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.students)) {
          setStudents(data.students);
        }
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickActivate(
    studentId: string,
    studentName: string,
    planType: "season" | "monthly" = "season"
  ) {
    const isSeason = planType === "season";
    const label = isSeason ? "سنة دراسية كاملة (365 يوم)" : "شهر كامل (30 يوم)";
    if (!confirm(`هل أنت متأكد من تفعيل اشتراك الطالب "${studentName}" فورياً كحساب مدفوع (${label})؟`)) {
      return;
    }
    setActivatingId(`${studentId}_${planType}`);
    try {
      const res = await opsFetch(`/api/ops/students/${encodeURIComponent(studentId)}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isSeason ? "custom" : "1_month",
          days: isSeason ? 365 : 30,
          plan: planType,
          reason: `تفعيل يدوي فوري (${label}) من قبل المشرف`,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  accessStatus: "PAID" as const,
                  plan: data.plan || planType,
                  remainingHours: isSeason ? 8760 : 720,
                  subscriptionExpiresAt: data.newExpiresAt,
                }
              : s
          )
        );
        alert(`✓ تم تفعيل حساب الطالب "${studentName}" بنجاح (${label}).`);
      } else {
        alert(`فشل التفعيل: ${data?.error || "خطأ غير معروف"}`);
      }
    } catch {
      alert("حدث خطأ أثناء محاولة التفعيل.");
    } finally {
      setActivatingId(null);
    }
  }

  function exportStudentsToCsv() {
    if (filtered.length === 0) {
      alert("لا توجد بيانات مطابقة للتصدير.");
      return;
    }

    const headers = [
      "معرف الطالب",
      "الاسم الكامل",
      "البريد الإلكتروني",
      "هاتف الطالب",
      "هاتف ولي الأمر",
      "الشعبة",
      "الولاية",
      "البلدية",
      "حالة الحساب",
      "نوع الباقة",
      "تاريخ التسجيل",
      "آخر نشاط وفتح للموقع",
      "انتهاء الصلاحية",
    ];

    const rows = filtered.map((s) => [
      `"${s.id}"`,
      `"${s.fullName || ""}"`,
      `"${s.email || ""}"`,
      `"${s.studentPhone || ""}"`,
      `"${s.parentPhone || ""}"`,
      `"${getStreamLabel(s.streamId)}"`,
      `"${s.wilayaName || ""}"`,
      `"${s.communeName || ""}"`,
      `"${s.accessStatus}"`,
      `"${s.plan}"`,
      `"${s.createdAt ? new Date(s.createdAt).toLocaleString("fr-DZ") : ""}"`,
      `"${s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString("fr-DZ") : ""}"`,
      `"${
        s.subscriptionExpiresAt
          ? new Date(s.subscriptionExpiresAt).toLocaleDateString("fr-DZ")
          : s.trialExpiresAt
          ? new Date(s.trialExpiresAt).toLocaleDateString("fr-DZ")
          : ""
      }"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shater_students_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getStreamLabel(streamId?: string) {
    switch (streamId) {
      case "sciences_exp":
        return "علوم تجريبية";
      case "math":
        return "رياضيات";
      case "technique_math":
        return "تقني رياضي";
      case "gestion_eco":
        return "تسيير واقتصاد";
      case "lettres_philo":
        return "آداب وفلسفة";
      case "langues":
        return "لغات أجنبية";
      default:
        return streamId || "—";
    }
  }

  const filtered = students.filter((s) => {
    // Search query matches name, studentPhone, parentPhone, email, or id
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchPhone = s.studentPhone ? s.studentPhone.includes(q) : false;
      const matchParentPhone = s.parentPhone ? s.parentPhone.includes(q) : false;
      const matchId = s.id.toLowerCase().includes(q);
      const matchEmail = s.email ? s.email.toLowerCase().includes(q) : false;
      if (!matchName && !matchPhone && !matchParentPhone && !matchId && !matchEmail) return false;
    }

    // Stream Filter
    if (streamFilter !== "all" && s.streamId !== streamFilter) {
      return false;
    }

    // Wilaya Filter
    if (wilayaFilter !== "all" && s.wilayaName !== wilayaFilter) {
      return false;
    }

    // Subscription Plan Filter
    if (subscriptionFilter !== "all") {
      if (subscriptionFilter === "season" && s.plan !== "season") return false;
      if (subscriptionFilter === "monthly" && s.plan !== "monthly") return false;
      if (subscriptionFilter === "trial" && s.plan !== "PILOT_TRIAL") return false;
    }

    // General Status Filter
    if (statusFilter !== "all") {
      if (statusFilter === "trial" && s.accessStatus !== "TRIAL") return false;
      if (statusFilter === "paid" && s.accessStatus !== "PAID") return false;
      if (statusFilter === "expired" && s.accessStatus !== "EXPIRED") return false;
      if (statusFilter === "pending_payment" && !s.hasPendingPayment) return false;
    }

    return true;
  });

  const getStatusBadge = (status: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED", hours: number) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold";
      case "TRIAL":
        if (hours <= 12) {
          return "bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse font-semibold";
        }
        return "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-300 border border-rose-500/30";
      case "EXPIRED":
        return "bg-slate-800/80 text-slate-400 border border-slate-700";
    }
  };

  const uniqueWilayas = Array.from(
    new Set(students.map((s) => s.wilayaName).filter(Boolean))
  ) as string[];

  const paidCount = students.filter((s) => s.accessStatus === "PAID").length;
  const trialCount = students.filter((s) => s.accessStatus === "TRIAL").length;
  const pendingPaymentCount = students.filter((s) => s.hasPendingPayment).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>قاعدة بيانات التلاميذ المشتركين والمسجلين</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
              {filtered.length} من {students.length} تلميذ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل واقعي 100% للتلاميذ، معلومات الاتصال (التلميذ وولي الأمر)، أوقات الدخول، وتفاصيل الاشتراكات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportStudentsToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>تصدير CSV / Excel</span>
          </button>

          <button
            onClick={fetchStudents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] text-slate-400">إجمالي التلاميذ المسجلين</div>
          <div className="text-xl font-extrabold text-white font-mono mt-0.5">{students.length}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 backdrop-blur-md">
          <div className="text-[11px] text-emerald-400">الاشتراكات المدفوعة (PAID)</div>
          <div className="text-xl font-extrabold text-emerald-300 font-mono mt-0.5">{paidCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 backdrop-blur-md">
          <div className="text-[11px] text-cyan-400">فترة التجربة النشطة (TRIAL)</div>
          <div className="text-xl font-extrabold text-cyan-300 font-mono mt-0.5">{trialCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 backdrop-blur-md">
          <div className="text-[11px] text-amber-400">طلبات دفع تنتظر المراجعة</div>
          <div className="text-xl font-extrabold text-amber-300 font-mono mt-0.5">{pendingPaymentCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، رقم هاتف التلميذ (05/06/07)، رقم ولي الأمر، أو معرف الطالب..."
              className="w-full pr-9 pl-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Stream Filter */}
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل الشعب الدراسية</option>
            <option value="sciences_exp">علوم تجريبية</option>
            <option value="math">رياضيات</option>
            <option value="technique_math">تقني رياضي</option>
            <option value="gestion_eco">تسيير واقتصاد</option>
            <option value="lettres_philo">آداب وفلسفة</option>
            <option value="langues">لغات أجنبية</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل حالات الحساب</option>
            <option value="trial">فترة التجربة (7 أيام)</option>
            <option value="paid">حساب مدفوع (PAID)</option>
            <option value="expired">منتهي الصلاحية (EXPIRED)</option>
            <option value="pending_payment">لديه طلب دفع قيد المراجعة</option>
          </select>

          {/* Subscription State Filter */}
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل الباقات</option>
            <option value="season">باقة الموسم (سنوي)</option>
            <option value="monthly">باقة شهرية</option>
            <option value="trial">باقة تجريبية</option>
          </select>

          {/* Wilaya Filter */}
          {uniqueWilayas.length > 0 && (
            <select
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="w-full md:w-auto bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">كل الولايات</option>
              {uniqueWilayas.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>جاري تحميل سجل التلاميذ وقاعدة العمليات...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <UserX className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-slate-200 text-sm">لم يتم العثور على أي تلميذ مطابق</div>
            <div className="text-xs text-slate-500">
              {students.length === 0
                ? "قاعدة البيانات نظيفة 100% وخالية من الحسابات الوهمية. ستظهر بيانات أي تلميذ يسجل حسابه فوراً."
                : "جرب تغيير كلمات البحث أو إعادة تعيين الفلاتر أعلاه."}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">التلميذ</th>
                  <th className="px-4 py-3.5">هاتف التلميذ</th>
                  <th className="px-4 py-3.5">هاتف ولي الأمر</th>
                  <th className="px-4 py-3.5">الشعبة</th>
                  <th className="px-4 py-3.5">الولاية والبلدية</th>
                  <th className="px-4 py-3.5">حالة الحساب</th>
                  <th className="px-4 py-3.5">الانتهاء / المتبقي</th>
                  <th className="px-4 py-3.5">وقت التسجيل</th>
                  <th className="px-4 py-3.5">آخر فتح للموقع</th>
                  <th className="px-4 py-3.5 text-left">إجراءات المشرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.map((student) => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{student.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px] mt-0.5">
                          {student.email || student.id}
                        </div>
                      </td>

                      {/* Student Phone */}
                      <td className="px-4 py-3.5 font-mono text-xs text-cyan-300 font-semibold" dir="ltr">
                        {student.studentPhone ? (
                          <a
                            href={`tel:${student.studentPhone}`}
                            className="hover:underline inline-flex items-center gap-1 text-cyan-400"
                            title="اتصال بالطالب"
                          >
                            <Phone className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span>{student.studentPhone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 font-sans">—</span>
                        )}
                      </td>

                      {/* Parent Phone */}
                      <td className="px-4 py-3.5 font-mono text-xs text-amber-300" dir="ltr">
                        {student.parentPhone ? (
                          <a
                            href={`tel:${student.parentPhone}`}
                            className="hover:underline inline-flex items-center gap-1 text-amber-400"
                            title="اتصال بولي الأمر"
                          >
                            <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{student.parentPhone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 font-sans text-[11px]">غير محدد</span>
                        )}
                      </td>

                      {/* Stream */}
                      <td className="px-4 py-3.5 text-slate-200 text-xs font-medium">
                        {getStreamLabel(student.streamId)}
                      </td>

                      {/* Wilaya & Commune */}
                      <td className="px-4 py-3.5 text-xs text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{student.wilayaName || "—"}</span>
                        </div>
                        {student.communeName && (
                          <div className="text-[10px] text-slate-400 mr-4 mt-0.5">
                            {student.communeName}
                          </div>
                        )}
                      </td>

                      {/* Access Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${getStatusBadge(
                            student.accessStatus,
                            student.remainingHours
                          )}`}
                        >
                          {student.accessStatus}
                          {student.plan && student.plan !== "PILOT_TRIAL" ? ` · ${student.plan}` : ""}
                        </span>
                      </td>

                      {/* Remaining / Expiry */}
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-300">
                        {student.accessStatus === "PAID" ? (
                          <span className="text-emerald-400 font-semibold">
                            {student.subscriptionExpiresAt
                              ? new Date(student.subscriptionExpiresAt).toLocaleDateString("fr-DZ")
                              : "ساري المفعول"}
                          </span>
                        ) : student.accessStatus === "TRIAL" ? (
                          <span
                            className={
                              student.remainingHours <= 12
                                ? "text-amber-400 font-bold"
                                : "text-slate-300"
                            }
                          >
                            {student.remainingHours} ساعة متبقية
                          </span>
                        ) : (
                          <span className="text-slate-500">منتهي</span>
                        )}
                      </td>

                      {/* Registration Date & Time */}
                      <td className="px-4 py-3.5 text-[11px] font-mono text-slate-400" dir="ltr">
                        {student.createdAt ? (
                          <div>
                            <div>{new Date(student.createdAt).toLocaleDateString("fr-DZ")}</div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(student.createdAt).toLocaleTimeString("fr-DZ", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Last Active Date & Time */}
                      <td className="px-4 py-3.5 text-[11px] font-mono text-slate-400" dir="ltr">
                        {student.lastActiveAt ? (
                          <div>
                            <div className="text-slate-300">
                              {new Date(student.lastActiveAt).toLocaleDateString("fr-DZ")}
                            </div>
                            <div className="text-[10px] text-cyan-500">
                              {new Date(student.lastActiveAt).toLocaleTimeString("fr-DZ", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Admin Quick Actions */}
                      <td className="px-4 py-3.5 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {student.accessStatus !== "PAID" && (
                            <div className="inline-flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5 shadow-sm">
                              <button
                                type="button"
                                disabled={activatingId !== null}
                                onClick={() => handleQuickActivate(student.id, student.fullName, "season")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold transition-all cursor-pointer shrink-0"
                                title="تفعيل اشتراك سنة دراسية كاملة (365 يوم)"
                              >
                                {activatingId === `${student.id}_season` ? (
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <Zap className="w-2.5 h-2.5" />
                                )}
                                <span>تفعيل سنوي</span>
                              </button>

                              <button
                                type="button"
                                disabled={activatingId !== null}
                                onClick={() => handleQuickActivate(student.id, student.fullName, "monthly")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-bold transition-all cursor-pointer shrink-0 mr-1"
                                title="تفعيل اشتراك شهري (30 يوم)"
                              >
                                {activatingId === `${student.id}_monthly` ? (
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <Clock className="w-2.5 h-2.5" />
                                )}
                                <span>شهري</span>
                              </button>
                            </div>
                          )}

                          <Link
                            href={`/ops/students/${student.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                          >
                            <span>الملف</span>
                            <ArrowRight className="w-3 h-3 rotate-180" />
                          </Link>
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
    </div>
  );
}
