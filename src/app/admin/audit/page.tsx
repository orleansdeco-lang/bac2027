"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
} from "lucide-react";

interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  before_state?: any;
  after_state?: any;
  metadata?: any;
  created_at: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (resourceFilter) params.set("resourceType", resourceFilter);
      if (actionFilter) params.set("action", actionFilter);

      const res = await adminFetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        setError(data.error || "تعذر جلب سجل العمليات");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [resourceFilter, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>سجل العمليات الإدارية (Append-Only Audit Log)</span>
          </h2>
          <p className="text-xs text-slate-400">
            سجل تدقيق غير قابل للتعديل يوثق كافة التغييرات الحساسة مع تعتيم فوري للبيانات السرية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Append-Only Enforced</span>
          </span>
        </div>
      </div>

      {/* Security Invariant Alert */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            لا يملك أي مدير نظام أو واجهة مستخدم صلاحية حذف أو تعديل سجلات العمليات السابقة (Tamper-Resistant).
          </span>
        </div>
        <span className="font-mono text-slate-500 text-[11px] hidden md:inline-block">
          Table: operations_audit_logs
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">جميع الموارد (All Resources)</option>
            <option value="student">الطلاب (student)</option>
            <option value="exercise">التمارين (exercise)</option>
            <option value="study_room">مجلس العلم (study_room)</option>
            <option value="ad_campaign">الحملات الإعلانية (ad_campaign)</option>
            <option value="content">المحتوى التعليمي (content)</option>
            <option value="system">النظام والسياسات (system)</option>
          </select>

          <input
            type="text"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="تصفية حسب نوع الإجراء (Action)..."
            className="bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          تم العرض: <span className="text-slate-200 font-bold">{logs.length}</span> عملية
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري استرجاع سجل العمليات...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-xs bg-red-950/20">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد سجلات مطابقة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080D1A] border-b border-[#1E293B] text-slate-400 font-medium">
                <tr>
                  <th className="p-4">الوقت والتاريخ</th>
                  <th className="p-4">المسؤول (Actor)</th>
                  <th className="p-4">نوع الإجراء (Action)</th>
                  <th className="p-4">المورد (Resource)</th>
                  <th className="p-4">معرف العنصر</th>
                  <th className="p-4">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#131E36]/40 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("ar-DZ")}
                    </td>
                    <td className="p-4">
                      <span className="text-slate-200 font-semibold truncate block max-w-[140px]">
                        {log.actor_user_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{log.resource_type}</td>
                    <td className="p-4 text-slate-500 truncate max-w-[100px]">
                      {log.resource_id || "—"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="معاينة الحالة السابقة واللاحقة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>تفاصيل العملية:</span>
                  <span className="font-mono text-indigo-400">{selectedLog.action}</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">{selectedLog.id}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">المسؤول: </span>
                  <span className="text-slate-200">{selectedLog.actor_user_id}</span>
                </div>
                <div>
                  <span className="text-slate-500">المورد: </span>
                  <span className="text-slate-200">{selectedLog.resource_type} ({selectedLog.resource_id || "N/A"})</span>
                </div>
              </div>

              {/* Before State */}
              <div>
                <span className="block text-slate-400 text-xs font-semibold mb-1">
                  الحالة السابقة (Before State):
                </span>
                <pre className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] font-mono text-[11px] text-slate-300 overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.before_state, null, 2) || "None"}
                </pre>
              </div>

              {/* After State */}
              <div>
                <span className="block text-slate-400 text-xs font-semibold mb-1">
                  الحالة اللاحقة (After State):
                </span>
                <pre className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.after_state, null, 2) || "None"}
                </pre>
              </div>

              {/* Metadata */}
              {selectedLog.metadata && (
                <div>
                  <span className="block text-slate-400 text-xs font-semibold mb-1">
                    البيانات الوصفية (Metadata):
                  </span>
                  <pre className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] font-mono text-[11px] text-slate-400 overflow-x-auto max-h-28">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1E293B]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-[#131E36] hover:bg-[#1B2A4A] text-slate-200 text-xs"
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
