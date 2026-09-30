"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  GraduationCap,
  Sparkles,
  Target,
  Brain,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search,
  BookOpen,
  Award,
  Zap,
  HelpCircle,
  Repeat,
  HeartPulse,
} from "lucide-react";

export default function AdminLearningIntelligencePage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentIdInput, setStudentIdInput] = useState("student-karim-05");
  const [studentReport, setStudentReport] = useState<any | null>(null);
  const [studentMasteries, setStudentMasteries] = useState<any[]>([]);
  const [inspecting, setInspecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load skills ontology
  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/learning/intelligence");
      const data = await res.json();
      if (data.success && Array.isArray(data.skills)) {
        setSkills(data.skills);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل تحميل شجرة المهارات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  // Inspect student model
  const handleInspectStudent = async (idToInspect?: string) => {
    const id = idToInspect || studentIdInput.trim();
    if (!id) return;
    setInspecting(true);
    setErrorMsg(null);
    try {
      const res = await adminFetch(`/api/admin/learning/intelligence?studentId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.report) {
        setStudentReport(data.report);
        setStudentMasteries(data.masteries || []);
      } else {
        setErrorMsg(data.error || "تعذر فحص سجل الطالب.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "خطأ أثناء جلب تقرير الطالب.");
    } finally {
      setInspecting(false);
    }
  };

  useEffect(() => {
    handleInspectStudent("student-karim-05");
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D1526] via-[#111C35] to-[#0D1526] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                SHATER AI AGENT • LEARNING INTELLIGENCE
              </span>
              <span className="text-xs text-slate-500 font-mono">v1.0-live</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Brain className="w-6 h-6 text-indigo-400" />
              وكيل ذكاء التعلم ومصفوفة الإتقان المعرفي
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              يدير الوكيل الفهم العميق لمسار كل طالب: ما يتقنه، ما يتعثر فيه، المكتسبات القبلية الغائبة، جدول المراجعة المتباعدة، وتوليد التوصية التعليمية الموالية بدقة وتجرد.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#080D1A] border border-[#1E293B] rounded-xl p-1">
              <input
                type="text"
                placeholder="معرّف الطالب..."
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="bg-transparent px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-44 font-mono"
              />
              <button
                onClick={() => handleInspectStudent()}
                disabled={inspecting}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {inspecting ? "فحص..." : "فحص السجل"}
              </button>
            </div>
          </div>
        </div>

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

      {/* Student Cognitive State Card */}
      {studentReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recommendation Hero Card */}
          <div className="md:col-span-2 bg-[#0D1526] border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  ⚡
                </span>
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">
                    NEXT LEARNING RECOMMENDATION
                  </span>
                  <h3 className="text-sm font-bold text-slate-100">
                    {studentReport.recommendedNextStep.typeAr}
                  </h3>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                studentReport.recommendedNextStep.urgency === "critical"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : studentReport.recommendedNextStep.urgency === "high"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-teal-500/20 text-teal-400 border border-teal-500/30"
              }`}>
                أولوية: {studentReport.recommendedNextStep.urgency}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#080D1A] p-3.5 rounded-xl border border-[#1E293B]">
              {studentReport.recommendedNextStep.reasonAr}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E293B] text-xs text-slate-400">
              <span>المهارة المستهدفة: <strong className="text-slate-200">{studentReport.recommendedNextStep.targetSkillNameAr}</strong></span>
              {studentReport.recommendedNextStep.explanationSnippetAr && (
                <span className="text-indigo-400 text-[11px]">💡 {studentReport.recommendedNextStep.explanationSnippetAr}</span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">معدل الإتقان العام للطالب</span>
              <div className="text-3xl font-extrabold text-indigo-400 font-mono">
                {studentReport.overallMasteryPercentage}%
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-[#1E293B] pt-3">
              <div className="flex justify-between text-slate-400">
                <span>المهارات المتقنة تماماً:</span>
                <span className="font-bold text-emerald-400 font-mono">{studentReport.masteredSkillsCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>المهارات قيد المتابعة:</span>
                <span className="font-bold text-slate-200 font-mono">{studentReport.totalSkillsTracked}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>دقة المحاولات الأخيرة:</span>
                <span className="font-bold text-teal-400 font-mono">{studentReport.recentPracticeSummary.accuracyPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What Improved & What Needs Review */}
      {studentReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What Improved */}
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>ما تحسن وأتقنه الطالب مؤخراً (What Improved)</span>
            </h3>
            {studentReport.whatImproved.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">لا توجد مهارات مكتملة الإتقان بعد، المسار في بدايته.</p>
            ) : (
              <div className="space-y-2">
                {studentReport.whatImproved.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#080D1A] border border-emerald-500/20 text-xs flex items-center justify-between">
                    <span className="text-slate-200 font-medium">{item.nameAr}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                      {item.currentLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What Needs Review */}
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 text-amber-400">
              <Repeat className="w-4 h-4" />
              <span>ما يحتاج مراجعة أو تنشيط (What Needs Review)</span>
            </h3>
            {studentReport.whatNeedsReview.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">كافة المهارات الممارسة ضمن فترة الأمان ولا تتطلب مراجعة حالياً.</p>
            ) : (
              <div className="space-y-2">
                {studentReport.whatNeedsReview.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#080D1A] border border-amber-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-medium">{item.nameAr}</span>
                      <span className="text-amber-400 font-mono font-bold">{item.masteryScore}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.reasonAr}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Skills Ontology & Cognitive Graph */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>شجرة المهارات والمكتسبات القبلية المقررة (Skills & Prerequisites)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مخطط تسلسل المهارات البيداغوجية لمناهج البكالوريا الجزائرية، وشبكة الروابط القبلية.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {skills.length} مهارة موثقة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {skills.map((s) => (
            <div key={s.id} className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {s.subjectId}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  s.difficulty === "advanced" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                }`}>
                  {s.difficulty}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-200 leading-snug">{s.nameAr}</h4>

              <div className="text-[11px] text-slate-500">
                <span>{s.unit}</span>
              </div>

              {s.prerequisiteSkillIds && s.prerequisiteSkillIds.length > 0 && (
                <div className="pt-2 border-t border-[#1E293B]/60 text-[10px] text-amber-400 flex items-center gap-1">
                  <span>المكتسب القبلي:</span>
                  <span className="font-mono text-slate-300">{s.prerequisiteSkillIds.join(", ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
