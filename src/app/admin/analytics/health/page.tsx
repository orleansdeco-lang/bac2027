"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Radio,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface HealthReport {
  isTrackingActive: boolean;
  totalSessionsRecorded: number;
  totalEventsRecorded: number;
  activeSessionsNow: number;
  missingUtmRate: number;
  metaPixelConfigured: boolean;
  metaPixelId?: string;
  supabaseConnected: boolean;
  lastEventTimestamp?: string;
  warningsFr: string[];
}

export default function AdminTrackingHealthPage() {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    adminFetch("/api/admin/operations/health")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setHealth(resData.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Santé du Suivi Analytique & Télémétrie
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Contrôle technique des flux d'ingestion, connectivité base de données et conformité des balises.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131E36] hover:bg-[#1E293B] text-xs font-medium text-slate-300 border border-[#1E293B] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Vérifier l'État</span>
        </button>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* First Party Tracker Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tracker First-Party</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            Opérationnel
          </div>
          <p className="text-[11px] text-slate-400">
            Sessions actives : <span className="font-mono text-emerald-400 font-bold">{health?.activeSessionsNow || 0}</span>
          </p>
        </div>

        {/* Supabase Connectivity Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Base Supabase</span>
            {health?.supabaseConnected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="text-lg font-bold text-slate-100">
            {health?.supabaseConnected ? "Connectée" : "Déconnectée"}
          </div>
          <p className="text-[11px] text-slate-400">
            Sessions enregistrées : <span className="font-mono text-slate-200">{health?.totalSessionsRecorded || 0}</span>
          </p>
        </div>

        {/* Meta Pixel Card */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pixel Meta (Facebook)</span>
            {health?.metaPixelConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-lg font-bold text-slate-100">
            {health?.metaPixelConfigured ? "Actif" : "Non configuré"}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {health?.metaPixelId || "NEXT_PUBLIC_META_PIXEL_ID manquant"}
          </p>
        </div>
      </div>

      {/* Warnings & Alerts */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Avertissements & Détections d'Intégrité</span>
        </h3>

        {(!health?.warningsFr || health.warningsFr.length === 0) ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aucune anomalie critique détectée dans l'infrastructure de télémétrie.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {health.warningsFr.map((w, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#080D1A] border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
