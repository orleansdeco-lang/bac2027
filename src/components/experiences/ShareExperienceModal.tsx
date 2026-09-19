"use client";

import React, { useState, useEffect } from "react";
import { CreateExperienceInput, BacExperience, CandidateType } from "@/types/experience";
import { ExperienceService } from "@/lib/services/experience-service";
import { ALGERIAN_WILAYAS } from "@/domain/administrative/algeria-administrative";
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
  Clock,
  ShieldCheck,
  User,
  Target,
  Award,
  RefreshCw,
  MapPin,
} from "lucide-react";

interface ShareExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  userFirstName?: string;
  userWilaya?: string;
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
  userFirstName,
  userWilaya,
  defaultStreamId = "sciences",
  onCreated,
  onToast,
}: ShareExperienceModalProps) {
  // Author name: strictly first name only
  const [authorFirstName, setAuthorFirstName] = useState(userFirstName?.trim().split(/\s+/)[0] || "");
  const [streamId, setStreamId] = useState(defaultStreamId);
  const [wilaya, setWilaya] = useState(userWilaya || "");

  // Candidate Track:
  // 1: current_student (طالب مقبل على الباك 2027)
  // 2: former_candidate (طالب اجتاز الباك سابقاً)
  const [candidateType, setCandidateType] = useState<CandidateType>("former_candidate");

  // For former candidates:
  const [passedBac, setPassedBac] = useState<boolean>(true);
  const [finalGrade, setFinalGrade] = useState<string>("");
  const [universityMajor, setUniversityMajor] = useState("");
  const [retakingBac, setRetakingBac] = useState<boolean>(false);
  const [initialGrade, setInitialGrade] = useState<string>("");

  // For current students:
  const [targetMajor, setTargetMajor] = useState("");

  // Common pedagogical core
  const [biggestTrap, setBiggestTrap] = useState("");
  const [winningRoutine, setWinningRoutine] = useState("");
  const [bestResources, setBestResources] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userFirstName && !authorFirstName) {
      setAuthorFirstName(userFirstName.trim().split(/\s+/)[0]);
    }
    if (userWilaya && !wilaya) {
      setWilaya(userWilaya);
    }
  }, [userFirstName, userWilaya]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    const clean = val.trim().split(/\s+/)[0] || "";
    setAuthorFirstName(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanFirstName = authorFirstName.trim().split(/\s+/)[0];
    if (!cleanFirstName) {
      setErrorMsg("يرجى إدخال اسمك الأول");
      return;
    }

    if (candidateType === "former_candidate") {
      if (passedBac) {
        const numFinal = finalGrade ? parseFloat(finalGrade) : null;
        if (!numFinal || isNaN(numFinal) || numFinal < 9.5 || numFinal > 20.0) {
          setErrorMsg("يرجى إدخال معدل بكالوريا صحيح (بين 9.50 و 20.00)");
          return;
        }
        if (!universityMajor.trim()) {
          setErrorMsg("يرجى كتابة التخصص الجامعي الذي اخترته (أو درسته)");
          return;
        }
      } else {
        const numPrev = initialGrade ? parseFloat(initialGrade) : null;
        if (numPrev !== null && (isNaN(numPrev) || numPrev < 0 || numPrev > 20)) {
          setErrorMsg("يرجى إدخال معدل سابق صحيح");
          return;
        }
      }
    }

    if (biggestTrap.trim().length < 20) {
      setErrorMsg("يرجى شرح أكبر فخ بتفصيل كافٍ (20 حرفاً على الأقل) لتقديم نصيحة عملية مفيدة لزملائك");
      return;
    }

    if (winningRoutine.trim().length < 20) {
      setErrorMsg("يرجى تفصيل السر أو الروتين الذي صنع لك الفارق (20 حرفاً على الأقل)");
      return;
    }

    setIsSubmitting(true);

    try {
      const numFinal = passedBac && finalGrade ? parseFloat(finalGrade) : null;
      const numInitial = !passedBac && initialGrade ? parseFloat(initialGrade) : null;

      const input: CreateExperienceInput = {
        author_name: cleanFirstName,
        candidate_type: candidateType,
        author_role: candidateType === "current_student"
          ? "student"
          : (passedBac && (numFinal || 0) >= 16 ? "top_achiever" : (retakingBac ? "repeater_success" : "student")),
        stream_id: streamId,
        wilaya: wilaya || null,
        passed_bac: candidateType === "former_candidate" ? passedBac : null,
        retaking_bac: candidateType === "former_candidate" ? retakingBac : null,
        final_grade: numFinal,
        initial_grade: numInitial,
        university_major: candidateType === "former_candidate" && passedBac ? universityMajor.trim() : null,
        target_major: candidateType === "current_student" ? targetMajor.trim() : null,
        biggest_trap: biggestTrap.trim(),
        winning_routine: winningRoutine.trim(),
        best_resources: bestResources.trim() || null,
      };

      const created = await ExperienceService.createExperience(input, userId);
      onCreated(created);
      onToast("✨ تم استلام تجربتك بنجاح! سيتم تدقيقها ونشرها في بنك التجارب قريباً.");
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
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-5 sm:p-7 my-8 text-right text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
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
            <h2 className="text-xl font-extrabold text-white">
              شارك تجربتك الحقيقية في البكالوريا 🌟
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              نصيحتك الميدانية الصادقة قد تُنقذ طالباً من عثرة وتصنع له الفارق
            </p>
          </div>
        </div>

        {/* Supervision notice */}
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-300 leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            <strong>ملاحظة للمصداقية:</strong> تخضع كل تجربة لمراجعة وتدقيق لغوي من فريق العمليات قبل ظهورها للعموم لضمان أعلى جودة وخلوها من الأخطاء الإملائية.
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Row 1: First Name Only, Stream, Wilaya */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                الاسم الأول فقط <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={authorFirstName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: ياسمين أو أكرم"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                الشعبة <span className="text-rose-400">*</span>
              </label>
              <select
                value={streamId}
                onChange={(e) => setStreamId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
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
                الولاية
              </label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">-- اختر ولايتك --</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w.code} value={w.name_ar}>
                    {w.code} - {w.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Track Selection (Two distinct tracks) */}
          <div className="pt-2">
            <label className="block font-bold text-slate-200 text-sm mb-2">
              صفتك ووضعيتك في البكالوريا: <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Current Student */}
              <button
                type="button"
                onClick={() => setCandidateType("current_student")}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  candidateType === "current_student"
                    ? "border-emerald-500 bg-emerald-500/10 text-white shadow-sm"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Target className={`h-4 w-4 ${candidateType === "current_student" ? "text-emerald-400" : "text-slate-500"}`} />
                  <span className={candidateType === "current_student" ? "text-white" : "text-slate-300"}>طالب مقبل على الباك (2027) 🎯</span>
                </div>
                <p className="text-xs text-slate-400">
                  أعيش التحضير حالياً وأشارك طريقتي أو الفخاخ التي تجاوزتها
                </p>
              </button>

              {/* Option 2: Former Candidate */}
              <button
                type="button"
                onClick={() => setCandidateType("former_candidate")}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  candidateType === "former_candidate"
                    ? "border-emerald-500 bg-emerald-500/10 text-white shadow-sm"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <GraduationCap className={`h-4 w-4 ${candidateType === "former_candidate" ? "text-emerald-400" : "text-slate-500"}`} />
                  <span className={candidateType === "former_candidate" ? "text-white" : "text-slate-300"}>اجتزت البكالوريا سابقاً 🎓</span>
                </div>
                <p className="text-xs text-slate-400">
                  خضت الامتحان الحقيقي وأنقل خلاصة التجربة والعِبر
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Sub-questions based on Candidate Type */}
          {candidateType === "current_student" && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  الوجهة أو التخصص الجامعي الذي تطمح إليه (اختياري)
                </label>
                <input
                  type="text"
                  value={targetMajor}
                  onChange={(e) => setTargetMajor(e.target.value)}
                  placeholder="مثال: المدرسة العليا للإعلام الآلي ESI، الطب البشري، الذكاء الاصطناعي..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {candidateType === "former_candidate" && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3.5">
              {/* Question: Did you pass? */}
              <div>
                <label className="block font-bold text-slate-200 mb-2">
                  هل وُفّقت في نيل شهادة البكالوريا؟ <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer font-semibold ${
                    passedBac
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-800 bg-slate-900 text-slate-400"
                  }`}>
                    <input
                      type="radio"
                      name="passed_bac"
                      checked={passedBac === true}
                      onChange={() => setPassedBac(true)}
                      className="accent-emerald-500"
                    />
                    <span>نعم، نجحت بفضل الله 🎓</span>
                  </label>

                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer font-semibold ${
                    !passedBac
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      : "border-slate-800 bg-slate-900 text-slate-400"
                  }`}>
                    <input
                      type="radio"
                      name="passed_bac"
                      checked={passedBac === false}
                      onChange={() => setPassedBac(false)}
                      className="accent-amber-500"
                    />
                    <span>لم أوفّق لكن تعلمت دروساً ثمينة 💪</span>
                  </label>
                </div>
              </div>

              {/* If Passed */}
              {passedBac ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      معدل البكالوريا النهائي المحصل عليه <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="9.5"
                      max="20"
                      value={finalGrade}
                      onChange={(e) => setFinalGrade(e.target.value)}
                      placeholder="مثال: 16.85"
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      التخصص الجامعي الذي اخترته <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={universityMajor}
                      onChange={(e) => setUniversityMajor(e.target.value)}
                      placeholder="مثال: صيدلة، هندسة معمارية، رياضيات وإعلام آلي..."
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Retaking BAC as free candidate? */}
                  <div className="sm:col-span-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={retakingBac}
                        onChange={(e) => setRetakingBac(e.target.checked)}
                        className="h-4 w-4 accent-emerald-500 rounded"
                      />
                      <span>هل تعيد البكالوريا هذا العام كمترشح حر لتحسين المعدل ونيل تخصص أعلى؟ 🔄</span>
                    </label>
                  </div>
                </div>
              ) : (
                /* If Didn't Pass */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      معدلك السابق (اختياري)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      value={initialGrade}
                      onChange={(e) => setInitialGrade(e.target.value)}
                      placeholder="مثال: 9.20"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 h-full">
                      <input
                        type="checkbox"
                        checked={retakingBac}
                        onChange={(e) => setRetakingBac(e.target.checked)}
                        className="h-4 w-4 accent-emerald-500 rounded"
                      />
                      <span>أنا أستعد لإعادة البكالوريا بعزيمة جديدة هذا العام 🚀</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

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
              placeholder="احذر من التعميمات الجاهزة. وضّح مثلاً: إهمال مادة معينة، السهر الزائد، الاعتماد على الحفظ بدل الفهم، إهمال سلم التنقيط، التشتت بين المراجع..."
              className="w-full rounded-xl border border-rose-500/30 bg-rose-950/10 p-3 text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none leading-relaxed"
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
              placeholder="مثال: روتين مراجعة الفجر، الاسترجاع المنظم بالبطاقات، حل البكالوريات السابقة بالمؤقت الزمني، دراسة منهجية الإجابة للوزارة..."
              className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none leading-relaxed"
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
              placeholder="مثال: الأستاذ نور الدين في الرياضيات، الأستاذ بوالريش في العلوم، مواضيع البكالوريا الرسمية..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "جاري الحفظ..." : "إرسال للمراجعة والنشر"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
