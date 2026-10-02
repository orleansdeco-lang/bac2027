"use client";

import React from "react";
import { AttributionIntegrityWarning } from "@/lib/operations/conversion-funnel";
import { ShieldCheck, AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

interface Props {
  integrity: AttributionIntegrityWarning;
}

export function AttributionQualityBanner({ integrity }: Props) {
  const isReal = integrity.status === "REAL";
  const isPartial = integrity.status === "PARTIAL";
  const isUnavailable = integrity.status === "UNAVAILABLE";

  const statusConfig = {
    REAL: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      border: "border-emerald-500/30",
      bg: "bg-emerald-950/20",
      icon: ShieldCheck,
      title: "إسناد مكتمل وموثق (Attribution Integrity: REAL)",
    },
    PARTIAL: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      border: "border-amber-500/30",
      bg: "bg-amber-950/20",
      icon: AlertTriangle,
      title: "إسناد جزئي (Attribution Integrity: PARTIAL)",
    },
    UNAVAILABLE: {
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      border: "border-rose-500/30",
      bg: "bg-rose-950/20",
      icon: ShieldAlert,
      title: "بيانات الإسناد غير متوفرة (Attribution Integrity: UNAVAILABLE)",
    },
  }[integrity.status] || {
    badge: "bg-slate-800 text-slate-300 border-slate-700",
    border: "border-slate-800",
    bg: "bg-slate-900",
    icon: Info,
    title: "حالة الإسناد",
  };

  const Icon = statusConfig.icon;

  return (
    <div className={`p-4 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} space-y-2`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{statusConfig.title}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
                {integrity.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {integrity.warningMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-slate-400 text-[10px] block">مسجلون بهوية مؤكدة</span>
            <span className="text-emerald-400 font-bold">{integrity.attributedRegistrations}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">غير مسندين / مجهول</span>
            <span className="text-amber-400 font-bold">{integrity.unattributedRegistrations}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">نسبة النقص</span>
            <span className="text-slate-200 font-bold">{integrity.unattributedPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center gap-1.5">
        <Info className="w-3 h-3 text-cyan-400 shrink-0" />
        <span>
          مبدأ الشفافية الصارم: لا نقوم بتخمين أي بيانات مفقودة، ولا يتم احتساب مؤشرات وهمية مثل CAC أو ROAS لعدم توفر أرقام الإنفاق الإعلاني الفعلي في قاعدة البيانات.
        </span>
      </div>
    </div>
  );
}
