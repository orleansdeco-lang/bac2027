"use client";

import React, { useEffect, useState } from "react";
import {
  FileClock,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
} from "lucide-react";
import { OperationsAuditLog } from "@/lib/operations/types";

export default function OpsAuditPage() {
  const [logs, setLogs] = useState<OperationsAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<OperationsAuditLog | null>(null);

  async function fetchAuditLogs() {
    setLoading(true);
    try {
      const url = actionFilter === "all" ? "/api/ops/audit" : `/api/ops/audit?action=${actionFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.logs) setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Operations Audit Log</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              Append-Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Application-level append-only governance trail of all privileged actions: payment approvals, rejections, plan updates, issues, and security events.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          "all",
          "PAYMENT_APPROVED",
          "PAYMENT_REJECTED",
          "SUBSCRIPTION_APPROVED",
          "SUBSCRIPTION_PLAN_UPDATED",
          "SUBSCRIPTION_EXTENDED",
          "ISSUE_CREATED",
          "ISSUE_RESOLVED",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActionFilter(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              actionFilter === tab
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            {tab === "all" ? "All Actions" : tab}
          </button>
        ))}
      </div>

      {/* Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">
                      {log.actorUserId ? log.actorUserId.slice(0, 8) : "System"}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">{log.actorRole}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                        log.action === "PAYMENT_APPROVED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : log.action === "PAYMENT_REJECTED"
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : "bg-indigo-950 text-indigo-400 border border-indigo-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-400 text-[11px]">
                      {log.targetType}: <span className="font-mono text-slate-200">{log.targetId.slice(0, 8)}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                    {log.reason || "—"}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No audit records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect State Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileClock className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white text-sm">Audit Record Details</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{selectedLog.id}</span>
            </div>

            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Action:</span>
                <span className="font-mono font-bold text-white">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actor Role:</span>
                <span className="font-mono text-emerald-400">{selectedLog.actorRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target:</span>
                <span className="font-mono">{selectedLog.targetType} ({selectedLog.targetId})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Reason:</span>
                <p className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                  {selectedLog.reason || "No explicit reason provided"}
                </p>
              </div>

              {selectedLog.beforeState && (
                <div>
                  <span className="text-slate-500 block">Before State:</span>
                  <pre className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] overflow-x-auto text-amber-300">
                    {JSON.stringify(selectedLog.beforeState, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.afterState && (
                <div>
                  <span className="text-slate-500 block">After State:</span>
                  <pre className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] overflow-x-auto text-emerald-300">
                    {JSON.stringify(selectedLog.afterState, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
