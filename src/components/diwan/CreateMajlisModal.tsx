"use client";

import React, { useState } from "react";
import { X, Users, BookOpen, Sparkles, Plus, Target, Check } from "lucide-react";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { StreamId } from "@/types/education";

interface CreateMajlisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStream?: StreamId;
  onCreate?: (tableData: {
    title: string;
    subjectId: string;
    lesson: string;
    capacity: number;
    stream: StreamId;
  }) => void;
}

export function CreateMajlisModal({
  isOpen,
  onClose,
  userStream = "sciences_exp",
  onCreate,
}: CreateMajlisModalProps) {
  const [title, setTitle] = useState("مراجعة وحل تمارين المتتاليات");
  const [subjectId, setSubjectId] = useState("math");
  const [lesson, setLesson] = useState("المتتاليات الحسابية والهندسية");
  const [capacity, setCapacity] = useState(6);
  const [stream, setStream] = useState<StreamId>(userStream);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreate) {
      onCreate({
        title,
        subjectId,
        lesson,
        capacity,
        stream,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0B1222] border border-white/10 shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">إنشاء مجلس علم جديد</h3>
              <p className="text-xs text-slate-400">افتح طاولة مذاكرة تفاعلية لزملائك</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              عنوان المجلس
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: حل مسائل الدارة RC وتطبيقاتها"
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">المادة</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#101B33] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="math">الرياضيات</option>
                <option value="physics">العلوم الفيزيائية</option>
                <option value="sciences">العلوم الطبيعية</option>
                <option value="arabic">اللغة العربية</option>
                <option value="philosophy">الفلسفة</option>
                <option value="history_geo">التاريخ والجغرافيا</option>
                <option value="french">اللغة الفرنسية</option>
                <option value="english">اللغة الإنجليزية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الشعبة</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value as StreamId)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#101B33] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {Object.entries(ALGERIAN_BAC_STREAMS).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              موضوع الدرس / محور المناقشة
            </label>
            <input
              type="text"
              required
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="مثال: المتتاليات الحسابية والهندسية، مواضيع البكالوريا"
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              عدد المقاعد على الطاولة
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 6, 8].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(cap)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    capacity === cap
                      ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                      : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]"
                  }`}
                >
                  {cap} مقاعد
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              فتح المجلس الآن
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
