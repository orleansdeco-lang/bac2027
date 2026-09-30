"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch, useAdminSession } from "@/lib/admin/client";
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Search,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface Exercise {
  id: string;
  title: string;
  subject_id: string;
  stream_id?: string;
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  year?: number;
  is_verified?: boolean;
  created_at?: string;
}

export default function AdminExercisesPage() {
  const { hasPermission } = useAdminSession();
  const canManage = hasPermission("exercises.manage");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New exercise form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("الرياضيات");
  const [newStream, setNewStream] = useState("علوم تجريبية");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [submitting, setSubmitting] = useState(false);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/exercises");
      const data = await res.json();
      if (data.success) {
        setExercises(data.exercises || []);
      } else {
        setError(data.error || "تعذر جلب التمارين");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          subject_id: newSubject,
          stream_id: newStream,
          difficulty: newDifficulty,
          points: 10,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTitle("");
        fetchExercises();
      } else {
        alert(data.error || "فشل إنشاء التمرين");
      }
    } catch (err: any) {
      alert(err?.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExercise = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف التمرين "${title}"؟ هذا الإجراء سيسجل في سجل العمليات.`)) {
      return;
    }

    try {
      const res = await adminFetch(`/api/admin/exercises?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchExercises();
      } else {
        alert(data.error || "فشل حذف التمرين");
      }
    } catch (err: any) {
      alert(err?.message || "خطأ أثناء الحذف");
    }
  };

  const filteredExercises = exercises.filter(
    (ex) =>
      !search ||
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      ex.subject_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>بنك التمارين والمسائل التدريبية</span>
          </h2>
          <p className="text-xs text-slate-400">
            إدارة التمارين النموذجية، مسائل البكالوريا الوزارية، ومفاتيح التصحيح المعتمدة.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تمرين جديد</span>
          </button>
        )}
      </div>

      {/* Search & Stats */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في بنك التمارين بالعنوان أو المادة..."
            className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          إجمالي التمارين: <span className="font-bold text-slate-200">{exercises.length}</span>
        </div>
      </div>

      {/* Exercises Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل بنك التمارين...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-xs bg-red-950/20">
            {error}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد تمارين مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080D1A] border-b border-[#1E293B] text-slate-400 font-medium">
                <tr>
                  <th className="p-4">التمرين / المسألة</th>
                  <th className="p-4">المادة</th>
                  <th className="p-4">الشعبة</th>
                  <th className="p-4">الصعوبة</th>
                  <th className="p-4">الحالة</th>
                  {canManage && <th className="p-4">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {filteredExercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-[#131E36]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{ex.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">{ex.id}</div>
                    </td>
                    <td className="p-4 text-slate-300">{ex.subject_id}</td>
                    <td className="p-4 text-slate-400">{ex.stream_id || "عامة"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          ex.difficulty === "hard"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : ex.difficulty === "medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {ex.difficulty || "medium"}
                      </span>
                    </td>
                    <td className="p-4">
                      {ex.is_verified ? (
                        <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>معتمد</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">مسودة</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteExercise(ex.id, ex.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="حذف التمرين"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-slate-100">إضافة مسألة أو تمرين جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  عنوان المسألة أو التمرين *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: دراسة دالة لوغاريتمية مع المناقشة البيانية (بكالوريا 2024)"
                  className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">المادة</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="العلوم الفيزيائية">العلوم الفيزيائية</option>
                    <option value="علوم الطبيعة والحياة">علوم الطبيعة والحياة</option>
                    <option value="الفلسفة">الفلسفة</option>
                    <option value="اللغة العربية">اللغة العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">الشعبة</label>
                  <select
                    value={newStream}
                    onChange={(e) => setNewStream(e.target.value)}
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="علوم تجريبية">علوم تجريبية</option>
                    <option value="رياضيات">رياضيات</option>
                    <option value="تقني رياضي">تقني رياضي</option>
                    <option value="تسيير واقتصاد">تسيير واقتصاد</option>
                    <option value="آداب وفلسفة">آداب وفلسفة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">مستوى الصعوبة</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="easy">سهل (تطبيق مباشر)</option>
                  <option value="medium">متوسط (مستوى بكالوريا نموذجي)</option>
                  <option value="hard">صعب (مسألة تميز ومفاضلة)</option>
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
                  {submitting ? "جاري الحفظ..." : "حفظ التمرين"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
