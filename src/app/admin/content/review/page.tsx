"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  IngestedKnowledgeItem,
  ContentLifecycleStatus,
  ReviewActionType,
  ReviewActionOptions,
  ClassificationMetadata,
} from "@/lib/admin/knowledge-agent";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  FileCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  GitMerge,
  Edit3,
  Eye,
  RefreshCw,
  PlusCircle,
  FileText,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  GraduationCap,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function AdminContentReviewPage() {
  const [items, setItems] = useState<IngestedKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | ContentLifecycleStatus | "possible_duplicate">("needs_review");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Modals & Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Reject Modal
  const [rejectModalItem, setRejectModalItem] = useState<IngestedKnowledgeItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Merge Modal
  const [mergeModalItem, setMergeModalItem] = useState<IngestedKnowledgeItem | null>(null);
  const [targetMergeId, setTargetMergeId] = useState("");

  // Edit Modal
  const [editModalItem, setEditModalItem] = useState<IngestedKnowledgeItem | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    subject: string;
    stream: string;
    unit: string;
    lesson: string;
    difficulty: "standard" | "advanced" | "challenge";
  }>({
    title: "",
    subject: "mathematics",
    stream: "sciences_exp",
    unit: "",
    lesson: "",
    difficulty: "standard",
  });

  // Request Review Modal
  const [reviewReqModalItem, setReviewReqModalItem] = useState<IngestedKnowledgeItem | null>(null);
  const [reviewReqNotes, setReviewReqNotes] = useState("");

  // Ingestion Drawer / Modal
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [ingestForm, setIngestForm] = useState({
    title: "",
    rawContent: "",
    fileName: "",
    fileType: "application/pdf",
    declaredSubject: "",
    declaredStream: "",
  });

  // Load items from API
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab === "possible_duplicate") {
        params.set("isDuplicate", "true");
      } else if (activeTab !== "all") {
        params.set("status", activeTab);
      }
      if (subjectFilter) params.set("subject", subjectFilter);
      if (streamFilter) params.set("stream", streamFilter);

      const res = await adminFetch(`/api/admin/content/review?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setError(data.error || "فشل تحميل قائمة المحتوى للمراجعة.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء جلب قائمة المراجعة.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, subjectFilter, streamFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Execute Review Action
  const handleReviewAction = async (
    itemId: string,
    action: ReviewActionType,
    options: ReviewActionOptions = {}
  ) => {
    setActionLoading(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    try {
      const res = await adminFetch("/api/admin/content/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, action, options }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(data.messageAr || "تم تنفيذ إجراء المراجعة بنجاح.");
        // Close all modals
        setRejectModalItem(null);
        setMergeModalItem(null);
        setEditModalItem(null);
        setReviewReqModalItem(null);
        // Refresh list
        loadItems();
      } else {
        setActionErrorMsg(data.error || "فشل تنفيذ إجراء المراجعة.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "حدث خطأ غير متوقع أثناء إرسال الإجراء.");
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Ingest Submission
  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestForm.title.trim()) return;

    setActionLoading(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    try {
      const res = await adminFetch("/api/admin/content/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingestForm),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg("تم استقبال الوثيقة وتصنيفها آلياً بواسطة وكيل المعرفة!");
        setIngestModalOpen(false);
        setIngestForm({
          title: "",
          rawContent: "",
          fileName: "",
          fileType: "application/pdf",
          declaredSubject: "",
          declaredStream: "",
        });
        loadItems();
      } else {
        setActionErrorMsg(data.error || "فشل استقبال الوثيقة.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "خطأ أثناء إرسال الوثيقة للوكيل.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered items by search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.classification.subjectAr.toLowerCase().includes(q) ||
      item.classification.unit.toLowerCase().includes(q) ||
      item.classification.lesson.toLowerCase().includes(q)
    );
  });

  // Status Badge Helper
  const renderStatusBadge = (status: ContentLifecycleStatus) => {
    switch (status) {
      case "received":
        return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">مستلمة (received)</span>;
      case "processing":
        return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">قيد المعالجة (processing)</span>;
      case "classified":
        return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">مصنفة آلياً (classified)</span>;
      case "needs_review":
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> بانتظار المراجعة (needs_review)</span>;
      case "verified":
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> تم التحقق (verified)</span>;
      case "published":
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> منشور رسمياً (published)</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1"><XCircle className="w-3 h-3" /> مرفوض (rejected)</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D1526] via-[#111C35] to-[#0D1526] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                SHATER AI AGENT • KNOWLEDGE & DATA
              </span>
              <span className="text-xs text-slate-500 font-mono">v1.0-live</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              وكيل المعرفة والبيانات — مراجعة واعتماد المحتوى
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              يقوم وكيل الذكاء الاصطناعي باستقبال، استخراج وتصنيف التمارين، الملخصات ومواضيع الامتحانات، مع كشف الشبهات المكررة وضبط الجودة قبل المراجعة البشرية المعتمدة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIngestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>استقبال مساهمة جديدة (Ingest)</span>
            </button>

            <button
              onClick={() => loadItems()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#080D1A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {actionSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
            <button onClick={() => setActionErrorMsg(null)} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>
        )}
      </div>

      {/* Pipeline Lifecycle Tabs */}
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
          onClick={() => setActiveTab("possible_duplicate")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "possible_duplicate"
              ? "bg-red-500/10 text-red-300 border border-red-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>شبهات التكرار (Duplicates)</span>
        </button>

        <button
          onClick={() => setActiveTab("verified")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "verified"
              ? "bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          <span>تم التحقق (verified)</span>
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
          <span>منشور رسمياً (published)</span>
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
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1526]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>كافة الوثائق (All)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0D1526] border border-[#1E293B] rounded-xl p-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
          <input
            type="text"
            placeholder="بحث بالعنوان، الدرس أو الوحدة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-lg bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">جميع المواد</option>
            <option value="mathematics">الرياضيات</option>
            <option value="physics">العلوم الفيزيائية</option>
            <option value="natural_sciences">علوم الطبيعة والحياة</option>
            <option value="philosophy">الفلسفة</option>
            <option value="history_geography">التاريخ والجغرافيا</option>
            <option value="islamic_studies">العلوم الإسلامية</option>
            <option value="arabic_literature">اللغة العربية</option>
          </select>
        </div>

        <div>
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">جميع الشعب</option>
            <option value="sciences_exp">علوم تجريبية</option>
            <option value="math">رياضيات</option>
            <option value="technique_math">تقني رياضي</option>
            <option value="gestion_eco">تسيير واقتصاد</option>
            <option value="lettres_philo">آداب وفلسفة</option>
            <option value="langues">لغات أجنبية</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center bg-[#0D1526] border border-[#1E293B] rounded-2xl space-y-3">
          <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block" />
          <div className="text-xs text-slate-400">جاري مسح ومعالجة وثائق المعرفة...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#0D1526] border border-[#1E293B] rounded-2xl space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">لا توجد وثائق في هذا القسم حالياً</h3>
          <p className="text-xs text-slate-500">تمت معالجة كافة الوثائق بنجاح أو لا تتطابق الفلاتر المحددة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const isDup = item.duplicateCheck.isPossibleDuplicate;

            return (
              <div
                key={item.id}
                className={`bg-[#0D1526] border rounded-2xl transition-all overflow-hidden ${
                  isDup
                    ? "border-red-500/40 bg-red-950/5"
                    : item.status === "verified"
                    ? "border-teal-500/30"
                    : item.status === "published"
                    ? "border-emerald-500/30"
                    : "border-[#1E293B] hover:border-slate-700"
                }`}
              >
                {/* Duplicate Alert Banner */}
                {isDup && (
                  <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-2.5 flex items-center justify-between text-xs text-red-300">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{item.duplicateCheck.reason || "تم رصد تطابق محتوى مع وثيقة سابقة (شبهة تكرار)."}</span>
                    </div>
                    {item.duplicateCheck.similarityScore && (
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-red-500/20 text-red-200">
                        {Math.round(item.duplicateCheck.similarityScore * 100)}% تطابق
                      </span>
                    )}
                  </div>
                )}

                {/* Card Main Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStatusBadge(item.status)}
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.classification.subjectAr}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                        {item.classification.streamAr}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 text-slate-400">
                        {item.classification.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.classification.contentTypeAr}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 truncate">{item.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>الوحدة: <strong className="text-slate-300">{item.classification.unit}</strong></span>
                      <span>•</span>
                      <span>الدرس: <strong className="text-slate-300">{item.classification.lesson}</strong></span>
                      <span>•</span>
                      <span>المصدر: <strong className="text-slate-300">{item.classification.source}</strong></span>
                    </div>
                  </div>

                  {/* AI Confidence & Quality Score Card */}
                  <div className="flex items-center gap-4 border-r md:border-r-0 md:border-l border-[#1E293B] pr-4 md:pr-0 md:pl-4 shrink-0">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 font-mono">درجة الجودة</div>
                      <div className={`text-base font-bold font-mono ${
                        item.qualityCheck.qualityScore >= 80 ? "text-emerald-400" : item.qualityCheck.qualityScore >= 50 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {item.qualityCheck.qualityScore}/100
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 font-mono">ثقة الذكاء</div>
                      <div className="text-base font-bold font-mono text-indigo-400">
                        {Math.round(item.aiConfidence.overall * 100)}%
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="p-2 rounded-xl bg-[#080D1A] hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-colors"
                      title={isExpanded ? "طي التفاصيل" : "عرض التفاصيل"}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#1E293B] bg-[#080D1A]/50 p-5 space-y-5">
                    {/* Content Preview & Quality Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Raw Content & File */}
                      <div className="space-y-3 bg-[#0D1526] p-4 rounded-xl border border-[#1E293B]">
                        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>المحتوى المستخرج / النص الأصلي:</span>
                        </h4>
                        <div className="text-xs text-slate-300 leading-relaxed bg-[#080D1A] p-3 rounded-lg border border-[#1E293B] max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                          {item.rawContent || "لا يوجد محتوى نصي مستخرج (ملف وسائط مرئي)"}
                        </div>

                        {item.fileName && (
                          <div className="text-xs text-slate-400 flex items-center justify-between bg-[#080D1A] p-2.5 rounded-lg border border-[#1E293B]">
                            <span className="font-mono text-slate-300 truncate max-w-xs">{item.fileName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {item.fileSizeBytes ? `${Math.round(item.fileSizeBytes / 1024)} KB` : "محمي"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Quality Sentinel Breakdown */}
                      <div className="space-y-3 bg-[#0D1526] p-4 rounded-xl border border-[#1E293B]">
                        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تحليل الجودة والتحقق (Quality Sentinel):</span>
                        </h4>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-400 py-1 border-b border-[#1E293B]">
                            <span>دقة التعرف الضوئي (OCR):</span>
                            <span className="font-semibold text-slate-200 uppercase">{item.qualityCheck.ocrQuality}</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400 py-1 border-b border-[#1E293B]">
                            <span>معلومات ناقصة:</span>
                            <span className={item.qualityCheck.hasMissingInfo ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                              {item.qualityCheck.hasMissingInfo ? "نعم" : "لا"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400 py-1 border-b border-[#1E293B]">
                            <span>حل غير مكتمل:</span>
                            <span className={item.qualityCheck.isIncompleteSolution ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                              {item.qualityCheck.isIncompleteSolution ? "نعم" : "لا"}
                            </span>
                          </div>

                          {/* Issues list */}
                          {item.qualityCheck.issues.length > 0 && (
                            <div className="space-y-1 mt-2">
                              {item.qualityCheck.issues.map((iss, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${
                                    iss.severity === "critical"
                                      ? "bg-red-500/10 text-red-300 border border-red-500/20"
                                      : iss.severity === "warning"
                                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                      : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                  }`}
                                >
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{iss.messageAr}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* AI Disclaimer */}
                          <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed mt-2">
                            💡 <strong>تنبيه الثقة الاستدلالية:</strong> {item.aiConfidence.disclaimer}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Notes or Rejection Reason if any */}
                    {item.rejectionReason && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                        <strong>سبب الرفض المسجل:</strong> {item.rejectionReason}
                      </div>
                    )}

                    {item.reviewNotes && (
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
                        <strong>ملاحظات المراجعة البيداغوجية:</strong> {item.reviewNotes}
                      </div>
                    )}

                    {/* Action Bar (Reviewer Controls) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E293B]">
                      <div className="text-[11px] text-slate-500 font-mono">
                        مساهمة: {item.submittedByUserId || "مجهول"} ({item.submittedByRole || "STUDENT"}) • معرف: {item.id}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Approve */}
                        {item.status !== "verified" && item.status !== "published" && (
                          <button
                            onClick={() => handleReviewAction(item.id, "approve")}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>موافقة واعتماد (Approve)</span>
                          </button>
                        )}

                        {/* 2. Publish (Strict publication safeguard) */}
                        {item.status !== "published" && (
                          <button
                            onClick={() => handleReviewAction(item.id, "publish")}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>نشر رسمي للطلاب (Publish)</span>
                          </button>
                        )}

                        {/* 3. Edit Classification */}
                        <button
                          onClick={() => {
                            setEditModalItem(item);
                            setEditForm({
                              title: item.title,
                              subject: item.classification.subject,
                              stream: item.classification.stream,
                              unit: item.classification.unit,
                              lesson: item.classification.lesson,
                              difficulty: item.classification.difficulty,
                            });
                          }}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>تعديل التصنيف (Edit)</span>
                        </button>

                        {/* 4. Merge Duplicate */}
                        <button
                          onClick={() => {
                            setMergeModalItem(item);
                            setTargetMergeId(item.duplicateCheck.matchedItemId || "");
                          }}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                        >
                          <GitMerge className="w-3.5 h-3.5 text-amber-400" />
                          <span>دمج كمكرر (Merge)</span>
                        </button>

                        {/* 5. Request Review */}
                        <button
                          onClick={() => {
                            setReviewReqModalItem(item);
                            setReviewReqNotes("");
                          }}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                          <span>طلب تدقيق إضافي</span>
                        </button>

                        {/* 6. Reject */}
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

      {/* MODAL: Reject Item */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-right">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" />
              <span>رفض الوثيقة التعليمية</span>
            </h3>
            <p className="text-xs text-slate-400">
              أنت على وشك رفض الوثيقة: <strong>{rejectModalItem.title}</strong>. يرجى توضيح السبب ليتم إدراجه في سجل التدقيق.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: الحل غير مكتمل، أو جودة الصورة غير مقروءة، أو تناقض علمي في المسألة..."
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

      {/* MODAL: Merge Duplicate */}
      {mergeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-right">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 text-amber-400">
              <GitMerge className="w-5 h-5" />
              <span>دمج الوثيقة كمكرر (Merge Duplicate)</span>
            </h3>
            <p className="text-xs text-slate-400">
              سيتم تسجيل هذه الوثيقة كنسخة مكررة وإغلاقها دون حذف بياناتها، وربطها بالوثيقة الأصلية المعتمدة.
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">معرّف الوثيقة الأصلية (Target Original ID):</label>
              <input
                type="text"
                value={targetMergeId}
                onChange={(e) => setTargetMergeId(e.target.value)}
                placeholder="item-seed-bac-math-01"
                className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMergeModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  handleReviewAction(mergeModalItem.id, "merge", {
                    targetMergeItemId: targetMergeId.trim(),
                  })
                }
                disabled={actionLoading || !targetMergeId.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/25 transition-all"
              >
                تأكيد الدمج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Classification */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-right">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 text-indigo-400">
              <Edit3 className="w-5 h-5" />
              <span>تعديل التصنيف البيداغوجي للوثيقة</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">العنوان المعدل:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المادة:</label>
                  <select
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="mathematics">الرياضيات</option>
                    <option value="physics">الفيزياء</option>
                    <option value="natural_sciences">علوم الطبيعة والحياة</option>
                    <option value="philosophy">الفلسفة</option>
                    <option value="history_geography">التاريخ والجغرافيا</option>
                    <option value="islamic_studies">العلوم الإسلامية</option>
                    <option value="arabic_literature">اللغة العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">الشعبة:</label>
                  <select
                    value={editForm.stream}
                    onChange={(e) => setEditForm({ ...editForm, stream: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="sciences_exp">علوم تجريبية</option>
                    <option value="math">رياضيات</option>
                    <option value="technique_math">تقني رياضي</option>
                    <option value="gestion_eco">تسيير واقتصاد</option>
                    <option value="lettres_philo">آداب وفلسفة</option>
                    <option value="langues">لغات أجنبية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الوحدة التعليمية:</label>
                <input
                  type="text"
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الدرس المستهدف:</label>
                <input
                  type="text"
                  value={editForm.lesson}
                  onChange={(e) => setEditForm({ ...editForm, lesson: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
                    editedClassification: {
                      subject: editForm.subject,
                      stream: editForm.stream,
                      unit: editForm.unit,
                      lesson: editForm.lesson,
                      difficulty: editForm.difficulty,
                    },
                  })
                }
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                حفظ التعديل والاعتماد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Request Review */}
      {reviewReqModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-right">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 text-blue-400">
              <RefreshCw className="w-5 h-5" />
              <span>طلب تدقيق إضافي من مفتش المادة</span>
            </h3>

            <p className="text-xs text-slate-400">
              أدخل توجيهاتك أو الشبهة البيداغوجية لتحويل الوثيقة إلى المفتش المتخصص.
            </p>

            <textarea
              rows={3}
              value={reviewReqNotes}
              onChange={(e) => setReviewReqNotes(e.target.value)}
              placeholder="مثال: يرجى التحقق من صحة السؤال الثالث في تمرين النووي هل هو وفق بكالوريا 2024..."
              className="w-full p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewReqModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  handleReviewAction(reviewReqModalItem.id, "request_review", {
                    notes: reviewReqNotes.trim(),
                  })
                }
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
              >
                إرسال الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: Ingest Submission Sandbox */}
      {ingestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>استقبال مادة تعليمية جديدة (AI Ingest Sandbox)</span>
              </h3>
              <button onClick={() => setIngestModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleIngestSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">عنوان الوثيقة أو المسألة: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تمرين المتتاليات العددية والبرهان بالتراجع — بكالوريا 2024"
                  value={ingestForm.title}
                  onChange={(e) => setIngestForm({ ...ingestForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">المحتوى النصي أو نص التمرين المستخرج:</label>
                <textarea
                  rows={4}
                  placeholder="أدخل نص التمرين أو محتوى الملخص هنا ليقوم الذكاء الاصطناعي بتصنيفه وفحصه..."
                  value={ingestForm.rawContent}
                  onChange={(e) => setIngestForm({ ...ingestForm, rawContent: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">اسم الملف (اختياري):</label>
                  <input
                    type="text"
                    placeholder="alger-math-bac2024.pdf"
                    value={ingestForm.fileName}
                    onChange={(e) => setIngestForm({ ...ingestForm, fileName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">المادة المصرح بها (اختياري):</label>
                  <select
                    value={ingestForm.declaredSubject}
                    onChange={(e) => setIngestForm({ ...ingestForm, declaredSubject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">كشف آلي بالذكاء الاصطناعي</option>
                    <option value="mathematics">الرياضيات</option>
                    <option value="physics">الفيزياء</option>
                    <option value="natural_sciences">علوم الطبيعة والحياة</option>
                    <option value="philosophy">الفلسفة</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
                🛡️ <strong>قاعدة عدم النشر الآلي:</strong> سيتم إدراج الوثيقة مباشرة في حالة <code className="bg-indigo-900/50 px-1 py-0.5 rounded">needs_review</code>، ولن تكون متاحة للطلاب حتى يعتمدها مفتش بشري مصرح له.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIngestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !ingestForm.title.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>معالجة وتصنيف الوثيقة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
