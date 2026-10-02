"use client";

import React from "react";
import { FunnelStage } from "@/lib/operations/students-analytics";
import { ArrowLeft, CheckCircle2, Zap, Award, Sparkles, UserCheck } from "lucide-react";

interface Props {
  funnel: FunnelStage[];
  loading?: boolean;
}

const STAGE_CONFIG: Record<
  string,
  {
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeColor: string;
    description: string;
  }
> = {
  registered: {
    icon: UserCheck,
    color: "text-blue-400",
    bgColor: "bg-blue-950/20",
    borderColor: "border-blue-800/40",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    description: "إجمالي الحسابات المنشأة في المنصة",
  },
  activated: {
    icon: CheckCircle2,
    color: "text-cyan-400",
    bgColor: "bg-cyan-950/20",
    borderColor: "border-cyan-800/40",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    description: "أكملوا تحديد الشعبة والملف الأكاديمي",
  },
  active: {
    icon: Zap,
    color: "text-amber-400",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-800/40",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    description: "تفاعلوا تعليمياً في الفترة المحددة",
  },
  trial: {
    icon: Sparkles,
    color: "text-purple-400",
    bgColor: "bg-purple-950/20",
    borderColor: "border-purple-800/40",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    description: "استفادوا من فترة التجربة الحرة",
  },
  paid: {
    icon: Award,
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/20",
    borderColor: "border-emerald-800/40",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    description: "حسابات باقات مدفوعة ومؤكدة",
  },
};

export function StudentFunnelBreakdown({ funnel, loading = false }: Props) {
  // Only display stages that have valid non-negative counts and are defined
  const validStages = funnel.filter((stage) => typeof stage.count === "number" && stage.count >= 0);

  if (validStages.length === 0) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>مسار التحويل والارتقاء الأكاديمي</span>
            <span className="text-[11px] font-mono font-normal text-slate-400">
              (Student Lifecycle & Conversion Funnel)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تتبع مسار التلميذ من التسجيل، إلى التفعيل، ثم التفاعل الفعلي والتحول للاشتراك
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400">
          مبني 100% على بيانات قاعدة البيانات الحقيقية
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {validStages.map((stage, idx) => {
          const config = STAGE_CONFIG[stage.stage] || {
            icon: CheckCircle2,
            color: "text-slate-300",
            bgColor: "bg-slate-900",
            borderColor: "border-slate-800",
            badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
            description: "",
          };
          const Icon = config.icon;
          const isFirst = idx === 0;

          return (
            <div
              key={stage.stage}
              className={`relative p-4 rounded-xl border ${config.bgColor} ${config.borderColor} flex flex-col justify-between space-y-3 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${config.badgeColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    المرحلة {idx + 1}
                  </span>
                </div>

                {!isFirst && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/70 text-slate-300 border border-slate-800">
                    {stage.conversionFromPrev}% من السابقة
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-white mb-0.5">{stage.label}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{config.description}</div>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/60">
                <div className="text-xl font-extrabold text-white font-mono">{stage.count}</div>
                {!isFirst && (
                  <div className="text-[10px] font-mono text-cyan-400">
                    {stage.conversionFromFirst}% الإجمالي
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
