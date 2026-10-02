"use client";

import React from "react";
import { CampaignAttributionDetail } from "@/lib/operations/conversion-funnel";
import { Target, Layers, ExternalLink, Info } from "lucide-react";

interface Props {
  campaigns: CampaignAttributionDetail[];
  loading?: boolean;
}

export function CampaignsBreakdownTable({ campaigns, loading = false }: Props) {
  if (campaigns.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-2">
        <div className="flex items-center gap-2 text-white text-xs font-bold">
          <Target className="w-4 h-4 text-purple-400" />
          <span>تفصيل الحملات الإعلانية (UTM Campaigns Breakdown)</span>
        </div>
        <p className="text-xs text-slate-500">
          لم يتم رصد زيارات ذات معلمات <code>utm_campaign</code> في هذا النطاق الزمني. تأكد من تفعيل روابط التتبع في إعلانات المنصة.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span>تفصيل الحملات الإعلانية (UTM Campaigns Breakdown)</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            أداء الحملات المحددة عبر معلمات utm_campaign
          </p>
        </div>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
          {campaigns.length} حملة مسجلة
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">اسم الحملة (Campaign)</th>
              <th className="px-4 py-3">المصدر (Source)</th>
              <th className="px-4 py-3">الزوار (Visitors)</th>
              <th className="px-4 py-3">التسجيلات (Registrations)</th>
              <th className="px-4 py-3">التجربة (Trials)</th>
              <th className="px-4 py-3">المشتركون (Paid)</th>
              <th className="px-4 py-3 text-left">الإيراد المسند (Revenue)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {campaigns.map((camp) => (
              <tr key={`${camp.campaign}_${camp.source}`} className="hover:bg-slate-800/40 transition-colors">
                {/* Campaign */}
                <td className="px-4 py-3.5">
                  <div className="font-mono text-white font-bold text-xs" dir="ltr">
                    {camp.campaign}
                  </div>
                </td>

                {/* Source */}
                <td className="px-4 py-3.5">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                    {camp.source}
                  </span>
                </td>

                {/* Visitors */}
                <td className="px-4 py-3.5 font-mono text-slate-200">
                  {camp.visitors}
                </td>

                {/* Registrations */}
                <td className="px-4 py-3.5 font-mono text-purple-300 font-bold">
                  {camp.registrations}
                </td>

                {/* Trial */}
                <td className="px-4 py-3.5 font-mono text-amber-300">
                  {camp.trial}
                </td>

                {/* Paid */}
                <td className="px-4 py-3.5 font-mono text-emerald-400 font-black">
                  {camp.paid}
                </td>

                {/* Revenue */}
                <td className="px-4 py-3.5 text-left font-mono" dir="ltr">
                  {camp.revenue > 0 ? (
                    <span className="text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      {camp.revenue.toLocaleString("fr-DZ")} DZD
                    </span>
                  ) : (
                    <span className="text-slate-600 text-[11px]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
