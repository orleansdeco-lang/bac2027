"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import { StudentOperationalSummary } from "@/lib/operations/types";

export default function OpsStudentsPage() {
  const [students, setStudents] = useState<StudentOperationalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const res = await fetch("/api/ops/students");
        if (res.ok) {
          const data = await res.json();
          if (data?.students) setStudents(data.students);
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.wilayaName && s.wilayaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.id && s.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStream = streamFilter === "all" || s.streamId === streamFilter;
    const matchesStatus = statusFilter === "all" || s.accessStatus === statusFilter;

    return matchesSearch && matchesStream && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Student Directory</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {filtered.length} loaded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Operational registry of students across all Algerian streams. Inspect progress signals, trial states, and payment status.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, wilaya, or user ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Streams</option>
            <option value="sciences_exp">Sciences Exp</option>
            <option value="math">Math</option>
            <option value="technique_math">Tech Math</option>
            <option value="gestion_eco">Gestion & Éco</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Access States</option>
            <option value="TRIAL">Active Trial</option>
            <option value="PAID">Paid Pass</option>
            <option value="EXPIRED">Trial Expired</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Stream</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4">Access / Trial</th>
                <th className="py-3 px-4">Target Score</th>
                <th className="py-3 px-4">Commercial</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{s.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{s.email || s.id.slice(0, 8)}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {s.streamId || "sciences_exp"}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-400">
                    {s.wilayaName || "—"}
                  </td>

                  <td className="py-3 px-4">
                    {s.accessStatus === "PAID" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PAID PASS</span>
                      </span>
                    ) : s.accessStatus === "EXPIRED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        <span>EXPIRED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{s.remainingHours}h left</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                    {s.targetScore.toFixed(2)}/20
                  </td>

                  <td className="py-3 px-4">
                    {s.hasPendingPayment ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                        PENDING ORDER
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/ops/students/${s.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium transition-colors"
                    >
                      <span>Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No students match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
