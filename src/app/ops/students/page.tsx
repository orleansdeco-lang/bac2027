"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  MessageCircle,
  School,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";
import {
  StudentAnalyticsKPIs,
  FunnelStage,
  DailyGrowthPoint,
  DailyActivityPoint,
  StudentDirectoryItem,
  AnalyticsPeriod,
  RegisteredStudentsAnalyticsResponse,
} from "@/lib/operations/students-analytics";
import { StudentAnalyticsKPIGrid } from "@/components/ops/students/StudentAnalyticsKPIGrid";
import { StudentAnalyticsCharts } from "@/components/ops/students/StudentAnalyticsCharts";
import { StudentFunnelBreakdown } from "@/components/ops/students/StudentFunnelBreakdown";

export default function OpsStudentsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [kpis, setKpis] = useState<StudentAnalyticsKPIs>({
    totalStudents: 0,
    registrationsToday: 0,
    registrationsThisWeek: 0,
    registrationsThisMonth: 0,
    activeToday: 0,
    activeLast7Days: 0,
    activeLast30Days: 0,
    neverActive: 0,
    trialStudents: 0,
    paidStudents: 0,
    expiredSubscriptions: 0,
  });
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [dailyGrowth, setDailyGrowth] = useState<DailyGrowthPoint[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivityPoint[]>([]);
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [totalFilteredStudents, setTotalFilteredStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 25;

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Clear obsolete cached mock students from previous sessions
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("bac_ops_cached_students");
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period, page, searchQuery, statusFilter, streamFilter, wilayaFilter);
  }, [period, page, statusFilter, streamFilter, wilayaFilter]);

  async function fetchAnalytics(
    selectedPeriod: AnalyticsPeriod,
    currentPage: number,
    query: string,
    status: string,
    stream: string,
    wilaya: string
  ) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        page: currentPage.toString(),
        limit: pageSize.toString(),
        status,
        stream,
        wilaya,
      });
      if (query.trim()) {
        params.append("search", query.trim());
      }

      const res = await opsFetch(`/api/ops/students/analytics?${params.toString()}`);
      if (res.ok) {
        const data: RegisteredStudentsAnalyticsResponse = await res.json();
        if (data && data.kpis) {
          setKpis(data.kpis);
          setFunnel(data.funnel || []);
          setDailyGrowth(data.dailyGrowth || []);
          setDailyActivity(data.dailyActivity || []);
          setStudents(data.students || []);
          setTotalFilteredStudents(data.totalFilteredStudents || 0);
          setTotalPages(data.totalPages || 1);
          setLastRefreshed(new Date());
        }
      } else {
        // Fallback: fetch original student endpoint if analytics API failed
        const fallbackRes = await opsFetch("/api/ops/students");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData?.students)) {
            const list: StudentDirectoryItem[] = fallbackData.students.map((s: any) => ({
              ...s,
              isActive: Boolean(s.lastActiveAt),
              isNeverActive: !s.lastActiveAt,
            }));
            setStudents(list);
            setTotalFilteredStudents(list.length);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load registered students analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchAnalytics(period, 1, searchQuery, statusFilter, streamFilter, wilayaFilter);
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
    if (students.length === 0) {
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
      "الثانوية",
      "الولاية",
      "البلدية",
      "حالة الحساب",
      "نوع الباقة",
      "تاريخ التسجيل",
      "آخر نشاط أكاديمي حقيقي",
      "هل نشط في المنصة؟",
      "انتهاء الصلاحية",
    ];

    const rows = students.map((s) => [
      `"${s.id}"`,
      `"${s.fullName || ""}"`,
      `"${s.email || ""}"`,
      `"${s.studentPhone || ""}"`,
      `"${s.parentPhone || ""}"`,
      `"${getStreamLabel(s.streamId)}"`,
      `"${s.schoolName || ""}"`,
      `"${s.wilayaName || ""}"`,
      `"${s.communeName || ""}"`,
      `"${s.accessStatus}"`,
      `"${s.plan}"`,
      `"${s.createdAt ? new Date(s.createdAt).toLocaleString("fr-DZ") : ""}"`,
      `"${s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString("fr-DZ") : "لم ينشط أبداً"}"`,
      `"${s.isActive ? "نشط" : "غير نشط"}"`,
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
    link.setAttribute("download", `shater_students_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getStreamLabel(streamId?: string | null) {
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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>تحليلات وسجل التلاميذ المسجلين</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
              {kpis.totalStudents} تلميذ مسجل
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            بيانات واقعية 100% مستخرجة لحظياً من قاعدة بيانات PostgreSQL: مؤشرات النمو، النشاط التعليمي الحقيقي، ومسار التحويل.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              آخر تحديث: {lastRefreshed.toLocaleTimeString("fr-DZ")}
            </span>
          )}

          <button
            onClick={exportStudentsToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>تصدير CSV / Excel</span>
          </button>

          <button
            onClick={() => fetchAnalytics(period, page, searchQuery, statusFilter, streamFilter, wilayaFilter)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث المؤشرات</span>
          </button>
        </div>
      </div>

      {/* 2. Registered Students 11 Authoritative Database KPI Cards */}
      <StudentAnalyticsKPIGrid kpis={kpis} loading={loading} />

      {/* 3. Time Series Charts: Daily Registrations & Daily Active Students */}
      <StudentAnalyticsCharts
        dailyGrowth={dailyGrowth}
        dailyActivity={dailyActivity}
        period={period}
        onPeriodChange={(newPeriod) => {
          setPeriod(newPeriod);
          setPage(1);
        }}
        loading={loading}
      />

      {/* 4. Lifecycle & Conversion Funnel Breakdown */}
      <StudentFunnelBreakdown funnel={funnel} loading={loading} />

      {/* 5. Directory Search & Filters Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، رقم هاتف التلميذ (05/06/07)، هاتف ولي الأمر، أو معرف الطالب..."
              className="w-full pr-9 pl-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Stream Filter */}
          <select
            value={streamFilter}
            onChange={(e) => {
              setStreamFilter(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل حالات الحساب</option>
            <option value="trial">فترة التجربة (TRIAL)</option>
            <option value="paid">حساب مدفوع (PAID)</option>
            <option value="expired">منتهي الصلاحية (EXPIRED)</option>
          </select>

          {/* Wilaya Filter */}
          {uniqueWilayas.length > 0 && (
            <select
              value={wilayaFilter}
              onChange={(e) => {
                setWilayaFilter(e.target.value);
                setPage(1);
              }}
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

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            بحث
          </button>
        </form>
      </div>

      {/* 6. Students Directory Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">سجل التلاميذ وقاعدة العمليات</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-800/40">
              {totalFilteredStudents} نتيجة
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            صفحة {page} من {totalPages}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>جاري تحميل بيانات التلاميذ والنشاط الأكاديمي...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <UserX className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-slate-200 text-sm">لم يتم العثور على أي تلميذ مطابق</div>
            <div className="text-xs text-slate-500">
              جرب تغيير كلمات البحث أو إعادة تعيين الفلاتر أعلاه.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">معرف وتفاصيل التلميذ</th>
                  <th className="px-4 py-3.5">هاتف التلميذ</th>
                  <th className="px-4 py-3.5">هاتف ولي الأمر</th>
                  <th className="px-4 py-3.5">الشعبة والثانوية</th>
                  <th className="px-4 py-3.5">الولاية والبلدية</th>
                  <th className="px-4 py-3.5">حالة الحساب والباقة</th>
                  <th className="px-4 py-3.5">الانتهاء / المتبقي</th>
                  <th className="px-4 py-3.5">تاريخ التسجيل</th>
                  <th className="px-4 py-3.5">آخر نشاط أكاديمي</th>
                  <th className="px-4 py-3.5 text-left">إجراءات المشرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {students.map((student) => {
                  const studentIntlPhone = student.studentPhone
                    ? `213${student.studentPhone.replace(/\D/g, "").replace(/^0/, "")}`
                    : null;
                  const parentIntlPhone = student.parentPhone
                    ? `213${student.parentPhone.replace(/\D/g, "").replace(/^0/, "")}`
                    : null;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student Identifier */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{student.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[150px] mt-0.5">
                          {student.email || student.id}
                        </div>
                      </td>

                      {/* Student Phone */}
                      <td className="px-4 py-3.5" dir="ltr">
                        {student.studentPhone ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-300 font-semibold">
                            <a
                              href={`tel:${student.studentPhone}`}
                              className="hover:underline inline-flex items-center gap-1 text-cyan-400"
                              title="اتصال هاتفي بالطالب"
                            >
                              <Phone className="w-3 h-3 text-cyan-500 shrink-0" />
                              <span>{student.studentPhone}</span>
                            </a>
                            {studentIntlPhone && (
                              <a
                                href={`https://wa.me/${studentIntlPhone}?text=${encodeURIComponent(`السلام عليكم ${student.fullName}، نتصل بكم من إدارة منصة الشاطر`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                title="مراسلة التلميذ عبر واتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-sans">—</span>
                        )}
                      </td>

                      {/* Parent Phone */}
                      <td className="px-4 py-3.5" dir="ltr">
                        {student.parentPhone ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-amber-300">
                            <a
                              href={`tel:${student.parentPhone}`}
                              className="hover:underline inline-flex items-center gap-1 text-amber-400"
                              title="اتصال بولي الأمر"
                            >
                              <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{student.parentPhone}</span>
                            </a>
                            {parentIntlPhone && (
                              <a
                                href={`https://wa.me/${parentIntlPhone}?text=${encodeURIComponent(`السلام عليكم، نتصل بكم من إدارة منصة الشاطر بخصوص حساب التلميذ(ة) ${student.fullName}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                title="مراسلة الولي عبر واتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-sans text-[11px]">غير محدد</span>
                        )}
                      </td>

                      {/* Stream & School */}
                      <td className="px-4 py-3.5 text-xs text-slate-300">
                        <div className="font-semibold text-slate-200">
                          {getStreamLabel(student.streamId)}
                        </div>
                        {student.schoolName && (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-300/80 mt-0.5 truncate max-w-[140px]">
                            <School className="w-3 h-3 shrink-0" />
                            <span className="truncate">{student.schoolName}</span>
                          </div>
                        )}
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

                      {/* Status & Plan */}
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

                      {/* Registration Date */}
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

                      {/* Last Active Date (Ground Truth) */}
                      <td className="px-4 py-3.5 text-[11px] font-mono text-slate-400" dir="ltr">
                        {student.lastActiveAt ? (
                          <div>
                            <div className="text-slate-200 font-semibold">
                              {new Date(student.lastActiveAt).toLocaleDateString("fr-DZ")}
                            </div>
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>
                                {new Date(student.lastActiveAt).toLocaleTimeString("fr-DZ", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 font-sans">
                            لم ينشط أبداً
                          </span>
                        )}
                      </td>

                      {/* Operator Actions */}
                      <td className="px-4 py-3.5 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {student.accessStatus !== "PAID" && (
                            <div className="inline-flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5 shadow-sm">
                              <button
                                type="button"
                                disabled={activatingId !== null}
                                onClick={() => handleQuickActivate(student.id, student.fullName, "season")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold transition-all cursor-pointer shrink-0"
                                title="تفعيل اشتراك سنة دراسية كاملة (365 يوم)"
                              >
                                {activatingId === `${student.id}_season` ? (
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <Zap className="w-2.5 h-2.5" />
                                )}
                                <span>سنوي</span>
                              </button>

                              <button
                                type="button"
                                disabled={activatingId !== null}
                                onClick={() => handleQuickActivate(student.id, student.fullName, "monthly")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-bold transition-all cursor-pointer shrink-0 mr-1"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold hover:border-slate-600 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابق</span>
            </button>

            <span className="text-xs font-mono text-slate-400">
              صفحة {page} من {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold hover:border-slate-600 transition-colors"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
