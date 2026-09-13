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
  ShieldCheck,
  UserX,
} from "lucide-react";
import { StudentOperationalSummary } from "@/lib/operations/types";

export default function OpsStudentsPage() {
  const [students, setStudents] = useState<StudentOperationalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");

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
    // Search query matches name, phone, or id
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchPhone = s.studentPhone ? s.studentPhone.includes(q) : false;
      const matchId = s.id.toLowerCase().includes(q);
      const matchEmail = s.email ? s.email.toLowerCase().includes(q) : false;
      if (!matchName && !matchPhone && !matchId && !matchEmail) return false;
    }

    // Stream Filter
    if (streamFilter !== "all" && s.streamId !== streamFilter) {
      return false;
    }

    // Wilaya Filter
    if (wilayaFilter !== "all" && s.wilayaName !== wilayaFilter) {
      return false;
    }

    // Subscription Plan Filter
    if (subscriptionFilter !== "all") {
      if (subscriptionFilter === "season" && s.plan !== "season") return false;
      if (subscriptionFilter === "monthly" && s.plan !== "monthly") return false;
      if (subscriptionFilter === "trial" && s.plan !== "PILOT_TRIAL") return false;
    }

    // General Status Filter
    if (statusFilter !== "all") {
      if (statusFilter === "trial" && s.accessStatus !== "TRIAL") return false;
      if (statusFilter === "paid" && s.accessStatus !== "PAID") return false;
      if (statusFilter === "expired" && s.accessStatus !== "EXPIRED") return false;
      if (statusFilter === "onboarding_incomplete" && s.onboardingCompleted) return false;
      if (statusFilter === "learning_active" && (s.completedMissionsCount || 0) === 0) return false;
      if (statusFilter === "learning_inactive" && (s.completedMissionsCount || 0) > 0) return false;
    }

    return true;
  });

  const getStatusBadge = (status: "TRIAL" | "PAID" | "EXPIRED", hours: number) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold";
      case "TRIAL":
        if (hours <= 12) {
          return "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse";
        }
        return "bg-blue-950 text-blue-300 border border-blue-800";
      case "EXPIRED":
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  const uniqueWilayas = Array.from(
    new Set(students.map((s) => s.wilayaName).filter(Boolean))
  ) as string[];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Student Operations Directory</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {filtered.length} of {students.length} students
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative registry of students across all Algerian streams. Search, filter, and inspect student access and progress.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, phone (05/06/07), or user ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Stream Filter */}
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Streams</option>
            <option value="sciences_exp">Sciences Exp</option>
            <option value="math">Mathématiques</option>
            <option value="technique_math">Tech Math</option>
            <option value="gestion_eco">Gestion & Éco</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Access States</option>
            <option value="trial">Active Trial (72h)</option>
            <option value="paid">Active Paid</option>
            <option value="expired">Expired Access</option>
            <option value="onboarding_incomplete">Onboarding Incomplete</option>
            <option value="learning_active">Learning Active (&ge;1 Mission)</option>
            <option value="learning_inactive">Learning Inactive (0 Missions)</option>
          </select>

          {/* Subscription State Filter */}
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Plans</option>
            <option value="season">Season Pass</option>
            <option value="monthly">Monthly Pass</option>
            <option value="trial">Trial Plan</option>
          </select>

          {/* Wilaya Filter */}
          {uniqueWilayas.length > 0 && (
            <select
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="w-full md:w-auto bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Wilayas</option>
              {uniqueWilayas.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            Loading student operations directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-1">
            <UserX className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="font-semibold text-slate-300">No matching students found</div>
            <div className="text-[11px] text-slate-500">
              Try clearing search filters or changing the status filter criteria.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Stream</th>
                  <th className="px-4 py-3">Wilaya</th>
                  <th className="px-4 py-3">Access State</th>
                  <th className="px-4 py-3">Remaining / Expiry</th>
                  <th className="px-4 py-3">Onboarding</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Student Name */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200">{student.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-500 truncate max-w-[130px]">
                        {student.id}
                      </div>
                    </td>

                    {/* Phone (Masked for privacy) */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {student.studentPhone ? `${student.studentPhone.slice(0, 4)}***${student.studentPhone.slice(-2)}` : "—"}
                    </td>

                    {/* Stream */}
                    <td className="px-4 py-3 text-slate-300 text-[11px]">
                      {student.streamId === "sciences_exp"
                        ? "علوم تجريبية"
                        : student.streamId === "math"
                        ? "رياضيات"
                        : student.streamId === "gestion_eco"
                        ? "تسيير واقتصاد"
                        : student.streamId || "—"}
                    </td>

                    {/* Wilaya */}
                    <td className="px-4 py-3 text-slate-300 text-[11px]">
                      {student.wilayaName || "—"}
                    </td>

                    {/* Access State */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${getStatusBadge(student.accessStatus, student.remainingHours)}`}>
                        {student.accessStatus}
                      </span>
                    </td>

                    {/* Remaining / Expiry */}
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-300">
                      {student.accessStatus === "PAID" ? (
                        <span className="text-emerald-400">
                          {student.subscriptionExpiresAt
                            ? new Date(student.subscriptionExpiresAt).toLocaleDateString()
                            : "Subscribed"}
                        </span>
                      ) : student.accessStatus === "TRIAL" ? (
                        <span className={student.remainingHours <= 12 ? "text-amber-400 font-semibold" : "text-slate-300"}>
                          {student.remainingHours}h left
                        </span>
                      ) : (
                        <span className="text-slate-500">Expired</span>
                      )}
                    </td>

                    {/* Onboarding */}
                    <td className="px-4 py-3 text-[11px]">
                      {student.onboardingCompleted ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <span className="text-yellow-400 flex items-center gap-1 font-mono text-[10px]">
                          <AlertCircle className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-400">
                      {student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-400">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/ops/students/${student.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
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
