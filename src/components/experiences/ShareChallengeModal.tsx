"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  RefreshCw,
  Eye,
  FileCheck,
} from "lucide-react";
import { ChallengeInput, ChallengeDifficulty, ChallengeFileType } from "@/types/challenge";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { ALGERIAN_WILAYAS } from "@/domain/administrative/algeria-administrative";

interface ShareChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ChallengeInput) => Promise<boolean>;
  userFirstName: string;
  userWilaya: string;
  userStreamId?: string;
}

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

export function ShareChallengeModal({
  isOpen,
  onClose,
  onSubmit,
  userFirstName,
  userWilaya,
  userStreamId,
}: ShareChallengeModalProps) {
  const [title, setTitle] = useState("");
  const [streamId, setStreamId] = useState(userStreamId || "sciences_exp");
  const [subjectId, setSubjectId] = useState("math");
  const [topicName, setTopicName] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<ChallengeDifficulty>("medium");
  const [contentText, setContentText] = useState("");

  // Attachments
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [hasSolution, setHasSolution] = useState(false);
  const [solutionText, setSolutionText] = useState("");
  const [solutionFile, setSolutionFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const solutionFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const uploadFileDirectly = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "community_uploads");
    formData.append("subFolder", "challenges");

    const res = await fetch("/api/ops/exams/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "فشل الرفع" }));
      throw new Error(err.error || "خطأ أثناء رفع الملف");
    }
    const data = await res.json();
    return { url: data.url, fileType: data.fileType as ChallengeFileType };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("يرجى إدخال عنوان للتحدي أو التمرين");
      return;
    }
    if (!contentText.trim() && !attachedFile) {
      setError("يرجى كتابة نص التمرين أو رفع صورة/ملف PDF للمسألة");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let fileUrl: string | undefined = undefined;
      let fileType: ChallengeFileType = "none";

      if (attachedFile) {
        setUploadStatus("جاري رفع مرفق التمرين...");
        const res = await uploadFileDirectly(attachedFile);
        fileUrl = res.url;
        fileType = res.fileType;
      }

      let solutionFileUrl: string | undefined = undefined;
      if (hasSolution && solutionFile) {
        setUploadStatus("جاري رفع ملف الحل النموذجي...");
        const solRes = await uploadFileDirectly(solutionFile);
        solutionFileUrl = solRes.url;
      }

      setUploadStatus("جاري نشر التحدي في مجتمع البكالوريا...");
      const ok = await onSubmit({
        author_name: userFirstName || "طالب",
        wilaya: userWilaya || undefined,
        stream_id: streamId,
        subject_id: subjectId,
        topic_name: topicName,
        title,
        content_text: contentText,
        file_url: fileUrl,
        file_type: fileType,
        has_solution: hasSolution,
        solution_text: hasSolution ? solutionText : undefined,
        solution_file_url: solutionFileUrl,
        difficulty_level: difficultyLevel,
      });

      if (ok) {
        onClose();
      } else {
        setError("فشل نشر التحدي، يرجى إعادة المحاولة");
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
      setUploadStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-[#0B132B] border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        dir="rtl"
      >
        {/* Decorative top bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">شارك موضوعاً أو مسألة مع زملائك</h3>
              <p className="text-xs text-slate-400">
                تمرين مميز، فكرة اختبار، أو مسألة واجهت صعوبة فيها لتناقشها مع مجتمع البكالوريا.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Author Badge (Readonly) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">صاحب التحدي:</span>
              <span className="font-semibold text-cyan-300">{userFirstName}</span>
              <span className="text-slate-500 text-[10px]">(ينشر الاسم الشخصي فقط)</span>
            </div>
            {userWilaya && (
              <div className="flex items-center gap-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{userWilaya}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              عنوان الموضوع أو التمرين <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مسألة شاملة في الدوال الأسية والتكامل، أو تمرين بكالوريا تجريبية..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Stream & Subject & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الشعبة</label>
              <select
                value={streamId}
                onChange={(e) => setStreamId(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {STREAMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">المادة</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {Object.values(ALL_SUBJECTS).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الوحدة / المحور
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="مثال: المتتاليات، النووي..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              مستوى الصعوبة التقديري
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "normal", label: "مستوى عادي", color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
                { id: "medium", label: "متوسط وأفكار هامة", color: "border-blue-500 text-blue-400 bg-blue-500/10" },
                { id: "hard", label: "فكرة صعبة / تعمق", color: "border-amber-500 text-amber-400 bg-amber-500/10" },
                { id: "genius", label: "تحدي 19+ امتياز", color: "border-rose-500 text-rose-400 bg-rose-500/10" },
              ].map((diff) => (
                <button
                  type="button"
                  key={diff.id}
                  onClick={() => setDifficultyLevel(diff.id as ChallengeDifficulty)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    difficultyLevel === diff.id
                      ? diff.color + " ring-1 ring-cyan-400"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Text Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              نص المسألة أو نصائح وحيثيات التمرين
            </label>
            <textarea
              rows={3}
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="اكتب نص التمرين هنا، أو اكتب مقدمة واشرح الفكرة إذا كنت سترفع صورة أو PDF..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* File Upload (Image or PDF) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              مرفق المسألة (صورة أو ملف PDF)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                attachedFile
                  ? "border-cyan-500/60 bg-cyan-500/5"
                  : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAttachedFile(f);
                }}
              />
              {attachedFile ? (
                <div className="flex items-center gap-3 text-cyan-400">
                  <FileCheck className="w-6 h-6" />
                  <div>
                    <p className="text-xs font-semibold text-white">{attachedFile.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {(attachedFile.size / 1024 / 1024).toFixed(2)} MB - جاهز للنشر
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-300 font-medium">اختر صورة التمرين أو ملف PDF</p>
                  <p className="text-[10px] text-slate-500">حتى 15 ميغابايت</p>
                </>
              )}
            </div>
          </div>

          {/* Solution Toggle */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">هل لديك الحل النموذجي للتمرين؟</p>
                <p className="text-[11px] text-slate-400">
                  يمكنك إرفاق الحل ليطلع عليه الزملاء بعد المحاولة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHasSolution(!hasSolution)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hasSolution ? "bg-cyan-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hasSolution ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            {hasSolution && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <textarea
                  rows={2}
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="اكتب خطوات الحل أو النتائج النهائية هنا..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div
                  onClick={() => solutionFileInputRef.current?.click()}
                  className="border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-950/60"
                >
                  <input
                    ref={solutionFileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setSolutionFile(f);
                    }}
                  />
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300">
                    {solutionFile ? solutionFile.name : "رفع ملف الحل أو صورة الورقة (اختياري)"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {uploadStatus ? (
              <div className="flex items-center gap-2 text-xs text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500">سيظهر التمرين فوراً لجميع زملائك.</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري النشر...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>نشر التحدي الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
