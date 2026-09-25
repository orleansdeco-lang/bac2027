"use client";

import React, { useState } from "react";
import { useFocus } from "@/context/FocusContext";
import { FocusTimerMode } from "@/types/focus";
import { getSubjectMeta } from "@/lib/focus/focus-engine";
import {
  X,
  Play,
  Clock,
  Sparkles,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";

interface QuickStartFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultTaskTitle?: string;
  eventId?: string;
}

const POPULAR_SUBJECTS = [
  { id: "math", label: "الرياضيات", hex: "#2563EB" },
  { id: "natural_sciences", label: "علوم الطبيعة والحياة", hex: "#059669" },
  { id: "physics", label: "العلوم الفيزيائية", hex: "#D97706" },
  { id: "philosophy", label: "الفلسفة", hex: "#7C3AED" },
  { id: "arabic", label: "اللغة العربية", hex: "#0891B2" },
  { id: "history_geography", label: "التاريخ والجغرافيا", hex: "#DC2626" },
  { id: "islamic_studies", label: "العلوم الإسلامية", hex: "#0D9488" },
  { id: "french", label: "اللغة الفرنسية", hex: "#4F46E5" },
  { id: "english", label: "اللغة الإنجليزية", hex: "#DB2777" },
  { id: "accounting_finance", label: "المحاسبة والمالية", hex: "#65A30D" },
  { id: "economics_management", label: "الاقتصاد والمناجمنت", hex: "#0D9488" },
  { id: "law", label: "القانون", hex: "#475569" },
];

const TIMER_PRESETS: { mode: FocusTimerMode; minutes: number; label: string; desc: string }[] = [
  { mode: "25m", minutes: 25, label: "25 دقيقة", desc: "بومودورو قياسي" },
  { mode: "50m", minutes: 50, label: "50 دقيقة", desc: "جلسة تركيز معمقة" },
  { mode: "90m", minutes: 90, label: "90 دقيقة", desc: "محاكاة امتحان" },
  { mode: "stopwatch", minutes: 0, label: "عداد مفتوح", desc: "بدون توقف مسبق" },
];

export function QuickStartFocusModal({
  isOpen,
  onClose,
  defaultSubjectId = "math",
  defaultTaskTitle = "",
  eventId,
}: QuickStartFocusModalProps) {
  const { startSession, openFocusMode } = useFocus();

  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubjectId);
  const [selectedMode, setSelectedMode] = useState<FocusTimerMode>("25m");
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [taskTitle, setTaskTitle] = useState<string>(defaultTaskTitle);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStart = () => {
    let targetMins = 0;
    if (selectedMode === "25m") targetMins = 25;
    else if (selectedMode === "50m") targetMins = 50;
    else if (selectedMode === "90m") targetMins = 90;
    else if (selectedMode === "custom") targetMins = customMinutes;

    const res = startSession({
      mode: isCustomMode ? "custom" : selectedMode,
      targetDurationMinutes: isCustomMode ? customMinutes : targetMins,
      subjectId: selectedSubject,
      taskTitle: taskTitle.trim() || undefined,
      eventId: eventId,
    });

    if (res.success || res.message) {
      openFocusMode();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-focus-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl p-5 sm:p-6 overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 id="quick-focus-title" className="text-base font-bold text-white">
                بدء جلسة تركيز
              </h2>
              <p className="text-[11px] text-zinc-400">
                حدد المادة والمدة لدخول وضع المذاكرة الصامت
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Subject Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            المادة الدراسية:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {POPULAR_SUBJECTS.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-right cursor-pointer border ${
                    isSelected
                      ? "bg-zinc-800 text-white border-emerald-500 shadow-sm"
                      : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: sub.hex }}
                  />
                  <span className="truncate">{sub.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Duration Preset Selector */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300">
              مدة الجلسة:
            </label>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
            >
              {isCustomMode ? "الخيارات الجاهزة" : "تحديد مدة مخصصة"}
            </button>
          </div>

          {isCustomMode ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 25))}
                className="w-20 px-2 py-1 rounded-lg font-mono font-bold bg-zinc-800 text-white text-center border border-zinc-700 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-zinc-300">دقيقة تركيز</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {TIMER_PRESETS.map((p) => {
                const isSelected = selectedMode === p.mode && !isCustomMode;
                return (
                  <button
                    key={p.mode}
                    type="button"
                    onClick={() => {
                      setSelectedMode(p.mode);
                      setIsCustomMode(false);
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-0.5 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/30"
                        : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-black font-mono">{p.label}</span>
                    <span className="text-[10px] text-zinc-500">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Task / Focus Target Title (Optional) */}
        <div className="mb-5">
          <label
            htmlFor="focus-task-title"
            className="block text-xs font-semibold text-zinc-300 mb-1"
          >
            هدف الجلسة أو المهمة: <span className="text-[10px] text-zinc-500 font-normal">(اختياري)</span>
          </label>
          <div className="relative">
            <BookOpen className="w-3.5 h-3.5 text-zinc-500 absolute top-3 right-3 pointer-events-none" />
            <input
              id="focus-task-title"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="مثلاً: حل 3 تمارين متتاليات من بكالوريا 2022"
              className="w-full text-xs bg-zinc-900/80 border border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* 4. Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-2 cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>بدء جلسة التركيز</span>
          </button>
        </div>
      </div>
    </div>
  );
}
