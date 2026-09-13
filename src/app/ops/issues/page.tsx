"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  XCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { OperationsIssue, IssueCategory, IssueSeverity, IssueStatus } from "@/lib/operations/types";

export default function OpsIssuesPage() {
  const [issues, setIssues] = useState<OperationsIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<OperationsIssue | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New issue form state
  const [newCategory, setNewCategory] = useState<IssueCategory>("system");
  const [newSeverity, setNewSeverity] = useState<IssueSeverity>("P2");
  const [newDescription, setNewDescription] = useState("");
  const [newStudentId, setNewStudentId] = useState("");

  const loadIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ops/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error("Failed to load issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    if (newStatus === "RESOLVED" && !resolutionText.trim()) {
      alert("Please provide a resolution summary before marking as resolved.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/ops/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          issueId,
          status: newStatus,
          resolution: resolutionText.trim() || undefined,
        }),
      });

      if (res.ok) {
        setResolutionText("");
        setSelectedIssue(null);
        await loadIssues();
      } else {
        const err = await res.json();
        alert(`Failed to update issue: ${err.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/ops/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          severity: newSeverity,
          description: newDescription.trim(),
          relatedStudentId: newStudentId.trim() || undefined,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewDescription("");
        setNewStudentId("");
        await loadIssues();
      } else {
        const err = await res.json();
        alert(`Failed to create issue: ${err.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = issues.filter((issue) => {
    if (statusFilter !== "ALL" && issue.status !== statusFilter) return false;
    if (severityFilter !== "ALL" && issue.severity !== severityFilter) return false;
    if (categoryFilter !== "ALL" && issue.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchId = issue.id.toLowerCase().includes(q);
      const matchStudent = issue.relatedStudentId?.toLowerCase().includes(q);
      if (!matchDesc && !matchId && !matchStudent) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev: IssueSeverity) => {
    switch (sev) {
      case "P0":
        return "bg-red-950 text-red-400 border border-red-800 font-bold";
      case "P1":
        return "bg-orange-950 text-orange-400 border border-orange-800 font-semibold";
      case "P2":
        return "bg-yellow-950 text-yellow-400 border border-yellow-800";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-red-900/40 text-red-300 border border-red-800";
      case "INVESTIGATING":
        return "bg-blue-900/40 text-blue-300 border border-blue-800";
      case "RESOLVED":
        return "bg-emerald-900/40 text-emerald-300 border border-emerald-800";
      case "DISMISSED":
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Operations Issue Queue</h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
              {filtered.length} issues
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Central queue for detecting, investigating, and resolving operational anomalies across payments, access, and system signals.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log Issue</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {["ALL", "OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Severities</option>
            <option value="P0">P0 (Critical)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Normal)</option>
            <option value="P3">P3 (Low)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="payment">Payment</option>
            <option value="access">Access</option>
            <option value="subscription">Subscription</option>
            <option value="trial">Trial</option>
            <option value="telemetry">Telemetry</option>
            <option value="learning">Learning</option>
            <option value="content">Content</option>
            <option value="system">System</option>
            <option value="security">Security</option>
          </select>

          {/* Search Box */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search description, student ID, or issue ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            Loading operational issue queue...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <div className="font-semibold text-slate-300">No matching issues found</div>
            <div className="text-[11px] text-slate-500">
              Operational queue is clean or filter parameters returned zero records.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Related Target</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setResolutionText(issue.resolution || "");
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-mono">
                        {issue.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200 max-w-md truncate">
                      {issue.description}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                      {issue.relatedStudentId ? (
                        <span className="text-indigo-400">Student: {issue.relatedStudentId.slice(0, 8)}...</span>
                      ) : issue.relatedOrderId ? (
                        <span className="text-emerald-400">Order: {issue.relatedOrderId.slice(0, 8)}...</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-400">
                      {new Date(issue.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue);
                          setResolutionText(issue.resolution || "");
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect / Resolve Drawer */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getSeverityBadge(selectedIssue.severity)}`}>
                    {selectedIssue.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">{selectedIssue.category}</span>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div>
                <h2 className="text-base font-bold text-white">{selectedIssue.description}</h2>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  ID: {selectedIssue.id} • Created {new Date(selectedIssue.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Related entity references */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                  Associated Entities
                </div>
                {selectedIssue.relatedStudentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Student ID:</span>
                    <a
                      href={`/ops/students/${selectedIssue.relatedStudentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {selectedIssue.relatedStudentId}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {selectedIssue.relatedOrderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <a
                      href="/ops/finance"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {selectedIssue.relatedOrderId}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {!selectedIssue.relatedStudentId && !selectedIssue.relatedOrderId && (
                  <div className="text-slate-500 italic">No specific student or order attached.</div>
                )}
              </div>

              {/* Status and Resolution */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Operational Resolution Notes</label>
                <textarea
                  rows={3}
                  placeholder="Document actions taken, root cause, or rationale for resolution/dismissal..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {selectedIssue.resolution && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Existing Resolution:</div>
                  <div className="text-slate-200">{selectedIssue.resolution}</div>
                  {selectedIssue.resolvedAt && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Resolved at {new Date(selectedIssue.resolvedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-end gap-2">
              {selectedIssue.status !== "INVESTIGATING" && selectedIssue.status !== "RESOLVED" && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedIssue.id, "INVESTIGATING")}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                >
                  Start Investigation
                </button>
              )}
              {selectedIssue.status !== "DISMISSED" && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedIssue.id, "DISMISSED")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              )}
              {selectedIssue.status !== "RESOLVED" && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedIssue.id, "RESOLVED")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateIssue}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
                <span>Log New Operational Issue</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as IssueSeverity)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="P0">P0 (Critical)</option>
                  <option value="P1">P1 (High)</option>
                  <option value="P2">P2 (Normal)</option>
                  <option value="P3">P3 (Low)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as IssueCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="payment">Payment</option>
                  <option value="access">Access</option>
                  <option value="subscription">Subscription</option>
                  <option value="trial">Trial</option>
                  <option value="telemetry">Telemetry</option>
                  <option value="learning">Learning</option>
                  <option value="content">Content</option>
                  <option value="system">System</option>
                  <option value="security">Security</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Description</label>
              <textarea
                required
                rows={3}
                placeholder="Specific operational anomaly or problem description..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Related Student ID (Optional)</label>
              <input
                type="text"
                placeholder="UUID of affected student"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                Create Issue
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
