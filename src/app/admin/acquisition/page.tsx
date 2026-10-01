"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  TrendingUp,
  Megaphone,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { MetricState, ChannelStat, CampaignSummary } from "@/lib/admin/operations-service";

interface AcquisitionData {
  channels: ChannelStat[];
  campaigns: CampaignSummary[];
}

function renderVal(m?: MetricState<number>, suffix: string = ""): string {
  if (!m) return "Non disponible";
  if (m.status === "available") return `${m.value}${suffix}`;
  if (m.status === "not_configured") return "Non configuré";
  if (m.status === "not_available") return "Non disponible";
  return "Erreur";
}

export default function AdminAcquisitionPage() {
  const [data, setData] = useState<AcquisitionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/admin/operations/acquisition")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const channels = data?.channels || [];
  const campaigns = data?.campaigns || [];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Acquisition & Attribution Multi-Touch
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Analyse des sources de trafic réelles, comparaison Premier Contact (Découverte) vs Dernier Contact (Conversion).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/acquisition/campaigns"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131E36] hover:bg-[#1E293B] text-xs font-medium text-slate-300 border border-[#1E293B] transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tableau des Campagnes</span>
          </Link>

          <Link
            href="/admin/acquisition/funnel"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Entonnoir des Ventes</span>
          </Link>
        </div>
      </div>

      {/* Attribution Methodology Explainer */}
      <div className="bg-[#0A101D] border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-indigo-300">
            Modèle d'Attribution Double Authentique
          </div>
          <p className="text-slate-400 leading-relaxed">
            <strong>Premier Contact (First-Touch) :</strong> Mémorise la toute première campagne ou source qui a fait connaître SHATER à l'élève.
            <br />
            <strong>Dernier Contact (Last-Touch) :</strong> Capture la source ayant immédiatement précédé l'inscription ou la commande COD. Seuls les canaux avec visites réelles sont listés.
          </p>
        </div>
      </div>

      {/* Channels Breakdown Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>Canaux d'Acquisition Ayant Généré du Trafic ({channels.length})</span>
        </h3>

        {channels.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl">
            Aucun canal n'a encore enregistré de visite. Les canaux apparaîtront dès la première session mesurée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Canal Réel</th>
                  <th className="pb-3">Visites Totales</th>
                  <th className="pb-3">Visiteurs Uniques</th>
                  <th className="pb-3">Premier Contact</th>
                  <th className="pb-3">Dernier Contact</th>
                  <th className="pb-3">Inscriptions</th>
                  <th className="pb-3">Taux de Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {channels.map((ch) => (
                  <tr key={ch.channel} className="hover:bg-[#131E36]/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-200">
                      {ch.channelFr}
                    </td>
                    <td className="py-3 font-mono text-slate-100">{ch.visits}</td>
                    <td className="py-3 font-mono text-slate-300">{ch.uniqueVisitors}</td>
                    <td className="py-3 font-mono text-indigo-400">{ch.firstTouchCount}</td>
                    <td className="py-3 font-mono text-teal-400">{ch.lastTouchCount}</td>
                    <td className="py-3 font-mono font-bold text-emerald-400">{ch.registrations}</td>
                    <td className="py-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        ch.conversionRate.status === "available" && ch.conversionRate.value > 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-slate-400"
                      }`}>
                        {renderVal(ch.conversionRate, "%")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaigns Quick Overview */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">
            Campagnes Actives Mesurées
          </h3>
          <Link
            href="/admin/acquisition/campaigns"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Voir toutes les campagnes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl">
            Aucune campagne mesurée pour l'instant. Utilisez le générateur d'URLs pour lancer une campagne avec tags UTM.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{c.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                    {c.status}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-indigo-400">
                  utm_campaign={c.utmCampaign}
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-[#1E293B]/60 font-mono">
                  <span>{c.visits} visites</span>
                  <span>{c.registrations} inscriptions</span>
                  <span className="text-emerald-400 font-bold">Conv : {renderVal(c.conversionRate, "%")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
