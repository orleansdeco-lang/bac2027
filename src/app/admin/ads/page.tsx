"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch, useAdminSession } from "@/lib/admin/client";
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  Eye,
  MousePointer,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface AdCampaign {
  id: string;
  title: string;
  placement: string;
  target_stream?: string;
  target_wilaya?: string;
  impressions_count?: number;
  clicks_count?: number;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
}

export default function AdminAdsPage() {
  const { hasPermission } = useAdminSession();
  const canManage = hasPermission("ads.manage");

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState("home_hero");
  const [targetStream, setTargetStream] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/ads");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        setError(data.error || "تعذر جلب الحملات الإعلانية");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const toggleCampaignStatus = async (id: string, currentActive: boolean) => {
    if (!canManage) return;
    try {
      const res = await adminFetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          updates: { is_active: !currentActive },
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
      } else {
        alert(data.error || "فشل تعديل حالة الحملة");
      }
    } catch (err: any) {
      alert(err?.message || "حدث خطأ");
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          placement,
          target_stream: targetStream === "all" ? undefined : targetStream,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setTitle("");
        fetchCampaigns();
      } else {
        alert(data.error || "فشل إنشاء الحملة");
      }
    } catch (err: any) {
      alert(err?.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <span>إدارة الحملات الترويجية والإعلانات</span>
          </h2>
          <p className="text-xs text-slate-400">
            ضبط البانرات، الرسائل التوجيهية للطلاب، والتنبيهات الموجهة حسب الشعبة والولاية.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>حملة إعلانية جديدة</span>
          </button>
        )}
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل الحملات...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-xs bg-red-950/20">
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد حملات إعلانية مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080D1A] border-b border-[#1E293B] text-slate-400 font-medium">
                <tr>
                  <th className="p-4">عنوان الحملة</th>
                  <th className="p-4">الموضع (Placement)</th>
                  <th className="p-4">الجمهور المستهدف</th>
                  <th className="p-4">المشاهدات</th>
                  <th className="p-4">النقرات</th>
                  <th className="p-4">الحالة</th>
                  {canManage && <th className="p-4">التحكم</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-[#131E36]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{camp.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">{camp.id}</div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-indigo-400">
                      {camp.placement}
                    </td>
                    <td className="p-4 text-slate-400">
                      {camp.target_stream || "جميع الشعب"}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{camp.impressions_count || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3 text-slate-500" />
                        <span>{camp.clicks_count || 0}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {camp.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Paused
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="p-4">
                        <button
                          onClick={() => toggleCampaignStatus(camp.id, camp.is_active)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#131E36] transition-colors"
                          title={camp.is_active ? "إيقاف مؤقت" : "تفعيل الحملة"}
                        >
                          {camp.is_active ? (
                            <Pause className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-slate-100">إطلاق حملة إعلانية جديدة</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  عنوان الإعلان / الحملة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: خصم 30% على باقة المراجعة النهائية للبكالوريا"
                  className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الموضع الظاهري</label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="home_hero">الواجهة الرئيسية (Hero Banner)</option>
                  <option value="diwan_banner">ديوان الأسئلة (Diwan Banner)</option>
                  <option value="exam_footer">شريط نهاية الامتحان (Exam Footer)</option>
                  <option value="dashboard_top">لوحة تحكم الطالب (Dashboard Alert)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الشعبة المستهدفة</label>
                <select
                  value={targetStream}
                  onChange={(e) => setTargetStream(e.target.value)}
                  className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">جميع الشعب بدون استثناء</option>
                  <option value="علوم تجريبية">علوم تجريبية فقط</option>
                  <option value="رياضيات">رياضيات فقط</option>
                  <option value="تقني رياضي">تقني رياضي فقط</option>
                  <option value="تسيير واقتصاد">تسيير واقتصاد فقط</option>
                  <option value="آداب وفلسفة">آداب وفلسفة فقط</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? "جاري الإطلاق..." : "إطلاق الحملة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
