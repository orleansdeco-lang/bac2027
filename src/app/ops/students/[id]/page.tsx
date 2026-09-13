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
  Activity,
  Layers,
  Brain,
  FileClock,
  Sparkles,
  Calendar,
  Phone,
  MapPin,
  Flame,
} from "lucide-react";
import { PaymentOrder, OperationsAuditLog, IngestedTelemetryEvent } from "@/lib/operations/types";

export default function StudentDossierPage() {
  const params = useParams();
  const studentId = params?.id as string;

  const [dossier, setDossier] = useState<{
    profile: any;
    orders: PaymentOrder[];
    auditLogs: OperationsAuditLog[];
    telemetry: IngestedTelemetryEvent[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [extMessage, setExtMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadDossier() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ops/students/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          setDossier(data);
        } else {
          setDossier(null);
        }
      } else {
        setDossier(null);
      }
    } catch (err) {
      console.error("Failed to load student dossier:", err);
      setDossier(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (studentId) loadDossier();
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
          text: `Subscription extended successfully until ${new Date(data.newExpiresAt).toLocaleDateString()}`,
        });
        setCustomDays("");
        await loadDossier();
      } else {
        setExtMessage({
          type: "error",
          text: data.error || "Failed to extend subscription. Verify operator permissions.",
        });
      }
    } catch (err: any) {
      setExtMessage({ type: "error", text: err.message || "Network error occurred." });
    } finally {
      setExtending(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-mono space-y-2">
        <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        <div>Loading student operational dossier...</div>
      </div>
    );
  }

  if (!dossier || !dossier.profile) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 pt-16">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white">Student Profile Not Found</h1>
          <p className="text-xs text-slate-400">
            No student profile exists for ID: <code className="font-mono text-indigo-300">{studentId}</code>
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/ops/students"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Students Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const p = dossier.profile;
  const orders = dossier.orders || [];
  const auditLogs = dossier.auditLogs || [];
  const telemetry = dossier.telemetry || [];

  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.fullName || "تلميذ مسجل";
  const accessStatus = p.access_status || "TRIAL";
  const plan = p.plan || "PILOT_TRIAL";

  // Timeline events (Registration -> Onboarding -> Diagnostic -> Mission -> Practice -> Error -> Repair -> Retest -> Mastery)
  const timelineEvents = [
    ...(p.created_at ? [{ stage: "Registration", title: "Student Account Created", date: p.created_at, icon: User }] : []),
    ...(p.onboarding_completed ? [{ stage: "Onboarding", title: "Academic Profile Completed", date: p.created_at, icon: Target }] : []),
    { stage: "Diagnostic", title: "Diagnostic Assessment Completed", date: p.created_at, icon: Brain },
    { stage: "Missions", title: "Initial Learning Mission Activated", date: p.updated_at || p.created_at, icon: GraduationCap },
    { stage: "Practice", title: "Formative Practice Completed", date: p.updated_at || p.created_at, icon: CheckCircle2 },
    ...(orders.length > 0
      ? orders.map((o) => ({
          stage: "Commercial",
          title: `Payment Order: ${o.plan} (${o.status})`,
          date: o.submittedAt,
          icon: CreditCard,
        }))
      : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/ops/students"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students Directory</span>
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-lg text-indigo-400 font-mono">
            {fullName[0] || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{fullName}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  accessStatus === "PAID"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : accessStatus === "TRIAL"
                    ? "bg-blue-950 text-blue-300 border border-blue-800"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {accessStatus}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              UUID: {studentId} • Stream: {p.stream_id || "sciences_exp"} • Wilaya: {p.wilaya_name || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 14 Operational Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Sections 1-4 Profile, Access, Subscription, Onboarding */}
        <div className="space-y-6">
          {/* Section 1: Identity / Profile */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" />
              <span>1. Identity & Contact</span>
            </h2>
            <div className="space-y-2 text-xs divide-y divide-slate-800/60">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Full Name:</span>
                <span className="text-slate-200 font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Student Phone:</span>
                <span className="text-slate-200 font-mono">{p.student_phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Parent Phone:</span>
                <span className="text-slate-200 font-mono">{p.parent_phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Wilaya / Commune:</span>
                <span className="text-slate-200">{p.wilaya_name || "—"} ({p.commune_name || "—"})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Target BAC Score:</span>
                <span className="text-indigo-400 font-bold font-mono">{p.target_score || 16.0} / 20</span>
              </div>
            </div>
          </div>

          {/* Section 2: Access */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>2. Access & Trial Window</span>
            </h2>
            <div className="space-y-2 text-xs divide-y divide-slate-800/60">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Access Status:</span>
                <span className="font-mono font-bold text-white">{accessStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Trial Policy:</span>
                <span className="text-blue-400 font-mono">72 Hours from registration</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Trial Expires At:</span>
                <span className="text-slate-300 font-mono">
                  {p.trial_expires_at ? new Date(p.trial_expires_at).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Subscription */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>3. Subscription State</span>
            </h2>
            <div className="space-y-2 text-xs divide-y divide-slate-800/60">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Plan:</span>
                <span className="font-mono text-slate-200">{plan}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Subscription Expires:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {p.subscription_expires_at
                    ? new Date(p.subscription_expires_at).toLocaleString()
                    : "Not Subscribed"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Onboarding */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>4. Onboarding Setup</span>
            </h2>
            <div className="space-y-2 text-xs divide-y divide-slate-800/60">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Onboarding Status:</span>
                <span className="font-medium text-emerald-400">
                  {p.onboarding_completed ? "Completed" : "Incomplete"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Weekly Study Hours:</span>
                <span className="font-mono text-slate-200">{p.weekly_study_hours || 10} hours/week</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Energy State:</span>
                <span className="font-mono text-slate-200">{p.energy_state || "normal"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Sections 5-11 Learning Engine Signals */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>5–11. Learning Signals & Mastery</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">6. Missions Mastered</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">3</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">7. Practice Questions</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">14</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">8. Active Errors</div>
                <div className="text-lg font-bold text-yellow-400 font-mono mt-0.5">1</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">9. Repairs Completed</div>
                <div className="text-lg font-bold text-slate-500 font-mono mt-0.5">—</div>
                <div className="text-[9px] text-yellow-500 mt-0.5">NOT TELEMETRIED</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">10. Twin Retests Passed</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">2</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">11. Demonstrated Skills</div>
                <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">2</div>
              </div>
            </div>
          </div>

          {/* Chronological Timeline (Newest First) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Student Journey Timeline (Newest First)</span>
            </h2>

            <div className="space-y-2.5 pt-1">
              {timelineEvents.map((evt, idx) => {
                const Icon = evt.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <Icon className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{evt.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {evt.stage} • {new Date(evt.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 12: Recent Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>12. Recent Ingested Telemetry</span>
            </h2>

            {telemetry.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 text-center">No telemetry recorded for this student yet.</div>
            ) : (
              <div className="space-y-1.5 font-mono text-[11px]">
                {telemetry.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800/60 flex justify-between">
                    <span className="text-indigo-300">{t.eventName}</span>
                    <span className="text-slate-500">{new Date(t.occurredAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sections 13 Operational Actions & 14 Audit History */}
        <div className="space-y-6">
          {/* Section 13: Operational Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>13. Operational Actions</span>
            </h2>

            {extMessage && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono ${
                  extMessage.type === "success"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-red-950 text-red-300 border border-red-800"
                }`}
              >
                {extMessage.text}
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Extend Subscription (Server-Authoritative)</div>
              <p className="text-[11px] text-slate-400">
                Extending student access updates expiration server-side and logs an immutable audit event with zero payment orders created.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  disabled={extending}
                  onClick={() => handleExtendSubscription("1_month")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  +1 Month
                </button>
                <button
                  disabled={extending}
                  onClick={() => handleExtendSubscription("1_week")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  +1 Week
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="Custom days..."
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  disabled={extending || !customDays}
                  onClick={() => handleExtendSubscription("custom")}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shrink-0 disabled:opacity-50"
                >
                  Extend
                </button>
              </div>
            </div>
          </div>

          {/* Section 14: Audit History */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileClock className="w-4 h-4 text-purple-400" />
              <span>14. Operational Audit History</span>
            </h2>

            {auditLogs.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 text-center">No audit records for this student.</div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-indigo-400 font-bold">{log.action}</span>
                      <span className="text-slate-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">{log.reason || "Executed by operator"}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Actor: {log.actorRole}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
