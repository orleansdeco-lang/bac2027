"use client";

import React, { useState } from "react";
import { X, Sparkles, Users, BookOpen, Target, Brain, Zap } from "lucide-react";
import { StreamId, SubjectId } from "@/types/education";
import { MajlisActivityMode } from "@/types/campus";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStream: StreamId;
  onCreate: (params: {
    title: string;
    stream: StreamId;
    subjectId: SubjectId;
    lesson: string;
    mode: MajlisActivityMode;
    capacity: number;
  }) => void;
}

const STREAM_OPTIONS = [
  { id: "sciences_exp", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "gestion_eco", label: "تسيير واقتصاد" },
  { id: "langues_etrangeres", label: "لغات أجنبية" },
];

const SUBJECT_OPTIONS: Record<string, { id: SubjectId; label: string }[]> = {
  sciences_exp: [
    { id: "natural_sciences", label: "علوم الطبيعة والحياة" },
    { id: "physics", label: "العلوم الفيزيائية" },
    { id: "math", label: "الرياضيات" },
    { id: "philosophy", label: "الفلسفة" },
    { id: "islamic_studies", label: "العلوم الإسلامية" },
    { id: "history_geography", label: "التاريخ والجغرافيا" },
  ],
  math: [
    { id: "math", label: "الرياضيات" },
    { id: "physics", label: "العلوم الفيزيائية" },
    { id: "philosophy", label: "الفلسفة" },
    { id: "islamic_studies", label: "العلوم الإسلامية" },
    { id: "history_geography", label: "التاريخ والجغرافيا" },
  ],
  technique_math: [
    { id: "electrical_eng", label: "التكنولوجيا (هندسة ميكانيكية/كهربائية/طرائق/مدنية)" },
    { id: "physics", label: "العلوم الفيزيائية" },
    { id: "math", label: "الرياضيات" },
    { id: "philosophy", label: "الفلسفة" },
    { id: "islamic_studies", label: "العلوم الإسلامية" },
  ],
  lettres_philo: [
    { id: "philosophy", label: "الفلسفة" },
    { id: "arabic", label: "اللغة العربية وآدابها" },
    { id: "history_geography", label: "التاريخ والجغرافيا" },
    { id: "islamic_studies", label: "العلوم الإسلامية" },
  ],
  gestion_eco: [
    { id: "accounting_finance", label: "التسيير المحاسبي والمالي" },
    { id: "economics_management", label: "الاقتصاد والمناجمنت" },
    { id: "law", label: "القانون" },
    { id: "math", label: "الرياضيات" },
    { id: "history_geography", label: "التاريخ والجغرافيا" },
  ],
  langues_etrangeres: [
    { id: "french", label: "اللغة الفرنسية" },
    { id: "english", label: "اللغة الإنجليزية" },
    { id: "arabic", label: "اللغة العربية وآدابها" },
    { id: "philosophy", label: "الفلسفة" },
    { id: "history_geography", label: "التاريخ والجغرافيا" },
  ],
};

const MODES: { id: MajlisActivityMode; title: string; desc: string; icon: any; color: string }[] = [
  {
    id: "PAPER_PRACTICE",
    title: "التمارين الكتابية ✍️",
    desc: "حل تمرين على الكراس في وقت محدد ثم فتح سلم التنقيط الوزاري والتقييم الذاتي",
    icon: Target,
    color: "border-blue-500/40 hover:bg-blue-500/5 text-blue-500",
  },
  {
    id: "DIGITAL_QUIZ",
    title: "التحديات والألعاب التعليمية ⚡",
    desc: "أسئلة سريعة متزامنة مع ترتيب المتصدرين وتسجيل الأخطاء في معمل الأخطاء",
    icon: Zap,
    color: "border-purple-500/40 hover:bg-purple-500/5 text-purple-500",
  },
  {
    id: "GROUP_MEMORIZATION",
    title: "جلسة الحفظ الموحد 🧠",
    desc: "فترة تركيز لحفظ تواريخ، شخصيات، أو مصطلحات تليها جولة استرجاع نشط وتسميع",
    icon: Brain,
    color: "border-emerald-500/40 hover:bg-emerald-500/5 text-emerald-500",
  },
];

export function CreateTableModal({
  isOpen,
  onClose,
  userStream,
  onCreate,
}: CreateTableModalProps) {
  const [title, setTitle] = useState("");
  const [stream, setStream] = useState<StreamId>(userStream || "sciences_exp");
  const [subjectId, setSubjectId] = useState<SubjectId>("physics");
  const [lesson, setLesson] = useState("");
  const [capacity, setCapacity] = useState<number>(6);
  const [mode, setMode] = useState<MajlisActivityMode>("PAPER_PRACTICE");

  if (!isOpen) return null;

  const currentSubjects = SUBJECT_OPTIONS[stream] || SUBJECT_OPTIONS["sciences_exp"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !lesson.trim()) return;

    onCreate({
      title: title.trim(),
      stream,
      subjectId,
      lesson: lesson.trim(),
      mode,
      capacity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-lg bg-surface border border-theme rounded-3xl shadow-2xl overflow-hidden p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-theme-text font-sans">
                إنشاء طاولة مجلس علم جديدة 🏛️
              </h2>
              <p className="text-xs text-theme-muted">
                افتح حلقة مذاكرة متزامنة ودع زملاءك يشاركونك الحل
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-text hover:bg-surface-elevated transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-1">
              عنوان الطاولة / التحدي:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تحدي تمرين الدارة RC من بكالوريا 2022"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-soft border border-theme text-xs sm:text-sm text-theme-text focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Stream & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-theme-secondary mb-1">
                الشعبة المستهدفة:
              </label>
              <select
                value={stream}
                onChange={(e) => {
                  const s = e.target.value as StreamId;
                  setStream(s);
                  const subjs = SUBJECT_OPTIONS[s] || [];
                  if (subjs.length > 0) setSubjectId(subjs[0].id);
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text font-bold focus:outline-none focus:border-purple-500"
              >
                {STREAM_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-secondary mb-1">
                المادة:
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text font-bold focus:outline-none focus:border-purple-500"
              >
                {currentSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lesson */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-1">
              اسم الدرس / الوحدة:
            </label>
            <input
              type="text"
              required
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="مثال: ثنائي القطب RC أو المتتاليات العددية"
              className="w-full px-3.5 py-2 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Seat Capacity (2 to 8) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-theme-secondary mb-1.5">
              <span>سعة المقاعد الدائرية:</span>
              <span className="font-mono text-purple-500">{capacity} مقاعد</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {[2, 3, 4, 5, 6, 7, 8].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(cap)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    capacity === cap
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25"
                      : "bg-surface-soft border-theme text-theme-muted hover:text-theme-text"
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-1.5">
              نمط النشاط المشترك:
            </label>
            <div className="space-y-2">
              {MODES.map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? `${m.color} bg-surface-elevated shadow-md`
                        : "border-theme bg-surface-soft/40 hover:bg-surface-soft opacity-70"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-surface border border-theme shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-theme-text">{m.title}</h4>
                      <p className="text-[11px] text-theme-muted mt-0.5 leading-snug">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-theme">
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              إلغاء
            </Button>
            <Button variant="primary" size="md" type="submit" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span>إنشاء وبدء المجلس الآن</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
