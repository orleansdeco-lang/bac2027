"use client";

import React from "react";
import { FunnelStageDetail } from "@/lib/operations/conversion-funnel";
import {
  Users,
  Eye,
  UserPlus,
  UserCheck,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Award,
  ArrowDown,
  Info,
} from "lucide-react";

interface Props {
  stages: FunnelStageDetail[];
  loading?: boolean;
}

const STAGE_ICONS: Record<string, any> = {
  visitor: Users,
  engaged_visitor: Eye,
  signup_started: UserPlus,
  registered_student: UserCheck,
  activated_student: CheckCircle2,
  trial_started: Sparkles,
  payment_submitted: CreditCard,
  paid_student: Award,
};

const STAGE_COLORS: Record<string, { badge: string; border: string; text: string; bar: string }> = {
  visitor: {
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    border: "border-blue-800/40",
    text: "text-blue-400",
    bar: "bg-blue-500",
  },
  engaged_visitor: {
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    border: "border-cyan-800/40",
    text: "text-cyan-400",
    bar: "bg-cyan-500",
  },
  signup_started: {
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    border: "border-indigo-800/40",
    text: "text-indigo-400",
    bar: "bg-indigo-500",
  },
  registered_student: {
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    border: "border-purple-800/40",
    text: "text-purple-400",
    bar: "bg-purple-500",
  },
  activated_student: {
    badge: "bg-pink-500/10 text-pink-300 border-pink-500/30",
    border: "border-pink-800/40",
    text: "text-pink-400",
    bar: "bg-pink-500",
  },
  trial_started: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    border: "border-amber-800/40",
    text: "text-amber-400",
    bar: "bg-amber-500",
  },
  payment_submitted: {
    badge: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    border: "border-orange-800/40",
    text: "text-orange-400",
    bar: "bg-orange-500",
  },
  paid_student: {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    border: "border-emerald-800/40",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
};

export function FunnelVisualizer({ stages, loading = false }: Props) {
  if (stages.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-slate-900/60 border border-slate-800">
        لا توجد بيانات مسار تحويل مسجلة في هذا النطاق الزمني
      </div>
    );
  }

  const topCount = stages[0]?.count || 1;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>مخطط مسار التحويل الكامل (8-Stage Conversion Funnel)</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            تتبع خطوة بخطوة للتحول من زائر مجهول إلى طالب مشترك فعلياً
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400">
          مبني 100% على أحداث وسجلات قاعدة البيانات الحقيقية
        </div>
      </div>

      {/* 8 Stages Vertical Funnel */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const Icon = STAGE_ICONS[stage.key] || Users;
          const colors = STAGE_COLORS[stage.key] || STAGE_COLORS.visitor;
          const isFirst = idx === 0;
          const dropoffPct = !isFirst ? Math.max(0, 100 - stage.conversionFromPrev) : 0;
          const relativeWidthPct = Math.max(12, Math.min(100, Math.round((stage.count / Math.max(1, topCount)) * 100)));

          return (
            <div key={stage.key} className="space-y-1.5">
              {/* Stage Card */}
              <div
                className={`p-3.5 rounded-xl bg-slate-950/70 border ${colors.border} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:bg-slate-950`}
              >
                {/* Stage Info */}
                <div className="flex items-start gap-3 min-w-[260px]">
                  <div className={`p-2 rounded-xl border ${colors.badge} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        مرحلة {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white">{stage.label}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-md leading-relaxed">
                      {stage.definition}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Relative Scale */}
                <div className="flex-1 max-w-xs hidden lg:block px-4">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>نسبة من إجمالي الزوار</span>
                    <span className="text-white font-bold">{stage.conversionFromTop}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${relativeWidthPct}%` }}
                      className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>

                {/* Counts & Conversion Metrics */}
                <div className="flex items-center justify-between md:justify-end gap-5 text-right font-mono border-t md:border-t-0 border-slate-900 pt-2 md:pt-0">
                  <div>
                    <div className="text-xs text-slate-400 font-sans">العدد</div>
                    <div className="text-xl font-black text-white">{stage.count}</div>
                  </div>

                  {!isFirst && (
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">من السابقة</div>
                      <div className={`text-sm font-bold ${colors.text}`}>
                        {stage.conversionFromPrev}%
                      </div>
                    </div>
                  )}

                  {!isFirst && (
                    <div className="hidden sm:block">
                      <div className="text-[10px] text-slate-500 font-sans">معدل التسرب</div>
                      <div className="text-xs font-bold text-rose-400">
                        -{dropoffPct.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connecting Arrow between stages */}
              {idx < stages.length - 1 && (
                <div className="flex items-center justify-center py-0.5 text-slate-600">
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
