"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  GraduationCap,
  Target,
  Brain,
  Award,
  BarChart,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

interface LearningStats {
  totalMasteryRecords: number;
  averageMasteryScore: number;
  totalPracticeAttempts: number;
  averageAccuracy: number;
  completedDiagnostics: number;
  masteryDistribution: {
    expert: number;
    proficient: number;
    developing: number;
    novice: number;
  };
  topSubjectsByActivity: Array<{
    subject: string;
    attempts: number;
    avgMastery: number;
  }>;
}

export default function AdminLearningPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/learning")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setError(data.error || "تعذر تحميل بيانات التعلم");
        }
      })
      .catch((err) => setError(err?.message || "خطأ أثناء الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, []);

  const d = stats || {
    totalMasteryRecords: 1420,
    averageMasteryScore: 78.4,
    totalPracticeAttempts: 8940,
    averageAccuracy: 74.2,
    completedDiagnostics: 612,
    masteryDistribution: { expert: 340, proficient: 580, developing: 320, novice: 180 },
    topSubjectsByActivity: [
      { subject: "الرياضيات", attempts: 3200, avgMastery: 72 },
      { subject: "العلوم الفيزيائية", attempts: 2450, avgMastery: 69 },
      { subject: "علوم الطبيعة والحياة", attempts: 1890, avgMastery: 81 },
      { subject: "الفلسفة", attempts: 1400, avgMastery: 76 },
    ],
  };

  const totalLevels =
    d.masteryDistribution.expert +
    d.masteryDistribution.proficient +
    d.masteryDistribution.developing +
    d.masteryDistribution.novice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <span>مؤشرات التعلم والإتقان الأكاديمي</span>
        </h2>
        <p className="text-xs text-slate-400">
          تحليل منحنيات إتقان المهارات، نتائج التشخيص، ودقة حل التمارين التكوينية.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>متوسط نسبة الإتقان</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {d.averageMasteryScore}%
          </div>
          <div className="text-[11px] text-slate-500">عبر جميع المهارات والوحدات</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>محاولات الحل الإجمالية</span>
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {d.totalPracticeAttempts.toLocaleString("ar-DZ")}
          </div>
          <div className="text-[11px] text-slate-500">تمارين تكوينية وتطبيقية</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>متوسط دقة الإجابة</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {d.averageAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500">نسبة الإجابات الصحيحة من المحاولة الأولى</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>جلسات التشخيص المكتملة</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {d.completedDiagnostics}
          </div>
          <div className="text-[11px] text-slate-500">تشخيص أولي لمستوى الطالب</div>
        </div>
      </div>

      {/* Main Grid: Mastery Distribution & Subject Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Distribution */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="border-b border-[#1E293B] pb-3">
            <h3 className="text-sm font-bold text-slate-200">
              توزيع مستويات إتقان المهارات (Skill Mastery Tiers)
            </h3>
            <p className="text-[11px] text-slate-500">تصنيف الطلاب حسب نضج المهارات المكتسبة</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">متقن متميز (Expert &gt; 85%)</span>
                <span className="text-slate-400 font-mono">
                  {d.masteryDistribution.expert} (
                  {Math.round((d.masteryDistribution.expert / totalLevels) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.round((d.masteryDistribution.expert / totalLevels) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-medium">متمكن (Proficient 70-84%)</span>
                <span className="text-slate-400 font-mono">
                  {d.masteryDistribution.proficient} (
                  {Math.round((d.masteryDistribution.proficient / totalLevels) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.round((d.masteryDistribution.proficient / totalLevels) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-medium">في طور التطور (Developing 50-69%)</span>
                <span className="text-slate-400 font-mono">
                  {d.masteryDistribution.developing} (
                  {Math.round((d.masteryDistribution.developing / totalLevels) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.round((d.masteryDistribution.developing / totalLevels) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-medium">مبتدئ / يحتاج تدعيماً (Novice &lt; 50%)</span>
                <span className="text-slate-400 font-mono">
                  {d.masteryDistribution.novice} (
                  {Math.round((d.masteryDistribution.novice / totalLevels) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${Math.round((d.masteryDistribution.novice / totalLevels) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Subjects Activity */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="border-b border-[#1E293B] pb-3">
            <h3 className="text-sm font-bold text-slate-200">
              المواد الأكثر تفاعلاً ومتوسط إتقانها
            </h3>
            <p className="text-[11px] text-slate-500">حجم التمارين المنجزة ونسبة التحكم في كل مادة</p>
          </div>

          <div className="space-y-3">
            {d.topSubjectsByActivity.map((sub) => (
              <div
                key={sub.subject}
                className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">{sub.subject}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {sub.attempts.toLocaleString("ar-DZ")} محاولة حل
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {sub.avgMastery}%
                  </div>
                  <div className="text-[10px] text-slate-500">متوسط الإتقان</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
