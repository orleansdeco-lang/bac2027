"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  MapPin,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  stream: string;
  wilaya: string | number;
  target_score?: number;
  created_at: string;
  status?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (search) params.set("search", search);
      if (streamFilter) params.set("stream", streamFilter);
      if (wilayaFilter) params.set("wilaya", wilayaFilter);

      const res = await adminFetch(`/api/admin/students?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setStudents(data.students || []);
        setTotal(data.pagination?.total || 0);
      } else {
        setError(data.error || "تعذر جلب بيانات الطلاب");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [page, search, streamFilter, wilayaFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>سجل الطلاب وقاعدة المستخدمين</span>
          </h2>
          <p className="text-xs text-slate-400">
            البحث في بيانات الطلاب المسجلين، الشعب، الولايات، والمعدلات المستهدفة.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0D1526] border border-[#1E293B] px-3 py-1.5 rounded-xl">
          <span>إجمالي الطلاب:</span>
          <span className="font-bold text-slate-200">{total}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="البحث بالاسم، البريد الإلكتروني، أو المعرف..."
            className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Stream Filter */}
        <div className="flex items-center gap-2">
          <select
            value={streamFilter}
            onChange={(e) => {
              setStreamFilter(e.target.value);
              setPage(1);
            }}
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

          {/* Wilaya Filter */}
          <input
            type="text"
            value={wilayaFilter}
            onChange={(e) => {
              setWilayaFilter(e.target.value);
              setPage(1);
            }}
            placeholder="الولاية (مثال: 16)"
            className="w-28 bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل سجلات الطلاب...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-xs bg-red-950/20">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لم يتم العثور على طلاب يطابقون معايير البحث الحالية.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080D1A] border-b border-[#1E293B] text-slate-400 font-medium">
                <tr>
                  <th className="p-4">الطالب</th>
                  <th className="p-4">الشعبة</th>
                  <th className="p-4">الولاية</th>
                  <th className="p-4">المعدل المستهدف</th>
                  <th className="p-4">تاريخ التسجيل</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-[#131E36]/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">
                        {student.name || "طالب شاطر"}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {student.email || student.id}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080D1A] border border-[#1E293B] text-[11px]">
                        <GraduationCap className="w-3 h-3 text-indigo-400" />
                        <span>{student.stream || "غير محدد"}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{student.wilaya || "—"}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      {student.target_score ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-400">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{student.target_score}/20</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {student.created_at
                        ? new Date(student.created_at).toLocaleDateString("ar-DZ")
                        : "—"}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-[#0A101D] border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
          <div>
            الصفحة <span className="font-mono text-slate-200">{page}</span> من{" "}
            <span className="font-mono text-slate-200">
              {Math.max(1, Math.ceil(total / 15))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-[#0D1526] border border-[#1E293B] hover:bg-[#131E36] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 15)}
              className="p-1.5 rounded-lg bg-[#0D1526] border border-[#1E293B] hover:bg-[#131E36] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
