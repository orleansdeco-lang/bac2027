"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Target,
  CreditCard,
  History,
  ShieldCheck,
} from "lucide-react";
import { PaymentOrder } from "@/lib/operations/types";

export default function StudentDossierPage() {
  const params = useParams();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<any>(null);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      try {
        const [studRes, ordRes] = await Promise.all([
          fetch("/api/ops/students"),
          fetch(`/api/ops/payments?userId=${studentId}`),
        ]);

        if (studRes.ok) {
          const sData = await studRes.json();
          const target = sData?.students?.find((s: any) => s.id === studentId);
          setStudent(target || { id: studentId, fullName: "Student Record" });
        }
        if (ordRes.ok) {
          const oData = await ordRes.json();
          setOrders(oData?.orders || []);
        }
      } catch (err) {
        console.error("Failed to load dossier:", err);
      } finally {
        setLoading(false);
      }
    }

    if (studentId) loadStudent();
  }, [studentId]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/ops/students"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Directory</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-bold text-lg">
            {student?.fullName?.slice(0, 1) || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {student?.fullName || "Student Dossier"}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {student?.streamId || "sciences_exp"}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              ID: {studentId} {student?.email ? `· ${student.email}` : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {student?.accessStatus === "PAID" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PAID PASS SUBSCRIBER</span>
            </span>
          ) : student?.accessStatus === "EXPIRED" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-950 text-red-400 border border-red-800 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>72H TRIAL EXPIRED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>ACTIVE TRIAL ({student?.remainingHours ?? 72}h left)</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Academic & Location Profile</span>
          </h2>
          <div className="text-xs space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Target Score:</span>
              <span className="font-mono font-bold text-white">{student?.targetScore ?? 16.0}/20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Wilaya:</span>
              <span>{student?.wilayaName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Commune:</span>
              <span>{student?.communeName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Phone:</span>
              <span className="font-mono">{student?.studentPhone || "—"}</span>
            </div>
          </div>
        </div>

        {/* Entitlement Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Trial & Entitlements</span>
          </h2>
          <div className="text-xs space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Trial Start:</span>
              <span className="font-mono">{student?.trialStartedAt ? new Date(student.trialStartedAt).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trial Expiration:</span>
              <span className="font-mono">{student?.trialExpiresAt ? new Date(student.trialExpiresAt).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Access Status:</span>
              <span className="font-mono font-bold text-white">{student?.accessStatus || "TRIAL"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Plan:</span>
              <span className="font-mono">{student?.plan || "PILOT_TRIAL"}</span>
            </div>
          </div>
        </div>

        {/* Security & Access Guard */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Operations Governance</span>
          </h2>
          <div className="text-xs space-y-2 text-slate-400">
            <p className="leading-relaxed">
              Read-only operational intelligence. Impersonation is disabled by architectural policy to ensure student privacy.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-400">
              ✓ Server-Authoritative Integrity
            </div>
          </div>
        </div>
      </div>

      {/* Payment Orders History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <CreditCard className="w-4 h-4 text-indigo-400" />
          <span>Payment Orders ({orders.length})</span>
        </h2>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-3">Order ID</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Submitted</th>
                  <th className="py-2 px-3">Reviewed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 px-3 font-mono">{o.id}</td>
                    <td className="py-2 px-3 uppercase">{o.paymentMethod}</td>
                    <td className="py-2 px-3 font-mono font-bold text-white">
                      {o.amount} {o.currency}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        o.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : o.status === "REJECTED"
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(o.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">
                      {o.reviewedBy ? o.reviewedBy.slice(0, 8) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-500">
            No payment orders submitted by this student yet.
          </div>
        )}
      </div>
    </div>
  );
}
