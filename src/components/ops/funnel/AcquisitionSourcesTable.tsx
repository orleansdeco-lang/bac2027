"use client";

import React from "react";
import { AcquisitionSourceDetail } from "@/lib/operations/conversion-funnel";
import {
  Share2,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Info,
} from "lucide-react";

interface Props {
  sources: AcquisitionSourceDetail[];
  loading?: boolean;
}

const SOURCE_ICONS: Record<string, { label: string; color: string; badge: string }> = {
  Meta: { label: "Meta (Facebook / Instagram)", color: "text-blue-400", badge: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  Google: { label: "Google (Search / Ads)", color: "text-red-400", badge: "bg-red-500/10 text-red-300 border-red-500/30" },
  TikTok: { label: "TikTok", color: "text-pink-400", badge: "bg-pink-500/10 text-pink-300 border-pink-500/30" },
  Telegram: { label: "Telegram", color: "text-sky-400", badge: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  Organic: { label: "Organic Search (SEO)", color: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  Direct: { label: "Direct (مباشر)", color: "text-slate-300", badge: "bg-slate-800 text-slate-300 border-slate-700" },
  Referral: { label: "Referral (إحالة)", color: "text-purple-400", badge: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
  Unknown: { label: "Unknown / Untracked", color: "text-slate-400", badge: "bg-slate-900 text-slate-400 border-slate-800" },
};

export function AcquisitionSourcesTable({ sources, loading = false }: Props) {
  const totalRevenue = sources.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const totalPaid = sources.reduce((sum, s) => sum + (s.paidStudents || 0), 0);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>تفصيل الاكتساب حسب المصدر (Acquisition Breakdown by Source)</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            تتبع أداء كل قناة من الزيارات، إلى التسجيل، التجربة، والاشتراكات المؤكدة
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/30">
          <span>إجمالي الإيراد المسند:</span>
          <span className="font-bold">{totalRevenue.toLocaleString("fr-DZ")} دج</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">المصدر (Source)</th>
              <th className="px-4 py-3">الزوار (Visitors)</th>
              <th className="px-4 py-3">التسجيلات (Registrations)</th>
              <th className="px-4 py-3">بدء التجربة (Trials)</th>
              <th className="px-4 py-3">المشتركون (Paid Students)</th>
              <th className="px-4 py-3">معدل التحويل (Conv. %)</th>
              <th className="px-4 py-3 text-left">الإيراد الموثق (Attributed Revenue)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sources.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                  لا توجد بيانات قنوات مسجلة في هذا النطاق الزمني
                </td>
              </tr>
            ) : (
              sources.map((src) => {
                const conf = SOURCE_ICONS[src.source] || {
                  label: src.source,
                  color: "text-slate-300",
                  badge: "bg-slate-800 text-slate-300 border-slate-700",
                };
                const convRate = src.visitors > 0 ? ((src.paidStudents / src.visitors) * 100).toFixed(1) : "0.0";

                return (
                  <tr key={src.source} className="hover:bg-slate-800/40 transition-colors">
                    {/* Source Name */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${conf.badge}`}>
                        {conf.label}
                      </span>
                    </td>

                    {/* Visitors */}
                    <td className="px-4 py-3.5 font-mono text-slate-200 font-bold">
                      {src.visitors}
                    </td>

                    {/* Registrations */}
                    <td className="px-4 py-3.5 font-mono text-purple-300 font-bold">
                      {src.registrations}
                    </td>

                    {/* Trials */}
                    <td className="px-4 py-3.5 font-mono text-amber-300 font-bold">
                      {src.trials}
                    </td>

                    {/* Paid */}
                    <td className="px-4 py-3.5 font-mono text-emerald-400 font-black">
                      {src.paidStudents}
                    </td>

                    {/* Conversion Rate */}
                    <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">
                      {convRate}%
                    </td>

                    {/* Attributed Revenue */}
                    <td className="px-4 py-3.5 text-left font-mono" dir="ltr">
                      {src.revenue > 0 ? (
                        <span className="text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                          {src.revenue.toLocaleString("fr-DZ")} DZD
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center gap-1.5">
        <Info className="w-3 h-3 text-cyan-400 shrink-0" />
        <span>
          قاعدة الإسناد المالي: يتم احتساب الإيرادات المسندة حصرياً للطلبات المؤكدة والمدفوعة التي ترتبط مباشرة بهوية التلميذ المسجل ومصدر زيارته الأولى.
        </span>
      </div>
    </div>
  );
}
