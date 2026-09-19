"use client";

import React, { useState, useEffect } from "react";
import { BacExperience, ExperienceStatus } from "@/types/experience";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Search,
  Filter,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Target,
  RefreshCw,
  Eye,
  Send,
  X,
  Check,
} from "lucide-react";

export default function OpsExperiencesPage() {
  const [experiences, setExperiences] = useState<BacExperience[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit / Proofread modal state
  const [editingExp, setEditingExp] = useState<BacExperience | null>(null);
  const [editForm, setEditForm] = useState<{
    author_name: string;
    stream_id: string;
    final_grade: string;
    university_major: string;
    target_major: string;
    biggest_trap: string;
    winning_routine: string;
    best_resources: string;
  }>({
    author_name: "",
    stream_id: "",
    final_grade: "",
    university_major: "",
    target_major: "",
    biggest_trap: "",
    winning_routine: "",
    best_resources: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ops/experiences?status=all`);
      if (res.ok) {
        const data = await res.json();
        if (data?.experiences) {
          setExperiences(data.experiences);
        }
      }
    } catch (err) {
      console.error("Ops fetch experiences error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleUpdateStatus = async (id: string, newStatus: ExperienceStatus) => {
    try {
      const res = await fetch("/api/ops/experiences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setExperiences((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
        showToast(
          newStatus === "approved"
            ? "✅ تم اعتماد ونشر التجربة بنجاح!"
            : "❌ تم رفض التجربة"
        );
      } else {
        showToast("فشلت عملية تحديث الحالة");
      }
    } catch {
      showToast("خطأ في الاتصال بالخادم");
    }
  };

  const handleOpenProofreader = (exp: BacExperience) => {
    setEditingExp(exp);
    setEditForm({
      author_name: exp.author_name || "",
      stream_id: exp.stream_id || "sciences",
      final_grade: exp.final_grade ? String(exp.final_grade) : "",
      university_major: exp.university_major || "",
      target_major: exp.target_major || "",
      biggest_trap: exp.biggest_trap || "",
      winning_routine: exp.winning_routine || "",
      best_resources: exp.best_resources || "",
    });
  };

  const handleSaveProofread = async (approveAfterSave: boolean) => {
    if (!editingExp) return;
    setIsSavingEdit(true);

    try {
      const payload: any = {
        id: editingExp.id,
        author_name: editForm.author_name.trim().split(/\s+/)[0],
        stream_id: editForm.stream_id,
        biggest_trap: editForm.biggest_trap.trim(),
        winning_routine: editForm.winning_routine.trim(),
        best_resources: editForm.best_resources.trim() || null,
        final_grade: editForm.final_grade ? parseFloat(editForm.final_grade) : null,
        university_major: editForm.university_major.trim() || null,
        target_major: editForm.target_major.trim() || null,
      };

      if (approveAfterSave) {
        payload.status = "approved";
      }

      const res = await fetch("/api/ops/experiences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setExperiences((prev) =>
          prev.map((e) =>
            e.id === editingExp.id
              ? {
                  ...e,
                  ...payload,
                  status: approveAfterSave ? "approved" : e.status,
                }
              : e
          )
        );
        showToast(
          approveAfterSave
            ? "✨ تم حفظ التعديلات اللغوية واعتماد التجربة ونشرها!"
            : "💾 تم حفظ التعديلات بنجاح"
        );
        setEditingExp(null);
      } else {
        showToast("تعذر حفظ التعديلات");
      }
    } catch {
      showToast("خطأ في الاتصال بالخادم");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered list
  const filteredExperiences = experiences.filter((e) => {
    const currentStatus = e.status || "approved";
    if (statusFilter !== "all" && currentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.author_name.toLowerCase().includes(q);
      const matchTrap = e.biggest_trap.toLowerCase().includes(q);
      const matchRoutine = e.winning_routine.toLowerCase().includes(q);
      const matchMajor = (e.university_major || e.target_major || "").toLowerCase().includes(q);
      if (!matchName && !matchTrap && !matchRoutine && !matchMajor) return false;
    }
    return true;
  });

  const pendingCount = experiences.filter((e) => (e.status || "approved") === "pending").length;
  const approvedCount = experiences.filter((e) => (e.status || "approved") === "approved").length;
  const rejectedCount = experiences.filter((e) => e.status === "rejected").length;

  return (
    <div className="space-y-6 select-text text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-emerald-500/50 px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-xl">
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Sparkles className="h-4 w-4" />
            <span>مركز الإشراف والمراجعة البيداغوجية</span>
          </div>
          <h1 className="text-2xl font-black text-white">إدارة وتدقيق بنك التجارب</h1>
          <p className="text-xs text-slate-400 mt-1">
            مراجعة مساهمات الطلبة وتدقيقها لغوياً وتصحيح الكلمات قبل اعتمادها ونشرها للعموم.
          </p>
        </div>

        <button
          onClick={fetchExperiences}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">في انتظار المراجعة</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{pendingCount}</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">تجارب معتمدة</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{approvedCount}</div>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">تجارب مرفوضة</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{rejectedCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي السجلات</span>
            <Eye className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{experiences.length}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "pending"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>بانتظار المراجعة ({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "approved"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>المعتمدة ({approvedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "rejected"
                ? "bg-rose-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>المرفوضة ({rejectedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("all")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>الكل ({experiences.length})</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو المحتوى..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Experiences List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
          <span>جاري تحميل السجلات...</span>
        </div>
      ) : filteredExperiences.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400 text-xs">
          لا توجد تجارب في هذه الفئة حالياً.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExperiences.map((exp) => {
            const currentStatus = exp.status || "approved";
            return (
              <div
                key={exp.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm space-y-3"
              >
                {/* Top Row: Author & Badges & Actions */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-white">
                        {exp.author_name}
                      </span>

                      {/* Status Badge */}
                      {currentStatus === "pending" && (
                        <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                          قيد المراجعة
                        </span>
                      )}
                      {currentStatus === "approved" && (
                        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                          معتمدة ومنشورة
                        </span>
                      )}
                      {currentStatus === "rejected" && (
                        <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/30">
                          مرفوضة
                        </span>
                      )}

                      {/* Candidate Track */}
                      {exp.candidate_type === "current_student" ? (
                        <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-400 border border-sky-500/20">
                          🎯 طالب 2027
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400 border border-emerald-500/20">
                          🎓 اجتاز الباك {exp.passed_bac === false ? "(لم يوفق)" : "(ناجح)"}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500">
                        {exp.stream_id}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      {exp.final_grade && (
                        <span>المعدل: <strong className="text-white">{exp.final_grade}</strong></span>
                      )}
                      {(exp.university_major || exp.target_major) && (
                        <span>الوجهة: <strong className="text-white">{exp.university_major || exp.target_major}</strong></span>
                      )}
                      {exp.created_at && (
                        <span className="text-slate-500">
                          {new Date(exp.created_at).toLocaleDateString("ar-DZ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Proofread / Edit */}
                    <button
                      onClick={() => handleOpenProofreader(exp)}
                      className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                      title="تدقيق لغوي وتعديل الكلمات"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>تدقيق وتعديل</span>
                    </button>

                    {/* Quick Approve */}
                    {currentStatus !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(exp.id, "approved")}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                        title="اعتماد التجربة فوراً"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>اعتماد</span>
                      </button>
                    )}

                    {/* Quick Reject */}
                    {currentStatus !== "rejected" && (
                      <button
                        onClick={() => handleUpdateStatus(exp.id, "rejected")}
                        className="flex items-center gap-1 rounded-xl bg-rose-600/20 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-600/30 transition-colors"
                        title="رفض التجربة"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>رفض</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Previews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Trap */}
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-1">
                    <span className="font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>أكبر فخ:</span>
                    </span>
                    <p className="text-slate-300 leading-relaxed">{exp.biggest_trap}</p>
                  </div>

                  {/* Routine */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>الروتين أو السر:</span>
                    </span>
                    <p className="text-slate-300 leading-relaxed">{exp.winning_routine}</p>
                  </div>
                </div>

                {/* Best Resources */}
                {exp.best_resources && (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-950/40 p-2 rounded-lg">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>المراجع: {exp.best_resources}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Proofreader & Editing Modal */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-5 sm:p-7 my-8 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  التدقيق اللغوي وتصحيح تجربة: {editingExp.author_name}
                </h3>
              </div>
              <button
                onClick={() => setEditingExp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">اسم الكاتب (الأول فقط):</label>
                <input
                  type="text"
                  value={editForm.author_name}
                  onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">المعدل:</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.final_grade}
                  onChange={(e) => setEditForm({ ...editForm, final_grade: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">التخصص / الوجهة:</label>
                <input
                  type="text"
                  value={editForm.university_major || editForm.target_major}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      university_major: e.target.value,
                      target_major: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Edit Biggest Trap */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-rose-400">
                ⚠️ أكبر فخ (راجع الصياغة والأخطاء الإملائية):
              </label>
              <textarea
                rows={3}
                value={editForm.biggest_trap}
                onChange={(e) => setEditForm({ ...editForm, biggest_trap: e.target.value })}
                className="w-full rounded-xl border border-rose-500/40 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Edit Winning Routine */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-emerald-400">
                💡 السر أو الروتين الحاسم (راجع الصياغة والأخطاء الإملائية):
              </label>
              <textarea
                rows={3}
                value={editForm.winning_routine}
                onChange={(e) => setEditForm({ ...editForm, winning_routine: e.target.value })}
                className="w-full rounded-xl border border-emerald-500/40 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Edit Best Resources */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                📚 أفضل المراجع وقنوات المراجعة:
              </label>
              <input
                type="text"
                value={editForm.best_resources}
                onChange={(e) => setEditForm({ ...editForm, best_resources: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditingExp(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                إلغاء
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => handleSaveProofread(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 font-bold text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {isSavingEdit ? "جاري الحفظ..." : "حفظ التعديلات فقط"}
                </button>

                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => handleSaveProofread(true)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{isSavingEdit ? "جاري النشر..." : "حفظ واعتماد ونشر ✨"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
