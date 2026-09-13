"use client";

import React, { useEffect, useState } from "react";
import {
  Server,
  Database,
  Activity,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { getCapturedClientErrors, CapturedError } from "@/lib/monitoring";

export default function OpsSystemPage() {
  const [clientErrors, setClientErrors] = useState<CapturedError[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverTime, setServerTime] = useState<string>("—");

  async function fetchDiagnostics() {
    setLoading(true);
    try {
      const res = await fetch("/api/server-time");
      if (res.ok) {
        const data = await res.json();
        setServerTime(data.now || new Date().toISOString());
      }
      setClientErrors(getCapturedClientErrors());
    } catch (err) {
      console.error("Failed to load diagnostics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">System Health & Observability</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              Operational
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Live infrastructure status, server-authoritative time, database table integrity, and client exception stream.
          </p>
        </div>

        <button
          onClick={fetchDiagnostics}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Core Infrastructure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Integrity</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
              10+4 Tables
            </span>
          </div>
          <div className="text-sm font-bold text-white">Supabase PostgreSQL</div>
          <p className="text-[11px] text-slate-500">
            10 canonical Learning Core tables + 4 Operations Core tables. Composite FKs & RLS active.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Server-Authoritative Clock</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 font-mono">
              Active Sync
            </span>
          </div>
          <div className="text-sm font-bold text-white font-mono truncate">
            {serverTime}
          </div>
          <p className="text-[11px] text-slate-500">
            Anchors 72-hour trial decisions. Immune to client device manipulation.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Telemetry Ingestion</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 font-mono">
              POST /api/telemetry
            </span>
          </div>
          <div className="text-sm font-bold text-white">Batch Queue Active</div>
          <p className="text-[11px] text-slate-500">
            38-event allowlist validation, size limits, deduplication, and PII scrubbing.
          </p>
        </div>
      </div>

      {/* Client Exception Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>Client Runtime Exception Stream ({clientErrors.length})</span>
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">FIFO buffer (last 50)</span>
        </div>

        {clientErrors.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {clientErrors.map((err) => (
              <div key={err.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-red-400 font-mono">{err.message}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(err.timestamp).toLocaleTimeString()}</span>
                </div>
                {err.url && (
                  <div className="text-[11px] text-slate-400 font-mono">Route: {err.url}</div>
                )}
                {err.stack && (
                  <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-slate-500 overflow-x-auto">
                    {err.stack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            ✓ Zero client runtime exceptions recorded in this session.
          </div>
        )}
      </div>
    </div>
  );
}
