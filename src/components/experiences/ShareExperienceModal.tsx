"use client";

import React, { useState } from "react";
import { CreateExperienceInput, ExperienceRole, BacExperience } from "@/types/experience";
import { ExperienceService } from "@/lib/services/experience-service";
import {
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Send,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface ShareExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  defaultStreamId?: string;
  onCreated: (newExp: BacExperience) => void;
  onToast: (msg: string) => void;
}

const STREAMS = [
  { id: "sciences", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "gestion_economie", label: "تسيير واقتصاد" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "langues_etrangeres", label: "لغات أجنبية" },
];

export function ShareExperienceModal({
  isOpen,
  onClose,
  userId,
  defaultStreamId = "sciences",
  onCreated,
  onToast,
}: ShareExperienceModalProps) {
  const [authorName, setAuthorName] = useState("");
  const [streamId, setStreamId] = useState(defaultStreamId);
  const [authorRole, setAuthorRole] = useState<ExperienceRole>("top_achiever");
  const [finalGrade, setFinalGrade] = useState<string>("");
  const [initialGrade, setInitialGrade] = useState<string>("");
  const [targetMajor, setTargetMajor] = useState("");
  const [biggestTrap, setBiggestTrap] = useState("");
  const [winningRoutine, setWinningRoutine] = useState("");
  const [bestResources, setBestResources] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Strict substantive validation to prevent empty buzzwords
    if (!authorName.trim()) {
      setErrorMsg("يرجى إدخال اسمك أو اللقب المستعار");
      return;
    }

    if (biggestTrap.trim().length < 25) {
      setErrorMsg("يرجى شرح أكبر فخ بتفصيل كافٍ (25 حرفاً على الأقل) لتقديم نصيحة عملية مفيدة لزملائك");
      return;
    }

    if (winningRoutine.trim().length < 25) {
      setErrorMsg("يرجى تفصيل السر أو الروتين الذي صنع لك الفارق (25 حرفاً على الأقل)");
      return;
    }

    const numFinal = finalGrade ? parseFloat(finalGrade) : null;
    if (numFinal !== null && (isNaN(numFinal) || numFinal < 9.0 || numFinal > 20.0)) {
      setErrorMsg("يرجى إدخال معدل بكالوريا صحيح بين 09.00 و 20.00");
      return;
    }

    const numInitial = initialGrade ? parseFloat(initialGrade) : null;
    if (numInitial !== null && (isNaN(numInitial) || numInitial < 5.0 || numInitial > 20.0)) {
      setErrorMsg("يرجى إدخال معدل البداية الصحيح");
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateExperienceInput = {
        author_name: authorName,
        author_role: authorRole,
        stream_id: streamId,
        final_grade: numFinal,
        initial_grade: numInitial,
        target_major: targetMajor.trim() || undefined,
        biggest_trap: biggestTrap,
        winning_routine: winningRoutine,
        best_resources: bestResources.trim() || undefined,
      };

      const created = await ExperienceService.createExperience(input, userId);
      onCreated(created);
      onToast("✨ تم نشر تجربتك بنجاح! شكراً لمساهمتك في إلهام زملائك.");
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("حدث خطأ أثناء حفظ التجربة، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-5 sm:p-7 my-8 text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">شارك تجربتك واصنع الفارق 🌟</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              تجربتك الميدانية الحقيقية قد تنقذ طالباً من الرسوب أو تلهمه لنيل معدل أحلامه.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Row 1: Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                الاسم أو اللقب المستعار <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="مثال: ياسمين (ولاية قسنطينة)"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                صفتك في البكالوريا <span className="text-rose-400">*</span>
              </label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value as ExperienceRole)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="top_achiever">🏆 متفوق بمعدل عالي (16+)</option>
                <option value="repeater_success">🚀 معيد حقق قفزة نوعية ونجاحاً</option>
                <option value="student">🎯 طالب بكالوريا حالي</option>
              </select>
            </div>
          </div>

          {/* Row 2: Stream & Target Major */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                الشعبة <span className="text-rose-400">*</span>
              </label>
              <select
                value={streamId}
                onChange={(e) => setStreamId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {STREAMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                التخصص الجامعي أو الوجهة
              </label>
              <input
                type="text"
                value={targetMajor}
                onChange={(e) => setTargetMajor(e.target.value)}
                placeholder="مثال: طب بشري، إعلام آلي ESI، مدرسة عليا"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Grades (Initial and Final) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                المعدل النهائي المحصل عليه
              </label>
              <input
                type="number"
                step="0.01"
                min="9"
                max="20"
                value={finalGrade}
                onChange={(e) => setFinalGrade(e.target.value)}
                placeholder="مثال: 17.50"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                المعدل السابق (للمعيدين فقط)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="20"
                value={initialGrade}
                onChange={(e) => setInitialGrade(e.target.value)}
                placeholder="مثال: 10.20"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Prompt 1: Biggest Trap */}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-rose-300 mb-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>ما هو أكبر فخ أو خطأ كاد يسقطك أو ضيع وقتك؟</span>
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={biggestTrap}
              onChange={(e) => setBiggestTrap(e.target.value)}
              rows={3}
              required
              placeholder="احذر من التعميمات الجاهزة. وضّح مثلاً: إهمال مادة معينة، السهر الزائد، الاعتماد على الحفظ بدل الفهم، إهمال سلم التنقيط..."
              className="w-full rounded-xl border border-rose-500/30 bg-rose-950/10 p-3 text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 leading-relaxed"
            />
          </div>

          {/* Prompt 2: Winning Routine */}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1.5">
              <Lightbulb className="h-4 w-4 text-emerald-400" />
              <span>ما هي العادة أو الطريقة الوحيدة التي صنعت لك الفارق؟</span>
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={winningRoutine}
              onChange={(e) => setWinningRoutine(e.target.value)}
              rows={3}
              required
              placeholder="مثال: روتين مراجعة الفجر، الاسترجاع المنظم، حل البكالوريات السابقة بالمؤقت، ملخصات الخرائط الذهنية..."
              className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed"
            />
          </div>

          {/* Prompt 3: Best Resources */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1.5">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>المراجع، القنوات أو الأساتذة الأكثر فائدة (اختياري)</span>
            </label>
            <input
              type="text"
              value={bestResources}
              onChange={(e) => setBestResources(e.target.value)}
              placeholder="مثال: الأستاذ نور الدين في الرياضيات، الأستاذ بوالريش في العلوم، بنك مواضيع البكالوريا الرسمية..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "جاري النشر..." : "نشر التجربة الآن"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
