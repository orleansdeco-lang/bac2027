"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Users,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  Clock,
  Radio,
  Filter,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Smartphone,
  Laptop,
  Compass,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { MetricState, LiveSession, FunnelStage, ChannelStat } from "@/lib/admin/operations-service";

interface OperationsDashboardData {
  overview: {
    liveVisitors: MetricState<number>;
    todayVisitors: MetricState<number>;
    todaySessions: MetricState<number>;
    todayRegistrations: MetricState<number>;
    todayPaidSubscriptions: MetricState<number>;
    todayRevenueDZD: MetricState<number>;
    conversionRatePercent: MetricState<number>;
    topChannels: ChannelStat[];
    activeCampaignsCount: MetricState<number>;
    dataStatusFr: string;
  };
  live: {
    count: MetricState<number>;
    sessions: LiveSession[];
  };
  funnel: {
    stages: FunnelStage[];
    overallConversion: MetricState<number>;
  };
}

function renderMetric(
  metric?: MetricState<number>,
  suffix: string = ""
): { text: string; isAvailable: boolean } {
  if (!metric) return { text: "Non disponible", isAvailable: false };
  if (metric.status === "available") {
    return { text: `${metric.value}${suffix}`, isAvailable: true };
  }
  if (metric.status === "not_configured") {
    return { text: "Non configuré", isAvailable: false };
  }
  if (metric.status === "not_available") {
    return { text: "Non disponible", isAvailable: false };
  }
  return { text: "Erreur", isAvailable: false };
}

