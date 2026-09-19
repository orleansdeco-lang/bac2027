"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Trash2,
  Check,
  X,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  School,
  FolderOpen,
  Download,
  FileCheck,
  RefreshCw,
  Clock,
} from "lucide-react";
import { CustomExam, CustomExamType, CustomExamDifficulty } from "@/types/custom-exam";
import { CustomExamService } from "@/lib/services/custom-exam-service";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { ALGERIAN_WILAYAS } from "@/domain/administrative/algeria-administrative";

const STREAMS = [
  { id: "all", label: "مشترك لجميع الشعب" },
  { id: "sciences_exp", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "gestion_eco", label: "تسيير واقتصاد" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "langues_etrangeres", label: "لغات أجنبية" },
  { id: "arts", label: "فنون" },
];

const EXAM_TYPES = [
  { id: "official_bac", label: "بكالوريا رسمية (BAC)" },
  { id: "term_1", label: "اختبار الفصل الأول" },
  { id: "term_2", label: "اختبار الفصل الثاني" },
  { id: "term_3", label: "اختبار الفصل الثالث" },
  { id: "mock_exam", label: "بكالوريا بيضاء / تجريبي" },
];

export default function OpsExamsPage() {
  const [exams, setExams] = useState<CustomExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [streamId, setStreamId] = useState("sciences_exp");
  const [subjectId, setSubjectId] = useState("math");
  const [examType, setExamType] = useState<CustomExamType>("term_1");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [term, setTerm] = useState<number | undefined>(1);
  const [topicName, setTopicName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [difficulty, setDifficulty] = useState<CustomExamDifficulty>("standard");

  // File Upload State
  const [examFile, setExamFile] = useState<File | null>(null);
  const [examFilePreview, setExamFilePreview] = useState<string | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [solutionFilePreview, setSolutionFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStream, setFilterStream] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Preview Modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const examFileInputRef = useRef<HTMLInputElement>(null);
  const solutionFileInputRef = useRef<HTMLInputElement>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await CustomExamService.getCustomExams({ includeDrafts: true });
      setExams(data);
    } catch (err) {
      console.error("Failed to load exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Update term default when examType changes
  const handleExamTypeChange = (type: CustomExamType) => {
    setExamType(type);
    if (type === "term_1") setTerm(1);
    else if (type === "term_2") setTerm(2);
    else if (type === "term_3") setTerm(3);
    else setTerm(undefined);
  };

  // Upload a file to the API endpoint
  const uploadSingleFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "exam_documents");
    formData.append("subFolder", folder);

    const res = await fetch("/api/ops/exams/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "فشل الرفع" }));
      throw new Error(err.error || "خطأ أثناء رفع الملف");
    }
    const data = await res.json();
    return data.url;
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorToast("يرجى إدخال عنوان الموضوع");
      return;
    }
    if (!examFile) {
      setErrorToast("يرجى اختيار ملف الموضوع (PDF أو صورة)");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorToast(null);

      // 1. Upload Exam File
      setUploadProgress("جاري رفع ملف الموضوع...");
      const examUrl = await uploadSingleFile(examFile, "exams");

      // 2. Upload Solution File (if present)
      let solutionUrl: string | undefined = undefined;
      if (solutionFile) {
        setUploadProgress("جاري رفع ملف الحل النموذجي...");
        solutionUrl = await uploadSingleFile(solutionFile, "solutions");
      }

      // 3. Save to database
      setUploadProgress("جاري حفظ بيانات الموضوع في النظام...");
      const saveRes = await fetch("/api/ops/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          stream_id: streamId,
          subject_id: subjectId,
          exam_type: examType,
          year,
          term: term || null,
          topic_name: topicName,
          school_name: schoolName,
          wilaya,
          file_url: examUrl,
          solution_url: solutionUrl,
          has_solution: Boolean(solutionUrl),
          difficulty,
          is_published: true,
        }),
      });

      const data = await saveRes.json();
      if (!data.success) {
        throw new Error(data.error || "تعذر حفظ الموضوع في قاعدة البيانات");
      }

      setSuccessToast("تم إضافة الموضوع ونشره بنجاح في المنصة!");
      // Reset form
      setTitle("");
      setTopicName("");
      setSchoolName("");
      setExamFile(null);
      setExamFilePreview(null);
      setSolutionFile(null);
      setSolutionFilePreview(null);
      setShowAddForm(false);
      fetchExams();
    } catch (err: any) {
      setErrorToast(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموضوع؟ سيتم حذفه من واجهات الطلاب أيضاً.")) return;
    try {
      const ok = await CustomExamService.deleteCustomExam(id);
      if (ok) {
        setExams((prev) => prev.filter((e) => e.id !== id));
        setSuccessToast("تم حذف الموضوع بنجاح");
      }
    } catch (err) {
      setErrorToast("فشل حذف الموضوع");
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    const ok = await CustomExamService.togglePublished(id, current);
    if (ok) {
      setExams((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_published: !current } : e))
      );
      setSuccessToast(current ? "تم إخفاء الموضوع (مسودة)" : "تم نشر الموضوع بنجاح");
    }
  };

  // Filtered List
  const filteredExams = exams.filter((exam) => {
    if (filterStream !== "all" && exam.stream_id !== filterStream && exam.stream_id !== "all") {
      return false;
    }
    if (filterType !== "all" && exam.exam_type !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        exam.title.toLowerCase().includes(q) ||
        exam.school_name?.toLowerCase().includes(q) ||
        exam.topic_name?.toLowerCase().includes(q) ||
        exam.wilaya?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>نظام إدارة المواضيع يدوياً (No-Code Bank)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            بنك الاختبارات والمواضيع
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            أضف ونظّم مواضيع البكالوريا والاختبارات الفصلية بالملفات والحلول النموذجية لتظهر مباشرة للطلاب.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
            showAddForm
              ? "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
          }`}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              <span>إغلاق النموذج</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>+ إضافة موضوع جديد</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {successToast && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorToast && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Exam Form (Visual No-Code Form) */}
      {showAddForm && (
        <div className="bg-[#0B132B]/90 border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">إضافة موضوع أو امتحان جديد</h2>
              <p className="text-xs text-slate-400">امرحل المعلومات الأساسية وارفع الـ PDF أو الصورة ليتاح للطلاب فوراً.</p>
            </div>
          </div>

          <form onSubmit={handleCreateExam} className="space-y-6">
            {/* Row 1: Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                عنوان الموضوع <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: اختبار الفصل الأول في الرياضيات - ثانوية العقيد لطفي 2024"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            {/* Row 2: Stream & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الشعبة <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={streamId}
                  onChange={(e) => setStreamId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  {STREAMS.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  المادة <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  {Object.values(ALL_SUBJECTS).map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نوع الاختبار <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={examType}
                  onChange={(e) => handleExamTypeChange(e.target.value as CustomExamType)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  {EXAM_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Year, Term, Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  السنة الدراسية
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الفصل الدراسي
                </label>
                <select
                  value={term || ""}
                  onChange={(e) => setTerm(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="">غير محدد / بكالوريا رسمية</option>
                  <option value="1">الفصل الأول</option>
                  <option value="2">الفصل الثاني</option>
                  <option value="3">الفصل الثالث</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الوحدة أو المحور (اختياري)
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="مثال: الدوال الأسية واللوغاريتمية، الميكانيك..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Row 4: School & Wilaya & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم الثانوية أو المصدر
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="مثال: ثانوية حسيبة بن بوعلي، امتحان وطني..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الولاية
                </label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="">اختر الولاية...</option>
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w.code} value={w.name_ar}>
                      {w.code} - {w.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  مستوى الصعوبة
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as CustomExamDifficulty)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="standard">عادي ومطابق للمنهاج</option>
                  <option value="advanced">متقدم / أفكار نموذجية</option>
                  <option value="challenge">تحدي للمتفوقين (18+)</option>
                </select>
              </div>
            </div>

            {/* Row 5: File Upload Dropzones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Exam File */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  ملف الموضوع (PDF أو صورة) <span className="text-emerald-400">*</span>
                </label>
                <div
                  onClick={() => examFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    examFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-700 hover:border-slate-500 bg-slate-900/50"
                  }`}
                >
                  <input
                    ref={examFileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setExamFile(f);
                        setExamFilePreview(f.name);
                      }
                    }}
                  />
                  {examFile ? (
                    <div className="flex items-center gap-3 text-emerald-400">
                      <FileCheck className="w-8 h-8" />
                      <div>
                        <p className="text-sm font-semibold text-white">{examFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(examFile.size / 1024 / 1024).toFixed(2)} MB - جاهز للرفع
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-300 font-medium">انقر هنا لاختيار ملف الموضوع</p>
                      <p className="text-xs text-slate-500 mt-1">يدعم PDF أو الصور (PNG, JPG) حتى 25 ميغابايت</p>
                    </>
                  )}
                </div>
              </div>

              {/* Solution File */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  ملف الحل النموذجي والتنقيط (اختياري)
                </label>
                <div
                  onClick={() => solutionFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    solutionFile
                      ? "border-cyan-500/50 bg-cyan-500/5"
                      : "border-slate-700 hover:border-slate-500 bg-slate-900/50"
                  }`}
                >
                  <input
                    ref={solutionFileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setSolutionFile(f);
                        setSolutionFilePreview(f.name);
                      }
                    }}
                  />
                  {solutionFile ? (
                    <div className="flex items-center gap-3 text-cyan-400">
                      <CheckCircle2 className="w-8 h-8" />
                      <div>
                        <p className="text-sm font-semibold text-white">{solutionFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(solutionFile.size / 1024 / 1024).toFixed(2)} MB - جاهز للرفع
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileText className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-300 font-medium">انقر لاختيار ملف الحل النموذجي</p>
                      <p className="text-xs text-slate-500 mt-1">يدعم PDF أو صورة الحل للتنقيط</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Progress / Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {uploadProgress ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">سيتم حفظ الموضوع في قاعدة البيانات وإتاحته فوراً للطلاب.</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>حفظ ونشر الموضوع</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{exams.length}</p>
            <p className="text-xs text-slate-400">إجمالي المواضيع المرفوعة</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {exams.filter((e) => e.has_solution).length}
            </p>
            <p className="text-xs text-slate-400">مواضيع مرفقة بالحل النموذجي</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {exams.filter((e) => e.exam_type !== "official_bac").length}
            </p>
            <p className="text-xs text-slate-400">اختبارات فصلية وتجريبية من الثانويات</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعنوان، الثانوية، المحور أو الولاية..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStream}
            onChange={(e) => setFilterStream(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع الشعب</option>
            {STREAMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع الأنواع</option>
            {EXAM_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          <button
            onClick={fetchExams}
            title="تحديث القائمة"
            className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exams Inventory Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>قائمة المواضيع المضافة ({filteredExams.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-400" />
            <p className="text-sm">جاري جلب المواضيع من قاعدة البيانات...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-400">لا توجد مواضيع مطابقة للبحث أو الفلتر.</p>
            <p className="text-xs text-slate-500 mt-1">
              انقر على زر "+ إضافة موضوع جديد" في الأعلى لإدخال أول موضوع.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs border-b border-slate-800">
                <tr>
                  <th className="p-4">الموضوع</th>
                  <th className="p-4">الشعبة والمادة</th>
                  <th className="p-4">النوع والسنة</th>
                  <th className="p-4">المصدر / الثانوية</th>
                  <th className="p-4">الحل</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredExams.map((item) => {
                  const streamLabel =
                    STREAMS.find((s) => s.id === item.stream_id)?.label || item.stream_id;
                  const subjectLabel =
                    ALL_SUBJECTS[item.subject_id as keyof typeof ALL_SUBJECTS]?.name_ar ||
                    item.subject_id;
                  const typeLabel =
                    EXAM_TYPES.find((t) => t.id === item.exam_type)?.label || item.exam_type;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-4 font-semibold text-white max-w-xs">
                        <div className="truncate" title={item.title}>
                          {item.title}
                        </div>
                        {item.topic_name && (
                          <span className="text-xs text-slate-400 block mt-0.5">
                            المحور: {item.topic_name}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="text-emerald-400 font-medium text-xs">{subjectLabel}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{streamLabel}</div>
                      </td>

                      <td className="p-4 text-xs">
                        <div className="text-white">{typeLabel}</div>
                        <div className="text-slate-500 mt-0.5">
                          {item.year} {item.term ? `• الفصل ${item.term}` : ""}
                        </div>
                      </td>

                      <td className="p-4 text-xs text-slate-400">
                        {item.school_name || "—"}
                        {item.wilaya && <span className="block text-slate-500">({item.wilaya})</span>}
                      </td>

                      <td className="p-4 text-xs">
                        {item.has_solution ? (
                          <span className="inline-flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            <Check className="w-3 h-3" /> متوفر
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">بدون حل</span>
                        )}
                      </td>

                      <td className="p-4 text-xs">
                        <button
                          onClick={() => handleTogglePublish(item.id, item.is_published)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            item.is_published
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.is_published ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                          />
                          {item.is_published ? "منشور للطلاب" : "مسودة (مخفي)"}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setPreviewUrl(item.file_url);
                              setPreviewTitle(item.title);
                            }}
                            title="معاينة الملف"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {item.solution_url && (
                            <button
                              onClick={() => {
                                setPreviewUrl(item.solution_url!);
                                setPreviewTitle(`الحل النموذجي: ${item.title}`);
                              }}
                              title="معاينة الحل"
                              className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-400 hover:text-white transition-all"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(item.id)}
                            title="حذف الموضوع"
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B132B] border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <h4 className="text-sm font-semibold text-white truncate max-w-xl">{previewTitle}</h4>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-2 overflow-auto flex items-center justify-center">
              {previewUrl.toLowerCase().includes(".pdf") || previewUrl.startsWith("data:application/pdf") ? (
                <iframe src={previewUrl} className="w-full h-full rounded-lg border-0" title="PDF Viewer" />
              ) : (
                <img
                  src={previewUrl}
                  alt={previewTitle}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
