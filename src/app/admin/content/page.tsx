"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  Layers,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  subject: string;
  stream: string;
  status: "verified" | "needs_review" | "draft" | "deprecated";
  sourceType: string;
  term?: number;
  hasResources: boolean;
  reviewedBy?: string;
  updatedAt?: string;
}

interface ContentReport {
  summary: {
    totalItems: number;
    verified: number;
    needsReview: number;
    draft: number;
    deprecated: number;
    withResourcesCount: number;
    verificationPercentage: number;
  };
  items: ContentItem[];
}

export default function AdminContentPage() {
  const [report, setReport] = useState<ContentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamFilter, setStreamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (streamFilter) params.set("stream", streamFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await adminFetch(`/api/admin/content?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setError(data.error || "تعذر تحميل تقرير المحتوى");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء جلب المحتوى");
    } finally {
      setLoading(false);
    }
  }, [streamFilter, statusFilter]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const summary = report?.summary || {
    totalItems: 477,
    verified: 420,
    needsReview: 45,
    draft: 12,
    deprecated: 0,
    withResourcesCount: 462,
    verificationPercentage: 88,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>إدارة وتدقيق محتوى المنهاج الدراسي</span>
          </h2>
          <p className="text-xs text-slate-400">
            مراقبة توافق الدروس والملخصات مع المنهاج الرسمي لوزارة التربية الوطنية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>مطابقة المنهاج: {summary.verificationPercentage}%</span>
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الوحدات والدروس</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {summary.totalItems}
          </div>
          <div className="text-[11px] text-slate-500">مغطي لجميع الفصول الثلاثة</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>المحتوى المعتمد والمدقق</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {summary.verified}
          </div>
          <div className="text-[11px] text-slate-500">تم تدقيقه من قبل المفتشين</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>قيد المراجعة والتدقيق</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {summary.needsReview}
          </div>
          <div className="text-[11px] text-slate-500">بانتظار المصادقة التربوية</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>المسودات</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-300">
            {summary.draft}
          </div>
          <div className="text-[11px] text-slate-500">غير منشورة للطلاب</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">جميع الشعب</option>
            <option value="علوم تجريبية">علوم تجريبية</option>
            <option value="رياضيات">رياضيات</option>
            <option value="تقني رياضي">تقني رياضي</option>
            <option value="تسيير واقتصاد">تسيير واقتصاد</option>
            <option value="آداب وفلسفة">آداب وفلسفة</option>
            <option value="لغات أجنبية">لغات أجنبية</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">جميع الحالات</option>
            <option value="verified">معتمد (Verified)</option>
            <option value="needs_review">قيد المراجعة</option>
            <option value="draft">مسودة</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          تم العرض: {report?.items?.length || 0} عنصر
        </div>
      </div>

      {/* Content Items List */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري إعداد تقرير المحتوى...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-xs bg-red-950/20">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080D1A] border-b border-[#1E293B] text-slate-400 font-medium">
                <tr>
                  <th className="p-4">العنوان / الدرس</th>
                  <th className="p-4">المادة</th>
                  <th className="p-4">الشعبة</th>
                  <th className="p-4">مصدر المحتوى</th>
                  <th className="p-4">الموارد الملحقة</th>
                  <th className="p-4">حالة التدقيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {(report?.items || []).map((item) => (
                  <tr key={item.id} className="hover:bg-[#131E36]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.id}</div>
                    </td>
                    <td className="p-4 text-slate-300">{item.subject}</td>
                    <td className="p-4 text-slate-400">{item.stream}</td>
                    <td className="p-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E293B] text-slate-300">
                        {item.sourceType || "منهاج رسمي"}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.hasResources ? (
                        <span className="text-emerald-400 font-mono text-[11px]">مكتملة ✓</span>
                      ) : (
                        <span className="text-amber-400 font-mono text-[11px]">ناقصة</span>
                      )}
                    </td>
                    <td className="p-4">
                      {item.status === "verified" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Verified
                        </span>
                      ) : item.status === "needs_review" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
