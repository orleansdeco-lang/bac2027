"use client";

import React from "react";
import { useTheme } from "@/lib/theme/context";
import { PlannerEvent } from "@/lib/planner/types";
import { Badge } from "@/components/ui/Badge";
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  MoreVertical,
  RotateCcw,
  Trash2,
  BookOpen,
  ArrowRight,
  Plus
} from "lucide-react";

interface DailyTimelineProps {
  dateIso: string;
  formattedDateFr: string;
  formattedDateAr: string;
  events: PlannerEvent[];
  onToggleComplete: (id: string) => void;
  onStartSession: (event: PlannerEvent) => void;
  onPostpone: (event: PlannerEvent) => void;
  onDelete: (id: string) => void;
  onOpenAddTask: () => void;
  onOpenAiPlanner: () => void;
  className?: string;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  dateIso,
  formattedDateFr,
  formattedDateAr,
  events,
  onToggleComplete,
  onStartSession,
  onPostpone,
  onDelete,
  onOpenAddTask,
  onOpenAiPlanner,
  className = "",
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  // Sort events chronologically by start_time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.start_time || "00:00";
    const timeB = b.start_time || "00:00";
    return timeA.localeCompare(timeB);
  });

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 shadow-clay p-6 ${
        isGirls
          ? "bg-white/95 border-[#F8D7E3] text-[#4A2040]"
          : "bg-[#101C38]/90 border-[#1E3160] text-slate-100"
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading">
              Mon planning
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isGirls
                  ? "bg-pink-100 text-pink-700"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              {formattedDateAr}
            </span>
          </div>
          <p
            className={`text-xs mt-0.5 capitalize ${
              isGirls ? "text-pink-600/80" : "text-slate-400"
            }`}
          >
            {formattedDateFr}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAiPlanner}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isGirls
                ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ خلّي SHATER يعمرلي الخطة</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddTask}
            className={`px-3.5 py-2 rounded-2xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isGirls
                ? "border-pink-300 text-[#B8487A] hover:bg-pink-50"
                : "border-slate-700 text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-3.5 relative">
        {sortedEvents.length === 0 ? (
          <div
            className={`text-center py-12 px-6 rounded-2xl border border-dashed ${
              isGirls
                ? "border-pink-200 bg-pink-50/40 text-pink-800/80"
                : "border-slate-700 bg-slate-800/30 text-slate-400"
            }`}
          >
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold mb-1">
              Aucune tâche programmée pour ce jour
            </h3>
            <p className="text-xs opacity-75 max-w-sm mx-auto mb-4">
              Prends de l'avance sur tes révisions ou laisse l'IA de SHATER te proposer un planning équilibré.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenAddTask}
                className={`text-xs px-4 py-2 rounded-xl font-medium ${
                  isGirls
                    ? "bg-[#E879A8] text-white hover:bg-[#D46092]"
                    : "bg-[#0EA5E9] text-white hover:bg-cyan-600"
                }`}
              >
                + Créer ma première tâche
              </button>
            </div>
          </div>
        ) : (
          sortedEvents.map((evt, idx) => {
            const isCompleted = evt.status === "completed";
            const isInProgress = evt.status === "in_progress";
            const isPostponed = evt.status === "postponed";

            // Status badge UI
            let statusBadge = (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isGirls
                    ? "bg-slate-100 text-slate-600"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                À venir
              </span>
            );

            if (isCompleted) {
              statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Terminé
                </span>
              );
            } else if (isInProgress) {
              statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  En cours
                </span>
              );
            } else if (isPostponed) {
              statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Reporté
                </span>
              );
            }

            return (
              <div
                key={evt.id}
                className={`relative group rounded-2xl border p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? isGirls
                      ? "bg-pink-50/40 border-pink-200/50 opacity-75"
                      : "bg-[#0E172E]/50 border-slate-800/60 opacity-75"
                    : isInProgress
                    ? isGirls
                      ? "bg-white border-[#E879A8] ring-2 ring-pink-300/30 shadow-md"
                      : "bg-[#152347] border-cyan-500 ring-2 ring-cyan-500/20 shadow-md"
                    : isGirls
                    ? "bg-white border-[#F8D7E3] hover:border-pink-300 shadow-sm"
                    : "bg-[#132042] border-[#203362] hover:border-cyan-500/40 shadow-sm"
                }`}
              >
                {/* Left Side: Time & Subject Color Bar */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Time Badge */}
                  <div
                    className={`flex-shrink-0 text-center px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold ${
                      isGirls
                        ? "bg-pink-100/70 text-pink-900 border border-pink-200/60"
                        : "bg-[#1B2B52] text-cyan-300 border border-[#273E73]"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 opacity-60" />
                      <span>{evt.start_time || "Flexible"}</span>
                    </div>
                    {evt.duration_minutes && (
                      <span className="text-[10px] block opacity-70 font-normal">
                        {evt.duration_minutes} min
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs font-bold ${
                          isGirls ? "text-pink-900" : "text-white"
                        } ${isCompleted ? "line-through opacity-70" : ""}`}
                      >
                        {evt.title}
                      </span>
                      {statusBadge}
                      {evt.priority === "high" && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          Priorité haute
                        </span>
                      )}
                    </div>

                    {/* Subtitle / Description / Link */}
                    <div className="flex items-center gap-2 text-xs opacity-75 truncate">
                      {evt.subject_id && (
                        <span
                          className={`font-semibold text-[11px] ${
                            isGirls ? "text-pink-700" : "text-cyan-400"
                          }`}
                        >
                          {evt.subject_id}
                        </span>
                      )}
                      {evt.description && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="truncate">{evt.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {/* Start session or open session timer */}
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => onStartSession(evt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                        isInProgress
                          ? isGirls
                            ? "bg-pink-600 text-white animate-pulse"
                            : "bg-cyan-500 text-white animate-pulse"
                          : isGirls
                          ? "bg-pink-100 text-pink-800 hover:bg-pink-200"
                          : "bg-cyan-950 text-cyan-300 border border-cyan-700 hover:bg-cyan-900"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isInProgress ? "Reprendre" : "Démarrer"}</span>
                    </button>
                  )}

                  {/* Toggle Complete button */}
                  <button
                    type="button"
                    onClick={() => onToggleComplete(evt.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : isGirls
                        ? "border-pink-200 text-slate-500 hover:bg-pink-50 hover:text-pink-700"
                        : "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-cyan-400"
                    }`}
                    title={isCompleted ? "Marquer non terminé" : "Marquer terminé"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  {/* Postpone button */}
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => onPostpone(evt)}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        isGirls
                          ? "border-pink-200 text-slate-500 hover:bg-pink-50 hover:text-amber-600"
                          : "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                      }`}
                      title="Reporter"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onDelete(evt.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