export default function AdminOperationsDashboard() {
  const [data, setData] = useState<OperationsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = () => {
    adminFetch("/api/admin/operations")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
          setError(null);
        } else {
          setError(resData.error || "Impossible de charger les indicateurs opérationnels.");
        }
      })
      .catch((err) => setError(err?.message || "Erreur de connexion au serveur"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const ov = data?.overview;
  const liveSessions = data?.live?.sessions || [];
  const funnelStages = data?.funnel?.stages || [];

  const liveM = renderMetric(ov?.liveVisitors);
  const visitorsM = renderMetric(ov?.todayVisitors);
  const sessionsM = renderMetric(ov?.todaySessions);
  const registrationsM = renderMetric(ov?.todayRegistrations);
  const conversionM = renderMetric(ov?.conversionRatePercent, "%");
  const subscriptionsM = renderMetric(ov?.todayPaidSubscriptions);
  const revenueM = renderMetric(ov?.todayRevenueDZD, " DA");

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Banner & Live Status */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-slate-100">
              Centre de Commandement Opérationnel SHATER
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Real Data Only
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {ov?.dataStatusFr || "Chargement..."} • Zéro extrapolation, chiffres issus de la base réelle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/visitors"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131E36] hover:bg-[#1E293B] text-xs font-medium text-slate-300 border border-[#1E293B] transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Flux Visiteurs</span>
          </Link>

          <Link
            href="/admin/campaign-debugger"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Débogueur UTM</span>
          </Link>
        </div>
      </div>

      {/* 2. Advertising Campaign Transparency Notice */}
      <div className="bg-[#0A101D] border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-amber-300">
            Historique Publicitaire : Test Facebook Ads en cours
          </div>
          <p className="text-slate-400 leading-relaxed">
            Historique antérieur au tracking v2 non disponible. Le suivi first-party mesure rigoureusement toutes les nouvelles sessions entrantes.
          </p>
        </div>
      </div>

      {/* 3. Primary KPI Cards Grid (Strict Real Evidence) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Live Visitors Card */}
        <div className="bg-[#0D1526] border border-emerald-500/30 rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Visiteurs Actifs</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${liveM.isAvailable ? "text-emerald-400" : "text-slate-500 text-sm"}`}>
              {liveM.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Fenêtre 5 min</p>
        </div>

        {/* Today's Visitors Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Visiteurs Uniques (24h)</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${visitorsM.isAvailable ? "text-slate-100" : "text-slate-500 text-sm"}`}>
              {visitorsM.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Sessions : {sessionsM.text}
          </p>
        </div>

        {/* Today's Registrations Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inscriptions (24h)</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${registrationsM.isAvailable ? "text-teal-400" : "text-slate-500 text-sm"}`}>
              {registrationsM.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Comptes élèves créés</p>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Taux de Conversion</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${conversionM.isAvailable ? "text-amber-400" : "text-slate-500 text-sm"}`}>
              {conversionM.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Visiteur → Inscription</p>
        </div>

        {/* Subscriptions Paid Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Abonnements Réglés</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${subscriptionsM.isAvailable ? "text-purple-400" : "text-slate-500 text-sm"}`}>
              {subscriptionsM.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Paiements validés</p>
        </div>

        {/* Real Revenue Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Revenu Réel Encaissé</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${revenueM.isAvailable ? "text-emerald-400" : "text-slate-500 text-sm"}`}>
              {revenueM.text}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Paiements confirmés uniquement</p>
        </div>
      </div>

      {/* 4. Two-Column Operational Section: Funnel & Real Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel Overview */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Entonnoir de Conversion Multi-Étapes
              </h3>
            </div>
            <Link
              href="/admin/acquisition/funnel"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Détails & Pertes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {funnelStages.slice(0, 5).map((stage, idx) => {
              const conv = renderMetric(stage.conversionRate, "%");
              return (
                <div key={stage.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{stage.nameFr}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100">{stage.count}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({conv.text})
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#080D1A] rounded-full overflow-hidden border border-[#1E293B]">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{
                        width: stage.conversionRate.status === "available"
                          ? `${Math.max(4, Math.min(100, stage.conversionRate.value))}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Traffic Acquisition by Channel */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Canaux d'Acquisition Réels Détectés
              </h3>
            </div>
            <Link
              href="/admin/acquisition"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>Attribution Complète</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {(!ov?.topChannels || ov.topChannels.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl">
                Données insuffisantes • Aucun canal avec visite mesurée pour le moment.
              </div>
            ) : (
              ov.topChannels.map((ch) => {
                const conv = renderMetric(ch.conversionRate, "%");
                return (
                  <div
                    key={ch.channel}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{ch.channelFr}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Inscriptions : {ch.registrations} • Conv : {conv.text}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-100">{ch.visits} visites</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ch.uniqueVisitors} uniques</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Live Active Sessions Stream Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Flux des Sessions Actives en Direct (Temps Réel)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Actualisation auto (15s)</span>
        </div>

        {liveSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl space-y-1">
            <div className="text-slate-300 font-medium">0 visiteur actif dans les 5 dernières minutes</div>
            <div className="text-slate-400">Le tableau affiche uniquement les sessions réelles dès qu'un utilisateur navigue.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 font-mono text-[11px]">
                  <th className="pb-2.5">Session / Identifiant</th>
                  <th className="pb-2.5">Page Actuelle</th>
                  <th className="pb-2.5">Terminal</th>
                  <th className="pb-2.5">Wilaya</th>
                  <th className="pb-2.5">Source / Campagne</th>
                  <th className="pb-2.5">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {liveSessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-[#131E36]/30 transition-colors">
                    <td className="py-2.5 font-mono text-slate-300">
                      <div className="font-semibold text-slate-200">
                        {s.anonymousId.slice(0, 16)}...
                      </div>
                      <div className="text-[10px] text-slate-400">{s.sessionId.slice(0, 12)}</div>
                    </td>
                    <td className="py-2.5 font-mono text-indigo-400">{s.currentPath}</td>
                    <td className="py-2.5 text-slate-300">
                      <span className="capitalize">{s.deviceType}</span>
                    </td>
                    <td className="py-2.5 text-slate-300">{s.wilayaName}</td>
                    <td className="py-2.5">
                      {s.firstCampaign ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[10px]">
                          {s.firstCampaign}
                        </span>
                      ) : (
                        <span className="text-slate-400">Direct / Non Identifié</span>
                      )}
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">{s.durationSeconds}s</td>
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
