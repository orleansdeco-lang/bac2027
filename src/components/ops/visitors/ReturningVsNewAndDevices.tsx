"use client";

import React from "react";
import {
  ReturningVsNewBreakdown,
  DevicesBreakdown,
} from "@/lib/operations/visitors-analytics";
import { Repeat, UserPlus, Smartphone, Monitor, Tablet, HelpCircle } from "lucide-react";

interface Props {
  returningVsNew: ReturningVsNewBreakdown;
  devices: DevicesBreakdown;
  loading?: boolean;
}

export function ReturningVsNewAndDevices({
  returningVsNew,
  devices,
  loading = false,
}: Props) {
  const totalVisitors = (returningVsNew?.newVisitors || 0) + (returningVsNew?.returningVisitors || 0);
  const newPct = returningVsNew?.newPercentage || 0;
  const retPct = returningVsNew?.returningPercentage || 0;

  const totalDevices = (devices?.total) || ((devices?.mobile || 0) + (devices?.desktop || 0) + (devices?.tablet || 0) + (devices?.unknown || 0)) || 1;
  const mobilePct = Number((((devices?.mobile || 0) / totalDevices) * 100).toFixed(1));
  const desktopPct = Number((((devices?.desktop || 0) / totalDevices) * 100).toFixed(1));
  const tabletPct = Number((((devices?.tablet || 0) / totalDevices) * 100).toFixed(1));
  const unknownPct = Number((((devices?.unknown || 0) / totalDevices) * 100).toFixed(1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Returning vs New Visitors */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-amber-400" />
              <span>الزوار العائدون مقابل الجدد (Returning vs New)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              نسبة اكتساب زوار جدد مقابل احتفاظ واهتمام الزوار السابقين
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {totalVisitors} زائر
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>جدد: {newPct}%</span>
            </span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>عائدون: {retPct}%</span>
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${newPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
            />
            <div
              style={{ width: `${retPct}%` }}
              className="bg-amber-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>الزوار الجدد (New)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                {newPct}%
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {returningVsNew.newVisitors}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              أول زيارة لهم للمنصة خلال الفترة
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-amber-400" />
                <span>الزوار العائدون (Returning)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                {retPct}%
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {returningVsNew.returningVisitors}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              زاروا المنصة سابقاً وعادوا مجدداً
            </div>
          </div>
        </div>
      </div>

      {/* 2. Devices Breakdown */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>توزيع الأجهزة (Devices Breakdown)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              أنواع الأجهزة المستخدمة في تصفح المنصة (هاتف / كمبيوتر / لوحي)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {devices.total} جلسة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Mobile */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-white">الهاتف</span>
              <Smartphone className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-white font-mono">{devices.mobile}</div>
              <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{mobilePct}%</div>
            </div>
          </div>

          {/* Desktop */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-white">الكمبيوتر</span>
              <Monitor className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-white font-mono">{devices.desktop}</div>
              <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{desktopPct}%</div>
            </div>
          </div>

          {/* Tablet */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-white">اللوحي</span>
              <Tablet className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-white font-mono">{devices.tablet}</div>
              <div className="text-[10px] text-purple-400 font-mono mt-0.5">{tabletPct}%</div>
            </div>
          </div>

          {/* Unknown */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-white">أخرى</span>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-white font-mono">{devices.unknown}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{unknownPct}%</div>
            </div>
          </div>
        </div>

        {/* Stacked Device Ratio Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div style={{ width: `${mobilePct}%` }} className="bg-cyan-500" />
            <div style={{ width: `${desktopPct}%` }} className="bg-indigo-500" />
            <div style={{ width: `${tabletPct}%` }} className="bg-purple-500" />
            <div style={{ width: `${unknownPct}%` }} className="bg-slate-600" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>هاتف: {mobilePct}%</span>
            <span>كمبيوتر: {desktopPct}%</span>
            <span>لوحي: {tabletPct}%</span>
            <span>أخرى: {unknownPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
