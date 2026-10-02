"use client";

import React from "react";
import { LiveActivityStatus } from "@/lib/operations/visitors-analytics";
import { Radio, AlertCircle } from "lucide-react";

interface Props {
  liveActivity: LiveActivityStatus;
  loading?: boolean;
}

export function LiveActivitySection({ liveActivity, loading = false }: Props) {
  if (!liveActivity.isSupported) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              تتبع الزوار اللحظي غير متاح حالياً (Live visitor tracking unavailable)
            </div>
            <div className="text-[11px] text-slate-400">
              لم يتم رصد اتصال نشط بمحرك الجلسات الحية أو أن خدمة WebSocket / Heartbeats غير مفعلة في هذه البيئة.
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
          STATUS: INACTIVE
        </span>
      </div>
    );
  }

  const activeNow = liveActivity.activeNow ?? 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
          <Radio className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">النشاط اللحظي المباشر (Live Activity)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
              LIVE RADAR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            تتبع حقيقي ومؤكد للجلسات النشطة في المنصة خلال آخر 5 دقائق (بدون أي أرقام افتراضية)
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 bg-slate-950/70 px-5 py-2.5 rounded-xl border border-slate-800/80 self-start sm:self-auto">
        <span className="text-3xl font-black text-emerald-400 font-mono">{activeNow}</span>
        <span className="text-xs font-bold text-slate-300">زائر نشط الآن</span>
      </div>
    </div>
  );
}
