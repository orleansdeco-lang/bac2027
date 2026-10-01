"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Filter,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { MetricState, FunnelStage } from "@/lib/admin/operations-service";

interface FunnelData {
  stages: FunnelStage[];
  overallConversion: MetricState<number>;
}

function renderVal(m?: MetricState<number>, suffix: string = ""): string {
  if (!m) return "Non disponible";
  if (m.status === "available") return `${m.value}${suffix}`;
  if (m.status === "not_configured") return "Non configuré";
  if (m.status === "not_available") return "Non disponible";
  return "Erreur";
}

export default function AdminConversionFunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/admin/operations/funnel")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stages = data?.stages || [];
  const overall = renderVal(data?.overallConversion, "%");

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Entonnoir de Conversion & Analyse des Déperditions
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Traçage mathématique des étapes franchies par les élèves : du premier clic jusqu'à l'abonnement payé.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs">
            <span className="text-slate-400">Conversion Globale : </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{overall}</span>
          </div>
        </div>
      </div>

      {/* Funnel Visual Stages */}
      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === stages.length - 1;
          const convText = renderVal(stage.conversionRate, "%");
          const dropText = renderVal(stage.dropOffRate, "%");

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Card */}
              <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">
                        {stage.nameFr}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 pl-8">
                      {stage.descriptionFr}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-slate-100 font-mono">
                        {stage.count}
                      </div>
                      <div className="text-[11px] text-slate-400">utilisateurs</div>
                    </div>

                    {!isFirst && (
                      <div className="text-right">
                        <div className={`text-base font-extrabold font-mono ${
                          stage.conversionRate.status === "available" && stage.conversionRate.value >= 50
                            ? "text-emerald-400"
                            : stage.conversionRate.status === "available"
                            ? "text-amber-400"
                            : "text-slate-500 text-xs"
                        }`}>
                          {convText}
                        </div>
                        <div className="text-[11px] text-slate-400">taux de passage</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-4 h-2 bg-[#080D1A] rounded-full overflow-hidden border border-[#1E293B]/80">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{
                      width: stage.conversionRate.status === "available"
                        ? `${Math.max(5, Math.min(100, stage.conversionRate.value))}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Drop-off Indicator between stages */}
              {!isLast && (
                <div className="flex items-center justify-center gap-2 py-1 text-xs text-slate-400">
                  <ArrowDown className="w-4 h-4 text-slate-500" />
                  <span className="font-mono text-red-400/90 font-medium">
                    Déperdition : -{dropText}
                  </span>
                  <span className="text-slate-400 font-mono">
                    ({Math.max(0, stage.count - (stages[idx + 1]?.count || 0))} abandonnent ici)
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Levers for Conversion Optimization */}
      <div className="bg-[#0A101D] border border-[#1E293B] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Recommandations Basées sur les Chiffres Réels
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-3.5 rounded-xl bg-[#0D1526] border border-[#1E293B] space-y-1">
            <div className="font-semibold text-slate-200">1. Réduire le rebond initial</div>
            <p>Améliorer le temps de chargement des landing pages mobiles et clarifier l'offre BAC 2027 au premier écran.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0D1526] border border-[#1E293B] space-y-1">
            <div className="font-semibold text-slate-200">2. Activer après inscription</div>
            <p>Guider immédiatement le nouvel inscrit vers son premier diagnostic pour valider la valeur éducative.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0D1526] border border-[#1E293B] space-y-1">
            <div className="font-semibold text-slate-200">3. Rassurer sur le COD</div>
            <p>Mettre en avant la garantie «Paiement à la livraison après inspection du kit physique» sur le checkout.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
