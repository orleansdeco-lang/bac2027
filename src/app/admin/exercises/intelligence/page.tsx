"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  ExerciseModel,
  ExerciseLifecycleStatus,
  ExerciseDifficulty,
  ExerciseReviewAction,
  ExerciseReviewOptions,
  StudentErrorDiagnosis,
  ProgressiveHints,
} from "@/lib/admin/exercise-intelligence";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  PlusCircle,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  Target,
  Layers,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Send,
  Edit3,
  BookOpen,
} from "lucide-react";

export default function ExerciseIntelligenceAdminPage() {
  const [exercises, setExercises] = useState<ExerciseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | ExerciseLifecycleStatus>("needs_review");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftForm, setDraftForm] = useState({
    title: "",
    question: "",
    solution: "",
    subject: "mathematics",
    stream: "sciences_exp",
  });

  const [rejectModalItem, setRejectModalItem] = useState<ExerciseModel | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [editModalItem, setEditModalItem] = useState<ExerciseModel | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    question: string;
    solution: string;
    difficulty: ExerciseDifficulty;
    unit: string;
    lesson: string;
  }>({
    title: "",
    question: "",
    solution: "",
    difficulty: "standard",
    unit: "",
    lesson: "",
  });

  // Diagnostic tool modal
  const [diagModalOpen, setDiagModalOpen] = useState(false);
  const [diagForm, setDiagForm] = useState({
    question: "احسب مشتقة الدالة f(x) = (2x - 1)e^x",
    solution: "f'(x) = 2e^x + (2x - 1)e^x = (2x + 1)e^x",
    studentAnswer: "f'(x) = 2 * e^x = 2e^x لأن مشتق 2x-1 هو 2 ومشتق e^x هو e^x (اشتقاق جداء u'*v')",
  });
  const [diagResult, setDiagResult] = useState<StudentErrorDiagnosis | null>(null);

  // Load exercises from API
  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (subjectFilter) params.set("subject", subjectFilter);

      const res = await adminFetch(`/api/admin/exercises/intelligence?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setExercises(data.items);
      } else {
        setError(data.error || "فشل تحميل قائمة التمارين الذكية.");
      }
    } catch (err: any) {
      setError(err.message || "خطأ أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, subjectFilter]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Execute Review Action
  const handleReviewAction = async (
    exerciseId: string,
    action: ExerciseReviewAction,
    options: ExerciseReviewOptions = {}
  ) => {
    setActionLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await adminFetch("/api/admin/exercises/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review", exerciseId, reviewAction: action, options }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.messageAr || "تم تنفيذ إجراء المراجعة بنجاح.");
        setRejectModalItem(null);
        setEditModalItem(null);
        loadExercises();
      } else {
        setErrorMsg(data.error || "فشل تنفيذ إجراء المراجعة.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع أثناء إرسال الإجراء.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Draft Creation
  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await adminFetch("/api/admin/exercises/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "draft", payload: draftForm }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("تم توليد وفحص مسودة التمرين بنجاح وهي في خط أنابيب المراجعة!");
        setDraftModalOpen(false);
        setDraftForm({
          title: "",
          question: "",
          solution: "",
          subject: "mathematics",
          stream: "sciences_exp",
        });
        loadExercises();
      } else {
        setErrorMsg(data.error || "فشل إنشاء مسودة التمرين.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "خطأ أثناء معالجة المسودة.");
    } finally {
      setActionLoading(false);
    }
  };

  // Test Student Error Diagnostic
  const handleRunDiagnosis = async () => {
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/admin/exercises/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_error",
          question: diagForm.question,
          solution: diagForm.solution,
          studentAnswer: diagForm.studentAnswer,
        }),
      });
      const data = await res.json();
      if (data.success && data.diagnosis) {
        setDiagResult(data.diagnosis);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل تشخيص خطأ الطالب.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter items by search
  const filtered = exercises.filter((ex) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ex.title.toLowerCase().includes(q) ||
      ex.question.toLowerCase().includes(q) ||
      ex.lesson.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D1526] via-[#111C35] to-[#0D1526] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                SHATER AI AGENT • EXERCISE INTELLIGENCE
              </span>
              <span className="text-xs text-slate-500 font-mono">v1.0-live</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
              وكيل ذكاء التمارين وصياغة المسائل والتحقق
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              يدعم هذا الوكيل المنظومة التعليمية بصياغة مسودات التمارين، استخراج المهارات، التحقق من الاتساق الرياضي والفيزيائي للحلول، توليد التلميحات المتدرجة، وتشخيص أخطاء الطلاب دون أن يستبدل المفتش البشري.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDiagModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>تشخيص أخطاء الطلاب</span>
            </button>

            <button
              onClick={() => setDraftModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إنشاء مسودة تمرين (Draft)</span>
            </button>

            <button
              onClick={() => loadExercises()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#080D1A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)}>✕</button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Pipeline Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1E293B]">
        <button
          onClick={() => setActiveTab("needs_review")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "needs_review"
              ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>بانتظار المراجعة (needs_review)</span>
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "approved"
              ? "bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          <span>معتمد بيداغوجياً (approved)</span>
        </button>

        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "published"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>منشور رسمياً للطلاب (published)</span>
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "rejected"
              ? "bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>مرفوض (rejected)</span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "all"
              ? "bg-purple-500/10 text-purple-300 border border-purple-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>كافة التمارين (All)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0D1526] border border-[#1E293B] rounded-xl p-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
          <input
            type="text"
            placeholder="بحث في نص التمرين، العنوان أو الدرس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-lg bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">جميع المواد</option>
            <option value="mathematics">الرياضيات</option>
            <option value="physics">العلوم الفيزيائية</option>
            <option value="natural_sciences">علوم الطبيعة والحياة</option>
            <option value="philosophy">الفلسفة</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center bg-[#0D1526] border border-[#1E293B] rounded-2xl space-y-3">
          <span className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />
          <div className="text-xs text-slate-400">جاري استرجاع منظومة ذكاء التمارين...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0D1526] border border-[#1E293B] rounded-2xl space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">لا توجد تمارين مطابقة لهذا القسم</h3>
          <p className="text-xs text-slate-500">يمكنك صياغة مسودة تمرين جديدة بالضغط على زر "إنشاء مسودة تمرين".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const val = item.validation;

            return (
              <div
                key={item.id}
                className={`bg-[#0D1526] border rounded-2xl transition-all overflow-hidden ${
                  val.flagForReview
                    ? "border-amber-500/40 bg-amber-950/5"
                    : item.status === "published"
                    ? "border-emerald-500/30"
                    : item.status === "approved"
                    ? "border-teal-500/30"
                    : "border-[#1E293B] hover:border-slate-700"
                }`}
              >
                {/* Uncertainty or Validation Warning */}
                {val.flagForReview && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-between text-xs text-amber-300">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{val.explanationAr}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-200">
                      ثقة {Math.round(val.confidence * 100)}%
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        item.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : item.status === "approved"
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                          : item.status === "rejected"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {item.status === "published" ? "منشور رسمياً" : item.status === "approved" ? "معتمد" : item.status === "rejected" ? "مرفوض" : "بانتظار المراجعة"}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.subjectAr}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                        {item.streamAr}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 text-slate-400">
                        {item.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.difficultyAr}
                      </span>
                      {item.isAiGenerated && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/30 text-purple-300 border border-purple-500/30">
                          AI DRAFT
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-100 truncate">{item.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>الوحدة: <strong className="text-slate-300">{item.unit}</strong></span>
                      <span>•</span>
                      <span>الدرس: <strong className="text-slate-300">{item.lesson}</strong></span>
                      <span>•</span>
                      <span>نوع السؤال: <strong className="text-slate-300">{item.questionTypeAr}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-2 rounded-xl bg-[#080D1A] hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-colors"
                      title={isExpanded ? "طي التفاصيل" : "عرض التفاصيل وحل المسألة والتلميحات"}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#1E293B] bg-[#080D1A]/50 p-5 space-y-5">
                    {/* Question & Solution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Question */}
                      <div className="space-y-2 bg-[#0D1526] p-4 rounded-xl border border-[#1E293B]">
                        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>نص المسألة (Question):</span>
                        </h4>
                        <div className="text-xs text-slate-300 leading-relaxed bg-[#080D1A] p-3 rounded-lg border border-[#1E293B] max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                          {item.question}
                        </div>
                      </div>

                      {/* Official / Proposed Solution */}
                      <div className="space-y-2 bg-[#0D1526] p-4 rounded-xl border border-[#1E293B]">
                        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>الحل النموذجي المعتمد (Solution):</span>
                        </h4>
                        <div className="text-xs text-slate-300 leading-relaxed bg-[#080D1A] p-3 rounded-lg border border-[#1E293B] max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                          {item.solution}
                        </div>
                      </div>
                    </div>

                    {/* Targeted Skills */}
                    <div className="bg-[#0D1526] p-4 rounded-xl border border-[#1E293B] space-y-2">
                      <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        <span>المهارات البيداغوجية المستهدفة (Identified Skills):</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs bg-[#080D1A] text-slate-300 border border-[#1E293B]"
                          >
                            🎯 {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Solution Validation Sentinel */}
                    <div className="bg-[#0D1526] p-4 rounded-xl border border-[#1E293B] space-y-3">
                      <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>التحقق من الاتساق العلمي (Solution Validation):</span>
                      </h4>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-[#080D1A] border border-[#1E293B]">
                          <span className="text-[10px] text-slate-500 block">الاتساق الرياضي</span>
                          <span className={val.mathConsistency ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {val.mathConsistency ? "✓ سليم" : "✗ تناقض"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#080D1A] border border-[#1E293B]">
                          <span className="text-[10px] text-slate-500 block">صيغ القوانين</span>
                          <span className={val.formulaConsistency ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {val.formulaConsistency ? "✓ مطابقة" : "✗ خلل"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#080D1A] border border-[#1E293B]">
                          <span className="text-[10px] text-slate-500 block">ضبط الوحدات</span>
                          <span className={val.unitsCheck ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {val.unitsCheck ? "✓ منضبطة" : "✗ ناقصة"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#080D1A] border border-[#1E293B]">
                          <span className="text-[10px] text-slate-500 block">التبرير المنطقي</span>
                          <span className={val.logicalReasoning ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {val.logicalReasoning ? "✓ متسلسل" : "✗ مقتضب"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#080D1A] border border-[#1E293B]">
                          <span className="text-[10px] text-slate-500 block">النتيجة النهائية</span>
                          <span className={val.finalAnswerCheck ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {val.finalAnswerCheck ? "✓ صريحة" : "✗ مفقودة"}
                          </span>
                        </div>
                      </div>

                      {val.inconsistencies.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {val.inconsistencies.map((inc, idx) => (
                            <div key={idx} className="p-2 rounded text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              ⚠️ {inc}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4-Tier Progressive Hints */}
                    <div className="bg-[#0D1526] p-4 rounded-xl border border-[#1E293B] space-y-3">
                      <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>التلميحات المتدرجة (Progressive Scaffolding Hints):</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-[#080D1A] border border-[#1E293B] space-y-1">
                          <span className="text-[10px] font-bold text-indigo-400 block">المستوى 1: التوجيه المفاهيمي (Conceptual)</span>
                          <p className="text-slate-300 leading-relaxed">{item.hints.hint1_conceptual}</p>
                        </div>

                        <div className="p-3 rounded-lg bg-[#080D1A] border border-[#1E293B] space-y-1">
                          <span className="text-[10px] font-bold text-blue-400 block">المستوى 2: الخطة الاستراتيجية (Strategic)</span>
                          <p className="text-slate-300 leading-relaxed">{item.hints.hint2_strategic}</p>
                        </div>

                        <div className="p-3 rounded-lg bg-[#080D1A] border border-[#1E293B] space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 block">المستوى 3: الخطوة التالية (Next Step)</span>
                          <p className="text-slate-300 leading-relaxed">{item.hints.hint3_next_step}</p>
                        </div>

                        <div className="p-3 rounded-lg bg-[#080D1A] border border-[#1E293B] space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 block">المستوى 4: مساعدة متقدمة (Strong Assistance)</span>
                          <p className="text-slate-300 leading-relaxed">{item.hints.hint4_strong_assistance}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review Notes or Rejection Reason if any */}
                    {item.rejectionReason && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                        <strong>سبب الرفض:</strong> {item.rejectionReason}
                      </div>
                    )}

                    {/* Reviewer Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E293B]">
                      <div className="text-[11px] text-slate-500 font-mono">
                        معرف: {item.id} • تم التحقق بشرياً: {item.isHumanVerified ? "نعم" : "لا"}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Approve */}
                        {item.status !== "approved" && item.status !== "published" && (
                          <button
                            onClick={() => handleReviewAction(item.id, "approve")}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>اعتماد (Approve)</span>
                          </button>
                        )}

                        {/* Publish */}
                        {item.status !== "published" && (
                          <button
                            onClick={() => handleReviewAction(item.id, "publish")}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>نشر رسمي (Publish)</span>
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditModalItem(item);
                            setEditForm({
                              title: item.title,
                              question: item.question,
                              solution: item.solution,
                              difficulty: item.difficulty,
                              unit: item.unit,
                              lesson: item.lesson,
                            });
                          }}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                          <span>تعديل (Edit)</span>
                        </button>

                        {/* Reject */}
                        {item.status !== "rejected" && (
                          <button
                            onClick={() => {
                              setRejectModalItem(item);
                              setRejectionReason("");
                            }}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>رفض (Reject)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Draft Creation Studio */}
      {draftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <span>إنشاء مسودة تمرين ذكية (AI Drafting Studio)</span>
              </h3>
              <button onClick={() => setDraftModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleDraftSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">عنوان المسألة: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسألة الدوال الأسية وحساب المشتقة ونقطة الانعطاف"
                  value={draftForm.title}
                  onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">نص المسألة أو التمرين: *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="أدخل نص المسألة الكامل مع فروع الأسئلة..."
                  value={draftForm.question}
                  onChange={(e) => setDraftForm({ ...draftForm, question: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الحل النموذجي المقترح: *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="أدخل خطوات الحل النموذجي ليتم فحص الاتساق وتوليد التلميحات..."
                  value={draftForm.solution}
                  onChange={(e) => setDraftForm({ ...draftForm, solution: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المادة:</label>
                  <select
                    value={draftForm.subject}
                    onChange={(e) => setDraftForm({ ...draftForm, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="mathematics">الرياضيات</option>
                    <option value="physics">الفيزياء</option>
                    <option value="natural_sciences">علوم الطبيعة والحياة</option>
                    <option value="philosophy">الفلسفة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">الشعبة:</label>
                  <select
                    value={draftForm.stream}
                    onChange={(e) => setDraftForm({ ...draftForm, stream: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="sciences_exp">علوم تجريبية</option>
                    <option value="math">رياضيات</option>
                    <option value="technique_math">تقني رياضي</option>
                    <option value="gestion_eco">تسيير واقتصاد</option>
                    <option value="lettres_philo">آداب وفلسفة</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] leading-relaxed">
                🛡️ <strong>ضمان عدم النشر التلقائي:</strong> سيتم حفظ المسألة كمسودة تحت المراجعة (needs_review) مع استخراج المهارات وتوليد 4 مستويات تلميح والتحقق من المعادلات، ولن تنشر إلا بقرار المفتش.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setDraftModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>توليد وفحص المسودة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Student Error Diagnostic Tool */}
      {diagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 text-emerald-400">
                <Stethoscope className="w-5 h-5" />
                <span>تشخيص وتحليل أخطاء الطلاب (Error Taxonomy Diagnostic)</span>
              </h3>
              <button onClick={() => setDiagModalOpen(false)}>✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">السؤال:</label>
                <input
                  type="text"
                  value={diagForm.question}
                  onChange={(e) => setDiagForm({ ...diagForm, question: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الحل النموذجي:</label>
                <input
                  type="text"
                  value={diagForm.solution}
                  onChange={(e) => setDiagForm({ ...diagForm, solution: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">إجابة الطالب المراد فحصها:</label>
                <textarea
                  rows={3}
                  value={diagForm.studentAnswer}
                  onChange={(e) => setDiagForm({ ...diagForm, studentAnswer: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 font-mono"
                />
              </div>

              <button
                onClick={handleRunDiagnosis}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>تحليل الخطأ وفق التصنيف البيداغوجي (10 أصناف)</span>
              </button>

              {/* Diagnosis Output */}
              {diagResult && (
                <div className="p-4 rounded-xl bg-[#080D1A] border border-emerald-500/30 space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {diagResult.errorTypeAr}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      دقة: {Math.round(diagResult.confidence * 100)}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-200">
                    <strong>الخطأ المرصود:</strong> {diagResult.identifiedMistake}
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    💡 <strong>التوجيه العلاجي المقترح:</strong> {diagResult.remedialAdviceAr}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reject Item */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-right">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" />
              <span>رفض المسألة التعليمية</span>
            </h3>
            <p className="text-xs text-slate-400">
              أنت على وشك رفض المسألة: <strong>{rejectModalItem.title}</strong>. يرجى توضيح السبب ليتم تسجيله في سجل التدقيق.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: خطأ في صياغة المعطيات أو السؤال خارج المنهاج الوزاري..."
              className="w-full p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  handleReviewAction(rejectModalItem.id, "reject", {
                    rejectionReason: rejectionReason.trim(),
                  })
                }
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Item */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-right">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 text-purple-400">
              <Edit3 className="w-5 h-5" />
              <span>تعديل واعتماد المسألة</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">العنوان:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الصعوبة:</label>
                <select
                  value={editForm.difficulty}
                  onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value as ExerciseDifficulty })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200"
                >
                  <option value="easy">سهل (easy)</option>
                  <option value="standard">متوسط (standard)</option>
                  <option value="advanced">صعب (advanced)</option>
                  <option value="challenge">تحدي (challenge)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الوحدة:</label>
                <input
                  type="text"
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الدرس:</label>
                <input
                  type="text"
                  value={editForm.lesson}
                  onChange={(e) => setEditForm({ ...editForm, lesson: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  handleReviewAction(editModalItem.id, "edit", {
                    editedTitle: editForm.title.trim(),
                    editedDifficulty: editForm.difficulty,
                    editedUnit: editForm.unit.trim(),
                    editedLesson: editForm.lesson.trim(),
                  })
                }
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
              >
                حفظ التعديل والاعتماد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
