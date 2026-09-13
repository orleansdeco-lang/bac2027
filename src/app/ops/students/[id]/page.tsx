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
  const [extending, setExtending] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [extMessage, setExtMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  useEffect(() => {
    if (studentId) loadStudent();
  }, [studentId]);

  async function handleExtendSubscription(type: "1_month" | "1_week" | "custom") {
    setExtending(true);
    setExtMessage(null);
    try {
      const body: any = { type };
      if (type === "custom") {
        body.days = Number(customDays);
      }

      const res = await fetch(`/api/ops/students/${studentId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setExtMessage({
          type: "success",
          text: `تم تمديد اشتراك الطالب بنجاح حتى: ${new Date(data.newExpiresAt).toLocaleDateString()}`,
        });
        setCustomDays("");
        await loadStudent();
      } else {
        setExtMessage({
          type: "error",
          text: data.error || "فشل تمديد الاشتراك. يرجى التحقق من صلاحيات المشرف.",
        });
      }
    } catch (err: any) {
      setExtMessage({ type: "error", text: err.message || "حدث خطأ أثناء الاتصال بالخادم." });
    } finally {
      setExtending(false);
    }
  }

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

      {/* Extension Message Banner */}
      {extMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            extMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          <span>{extMessage.text}</span>
          <button onClick={() => setExtMessage(null)} className="underline opacity-70 hover:opacity-100">
            إغلاق
          </button>
        </div>
      )}

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

        {/* Entitlement & Subscription Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Trial & Subscription Entitlements</span>
          </h2>
          <div className="text-xs space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Access Status:</span>
              <span className={`font-mono font-bold ${
                student?.accessStatus === "PAID" ? "text-emerald-400" : student?.accessStatus === "EXPIRED" ? "text-rose-400" : "text-blue-400"
              }`}>
                {student?.accessStatus || "TRIAL"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Plan:</span>
              <span className="font-mono font-semibold text-white">{student?.plan || "PILOT_TRIAL"}</span>
            </div>
            {student?.subscriptionStartedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Start:</span>
                <span className="font-mono">{new Date(student.subscriptionStartedAt).toLocaleDateString()}</span>
              </div>
            )}
            {student?.subscriptionExpiresAt ? (
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Expiration:</span>
                <span className="font-mono font-semibold text-indigo-300">
                  {new Date(student.subscriptionExpiresAt).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-slate-500">Trial Expiration:</span>
                <span className="font-mono">{student?.trialExpiresAt ? new Date(student.trialExpiresAt).toLocaleDateString() : "—"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Subscription Extension Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>تمديد الاشتراك يدوياً (Manual Extension)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              تمديد صلاحية الطالب مباشرة على الخادم دون إنشاء طلب دفع مالي. يُسجل في سجل التدقيق فوراً.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExtendSubscription("1_month")}
                disabled={extending}
                className="px-2.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition text-center disabled:opacity-50"
              >
                + 1 شهر
              </button>
              <button
                onClick={() => handleExtendSubscription("1_week")}
                disabled={extending}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition text-center border border-slate-700 disabled:opacity-50"
              >
                + 1 أسبوع
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                max="365"
                placeholder="أيام مخصصة"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleExtendSubscription("custom")}
                disabled={extending || !customDays}
                className="flex-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition text-center border border-slate-700 disabled:opacity-50"
              >
                + تمديد مخصص
              </button>
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
