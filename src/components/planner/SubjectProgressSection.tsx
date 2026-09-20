"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme/context";
import { StreamSubjectProgress } from "@/lib/planner/types";
import { BookOpen, ExternalLink, Award, ArrowUpRight } from "lucide-react";

interface SubjectProgressSectionProps {
  progressList: StreamSubjectProgress[];
  className?: string;
}

export const SubjectProgressSection: React.FC<SubjectProgressSectionProps> = ({
  progressList,
  className = "",
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 shadow-clay p-6 ${
        isGirls
          ? "bg-white/95 border-[#F8D7E3] text-[#4A2040]"
          : "bg-[#101C38]/90 border-[#1E3160] text-slate-100"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-heading">
              Progression par matière
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isGirls
                  ? "bg-pink-100 text-pink-700"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              }`}
            >
              التقدم حسب المواد
            </span>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isGirls ? "text-pink-600/70" : "text-slate-400"
            }`}
          >
            Équilibre des révisions selon les coefficients du BAC
          </p>
        </div>

        <Link
          href="/practice"
          className={`text-xs font-semibold flex items-center gap-1 transition-all ${
            isGirls
              ? "text-[#E879A8] hover:text-[#B8487A]"
              : "text-cyan-400 hover:text-cyan-300"
          }`}
        >
          <span>BAC Mastery</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress Bars List */}
      <div className="space-y-4">
        {progressList.map((item) => {
          const hours = ((item.minutesCompleted || 0) / 60).toFixed(1);
          const targetHours = ((item.targetMinutes || 180) / 60).toFixed(0);
          const percent = item.progressPercentage ?? item.progressPercent ?? 0;

          return (
            <div key={item.subjectId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      item.color || (isGirls ? "bg-pink-400" : "bg-cyan-400")
                    }`}
                  />
                  <span className="font-bold">{item.subjectName || item.nameFr || item.subjectId}</span>
                  <span className="opacity-60 text-[11px]">({item.subjectNameAr || item.nameAr || item.subjectId})</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="opacity-80">
                    {hours}h / {targetHours}h
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded ${
                      isGirls
                        ? "bg-pink-100/70 text-pink-800"
                        : "bg-cyan-950/80 text-cyan-300"
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div
                className={`w-full h-2.5 rounded-full overflow-hidden ${
                  isGirls ? "bg-pink-100" : "bg-[#1B294A]"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isGirls
                      ? "bg-gradient-to-r from-pink-400 to-[#E879A8]"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500"
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
