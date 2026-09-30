"use client";

import React, { useState } from "react";
import { X, Sparkles, Plus, Users, Clock, Target, BookOpen } from "lucide-react";
import { StreamId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStream: StreamId;
  initialSubject?: string;
  onTableCreated: (table: {
    title: string;
    subject: string;
    topic: string;
    stream: StreamId;
    capacity: number;
    durationMinutes: number;
  }) => void;
}

export function CreateTableModal({
  isOpen,
  onClose,
  userStream,
  initialSubject = "math",
  onTableCreated,
}: CreateTableModalProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subjectOptions: { id: string; label: string; icon: string; defaultTopic: string }[] = [
    { id: "math", label: "الرياضيات", icon: "📐", defaultTopic: "المتتاليات وحساب النهايات" },
    { id: "physics", label: "الفيزياء", icon: "⚡", defaultTopic: "الدارة RC والميكانيك" },
    { id: "sciences", label: "العلوم الطبيعية", icon: "🧬", defaultTopic: "تركيب البروتين والإنزيمات" },
    { id: "philosophy", label: "الفلسفة", icon: "🏛️", defaultTopic: "المشكلة والإشكالية" },
    { id: "history_geo", label: "التاريخ والجغرافيا", icon: "🌍", defaultTopic: "الثورة التحريرية والحرب الباردة" },
    { id: "arabic", label: "اللغة العربية", icon: "📖", defaultTopic: "شعر المنفى والظاهرة القمرية" },
    { id: "islamic", label: "العلوم الإسلامية", icon: "🕌", defaultTopic: "مقاصد الشريعة والعقيدة" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopic = topic.trim() || subjectOptions.find((s) => s.id === subject)?.defaultTopic || "مراجعة شاملة";
    const subjObj = subjectOptions.find((s) => s.id === subject);
    const title = `طاولة ${subjObj?.label || "المراجعة"}: ${finalTopic}`;

    setIsSubmitting(true);
    onTableCreated({
      title,
      subject,
      topic: finalTopic,
      stream: userStream,
      capacity,
      durationMinutes,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B1222] shadow-2xl overflow-hidden flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-950/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">افتح طاولة مراجعة جديدة 🏛️</h3>
              <p className="text-[11px] text-slate-300">ادرس وراجع مع زملائك في شعبة {ALGERIAN_BAC_STREAMS[userStream]?.name_ar || userStream}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* 1. Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">المادة الدراسية:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {subjectOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSubject(opt.id);
                    if (!topic) setTopic(opt.defaultTopic);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    subject === opt.id
                      ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/25"
                      : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-300"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">الموضوع أو الدرس للمراجعة:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: المتتاليات العددية، الدارة RC، الاستنساخ..."
              className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/80 transition-all"
            />
          </div>

          {/* 3. Seats & Duration Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Seats */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>عدد المقاعد:</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[2, 4, 6, 8].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCapacity(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      capacity === s
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-white/[0.03] text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>مدة الجلسة:</span>
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full py-2 px-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value={25}>25 دقيقة (بومودورو)</option>
                <option value={45}>45 دقيقة (قياسي)</option>
                <option value={60}>60 دقيقة (ساعة كاملة)</option>
                <option value={90}>90 دقيقة (محاكاة)</option>
              </select>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              افتح الطاولة الآن 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
