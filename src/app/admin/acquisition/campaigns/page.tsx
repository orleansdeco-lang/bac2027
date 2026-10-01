"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Megaphone,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Bug,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { MetricState, CampaignSummary } from "@/lib/admin/operations-service";

function renderVal(m?: MetricState<number>, suffix: string = ""): string {
  if (!m) return "Non disponible";
  if (m.status === "available") return `${m.value}${suffix}`;
  if (m.status === "not_configured") return "Non configuré";
  if (m.status === "not_available") return "Non disponible";
  return "Erreur";
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/operations/acquisition")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data?.campaigns) {
          setCampaigns(resData.data.campaigns);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = (utmCampaign: string, utmSource: string, utmMedium: string, id: string) => {
    const url = `https://shater.dz/?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Campagnes Marketing & Liens Sponsorisés
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Gestion des tags UTM réels, mesure de l'acquisition payante et suivi strict sans extrapolation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/campaign-debugger"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Générateur & Débogueur UTM</span>
          </Link>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">
          Campagnes Détectées & Enregistrées ({campaigns.length})
        </h3>

        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl space-y-1">
            <div className="text-slate-300 font-medium">Aucune campagne mesurée</div>
            <div>Dès qu'un visiteur arrive avec un paramètre <code>utm_campaign</code>, il apparaîtra ici avec son attribution réelle.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Nom de la Campagne</th>
                  <th className="pb-3">Paramètre `utm_campaign`</th>
                  <th className="pb-3">Source / Support</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Visites</th>
                  <th className="pb-3">Inscriptions</th>
                  <th className="pb-3">Taux de Conversion</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-[#131E36]/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-3 font-mono text-indigo-400">{c.utmCampaign}</td>
                    <td className="py-3 font-mono text-slate-400">
                      {c.utmSource} / {c.utmMedium}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-100">{c.visits}</td>
                    <td className="py-3 font-mono font-bold text-teal-400">{c.registrations}</td>
                    <td className="py-3 font-mono font-bold text-amber-400">{renderVal(c.conversionRate, "%")}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleCopyLink(c.utmCampaign, c.utmSource, c.utmMedium, c.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#080D1A] hover:bg-[#131E36] text-[11px] text-slate-300 border border-[#1E293B] inline-flex items-center gap-1.5 transition-colors"
                        title="Copier le lien complet avec UTM"
                      >
                        {copiedId === c.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copier URL</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
