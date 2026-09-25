"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  GraduationCap,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  BarChart,
  Percent,
} from "lucide-react";
import { useTimer } from "@/context/TimerContext";
import {
  BAC_STREAM_CURRICULUM,
  CURRICULUM_STAGES,
  getStreamCurriculum,
  CurriculumSubject,
  CurriculumUnit,
} from "@/data/yptCurriculum";

export function BacCurriculumTrackerView() {
  const { userStream, setUserStream, curriculumProgress, toggleCurriculumStage } = useTimer();

  const currentCurriculum = getStreamCurriculum(userStream);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    currentCurriculum.subjects[0]?.id || "natural_sciences"
  );
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  const streams = [
    { id: "sciences_exp", labelAr: "علوم تجريبية" },
    { id: "math", labelAr: "رياضيات" },
    { id: "technique_math", labelAr: "تقني رياضي" },
    { id: "gestion_eco", labelAr: "تسيير واقتصاد" },
    { id: "lettres_philo", labelAr: "آداب وفلسفة" },
    { id: "langues_etrangeres", labelAr: "لغات أجنبية" },
  ];

  // Subject chosen
  const activeSubject =
    currentCurriculum.subjects.find((s) => s.id === selectedSubjectId) ||
    currentCurriculum.subjects[0];

  // Calculate subject overall progress percentage
  const calculateSubjectProgress = (subject: CurriculumSubject): number => {
    let totalStages = subject.units.length * 4;
    let completedStages = 0;
    subject.units.forEach((unit) => {
      CURRICULUM_STAGES.forEach((st) => {
        if (curriculumProgress[`${unit.id}_${st.id}`]) {
          completedStages++;
        }
      });
    });
    return totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  };

  // Calculate unit progress percentage
  const calculateUnitProgress = (unit: CurriculumUnit): number => {
    let completed = 0;
    CURRICULUM_STAGES.forEach((st) => {
      if (curriculumProgress[`${unit.id}_${st.id}`]) completed++;
    });
    return Math.round((completed / 4) * 100);
  };

  // Overall Stream Progress
  let totalStreamStages = 0;
  let completedStreamStages = 0;
  currentCurriculum.subjects.forEach((subj) => {
    totalStreamStages += subj.units.length * 4;
    subj.units.forEach((unit) => {
      CURRICULUM_STAGES.forEach((st) => {
        if (curriculumProgress[`${unit.id}_${st.id}`]) completedStreamStages++;
      });
    });
  });
  const overallStreamProgress =
    totalStreamStages > 0
      ? Math.round((completedStreamStages / totalStreamStages) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 select-none">
      {/* 1. HEADER & OVERALL PROGRESS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0E131F] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white font-serif">
                برنامج البكالوريا الرسمية — متتبع المنهاج
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                وزارة التربية الوطنية
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              تتبع إنجاز كل وحدة عبر 4 مراحل: (درس نظري ✅، ملخص شخصي ✅، حل تمارين الكتاب ✅، وحل مواضيع البكالوريا السابقة ✅).
            </p>
          </div>
        </div>

        {/* Overall Stream Progress Gauge */}
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 relative z-10 self-start md:self-auto">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center font-mono font-black text-amber-300 text-sm">
            {overallStreamProgress}%
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">جاهزية المنهاج العام:</span>
            <span className="text-xs font-black text-white">
              {completedStreamStages} / {totalStreamStages} خطوة مكتملة
            </span>
          </div>
        </div>
      </div>

      {/* 2. ALGERIAN BRANCH (STREAM) SELECTOR PILLS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
          <span>شعبة البكالوريا:</span>
          <span className="text-[11px] text-amber-400">انقر للتبديل بين الشعب</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {streams.map((st) => {
            const isSelected = st.id === userStream;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setUserStream(st.id);
                  const newCurr = getStreamCurriculum(st.id);
                  if (newCurr.subjects.length > 0) {
                    setSelectedSubjectId(newCurr.subjects[0].id);
                  }
                }}
                className={`px-4 py-2 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-102"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {st.labelAr}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SUBJECTS TABS & UNITS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subject Navigation Column */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-xs text-slate-400 font-bold block px-1">مواد الشعبة:</span>
          <div className="space-y-2">
            {currentCurriculum.subjects.map((subj) => {
              const isSelected = subj.id === activeSubject?.id;
              const progress = calculateSubjectProgress(subj);

              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`w-full p-3.5 rounded-2xl border text-right transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "bg-[#141A29] border-amber-500/50 shadow-md text-white"
                      : "bg-[#0E131F] border-white/10 text-slate-400 hover:text-white hover:bg-[#121826]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{subj.icon}</span>
                      <span className="font-black text-xs">{subj.nameAr}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono">
                      معامل {subj.coefficient}
                    </span>
                  </div>

                  {/* Progress Bar in Tab */}
                  <div className="w-full space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: subj.hexColor,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{subj.units.length} وحدات</span>
                      <span style={{ color: subj.hexColor }}>{progress}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Units & Checklist Column */}
        <div className="lg:col-span-3 space-y-4">
          {activeSubject && (
            <div className="p-5 sm:p-7 rounded-3xl bg-[#0E131F] border border-white/10 shadow-2xl space-y-6">
              {/* Subject Title & Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                    style={{ backgroundColor: `${activeSubject.hexColor}25` }}
                  >
                    {activeSubject.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white font-serif">
                      {activeSubject.nameAr}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      {activeSubject.nameFr} • المعامل الوزاري {activeSubject.coefficient}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="text-slate-400">نسبة التقدم الكلية:</span>
                  <span
                    className="font-mono font-black text-sm"
                    style={{ color: activeSubject.hexColor }}
                  >
                    {calculateSubjectProgress(activeSubject)}%
                  </span>
                </div>
              </div>

              {/* Units Accordion List */}
              <div className="space-y-3.5">
                {activeSubject.units.map((unit) => {
                  const unitProgress = calculateUnitProgress(unit);
                  const isExpanded = expandedUnitId === unit.id || expandedUnitId === null;

                  return (
                    <div
                      key={unit.id}
                      className="rounded-2xl border border-white/10 bg-[#090D15] overflow-hidden transition-all hover:border-white/20"
                    >
                      {/* Unit Header */}
                      <div
                        onClick={() =>
                          setExpandedUnitId(expandedUnitId === unit.id ? null : unit.id)
                        }
                        className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="px-2 py-1 rounded-lg text-[10px] font-black shrink-0 text-white"
                            style={{ backgroundColor: activeSubject.hexColor }}
                          >
                            {unit.code}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-black text-xs sm:text-sm text-white truncate">
                              {unit.titleAr}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {unit.descriptionAr}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${unitProgress}%`,
                                  backgroundColor:
                                    unitProgress === 100 ? "#10B981" : activeSubject.hexColor,
                                }}
                              />
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-300 min-w-[2.5rem]">
                              {unitProgress}%
                            </span>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Unit 4 Checklist Stages */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {CURRICULUM_STAGES.map((stage) => {
                            const isChecked = Boolean(
                              curriculumProgress[`${unit.id}_${stage.id}`]
                            );

                            return (
                              <button
                                key={stage.id}
                                onClick={() => toggleCurriculumStage(unit.id, stage.id)}
                                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                                  isChecked
                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isChecked ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                                  )}
                                  <span className="text-xs font-bold truncate">
                                    {stage.title}
                                  </span>
                                </div>
                                {isChecked && (
                                  <span className="text-[10px] font-black text-emerald-400 shrink-0">
                                    منجز ✅
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
