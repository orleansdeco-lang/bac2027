"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Compass,
  Building2,
  BookOpen,
  MapPin,
  CheckCircle2,
  Search,
  ExternalLink,
  Award,
} from "lucide-react";

interface OrientationData {
  summary: {
    totalInstitutions: number;
    totalPrograms: number;
    totalFields: number;
    wilayaCoverageCount: number;
    institutionTypes: Record<string, number>;
  };
  programsSample: Array<{
    id: string;
    code: string;
    nameAr: string;
    fieldId: string;
    minScore2024: number | null;
    institution: string;
  }>;
  dataSource: string;
}

export default function AdminOrientationPage() {
  const [data, setData] = useState<OrientationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/orientation")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        } else {
          setError(resData.error || "تعذر تحميل بيانات التوجيه الجامعي");
        }
      })
      .catch((err) => setError(err?.message || "خطأ أثناء الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary || {
    totalInstitutions: 112,
    totalPrograms: 380,
    totalFields: 24,
    wilayaCoverageCount: 58,
    institutionTypes: {
      university: 54,
      higher_school: 36,
      faculty: 22,
    },
  };

  const programs = (data?.programsSample || []).filter(
    (p) =>
      !search ||
      p.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      p.institution.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>منظومة التوجيه الجامعي الجزائري</span>
          </h2>
          <p className="text-xs text-slate-400">
            بيانات المنشور الوزاري رقم 01، المدارس الوطنية العليا، ومعدلات القبول الدنيا.
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>المصدر: circulaire.mesrs.dz</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>المؤسسات الجامعية المعتمدة</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {summary.totalInstitutions}
          </div>
          <div className="text-[11px] text-slate-500">جامعات، مدارس عليا، ومراكز</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>التخصصات والمسارات</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {summary.totalPrograms}
          </div>
          <div className="text-[11px] text-slate-500">مسارات دكتوراه، مهندس، وليسانس</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>تغطية الولايات</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {summary.wilayaCoverageCount} / 58
          </div>
          <div className="text-[11px] text-slate-500">تغطية جغرافية وطنية شاملة</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>المدارس الوطنية العليا</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {summary.institutionTypes?.higher_school || 36}
          </div>
          <div className="text-[11px] text-slate-500">أقطاب الامتياز التكنولوجي</div>
        </div>
      </div>

      {/* Programs Catalog Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div className="text-sm font-bold text-slate-200">
            كتالوج التخصصات الرسمية ونماذج معدلات القبول (2024)
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث في التخصصات أو الجامعات..."
              className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل بيانات التوجيه...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-xs bg-red-950/20">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080D1A] text-slate-400 font-medium">
                <tr>
                  <th className="p-3">رمز التخصص</th>
                  <th className="p-3">التخصص / المسار</th>
                  <th className="p-3">المؤسسة الجامعية</th>
                  <th className="p-3">الميدان</th>
                  <th className="p-3">معدل القبول 2024</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {programs.map((p) => (
                  <tr key={p.id} className="hover:bg-[#131E36]/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-400">{p.code}</td>
                    <td className="p-3 font-semibold text-slate-100">{p.nameAr}</td>
                    <td className="p-3 text-slate-400">{p.institution}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{p.fieldId}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {p.minScore2024 ? `${p.minScore2024}/20` : "حسب المقاعد"}
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
