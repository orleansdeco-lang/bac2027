"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { PlannerEvent, PlannerEventType, PriorityLevel } from "@/lib/planner/types";
import { getStreamSubjects } from "@/lib/planner/planner-service";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { X, Calendar, Clock, BookOpen, AlertCircle, Sparkles, Check } from "lucide-react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<PlannerEvent, "id" | "createdAt" | "updatedAt">) => void;
  initialDateIso?: string;
  streamId?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialDateIso = new Date().toISOString().split("T")[0],
  streamId = "sciences_exp",
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const validStreamId = (streamId === "sciences" ? "sciences_exp" : streamId) as StreamId;
  const streamSubjects = getStreamSubjects(validStreamId);

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<PlannerEventType>("study");
  const [subjectId, setSubjectId] = useState<string>(streamSubjects[0]?.subjectId || "math");
  const [date, setDate] = useState(initialDateIso);
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      userId: "local_user",
      user_id: "local_user",
      title: title.trim(),
      description: description.trim() || undefined,
      notes: description.trim() || undefined,
      type: eventType,
      event_type: eventType,
      streamId: validStreamId,
      stream_id: validStreamId,
      subjectId: subjectId || undefined,
      subject_id: subjectId || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all max-h-[90vh] overflow-y-auto ${
          isGirls
            ? "bg-white border-pink-200 text-[#4A2040]"
            : "bg-[#101C38] border-[#1E3160] text-slate-100"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 transition-all hover:bg-slate-500/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading">
              Ajouter une tâche
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isGirls
                  ? "bg-pink-100 text-pink-700"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              إضافة مهمة جديدة
            </span>
          </div>
          <p
            className={`text-xs mt-1 ${
              isGirls ? "text-pink-600/70" : "text-slate-400"
            }`}
          >
            Planifie tes révisions selon ton rythme et les priorités du BAC
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-90">
              Titre de la tâche / الهدف <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Révision Dérivées & Fiche Mémo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-sm rounded-2xl px-4 py-2.5 border outline-none transition-all ${
                isGirls
                  ? "bg-pink-50/40 border-pink-200 focus:ring-2 focus:ring-pink-300 text-pink-950"
                  : "bg-[#152347] border-[#223668] focus:ring-2 focus:ring-cyan-500 text-slate-100"
              }`}
            />
          </div>

          {/* Type & Matière */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-90">
                Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as PlannerEventType)}
                className={`w-full text-xs rounded-2xl px-3 py-2.5 border outline-none ${
                  isGirls
                    ? "bg-pink-50/40 border-pink-200 text-pink-950"
                    : "bg-[#152347] border-[#223668] text-slate-100"
                }`}
              >
                <option value="study">Session de révision (دراسة)</option>
                <option value="exam_prep">Prépa Sujet BAC (بكالوريا تجريبية)</option>
                <option value="homework">Exercices & Devoirs (تمارين)</option>
                <option value="revision">Fiche de synthèse (تلخيص)</option>
                <option value="personal">Personnel / Pause (شخصي)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-90">
                Matière (الشعبة)
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className={`w-full text-xs rounded-2xl px-3 py-2.5 border outline-none ${
                  isGirls
                    ? "bg-pink-50/40 border-pink-200 text-pink-950"
                    : "bg-[#152347] border-[#223668] text-slate-100"
                }`}
              >
                {streamSubjects.map((sub) => {
                  const meta = ALL_SUBJECTS[sub.subjectId as SubjectId];
                  return (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {meta?.name_fr || sub.subjectId} ({meta?.name_ar || sub.subjectId})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Date, Heure & Durée */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-90">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full text-xs rounded-2xl px-3 py-2 border outline-none ${
                  isGirls
                    ? "bg-pink-50/40 border-pink-200 text-pink-950"
                    : "bg-[#152347] border-[#223668] text-slate-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-90">
                Début
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full text-xs rounded-2xl px-3 py-2 border outline-none ${
                  isGirls
                    ? "bg-pink-50/40 border-pink-200 text-pink-950"
                    : "bg-[#152347] border-[#223668] text-slate-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-90">
                Durée (min)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className={`w-full text-xs rounded-2xl px-3 py-2 border outline-none ${
                  isGirls
                    ? "bg-pink-50/40 border-pink-200 text-pink-950"
                    : "bg-[#152347] border-[#223668] text-slate-100"
                }`}
              >
                <option value={20}>20 min (Quiz)</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1h 00</option>
                <option value={90}>1h 30</option>
                <option value={120}>2h 00</option>
              </select>
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-90">
              Priorité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as PriorityLevel[]).map((p) => {
                const labels: Record<string, { fr: string; ar: string }> = {
                  low: { fr: "Basse", ar: "عادية" },
                  medium: { fr: "Moyenne", ar: "متوسطة" },
                  high: { fr: "Haute 🔥", ar: "مهمة جداً" },
                };
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                      isSelected
                        ? isGirls
                          ? "bg-pink-500 text-white border-pink-600 shadow-sm"
                          : "bg-cyan-500 text-white border-cyan-600 shadow-sm"
                        : isGirls
                        ? "border-pink-200 bg-pink-50/20 text-pink-900 hover:bg-pink-50"
                        : "border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div>{labels[p]?.fr || p}</div>
                    <div className="text-[10px] opacity-75">{labels[p]?.ar || p}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-90">
              Notes & Consignes (Optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Faire les exercices 12 et 14 page 85 + relire le résumé."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full text-xs rounded-2xl p-3 border outline-none transition-all ${
                isGirls
                  ? "bg-pink-50/40 border-pink-200 focus:ring-2 focus:ring-pink-300 text-pink-950"
                  : "bg-[#152347] border-[#223668] focus:ring-2 focus:ring-cyan-500 text-slate-100"
              }`}
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isGirls
                  ? "bg-[#E879A8] text-white hover:bg-[#D46092]"
                  : "bg-[#0EA5E9] text-white hover:bg-cyan-600"
              }`}
            >
              Ajouter au planning
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
