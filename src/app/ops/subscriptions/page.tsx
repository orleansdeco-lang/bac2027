"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  CreditCard,
  Calendar,
  Bell,
  Lock,
  Unlock,
  Users,
} from "lucide-react";
import { SubscriptionPlan, SubscriptionAlert } from "@/lib/operations/types";

export default function OpsSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form edit states
  const [editPrices, setEditPrices] = useState<Record<string, number>>({});
  const [editDurations, setEditDurations] = useState<Record<string, number>>({});

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/subscriptions");
      if (res.ok) {
        const data = await res.json();
        if (data.plans) {
          setPlans(data.plans);
          const initialPrices: Record<string, number> = {};
          const initialDurations: Record<string, number> = {};
          data.plans.forEach((p: SubscriptionPlan) => {
            initialPrices[p.id] = p.price_dzd;
            initialDurations[p.id] = p.duration_months;
          });
          setEditPrices(initialPrices);
          setEditDurations(initialDurations);
        }
        if (data.alerts) {
          setAlerts(data.alerts);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: err.error || "Failed to load subscription settings." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error loading subscriptions." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpdatePlan(planId: string, overrides?: { active?: boolean }) {
    setSavingPlanId(planId);
    setMessage(null);

    const price = editPrices[planId];
    const duration = editDurations[planId];

    try {
      const body: any = { planId };
      if (overrides && overrides.active !== undefined) {
        body.active = overrides.active;
      } else {
        body.price_dzd = Number(price);
        body.duration_months = Number(duration);
      }

      const res = await fetch("/api/ops/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: `تم تحديث خطة '${data.plan?.name || planId}' بنجاح في قاعدة البيانات والعمليات.`,
        });
        await loadData();
      } else {
        setMessage({
          type: "error",
          text: data.error || "فشل تحديث الخطة. يرجى التأكد من صلاحيات المشرف.",
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "حدث خطأ أثناء حفظ الخطة." });
    } finally {
      setSavingPlanId(null);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Subscription Control & Plans / إدارة الاشتراكات والخطط
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            التحكم اليدوي المباشر في أسعار ومدة خطط الاشتراك، وإغلاق أو فتح باب التسجيل مع الحفاظ على اشتراكات الطلاب النشطين.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
              : "bg-rose-950/40 border-rose-800/80 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 underline px-2 py-1"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Operational Alerts Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            تنبيهات العمليات والاشتراكات الحية (Live Operational Alerts)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {alerts.length} alert{alerts.length === 1 ? "" : "s"}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            جميع المؤشرات طبيعية. لا توجد تنبيهات اشتراكات أو دفع معلقة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert) => {
              let borderCol = "border-slate-800";
              let bgCol = "bg-slate-900/80";
              let textCol = "text-slate-300";

              if (alert.severity === "danger") {
                borderCol = "border-rose-800/60";
                bgCol = "bg-rose-950/20";
                textCol = "text-rose-300";
              } else if (alert.severity === "warning") {
                borderCol = "border-amber-800/60";
                bgCol = "bg-amber-950/20";
                textCol = "text-amber-300";
              } else if (alert.severity === "success") {
                borderCol = "border-emerald-800/60";
                bgCol = "bg-emerald-950/20";
                textCol = "text-emerald-300";
              } else if (alert.severity === "info") {
                borderCol = "border-indigo-800/60";
                bgCol = "bg-indigo-950/20";
                textCol = "text-indigo-300";
              }

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${borderCol} ${bgCol} flex flex-col justify-between`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${textCol}`}>{alert.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-slate-400">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleTimeString("fr-DZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {alert.type === "PENDING_PAYMENT" && (
                      <Link
                        href="/ops/finance"
                        className="text-indigo-400 hover:text-indigo-300 underline"
                      >
                        معاينة الطلبات
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Canonical Plans Control Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">الخطط المعتمَدة في النظام (Two Plans Only)</h2>
          <p className="text-xs text-slate-400">
            خطتان فقط مسموح بهما: اشتراك الموسم الكامل والاشتراك الشهري. لا توجد أسعار ثابتة في الكود البرمجي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isSeason = plan.id === "season";
            const currentPrice = editPrices[plan.id] !== undefined ? editPrices[plan.id] : plan.price_dzd;
            const currentDuration = editDurations[plan.id] !== undefined ? editDurations[plan.id] : plan.duration_months;
            const isSaving = savingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative shadow-lg"
              >
                <div>
                  {/* Card Header & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800">
                          {plan.id}
                        </span>
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {isSeason
                          ? "Pass Saison BAC — وصول غير محدود لجميع الدروس والتمارين حتى البكالوريا"
                          : "Pass Mensuel — اشتراك شهري قابل للتجديد دورياً"}
                      </p>
                    </div>

                    <div>
                      {plan.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          مفتوح للشراء
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                          مغلق حالياً
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Manual Parameters Editing */}
                  <div className="space-y-4 my-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Price Control */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          السعر بالدينار (DZD)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={currentPrice}
                            onChange={(e) =>
                              setEditPrices({ ...editPrices, [plan.id]: Number(e.target.value) })
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute left-3 top-2.5 text-xs text-slate-500 pointer-events-none">
                            د.ج
                          </span>
                        </div>
                      </div>

                      {/* Duration Control */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          مدة الصلاحية (أشهر)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="36"
                            value={currentDuration}
                            onChange={(e) =>
                              setEditDurations({
                                ...editDurations,
                                [plan.id]: Number(e.target.value),
                              })
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute left-3 top-2.5 text-xs text-slate-500 pointer-events-none">
                            شهر
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                      <span>آخر تحديث:</span>
                      <span className="font-mono text-slate-300">
                        {new Date(plan.updated_at || Date.now()).toLocaleString("fr-DZ")}
                      </span>
                    </div>
                  </div>

                  {/* Closure Invariant Note */}
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs leading-relaxed mb-6">
                    <p className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>ضمان الاستمرارية:</strong> إغلاق هذه الخطة يمنع طلبات الشراء الجديدة فوراً، لكنه
                        <strong> لا يُلغي</strong> اشتراكات الطلاب الذين يمتلكون هذه الخطة مسبقاً وتستمر صلاحيتهم حتى موعدها المحدد.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleUpdatePlan(plan.id)}
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    حفظ التعديلات [ حفظ ]
                  </button>

                  {plan.active ? (
                    <button
                      onClick={() => handleUpdatePlan(plan.id, { active: false })}
                      disabled={isSaving}
                      className="border border-rose-800 hover:bg-rose-950/50 text-rose-300 text-xs font-semibold py-2.5 px-4 rounded-lg transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      إغلاق الاشتراك [ إغلاق ]
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdatePlan(plan.id, { active: true })}
                      disabled={isSaving}
                      className="border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold py-2.5 px-4 rounded-lg transition flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      فتح الاشتراك [ فتح ]
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-link to Students & Finance */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">التمديد اليدوي لاشتراكات الطلاب (Manual Extension)</h4>
            <p className="text-xs text-slate-400">
              لتمديد اشتراك طالب معين مجاناً أو استثنائياً (+ شهر، + أسبوع، أو مخصص)، انتقل إلى ملف الطالب في مركز العمليات.
            </p>
          </div>
        </div>

        <Link
          href="/ops/students"
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 shrink-0"
        >
          الانتقال إلى سجل الطلاب &larr;
        </Link>
      </div>
    </div>
  );
}
