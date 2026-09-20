"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { CheckCircle2, Circle, Plus, Sparkles, Trash2 } from "lucide-react";

export interface DailyObjective {
  id: string;
  title: string;
  durationMinutes?: number;
  completed: boolean;
  subjectName?: string;
}

interface TodayObjectivesCardProps {
  objectives: DailyObjective[];
  onToggleObjective: (id: string) => void;
  onAddObjective?: (title: string, durationMinutes?: number) => void;
  onDeleteObjective?: (id: string) => void;
  className?: string;
}

export const TodayObjectivesCard: React.FC<TodayObjectivesCardProps> = ({
  objectives,
  onToggleObjective,
  onAddObjective,
  onDeleteObjective,
  className = "",
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("30");

  const total = objectives.length;
  const completedCount = objectives.filter((o) => o.completed).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // SVG Circular progress constants
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddObjective?.(newTitle.trim(), parseInt(newDuration, 10) || 30);
    setNewTitle("");
    setIsAdding(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-clay p-6 ${
        isGirls
          ? "bg-white/95 border-[#F8D7E3] text-[#4A2040]"
          : "bg-[#101C38]/90 border-[#1E3160] text-slate-100"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-heading">Objectifs du jour</h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isGirls
                  ? "bg-pink-100 text-pink-700"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              أهداف اليوم
            </span>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isGirls ? "text-pink-600/70" : "text-slate-400"
            }`}
          >
            {completedCount} sur {total} accomplis
          </p>
        </div>

        {/* Circular Progress Indicator */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className={isGirls ? "text-pink-100" : "text-[#1C2C54]"}
            />
            {/* Progress fill */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-500 ${
                isGirls ? "text-[#E879A8]" : "text-[#0EA5E9]"
              }`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-sm font-black leading-none ${
                isGirls ? "text-[#9D386B]" : "text-cyan-300"
              }`}
            >
              {percentage}%
            </span>
            <span className="text-[10px] opacity-70 font-mono mt-0.5">
              {completedCount}/{total}
            </span>
          </div>
        </div>
      </div>

      {/* Objectives Checklist */}
      <div className="space-y-2.5">
        {objectives.length === 0 ? (
          <div
            className={`text-center py-6 px-4 rounded-2xl border border-dashed ${
              isGirls
                ? "border-pink-200 bg-pink-50/50 text-pink-700/70"
                : "border-slate-700 bg-slate-800/30 text-slate-400"
            }`}
          >
            <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Pas d'objectifs ajoutés pour aujourd'hui.</p>
          </div>
        ) : (
          objectives.map((obj) => (
            <div
              key={obj.id}
              className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                obj.completed
                  ? isGirls
                    ? "bg-pink-50/70 border-pink-200/60 opacity-80"
                    : "bg-slate-800/40 border-slate-700/40 opacity-70"
                  : isGirls
                  ? "bg-white border-[#F9E2EC] hover:border-pink-300 shadow-sm"
                  : "bg-[#152347] border-[#22376A] hover:border-cyan-500/40 shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleObjective(obj.id)}
                className="flex items-center gap-3 text-left flex-1 min-w-0"
              >
                {obj.completed ? (
                  <CheckCircle2
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                      isGirls ? "text-[#E879A8]" : "text-[#0EA5E9]"
                    }`}
                  />
                ) : (
                  <Circle
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isGirls
                        ? "text-pink-300 hover:text-[#E879A8]"
                        : "text-slate-500 hover:text-cyan-400"
                    }`}
                  />
                )}
                <div className="truncate flex-1">
                  <span
                    className={`text-sm block truncate transition-all ${
                      obj.completed
                        ? "line-through opacity-70"
                        : "font-medium"
                    }`}
                  >
                    {obj.title}
                  </span>
                  {obj.subjectName && (
                    <span
                      className={`text-[10px] inline-block mt-0.5 px-2 py-0.2 rounded-full ${
                        isGirls
                          ? "bg-pink-100/80 text-pink-700"
                          : "bg-cyan-950/80 text-cyan-300 border border-cyan-800/40"
                      }`}
                    >
                      {obj.subjectName}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-2">
                {obj.durationMinutes && (
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-lg ${
                      isGirls
                        ? "bg-pink-100/60 text-pink-800"
                        : "bg-[#1E305C] text-slate-300"
                    }`}
                  >
                    {obj.durationMinutes}m
                  </span>
                )}
                {onDeleteObjective && (
                  <button
                    type="button"
                    onClick={() => onDeleteObjective(obj.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Section */}
      <div className="mt-4 pt-3 border-t border-dashed border-theme">
        {isAdding ? (
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              autoFocus
              placeholder="Ex: Réviser 2 exercices de physique..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`w-full text-xs rounded-xl px-3 py-2 border outline-none transition-all ${
                isGirls
                  ? "bg-white border-pink-300 focus:ring-2 focus:ring-pink-300 text-[#4A2040]"
                  : "bg-[#152347] border-slate-600 focus:ring-2 focus:ring-cyan-500 text-slate-100"
              }`}
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="opacity-70 text-[11px]">Durée (min):</span>
                <input
                  type="number"
                  min="5"
                  max="180"
                  step="5"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className={`w-16 text-center text-xs rounded-lg px-1.5 py-1 border outline-none ${
                    isGirls
                      ? "bg-white border-pink-300 text-pink-900"
                      : "bg-[#152347] border-slate-600 text-slate-200"
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs px-2.5 py-1 rounded-lg opacity-70 hover:opacity-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all shadow-sm ${
                    isGirls
                      ? "bg-[#E879A8] text-white hover:bg-[#D46092] disabled:opacity-50"
                      : "bg-[#0EA5E9] text-white hover:bg-cyan-600 disabled:opacity-50"
                  }`}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className={`w-full py-2 px-3 rounded-2xl border border-dashed text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              isGirls
                ? "border-pink-300 text-[#B8487A] hover:bg-pink-50"
                : "border-slate-700 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un objectif</span>
          </button>
        )}
      </div>
    </div>
  );
};
