"use client";

import React from "react";
import { FunnelHeadlineRatios } from "@/lib/operations/conversion-funnel";
import { UserCheck, Sparkles, CheckCircle2, Award, Zap } from "lucide-react";

interface Props {
  ratios: FunnelHeadlineRatios;
  loading?: boolean;
}

export function FunnelHeadlineRatiosCards({ ratios, loading = false }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Visitor -> Registration */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold">تحويل الزائر إلى تسجيل</span>
          <UserCheck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {ratios.visitorToRegistration}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">VISITOR → REGISTER</div>
        </div>
      </div>

      {/* 2. Registration -> Activation */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold">تحويل التسجيل إلى تفعيل</span>
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {ratios.registrationToActivation}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">REGISTER → ACTIVATION</div>
        </div>
      </div>

      {/* 3. Activation -> Trial */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold">تفعيل الملف إلى تجربة</span>
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-purple-300 font-mono">
            {ratios.activationToTrial}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">ACTIVATION → TRIAL</div>
        </div>
      </div>

      {/* 4. Trial -> Paid */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold">تحويل التجربة إلى اشتراك</span>
          <Award className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {ratios.trialToPaid}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">TRIAL → PAID</div>
        </div>
      </div>

      {/* 5. Overall Conversion */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900/80 border border-emerald-500/30 backdrop-blur-md flex flex-col justify-between col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-[11px] font-semibold">معدل التحويل الكلي (Overall)</span>
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-white font-mono">
            {ratios.overallConversion}%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">VISITOR → PAID STUDENT</div>
        </div>
      </div>
    </div>
  );
}
