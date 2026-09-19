"use client";

import React, { useEffect, useState } from "react";
import {
  School,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Building,
  ShieldCheck,
  AlertCircle,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { HighSchoolSubmission, HighSchoolSubmissionStatus } from "@/types/school";
import { opsFetch } from "@/lib/operations/client-api";

export default function OpsSchoolsPage() {
  const [submissions, setSubmissions] = useState<HighSchoolSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<HighSchoolSubmissionStatus | "ALL">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Rejection / Duplicate modal state
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    submissionId: string;
    action: "reject" | "duplicate";
    schoolName: string;
    note: string;
  }>({
    isOpen: false,
    submissionId: "",
    action: "reject",
    schoolName: "",
    note: "",
  });

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "ALL"
          ? "/api/ops/schools"
          : `/api/ops/schools?status=${statusFilter}`;
      const res = await opsFetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } else {
        const data = await res.json();
        setFeedbackMsg({ type: "error", text: data.error || "فشل جلب قائمة الثانويات." });
      }
    } catch (err: any) {
      console.error("Failed to load school submissions:", err);
      setFeedbackMsg({ type: "error", text: err.message || "حدث خطأ في الاتصال بالخادم." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  // Execute approval
  const handleApprove = async (submission: HighSchoolSubmission) => {
    if (
      !confirm(
        `هل تريد بالتأكيد اعتماد الثانوية:\n"${submission.proposed_name}" في بلدية "${submission.commune_name_ar}" (${submission.wilaya_name_ar}) وإضافتها للدليل الرسمي؟`
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(submission.id);
      setFeedbackMsg(null);

      const res = await opsFetch("/api/ops/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          submissionId: submission.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({
          type: "success",
          text: `تم اعتماد "${submission.proposed_name}" بنجاح وإضافتها لقائمة الثانويات المعتمدة!`,
        });
        loadSubmissions();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "فشل اعتماد الثانوية." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "حدث خطأ غير متوقع." });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit rejection or mark as duplicate
  const handleConfirmActionWithNote = async () => {
    const { submissionId, action, note } = noteModal;
    if (!submissionId) return;

    try {
      setActionLoadingId(submissionId);
      setFeedbackMsg(null);

      const res = await opsFetch("/api/ops/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          submissionId,
          adminNote: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({
          type: "success",
          text:
            action === "reject"
              ? "تم رفض طلب الثانوية بنجاح."
              : "تم تصنيف الطلب كطلب مكرر.",
        });
        setNoteModal({ isOpen: false, submissionId: "", action: "reject", schoolName: "", note: "" });
        loadSubmissions();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "فشل تنفيذ العملية." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "حدث خطأ أثناء حفظ الإجراء." });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered submissions by search query
  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      sub.proposed_name.toLowerCase().includes(q) ||
      sub.wilaya_name_ar.includes(q) ||
      sub.commune_name_ar.includes(q) ||
      sub.wilaya_code.includes(q)
    );
  });

  // Counters
  const counts = {
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    duplicate: submissions.filter((s) => s.status === "duplicate").length,
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-md">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                طابور مراجعة الثانويات المقترحة
              </h1>
              <p className="text-xs text-slate-400">
                إدارة ومراجعة طلبات إضافة الثانويات غير المدرجة من قِبل التلاميذ واعتمادها رسمياً
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSubmissions()}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-[#0F172A] border border-[#1E293B] hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs animate-fadeIn ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border text-right transition-all duration-200 ${
            statusFilter === "pending"
              ? "bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "bg-[#0B132B]/60 border-[#1E293B] hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>قيد المراجعة</span>
            </span>
            <span className="text-xl font-black text-amber-300">{counts.pending}</span>
          </div>
          <p className="text-[11px] text-slate-400">طلبات جديدة تنتظر الفحص والاعتماد</p>
        </button>

        <button
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-2xl border text-right transition-all duration-200 ${
            statusFilter === "approved"
              ? "bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
              : "bg-[#0B132B]/60 border-[#1E293B] hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>معتمدة</span>
            </span>
            <span className="text-xl font-black text-emerald-300">{counts.approved}</span>
          </div>
          <p className="text-[11px] text-slate-400">تم اعتمادها ونقلها للدليل الرسمي</p>
        </button>

        <button
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-2xl border text-right transition-all duration-200 ${
            statusFilter === "rejected"
              ? "bg-rose-500/15 border-rose-500/40 shadow-lg shadow-rose-500/10"
              : "bg-[#0B132B]/60 border-[#1E293B] hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>مرفوضة</span>
            </span>
            <span className="text-xl font-black text-rose-300">{counts.rejected}</span>
          </div>
          <p className="text-[11px] text-slate-400">طلبات تم استبعادها لعدم صحتها</p>
        </button>

        <button
          onClick={() => setStatusFilter("duplicate")}
          className={`p-4 rounded-2xl border text-right transition-all duration-200 ${
            statusFilter === "duplicate"
              ? "bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-500/10"
              : "bg-[#0B132B]/60 border-[#1E293B] hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              <span>مكررة</span>
            </span>
            <span className="text-xl font-black text-purple-300">{counts.duplicate}</span>
          </div>
          <p className="text-[11px] text-slate-400">ثانويات مكررة لثانوية مسجلة مسبقاً</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0B132B]/80 rounded-2xl border border-[#1E293B]">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            الكل ({submissions.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            قيد المراجعة ({counts.pending})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            معتمدة ({counts.approved})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === "rejected"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            مرفوضة ({counts.rejected})
          </button>
          <button
            onClick={() => setStatusFilter("duplicate")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === "duplicate"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            مكررة ({counts.duplicate})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الولاية أو البلدية..."
            className="w-full px-3 py-1.5 pl-8 rounded-xl bg-[#080D1A] border border-[#1E293B] focus:border-indigo-500 text-xs text-white placeholder:text-slate-500 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-[#0B132B]/40 rounded-2xl border border-[#1E293B] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>جاري تحميل طلبات الثانويات...</span>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center bg-[#0B132B]/40 rounded-2xl border border-[#1E293B]">
          <School className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">لا توجد طلبات تطابق هذا التصنيف</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `لم يتم العثور على أي نتائج لكلمة البحث "${searchQuery}".`
              : "لا توجد طلبات في هذا القسم حالياً."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const isActing = actionLoadingId === sub.id;

            return (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-[#0B132B]/70 border border-[#1E293B] hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* School Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-center text-indigo-400 shrink-0">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">{sub.proposed_name}</h3>
                        {sub.status === "pending" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> قيد المراجعة
                          </span>
                        )}
                        {sub.status === "approved" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> معتمدة رسمياً
                          </span>
                        )}
                        {sub.status === "rejected" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <XCircle className="w-2.5 h-2.5" /> مرفوضة
                          </span>
                        )}
                        {sub.status === "duplicate" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Copy className="w-2.5 h-2.5" /> مكررة
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>ولاية {sub.wilaya_code} - {sub.wilaya_name_ar}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>بلدية {sub.commune_name_ar}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Additional Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 pr-11">
                    <span>تاريخ الطلب: {new Date(sub.created_at).toLocaleDateString("ar-DZ")}</span>
                    {sub.admin_note && (
                      <span className="text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        ملاحظة الإدارة: {sub.admin_note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1E293B]">
                  {sub.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(sub)}
                        disabled={isActing}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد</span>
                      </button>

                      <button
                        onClick={() =>
                          setNoteModal({
                            isOpen: true,
                            submissionId: sub.id,
                            action: "reject",
                            schoolName: sub.proposed_name,
                            note: "",
                          })
                        }
                        disabled={isActing}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>رفض</span>
                      </button>

                      <button
                        onClick={() =>
                          setNoteModal({
                            isOpen: true,
                            submissionId: sub.id,
                            action: "duplicate",
                            schoolName: sub.proposed_name,
                            note: "مكررة مع ثانوية معتمدة أخرى",
                          })
                        }
                        disabled={isActing}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                        title="تصنيف كمكررة"
                      >
                        <Copy className="w-3 h-3" />
                        <span>مكررة</span>
                      </button>
                    </>
                  )}

                  {sub.status !== "pending" && (
                    <span className="text-xs text-slate-500 italic">
                      تمت المعالجة ({sub.status === "approved" ? "معتمدة" : sub.status === "rejected" ? "مرفوضة" : "مكررة"})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal for Reject / Duplicate */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B132B] border border-[#1E293B] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {noteModal.action === "reject" ? (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>رفض طلب الثانوية</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-purple-400" />
                    <span>تحديد الثانوية كمكررة</span>
                  </>
                )}
              </h3>
              <button
                onClick={() =>
                  setNoteModal({ isOpen: false, submissionId: "", action: "reject", schoolName: "", note: "" })
                }
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              الثانوية: <strong className="text-white">{noteModal.schoolName}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ملاحظة الإدارة (سبب الرفض أو التكرار):
              </label>
              <textarea
                value={noteModal.note}
                onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                rows={3}
                placeholder="اكتب ملاحظة توضيحية..."
                className="w-full px-3 py-2 rounded-xl bg-[#080D1A] border border-[#1E293B] focus:border-indigo-500 text-xs text-white placeholder:text-slate-600 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() =>
                  setNoteModal({ isOpen: false, submissionId: "", action: "reject", schoolName: "", note: "" })
                }
                className="px-3.5 py-2 rounded-xl bg-[#1E293B] text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmActionWithNote}
                disabled={actionLoadingId !== null}
                className={`px-4 py-2 rounded-xl font-bold text-xs text-white transition shadow-md ${
                  noteModal.action === "reject"
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                    : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
                }`}
              >
                {noteModal.action === "reject" ? "تأكيد الرفض" : "تأكيد كمكررة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
