"use client";

import React, { useState } from "react";
import { X, Users, BookOpen, Sparkles, Plus, Target, Check, Zap, Brain, FileText, Loader2 } from "lucide-react";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { StreamId } from "@/types/education";
import { MajlisService, MajlisStudyMode, MajlisRoom } from "@/lib/campus/majlis-service";
import { useAuth } from "@/lib/auth/context";

interface CreateMajlisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStream?: StreamId;
  onRoomCreated?: (room: MajlisRoom) => void;
}

export function CreateMajlisModal({
  isOpen,
  onClose,
  userStream = "sciences_exp",
  onRoomCreated,
}: CreateMajlisModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("حل تمرين المتتاليات — بكالوريا تجريبية");
  const [subjectId, setSubjectId] = useState("math");
  const [lesson, setLesson] = useState("المتتاليات الحسابية والهندسية");
  const [mode, setMode] = useState<MajlisStudyMode>("PAPER_PRACTICE");
  const [capacity, setCapacity] = useState(6);
  const [stream, setStream] = useState<StreamId>(userStream);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !lesson.trim()) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const room = await MajlisService.createRoom({
        title: title.trim(),
        stream,
        subject: subjectId,
        lesson: lesson.trim(),
        mode,
        capacity,
        hostUserId: user?.id,
        hostName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "طالب شاطر",
        hostAvatar: user?.user_metadata?.avatar_url || "/illustrations/characters/ali.jpg",
      });

      if (onRoomCreated) {
        onRoomCreated(room);
      }
      onClose();
    } catch (err: any) {
      console.error("[CreateMajlisModal] Error creating room:", err);
      setErrorMsg("حدث خطأ أثناء إنشاء المجلس. يرجى المحاولة ثانية.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const studyModes: {
    id: MajlisStudyMode;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      id: "PAPER_PRACTICE",
      title: "حل تمرين على الكراس + سلم التنقيط",
      description: "موضوع وزاري، عداد زمني مشترك، تصحيح ذاتي وتسجيل الأخطاء مباشرة",
      icon: FileText,
      color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    },
    {
      id: "SPEED_BATTLE",
      title: "تحدي سرعة البديهة والتواريخ والشخصيات",
      description: "أسئلة سريعة (15 ثانية لكل سؤال) وترتيب فوري للطلاب المتنافسين",
      icon: Zap,
      color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
    },
    {
      id: "GROUP_MEMORIZATION",
      title: "حلقة الحفظ والتثبيت بالاسترجاع",
      description: "قراءة مركزة لبطاقات الحفظ ثم حجب الكلمات المفتاحية واختبار الذاكرة",
      icon: Brain,
      color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
    },
    {
      id: "FULL_EXAM",
      title: "حل موضوع بكالوريا كامل",
      description: "محاكاة الامتحان الرسمي بدوام كامل (ساعتان فأكثر) وتقسيم المهام",
      icon: Target,
      color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0B1222] border border-white/10 shadow-2xl p-5 sm:p-7 animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">إنشاء مجلس علم جديد</h3>
              <p className="text-xs text-slate-400">افتح طاولة مذاكرة جماعية تفاعلية متزامنة لزملائك</p>
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

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Table Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              عنوان المجلس <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: حل مسائل الدارة RC وتطبيقاتها"
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Stream & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الشعبة المقررة <span className="text-rose-400">*</span>
              </label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value as StreamId)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#101B33] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {Object.entries(ALGERIAN_BAC_STREAMS).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المادة <span className="text-rose-400">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#101B33] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="math">الرياضيات</option>
                <option value="physics">العلوم الفيزيائية</option>
                <option value="sciences">العلوم الطبيعية والحياة</option>
                <option value="arabic">اللغة العربية وآدابها</option>
                <option value="philosophy">الفلسفة</option>
                <option value="history_geo">التاريخ والجغرافيا</option>
                <option value="islamic">العلوم الإسلامية</option>
                <option value="french">اللغة الفرنسية</option>
                <option value="english">اللغة الإنجليزية</option>
              </select>
            </div>
          </div>

          {/* Lesson / Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              موضوع الدرس والمحور <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="مثال: المتتاليات الحسابية والهندسية، شحن وتفريغ مكثفة"
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Study Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              نمط الدراسة الجماعي <span className="text-amber-400">(اختر النمط المناسب)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {studyModes.map((item) => {
                const isSelected = mode === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`p-3 rounded-2xl text-right transition-all border cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-white/[0.09] border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-white">{item.title}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              عدد المقاعد على الطاولة (السعة)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 8].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(cap)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                    capacity === cap
                      ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                      : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>{cap} مقاعد</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري فتح المجلس...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>فتح المجلس والبدء فوراً</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
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
