"use client";

import React, { useState } from "react";
import { PlannerEvent, PlannerEventType, PriorityLevel } from "@/lib/planner/types";
import { X, Plus, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import { getStreamSubjects, ALL_SUBJECTS } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (event: Omit<PlannerEvent, "id" | "created_at" | "updated_at">) => void;
  initialDateIso?: string;
  streamId?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialDateIso,
  streamId = "sciences_exp",
}) => {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<PlannerEventType>("study");
  const [subjectId, setSubjectId] = useState<string>("math");
  const [date, setDate] = useState(
    initialDateIso || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const safeStreamId = (streamId === "sciences" ? "sciences_exp" : streamId) as StreamId;
  const streamSubjects = getStreamSubjects(safeStreamId) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      user_id: "local_user",
      userId: "local_user",
      title: title.trim(),
      description: description.trim() || undefined,
      type: eventType,
      event_type: eventType,
      subjectId,
      subject_id: subjectId,
      date,
      startTime: startTime || undefined,
      start_time: startTime || undefined,
      durationMinutes,
      duration_minutes: durationMinutes,
      priority,
      status: "TODO",
      source: "MANUAL",
      isAiGenerated: false,
      is_ai_generated: false,
    });

    // Reset form
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-start">
      <div className="w-full max-w-lg rounded-3xl border border-theme bg-card text-theme-text shadow-clay p-6 sm:p-7 relative transition-all max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-theme-muted hover:text-theme-text hover:bg-surface transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-theme-text font-sans">
              إضافة مهمة جديدة
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              مخطط شاطر
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-1 font-medium">
            برمج جلسة مراجعة أو حل تمارين وفق جدولك الخاص
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-1.5">
              عنوان المهمة / الهدف <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: حل مسألة شاملة في الدوال الأسية"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)] font-medium"
            />
          </div>

          {/* Type & Matière */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-theme-text mb-1.5">
                نوع النشاط
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as PlannerEventType)}
                className="w-full text-xs font-medium rounded-xl px-3 py-2.5 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="study">جلسة مراجعة (دراسة)</option>
                <option value="exam_prep">حل موضوع بكالوريا (تدريب)</option>
                <option value="homework">تمارين وفروض (تطبيق)</option>
                <option value="revision">ملخص وخرائط ذهنية (تثبيت)</option>
                <option value="personal">نشاط شخصي / راحة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-text mb-1.5">
                المادة
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full text-xs font-medium rounded-xl px-3 py-2.5 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
              >
                {streamSubjects.map((sub) => {
                  const meta = ALL_SUBJECTS[sub.subjectId as SubjectId];
                  return (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {meta?.name_ar || sub.subjectId} ({meta?.name_fr || sub.subjectId})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Date, Heure & Durée */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-theme-text mb-1.5">
                التاريخ
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium rounded-xl px-2.5 py-2 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-text mb-1.5">
                الوقت
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-medium rounded-xl px-2.5 py-2 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-text mb-1.5">
                المدة
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full text-xs font-medium rounded-xl px-2.5 py-2 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value={20}>20 دقيقة</option>
                <option value={30}>30 دقيقة</option>
                <option value={45}>45 دقيقة</option>
                <option value={60}>ساعة كاملة</option>
                <option value={90}>ساعة ونصف</option>
                <option value={120}>ساعتان</option>
              </select>
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-1.5">
              الأولوية
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as PriorityLevel[]).map((p) => {
                const labels: Record<string, string> = {
                  low: "عادية",
                  medium: "متوسطة",
                  high: "مهمة جداً 🔥",
                };
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs"
                        : "bg-surface border-theme text-theme-secondary hover:text-theme-text"
                    }`}
                  >
                    {labels[p] || p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-theme-text mb-1.5">
              ملاحظات وتفاصيل (اختياري)
            </label>
            <textarea
              rows={2}
              placeholder="مثال: مراجعة حل التمرين من الصفحة 40 وتدوين القوانين في الكراس..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium rounded-xl p-3 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-text cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-all shadow-xs cursor-pointer"
            >
              إضافة إلى الجدول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
