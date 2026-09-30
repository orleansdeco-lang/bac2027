"use client";

import React from "react";
import { TrackingTimelineStep } from "@/lib/orders/tracking";
import {
  Check,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle2,
  Package,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface OrderTimelineProps {
  timeline: TrackingTimelineStep[];
}

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-theme pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-theme-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--color-primary)]" />
            <span>مسار ومراحل الطلب (8 خطوات)</span>
          </h3>
          <p className="text-xs text-theme-muted mt-0.5">
            تتبع مباشر من التسجيل حتى استلام الطرد وتفعيل الاشتراك
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-theme-muted">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>مكتمل (✓)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            <span>قيد التنفيذ (●)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-slate-500 inline-block" />
            <span>قادم (○)</span>
          </span>
        </div>
      </div>

      {/* Stepper Timeline List */}
      <div className="relative pr-2 sm:pr-4 space-y-0">
        {timeline.map((step, idx) => {
          const isLast = idx === timeline.length - 1;
          const isCompleted = step.state === "completed";
          const isCurrent = step.state === "current";
          const isFailed = step.state === "failed";
          const isPending = step.state === "pending";

          return (
            <div key={step.id} className="relative flex items-start gap-4 pb-8 last:pb-2 group">
              {/* Vertical Connecting Line */}
              {!isLast && (
                <div
                  className={`absolute right-4 top-8 -bottom-1 w-0.5 -translate-x-1/2 transition-colors ${
                    isCompleted
                      ? "bg-emerald-500"
                      : isCurrent
                      ? "bg-gradient-to-b from-amber-400 to-slate-700"
                      : "bg-slate-700/50 dark:bg-slate-800"
                  }`}
                />
              )}

              {/* Step Circle / Badge */}
              <div className="relative shrink-0 z-10">
                {isCompleted && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shadow-md shadow-emerald-500/20 text-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {isCurrent && (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-10 h-10 rounded-full bg-amber-400/20 animate-ping" />
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-400/30 text-base ring-4 ring-amber-400/20">
                      ●
                    </div>
                  </div>
                )}

                {isPending && (
                  <div className="w-8 h-8 rounded-full border-2 border-slate-600 bg-card text-slate-500 flex items-center justify-center text-sm font-bold">
                    ○
                  </div>
                )}

                {isFailed && (
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-black flex items-center justify-center shadow-md shadow-rose-500/20 text-sm">
                    ✕
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-0.5 space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm sm:text-base font-bold transition-colors ${
                        isCompleted
                          ? "text-theme-text font-black"
                          : isCurrent
                          ? "text-amber-500 dark:text-amber-400 font-black"
                          : isFailed
                          ? "text-rose-500 font-bold"
                          : "text-theme-muted"
                      }`}
                    >
                      <span>{step.title}</span>
                    </h4>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black animate-pulse">
                        الخطوة الحالية
                      </span>
                    )}

                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        تمت بنجاح
                      </span>
                    )}
                  </div>

                  {/* Step Timestamp if present */}
                  {step.formatted_timestamp && (
                    <span className="text-[11px] text-theme-muted flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{step.formatted_timestamp}</span>
                    </span>
                  )}
                </div>

                {/* Step Description Card */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed transition-all ${
                    isCurrent
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 font-medium"
                      : isCompleted
                      ? "bg-card-muted/40 border border-theme/60 text-theme-secondary"
                      : isFailed
                      ? "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300"
                      : "text-theme-muted"
                  }`}
                >
                  <p>{step.description}</p>

                  {/* Extra Carrier Details on "تم الشحن" step */}
                  {step.id === "order_shipped" && (step.carrier || step.tracking_number) && (
                    <div className="mt-2.5 pt-2 border-t border-theme/60 flex flex-wrap items-center gap-2 text-[11px]">
                      {step.carrier && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-theme text-theme-text font-bold">
                          <Truck className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{step.carrier}</span>
                        </span>
                      )}

                      {step.tracking_number && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-theme font-mono text-theme-text font-bold">
                          <span>رقم التتبع:</span>
                          <strong className="text-[var(--color-primary)]">{step.tracking_number}</strong>
                        </span>
                      )}

                      {step.tracking_url && (
                        <a
                          href={step.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                        >
                          <span>تتبع الشحنة مع الناقل</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
