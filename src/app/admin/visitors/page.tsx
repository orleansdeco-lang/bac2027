"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Radio,
  Users,
  Smartphone,
  Laptop,
  Globe,
  Compass,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { MetricState, LiveSession } from "@/lib/admin/operations-service";

interface VisitorAnalyticsData {
  live: {
    count: MetricState<number>;
    sessions: LiveSession[];
  };
  analytics: {
    totalSessions: MetricState<number>;
    uniqueVisitors: MetricState<number>;
    avgDurationSeconds: MetricState<number>;
    devices: Array<{ device: string; count: number; percentage: MetricState<number> }>;
    browsers: Array<{ browser: string; count: number; percentage: MetricState<number> }>;
    operatingSystems: Array<{ os: string; count: number; percentage: MetricState<number> }>;
    wilayas: Array<{ code: string; nameFr: string; count: number; percentage: MetricState<number> }>;
    streams: Array<{ streamId: string; nameFr: string; count: number }>;
  };
}

function renderVal(m?: MetricState<number>, suffix: string = ""): string {
  if (!m) return "Non disponible";
  if (m.status === "available") return `${m.value}${suffix}`;
  if (m.status === "not_configured") return "Non configuré";
  if (m.status === "not_available") return "Non disponible";
  return "Erreur";
}

export default function AdminVisitorsPage() {
  const [data, setData] = useState<VisitorAnalyticsData | null>(null);
  const [rangeDays, setRangeDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = (days: number) => {
    setLoading(true);
    adminFetch(`/api/admin/operations/visitors?days=${days}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisitors(rangeDays);
    const interval = setInterval(() => fetchVisitors(rangeDays), 15000);
    return () => clearInterval(interval);
  }, [rangeDays]);

  const live = data?.live;
  const a = data?.analytics;

  return (
    <div className="space-y-6 text-left">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-slate-100">
              Analyse du Trafic & Visiteurs Réels
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Sessions enregistrées, découpage territorial (Wilayas d'Algérie) et équipements mesurés.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#080D1A] p-1 rounded-xl border border-[#1E293B] text-xs">
          {[
            { label: "24 Heures", value: 1 },
            { label: "7 Jours", value: 7 },
            { label: "30 Jours", value: 30 },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRangeDays(tab.value)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                rangeDays === tab.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D1526] border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400">Visiteurs Présents en Direct</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {renderVal(live?.count)}
          </div>
          <div className="text-[11px] text-slate-400">Fenêtre de 5 minutes d'activité réelle</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400">Visiteurs Uniques sur la Période</div>
          <div className="text-3xl font-extrabold text-slate-100 font-mono">
            {renderVal(a?.uniqueVisitors)}
          </div>
          <div className="text-[11px] text-slate-400">Total sessions : {renderVal(a?.totalSessions)}</div>
        </div>

        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400">Durée Moyenne de Navigation</div>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono">
            {renderVal(a?.avgDurationSeconds, "s")}
          </div>
          <div className="text-[11px] text-slate-400">Temps passé mesuré par session</div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wilayas Breakdown */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Répartition par Wilaya Réellement Connue (Algérie)
            </h3>
          </div>

          <div className="space-y-2">
            {(!a?.wilayas || a.wilayas.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl">
                Données territoriales en attente • Aucune wilaya n'est inventée pour les visiteurs anonymes.
              </div>
            ) : (
              a.wilayas.map((w) => (
                <div key={w.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{w.nameFr}</span>
                    <span className="font-mono text-slate-400">
                      {w.count} ({renderVal(w.percentage, "%")})
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#080D1A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full"
                      style={{ width: w.percentage.status === "available" ? `${w.percentage.value}%` : "0%" }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices Breakdown */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Appareils & Terminaux Mesurés
            </h3>
          </div>

          <div className="space-y-3">
            {(!a?.devices || a.devices.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl">
                Aucun équipement enregistré pour le moment.
              </div>
            ) : (
              a.devices.map((d) => (
                <div key={d.device} className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{d.device}</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {renderVal(d.percentage, "%")}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0D1526] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: d.percentage.status === "available" ? `${d.percentage.value}%` : "0%" }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-right">
                    {d.count} sessions réelles
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Browsers & OS */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Navigateurs & Systèmes d'Exploitation
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400">Navigateurs</div>
              {(!a?.browsers || a.browsers.length === 0) ? (
                <div className="text-xs text-slate-500">Aucun</div>
              ) : (
                a.browsers.map((b) => (
                  <div key={b.browser} className="flex justify-between text-xs p-2 rounded-lg bg-[#080D1A]">
                    <span className="text-slate-300">{b.browser}</span>
                    <span className="font-mono text-slate-400">{renderVal(b.percentage, "%")}</span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400">Systèmes (OS)</div>
              {(!a?.operatingSystems || a.operatingSystems.length === 0) ? (
                <div className="text-xs text-slate-500">Aucun</div>
              ) : (
                a.operatingSystems.map((o) => (
                  <div key={o.os} className="flex justify-between text-xs p-2 rounded-lg bg-[#080D1A]">
                    <span className="text-slate-300">{o.os}</span>
                    <span className="font-mono text-slate-400">{renderVal(o.percentage, "%")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Streams Breakdown */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Filières de Baccalauréat Réellement Renseignées
            </h3>
          </div>

          <div className="space-y-2">
            {(!a?.streams || a.streams.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl">
                Aucune filière n'est inventée pour les visiteurs anonymes. La filière s'affiche dès qu'un élève s'inscrit ou passe un diagnostic.
              </div>
            ) : (
              a.streams.map((s) => (
                <div key={s.streamId} className="flex justify-between text-xs p-2.5 rounded-xl bg-[#080D1A] border border-[#1E293B]">
                  <span className="font-medium text-slate-300">{s.nameFr}</span>
                  <span className="font-mono font-bold text-purple-400">{s.count} élèves</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
